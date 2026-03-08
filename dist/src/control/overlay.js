import { Div } from "../elements/structural.js";
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
export function Overlay(content, overlay, position = 'center') {
    return Div([
        content,
        Div(overlay)
            .setStyle(`position: absolute; ${positionStyles[position]} z-index: 10`),
    ])
        .setStyle("position: relative");
}
//# sourceMappingURL=overlay.js.map