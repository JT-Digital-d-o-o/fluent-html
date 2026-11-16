# Strict Tags

**Name: Strict Tags.** A seventh from-scratch design, "correct by construction". It is built as a runnable prototype, and the three kills that need no Claude Code session are measured: **K2 3.27x and 3.24x**, **K3 0 escapes of 206 with 0 unsupported**, **K4 0 errors in 9 files**. **K1 and K5 are predictions**: no headless session ran, and the registered budget is the coordinator's. Safety parity holds on the probe: all eight mistake kinds fluent-html 8 rejects are errors from `tsc` alone.

`$B` is `/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15`. Everything is under `$B/strict-tags/` (called `S/`). Nothing in fluent-html's `src/`, releases, `project/pm/`, the template, the guidelines or any `CLAUDE.md` was touched, and nothing was committed. Commands are numbered C1 to C13 in the last section.

## 1. Thesis

The first round found the cost in lookups and fix loops, and its two best arms halved the turns by making classes literal and routes the owner of ids. Both arms then leaked on correctness: Lean Tags rendered 18 duplicate ids the library wrote itself and failed K4, and both needed a second checker beside tsc that produced false positives in 3 of 4 runs.

Strict Tags keeps Lean Tags' surface (lowercase tag functions, one route table) and moves every check into the types, so there is **one check command, `tsc`**, and its diagnostics are the fix:

1. **HTML's content model is in the types.** Every element's type carries the slot it fits and what its subtree holds.
2. **Accessibility is a type requirement,** checked at the call that forgot it.
3. **Tailwind's class names are a union generated from the project's design system,** and variants are functions.
4. **The route owns every address, id and form.** No view types a URL, an `hx-*` attribute or a target.
5. **One class per output context.** A string is data and is encoded where it lands; class, URL, CSS, script and raw contexts take only their own branded value.
6. **Views are synchronous functions of data.** Everything that waits, reads the request or changes something lives in the handler table.

It is plain TypeScript: no compiler, no new syntax, no parts that derive markup. So it stays clear of the two prior verdicts (no own compiler, no derived screens).

## 2. What ran

| Claim | Result | Command |
|---|---|---|
| The three screens type-check | exit 0 | C1 |
| The screens behave (search, 422, redirect, dialog, poll stop, 404) | 12 checks passed | C2 |
| Seeded mistakes are compile errors | 81 of 81 rejected, 20 of 20 valid controls accepted | C3 |
| Diagnostic quality | 69 of 81 are one line, 58 carry the fix on their first line, 0 overload lists | C3 |
| Every example in the reference compiles | exit 0 | C4 |
| Class union from Tailwind itself | 9,240 classes, 319 variant functions, 12 colours | C5 |
| Classes read from the types reach Tailwind | 52 class lists, 69 classes, 69 of 69 with a rule in a stock build | C6 |
| K2 | 3.27x (3.21 to 3.49), 3.24x (2.96 to 3.71) | C7 |
| K3 | 0 escapes; 162 safe, 6 rejected, 0 of 38 benign broken, 0 unsupported | C8 |
| K4 | 0 errors in 9 files; the control has 12 on the bench page | C9 |
| Source size | 0.85 of fluent-html 8 on views, 0.72 on the whole feature | C10 |
| Type-check cost | 1.5 s against 0.5 s at 2,000 styled elements | C11 |

Two things the probes caught in my own design, both fixed:

- **Compiling the reference examples found a real gap:** `div(match(…))` typed as `unknown`. `match` now has one signature per name (`match`, `match.on`) whose result comes from the cases.
- **The valid controls found a load-bearing type.** Inference of a tag's arguments runs backwards through one mapped type. Wrapping it in `extends infer R` to reorder two messages turned every call in the screens into an error (45 errors outside the probe). The shape is now commented as load-bearing.

## 3. The design

```ts
import { div, p, a, button, input, label, ul, li, cls, hover, md, routes, page, part, action, handlers, doc } from "strict-tags";
```

