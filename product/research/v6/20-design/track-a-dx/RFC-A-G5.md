---
id: RFC-A-G5
track: A
title: "Adoption: context-in-Fastify (scope-in-renderView) + auth context + formFor<T> schema binding"
resolves: [F-A-024, F-A-033, F-A-034, F-A-035, F-A-083, F-A-093]
api_surface: ["scopeReply(reply, ...providers)", "Context<T>.provide(value)", "ContextProvider"]
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md", "web-development/fastify.md"]
impact: high
effort: S
depends_on: []
status: proposed
---

# RFC-A-G5: Context-in-Fastify + auth context + formFor<T> schema binding

## Problem

This cluster is the canonical **adoption-gap** cluster: three correct, shipped APIs (`createContext`, `createRequiredContext`, `formFor<T>()`) that apps reinvent or bypass because the guidelines never wire them into a real Fastify request lifecycle. Two independent failure modes, both traced to file:line:

**1. Context is never scoped per-request → prop-drilling or hand-rolled reimplementation.**
- `rideshare/src/shared/components/layout.view.ts:65,313,374,399,435` threads `user: AuthUser` through `Layout → Sidebar → SidebarNavSections → SidebarFooter` (4 levels). `ttl` and `mngmt` do the same. Measured: **102 `user: request.user` prop-drill sites** across rideshare (59), mngmt (27), ttl (16) (F-A-035).
- `renderbox/src/app/landing/views/landing.components.ts:27-34` **reimplements `createContext` verbatim** (its own `accentStack` + `scope()`/`current`), used in 16 view files, because the typed-literal-union case isn't shown in the guideline (F-A-033).
- 6 apps invented **two incompatible** Fastify-integration patterns (F-A-034): the **unsafe** `onRequest`/`onResponse` hook-lifecycle pattern (`glimm/src/core/i18n/i18n.plugin.ts:34-70`, `planet-positive-sport/src/auth/auth.plugin.ts:83-88`) — which violates LIFO disposal under concurrency — and the **safe** scope-inside-`renderView` pattern (`jt-vault-cloud/src/core/server.ts:101-108`). `fastify.md` mentions context **zero times**, so apps chose at random and the project template inherited the unsafe one.

**2. `formFor<T>()` is bypassed even when the schema type already exists.**
- `ttl/src/auth/auth.view.ts:58,68,146` uses bare `.setName("email")` / `.setName("password")` while `ttl/src/core/types.ts:5` already defines `SignInReq = { email; password }` — a perfect `formFor<SignInReq>()` match that's missed. **41 `.setName()` calls, 0 `formFor`** in ttl; `rideshare` has 28 `formFor` usages, proving the API works once adopted (F-A-083, F-A-093).
- Root cause is a guideline bug: `fluent-html.md:22-26` shows `.setName()` first, prominently, with no `// ✗`/`prefer formFor` signal; the `formFor` section (line 63) says "`.setName()` still works for one-off elements" (line 87), which reads as "equally valid."

The library code is **correct**. The fix is 90% guideline (guardrail §11.8) plus one tiny additive ergonomic helper that makes the *safe* per-request scoping pattern the path of least resistance, so apps stop hand-rolling `decorateReply` glue and stop reaching for the unsafe hook pattern.

## Proposed API

Additive. No existing signature changes. One free function + one method on the existing `Context<T>` type.

```ts
// control/context.ts — ADD to the existing Context<T> type
export type Context<T> = {
  readonly current: T;
  scope(value: T): Disposable;
  /**
   * Bind a value to *this* context for use with `scopeReply`.
   * Returns an opaque provider; does not push onto the stack until applied.
   */
  provide(value: T): ContextProvider;   // NEW
};

/** Opaque (provider, value) pair produced by `Context<T>.provide`. */
export type ContextProvider = {
  readonly __ctxProvider: unique symbol;   // brand — not constructible by callers
  scope(): Disposable;                      // internal: pushes the bound value
};

// control/context.ts — NEW free function
/**
 * Scope one or more contexts for the lifetime of a single SSR render and
 * dispose them synchronously, in correct LIFO order, even if `render` throws.
 *
 * Designed to be called inside the `reply.renderView` decorator so every
 * per-request context is active for exactly that render and torn down before
 * the next request — concurrency-safe by construction (no cross-`await` stack).
 *
 * @returns the rendered HTML string (callers send it; the helper owns disposal)
 */
export function scopeReply(
  render: () => string,
  ...providers: ContextProvider[]
): string;
```

