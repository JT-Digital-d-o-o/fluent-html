---
id: RFC-B-08
track: B
title: reply.renderView() accepts HTMX response options + a Deferred() slot makes renderToStream worth reaching for
resolves: [F-B-124, F-B-074]
api_surface: ["reply.renderView(view, opts?)", "RenderViewOptions", "hxResponse().applyTo(reply)", "HxResponse.applyTo()", "reply.renderStreamView(view)", "Deferred()", "DeferredOptions"]
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fastify.md", "web-development/fluent-html.md"]
impact: high
effort: M
depends_on: []
status: proposed
---

# RFC-B-08: `reply.renderView()` ↔ `hxResponse()` integration + `renderToStream` wiring

## Problem

Two separate, **incompatible** response APIs ship in the library and neither composes with the Fastify `renderView` decorator:

1. **HTMX response headers are written as raw strings.** The typed `hxResponse()` builder (`fluent-html/src/patterns.ts:184-360`) has `.reswap()`, `.retarget()`, `.trigger()` over a typed `HxSwapStyle` union (`src/htmx.ts:19-34`) — but its only sink is `.build()` → `{ html, headers }`, which does **not** chain with `reply.renderView()`. So every app falls back to untyped `reply.header("HX-Reswap", "outerMorph")` strings:

   ```ts
   // rideshare/src/settings/settings.controller.ts:110 — one of 12 identical occurrences
   reply.header("HX-Reswap", "outerMorph").code(422).renderView(
     SettingsPage({ user: current!, navCounts: request.navCounts, errors: { profilePicture: message } })
   );
   ```
   ```ts
   // planet-positive-sport/src/admin/admin.guards.ts:33-34 — retarget + reswap as raw strings
   reply.header("HX-Retarget", layoutIds.mainContent.selector);
   reply.header("HX-Reswap", "outerHTML");
   ```

   `"outerMorph"` is a bare string; a typo (`outerHTML`, `outermorph`) silently produces a broken swap. The typed union exists but is unreachable from the idiomatic path. Raw `HX-…` header counts: rideshare 12, pps 4, glimm 3, jt-cut 1 (~20 fleet-wide, F-B-124, frequency 19, pain high).

2. **`renderToStream` is a dead export.** Both storysell-ai and glimm decorate a `renderStreamView` reply (`glimm/src/core/server.ts:122-127`, `storysell-ai/src/core/server.ts:149-153`) and **never call it** — full-text search returns zero call sites (F-B-074). Root cause: controllers `await` all data *before* render, so streaming buys nothing. The library lacks a "deferred slot" primitive, so streaming has no reason to exist.

Both are the same gap from two angles: the response-construction surface (`renderView`, `hxResponse`, `renderToStream`) is fragmented and the idiomatic Fastify path is undertyped.

## Proposed API

### Part 1 — `renderView` accepts HTMX response options (resolves F-B-124)

```ts
// src/htmx.ts — reuse existing HxSwapStyle/HxSwap unions; HxTarget already accepts Id | selector
export type RenderViewOptions = {
  code?: number;                       // status code (replaces reply.code(...))
  reswap?: HxSwap;                     // typed → HX-Reswap   (was raw string)
  retarget?: HxTarget;                 // Id | selector → HX-Retarget (auto-resolves Id.selector)
  reselect?: HxTarget;                 // Id | selector → HX-Reselect
  trigger?: string | Record<string, unknown>;  // → HX-Trigger (string or JSON event map)
};

// Fastify module augmentation (app-side, documented in fastify.md)
declare module "fastify" {
  interface FastifyReply {
    renderView(view?: View, opts?: RenderViewOptions): FastifyReply;   // ← opts is new, optional
    renderStreamView(view: View, opts?: RenderViewOptions): FastifyReply;
  }
}
```

The decorator body (app-side boilerplate, library ships the helper that builds it):

```ts
// src/fastify-helpers.ts (new, optional import — keeps lib zero-dep; Fastify is a peer/app concern)
export function applyHxOptions(reply: { header(k: string, v: string): unknown; code(n: number): unknown }, opts?: RenderViewOptions): void {
  if (!opts) return;
  if (opts.code      !== undefined) reply.code(opts.code);
  if (opts.reswap)   reply.header("HX-Reswap",   opts.reswap);
  if (opts.retarget) reply.header("HX-Retarget", resolveSelector(opts.retarget)!);
  if (opts.reselect) reply.header("HX-Reselect", resolveSelector(opts.reselect)!);
  if (opts.trigger)  reply.header("HX-Trigger",  typeof opts.trigger === "string" ? opts.trigger : JSON.stringify(opts.trigger));
}
```

