# Fluent Nine

# Fluent Nine: the case for keeping fluent-html

Lens: keep fluent-html. The design is fluent-html 9, a major release, not a rewrite.

**Outcome.** A prototype of the changes, built over the tracked 8.1.0 `dist/`, passes K2, K3 and K4 by measurement and should hold K5. My K1 estimate is 19 to 26% on turns and 21 to 27% on output tokens, which is at the 25% line and not safely beyond the run spread. For this design a "harvest" verdict and a "go" verdict are the same work, so the useful reading is: this is the bar any rewrite has to clear, since it costs no migration.

Everything is under `/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15/keep-fh9/`. Nothing outside that directory was written. No report file was written.

## 1. Thesis

The evidence says the cost is not in fluent-html's grammar. It is in four places:

- **A styling vocabulary Claude Code has to look up.** 21.7% of turns went on lookups, and with no context it writes `.addClass("tailwind string")` 41 and 39 times and typed styling 0 times.
- **A toolchain that reports false errors.** Observation 1 cost 4 to 5 turns in every arm; 8 of arm T's 13 failed build runs were the tools' own false positives.
- **Guessed names that answer with nothing.** `.flexWrap()` got a 49-character TS2339 with no fix.
- **Facts split between the package and the template.** The verbs, `PageRoute` and `FragmentRoute` live in a template file that is copied into nine apps.

Fluent Nine fixes those four and keeps the rest: the tree, escaping by default, `ForEach` and `Match`, `Form<T>`, `defineRoutes` and `defineIds`, the render stances, the verbs, `.when` and `.apply`, the eslint plugin's non-styling rules, and every existing exemplar.

## 2. What was built and measured

The machine ran other lanes throughout (load average 203 to 263, `uptime`), so timings are noisy; ratios within one run are the reliable part.

| Measure | fluent-html 8 | Fluent Nine prototype | Command (from `keep-fh9/`, `T=../../../../../node_modules/.bin/tsc`) |
|---|---|---|---|
| Three screens compile | yes | yes | `$T -p tsconfig.json --pretty false` (exit 0) |
| First compile when I wrote them (n=1, not blind) | 2 errors, 2 causes | 3 errors, 1 cause | same command, first run of each set |
| Source size, views plus shared UI | 7,948 B, 2,741 proxy tokens | 7,299 B (0.92), 2,298 (0.84) | `python3 -I measure-source.py` |
| Type-check, three screens | 0.71 to 0.94 s, 25,121 instantiations | 1.28 to 2.17 s, 70,727 | `$T -p tsconfig.fh8.json --extendedDiagnostics`, same for `fh9`, three runs each |
| Type-check, 2,000 elements with 8 utilities each | 0.90 and 0.95 s | 2.03 and 2.18 s | `python3 -I stress/gen.py 2000`, then `$T -p stress/tsconfig.fh8.json --extendedDiagnostics`, same for `fh9` |
| K2, build+render ratio | 1 | 1.29 (1.04 to 1.43), run 2: 1.25 (1.15 to 1.41) | `NODE_ENV=production node --expose-gc harness.mjs --rounds 11 --sample-ms 300 arms/fluent-html-8.mjs ../../keep-fh9/bench/fh9-same.mjs ../../keep-fh9/bench/fh9-idiomatic.mjs` (in `fixtures/bench`) |
| Allocation per build+render | 139,074 B | 108,486 B | same run |
| K3, escapes | 18 | 0 (41 rejected, 127 safe, 0 benign broken) | `NODE_ENV=production node check.mjs ../../keep-fh9/xss/fluent-html-9.mjs` (in `fixtures/xss`) |
| K4, bench page | 12 errors | 0 | `npx html-validate` 11.17.0 on `out/bench-page.fh9.fragment.html` and `.document.html` |
| K4, six screen states | 0 | 0 (4 on the first render, see section 10) | `npx html-validate out/fh8/*.html`, `out/fh9/*.html` |
| Classes found by Tailwind with no extractor | not applicable | 70 of 70 tokens have a rule; build 478 ms | `node css/build.mjs /Users/tony/jt-digital/competition` (Tailwind 4.3.3) |
| Type surface | 268,554 B of `.d.ts`; styling is 86,401 B (32%), 231 methods on `Tag` | styling methods leave the default surface | `find dist/src -name "*.d.ts" \| xargs cat \| wc -c` and `wc -c` on the styling files |
| Reference, styling section | 10,286 B of 36,123 B | about 1.5 KB (estimate) | section sizes of `projects-template/.ai/web-development/fluent-html.md` |

The rendered HTML of the two versions is the same once class order is ignored, apart from two spellings fluent-html 8's variant union does not have: `aria-invalid:` (8 writes `aria-[invalid=true]:`) and `backdrop:` (8 needs `[&::backdrop]:`).

## 3. The design: eight changes

