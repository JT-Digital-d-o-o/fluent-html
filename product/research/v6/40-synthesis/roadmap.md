# fluent-html v6 — Roadmap

> **Wave-4 deliverable.** Milestone-sequenced (v6.0 / v6.1 / v6.x), prioritized (P0/P1/P2), in dependency order, with effort and the §8 score. Covers **all 37 surviving RFCs**.
> **Scoring (ALGORITHM §8):** `score = impact(1–3) × pain(1–3) × reach(apps, capped 3) / effort(S=1,M=2,L=3,XL=5)`. Ties: additive before breaking, then fewer `depends_on`.
> **Breaking-change bundling:** every breaking change is concentrated in **v6.0** so adopters run the migration once (see `breaking-changes.md`). v6.1+ is purely additive.

---

## 1. Sequencing principles

1. **Foundations first.** Four infrastructure spines underpin everything and land in v6.0: the de-recursed/unified emitter (**D-01 → D-03**), the Tailwind vocab + target switch (**C-05 → C-03 → C-01**), the context primitive (**A-05**), and the `_sk` attribute serializer (**A-01 + A-03**).
2. **Bundle the breaking changes.** The breaking RFCs — **A-01, A-02, A-09, B-07, B-09, C-02, C-03, D-01, D-04, D-06** — all ship in **v6.0** behind one migration. Nothing breaks again after v6.0.
3. **Owners before consumers.** B-07 (decorator) before B-08/B-09; B-02 (`BehaviorMap`) before B-01/A-08; A-06 (`Document`) before B-04; C-03 (target) before B-03's `.gradient()`; C-05 vocab rows in the **same milestone** as any new class-emitting method (A-07/A-09/B-03/B-04); D-05 (`escapeJs`) before A-08/B-02 consume it.
4. **Fold-ins ship with their owner.** A-G2's `setAria` code rides A-02; A-G5's `scopeReply` rides A-05; C-02's target mechanism rides C-03. Their *teaching* lands in `guidelines-update.md` at the same milestone.
5. **Gate the unproven.** B-08's `Deferred()` ships as round-trip deferral in v6.1 and is usable under plain `renderView`; its true-streaming early-flush benefit is **gated on D-02** (which is a hard `depends_on` D-01, also v6.0).

---

## 2. Milestone summary

| Milestone | Theme | RFCs |
|---|---|---|
| **v6.0** | Correctness + the single breaking migration + all foundation spines | **A-01, A-02, A-03, A-05, A-07, A-09, A-G1, A-G2, A-G4, B-07, C-01, C-02, C-03, C-04, C-05, C-06, D-01, D-02, D-03, D-04, D-05, D-06, D-07** |
| **v6.1** | New full-stack surface (purely additive) | **A-04, A-06, A-08, A-G3, A-G5, B-01, B-02, B-03, B-04, B-05, B-06, B-08, B-09** |
| **v6.x** | Polish + follow-on adoption codemods | optional Track-A/C codemods; the `defineTypographyScale`/`Text` sibling RFC split from B-03 |
| **deferred** | Gated on future work | the `v4`-default flip (v7); B-08 `Deferred()` *early-flush* perf claim (lands the moment D-02 is consumed) |

**Why this split.** v6.0 is deliberately the "internals + breaking + Tailwind-v4 + the `_sk`/ARIA/context primitives" release — everything that is either breaking or a spine others stand on. v6.1 is the "new components and full-stack APIs" release: all additive, all building on v6.0 owners, zero migration. This keeps the migration single and front-loads the risky structural work.

---

## 3. v6.0 — Foundations, Tailwind v4, and the single breaking migration

All breaking changes live here. The internal spines (D-track + C-track + the `_sk` and context primitives) must land before the additive surface in v6.1 can build on them.

### 3a. Track D — the render-core spine (lands first; everything serializes on it)

| RFC | Title | Breaking | Effort | Score | Depends on |
|---|---|---|---|---|---|
| **D-01** | Renderer de-recursion (work-stack) + `Frozen()` | breaking | L | 3×3×3 / 3 = **9.0** | — (foundation) |
| **D-03** | Dedup render/stream into one emitter | additive | L | 3×2×3 / 3 = **6.0** | **D-01** |
| **D-05** | Fold/unfold algebra hardening + `escapeJs`/`validateAttributeKey` | additive | M | 3×3×3 / 2 = **13.5** | D-03 (lands logic in the single emitter) |
| **D-04** | Render-time CSP nonce — non-mutating, single-pass | breaking | M | 3×2×3 / 2 = **9.0** | **D-01** (Frozen guard), D-03 (emitter), D-07 (`RawCtx`) |
| **D-06** | Construction allocation cleanup — monomorphic Tag | breaking | M | 2×2×3 / 2 = **6.0** | D-03/D-05 (`escapeQuotedAttr` routing) |
| **D-07** | Typed prototype writes, `getAttr`, `setStyles` (unchanged), `RawCtx` | additive | M | 2×2×3 / 2 = **6.0** | D-01 (`RawCtx`), A-09 (Overlay dedup) |
| **D-02** | True backpressure streaming — `renderToStream`/`renderToIterable` | additive | L | 2×2×3 / 3 = **4.0** | **hard `depends_on` D-01** |

