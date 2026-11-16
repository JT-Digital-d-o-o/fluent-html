
const MAIN = "main";
const NAV = ` hx-target="#${MAIN}" hx-swap="outerMorph show:top" hx-push-url="true"`;

/** A route address used as a leading argument. What it emits depends on the tag it sits on. */
export abstract class Ref {
  url: string;
  constructor(url: string) {
    this.url = url;
  }
  abstract on(tag: string): string;
}

/** A page address: a(ref, …) links to it, form(ref, …) is a GET form to it. */
export class PageRef extends Ref {
  declare readonly $ref: "page";
  on(tag: string): string {
    if (tag === "a") return ' href="' + esc(this.url) + '"';
    if (tag === "form") return ' action="' + esc(this.url) + '" method="get"';
    throw new TypeError(`lt: a page route goes on a(…) or form(…), not <${tag}>`);
  }
}

type Every = `${number}s` | `${number}ms`;
/** A fragment address plus the wires that load it. */
export class PartRef<I extends string, In = {}> {
  declare readonly $ref: "part";
  declare readonly $in: In;
  url: string;
  id: I;
  constructor(url: string, id: I) {
    this.url = url;
    this.id = id;
  }
  /** Makes the element this part's root: it carries the part's id. */
  get root(): Wire<I> {
    return new Wire<I>(' id="' + this.id + '"', this.id);
  }
  /** Root that refreshes itself while `every` is set. Pass false for the settled root, which ends the poll. */
  poll(every: Every | Falsy): Wire<I> {
    if (!every) return this.root;
    return new Wire<I>(` id="${this.id}" hx-get="${esc(this.url)}" hx-trigger="every ${every}" hx-target="this" hx-swap="outerHTML"`, this.id);
  }
  /** Root that loads itself once after the page arrives. */
  defer(): Wire<I> {
    return new Wire<I>(` id="${this.id}" hx-get="${esc(this.url)}" hx-trigger="load" hx-target="this" hx-swap="outerHTML" hx-sync="this:replace"`, this.id);
  }
  /** On an input: names the field and reloads the part after typing stops. */
  search(name: keyof In & string): Wire {
    return new Wire(` name="${name}" hx-get="${esc(this.url)}" hx-trigger="input changed delay:300ms, search" hx-target="#${this.id}" hx-swap="outerMorph" hx-sync="this:replace"`);
  }
  /** On a select or checkbox: names the field and reloads the part when it changes. */
  change(name: keyof In & string): Wire {
    return new Wire(` name="${name}" hx-get="${esc(this.url)}" hx-trigger="change" hx-target="#${this.id}" hx-swap="outerMorph" hx-include="closest form"`);
  }
  /** On a button: reloads the part on click. */
  load(): Wire {
    return new Wire(` hx-get="${esc(this.url)}" hx-target="#${this.id}" hx-swap="outerMorph"`);
  }
}

export type FormState<R> = R extends { readonly $b: infer Bd } ? State<Bd> : never;
type State<Bd> = { values?: { [K in keyof Bd]?: unknown }; errors?: { [K in keyof Bd]?: string } };
type Bound<A> = Omit<A, "name" | "value" | "id" | "checked">;
export interface Fields<Bd> {
  /** <input> bound to a schema field: name, id, value, aria-invalid and aria-describedby are filled in. */
  input(name: keyof Bd & string, ...rest: (Tw | Bound<Attrs["input"]>)[]): Html<undefined>;
  textarea(name: keyof Bd & string, ...rest: (Tw | Bound<Attrs["textarea"]>)[]): Html<undefined>;
  /** <select> whose options are a record of value to label; the record must cover the field's values. */
  select<K extends keyof Bd & string>(name: K, options: Record<Extract<Bd[K], string>, string>, ...rest: (Tw | Bound<Attrs["select"]>)[]): Html<undefined>;
  checkbox(name: keyof Bd & string, ...rest: (Tw | Bound<Attrs["input"]>)[]): Html<undefined>;
  hidden(name: keyof Bd & string, value: V): Html<undefined>;
  /** The field's error message, wired to its control. Renders nothing while the field is valid. */
  error(name: keyof Bd & string, ...rest: Tw[]): Html<undefined> | null;
}

