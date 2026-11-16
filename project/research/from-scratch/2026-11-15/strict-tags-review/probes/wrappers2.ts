import { a, button, cls, div, h2, label, li, span, th, page, part, routes, input, select, option, type Cls, type Content, type FlowKid, type PhrasingKid, type Kid } from "strict-tags";
const r = routes("/x", { list: page("/", { q: "string?" }), rows: part("rows", "/rows", { q: "string?" }) });
// L1: kids as one array argument
export const L1 = (look: Cls, ...kids: PhrasingKid<"text">[]) => a(r.list(), look, kids);
// L2: one kid param
export const L2 = (look: Cls, kid: PhrasingKid<"text">) => a(r.list(), look, kid);
// L3: Kid<"a">
export const L3 = (look: Cls, ...kids: Kid<"a">[]) => a(r.list(), look, ...kids);
export const L3b = (look: Cls, kids: Kid<"a">) => a(r.list(), look, kids);
// L4: string label plus optional extra
export const L4 = (look: Cls, text: string, extra?: PhrasingKid<"text">) => a(r.list(), look, text, extra);
// L5: href hatch
// usage
export const u1 = th(L1(cls("px-2"), "Order", span(cls("sr-only"), "sort")));
export const u2 = th(L2(cls("px-2"), "Order"));
export const u4 = li(L4(cls("px-2"), "Order", span("x")));
// B1: button with spread
export const B1 = (look: Cls, ...kids: PhrasingKid<"text">[]) => button(look, ...kids);
export const u5 = div(B1(cls("px-2"), "Save"));
// H1: heading with spread
export const H1 = (...kids: PhrasingKid<"text">[]) => h2(cls("text-lg"), ...kids);
// F1: field helper, control typed as the widest phrasing kid with content marks
export const F1 = (text: string, control: PhrasingKid<Content>) => label(cls("grid gap-1"), text, control);
export const u6 = F1("Name", input({ type: "text", name: "n" }));
// F2: field helper as a callback
export const F3 = (text: string, name: string) => label(cls("grid gap-1"), text, input({ type: "text", name }));
export const F4 = (text: string, name: string, opts: Record<string, string>) => label(text, select({ name }, Object.entries(opts).map(([v, l]) => option({ value: v }, l))));
// D1: div(label({for}), input({id})) — the other common labelling pattern
export const D1 = div(label({ for: "n" }, "Name"), input({ id: "n", type: "text", name: "n" }));
