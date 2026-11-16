import { a, ariaInvalid, button, cls, div, h1, label, type FormState } from "#st";
import { Layout } from "../../support/layout.ts";
import { projects } from "../projects.routes.ts";
import { primaryButton, quietButton } from "./projects.components.ts";

type State = FormState<typeof projects.create>;

const field = cls("grid gap-1 text-sm font-medium");
const control = cls("rounded-control border border-line bg-surface px-3 py-2 font-normal", ariaInvalid("border-danger"));
const error = cls("font-normal text-danger");

export const ProjectForm = (state: State) =>
  projects.create().form(state, cls("grid max-w-lg gap-4"), (f) => [
    label(field, "Name", f.input("name", control, { required: true, maxlength: 80 }), f.error("name", error)),
    label(field, "Description", f.textarea("description", control, { rows: 4 }), f.error("description", error)),
    label(field, "Status", f.select("status", { active: "Active", paused: "Paused" }, control), f.error("status", error)),
    div(
      cls("flex gap-3"),
      button(primaryButton, { type: "submit" }, "Create project"),
      a(quietButton, projects.list(), "Cancel"),
    ),
  ]);

export const NewProjectPage = (state: State = {}) =>
  Layout({ title: "New project" }, h1(cls("text-2xl font-semibold"), "New project"), div(cls("mt-6"), ProjectForm(state)));
