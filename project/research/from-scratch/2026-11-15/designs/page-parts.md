# Page Parts

# Page Parts: a semantic layer for fluent-html, from scratch

Lens: a semantic layer. Research only. Everything is under
`/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15/semantic-layer/` (called `S/` below). Nothing in fluent-html's `src/`, its releases, any `project/pm/` file, the template, the guidelines or a `CLAUDE.md` was touched, and nothing was committed.

**What was built and what was not.** A runnable prototype (1,014 lines of TypeScript, no dependencies), the three reference screens on it, a behaviour test, a bench arm, an XSS adapter, a seeded-mistake probe, a Tailwind class check, and a 6,282 B API reference. K2, K3 and K4 are measured. K1 and K5 are claims with mechanisms; they need the bake-off. The fluent-html 8 screens beside mine are written from the template's references and exemplars and are **not compiled** (the raw template is not tsc-able outside a scaffold), so they serve the size comparison only.

## 1. Thesis

Evidence 1 says where the cost is: 21.7% of turns go to looking up framework vocabulary, the largest lookup subject is routes, query typing and controller plumbing (11 and 10 calls per run), and FHX lost on the stateful screen because it kept that layer. The cause is structural. For one interaction, fluent-html 8 plus the template asks Claude Code to keep five artefacts in agreement:

1. an id in `defineIds`;
2. a route in `defineRoutes` with the right `render:` stance;
3. a controller entry of the right shape, answering through the right renderer;
4. the right swap verb on the right element, with the id again;
5. the view's root element carrying `.setId(…)` with the same id.

Page Parts makes each interaction one declaration. A **page** owns a URL. Its **regions**, **forms** and **actions** hang off it and share its URL, params, query and guard. Each part derives its DOM id, its address, its htmx attributes, its status codes and its ARIA. Raw elements stay available underneath as the escape hatch.

The semantic layer is independent of how elements are spelled. A part is a function from props to a View, which is also the contract of a JSX component, so the same parts would sit under a TSX surface or over fluent-html 8's tags. I wrote the screens in plain function calls so that the measured difference is this lens's.

## 2. What Claude Code no longer has to know or get right

| Today (fluent-html 8 + template) | In Page Parts |
|---|---|
| `defineIds`, `.setId(ids.x)` on the root, the id again at the verb | No ids are written. A region's id is derived from its page and name. |
| A route per fragment, form post and action, each with a path and a method | Only pages have a path. A region answers at its page's URL; a form or action posts to `?/name` on it. |
| The `render:` stance, and which verb accepts which stance | The part's kind is the stance. `redirect()` takes only a page; a page's view must return `Page()`. |
| Ten swap verbs and when each applies (`.nav`, `.tab`, `.submit`, `.fragment`, `.search`, `.poll`, `.defer`, `.onChange`, `.fire`) | `Link`, `Search`, `region.show()`, `form.show()`, `action.button()`. |
| htmx 4 facts: `sync: replace` for search, GET sends only the source value, `outerHTML` (never a morph) for a poller, push suppressed on 422 | Emitted by the part. None appears in app code. |
| Controller entry shape (`page`, `fragment`, `guarded`, long form) and renderer (`renderPage`, `renderFragment`, `renderView`, `renderInvalid`) | A loader returns data; a handler returns `redirect()`, `refresh()`, `notFound()` or `invalid()`. |
| The 422 path: loose schema, hand validation, an `ErrorBag`, `isHtmxRequest`, form region alone or full page, `{ invalid: ids.form }` | The form validates against its schema and answers 422 with the form region (htmx) or the page (no JS). |
| Field wiring: `for`/`id`, `f.error`, `aria-invalid`, `aria-describedby`, `required`, `maxlength`, input type | `f.field(name, label)` reads them from the schema. The label is a required argument. |
| Dialog wiring: two ids, `command`/`commandfor`, `closedby`, `aria-labelledby`, a cancel button that does not submit | `confirm: { title, body }` on the action. |
| Poll discipline: stop by rendering without the verb, same id, a terminal variant for a missing row, identical for missing and foreign rows | `poll: { every, while }`. `notFound()` from the loader answers the empty shell. |
| Guards repeated on every fragment route of a guarded page | A page's guard runs before every part it owns. A part cannot be less guarded than its page. |
| Keyed list plus empty state (`ForEachKeyed`, `IfThenElse`) | `List({ items, key, row, empty })`. |
| Typed styling vocabulary (`.text("2xl")`, `.hover({…})`, `.divideY()`, `.srOnly()`), the extractor and the safelist | Tailwind's own class text, checked against the theme by one command. |
| `aria-current` on the active nav link, `type` on a button, `alt` on an image, a label and submit on a search form | By construction or a compile error. |

## 3. The API