Ranked by how much of the gain each carries. Changes 1 and 2 are the core.

### 1. `.tw("…")`: literal class text, checked by the type system

```ts
Div().tw("flex items-center gap-2 px-4 py-2 rounded-control bg-primary text-on-accent hover:bg-primary-700 md:px-8")
Input().tw(field, "mb-4")                                  // a constant plus more text
Div().tw("w-full border", invalid && "border-danger")      // falsy parts are skipped
const card = tw("p-6 bg-surface border border-line rounded-card");   // a checked constant, type Tw
const primary = tw(button, "bg-primary text-on-accent");            // constants compose by argument
```

- Every token is checked: the variants are peeled off, then the base class is matched against the grammar and the theme. Variants stay in the string, spelled as Tailwind spells them.
- The closed palette stays a compile error. `bg-gray-100` and `bg-[#fff]` fail; arbitrary values are allowed only on size and spacing prefixes (`w-[180px]`).
- A runtime string fails. Class text is literal or a `tw()` constant, so Tailwind can always see it.
- This is the gated `.tl()` sink (`project/pm/llm-styling/tl-sink/`) with two differences: variants are allowed, and it is the only styling surface, so the five lint rules that policed the 3-or-more boundary between `.tl` and methods are not needed.

Messages, verbatim from `out/tw-messages.txt` (one line each):

```
Argument of type '"flex bg-gray-100 p-4"' is not assignable to parameter of type 'false | ("flex bg-gray-100 p-4" & ["✗ 'bg-gray-100': 'gray-100' is not a theme colour. Colours: primary, primary-700, on-accent, bg, surface, surface-2, …"]) | null | undefined'.
… & ["✗ 'justify-centre' is not a class in this theme"]
… & ["✗ 'hovr:bg-primary': unknown variant 'hovr:'"]
… & ["✗ .tw() takes literal class text or a tw(…) constant, not a string built at runtime"]
… & ["✗ class text is literal: a tw(…) constant or a value goes in its own argument, .tw(base, \"…\"), never inside a template string"]
```

One lesson from the probe: the parameter type must be written inline in the signature. Through a type alias, tsc prints the alias name (`TwPart<"…">`) and the error text is lost. This is the aliasing cost the radical report carried into R09.

### 2. The typed styling methods leave the default surface; the extractor and safelist go

- New code has no `.bg()`, `.p()`, `.hover({…})`. The 231 methods move to an opt-in import (`fluent-html/styling-methods`) that the nine apps keep until they run the codemod.
- Tailwind scans `src/**/*.ts` itself. The prototype check: all 70 class tokens in the rendered screens, including those inside `tw()` constants and a status map, got a rule from Tailwind 4.3.3 with `@source` pointed at the screens and nothing else.
- What disappears with it: `generateFluentSafelist`, `staticManifest`, observation 1 (a route named `list`), the `.select` false positive, `no-dynamic-typed-styling-arg`, and the 17.4% css build failure rate's main cause.

### 3. Class merge on by default

8.2.0's opt-in serialize-time merge (`setClassMerge`) becomes the default. `.tw(card, "p-0")` then means what it says. My own fluent-html 8 screen R1 contains probe 28b's silent bug (`.apply(card).p("0")` renders `p-6 … p-0`, and `p-6` wins by stylesheet order); it compiled clean.

### 4. Guessed names answer with the fix

Generated from the vocabulary, as non-callable members whose type carries the fix (`out/tombstone-messages.txt`):

```
error TS2349: This expression is not callable.
  Type 'Use<".tw(\"flex-col\")">' has no call signatures.
  Type 'Use<".setSrc(url)">' has no call signatures.
```

Three sets: the 231 removed styling methods, the unprefixed attribute names (`.src`, `.href`, `.value`, probes 12 to 14), and names removed before 9 (`.hxDelete`, `.on`, `.textColor`).

### 5. The verbs and their route types move into the package

`.nav .tab .submit .fragment .search .onChange .poll .defer .fire`, `PageRoute` and `FragmentRoute<N>` ship as `fluent-html/verbs`, configured once (`configureVerbs({ main: ids.mainContent, indicator: ids.globalLoading })`). Their behaviour is unchanged; the prototype uses a verbatim copy of the template file. This reverses the 21. 07. 26 decision that kept `.poll` in the template, on new evidence: the copies fork (nine apps), and lookups hit `src/core/htmx` 6 times in one T arm.

### 6. One place to look

- `dist/index.d.ts` becomes one rolled-up file with an `@example` on every export. Agents grep dist 690 times and open the docs 0 times, so the file they grep should hold the answer.
- `npx fluent-html which <word>` prints the signature and one compiling example from an index built at release.
- With styling gone, the surface an agent can guess into shrinks by a third.

### 7. Nine security closers

Section 7. They are required for K3 and independent of K1.

