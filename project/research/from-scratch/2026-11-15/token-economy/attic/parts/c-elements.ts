// ───────────────────────── elements ─────────────────────────

function kid(c: any): string {
  if (typeof c === "string") return esc(c);
  if (c instanceof Html) return c.h;
  if (c == null || c === false || c === true) return "";
  if (typeof c === "number") return String(c);
  if (Array.isArray(c)) {
    let s = "";
    for (let i = 0; i < c.length; i++) s += kid(c[i]);
    return s;
  }
  if (c instanceof Page) throw new TypeError("lt: a Page cannot be rendered inside an element");
  if (typeof c === "function") throw new TypeError("lt: a tag must be called to become a child: hr(), not hr");
  throw new TypeError("lt: classes, attributes and wires come before children: tag(tw`…`, {…}, child, child)");
}

function make(tag: string, isVoid = false): any {
  const open = "<" + tag;
  const close = isVoid ? "" : "</" + tag + ">";
  const isButton = tag === "button";
  return function (...args: any[]): Html<any> {
    let s = open;
    let rest = "";
    let klass = "";
    let id: string | undefined;
    let typed = !isButton;
    const n = args.length;
    let i = 0;
    for (; i < n; i++) {
      const a = args[i];
      if (typeof a !== "object" || a === null) break;
      if (a instanceof Tw) klass = klass === "" ? a.c : klass + " " + a.c;
      else if (a instanceof Wire) {
        rest += a.s;
        if (a.id !== undefined) id = a.id;
      } else if (a instanceof Html || Array.isArray(a)) break;
      else if (a instanceof Ref) rest += a.on(tag);
      else {
        rest += attrs(a);
        if (!typed && a.type != null) typed = true;
        if (typeof a.id === "string") id = a.id;
      }
    }
    if (klass !== "") s += ' class="' + klass + '"';
    s += rest;
    if (!typed) s += ' type="button"';
    s += ">";
    if (isVoid) {
      if (i < n) throw new TypeError(`lt: <${tag}> is a void element and takes no children`);
      return new Html(s, id);
    }
    for (; i < n; i++) s += kid(args[i]);
    return new Html(s + close, id);
  };
}

const SITE = new WeakMap<TemplateStringsArray, Tw>();
const squash = (c: string): string => (/\s\s|^\s|\s$|[\n\t]/.test(c) ? c.replace(/\s+/g, " ").trim() : c);

function twText(strings: TemplateStringsArray, holes: any[]): string {
  let c = strings[0];
  for (let i = 1; i < strings.length; i++) {
    if (strings[i - 1].endsWith(":")) throw new TypeError(`lt: a variant prefix applies to one class, not to a hole: write the prefix on each class inside the preset (…${strings[i - 1].slice(-16)}\${…})`);
    const h = holes[i - 1];
    if (h) {
      if (!(h instanceof Tw)) throw new TypeError("lt: a tw hole takes another tw`…` value (or false/null); a raw string is unchecked. Use tw.token(value) for one class from data");
      c += h.c;
    }
    c += strings[i];
  }
  return c;
}

/**
 * The class list of an element: tag(tw`flex gap-4`, …). Also a preset: const card = tw`p-6 bg-surface`.
 * Holes take other tw values or false/null. Several tw arguments on one tag are joined in order; nothing is merged or dropped.
 */
export const tw: {
  (strings: TemplateStringsArray, ...holes: (Tw | Falsy)[]): Tw;
  /** One class from data (a state name, a slug). Refuses anything that is not a single token. */
  token(value: string): Tw;
} = Object.assign(
  (strings: TemplateStringsArray, ...holes: (Tw | Falsy)[]): Tw => {
    if (strings.length === 1) {
      let t = SITE.get(strings);
      if (t === undefined) {
        t = new Tw(esc(squash(strings[0])));
        SITE.set(strings, t);
      }
      return t;
    }
    return new Tw(squash(twText(strings, holes)));
  },
  {
    token(value: string): Tw {
      if (!/^[A-Za-z0-9_:\-./[\]%#]+$/.test(value)) throw new TypeError(`lt: refused class token ${JSON.stringify(value.slice(0, 40))}`);
      return new Tw(value);
    },
  },
);

