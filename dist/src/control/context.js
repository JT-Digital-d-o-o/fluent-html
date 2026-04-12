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
var _a;
// Polyfill Symbol.dispose for ES2020 targets
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
(_a = Symbol).dispose ?? (_a.dispose = Symbol('Symbol.dispose'));
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
export function createContext(defaultValue) {
    const stack = [defaultValue];
    return {
        get current() {
            return stack[stack.length - 1];
        },
        scope(value) {
            stack.push(value);
            return {
                [Symbol.dispose]() {
                    stack.pop();
                },
            };
        },
    };
}
//# sourceMappingURL=context.js.map