### 8. Two defaults

- `Button()` emits `type="button"`; a submit button is `SubmitButton()`.
- `Match` gets one signature for the exhaustive case so a missing key is a one-line TS2741, not a seven-line TS2769 with the fact at character 1,027 (probe 2). Not prototyped.

## 4. The three screens

Both versions compile in the prototype rig and render the same HTML. Imports are as compiled: `../../proto/fh9.js` stands for `fluent-html` 9, and `../../proto/verbs.js` for `fluent-html/verbs` (9) or the template's `swap-verbs.ts` (8). The page functions return the content of `#main-content`; in an app `Layout({ title, children })` wraps it.

### Routes and ids (shared by the three screens)

Fluent Nine:

```ts
import { defineIds, defineRoutes } from "../../proto/fh9.js";

export const ids = defineIds(["project-list", "project-form", "project-status", "delete-dialog"] as const);

export const projectRoutes = defineRoutes("/projects", {
  list:   { path: "/", query: { q: "string" } as const },
  rows:   { path: "/rows", query: { q: "string" } as const, render: ids.projectList },
  new:    { path: "/new" },
  create: { method: "post", path: "/" },
  detail: { path: "/:id", params: { id: "number" } as const },
  status: { path: "/:id/status", params: { id: "number" } as const, render: ids.projectStatus },
  remove: { method: "delete", path: "/:id", params: { id: "number" } as const },
} as const);
```

fluent-html 8: identical except the first route, which cannot be called `list`:

```ts
// The list route is `index`, not `list`: a route named `list` called with arguments fails
// `npm run css` in fluent-html 8 (the extractor reads it as the `.list()` styling method).
  index:  { path: "/", query: { q: "string" } as const },
```

### Shared UI

Fluent Nine (`screens/fh9/ui.ts`, 1,077 B):

```ts
import { Div, tw, type LabelTag, type Tag, type View } from "../../proto/fh9.js";

const button = tw("inline-flex items-center px-4 py-2 rounded-control text-sm font-medium cursor-pointer");

export const primaryButton = tw(button, "bg-primary text-on-accent hover:bg-primary-700 focus-visible:ring-2 focus-visible:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed");
export const quietButton = tw(button, "border border-line-strong bg-surface text-text hover:bg-surface-2");
export const dangerButton = tw(button, "bg-danger text-on-accent hover:bg-danger-700");

export const field = tw("w-full px-3 py-2 rounded-control border border-line-strong bg-surface text-text focus:border-primary focus:outline-hidden aria-invalid:border-danger");

export const card = tw("p-6 bg-surface border border-line rounded-card");

export function FieldGroup(p: { label: LabelTag; control: Tag; error: View }) {
  return Div(
    p.label.tw("block mb-1 text-sm font-medium text-text"),
    p.control.tw(field),
    Div(p.error).tw("mt-1 text-sm text-danger"),
  ).tw("mb-4");
}
```

fluent-html 8 (`screens/fh8/ui.ts`, 1,500 B):

```ts
import { Div, type LabelTag, type Tag, type View } from "fluent-html";
import "./theme.js";

export type Styler = <T extends Tag>(t: T) => T;

export const primaryButton: Styler = (t) => t
  .inlineFlex().items("center").px("4").py("2").rounded("control")
  .bg("primary").text("sm").font("medium").text("on-accent")
  .hover({ bg: "primary-700" })
  .focusVisible({ ring: "2", outline: "hidden" })
  .disabled({ opacity: "50", cursor: "not-allowed" });

export const quietButton: Styler = (t) => t
  .inlineFlex().items("center").px("4").py("2").rounded("control")
  .border().border("line-strong").bg("surface").text("sm").font("medium").text("text")
  .hover({ bg: "surface-2" });

export const dangerButton: Styler = (t) => t
  .inlineFlex().items("center").px("4").py("2").rounded("control")
  .bg("danger").text("sm").font("medium").text("on-accent")
  .hover({ bg: "danger-700" });

export const field: Styler = (t) => t
  .w("full").px("3").py("2").rounded("control").border().border("line-strong").bg("surface").text("text")
  .focus({ border: "primary", outline: "hidden" })
  .variant("aria-[invalid=true]", { border: "danger" });

export const card: Styler = (t) => t.p("6").bg("surface").border().border("line").rounded("card");

export function FieldGroup(p: { label: LabelTag; control: Tag; error: View }) {
  return Div(
    p.label.block().mb("1").text("sm").font("medium").text("text"),
    p.control.apply(field),
    Div(p.error).mt("1").text("sm").text("danger"),
  ).mb("4");
}
```

### R1, project list: debounced search into the list region, rows link to detail, empty state

Fluent Nine:

