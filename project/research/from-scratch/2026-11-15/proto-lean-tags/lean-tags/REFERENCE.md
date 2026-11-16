# Lean Tags: API reference

Server-rendered HTML for htmx 4 and Tailwind v4, in plain TypeScript. Tags are lowercase functions, classes are literal Tailwind text, routes own every URL, id and form.

```ts
import { div, a, input, button, tw, routes, page, part, post, handlers, doc, serve } from "lean-tags";
```

Two checks, run both after every change: `npx tsc --noEmit` and `npx lean-tags-check src/theme.css src` (every class against your Tailwind theme, plus classes written by mistake as text).

## Tags

`tag(...leading, ...children)`. Leading arguments come first, in any order; everything after the first child is a child.

| Argument | Meaning |
|---|---|
| `` tw`flex gap-4` `` | The class list. Several `tw` arguments are joined in order |
| `{ type: "search", required: true }` | Attributes, HTML's own lowercase names, typed per tag. `true` writes a bare attribute; `false`, `null`, `undefined` omit it |
| a route reference or wire | `projects.detail({ id })`, `projects.rows().root`, ... (see Routes) |
| `"text"`, `42` | Text, always escaped |
| another tag's result | Nested markup |
| an array | Each item, so `items.map(Row)` works |
| `false`, `null`, `undefined` | Nothing, so `cond && span("x")` and `cond ? a : b` work |

```ts
li({ id: `project-${p.id}` }, a(tw`flex gap-4 hover:bg-surface-2`, projects.detail({ id: p.id }), p.name))
```

Tags: `div span p main section article header footer nav aside h1 h2 h3 h4 ul ol li dl dt dd table thead tbody tr td th strong em small code pre time a button form label select option textarea dialog details summary iframe title`, and the void tags `input img hr br meta link` (no children). `button` writes `type="button"` unless you give a type. `img` requires `src` and `alt`. `script({ src })` is external only.

Attribute notes: `aria-*` booleans render as `"true"`/`"false"`. `data: { userId: 1 }` or `"data-user-id": 1`. `style: { width: "40%" }` takes one plain CSS value per property and throws on anything else. URL attributes (`href`, `src`, `action`, `formaction`, ...) keep `http(s)`, `mailto`, `tel`, relative URLs and image `data:`; any other scheme becomes `#`. There is no `class`, `on*` or `hx-*` attribute: tsc rejects them with the fix in the message.

## Classes

```ts
const card = tw`p-6 bg-surface rounded-card shadow-md`;      // a preset is a value
div(card, tw`mt-4`, "…")                                     // several on one tag
const primary = tw`${card} bg-primary text-on-accent`;       // holes take tw values or false/null
const tone: Record<Status, Tw> = { active: tw`text-success`, paused: tw`text-warning` };  // exhaustive lookup
span(tone[status], status)
div(tw`${open && tw`ring-2`} p-4`)
tw.token(slug)                                               // one class from data; anything else throws
```

Write classes exactly as Tailwind spells them, variants included (`hover:`, `md:`, `aria-invalid:`, `backdrop:`, `data-[state=open]:`). Colors and radii are your theme's (`src/theme.css`), not Tailwind's default palette: the check names the allowed ones. A raw string in a hole is a type error; a variant prefix on a hole (`` tw`hover:${card}` ``) throws. **`div("flex gap-4", …)` is text, not classes**: tsc allows it, the check flags it.

## Routes

```ts
export const projects = routes("/projects", {
  list:   page("/", { q: "string?" }),                       // GET, answers a page
  rows:   part("project-list", "/rows", { q: "string?" }),   // GET, answers the element whose id is "project-list"
  new:    page("/new"),
  create: post("/", ProjectInput),                           // POST with a body schema: owns a form
  detail: page("/:id", { id: "number" }),
  status: part("project-status", "/:id/status", { id: "number" }),
  remove: post("/:id/delete", { id: "number" }),             // POST without a body
});
```

Input kinds: `"string"`, `"number"`, `"string?"`, `"number?"`, `"boolean?"`. Names in the path are path parameters, the rest are the query. Calls are typed from the table: `projects.detail({ id: 1 })`, `projects.list({ q })`, `projects.new()`. A body schema is any Standard Schema (zod, valibot, arktype).

## Wires: what a route reference does on a tag

| Write | Emits |
|---|---|
| `a(projects.detail({ id }), "Open")` | `href`; the layout boosts links into `#main` |
| `form(projects.list(), …)` | a GET form to the page |
| `button(projects.remove({ id }), "Delete")` | POST, then the answer replaces `#main` and the URL |
| `button(projects.like({ id }).fire(), "Like")` | POST, no swap |
| `div(projects.rows().root, …)` | the part's id: the element a part handler answers |
| `input({ type: "search" }, projects.rows().search("q"))` | `name="q"`, reloads the part 300 ms after typing |
| `select(projects.rows().change("status"), …)` | `name`, reloads the part on change (includes the closest form) |
| `button(projects.rows().load(), "Refresh")` | reloads the part on click |
| `span(projects.status({ id }).poll(running && "2s"), …)` | the part's id plus a self-refresh while the value is truthy; render it with `false` to stop |
| `div(projects.stats().defer(), "Loading…")` | the part's id, loaded once after the page |
| `wire({ get, post, target, swap, trigger, confirm, vals, headers, push })` | anything else; every value is checked |

