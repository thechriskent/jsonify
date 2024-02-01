import * as vscode from 'vscode';
import * as xml2js from 'xml2js';
import { stripPrefix } from 'xml2js/lib/processors';
import { IColumnFormat, IFormatElement } from './models';
import { svgCircleToPathD, svgEllipseToPathD, svgLineToPathD, svgPolyToPathD, svgRectToPathD } from './helpers/svgTransforms';

export function activate(context: vscode.ExtensionContext) {

	const validElmTypes = ['div', 'button', 'span', 'a', 'img', 'svg', 'path', 'filepreview', 'p'];
	const svgShapesToPath = ['rect', 'circle', 'ellipse', 'line', 'polygon', 'polyline']
	const transformableElmTypes = [...svgShapesToPath];
	const validAttributes = ['href', 'src', 'class', 'id', 'target', 'role', 'd', 'iconName', 'rel', 'title', 'alt', 'dataInterception', 'viewBox', 'preserveAspectRatio', 'draggable'];
	const validStyles = ['background-color', 'fill', 'background-image', 'border', 'border-bottom', 'border-bottom-color', 'border-bottom-style', 'border-bottom-width', 'border-color', 'border-left', 'border-left-color', 'border-left-style', 'border-left-width', 'border-right', 'border-right-color', 'border-right-style', 'border-right-width', 'border-style', 'border-top', 'border-top-color', 'border-top-style', 'border-top-width', 'border-width', 'outline', 'outline-color', 'outline-style', 'outline-width', 'border-bottom-left-radius', 'border-bottom-right-radius', 'border-radius', 'border-top-left-radius', 'border-top-right-radius', 'box-decoration-break', 'box-shadow', 'box-sizing', 'overflow-x', 'overflow-y', 'overflow-style', 'rotation', 'rotation-point', 'opacity', 'cursor', 'height', 'max-height', 'max-width', 'min-height', 'min-width', 'width', 'flex-grow', 'flex-shrink', 'flex-flow', 'flex-direction', 'flex-wrap', 'flex-basis', 'flex', 'justify-content', 'align-items', 'align-self', 'box-align', 'box-direction', 'box-flex', 'box-flex-group', 'box-lines', 'box-ordinal-group', 'box-orient', 'box-pack', 'font', 'font-family', 'font-size', 'font-style', 'font-variant', 'font-weight', 'font-size-adjust', 'font-stretch', 'grid-columns', 'grid-rows', 'margin', 'margin-bottom', 'margin-left', 'margin-right', 'margin-top', 'column-count', 'column-fill', 'column-gap', 'column-rule', 'column-rule-color', 'column-rule-style', 'column-rule-width', 'column-span', 'column-width', 'columns', 'padding', 'padding-bottom', 'padding-left', 'padding-right', 'padding-top', 'bottom', 'clear', 'clip', 'display', 'float', 'left', 'overflow', 'position', 'right', 'top', 'visibility', 'z-index', 'border-collapse', 'border-spacing', 'caption-side', 'empty-cells', 'table-layout', 'color', 'direction', 'letter-spacing', 'line-height', 'text-align', 'text-decoration', 'text-indent', 'text-transform', 'unicode-bidi', 'vertical-align', 'white-space', 'word-spacing', 'hanging-punctuation', 'punctuation-trim', 'text-align-last', 'text-justify', 'text-outline', 'text-shadow', 'text-wrap', 'word-break', 'word-wrap', 'text-overflow', '--inline-editor-border-width', '--inline-editor-border-style', '--inline-editor-border-radius', '--inline-editor-border-color', 'stroke', 'fill-opacity', '-webkit-line-clamp', 'object-fit', 'transform']
	const collapsibleElmTypes = ['g'];

	const textToXML = async (xmlText: string): Promise<any> => {
		const parser = new xml2js.Parser({
			normalizeTags: true,
			explicitChildren: true,
			attrkey: 'attributes',
			childkey: 'children',
		});
		const xmlObject = await parser.parseStringPromise(xmlText);
		const columnFormat = columnFormatFromXML(xmlObject);
		return JSON.stringify(columnFormat, null, 2);
	};

	const processChildren = (children: any): IFormatElement[] => {
		const childElements: IFormatElement[] = [];
		Object.keys(children).forEach((elmType: string) => {
				children[elmType].forEach((n: { attributes?: any; children?: any; }) => {
					const elements = processElementNode(elmType, n);
					if (elements && elements.length) {
						childElements.push(...elements);
					}
				});
			// const elements = processElementNode(elmType, children[elmType][0]);
			// if (elements && elements.length) {
			// 	childElements.push(...elements);
			// }
		});
		return childElements;
	}

	const transformElement = (elmType: string, node: { attributes?: any, children?: any }): IFormatElement[] | undefined => {
		if (svgShapesToPath.includes(elmType)) {
			const path = processElementNode('path', node);
			if (typeof path != 'undefined' && path.length > 0) {
				let d: string = '';
				switch (elmType) {
					case 'rect':
						d = svgRectToPathD(node.attributes.x, node.attributes.y, node.attributes.width, node.attributes.height, node.attributes.rx, node.attributes.ry);
						//excess style cleanup
						delete path[0].style.width;
						delete path[0].style.height;
						if (Object.keys(path[0].style).length === 0) {
							delete path[0].style;
						}
						break;
					case 'circle':
						d = svgCircleToPathD(node.attributes.cx, node.attributes.cy, node.attributes.r);
						break;
					case 'ellipse':
						d = svgEllipseToPathD(node.attributes.cx, node.attributes.cy, node.attributes.rx, node.attributes.ry);
						break;
					case 'line':
						d = svgLineToPathD(node.attributes.x1, node.attributes.y1, node.attributes.x2, node.attributes.y2);
						break;
					case 'polygon':
						d = svgPolyToPathD(node.attributes.points, true);
						break;
					case 'polyline':
						d = svgPolyToPathD(node.attributes.points, false);
						break;
					default:
						d = '';
				}
				if (d.length) {
					path[0].attributes = path[0].attributes || {};
					path[0].attributes.d = d;
					return path;
				}
			}
		}
	};

	const processElementNode = (elmType: string, node: { attributes?: any, children?: any }): IFormatElement[] | undefined => {
		if (!validElmTypes.includes(elmType)) {
			if (transformableElmTypes.includes(elmType)) {
				return transformElement(elmType, node);
			}
			if (node.children) {
				const orphans = processChildren(node.children);
				if (orphans.length > 0) {
					if (collapsibleElmTypes.includes(elmType)) {
						return orphans;
					}
					//TODO: swap logic here for like to like elements?
				}
			}
			return undefined;
		}

		const element: IFormatElement = {
			elmType,
		};
		if (node.attributes) {
			Object.keys(node.attributes).forEach((attr: string) => {
				if (validAttributes.includes(attr) || attr.startsWith('aria-')) {
					//Named attribute, so just map it over
					//TODO: Flag unknown classes (setting to ignore/warn?)
					element.attributes = element.attributes || {};
					element.attributes[attr as keyof typeof element.attributes] = node.attributes[attr];
				} else if (validStyles.includes(attr)) {
					//Presentation attributes need to be mapped to the style object
					element.style = element.style || {};
					element.style[attr] = node.attributes[attr];
				} else if (attr === 'style') {
					//Split apart the styles and map them to the style object
					const styles = node.attributes[attr].split(';');
					styles.forEach((style: string) => {
						const [key, value] = style.split(':');
						if (validStyles.includes(key)) {
							//TODO: Deal with values with paranthesis that don't match silly rules
							element.style = element.style || {};
							element.style[key] = value;
						}
					});
				}
			});
		}

		if (node.children) {
			const kids = processChildren(node.children);
			if (kids.length > 0) {
				element.children = kids;
			}
		}

		return [element];
	};

	const columnFormatFromXML = (xmlObject: any): IColumnFormat | undefined => {
		const elmType = Object.keys(xmlObject)[0] || 'unknown';
		const extractedElement = processElementNode(elmType, xmlObject[elmType]);
		if (extractedElement && extractedElement.length >= 1) {
			const columnFormat: IColumnFormat = {
				"$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-format.schema.json",
				...extractedElement[0]
			};
			return columnFormat;
		}
	};

	/**
	 * Creates a new editor with the given content and language
	 * @param content the content to be displayed in the new editor
	 * @param language the language of the content (defaults to json)
	 * @returns The new Text Editor object
	 */
	const newEditorWithContent = async (content: string, language: string = 'json'): Promise<vscode.TextEditor> => {
		const doc = await vscode.workspace.openTextDocument({ content, language });
		return vscode.window.showTextDocument(doc);
	};

	const toFormatFull = async (content: string): Promise<void> => {
		const json = await textToXML(content);
		newEditorWithContent(json)
			.catch((error) => {
				vscode.window.showErrorMessage('Unable to create a new editor with the JSON 😟: ' + error);
			});
	}


	let disposable = vscode.commands.registerCommand('jsonify.toFormatFull_Explorer', async (uri: vscode.Uri) => {
		// Executed from the Explorer
		const document = await vscode.workspace.openTextDocument(uri);
		toFormatFull(document.getText());

	});

	const disposable2 = vscode.commands.registerTextEditorCommand('jsonify.toFormatFull_Editor', async (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
		if (textEditor.document.languageId === 'svg' || textEditor.document.languageId === 'html') {
			toFormatFull(textEditor.document.getText());
		} else {
			vscode.window.showErrorMessage('This command only works with SVG and HTML files');
		}
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
}

// This method is called when your extension is deactivated
export function deactivate() { }
