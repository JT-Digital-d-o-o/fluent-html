import { a, cls, th, li, page, part, routes, type Cls } from "strict-tags";
const orders = routes("/orders", { list: page("/", { sort: "string?" }), table: part("orders-table", "/table", { sort: "string?" }) });
// The exact helper shape of Lean Tags r2 (orders.ts:106), tw -> cls
export const regionLink = (q: { sort?: string }, look: Cls, attrs: { "aria-label"?: string; "aria-current"?: "page" }, ...text: string[]) =>
  a(look, attrs, orders.list(q), orders.table(q).load(), ...text);
export const u1 = th(regionLink({}, cls("px-2"), {}, "Order", " ↑"));
// the smallest form of it
export const S1 = (...text: string[]) => a(orders.list(), ...text);
export const S2 = (text: string[]) => a(orders.list(), ...text);
export const S3 = (text: string[]) => a(orders.list(), text);
export const S4 = a(orders.list(), ...["a", "b"]);
