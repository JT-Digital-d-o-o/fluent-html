// Stand-in for zod, just large enough for the screens: the design takes any Standard Schema.
// Not part of the design and not counted.
type Issue = { message: string; path: PropertyKey[] };
export interface ZType<T> {
  readonly "~standard": { validate(value: unknown): { value: T; issues?: undefined } | { issues: Issue[] }; readonly types?: { input: unknown; output: T } };
  check(value: unknown, path: PropertyKey[], issues: Issue[]): T;
  optional(): ZType<T | undefined>;
}
function type<T>(check: ZType<T>["check"]): ZType<T> {
  const t: ZType<T> = {
    check,
    "~standard": {
      validate(value) {
        const issues: Issue[] = [];
        const out = check(value, [], issues);
        return issues.length ? { issues } : { value: out };
      },
    },
    optional: () => type<T | undefined>((v, p, i) => (v === undefined || v === "" ? undefined : check(v, p, i))),
  };
  return t;
}
interface ZString extends ZType<string> {
  min(n: number, message?: string): ZString;
  max(n: number, message?: string): ZString;
}
function string(rules: ((s: string) => string | null)[] = []): ZString {
  const base = type<string>((v, path, issues) => {
    if (typeof v !== "string") {
      issues.push({ message: "Required", path });
      return "";
    }
    for (const r of rules) {
      const m = r(v);
      if (m) {
        issues.push({ message: m, path });
        break;
      }
    }
    return v;
  });
  return Object.assign(base, {
    min: (n: number, message = `At least ${n} characters`) => string([...rules, (s) => (s.length < n ? message : null)]),
    max: (n: number, message = `At most ${n} characters`) => string([...rules, (s) => (s.length > n ? message : null)]),
  });
}
export const z = {
  string: () => string(),
  enum: <const V extends readonly string[]>(values: V) =>
    type<V[number]>((v, path, issues) => {
      if (!values.includes(v as string)) issues.push({ message: `Choose one of: ${values.join(", ")}`, path });
      return v as V[number];
    }),
  object: <S extends Record<string, ZType<any>>>(shape: S) =>
    type<{ [K in keyof S as undefined extends Out<S[K]> ? never : K]: Out<S[K]> } & { [K in keyof S as undefined extends Out<S[K]> ? K : never]?: Out<S[K]> }>((v, path, issues) => {
      const out: any = {};
      const src: any = typeof v === "object" && v !== null ? v : {};
      for (const k in shape) out[k] = shape[k].check(src[k], [...path, k], issues);
      return out;
    }),
};
type Out<T> = T extends ZType<infer O> ? O : never;
export namespace z {
  export type infer<T> = Out<T>;
}
