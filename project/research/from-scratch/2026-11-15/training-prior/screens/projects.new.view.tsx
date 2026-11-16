import { form, type FormState } from "rtsx";
import { projects } from "./projects.routes.js";
import { STATUSES, type CreateProject } from "./projects.schema.js";
import { Layout } from "./layout.js";
import { Field, control, primary, quiet } from "./ui.js";

type Props = { state?: FormState<CreateProject> };

export function NewProjectPage({ state }: Props) {
  return (
    <Layout title="New project">
      <h1 class="text-2xl font-semibold text-text">New project</h1>
      <ProjectForm state={state} />
    </Layout>
  );
}

export function ProjectForm({ state }: Props) {
  const f = form(projects.create(), state);
  return (
    <form {...f.form} class="mt-6 flex max-w-lg flex-col gap-4">
      <Field f={f} name="name" label="Name">
        <input {...f.field("name")} type="text" required maxlength={80} class={control} />
      </Field>
      <Field f={f} name="client" label="Client">
        <input {...f.field("client")} type="text" required class={control} />
      </Field>
      <Field f={f} name="status" label="Status">
        <select {...f.field("status")} class={control}>
          {STATUSES.map((s) => (
            <option value={s}>{s}</option>
          ))}
        </select>
      </Field>
      <Field f={f} name="notes" label="Notes">
        <textarea {...f.field("notes")} rows={4} class={control} />
      </Field>
      <div class="flex justify-end gap-3">
        <a href={projects.list()} class={quiet}>
          Cancel
        </a>
        <button type="submit" class={primary}>
          Create project
        </button>
      </div>
    </form>
  );
}
