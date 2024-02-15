import SortedCSSProps from "./SortedCSSProps";

/**
 * Elements allowed in List Formats
 *  valid values for the elmType property
 */
export const ValidElmTypes = [
    'div', 'button', 'span', 'a', 'img', 'svg', 'path', 'filepreview', 'p',
];

/**
 * Attributes allowed in List Formats
 *  valid properties for the attributes property
 *  Additionally, any property following the pattern aria-* is allowed
 *  Order affects the order of the attributes in the output
 */
export const ValidAttributes = [
    'id', 'title', 'class', 'iconName', 'role', 'href', 'target', 'rel', 'src', 'alt', 'viewBox', 'preserveAspectRatio', 'd',
    'dataInterception', 'draggable',
];

/**
 * Style properties allowed in List Formats
 *  valid properties for the style property
 *  Order does NOT affect the order of the styles in the output, determined by the SortedCSSProps array
 */
export const ValidStyles = [
    'background-color', 'fill', 'background-image', 'border', 'border-bottom', 'border-bottom-color', 'border-bottom-style',
    'border-bottom-width', 'border-color', 'border-left', 'border-left-color', 'border-left-style', 'border-left-width', 'border-right',
    'border-right-color', 'border-right-style', 'border-right-width', 'border-style', 'border-top', 'border-top-color', 'border-top-style',
    'border-top-width', 'border-width', 'outline', 'outline-color', 'outline-style', 'outline-width', 'border-bottom-left-radius',
    'border-bottom-right-radius', 'border-radius', 'border-top-left-radius', 'border-top-right-radius', 'box-decoration-break', 'box-shadow',
    'box-sizing', 'overflow-x', 'overflow-y', 'overflow-style', 'rotation', 'rotation-point', 'opacity', 'cursor', 'height', 'max-height',
    'max-width', 'min-height', 'min-width', 'width', 'flex-grow', 'flex-shrink', 'flex-flow', 'flex-direction', 'flex-wrap', 'flex-basis',
    'flex', 'justify-content', 'align-items', 'align-self', 'box-align', 'box-direction', 'box-flex', 'box-flex-group', 'box-lines',
    'box-ordinal-group', 'box-orient', 'box-pack', 'font', 'font-family', 'font-size', 'font-style', 'font-variant', 'font-weight',
    'font-size-adjust', 'font-stretch', 'grid-columns', 'grid-rows', 'margin', 'margin-bottom', 'margin-left', 'margin-right', 'margin-top',
    'column-count', 'column-fill', 'column-gap', 'column-rule', 'column-rule-color', 'column-rule-style', 'column-rule-width', 'column-span',
    'column-width', 'columns', 'padding', 'padding-bottom', 'padding-left', 'padding-right', 'padding-top', 'bottom', 'clear', 'clip', 'display',
    'float', 'left', 'overflow', 'position', 'right', 'top', 'visibility', 'z-index', 'border-collapse', 'border-spacing', 'caption-side',
    'empty-cells', 'table-layout', 'color', 'direction', 'letter-spacing', 'line-height', 'text-align', 'text-decoration', 'text-indent',
    'text-transform', 'unicode-bidi', 'vertical-align', 'white-space', 'word-spacing', 'hanging-punctuation', 'punctuation-trim', 'text-align-last',
    'text-justify', 'text-outline', 'text-shadow', 'text-wrap', 'word-break', 'word-wrap', 'text-overflow',
    'stroke', 'fill-opacity', '-webkit-line-clamp', 'object-fit', 'transform',
];

/**
 * Custom Style properties allowed in List Formats
 *  valid properties for the style property, but not actual CSS properties
 *  Order affects the order only of these styles in the output, which are at the end of all other styles
 */
export const CustomStyles = [
    '--inline-editor-border-radius', '--inline-editor-border-width', '--inline-editor-border-style', '--inline-editor-border-color',
];

/**
 * Actions allowed in List Formats
 *  valid values for the action property
 */
export const ValidActions = [
    "defaultClick", "executeFlow", "share", "delete", "editProps", "openContextMenu", "setValue"
];

/**
 * Additional properties allowed in List Formats
 *  valid properties for other portions of column formats (missing view and related schema properties)
 *  Order affects the order of the properties in the output
 */
export const AdditionalProperties = [
    '$schema', 'debugMode', 'columnFormatterReference', 'forEach', 'elmType', 'txtContent', 'attributes', 'style',
    'customRowAction', 'actionParams', 'actionInput', 'inlineEditField',
    'defaultHoverField', 'customCardProps', 'openOnEvent', 'directionalHint', 'isBeakVisible', 'beakStyle', 'formatter',
    'filePreviewProps', 'fileTypeIconClass', 'fileTypeIconStyle', 'brandTypeIconClass', 'brandTypeIconStyle',
    'operator', 'operands',
    'children',
]; //TODO: Add additional properties from other format schemas

let validFormatProperties: string[];
export const ValidFormatProperties = (): string[] => {
    if (typeof validFormatProperties === 'undefined') {
        const orderedCSSProps = SortedCSSProps.filter(prop => ValidStyles.includes(prop));
        //console.log(`orderedCSSProps: ${orderedCSSProps.length} vs ValidStyles: ${ValidStyles.length}`);
        //console.log(ValidStyles.filter(prop => !orderedCSSProps.includes(prop)));
        validFormatProperties = [
            ...AdditionalProperties,
            ...ValidAttributes,
            ...orderedCSSProps,
            ...CustomStyles,
        ];
    }
    return validFormatProperties;
};