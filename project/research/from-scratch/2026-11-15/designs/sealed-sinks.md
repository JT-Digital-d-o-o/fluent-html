# Sealed Sinks

# Sealed Sinks: security by construction

A runnable prototype of this design passes the three kills that can be measured without a Claude Code session: **K3 with 0 escapes** (fluent-html 8: 18), **K2 at 2.82x** fluent-html 8, and **K4 with 0 errors** (fluent-html 8: 12). **K1 and K5 are not measured**: no headless session ran, so both are predictions with a mechanism. K1 is the weakest claim.

If the design is dropped at the screen, its security core is still a harvest: the same encoders close all 18 of fluent-html 8's escapes and do not depend on TSX.

Everything is under `/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15/security/`. Nothing in fluent-html's `src/`, `dist/`, `project/pm/`, the template or the guidelines was touched, and nothing was committed.

## 1. Thesis

Every place a value can land in HTML is a **sink** with one encoder and one accepted type. The sink is chosen by (element, attribute) at the JSX call, never by the author.

- **Where a runtime rule can make a string safe, a string is accepted** and encoded: text, attribute values, URLs, CSS values, JSON in a script. Claude Code writes `{user.name}` and `href={user.website}` and learns nothing new.
- **Where no rule can, a string is a type error** and a render-time refusal: script bodies, style strings, inline handlers, `hx-*` attributes, raw HTML.
- **Trusted values are class instances** (`Html`, `Route`, `Id`, `Verb`, `Css`, `Json`, `Js`), checked with `instanceof`. An object parsed from a request body cannot forge one.
- **Hostile data is neutralised, never thrown on**, so a stored payload cannot turn a list page into a 500. Names and structure (attribute names, tag names, wrong types) throw, because they come from the author.

The surface is plain TSX compiled by tsc, with literal Tailwind class text. That is a deliberate choice for the lens: JSX gives every sink a syntactic position that TypeScript already types per element and attribute, with no compiler of ours.

## 2. What ran

| Claim | Command (from `security/` unless noted) | Result |
|---|---|---|
| Prototype and screens type-check | `./build.sh` (tsc 5.9.3, then esbuild bundles) | 0 errors |
| K3 | in `fixtures/xss`: `NODE_ENV=production node check.mjs ../../security/out/xss-adapter.mjs` | 206 cases, **0 escapes**; 162 safe, 6 rejected, 0 of 38 benign broken, 0 unsupported |
| K2 | in `fixtures/bench`: `NODE_ENV=production node --expose-gc harness.mjs --rounds 11 --sample-ms 300 --json arms/fluent-html-8.mjs ../../security/out/bench-page.mjs arms/template-literal.mjs` | run 2: **2.826x** (2.625 to 3.232); run 3: **2.819x** (2.694 to 3.144) |
| Bench output equals fluent-html 8's | `node bench/emit.mjs` | identical apart from whitespace and `type="button"` on the 12 buttons |
| K4, bench page | in `scratchpad/fs-validate`: `npx html-validate sealed/bench-page.fragment.html` and `…document.html` | **0 errors**, 0 warnings in both |
| K4, the three screens | `npx html-validate` on six rendered documents | 0 errors |
| Type refusals | `./probe.sh` | 27 of 28 seeded mistakes are tsc errors; 9 of 9 valid spellings compile |
| Runtime refusals | `node out/probes-runtime.mjs` | 21 of 21 bypass attempts refused; 3 controls render |
| Tailwind without an extractor | `node tailwind/check.mjs <template dir>` (tailwindcss 4.3.1) | 68 of 68 classes in the screens have a rule |
| Source size | `./sizes.sh` | 7,036 B against 8,005 B for fluent-html 8 (0.88x) |
| Reference size | `wc -c reference.md` | 5,805 B (cap: 56,541 B) |

Bench detail, final build:

| Run | fluent-html 8 (ops/CPU-s) | Sealed Sinks | Ceiling arm | Alloc per page |
|---|---|---|---|---|
| 2 (load 174) | 12,772 | 35,960 | 277,394 | 138,977 B / 77,639 B / 13,454 B |
| 3 (load 159) | 14,584 | 41,250 | 289,186 | 138,501 B / 77,669 B / 13,455 B |

## 3. The API

The full reference written for a bake-off arm is `security/reference.md` (5,805 B). In short:

```tsx
import { defineIds, defineRoutes, bind, search, poll, swap, fire, load, json, js, css, html, localUrl, render } from "sealed";
```

