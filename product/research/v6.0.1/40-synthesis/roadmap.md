# fluent-html v6.0.1 / 6.1.0 — Roadmap

> **Wave-4 ROADMAP.** Generated from the 9 surviving RFCs and the barrier merge
> ([`_merge.md`](./_merge.md)). Three buckets: **6.0.1** (patch — behavior fixes, no
> public-shape change), **6.1.0** (minor — additive only), and **parked-major / wontfix**.
>
> **Constitution recap (post-release form).** 6.0.1 = behavior fixes with **no public-shape
> change** (`api_surface: []`); 6.1.0 = **additive** only; anything needing a break is **parked
> for a major** — never smuggled into a patch/minor. Instruction-set, not components. Class-emitting
> methods update the tailwind-extractor + eslint vocab in lockstep. Every public-surface change
> carries its `guidelines/web-development/**` edit **and** lib-own docs (README/JSDoc/CHANGELOG).

---

## 0. Verdict & ship list at a glance

All 9 survivors are GREEN in their self-assigned lanes — zero hard conflicts, no lane
reassignment, no rejection on merge. Four would-be-breaks are correctly parked.

| Bucket | RFC | Title | Prio | Effort | Breaking | Class-emit |
|---|---|---|---|---|---|---|
| **6.0.1** | A-006 | Close 3 escape/injection holes (hx-preload / data-* keys / script double-escape) | **P0** | M | false | no |
| **6.0.1** | A-003 | Eliminate duplicate-attribute emission (dedup toggles; reserve id/class/style) | **P0** | S | false | no |
| **6.0.1** | A-001 | Boundary-aware route-param substitution (shared helper) | **P1** | S | false | no |
| **6.0.1** | A-007 | HTMX serialization grammar repair (hx-status / trigger / ignore→hx-disable) | **P1** | M | false | no |
| **6.0.1** | A-002 | Context sync-only contract + context/streaming tests into CI | **P1** | S | false | no |
| **6.0.1** | A-004 | Extractor↔eslint class-vocab integrity (units, parity guard) | **P2** | M | false | no (is the guard) |
| **6.1.0** | B-008 | fetchpriority setter + head-element literal unions | **P0** | M | additive | no (attrs) |
| **6.1.0** | B-010 | Native Popover / Commands / CSS anchor positioning | **P1** | M | additive | **YES (3)** |
| **6.1.0** | C-005 | MatchValue / Cond / Intersperse combinators | **P1** | S | additive | no |

**Release bundles.** `ships_with` clusters: **6.0.1** = {A-001, A-002, A-003, A-004, A-006,
A-007} cut as one patch. **6.1.0** = {B-008, B-010, C-005} cut as one minor. A-004 ships in 6.0.1
but **polices** B-010 in 6.1.0 (its reverse-parity guard fails CI if B-010's vocab rows aren't
registered).

---

## 1. Sequencing principles

1. **Security and invalid-HTML first.** Within the patch, P0 = the two fixes that emit
   bad/dangerous bytes to every page (A-006 security, A-003 invalid HTML). Everything else is a
   correctness bug reachable from typed code, or tooling.
2. **`serialize.ts` ordering is load-bearing.** Three patch RFCs edit `src/render/serialize.ts`
   (A-006, A-003, A-007). Land **A-006 → A-003 → A-007** to avoid mechanical churn; A-007 must not
   re-touch the `hx-preload` line A-006 owns.
3. **One parity-fixture edit, not three.** A-003 + A-006 both change serializer output — they add
   their fixtures to the single `render ≡ renderToIterable` parity/fuzz suite **once**, coordinated.
4. **Patch ships before minor.** 6.0.1 is a clean behavior-only patch; 6.1.0's additive surface
   builds on a corrected serializer. A-004's vocab machinery (6.0.1) must exist before B-010's
   class emitters (6.1.0) can satisfy the lockstep guard.
5. **Class-vocab lockstep is atomic.** B-010's three `custom()` vocab rows + regenerated
   `vocab.generated.ts` + drift test land in the **same change** as its emitters.
