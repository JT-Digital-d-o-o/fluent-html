# Fluent-HTML v6 — Multi-Wave Research & Design Algorithm

> **Status:** designed, recon complete (Wave 0).
> **Owner:** v6 initiative.
> **Resource model:** ~100 autonomous agents, each producing exactly one markdown artifact into a fixed folder hierarchy.
> **Goal:** turn fluent-html from "a great SSR HTML builder" into "the best way to write full-stack TypeScript apps," with a concrete, verified, prioritized v6 spec — not opinions, but RFCs that survived adversarial review.

This document is the **algorithm**: a deterministic orchestration of agent waves. Each wave consumes the prior wave's artifacts, fans out, and writes new artifacts. The algorithm is designed to be run by the `Workflow` tool (see §9), but is readable and executable by hand.

---

## 0. Design principles of the algorithm itself

1. **Diverge before converging.** Early waves cast a wide net (many independent agents, no coordination) so we don't anchor on the first idea. Later waves prune hard.
2. **Every claim is verified before it ships.** No proposal enters the roadmap until an *adversarial* agent — prompted to kill it — fails to kill it. (See §8 quorum rules.)
3. **One artifact per agent, uniform schema.** Every agent writes a single markdown file with YAML frontmatter (§5). This makes artifacts machine-mergeable: synthesis agents `grep` frontmatter, not prose.
4. **Stable IDs, full traceability.** A finding discovered in Wave 1 keeps its ID (`B-007`) through design, verification, and the final roadmap. You can trace any roadmap line back to the source file:line that motivated it.
5. **Loop until dry, not until tired.** Discovery and verification repeat until K consecutive rounds add nothing new — not until an arbitrary count.
6. **Guardrails are non-negotiable.** Every proposal is checked against the invariants in §11 (zero-deps, SSR-only, escape-by-default, type-safety, backward-compat policy). A proposal that violates one is rejected or must carry an explicit migration.
7. **The guidelines are part of the product.** The reader of `guidelines/web-development/**` is an LLM (Claude Code), not a human. Every API or pattern change ships *with* its guideline edit, in the house style (succinct, ✓/✗ do-don't, code-snippet-first, no prose). An API the guidelines don't teach is an API apps won't adopt — under-utilization (e.g. `Match` at 18:1 vs `IfThen`) is treated as a guideline bug, not a docs nicety. Enforced by guardrail §11.8 and the Wave-4 `guidelines-update.md` deliverable.

---

## 1. The four tracks

The user's four objectives become four parallel **tracks**. Each track runs through every wave. Tracks are independent except where flagged (cross-track findings are reconciled in Wave 4).

| Track | Name | Objective | Primary recon seed |
|-------|------|-----------|--------------------|
| **A** | DX & API improvements | Sharpen the *existing* surface: fix sharp edges, inconsistencies, missing-but-implied methods, ergonomics. | `00-recon/01-architecture.md` |
| **B** | New full-stack APIs | Net-new capabilities that remove real friction observed in shipped apps. | `00-recon/02-app-patterns.md` |
| **C** | Tailwind v4 support | A complete plan to support TW v4 across the lib, extractor, and ESLint plugin. | `00-recon/03-tailwind4.md` |
| **D** | Internals: code & performance | Render/stream perf, allocation, de-recursion, code-quality cleanup. | `00-recon/04-performance.md` |

Track missions in full are in `README.md`. The concrete seed backlog (the findings each track *starts* from) is in §10.

**Cross-cutting workstream — Guidelines & Adoption (label `G`).** Not a fifth track; it threads through all four. Two inputs feed it: (1) *adoption gaps* — existing APIs that are correct but under-taught or misused in apps (a Wave-1 discovery angle, §7); and (2) *new surface* — every RFC that adds or changes an API/pattern must propose the matching edit to `guidelines/web-development/**` (guardrail §11.8). Both converge in the Wave-4 deliverable `40-synthesis/guidelines-update.md`: a single, ordered, ready-to-apply patch set in the guidelines' house style, sequenced so each guideline edit lands with the RFC that motivates it. Target files: `web-development/CLAUDE.md` (the LLM-facing index) + the topic references (`fluent-html.md`, `htmx.md`, `views.md`, `fastify.md`, `typescript.md`, `performance.md`).

---

## 2. The wave model

```
        ┌─────────────────────────────────────────────────────────────┐
        │  WAVE 0  RECON  (4 agents, DONE)                              │
        │  broad read of lib + apps + TW4 + perf → 00-recon/*.md        │
        └───────────────────────────┬─────────────────────────────────┘
                                     │ seeds
            ┌────────────────────────┼────────────────────────┐
            ▼            ▼            ▼            ▼
   ┌────────────────────────────────────────────────────────────────┐
   │  WAVE 1  DIVERGENT DISCOVERY  (~44 agents, loop-until-dry)       │
   │  per track: many independent finders → 10-discovery/<track>/*.md │
   │  output: atomic FINDINGS (problem + evidence + rough idea)       │
   └───────────────────────────┬────────────────────────────────────┘
                               │ dedup + cluster (barrier, §8)
                               ▼
   ┌────────────────────────────────────────────────────────────────┐
   │  WAVE 2  CONVERGENT DESIGN  (~28 agents)                         │
   │  one RFC per surviving cluster → 20-design/<track>/RFC-*.md      │
   │  output: concrete API design, types, examples, migration         │
   └───────────────────────────┬────────────────────────────────────┘
                               │ pipeline (no barrier)
                               ▼
   ┌────────────────────────────────────────────────────────────────┐
   │  WAVE 3  ADVERSARIAL VERIFICATION  (~18 agents)                  │
   │  N skeptics + lens panel per RFC → 30-verification/*.md          │
   │  output: VERDICT (survives? breaking? guardrail violations?)     │
   └───────────────────────────┬────────────────────────────────────┘
                               │ keep survivors
                               ▼
   ┌────────────────────────────────────────────────────────────────┐
   │  WAVE 4  SYNTHESIS & ROADMAP  (~7 agents)                        │
   │  merge, sequence, prioritize → 40-synthesis/*.md                 │
   │  output: v6-spec.md + roadmap.md + breaking-changes.md           │
   └────────────────────────────────────────────────────────────────┘
```

**Why this shape.** Waves 1→2→3 form a *pipeline*: a cluster can be in design while another is still being discovered, and an RFC can be in verification while another is still being designed. The only hard **barriers** are (a) the dedup/cluster step between 1 and 2 (synthesis needs *all* findings at once to dedup), and (b) the merge step in Wave 4. Everything else flows.

---

## 3. Agent budget & allocation

Target: **~100 agents total** (4 already spent on recon). Allocation is weighted toward the tracks with the most discovered surface (B and D), and toward verification (quality over quantity).

| Wave | Track A | Track B | Track C | Track D | Wave total |
|------|--------:|--------:|--------:|--------:|-----------:|
| 0 — Recon (done) | — | — | — | — | **4** |
| 1 — Discovery | 10 | 16 | 8 | 10 | **44** |
| 2 — Design (RFC) | 6 | 12 | 5 | 5 | **28** |
| 3 — Verification | 4 | 8 | 3 | 3 | **18** |
| 4 — Synthesis | cross-track: 1 dedup + 4 track-synth + 1 roadmap + 1 guidelines-update | | | | **7** |
| **Total** | | | | | **101** |

Counts are *targets*, not caps. Discovery and verification use **loop-until-dry** (§8), so the real count floats: a track that keeps surfacing fresh findings spawns more finders; a track that goes quiet stops early. The hard backstop is the Workflow runtime's 1000-agent ceiling; we never approach it.

**Concurrency.** The Workflow runtime caps concurrent agents at `min(16, cores−2)`. All 44 Wave-1 finders can be *submitted* at once; ~10–16 run at a time and the rest queue. No code change needed.

---

## 4. Folder hierarchy & artifact naming

```
product/research/v6/
├── README.md                         # human entry point: tracks, how to run, index
├── ALGORITHM.md                      # ← this file
├── templates/                        # artifact templates (copy + fill)
│   ├── finding.md                    # Wave 1 output schema
│   ├── rfc.md                        # Wave 2 output schema
│   ├── verdict.md                    # Wave 3 output schema
│   └── roadmap-entry.md              # Wave 4 output schema
├── 00-recon/                         # WAVE 0 (done)
│   ├── 01-architecture.md
│   ├── 02-app-patterns.md
│   ├── 03-tailwind4.md
│   └── 04-performance.md
├── 10-discovery/                     # WAVE 1
│   ├── track-a-dx/        F-A-001.md … F-A-0NN.md
│   ├── track-b-new-apis/  F-B-001.md … F-B-0NN.md
│   ├── track-c-tailwind4/ F-C-001.md … F-C-0NN.md
│   ├── track-d-internals/ F-D-001.md … F-D-0NN.md
│   └── _clusters.md                  # dedup/cluster barrier output (one file)
├── 20-design/                        # WAVE 2
│   ├── track-a-dx/        RFC-A-01.md …
│   ├── track-b-new-apis/  RFC-B-01.md …
│   ├── track-c-tailwind4/ RFC-C-01.md …
│   └── track-d-internals/ RFC-D-01.md …
├── 30-verification/                  # WAVE 3
│   └── V-<RFC-id>-<lens>.md          # e.g. V-RFC-B-03-typesafety.md
└── 40-synthesis/                     # WAVE 4
    ├── _merge.md                     # cross-track dedup + conflict resolution
    ├── synth-track-a.md … synth-track-d.md
    ├── v6-spec.md                    # the consolidated v6 API spec
    ├── roadmap.md                    # sequenced, prioritized plan
    ├── breaking-changes.md           # migration guide for adopters
    └── guidelines-update.md          # ready-to-apply patch set for guidelines/web-development/**
```

**Naming rules**

- **Finding ID:** `F-<track>-<seq>` → `F-B-007`. Assigned at creation, immutable.
- **RFC ID:** `RFC-<track>-<seq>` → `RFC-B-03`. An RFC lists the finding IDs it resolves in its frontmatter (`resolves: [F-B-007, F-B-012]`).
- **Verdict file:** `V-<rfc-id>-<lens>.md`. One per (RFC × verification lens).
- **Ordering prefixes** (`00-`, `10-`…) keep waves sorted in any file browser.

---

## 5. Artifact schemas

Every agent writes **one** markdown file beginning with YAML frontmatter. Frontmatter is the contract; prose is for humans. Full templates live in `templates/`. Summaries:

**Finding (Wave 1)** — atomic, one problem each:
```yaml
---
id: F-B-007
track: B
title: No first-class form-field component; FormGroup+StyledInput+Alert reimplemented per app
kind: missing-api          # missing-api | bug | inconsistency | perf | refactor | tw4-gap | dx | adoption-gap
evidence:                  # file:line citations, REQUIRED — no evidence, no finding
  - rideshare/src/auth/login/login.form.view.ts:34
  - storysell-ai/src/.../signup.view.ts:50
frequency: 8               # how many apps/sites exhibit it
pain: high                 # high | medium | low
rough_idea: "FormField({name, label, error}) + auto-bind 422 errors from reply"
guardrail_risks: []        # any §11 invariant this might threaten
guideline_gap: null        # if (also) a guidelines problem: the web-development/* file that under-teaches or mis-teaches it
status: open
---
```

**RFC (Wave 2)** — one design per cluster:
```yaml
---
id: RFC-B-03
track: B
title: Form system — FormField / FormErrors / formFor binding
resolves: [F-B-007, F-B-012, F-B-019]
api_surface: ["FormField()", "FormErrors()", "formFor<T>().fieldset()"]
breaking: false            # false | additive | breaking
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md"]  # web-development/* files this RFC must patch; [] only if it adds no public surface
impact: high               # value to users
effort: M                  # S | M | L | XL
depends_on: []             # other RFC ids
status: proposed
---
```
RFC body sections: *Problem · Proposed API (with full TS signatures) · Worked examples (before/after) · Type-safety story · Migration & compat · **Guidelines impact** (the concrete ✓/✗ edit to `web-development/**`, house style) · Alternatives considered · Open questions.*

**Verdict (Wave 3)** — adversarial:
```yaml
---
rfc: RFC-B-03
lens: type-safety          # correctness | type-safety | breaking-change | perf | dx | security/escape
verdict: survives          # survives | survives-with-changes | reject
confidence: 0.8
killer_objection: null     # the strongest reason it should NOT ship, if any
required_changes: []       # if survives-with-changes
---
```

**Roadmap entry (Wave 4)** — sequenced:
```yaml
---
rfc: RFC-B-03
milestone: v6.0            # v6.0 | v6.1 | v6.x | deferred
priority: P0               # P0 | P1 | P2
effort: M
breaking: false
ships_with: [RFC-A-02]     # bundle for a single migration
---
```

---

## 6. Traceability

The chain is: **recon file:line → Finding → RFC → Verdict → Roadmap entry → (eventual PR).**

- A synthesis agent can answer "why is `FormField` in v6.0?" by walking `roadmap.md → RFC-B-03.resolves → F-B-007.evidence → rideshare/...:34`.
- Conversely, "did we ever address the `disabled="true"` truthy bug?" → grep findings frontmatter for the bug → follow to its RFC and verdict.
- Cross-track collisions (e.g. a Track-A method rename that also affects the Track-C ESLint map) are caught in Wave 4's `_merge.md` by scanning `api_surface` overlaps.

---

## 7. Per-wave specifications

### Wave 1 — Divergent Discovery

- **Inputs:** the four recon files + the seed backlog (§10). Each finder gets its track's recon file and seed list and is told *"these are known; find what's NOT yet listed, or deepen a seed with new evidence."*
- **Agent shape:** read-heavy (`Explore`/general-purpose). Each finder is given a **distinct search angle** so they don't collide:
  - Track A angles: boolean/attr setters, element coverage gaps, control-flow ergonomics, context/scoping, document/SEO, accessibility helpers, escape hatches, naming consistency, docs-vs-reality drift, error messages, adoption gaps (correct-but-underused APIs — *why* is `Match` 18:1 vs `IfThen`? which `web-development/*` guideline under-teaches or mis-teaches it?).
  - Track B angles: forms, tables/lists/pagination, modals/overlays/toasts, navigation/layout, icons/media, auth/session plumbing, validation display, data-fetching/async, components-library gaps, htmx behaviors, i18n, theming.
  - Track C angles: utility renames, config/CSS-first, extractor redesign, ESLint map, type-table regen, @theme tokens, container queries, dual-target strategy.
  - Track D angles: render de-recursion, streaming/backpressure, construction allocation, render/stream dedup, fold overhead, escaping, context cost, code-quality/`as any`, test gaps, static hoisting.
- **Output:** one `F-<track>-<seq>.md` per finding (an agent may emit several findings → several files). Every finding **must cite file:line evidence**; unevidenced findings are dropped. Any finder that spots a **guidelines drift** — an API apps misuse, a current rule that's stale/wrong, or a pattern the guidelines never teach — records it as a finding with `kind: adoption-gap` and names the offending `web-development/*` file in `guideline_gap`. This seeds the Wave-4 guidelines update even when no code changes.
- **Loop-until-dry:** after the first batch, spawn a second smaller batch told *"here is everything found so far; find only what's missing."* Stop when a round adds < 2 net-new findings (dedup by `title` + primary evidence path). Run a **completeness critic** as the final finder: *"what search angle did nobody run?"*
- **Exit criterion:** two consecutive dry rounds, OR budget for the track exhausted.

### Wave 1.5 — Dedup & Cluster (barrier)

- **One agent**, runs after all finders. Reads every `F-*.md`, deduplicates (same problem, different angle → merge, keep all evidence), and **clusters** findings into RFC-sized units. Writes `10-discovery/_clusters.md`: a table of `cluster → [finding ids] → suggested RFC scope → impact×pain score`.
- This is a genuine barrier: clustering needs the full finding set.

### Wave 2 — Convergent Design

- **Inputs:** `_clusters.md` + the findings in each cluster + the relevant recon file + the guardrails (§11).
- **Agent shape:** one design agent per cluster (general-purpose; may read source to ground the API in reality). High reasoning effort for the hard clusters (async rendering, TW4 extractor, de-recursion).
- **Output:** one `RFC-<track>-<seq>.md` with full TS signatures, before/after worked examples drawn from the *actual* app code the finding cited, a type-safety story, and a migration/compat section. Every RFC self-checks the §11 guardrails and records the result in frontmatter. Every RFC that adds or changes public surface also writes a **Guidelines impact** section: the exact ✓/✗ do-don't edit to `web-development/**` — the index rule in `CLAUDE.md` plus the deeper section in the relevant topic ref — in the guidelines' house style (succinct, code-snippet-first, written for an LLM reader, not prose; guardrail §11.8). It lists the target files in `guideline_updates`.
- **Exit criterion:** every cluster above a score threshold has an RFC. Low-score clusters are written up as a single `RFC-<track>-misc.md` (a "considered and parked" list) so nothing is silently dropped.

### Wave 3 — Adversarial Verification

- **Inputs:** each RFC.
- **Agent shape — quorum by impact:**
  - **High-impact RFCs:** a **lens panel** of distinct skeptics, each a different failure mode — `type-safety`, `breaking-change`, `perf`, `dx`, `security/escape`. Each is prompted to *refute*, defaulting to reject under uncertainty. The `dx` lens additionally audits the RFC's **Guidelines impact**: is the proposed `web-development/**` edit correct, minimal, and in house style? A great API with a missing or confusing guideline edit is an adoption failure — flag it `survives-with-changes`.
  - **Medium/low-impact RFCs:** 1–2 skeptics (`correctness` + `breaking-change`).
  - An RFC **survives** only if a majority of its lenses return `survives`/`survives-with-changes`. Any single lens returning a credible `killer_objection` on a guardrail invariant is escalated, not outvoted.
- **Output:** one `V-<rfc>-<lens>.md` per verifier. Required changes are folded back into the RFC (status → `proposed-amended`).
- **Exit criterion:** every RFC has a verdict; survivors are tagged.

### Wave 4 — Synthesis & Roadmap

- **`_merge.md` (1 agent, barrier):** reconcile cross-track conflicts (overlapping `api_surface`, a Track-A rename colliding with a Track-C ESLint entry), and dedup survivors.
- **`synth-track-*.md` (4 agents):** per-track narrative — what v6 changes in this track, in dependency order.
- **`v6-spec.md` + `roadmap.md` + `breaking-changes.md` (1 agent):** the consolidated spec, a milestone-sequenced roadmap (P0/P1/P2 × v6.0/v6.1/v6.x), and a single migration guide bundling all breaking changes so adopters migrate once.
- **`guidelines-update.md` (1 agent):** consolidate every surviving RFC's *Guidelines impact* section + the standalone `adoption-gap` findings into one ordered, ready-to-apply patch set against `guidelines/web-development/**`. House style throughout (succinct, ✓/✗, code-snippet-first, LLM-reader). Sequenced to the roadmap — each guideline edit is staged for the milestone its RFC ships in. Flags conflicts where two RFCs touch the same shared rule (no contradictory do-don'ts).
- **Exit criterion:** roadmap covers every surviving RFC; every breaking change has a migration note; every guardrail violation is either resolved or explicitly accepted with rationale; every new/changed API and every `adoption-gap` finding has a corresponding edit staged in `guidelines-update.md`.

