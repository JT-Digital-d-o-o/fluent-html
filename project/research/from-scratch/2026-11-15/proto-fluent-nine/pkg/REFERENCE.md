# fluent-html 9

Server-rendered HTML from TypeScript. Text is escaped by default. Styling is Tailwind class text,
checked by the type system. htmx requests come from typed routes and swap verbs.

Everything imports from `"fluent-html"`:

```ts
import {
  Div, Main, Section, Header, Footer, Nav, H1, H2, P, Span, A, Ul, Li, Button, SubmitButton,
  Form, Label, Input, Select, Option, Textarea, Table, Thead, Tbody, Tr, Th, Td, Img, Dialog,
  Document, Head, Body, Title, Meta, Link, Style, Script, JsonScript, css, js, Raw, trustHtml,
  ForEach, ForEachKeyed, IfThen, IfThenElse, Match, MatchValue, Intersperse, Empty,
  defineTheme, defineIds, defineRoutes, hx, externalUrl, assetUrl, Partial, hxResponse, tw, render,
  type View, type Tw, type ErrorBag, type ThemeKeys, type ThemeSpec, type PageRoute, type FragmentRoute,
} from "fluent-html";
```

Check with `npx tsc --noEmit`. There is no other checker: a class, a route, a field name or an
attribute value that is wrong fails there, and the error says what to write instead.

## Elements

```ts
Div("Hello")                         // text child, escaped
Div(H1("Title"), P("Body"))          // children are arguments: never an array
Div()                                // empty
Ul(ForEach(["a", "b"], (x) => Li(x)))  // a list is ForEach, never .map
Empty()                              // renders nothing
```

A `View` is a tag, a string, or `Raw` HTML. Components are plain functions with a props object
that return a tag:

```ts
type BadgeProps = { label: string; tone: "ok" | "bad" };
function Badge({ label, tone }: BadgeProps) {
  return Span(label).tw("px-2 py-0.5 rounded-full text-xs", tone === "ok" ? "bg-success/10 text-success" : "bg-danger/10 text-danger");
}
```

## Attributes

Each attribute has a typed setter, named `set` plus the attribute. Values are checked:
`Input().setType("txt")` does not compile.

```ts
A("Docs").setHref("https://example.com/docs").setTarget("_blank").setRel("noopener")
Img().setSrc("/logo.png").setAlt("Logo").setWidth(120).setHeight(40).setLoading("lazy")
Input().setType("email").setName("email").setPlaceholder("you@example.com").setAutocomplete("email")
Input("number").setMin(1).setMax(10).setStep(1)
Textarea().setName("note").setRows(4)
Select(Option("UTC").setValue("UTC"), Option("CET").setValue("Europe/Ljubljana")).setName("tz")
Label("Email").setFor("email")
Div().setId("main").setTitle("Tooltip").setRole("region").setTabindex(0)
Div().setAria({ label: "Close", live: "polite", expanded: false })
Div().setDataAttrs({ userId: "42" })          // data-user-id="42"
Input().toggle("required")                     // boolean attribute
Input().toggle("disabled", true)               // boolean attribute, conditional
Th("Name").setScope("col")
Td("x").setColspan(2)
```

- An attribute with no setter: `.addAttribute("itemprop", "name")`. It refuses `class`, `style`,
  `id`, URL attributes (`href`, `src`, `action`…), `srcdoc`, `on*` and `hx-*`/`data-hx-*`: each
  has a checked setter or a verb, and the error names it.
- A guessed name fails with the fix in the error: `Div().src` prints `UseInstead<".setSrc(url)">`.

### Buttons

`Button()` renders `type="button"`. A button that submits its form is `SubmitButton()`.

```ts
Button("Cancel")                       // <button type="button">
SubmitButton("Save")                   // <button type="submit">
Button("Reset").setType("reset")
```

## Styling: `.tw()`

Write Tailwind's own class names, variants included, as one string:

```ts
Div().tw("flex items-center justify-between gap-4 px-6 py-4 md:px-8")
A("Open").tw("text-primary underline-offset-4 hover:underline focus-visible:ring-2")
Input().tw("w-full rounded-control border border-line px-3 py-2 aria-invalid:border-danger disabled:opacity-50")
Div().tw("grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3")
Div().tw("w-[180px] max-w-3xl -mt-2 [&>li]:py-2 data-[state=open]:bg-surface-2")
```

