import { a, button, cls, div, h1, hover, img, input, label, li, p, span, ul, asset, md, focusVisible } from "#st";

const card = cls("p-6 bg-surface rounded-card", hover("bg-surface-2 underline"), md(hover("px-8")));
export const t0: "p-6 bg-surface rounded-card hover:bg-surface-2 hover:underline md:hover:px-8" = card.$c;
export const ok1 = div(card, { id: "x" }, h1("Title"), p("Body ", span("inline text")), ul(li("one"), li("two")));
export const ok2 = ul([1, 2].map((n) => li(String(n))));
export const ok3 = label(cls("grid gap-1"), "Name", input({ type: "text" }));
export const ok4 = div(input({ type: "search", "aria-label": "Search" }), img({ src: asset("/a.png"), alt: "A" }), button(cls("px-4", focusVisible("ring-2")), "Go"));
const cond = Math.random() > 0.5;
export const ok5 = div(cond && p("x"), cond ? ul(li("a")) : p("none"), null);
export const s1: "flow" = ok1.$s;
