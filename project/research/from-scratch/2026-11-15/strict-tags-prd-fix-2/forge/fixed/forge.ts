// The 16 forging spellings against the brand shape of lib.ts. Each must fail tsc or the strict lint config, or be named as open.
// "✗ tsc" lines must be tsc errors, "✗ lint" lines must be eslint errors, "open" lines pass both.   sh run.sh
import { button, cls, div, render, text } from "./lib.ts";
import type { Cls, El } from "./lib.ts";
import * as lib from "./lib.ts";
type Plain = El<"phrasing", "text">;
const stored: string = process.argv[9] ?? "{}";
const X = "<img src=x onerror=alert(1)>";
const inner = button("New");
export const s1 = () => div(new lib.El(X)); // ✗ tsc 1 the constructor does not leave the module
export const s2 = () => div(X as unknown as Plain); // ✗ lint 2 a double cast
export const s3 = () => div(JSON.parse(stored)); // ✗ lint 3 an inferred any
export const s4 = () => div(stored as any); // ✗ lint 4 an explicit any
export const s5 = () => div(new lib.Cls("x\" onmouseover=\"alert(1)"), "x"); // ✗ tsc 5 a forged class list
// @ts-expect-error // ✗ lint 8 a silenced diagnostic
export const s8 = () => button(inner);
function isPlain(e: El): e is Plain { return true } // ✗ lint 9 a type predicate
export const s9 = () => (isPlain(inner) ? button("Projects ", inner) : null);
function asPlain(e: El): Plain; // ✗ lint 10 an overload signature
function asPlain(e: El) { return e }
export const s10 = () => button("Projects ", asPlain(inner));
const lit: Plain = { $s: "phrasing", $m: "text", h: X }; // ✗ tsc 11 an object literal has no private member
export const s11 = () => div(lit);
declare const ambient: Plain; // ✗ lint 12 an ambient declaration
export const s12 = () => div(ambient);
declare module "./lib.ts" { interface Global { onclick?: string } } // ✗ tsc 16 module augmentation: the attribute table is a type alias, which nothing merges into
const texts: Plain[] = []; const wide: El[] = texts; wide.push(inner); // open 13 a mutable array under a wider alias
export const s13 = () => texts.map((t) => button("Projects ", t));
const box = { e: text("x") }; const loose: { e: El } = box; loose.e = inner; // open 14 a mutable property under a wider alias
export const s14 = () => button("Projects ", box.e);
class Cell<T> { v: T; constructor(v: T) { this.v = v } set(v: T) { this.v = v } } // open 15 a method parameter, compared bivariantly
const cell = new Cell(text("x")); const anyCell: Cell<El> = cell; anyCell.set(inner);
export const s15 = () => button("Projects ", cell.v);
// The same aliasing aimed at a security brand: it compiles, and the sink escapes or drops what has no private member.
const cs: Cls[] = []; const anyCs: (Cls | string)[] = cs; anyCs.push("x\" onmouseover=\"alert(1)"); // open 17 a string under a class-list alias
export const s17 = () => div(...cs, "x");
const els: Plain[] = []; const anyEls: (Plain | string)[] = els; anyEls.push(X); // open 18 a string under an element alias
export const s18 = () => div(els);
if (process.argv[1]?.endsWith("forge.ts")) for (const [k, f] of Object.entries({ s13, s14, s15, s17, s18 })) console.log(k, [f()].flat().map(render).join(""));
