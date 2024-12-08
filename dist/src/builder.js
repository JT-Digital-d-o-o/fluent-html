"use strict";
// ------------------------------------
// Html Builder "Framework"
// ------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectTag = exports.ImgTag = exports.FormTag = exports.AnchorTag = exports.LabelTag = exports.ButtonTag = exports.TextareaTag = exports.InputTag = exports.Tag = void 0;
exports.Empty = Empty;
exports.El = El;
exports.Div = Div;
exports.HStack = HStack;
exports.Main = Main;
exports.Header = Header;
exports.Footer = Footer;
exports.Section = Section;
exports.Article = Article;
exports.P = P;
exports.Input = Input;
exports.Textarea = Textarea;
exports.Button = Button;
exports.Label = Label;
exports.A = A;
exports.Form = Form;
exports.Img = Img;
exports.Select = Select;
exports.Option = Option;
exports.H1 = H1;
exports.H2 = H2;
exports.H3 = H3;
exports.H4 = H4;
exports.Span = Span;
exports.Ul = Ul;
exports.Ol = Ol;
exports.Li = Li;
exports.Table = Table;
exports.Thead = Thead;
exports.Tbody = Tbody;
exports.Tr = Tr;
exports.Th = Th;
exports.Td = Td;
exports.Hr = Hr;
exports.Overlay = Overlay;
exports.IfThenElse = IfThenElse;
exports.IfThen = IfThen;
exports.SwitchCase = SwitchCase;
exports.ForEach = ForEach;
exports.ForEach1 = ForEach1;
exports.ForEach2 = ForEach2;
exports.ForEach3 = ForEach3;
exports.Repeat = Repeat;
exports.render = render;
exports.ElOld = ElOld;
exports.DivOld = DivOld;
exports.Text = Text;
exports.VStack = VStack;
exports.InputOld = InputOld;
exports.TextareaOld = TextareaOld;
exports.POld = POld;
exports.ButtonOld = ButtonOld;
exports.LabelOld = LabelOld;
exports.H1Old = H1Old;
exports.H2Old = H2Old;
exports.H3Old = H3Old;
exports.H4Old = H4Old;
exports.SpanOld = SpanOld;
exports.AOld = AOld;
exports.UlOld = UlOld;
exports.OlOld = OlOld;
exports.LiOld = LiOld;
exports.FormOld = FormOld;
exports.ImgOld = ImgOld;
exports.SelectOld = SelectOld;
exports.TableOld = TableOld;
exports.TheadOld = TheadOld;
exports.TbodyOld = TbodyOld;
exports.TrOld = TrOld;
exports.ThOld = ThOld;
exports.TdOld = TdOld;
exports.HrOld = HrOld;
exports.OverlayOld = OverlayOld;
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
function El(el, child = Empty()) {
    return new Tag(el, child);
}
function Div(child = Empty()) {
    return El("div", child);
}
function HStack(children = []) {
    return Div(children)
        .setStyle("flex");
}
function Main(child = Empty()) {
    return El("main", child);
}
function Header(child = Empty()) {
    return El("header", child);
}
function Footer(child = Empty()) {
    return El("footer", child);
}
function Section(child = Empty()) {
    return El("section", child);
}
function Article(child = Empty()) {
    return El("article", child);
}
function P(child = Empty()) {
    return El("p", child);
}
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
function Option(child = Empty()) {
    return new Tag("option", child);
}
function H1(child = Empty()) {
    return new Tag("h1", child);
}
function H2(child = Empty()) {
    return new Tag("h2", child);
}
function H3(child = Empty()) {
    return new Tag("h3", child);
}
function H4(child = Empty()) {
    return new Tag("h4", child);
}
function Span(child = Empty()) {
    return new Tag("span", child);
}
function Ul(child = Empty()) {
    return new Tag("ul", child);
}
function Ol(child = Empty()) {
    return new Tag("ol", child);
}
function Li(child = Empty()) {
    return new Tag("li", child);
}
function Table(child = Empty()) {
    return new Tag("table", child);
}
function Thead(child = Empty()) {
    return new Tag("thead", child);
}
function Tbody(child = Empty()) {
    return new Tag("tbody", child);
}
function Tr(child = Empty()) {
    return new Tag("tr", child);
}
function Th(child = Empty()) {
    return new Tag("th", child);
}
function Td(child = Empty()) {
    return new Tag("td", child);
}
function Hr(child = Empty()) {
    return new Tag("hr", child);
}
function Overlay(content, overlay, position = 'center') {
    return Div([
        content,
        Div(overlay)
            .setStyle(`position: absolute; ${positionStyles[position]}`),
    ])
        .setStyle("position: relative");
}
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
function IfThen(condition, then) {
    return IfThenElse(condition, then, Empty);
}
function SwitchCase(cases, defaultView = Empty) {
    for (const caseItem of cases) {
        if (caseItem.condition) {
            return caseItem.component();
        }
    }
    return defaultView();
}
function ForEach(views, renderItem) {
    return Array.from(views).map(renderItem);
    //           ^^^^^^^^^^^ NOTE: - This creates a shallow copy even when the argument is already an array
}
function ForEach1(views, renderItem) {
    return Array.from(views).map(renderItem);
    //           ^^^^^^^^^^^ NOTE: - This creates a shallow copy even when the argument is already an array
}
function ForEach2(high, renderItem) {
    return Array.from(range(0, high)).map((index) => renderItem(index));
}
function ForEach3(low, high, renderItem) {
    return Array.from(range(low, high)).map((index) => renderItem(index));
}
function* range(low, high) {
    for (var i = low; i < high; i++) {
        yield i;
    }
}
function Repeat(times, content) {
    return ForEach(range(0, times), content);
}
// render
function render(view) {
    return renderImpl(view);
}
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
        const push = htmx.pushUrl ? `hx-push-url="${htmx.pushUrl}"` : null;
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
function DivOld(props) {
    return ElOld("div", props);
}
/**
 * @deprecated Use strings directly instead.
 */
function Text(text = "") {
    return text;
}
/**
 * @deprecated Use an array directly instead.
 */
function VStack(views) {
    return views;
}
function InputOld(props) {
    return ElOld("input", props);
}
function TextareaOld(props) {
    return ElOld("textarea", props);
}
function POld(props) {
    return ElOld("p", props);
}
function ButtonOld(props) {
    return ElOld("button", props);
}
function LabelOld(props) {
    return ElOld("label", props);
}
function H1Old(props) {
    return ElOld("h1", props);
}
function H2Old(props) {
    return ElOld("h2", props);
}
function H3Old(props) {
    return ElOld("h3", props);
}
function H4Old(props) {
    return ElOld("h4", props);
}
function SpanOld(props) {
    return ElOld("span", props);
}
function AOld(props) {
    return ElOld("a", props);
}
function UlOld(props) {
    return ElOld("ul", props);
}
function OlOld(props) {
    return ElOld("ol", props);
}
function LiOld(props) {
    return ElOld("li", props);
}
function FormOld(props) {
    return ElOld("form", props);
}
function ImgOld(props) {
    return ElOld("img", props);
}
function SelectOld(props) {
    return ElOld("select", props);
}
function TableOld(props) {
    return ElOld("table", props);
}
function TheadOld(props) {
    return ElOld("thead", props);
}
function TbodyOld(props) {
    return ElOld("tbody", props);
}
function TrOld(props) {
    return ElOld("tr", props);
}
function ThOld(props) {
    return ElOld("th", props);
}
function TdOld(props) {
    return ElOld("td", props);
}
function HrOld(props) {
    return ElOld("hr", props);
}
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
//# sourceMappingURL=builder.js.map