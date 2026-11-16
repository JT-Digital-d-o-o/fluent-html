// The JSX types: one row per sink. What a sink's type refuses, its encoder refuses too.
// Element attribute types are named interfaces so a diagnostic reads `InputAttrs`, not a
// 400-character intersection.
import type { Html, Child, Id, Route, Verb, Css, ScriptBody, Method } from "./index";
export { jsx, jsxs, jsxDEV, Fragment } from "./index";

declare const no: unique symbol;
/** A sink that is not writable. The type argument is the fix. */
export type No<Fix extends string> = { readonly [no]: Fix };

type ClassValue = string | false | null | undefined | readonly ClassValue[];
type CssScalar = string | number | false | null | undefined;
export interface StyleObject { readonly [property: string]: CssScalar }
type Bool = boolean | undefined;
type LinkUrl = string | Route<"page" | "none", "get">;
type HxName = "get" | "post" | "put" | "patch" | "delete" | "target" | "swap" | "trigger" | "vals" | "headers" | "confirm" | "include"
  | "push-url" | "replace-url" | "select" | "select-oob" | "swap-oob" | "indicator" | "boost" | "on" | "sync" | "ext" | "disable"
  | "encoding" | "params" | "preserve" | "validate" | "config" | "ignore" | "action" | "method" | "status" | "disabled-elt";

type HxAttrs = { [K in `hx-${HxName}`]?: No<"hx-* attributes are not writable. Use the hx prop: hx={swap(route)}, search(route), poll(route, '2s'), fire(route) or load(route); a link is <a href={route}>, a form is <form action={route}>"> };

export interface Attrs extends HxAttrs {
  class?: ClassValue;
  className?: ClassValue;
  id?: Id | string;
  style?: StyleObject | Css;
  hx?: Verb | undefined;
  key?: string | number;
  title?: string;
  lang?: string;
  dir?: "ltr" | "rtl" | "auto";
  role?: string;
  tabindex?: number;
  hidden?: Bool | "until-found";
  inert?: Bool;
  popover?: Bool | "auto" | "manual";
  draggable?: "true" | "false";
  dangerouslySetInnerHTML?: No<"there is no raw-HTML prop. Pass JSX children; html`...` holds literal markup; sanitize(markup) admits third-party HTML">;
  innerHTML?: No<"there is no raw-HTML prop. Pass JSX children; html`...` holds literal markup; sanitize(markup) admits third-party HTML">;
  [handler: `on${string}`]: No<"inline handlers are not writable. Use command/commandfor, popovertarget, or the hx prop"> | undefined;
  [data: `data-${string}`]: string | number | boolean | undefined;
  [aria: `aria-${string}`]: string | number | boolean | Id | undefined;
}
export interface Global extends Attrs { children?: Child }
export interface VoidAttrs extends Attrs { children?: never }

type AutoComplete = "off" | "on" | "name" | "email" | "username" | "new-password" | "current-password" | "one-time-code" | "organization" | "street-address" | "postal-code" | "country" | "tel" | "url";
interface FormControl { name?: string; disabled?: Bool; required?: Bool; autofocus?: Bool; form?: Id }

