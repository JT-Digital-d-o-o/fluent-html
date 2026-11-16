// Each line below must be a compile error: tsc passing proves the checks are real.
import { at, html } from "../src/hh.ts";
import { controller, form, hx, page, redirect } from "../src/hx.ts";
import { ids, projects } from "./projects.routes.ts";
import { JobStatus, ProjectForm, ProjectList } from "./projects.views.ts";

const f = form(projects.create, {});
// @ts-expect-error field typo
f.field("nmae");
// @ts-expect-error a label is missing for an enum value
f.options("status", { active: "Active" });
// @ts-expect-error param type
projects.detail({ id: "7" });
// @ts-expect-error params are required
projects.detail();
// @ts-expect-error unknown query key
projects.rows({ query: "x" });
// @ts-expect-error a page route cannot be polled
hx.poll(projects.list());
// @ts-expect-error a route without a body schema has no form
form(projects.list, {});

const handlers = {
  list: () => page("x", html`<p>x</p>`),
  rows: () => ProjectList({ projects: [] }),
  new: () => page("x", html`<p>x</p>`),
  create: { form: ProjectForm, valid: () => redirect(projects.list()) },
  detail: () => page("x", html`<p>x</p>`),
  status: () => JobStatus({ projectId: 1, job: { state: "done", progress: 100 } }),
  remove: () => redirect(projects.list()),
} as const;
controller(projects, handlers);
// @ts-expect-error a fragment route answered with another fragment
controller(projects, { ...handlers, rows: () => JobStatus({ projectId: 1, job: { state: "done", progress: 100 } }) });
// @ts-expect-error a fragment route answered with unrooted html
controller(projects, { ...handlers, status: () => html`<span>x</span>` });
// @ts-expect-error a page route answered with a bare fragment
controller(projects, { ...handlers, list: () => html`<p>x</p>` });
// @ts-expect-error the 422 form region carries the wrong id
controller(projects, { ...handlers, create: { form: () => at(ids.jobStatus)`<form></form>`, valid: () => redirect(projects.list()) } });
const { remove: _omitted, ...missing } = handlers;
// @ts-expect-error a route without a handler
controller(projects, missing);
