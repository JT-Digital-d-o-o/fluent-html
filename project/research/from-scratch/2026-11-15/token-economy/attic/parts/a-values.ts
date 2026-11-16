// Lean Tags: research prototype for the from-scratch round (token-economy lens).
// One file, types and runtime together, erasable TypeScript only (runs under Node's type stripping).
// Not a product: it renders the bench page and the three reference screens, nothing more.

// ───────────────────────── values ─────────────────────────

/** Finished, already-escaped markup. `I` is the id its root carries when it was built with a part's root wire. */
export class Html<I extends string | undefined = string | undefined> {
  declare readonly $id: I;
  h: string;
  id: string | undefined;
  constructor(h: string, id?: string) {
    this.h = h;
    this.id = id;
  }
  toString(): string {
    return this.h;
  }
}

/** A full document: what a page route answers. */
export class Page {
  declare readonly $page: true;
  h: string;
  constructor(h: string) {
    this.h = h;
  }
}

/** A class list. Only tw`…` and tw.token() make one, so a class attribute never holds an unchecked string. */
export class Tw {
  declare readonly $tw: true;
  /** Attribute-escaped class text. */
  c: string;
  constructor(c: string) {
    this.c = c;
  }
}

/** Attribute text produced by the framework. `I` is set when the wire makes its element a part's root. */
export class Wire<I extends string = never> {
  declare readonly $root: I;
  s: string;
  id: string | undefined;
  constructor(s: string, id?: string) {
    this.s = s;
    this.id = id;
  }
}

export type Falsy = false | null | undefined;
export type Child = string | number | boolean | null | undefined | Html | readonly Child[];
type V = string | number | false | null | undefined;
type B = boolean | null | undefined;
