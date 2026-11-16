// fluent-html 8.1.0 as the template uses it: the package, the template's swap verbs (keep-fh9's copy of
// swap-verbs.ts), a closed theme, and a stand-in for the template's render contract (define-controller.ts:
// page()/fragment() entries typed from the route's stance, renderView checking nothing).
import {
  Body, Button, Div, Document, Form, H1, Head, Main, Match, Meta, P, Span, Title, defineIds, defineRoutes, defineTheme, render,
  type AnyRouteCallable, type ErrorBag, type Id, type RootedView, type ThemeKeys, type ThemeSpec, type View,
} from "fluent-html";
import "../../../keep-fh9/proto/verbs.ts";
import type { Job } from "../common/data.ts";
export * from "fluent-html";
export { hostile, project, tone, count, type Job, type Project } from "../common/data.ts";

const tokens = {
  colors: {
    primary: "#2563eb", "primary-700": "#1d4ed8", "on-accent": "#ffffff", surface: "#ffffff", "surface-2": "#f3f4f6",
    text: "#111827", "text-dim": "#4b5563", line: "#e5e7eb", success: "#15803d", danger: "#dc2626", warning: "#b45309",
  },
  radius: { card: "0.75rem", control: "0.5rem" },
} as const satisfies ThemeSpec;
export const theme = defineTheme(tokens);
declare module "fluent-html" {
  interface FluentCustomColors extends ThemeKeys<typeof tokens, "colors"> {}
  interface FluentColorConfig { defaultPalette: false }
  interface FluentCustomRadius extends ThemeKeys<typeof tokens, "radius"> {}
}

export const ids = defineIds(["main-content", "project-list", "project-form", "project-status", "project-count"] as const);
export const projectRoutes = defineRoutes("/projects", {
  index: { path: "/", query: { q: "string" } as const },
  rows: { path: "/rows", query: { q: "string" } as const, render: ids.projectList },
  new: { path: "/new" },
  create: { method: "post", path: "/" },
  detail: { path: "/:id", params: { id: "number" } as const },
  status: { path: "/:id/status", params: { id: "number" } as const, render: ids.projectStatus },
  remove: { method: "post", path: "/:id/delete", params: { id: "number" } as const },
} as const);

declare const pageBrand: unique symbol;
export type PageResponse = View & { readonly [pageBrand]: true };
export function Layout(title: string, ...content: View[]): PageResponse {
  return Document(Head(Meta().setCharset("utf-8"), Title(title)), Body(Main(...content).setId(ids.mainContent))).setLang("en") as unknown as PageResponse;
}

type IdOf<C extends AnyRouteCallable> = C["render"] extends Id<infer N> ? N : never;
export type Answer = { status: number; html: string };
export const page = <C extends AnyRouteCallable>(_route: C, view: () => PageResponse): Answer => ({ status: 200, html: render(view()) });
export const fragment = <C extends AnyRouteCallable>(_route: C, view: () => RootedView<IdOf<C>>): Answer => ({ status: 200, html: render(view()) });
export const renderView = (status: number, view: View): Answer => ({ status, html: render(view) });
export const html = (view: View): string => render(view);

export type CreateProjectReq = { name: string; status: "active" | "paused" };
export type FormProps = { values?: Partial<CreateProjectReq>; errors?: ErrorBag<CreateProjectReq> };
export function ProjectForm({ values, errors }: FormProps) {
  return Div(
    Form<CreateProjectReq>({ values, errors }, (f) => [
      f.label("name", "Name"), f.input("name", "text"), f.error("name"),
      f.label("status", "Status"), f.select("status", [{ value: "active", label: "Active" }, { value: "paused", label: "Paused" }]),
      Button("Create").setType("submit"),
    ]).submit(projectRoutes.create(), { invalid: ids.projectForm }),
  ).setId(ids.projectForm);
}
export const NewProjectPage = (props: FormProps = {}) => Layout("New project", H1("New project"), ProjectForm(props));

export function JobBadge({ job }: { job: Job }) {
  return Match(job, {
    queued: () => Span("Queued"),
    running: () => Span("Running"),
    done: () => Span("Done"),
    failed: () => Span("Failed"),
  });
}
export function StatusRegion({ id, job }: { id: number; job: Job }) {
  return Div(JobBadge({ job }))
    .setId(ids.projectStatus)
    .when(job === "queued" || job === "running", (t) => t.poll(projectRoutes.status({ id }), "2s"));
}
export const ProjectList = (names: string[]) => Div(P(names.join(", "))).setId(ids.projectList);
