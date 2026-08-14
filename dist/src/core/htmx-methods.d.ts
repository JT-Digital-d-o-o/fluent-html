import type { HTMX, HxOptions, ResolvedRoute, ExternalHref } from "../htmx.js";
declare module "./tag.js" {
    interface Tag {
        setHtmx(htmx?: HTMX): this;
        setHtmx(endpoint: ResolvedRoute | ExternalHref, options?: HxOptions): this;
        hxGet(endpoint: ResolvedRoute | ExternalHref, options?: Omit<HxOptions, "method">): this;
        hxPost(endpoint: ResolvedRoute | ExternalHref, options?: Omit<HxOptions, "method">): this;
        /**
         * Mark this element as an htmx loading indicator — adds the library-known
         * `htmx-indicator` class (shown only while a request targeting it is in flight).
         * Sanctioned so the Tailwind extractor/ESLint accept the class, unlike a raw
         * `.setClass("htmx-indicator")`.
         */
        htmxIndicator(): this;
    }
}
//# sourceMappingURL=htmx-methods.d.ts.map