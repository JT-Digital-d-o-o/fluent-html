# Lean Tags

# Lean Tags: the token-economy design

Research only. Nothing in fluent-html's `src/`, releases, `project/pm/`, the template, the guidelines or any `CLAUDE.md` was touched, and nothing was committed. Everything is under `/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15/token-economy/` (called `token-economy/` below).

## 1. What I found

- **Markup syntax alone does not clear K1.** On the detail screen, JSX, an html tagged template, hiccup arrays and a `tag({ class })` builder are each only 7 to 10% shorter than fluent-html 8. The most compact form I found saves 21% across all three screens' views.
- **The plumbing is where the saving is.** Declaring each route, id, schema and form once makes the whole feature 34% shorter: routes and ids 43%, controller 50%, schema and validation 76%.
- **The stateful screen is the best one.** The form screen is 30% shorter. FHX lost 11% on its stateful screen.
- **Measured on a runnable prototype:** K2 3.86x and 4.00x, K3 0 escapes, K4 0 errors against 12.
- **Not measured:** K1 and K5 need headless sessions. My K1 prediction is 24 to 33% on output tokens, so it can fail.

## 2. Thesis

Claude Code's cost is not mainly the characters of markup. It is vocabulary it has to look up, facts it has to write in several places, and diagnostics that take several turns to read. Lean Tags is built from that:

1. **Tags are lowercase functions.** `div(...)`, `a(...)`, `input(...)`. Leading arguments are classes, attributes and wires; the rest are children.
2. **Classes are literal Tailwind text:** `` tw`flex gap-4 hover:bg-surface-2` ``. It is the text Claude Code already writes, and Tailwind v4 scans it directly.
3. **Attributes are a plain object with HTML's own names:** `{ type: "search", placeholder: "…" }`.
4. **Routes own everything that used to be repeated:** the path, its inputs, the fragment id, the body schema, the form region and the 422 path. Views and handlers reference the route.
5. **Plain TypeScript, one call signature per tag.** No new grammar, no compiler, no generated files.

**A design choice the evidence forced.** My first form was `` div`flex gap-4`(child) ``. It is 2% shorter, but it needs overloads, and tsc then answers every mistake with "No overload matches this call" and three blocks. On 17 seeded mistakes it produced 106 lines with 11 overload lists. The final form, `` div(tw`flex gap-4`, child) ``, gave 21 diagnostics for 21 mistakes in 44 lines with none. Without whitespace the two forms are the same length (4,197 against 4,194 characters), so the choice costs nothing.

## 3. The API (enough for the three screens)

```ts
import { div, a, input, button, tw, routes, page, part, post, handlers, modal, match } from "lean-tags";
```

**Tags**

| Form | Meaning |
|---|---|
| `p("text", child)` | Children: string (escaped), number, another tag's result, an array, or `false`/`null`/`undefined` (skipped) |
| `` div(tw`flex gap-4`, …) `` | A `tw` value as a leading argument is the class attribute. Several are joined in order |
| `input({ type: "search", required: true })` | A plain object as a leading argument is attributes, typed per tag |
| `a(projects.detail({ id }), "Open")` | A route reference as a leading argument wires the element |
| `button(…)` | Emits `type="button"` unless a type is given |

**Classes**

| Form | Meaning |
|---|---|
| `` const card = tw`p-6 bg-surface rounded-card` `` | A preset is a value |
| `` tw`${card} mt-4` `` | Holes take other `tw` values or `false`/`null`. A raw string is a compile error |
| `Record<Status, Tw>` | A lookup by domain value, exhaustive by type |
| `tw.token(value)` | One class from data; refuses anything that is not a single token |

Nothing is merged or dropped. A variant prefix on a hole (`` tw`hover:${card}` ``) throws at render and fails the class check.

**Routes**

```ts
export const projects = routes("/projects", {
  list:   page("/", { q: "string?" }),                  // GET, answers a page
  rows:   part("project-list", "/rows", { q: "string?" }), // GET, answers the element with this id
  create: post("/", ProjectInput),                      // POST with a body schema: owns a form
  detail: page("/:id", { id: "number" }),
});
```

Inputs are one flat object. Names that appear in the path are path parameters; the rest are the query. `projects.list({ q })` and `projects.detail({ id })` are typed from the table.

**Wires**

| Call | On | Emits |
|---|---|---|
| `projects.detail({ id })` | `a` | `href` (the layout boosts links into `#main`) |
| `projects.remove({ id })` | `button` | a POST that navigates |
| `projects.rows().root` | any tag | the part's id |
| `projects.rows().search("q")` | `input` | the field name plus a debounced reload of the part |
| `projects.status({ id }).poll(cond && "2s")` | any tag | the part's id, plus a self-refresh while `cond` holds |
| `.change(name)`, `.load()`, `.defer()`, `.fire()` | | reload on change, on click, after page load; post with no swap |
| `wire({ get, target, swap, confirm, vals })` | any tag | the escape hatch, every value checked |
| `modal(id)` | | `{ open, root, close }` attribute sets for a native dialog |

**Forms**

```ts
projects.create().form(state, tw`grid gap-4`, (f) => [
  f.input("name", control, { required: true }),   // name, id, value, aria-invalid, aria-describedby filled in
  f.error("name", error),                          // nothing while valid
  f.select("status", { active: "Active", paused: "Paused" }),  // record must cover the field's values
]);
```

`FormState<typeof projects.create>` is `{ values?, errors? }`, typed from the body schema. The form carries its own region id and the 422 target.

**Handlers**

