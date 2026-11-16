# Strict Tags: API reference

Server-rendered HTML for htmx 4 and Tailwind v4, in plain TypeScript. The types hold HTML's rules, your Tailwind theme and your routes, so one command checks everything: `npx tsc --noEmit`. A mistake is one diagnostic, and its text starting with `✗` is the fix.

```ts
import { div, p, a, button, input, label, ul, li, cls, hover, md, routes, page, part, action, handlers, doc } from "strict-tags";
```

## Tags

`tag(...arguments)`, in any order:

| Argument | Meaning |
|---|---|
| `cls("flex gap-4")` | The class list (see Classes) |
| `{ id: "x", required: true }` | Attributes: HTML's own lowercase names, typed per tag. `true` writes a bare attribute; `false`, `null`, `undefined` omit it |
| a route or a wire | `projects.detail({ id })`, `projects.rows().root` (see Routes) |
| `"text"`, `42` | Text, always escaped |
| another tag's result, or an array of them | Children: `items.map(Row)`, `cond && span("x")`, `cond ? a : b` all work |

```ts
li({ id: `project-${p.id}` }, a(cls("flex gap-4", hover("bg-surface-2")), projects.detail({ id: p.id }), p.name))
```

Tags: `div section article aside nav header footer main p pre h1 h2 h3 h4 ul ol li dl dt dd table caption thead tbody tfoot tr td th span strong em small code time a button label form select option textarea input dialog details summary iframe img br hr`. `text("hidden")` writes a word that is also a class name as content.

**What the types enforce** (each is a compile error that names the fix):

- **Nesting.** `ul`/`ol` take only `li`; `dl` only `dt`/`dd`; `table` → `thead`/`tbody`/`tr` → `td`/`th`; `select` only `option`. `p`, headings, `span`, `button`, `label`, `dt` take text and inline tags only, never a block. No link, button or control inside `a` or `button`; no `form` in a form; no `label` in a label; `header`/`footer` hold no header, footer or main.
- **Names.** `a`, `button`, headings and `summary` need text or `{ "aria-label" }`. `img` needs `{ src, alt }` (`alt: ""` for decoration). `iframe` needs `{ title }`. `dialog` needs `modal(id).root` or `{ "aria-label" }`.
- **Labels.** `input`, `select`, `textarea` must sit directly inside `label("Name", input({…}))` or carry `{ "aria-label": "…" }` (not needed for `type: "hidden"`).
- **Links.** `a` needs a destination: a page route, or `{ href: url(value) }`.
- `button` writes `type="button"` unless you give `{ type: "submit" }`.
- There is no `class`, `on*` or `hx-*` attribute, and `style` is an object: `{ style: { width: "40%" } }`.

A component is a function; leave its return type to inference (`: El` widens it, and the parent refuses it). Its children's type says where it may go:

```ts
const Shell = (...children: FlowKid[]) => div(cls("p-4"), children);              // anything: a page shell, may hold a form
const Card = (...children: FlowKid<Content>[]) => div(cls("p-6"), children);      // ordinary content: fits in a form or header
const Chip = (...children: PhrasingKid<"text">[]) => span(cls("px-2"), children); // text only: fits in a link or button
const Field = (name: string, control: ControlKid) => label(cls("grid gap-1"), name, control); // a field helper
```

## Classes

```ts
const card = cls("p-6 bg-surface rounded-card shadow-md");            // a preset is a value
div(card, cls("mt-4"), "…")                                           // several on one tag
const primary = cls(card, "bg-primary text-on-accent", hover("bg-primary-700"));
const tone: Record<Status, Cls> = { active: cls("text-success"), paused: cls("text-warning") };  // exhaustive lookup
span(tone[status], open && cls("ring-2"), status)
cls.token(slug)                                                       // one class from data
```

- `cls(...)` takes class text exactly as Tailwind spells it, other `cls` values, or `false`. Every class is checked against your theme (`src/theme.css`): colours and radii are the theme's, not Tailwind's default palette, and the error lists the colours.
- **A variant is a function, never a `hover:` prefix.** It applies to every class you give it and nests: `hover("bg-surface-2 underline")`, `md(hover("px-8"))`. Its name is Tailwind's in camelCase: `hover focus focusVisible active disabled first last odd even dark sm md lg xl _2xl maxMd groupHover peerChecked ariaInvalid ariaExpanded backdrop placeholder before after motionReduce`. Import each one you use.
- A variant with brackets: `variant("data-[state=open]", "bg-surface-2")`, `variant("has-[:checked]", "ring-2")`.
- Bracket values work on sizes and layout (`w-[180px]`, `grid-cols-[8rem_1fr]`), not on colours. `/` modifiers work (`bg-primary/10`).
- Class text is literal. A string variable is a compile error; so is `div("flex gap-4", …)`, which would have been text.

## Routes

```ts
export const projects = routes("/projects", {
  list:   page("/", { q: "string?" }),                       // GET, answers a document
  rows:   part("project-list", "/rows", { q: "string?" }),   // GET, answers the one element this part owns
  new:    page("/new"),
  create: action("/", ProjectInput),                         // POST with a body schema: owns a form
  detail: page("/:id", { id: "number" }),
  status: part("project-status", "/:id/status", { id: "number" }),
  remove: action("/:id/delete", { id: "number" }),           // POST without a body
});
```

Input kinds: `"string"`, `"number"`, `"string?"`, `"number?"`, `"boolean?"`. Names in the path are path parameters, the rest are the query: `projects.detail({ id: 1 })`, `projects.list({ q })`, `projects.new()`. A body schema is any Standard Schema (zod, valibot, arktype). No view ever types a URL, an `hx-*` attribute or a part's id.

