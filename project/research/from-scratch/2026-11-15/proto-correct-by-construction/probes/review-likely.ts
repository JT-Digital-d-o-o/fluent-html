// Patterns a Claude Code session is likely to write unprompted. Each `fp` line is valid HTML that a
// session could reasonably write; each `ok` line should compile. Measures false positives and wording.
import { a, button, cls, div, form, h2, hover, input, label, li, p, section, span, ul, type El, type FlowKid, type PhrasingKid, type Cls } from "../lib/index.ts";
import { projects } from "../screens/projects.routes.ts";

// 1. A Card wrapper typed as the reference says (FlowKid[]), holding a plain paragraph, inside a form
const Card = (...children: FlowKid[]) => div(cls("rounded-card bg-surface p-6"), children);
export const fp1 = form(projects.list(), Card(p("Filters")), button({ type: "submit" }, "Apply"));
// 2. Same wrapper inside a link (a card that is a link)
export const fp2 = a(projects.list(), Card(p("All projects")));
// 3. Sibling label with for/id (valid, accessible HTML)
export const fp3 = div(label({ for: "q" }, "Search"), input({ id: "q", type: "search" }));
// 4. A Field helper wrapping label, used inside a form
const Field = (name: string, ...control: PhrasingKid[]) => label(cls("grid gap-1"), name, control);
export const fp4 = form(projects.list(), Field("Query", input({ type: "search", name: "q" })));
// 5. Component annotated with a bare El return type, used in ul
const Row = (name: string): El => li(name);
export const fp5 = ul(Row("x"));
// 6. Class lookup table as plain strings
const tone = { active: "text-success", paused: "text-warning" };
export const fp6 = span(cls(tone.active), "x");
// 7. Class lookup table as const
const tone2 = { active: "text-success", paused: "text-warning" } as const;
declare const st: "active" | "paused";
export const ok7 = span(cls(tone2[st]), "x");
// 8. Conditional class string
declare const on: boolean;
export const ok8 = span(cls(on ? "bg-primary" : "bg-surface"), "x");
export const ok9 = span(cls("px-2", on && "ring-2"), "x");
// 10. Section with a heading component returning El
const Title = (t: string) => h2(cls("text-lg font-semibold"), t);
export const ok10 = section(Title("Hi"), p("x"));
// 11. Button holding an icon-ish span and text
export const ok11 = button(span(cls("sr-only"), "Close"), "×");
// 12. generic children prop object
const Panel = ({ children }: { children: FlowKid }) => div(cls("p-4"), children);
export const fp12 = form(projects.list(), Panel({ children: p("x") }));
