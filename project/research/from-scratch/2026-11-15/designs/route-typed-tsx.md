# Route-typed TSX

# Route-typed TSX: fluent-html redesigned through the training-prior lens

**Verdict from this lens:** worth one bake-off slot. A prototype exists and passes K2, K3 and K4 on the round's fixtures. K1 and K5 need headless sessions, which I did not run. My estimate for K1 clears 25% on output tokens only narrowly, so "harvest" is the likely floor, and the harvest list is at the end.

All paths below are under `/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15/training-prior/` unless they start with `/`. Nothing outside that directory was written, and nothing was committed.

## 1. Thesis

With no documentation, Claude Code already writes HTML, Tailwind class strings and `hx-*` attributes. The evidence says so directly: with no context it writes 0 typed styling calls and routes everything through class strings. So the view surface should be exactly that, typed:

- **Real TSX**, compiled by tsc or esbuild through `jsxImportSource`. No file format, no compiler of ours.
- **HTML's own names**: `class`, `for`, `tabindex`, `hx-get`, `command`, `closedby`.
- **Tailwind as literal class text**, checked against the app's own Tailwind design system.
- **The htmx protocol lives on the route declaration.** The route says what it answers (a page, a fragment id, the 422 region, a poll interval). The element only names the route.

The last point is the one FHX did not have. It is aimed at the cost FHX left in place: route, query and form lookups (13 calls per L arm, against 13 to 14 in T).

## 2. What differs from FHX, and why the rest of the cost should move

| FHX | Route-typed TSX | Cost bucket it touches |
|---|---|---|
| `.fhx` files, own compiler (fhc), generated TypeScript siblings | Plain `.tsx`; tsc type-checks it, esbuild or tsc emits it | L-r2 read compiler source in 5 of 6 fhc calls; L-r1 read generated TS 4 times. Neither exists here. |
| Whitespace rule of its own, described wrongly | JSX whitespace, as tsc implements it | 7 of L's 10 failed test runs |
| Extractor still scanned the generated siblings | Tailwind v4 scans the class literals in the source itself; no extractor, no safelist | Observation 1: 4 to 5 turns per arm in T and L; the `.select` false positive |
| Compiled to fluent-html, so routes, forms and verbs stayed as they were | Routes own target, swap, 422 region and poll; `form(route)` types the fields | The 13 route/form/verb lookups per arm; the people-screen loss (11% worse) |
| No reference document | 10 exports, `reference.md` at 4,658 B (cap: 56,541 B) | Guidance reads; lookups that moved to source |
| No Styler form | Class constants, arrays, `Record<Status, string>`, function components | Composition |

**What this does not show.** That the route and form lookups vanish in a real session. FHX's token gain was 57% from fewer lookups. This design's claim rests on removing most of the remainder, and only the bake-off can measure that.

## 3. The API

