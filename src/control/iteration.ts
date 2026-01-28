import type { View } from "../core/types.js";

function* range(low: number, high: number) {
  for (var i = low; i < high; i++) {
    yield i;
  }
}

// Overload signatures
export function ForEach<T>(
  views: Iterable<T>,
  renderItem: (item: T, index: number) => View
): View;
export function ForEach(
  high: number,
  renderItem: (index: number) => View
): View;
export function ForEach(
  low: number,
  high: number,
  renderItem: (index: number) => View
): View;
// Implementation
export function ForEach<T>(
  viewsOrLowOrHigh: Iterable<T> | number,
  renderItemOrHigh: ((item: T, index: number) => View) | ((index: number) => View) | number,
  renderItem?: (index: number) => View
): View {
  // ForEach(low, high, renderItem)
  if (typeof viewsOrLowOrHigh === "number" && typeof renderItemOrHigh === "number") {
    return Array.from(range(viewsOrLowOrHigh, renderItemOrHigh)).map((i) => renderItem!(i));
  }
  // ForEach(high, renderItem)
  if (typeof viewsOrLowOrHigh === "number") {
    return Array.from(range(0, viewsOrLowOrHigh)).map((i) => (renderItemOrHigh as (i: number) => View)(i));
  }
  // ForEach(views, renderItem)
  return Array.from(viewsOrLowOrHigh).map(renderItemOrHigh as (item: T, index: number) => View);
}

/** @deprecated Use ForEach instead */
export const ForEach1 = ForEach;
/** @deprecated Use ForEach instead */
export const ForEach2 = ForEach;
/** @deprecated Use ForEach instead */
export const ForEach3 = ForEach;

export function Repeat(
  times: number,
  content: () => View
): View {
  return ForEach(range(0, times), content);
}

export { range };
