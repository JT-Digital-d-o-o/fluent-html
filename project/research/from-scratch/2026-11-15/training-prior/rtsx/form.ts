// The form binder: field names, values and errors typed from the route's body (or query).
import { Id, Route, type Method } from "./core.js";

export type FormState<T> = {
  readonly values?: { readonly [K in keyof T]?: unknown };
  readonly errors?: { readonly [K in keyof T]?: string };
};

type Field = { name: string; id: string; value: string; "aria-invalid"?: true; "aria-describedby"?: string };

export type Form<T> = {
  readonly form: { id?: Id } & { [K in `hx-${Method}`]?: Route<any, any, any> };
  field<K extends keyof T & string>(name: K): Field;
  checked<K extends keyof T & string>(name: K, value?: string): { name: string; id: string; value?: string; checked: boolean };
  value<K extends keyof T & string>(name: K): string;
  id<K extends keyof T & string>(name: K): string;
  error<K extends keyof T & string>(name: K): string | undefined;
  errorId<K extends keyof T & string>(name: K): string;
};

export function form<M extends Method, T>(route: Route<M, T, any>, state: FormState<T> = {}): Form<T> {
  const values = (state.values ?? {}) as Record<string, unknown>;
  const errors = (state.errors ?? {}) as Record<string, string | undefined>;
  const value = (n: string): string => (values[n] == null ? "" : String(values[n]));
  const attrs: Record<string, unknown> = { ["hx-" + route.method]: route };
  if (route.invalid !== undefined) attrs["id"] = route.invalid;
  return {
    form: attrs as Form<T>["form"],
    value,
    id: (n) => n,
    error: (n) => errors[n],
    errorId: (n) => n + "-error",
    field: (n) => (errors[n] === undefined ? { name: n, id: n, value: value(n) } : { name: n, id: n, value: value(n), "aria-invalid": true, "aria-describedby": n + "-error" }),
    checked: (n, v) => (v === undefined ? { name: n, id: n, checked: Boolean(values[n]) } : { name: n, id: n + "-" + v, value: v, checked: values[n] === v }),
  };
}
