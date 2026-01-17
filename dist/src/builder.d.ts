import { HTMX } from "./htmx.js";
import { ReactiveProps } from "./reactive.js";
export type Thunk<T> = () => T;
export type View = Tag | string | View[];
export declare class Tag<TSelf extends Tag<any> = Tag<any>> {
    el: string;
    child: View;
    id?: string;
    class?: string;
    style?: string;
    attributes: Record<string, string>;
    htmx?: HTMX;
    toggles?: string[];
    /** Reactive bindings. Created lazily on first reactive method call. */
    reactive?: ReactiveProps;
    constructor(element: string, child?: View);
    setId(id?: string): TSelf;
    setClass(c?: string): TSelf;
    addClass(c: string): TSelf;
    setStyle(style?: string): TSelf;
    addAttribute(key: string, value: string): TSelf;
    setHtmx(htmx?: HTMX): TSelf;
    setToggles(toggles?: string[]): TSelf;
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
    setClasses(classes: (string | false | null | undefined)[]): TSelf;
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
    setStyles(styles: Record<string, string | number>): TSelf;
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
    setDataAttrs(attrs: Record<string, string>): TSelf;
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
    setAria(attrs: Record<string, string | boolean>): TSelf;
    /**
     * Initialize reactive state on this element.
     * This element becomes the "reactive root" for all descendant bindings.
     *
     * @param state - Initial state object
     * @returns this (for chaining)
     *
     * @example
     * Div([
     *   Span().bindText("message"),
     *   Button("Click").onClick("count++")
     * ]).bindState({ message: "Hello", count: 0 })
     */
    bindState(state: Record<string, any>): TSelf;
    /**
     * Bind the element's textContent to an expression.
     *
     * @param expr - JavaScript expression referencing ``
     * @returns this (for chaining)
     *
     * @example
     * Span().bindText("count")
     * Span().bindText("'Total: ' + items.length")
     * Span().bindText("score >= 100 ? 'Winner!' : 'Keep going'")
     */
    bindText(expr: string): TSelf;
    /**
     * Bind the element's innerHTML to an expression.
     *
     * ⚠️ WARNING: This can create XSS vulnerabilities if the expression
     * includes user-provided content. Only use with trusted data.
     *
     * @param expr - JavaScript expression referencing ``
     * @returns this (for chaining)
     *
     * @example
     * Div().bindHtml("richContent")
     */
    bindHtml(expr: string): TSelf;
    /**
     * Show/hide the element based on an expression.
     * When false, sets `display: none`. When true, removes the style.
     *
     * @param expr - JavaScript expression that evaluates to boolean
     * @returns this (for chaining)
     *
     * @example
     * Div("Loading...").bindShow("isLoading")
     * Div("Error!").bindShow("error !== null")
     */
    bindShow(expr: string): TSelf;
    /**
     * Hide/show the element based on an expression (inverse of bindShow).
     * When true, sets `display: none`. When false, removes the style.
     *
     * @param expr - JavaScript expression that evaluates to boolean
     * @returns this (for chaining)
     *
     * @example
     * Div("Content").bindHide("isLoading")
     */
    bindHide(expr: string): TSelf;
    /**
     * Toggle a CSS class based on an expression.
     *
     * @param className - CSS class name to toggle
     * @param expr - JavaScript expression that evaluates to boolean
     * @returns this (for chaining)
     *
     * @example
     * Button("Submit").bindClass("loading", "isSubmitting")
     * Li("Item").bindClass("selected", "selectedId === item.id")
     * Div().bindClass("error", "hasError").bindClass("success", "isValid")
     */
    bindClass(className: string, expr: string): TSelf;
    /**
     * Bind an attribute to an expression.
     * If expression evaluates to null/undefined, the attribute is removed.
     *
     * @param attr - Attribute name
     * @param expr - JavaScript expression referencing ``
     * @returns this (for chaining)
     *
     * @example
     * Button("Submit").bindAttr("disabled", "isSubmitting")
     * A("Link").bindAttr("href", "url")
     * Input().bindAttr("placeholder", "placeholderText")
     */
    bindAttr(attr: string, expr: string): TSelf;
    /**
     * Bind a CSS style property to an expression.
     *
     * @param property - CSS property name (camelCase or kebab-case)
     * @param expr - JavaScript expression referencing ``
     * @returns this (for chaining)
     *
     * @example
     * Div().bindStyle("color", "textColor")
     * Div().bindStyle("backgroundColor", "isActive ? 'green' : 'gray'")
     * Div().bindStyle("width", "progress + '%'")
     */
    bindStyle(property: string, expr: string): TSelf;
    /**
     * Bind an input's value to an expression (one-way: data → input).
     * For two-way binding, combine with onInput().
     *
     * @param expr - JavaScript expression referencing ``
     * @returns this (for chaining)
     *
     * @example
     * // One-way binding
     * Input().bindValue("searchQuery")
     *
     * // Two-way binding
     * Input()
     *   .bindValue("name")
     *   .onInput("name = this.value")
     */
    bindValue(expr: string): TSelf;
    /**
     * Add a click event handler.
     * Call multiple times to add multiple handlers.
     *
     * Available variables:
     * - `data` - The reactive state object
     * - `this` - The DOM element
     * - `event` - The click event
     *
     * @param statement - JavaScript statement(s) to execute
     * @returns this (for chaining)
     *
     * @example
     * Button("Increment").onClick("count++")
     * Button("Reset").onClick("count = 0")
     * Button("Toggle").onClick("visible = !visible")
     *
     * // Multiple handlers
     * Button("Do Both")
     *   .onClick("count++")
     *   .onClick("lastClicked = Date.now()")
     */
    onClick(statement: string): TSelf;
    /**
     * Add an input event handler (fires on every keystroke/change).
     *
     * Available variables:
     * - `data` - The reactive state object
     * - `this` - The DOM element (has `this.value`)
     * - `event` - The input event
     *
     * @param statement - JavaScript statement(s) to execute
     * @returns this (for chaining)
     *
     * @example
     * Input().onInput("searchQuery = this.value")
     * Textarea().onInput("data.content = this.value")
     *
     * // Two-way binding pattern
     * Input()
     *   .bindValue("name")
     *   .onInput("name = this.value")
     */
    onInput(statement: string): TSelf;
    /**
     * Add a change event handler (fires when input loses focus or on select change).
     *
     * @param statement - JavaScript statement(s) to execute
     * @returns this (for chaining)
     *
     * @example
     * Select().onChange("selectedOption = this.value")
     * Input().setType("checkbox").onChange("data.agreed = this.checked")
     */
    onChange(statement: string): TSelf;
    /**
     * Add a submit event handler (for forms).
     * Automatically calls event.preventDefault().
     *
     * @param statement - JavaScript statement(s) to execute
     * @returns this (for chaining)
     *
     * @example
     * Form([
     *   Input().bindValue("data.email").onInput("data.email = this.value"),
     *   Button("Submit").setType("submit")
     * ])
     *   .onSubmit("data.submitted = true")
     *   .bindState({ email: "", submitted: false })
     */
    onSubmit(statement: string): TSelf;
    /**
     * Add a keydown event handler.
     *
     * @param statement - JavaScript statement(s) to execute
     * @returns this (for chaining)
     *
     * @example
     * Input().onKeydown("if (event.key === 'Enter') data.submit()")
     * Input().onKeydown("if (event.key === 'Escape') query = ''")
     */
    onKeydown(statement: string): TSelf;
    /**
     * Add a focus event handler.
     *
     * @param statement - JavaScript statement(s) to execute
     * @returns this (for chaining)
     *
     * @example
     * Input().onFocus("data.isFocused = true")
     */
    onFocus(statement: string): TSelf;
    /**
     * Add a blur event handler.
     *
     * @param statement - JavaScript statement(s) to execute
     * @returns this (for chaining)
     *
     * @example
     * Input().onBlur("data.isFocused = false")
     * Input().onBlur("data.touched = true")
     */
    onBlur(statement: string): TSelf;
}
export declare function Empty(): View;
export declare function El(el: string, child?: View): Tag;
export declare function Div(child?: View): Tag;
export declare function Main(child?: View): Tag;
export declare function Header(child?: View): Tag;
export declare function Footer(child?: View): Tag;
export declare function Section(child?: View): Tag;
export declare function Article(child?: View): Tag;
export declare function Nav(child?: View): Tag;
export declare function Aside(child?: View): Tag;
export declare function Figure(child?: View): Tag;
export declare function Figcaption(child?: View): Tag;
export declare function Address(child?: View): Tag;
export declare function Hgroup(child?: View): Tag;
export declare function Search(child?: View): Tag;
export declare function P(child?: View): Tag;
export declare function H1(child?: View): Tag;
export declare function H2(child?: View): Tag;
export declare function H3(child?: View): Tag;
export declare function H4(child?: View): Tag;
export declare function H5(child?: View): Tag;
export declare function H6(child?: View): Tag;
export declare function Span(child?: View): Tag;
export declare function Blockquote(child?: View): Tag;
export declare function Pre(child?: View): Tag;
export declare function Code(child?: View): Tag;
export declare function Hr(child?: View): Tag;
export declare function Br(): Tag;
export declare function Wbr(): Tag;
export declare function Strong(child?: View): Tag;
export declare function Em(child?: View): Tag;
export declare function B(child?: View): Tag;
export declare function I(child?: View): Tag;
export declare function U(child?: View): Tag;
export declare function S(child?: View): Tag;
export declare function Mark(child?: View): Tag;
export declare function Small(child?: View): Tag;
export declare function Sub(child?: View): Tag;
export declare function Sup(child?: View): Tag;
export declare function Abbr(child?: View): Tag;
export declare function Cite(child?: View): Tag;
export declare function Q(child?: View): Tag;
export declare function Dfn(child?: View): Tag;
export declare function Kbd(child?: View): Tag;
export declare function Samp(child?: View): Tag;
export declare function Var(child?: View): Tag;
export declare function Bdi(child?: View): Tag;
export declare function Bdo(child?: View): Tag;
export declare function Ruby(child?: View): Tag;
export declare function Rt(child?: View): Tag;
export declare function Rp(child?: View): Tag;
export declare function Ul(child?: View): Tag;
export declare function Ol(child?: View): Tag;
export declare function Li(child?: View): Tag;
export declare function Dl(child?: View): Tag;
export declare function Dt(child?: View): Tag;
export declare function Dd(child?: View): Tag;
export declare function Menu(child?: View): Tag;
export declare function Table(child?: View): Tag;
export declare function Thead(child?: View): Tag;
export declare function Tbody(child?: View): Tag;
export declare function Tfoot(child?: View): Tag;
export declare function Tr(child?: View): Tag;
export declare class ThTag extends Tag<ThTag> {
    colspan?: number;
    rowspan?: number;
    scope?: 'row' | 'col' | 'rowgroup' | 'colgroup';
    setColspan(colspan: number): this;
    setRowspan(rowspan: number): this;
    setScope(scope: 'row' | 'col' | 'rowgroup' | 'colgroup'): this;
}
export declare function Th(child?: View): ThTag;
export declare class TdTag extends Tag<TdTag> {
    colspan?: number;
    rowspan?: number;
    setColspan(colspan: number): this;
    setRowspan(rowspan: number): this;
}
export declare function Td(child?: View): TdTag;
export declare function Caption(child?: View): Tag;
export declare class ColgroupTag extends Tag<ColgroupTag> {
    span?: number;
    setSpan(span: number): this;
}
export declare function Colgroup(child?: View): ColgroupTag;
export declare class ColTag extends Tag<ColTag> {
    span?: number;
    setSpan(span: number): this;
}
export declare function Col(child?: View): ColTag;
export declare class InputTag extends Tag<InputTag> {
    type?: string;
    placeholder?: string;
    name?: string;
    value?: string;
    accept?: string;
    min?: number;
    max?: number;
    step?: number | 'any';
    pattern?: string;
    minlength?: number;
    maxlength?: number;
    autocomplete?: string;
    autofocus?: boolean;
    checked?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    multiple?: boolean;
    list?: string;
    setType(type?: string): this;
    setPlaceholder(placeholder?: string): this;
    setName(name?: string): this;
    setValue(value?: string): this;
    setAccept(accept?: string): this;
    setMin(min?: number): this;
    setMax(max?: number): this;
    setStep(step?: number | 'any'): this;
    setPattern(pattern?: string): this;
    setMinlength(minlength?: number): this;
    setMaxlength(maxlength?: number): this;
    setAutocomplete(autocomplete?: string): this;
    setAutofocus(autofocus?: boolean): this;
    setChecked(checked?: boolean): this;
    setDisabled(disabled?: boolean): this;
    setReadonly(readonly?: boolean): this;
    setMultiple(multiple?: boolean): this;
    setList(list?: string): this;
}
export declare function Input(child?: View): InputTag;
export declare class TextareaTag extends Tag<TextareaTag> {
    placeholder?: string;
    name?: string;
    rows?: number;
    cols?: number;
    minlength?: number;
    maxlength?: number;
    wrap?: 'hard' | 'soft' | 'off';
    autocomplete?: string;
    autofocus?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    setPlaceholder(placeholder?: string): this;
    setName(name?: string): this;
    setRows(rows?: number): this;
    setCols(cols?: number): this;
    setMinlength(minlength?: number): this;
    setMaxlength(maxlength?: number): this;
    setWrap(wrap?: 'hard' | 'soft' | 'off'): this;
    setAutocomplete(autocomplete?: string): this;
    setAutofocus(autofocus?: boolean): this;
    setDisabled(disabled?: boolean): this;
    setReadonly(readonly?: boolean): this;
}
export declare function Textarea(child?: View): TextareaTag;
export declare class ButtonTag extends Tag<ButtonTag> {
    type?: 'submit' | 'reset' | 'button';
    name?: string;
    value?: string;
    disabled?: boolean;
    formaction?: string;
    formmethod?: string;
    setType(type?: 'submit' | 'reset' | 'button'): this;
    setName(name?: string): this;
    setValue(value?: string): this;
    setDisabled(disabled?: boolean): this;
    setFormaction(formaction?: string): this;
    setFormmethod(formmethod?: string): this;
}
export declare function Button(child?: View): ButtonTag;
export declare class LabelTag extends Tag<LabelTag> {
    for?: string;
    setFor(forId?: string): this;
}
export declare function Label(child?: View): LabelTag;
export declare class FormTag extends Tag<FormTag> {
    action?: string;
    method?: string;
    enctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
    target?: string;
    novalidate?: boolean;
    autocomplete?: 'on' | 'off';
    setAction(action?: string): this;
    setMethod(method?: string): this;
    setEnctype(enctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain'): this;
    setTarget(target?: string): this;
    setNovalidate(novalidate?: boolean): this;
    setAutocomplete(autocomplete?: 'on' | 'off'): this;
}
export declare function Form(child?: View): FormTag;
export declare class SelectTag extends Tag<SelectTag> {
    name?: string;
    multiple?: boolean;
    size?: number;
    disabled?: boolean;
    autofocus?: boolean;
    setName(name?: string): this;
    setMultiple(multiple?: boolean): this;
    setSize(size?: number): this;
    setDisabled(disabled?: boolean): this;
    setAutofocus(autofocus?: boolean): this;
}
export declare function Select(child?: View): SelectTag;
export declare class OptionTag extends Tag<OptionTag> {
    value?: string;
    selected?: boolean;
    disabled?: boolean;
    label?: string;
    setValue(value: string): this;
    setSelected(selected?: boolean): this;
    setDisabled(disabled?: boolean): this;
    setLabel(label?: string): this;
}
export declare function Option(child?: View): OptionTag;
export declare class OptgroupTag extends Tag<OptgroupTag> {
    label?: string;
    disabled?: boolean;
    setLabel(label?: string): this;
    setDisabled(disabled?: boolean): this;
}
export declare function Optgroup(child?: View): OptgroupTag;
export declare function Datalist(child?: View): Tag;
export declare class FieldsetTag extends Tag<FieldsetTag> {
    name?: string;
    disabled?: boolean;
    setName(name?: string): this;
    setDisabled(disabled?: boolean): this;
}
export declare function Fieldset(child?: View): FieldsetTag;
export declare function Legend(child?: View): Tag;
export declare class OutputTag extends Tag<OutputTag> {
    for?: string;
    name?: string;
    setFor(forId?: string): this;
    setName(name?: string): this;
}
export declare function Output(child?: View): OutputTag;
export declare class DetailsTag extends Tag<DetailsTag> {
    open?: boolean;
    name?: string;
    setOpen(open?: boolean): this;
    setName(name?: string): this;
}
export declare function Details(child?: View): DetailsTag;
export declare function Summary(child?: View): Tag;
export declare class DialogTag extends Tag<DialogTag> {
    open?: boolean;
    setOpen(open?: boolean): this;
}
export declare function Dialog(child?: View): DialogTag;
export declare class ImgTag extends Tag<ImgTag> {
    src?: string;
    alt?: string;
    width?: string;
    height?: string;
    loading?: 'lazy' | 'eager';
    decoding?: 'sync' | 'async' | 'auto';
    srcset?: string;
    sizes?: string;
    crossorigin?: 'anonymous' | 'use-credentials';
    setSrc(src?: string): this;
    setAlt(alt?: string): this;
    setWidth(width?: string): this;
    setHeight(height?: string): this;
    setLoading(loading?: 'lazy' | 'eager'): this;
    setDecoding(decoding?: 'sync' | 'async' | 'auto'): this;
    setSrcset(srcset?: string): this;
    setSizes(sizes?: string): this;
    setCrossorigin(crossorigin?: 'anonymous' | 'use-credentials'): this;
}
export declare function Img(child?: View): ImgTag;
export declare function Picture(child?: View): Tag;
export declare class SourceTag extends Tag<SourceTag> {
    src?: string;
    srcset?: string;
    sizes?: string;
    type?: string;
    media?: string;
    setSrc(src?: string): this;
    setSrcset(srcset?: string): this;
    setSizes(sizes?: string): this;
    setType(type?: string): this;
    setMedia(media?: string): this;
}
export declare function Source(child?: View): SourceTag;
export declare class VideoTag extends Tag<VideoTag> {
    width?: number;
    height?: number;
    controls?: boolean;
    src?: string;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    preload?: 'none' | 'metadata' | 'auto';
    poster?: string;
    playsinline?: boolean;
    setWidth(width: number): this;
    setHeight(height: number): this;
    setControls(enabled?: boolean): this;
    setSrc(src: string): this;
    setAutoplay(autoplay?: boolean): this;
    setLoop(loop?: boolean): this;
    setMuted(muted?: boolean): this;
    setPreload(preload?: 'none' | 'metadata' | 'auto'): this;
    setPoster(poster?: string): this;
    setPlaysinline(playsinline?: boolean): this;
}
export declare function Video(child?: View): VideoTag;
export declare class AudioTag extends Tag<AudioTag> {
    src?: string;
    controls?: boolean;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    preload?: 'none' | 'metadata' | 'auto';
    setSrc(src?: string): this;
    setControls(controls?: boolean): this;
    setAutoplay(autoplay?: boolean): this;
    setLoop(loop?: boolean): this;
    setMuted(muted?: boolean): this;
    setPreload(preload?: 'none' | 'metadata' | 'auto'): this;
}
export declare function Audio(child?: View): AudioTag;
export declare class TrackTag extends Tag<TrackTag> {
    src?: string;
    kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
    srclang?: string;
    label?: string;
    default?: boolean;
    setSrc(src?: string): this;
    setKind(kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'): this;
    setSrclang(srclang?: string): this;
    setLabel(label?: string): this;
    setDefault(isDefault?: boolean): this;
}
export declare function Track(child?: View): TrackTag;
export declare class CanvasTag extends Tag<CanvasTag> {
    width?: number;
    height?: number;
    setWidth(width: number): this;
    setHeight(height: number): this;
}
export declare function Canvas(child?: View): CanvasTag;
export declare class SvgTag extends Tag<SvgTag> {
    width?: string;
    height?: string;
    viewBox?: string;
    xmlns?: string;
    fill?: string;
    stroke?: string;
    setWidth(width: string): this;
    setHeight(height: string): this;
    setViewBox(viewBox: string): this;
    setXmlns(xmlns?: string): this;
    setFill(fill: string): this;
    setStroke(stroke: string): this;
}
export declare function Svg(child?: View): SvgTag;
export declare function Path(child?: View): Tag;
export declare function Circle(child?: View): Tag;
export declare function Rect(child?: View): Tag;
export declare function Line(child?: View): Tag;
export declare function Polygon(child?: View): Tag;
export declare function Polyline(child?: View): Tag;
export declare function Ellipse(child?: View): Tag;
export declare function G(child?: View): Tag;
export declare function Defs(child?: View): Tag;
export declare function Use(child?: View): Tag;
export declare function Text(child?: View): Tag;
export declare function Tspan(child?: View): Tag;
export declare class IframeTag extends Tag<IframeTag> {
    src?: string;
    srcdoc?: string;
    width?: string;
    height?: string;
    allow?: string;
    allowfullscreen?: boolean;
    loading?: 'lazy' | 'eager';
    sandbox?: string;
    name?: string;
    referrerpolicy?: string;
    setSrc(src?: string): this;
    setSrcdoc(srcdoc?: string): this;
    setWidth(width?: string): this;
    setHeight(height?: string): this;
    setAllow(allow?: string): this;
    setAllowfullscreen(allowfullscreen?: boolean): this;
    setLoading(loading?: 'lazy' | 'eager'): this;
    setSandbox(sandbox?: string): this;
    setName(name?: string): this;
    setReferrerpolicy(referrerpolicy?: string): this;
}
export declare function Iframe(child?: View): IframeTag;
export declare class ObjectTag extends Tag<ObjectTag> {
    data?: string;
    type?: string;
    width?: string;
    height?: string;
    name?: string;
    setData(data?: string): this;
    setType(type?: string): this;
    setWidth(width?: string): this;
    setHeight(height?: string): this;
    setName(name?: string): this;
}
export declare function ObjectEl(child?: View): ObjectTag;
export declare class EmbedTag extends Tag<EmbedTag> {
    src?: string;
    type?: string;
    width?: string;
    height?: string;
    setSrc(src?: string): this;
    setType(type?: string): this;
    setWidth(width?: string): this;
    setHeight(height?: string): this;
}
export declare function Embed(child?: View): EmbedTag;
export declare class AnchorTag extends Tag<AnchorTag> {
    href?: string;
    target?: '_self' | '_blank' | '_parent' | '_top' | string;
    rel?: string;
    download?: string | boolean;
    type?: string;
    referrerpolicy?: string;
    setHref(href?: string): this;
    setTarget(target?: '_self' | '_blank' | '_parent' | '_top' | string): this;
    setRel(rel?: string): this;
    setDownload(download?: string | boolean): this;
    setType(type?: string): this;
    setReferrerpolicy(referrerpolicy?: string): this;
}
export declare function A(child?: View): AnchorTag;
export declare class MapTag extends Tag<MapTag> {
    name?: string;
    setName(name?: string): this;
}
export declare function MapEl(child?: View): MapTag;
export declare class AreaTag extends Tag<AreaTag> {
    shape?: 'rect' | 'circle' | 'poly' | 'default';
    coords?: string;
    href?: string;
    alt?: string;
    target?: string;
    rel?: string;
    download?: string;
    setShape(shape?: 'rect' | 'circle' | 'poly' | 'default'): this;
    setCoords(coords?: string): this;
    setHref(href?: string): this;
    setAlt(alt?: string): this;
    setTarget(target?: string): this;
    setRel(rel?: string): this;
    setDownload(download?: string): this;
}
export declare function Area(child?: View): AreaTag;
export declare function HTML(child?: View): Tag;
export declare function Head(child?: View): Tag;
export declare function Body(child?: View): Tag;
export declare function Title(child?: View): Tag;
export declare class MetaTag extends Tag<MetaTag> {
    name?: string;
    content?: string;
    charset?: string;
    httpEquiv?: string;
    property?: string;
    setName(name?: string): this;
    setContent(content?: string): this;
    setCharset(charset?: string): this;
    setHttpEquiv(httpEquiv?: string): this;
    setProperty(property?: string): this;
}
export declare function Meta(): MetaTag;
export declare class LinkTag extends Tag<LinkTag> {
    rel?: string;
    href?: string;
    type?: string;
    media?: string;
    sizes?: string;
    crossorigin?: 'anonymous' | 'use-credentials';
    integrity?: string;
    as?: string;
    setRel(rel?: string): this;
    setHref(href?: string): this;
    setType(type?: string): this;
    setMedia(media?: string): this;
    setSizes(sizes?: string): this;
    setCrossorigin(crossorigin?: 'anonymous' | 'use-credentials'): this;
    setIntegrity(integrity?: string): this;
    setAs(as?: string): this;
}
export declare function Link(): LinkTag;
export declare class StyleTag extends Tag<StyleTag> {
    media?: string;
    type?: string;
    setMedia(media?: string): this;
    setType(type?: string): this;
}
export declare function Style(css: string): StyleTag;
export declare class BaseTag extends Tag<BaseTag> {
    href?: string;
    target?: string;
    setHref(href?: string): this;
    setTarget(target?: string): this;
}
export declare function Base(): BaseTag;
export declare function Noscript(child?: View): Tag;
export declare function Template(child?: View): Tag;
export declare class ScriptTag extends Tag<ScriptTag> {
    src?: string;
    type?: string;
    async?: boolean;
    defer?: boolean;
    crossorigin?: 'anonymous' | 'use-credentials';
    integrity?: string;
    nomodule?: boolean;
    setSrc(src?: string): this;
    setType(type?: string): this;
    setAsync(async?: boolean): this;
    setDefer(defer?: boolean): this;
    setCrossorigin(crossorigin?: 'anonymous' | 'use-credentials'): this;
    setIntegrity(integrity?: string): this;
    setNomodule(nomodule?: boolean): this;
}
export declare function Script(js?: string): ScriptTag;
export declare class TimeTag extends Tag<TimeTag> {
    datetime?: string;
    setDatetime(datetime?: string): this;
}
export declare function Time(child?: View): TimeTag;
export declare class DataTag extends Tag<DataTag> {
    value?: string;
    setValue(value?: string): this;
}
export declare function Data(child?: View): DataTag;
export declare class ProgressTag extends Tag<ProgressTag> {
    value?: number;
    max?: number;
    setValue(value?: number): this;
    setMax(max?: number): this;
}
export declare function Progress(child?: View): ProgressTag;
export declare class MeterTag extends Tag<MeterTag> {
    value?: number;
    min?: number;
    max?: number;
    low?: number;
    high?: number;
    optimum?: number;
    setValue(value?: number): this;
    setMin(min?: number): this;
    setMax(max?: number): this;
    setLow(low?: number): this;
    setHigh(high?: number): this;
    setOptimum(optimum?: number): this;
}
export declare function Meter(child?: View): MeterTag;
export declare class SlotTag extends Tag<SlotTag> {
    name?: string;
    setName(name?: string): this;
}
export declare function Slot(child?: View): SlotTag;
export type OverlayPosition = 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left' | 'right' | 'center';
export declare function Overlay(content: View, overlay: View, position?: OverlayPosition): Tag;
export declare function IfThenElse(condition: boolean, thenBranch: Thunk<View>, elseBranch: Thunk<View>): View;
export declare function IfThen(condition: boolean, then: Thunk<View>): View;
type Case = {
    condition: boolean;
    component: Thunk<View>;
};
export declare function SwitchCase(cases: Case[], defaultView?: Thunk<View>): View;
export declare function ForEach<T>(views: Iterable<T>, renderItem: (item: T) => View): View;
export declare function ForEach1<T>(views: Iterable<T>, renderItem: (item: T, index: number) => View): View;
export declare function ForEach2(high: number, renderItem: (index: number) => View): View;
export declare function ForEach3(low: number, high: number, renderItem: (index: number) => View): View;
export declare function Repeat(times: number, content: Thunk<View>): View;
export declare function render(view: View): string;
export {};
//# sourceMappingURL=builder.d.ts.map