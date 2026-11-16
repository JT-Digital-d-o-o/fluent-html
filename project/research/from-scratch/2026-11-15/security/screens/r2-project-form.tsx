import { bind, type FormState } from "sealed";
import { Layout } from "./layout";
import { ids, projects, type CreateProjectReq } from "./projects.routes";

const label = "block text-sm font-medium";
const control = "mt-1 w-full rounded-control border border-line bg-surface px-3 py-2 aria-invalid:border-danger";
const error = "mt-1 text-sm text-danger";

export function NewProjectPage(state: FormState<CreateProjectReq>) {
  return (
    <Layout title="New project">
      <h1 class="text-2xl font-semibold">New project</h1>
      <ProjectForm {...state} />
    </Layout>
  );
}

export function ProjectForm(state: FormState<CreateProjectReq>) {
  const f = bind(projects.create, state);
  return (
    <form id={ids.projectForm} action={projects.create()} novalidate class="mt-6 flex max-w-lg flex-col gap-5">
      <div>
        <label for={f.id("name")} class={label}>Name</label>
        <input {...f.input("name")} required maxlength={80} class={control} />
        {f.error("name", error)}
      </div>
      <div>
        <label for={f.id("client")} class={label}>Client</label>
        <input {...f.input("client")} required maxlength={80} class={control} />
        {f.error("client", error)}
      </div>
      <div>
        <label for={f.id("budget")} class={label}>Budget (EUR)</label>
        <input {...f.input("budget", "number")} min={0} step={100} class={control} />
        {f.error("budget", error)}
      </div>
      <div class="flex items-center gap-3">
        <button class="rounded-control bg-primary px-4 py-2 text-sm font-medium text-on-accent hover:bg-primary-700 cursor-pointer">Create project</button>
        <a href={projects.list()} class="text-sm text-text-dim hover:underline">Cancel</a>
      </div>
    </form>
  );
}
