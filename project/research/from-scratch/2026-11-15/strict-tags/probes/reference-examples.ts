// Every example in REFERENCE.md, plus the two bake-off screens' shapes (a settings form with a
// select and a checkbox; a table with sort links, a pager, a status filter and an empty state),
// compiled so the reference cannot teach something the types refuse.
//   tsc -p probes/tsconfig.reference.json
import {
  a, action, asset, backdrop, button, cls, css, dialog, div, doc, h1, h2, handlers, header, hover, iframe, img, input, json, jsVar, label, li, match, md, modal, nav, option, p, page, part, raw,
  render, routes, section, select, span, style, table, tbody, td, text, th, thead, tr, trusted, ul, url, variant, wire, local,
  type Cls, type FlowKid, type FormState, type PhrasingKid, type Schema,
} from "#st";
import { ProjectInput } from "../screens/projects.schema.ts";

declare const slug: string, pct: number, html: string, ref: string;
declare const user: { website: string };
type Status = "active" | "paused";
declare const status: Status, open: boolean, running: boolean;

// Tags
export const row = (item: { id: number; name: string }) => li({ id: `project-${item.id}` }, a(cls("flex gap-4", hover("bg-surface-2")), projects.detail({ id: item.id }), item.name));
export const word = span(text("hidden"));
export const Card = (...children: FlowKid[]) => div(cls("p-6 bg-surface rounded-card"), children);
export const Badge = (...children: PhrasingKid[]) => span(cls("rounded-full px-2 text-xs"), children);

// Classes
const card = cls("p-6 bg-surface rounded-card shadow-md");
export const c1 = div(card, cls("mt-4"), "…");
const primary = cls(card, "bg-primary text-on-accent", hover("bg-primary-700"));
const tone: Record<Status, Cls> = { active: cls("text-success"), paused: cls("text-warning") };
export const c2 = span(tone[status], open && cls("ring-2"), status);
export const c3 = cls.token(slug);
export const c4 = cls(hover("bg-surface-2 underline"), md(hover("px-8")), variant("data-[state=open]", "bg-surface-2"), variant("has-[:checked]", "ring-2"), "w-[180px] grid-cols-[8rem_1fr] bg-primary/10");

// Routes
export const projects = routes("/projects", {
  list: page("/", { q: "string?" }),
  rows: part("project-list", "/rows", { q: "string?" }),
  new: page("/new"),
  create: action("/", ProjectInput),
  detail: page("/:id", { id: "number" }),
  status: part("project-status", "/:id/status", { id: "number" }),
  stats: part("project-stats", "/stats"),
  like: action("/:id/like", { id: "number" }),
  remove: action("/:id/delete", { id: "number" }),
});
const id = 1;
export const w1 = a(projects.detail({ id }), "Open");
export const w2 = section(div(projects.rows().root, "…"), input({ type: "search", "aria-label": "Search" }, projects.rows().search("q")));
export const w3 = button(projects.remove({ id }), "Delete");
export const w4 = button(projects.like({ id }).fire(), "Like");
export const w5 = span(projects.status({ id }).poll(running && "2s"), "…");
export const w6 = div(projects.stats().defer(), "Loading…");
export const w7 = button(wire({ get: local(slug), target: projects.rows(), swap: "outerMorph", confirm: "Sure?", vals: { a: 1 }, push: true }), "More");

// Dialogs
const confirm = modal("delete-project");
export const d1 = div(button(confirm.open, "Delete"), dialog(cls("rounded-card p-6", backdrop("bg-overlay/40")), confirm.root, h2(confirm.title, "Delete?"), button(confirm.close, "Cancel")));

// Forms
declare const SettingsInput: Schema<{ displayName: string; timezone: "utc" | "cet"; notify?: string; ref?: string }>;
export const settings = routes("/settings", { show: page("/", { saved: "boolean?" }), save: action("/", SettingsInput) });
type State = FormState<typeof settings.save>;
const control = cls("rounded-control border border-line px-3 py-2");
export const SettingsForm = (state: State) =>
  settings.save().form(state, cls("grid gap-4"), (f) => [
    label(cls("grid gap-1"), "Display name", f.input("displayName", control, { required: true }), f.error("displayName", cls("text-danger"))),
    label(cls("grid gap-1"), "Timezone", f.select("timezone", { utc: "UTC", cet: "Central Europe" }, control), f.error("timezone", cls("text-danger"))),
    label(cls("flex gap-2"), f.checkbox("notify"), "Email notifications"),
    f.hidden("ref", ref),
    button(primary, { type: "submit" }, "Save"),
  ]);
