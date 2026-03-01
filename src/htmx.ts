// ------------------------------------
// HTMX Type Definitions for Fluent HTML
// Compatible with HTMX 4.0+
// ------------------------------------

import { Id, isId } from "./ids.js";

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
type SwapScrollValue = 'scroll:top' | 'scroll:bottom';
type SwapShowValue = 'show:top' | 'show:bottom';
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
export type HxSwap = HxSwapStyle | SwapWithModifier | SwapWithTwoModifiers | (string & {});

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
  vals?: Record<string, any> | string;
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

  // Ignore htmx processing (was disable)
  ignore?: boolean;

  // Per-element request configuration (replaces hx-request)
  config?: HxConfig | string;

  // Optimistic UI — show expected content before server responds
  optimistic?: boolean;

  // Preload on hover — cache response before click
  preload?: 'mousedown' | 'mouseover' | boolean;

  // Status-code-specific swap behavior
  status?: Record<string, string | HxStatusConfig>;
}

// ------------------------------------
// Helper Functions
// ------------------------------------

/** Options for the `hx()` helper. Derived from HTMX — `target` also accepts an `Id` object. */
export type HxOptions = Partial<Omit<HTMX, 'endpoint' | 'method' | 'target'>> & {
  method?: HxHttpMethod;
  target?: HxTarget | Id;
};

export function hx(
  endpoint: string,
  options: HxOptions = {}
): HTMX {
  const { method, target, ...rest } = options;
  return {
    endpoint,
    method: method ?? "get",
    target: target ? (isId(target) ? target.selector : target) : undefined,
    ...rest,
  };
}

/**
 * Create an ID selector for hx-target
 * @example hx("/api", { target: id("content") }) // hx-target="#content"
 */
export function id(elementId: string): HxTarget {
  return `#${elementId}`;
}

/**
 * Create a class selector for hx-target
 * @example hx("/api", { target: clss("items") }) // hx-target=".items"
 */
export function clss(className: string): HxTarget {
  return `.${className}`;
}

/**
 * Create a 'closest' selector for hx-target
 * @example hx("/api", { target: closest("tr") }) // hx-target="closest tr"
 */
export function closest(selector: string): HxTarget {
  return `closest ${selector}`;
}

/**
 * Create a 'find' selector for hx-target
 * @example hx("/api", { target: find(".content") }) // hx-target="find .content"
 */
export function find(selector: string): HxTarget {
  return `find ${selector}`;
}

/**
 * Create a 'next' selector for hx-target
 * @example hx("/api", { target: next("div") }) // hx-target="next div"
 */
export function next(selector?: string): HxTarget {
  return selector ? `next ${selector}` : 'next';
}

/**
 * Create a 'previous' selector for hx-target
 * @example hx("/api", { target: previous("div") }) // hx-target="previous div"
 */
export function previous(selector?: string): HxTarget {
  return selector ? `previous ${selector}` : 'previous';
}