| Piece | Shape |
|---|---|
| Elements and attributes | HTML's own, lowercase: `class`, `for`, `maxlength`. `className`, `htmlFor` and `key` are accepted, so the React prior does not cost a turn |
| Styling | Tailwind class text. `class` takes a string or an array of strings and falsy values |
| Ids | `defineIds(["projectList"] as const)` gives `ids.projectList` (renders `project-list`) |
| Routes | `defineRoutes(prefix, { name: { method?, path, params?, query?, body?, region?, invalid?, render? } })` |
| Route call | `projects.detail({ id: 3 })`: path params and query keys in one object |
| Navigation | `<a href={pageRoute}>` navigates through htmx; `<a href={string}>` is an ordinary link |
| Forms | `<form action={route}>` submits with the route's method; a 422 goes to the route's `invalid` region |
| Verbs | `hx={search(route)}`, `poll(route, "2s")`, `load(route)`, `swap(route)`, `fire(route)` |
| Field binding | `const f = bind(routes.create, state)`; `{...f.input("name")}`, `f.error("name", classes)`, `f.id("name")` |
| Script and style | `<script>{json(data)}</script>`, ``<script>{js`code ${data}`}</script>``, ``<style>{css`.x{color: ${v}}`}</style>`` |
| Response | `render(view, { nonce })` |

## 4. The three screens

Both versions use the template's real theme tokens. Both compile. The Sealed Sinks versions were also rendered and validated; the fluent-html 8 versions were type-checked against the template's `swap-verbs.ts` and `theme.ts` but not rendered.

Routes, Sealed Sinks (`screens/projects.routes.ts`):

```ts
export const ids = defineIds(["projectList", "projectForm", "statusBadge", "confirmDelete", "confirmDeleteTitle"] as const);

export const CreateProject = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 80 }),
  client: Type.String({ minLength: 1, maxLength: 80 }),
  budget: Type.Number({ minimum: 0 }),
});
export type CreateProjectReq = Static<typeof CreateProject>;

export const projects = defineRoutes("/projects", {
  list:   { path: "/", query: { q: "string" } },
  rows:   { path: "/rows", query: { q: "string" }, region: ids.projectList },
  new:    { path: "/new" },
  create: { method: "post", path: "/", body: CreateProject, invalid: ids.projectForm },
  detail: { path: "/:id", params: { id: "number" } },
  status: { path: "/:id/status", params: { id: "number" }, region: ids.statusBadge },
  remove: { method: "delete", path: "/:id", params: { id: "number" } },
});
```

Routes, fluent-html 8 (`screens-fh8/projects.routes.ts`):

```ts
export const ids = defineIds(["projectList", "projectForm", "statusBadge", "confirmDelete", "confirmDeleteTitle"] as const);

export const projectRoutes = defineRoutes("/projects", {
  list:   { path: "/" },
  rows:   { path: "/rows", render: ids.projectList },
  new:    { path: "/new" },
  create: { method: "post", path: "/" },
  detail: { path: "/:id", params: { id: "number" } as const },
  status: { path: "/:id/status", params: { id: "number" } as const, render: ids.statusBadge },
  remove: { method: "delete", path: "/:id", params: { id: "number" } as const },
} as const);
```

### R1, project list

Sealed Sinks (`screens/r1-project-list.tsx`, 2,188 B):

```tsx
import { search } from "sealed";
import { Layout } from "./layout";
import { ids, projects } from "./projects.routes";
import type { Project } from "./projects.types";

type Props = { projects: readonly Project[]; q: string };

export function ProjectListPage({ projects: rows, q }: Props) {
  return (
    <Layout title="Projects">
      <header class="flex items-center justify-between gap-4">
        <h1 class="text-2xl font-semibold">Projects</h1>
        <a href={projects.new()} class="rounded-control bg-primary px-4 py-2 text-sm font-medium text-on-accent hover:bg-primary-700">
          New project
        </a>
      </header>
      <input
        type="search"
        name="q"
        value={q}
        placeholder="Search projects"
        aria-label="Search projects"
        class="mt-6 w-full rounded-control border border-line bg-surface px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-hidden"
        hx={search(projects.rows())}
      />
      <ProjectList projects={rows} q={q} />
    </Layout>
  );
}

export function ProjectList({ projects: rows, q }: Props) {
  return (
    <section id={ids.projectList} class="mt-4" aria-label="Projects">
      {rows.length === 0 ? (
        <EmptyState q={q} />
      ) : (
        <ul class="divide-y divide-line rounded-card border border-line bg-surface">
          {rows.map((project) => <ProjectRow project={project} />)}
        </ul>
      )}
    </section>
  );
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <li>
      <a href={projects.detail({ id: project.id })} class="flex items-center justify-between gap-4 px-4 py-3 hover:bg-surface-2">
        <span class="font-medium">{project.name}</span>
        <span class="text-sm text-text-dim">{project.client}</span>
      </a>
    </li>
  );
}

function EmptyState({ q }: { q: string }) {
  return (
    <div class="rounded-card border border-dashed border-line p-10 text-center">
      <p class="font-medium">{q ? `No projects match "${q}"` : "No projects yet"}</p>
      <p class="mt-1 text-sm text-text-dim">{q ? "Try a different search." : "Create the first one to get started."}</p>
    </div>
  );
}
```

