// Every snippet in lean-tags/REFERENCE.md, compiled: the reference must not promise what tsc rejects.
import { a, button, css, dialog, div, doc, form, handlers, input, jsVar, json, label, li, main, match, modal, page, part, post, raw, render, routes, select, serve, span, style, trusted, tw, iframe, type Child, type FormState, type Tw } from "lean-tags";
import { z } from "#zod";

const Input = z.object({ name: z.string().min(1), description: z.string().optional(), status: z.enum(["active", "paused"]), pinned: z.string().optional(), ref: z.string().optional() });
export const projects = routes("/projects", {
  list: page("/", { q: "string?" }),
  rows: part("project-list", "/rows", { q: "string?", status: "string?" }),
  new: page("/new"),
  create: post("/", Input),
  detail: page("/:id", { id: "number" }),
  status: part("project-status", "/:id/status", { id: "number" }),
  stats: part("project-stats", "/stats"),
  remove: post("/:id/delete", { id: "number" }),
  like: post("/:id/like", { id: "number" }),
});
type Status = "active" | "paused";
const p = { id: 1, name: "x" };
const id = 1, q = "a", open = true, running = true, status = "active" as Status, ref = "r", pct = 40, data = { a: 1 }, html = "<b>x</b>";
export const t1 = li({ id: `project-${p.id}` }, a(tw`flex gap-4 hover:bg-surface-2`, projects.detail({ id: p.id }), p.name));
const card = tw`p-6 bg-surface rounded-card shadow-md`;
export const t2 = div(card, tw`mt-4`, "…");
const primary = tw`${card} bg-primary text-on-accent`;
const tone: Record<Status, Tw> = { active: tw`text-success`, paused: tw`text-warning` };
export const t3 = [span(tone[status], status), div(tw`${open && tw`ring-2`} p-4`), tw.token("is-active")];
export const t4 = [projects.detail({ id: 1 }), projects.list({ q }), projects.new()];
export const w = [
  a(projects.detail({ id }), "Open"),
  form(projects.list(), input({ name: "q" })),
  button(projects.remove({ id }), "Delete"),
  button(projects.like({ id }).fire(), "Like"),
  div(projects.rows().root, "…"),
  input({ type: "search" }, projects.rows().search("q")),
  select(projects.rows().change("status")),
  button(projects.rows().load(), "Refresh"),
  span(projects.status({ id }).poll(running && "2s"), "…"),
  div(projects.stats().defer(), "Loading…"),
  button(wire_(), "x"),
];
function wire_() { return modal("x").open; }
const confirm = modal("delete-project");
export const d = [button(confirm.open, "Delete"), dialog(tw`rounded-card p-6 backdrop:bg-overlay/40`, confirm.root, "…", button(confirm.close, "Cancel"))];
const control = tw`rounded-control border`;
type State = FormState<typeof projects.create>;
export const ProjectForm = (state: State) =>
  projects.create().form(state, tw`grid gap-4`, (f) => [
    label(tw`grid gap-1`, "Name", f.input("name", control, { required: true }), f.error("name", tw`text-danger`)),
    label(tw`grid gap-1`, "Notes", f.textarea("description", control, { rows: 4 })),
    label(tw`grid gap-1`, "Status", f.select("status", { active: "Active", paused: "Paused" }, control)),
    f.checkbox("pinned"), f.hidden("ref", ref),
    button(primary, { type: "submit" }, "Create"),
  ]);
export const Layout = (o: { title: string }, ...children: Child[]) =>
  doc({ title: o.title, description: "…" }, main(tw`mx-auto max-w-3xl p-4`, { id: "main" }, children));
const Page_ = () => Layout({ title: "x" }, "y");
const projectHandlers = handlers(projects, {
  list: async ({ input }) => (input.q, Page_()),
  rows: async () => div(projects.rows().root),
  new: () => Page_(),
  create: { form: ProjectForm, ok: async ({ body, redirect, invalid }) => (body.name === "x" ? invalid({ name: "Taken" }) : redirect(projects.detail({ id: 1 }))) },
  detail: async ({ input, notFound }) => (input.id > 0 ? Page_() : notFound()),
  status: async ({ input }) => span(projects.status({ id: input.id }).poll(false)),
  stats: () => div(projects.stats().root),
  remove: async ({ redirect }) => redirect(projects.list()),
  like: async ({ redirect }) => redirect(projects.list()),
});
const home = routes("/", { index: page("/") });
const homeHandlers = handlers(home, { index: () => Page_() });
export const s = () => serve([projectHandlers, homeHandlers], 3000);
export const r = async () => render((await projectHandlers("detail", { input: { id: 1 } })).body ? div() : div());
export const m = match(status, { active: () => "a", paused: () => "p" });
export const m2 = match({ kind: "ok" as const, n: 1 } as { kind: "ok"; n: number } | { kind: "error"; message: string }, "kind", { ok: (x) => x.n, error: (x) => x.message });
export const sinks = [json(data, { id: "chart-data" }), jsVar("__DATA", data), style(css`.bar{width: ${pct}%}`), iframe({ srcdoc: html }), raw(trusted`<svg></svg>`)];
