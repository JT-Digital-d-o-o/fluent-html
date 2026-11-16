// Only what projects.schema.ts needs to yield the request type.
export type Static<T> = T extends { static: infer S } ? S : never;
type S<T> = { static: T };
export declare const Type: {
  String(o?: object): S<string>;
  Number(o?: object): S<number>;
  Literal<const V extends string>(v: V): S<V>;
  Union<T extends S<unknown>[]>(items: [...T]): S<T[number]["static"]>;
  Optional<T>(t: S<T>): S<T | undefined>;
  Object<P extends Record<string, S<unknown>>>(props: P): S<{ [K in keyof P]: P[K]["static"] }>;
};