### Part 2 — `hxResponse().applyTo(reply)` (bridge the builder to Fastify)

For the complex multi-header case, let the existing builder write itself onto a reply instead of forcing manual `Object.entries(headers)` spreading:

```ts
// src/patterns.ts — new method on HxResponse
class HxResponse {
  /** Render content + write all accumulated HX-* headers onto a Fastify-like reply. */
  applyTo(reply: { header(k: string, v: string): unknown; type(t: string): unknown; send(b: string): unknown }): void {
    for (const [k, v] of Object.entries(this._headers)) reply.header(k, v);
    reply.type("text/html").send(render(this._content));
  }
}
```

### Part 3 — `Deferred()` makes `renderToStream` worth reaching for (resolves F-B-074)

An HTMX-native "suspense" slot: emit the shell now, fill the slow region via a `load`-triggered second round-trip. Single-sourced through a route ref (guardrail §11.6 — `defineRoutes`, never hand-built URLs).

```ts
// src/patterns.ts (new) — typed against a route callable from defineRoutes()
export type DeferredOptions = {
  swap?: HxSwap;          // default "innerHTML"
  indicator?: HxTarget;
  trigger?: string;       // default "load" (htmx-4 once)
};

/**
 * A lazily-hydrated slot. Emits a placeholder element that fetches `route`
 * on load and swaps the response in. Pairs with renderToStream so the shell
 * flushes immediately while the deferred region resolves in a 2nd request.
 */
export function Deferred(
  route: { method: "GET"; resolve: (query?: QueryParams) => string },
  fallback: View,
  opts?: DeferredOptions,
): Tag;
```

## Worked examples (before → after)

### F-B-124 — 422 + reswap (rideshare settings, 12× in one file)

```ts
// before — rideshare/src/settings/settings.controller.ts:110 (×12 identical)
reply.header("HX-Reswap", "outerMorph").code(422).renderView(
  SettingsPage({ user: current!, navCounts: request.navCounts, errors: { profilePicture: message } })
);
```
```ts
// after — typed reswap, no raw header strings, one call
reply.renderView(
  SettingsPage({ user: current!, navCounts: request.navCounts, errors: { profilePicture: message } }),
  { code: 422, reswap: "outerMorph" },
);
```

### F-B-124 — retarget + reswap (pps admin guard)

```ts
// before — planet-positive-sport/src/admin/admin.guards.ts:33-34
reply.header("HX-Retarget", layoutIds.mainContent.selector);
reply.header("HX-Reswap", "outerHTML");
// (followed by reply.renderView(...) later)
```
```ts
// after — Id passed directly, .selector resolved internally
reply.renderView(ForbiddenView(), { retarget: layoutIds.mainContent, reswap: "outerHTML" });
```

### F-B-124 — multi-header builder via `.applyTo`

```ts
// before — the awkward path no app actually takes (F-B-124 quote)
const { html, headers } = hxResponse(view).reswap("outerMorph").trigger("formError").build();
Object.entries(headers).forEach(([k, v]) => reply.header(k, v));
reply.code(422).type("text/html").send(html);
```
```ts
// after — builder writes itself onto reply
reply.code(422);
hxResponse(view).reswap("outerMorph").trigger("formError").applyTo(reply);
```

### F-B-074 — give `renderStreamView` a reason to exist

```ts
// before — glimm/src/core/server.ts:122-127 declares renderStreamView, NEVER called.
// Every controller awaits everything, then renders synchronously:
const stats = await prisma.heavyAggregate(...);   // slow
reply.renderView(DashboardPage({ user, stats }));  // blocks the shell on the slow query
```
```ts
// after — shell flushes immediately; the slow region resolves in a 2nd round-trip
// dashboard.routes.ts
export const dashboardRoutes = defineRoutes("/dashboard", {
  index: { method: "GET", path: "/" },
  stats: { method: "GET", path: "/stats" },   // ← the deferred fragment endpoint
} as const);

// controller (index) — no await on the slow aggregate
reply.renderStreamView(
  DashboardPage({
    user,
    statsSlot: Deferred(dashboardRoutes.stats, Skeleton({ variant: "card" })),
  }),
);
// controller (stats) — renders just the fragment when htmx loads it
const stats = await prisma.heavyAggregate(...);
reply.renderView(StatsPanel({ stats }));
```

## Type-safety story

