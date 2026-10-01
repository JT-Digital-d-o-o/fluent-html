# fluent-html v8: Review & Design Algorithm

> **Parents:** [`../v6.0.0/ALGORITHM.md`](../v6.0.0/ALGORITHM.md) (the wave machine) and
> [`../v6.0.1/ALGORITHM.md`](../v6.0.1/ALGORITHM.md) (the post-release shape). Same waves, retargeted.
> **Subject:** shipped fluent-html **8.1.0**, eslint-plugin-fluent-html **4.1.0**, tailwind-extractor
> **3.0.0-unreleased**, pinned `htmx.org@4.0.0-beta6` + `tailwindcss@4.3.3`, `guidelines/web-development/**`,
> `projects-template` (+ `packages/ui`).
> **Goal:** a verified, prioritized, lane-routed set of changes (8.1.x / 8.2.0 / 9.0.0) that raise the
> library's **agent-fitness scorecard**, each traceable to a measured number or a `file:line`.
> **Budget:** ~50 agents. Running it needs explicit opt-in to that scale.

---

## 0. What changed since the v6.0.0 run

| v6.0.0 assumed | v8 reality | So the algorithm now… |
|---|---|---|
| The user is a developer; evidence is "N apps re-implement X" | The author is an LLM agent. Fitness is measured on 8 dimensions ([scorecard](../../../../projects-template/project/research/agent-fitness/scorecard.md): fluent-html 8.0 overall at 8.0.0) | Every finding and RFC names the scorecard dimensions it moves and a predicted delta. The run ends by re-scoring (Wave 5). |
| Evidence = reading code | A census script ([`scripts/census/method-census.mjs`](../../../scripts/census/method-census.mjs), 46 repos, alias-merged), setter/brand probes, a generation-experiment protocol | Findings need a measured number or `file:line`. "Commonly", "often", "rarely" are banned. |
| tsc/lint green means it works | `Partial()` shipped inert for a whole major: tsc-, lint-, extractor- and boot-clean | Verifiers **execute** against the real runtime (pinned htmx bundle, Tailwind oracle, Playwright matrix). Reading code is not verification. |
| Every RFC adds a guideline edit (§11.8) | 25K tokens of prose bought a delta of 2 lint findings; guidelines scored 5.5 | **Reversed.** An RFC picks the strongest enforcement layer and **deletes** the prose it replaces. Net guideline lines must go down. |
| Architecture is open (components? context? theming?) | Settled: instruction set, pure core, converge, canonical names, object variants, `defineTheme` | These are guardrails (§5). A proposal that reopens one goes to `decision-gated` with its evidence and is not designed. |
| Grow the surface | 8.0 pruned 38 methods; 108 more measured at zero call sites | An addition must earn its place: census reach, or a pure-prior divergence it absorbs. It names what it replaces or why nothing does. |
| Greenfield, no migration | 46 consumer repos (upgraded on demand when a client pays) | Breaking changes are codemod-first, with the dry run **measured** (1245/1245 precedent). No aliases, no shims. |
| 3 repos in lockstep | 5: lib, extractor, eslint plugin, guidelines, projects-template (+ `@jtdigital/ui`) | Check the template first: a "missing core API" is often already solved a layer up. |
| No history | Four prior runs + behavior-v4 + agent-fitness, each with parked/rejected ledgers | Prior ledgers seed the `seen` set. Re-raising a parked item requires **new** evidence. |
| Synthesis is final | v6 curation overrode synthesis afterwards (docs had to be regenerated); v6.0.1 audit found only 27 of 72 required changes applied | Human curation is a barrier **before** synthesis. A juxtaposition audit runs **after** implementation. |

---

## 1. The four tracks

| Track | Folder | Objective | Scorecard dimensions |
|---|---|---|---|
| **A** | `track-a-silent-failures` | Anything that compiles, lints and does the wrong thing at runtime | silent-failure resistance, verification loop |
| **B** | `track-b-contracts` | Extend the 8.x type contracts; make every wrong guess fail with an error that names the fix | error quality, cross-file invariants, decision-space closure |
| **C** | `track-c-surface` | Census-driven prune/converge/rename toward the model's prior | prior alignment, context economy |
| **D** | `track-d-platform` | htmx 4, Tailwind 4.x, HTML/ARIA platform drift; perf regression watch | evolvability, silent-failure resistance |

**Cross-cutting `G`: enforcement & teaching.** Not a track. Every RFC contributes one row to the
enforcement ledger (rule → layer → prose deleted). Plus one standalone audit: **taught-but-unused**
(an API taught in docs with zero call sites has zero exemplars and zero tests by construction; that is
how `Partial()` hid).

### Search angles (one per Wave-1 finder)

