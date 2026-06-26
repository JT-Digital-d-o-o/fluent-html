# Wave-4 MERGE — fluent-html v6.0.1 / 6.1.0 reconciliation

**Role:** Wave-4 barrier merge. Reconcile cross-track conflicts, confirm each survivor's
ship lane, assign P0/P1/P2 within each lane, and flag class-emitting changes that need the
extractor + eslint vocab updated in lockstep.

**Inputs:** 9 surviving RFCs (A-001…A-004, A-006, A-007 → 6.0.1; C-005, B-008, B-010 → 6.1.0).
RFC-C-009 rejected (see §6). Track D produced no standalone RFC — its surviving type-safety
findings (F-D-101 `<link>`/`<base>` bare-string rels, F-D-102 MIME/charset typing) were
folded into **RFC-B-008**; the `track-d-type-safety/` design folder is empty by design
(Track D was reshaped-by-deletion in v6).

---

## 0. Verdict at a glance

All 9 survivors are **GREEN to proceed in their assigned lanes** — no lane reassignment, no
parked-major escalation, no rejection on merge. There are **zero hard conflicts** (no two RFCs
edit the same symbol incompatibly). There are **four soft touchpoints** that need ordering or a
shared-edit note (§3), and **one** class-emitting RFC that triggers the lockstep vocab rule (§4).

| RFC | Track | Lane (confirmed) | Prio | api_surface | class-emitting | Conflicts |
| --- | --- | --- | --- | --- | --- | --- |
| A-006 | A | 6.0.1 | **P0** | none | no | none (file-shares serialize.ts) |
| A-003 | A | 6.0.1 | **P0** | none | no | shares `buildAttrs` w/ A-006 region |
| A-001 | A | 6.0.1 | **P1** | none | no | none |
| A-007 | A | 6.0.1 | **P1** | none | no | shares serialize.ts + htmx.md w/ A-006 |
| A-002 | A | 6.0.1 | **P1** | none | no | shares fluent-html.md/CLAUDE.md w/ others |
| A-004 | A | 6.0.1 | **P2** | none (eslint gen-only) | **vocab tooling** | none (is the lockstep guard) |
| B-008 | B | 6.1.0 | **P0** | 7 types + 4 setters + 6 retypes | no (attrs only) | absorbs F-D-101/102 |
| B-010 | B | 6.1.0 | **P1** | 3 types + 8 methods + 3 vocab rows | **YES — 3 classes** | none |
| C-005 | C | 6.1.0 | **P1** | 3 combinators | no | none |

---

## 1. Conflict reconciliation (cross-track collision matrix)

The merge brief flagged three collision archetypes to hunt: overlapping `api_surface`, a
Track-A fix colliding with a Track-D type change, and a Track-A fix colliding with a Track-C
combinator. Findings on each:

### 1a. Overlapping `api_surface` — NONE

Every 6.0.1 RFC (A-001..A-004, A-006, A-007) ships `api_surface: []` — pure behavior fixes,
no public symbol added or reshaped. They **cannot** collide on public surface; collisions are
only possible at the *file/region* level (handled in §3).

The 6.1.0 RFCs export disjoint symbol sets:
- **B-008**: `FetchPriority`, `LinkElementRel`, `LinkAs`, `LinkType`, `ScriptType`, `MetaName`,
  `Charset`; `setFetchPriority` (×4 tags); retyped `setRel/setAs/setType/setName/setCharset/setTarget`.
- **B-010**: `PopoverState`, `PopoverAction`, `CommandFor`, `TailwindPositionArea`;
  `setPopover/setPopovertarget/setPopovertargetaction`, `setCommand/setCommandfor`,
  `anchorName/positionAnchor/positionArea`.
- **C-005**: `MatchValue`, `Cond`, `Intersperse`.

No name appears in two RFCs. The one nominal near-miss is **`ScriptTag.prototype.setType`** — but
only B-008 touches it (retype to `ScriptType`); B-010's command surface is `ButtonTag`-only and
never touches `ScriptTag`. Confirmed disjoint.

### 1b. Track-A fix vs. Track-D type change — RESOLVED BY ABSORPTION

There is no live Track-D RFC. The only place a Track-A correctness fix sits adjacent to a
type change is **`<link>`/`<script>`/`<meta>` setters**:
- B-008 *retypes* `LinkTag.setRel/setAs/setType`, `ScriptTag.setType`, `MetaTag.setName/setCharset`,
  `BaseTag.setTarget` (the old F-D-101/F-D-102 work).
- No 6.0.1 Track-A RFC touches those setters' *runtime* — A-003 (buildAttrs dedup) and A-006
  (escape holes) operate on the generic attribute bag / script body / `hx-preload`, not on the
  `<link>`/`<meta>`/`<script>` schema-key setters.

