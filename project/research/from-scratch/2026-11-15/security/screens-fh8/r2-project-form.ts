import { A, Button, Div, Form, H1, Label, type FormState } from "fluent-html";
import type { Styler } from "@tpl/shared/stylers.js";
import { Layout } from "./layout.js";
import { ids, projectRoutes } from "./projects.routes.js";
import type { CreateProjectReq } from "./projects.schema.js";

export type ProjectFormState = FormState<CreateProjectReq>;

const label: Styler = (t) => t.block().text("sm").font("medium");
const control: Styler = (t) =>
  t.mt("1").w("full").rounded("control").border().border("line").bg("surface").px("3").py("2")
    .variant("aria-[invalid=true]", { border: "danger" });
const error: Styler = (t) => t.mt("1").text("sm").text("danger");

export function NewProjectPage(state: ProjectFormState = {}) {
  return Layout({
    title: "New project",
    children: [H1("New project").text("2xl").font("semibold"), ProjectForm(state)],
  });
}

export function ProjectForm(state: ProjectFormState = {}) {
  return Form<CreateProjectReq>(state, (f) => [
    Div(
      Label("Name").setFor("name").apply(label),
      f.input("name", "text").setId("name").toggle("required").setMaxlength(80).apply(control),
      Div(f.error("name")).apply(error),
    ),
    Div(
      Label("Client").setFor("client").apply(label),
      f.input("client", "text").setId("client").toggle("required").setMaxlength(80).apply(control),
      Div(f.error("client")).apply(error),
    ),
    Div(
      Label("Budget (EUR)").setFor("budget").apply(label),
      f.input("budget", "number").setId("budget").setMin(0).setStep(100).apply(control),
      Div(f.error("budget")).apply(error),
    ),
    Div(
      Button("Create project")
        .setType("submit")
        .rounded("control").bg("primary").px("4").py("2").text("sm").font("medium").text("on-accent").cursor("pointer")
        .hover({ bg: "primary-700" }),
      A("Cancel").nav(projectRoutes.list()).text("sm").text("text-dim").hover({ underline: true }),
    ).flex().items("center").gap("3"),
  ])
    .setId(ids.projectForm)
    .nav(projectRoutes.create(), { invalid: ids.projectForm })
    .toggle("novalidate")
    .mt("6").flex().flex("col").maxW("lg").gap("5");
}
