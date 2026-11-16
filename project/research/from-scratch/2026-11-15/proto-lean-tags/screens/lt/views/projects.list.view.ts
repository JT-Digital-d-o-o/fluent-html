import { a, div, h1, input, li, p, tw, ul } from "lean-tags";
import { Layout } from "../../../support/layout.ts";
import type { Project } from "../../../support/projects.service.ts";
import { projects } from "../projects.routes.ts";
import { StatusPill, primaryButton } from "./projects.components.ts";

type ListProps = { items: Project[]; q?: string };

const Row = (item: Project) =>
  li(
    { id: `project-${item.id}` },
    a(
      tw`flex items-center justify-between gap-4 px-4 py-3 hover:bg-surface-2`,
      projects.detail({ id: item.id }),
      div(p(tw`font-medium`, item.name), p(tw`text-sm text-text-dim`, item.description)),
      StatusPill(item.status),
    ),
  );

const Empty = ({ q }: Pick<ListProps, "q">) =>
  div(
    tw`px-4 py-12 text-center`,
    p(tw`font-medium`, q ? `No projects match "${q}"` : "No projects yet"),
    p(tw`mt-1 text-sm text-text-dim`, q ? "Try a different search." : "Create your first project to get started."),
  );

export const ProjectRows = ({ items, q }: ListProps) =>
  div(
    tw`rounded-card border border-line bg-surface`,
    projects.rows().root,
    items.length ? ul(tw`divide-y divide-line`, items.map(Row)) : Empty({ q }),
  );

export const ProjectListPage = (props: ListProps) =>
  Layout(
    { title: "Projects" },
    div(
      tw`flex items-center justify-between`,
      h1(tw`text-2xl font-semibold`, "Projects"),
      a(primaryButton, projects.new(), "New project"),
    ),
    input(
      tw`mt-6 w-full rounded-control border border-line bg-surface px-3 py-2 text-sm`,
      { type: "search", value: props.q, placeholder: "Search projects", "aria-label": "Search projects" },
      projects.rows().search("q"),
    ),
    div(tw`mt-4`, ProjectRows(props)),
  );
