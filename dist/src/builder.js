"use strict";
// ------------------------------------
// Html Builder "Framework"
// ------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repeat = exports.ForEach3 = exports.ForEach2 = exports.ForEach1 = exports.ForEach = exports.SwitchCase = exports.IfThen = exports.IfThenElse = exports.Overlay = exports.Hr = exports.Td = exports.Th = exports.Tr = exports.Tbody = exports.Thead = exports.Table = exports.Li = exports.Ol = exports.Ul = exports.Span = exports.H4 = exports.H3 = exports.H2 = exports.H1 = exports.Select = exports.SelectTag = exports.Img = exports.ImgTag = exports.Form = exports.FormTag = exports.A = exports.AnchorTag = exports.Label = exports.LabelTag = exports.Button = exports.ButtonTag = exports.Textarea = exports.TextareaTag = exports.Input = exports.InputTag = exports.P = exports.Article = exports.Footer = exports.Header = exports.Main = exports.HStack = exports.Div = exports.El = exports.Empty = exports.Tag = void 0;
exports.OverlayOld = exports.HrOld = exports.TdOld = exports.ThOld = exports.TrOld = exports.TbodyOld = exports.TheadOld = exports.TableOld = exports.SelectOld = exports.ImgOld = exports.FormOld = exports.LiOld = exports.OlOld = exports.UlOld = exports.AOld = exports.SpanOld = exports.H4Old = exports.H3Old = exports.H2Old = exports.H1Old = exports.LabelOld = exports.ButtonOld = exports.POld = exports.TextareaOld = exports.InputOld = exports.VStack = exports.Text = exports.DivOld = exports.ElOld = exports.render = void 0;
class Tag {
    constructor(element, child = Empty()) {
        this.el = element;
        this.child = child;
        this.attributes = {};
    }
    setId(id) {
        this.id = id;
        return this;
    }
    setClass(c) {
        this.class = c;
        return this;
    }
    addClass(c) {
        if (this.class) {
            this.class += ` ${c}`;
        }
        else {
            this.class = c;
        }
        return this;
    }
    setStyle(style) {
        this.attributes.style = style;
        return this;
    }
    addAttribute(key, value) {
        this.attributes[key] = value;
        return this;
    }
    setHtmx(htmx) {
        this.htmx = htmx;
        return this;
    }
    setToggles(toggles) {
        this.toggles = toggles;
        return this;
    }
}
exports.Tag = Tag;
// Lambda.html building blocks
function Empty() {
    return "";
}
exports.Empty = Empty;
function El(el, child = Empty()) {
    return new Tag(el, child);
}
exports.El = El;
function Div(child = Empty()) {
    return El("div", child);
}
exports.Div = Div;
function HStack(children = []) {
    return Div(children)
        .setStyle("flex");
}
exports.HStack = HStack;
function Main(child = Empty()) {
    return El("main", child);
}
exports.Main = Main;
function Header(child = Empty()) {
    return El("header", child);
}
exports.Header = Header;
function Footer(child = Empty()) {
    return El("footer", child);
}
exports.Footer = Footer;
function Article(child = Empty()) {
    return El("article", child);
}
exports.Article = Article;
function P(child = Empty()) {
    return El("p", child);
}
exports.P = P;
class InputTag extends Tag {
    setType(type) {
        this.type = type;
        return this;
    }
    setPlaceholder(placeholder) {
        this.placeholder = placeholder;
        return this;
    }
    setName(name) {
        this.name = name;
        return this;
    }
    setValue(value) {
        this.value = value;
        return this;
    }
}
exports.InputTag = InputTag;
;
function Input(child = Empty()) {
    return new InputTag("input", child);
}
exports.Input = Input;
class TextareaTag extends Tag {
    setPlaceholder(placeholder) {
        this.placeholder = placeholder;
        return this;
    }
    setName(name) {
        this.name = name;
        return this;
    }
    setRows(rows) {
        this.rows = rows;
        return this;
    }
    setCols(cols) {
        this.cols = cols;
        return this;
    }
}
exports.TextareaTag = TextareaTag;
;
function Textarea(child = Empty()) {
    return new TextareaTag("textarea", child);
}
exports.Textarea = Textarea;
class ButtonTag extends Tag {
    setType(type) {
        this.type = type;
        return this;
    }
}
exports.ButtonTag = ButtonTag;
;
function Button(child = Empty()) {
    return new ButtonTag("button", child);
}
exports.Button = Button;
class LabelTag extends Tag {
    setFor(forId) {
        this.for = forId;
        return this;
    }
}
exports.LabelTag = LabelTag;
;
function Label(child = Empty()) {
    return new LabelTag("label", child);
}
exports.Label = Label;
class AnchorTag extends Tag {
    setHref(href) {
        this.href = href;
        return this;
    }
}
exports.AnchorTag = AnchorTag;
;
function A(child = Empty()) {
    return new AnchorTag("a", child);
}
exports.A = A;
class FormTag extends Tag {
    setAction(action) {
        this.action = action;
        return this;
    }
    setMethod(method) {
        this.method = method;
        return this;
    }
}
exports.FormTag = FormTag;
;
function Form(child = Empty()) {
    return new FormTag("form", child);
}
exports.Form = Form;
class ImgTag extends Tag {
    setSrc(src) {
        this.src = src;
        return this;
    }
    setAlt(alt) {
        this.alt = alt;
        return this;
    }
    setWidth(width) {
        this.width = width;
        return this;
    }
    setHeight(height) {
        this.height = height;
        return this;
    }
}
exports.ImgTag = ImgTag;
;
function Img(child = Empty()) {
    return new ImgTag("img", child);
}
exports.Img = Img;
class SelectTag extends Tag {
    setName(name) {
        this.name = name;
        return this;
    }
    setOptions(options) {
        this.options = options;
        return this;
    }
}
exports.SelectTag = SelectTag;
;
function Select(child = Empty()) {
    return new SelectTag("select", child);
}
exports.Select = Select;
// @TODO: - Implement `Option`
function H1(child = Empty()) {
    return new Tag("h1", child);
}
exports.H1 = H1;
function H2(child = Empty()) {
    return new Tag("h2", child);
}
exports.H2 = H2;
function H3(child = Empty()) {
    return new Tag("h3", child);
}
exports.H3 = H3;
function H4(child = Empty()) {
    return new Tag("h4", child);
}
exports.H4 = H4;
function Span(child = Empty()) {
    return new Tag("span", child);
}
exports.Span = Span;
function Ul(child = Empty()) {
    return new Tag("ul", child);
}
exports.Ul = Ul;
function Ol(child = Empty()) {
    return new Tag("ol", child);
}
exports.Ol = Ol;
function Li(child = Empty()) {
    return new Tag("li", child);
}
exports.Li = Li;
function Table(child = Empty()) {
    return new Tag("table", child);
}
exports.Table = Table;
function Thead(child = Empty()) {
    return new Tag("thead", child);
}
exports.Thead = Thead;
function Tbody(child = Empty()) {
    return new Tag("tbody", child);
}
exports.Tbody = Tbody;
function Tr(child = Empty()) {
    return new Tag("tr", child);
}
exports.Tr = Tr;
function Th(child = Empty()) {
    return new Tag("th", child);
}
exports.Th = Th;
function Td(child = Empty()) {
    return new Tag("td", child);
}
exports.Td = Td;
function Hr(child = Empty()) {
    return new Tag("hr", child);
}
exports.Hr = Hr;
function Overlay(content, overlay, position = 'center') {
    return Div([
        content,
        Div(overlay)
            .setStyle(`position: absolute; ${positionStyles[position]}`),
    ])
        .setStyle("position: relative");
}
exports.Overlay = Overlay;
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
// Control flow:
function IfThenElse(condition, thenBranch, elseBranch) {
    return condition
        ? thenBranch()
        : elseBranch();
}
exports.IfThenElse = IfThenElse;
function IfThen(condition, then) {
    return IfThenElse(condition, then, Empty);
}
exports.IfThen = IfThen;
function SwitchCase(cases, defaultView = Empty) {
    for (const caseItem of cases) {
        if (caseItem.condition) {
            return caseItem.component();
        }
    }
    return defaultView();
}
exports.SwitchCase = SwitchCase;
function ForEach(views, renderItem) {
    return Array.from(views).map(renderItem);
    //           ^^^^^^^^^^^ NOTE: - This creates a shallow copy even when the argument is already an array
}
exports.ForEach = ForEach;
function ForEach1(views, renderItem) {
    return Array.from(views).map(renderItem);
    //           ^^^^^^^^^^^ NOTE: - This creates a shallow copy even when the argument is already an array
}
exports.ForEach1 = ForEach1;
function ForEach2(high, renderItem) {
    return Array.from(range(0, high)).map((index) => renderItem(index));
}
exports.ForEach2 = ForEach2;
function ForEach3(low, high, renderItem) {
    return Array.from(range(low, high)).map((index) => renderItem(index));
}
exports.ForEach3 = ForEach3;
function* range(low, high) {
    for (var i = low; i < high; i++) {
        yield i;
    }
}
function Repeat(times, content) {
    return ForEach(range(0, times), content);
}
exports.Repeat = Repeat;
// render
function render(view) {
    return renderImpl(view);
}
exports.render = render;
function renderImpl(view) {
    function buildAttributes(attributes) {
        if (!attributes) {
            return "";
        }
        return Object.entries(attributes)
            .map(([key, value]) => {
            return value ? `${key}="${value}"` : "";
        })
            .filter(s => s.length > 0)
            .join(" ");
    }
    function buildHtmx(htmx) {
        if (!htmx) {
            return '';
        }
        const methodAndEndpoint = `hx-${htmx.method}="${htmx.endpoint}"`;
        const target = htmx.target ? `hx-target="${htmx.target}"` : null;
        const trigger = htmx.trigger ? `hx-trigger="${htmx.trigger}"` : null;
        const swap = htmx.swap ? `hx-swap="${htmx.swap}"` : null;
        const replaceUrl = htmx.replaceUrl ? `hx-replace-url="${htmx.replaceUrl}"` : null;
        const encoding = htmx.encoding ? `hx-encoding="${htmx.encoding}"` : null;
        return `${methodAndEndpoint} ${target ? target : ''} ${trigger ? trigger : ''} ${swap ? swap : ''} ${replaceUrl ? replaceUrl : ''} ${encoding ? encoding : ''}`;
    }
    if (typeof view === "string") {
        return view;
    }
    if (view instanceof Tag) {
        const baseAttrs = {};
        Object.assign(baseAttrs, view);
        Object.assign(baseAttrs, view.attributes);
        baseAttrs.el = undefined;
        baseAttrs.htmx = undefined;
        baseAttrs.child = undefined;
        baseAttrs.toggles = undefined;
        baseAttrs.attributes = undefined;
        const renderedChild = render(view.child);
        const renderedAttributes = buildAttributes(baseAttrs);
        const renderedHtmx = buildHtmx(view.htmx);
        const renderedToggles = view.toggles ? view.toggles.join(" ") : " ";
        const renderedStyle = view.style ? 'style="' + view.style + '" ' : " ";
        var renderedAttributesAndToggles = "";
        renderedAttributesAndToggles += renderedAttributes;
        renderedAttributesAndToggles += renderedStyle;
        renderedAttributesAndToggles += renderedHtmx;
        renderedAttributesAndToggles += renderedToggles;
        var renderedEl = "<";
        renderedEl += view.el;
        renderedEl += " ";
        renderedEl += renderedAttributesAndToggles;
        renderedEl += ">";
        renderedEl += renderedChild;
        renderedEl += "</";
        renderedEl += view.el;
        renderedEl += ">";
        return renderedEl;
    }
    if (Array.isArray(view)) {
        return view.map(innerView => render(innerView)).join("\n");
    }
    return "";
}
function ElOld(el, props) {
    const element = new Tag(el);
    if (props) {
        Object.assign(element, props);
    }
    return element;
}
exports.ElOld = ElOld;
function DivOld(props) {
    return ElOld("div", props);
}
exports.DivOld = DivOld;
/**
 * @deprecated Use strings directly instead.
 */
