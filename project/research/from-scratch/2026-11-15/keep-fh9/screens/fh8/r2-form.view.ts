import { Button, Div, Form, H1, type ErrorBag } from "fluent-html";
import "../../proto/verbs.js";
import type { CreateProjectReq } from "../domain.js";
import { ids, projectRoutes } from "./projects.routes.js";
import { card, FieldGroup, primaryButton, quietButton } from "./ui.js";

type FormProps = { values?: Partial<CreateProjectReq>; errors?: ErrorBag<CreateProjectReq> };

export function NewProjectPage(props: FormProps = {}) {
  return Div(
    H1("New project").text("2xl").font("semibold").text("text").mb("6"),
    ProjectForm(props),
  ).maxW("lg");
}

/** The form region: also the 422 answer on its own, swapped in by `{ invalid }`. */
export function ProjectForm({ values, errors }: FormProps) {
  return Div(
    Form<CreateProjectReq>({ values, errors }, (f) => [
      FieldGroup({
        label: f.label("name", "Name"),
        control: f.input("name", "text").toggle("required"),
        error: f.error("name"),
      }),
      FieldGroup({
        label: f.label("client", "Client"),
        control: f.input("client", "text").toggle("required"),
        error: f.error("client"),
      }),
      FieldGroup({
        label: f.label("kind", "Kind"),
        control: f.select("kind", [
          { value: "site", label: "Website" },
          { value: "app", label: "Web app" },
        ]),
        error: f.error("kind"),
      }),
      Div(
        Button("Create project").setType("submit").apply(primaryButton),
        Button("Cancel").setType("button").behavior("back").cursor("pointer").apply(quietButton),
      ).flex().gap("3").mt("6"),
    ]).nav(projectRoutes.create(), { invalid: ids.projectForm }),
  ).setId(ids.projectForm).apply(card);
}
