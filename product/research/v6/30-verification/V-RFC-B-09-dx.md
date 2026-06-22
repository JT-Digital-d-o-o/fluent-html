---
rfc: RFC-B-09
lens: dx
verdict: survives-with-changes
confidence: 0.72
killer_objection: null
required_changes:
  - "Resolve the `RenderOptions.nonce` vs existing `renderWithNonce(nonce, ...views)` overlap: state whether `render({ nonce }, ...)` supersedes/deprecates `renderWithNonce`, and add the nonce path to the guideline edit (it is silently in `api_surface` via `RenderOptions` but taught nowhere). Currently the RFC introduces a second way to apply a nonce with zero migration story — a textbook dx inconsistency."
  - "Split or explicitly justify the bundle. Two independently-adoptable concerns (the async-context bridge: `entry`/`render(opts)`/`seedContext`/`renderView`; and the i18n companion: `createI18nContext`/`i18nPlugin`/`TranslationKey`) ship as one RFC with 7 api_surface symbols. The i18n companion is strictly downstream of the bridge. At minimum, mark the i18n half as a separately-roadmappable sub-unit so the bridge can ship in v6.0 without waiting on the larger i18n surface."
  - "Fix the fastify.md guideline edit: it shows a `collectContexts(this.request, opts)` helper that is never defined in api_surface and never shown. Either inline the canonical 3-line implementation (the RFC body has it: spread `request[kContexts]` + `opts.contexts`) or name it as a real exported symbol. As written, the LLM reader cannot copy-paste a working decorator — the #1 thing this guideline must deliver verbatim."
  - "The fastify.md augmentation edit shows `opts?: { contexts?: ContextEntry[] }` but does not import/qualify `ContextEntry`, `View`, or `render`. The current fastify.md augmentation block (line 62) is self-contained; the replacement references three lib symbols with no import line. Add the import the LLM must write, or the edit produces a non-compiling augmentation."
  - "Add the missing ✓/✗ for `createRequiredContext` + `seedContext` interaction. `seedContext`'s `load` can early-return the default (the rideshare example returns `NavCtx.current`), but if an app seeds a `createRequiredContext`, an unauthenticated request where `load` cannot produce a value will throw at render — a sharp edge the guideline does not warn about. Add a ✗ line: never seed a required context with a loader that can fail to produce a value."
  - "Name `entry()` in the index (CLAUDE.md) edit, not only in fluent-html.md. It is the type-safe constructor for the low-level `render({ contexts })` path the index snippet implicitly relies on; an LLM reading only the index sees `seedContext` but never learns the manual `entry(Ctx, v)` form for one-off/test renders, which the RFC itself calls the necessary escape hatch."
---

# Verdict: RFC-B-09 — dx lens

> You are an ADVERSARY. Your job is to KILL this RFC through the dx lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

This RFC solves a real, well-evidenced pain (the storysell ALS violation and the rideshare 50-site prop-drill are genuine "library forced me off the happy path" findings). It does not die on *value*. It is attackable on *surface coherence* and on a guideline edit that is close but not copy-pasteable — both squarely dx failure modes.

- **dx failure mode 1 — undisclosed second-way-to-do-it for `nonce`.** The library already ships `renderWithNonce(nonce, ...views)` (`src/render/render.ts:49`). The RFC's `RenderOptions` (proposed API §1) adds `nonce?: string` to the new options object, so `render({ nonce }, view)` becomes a *second* nonce path — yet the RFC never mentions `renderWithNonce`, never says which wins, and the Guidelines impact section never teaches the options-bag nonce at all. This is the exact "is this consistent with library idioms / hard to misuse" failure the dx lens owns: an app author now has two ways to apply a nonce, the guideline teaches neither clearly, and a reader cannot tell whether `renderWithNonce` is deprecated. Guardrail §11.6 (idiom consistency) and §11.8 (guideline-sync: "covers every `api_surface` symbol") are both nicked here — `nonce` rides into `api_surface` via `RenderOptions` but is taught nowhere. The §11.8 self-check in the RFC enumerates every symbol *except* this one.

- **dx failure mode 2 — the bundle inflates the surface decision.** Seven `api_surface` symbols across two separable concerns land as one yes/no. The async-context bridge (`entry`, `render(opts)`, `renderToStream(opts)`, `renderView(view,{contexts})`, `seedContext`) is the load-bearing primitive; the i18n companion (`createI18nContext`, `i18nPlugin`, `TranslationKey`, plus a subpath export and a peer-dep decision) is a strictly-downstream convenience that the RFC's own Open Questions leave unresolved (sample-source tsconfig requirements, interpolation typing, whether a `fluent-html/fastify` subpath is even in scope for v6). "Is this worth the API surface area?" (§13 idea-inflation guard) is harder to answer honestly when a clean primitive is stapled to a larger, less-settled scaffold. The bridge would survive on its own merits; the i18n half is dragging unresolved open questions into the same verdict.

- **dx failure mode 3 — the guideline edit is not copy-pasteable.** The fastify.md edit shows `render({ contexts: collectContexts(this.request, opts) }, view)` — but `collectContexts` is neither in `api_surface` nor shown anywhere. The guideline reader is an LLM that copies verbatim; it cannot copy a call to an undefined helper. Separately, the replacement augmentation line references `ContextEntry`/`View` with no import, where the *current* line is self-contained. A guideline edit that yields a non-compiling decorator is an adoption failure by the RFC's own §11.8 standard ("an un-taught API is an un-adopted API"). This alone forces at least `survives-with-changes`.

- **dx failure mode 4 — naming / sharp-edge gaps.** `seedContext` reads well and the storysell/rideshare before-afters are convincing, so naming is mostly right. But the guideline never warns that seeding a `createRequiredContext` with a loader that can fail (the auth-less request) throws at render — exactly the population the rideshare/storysell examples hit. And the index edit teaches `seedContext` without ever naming `entry()`, the one-off/test escape hatch the RFC itself says is necessary (Alternatives: "apps still need an explicit per-render escape hatch ... in tests").

## Does it survive?

**Yes — survives-with-changes.** The core dx case is strong: it deletes a documented guideline violation and a 50-site prop-drill, the `seedContext` ergonomics genuinely beat both ALS and prop-drilling, and the naming is idiomatic (`createContext` → `seedContext` → `.current` reads cleanly). No killer objection survives: nothing here is unfixable, and the value is real and well-cited. But it is not shippable as-drafted because (a) it silently forks the `nonce` API and teaches the fork nowhere, (b) its flagship guideline edit references an undefined helper and an unimported type, and (c) it bundles an unsettled i18n scaffold into the same verdict as a clean primitive. Each is a concrete, mechanical fix; folded back, the RFC is strong. See `required_changes`.

## Guardrail check (dx owns §11.8 guideline-sync audit)

- **§11.8 — FAIL as drafted, fixable.** The RFC claims "covers every `api_surface` symbol," but `RenderOptions.nonce` is an effective public symbol (it changes `render`'s behavior and overlaps `renderWithNonce`) and is taught in none of the three files. The fastify.md edit also references `collectContexts`, a symbol that exists in neither `api_surface` nor the shown code. Both must be resolved for the §11.8 contract to actually hold.
- **§11.6 — idiom consistency, marginal.** The fluent `seedContext`/`render(opts)`/`renderView(view, opts)` shapes match the library voice. The lone idiom break is the dual nonce path (see required_changes #1); resolve it and §11.6 passes cleanly.
- The other guardrails (zero-deps, ssr-only, escape-by-default, type-safety, backward-compat) are out of this lens and the RFC's self-checks on them look sound; the perf and security lenses own their verification.