---

## 8. Cross-wave mechanics

**Dedup key.** Findings are equal if they share a normalized `title` OR their primary `evidence[0]` path+symbol. Merging unions the evidence arrays and takes the max `frequency`.

**Scoring rubric** (used to rank clusters and prioritize the roadmap):
```
score = impact(1..3) × pain(1..3) × reach(apps_affected, capped at 3)  /  effort(S=1,M=2,L=3,XL=5)
```
Ties broken by `breaking == false` first (additive wins), then by `depends_on` depth (fewer deps first).

**Verification quorum.** survive iff `count(survives | survives-with-changes) > count(reject)` AND no un-rebutted guardrail killer. Skeptics default to `reject` under uncertainty — we want false-negatives (a good idea cut) over false-positives (a bad API shipped), because shipped APIs are expensive to remove.

**Loop-until-dry** (Wave 1 & re-discovery): maintain a `seen` set keyed by dedup key. A round is "dry" if `fresh.length < 2`. Stop after **2** consecutive dry rounds. Dedup against `seen`, never against "accepted" — otherwise rejected findings resurface every round and the loop never converges.

**No silent caps.** If any wave truncates (top-N clusters only, skipped a low-score angle), the responsible agent `log()`s and records it in its artifact. A bounded run must read as bounded, not as "covered everything."

