// The clean control: the arm's app rendered through every entry the seeds use. Every rung must be green.
import { A, Button, Div, Img, Layout, Li, NewProjectPage, StatusRegion, Ul, fragment, html, page, projectRoutes, project } from "./app.ts";

export default () => [
  page(projectRoutes.index, () => Layout("Projects",
    Ul(Li(A("Open").nav(projectRoutes.detail({ id: project.id })))),
    Img().setSrc("/logo.png").setAlt("Logo"),
    Button("Refresh").setType("button").fragment(projectRoutes.rows.render, projectRoutes.rows()),
  )).html,
  page(projectRoutes.new, () => NewProjectPage()).html,
  fragment(projectRoutes.status, () => StatusRegion({ id: project.id, job: "done" })).html,
  html(Div("ok").p("4").bg("surface-2").hover({ bg: "primary" })),
];
