import type { View, Thunk } from "../core/types.js";
/**
 * Conditionally render one of two views.
 *
 * When called with a boolean, evaluates `thenBranch` or `elseBranch` accordingly.
 * When called with a nullable value, narrows the type and passes the non-null value to `thenBranch`.
 *
 * @param condition - Boolean condition or nullable value to test
 * @param thenBranch - View to render when condition is true / value is non-null
 * @param elseBranch - View to render when condition is false / value is null
 * @returns The rendered View from the matching branch
 *
 * @example
 * // Boolean condition
 * IfThenElse(loggedIn, () => Dashboard(), () => LoginForm())
 *
 * @example
 * // Nullable value narrowing — `user` is narrowed to non-null `User`
 * IfThenElse(user, (u) => Span(`Welcome, ${u.name}`), () => A("Login"))
 */
export declare function IfThenElse(condition: boolean, thenBranch: Thunk<View>, elseBranch: Thunk<View>): View;
export declare function IfThenElse<T>(value: T | null | undefined, thenBranch: (value: T) => View, elseBranch: Thunk<View>): View;
/**
 * Conditionally render a view, or render nothing (`Empty()`).
 *
 * When called with a boolean, evaluates the callback if true.
 * When called with a nullable value, narrows the type and passes the non-null value to the callback.
 *
 * @param condition - Boolean condition or nullable value to test
 * @param then - View to render when condition is true / value is non-null
 * @returns The rendered View, or `Empty()` if the condition is false / value is null
 *
 * @example
 * // Boolean condition
 * IfThen(user.isAdmin, () => Button("Admin Panel"))
 *
 * @example
 * // Nullable value narrowing — `avatar` is narrowed to `string`
 * IfThen(user.avatar, (src) => Img().setSrc(src).setAlt("Avatar"))
 */
export declare function IfThen(condition: boolean, then: Thunk<View>): View;
export declare function IfThen<T>(value: T | null | undefined, then: (value: T) => View): View;
/**
 * Exhaustive value matching — maps a string or number to a corresponding view.
 *
 * Without a default, TypeScript ensures every possible value has a handler (exhaustive).
 * With a default, partial coverage is allowed.
 *
 * Also supports discriminated union matching: pass a discriminant key to narrow each
 * variant and receive the narrowed type in the handler callback.
 *
 * @param value - The value to match against
 * @param cases - A record mapping each possible value to a thunk returning a View
 * @param defaultView - Optional fallback when no case matches (makes `cases` partial)
 * @returns The View produced by the matching case, or the default
 *
 * @example
 * // Exhaustive — all values must be handled
 * Match(status, {
 *   active:  () => Span("Active"),
 *   pending: () => Span("Pending"),
 *   error:   () => Span("Error"),
 * })
 *
 * @example
 * // Partial — with a default fallback
 * Match(role, { admin: () => AdminBadge() }, () => Span("User"))
 *
 * @example
 * // Discriminated union — exhaustive with narrowing
 * type State =
 *   | { status: "loading" }
 *   | { status: "error"; message: string }
 *   | { status: "success"; data: User[] };
 *
 * Match(state, "status", {
 *   loading: ()  => Spinner(),
 *   error:   (s) => Alert(s.message),   // s: { status: "error"; message: string }
 *   success: (s) => UserList(s.data),   // s: { status: "success"; data: User[] }
 * })
 *
 * @example
 * // Discriminated union — partial with default
 * Match(state, "status", {
 *   error: (s) => Alert(s.message),
 * }, () => Spinner())
 */
export declare function Match<T extends string | number>(value: T, cases: {
    [K in T]: Thunk<View>;
}): View;
export declare function Match<T extends string | number>(value: T, cases: Partial<{
    [K in T]: Thunk<View>;
}>, defaultView: Thunk<View>): View;
export declare function Match<T extends Record<K, string | number>, K extends keyof T>(value: T, key: K, cases: {
    [V in T[K] & (string | number)]: (value: Extract<T, Record<K, V>>) => View;
}): View;
export declare function Match<T extends Record<K, string | number>, K extends keyof T>(value: T, key: K, cases: Partial<{
    [V in T[K] & (string | number)]: (value: Extract<T, Record<K, V>>) => View;
}>, defaultView: Thunk<View>): View;
//# sourceMappingURL=conditionals.d.ts.map