---

## 9. Orchestration — mapping to the `Workflow` tool

The algorithm is a `Workflow` script. Skeleton (illustrative; real script lives beside this doc when executed):

```js
export const meta = {
  name: 'fluent-html-v6',
  description: 'Multi-wave v6 research: discover → design → verify → synthesize',
  phases: [
    { title: 'Discovery' }, { title: 'Cluster' },
    { title: 'Design' }, { title: 'Verify' }, { title: 'Synthesis' },
  ],
}

const TRACKS = ['A','B','C','D']
const ANGLES = { A:[...], B:[...], C:[...], D:[...] }   // §7 angle lists

// WAVE 1 — divergent discovery, per-track loop-until-dry
phase('Discovery')
const seen = new Set(), findings = []
for (const track of TRACKS) {
  let dry = 0
  while (dry < 2) {
    const batch = await parallel(ANGLES[track].map(angle => () =>
      agent(finderPrompt(track, angle, seen), { phase:'Discovery', schema: FINDING_LIST })))
    const fresh = batch.filter(Boolean).flatMap(b => b.findings)
                       .filter(f => !seen.has(key(f)))
    if (fresh.length < 2) { dry++; continue }
    dry = 0; fresh.forEach(f => { seen.add(key(f)); findings.push(f) })
  }
}
// each finding is also written to its own file by the finder agent

// WAVE 1.5 — dedup + cluster (BARRIER: needs all findings)
phase('Cluster')
const clusters = await agent(clusterPrompt(findings), { schema: CLUSTERS })

// WAVES 2→3 — design then verify, PIPELINED per cluster (no barrier)
const verified = await pipeline(clusters.items,
  c  => agent(rfcPrompt(c),  { phase:'Design',  schema: RFC, effort: c.hard ? 'high':'medium' }),
  rfc => parallel(lensesFor(rfc).map(lens => () =>
           agent(verifyPrompt(rfc, lens), { phase:'Verify', schema: VERDICT })))
         .then(vs => ({ rfc, survives: quorum(vs) }))
)
const survivors = verified.filter(Boolean).filter(x => x.survives).map(x => x.rfc)

// WAVE 4 — synthesis (BARRIER)
phase('Synthesis')
const merged = await agent(mergePrompt(survivors), { schema: MERGED })
await parallel(TRACKS.map(t => () => agent(synthPrompt(t, merged), { phase:'Synthesis' })))
const roadmap    = await agent(roadmapPrompt(merged), { schema: ROADMAP })
const guidelines = await agent(guidelinesPrompt(merged, adoptionGaps), { phase:'Synthesis' })  // → guidelines-update.md
return { roadmap, guidelines }
```

