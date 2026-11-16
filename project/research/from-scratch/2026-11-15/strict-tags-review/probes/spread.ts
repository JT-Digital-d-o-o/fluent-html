import { a, button, cls, div, section, h2, li, ul, img, asset, dialog, modal, page, part, action, routes, handlers, type Content, type FlowKid, type PhrasingKid } from "strict-tags";
const r = routes("/x", { list: page("/"), rows: part("rows", "/rows"), del: action("/del") });
declare const on: boolean;
// P1: a part root with spread children, answered from its handler
const Region = (...kids: FlowKid<Content>[]) => section(r.rows().root, cls("grid"), ...kids);
export const p1 = handlers(r, { list: () => null as never, rows: () => Region("x"), del: ({ redirect }) => redirect(r.list()) });
// P2: a conditional root passes the handler type though no id is rendered
const Maybe = (specimen: boolean) => section(!specimen && r.rows().root, "x");
export const p2 = handlers(r, { list: () => null as never, rows: () => Maybe(true), del: ({ redirect }) => redirect(r.list()) });
// P3: an action button with spread text
export const P3 = (...text: string[]) => button(r.del(), ...text);
// P4: an image with spread attrs object
export const P4 = (o: { src: string; alt: string }) => img({ src: asset("/a.png"), alt: o.alt });
// P5: dialog with spread children
const m = modal("d");
export const P5 = (...kids: FlowKid<Content>[]) => dialog(m.root, h2(m.title, "T"), ...kids);
// P6: list of items spread
export const P6 = (items: string[]) => ul(...items.map((i) => li(i)));
// P7: heading whose text is a spread
export const P7 = (...kids: PhrasingKid<"text">[]) => h2(...kids);
// P8: link, children spread from a mapped array
export const P8 = (words: string[]) => a(r.list(), ...words.map((w) => w.toUpperCase()));
