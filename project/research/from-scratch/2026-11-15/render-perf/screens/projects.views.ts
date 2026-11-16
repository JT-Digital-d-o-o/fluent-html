import { at, html, match, tw } from "../src/hh.ts";
import { form, hx, type FieldError, type FormState, type Static } from "../src/hx.ts";
import { CreateProject, ids, projects } from "./projects.routes.ts";

export type Project = { id: number; name: string; owner: string; status: "active" | "paused" };
export type Job = { state: "queued" | "running" | "done" | "failed"; progress: number };

// R1: project list

const ProjectRow = (p: Project) => html`
  <li>
    <a href="${projects.detail({ id: p.id })}" class="flex items-center justify-between px-4 py-3 hover:bg-surface-2">
      <span class="font-medium text-ink">${p.name}</span>
      <span class="text-sm text-dim">${p.owner}</span>
    </a>
  </li>`;

export const ProjectList = (p: { projects: Project[] }) => at(ids.projectList)`
  <div class="rounded-card border border-line bg-surface">
    ${p.projects.length === 0
      ? html`<p class="p-8 text-center text-dim">No projects match your search.</p>`
      : html`<ul class="divide-y divide-line">${p.projects.map(ProjectRow)}</ul>`}
  </div>`;

export const ProjectListPage = (p: { q?: string | null; projects: Project[] }) => html`
  <section class="mx-auto flex max-w-3xl flex-col gap-4 p-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-ink">Projects</h1>
      <a href="${projects.new()}" class="rounded-control bg-primary px-4 py-2 text-on-accent hover:bg-primary-700">New project</a>
    </div>
    <input ${hx.search(projects.rows())} type="search" name="q" value="${p.q}" aria-label="Search projects"
      placeholder="Search projects" class="w-full rounded-control border border-line px-3 py-2">
    ${ProjectList(p)}
  </section>`;

// R2: create form

const label = tw`block text-sm font-medium text-ink`;
const control = tw`mt-1 w-full rounded-control border border-line px-3 py-2 aria-invalid:border-danger`;

const FieldMessage = (e: FieldError | undefined) => e && html`<p id="${e.id}" class="mt-1 text-sm text-danger">${e.message}</p>`;

export const ProjectForm = (state: FormState<Static<typeof CreateProject>>) => {
  const f = form(projects.create, state);
  return at(ids.projectForm)`
    <form action="${projects.create()}" class="flex flex-col gap-4">
      <div>
        <label ${f.label("name")} class="${label}">Name</label>
        <input ${f.field("name")} class="${control}">
        ${FieldMessage(f.error("name"))}
      </div>
      <div>
        <label ${f.label("ownerEmail")} class="${label}">Owner email</label>
        <input ${f.field("ownerEmail")} class="${control}">
        ${FieldMessage(f.error("ownerEmail"))}
      </div>
      <div>
        <label ${f.label("status")} class="${label}">Status</label>
        <select ${f.field("status")} class="${control}">${f.options("status", { active: "Active", paused: "Paused" })}</select>
        ${FieldMessage(f.error("status"))}
      </div>
      <div>
        <label ${f.label("notes")} class="${label}">Notes</label>
        <textarea ${f.field("notes")} rows="4" class="${control}">${f.value("notes")}</textarea>
        ${FieldMessage(f.error("notes"))}
      </div>
      <button type="submit" class="rounded-control bg-primary px-4 py-2 text-on-accent hover:bg-primary-700">Create project</button>
    </form>`;
};

export const NewProjectPage = () => html`
  <section class="mx-auto flex max-w-xl flex-col gap-6 p-6">
    <h1 class="text-2xl font-bold text-ink">New project</h1>
    ${ProjectForm({})}
  </section>`;

// R3: project detail

const running = (job: Job) => job.state === "queued" || job.state === "running";

export const JobStatus = (p: { projectId: number; job: Job }) => at(ids.jobStatus)`
  <span ${running(p.job) && hx.poll(projects.status({ id: p.projectId }), "2s")}
    class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${match(p.job.state, {
      queued: tw`bg-surface-2 text-dim`,
      running: tw`bg-info/10 text-info`,
      done: tw`bg-success/10 text-success`,
      failed: tw`bg-danger/10 text-danger`,
    })}">
    ${match(p.job.state, {
      queued: "Queued",
      running: () => `Running, ${p.job.progress}%`,
      done: "Finished",
      failed: "Failed",
    })}
  </span>`;

export const ProjectDetailPage = (p: { project: Project; job: Job }) => html`
  <section class="mx-auto flex max-w-3xl flex-col gap-6 p-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-ink">${p.project.name}</h1>
      <button type="button" command="show-modal" commandfor="${ids.deleteDialog}"
        class="rounded-control border border-danger px-4 py-2 text-danger hover:bg-danger/10">Delete</button>
    </div>
    <p class="text-dim">Owner: ${p.project.owner}</p>
    <p class="flex items-center gap-2 text-sm text-dim">Import job ${JobStatus({ projectId: p.project.id, job: p.job })}</p>
    <dialog id="${ids.deleteDialog}" closedby="any" aria-labelledby="delete-title" class="rounded-card p-6">
      <h2 id="delete-title" class="text-lg font-bold text-ink">Delete ${p.project.name}?</h2>
      <p class="mt-2 text-dim">This removes the project and its jobs. It cannot be undone.</p>
      <div class="mt-6 flex justify-end gap-3">
        <button type="button" command="close" commandfor="${ids.deleteDialog}" class="rounded-control px-4 py-2 text-dim hover:bg-surface-2">Cancel</button>
        <button type="button" hx-delete="${projects.remove({ id: p.project.id })}"
          class="rounded-control bg-danger px-4 py-2 text-on-accent">Delete project</button>
      </div>
    </dialog>
  </section>`;
