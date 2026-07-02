# fluent-html v6.0.1 / 6.1.0 — Post-Release Review

A scaled-down rerun of the [v6.0.0 multi-wave algorithm](../v6.0.0/ALGORITHM.md), aimed at **polishing the shipped v6 core** — fixing what's wrong (→ **6.0.1**), and adding the additive, evidence-driven wins (→ **6.1.0**) without re-opening v6's settled architecture.

**The algorithm is the spec:** [`ALGORITHM.md`](./ALGORITHM.md). Read it first.

---

## What shipped (the baseline we're reviewing)

v6.0.0 landed the whole **P1–P4 core**: the `serialize.ts` render spine (de-recursion, backpressure streaming, CSP nonce, `escapeJs`), the Tailwind-v4-native `class-vocab` → extractor → `defineTheme()` pipeline, the core DX/API surface (`.toggle()`, typed ARIA, `_sk` tuple setters, position/display shortcuts, `.overlay()`, `ForEachElse`/`whenElse`, `Document()`, typed `.hxOn()`), and the keeper primitives (`Form<T>`, native dialog behaviors, full SVG coverage, `.htmxIndicator()`).

**Out of scope** (deliberately deferred to *separate future packages*, not this review): P5 `@fluent-html/fastify` (context system + render adapter) and P6 `@jtdigital/ui` / `@jtdigital/web` (the cut visual components, auth, i18n). This review targets the **shipped core package only**.

## The four tracks

| Track | Mission | Ships to |
|-------|---------|----------|
| **A — Correctness & Polish** | Hunt real bugs, regressions, and inconsistencies in the shipped v6.0.0 code (render spine, `_sk`/escape, htmx 4 serialization, routes, class-vocab/extractor drift, streaming, context lifecycle, the parked B-06 filter-reset bug, docs-vs-reality drift). The patch core. | **6.0.1** |
| **B — HTML Platform Coverage** | Apply the *latest* HTML/ARIA/web-platform standards as typed primitives: Popover API, invoker commands (`command`/`commandfor`), dialog `closedby`, `<search>`, customizable `<select>`/`<selectedcontent>`, `inert`, `hidden=until-found`, `<details name>`, `inputmode`/`enterkeyhint`, `fetchpriority`/`loading`, CSS-platform hooks. | **6.1.0** |
| **C — DX Patterns & Abstractions** | The *creative* track: combinators that make UI authoring faster, easier, less error-prone — control-flow ergonomics, composition helpers, form/iteration sharpening. **Primitives, not opinionated components** — but the door is open to re-litigate whether a few cut component-level helpers earn a *primitive* form in core (high bar). | **6.1.0** |
| **D — Type Safety & API Surface** | Sharpen the public types: literal-union attribute values vs bare `string`, internal `as any` removal, generic/inference sharpening (`Form<T>`, `defineRoutes` params, `defineTheme` tokens), branded IDs, naming/consistency, type-level tests, JSDoc hygiene. | **6.0.1 / 6.1.0** |

> **Cross-cutting — Guidelines & lib-own docs.** Every new/changed surface ships with its `guidelines/web-development/**` edit *and* its library-own docs (README / JSDoc / CHANGELOG). Output: `40-synthesis/guidelines-update.md` + `40-synthesis/changelog-draft.md`.

## How it runs (waves)

```
Wave 0  Recon          2 agents   → 00-recon/        shipped-surface baseline + HTML-platform landscape
Wave 1  Discovery    ~19 agents   → 10-discovery/    atomic findings, distinct angles, loop-until-dry (capped)
Wave 1.5 Cluster       1 agent    → _clusters.md     dedup + cluster into RFC-sized units (barrier)
Wave 2  Design       ~10 agents   → 20-design/       one RFC per surviving cluster
Wave 3  Verify       ~16 agents   → 30-verification/ adversarial; 3-lens panel for high-impact, refute-by-default
Wave 4  Synthesis      4 agents   → 40-synthesis/    spec + roadmap (6.0.1/6.1.0/parked) + guidelines + changelog
                       ─────────
                       ~50 agents, one markdown artifact each
```

## Guardrails (the v6 constitution, post-release form)

1. **Zero runtime dependencies** in the lib package.
2. **SSR-only, synchronous hot path stays fast** — any async stays opt-in.
3. **Escape-by-default; no XSS regressions** — verified by the `security/escape` lens.
4. **Type-safety first** — no bare `string` where a literal union fits.
5. **Additive-only here** — 6.0.1 = behavior fixes (no public-shape change), 6.1.0 = additive. **Breaking ideas are parked** for a future major, never smuggled into a patch/minor.
6. **Instruction-set, not components** — ship primitives/combinators; Modal/Alert/Table/Badge/Icon stay user-land. Track C may *argue* for a component-level primitive, but must clear a high bar (true leverage point, not opinion).
7. **The class-string contract** — any new class-emitting method updates the extractor + eslint vocab in lockstep.
8. **The guideline-sync contract** — every public-surface change carries its `web-development/**` + lib-own-docs edit. An un-taught API is an un-adopted API.

## Folder map

```
v6.0.1/
├── ALGORITHM.md      ← the scaled-down algorithm (start here)
├── README.md         ← this file
├── templates/        ← finding / rfc / verdict / roadmap-entry schemas
├── 00-recon/         ← Wave 0
├── 10-discovery/     ← Wave 1 findings, by track
├── 20-design/        ← Wave 2 RFCs, by track
├── 30-verification/  ← Wave 3 verdicts
└── 40-synthesis/     ← Wave 4: v6.0.1-spec, roadmap, guidelines-update, changelog-draft
```
