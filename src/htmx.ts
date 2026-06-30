// ------------------------------------
// HTMX Type Definitions for Fluent HTML
// Compatible with HTMX 4.0+
// ------------------------------------

import type { Id} from "./ids.js";
import { isId } from "./ids.js";

// HTTP Methods
export type HxHttpMethod = "get" | "post" | "put" | "patch" | "delete";

// Encoding types
export type HxEncoding = "multipart/form-data";

// Shared timing values
type DelayValue = '100ms' | '200ms' | '300ms' | '500ms' | '1s';

// Swap strategies
export type HxSwapStyle =
  | 'innerHTML'      // Default - replace inner content
  | 'outerHTML'      // Replace entire element
  | 'textContent'    // Replace text content only
  | 'beforebegin'    // Insert before element
  | 'afterbegin'     // Insert at start of element
  | 'beforeend'      // Insert at end of element
  | 'afterend'       // Insert after element
  | 'before'         // Short alias for beforebegin
  | 'after'          // Short alias for afterend
  | 'prepend'        // Short alias for afterbegin
  | 'append'         // Short alias for beforeend
  | 'innerMorph'     // Morph target's children
  | 'outerMorph'     // Morph target element itself
  | 'delete'         // Delete element
  | 'none';          // No swap

// Swap modifiers
type SwapScrollValue = 'scroll:top' | 'scroll:bottom' | 'scroll:window:top' | 'scroll:window:bottom';
type SwapShowValue = 'show:top' | 'show:bottom' | 'show:window:top' | 'show:window:bottom' | 'show:none';
type SwapTimingValue = `swap:${DelayValue}` | `settle:${DelayValue}`;
type SwapFocusScroll = 'focus-scroll:true' | 'focus-scroll:false';
type SwapTransition = 'transition:true';

type SwapModifier =
  | SwapScrollValue
  | SwapShowValue
  | SwapTimingValue
  | SwapFocusScroll
  | SwapTransition;

// Style + single modifier: "outerHTML scroll:top", "innerHTML transition:true"
type SwapWithModifier = `${HxSwapStyle} ${SwapModifier}`;

// Style + two modifiers: "outerHTML scroll:top swap:500ms"
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
export type HxSwap = HxSwapStyle | SwapWithModifier | SwapWithTwoModifiers;

// CSS Selectors (standard + HTMX extended)
type StandardCSSSelector = string;
type ExtendedCSSSelector =
  | 'this'
  | 'body'
  | 'window'
  | 'document'
  | `closest ${string}`
  | `next`
  | `next ${string}`
  | `previous`
  | `previous ${string}`
  | `find ${string}`;

export type HxTarget = StandardCSSSelector | ExtendedCSSSelector;

// Standard DOM events
type DOMEvent =
  | 'click'
  | 'dblclick'
  | 'mouseenter'
  | 'mouseleave'
  | 'mouseover'
  | 'mouseout'
  | 'mousedown'
  | 'mouseup'
  | 'keydown'
  | 'keyup'
  | 'keypress'
  | 'change'
  | 'input'
  | 'submit'
  | 'focus'
  | 'blur'
  | 'focusin'
  | 'focusout'
  | 'scroll'
  | 'resize'
  | 'touchstart'
  | 'touchend'
  | 'touchmove';

// HTMX-specific events
type HtmxEvent =
  | 'load'           // Fires on page load
  | 'revealed'       // Fires when element scrolls into viewport
  | 'intersect';     // Fires on intersection observer

// Basic trigger is a DOM or HTMX event
type BasicTrigger = DOMEvent | HtmxEvent;

// Trigger modifiers
type TriggerModifier = 'once' | 'changed' | 'consume';

// Event + modifier: "click once", "input changed", etc.
type ModifiedTrigger = `${BasicTrigger} ${TriggerModifier}`;

// Event + timing: "keyup delay:300ms", "scroll throttle:500ms"
type DelayedTrigger = `${BasicTrigger} delay:${DelayValue}`;
type ThrottledTrigger = `${BasicTrigger} throttle:${DelayValue}`;

// Event + changed + delay: "keyup changed delay:300ms"
type ChangedDelayTrigger = `${BasicTrigger} changed delay:${DelayValue}`;

// Polling triggers
type PollingTrigger = 'every 1s' | 'every 2s' | 'every 5s' | 'every 10s';

/**
 * HTMX Trigger type with deep autocomplete.
 *
 * Also accepts any valid trigger string for patterns not covered,
 * e.g. "click[ctrlKey]", "click, keyup", "keyup changed delay:300ms throttle:1s"
 */
export type HxTrigger =
  | BasicTrigger
  | ModifiedTrigger
  | DelayedTrigger
  | ThrottledTrigger
  | ChangedDelayTrigger
  | PollingTrigger
  | 'sse:message'
  | 'ws:message'
  | (string & {});