- **A: Silent failures.**
  (A1) htmx grammar contract: every attribute, event, element and swap modifier `src/**` can emit must
  exist in the pinned bundle. No such test exists today. (A2) Tailwind contract: every emitted class passes the pinned oracle; merged-prefix
  disambiguation; extractor unresolved ledger for non-literal args. (A3) Mutable builder: the losing
  override (merger decided 2026-08-14, unbuilt), dev-check coverage after privatization, aliasing through
  `ForEach`/`Intersperse`. (A4) Method-shadow hazards: a guess that compiles and emits something else
  (`.colspan` → `colSpan` emits `col-span-2`); subclass attribute fields vs base styling methods.
  (A5) Serialize/escape/stream: `Raw` boundaries, nonce, render/stream parity, backpressure.
- **B: Contracts & errors.**
  (B1) Swap-contract closure: `Rooted<N>` through `Partial`/`IfThen`'s `""` arm/layouts; `render`
  stance consumers on the handler side; swap-verb parameter branding (template-owned). (B2) Error probes,
  protocol phase 3 against 8.1: `.nav("/team")`, missing `Match` case (8-line TS2769, fix on the last line),
  pruned method (anonymous TS2339, no successor), palette literal under opt-out, raw route string.
  (B3) Remaining raw-string sinks: `FormTag.setAction`, `ButtonTag.setFormaction`, `AreaTag`,
  `addAttribute("id"|"class"|"style")` (parked since v6.0.1). (B4) Inference limits: typecheck cost,
  the `NoExtraCases` contextual-typing trap, `Id<N>` widening gate, the generic-wrapper dead end.
  (B5) Type-test coverage: every public union is closed, or open with a documented reason, pinned in `test/types/`.
- **C: Surface economy.**
  (C1) Prune: the 108-name zero-use list + the frozen set, re-censused with the version-skew guard.
  (C2) Pure-prior divergence map: what the model writes first vs what exists; each divergence is
  absorbed by naming or by an error that redirects in one shot. (C3) Convergence: remaining two-ways
  (`hxGet` vs `setHtmx` vs swap verbs, `set*` vs `addAttribute`). (C4) Head-doc correctness: README
  census head vs alias-merged ranks; taught-but-unused. (C5) Naming tail: set/add audit, the parked
  lowercase-tail setter rename (F-D-160).