fluent-html 8 (`screens-fh8/r1-project-list.ts`, 2,320 B):

```ts
import { A, Div, ForEach, H1, Header, IfThenElse, Input, Li, P, Section, Span, Ul } from "fluent-html";
import { Layout } from "./layout.js";
import { ids, projectRoutes } from "./projects.routes.js";
import type { Project } from "./projects.types.js";

type Props = { projects: readonly Project[]; q: string };

export function ProjectListPage({ projects, q }: Props) {
  return Layout({
    title: "Projects",
    children: [
      Header(
        H1("Projects").text("2xl").font("semibold"),
        A("New project")
          .nav(projectRoutes.new())
          .rounded("control").bg("primary").px("4").py("2").text("sm").font("medium").text("on-accent")
          .hover({ bg: "primary-700" }),
      ).flex().items("center").justify("between").gap("4"),
      Input()
        .setType("search")
        .setName("q")
        .setValue(q)
        .setPlaceholder("Search projects")
        .setAria({ label: "Search projects" })
        .search(ids.projectList, projectRoutes.rows())
        .mt("6").w("full").rounded("control").border().border("line").bg("surface").px("3").py("2")
        .focusVisible({ ring: "2", outline: "hidden" })
        .focusVisible({ ring: "primary" }),
      ProjectList({ projects, q }),
    ],
  });
}

export function ProjectList({ projects, q }: Props) {
  return Section(
    IfThenElse(
      projects.length > 0,
      () =>
        Ul(ForEach(projects, (project) => ProjectRow({ project })))
          .divideY().divide("line").rounded("card").border().border("line").bg("surface"),
      () => EmptyState({ q }),
    ),
  ).setId(ids.projectList).mt("4").setAria({ label: "Projects" });
}

function ProjectRow({ project }: { project: Project }) {
  return Li(
    A(
      Span(project.name).font("medium"),
      Span(project.client).text("sm").text("text-dim"),
    )
      .nav(projectRoutes.detail({ id: project.id }))
      .flex().items("center").justify("between").gap("4").px("4").py("3")
      .hover({ bg: "surface-2" }),
  );
}

function EmptyState({ q }: { q: string }) {
  return Div(
    P(q ? `No projects match "${q}"` : "No projects yet").font("medium"),
    P(q ? "Try a different search." : "Create the first one to get started.").mt("1").text("sm").text("text-dim"),
  ).rounded("card").border().border("dashed").border("line").p("10").text("center");
}
```

### R2, create form bound to a schema

Sealed Sinks (`screens/r2-project-form.tsx`, 1,758 B):

```tsx
import { bind, type FormState } from "sealed";
import { Layout } from "./layout";
import { ids, projects, type CreateProjectReq } from "./projects.routes";

const label = "block text-sm font-medium";
const control = "mt-1 w-full rounded-control border border-line bg-surface px-3 py-2 aria-invalid:border-danger";
const error = "mt-1 text-sm text-danger";

export function NewProjectPage(state: FormState<CreateProjectReq>) {
  return (
    <Layout title="New project">
      <h1 class="text-2xl font-semibold">New project</h1>
      <ProjectForm {...state} />
    </Layout>
  );
}

export function ProjectForm(state: FormState<CreateProjectReq>) {
  const f = bind(projects.create, state);
  return (
    <form id={ids.projectForm} action={projects.create()} novalidate class="mt-6 flex max-w-lg flex-col gap-5">
      <div>
        <label for={f.id("name")} class={label}>Name</label>
        <input {...f.input("name")} required maxlength={80} class={control} />
        {f.error("name", error)}
      </div>
      <div>
        <label for={f.id("client")} class={label}>Client</label>
        <input {...f.input("client")} required maxlength={80} class={control} />
        {f.error("client", error)}
      </div>
      <div>
        <label for={f.id("budget")} class={label}>Budget (EUR)</label>
        <input {...f.input("budget", "number")} min={0} step={100} class={control} />
        {f.error("budget", error)}
      </div>
      <div class="flex items-center gap-3">
        <button class="rounded-control bg-primary px-4 py-2 text-sm font-medium text-on-accent hover:bg-primary-700 cursor-pointer">Create project</button>
        <a href={projects.list()} class="text-sm text-text-dim hover:underline">Cancel</a>
      </div>
    </form>
  );
}
```

The 422 flow needs no view code: `create` declares `invalid: ids.projectForm`, so `<form action={projects.create()}>` renders `hx-status:422="target:#project-form swap:outerMorph push:false"`. The controller is a sketch, not prototyped:

