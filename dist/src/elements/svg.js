"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Path = Path;
exports.Circle = Circle;
exports.Rect = Rect;
exports.Line = Line;
exports.Polygon = Polygon;
exports.Polyline = Polyline;
exports.Ellipse = Ellipse;
exports.G = G;
exports.Defs = Defs;
exports.Use = Use;
exports.Text = Text;
exports.Tspan = Tspan;
const utils_js_1 = require("../core/utils.js");
function Path(...children) {
    return (0, utils_js_1.El)("path", ...children);
}
function Circle(...children) {
    return (0, utils_js_1.El)("circle", ...children);
}
function Rect(...children) {
    return (0, utils_js_1.El)("rect", ...children);
}
function Line(...children) {
    return (0, utils_js_1.El)("line", ...children);
}
function Polygon(...children) {
    return (0, utils_js_1.El)("polygon", ...children);
}
function Polyline(...children) {
    return (0, utils_js_1.El)("polyline", ...children);
}
function Ellipse(...children) {
    return (0, utils_js_1.El)("ellipse", ...children);
}
function G(...children) {
    return (0, utils_js_1.El)("g", ...children);
}
function Defs(...children) {
    return (0, utils_js_1.El)("defs", ...children);
}
function Use(...children) {
    return (0, utils_js_1.El)("use", ...children);
}
function Text(...children) {
    return (0, utils_js_1.El)("text", ...children);
}
function Tspan(...children) {
    return (0, utils_js_1.El)("tspan", ...children);
}
//# sourceMappingURL=svg.js.map