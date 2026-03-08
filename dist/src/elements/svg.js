import { El } from "../core/utils.js";
export function Path(...children) {
    return El("path", ...children);
}
export function Circle(...children) {
    return El("circle", ...children);
}
export function Rect(...children) {
    return El("rect", ...children);
}
export function Line(...children) {
    return El("line", ...children);
}
export function Polygon(...children) {
    return El("polygon", ...children);
}
export function Polyline(...children) {
    return El("polyline", ...children);
}
export function Ellipse(...children) {
    return El("ellipse", ...children);
}
export function G(...children) {
    return El("g", ...children);
}
export function Defs(...children) {
    return El("defs", ...children);
}
export function Use(...children) {
    return El("use", ...children);
}
export function Text(...children) {
    return El("text", ...children);
}
export function Tspan(...children) {
    return El("tspan", ...children);
}
//# sourceMappingURL=svg.js.map