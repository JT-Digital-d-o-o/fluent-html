/**
 * Scoped context for fluent-html — implicit, request-safe values
 * without prop drilling.
 *
 * Uses `using` (TC39 Explicit Resource Management) for automatic cleanup.
 * Falls back to a Symbol.dispose polyfill for ES2020 targets.
 *
 * @example
 * const ThemeCtx = createContext<"light" | "dark">("light");
 *
 * function Page(theme: "light" | "dark") {
 *   using _ = ThemeCtx.scope(theme);
 *   return Div(Header(), Content(), Footer());
 * }
 *
 * function Header() {
 *   const theme = ThemeCtx.current;
 *   return Nav().background(theme === "dark" ? "gray-900" : "white");
 * }
 */
/**
 * A scoped context that holds a stack of values.
 * Components read `ctx.current` to get the innermost scoped value.
 * Use `using _ = ctx.scope(value)` to push a value for the current block.
 */
export type Context<T> = {
    /** The current (innermost) context value. */
    readonly current: T;
    /**
     * Push a value onto the context stack. Returns a Disposable —
     * use with `using` for automatic cleanup, or call `[Symbol.dispose]()` manually.
     *
     * @example
     * using _ = ctx.scope("dark");
     * // ctx.current === "dark" until block exits
     */
    scope(value: T): Disposable;
};
/**
 * Create a scoped context with a default value.
 *
 * The context maintains a stack: each `scope()` call pushes a value,
 * and disposal pops it. This makes nested overrides safe and automatic.
 *
 * @param defaultValue - The value returned by `current` when no scope is active
 * @returns A Context object with `current` and `scope()` members
 *
 * @example
 * const ThemeCtx = createContext<"light" | "dark">("light");
 * const LocaleCtx = createContext("en-US");
 *
 * function Page() {
 *   using _t = ThemeCtx.scope("dark");
 *   using _l = LocaleCtx.scope("de");
 *   return Div(Header(), Content());
 * }
 *
 * function Header() {
 *   return Span(LocaleCtx.current === "de" ? "Willkommen" : "Welcome")
 *     .textColor(ThemeCtx.current === "dark" ? "white" : "gray-900");
 * }
 */
export declare function createContext<T>(defaultValue: T): Context<T>;
//# sourceMappingURL=context.d.ts.map