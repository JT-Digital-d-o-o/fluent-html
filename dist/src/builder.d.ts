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
    setClass(className?: string): Tag;
    setStyle(style?: string): Tag;
    addAttribute(key: string, value: string): Tag;
    setHtmx(htmx?: HTMX): Tag;
    setToggles(toggles?: [string]): Tag;
}
export declare function El(el: string, props?: Partial<Tag>): View;
export declare function Div(props?: Partial<Tag>): View;
/**
 * @deprecated Use strings directly instead.
 */
export declare function Text(text?: string): View;
export declare function Empty(): View;
/**
 * @deprecated Use an array directly instead.
 */
export declare function VStack(views: View[]): View;
export declare function HStack(props?: Partial<Tag>): View;
type InputParams = {
    type?: string;
    placeholder?: string;
    name?: string;
};
export declare function Input(props?: Partial<Tag & InputParams>): View;
type TextareaParams = {
    placeholder?: string;
    name?: string;
    rows?: number;
    cols?: number;
};
export declare function Textarea(props?: Partial<Tag & TextareaParams>): View;
export declare function P(props?: Partial<Tag>): View;
export declare function Button(props: Partial<Tag & {
    type?: string;
}>): View;
type LabelParams = {
    for?: string;
};
export declare function Label(props: Partial<Tag & LabelParams>): View;
export declare function H1(props?: Partial<Tag>): View;
export declare function H2(props?: Partial<Tag>): View;
export declare function H3(props?: Partial<Tag>): View;
export declare function H4(props?: Partial<Tag>): View;
export declare function Span(props?: Partial<Tag>): View;
export declare function A(props: Partial<Tag & {
    href?: string;
}>): View;
export declare function Ul(props?: Partial<Tag>): View;
export declare function Ol(props?: Partial<Tag>): View;
export declare function Li(props?: Partial<Tag>): View;
type FormParams = {
    action?: string;
    method?: string;
};
export declare function Form(props: Partial<Tag & FormParams>): View;
type ImgParams = {
    src?: string;
    alt?: string;
    width?: string;
    height?: string;
};
export declare function Img(props: Partial<Tag & ImgParams>): View;
interface Option {
    value: string;
    text: string;
    selected: boolean;
}
type OptionParams = {
    name?: string;
    options?: Option[];
};
export declare function Select(props: Partial<Tag & OptionParams>): View;
export declare function Table(props?: Partial<Tag>): View;
export declare function Thead(props?: Partial<Tag>): View;
export declare function Tbody(props?: Partial<Tag>): View;
export declare function Tr(props?: Partial<Tag>): View;
export declare function Th(props?: Partial<Tag>): View;
export declare function Td(props?: Partial<Tag>): View;
export declare function Hr(props?: Partial<Tag>): View;
export type OverlayPosition = 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left' | 'right' | 'center';
export declare function Overlay(content: View, overlay: View, position?: OverlayPosition): View;
export declare function Overlay1(content: View, overlay: View, position?: OverlayPosition): Tag;
export declare function IfThenElse(condition: boolean, thenBranch: Thunk<View>, elseBranch: Thunk<View>): View;
export declare function IfThen(condition: boolean, then: Thunk<View>): View;
type Case = {
    condition: boolean;
    component: Thunk<View>;
};
export declare function SwitchCase(cases: Case[], defaultView?: Thunk<View>): View;
export declare function ForEach<T>(views: Iterable<T>, renderItem: (item: T) => View): View;
export declare function ForEach1<T>(views: Iterable<T>, renderItem: (item: T, index: number) => View): View;
export declare function ForEach2(n: number, renderItem: (index: number) => View): View;
export declare function Repeat(times: number, content: Thunk<View>): View;
export declare function render(view: View): string;
export declare function El1(el: string, child?: View): Tag;
export declare function Div1(child?: View): Tag;
export declare function P1(child?: View): Tag;
export declare class InputTag extends Tag {
    type?: string;
    placeholder?: string;
    name?: string;
    value?: string;
    setType(type?: string): InputTag;
    setPlaceholder(placeholder?: string): InputTag;
    setName(name?: string): InputTag;
    setValue(value?: string): InputTag;
}
export declare function Input1(child?: View): InputTag;
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
export declare function Textarea1(child?: View): TextareaTag;
export declare class ButtonTag extends Tag {
    type?: string;
    setType(type?: string): ButtonTag;
}
export declare function Button1(child?: View): ButtonTag;
export declare class LabelTag extends Tag {
    for?: string;
    setFor(forId?: string): LabelTag;
}
export declare function Label1(child?: View): LabelTag;
export declare class AnchorTag extends Tag {
    href?: string;
    setHref(href?: string): AnchorTag;
}
export declare function A1(child?: View): AnchorTag;
export declare class FormTag extends Tag {
    action?: string;
    method?: string;
    setAction(action?: string): FormTag;
    setMethod(method?: string): FormTag;
}
export declare function Form1(child?: View): FormTag;
export declare class ImgTag extends Tag {
    src?: string;
    alt?: string;
    width?: string;
    height?: string;
    setSrc(src?: string): Tag;
    set(alt?: string): ImgTag;
    setWidth(width?: string): ImgTag;
    setHeight(height?: string): ImgTag;
}
export declare function Img1(child?: View): ImgTag;
export declare class SelectTag extends Tag {
    name?: string;
    options?: Option[];
    setName(name?: string): SelectTag;
    setOptions(options?: Option[]): SelectTag;
}
export declare function Select1(child?: View): SelectTag;
export declare function H11(child?: View): Tag;
export declare function H21(child?: View): Tag;
export declare function H31(child?: View): Tag;
export declare function H41(child?: View): Tag;
export declare function Span1(child?: View): Tag;
export declare function Ul1(child?: View): Tag;
export declare function Ol1(child?: View): Tag;
export declare function Li1(child?: View): Tag;
export declare function Table1(child?: View): Tag;
export declare function Thead1(child?: View): Tag;
export declare function Tbody1(child?: View): Tag;
export declare function Tr1(child?: View): Tag;
export declare function Th1(child?: View): Tag;
export declare function Td1(child?: View): Tag;
export declare function Hr1(child?: View): Tag;
export {};
