"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForEach3 = exports.ForEach2 = exports.ForEach1 = void 0;
exports.ForEach = ForEach;
exports.Repeat = Repeat;
// Implementation
function ForEach(viewsOrLowOrHigh, renderItemOrHigh, renderItem) {
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
/** @deprecated Use ForEach instead */
exports.ForEach1 = ForEach;
/** @deprecated Use ForEach instead */
exports.ForEach2 = ForEach;
/** @deprecated Use ForEach instead */
exports.ForEach3 = ForEach;
function Repeat(times, content) {
    return ForEach(times, content);
}
//# sourceMappingURL=iteration.js.map