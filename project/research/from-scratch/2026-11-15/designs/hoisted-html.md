# Hoisted HTML

# Hoisted HTML: the render-performance lens

Research only. Nothing in fluent-html's `src/`, releases, `project/pm/`, the template, guidelines or any `CLAUDE.md` was touched, and nothing was committed. Everything is under `/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15/render-perf/` (called `render-perf/` below). Measured at fluent-html `eef033e` (8.1.0 `dist`), Node v26.0.0, load average 118 to 204 throughout.

## 0. What is measured and what is not

| Kill | Status | Result |
|---|---|---|
| K1 | **Predicted only** | Tokens about -23% to -31%, turns about -19% to -29%. Static proxy measured: screens are 0.72x bytes, 0.76x lexical pieces |
| K2 | **Measured** | 13.35x and 14.24x fluent-html 8 (two final runs); 2.78x with the UTF-8 encode included |
| K3 | **Measured** | 0 escapes in 206 cases (fluent-html 8: 18) |
| K4 | **Measured** | 0 errors on the bench page (fluent-html 8: 12) and on 8 screen outputs |
| K5 | **Not measured** | 11/11 seeded type mistakes fail tsc; 12/12 seeded template mistakes found by the checker |

My honest reading: the lens clears K2, K3 and K4 with wide margins, and those results are real. It does **not** by itself deliver K1. View source is only 14% to 17% smaller than fluent-html 8's. The K1 case comes from deleted work (lookups, the extractor loop, hand-written 422 handling), most of which belongs to the route and form layer, not to rendering.

## 1. Thesis

Claude Code's natural output is HTML plus Tailwind class strings (evidence 1, §2: 41 and 39 `.addClass("…")` calls, 0 typed calls with no context). The fastest renderer is also string building (the ceiling arm runs 20x fluent-html 8). Both point at the same surface:

```ts
const Row = (p: Project) => html`
  <li><a href="${projects.detail({ id: p.id })}" class="px-4 py-3 hover:bg-surface-2">${p.name}</a></li>`;
```

- It is ordinary TypeScript. There is no file format, no compiler step and no generated file (the FHX rabbit hole).
- Each call site is compiled **once**, on first use, into static string segments and one context code per hole. That compile is an HTML tokenizer, so it is also where every structural and security rule runs. Rules cost nothing per render.
- The same `compile()` runs in a static checker (`hh check`) over every template in the source, without running the app.
- Tailwind's own scanner reads the class text directly. There is no extractor and no safelist.

## 2. What fluent-html 8 allocates per node today

Command: `NODE_ENV=production node --expose-gc render-perf/bench/fh8-alloc.mjs` (bytes are the delta of `v8.getHeapStatistics().total_allocated_bytes`; output in `render-perf/out/fh8-alloc.txt`).

| Measure | Bytes | Per element (162) |
|---|---|---|
| fluent-html 8 bench page, build the tree | 63,376 | **391** |
| fluent-html 8 bench page, serialize a prebuilt tree | 66,682 | **412** |
| fluent-html 8 bench page, build + serialize | 135,454 | **836** |
| Hoisted HTML bench page, build + serialize | 12,086 | 75 |
| `Div()` | 145 | |
| `Div("x")` | 215 | |
| `Div("x").p("4")` | 263 | |
| `Div("x").p("4").bg("white").shadow("md")` | 484 | |
| `Img().addAttribute("src", s).addAttribute("alt", s)` | 315 | |
| `Button("x").setHtmx(assetUrl(u), { method, swap })` | 355 | |

Where the bytes go, from the source:

**Building (391 B per element).**
- Two rest-parameter arrays per element: `Div(...children)` calls `El(el, ...children)` (`src/core/utils.ts:8`), which calls `new Tag(element, ...children)` (`src/core/tag.ts:89`).
- The `Tag` object itself, with `el`, `child`, `_variantPrefix`, `_e`, `_p`, and later `_class`, `_id`, `_htmx`, `attributes` added by setters.
- Each styling call builds a class token and a new concatenated `_class` string (`addClass`, `src/core/tag.ts:161`). The measured step is about 48 B for the first call and about 110 B for each later one.
- `addAttribute` allocates a null-prototype dictionary per tag (`src/core/tag.ts:231`). `setHtmx` allocates a config object.

**Serializing (412 B per element).**
- A `{ v, c }` frame object for every tag and for every child value (`src/render/serialize.ts:432`, `:440`, `:444`).
- A close-tag string per element (`'</' + el + '>'`, `:431`) and a `'\n'` push between siblings (`:445`).
- The open tag built by concatenation in `buildAttrs`, an `Object.keys()` array per tag with bag attributes (`:248`), a `Set` per tag with toggles (`:269`).
- The sink's `+=` rope nodes.

So about half of fluent-html 8's allocation is the retained tree and half is walking it. A design with no tree removes both.

## 3. The API (enough for the three screens)

The full reference for a trial arm is `render-perf/reference.md`: **7,835 B** (`wc -c`), against the 56,541 B cap.

### Templates

| Name | What it does |
|---|---|
| `` html`…` `` | A view. Returns an `Html` value. A component is a function that returns one |
| `` at(ids.x)`…` `` | The same, but the template's single root element gets that id and the value is typed `Rooted<"x">` |
| `` tw`…` `` | Class text that lives outside a template (a constant, a `match` arm). The checker reads it |
| `match(value, { a, b })` | Exhaustive pick on a string union. A missing case is a compile error |
| `css({ width: "40%" })` | A typed inline style |
| `attrs({ [name]: value })` | Attributes whose names come from code or data |
| `trustedHtml(markup, reason)` | The one declared bypass |

What a hole accepts depends on its position, decided at template compile:

| Position | Accepts | Written as |
|---|---|---|
| Text | string, number, `Html`, arrays of those; `false`/`null`/`undefined` print nothing | Escaped text |
| Whole attribute `title="${x}"` | string, number, id. `null`/`undefined`/`false` drop the attribute, `true` prints it bare | Escaped. `aria-*` and `data-*` print booleans as text |
| Part of an attribute `class="btn ${x}"` | string, number, array of class names | Escaped |
| `href`, `src`, `action`, `formaction`, `poster`, … | A route or a URL string | Scheme allow-list |
| `hx-get`, `hx-post`, … | A route | URL plus the route's target and swap |
| `hx-vals`, `hx-headers` | An object | JSON |
| `style="…${x}"` | One CSS value, or `css({…})` for the whole attribute | Validated |
| Between attributes `<input ${x}>` | `attrs()`, an `hx.*` verb, `f.field()`, `f.label()` | Attributes |
| Inside `<script>` | Any JSON value | Script-safe JSON |

