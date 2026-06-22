---
id: RFC-B-07
track: B
title: "@fluent-html/fastify — renderView/renderHx plugin, auth factory, error handlers, AuthShell view"
resolves: [F-B-051, F-B-052, F-B-053, F-B-055, F-B-121, F-B-122, F-B-133]
api_surface:
  - "fastifyFluentHtml() (Fastify plugin)"
  - "FastifyReply.renderView(...views)"
  - "FastifyReply.renderStreamView(view)"
  - "FastifyReply.renderHx(response)"
  - "createAuthPlugin<TUser>(opts)"
  - "requireUser(request)"
  - "safeReturnTo(raw)"
  - "registerErrorHandlers(server, opts)"
  - "ErrorPage(props)"
  - "AuthShell(props)"
  - "OAuthButtons(props)"
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fastify.md"]
impact: high
effort: L
depends_on: []
status: proposed
---

# RFC-B-07: `@fluent-html/fastify` — render plugin, auth factory, error handlers, auth view shell

## Problem

Every fluent-html + Fastify app re-hand-rolls the *same* integration boilerplate before it can render a single view. The copy-paste is verbatim and it is drifting:

- **`renderView` decorator** copy-pasted in 6 apps (`rideshare/src/core/server.ts:86-91`, `mngmt/src/core/server.ts:83-88`, `planet-positive-sport/src/core/server.ts:119-125`, `storysell-ai/src/core/server.ts:141-147`, `glimm/src/core/server.ts:115-120`), each with its own drifting `declare module "fastify"` block — some include `renderStreamView`, some don't (F-B-121, F-B-133).
- **`hxResponse(...).build()` 3-step** (`const { html, headers } = …; reply.headers(headers); reply.renderView(html)`) repeated 8× across 4 apps' files controllers (`rideshare/src/files/files.controller.ts:62`, `mngmt/src/files/files.controller.ts:62`, `jt-cut/src/files/files.controller.ts:103`, `storysell-ai/src/files/files.controller.ts:103`) — there is no `reply.renderHx()` (F-B-133).
- **Auth plugin** copy-pasted in 4 apps (`rideshare/src/auth/auth.plugin.ts:17`, `glimm/...:19`, `mngmt/...:17`, `storysell-ai/...:19`), `SKIP_AUTH_PREFIXES` literally identical six-string array; already diverging — rideshare gates on `user.isActive`, the others don't (F-B-051).
- **`request.user!`** non-null assertion: **261×** across 4 apps (`rideshare/src/rides/rides.controller.ts:43`, `mngmt/src/settings/settings.controller.ts:90`, …). The guideline itself endorses the unsafe pattern: `fastify.md:94` → `const user = request.user!; // safe after requireAuth` (F-B-052).
- **`requireAuth` returnTo loss:** only rideshare preserves the intended URL + ships `safeReturnTo()` open-redirect guard (`rideshare/src/auth/auth.return-to.ts:9`); glimm/mngmt/storysell redirect to a bare `/auth/login` and silently drop the deep link (`glimm/src/auth/auth.guards.ts:21`, `mngmt/...:9`, `storysell-ai/...:11`) (F-B-055).
- **`ErrorPage` + `setErrorHandler`/`setNotFoundHandler`** reimplemented in 6 apps with diverging prop signatures (`rideshare/src/shared/components/error.view.ts:6-11` threads `user`+`navCounts`; `mngmt/src/shared/components/error.view.ts:4-7` threads neither). The three-branch handler body (validation-400 / operational-4xx / 500-hide-in-prod) is structurally identical in all 6 (`rideshare/src/core/server.ts:121-157`, `mngmt/src/index.ts:8-54`, …) (F-B-122).
- **`AuthShell`/`OAuthButtons`** (centered card + "Or continue with" divider + social anchors) reimplemented in 4–5 apps, only brand colors differ; prop shape already diverges (`storysell-ai/src/auth/auth.components.ts:13` uses `{title,subtitle,content}`, `rideshare/src/auth/auth.components.ts:51` is positional) — and mngmt hardcodes the OAuth href instead of using `.resolve()` (F-B-053).

