// ------------------------------------
// Common UI Patterns for Fluent HTML
// ------------------------------------
//
// This module provides reusable component patterns and layout helpers
// built on top of the core fluent-html API.

import type { View } from "./core/types.js";
import { Tag } from "./core/tag.js";
import { Div } from "./elements/structural.js";
import { Span } from "./elements/text.js";
import { Ul, Li } from "./elements/lists.js";
import { Input, Label } from "./elements/forms.js";
import { render } from "./render/render.js";
import { IfThen, ForEach } from "./control/index.js";
import { hx, HxTarget, HxSwap, HxSwapStyle } from "./htmx.js";
import { Id, isId } from "./ids.js";

// ------------------------------------
// Layout Helpers
// ------------------------------------

/**
 * Create a vertical stack layout (flex column).
 *
 * @param children - Child elements to stack vertically
 * @param options - Layout options
 * @returns Div with flex column layout
 *
 * @example
 * VStack([
 *   H1("Title"),
 *   P("Content"),
 *   Button("Action")
 * ], { spacing: "1rem", align: "center" })
 */
export function VStack(
  children: View,
  options: {
    spacing?: string;
    align?: "stretch" | "flex-start" | "flex-end" | "center" | "baseline";
    justify?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
    className?: string;
  } = {}
): Tag {
  return Div(children)
    .setStyles({
      display: "flex",
      flexDirection: "column",
      gap: options.spacing ?? "0",
      alignItems: options.align ?? "stretch",
      justifyContent: options.justify ?? "flex-start",
    })
    .addClass(options.className ?? "");
}

/**
 * Create a horizontal stack layout (flex row).
 *
 * @param children - Child elements to stack horizontally
 * @param options - Layout options
 * @returns Div with flex row layout
 *
 * @example
 * HStack([
 *   Button("Cancel"),
 *   Button("Save")
 * ], { spacing: "0.5rem", justify: "flex-end" })
 */
export function HStack(
  children: View,
  options: {
    spacing?: string;
    align?: "stretch" | "flex-start" | "flex-end" | "center" | "baseline";
    justify?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
    className?: string;
  } = {}
): Tag {
  return Div(children)
    .setStyles({
      display: "flex",
      flexDirection: "row",
      gap: options.spacing ?? "0",
      alignItems: options.align ?? "center",
      justifyContent: options.justify ?? "flex-start",
    })
    .addClass(options.className ?? "");
}

/**
 * Create a CSS grid layout.
 *
 * @param children - Child elements to arrange in grid
 * @param options - Grid options
 * @returns Div with grid layout
 *
 * @example
 * Grid([Item1, Item2, Item3, Item4], {
 *   columns: 2,
 *   gap: "1rem"
 * })
 *
 * // Or with custom template:
 * Grid([...], {
 *   columns: "1fr 2fr 1fr",
 *   rows: "auto 1fr auto"
 * })
 */
export function Grid(
  children: View,
  options: {
    columns?: number | string;
    rows?: string;
    gap?: string;
    columnGap?: string;
    rowGap?: string;
    className?: string;
  } = {}
): Tag {
  const gridTemplateColumns =
    typeof options.columns === "number"
      ? `repeat(${options.columns}, 1fr)`
      : options.columns ?? "1fr";

  const styles: Record<string, string> = {
    display: "grid",
    gridTemplateColumns,
  };

  if (options.rows) styles.gridTemplateRows = options.rows;
  if (options.gap) styles.gap = options.gap;
  if (options.columnGap) styles.columnGap = options.columnGap;
  if (options.rowGap) styles.rowGap = options.rowGap;

  return Div(children)
    .setStyles(styles)
    .addClass(options.className ?? "");
}

// ------------------------------------
// HTMX Pattern Helpers
// ------------------------------------

/**
 * Create a debounced search input with HTMX.
 *
 * @param options - Search input configuration
 * @returns Input element with HTMX search behavior
 *
 * @example
 * SearchInput({
 *   endpoint: "/api/search",
 *   target: "#results",
 *   delay: 300,
 *   placeholder: "Search products..."
 * })
 */
export function SearchInput(options: {
  endpoint: string;
  target: HxTarget;
  name?: string;
  delay?: number;
  placeholder?: string;
  className?: string;
}): Tag {
  return Input()
    .setType("search")
    .setName(options.name ?? "q")
    .setPlaceholder(options.placeholder ?? "Search...")
    .addClass(options.className ?? "")
    .setHtmx(hx(options.endpoint, {
      trigger: `keyup changed delay:${options.delay ?? 300}ms`,
      target: options.target,
      swap: "innerHTML",
    }));
}

