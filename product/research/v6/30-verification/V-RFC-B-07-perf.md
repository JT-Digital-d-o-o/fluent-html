---
rfc: RFC-B-07
lens: perf
verdict: survives-with-changes
confidence: 0.74
killer_objection: null
required_changes:
  - "Pin the requireAuth preHandler fast-path ordering as a contract in the RFC: skipPrefix match and cookie-presence/unsign check MUST short-circuit BEFORE any findUser() DB call, so static-asset, /health, /metrics, and unauthenticated requests never pay a DB round-trip. The apps it consolidates already diverge; the library must guarantee the cheapest ordering, not leave it to the impl."
  - "Bound and freeze skipPrefixes: document that matching is O(prefixes) startsWith per request, keep DEFAULT_SKIP_PREFIXES a small (<=~8) frozen/`as const` shared constant (not re-allocated per registration), and add a perf note warning against silently growing it into a regex/large list."
  - "renderHx must NOT pay build()'s `{ ...this._headers }` spread + intermediate HxResponseResult object: implement it to set headers directly from the builder onto the reply and render the content, bypassing build(). Otherwise renderHx is a perf no-op (or net-negative) wrapper over the 3-step it replaces."
  - "renderView(...views) must fast-path the single-view common case (render(view) without spreading a 1-element rest array). The 1-view call is the overwhelming majority; parity-with-existing-decorator is not an excuse to centralize a universal per-call allocation."
  - "State that the auth hook is registered as a scoped/encapsulated hook on the context that needs it, not a global onRequest hook firing for every asset/health/metrics request app-wide."
---

# Verdict: RFC-B-07 — perf lens

> You are an ADVERSARY. Your job is to KILL this RFC through the perf lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The RFC's headline perf claim (§Guardrail check §11.2: "render path unchanged") is *true for the synchronous render hot path* — and that is the part I cannot kill. `renderView`/`renderStreamView`/`renderHx` all funnel into the same `render()` / `renderToStream()`. No new tree walk, no second escaping pass, no async injected into the sync emitter. So the strongest attack is NOT the render path — it is the **per-request request-lifecycle cost** this RFC centralizes, plus two allocation regressions hiding inside the "convenience" wrappers.

- **perf failure mode 1 — the auth preHandler is the real hot path, and its cost ordering is unspecified.** `createAuthPlugin` installs a `preHandler` hook that fires for *every matched request*. The RFC's *before* snippet shows `addHook("preHandler", … /* unsign → findUser → gate */)` but the *proposed API* never pins the ordering contract. This is decisive: if the library's canonical hook calls `findUser()` (a Prisma DB round-trip) *before* checking `skipPrefixes` + cookie presence, every `/health`, `/metrics`, `/css/*`, `/favicon.ico`, and every logged-out request eats a database query. The entire purpose of `SKIP_AUTH_PREFIXES` and the unsign check is to short-circuit *before* the expensive lookup. Centralizing the plugin is leverage in both directions — ship the slow ordering and you regress every app simultaneously. Leaving the cheapest ordering implicit is a perf liability.

- **perf failure mode 2 — `skipPrefixes` matching is O(prefixes) on every request, and the API invites it to grow.** Per the before-code, the prefix list is matched via `.some(p => url.startsWith(p))` on every request. At 6–8 entries this is negligible. But `skipPrefixes?: readonly string[]` invites apps to append, with no stated bound and no note that this is per-request linear work; if it silently becomes a regex or a 30-entry list the per-request tax compounds. And nothing forces `DEFAULT_SKIP_PREFIXES` to be a frozen shared constant — a naive impl re-allocates the default array per plugin registration. Minor, but it is the "common case pays for centralization" smell.

- **perf failure mode 3 — `renderHx` is sold as a win but can be a no-op wrapper that still copies headers.** Confirmed in source: `HxResponse.build()` does `headers: { ...this._headers }` (src/patterns.ts:343) — a full object spread/copy on every HTMX response. If `reply.renderHx(response)` is implemented as `const { html, headers } = response.build(); reply.headers(headers); reply.renderView(html)`, it pays the *exact same* spread copy plus the intermediate `HxResponseResult` object plus a destructure — zero perf gain over the 3-step it replaces. The DX win is genuine; the perf win is only real if `renderHx` iterates `_headers` directly onto the reply and skips `build()`. The RFC doesn't say which, so I assume the slow one.

- **perf failure mode 4 — `renderView(...views): void` allocates a rest array on the single-view common case.** The overwhelming majority of `reply.renderView(x)` calls pass exactly one view. A rest parameter allocates a 1-element array per call, then `render(...views)` spreads it again. This is parity with the existing hand-rolled decorator (not a *regression*), but the RFC is the moment to fix it: fast-path arity 1 and only spread for the rare multi-view case. Centralizing the decorator without this bakes a small, universal allocation into the library.

- **What I could NOT use to kill it:** No async leaks into the sync render path. `renderStreamView` reuses existing `renderToStream` — no new eager walk. `requireUser` is a property read + conditional throw: zero allocation on the happy path, and it *removes* the `request.user!` deref without adding cost. `ErrorPage`/`AuthShell`/`OAuthButtons` are plain view functions on the standard escaping path, executed only on error/auth routes (rare), so they don't tax the hot path; the `shell?: (children) => View` closure runs once per error response, not per request. None of these are killable on perf grounds.

## Does it survive?

**survives-with-changes.** Guardrail §11.2 (synchronous SSR render path stays fast) is genuinely honored — render is untouched, async is confined to the app's pre-existing `findUser` inside a preHandler, exactly where it already lives. I cannot land a killer objection. But the RFC centralizes the **request-lifecycle hot path** (the auth hook fires on every request) and ships two convenience wrappers (`renderHx`, `renderView`) whose perf characteristics are left implicit. Centralization cuts both ways: ship the cheap orderings and every app gets faster; ship the naive ones and every app regresses at once. Because the RFC under-specifies the orderings that matter, it must carry explicit perf contracts before it ships. With the five required changes folded in — skip/cookie checks before `findUser`, bounded frozen `skipPrefixes`, copy-free `renderHx`, single-view-fast-path `renderView`, scoped (not global) hook — this is net perf-positive.

## Guardrail check (perf owns §11.2)

§11.2 "SSR-only, synchronous render path stays fast": **PASS.** No async is introduced into the synchronous emitter; `renderView`/`renderStreamView`/`renderHx` dispatch to existing `render`/`renderToStream`. The only async (`findUser`) is the app's pre-existing DB call inside a Fastify preHandler — off the render path. The conditional is on the *request* hot path (preHandler ordering + skipPrefix bound + wrapper allocations), which §11.2's spirit ("the common case must not pay for a rare feature") also governs; the required changes make those guarantees explicit rather than incidental.