A page reference goes only on `a` or `form`, an action only on `button`, a part wire on any tag. Using one elsewhere is a type error.

**Dialogs** use the platform, no JS:

```ts
const confirm = modal("delete-project");   // { open, root, close } attribute objects
button(confirm.open, "Delete")
dialog(tw`rounded-card p-6 backdrop:bg-overlay/40`, confirm.root, …, button(confirm.close, "Cancel"))
```

## Forms

A `post` route with a schema builds its form; names, ids, values, `aria-invalid`, `aria-describedby` and the 422 target are filled in.

```ts
type State = FormState<typeof projects.create>;   // { values?, errors? }, typed from the schema
export const ProjectForm = (state: State) =>
  projects.create().form(state, tw`grid gap-4`, (f) => [
    label(tw`grid gap-1`, "Name", f.input("name", control, { required: true }), f.error("name", tw`text-danger`)),
    label(tw`grid gap-1`, "Notes", f.textarea("description", control, { rows: 4 })),
    label(tw`grid gap-1`, "Status", f.select("status", { active: "Active", paused: "Paused" }, control)),
    f.checkbox("pinned"), f.hidden("ref", ref),
    button(primary, { type: "submit" }, "Create"),
  ]);
```

Field names are the schema's keys. `f.select`'s record must cover every value of the field. `f.error` renders nothing while the field is valid.

## Handlers

One entry per route; a missing or extra key is a compile error.

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

Context: `{ input, body, redirect(pageRef), notFound(), invalid(errors), request }`. A page route answers a page (from `doc`), `redirect` or `notFound`. A part route answers the element carrying its own root wire (`.root`, `.poll`, `.defer`). A schema route is validated before `ok` runs: issues re-render `form` with the errors and status 422; `ok` may also return `invalid({ name: "Taken" })`. `input.id` is already a number.

Serve and render:

```ts
serve([projectHandlers, homeHandlers], 3000);        // node:http; urlencoded bodies
const app = projectHandlers; await app("detail", { input: { id: 1 } });   // { status, body?, location? }, for tests
render(view)                                          // the markup as a string
```

## Layout

```ts
export const Layout = (o: { title: string }, ...children: Child[]) =>
  doc({ title: o.title, description: "…" }, main(tw`mx-auto max-w-3xl p-4`, { id: "main" }, children));
```

`doc({ title, lang?, description?, head? }, ...body)` writes the document and boosts every link and form into `#main`, so the page's `main` must have `id: "main"`. Pages call `Layout({ title }, ...children)`.

## Control flow

Plain TypeScript: `cond && x`, `cond ? x : y`, `items.map(Row)`, `items.length ? list : Empty()`. For an exhaustive branch on a union: `match(status, { active: () => …, paused: () => … })` or `match(state, "kind", { ok: (s) => …, error: (s) => … })`.

## Data in scripts and styles

| Need | Write |
|---|---|
| JSON for client code | `json(data, { id: "chart-data" })` (a `<script type="application/json">`) |
| a global for inline JS | `jsVar("__DATA", data)` |
| a stylesheet with values from data | `` style(css`.bar{width: ${pct}%}`) ``: each hole is one CSS value |
| user HTML preview | `iframe({ srcdoc: html })`: sandboxed with no permissions |
| markup you wrote yourself | `` raw(trusted`<svg …>…</svg>`) ``: no holes, never a string |

## Messages and their fix

| Message | Fix |
|---|---|
| `'class' … "classes are a leading tw argument…"` | `` div(tw`…`, …) `` |
| `'"p-4"' is not assignable to … 'Tw \| Falsy'` | a hole takes `` tw`p-4` ``, not a string |
| `'hx-get' … "htmx attributes come from a route wire…"` | add the route and use its wire |
| `'PageRef' is not assignable … button` | a page goes on `a`; a button needs a `post` route |
| `'Html<undefined>' is not assignable to 'Html<"x">'` | the part's view must carry `routes.x().root` (or `.poll`/`.defer`) |
| `Property 'alt' is missing` | `img({ src, alt })` |
| `unknown class "text-smm": did you mean text-sm?` (check) | take the suggestion |
| `classes written as text` (check) | `` div(tw`flex gap-4`, …) `` |
| runtime `a tag must be called to become a child` | `hr()`, not `hr` |
| runtime `classes, attributes and wires come before children` | move the `{…}` or `tw` before the first child |
