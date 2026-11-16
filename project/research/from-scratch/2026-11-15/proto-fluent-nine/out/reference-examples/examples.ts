import {
  Div, Main, Section, Header, Footer, Nav, H1, H2, P, Span, A, Ul, Li, Button, SubmitButton,
  Form, Label, Input, Select, Option, Textarea, Table, Thead, Tbody, Tr, Th, Td, Img, Dialog,
  Document, Head, Body, Title, Meta, Link, Style, Script, JsonScript, css, js, Raw, trustHtml,
  ForEach, ForEachKeyed, IfThen, IfThenElse, Match, MatchValue, Intersperse, Empty,
  defineTheme, defineIds, defineRoutes, hx, externalUrl, assetUrl, Partial, hxResponse, tw, render,
  type View, type Tw, type ErrorBag, type ThemeKeys, type ThemeSpec, type PageRoute, type FragmentRoute,
} from "fluent-html";
(globalThis as any).__fixture = (n: string) => ({ users: [{ id: 1, name: "Ana", role: "admin" }], user: { id: 1, name: "Ana", role: "admin" }, rows: [{ id: 1, total: 2 }], load: { status: "done", rows: ["a"] }, values: {}, errors: {}, userCss: "red", config: { apiBase: "/api" }, someUrl: "https://example.com", sanitizedHtml: "<b>x</b>" } as Record<string, unknown>)[n];

Div("Hello")                         // text child, escaped
Div(H1("Title"), P("Body"))          // children are arguments: never an array
Div()                                // empty
Ul(ForEach(["a", "b"], (x) => Li(x)))  // a list is ForEach, never .map
Empty()                              // renders nothing

type BadgeProps = { label: string; tone: "ok" | "bad" };
function Badge({ label, tone }: BadgeProps) {
  return Span(label).tw("px-2 py-0.5 rounded-full text-xs", tone === "ok" ? "bg-success/10 text-success" : "bg-danger/10 text-danger");
}

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

Button("Cancel")                       // <button type="button">
SubmitButton("Save")                   // <button type="submit">
Button("Reset").setType("reset")

Div().tw("flex items-center justify-between gap-4 px-6 py-4 md:px-8")
A("Open").tw("text-primary underline-offset-4 hover:underline focus-visible:ring-2")
Input().tw("w-full rounded-control border border-line px-3 py-2 aria-invalid:border-danger disabled:opacity-50")
Div().tw("grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3")
Div().tw("w-[180px] max-w-3xl -mt-2 [&>li]:py-2 data-[state=open]:bg-surface-2")

const invalid = Math.random() > 0.5;
Div().tw("border px-3", invalid && "border-danger")
Div().tw("rounded px-3", invalid ? "bg-danger/10" : "bg-surface")

const button = tw("inline-flex items-center px-4 py-2 rounded-control text-sm font-medium cursor-pointer");
const primaryButton = tw(button, "bg-primary text-on-accent hover:bg-primary-700");
const card = tw("p-6 bg-surface border border-line rounded-card");
Div().tw(card, "mt-4")                 // adds to the constant; a token already there is not repeated
SubmitButton("Save").tw(primaryButton)

type Status = "queued" | "ready" | "failed";
const TONE = {
  queued: tw("bg-surface-2 text-text-dim"),
  ready: tw("bg-success/10 text-success"),
  failed: tw("bg-danger/10 text-danger"),
} satisfies Record<Status, Tw>;
function StatusBadge({ status }: { status: Status }) {
  return Span(status).tw("px-2 py-0.5 rounded-full text-xs font-medium", TONE[status]);
}

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

type User = { id: number; name: string; avatar?: string; role: "admin" | "viewer" };
const users: User[] = (globalThis as any).__fixture("users");
const user: User = (globalThis as any).__fixture("user");

Ul(ForEach(users, (u) => Li(u.name)))
Ul(ForEachKeyed(users, (u) => `user-${u.id}`, (u) => Li(u.name)))   // rows keep identity across a morph swap
ForEach(3, (i) => Span(`Step ${i + 1}`))                           // 0..n-1
IfThen(user.avatar, (src) => Img().setSrc(src).setAlt(user.name))  // the callback gets the non-null value
IfThenElse(users.length > 0, () => Ul(ForEach(users, (u) => Li(u.name))), () => P("No users yet."))
Match(user.role, { admin: () => Span("Admin"), viewer: () => Span("Viewer") })   // exhaustive
Span(MatchValue(user.role, { admin: "Admin", viewer: "Viewer" }))                // a value lookup
Nav(Intersperse(users, (u) => A(u.name), () => Span("/")))                       // separators between items

type Load = { status: "loading" } | { status: "error"; message: string } | { status: "done"; rows: string[] };
const load: Load = (globalThis as any).__fixture("load");
Match(load, "status", {
  loading: () => P("Loading"),
  error: (s) => P(s.message).tw("text-danger"),
  done: (s) => Ul(ForEach(s.rows, (r) => Li(r))),
})

type SettingsReq = { displayName: string; timezone: string; notify: boolean };
const values: Partial<SettingsReq> = (globalThis as any).__fixture("values");
const errors: ErrorBag<SettingsReq> = (globalThis as any).__fixture("errors");

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

const rows: { id: number; total: number }[] = (globalThis as any).__fixture("rows");
A("Orders").nav(orderRoutes.list())
A("Sort by total").fragment(ids.orderTable, orderRoutes.table({ query: { sort: "total", dir: "desc" } }))
Select(Option("All").setValue(""), Option("Paid").setValue("paid"))
  .setName("status")
  .fragment(ids.orderTable, orderRoutes.table({ trigger: "change", include: "closest form" }))
Input().setType("search").setName("q").setAria({ label: "Search" }).search(ids.orderTable, orderRoutes.table())
Div(Table(Tbody(ForEach(rows, (r) => Tr(Td(String(r.id)), Td(String(r.total))))))).setId(ids.orderTable)

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

Button("Delete").setHtmx(orderRoutes.save({ confirm: "Delete this order?", target: ids.orderTable, swap: "outerMorph" }))

render(Div("Hello"))                         // "<div>Hello</div>"
render(Li("One"), Li("Two"))                 // several, no wrapper
render(
  Document(
    Head(Meta().setCharset("utf-8"), Title("Orders"), Link().setRel("stylesheet").setHref("/app.css")),
    Body(Main(H1("Orders")).setId(ids.mainContent)),
  ).setLang("en"),
)                                            // "<!DOCTYPE html><html lang=\"en\">…"

const userCss: string = (globalThis as any).__fixture("userCss");
const config: { apiBase: string } = (globalThis as any).__fixture("config");
const someUrl: string = (globalThis as any).__fixture("someUrl");
const sanitizedHtml: string = (globalThis as any).__fixture("sanitizedHtml");
Style(css`.brand { color: ${userCss}; }`)        // each hole must be one CSS value, or it throws
Script(js`window.__CONFIG = ${config};`)         // each hole becomes script-safe JSON
JsonScript(config)                               // <script type="application/json">
Div().setStyles({ color: userCss })              // runtime CSS: each value checked
A("Pay").setHref(externalUrl(someUrl))           // http(s), mailto:, tel:, a path; anything else throws
Raw("<hr>")                                      // literal HTML only
Raw(trustHtml(sanitizedHtml))                    // runtime HTML you vouch for by name

function Layout(title: string, content: View) {
  return Document(
    Head(Meta().setCharset("utf-8"), Title(title)),
    Body(Main(content).setId(ids.mainContent).tw("mx-auto max-w-5xl p-6")),
  ).setLang("en");
}

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