```ts
export default handlers(projects, {
  list:   async ({ input }) => ProjectListPage({ q: input.q, items: await findProjects(input.q) }),
  create: { form: ProjectForm, ok: async ({ body, redirect }) => redirect(projects.detail({ id: … })) },
});
```

One entry per route; a missing key is a compile error. Every handler gets one context: `{ input, body, redirect, notFound, invalid, request }`. A page route must answer a page, a part route must answer the element built with its own root wire, and an action with a schema is validated before `ok` runs. Schema issues become field errors and a 422 with the form.

## 4. The three screens

Both arms use the same structure, text, classes and components. The fluent-html 8 versions follow the template's `CLAUDE.md` and exemplars.

### Routes and ids

Lean Tags (`screens/lt/projects.routes.ts`):

```ts
import { page, part, post, routes } from "#lt";
import { ProjectInput } from "./projects.schema.ts";

export const projects = routes("/projects", {
  list: page("/", { q: "string?" }),
  rows: part("project-list", "/rows", { q: "string?" }),
  new: page("/new"),
  create: post("/", ProjectInput),
  detail: page("/:id", { id: "number" }),
  status: part("project-status", "/:id/status", { id: "number" }),
  remove: post("/:id/delete", { id: "number" }),
});
```

fluent-html 8 (`screens/fh8/projects.routes.ts`):

```ts
import { defineRoutes, defineIds } from "fluent-html";

export const ids = defineIds(["projectList", "projectForm", "projectStatus", "deleteDialog"] as const);

export const projectRoutes = defineRoutes("/projects", {
  list: { path: "/", query: { q: "string" } as const },
  rows: { path: "/rows", query: { q: "string" } as const, render: ids.projectList },
  new: { path: "/new" },
  create: { method: "post", path: "/" },
  detail: { path: "/:id", params: { id: "number" } as const },
  status: { path: "/:id/status", params: { id: "number" } as const, render: ids.projectStatus },
  remove: { method: "post", path: "/:id/delete", params: { id: "number" } as const },
} as const);
```

### Shared components

Lean Tags (`screens/lt/views/projects.components.ts`):

```ts
import { span, tw, type Tw } from "#lt";
import type { Project } from "../../../support/projects.service.ts";
import { projects } from "../projects.routes.ts";

const buttonBase = tw`inline-flex cursor-pointer items-center rounded-control px-4 py-2 text-sm font-medium focus-visible:ring-2`;
export const primaryButton = tw`${buttonBase} bg-primary text-on-accent hover:bg-primary-700`;
export const quietButton = tw`${buttonBase} border border-line hover:bg-surface-2`;
export const dangerButton = tw`${buttonBase} bg-danger text-on-accent hover:bg-danger-700`;

const pill = tw`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium`;

const statusTone: Record<Project["status"], Tw> = {
  active: tw`bg-success/10 text-success`,
  paused: tw`bg-warning/10 text-warning`,
  archived: tw`bg-surface-2 text-text-dim`,
};
export const StatusPill = (status: Project["status"]) => span(pill, statusTone[status], tw`capitalize`, status);

const jobTone: Record<Project["job"], Tw> = {
  queued: tw`bg-surface-2 text-text-dim`,
  running: tw`bg-primary/10 text-primary`,
  done: tw`bg-success/10 text-success`,
  failed: tw`bg-danger/10 text-danger`,
};
const jobLabel: Record<Project["job"], string> = {
  queued: "Export queued",
  running: "Exporting…",
  done: "Export ready",
  failed: "Export failed",
};
export const JobBadge = ({ id, job }: Pick<Project, "id" | "job">) =>
  span(
    pill,
    jobTone[job],
    projects.status({ id }).poll((job === "queued" || job === "running") && "2s"),
    jobLabel[job],
  );
```

fluent-html 8 (`screens/fh8/views/projects.components.ts`):

```ts
import { Span, type Styler } from "fluent-html";
import type { Project } from "../projects.service.js";
import { projectRoutes, ids } from "../projects.routes.js";

const buttonBase: Styler = (t) =>
  t.inlineFlex().cursor("pointer").items("center").rounded("control").px("4").py("2").text("sm").font("medium").focusVisible({ ring: "2" });
export const primaryButton: Styler = (t) => t.apply(buttonBase).bg("primary").text("on-accent").hover({ bg: "primary-700" });
export const quietButton: Styler = (t) => t.apply(buttonBase).border().border("line").hover({ bg: "surface-2" });
export const dangerButton: Styler = (t) => t.apply(buttonBase).bg("danger").text("on-accent").hover({ bg: "danger-700" });

const pill: Styler = (t) => t.inlineFlex().items("center").rounded("full").px("2.5").py("0.5").text("xs").font("medium");

export function StatusPill({ status }: Pick<Project, "status">) {
  return Span(status)
    .apply(pill)
    .whenMatch(status, {
      active: (t) => t.bg("success/10").text("success"),
      paused: (t) => t.bg("warning/10").text("warning"),
      archived: (t) => t.bg("surface-2").text("text-dim"),
    })
    .capitalize();
}

const jobLabel: Record<Project["job"], string> = {
  queued: "Export queued",
  running: "Exporting…",
  done: "Export ready",
  failed: "Export failed",
};

export function JobBadge({ id, job }: Pick<Project, "id" | "job">) {
  return Span(jobLabel[job])
    .setId(ids.projectStatus)
    .apply(pill)
    .whenMatch(job, {
      queued: (t) => t.bg("surface-2").text("text-dim"),
      running: (t) => t.bg("primary/10").text("primary"),
      done: (t) => t.bg("success/10").text("success"),
      failed: (t) => t.bg("danger/10").text("danger"),
    })
    .when(job === "queued" || job === "running", (t) => t.poll(projectRoutes.status({ id }), "2s"));
}
```

