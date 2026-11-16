import { A, Button, Div, Form, H1, Label, type Styler } from "fluent-html";
import { Layout } from "../../../core/layout/layout.view.js";
import { projectRoutes, ids } from "../projects.routes.js";
import type { ProjectErrors, ProjectReq } from "../projects.schema.js";
import { primaryButton, quietButton } from "./projects.components.js";

type FormProps = { values?: Partial<ProjectReq>; errors?: ProjectErrors };

const field: Styler = (t) => t.grid().gap("1").text("sm").font("medium");
const control: Styler = (t) =>
  t.rounded("control").border().border("line").bg("surface").px("3").py("2").font("normal").variant("aria-invalid", { border: "danger" });
const error: Styler = (t) => t.font("normal").text("danger");

export function ProjectForm({ values = {}, errors = {} }: FormProps) {
  return Form<ProjectReq>({ values, errors }, (f) => [
    Label("Name", f.input("name", "text").toggle("required").setMaxlength(80).apply(control), f.error("name").apply(error)).apply(field),
    Label("Description", f.textarea("description").setRows(4).apply(control), f.error("description").apply(error)).apply(field),
    Label(
      "Status",
      f.select("status", [
        { value: "active", label: "Active" },
        { value: "paused", label: "Paused" },
      ]).apply(control),
      f.error("status").apply(error),
    ).apply(field),
    Div(
      Button("Create project").setType("submit").apply(primaryButton),
      A("Cancel").nav(projectRoutes.list()).apply(quietButton),
    ).flex().gap("3"),
  ])
    .setId(ids.projectForm)
    .nav(projectRoutes.create(), { invalid: ids.projectForm })
    .grid().maxW("lg").gap("4");
}

export function NewProjectPage(props: FormProps) {
  return Layout({
    title: "New project",
    children: [H1("New project").text("2xl").font("semibold"), Div(ProjectForm(props)).mt("6")],
  });
}