- **D: Platform.**
  (D1) htmx beta4→beta6→GA deltas (attribute renames, events, extensions; the template's vendored copy).
  (D2) Tailwind 4.3.3→latest: coverage-watch output, new utilities/variants. (D3) HTML/ARIA since
  2026-06, only primitives that need library support. (D4) Render perf and allocation vs the 7.0.1
  numbers; dev-check cost; merger cost. (D5) Tooling lockstep: extractor 3.0.0-unreleased status,
  eslint 4.1 rules vs the 8.1 surface, `gen:vocab --check`.

---

## 2. The wave model

```
WAVE 0   RECON          4 agents  → 00-recon/
WAVE 1   DISCOVERY     ~22 agents  5 angles × 4 tracks + completeness critic + taught-but-unused audit
                                   one reseed round, only for tracks whose first round yielded ≥2 fresh
WAVE 1.5 CLUSTER         1 agent   BARRIER: dedup against `seen`, cluster → _clusters.md
WAVE 2   DESIGN         ~8 agents  ┐ PIPELINED: an RFC verifies the moment it is designed
WAVE 3   VERIFY        ~12 agents  ┘ lens panel per RFC (§4)
WAVE 3.5 CURATION       human      BARRIER: include / cut / modify / defer → 40-synthesis/curation.md
WAVE 4   SYNTHESIS       4 agents  BARRIER: from the CURATED set only → 40-synthesis/
WAVE 5   JUXTAPOSITION   2 agents  after implementation: required-changes audit + scorecard re-run
```

**Wave 0 recon** (each writes one file):

1. `01-shipped-surface.md`: walk `dist/` prototypes at runtime (not docs) + re-run the census
   (`--json`, both alias-merged fleet and canonical-era columns).
2. `02-agent-fitness-delta.md`: protocol phases 2–3 against 8.1 (pure-prior / blind / guided + ~20
   error probes). Context must be **actually withheld**: the last run injected the parent CLAUDE.md
   into every condition, so its blind−guided delta is a lower bound only.
3. `03-runtime-contracts.md`: the emitted-name inventory vs the pinned htmx bundle, Tailwind oracle pass
   rate, Playwright matrix status.
4. `04-prior-ledger.md`: every parked / rejected / decision-gated item from `v6.0.0`, `v6.0.1`,
   `v6.2.0`, `v6.3.0`, `behavior-v4`, `project/pm/*/decisions.md` and the agent-fitness backlog, each
   with its reason. This file **is** the initial `seen` set.

Waves 1–3 run as one workflow and stop. Curation is the user's, in session. Synthesis runs as a second
workflow over `curation.md`. That is how Wave 4 avoids the v6 problem of synthesizing designs the user
later overturned.

---

## 3. Artifacts

Same folder hierarchy and IDs as v6 (`00-recon/`, `10-discovery/<track>/F-*.md`, `20-design/<track>/RFC-*.md`,
`30-verification/V-<rfc>-<lens>.md`, `40-synthesis/`), plus `50-juxtaposition/`. Templates: reuse
[`../v6.0.0/templates/`](../v6.0.0/templates/) with these frontmatter changes:

**Paths.** Artifacts carry no machine-specific paths. A path is relative to the **org root**, the
directory that holds the sibling checkouts (`fluent-html/src/…`, `projects-template/…`,
`guidelines/…`); `<org-root>` names that directory itself. `<scratch>` is a session-local scratch
dir that does not outlive the run, and `~` is the user's home. Harness scripts read `ORG_ROOT` and
`SCRATCH` from the environment.

**Finding**
```yaml
evidence_kind: census      # code | census | experiment | probe | history | runtime
measure: "0 call sites / 46 repos (canonical era: 0 / 3)"   # REQUIRED, a number or file:line
dims: [silent-failure]     # scorecard dimensions it hurts
reach: 3                   # 1..3 from census breadth or experiment recurrence (replaces `frequency`)
prior: null                # ledger id if re-raising a parked item, and what evidence is new
ships_to: 8.2.0            # 8.1.x | 8.2.0 | 9.0.0 | parked | decision-gated
```

**RFC**
```yaml
enforcement: type          # type | lint | dev-throw | runtime | boot | ci | prose (strongest feasible)
error_text: "…"            # verbatim first diagnostic a wrong guess now gets (type/lint layers)
prose_deleted: ["web-development/htmx.md:212"]   # guideline lines this makes redundant
guideline_delta: -14       # net lines; positive only for `prose-only` canon, with reason
lockstep: [eslint, guidelines, template]         # extractor | eslint | guidelines | template | ui
codemod: needed            # none | needed
codemod_dry_run: "template 412/412, rideshare 88/91 (3 reported)"   # measured, required if needed
dims_predicted: { silent-failure: +1 }
ships_to: 9.0.0
```
Drop v6's `guideline_updates` (add-only) and `breaking` (lanes carry it).

**Verdict:** add `executed:` (the commands run and their key output), **required**. A verdict with no
executed command is invalid and gets re-run.

---

## 4. Mechanics

- **Evidence rule.** No number or `file:line` → finding dropped. Banned words → artifact rejected by schema.
- **Dedup** against `seen` (prior ledger + this run), never against "accepted". Key: normalized title
  OR primary evidence path+symbol.
- **Score:** `impact(1..3) × pain(1..3) × reach(1..3) / effort(S1 M2 L3 XL5)`. Ties: stronger enforcement
  layer first (type > lint > dev-throw > runtime > boot/ci > prose), then additive, then fewer deps.
- **Lenses** (each prompted to refute, default-reject under uncertainty):

  | Lens | Must execute |
  |---|---|
  | `correctness` | render the before/after; byte-diff the output |
  | `type-safety` | compile a probe fixture in the style of `test/types/`; `@ts-expect-error` both ways |
  | `runtime-contract` | emitted names vs the pinned htmx bundle; classes vs the Tailwind oracle; Playwright row if interactive |
  | `breaking-change` | the codemod dry run on the template + one live repo; report skips |
  | `agent-fitness` | the pure-prior guess against the new surface: does it work, or does the first error name the fix? does it add a second way? token cost of the teaching |
  | `security/escape` | a breakout probe through every new sink |
  | `instruction-set` | grep projects-template + `packages/ui` for an existing solution one layer up |

  High-impact RFCs: 4 lenses (`agent-fitness` always, + the three most relevant). Others: 1 combined skeptic.
- **Quorum:** survive iff `survives + survives-with-changes > reject` and no un-rebutted guardrail killer.
- **Lanes.** `8.1.x`: no public-shape change; emitted bytes change only to fix something that never
  worked (the `Partial()` precedent). `8.2.0`: additive. `9.0.0`: breaking, codemod-first, bundled into
  one migration. `parked`: valid, not now. `decision-gated`: reopens a §5 guardrail; goes to the user
  with its evidence, not designed. The `breaking-change` lens fails any 8.1.x/8.2.0 RFC that breaks.
- **Verdict before implementation.** `survives-with-changes` ≠ implement as written. Implementers read
  every verdict's `required_changes` first (the `Cond` and parity-bridge lessons).
- **No silent caps.** Any truncation (top-N clusters, skipped angle) is logged in the artifact.

---

## 5. Guardrails

1. **Zero runtime dependencies** in the lib.
2. **Sync render hot path stays fast.** Bench regression is a verification input, not a follow-up.
3. **Escape by default.** `Raw` stays explicit.
4. **Type-safety.** Closed unions unless deliberately open (documented); brands for routes and ids. No
   mechanism may depend on inference through generic wrapper calls (proven dead end:
   `projects-template/project/pm/define-controller/decisions.md`).
5. **Instruction set.** Ship a primitive only if it needs library support. Components are user-land (`@jtdigital/ui`).
6. **Pure core.** No context/DI, no Fastify glue; those belong to the framework layer.
7. **Converge.** One way per job. An addition names what it replaces, or why nothing does.
8. **Naming.** `set*` overrides, `add*` accumulates; method name = Tailwind class prefix; variants are objects.
9. **Class-string contract.** Class-emitting changes land as vocab rows; `gen:vocab --check` green;
   extractor and eslint re-derive, never hand-edit.
10. **Runtime-grammar contract.** Every htmx name emitted exists in the pinned bundle; every class
    passes the pinned Tailwind oracle. A green build is not proof.
11. **Breaking = codemod-first.** Measured dry run, no aliases or shims, one bundled major.
12. **Enforcement over prose.** Net guideline lines go down every release; prose only for `prose-only` canon.
13. **Append-only styling**, except the decided family-keyed last-write-wins merge
    (`projects-template/project/pm/agent-fitness/fluent-html-batch/decisions.md`). No tailwind-merge semantics beyond it.

---

## 6. Seed backlog (known on 2026-09-30)

Finders start here and extend. Each seed becomes at least one finding with fresh measurement.

| Track | Seed | Source |
|---|---|---|
| A | No test asserts emitted htmx names exist in the pinned bundle (the check that would have caught `Partial()`) | scorecard addendum 2026-08-14 |
| A | Losing override `.apply(preset).p("8")` → `p-6 p-8`; merger decided, unbuilt | CHANGELOG 7.0.1; fluent-html-batch decisions |
| A | `.colspan` guess compiles as `colSpan` → `col-span-2`, not `colspan="2"`; unpinned in `setter-errors.test.ts` | scorecard finding 7 |
| B | `.nav("/team")` → `'string' is not assignable to 'HTMX'`, never names the fix | scorecard "did not move" |
| B | Missing `Match` case: actionable line is last of 8; pruned methods die as anonymous TS2339 | scorecard "did not move" |
| B | Out-of-mandate raw-string sinks: `setAction`, `setFormaction`, `AreaTag.setHref` | CHANGELOG 8.0.0 |
| B | `addAttribute("id"|"class"|"style")` compile-exclude | v6.0.1 parked-major |
| C | 108 methods at 0 call sites (361→253 callables); ~100-name frozen set | scorecard finding 6; CHANGELOG 8.0.0 |
| C | Lowercase-tail setter rename (F-D-160) | v6.0.1 parked-major |
| C | Guidelines: 117 inline code blocks vs 1 pointer to a compiling exemplar | scorecard "did not move" |
| D | htmx pinned at 4.0.0-beta6; every beta bump is a grammar-contract risk | `package.json` |
| D | Extractor still `3.0.0-unreleased` | extractor `package.json` |

---

## 7. Deliverables

`40-synthesis/`:
- **`curation.md`**: the user's decisions (Wave 3.5). Everything below is generated from it.
- **`v8-spec.md`**: every curated change with final signatures, lane, and enforcement layer.
- **`roadmap.md`**: buckets 8.1.x · 8.2.0 · 9.0.0 · parked · decision-gated · rejected (with reasons).
- **`changelog-draft.md`**: ready-to-paste entries (title-only headers, no dates: this repo's convention).
- **`codemods.md`**: one entry per 9.0.0 change: map, receiver check, measured dry run.
- **`enforcement-ledger.md`**: rule → layer → verbatim error → prose lines deleted.
- **`guidelines-update.md`**: the net-negative patch against `guidelines/web-development/**`.
- **`lockstep.md`**: per-repo change list (extractor, eslint, guidelines, template, ui) and publish order
  (peer-dep constraints first).
- **`scorecard-prediction.md`**: predicted per-dimension delta, summed from `dims_predicted`.

`50-juxtaposition/` (after implementation): required-changes applied / partial / missing per RFC, and a
new dated scorecard row. A dimension that did not move as predicted is a finding for the next run.

*Traceability: `roadmap.md → RFC.resolves → F-*.measure/evidence → src/…:line or census row`.*