### R1, project list

Lean Tags (`screens/lt/views/projects.list.view.ts`):

```ts
import { a, div, h1, input, li, p, tw, ul } from "#lt";
import { Layout } from "../../../support/layout.ts";
import type { Project } from "../../../support/projects.service.ts";
import { projects } from "../projects.routes.ts";
import { StatusPill, primaryButton } from "./projects.components.ts";

type ListProps = { items: Project[]; q?: string };

const Row = (item: Project) =>
  li(
    { id: `project-${item.id}` },
    a(
      tw`flex items-center justify-between gap-4 px-4 py-3 hover:bg-surface-2`,
      projects.detail({ id: item.id }),
      div(p(tw`font-medium`, item.name), p(tw`text-sm text-text-dim`, item.description)),
      StatusPill(item.status),
    ),
  );

const Empty = ({ q }: Pick<ListProps, "q">) =>
  div(
    tw`px-4 py-12 text-center`,
    p(tw`font-medium`, q ? `No projects match "${q}"` : "No projects yet"),
    p(tw`mt-1 text-sm text-text-dim`, q ? "Try a different search." : "Create your first project to get started."),
  );

export const ProjectRows = ({ items, q }: ListProps) =>
  div(
    tw`rounded-card border border-line bg-surface`,
    projects.rows().root,
    items.length ? ul(tw`divide-y divide-line`, items.map(Row)) : Empty({ q }),
  );

export const ProjectListPage = (props: ListProps) =>
  Layout(
    { title: "Projects" },
    div(
      tw`flex items-center justify-between`,
      h1(tw`text-2xl font-semibold`, "Projects"),
      a(primaryButton, projects.new(), "New project"),
    ),
    input(
      tw`mt-6 w-full rounded-control border border-line bg-surface px-3 py-2 text-sm`,
      { type: "search", value: props.q, placeholder: "Search projects", "aria-label": "Search projects" },
      projects.rows().search("q"),
    ),
    div(tw`mt-4`, ProjectRows(props)),
  );
```

fluent-html 8 (`screens/fh8/views/projects.list.view.ts`):

```ts
import { A, Div, H1, Input, Li, P, Ul, ForEachKeyed, IfThenElse } from "fluent-html";
import { Layout } from "../../../core/layout/layout.view.js";
import type { Project } from "../projects.service.js";
import { projectRoutes, ids } from "../projects.routes.js";
import { StatusPill, primaryButton } from "./projects.components.js";

type ListProps = { items: Project[]; q?: string };

function Row(item: Project) {
  return Li(
    A(
      Div(P(item.name).font("medium"), P(item.description).text("sm").text("text-dim")),
      StatusPill({ status: item.status }),
    )
      .nav(projectRoutes.detail({ id: item.id }))
      .flex().items("center").justify("between").gap("4").px("4").py("3")
      .hover({ bg: "surface-2" }),
  );
}

function Empty({ q }: Pick<ListProps, "q">) {
  return Div(
    P(q ? `No projects match "${q}"` : "No projects yet").font("medium"),
    P(q ? "Try a different search." : "Create your first project to get started.").mt("1").text("sm").text("text-dim"),
  ).px("4").py("12").text("center");
}

export function ProjectRows({ items, q }: ListProps) {
  return Div(
    IfThenElse(
      items.length > 0,
      () => Ul(ForEachKeyed(items, (item) => `project-${item.id}`, Row)).divideY().divide("line"),
      () => Empty({ q }),
    ),
  )
    .setId(ids.projectList)
    .rounded("card").border().border("line").bg("surface");
}

export function ProjectListPage(props: ListProps) {
  return Layout({
    title: "Projects",
    children: [
      Div(
        H1("Projects").text("2xl").font("semibold"),
        A("New project").nav(projectRoutes.new()).apply(primaryButton),
      ).flex().items("center").justify("between"),
      Input()
        .setType("search")
        .setName("q")
        .setValue(props.q ?? "")
        .setPlaceholder("Search projects")
        .setAriaLabel("Search projects")
        .search(ids.projectList, projectRoutes.rows())
        .mt("6").w("full").rounded("control").border().border("line").bg("surface").px("3").py("2").text("sm"),
      Div(ProjectRows(props)).mt("4"),
    ],
  });
}
```

### R2, create form bound to a schema

Lean Tags schema (`screens/lt/projects.schema.ts`):

```ts
import { z } from "#zod";

export const ProjectInput = z.object({
  name: z.string().min(1, "Name is required").max(80, "Keep the name under 80 characters"),
  description: z.string().max(500, "Keep the description under 500 characters").optional(),
  status: z.enum(["active", "paused"]),
});
export type ProjectInput = z.infer<typeof ProjectInput>;
```

Lean Tags view (`screens/lt/views/projects.form.view.ts`):

```ts
import { a, button, div, h1, label, tw, type FormState } from "#lt";
import { Layout } from "../../../support/layout.ts";
import { projects } from "../projects.routes.ts";
import { primaryButton, quietButton } from "./projects.components.ts";

type State = FormState<typeof projects.create>;

const field = tw`grid gap-1 text-sm font-medium`;
const control = tw`rounded-control border border-line bg-surface px-3 py-2 font-normal aria-invalid:border-danger`;
const error = tw`font-normal text-danger`;

export const ProjectForm = (state: State) =>
  projects.create().form(state, tw`grid max-w-lg gap-4`, (f) => [
    label(field, "Name", f.input("name", control, { required: true, maxlength: 80 }), f.error("name", error)),
    label(field, "Description", f.textarea("description", control, { rows: 4 }), f.error("description", error)),
    label(field, "Status", f.select("status", { active: "Active", paused: "Paused" }, control), f.error("status", error)),
    div(
      tw`flex gap-3`,
      button(primaryButton, { type: "submit" }, "Create project"),
      a(quietButton, projects.list(), "Cancel"),
    ),
  ]);

export const NewProjectPage = (state: State = {}) =>
  Layout({ title: "New project" }, h1(tw`text-2xl font-semibold`, "New project"), div(tw`mt-6`, ProjectForm(state)));
```