Any security fix (cookie hardening, the `// TODO: cache this lookup` comment that never propagated, stack-trace leak in the 500 branch) must today be applied to 4–6 forks. The library owns the render pipeline; it should own the wiring.

## Proposed API

New entry point **`fluent-html/fastify`** (zero runtime deps — duck-types Fastify, ships in the same package, imported only by apps that already peer-depend on Fastify; satisfies guardrail §11.1).

```ts
// fluent-html/fastify
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { View, HxResponse } from "fluent-html";

// ── 1. Render plugin (F-B-121, F-B-133) ─────────────────────────────
export interface FluentHtmlPluginOptions {
  /** also decorate reply.renderStreamView (default true) */
  stream?: boolean;
}
/** Fastify plugin: decorates reply.renderView / renderStreamView / renderHx. */
export function fastifyFluentHtml(opts?: FluentHtmlPluginOptions): FastifyPluginCallback;

declare module "fastify" {
  interface FastifyReply {
    renderView(...views: View[]): void;
    renderStreamView(view: View): void;
    /** sets HX-* headers from the builder, then renders, in one call */
    renderHx(response: HxResponse): void;
  }
}

// ── 2. Auth plugin factory (F-B-051, F-B-052, F-B-055) ──────────────
export interface AuthPluginOptions<TUser> {
  findUser(id: string): Promise<TUser | null>;
  /** the login route ref — used for returnTo redirect, never a raw string */
  loginRedirect: (returnTo?: string) => string;
  cookieSecret: string;
  cookieName?: string;            // default "__sid"
  maxAgeSeconds?: number;         // default 7*24*60*60
  skipPrefixes?: readonly string[]; // default DEFAULT_SKIP_PREFIXES
  /** reject a user post-lookup (e.g. !u.isActive) → treated as unauthenticated */
  isActive?: (user: TUser) => boolean;
}
export interface AuthPlugin<TUser> {
  plugin: FastifyPluginCallback;            // register() this
  requireAuth: FastifyPreHandler;           // preHandler guard, preserves returnTo
  requireRole: (...roles: string[]) => FastifyPreHandler;
}
export function createAuthPlugin<TUser extends { id: string }>(
  opts: AuthPluginOptions<TUser>,
): AuthPlugin<TUser>;

export const DEFAULT_SKIP_PREFIXES: readonly string[]; // the canonical six-string array

declare module "fastify" {
  interface FastifyRequest { user: unknown | null }  // app augments to AuthUser | null
  interface FastifyReply {
    signIn(user: { id: string }): void;
    signOut(): void;
  }
}

/** Narrowing accessor — throws typed 401 if null. Replaces `request.user!`. */
export function requireUser<TUser>(request: FastifyRequest): TUser;

/** Open-redirect guard: same-origin absolute path only, else null. */
export function safeReturnTo(raw: unknown): string | null;

// ── 3. Error handlers + ErrorPage (F-B-122) ─────────────────────────
export interface ErrorPageProps {
  status: number;
  message: string;
  /** wrap the error body in app chrome (auth nav, layout); identity by default */
  shell?: (children: View) => View;
}
export function ErrorPage(props: ErrorPageProps): View;

export interface ErrorHandlerOptions {
  shell?: (children: View) => View;
  hideDetailsInProd?: boolean;  // default true
}
/** Installs the three-branch setErrorHandler + setNotFoundHandler. */
export function registerErrorHandlers(server: FastifyInstance, opts?: ErrorHandlerOptions): void;

// ── 4. Auth view shell (F-B-053) ────────────────────────────────────
export interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: View;
}
export function AuthShell(props: AuthShellProps): View;

export interface OAuthProvider {
  label: string;
  /** external IdP redirect → a string (use route.resolve(), never setHtmx) */
  href: string;
  icon?: View;
}
export interface OAuthButtonsProps {
  providers: readonly OAuthProvider[];
  dividerText?: string; // default "Or continue with"
}
export function OAuthButtons(props: OAuthButtonsProps): View;
```

