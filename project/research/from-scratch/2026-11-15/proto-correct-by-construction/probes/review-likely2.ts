// Second batch: return-type annotations, and whether a Field helper can be typed at all.
import { a, button, cls, div, form, label, input, li, p, ul, type El, type Mark, type FlowKid, type PhrasingKid, type Content } from "../lib/index.ts";
import { projects } from "../screens/projects.routes.ts";
import { Layout } from "../support/layout.ts";

// 13. A view annotated `: El` used as a block child and as a page child
const Notice = (msg: string): El => div(cls("p-4"), p(msg));
export const fp13a = div(Notice("Saved"));
export const fp13b = Layout({ title: "x" }, Notice("Saved"));
// 14. Field helper, fix attempts
const FieldA = (name: string, control: El<"phrasing", Mark, any>) => label(cls("grid gap-1"), name, control);
export const tryA = form(projects.list(), FieldA("Query", input({ type: "search", name: "q" })));
const FieldB = <M extends Mark>(name: string, control: El<"phrasing", M, any>) => label(cls("grid gap-1"), name, control);
export const tryB = form(projects.list(), FieldB("Query", input({ type: "search", name: "q" })));
// 15. Card typed per the diagnostic's suggestion
const Card = (...children: FlowKid<Content>[]) => div(cls("rounded-card bg-surface p-6"), children);
export const tryC = form(projects.list(), Card(p("Filters")), button({ type: "submit" }, "Apply"));
export const tryC2 = Card(label("Q", input({ type: "search", name: "q" })));