A tag takes its arguments in any order: `cls(…)` is the class list, `{ … }` the attributes, a route or wire connects it, everything else is a child. There is one signature per tag, so a mistake is one diagnostic.

### Content models in the types

A finished element is `El<Slot, Marks, Root>`. `Slot` is where it fits (`flow`, `phrasing`, `li`, `cells`, `option`, …). `Marks` are facts about its subtree that an ancestor forbids: `interactive`, `form`, `label`, `main`, `banner`, `unlabelled`, plus `text`. A 52-tag table (`Model` in `S/lib/core.ts`) says per tag which slots it takes, which marks it refuses, and which it adds.

| Rule | What tsc says (verbatim from `S/out/mistakes.txt`) |
|---|---|
| A list takes only list items | `✗ <ul> takes only li(…) children` |
| A list item outside a list | `✗ li(…) goes inside ul(…) or ol(…)` |
| A link in a link, a button in a link (also one level down) | `✗ <a> cannot contain a link, a button or a form control` |
| A form in a form | `✗ <form> cannot contain another form` |
| A block in a paragraph or heading | `✗ <p> takes text and inline elements only, not a block such as div, p, ul or form` |
| A cell without a row | `✗ td(…) and th(…) go inside tr(…)` |
| A child of a void element | `✗ <input> takes no children` |

`a` is transparent, as in HTML: block content inside a link is allowed, and the link then counts as a block.

### Accessibility by construction

| Rule | How it is enforced |
|---|---|
| A control needs a label | `input`, `select`, `textarea` carry the mark `unlabelled`. Only `label(…)` removes it; `{ "aria-label" }` or `type: "hidden"` never adds it. Every other parent refuses it: `✗ a form control needs a label: wrap it in label("Name", …) or give it { "aria-label": "…" }` |
| An image needs alt | `✗ an image needs { src, alt }: alt: "" marks a decorative image` |
| A button, link, heading or summary needs a name | Text in the subtree or `aria-label`: `✗ a button needs a name: text content or { "aria-label": "…" }` |
| A link needs a destination | A page route or `{ href: url(value) }` |
| A dialog and an iframe need a name | `modal(id).root` carries `aria-labelledby`; `iframe` needs `{ title }` |
| One `main`, and it is the swap target | `doc()` writes `<main id="main">`; views never write it |

### Tailwind checked by tsc

