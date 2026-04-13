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
/**
 * Create a scoped context **without** a default value.
 *
 * Accessing `current` outside an active `scope()` throws an error.
 * Use this for values that have no valid default (auth, nonce, request-specific data).
 *
 * @param name - A descriptive name used in the error message when accessed outside a scope
 * @returns A Context object with `current` and `scope()` members
 *
 * @example
 * const AuthCtx = createRequiredContext<User>("AuthCtx");
 *
 * function App(user: User) {
 *   using _ = AuthCtx.scope(user);
 *   return Div(Header(), Content());
 * }
 *
 * function Header() {
 *   const user = AuthCtx.current;  // User — throws if no scope active
 *   return Span(user.name);
 * }
 */
export function createRequiredContext(name) {
    const stack = [];
    return {
        get current() {
            if (stack.length === 0) {
                throw new Error(`Context "${name}" accessed outside of a scope. Wrap the call in ${name}.scope(value).`);
            }
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