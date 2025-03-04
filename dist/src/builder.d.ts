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
export declare function HStack(children?: View[]): Tag;
export declare function Main(child?: View): Tag;
export declare function Header(child?: View): Tag;
export declare function Footer(child?: View): Tag;
export declare function Section(child?: View): Tag;
export declare function Article(child?: View): Tag;
export declare function P(child?: View): Tag;
export declare class InputTag extends Tag {
    type?: string;
    placeholder?: string;
    name?: string;
    value?: string;
    accept?: string;
    setType(type?: string): InputTag;
    setPlaceholder(placeholder?: string): InputTag;
    setName(name?: string): InputTag;
    setValue(value?: string): InputTag;
    setAccept(accept?: string): InputTag;
}
export declare function Input(child?: View): InputTag;
export declare class TextareaTag extends Tag {
    placeholder?: string;
    name?: string;
    rows?: number;
    cols?: number;
    setPlaceholder(placeholder?: string): TextareaTag;
    setName(name?: string): TextareaTag;
    setRows(rows?: number): TextareaTag;
    setCols(cols?: number): TextareaTag;
}
export declare function Textarea(child?: View): TextareaTag;
export declare class ButtonTag extends Tag {
    type?: string;
    setType(type?: string): ButtonTag;
}
export declare function Button(child?: View): ButtonTag;
export declare class LabelTag extends Tag {
    for?: string;
    setFor(forId?: string): LabelTag;
}
export declare function Label(child?: View): LabelTag;
export declare class AnchorTag extends Tag {
    href?: string;
    setHref(href?: string): AnchorTag;
}
export declare function A(child?: View): AnchorTag;
export declare class FormTag extends Tag {
    action?: string;
    method?: string;
    setAction(action?: string): FormTag;
    setMethod(method?: string): FormTag;
}
export declare function Form(child?: View): FormTag;
export declare class ImgTag extends Tag {
    src?: string;
    alt?: string;
    width?: string;
    height?: string;
    setSrc(src?: string): ImgTag;
    setAlt(alt?: string): ImgTag;
    setWidth(width?: string): ImgTag;
    setHeight(height?: string): ImgTag;
}
export declare function Img(child?: View): ImgTag;
export declare class SelectTag extends Tag {
    name?: string;
    options?: Option[];
    setName(name?: string): SelectTag;
    setOptions(options?: Option[]): SelectTag;
}
export declare function Select(child?: View): SelectTag;
export declare function Option(child?: View): Tag;
export declare class VideoTag extends Tag {
    width?: number;
    height?: number;
    controls?: boolean;
    src?: string;
    setWidth(width: number): VideoTag;
    setHeight(height: number): VideoTag;
    setControls(enabled?: boolean): VideoTag;
    setSrc(src: string): VideoTag;
}
export declare function Video(child?: View): VideoTag;
export declare function H1(child?: View): Tag;
export declare function H2(child?: View): Tag;
export declare function H3(child?: View): Tag;
export declare function H4(child?: View): Tag;
export declare function Span(child?: View): Tag;
export declare function Ul(child?: View): Tag;
export declare function Ol(child?: View): Tag;
export declare function Li(child?: View): Tag;
export declare function Table(child?: View): Tag;
export declare function Thead(child?: View): Tag;
export declare function Tbody(child?: View): Tag;
export declare function Tr(child?: View): Tag;
export declare function Th(child?: View): Tag;
export declare function Td(child?: View): Tag;
export declare function Hr(child?: View): Tag;
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
export declare function ElOld(el: string, props?: Partial<Tag>): View;
export declare function DivOld(props?: Partial<Tag>): View;
/**
 * @deprecated Use strings directly instead.
 */
export declare function Text(text?: string): View;
/**
 * @deprecated Use an array directly instead.
 */
export declare function VStack(views: View[]): View;
type InputParams = {
    type?: string;
    placeholder?: string;
    name?: string;
};
export declare function InputOld(props?: Partial<Tag & InputParams>): View;
type TextareaParams = {
    placeholder?: string;
    name?: string;
    rows?: number;
    cols?: number;
};
export declare function TextareaOld(props?: Partial<Tag & TextareaParams>): View;
export declare function POld(props?: Partial<Tag>): View;
export declare function ButtonOld(props: Partial<Tag & {
    type?: string;
}>): View;
type LabelParams = {
    for?: string;
};
export declare function LabelOld(props: Partial<Tag & LabelParams>): View;
export declare function H1Old(props?: Partial<Tag>): View;
export declare function H2Old(props?: Partial<Tag>): View;
export declare function H3Old(props?: Partial<Tag>): View;
export declare function H4Old(props?: Partial<Tag>): View;
export declare function SpanOld(props?: Partial<Tag>): View;
export declare function AOld(props: Partial<Tag & {
    href?: string;
}>): View;
export declare function UlOld(props?: Partial<Tag>): View;
export declare function OlOld(props?: Partial<Tag>): View;
export declare function LiOld(props?: Partial<Tag>): View;
type FormParams = {
    action?: string;
    method?: string;
};
export declare function FormOld(props: Partial<Tag & FormParams>): View;
type ImgParams = {
    src?: string;
    alt?: string;
    width?: string;
    height?: string;
};
export declare function ImgOld(props: Partial<Tag & ImgParams>): View;
interface Option {
    value: string;
    text: string;
    selected: boolean;
}
type OptionParams = {
    name?: string;
    options?: Option[];
};
export declare function SelectOld(props: Partial<Tag & OptionParams>): View;
export declare function TableOld(props?: Partial<Tag>): View;
export declare function TheadOld(props?: Partial<Tag>): View;
export declare function TbodyOld(props?: Partial<Tag>): View;
export declare function TrOld(props?: Partial<Tag>): View;
export declare function ThOld(props?: Partial<Tag>): View;
export declare function TdOld(props?: Partial<Tag>): View;
export declare function HrOld(props?: Partial<Tag>): View;
export declare function OverlayOld(content: View, overlay: View, position?: OverlayPosition): View;
export {};
