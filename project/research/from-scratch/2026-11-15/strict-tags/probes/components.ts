// Components that take children: the child type says what they may hold, and that decides where the component may go.
import { a, button, cls, div, form, header, input, label, p, span, type Content, type FlowKid, type PhrasingKid } from "#st";
import { projects } from "../screens/projects.routes.ts";

const Card = (...children: FlowKid[]) => div(cls("p-6 bg-surface"), children); // anything
const Group = (...children: FlowKid<Content>[]) => div(cls("grid gap-4"), children); // ordinary content
const Chip = (...children: PhrasingKid<"text">[]) => span(cls("rounded-full px-2"), children); // text only

export const ok1 = div(Card(form(Group(label("Name", input({}))))), Card([p("a"), p("b")]), Card(cond() && p("x")));
export const ok2 = form(Group(label("Name", input({})), button("Save")));
export const ok3 = header(Group(p("x")));
export const ok4 = button(Chip("x")), ok5 = a(projects.list(), Chip("x"));
export const bad1 = form(Card(p("x"))); // Card may hold a form
export const bad2 = a(projects.list(), Group("x")); // Group may hold a button
export const bad3 = Group(form(p("x"))); // Group's children exclude a form
export const bad4 = Chip(a(projects.list(), "x")); // Chip's children are text only
function cond(): boolean { return true; }