fluent-html 8 schema and validation (`screens/fh8/projects.schema.ts`):

```ts
import { Type, type Static } from "@sinclair/typebox";

const ProjectBody = Type.Object({
  name: Type.String(),
  description: Type.Optional(Type.String()),
  status: Type.String(),
}, { additionalProperties: false });
export type ProjectReq = Static<typeof ProjectBody>;
export type ProjectErrors = Partial<Record<keyof ProjectReq, string>>;

export const projectSchema = { body: ProjectBody };
export const projectListSchema = { querystring: Type.Object({ q: Type.Optional(Type.String()) }) };

const STATUSES = ["active", "paused"] as const;
export type ProjectInput = { name: string; description?: string; status: (typeof STATUSES)[number] };

export function validateProject(body: ProjectReq): { ok: true; value: ProjectInput } | { ok: false; errors: ProjectErrors } {
  const errors: ProjectErrors = {};
  const status = STATUSES.find((s) => s === body.status);
  if (body.name.length < 1) errors.name = "Name is required";
  else if (body.name.length > 80) errors.name = "Keep the name under 80 characters";
  if (body.description && body.description.length > 500) errors.description = "Keep the description under 500 characters";
  if (!status) errors.status = `Choose one of: ${STATUSES.join(", ")}`;
  if (!status || Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { name: body.name, description: body.description || undefined, status } };
}
```

fluent-html 8 view (`screens/fh8/views/projects.form.view.ts`):

```ts
import { A, Button, Div, Form, H1, Label, type Styler } from "fluent-html";
import { Layout } from "../../../core/layout/layout.view.js";
import { projectRoutes, ids } from "../projects.routes.js";
import type { ProjectErrors, ProjectReq } from "../projects.schema.js";
import { primaryButton, quietButton } from "./projects.components.js";

type FormProps = { values?: Partial<ProjectReq>; errors?: ProjectErrors };

const field: Styler = (t) => t.grid().gap("1").text("sm").font("medium");
const control: Styler = (t) =>
  t.rounded("control").border().border("line").bg("surface").px("3").py("2").font("normal").variant("aria-invalid", { border: "danger" });
const error: Styler = (t) => t.font("normal").text("danger");

export function ProjectForm({ values = {}, errors = {} }: FormProps) {
  return Form<ProjectReq>({ values, errors }, (f) => [
    Label("Name", f.input("name", "text").toggle("required").setMaxlength(80).apply(control), f.error("name").apply(error)).apply(field),
    Label("Description", f.textarea("description").setRows(4).apply(control), f.error("description").apply(error)).apply(field),
    Label(
      "Status",
      f.select("status", [
        { value: "active", label: "Active" },
        { value: "paused", label: "Paused" },
      ]).apply(control),
      f.error("status").apply(error),
    ).apply(field),
    Div(
      Button("Create project").setType("submit").apply(primaryButton),
      A("Cancel").nav(projectRoutes.list()).apply(quietButton),
    ).flex().gap("3"),
  ])
    .setId(ids.projectForm)
    .nav(projectRoutes.create(), { invalid: ids.projectForm })
    .grid().maxW("lg").gap("4");
}

export function NewProjectPage(props: FormProps) {
  return Layout({
    title: "New project",
    children: [H1("New project").text("2xl").font("semibold"), Div(ProjectForm(props)).mt("6")],
  });
}
```

### R3, project detail

Lean Tags (`screens/lt/views/projects.detail.view.ts`):

```ts
import { a, button, dd, dialog, div, dl, dt, h1, h2, modal, p, tw } from "#lt";
import { Layout } from "../../../support/layout.ts";
import type { Project } from "../../../support/projects.service.ts";
import { projects } from "../projects.routes.ts";
import { JobBadge, StatusPill, dangerButton, quietButton } from "./projects.components.ts";

const confirm = modal("delete-project");

const DeleteDialog = ({ id, name }: Project) =>
  dialog(
    tw`w-full max-w-sm rounded-card bg-surface p-6 shadow-lg backdrop:bg-overlay/40`,
    confirm.root,
    h2(tw`text-lg font-semibold`, "Delete project?"),
    p(tw`mt-2 text-sm text-text-dim`, `"${name}" and its exports will be removed. This cannot be undone.`),
    div(
      tw`mt-6 flex justify-end gap-3`,
      button(quietButton, confirm.close, "Cancel"),
      button(dangerButton, projects.remove({ id }), "Delete project"),
    ),
  );

export const ProjectDetailPage = (project: Project) =>
  Layout(
    { title: project.name },
    a(tw`text-sm text-text-dim hover:underline`, projects.list(), "Projects"),
    div(
      tw`mt-2 flex items-start justify-between gap-4`,
      div(h1(tw`text-2xl font-semibold`, project.name), p(tw`mt-1 text-text-dim`, project.description)),
      button(dangerButton, confirm.open, "Delete"),
    ),
    dl(
      tw`mt-6 grid grid-cols-[8rem_1fr] gap-y-3 text-sm`,
      dt(tw`text-text-dim`, "Status"),
      dd(StatusPill(project.status)),
      dt(tw`text-text-dim`, "Export"),
      dd(JobBadge(project)),
    ),
    DeleteDialog(project),
  );
```

