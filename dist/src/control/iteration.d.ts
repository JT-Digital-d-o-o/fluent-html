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
export declare function ForEach<T>(views: Iterable<T>, renderItem: (item: T, index: number) => View): View;
export declare function ForEach(high: number, renderItem: (index: number) => View): View;
export declare function ForEach(low: number, high: number, renderItem: (index: number) => View): View;
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
export declare function Repeat(times: number, content: () => View): View;
//# sourceMappingURL=iteration.d.ts.map