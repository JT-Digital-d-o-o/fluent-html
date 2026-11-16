// The semantic layer: page, region, form, action, and the parts views are written with.
// A part owns its address, its DOM id, its htmx wiring and its ARIA; app code names none of them.

import { View, Href, KitError, esc, kids, attrs, cx, type Child } from "./core.ts";
import { parse, literals, type Shape, type In, type TObject, type TSchema, type Static, type Errors } from "./schema.ts";

export type KitRequest = { method: string; url: string; headers?: Readonly<Record<string, string | undefined>>; body?: Readonly<Record<string, string>> };
export type KitResponse = { status: number; headers: Record<string, string>; body: string };
export type Ctx<P, Q> = { readonly params: P; readonly query: Q; readonly request: KitRequest };

// ---------- what a handler answers ----------

export class Redirect {
  readonly to: string;
  constructor(to: string) {
    this.to = to;
  }
}
export class NotFound {
  readonly status = 404;
}
export class Invalid<T = any> {
  readonly errors: Errors<T>;
  constructor(errors: Errors<T>) {
    this.errors = errors;
  }
}
export class Refresh {
  readonly regions: readonly RegionPart<any, any, any>[];
  constructor(regions: readonly RegionPart<any, any, any>[]) {
    this.regions = regions;
  }
}
export type Result = Redirect | Refresh | NotFound;

type UrlArgs<P, Q> = {} extends P ? [params?: P, query?: Partial<Q>] : [params: P, query?: Partial<Q>];

/** Go to a page: a 303 for a plain request, a client-side navigation for htmx. */
export const redirect = <P, Q>(to: PagePart<P, Q, any>, ...args: UrlArgs<P, Q>): Redirect => new Redirect(to.url(...args).value);
const NOT_FOUND = new NotFound();
/** From a loader or a handler: the page answers 404; a region answers its empty, trigger-less shell. */
export const notFound = (): NotFound => NOT_FOUND;
/** From a form's submit: errors the schema cannot know (a taken name). Answers 422 into the form. */
export const invalid = <T>(errors: Errors<T>): Invalid<T> => new Invalid(errors);
/** From an action or a submit: render these regions again and swap each in place. */
export const refresh = (...regions: RegionPart<any, any, any>[]): Refresh => new Refresh(regions);

// ---------- styles the parts apply to what they emit ----------

const styles = {
  field: "", label: "", input: "", hint: "", error: "", submit: "",
  searchLabel: "sr-only", search: "",
  list: "", row: "",
  dialog: "", dialogTitle: "", dialogBody: "", dialogActions: "", cancel: "", confirm: "",
};
export type Styles = typeof styles;
export function configure(options: { styles?: Partial<Styles>; lang?: string }): void {
  Object.assign(styles, options.styles);
  if (options.lang !== undefined) lang = options.lang;
}
let lang = "en";
const cls = (...c: (string | false | null | undefined)[]): string => {
  const v = cx(...c);
  return v ? ' class="' + esc(v) + '"' : "";
};

// ---------- render scope ----------

type FormState = { values: Record<string, string>; errors: Record<string, string | undefined> };
type Scope = {
  ctx: Ctx<any, any>;
  page: PagePart<any, any, any>;
  path: string;
  pending: { marker: string; region: RegionPart<any, any, any> }[];
  forms: Map<FormPart<any, any, any>, FormState>;
  seq: { n: number };
  regionId: string | null;
};
let scope: Scope | null = null;
function inScope<T>(s: Scope, fn: () => T): T {
  const prev = scope;
  scope = s;
  try {
    return fn();
  } finally {
    scope = prev;
  }
}
function current(what: string): Scope {
  if (scope === null) throw new KitError(`${what} runs inside a view: call it from a part's view, not at module level or after an await`);
  return scope;
}

// ---------- addresses ----------

type PathParams<S extends string> = S extends `${string}:${infer Rest}`
  ? Rest extends `${infer Name}/${infer Tail}` ? Name | PathParams<`/${Tail}`> : Rest
  : never;