export const twice = div(SettingsForm({ scope: "initial" }), SettingsForm({ errors: { displayName: "Required" }, scope: "invalid" }));

// Documents
const SiteHeader = () => header(nav({ "aria-label": "Main" }, a(projects.list(), "Projects")));
export const Layout = (o: { title: string }, ...children: FlowKid[]) =>
  doc({ title: o.title, description: "…", header: SiteHeader(), head: [style(css`.bar{width: ${pct}%}`)] }, cls("mx-auto max-w-3xl p-4"), ...children);
export const SettingsPage = (state: State, saved?: boolean) =>
  Layout({ title: "Settings" }, h1("Account settings"), saved && p({ role: "status" }, "Saved."), SettingsForm(state));

// The orders table: sort links, a pager and a status filter that swap one part
type Order = { id: number; customer: string; status: "open" | "paid"; total: number };
type Query = { sort?: string; page?: number; status?: string };
export const orders = routes("/orders", {
  list: page("/", { sort: "string?", page: "number?", status: "string?" }),
  table: part("orders-table", "/table", { sort: "string?", page: "number?", status: "string?" }),
});
const SortLink = (q: Query, key: string, title: string) => th({ scope: "col" }, a(orders.list({ ...q, sort: key }), orders.table({ ...q, sort: key }).load(), title));
export const OrdersTable = ({ rows, q, pages }: { rows: Order[]; q: Query; pages: number }) =>
  div(
    orders.table(q).root,
    rows.length
      ? table(
          cls("w-full text-sm"),
          thead(tr(SortLink(q, "customer", "Customer"), SortLink(q, "status", "Status"), SortLink(q, "total", "Total"))),
          tbody(rows.map((o) => tr(td(o.customer), td(o.status), td(o.total)))),
        )
      : p(cls("py-12 text-center text-text-dim"), "No orders match."),
    nav(
      { "aria-label": "Pages" },
      ul(cls("flex gap-2"), Array.from({ length: pages }, (_, i) => li(a(orders.list({ ...q, page: i + 1 }), orders.table({ ...q, page: i + 1 }).load(), { "aria-current": q.page === i + 1 ? "page" : undefined }, String(i + 1))))),
    ),
  );
export const OrdersPage = (props: { rows: Order[]; q: Query; pages: number }) =>
  Layout(
    { title: "Orders" },
    h1("Orders"),
    select({ "aria-label": "Status" }, orders.table(props.q).change("status"), option({ value: "" }, "All"), option({ value: "open", selected: props.q.status === "open" }, "Open"), option({ value: "paid", selected: props.q.status === "paid" }, "Paid")),
    OrdersTable(props),
  );

// Handlers
declare const findOrders: (q: Query) => Promise<{ rows: Order[]; pages: number }>;
export const ordersApp = handlers(orders, {
  list: async ({ input }) => OrdersPage({ ...(await findOrders(input)), q: input }),
  table: async ({ input }) => OrdersTable({ ...(await findOrders(input)), q: input }),
});
export const settingsApp = handlers(settings, {
  show: ({ input }) => SettingsPage({}, input.saved),
  save: { form: SettingsForm, ok: async ({ body, redirect, invalid }) => (body.displayName === "admin" ? invalid({ displayName: "Taken" }) : redirect(settings.show({ saved: true }))) },
});
export const tested = async () => [await ordersApp("list", { input: {} }), render(OrdersTable({ rows: [], q: {}, pages: 0 }))];

// URLs, scripts, styles, raw markup
export const u1 = div(
  a({ href: url(user.website) }, "Website"),
  img({ src: asset("/img/logo.png"), alt: "Logo" }),
  json({ a: 1 }, { id: "chart-data" }),
  jsVar("__DATA", { a: 1 }),
  iframe({ srcdoc: html, title: "Preview" }),
  button({ "aria-label": "Close" }, raw(trusted`<svg viewBox="0 0 1 1"></svg>`)),
);

// Control flow
export const m1 = div(match(status, { active: () => span("On"), paused: () => span("Off") }));
declare const state: { kind: "ok"; rows: Order[] } | { kind: "error"; message: string };
export const m2 = div(match.on(state, "kind", { ok: (s) => p(String(s.rows.length)), error: (s) => p({ role: "alert" }, s.message) }));