Usage shape (the whole point — one call, no manual `using` bookkeeping, no hook lifecycle):

```ts
// src/core/server.ts
server.decorateReply("renderView", function (this: FastifyReply, ...views: View[]) {
  const html = scopeReply(
    () => render(...views),
    AuthCtx.provide(this.request.user!),
    LocaleCtx.provide(this.request.locale),
    NonceCtx.provide(this.request.nonce),
  );
  this.type("text/html").send(html);
});
```

Reference implementation (zero-dep, ~12 lines):

```ts
const CTX_BRAND: unique symbol = Symbol("fluent-ctx-provider");

// inside createContext / createRequiredContext, alongside current + scope:
provide(value: T): ContextProvider {
  return { __ctxProvider: CTX_BRAND, scope: () => this.scope(value) } as ContextProvider;
}

export function scopeReply(render: () => string, ...providers: ContextProvider[]): string {
  const disposers: Disposable[] = [];
  try {
    for (const p of providers) disposers.push(p.scope());   // push in order
    return render();
  } finally {
    for (let i = disposers.length - 1; i >= 0; i--)          // dispose LIFO
      disposers[i]![Symbol.dispose]();
  }
}
```

## Worked examples (before → after)

### A. Auth context — kill the 102 prop-drill sites (F-A-024, F-A-035)

```ts
// before (today) — rideshare/src/shared/components/layout.view.ts:65,399,374,313
type LayoutProps   = { user?: AuthUser | null; /* … */ };
type SidebarProps  = { user: AuthUser; /* … */ };
function Layout({ user, children, … }: LayoutProps) {
  return Sidebar({ user: user!, navCounts, activePage });          // thread
}
function Sidebar({ user, … }: SidebarProps) {
  return Div(SidebarNavSections({ user, … }), SidebarFooter({ user }));  // thread
}
function SidebarNavSections({ user, … }: { user: AuthUser; … }) {
  const isAdmin = user.role === "ADMIN";                            // consumer
}
function SidebarFooter({ user }: { user: AuthUser }) {              // leaf
  return Div(user.name ?? "User");
}
```
```ts
// after (this RFC) — define once, scope once, read anywhere
// auth/auth.context.ts
export const AuthCtx = createRequiredContext<AuthUser>("AuthCtx");

// src/core/server.ts — the ONE wiring point
server.decorateReply("renderView", function (this: FastifyReply, ...views: View[]) {
  this.type("text/html").send(
    scopeReply(() => render(...views), AuthCtx.provide(this.request.user!)),
  );
});

// layout.view.ts — NO `user` prop anywhere
function Layout({ children, … }) { return Sidebar(); }
function Sidebar()               { return Div(SidebarNavSections(), SidebarFooter()); }
function SidebarNavSections()    { const isAdmin = AuthCtx.current.role === "ADMIN"; /*…*/ }
function SidebarFooter()         { return Div(AuthCtx.current.name ?? "User"); }
```

### B. Typed-literal context — stop reimplementing `createContext` (F-A-033)

```ts
// before — renderbox/src/app/landing/views/landing.components.ts:27-34
export type PageAccent = "indigo" | "amber" | "emerald" | "slate" | "violet";
const accentStack: PageAccent[] = ["indigo"];
export const pageAccentCtx = {
  get current(): PageAccent { return accentStack[accentStack.length - 1]!; },
  scope(value: PageAccent): Disposable {
    accentStack.push(value);
    return { [Symbol.dispose]() { accentStack.pop(); } };
  },
};
```
```ts
// after — one line; same API, library-managed stack + dispose polyfill
export type PageAccent = "indigo" | "amber" | "emerald" | "slate" | "violet";
export const pageAccentCtx = createContext<PageAccent>("indigo");
// renderbox/src/app/landing/home/home.view.ts:700 is unchanged:
//   using _ = pageAccentCtx.scope("indigo");
```

### C. Replace the unsafe hook-lifecycle pattern (F-A-034)

