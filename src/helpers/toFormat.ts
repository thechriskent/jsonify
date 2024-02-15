import { HTMLElement, Node, NodeType, parse } from 'node-html-parser';
import { IColumnFormat, IFormatElement } from '../models';
import { svgCircleToPathD, svgEllipseToPathD, svgLineToPathD, svgPolyToPathD, svgRectToPathD } from './svgTransforms';
import { inspect } from 'util';

const validElmTypes = ['div', 'button', 'span', 'a', 'img', 'svg', 'path', 'filepreview', 'p'];
const svgShapesToPath = ['rect', 'circle', 'ellipse', 'line', 'polygon', 'polyline'];
const elmsToSwapToDivs = ['body','h1'];
const elmsToSwapToSpans = ['b', 'strong', 'i', 'em'];
const transformableElmTypes = [...svgShapesToPath, ...elmsToSwapToDivs, ...elmsToSwapToSpans];
const validAttributes = ['href', 'src', 'class', 'id', 'target', 'role', 'd', 'iconName', 'rel', 'title', 'alt', 'dataInterception', 'viewBox', 'preserveAspectRatio', 'draggable'];
const validStyles = ['background-color', 'fill', 'background-image', 'border', 'border-bottom', 'border-bottom-color', 'border-bottom-style', 'border-bottom-width', 'border-color', 'border-left', 'border-left-color', 'border-left-style', 'border-left-width', 'border-right', 'border-right-color', 'border-right-style', 'border-right-width', 'border-style', 'border-top', 'border-top-color', 'border-top-style', 'border-top-width', 'border-width', 'outline', 'outline-color', 'outline-style', 'outline-width', 'border-bottom-left-radius', 'border-bottom-right-radius', 'border-radius', 'border-top-left-radius', 'border-top-right-radius', 'box-decoration-break', 'box-shadow', 'box-sizing', 'overflow-x', 'overflow-y', 'overflow-style', 'rotation', 'rotation-point', 'opacity', 'cursor', 'height', 'max-height', 'max-width', 'min-height', 'min-width', 'width', 'flex-grow', 'flex-shrink', 'flex-flow', 'flex-direction', 'flex-wrap', 'flex-basis', 'flex', 'justify-content', 'align-items', 'align-self', 'box-align', 'box-direction', 'box-flex', 'box-flex-group', 'box-lines', 'box-ordinal-group', 'box-orient', 'box-pack', 'font', 'font-family', 'font-size', 'font-style', 'font-variant', 'font-weight', 'font-size-adjust', 'font-stretch', 'grid-columns', 'grid-rows', 'margin', 'margin-bottom', 'margin-left', 'margin-right', 'margin-top', 'column-count', 'column-fill', 'column-gap', 'column-rule', 'column-rule-color', 'column-rule-style', 'column-rule-width', 'column-span', 'column-width', 'columns', 'padding', 'padding-bottom', 'padding-left', 'padding-right', 'padding-top', 'bottom', 'clear', 'clip', 'display', 'float', 'left', 'overflow', 'position', 'right', 'top', 'visibility', 'z-index', 'border-collapse', 'border-spacing', 'caption-side', 'empty-cells', 'table-layout', 'color', 'direction', 'letter-spacing', 'line-height', 'text-align', 'text-decoration', 'text-indent', 'text-transform', 'unicode-bidi', 'vertical-align', 'white-space', 'word-spacing', 'hanging-punctuation', 'punctuation-trim', 'text-align-last', 'text-justify', 'text-outline', 'text-shadow', 'text-wrap', 'word-break', 'word-wrap', 'text-overflow', '--inline-editor-border-width', '--inline-editor-border-style', '--inline-editor-border-radius', '--inline-editor-border-color', 'stroke', 'fill-opacity', '-webkit-line-clamp', 'object-fit', 'transform'];
const collapsibleElmTypes = ['','g','html'];

const validPropertiesInOrder = ['$schema', 'elmType', 'txtContent', 'attributes', ...validAttributes, 'style', ...validStyles, 'children'];

const HTMLToSPFormat = (htmlText: string): {format:string;warnings:string[]} => {
    const root = parse(htmlText);
    root.removeWhitespace(); //Get rid of any whitespace nodes left over from formatted HTML
    console.log(root);
    const columnFormat = formatFixUp(columnFormatFromHTML(root));
    const warnings: string[] = []; //TODO: Bubble up warnings for things like unsupported elements like <text>
    return {
        format: JSON.stringify(columnFormat, validPropertiesInOrder, 2),
        warnings,
    };
};

const formatFixUp = (format: IColumnFormat | undefined): IColumnFormat | undefined => {
    if (typeof format === 'undefined') {
        return undefined;
    }
    if (format.elmType === 'div' && (!format.style || (format.style && !format.style.display))) {
        // the root div has a style.display of flex but that matches nothing else, so we ensure it's set to block to match HTML by default
        format.style = format.style || {};
        format.style.display = 'block';
    }
    return format;
};

const detectElmType = (node: Node, elmTypeOverride?: string): string => {
    return elmTypeOverride || (node as HTMLElement).rawTagName?.toLowerCase() || '';
};

const processChildren = (children: Node[]): IFormatElement[] => {
    const childElements: IFormatElement[] = [];
    if(children.length === 1 && children[0].nodeType === NodeType.TEXT_NODE && detectElmType(children[0]) === '') {
        // Handles the case where the only child is a text node
        childElements.push({
            elmType: 'div',
            txtContent: children[0].text,
        });
    } else {
        children.forEach((n: Node) => {
            const elements = processNode(n);
            if (elements && elements.length) {
                childElements.push(...elements);
            }
        });
    }
    
    return childElements;
};

