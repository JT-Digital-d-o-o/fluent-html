// Implementation
export function ForEach(viewsOrLowOrHigh, renderItemOrHigh, renderItem) {
    // ForEach(low, high, renderItem)
    if (typeof viewsOrLowOrHigh === "number" && typeof renderItemOrHigh === "number") {
        const low = viewsOrLowOrHigh;
        const high = renderItemOrHigh;
        const len = high - low;
        const result = new Array(len);
        for (let i = 0; i < len; i++) {
            result[i] = renderItem(low + i);
        }
        return result;
    }
    // ForEach(high, renderItem)
    if (typeof viewsOrLowOrHigh === "number") {
        const len = viewsOrLowOrHigh;
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
    return Array.from(viewsOrLowOrHigh).map(fn);
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