6. **One CHANGELOG section per release.** Collapse the per-RFC drafts into a single `## [6.0.1]`
   (`### Security` / `### Fixed` / `### Docs & Tests`) and a single `## [6.1.0]` (`### Added`).

**Scoring.** `score = impact × pain × reach / effort` (rubric). Reach is high for every survivor:
the patch fixes emit on the render hot path (every page); the minor adds head-element / control-flow
surface used on most pages. Effort: S = 1, M = 2. Scores below are relative ordering aids, not
absolutes.

---

## 2. Bucket A — 6.0.1 (patch: behavior fixes, no public-shape change)

> Every entry is `api_surface: []`. Output changes **only** for inputs that were already
> malformed, malicious, or incorrect; benign/well-typed inputs are **byte-identical**. The output
> delta each causes is stated explicitly (constitution requirement for the patch lane).

### P0 — A-006 · Close three escape/injection holes  *(score: high×high×high / M ≈ top)*
```yaml
rfc: RFC-A-006
milestone: 6.0.1
priority: P0
effort: M
breaking: false
ships_with: [RFC-A-001, RFC-A-002, RFC-A-003, RFC-A-004, RFC-A-007]
```
**Summary.** Hardens the untyped-caller boundary on three serializer/validation paths so the runtime
honors contracts the types already promise. Security fix — ships first.

**Output delta (before → after):**
- **hx-preload string** now routes through `escapeAttr` like every other `hx-*` string.
  `preload: 'mouseover" onload="alert(1)'` → `hx-preload="mouseover&quot; onload=&quot;alert(1)"`
  instead of breaking out of the attribute. Typed `"mousedown"|"mouseover"` path byte-identical.
- **setDataAttrs key** now runs through `validateAttributeKey` (same guard as `setAria`): a
  markup-breaking / prototype-pollution / `on*` key **throws** instead of emitting injectable HTML.
  Well-formed keys (`{ userId }` → `data-user-id`) unchanged.
- **Script body** now neutralizes the `<!--` and `<script` openers (not only `</script`):
  `<!--<script>` → `<\!--<\script>`, blocking the HTML double-escaped break-out. Benign scripts
  (no `<!--`/`<script`/`</script` substrings) byte-identical.

**Placement.** Patch — pure hardening, no symbol added/reshaped. Land **first** in `serialize.ts`
(owns the `hx-preload` line + `sanitizeRawContent`); `setDataAttrs` change is in `core/tag.ts`.
**Dependencies.** None. Must land before A-003 and A-007 in `serialize.ts`. Shares the parity-fixture
edit with A-003. **Migration.** More-correct output; only malformed/malicious input changes (one new
fail-fast throw on bad `data-*` keys — same failure mode `addAttribute`/`setAria` already have).
**Guideline updates.** `fluent-html.md` (escaping note), `htmx.md` (preload ✓/✗).

### P0 — A-003 · Eliminate duplicate-attribute emission  *(score: high×high×high / S ≈ top)*
```yaml
rfc: RFC-A-003
milestone: 6.0.1
priority: P0
effort: S
breaking: false
ships_with: [RFC-A-001, RFC-A-002, RFC-A-004, RFC-A-006, RFC-A-007]
```
**Summary.** `buildAttrs` now emits each attribute name **at most once** with a fixed precedence:
dedicated setter (id/class/style) > generic bag > bare toggle. Kills invalid HTML emitted to pages.

**Output delta (before → after):**
- `Input().toggle("disabled").toggle("disabled")` → `<input disabled>` (was `<input disabled disabled>`).
- `Div("x").setId("a").addAttribute("id","b")` → `<div id="a">x</div>` (was `id="a" id="b"`; dedicated
  setter wins, bag `id` skipped).
- `Button("Save").setClass("btn").addAttribute("class","danger")` → `class="btn"` (fluent class
  string authoritative; was duplicate `class`).
- `Input().toggle("required").addAttribute("required","")` → `<input required="">` (value form wins,
  bare toggle dropped).
