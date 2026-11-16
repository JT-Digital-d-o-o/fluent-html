// Valid code the strict lint config must leave alone.
import { button, cls, div, text } from "./lib.ts";
import type { El } from "./lib.ts";
const rows = ["a", "b"] as const;
const present = [text("a"), null].filter((x) => x !== null);
export const List = (p: { items: readonly string[]; empty: El }): El => div(cls("flex"), p.items.length ? p.items.map((i) => div(i)) : p.empty, rows.map((r) => button(r)), present);
