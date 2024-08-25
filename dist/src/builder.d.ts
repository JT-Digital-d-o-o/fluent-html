import { HTMX } from "./htmx.js";
export type Thunk<T> = () => T;
export type View = HtmlElement | string | View[];
export declare class HtmlElement {
    el: string;
    child: View;
    id?: string;
    class?: string;
    attributes?: Record<string, string>;
    htmx?: HTMX;
    style?: string;
    toggles?: string[];
    constructor(element: string, child?: View);
    setId(id?: string): HtmlElement;
    setClass(className?: string): HtmlElement;
    setAttributes(attributes?: Record<string, string>): HtmlElement;
    setStyle(style?: string): HtmlElement;
    setHtmx(htmx?: HTMX): HtmlElement;
}
export declare function El(el: string, props?: Partial<HtmlElement>): View;
export declare function Div(props?: Partial<HtmlElement>): View;
/**
 * @deprecated Use strings directly instead.
 */
export declare function Text(text?: string): View;
export declare function Empty(): View;
/**
 * @deprecated Use an array directly instead.
 */
export declare function VStack(views: View[]): View;
export declare function HStack(props?: Partial<HtmlElement>): View;
type InputParams = {
    type?: string;
    placeholder?: string;
    name?: string;
};
export declare function Input(props?: Partial<HtmlElement & InputParams>): View;
type TextareaParams = {
    placeholder?: string;
    name?: string;
    rows?: number;
    cols?: number;
};
export declare function Textarea(props?: Partial<HtmlElement & TextareaParams>): View;
export declare function P(props?: Partial<HtmlElement>): View;
export declare function Button(props: Partial<HtmlElement & {
    type?: string;
}>): View;
type LabelParams = {
    for?: string;
};
export declare function Label(props: Partial<HtmlElement & LabelParams>): View;
export declare function H1(props?: Partial<HtmlElement>): View;
export declare function H2(props?: Partial<HtmlElement>): View;
export declare function H3(props?: Partial<HtmlElement>): View;
export declare function H4(props?: Partial<HtmlElement>): View;
export declare function Span(props?: Partial<HtmlElement>): View;
export declare function A(props: Partial<HtmlElement & {
    href?: string;
}>): View;
export declare function Ul(props?: Partial<HtmlElement>): View;
export declare function Ol(props?: Partial<HtmlElement>): View;
export declare function Li(props?: Partial<HtmlElement>): View;
type FormParams = {
    action?: string;
    method?: string;
};
export declare function Form(props: Partial<HtmlElement & FormParams>): View;
type ImgParams = {
    src?: string;
    alt?: string;
    width?: string;
    height?: string;
};
export declare function Img(props: Partial<HtmlElement & ImgParams>): View;
interface Option {
    value: string;
    text: string;
    selected: boolean;
}
type OptionParams = {
    name?: string;
    options?: Option[];
};
export declare function Select(props: Partial<HtmlElement & OptionParams>): View;
export declare function Table(props?: Partial<HtmlElement>): View;
export declare function Thead(props?: Partial<HtmlElement>): View;
export declare function Tbody(props?: Partial<HtmlElement>): View;
export declare function Tr(props?: Partial<HtmlElement>): View;
export declare function Th(props?: Partial<HtmlElement>): View;
export declare function Td(props?: Partial<HtmlElement>): View;
export declare function Hr(props?: Partial<HtmlElement>): View;
export type OverlayPosition = 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left' | 'right' | 'center';
export declare function Overlay(content: View, overlay: View, position?: OverlayPosition): View;
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
export declare function El1(el: string, child?: View): HtmlElement;
export declare function Div1(child?: View): HtmlElement;
export declare function P1(child?: View): HtmlElement;
export declare class InputHtmlElement extends HtmlElement {
    type?: string;
    placeholder?: string;
    name?: string;
    setType(type: string): InputHtmlElement;
    setPlaceholder(placeholder: string): InputHtmlElement;
    setName(name: string): InputHtmlElement;
}
export declare function Input1(child?: View): InputHtmlElement;
export declare class TextareaHtmlElement extends HtmlElement {
    placeholder?: string;
    name?: string;
    rows?: number;
    cols?: number;
    setPlaceholder(placeholder: string): TextareaHtmlElement;
    setName(name: string): TextareaHtmlElement;
    setRows(rows: number): TextareaHtmlElement;
    setCols(cols: number): TextareaHtmlElement;
}
export declare function Textarea1(child?: View): TextareaHtmlElement;
export declare class ButtonHtmlElement extends HtmlElement {
    type?: string;
    setType(type: string): ButtonHtmlElement;
}
export declare function Button1(child?: View): ButtonHtmlElement;
export declare class LabelHtmlElement extends HtmlElement {
    for?: string;
    setFor(forId: string): LabelHtmlElement;
}
export declare function Label1(child?: View): LabelHtmlElement;
export declare class AnchorHtmlElement extends HtmlElement {
    href?: string;
    setHref(href: string): AnchorHtmlElement;
}
export declare function A1(child?: View): AnchorHtmlElement;
export declare class FormHtmlElement extends HtmlElement {
    action?: string;
    method?: string;
    setAction(action: string): FormHtmlElement;
    setMethod(method: string): FormHtmlElement;
}
export declare function Form1(child?: View): FormHtmlElement;
export declare class ImgHtmlElement extends HtmlElement {
    src?: string;
    alt?: string;
    width?: string;
    height?: string;
    setSrc(src: string): HtmlElement;
    set(alt: string): ImgHtmlElement;
    setWidth(width: string): ImgHtmlElement;
    setHeight(height: string): ImgHtmlElement;
}
export declare function Img1(child?: View): ImgHtmlElement;
export declare class SelectHtmlElement extends HtmlElement {
    name?: string;
    options?: Option[];
    setName(name: string): SelectHtmlElement;
    setOptions(options: Option[]): SelectHtmlElement;
}
export declare function Select1(child?: View): SelectHtmlElement;
export declare function H11(child?: View): HtmlElement;
export declare function H21(child?: View): HtmlElement;
export declare function H31(child?: View): HtmlElement;
export declare function H41(child?: View): HtmlElement;
export declare function Span1(child?: View): HtmlElement;
export declare function Ul1(child?: View): HtmlElement;
export declare function Ol1(child?: View): HtmlElement;
export declare function Li1(child?: View): HtmlElement;
export declare function Table1(child?: View): HtmlElement;
export declare function Thead1(child?: View): HtmlElement;
export declare function Tbody1(child?: View): HtmlElement;
export declare function Tr1(child?: View): HtmlElement;
export declare function Th1(child?: View): HtmlElement;
export declare function Td1(child?: View): HtmlElement;
export declare function Hr1(child?: View): HtmlElement;
export {};
