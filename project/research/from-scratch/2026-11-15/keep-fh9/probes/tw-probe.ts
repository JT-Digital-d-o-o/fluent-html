import { Div, Button, tw } from "../proto/fh9.js";

declare const invalid: boolean;
declare const dyn: string;
declare const status: "open" | "done";

// accepted
export const ok1 = Div().tw("flex items-center gap-2 px-4 py-2 rounded-control bg-primary text-on-accent hover:bg-primary-700 md:px-8 md:hover:bg-primary-700");
export const ok2 = Div().tw("w-full border-2 border-line", invalid && "border-danger aria-invalid:border-danger");
export const ok3 = Div().tw("w-[180px] min-h-[12rem] -mt-2 bg-success/10 focus-visible:ring-2 data-[state=open]:bg-surface-2");
const card = tw("p-6 bg-surface rounded-card shadow-md");
export const ok4 = Div().tw(card, "mt-4");
export const ok5 = Button("x").tw(status === "open" ? "bg-warning/10 text-warning" : "bg-success/10 text-success").setType("button");

// rejected: each line below must carry exactly one error
// @ts-expect-error palette literal
export const e1 = Div().tw("flex bg-gray-100 p-4");
// @ts-expect-error typo
export const e2 = Div().tw("flex justify-centre");
// @ts-expect-error unknown variant
export const e3 = Div().tw("hovr:bg-primary");
// @ts-expect-error runtime string
export const e4 = Div().tw(dyn);
// @ts-expect-error interpolation with string
export const e5 = Div().tw(`p-${dyn}`);
// @ts-expect-error arbitrary colour
export const e6 = Div().tw("bg-[#fff]");

const base = tw("inline-flex px-4");
// @ts-expect-error a constant interpolated into a template string
export const e7 = tw(`${base} bg-primary`);
export const ok6 = tw(base, "bg-primary", invalid && "border-danger");