```ts
// before (UNSAFE) — glimm/src/core/i18n/i18n.plugin.ts:42-49
fastify.addHook("onRequest", (request, _reply, done) => {
  request._i18nDispose = [i18nTranslation.scope(tFn), i18nLocale.scope(locale)];
  done();
});
fastify.addHook("onResponse", (request, _reply, done) => {
  for (const d of request._i18nDispose) d[Symbol.dispose]();   // LIFO violated across concurrent reqs
  done();
});
```
```ts
// after (SAFE) — scope lives only for the synchronous render
server.decorateReply("renderView", function (this: FastifyReply, ...views: View[]) {
  this.type("text/html").send(scopeReply(
    () => render(...views),
    LocaleCtx.provide(this.request.locale),
    TranslateCtx.provide(this.request.t),
  ));
});
```

### D. `formFor<T>()` from the existing schema (F-A-083, F-A-093)

```ts
// before — ttl/src/auth/auth.view.ts:58,68  (SignInReq exists at ttl/src/core/types.ts:5 but is ignored)
Input().setType("email").setPlaceholder("Email").setName("email")
Input().setType("password").setPlaceholder("Password").setName("password")
// rename SignInReq.email → emailAddress: view still compiles, fails at runtime (422)
```
```ts
// after — import the SAME type the controller validates against
import type { SignInReq } from "../core/types.js";   // { email: string; password: string }
const f = formFor<SignInReq>();
Form(
  f.input("email", "email").setPlaceholder("Email"),
  f.input("password", "password").setPlaceholder("Password"),
  // f.input("emial", "email")  // ✗ compile error — not a key of SignInReq
)
```

## Type-safety story

- **Branded provider** — `ContextProvider.__ctxProvider: unique symbol` makes the provider opaque: callers can't fabricate one or pass a wrong shape into `scopeReply`. Mirrors the existing `Id`/`__idBrand` pattern (`ids.ts:21`).
- **`createRequiredContext<AuthUser>` + `provide`** carries the value type end-to-end: `AuthCtx.provide(x)` rejects anything not assignable to `AuthUser` at the call site, and `AuthCtx.current` is typed `AuthUser` (non-null) — no `user!` casts, no `AuthUser | null` re-encoded in every Props type.
- **Literal-union contexts** — `createContext<PageAccent>("indigo")` constrains both `scope()` and `current` to `"indigo" | "amber" | …`; the hand-rolled version (B) had the same effect only because the author wrote the union manually.
- **`formFor<T>()`** — field names are `keyof T & string` (`form.ts:28`); a schema rename surfaces as a compile error in the view, which is the entire value proposition that bare `.setName(string)` discards.
- **LIFO correctness is structural** — `scopeReply` disposes in reverse push order in a `finally`, so it holds even if `render` throws; the hook pattern can't guarantee this across interleaved requests.

## Migration & compatibility

**Additive — nothing breaks.**
- `createContext` / `createRequiredContext` gain a `provide` method; all existing `.current` / `.scope()` / `using` usage is untouched. `renderbox`'s hand-rolled `pageAccentCtx` keeps working (it just *could* be one line).
- `scopeReply` is new and opt-in. Apps already on the safe `decorateReply` + `using` pattern (`jt-vault-cloud`) need no change; `scopeReply` is sugar that also fixes the throw-safety gap (`using` already disposes on throw, so this is parity + multi-provider ergonomics).
- No codemod required for code. Optional codemod for the guideline-driven cleanup: *prop-drill → context* and *`.setName("x")` → `formFor<T>().input("x", …)`* are mechanical but type-driven; recommend an ESLint autofix in `eslint-plugin-fluent-html` rather than a one-shot codemod (tracked separately, Track-C tooling).
- `breaking-changes.md` note: none. This is an adoption RFC; the dominant deliverable is the guideline patch below.

## Guidelines impact

The core of this RFC (guardrail §11.8). Three files; the under-taught APIs already exist, so these edits are mostly *teaching*, not new surface.

### Index (`web-development/CLAUDE.md`)

Replace the **Scoped context** bullet block (lines 145-147) — add the Fastify wiring rule + the unsafe-hook ✗:

