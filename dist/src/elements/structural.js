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
function Div(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("div", child);
}
function Main(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("main", child);
}
function Header(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("header", child);
}
function Footer(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("footer", child);
}
function Section(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("section", child);
}
function Article(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("article", child);
}
function Nav(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("nav", child);
}
function Aside(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("aside", child);
}
function Figure(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("figure", child);
}
function Figcaption(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("figcaption", child);
}
function Address(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("address", child);
}
function Hgroup(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("hgroup", child);
}
function Search(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("search", child);
}
//# sourceMappingURL=structural.js.map