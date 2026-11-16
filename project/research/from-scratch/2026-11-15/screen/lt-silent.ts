import { div, p, a } from "../token-economy/lt.ts";
export const x = div("flex gap-4", p("hello"));
export const y = a("text-sm underline", "Open");
console.log(x.h);
console.log(y.h);
