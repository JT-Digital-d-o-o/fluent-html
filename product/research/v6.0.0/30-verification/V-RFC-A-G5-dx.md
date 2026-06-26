---
rfc: RFC-A-G5
lens: dx
verdict: survives-with-changes
confidence: 0.74
killer_objection: "The code half (scopeReply + Context.provide + ContextProvider — 3 new symbols) is not worth its API surface: the same safe, throw-safe, concurrency-safe wiring already works with the existing, already-taught `using _ = ctx.scope(v)` inside the renderView decorator. `using` IS throw-safe by definition, so scopeReply's headline benefit is already shipped; the only real delta — N providers in one call — is two stacked `using` lines today, with LESS machinery. The RFC concedes the fix is '90% guideline'; the unsafe-hook adoption failure is a pure teaching gap (fastify.md mentions context zero times), closed by the guideline edit alone. Shipping a second scoping path in a 'one obvious way' library is §13 idea-inflation."
required_changes:
  - "Cut the new code surface or re-justify it head-on. Default (recommended): drop `scopeReply`, `Context.provide`, and `ContextProvider`; teach the safe pattern with the EXISTING API inside the renderView decorator — `using _a = AuthCtx.scope(this.request.user!); using _l = LocaleCtx.scope(this.request.locale); this.type('text/html').send(render(...views));`. Throw-safe, concurrency-safe, zero new exported symbols, and the `api_surface` collapses to []. If scopeReply is kept, the RFC must show ONE concrete failure plain `using` does not solve for synchronous render (it currently shows none) and justify a branded 3-symbol addition against guardrail §13."
  - "Fix the fabricated 'safe baseline' exemplar. Migration & compat (RFC line 226) and the Problem (line 25) assert jt-vault-cloud is 'already on the safe decorateReply + using pattern' at server.ts:101-108. The real decorator (jt-vault/src/core/server.ts:92-98) scopes NO context and uses NO `using` — it is `const rendered = render(view); this.type(...).send(rendered)`. The strongest evidence that the safe pattern exists and works is not in the cited app. Re-cite a real `using`-in-decorator app or retract the claim — the adoption argument rests on it."
  - "Resolve `this.request` access inside the decorator — load-bearing in every wiring example (RFC server.ts blocks read `this.request.user`/`.locale`/`.nonce`) yet NO surveyed app (rideshare, jt-vault, ttl) accesses `this.request` in a reply decorator. Confirm `reply.request` is populated at decorator-call time in Fastify v5 and the augmented `FastifyReply` exposes it without a cast, and show it working once — a broken canonical snippet is the worst adoption outcome."
  - "Fix the frontmatter api_surface signature: it lists `scopeReply(reply, ...providers)` but the proposed function takes a render thunk, not a reply — `scopeReply(render: () => string, ...providers: ContextProvider[])`. A stale signature here propagates verbatim into 40-synthesis/guidelines-update.md. (Moot if scopeReply is cut.)"
  - "Remove `nonce` from every context-value example (CLAUDE.md edit, fastify.md § Per-request context, fluent-html.md Scoped Context). The lib ships `renderWithNonce(...)` (src/render/render.ts) which INJECTS nonce attrs onto <script>/<style>; scoping a `NonceCtx` value only makes the string readable and does NOT apply nonces. Listing nonce as a context value mis-teaches it as a replacement for renderWithNonce."
  - "Correct the Problem-statement misrepresentation of the CURRENT guideline. RFC lines 29 & 252 claim CLAUDE.md frames `.setName()` as 'still works / equally valid' with 'no ✗ signal.' The actual guidelines/web-development/CLAUDE.md:91 ALREADY says `**never untyped .setName() when a schema exists**`. The index rule is already fixed; only the topic-ref is soft (fluent-html.md:86, 'Untyped .setName() still works...'). Scope the formFor edit to the topic ref + the inline `.setName()` annotations; drop the near-duplicate CLAUDE.md rewrite or reframe it as the single new clause ('T = the controller's request type')."
  - "Keep teaching `using _ = ctx.scope(v)` in the fluent-html.md `## Scoped Context` rewrite (RFC lines 287-312). The rewrite drops `scope()`/`using` entirely for `scopeReply`/`provide` — a teaching regression: a reader can no longer learn how to scope a context OUTSIDE the Fastify decorator (e.g. renderbox's per-page literal-union accent, example C, which is `using _ = pageAccentCtx.scope('indigo')`). Show both: `scope()`+`using` for component/page-local, decorator-level for per-request."
  - "Fix stale line-number anchors so the patch applies cleanly: CLAUDE.md scoped-context block is 145-148 (not 145-147); fluent-html.md `.setName()` examples are lines 21-24 (not 22/25/26); the soft formFor closing line is 86 (not 87); the Scoped-Context section is 146-167 (not 150-166). Substance of every edit is correct and in house style — only the offsets are stale."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-A-G5-dx.md
---

# Verdict: RFC-A-G5 — dx lens

> ADVERSARY. Kill through the dx failure mode: is this worth the API surface? Discoverable, idiom-consistent, hard to misuse? Would an app author reach for it? Is the guideline edit correct, minimal, house-style, and complete over `api_surface`?

## Attack

The RFC bundles (1) a guideline-teaching fix for context-in-Fastify + formFor (the real, defensible 90%), and (2) two new exports — `scopeReply` and `Context.provide` returning a branded `ContextProvider`. The dx case against the *code* half is strong; the *guideline* half is right in substance but factually sloppy.