fluent-html 8 (`screens/fh8/views/projects.detail.view.ts`):

```ts
import { A, Button, Dd, Dialog, Div, Dl, Dt, H1, H2, P } from "fluent-html";
import { Layout } from "../../../core/layout/layout.view.js";
import type { Project } from "../projects.service.js";
import { projectRoutes, ids } from "../projects.routes.js";
import { JobBadge, StatusPill, dangerButton, quietButton } from "./projects.components.js";

function DeleteDialog({ id, name }: Project) {
  return Dialog(
    H2("Delete project?").text("lg").font("semibold"),
    P(`"${name}" and its exports will be removed. This cannot be undone.`).mt("2").text("sm").text("text-dim"),
    Div(
      Button("Cancel").setType("button").setCommand("close").setCommandfor(ids.deleteDialog).apply(quietButton),
      Button("Delete project").setType("button").submit(projectRoutes.remove({ id })).apply(dangerButton),
    ).mt("6").flex().justify("end").gap("3"),
  )
    .setId(ids.deleteDialog)
    .setClosedby("any")
    .w("full").maxW("sm").rounded("card").bg("surface").p("6").shadow("lg")
    .variant("backdrop", { bg: "overlay/40" });
}

export function ProjectDetailPage(project: Project) {
  return Layout({
    title: project.name,
    children: [
      A("Projects").nav(projectRoutes.list()).text("sm").text("text-dim").hover({ underline: true }),
      Div(
        Div(H1(project.name).text("2xl").font("semibold"), P(project.description).mt("1").text("text-dim")),
        Button("Delete").setType("button").setCommand("show-modal").setCommandfor(ids.deleteDialog).apply(dangerButton),
      ).mt("2").flex().items("start").justify("between").gap("4"),
      Dl(
        Dt("Status").text("text-dim"),
        Dd(StatusPill({ status: project.status })),
        Dt("Export").text("text-dim"),
        Dd(JobBadge(project)),
      ).mt("6").grid().gridCols("[8rem_1fr]").gap("y", "3").text("sm"),
      DeleteDialog(project),
    ],
  });
}
```

### Controller

Lean Tags (`screens/lt/projects.controller.ts`):

```ts
import { handlers } from "#lt";
import { projects } from "./projects.routes.ts";
import { createProject, deleteProject, findProjects, getProject } from "../../support/projects.service.ts";
import { JobBadge } from "./views/projects.components.ts";
import { ProjectListPage, ProjectRows } from "./views/projects.list.view.ts";
import { NewProjectPage, ProjectForm } from "./views/projects.form.view.ts";
import { ProjectDetailPage } from "./views/projects.detail.view.ts";

export default handlers(projects, {
  list: async ({ input }) => ProjectListPage({ q: input.q, items: await findProjects(input.q) }),
  rows: async ({ input }) => ProjectRows({ q: input.q, items: await findProjects(input.q) }),
  new: () => NewProjectPage(),
  create: {
    form: ProjectForm,
    ok: async ({ body, redirect }) => redirect(projects.detail({ id: (await createProject(body)).id })),
  },
  detail: async ({ input, notFound }) => {
    const project = await getProject(input.id);
    return project ? ProjectDetailPage(project) : notFound();
  },
  status: async ({ input, notFound }) => {
    const project = await getProject(input.id);
    return project ? JobBadge(project) : notFound();
  },
  remove: async ({ input, redirect }) => {
    await deleteProject(input.id);
    return redirect(projects.list());
  },
});
```

fluent-html 8 (`screens/fh8/projects.controller.ts`):

```ts
import { defineController, page } from "../../core/render/define-controller.js";
import { isHtmxRequest } from "../../core/htmx/request.js";
import { projectRoutes, ids } from "./projects.routes.js";
import { projectListSchema, projectSchema, validateProject } from "./projects.schema.js";
import { createProject, deleteProject, findProjects, getProject } from "./projects.service.js";
import { JobBadge } from "./views/projects.components.js";
import { ProjectListPage, ProjectRows } from "./views/projects.list.view.js";
import { NewProjectPage, ProjectForm } from "./views/projects.form.view.js";
import { ProjectDetailPage } from "./views/projects.detail.view.js";

export default defineController(projectRoutes, {
  list: {
    schema: projectListSchema,
    GET: async (request, reply) => {
      const { q } = request.query;
      return reply.renderPage(ProjectListPage({ q, items: await findProjects(q) }));
    },
  },
  rows: {
    schema: projectListSchema,
    GET: async (request, reply) => {
      const { q } = request.query;
      return reply.renderFragment(ids.projectList, ProjectRows({ q, items: await findProjects(q) }));
    },
  },
  new: page(() => NewProjectPage({})),
  create: {
    schema: projectSchema,
    POST: async (request, reply) => {
      const result = validateProject(request.body);
      if (!result.ok) {
        const props = { values: request.body, errors: result.errors };
        return reply.code(422).renderView(isHtmxRequest(request) ? ProjectForm(props) : NewProjectPage(props));
      }
      const project = await createProject(result.value);
      return reply.redirect(projectRoutes.detail.resolve({ id: project.id }));
    },
  },
  detail: {
    GET: async (request, reply) => {
      const project = await getProject(request.params.id);
      if (!project) return reply.callNotFound();
      return reply.renderPage(ProjectDetailPage(project));
    },
  },
  status: {
    GET: async (request, reply) => {
      const project = await getProject(request.params.id);
      if (!project) return reply.callNotFound();
      return reply.renderFragment(ids.projectStatus, JobBadge(project));
    },
  },
  remove: {
    POST: async (request, reply) => {
      await deleteProject(request.params.id);
      return reply.redirect(projectRoutes.list.resolve());
    },
  },
});
```

