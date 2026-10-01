import type { FastifyPluginAsync, preHandlerHookHandler } from "fastify";
import { createInvite, filterMembers, showTeam, type SearchQuerystring } from "./handlers";

export interface TeamRoutesOptions {
  requireAuth: preHandlerHookHandler;
}

/** Register with `app.register(teamRoutes, { requireAuth })`. */
export const teamRoutes: FastifyPluginAsync<TeamRoutesOptions> = async (app, { requireAuth }) => {
  // Applies to every route in this plugin: the page, the search fragment and the invite post.
  app.addHook("preHandler", requireAuth);

  // Forms post as application/x-www-form-urlencoded, which Fastify doesn't parse out of the box.
  if (!app.hasContentTypeParser("application/x-www-form-urlencoded")) {
    app.addContentTypeParser(
      "application/x-www-form-urlencoded",
      { parseAs: "string" },
      (_request, body, done) => {
        done(null, Object.fromEntries(new URLSearchParams(body)));
      },
    );
  }

  app.get<{ Querystring: SearchQuerystring }>("/team", showTeam);
  app.get<{ Querystring: SearchQuerystring }>("/team/members", filterMembers);
  app.post("/team/members", createInvite);
};
