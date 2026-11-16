import { a, div, h1, input, li, p, ul } from "#bt";
import { Layout } from "../../../support/layout.ts";
import type { Project } from "../../../support/projects.service.ts";
import { projects } from "../projects.routes.ts";
import { StatusPill, primaryButton } from "./projects.components.ts";

type ListProps = { items: Project[]; q?: string };

const Row = (item: Project) =>
  li(
    { id: `project-${item.id}` },
    a`flex items-center justify-between gap-4 px-4 py-3 hover:bg-surface-2`(
      projects.detail({ id: item.id }),
      div(p`font-medium`(item.name), p`text-sm text-text-dim`(item.description)),
      StatusPill(item.status),
    ),
  );

const Empty = ({ q }: Pick<ListProps, "q">) =>
  div`px-4 py-12 text-center`(
    p`font-medium`(q ? `No projects match "${q}"` : "No projects yet"),
    p`mt-1 text-sm text-text-dim`(q ? "Try a different search." : "Create your first project to get started."),
  );

export const ProjectRows = ({ items, q }: ListProps) =>
  div`rounded-card border border-line bg-surface`(
    projects.rows().root,
    items.length ? ul`divide-y divide-line`(items.map(Row)) : Empty({ q }),
  );

export const ProjectListPage = (props: ListProps) =>
  Layout(
    { title: "Projects" },
    div`flex items-center justify-between`(
      h1`text-2xl font-semibold`("Projects"),
      a`${primaryButton}`(projects.new(), "New project"),
    ),
    input`mt-6 w-full rounded-control border border-line bg-surface px-3 py-2 text-sm`(
      { type: "search", value: props.q, placeholder: "Search projects", "aria-label": "Search projects" },
      projects.rows().search("q"),
    ),
    div`mt-4`(ProjectRows(props)),
  );
