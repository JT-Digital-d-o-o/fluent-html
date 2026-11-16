# Sealed Sinks: API reference (prototype)

Views are TSX. Elements and attributes are HTML's own, lowercase (`class`, `for`, `maxlength`). Styling is Tailwind class text. `tsconfig`: `"jsx": "react-jsx", "jsxImportSource": "sealed"`. No React: JSX compiles to calls that build the HTML string.

```tsx
import { defineIds, defineRoutes, bind, search, poll, swap, fire, load, json, js, css, html, localUrl, render } from "sealed";
```

## Values in markup

Write values straight into JSX. Each position encodes its own value; there is no escape call and no raw-HTML prop.

| Position | Accepts | What happens to data |
|---|---|---|
| child `{x}` | string, number, JSX, array, `null`/`false` | text is escaped; an object is an error |
| any attribute | string, number, boolean | escaped; `true` is a bare attribute, `false`/`null` omits it |
| `href`, `src`, `action`, `formaction`, `poster` | a route or a string | a string keeps only `http:`, `https:`, relative, `mailto:`/`tel:` (links), media `data:` (images); anything else becomes `about:invalid#blocked` |
| `class` | string, or an array of strings and falsy values | `class={["badge", active && "bg-primary"]}` |
| `style` | an object: `style={{ width: pct + "%" }}` | a value with `;`, `:`, `url(`, quotes or braces is dropped. A style string is a type error |
| `id` | an id from `defineIds`, or a string | |
| `for`, `commandfor`, `popovertarget`, `form`, `list` | an id from `defineIds` | |
| `<script>` | `json(data)` or ``js`code ${data}` `` or `src="/path.js"` | data is JSON with `<`, `>`, `&` escaped; `json()` makes the element `type="application/json"` |
| `<style>` | ``css`.x{color: ${value}}` `` | a hole only as a declaration value |
| `<textarea>`, `<title>` | text | |
| `<iframe srcdoc>` | string or JSX | always sandboxed; a string never gets `allow-scripts` |

Not writable (type error, and refused at render): `on*` handlers, `hx-*` attributes, `dangerouslySetInnerHTML`, `nonce`. Literal markup such as an SVG icon: ``html`<svg ...>...</svg>` `` (no holes).

`<button>` without `type` is `type="button"` when it has `hx`, `command` or `popovertarget`, otherwise `type="submit"`.

## Ids and routes (`[feature].routes.ts`)

```ts
export const ids = defineIds(["projectList", "projectForm", "statusBadge"] as const);   // ids.projectList -> "project-list"

export const projects = defineRoutes("/projects", {
  list:   { path: "/", query: { q: "string" } },                                   // a page
  rows:   { path: "/rows", query: { q: "string" }, region: ids.projectList },      // a fragment: answers that region
  create: { method: "post", path: "/", body: CreateProject, invalid: ids.projectForm },  // a form: 422 re-renders that region
  detail: { path: "/:id", params: { id: "number" } },
  status: { path: "/:id/status", params: { id: "number" }, region: ids.statusBadge },
  export: { path: "/export.csv", render: "none" },                                 // a machine route
});

projects.detail({ id: 3 })          // path params and query keys in one object
projects.list({ q: "har" })         // /projects?q=har
```

`params` and `query` kinds: `"string" | "number" | "uuid"`. `body` is the TypeBox schema.

## htmx: routes in native positions, verbs in `hx`

```tsx
<a href={projects.detail({ id })}>…</a>                       // page route: navigates (morphs #main-content, pushes the URL)
<a href={user.website}>…</a>                                  // a string: an ordinary link
<form action={projects.create()}>…</form>                     // submits with the route's method; 422 goes to its `invalid` region
<input type="search" name="q" hx={search(projects.rows())} />  // debounced; swaps the route's region
<span hx={live ? poll(projects.status({ id }), "2s") : undefined}>…</span>   // self-refresh; stops when rendered without it
<div hx={load(projects.status({ id }))} />                    // region loaded after the page
<button hx={swap(projects.rows({ q: "" }))}>Clear</button>    // click: swaps the route's region
<button hx={fire(projects.remove({ id }))}>Delete</button>    // click: a page route navigates, a `"none"` route swaps nothing
```

The target is never written: a fragment route names its region. `poll` and `load` put the region's id on the element. Options on `swap`/`fire`/`search`: `{ vals: {…}, headers: {…}, confirm: "text", include: ids.x }`. A path that arrives as data: `localUrl(path, { region })` (returns `null` unless it is a same-origin path).

Client-only interaction is native HTML: `<button command="show-modal" commandfor={ids.dialog}>`, `<dialog id={ids.dialog} closedby="any">`, `popovertarget={ids.panel}`.

## Forms

```tsx
export function ProjectForm(state: FormState<CreateProjectReq>) {     // { values?, errors? }
  const f = bind(projects.create, state);
  return (
    <form id={ids.projectForm} action={projects.create()}>
      <label for={f.id("name")}>Name</label>
      <input {...f.input("name")} required />            {/* name, id, type, value, aria-invalid, aria-describedby */}
      {f.error("name", "text-sm text-danger")}           {/* <p> wired to the input, or nothing */}
      <textarea {...f.field("notes")}>{f.value("notes")}</textarea>
      <button>Save</button>
    </form>
  );
}
```

`f.input(name, type?)`: a field name that is not in the schema is a type error.

## Components and control flow

A component is a function from a props object to JSX; call it as `<Row project={p} />` or `Row({ project: p })`. Lists are `.map`, branches are `? :` and `&&`, a lookup by a union is an object with `satisfies Record<Status, string>`. `key` is accepted and ignored.

## The response

`render(view, { nonce })` returns the string. A view with a `<script>` or `<style>` needs the nonce; the runtime writes the attribute.
