import { a, div, p, span, tw } from "lean-tags";
export const x = div("flex gap-4", p("hello"));
export const y = a("text-sm underline", "Open");
export const z = span('rounded-full px-2 hover:bg-surface-2', "x");
export const fine1 = p("Projects");
export const fine2 = p("No projects yet");
export const fine3 = div(tw`flex gap-4`, p("hello world"));
export const fine4 = span("Export ready");
