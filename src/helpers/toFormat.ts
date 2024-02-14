import * as xml2js from 'xml2js';
import * as css from 'css';
import { IColumnFormat, IFormatElement } from '../models';
import { svgCircleToPathD, svgEllipseToPathD, svgLineToPathD, svgPolyToPathD, svgRectToPathD } from './svgTransforms';

const validElmTypes = ['div', 'button', 'span', 'a', 'img', 'svg', 'path', 'filepreview', 'p'];
const svgShapesToPath = ['rect', 'circle', 'ellipse', 'line', 'polygon', 'polyline'];
const elmsToSwapToDivs = ['body','h1'];
const transformableElmTypes = [...svgShapesToPath, ...elmsToSwapToDivs];
const validAttributes = ['href', 'src', 'class', 'id', 'target', 'role', 'd', 'iconName', 'rel', 'title', 'alt', 'dataInterception', 'viewBox', 'preserveAspectRatio', 'draggable'];
const validStyles = ['background-color', 'fill', 'background-image', 'border', 'border-bottom', 'border-bottom-color', 'border-bottom-style', 'border-bottom-width', 'border-color', 'border-left', 'border-left-color', 'border-left-style', 'border-left-width', 'border-right', 'border-right-color', 'border-right-style', 'border-right-width', 'border-style', 'border-top', 'border-top-color', 'border-top-style', 'border-top-width', 'border-width', 'outline', 'outline-color', 'outline-style', 'outline-width', 'border-bottom-left-radius', 'border-bottom-right-radius', 'border-radius', 'border-top-left-radius', 'border-top-right-radius', 'box-decoration-break', 'box-shadow', 'box-sizing', 'overflow-x', 'overflow-y', 'overflow-style', 'rotation', 'rotation-point', 'opacity', 'cursor', 'height', 'max-height', 'max-width', 'min-height', 'min-width', 'width', 'flex-grow', 'flex-shrink', 'flex-flow', 'flex-direction', 'flex-wrap', 'flex-basis', 'flex', 'justify-content', 'align-items', 'align-self', 'box-align', 'box-direction', 'box-flex', 'box-flex-group', 'box-lines', 'box-ordinal-group', 'box-orient', 'box-pack', 'font', 'font-family', 'font-size', 'font-style', 'font-variant', 'font-weight', 'font-size-adjust', 'font-stretch', 'grid-columns', 'grid-rows', 'margin', 'margin-bottom', 'margin-left', 'margin-right', 'margin-top', 'column-count', 'column-fill', 'column-gap', 'column-rule', 'column-rule-color', 'column-rule-style', 'column-rule-width', 'column-span', 'column-width', 'columns', 'padding', 'padding-bottom', 'padding-left', 'padding-right', 'padding-top', 'bottom', 'clear', 'clip', 'display', 'float', 'left', 'overflow', 'position', 'right', 'top', 'visibility', 'z-index', 'border-collapse', 'border-spacing', 'caption-side', 'empty-cells', 'table-layout', 'color', 'direction', 'letter-spacing', 'line-height', 'text-align', 'text-decoration', 'text-indent', 'text-transform', 'unicode-bidi', 'vertical-align', 'white-space', 'word-spacing', 'hanging-punctuation', 'punctuation-trim', 'text-align-last', 'text-justify', 'text-outline', 'text-shadow', 'text-wrap', 'word-break', 'word-wrap', 'text-overflow', '--inline-editor-border-width', '--inline-editor-border-style', '--inline-editor-border-radius', '--inline-editor-border-color', 'stroke', 'fill-opacity', '-webkit-line-clamp', 'object-fit', 'transform'];
const collapsibleElmTypes = ['g','html'];

// The actual naming of these values is determined by the parser configuration key values
declare interface IMappedNode {
    attributes?: any;
    children?: any;
    text?: string;
}

const styleElementProcessor = (value: any, name: string): any => {
    if (name === 'style') {
        const styles = css.parse(value);
        return JSON.stringify(styles); //To be rehydrated later
    }
    return value;
};

const XMLToSPFormat = async (xmlText: string): Promise<{format:string;warnings:string[]}> => {
    const parser = new xml2js.Parser({
        normalizeTags: true,        // Normalize all tag names to lowercase.
        explicitChildren: true,     // Put child elements to separate property
        explicitCharkey: true,      // Ensures there's always a char key even if no text content
        attrkey: 'attributes',      // Key in the result for the attributes (needs to match IMappedNode)
        childkey: 'children',       // Key in the result for the children (needs to match IMappedNode)
        charkey: 'text',            // Key in the result text content (needs to match IMappedNode)
        valueProcessors: [styleElementProcessor],
    });
    const cleanedXML = xmlText
        .trim()
        .replace(/<style>([\s\S]*?)<\/style>/g, '<style><![CDATA[$1]]></style>'); //Wrap style content in CDATA to prevent breaking the parser
    let xmlObject;
    if(cleanedXML.startsWith('<!DOCTYPE ')) {
        //You got a DOCTYPE, so we're assuming it's a full XML doc with a root element
        const rawObject = await parser.parseStringPromise(cleanedXML);
        xmlObject = rawObject[Object.keys(rawObject)[0]]; //Point to that first element
    } else {
        //Assume it could be any XML including a snippet without root elements, so we wrap it then unwrap it
        xmlObject = (await parser.parseStringPromise(`<jsonify>${cleanedXML}</jsonify>`)).jsonify;
    }
    const columnFormat = columnFormatFromXML(xmlObject);
    const warnings: string[] = []; //TODO: Bubble up warnings for things like unsupported elements like <text>
    return {
        format: JSON.stringify(columnFormat, null, 2),
        warnings,
    };
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
    });
    return childElements;
};

const transformElement = (elmType: string, node: IMappedNode): IFormatElement[] | undefined => {

    //SVG Shapes to Path
    if (svgShapesToPath.includes(elmType)) {
        const path = processElementNode('path', node);
        if (typeof path !== 'undefined' && path.length > 0) {
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

    //HTML Element Swapping
    if (elmsToSwapToDivs.includes(elmType)) {
        const div = processElementNode('div', node);
        if (div && div.length > 0) {
            return div;
        }
    }
};

const processElementNode = (elmType: string, node: IMappedNode): IFormatElement[] | undefined => {
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
    } else if (node.text && node.text.length > 0) {
        // We prioritize children over text, so if we have both, we ignore the text
        // TODO: Warn about ignored text
        element.txtContent = node.text;
    }

    return [element];
};

const columnFormatFromXML = (xmlObject: IMappedNode): IColumnFormat | undefined => {
    const childCount = xmlObject.children ? Object.keys(xmlObject.children).length : 0;
    if (childCount > 1) {
        //More than one child, so we'll need to put them in a wrapper element
        const extractedElements = processChildren(xmlObject.children);
        const columnFormat: IColumnFormat = {
            "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
            "elmType": "div",
            "children": extractedElements,
        };
        return columnFormat;
    } else if (childCount === 1) {
        const extractedElements = processChildren(xmlObject.children);
        if (extractedElements && extractedElements.length >= 1) {
            const columnFormat: IColumnFormat = {
                "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
                ...extractedElements[0]
            };
            return columnFormat;
        }
    } else if (xmlObject.text && xmlObject.text.length > 0) {
        const columnFormat: IColumnFormat = {
            "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
            "elmType": "div",
            "txtContent": xmlObject.text,
        };
        return columnFormat;
    }
};

export default XMLToSPFormat;