function buildUrl(path: string, params: Record<string, unknown> | undefined, query: Record<string, unknown> | undefined): string {
  let u = path.includes(":")
    ? path.replace(/:([A-Za-z0-9_]+)/g, (_, k: string) => {
        const v = params?.[k];
        if (v === undefined || v === null || v === "") throw new KitError(`url for ${path}: param "${k}" is missing`);
        return encodeURIComponent(String(v));
      })
    : path;
  if (query) {
    let sep = "?";
    for (const k in query) {
      const v = query[k];
      if (v === undefined || v === null || v === "") continue;
      u += sep + encodeURIComponent(k) + "=" + encodeURIComponent(String(v));
      sep = "&";
    }
  }
  return u;
}
const slug = (path: string): string => path.replace(/[:/]+/g, "-").replace(/^-|-$/g, "") || "home";

export const MAIN_ID = "main-content";
const NAV_WIRE = ' hx-target="#' + MAIN_ID + '" hx-swap="outerMorph show:top" hx-push-url="true"';

// ---------- page ----------

/** What a page's view returns: only Page() makes one. */
export class PageView extends View {
  readonly title: string;
  readonly description: string | undefined;
  constructor(title: string, description: string | undefined, main: string) {
    super(main);
    this.title = title;
    this.description = description;
  }
}

/** The document: head, one <main id="main-content">, the children inside it. */
export function Page(props: { title: string; description?: string; class?: string }, ...children: Child[]): PageView {
  return new PageView(props.title, props.description, '<main id="' + MAIN_ID + '"' + cls(props.class) + ">" + kids(children) + "</main>");
}

type Guard<P, Q> = (ctx: Ctx<P, Q>) => Result | void | Promise<Result | void>;
type Loaded<R> = Exclude<Awaited<R>, NotFound>;

type PageDef<Path extends string, PS extends Shape, QS extends Shape, R> = {
  /** One schema per `:param` in the path. */
  params?: PS;
  query?: QS;
  /** Runs before the page and before every region, form and action the page owns. */
  guard?: Guard<In<PS>, In<QS>>;
  load?: (ctx: Ctx<In<PS>, In<QS>>) => R;
} & ([PathParams<Path>] extends [never] ? {} : { params: Record<PathParams<Path>, TSchema> });

export class PagePart<P, Q, D> {
  readonly path: string;
  readonly id: string;
  /** @internal */ readonly def: PageDef<string, Shape, Shape, unknown>;
  /** @internal */ readonly owned = new Map<string, RegionPart<P, Q, any> | FormPart<P, Q, any> | ActionPart<P, Q>>();
  /** @internal */ render: ((ctx: Ctx<P, Q> & { data: D }) => PageView) | null = null;

  constructor(path: string, def: PageDef<string, Shape, Shape, unknown>) {
    this.path = path;
    this.id = slug(path);
    this.def = def;
  }

  /** The page's view. Attached as a statement, after the parts are declared, so it can name any of them. */
  view(fn: (ctx: Ctx<P, Q> & { data: D }) => PageView): void {
    this.render = fn;
  }

  url(...args: UrlArgs<P, Q>): Href {
    return new Href(buildUrl(this.path, args[0] as Record<string, unknown> | undefined, args[1]));
  }

  /** A slice of this page that loads and re-renders by itself: the target of a Search, a poll, a refresh(). */
  region<R>(name: string, def: RegionDef<P, Q, R>): RegionPart<P, Q, Loaded<R>> {
    return this.own(name, new RegionPart<P, Q, Loaded<R>>(this, name, def as RegionDef<P, Q, unknown>));
  }

  /** A form bound to a schema. An invalid submit answers 422 and re-renders the form with each field's error. */
  form<const S extends Shape>(name: string, def: FormDef<P, Q, S>): FormPart<P, Q, S> {
    return this.own(name, new FormPart<P, Q, S>(this, name, def));
  }

  /** A POST with no fields: a delete, an archive, a retry. `confirm` puts a native dialog in front of it. */
  action(name: string, def: ActionDef<P, Q>): ActionPart<P, Q> {
    return this.own(name, new ActionPart<P, Q>(this, name, def));
  }

  private own<T extends RegionPart<P, Q, any> | FormPart<P, Q, any> | ActionPart<P, Q>>(name: string, part: T): T {
    if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new KitError(`${this.path}: part name "${name}" must be lowercase letters, digits and dashes`);
    if (this.owned.has(name)) throw new KitError(`${this.path} already has a part named "${name}"`);
    this.owned.set(name, part);
    return part;
  }
}