Every token is checked against Tailwind 4's class list and your theme. A wrong token fails with
a message naming it:

```text
Argument of type '"justify-centre"' is not assignable to parameter of type
'false | ("justify-centre" & ["✗ 'justify-centre' is not a Tailwind class"]) | null | undefined'.
… ["✗ 'bg-primry': 'primry' after 'bg-' is not a colour. Colours: primary, surface, …"]
… ["✗ 'hovr:bg-primary': unknown variant 'hovr:'"]
```

**Conditions and parts.** `.tw()` takes up to four parts; a falsy part is skipped. A condition is
its own argument, never an interpolation:

```ts
const invalid = Math.random() > 0.5;
Div().tw("border px-3", invalid && "border-danger")
Div().tw("rounded px-3", invalid ? "bg-danger/10" : "bg-surface")
```

**Constants.** `tw("…")` checks a class string once and returns a `Tw` you can reuse. Constants
compose by argument:

```ts
const button = tw("inline-flex items-center px-4 py-2 rounded-control text-sm font-medium cursor-pointer");
const primaryButton = tw(button, "bg-primary text-on-accent hover:bg-primary-700");
const card = tw("p-6 bg-surface border border-line rounded-card");
Div().tw(card, "mt-4")                 // adds to the constant; a token already there is not repeated
SubmitButton("Save").tw(primaryButton)
```

A class picked by a value is a map of constants, made exhaustive with `satisfies`:

```ts
type Status = "queued" | "ready" | "failed";
const TONE = {
  queued: tw("bg-surface-2 text-text-dim"),
  ready: tw("bg-success/10 text-success"),
  failed: tw("bg-danger/10 text-danger"),
} satisfies Record<Status, Tw>;
function StatusBadge({ status }: { status: Status }) {
  return Span(status).tw("px-2 py-0.5 rounded-full text-xs font-medium", TONE[status]);
}
```

Not accepted, by design: a string built at runtime (`.tw(someString)`), a template string
(`` .tw(`p-${n}`) ``), and `.tw()` text inside `cssClass`, `setClass` or `addClass` (they take
non-Tailwind classes only, such as `.cssClass("js-map")`).

**Not methods.** fluent-html 8's styling methods (`.p("4")`, `.bg(…)`, `.hover({…})`, `.flex()`)
are gone. Calling one fails with `UseInstead<".tw(\"p-…\") …">`.

**Values with no utility.** An arbitrary value or property in the class text: `w-[37%]`,
`grid-cols-[1fr_2fr]`, `[mask-type:luminance]`. A value only known at runtime goes through
`.setStyles({ width: `${pct}%` })`, which checks that each value is one CSS value. `.setStyle()`
takes literal CSS only.

### Theme

Colours, radius, font sizes, shadows and fonts are your theme's. Declare the tokens once:

```ts
const tokens = {
  colors: {
    primary: "#2563eb", "primary-700": "#1d4ed8", "on-accent": "#ffffff",
    bg: "#f8fafc", surface: "#ffffff", "surface-2": "#f1f5f9",
    text: "#0f172a", "text-dim": "#475569", "text-faint": "#64748b",
    line: "#e2e8f0", "line-strong": "#94a3b8",
    success: "#15803d", danger: "#b91c1c", warning: "#b45309",
  },
  radius: { card: "0.75rem", control: "0.5rem" },
} as const satisfies ThemeSpec;

export const theme = defineTheme(tokens);

declare module "fluent-html" {
  interface FluentCustomColors extends ThemeKeys<typeof tokens, "colors"> {}
  interface FluentCustomRadius extends ThemeKeys<typeof tokens, "radius"> {}
  interface FluentColorConfig { defaultPalette: false }   // optional: refuse bg-gray-100 and bg-[#fff]
}
```

