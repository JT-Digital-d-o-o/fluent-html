"use strict";
// ------------------------------------
// Html Builder "Framework"
// ------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.P = exports.Textarea = exports.ForEach1 = exports.ForEach = exports.Input = exports.HStack = exports.VStack = exports.IfThenElse = exports.IfThen = exports.Empty = exports.Text = exports.Div = exports.El = exports.HtmlElement = exports.render = void 0;
// export function id<T>(val: T): T {
//   return val;
// }
// export type View = Thunk<string>;
function render(view) {
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
exports.render = render;
class HtmlElement {
    constructor(element) {
        this.el = element;
    }
}
exports.HtmlElement = HtmlElement;
// Factory functions for different types of elements
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
function Text(text = "") {
    return text;
}
exports.Text = Text;
function Empty() {
    return "";
}
exports.Empty = Empty;
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
function ForEach(views, renderItem) {
    return Array.from(views).map(renderItem);
}
exports.ForEach = ForEach;
function ForEach1(views, renderItem) {
    return Array.from(views).map(renderItem);
}
exports.ForEach1 = ForEach1;
function Textarea(props) {
    return El("textarea", props);
}
exports.Textarea = Textarea;
function P(props) {
    return El("p", props);
}
exports.P = P;
