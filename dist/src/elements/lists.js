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
function Ul(...children) {
    return (0, utils_js_1.El)("ul", ...children);
}
function Ol(...children) {
    return (0, utils_js_1.El)("ol", ...children);
}
function Li(...children) {
    return (0, utils_js_1.El)("li", ...children);
}
function Dl(...children) {
    return (0, utils_js_1.El)("dl", ...children);
}
function Dt(...children) {
    return (0, utils_js_1.El)("dt", ...children);
}
function Dd(...children) {
    return (0, utils_js_1.El)("dd", ...children);
}
function Menu(...children) {
    return (0, utils_js_1.El)("menu", ...children);
}
//# sourceMappingURL=lists.js.map