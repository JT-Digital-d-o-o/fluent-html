import { a, button, cls, div, h1, label, type FormState } from "#bt";
import { Layout } from "../../../support/layout.ts";
import { projects } from "../projects.routes.ts";
import { primaryButton, quietButton } from "./projects.components.ts";

type State = FormState<typeof projects.create>;

const field = cls`grid gap-1 text-sm font-medium`;
const control = cls`rounded-control border border-line bg-surface px-3 py-2 font-normal aria-invalid:border-danger`;
const error = cls`font-normal text-danger`;

export const ProjectForm = (state: State) =>
  projects.create().form`grid max-w-lg gap-4`(state, (f) => [
    label`${field}`("Name", f.input`${control}`("name", { required: true, maxlength: 80 }), f.error`${error}`("name")),
    label`${field}`("Description", f.textarea`${control}`("description", { rows: 4 }), f.error`${error}`("description")),
    label`${field}`("Status", f.select`${control}`("status", { active: "Active", paused: "Paused" }), f.error`${error}`("status")),
    div`flex gap-3`(
      button`${primaryButton}`({ type: "submit" }, "Create project"),
      a`${quietButton}`(projects.list(), "Cancel"),
    ),
  ]);

export const NewProjectPage = (state: State = {}) =>
  Layout({ title: "New project" }, h1`text-2xl font-semibold`("New project"), div`mt-6`(ProjectForm(state)));
