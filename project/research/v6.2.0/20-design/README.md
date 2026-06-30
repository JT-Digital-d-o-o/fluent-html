# v6.2.0 RFC index (20-design)

21 RFCs, each produced by a multi-agent pipeline: **author(s) → assemble → adversary → finalize**. Every RFC was red-teamed by one adversary (house `verdict` format, default-reject); the verdict's `required_changes` were folded back into the final RFC. Adversary verdicts live in [`../30-verification/V-RFC-*.md`](../30-verification/). Source roadmap: [`../40-synthesis/v6.2.0-roadmap.md`](../40-synthesis/v6.2.0-roadmap.md) (re-scoped against the template — see [`../40-synthesis/template-cross-reference.md`](../40-synthesis/template-cross-reference.md)).

**Outcome:** 19 `proposed` (survived with changes) · 2 `needs-redesign` (adversary reject) · 0 passed clean — every RFC required changes.

## Track C — Tailwind v4 (10)

| RFC | Title | Status | Impact/Effort | Adversary's key cut/fix |
|---|---|---|---|---|
| [C-01](track-c/RFC-C-01.md) | Color-family methods (SVG paint, accent/caret, decoration, color-scheme) | ✅ **implemented** | M/M | shipped as `fillColor`/`strokeColor` (renamed off the `SvgTag`/`SvgShapeTag` fields that broke the build) |
| [C-02](track-c/RFC-C-02.md) | Sizing & spacing shorthands (`size`, axis inset, logical inset) | ✅ **implemented** (`size()` deferred) | M/M | `insetX`/`insetY`/`insetS`/`insetE` shipped; `size()` deferred — collides with the `<select size>` instance field (same class of break as C-01) |
| [C-03](track-c/RFC-C-03.md) | Typography & text effects (`textWrap`, `hyphens`, `textShadow`) | ✅ **implemented** | **High**/M | size-opacity `text-shadow-lg/30` form folded into the union |
| [C-04](track-c/RFC-C-04.md) | Shadows, filters & blending (10 primitives) | ✅ **implemented** | M/M | `dropShadow`/`insetShadow` now **require a value** (no dead bare classes) |
| [C-05](track-c/RFC-C-05.md) | Transitions & discrete animation (`delay`, `transitionBehavior`) | ✅ **implemented** | M/M | existing `.on("starting", …)` seam documented, not re-spelled |
| [C-06](track-c/RFC-C-06.md) | Tailwind v4 gradients (stops, angles, conic/radial, interpolation) | ✅ **implemented** | **High**/L | `gradientLinear(angle)` made the **sole** linear-angle path; `(string & {})` escape closed |
| [C-07](track-c/RFC-C-07.md) | 3D transform bundle (per-axis rotate/scale/translate + 3D gates) | ✅ **implemented** | M/L | order-sensitive eslint reverse-fix lockstep |
| [C-08](track-c/RFC-C-08.md) | Variants & selectors on `.on()`/`.at()` (aria/data/group/peer/nth/container) | ✅ **implemented** | **High**/L | closes the typo holes that force raw `setClass` |
| [C-09](track-c/RFC-C-09.md) | Layout: grid placement, multi-column, scroll, field-sizing | ✅ **implemented** | **High**/L | negative grid lines via `signNeg` |
| [C-10](track-c/RFC-C-10.md) | Tailwind v4.1 `mask*` utilities | ✅ **implemented** | M/M | shipped the verified subset (`maskImage`/`maskFrom`/`maskTo`/`maskComposite`/`maskType`); gradient-type roots stay cut |

## Track B — HTML elements (7)

| RFC | Title | Status | Impact/Effort | Adversary's key cut/fix |
|---|---|---|---|---|
| [B-01](track-b/RFC-B-01.md) | Media/head/image-map attribute completeness | proposed | **High**/M | both CONVERGE open questions closed in-body |
| [B-02](track-b/RFC-B-02.md) | `Ins`/`Del` factories + `Q`/`Blockquote` cite | proposed | M/S | attribute-only, no file move; faithful `TimeTag` copy |
| [B-03](track-b/RFC-B-03.md) | Iframe security (typed `sandbox` tokens, `allow` record) | proposed | M/M | raw-string `allow` arm **dropped** for CONVERGE; 2 tests migrated |
| [B-04](track-b/RFC-B-04.md) | Table a11y (`headers`, `abbr`, `TableCellScope`) | proposed | M/M | empty-list-clears promoted to normative contract (no dead `headers=""`) |
| [B-05](track-b/RFC-B-05.md) | Form-control completeness | proposed | M/L | **false "typo = compile error" claims corrected**; `AcceptToken` deleted; only `FormEnctype` genuinely typo-rejecting |
| [B-06](track-b/RFC-B-06.md) | Declarative Shadow DOM + `::part`/slot | proposed | **High**/L | zero-JS standards-track shadow tree + theming seam |
| [B-07](track-b/RFC-B-07.md) | Global attribute gaps | proposed | Low/M | **`setNonce` already shipped** (caught re-proposal); only `setDraggable` net-new; boolean arm cut |

## Track A — kept-core app APIs (4)

| RFC | Title | Status | Impact/Effort | Adversary's key cut/fix |
|---|---|---|---|---|
| [A-01](track-a/RFC-A-01.md) | `Form<T>` builder completion (formError, field, hidden, options, multiselect) | proposed | **High**/L | killer cut: don't resurrect deleted `setMultiple` → use `.toggle("multiple")` |
| [A-02](track-a/RFC-A-02.md) | Control-flow & element ergonomics (5 primitives) | proposed | **High**/M | §11.7 rewritten — `show`/`hide` display tokens force-safelisted in lockstep; htmx-4 event-name fix |
| [A-03](track-a/RFC-A-03.md) | `hx()` query-param ergonomics | proposed | M/S | lift `buildQueryString(base, query)` into one `?`/`&`-correct path shared with route callables |
| [A-04](track-a/RFC-A-04.md) | Type-safe View Transitions (`defineTransitions`, `toCustomIdent`, `viewTransitionClass`) | proposed | M/S | cut `sharedTransition` (anti-CONVERGE) + `assertUniqueTransitionNames` (→ framework); arg-label tuple → bare arity; "what types cannot do" added |

## Needs-redesign (adversary reject — redesign captured in-RFC)

- **[RFC-C-01](track-c/RFC-C-01.md)** — `fill`/`stroke` method names collide with existing `SvgTag`/`SvgShapeTag` instance fields and **fail to compile**. Redesign: rename to `fillColor`/`strokeColor`. Verify the rename against the SVG element surface before building.
- **[RFC-C-10](track-c/RFC-C-10.md)** — the gradient-type mask roots (`maskLinear/Radial/Conic`) emit bare classes Tailwind doesn't define (e.g. `mask-radial`) and have no idiomatic completer. Redesign: ship only the **verified-functional** subset — `maskImage`, `maskFrom`/`maskTo` edge fades, `maskComposite`, `maskType`.

## Suggested sequencing

- **Wave 1 (quick wins, low risk):** C-02, C-03, C-04, C-05, B-01, B-02, A-03 — small/medium, additive, mirror shipped patterns.
- **Wave 2 (type-heavy, lockstep):** C-08, C-09, C-06, C-07 — broader extractor/eslint lockstep; land together.
- **Wave 3 (bigger bets / breaking-within-v6):** B-03, B-06, A-01, A-02, A-04 — own design attention; B-03 is breaking-within-v6.
- **Fix first:** C-01 (rename) and C-10 (narrow) before either is scheduled.
