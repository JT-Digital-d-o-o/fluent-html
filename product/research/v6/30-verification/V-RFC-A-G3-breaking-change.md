---
rfc: RFC-A-G3
lens: breaking-change
verdict: survives-with-changes
confidence: 0.78
killer_objection: "The `applyTo` migration path silently swaps the app's `renderView` decorator for a hardcoded `reply.type('text/html').send(html)`, dropping any layout/nonce/CSP/caching behavior that decorator carries — a behavioral change buried inside a migration the RFC labels 'Nothing breaks' and which is not safely codemod-able."
required_changes:
  - "Mark the `reply.header(...).renderView(view)` -> `hxResponse(view).applyTo(reply)` rewrite as a BEHAVIORAL migration, not additive: `applyTo` renders via `reply.type('text/html').send(render(view))` and bypasses the app's `renderView` decorator. The htmx.md `hxResponse` section and the CLAUDE.md index rule must state this and gate the recommendation on `renderView` being a pure content-type+send (no layout wrap, nonce injection, CSP header, or cache header)."
  - "Keep `renderView` as the rendering mechanism for the non-trivial case: recommend `reply.headers(hxResponse(view).getHeaders()); reply.renderView(view)` (two-call, decorator-preserving) wherever the app's `renderView` does more than type+send. Reserve `applyTo` for `Empty()`/redirect/header-only responses (the F-A-101 `bugs.controller.ts:300` redirect case is safe; the `settings.controller.ts:110` `renderView(SettingsForm(...))` case is risky and must not be shown as a clean 1:1)."
  - "Add a `HxReplyLike` doc note that `applyTo` does NOT call `renderView`; if a host relies on `renderView` side effects, use `getHeaders()` + `renderView` instead."
  - "Frontmatter `breaking: additive` may stay (library symbol surface is additive), but `## Migration & compatibility` must drop the unqualified 'Additive. Nothing breaks.' for the F-A-101 path and add the `renderView`-bypass caveat; record it in `breaking-changes.md` as an app-side behavioral-migration note even though no library symbol changed."
---

# Verdict: RFC-A-G3 — breaking-change lens

> You are an ADVERSARY. Your job is to KILL this RFC through the breaking-change lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

I checked every breakage vector this RFC could hide. Most are clean; one is not.

**Cleared (no hidden breakage):**

- **No renamed/removed symbols.** `hxGet`/`hxPost`/`hxPut`/`hxPatch`/`hxDelete` are byte-for-byte unchanged at `fluent-html/src/core/htmx-methods.ts:18-22` (`hxGet(endpoint: string, options?: Omit<HxOptions, "method">): this`). F-A-073 explicitly chose Option 2 (no rename). All ~150 call-sites keep compiling. Confirmed.
- **New symbols don't collide.** `applyTo` / `HxReplyLike` are genuinely absent from `src/` (grep returned nothing). Adding `applyTo` to `HxResponse` and exporting `HxReplyLike` cannot shadow existing imports. `build()`/`getHeaders()` are untouched (`patterns.ts:340-353`); the cited `mngmt/.../files.controller.ts:64,135` `.build()` callers keep working.
- **The "after" examples compile against real types.** The linchpin — `route({...})` / `route({params}, {opts})` returning an `HTMX` consumed by `setHtmx(HTMX)` — is real: `RouteCallable` (`routes.ts:145-150`) is `((params, options?: RouteHxOptions) => HTMX) & RouteProperties`, and `RouteHxOptions` (`routes.ts:105`) is `Partial<Omit<HTMX, ...>>`, so `confirm`/`vals`/`trigger` flow through. The F-A-016/062/074 migrations ride **existing** infrastructure, not new surface, so they are pure opt-in app rewrites, never forced breaks.
- **`setCrossorigin("")` is fenced out.** Owned by RFC-A-F044, additive overload, correctly `depends_on`. Not this RFC's breakage.

**The one real hit — a behavioral change disguised as ergonomics (F-A-101):**

`applyTo` is implemented as:

```ts
applyTo(reply: HxReplyLike): void {
  const { html, headers } = this.build();
  for (const [k, v] of Object.entries(headers)) reply.header(k, v);
  reply.type("text/html").send(html);   // <- renders via type+send, NOT renderView
}
```

But the project's own SSR contract (CLAUDE.md: *"SSR responses only ... `reply.renderView(...)`"*) means apps render through an app-owned `renderView` **decorator**, and the RFC's F-A-101 worked example rewrites exactly that call:

```ts
// before — settings.controller.ts:110
reply.header("HX-Reswap", "outerMorph").code(422).renderView(SettingsForm({ error }));
// after (RFC)
hxResponse(SettingsForm({ error })).reswap("outerMorph").applyTo(reply.code(422));
```

This is **not** a 1:1 swap. `renderView` commonly does more than `type+send`: wraps the view in a layout shell, injects a CSP/nonce from scoped context, sets caching or `Vary` headers, or post-processes HTML. `applyTo` discards all of that and emits a bare `text/html` body. For a redirect/`Empty()` response (the `bugs.controller.ts:300` case) the difference is nil — there is no view to wrap. But for `renderView(SettingsForm(...))` the migration can silently:

- drop the page/layout wrapper (full-page vs partial expectations break),
- drop a nonce/CSP header -> runtime CSP violation (escape-adjacent regression),
- drop caching headers.

Crucially this is **not safely codemod-able**: a codemod rewriting `reply.…renderView(view)` -> `hxResponse(view).applyTo(reply)` cannot know what the app's `renderView` decorator does. The RFC's `## Migration & compatibility` says "**Additive. Nothing breaks.**" and "No codemod required" — true for the *library symbol surface*, false for the *recommended app rewrite*, which is a behavioral migration the guideline actively pushes (the htmx.md ✗ example marks `reply.header(...).renderView(...)` as wrong).

This is the §11.5 trap: additive at the API layer, but the shipped guideline instructs a non-equivalent, non-codemod-able behavioral substitution and labels it safe.

## Does it survive?

**survives-with-changes.** The library surface is genuinely additive and well-marked; no symbol is renamed or removed; the route-object migration rides existing types. The RFC is *not* rejected — its core (typed options, the route-object usage contract, the two-zone naming rule, and the `applyTo` ergonomic for header-only/redirect responses) is sound and breakage-free. But the F-A-101 `applyTo` recommendation conflates `type+send` with the app `renderView` decorator and oversells it as "Nothing breaks." That must be fenced before the guideline edit ships, or apps following the guideline silently regress layout/nonce/CSP behavior on validation-error and content-bearing responses.

Required changes are in the frontmatter: gate the `applyTo` recommendation on `renderView` being side-effect-free, keep `getHeaders()` + `renderView` for the decorator-carrying case, and document the bypass on `HxReplyLike` and in `breaking-changes.md`.

## Guardrail check (breaking-change owns §11.5)

§11.5 backward-compat: **PASS at the library-symbol layer** (additive: new `applyTo`/`HxReplyLike`, unchanged `hxGet`/`build`/`getHeaders`), **CONDITIONAL at the guideline/migration layer** — the recommended `renderView`->`applyTo` rewrite is a behavioral, non-codemod-able change the RFC must mark and scope rather than label "Nothing breaks." With the required changes folded in, §11.5 is satisfied.
