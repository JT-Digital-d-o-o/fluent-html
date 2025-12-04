import { HTMX } from "./htmx.js";
export type Thunk<T> = () => T;
export type View = Tag | string | View[];
export declare class Tag {
    el: string;
    child: View;
    id?: string;
    class?: string;
    style?: string;
    attributes: Record<string, string>;
    htmx?: HTMX;
    toggles?: string[];
    constructor(element: string, child?: View);
    setId(id?: string): Tag;
    setClass(c?: string): Tag;
    addClass(c: string): Tag;
    setStyle(style?: string): Tag;
    addAttribute(key: string, value: string): Tag;
    setHtmx(htmx?: HTMX): Tag;
    setToggles(toggles?: string[]): Tag;
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
export declare class ThTag extends Tag {
    colspan?: number;
    rowspan?: number;
    scope?: 'row' | 'col' | 'rowgroup' | 'colgroup';
    setColspan(colspan: number): this;
    setRowspan(rowspan: number): this;
    setScope(scope: 'row' | 'col' | 'rowgroup' | 'colgroup'): this;
}
export declare function Th(child?: View): ThTag;
export declare class TdTag extends Tag {
    colspan?: number;
    rowspan?: number;
    setColspan(colspan: number): this;
    setRowspan(rowspan: number): this;
}
export declare function Td(child?: View): TdTag;
export declare function Caption(child?: View): Tag;
export declare class ColgroupTag extends Tag {
    span?: number;
    setSpan(span: number): this;
}
export declare function Colgroup(child?: View): ColgroupTag;
export declare class ColTag extends Tag {
    span?: number;
    setSpan(span: number): this;
}
export declare function Col(child?: View): ColTag;
export declare class InputTag extends Tag {
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
export declare class TextareaTag extends Tag {
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
export declare class ButtonTag extends Tag {
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
export declare class LabelTag extends Tag {
    for?: string;
    setFor(forId?: string): this;
}
export declare function Label(child?: View): LabelTag;
export declare class FormTag extends Tag {
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
export declare class SelectTag extends Tag {
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
export declare class OptionTag extends Tag {
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
export declare class OptgroupTag extends Tag {
    label?: string;
    disabled?: boolean;
    setLabel(label?: string): this;
    setDisabled(disabled?: boolean): this;
}
export declare function Optgroup(child?: View): OptgroupTag;
export declare function Datalist(child?: View): Tag;
export declare class FieldsetTag extends Tag {
    name?: string;
    disabled?: boolean;
    setName(name?: string): this;
    setDisabled(disabled?: boolean): this;
}
export declare function Fieldset(child?: View): FieldsetTag;
export declare function Legend(child?: View): Tag;
export declare class OutputTag extends Tag {
    for?: string;
    name?: string;
    setFor(forId?: string): this;
    setName(name?: string): this;
}
export declare function Output(child?: View): OutputTag;
export declare class DetailsTag extends Tag {
    open?: boolean;
    name?: string;
    setOpen(open?: boolean): this;
    setName(name?: string): this;
}
export declare function Details(child?: View): DetailsTag;
export declare function Summary(child?: View): Tag;
export declare class DialogTag extends Tag {
    open?: boolean;
    setOpen(open?: boolean): this;
}
export declare function Dialog(child?: View): DialogTag;
export declare class ImgTag extends Tag {
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
export declare class SourceTag extends Tag {
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
export declare class VideoTag extends Tag {
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
export declare class AudioTag extends Tag {
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
export declare class TrackTag extends Tag {
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
export declare class CanvasTag extends Tag {
    width?: number;
    height?: number;
    setWidth(width: number): this;
    setHeight(height: number): this;
}
export declare function Canvas(child?: View): CanvasTag;
export declare class SvgTag extends Tag {
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
export declare class IframeTag extends Tag {
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
export declare class ObjectTag extends Tag {
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
export declare class EmbedTag extends Tag {
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
export declare class AnchorTag extends Tag {
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
export declare class MapTag extends Tag {
    name?: string;
    setName(name?: string): this;
}
export declare function MapEl(child?: View): MapTag;
export declare class AreaTag extends Tag {
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
export declare class MetaTag extends Tag {
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
export declare class LinkTag extends Tag {
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
export declare class StyleTag extends Tag {
    media?: string;
    type?: string;
    setMedia(media?: string): this;
    setType(type?: string): this;
}
export declare function Style(css: string): StyleTag;
export declare class BaseTag extends Tag {
    href?: string;
    target?: string;
    setHref(href?: string): this;
    setTarget(target?: string): this;
}
export declare function Base(): BaseTag;
export declare function Noscript(child?: View): Tag;
export declare function Template(child?: View): Tag;
export declare class ScriptTag extends Tag {
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
export declare class TimeTag extends Tag {
    datetime?: string;
    setDatetime(datetime?: string): this;
}
export declare function Time(child?: View): TimeTag;
export declare class DataTag extends Tag {
    value?: string;
    setValue(value?: string): this;
}
export declare function Data(child?: View): DataTag;
export declare class ProgressTag extends Tag {
    value?: number;
    max?: number;
    setValue(value?: number): this;
    setMax(max?: number): this;
}
export declare function Progress(child?: View): ProgressTag;
export declare class MeterTag extends Tag {
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
export declare class SlotTag extends Tag {
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