## 5. The count

Command: `node tools/count.mjs` (output in `out/counts.txt`). Tokens are characters divided by four. Import lines are left out of the main table because the two arms sit at different folder depths.

| File | fluent-html 8 | Lean Tags | Saved |
|---|---|---|---|
| R1 list view | 1,733 ch, 433 tok | 1,441 ch, 360 tok | 16.8% |
| R2 form view | 1,503 ch, 376 tok | 1,048 ch, 262 tok | 30.3% |
| R3 detail view | 1,499 ch, 375 tok | 1,200 ch, 300 tok | 19.9% |
| Shared components | 1,653 ch, 413 tok | 1,374 ch, 344 tok | 16.9% |
| Routes and ids | 627 ch, 157 tok | 357 ch, 89 tok | 43.1% |
| Schema and validation | 1,338 ch, 335 tok | 323 ch, 81 tok | 75.9% |
| Controller | 1,657 ch, 414 tok | 835 ch, 209 tok | 49.6% |
| **Views (R1 to R3 plus components)** | **6,388 ch, 1,597 tok** | **5,063 ch, 1,266 tok** | **20.7%** |
| **Whole feature** | **10,010 ch, 2,503 tok** | **6,578 ch, 1,645 tok** | **34.3%** |

Three checks on the same numbers:

| Variant | Views saved | Whole feature saved |
|---|---|---|
| With import lines | 19.3% | 31.3% |
| With no whitespace at all (formatting cannot matter) | 21.9% | 34.4% |
| Leaving out the schema file in both arms | 20.7% | 27.9% |

The schema row needs care. The template has no path from a TypeBox failure to per-field messages, so the fluent-html 8 arm carries a hand-written validator. If the coordinator thinks a template helper should be assumed, use the 27.9% line.

**The syntax options the lens named, on the detail screen.** Same routes, wires and components; only the markup spelling changes. Command: `node tools/count-alt.mjs` (output in `out/counts-alt-syntax.txt`).

| Spelling | Characters | Against fluent-html 8 | Without whitespace |
|---|---|---|---|
| fluent-html 8 typed chain | 1,499 | 1.00 | 1.00 |
| JSX | 1,364 | 0.91 | 0.89 |
| html tagged template | 1,361 | 0.91 | 0.89 |
| Hiccup arrays | 1,391 | 0.93 | 0.88 |
| `tag({ class: "…" }, …)` | 1,343 | 0.90 | 0.84 |
| **Lean Tags, `` tag(tw`…`, …) ``** | **1,200** | **0.80** | **0.76** |
| Backtick tags, `` tag`…`(…) `` (dropped) | 1,143 | 0.76 | 0.74 |

Closing tags, `class=""` and `{ class: }` cost about as much as fluent-html's method chain saves. The earlier 0.63x figure for typed strings does not hold on whole screens, because text, structure and component calls do not shrink.

## 6. How Tailwind, htmx, routes and fragment ids work

**Tailwind**
- Class text is literal source inside `` tw`…` ``. Tailwind v4 scans source files itself, so there is no extractor, no safelist prebuild and no `@source inline` file. That removes "observation 1" (4 to 5 turns in every arm, control and FHX) and the `.select` false positive.
- The palette is closed in the app's own theme (`--color-*: initial`). A class Tailwind does not know generates no CSS.
- **The check asks Tailwind.** `tools/check-classes.mjs` loads the design system from the app's theme and asks it about every literal class. On the three screens: 139 classes, 0 problems. On six seeded mistakes (`probes/bad-classes.ts`): all six flagged with file, line and column, for example `probes/bad-classes.ts:9:27 unknown class "bg-primry": did you mean bg-primary?`.
- The check cannot drift from Tailwind, and it costs no type-level work. Its price: a wrong class is not a tsc error. It has to run in the same command as tsc.
- Two of the seven hint texts are wrong today (`text-smm` is described as a colour, `hovr:` suggests itself). The detection is right; the hint code is prototype quality.
- **The old objection to string classes, and what answers it.** The July decision rejected strings because a dropped variant prefix compiles clean and a runtime merge can delete a class. Here nothing is merged, and a prefix on a hole is refused twice: the class check reports it, and the render throws. One hole remains: a variant prefix typed onto a multi-class literal by hand prefixes only the first class, as in any Tailwind code.

**Routes**
- One table per feature. `page` answers a document, `part` answers one element and owns its id, `post` is an action and may own a body schema.
- Inputs are one flat object for path and query. Route query typing was the largest lookup subject in the control arms (5 calls per arm). Here a wrong key is a one-line error that prints the valid shape: `'query' does not exist in type '{ q?: string | undefined; }'`.

**Fragment ids**
- The id is declared once, in `part("project-list", …)`. The view never types it.
- `projects.rows().root` puts the id on the element. Every wire that targets the part (`.search`, `.poll`, `.load`) reads the id from the same route, so target and root cannot disagree.
- A part handler must return the element built with that part's root wire. This is a compile error otherwise (`Html<undefined>` is not assignable to `Html<"project-list">`), and the dispatcher checks it again at run time.
- Ids that are not fragments (the dialog) come from `modal(id)`, which returns the opener, root and closer attributes together.

