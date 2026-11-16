// What three forged brands render: the escape and the URL policy are skipped.   node render.ts
import { a, Cls, div, El, render, Url } from "../../strict-tags/lib/index.ts";
const X = "<img src=x onerror=alert(1)>";
console.log(render(div(new El<"phrasing", "text", undefined>(X))));
console.log(render(div(new Cls("x\" onmouseover=\"alert(1)"), "x")));
console.log(render(a({ href: new Url("javascript:alert(1)") }, "x")));
