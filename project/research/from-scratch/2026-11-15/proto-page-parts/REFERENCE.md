# Page Parts: API reference

Server-rendered HTML + htmx 4 + Tailwind v4, in TypeScript. You declare **parts** (page, region, form,
action). Each part owns its URL, its DOM id, its htmx attributes, its status codes and its ARIA. You never
write an id, an `hx-*` attribute, a route for a fragment, or a status code.

**Check your work with `npm run check`** (tsc, then the Tailwind class check). `npm test` runs the tests.
Node runs `.ts` files directly: `node server.ts`.

## A feature file

```ts
import { page, Page, Link, Search, List, redirect, notFound, invalid, refresh, Type, Div, H1, P, Span } from "../kit/index.ts";

// 1. The parts: what exists, at which URL, with which input and data.
export const projectList = page("/projects", { query: { q: Type.Optional(Type.String()) } });
export const projectRows = projectList.region("rows", { load: ({ query }) => db.search(query.q) });

export const projectDetail = page("/projects/:id", {
  params: { id: Type.Integer() },                                       // one schema per :param (compile error if missing)
  load: async ({ params }) => (await db.find(params.id)) ?? notFound(),  // notFound() answers 404
});

// 2. The views, attached afterwards as statements, so any view can name any part.
projectList.view(() => Page({ title: "Projects" }, H1("Projects"), projectRows.show()));
projectRows.view(({ data: projects }) =>
  List({ items: projects, key: (p) => p.id, row: (p) => Link({ to: projectDetail, params: { id: p.id } }, p.name), empty: P("None yet") }));
projectDetail.view(({ data: project }) => Page({ title: project.name }, H1(project.name)));
```

Declare every part first, then attach views. Putting a view inside the declaring call makes two pages
that link to each other a circular type (TS7022).

## The app

```ts
import { app, configure } from "./kit/index.ts";
import { listen } from "./kit/node.ts";
import * as projects from "./features/projects.ts";

configure({
  styles: { input: "rounded-control border border-line px-3 py-2", error: "text-sm text-danger" },   // classes for what parts emit
  assets: { css: "/app.css", htmx: "/htmx.js" },                                                      // the defaults
});
const site = app(projects);                       // every exported page, with its regions, forms and actions
listen(site, { port: 3000, publicDir: "public" }); // or call site.handle({ method, url, headers?, body? }) yourself
```

`app()` throws at startup if a page, region or form has no view. In a test, `await site.handle({ method: "GET",
url: "/projects" })` returns `{ status, headers, body }`; send `headers: { "hx-request": "true" }` to act as htmx,
plus `"hx-target": "div#projects-rows"` to ask for one region (a region's id is its page's path, dashed, then its name).

## Parts

| Part | Declare | Place in a view | What it does by itself |
|---|---|---|---|
| page | `page(path, { params?, query?, guard?, load? })` then `.view(({ data, params, query }) => Page(…))` | `Link({ to: page, params })` | answers the document, or `<main>` alone for an htmx navigation; 404 on `notFound()` or a bad param |
| region | `somePage.region(name, { load, poll?, class? })` then `.view(({ data, params, query }) => …)` | `region.show()` | loads beside the page's other regions; re-renders alone at the page's own URL; `notFound()` from its `load` renders its empty shell |
| form | `somePage.form(name, { schema, submit, class? })` then `.view((f) => […])` | `form.show(values?)` | validates against the schema; invalid answers 422 and re-renders the form with each field's error and the typed values; valid runs `submit` |
| action | `somePage.action(name, { confirm?, run })` | `action.button({ class }, "Label")` | a POST with no fields; `confirm: { title, body?, confirm?, cancel? }` puts a native `<dialog>` in front of it |

A region, form or action shares its page's URL, params, query and guard. `load`, `guard`, `submit` and `run`
receive `{ params, query, request }`; `submit` also gets `data`, already valid and typed. Part names are
lowercase letters, digits and dashes, unique per page.

**Answers** (what `submit`, `run` and `guard` return):

| Answer | Effect |
|---|---|
| `redirect(page, params?, query?)` | go to that page (303, or an htmx navigation) |
| `refresh(regionA, regionB)` | re-render those regions of the current page in place |
| `notFound()` | 404 (from `load`, too) |
| `invalid({ field: "message" })` | `submit` only: an error the schema cannot know (a taken name); answers 422 into the form |

A `guard` returns nothing to let the request through: `guard: ({ request }) => (signedIn(request) ? undefined : redirect(signIn))`.

**Polling**: `poll: { every: "2s", while: ({ data }) => data.state === "running" }`. The render where
`while` is false carries no timer, so polling stops.

## Inside a view

```ts
Page({ title, description?, class? }, ...children)            // the document; a page's view must return this
Link({ to: projectDetail, params: { id }, query?, class?, "aria-label"? }, ...children)   // aria-current on the current page
Search({ into: projectRows, name: "q", label: "Search projects", placeholder?, class? })   // name: a key of the page's query
List({ items, key: (x) => x.id, row: (x) => …, empty: …, class?, rowClass? })               // keyed <ul>, or `empty` when there are none
```

