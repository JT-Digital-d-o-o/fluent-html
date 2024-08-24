"use strict";
// ------------------------------------
// Html Builder "Framework"
// ------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = exports.ForEach2 = exports.ForEach1 = exports.ForEach = exports.SwitchCase = exports.IfThenElse = exports.IfThen = exports.Td = exports.Th = exports.Tr = exports.Tbody = exports.Thead = exports.Table = exports.Overlay = exports.Repeat = exports.Select = exports.Img = exports.Form = exports.Li = exports.Ol = exports.Ul = exports.A = exports.Span = exports.H4 = exports.H3 = exports.H2 = exports.H1 = exports.Label = exports.Button = exports.P = exports.Textarea = exports.Input = exports.HStack = exports.VStack = exports.Empty = exports.Text = exports.Div = exports.El = exports.HtmlElement = void 0;
class HtmlElement {
    constructor(element) {
        this.el = element;
    }
}
exports.HtmlElement = HtmlElement;
function El(el, props) {
    const element = new HtmlElement(el);
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
function Repeat(times, content) {
    return ForEach(range(0, times), content);
}
exports.Repeat = Repeat;
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
// Control flow:
function IfThen(condition, then) {
    return condition
        ? then()
        : Empty();
}
exports.IfThen = IfThen;
function IfThenElse(condition, thenBranch, elseBranch) {
    return condition
        ? thenBranch()
        : elseBranch();
}
exports.IfThenElse = IfThenElse;
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
    //           ^^^^^^^^^^ NOTE: - This creates a shallow copy even when the argument is already an array
}
exports.ForEach = ForEach;
function ForEach1(views, renderItem) {
    return Array.from(views).map(renderItem);
    //           ^^^^^^^^^^ NOTE: - This creates a shallow copy even when the argument is already an array
}
exports.ForEach1 = ForEach1;
function ForEach2(n, renderItem) {
    return Array.from(range(0, n)).map((index) => renderItem(index));
    //                 ^^^^^^^^^^ NOTE: - This creates a shallow copy even when the argument is already an array
}
exports.ForEach2 = ForEach2;
function* range(low, high) {
    for (var i = low; i < high; i++) {
        yield i;
    }
}
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
    if (view instanceof HtmlElement) {
        const renderedChild = view.child ? render(view.child) : "";
        const baseAttrs = {};
        Object.assign(baseAttrs, view);
        baseAttrs.el = undefined;
        baseAttrs.htmx = undefined;
        baseAttrs.child = undefined;
        baseAttrs.toggles = undefined;
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