```tsx
create: async ({ body, problems }, reply) => {
  if (problems) return reply.invalid(<ProjectForm values={body} errors={problems} />);  // 422: the form region for htmx, the page otherwise
  const project = await createProject(body);
  return reply.redirect(projects.detail({ id: project.id }));
},
```

fluent-html 8 (`screens-fh8/r2-project-form.ts`, 2,143 B):

```ts
import { A, Button, Div, Form, H1, Label, type FormState } from "fluent-html";
import type { Styler } from "@tpl/shared/stylers.js";
import { Layout } from "./layout.js";
import { ids, projectRoutes } from "./projects.routes.js";
import type { CreateProjectReq } from "./projects.schema.js";

export type ProjectFormState = FormState<CreateProjectReq>;

const label: Styler = (t) => t.block().text("sm").font("medium");
const control: Styler = (t) =>
  t.mt("1").w("full").rounded("control").border().border("line").bg("surface").px("3").py("2")
    .variant("aria-[invalid=true]", { border: "danger" });
const error: Styler = (t) => t.mt("1").text("sm").text("danger");

export function NewProjectPage(state: ProjectFormState = {}) {
  return Layout({
    title: "New project",
    children: [H1("New project").text("2xl").font("semibold"), ProjectForm(state)],
  });
}

export function ProjectForm(state: ProjectFormState = {}) {
  return Form<CreateProjectReq>(state, (f) => [
    Div(
      Label("Name").setFor("name").apply(label),
      f.input("name", "text").setId("name").toggle("required").setMaxlength(80).apply(control),
      Div(f.error("name")).apply(error),
    ),
    Div(
      Label("Client").setFor("client").apply(label),
      f.input("client", "text").setId("client").toggle("required").setMaxlength(80).apply(control),
      Div(f.error("client")).apply(error),
    ),
    Div(
      Label("Budget (EUR)").setFor("budget").apply(label),
      f.input("budget", "number").setId("budget").setMin(0).setStep(100).apply(control),
      Div(f.error("budget")).apply(error),
    ),
    Div(
      Button("Create project")
        .setType("submit")
        .rounded("control").bg("primary").px("4").py("2").text("sm").font("medium").text("on-accent").cursor("pointer")
        .hover({ bg: "primary-700" }),
      A("Cancel").nav(projectRoutes.list()).text("sm").text("text-dim").hover({ underline: true }),
    ).flex().items("center").gap("3"),
  ])
    .setId(ids.projectForm)
    .nav(projectRoutes.create(), { invalid: ids.projectForm })
    .toggle("novalidate")
    .mt("6").flex().flex("col").maxW("lg").gap("5");
}
```

### R3, project detail

Sealed Sinks (`screens/r3-project-detail.tsx`, 3,090 B):

```tsx
import { fire, poll } from "sealed";
import { Layout } from "./layout";
import { ids, projects } from "./projects.routes";
import type { Job, JobStatus, Project } from "./projects.types";

type Props = { project: Project; job: Job };

const TONE = {
  queued: "bg-surface-2 text-text-dim",
  running: "bg-info/10 text-info",
  done: "bg-success/10 text-success",
  failed: "bg-danger/10 text-danger",
} satisfies Record<JobStatus, string>;

const LABEL = { queued: "Queued", running: "Importing", done: "Ready", failed: "Import failed" } satisfies Record<JobStatus, string>;

export function ProjectDetailPage({ project, job }: Props) {
  return (
    <Layout title={project.name}>
      <nav aria-label="Breadcrumb" class="text-sm text-text-dim">
        <a href={projects.list()} class="hover:underline">Projects</a> / {project.name}
      </nav>
      <header class="mt-2 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-semibold">{project.name}</h1>
          <StatusBadge projectId={project.id} job={job} />
        </div>
        <button command="show-modal" commandfor={ids.confirmDelete} class="rounded-control border border-line px-3 py-2 text-sm text-danger hover:bg-danger/10 cursor-pointer">
          Delete
        </button>
      </header>
      <dl class="mt-6 grid grid-cols-2 gap-4 text-sm">
        <dt class="text-text-dim">Client</dt>
        <dd>{project.client}</dd>
        <dt class="text-text-dim">Budget</dt>
        <dd>{project.budget} EUR</dd>
        <dt class="text-text-dim">Website</dt>
        <dd>{project.website ? <a href={project.website} rel="noopener" class="underline">{project.website}</a> : "None"}</dd>
      </dl>
      <ConfirmDelete project={project} />
    </Layout>
  );
}

export function StatusBadge({ projectId, job }: { projectId: number; job: Job }) {
  const live = job.status === "queued" || job.status === "running";
  return (
    <span
      id={ids.statusBadge}
      class={["inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", TONE[job.status]]}
      hx={live ? poll(projects.status({ id: projectId }), "2s") : undefined}
    >
      {LABEL[job.status]}
    </span>
  );
}

function ConfirmDelete({ project }: { project: Project }) {
  return (
    <dialog id={ids.confirmDelete} closedby="any" aria-labelledby={ids.confirmDeleteTitle} class="rounded-card p-6 backdrop:bg-inverse/40">
      <h2 id={ids.confirmDeleteTitle} class="text-lg font-semibold">Delete {project.name}?</h2>
      <p class="mt-2 text-sm text-text-dim">This removes the project and its entries. It cannot be undone.</p>
      <div class="mt-6 flex justify-end gap-3">
        <button command="close" commandfor={ids.confirmDelete} class="rounded-control border border-line px-3 py-2 text-sm cursor-pointer">Cancel</button>
        <button hx={fire(projects.remove({ id: project.id }))} class="rounded-control bg-danger px-3 py-2 text-sm font-medium text-on-accent cursor-pointer">
          Delete project
        </button>
      </div>
    </dialog>
  );
}
```

