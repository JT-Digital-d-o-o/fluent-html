import { Div, H1, P, A, Label, Button, Form, type FormState } from "fluent-html";
import { Layout } from "../../../core/layout/layout.view.js";
import { inputStyle, labelStyle, hintStyle, errorStyle, fieldStyle, primaryButton } from "../../../shared/ui/form.js";
import { projectRoutes, projectIds } from "../projects.routes.js";
import type { CreateProjectReq } from "../projects.schema.js";

type FormProps = FormState<CreateProjectReq>;

/** The create form: also the 422 answer on its own, swapped in by `{ invalid }`. */
export function ProjectForm(state: FormProps = {}) {
  return Form<CreateProjectReq>(state, (f) => [
    Div(
      Label("Name").setFor("name").apply(labelStyle),
      f.input("name", "text").setId("name").setPlaceholder("Apollo").setMaxlength(80).toggle("required").apply(inputStyle),
      f.error("name").apply(errorStyle),
    ).apply(fieldStyle),
    Div(
      Label("Description").setFor("description").apply(labelStyle),
      f.textarea("description").setId("description").setRows(4).setMaxlength(500).apply(inputStyle),
      P("Optional, up to 500 characters.").apply(hintStyle),
      f.error("description").apply(errorStyle),
    ).apply(fieldStyle),
    Div(
      Label("Status").setFor("status").apply(labelStyle),
      f.select("status", [
        { value: "draft", label: "Draft" },
        { value: "active", label: "Active" },
      ]).setId("status").toggle("required").apply(inputStyle),
      f.error("status").apply(errorStyle),
    ).apply(fieldStyle),
    Div(
      Button("Create project").setType("submit").apply(primaryButton),
      A("Cancel").nav(projectRoutes.list()).text("sm").text("text-dim").hover({ text: "text" }),
    ).flex().items("center").gap("3"),
  ])
    .submit(projectRoutes.create(), { invalid: projectIds.projectForm })
    .setId(projectIds.projectForm)
    .flex().flexCol().gap("4").maxW("lg");
}

export function ProjectNewPage(state: FormProps = {}) {
  return Layout({
    title: "New project",
    children: Div(
      H1("New project").mb("6").text("2xl").font("semibold").text("text"),
      ProjectForm(state),
    ).mx("auto").maxW("3xl").p("6"),
  });
}