Notes:
- **Pipeline, not barrier, between Design and Verify** — an RFC verifies the moment it's designed; cluster B-03 doesn't wait for cluster D-05's design.
- **Guidelines, not just code.** Every RFC carries a *Guidelines impact* section (guardrail §11.8); the final `guidelines-update.md` agent merges those with the standalone `adoption-gap` findings into one patch against `web-development/**`. `adoptionGaps` is the subset of Wave-1 findings with `kind: adoption-gap`.
- **`schema` everywhere** so frontmatter is validated at the tool layer (agents retry on malformed output) — no brittle parsing.
- **`effort: 'high'`** only on the genuinely hard clusters (async rendering, TW4 extractor redesign, renderer de-recursion); `'medium'` elsewhere; finders can run `'low'`.
- **File writing:** each agent writes its own `.md` artifact (path passed in the prompt) *and* returns the validated frontmatter object for the in-memory pipeline. Belt and suspenders: the files are the durable record, the return values drive control flow.
- **Budget guard:** if a token target is set, gate the discovery loop on `budget.remaining()` so the wide net scales to the budget.

---

## 10. Seed backlog (from Wave 0)

Wave-1 finders start from these so they spend their effort *extending* the map, not rediscovering it. Each seed becomes (at least) one `F-*` file; finders add evidence and find neighbors.

