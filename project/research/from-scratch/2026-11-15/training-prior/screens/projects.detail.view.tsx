import { match } from "rtsx";
import { projects, ids } from "./projects.routes.js";
import type { Job, Project } from "./projects.schema.js";
import { Layout } from "./layout.js";
import { StatusBadge, danger, quiet } from "./ui.js";

export function ProjectDetailPage({ project, job }: { project: Project; job: Job }) {
  return (
    <Layout title={project.name}>
      <nav aria-label="Breadcrumb" class="text-sm text-text-dim">
        <a href={projects.list()} class="hover:underline">
          Projects
        </a>
        {" / "}
        {project.name}
      </nav>
      <div class="mt-4 flex items-center justify-between gap-4">
        <h1 class="text-2xl font-semibold text-text">{project.name}</h1>
        <StatusBadge status={project.status} />
      </div>
      <p class="mt-1 text-text-dim">{project.client}</p>
      <p class="mt-6 flex items-center gap-3 text-sm text-text">
        Export
        <JobStatus projectId={project.id} job={job} />
      </p>
      <button command="show-modal" commandfor={ids.deleteDialog} class="mt-8 rounded-control border border-danger px-4 py-2 text-danger hover:bg-danger/10">
        Delete project
      </button>
      <dialog id={ids.deleteDialog} closedby="any" aria-labelledby={ids.deleteTitle} class="rounded-card bg-surface p-6 shadow-lg backdrop:bg-black/40">
        <h2 id={ids.deleteTitle} class="text-lg font-semibold text-text">
          Delete {project.name}?
        </h2>
        <p class="mt-2 text-text-dim">This removes the project and its exports. It cannot be undone.</p>
        <div class="mt-6 flex justify-end gap-3">
          <button command="close" commandfor={ids.deleteDialog} class={quiet}>
            Cancel
          </button>
          <button hx-delete={projects.remove({ id: project.id })} class={danger}>
            Delete
          </button>
        </div>
      </dialog>
    </Layout>
  );
}

const tone: Record<Job["state"], string> = {
  queued: "bg-surface-2 text-text-dim",
  running: "bg-primary/10 text-primary",
  done: "bg-success/10 text-success",
  failed: "bg-danger/10 text-danger",
};

export function JobStatus({ projectId, job }: { projectId: number; job: Job }) {
  const running = job.state === "queued" || job.state === "running";
  return (
    <span id={ids.jobStatus} hx-get={running && projects.status({ id: projectId })} class={["rounded-full px-3 py-1 text-sm font-medium", tone[job.state]]}>
      {match(job, "state", {
        queued: () => "Queued",
        running: (j) => `Running, ${j.percent}%`,
        done: (j) => <time datetime={j.finishedAt}>Done</time>,
        failed: (j) => `Failed: ${j.reason}`,
      })}
    </span>
  );
}
