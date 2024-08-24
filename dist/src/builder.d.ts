import { HTMX } from "./htmx.js";
export type Thunk<T> = () => T;
export declare function render(view: View): string;
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
export declare function Text(text?: string): View;
export declare function Empty(): View;
export declare function IfThen(condition: boolean, then: Thunk<View>): View;
export declare function IfThenElse(condition: boolean, thenBranch: Thunk<View>, elseBranch: Thunk<View>): View;
export declare function VStack(views: View[]): View;
export declare function HStack(props?: Partial<HtmlElement>): View;
type InputParams = {
    type?: string;
    placeholder?: string;
    name?: string;
    required?: boolean;
};
export declare function Input(props?: Partial<HtmlElement & InputParams>): View;
export declare function ForEach<T>(views: Iterable<T>, renderItem: (item: T) => View): View;
export declare function ForEach1<T>(views: Iterable<T>, renderItem: (item: T, index: number) => View): View;
type TextareaParams = {
    placeholder?: string;
    name?: string;
    rows?: number;
    cols?: number;
};
export declare function Textarea(props?: Partial<HtmlElement & TextareaParams>): View;
export declare function P(props?: Partial<HtmlElement>): View;
export {};
