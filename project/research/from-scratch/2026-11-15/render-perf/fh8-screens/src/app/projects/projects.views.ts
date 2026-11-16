import {
  A, Button, Dialog, Div, ForEachKeyed, Form, H1, H2, IfThenElse, Input, Li, MatchValue, P, Section, Span, Ul,
  type FormState,
} from "fluent-html";
import type { Styler } from "../../shared/stylers.js";
import { Layout } from "../../core/layout/layout.view.js";
import { ids, projectRoutes } from "./projects.routes.js";
import type { CreateProjectReq } from "./projects.schema.js";

export type Project = { id: number; name: string; owner: string; status: "active" | "paused" };
export type Job = { state: "queued" | "running" | "done" | "failed"; progress: number };

const primaryButton: Styler = (t) => t.rounded("control").bg("primary").px("4").py("2").text("on-accent").hover({ bg: "primary-700" });

// R1: project list

function ProjectRow(p: Project) {
  return Li(
    A(
      Span(p.name).font("medium").text("ink"),
      Span(p.owner).text("sm").text("text-dim"),
    )
      .nav(projectRoutes.detail({ id: p.id }))
      .flex().items("center").justify("between").px("4").py("3")
      .hover({ bg: "surface-2" }),
  );
}

export function ProjectList({ projects }: { projects: Project[] }) {
  return Div(
    IfThenElse(
      projects.length > 0,
      () => Ul(ForEachKeyed(projects, (p) => p.id, ProjectRow)).divideY().divide("line"),
      () => P("No projects match your search.").p("8").text("center").text("text-dim"),
    ),
  )
    .setId(ids.projectList)
    .rounded("card").border().border("line").bg("surface");
}

export function ProjectListPage({ q, projects }: { q?: string; projects: Project[] }) {
  return Layout({
    title: "Projects",
    children: Section(
      Div(
        H1("Projects").text("2xl").font("bold").text("ink"),
        A("New project").nav(projectRoutes.new()).apply(primaryButton),
      ).flex().items("center").justify("between"),
      Input()
        .setType("search").setName("q").setValue(q ?? "").setPlaceholder("Search projects")
        .setAria({ label: "Search projects" })
        .search(ids.projectList, projectRoutes.rows())
        .w("full").rounded("control").border().border("line").px("3").py("2"),
      ProjectList({ projects }),
    ).mx("auto").maxW("3xl").flex().flex("col").gap("4").p("6"),
  });
}

// R2: create form

const label: Styler = (t) => t.block().text("sm").font("medium").text("ink");
const control: Styler = (t) =>
  t.mt("1").w("full").rounded("control").border().border("line").px("3").py("2").variant("aria-[invalid=true]", { border: "danger" });
const message: Styler = (t) => t.mt("1").text("sm").text("danger");

export function ProjectForm(state: FormState<CreateProjectReq> = {}) {
  return Form<CreateProjectReq>(state, (f) => [
    Div(
      f.label("name", "Name").apply(label),
      f.input("name", "text").toggle("required").setMinlength(3).setMaxlength(80).apply(control),
      Div(f.error("name")).apply(message),
    ),
    Div(
      f.label("ownerEmail", "Owner email").apply(label),
      f.input("ownerEmail", "email").toggle("required").apply(control),
      Div(f.error("ownerEmail")).apply(message),
    ),
    Div(
      f.label("status", "Status").apply(label),
      f.select("status", [
        { value: "active", label: "Active" },
        { value: "paused", label: "Paused" },
      ]).toggle("required").apply(control),
      Div(f.error("status")).apply(message),
    ),
    Div(
      f.label("notes", "Notes").apply(label),
      f.textarea("notes").setRows(4).setMaxlength(500).apply(control),
      Div(f.error("notes")).apply(message),
    ),
    Button("Create project").setType("submit").apply(primaryButton),
  ])
    .setId(ids.projectForm)
    .nav(projectRoutes.create(), { invalid: ids.projectForm })
    .flex().flex("col").gap("4");
}

export function NewProjectPage(state: FormState<CreateProjectReq> = {}) {
  return Layout({
    title: "New project",
    children: Section(
      H1("New project").text("2xl").font("bold").text("ink"),
      ProjectForm(state),
    ).mx("auto").maxW("xl").flex().flex("col").gap("6").p("6"),
  });
}

// R3: project detail

const isRunning = (job: Job) => job.state === "queued" || job.state === "running";

export function JobStatus({ projectId, job }: { projectId: number; job: Job }) {
  return Span(
    MatchValue(job.state, {
      queued: "Queued",
      running: `Running, ${job.progress}%`,
      done: "Finished",
      failed: "Failed",
    }),
  )
    .setId(ids.jobStatus)
    .when(isRunning(job), (t) => t.poll(projectRoutes.status({ id: projectId }), "2s"))
    .inlineFlex().items("center").gap("2").rounded("full").px("3").py("1").text("sm")
    .whenMatch(job.state, {
      queued: (t) => t.bg("surface-2").text("text-dim"),
      running: (t) => t.bg("info/10").text("info"),
      done: (t) => t.bg("success/10").text("success"),
      failed: (t) => t.bg("danger/10").text("danger"),
    });
}

export function ProjectDetailPage({ project, job }: { project: Project; job: Job }) {
  return Layout({
    title: project.name,
    children: Section(
      Div(
        H1(project.name).text("2xl").font("bold").text("ink"),
        Button("Delete")
          .setType("button").setCommand("show-modal").setCommandfor(ids.deleteDialog)
          .rounded("control").border().border("danger").px("4").py("2").text("danger").cursor("pointer")
          .hover({ bg: "danger/10" }),
      ).flex().items("center").justify("between"),
      P(`Owner: ${project.owner}`).text("text-dim"),
      P("Import job ", JobStatus({ projectId: project.id, job })).flex().items("center").gap("2").text("sm").text("text-dim"),
      Dialog(
        H2(`Delete ${project.name}?`).setId("delete-title").text("lg").font("bold").text("ink"),
        P("This removes the project and its jobs. It cannot be undone.").mt("2").text("text-dim"),
        Div(
          Button("Cancel")
            .setType("button").setCommand("close").setCommandfor(ids.deleteDialog)
            .rounded("control").px("4").py("2").text("text-dim").cursor("pointer")
            .hover({ bg: "surface-2" }),
          Button("Delete project")
            .setType("button")
            .submit(projectRoutes.remove({ id: project.id }))
            .rounded("control").bg("danger").px("4").py("2").text("on-accent"),
        ).mt("6").flex().justify("end").gap("3"),
      )
        .setId(ids.deleteDialog).setClosedby("any").setAria({ labelledby: "delete-title" })
        .rounded("card").p("6"),
    ).mx("auto").maxW("3xl").flex().flex("col").gap("6").p("6"),
  });
}