Form fields: the control, `required`, lengths and ranges come from the schema; the label is required.

```ts
export const createProject = projectNew.form("create", {
  schema: Type.Object({
    name: Type.String({ minLength: 1, maxLength: 80 }),
    bio: Type.Optional(Type.String({ maxLength: 500 })),
    status: Type.Union([Type.Literal("draft"), Type.Literal("active")]),
    notify: Type.Boolean(),
  }),
  submit: async ({ data }) => redirect(projectDetail, { id: (await db.create(data)).id }),
});
createProject.view((f) => [
  f.field("name", "Name", { placeholder?, hint?, autocomplete?, class? }),
  f.field("bio", "Bio", { as: "textarea", rows: 4 }),                              // as: "textarea" | "password"
  f.field("status", "Status", { options: { draft: "Draft", active: "Active" } }),  // every literal needs a label
  f.field("notify", "Email me"),                                                   // Type.Boolean() is a checkbox
  f.submit("Save", { class? }),
]);
```

Schema: `Type.Object({ … })` with `Type.String({ minLength?, maxLength?, format?: "email" | "uri" | "date", pattern? })`,
`Type.Integer({ minimum?, maximum? })`, `Type.Number({ minimum?, maximum? })`, `Type.Boolean()`,
`Type.Union([Type.Literal("a"), …])`, `Type.Optional(…)`. `Static<typeof schema>` is its type.

## Raw elements

`Div Span P H1 H2 H3 Header Footer Nav Section Article Aside Ul Ol Li A Button Img Table Thead Tbody Tr Th Td
Strong Em Small Time Label Dl Dt Dd Pre Code Blockquote Figure Figcaption Fieldset Legend Hr Br`, and
`Form Input Textarea Select Option Iframe` for the rare form no part fits.

```ts
Div({ class: "flex gap-4", id?, title?, hidden?, role?, "aria-label"?, data: { userId: 42 }, style: { "--brand": tenant.color } }, child, child)
Div("text", child)                                  // attributes are optional; strings are escaped
Img({ src: asset("/logo.png"), alt: "Logo" })       // alt is required
A({ href: external(user.website) }, "Website")      // a URL from data; in-app links are Link()
Button({ class }, "Close")                          // type="button" unless you say "submit"
items.map((x) => Li(x.name))                        // arrays are children
cond && Span("shown")                               // false, null and undefined render nothing
```

- **Not accepted**: `on*` handlers, `hx-*` attributes, `data-*` keys (use `data: {}`), a string `href`/`src`/`action`
  (use `external()`, `asset()` or `local()`), `style` as a string, `srcdoc`.
- **Escaping**: every string is escaped. A scriptable URL (`javascript:`, `data:text/html`) renders as `#blocked-url`.

## Tailwind

Classes are Tailwind's own class text: `class: "px-4 py-2 hover:bg-surface-2 md:px-8"`. Combine with
`cx("px-4", active && "ring-2")`; a lookup works: `{ done: "text-success", failed: "text-danger" }[state]`.

- Colours are the theme's role tokens in `tools/theme.css` (`primary`, `primary-700`, `on-accent`, `surface`,
  `surface-2`, `line`, `text`, `text-dim`, `info`, `success`, `danger`, `black`); tints use opacity: `bg-success/10`.
  Radii: `rounded-card`, `rounded-control`, `rounded-full`. The default palette is off: `bg-gray-100` is an error.
- `npm run check` rejects a class the theme does not have, with the reason (unknown class, closed palette, unknown
  variant). It reads `class` and `*Class` properties, `cx()` arguments and `configure({ styles })`.
- Build: `npx tailwindcss -i tools/theme.css -o public/app.css`. Tailwind reads the class text straight from the
  source: no safelist, no extractor. Write class names whole (`"text-danger"`, never `"text-" + tone`).

## htmx

Parts emit htmx 4 attributes; you serve `htmx.js` (configure its URL). What each part does on the wire:

| Part | Wire |
|---|---|
| `Link` | `href` + GET into `#main-content`, morph, scroll to top, push URL |
| `Search` | a GET `<form>` inside `<search>` (works without JS); typing re-renders the region, latest request wins, URL pushed |
| region | answers alone when htmx targets it; a poll swaps `outerHTML` |
| form | POST to `?/name` on its page; morphs itself; 422 re-renders it; success redirects |
| action | POST to `?/name`; with `confirm`, a `command="show-modal"` button and a `<dialog closedby="any">` |

## Rare hatches

| Need | Use |
|---|---|
| an htmx request no part covers | `Button({ wire: hx({ post: local("/cart/add/3"), swap: "none", vals: { n: 1 } }) }, "Add")` |
| markup written in the source | ``Raw(trustedHtml`<svg>…</svg>`)`` (an interpolation does not compile) |
| data for a script | `JsonData("chart-data", value)` |
| user HTML preview | `Sandbox({ html, title })` (a sandboxed iframe) |
| a CSS value from data | `style: { color: value }` or `CssRule(".x", { color: value })` |