### Track A — DX & API improvements
| Seed | Evidence (from recon) | Note |
|------|----------------------|------|
| `.children()` documented in CLAUDE.md/README but **does not exist** | 01-architecture | docs-vs-reality drift; either implement or remove from docs |
| Typed boolean setters render `disabled="true"` / `"false"` (truthy bug) | 01-architecture | align semantics with `.toggle()`; likely a real bug |
| `addClass` never dedupes or resolves Tailwind conflicts | 01-architecture | `bg-red-500 bg-blue-500` both survive |
| No `.aria()` / `.role()` / `.data()` fluent helpers | 02-app-patterns (~300 `addAttribute`) | retire the biggest `addAttribute` category |
| No DOCTYPE / full-document (`<!doctype html>`) support | 01-architecture | every app hand-rolls it |
| `Match` is drastically underused (18:1 vs `IfThen`) | 02-app-patterns | `kind: adoption-gap` — likely a missing/mis-teaching guideline; fix may be a `web-development/**` edit, not code |
| HTMX serialization duplicated across render/stream/fold, diverging | 01-architecture | correctness risk (also Track D) |
| Existing APIs under-taught → low adoption (`.behavior()` near-unused; `formFor` vs raw `.setName()`; arbitrary-value overloads) | 02-app-patterns | `kind: adoption-gap` — feeds `40-synthesis/guidelines-update.md` |

