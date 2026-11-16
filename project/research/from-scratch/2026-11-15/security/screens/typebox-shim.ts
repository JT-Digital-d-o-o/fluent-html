// Stand-in for @sinclair/typebox in the prototype: the same call shape and the same
// `static` phantom that Static<T> reads. The real design takes the TypeBox schema as is.
import type { Schema } from "sealed";
type Opts = { minLength?: number; maxLength?: number; minimum?: number };
export const Type = {
  String: (_o?: Opts): Schema<string> => ({}) as Schema<string>,
  Number: (_o?: Opts): Schema<number> => ({}) as Schema<number>,
  Object: <T extends Record<string, Schema>>(_p: T): Schema<{ [K in keyof T]: T[K]["static"] }> => ({}) as never,
};
export type Static<T extends Schema> = T["static"];
