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
function Path(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("path", child);
}
function Circle(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("circle", child);
}
function Rect(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("rect", child);
}
function Line(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("line", child);
}
function Polygon(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("polygon", child);
}
function Polyline(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("polyline", child);
}
function Ellipse(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("ellipse", child);
}
function G(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("g", child);
}
function Defs(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("defs", child);
}
function Use(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("use", child);
}
function Text(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("text", child);
}
function Tspan(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("tspan", child);
}
//# sourceMappingURL=svg.js.map