### Track B — New full-stack APIs (ranked by impact×pain from app survey)
| # | Seed API | Evidence | Replaces |
|---|----------|----------|----------|
| 1 | **Form system** — `FormField`/`FormErrors` + auto-422 binding + input variants | FormGroup+StyledInput+Alert reimplemented in ~8 apps | the #1 boilerplate cluster |
| 2 | **`Alert`/`Callout`** + **`Badge.of(value, map)`** | independently defined in 6 apps each | semantic-color boilerplate |
| 3 | **`Modal`** + `behavior("openModal"/"closeModal")` | apps hand-write `showModal` JS via 16 `hx-on:click` | no first-class overlay |
| 4 | **Gradient + extended pseudo methods** (`placeholder:`, `group-hover:`, `[&>input]:`) | biggest `addClass` category (327 in storysell) | raw-string escape hatch |
| 5 | **`.aria()`/`.role()`/`.data()`** (shared w/ Track A) | ~300 `addAttribute` | — |
| 6 | **Request-scoped context that survives `await`** | documented ALS guideline violation in storysell | ⚠ tension with "never ALS" guideline — flag as decision |
| 7 | **`Table.of(rows, columns)`** data-grid + pagination | ThCell/TdCell/SortableThCell/Pagination in 5 apps | table boilerplate |
| 8 | **`Icon("name")`** registry | 72 `Raw("<svg>")` in jt-cut + per-app icon dumps | `Raw()` for SVG |
| 9 | **Layout primitives** — `Container()`, `Page()`/`Document()` w/ SEO head, `EmptyState()`, `Skeleton()` | already-extracted helpers in many apps | per-app layout |
| 10 | **Button/Text variant tokens** | per-app button families + glimm's 8-wrapper typography | styling drift |
| 11 | **`behavior()` expansion** — modal-toggle, form-reset-on-swap | behavior near-unused (0–14/app) because it doesn't cover real needs | inline JS / `Script()` |
| 12 | **Async / data-driven / suspense rendering** | 01 + 04 recon: "largest structural limit" | (cross-track w/ D) |

