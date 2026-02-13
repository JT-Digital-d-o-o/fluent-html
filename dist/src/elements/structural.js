"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Div = Div;
exports.Main = Main;
exports.Header = Header;
exports.Footer = Footer;
exports.Section = Section;
exports.Article = Article;
exports.Nav = Nav;
exports.Aside = Aside;
exports.Figure = Figure;
exports.Figcaption = Figcaption;
exports.Address = Address;
exports.Hgroup = Hgroup;
exports.Search = Search;
const utils_js_1 = require("../core/utils.js");
function Div(...children) {
    return (0, utils_js_1.El)("div", ...children);
}
function Main(...children) {
    return (0, utils_js_1.El)("main", ...children);
}
function Header(...children) {
    return (0, utils_js_1.El)("header", ...children);
}
function Footer(...children) {
    return (0, utils_js_1.El)("footer", ...children);
}
function Section(...children) {
    return (0, utils_js_1.El)("section", ...children);
}
function Article(...children) {
    return (0, utils_js_1.El)("article", ...children);
}
function Nav(...children) {
    return (0, utils_js_1.El)("nav", ...children);
}
function Aside(...children) {
    return (0, utils_js_1.El)("aside", ...children);
}
function Figure(...children) {
    return (0, utils_js_1.El)("figure", ...children);
}
function Figcaption(...children) {
    return (0, utils_js_1.El)("figcaption", ...children);
}
function Address(...children) {
    return (0, utils_js_1.El)("address", ...children);
}
function Hgroup(...children) {
    return (0, utils_js_1.El)("hgroup", ...children);
}
function Search(...children) {
    return (0, utils_js_1.El)("search", ...children);
}
//# sourceMappingURL=structural.js.map