- **dx failure mode 1 — two ways to scope, ~zero delta (the killer).** fluent-html ships exactly one scoping mechanism: `using _ = ctx.scope(value)` (context.ts:42, 77). For synchronous render it is concurrency-safe, disposes LIFO, and — critically — **disposes on throw**, because that is the defining semantic of TC39 `using`. The RFC sells `scopeReply` on "disposes synchronously in LIFO order even if render throws" (lines 60-62, 220, 319) — all already true of `using`. The only genuine delta is "N contexts in one call," which stacked `using` expresses today with *less* machinery:

  ```ts
  // baseline — already works, no new API, no thunk, no brand:
  server.decorateReply("renderView", function (this: FastifyReply, ...views: View[]) {
    using _a = AuthCtx.scope(this.request.user!);
    using _l = LocaleCtx.scope(this.request.locale);
    this.type("text/html").send(render(...views));
  });
  ```

  The RFC's `scopeReply(() => render(...views), AuthCtx.provide(x), LocaleCtx.provide(y))` is *longer*, adds a render thunk, a free function, a method, and a branded type — to replace two `using` lines. For a library whose CLAUDE.md preaches "one obvious way," a second scoping path with net-negative ergonomics is textbook §13 idea-inflation. An author who knows `using` (the only documented form) now faces a fork with no stated rule for which to reach.

- **dx failure mode 2 — the adoption argument rests on a phantom exemplar.** The claim that "the safe pattern exists, works, and just needs sugar" cites jt-vault-cloud server.ts:101-108 as "already on the safe decorateReply + using pattern" (line 226). The real file (server.ts:92-98) scopes **no** context and uses **no** `using`. If *no* surveyed app scopes context in the decorator at all, the gap is purely a *teaching* gap — which argues for the guideline-only cut, not a new export.

- **dx failure mode 3 — the canonical snippet may not compile.** Every wiring example reads `this.request.user`/`.locale`/`.nonce` inside `decorateReply`; across rideshare, jt-vault, ttl, **no** decorator accesses `this.request`. If `reply.request` isn't populated at decorator-invocation time (or the augmented `FastifyReply` doesn't expose it without a cast), the one snippet every adopter copies is broken — worse than no guideline.

- **dx failure mode 4 — `provide` is a discoverability/misuse magnet.** `provide(value)` returns an opaque branded `ContextProvider` usable *only* by passing it to `scopeReply` — no precedent in the library for "a method returning a deferred, non-applied capability." Autocomplete on `Context<T>` now shows two scoping-ish methods (`scope` → visible `Disposable`, `provide` → sealed box) the names don't disambiguate. And `ContextProvider`, the third `api_surface` symbol, is never taught in any proposed guideline edit — it reads as a free-standing thing an author might try to construct or store.

- **dx failure mode 5 — guideline edits mis-teach and mis-cite.** Beyond the phantom exemplar: (a) `nonce` is listed as a context value across all three edits, but the lib's `renderWithNonce` *injects* nonce attrs — a NonceCtx value does nothing of the sort, so the edit teaches a broken security pattern; (b) the Problem claims CLAUDE.md frames `.setName()` as "equally valid," but CLAUDE.md:91 already says "never untyped `.setName()` when a schema exists" — the index is already fixed, making the proposed CLAUDE.md formFor rewrite a near-no-op; (c) the fluent-html.md Scoped-Context rewrite deletes `using`/`scope()` teaching entirely, so a reader can no longer learn page-local scoping (renderbox example C is exactly that); (d) the `api_surface` signature `scopeReply(reply, ...)` contradicts the body's thunk signature; (e) several cited line offsets are stale.

## Does it survive?

**survives-with-changes**, confidence 0.74. It survives because the *dominant deliverable is correct and high-value*: the context-in-Fastify teaching gap (102 prop-drill sites, a 16-file hand-rolled `createContext` reimplementation, the unsafe `onRequest`/`onResponse` pattern in 6 apps) and the formFor topic-ref softness are real, well-evidenced, and the guideline edits are substantively right and in house style. Killing the whole RFC would discard the adoption fix to punish the over-built code half.

But the code half does not survive *as designed*. `scopeReply` + `provide` + `ContextProvider` is a second scoping path whose advertised benefit is already delivered by `using`, justified by an exemplar that doesn't exist, and demonstrated by a snippet that may not compile. The required changes force prove-or-cut; the recommended outcome is to **collapse to a guideline-only RFC** teaching `using`-in-`renderView` + the existing `formFor`, dropping three symbols from `api_surface`. The adoption win is preserved; the surface is not inflated.

On the §11.8 guideline-edit audit (this lens's duty): the edits **cover every `api_surface` symbol** and use house style (✓/✗, snippet-first, LLM-reader) — so §11.8 passes *if the API ships*. The defects are the nonce mis-teaching, the already-fixed-CLAUDE.md misrepresentation, the dropped `using` teaching, the signature mismatch, and stale offsets — all folded into required_changes. If the recommended cut lands, `api_surface` → [] and the obligation narrows to two clean pure-teaching edits.

## Guardrail check (this lens audits §11.8 guideline-sync + §13 "worth the surface")

- **§11.8 guideline-sync:** PASS-conditional. Every proposed symbol has a matching ✓/✗ index rule + topic-ref section; house style honored. Conditional on removing the nonce mis-teaching, correcting the CLAUDE.md:91 misrepresentation, restoring `using` teaching, fixing the signature, and the line offsets.
- **§13 "is this worth the surface area?":** FAIL for the code half as designed — `scopeReply`/`provide`/`ContextProvider` duplicate `using` with net-negative ergonomics. Resolved only by prove-or-cut. The guideline half is clearly worth it.
- No independent type-safety, escape, or backward-compat objection from this lens (additive; emits no markup) — those are other panels' calls.
