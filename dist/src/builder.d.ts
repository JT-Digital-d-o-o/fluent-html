import { HTMX } from "./htmx.js";
export type Thunk<T> = () => T;
export declare function id<T>(val: T): T;
export type HTML = Thunk<string>;
export declare function render(html: HTML): string;
export interface HtmlElement {
    el?: string;
    child?: HTML;
    id?: string;
    class?: string;
    attributes?: Record<string, string>;
    htmx?: HTMX;
    style?: string;
    toggles?: string[];
}
export declare function El({ el, id, class: className, htmx, attributes, child, style, toggles, }?: HtmlElement): HTML;
export declare function Div({ id, class: className, htmx, style, attributes, child }?: HtmlElement): HTML;
export declare function Button({ id, class: className, htmx, style, type, attributes, child, }?: HtmlElement & {
    type?: string;
}): HTML;
export declare function Input({ id, class: className, htmx, style, type, placeholder, name, attributes, child, }?: HtmlElement & {
    type?: string;
    placeholder?: string;
    name?: string;
    required?: boolean;
}): HTML;
export declare function Textarea({ id, class: className, htmx, placeholder, name, rows, cols, attributes, child, }?: HtmlElement & {
    placeholder?: string;
    name?: string;
    rows?: number;
    cols?: number;
    required?: boolean;
}): HTML;
export declare function Label({ id, class: className, htmx, attributes, child, }?: HtmlElement): HTML;
export declare function H1({ id, class: className, htmx, attributes, child, }?: HtmlElement): HTML;
export declare function H2({ id, class: className, htmx, attributes, child, }?: HtmlElement): HTML;
export declare function H3({ id, class: className, htmx, attributes, child, }?: HtmlElement): HTML;
export declare function H4({ id, class: className, htmx, attributes, child, }?: HtmlElement): HTML;
export declare function Span({ id, class: className, htmx, attributes, child, }?: HtmlElement): HTML;
export declare function A({ id, class: className, htmx, href, attributes, child, }?: HtmlElement & {
    href?: string;
}): HTML;
export declare function Ul({ id, class: className, htmx, attributes, child, }?: HtmlElement): HTML;
export declare function Li({ id, class: className, htmx, attributes, child, }?: HtmlElement): HTML;
export declare function Form({ id, class: className, htmx, action, method, attributes, child, }?: HtmlElement & {
    action?: string;
    method?: string;
}): HTML;
export declare function Img({ id, class: className, htmx, src, alt, style, attributes, child, }?: HtmlElement & {
    src?: string;
    alt?: string;
}): HTML;
export declare function P({ id, class: className, htmx, attributes, child, }?: HtmlElement): HTML;
interface Option {
    value: string;
    text: string;
    selected: boolean;
}
export declare function Select({ id, class: className, htmx, name, options, attributes, }?: HtmlElement & {
    name?: string;
    options?: Option[];
}): HTML;
export declare function Text(text?: string): HTML;
export declare function Empty(): HTML;
export declare function IfThenElse(condition: boolean, thenView: Thunk<HTML>, elseView: Thunk<HTML>): HTML;
export declare function IfThen(condition: boolean, content: Thunk<HTML>): HTML;
export declare function SwitchCase(cases: {
    condition: Thunk<boolean>;
    component: HTML;
}[], defaultComponent?: Thunk<HTML>): HTML;
export declare function MapJoin<T>(items: Iterable<T>, renderItem: (item: T) => HTML): HTML;
export declare function MapJoin1<T>(items: Array<T>, renderItem: (item: T, index: number) => HTML): HTML;
export declare function MapJoin2(n: number, renderItem: (index: number) => HTML): HTML;
export declare function Repeat(times: number, content: Thunk<HTML>): HTML;
export declare function VStack(children?: HTML[]): HTML;
export declare function VStackDiv(children: HTML[], { id, class: className, htmx, style, attributes, }?: HtmlElement): HTML;
export declare function HStack({ id, class: className, htmx, style, attributes, }?: HtmlElement, children?: HTML[]): HTML;
export declare function Lazy(loadComponent: Thunk<HTML>): HTML;
export declare function FadeIn({ id, class: className, htmx, attributes, style, child, }?: HtmlElement): HTML;
export type OverlayPosition = 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left' | 'right' | 'center';
export declare function Overlay(content: HTML, overlay: HTML, position?: OverlayPosition): HTML;
export declare function Table({ id, class: className, htmx, style, attributes, child }?: HtmlElement): HTML;
export declare function Thead({ id, class: className, htmx, style, attributes, child }?: HtmlElement): HTML;
export declare function Tr({ id, class: className, htmx, style, attributes, child }?: HtmlElement): HTML;
export declare function Th({ id, class: className, htmx, style, attributes, child }?: HtmlElement): HTML;
export declare function Tbody({ id, class: className, htmx, style, attributes, child }?: HtmlElement): HTML;
export {};