### Track C — Tailwind v4 support
| Sev | Seed | Evidence |
|-----|------|----------|
| 🔴 | **Extractor redesign** — v4 removed `content.extract`; fluent methods never write `bg-red-500` into source → v4 can't detect classes → no CSS | 03-tailwind4 (B-1, "existential") |
| 🔴 | **Pipeline/config** — `@import "tailwindcss"`, `@tailwindcss/postcss`, CSS-first `@theme`; all setup docs invalid | 03 (B-2/B-3) |
| 🟠 | **Utility renames** — `bg-gradient-*`→`bg-linear-*`, `shadow-sm`→`shadow-xs`, `outline-none`→`outline-hidden`, ring 3px→1px, default border color→currentColor, `bg-opacity-*`→`/opacity` | 03 (M-1…M-7) |
| 🟠 | **Type-table regeneration** (`tailwind-types.ts`) + **ESLint map updates** (36KB map suggests renamed/removed classes) | 03 |
| 🟡 | **`@theme` token generation** — expose theme tokens type-safely | 03 (open question) |
| 🟡 | **v3/v4 dual-target decision** — support both or cut v3? | 03 (key decision) |
| 🟢 | **New v4 surface** — container queries, `@utility`/`@variant`, dynamic spacing, P3 colors, 3D transforms, `not-*` | 03 |

### Track D — Internals: code & performance
| Seed | Evidence | Class |
|------|----------|-------|
| **De-recurse the renderer** — stack overflow at depth ~3468–3500 | 04-performance | correctness+perf, high |
| **True backpressure streaming** — `stream.ts` walks whole tree in one tick (eager) | 04 | perf |
| **Static-subtree hoisting / precompiled fragments** | 04 | perf |
| **Cut construction allocation** — monomorphic Tag shape, lazy `_variantPrefix` (~14.5KB/1000 divs paid per request) | 04 | perf |
| **Dedupe render/stream into shared emitter** — verbatim ~70-line copy | 04 | code quality |
| **Fold `extractAttrs` pay-as-you-go** — `{...attrs}`+`Object.keys` makes count as slow as full render | 04 | perf |
| **Skip escaping non-string `_sk` values** | 04 | perf |
| **Cheaper context `scope()`** — per-call Disposable alloc | 04 | perf |
| **Lossy/insecure second `renderAlgebra`** — only 3 HTMX attrs, no script sanitization | 04 | security+quality |
| **~30 `as any` prototype writes; tri-typed `boolean\|string` rawCtx flag** | 04 | quality |
| **Test gaps** — no deep-nesting test, no stream backpressure test, bench not in CI | 04 | quality |
| **Measured NON-opportunities** (do not chase): array-join slower than `+=`; regex-prefilter escaping slower than charCode scan | 04 | guard against wasted effort |

---

## 11. Guardrails — invariants every proposal must honor