function Text(text = "") {
    return text;
}
exports.Text = Text;
/**
 * @deprecated Use an array directly instead.
 */
function VStack(views) {
    return views;
}
exports.VStack = VStack;
function InputOld(props) {
    return ElOld("input", props);
}
exports.InputOld = InputOld;
function TextareaOld(props) {
    return ElOld("textarea", props);
}
exports.TextareaOld = TextareaOld;
function POld(props) {
    return ElOld("p", props);
}
exports.POld = POld;
function ButtonOld(props) {
    return ElOld("button", props);
}
exports.ButtonOld = ButtonOld;
function LabelOld(props) {
    return ElOld("label", props);
}
exports.LabelOld = LabelOld;
function H1Old(props) {
    return ElOld("h1", props);
}
exports.H1Old = H1Old;
function H2Old(props) {
    return ElOld("h2", props);
}
exports.H2Old = H2Old;
function H3Old(props) {
    return ElOld("h3", props);
}
exports.H3Old = H3Old;
function H4Old(props) {
    return ElOld("h4", props);
}
exports.H4Old = H4Old;
function SpanOld(props) {
    return ElOld("span", props);
}
exports.SpanOld = SpanOld;
function AOld(props) {
    return ElOld("a", props);
}
exports.AOld = AOld;
function UlOld(props) {
    return ElOld("ul", props);
}
exports.UlOld = UlOld;
function OlOld(props) {
    return ElOld("ol", props);
}
exports.OlOld = OlOld;
function LiOld(props) {
    return ElOld("li", props);
}
exports.LiOld = LiOld;
function FormOld(props) {
    return ElOld("form", props);
}
exports.FormOld = FormOld;
function ImgOld(props) {
    return ElOld("img", props);
}
exports.ImgOld = ImgOld;
function SelectOld(props) {
    return ElOld("select", props);
}
exports.SelectOld = SelectOld;
function TableOld(props) {
    return ElOld("table", props);
}
exports.TableOld = TableOld;
function TheadOld(props) {
    return ElOld("thead", props);
}
exports.TheadOld = TheadOld;
function TbodyOld(props) {
    return ElOld("tbody", props);
}
exports.TbodyOld = TbodyOld;
function TrOld(props) {
    return ElOld("tr", props);
}
exports.TrOld = TrOld;
function ThOld(props) {
    return ElOld("th", props);
}
exports.ThOld = ThOld;
function TdOld(props) {
    return ElOld("td", props);
}
exports.TdOld = TdOld;
function HrOld(props) {
    return ElOld("hr", props);
}
exports.HrOld = HrOld;
function OverlayOld(content, overlay, position = 'center') {
    return DivOld({
        style: "position: relative",
        child: [
            content,
            DivOld({
                style: `position: absolute; ${positionStyles[position]}`,
                child: overlay
            })
        ]
    });
}
exports.OverlayOld = OverlayOld;
//# sourceMappingURL=builder.js.map