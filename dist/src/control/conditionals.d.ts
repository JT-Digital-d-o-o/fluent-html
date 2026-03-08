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
type Case = {
    condition: boolean;
    component: Thunk<View>;
};
/** @deprecated Use `Match` instead for value matching. */
export declare function SwitchCase(cases: Case[], defaultView?: Thunk<View>): View;
/**
 * Exhaustive value matching — maps a string or number to a corresponding view.
 *
 * Without a default, TypeScript ensures every possible value has a handler (exhaustive).
 * With a default, partial coverage is allowed.
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
 */
export declare function Match<T extends string | number>(value: T, cases: {
    [K in T]: Thunk<View>;
}): View;
export declare function Match<T extends string | number>(value: T, cases: Partial<{
    [K in T]: Thunk<View>;
}>, defaultView: Thunk<View>): View;
export {};
//# sourceMappingURL=conditionals.d.ts.map