import { HTMLElement, Node, NodeType, parse } from 'node-html-parser';
import { IColumnFormat, IFormatElement } from '../models';
import { svgCircleToPathD, svgEllipseToPathD, svgLineToPathD, svgPolyToPathD, svgRectToPathD } from './svgTransforms';
import { ValidElmTypes, ValidAttributes, ValidStyles, ValidFormatProperties } from './FormatConstants';


const svgShapesToPath = [
    'rect', 'circle', 'ellipse', 'line', 'polygon', 'polyline'
];

const elmsToSwapToDivs = [
    'body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'footer', 'section', 'article', 'aside', 'nav', 'main', 'hgroup',
    'layer', 'address', 'marquee', 'blockquote', 'figcaption',
    'figure', 'center', 'hr', 'video', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'colgroup', 'col',
    'ol', 'ul', 'li', 'menu', 'dir', 'meter', 'progress',
    'dd', 'dl', 'dt', 'form', 'legend', 'fieldset',
    'pre', 'plaintext', 'listing', 'xmp',
];

//textarea, keygen, select, meter, progress

const elmsToSwapToSpans = [
    'b', 'strong', 'i', 'em', 'q', 'map', 'area',
    'cite', 'var', 'dfn',
    'tt', 'code', 'kbd', 'samp',
    'big', 'small', 's', 'strike', 'del', 'sub', 'sup',
    'nobr',
];

const elmsToSwapSpecial = [
    'input'
];

const transformableElmTypes = [...svgShapesToPath, ...elmsToSwapToDivs, ...elmsToSwapToSpans, ...elmsToSwapSpecial];
const collapsibleElmTypes = ['', 'g', 'html'];

