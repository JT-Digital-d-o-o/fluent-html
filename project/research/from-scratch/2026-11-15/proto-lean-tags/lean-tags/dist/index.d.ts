import { type Server } from "node:http";
/** Finished, already-escaped markup. `I` is the id its root carries when it was built with a part's root wire. */
export declare class Html<I extends string | undefined = string | undefined> {
    readonly $id: I;
    h: string;
    id: string | undefined;
    constructor(h: string, id?: string);
    toString(): string;
}
/** A full document: what a page route answers. */
export declare class Page {
    readonly $page: true;
    h: string;
    constructor(h: string);
}
/** A class list. Only tw`…` and tw.token() make one, so a class attribute never holds an unchecked string. */
export declare class Tw {
    readonly $tw: true;
    /** Attribute-escaped class text. */
    c: string;
    constructor(c: string);
}
/** Attribute text produced by the framework. `I` is set when the wire makes its element a part's root. */
export declare class Wire<I extends string = never> {
    readonly $root: I;
    s: string;
    id: string | undefined;
    constructor(s: string, id?: string);
}
export type Falsy = false | null | undefined;
export type Child = string | number | boolean | null | undefined | Html | readonly Child[];
type V = string | number | false | null | undefined;
type B = boolean | null | undefined;
export declare function esc(s: string): string;
/** One URL policy for every URL-valued attribute, keyed on the attribute name (there is no untyped side door). */
export declare function safeUrl(u: string): string;
/** A CSS value from data: one value, never a second declaration, a rule, a comment or a fetch. */
export declare function cssValue(v: string | number): string;
/**
 * The class list of an element: tag(tw`flex gap-4`, …). Also a preset: const card = tw`p-6 bg-surface`.
 * Holes take other tw values or false/null. Several tw arguments on one tag are joined in order; nothing is merged or dropped.
 */
export declare const tw: {
    (strings: TemplateStringsArray, ...holes: (Tw | Falsy)[]): Tw;
    /** One class from data (a state name, a slug). Refuses anything that is not a single token. */
    token(value: string): Tw;
};
type Style = Record<string, string | number | false | null | undefined>;
type NoClass = "classes are a leading tw argument: div(tw`flex gap-4`, …)";
type NoHandler = "inline event handlers are not rendered: use a route wire or a native command";
type NoHx = "htmx attributes come from a route wire: route(...), .search(), .poll(), wire({…})";
export interface Global {
    id?: string;
    title?: V;
    hidden?: B | "until-found";
    role?: V;
    tabindex?: number;
    lang?: V;
    dir?: "ltr" | "rtl" | "auto";
    inert?: B;
    popover?: B | "auto" | "manual";
    style?: Style;
    data?: Record<string, V | true>;
    [k: `data-${string}`]: V | true;
    [k: `aria-${string}`]: V | boolean;
    class?: NoClass;
    onclick?: NoHandler;
    [k: `hx-${string}`]: NoHx;
}
type Cmd = {
    command?: "show-modal" | "close" | "request-close" | "show-popover" | "hide-popover" | "toggle-popover";
    commandfor?: string;
    popovertarget?: string;
};
export interface Attrs {
    a: Global & {
        href?: string;
        target?: "_blank" | "_self" | "_top";
        rel?: V;
        download?: V | true;
    };
    button: Global & Cmd & {
        type?: "button" | "submit" | "reset";
        name?: string;
        value?: V;
        disabled?: B;
        form?: string;
        formaction?: string;
        autofocus?: B;
    };
    input: Global & {
        type?: "text" | "search" | "email" | "password" | "number" | "tel" | "url" | "date" | "datetime-local" | "time" | "checkbox" | "radio" | "hidden" | "file" | "range" | "color";
        name?: string;
        value?: V;
        placeholder?: V;
        required?: B;
        disabled?: B;
        readonly?: B;
        checked?: B;
        autofocus?: B;
        min?: V;
        max?: V;
        step?: V;
        minlength?: number;
        maxlength?: number;
        pattern?: V;
        autocomplete?: V;
        list?: V;
        multiple?: B;
        accept?: V;
    };
    textarea: Global & {
        name?: string;
        rows?: number;
        cols?: number;
        placeholder?: V;
        required?: B;
        disabled?: B;
        readonly?: B;
        minlength?: number;
        maxlength?: number;
    };
    select: Global & {
        name?: string;
        required?: B;
        disabled?: B;
        multiple?: B;
    };
    option: Global & {
        value?: V;
        selected?: B;
        disabled?: B;
    };
    label: Global & {
        for?: string;
    };
    form: Global & {
        action?: string;
        method?: "get" | "post" | "dialog";
        enctype?: "multipart/form-data";
        novalidate?: B;
        autocomplete?: "on" | "off";
    };
    img: Global & {
        src: string;
        alt: string;
        width?: number;
        height?: number;
        loading?: "lazy" | "eager";
        decoding?: "async" | "sync" | "auto";
        srcset?: string;
        sizes?: V;
    };
    iframe: Global & {
        src?: string;
        srcdoc?: string;
        sandbox?: string;
        title?: V;
        loading?: "lazy" | "eager";
        allow?: V;
        width?: number;
        height?: number;
    };
    dialog: Global & {
        open?: B;
        closedby?: "any" | "closerequest" | "none";
    };
    td: Global & {
        colspan?: number;
        rowspan?: number;
        headers?: V;
    };
    th: Global & {
        colspan?: number;
        rowspan?: number;
        scope?: "col" | "row" | "colgroup" | "rowgroup";
    };
    time: Global & {
        datetime?: V;
    };
    meta: Global & {
        name?: V;
        content?: V;
        charset?: "utf-8";
        property?: V;
    };
    link: Global & {
        rel: string;
        href: string;
        type?: V;
        as?: V;
        crossorigin?: V;
    };
    script: Global & {
        src: string;
        type?: "module";
        defer?: B;
        async?: B;
    };
    details: Global & {
        open?: B;
        name?: V;
    };
}
/**
 * A tag. Leading arguments are its classes (tw`…`), attributes ({…}) and wires, in any order; the rest are children.
 * One signature, so a mistake is one diagnostic.
 */
