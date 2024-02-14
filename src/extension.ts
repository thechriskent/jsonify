import * as vscode from 'vscode';
import XMLToSPFormat from './helpers/toFormat';

export function activate(context: vscode.ExtensionContext) {

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
		let json: string ='';
		try {
			const result = await XMLToSPFormat(content);
			json = result.format;
		} catch (error) {
			if(typeof textEditor === 'undefined'){
				vscode.window.showErrorMessage('Unable to covert to SP format 😢: ' + error);
			}// else swallow the error and keep the current editor content
		}
		try {
			if(typeof json !== "undefined" && json.length > 0) {
				if (typeof textEditor === 'undefined') {
					// Create a new editor with the formatted JSON
					try {
						return await newEditorWithContent(json);
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
						editBuilder.replace(fullRange, json);
					});
					return editor;
				}
			} else {
				vscode.window.showErrorMessage('Unable to format the content 😢');
			}
		}
		catch (error) {
			vscode.window.showErrorMessage('Unable to create/access editor: ' + error);
		}
	}

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
		console.log('Closed editor: ' + closedEditorId);
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
	}

	const comReg_toFormat_Editor = vscode.commands.registerTextEditorCommand('jsonify.toFormat_Editor', async (textEditor: vscode.TextEditor) => {
		if (textEditor.document.languageId === 'svg' || textEditor.document.languageId === 'html'
			|| textEditor.document.fileName.match(/\.(svg|htm|html)$/i)){
			mapFormatEditorWindow(textEditor.document.uri.toString(), textEditor.document.getText());
		} else {
			vscode.window.showErrorMessage('This command only works with SVG and HTML files');
		}
	});

	//Register the commands for proper disposal
	context.subscriptions.push(comReg_toFormat_Explorer);
	context.subscriptions.push(comReg_toFormat_Editor);
	context.subscriptions.push(closeListener);
	context.subscriptions.push(changeListener);
}

export function deactivate() {}