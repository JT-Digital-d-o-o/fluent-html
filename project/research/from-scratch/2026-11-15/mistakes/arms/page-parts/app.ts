// Page Parts (proto-page-parts): the kit, and the prototype's own feature (screens/projects.ts) and styles as the app.
import { app, type KitRequest } from "../../../proto-page-parts/kit/index.ts";
import "../../../proto-page-parts/screens/styles.ts";
export * from "../../../proto-page-parts/kit/index.ts";
export * as feature from "../../../proto-page-parts/screens/projects.ts";
export { db } from "../../../proto-page-parts/screens/data.ts";
export { hostile, tone, count } from "../common/data.ts";

// One request to an app made of the given parts, as the kit's own tests send it.
export const serve = (parts: Record<string, unknown>, url: string, init: Partial<KitRequest> = {}) =>
  app(parts as Parameters<typeof app>[0]).handle({ method: "GET", url, ...init });
export const htmx = (target?: string) => ({ "hx-request": "true", ...(target ? { "hx-target": target } : {}) });