- **The union is Tailwind's own.** `tools/gen.mjs` loads the design system from the app's theme and writes every class it knows as a string-literal union: 9,240 classes for the closed 12-colour theme (C5). The first round's objection to Fluent Nine was a hand-written grammar; this one cannot drift.
- **Class text stays text.** `cls("flex items-center gap-4")` is split by the type system and each token is looked up in the union. `/` modifiers and bracket values on non-colour utilities are checked by pattern; `bg-[#fff]` is refused, so the palette stays closed.
- **Variants are functions,** generated from the same design system: `hover("bg-surface-2 underline")`, `md(hover("px-8"))`, `ariaInvalid("border-danger")`, `backdrop("bg-overlay/40")`, and `variant("data-[state=open]", …)` for the ones with brackets. A variant applies to every class it is given, so a prefix cannot be dropped from the second class. A misspelt one is an unknown export, which is the one place tsc offers a suggestion on its own: `Property 'hovr' does not exist … Did you mean 'hover'?`
- **The messages name the fix:**
  - `✗ "bg-gray-100": "gray-100" is not a colour of this theme. Colours: danger, danger-700, line, on-accent, overlay, primary, primary-700, success, surface, surface-2, text-dim, warning`
  - `✗ a variant is a function, not a prefix: hover("bg-surface-2")`
  - `✗ "flex gap-4" is class text: write cls("flex gap-4"). For the word as content, write text("flex gap-4")` (Lean Tags' one silent error, now a compile error)
- **Tailwind's scanner cannot see `hover("bg-x")` as `hover:bg-x`.** That is the price of variants as functions. The answer is `tools/check.mjs`: every `cls(…)` call has the type `Cls<"…the exact class text…">`, so the tool asks the type checker, not the source text. On the screens it reads 52 class lists, finds 69 classes, and a stock Tailwind build from the theme plus the generated `@source inline` file has a rule for 69 of 69 (C6). It matches no names, so the extractor's false positives (a route named `list`, `.select`) have nothing to match on.
- **The same tool catches what types cannot:** two classes in one list that set the same properties under the same variants (`cls(card, "p-0")` over `p-6`), asked of Tailwind's own output. 3 of 3 seeded conflicts found, the control line clean (C6).

### htmx targets owned by the route

Taken from Lean Tags: `page`, `part`, `action` in one table; `projects.rows().root` puts the part's id on the element and `.search("q")`, `.poll(…)`, `.load()`, `.defer()` target that same id. A part handler must answer `El<…, "project-list">`, so a wrong root is a compile error. Two changes:

- **Every derived id carries its path parameters** (`project-status-7`), and a form takes a `scope`. This is the gap that failed Lean Tags on K4.
- **The hatch takes no strings.** `wire({ get, post, target, … })` accepts routes or `local(path)`; `wire({ get: "/x" })` does not compile.

### Context brands

| Context | Accepts | A plain string |
|---|---|---|
| Text, attribute value | string | escaped |
| Class | `Cls` from `cls()`, a variant function, `cls.token(value)` | compile error |
| URL attribute | `Url` from `url(value)`, `asset("/file")`, or a route | compile error; `url("/projects")` is one too, because an in-app address comes from a route |
| htmx request | a route, or `local(path)` | compile error |
| Stylesheet | `` css`…${value}…` `` | compile error |
| Script | `json(data)`, `jsVar(name, data)` | no script tag exists |
| Raw markup | `` raw(trusted`…`) ``, a literal with no holes | compile error |

Brands are class instances checked with `instanceof`, so JSON cannot forge one. Hostile data is neutralised, not thrown on (Sealed Sinks' rule): an unsafe URL renders `#blocked`, a bad CSS value drops its declaration, a `js:` confirm text gets a word joiner in front. Only names the author controls throw.

### Pure views, effects at the route

A view is a function from data to `El` or `Page`. A promise as a child is `✗ a view is synchronous: await the data in the route handler and pass it in`. The handler table is the only place with `await`, the request and outcomes, one entry per route, and the route's kind fixes what it may answer: a page answers a document, a part answers its own root, **an action answers a redirect or `invalid(…)` and never markup**.

This is weaker than the brief's wording in one way, stated plainly: TypeScript can enforce that a view is synchronous and gets no request, not that it is pure.

## 4. The three screens

Same structure, copy and classes as the first round's R1 to R3. Files are in `S/screens/`.

**Routes** (`projects.routes.ts`)

```ts
export const projects = routes("/projects", {
  list: page("/", { q: "string?" }),
  rows: part("project-list", "/rows", { q: "string?" }),
  new: page("/new"),
  create: action("/", ProjectInput),
  detail: page("/:id", { id: "number" }),
  status: part("project-status", "/:id/status", { id: "number" }),
  remove: action("/:id/delete", { id: "number" }),
});
```

**Shared components** (`views/projects.components.ts`)

```ts
const buttonBase = cls("inline-flex cursor-pointer items-center rounded-control px-4 py-2 text-sm font-medium", focusVisible("ring-2"));
export const primaryButton = cls(buttonBase, "bg-primary text-on-accent", hover("bg-primary-700"));
export const quietButton = cls(buttonBase, "border border-line", hover("bg-surface-2"));
export const dangerButton = cls(buttonBase, "bg-danger text-on-accent", hover("bg-danger-700"));

const pill = cls("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium");

const statusTone: Record<Project["status"], Cls> = {
  active: cls("bg-success/10 text-success"),
  paused: cls("bg-warning/10 text-warning"),
  archived: cls("bg-surface-2 text-text-dim"),
};
export const StatusPill = (status: Project["status"]) => span(pill, statusTone[status], cls("capitalize"), status);

const jobTone: Record<Project["job"], Cls> = {
  queued: cls("bg-surface-2 text-text-dim"),
  running: cls("bg-primary/10 text-primary"),
  done: cls("bg-success/10 text-success"),
  failed: cls("bg-danger/10 text-danger"),
};
const jobLabel: Record<Project["job"], string> = { queued: "Export queued", running: "Exporting…", done: "Export ready", failed: "Export failed" };
export const JobBadge = ({ id, job }: Pick<Project, "id" | "job">) =>
  span(pill, jobTone[job], projects.status({ id }).poll((job === "queued" || job === "running") && "2s"), jobLabel[job]);
```

**R1, project list** (`views/projects.list.view.ts`)

```ts
type ListProps = { items: Project[]; q?: string };

const Row = (item: Project) =>
  li(
    { id: `project-${item.id}` },
    a(
      cls("flex items-center justify-between gap-4 px-4 py-3", hover("bg-surface-2")),
      projects.detail({ id: item.id }),
      div(p(cls("font-medium"), item.name), p(cls("text-sm text-text-dim"), item.description)),
      StatusPill(item.status),
    ),
  );

const Empty = ({ q }: Pick<ListProps, "q">) =>
  div(
    cls("px-4 py-12 text-center"),
    p(cls("font-medium"), q ? `No projects match "${q}"` : "No projects yet"),
    p(cls("mt-1 text-sm text-text-dim"), q ? "Try a different search." : "Create your first project to get started."),
  );

export const ProjectRows = ({ items, q }: ListProps) =>
  div(
    cls("rounded-card border border-line bg-surface"),
    projects.rows().root,
    items.length ? ul(cls("divide-y divide-line"), items.map(Row)) : Empty({ q }),
  );

export const ProjectListPage = (props: ListProps) =>
  Layout(
    { title: "Projects" },
    div(cls("flex items-center justify-between"), h1(cls("text-2xl font-semibold"), "Projects"), a(primaryButton, projects.new(), "New project")),
    input(
      cls("mt-6 w-full rounded-control border border-line bg-surface px-3 py-2 text-sm"),
      { type: "search", value: props.q, placeholder: "Search projects", "aria-label": "Search projects" },
      projects.rows().search("q"),
    ),
    div(cls("mt-4"), ProjectRows(props)),
  );
```

**R2, create form bound to a schema** (`views/projects.form.view.ts`)

```ts
type State = FormState<typeof projects.create>;

const field = cls("grid gap-1 text-sm font-medium");
const control = cls("rounded-control border border-line bg-surface px-3 py-2 font-normal", ariaInvalid("border-danger"));
const error = cls("font-normal text-danger");

export const ProjectForm = (state: State) =>
  projects.create().form(state, cls("grid max-w-lg gap-4"), (f) => [
    label(field, "Name", f.input("name", control, { required: true, maxlength: 80 }), f.error("name", error)),
    label(field, "Description", f.textarea("description", control, { rows: 4 }), f.error("description", error)),
    label(field, "Status", f.select("status", { active: "Active", paused: "Paused" }, control), f.error("status", error)),
    div(cls("flex gap-3"), button(primaryButton, { type: "submit" }, "Create project"), a(quietButton, projects.list(), "Cancel")),
  ]);

export const NewProjectPage = (state: State = {}) =>
  Layout({ title: "New project" }, h1(cls("text-2xl font-semibold"), "New project"), div(cls("mt-6"), ProjectForm(state)));
```

**R3, project detail** (`views/projects.detail.view.ts`)

```ts
const confirm = modal("delete-project");

const DeleteDialog = ({ id, name }: Project) =>
  dialog(
    cls("w-full max-w-sm rounded-card bg-surface p-6 shadow-lg", backdrop("bg-overlay/40")),
    confirm.root,
    h2(cls("text-lg font-semibold"), confirm.title, "Delete project?"),
    p(cls("mt-2 text-sm text-text-dim"), `"${name}" and its exports will be removed. This cannot be undone.`),
    div(cls("mt-6 flex justify-end gap-3"), button(quietButton, confirm.close, "Cancel"), button(dangerButton, projects.remove({ id }), "Delete project")),
  );

export const ProjectDetailPage = (project: Project) =>
  Layout(
    { title: project.name },
    a(cls("text-sm text-text-dim", hover("underline")), projects.list(), "Projects"),
    div(
      cls("mt-2 flex items-start justify-between gap-4"),
      div(h1(cls("text-2xl font-semibold"), project.name), p(cls("mt-1 text-text-dim"), project.description)),
      button(dangerButton, confirm.open, "Delete"),
    ),
    dl(
      cls("mt-6 grid grid-cols-[8rem_1fr] gap-y-3 text-sm"),
      dt(cls("text-text-dim"), "Status"),
      dd(StatusPill(project.status)),
      dt(cls("text-text-dim"), "Export"),
      dd(JobBadge(project)),
    ),
    DeleteDialog(project),
  );
```

**Handlers** (`projects.controller.ts`)

```ts
export default handlers(projects, {
  list: async ({ input }) => ProjectListPage({ q: input.q, items: await findProjects(input.q) }),
  rows: async ({ input }) => ProjectRows({ q: input.q, items: await findProjects(input.q) }),
  new: () => NewProjectPage(),
  create: { form: ProjectForm, ok: async ({ body, redirect }) => redirect(projects.detail({ id: (await createProject(body)).id })) },
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

**Size** (C10, whitespace collapsed, the screening's uniform measure, against the fluent-html 8 versions Lean Tags wrote):

| | Views | Whole feature |
|---|---|---|
| fluent-html 8 | 7,016 B | 11,176 B |
| Lean Tags | 5,754 B (0.82) | 7,797 B (0.70) |
| Strict Tags | 5,969 B (0.85) | 8,015 B (0.72) |

Variants as functions cost 3.7% of view source over Lean Tags.

## 5. The kills

| Kill | Status | Reading |
|---|---|---|
| K1 | **Predicted, not measured** | 20 to 24 turns against the control's 41.5; 20.5k to 23k output tokens against 33.2k |
| K2 | **Measured, holds** | 3.27x and 3.24x |
| K3 | **Measured, holds** | 0 escapes of 206, 0 unsupported |
| K4 | **Measured, holds** on what was rendered | 0 errors in 9 files against 12 |
| K5 | **Predicted** | Cannot fail as registered (control 0 of 2); honest expectation near 1 of 2 |

**K1.** The prediction is anchored on the one arm that shares this surface. Lean Tags measured 20 and 19 turns and 21,689 and 17,994 output tokens (verdict, C2 there).

- *What should carry over:* the same tag form, route table, handlers and form builder, and a reference of 11,073 B against Lean Tags' 10,342 B.
- *What should improve:* one check command. 3 of 4 challenger runs lost a turn to a class-checker false positive; here classes are in tsc, and the bake-off's done condition is `npx tsc --noEmit`, which every arm already runs.
- *What should get worse:* source is 3.7% longer on views, and the first compile is stricter (section 7). I price that at 1 to 4 turns.
- *Result:* 20 to 24 turns (42 to 52% under the control's mean) and 20.5k to 23k tokens (31 to 38% under). On the strictest reading (worst run against the control's best) the lines are 29.25 turns and 23,860 tokens: turns pass with margin, tokens sit near the line.
- *What would sink it:* a session that opens the 237 KB generated union, or more than three tsc rounds on content-model errors. The verdict's two caveats also apply unchanged: the floor (Fluent Nine) is unmeasured, and the task sits inside the pool a view redesign can reach.

**K2.** C7, two interleaved runs: 3.265 (3.205 to 3.49) and 3.241 (2.957 to 3.713); 55,231 and 55,676 ops per CPU-second against 16,957 and 17,032; 64,249 B allocated per page against 137,300 B. Lean Tags in the same runs is 3.78x both times, so the checks at run time (URL brand, any-order arguments) cost about 14%. The output equals `expected.fh8.html` once `type="button"` on 12 buttons and `href="#"` on 7 links are removed (`node tools/bench-page-diff.mjs`).

**K3.** C8: 0 xss, 0 css, 0 legacy; 162 of 168 hostile cases safe and 6 rejected (data-attribute names, which the author controls); 0 of 38 benign broken; 0 unsupported. This matches Sealed Sinks' profile (6 thrown) with Lean Tags' coverage (0 unsupported).

**K4.** C9: 0 errors in the six screen states, the bench page as fragment and document, and a document that shows one form in three states. The bake-off's two error kinds each get a structural answer:

- *`no-dup-id`* (24 of Lean Tags' 37 errors): derived ids carry path parameters, a form takes a `scope`, and in development a repeated id stops the render with the fix. `node tools/three-states.mjs`: the unscoped document throws `id "projects-create-form" appears twice … takes { scope: "…" }`; scoped, 14 ids, 14 distinct, html-validate exit 0.
- *`unique-landmark`* (every control error): `doc()` owns the one `main`. Two unnamed `nav`s would still trip it; that is not typed.

**K5.** The designer's own first compile of the three screens passed and the 12 behaviour checks passed on the first run. That is n=1 and not blind. The mechanism is C3: 81 of 81 mistakes rejected, none as an overload list. Because everything is in tsc, K5 needs no second definition (the verdict's point 7).

## 6. Safety parity

All through the same command, `tsc` (C3, group A in `S/probes/mistakes.ts`):

| Mistake fluent-html 8 rejects | Strict Tags | Probe |
|---|---|---|
| Unknown class | TS2345, names the class | mA1 |
| Palette literal | TS2345, lists the theme's colours | mA2 |
| Bad variant | TS2551 with "Did you mean 'hover'?"; as a prefix, TS2345 | mA3, mA4 |
| Fragment id mismatch | TS2322: another part's root, or no root, is not `El<…, "project-status">`. A target id cannot be typed at all | mA5, mA6 |
| Wrong route stance | TS2345 / TS2322: a part as a link, a page route answering a fragment | mA7, mA8 |
| A raw `hx-*` URL | TS2322 on the attribute; TS2322 on a string in `wire` | mA9, mA10 |
| Unescaped HTML | TS2345 (`raw` takes `Trusted`), TS2554 (a hole in `` trusted`…` ``) | mA11, mA12 |
| A bad attribute value | TS2820 with "Did you mean '"text"'?", TS2322 | mA13, mA14 |

Limits: 14 seeded instances of 8 kinds, not an exhaustive set, and I did not run fluent-html 8 on the same file. The probe is in a shape the seeded-mistake suite in the todo can take over.

## 7. What it costs Claude Code

1. **Variants as functions go against the prior.** Claude Code writes `hover:bg-x` by habit. Here that is a compile error whose text is the rewrite. Expect it on a first compile.
2. **A stricter first compile.** A control without a label, a block in a paragraph, a button without text, a string `href`: each used to render and now stops the build. Every one is a single diagnostic, but each tsc round is a turn.
3. **False rejections, known ones:**
   - 38 single-word class names (`hidden`, `inline`, `table`, `fixed`, …) cannot be literal text children; the fix is `text("hidden")`. My own first probe hit this with `span("inline")`.
   - A component whose children are typed plain `FlowKid[]` counts as holding anything, so it is refused inside `form`, `a`, `button`, `label`, `header`. The author declares what it may hold (`FlowKid<Content>[]`). A generic pass-through of marks does not type-check inside the component (probed; the conditional type defers). C13: 5 valid uses, 4 misuses rejected, one with a message written for this case.
   - A label must wrap its control. A label and control as siblings joined by `for` is designed, not built.
   - `a` without `href` cannot be written; a colour through brackets cannot either.
4. **Type-check time.** 1.45 to 1.55 s against 0.50 to 0.55 s for fluent-html 8 at 2,000 elements with 8 utilities each (Fluent Nine: 0.68 to 0.86 s), and 525,283 instantiations (C11). The library alone costs 0.52 s. tsserver was not measured.
5. **A generated file and a build step are back.** `tw.gen.ts` (237,305 B) must be regenerated when the theme changes, and the `@source inline` list must be rebuilt for CSS. The step reads types, not names, but it is a step, and it is the thing Fluent Nine and Lean Tags removed.
6. **Long types in the first half of a diagnostic.** The message is always in the second half, but the first can run to 300 characters of `El<…, MarksOf<…>>`.
7. **New names.** `cls`, `part`, `action`, `modal`, `url` / `asset` / `local`, `text`, `FlowKid<Content>`, and variant names in camelCase (`_2xl`, `maxMd`, `default_` are not guessable).
8. **Whole-document facts are still found at render.** Unique ids and resolving references (`hx-target`, `aria-labelledby`, `commandfor`) are a development-time audit in `doc()`, not a type (`node tools/dangling.mjs`).
9. **It leans on one TypeScript behaviour.** Reverse inference through a mapped tuple, on 5.9.3. TypeScript 7 was not tried.
10. **Scope.** Like Lean Tags it replaces routes and controllers, which is the stack-dsl lane's ground and a template change, not a fluent-html release.

## 8. What still compiles and is wrong

- A dropped variant where no conflicting base class exists (with one, the conflict check reports it; tsc never does).
- A wire whose part is not on the page, a dialog whose title was never placed, a repeated id in a fragment: caught at render in development for documents, not for fragments.
- Two `main` elements, heading order, table column counts, two controls in one label, two unnamed `nav`s.
- Marks through arrays nested three deep, and anything inside `` raw(trusted`…`) ``.
- A view that reads a global or the clock. Synchronous is enforced; pure is not.
- A form re-rendered on 422 loses its `scope` (the handler does not carry it back).
- Whether the classes produce the intended look.

## 9. Taken from the first round

| From | Taken |
|---|---|
| Lean Tags | The tag form, the route table, wires, handlers, the form builder, messages written into the expected type. Fixed: derived ids take a scope (harvest 8) |
| Sealed Sinks | One encoder per sink, brands as class instances, neutralise data and throw on names (harvest 3) |
| Page Parts | `Raw` takes a source literal (harvest 4); the document owns `main`; confirmation through a native dialog (harvest 12) |
| Fluent Nine | Class text checked by the type system, but from Tailwind's list instead of a grammar; `type="button"` (harvest 1); one signature for `match` |
| Route-typed TSX | Params inferred from the path; the 422 region on the route (harvest 7) |
| Hoisted HTML | The fragment root stays a compile-time brand (harvest 14); class text cached per literal (harvest 13) |
| Verdict | A short reference whose examples a test compiles (harvest 6: it caught one bug here); class positions decided by type, never by position (harvest 9); `aria-invalid` and `backdrop` exist because variants are generated (harvest 11) |

## 10. Method choices

1. **Runtime started from Lean Tags' prototype;** the type layer, the generator and the check are new.
2. **Class text in one string, checked token by token,** not one literal per argument: it keeps the source within 4% of Lean Tags and keeps Tailwind's spelling.
3. **A prefix variant is refused, not accepted beside the functions.** The brief asks for functions, and two spellings of one thing is what fluent-html avoids. This is the choice most likely to cost a first compile.
4. **Single-word class names as text are refused.** Correct programs that say `span("inline")` are rarer than `div("flex", …)` slips, and the message has the fix. This is a judgement, not a measurement.
5. **`alt: ""` marks a decorative image,** HTML's own convention, instead of a second flag.
6. **One handler function per route, not `{ load, view }`.** Linking a loader's result to its view needs a per-entry generic that TypeScript does not infer through the table. The view is still a separate synchronous function the handler calls.
7. **No sessions were run.** K1 and K5 need the bake-off; this step spent nothing.
8. **The bench page has `href="#"` on its seven links,** because a link needs a destination. It is not type-checked: it uses Tailwind's default palette, which the app theme closes. A 23,286-class union for that palette loads in 0.05 s more.
9. **Not built:** a Fastify adapter, a browser run, streaming, sibling label and control, SVG tags, the `strict-tags` CLI that would wrap gen and check.

## 11. Files and commands

`TSC=/Users/tony/jt-digital/fluent-html/node_modules/.bin/tsc` (5.9.3); `TW` means the prefix `TAILWIND_FROM=/Users/tony/jt-digital/fluent-html` (tailwindcss 4.3.3). All from `S/` unless a folder is named.

- **C1:** `$TSC -p tsconfig.json --pretty false`: exit 0.
- **C2:** `node tools/run-screens.mjs`: 12 checks passed (`out/run-screens.txt`).
- **C3:** `node tools/mistakes.mjs --full` (`out/mistakes.txt`): 81 of 81 rejected; 20 of 20 controls accepted; 69 one line; 58 with the fix on the first line; 0 overload lists. Groups: parity 14, content models 20, accessibility 10, Tailwind 10, routes and forms 15, contexts and purity 12.
- **C4:** `$TSC -p probes/tsconfig.reference.json`: exit 0. `wc -c REFERENCE.md`: 11,073.
- **C5:** `TW node tools/gen.mjs support/theme.css lib`: 9,240 classes, 865 with a modifier, 192 bracket roots, 319 variant functions, 17 free variants, 12 colours.
- **C6:** `TW node tools/check.mjs tsconfig.json support/theme.css --out out/classes.css`: 0 tsc errors, 52 class lists, 69 classes, 0 without a rule, 0 conflicts. `TW node tools/css-build.mjs support/theme.css out/classes.css`: 69 of 69 have a rule. `TW node tools/check.mjs probes/tsconfig.conflicts.json support/theme.css`: the 3 seeded conflicts, on 4 lines.
- **C7:** in `$B/fixtures/bench`: `NODE_ENV=production node --expose-gc harness.mjs --rounds 11 --sample-ms 300 --json arms/fluent-html-8.mjs ../../strict-tags/bench/strict-tags.mjs ../../proto-lean-tags/bench/lean-tags.mjs arms/template-literal.mjs` (`out/bench-run1.json`, `out/bench-run2.json`; load average 8.2 and 11.0).
- **C8:** in `$B/fixtures/xss`: `NODE_ENV=production node check.mjs ../../strict-tags/xss/adapter.mjs` (`out/xss.txt`): exit 0.
- **C9:** `../proto-page-parts/node_modules/.bin/html-validate -c .htmlvalidate.json out/*.html` (11.17.0, recommended): exit 0 on 9 files.
- **C10:** `sh tools/sizes.sh` (`out/sizes.txt`).
- **C11:** `$TSC -p <config> --extendedDiagnostics` with `stress/tsconfig.lib.json` (0.52 s, 6,134 instantiations), `tsconfig.json` (0.60 s, 34,285), `stress/tsconfig.json` after `python3 -I stress/gen.py 2000` (1.45 to 1.55 s over five runs, 525,283), `stress/tsconfig.fh8.json` (0.50 to 0.55 s, 168) and `stress/tsconfig.fh9.json` (0.68 to 0.86 s, 227,414), the last two on Fluent Nine's own stress files with the same seeded picks. Load average 4 to 32.
- **C12:** `node tools/three-states.mjs`, `node tools/dangling.mjs`.
- **C13:** `$TSC -p probes/tsconfig.components.json` (`out/components.txt`): 4 errors, the 4 seeded.

| Path | What |
|---|---|
| `S/lib/core.ts` | The prototype (968 lines) |
| `S/lib/tw.gen.ts` | Generated class union and variant functions |
| `S/REFERENCE.md` | The API reference for a bake-off arm |
| `S/screens/` | Routes, schema, handlers and the three screens |
| `S/probes/` | `mistakes.ts`, `reference-examples.ts`, `components.ts`, `conflicts.ts`, `valid.ts` |
| `S/tools/` | `gen.mjs`, `check.mjs`, `css-build.mjs`, `mistakes.mjs`, `run-screens.mjs`, `three-states.mjs`, `dangling.mjs`, `bench-page-diff.mjs`, `sizes.sh` |
| `S/bench/strict-tags.mjs`, `S/xss/adapter.mjs` | K2 arm and K3 adapter |
| `S/out/` | Every output quoted above |
