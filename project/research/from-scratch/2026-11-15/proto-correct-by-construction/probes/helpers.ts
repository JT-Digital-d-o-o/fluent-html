// Component patterns a session writes unprompted, from the strict-tags review's likely.ts / likely2.ts.
// `ok` lines must compile; `bad` lines must fail with a ✗ message on the first line.
import { a, button, cls, div, form, input, label, li, option, p, select, ul, type ControlKid, type El, type FlowKid, type Content } from "#st";
import { projects } from "../screens/projects.routes.ts";

const Field = (name: string, control: ControlKid) => label(cls("grid gap-1"), name, control);
export const ok1 = form(projects.list(), Field("Query", input({ type: "search", name: "q" })), button({ type: "submit" }, "Apply"));
export const ok2 = form(projects.list(), Field("Status", select({ name: "s" }, option("Active"))));
const Card = (...children: FlowKid<Content>[]) => div(cls("rounded-card bg-surface p-6"), children);
export const ok3 = form(projects.list(), Card(Field("Q", input({ name: "q" }))), button({ type: "submit" }, "Apply"));
const Row = (name: string) => li(name);
export const ok4 = ul(Row("x"));
const WideRow = (name: string): El => li(name);
export const bad1 = ul(WideRow("x"));
const Notice = (msg: string): El => div(cls("p-4"), p(msg));
export const bad2 = div(Notice("Saved"));
export const bad3 = div(Field("Q", p("x")));