export interface AnchorAttrs extends Global { href?: LinkUrl; target?: "_blank" | "_self" | "_top"; rel?: string; download?: string | true }
export interface ButtonAttrs extends Global, FormControl {
  /** Omitted: "button" when the button carries hx, command or popovertarget, otherwise "submit". */
  type?: "submit" | "button" | "reset";
  value?: string;
  formaction?: string | Route<RouteKindAny, Method>;
  command?: "show-modal" | "close" | "request-close" | "show-popover" | "hide-popover" | "toggle-popover" | `--${string}`;
  commandfor?: Id;
  popovertarget?: Id;
}
type RouteKindAny = "page" | "fragment" | "none";
export interface FormAttrs extends Global { action?: string | Route<RouteKindAny, Method>; method?: "get" | "post" | "dialog"; enctype?: "multipart/form-data"; novalidate?: Bool; autocomplete?: "on" | "off" }
export interface InputAttrs extends VoidAttrs, FormControl {
  type?: "text" | "email" | "password" | "number" | "search" | "url" | "tel" | "date" | "time" | "datetime-local" | "checkbox" | "radio" | "file" | "hidden" | "range" | "color";
  value?: string | number; placeholder?: string; checked?: Bool; readonly?: Bool; multiple?: Bool;
  min?: string | number; max?: string | number; step?: string | number; minlength?: number; maxlength?: number; pattern?: string;
  autocomplete?: AutoComplete; accept?: string; list?: Id; inputmode?: "text" | "numeric" | "decimal" | "email" | "tel" | "url" | "search" | "none";
}
export interface TextareaAttrs extends Attrs, FormControl { children?: string | number; rows?: number; cols?: number; placeholder?: string; readonly?: Bool; minlength?: number; maxlength?: number; autocomplete?: AutoComplete }
export interface SelectAttrs extends Global, FormControl { multiple?: Bool; autocomplete?: AutoComplete }
export interface OptionAttrs extends Global { value?: string | number; selected?: Bool; disabled?: Bool; label?: string }
export interface LabelAttrs extends Global { for?: Id | string; htmlFor?: Id | string }
export interface ImgAttrs extends VoidAttrs { src: string; alt: string; width?: number; height?: number; loading?: "lazy" | "eager"; decoding?: "async" | "sync" | "auto"; srcset?: string; sizes?: string }
export interface IframeAttrs extends VoidAttrs { src?: string; srcdoc?: string | Html; sandbox?: string | true; width?: number; height?: number; loading?: "lazy" | "eager"; allow?: string }
export interface ScriptAttrs extends Attrs { children?: ScriptBody; src?: `/${string}`; type?: "module" | "application/json" | "application/ld+json"; defer?: Bool; async?: Bool }
export interface StyleAttrs extends Attrs { children: Css; media?: string }
export interface TitleAttrs extends Attrs { children?: string | number | readonly (string | number)[] }
export interface DialogAttrs extends Global { open?: Bool; closedby?: "any" | "closerequest" | "none" }
export interface DetailsAttrs extends Global { open?: Bool; name?: string }
export interface MetaAttrs extends VoidAttrs { name?: string; content?: string; charset?: "utf-8"; property?: string }
export interface LinkAttrs extends VoidAttrs { rel: "stylesheet" | "icon" | "preload" | "canonical" | "manifest"; href: `/${string}` | Route<"page" | "none", "get">; as?: string; type?: string; media?: string }
export interface CellAttrs extends Global { colspan?: number; rowspan?: number; headers?: Id | readonly Id[]; scope?: "col" | "row" | "colgroup" | "rowgroup" }
export interface TimeAttrs extends Global { datetime?: string }
export interface OlAttrs extends Global { start?: number; reversed?: Bool }
export interface ProgressAttrs extends Global { value?: number; max?: number }

type PlainTag = "html" | "head" | "body" | "main" | "header" | "footer" | "nav" | "section" | "article" | "aside" | "div" | "span" | "p"
  | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "ul" | "li" | "dl" | "dt" | "dd" | "table" | "thead" | "tbody" | "tfoot" | "tr" | "caption"
  | "fieldset" | "legend" | "summary" | "figure" | "figcaption" | "blockquote" | "pre" | "code" | "em" | "strong" | "small" | "b" | "i"
  | "mark" | "abbr" | "address" | "search" | "hgroup" | "kbd" | "sub" | "sup";

type Elements = {
  a: AnchorAttrs; button: ButtonAttrs; form: FormAttrs; input: InputAttrs; textarea: TextareaAttrs; select: SelectAttrs;
  option: OptionAttrs; label: LabelAttrs; img: ImgAttrs; iframe: IframeAttrs; script: ScriptAttrs; style: StyleAttrs;
  title: TitleAttrs; dialog: DialogAttrs; details: DetailsAttrs; meta: MetaAttrs; link: LinkAttrs; td: CellAttrs; th: CellAttrs;
  time: TimeAttrs; ol: OlAttrs; progress: ProgressAttrs; br: VoidAttrs; hr: VoidAttrs; wbr: VoidAttrs;
} & { [T in PlainTag]: Global };

export namespace JSX {
  export type Element = Html;
  export interface ElementChildrenAttribute { children: {} }
  export interface IntrinsicAttributes { key?: string | number }
  export type IntrinsicElements = Elements;
}
