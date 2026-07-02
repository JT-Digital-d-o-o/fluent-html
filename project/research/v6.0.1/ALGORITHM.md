# fluent-html v6.0.1 — Post-Release Review Algorithm

> **Parent:** [`../v6.0.0/ALGORITHM.md`](../v6.0.0/ALGORITHM.md) — this is the same machine, ~½ the agents, reframed from *greenfield rewrite* to *polish-the-shipped-thing*.
> **Goal:** a verified, prioritized set of changes that make v6 more correct (→ 6.0.1) and more capable (→ 6.1.0), each surviving adversarial review, each traceable to shipped-code evidence.

## 0. What changed vs the v6.0.0 run

1. **The subject is the shipped code, not v5.** Findings cite `src/**` of v6.0.0, the three tooling packages, and the lib's own docs — not app boilerplate. Recon is "what did we ship + where does it bite," not "what do apps re-implement."
2. **Two ship lanes, not one.** Every surviving change is routed to **6.0.1** (a behavior fix with no public-shape change) or **6.1.0** (additive). A change that needs a break is **parked** for a major — never smuggled into a patch/minor. This replaces v6's `breaking|additive` gate with an `additive-only` guardrail and a `ships_to` field on every artifact.
3. **Half the agents.** ~50 vs ~101. Discovery loops are capped (one reseed round), verification quorum is lighter (3-lens panel only for high-impact RFCs; a single combined skeptic for the rest).
4. **The instruction-set decision is now a guardrail, not an open question.** Components were cut to user-land in v6. Track C may re-litigate a *primitive* form of a cut helper, but the `instruction-set` lens defends the line.

## 1. The four tracks

| Track | Folder | Objective | Lane |
|-------|--------|-----------|------|
| **A** | `track-a-correctness` | Bugs / regressions / inconsistencies in shipped v6.0.0 | 6.0.1 |
| **B** | `track-b-html-platform` | Latest HTML/ARIA standards → typed primitives | 6.1.0 |
| **C** | `track-c-dx-abstractions` | Creative combinators; less error-prone authoring | 6.1.0 |
| **D** | `track-d-type-safety` | Type-safety + API-surface sharpening | 6.0.1 / 6.1.0 |

### Search angles (Wave 1 finders get one each; distinct so they don't collide)

- **A — Correctness:** (A1) render spine / `serialize.ts` de-recursion + boolean `_sk` serialization + void/deep-nesting; (A2) security & escape — `escapeJs` across behaviors, `hx-status`, nonce threading, `Raw`/`RawString` boundaries, attribute injection; (A3) htmx 4 + routes — render/stream serialization parity, `:inherited`, `defineRoutes.resolve`/query encoding, `defineIds`; (A4) Tailwind vocab ↔ extractor ↔ eslint drift + `defineTheme` manifest + safelist emitter; (A5) streaming backpressure edge cases + context lifecycle (incl. parked B-06 `preserveQuery` filter-reset) + docs-vs-reality drift + test gaps.
- **B — HTML platform:** (B1) interactivity — Popover API, invoker commands (`command`/`commandfor`), dialog `closedby`, `inert`; (B2) forms & inputs — `inputmode`/`enterkeyhint`/`autocomplete` tokens, customizable `<select>`/`<selectedcontent>`, form-associated/`form` attr, `<fieldset disabled>`, `contenteditable=plaintext-only`, `writingsuggestions`; (B3) content & semantics — `<search>`, `<details name>` accordion, `hidden=until-found`+`beforematch`, ARIA coverage gaps, microdata; (B4) loading & media — `fetchpriority`, `loading`/`decoding`, `srcset`/`sizes`/`<source>`, `<link rel>`/`<meta>` typing, speculation rules; (B5) CSS-platform hooks via TW4 — anchor positioning, scroll-driven, `@starting-style`/`transition-behavior`, view-transition class hooks.
- **C — DX abstractions:** (C1) control-flow ergonomics — `Match` adoption/sugar, `Switch`, `ForEachElse` follow-ons, keyed iteration, fragment handling; (C2) composition & combinators — `.apply`/`.when`/`.applyTo` follow-ons, pipeable transforms, slot/children patterns, variant composition without components; (C3) form-binding & data — `Form<T>` ergonomics, typed field arrays, error wiring, list/table *primitives*; (C4) footgun reduction — the raw-string escape-hatch reach, repetitive patterns that beg a primitive; (C5) reconsider-a-primitive — does any cut helper (Modal/Alert/Table/Badge/Icon/EmptyState/Skeleton) earn a *primitive* core form? High bar; must justify vs instruction-set.
- **D — Type safety:** (D1) attribute-value literal unions vs bare `string` (`target`/`rel`/`type`/`inputmode`/`loading`/ARIA tokens), `_sk` typing; (D2) internal hygiene — `as any`/cast removal, prototype-write typing, exhaustiveness/`assertNever`, type-level tests; (D3) generic/inference sharpening — `Form<T>` fields, `defineRoutes` param types (`int`/`enum`/optional?), `defineTheme` tokens, `Match` narrowing, branded IDs; (D4) consistency & naming — set/add convention audit, missing-but-implied setters, JSDoc/`@deprecated` hygiene, type-only exports.

