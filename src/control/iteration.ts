import type { View } from "../core/types.js";

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
    const low = viewsOrLowOrHigh;
    const high = renderItemOrHigh;
    const len = high - low;
    const result: View[] = new Array(len);
    for (let i = 0; i < len; i++) {
      result[i] = renderItem!(low + i);
    }
    return result;
  }
  // ForEach(high, renderItem)
  if (typeof viewsOrLowOrHigh === "number") {
    const len = viewsOrLowOrHigh;
    const fn = renderItemOrHigh as (i: number) => View;
    const result: View[] = new Array(len);
    for (let i = 0; i < len; i++) {
      result[i] = fn(i);
    }
    return result;
  }
  // ForEach(views, renderItem)
  const fn = renderItemOrHigh as (item: T, index: number) => View;
  if (Array.isArray(viewsOrLowOrHigh)) {
    const arr = viewsOrLowOrHigh;
    const result: View[] = new Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
      result[i] = fn(arr[i], i);
    }
    return result;
  }
  return Array.from(viewsOrLowOrHigh).map(fn);
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
  return ForEach(times, content);
}