/**
 * Create an infinite scroll trigger element.
 *
 * @param options - Infinite scroll configuration
 * @returns Div that loads more content when revealed
 *
 * @example
 * InfiniteScroll({
 *   endpoint: "/api/items?page=2",
 *   loadingText: "Loading more items...",
 *   threshold: "100px"
 * })
 */
export function InfiniteScroll(options: {
  endpoint: string;
  loadingText?: string;
  threshold?: string;
  className?: string;
}): Tag {
  const trigger = options.threshold
    ? `revealed threshold:${options.threshold}`
    : "revealed";

  return Div(options.loadingText ?? "Loading...")
    .addClass(options.className ?? "")
    .setHtmx(
      hx(options.endpoint, {
        trigger,
        swap: "outerHTML",
      })
    );
}

// ------------------------------------
// Form Patterns
// ------------------------------------

/**
 * Create a form field with label, input, and optional error message.
 *
 * @param options - Form field configuration
 * @returns Div containing label, input, and error display
 *
 * @example
 * FormField({
 *   label: "Email",
 *   name: "email",
 *   type: "email",
 *   required: true,
 *   error: "Please enter a valid email"
 * })
 */
export function FormField(options: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
}): View {
  return Div([
    Label(options.label).setFor(options.name).addClass("form-label"),
    Input()
      .setType(options.type ?? "text")
      .setName(options.name)
      .setId(options.name)
      .setPlaceholder(options.placeholder ?? "")
      .toggle("required", !!options.required)
      .addClass("form-input"),
    IfThen(options.error, (error) =>
      Span(error).addClass("form-error")
    ),
  ]).addClass(options.className ?? "form-field");
}

// ------------------------------------
// List Patterns
// ------------------------------------

/**
 * Create a list with unique keys for each item.
 *
 * @param items - Array of items to render
 * @param getKey - Function to extract unique key from item
 * @param renderItem - Function to render each item
 * @param options - List configuration
 * @returns Ul with keyed list items
 *
 * @example
 * KeyedList(
 *   users,
 *   user => user.id,
 *   user => Div([H3(user.name), P(user.email)])
 * )
 */
export function KeyedList<T>(
  items: T[],
  getKey: (item: T) => string,
  renderItem: (item: T, index: number) => View,
  options: {
    className?: string;
  } = {}
): Tag {
  return Ul(
    ForEach(items, (item: T, index: number) =>
      Li(renderItem(item, index))
        .setDataAttrs({ key: getKey(item) })
        .addClass("list-item")
    )
  ).addClass(options.className ?? "keyed-list");
}

// ------------------------------------
// HTMX Out-of-Band (OOB) Helpers
// ------------------------------------

/**
 * Create an out-of-band swap element.
 *
 * @deprecated Use `Partial()` instead for htmx 4+. OOB swaps are replaced by `<hx-partial>`.
 *
 * @param target - CSS selector (with #) or element ID (without #)
 * @param content - Content to swap in
 * @param swap - Optional swap strategy (default: "true" which uses innerHTML)
 * @returns Tag with hx-swap-oob attribute
 */
export function OOB(
  target: string | Id,
  content: View,
  swap?: HxSwapStyle
): Tag {
  // Normalize target: extract ID from Id object or string
  const elementId = isId(target) ? target.id : (target.startsWith('#') ? target.slice(1) : target);

  // Build OOB value: "true" for default innerHTML, or "strategy:#id" for specific strategy
  const oobValue = swap ? `${swap}:#${elementId}` : "true";

  // If content is already a Tag, add the OOB attributes directly
  if (content instanceof Tag) {
    return content.setId(elementId).addAttribute("hx-swap-oob", oobValue);
  }

  // Otherwise wrap in a div
  return Div(content).setId(elementId).addAttribute("hx-swap-oob", oobValue);
}

/**
 * Combine main response content with out-of-band swap elements.
 *
 * @deprecated Use `Partial()` instead for htmx 4+.
 */
export function withOOB(main: View, ...oob: View[]): View[] {
  return [main, ...oob];
}

// ------------------------------------
// HTMX Partial Helpers (htmx 4)
// ------------------------------------

