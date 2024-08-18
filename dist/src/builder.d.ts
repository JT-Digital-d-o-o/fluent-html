import { HTMX } from "./htmx.js";
export type Thunk<T> = () => T;
export declare function id<T>(val: T): T;
export type View = Thunk<string>;
export declare function render(html: View): string;
export interface HtmlElement {
    el?: string;
    child?: View;
    id?: string;
    class?: string;
    attributes?: Record<string, string>;
    htmx?: HTMX;
    style?: string;
    toggles?: string[];
}
export declare function El({ el, id, class: className, htmx, attributes, child, style, toggles, }?: HtmlElement): View;
export declare function Div({ id, class: className, htmx, style, attributes, child, toggles, }?: HtmlElement): View;
export declare function Button({ id, class: className, htmx, style, type, attributes, child, toggles, }?: HtmlElement & {
    type?: string;
}): View;
export declare function Input({ id, class: className, htmx, style, type, placeholder, name, attributes, child, toggles, }?: HtmlElement & {
    type?: string;
    placeholder?: string;
    name?: string;
    required?: boolean;
}): View;
export declare function Textarea({ id, class: className, htmx, placeholder, name, rows, cols, attributes, toggles, child, }?: HtmlElement & {
    placeholder?: string;
    name?: string;
    rows?: number;
    cols?: number;
}): View;
export declare function Label({ id, class: className, htmx, attributes, child, toggles, }?: HtmlElement): View;
export declare function H1({ id, class: className, htmx, attributes, child, toggles, }?: HtmlElement): View;
export declare function H2({ id, class: className, htmx, attributes, child, toggles, }?: HtmlElement): View;
export declare function H3({ id, class: className, htmx, attributes, child, toggles, }?: HtmlElement): View;
export declare function H4({ id, class: className, htmx, attributes, child, toggles, }?: HtmlElement): View;
export declare function Span({ id, class: className, htmx, attributes, child, toggles, }?: HtmlElement): View;
export declare function A({ id, class: className, htmx, href, attributes, child, toggles, }?: HtmlElement & {
    href?: string;
}): View;
export declare function Ul({ id, class: className, htmx, attributes, child, toggles, }?: HtmlElement): View;
export declare function Li({ id, class: className, htmx, attributes, child, toggles, }?: HtmlElement): View;
export declare function Form({ id, class: className, htmx, action, method, attributes, child, toggles, }?: HtmlElement & {
    action?: string;
    method?: string;
}): View;
export declare function Img({ id, class: className, htmx, src, alt, style, attributes, child, toggles, }?: HtmlElement & {
    src?: string;
    alt?: string;
}): View;
export declare function P({ id, class: className, htmx, attributes, child, toggles, }?: HtmlElement): View;
interface Option {
    value: string;
    text: string;
    selected: boolean;
}
export declare function Select({ id, class: className, htmx, name, options, attributes, toggles, }?: HtmlElement & {
    name?: string;
    options?: Option[];
}): View;
export declare function Text(text?: string): View;
export declare function Empty(): View;
export declare function IfThenElse(condition: boolean, thenView: Thunk<View>, elseView: Thunk<View>): View;
export declare function IfThen(condition: boolean, content: Thunk<View>): View;
export declare function SwitchCase(cases: {
    condition: Thunk<boolean>;
    component: View;
}[], defaultComponent?: Thunk<View>): View;
export declare function ForEach<T>(items: Iterable<T>, renderItem: (item: T) => View): View;
export declare function ForEach1<T>(items: Array<T>, renderItem: (item: T, index: number) => View): View;
export declare function ForEach2(n: number, renderItem: (index: number) => View): View;
export declare function Repeat(times: number, content: Thunk<View>): View;
export declare function VStack(children?: View[]): View;
export declare function VStackDiv(children: View[], { id, class: className, htmx, style, attributes, }?: HtmlElement): View;
export declare function HStack({ id, class: className, htmx, attributes, children, style, toggles, }?: {
    id?: string;
    class?: string;
    htmx?: HTMX;
    attributes?: Record<string, string>;
    children?: View[];
    style?: string;
    toggles?: string[];
}): View;
export declare function Lazy(loadComponent: Thunk<View>): View;
export declare function FadeIn({ id, class: className, htmx, attributes, style, child, toggles, }?: HtmlElement): View;
export type OverlayPosition = 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left' | 'right' | 'center';
export declare function Overlay(content: View, overlay: View, position?: OverlayPosition): View;
export declare function Table({ id, class: className, htmx, style, attributes, child, toggles, }?: HtmlElement): View;
export declare function Thead({ id, class: className, htmx, style, attributes, child, toggles, }?: HtmlElement): View;
export declare function Tr({ id, class: className, htmx, style, attributes, child, toggles, }?: HtmlElement): View;
export declare function Th({ id, class: className, htmx, style, attributes, child, toggles, }?: HtmlElement): View;
export declare function Tbody({ id, class: className, htmx, style, attributes, child, toggles, }?: HtmlElement): View;
export declare function Td({ id, class: className, htmx, style, attributes, child, toggles, }?: HtmlElement): View;
export {};
