import type { HTMX, HxOptions } from "../htmx.js";
declare module "./tag.js" {
    interface Tag {
        setHtmx(htmx?: HTMX): this;
        setHtmx(endpoint: string, options?: HxOptions): this;
        hxGet(endpoint: string, options?: Omit<HxOptions, "method">): this;
        hxPost(endpoint: string, options?: Omit<HxOptions, "method">): this;
        hxPut(endpoint: string, options?: Omit<HxOptions, "method">): this;
        hxPatch(endpoint: string, options?: Omit<HxOptions, "method">): this;
        hxDelete(endpoint: string, options?: Omit<HxOptions, "method">): this;
    }
}
//# sourceMappingURL=htmx-methods.d.ts.map