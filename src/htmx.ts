// ------------------------------------
// HTMX Type Definitions for Fluent HTML
// Compatible with HTMX 4.0+
// ------------------------------------

import type { Id} from "./ids.js";
import { isId } from "./ids.js";

// ------------------------------------
// Branded Route Strings (8.0.0)
// ------------------------------------

declare const RouteBrand: unique symbol;

/**
 * A URL string proven to come from the typed route system. Route-bearing sinks
 * (`hx()`, `setHtmx()`, `hxGet`/`hxPost`, `AnchorTag.setHref`, and app-side
 * `reply.redirect` wrappers) accept only this brand or an {@link ExternalHref},
 * so hardcoded route strings, hand-concatenated query strings, and raw user
 * input all fail to compile. Three ways to produce one:
 *
 * 1. `route.resolve(params?, query?)` or a route callable from `defineRoutes`
 *    — the normal path; `.resolve({ query })` is the only query-string path
 *    (concatenation loses the brand).
 * 2. `externalUrl(u)` for a runtime-computed TRUE external URL (payment
 *    provider redirects, presigned storage URLs). Literal `https://…`,
 *    `mailto:…`, `tel:…`, and `#…` strings already pass as {@link ExternalHref}
 *    with zero ceremony.
 * 3. `validateReturnTo(raw)` (app auth core) for user-supplied return targets
 *    — never pass request input into a sink directly.
 *
 * `assetUrl("/favicon.svg")` covers static assets no route models.
 */
export type ResolvedRoute = string & { readonly [RouteBrand]: true };

/**
 * A literal external (non-route) href — `https://`/`http://` URLs, `mailto:`,
 * `tel:`, and same-page `#fragment` targets. Literals of these shapes pass the
 * route-bearing sinks directly; a runtime-computed external URL goes through
 * {@link externalUrl}.
 */
export type ExternalHref =
  | `https://${string}`
  | `http://${string}`
  | `mailto:${string}`
  | `tel:${string}`
  | `#${string}`;

/**
 * Mark a runtime-computed TRUE external URL (Stripe checkout, OAuth authorize,
 * presigned storage URL) as safe for the route-bearing sinks. Runtime identity
 * — this is a type-level assertion, not validation; never pass user input.
 */
export function externalUrl(url: string): ExternalHref {
  return url as ExternalHref;
}

/**
 * Mark a static asset path (`/favicon.svg`, `/apple-touch-icon.png`) — a URL
 * served outside the route system — as a {@link ResolvedRoute}. Runtime
 * identity — a type-level assertion; never pass user input.
 */
export function assetUrl(path: string): ResolvedRoute {
  return path as ResolvedRoute;
}

// HTTP Methods
export type HxHttpMethod = "get" | "post" | "put" | "patch" | "delete";

// Encoding types
export type HxEncoding = "multipart/form-data";

// Shared timing values. The named literals drive autocomplete; the `${number}` templates
// keep the union typed (no bare `string`) while accepting any numeric delay htmx allows
// (`settle:250ms`, `swap:1.5s`) — the fixed 5-value set rejected valid swaps before.
type DelayValue = '100ms' | '200ms' | '300ms' | '500ms' | '1s' | `${number}ms` | `${number}s`;

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
type SwapIgnoreTitle = 'ignoreTitle:true';

type SwapModifier =
  | SwapScrollValue
  | SwapShowValue
  | SwapTimingValue
  | SwapFocusScroll
  | SwapTransition
  | SwapIgnoreTitle;

// Style + single modifier: "outerHTML scroll:top", "innerHTML transition:true"
type SwapWithModifier = `${HxSwapStyle} ${SwapModifier}`;

// Style + two modifiers: "outerHTML scroll:top swap:500ms"
type SwapWithTwoModifiers = `${HxSwapStyle} ${SwapScrollValue | SwapShowValue} ${SwapTimingValue | SwapTransition}`;

/**
 * HTMX swap spec with deep autocomplete. A **closed** union — a typo (`"innerHTM"`,
 * `"scroll:middle"`) is a compile error.
 *
 * Covers:
 * - Style only: `"innerHTML"`, `"outerHTML"`, `"beforeend"`, `"outerMorph"`, …
 * - Style + one modifier: `"outerHTML scroll:top"`, `"innerHTML settle:250ms"`, `"outerHTML ignoreTitle:true"`
 * - Style + a positional + a timing/transition modifier: `"outerHTML scroll:top swap:500ms"`
 *
 * Delays accept any `${n}ms`/`${n}s`. For an exotic combination this union does not
 * model (three+ modifiers, or `scroll:<selector>:top` element targeting), drop to the
 * explicit escape hatch: `.addAttribute("hx-swap", "…")`.
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

// Polling triggers.
//
// A polled element must pair `every …` with `target: "this"` and a REMOVING swap
// (`outerHTML`) — never a morph. htmx clears an `every` timer only when the polled
// node leaves the DOM; a morph keeps the old node (and its timer) alive after a
// settled re-render drops the trigger. The stale tick then fires with no hx-get,
// fetches the page URL, and nests the full document inside the element.
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
  // Required — branded (8.0.0): a hand-written bag with a raw route string
  // fails to compile; build endpoints with a route callable or hx().
  endpoint: ResolvedRoute | ExternalHref;
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
  endpoint: ResolvedRoute | ExternalHref,
  options: HxOptions = {}
): HTMX {
  const { method, target, select, indicator, disable, include, query, ...rest } = options;
  return {
    endpoint: (query ? buildQueryString(endpoint, query) : endpoint) as ResolvedRoute,
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