These are the constitution. An RFC that violates one is rejected unless it carries an explicit, accepted migration.

1. **Zero runtime dependencies.** No new `dependencies` in the lib package. (Dev/tooling deps in extractor/eslint OK.)
2. **SSR-only, synchronous render path stays fast.** Any async/suspense API must be *opt-in* and must not slow the synchronous hot path (Track D owns the proof).
3. **Escape-by-default; no XSS regressions.** New APIs that emit markup must escape; `Raw`-equivalents must be explicit. Verifiers run the `security/escape` lens.
4. **Type-safety first.** No bare `string` where a literal union fits; prefer const generics, discriminated unions, branded IDs. New fluent methods get full types, not `any`.
5. **Backward-compat policy.** Additive by default. Breaking changes are allowed only in a major and must be (a) codemod-able where possible, (b) bundled into one migration in `breaking-changes.md`, (c) justified by impact.
6. **Consistency with existing idioms.** New APIs match the library's voice: variadic children, specialized tag methods over `addAttribute`, `.on()`/`.at()` over `addClass`, `defineRoutes`/`defineIds` single-sourcing, `.behavior()` over inline JS.
7. **The class-string contract.** Three packages (lib, extractor, eslint) share the generated class vocabulary. Any Track-A/B method that emits new classes must be reflected in Track-C tooling (caught in Wave 4 merge).
8. **The guideline-sync contract.** The reader of `guidelines/web-development/**` is an LLM (Claude Code). Any RFC that adds/changes a public API or recommends a new pattern **must** carry a `## Guidelines impact` section proposing the concrete edit — a succinct ✓/✗ do-don't rule in `CLAUDE.md` (the index) plus the deeper section in the matching topic ref, code-snippet-first, no prose. An RFC without it is incomplete (the Wave-3 `dx` lens enforces). This is the prose mirror of #7: as the class vocabulary must stay in sync across packages, the *teaching* must stay in sync with the *surface* — an un-taught API is an un-adopted API.

---

## 12. Final deliverables of a full run

When the algorithm completes, `40-synthesis/` contains:

- **`v6-spec.md`** — the consolidated v6 API: every surviving RFC, organized by track, with final signatures.
- **`roadmap.md`** — milestone-sequenced (v6.0 / v6.1 / v6.x), P0–P2, with dependency order and effort.
- **`breaking-changes.md`** — one migration guide bundling all breaking changes + codemods where applicable.
- **`guidelines-update.md`** — one ready-to-apply patch set against `guidelines/web-development/**` (index `CLAUDE.md` + topic refs), in house style, sequenced to the roadmap. Includes guideline edits that carry *no* code change — adoption-gap fixes for under-used existing APIs.
- Per-track synthesis narratives.

Plus the full audit trail in `10-`/`20-`/`30-` for anyone who asks "why."

---

## 13. Failure modes of the algorithm (and mitigations)

| Failure mode | Symptom | Mitigation |
|--------------|---------|-----------|
| **Anchoring** — everyone copies recon | findings ≈ seeds, no new surface | distinct search angles per finder (§7); completeness critic; seeds framed as "known, find what's missing" |
| **Idea inflation** — RFCs for trivia | low-value RFCs crowd the roadmap | cluster score threshold; "considered & parked" misc RFC; verifier `dx` lens asks "is this worth the surface area?" |
| **Rubber-stamp verification** | everything "survives" | skeptics prompted to *refute*, default-reject under uncertainty; lens diversity; guardrail killers escalate past majority |
| **Convergence stall** | loop never goes dry | dedup against `seen` not `accepted`; hard 2-dry-round stop; per-track budget cap |
| **Cross-track collision** | Track-A rename breaks Track-C eslint silently | Wave-4 `_merge.md` scans `api_surface` overlap; guardrail #7 |
| **Silent truncation** | "we covered everything" but didn't | no-silent-caps rule (§8) — every truncation logged in-artifact |
| **Guardrail drift** | a breaking API sneaks into a minor | frontmatter `breaking` + `guardrails_checked` required; Wave-4 rejects unmarked breakage |
| **Orphaned API** — ships without a guideline | apps never adopt it (cf. `Match` at 18:1) | guardrail §11.8 forces a *Guidelines impact* per RFC; Wave-4 `guidelines-update.md`; `dx` lens audits the edit |

---

*Recon (Wave 0) is complete — see `00-recon/`. The algorithm is ready to execute from Wave 1. See `README.md` for the track missions and the run command.*
