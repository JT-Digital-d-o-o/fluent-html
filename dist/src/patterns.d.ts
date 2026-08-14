import { Tag } from "./core/tag.js";
import type { View } from "./core/types.js";
import type { HxSwap, HxSwapStyle, HxTarget } from "./htmx.js";
import type { Id } from "./ids.js";
/**
 * Create a `<template hx type="partial">` element for multi-swap responses.
 *
 * Each partial independently declares its target and swap strategy.
 * This replaces OOB swaps with a cleaner, more explicit pattern.
 *
 * htmx 4 scans a response with `root.querySelectorAll("template[hx]")` and routes
 * each hit on its `type` attribute (`type="partial"` → target + swap spec, content
 * taken from the template's parsed `content` fragment). The **bare `hx` marker is
 * what makes the element visible to that scan** — an element htmx never looks for
 * (the pre-4 `<hx-partial>` shape) is silently inert in the browser.
 *
 * When the target is (or contains) a self-polling element (`trigger: "every …"`),
 * pass `"outerHTML"` — the default morph preserves settled poller nodes and their
 * `every` timers, resurrecting a poll that a plain replace would have stopped.
 *
 * @param target - CSS selector string or Id object
 * @param content - Content to swap in
 * @param swap - Swap strategy (default: "outerMorph")
 * @returns Tag rendering as `<template hx type="partial" hx-target=… hx-swap=…>`
 *
 * @example
 * render(
 *   Partial(ids.userList, UserList(users)),
 *   Partial(ids.userCount, Span(`${users.length} users`)),
 * )
 * // <template type="partial" hx-target="#user-list" hx-swap="outerMorph" hx>…</template>
 */
export declare function Partial(target: HxTarget | Id, content: View, swap?: HxSwap): Tag;
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
export declare function HtmxConfig(config: HtmxGlobalConfig): Tag;
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
    values?: Record<string, unknown>;
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
export declare class HxResponse {
    private _content;
    private _headers;
    private _triggers;
    constructor(content: View);
    /**
     * Trigger a client-side event after the response is processed. Repeatable — events
     * accumulate in order and serialize once at `build()`/`getHeaders()`.
     *
     * @param event - Event name to trigger
     * @param detail - Optional event detail data
     *
     * @example
     * hxResponse(content).trigger("itemAdded")
     * hxResponse(content).trigger("showMessage", { text: "Saved!", type: "success" })
     */
    trigger(event: string, detail?: Record<string, unknown>): this;
    /** Comma-joined event names when all are bare, else the JSON object form htmx accepts. */
    private serializeTriggers;
    /**
     * Push a URL onto the browser history stack.
     *
     * @param url - URL to push (use "false" to prevent any push)
     *
     * @example
     * hxResponse(content).pushUrl("/items/123")
     */
    pushUrl(url: string): this;
    /**
     * Replace the current URL in the browser history.
     *
     * @param url - URL to replace with (use "false" to prevent)
     */
    replaceUrl(url: string): this;
    /**
     * Redirect the browser to a new URL.
     *
     * @param url - URL to redirect to
     *
     * @example
     * hxResponse(Empty()).redirect("/login")
     */
    redirect(url: string): this;
    /**
     * Refresh the current page.
     */
    refresh(): this;
    /**
     * Override the target element for the swap.
     *
     * @param selector - CSS selector for the new target
     */
    retarget(selector: string): this;
    /**
     * Override the swap strategy.
     *
     * @param strategy - New swap strategy
     */
    reswap(strategy: HxSwapStyle | string): this;
    /**
     * Override the content selection from the response.
     *
     * @param selector - CSS selector to select content
     */
    reselect(selector: string): this;
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
    location(config: string | HxLocationConfig): this;
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
    build(): HxResponseResult;
    /**
     * Get just the headers without rendering.
     * Useful when you want to render the content separately.
     */
    getHeaders(): Record<string, string>;
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
export declare function hxResponse(content: View): HxResponse;
//# sourceMappingURL=patterns.d.ts.map