The website link is the security point of this screen: `project.website` is a plain string from the database. Rendered with `javascript:alert(1)` it comes out as `href="about:invalid#blocked"` (see `out/screens/r3-detail-running.html`). The fluent-html 8 version needs the author to remember `externalUrl()`, which changes the type only and does no runtime check.

fluent-html 8 (`screens-fh8/r3-project-detail.ts`, 3,542 B):

```ts
import { A, Button, Dd, Dialog, Div, Dl, Dt, H1, H2, Header, IfThenElse, Nav, P, Span, externalUrl } from "fluent-html";
import type { StylerFor } from "@tpl/shared/stylers.js";
import { Layout } from "./layout.js";
import { ids, projectRoutes } from "./projects.routes.js";
import type { Job, JobStatus, Project } from "./projects.types.js";

type Props = { project: Project; job: Job };

const tone: StylerFor<JobStatus> = (status) => (t) =>
  t.whenMatch(status, {
    queued: (s) => s.bg("surface-2").text("text-dim"),
    running: (s) => s.bg("info/10").text("info"),
    done: (s) => s.bg("success/10").text("success"),
    failed: (s) => s.bg("danger/10").text("danger"),
  });

const LABEL = { queued: "Queued", running: "Importing", done: "Ready", failed: "Import failed" } satisfies Record<JobStatus, string>;

export function ProjectDetailPage({ project, job }: Props) {
  return Layout({
    title: project.name,
    children: [
      Nav(A("Projects").nav(projectRoutes.list()).hover({ underline: true }), " / ", project.name)
        .setAria({ label: "Breadcrumb" }).text("sm").text("text-dim"),
      Header(
        Div(H1(project.name).text("2xl").font("semibold"), StatusBadge({ projectId: project.id, job }))
          .flex().items("center").gap("3"),
        Button("Delete")
          .setType("button")
          .setCommand("show-modal")
          .setCommandfor(ids.confirmDelete)
          .rounded("control").border().border("line").px("3").py("2").text("sm").text("danger").cursor("pointer")
          .hover({ bg: "danger/10" }),
      ).mt("2").flex().items("center").justify("between").gap("4"),
      Dl(
        Dt("Client").text("text-dim"),
        Dd(project.client),
        Dt("Budget").text("text-dim"),
        Dd(`${project.budget} EUR`),
        Dt("Website").text("text-dim"),
        Dd(
          IfThenElse(
            project.website,
            (website) => A(website).setHref(externalUrl(website)).setRel("noopener").underline(),
            () => "None",
          ),
        ),
      ).mt("6").grid().gridCols("2").gap("4").text("sm"),
      ConfirmDelete({ project }),
    ],
  });
}

export function StatusBadge({ projectId, job }: { projectId: number; job: Job }) {
  const live = job.status === "queued" || job.status === "running";
  return Span(LABEL[job.status])
    .setId(ids.statusBadge)
    .inlineFlex().items("center").rounded("full").px("2.5").py("0.5").text("xs").font("medium")
    .apply(tone(job.status))
    .when(live, (t) => t.poll(projectRoutes.status({ id: projectId }), "2s"));
}

function ConfirmDelete({ project }: { project: Project }) {
  return Dialog(
    H2(`Delete ${project.name}?`).setId(ids.confirmDeleteTitle).text("lg").font("semibold"),
    P("This removes the project and its entries. It cannot be undone.").mt("2").text("sm").text("text-dim"),
    Div(
      Button("Cancel")
        .setType("button")
        .setCommand("close")
        .setCommandfor(ids.confirmDelete)
        .rounded("control").border().border("line").px("3").py("2").text("sm").cursor("pointer"),
      Button("Delete project")
        .setType("button")
        .nav(projectRoutes.remove({ id: project.id }))
        .rounded("control").bg("danger").px("3").py("2").text("sm").font("medium").text("on-accent").cursor("pointer"),
    ).mt("6").flex().justify("end").gap("3"),
  )
    .setId(ids.confirmDelete)
    .setClosedby("any")
    .setAria({ labelledby: ids.confirmDeleteTitle.id })
    .rounded("card").p("6")
    .variant("[&::backdrop]", { bg: "inverse/40" });
}
```