## Worked examples (before → after)

### A. Server bootstrap (F-B-121 / F-B-133)

```ts
// before — rideshare/src/core/server.ts:86-91 + the declare-module block, copied into 6 apps
declare module "fastify" {
  interface FastifyReply { renderView(...views: View[]): void }
}
server.decorateReply("renderView", function (this: FastifyReply, ...views: View[]) {
  this.type("text/html").send(render(...views));
});
```
```ts
// after — one register, augmentation comes from the import
import { fastifyFluentHtml } from "fluent-html/fastify";
server.register(fastifyFluentHtml());
```

### B. HTMX header response (F-B-133)

```ts
// before — rideshare/src/files/files.controller.ts:62 (×8 across 4 apps)
const { html, headers } = hxResponse(Empty())
  .trigger("showToast", { message: "File uploaded successfully" })
  .build();
reply.headers(headers);
return reply.renderView(html);
```
```ts
// after
return reply.renderHx(
  hxResponse(Empty()).trigger("showToast", { message: "File uploaded successfully" }),
);
```

### C. Auth plugin + guard + returnTo (F-B-051 / F-B-055)

```ts
// before — rideshare/src/auth/auth.plugin.ts:17 (~80 LOC) + auth.guards.ts:8 + auth.return-to.ts:9,
// copy-pasted into glimm/mngmt/storysell, where requireAuth drops returnTo (glimm/auth.guards.ts:21)
const authPlugin = fp(async (fastify) => {
  fastify.register(cookie, { secret: requireEnv("COOKIE_SECRET") });
  fastify.decorateRequest("user", null);
  fastify.decorateReply("signIn", function (u) { this.setCookie("userId", u.id, {/*…*/}); });
  fastify.decorateReply("signOut", function () { this.clearCookie("userId", { path: "/" }); });
  const SKIP_AUTH_PREFIXES = ["/public/","/css/","/js/","/health","/metrics","/favicon.ico"];
  fastify.addHook("preHandler", async (request, reply) => { /* unsign → findUser → gate */ });
}, { name: "auth" });
```
```ts
// after — authRoutes.login is a defineRoutes ref; returnTo + safeReturnTo are built in
import { createAuthPlugin } from "fluent-html/fastify";
import { authRoutes } from "../auth/auth.routes";

export const auth = createAuthPlugin<AuthUser>({
  findUser: (id) => prisma.user.findUnique({ where: { id } }),
  loginRedirect: (returnTo) => authRoutes.login.resolve({ returnTo }),
  cookieSecret: requireEnv("COOKIE_SECRET"),
  isActive: (u) => u.isActive,
});
server.register(auth.plugin);
// guarded route — auth.requireAuth preserves request.url as a safe returnTo automatically
const getDashboard = handle(server, dashboardRoutes.index,
  { preHandler: [auth.requireAuth] }, handler);
```

### D. Typed user accessor (F-B-052)

```ts
// before — rideshare/src/settings/settings.controller.ts:68 (×261 across 4 apps)
const user = request.user!;
```
```ts
// after — no escape hatch; throws typed 401 if the guard was forgotten
import { requireUser } from "fluent-html/fastify";
const user = requireUser<AuthUser>(request);
```

### E. Error handlers (F-B-122)

```ts
// before — rideshare/src/core/server.ts:121-157 + setNotFoundHandler + error.view.ts:6-11, ×6 apps
server.setErrorHandler((error, request, reply) => {
  const statusCode = error.statusCode ?? 500;
  if (error.validation) return reply.status(400).renderView(ErrorPage({ status: 400, message: error.message, user, navCounts }));
  if (statusCode < 500) return reply.status(statusCode).renderView(ErrorPage({ status: statusCode, message: error.message, user, navCounts }));
  const message = process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message;
  return reply.status(500).renderView(ErrorPage({ status: 500, message, user, navCounts }));
});
```
```ts
// after — chrome injected once via shell; three-branch logic + 404 owned by the library
import { registerErrorHandlers } from "fluent-html/fastify";
registerErrorHandlers(server, { shell: (body) => Layout({ user: undefined }, body) });
```

