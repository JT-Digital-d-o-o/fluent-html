// fluent-html 9 prototype: fluent-html 8.1.0 plus the smallest set of changes this design proposes.
// Everything here is additive over the tracked dist; nothing in src/ is touched.
import { Tag, Button as Button8, Script } from "fluent-html";
import type { ButtonTag, ScriptTag, View } from "fluent-html";
import type { Tw, TwCheck } from "./tw-types.js";

export * from "fluent-html";
export type { Tw } from "./tw-types.js";

declare module "fluent-html" {
  interface FluentCustomMethods {
    /** Tailwind class text, checked token by token against the theme. Falsy parts are skipped. */
    tw<const A extends string, const B extends string = never, const C extends string = never>(
      a: (A & TwCheck<A>) | false | null | undefined,
      b?: (B & TwCheck<B>) | false | null,
      c?: (C & TwCheck<C>) | false | null,
    ): this;
  }
}

// Stand-in for 8.2's serialize-time class merge (on by default in this design): a token the element
// already carries is not written twice. Found by html-validate's no-dup-class on the first render.
(Tag.prototype as unknown as { tw(...p: unknown[]): unknown }).tw = function (this: Tag, ...parts: unknown[]) {
  for (const p of parts) {
    if (typeof p !== "string" || p === "") continue;
    const cur = this.getClass();
    if (!cur) { this.addClass(p); continue; }
    const have = ` ${cur} `;
    if (!p.includes(" ")) { if (!have.includes(` ${p} `)) this.addClass(p); continue; }
    let fresh = "";
    for (const tok of p.split(" ")) if (tok && !have.includes(` ${tok} `)) fresh += fresh ? ` ${tok}` : tok;
    if (fresh) this.addClass(fresh);
  }
  return this;
};

/**
 * A checked class constant: `const card = tw("p-6 bg-surface rounded-card")`. Parts compose by argument.
 * The parameter types are written inline, never through an alias: tsc prints an alias by name and
 * the error text would be lost.
 */
export function tw<const A extends string, const B extends string = never, const C extends string = never>(
  a: (A & TwCheck<A>) | false | null | undefined,
  b?: (B & TwCheck<B>) | false | null,
  c?: (C & TwCheck<C>) | false | null,
): Tw {
  return [a, b, c].filter((p) => typeof p === "string" && p !== "").join(" ") as Tw;
}

/** `Button()` is `type="button"`; a submit button says so. */
export function Button(...children: View[]): ButtonTag {
  return Button8(...children).setType("button");
}
export function SubmitButton(...children: View[]): ButtonTag {
  return Button8(...children).setType("submit");
}

const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);
const JSON_ESC: Record<string, string> = { "<": "\\u003c", ">": "\\u003e", "&": "\\u0026", [LS]: "\\u2028", [PS]: "\\u2029" };
const JSON_UNSAFE = new RegExp("[<>&" + LS + PS + "]", "g");
/** Data for the client: `<script type="application/json">` with `<`, `>`, `&` and the line separators escaped. */
export function JsonScript(data: unknown): ScriptTag {
  const json = JSON.stringify(data).replace(JSON_UNSAFE, (c) => JSON_ESC[c]!);
  return Script(json).setType("application/json");
}
