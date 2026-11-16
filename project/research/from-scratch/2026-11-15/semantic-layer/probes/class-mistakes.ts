// Seeded class mistakes: each must be an error from tools/check-classes.mjs.
import { Div, cx, configure } from "../kit/index.ts";
declare const active: boolean;

Div({ class: "flex itms-center gap-4" });                       // C1 unknown class
Div({ class: "bg-gray-100 text-text" });                         // C2 palette literal, palette closed
Div({ class: "hovr:bg-surface-2 md:p-4" });                      // C3 misspelt variant
Div({ class: cx("p-4", active && "ring-2 ring-primry") });       // C4 unknown theme colour inside cx()
Div({ class: { on: "text-success", off: "text-fant" }[active ? "on" : "off"] + " px-2" });   // C5 inside a lookup
configure({ styles: { error: "text-sm text-red-600" } });        // C6 palette literal in the kit's style slots
