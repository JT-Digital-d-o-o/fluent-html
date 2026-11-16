/**
 * fluent-html 9 styling: Tailwind class text, checked by the type system.
 *
 * `.tw("…")` is the only styling method. Every token is checked against Tailwind's class list
 * and the theme (`defineTheme` + the FluentCustom* seams); variants stay in the string as
 * Tailwind spells them. Tailwind scans the source itself: no extractor, no safelist.
 *
 * @module
 */
import { Tag } from "./tag.js";
import type { Tw, TwCheck, RawClassCheck } from "./tw-types.js";
import "./tw-tombstones.gen.js";

export type { Tw, TwCheck, UseInstead } from "./tw-types.js";

declare module "./tag.js" {
  interface Tag {
    /**
     * Tailwind class text, checked token by token. Falsy parts are skipped, so a condition goes
     * in its own argument. A token the element already has is not written twice.
     * @example
     * Div().tw("flex items-center gap-2 px-4 hover:bg-surface-2 md:px-8")
     * Input().tw(field, "mb-4")                          // a tw() constant plus more text
     * Div().tw("border", invalid && "border-danger")     // a condition
     */
    tw<const A extends string, const B extends string = never, const C extends string = never, const D extends string = never>(
      a: (A & TwCheck<A>) | false | null | undefined,
      b?: (B & TwCheck<B>) | false | null | undefined,
      c?: (C & TwCheck<C>) | false | null | undefined,
      d?: (D & TwCheck<D>) | false | null | undefined,
    ): this;
    /**
     * A class that is not Tailwind's: a JS hook or a third-party widget's class. Appended verbatim.
     * @example Div().cssClass("js-map")
     */
    cssClass<const S extends string>(name: S & RawClassCheck<S>): this;
  }
}

const proto = Tag.prototype as unknown as Record<string, unknown>;
proto.tw = function (this: Tag, a?: unknown, b?: unknown, c?: unknown, d?: unknown) {
  if (typeof a === "string" && a !== "") this._cls(a);
  if (typeof b === "string" && b !== "") this._cls(b);
  if (typeof c === "string" && c !== "") this._cls(c);
  if (typeof d === "string" && d !== "") this._cls(d);
  return this;
};
proto.cssClass = function (this: Tag, name: string) {
  return this._cls(name);
};

/**
 * A checked class constant. Constants compose by argument, never inside a template string.
 * @example
 * const card = tw("p-6 bg-surface border border-line rounded-card");
 * const primary = tw(button, "bg-primary text-on-accent hover:bg-primary-700");
 * const TONE = { ok: tw("bg-success/10 text-success"), bad: tw("bg-danger/10 text-danger") } satisfies Record<Status, Tw>;
 */
export function tw<const A extends string, const B extends string = never, const C extends string = never, const D extends string = never>(
  a: (A & TwCheck<A>) | false | null | undefined,
  b?: (B & TwCheck<B>) | false | null | undefined,
  c?: (C & TwCheck<C>) | false | null | undefined,
  d?: (D & TwCheck<D>) | false | null | undefined,
): Tw {
  let out = "";
  for (const p of [a, b, c, d]) if (typeof p === "string" && p !== "") out = out ? out + " " + p : p;
  return out as Tw;
}
