// The JSX namespace: HTML's own element and attribute names, with htmx and ids typed.
// Names a React prior writes by habit are declared with their fix as the type, so tsc's
// first line states what to write instead.
import type { Html, Id, Route, Url, Method } from "./core.js";

export type Child = Html | string | number | boolean | null | undefined | readonly Child[];
export type ClassValue = string | false | null | undefined | readonly ClassValue[];
type IdRef = Id | string;
type PageRoute = Route<"get", any, undefined>;
type Verb<M extends Method> = Route<M, any, any>;

export type RouteCallOrUrlValue =
  | PageRoute
  | Url
  | `http://${string}`
  | `https://${string}`
  | `mailto:${string}`
  | `tel:${string}`
  | `#${string}`
  | "rtsx: an in-app link takes a route (routes.x()), a URL from data takes url(value)";

export type Swap = "outerMorph" | "innerMorph" | "outerHTML" | "innerHTML" | "beforebegin" | "afterbegin" | "beforeend" | "afterend" | "textContent" | "delete" | "none";
type Target = Id | "this" | "body" | `closest ${string}` | `find ${string}` | `next ${string}` | `previous ${string}`;

type Htmx = {
  "hx-get": Verb<"get">;
  "hx-post": Verb<"post">;
  "hx-put": Verb<"put">;
  "hx-patch": Verb<"patch">;
  "hx-delete": Verb<"delete">;
  "hx-target": Target;
  "hx-swap": Swap;
  "hx-trigger": string;
  "hx-confirm": string;
  "hx-vals": Record<string, string | number | boolean>;
  "hx-headers": Record<string, string>;
  "hx-include": "this" | `closest ${string}` | `find ${string}` | `#${string}`;
  "hx-select": string;
  "hx-indicator": Id | `closest ${string}`;
  "hx-disable": "this" | `find ${string}` | `closest ${string}`;
  "hx-sync": `${"this" | `closest ${string}`}:${"drop" | "abort" | "replace" | "queue first" | "queue last" | "queue all"}`;
  "hx-push-url": "true" | "false" | PageRoute;
  "hx-replace-url": "true" | "false" | PageRoute;
  "hx-encoding": "multipart/form-data";
  "hx-preserve": true;
};

type PriorLeaks = {
  className: "rtsx: write class";
  htmlFor: "rtsx: write for";
  tabIndex: "rtsx: write tabindex";
  readOnly: "rtsx: write readonly";
  maxLength: "rtsx: write maxlength";
  autoComplete: "rtsx: write autocomplete";
  colSpan: "rtsx: write colspan";
  dangerouslySetInnerHTML: "rtsx: pass unsafeHtml(trusted) as a child";
  onClick: "rtsx: no inline handlers; use command/commandfor, popovertarget or an hx-* attribute";
  onChange: "rtsx: no inline handlers; use hx-get with hx-trigger";
  onSubmit: "rtsx: no inline handlers; use hx-post on the form";
  onInput: "rtsx: no inline handlers; use hx-get with hx-trigger";
};

type Global = {
  id: IdRef;
  class: ClassValue;
  style: { readonly [property: string]: string | number | false | null | undefined };
  dataset: { readonly [key: string]: string | number | false | null | undefined };
  title: string;
  lang: string;
  dir: "ltr" | "rtl" | "auto";
  hidden: boolean | "until-found";
  inert: boolean;
  tabindex: number;
  role: string;
  slot: string;
  draggable: "true" | "false";
  popover: true | "auto" | "manual" | "hint";
  autofocus: boolean;
  translate: "yes" | "no";
  [aria: `aria-${string}`]: string | number | boolean | Id | false | null | undefined;
  [data: `data-${string}`]: string | number | boolean | false | null | undefined;
} & Htmx & PriorLeaks;

type Opt<T> = { [K in keyof T]?: T[K] | false | null };
type El<Own = {}> = Opt<Global & Own> & { children?: Child };
type Void<Own = {}> = Opt<Global & Own> & { children?: never };
type Need<T> = T;

type Command = "show-modal" | "close" | "request-close" | "show-popover" | "hide-popover" | "toggle-popover" | `--${string}`;
type FormControl = { name: string; disabled: boolean; form: IdRef; required: boolean };
type InputType = "text" | "search" | "email" | "password" | "tel" | "url" | "number" | "date" | "time" | "datetime-local" | "month" | "week" | "color" | "range" | "file" | "checkbox" | "radio" | "hidden" | "submit" | "reset" | "button";

type Plain =
  | "abbr" | "address" | "article" | "aside" | "b" | "bdi" | "bdo" | "body" | "caption" | "cite" | "code" | "colgroup" | "data" | "datalist"
  | "dd" | "dfn" | "div" | "dl" | "dt" | "em" | "fieldset" | "figcaption" | "figure" | "footer" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head"
  | "header" | "hgroup" | "i" | "kbd" | "legend" | "li" | "main" | "mark" | "menu" | "nav" | "noscript" | "p" | "picture" | "pre" | "q" | "rp" | "rt"
  | "ruby" | "s" | "samp" | "search" | "section" | "small" | "span" | "strong" | "sub" | "summary" | "sup" | "table" | "tbody" | "tfoot" | "thead" | "title"
  | "tr" | "u" | "ul" | "var";

