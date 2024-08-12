"use strict";
// ------------------------------------
// Html Builder "Framework"
// ------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.Td = exports.Tbody = exports.Th = exports.Tr = exports.Thead = exports.Table = exports.Overlay = exports.FadeIn = exports.Lazy = exports.HStack = exports.VStackDiv = exports.VStack = exports.Repeat = exports.MapJoin2 = exports.MapJoin1 = exports.MapJoin = exports.SwitchCase = exports.IfThen = exports.IfThenElse = exports.Empty = exports.Text = exports.Select = exports.P = exports.Img = exports.Form = exports.Li = exports.Ul = exports.A = exports.Span = exports.H4 = exports.H3 = exports.H2 = exports.H1 = exports.Label = exports.Textarea = exports.Input = exports.Button = exports.Div = exports.El = exports.render = exports.id = void 0;
function id(val) {
    return val;
}
exports.id = id;
function render(html) {
    return html();
}
exports.render = render;
// The most basic building block of the framework.
function El({ el, id = undefined, class: className = undefined, htmx = undefined, attributes = undefined, child = undefined, style = undefined, toggles = undefined, } = {}) {
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
    // Design impl. note: this is the only place the whole framework where html is generated.
    // No visitors or similar.
    return () => {
        const renderedChild = child ? child() : "";
        const baseAttrs = Object.assign({ id, class: className }, attributes);
        const renderedAttributes = buildAttributes(baseAttrs);
        const renderedHtmx = buildHtmx(htmx);
        const renderedToggles = toggles ? toggles.join(" ") : " ";
        const renderedStyle = style ? 'style="' + style + '" ' : " ";
        var renderedAttributesAndToggles = "";
        renderedAttributesAndToggles += renderedAttributes;
        renderedAttributesAndToggles += renderedStyle;
        renderedAttributesAndToggles += renderedHtmx;
        renderedAttributesAndToggles += renderedToggles;
        var renderedEl = "<";
        renderedEl += el;
        renderedEl += " ";
        renderedEl += renderedAttributesAndToggles;
        renderedEl += ">";
        renderedEl += renderedChild;
        renderedEl += "</";
        renderedEl += el;
        renderedEl += ">";
        return renderedEl;
    };
}
exports.El = El;
function Div({ id = undefined, class: className = undefined, htmx = undefined, style = undefined, attributes = undefined, child = undefined } = {}) {
    return El({
        el: "div",
        id,
        class: className,
        htmx,
        style,
        attributes,
        child
    });
}
exports.Div = Div;
function Button({ id = undefined, class: className = undefined, htmx = undefined, style = undefined, type = "button", attributes = undefined, child = undefined, } = {}) {
    const buttonAttributes = Object.assign(Object.assign({}, attributes), { type });
    return El({
        el: "button",
        id,
        class: className,
        htmx,
        style,
        attributes: buttonAttributes,
        child
    });
}
exports.Button = Button;
// @TODO: - Add `style` to the rest of combinators.
function Input({ id = undefined, class: className = undefined, htmx = undefined, style = undefined, type = undefined, placeholder = undefined, name = undefined, attributes = undefined, child = undefined, } = {}) {
    const inputAttributes = Object.assign({ type,
        placeholder,
        name }, attributes);
    return El({
        el: "input",
        id,
        class: className,
        htmx,
        style,
        attributes: inputAttributes,
        // toggles: ["required"],
        child,
    });
}
exports.Input = Input;
function Textarea({ id = undefined, class: className = undefined, htmx = undefined, placeholder = undefined, name = undefined, rows = undefined, cols = undefined, attributes = undefined, child = undefined, } = {}) {
    const textareaAttributes = Object.assign({ placeholder,
        name, rows: rows.toString(), cols: cols.toString() }, attributes);
    return El({
        el: "textarea",
        id,
        class: className,
        htmx,
        attributes: textareaAttributes,
        toggles: ["required"],
        child
    });
}
exports.Textarea = Textarea;
function Label({ id = undefined, class: className = undefined, htmx = undefined, attributes = undefined, child = undefined, } = {}) {
    return El({
        el: "label",
        id,
        class: className,
        htmx,
        attributes,
        child
    });
}
exports.Label = Label;
function H1({ id = undefined, class: className = undefined, htmx = undefined, attributes = undefined, child = undefined, } = {}) {
    return El({
        el: "h1",
        id,
        class: className,
        htmx,
        attributes,
        child
    });
}
exports.H1 = H1;
function H2({ id = undefined, class: className = undefined, htmx = undefined, attributes = undefined, child = undefined, } = {}) {
    return El({
        el: "h2",
        id,
        class: className,
        htmx,
        attributes,
        child
    });
}
exports.H2 = H2;
function H3({ id = undefined, class: className = undefined, htmx = undefined, attributes = undefined, child = undefined, } = {}) {
    return El({
        el: "h3",
        id,
        class: className,
        htmx,
        attributes,
        child
    });
}
exports.H3 = H3;
function H4({ id = undefined, class: className = undefined, htmx = undefined, attributes = undefined, child = undefined, } = {}) {
    return El({
        el: "h4",
        id,
        class: className,
        htmx,
        attributes,
        child
    });
}
exports.H4 = H4;
function Span({ id = undefined, class: className = undefined, htmx = undefined, attributes = undefined, child = undefined, } = {}) {
    return El({
        el: "span",
        id,
        class: className,
        htmx,
        attributes,
        child
    });
}
exports.Span = Span;
function A({ id = undefined, class: className = undefined, htmx = undefined, href = "", attributes = undefined, child = undefined, } = {}) {
    const anchorAttributes = Object.assign({ href }, attributes);
    return El({
        el: "a",
        id,
        class: className,
        htmx,
        attributes: anchorAttributes,
        child
    });
}
exports.A = A;
function Ul({ id = undefined, class: className = undefined, htmx = undefined, attributes = undefined, child = undefined, } = {}) {
    return El({
        el: "ul",
        id,
        class: className,
        htmx,
        attributes,
        child
    });
}
exports.Ul = Ul;
function Li({ id = undefined, class: className = undefined, htmx = undefined, attributes = undefined, child = undefined, } = {}) {
    return El({
        el: "li",
        id,
        class: className,
        htmx,
        attributes,
        child
    });
}
exports.Li = Li;
function Form({ id = undefined, class: className = undefined, htmx = undefined, action = undefined, method = undefined, attributes = undefined, child = undefined, } = {}) {
    const formAttributes = Object.assign({ action,
        method }, attributes);
    return El({
        el: "form",
        id,
        class: className,
        htmx,
        attributes: formAttributes,
        child
    });
}
exports.Form = Form;
function Img({ id = undefined, class: className = undefined, htmx = undefined, src = undefined, alt = undefined, style = undefined, attributes = undefined, child = undefined, } = {}) {
    const imgAttributes = Object.assign({ src,
        alt }, attributes);
    return El({
        el: "img",
        id,
        class: className,
        htmx,
        style,
        attributes: imgAttributes,
        child
    });
}
exports.Img = Img;
function P({ id = undefined, class: className = undefined, htmx = undefined, attributes = undefined, child = undefined, } = {}) {
    return El({
        el: "p",
        id,
        class: className,
        htmx,
        attributes,
        child
    });
}
exports.P = P;
function Select({ id = undefined, class: className = undefined, htmx = undefined, name = undefined, options = [], attributes = undefined, } = {}) {
    return El({
        el: "select",
        id,
        class: className,
        htmx,
        attributes: Object.assign(Object.assign({}, attributes), { name }),
        child: MapJoin(options, option => El({
            el: "option",
            attributes: { "value": option.value, },
            child: Text(option.text),
            toggles: option.selected ? ["selected"] : undefined,
        }))
    });
}
exports.Select = Select;
// @TODO: - Think about a way to automatically lift strings.
// Probably possible to do with JS's weak typing, but might not be worth it.
function Text(text = "") {
    return () => text;
}
exports.Text = Text;
function Empty() {
    return Text();
}
exports.Empty = Empty;
// @TODO: - This building block could be implemented in two ways:
// 1.
//    ```typescript
//    function IfThenElse(
//      condition: Thunk<boolean>, 
//      thenView: Thunk<HTML>, 
//      elseView: Thunk<HTML>
//    ): HTML {
//      return condition() ? thenView() : elseView();
//    }
//    ```
// 2.
//    ```typescript
//    function IfThenElse(
//      condition: boolean, 
//      thenView: Thunk<HTML>, 
//      elseView: Thunk<HTML>
//    ): HTML {
//      return condition ? thenView() : elseView();
//    }
//
// Though the difference is subtle, the semantics between twe two differ.
// The latter expression evaluates `condition` eagerly whereas in the former
// the compuation of `condition` is delayed. If evaluating `condition` causes
// side-effects, the semantics might matter.
function IfThenElse(condition, thenView, elseView) {
    return condition ? thenView() : elseView();
}
exports.IfThenElse = IfThenElse;
function IfThen(condition, content) {
    return condition ? content() : Empty();
}
exports.IfThen = IfThen;
function SwitchCase(cases, defaultComponent = Empty) {
    return () => {
        for (const caseItem of cases) {
            if (caseItem.condition()) {
                return caseItem.component();
            }
        }
        return defaultComponent()();
    };
}
exports.SwitchCase = SwitchCase;
function MapJoin(items, renderItem) {
    return () => Array.from(items).map(item => renderItem(item)()).join("\n");
    //                 ^^^^^^^^^^ NOTE: - This creates a shallow copy even when the argument is already an array
}
exports.MapJoin = MapJoin;
function MapJoin1(items, renderItem) {
    return () => Array.from(items).map((item, index) => renderItem(item, index)()).join("\n");
    //                 ^^^^^^^^^^ NOTE: - This creates a shallow copy even when the argument is already an array
    // return () => items.map((item, index) => renderItem(item, index)()).join("\n");
}
exports.MapJoin1 = MapJoin1;
function MapJoin2(n, renderItem) {
    return () => Array.from(range(0, n)).map((index) => renderItem(index)()).join("\n");
    //                 ^^^^^^^^^^ NOTE: - This creates a shallow copy even when the argument is already an array
}
exports.MapJoin2 = MapJoin2;
function* range(low, high) {
    for (var i = low; i < high; i++) {
        yield i;
    }
}
function Repeat(times, content) {
    return MapJoin(range(0, times), content);
}
exports.Repeat = Repeat;
function VStack(children = []) {
    return MapJoin(children, id);
}
exports.VStack = VStack;
function VStackDiv(children, { id = undefined, class: className = undefined, htmx = undefined, style = undefined, attributes = undefined, } = {}) {
    return El({
        el: "div",
        id,
        class: className,
        htmx,
        style,
        attributes,
        child: VStack(children)
    });
}
exports.VStackDiv = VStackDiv;
// @TODO: - Make it the same as other Elements (all things should be configurable)
function HStack({ id = undefined, class: className = undefined, htmx = undefined, style = undefined, attributes = undefined, } = {}, children = []) {
    // @NOTE: - Use `style` if you don't use tailwind
    const cls = `flex ${(className === undefined) ? "" : className}`;
    return Div({
        id,
        htmx,
        style,
        attributes,
        class: cls,
        child: MapJoin(children, child => child)
    });
    // return () => `<div class="${clss}" style="display: flex;">${children.map(child => `<div>${child()}</div>`).join("")}</div>`;
}
exports.HStack = HStack;
function Lazy(loadComponent) {
    let cachedComponent = null;
    return () => {
        if (!cachedComponent) {
            cachedComponent = loadComponent();
        }
        return cachedComponent();
    };
}
exports.Lazy = Lazy;
function FadeIn({ id = undefined, class: className = undefined, htmx = undefined, attributes = undefined, style = undefined, child = undefined, } = {}) {
    return Div({
        id,
        class: `fade-in-05s ${className}`,
        htmx,
        attributes,
        style,
        child
    });
}
exports.FadeIn = FadeIn;
function Overlay(content, overlay, position = 'center') {
    return Div({
        style: "position: relative",
        child: VStack([
            content,
            Div({
                style: `position: absolute; ${positionStyles[position]}`,
                child: overlay
            })
        ])
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
function Table({ id = undefined, class: className = undefined, htmx = undefined, style = undefined, attributes = undefined, child = undefined } = {}) {
    return El({
        el: "table",
        id,
        class: className,
        htmx,
        style,
        attributes,
        child
    });
}
exports.Table = Table;
function Thead({ id = undefined, class: className = undefined, htmx = undefined, style = undefined, attributes = undefined, child = undefined } = {}) {
    return El({
        el: "thead",
        id,
        class: className,
        htmx,
        style,
        attributes,
        child
    });
}
exports.Thead = Thead;
function Tr({ id = undefined, class: className = undefined, htmx = undefined, style = undefined, attributes = undefined, child = undefined } = {}) {
    return El({
        el: "tr",
        id,
        class: className,
        htmx,
        style,
        attributes,
        child
    });
}
exports.Tr = Tr;
function Th({ id = undefined, class: className = undefined, htmx = undefined, style = undefined, attributes = undefined, child = undefined } = {}) {
    return El({
        el: "th",
        id,
        class: className,
        htmx,
        style,
        attributes,
        child
    });
}
exports.Th = Th;
function Tbody({ id = undefined, class: className = undefined, htmx = undefined, style = undefined, attributes = undefined, child = undefined } = {}) {
    return El({
        el: "tbody",
        id,
        class: className,
        htmx,
        style,
        attributes,
        child
    });
}
exports.Tbody = Tbody;
function Td({ id = undefined, class: className = undefined, htmx = undefined, style = undefined, attributes = undefined, child = undefined } = {}) {
    return El({
        el: "td",
        id,
        class: className,
        htmx,
        style,
        attributes,
        child
    });
}
exports.Td = Td;