- Any tag not previously duplicating a name: **byte-identical**.

**Placement.** Patch — `buildAttrs`/`toggle` keep signatures; `RESERVED_BAG_KEYS` is a module-level
`Set`. The would-be-breaking `addAttribute("id"|"class"|"style")` overload is **parked** (see §4).
**Dependencies.** Land **after A-006** in `serialize.ts` (disjoint region — `buildAttrs` vs A-006's
`hx-preload`/script paths). Shares the parity-fixture edit with A-006. **Migration.** More-correct
output equal to what a spec browser already resolved the old markup to; no benign tag changes.
**Guideline updates.** None (no public surface; existing `addAttribute` ✗ guidance now matches engine).

### P1 — A-001 · Boundary-aware route-param substitution  *(score: high×high×high / S)*
```yaml
rfc: RFC-A-001
milestone: 6.0.1
priority: P1
effort: S
breaking: false
ships_with: [RFC-A-002, RFC-A-003, RFC-A-004, RFC-A-006, RFC-A-007]
```
**Summary.** Route callable and `.resolve()` collapse to one shared `substituteParams` helper that
matches each `:name` on an identifier boundary and replaces all occurrences.

**Output delta (before → after):**
- Path `/orgs/:id/users/:idCard` with `{ id: 42, idCard: "AB-9" }` → `/orgs/42/users/AB-9`
  (was `/orgs/42/users/42Card` — `:id` matched inside `:idCard`).
- Repeated param `/a/:id/b/:id` with `{ id: 7 }` → `/a/7/b/7` (was a thrown unresolved-param error —
  only the first occurrence was replaced).
- Single-param / non-prefixing paths: **byte-identical**.

**Placement.** Patch — internal helper, no exported symbol; closes a runtime gap the types already
promised (`ExtractParams` yields both names; runtime corrupted the result). **Dependencies.** None
(`src/routes.ts` only, no serialize.ts touchpoint). **Migration.** More-correct URLs; only
previously-broken paths change. **Guideline updates.** None — existing `.resolve()` guidance stays accurate.

### P1 — A-007 · HTMX serialization grammar repair  *(score: high×high×high / M)*
```yaml
rfc: RFC-A-007
milestone: 6.0.1
priority: P1
effort: M
breaking: false
ships_with: [RFC-A-001, RFC-A-002, RFC-A-003, RFC-A-004, RFC-A-006]
```
**Summary.** Fixes three malformed HTMX emission paths: spaced `hx-status` swaps, the
`HX-Trigger` parse-back anti-pattern, and the inert `hx-ignore="true"`.

**Output delta (before → after):**
- **hx-status swap with modifiers** (`swap: "outerHTML scroll:top"`): modifier now stays bound to
  the swap directive (emitted as discrete `swap:`/modifier tokens) instead of orphaning `scroll:top`
  and leaking into `target:`. Single-word swaps byte-identical.
- **HxResponse.trigger**: accumulated in a structured `Map`, serialized once at `build()`.
  `.trigger("123").trigger("itemSaved")` → `HX-Trigger: "123, itemSaved"` (was `"123"` — the
  JSON-parseable name dropped the later trigger). Detailed events → JSON form unchanged.
- **ignore**: `{ ignore: true }` → `<div hx-disable>` (was the inert `hx-ignore="true"`).

**Placement.** Patch — types already correct; only emitted bytes change. **Dependencies.** Land
**after A-006 and A-003** in `serialize.ts`; A-007 must **not** re-touch A-006's `hx-preload` line.
**Pre-merge:** pin the exact htmx 4 disable-processing attribute name (`hx-disable`) with a test.
The `disable`/`ignore` attribute-name split is **parked** (see §4). **Migration.** More-correct
output; the old `hx-ignore` was inert so no working behavior regresses. **Guideline updates.**
`htmx.md` (spaced-swap note, `ignore` row, multi-trigger note).

