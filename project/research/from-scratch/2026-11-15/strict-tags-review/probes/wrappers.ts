// Component shapes a session writes: does forwarding children through a wrapper compile?
import { a, button, cls, div, h2, label, li, nav, p, section, span, td, ul, form, header, page, part, routes, input, type Cls, type Content, type FlowKid, type PhrasingKid, type El } from "strict-tags";
const r = routes("/x", { list: page("/", { q: "string?" }), rows: part("rows", "/rows", { q: "string?" }) });

// W1: the reference's own advice, children as FlowKid[], into a div
export const W1 = (...kids: FlowKid[]) => div(cls("p-4"), ...kids);
// W2: into a section
export const W2 = (...kids: FlowKid[]) => section(cls("p-4"), ...kids);
// W3: card with a title, into section
export const W3 = (title: string, ...kids: FlowKid[]) => section(h2(title), ...kids);
// W4: FlowKid<Content>[] into section
export const W4 = (...kids: FlowKid<Content>[]) => section(cls("p-4"), ...kids);
// W5: link wrapper with PhrasingKid[]
export const W5 = (...kids: PhrasingKid[]) => a(r.list(), ...kids);
// W6: link wrapper with PhrasingKid<"text">[]
export const W6 = (...kids: PhrasingKid<"text">[]) => a(r.list(), ...kids);
// W7: link wrapper with a look and text kids
export const W7 = (look: Cls, ...kids: PhrasingKid<"text">[]) => a(r.list(), r.rows().load(), look, ...kids);
// W8: link wrapper, label as a string
export const W8 = (look: Cls, text: string) => a(r.list(), r.rows().load(), look, text);
// W9: button wrapper
export const W9 = (...kids: PhrasingKid<"text">[]) => button(cls("px-4"), ...kids);
// W10: a single child param
export const W10 = (kid: FlowKid) => div(kid);
export const W11 = (kid: FlowKid) => section(kid);
export const W12 = (kid: FlowKid<Content>) => section(kid);
// W13: a wrapper result inside containers
export const u1 = section(W1("x"));
export const u2 = li(W1("x"));
export const u3 = form(r.list(), W1("x"));
export const u4 = td(W4("x"));
export const u5 = form(r.list(), W4("x"));
export const u6 = nav(ul(li(W7(cls("px-2"), "Next"))));
export const u7 = p(W6("x"));
export const u8 = header(W4("x"));
// W14: a return-type annotation with the only element type the package exports
export const W14 = (): El => div("x");
export const u9 = div(W14());
// W15: a field helper
export const Field = (text: string, control: PhrasingKid) => label(cls("grid gap-1"), text, control);
export const u10 = Field("Name", input({ type: "text", name: "n" }));
// W16: array of rows built with a loop, then pushed
const items: FlowKid[] = [];
items.push(p("x"));
export const u11 = div(items);
export const u12 = section(items);
// W17: aria attrs forwarded
export const W17 = (attrs: { "aria-label"?: string }, ...kids: PhrasingKid<"text">[]) => a(r.list(), attrs, ...kids);
// W18: conditional link or span
export const W18 = (on: boolean) => li(on ? a(r.list(), "Prev") : span({ "aria-disabled": "true" }, "Prev"));