```ts
import { A, Div, ForEachKeyed, H1, IfThenElse, Input, Li, P, Span, Ul } from "../../proto/fh9.js";
import "../../proto/verbs.js";
import type { Project } from "../domain.js";
import { ids, projectRoutes } from "./projects.routes.js";
import { StatusBadge } from "./r3-detail.view.js";
import { card, field, primaryButton } from "./ui.js";

type ListProps = { projects: Project[]; q: string };

export function ProjectListPage({ projects, q }: ListProps) {
  return Div(
    Div(
      H1("Projects").tw("text-2xl font-semibold text-text"),
      A("New project").nav(projectRoutes.new()).tw(primaryButton),
    ).tw("flex items-center justify-between mb-6"),
    Input()
      .setType("search")
      .setName("q")
      .setValue(q)
      .setPlaceholder("Search projects")
      .setAria({ label: "Search projects" })
      .tw(field, "mb-4")
      .search(ids.projectList, projectRoutes.rows()),
    ProjectList({ projects, q }),
  );
}

export function ProjectList({ projects, q }: ListProps) {
  return Div(
    IfThenElse(
      projects.length > 0,
      () => Ul(ForEachKeyed(projects, (p) => `project-${p.id}`, ProjectRow)).tw("divide-y divide-line"),
      () => EmptyState({ q }),
    ),
  ).setId(ids.projectList).tw(card, "p-0");
}

function ProjectRow(project: Project) {
  return Li(
    A(
      Div(
        Span(project.name).tw("font-medium text-text"),
        Span(project.client).tw("text-sm text-text-dim"),
      ).tw("flex flex-col"),
      StatusBadge({ status: project.status }),
    )
      .nav(projectRoutes.detail({ id: project.id }))
      .tw("flex items-center justify-between gap-4 px-6 py-4 hover:bg-surface-2"),
  );
}

function EmptyState({ q }: { q: string }) {
  return Div(
    P(q ? `No projects match "${q}".` : "No projects yet.").tw("font-medium text-text"),
    P("Create one to get started.").tw("text-sm text-text-dim"),
  ).tw("px-6 py-12 text-center");
}
```

fluent-html 8:

```ts
import { A, Div, ForEachKeyed, H1, IfThenElse, Input, Li, P, Span, Ul } from "fluent-html";
import "../../proto/verbs.js";
import type { Project } from "../domain.js";
import { ids, projectRoutes } from "./projects.routes.js";
import { StatusBadge } from "./r3-detail.view.js";
import { card, field, primaryButton } from "./ui.js";

type ListProps = { projects: Project[]; q: string };

export function ProjectListPage({ projects, q }: ListProps) {
  return Div(
    Div(
      H1("Projects").text("2xl").font("semibold").text("text"),
      A("New project").nav(projectRoutes.new()).apply(primaryButton),
    ).flex().items("center").justify("between").mb("6"),
    Input()
      .setType("search")
      .setName("q")
      .setValue(q)
      .setPlaceholder("Search projects")
      .setAria({ label: "Search projects" })
      .apply(field)
      .mb("4")
      .search(ids.projectList, projectRoutes.rows()),
    ProjectList({ projects, q }),
  );
}

export function ProjectList({ projects, q }: ListProps) {
  return Div(
    IfThenElse(
      projects.length > 0,
      () => Ul(ForEachKeyed(projects, (p) => `project-${p.id}`, ProjectRow)).divideY().divide("line"),
      () => EmptyState({ q }),
    ),
  ).setId(ids.projectList).apply(card).p("0");
}

function ProjectRow(project: Project) {
  return Li(
    A(
      Div(
        Span(project.name).font("medium").text("text"),
        Span(project.client).text("sm").text("text-dim"),
      ).flex().flex("col"),
      StatusBadge({ status: project.status }),
    )
      .nav(projectRoutes.detail({ id: project.id }))
      .flex().items("center").justify("between").gap("4").px("6").py("4")
      .hover({ bg: "surface-2" }),
  );
}

function EmptyState({ q }: { q: string }) {
  return Div(
    P(q ? `No projects match "${q}".` : "No projects yet.").font("medium").text("text"),
    P("Create one to get started.").text("sm").text("text-dim"),
  ).px("6").py("12").text("center");
}
```

### R2, create form bound to a schema: 422 re-renders the form region with field errors, a valid submit redirects

Fluent Nine:

