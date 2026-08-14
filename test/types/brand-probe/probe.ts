// Deliberately-mixed probe fixture for test/brand-errors.test.ts — the
// ResolvedRoute brand contract (8.0.0). Excluded from the root tsconfig (half
// of it must NOT compile); the test runs the real checker over it and asserts
// each unsafe shape fails while every sanctioned shape stays diagnostic-free.

import { A, Div, defineRoutes, hx, assetUrl, externalUrl } from "../../../src/index.js";

const routes = defineRoutes("/tasks", {
  list: { path: "/" },
  detail: { path: "/:id", params: { id: "number" } as const },
} as const);

declare const offset: number;
declare const requestBody: { redirect: string };
declare const presignedUrl: string;

// ── Must FAIL ──────────────────────────────────────────────────────────────

// (1) concatenating a query string strips the brand — .resolve({ query }) is the only path
hx(routes.list.resolve() + "?offset=" + offset);

// (2) a raw request-body string can never become a redirect/link target
A("back").setHref(requestBody.redirect);
hx(requestBody.redirect);

// (3) a hardcoded route string into a sink
Div().setHtmx(hx("/tasks"));

// (4) a hand-written HTMX bag with a raw endpoint
Div().setHtmx({ method: "get", endpoint: "/tasks" });

// ── Must PASS (zero diagnostics) ───────────────────────────────────────────

hx(routes.list.resolve());
hx(routes.detail.resolve({ id: 1 }, { offset }));
Div().setHtmx(routes.detail({ id: 1 }));
A("all").setHref(routes.list.resolve());
A("docs").setHref("https://example.com/docs");
A("mail").setHref("mailto:hi@example.com");
A("call").setHref("tel:+38640111222");
A("top").setHref("#top");
A("icon").setHref(assetUrl("/favicon.svg"));
A("pay").setHref(externalUrl(presignedUrl));
hx(assetUrl("/legacy/ad-hoc"));