- **Literal union over bare string (§11.4):** `reswap: HxSwap` reuses the existing `HxSwapStyle` union — `{ reswap: "outermorph" }` is a **compile error**, killing the silent-typo class that motivated F-B-124. The raw `reply.header("HX-Reswap", "...")` string path had no such guard.
- **`HxTarget` accepts `Id` directly:** `retarget: layoutIds.mainContent` — no `.selector` access at the call site; `resolveSelector` (`src/htmx.ts:275`) handles `Id` vs string. Mixing up an `Id` from another feature is caught by `defineIds`' branded shape.
- **`Deferred` is route-ref-typed, GET-only:** the `route` param is `{ method: "GET"; resolve }` — passing a `POST` route callable from `defineRoutes` is a compile error (a deferred slot must be idempotently loadable). URLs come from `route.resolve()`, never string concatenation (§11.6).
- **`trigger`** is `string | Record<string, unknown>` mirroring the existing `hxResponse().trigger()` overload, so simple and event-detail forms both stay typed.
- **Additive optional param:** `renderView(view?)` → `renderView(view?, opts?)` — every existing call still typechecks unchanged.

## Migration & compatibility

**Additive — nothing breaks.**

- `renderView(view)` keeps working; `opts` is optional. The decorator augmentation gains an optional 2nd param.
- `hxResponse().build()` is untouched; `.applyTo()` is a new method.
- `renderToStream` / `renderStreamView` keep their current signature; `Deferred()` is a new export apps opt into.
- **Codemod (optional, mechanical):** rewrite `reply.header("HX-Reswap", X).code(N).renderView(V)` → `reply.renderView(V, { code: N, reswap: X })`. Pure AST shape match; safe to auto-apply for the rideshare-style cluster (12 sites in one file). Not required — old form stays valid.
- No `breaking-changes.md` entry needed.

## Guidelines impact

Three files. House style: code-snippet-first, ✓/✗, for an LLM reader.

### Index — `web-development/CLAUDE.md`

Replace the **SSR responses only** block (currently lines ~278-286) so the typed HTMX-options path is the default and raw `reply.header("HX-…")` is marked ✗:

```md
**SSR responses only** — no JSON errors. HTMX response headers go through `renderView` opts (typed), never raw `reply.header("HX-…")`:
```typescript
reply.renderView(PageView());                                         // ✓
reply.renderView(Form({ email: "taken" }), { code: 422, reswap: "outerMorph" }); // ✓ typed reswap
reply.renderView(View(), { retarget: ids.mainContent, reswap: "outerHTML" });    // ✓ Id auto-resolves
hxResponse(view).reswap("outerMorph").trigger("saved").applyTo(reply);           // ✓ multi-header builder
reply.header("HX-Reswap", "outerMorph").code(422).renderView(view);  // ✗ untyped, typo-prone
reply.code(400).send({ error: "Bad request" });                       // ✗ not a REST API
```
```

Add one line to the **HTMX** critical-rules list (near `hxResponse`/`.resolve` rules):

```md
- **Deferred render** — slow above-the-fold-blocking regions use `Deferred(route, fallback)` + `reply.renderStreamView` (route ref, not hand-built URL); plain CRUD stays on synchronous `renderView`.
```

### Topic ref — `web-development/fastify.md`

Append after the **SSR responses** / module-augmentation area:

```md
## HTMX response options

`reply.renderView(view, opts?)` writes typed `HX-*` headers — never raw `reply.header("HX-…")`.

```typescript
type RenderViewOptions = {
  code?: number;          // status (replaces reply.code())
  reswap?: HxSwap;        // → HX-Reswap (typed union; "outermorph" is a compile error)
  retarget?: HxTarget;    // Id | selector → HX-Retarget (Id.selector auto-resolved)
  reselect?: HxTarget;    // → HX-Reselect
  trigger?: string | Record<string, unknown>; // → HX-Trigger
};
```
```typescript
reply.renderView(Form({ errors }), { code: 422, reswap: "outerMorph" });          // ✓
reply.renderView(View(), { retarget: layoutIds.mainContent, reswap: "outerHTML" }); // ✓ pass the Id, not Id.selector
reply.header("HX-Reswap", "outerMorph").code(422).renderView(view);                 // ✗
```

Multi-header / event-trigger responses: build with `hxResponse()` and flush onto the reply with `.applyTo`:
```typescript
hxResponse(view).reswap("outerMorph").trigger("formError", { field: "email" }).applyTo(reply); // ✓
const { html, headers } = hxResponse(view)...build();                                            // ✗ manual spread
Object.entries(headers).forEach(([k, v]) => reply.header(k, v));                                 // ✗
```
```

