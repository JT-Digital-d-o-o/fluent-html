import { search } from "sealed";
import { Layout } from "./layout";
import { ids, projects } from "./projects.routes";
import type { Project } from "./projects.types";

type Props = { projects: readonly Project[]; q: string };

export function ProjectListPage({ projects: rows, q }: Props) {
  return (
    <Layout title="Projects">
      <header class="flex items-center justify-between gap-4">
        <h1 class="text-2xl font-semibold">Projects</h1>
        <a href={projects.new()} class="rounded-control bg-primary px-4 py-2 text-sm font-medium text-on-accent hover:bg-primary-700">
          New project
        </a>
      </header>
      <input
        type="search"
        name="q"
        value={q}
        placeholder="Search projects"
        aria-label="Search projects"
        class="mt-6 w-full rounded-control border border-line bg-surface px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-hidden"
        hx={search(projects.rows())}
      />
      <ProjectList projects={rows} q={q} />
    </Layout>
  );
}

export function ProjectList({ projects: rows, q }: Props) {
  return (
    <section id={ids.projectList} class="mt-4" aria-label="Projects">
      {rows.length === 0 ? (
        <EmptyState q={q} />
      ) : (
        <ul class="divide-y divide-line rounded-card border border-line bg-surface">
          {rows.map((project) => <ProjectRow project={project} />)}
        </ul>
      )}
    </section>
  );
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <li>
      <a href={projects.detail({ id: project.id })} class="flex items-center justify-between gap-4 px-4 py-3 hover:bg-surface-2">
        <span class="font-medium">{project.name}</span>
        <span class="text-sm text-text-dim">{project.client}</span>
      </a>
    </li>
  );
}

function EmptyState({ q }: { q: string }) {
  return (
    <div class="rounded-card border border-dashed border-line p-10 text-center">
      <p class="font-medium">{q ? `No projects match "${q}"` : "No projects yet"}</p>
      <p class="mt-1 text-sm text-text-dim">{q ? "Try a different search." : "Create the first one to get started."}</p>
    </div>
  );
}