export type El<A = Global, R = never> = <I extends string = never>(...args: (Tw | A | R | Wire<I> | Child)[]) => Html<[I] extends [never] ? undefined : NoInfer<I>>;
export type VoidEl<A = Global, R = never> = <I extends string = never>(...args: (Tw | A | R | Wire<I>)[]) => Html<[I] extends [never] ? undefined : NoInfer<I>>;
export declare const div: El<Global, never>, span: El<Global, never>, p: El<Global, never>, main: El<Global, never>, section: El<Global, never>, article: El<Global, never>;
export declare const header: El<Global, never>, footer: El<Global, never>, nav: El<Global, never>, aside: El<Global, never>;
export declare const h1: El<Global, never>, h2: El<Global, never>, h3: El<Global, never>, h4: El<Global, never>;
export declare const ul: El<Global, never>, ol: El<Global, never>, li: El<Global, never>, dl: El<Global, never>, dt: El<Global, never>, dd: El<Global, never>;
export declare const table: El<Global, never>, thead: El<Global, never>, tbody: El<Global, never>, tr: El<Global, never>;
export declare const td: El<Global & {
    colspan?: number;
    rowspan?: number;
    headers?: V;
}, never>, th: El<Global & {
    colspan?: number;
    rowspan?: number;
    scope?: "col" | "row" | "colgroup" | "rowgroup";
}, never>;
export declare const strong: El<Global, never>, em: El<Global, never>, small: El<Global, never>, code: El<Global, never>, pre: El<Global, never>;
export declare const time: El<Global & {
    datetime?: V;
}, never>;
export declare const a: El<Global & {
    href?: string;
    target?: "_blank" | "_self" | "_top";
    rel?: V;
    download?: V | true;
}, PageRef>;
export declare const button: El<Global & Cmd & {
    type?: "button" | "submit" | "reset";
    name?: string;
    value?: V;
    disabled?: B;
    form?: string;
    formaction?: string;
    autofocus?: B;
}, ActionRef<any>>;
export declare const form: El<Global & {
    action?: string;
    method?: "get" | "post" | "dialog";
    enctype?: "multipart/form-data";
    novalidate?: B;
    autocomplete?: "on" | "off";
}, PageRef>;
export declare const label: El<Global & {
    for?: string;
}, never>;
export declare const select: El<Global & {
    name?: string;
    required?: B;
    disabled?: B;
    multiple?: B;
}, never>, option: El<Global & {
    value?: V;
    selected?: B;
    disabled?: B;
}, never>;
export declare const textarea: El<Global & {
    name?: string;
    rows?: number;
    cols?: number;
    placeholder?: V;
    required?: B;
    disabled?: B;
    readonly?: B;
    minlength?: number;
    maxlength?: number;
}, never>;
export declare const dialog: El<Global & {
    open?: B;
    closedby?: "any" | "closerequest" | "none";
}, never>;
export declare const details: El<Global & {
    open?: B;
    name?: V;
}, never>, summary: El<Global, never>;
export declare const iframe: El<Global & {
    src?: string;
    srcdoc?: string;
    sandbox?: string;
    title?: V;
    loading?: "lazy" | "eager";
    allow?: V;
    width?: number;
    height?: number;
}, never>;
export declare const title: El<Global, never>;
export declare const input: VoidEl<Global & {
    type?: "text" | "search" | "email" | "password" | "number" | "tel" | "url" | "date" | "datetime-local" | "time" | "checkbox" | "radio" | "hidden" | "file" | "range" | "color";
    name?: string;
    value?: V;
    placeholder?: V;
    required?: B;
    disabled?: B;
    readonly?: B;
    checked?: B;
    autofocus?: B;
    min?: V;
    max?: V;
    step?: V;
    minlength?: number;
    maxlength?: number;
    pattern?: V;
    autocomplete?: V;
    list?: V;
    multiple?: B;
    accept?: V;
}, never>, img: VoidEl<Global & {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    loading?: "lazy" | "eager";
    decoding?: "async" | "sync" | "auto";
    srcset?: string;
    sizes?: V;
}, never>, hr: VoidEl<Global, never>, br: VoidEl<Global, never>;
export declare const meta: VoidEl<Global & {
    name?: V;
    content?: V;
    charset?: "utf-8";
    property?: V;
}, never>, link: VoidEl<Global & {
    rel: string;
    href: string;
    type?: V;
    as?: V;
    crossorigin?: V;
}, never>;
/** External script only. Data for scripts goes through json() or jsVar(). */
export declare const script: (a: Attrs["script"]) => Html<undefined>;
/** Data for client code: <script type="application/json">. */
export declare const json: (data: unknown, a?: {
    id?: string;
}) => Html<undefined>;
/** Data handed to inline JS as one global: <script>window.NAME = …</script>. */
export declare function jsVar(name: string, data: unknown): Html<undefined>;
export declare class Css {
    readonly $css: true;
    t: string;
    constructor(t: string);
}
/** A stylesheet: the literal text is yours, each hole is one CSS value from data. */
export declare function css(strings: TemplateStringsArray, ...holes: (string | number)[]): Css;
export declare const style: (sheet: Css) => Html<undefined>;
export declare class Trusted {
    readonly $trusted: true;
    h: string;
    constructor(h: string);
}
/** Markup you wrote: a template with no holes. The only other source of Trusted is a sanitizer you register. */
export declare function trusted(strings: TemplateStringsArray): Trusted;
export declare const raw: (t: Trusted) => Html<undefined>;
type Kind = "string" | "string?" | "number" | "number?" | "boolean?";
type Shape = Record<string, Kind>;
type TypeOf<K> = K extends `number${string}` ? number : K extends `boolean${string}` ? boolean : string;
type Params<P extends string> = P extends `${string}:${infer N}/${infer R}` ? N | Params<`/${R}`> : P extends `${string}:${infer N}` ? N : never;
type Flat<T> = {
    [K in keyof T]: T[K];
} & {};
export type Input<P extends string, S extends Shape> = Flat<{
    [K in Params<P>]: K extends keyof S ? TypeOf<S[K]> : string;
} & {
    [K in Exclude<keyof S, Params<P>> as S[K] extends `${string}?` ? never : K]: TypeOf<S[K]>;
} & {
    [K in Exclude<keyof S, Params<P>> as S[K] extends `${string}?` ? K : never]?: TypeOf<S[K]>;
}>;
/** Any Standard Schema (zod, valibot, arktype). */
export interface Schema<T> {
    readonly "~standard": {
        validate(value: unknown): {
            value: T;
            issues?: undefined;
        } | {
            issues: readonly {
                message: string;
                path?: readonly (PropertyKey | {
                    key: PropertyKey;
                })[];
            }[];
        } | Promise<any>;
        readonly types?: {
            input: unknown;
            output: T;
        };
    };
}
interface PageDef<P extends string, S extends Shape> {
    k: "page";
    path: P;
    shape: S;
}
interface PartDef<I extends string, P extends string, S extends Shape> {
    k: "part";
    id: I;
    path: P;
    shape: S;
}
interface ActionDef<P extends string, Bd, S extends Shape> {
    k: "post";
    path: P;
    body: Schema<Bd> | undefined;
    shape: S;
}
type AnyDef = PageDef<any, any> | PartDef<any, any, any> | ActionDef<any, any, any>;
/** A GET route that answers a page. Inputs named in the path are path parameters; the rest are the query. */
export declare function page<const P extends string = "/", const S extends Shape = {}>(path?: P, inputs?: S): PageDef<P, S>;
/** A GET route that answers one fragment: the element whose root carries `id`. */
export declare function part<const I extends string, const P extends string, const S extends Shape = {}>(id: I, path: P, inputs?: S): PartDef<I, P, S>;
/** A POST route. With a body schema it owns a form: invalid input answers 422 into the form. */
export declare function post<const P extends string, const S extends Shape = {}>(path: P, inputs?: S): ActionDef<P, undefined, S>;
export declare function post<const P extends string, Bd, const S extends Shape = {}>(path: P, body: Schema<Bd>, inputs?: S): ActionDef<P, Bd, S>;
type Call<In, R> = {} extends In ? (input?: In) => R : (input: In) => R;
export type PageRoute<In> = Call<In, PageRef> & {
    readonly $k: "page";
    readonly $in: In;
};
export type PartRoute<I extends string, In> = Call<In, PartRef<I, In>> & {
    readonly $k: "part";
    readonly $in: In;
    readonly $i: I;
};
export type ActionRoute<In, Bd> = Call<In, ActionRef<Bd>> & {
    readonly $k: "post";
    readonly $in: In;
    readonly $b: Bd;
};
type RouteOf<D> = D extends PageDef<infer P, infer S> ? PageRoute<Input<P, S>> : D extends PartDef<infer I, infer P, infer S> ? PartRoute<I, Input<P, S>> : D extends ActionDef<infer P, infer Bd, infer S> ? ActionRoute<Input<P, S>, Bd> : never;
/** A route address used as a leading argument. What it emits depends on the tag it sits on. */
export declare abstract class Ref {
    url: string;
    constructor(url: string);
    abstract on(tag: string): string;
}
/** A page address: a(ref, …) links to it, form(ref, …) is a GET form to it. */
export declare class PageRef extends Ref {
    readonly $ref: "page";
    on(tag: string): string;
}
type Every = `${number}s` | `${number}ms`;
/** A fragment address plus the wires that load it. */
export declare class PartRef<I extends string, In = {}> {
    readonly $ref: "part";
    readonly $in: In;
    url: string;
    id: I;
    constructor(url: string, id: I);
    /** Makes the element this part's root: it carries the part's id. */
    get root(): Wire<I>;
    /** Root that refreshes itself while `every` is set. Pass false for the settled root, which ends the poll. */
    poll(every: Every | Falsy): Wire<I>;
    /** Root that loads itself once after the page arrives. */
    defer(): Wire<I>;
    /** On an input: names the field and reloads the part after typing stops. */
    search(name: keyof In & string): Wire;
    /** On a select or checkbox: names the field and reloads the part when it changes. */
    change(name: keyof In & string): Wire;
    /** On a button: reloads the part on click. */
    load(): Wire;
}
export type FormState<R> = R extends {
    readonly $b: infer Bd;
} ? State<Bd> : never;
type State<Bd> = {
    values?: {
        [K in keyof Bd]?: unknown;
    };
    errors?: {
        [K in keyof Bd]?: string;
    };
};
type Bound<A> = Omit<A, "name" | "value" | "id" | "checked">;
export interface Fields<Bd> {
    /** <input> bound to a schema field: name, id, value, aria-invalid and aria-describedby are filled in. */
    input(name: keyof Bd & string, ...rest: (Tw | Bound<Attrs["input"]>)[]): Html<undefined>;
    textarea(name: keyof Bd & string, ...rest: (Tw | Bound<Attrs["textarea"]>)[]): Html<undefined>;
    /** <select> whose options are a record of value to label; the record must cover the field's values. */
    select<K extends keyof Bd & string>(name: K, options: Record<Extract<Bd[K], string>, string>, ...rest: (Tw | Bound<Attrs["select"]>)[]): Html<undefined>;
    checkbox(name: keyof Bd & string, ...rest: (Tw | Bound<Attrs["input"]>)[]): Html<undefined>;
    hidden(name: keyof Bd & string, value: V): Html<undefined>;
    /** The field's error message, wired to its control. Renders nothing while the field is valid. */
    error(name: keyof Bd & string, ...rest: Tw[]): Html<undefined> | null;
}
/** A POST address. button(ref, …) posts on click; ref.form(…) builds its schema-bound form. */
export declare class ActionRef<Bd> extends Ref {
    readonly $ref: "post";
    readonly $b: Bd;
    formId: string;
    constructor(url: string, formId: string);
    on(tag: string): string;
    /** Posts with no swap (a counter, a like). */
    fire(): Wire;
    /** The route's form: it carries the form region's id, and a 422 answer lands back in it. */
    form(state: State<Bd>, ...rest: [...lead: (Tw | Attrs["form"])[], body: (f: Fields<Bd>) => Child]): Html<undefined>;
}
export declare function routes<const D extends Record<string, AnyDef>>(prefix: string, defs: D): {
    [K in keyof D]: RouteOf<D[K]>;
};
/** The escape hatch for htmx: a request the route wires do not cover. Every value is checked. */
export declare function wire(o: {
    get?: string;
    post?: string;
    put?: string;
    delete?: string;
    target?: string;
    swap?: "outerMorph" | "innerMorph" | "outerHTML" | "innerHTML" | "none" | "beforeend" | "afterbegin";
    trigger?: "click" | "change" | "load" | "revealed" | "submit" | Every;
    confirm?: string;
    vals?: Record<string, unknown>;
    headers?: Record<string, string>;
    push?: boolean;
}): Wire;
/** A native modal dialog: three attribute sets that cannot drift apart. */
export declare function modal(id: string): {
    open: Attrs["button"];
    root: Attrs["dialog"];
    close: Attrs["button"];
};
/** Exhaustive dispatch: on a value, or on an object's discriminant. A missing case is a compile error. */
export declare function match<K extends PropertyKey, R>(value: K, cases: {
    [P in K]: (value: P) => R;
}): R;
export declare function match<T, D extends keyof T, R>(value: T, key: D, cases: {
    [P in T[D] & PropertyKey]: (value: Extract<T, Record<D, P>>) => R;
}): R;
/** The document shell. An app wraps this once in its own Layout({ title }, …children). */
export declare function doc(o: {
    title: string;
    lang?: string;
    description?: string;
    head?: Child;
}, ...body: Child[]): Page;
export declare class Redirect {
    readonly $redirect: true;
    to: string;
    constructor(to: string);
}
export declare class NotFound {
    readonly $notFound: true;
}
export declare class Invalid<Bd> {
    readonly $invalid: Bd;
    errors: Record<string, string | undefined>;
    constructor(errors: any);
}
type Awaitable<T> = T | Promise<T>;
export interface Ctx<In, Bd = undefined> {
    input: In;
    body: Bd;
    redirect(to: PageRef): Redirect;
    notFound(): NotFound;
    /** Answers 422 with the route's form re-rendered with these errors. */
    invalid(errors: {
        [K in keyof Bd]?: string;
    }): Invalid<Bd>;
    request: unknown;
}
export type Entry<R> = R extends {
    readonly $k: "page";
    readonly $in: infer In;
} ? (ctx: Ctx<In>) => Awaitable<Page | Redirect | NotFound> : R extends {
    readonly $k: "part";
    readonly $in: infer In;
    readonly $i: infer I extends string;
} ? (ctx: Ctx<In>) => Awaitable<Html<I> | NotFound> : R extends {
    readonly $k: "post";
    readonly $in: infer In;
    readonly $b: infer Bd;
} ? (undefined extends Bd ? (ctx: Ctx<In>) => Awaitable<Redirect | Page | NotFound> : {
    form: (state: State<Bd>) => Html;
    ok: (ctx: Ctx<In, Bd>) => Awaitable<Redirect | Invalid<Bd> | Page | NotFound>;
}) : never;
export type Answer = {
    status: number;
    body?: string;
    location?: string;
};
/** One entry per route; a missing or extra key is a compile error. Returns a dispatcher the server adapter mounts. */
export declare function handlers<R extends Record<string, {
    readonly $k: string;
}>>(table: R, entries: {
    [K in keyof R]: Entry<R[K]>;
}): ((key: keyof R & string, req?: {
    input?: any;
    body?: any;
    request?: unknown;
}) => Promise<Answer>) & {
    table: Record<string, any>;
};
export type Dispatch = ((key: any, req?: {
    input?: any;
    body?: any;
    request?: unknown;
}) => Promise<Answer>) & {
    table: Record<string, any>;
};
/** The markup of a view or a page, as a string. */
export declare const render: (view: Html | Page) => string;
/** A minimal node:http server for handlers(...) tables: GET for page and part routes, POST (urlencoded) for actions. */
export declare function serve(apps: Dispatch[], port?: number): Server;
export {};