```ts
import { Button, Div, Form, H1, SubmitButton, type ErrorBag } from "../../proto/fh9.js";
import "../../proto/verbs.js";
import type { CreateProjectReq } from "../domain.js";
import { ids, projectRoutes } from "./projects.routes.js";
import { card, FieldGroup, primaryButton, quietButton } from "./ui.js";

type FormProps = { values?: Partial<CreateProjectReq>; errors?: ErrorBag<CreateProjectReq> };

export function NewProjectPage(props: FormProps = {}) {
  return Div(
    H1("New project").tw("text-2xl font-semibold text-text mb-6"),
    ProjectForm(props),
  ).tw("max-w-lg");
}

/** The form region: also the 422 answer on its own, swapped in by `{ invalid }`. */
export function ProjectForm({ values, errors }: FormProps) {
  return Div(
    Form<CreateProjectReq>({ values, errors }, (f) => [
      FieldGroup({
        label: f.label("name", "Name"),
        control: f.input("name", "text").toggle("required"),
        error: f.error("name"),
      }),
      FieldGroup({
        label: f.label("client", "Client"),
        control: f.input("client", "text").toggle("required"),
        error: f.error("client"),
      }),
      FieldGroup({
        label: f.label("kind", "Kind"),
        control: f.select("kind", [
          { value: "site", label: "Website" },
          { value: "app", label: "Web app" },
        ]),
        error: f.error("kind"),
      }),
      Div(
        SubmitButton("Create project").tw(primaryButton),
        Button("Cancel").behavior("back").tw(quietButton),
      ).tw("flex gap-3 mt-6"),
    ]).nav(projectRoutes.create(), { invalid: ids.projectForm }),
  ).setId(ids.projectForm).tw(card);
}
```

fluent-html 8: the same file with these lines different.

```ts
import { Button, Div, Form, H1, type ErrorBag } from "fluent-html";

    H1("New project").text("2xl").font("semibold").text("text").mb("6"),
    ProjectForm(props),
  ).maxW("lg");

      Div(
        Button("Create project").setType("submit").apply(primaryButton),
        Button("Cancel").setType("button").behavior("back").cursor("pointer").apply(quietButton),
      ).flex().gap("3").mt("6"),
    ]).nav(projectRoutes.create(), { invalid: ids.projectForm }),
  ).setId(ids.projectForm).apply(card);
```

The handler is the template's and does not change (not compiled in this rig, since `defineController` lives in the template):

```ts
create: guarded({ guards: [requireUser], schema: { body: CreateProjectBody } }, async (request, reply) => {
  const checked = validateProject(request.body);
  if (!checked.ok) {
    const props = { values: request.body, errors: checked.errors };
    return reply.code(422).renderView(isHtmxRequest(request) ? ProjectForm(props) : NewProjectPage(props));
  }
  const project = await createProject(request.server.prisma, request.user.id, checked.value);
  return reply.redirect(projectRoutes.detail.resolve({ id: project.id }));
}),
```

### R3, project detail: delete through a native dialog, a status region that polls until the job ends

Fluent Nine:

```ts
import { Button, Dialog, Div, H1, H2, MatchValue, P, Span, tw, type Tw } from "../../proto/fh9.js";
import "../../proto/verbs.js";
import type { Project, ProjectStatus } from "../domain.js";
import { ids, projectRoutes } from "./projects.routes.js";
import { card, dangerButton, quietButton } from "./ui.js";

export function ProjectDetailPage({ project }: { project: Project }) {
  return Div(
    Div(
      Div(
        H1(project.name).tw("text-2xl font-semibold text-text"),
        P(project.client).tw("text-text-dim"),
      ),
      Button("Delete").setCommand("show-modal").setCommandfor(ids.deleteDialog).tw(quietButton),
    ).tw("flex items-start justify-between mb-6"),
    Div(
      H2("Build").tw("text-sm font-medium text-text-dim mb-2"),
      ProjectStatusRegion({ project }),
    ).tw(card),
    DeleteDialog({ project }),
  );
}

const isRunning = (status: ProjectStatus) => status === "queued" || status === "building";

/** The polled region: it carries the poll only while the job runs, so the last answer stops it. */
export function ProjectStatusRegion({ project }: { project: Project }) {
  return Div(
    StatusBadge({ status: project.status }),
    Span(`Updated ${project.updatedAt}`).tw("text-sm text-text-faint"),
  )
    .setId(ids.projectStatus)
    .tw("flex items-center gap-3")
    .when(isRunning(project.status), (t) => t.poll(projectRoutes.status({ id: project.id }), "3s"));
}

const BADGE = {
  queued: { label: "Queued", tone: tw("bg-surface-2 text-text-dim") },
  building: { label: "Building", tone: tw("bg-warning/10 text-warning") },
  ready: { label: "Ready", tone: tw("bg-success/10 text-success") },
  failed: { label: "Failed", tone: tw("bg-danger/10 text-danger") },
} satisfies Record<ProjectStatus, { label: string; tone: Tw }>;

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const { label, tone } = MatchValue(status, BADGE);
  return Span(label).tw("inline-flex px-2 py-0.5 rounded-full text-xs font-medium", tone);
}

function DeleteDialog({ project }: { project: Project }) {
  return Dialog(
    H2("Delete this project?").tw("text-lg font-semibold text-text"),
    P(`"${project.name}" and its builds are removed. This cannot be undone.`).tw("mt-2 text-sm text-text-dim"),
    Div(
      Button("Cancel").setCommand("close").setCommandfor(ids.deleteDialog).tw(quietButton),
      Button("Delete project").nav(projectRoutes.remove({ id: project.id })).tw(dangerButton),
    ).tw("flex justify-end gap-3 mt-6"),
  )
    .setId(ids.deleteDialog)
    .setClosedby("any")
    .setAria({ label: "Delete project" })
    .tw("w-full max-w-md p-6 rounded-card bg-surface backdrop:bg-inverse/50");
}
```

