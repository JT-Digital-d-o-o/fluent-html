"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.P = P;
exports.H1 = H1;
exports.H2 = H2;
exports.H3 = H3;
exports.H4 = H4;
exports.H5 = H5;
exports.H6 = H6;
exports.Span = Span;
exports.Blockquote = Blockquote;
exports.Pre = Pre;
exports.Code = Code;
exports.Hr = Hr;
exports.Br = Br;
exports.Wbr = Wbr;
const utils_js_1 = require("../core/utils.js");
function P(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("p", child);
}
function H1(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("h1", child);
}
function H2(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("h2", child);
}
function H3(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("h3", child);
}
function H4(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("h4", child);
}
function H5(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("h5", child);
}
function H6(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("h6", child);
}
function Span(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("span", child);
}
function Blockquote(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("blockquote", child);
}
function Pre(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("pre", child);
}
function Code(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("code", child);
}
function Hr(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("hr", child);
}
function Br() {
    return (0, utils_js_1.El)("br");
}
function Wbr() {
    return (0, utils_js_1.El)("wbr");
}
//# sourceMappingURL=text.js.map