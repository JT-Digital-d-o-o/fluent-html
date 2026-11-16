// A TypeBox-shaped subset (Type.Object, String, Integer, Boolean, Literal, Union, Optional):
// plain JSON Schema objects carrying a static type. The real kit takes @sinclair/typebox as is;
// this stand-in keeps the prototype free of dependencies.

declare const staticType: unique symbol;
declare const optionalMark: unique symbol;

export type TSchema<T = unknown> = {
  readonly [staticType]?: T;
  readonly type?: "string" | "integer" | "number" | "boolean" | "object";
  readonly format?: "email" | "uri" | "date";
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly minimum?: number;
  readonly maximum?: number;
  readonly pattern?: string;
  readonly const?: string;
  readonly anyOf?: readonly TSchema[];
  readonly optional?: boolean;
  readonly properties?: Readonly<Record<string, TSchema>>;
};
export type TOptional<T> = TSchema<T> & { readonly [optionalMark]: true };
export type Static<S> = S extends TSchema<infer T> ? T : never;

export type Shape = Readonly<Record<string, TSchema>>;
type OptionalKeys<P extends Shape> = { [K in keyof P]: P[K] extends { readonly [optionalMark]: true } ? K : never }[keyof P];
type Flat<T> = { [K in keyof T]: T[K] } & {};
export type In<P extends Shape> = Flat<
  { [K in Exclude<keyof P, OptionalKeys<P>>]: Static<P[K]> } & { [K in OptionalKeys<P>]?: Static<P[K]> }
>;
export type TObject<P extends Shape> = TSchema<In<P>> & { readonly properties: P };

type StringOpts = Pick<TSchema, "format" | "minLength" | "maxLength" | "pattern">;
type NumberOpts = Pick<TSchema, "minimum" | "maximum">;

export const Type = {
  String: (o: StringOpts = {}): TSchema<string> => ({ type: "string", ...o }),
  Integer: (o: NumberOpts = {}): TSchema<number> => ({ type: "integer", ...o }),
  Number: (o: NumberOpts = {}): TSchema<number> => ({ type: "number", ...o }),
  Boolean: (): TSchema<boolean> => ({ type: "boolean" }),
  Literal: <const V extends string>(value: V): TSchema<V> => ({ const: value }),
  Union: <const A extends readonly TSchema<string>[]>(anyOf: A): TSchema<Static<A[number]>> => ({ anyOf }),
  Optional: <T>(s: TSchema<T>): TOptional<T> => ({ ...s, optional: true }) as TOptional<T>,
  Object: <const P extends Shape>(properties: P): TObject<P> => ({ type: "object", properties }),
};

export type Errors<T> = { [K in keyof T]?: string };
export type Parsed<T> = { ok: true; data: T } | { ok: false; errors: Record<string, string>; values: Record<string, string> };

export const literals = (s: TSchema): string[] | null =>
  s.const !== undefined ? [s.const] : s.anyOf ? s.anyOf.flatMap((x) => (x.const !== undefined ? [x.const] : [])) : null;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function one(s: TSchema, raw: string | undefined): { value?: unknown; error?: string } {
  const text = raw?.trim() ?? "";
  if (s.type === "boolean") return { value: text !== "" && text !== "false" && text !== "0" };
  if (text === "") return s.optional ? {} : { error: "Required" };
  const allowed = literals(s);
  if (allowed) return allowed.includes(text) ? { value: text } : { error: "Choose one of the options" };
  if (s.type === "integer" || s.type === "number") {
    const n = Number(text);
    if (!Number.isFinite(n) || (s.type === "integer" && !Number.isInteger(n))) return { error: s.type === "integer" ? "Enter a whole number" : "Enter a number" };
    if (s.minimum !== undefined && n < s.minimum) return { error: `At least ${s.minimum}` };
    if (s.maximum !== undefined && n > s.maximum) return { error: `At most ${s.maximum}` };
    return { value: n };
  }
  if (s.minLength !== undefined && text.length < s.minLength) return { error: `At least ${s.minLength} characters` };
  if (s.maxLength !== undefined && text.length > s.maxLength) return { error: `At most ${s.maxLength} characters` };
  if (s.format === "email" && !EMAIL.test(text)) return { error: "Enter an email address" };
  if (s.format === "uri" && !/^https?:\/\/\S+$/.test(text)) return { error: "Enter a web address starting with https://" };
  if (s.pattern !== undefined && !new RegExp(s.pattern).test(text)) return { error: "Not in the expected format" };
  return { value: text };
}

/** Coerce and validate strings (a form body, path params, a query) against a shape. */
export function parse<P extends Shape>(shape: P, raw: Record<string, string | undefined>): Parsed<In<P>> {
  const data: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  const values: Record<string, string> = {};
  for (const k in shape) {
    const r = one(shape[k]!, raw[k]);
    if (raw[k] !== undefined) values[k] = raw[k]!;
    if (r.error !== undefined) errors[k] = r.error;
    else if (r.value !== undefined) data[k] = r.value;
  }
  for (const k in errors) return { ok: false, errors, values };
  return { ok: true, data: data as In<P> };
}