/**
 * HTMX Sync type
 * 
 * Supports:
 * - Basic: "drop", "abort", "replace", "queue"
 * - Queue variants: "queue first", "queue last", "queue all"
 * - With selector: "closest form:abort", "#other-form:drop"
 */
export type HxSync =
  | 'drop'
  | 'abort'
  | 'replace'
  | 'queue'
  | 'queue first'
  | 'queue last'
  | 'queue all'
  | (string & {});

// Per-element request configuration (replaces hx-request)
export type HxConfig = {
  timeout?: number;
  credentials?: boolean;
  mode?: 'cors' | 'same-origin' | 'no-cors';
};

// Status-code-specific swap behavior
export type HxStatusConfig = {
  swap?: HxSwap;
  target?: HxTarget;
  select?: string;
  push?: boolean | string;
  replace?: boolean | string;
  transition?: boolean;
};

type StatusDigit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
/**
 * A valid `hx-status` key — a numeric status code (`100`–`599`) or an `Nxx`
 * wildcard (`"1xx"`–`"5xx"`). Bare strings are rejected at compile time so a
 * malformed key cannot be concatenated into the attribute NAME (injection).
 */
export type HxStatusKey =
  | `${1 | 2 | 3 | 4 | 5}${StatusDigit}${StatusDigit}`
  | `${1 | 2 | 3 | 4 | 5}xx`;

// ------------------------------------
// Main HTMX Interface
// ------------------------------------

export interface HTMX {
  // Required
  endpoint: string;
  method: HxHttpMethod;

  // Targeting & Swapping
  target?: HxTarget;
  swap?: HxSwap;
  swapOob?: boolean | string;  // Out-of-band swap
  select?: string;             // Select content from response

  // Triggering
  trigger?: HxTrigger;

  // URL manipulation
  pushUrl?: boolean | string;
  replaceUrl?: boolean | string;

  // Data
  vals?: Record<string, unknown> | string;
  headers?: Record<string, string>;
  include?: string;
  encoding?: HxEncoding;

  // Validation & Confirmation
  validate?: boolean;
  confirm?: string;

  // Loading states
  indicator?: string;
  disable?: string;            // Elements to disable during request (was disabledElt)

  // Synchronization
  sync?: HxSync;

  // Preservation
  preserve?: boolean;          // Preserve element during swap

  // Boosting (for links/forms)
  boost?: boolean;

  // Ignore htmx processing — emits the bare `hx-ignore` boolean (htmx 4; was htmx 2's `hx-disable`)
  ignore?: boolean;

  // Per-element request configuration (replaces hx-request)
  config?: HxConfig | string;

  // Optimistic UI — show expected content before server responds
  optimistic?: boolean;

  // Preload on hover — cache response before click
  preload?: 'mousedown' | 'mouseover' | boolean;

  // Status-code-specific swap behavior
  status?: Partial<Record<HxStatusKey, string | HxStatusConfig>>;
}

// ------------------------------------
// Query Parameter Types
// ------------------------------------

/** Values accepted in a query-parameter object. `undefined` and `null` entries are silently skipped. */
export type QueryParamValue = string | number | boolean | undefined | null;

/** A bag of query parameters. */
export type QueryParams = Record<string, QueryParamValue>;

/**
 * Internal: append a query-params bag to a base endpoint, joining with `?` or `&` as
 * appropriate. Skips nullish entries; url-encodes keys and values. An empty or all-nullish
 * bag returns `base` unchanged (no stray separator). Shared by `hx()` and the route-callable
 * surface so both produce byte-identical query strings.
 */
export function buildQueryString(base: string, query: QueryParams): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(query)) {
    if (value == null) continue;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  }
  if (parts.length === 0) return base;
  const sep = base.includes("?") ? "&" : "?";
  return base + sep + parts.join("&");
}

// ------------------------------------
// Helper Functions
// ------------------------------------

/** Options for the `hx()` helper. Selector fields also accept `Id` objects. */
export type HxOptions = Partial<Omit<HTMX, 'endpoint' | 'method' | 'target' | 'select' | 'indicator' | 'disable' | 'include'>> & {
  method?: HxHttpMethod;
  target?: HxTarget | Id;
  select?: string | Id;
  indicator?: string | Id;
  disable?: string | Id;
  include?: string | Id;
  /**
   * Query parameters folded into the endpoint URL (via the join-aware `buildQueryString`):
   * nullish entries are skipped and values are url-encoded. Join-aware — if `endpoint` already
   * contains a `?`, params are appended with `&`.
   *
   * PREFER a typed route callable (`taskRoutes.list({ query })`) when the route is modeled by
   * `defineRoutes`; this bag is the escape hatch for ad-hoc URLs. Distinct from `vals`
   * (hx-vals): `query` writes the request URL and url-encodes; `vals` adds to the request
   * body and is not url-encoded — never use `vals` to build a URL query string.
   */
  query?: QueryParams;
};

