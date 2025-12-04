// ------------------------------------
// HTMX Type Definitions for Lambda.html
// Compatible with HTMX 2.0+
// ------------------------------------

// HTTP Methods
export type HxHttpMethod = "get" | "post" | "put" | "patch" | "delete";

// Encoding types
export type HxEncoding = "multipart/form-data";

// Swap strategies
export type HxSwapStyle =
  | 'innerHTML'      // Default - replace inner content
  | 'outerHTML'      // Replace entire element
  | 'textContent'    // Replace text content only
  | 'beforebegin'    // Insert before element
  | 'afterbegin'     // Insert at start of element
  | 'beforeend'      // Insert at end of element
  | 'afterend'       // Insert after element
  | 'delete'         // Delete element
  | 'none';          // No swap

/**
 * HTMX Swap type
 * 
 * Supports:
 * - Basic: "innerHTML", "outerHTML", "beforeend", etc.
 * - With modifiers: "innerHTML scroll:top", "outerHTML transition:true"
 * - Multiple modifiers: "innerHTML swap:500ms settle:100ms"
 * 
 * Uses string type with union for common cases to enable autocomplete
 * while allowing any valid swap string with modifiers.
 */
export type HxSwap = HxSwapStyle | (string & {});

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

/**
 * HTMX Trigger type
 * 
 * Supports:
 * - Basic events: "click", "load", "revealed", etc.
 * - With modifiers: "click once", "keyup changed delay:300ms"
 * - Polling: "every 1s", "every 500ms"
 * - Filters: "click[ctrlKey]", "keyup[key=='Enter']"
 * - SSE/WS: "sse:message", "ws:message"
 * - Multiple: "click, keyup"
 * 
 * Uses string type with union for common cases to enable autocomplete
 * while allowing any valid trigger string.
 */
export type HxTrigger = BasicTrigger | (string & {});

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
  selectOob?: string;          // Select OOB content

  // Triggering
  trigger?: HxTrigger;

  // URL manipulation
  pushUrl?: boolean | string;
  replaceUrl?: boolean | string;

  // Data
  vals?: Record<string, any> | string;
  headers?: Record<string, string>;
  include?: string;
  params?: string;             // Filter params: '*', 'none', 'not x', 'x,y'
  encoding?: HxEncoding;

  // Validation & Confirmation
  validate?: boolean;
  confirm?: string;
  prompt?: string;

  // Loading states
  indicator?: string;
  disabledElt?: string;        // Elements to disable during request

  // Synchronization
  sync?: HxSync;

  // Extensions
  ext?: string;

  // Inheritance control
  disinherit?: string;         // Disable inheritance: '*' or 'hx-*'
  inherit?: string;            // Force inheritance

  // History
  history?: boolean;           // Prevent history snapshot
  historyElt?: boolean;        // Use this element for history

  // Preservation
  preserve?: boolean;          // Preserve element during swap

  // Request configuration
  request?: string;            // 'timeout:1000' | 'credentials:true' | 'noHeaders:true'

  // Boosting (for links/forms)
  boost?: boolean;

  // Disable htmx processing
  disable?: boolean;
}

// ------------------------------------
// Helper Functions
// ------------------------------------

export function hx(
  endpoint: string,
  options: {
    method?: HxHttpMethod;
    target?: HxTarget;
    swap?: HxSwap;
    swapOob?: boolean | string;
    select?: string;
    selectOob?: string;
    trigger?: HxTrigger;
    pushUrl?: boolean | string;
    replaceUrl?: boolean | string;
    vals?: Record<string, any> | string;
    headers?: Record<string, string>;
    include?: string;
    params?: string;
    encoding?: HxEncoding;
    validate?: boolean;
    confirm?: string;
    prompt?: string;
    indicator?: string;
    disabledElt?: string;
    sync?: HxSync;
    ext?: string;
    disinherit?: string;
    inherit?: string;
    history?: boolean;
    historyElt?: boolean;
    preserve?: boolean;
    request?: string;
    boost?: boolean;
    disable?: boolean;
  } = {}
): HTMX {
  return {
    endpoint,
    method: options.method ?? "get",
    target: options.target,
    swap: options.swap,
    swapOob: options.swapOob,
    select: options.select,
    selectOob: options.selectOob,
    trigger: options.trigger,
    pushUrl: options.pushUrl,
    replaceUrl: options.replaceUrl,
    vals: options.vals,
    headers: options.headers,
    include: options.include,
    params: options.params,
    encoding: options.encoding,
    validate: options.validate,
    confirm: options.confirm,
    prompt: options.prompt,
    indicator: options.indicator,
    disabledElt: options.disabledElt,
    sync: options.sync,
    ext: options.ext,
    disinherit: options.disinherit,
    inherit: options.inherit,
    history: options.history,
    historyElt: options.historyElt,
    preserve: options.preserve,
    request: options.request,
    boost: options.boost,
    disable: options.disable,
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