### Routes, ids, htmx, forms, handlers

| Name | What it does |
|---|---|
| `defineIds("project-list", …)` | Typed ids: `ids.projectList` |
| `defineRoutes(prefix, defs)` | A def holds `method`, `path`, `params`, `query`, `body` (schema), `fragment` (the id a success answers), `invalid` (the id a 422 answers), `machine` |
| `routes.detail({ id })` | A route call. Params and query are one flat object |
| `hx.search(route, delayMs?)` | Debounced filter; newest request wins |
| `hx.poll(route, every?)` | Self-refresh; stops when rendered without it. Needs a fragment route |
| `hx.defer(route)` | A region loaded after the page |
| `form(routes.create, state)` | `f.field(name)`, `f.label(name)`, `f.error(name)`, `f.value(name)`, `f.options(name, labels)`, all typed from the route's body schema |
| `controller(routes, entries)` | One entry per route. The allowed return type follows from the route |
| `page(title, view)`, `redirect(route)`, `invalid(errors)` | Handler answers |

## 4. The three screens

All three are in one feature. Both versions use the same theme tokens and render equivalent markup. Source: `render-perf/screens/` (mine) and `render-perf/fh8-screens/src/app/projects/` (control).

### 4.1 Hoisted HTML

`projects.routes.ts`

```ts
import { defineIds, defineRoutes, t } from "../src/hx.ts";

export const ids = defineIds("project-list", "project-form", "job-status", "delete-dialog");

export const CreateProject = t.object(
  {
    name: t.string({ minLength: 3, maxLength: 80 }),
    ownerEmail: t.string({ format: "email" }),
    status: t.enum(["active", "paused"]),
    notes: t.string({ maxLength: 500 }),
  },
  { optional: ["notes"] },
);

export const projects = defineRoutes("/projects", {
  list: { query: { q: "string" } },
  rows: { path: "/rows", query: { q: "string" }, fragment: ids.projectList },
  new: { path: "/new" },
  create: { method: "post", body: CreateProject, invalid: ids.projectForm },
  detail: { path: "/:id", params: { id: "number" } },
  status: { path: "/:id/status", params: { id: "number" }, fragment: ids.jobStatus },
  remove: { method: "delete", path: "/:id", params: { id: "number" } },
});
```

`projects.views.ts`

```ts
import { at, html, match, tw } from "../src/hh.ts";
import { form, hx, type FieldError, type FormState, type Static } from "../src/hx.ts";
import { CreateProject, ids, projects } from "./projects.routes.ts";

export type Project = { id: number; name: string; owner: string; status: "active" | "paused" };
export type Job = { state: "queued" | "running" | "done" | "failed"; progress: number };

// R1: project list

const ProjectRow = (p: Project) => html`
  <li>
    <a href="${projects.detail({ id: p.id })}" class="flex items-center justify-between px-4 py-3 hover:bg-surface-2">
      <span class="font-medium text-ink">${p.name}</span>
      <span class="text-sm text-dim">${p.owner}</span>
    </a>
  </li>`;

export const ProjectList = (p: { projects: Project[] }) => at(ids.projectList)`
  <div class="rounded-card border border-line bg-surface">
    ${p.projects.length === 0
      ? html`<p class="p-8 text-center text-dim">No projects match your search.</p>`
      : html`<ul class="divide-y divide-line">${p.projects.map(ProjectRow)}</ul>`}
  </div>`;

export const ProjectListPage = (p: { q?: string | null; projects: Project[] }) => html`
  <section class="mx-auto flex max-w-3xl flex-col gap-4 p-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-ink">Projects</h1>
      <a href="${projects.new()}" class="rounded-control bg-primary px-4 py-2 text-on-accent hover:bg-primary-700">New project</a>
    </div>
    <input ${hx.search(projects.rows())} type="search" name="q" value="${p.q}" aria-label="Search projects"
      placeholder="Search projects" class="w-full rounded-control border border-line px-3 py-2">
    ${ProjectList(p)}
  </section>`;

// R2: create form

const label = tw`block text-sm font-medium text-ink`;
const control = tw`mt-1 w-full rounded-control border border-line px-3 py-2 aria-invalid:border-danger`;

const FieldMessage = (e: FieldError | undefined) => e && html`<p id="${e.id}" class="mt-1 text-sm text-danger">${e.message}</p>`;

export const ProjectForm = (state: FormState<Static<typeof CreateProject>>) => {
  const f = form(projects.create, state);
  return at(ids.projectForm)`
    <form action="${projects.create()}" class="flex flex-col gap-4">
      <div>
        <label ${f.label("name")} class="${label}">Name</label>
        <input ${f.field("name")} class="${control}">
        ${FieldMessage(f.error("name"))}
      </div>
      <div>
        <label ${f.label("ownerEmail")} class="${label}">Owner email</label>
        <input ${f.field("ownerEmail")} class="${control}">
        ${FieldMessage(f.error("ownerEmail"))}
      </div>
      <div>
        <label ${f.label("status")} class="${label}">Status</label>
        <select ${f.field("status")} class="${control}">${f.options("status", { active: "Active", paused: "Paused" })}</select>
        ${FieldMessage(f.error("status"))}
      </div>
      <div>
        <label ${f.label("notes")} class="${label}">Notes</label>
        <textarea ${f.field("notes")} rows="4" class="${control}">${f.value("notes")}</textarea>
        ${FieldMessage(f.error("notes"))}
      </div>
      <button type="submit" class="rounded-control bg-primary px-4 py-2 text-on-accent hover:bg-primary-700">Create project</button>
    </form>`;
};

export const NewProjectPage = () => html`
  <section class="mx-auto flex max-w-xl flex-col gap-6 p-6">
    <h1 class="text-2xl font-bold text-ink">New project</h1>
    ${ProjectForm({})}
  </section>`;

// R3: project detail

const running = (job: Job) => job.state === "queued" || job.state === "running";

export const JobStatus = (p: { projectId: number; job: Job }) => at(ids.jobStatus)`
  <span ${running(p.job) && hx.poll(projects.status({ id: p.projectId }), "2s")}
    class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${match(p.job.state, {
      queued: tw`bg-surface-2 text-dim`,
      running: tw`bg-info/10 text-info`,
      done: tw`bg-success/10 text-success`,
      failed: tw`bg-danger/10 text-danger`,
    })}">
    ${match(p.job.state, {
      queued: "Queued",
      running: () => `Running, ${p.job.progress}%`,
      done: "Finished",
      failed: "Failed",
    })}
  </span>`;

export const ProjectDetailPage = (p: { project: Project; job: Job }) => html`
  <section class="mx-auto flex max-w-3xl flex-col gap-6 p-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-ink">${p.project.name}</h1>
      <button type="button" command="show-modal" commandfor="${ids.deleteDialog}"
        class="rounded-control border border-danger px-4 py-2 text-danger hover:bg-danger/10">Delete</button>
    </div>
    <p class="text-dim">Owner: ${p.project.owner}</p>
    <p class="flex items-center gap-2 text-sm text-dim">Import job ${JobStatus({ projectId: p.project.id, job: p.job })}</p>
    <dialog id="${ids.deleteDialog}" closedby="any" aria-labelledby="delete-title" class="rounded-card p-6">
      <h2 id="delete-title" class="text-lg font-bold text-ink">Delete ${p.project.name}?</h2>
      <p class="mt-2 text-dim">This removes the project and its jobs. It cannot be undone.</p>
      <div class="mt-6 flex justify-end gap-3">
        <button type="button" command="close" commandfor="${ids.deleteDialog}" class="rounded-control px-4 py-2 text-dim hover:bg-surface-2">Cancel</button>
        <button type="button" hx-delete="${projects.remove({ id: p.project.id })}"
          class="rounded-control bg-danger px-4 py-2 text-on-accent">Delete project</button>
      </div>
    </dialog>
  </section>`;
```