### What writing both versions showed (n=1, the designer as author)

I wrote the fluent-html 8 versions from the project rules in my context, without opening the 36 KB reference or `dist`. With the template's theme and verb layer loaded, the first tsc run gave **21 error lines from 9 distinct vocabulary mistakes** (`out/fh8-screens.tsc-1-first.txt`):

- `setAria("label", …)` instead of `setAria({ label })`, 4 sites
- `ringColor` in a variant object; `divideColor()`; `flexCol()`
- `Styler` and `StylerFor` imported from `fluent-html` (they live in the template)
- `.variant("backdrop", …)`; `.variant("aria-invalid", …)`, the same trap that cost 3 turns in both T arms
- `f.error(name).apply(…)` (it returns a `View`, not a tag); a hand-typed form state

Clearing them took **3 tsc runs and 4 `dist` lookups**. The Sealed Sinks screens compiled on the first run and failed once at render (a type and runtime disagreement on `<label for>`, in my own prototype). This is not a fair comparison, since I designed one API and not the other. It does reproduce Evidence 1's first cost driver on a small scale.

## 5. Tailwind, htmx, routes and fragment ids

**Tailwind.** Classes are literal text in `.tsx`, which Tailwind v4 scans by itself. `node tailwind/check.mjs` built the CSS for the three screens with stock tailwindcss 4.3.1 and found a rule for 68 of 68 classes, including `aria-invalid:border-danger`, `backdrop:bg-inverse/40` and `bg-info/10`. There is no extractor, no safelist prebuild and no `staticManifest`.

The closed palette stays closed (`--color-*: initial` in `@theme`), but a palette literal is no longer a tsc error: it emits no rule. The same script is the check: classes written minus classes with a rule must be empty. That is a build-step error, not a compile error.

**Routes.** One definition carries the path, method, param and query kinds, the body schema, the region a fragment route answers, and the region a form's 422 re-renders. A call returns a `Route` instance with a `kind` (`page`, `fragment`, `none`) and a `method` in its type.

**htmx.** There are no `hx-*` attributes to write.

| Author writes | Rendered |
|---|---|
| `<a href={projects.detail({ id })}>` | `href` plus `hx-get`, `hx-target="#main-content"`, `hx-swap="outerMorph show:top"`, `hx-push-url="true"` |
| `<form action={projects.create()}>` | `action`, `method="post"`, `hx-post`, main-content morph, `hx-status:422` to the route's `invalid` region |
| `hx={search(projects.rows())}` | `hx-get`, `hx-trigger="input changed delay:300ms, search"`, `hx-target="#project-list"`, `hx-sync="this:replace"` |
| `hx={poll(projects.status({ id }), "2s")}` | `hx-get`, `hx-trigger="every 2s"`, `hx-target="this"`, `hx-swap="outerHTML"`, and the region's id on the element |
| `hx={fire(projects.remove({ id }))}` | `hx-delete`, main-content morph and push |

**Fragment ids.** The target is never written, because a fragment route names its region. There is no second id to mismatch. `poll` and `load` put the region's id on the element and throw if the element carries a different one. Id-reference attributes (`commandfor`, `popovertarget`, `aria-labelledby`) take `Id` values, so a dialog and its opener cannot drift.

## 6. Rendering strategy

`jsx(tag, props)` builds the element's string at the call and returns an `Html` instance holding the string and the root id. There is no retained tree and no serialize pass. A component is a function call.

Children are encoded by the element that receives them, so the element's kind decides the context: normal, text-only (`textarea`, `title`), script, style, void.

One late-bound value exists: the CSP nonce. `<script>` and `<style>` emit a per-process random slot, and `render(view, { nonce })` substitutes it at the response. A view with a script and no nonce throws; a hand-written `nonce` attribute throws.

Cost: every element allocates a props object, a children array and an `Html`. That is 2.82x fluent-html 8 and 0.14x the template-literal ceiling. Streaming is not in the prototype.

## 7. The escaping model