fluent-html 8:

```ts
import { Button, Dialog, Div, H1, H2, Match, P, Span } from "fluent-html";
import "../../proto/verbs.js";
import type { Project, ProjectStatus } from "../domain.js";
import { ids, projectRoutes } from "./projects.routes.js";
import { card, dangerButton, quietButton } from "./ui.js";

export function ProjectDetailPage({ project }: { project: Project }) {
  return Div(
    Div(
      Div(
        H1(project.name).text("2xl").font("semibold").text("text"),
        P(project.client).text("text-dim"),
      ),
      Button("Delete")
        .setType("button")
        .setCommand("show-modal")
        .setCommandfor(ids.deleteDialog)
        .cursor("pointer")
        .apply(quietButton),
    ).flex().items("start").justify("between").mb("6"),
    Div(
      H2("Build").text("sm").font("medium").text("text-dim").mb("2"),
      ProjectStatusRegion({ project }),
    ).apply(card),
    DeleteDialog({ project }),
  );
}

const isRunning = (status: ProjectStatus) => status === "queued" || status === "building";

/** The polled region: it carries the poll only while the job runs, so the last answer stops it. */
export function ProjectStatusRegion({ project }: { project: Project }) {
  return Div(
    StatusBadge({ status: project.status }),
    Span(`Updated ${project.updatedAt}`).text("sm").text("text-faint"),
  )
    .setId(ids.projectStatus)
    .flex().items("center").gap("3")
    .when(isRunning(project.status), (t) => t.poll(projectRoutes.status({ id: project.id }), "3s"));
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const badge = (label: string) => Span(label).inlineFlex().px("2").py("0.5").rounded("full").text("xs").font("medium");
  return Match(status, {
    queued: () => badge("Queued").bg("surface-2").text("text-dim"),
    building: () => badge("Building").bg("warning/10").text("warning"),
    ready: () => badge("Ready").bg("success/10").text("success"),
    failed: () => badge("Failed").bg("danger/10").text("danger"),
  });
}

function DeleteDialog({ project }: { project: Project }) {
  return Dialog(
    H2("Delete this project?").text("lg").font("semibold").text("text"),
    P(`"${project.name}" and its builds are removed. This cannot be undone.`).mt("2").text("sm").text("text-dim"),
    Div(
      Button("Cancel")
        .setType("button")
        .setCommand("close")
        .setCommandfor(ids.deleteDialog)
        .cursor("pointer")
        .apply(quietButton),
      Button("Delete project").setType("button").nav(projectRoutes.remove({ id: project.id })).apply(dangerButton),
    ).flex().justify("end").gap("3").mt("6"),
  )
    .setId(ids.deleteDialog)
    .setClosedby("any")
    .setAria({ label: "Delete project" })
    .w("full").maxW("md").p("6").rounded("card").bg("surface")
    .variant("[&::backdrop]", { bg: "inverse/50" });
}
```

The status handler answers the fragment in both: `status: fragment(async ({ server, params }) => ProjectStatusRegion({ project: await findProject(server.prisma, params.id) }), { guards: [requireUser] })`. The poll stops when the region renders without `.poll`.

### What writing them showed

- **fluent-html 8, first compile: 2 errors.** `.flexCol()` (TS2339, no suggestion; the fix is `.flex("col")`) and `.variant("backdrop", …)` (TS2345 naming two type aliases; `backdrop` is not in the union at all). Each needed a grep into `dist/`. These are the two error classes every T arm hit.
- **Fluent Nine, first compile: 3 errors, one cause.** I interpolated a `tw()` constant into a template string. The design now takes constants as separate arguments and the message says so.
- **The view files barely shrink** (0.93 to 0.98 in bytes). The shared UI file shrinks most (0.72). The 0.63 figure for strings does not hold on screens that already use presets. Density is a small part of K1; lookups and fix loops are the large part.

## 5. Tailwind, htmx, routes and fragment ids

**Tailwind.**
- Class text is the only styling surface. Theme tokens come from `defineTheme()` as today; it also feeds the validator's theme arm (colours, radius) and a colour list for the error message.
- Tailwind's own scanner reads the source. No extractor, no safelist prebuild, no `staticManifest`.
- A value picked by a domain value is a map of `tw()` constants, checked exhaustive with `satisfies Record<Status, Tw>`.
- A legitimate non-Tailwind class still goes through `.cssClass("js-map")`; a runtime value through `styles(tag, {…})`.