const processNode = (node: Node, elmTypeOverride?: string): IFormatElement[] | undefined => {
    const elmType = detectElmType(node, elmTypeOverride);
    if (!validElmTypes.includes(elmType)) {
        if (transformableElmTypes.includes(elmType)) {
            return transformElement(elmType, node);
        }
        if (node.childNodes.length > 0) {
            const orphans = processChildren(node.childNodes);
            if (orphans.length > 0) {
                if (collapsibleElmTypes.includes(elmType)) {
                    return orphans;
                }
            }
        }
        if (elmType === '' && node.nodeType === NodeType.TEXT_NODE && node.parentNode) {
            //Just some loose text, so wrap it up in a span
            const span = processNode(node, 'span');
            if (span && span.length > 0) {
                span[0].txtContent = node.text;
                return span;
            }
        }
        return undefined;
    }

    const element: IFormatElement = {
        elmType,
    };

    if (node.nodeType === NodeType.ELEMENT_NODE) {
        const hNode = node as HTMLElement;
        for (let attr in hNode.attributes) {
            if (validAttributes.includes(attr) || attr.startsWith('aria-')) {
                //Named attribute, so just map it over
                //TODO: Flag unknown classes (setting to ignore/warn?)
                element.attributes = element.attributes || {};
                element.attributes[attr as keyof typeof element.attributes] = hNode.attributes[attr];
            } else if (validStyles.includes(attr)) {
                //Presentation attributes need to be mapped to the style object
                element.style = element.style || {};
                element.style[attr] = hNode.attributes[attr];
            } else if (attr === 'style') {
                //Split apart the styles and map them to the style object
                const styles = hNode.attributes[attr].split(';');
                styles.forEach((style: string) => {
                    const [key, value] = style.split(':');
                    if (validStyles.includes(key)) {
                        //TODO: Deal with values with paranthesis that don't match silly rules
                        element.style = element.style || {};
                        element.style[key] = value;
                    }
                });
            }
        }
    }

    if(node.childNodes.length === 1 && node.childNodes[0].nodeType === NodeType.TEXT_NODE){
        // Grab any children that are just text and hoist into txtContent
        element.txtContent = node.childNodes[0].text;
    } else if(node.childNodes.length > 0){
        const kids = processChildren(node.childNodes);
        if (kids.length > 0) {
            element.children = kids;
        }
    }

    return [element];
};

const transformElement = (elmType: string, node: Node): IFormatElement[] | undefined => {

    //SVG Shapes to Path
    if (svgShapesToPath.includes(elmType)) {
        const path = processNode(node, 'path');
        if (typeof path !== 'undefined' && path.length > 0) {
            let d: string = '';
            const hNode = node as HTMLElement;
            switch (elmType) {
                case 'rect':
                    d = svgRectToPathD(hNode.getAttribute('x'), hNode.getAttribute('y'), hNode.getAttribute('width'), hNode.getAttribute('height'), hNode.getAttribute('rx'), hNode.getAttribute('ry'));
                    //excess style cleanup
                    delete path[0].style.width;
                    delete path[0].style.height;
                    if (Object.keys(path[0].style).length === 0) {
                        delete path[0].style;
                    }
                    break;
                case 'circle':
                    d = svgCircleToPathD(hNode.getAttribute('cx'), hNode.getAttribute('cy'), hNode.getAttribute('r'));
                    break;
                case 'ellipse':
                    d = svgEllipseToPathD(hNode.getAttribute('cx'), hNode.getAttribute('cy'), hNode.getAttribute('rx'), hNode.getAttribute('ry'));
                    break;
                case 'line':
                    d = svgLineToPathD(hNode.getAttribute('x1'), hNode.getAttribute('y1'), hNode.getAttribute('x2'), hNode.getAttribute('y2'));
                    break;
                case 'polygon':
                    d = svgPolyToPathD(hNode.getAttribute('points'), true);
                    break;
                case 'polyline':
                    d = svgPolyToPathD(hNode.getAttribute('points'), false);
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
        const div = processNode(node, 'div');
        if (div && div.length > 0) {
            return div;
        }
    }
    if (elmsToSwapToSpans.includes(elmType)) {
        const span = processNode(node, 'span');
        if (span && span.length > 0) {
            // Apply any extra styles to make them equivalent
            switch (elmType) {
                case 'b':
                case 'strong':
                    span[0].style = span[0].style || {};
                    span[0].style['font-weight'] = 'bold';
                    break;
                case 'i':
                case 'em':
                    span[0].style = span[0].style || {};
                    span[0].style['font-style'] = 'italic';
                    break;
                default:
            }
            return span;
        }
    }
    
};

const columnFormatFromHTML = (dom: HTMLElement): IColumnFormat | undefined => {
    dom.childNodes = dom.childNodes.filter((n:Node) => !(n.nodeType === NodeType.TEXT_NODE && n.rawText.toLowerCase().startsWith('<!doctype')));
    const childCount = dom.childNodes.length;
    if (childCount > 1) {
        //More than one child, so we'll need to put them in a wrapper element
        const extractedElements = processChildren(dom.childNodes);
        const columnFormat: IColumnFormat = {
            "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
            "elmType": "div",
            "children": extractedElements,
        };
        return columnFormat;
    } else if (childCount === 1) {
        const extractedElements = processNode(dom);
        if (extractedElements && extractedElements.length >= 1) {
            const columnFormat: IColumnFormat = {
                "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
                ...extractedElements[0]
            };
            return columnFormat;
        }
    }
    // } else if (xmlObject.text && xmlObject.text.length > 0) {
    //     const columnFormat: IColumnFormat = {
    //         "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
    //         "elmType": "div",
    //         "txtContent": xmlObject.text,
    //     };
    //     return columnFormat;
    // }
    return undefined;
};

export default HTMLToSPFormat;