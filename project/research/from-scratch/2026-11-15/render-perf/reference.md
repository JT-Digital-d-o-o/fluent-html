# Hoisted HTML: API reference (prototype)

Views are HTML text in TypeScript tagged templates. Classes are literal Tailwind class text.
Everything dynamic goes in a `${hole}`; the hole's position decides how its value is written.

```ts
import { html, at, tw, match, css, attrs } from "hoisted-html";
import { defineIds, defineRoutes, hx, form, controller, page, redirect, invalid } from "hoisted-html/hx";
```

## Templates

```ts
const Row = (p: Project) => html`
  <li class="flex items-center justify-between px-4 py-3">
    <a href="${projects.detail({ id: p.id })}" class="font-medium text-ink">${p.name}</a>
  </li>`;

html`<ul>${items.map(Row)}</ul>`                 // a component is a function; call it in a hole
html`${count > 0 && html`<span>${count}</span>`}`  // false, null, undefined print nothing
```

What a hole accepts, by position:

| Position | Accepts | Written as |
|---|---|---|
| text: `<p>${x}</p>` | string, number, `html` value, array of those, `false`/`null`/`undefined` | escaped text; `html` values as they are |
| whole attribute: `title="${x}"` | string, number, id; `null`/`undefined`/`false` drop the attribute; `true` prints it bare (`disabled="${busy}"`) | escaped. On `aria-*` and `data-*`, booleans print `"true"`/`"false"` |
| part of an attribute: `class="btn ${x}"` | string, number, array of class names (falsy items skipped) | escaped |
| `href`, `src`, `action`, `formaction`, `poster` | a route call, or a URL string | a script URL (`javascript:` and the like) is neutralised |
| `hx-get`, `hx-post`, `hx-put`, `hx-patch`, `hx-delete` | a route call | the URL, plus the route's target and swap |
| `hx-vals`, `hx-headers` | an object | JSON |
| `style="width: ${x}"` | one CSS value; `style="${css({ width: "40%" })}"` for several | validated; anything that is not a single value throws |
| between attributes: `<input ${x}>` | `attrs({...})`, an `hx.*` verb, `f.field()`, `f.label()`; `false`/`null` print nothing | attributes |
| inside `<script>` | any JSON value | JSON, safe inside a script element |

Refused when the template is compiled (the message names the fix): an `on*` attribute, a hole
as an element or attribute name (use `attrs({ [name]: value })`), a `<button>` without `type`,
an `<img>` without `alt`, an unclosed or mismatched tag, an uppercase tag (`<Card/>`: write
`${Card(props)}`), a hole in `hx-trigger`, `<iframe srcdoc="${x}">` without a static `sandbox`.

- **`at(ids.x)`** in place of `html`: the template's one root element gets that id, and the
  value is typed as rooted at it. A fragment route's handler must return it.
- **`tw`** marks class text that lives outside a template: `` const control = tw`w-full rounded-control border border-line px-3 py-2` ``.
- **`match(value, { a: …, b: … })`**: exhaustive pick on a string union; a missing case does not compile.
  Never build a class from pieces (`bg-${tone}-500`); pick whole class strings with `match`.
- Whitespace: the output is the text as written. A run of whitespace with a newline becomes
  one newline; the template's own leading and trailing whitespace is dropped.
- HTML from a sanitizer: `trustedHtml(markup, "why it is safe")`. There is no other bypass.

## Ids and routes (`[feature].routes.ts`)

```ts
export const ids = defineIds("project-list", "project-form", "job-status");   // ids.projectList, …

export const projects = defineRoutes("/projects", {
  list:   { query: { q: "string" } },                                 // GET, answers a page
  rows:   { path: "/rows", query: { q: "string" }, fragment: ids.projectList },   // answers that fragment
  create: { method: "post", body: CreateProject, invalid: ids.projectForm },     // 422 answers the form region
  detail: { path: "/:id", params: { id: "number" } },
  remove: { method: "delete", path: "/:id", params: { id: "number" } },
  export: { path: "/export.csv", machine: true },                     // answers no markup
});

projects.detail({ id: 7 })     // params and query in one flat object
projects.rows({ q })           // query values are optional; null, undefined and "" are skipped
```