/** A URL that answers a document. Regions, forms and actions hang off it and share its URL, params, query and guard. */
export function page<const Path extends string, const PS extends Shape = {}, const QS extends Shape = {}, R = undefined>(
  path: Path,
  def: PageDef<Path, PS, QS, R> = {} as PageDef<Path, PS, QS, R>,
): PagePart<In<PS>, In<QS>, Loaded<R>> {
  return new PagePart(path, def as PageDef<string, Shape, Shape, unknown>);
}

// ---------- region ----------

type RegionDef<P, Q, R> = {
  load: (ctx: Ctx<P, Q>) => R;
  /** Re-fetch on a timer while `while` holds. The render where it stops holding carries no timer, so polling ends. */
  poll?: { every: `${number}s`; while: (ctx: { data: Loaded<R> }) => boolean };
  class?: string;
};

export class RegionPart<P, Q, D> {
  readonly id: string;
  /** @internal */ readonly page: PagePart<P, Q, any>;
  /** @internal */ readonly def: RegionDef<P, Q, unknown>;
  /** @internal */ render: ((ctx: Ctx<P, Q> & { data: D }) => Child) | null = null;

  constructor(page: PagePart<P, Q, any>, name: string, def: RegionDef<P, Q, unknown>) {
    this.page = page;
    this.id = page.id + "-" + name;
    this.def = def;
  }

  view(fn: (ctx: Ctx<P, Q> & { data: D }) => Child): void {
    this.render = fn;
  }

  /** Place the region in its page. Its loader runs beside the others; nothing is passed in. */
  show(): View {
    const s = current("region.show()");
    if (s.page !== this.page) throw new KitError(`region ${this.id} belongs to ${this.page.path}; it cannot be shown on ${s.page.path}`);
    const marker = "<!--kit-region:" + s.seq.n++ + "-->";
    s.pending.push({ marker, region: this });
    return new View(marker);
  }

  /** @internal */
  async html(s: Scope): Promise<string> {
    const data = await this.def.load(s.ctx);
    let open = '<div id="' + this.id + '"' + cls(this.def.class);
    const poll = this.def.poll;
    if (poll) open += ' role="status"';
    if (data instanceof NotFound) return open + "></div>";
    if (poll && poll.while({ data: data as never })) {
      const url = buildUrl(this.page.path, s.ctx.params, s.ctx.query);
      open += ' hx-get="' + esc(url) + '" hx-trigger="every ' + poll.every + '" hx-target="this" hx-swap="outerHTML"';
    }
    const inner = inScope({ ...s, regionId: this.id }, () => kids([this.render!({ ...s.ctx, data: data as D })]));
    return open + ">" + inner + "</div>";
  }
}

// ---------- form ----------

type FormDef<P, Q, S extends Shape> = {
  schema: TObject<S>;
  /** Runs only with valid data. */
  submit: (ctx: Ctx<P, Q> & { data: In<S> }) => Result | Invalid<In<S>> | Promise<Result | Invalid<In<S>>>;
  class?: string;
};

type FieldBase = { hint?: string; placeholder?: string; autocomplete?: string; class?: string };
type FieldOptions<F> = [Static<F>] extends [boolean]
  ? [options?: Pick<FieldBase, "hint" | "class">]
  : [Static<F>] extends [string]
    ? string extends Static<F>
      ? [options?: FieldBase & { as?: "textarea" | "password"; rows?: number }]
      : [options: Pick<FieldBase, "hint" | "class"> & { options: Record<Static<F> & string, string> }]
    : [options?: FieldBase];

export type Fields<S extends Shape> = {
  /** Label, control, hint and error as one unit. The control, `required`, length and range come from the schema. */
  field<K extends keyof S & string>(name: K, label: string, ...options: FieldOptions<S[K]>): View;
  submit(label: Child, attrs?: { class?: string }): View;
};

export class FormPart<P, Q, S extends Shape> {
  readonly id: string;
  /** @internal */ readonly page: PagePart<P, Q, any>;
  /** @internal */ readonly name: string;
  /** @internal */ readonly def: FormDef<P, Q, S>;
  /** @internal */ render: ((f: Fields<S>) => Child) | null = null;