`projects.controller.ts`

```ts
import { controller, invalid, page, redirect } from "../src/hx.ts";
import { projects } from "./projects.routes.ts";
import { JobStatus, NewProjectPage, ProjectDetailPage, ProjectForm, ProjectList, ProjectListPage } from "./projects.views.ts";
import * as store from "./store.ts";

export default controller(projects, {
  list: ({ query }) => page("Projects", ProjectListPage({ q: query.q, projects: store.search(query.q) })),
  rows: ({ query }) => ProjectList({ projects: store.search(query.q) }),
  new: () => page("New project", NewProjectPage()),
  create: {
    form: ProjectForm,
    valid: ({ body }) => {
      if (store.nameTaken(body.name)) return invalid({ name: "A project with this name exists" });
      return redirect(projects.detail({ id: store.create(body).id }));
    },
  },
  detail: ({ params }) => {
    const project = store.get(params.id);
    return page(project.name, ProjectDetailPage({ project, job: store.job(params.id) }));
  },
  status: ({ params }) => JobStatus({ projectId: params.id, job: store.job(params.id) }),
  remove: ({ params }) => {
    store.remove(params.id);
    return redirect(projects.list());
  },
});
```

**What it renders** (`node render-perf/screens/run.mjs`, outputs in `render-perf/out/r*.html`). The invalid submit answers 422 with the form region alone:

```html
<form id="project-form" action="/projects" method="post" hx-post="/projects" hx-target="#main" hx-swap="outerMorph show:top" hx-push-url="true" hx-status:422="swap:outerMorph target:#project-form push:false" class="flex flex-col gap-4">
<div>
<label for="name" class="block text-sm font-medium text-ink">Name</label>
<input id="name" name="name" required minlength="3" maxlength="80" aria-invalid="true" aria-describedby="name-error" type="text" value="ab" class="mt-1 w-full …">
<p id="name-error" class="mt-1 text-sm text-danger">At least 3 characters</p>
```

The author wrote `<form action="${projects.create()}">` and `<input ${f.field("name")}>`. The rest comes from the route and the schema. The valid submit answers `303 /projects/3`. The running badge carries `hx-get="/projects/1/status" hx-trigger="every 2s" hx-target="this" hx-swap="outerHTML"`; the finished one renders without them, which stops the poll.

### 4.2 fluent-html 8 (template conventions)

`projects.routes.ts`

```ts
import { defineIds, defineRoutes } from "fluent-html";

export const ids = defineIds(["project-list", "project-form", "job-status", "delete-dialog"] as const);

export const projectRoutes = defineRoutes("/projects", {
  list: { path: "/", query: { q: "string" } as const },
  rows: { path: "/rows", query: { q: "string" } as const, render: ids.projectList },
  new: { path: "/new" },
  create: { method: "post", path: "/" },
  detail: { path: "/:id", params: { id: "number" } as const },
  status: { path: "/:id/status", params: { id: "number" } as const, render: ids.jobStatus },
  remove: { method: "delete", path: "/:id", params: { id: "number" } as const },
} as const);
```

`projects.schema.ts`

```ts
import { Type, type Static } from "@sinclair/typebox";

export const CreateProjectBody = Type.Object({
  name: Type.String({ minLength: 3, maxLength: 80 }),
  ownerEmail: Type.String({ format: "email" }),
  status: Type.Union([Type.Literal("active"), Type.Literal("paused")]),
  notes: Type.Optional(Type.String({ maxLength: 500 })),
});
export type CreateProjectReq = Static<typeof CreateProjectBody>;

const ListQuerystring = Type.Object({ q: Type.Optional(Type.String()) });
export const listQuerySchema = { querystring: ListQuerystring };

const IdParams = Type.Object({ id: Type.Number() });
export const idParamsSchema = { params: IdParams };
```

`projects.views.ts`

