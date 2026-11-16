// rtsx core: values that carry trust (Html, Id, Route) and the escapers.
// Prototype for the from-scratch round. Not a product.

const ESC_TEST = /[&<>"']/;
const ESC_ALL = /[&<>"']/g;
const ESC_MAP: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escOne = (c: string): string => ESC_MAP[c]!;
export const esc = (s: string): string => (ESC_TEST.test(s) ? s.replace(ESC_ALL, escOne) : s);

export const enum Kind { Html = 0, Script = 1, Css = 2, Document = 3 }

// The only value the renderer emits without escaping. It is a class instance, so a value
// that arrived as JSON or form data can never be one (no structural forgery).
export class Html {
  private declare readonly __html: true;
  constructor(
    readonly html: string,
    readonly kind: Kind = Kind.Html,
    readonly rootId?: string,
  ) {}
  toString(): string {
    return this.html;
  }
}

export class Id<N extends string = string> {
  private declare readonly __id: N;
  constructor(readonly name: N) {}
  toString(): N {
    return this.name;
  }
}

type Camel<S extends string> = S extends `${infer A}-${infer B}` ? `${A}${Capitalize<Camel<B>>}` : S;

const ID_RE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

export function defineIds<const T extends readonly string[]>(names: T): { readonly [K in T[number] as Camel<K>]: Id<K> } {
  const out: Record<string, Id> = {};
  for (const n of names) {
    if (!ID_RE.test(n)) throw new Error(`rtsx: id "${n}" must be kebab-case`);
    out[n.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase())] = new Id(n);
  }
  return out as never;
}

// ── routes ────────────────────────────────────────────────────────────────

export type Method = "get" | "post" | "put" | "patch" | "delete";
export type Schema<T = unknown> = { readonly static: T };
export type Stance = Id | "none" | undefined;
export type Interval = `${number}s` | `${number}ms`;

export type RouteDef = {
  readonly method?: Method;
  readonly path: `/${string}`;
  readonly query?: Schema;
  readonly body?: Schema;
  readonly render?: Id | "none";
  readonly invalid?: Id;
  readonly poll?: Interval;
};

export class Route<M extends Method = Method, In = unknown, R extends Stance = Stance> {
  private declare readonly __route: [M, In];
  constructor(
    readonly url: string,
    readonly method: M,
    readonly render: R,
    readonly invalid?: Id,
    readonly poll?: Interval,
  ) {}
  toString(): string {
    return this.url;
  }
}

type PathParams<P extends string> = P extends `${string}:${infer Name}/${infer Rest}`
  ? Name | PathParams<`/${Rest}`>
  : P extends `${string}:${infer Name}`
    ? Name
    : never;

type QueryOf<D> = D extends { query: Schema<infer Q> } ? Partial<Q> : {};
type ArgsOf<D extends RouteDef> = { [K in PathParams<D["path"]>]: string | number } & QueryOf<D>;
type InOf<D> = D extends { body: Schema<infer B> } ? B : D extends { query: Schema<infer Q> } ? Q : unknown;
type MethodOf<D> = D extends { method: infer M extends Method } ? M : "get";
type StanceOf<D> = D extends { render: infer R extends Id | "none" } ? R : undefined;
type RouteOf<D> = Route<MethodOf<D>, InOf<D>, StanceOf<D>>;

type RouteFn<D extends RouteDef> = {} extends ArgsOf<D>
  ? (args?: ArgsOf<D>) => RouteOf<D>
  : (args: ArgsOf<D>) => RouteOf<D>;

export function defineRoutes<const T extends Record<string, RouteDef>>(prefix: `/${string}` | "", defs: T): { readonly [K in keyof T]: RouteFn<T[K]> } {
  const out: Record<string, unknown> = {};
  for (const key in defs) {
    const def = defs[key]!;
    const full = (prefix + def.path).replace(/\/+$/, "") || "/";
    const names = [...full.matchAll(/:([A-Za-z_][A-Za-z0-9_]*)/g)].map((m) => m[1]!);
    out[key] = (args: Record<string, unknown> = {}) => {
      let url = full;
      for (const n of names) {
        const v = args[n];
        if (v === undefined || v === null) throw new Error(`rtsx: route ${key} needs the param "${n}"`);
        url = url.replace(":" + n, encodeURIComponent(String(v)));
      }
      let qs = "";
      for (const k in args) {
        const v = args[k];
        if (names.includes(k) || v === undefined || v === null || v === "") continue;
        qs += (qs ? "&" : "?") + encodeURIComponent(k) + "=" + encodeURIComponent(String(v));
      }
      return new Route(url + qs, def.method ?? "get", def.render, def.invalid, def.poll);
    };
  }
  return out as never;
}

// A same-origin path that came from data (a stored return-to, a paging link). The one door
// for a runtime URL into an hx-* request attribute.
export function localUrl(path: string): Route<"get", unknown, undefined> {
  if (!/^\/(?![/\\])[^\s\\]*$/.test(path)) throw new Error(`rtsx: localUrl() takes a same-origin path starting with "/", got ${JSON.stringify(path.slice(0, 40))}`);
  return new Route(path, "get", undefined);
}

// A link target that came from data (a user's website). Scheme-checked when rendered.
export class Url {
  private declare readonly __url: true;
  constructor(readonly href: string) {}
}
export const url = (href: string): Url => new Url(href);

export const mainContent = new Id("main-content");

// ── trusted content for raw-text elements ─────────────────────────────────

const JSON_UNSAFE = /[<>&\u2028\u2029]/g;
const jsonEsc = (c: string): string => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0");
const safeJson = (v: unknown): string => JSON.stringify(v).replace(JSON_UNSAFE, jsonEsc);

// <script type="application/json">{json(data)}</script>
export const json = (data: unknown): Html => new Html(safeJson(data), Kind.Script);

// <script>{js`window.__DATA = ${data}`}</script>: every hole is serialised as JSON.
export function js(parts: TemplateStringsArray, ...holes: unknown[]): Html {
  let s = parts[0]!;
  for (let i = 0; i < holes.length; i++) s += safeJson(holes[i]) + parts[i + 1]!;
  if (/<\/script|<!--/i.test(s)) throw new Error("rtsx: js`` source must not contain </script or <!--");
  return new Html(s, Kind.Script);
}

const CSS_VALUE = /^[#%.,/()\w\s+-]*$/;
const CSS_BLOCKED = /url\s*\(|expression\s*\(|\/\*|@import/i;
export function cssValue(v: string | number): string {
  const s = String(v);
  if (!CSS_VALUE.test(s) || CSS_BLOCKED.test(s)) throw new Error(`rtsx: ${JSON.stringify(s.slice(0, 60))} is not a plain CSS value (no ; { } " ' \\ url( or comments)`);
  return s;
}

// <style>{css`.x { color: ${value} }`}</style>: every hole must be a plain CSS value.
export function css(parts: TemplateStringsArray, ...holes: (string | number)[]): Html {
  let s = parts[0]!;
  for (let i = 0; i < holes.length; i++) s += cssValue(holes[i]!) + parts[i + 1]!;
  if (/<\/style/i.test(s)) throw new Error("rtsx: css`` source must not contain </style");
  return new Html(s, Kind.Css);
}

// The declared bypass. Lint keeps it out of app code except an allowlisted file.
export const unsafeHtml = (trusted: string): Html => new Html(trusted);

// ── control flow that types can check ─────────────────────────────────────

type Out = Html | string | number | false | null | undefined;

export function match<T extends string | number, R extends Out>(value: T, cases: { [K in T]: () => R }): R;
export function match<T extends Record<D, string>, D extends keyof T, R extends Out>(value: T, on: D, cases: { [K in T[D]]: (v: Extract<T, Record<D, K>>) => R }): R;
export function match(value: any, a: any, b?: any): unknown {
  if (b === undefined) return a[value]();
  return b[value[a]](value);
}