### F. Auth view shell (F-B-053)

```ts
// before — storysell-ai/src/auth/auth.components.ts:13 (AuthCard/OAuthDivider/SocialButtons), ×4 apps
export function AuthCard({ title, subtitle, content }: AuthCardProps) {
  return Div(Div(H1(title)…, P(subtitle)…), content).addClass("glass-card")…;
}
```
```ts
// after
import { AuthShell, OAuthButtons } from "fluent-html/fastify";
AuthShell({ title: "Sign in", subtitle: "Welcome back", children:
  Div(LoginForm(), OAuthButtons({ providers: [
    { label: "Google", href: oauthRoutes.authorize.resolve({ provider: "google" }) },
  ]})),
})
```

## Type-safety story

- **`createAuthPlugin<TUser extends { id: string }>`** — `const` generic threads the app's user type through `findUser`, `isActive`, and `requireUser<TUser>`, so `user.id` / `user.role` are typed without `as`.
- **`requireUser<TUser>(request): TUser`** — return type is the **non-nullable** user; replaces the `request.user!` escape hatch (§11.4). Misuse (forgotten guard) becomes a typed 401 at runtime instead of a silent `undefined.id` throw, and the call site reads as a guarantee rather than an assertion.
- **`loginRedirect: (returnTo?: string) => string`** — forces the redirect through a `defineRoutes` `.resolve()` ref (§11.6 single-sourcing); a raw `"/auth/login"` string is still possible but the signature nudges to the route ref, and `safeReturnTo` validates the value (open-redirect = `null`).
- **`OAuthProvider.href: string`** (not a route option) — encodes that OAuth targets are *external* IdP redirects, so apps use `setHref`-style strings, never `setHtmx` (§11.6). Literal-union `dividerText` default avoids magic strings.
- **`ErrorPageProps.shell?: (children: View) => View`** — discriminates "needs auth chrome" from "doesn't" via presence of the callback, replacing the per-app `user?`/`navCounts?` prop-bag divergence with one composable slot.
- Module augmentation for `renderView`/`renderHx`/`signIn`/`signOut` ships **once** from the entry point (import-side-effect), killing the drift between apps' hand-written `declare module` blocks.

## Migration & compatibility

**Additive.** New `fluent-html/fastify` entry point; nothing in the core package changes, no existing symbol is touched. Apps adopt incrementally:

1. `server.register(fastifyFluentHtml())` → delete the local `renderView` decorator + `declare module` block.
2. Replace `hxResponse(...).build()` 3-step with `reply.renderHx(...)`.
3. Replace local `auth.plugin.ts` with `createAuthPlugin(...)`; delete `auth.return-to.ts` (now built in).
4. Codemod-able mechanically: `request.user!` → `requireUser<AuthUser>(request)` (regex `request\.user!` with an import insert). `safeReturnTo`/`consumeReturnTo` forks deleted.

No `breaking-changes.md` entry required (additive). The only behavioral change for adopters is the **fix**: glimm/mngmt/storysell gain returnTo preservation they were silently missing (F-B-055) — desirable, not breaking.

`reply.renderHx` consumes an `HxResponse` directly; the existing `hxResponse(...).build()` API stays exported and unchanged for callers who want the raw `{ html, headers }`.

## Guidelines impact

Resolves an under-taught surface: `fastify.md:62` documents `renderView` as if built-in but never shows the wiring (F-B-121), and `fastify.md:94` actively teaches the unsafe `request.user!` (F-B-052). Both are corrected below.

### Index — `web-development/CLAUDE.md`