| Write | Emits |
|---|---|
| `a(projects.detail({ id }), "Open")` | `href`; the document boosts links into its `main` |
| `form(projects.list(), …)` | a GET form to the page |
| `button(projects.remove({ id }), "Delete")` | POST, then the answer replaces `main` and the URL |
| `button(projects.like({ id }).fire(), "Like")` | POST, no swap |
| `div(projects.rows().root, …)` | makes this element the part: it carries the part's id |
| `input({ type: "search", "aria-label": "Search" }, projects.rows().search("q"))` | `name="q"`; reloads the part 300 ms after typing |
| `select({ "aria-label": "Team" }, people.grid().change("team"), option(…))` | `name`; reloads the part on change, with the closest form's fields |
| `a(people.list({ team }), people.grid({ team }).load(), "Design")` | a real link that swaps only the part |
| `span(projects.status({ id }).poll(running && "2s"), …)` | the part's root plus a self-refresh while the value is truthy; `false` ends it |
| `div(projects.stats().defer(), "Loading…")` | the part's root, loaded once after the page |
| `wire({ get, post, target, swap, trigger, confirm, vals, headers, push })` | anything else: addresses are routes or `local(path)` |

A page route goes only on `a` or `form`, an action only on `button`, `.search` only on `input`. A part's id carries its path parameters (`project-status-7`), so two instances in one document never collide.

**Dialogs** are native:

```ts
const confirm = modal("delete-project");   // { open, root, title, close }
button(confirm.open, "Delete")
dialog(cls("rounded-card p-6", backdrop("bg-overlay/40")), confirm.root, h2(confirm.title, "Delete?"), button(confirm.close, "Cancel"))
```

## Forms

```ts
type State = FormState<typeof projects.create>;   // { values?, errors?, scope? }, typed from the schema
export const ProjectForm = (state: State) =>
  projects.create().form(state, cls("grid gap-4"), (f) => [
    label(cls("grid gap-1"), "Name", f.input("name", control, { required: true }), f.error("name", cls("text-danger"))),
    label(cls("grid gap-1"), "Notes", f.textarea("description", control, { rows: 4 })),
    label(cls("grid gap-1"), "Status", f.select("status", { active: "Active", paused: "Paused" }, control)),
    label(cls("flex gap-2"), f.checkbox("pinned"), "Pinned"),
    f.hidden("ref", ref),
    button(primary, { type: "submit" }, "Create"),
  ]);
```

`.form(state, classes, body)`: the second argument is a `cls` value, form attributes, or an array of both. Field names are the schema's keys; `name`, `id`, `value`, `aria-invalid`, `aria-describedby` and the 422 target are filled in. `f.select`'s record must cover every value of the field. `f.error` renders nothing while the field is valid. Each field needs its `label(…)` around it. To show one form twice in one document, give each a `scope`: `ProjectForm({ ...state, scope: "invalid" })`.

## Handlers

Views are synchronous functions of their data. Everything that waits or changes something lives here, one entry per route; a missing or extra key is a compile error.

```ts
export default handlers(projects, {
  list:   async ({ input }) => ProjectListPage({ q: input.q, items: await findProjects(input.q) }),
  rows:   async ({ input }) => ProjectRows({ items: await findProjects(input.q), q: input.q }),
  new:    () => NewProjectPage(),
  create: { form: ProjectForm, ok: async ({ body, redirect }) => redirect(projects.detail({ id: (await createProject(body)).id })) },
  detail: async ({ input, notFound }) => { const p = await getProject(input.id); return p ? DetailPage(p) : notFound(); },
  status: async ({ input, notFound }) => { const p = await getProject(input.id); return p ? JobBadge(p) : notFound(); },
  remove: async ({ input, redirect }) => { await deleteProject(input.id); return redirect(projects.list()); },
});
```

Context: `{ input, body, redirect(pageRef), notFound(), invalid(errors), request }`. A page route answers a document, a redirect or `notFound()`. A part route answers the element built with its own root wire (`.root`, `.poll`, `.defer`). An action answers a redirect, never markup; with a schema it is validated before `ok` runs, and issues re-render `form` with the errors and status 422 (`ok` may also return `invalid({ name: "Taken" })`). `input.id` is already a number.

For tests and static rendering: `const app = handlers(…); await app("detail", { input: { id: 1 } })` gives `{ status, body?, location? }`, and `render(view)` gives the markup of a view or a document.

## Documents

```ts
export const Layout = (o: { title: string }, ...children: FlowKid[]) =>
  doc({ title: o.title, description: "…", header: SiteHeader() }, cls("mx-auto max-w-3xl p-4"), ...children);
```

`doc({ title, lang?, description?, head?, header?, footer? }, ...content)` writes the document and its one `<main id="main">` around `content`, so views never write `main`. In development a repeated id in a document throws, naming the id.

## URLs, scripts, styles, raw markup

| Need | Write |
|---|---|
| a link inside the app | a route: `a(projects.list(), …)` |
| a URL from data or an external site | `{ href: url(user.website) }`: an unsafe scheme renders `#blocked` |
| a static file | `{ src: asset("/img/logo.png") }` |
| JSON for client code | `json(data, { id: "chart-data" })` |
| a global for inline JS | `jsVar("__DATA", data)` |
| a stylesheet with values from data | `` doc({ head: [style(css`.bar{width: ${pct}%}`)] }, …) `` |
| user HTML preview | `iframe({ srcdoc: html, title: "Preview" })`: always sandboxed |
| markup you wrote yourself | `` raw(trusted`<svg …>…</svg>`) ``: no holes, never a string |

## Control flow

Plain TypeScript: `cond && x`, `cond ? x : y`, `items.map(Row)`. For an exhaustive branch on a union: `match(status, { active: () => …, paused: () => … })` or `match.on(state, "kind", { ok: (s) => …, error: (s) => … })`.