**htmx.** Unchanged in behaviour: the verbs carry target, swap, trigger, sync and history; `{ invalid: ids.form }` routes the 422; `.poll` swaps `outerHTML` and stops when rendered without the verb. They now ship in the package.

**Routes and fragment ids.** Unchanged: `defineRoutes`, `defineIds`, the `render:` stance, `PageRoute` and `FragmentRoute<N>`. A fragment verb still refuses a route whose stance is another id, and the 0 id mismatches at 293 sites carry over because nothing in that layer moves. A route may be named `list` again.

## 6. Rendering strategy

The retained tree and the serializer stay. K2 only needs 0.9, and the tree is what `.when`, `.apply`, `ForEachKeyed`, the verbs and the class merge operate on.

- Build gets cheaper: one `.tw()` call appends one string. Measured 1.25 to 1.29 times fluent-html 8 on build+render with byte-identical output, 22% less allocation.
- Render-only is unchanged (23,797 against 23,956 ops per CPU-second in run 1).
- The template-literal ceiling is 20 times faster. Fluent Nine does not chase it; no evidence ties render speed to turns.

## 7. Escaping model

Kept: one escaper for text and attributes, double-quoted attributes, `on*` attribute names throw, typed URL setters run `sanitizeUrl`. That part had 0 escapes in 110 hostile cases.

Added, each closing a named fluent-html 8 escape (`proto/fh9-safe.ts`, 80 lines):