  constructor(page: PagePart<P, Q, any>, name: string, def: FormDef<P, Q, S>) {
    this.page = page;
    this.name = name;
    this.id = page.id + "-" + name;
    this.def = def;
  }

  view(fn: (f: Fields<S>) => Child): void {
    this.render = fn;
  }

  /** Place the form. `values` prefills it (an edit form); after a 422 the submitted values and errors win. */
  show(values: Partial<In<S>> = {}): View {
    const s = current("form.show()");
    let state = s.forms.get(this);
    if (state === undefined) {
      state = { values: {}, errors: {} };
      const given = values as Record<string, unknown>;
      for (const k in given) if (given[k] !== undefined && given[k] !== null) state.values[k] = String(given[k]);
    }
    return new View(this.html(s, state));
  }

  /** @internal */
  html(s: Scope, state: FormState): string {
    const url = esc(buildUrl(this.page.path, s.ctx.params, undefined) + "?/" + this.name);
    const formId = this.id;
    const shape = this.def.schema.properties;
    const f: Fields<S> = {
      field: (name, label, ...rest) => new View(fieldHtml(formId, name, label, shape[name]!, state, (rest[0] ?? {}) as AnyFieldOptions)),
      submit: (label, a) => new View('<button type="submit"' + cls(styles.submit, a?.class) + ">" + kids([label]) + "</button>"),
    };
    return (
      '<form id="' + formId + '" method="post" action="' + url + '" hx-post="' + url + '" hx-target="this" hx-swap="outerMorph" hx-disable="find button"' +
      cls(this.def.class) + ">" + kids([this.render!(f)]) + "</form>"
    );
  }
}

type AnyFieldOptions = FieldBase & { as?: "textarea" | "password"; rows?: number; options?: Record<string, string> };

function fieldHtml(formId: string, name: string, label: string, schema: TSchema, state: FormState, o: AnyFieldOptions): string {
  const id = formId + "-" + name;
  const error = state.errors[name];
  const value = state.values[name] ?? "";
  const described = cx(o.hint !== undefined && id + "-hint", error !== undefined && id + "-error");
  let common = ' id="' + id + '" name="' + esc(name) + '"';
  if (schema.type !== "boolean" && schema.optional !== true) common += " required";
  if (error !== undefined) common += ' aria-invalid="true"';
  if (described) common += ' aria-describedby="' + described + '"';
  common += cls(styles.input, o.class);
  const labelHtml = '<label for="' + id + '"' + cls(styles.label) + ">" + esc(label) + "</label>";

  let control: string;
  const choices = literals(schema);
  if (schema.type === "boolean") {
    control = '<input type="checkbox" value="true"' + common + (value !== "" && value !== "false" ? " checked" : "") + ">";
  } else if (choices) {
    control = "<select" + common + ">" + (schema.optional ? '<option value=""></option>' : "");
    for (const c of choices) control += '<option value="' + esc(c) + '"' + (c === value ? " selected" : "") + ">" + esc(o.options?.[c] ?? c) + "</option>";
    control += "</select>";
  } else {
    let limits = "";
    if (schema.minLength !== undefined && schema.minLength > 1) limits += ' minlength="' + schema.minLength + '"';
    if (schema.maxLength !== undefined) limits += ' maxlength="' + schema.maxLength + '"';
    if (schema.minimum !== undefined) limits += ' min="' + schema.minimum + '"';
    if (schema.maximum !== undefined) limits += ' max="' + schema.maximum + '"';
    if (o.placeholder !== undefined) limits += ' placeholder="' + esc(o.placeholder) + '"';
    if (o.autocomplete !== undefined) limits += ' autocomplete="' + esc(o.autocomplete) + '"';
    if (o.as === "textarea") {
      control = "<textarea" + common + limits + ' rows="' + (o.rows ?? 4) + '">' + esc(value) + "</textarea>";
    } else {
      const type =
        o.as === "password" ? "password"
        : schema.type === "integer" || schema.type === "number" ? "number"
        : schema.format === "email" ? "email" : schema.format === "uri" ? "url" : schema.format === "date" ? "date" : "text";
      control = '<input type="' + type + '"' + common + limits + (type === "password" ? "" : ' value="' + esc(value) + '"') + ">";
    }
  }
  return (
    "<div" + cls(styles.field) + ">" + (schema.type === "boolean" ? control + labelHtml : labelHtml + control) +
    (o.hint !== undefined ? '<p id="' + id + '-hint"' + cls(styles.hint) + ">" + esc(o.hint) + "</p>" : "") +
    (error !== undefined ? '<p id="' + id + '-error"' + cls(styles.error) + ">" + esc(error) + "</p>" : "") +
    "</div>"
  );
}

