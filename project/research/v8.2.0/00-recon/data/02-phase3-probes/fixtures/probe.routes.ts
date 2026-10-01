import { defineRoutes, defineIds } from "fluent-html";
export const probeIds = defineIds(["team-list", "invite-form"] as const);
export const teamRoutes = defineRoutes("/team", {
  index: { path: "/" },
  invite: { method: "post", path: "/invite" },
} as const);
