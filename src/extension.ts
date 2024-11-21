import * as vscode from 'vscode';
import HTMLToSPFormat from './helpers/toFormat';
import ITransformResult, { transformResultMessageToString } from './models/ITransformResult';
import { getCompletions, isAddressSubPropCompletion, isCoordinatesSubPropCompletion, isMetatdataPropCompletion, isSubPropCompletion } from './helpers/Completions';

export function activate(context: vscode.ExtensionContext) {
	console.log('wowee! updated');

	const outputChannel = vscode.window.createOutputChannel('JSONify');

	/**
	 * Creates a new editor with the given content and language
	 * @param content the content to be displayed in the new editor
	 * @param language the language of the content (defaults to json)
	 * @returns The new Text Editor object
	 */
	const newEditorWithContent = async (content: string, language: string = 'json'): Promise<vscode.TextEditor> => {
		const doc = await vscode.workspace.openTextDocument({ content, language });
		return vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
	};

	/**
	 * Converts the given content to a JSON object and then formats it
	 * @param content the content to be formatted
	 * @param textEditor the text editor to be updated with the formatted content (if not supplied, a new editor will be created with the formatted content)
	 * @returns The updated Text Editor object
	 */
	const toFormatFull = async (content: string, textEditor?: vscode.TextEditor): Promise<vscode.TextEditor | undefined> => {
		let errorShown = false;
		let result: ITransformResult | undefined;
		try {
			result = await HTMLToSPFormat(content);
		} catch (error) {
			if(typeof textEditor === 'undefined'){
				vscode.window.showErrorMessage('Unable to covert to SP format 😢: ' + error);
			}// else swallow the error and keep the current editor content
		}
		try {
			if(typeof result !== "undefined" && typeof result.format !== "undefined" && result.format.length > 0) {
				outputChannel.clear();
				result?.messages.forEach((message) => {
					outputChannel.appendLine(transformResultMessageToString(message));
				});
				if (typeof textEditor === 'undefined') {
					// Create a new editor with the formatted JSON
					try {
						return await newEditorWithContent(result.format);
					} catch (error) {
						vscode.window.showErrorMessage('Unable to create a new editor with the JSON 😟: ' + error);
						throw error;
					};
				} else {
					// Resuse the given editor			
					const editor = await vscode.window.showTextDocument(textEditor.document, vscode.ViewColumn.Beside, true);
					await editor.edit((editBuilder) => {
						const firstLine = editor.document.lineAt(0);
						const lastLine = editor.document.lineAt(editor.document.lineCount - 1);
						const fullRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
						editBuilder.replace(fullRange, result?.format || '');
					});
					return editor;
				}
			} else {
				if(!errorShown){
					vscode.window.showErrorMessage('Unable to format the content 😢');
				}
			}
		}
		catch (error) {
			vscode.window.showErrorMessage('Unable to create/access editor: ' + error);
		}
	};

	// FILE EXPLORER CONTEXT MENU
	// Always creates a new editor with the formatted content
	const comReg_toFormat_Explorer = vscode.commands.registerCommand('jsonify.toFormat_Explorer', async (uri: vscode.Uri, args: any) => {
		// Executed from the Explorer
		const document = await vscode.workspace.openTextDocument(uri);
		await toFormatFull(document.getText());
	});


	// TEXT EDITOR CONTEXT MENU
	// Resues editor windows with the formatted content when possible (1 per file)
	const editorMap: { [key: string]: {editor: vscode.TextEditor, live: boolean }} = {};
	const closeListener = vscode.workspace.onDidCloseTextDocument((doc) => {
		const closedEditorId = doc.uri.toString();
		//console.log('Closed editor: ' + closedEditorId);
		if(closedEditorId in editorMap){
			//This was a source editor, so remove it from the list
			delete editorMap[closedEditorId];
		} else {
			//Cleanup closed target editors
			const sourceEditorIds: string[] = [];
			Object.keys(editorMap).forEach((key) => {
				const targetEditorid = editorMap[key].editor.document.uri.toString();
				if(closedEditorId === targetEditorid){
					sourceEditorIds.push(key);
				}
			});
			sourceEditorIds.forEach((key) => {
				delete editorMap[key];
			});
		
		}
	});

	const changeListener: vscode.Disposable = vscode.workspace.onDidChangeTextDocument((event) => {
		const sourceEditorId = event.document.uri.toString();
		if(sourceEditorId in editorMap){
			if(editorMap[sourceEditorId].live){
				mapFormatEditorWindow(sourceEditorId, event.document.getText());
			}
		}
	});

	const mapFormatEditorWindow = async (sourceEditorId: string, content: string): Promise<void> => {
		let shouldCreateNew = true;
		if (sourceEditorId in editorMap) {
			//Reusing a previous editor
			const targetEditorEntry = editorMap[sourceEditorId];
			const targetEditor = targetEditorEntry.editor;
			if (typeof targetEditor !== 'undefined' && !targetEditor.document.isClosed) {
				shouldCreateNew = false;
				const newEditor = await toFormatFull(content, targetEditor);
				if (typeof newEditor !== 'undefined') {
					// save the potentially updated reference
					editorMap[sourceEditorId] = {editor: newEditor, live: targetEditorEntry.live};
				}
			}
		}
		if (shouldCreateNew) {
			//New target editor
			const newEditor = await toFormatFull(content);
			if (typeof newEditor !== 'undefined') {
				editorMap[sourceEditorId] = {
					editor: newEditor,
					live: vscode.workspace.getConfiguration('jsonify').get('liveUpdates', true),
				};
			}
		}
	};

	const comReg_toFormat_Editor = vscode.commands.registerTextEditorCommand('jsonify.toFormat_Editor', async (textEditor: vscode.TextEditor) => {
		if (textEditor.document.languageId === 'svg' || textEditor.document.languageId === 'html'
			|| textEditor.document.fileName.match(/\.(svg|htm|html)$/i)){
			mapFormatEditorWindow(textEditor.document.uri.toString(), textEditor.document.getText());
		} else {
			vscode.window.showErrorMessage('This command only works with SVG and HTML files');
		}
	});


	// const virtualDocumentContents = new Map<string, string>();
	// vscode.workspace.regis

	// We can trigger suggestions (same as CTRL+Space)
	// But we can't specify the trigger character, so we track when we call it
	// This lets us respond to '.' triggers as well as auto triggering middle prop completions
	// ie we can have @currentField. and when we pick Address, it will auto trigger the next level
	//   but we can also have @currentField.Address and when we type '.' it will trigger the next level
	let commandTriggeredCompletion = false;
	const comReg_TriggerCompletion = vscode.commands.registerCommand('jsonify.triggerCompletion', async () => {
		commandTriggeredCompletion = true;
		vscode.commands.executeCommand('editor.action.triggerSuggest');
	});

	/**
	 * Routes trigger completions (CTRL+Space) to the proper completion provider
	 */
	const completionItemDefaultProvider = vscode.languages.registerCompletionItemProvider(
		[
			{ language: 'horsescript' },
			{ language: 'json', scheme: 'file' }, // Ensure it works within JSON files
            { language: 'json', scheme: 'untitled' } // Ensure it works within untitled JSON files
		],
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
				commandTriggeredCompletion = false;
				return getCompletions(document, position, token, context);
			}
		}
	);

	/**
	 * Routes '.' triggers to the proper completion provider
	 */
	const completionItemTriggerProvider = vscode.languages.registerCompletionItemProvider(
		[
			{ language: 'horsescript' },
			{ language: 'json', scheme: 'file' }, // Ensure it works within JSON files
            { language: 'json', scheme: 'untitled' } // Ensure it works within untitled JSON files
		],
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
				const linePrefix = document.lineAt(position).text.substring(0, position.character);
				if (linePrefix.endsWith('.') && 
					(isSubPropCompletion(linePrefix)
						|| (isMetatdataPropCompletion(linePrefix) && !commandTriggeredCompletion)
						|| (isAddressSubPropCompletion(linePrefix) && !commandTriggeredCompletion)
						|| (isCoordinatesSubPropCompletion(linePrefix) && !commandTriggeredCompletion))) {
					// Triggered by a '.' character and not by a command
					return getCompletions(document, position, token, context);
				}
			}
		},
		'.' // Trigger on '.' only
	);


	//Register the commands for proper disposal
	context.subscriptions.push(comReg_toFormat_Explorer);
	context.subscriptions.push(comReg_toFormat_Editor);
	context.subscriptions.push(closeListener);
	context.subscriptions.push(changeListener);
	context.subscriptions.push(outputChannel);

	context.subscriptions.push(comReg_TriggerCompletion);
	context.subscriptions.push(completionItemDefaultProvider);
	context.subscriptions.push(completionItemTriggerProvider);
}

export function deactivate() {}