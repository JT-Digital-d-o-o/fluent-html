"use strict";
// ------------------------------------
// Html Builder "Framework"
// ------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.Img1 = exports.Form1 = exports.A1 = exports.Label1 = exports.Button1 = exports.Textarea1 = exports.Input1 = exports.P1 = exports.Div1 = exports.El1 = exports.render = exports.Repeat = exports.ForEach2 = exports.ForEach1 = exports.ForEach = exports.SwitchCase = exports.IfThen = exports.IfThenElse = exports.Overlay1 = exports.Overlay = exports.Hr = exports.Td = exports.Th = exports.Tr = exports.Tbody = exports.Thead = exports.Table = exports.Select = exports.Img = exports.Form = exports.Li = exports.Ol = exports.Ul = exports.A = exports.Span = exports.H4 = exports.H3 = exports.H2 = exports.H1 = exports.Label = exports.Button = exports.P = exports.Textarea = exports.Input = exports.HStack = exports.VStack = exports.Empty = exports.Text = exports.Div = exports.El = void 0;
exports.Hr1 = exports.Td1 = exports.Th1 = exports.Tr1 = exports.Tbody1 = exports.Thead1 = exports.Table1 = exports.Li1 = exports.Ol1 = exports.Ul1 = exports.Span1 = exports.H41 = exports.H31 = exports.H21 = exports.H11 = exports.Select1 = void 0;
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
    setClass(className) {
        this.class = className;
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
}
function El(el, props) {
    const element = new Tag(el);
    if (props) {
        Object.assign(element, props);
    }
    return element;
}
exports.El = El;
function Div(props) {
    return El("div", props);
}
exports.Div = Div;
/**
 * @deprecated Use strings directly instead.
 */
function Text(text = "") {
    return text;
}
exports.Text = Text;
function Empty() {
    return "";
}
exports.Empty = Empty;
/**
 * @deprecated Use an array directly instead.
 */