The full reference is `S/REFERENCE.md` (6,282 B by `wc -c`; the control's cap is 56,541 B).

```ts
// Parts
page(path, { params?, query?, guard?, load? })      // then .view(({ data, params, query }) => Page(…))
somePage.region(name, { load, poll?, class? })       // then .view(({ data }) => …);  place with region.show()
somePage.form(name, { schema, submit, class? })      // then .view((f) => […]);        place with form.show(values?)
somePage.action(name, { confirm?, run })             // place with action.button({ class }, "Label")

// Answers from submit, run and guard
redirect(page, params?, query?)   refresh(regionA, regionB)   notFound()   invalid({ field: "message" })

// Inside views
Page({ title, description?, class? }, ...children)
Link({ to: page, params, query?, class? }, ...children)
Search({ into: region, name, label, placeholder?, class? })      // name: a key of the page's query
List({ items, key, row, empty, class?, rowClass? })
f.field(name, label, { hint?, placeholder?, as?, options? })      f.submit(label)

// Raw elements: attributes object first (optional), then children
Div({ class: "flex gap-4" }, H1("Title"), cond && Span("x"), items.map((i) => Li(i.name)))
```

**Why a part's view is a separate statement.** A list page links to the detail page, and the detail page's delete action redirects to the list. If views were inside the declaring call, each constant's type would depend on the other's and tsc would report TS7022. Declaring the parts first and attaching `.view()` afterwards compiles clean (`tsc -p tsconfig.json`, 0 errors), and reads as a map of the feature followed by its views. A part left without a view is caught when `app()` starts, with a message naming it.

## 4. The three screens in Page Parts

`S/screens/projects.ts`, complete: wiring and views for R1, R2 and R3. It compiles under `strict` and passes `node test/run.ts`.

```ts
import { page, Page, Link, Search, List, redirect, notFound, invalid, Type, Div, H1, P, Span } from "../kit/index.ts";
import { db } from "./data.ts";

// The feature's parts: what exists, at which URL, with which input and data.

export const projectList = page("/projects", {
  query: { q: Type.Optional(Type.String()) },
});
export const projectRows = projectList.region("rows", {
  load: ({ query }) => db.search(query.q),
});

export const projectDetail = page("/projects/:id", {
  params: { id: Type.Integer() },
  load: async ({ params }) => (await db.find(params.id)) ?? notFound(),
});
export const projectStatus = projectDetail.region("status", {
  load: async ({ params }) => (await db.job(params.id)) ?? notFound(),
  poll: { every: "2s", while: ({ data: job }) => job.state === "queued" || job.state === "running" },
});
export const deleteProject = projectDetail.action("delete", {
  confirm: { title: "Delete this project?", body: "Its jobs and files go with it. This cannot be undone.", confirm: "Delete project" },
  run: async ({ params }) => {
    await db.remove(params.id);
    return redirect(projectList);
  },
});

export const projectNew = page("/projects/new");
export const createProject = projectNew.form("create", {
  schema: Type.Object({
    name: Type.String({ minLength: 1, maxLength: 80 }),
    description: Type.Optional(Type.String({ maxLength: 500 })),
    status: Type.Union([Type.Literal("draft"), Type.Literal("active")]),
  }),
  submit: async ({ data }) => {
    if (await db.nameTaken(data.name)) return invalid({ name: "A project with this name exists" });
    const project = await db.create(data);
    return redirect(projectDetail, { id: project.id });
  },
  class: "flex max-w-lg flex-col gap-4",
});

// R1: project list

projectList.view(() =>
  Page({ title: "Projects", class: "mx-auto max-w-3xl p-6" },
    Div({ class: "flex items-center justify-between gap-4" },
      H1({ class: "text-2xl font-semibold text-text" }, "Projects"),
      Link({ to: projectNew, class: "rounded-control bg-primary px-4 py-2 text-on-accent hover:bg-primary-700" }, "New project"),
    ),
    Search({ into: projectRows, name: "q", label: "Search projects", placeholder: "Search by name", class: "mt-6 w-full" }),
    projectRows.show(),
  ),
);

projectRows.view(({ data: projects, query }) =>
  List({
    items: projects,
    key: (p) => p.id,
    class: "mt-4 divide-y divide-line rounded-card border border-line bg-surface",
    row: (p) =>
      Link({ to: projectDetail, params: { id: p.id }, class: "flex items-center justify-between px-4 py-3 hover:bg-surface-2" },
        Span({ class: "font-medium text-text" }, p.name),
        Span({ class: "text-sm text-text-dim" }, p.status),
      ),
    empty: Div({ class: "mt-4 rounded-card border border-dashed border-line p-10 text-center" },
      P({ class: "font-medium text-text" }, query.q ? `No projects match "${query.q}"` : "No projects yet"),
      P({ class: "mt-1 text-sm text-text-dim" }, "Create one to get started."),
    ),
  }),
);

// R2: create form

projectNew.view(() =>
  Page({ title: "New project", class: "mx-auto max-w-3xl p-6" },
    H1({ class: "mb-6 text-2xl font-semibold text-text" }, "New project"),
    createProject.show({ status: "draft" }),
  ),
);

createProject.view((f) => [
  f.field("name", "Name", { placeholder: "Apollo" }),
  f.field("description", "Description", { as: "textarea", hint: "Optional, up to 500 characters." }),
  f.field("status", "Status", { options: { draft: "Draft", active: "Active" } }),
  Div({ class: "flex items-center gap-3" },
    f.submit("Create project"),
    Link({ to: projectList, class: "text-sm text-text-dim hover:text-text" }, "Cancel"),
  ),
]);

// R3: project detail

projectDetail.view(({ data: project }) =>
  Page({ title: project.name, class: "mx-auto max-w-3xl p-6" },
    Div({ class: "flex items-start justify-between gap-4" },
      Div(
        H1({ class: "text-2xl font-semibold text-text" }, project.name),
        P({ class: "mt-1 text-text-dim" }, project.description || "No description."),
      ),
      deleteProject.button({ class: "rounded-control border border-danger px-4 py-2 text-danger hover:bg-danger/10" }, "Delete"),
    ),
    projectStatus.show(),
  ),
);

projectStatus.view(({ data: job }) =>
  Span({
      class: {
        queued: "bg-surface-2 text-text-dim",
        running: "bg-info/10 text-info",
        done: "bg-success/10 text-success",
        failed: "bg-danger/10 text-danger",
      }[job.state] + " mt-6 inline-flex rounded-full px-3 py-1 text-sm font-medium",
    },
    { queued: "Queued", running: `Running, ${job.progress}%`, done: "Finished", failed: "Failed" }[job.state],
  ),
);
```

**What it emits** (from `S/out/`, written by `node test/run.ts`):

- R1 search box: `<search><form method="get" action="/projects"><label for="projects-rows-q" class="sr-only">Search projects</label><input type="search" id="projects-rows-q" name="q" … hx-get="/projects" hx-target="#projects-rows" hx-swap="outerMorph" hx-trigger="input changed delay:300ms, search" hx-sync="this:replace" hx-push-url="true"><button type="submit" class="sr-only">Search projects</button></form></search>`. It works without JavaScript, the URL stays shareable, and the box shows the current query after a reload.
- R1 rows: `<div id="projects-rows"><ul …><li id="projects-rows-1"><a href="/projects/1" hx-get="/projects/1" hx-target="#main-content" hx-swap="outerMorph show:top" hx-push-url="true" …>`. With no items the empty state is rendered and no `<ul>`.
- R2 invalid submit: status 422, body is the `<form id="projects-new-create" … hx-target="this" hx-swap="outerMorph">` alone, each failing control with `aria-invalid="true" aria-describedby="…-error"` and its `<p id="…-error">`; the typed values are kept. Without htmx the same 422 is the whole page. A valid submit answers `HX-Location` (htmx) or 303.
- R3 delete: `<button type="button" command="show-modal" commandfor="projects-id-delete-dialog">` and a `<dialog closedby="any" aria-labelledby="…-title">` holding a POST form, a `command="close"` cancel button and the submit.
- R3 status: `<div id="projects-id-status" role="status" hx-get="/projects/1" hx-trigger="every 2s" hx-target="this" hx-swap="outerHTML">` while the job runs; `<div id="projects-id-status" role="status">` with the badge once it ends; `<div id="projects-id-status" role="status"></div>` for a missing row.

## 5. The same screens in fluent-html 8

`S/fh8/`, six files. Not compiled (see the note at the top). Shared stylers (`inputStyle`, `labelStyle`, `errorStyle`, `dialogStyle`…) are assumed to exist in `shared/ui`, matching the kit's `configure({ styles })`, so per-field styling is out of both counts.

`projects.routes.ts`
```ts
import { defineRoutes, defineIds } from "fluent-html";

export const projectIds = defineIds(["project-rows", "project-form", "project-status", "project-delete-dialog", "project-delete-title"] as const);

export const projectRoutes = defineRoutes("/projects", {
  list:   { path: "/", query: { q: "string" } as const, sitemap: "exclude" },
  rows:   { path: "/rows", query: { q: "string" } as const, render: projectIds.projectRows },
  new:    { path: "/new", sitemap: "exclude" },
  create: { method: "post", path: "/" },
  detail: { path: "/:id", params: { id: "number" } as const, sitemap: "exclude" },
  status: { path: "/:id/status", params: { id: "number" } as const, render: projectIds.projectStatus },
  delete: { method: "post", path: "/:id/delete", params: { id: "number" } as const },
} as const);
```

`projects.schema.ts`
```ts
import { Type, type Static } from "@sinclair/typebox";
import type { ErrorBag } from "fluent-html";

// Loose on purpose: an Ajv failure answers the generic 400 page, so the per-field rules run in
// validateProject() and the handler answers 422 with the messages.
const CreateProjectBody = Type.Object({
  name: Type.String(),
  description: Type.Optional(Type.String()),
  status: Type.String(),
}, { additionalProperties: false });
export type CreateProjectReq = Static<typeof CreateProjectBody>;
export const createProjectSchema = { body: CreateProjectBody };

export const PROJECT_STATUSES = ["draft", "active"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
const NAME_MAX = 80;
const DESCRIPTION_MAX = 500;

export function validateProject(body: CreateProjectReq): ErrorBag<CreateProjectReq> {
  const errors: ErrorBag<CreateProjectReq> = {};
  const name = body.name.trim();
  if (name === "") errors.name = "Required";
  else if (name.length > NAME_MAX) errors.name = `At most ${NAME_MAX} characters`;
  if ((body.description ?? "").length > DESCRIPTION_MAX) errors.description = `At most ${DESCRIPTION_MAX} characters`;
  if (!PROJECT_STATUSES.includes(body.status as ProjectStatus)) errors.status = "Choose one of the options";
  return errors;
}
```

`projects.controller.ts`
```ts
import { defineController, page, fragment } from "../../core/render/define-controller.js";
import { pollRateLimit } from "../../core/htmx/rate-limit.js";
import { NotFoundPage } from "../../shared/views/not-found.view.js";
import { db } from "./projects.service.js";
import { projectRoutes, projectIds } from "./projects.routes.js";
import { createProjectSchema, validateProject, type ProjectStatus } from "./projects.schema.js";
import { ProjectListPage, ProjectRows } from "./views/projects.list.view.js";
import { ProjectNewPage, ProjectForm } from "./views/projects.new.view.js";
import { ProjectDetailPage, ProjectStatusBadge } from "./views/projects.detail.view.js";

export default defineController(projectRoutes, {
  list: page(async ({ query }) => ProjectListPage({ projects: await db.search(query.q), q: query.q })),
  rows: fragment(async ({ query }) => ProjectRows({ projects: await db.search(query.q), q: query.q })),
  new: page(() => ProjectNewPage({ values: { status: "draft" } })),
  create: {
    schema: createProjectSchema,
    POST: async (request, reply) => {
      const errors = validateProject(request.body);
      if (!errors.name && (await db.nameTaken(request.body.name))) errors.name = "A project with this name exists";
      if (Object.keys(errors).length > 0) {
        return reply.renderInvalid(
          { fragment: [projectIds.projectForm, ProjectForm], page: ProjectNewPage },
          { values: request.body, errors },
        );
      }
      const project = await db.create({ ...request.body, status: request.body.status as ProjectStatus });
      return reply.redirect(projectRoutes.detail.resolve({ id: project.id }));
    },
  },
  detail: {
    GET: async (request, reply) => {
      const project = await db.find(request.params.id);
      if (!project) return reply.code(404).renderPage(NotFoundPage());
      return reply.renderPage(ProjectDetailPage({ project, job: await db.job(project.id) }));
    },
  },
  status: fragment(
    async ({ params }) => ProjectStatusBadge({ id: params.id, job: await db.job(params.id) }),
    { config: { rateLimit: pollRateLimit() } },
  ),
  delete: {
    POST: async (request, reply) => {
      await db.remove(request.params.id);
      return reply.redirect(projectRoutes.list.resolve());
    },
  },
});
```

`views/projects.list.view.ts` (R1)
```ts
import { Div, H1, P, Span, A, Input, Label, Ul, Li, ForEachKeyed, IfThenElse } from "fluent-html";
import { Layout } from "../../../core/layout/layout.view.js";
import { inputStyle } from "../../../shared/ui/form.js";
import { projectRoutes, projectIds } from "../projects.routes.js";
import type { Project } from "../projects.service.js";

type ListProps = { projects: Project[]; q?: string };

export function ProjectListPage({ projects, q }: ListProps) {
  return Layout({
    title: "Projects",
    children: Div(
      Div(
        H1("Projects").text("2xl").font("semibold").text("text"),
        A("New project").nav(projectRoutes.new())
          .rounded("control").bg("primary").px("4").py("2").text("on-accent").hover({ bg: "primary-700" }),
      ).flex().items("center").justify("between").gap("4"),
      Label("Search projects").setFor("project-search").srOnly(),
      Input("search").setId("project-search").setName("q").setValue(q ?? "").setPlaceholder("Search by name")
        .search(projectIds.projectRows, projectRoutes.rows())
        .apply(inputStyle).mt("6").w("full"),
      ProjectRows({ projects, q }),
    ).mx("auto").maxW("3xl").p("6"),
  });
}

export function ProjectRows({ projects, q }: ListProps) {
  return Div(
    IfThenElse(
      projects.length > 0,
      () =>
        Ul(
          ForEachKeyed(projects, (p) => p.id, (p) =>
            Li(
              A(
                Span(p.name).font("medium").text("text"),
                Span(p.status).text("sm").text("text-dim"),
              ).nav(projectRoutes.detail({ id: p.id }))
                .flex().items("center").justify("between").px("4").py("3").hover({ bg: "surface-2" }),
            ),
          ),
        ).mt("4").divideY().divide("line").rounded("card").border().border("line").bg("surface"),
      () =>
        Div(
          P(q ? `No projects match "${q}"` : "No projects yet").font("medium").text("text"),
          P("Create one to get started.").mt("1").text("sm").text("text-dim"),
        ).mt("4").rounded("card").border().border("dashed").border("line").p("10").text("center"),
    ),
  ).setId(projectIds.projectRows);
}
```

`views/projects.new.view.ts` (R2)
```ts
import { Div, H1, P, A, Label, Button, Form, type FormState } from "fluent-html";
import { Layout } from "../../../core/layout/layout.view.js";
import { inputStyle, labelStyle, hintStyle, errorStyle, fieldStyle, primaryButton } from "../../../shared/ui/form.js";
import { projectRoutes, projectIds } from "../projects.routes.js";
import type { CreateProjectReq } from "../projects.schema.js";

type FormProps = FormState<CreateProjectReq>;

/** The create form: also the 422 answer on its own, swapped in by `{ invalid }`. */
export function ProjectForm(state: FormProps = {}) {
  return Form<CreateProjectReq>(state, (f) => [
    Div(
      Label("Name").setFor("name").apply(labelStyle),
      f.input("name", "text").setId("name").setPlaceholder("Apollo").setMaxlength(80).toggle("required").apply(inputStyle),
      f.error("name").apply(errorStyle),
    ).apply(fieldStyle),
    Div(
      Label("Description").setFor("description").apply(labelStyle),
      f.textarea("description").setId("description").setRows(4).setMaxlength(500).apply(inputStyle),
      P("Optional, up to 500 characters.").apply(hintStyle),
      f.error("description").apply(errorStyle),
    ).apply(fieldStyle),
    Div(
      Label("Status").setFor("status").apply(labelStyle),
      f.select("status", [
        { value: "draft", label: "Draft" },
        { value: "active", label: "Active" },
      ]).setId("status").toggle("required").apply(inputStyle),
      f.error("status").apply(errorStyle),
    ).apply(fieldStyle),
    Div(
      Button("Create project").setType("submit").apply(primaryButton),
      A("Cancel").nav(projectRoutes.list()).text("sm").text("text-dim").hover({ text: "text" }),
    ).flex().items("center").gap("3"),
  ])
    .submit(projectRoutes.create(), { invalid: projectIds.projectForm })
    .setId(projectIds.projectForm)
    .flex().flexCol().gap("4").maxW("lg");
}

export function ProjectNewPage(state: FormProps = {}) {
  return Layout({
    title: "New project",
    children: Div(
      H1("New project").mb("6").text("2xl").font("semibold").text("text"),
      ProjectForm(state),
    ).mx("auto").maxW("3xl").p("6"),
  });
}
```

`views/projects.detail.view.ts` (R3)
```ts
import { Div, H1, H2, P, Span, Button, Dialog, Form, Match, MatchValue } from "fluent-html";
import { Layout } from "../../../core/layout/layout.view.js";
import { dialogStyle, dialogTitle, dialogBody, dialogActions, ghostButton, dangerButton } from "../../../shared/ui/dialog.js";
import { projectRoutes, projectIds } from "../projects.routes.js";
import type { Project, Job } from "../projects.service.js";

export function ProjectDetailPage({ project, job }: { project: Project; job: Job | undefined }) {
  return Layout({
    title: project.name,
    children: Div(
      Div(
        Div(
          H1(project.name).text("2xl").font("semibold").text("text"),
          P(project.description || "No description.").mt("1").text("text-dim"),
        ),
        Button("Delete").setType("button").setCommand("show-modal").setCommandfor(projectIds.projectDeleteDialog)
          .rounded("control").border().border("danger").px("4").py("2").text("danger").cursor("pointer").hover({ bg: "danger/10" }),
      ).flex().items("start").justify("between").gap("4"),
      DeleteProjectDialog({ id: project.id }),
      ProjectStatusBadge({ id: project.id, job }),
    ).mx("auto").maxW("3xl").p("6"),
  });
}

function DeleteProjectDialog({ id }: { id: number }) {
  return Dialog(
    Form(
      H2("Delete this project?").setId(projectIds.projectDeleteTitle).apply(dialogTitle),
      P("Its jobs and files go with it. This cannot be undone.").apply(dialogBody),
      Div(
        Button("Cancel").setType("button").setCommand("close").setCommandfor(projectIds.projectDeleteDialog).apply(ghostButton),
        Button("Delete project").setType("submit").apply(dangerButton),
      ).apply(dialogActions),
    ).submit(projectRoutes.delete({ id })),
  )
    .setId(projectIds.projectDeleteDialog)
    .setClosedby("any")
    .setAria({ labelledby: projectIds.projectDeleteTitle })
    .apply(dialogStyle);
}

/** The polled region. A missing job answers the terminal, trigger-less variant with the same id. */
export function ProjectStatusBadge({ id, job }: { id: number; job: Job | undefined }) {
  const region = Div().setId(projectIds.projectStatus).setRole("status");
  if (!job) return region;
  const polling = job.state === "queued" || job.state === "running";
  return Div(
    Span(MatchValue(job.state, { queued: "Queued", running: `Running, ${job.progress}%`, done: "Finished", failed: "Failed" }))
      .mt("6").inlineFlex().rounded("full").px("3").py("1").text("sm").font("medium")
      .whenMatch(job.state, {
        queued: (t) => t.bg("surface-2").text("text-dim"),
        running: (t) => t.bg("info/10").text("info"),
        done: (t) => t.bg("success/10").text("success"),
        failed: (t) => t.bg("danger/10").text("danger"),
      }),
  )
    .setId(projectIds.projectStatus)
    .setRole("status")
    .when(polling, (t) => t.poll(projectRoutes.status({ id })));
}
```

While writing these I grepped `dist/src/core/*.d.ts` to confirm `srOnly`, `divideY`, `divide`, `maxW` and `inlineFlex` exist. That is the lookup Evidence 1 counts.

### Size, side by side

Commands: `node tools/count.mjs semantic-kit screens/projects.ts` and `node tools/count.mjs fluent-html-8 fh8/projects.*.ts` (outputs in `S/out/count-kit.json`, `S/out/count-fh8.json`). Tokens are TypeScript lexical tokens (the compiler's scanner, comments skipped): a tokenizer-neutral proxy, not model tokens.

| Measure | Page Parts | fluent-html 8 | Ratio |
|---|---|---|---|
| Files | 1 | 6 | 0.17 |
| Bytes | 4,707 | 11,569 | 0.41 |
| Code lines | 100 | 212 | 0.47 |
| TypeScript tokens | 955 | 2,449 | 0.39 |
| Wiring only (parts block against routes + schema + controller), bytes | 1,751 | 4,384 | 0.40 |
| Views only, bytes | 2,956 | 7,185 | 0.41 |
| Imported names plus called member names | 27 | 103 raw; 83 after removing 7 route names and 13 assumed shared stylers | 0.33 |

The wiring ratio is the semantic layer alone. The view ratio mixes class text with the parts (`Search`, `List`, `f.field`, the confirm dialog). Counting prop keys as vocabulary too (28 in mine, about 26 in fluent-html 8's, counted by hand) gives 55 against 109.

## 6. How Tailwind, htmx, routes and fragment ids work

**Tailwind.** Classes are literal Tailwind text in a `class` prop, combined with `cx()` (append only, no merger). Because the text is literal, Tailwind v4 scans the source itself: no extractor, no safelist, no prebuild step. That removes observation 1 (a route named `list` read as a styling method) and the `.select` false positive, which cost 4 to 14 turns per control run. The closed palette stays a hard error through one command, `node tools/check-classes.mjs <theme.css> <files>`, which asks Tailwind's own design system (`__unstable__loadDesignSystem`, tailwindcss 4.3.3) about every class in a class position. On six seeded mistakes it reports six errors, each on one line with the cause, for example `"bg-gray-100": "gray-100" is a palette colour and the theme closed the palette; its colours are: …` and `"hovr:bg-surface-2": the variant "hovr:" does not exist`. On the screens it checks 138 classes with 0 errors in 1.8 s wall at load average 150. Styles for what the parts emit (label, input, error, dialog) are set once in `configure({ styles })`.

What this gives up: a dropped `hover:` or `md:` prefix still compiles and renders wrong, the failure that made the 31. 07. 26 decision score strings 4 against 8 on silent errors. The parts reduce where it can happen (interactive states of fields, buttons and dialogs are styled once), but they do not remove it.

**htmx.** App code contains no `hx-*` text. Each part emits its own:

| Part | Emits |
|---|---|
| `Link` | a real `href` plus `hx-get`, target `#main-content`, `outerMorph show:top`, push; `aria-current="page"` on the current page |
| `Search` | `hx-get` to the page's URL, target the region, `outerMorph`, `input changed delay:300ms, search`, `hx-sync="this:replace"`, push |
| `region.show()` with `poll` | `hx-get`, `every Ns`, `hx-target="this"`, `outerHTML`, only while `while` holds |
| `form.show()` | `method`/`action` and `hx-post`, `hx-target="this"`, `outerMorph`, buttons disabled in flight |
| `action.button()` | a POST form; with `confirm`, an invoker button and a native dialog |
| `refresh(regions)` | one `<template hx type="partial">` per region, `outerHTML` for a polled one |

**Routes.** Only pages have paths. A `:param` without a schema is a compile error. Params and query are coerced by their schemas; a param that fails its schema does not match the page (`/projects/new` and `/projects/:id` with an integer id do not collide). A region is requested at its page's own URL: htmx 4 sends `HX-Target` (`htmx.js:452` in 4.0.0-beta6), the app finds the page's region with that id and answers it alone, and answers set `Vary: HX-Request, HX-Target`. So the search URL is the page URL and can be pushed and shared. Forms and actions post to `?/name` on the page. `redirect()` takes a page and its typed params; a plain string path does not compile into a link or a redirect.

**Fragment ids.** Never written. A region's id is the page's slug plus its name (`projects-rows`); a list row's id is the region's id plus the key; a field's id is the form's id plus the field name; a dialog's id is the action's id plus `-dialog`. The same derivation is used where the element is emitted and where it is targeted, so they cannot disagree.

## 7. Rendering strategy

No retained tree. An element function escapes its children and returns a `View`, an object holding the finished HTML string. Parts concatenate their markup directly. `region.show()` returns a comment marker; after the page's view returns, the app runs all pending region loaders in parallel and replaces each marker (escaped text cannot contain `<!--`, so user data cannot forge one). A region therefore loads its own data, and the page's loader does not have to thread it through.

`NODE_ENV=production node --expose-gc harness.mjs --rounds 11 --sample-ms 300 --json arms/fluent-html-8.mjs ../../semantic-layer/bench-arm.mjs` (run 1 also had `arms/template-literal.mjs`), in `fixtures/bench/`:

| Run | fluent-html 8 (ops/CPU-s) | Page Parts (ops/CPU-s) | Ratio (range) | Allocation per page |
|---|---|---|---|---|
| 1 (`S/out/bench-run1.json`) | 15,110 | 51,674 | 3.42 (3.23 to 4.28) | 57,412 B against 138,552 B |
| 2 (`S/out/bench-run2.json`) | 15,005 | 50,479 | 3.39 (3.00 to 3.88) | 57,231 B against 138,848 B |

The ceiling arm in run 1 was 19.5x. The bench arm (`S/bench-arm.mjs`) uses raw elements with class strings and the `hx()` hatch. Its output equals `expected.fh8.html` once whitespace between tags and the default `type="button"` are ignored (`node test/bench-output.mjs`; 8,312 B against 8,248 B).

## 8. Escaping model

`NODE_ENV=production node ../fixtures/xss/check.mjs xss-adapter.mjs` (output in `S/out/xss-run1.txt`): **0 escapes** (0 xss, 0 css, 0 legacy) on 206 cases. Of 165 scored hostile cases, 155 are safe and 10 are rejected; 0 of 37 benign cases are broken; 4 are unsupported. fluent-html 8 has 18 escapes.

| Sink | Rule | Where fluent-html 8 escaped |
|---|---|---|
| Text, attribute values | One escaper over `& < > " '`; attributes always double-quoted | none |
| Attribute names | A closed typed vocabulary; at runtime a name must match `[a-z][a-z0-9-]*` and `on*`, `hx-*`, `data-*`, `srcdoc`, `srcset` are refused. `data: { key: value }` refuses keys starting with `hx` | `data-hx-on:click`, `data-hx-get="javascript:…"` (4) |
| URLs | The type is `Href`, made by `page.url()`, `asset()`, `external()` or `local()`. Every URL attribute is also checked at runtime: http, https, mailto, tel, relative, and non-SVG media `data:` pass; anything else, or a leading control character, tab or newline, renders `#blocked-url` | `addAttribute` skipped the check |
| htmx URLs | From a part, or `local(path)`: one leading `/`, no backslash, no control character; anything else throws. Requests stay on the origin | `js:` and `javascript:` in `hx-get` (2) |
| htmx confirm | No sink. Confirmation is a native dialog whose text is escaped text | `js:` in `hx-confirm` (2) |
| htmx vals, headers | Objects only, serialized as JSON | none |
| htmx trigger | In `hx()` a filter (`[…]`) is refused: it is JavaScript | not in the set |
| Inline style | An object; a value containing `; { } < > \ " ' @`, a comment, `url(`, `expression(` or `image-set(` is dropped | a second declaration (1) |
| `<style>` | `CssRule(selector, style)` with the same value rule | 5 |
| JSON and data in a script | `JsonData`, `ScriptData`: `<`, `>`, `&`, U+2028 and U+2029 escaped as `\u…` | the `<!--<script>` state (2) |
| User HTML | `Sandbox({ html, title })`: `<iframe sandbox="" srcdoc>` | unsandboxed `srcdoc` (2) |
| Bypass | ``Raw(trustedHtml`…`)``: `trustedHtml` takes a source literal; an interpolation or a plain string does not compile | `Raw` took any string |

Two honest notes. The four `htmx-confirm` cases are unsupported, not passed: the design has no `hx-confirm`. Six contexts (`textarea`, `title`, `input value`, `iframe src`, `form action`, `formaction`) go through the kit's attribute serializer and escaper from inside the adapter, because the prototype's public surface does not export those elements yet; the escaping measured is the kit's, the element functions are not.

## 9. Composition and escape hatches

Composition is ordinary TypeScript. A component is a function returning a `View`. Children are views, strings, numbers, arrays, or `false`/`null`/`undefined`, so `cond && X` and `.map()` work as Claude Code's prior writes them. A style preset is a string constant; a conditional style is `cx("…", active && "…")` or a lookup object. Parts are values that can be exported, imported and passed as typed props (`PagePart<P, Q, D>`, `RegionPart<…>`), and a prop of that type keeps the check at the call site.

Escape hatches, from mild to raw:

1. Raw elements with an attributes object, for any markup a part does not emit.
2. `hx({ get | post: Href, target?, swap?, trigger?, vals?, headers? })` as a `wire` attribute, for an htmx request no part covers.
3. ``Raw(trustedHtml`…`)``, `JsonData`, `ScriptData`, `CssRule`, `Sandbox`.

Designed but not built: `f.label(name)`, `f.control(name)` and `f.error(name)` for a field layout the `field` unit cannot express, still wired; an `input` schema on an action for per-row actions (`add.button({ values: { product: id } }, "Add")`); a standalone `region(path, …)` with its own params; a layout shell; an `endpoint()` for machines (webhooks, CSV).

## 10. The kills

| Kill | Claim | Evidence |
|---|---|---|
| K1 | Pass on output tokens. Turns likely 18 to 23% lower, which may miss alone. | Not measured: bake-off. Mechanism and arithmetic below. |
| K2 | Pass: 3.42x and 3.39x. | Two interleaved runs, section 7. |
| K3 | Pass: 0 escapes; fluent-html 8 has 18. | Section 8. |
| K4 | Pass: 0 errors on 10 files; fluent-html 8 has 12 on the bench page. | `npx html-validate --config .htmlvalidate.json S/out/*.html` (html-validate 11.17.0, `html-validate:recommended`), exit 0. |
| K5 | No worse, expected better. | Not measured: bake-off. Screens compile clean; 18 of 18 seeded mistakes are compile errors. |

**K1 arithmetic** (control: 107 turns, 89.7k output tokens, from Evidence 1):

- Writing views and server code is 26.6k tokens. At the measured 0.39x that is 16k saved; at a cautious 0.5x, 13k (15%).
- Lookups are 18.3k tokens. FHX removed 11.7k by deleting the styling vocabulary alone; class text does the same here. Route, query, controller and form-state lookups (about half the calls) have nothing left to look up; counting half of those gives about 4k more. Together about 17%.
- The extractor false positives (4 to 14 turns per control run) cannot occur.
- Total: roughly 30 to 35% of output tokens, against the 25% bar and a 6% spread. On turns: lookups minus 9 to 15, extractor loops minus 4 to 5, writes and server edits minus 4 to 5, so 17 to 25 of 107.

What would sink it: FHX's lookups moved into its compiler's source because it had no reference. This design has a 6,282 B reference and 27 names, but they are new names. If a run reads the kit's source 8 or more times, or the stateful screen is not at least 25% cheaper, the claim fails.

**K5 mechanism.** `tsc -p probes/tsconfig.json` on `S/probes/mistakes.ts` (output `S/out/mistakes.tsc.txt`): 18 seeded mistakes, 18 errors, median 163 characters, 11 on one line, longest 505. Examples:

- `Type '"search"' is not assignable to type '"q"'.` (a search box bound to a query key the page lacks)
- `Argument of type '"nmae"' is not assignable to parameter of type '"name" | "status"'.`
- `Property 'active' is missing in type '{ draft: string; }' but required in type 'Record<"draft" | "active", string>'.`
- `Object literal may only specify known properties, and 'onclick' does not exist in type 'View | readonly Child[] | ButtonAttrs'.`
- `Type 'View' is missing the following properties from type 'PageView': title, description` (a page's view that is not a document)

Two choices made these short: attribute types are interfaces, so tsc prints `ButtonAttrs` instead of the whole shape, and each element has one signature instead of two overloads, which turned "No overload matches this call" with the fact on line three into one line. The full check (`tsc -p tsconfig.json`) takes 4.1 s wall, 1.3 s CPU, at load average 150.

**Safety parity** (the todo's list of what fluent-html 8 rejects):

| Mistake | Page Parts |
|---|---|
| Unknown class, palette literal, bad variant | `check-classes` error (6 of 6 seeded) |
| Fragment id mismatch | Cannot be written: no ids in app code |
| Wrong route stance | Cannot be written; a redirect to a region and a non-document page view are tsc errors |
| A raw `hx-*` URL | tsc error on the key, and a runtime throw if the type is bypassed |
| Unescaped HTML | tsc error (`Raw` takes a source literal) |
| A bad attribute value | tsc error (unknown key, string `href`, missing `alt`, `on*`) |

Not rejected at compile time: a part with no `.view()` (boot error), a region shown on another page (render error), and a dropped variant prefix (not caught).

## 11. Method choices

1. **A prototype at the design stage.** Type behaviour was probed, not argued: the single-declaration form was abandoned because cross-linked parts need views attached as statements, and the diagnostics table is tsc's real output.
2. **A TypeBox-shaped stand-in for schemas** (`S/kit/schema.ts`), because `@sinclair/typebox` is not installed in fluent-html. The screens read exactly as they would with TypeBox.
3. **Framework-free dispatch.** `app().handle({ method, url, headers, body })` returns `{ status, headers, body }`. A Fastify adapter is a thin wrapper and is not built.
4. **fluent-html 8 screens written, not compiled**, with shared stylers assumed so that styling shared across fields counts for neither side. `sitemap: "exclude"` is on the three page routes because they would not compile without a stance; Page Parts does not model the sitemap stance yet.
5. **TypeScript lexical tokens** as the size proxy, since no model tokenizer was run. Bytes are reported beside them.
6. **`role="list"` is not emitted** on lists: html-validate counts it as a redundant role, and K4 counts errors.

## 12. Gaps and risks

- **K1 and K5 are unmeasured.** Everything about turns and first compile is a mechanism until the bake-off.
- **Not verified in a browser.** The region request by `HX-Target`, `HX-Location` on a 204, the partial template for `refresh()` and the invoker commands are emitted to htmx 4's documented and source-read behaviour, and asserted as strings by `node test/run.ts`, but no browser ran them. `refresh()` and `guard` are implemented and untested.
- **Scope.** This is not only a fluent-html rewrite. It folds the template's routes, controllers and swap verbs into one layer, which is where the evidence says the cost is, and it is a larger change: guards, rate limits (poll regions should take the poll bucket by construction), CSRF, the sitemap stance and the layout shell all have to move.
- **Design fidelity.** A part emits its own structure. A page design whose field or dialog markup differs needs the granular field pieces (not built) or raw elements, which lose the by-construction properties.
- **Silent variant drops** remain possible with class text.
- **New names.** `page`, `region`, `form`, `action`, `.view()`, `.show()` are not in Claude Code's prior. The bet is that 27 names with one exemplar file are learned from the reference in one read.

**If the verdict is harvest, not go:** the parts do not depend on the string renderer or on class text. `page/region/form/action` could be built over fluent-html 8's tags and the template's controllers, keeping typed styling, and would still remove the ids, fragment routes, stances, verb choice and 422 plumbing (the 0.40x wiring ratio). Smaller harvests: `Button` defaulting to `type="button"` (clears the control's 12 html-validate errors), a JSON-in-script helper, `local()` for htmx URLs, refusing `hx` data keys, object-valued `style`, a literal-only `Raw`, and interfaces plus single signatures for shorter diagnostics.

## 13. Files

| Path | What |
|---|---|
| `S/kit/core.ts`, `S/kit/parts.ts`, `S/kit/schema.ts`, `S/kit/index.ts` | The prototype (1,014 lines, `wc -l kit/*.ts`) |
| `S/screens/projects.ts`, `S/screens/data.ts` | The three screens and a stand-in data layer |
| `S/fh8/` | The same screens in fluent-html 8 (not compiled) |
| `S/test/run.ts` | Behaviour test: `node test/run.ts` prints `ok: 3 screens, 9 answers written to out/` |
| `S/bench-arm.mjs`, `S/test/bench-output.mjs` | K2 arm and its output comparison |
| `S/xss-adapter.mjs` | K3 adapter |
| `S/probes/mistakes.ts`, `S/probes/class-mistakes.ts` | Seeded mistakes |
| `S/tools/check-classes.mjs`, `S/tools/theme.css`, `S/tools/count.mjs` | Class check, a closed-palette theme, the size counter |
| `S/REFERENCE.md` | The API reference for a bake-off arm (6,282 B) |
| `S/out/` | Every output quoted above |