## 2. The wave model

```
WAVE 0  RECON         2 agents   shipped-surface baseline + HTML-platform landscape → 00-recon/
WAVE 1  DISCOVERY    ~19 agents  per-track finders (one angle each) + 1 reseed/critic round for hot tracks → findings
WAVE 1.5 CLUSTER       1 agent   BARRIER: dedup + cluster all findings → _clusters.md
WAVE 2  DESIGN       ~10 agents  ┐ PIPELINED (no barrier): an RFC verifies the moment it's designed
WAVE 3  VERIFY       ~16 agents  ┘ per cluster: 1 RFC → lens panel (3 for high-impact, 1 combined skeptic otherwise)
WAVE 4  SYNTHESIS      4 agents   BARRIER: merge → roadmap → guidelines-update → changelog-draft → 40-synthesis/
```

Barriers: (1.5) cluster needs all findings; (4) synthesis needs all survivors. Everything 2→3 flows.

## 3. Artifact schemas

Same as v6 (`templates/`), plus a `ships_to: 6.0.1|6.1.0|parked-major` field on findings, RFCs, and roadmap entries. Frontmatter is the contract; prose is for humans. Each agent **writes one markdown file** into the hierarchy **and** returns the validated frontmatter object (the files are the durable record; the return values drive control flow).

- **Finding** `F-<track>-<NNN>.md` → `10-discovery/<track>/`. Must cite shipped-code `file:line`. No evidence → dropped.
- **Cluster** → `10-discovery/_clusters.md` (one file): `cluster → [finding ids] → scope → score`.
- **RFC** `RFC-<track>-<NN>.md` → `20-design/<track>/`. Full TS signatures, before/after, type-safety story, `## Guidelines impact`, guardrail self-check.
- **Verdict** `V-<rfc>-<lens>.md` → `30-verification/`. Adversarial; default-reject under uncertainty.
- **Synthesis** → `40-synthesis/`: `v6.0.1-spec.md`, `roadmap.md`, `guidelines-update.md`, `changelog-draft.md`, `synth-track-*.md`.

## 4. Mechanics

- **Dedup key:** normalized `title` OR primary `evidence[0]` path+symbol. Merge unions evidence, takes max frequency.
- **Score:** `impact(1..3) × pain(1..3) × reach(≤3) / effort(S1 M2 L3 XL5)`. Ties → additive-before-parked, then fewer deps.
- **Quorum:** survive iff `count(survives|survives-with-changes) > count(reject)` and no un-rebutted guardrail killer. Skeptics default to `reject`.
- **Loop-until-dry (capped):** one reseed round; a track reseeds only if its first round produced fresh findings. A completeness-critic names the unrun angle.
- **No silent caps:** if a wave truncates (top-N clusters, parked-misc RFC), the agent logs it in-artifact.
- **Lane discipline:** the `breaking-change` lens FAILS any 6.0.1 RFC that changes a public shape; such ideas are re-routed to `parked-major`.

## 5. Deliverables

`40-synthesis/` ends with:
- **`v6.0.1-spec.md`** — every surviving change, by track, with final signatures and its lane.
- **`roadmap.md`** — three buckets: **6.0.1** (patch, P0 fixes first) · **6.1.0** (additive) · **parked-major / wontfix** (with rationale).
- **`changelog-draft.md`** — ready-to-paste CHANGELOG entries for 6.0.1 and 6.1.0.
- **`guidelines-update.md`** — one ordered patch set against `guidelines/web-development/**` + the lib's own docs.
- Per-track synthesis narratives + the full `10/20/30` audit trail.

*Traceability: `roadmap.md → RFC.resolves → F-*.evidence → src/...:line`.*
