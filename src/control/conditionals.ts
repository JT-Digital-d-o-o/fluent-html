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
// A boolean-containing T would resolve here at compile time but be reinterpreted as a
// condition at runtime (the `typeof === 'boolean'` branch), so `false` renders the else
// and `true` calls the callback with `undefined`. Reject it — callers pass an explicit
// comparison (`flag === true`) so the intended overload is unambiguous.
export function IfThenElse<T>(value: boolean extends T ? never : T | null | undefined, thenBranch: (value: T) => View, elseBranch: Thunk<View>): View;
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
// See IfThenElse: a boolean-containing T is rejected here because the runtime
// treats it as a condition, not a value. Use an explicit comparison instead.
export function IfThen<T>(value: boolean extends T ? never : T | null | undefined, then: (value: T) => View): View;
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
 * Forces a case key that is not a member of the matched value's union to `never`, so a
 * typo'd or stale case is a compile error rather than a silently-unreachable branch.
 * Inferring the cases object (`C`) is what lets `Match` report the branch return types
 * instead of a flat `View`, but inference also switches off excess-property checking —
 * this restores it. Same mechanism as `CheckRouteParams` in routes.ts.
 */
type NoExtraCases<C, Allowed extends PropertyKey> = {
  [K in Exclude<keyof C, Allowed>]: never;
};

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
// Value matching — exhaustive. A widened `string`/`number` collapses `{ [K in T] }`
// to an index signature, so any subset would satisfy the "exhaustive" form while a
// real miss renders an invisible Empty(). Reject the widened value here so an
// unconstrained input must use the partial-with-default form (which supplies a fallback).
export function Match<
  T extends string | number,
  C extends { [K in T]: Thunk<View> } & NoExtraCases<C, T>,
>(
  value: string extends T ? never : number extends T ? never : T,
  cases: C
): ReturnType<C[keyof C]>;
// Value matching — partial with default
export function Match<
  T extends string | number,
  C extends Partial<{ [K in T]: Thunk<View> }> & NoExtraCases<C, T>,
  D extends View,
>(
  value: T,
  cases: C,
  defaultView: Thunk<D>
): ReturnType<NonNullable<C[keyof C]>> | D;
// Discriminated union — exhaustive
export function Match<
  T extends Record<K, string | number>,
  K extends keyof T & string,
  C extends { [V in T[K] & (string | number)]: (value: Extract<T, Record<K, V>>) => View }
          & NoExtraCases<C, T[K]>,
>(
  value: T,
  key: K,
  cases: C,
): ReturnType<C[keyof C]>;
// Discriminated union — partial with default
export function Match<
  T extends Record<K, string | number>,
  K extends keyof T & string,
  C extends Partial<{ [V in T[K] & (string | number)]: (value: Extract<T, Record<K, V>>) => View }>
          & NoExtraCases<C, T[K]>,
  D extends View,
>(
  value: T,
  key: K,
  cases: C,
  defaultView: Thunk<D>,
): ReturnType<NonNullable<C[keyof C]>> | D;
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
    // Own-property lookup only — a bare `cases[discriminant]` finds inherited
    // Object.prototype members ("toString"/"constructor"/…), which pass a truthy
    // check and get invoked as handlers (garbage output / throw). Mirrors MatchValue.
    const handler = Object.prototype.hasOwnProperty.call(cases, discriminant) ? cases[discriminant] : undefined;
    if (typeof handler === "function") {
      return handler(value);
    }
    return (defaultView ?? Empty)();
  }

  // Value matching overload: Match(value, cases, ?default)
  const cases = casesOrKey as Record<string | number, Thunk<View> | undefined>;
  const key = value as string | number;
  const handler = Object.prototype.hasOwnProperty.call(cases, key) ? cases[key] : undefined;
  if (typeof handler === "function") {
    return handler();
  }
  return ((casesOrDefault as Thunk<View> | undefined) ?? Empty)();
}