```ts
import {
  A, Button, Dialog, Div, ForEachKeyed, Form, H1, H2, IfThenElse, Input, Li, MatchValue, P, Section, Span, Ul,
  type FormState,
} from "fluent-html";
import type { Styler } from "../../shared/stylers.js";
import { Layout } from "../../core/layout/layout.view.js";
import { ids, projectRoutes } from "./projects.routes.js";
import type { CreateProjectReq } from "./projects.schema.js";

export type Project = { id: number; name: string; owner: string; status: "active" | "paused" };
export type Job = { state: "queued" | "running" | "done" | "failed"; progress: number };

const primaryButton: Styler = (t) => t.rounded("control").bg("primary").px("4").py("2").text("on-accent").hover({ bg: "primary-700" });

// R1: project list

function ProjectRow(p: Project) {
  return Li(
    A(
      Span(p.name).font("medium").text("ink"),
      Span(p.owner).text("sm").text("text-dim"),
    )
      .nav(projectRoutes.detail({ id: p.id }))
      .flex().items("center").justify("between").px("4").py("3")
      .hover({ bg: "surface-2" }),
  );
}

export function ProjectList({ projects }: { projects: Project[] }) {
  return Div(
    IfThenElse(
      projects.length > 0,
      () => Ul(ForEachKeyed(projects, (p) => p.id, ProjectRow)).divideY().divide("line"),
      () => P("No projects match your search.").p("8").text("center").text("text-dim"),
    ),
  )
    .setId(ids.projectList)
    .rounded("card").border().border("line").bg("surface");
}

export function ProjectListPage({ q, projects }: { q?: string; projects: Project[] }) {
  return Layout({
    title: "Projects",
    children: Section(
      Div(
        H1("Projects").text("2xl").font("bold").text("ink"),
        A("New project").nav(projectRoutes.new()).apply(primaryButton),
      ).flex().items("center").justify("between"),
      Input()
        .setType("search").setName("q").setValue(q ?? "").setPlaceholder("Search projects")
        .setAria({ label: "Search projects" })
        .search(ids.projectList, projectRoutes.rows())
        .w("full").rounded("control").border().border("line").px("3").py("2"),
      ProjectList({ projects }),
    ).mx("auto").maxW("3xl").flex().flex("col").gap("4").p("6"),
  });
}

// R2: create form

const label: Styler = (t) => t.block().text("sm").font("medium").text("ink");
const control: Styler = (t) =>
  t.mt("1").w("full").rounded("control").border().border("line").px("3").py("2").variant("aria-[invalid=true]", { border: "danger" });
const message: Styler = (t) => t.mt("1").text("sm").text("danger");

export function ProjectForm(state: FormState<CreateProjectReq> = {}) {
  return Form<CreateProjectReq>(state, (f) => [
    Div(
      f.label("name", "Name").apply(label),
      f.input("name", "text").toggle("required").setMinlength(3).setMaxlength(80).apply(control),
      Div(f.error("name")).apply(message),
    ),
    Div(
      f.label("ownerEmail", "Owner email").apply(label),
      f.input("ownerEmail", "email").toggle("required").apply(control),
      Div(f.error("ownerEmail")).apply(message),
    ),
    Div(
      f.label("status", "Status").apply(label),
      f.select("status", [
        { value: "active", label: "Active" },
        { value: "paused", label: "Paused" },
      ]).toggle("required").apply(control),
      Div(f.error("status")).apply(message),
    ),
    Div(
      f.label("notes", "Notes").apply(label),
      f.textarea("notes").setRows(4).setMaxlength(500).apply(control),
      Div(f.error("notes")).apply(message),
    ),
    Button("Create project").setType("submit").apply(primaryButton),
  ])
    .setId(ids.projectForm)
    .nav(projectRoutes.create(), { invalid: ids.projectForm })
    .flex().flex("col").gap("4");
}

export function NewProjectPage(state: FormState<CreateProjectReq> = {}) {
  return Layout({
    title: "New project",
    children: Section(
      H1("New project").text("2xl").font("bold").text("ink"),
      ProjectForm(state),
    ).mx("auto").maxW("xl").flex().flex("col").gap("6").p("6"),
  });
}

// R3: project detail

const isRunning = (job: Job) => job.state === "queued" || job.state === "running";

export function JobStatus({ projectId, job }: { projectId: number; job: Job }) {
  return Span(
    MatchValue(job.state, {
      queued: "Queued",
      running: `Running, ${job.progress}%`,
      done: "Finished",
      failed: "Failed",
    }),
  )
    .setId(ids.jobStatus)
    .when(isRunning(job), (t) => t.poll(projectRoutes.status({ id: projectId }), "2s"))
    .inlineFlex().items("center").gap("2").rounded("full").px("3").py("1").text("sm")
    .whenMatch(job.state, {
      queued: (t) => t.bg("surface-2").text("text-dim"),
      running: (t) => t.bg("info/10").text("info"),
      done: (t) => t.bg("success/10").text("success"),
      failed: (t) => t.bg("danger/10").text("danger"),
    });
}

export function ProjectDetailPage({ project, job }: { project: Project; job: Job }) {
  return Layout({
    title: project.name,
    children: Section(
      Div(
        H1(project.name).text("2xl").font("bold").text("ink"),
        Button("Delete")
          .setType("button").setCommand("show-modal").setCommandfor(ids.deleteDialog)
          .rounded("control").border().border("danger").px("4").py("2").text("danger").cursor("pointer")
          .hover({ bg: "danger/10" }),
      ).flex().items("center").justify("between"),
      P(`Owner: ${project.owner}`).text("text-dim"),
      P("Import job ", JobStatus({ projectId: project.id, job })).flex().items("center").gap("2").text("sm").text("text-dim"),
      Dialog(
        H2(`Delete ${project.name}?`).setId("delete-title").text("lg").font("bold").text("ink"),
        P("This removes the project and its jobs. It cannot be undone.").mt("2").text("text-dim"),
        Div(
          Button("Cancel")
            .setType("button").setCommand("close").setCommandfor(ids.deleteDialog)
            .rounded("control").px("4").py("2").text("text-dim").cursor("pointer")
            .hover({ bg: "surface-2" }),
          Button("Delete project")
            .setType("button")
            .submit(projectRoutes.remove({ id: project.id }))
            .rounded("control").bg("danger").px("4").py("2").text("on-accent"),
        ).mt("6").flex().justify("end").gap("3"),
      )
        .setId(ids.deleteDialog).setClosedby("any").setAria({ labelledby: "delete-title" })
        .rounded("card").p("6"),
    ).mx("auto").maxW("3xl").flex().flex("col").gap("6").p("6"),
  });
}
```

`projects.controller.ts`

