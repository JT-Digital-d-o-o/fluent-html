import { projects, ids } from "./projects.routes.js";
import type { Project } from "./projects.schema.js";
import { Layout } from "./layout.js";
import { StatusBadge, control, primary } from "./ui.js";

type Props = { rows: Project[]; q: string };

export function ProjectsPage({ rows, q }: Props) {
  return (
    <Layout title="Projects">
      <div class="flex items-center justify-between gap-4">
        <h1 class="text-2xl font-semibold text-text">Projects</h1>
        <a href={projects.new()} class={primary}>
          New project
        </a>
      </div>
      <input
        type="search"
        name="q"
        value={q}
        placeholder="Search projects"
        aria-label="Search projects"
        hx-get={projects.results()}
        hx-trigger="input changed delay:300ms"
        hx-sync="this:replace"
        class={["mt-6 w-full", control]}
      />
      <ProjectList rows={rows} q={q} />
    </Layout>
  );
}

export function ProjectList({ rows, q }: Props) {
  return (
    <div id={ids.projectList} class="mt-4">
      {rows.length === 0 ? (
        <p class="py-12 text-center text-text-dim">{q ? `No projects match "${q}".` : "No projects yet. Create the first one."}</p>
      ) : (
        <ul class="divide-y divide-line">
          {rows.map((p) => (
            <li id={`project-${p.id}`}>
              <a href={projects.detail({ id: p.id })} class="flex items-center justify-between gap-4 py-3 hover:bg-surface-2">
                <span>
                  <span class="block font-medium text-text">{p.name}</span>
                  <span class="block text-sm text-text-dim">{p.client}</span>
                </span>
                <StatusBadge status={p.status} />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