```md
**Scoped context** — use for cross-cutting values read by many components (i18n, theme, auth, nonce, feature flags) instead of prop drilling. Use props for component-specific data. **Never use `AsyncLocalStorage`** for render-time data — context is sufficient for synchronous rendering:
- `createContext(defaultValue)` — returns default when no scope active (theme, locale, accent literal-unions)
- `createRequiredContext(name)` — throws if accessed outside a scope (use for auth, request data)
- **Scope per-request in the `renderView` decorator with `scopeReply`** — never in `onRequest`/`onResponse` hooks (LIFO breaks under concurrency). See [fastify.md § Per-request context](fastify.md#per-request-context).

```typescript
const AuthCtx = createRequiredContext<AuthUser>("AuthCtx");
scopeReply(() => render(...views), AuthCtx.provide(request.user!))  // ✓ safe, auto-disposed
fastify.addHook("onResponse", ...dispose...)                        // ✗ concurrency-unsafe
function Sidebar({ user }) { ... }                                  // ✗ prop-drilling auth through layers
```
```

Tighten the existing **`formFor<T>()`** rule (line 91) — add the schema-source + ✗:

```md
**`formFor<T>()`** — use for type-safe form fields; never untyped `.setName()` when a schema exists. `T` is the **same request type the controller validates** (import it, don't redeclare). See [fluent-html.md § Type-Safe Forms](fluent-html.md#type-safe-forms--formfort).
```ts
const f = formFor<SignInReq>();      // ✓ T = the controller's request type
f.input("email", "email")            // ✓ compile error on typo
Input().setType("email").setName("email")  // ✗ when SignInReq exists — typos compile silently
```
```

### Topic ref (`web-development/fluent-html.md`)

1. Annotate the `.setName()` lines in **Tag Methods** (lines 22, 25, 26) — append `// for one-off elements without a schema — else prefer formFor<T>()`.

2. Replace the closing line of the **`formFor<T>()`** section (line 87) and prepend a ✗:

```md
**Where `T` comes from:** the request type your controller validates — import it from the schema/types file, never redeclare it.

```typescript
import type { SignInReq } from "../core/types.js";   // { email: string; password: string }
const f = formFor<SignInReq>();
f.input("email", "email")            // ✓ name checked against SignInReq
f.input("emial", "email")            // ✗ compile error — not a key of SignInReq

// ✗ schema exists but bypassed — a field rename fails only at runtime (422):
Input().setType("email").setName("email")
```

Untyped `.setName()` is for one-off elements with no schema (a search box, a `_csrf` field) — not for form bodies you already typed.
```

3. Replace the **Scoped Context** example (lines 150-166) — concrete auth + literal-union + Fastify cross-ref, not abstract `ThemeCtx`:

```md
## Scoped Context

Use for cross-cutting values (auth, i18n, theme, accent, nonce) read by many components — instead of prop drilling. **Never `AsyncLocalStorage`** — context is sufficient for synchronous render.

```typescript
const AuthCtx   = createRequiredContext<AuthUser>("AuthCtx");        // throws if no scope — auth
const AccentCtx = createContext<"indigo" | "amber" | "violet">("indigo"); // literal-union value
const ThemeCtx  = createContext<{ bg: string; text: string }>({ bg: "white", text: "gray-900" });
```

Scope per-request in the `renderView` decorator (see [fastify.md § Per-request context](fastify.md#per-request-context)), then read in any component with zero props:

```typescript
function SidebarFooter() {            // ✓ no `user` prop threaded through Layout → Sidebar → here
  const user = AuthCtx.current;
  return Div(user.name);
}

function Layout({ user }) { ... }     // ✗ prop-drilling a cross-cutting value
```

Don't reimplement the stack by hand — `createContext<T>(default)` already gives you `current` + `scope()` + the `Symbol.dispose` polyfill.

Use `createContext(default)` for values with a sensible default; `createRequiredContext(name)` when a missing scope is always a bug.
```

### Topic ref (`web-development/fastify.md`) — NEW section after **Auth Guards** (after line 104)

```md
## Per-request context

Make `request.user`, locale, nonce available to every view **without prop-drilling** — scope once in the `renderView` decorator with `scopeReply`. It disposes synchronously in LIFO order (even if render throws), so it is concurrency-safe.

```typescript
// auth/auth.context.ts
export const AuthCtx   = createRequiredContext<AuthUser>("AuthCtx");
export const LocaleCtx = createContext<Locale>("en");

// src/core/server.ts
server.decorateReply("renderView", function (this: FastifyReply, ...views: View[]) {
  this.type("text/html").send(scopeReply(
    () => render(...views),
    AuthCtx.provide(this.request.user!),     // ✓ active for exactly this render
    LocaleCtx.provide(this.request.locale),
  ));
});