```ts
import { Value } from "@sinclair/typebox/value";
import type { ErrorBag } from "fluent-html";
import { defineController, page } from "../../core/render/define-controller.js";
import { ids, projectRoutes } from "./projects.routes.js";
import { CreateProjectBody, idParamsSchema, listQuerySchema, type CreateProjectReq } from "./projects.schema.js";
import { JobStatus, NewProjectPage, ProjectDetailPage, ProjectForm, ProjectList, ProjectListPage } from "./projects.views.js";
import * as store from "./projects.service.js";

function fieldErrors(body: unknown): ErrorBag<CreateProjectReq> {
  const errors: ErrorBag<CreateProjectReq> = {};
  for (const e of Value.Errors(CreateProjectBody, body)) {
    const field = e.path.slice(1) as keyof CreateProjectReq;
    errors[field] ??= e.message;
  }
  return errors;
}

export default defineController(projectRoutes, {
  list: {
    schema: listQuerySchema,
    GET: async (request, reply) =>
      reply.renderPage(ProjectListPage({ q: request.query.q, projects: await store.search(request.server.prisma, request.query.q) })),
  },
  rows: {
    schema: listQuerySchema,
    GET: async (request, reply) =>
      reply.renderFragment(ids.projectList, ProjectList({ projects: await store.search(request.server.prisma, request.query.q) })),
  },
  new: page(NewProjectPage),
  create: {
    POST: async (request, reply) => {
      const values = request.body as Partial<CreateProjectReq>;
      const errors = fieldErrors(request.body);
      if (Object.keys(errors).length === 0 && (await store.nameTaken(request.server.prisma, values.name!))) {
        errors.name = "A project with this name exists";
      }
      if (Object.keys(errors).length > 0) {
        return reply.renderInvalid({ fragment: [ids.projectForm, ProjectForm], page: NewProjectPage }, { values, errors });
      }
      const project = await store.create(request.server.prisma, values as CreateProjectReq);
      return reply.redirect(projectRoutes.detail.resolve({ id: project.id }));
    },
  },
  detail: {
    schema: idParamsSchema,
    GET: async (request, reply) => {
      const project = await store.get(request.server.prisma, request.params.id);
      return reply.renderPage(ProjectDetailPage({ project, job: await store.job(request.server.prisma, request.params.id) }));
    },
  },
  status: {
    schema: idParamsSchema,
    GET: async (request, reply) =>
      reply.renderFragment(ids.jobStatus, JobStatus({ projectId: request.params.id, job: await store.job(request.server.prisma, request.params.id) })),
  },
  remove: {
    schema: idParamsSchema,
    DELETE: async (request, reply) => {
      await store.remove(request.server.prisma, request.params.id);
      return reply.redirect(projectRoutes.list.resolve());
    },
  },
});
```

**How far the control was checked.** The routes, schema and views type-check against fluent-html 8.1.0's own declarations (`tsc -p render-perf/fh8-screens/tsconfig.json`, exit 0), with stand-ins for the template's verbs, `Layout`, `Styler` and TypeBox. The verb stand-ins do not reproduce the stance checks. The controller is **not** type-checked: it needs the template's `defineController`. In the template a schema failure answers a 400 page (`core/server/server.ts:414`), so per-field 422s are hand-built; I used `Value.Errors` as the cheapest honest form.

**An observation from writing the control (n = 1, me, so anecdote only).** With the 56 KB reference and `CLAUDE.md` in context, my first `tsc` of the fluent-html 8 views had six vocabulary errors, and fixing them took five lookups in `dist/*.d.ts`:

| I wrote | fluent-html 8.1.0 has |
|---|---|
| `import { type Styler } from "fluent-html"` | `Styler` is a template type (`src/shared/stylers.ts`) |
| `.flexCol()` | `.flex("col")` |
| `.divide("y")` | `.divideY()` |
| `f.error("name").apply(message)` | `f.error()` returns a `View`; it cannot be styled |
| `.variant("aria-invalid", …)` | `"aria-[invalid=true]"` (the same item cost 3 turns in both T arms) |
| `.backdrop({ bg: "ink/40" })` | No backdrop variant at all. I dropped it from both versions |

My own screens passed their first `tsc`, but I designed that API, so that comparison proves nothing. The table is the useful part: it is the lookup cost of row 1 in evidence 1, reproduced.

### 4.3 Source size

Command: `python3 -I render-perf/tools/size.py` (comment and blank lines dropped). Neither column is a tokenizer. "Pieces" counts each run of letters, run of digits, or punctuation character as one.

| Part | Hoisted B | fh8 B | Ratio | Hoisted pieces | fh8 pieces | Ratio |
|---|---|---|---|---|---|---|
| Routes + schema | 896 | 1,317 | 0.68 | 303 | 404 | 0.75 |
| Views, all | 5,492 | 6,372 | **0.86** | 1,928 | 2,313 | **0.83** |
| Views, R1 list | 1,292 | 1,454 | 0.89 | 464 | 525 | 0.88 |
| Views, R2 form | 1,749 | 1,776 | 0.98 | 624 | 648 | 0.96 |
| Views, R3 detail | 2,056 | 2,424 | 0.85 | 716 | 899 | 0.80 |
| Controller | 1,153 | 2,765 | **0.42** | 349 | 691 | **0.51** |
| Total | 7,541 | 10,454 | **0.72** | 2,580 | 3,408 | **0.76** |

HTML's closing tags and attribute names cost almost what the fluent chain's punctuation costs. The form screen is a tie. The saving is in the controller, where the framework owns validation and the 422.

## 5. How Tailwind, htmx, routes and fragment ids work

### Tailwind

