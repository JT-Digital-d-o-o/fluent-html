// Stand-in for TypeBox in this prototype: the same `{ static: T }` shape, so the real
// `Type.Object(...)` drops in unchanged.
type S<T> = { readonly static: T };
export const Type = {
  String: (_o?: { minLength?: number; maxLength?: number }): S<string> => ({}) as S<string>,
  Optional: <T>(_s: S<T>): S<T | undefined> => ({}) as S<T | undefined>,
  Union: <const T extends readonly S<unknown>[]>(_s: T): S<T[number]["static"]> => ({}) as never,
  Literal: <const T extends string>(_v: T): S<T> => ({}) as S<T>,
  Object: <T extends Record<string, S<unknown>>>(_p: T): S<{ [K in keyof T]: T[K]["static"] }> => ({}) as never,
};
export type Static<T extends S<unknown>> = T["static"];
