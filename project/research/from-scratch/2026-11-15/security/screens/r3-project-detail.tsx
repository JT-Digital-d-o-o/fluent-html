import { fire, poll } from "sealed";
import { Layout } from "./layout";
import { ids, projects } from "./projects.routes";
import type { Job, JobStatus, Project } from "./projects.types";

type Props = { project: Project; job: Job };

const TONE = {
  queued: "bg-surface-2 text-text-dim",
  running: "bg-info/10 text-info",
  done: "bg-success/10 text-success",
  failed: "bg-danger/10 text-danger",
} satisfies Record<JobStatus, string>;

const LABEL = { queued: "Queued", running: "Importing", done: "Ready", failed: "Import failed" } satisfies Record<JobStatus, string>;

export function ProjectDetailPage({ project, job }: Props) {
  return (
    <Layout title={project.name}>
      <nav aria-label="Breadcrumb" class="text-sm text-text-dim">
        <a href={projects.list()} class="hover:underline">Projects</a> / {project.name}
      </nav>
      <header class="mt-2 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-semibold">{project.name}</h1>
          <StatusBadge projectId={project.id} job={job} />
        </div>
        <button command="show-modal" commandfor={ids.confirmDelete} class="rounded-control border border-line px-3 py-2 text-sm text-danger hover:bg-danger/10 cursor-pointer">
          Delete
        </button>
      </header>
      <dl class="mt-6 grid grid-cols-2 gap-4 text-sm">
        <dt class="text-text-dim">Client</dt>
        <dd>{project.client}</dd>
        <dt class="text-text-dim">Budget</dt>
        <dd>{project.budget} EUR</dd>
        <dt class="text-text-dim">Website</dt>
        <dd>{project.website ? <a href={project.website} rel="noopener" class="underline">{project.website}</a> : "None"}</dd>
      </dl>
      <ConfirmDelete project={project} />
    </Layout>
  );
}

export function StatusBadge({ projectId, job }: { projectId: number; job: Job }) {
  const live = job.status === "queued" || job.status === "running";
  return (
    <span
      id={ids.statusBadge}
      class={["inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", TONE[job.status]]}
      hx={live ? poll(projects.status({ id: projectId }), "2s") : undefined}
    >
      {LABEL[job.status]}
    </span>
  );
}

function ConfirmDelete({ project }: { project: Project }) {
  return (
    <dialog id={ids.confirmDelete} closedby="any" aria-labelledby={ids.confirmDeleteTitle} class="rounded-card p-6 backdrop:bg-inverse/40">
      <h2 id={ids.confirmDeleteTitle} class="text-lg font-semibold">Delete {project.name}?</h2>
      <p class="mt-2 text-sm text-text-dim">This removes the project and its entries. It cannot be undone.</p>
      <div class="mt-6 flex justify-end gap-3">
        <button command="close" commandfor={ids.confirmDelete} class="rounded-control border border-line px-3 py-2 text-sm cursor-pointer">Cancel</button>
        <button hx={fire(projects.remove({ id: project.id }))} class="rounded-control bg-danger px-3 py-2 text-sm font-medium text-on-accent cursor-pointer">
          Delete project
        </button>
      </div>
    </dialog>
  );
}
