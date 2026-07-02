import type { View } from "../core/types.js";
import type { Tag } from "../core/tag.js";

// A count/range length clamped to a non-negative integer. Non-finite
// (NaN/Infinity) and negative/fractional inputs collapse to a valid length, so a
// derived count (division, an over-full list, an inverted range) renders zero
// times instead of crashing the whole SSR response on `new Array(len)`'s RangeError.
function clampLength(n: number): number {
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

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
    const len = clampLength(high - low);
    const result: View[] = new Array(len);
    for (let i = 0; i < len; i++) {
      result[i] = renderItem!(low + i);
    }
    return result;
  }
  // ForEach(high, renderItem)
  if (typeof viewsOrLowOrHigh === "number") {
    const len = clampLength(viewsOrLowOrHigh);
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
export function ForEachElse<T>(
  items: readonly T[],
  renderItem: (item: T, index: number) => View,
  emptyView: View | (() => View),
): View {
  if (items.length === 0) {
    return typeof emptyView === "function" ? (emptyView as () => View)() : emptyView;
  }
  const result: View[] = new Array(items.length);
  for (let i = 0; i < items.length; i++) result[i] = renderItem(items[i]!, i);
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
export function ForEachKeyed<T>(
  items: Iterable<T>,
  keyOf: (item: T) => string | number,
  renderItem: (item: T, index: number) => Tag,
): View {
  const result: View[] = [];
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
 * Nav(Intersperse(crumbs, (c) => A(c.label).setHtmx(c.route), () => Span("/").textColor("gray-400")))
 */
export function Intersperse<T>(
  items: Iterable<T>,
  renderItem: (item: T, index: number) => View,
  separator: View | (() => View),
): View {
  const result: View[] = [];
  let i = 0;
  for (const item of items) {
    if (i > 0) result.push(typeof separator === "function" ? (separator as () => View)() : separator);
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
export function Repeat(
  times: number,
  content: () => View
): View {
  return ForEach(times, content);
}
