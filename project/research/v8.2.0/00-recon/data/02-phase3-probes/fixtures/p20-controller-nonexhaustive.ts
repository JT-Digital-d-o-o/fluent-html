import { Div } from "fluent-html";
import { Layout } from "../../core/layout/layout.view.js";
import { requireAuth } from "../auth/shared/guards.js";
import { defineController, guarded } from "../../core/render/define-controller.js";
import { teamRoutes } from "./probe.routes.js";
export default defineController(teamRoutes, {
  index: guarded({ guards: [requireAuth] }, async (_request, reply) =>
    reply.renderPage(Layout({ title: "Team", children: Div("Team") }))),
});
