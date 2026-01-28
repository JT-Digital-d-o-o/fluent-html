"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForEach3 = exports.ForEach2 = exports.ForEach1 = void 0;
exports.ForEach = ForEach;
exports.Repeat = Repeat;
exports.range = range;
function* range(low, high) {
    for (var i = low; i < high; i++) {
        yield i;
    }
}
// Implementation
function ForEach(viewsOrLowOrHigh, renderItemOrHigh, renderItem) {
    // ForEach(low, high, renderItem)
    if (typeof viewsOrLowOrHigh === "number" && typeof renderItemOrHigh === "number") {
        return Array.from(range(viewsOrLowOrHigh, renderItemOrHigh)).map((i) => renderItem(i));
    }
    // ForEach(high, renderItem)
    if (typeof viewsOrLowOrHigh === "number") {
        return Array.from(range(0, viewsOrLowOrHigh)).map((i) => renderItemOrHigh(i));
    }
    // ForEach(views, renderItem)
    return Array.from(viewsOrLowOrHigh).map(renderItemOrHigh);
}
/** @deprecated Use ForEach instead */
exports.ForEach1 = ForEach;
/** @deprecated Use ForEach instead */
exports.ForEach2 = ForEach;
/** @deprecated Use ForEach instead */
exports.ForEach3 = ForEach;
function Repeat(times, content) {
    return ForEach(range(0, times), content);
}
//# sourceMappingURL=iteration.js.map