Then `bg-primary`, `text-text-dim`, `border-line`, `rounded-card` and the opacity form
`bg-danger/10` are classes. Without `defaultPalette: false`, Tailwind's palette (`bg-gray-100`)
is accepted too. The other families: `FluentCustomFontSize`, `FluentCustomShadow`,
`FluentCustomFontFamily`, `FluentCustomSpacing`.

The CSS: Tailwind scans the source itself, so there is no safelist and no extractor. The same
tokens go in the stylesheet's `@theme`:

```css
@import "tailwindcss";
@source "../src";
@theme {
  --color-primary: #2563eb;
  --color-surface: #ffffff;
  --radius-card: 0.75rem;
}
```

## Control flow

```ts
type User = { id: number; name: string; avatar?: string; role: "admin" | "viewer" };
declare const users: User[];
declare const user: User;

Ul(ForEach(users, (u) => Li(u.name)))
Ul(ForEachKeyed(users, (u) => `user-${u.id}`, (u) => Li(u.name)))   // rows keep identity across a morph swap
ForEach(3, (i) => Span(`Step ${i + 1}`))                           // 0..n-1
IfThen(user.avatar, (src) => Img().setSrc(src).setAlt(user.name))  // the callback gets the non-null value
IfThenElse(users.length > 0, () => Ul(ForEach(users, (u) => Li(u.name))), () => P("No users yet."))
Match(user.role, { admin: () => Span("Admin"), viewer: () => Span("Viewer") })   // exhaustive
Span(MatchValue(user.role, { admin: "Admin", viewer: "Viewer" }))                // a value lookup
Nav(Intersperse(users, (u) => A(u.name), () => Span("/")))                       // separators between items
```

A discriminated union matches on its key, each branch narrowed:

```ts
type Load = { status: "loading" } | { status: "error"; message: string } | { status: "done"; rows: string[] };
declare const load: Load;
Match(load, "status", {
  loading: () => P("Loading"),
  error: (s) => P(s.message).tw("text-danger"),
  done: (s) => Ul(ForEach(s.rows, (r) => Li(r))),
})
```

On one element, conditional changes mirror these: `.when(cond, (t) => …)`,
`.whenElse(cond, (t) => …, (t) => …)`, `.whenMatch(value, { a: (t) => …, b: (t) => … })`, and
`.apply(fn)` for a reusable change.

## Forms: `Form<T>()`

`Form<T>` binds controls to the fields of a request type: a field name that is not a key of `T`
does not compile. Pass `{ values, errors }` to prefill and to show errors.

```ts
type SettingsReq = { displayName: string; timezone: string; notify: boolean };
declare const values: Partial<SettingsReq>;
declare const errors: ErrorBag<SettingsReq>;

Form<SettingsReq>({ values, errors }, (f) => [
  Div(
    f.label("displayName", "Display name").tw("block text-sm font-medium"),
    f.input("displayName", "text").toggle("required").tw("w-full border border-line px-3 py-2 aria-invalid:border-danger"),
    f.error("displayName"),
  ).tw("mb-4"),
  Div(
    f.label("timezone", "Timezone"),
    f.select("timezone", [
      { value: "UTC", label: "UTC" },
      { value: "Europe/Ljubljana", label: "Ljubljana" },
    ]),
    f.error("timezone"),
  ),
  Div(f.checkbox("notify"), f.label("notify", "Email notifications")).tw("flex items-center gap-2"),
  SubmitButton("Save"),
])
```

- `f.input(name, type)`, `f.textarea(name)`, `f.select(name, options)`, `f.checkbox(name, value?)`,
  `f.radio(name, value)`, `f.hidden(name, value)`, `f.label(name, …children)`, `f.error(name)`.
- A field with an error gets `aria-invalid="true"` and `aria-describedby` pointing at its
  `f.error` span, so `aria-invalid:` styles it.
- Control ids come from the field name. Two forms with the same fields on one page take
  `idPrefix`: `Form<T>({ values, errors, idPrefix: "billing" }, …)`.
- `f.error(name)` renders a bare `<span>`; style it by wrapping: `Div(f.error("x")).tw("text-sm text-danger")`.

## Routes and ids

Ids and routes are declared once and used everywhere: no id or URL string is written twice.

