# Semantic kit: API reference (prototype)

Server-rendered HTML + htmx + Tailwind. You declare **parts** (page, region, form, action); each part
owns its URL, its DOM id, its htmx attributes and its ARIA. You never write an id, an `hx-*`
attribute, a route for a fragment, or a status code. Check with `tsc` and `node tools/check-classes.mjs`.

## A feature file

```ts
import { page, Page, Link, Search, List, redirect, notFound, invalid, refresh, Type, Div, H1, P, Span } from "kit";

// 1. The parts: what exists, at which URL, with which input and data.
export const projectList = page("/projects", { query: { q: Type.Optional(Type.String()) } });
export const projectRows = projectList.region("rows", { load: ({ query }) => db.search(query.q) });

export const projectDetail = page("/projects/:id", {
  params: { id: Type.Integer() },                       // one schema per :param (compile error if missing)
  load: async ({ params }) => (await db.find(params.id)) ?? notFound(),   // notFound() answers 404
});

// 2. The views, attached after, so a view can name any part.
projectList.view(({ query }) => Page({ title: "Projects" }, H1("Projects"), projectRows.show()));
projectRows.view(({ data: projects }) => List({ items: projects, key: (p) => p.id, row: (p) => p.name, empty: P("None yet") }));
projectDetail.view(({ data: project }) => Page({ title: project.name }, H1(project.name)));
```

Register: `const site = app(projectsModule, usersModule)`. `app()` throws at boot if a part has no view.

## Parts

| Part | Declare | Place in a view | What it does by itself |
|---|---|---|---|
| page | `page(path, { params?, query?, guard?, load? })` then `.view(({ data, params, query }) => Page(…))` | `Link({ to: page, params })` | answers the document, or `<main>` alone for an htmx navigation; 404 on `notFound()` or a bad param |
| region | `somePage.region(name, { load, poll?, class? })` then `.view(({ data }) => …)` | `region.show()` | loads beside the page's other regions; re-renders alone at the page's own URL; a `notFound()` answers its empty shell |
| form | `somePage.form(name, { schema, submit, class? })` then `.view((f) => […])` | `form.show(values?)` | validates against the schema; invalid answers 422 and re-renders the form with each field's error and the typed values; valid runs `submit` |
| action | `somePage.action(name, { confirm?, run })` | `action.button({ class }, "Label")` | a POST; `confirm: { title, body?, confirm?, cancel? }` puts a native `<dialog>` in front of it |

A region, form or action shares its page's URL, params, query and guard. `load`, `submit` and `run`
receive `{ params, query, request }` (`submit` also `data`, already valid and typed).

**Answers** (what `submit`, `run` and a `guard` return): `redirect(page, params?, query?)`,
`refresh(regionA, regionB)` (re-render those regions in place), `notFound()`, and from `submit` only
`invalid({ field: "message" })` for an error the schema cannot know.

**Polling**: `poll: { every: "2s", while: ({ data }) => data.state === "running" }`. The render where
`while` is false carries no timer, so polling stops.

## Inside a view

```ts
Page({ title, description?, class? }, ...children)          // the document; a page's view returns this
Link({ to: projectDetail, params: { id }, query?, class? }, ...children)
Search({ into: projectRows, name: "q", label: "Search projects", placeholder?, class? })   // name: a key of the page's query
List({ items, key: (x) => x.id, row: (x) => …, empty: …, class?, rowClass? })              // keyed rows, or `empty`
```

Form fields (the control, `required`, lengths and ranges come from the schema; the label is required):

```ts
createProject.view((f) => [
  f.field("name", "Name", { placeholder?, hint?, autocomplete?, class? }),
  f.field("bio", "Bio", { as: "textarea", rows: 4 }),           // as: "textarea" | "password"
  f.field("status", "Status", { options: { draft: "Draft", active: "Active" } }),   // a Union of Literals: every value needs a label
  f.field("notify", "Email me"),                                // Type.Boolean() is a checkbox
  f.submit("Save", { class? }),
]);
```

Schema: `Type.Object({ … })` with `Type.String({ minLength?, maxLength?, format?: "email" | "uri" | "date", pattern? })`,
`Type.Integer({ minimum?, maximum? })`, `Type.Number()`, `Type.Boolean()`, `Type.Union([Type.Literal("a"), …])`, `Type.Optional(…)`.

## Raw elements (the escape hatch)

`Div, Span, P, H1, H2, H3, Header, Footer, Nav, Section, Article, Aside, Ul, Ol, Li, A, Button, Img,
Table, Thead, Tbody, Tr, Th, Td, Strong, Em, Small, Time, Label, Dl, Dt, Dd`.

```ts
Div({ class: "flex gap-4", id?, title?, hidden?, role?, "aria-label"?, data: { userId: 42 }, style: { "--brand": tenant.color } }, child, child)
Div("text", child)                                  // attributes are optional; strings are escaped
Img({ src: asset("/logo.png"), alt: "Logo" })       // alt is required
A({ href: external(user.website) }, "Website")      // a URL from data; in-app links are Link()
Button({ class }, "Close")                          // type="button" unless you say "submit"
items.map((x) => Li(x.name))                        // arrays are children
cond && Span("shown")                               // false, null, undefined render nothing
```

- **Classes** are Tailwind class text: `class: "px-4 py-2 hover:bg-surface-2"`. Combine with `cx("px-4", active && "ring-2")`.
  Colours are the theme's role tokens; `check-classes` rejects a class the theme does not have.
- **Not accepted**: `on*` handlers, `hx-*` attributes, `data-*` as keys (use `data: {}`), a string `href`/`src`, `style` as a string.
- **Styles of what parts emit** (label, input, error, dialog…): once, in `configure({ styles: { input: "…", error: "…" } })`.

## Rare hatches

| Need | Use |
|---|---|
| an htmx request no part covers | `Button({ wire: hx({ post: local("/cart/add/3"), swap: "none", vals: { n: 1 } }) }, "Add")` |
| markup written in the source | ``Raw(trustedHtml`<svg>…</svg>`)`` (no interpolation compiles) |
| data for a script | `JsonData("chart-data", value)` |
| user HTML preview | `Sandbox({ html, title })` |
| a CSS value from data | `style: { color: value }` or `CssRule(".x", { color: value })` |