**htmx**
- Views never write `hx-*`. A hand-written `hx-` attribute is a compile error and a render error, both naming the wire to use.
- A page link is a plain `href`; the layout's body boosts links into `#main`. Links work without JavaScript and for crawlers.
- The search wire supplies the input's `name` itself, typed to the part's inputs, so the field name cannot drift from the query.
- `.poll(cond && "2s")` states the stop condition in the same expression. The settled render has the id and no trigger, and the swap is `outerHTML`, so the timer dies.
- A form built by `route().form(…)` posts, navigates on success, and sends a 422 back into its own region.
- **Not exercised in a browser.** The attribute strings were asserted as text. The `hx-status:422` spelling comes from the template's `htmx.md`.

## 7. Rendering strategy

- A tag call builds its string immediately: opening tag, class, attributes, escaped children, closing tag. It returns a small `Html` object so a string child (escape) can be told from finished markup (pass through). There is no tree and no separate render pass.
- A `tw` literal with no holes is escaped once and cached per call site. Attribute names are classified once and cached.
- Route URLs are precompiled into segments.
- **Measured** (`out/bench-run1.json`, `out/bench-run2.json`; load average 157 and 171, so only the interleaved ratio counts):

| Run | fluent-html 8 ops/CPU-s | Lean Tags ops/CPU-s | Ratio (range) | Bytes allocated per page | Ceiling arm |
|---|---|---|---|---|---|
| 1 | 14,772 | 56,626 | 3.86 (3.59 to 3.98) | 54,563 against 138,646 | 19.5x |
| 2 | 12,857 | 50,926 | 4.00 (3.80 to 4.18) | 54,295 against 138,700 | 20.6x |

- The page output equals `expected.fh8.html` once `type="button"` on the 12 buttons and fluent-html's newlines between siblings are removed (`node tools/bench-page-diff.mjs`).
- There is a further 5x to the template-literal ceiling. I did not chase it; K2 does not need it. Streaming is not in the prototype.

## 8. Escaping model

One rule: a string is data. It is escaped where it lands, and what applies depends on the sink.

| Sink | Rule |
|---|---|
| Text, `textarea`, `title` | Five characters escaped |
| Any attribute value | Escaped, always double-quoted |
| Attribute names | Validated once; `on*` and hand-written `hx-*` and `data-hx-*` refused |
| `data: { [key]: value }` | Key must be a lowercase token; `hx-` and `on` prefixes refused |
| URL attributes (`href`, `src`, `action`, `formaction`, `poster`, `cite`, `ping`, `srcset` and others) | Scheme allowlist after the browser's own stripping rules; keyed on the attribute name, so there is no untyped route around it |
| Classes | Only `tw` literals or `tw.token(value)`; a raw string in a hole is a compile error and a render error |
| `style: { color: value }` and `` css`…${value}…` `` | One plain CSS value; a second declaration, a rule, a comment or a fetch is refused |
| Script data | `json(data)` and `jsVar(name, data)` escape `<`, `>`, `&` and the line separators. There is no inline script tag |
| htmx | From route wires. `wire({…})` refuses `js:` and `javascript:` in URLs and confirm text, and serializes `vals` and `headers` as JSON |
| `iframe srcdoc` | Always gets an empty `sandbox`; `allow-scripts` with `srcdoc` is refused |
| Bypass | `raw(trusted`…`)`. `trusted` takes a literal with no holes; `raw` takes nothing else |

**Measured:** `NODE_ENV=production node check.mjs ../../token-economy/xss/lt-adapter.mjs` gives 0 xss, 0 css, 0 legacy, 138 safe, 30 rejected, 0 of 38 benign broken, 0 unsupported (`out/xss-lt.txt`).

**The cost of "rejected".** Those 30 are throws at render: class tokens (3), data-attribute names (6), CSS values (16), htmx URL and confirm text (5). On real user data a throw is a 500. Dropping the attribute and logging is the alternative; I chose to fail closed and say so.

## 9. Composition and escape hatches

- **A component is a function.** A preset is a `tw` value. A lookup is a `Record<Union, Tw>`. Conditionals are `&&` and `?:`. Lists are `.map`. `match(value, cases)` gives exhaustive dispatch on a union or a discriminant.
- **What this gives up from fluent-html.** `ForEach`, `IfThenElse` and `.when` become ordinary expressions. The `0 && …` trap renders `0`, as in React.
- **One silent mistake remains at the type level:** `div("flex gap-4", child)` renders the class text as content. The class check could flag a text child that parses as classes; it does not yet.
- **Hatches, one per need:**

| Need | Hatch |
|---|---|
| A request the wires do not cover | `wire({ get, target, swap, trigger, confirm, vals, headers })` |
| One class from data | `tw.token(value)` |
| A computed style | `style: { width: value }` |
| Any other attribute | `data-*` and `aria-*` are open by pattern; other names are added to the tag's type |
| Trusted markup | `raw(trusted`…`)` |
| A non-Tailwind class | `tw.token("js-map")` |

## 10. The kills

| Kill | Claim | Status |
|---|---|---|
| K1 | 24 to 33% fewer output tokens, central 28% | Predicted, can fail |
| K2 | 3.86x and 4.00x | Measured, passes |
| K3 | 0 escapes of 168 hostile, 0 benign broken | Measured, passes |
| K4 | 0 errors against 12 | Measured, passes |
| K5 | No worse, if first compile means tsc plus the class check | Predicted |

**K1, the arithmetic.** Control buckets are from Evidence 1 (mean of two runs, 89.7k output tokens).

