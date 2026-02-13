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
function P(...children) {
    return (0, utils_js_1.El)("p", ...children);
}
function H1(...children) {
    return (0, utils_js_1.El)("h1", ...children);
}
function H2(...children) {
    return (0, utils_js_1.El)("h2", ...children);
}
function H3(...children) {
    return (0, utils_js_1.El)("h3", ...children);
}
function H4(...children) {
    return (0, utils_js_1.El)("h4", ...children);
}
function H5(...children) {
    return (0, utils_js_1.El)("h5", ...children);
}
function H6(...children) {
    return (0, utils_js_1.El)("h6", ...children);
}
function Span(...children) {
    return (0, utils_js_1.El)("span", ...children);
}
function Blockquote(...children) {
    return (0, utils_js_1.El)("blockquote", ...children);
}
function Pre(...children) {
    return (0, utils_js_1.El)("pre", ...children);
}
function Code(...children) {
    return (0, utils_js_1.El)("code", ...children);
}
function Hr(...children) {
    return (0, utils_js_1.El)("hr", ...children);
}
function Br() {
    return (0, utils_js_1.El)("br");
}
function Wbr() {
    return (0, utils_js_1.El)("wbr");
}
//# sourceMappingURL=text.js.map