// ---------- action ----------

type Confirm = { title: string; body?: string; confirm?: string; cancel?: string };
type ActionDef<P, Q> = {
  confirm?: Confirm;
  run: (ctx: Ctx<P, Q>) => Result | Promise<Result>;
};

export class ActionPart<P, Q> {
  readonly id: string;
  /** @internal */ readonly page: PagePart<P, Q, any>;
  /** @internal */ readonly name: string;
  /** @internal */ readonly def: ActionDef<P, Q>;

  constructor(page: PagePart<P, Q, any>, name: string, def: ActionDef<P, Q>) {
    this.page = page;
    this.name = name;
    this.id = page.id + "-" + name;
    this.def = def;
  }

  /** The button that fires the action. With `confirm`, it opens the dialog and the dialog's button fires it. */
  button(a: { class?: string }, ...children: Child[]): View {
    const s = current("action.button()");
    const url = esc(buildUrl(this.page.path, s.ctx.params, undefined) + "?/" + this.name);
    const form = '<form method="post" action="' + url + '" hx-post="' + url + '" hx-swap="none" hx-disable="find button"';
    const c = this.def.confirm;
    if (c === undefined) {
      return new View(form + ' class="contents"><button type="submit"' + cls(a.class) + ">" + kids(children) + "</button></form>");
    }
    const dialogId = this.id + "-dialog";
    return new View(
      '<button type="button"' + cls(a.class) + ' command="show-modal" commandfor="' + dialogId + '">' + kids(children) + "</button>" +
      '<dialog id="' + dialogId + '" closedby="any" aria-labelledby="' + dialogId + '-title"' + cls(styles.dialog) + ">" + form + ">" +
      '<h2 id="' + dialogId + '-title"' + cls(styles.dialogTitle) + ">" + esc(c.title) + "</h2>" +
      (c.body !== undefined ? "<p" + cls(styles.dialogBody) + ">" + esc(c.body) + "</p>" : "") +
      "<div" + cls(styles.dialogActions) + ">" +
      '<button type="button" command="close" commandfor="' + dialogId + '"' + cls(styles.cancel) + ">" + esc(c.cancel ?? "Cancel") + "</button>" +
      '<button type="submit"' + cls(styles.confirm) + ">" + esc(c.confirm ?? "Confirm") + "</button>" +
      "</div></form></dialog>",
    );
  }
}

// ---------- parts used inside views ----------

type ParamsProp<P> = {} extends P ? { params?: P } : { params: P };

/** In-app navigation: a real href, swapped into main by htmx, `aria-current` when it is the page being shown. */
export function Link<P, Q>(
  props: { to: PagePart<P, Q, any>; query?: Partial<Q>; class?: string; "aria-label"?: string } & ParamsProp<P>,
  ...children: Child[]
): View {
  const path = buildUrl(props.to.path, props.params as Record<string, unknown> | undefined, undefined);
  const url = esc(props.query ? buildUrl(path, undefined, props.query) : path);
  let s = '<a href="' + url + '" hx-get="' + url + '"' + NAV_WIRE;
  if (scope !== null && scope.path === path) s += ' aria-current="page"';
  if (props["aria-label"] !== undefined) s += ' aria-label="' + esc(props["aria-label"]) + '"';
  return new View(s + cls(props.class) + ">" + kids(children) + "</a>");
}

