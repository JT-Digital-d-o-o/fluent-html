// Brand forging, second list: spellings with no assertion, no `any` and no comment that silences tsc, so the three lint rules
// of draft 2 (no assertion but `as const`, no any, no ts-comment) report nothing on them. Against the prototype as built.
// Each numbered block makes a brand, or a content-model mark, without the function that owns it.   sh run.sh
import { button, div, El, iframe, text } from "../../strict-tags/lib/index.ts";
type Plain = El<"phrasing", "text", undefined>;
const inner = button("New");
export const control = () => button("Projects ", inner); // ✗ the control: a button in a button is refused

function isPlain(e: El): e is Plain { return true }                                          // 9 a type predicate
export const f9 = () => (isPlain(inner) ? button("Projects ", inner) : null);

function asPlain(e: El): Plain; function asPlain(e: El) { return e }                         // 10 an overload signature
export const f10 = () => button("Projects ", asPlain(inner));

const lit: Plain = { $s: "phrasing", $m: "text", $r: undefined, h: "<img src=x onerror=alert(1)>", id: undefined, toString: () => "" }; // 11 an object literal: the phantom members are public
export const f11 = () => div(lit);

declare const ambient: Plain;                                                                // 12 an ambient declaration
export const f12 = () => div(ambient);

const texts: Plain[] = []; const wide: El[] = texts; wide.push(inner);                       // 13 a mutable array under a wider alias
export const f13 = () => texts.map((t) => button("Projects ", t));

const box = { e: text("x") }; const loose: { e: El } = box; loose.e = inner;                // 14 a mutable property under a wider alias
export const f14 = () => button("Projects ", box.e);

class Cell<T> { v: T; constructor(v: T) { this.v = v } set(v: T) { this.v = v } }            // 15 a method parameter, which TypeScript compares bivariantly
const cell = new Cell(text("x")); const anyCell: Cell<El> = cell; anyCell.set(inner);
export const f15 = () => button("Projects ", cell.v);

declare module "../../strict-tags/lib/core.ts" { interface Global { srcdoc?: string } }      // 16 module augmentation: the attribute tables are interfaces
export const f16 = () => iframe({ title: "x", srcdoc: "<script>alert(1)</script>" });