| Bucket | Control | Expected change | Why |
|---|---|---|---|
| Lookups | 18.3k | minus 11.7k to 15k | FHX already removed 11.7k by making classes literal. Lean Tags does the same and also targets the 13 route, query and form lookups per arm that FHX left |
| View writes | 19.9k | minus 4k to 6k | 20.7% measured on static text; FHX got 5.9k including fewer rewrites |
| Server edits | 6.7k | minus about 3k | Routes 43%, controller 50%, schema 76% shorter |
| Guidance | 6.6k | minus about 3k | The whole prototype source is 37,644 B (`wc -c lt.ts`); the reference cap is 56,541 B |
| Checks | 8.3k | 0 to minus 3k | No extractor or safelist step. FHX went up 3.3k here from its own new costs; Lean Tags could too |
| **Total** | | **minus 21.7k to 30k, 24 to 33%** | |

- The control's token spread between runs is 6%, so 28% is not a safe pass.
- On turns the spread is 13%, and I make no claim.
- One further lever I did not count: fewer files per feature means fewer write turns. That is a convention, not the library.

**K5, the mechanism and the caveat.**
- The three screens compiled and passed 10 behaviour checks the first time they ran (`node tools/run-screens.mjs`), after the library's types were fixed. That is me writing against my own design, so it is weak evidence.
- Diagnostics on 21 seeded mistakes (`out/probe-mistakes.txt`): 21 errors, none an overload list, 8 a single line, the longest 5 lines. Examples:
  - `Argument of type '"nmae"' is not assignable to parameter of type '"name" | "description" | "status"'.`
  - `Type '"txt"' is not assignable to type '"number" | "hidden" | "text" | …'. Did you mean '"text"'?`
  - `Type '"flex gap-4"' is not assignable to type '"classes are a leading tw argument: div(tw`flex gap-4`, …)"'.` (on the third line)
- Weak spots: only 1 of 21 carries a "did you mean"; an attribute typo names the bad key but not the nearest good one; a missing handler key is named at the end of a 649-character line.
- Type cost for the library plus the three screens: 5,694 instantiations and 3,090 types (`tsc -p tsconfig.json --extendedDiagnostics`). I have no fluent-html 8 figure to compare.

## 11. What ran, and what did not

| Claim | Command (from `token-economy/` unless noted) | Result |
|---|---|---|
| Screens type-check | `tsc -p tsconfig.json` (TypeScript 5.9.3) | 0 errors |
| Screens behave | `node tools/run-screens.mjs` | 10 checks passed |
| Mistakes are compile errors | `tsc -p probes/tsconfig.json` | 21 errors for 21 mistakes |
| Class check | `TAILWIND_FROM=<fluent-html> node tools/check-classes.mjs support/theme.css screens/lt support/layout.ts` (Tailwind 4.3.3) | 139 classes, 0 problems; seeded file 7 problems |
| Character counts | `node tools/count.mjs`, `node tools/count-alt.mjs` | Section 5 |
| K2 | `NODE_ENV=production node --expose-gc harness.mjs --rounds 11 --sample-ms 300 --json arms/fluent-html-8.mjs ../../token-economy/bench/lt-arm.mjs arms/template-literal.mjs` (in `fixtures/bench`) | 3.861 and 4.002 |
| K3 | `NODE_ENV=production node check.mjs ../../token-economy/xss/lt-adapter.mjs` (in `fixtures/xss`) | 0 escapes |
| K4 | `npx html-validate <file>` (11.17.0, in the scratchpad's `fs-validate`) | 0 errors in all 8 files (`out/html-validate-lt.txt`) |

**Gaps**
- **K1 and K5 are unmeasured.** No headless session ran.
- **The fluent-html 8 screens were not type-checked.** The raw template does not compile outside a scaffold. I checked the styling method names against `dist/src/**/*.d.ts` and corrected one (`gapY` does not exist; it is `gap("y", …)`). A few characters either way would not move the totals.
- **Guards and owner scoping are left out of both arms.** The control would otherwise also need a `sitemap` stance on each guardless page route.
- **No browser.** htmx behaviour is asserted as attribute text.
- **Prototype limits.** About 50 tags with partial attribute tables; no streaming; no form-value coercion; the `handlers` dispatcher is not a Fastify adapter; `#zod` is a 60-line stand-in for zod (the design takes any Standard Schema).

**Method choices**
1. **Count the whole feature as well as the views.** R2 and R3 are defined by handler behaviour (422, redirect, poll stop), so the handler is part of the screen.
2. **Same decomposition in both arms.** Same components, classes and copy, so the difference is the surface.
3. **zod-style schema in Lean Tags, TypeBox in the control.** Each arm uses what its stack gives it; the schema row is reported separately for that reason.
4. **Dropped the tagged-template tag form** on the diagnostics evidence, and kept its files in `attic/` so the comparison can be rerun.
5. **Throw on refused values** in the XSS adapter, as the checker's "rejected" verdict allows.

**Files**
- Prototype: `/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15/token-economy/lt.ts`
- Screens: `…/token-economy/screens/lt/` and `…/token-economy/screens/fh8/`
- Bench arm and XSS adapter: `…/token-economy/bench/lt-arm.mjs`, `…/token-economy/xss/lt-adapter.mjs`
- Tools: `…/token-economy/tools/` (`count.mjs`, `count-alt.mjs`, `run-screens.mjs`, `check-classes.mjs`, `bench-page-diff.mjs`)
- Probes: `…/token-economy/probes/` (`mistakes.ts`, `bad-classes.ts`, `alt-syntax/`)
- Outputs: `…/token-economy/out/`
- First attempt, kept for the comparison: `…/token-economy/attic/`