- Classes are literal text in the template, or in a `` tw`…` `` constant.
- **Tailwind scans the source itself.** Command: `node render-perf/tools/tw-probe.mjs` (Tailwind 4.3.3, borrowed from a sibling project's install). Its scanner found the classes inside `html`` ` templates in the `.ts` screens, and its design system judged them in 41 ms. There is no extractor, no safelist prebuild and no `@source inline`.
- **The closed palette is enforced by Tailwind's own verdict.** With `--color-*: initial` in the theme, `candidatesToCss` returns nothing for `bg-gray-100`, `text-green-600` and the typo `bg-primry`, and CSS for `rounded-control`, `bg-success/10`, `aria-invalid:border-danger`. `hh check` turns a null verdict into a finding that lists the theme's colors.
- A class built from pieces (`bg-${tone}/10`) leaves a broken token in the static text, so the checker flags it and names `match()` as the fix.
- Variants are Tailwind's own spelling (`hover:`, `aria-invalid:`, `md:`). There is no variant vocabulary to learn or to be missing.
- What is lost: the typed per-utility methods and the tsc-time palette error. The error moves to `hh check`.

### Routes

One definition holds the whole protocol: method, path, params, query, body schema, what a success answers (`fragment: ids.x`, or a page by default, or `machine`), and what a 422 answers (`invalid: ids.x`). Args are one flat object: `projects.detail({ id })`, `projects.rows({ q })`. Strings that depend only on the definition (target, swap, the 422 routing) are built once in `defineRoutes`.

### htmx

The call site never writes a target, a swap or an id, because the route knows them. There are three tiers:

1. **`href="${route}"` on a link and `action="${route}"` on a form.** The hole knows its tag and attribute, so a route there expands to the URL plus the htmx attributes: a page swap with history for a link; method, `hx-post` and the 422 routing for a form. The link keeps a real `href`, so it works without JavaScript and for crawlers.
2. **`hx-get="${route}"`, `hx-post="${route}"`, `hx-delete="${route}"`.** The route adds its target and swap. A method mismatch throws and names the attribute to write.
3. **`hx.search`, `hx.poll`, `hx.defer`.** The patterns whose protocol is easy to get wrong (sync replace, `outerHTML` for pollers), as attribute sets for the between-attributes position.

Other htmx attributes are plain HTML in the template (`hx-confirm="Delete ${name}?"`). Dialogs and popovers are native HTML.

**Not verified:** the emitted `hx-*` strings follow the template's verb table but were not run in a browser.

### Fragment ids

- `` at(ids.projectList)`<div class="…">…</div>` `` stamps the id on the template's one root element at compile time and returns `Rooted<"project-list">`. The brand is true by construction, because the function writes the id.
- A fragment route's handler must return that type. Measured in `render-perf/screens/negative.ts`: a wrong id is `Type 'Rooted<"job-status">' is not assignable to type 'Rooted<"project-list">'`.
- An id mismatch between a verb and its route cannot be written, because the verb takes no id.

### Forms and handlers

- `form(projects.create, state)` reads the route's body schema. `f.field("name")` emits `id`, `name`, `type`, `required`, `minlength`, `maxlength`, the value, and `aria-invalid` plus `aria-describedby` on error. The static part is built once per schema.
- For a route with `body` and `invalid`, the handler entry is `{ form, valid }`. The framework validates, and on failure calls `form` with the values and errors and answers 422. `valid` sees only a typed, valid body.
- **Prototype limits:** the schema is a 40-line stand-in for TypeBox and the dispatcher is a stand-in for Fastify. Only the htmx 422 path is built; the no-JavaScript full-page 422 is not.

## 6. The rendering strategy

**Compile once per call site.** `html` receives the call site's `TemplateStringsArray`, which JavaScript guarantees is one frozen object per site. It is the key of a `WeakMap` to the compiled template: the static segments (rewritten once) and one small integer per hole.

**What the compile does to the static text, once:**
- Collapses a whitespace run containing a newline to one newline, and drops the template's leading and trailing whitespace. Source indentation never reaches the wire.
- Collapses whitespace between attributes and inside `class`.
- Moves a whole-attribute hole's ` name="` into the hole, so the attribute can be omitted.
- For `at(id)`, splits the root tag so the id is one concatenation.

**A render** is `statics[0] + hole(0) + statics[1] + …`. A string in a text position takes the fast path (a regex test, then `replace` only if needed). A template with no holes returns one cached value: fully static components allocate nothing.

**No per-node objects.** One `Html` wrapper per template call, not per element: 27 on the bench page against 162 elements.

**Hoisting at the semantic level.** Route tails and per-schema field attributes are strings built at definition time.

**Cold cost.** Compiling the product-card template (488 characters, 5 holes) takes about 100 to 160 µs wall, under load, once per call site per process (`render-perf/bench/wire.mjs`). No build step is needed.

**Streaming.** `` stream`…` `` uses the same compiled template; a text hole may be a promise. Static text up to the first pending hole is flushed at once. The smoke test yields `["<main><h1>T</h1>", "<p>late</p></main>"]` (`node render-perf/smoke.mjs`). This is a sketch: no backpressure, no measurement. For 8 KB htmx pages it only matters when a hole waits on I/O.

**Rope or flat string: an honest complication.** The K2 harness reads `.length`, so V8 never flattens the result. A server writes bytes. I measured both (`NODE_ENV=production node --expose-gc render-perf/bench/wire.mjs`, interleaved, ops per CPU-second, `Buffer.from(render(build()))`):

| Arm | Harness ratio vs fh8 (K2 metric) | With UTF-8 encode | Alloc B/op |
|---|---|---|---|
| fluent-html 8 | 1 | 1 (8,870 ops/CPU-s) | 138,619 to 139,021 |
| Hoisted HTML, `+=` (default) | 14.24 and 13.35 | **2.78** (2.72 to 3.01) | 11,804 to 12,011 |
| Hoisted HTML, `Array.join` variant | 4.33 and 3.93 | **3.22** (3.12 to 3.42) | 48,017 to 48,129 |
| Template-literal ceiling | 21.86 and 20.04 | 4.46 (4.24 to 4.74) | 13,454 |

Flattening and encoding cost about 33 µs for every arm, including fluent-html 8, and that fixed cost is most of the real request. The join variant builds slower but hands V8 a flat string, so it wins once bytes are counted. The bake-off should pick by the encode-inclusive figure. Either way K2 holds.

**Not tried:** writing pre-encoded static bytes into a buffer. Children are evaluated before their parent's template function runs, so they must return values; and many small `Buffer` writes cross into C++. It is not obviously a win, and I did not measure it.

## 7. The escaping model

The rule: **the hole's position decides the escaping, once, at template compile.** This is contextual auto-escaping, as in Go's `html/template`.

| Context | Rule |
|---|---|
| Text, `<textarea>`, `<title>` | Escape `& < > " '` |
| Attribute value | Same escape. An unquoted whole value gets quotes; an unquoted partial value is refused |
| URL attributes (`href`, `src`, `action`, `formaction`, `poster`, `cite`, `data`, `ping`, `background`, `xlink:href`, `srcset`, …) | Scheme allow-list (http, https, mailto, tel, sms, safe `data:` media). Anything else gets an `unsafe:` prefix. A hole after static text needs a static prefix starting with `/`, `#`, `?` or `https://` |
| `hx-get`/`post`/`put`/`patch`/`delete` | A route, or a string starting with `/`, `?`, `#`, `./` or `http(s)://`. Otherwise it throws |
| `hx-vals`, `hx-headers`, `hx-config` | Objects only, as JSON. A string is refused, so `js:` cannot arrive |
| `hx-confirm` | A `js:`/`javascript:` prefix throws when the hole starts the value. With static text first (`"Delete ${name}?"`) the value cannot start with it |
| `hx-trigger`, `on*`, `hx-on*` | No holes. `on*` and `hx-on*` are refused even as static text |
| `<script>` | The hole is JSON with `<`, `>`, `&`, U+2028 and U+2029 escaped. This closes the `<!--<script>` double-escape case |
| `<style>` and `style="…"` | One CSS value: a character allow-list and a function allow-list. No declaration, rule, comment, escape or `url()` gets through |
| `<iframe srcdoc="${x}">` | Needs a static `sandbox` without `allow-scripts`, or the template does not compile |
| Attribute or element name | Never from a hole. `attrs()` validates names and refuses `on*`, `hx-*`, `data-hx-*`, `style`, `srcdoc` |
| `<script src>`, `<base href>`, `<meta http-equiv>` | No free hole |

Brands (`Html`, `Attrs`, `Url`, `Css`, `Id`) are class instances checked with `instanceof`. Data parsed from JSON cannot forge one. `Id` and `Url` validate in their constructors.

**The declared bypass** is `trustedHtml(markup, reason)`. The reason is mandatory, so it is greppable and lintable.

**Prototype gap:** `Html`, `Attrs` and `Css` have public constructors, so code (not data) can forge a brand. The real package needs module-private construction.

## 8. Composition and escape hatches

**Composition is ordinary TypeScript.**
- A component is a function returning `` html`…` ``; call it in a hole. Children are holes.
- Lists are `items.map(Row)` in a hole. There is no `.map` problem to lint, because arrays of `Html` are a valid hole value.
- Conditionals are `cond && html`…`` and ternaries. `0` prints `0`; `false`, `null` and `undefined` print nothing.
- Exhaustive dispatch is `match()`.
- A style preset is a `` tw`…` `` constant. A preset picked by a domain value is a `match()` over `tw` strings. These replace `Styler` and `.whenMatch`.

**Escape hatches, one per situation:**

| Need | Hatch |
|---|---|
| An attribute whose name is computed | `attrs({ [name]: value })` |
| A runtime style value | `style="width: ${pct}%"` or `css({…})` |
| An arbitrary Tailwind value | Tailwind's own bracket syntax in the class text |
| A non-Tailwind class | Write it; the theme decides what `hh check` accepts |
| HTML from a sanitizer | `trustedHtml(markup, reason)` |
| An ad-hoc URL | A plain string in `href`; it is scheme-checked |

**What is lost against fluent-html 8:**
- **tsc cannot see inside a template.** TypeScript does not give tagged templates literal string types, so a hole's position cannot be typed. A wrong value kind in a hole (an `Html` in an attribute) throws at first render, not at compile.
- Palette, element and attribute errors move from tsc to `hh check`.
- No class merging; append-only conflicts behave as they do today.
- Keyed morph rows need an `id` on the row, written by hand.
- A runtime template error has a template-relative line. Only `hh check` gives `file:line`.

## 9. The kills

### K1: predicted, not measured

**Claim.** About 23% to 31% fewer output tokens, which clears the bar against a 6% run spread at the central estimate (27% to 29%). About 19% to 29% fewer turns, which does not clearly clear a 13% spread.

**Mechanism, against evidence 1's buckets (control mean: 107 turns, 89.7k tokens):**

| Bucket | Control | What changes | Estimate after |
|---|---|---|---|
| Lookups | 23.25 turns, 18.3k | Styling vocabulary gone (FHX: 9/7 calls to 1/1). No compiler source to read. Routes, forms and verbs shrink to about a dozen names in a 7.8 KB reference | 8 to 12 turns, 6k to 9k |
| View writing | 11.35 turns, 19.9k | 0.83x to 0.86x source | about 11 turns, 16.5k to 17.1k |
| Checks and fix loops | 17.55 turns, 8.3k | No extractor (observation 1: 4 to 5 turns per arm). No variant-key or method-name loops (7 turns in T-r1) | 9 to 12 turns, 4.5k to 6k |
| Guidance | 7.5 turns, 6.6k | Reference is 14% of the cap | 2 to 4 turns, 2k to 3.5k |
| Server edits | 4.1 turns, 6.7k | Controller 0.42x to 0.51x, routes 0.68x to 0.75x | about 4 turns, 4k to 4.7k |
| Everything else | about 40 turns, 26.5k | Unchanged | Unchanged |

A second route to the same number: start from FHX's measured L arms (98 turns, 69.2k) and remove the costs FHX added that this design does not have (observation 1, compiler-source reads, whitespace test loops). That gives about -19% turns and about -29% tokens.

**What could sink it.** FHX lost on the stateful screen. This design's answer (route-derived protocol, flat query, schema forms) is untested on such a screen. Claude Code's JSX and lit priors may leak (`className`, `<Card />`, `?disabled=`, `@click=`); the compiler refuses uppercase tags and lit bindings with the fix in the message, but `className` is not checked yet.

### K2: measured, pass

**Claim.** 14.24x (range 13.30 to 16.33) and 13.35x (12.61 to 14.57) fluent-html 8, median of per-round interleaved ratios.

Command, from `fixtures/bench/`: `NODE_ENV=production node --expose-gc harness.mjs --rounds 11 --sample-ms 300 --json arms/fluent-html-8.mjs ../../render-perf/bench/hoisted-html.mjs ../../render-perf/bench/hoisted-html-join.mjs arms/template-literal.mjs` (outputs: `render-perf/out/bench-final-run1.json`, `bench-final-run2.json`).

| Run | fh8 ops/CPU-s | Hoisted ops/CPU-s | Ratio | Hoisted alloc | fh8 alloc |
|---|---|---|---|---|---|
| Final 1 | 12,769 | 178,057 | 14.24 | 11,804 B | 138,619 B |
| Final 2 | 14,528 | 196,891 | 13.35 | 12,011 B | 139,021 B |

Three earlier runs during development gave 14.25, 13.28 and 13.45. One intermediate state, where every route call ran the URL sanitizer, gave 11.5 and 11.6; a one-line fast path for URLs starting with `/` restored it.

**Page difference, declared.** The arm writes the page in its own idiom: 8,483 B against 8,248 B. `node render-perf/bench/parity.mjs` confirms the output is identical to fluent-html 8's after removing `type="button"` from the 12 buttons and whitespace between tags.

**Mechanism.** §6. The honest real-world figure is 2.78x (3.22x for the join variant) once the encode is counted.

### K3: measured, pass

**Claim.** 0 escapes.

Command, from `fixtures/xss/`: `NODE_ENV=production node check.mjs ../../render-perf/xss/hoisted-html.mjs` (output: `render-perf/out/xss-hoisted-html.txt`, `.json`).

| Adapter | Escapes (xss + css) | Safe | Rejected | Benign broken | Unsupported |
|---|---|---|---|---|---|
| fluent-html 8 (baseline) | 18 (12 + 6) | 143 | 2 | 0 | 0 |
| **Hoisted HTML** | **0** | 140 | 28 | 0 of 38 | 0 |

The 28 rejections: all 16 CSS payloads, all 6 hostile attribute names, 4 `hx-get` values, 2 `hx-confirm` prefixes. The adapter puts the payload in a hole at the named position; only the attribute-name context needs a helper (`attrs()`), and the srcdoc case writes `sandbox`, the only spelling the design accepts.

**Mechanism.** §7.

### K4: measured, pass

**Claim.** 0 errors.

Command, from the baseline's html-validate 11.17.0 install with the same config: `./node_modules/.bin/html-validate --config .htmlvalidate.json <files>` on `render-perf/out/bench-page.hoisted.html` and the eight `r*.html` outputs. Exit 0, no output (`render-perf/out/html-validate-hoisted.txt` is empty). A sanity run of the same command on the control's fragment still reports its 12 errors.

**Named difference.** The bench page scores 0 against 12 because its source writes `type="button"`, and it does so because the template compiler refuses a `<button>` without a type. That is a rule of the design, not a renderer improvement.

### K5: not measured

**Claim.** No worse than fluent-html 8 on tsc, provided first-compile means `tsc` plus `hh check`.

**Evidence I do have:**
- `tsc -p render-perf/tsconfig.json` passes on the screens (exit 0), and `screens/negative.ts` holds 11 `@ts-expect-error` probes that all fire: field typo, missing option label, wrong param type, missing params, unknown query key, polling a page route, a form on a route without a body, a fragment answered with another fragment, with unrooted html, a page answered with a fragment, a 422 region with the wrong id, a route without a handler. The messages are in `render-perf/out/negative-messages.txt`; 11 of 12 lines carry the fact on the first line (for example `Argument of type '"nmae"' is not assignable to parameter of type '"status" | "name" | "ownerEmail" | "notes"'`). The missing-handler message is long.
- `node render-perf/tools/check.mjs render-perf/tools/broken` finds 12 of 12 seeded template mistakes, one line each with `file:line` and the fact first (`render-perf/out/check-broken.txt`). On the clean screens: 22 templates, 137 class uses, 0 findings, 285 to 444 ms total under load.
- Type-check cost is not a differentiator at this size: 0.86 s user for mine against 0.78 s for the control's views (`/usr/bin/time -p tsc -p …`, three runs each); 5,108 type instantiations against 17,936.

**One probe caught a real hole in my prototype:** the field-typo check passed silently until I fixed the schema's type. Negative probes are necessary here.

## 10. Verdict from this lens, and what to harvest

**As a design:** it deserves a place in the screen only together with a route-and-form layer like the one sketched here. The rendering idea alone clears K2 to K4 and leaves K1 open. If the semantic-layer lens proposes the same route and form ideas over typed calls, the bake-off question becomes narrow and useful: literal HTML text against typed calls, same semantics.

**Worth harvesting into fluent-html 8 whatever the verdict:**

| Idea | Evidence |
|---|---|
| The seven escaping rules of §7 (JSON in script, CSS value validator, `js:` refusal on hx attributes, objects-only `hx-vals`, `data-hx-*` key refusal, sandboxed `srcdoc`) | 18 escapes to 0, each rule a few lines |
| Ask Tailwind's design system whether a class exists, in place of the extractor's judgement | 41 ms; refuses palette literals and typos under a closed theme |
| `fragment` and `invalid` declared on the route, so verbs take no id | Removes a whole error class at call sites |
| The framework owns schema validation and the 422 re-render | Controller source 0.42x |
| `<button>` requires a type | 12 html-validate errors to 0 on the bench page |
| The serializer's per-element frames and close-tag strings | 412 B per element, half of fluent-html 8's allocation |

## 11. Executed, method choices and gaps

| Claim | Command | Output |
|---|---|---|
| K2 | harness command in §9 | 14.24, 13.35 |
| Encode-inclusive, cold compile | `NODE_ENV=production node --expose-gc render-perf/bench/wire.mjs` | 2.78, 3.22, 4.46; about 128 µs |
| fluent-html 8 per-node allocation | `NODE_ENV=production node --expose-gc render-perf/bench/fh8-alloc.mjs` | 391 + 412 B per element |
| Output parity | `node render-perf/bench/parity.mjs` | identical after the declared differences |
| K3 | `NODE_ENV=production node check.mjs ../../render-perf/xss/hoisted-html.mjs` | 0 escapes |
| K4 | html-validate 11.17.0, baseline config | 0 errors, 9 files |
| Type probes | `tsc -p render-perf/tsconfig.json` | exit 0; 11 expected errors fire |
| Control views compile | `tsc -p render-perf/fh8-screens/tsconfig.json` | exit 0 |
| Template checker | `node render-perf/tools/check.mjs <dir>` | 0 findings on screens; 12 of 12 on seeded mistakes |
| Tailwind scans templates | `node render-perf/tools/tw-probe.mjs` | 205 candidates, 56 valid, 41 ms |
| Source size | `python3 -I render-perf/tools/size.py` | 0.72x bytes, 0.76x pieces |
| Screens render | `node render-perf/screens/run.mjs` | 200, 422, 303 as expected |

**Method choices.**
1. **The K2 arm keeps `+=`** (the registered metric), and the join variant and the encode-inclusive bench are reported beside it, because the harness never flattens the string.
2. **Bytes and lexical pieces stand in for tokens.** No tokenizer was available offline.
3. **Theme tokens are invented** (`ink`, `dim`, `surface`, …) and used in both versions.
4. **The control follows the template's conventions**, since that is what Claude Code loads; verbs are template-side, so they are stubbed for type-checking.
5. **`space-y-*` was replaced by `flex flex-col gap-*` in my version** and the backdrop style was dropped from both, to keep the size comparison like for like.
6. **Tailwind 4.3.3 came from a sibling project's `node_modules`** (read only); none is installed in fluent-html or the template.

**Gaps.**
- K1 and K5 need the headless sessions.
- No browser run: htmx behaviour of the emitted attributes is unverified.
- The control's controller is not type-checked.
- The schema and the dispatcher are stand-ins; the no-JavaScript 422 page is not built.
- `hh check` does not check hole value kinds, attribute names such as `className`, or static `href` literals against the route table.
- Brand constructors are public in the prototype.

**Files** (all under `/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15/render-perf/`):
- `src/hh.ts` (790 lines: templates, compile, escaping), `src/hx.ts` (351 lines: ids, routes, verbs, forms, handlers)
- `reference.md` (7,835 B, the trial arm's API reference)
- `screens/` (the three screens, `negative.ts`, `run.mjs`), `fh8-screens/` (the control)
- `bench/` (`hoisted-html.mjs`, `hoisted-html-join.mjs`, `parity.mjs`, `wire.mjs`, `fh8-alloc.mjs`), `xss/hoisted-html.mjs`
- `tools/` (`check.mjs`, `tw-probe.mjs`, `size.py`, `make-join-variant.py`, `theme.css`, `broken/mistakes.ts`)
- `out/` (every result quoted above)
