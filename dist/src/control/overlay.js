"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Overlay = Overlay;
const structural_js_1 = require("../elements/structural.js");
const positionStyles = {
    'top': 'top: 0; left: 50%; transform: translateX(-50%);',
    'bottom': 'bottom: 0; left: 50%; transform: translateX(-50%);',
    'top-left': 'top: 0; left: 0;',
    'top-right': 'top: 0; right: 0;',
    'bottom-left': 'bottom: 0; left: 0;',
    'bottom-right': 'bottom: 0; right: 0;',
    'left': 'top: 50%; left: 0; transform: translateY(-50%);',
    'right': 'top: 50%; right: 0; transform: translateY(-50%);',
    'center': 'top: 50%; left: 50%; transform: translate(-50%, -50%);'
};
function Overlay(content, overlay, position = 'center') {
    return (0, structural_js_1.Div)([
        content,
        (0, structural_js_1.Div)(overlay)
            .setStyle(`position: absolute; ${positionStyles[position]} z-index: 10`),
    ])
        .setStyle("position: relative");
}
//# sourceMappingURL=overlay.js.map