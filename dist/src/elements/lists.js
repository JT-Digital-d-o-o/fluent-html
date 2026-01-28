"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ul = Ul;
exports.Ol = Ol;
exports.Li = Li;
exports.Dl = Dl;
exports.Dt = Dt;
exports.Dd = Dd;
exports.Menu = Menu;
const utils_js_1 = require("../core/utils.js");
function Ul(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("ul", child);
}
function Ol(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("ol", child);
}
function Li(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("li", child);
}
function Dl(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("dl", child);
}
function Dt(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("dt", child);
}
function Dd(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("dd", child);
}
function Menu(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("menu", child);
}
//# sourceMappingURL=lists.js.map