// A count/range length clamped to a non-negative integer. Non-finite
// (NaN/Infinity) and negative/fractional inputs collapse to a valid length, so a
// derived count (division, an over-full list, an inverted range) renders zero
// times instead of crashing the whole SSR response on `new Array(len)`'s RangeError.
function clampLength(n) {
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}
// Implementation
export function ForEach(viewsOrLowOrHigh, renderItemOrHigh, renderItem) {
    // ForEach(low, high, renderItem)
    if (typeof viewsOrLowOrHigh === "number" && typeof renderItemOrHigh === "number") {
        const low = viewsOrLowOrHigh;
        const high = renderItemOrHigh;
        const len = clampLength(high - low);
        const result = new Array(len);
        for (let i = 0; i < len; i++) {
            result[i] = renderItem(low + i);
        }
        return result;
    }
    // ForEach(high, renderItem)
    if (typeof viewsOrLowOrHigh === "number") {
        const len = clampLength(viewsOrLowOrHigh);
        const fn = renderItemOrHigh;
        const result = new Array(len);
        for (let i = 0; i < len; i++) {
            result[i] = fn(i);
        }
        return result;
    }
    // ForEach(views, renderItem)
    const fn = renderItemOrHigh;
    if (Array.isArray(viewsOrLowOrHigh)) {
        const arr = viewsOrLowOrHigh;
        const result = new Array(arr.length);
        for (let i = 0; i < arr.length; i++) {
            result[i] = fn(arr[i], i);
        }
        return result;
    }
    // Single pass: Array.from's map arg avoids the throwaway intermediate array that
    // `Array.from(iter).map(fn)` allocates (hits Map.values(), generators, paginators).
    return Array.from(viewsOrLowOrHigh, fn);
}
/**
 * Iterate over items, or render a fallback when the list is empty. A separate
 * function from `ForEach` (mirrors `IfThen`→`IfThenElse`) — keeps `ForEach`'s
 * count/range overloads unambiguous.
 *
 * @param items - The items to map over
 * @param renderItem - Callback receiving each item (and index) to produce a View
 * @param emptyView - A View, or a thunk returning one, rendered when `items` is empty
 *
 * @example
 * Ul(ForEachElse(users, (u) => Li(u.name), () => Li("No users yet")))
 */
export function ForEachElse(items, renderItem, emptyView) {
    if (items.length === 0) {
        return typeof emptyView === "function" ? emptyView() : emptyView;
    }
    const result = new Array(items.length);
    for (let i = 0; i < items.length; i++)
        result[i] = renderItem(items[i], i);
    return result;
}
/**
 * Keyed iteration — like `ForEach`, but stamps each item's root tag with a stable
 * `id` from `keyOf(item)` so HTMX/idiomorph matches rows **by key** on
 * reorder/insert/delete instead of by position (positional matching loses focus,
 * scroll, and in-progress CSS transitions on a morph swap). `renderItem` must return
 * a `Tag` — the row root to key. The key must be unique within the page; bake a
 * prefix into `keyOf` if multiple keyed lists could share raw ids.
 *
 * @example
 * Ul(ForEachKeyed(users, (u) => u.id, (u) => Li(u.name)))   // <li id="42">…</li>
 */
export function ForEachKeyed(items, keyOf, renderItem) {
    const result = [];
    let i = 0;
    for (const item of items) {
        result.push(renderItem(item, i).setId(String(keyOf(item))));
        i++;
    }
    return result;
}
/**
 * Map each item to a View and place `separator` *between* them — never after the
 * last (the View analogue of `Array.join`). The thunk form of `separator` is called
 * once per gap, so callers can return fresh Tag instances (Tags are mutable — a
 * single shared instance would be aliased across every gap).
 *
 * @param items - The items to map over
 * @param renderItem - Callback receiving each item (and index) to produce a View
 * @param separator - A View, or a thunk returning one, emitted between items
 *
 * @example
 * Nav(Intersperse(crumbs, (c) => A(c.label).setHtmx(c.route), () => Span("/").text("gray-400")))
 */
export function Intersperse(items, renderItem, separator) {
    const result = [];
    let i = 0;
    for (const item of items) {
        if (i > 0)
            result.push(typeof separator === "function" ? separator() : separator);
        result.push(renderItem(item, i));
        i++;
    }
    return result;
}
/**
 * Repeat a view a fixed number of times.
 *
 * @param times - How many times to repeat
 * @param content - Thunk producing the view to repeat
 * @returns An array of Views
 *
 * @example
 * Div(Repeat(3, () => Span("★")))
 */
export function Repeat(times, content) {
    return ForEach(times, content);
}
//# sourceMappingURL=iteration.js.map