// any view — no `user` prop:
function UserAvatar() {
  const user = AuthCtx.current;
  return Img().setSrc(user.avatarUrl).setAlt(user.name);
}
```

✗ Don't scope in `onRequest` and dispose in `onResponse` — concurrent requests interleave, violating the LIFO stack and leaking/clobbering values:

```typescript
fastify.addHook("onRequest",  (req) => { req._dispose = AuthCtx.scope(req.user!); }); // ✗
fastify.addHook("onResponse", (req) => { req._dispose[Symbol.dispose](); });          // ✗
```
```

**Adoption note:** the old `fluent-html.md` Scoped-Context example used `ThemeCtx`/abstract `User` and never touched Fastify, so apps couldn't map it to `request.user` — they prop-drilled (102 sites) or hand-rolled the stack (renderbox, 16 files) or used the unsafe hook pattern (6 apps). `fastify.md` mentioned context **zero times**. The fix is the cross-reference: teach the wiring point (`renderView` + `scopeReply`) where developers actually have `request.user`. For `formFor`, the old text framed `.setName()` as "still works," which read as "equally fine" — the new ✗ marks it as the typo-silencing anti-pattern whenever a schema type exists.

## Guardrail check

- §11.1 zero-deps: **pass** — `scopeReply`/`provide` use only the existing context stack + `Symbol.dispose` (already polyfilled `context.ts:23`). No new dependency.
- §11.2 ssr-only / sync hot path: **pass** — pure synchronous; `scopeReply` wraps a sync `render()` and never introduces `await`. Reinforces the "no ALS" stance by making the safe sync pattern ergonomic.
- §11.3 escape-by-default: **N/A** — emits no markup; `scopeReply` returns the string `render()` already escaped.
- §11.4 type-safety: **pass** — branded `ContextProvider`, value-typed `provide`, `keyof T` form names; no bare `string`, no `any`.
- §11.5 backward-compat: **pass** — additive; `provide` is a new method, `scopeReply` a new export. Frontmatter `breaking: additive`.
- §11.6 idiom consistency: **pass** — `provide` mirrors `Context` voice; `scopeReply` pairs with the existing `decorateReply("renderView")` idiom; reuses `defineRoutes`/`requireAuth` context unchanged; no inline JS.
- §11.7 class-string contract: **N/A** — emits no Tailwind classes; nothing for the extractor/eslint to learn.
- §11.8 guideline-sync: **pass** — `## Guidelines impact` covers every `api_surface` symbol (`scopeReply`, `Context.provide`, `ContextProvider`) plus the three adoption-gap teaching fixes; index ✓/✗ + topic-ref sections supplied verbatim for `CLAUDE.md`, `fluent-html.md`, `fastify.md` (matches `guideline_updates`).

## Alternatives considered

- **Guideline-only, no code (pure adoption fix).** Viable — the APIs already work. Rejected as *insufficient*: without `scopeReply`, the safe pattern still requires hand-written `using _a = …; using _b = …` in `decorateReply`, and apps demonstrably reach for the unsafe hook pattern instead. One 12-line helper makes the safe path shorter than the unsafe one — the strongest adoption lever.
- **`AsyncLocalStorage`-backed context** (would survive `await`). Rejected hard — violates the project's standing "Never ALS" rule and §11.2; render is synchronous, so it buys nothing here. (The async-render question is out of scope — Track-D/B owns it.)
- **A `requireAuthCtx` preHandler that scopes `AuthCtx` in `onRequest`.** Rejected — that *is* the unsafe hook pattern (F-A-034); the whole point is to scope inside the synchronous render, not across the request lifecycle.
- **Extend `formFor<T>()` to also bind 422 errors / values.** Deferred — that's the Form-system RFC (Track-B); this RFC only closes the *name-binding* adoption gap so the two don't collide on `formFor`'s surface.

## Open questions

- Should `scopeReply` live in `control/context.ts` (with `provide`) or in a new `fastify`-adjacent helper? It's framework-agnostic (takes `() => string`), so `control/context.ts` keeps zero-dep purity — proposed default.
- Worth a thin `decorateRenderView(server, ...providers)` convenience that builds the whole decorator? Tempting but couples the lib to a Fastify type; left as an app-side snippet in `fastify.md` to preserve §11.1/framework-agnosticism. Decision for a human.
