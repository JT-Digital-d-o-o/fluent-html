# rtsx reference

Views are TSX. Elements and attributes are HTML's own names (`class`, `for`, `tabindex`), Tailwind
is literal class text, htmx is `hx-*` attributes. `npm run check` runs tsc, the attribute check and
the class check; every finding is one line with the fix.

## Exports (`rtsx`)

| Export | Use |
|---|---|
| `defineIds([...])` | `ids.projectList` is the id `project-list`; pass it to `id`, `for`, `commandfor`, `hx-target`, `aria-*` |
| `defineRoutes(prefix, defs)` | `routes.detail({ id })` is a route value; pass it to `href`, `action`, `hx-get`/`hx-post`/… |
| `form(route, state?)` | field names, values and errors typed from the route's `body` (or `query`) |
| `match(value, cases)` / `match(value, "key", cases)` | exhaustive branch on a union; a missing case is a compile error |
| `json(data)` / ``js`…${data}` `` | the only content a `<script>` takes |
| ``css`…${value}` `` | the only content a `<style>` takes |
| `url(value)` | a link target that came from data (scheme-checked) |
| `localUrl(path)` | a same-origin path from data, for `hx-get` |
| `unsafeHtml(trusted)` | the bypass; lint-restricted |
| `mainContent` | the id of the layout's swap region |

## Routes

```ts
export const ids = defineIds(["project-list", "project-form", "job-status"]);
export const projects = defineRoutes("/projects", {
  list:    { path: "/", query: ListQuery },                                   // a page
  results: { path: "/results", query: ListQuery, render: ids.projectList },   // answers one fragment
  create:  { method: "post", path: "/", body: CreateProject, invalid: ids.projectForm },  // 422 re-renders that region
  detail:  { path: "/:id" },                                                  // params come from the path
  status:  { path: "/:id/status", render: ids.jobStatus, poll: "2s" },        // a fragment that polls itself
  export:  { path: "/export.csv", render: "none" },                           // not markup
});
projects.detail({ id: 3 })        // "/projects/3"
projects.list({ q: "atlas" })     // "/projects?q=atlas"   (params and query in one object)
```

The route declares its answer, so the element does not: `hx-get={projects.results()}` renders
`hx-target="#project-list" hx-swap="outerMorph"` by itself. A page route targets `#main-content`
and pushes the URL; `invalid` adds the 422 rule; `poll` adds `every 2s`, `hx-target="this"` and
`outerHTML`; `render: "none"` adds `hx-swap="none"`. An explicit `hx-target` / `hx-swap` wins.

## Elements

```tsx
<a href={projects.detail({ id })}>…</a>                     // in-app link: morphs #main-content, pushes the URL
<a href={url(user.website)} rel="noopener">…</a>            // a URL from data; "https://…" literals are fine as is
<input type="search" name="q" hx-get={projects.results()} hx-trigger="input changed delay:300ms" hx-sync="this:replace" />
<span id={ids.jobStatus} hx-get={running && projects.status({ id })}>…</span>   // false removes the attribute: the poll stops
<button command="show-modal" commandfor={ids.dialog}>Delete</button>
<dialog id={ids.dialog} closedby="any">…</dialog>
<div class={["rounded-card p-6", active && "bg-primary/10", tone[status]]} style={{ width: `${pct}%` }} dataset={{ "row-id": id }} />
{rows.length === 0 ? <Empty /> : rows.map((r) => <Row row={r} />)}
```

- `class` takes a string or an array (falsy entries are dropped). Every class is a complete literal
  that exists in the theme; pick between whole strings, never build one with `${}`.
- Any attribute takes `false`, `null` or `undefined` and is then left out.
- `<button>` without `type` renders `type="submit"`, or `type="button"` when it has `command`,
  `popovertarget` or an `hx-*` request.
- `<textarea value>` and `<select value>` work as in React.
- No `on*` handlers, no `hx-on`, no `hx-trigger` filters (`[expr]`). Text children are escaped.
- A page is a component that returns `<Layout title="…">…</Layout>`; a fragment's root carries the
  route's id: `<div id={ids.projectList}>`.

## Forms

```tsx
const f = form(projects.create(), { values, errors });   // state: { values?, errors? }
<form {...f.form}>                                        {/* id + hx-post + the 422 rule */}
  <label for={f.id("name")}>Name</label>
  <input {...f.field("name")} type="text" required />    {/* name, id, value, aria-invalid, aria-describedby */}
  {f.error("name") && <p id={f.errorId("name")}>{f.error("name")}</p>}
  <input {...f.checked("notify")} type="checkbox" />
  <button type="submit">Save</button>
</form>
```

The handler answers `422` with the form component alone for an htmx request, and redirects on success.