function VStack(views) {
    return views;
}
exports.VStack = VStack;
function HStack(props) {
    const flex = `flex ${(props.class === undefined) ? "" : props.class}`;
    if (props) {
        props.class = flex;
    }
    else {
        props = { class: flex };
    }
    return Div(props);
}
exports.HStack = HStack;
function Input(props) {
    return El("input", props);
}
exports.Input = Input;
function Textarea(props) {
    return El("textarea", props);
}
exports.Textarea = Textarea;
function P(props) {
    return El("p", props);
}
exports.P = P;
function Button(props) {
    return El("button", props);
}
exports.Button = Button;
function Label(props) {
    return El("label", props);
}
exports.Label = Label;
function H1(props) {
    return El("h1", props);
}
exports.H1 = H1;
function H2(props) {
    return El("h2", props);
}
exports.H2 = H2;
function H3(props) {
    return El("h3", props);
}
exports.H3 = H3;
function H4(props) {
    return El("h4", props);
}
exports.H4 = H4;
function Span(props) {
    return El("span", props);
}
exports.Span = Span;
function A(props) {
    return El("a", props);
}
exports.A = A;
function Ul(props) {
    return El("ul", props);
}
exports.Ul = Ul;
function Ol(props) {
    return El("ol", props);
}
exports.Ol = Ol;
function Li(props) {
    return El("li", props);
}
exports.Li = Li;
function Form(props) {
    return El("form", props);
}
exports.Form = Form;
function Img(props) {
    return El("img", props);
}
exports.Img = Img;
function Select(props) {
    return El("select", props);
}
exports.Select = Select;
function Table(props) {
    return El("table", props);
}
exports.Table = Table;
function Thead(props) {
    return El("thead", props);
}
exports.Thead = Thead;
function Tbody(props) {
    return El("tbody", props);
}
exports.Tbody = Tbody;
function Tr(props) {
    return El("tr", props);
}
exports.Tr = Tr;
function Th(props) {
    return El("th", props);
}
exports.Th = Th;
function Td(props) {
    return El("td", props);
}
exports.Td = Td;
function Hr(props) {
    return El("hr", props);
}
exports.Hr = Hr;
function Overlay(content, overlay, position = 'center') {
    return Div({
        style: "position: relative",
        child: [
            content,
            Div({
                style: `position: absolute; ${positionStyles[position]}`,
                child: overlay
            })
        ]
    });
}
exports.Overlay = Overlay;
function Overlay1(content, overlay, position = 'center') {
    return Div1([
        content,
        Div1(overlay)
            .setStyle(`position: absolute; ${positionStyles[position]}`),
    ])
        .setStyle("position: relative");
}
exports.Overlay1 = Overlay1;
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
function ForEach2(n, renderItem) {
    return Array.from(range(0, n)).map((index) => renderItem(index));
    //           ^^^^^^^^^^^^^^^^^ NOTE: - This creates a shallow copy even when the argument is already an array
}
exports.ForEach2 = ForEach2;
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
// new syntax
function El1(el, child = Empty()) {
    return new Tag(el, child);
}
exports.El1 = El1;
function Div1(child = Empty()) {
    return El1("div", child);
}
exports.Div1 = Div1;
function P1(child = Empty()) {
    return El1("p", child);
}
exports.P1 = P1;
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
}
;
function Input1(child = Empty()) {
    return new InputTag("input", child);
}
exports.Input1 = Input1;
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
;
function Textarea1(child = Empty()) {
    return new TextareaTag("textarea", child);
}
exports.Textarea1 = Textarea1;
class ButtonTag extends Tag {
    setType(type) {
        this.type = type;
        return this;
    }
}
;
function Button1(child = Empty()) {
    return new ButtonTag("button", child);
}
exports.Button1 = Button1;
class LabelTag extends Tag {
    setFor(forId) {
        this.for = forId;
        return this;
    }
}
;
function Label1(child = Empty()) {
    return new LabelTag("label", child);
}
exports.Label1 = Label1;
class AnchorTag extends Tag {
    setHref(href) {
        this.href = href;
        return this;
    }
}
;
function A1(child = Empty()) {
    return new AnchorTag("a", child);
}
exports.A1 = A1;
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
;
function Form1(child = Empty()) {
    return new FormTag("form", child);
}
exports.Form1 = Form1;
class ImgTag extends Tag {
    setSrc(src) {
        this.src = src;
        return this;
    }
    set(alt) {
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
;
function Img1(child = Empty()) {
    return new ImgTag("img", child);
}
exports.Img1 = Img1;
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
;
function Select1(child = Empty()) {
    return new SelectTag("select", child);
}
exports.Select1 = Select1;
function H11(child = Empty()) {
    return new Tag("h1", child);
}
exports.H11 = H11;
function H21(child = Empty()) {
    return new Tag("h2", child);
}
exports.H21 = H21;
function H31(child = Empty()) {
    return new Tag("h3", child);
}
exports.H31 = H31;
function H41(child = Empty()) {
    return new Tag("h4", child);
}
exports.H41 = H41;
function Span1(child = Empty()) {
    return new Tag("span", child);
}
exports.Span1 = Span1;
function Ul1(child = Empty()) {
    return new Tag("ul", child);
}
exports.Ul1 = Ul1;
function Ol1(child = Empty()) {
    return new Tag("ol", child);
}
exports.Ol1 = Ol1;
function Li1(child = Empty()) {
    return new Tag("li", child);
}
exports.Li1 = Li1;
function Table1(child = Empty()) {
    return new Tag("table", child);
}
exports.Table1 = Table1;
function Thead1(child = Empty()) {
    return new Tag("thead", child);
}
exports.Thead1 = Thead1;
function Tbody1(child = Empty()) {
    return new Tag("tbody", child);
}
exports.Tbody1 = Tbody1;
function Tr1(child = Empty()) {
    return new Tag("tr", child);
}
exports.Tr1 = Tr1;
function Th1(child = Empty()) {
    return new Tag("th", child);
}
exports.Th1 = Th1;
function Td1(child = Empty()) {
    return new Tag("td", child);
}
exports.Td1 = Td1;
function Hr1(child = Empty()) {
    return new Tag("hr", child);
}
exports.Hr1 = Hr1;
// export function HStack1(children: View = Empty()): View {
//   const flex = `flex ${(props.class === undefined) ? "" : props.class}`;
//   return Div1(children)
//     .setClass(flex);
// }
//# sourceMappingURL=builder.js.map