```ts
export const ids = defineIds(["main-content", "order-table", "settings-form"] as const);

export const orderRoutes = defineRoutes("/orders", {
  list:  { path: "/", query: { sort: "string", dir: "string", page: "number", status: "string" } as const },
  table: { path: "/table", query: { sort: "string", dir: "string", page: "number", status: "string" } as const, render: ids.orderTable },
  show:  { path: "/:id", params: { id: "number" } as const },
  save:  { method: "post", path: "/settings" },
} as const);

orderRoutes.show.resolve({ id: 7 })                              // "/orders/7"
orderRoutes.list.resolve({ sort: "date", page: 2 })              // "/orders?sort=date&page=2" (no params: query first)
orderRoutes.table({ query: { sort: "total", dir: "asc" } })      // an htmx request: GET /orders/table?sort=total&dir=asc
Div().setId(ids.orderTable)
```

- `method` defaults to `"get"`; `params` types each `:param` in the path; `query` types the
  query string.
- **`render:` is the route's answer.** No `render` means the route answers a page. `render: ids.x`
  means it answers the element with id `x`, and only fragment verbs may aim at it.

## htmx: the swap verbs

The verbs put the request, target, swap, history and loading state on an element in one call.
They take a route call (`routes.x()`), never a string.

| Verb | Use | What it does |
|---|---|---|
| `.nav(route, { invalid? })` | links, a form that navigates | morph `#main-content`, push the URL, scroll to top |
| `.tab(route)` | tabs, pills, sort and page links that stay on the page | as `.nav`, no scroll |
| `.submit(route, { invalid? })` | an in-place form or action | morph `#main-content`, no push |
| `.fragment(ids.x, route)` | update one region | morph `#x`; the route must declare `render: ids.x` |
| `.search(ids.x, route, "300ms"?)` | live filter input | debounced, newest request wins |
| `.onChange(route)` | a select or checkbox that re-renders | sends its whole form |
| `.poll(route, "2s"?)` | a region that refreshes itself | stops when rendered without `.poll` |
| `.defer(ids.x, route)` | load a region after the page | |
| `.fire(route)` | run an action, swap nothing | |

```ts
declare const rows: { id: number; total: number }[];
A("Orders").nav(orderRoutes.list())
A("Sort by total").fragment(ids.orderTable, orderRoutes.table({ query: { sort: "total", dir: "desc" } }))
Select(Option("All").setValue(""), Option("Paid").setValue("paid"))
  .setName("status")
  .fragment(ids.orderTable, orderRoutes.table({ trigger: "change", include: "closest form" }))
Input().setType("search").setName("q").setAria({ label: "Search" }).search(ids.orderTable, orderRoutes.table())
Div(Table(Tbody(ForEach(rows, (r) => Tr(Td(String(r.id)), Td(String(r.total))))))).setId(ids.orderTable)
```

- A fragment verb aimed at a route that answers another region, or a page verb aimed at a
  fragment route, does not compile.
- Every page verb targets `#main-content`; the layout must render `Main(…).setId(ids.mainContent)`.
  Other layout ids: `configureVerbs({ main: ids.x, indicator: ids.y })` once at startup.
- `A(...).nav(route)` also writes `href`, so the link works without JavaScript.

**Validation (422).** A form whose invalid answer re-renders only the form region names that
region. The server answers status 422 with the form region alone:

```ts
type SettingsReq2 = { displayName: string };
function SettingsForm({ values, errors }: { values?: Partial<SettingsReq2>; errors?: ErrorBag<SettingsReq2> }) {
  return Div(
    Form<SettingsReq2>({ values, errors }, (f) => [
      f.label("displayName", "Display name"),
      f.input("displayName", "text"),
      f.error("displayName"),
      SubmitButton("Save"),
    ]).submit(orderRoutes.save(), { invalid: ids.settingsForm }),
  ).setId(ids.settingsForm);
}
```

**Below the verbs.** `.setHtmx(route({ … }))` for what the verbs do not set (a custom swap,
`confirm`, `vals`, `headers`), and `.setHtmx(hx(url, { … }))` for a URL with no route
(`hx(assetUrl("/static/x"))`, `hx(externalUrl(url))`). A string literal is not a URL here:
`hx("/x")` does not compile. Options: `target`, `swap`, `trigger`, `include`, `vals`,
`headers`, `confirm`, `pushUrl`, `select`, `indicator`, `disable`, `sync`, `query`.