/**
 * Create an `<hx-partial>` element for multi-swap responses.
 *
 * Each partial independently declares its target and swap strategy.
 * This replaces OOB swaps with a cleaner, more explicit pattern.
 *
 * @param target - CSS selector string or Id object
 * @param content - Content to swap in
 * @param swap - Swap strategy (default: "outerMorph")
 * @returns Tag with `<hx-partial>` element
 *
 * @example
 * render(
 *   Partial(ids.userList, UserList(users)),
 *   Partial(ids.userCount, Span(`${users.length} users`)),
 * )
 */
export function Partial(
  target: string | Id, // TODO: - can we narrow 'string' to valid css selectors? we should already have something done for htmx
  content: View,
  swap: HxSwap = "outerMorph"
): Tag {
  const selector = isId(target) ? target.selector :
    target.startsWith('#') ? target : `#${target}`;
  return new Tag("hx-partial", content)
    .addAttribute("hx-target", selector) // TODO: - lets add hxTarget, hxSwap fluent methods?
    .addAttribute("hx-swap", swap);
}

// ------------------------------------
// HTMX Global Config Helper (htmx 4)
// ------------------------------------

/**
 * Type-safe global htmx configuration via `<meta>` tag.
 *
 * In htmx 4, extensions and global settings are configured through
 * `<meta name="htmx-config">` instead of per-element attributes.
 *
 * @param config - Global htmx configuration
 * @returns Meta tag with htmx-config
 *
 * @example
 * Head(
 *   HtmxConfig({
 *     extensions: "sse, preload",
 *     transitions: true,
 *     defaultSwap: "outerMorph",
 *   }),
 *   Script().setSrc("/htmx.js"),
 * )
 */
export type HtmxGlobalConfig = {
  extensions?: string;
  transitions?: boolean;
  defaultSwap?: HxSwapStyle;
  defaultTimeout?: number;
  implicitInheritance?: boolean;
  noSwap?: (number | string)[];
  prefix?: string;
  metaCharacter?: string;
  inlineScriptNonce?: string;
  inlineStyleNonce?: string;
  mode?: string;
  history?: boolean;
  logAll?: boolean;
};

export function HtmxConfig(config: HtmxGlobalConfig): Tag {
  return new Tag("meta")
    .addAttribute("name", "htmx-config")
    .addAttribute("content", JSON.stringify(config));
}

// ------------------------------------
// HTMX Response Helpers
// ------------------------------------

/**
 * Location header configuration for HX-Location
 */
export interface HxLocationConfig {
  path: string;
  target?: string;
  swap?: HxSwapStyle;
  select?: string;
  source?: string;
  event?: string;
  handler?: string;
  values?: Record<string, any>;
  headers?: Record<string, string>;
}

/**
 * Result from building an HxResponse
 */
export interface HxResponseResult {
  html: string;
  headers: Record<string, string>;
}

/**
 * Builder for HTMX responses with response headers.
 *
 * HTMX responses can include special headers that control client-side behavior
 * like triggering events, redirecting, updating the URL, etc.
 *
 * @example
 * // Express.js example
 * app.post('/api/items', (req, res) => {
 *   const response = hxResponse(Div("Item created!"))
 *     .trigger("itemCreated")
 *     .pushUrl("/items/123")
 *     .build();
 *
 *   Object.entries(response.headers).forEach(([key, value]) => {
 *     res.setHeader(key, value);
 *   });
 *   res.send(response.html);
 * });
 */
export class HxResponse {
  private _content: View;
  private _headers: Record<string, string> = {};

  constructor(content: View) {
    this._content = content;
  }

  /**
   * Trigger a client-side event after the response is processed.
   *
   * @param event - Event name to trigger
   * @param detail - Optional event detail data
   *
   * @example
   * hxResponse(content).trigger("itemAdded")
   * hxResponse(content).trigger("showMessage", { text: "Saved!", type: "success" })
   */
  trigger(event: string, detail?: Record<string, any>): this {
    const existing = this._headers["HX-Trigger"];
    if (existing) {
      // If we already have triggers, merge them
      try {
        const parsed = JSON.parse(existing);
        if (detail) {
          parsed[event] = detail;
        } else {
          parsed[event] = {};
        }
        this._headers["HX-Trigger"] = JSON.stringify(parsed);
      } catch {
        // Was a simple string, convert to object
        const obj: Record<string, any> = { [existing]: {} };
        obj[event] = detail ?? {};
        this._headers["HX-Trigger"] = JSON.stringify(obj);
      }
    } else {
      if (detail) {
        this._headers["HX-Trigger"] = JSON.stringify({ [event]: detail });
      } else {
        this._headers["HX-Trigger"] = event;
      }
    }
    return this;
  }