/** A POST address. button(ref, …) posts on click; ref.form(…) builds its schema-bound form. */
export class ActionRef<Bd> extends Ref {
  declare readonly $ref: "post";
  declare readonly $b: Bd;
  formId: string;
  constructor(url: string, formId: string) {
    super(url);
    this.formId = formId;
  }
  on(tag: string): string {
    if (tag === "button") return ` hx-post="${esc(this.url)}"${NAV}`;
    throw new TypeError(`lt: an action route goes on button(…) or through .form(…), not <${tag}>`);
  }
  /** Posts with no swap (a counter, a like). */
  fire(): Wire {
    return new Wire(` hx-post="${esc(this.url)}" hx-swap="none"`);
  }
  /** The route's form: it carries the form region's id, and a 422 answer lands back in it. */
  form(state: State<Bd>, ...rest: [...lead: (Tw | Attrs["form"])[], body: (f: Fields<Bd>) => Child]): Html<undefined> {
    const id = this.formId;
    const u = esc(this.url);
    const body = rest[rest.length - 1] as (f: Fields<Bd>) => Child;
    const lead = lead_(rest, 0, rest.length - 1);
    return new Html<undefined>(
      `<form${lead} id="${id}" action="${u}" method="post" hx-post="${u}"${NAV} hx-status:422="target:#${id} swap:outerMorph push:false">` + kid(body(fields(id, state))) + "</form>",
      id,
    );
  }
}

function lead_(args: readonly any[], from: number, to: number): string {
  let klass = "";
  let rest = "";
  for (let i = from; i < to; i++) {
    const a = args[i];
    if (a instanceof Tw) klass = klass === "" ? a.c : klass + " " + a.c;
    else if (a) rest += attrs(a);
  }
  return (klass === "" ? "" : ' class="' + klass + '"') + rest;
}

function fields(formId: string, state: State<any>): Fields<any> {
  const values: Record<string, unknown> = state.values ?? {};
  const errors: Record<string, string | undefined> = state.errors ?? {};
  const base = formId.replace(/-form$/, "");
  const wired = (name: string) => ` name="${esc(name)}" id="${base}-${esc(name)}"` + (errors[name] ? ` aria-invalid="true" aria-describedby="${base}-${esc(name)}-error"` : "");
  const val = (name: string) => (values[name] == null ? "" : String(values[name]));
  const typeOf = (rest: any[]) => rest.find((a) => a && !(a instanceof Tw) && a.type != null)?.type;
  return {
    input(name, ...rest) {
      const type = typeOf(rest);
      const value = type === "password" || val(name) === "" ? "" : ` value="${esc(val(name))}"`;
      return new Html(`<input${wired(name)}${type ? "" : ' type="text"'}${value}${lead_(rest, 0, rest.length)}>`);
    },
    textarea: (name, ...rest) => new Html(`<textarea${wired(name)}${lead_(rest, 0, rest.length)}>${esc(val(name))}</textarea>`),
    select(name, options: Record<string, string>, ...rest) {
      let o = "";
      for (const value in options) o += `<option value="${esc(value)}"${val(name) === value ? " selected" : ""}>${esc(options[value])}</option>`;
      return new Html(`<select${wired(name)}${lead_(rest, 0, rest.length)}>${o}</select>`);
    },
    checkbox: (name, ...rest) => new Html(`<input${wired(name)} type="checkbox"${values[name] ? " checked" : ""}${lead_(rest, 0, rest.length)}>`),
    hidden: (name, value) => new Html(`<input type="hidden" name="${esc(name)}" value="${esc(String(value ?? ""))}">`),
    error: (name, ...rest) => (errors[name] ? new Html(`<span id="${base}-${esc(name)}-error"${lead_(rest, 0, rest.length)}>${esc(errors[name]!)}</span>`) : null),
  };
}