### P1 — A-002 · Context sync-only contract + tests into CI  *(score: high×med×high / S)*
```yaml
rfc: RFC-A-002
milestone: 6.0.1
priority: P1
effort: S
breaking: false
ships_with: [RFC-A-001, RFC-A-003, RFC-A-004, RFC-A-006, RFC-A-007]
```
**Summary.** Documents the process-global context stack's sync-only contract (never hold an `await`
across a live scope) and wires the never-run `context.test.ts` into CI plus a streaming
context-isolation test.

**Output delta.** **None** — runtime byte-identical. JSDoc + `package.json` test lists + a new
streaming test only. The win is correctness coverage: context surface goes from 0% CI coverage to
fully exercised, and the latent concurrency hazard becomes a stated rule.

**Placement.** Patch — docs + test wiring, no runtime change. True async isolation
(AsyncLocalStorage / render-id token) is **parked** (see §4) — contradicts zero-deps + sync hot path.
**Dependencies.** None. **Migration.** No action. **Guideline updates.** `CLAUDE.md` (sync-only
bullet), `fluent-html.md` (async-hazard note under Scoped Context).

### P2 — A-004 · Extractor↔eslint class-vocab integrity  *(score: high×med×med / M)*
```yaml
rfc: RFC-A-004
milestone: 6.0.1
priority: P2
effort: M
breaking: false
ships_with: [RFC-A-001, RFC-A-002, RFC-A-003, RFC-A-006, RFC-A-007]
```
**Summary.** Tooling/test integrity: stops the extractor over-emitting spurious classes for nested
`.on()/.at()`, stops it swallowing call expressions as class tokens, single-sources the CSS unit
list (`VOCAB_UNITS`), and adds a **reverse parity guard** (every class-emitting prototype method must
be in `classVocab`). This is the lockstep machinery itself.

**Output delta.** **No core-lib runtime change.** Extractor output becomes a **strict subset** of
today's (fewer, never-more safelisted classes — `hover:focus:bg-red-500` no longer also emits
`hover:bg-red-500` / `bg-red-500`; `setHtmx(routes.list)` no longer leaks as a class token). A
smaller safelist is always safe (over-broad only bloats CSS). `VOCAB_UNITS` is a new symbol only in
the eslint plugin's **generated** (non-semver-public) file.

**Placement.** Patch — tooling/test only, `api_surface: []`. **Dependencies.** None, but **polices
B-010**: its reverse-parity guard fails CI on B-010's anchor emitters unless their vocab rows are
registered. A-004 (6.0.1) lands first → B-010 (6.1.0) must register its rows to stay green.
**Migration.** No action; safelist shrinks. **Guideline updates.** None.

---

## 3. Bucket B — 6.1.0 (minor: additive only)

> Each adds only new symbols or **open-union widenings** that keep every v6.0.0 caller compiling.
> No existing signature narrows. Migration = **no action**.

### P0 — B-008 · fetchpriority + head-element literal unions  *(score: high×high×high / M)*
```yaml
rfc: RFC-B-008
milestone: 6.1.0
priority: P0
effort: M
breaking: additive
ships_with: [RFC-B-010, RFC-C-005]
```
**Summary.** Adds `setFetchPriority('high'|'low'|'auto')` to `Img`/`Link`/`Script`/`Iframe` and
retypes the bare-`string` head-element setters to open unions: `LinkElementRel`, `LinkAs`,
`LinkType`, `ScriptType`, `MetaName`, `Charset`, plus `Base().setTarget` reusing `BrowsingContext`.
Retires the Track-D bare-string head surface (absorbs F-D-101/F-D-102) and lands the Core Web Vitals
priority hint as a typed setter instead of `addAttribute`.

**Added surface.** 7 types + 4 `setFetchPriority` setters (+ fields) + 6 retyped setters.
**Output.** Byte-identical for every value already valid — unions are compile-time only;
`setFetchPriority` emits `fetchpriority="…"` via standard schema-key serialization.

