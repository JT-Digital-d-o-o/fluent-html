"use strict";
// ------------------------------------
// Html Builder "Framework"
// ------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForEach3 = exports.ForEach2 = exports.ForEach1 = exports.SlotTag = exports.MeterTag = exports.ProgressTag = exports.DataTag = exports.TimeTag = exports.ScriptTag = exports.BaseTag = exports.StyleTag = exports.LinkTag = exports.MetaTag = exports.AreaTag = exports.MapTag = exports.AnchorTag = exports.EmbedTag = exports.ObjectTag = exports.IframeTag = exports.SvgTag = exports.CanvasTag = exports.TrackTag = exports.AudioTag = exports.VideoTag = exports.SourceTag = exports.ImgTag = exports.DialogTag = exports.DetailsTag = exports.OutputTag = exports.FieldsetTag = exports.OptgroupTag = exports.OptionTag = exports.SelectTag = exports.FormTag = exports.LabelTag = exports.ButtonTag = exports.TextareaTag = exports.InputTag = exports.ColTag = exports.ColgroupTag = exports.TdTag = exports.ThTag = exports.Tag = void 0;
exports.Empty = Empty;
exports.El = El;
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
exports.P = P;
exports.H1 = H1;
exports.H2 = H2;
exports.H3 = H3;
exports.H4 = H4;
exports.H5 = H5;
exports.H6 = H6;
exports.Span = Span;
exports.Blockquote = Blockquote;
exports.Pre = Pre;
exports.Code = Code;
exports.Hr = Hr;
exports.Br = Br;
exports.Wbr = Wbr;
exports.Strong = Strong;
exports.Em = Em;
exports.B = B;
exports.I = I;
exports.U = U;
exports.S = S;
exports.Mark = Mark;
exports.Small = Small;
exports.Sub = Sub;
exports.Sup = Sup;
exports.Abbr = Abbr;
exports.Cite = Cite;
exports.Q = Q;
exports.Dfn = Dfn;
exports.Kbd = Kbd;
exports.Samp = Samp;
exports.Var = Var;
exports.Bdi = Bdi;
exports.Bdo = Bdo;
exports.Ruby = Ruby;
exports.Rt = Rt;
exports.Rp = Rp;
exports.Ul = Ul;
exports.Ol = Ol;
exports.Li = Li;
exports.Dl = Dl;
exports.Dt = Dt;
exports.Dd = Dd;
exports.Menu = Menu;
exports.Table = Table;
exports.Thead = Thead;
exports.Tbody = Tbody;
exports.Tfoot = Tfoot;
exports.Tr = Tr;
exports.Th = Th;
exports.Td = Td;
exports.Caption = Caption;
exports.Colgroup = Colgroup;
exports.Col = Col;
exports.Input = Input;
exports.Textarea = Textarea;
exports.Button = Button;
exports.Label = Label;
exports.Form = Form;
exports.Select = Select;
exports.Option = Option;
exports.Optgroup = Optgroup;
exports.Datalist = Datalist;
exports.Fieldset = Fieldset;
exports.Legend = Legend;
exports.Output = Output;
exports.Details = Details;
exports.Summary = Summary;
exports.Dialog = Dialog;
exports.Img = Img;
exports.Picture = Picture;
exports.Source = Source;
exports.Video = Video;
exports.Audio = Audio;
exports.Track = Track;
exports.Canvas = Canvas;
exports.Svg = Svg;
exports.Path = Path;
exports.Circle = Circle;
exports.Rect = Rect;
exports.Line = Line;
exports.Polygon = Polygon;
exports.Polyline = Polyline;
exports.Ellipse = Ellipse;
exports.G = G;
exports.Defs = Defs;
exports.Use = Use;
exports.Text = Text;
exports.Tspan = Tspan;
exports.Iframe = Iframe;
exports.ObjectEl = ObjectEl;
exports.Embed = Embed;
exports.A = A;
exports.MapEl = MapEl;
exports.Area = Area;
exports.HTML = HTML;
exports.Head = Head;
exports.Body = Body;
exports.Title = Title;
exports.Meta = Meta;
exports.Link = Link;
exports.Style = Style;
exports.Base = Base;
exports.Noscript = Noscript;
exports.Template = Template;
exports.Script = Script;
exports.Time = Time;
exports.Data = Data;
exports.Progress = Progress;
exports.Meter = Meter;
exports.Slot = Slot;
exports.Overlay = Overlay;
exports.IfThenElse = IfThenElse;
exports.IfThen = IfThen;
exports.SwitchCase = SwitchCase;
exports.ForEach = ForEach;
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
        this.style = style;
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
    /**
     * Set multiple CSS classes, filtering out falsy values.
     *
     * @param classes - Array of class names (falsy values are filtered out)
     * @returns this (for chaining)
     *
     * @example
     * Button("Save").setClasses([
     *   "btn",
     *   props.disabled && "btn-disabled",
     *   props.variant === "primary" ? "btn-primary" : "btn-secondary"
     * ])
     */
    setClasses(classes) {
        this.class = classes.filter(Boolean).join(" ");
        return this;
    }
    /**
     * Set multiple inline styles from an object.
     *
     * @param styles - Object mapping CSS property names to values
     * @returns this (for chaining)
     *
     * @example
     * Div().setStyles({
     *   width: "100px",
     *   height: "50px",
     *   backgroundColor: "blue"
     * })
     */
    setStyles(styles) {
        const styleString = Object.entries(styles)
            .map(([key, value]) => {
            // Convert camelCase to kebab-case
            const kebabKey = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
            return `${kebabKey}: ${value}`;
        })
            .join("; ");
        this.style = styleString;
        return this;
    }
    /**
     * Set multiple data-* attributes at once.
     *
     * @param attrs - Object mapping data attribute names (without 'data-' prefix) to values
     * @returns this (for chaining)
     *
     * @example
     * Button("Click").setDataAttrs({
     *   testid: "submit-btn",
     *   action: "save",
     *   userId: "123"
     * })
     * // Renders: <button data-testid="submit-btn" data-action="save" data-user-id="123">
     */
    setDataAttrs(attrs) {
        for (const [key, value] of Object.entries(attrs)) {
            // Convert camelCase to kebab-case
            const kebabKey = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
            this.attributes[`data-${kebabKey}`] = value;
        }
        return this;
    }
    /**
     * Set ARIA attributes for accessibility.
     *
     * @param attrs - Object with ARIA attribute names (without 'aria-' prefix)
     * @returns this (for chaining)
     *
     * @example
     * Button("Menu").setAria({
     *   label: "Open menu",
     *   expanded: "false",
     *   controls: "menu-panel"
     * })
     */
    setAria(attrs) {
        for (const [key, value] of Object.entries(attrs)) {
            // Convert camelCase to kebab-case
            const kebabKey = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
            this.attributes[`aria-${kebabKey}`] = String(value);
        }
        return this;
    }
    padding(directionOrValue, value) {
        if (value === undefined) {
            // Single parameter: all sides
            return this.addClass(`p-${directionOrValue}`);
        }
        else {
            // Two parameters: direction + value
            const dirMap = {
                x: "x", y: "y",
                top: "t", bottom: "b", left: "l", right: "r",
                t: "t", b: "b", l: "l", r: "r"
            };
            const dir = dirMap[directionOrValue] || directionOrValue;
            return this.addClass(`p${dir}-${value}`);
        }
    }
    margin(directionOrValue, value) {
        if (value === undefined) {
            return this.addClass(`m-${directionOrValue}`);
        }
        else {
            const dirMap = {
                x: "x", y: "y",
                top: "t", bottom: "b", left: "l", right: "r",
                t: "t", b: "b", l: "l", r: "r"
            };
            const dir = dirMap[directionOrValue] || directionOrValue;
            return this.addClass(`m${dir}-${value}`);
        }
    }
    /**
     * Add background color with Tailwind classes.
     *
     * @example
     * Div().background("red-500")        // bg-red-500
     * Div().background("blue-100")       // bg-blue-100
     */
    background(color) {
        return this.addClass(`bg-${color}`);
    }
    /**
     * Add text color with Tailwind classes.
     *
     * @example
     * Span().textColor("gray-700")       // text-gray-700
     * Span().textColor("white")          // text-white
     */
    textColor(color) {
        return this.addClass(`text-${color}`);
    }
    /**
     * Add text size with Tailwind classes.
     *
     * @example
     * Span().textSize("xl")              // text-xl
     * Span().textSize("sm")              // text-sm
     */
    textSize(size) {
        return this.addClass(`text-${size}`);
    }
    /**
     * Add text alignment with Tailwind classes.
     *
     * @example
     * P().textAlign("center")            // text-center
     * P().textAlign("right")             // text-right
     */
    textAlign(align) {
        return this.addClass(`text-${align}`);
    }
    /**
     * Add font weight with Tailwind classes.
     *
     * @example
     * Span().fontWeight("bold")          // font-bold
     * Span().fontWeight("semibold")      // font-semibold
     */
    fontWeight(weight) {
        return this.addClass(`font-${weight}`);
    }
    /**
     * Add width with Tailwind classes.
     *
     * @example
     * Div().w("full")                    // w-full
     * Div().w("1/2")                     // w-1/2
     * Div().w("64")                      // w-64
     */
    w(value) {
        return this.addClass(`w-${value}`);
    }
    /**
     * Add height with Tailwind classes.
     *
     * @example
     * Div().h("screen")                  // h-screen
     * Div().h("64")                      // h-64
     */
    h(value) {
        return this.addClass(`h-${value}`);
    }
    /**
     * Add max-width with Tailwind classes.
     *
     * @example
     * Div().maxW("md")                   // max-w-md
     * Div().maxW("prose")                // max-w-prose
     */
    maxW(value) {
        return this.addClass(`max-w-${value}`);
    }
    /**
     * Add min-width with Tailwind classes.
     *
     * @example
     * Div().minW("0")                    // min-w-0
     * Div().minW("full")                 // min-w-full
     */
    minW(value) {
        return this.addClass(`min-w-${value}`);
    }
    /**
     * Add max-height with Tailwind classes.
     *
     * @example
     * Div().maxH("screen")               // max-h-screen
     * Div().maxH("96")                   // max-h-96
     */
    maxH(value) {
        return this.addClass(`max-h-${value}`);
    }
    /**
     * Add min-height with Tailwind classes.
     *
     * @example
     * Div().minH("screen")               // min-h-screen
     * Div().minH("0")                    // min-h-0
     */
    minH(value) {
        return this.addClass(`min-h-${value}`);
    }
    /**
     * Add flex display with Tailwind classes.
     *
     * @example
     * Div().flex()                       // flex
     * Div().flex("1")                    // flex-1
     */
    flex(value) {
        if (value === undefined) {
            return this.addClass("flex");
        }
        return this.addClass(`flex-${value}`);
    }
    /**
     * Add flex direction with Tailwind classes.
     *
     * @example
     * Div().flexDirection("col")         // flex-col
     * Div().flexDirection("row-reverse") // flex-row-reverse
     */
    flexDirection(direction) {
        return this.addClass(`flex-${direction}`);
    }
    /**
     * Add justify-content with Tailwind classes.
     *
     * @example
     * Div().justifyContent("center")     // justify-center
     * Div().justifyContent("between")    // justify-between
     */
    justifyContent(justify) {
        return this.addClass(`justify-${justify}`);
    }
    /**
     * Add align-items with Tailwind classes.
     *
     * @example
     * Div().alignItems("center")         // items-center
     * Div().alignItems("start")          // items-start
     */
    alignItems(align) {
        return this.addClass(`items-${align}`);
    }
    gap(directionOrValue, value) {
        if (value === undefined) {
            return this.addClass(`gap-${directionOrValue}`);
        }
        return this.addClass(`gap-${directionOrValue}-${value}`);
    }
    /**
     * Add grid display with Tailwind classes.
     *
     * @example
     * Div().grid()                       // grid
     */
    grid() {
        return this.addClass("grid");
    }
    /**
     * Add grid columns with Tailwind classes.
     *
     * @example
     * Div().gridCols("3")                // grid-cols-3
     * Div().gridCols("1fr-2fr")          // grid-cols-1fr-2fr
     */
    gridCols(cols) {
        return this.addClass(`grid-cols-${cols}`);
    }
    /**
     * Add grid rows with Tailwind classes.
     *
     * @example
     * Div().gridRows("2")                // grid-rows-2
     */
    gridRows(rows) {
        return this.addClass(`grid-rows-${rows}`);
    }
    /**
     * Add border with Tailwind classes.
     *
     * @example
     * Div().border()                     // border
     * Div().border("2")                  // border-2
     */
    border(value) {
        if (value === undefined) {
            return this.addClass("border");
        }
        return this.addClass(`border-${value}`);
    }
    /**
     * Add border color with Tailwind classes.
     *
     * @example
     * Div().borderColor("gray-300")      // border-gray-300
     */
    borderColor(color) {
        return this.addClass(`border-${color}`);
    }
    /**
     * Add border radius with Tailwind classes.
     *
     * @example
     * Div().rounded()                    // rounded
     * Div().rounded("full")              // rounded-full
     * Div().rounded("lg")                // rounded-lg
     */
    rounded(value) {
        if (value === undefined) {
            return this.addClass("rounded");
        }
        return this.addClass(`rounded-${value}`);
    }
    /**
     * Add shadow with Tailwind classes.
     *
     * @example
     * Div().shadow()                     // shadow
     * Div().shadow("lg")                 // shadow-lg
     */
    shadow(value) {
        if (value === undefined) {
            return this.addClass("shadow");
        }
        return this.addClass(`shadow-${value}`);
    }
    /**
     * Add opacity with Tailwind classes.
     *
     * @example
     * Div().opacity("50")                // opacity-50
     */
    opacity(value) {
        return this.addClass(`opacity-${value}`);
    }
    /**
     * Add cursor with Tailwind classes.
     *
     * @example
     * Button().cursor("pointer")         // cursor-pointer
     */
    cursor(value) {
        return this.addClass(`cursor-${value}`);
    }
    /**
     * Add position with Tailwind classes.
     *
     * @example
     * Div().position("relative")         // relative
     * Div().position("absolute")         // absolute
     */
    position(value) {
        return this.addClass(value);
    }
    /**
     * Add z-index with Tailwind classes.
     *
     * @example
     * Div().zIndex("10")                 // z-10
     */
    zIndex(value) {
        return this.addClass(`z-${value}`);
    }
    overflow(directionOrValue, value) {
        if (value === undefined) {
            return this.addClass(`overflow-${directionOrValue}`);
        }
        return this.addClass(`overflow-${directionOrValue}-${value}`);
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
// ------------------------------------
// Structural / Semantic Elements
// ------------------------------------
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
function Nav(child = Empty()) {
    return El("nav", child);
}
function Aside(child = Empty()) {
    return El("aside", child);
}
function Figure(child = Empty()) {
    return El("figure", child);
}
function Figcaption(child = Empty()) {
    return El("figcaption", child);
}
function Address(child = Empty()) {
    return El("address", child);
}
function Hgroup(child = Empty()) {
    return El("hgroup", child);
}
function Search(child = Empty()) {
    return El("search", child);
}
// ------------------------------------
// Text Content
// ------------------------------------
function P(child = Empty()) {
    return El("p", child);
}
function H1(child = Empty()) {
    return El("h1", child);
}
function H2(child = Empty()) {
    return El("h2", child);
}
function H3(child = Empty()) {
    return El("h3", child);
}
function H4(child = Empty()) {
    return El("h4", child);
}
function H5(child = Empty()) {
    return El("h5", child);
}
function H6(child = Empty()) {
    return El("h6", child);
}
function Span(child = Empty()) {
    return El("span", child);
}
function Blockquote(child = Empty()) {
    return El("blockquote", child);
}
function Pre(child = Empty()) {
    return El("pre", child);
}
function Code(child = Empty()) {
    return El("code", child);
}
function Hr(child = Empty()) {
    return El("hr", child);
}
function Br() {
    return El("br");
}
function Wbr() {
    return El("wbr");
}
// ------------------------------------
// Inline Text Semantics
// ------------------------------------
function Strong(child = Empty()) {
    return El("strong", child);
}
function Em(child = Empty()) {
    return El("em", child);
}
function B(child = Empty()) {
    return El("b", child);
}
function I(child = Empty()) {
    return El("i", child);
}
function U(child = Empty()) {
    return El("u", child);
}
function S(child = Empty()) {
    return El("s", child);
}
function Mark(child = Empty()) {
    return El("mark", child);
}
function Small(child = Empty()) {
    return El("small", child);
}
function Sub(child = Empty()) {
    return El("sub", child);
}
function Sup(child = Empty()) {
    return El("sup", child);
}
function Abbr(child = Empty()) {
    return El("abbr", child);
}
function Cite(child = Empty()) {
    return El("cite", child);
}
function Q(child = Empty()) {
    return El("q", child);
}
function Dfn(child = Empty()) {
    return El("dfn", child);
}
function Kbd(child = Empty()) {
    return El("kbd", child);
}
function Samp(child = Empty()) {
    return El("samp", child);
}
function Var(child = Empty()) {
    return El("var", child);
}
function Bdi(child = Empty()) {
    return El("bdi", child);
}
function Bdo(child = Empty()) {
    return El("bdo", child);
}
function Ruby(child = Empty()) {
    return El("ruby", child);
}
function Rt(child = Empty()) {
    return El("rt", child);
}
function Rp(child = Empty()) {
    return El("rp", child);
}
// ------------------------------------
// Lists
// ------------------------------------
function Ul(child = Empty()) {
    return El("ul", child);
}
function Ol(child = Empty()) {
    return El("ol", child);
}
function Li(child = Empty()) {
    return El("li", child);
}
function Dl(child = Empty()) {
    return El("dl", child);
}
function Dt(child = Empty()) {
    return El("dt", child);
}
function Dd(child = Empty()) {
    return El("dd", child);
}
function Menu(child = Empty()) {
    return El("menu", child);
}
// ------------------------------------
// Tables
// ------------------------------------
function Table(child = Empty()) {
    return El("table", child);
}
function Thead(child = Empty()) {
    return El("thead", child);
}
function Tbody(child = Empty()) {
    return El("tbody", child);
}
function Tfoot(child = Empty()) {
    return El("tfoot", child);
}
function Tr(child = Empty()) {
    return El("tr", child);
}
class ThTag extends Tag {
    setColspan(colspan) {
        this.colspan = colspan;
        return this;
    }
    setRowspan(rowspan) {
        this.rowspan = rowspan;
        return this;
    }
    setScope(scope) {
        this.scope = scope;
        return this;
    }
}
exports.ThTag = ThTag;
function Th(child = Empty()) {
    return new ThTag("th", child);
}
class TdTag extends Tag {
    setColspan(colspan) {
        this.colspan = colspan;
        return this;
    }
    setRowspan(rowspan) {
        this.rowspan = rowspan;
        return this;
    }
}
exports.TdTag = TdTag;
function Td(child = Empty()) {
    return new TdTag("td", child);
}
function Caption(child = Empty()) {
    return El("caption", child);
}
class ColgroupTag extends Tag {
    setSpan(span) {
        this.span = span;
        return this;
    }
}
exports.ColgroupTag = ColgroupTag;
function Colgroup(child = Empty()) {
    return new ColgroupTag("colgroup", child);
}
class ColTag extends Tag {
    setSpan(span) {
        this.span = span;
        return this;
    }
}
exports.ColTag = ColTag;
function Col(child = Empty()) {
    return new ColTag("col", child);
}
// ------------------------------------
// Forms
// ------------------------------------
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
    setStep(step) {
        this.step = step;
        return this;
    }
    setPattern(pattern) {
        this.pattern = pattern;
        return this;
    }
    setMinlength(minlength) {
        this.minlength = minlength;
        return this;
    }
    setMaxlength(maxlength) {
        this.maxlength = maxlength;
        return this;
    }
    setAutocomplete(autocomplete) {
        this.autocomplete = autocomplete;
        return this;
    }
    setAutofocus(autofocus = true) {
        this.autofocus = autofocus;
        return this;
    }
    setChecked(checked = true) {
        this.checked = checked;
        return this;
    }
    setDisabled(disabled = true) {
        this.disabled = disabled;
        return this;
    }
    setReadonly(readonly = true) {
        this.readonly = readonly;
        return this;
    }
    setMultiple(multiple = true) {
        this.multiple = multiple;
        return this;
    }
    setList(list) {
        this.list = list;
        return this;
    }
}
exports.InputTag = InputTag;
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
    setMinlength(minlength) {
        this.minlength = minlength;
        return this;
    }
    setMaxlength(maxlength) {
        this.maxlength = maxlength;
        return this;
    }
    setWrap(wrap) {
        this.wrap = wrap;
        return this;
    }
    setAutocomplete(autocomplete) {
        this.autocomplete = autocomplete;
        return this;
    }
    setAutofocus(autofocus = true) {
        this.autofocus = autofocus;
        return this;
    }
    setDisabled(disabled = true) {
        this.disabled = disabled;
        return this;
    }
    setReadonly(readonly = true) {
        this.readonly = readonly;
        return this;
    }
}
exports.TextareaTag = TextareaTag;
function Textarea(child = Empty()) {
    return new TextareaTag("textarea", child);
}
class ButtonTag extends Tag {
    setType(type) {
        this.type = type;
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
    setDisabled(disabled = true) {
        this.disabled = disabled;
        return this;
    }
    setFormaction(formaction) {
        this.formaction = formaction;
        return this;
    }
    setFormmethod(formmethod) {
        this.formmethod = formmethod;
        return this;
    }
}
exports.ButtonTag = ButtonTag;
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
function Label(child = Empty()) {
    return new LabelTag("label", child);
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
    setEnctype(enctype) {
        this.enctype = enctype;
        return this;
    }
    setTarget(target) {
        this.target = target;
        return this;
    }
    setNovalidate(novalidate = true) {
        this.novalidate = novalidate;
        return this;
    }
    setAutocomplete(autocomplete) {
        this.autocomplete = autocomplete;
        return this;
    }
}
exports.FormTag = FormTag;
function Form(child = Empty()) {
    return new FormTag("form", child);
}
class SelectTag extends Tag {
    setName(name) {
        this.name = name;
        return this;
    }
    setMultiple(multiple = true) {
        this.multiple = multiple;
        return this;
    }
    setSize(size) {
        this.size = size;
        return this;
    }
    setDisabled(disabled = true) {
        this.disabled = disabled;
        return this;
    }
    setAutofocus(autofocus = true) {
        this.autofocus = autofocus;
        return this;
    }
}
exports.SelectTag = SelectTag;
function Select(child = Empty()) {
    return new SelectTag("select", child);
}
class OptionTag extends Tag {
    setValue(value) {
        this.value = value;
        return this;
    }
    setSelected(selected = true) {
        this.selected = selected;
        return this;
    }
    setDisabled(disabled = true) {
        this.disabled = disabled;
        return this;
    }
    setLabel(label) {
        this.label = label;
        return this;
    }
}
exports.OptionTag = OptionTag;
function Option(child = Empty()) {
    return new OptionTag("option", child);
}
class OptgroupTag extends Tag {
    setLabel(label) {
        this.label = label;
        return this;
    }
    setDisabled(disabled = true) {
        this.disabled = disabled;
        return this;
    }
}
exports.OptgroupTag = OptgroupTag;
function Optgroup(child = Empty()) {
    return new OptgroupTag("optgroup", child);
}
function Datalist(child = Empty()) {
    return El("datalist", child);
}
class FieldsetTag extends Tag {
    setName(name) {
        this.name = name;
        return this;
    }
    setDisabled(disabled = true) {
        this.disabled = disabled;
        return this;
    }
}
exports.FieldsetTag = FieldsetTag;
function Fieldset(child = Empty()) {
    return new FieldsetTag("fieldset", child);
}
function Legend(child = Empty()) {
    return El("legend", child);
}
class OutputTag extends Tag {
    setFor(forId) {
        this.for = forId;
        return this;
    }
    setName(name) {
        this.name = name;
        return this;
    }
}
exports.OutputTag = OutputTag;
function Output(child = Empty()) {
    return new OutputTag("output", child);
}
// ------------------------------------
// Interactive Elements
// ------------------------------------
class DetailsTag extends Tag {
    setOpen(open = true) {
        this.open = open;
        return this;
    }
    setName(name) {
        this.name = name;
        return this;
    }
}
exports.DetailsTag = DetailsTag;
function Details(child = Empty()) {
    return new DetailsTag("details", child);
}
function Summary(child = Empty()) {
    return El("summary", child);
}
class DialogTag extends Tag {
    setOpen(open = true) {
        this.open = open;
        return this;
    }
}
exports.DialogTag = DialogTag;
function Dialog(child = Empty()) {
    return new DialogTag("dialog", child);
}
// ------------------------------------
// Media Elements
// ------------------------------------
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
    setLoading(loading) {
        this.loading = loading;
        return this;
    }
    setDecoding(decoding) {
        this.decoding = decoding;
        return this;
    }
    setSrcset(srcset) {
        this.srcset = srcset;
        return this;
    }
    setSizes(sizes) {
        this.sizes = sizes;
        return this;
    }
    setCrossorigin(crossorigin) {
        this.crossorigin = crossorigin;
        return this;
    }
}
exports.ImgTag = ImgTag;
function Img(child = Empty()) {
    return new ImgTag("img", child);
}
function Picture(child = Empty()) {
    return El("picture", child);
}
class SourceTag extends Tag {
    setSrc(src) {
        this.src = src;
        return this;
    }
    setSrcset(srcset) {
        this.srcset = srcset;
        return this;
    }
    setSizes(sizes) {
        this.sizes = sizes;
        return this;
    }
    setType(type) {
        this.type = type;
        return this;
    }
    setMedia(media) {
        this.media = media;
        return this;
    }
}
exports.SourceTag = SourceTag;
function Source(child = Empty()) {
    return new SourceTag("source", child);
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
    setAutoplay(autoplay = true) {
        this.autoplay = autoplay;
        return this;
    }
    setLoop(loop = true) {
        this.loop = loop;
        return this;
    }
    setMuted(muted = true) {
        this.muted = muted;
        return this;
    }
    setPreload(preload) {
        this.preload = preload;
        return this;
    }
    setPoster(poster) {
        this.poster = poster;
        return this;
    }
    setPlaysinline(playsinline = true) {
        this.playsinline = playsinline;
        return this;
    }
}
exports.VideoTag = VideoTag;
function Video(child = Empty()) {
    return new VideoTag("video", child);
}
class AudioTag extends Tag {
    setSrc(src) {
        this.src = src;
        return this;
    }
    setControls(controls = true) {
        this.controls = controls;
        return this;
    }
    setAutoplay(autoplay = true) {
        this.autoplay = autoplay;
        return this;
    }
    setLoop(loop = true) {
        this.loop = loop;
        return this;
    }
    setMuted(muted = true) {
        this.muted = muted;
        return this;
    }
    setPreload(preload) {
        this.preload = preload;
        return this;
    }
}
exports.AudioTag = AudioTag;
function Audio(child = Empty()) {
    return new AudioTag("audio", child);
}
class TrackTag extends Tag {
    setSrc(src) {
        this.src = src;
        return this;
    }
    setKind(kind) {
        this.kind = kind;
        return this;
    }
    setSrclang(srclang) {
        this.srclang = srclang;
        return this;
    }
    setLabel(label) {
        this.label = label;
        return this;
    }
    setDefault(isDefault = true) {
        this.default = isDefault;
        return this;
    }
}
exports.TrackTag = TrackTag;
function Track(child = Empty()) {
    return new TrackTag("track", child);
}
class CanvasTag extends Tag {
    setWidth(width) {
        this.width = width;
        return this;
    }
    setHeight(height) {
        this.height = height;
        return this;
    }
}
exports.CanvasTag = CanvasTag;
function Canvas(child = Empty()) {
    return new CanvasTag("canvas", child);
}
class SvgTag extends Tag {
    setWidth(width) {
        this.width = width;
        return this;
    }
    setHeight(height) {
        this.height = height;
        return this;
    }
    setViewBox(viewBox) {
        this.viewBox = viewBox;
        return this;
    }
    setXmlns(xmlns = "http://www.w3.org/2000/svg") {
        this.xmlns = xmlns;
        return this;
    }
    setFill(fill) {
        this.fill = fill;
        return this;
    }
    setStroke(stroke) {
        this.stroke = stroke;
        return this;
    }
}
exports.SvgTag = SvgTag;
function Svg(child = Empty()) {
    return new SvgTag("svg", child);
}
// SVG Elements
function Path(child = Empty()) {
    return El("path", child);
}
function Circle(child = Empty()) {
    return El("circle", child);
}
function Rect(child = Empty()) {
    return El("rect", child);
}
function Line(child = Empty()) {
    return El("line", child);
}
function Polygon(child = Empty()) {
    return El("polygon", child);
}
function Polyline(child = Empty()) {
    return El("polyline", child);
}
function Ellipse(child = Empty()) {
    return El("ellipse", child);
}
function G(child = Empty()) {
    return El("g", child);
}
function Defs(child = Empty()) {
    return El("defs", child);
}
function Use(child = Empty()) {
    return El("use", child);
}
function Text(child = Empty()) {
    return El("text", child);
}
function Tspan(child = Empty()) {
    return El("tspan", child);
}
// ------------------------------------
// Embedded Content
// ------------------------------------
class IframeTag extends Tag {
    setSrc(src) {
        this.src = src;
        return this;
    }
    setSrcdoc(srcdoc) {
        this.srcdoc = srcdoc;
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
    setAllow(allow) {
        this.allow = allow;
        return this;
    }
    setAllowfullscreen(allowfullscreen = true) {
        this.allowfullscreen = allowfullscreen;
        return this;
    }
    setLoading(loading) {
        this.loading = loading;
        return this;
    }
    setSandbox(sandbox) {
        this.sandbox = sandbox;
        return this;
    }
    setName(name) {
        this.name = name;
        return this;
    }
    setReferrerpolicy(referrerpolicy) {
        this.referrerpolicy = referrerpolicy;
        return this;
    }
}
exports.IframeTag = IframeTag;
function Iframe(child = Empty()) {
    return new IframeTag("iframe", child);
}
class ObjectTag extends Tag {
    setData(data) {
        this.data = data;
        return this;
    }
    setType(type) {
        this.type = type;
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
    setName(name) {
        this.name = name;
        return this;
    }
}
exports.ObjectTag = ObjectTag;
function ObjectEl(child = Empty()) {
    return new ObjectTag("object", child);
}
class EmbedTag extends Tag {
    setSrc(src) {
        this.src = src;
        return this;
    }
    setType(type) {
        this.type = type;
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
exports.EmbedTag = EmbedTag;
function Embed(child = Empty()) {
    return new EmbedTag("embed", child);
}
// ------------------------------------
// Links and Anchors
// ------------------------------------
class AnchorTag extends Tag {
    setHref(href) {
        this.href = href;
        return this;
    }
    setTarget(target) {
        this.target = target;
        return this;
    }
    setRel(rel) {
        this.rel = rel;
        return this;
    }
    setDownload(download) {
        this.download = download;
        return this;
    }
    setType(type) {
        this.type = type;
        return this;
    }
    setReferrerpolicy(referrerpolicy) {
        this.referrerpolicy = referrerpolicy;
        return this;
    }
}
exports.AnchorTag = AnchorTag;
function A(child = Empty()) {
    return new AnchorTag("a", child);
}
class MapTag extends Tag {
    setName(name) {
        this.name = name;
        return this;
    }
}
exports.MapTag = MapTag;
function MapEl(child = Empty()) {
    return new MapTag("map", child);
}
class AreaTag extends Tag {
    setShape(shape) {
        this.shape = shape;
        return this;
    }
    setCoords(coords) {
        this.coords = coords;
        return this;
    }
    setHref(href) {
        this.href = href;
        return this;
    }
    setAlt(alt) {
        this.alt = alt;
        return this;
    }
    setTarget(target) {
        this.target = target;
        return this;
    }
    setRel(rel) {
        this.rel = rel;
        return this;
    }
    setDownload(download) {
        this.download = download;
        return this;
    }
}
exports.AreaTag = AreaTag;
function Area(child = Empty()) {
    return new AreaTag("area", child);
}
// ------------------------------------
// Document Metadata / Head Elements
// ------------------------------------
function HTML(child) {
    return El("html", child);
}
function Head(child) {
    return El("head", child);
}
function Body(child) {
    return El("body", child);
}
function Title(child) {
    return El("title", child);
}
class MetaTag extends Tag {
    setName(name) {
        this.name = name;
        return this;
    }
    setContent(content) {
        this.content = content;
        return this;
    }
    setCharset(charset) {
        this.charset = charset;
        return this;
    }
    setHttpEquiv(httpEquiv) {
        this.httpEquiv = httpEquiv;
        return this;
    }
    setProperty(property) {
        this.property = property;
        return this;
    }
}
exports.MetaTag = MetaTag;
function Meta() {
    return new MetaTag("meta");
}
class LinkTag extends Tag {
    setRel(rel) {
        this.rel = rel;
        return this;
    }
    setHref(href) {
        this.href = href;
        return this;
    }
    setType(type) {
        this.type = type;
        return this;
    }
    setMedia(media) {
        this.media = media;
        return this;
    }
    setSizes(sizes) {
        this.sizes = sizes;
        return this;
    }
    setCrossorigin(crossorigin) {
        this.crossorigin = crossorigin;
        return this;
    }
    setIntegrity(integrity) {
        this.integrity = integrity;
        return this;
    }
    setAs(as) {
        this.as = as;
        return this;
    }
}
exports.LinkTag = LinkTag;
function Link() {
    return new LinkTag("link");
}
class StyleTag extends Tag {
    setMedia(media) {
        this.media = media;
        return this;
    }
    setType(type) {
        this.type = type;
        return this;
    }
}
exports.StyleTag = StyleTag;
function Style(css) {
    return new StyleTag("style", css);
}
class BaseTag extends Tag {
    setHref(href) {
        this.href = href;
        return this;
    }
    setTarget(target) {
        this.target = target;
        return this;
    }
}
exports.BaseTag = BaseTag;
function Base() {
    return new BaseTag("base");
}
function Noscript(child = Empty()) {
    return El("noscript", child);
}
function Template(child = Empty()) {
    return El("template", child);
}
class ScriptTag extends Tag {
    setSrc(src) {
        this.src = src;
        return this;
    }
    setType(type) {
        this.type = type;
        return this;
    }
    setAsync(async = true) {
        this.async = async;
        return this;
    }
    setDefer(defer = true) {
        this.defer = defer;
        return this;
    }
    setCrossorigin(crossorigin) {
        this.crossorigin = crossorigin;
        return this;
    }
    setIntegrity(integrity) {
        this.integrity = integrity;
        return this;
    }
    setNomodule(nomodule = true) {
        this.nomodule = nomodule;
        return this;
    }
}
exports.ScriptTag = ScriptTag;
function Script(js = "") {
    return new ScriptTag("script", js);
}
// ------------------------------------
// Data / Time Elements
// ------------------------------------
class TimeTag extends Tag {
    setDatetime(datetime) {
        this.datetime = datetime;
        return this;
    }
}
exports.TimeTag = TimeTag;
function Time(child = Empty()) {
    return new TimeTag("time", child);
}
class DataTag extends Tag {
    setValue(value) {
        this.value = value;
        return this;
    }
}
exports.DataTag = DataTag;
function Data(child = Empty()) {
    return new DataTag("data", child);
}
// ------------------------------------
// Progress / Meter
// ------------------------------------
class ProgressTag extends Tag {
    setValue(value) {
        this.value = value;
        return this;
    }
    setMax(max) {
        this.max = max;
        return this;
    }
}
exports.ProgressTag = ProgressTag;
function Progress(child = Empty()) {
    return new ProgressTag("progress", child);
}
class MeterTag extends Tag {
    setValue(value) {
        this.value = value;
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
    setLow(low) {
        this.low = low;
        return this;
    }
    setHigh(high) {
        this.high = high;
        return this;
    }
    setOptimum(optimum) {
        this.optimum = optimum;
        return this;
    }
}
exports.MeterTag = MeterTag;
function Meter(child = Empty()) {
    return new MeterTag("meter", child);
}
// ------------------------------------
// Slot / Template (Web Components)
// ------------------------------------
class SlotTag extends Tag {
    setName(name) {
        this.name = name;
        return this;
    }
}
exports.SlotTag = SlotTag;
function Slot(child = Empty()) {
    return new SlotTag("slot", child);
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
// ------------------------------------
// Control Flow
// ------------------------------------
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
// Implementation
function ForEach(viewsOrLowOrHigh, renderItemOrHigh, renderItem) {
    // ForEach(low, high, renderItem)
    if (typeof viewsOrLowOrHigh === "number" && typeof renderItemOrHigh === "number") {
        return Array.from(range(viewsOrLowOrHigh, renderItemOrHigh)).map((i) => renderItem(i));
    }
    // ForEach(high, renderItem)
    if (typeof viewsOrLowOrHigh === "number") {
        return Array.from(range(0, viewsOrLowOrHigh)).map((i) => renderItemOrHigh(i));
    }
    // ForEach(views, renderItem)
    return Array.from(viewsOrLowOrHigh).map(renderItemOrHigh);
}
/** @deprecated Use ForEach instead */
exports.ForEach1 = ForEach;
/** @deprecated Use ForEach instead */
exports.ForEach2 = ForEach;
/** @deprecated Use ForEach instead */
exports.ForEach3 = ForEach;
function* range(low, high) {
    for (var i = low; i < high; i++) {
        yield i;
    }
}
function Repeat(times, content) {
    return ForEach(range(0, times), content);
}
// ------------------------------------
// Render
// ------------------------------------
function render(view) {
    return renderImpl(view, false);
}
// HTML escape to prevent XSS
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
// For attribute values
function escapeAttr(unsafe) {
    return escapeHtml(unsafe);
}
// Elements whose content should NOT be escaped (they contain code, not text)
const RAW_TEXT_ELEMENTS = new Set(['script', 'style']);
function renderImpl(view, isRawContext) {
    function buildAttributes(attributes) {
        if (!attributes) {
            return "";
        }
        return Object.entries(attributes)
            .map(([key, value]) => {
            if (value === undefined || value === null)
                return "";
            return `${key}="${escapeAttr(String(value))}"`;
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
        attributes.push(`hx-${htmx.method}="${escapeAttr(htmx.endpoint)}"`);
        // Targeting & Swapping
        if (htmx.target)
            attributes.push(`hx-target="${escapeAttr(htmx.target)}"`);
        if (htmx.swap)
            attributes.push(`hx-swap="${escapeAttr(htmx.swap)}"`);
        if (htmx.swapOob !== undefined) {
            attributes.push(`hx-swap-oob="${typeof htmx.swapOob === 'string' ? escapeAttr(htmx.swapOob) : htmx.swapOob}"`);
        }
        if (htmx.select)
            attributes.push(`hx-select="${escapeAttr(htmx.select)}"`);
        if (htmx.selectOob)
            attributes.push(`hx-select-oob="${escapeAttr(htmx.selectOob)}"`);
        // Triggering
        if (htmx.trigger)
            attributes.push(`hx-trigger="${escapeAttr(htmx.trigger)}"`);
        // URL manipulation
        if (htmx.pushUrl !== undefined) {
            attributes.push(`hx-push-url="${typeof htmx.pushUrl === 'string' ? escapeAttr(htmx.pushUrl) : htmx.pushUrl}"`);
        }
        if (htmx.replaceUrl !== undefined) {
            attributes.push(`hx-replace-url="${typeof htmx.replaceUrl === 'string' ? escapeAttr(htmx.replaceUrl) : htmx.replaceUrl}"`);
        }
        // Data
        if (htmx.vals) {
            attributes.push(`hx-vals='${typeof htmx.vals === 'string' ? escapeAttr(htmx.vals) : JSON.stringify(htmx.vals)}'`);
        }
        if (htmx.headers)
            attributes.push(`hx-headers='${JSON.stringify(htmx.headers)}'`);
        if (htmx.include)
            attributes.push(`hx-include="${escapeAttr(htmx.include)}"`);
        if (htmx.params)
            attributes.push(`hx-params="${escapeAttr(htmx.params)}"`);
        if (htmx.encoding)
            attributes.push(`hx-encoding="${escapeAttr(htmx.encoding)}"`);
        // Validation & Confirmation
        if (htmx.validate !== undefined)
            attributes.push(`hx-validate="${htmx.validate}"`);
        if (htmx.confirm)
            attributes.push(`hx-confirm="${escapeAttr(htmx.confirm)}"`);
        if (htmx.prompt)
            attributes.push(`hx-prompt="${escapeAttr(htmx.prompt)}"`);
        // Loading states
        if (htmx.indicator)
            attributes.push(`hx-indicator="${escapeAttr(htmx.indicator)}"`);
        if (htmx.disabledElt)
            attributes.push(`hx-disabled-elt="${escapeAttr(htmx.disabledElt)}"`);
        // Synchronization
        if (htmx.sync)
            attributes.push(`hx-sync="${escapeAttr(htmx.sync)}"`);
        // Extensions
        if (htmx.ext)
            attributes.push(`hx-ext="${escapeAttr(htmx.ext)}"`);
        // Inheritance control
        if (htmx.disinherit)
            attributes.push(`hx-disinherit="${escapeAttr(htmx.disinherit)}"`);
        if (htmx.inherit)
            attributes.push(`hx-inherit="${escapeAttr(htmx.inherit)}"`);
        // History
        if (htmx.history !== undefined)
            attributes.push(`hx-history="${htmx.history}"`);
        if (htmx.historyElt !== undefined)
            attributes.push(`hx-history-elt="${htmx.historyElt}"`);
        // Preservation
        if (htmx.preserve !== undefined)
            attributes.push(`hx-preserve="${htmx.preserve}"`);
        // Request configuration
        if (htmx.request)
            attributes.push(`hx-request="${escapeAttr(htmx.request)}"`);
        // Boosting
        if (htmx.boost !== undefined)
            attributes.push(`hx-boost="${htmx.boost}"`);
        // Disable htmx processing
        if (htmx.disable !== undefined)
            attributes.push(`hx-disable="${htmx.disable}"`);
        return attributes.join(' ');
    }
    if (typeof view === "string") {
        return isRawContext ? view : escapeHtml(view);
    }
    if (view instanceof Tag) {
        // Build base attributes, excluding internal properties
        const baseAttrs = {};
        Object.assign(baseAttrs, view);
        Object.assign(baseAttrs, view.attributes);
        // Exclude internal properties from rendering
        baseAttrs.el = undefined;
        baseAttrs.htmx = undefined;
        baseAttrs.child = undefined;
        baseAttrs.toggles = undefined;
        baseAttrs.attributes = undefined;
        const childIsRaw = RAW_TEXT_ELEMENTS.has(view.el);
        const renderedChild = renderImpl(view.child, childIsRaw);
        const parts = [];
        const renderedAttributes = buildAttributes(baseAttrs);
        if (renderedAttributes)
            parts.push(renderedAttributes);
        const renderedHtmx = buildHtmx(view.htmx);
        if (renderedHtmx)
            parts.push(renderedHtmx);
        if (view.toggles && view.toggles.length > 0) {
            parts.push(view.toggles.join(" "));
        }
        const attrsString = parts.length > 0 ? " " + parts.join(" ") : "";
        return `<${view.el}${attrsString}>${renderedChild}</${view.el}>`;
    }
    if (Array.isArray(view)) {
        return view.map(innerView => renderImpl(innerView, isRawContext)).join("\n");
    }
    return "";
}
//# sourceMappingURL=builder.js.map