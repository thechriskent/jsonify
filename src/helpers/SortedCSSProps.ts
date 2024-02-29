// Default CSS Property Sort Order adapted from CSSComb (https://github.com/csscomb/csscomb.js/blob/dev/config/csscomb.json)
const SortedCSSProps = [
    "font", "font-family", "font-size", "font-weight", "font-style", "font-variant", "font-size-adjust", "font-stretch", "font-effect", "font-emphasize",
    "font-emphasize-position", "font-emphasize-style", "font-smooth", "line-height",

    "position", "z-index", "top", "right", "bottom", "left",

    "display", "visibility", "float", "clear", "overflow", "overflow-x", "overflow-y", "-ms-overflow-x", "-ms-overflow-y", "clip", "zoom",
    "-webkit-align-content", "-ms-flex-line-pack", "align-content", "-webkit-box-align", "-moz-box-align", "-webkit-align-items", "align-items",
    "-ms-flex-align", "-webkit-align-self", "-ms-flex-item-align", "-ms-grid-row-align", "align-self", "-webkit-box-flex", "-webkit-flex", "-moz-box-flex",
    "-ms-flex", "flex", "-webkit-flex-flow", "-ms-flex-flow", "flex-flow", "-webkit-flex-basis", "-ms-flex-preferred-size", "flex-basis", "-webkit-box-orient",
    "-webkit-box-direction", "-webkit-flex-direction", "-moz-box-orient", "-moz-box-direction", "-ms-flex-direction", "flex-direction", "-webkit-flex-grow",
    "-ms-flex-positive", "flex-grow", "-webkit-flex-shrink", "-ms-flex-negative", "flex-shrink", "-webkit-flex-wrap", "-ms-flex-wrap", "flex-wrap",
    "-webkit-box-pack", "-moz-box-pack", "-ms-flex-pack", "-webkit-justify-content", "justify-content", "-webkit-box-ordinal-group", "-webkit-order",
    "-moz-box-ordinal-group", "-ms-flex-order", "order",

    "-webkit-box-sizing", "-moz-box-sizing", "box-sizing", "width", "min-width", "max-width", "height", "min-height", "max-height", "margin", "margin-top",
    "margin-right", "margin-bottom", "margin-left", "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",

    "table-layout", "empty-cells", "caption-side", "border-spacing", "border-collapse", "list-style", "list-style-position", "list-style-type", "list-style-image",

    "content", "quotes", "counter-reset", "counter-increment", "resize", "cursor", "-webkit-user-select", "-moz-user-select", "-ms-user-select", "user-select",
    "nav-index", "nav-up", "nav-right", "nav-down", "nav-left", "-webkit-transition", "-moz-transition", "-ms-transition", "-o-transition", "transition",
    "-webkit-transition-delay", "-moz-transition-delay", "-ms-transition-delay", "-o-transition-delay", "transition-delay", "-webkit-transition-timing-function",
    "-moz-transition-timing-function", "-ms-transition-timing-function", "-o-transition-timing-function", "transition-timing-function", "-webkit-transition-duration",
    "-moz-transition-duration", "-ms-transition-duration", "-o-transition-duration", "transition-duration", "-webkit-transition-property", "-moz-transition-property",
    "-ms-transition-property", "-o-transition-property", "transition-property", "-webkit-transform", "-moz-transform", "-ms-transform", "-o-transform", "transform",
    "-webkit-transform-origin", "-moz-transform-origin", "-ms-transform-origin", "-o-transform-origin", "transform-origin", "-webkit-animation", "-moz-animation",
    "-ms-animation", "-o-animation", "animation", "-webkit-animation-name", "-moz-animation-name", "-ms-animation-name", "-o-animation-name", "animation-name",
    "-webkit-animation-duration", "-moz-animation-duration", "-ms-animation-duration", "-o-animation-duration", "animation-duration", "-webkit-animation-play-state",
    "-moz-animation-play-state", "-ms-animation-play-state", "-o-animation-play-state", "animation-play-state", "-webkit-animation-timing-function",
    "-moz-animation-timing-function", "-ms-animation-timing-function", "-o-animation-timing-function", "animation-timing-function", "-webkit-animation-delay",
    "-moz-animation-delay", "-ms-animation-delay", "-o-animation-delay", "animation-delay", "-webkit-animation-iteration-count", "-moz-animation-iteration-count",
    "-ms-animation-iteration-count", "-o-animation-iteration-count", "animation-iteration-count", "-webkit-animation-direction", "-moz-animation-direction",
    "-ms-animation-direction", "-o-animation-direction", "animation-direction", "text-align", "-webkit-text-align-last", "-moz-text-align-last", "-ms-text-align-last",
    "text-align-last", "vertical-align", "white-space", "text-decoration", "text-emphasis", "text-emphasis-color", "text-emphasis-style", "text-emphasis-position",
    "text-indent", "-ms-text-justify", "text-justify", "letter-spacing", "word-spacing", "-ms-writing-mode", "text-outline", "text-transform", "text-wrap",
    "text-overflow", "-ms-text-overflow", "text-overflow-ellipsis", "text-overflow-mode", "-ms-word-wrap", "word-wrap", "word-break", "-ms-word-break",
    "-moz-tab-size", "-o-tab-size", "tab-size", "-webkit-hyphens", "-moz-hyphens", "hyphens", "pointer-events",

    "opacity", "filter:progid:DXImageTransform.Microsoft.Alpha(Opacity", "-ms-filter:\\'progid:DXImageTransform.Microsoft.Alpha", "-ms-interpolation-mode", "color",
    "border", "border-width", "border-style", "border-color", "border-top", "border-top-width", "border-top-style", "border-top-color", "border-right",
    "border-right-width", "border-right-style", "border-right-color", "border-bottom", "border-bottom-width", "border-bottom-style", "border-bottom-color",
    "border-left", "border-left-width", "border-left-style", "border-left-color", "-webkit-border-radius", "-moz-border-radius", "border-radius",
    "-webkit-border-top-left-radius", "-moz-border-radius-topleft", "border-top-left-radius", "-webkit-border-top-right-radius", "-moz-border-radius-topright",
    "border-top-right-radius", "-webkit-border-bottom-right-radius", "-moz-border-radius-bottomright", "border-bottom-right-radius", "-webkit-border-bottom-left-radius",
    "-moz-border-radius-bottomleft", "border-bottom-left-radius", "-webkit-border-image", "-moz-border-image", "-o-border-image", "border-image", "-webkit-border-image-source",
    "-moz-border-image-source", "-o-border-image-source", "border-image-source", "-webkit-border-image-slice", "-moz-border-image-slice", "-o-border-image-slice",
    "border-image-slice", "-webkit-border-image-width", "-moz-border-image-width", "-o-border-image-width", "border-image-width", "-webkit-border-image-outset",
    "-moz-border-image-outset", "-o-border-image-outset", "border-image-outset", "-webkit-border-image-repeat", "-moz-border-image-repeat", "-o-border-image-repeat",
    "border-image-repeat", "outline", "outline-width", "outline-style", "outline-color", "outline-offset", "background", "filter:progid:DXImageTransform.Microsoft.AlphaImageLoader",
    "background-color", "background-image", "background-repeat", "background-attachment", "background-position", "background-position-x", "-ms-background-position-x",
    "background-position-y", "-ms-background-position-y", "-webkit-background-clip", "-moz-background-clip", "background-clip", "background-origin", "-webkit-background-size",
    "-moz-background-size", "-o-background-size", "background-size", "box-decoration-break", "-webkit-box-shadow", "-moz-box-shadow", "box-shadow",
    "filter:progid:DXImageTransform.Microsoft.gradient", "-ms-filter:\\'progid:DXImageTransform.Microsoft.gradient", "text-shadow",

    // Missing from CSS Comb for some reason
    "fill", "fill-opacity", "stroke",

    // Missing because these are dumb but whitelisted for formatting for some reason 😀
    "overflow-style", "rotation", "rotation-point", "box-align", "box-direction", "box-flex", "box-flex-group", "box-lines", "box-ordinal-group", "box-orient", "box-pack",
    "grid-columns", "grid-rows", "column-count", "column-fill", "column-gap", "column-rule", "column-rule-color", "column-rule-style", "column-rule-width", "column-span",
    "column-width", "columns", "direction", "unicode-bidi", "hanging-punctuation", "punctuation-trim", "-webkit-line-clamp", "object-fit",
];

export default SortedCSSProps;