**Priority:** **D-01 P0** (foundation; un-crashes deep trees; owns the emitter shape). **D-03 P0** (the unification that makes "patch one path" correct — every attribute RFC folds into it). **D-05 P0** (owns `escapeJs`/`validateAttributeKey`; closes 3 injection holes; A-08/B-02 in v6.1 consume it). **D-04 P1**, **D-06 P1** (consume the spine; bug-fix output deltas bundled), **D-07 P1** (additive — typed seams + bench; no behavior change). **D-02 P2** (un-gates `Deferred()` streaming but is itself a hard dep on D-01; lowest score this milestone, ship last).

### 3b. Track C — Tailwind v4 vocabulary, switch, extractor, lint

| RFC | Title | Breaking | Effort | Score | Depends on |
|---|---|---|---|---|---|
| **C-05** | Shared class-vocab codegen (`@fluent-html/class-vocab`) | additive | L | 3×2×3 / 3 = **6.0** | — (vocab source of truth) |
| **C-03** | v4 utility-rename + scale-shift + semantic methods | breaking | L | 3×3×3 / 3 = **9.0** | **C-05** (`TailwindTarget`) |
| **C-01** | Extractor redesign: safelist emitter + Vite/PostCSS plugin | additive | L | 3×3×3 / 3 = **9.0** | C-03 (target), C-05 (vocab) |
| **C-04** | ESLint plugin v4 map regeneration | additive | M | 2×2×3 / 2 = **6.0** | C-03 (target), C-05 (vocab) |
| **C-06** | Variant type-table regen (`not-*`, container-query, hover-pointer) | additive | S | 2×2×3 / 1 = **12.0** | C-01 (extractor scan), C-02 (target) |
| **C-02** | v4 pipeline/config migration (FOLD-IN target → C-03) | breaking | L | 3×3×2 / 3 = **6.0** | C-03 (target mechanism) |

