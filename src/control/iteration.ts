import type { View } from "../core/types.js";

/**
 * Iterate over items, a count, or a range to produce views.
 *
 * **Iterable overload:** maps each item (with index) to a View.
 * **Count overload:** repeats `high` times (0 to high-1).
 * **Range overload:** iterates from `low` to `high-1`.
 *
 * @param views - An iterable of items to map over
 * @param renderItem - Callback receiving each item (and index) to produce a View
 * @returns An array of Views
 *
 * @example
 * // Iterate over items
 * Ul(ForEach(users, (user, i) => Li(`${i + 1}. ${user.name}`)))
 *
 * @example
 * // Repeat n times
 * Div(ForEach(5, (i) => Star()))
 *
 * @example
 * // Range iteration
 * ForEach(1, 6, (i) => Span(`Page ${i}`))
 */
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
export function Repeat(
  times: number,
  content: () => View
): View {
  return ForEach(times, content);
}