→ **No conflict.** B-008's retypes are signature-only (runtime byte-identical); A-003/A-006's
fixes are runtime-only (signature-identical). They are orthogonal even where they touch the same
tags. B-008 correctly carries the absorbed F-D-101/102 in its `resolves:` list.

### 1c. Track-A fix vs. Track-C combinator — NONE

C-005 adds `MatchValue`/`Cond`/`Intersperse` in `src/control/`. No Track-A 6.0.1 fix touches
`src/control/` except A-002, which only *documents* and *tests* `src/control/context.ts` (no
runtime change, different file from the new `match-value.ts`/`cond.ts`/`iteration.ts` additions).
`Intersperse` lands in `iteration.ts` alongside the existing `ForEach`; A-002 does not edit
`iteration.ts`. → **No conflict.** (Lane note: they don't even share a lane — A-002 is 6.0.1,
C-005 is 6.1.0 — so they serialize naturally.)

### 1d. The one real cross-track adjacency worth naming: B-010 ⇄ A-007 on `hx-disable`

B-010 replaces the `openDialog`/`closeDialog` *JS-emitting behaviors* with native
Commands/Popover (additive; the behaviors stay). A-007 separately re-points `ignore →
hx-disable` (bare boolean). Both touch "disable/close" semantics but in **different layers**
(B-010 = `command`/`popover` attributes + behavior layer; A-007 = `hx-disable` HTMX attr) and
**different lanes** (6.1.0 vs 6.0.1). No emitted-attribute collision. A-007 itself already parks
the genuinely-breaking `disable`-field rename (see §5). → **No conflict; note for sequencing only.**

---

## 2. Lane confirmation

Every survivor's self-assigned lane holds under the constitution (§5: 6.0.1 = behavior fix, no
public-shape change; 6.1.0 = additive; breaking = parked-major).

- **6.0.1 (all six Track-A):** each is `api_surface: []`, `breaking: false`, output changes
  **only** for inputs that were already malformed/malicious/incorrect. Verified against the
  patch-lane rule — none smuggle a public-shape change. **CONFIRMED 6.0.1.**
  - A-003 explicitly parks its would-be-breaking `addAttribute("id"|"class"|"style")` overload
    block → parked-major (correct; not pulled into the patch).
  - A-007 explicitly parks the `disable`-field `hx-disable` rename → parked-major (correct).
  - A-002 explicitly parks any `AsyncLocalStorage`/render-id async-isolation mechanism →
    parked-major (correct; the RFC documents the boundary instead of moving it).
