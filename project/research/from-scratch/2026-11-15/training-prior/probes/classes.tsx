import { projects } from "../screens/projects.routes.js";
declare const tone: "success" | "danger";
const card = "rounded-card bg-surface p-6 shadow-md p-4";

export const c1 = <div class="bg-gray-100 text-text">palette is closed</div>;
export const c2 = <div class="flex flex-wrapp gap-4">typo</div>;
export const c3 = <div class="px-4 py-2 px-6">dead pair</div>;
export const c4 = <div class="hover:bg-surfce md:text-text-faint">variants</div>;
export const c5 = <div class={`bg-${tone}/10`}>built class</div>;
export const c6 = <div class={[card, tone === "danger" && "text-dangr"]}>through a const</div>;
export const c7 = <div hx-gte={projects.results()}>attribute typo</div>;
export const c8 = <div class="rounded-control aria-invalid:border-danger backdrop:bg-black/40 bg-primary/10">all valid</div>;
