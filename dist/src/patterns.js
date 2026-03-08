// ------------------------------------
// Common UI Patterns for Fluent HTML
// ------------------------------------
//
// This module provides reusable component patterns and layout helpers
// built on top of the core fluent-html API.
import { Tag } from "./core/tag.js";
import { Div } from "./elements/structural.js";
import { isId } from "./ids.js";
import { render } from "./render/render.js";
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
export function OOB(target, content, swap) {
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
export function withOOB(main, ...oob) {
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
export function Partial(target, content, swap = "outerMorph") {
    const selector = isId(target) ? target.selector :
        target.startsWith('#') ? target : `#${target}`;
    return new Tag("hx-partial", content)
        .addAttribute("hx-target", selector)
        .addAttribute("hx-swap", swap);
}
export function HtmxConfig(config) {
    return new Tag("meta")
        .addAttribute("name", "htmx-config")
        .addAttribute("content", JSON.stringify(config));
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
    constructor(content) {
        this._headers = {};
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
    trigger(event, detail) {
        const existing = this._headers["HX-Trigger"];
        if (existing) {
            // If we already have triggers, merge them
            try {
                const parsed = JSON.parse(existing);
                if (detail) {
                    parsed[event] = detail;
                }
                else {
                    parsed[event] = {};
                }
                this._headers["HX-Trigger"] = JSON.stringify(parsed);
            }
            catch {
                // Was a simple string, convert to object
                const obj = { [existing]: {} };
                obj[event] = detail ?? {};
                this._headers["HX-Trigger"] = JSON.stringify(obj);
            }
        }
        else {
            if (detail) {
                this._headers["HX-Trigger"] = JSON.stringify({ [event]: detail });
            }
            else {
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
    pushUrl(url) {
        this._headers["HX-Push-Url"] = url;
        return this;
    }
    /**
     * Replace the current URL in the browser history.
     *
     * @param url - URL to replace with (use "false" to prevent)
     */
    replaceUrl(url) {
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
    redirect(url) {
        this._headers["HX-Redirect"] = url;
        return this;
    }
    /**
     * Refresh the current page.
     */
    refresh() {
        this._headers["HX-Refresh"] = "true";
        return this;
    }
    /**
     * Override the target element for the swap.
     *
     * @param selector - CSS selector for the new target
     */
    retarget(selector) {
        this._headers["HX-Retarget"] = selector;
        return this;
    }
    /**
     * Override the swap strategy.
     *
     * @param strategy - New swap strategy
     */
    reswap(strategy) {
        this._headers["HX-Reswap"] = strategy;
        return this;
    }
    /**
     * Override the content selection from the response.
     *
     * @param selector - CSS selector to select content
     */
    reselect(selector) {
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
    location(config) {
        if (typeof config === 'string') {
            this._headers["HX-Location"] = config;
        }
        else {
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
    build() {
        return {
            html: render(this._content),
            headers: { ...this._headers },
        };
    }
    /**
     * Get just the headers without rendering.
     * Useful when you want to render the content separately.
     */
    getHeaders() {
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
export function hxResponse(content) {
    return new HxResponse(content);
}
//# sourceMappingURL=patterns.js.map