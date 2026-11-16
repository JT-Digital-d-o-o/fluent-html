// Safety parity and holes. Lines named x… SHOULD be compile errors (a mistake); lines named v… SHOULD compile (valid Tailwind v4 / valid HTML).
import { a, button, cls, div, hover, variant, input, label, li, p, span, ul, section, form, page, part, action, routes, handlers, select, option, table, tbody, tr, td, h1, img, asset, type FlowKid, type Content } from "strict-tags";
const r = routes("/x", { list: page("/"), rows: part("rows", "/rows"), other: part("other", "/other"), del: action("/del") });
declare const on: boolean; declare const n: number; declare const s: string;

// ── palette closure through bracket values ──
export const x01 = cls("text-[#ff0000]");
export const x02 = cls("border-[#ff0000]");
export const x03 = cls("ring-[#ff0000]");
export const x04 = cls("outline-[#ff0000]");
export const x05 = cls("shadow-[0_0_0_2px_#ff0000]");
export const x06 = cls("decoration-[#ff0000]");
export const x07 = cls("fill-[#ff0000]");
export const x08 = cls("stroke-[#ff0000]");
export const x09 = cls("divide-[#ff0000]");
export const x10 = cls("from-[#ff0000]");
export const x11 = cls("accent-[#ff0000]");
export const x12 = cls("bg-[#ff0000]");
export const x13 = cls("bg-[url(/x.png)]");
export const x14 = cls("[color:red]");
export const x15 = cls("bg-(--brand)");
export const x16 = cls("text-(--brand)");
export const x17 = hover("bg-gray-100");
export const x18 = cls(on ? "bg-primary" : "bg-gray-100");
export const x19 = cls(`p-${n}`);
export const x20 = cls("p-" + s);
export const x21 = variant("hovr", "underline");
export const x22 = cls("bg-primary/[#fff]");
export const x23 = cls("bg-red-500/50");
export const x24 = cls("text-gray-500!");
export const x25 = variant("[&_p]", "text-[#f00]");
// ── content-model holes ──
export const x30 = a(r.list(), "t", div([[[button("x")]]]));                 // a button three arrays deep
export const x31 = ul(...[div("x")]);
export const x32 = p(on ? div("x") : "y");
export const x33 = div({ "data-hx-get": "/x" } as const, "x");
export const x34 = div({ id: "a" }, div({ id: "a" }));                       // duplicate id (fh8 does not catch either)
export const x35 = handlers(r, { list: () => null as never, rows: () => div(r.other().root), other: () => div(r.other().root), del: ({ redirect }) => redirect(r.list()) });
export const x36 = label("Name", input({ type: "text" }), input({ type: "text" }));   // two controls, one label
export const x37 = button(span(cls("sr-only")));                              // a button with no name: an empty span
export const x38 = a(r.list(), span());                                       // a link with no name
export const x39 = h1(" ");
export const x40 = img({ src: asset("/a.png"), alt: s });
export const x41 = table(tbody(tr(td(form(r.list(), "x")))));                 // fine in HTML
export const x42 = div({ role: "button" } as any);
// ── valid things that must compile ──
export const v01 = cls("p-13");
export const v02 = cls("w-100");
export const v03 = cls("max-w-200");
export const v04 = cls("gap-18");
export const v05 = cls("z-15");
export const v06 = cls("grid-cols-14");
export const v07 = cls("min-w-9");
export const v08 = cls("size-4.5");
export const v09 = cls("opacity-35");
export const v10 = cls("text-sm/6");
export const v11 = cls("leading-5.5");
export const v12 = cls("mt-px");
export const v13 = cls("tabular-nums sr-only accent-primary");
export const v14 = cls("w-[180px] min-h-[12rem] grid-cols-[8rem_1fr]");
export const v15 = cls("text-[13px]");
export const v16 = cls("-mt-13");
export const v17 = cls("duration-250");
export const v18 = cls("basis-1/7");
export const v19 = cls("aspect-4/3");
export const v20 = cls("rounded-control rounded-full rounded-card rounded-t-card");
export const v21 = cls("border-b-2 border-primary/40 ring-primary ring-offset-2 outline-primary");
export const v22 = cls("translate-x-1/2 -translate-y-1/2 rotate-45 scale-105");
export const v23 = cls("line-clamp-2 truncate whitespace-nowrap break-words");
export const v24 = cls("space-y-4 divide-y divide-line");
export const v25 = cls("h-dvh min-h-screen max-w-screen-md max-w-prose");
export const v26 = cls("text-balance scheme-light field-sizing-content");
export const v27 = cls("shadow-xs inset-ring-1 inset-ring-line");
export const v28 = cls("bg-white text-black bg-transparent text-current");
export const v29 = cls("font-[550]");
export const v30 = cls("content-['']");
export const v31 = cls("grid-cols-subgrid col-span-full");
export const v32 = cls("@container");
export const v33 = variant("@md", "flex");
export const v34 = variant("group-hover", "underline");
export const v35 = variant("aria-[current=page]", "font-semibold");
export const v36 = variant("not-first", "border-t");
export const v37 = variant("nth-3", "underline");
export const v38 = variant("has-checked", "ring-2");
export const v39 = variant("*", "p-2");
export const v40 = variant("supports-[display:grid]", "grid");
// valid HTML that must compile
export const v50 = div(label({ for: "n" }, "Name"), input({ id: "n", type: "text", name: "n" }));
export const v51 = div(input({ id: "c", type: "checkbox", name: "c" }), label({ for: "c" }, "Agree"));
export const v52 = label("Search", div(cls("flex"), input({ type: "search", name: "q" })));   // a wrapper between label and control
export const v53 = (...kids: FlowKid[]) => section(...kids);
export const v54 = li(a(r.list(), div("Title"), p("Sub")));
export const v55 = button({ type: "submit", name: "op", value: "x" }, span("Go"));
export const v56 = select({ name: "s", "aria-label": "S" }, [option({ value: "" }, "All"), ["a", "b"].map((x) => option({ value: x }, x))]);
export const v57 = div({ role: "tabpanel", "aria-labelledby": "t1" }, "x");
export const v58 = div({ role: "dialog" });
export const v59 = input({ type: "month", name: "m", "aria-label": "Month" });
export const v60 = a({ href: `#${s}` } as never, "skip");
export const v61 = td({ colspan: 5 }, cls("text-center"), "No orders");
export const v62 = form(r.list(), { role: "search" }, label("Q", input({ type: "search", name: "q" })), button({ type: "submit" }, "Go"));