| Sink | Accepts | Encoder | On hostile data |
|---|---|---|---|
| Child of a normal element | string, number, `Html`, array, nullish | `& < > " '` | escaped |
| `textarea`, `title` | text only | same | escaped; markup children are a type error |
| Attribute value | string, number, boolean | same, always double-quoted | escaped |
| `href`, `action`, `formaction` | `Route` or string | scheme allowlist: relative, `http`, `https`, `mailto`, `tel`, media `data:` | `about:invalid#blocked` |
| `img src`, `poster`, `srcset` | string | allowlist plus non-SVG media `data:` | blocked |
| `iframe src` | string | relative, `http`, `https` | blocked |
| `script src`, `link href` | `/…` literal type or `Route` | same-origin path only | blocked |
| `style` attribute | object or `Css` | property name pattern; value is one token run with no `; : { } " ' \ @`, no `url(`, no comment | declaration dropped |
| `<style>` body | ``css`…` `` | literal text checked once; a hole only as a declaration value, same value rule | value emptied |
| `<script>` body | `json(data)` or ``js`…` `` | JSON with `<`, `>`, `&`, U+2028, U+2029 escaped; `json()` forces `type="application/json"`; `js` gets the nonce | cannot break out |
| htmx request URL | `Route`, or `localUrl()` for a path stored as data | routes are built from the definition with `encodeURIComponent` per param | `localUrl` returns null; no attribute |
| `hx-vals`, `hx-headers` | object | `JSON.stringify`, so the value starts with `{` | a string is a type error and a throw |
| `hx-confirm` | string | a value starting with `js:` or `javascript:` gets U+2060 in front | shown as text |
| `hx-trigger` | not writable | set by the verb from a closed set | no filter expressions |
| `iframe srcdoc` | string or `Html` | attribute-escaped; `sandbox` always emitted; a string never gets `allow-scripts` | inert |
| Attribute name | closed table per element, `data-*`, `aria-*` | pattern check; `on*`, `hx-*`, `data-hx-*`, `nonce` refused | throws |
| Element name | closed table | lookup | throws |

The URL check mirrors the URL parser (leading C0 and space stripped, tab and newline removed anywhere, then the scheme is read) and emits the original string, so benign values round-trip exactly.

## 8. Bug classes that cannot be written

| Bug class | What stops it |
|---|---|
| Unescaped text or attribute | No function turns a string into `Html` |
| `javascript:`, `vbscript:`, scriptable `data:` in a URL attribute | Encoder; no author action needed |
| Script loaded from a data-supplied URL | Type (`/…` literal) and the same-origin encoder |
| Inline event handler | Type (`No<"…">` with the fix in the name) and attribute-name refusal |
| htmx `js:` request, `hx-on*`, string `hx-vals`, trigger filter, `data-hx-*` alias | No spelling: verbs take `Route` objects, names are refused |
| `</script>` or `<!--<script>` in embedded data | `json()` and `js` are the only script bodies |
| A data script that executes, an executing script without a nonce | The body's brand sets the type or the nonce |
| CSS declaration injection, rule breakout | Style is an object; `<style>` is a checked literal with value-only holes |
| `srcdoc` running in the page's origin | Sandbox is always emitted |
| Attribute-name or tag-name injection | Closed tables |
| A trusted value forged from JSON | `instanceof` on class instances |
| A target that does not match its route | The target comes from the route |
| A fragment route used as a link, a page route polled, a delete route as `href` | Types on `Route<kind, method>` |
| A form field name not in the schema | `f.input("nmae")` lists the valid names |
| Double escaping | Stringifying an `Html` throws |
| Unescaped parse contexts (`noscript`, `xmp`, `plaintext`, foreign content, `base`, `meta http-equiv`) | Not in the tables |

**Not closed, stated plainly:**

- A class token from data can apply any utility that exists in the build (UI redress with `fixed inset-0`).
- An `id` from data can clobber DOM names.
- `http` and `https` URLs from data are allowed, so open redirects are out of scope.
- ``html`…` `` for literal SVG is checked by a regular expression, not a parser.
- `sanitize()` for third-party HTML is named in the design and not built.
- `hx-trigger` filters are not in the fixture set; they are closed here only because triggers are not writable.

## 9. What it costs Claude Code

| Cost | Size |
|---|---|
| The htmx prior leaks: `hx-get="/x"` is a compile error | One turn; the error text is the fix (`./probe.sh`, p02) |
| `onClick`, `style="…"`, `<script>text</script>`, `dangerouslySetInnerHTML` are compile errors | One turn each, fix in the message for three of four |
| A misspelled hyphenated attribute passes tsc | TypeScript does not check undeclared hyphenated JSX attributes, even against a template-literal index signature (probed). Refused at render with the fix |
| An unknown Tailwind class passes tsc | Caught by the build-time set difference, not the compiler |
| A fragment's root id is checked at render | fluent-html 8 has it at compile time through `Rooted<N>`; `JSX.Element` is one type, so the brand cannot flow through `<Component />` |
| A URL scheme outside the allowlist renders as blocked, silently | Needs a dev warning and a configurable allowlist (`sms:`, app schemes) |
| CSS values with quotes or `url()` are dropped | They go through ``css`…` `` or a typed `cssUrl()` (not built) |
| No `Raw` | Third-party markup needs `sanitize()`: a dependency and CPU on that path |
| `ForEach`, `IfThenElse`, `Match`, `Styler`, `.when` are gone | Replaced by `.map`, `? :`, `satisfies Record`, class arrays: all prior, but `Match`'s exhaustiveness message is lost for non-lookup branches |
| The surface looks like React | The company rule says no React. This is JSX syntax compiled by tsc into string building, with no runtime framework; a reviewer may still read it as a violation |