export namespace JSX {
  export type Element = Html;
  export type ElementChildrenAttribute = { children: {} };
  export type IntrinsicAttributes = { key?: string | number };
  export type IntrinsicElements = { [K in Plain]: El } & {
    html: El<{ lang: string }>;
    a: El<{ href: RouteCallOrUrlValue; target: "_blank" | "_self"; rel: string; download: string | true; hreflang: string }>;
    button: El<FormControl & { type: "submit" | "button" | "reset"; value: string; command: Command; commandfor: IdRef; popovertarget: IdRef; popovertargetaction: "show" | "hide" | "toggle"; formaction: Route | string; formnovalidate: boolean }>;
    form: El<{ action: Route | string; method: "get" | "post" | "dialog"; enctype: "multipart/form-data"; novalidate: boolean; autocomplete: "on" | "off" }>;
    label: El<{ for: IdRef }>;
    input: Void<FormControl & { type: InputType; value: string | number; checked: boolean; placeholder: string; readonly: boolean; min: string | number; max: string | number; step: number | "any"; minlength: number; maxlength: number; pattern: string; autocomplete: string; list: IdRef; multiple: boolean; accept: string; inputmode: "text" | "numeric" | "decimal" | "tel" | "email" | "url" | "search" | "none" }>;
    textarea: El<FormControl & { value: string; rows: number; cols: number; placeholder: string; readonly: boolean; minlength: number; maxlength: number; autocomplete: string }>;
    select: El<FormControl & { value: string | number; multiple: boolean; autocomplete: string }>;
    option: El<{ value: string | number; selected: boolean; disabled: boolean; label: string }>;
    optgroup: El<{ label: string; disabled: boolean }>;
    output: El<{ for: IdRef; name: string }>;
    progress: El<{ value: number; max: number }>;
    meter: El<{ value: number; min: number; max: number; low: number; high: number; optimum: number }>;
    dialog: El<{ open: boolean; closedby: "any" | "closerequest" | "none" }>;
    details: El<{ open: boolean; name: string }>;
    img: Opt<Global & { srcset: string; sizes: string; width: number; height: number; loading: "lazy" | "eager"; decoding: "async" | "sync" | "auto"; fetchpriority: "high" | "low" | "auto" }> & Need<{ src: string; alt: string }> & { children?: never };
    iframe: El<{ src: string; srcdoc: string; sandbox: string; name: string; width: number; height: number; loading: "lazy" | "eager"; allow: string; referrerpolicy: string }>;
    video: El<{ src: string; poster: string; controls: boolean; autoplay: boolean; muted: boolean; loop: boolean; playsinline: boolean; preload: "none" | "metadata" | "auto"; width: number; height: number }>;
    audio: El<{ src: string; controls: boolean; autoplay: boolean; muted: boolean; loop: boolean; preload: "none" | "metadata" | "auto" }>;
    source: Void<{ src: string; srcset: string; type: string; media: string; sizes: string }>;
    track: Void<{ src: string; kind: "subtitles" | "captions" | "descriptions" | "chapters" | "metadata"; srclang: string; label: string; default: boolean }>;
    script: Opt<Global & { src: string; type: "module" | "application/json" | "application/ld+json" | "importmap"; defer: boolean; async: boolean; nonce: string; integrity: string; crossorigin: "anonymous" | "use-credentials" }> & { children?: Html };
    style: Opt<Global & { nonce: string; media: string }> & { children?: Html };
    link: Void<{ rel: string; href: string; type: string; media: string; sizes: string; as: string; crossorigin: "anonymous" | "use-credentials"; integrity: string }>;
    meta: Void<{ name: string; content: string; charset: "utf-8"; property: string }>;
    base: Void<{ href: string; target: string }>;
    td: El<{ colspan: number; rowspan: number; headers: string }>;
    th: El<{ colspan: number; rowspan: number; headers: string; scope: "row" | "col" | "rowgroup" | "colgroup"; abbr: string }>;
    col: Void<{ span: number }>;
    ol: El<{ start: number; reversed: boolean; type: "1" | "a" | "A" | "i" | "I" }>;
    time: El<{ datetime: string }>;
    blockquote: El<{ cite: string }>;
    ins: El<{ cite: string; datetime: string }>;
    del: El<{ cite: string; datetime: string }>;
    canvas: El<{ width: number; height: number }>;
    template: El<{ shadowrootmode: "open" | "closed" }>;
    br: Void;
    hr: Void;
    wbr: Void;
    area: Void<{ href: RouteCallOrUrlValue; alt: string; coords: string; shape: "rect" | "circle" | "poly" | "default" }>;
    embed: Void<{ src: string; type: string; width: number; height: number }>;
    object: El<{ data: string; type: string; name: string; width: number; height: number }>;
  };
}