/** A search box that re-renders one region as the user types. `name` is a key of the page's query. */
export function Search<P, Q>(props: { into: RegionPart<P, Q, any>; name: keyof Q & string; label: string; placeholder?: string; class?: string }): View {
  const s = current("Search()");
  const region = props.into;
  const id = region.id + "-" + props.name;
  const action = esc(buildUrl(region.page.path, s.ctx.params, undefined));
  const url = esc(buildUrl(region.page.path, s.ctx.params, { ...s.ctx.query, [props.name]: undefined }));
  const value = s.ctx.query[props.name];
  return new View(
    '<search><form method="get" action="' + action + '"' + cls(styles.search) + '><label for="' + id + '"' + cls(styles.searchLabel) + ">" + esc(props.label) + "</label>" +
    '<input type="search" id="' + id + '" name="' + esc(props.name) + '"' + (value !== undefined ? ' value="' + esc(String(value)) + '"' : "") +
    (props.placeholder !== undefined ? ' placeholder="' + esc(props.placeholder) + '"' : "") + cls(styles.input, props.class) +
    ' hx-get="' + url + '" hx-target="#' + region.id + '" hx-swap="outerMorph" hx-trigger="input changed delay:300ms, search" hx-sync="this:replace" hx-push-url="true">' +
    '<button type="submit"' + cls(styles.searchLabel) + ">" + esc(props.label) + "</button></form></search>",
  );
}

/** A keyed list or, when there are no items, its empty state. Rows keep focus and scroll across a morph. */
export function List<T>(props: { items: readonly T[]; key: (item: T) => string | number; row: (item: T) => Child; empty: Child; class?: string; rowClass?: string }): View {
  const items = props.items;
  if (items.length === 0) return new View(kids([props.empty]));
  const prefix = (scope?.regionId ?? "list") + "-";
  const rowOpen = "<li" + cls(styles.row, props.rowClass) + ' id="' + prefix;
  let s = "<ul" + cls(styles.list, props.class) + ">";
  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    s += rowOpen + esc(String(props.key(item))) + '">' + kids([props.row(item)]) + "</li>";
  }
  return new View(s + "</ul>");
}

// ---------- the app ----------

const isHtmx = (req: KitRequest): boolean => req.headers?.["hx-request"] === "true" && req.headers["hx-history-restore-request"] !== "true";

function documentHtml(v: PageView): string {
  return (
    '<!DOCTYPE html><html lang="' + lang + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
    "<title>" + esc(v.title) + "</title>" + (v.description !== undefined ? '<meta name="description" content="' + esc(v.description) + '">' : "") +
    "</head><body>" + v.html + "</body></html>"
  );
}

async function settle(html: string, s: Scope): Promise<string> {
  while (s.pending.length > 0) {
    const batch = s.pending.splice(0);
    const done = await Promise.all(batch.map((b) => b.region.html(s)));
    for (let i = 0; i < batch.length; i++) html = html.replace(batch[i]!.marker, () => done[i]!);
  }
  return html;
}

const HTML = { "content-type": "text/html; charset=utf-8", vary: "HX-Request, HX-Target" };