## 10. Composition and escape hatches

- **Components** are functions from a props object to JSX, called as `<Row project={p} />` or `Row({ project: p })`.
- **Style presets** are string constants (`const control = "mt-1 w-full …"`); conditional styling is a class array or a `satisfies Record<Union, string>` lookup, which is exhaustive.
- **Escape hatches**, one per situation, none taking an arbitrary string into markup:
  - arbitrary Tailwind value: bracket syntax in the class text
  - runtime-computed style: the `style` object
  - a path stored as data: `localUrl(path, { region })`
  - literal markup: ``html`…` `` with no holes
  - third-party HTML: `sanitize()` (not built)
  - a non-Tailwind class hook: it is just a class

## 11. The kills

| Kill | Claim | Mechanism | Status |
|---|---|---|---|
| K1 | Predicted pass on output tokens; turns uncertain | See below | **Not measured** |
| K2 | 2.82x and 2.83x fluent-html 8 | Strings built at the call, no tree | Measured, two runs |
| K3 | 0 escapes | One encoder per sink | Measured |
| K4 | 0 errors against 12 | Explicit button type; closed element rules | Measured; the bench difference is the button default alone |
| K5 | Predicted no worse | 27 of 28 mistakes are tsc errors, mean first line 140 characters | **Not measured** |

**K1 in detail.** The reachable pool in Evidence 1 is about 45 of 107 turns, and K1 needs about 27 of them.

- *Lookups (23.25 turns, 18.3k tokens).* Elements, attributes and styling are HTML and Tailwind, which need no lookup. Routes, query and forms were the part FHX left (13 lookups per L arm); here the target, method, query keys and 422 region are read off one route definition.
- *View writing (19.9k tokens).* Source is 0.88x fluent-html 8's bytes. Tokens were not counted; the earlier measurement for literal class text was 0.63x.
- *Check loops.* The extractor is gone, which removes observation 1 (4 to 5 turns in every arm) and the `.select` false positive (14 turns in T-r2).
- *Guidance (7.5 turns, 6.6k tokens).* The reference is 5,805 B.

What would sink it: FHX had a similar surface and reached 8.1% on turns. If the bake-off arm reads the `sealed` types or source as often as L-r2 read fhc, or if render-time refusals (hyphenated typos, root ids, classes) each cost a fix loop, the turn count will not move enough.

## 12. Method choices and gaps

1. **TSX as the surface.** Chosen because JSX gives every sink a position TypeScript already types. The sink table and brands do not depend on it; they would sit under a fluent chain or a tagged template as well.
2. **Neutralise data, throw on names and types.** A throw on a stored URL would let one hostile row take a page down. The six `attr-name` cases are "rejected" by design.
3. **`hx-confirm` is kept and neutralised** with a word joiner, not removed, so the fixture context is supported. htmx 4.0.0 uses an exact `startsWith` with no trim (`htmx.js:1977`).
4. **The XSS adapter types payloads as `any`**, because fixture payloads are untyped. Every context goes through the sink a `string` would reach.
5. **Like-for-like screens.** Both versions use the template's real tokens and `cursor-pointer` on the same four buttons.
6. **Not done:** no headless Claude Code session; no token count (bytes only); the fluent-html 8 screens were type-checked, not rendered; the controller, `sanitize()`, SVG, streaming and the lint checker are design only; the JSX types cover the elements the screens and fixtures use, with a generic row for the rest.
7. **A type and runtime drift appeared once in my own prototype** (`<label for>`). In a real build the types and the encoder table should be generated from one source.

## 13. Files

All under `/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15/security/`:

- `sealed/index.ts` (runtime, 687 lines), `sealed/jsx-runtime.ts` (sink types, 103 lines)
- `reference.md` (the arm's API reference, 5,805 B)
- `screens/` and `screens-fh8/` (the three screens in each design, with routes)
- `bench/page.tsx`, `bench/emit.mjs`; `xss/adapter.tsx`
- `probes/probes.tsx`, `probes/runtime.tsx`; `tailwind/check.mjs`
- `build.sh`, `probe.sh`, `sizes.sh`
- `out/`: `bench-prod-run2.json`, `bench-prod-run3.json`, `xss-sealed-sinks.txt` and `.json`, `html-validate-sealed-sinks.txt`, `html-validate-screens.txt`, `probes.tsc.txt`, `probes.runtime.txt`, `fh8-screens.tsc-*.txt`, `sizes.txt`, `screens/*.html`