**Placement.** Minor — additive. Open-union widening (`… | (string & {})`) keeps every existing call
site compiling; `FetchPriority` is closed (fixed 3-value enum). **Dependencies.** None — disjoint
symbol set from B-010/C-005 (the `ScriptTag.setType` near-miss is touched by B-008 alone).
**Class-vocab.** Does **not** trigger lockstep — emits HTML attributes, not Tailwind classes.
**Migration.** No action. **Guideline updates.** `performance.md` (resource hints + LCP promotion),
`fluent-html.md` (head-element unions); README + JSDoc + CHANGELOG.

### P1 — B-010 · Native Popover / Commands / anchor positioning  *(score: high×high×med / M)*
```yaml
rfc: RFC-B-010
milestone: 6.1.0
priority: P1
effort: M
breaking: additive
ships_with: [RFC-B-008, RFC-C-005]
```
**Summary.** Typed primitives for three native platform features: the Popover API
(`setPopover`/`setPopovertarget`/`setPopovertargetaction`), invoker Commands on `<button>`
(`setCommand`/`setCommandfor`, a JS-free, nonce-free alternative to the `openDialog`/`closeDialog`
behaviors, which **remain**), and CSS anchor positioning class emitters
(`anchorName`/`positionAnchor`/`positionArea`). All targets are `Id`-typed; state/action/command
unions are closed (Command has the spec `--${string}` author-command arm).

**Added surface.** 3 types (`PopoverState`, `PopoverAction`, `CommandFor`, `TailwindPositionArea`) +
8 methods + **3 class-emitting** methods. **Output.** Existing output byte-identical;
`openDialog`/`closeDialog`/`BooleanAttribute` untouched. New `<button>` schema keys serialize only when set.

**Placement.** Minor — additive; nothing removed or reshaped. **Dependencies.** **Hard lockstep on
A-004** (6.0.1): the three `custom()` vocab rows (`[anchor-name:--…]`, `[position-anchor:--…]`,
`position-area-…`) + regenerated `vocab.generated.ts` + drift test must land **atomically** with the
emitters, or A-004's reverse-parity guard fails CI. **Class-vocab.** **TRIGGERS Guardrail 7** — the
only class-emitting survivor; popover/command setters emit attributes (no vocab impact), the three
anchor methods emit classes (vocab rows required). **Migration.** No action; `openDialog`/`closeDialog`
deprecation is **parked** (see §4). **Guideline updates.** `htmx.md` (native-interactivity section),
`fluent-html.md` (anchor helpers), `CLAUDE.md` (`.behavior()` steer); README + JSDoc + CHANGELOG.

### P1 — C-005 · MatchValue / Cond / Intersperse combinators  *(score: med×med×high / S)*
```yaml
rfc: RFC-C-005
milestone: 6.1.0
priority: P1
effort: S
breaking: additive
ships_with: [RFC-B-008, RFC-B-010]
```
**Summary.** Three additive control combinators that are the value/predicate analogues of shipped
`Match`/`ForEach`: `MatchValue` (value→value exhaustive map that keeps the literal union, not `View`),
`Cond` (first-truthy-wins guard chain over independent predicates, mandatory default), `Intersperse`
(separator between mapped Views, never after the last). Pulls value-lookup ternaries and guard-chain
ternaries back onto the typed fluent API.

**Added surface.** 3 combinators in `src/control/` (`match-value.ts`, `cond.ts`, `Intersperse` in
`iteration.ts`), re-exported from `src/index.ts`. **Output.** Additive; emits through the existing
`View` pipeline (no new sink).

