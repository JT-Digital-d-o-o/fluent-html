// Brand forging on the prototype as built: each line makes a brand without the function that owns it.
// A line that compiles is a hole in "what compiles is correct" that only lint or the package's exports can close.
// sh run.sh
import { a, Cls, div, El, raw, render, Trusted, Url } from "../../strict-tags/lib/index.ts";
declare const stored: string;
const X = "<img src=x onerror=alert(1)>";
export const forged = [
  div(new El<"phrasing", "text", undefined>(X)),                                             // 1 the brand's constructor is exported
  div(X as unknown as El<"phrasing", "text", undefined>),     // 2 a double cast
  div(JSON.parse(stored)),                                    // 3 an inferred any, no cast and no annotation
  div(stored as any),                                         // 4 an explicit any
  div(new Cls("not a class\" onmouseover=\"alert(1)"), "x"),  // 5 a forged class list
  a({ href: new Url("javascript:alert(1)") }, "x"),           // 6 a forged URL
  raw(new Trusted(X)),                                        // 7 forged trusted markup
  // @ts-expect-error                                         // 8 a silenced diagnostic
  div({ onclick: "alert(1)" }, "x"),
];