```ts
Button("Delete").setHtmx(orderRoutes.save({ confirm: "Delete this order?", target: ids.orderTable, swap: "outerMorph" }))
```

**Several regions in one answer.** `Partial(ids.x, view)` beside the main answer updates another
region out of band: `render(Partial(ids.orderTable, view), Partial(ids.settingsForm, other))`.

## Rendering

```ts
render(Div("Hello"))                         // "<div>Hello</div>"
render(Li("One"), Li("Two"))                 // several, no wrapper
render(
  Document(
    Head(Meta().setCharset("utf-8"), Title("Orders"), Link().setRel("stylesheet").setHref("/app.css")),
    Body(Main(H1("Orders")).setId(ids.mainContent)),
  ).setLang("en"),
)                                            // "<!DOCTYPE html><html lang=\"en\">…"
```

## Untrusted values

Text and attribute values are escaped; URLs set through typed setters are sanitized
(`javascript:` becomes `about:blank`). The sinks that are not plain text take checked forms:

```ts
declare const userCss: string;
declare const config: { apiBase: string };
declare const someUrl: string;
declare const sanitizedHtml: string;
Style(css`.brand { color: ${userCss}; }`)        // each hole must be one CSS value, or it throws
Script(js`window.__CONFIG = ${config};`)         // each hole becomes script-safe JSON
JsonScript(config)                               // <script type="application/json">
Div().setStyles({ color: userCss })              // runtime CSS: each value checked
A("Pay").setHref(externalUrl(someUrl))           // http(s), mailto:, tel:, a path; anything else throws
Raw("<hr>")                                      // literal HTML only
Raw(trustHtml(sanitizedHtml))                    // runtime HTML you vouch for by name
```

- `Style(string)`, `Script(string)` and `Raw(string)` do not compile.
- An `iframe` with `srcdoc` is always sandboxed.
- htmx endpoints and confirm texts starting with `js:` / `javascript:` are refused.

## Patterns

**A page.** A page is the content of `#main-content`; the layout wraps it once:

```ts
function Layout(title: string, content: View) {
  return Document(
    Head(Meta().setCharset("utf-8"), Title(title)),
    Body(Main(content).setId(ids.mainContent).tw("mx-auto max-w-5xl p-6")),
  ).setLang("en");
}
```

**A table with sort links, a filter and pagination,** each a fragment request into the table's
region; an empty state when nothing matches:

```ts
type Order = { id: number; customer: string; total: number; status: "paid" | "open" };
type TableProps = { orders: Order[]; sort: string; dir: "asc" | "desc"; page: number; pages: number };

function SortLink(p: { label: string; key: string; props: TableProps }) {
  const dir = p.props.sort === p.key && p.props.dir === "asc" ? "desc" : "asc";
  return A(p.label)
    .fragment(ids.orderTable, orderRoutes.table({ query: { sort: p.key, dir, page: 1 } }))
    .tw("font-medium hover:underline");
}

function OrderTable(props: TableProps) {
  return Div(
    IfThenElse(
      props.orders.length > 0,
      () => Table(
        Thead(Tr(
          Th(SortLink({ label: "Customer", key: "customer", props })).setScope("col"),
          Th(SortLink({ label: "Total", key: "total", props })).setScope("col"),
        )),
        Tbody(ForEachKeyed(props.orders, (o) => `order-${o.id}`, (o) => Tr(Td(o.customer), Td(o.total.toFixed(2))))),
      ).tw("w-full text-left"),
      () => P("No orders match.").tw("py-8 text-center text-text-dim"),
    ),
    Nav(
      IfThen(props.page > 1, () => A("Previous").fragment(ids.orderTable, orderRoutes.table({ query: { page: props.page - 1 } }))),
      Span(`Page ${props.page} of ${props.pages}`),
    ).setAria({ label: "Pagination" }).tw("flex gap-4 mt-4"),
  ).setId(ids.orderTable);
}
```
