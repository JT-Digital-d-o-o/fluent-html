// Negative probe: one deliberate mistake per line, to read what tsc says about each.
//   tsc -p probes/tsconfig.json
import { a, button, div, handlers, img, input, type FormState } from "#bt";
import { projects } from "../screens/bt/projects.routes.ts";
import { ProjectForm, NewProjectPage } from "../screens/bt/views/projects.form.view.ts";
import { ProjectListPage } from "../screens/bt/views/projects.list.view.ts";
import { ProjectDetailPage } from "../screens/bt/views/projects.detail.view.ts";
import { getProject } from "../support/projects.service.ts";

const project = (await getProject(1))!;

export const m01 = a({ hreff: "/x" }, "attribute typo");
export const m02 = div({ class: "flex gap-4" }, "class as an attribute");
export const m03 = div`flex ${"p-4"}`("raw string in a class hole");
export const m04 = a(projects.detail({ idd: 1 }), "route input typo");
export const m05 = a(projects.list({ query: "x" }), "unknown query key");
export const m06 = input({ type: "search" }, projects.rows().search("query"));
export const m07 = (s: FormState<typeof projects.create>) => projects.create().form(s, (f) => [f.input("nmae")]);
export const m08 = (s: FormState<typeof projects.create>) => projects.create().form(s, (f) => [f.select("status", { active: "Active" })]);
export const m09 = button(projects.list(), "page route on a button");
export const m10 = a(projects.rows(), "fragment route as a link");
export const m11 = div({ "hx-get": "/x" }, "hand-written htmx");
export const m12 = button({ onclick: "go()" }, "inline handler");
export const m13 = input({ type: "text" }, "child of a void element");
export const m14 = img({ src: "/a.png" });
export const m15 = a({ href: projects.list() }, "ref as an attribute value");
export const m16 = div(project, "object as a child");
export const m17 = handlers(projects, {
  list: async ({ input }) => ProjectListPage({ q: input.q, items: [] }),
  rows: async () => div("not the part's root"),
  new: () => NewProjectPage(),
  create: { form: ProjectForm, ok: async ({ redirect }) => redirect(projects.list()) },
  detail: async () => ProjectDetailPage(project),
  status: async () => ProjectDetailPage(project),
});
