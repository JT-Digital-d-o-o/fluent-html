import { A, Button, Div, Form, H1 } from "fluent-html";
import { Layout } from "../../core/layout/layout.view.js";
import { projectRoutes, ids } from "./projects.routes.js";
import { STATUSES, type CreateProject } from "./projects.schema.js";
import { Field, control, primary, quiet } from "./ui.js";

type FormState = { values?: Partial<CreateProject>; errors?: Partial<Record<keyof CreateProject, string>> };
type Props = { state?: FormState };

export function NewProjectPage({ state }: Props) {
  return Layout({
    title: "New project",
    children: [H1("New project").text("2xl").font("semibold").text("text"), ProjectForm({ state })],
  });
}

export function ProjectForm({ state = {} }: Props) {
  const errors = state.errors ?? {};
  return Form<CreateProject>(state, (f) => [
    Field({ name: "name", label: "Name", error: errors.name, control: f.input("name", "text").toggle("required").setMaxlength(80).apply(control) }),
    Field({ name: "client", label: "Client", error: errors.client, control: f.input("client", "text").toggle("required").apply(control) }),
    Field({
      name: "status",
      label: "Status",
      error: errors.status,
      control: f.select("status", STATUSES.map((s) => ({ value: s, label: s }))).apply(control),
    }),
    Field({ name: "notes", label: "Notes", error: errors.notes, control: f.textarea("notes").setRows(4).apply(control) }),
    Div(
      A("Cancel").nav(projectRoutes.list()).apply(quiet),
      Button("Create project").setType("submit").apply(primary),
    ).flex().justify("end").gap("3"),
  ])
    .setId(ids.projectForm)
    .submit(projectRoutes.create(), { invalid: ids.projectForm })
    .mt("6")
    .flex()
    .flexCol()
    .gap("4")
    .maxW("lg");
}
