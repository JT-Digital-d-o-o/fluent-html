import { HTMX } from "./htmx.js";
export type Thunk<T> = () => T;
export type View = HtmlElement | string | View[];
export declare class HtmlElement {
    el?: string;
    id?: string;
    class?: string;
    attributes?: Record<string, string>;
    htmx?: HTMX;
    style?: string;
    toggles?: string[];
    child?: View;
    constructor(element: string);
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
    required?: boolean;
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
export declare function H1(props: Partial<HtmlElement>): View;
export declare function H2(props: Partial<HtmlElement>): View;
export declare function H3(props: Partial<HtmlElement>): View;
export declare function H4(props: Partial<HtmlElement>): View;
export declare function Span(props: Partial<HtmlElement>): View;
export declare function A(props: Partial<HtmlElement & {
    href?: string;
}>): View;
export declare function Ul(props: Partial<HtmlElement>): View;
export declare function Ol(props: Partial<HtmlElement>): View;
export declare function Li(props: Partial<HtmlElement>): View;
type FormParams = {
    action?: string;
    method?: string;
};
export declare function Form(props: Partial<HtmlElement & FormParams>): View;
type ImgParams = {
    action?: string;
    method?: string;
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
export declare function Repeat(times: number, content: Thunk<View>): View;
export type OverlayPosition = 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left' | 'right' | 'center';
export declare function Overlay(content: View, overlay: View, position?: OverlayPosition): View;
export declare function Table(props: Partial<HtmlElement>): View;
export declare function Thead(props: Partial<HtmlElement>): View;
export declare function Tbody(props: Partial<HtmlElement>): View;
export declare function Tr(props: Partial<HtmlElement>): View;
export declare function Td(props: Partial<HtmlElement>): View;
export declare function IfThen(condition: boolean, then: Thunk<View>): View;
export declare function IfThenElse(condition: boolean, thenBranch: Thunk<View>, elseBranch: Thunk<View>): View;
type Case = {
    condition: boolean;
    component: Thunk<View>;
};
export declare function SwitchCase(cases: Case[], defaultView?: Thunk<View>): View;
export declare function ForEach<T>(views: Iterable<T>, renderItem: (item: T) => View): View;
export declare function ForEach1<T>(views: Iterable<T>, renderItem: (item: T, index: number) => View): View;
export declare function ForEach2(n: number, renderItem: (index: number) => View): View;
export declare function render(view: View): string;
export {};