| Sink | fluent-html 8 | Fluent Nine |
|---|---|---|
| Data in a script element | `Script(JSON.stringify(x))`: `<!--<script>` swallows the page | `JsonScript(x)`; `InlineScript(js\`window.__DATA = ${x}\`)` where every hole is script-safe JSON |
| Style element | `Style(string)`: rule breakout, comment | `StyleSheet(css\`.x{color: ${v}}\`)`: every hole must be one CSS value or it throws |
| Inline style from data | `setStyle(\`color: ${v}\`)`: second declaration | `styles(tag, { color: v })` with the same value check; `setStyle` takes a literal only |
| Runtime URL | `externalUrl()` is a cast | `externalUrl()` checks the scheme and throws |
| htmx endpoint and confirm | `js:` and `javascript:` run as code | endpoint refused; a confirm text starting with the prefix is emitted as text |
| Data-attribute keys | `data-hx-on:click` reaches the page | keys that htmx reads are refused |
| `srcdoc` | runs with the page's origin | always sandboxed |
| `Raw()` | accepts any string | takes a branded value only (R09's `Raw` brand) |

Result on the fixture set: 0 escapes, 41 rejected, 127 safe, 0 of 38 benign values broken.

## 8. Composition and escape hatches

- Components are plain functions with a props object. Nothing changes.
- `.when`, `.whenElse`, `.whenMatch` and `.apply` stay (489, 105 and 1,448 sites keep working). A `Styler` is still `(t) => t.tw("…")` when it does more than add classes.
- Class constants compose by argument: `tw(base, "…")`, `.tw(card, "p-0", wide && "max-w-lg")`.
- Escape hatches, one per case: arbitrary size `w-[180px]` in the class text; non-Tailwind class `.cssClass()`; runtime style `styles()`; a property with no utility `.cssProp()`; attributes without a setter `addAttribute()` with the key allowlist.

## 9. What a rewrite would lose, and what Fluent Nine does with each

| Asset | Size | In Fluent Nine |
|---|---|---|
| Typed route, stance and fragment contracts | 773 verb calls, 0 id mismatches at 293 sites | kept unchanged |
| `Form<T>`, `Match`, `ForEach` | field typo is the best message in the probe set; `.map` went 644 to 0 | kept |
| Exemplars in nine apps and the template | blind in-repo runs: 0 tsc, 0 lint, 25 of 25 acceptance | all stay valid; a rewrite starts at zero exemplars |
| 2,330 call sites | nine apps | non-styling calls untouched; styling calls keep working behind one import until a codemod runs (88.4% of styling sites were static literals in the `.tl` spike) |
| eslint plugin | 32 rule files; 15 police the class and styling surface | those 15 retire, the other 17 stay (`ls src/rules` in the plugin repo) |
| Extractor | 1,131 lines (`wc -l`) | retired on purpose, app by app |
| Class-merge family table | 0 of 7,948 merged pairs lose a property | kept and turned on |
| Behaviors v4 | runtime asset plus acceptance matrix | kept |

## 10. The kills

**K1: at the line.** Estimated from the arm T buckets (107 turns, 89.7k output tokens), not measured.

| Mechanism | Turns | Output tokens | Basis |
|---|---|---|---|
| Styling lookups stop | -9.0 | -9k to -11.7k | FHX measured exactly this change |
| View-vocabulary fix loops stop (`aria-invalid`, `.flexWrap`, `.select`, observation 1) | -12.5 | -5.9k | 12 and 17 turns in T-r1 and T-r2, less 2 turns of overlap with lookups; 473 tokens per check turn |
| New error class (constant in a template string, duplicates) | +2 | +1k | my own first compile |
| Shorter view writes | 0 | -3.2k | 0.84 proxy ratio on 19.9k |
| Smaller reference | -1 | -1.5k | 10.3 KB styling section becomes about 1.5 KB |
| **Total** | **-20.5 (19%)** | **-18.6k to -21.3k (21 to 24%)** | |
| If route, form and verb lookups fall by a third | -4 | -3k | unproven |
| If class-emission checks in the compiled CSS stop | 0 to -3 | not priced | the bucket was sampled by hand |
| **Upper end** | **26%** | **27%** | |

The spread between two runs is 13% on turns and 6% on tokens, so I do not claim a pass beyond the spread. FHX reached 8.1% and 22.9%.

**K2: pass, measured.** 1.29 (1.04 to 1.43) and 1.25 (1.15 to 1.41).

**K3: pass, measured on the prototype.** 0 against 18.

**K4: pass, measured.** Bench page 0 against 12. Screens 0 against 0. The first render of my Fluent Nine screens had 4 `no-dup-class` errors: `.nav` stamps `cursor-pointer` and my button constant carried it too. The default-on class merge removes duplicates; the prototype stands in with a token check inside `.tw()`.

**K5: expected no worse.** One anecdote (section 4), no blind run. Mechanism: the two error classes seen in every T arm cannot be written in class text, and each new message names the fix on one line.

## 11. Method choices, costs and gaps

- **Name `.tw`, not a typed `addClass`.** `addClass` is what the prior writes, but 159 literal non-Tailwind tokens already pass through the raw sinks in the fleet. A new name is purely additive and can be prototyped through the `FluentCustomMethods` seam; `no-tailwind-in-raw-class` already detects the prior's spelling and its autofix would rename to `.tw`.
- **Variants in the string, against the 31. 07. 26 decision.** That decision scored strings low on silent errors. What changed since: the prior moved (0 invented methods, all styling as class strings), FHX measured that class text removes the styling lookups, observation 1 was found, and 8.2's merge gate answers the "merge deletes a class" objection. A dropped `hover:` compiles clean in both forms. This needs a new decision record, not a quiet reversal.
- **Type-check cost is real.** About 0.6 s fixed plus about 0.3 ms per call under load: 2.1 s against 0.9 s at 2,000 styled elements. The `.tl` spike measured 1.0 s fixed.
- **The grammar is hand-written for the prototype** (about 100 lines, enough for the screens and the bench page). The real one is generated by `gen:vocab`, and its fixed cost with the full vocabulary is the spike's number, not mine.
- **The token figure is a lexer proxy.** No Claude tokenizer is installed here.
- **Not prototyped:** the d.ts rollup, the `which` command, the `Match` signature, the codemod, the real class merge (8.1.0 dist has none).
- **I wrote both screen sets** with the project rules in context and the design in my head. The first-compile counts are an anecdote, not a trial.
- **Recommendation for the bake-off:** run this prototype as an arm. It is the cheapest arm to build (it exists), and any rewrite that does not beat it is paying migration for nothing.

## Files

- `/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15/keep-fh9/proto/tw-types.ts` (validator), `proto/fh9.ts` (`.tw`, `tw`, `Button`, `SubmitButton`), `proto/fh9-safe.ts` (closers), `proto/verbs.ts` (copy of the template verbs)
- `…/keep-fh9/screens/fh8/`, `…/keep-fh9/screens/fh9/`, `…/keep-fh9/screens/domain.ts`, `…/keep-fh9/render-screens.ts`
- `…/keep-fh9/probes/tw-probe.ts`, `…/keep-fh9/probes/tombstone/probe.ts`
- `…/keep-fh9/bench/fh9-same.mjs`, `bench/fh9-idiomatic.mjs`, `bench/dump.mjs`
- `…/keep-fh9/xss/fluent-html-9.mjs`
- `…/keep-fh9/css/app.css`, `css/build.mjs`
- `…/keep-fh9/stress/gen.py`, `…/keep-fh9/measure-source.py`
- `…/keep-fh9/out/` (every captured output: `tw-messages.txt`, `tombstone-messages.txt`, `source-size.txt`, `bench-run1.txt`, `bench-run2.txt`, `xss-fh9.txt`, `html-validate-*.txt`, rendered HTML, `app.fh9.css`)
- `…/keep-fh9/node_modules/fluent-html` is a symlink to the repo root and `build/` is tsc output; both are gitignored.
