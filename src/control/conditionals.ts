import type { View, Thunk } from "../core/types.js";
import { Empty } from "../core/utils.js";

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
export function IfThenElse(condition: boolean, thenBranch: Thunk<View>, elseBranch: Thunk<View>): View;
export function IfThenElse<T>(value: T | null | undefined, thenBranch: (value: T) => View, elseBranch: Thunk<View>): View;
export function IfThenElse<T>(
  conditionOrValue: boolean | T | null | undefined,
  thenBranch: Thunk<View> | ((value: T) => View),
  elseBranch: Thunk<View>,
): View {
  if (typeof conditionOrValue === 'boolean') {
    return conditionOrValue ? (thenBranch as Thunk<View>)() : elseBranch();
  }
  if (conditionOrValue != null) {
    return thenBranch(conditionOrValue);
  }
  return elseBranch();
}

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
export function IfThen(condition: boolean, then: Thunk<View>): View;
export function IfThen<T>(value: T | null | undefined, then: (value: T) => View): View;
export function IfThen<T>(
  conditionOrValue: boolean | T | null | undefined,
  then: Thunk<View> | ((value: T) => View),
): View {
  if (typeof conditionOrValue === 'boolean') {
    return conditionOrValue ? (then as Thunk<View>)() : Empty();
  }
  if (conditionOrValue != null) {
    return then(conditionOrValue);
  }
  return Empty();
}

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
// Value matching — exhaustive
export function Match<T extends string | number>(
  value: T,
  cases: { [K in T]: Thunk<View> }
): View;
// Value matching — partial with default
export function Match<T extends string | number>(
  value: T,
  cases: Partial<{ [K in T]: Thunk<View> }>,
  defaultView: Thunk<View>
): View;
// Discriminated union — exhaustive
export function Match<
  T extends Record<K, string | number>,
  K extends keyof T,
>(
  value: T,
  key: K,
  cases: { [V in T[K] & (string | number)]: (value: Extract<T, Record<K, V>>) => View },
): View;
// Discriminated union — partial with default
export function Match<
  T extends Record<K, string | number>,
  K extends keyof T,
>(
  value: T,
  key: K,
  cases: Partial<{ [V in T[K] & (string | number)]: (value: Extract<T, Record<K, V>>) => View }>,
  defaultView: Thunk<View>,
): View;
// Implementation
export function Match(
  value: unknown,
  casesOrKey: unknown,
  casesOrDefault?: unknown,
  defaultView?: Thunk<View>,
): View {
  // Discriminated union overload: Match(value, key, cases, ?default)
  if (typeof casesOrKey === "string" && typeof casesOrDefault === "object" && casesOrDefault !== null) {
    const obj = value as Record<string, string | number>;
    const discriminant = obj[casesOrKey as string] as string | number;
    const cases = casesOrDefault as Record<string | number, ((value: unknown) => View) | undefined>;
    const handler = cases[discriminant];
    if (handler) {
      return handler(value);
    }
    return (defaultView ?? Empty)();
  }

  // Value matching overload: Match(value, cases, ?default)
  const cases = casesOrKey as Record<string | number, Thunk<View> | undefined>;
  const handler = cases[value as string | number];
  if (handler) {
    return handler();
  }
  return ((casesOrDefault as Thunk<View> | undefined) ?? Empty)();
}
