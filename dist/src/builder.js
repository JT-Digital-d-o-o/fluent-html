"use strict";
// ------------------------------------
// Html Builder "Framework"
// ------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoTag = exports.OptionTag = exports.SelectTag = exports.ImgTag = exports.FormTag = exports.AnchorTag = exports.LabelTag = exports.ButtonTag = exports.TextareaTag = exports.InputTag = exports.Tag = void 0;
exports.Empty = Empty;
exports.El = El;
exports.Div = Div;
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
exports.Video = Video;
exports.HTML = HTML;
exports.Head = Head;
exports.Body = Body;
exports.Template = Template;
exports.Script = Script;
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
    setAccept(accept) {
        this.accept = accept;
        return this;
    }
    setMin(min) {
        this.min = min;
        return this;
    }
    setMax(max) {
        this.max = max;
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
    setTarget(target) {
        this.target = target;
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
class OptionTag extends Tag {
    constructor() {
        super(...arguments);
        this.selected = false;
    }
    setValue(value) {
        this.value = value;
        return this;
    }
    setSelected(selected = true) {
        this.selected = selected;
        return this;
    }
}
exports.OptionTag = OptionTag;
function Option(child = Empty()) {
    return new OptionTag("option", child);
}
class VideoTag extends Tag {
    setWidth(width) {
        this.width = width;
        return this;
    }
    setHeight(height) {
        this.height = height;
        return this;
    }
    setControls(enabled = true) {
        this.controls = enabled;
        return this;
    }
    setSrc(src) {
        this.src = src;
        return this;
    }
}
exports.VideoTag = VideoTag;
function Video(child = Empty()) {
    return new VideoTag("video", child);
}
function HTML(child) {
    return El("html", child);
}
function Head(child) {
    return El("head", child);
}
function Body(child) {
    return El("body", child);
}
function Template() {
    return El("template");
}
function Script(js) {
    return El("script", js);
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
            .setStyle(`position: absolute; ${positionStyles[position]} z-index: 10`),
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
        const attributes = [];
        // Method and endpoint (required)
        attributes.push(`hx-${htmx.method}="${htmx.endpoint}"`);
        // Optional attributes
        if (htmx.target)
            attributes.push(`hx-target="${htmx.target}"`);
        if (htmx.trigger)
            attributes.push(`hx-trigger="${htmx.trigger}"`);
        if (htmx.swap)
            attributes.push(`hx-swap="${htmx.swap}"`);
        if (htmx.replaceUrl !== undefined)
            attributes.push(`hx-replace-url="${htmx.replaceUrl}"`);
        if (htmx.pushUrl !== undefined)
            attributes.push(`hx-push-url="${htmx.pushUrl}"`);
        if (htmx.encoding)
            attributes.push(`hx-encoding="${htmx.encoding}"`);
        if (htmx.validate !== undefined)
            attributes.push(`hx-validate="${htmx.validate}"`);
        if (htmx.vals)
            attributes.push(`hx-vals='${typeof htmx.vals === 'string' ? htmx.vals : JSON.stringify(htmx.vals)}'`);
        if (htmx.headers)
            attributes.push(`hx-headers='${JSON.stringify(htmx.headers)}'`);
        if (htmx.confirm)
            attributes.push(`hx-confirm="${htmx.confirm}"`);
        if (htmx.ext)
            attributes.push(`hx-ext="${htmx.ext}"`);
        if (htmx.include)
            attributes.push(`hx-include="${htmx.include}"`);
        if (htmx.indicator)
            attributes.push(`hx-indicator="${htmx.indicator}"`);
        if (htmx.params)
            attributes.push(`hx-params="${htmx.params}"`);
        if (htmx.select)
            attributes.push(`hx-select="${htmx.select}"`);
        if (htmx.selectOob)
            attributes.push(`hx-select-oob="${htmx.selectOob}"`);
        if (htmx.sync)
            attributes.push(`hx-sync="${htmx.sync}"`);
        return attributes.join(' ');
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
//# sourceMappingURL=builder.js.map