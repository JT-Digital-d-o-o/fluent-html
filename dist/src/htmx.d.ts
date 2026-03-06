import { Id } from "./ids.js";
export type HxHttpMethod = "get" | "post" | "put" | "patch" | "delete";
export type HxEncoding = "multipart/form-data";
type DelayValue = '100ms' | '200ms' | '300ms' | '500ms' | '1s';
export type HxSwapStyle = 'innerHTML' | 'outerHTML' | 'textContent' | 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend' | 'before' | 'after' | 'prepend' | 'append' | 'innerMorph' | 'outerMorph' | 'delete' | 'none';
type SwapScrollValue = 'scroll:top' | 'scroll:bottom';
type SwapShowValue = 'show:top' | 'show:bottom';
type SwapTimingValue = `swap:${DelayValue}` | `settle:${DelayValue}`;
type SwapFocusScroll = 'focus-scroll:true' | 'focus-scroll:false';
type SwapTransition = 'transition:true';
type SwapModifier = SwapScrollValue | SwapShowValue | SwapTimingValue | SwapFocusScroll | SwapTransition;
type SwapWithModifier = `${HxSwapStyle} ${SwapModifier}`;
type SwapWithTwoModifiers = `${HxSwapStyle} ${SwapScrollValue | SwapShowValue} ${SwapTimingValue | SwapTransition}`;
/**
 * HTMX Swap type with deep autocomplete.
 *
 * Supports:
 * - Basic: "innerHTML", "outerHTML", "beforeend", etc.
 * - With modifier: "outerHTML scroll:top", "innerHTML transition:true"
 * - With two modifiers: "outerHTML scroll:top swap:500ms"
 *
 * Also accepts any valid swap string for patterns not covered.
 */
export type HxSwap = HxSwapStyle | SwapWithModifier | SwapWithTwoModifiers | (string & {});
type StandardCSSSelector = string;
type ExtendedCSSSelector = 'this' | 'body' | 'window' | 'document' | `closest ${string}` | `next` | `next ${string}` | `previous` | `previous ${string}` | `find ${string}`;
export type HxTarget = StandardCSSSelector | ExtendedCSSSelector;
type DOMEvent = 'click' | 'dblclick' | 'mouseenter' | 'mouseleave' | 'mouseover' | 'mouseout' | 'mousedown' | 'mouseup' | 'keydown' | 'keyup' | 'keypress' | 'change' | 'input' | 'submit' | 'focus' | 'blur' | 'focusin' | 'focusout' | 'scroll' | 'resize' | 'touchstart' | 'touchend' | 'touchmove';
type HtmxEvent = 'load' | 'revealed' | 'intersect';
type BasicTrigger = DOMEvent | HtmxEvent;
type TriggerModifier = 'once' | 'changed' | 'consume';
type ModifiedTrigger = `${BasicTrigger} ${TriggerModifier}`;
type DelayedTrigger = `${BasicTrigger} delay:${DelayValue}`;
type ThrottledTrigger = `${BasicTrigger} throttle:${DelayValue}`;
type ChangedDelayTrigger = `${BasicTrigger} changed delay:${DelayValue}`;
type PollingTrigger = 'every 1s' | 'every 2s' | 'every 5s' | 'every 10s';
/**
 * HTMX Trigger type with deep autocomplete.
 *
 * Also accepts any valid trigger string for patterns not covered,
 * e.g. "click[ctrlKey]", "click, keyup", "keyup changed delay:300ms throttle:1s"
 */
export type HxTrigger = BasicTrigger | ModifiedTrigger | DelayedTrigger | ThrottledTrigger | ChangedDelayTrigger | PollingTrigger | 'sse:message' | 'ws:message' | (string & {});
/**
 * HTMX Sync type
 *
 * Supports:
 * - Basic: "drop", "abort", "replace", "queue"
 * - Queue variants: "queue first", "queue last", "queue all"
 * - With selector: "closest form:abort", "#other-form:drop"
 */
export type HxSync = 'drop' | 'abort' | 'replace' | 'queue' | 'queue first' | 'queue last' | 'queue all' | (string & {});
export type HxConfig = {
    timeout?: number;
    credentials?: boolean;
    mode?: 'cors' | 'same-origin' | 'no-cors';
};
export type HxStatusConfig = {
    swap?: HxSwap;
    target?: HxTarget;
    select?: string;
    push?: boolean | string;
    replace?: boolean | string;
    transition?: boolean;
};
export interface HTMX {
    endpoint: string;
    method: HxHttpMethod;
    target?: HxTarget;
    swap?: HxSwap;
    swapOob?: boolean | string;
    select?: string;
    trigger?: HxTrigger;
    pushUrl?: boolean | string;
    replaceUrl?: boolean | string;
    vals?: Record<string, any> | string;
    headers?: Record<string, string>;
    include?: string;
    encoding?: HxEncoding;
    validate?: boolean;
    confirm?: string;
    indicator?: string;
    disable?: string;
    sync?: HxSync;
    preserve?: boolean;
    boost?: boolean;
    ignore?: boolean;
    config?: HxConfig | string;
    optimistic?: boolean;
    preload?: 'mousedown' | 'mouseover' | boolean;
    status?: Record<string, string | HxStatusConfig>;
}
/** Options for the `hx()` helper. Derived from HTMX — `target` also accepts an `Id` object. */
export type HxOptions = Partial<Omit<HTMX, 'endpoint' | 'method' | 'target'>> & {
    method?: HxHttpMethod;
    target?: HxTarget | Id;
};
export declare function hx(endpoint: string, options?: HxOptions): HTMX;
/**
 * Create an ID selector for hx-target
 * @example hx("/api", { target: id("content") }) // hx-target="#content"
 */
export declare function id(elementId: string): HxTarget;
/**
 * Create a class selector for hx-target
 * @example hx("/api", { target: clss("items") }) // hx-target=".items"
 */
export declare function clss(className: string): HxTarget;
/**
 * Create a 'closest' selector for hx-target
 * @example hx("/api", { target: closest("tr") }) // hx-target="closest tr"
 */
export declare function closest(selector: string): HxTarget;
/**
 * Create a 'find' selector for hx-target
 * @example hx("/api", { target: find(".content") }) // hx-target="find .content"
 */
export declare function find(selector: string): HxTarget;
/**
 * Create a 'next' selector for hx-target
 * @example hx("/api", { target: next("div") }) // hx-target="next div"
 */
export declare function next(selector?: string): HxTarget;
/**
 * Create a 'previous' selector for hx-target
 * @example hx("/api", { target: previous("div") }) // hx-target="previous div"
 */
export declare function previous(selector?: string): HxTarget;
export {};
//# sourceMappingURL=htmx.d.ts.map