- **6.1.0 (B-008, B-010, C-005):** each adds only new symbols or **open-union widenings**
  (B-008's `string → (… | (string & {}))` keeps every v6.0.0 call site compiling). No existing
  signature narrows. **CONFIRMED 6.1.0 additive.** None require a break; nothing escalates to
  parked-major.

**Parked-major ledger (for the record, not shipping in 6.0.x/6.1.0):**
1. A-003 — `addAttribute` overload excluding `id|class|style` (compile-time collision block).
2. A-007 — rename the `disable` (disabledElt) emitted attribute so it never shares `hx-disable`
   with `ignore`'s bare boolean (confirm exact htmx 4 name before any major).
3. A-002 — true async-isolated context (AsyncLocalStorage or render-id token).
4. B-010 (latent) — eventual deprecation/removal of `openDialog`/`closeDialog`.

---

## 3. Sequencing — shared files/regions (soft touchpoints, not conflicts)

Because the six 6.0.1 fixes cluster in two files, land them in this order to avoid mechanical
merge churn. None are semantic conflicts; all are "same file, adjacent edits."

**`src/render/serialize.ts`** is touched by A-003, A-006, A-007 (three RFCs). Distinct regions,
but land **A-006 first** (security), then **A-003** (`buildAttrs` dedup), then **A-007**
(`buildStatusConfig` / `ignore` / `hx-preload` is in A-006's region — coordinate the
`hx-preload` line: A-006 owns the `escapeAttr` wrap there; A-007 must not re-touch it):
1. **P0 A-006** — `escapeAttr` on `hx-preload` (serialize.ts:187), `sanitizeRawContent` openers
   (serialize.ts:223+), plus `setDataAttrs` key validation in `core/tag.ts`.
2. **P0 A-003** — `buildAttrs` reserved-key skip + toggle dedup (serialize.ts:235+). Disjoint
   region from A-006's `hx-preload`/script paths.
3. **P1 A-007** — `buildStatusConfig` (serialize.ts:212+), `ignore → hx-disable`, trigger
   accumulator in `patterns.ts`. The `hx-preload` line is A-006's; A-007 leaves it alone.

> **Lockstep test note (A-003 + A-006):** both change serializer output; the existing
> `render ≡ renderToIterable` parity/fuzz suite must gain the new fixtures (duplicate-attr,
> escaped-preload, neutralized-script, validated data-key) so **both serializer copies** stay
> identical. This is a single shared test-file edit — coordinate so A-003 and A-006 don't each
> rewrite the parity fixtures independently.

**Guideline/doc files touched by multiple RFCs** (append-only, low collision risk, but assign
ownership of each file's section to avoid double-edits):

| Doc file | RFCs | Note |
| --- | --- | --- |
| `web-development/fluent-html.md` | A-002, A-006, C-005, B-008, B-010 | Distinct sections (context / escaping / control-flow / head-elements / anchor helpers). |
| `web-development/htmx.md` | A-006, A-007, B-010 | A-006 = preload note; A-007 = status/ignore/trigger; B-010 = new native-interactivity section. |
| `web-development/CLAUDE.md` | A-002, C-005, B-010 | A-002 = scoped-context bullet; C-005 = control-flow bullet; B-010 = `.behavior()` block. |
| `web-development/performance.md` | B-008 | Sole owner. |
| `CHANGELOG.md` | ALL | One `## [6.0.1]` block (A-001..A-007 fixes) + one `## [6.1.0]` block (B-008/B-010/C-005 added). Merge into single sections — do not create six `[6.0.1]` headers. |

> **CHANGELOG hygiene:** several RFCs each draft their own `## [6.0.1]` header. The merge must
> collapse these into **one** `[6.0.1]` section with `### Fixed` / `### Security` / `### Docs &
> Tests` subsections, and **one** `[6.1.0]` section with `### Added`. Flagged so the release
> editor dedupes.

---

## 4. Class-string contract — lockstep flags (Guardrail 7)

Guardrail 7: any new class-emitting method must update the tailwind-extractor + eslint-plugin
vocab in lockstep.

- **B-010 — TRIGGERS THE RULE.** It adds **three** class emitters: `anchorName` →
  `[anchor-name:--<id>]`, `positionAnchor` → `[position-anchor:--<id>]`, `positionArea` →
  `position-area-<area>`. The RFC already specifies registering them as `custom(...)` rows in
  `src/class-vocab/vocab.ts` with samples, from which the extractor (imports `classVocab`
  directly) and the eslint `vocab.generated.ts` (regenerated via `gen:vocab`) derive. **Merge
  requirement:** the vocab rows + regenerated `vocab.generated.ts` + the drift test must land in
  the **same change** as the lib emitters. The popover/command setters emit *attributes*, not
  classes — no vocab impact.
- **B-008 — does NOT trigger.** `setFetchPriority` and the retyped setters emit HTML
  **attributes** (`fetchpriority`, `rel`, `as`, `type`, `name`, `charset`, `target`), never
  Tailwind classes. Class vocab untouched. (Verified: no such tokens in the extractor/eslint maps.)
- **C-005 — does NOT trigger.** `MatchValue`/`Cond` return caller values; `Intersperse` emits
  through the existing `View` pipeline. No class emission.
- **A-004 — IS the lockstep machinery, not a consumer of it.** It adds no class-emitting method;
  it *tightens* extractor↔eslint↔lib sync (kills spurious classes, single-sources `UNITS` via a
  generated `VOCAB_UNITS`, adds the reverse parity guard). **Sequencing flag:** A-004's reverse
  parity guard ("every class-emitting prototype method must be in `classVocab`") will **fail CI
  on B-010** unless B-010's three `custom(...)` vocab rows are registered. Since A-004 ships in
  6.0.1 and B-010 in 6.1.0, A-004 lands first → B-010 *must* register its rows to stay green.
  This is the guard working as intended; call it out so B-010's author doesn't trip it. No
  reverse hazard (A-004 doesn't depend on B-010).

> **Net lockstep action items:** (1) B-010 lands vocab rows + regen + drift test atomically with
> its emitters; (2) A-004's `VOCAB_UNITS` generation and reverse-parity guard land in 6.0.1 and
> will police B-010's rows in 6.1.0.

---

## 5. Guardrail sweep (constitution §1–8) — all survivors

- **§1 zero runtime deps:** all pass. No RFC adds a lib runtime dependency (A-004's tooling
  changes are extractor/eslint/test-only; B-* are types+setters; C-005 is pure TS).
- **§2 SSR-only / sync hot path:** all pass. A-002 explicitly *documents* the sync-only context
  contract rather than adding async; no RFC adds async to the render path.
- **§3 escape-by-default:** A-006 *strengthens* it (closes three holes); A-003/A-007 never weaken
  escaping; B-*/C-005 add no new raw sink. Pass.
- **§4 no bare `string` where a literal union fits:** B-008 and B-010 are net *improvements*
  (replace bare-string setters with open/closed unions). No RFC introduces a bare `string`.
- **§5 additive-only lanes:** confirmed in §2; three would-be-breaks correctly parked.
- **§6 instruction-set, not components:** all pass. B-010 explicitly rejects a `Popover()`/
  `Tooltip()` component and ships primitives only; B-008 rejects `ThemeColor()`/`Viewport()`
  combinators to user-land; C-005 ships combinators (analogues of shipped `Match`/`ForEach`),
  not opinionated components. No cut helper (Modal/Alert/Table/Badge/Icon) is reintroduced.
- **§7 class-string lockstep:** see §4 — B-010 flagged, A-004 is the enforcement.
- **§8 guideline-sync:** every RFC with `api_surface ≠ []` carries its `guidelines/web-development/**`
  edits AND lib-own README/JSDoc/CHANGELOG. The `api_surface: []` RFCs (A-001/A-003/A-004) correctly
  carry CHANGELOG-only; A-002/A-006/A-007 add clarifying guideline notes despite empty
  `api_surface` (documented behavior change) — acceptable and covered.

---

## 6. Rejected (for the record)

- **RFC-C-009** — Form<T> binding completeness (checkbox/radio, richer select, field-arrays,
  aria-invalid, typed option/hidden values). Rejected upstream; **not** reinstated on merge. No
  surviving RFC depends on it, and nothing in the 6.0.1/6.1.0 set leaves a Form<T> gap that
  blocks another survivor. Confirmed out.

---

## 7. Final ship list & priorities

### Lane 6.0.1 (patch — behavior fixes, `api_surface: []`)
- **P0** `RFC-A-006` — close 3 escape/injection holes (security; ship first).
- **P0** `RFC-A-003` — eliminate duplicate-attribute emission (invalid-HTML correctness).
- **P1** `RFC-A-001` — boundary-aware route-param substitution.
- **P1** `RFC-A-007` — HTMX serialization grammar repair (hx-status / trigger / ignore→hx-disable).
- **P1** `RFC-A-002` — context sync-only contract + wire context/streaming tests into CI.
- **P2** `RFC-A-004` — extractor↔eslint vocab integrity (tooling/test; also the lockstep guard for B-010).

> Within-lane rationale: P0 = security + invalid-HTML emitted to every page; P1 = correctness
> bugs reachable from typed code (wrong URL, dropped trigger, inert attr) + the CI coverage gap;
> P2 = tooling-layer safelist correctness (over-broad safelist only bloats CSS, never breaks a page).

### Lane 6.1.0 (minor — additive)
- **P0** `RFC-B-008` — fetchpriority + head-element literal unions (Core Web Vitals; absorbs the
  Track-D F-D-101/102 type debt; high impact, no class-vocab touch).
- **P1** `RFC-B-010` — native Popover/Commands/anchor positioning (**class-emitting — lockstep
  required**; must register vocab rows or A-004's guard fails).
- **P1** `RFC-C-005` — MatchValue/Cond/Intersperse combinators.

> Within-lane rationale: B-008 P0 (broadest reach, retires the bare-string head surface, zero
> tooling risk); B-010 and C-005 P1 (additive DX/platform wins; B-010 carries the only lockstep
> obligation in the minor).

### Parked-major (do NOT ship in 6.0.x / 6.1.0)
addAttribute id/class/style overload (A-003) · disable/ignore attribute-name split (A-007) ·
async-isolated context (A-002) · openDialog/closeDialog deprecation (B-010).

---

## 8. Merge-blocking action items (carry into implementation)

1. **serialize.ts ordering:** land A-006 → A-003 → A-007; A-007 must not re-touch the
   `hx-preload` line A-006 owns. (§3)
2. **Shared parity-test edit:** A-003 + A-006 add serializer fixtures to the single
   `render ≡ renderToIterable` suite once, not twice. (§3)
3. **CHANGELOG dedupe:** collapse to one `[6.0.1]` + one `[6.1.0]` section. (§3)
4. **B-010 vocab lockstep:** register the three `custom(...)` rows + regenerate
   `vocab.generated.ts` + drift test atomically with the emitters, or A-004's reverse-parity
   guard fails. (§4)
5. **A-007 pre-merge confirm:** pin the exact htmx 4 disable-processing attribute name
   (`hx-disable`) with a test before merge. (RFC §Open questions)
6. **Doc-section ownership:** assign each multi-RFC guideline file's sections per the §3 table to
   prevent double-edits.

No survivor is blocked; all action items are sequencing/hygiene, not redesign.