**Placement.** Minor — additive; no existing signature touched, no name collision with the export
list. **Dependencies.** None — `src/control/` additions are disjoint from A-002's context-only
edits (different files; and they don't even share a lane). **Class-vocab.** Does not trigger — emits
no classes. **Migration.** No action. **Guideline updates.** `CLAUDE.md` (control-flow bullet),
`fluent-html.md` (Control Flow block); README + JSDoc + CHANGELOG. Ship `MatchValue` only (no `pick`
alias — converge).

---

## 4. Bucket C — parked-major / wontfix

> Considered and deliberately deferred. Each needs a breaking change (parked for a major) or was
> rejected. **Never** smuggled into 6.0.x / 6.1.0.

### Parked-major

| Item | From | Why parked | Seed |
|---|---|---|---|
| `addAttribute("id"\|"class"\|"style", …)` overload that excludes the reserved keys | A-003 | A compile-time block turns currently-compiling code into a compile error → **breaking**. The patch fixes the runtime (dedicated setter wins) instead. | The right long-term compile-time guarantee; track so it isn't forgotten. |
| `disable` (disabledElt) attribute-name split so it never shares `hx-disable` with `ignore`'s bare boolean | A-007 | Renaming the emitted attribute for the `disable` field (e.g. `hx-disabled-elt`) is a **breaking emit change**. A-007 ships only the additive `ignore → hx-disable` bare boolean (different attribute, no markup collision). | Confirm the exact htmx 4 names first. |
| True async-isolated context (AsyncLocalStorage or render-id token threaded through `scope`) | A-002 | Pulls a Node-only dep into the sync hot path and/or changes the `scope` signature → **breaking + contradicts zero-deps + sync-hot-path** guardrails. The patch documents + tests the sync-only boundary instead. | If a future major wants real isolation. |
| Deprecation/removal of `openDialog`/`closeDialog` behaviors | B-010 | Removal is **breaking**. B-010 ships Commands/Popover **alongside** them; the guideline merely steers new code to the native path. | Eventual deprecation once Commands adoption is broad. |

### Wontfix

| Item | From | Why declined |
|---|---|---|
| RFC-C-009 — Form&lt;T&gt; binding completeness (checkbox/radio, richer select, field-arrays, aria-invalid, typed option/hidden values) | Track C | Rejected upstream; **not reinstated** on merge. No surviving RFC depends on it, and nothing in the 6.0.1/6.1.0 set leaves a Form&lt;T&gt; gap that blocks a survivor. |
| `ThemeColor()` / `Viewport()` / `ColorScheme()` meta combinators | B-008 (alt) | Opinionated content-builders → **user-land** per the instruction-set guardrail. The typed `setName` union delivers the safety; the content string stays the author's. |
| `Popover()` / `Tooltip()` / Modal components | B-010 (alt) | Opinionated overlays → **user-land** (`@jtdigital/ui`). Core ships the primitives (Popover API + Commands + anchor positioning) only. |
| `pick` alias for `MatchValue` | C-005 (alt) | Two names for one thing violates the **converge** rule. Ship `MatchValue` only. |
| `boolOrStr('preload')` table refactor for hx-preload | A-006 (alt) | Would emit `hx-preload="true"` for the boolean case, changing the shipped bare-flag contract → **public-output change**, not a security patch. The minimal `escapeAttr` wrap preserves output exactly. Fine as a future 6.1.0 cleanup, out of scope here. |

---

## 5. Merge-blocking action items (carry into implementation)

Sequencing/hygiene only — no redesign. From `_merge.md` §8:

1. **serialize.ts ordering:** land **A-006 → A-003 → A-007**; A-007 must not re-touch A-006's
   `hx-preload` line.
2. **Shared parity-test edit:** A-003 + A-006 add serializer fixtures to the single
   `render ≡ renderToIterable` suite **once**, not twice.
3. **CHANGELOG dedupe:** collapse to one `## [6.0.1]` (Security / Fixed / Docs & Tests) + one
   `## [6.1.0]` (Added) section — do not create six `[6.0.1]` headers.
4. **B-010 vocab lockstep:** register the three `custom()` rows + regenerate `vocab.generated.ts` +
   drift test **atomically** with the emitters, or A-004's reverse-parity guard fails.
5. **A-007 pre-merge:** pin the exact htmx 4 disable-processing attribute name (`hx-disable`) with a test.
6. **Doc-section ownership:** the multi-RFC guideline files (`fluent-html.md` — A-002/A-006/C-005/B-008/B-010;
   `htmx.md` — A-006/A-007/B-010; `CLAUDE.md` — A-002/C-005/B-010) have disjoint sections; assign
   ownership per the `_merge.md` §3 table to prevent double-edits.