Param and query kinds: `"string"`, `"number"`, `"boolean"`, or a list of literals.

## htmx

The route says what it answers, so the call site never writes a target, a swap or an id.

```ts
html`<a href="${projects.detail({ id })}">Open</a>`        // link: href plus an htmx page swap with history
html`<form action="${projects.create()}">…</form>`         // method, hx-post and the 422 routing come from the route
html`<button type="button" hx-delete="${projects.remove({ id })}" hx-confirm="Delete ${name}?">Delete</button>`
html`<input ${hx.search(projects.rows())} type="search" name="q">`   // fires after typing stops; newest request wins
html`<span ${running && hx.poll(projects.status({ id }), "2s")}>…</span>`  // stops when rendered without it
html`<div ${hx.defer(stats.week())}>Loading</div>`          // region fetched after the page answers
```

- `hx.search(route, delayMs = 300)`: any route. `hx.poll(route, every = "2s")` and
  `hx.defer(route)`: a route with `fragment`.
- `hx-get="${route}"` with a POST route throws and names the attribute to write.
- Other htmx attributes are plain HTML in the template (`hx-confirm`, `hx-include`, `hx-indicator`).
- No-request interactions are HTML: `<dialog id="${ids.x}" closedby="any">` with
  `<button type="button" command="show-modal" commandfor="${ids.x}">`, and `popover`.

## Forms

The schema on the route is the source of each field's name, type and constraints.

```ts
const f = form(projects.create, state);    // state: { values?, errors? }
html`
  <label ${f.label("name")}>Name</label>
  <input ${f.field("name")} class="${control}">
  ${Message(f.error("name"))}
  <select ${f.field("status")}>${f.options("status", { active: "Active", paused: "Paused" })}</select>
  <textarea ${f.field("notes")} rows="4">${f.value("notes")}</textarea>`
```

- `f.field(name)`: `id`, `name`, `type`, `required`, `minlength`, `maxlength`, `min`, `max`, the
  current `value`, and `aria-invalid` plus `aria-describedby` when the field has an error.
- `f.error(name)`: `{ id, message } | undefined`. Render it yourself with that `id`.
- A field name that is not in the schema does not compile. `f.options` needs a label for every value.

## Handlers (`[feature].controller.ts`)

One entry per route. What an entry may return follows from the route.

```ts
export default controller(projects, {
  list:   ({ query }) => page("Projects", ProjectListPage({ q: query.q, projects: find(query.q) })),
  rows:   ({ query }) => ProjectList({ projects: find(query.q) }),     // must be at(ids.projectList)`…`
  create: {
    form:  ProjectForm,                     // (state) => at(ids.projectForm)`…`; answered with 422
    valid: ({ body }) => taken(body.name)
      ? invalid({ name: "A project with this name exists" })
      : redirect(projects.detail({ id: create(body).id })),
  },
  detail: ({ params }) => page(get(params.id).name, ProjectDetailPage({ project: get(params.id) })),
});
```

- A page route returns `page(title, view)` or `redirect(route)`. A fragment route returns the
  view rooted at its id.
- A route with `body` and `invalid`: the body is validated against the schema first. On
  failure `form` is called with `{ values, errors }` and answered with 422 into the form
  region. `valid` runs only with a valid, typed `body`.

## Check

`npm run check` runs `tsc` and `hh check`. `hh check` compiles every template without running
the app and asks Tailwind whether each class exists under the theme. One line per finding:

```
src/app/projects/projects.views.ts:17 <button> needs type="button" or type="submit"
src/app/projects/projects.views.ts:31 class "bg-gray-100": no such class under this theme; colors are ink, dim, surface, …
```