Replace the `**Auth via preHandler:**` block in the `## Fastify` section (lines ~288-296) and insert the plugin rule after the `handle` block.

```md
**`fluent-html/fastify` plugin** — register once, never hand-roll `decorateReply("renderView")`:
```typescript
import { fastifyFluentHtml } from "fluent-html/fastify";
server.register(fastifyFluentHtml());   // ✓ renderView + renderStreamView + renderHx
// server.decorateReply("renderView", …) // ✗ copy-paste boilerplate
```

**`reply.renderHx()`** — for HTMX header responses; never the `.build()` 3-step:
```typescript
reply.renderHx(hxResponse(Empty()).trigger("showToast", { message: "Saved" }));  // ✓
const { html, headers } = hxResponse(...).build(); reply.headers(headers); …      // ✗
```

**`createAuthPlugin` + `requireUser`** — never fork `auth.plugin.ts`, never `request.user!`:
```typescript
import { createAuthPlugin, requireUser } from "fluent-html/fastify";
const auth = createAuthPlugin<AuthUser>({
  findUser: (id) => prisma.user.findUnique({ where: { id } }),
  loginRedirect: (returnTo) => authRoutes.login.resolve({ returnTo }), // returnTo preserved + open-redirect-safe
  cookieSecret: requireEnv("COOKIE_SECRET"),
});
server.register(auth.plugin);

const user = requireUser<AuthUser>(request);  // ✓ typed, throws 401 if guard forgotten
const user = request.user!;                   // ✗ silent runtime throw
```

**`registerErrorHandlers`** — never re-write the three-branch handler:
```typescript
import { registerErrorHandlers } from "fluent-html/fastify";
registerErrorHandlers(server, { shell: (body) => Layout({ user }, body) }); // ✓ 4xx/500/404 + prod-hide
```

**`AuthShell` / `OAuthButtons`** — never reimplement the auth card scaffold:
```typescript
AuthShell({ title: "Sign in", children:
  Div(LoginForm(), OAuthButtons({ providers: [
    { label: "Google", href: oauthRoutes.authorize.resolve({ provider: "google" }) }, // external href, not setHtmx
  ]})),
})
```
```

### Topic ref — `web-development/fastify.md`

Add a `## fluent-html Fastify integration` section before `## Auth Guards`, and **replace** the unsafe `fastify.md:94` line.

Replace in `## Auth Guards`:
```md
    const user = request.user!; // safe after requireAuth
```
with:
```md
    const user = requireUser<AuthUser>(request); // typed, throws 401 if guard missing — never request.user!
```

Insert new section:
```md
## fluent-html Fastify integration

Register the plugin instead of hand-rolling `decorateReply` (it ships the `declare module` augmentation too):

```typescript
import { fastifyFluentHtml } from "fluent-html/fastify";
server.register(fastifyFluentHtml());
// reply.renderView(...views) | reply.renderStreamView(view) | reply.renderHx(hxResponse(...))
```

HTMX header responses — one call, no `.build()` triad:
```typescript
return reply.renderHx(
  hxResponse(Empty()).trigger("showToast", { message: "Uploaded" }),
);
```

Auth: one factory, typed user, returnTo + open-redirect guard built in:
```typescript
import { createAuthPlugin, requireUser } from "fluent-html/fastify";
const auth = createAuthPlugin<AuthUser>({
  findUser: (id) => prisma.user.findUnique({ where: { id } }),
  loginRedirect: (returnTo) => authRoutes.login.resolve({ returnTo }),
  cookieSecret: requireEnv("COOKIE_SECRET"),
  isActive: (u) => u.isActive,        // optional: gate inactive users
});
server.register(auth.plugin);

const getDashboard = handle(server, dashboardRoutes.index,
  { preHandler: [auth.requireAuth] },          // preserves request.url for post-login redirect
  async (request, reply) => {
    const user = requireUser<AuthUser>(request); // ✓ not request.user!
  });