### Topic ref — `web-development/fluent-html.md`

Augment the streaming reference (the `renderToStream` line ~170 area) with the deferred-slot pattern:

```md
## Streaming render & deferred slots

`renderToStream` is only worth it when a slow region would otherwise block the shell. Use `Deferred()` to flush above-the-fold immediately and load the slow region in a 2nd htmx round-trip; plain CRUD that awaits everything stays on synchronous `render`/`renderView`.

```typescript
// route ref single-sources the deferred endpoint (never a hand-built URL)
Deferred(dashboardRoutes.stats, Skeleton({ variant: "card" }))   // ✓ GET route ref + fallback
Deferred(dashboardRoutes.create, Skeleton())                     // ✗ compile error — POST not loadable
```
```typescript
reply.renderStreamView(DashboardPage({ statsSlot: Deferred(dashboardRoutes.stats, Skeleton()) })); // ✓
const stats = await slowAggregate(); reply.renderView(DashboardPage({ stats }));                    // ✗ blocks shell on slow query
```
```

**Adoption note:** `hxResponse` (≤4 uses/app) and `renderToStream` (0 call sites) were under-used because the old guidelines documented `renderView` as the render sink but never connected it to HTMX headers or to a deferred-slot pattern — so devs reached for raw `reply.header` strings and copy-pasted a dead `renderStreamView` decorator. The fix is teaching the *bridge*, not just the parts.

## Guardrail check

- **§11.1 zero-deps:** pass — `Deferred`/`applyTo` are pure tag/string builders; `applyTo` and `applyHxOptions` take a structurally-typed reply (no `fastify` import in lib). Fastify stays an app/peer concern.
- **§11.2 ssr-only / fast sync path:** pass — `renderView` opts are synchronous header writes; `Deferred` is opt-in and emits a static placeholder. Streaming stays opt-in via `renderStreamView` (Track D owns perf proof).
- **§11.3 escape-by-default:** pass — `Deferred` emits a normal escaped `Tag` (route URL via `escapeAttr` in the htmx serializer); `trigger` JSON is header-side, not markup. No new `Raw` surface.
- **§11.4 type-safety:** pass — `HxSwap` union for `reswap`, `HxTarget`/`Id` for retarget, GET-only route ref for `Deferred`; no bare `string`/`any`.
- **§11.5 backward-compat:** pass — additive; optional 2nd param + new methods/exports; optional mechanical codemod.
- **§11.6 idioms:** pass — route-ref single-sourcing (`Deferred(route, …)`), `Id` over raw selector, no inline JS (htmx `load` trigger), builder consistency with existing `hxResponse`.
- **§11.7 class-string contract:** N/A — emits no new Tailwind classes (`Skeleton` fallback is a separate RFC's surface).
- **§11.8 guideline-sync:** pass — `## Guidelines impact` covers every `api_surface` symbol: `renderView(view, opts)`/`RenderViewOptions` + `hxResponse().applyTo` (CLAUDE.md + fastify.md), `Deferred`/`DeferredOptions` + `renderStreamView` (CLAUDE.md + fluent-html.md). `guideline_updates` frontmatter lists all three files.

## Alternatives considered

- **Make `renderView` accept an `HxResponse` instance** (`renderView(view, hxResponse().reswap(...))`). Rejected as the *primary* shape: redundant `view` (the builder already holds content) and heavier for the 80% case (just `{ code, reswap }`). Kept as the *secondary* path via `.applyTo(reply)` for multi-header/trigger cases.
- **A new `reply.htmx(view).reswap(...).send()` chain on the reply itself.** Rejected — duplicates `hxResponse`'s entire surface on the Fastify decorator, growing app-side boilerplate and violating §11.6 (one idiom). `.applyTo` reuses the existing builder.
- **A React-style `Suspense(promise, fallback)` that awaits in-render.** Rejected — breaks §11.2 (would make the synchronous render path async). The htmx-native `Deferred` (2nd round-trip) keeps the hot path synchronous and is the SSR-idiomatic suspense.

## Open questions

- Does the library ship the `applyHxOptions`/decorator helper as an exported `fastify-helpers` entry, or stay documentation-only so apps own the (structurally-typed) decorator? Leaning exported helper to kill the copy-pasted decorator boilerplate (relates to F-B-121), but it must not import `fastify`.
- `Deferred` default trigger: `"load"` vs `"revealed"` (lazy on scroll-into-view). Default `"load"`; expose `opts.trigger` for `"revealed"`.