  /**
   * Push a URL onto the browser history stack.
   *
   * @param url - URL to push (use "false" to prevent any push)
   *
   * @example
   * hxResponse(content).pushUrl("/items/123")
   */
  pushUrl(url: string): this {
    this._headers["HX-Push-Url"] = url;
    return this;
  }

  /**
   * Replace the current URL in the browser history.
   *
   * @param url - URL to replace with (use "false" to prevent)
   */
  replaceUrl(url: string): this {
    this._headers["HX-Replace-Url"] = url;
    return this;
  }

  /**
   * Redirect the browser to a new URL.
   *
   * @param url - URL to redirect to
   *
   * @example
   * hxResponse(Empty()).redirect("/login")
   */
  redirect(url: string): this {
    this._headers["HX-Redirect"] = url;
    return this;
  }

  /**
   * Refresh the current page.
   */
  refresh(): this {
    this._headers["HX-Refresh"] = "true";
    return this;
  }

  /**
   * Override the target element for the swap.
   *
   * @param selector - CSS selector for the new target
   */
  retarget(selector: string): this {
    this._headers["HX-Retarget"] = selector;
    return this;
  }

  /**
   * Override the swap strategy.
   *
   * @param strategy - New swap strategy
   */
  reswap(strategy: HxSwapStyle | string): this {
    this._headers["HX-Reswap"] = strategy;
    return this;
  }

  /**
   * Override the content selection from the response.
   *
   * @param selector - CSS selector to select content
   */
  reselect(selector: string): this {
    this._headers["HX-Reselect"] = selector;
    return this;
  }

  /**
   * Navigate to a URL with HTMX (AJAX-style navigation).
   *
   * @param config - URL string or location configuration object
   *
   * @example
   * // Simple navigation
   * hxResponse(Empty()).location("/dashboard")
   *
   * // With options
   * hxResponse(Empty()).location({
   *   path: "/dashboard",
   *   target: "#main",
   *   swap: "innerHTML"
   * })
   */
  location(config: string | HxLocationConfig): this {
    if (typeof config === 'string') {
      this._headers["HX-Location"] = config;
    } else {
      this._headers["HX-Location"] = JSON.stringify(config);
    }
    return this;
  }

  /**
   * Build the final response with rendered HTML and headers.
   *
   * @returns Object with html string and headers object
   *
   * @example
   * const { html, headers } = hxResponse(content)
   *   .trigger("saved")
   *   .pushUrl("/items/123")
   *   .build();
   */
  build(): HxResponseResult {
    return {
      html: render(this._content),
      headers: { ...this._headers },
    };
  }

  /**
   * Get just the headers without rendering.
   * Useful when you want to render the content separately.
   */
  getHeaders(): Record<string, string> {
    return { ...this._headers };
  }
}

/**
 * Create an HTMX response builder with headers.
 *
 * This helper makes it easy to build HTMX responses with the appropriate
 * response headers for client-side behavior like triggering events,
 * URL manipulation, redirects, etc.
 *
 * @param content - The HTML content to render
 * @returns HxResponse builder
 *
 * @example
 * // Basic usage - trigger an event after update
 * const response = hxResponse(
 *   Div("Item saved successfully!")
 * )
 *   .trigger("itemSaved")
 *   .build();
 *
 * @example
 * // Complex response with multiple headers
 * const response = hxResponse(
 *   Div([
 *     H2("Order #123"),
 *     P("Your order has been placed.")
 *   ])
 * )
 *   .trigger("orderPlaced", { orderId: 123 })
 *   .pushUrl("/orders/123")
 *   .build();
 *
 * @example
 * // Redirect after action
 * const response = hxResponse(Empty())
 *   .redirect("/login?expired=true")
 *   .build();
 *
 * @example
 * // Express.js integration
 * app.post('/api/task', (req, res) => {
 *   const { html, headers } = hxResponse(Div("Done!"))
 *     .trigger("taskCompleted")
 *     .build();
 *
 *   res.set(headers);
 *   res.send(html);
 * });
 */
export function hxResponse(content: View): HxResponse {
  return new HxResponse(content);
}