const HTMLToSPFormat = (htmlText: string): { format: string; warnings: string[] } => {
    const root = parse(htmlText, {
        voidTag: {
            tags: ['base', 'embed', 'link', 'meta', 'param', 'source', 'track', 'wbr'],
        }
    });
    root.removeWhitespace(); //Get rid of any whitespace nodes left over from formatted HTML
    //console.log(root);
    const columnFormat = formatFixUp(columnFormatFromHTML(root));
    const warnings: string[] = []; //TODO: Bubble up warnings for things like unsupported elements like <text>
    return {
        format: JSON.stringify(columnFormat, ValidFormatProperties(), 2),
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
    if (children.length === 1 && children[0].nodeType === NodeType.TEXT_NODE && detectElmType(children[0]) === '') {
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
    if (!ValidElmTypes.includes(elmType)) {
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
            if (ValidAttributes.includes(attr) || attr.startsWith('aria-')) {
                //Named attribute, so just map it over
                //TODO: Flag unknown classes (setting to ignore/warn?)
                element.attributes = element.attributes || {};
                element.attributes[attr as keyof typeof element.attributes] = hNode.attributes[attr];
            } else if (ValidStyles.includes(attr)) {
                //Presentation attributes need to be mapped to the style object
                element.style = element.style || {};
                element.style[attr] = hNode.attributes[attr];
            } else if (attr === 'style') {
                //Split apart the styles and map them to the style object
                const styles = hNode.attributes[attr].split(';');
                styles.forEach((style: string) => {
                    const [key, value] = style.split(':');
                    if (ValidStyles.includes(key.trim())) {
                        //TODO: Deal with values with paranthesis that don't match silly rules
                        element.style = element.style || {};
                        element.style[key.trim()] = value.trim();
                    }
                });
            }
        }
    }

    if (node.childNodes.length === 1 && node.childNodes[0].nodeType === NodeType.TEXT_NODE) {
        // Grab any children that are just text and hoist into txtContent
        element.txtContent = node.childNodes[0].text;
    } else if (node.childNodes.length > 0) {
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

    //HTML Element Swapping/Adjustments
    // Default styles are applied when possible to make them behave as similar as possible to the original intent
    //  Default styles pulled from Chrome's default styles: https://chromium.googlesource.com/chromium/blink/+/refs/heads/main/Source/core/css/html.css
    //  Nested default styles are ignored cause complicated
    if (elmsToSwapToDivs.includes(elmType)) {
        const div = processNode(node, 'div');
        if (div && div.length > 0) {
            // Apply any extra styles to make them equivalent (unsupported styles are commented out)
            const divStyle: any = {};
            const divAttributes: any = {};
            switch (elmType) {
                case 'body':
                    divStyle.margin = '8px';
                    break;
                case 'marquee':
                    divStyle.display = 'inline-block';
                    break;
                case 'blockquote':
                    // divStyle['-webkit-margin-before'] = '1__qem';
                    // divStyle['-webkit-margin-after'] = '1em';
                    // divStyle['-webkit-margin-start'] = '40px';
                    // divStyle['-webkit-margin-end'] = '40px';
                    break;
                case 'figure':
                    // divStyle['-webkit-margin-before'] = '1em';
                    // divStyle['-webkit-margin-after'] = '1em';
                    // divStyle['-webkit-margin-start'] = '40px';
                    // divStyle['-webkit-margin-end'] = '40px';
                    break;
                case 'center':
                    // divStyle.textAlign = '-webkit-center';
                    break;
                case 'hr':
                    // divStyle['-webkit-margin-before'] = '0.5em';
                    // divStyle['-webkit-margin-after'] = '0.5em';
                    // divStyle['-webkit-margin-start'] = 'auto';
                    // divStyle['-webkit-margin-end'] = 'auto';
                    divStyle['border-style'] = 'inset';
                    divStyle['border-width'] = '1px';
                    break;
                case 'video':
                    divStyle['object-fit'] = 'contain';
                    break;
                case 'h1':
                    divStyle['font-size'] = '2em';
                    // divStyle['-webkit-margin-before'] = '0.67__qem';
                    // divStyle['-webkit-margin-after'] = '0.67em';
                    // divStyle['-webkit-margin-start'] = '0';
                    // divStyle['-webkit-margin-end'] = '0';
                    divStyle['font-weight'] = 'bold';
                    break;
                case 'h2':
                    divStyle['font-size'] = '1.5em';
                    // divStyle['-webkit-margin-before'] = '0.83__qem';
                    // divStyle['-webkit-margin-after'] = '0.83em';
                    // divStyle['-webkit-margin-start'] = '0';
                    // divStyle['-webkit-margin-end'] = '0';
                    divStyle['font-weight'] = 'bold';
                    break;
                case 'h3':
                    divStyle['font-size'] = '1.17em';
                    // divStyle['-webkit-margin-before'] = '1__qem';
                    // divStyle['-webkit-margin-after'] = '1em';
                    // divStyle['-webkit-margin-start'] = '0';
                    // divStyle['-webkit-margin-end'] = '0';
                    divStyle['font-weight'] = 'bold';
                    break;
                case 'h4':
                    divStyle['font-size'] = '14px';
                    // divStyle['-webkit-margin-before'] = '1.33__qem';
                    // divStyle['-webkit-margin-after'] = '1.33em';
                    // divStyle['-webkit-margin-start'] = '0';
                    // divStyle['-webkit-margin-end'] = '0';
                    divStyle['font-weight'] = 'bold';
                    break;
                case 'h5':
                    divStyle['font-size'] = '.83em';
                    // divStyle['-webkit-margin-before'] = '1.67__qem';
                    // divStyle['-webkit-margin-after'] = '1.67em';
                    // divStyle['-webkit-margin-start'] = '0';
                    // divStyle['-webkit-margin-end'] = '0';
                    divStyle['font-weight'] = 'bold';
                    break;
                case 'h6':
                    divStyle['font-size'] = '.67em';
                    // divStyle['-webkit-margin-before'] = '2.33__qem';
                    // divStyle['-webkit-margin-after'] = '2.33em';
                    // divStyle['-webkit-margin-start'] = '0';
                    // divStyle['-webkit-margin-end'] = '0';
                    divStyle['font-weight'] = 'bold';
                    break;
                case 'table':
                    divStyle.display = 'table';
                    divStyle['border-collapse'] = 'separate';
                    divStyle['border-spacing'] = '2px';
                    //divStyle['border-color'] = 'gray';
                    divAttributes.class = 'ms-borderColor-neutralLight';
                    break;
                case 'thead':
                    divStyle.display = 'table-header-group';
                    divStyle['vertical-align'] = 'middle';
                    divStyle['border-color'] = 'inherit';
                    break;
                case 'tbody':
                    divStyle.display = 'table-row-group';
                    divStyle['vertical-align'] = 'middle';
                    divStyle['border-color'] = 'inherit';
                    break;
                case 'tfoot':
                    divStyle.display = 'table-footer-group';
                    divStyle['vertical-align'] = 'middle';
                    divStyle['border-color'] = 'inherit';
                    break;
                case 'col':
                    divStyle.display = 'table-column';
                    break;
                case 'colgroup':
                    divStyle.display = 'table-column-group';
                    break;
                case 'tr':
                    divStyle.display = 'table-row';
                    divStyle['vertical-align'] = 'inherit';
                    divStyle['border-color'] = 'inherit';
                    break;
                case 'td':
                    divStyle.display = 'table-cell';
                    divStyle['vertical-align'] = 'inherit';
                    break;
                case 'th':
                    divStyle.display = 'table-cell';
                    divStyle['vertical-align'] = 'inherit';
                    divStyle['font-weight'] = 'bold';
                    break;
                case 'ol':
                    // divStyle['list-style-type'] = 'decimal';
                    // divStyle['-webkit-margin-before'] = '1__qem';
                    // divStyle['-webkit-margin-after'] = '1em';
                    // divStyle['-webkit-margin-start'] = '0';
                    // divStyle['-webkit-margin-end'] = '0';
                    //divStyle['-webkit-padding-start'] = '40px';
                    break;
                case 'menu':
                case 'dir':
                case 'ul':
                    // divStyle['list-style-type'] = 'disc';
                    // divStyle['-webkit-margin-before'] = '1__qem';
                    // divStyle['-webkit-margin-after'] = '1em';
                    // divStyle['-webkit-margin-start'] = '0';
                    // divStyle['-webkit-margin-end'] = '0';
                    //divStyle['-webkit-padding-start'] = '40px';
                    break;
                case 'li':
                    divStyle.display = 'list-item';
                    // divStyle['text-align'] = 'match-parent';
                    break;
                case 'dd':
                    // divStyle['-webkit-margin-start'] = '40px';
                    break;
                case 'dl':
                    // divStyle['-webkit-margin-before'] = '1__qem';
                    // divStyle['-webkit-margin-after'] = '1em';
                    // divStyle['-webkit-margin-start'] = '0';
                    // divStyle['-webkit-margin-end'] = '0';
                    break;
                case 'form':
                    divStyle['margin-top'] = '0__qem';
                    break;
                case 'legend':
                    // divStyle['-webkit-padding-start'] = '2px';
                    // divStyle['-webkit-padding-end'] = '2px';
                    divStyle.border = 'none';
                    break;
                case 'fieldset':
                    // divStyle['-webkit-margin-start'] = '2px';
                    // divStyle['-webkit-margin-end'] = '2px';
                    // divStyle['-webkit-padding-before'] = '0.35em';
                    // divStyle['-webkit-padding-start'] = '0.75em';
                    // divStyle['-webkit-padding-end'] = '0.75em';
                    // divStyle['-webkit-padding-after'] = '0.625em';
                    divStyle.border = '2px groove ThreeDFace';
                    divStyle['min-width'] = '-webkit-min-content';
                    break;
                case 'meter':
                    // divStyle['-webkit-appearance'] = 'meter';
                    divStyle['box-sizing'] = 'border-box';
                    divStyle.display = 'inline-block';
                    divStyle.height = '1em';
                    divStyle.width = '5em';
                    divStyle['vertical-align'] = '-0.2em';
                    break;
                case 'progress':
                    // divStyle['-webkit-appearance'] = 'progress-bar';
                    divStyle['box-sizing'] = 'border-box';
                    divStyle.display = 'inline-block';
                    divStyle.height = '1em';
                    divStyle.width = '10em';
                    divStyle['vertical-align'] = '-0.2em';
                    break;
                case 'address':
                    divStyle['font-style'] = 'italic';
                    break;
                case 'pre':
                case 'plaintext':
                case 'listing':
                case 'xmp':
                    divStyle['font-family'] = 'monospace';
                    divStyle['white-space'] = 'pre';
                    divStyle['margin'] = '1__qem 0';
                    break;
                default:
            }
            if (Object.keys(divStyle).length > 0) {
                div[0].style = { ...divStyle, ...(div[0].style || {}) };
            }
            if (Object.keys(divAttributes).length > 0) {
                div[0].attributes = { ...divAttributes, ...(div[0].attributes || {}) };
            }
            return div;
        }
    }
    if (elmsToSwapToSpans.includes(elmType)) {
        const span = processNode(node, 'span');
        if (span && span.length > 0) {
            // Apply any extra styles to make them equivalent
            const spanStyle: any = {};
            switch (elmType) {
                case 'b':
                case 'strong':
                    spanStyle['font-weight'] = 'bold';
                    break;
                case 'i':
                case 'em':
                case 'cite':
                case 'var':
                case 'dfn':
                    spanStyle['font-style'] = 'italic';
                    break;
                case 'tt':
                case 'code':
                case 'kbd':
                case 'samp':
                    spanStyle['font-family'] = 'monospace';
                    break;
                case 'big':
                    spanStyle['font-size'] = 'larger';
                    break;
                case 'small':
                    spanStyle['font-size'] = 'smaller';
                    break;
                case 's':
                case 'strike':
                case 'del':
                    spanStyle['text-decoration'] = 'line-through';
                    break;
                case 'sub':
                    spanStyle['vertical-align'] = 'sub';
                    spanStyle['font-size'] = 'smaller';
                    break;
                case 'sup':
                    spanStyle['vertical-align'] = 'super';
                    spanStyle['font-size'] = 'smaller';
                    break;
                case 'nobr':
                    spanStyle['white-space'] = 'nowrap';
                    break;
                default:
            }
            if (Object.keys(spanStyle).length > 0) {
                span[0].style = { ...spanStyle, ...(span[0].style || {}) };
            }
            return span;
        }
    }
    if (elmsToSwapSpecial.includes(elmType)) {
        switch (elmType) {
            case 'input':
                let input: IFormatElement[] | undefined;
                const inputType = (node.nodeType === NodeType.ELEMENT_NODE ? (node as HTMLElement).getAttribute('type')?.toLowerCase() : '') || '';
                if (inputType === 'button') {
                    input = processNode(node, 'button');
                } else {
                    input = processNode(node, 'div');
                    if (input && input.length > 0) {
                        const inputStyle: any = {};
                        inputStyle.margin = '0__qem';
                        inputStyle.font = '-webkit-small-control';
                        inputStyle['text-rendering'] = 'auto';
                        inputStyle['color'] = 'initial';
                        inputStyle['letter-spacing'] = 'normal';
                        inputStyle['word-spacing'] = 'normal';
                        inputStyle['line-height'] = 'normal';
                        inputStyle['text-transform'] = 'none';
                        inputStyle['text-indent'] = '0';
                        inputStyle['text-shadow'] = 'none';
                        inputStyle.display = 'inline-block';
                        // inputStyle['text-align'] = 'start';
                        // inputStyle['-webkit-appearance'] = 'textfield';
                        inputStyle.padding = '1px';
                        inputStyle.border = '2px inset';
                        // inputStyle['-webkit-rtl-ordering'] = 'logical';
                        // inputStyle['-webkit-user-select'] = 'text';
                        inputStyle.cursor = 'auto';

                        const inputAttributes: any = {};
                        inputAttributes.class = 'ms-bgColor-white';


                        switch (inputType) {
                            case 'hidden':
                                inputStyle.display = 'none';
                                break;
                            case 'search':
                                // inputStyle['-webkit-appearance'] = 'searchfield';
                                inputStyle['box-sizing'] = 'border-box';
                                break;
                            case 'file':
                                inputStyle['align-items'] = 'baseline';
                                inputStyle.color = 'inherit';
                                // inputStyle['text-align'] = 'start !important';
                                break;
                            case 'radio':
                            case 'checkbox':
                                inputStyle.margin = '3px 0.5ex';
                                inputStyle.padding = 'initial';
                                inputStyle['background-color'] = 'initial';
                                inputStyle.border = 'initial';
                                break;
                            case 'submit':
                            case 'reset':
                                inputStyle['white-space'] = 'pre';
                                break;
                            case 'range':
                                // inputStyle['-webkit-appearance'] = 'slider-horizontal';
                                inputStyle.padding = 'initial';
                                inputStyle.border = 'initial';
                                inputStyle.margin = '2px';
                                inputAttributes.class = 'ms-fontColor-neutralLight';
                                break;
                        }


                        if (Object.keys(inputStyle).length > 0) {
                            input[0].style = { ...inputStyle, ...(input[0].style || {}) };
                        }
                        if (Object.keys(inputAttributes).length > 0) {
                            input[0].attributes = { ...inputAttributes, ...(input[0].attributes || {}) };
                        }
                    }
                }
                return input;
            default:
        }
    }

};

const columnFormatFromHTML = (dom: HTMLElement): IColumnFormat | undefined => {
    dom.childNodes = dom.childNodes.filter((n: Node) => !(n.nodeType === NodeType.TEXT_NODE && n.rawText.toLowerCase().startsWith('<!doctype')));
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