```

Error + 404 handlers — one line installs validation-400 / operational-4xx / 500-hide-in-prod / 404:
```typescript
import { registerErrorHandlers } from "fluent-html/fastify";
registerErrorHandlers(server, { shell: (body) => Layout({ user }, body) });
```

Auth views — shared scaffold, brand via tokens, OAuth href via `.resolve()` (external redirect → string, never `setHtmx`):
```typescript
AuthShell({ title: "Sign in", subtitle: "Welcome back", children:
  Div(LoginForm(), OAuthButtons({ providers: [
    { label: "Google", href: oauthRoutes.authorize.resolve({ provider: "google" }) },
  ]})),
})
```
```

## Guardrail check

- **§11.1 zero-deps:** PASS — `fluent-html/fastify` is a separate entry point in the same package; imports only `fluent-html` + duck-typed Fastify types (Fastify is the app's peer dep, not added to the lib's `dependencies`).
- **§11.2 ssr-only / sync hot path:** PASS — render path unchanged; `findUser` is the app's existing async DB call inside a `preHandler`, not in the synchronous render. `renderStreamView` reuses existing `renderToStream`.
- **§11.3 escape-by-default:** PASS — `ErrorPage`/`AuthShell`/`OAuthButtons` emit via the standard escaping `render`; error `message` is text content, never `Raw`. `OAuthProvider.icon` is a caller-supplied `View` (their responsibility, same as today).
- **§11.4 type-safety:** PASS — const generic `TUser`, `requireUser<TUser>` non-null return replaces 261 `!`, literal-defaulted `dividerText`, `shell` callback over optional prop-bag.
- **§11.5 backward-compat:** PASS — additive entry point; `hxResponse().build()` retained; no `breaking-changes.md` entry. Codemod for `request.user!` noted.
- **§11.6 consistency:** PASS — `loginRedirect`/OAuth `href` use `.resolve()` route refs; OAuth uses string `href` (external) per the idiom; `handle` + `preHandler` unchanged; no inline JS introduced.
- **§11.7 class-string contract:** N/A — emits no new Tailwind classes (reuses existing fluent methods); nothing for extractor/eslint to mirror.
- **§11.8 guideline-sync:** PASS — `## Guidelines impact` patches `CLAUDE.md` (index) + `fastify.md` (topic ref) and covers every `api_surface` symbol; also corrects the two mis-teaching lines (`fastify.md:62` wiring gap, `fastify.md:94` `request.user!`). `guideline_updates` frontmatter set accordingly.

## Alternatives considered

- **Separate `fluent-html-fastify` npm package** (monorepo). Rejected as default: a sub-path entry point keeps versioning lockstep with the render API and avoids a second publish, while still honoring zero-deps. Can be promoted to a package later if Fastify-version skew demands it (open question).
- **`AuthenticatedRequest` typed-request wrapper** threaded through `handle()` generics (F-B-052 option 2) so `request.user` is non-null without any call. Stronger (zero runtime), but requires invasive `handle()` generic changes and a `requireAuth`-declares-narrowing contract that's hard to express soundly in TS today. `requireUser()` ships the 90% win additively now; the wrapper is a follow-up RFC.
- **Bundle auth views into Track-A component RFCs** (AuthShell alongside Card/Badge). Kept here because AuthShell/OAuthButtons are tightly coupled to the auth-plugin migration story (the OAuth `href` → `.resolve()` fix in F-B-053 only lands if both move together).

## Open questions

- Entry point name: `fluent-html/fastify` vs a standalone `@fluent-html/fastify` package — decision affects whether Fastify peer-dep range is policed by the lib.
- `createAuthPlugin` currently assumes signed-cookie sessions (the universal app pattern). Do we need a pluggable session strategy (JWT, server-side store) in v6, or is cookie-only acceptable for the first cut?
- Should `requireUser` throw a Fastify `httpErrors`-style 401 (requires `@fastify/sensible`) or a plain `Error` with `statusCode = 401` that the bundled `registerErrorHandlers` already renders? Leaning plain Error to preserve zero-deps.
