import type { FastifyPluginAsync, preHandlerHookHandler } from "fastify";
import { createTeamHandlers, type SearchRoute } from "./handlers";
import { teamStore, type TeamStore } from "./store";

export interface TeamRoutesOptions {
  /** The app's existing auth guard; applied to every route in this plugin. */
  requireAuth: preHandlerHookHandler;
  store?: TeamStore;
}

/**
 * Team page routes:
 *
 *   app.register(teamRoutes, { requireAuth });
 *
 * Deliberately not wrapped in fastify-plugin, so the auth hook and form parser stay scoped to these routes.
 */
const teamRoutes: FastifyPluginAsync<TeamRoutesOptions> = async (app, { requireAuth, store = teamStore }) => {
  app.addHook("preHandler", requireAuth);

  // htmx submits forms url-encoded; Fastify only parses JSON out of the box.
  if (!app.hasContentTypeParser("application/x-www-form-urlencoded")) {
    app.addContentTypeParser("application/x-www-form-urlencoded", { parseAs: "string" }, (_request, body, done) => {
      done(null, Object.fromEntries(new URLSearchParams(body as string)));
    });
  }

  const handlers = createTeamHandlers(store);
  app.get<SearchRoute>("/team", handlers.showTeamPage);
  app.get<SearchRoute>("/team/members", handlers.searchMembers);
  app.post("/team/members", handlers.inviteMember);
};

export default teamRoutes;