export function app(...modules: Readonly<Record<string, unknown>>[]) {
  const pages: { part: PagePart<any, any, any>; re: RegExp; names: string[] }[] = [];
  const missing: string[] = [];
  for (const m of modules) {
    for (const key in m) {
      const part = m[key];
      if (!(part instanceof PagePart)) continue;
      const names: string[] = [];
      const re = new RegExp("^" + part.path.replace(/:([A-Za-z0-9_]+)/g, (_, k: string) => (names.push(k), "([^/]+)")) + "/?$");
      pages.push({ part, re, names });
      if (part.render === null) missing.push(`page ${part.path}`);
      for (const [name, owned] of part.owned) if (!(owned instanceof ActionPart) && owned.render === null) missing.push(`${part.path} ${name}`);
    }
  }
  pages.sort((a, b) => a.names.length - b.names.length);
  if (missing.length > 0) throw new KitError(`no view attached (call .view(…) on each): ${missing.join(", ")}`);

  const notFoundPage = (): KitResponse => ({ status: 404, headers: HTML, body: documentHtml(Page({ title: "Not found" }, new View("<h1>Not found</h1>"))) });

  async function pageResponse(s: Scope, status: number, htmx: boolean): Promise<KitResponse> {
    const p = s.page;
    const data = p.def.load ? await p.def.load(s.ctx) : undefined;
    if (data instanceof NotFound) return notFoundPage();
    const v = inScope(s, () => p.render!({ ...s.ctx, data }));
    if (!(v instanceof PageView)) throw new KitError(`${p.path}: a page's view returns Page(…)`);
    const main = await settle(v.html, s);
    const body = htmx ? "<title>" + esc(v.title) + "</title>" + main : documentHtml(new PageView(v.title, v.description, main));
    return { status, headers: HTML, body };
  }

  async function answer(r: Result, s: Scope, htmx: boolean): Promise<KitResponse> {
    if (r instanceof Redirect) {
      return htmx
        ? { status: 204, headers: { "hx-location": JSON.stringify({ path: r.to, target: "#" + MAIN_ID, swap: "outerMorph show:top" }) }, body: "" }
        : { status: 303, headers: { location: r.to }, body: "" };
    }
    if (r instanceof Refresh) {
      if (!htmx) return { status: 303, headers: { location: buildUrl(s.page.path, s.ctx.params, s.ctx.query) }, body: "" };
      let body = "";
      for (const region of r.regions) {
        const swap = region.def.poll ? "outerHTML" : "outerMorph";
        body += '<template hx type="partial" hx-target="#' + region.id + '" hx-swap="' + swap + '">' + (await settle(await region.html(s), s)) + "</template>";
      }
      return { status: 200, headers: HTML, body };
    }
    return notFoundPage();
  }

  return {
    async handle(req: KitRequest): Promise<KitResponse> {
      const u = new URL(req.url, "http://app.invalid");
      for (const { part, re, names } of pages) {
        const m = re.exec(u.pathname);
        if (m === null) continue;
        const rawParams: Record<string, string> = {};
        names.forEach((n, i) => (rawParams[n] = decodeURIComponent(m[i + 1]!)));
        const params = parse(part.def.params ?? {}, rawParams);
        if (!params.ok) continue;
        const rawQuery: Record<string, string> = {};
        let owned: string | null = null;
        for (const [k, v] of u.searchParams) k.startsWith("/") ? (owned = k.slice(1)) : (rawQuery[k] = v);
        let query = parse(part.def.query ?? {}, rawQuery);
        if (!query.ok) {
          for (const k in query.errors) delete rawQuery[k];
          query = parse(part.def.query ?? {}, rawQuery);
          if (!query.ok) return notFoundPage();
        }
        const ctx: Ctx<any, any> = { params: params.data, query: query.data, request: req };
        const htmx = isHtmx(req);
        const s: Scope = { ctx, page: part, path: u.pathname, pending: [], forms: new Map(), seq: { n: 0 }, regionId: null };

        const refused = part.def.guard ? await part.def.guard(ctx) : undefined;
        if (refused) return answer(refused, s, htmx);

        if (req.method === "POST") {
          const target = owned === null ? undefined : part.owned.get(owned);
          if (target instanceof ActionPart) return answer(await target.def.run(ctx), s, htmx);
          if (!(target instanceof FormPart)) return notFoundPage();
          const body = parse(target.def.schema.properties as Shape, req.body ?? {});
          let state: FormState;
          if (body.ok) {
            const r = await target.def.submit({ ...ctx, data: body.data });
            if (!(r instanceof Invalid)) return answer(r, s, htmx);
            state = { values: { ...req.body }, errors: r.errors as Record<string, string | undefined> };
          } else state = { values: body.values, errors: body.errors };
          if (htmx) return { status: 422, headers: HTML, body: inScope(s, () => target.html(s, state)) };
          s.forms.set(target, state);
          return pageResponse(s, 422, false);
        }
        if (req.method !== "GET") return { status: 405, headers: { allow: "GET, POST" }, body: "" };

        if (htmx) {
          const targetId = req.headers?.["hx-target"]?.split("#")[1];
          const region = targetId === undefined ? undefined : [...part.owned.values()].find((o) => o instanceof RegionPart && o.id === targetId);
          if (region instanceof RegionPart) return { status: 200, headers: HTML, body: await settle(await region.html(s), s) };
        }
        return pageResponse(s, 200, htmx);
      }
      return notFoundPage();
    },
  };
}