**Priority:** **C-05 P0** (the single vocabulary source; the drift test turns guardrail §11.7 into CI; A-07/A-09/B-03/B-04's new utilities are rows here). **C-03 P0** (owns the runtime switch; the only inherently-breaking Tailwind RFC; default `v3` keeps install byte-identical). **C-01 P0** (without the safelist emitter, v4 silently unstyles every app). **C-04 P1**, **C-06 P1**, **C-02 P1** (consume the target; C-02 retains config-migration only). **Hard rule:** the C-05 vocab rows for the class-emitting methods land **with** those methods — A-07/A-09 here in v6.0, B-03/B-04 in v6.1 carry their rows then.

> **The C-01↔C-02 cycle is broken** by routing through C-05: `C-05 → C-03 → C-01`. C-02 depends on C-03 for the target and contributes config-migration only.

### 3c. Track A — `_sk` serializer, ARIA, context, Tailwind correctness (P0 breaking spine)

| RFC | Title | Breaking | Effort | Score | Depends on |
|---|---|---|---|---|---|
| **A-02** | ARIA/role/global setters + `setAria` typing + `ariaDescribe` fix | breaking | S | 3×2×3 / 1 = **18.0** | D-03 (emitter; parity test) |
| **A-01** | Boolean-attr serialization + unify `.toggle()` | breaking | M | 3×3×3 / 2 = **13.5** | D-03 (3-path emitter), A-03 (`_sk` tuple) |
| **A-05** | Context lifecycle hardening (absorbs A-G5 code) | additive | M | 3×3×3 / 2 = **13.5** | — |
| **A-07** | Tailwind negatives/transforms/position+display shortcuts | additive | S | 3×2×3 / 1 = **18.0** | C-05 (vocab rows), C-01/C-04 (lockstep) |
| **A-03** | Element-setter coverage + `_sk` tuple + camelCase + `crossorigin` | additive | M | 2×2×3 / 2 = **6.0** | D-03 (third render path), C-04 (eslint map lockstep) |
| **A-09** | Type-only exports + variadic/fluent Overlay (class output) | breaking | S | 2×2×3 / 1 = **12.0** | C-05/C-06 (fractional translate/inset vocab), D-07 (dedup) |
| **A-G2** | Retire `addAttribute` aria/data/style (ESLint) — FOLD-IN → A-02 | additive | M | 3×2×3 / 2 = **9.0** | A-02 (`setAria` owner) |
| **A-G1** | Control-flow anti-pattern teaching | guideline | S | 3×2×3 / 1 = **18.0** | A-04 examples (ideally land together; can ship other ✗ forms first) |
| **A-G4** | Display/variant teaching + addClass purge + error rename | guideline | S | 3×2×3 / 1 = **18.0** | — |

**Priority:** **A-02 P0** (highest score 18.0; retires ~300 `addAttribute` sites; fixes the `ariaDescribe` bug; breaking type-narrowing rides the bundle). **A-01 P0** (the one true serialization break; ships with `prefer-toggle`/`no-set-toggles` codemods; setters `@deprecated`-not-removed). **A-05 P0** (unblocks every per-request-context consumer in v6.1 — A-G5/B-04/B-07; non-breaking but foundational). **A-07 P0** (18.0; the silently-dropped `-translate-y-1` bug; lockstep with C-05/C-01/C-04). **A-03 P1** (the `_sk` tuple base for A-01; eslint-map lockstep with C-04). **A-09 P1** (Overlay class-output break; gated on C-06 vocab; dedups D-07). **A-G2 P1** (ESLint enforcement; `setAria` folds to A-02). **A-G1/A-G4 P1** (guideline-only; cheapest, highest-leverage; land while the migration is in front of adopters; use real type names `TailwindState`/`TailwindBreakpoint`).

### 3d. Track B — the Fastify decorator owner (the one Track-B item in v6.0)

| RFC | Title | Breaking | Effort | Score | Depends on |
|---|---|---|---|---|---|
| **B-07** | `@fluent-html/fastify` plugin/auth/errors/AuthShell | breaking | L | 3×3×3 / 3 = **9.0** | A-05 (context in `renderView`) |

**Priority:** **B-07 P0.** It is **MERGE-OWNER of the reply decorator** and reclassified **breaking** (no library `declare module "fastify"`; cookie-name default; decorator double-registration). Pulling it into the v6.0 bundle means adopters migrate the Fastify augmentation exactly once, and B-08/B-09 (which only *extend* B-07's single `renderView` signature) stay purely additive in v6.1.

> **v6.0 migration gate:** the breaking set ships together — A-01, A-02, A-09, B-07, B-09(*see note*), C-02, C-03, D-01, D-04, D-06 — with every codemod (`prefer-toggle`, `no-set-toggles`, the v4 ESLint auto-fixes, the Overlay/nonce migration notes). See `breaking-changes.md`. (D-07 is additive — no migration.)

> **Note — B-09.** B-09 (request-context render overload) is reclassified breaking (renderView contract narrowing). It owns `RenderOptions.contexts` which *extends D-04's `RenderOptions`*. Because D-04 is already v6.0, B-09's render-options surface is most naturally bundled into the v6.0 migration even though its *component* value (i18n, request-scoped context) is a v6.1-flavored feature. **Resolution:** ship B-09's `RenderOptions.contexts` + `renderView({contexts})` decorator-signature change in **v6.0** (with D-04, one decorator-shape migration), and ship the i18n companion (`createI18nContext`/`i18nPlugin`) as additive in **v6.1**. This keeps the renderView signature changing exactly once.

---

## 4. v6.1 — New full-stack surface (purely additive)

Everything here is additive; no migration. Sequenced so owners precede consumers. The hard intra-milestone ordering is at the bottom.

### P0 — the high-frequency boilerplate killers

| RFC | Title | Breaking | Effort | Score | Depends on |
|---|---|---|---|---|---|
| **A-04** | `ForEachOr` + `Tag.whenElse` | additive | S | 3×3×3 / 1 = **27.0** | — |
| **B-02** | Overlay & behavior system (Modal/Drawer/Toast + behaviors) | additive | L | 3×3×3 / 3 = **9.0** | C-05/C-01/C-04 (overlay vocab, v6.0), D-05 (`escapeJs`, v6.0) |
| **B-01** | Form system (FormField/FieldError/FormErrors/theme) | additive | L | 3×3×3 / 3 = **9.0** | B-02 (`resetOnSuccess`) |
| **B-03** | Semantic components (Alert/Badge/Card/`.gradient()`) | additive | L | 3×3×3 / 3 = **9.0** | C-03 (`.gradient()` target), C-05 (status palette vocab), B-02 |
| **B-04** | Layout primitives (Shell/Container/NavItem/LoadingBar) | additive | L | 3×3×3 / 3 = **9.0** | A-06 (`Document`), A-05 (context), C-05/C-01 (`.container()`/`htmx-indicator` vocab) |
| **A-06** | `Document()` + SEO head + DOCTYPE | additive | M | 3×3×3 / 2 = **13.5** | D-03 (doctype in all 3 emit paths) |

### P1 — broad value, builds on P0 owners

| RFC | Title | Breaking | Effort | Score | Depends on |
|---|---|---|---|---|---|
| **A-G3** | HTMX option discoverability + `applyTo` adapter | additive | S | 3×2×3 / 1 = **18.0** | B-08 (`applyTo` owner), A-03 (`setCrossOrigin`) |
| **A-08** | `.hxOn()` + lifecycle behaviors | additive | M | 3×2×3 / 2 = **9.0** | B-02 (`BehaviorMap`), D-05 (`escapeJs`) |
| **A-G5** | Context-in-Fastify + auth context + `formFor<T>` (adoption) | additive | S | 3×2×3 / 1 = **18.0** | A-05 (lifecycle owner) |
| **B-08** | `renderView(opts)` + `applyTo` + `Deferred()` | additive | M | 3×2×3 / 2 = **9.0** | B-07 (decorator), B-03 (`Skeleton`), D-02 (streaming benefit only) |
| **B-09** | i18n companion (`createI18nContext`/`i18nPlugin`) | additive | L | 3×2×3 / 3 = **6.0** | B-07 (decorator), A-05 (context) — *render-options part shipped in v6.0* |
| **B-06** | `Table.of()` data-grid + Pagination | additive | L | 3×3×3 / 3 = **9.0** | B-03 (`Badge` in column example) |
| **B-05** | Icon registry + SVG element coverage | additive | L | 3×3×2 / 3 = **6.0** | A-03 (`_sk` SVG coordination), D-03 (emitter parity) |

> **Note on score vs placement.** **A-04 scores highest in the whole program (27.0)** — high impact/pain across 377+ paired-call sites, S effort, zero deps. It is additive and could ship in v6.0; it is placed in v6.1 only to keep v6.0 breaking-focused. **Promote A-04 (and A-06) into v6.0 if there is headroom** — both are zero-risk additive wins. A-G3 (18.0) and A-G5 (18.0) are guideline-heavy adoption fixes gated only on v6.0 owners.

### Hard intra-milestone ordering (v6.1)

```
A-06 ──► B-04                         (Document → Shell)
A-05 ──► B-04, A-G5                   (context wiring; A-05 itself is v6.0)
B-02 ──► B-01, B-03, A-08             (BehaviorMap owner)
B-07 ──► B-08, B-09                   (renderView decorator; B-07 itself is v6.0)
B-08 ──► A-G3                         (applyTo owner)
B-03 ──► B-06, B-08                   (Badge example, Skeleton)
A-03 ──► B-05, A-G3                   (_sk SVG; setCrossOrigin)  [A-03 is v6.0]
D-02 ┄┄► B-08 Deferred() streaming    (perf benefit only; D-02 is v6.0)
```

---

## 5. v6.x — Polish & follow-on codemods

Optional, lazy-adoption, no migration pressure. Pulled from RFC "Open questions" / optional-codemod sections.

| Item | Source | Effort |
|---|---|---|
| Codemod: raw `addClass("-translate-…")` → `.translate()`/`.neg()`; `position("fixed")` → `.fixed()` | A-07 | S |
| Codemod: paired `IfThen(len>0)`+`IfThen(len===0)` → `ForEachOr`; `.when(c)+.when(!c)` → `.whenElse` (review-required where falsy-non-null) | A-04/A-G1 | S |
| **`defineTypographyScale`/`Text` sibling RFC** (split out of B-03 to avoid idea-inflation) | B-03 | M |
| Lazy codemod: `addAttribute("data-*"\|"aria-*")` → `setDataAttrs`/`setAria` (round-trip-safe keys only) | A-G2 | S |

---

## 6. Deferred — gated on future work

| Item | Gate | Owner |
|---|---|---|
| **B-08 `Deferred()` early-flush** ("shell flushes immediately") | **D-02** being consumed by the Fastify stream path. The `Deferred()` *tag* ships in v6.1 as round-trip deferral; only the streaming perf claim waits. | B-08 + D-02 |
| **Flip default `TailwindTarget` to `"v4"`** | A major (v7) — it is the second deliberate breaking flip. v6 ships default `v3`. | C-03 |
| **Removal of `@deprecated` boolean setters / lowercase setter aliases** | v7 (the un-codemodded v5.9 `setToggles` removal froze 11 apps — v6 deprecates, v7 removes). | A-01/A-03 |

---

## 7. Full RFC ledger (37 RFCs, sorted by score within milestone)

| RFC | Milestone | Priority | Breaking | Effort | Score | ships_with |
|---|---|---|---|---|---|---|
| A-02 | v6.0 | P0 | breaking | S | 18.0 | A-01, A-09, C-03, D-01 (migration bundle) |
| A-07 | v6.0 | P0 | additive | S | 18.0 | C-05, C-01, C-04 (vocab lockstep) |
| A-G4 | v6.0 | P1 | guideline | S | 18.0 | — |
| A-G1 | v6.0 | P1 | guideline | S | 18.0 | A-04 (examples) |
| A-01 | v6.0 | P0 | breaking | M | 13.5 | A-02, A-03, C-03 (migration bundle) |
| A-05 | v6.0 | P0 | additive | M | 13.5 | A-G5 (fold-in) |
| D-05 | v6.0 | P0 | additive | M | 13.5 | D-03 |
| C-06 | v6.0 | P1 | additive | S | 12.0 | C-01, C-03 |
| A-09 | v6.0 | P1 | breaking | S | 12.0 | C-05, C-06, D-07 |
| D-01 | v6.0 | P0 | breaking | L | 9.0 | — (foundation) |
| C-03 | v6.0 | P0 | breaking | L | 9.0 | C-05, C-01, C-02, C-04 |
| C-01 | v6.0 | P0 | additive | L | 9.0 | C-03, C-05 |
| B-07 | v6.0 | P0 | breaking | L | 9.0 | A-05 |
| D-04 | v6.0 | P1 | breaking | M | 9.0 | D-01, D-03, D-07 |
| A-G2 | v6.0 | P1 | additive | M | 9.0 | A-02 |
| A-03 | v6.0 | P1 | additive | M | 6.0 | A-01, C-04 |
| C-05 | v6.0 | P0 | additive | L | 6.0 | — (vocab source) |
| C-04 | v6.0 | P1 | additive | M | 6.0 | C-03, C-05 |
| C-02 | v6.0 | P1 | breaking | L | 6.0 | C-03 |
| D-03 | v6.0 | P0 | additive | L | 6.0 | D-01 |
| D-06 | v6.0 | P1 | breaking | M | 6.0 | D-03, D-05 |
| D-07 | v6.0 | P1 | additive | M | 6.0 | D-01, A-09 |
| D-02 | v6.0 | P2 | additive | L | 4.0 | D-01 (hard) |
| A-04 | v6.1 | P0 | additive | S | 27.0 | — |
| A-G3 | v6.1 | P1 | additive | S | 18.0 | B-08, A-03 |
| A-G5 | v6.1 | P1 | additive | S | 18.0 | A-05 |
| A-06 | v6.1 | P0 | additive | M | 13.5 | D-03 |
| B-02 | v6.1 | P0 | additive | L | 9.0 | C-05, D-05 |
| B-01 | v6.1 | P0 | additive | L | 9.0 | B-02 |
| B-03 | v6.1 | P0 | additive | L | 9.0 | C-03, C-05, B-02 |
| B-04 | v6.1 | P0 | additive | L | 9.0 | A-06, A-05, C-05 |
| B-06 | v6.1 | P1 | additive | L | 9.0 | B-03 |
| B-08 | v6.1 | P1 | additive | M | 9.0 | B-07, B-03, D-02 |
| A-08 | v6.1 | P1 | additive | M | 9.0 | B-02, D-05 |
| B-05 | v6.1 | P1 | additive | L | 6.0 | A-03, D-03 |
| B-09 | v6.1 | P1 | additive | L | 6.0 | B-07, A-05 (render-options part in v6.0) |

¹ Breaking RFCs (A-01, A-02, A-09, B-07, B-09-render-options, C-02, C-03, D-01, D-04, D-06) all bundle into the single v6.0 migration. Every other RFC is additive with optional/lazy codemods.

---

*Traceability: `roadmap.md → RFC.resolves → F-*.evidence → app file:line`. Breaking entries → `breaking-changes.md`. Guideline staging → `guidelines-update.md`. Cross-track ownership → `_merge.md` §2–§6.*