Ten exports from `rtsx` (the prototype's package name):

| Export | Use |
|---|---|
| `defineIds([...])` | `ids.projectList` is the id `project-list`; goes into `id`, `for`, `commandfor`, `hx-target`, `aria-*` |
| `defineRoutes(prefix, defs)` | `projects.detail({ id })` is a `Route` value; goes into `href`, `action`, `hx-get`, `hx-post`, ... |
| `form(route, state?)` | field names, values and errors typed from the route's `body` or `query` |
| `match(value, cases)`, `match(value, "key", cases)` | exhaustive branch on a union |
| `json(data)`, ``js`...${data}` `` | the only content a `<script>` accepts |
| ``css`...${value}` `` | the only content a `<style>` accepts |
| `url(value)` | a link target that came from data |
| `localUrl(path)` | a same-origin path from data, for `hx-get` |
| `unsafeHtml(trusted)` | the declared bypass |
| `mainContent` | the id of the layout's swap region |

Everything else is HTML, htmx and Tailwind vocabulary.

**Routes and ids** (`screens/projects.routes.ts`, in full):

```ts
import { defineIds, defineRoutes } from "rtsx";
import { CreateProject, ListQuery } from "./projects.schema.js";

export const ids = defineIds(["project-list", "project-form", "delete-dialog", "delete-title", "job-status"]);

export const projects = defineRoutes("/projects", {
  list: { path: "/", query: ListQuery },
  results: { path: "/results", query: ListQuery, render: ids.projectList },
  new: { path: "/new" },
  create: { method: "post", path: "/", body: CreateProject, invalid: ids.projectForm },
  detail: { path: "/:id" },
  status: { path: "/:id/status", render: ids.jobStatus, poll: "2s" },
  remove: { method: "delete", path: "/:id" },
});
```

- Path params are inferred from the path literal. Params and query go in one flat object: `projects.detail({ id: 3 })`, `projects.list({ q: "atlas" })`.
- `render` is fluent-html 8's stance, unchanged: absent means a page, an id means that fragment, `"none"` means not markup.
- `invalid` and `poll` are new: they move the 422 region and the poll rule from the call site to the declaration.
- The schema is TypeBox-shaped (`{ static: T }`). The prototype uses a 10-line stand-in (`screens/schema.ts`); real TypeBox drops in.

## 4. The three screens

### R1, project list: rtsx (`screens/projects.list.view.tsx`)

```tsx
import { projects, ids } from "./projects.routes.js";
import type { Project } from "./projects.schema.js";
import { Layout } from "./layout.js";
import { StatusBadge, control, primary } from "./ui.js";

type Props = { rows: Project[]; q: string };

export function ProjectsPage({ rows, q }: Props) {
  return (
    <Layout title="Projects">
      <div class="flex items-center justify-between gap-4">
        <h1 class="text-2xl font-semibold text-text">Projects</h1>
        <a href={projects.new()} class={primary}>
          New project
        </a>
      </div>
      <input
        type="search"
        name="q"
        value={q}
        placeholder="Search projects"
        aria-label="Search projects"
        hx-get={projects.results()}
        hx-trigger="input changed delay:300ms"
        hx-sync="this:replace"
        class={["mt-6 w-full", control]}
      />
      <ProjectList rows={rows} q={q} />
    </Layout>
  );
}

export function ProjectList({ rows, q }: Props) {
  return (
    <div id={ids.projectList} class="mt-4">
      {rows.length === 0 ? (
        <p class="py-12 text-center text-text-dim">{q ? `No projects match "${q}".` : "No projects yet. Create the first one."}</p>
      ) : (
        <ul class="divide-y divide-line">
          {rows.map((p) => (
            <li id={`project-${p.id}`}>
              <a href={projects.detail({ id: p.id })} class="flex items-center justify-between gap-4 py-3 hover:bg-surface-2">
                <span>
                  <span class="block font-medium text-text">{p.name}</span>
                  <span class="block text-sm text-text-dim">{p.client}</span>
                </span>
                <StatusBadge status={p.status} />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

The search input renders `hx-get="/projects/results" hx-target="#project-list" hx-swap="outerMorph"`: target and swap come from the route's `render`. Each row link renders `href` plus the same nav attributes fluent-html 8's `.nav()` emits.

### R1: fluent-html 8 (`fh8-screens/projects.list.view.ts`)

```ts
import { A, Div, H1, Input, Li, P, Span, Ul, ForEachKeyed, IfThenElse } from "fluent-html";
import { Layout } from "../../core/layout/layout.view.js";
import { projectRoutes, ids } from "./projects.routes.js";
import type { Project } from "./projects.schema.js";
import { StatusBadge, control, primary } from "./ui.js";

type Props = { rows: Project[]; q: string };

export function ProjectsPage({ rows, q }: Props) {
  return Layout({
    title: "Projects",
    children: [
      Div(
        H1("Projects").text("2xl").font("semibold").text("text"),
        A("New project").nav(projectRoutes.new()).apply(primary),
      ).flex().items("center").justify("between").gap("4"),
      Input("search")
        .setName("q")
        .setValue(q)
        .setPlaceholder("Search projects")
        .setAria("label", "Search projects")
        .search(ids.projectList, projectRoutes.results())
        .mt("6")
        .w("full")
        .apply(control),
      ProjectList({ rows, q }),
    ],
  });
}

export function ProjectList({ rows, q }: Props) {
  return Div(
    IfThenElse(
      rows.length === 0,
      () => P(q ? `No projects match "${q}".` : "No projects yet. Create the first one.").py("12").text("center").text("text-dim"),
      () => Ul(ForEachKeyed(rows, (p) => p.id, ProjectRow)).divideY().divide("line"),
    ),
  ).setId(ids.projectList).mt("4");
}

function ProjectRow(p: Project) {
  return Li(
    A(
      Span(
        Span(p.name).block().font("medium").text("text"),
        Span(p.client).block().text("sm").text("text-dim"),
      ),
      StatusBadge({ status: p.status }),
    )
      .nav(projectRoutes.detail({ id: p.id }))
      .flex()
      .items("center")
      .justify("between")
      .gap("4")
      .py("3")
      .hover({ bg: "surface-2" }),
  );
}
```

### R2, create form: rtsx (`screens/projects.new.view.tsx`)

```tsx
import { form, type FormState } from "rtsx";
import { projects } from "./projects.routes.js";
import { STATUSES, type CreateProject } from "./projects.schema.js";
import { Layout } from "./layout.js";
import { Field, control, primary, quiet } from "./ui.js";

type Props = { state?: FormState<CreateProject> };

export function NewProjectPage({ state }: Props) {
  return (
    <Layout title="New project">
      <h1 class="text-2xl font-semibold text-text">New project</h1>
      <ProjectForm state={state} />
    </Layout>
  );
}

export function ProjectForm({ state }: Props) {
  const f = form(projects.create(), state);
  return (
    <form {...f.form} class="mt-6 flex max-w-lg flex-col gap-4">
      <Field f={f} name="name" label="Name">
        <input {...f.field("name")} type="text" required maxlength={80} class={control} />
      </Field>
      <Field f={f} name="client" label="Client">
        <input {...f.field("client")} type="text" required class={control} />
      </Field>
      <Field f={f} name="status" label="Status">
        <select {...f.field("status")} class={control}>
          {STATUSES.map((s) => (
            <option value={s}>{s}</option>
          ))}
        </select>
      </Field>
      <Field f={f} name="notes" label="Notes">
        <textarea {...f.field("notes")} rows={4} class={control} />
      </Field>
      <div class="flex justify-end gap-3">
        <a href={projects.list()} class={quiet}>
          Cancel
        </a>
        <button type="submit" class={primary}>
          Create project
        </button>
      </div>
    </form>
  );
}
```

`{...f.form}` renders `hx-post="/projects" hx-target="#main-content" hx-swap="outerMorph" hx-status:422="target:#project-form swap:outerMorph push:false" id="project-form"`: the form's id and the 422 region are one declaration (`invalid: ids.projectForm`), so they cannot disagree. `f.field("name")` supplies `name`, `id`, `value`, and, when the field has an error, `aria-invalid="true"` and `aria-describedby="name-error"`. The handler answers 422 with `ProjectForm` alone for an htmx request and redirects on success, as today.

### R2: fluent-html 8 (`fh8-screens/projects.new.view.ts`)

```ts
import { A, Button, Div, Form, H1 } from "fluent-html";
import { Layout } from "../../core/layout/layout.view.js";
import { projectRoutes, ids } from "./projects.routes.js";
import { STATUSES, type CreateProject } from "./projects.schema.js";
import { Field, control, primary, quiet } from "./ui.js";

type FormState = { values?: Partial<CreateProject>; errors?: Partial<Record<keyof CreateProject, string>> };
type Props = { state?: FormState };

export function NewProjectPage({ state }: Props) {
  return Layout({
    title: "New project",
    children: [H1("New project").text("2xl").font("semibold").text("text"), ProjectForm({ state })],
  });
}

export function ProjectForm({ state = {} }: Props) {
  const errors = state.errors ?? {};
  return Form<CreateProject>(state, (f) => [
    Field({ name: "name", label: "Name", error: errors.name, control: f.input("name", "text").toggle("required").setMaxlength(80).apply(control) }),
    Field({ name: "client", label: "Client", error: errors.client, control: f.input("client", "text").toggle("required").apply(control) }),
    Field({
      name: "status",
      label: "Status",
      error: errors.status,
      control: f.select("status", STATUSES.map((s) => ({ value: s, label: s }))).apply(control),
    }),
    Field({ name: "notes", label: "Notes", error: errors.notes, control: f.textarea("notes").setRows(4).apply(control) }),
    Div(
      A("Cancel").nav(projectRoutes.list()).apply(quiet),
      Button("Create project").setType("submit").apply(primary),
    ).flex().justify("end").gap("3"),
  ])
    .setId(ids.projectForm)
    .submit(projectRoutes.create(), { invalid: ids.projectForm })
    .mt("6")
    .flex()
    .flexCol()
    .gap("4")
    .maxW("lg");
}
```

### R3, project detail: rtsx (`screens/projects.detail.view.tsx`)

```tsx
import { match } from "rtsx";
import { projects, ids } from "./projects.routes.js";
import type { Job, Project } from "./projects.schema.js";
import { Layout } from "./layout.js";
import { StatusBadge, danger, quiet } from "./ui.js";

export function ProjectDetailPage({ project, job }: { project: Project; job: Job }) {
  return (
    <Layout title={project.name}>
      <nav aria-label="Breadcrumb" class="text-sm text-text-dim">
        <a href={projects.list()} class="hover:underline">
          Projects
        </a>
        {" / "}
        {project.name}
      </nav>
      <div class="mt-4 flex items-center justify-between gap-4">
        <h1 class="text-2xl font-semibold text-text">{project.name}</h1>
        <StatusBadge status={project.status} />
      </div>
      <p class="mt-1 text-text-dim">{project.client}</p>
      <p class="mt-6 flex items-center gap-3 text-sm text-text">
        Export
        <JobStatus projectId={project.id} job={job} />
      </p>
      <button command="show-modal" commandfor={ids.deleteDialog} class="mt-8 rounded-control border border-danger px-4 py-2 text-danger hover:bg-danger/10">
        Delete project
      </button>
      <dialog id={ids.deleteDialog} closedby="any" aria-labelledby={ids.deleteTitle} class="rounded-card bg-surface p-6 shadow-lg backdrop:bg-black/40">
        <h2 id={ids.deleteTitle} class="text-lg font-semibold text-text">
          Delete {project.name}?
        </h2>
        <p class="mt-2 text-text-dim">This removes the project and its exports. It cannot be undone.</p>
        <div class="mt-6 flex justify-end gap-3">
          <button command="close" commandfor={ids.deleteDialog} class={quiet}>
            Cancel
          </button>
          <button hx-delete={projects.remove({ id: project.id })} class={danger}>
            Delete
          </button>
        </div>
      </dialog>
    </Layout>
  );
}

const tone: Record<Job["state"], string> = {
  queued: "bg-surface-2 text-text-dim",
  running: "bg-primary/10 text-primary",
  done: "bg-success/10 text-success",
  failed: "bg-danger/10 text-danger",
};

export function JobStatus({ projectId, job }: { projectId: number; job: Job }) {
  const running = job.state === "queued" || job.state === "running";
  return (
    <span id={ids.jobStatus} hx-get={running && projects.status({ id: projectId })} class={["rounded-full px-3 py-1 text-sm font-medium", tone[job.state]]}>
      {match(job, "state", {
        queued: () => "Queued",
        running: (j) => `Running, ${j.percent}%`,
        done: (j) => <time datetime={j.finishedAt}>Done</time>,
        failed: (j) => `Failed: ${j.reason}`,
      })}
    </span>
  );
}
```

While the job runs, the badge renders `hx-get="/projects/1/status" hx-trigger="every 2s" hx-target="this" hx-swap="outerHTML"` (the route's `poll: "2s"`). When it finishes, `hx-get={false}` leaves the attribute out, so the poll stops. The "outerHTML, never a morph" rule is in the renderer, not in guidance.

### R3: fluent-html 8 (`fh8-screens/projects.detail.view.ts`)

```ts
import { A, Button, Dialog, Div, H1, H2, Nav, P, Span, Time, Match, type StylerFor } from "fluent-html";
import { Layout } from "../../core/layout/layout.view.js";
import { projectRoutes, ids } from "./projects.routes.js";
import type { Job, Project } from "./projects.schema.js";
import { StatusBadge, danger, quiet } from "./ui.js";

export function ProjectDetailPage({ project, job }: { project: Project; job: Job }) {
  return Layout({
    title: project.name,
    children: [
      Nav(A("Projects").nav(projectRoutes.list()).hover({ underline: true }), " / ", project.name)
        .setAria("label", "Breadcrumb")
        .text("sm")
        .text("text-dim"),
      Div(
        H1(project.name).text("2xl").font("semibold").text("text"),
        StatusBadge({ status: project.status }),
      ).mt("4").flex().items("center").justify("between").gap("4"),
      P(project.client).mt("1").text("text-dim"),
      P("Export", JobStatus({ projectId: project.id, job })).mt("6").flex().items("center").gap("3").text("sm").text("text"),
      Button("Delete project")
        .setType("button")
        .setCommand("show-modal")
        .setCommandfor(ids.deleteDialog)
        .cursor("pointer")
        .mt("8")
        .rounded("control")
        .border()
        .border("danger")
        .px("4")
        .py("2")
        .text("danger")
        .hover({ bg: "danger/10" }),
      DeleteDialog({ project }),
    ],
  });
}

function DeleteDialog({ project }: { project: Project }) {
  return Dialog(
    H2(`Delete ${project.name}?`).setId(ids.deleteTitle).text("lg").font("semibold").text("text"),
    P("This removes the project and its exports. It cannot be undone.").mt("2").text("text-dim"),
    Div(
      Button("Cancel").setType("button").setCommand("close").setCommandfor(ids.deleteDialog).cursor("pointer").apply(quiet),
      Button("Delete").setType("button").submit(projectRoutes.remove({ id: project.id })).apply(danger),
    ).mt("6").flex().justify("end").gap("3"),
  )
    .setId(ids.deleteDialog)
    .setClosedby("any")
    .setAria("labelledby", ids.deleteTitle)
    .rounded("card")
    .bg("surface")
    .p("6")
    .shadow("lg")
    .variant("backdrop", { bg: "black/40" });
}

const tone: StylerFor<Job["state"]> = (t, state) =>
  t.whenMatch(state, {
    queued: (b) => b.bg("surface-2").text("text-dim"),
    running: (b) => b.bg("primary/10").text("primary"),
    done: (b) => b.bg("success/10").text("success"),
    failed: (b) => b.bg("danger/10").text("danger"),
  });

export function JobStatus({ projectId, job }: { projectId: number; job: Job }) {
  const running = job.state === "queued" || job.state === "running";
  return Span(
    Match(job, "state", {
      queued: () => "Queued",
      running: (j) => `Running, ${j.percent}%`,
      done: (j) => Time("Done").setDatetime(j.finishedAt),
      failed: (j) => `Failed: ${j.reason}`,
    }),
  )
    .setId(ids.jobStatus)
    .when(running, (t) => t.poll(projectRoutes.status({ id: projectId }), "2s"))
    .rounded("full")
    .px("3")
    .py("1")
    .text("sm")
    .font("medium")
    .apply((t) => tone(t, job.state));
}
```

**The fluent-html 8 versions were not compiled.** I wrote them from the template's rules and reference; the raw template is not tsc-able and I did not scaffold one. Individual method names may be off (for example `setAria`, `divideY`, `hover({ underline })`). Read them as a size and shape comparison only.

### Size, both spellings

Command: `node tools/count.mjs`. No tokenizer was available on this machine, so these are proxies: characters with whitespace collapsed, and lexemes (words, numbers, each punctuation character).

| Part | rtsx chars / lexemes | fluent-html 8 chars / lexemes | Char ratio | Lexeme ratio |
|---|---|---|---|---|
| Routes and ids | 639 / 211 | 662 / 231 | 0.97 | 0.91 |
| Shared ui (badge, field, presets) | 1,233 / 417 | 1,531 / 634 | 0.81 | 0.66 |
| R1 list | 1,434 / 538 | 1,547 / 591 | 0.93 | 0.91 |
| R2 form | 1,370 / 504 | 1,618 / 570 | 0.85 | 0.88 |
| R3 detail | 2,324 / 818 | 2,771 / 1,098 | 0.84 | 0.74 |
| **Total** | **7,000 / 2,488** | **8,129 / 3,124** | **0.86** | **0.80** |

The views are 14 to 20% shorter, not the 0.63x measured for styling alone: JSX closing tags give back part of what class strings save. View writing is therefore the smaller lever here. Lookups and check loops are the larger one.

## 5. How Tailwind, htmx, routes and fragment ids work

**Tailwind.**
- A class is a complete literal in `class`, in a constant, or in a `Record<Union, string>`. `class` also takes an array; falsy entries drop out.
- Tailwind v4's own source scanner sees the literals. There is no extractor, no safelist and no prebuild step.
- The closed palette is the theme itself (`--color-*: initial` plus role tokens in `screens/app.css`).
- `tools/check.mjs` loads that CSS through Tailwind's `__unstable__loadDesignSystem` and asks it about every class literal. This is the same API Tailwind's editor tooling uses, so the checker's vocabulary cannot drift from the build. Output on planted mistakes (`node tools/check.mjs probes/tsconfig.json screens/app.css`, saved in `out/check-probes.txt`):
  - `"bg-gray-100": gray-100 is not a color in this theme. Theme colors: black, surface, surface-2, text, ...`
  - `"flex-wrapp" is not a class in this theme. Nearest: flex-wrap, flex-nowrap, flex-row`
  - `"hover:bg-surfce" is not a class in this theme. Nearest: hover:bg-surface, ...`
  - `"px-4" and "px-6" set the same properties (padding-inline); keep one`
  - `a class must be a complete literal: pick between whole strings, do not build one with ${}`
- It follows a class through a constant or a record lookup. It checks each literal on its own; a conflict between two literals on one element (`[primary, "bg-danger"]`) is not detected in the prototype.
- **The cost:** palette and class errors come from the check command, not from tsc. fluent-html 8 reports a palette literal at compile time. A type-level class check was rejected: JSX intrinsic attributes cannot be generic, and tokenizing class strings in template-literal types would slow the edit loop.

**htmx.**
- Attributes are typed in the JSX namespace: `hx-get` takes only a GET route, `hx-post` only a POST route, `hx-target` an id or `this`/`closest ...`, `hx-swap` htmx 4's list, `hx-vals` an object.
- The renderer derives the rest from the route: target, swap, URL push, the 422 rule, the poll trigger. An explicit `hx-target` or `hx-swap` wins.
- `<a href={route}>` to a page route renders `href` plus the nav attributes; a link to a fragment route is a compile error.
- Client-only interactions use the platform: `command`/`commandfor`, `popovertarget`, `<dialog closedby>`, `<details>`. The remaining behaviors (clipboard, class toggle) would be a typed `behavior` attribute; not prototyped.
- **A measured limit of TSX.** tsc does not check an unknown attribute whose name has a hyphen, so `hx-gte={...}` compiles. For a hyphenated attribute with a wrong value it also reports on the element with the fact on the last line (5 lines for `hx-post` given a GET route). The checker closes both: it reprints tsc's diagnostics with the innermost message first (`hx-post: Type '"get"' is not assignable to type '"post"'`) and flags unknown `hx-*` names with the nearest match. The renderer also throws on them.

**Fragment ids.**
- `defineIds` gives `Id` values. The same value is the element's `id`, the route's `render` and any `hx-target`, so an id is never typed twice as a string.
- **A regression against fluent-html 8.** Every JSX expression has the one type `JSX.Element`, so the compile-time brands "this view's root carries this id" and "this is a Layout result" cannot exist. The prototype's `Html` value carries its root id and a document flag, so `renderFragment` and `renderPage` can assert at first render (in the first integration test). The assertion itself is not built in the prototype.

## 6. Rendering strategy

- `jsx(type, props)` returns an `Html` value holding the finished string for that element. Children are rendered before their parent, so there is no tree, no serialize pass and no per-node object beyond the wrapper.
- Attribute names are classified once and cached (plain, URL, htmx verb, target, JSON, style, ...).
- Runtime source: 635 lines, 31 kB of TypeScript across five files (`wc` on `rtsx/*.ts`).
- Measured (section 9): 2.65 to 2.77 times fluent-html 8, 78 kB allocated per page against 138 kB. The template-literal ceiling is 21 times fluent-html 8, so a precompiling JSX transform could go further; it is not needed for K2.
- Consequence: a parent cannot restyle a child after the fact. A component that should accept extra classes takes a `class` prop.

## 7. Escaping model

One path for every attribute, decided by the attribute's name at render time, so there is no "typed setter is safe, generic setter is not" split.

| Sink | Rule |
|---|---|
| Text children | Escaped. Only `Html` instances pass through. `Html` is a class instance, so a value from JSON or a form can never be one. |
| Any attribute value | Escaped, always double-quoted. |
| Attribute names | Closed by the types. At run time: must match a name pattern; `on*`, `hx-on*`, `data-hx-*` and unknown `hx-*` throw. `dataset={{...}}` keys must be kebab-case and not `hx-*`. |
| `href`, `src`, `action`, `formaction`, `poster`, `cite`, `data`, `ping`, `background`, `manifest`, `xlink:href` | Scheme-checked however they are set (http, https, mailto, tel, sms, safe `data:` media). Anything else renders `about:invalid#blocked`. |
| `hx-get/post/put/patch/delete` | Accept only `Route` instances, whose URLs start with `/` and have encoded params. A path from data goes through `localUrl()`, which refuses anything that is not a same-origin path. |
| `hx-vals`, `hx-headers` | Objects only, serialized as JSON. |
| `hx-confirm`, `hx-trigger` | A `js:`/`javascript:` prefix throws; a trigger filter (`[expr]`) throws. |
| `style` | An object only. Each value must be a plain CSS value (no `;`, braces, quotes, backslash, `url(`, comments). |
| `<script>` | Content only from `json(data)` or ``js`...` ``; `<`, `>`, `&` and the line separators are written as `\uXXXX`. |
| `<style>` | Content only from ``css`...` ``; every hole is validated as a plain CSS value. |
| `srcdoc` | Renders `sandbox=""` when no sandbox is given; `allow-scripts` with `allow-same-origin` throws. |

Method choices: a hostile URL from data is neutralized rather than thrown (a page listing user links should still render); programmer errors (a string in `hx-get`, a string in `<script>`) throw. Refusals were probed at run time (`out/runtime-probes.txt`, 14 cases).

## 8. Composition and escape hatches

- **Components** are functions with a props object, used as `<StatusBadge status={...} />`. A generic component works (`Field<T>` types `name` from the form).
- **Style presets** are string constants (`control`, `primary`); a preset picked by a domain value is a `Record<Status, string>`, which tsc checks for a missing key.
- **Conditionals and lists** are JSX's own (`cond ? a : b`, `cond && x`, `.map`). `match()` covers discriminated unions; a missing case is a compile error (probed).
- **Lost against fluent-html 8:** `ForEach` over `.map` as an enforced rule, the `.apply`/`.when` chain on an existing element, and the two compile-time brands named above. `{count && <X />}` renders `0`; a lint rule would have to catch it, and none is written.
- **Escape hatches, one per situation:** `unsafeHtml(trusted)` for trusted markup; `url()` and `localUrl()` for URLs from data; `style={{ ... }}` for a runtime value; an allowlist flag on the checker for non-Tailwind classes; an explicit `hx-target`/`hx-swap` to override what the route derives.
- **Prior leaks are typed as their own fix.** `className`, `htmlFor`, `onClick` and five others are declared with a string-literal type that states what to write, so tsc's first line is the fix: `Type '"p-4"' is not assignable to type 'false | "rtsx: write class" | null | undefined'`.

## 9. The kills

| Kill | Claim | Measured? |
|---|---|---|
| K1 | Estimate: 26 to 29% fewer output tokens, 23 to 25% fewer turns | No. No headless session was run. |
| K2 | 2.77x and 2.65x fluent-html 8 | Yes |
| K3 | 0 escapes in 206 cases | Yes |
| K4 | 0 errors (fluent-html 8: 12 on the bench page) | Yes |
| K5 | Expected no worse, with one named risk | No |

**K1, the estimate and its arithmetic** (against arm T's 89.7k output tokens and 107 turns):

| Bucket | fluent-html 8 | Estimate here | Mechanism |
|---|---|---|---|
| Lookups | 18.3k, 23.25 turns | about 5k, 8 turns | Styling is class text (FHX already showed 9/7 to 1/1). No compiler or generated code to read. Routes and forms fit a 4,658 B reference. I assume half of the route and form lookups remain. |
| View writes | 19.9k | about 15.5k to 17k | 0.80 to 0.86 size ratio from the table above. FHX measured -5.9k for a similar surface. |
| Check loops | 8.3k, 17.55 turns | about 5k, 8 to 10 turns | The view-vocabulary red-to-green turns (12 and 17 in the T arms: `.variant("aria-invalid")`, `.flexWrap()`, observation 1, the `.select` false positive) have no counterpart. New costs: hyphenated-attribute diagnostics, htmx 4 values that differ from an htmx 2 prior, prior-leak props. |
| Guidance | 6.6k | about 3.5k | FHX measured -3.4k with a 6.5 kB teaching text; this one is 4.7 kB. |

That sums to roughly -23k to -26k tokens. The margin over 25% is smaller than arm T's 6% spread between runs, so a single pair of runs may not separate it. On turns the estimate sits at the line. **What would falsify it in the bake-off:** more than about 10 lookups per run on routes, query or forms, or a first-compile failure rate above the control's.

**K2.** Command, run in `fixtures/bench/`: `NODE_ENV=production node --expose-gc harness.mjs --rounds 11 --sample-ms 300 --json arms/fluent-html-8.mjs ../../training-prior/bench/route-typed-tsx.mjs [arms/template-literal.mjs]`. Load average was 144 to 206 during the runs.

| Run | fluent-html 8 (ops/CPU-s) | rtsx (ops/CPU-s) | Ratio (range) | Alloc B/op, fh8 / rtsx |
|---|---|---|---|---|
| 1 (`out/bench-run1.json`) | 12,739 | 34,959 | 2.77 (2.58 to 2.93) | 138,326 / 78,177 |
| 2 (`out/bench-run2.json`) | 14,637 | 39,770 | 2.65 (2.51 to 2.98) | 138,808 / 78,038 |

The harness reports `sameAsExpected: false`. A separate comparison shows the output equals `expected.fh8.html` after whitespace squashing once the 12 `type="button"` attributes are removed (inline `node -e` script; output in `out/bench-page.html`).

**K3.** Command, run in `fixtures/xss/`: `NODE_ENV=production node check.mjs ../../training-prior/xss/route-typed-tsx.mjs` (output in `out/xss-route-typed-tsx.txt`). 168 hostile: 0 xss, 0 css, 0 legacy, 28 rejected, 140 safe. 38 benign: 0 broken. 0 unsupported. The adapter (`xss/adapter.tsx`) uses the idiomatic API per context and never `unsafeHtml()`.

**K4.** Command, in `scratchpad/fs-validate` (html-validate 11.17.0, recommended preset): `npx html-validate rtsx/*.html`. Exit 0 on the bench page and on nine rendered states of the three screens (list, empty, list fragment, new, invalid, form fragment, running, done, status fragment). The 12 control errors disappear because of the button `type` default, which is a property of the design, not of how the page was written.

**K5.** Not measured. What I did measure: the three screens type-check clean (`tsc -p tsconfig.json`, TypeScript 5.9.3) and pass the checker; of 20 planted mistakes (`probes/negative.tsx`), tsc catches 19 and the checker catches the twentieth (`hx-gte`). Edit-loop cost on the three screens under load: tsc about 0.9 s CPU, the full checker about 1.2 s CPU (`/usr/bin/time -p`).

## 10. Risks and gaps

- **K1 and K5 are estimates.** Everything this lens claims about Claude Code's behaviour is argued from Evidence 1, not observed.
- **The fluent-html 8 screens are uncompiled**, and the size comparison has no real token count.
- **Not verified in a browser.** The derived attributes copy what fluent-html 8's verbs emit per its reference (`outerMorph`, `hx-status:422`, `every 2s` with `outerHTML`); I did not load htmx 4 against the output.
- **Two compile-time guarantees become first-render assertions** (page versus fragment, fragment root id).
- **The checker is a second tool beside tsc.** Class errors, hyphenated-attribute typos and readable htmx diagnostics all depend on it. It is a linter over standard TSX with no codegen, but it is owned code (8.9 kB in the prototype).
- **Method choices recorded:** prototype directory `training-prior/`; package name `rtsx`; TypeBox replaced by a same-shape stand-in; bundles built with esbuild 0.28.1 from fluent-html's `node_modules`; strict spelling (`class` only) chosen over accepting React aliases, to keep one spelling in the codebase.

## 11. If the verdict is harvest

Each of these works without TSX and could go into fluent-html's own releases:

1. **Class checking through Tailwind's design system** instead of an extractor, with nearest-class and theme-color hints and dead-pair detection (`tools/check.mjs`).
2. **A fact-first reprint of tsc diagnostics**: innermost message first, one line per finding.
3. **`invalid` and `poll` on the route declaration**, so `.submit` and `.poll` need no options and the id cannot disagree.
4. **The K3 closures**: `json()`/`js`/`css` helpers, refusing `hx-on*` and `data-hx-*` keys, refusing `js:` in htmx URLs and confirm text, a default `sandbox` on `srcdoc`, scheme checks on every URL attribute however it is set. These take the 18 escapes to 0.
5. **A default `type` on `<button>`**, which removes all 12 html-validate errors on the bench page.

## Files

- `rtsx/` : `core.ts` (Html, Id, Route, json/js/css, match), `jsx-runtime.ts` (renderer and escaping), `jsx.ts` (the JSX namespace), `form.ts`, `index.ts`
- `reference.md` : the API reference for a bake-off arm (4,658 B)
- `screens/` : routes, schema, layout, shared ui and the three screens; `app.css` is the theme
- `fh8-screens/` : the fluent-html 8 versions (uncompiled)
- `tools/check.mjs` (the checker), `tools/build.sh`, `tools/render-screens.tsx`, `tools/count.mjs`
- `bench/arm.tsx`, `xss/adapter.tsx` and their built `.mjs` files
- `probes/` : `negative.tsx` (20 type mistakes), `classes.tsx` (class mistakes), `runtime.tsx` (14 runtime refusals)
- `out/` : bench JSON, XSS table, checker output, runtime probes, rendered HTML
