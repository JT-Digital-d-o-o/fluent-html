import { page, Page, Link, Search, List, redirect, notFound, invalid, Type, Div, H1, P, Span } from "../kit/index.ts";
import { db } from "./data.ts";

// The feature's parts: what exists, at which URL, with which input and data.

export const projectList = page("/projects", {
  query: { q: Type.Optional(Type.String()) },
});
export const projectRows = projectList.region("rows", {
  load: ({ query }) => db.search(query.q),
});

export const projectDetail = page("/projects/:id", {
  params: { id: Type.Integer() },
  load: async ({ params }) => (await db.find(params.id)) ?? notFound(),
});
export const projectStatus = projectDetail.region("status", {
  load: async ({ params }) => (await db.job(params.id)) ?? notFound(),
  poll: { every: "2s", while: ({ data: job }) => job.state === "queued" || job.state === "running" },
});
export const deleteProject = projectDetail.action("delete", {
  confirm: { title: "Delete this project?", body: "Its jobs and files go with it. This cannot be undone.", confirm: "Delete project" },
  run: async ({ params }) => {
    await db.remove(params.id);
    return redirect(projectList);
  },
});

export const projectNew = page("/projects/new");
export const createProject = projectNew.form("create", {
  schema: Type.Object({
    name: Type.String({ minLength: 1, maxLength: 80 }),
    description: Type.Optional(Type.String({ maxLength: 500 })),
    status: Type.Union([Type.Literal("draft"), Type.Literal("active")]),
  }),
  submit: async ({ data }) => {
    if (await db.nameTaken(data.name)) return invalid({ name: "A project with this name exists" });
    const project = await db.create(data);
    return redirect(projectDetail, { id: project.id });
  },
  class: "flex max-w-lg flex-col gap-4",
});

// R1: project list

projectList.view(() =>
  Page({ title: "Projects", class: "mx-auto max-w-3xl p-6" },
    Div({ class: "flex items-center justify-between gap-4" },
      H1({ class: "text-2xl font-semibold text-text" }, "Projects"),
      Link({ to: projectNew, class: "rounded-control bg-primary px-4 py-2 text-on-accent hover:bg-primary-700" }, "New project"),
    ),
    Search({ into: projectRows, name: "q", label: "Search projects", placeholder: "Search by name", class: "mt-6 w-full" }),
    projectRows.show(),
  ),
);

projectRows.view(({ data: projects, query }) =>
  List({
    items: projects,
    key: (p) => p.id,
    class: "mt-4 divide-y divide-line rounded-card border border-line bg-surface",
    row: (p) =>
      Link({ to: projectDetail, params: { id: p.id }, class: "flex items-center justify-between px-4 py-3 hover:bg-surface-2" },
        Span({ class: "font-medium text-text" }, p.name),
        Span({ class: "text-sm text-text-dim" }, p.status),
      ),
    empty: Div({ class: "mt-4 rounded-card border border-dashed border-line p-10 text-center" },
      P({ class: "font-medium text-text" }, query.q ? `No projects match "${query.q}"` : "No projects yet"),
      P({ class: "mt-1 text-sm text-text-dim" }, "Create one to get started."),
    ),
  }),
);

// R2: create form

projectNew.view(() =>
  Page({ title: "New project", class: "mx-auto max-w-3xl p-6" },
    H1({ class: "mb-6 text-2xl font-semibold text-text" }, "New project"),
    createProject.show({ status: "draft" }),
  ),
);

createProject.view((f) => [
  f.field("name", "Name", { placeholder: "Apollo" }),
  f.field("description", "Description", { as: "textarea", hint: "Optional, up to 500 characters." }),
  f.field("status", "Status", { options: { draft: "Draft", active: "Active" } }),
  Div({ class: "flex items-center gap-3" },
    f.submit("Create project"),
    Link({ to: projectList, class: "text-sm text-text-dim hover:text-text" }, "Cancel"),
  ),
]);

// R3: project detail

projectDetail.view(({ data: project }) =>
  Page({ title: project.name, class: "mx-auto max-w-3xl p-6" },
    Div({ class: "flex items-start justify-between gap-4" },
      Div(
        H1({ class: "text-2xl font-semibold text-text" }, project.name),
        P({ class: "mt-1 text-text-dim" }, project.description || "No description."),
      ),
      deleteProject.button({ class: "rounded-control border border-danger px-4 py-2 text-danger hover:bg-danger/10" }, "Delete"),
    ),
    projectStatus.show(),
  ),
);

projectStatus.view(({ data: job }) =>
  Span({
      class: {
        queued: "bg-surface-2 text-text-dim",
        running: "bg-info/10 text-info",
        done: "bg-success/10 text-success",
        failed: "bg-danger/10 text-danger",
      }[job.state] + " mt-6 inline-flex rounded-full px-3 py-1 text-sm font-medium",
    },
    { queued: "Queued", running: `Running, ${job.progress}%`, done: "Finished", failed: "Failed" }[job.state],
  ),
);