/**
 * Resolve a string or `Id` to its CSS selector string.
 *
 * @param value - A raw CSS selector string, an `Id` object, or undefined
 * @returns The resolved selector string, or undefined if falsy
 *
 * @example
 * resolveSelector(ids.userList) // "#user-list"
 * resolveSelector("#my-el")    // "#my-el"
 * resolveSelector(undefined)   // undefined
 */
export function resolveSelector(value: string | Id | undefined): string | undefined {
  if (!value) return undefined;
  return isId(value) ? value.selector : value;
}

/**
 * Create an HTMX configuration object for use with `.setHtmx()`.
 *
 * Resolves `Id` objects in target/select/indicator/disable/include to their selectors.
 * Defaults to `method: "get"` if not specified.
 *
 * @param endpoint - The URL endpoint for the HTMX request
 * @param options - HTMX options (method, target, swap, trigger, etc.)
 * @returns A fully resolved `HTMX` object
 *
 * @example
 * hx("/api/items")
 * hx("/api/save", { method: "post", target: ids.result, swap: "outerMorph" })
 * // Ad-hoc string endpoint (escape hatch) — folds query into the URL:
 * hx("/search", { query: { q: term, scope: "open" } })   // → hx-get="/search?q=…&scope=open"
 * // Join-aware: a base that already carries a query string joins with "&":
 * hx("/search?event=E", { query: { q: term } })           // → hx-get="/search?event=E&q=…"
 *
 * @remarks
 * PREFER a typed route callable (`taskRoutes.list({ query })`) whenever the route is modeled
 * by `defineRoutes` — it single-sources the path and types params. The `query` bag here is the
 * escape hatch for ad-hoc URLs not modeled by a route (e.g. a `searchUrl` component prop). It is
 * join-aware: if `endpoint` already contains a `?`, params are appended with `&`, so a
 * fully-resolved URL from `.resolve(params, query)` is safe to pass. `query` writes the request
 * URL and url-encodes its keys/values; it is DISTINCT from `vals` (hx-vals), which adds values to
 * the request body and is not url-encoded — never reach for `vals` to build a query string.
 */
export function hx(
  endpoint: string,
  options: HxOptions = {}
): HTMX {
  const { method, target, select, indicator, disable, include, query, ...rest } = options;
  return {
    endpoint: query ? buildQueryString(endpoint, query) : endpoint,
    method: method ?? "get",
    target: resolveSelector(target),
    select: resolveSelector(select),
    indicator: resolveSelector(indicator),
    disable: resolveSelector(disable),
    include: resolveSelector(include),
    ...rest,
  };
}

/**
 * Create an ID selector for hx-target.
 *
 * @param elementId - The element ID (without `#`)
 * @returns The CSS ID selector string
 * @example hx("/api", { target: id("content") }) // hx-target="#content"
 */
export function id(elementId: string): HxTarget {
  return `#${elementId}`;
}

/**
 * Create a class selector for hx-target.
 *
 * @param className - The class name (without `.`)
 * @returns The CSS class selector string
 * @example hx("/api", { target: clss("items") }) // hx-target=".items"
 */
export function clss(className: string): HxTarget {
  return `.${className}`;
}

/**
 * Create a `closest` ancestor selector for hx-target.
 *
 * @param selector - CSS selector to match the closest ancestor
 * @returns The HTMX extended selector string
 * @example hx("/api", { target: closest("tr") }) // hx-target="closest tr"
 */
export function closest(selector: string): HxTarget {
  return `closest ${selector}`;
}

/**
 * Create a `find` descendant selector for hx-target.
 *
 * @param selector - CSS selector to find within descendants
 * @returns The HTMX extended selector string
 * @example hx("/api", { target: find(".content") }) // hx-target="find .content"
 */
export function find(selector: string): HxTarget {
  return `find ${selector}`;
}

/**
 * Create a `next` sibling selector for hx-target.
 *
 * @param selector - Optional CSS selector to match the next sibling
 * @returns The HTMX extended selector string
 * @example hx("/api", { target: next("div") }) // hx-target="next div"
 */
export function next(selector?: string): HxTarget {
  return selector ? `next ${selector}` : 'next';
}

/**
 * Create a `previous` sibling selector for hx-target.
 *
 * @param selector - Optional CSS selector to match the previous sibling
 * @returns The HTMX extended selector string
 * @example hx("/api", { target: previous("div") }) // hx-target="previous div"
 */
export function previous(selector?: string): HxTarget {
  return selector ? `previous ${selector}` : 'previous';
}
