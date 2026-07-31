/**
 * Map a value to another value via a case record — the value-returning sibling of
 * `Match`. Where `Match` returns a `View` from view *thunks*, `MatchValue` returns
 * the **value itself** (keeping its literal union), and its cases are plain values,
 * not thunks: it is a cheap O(1) lookup, not lazy view construction.
 *
 * Exhaustive in the two-argument form (every key of `T` must be present — a missing
 * key is a compile error); supply a `defaultValue` to match a subset.
 *
 * @example
 * MatchValue(trend, { up: "↑", down: "↓" }, "→")        // "↑" | "↓" | "→"
 * MatchValue(color, { green: "green-500", red: "red-500", gray: "gray-500" })  // exhaustive, no default
 * // The union flows into a fluent styling method only if every value is a real Tailwind token
 * // (the closed `TailwindColor` union, or a `defineTheme()`-registered custom token). A typo'd
 * // token widens the result and surfaces as a closed-union error at the `.bg()` call.
 * Div().bg(MatchValue(tone, { ok: "green-100", err: "red-100" }, "gray-100"))
 */
export declare function MatchValue<T extends string | number, R>(value: string extends T ? never : number extends T ? never : T, cases: {
    [K in T]: R;
}): R;
export declare function MatchValue<T extends string | number, R, D>(value: T, cases: Partial<{
    [K in T]: R;
}>, defaultValue: D): R | D;
//# sourceMappingURL=match-value.d.ts.map