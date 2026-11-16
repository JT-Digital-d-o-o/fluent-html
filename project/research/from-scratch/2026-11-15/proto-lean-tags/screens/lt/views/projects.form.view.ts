import { a, button, div, h1, label, tw, type FormState } from "lean-tags";
import { Layout } from "../../../support/layout.ts";
import { projects } from "../projects.routes.ts";
import { primaryButton, quietButton } from "./projects.components.ts";

type State = FormState<typeof projects.create>;

const field = tw`grid gap-1 text-sm font-medium`;
const control = tw`rounded-control border border-line bg-surface px-3 py-2 font-normal aria-invalid:border-danger`;
const error = tw`font-normal text-danger`;

export const ProjectForm = (state: State) =>
  projects.create().form(state, tw`grid max-w-lg gap-4`, (f) => [
    label(field, "Name", f.input("name", control, { required: true, maxlength: 80 }), f.error("name", error)),
    label(field, "Description", f.textarea("description", control, { rows: 4 }), f.error("description", error)),
    label(field, "Status", f.select("status", { active: "Active", paused: "Paused" }, control), f.error("status", error)),
    div(
      tw`flex gap-3`,
      button(primaryButton, { type: "submit" }, "Create project"),
      a(quietButton, projects.list(), "Cancel"),
    ),
  ]);

export const NewProjectPage = (state: State = {}) =>
  Layout({ title: "New project" }, h1(tw`text-2xl font-semibold`, "New project"), div(tw`mt-6`, ProjectForm(state)));
