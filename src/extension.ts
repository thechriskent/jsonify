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
		const json = await XMLToSPFormat(content);
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
			const editor = await vscode.window.showTextDocument(textEditor.document, vscode.ViewColumn.Beside);
			await editor.edit((editBuilder) => {
				const firstLine = editor.document.lineAt(0);
				const lastLine = editor.document.lineAt(editor.document.lineCount - 1);
				const fullRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
				editBuilder.replace(fullRange, json);
			});
			return editor;
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
	const editorMap: { [key: string]: vscode.TextEditor } = {};
	const comReg_toFormat_Editor = vscode.commands.registerTextEditorCommand('jsonify.toFormat_Editor', async (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
		if (textEditor.document.languageId === 'svg' || textEditor.document.languageId === 'html') {
			const editorId = textEditor.document.uri.toString();
			let shouldCreateNew = true;
			if (editorId in editorMap) {
				//Reusing a previous editor
				const editor = editorMap[editorId];
				if (typeof editor !== 'undefined' && !editor.document.isClosed) {
					shouldCreateNew = false;
					const maybeNewEditor = await toFormatFull(textEditor.document.getText(), editor);
					if (typeof maybeNewEditor !== 'undefined') {
						// save the potentially updated reference
						editorMap[editorId] = maybeNewEditor;
					}
				}
			}
			if (shouldCreateNew) {
				//New target editor
				const newEditor = await toFormatFull(textEditor.document.getText());
				if (typeof newEditor !== 'undefined') {
					editorMap[editorId] = newEditor;
				}
			}
		} else {
			vscode.window.showErrorMessage('This command only works with SVG and HTML files');
		}
	});

	//Register the commands for proper disposal
	context.subscriptions.push(comReg_toFormat_Explorer);
	context.subscriptions.push(comReg_toFormat_Editor);
}

export function deactivate() { }