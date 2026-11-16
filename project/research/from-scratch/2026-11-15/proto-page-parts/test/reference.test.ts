// The REFERENCE.md examples, verbatim apart from the stand-in db and the optional props written out:
// they must compile under `npm run check` and answer as the reference says.
import { test } from "node:test";
import { strict as assert } from "node:assert";
import { page, Page, Link, List, redirect, notFound, Type, H1, P, app, type Static } from "../kit/index.ts";

type Project = { id: number; name: string };
const db = {
  search: async (_q: string | undefined): Promise<Project[]> => [{ id: 1, name: "Apollo" }],
  find: async (id: number): Promise<Project | undefined> => (id === 1 ? { id: 1, name: "Apollo" } : undefined),
  create: async (_d: unknown): Promise<Project> => ({ id: 2, name: "x" }),
};
const signedIn = (r: { headers?: Readonly<Record<string, string | undefined>> }) => r.headers?.cookie === "ok";

export const projectList = page("/projects", { query: { q: Type.Optional(Type.String()) } });
export const projectRows = projectList.region("rows", { load: ({ query }) => db.search(query.q) });
export const projectDetail = page("/projects/:id", {
  params: { id: Type.Integer() },
  load: async ({ params }) => (await db.find(params.id)) ?? notFound(),
});
export const signIn = page("/sign-in");
export const projectNew = page("/projects/new", { guard: ({ request }) => (signedIn(request) ? undefined : redirect(signIn)) });
const schema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 80 }),
  bio: Type.Optional(Type.String({ maxLength: 500 })),
  status: Type.Union([Type.Literal("draft"), Type.Literal("active")]),
  notify: Type.Boolean(),
});
export type NewProject = Static<typeof schema>;
export const createProject = projectNew.form("create", {
  schema,
  submit: async ({ data }) => redirect(projectDetail, { id: (await db.create(data)).id }),
});

projectList.view(() => Page({ title: "Projects" }, H1("Projects"), projectRows.show()));
projectRows.view(({ data: projects }) =>
  List({ items: projects, key: (p) => p.id, row: (p) => Link({ to: projectDetail, params: { id: p.id } }, p.name), empty: P("None yet") }));
projectDetail.view(({ data: project }) => Page({ title: project.name }, H1(project.name)));
signIn.view(() => Page({ title: "Sign in" }, H1("Sign in")));
projectNew.view(() => Page({ title: "New" }, H1("New"), createProject.show()));
createProject.view((f) => [
  f.field("name", "Name", { placeholder: "Apollo", hint: "Unique", autocomplete: "off" }),
  f.field("bio", "Bio", { as: "textarea", rows: 4 }),
  f.field("status", "Status", { options: { draft: "Draft", active: "Active" } }),
  f.field("notify", "Email me"),
  f.submit("Save"),
]);

const site = app({ projectList, projectDetail, signIn, projectNew });

test("the reference's examples answer as it says", async () => {
  assert.equal((await site.handle({ method: "GET", url: "/projects" })).status, 200);
  const region = await site.handle({ method: "GET", url: "/projects", headers: { "hx-request": "true", "hx-target": "div#projects-rows" } });
  assert.match(region.body, /^<div id="projects-rows"><ul><li id="projects-rows-1"><a href="\/projects\/1"/);
  assert.equal((await site.handle({ method: "GET", url: "/projects/7" })).status, 404);
  assert.equal((await site.handle({ method: "GET", url: "/projects/new" })).headers.location, "/sign-in");
  const form = await site.handle({ method: "GET", url: "/projects/new", headers: { cookie: "ok" } });
  assert.match(form.body, /<input type="checkbox" value="true" id="projects-new-create-notify" name="notify"/);
  const ok = await site.handle({ method: "POST", url: "/projects/new?/create", headers: { cookie: "ok" }, body: { name: "A", status: "draft" } });
  assert.equal(ok.headers.location, "/projects/2");
});
