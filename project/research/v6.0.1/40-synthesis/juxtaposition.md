# v6.0.1 Master Reconciliation — Synthesis vs. Verdict

Reconciles, per RFC, the implementation **synthesis** (what shipped) against the **Wave-3 verdicts** (what each lens required). Every `missing`/`partial` finding was re-verified against the **working tree** (the actual 6.0.1 implementation, uncommitted vs `HEAD`), not against the juxtaposition snapshot, because the snapshot proved stale in one high-severity place.

**Verification method:** empirical render() probes against a freshly rebuilt `dist/`, plus direct reads of `src/`, `test/`, `CHANGELOG.md`, the RFC `.md` sources, and the guideline copies.

---

## ⚠️ Headline correction to the input snapshot

The juxtaposition input flagged **RFC-A-003 required-change #1 as `missing` / HIGH-severity silent data-loss** (`addAttribute("id", x)` with no `setId` rendering `<div></div>`). **This is FALSE against the shipped working tree.** The presence-gate fix is in place and the regression is closed:

- `src/render/serialize.ts:279` — `if ((key === 'id' && tid !== undefined) || (key === 'class' && tcls !== undefined) || (key === 'style' && tsty !== undefined)) continue;` — the exact per-key field-presence gate the correctness lens mandated (NOT the unconditional `continue` the snapshot described).
- Empirically confirmed against a rebuilt dist: `render(Div().addAttribute("id","b"))` → `<div id="b"></div>`; class/style likewise; `setId("a").addAttribute("id","b")` → `<div id="a"></div>` (dedicated wins).
- The mandated no-setter regression tests (cases a/b/c) **exist**: `test/attributes.test.ts:109-113` (no-setter still emits), `:116` (`setId(undefined)` keeps bag), `:119-127` (render ≡ renderToIterable parity over the collision corpus). The CHANGELOG (`CHANGELOG.md:219`) already carries the "skipped in favor of the dedicated setter" precedence wording.

The snapshot was taken against a transient pre-gate state. **All four A-003 correctness/breaking-change `missing`/`partial` findings (the HIGH + two MEDIUMs + the byte-identical-invariant partial) are RESOLVED.** They are recorded below in the audit trail, not the fix list.

> Caveat unrelated to A-003: `test/attributes.test.ts` currently fails to **load** because it imports the type-only `DateTimeInputTag` as a runtime value from `./forms.js` (`SyntaxError: ... does not provide an export named 'DateTimeInputTag'`). This is a test-harness/import defect that masks the whole file (so the green A-003 assertions don't actually run in CI right now). Out of scope for this reconciliation but worth a follow-up — it blocks the A-003 regression net from executing.

---

## 1. PRIORITIZED FIX LIST — real defects/gaps in shipped 6.0.1

Ordered high-severity first. Each is an item the verdict required that is **not** satisfied in the working tree.

### HIGH

**H1 — RFC-A-007 · breaking-change/correctness · resolve the htmx-4 disable-processing attribute name.**
`src/render/serialize.ts:191` emits bare ` hx-disable` for `{ ignore: true }`, but `CHANGELOG.md:296` records the opposite: "`hx-disable` is now `hx-ignore` in htmx 4". These name the same htmx-4 boolean and directly contradict each other; if the changelog is right, the shipped emit is **inert under htmx 4** and Fix 3 regressed. The htmx-4 Open Question was never truly resolved.
*Fix:* Verify against the pinned htmx version which boolean disables processing. If it is `hx-ignore`, flip `serialize.ts:191` and the assertion at `test/htmx.test.ts:294` to `hx-ignore`; reconcile `CHANGELOG.md:296` ↔ `:223` (they currently name opposite attributes). Do this **before** trusting the emit or updating any JSDoc/guideline that names the attribute.

### MEDIUM

**M1 — RFC-A-007 · correctness · false `resolves: [F-A-121]` claim + latent serializer defect.**
`buildStatusConfig` (`src/render/serialize.ts:219-220`) emits `target:` + value and `select:` + value verbatim into the space-delimited `hx-status:NNN` list, so `{ target: "closest tr" }` → `target:closest tr` — the exact orphaning F-A-121 cites. The RFC frontmatter (`RFC-A-007.md:5`) still claims `resolves: [F-A-121, …]`. Existing tests only use space-free selectors (`target:#errors`, `htmx.test.ts:174`), so the spaced case is unfixed **and** uncovered.
*Fix:* Confirm against htmx whether a spaced selector in `hx-status` misparses. If yes, repair `buildStatusConfig` (swap+target+select) in a follow-up and add a spaced-selector test; if htmx tolerates it, document the tolerance. Either way, drop the false `F-A-121` from `resolves:` until it is genuinely resolved.

**M2 — RFC-A-004 · breaking-change · extractor has no CHANGELOG (lib/tooling semver conflation).**
`fluent-html-tailwind-extractor` (v2.0.0) and the eslint plugin (v1.7.0) are versioned separately from the lib, but the extractor ships **no `CHANGELOG.md`** (verified MISSING). Its public-function behavior changes (F-A-160 `blankVariantBodies`, F-A-161 constrained `extractDefaultClasses` regex) are recorded only under lib `CHANGELOG.md:225-230` — exactly the conflation the breaking-change lens warned against.
*Fix:* Add `CHANGELOG.md` to `fluent-html-tailwind-extractor` documenting F-A-160/F-A-161 under its own 2.0.0; confirm the F-A-162 `VOCAB_UNITS` change is listed in the eslint plugin's `[1.7.0]` body. Add a one-line "downstream safelist snapshots will shrink — expected, CSS-safe" churn note.

**M3 — RFC-A-007 · type-safety · `HTMX.ignore` JSDoc never updated.**
`src/htmx.ts:242-243` still reads only `// Ignore htmx processing (was disable)` — no mention of the emitted attribute the RFC required.
*Fix:* Document the emitted attribute on the `ignore` field — but name the correct one (`hx-disable` vs `hx-ignore`) **only after H1 is resolved**.

**M4 — RFC-A-001 · correctness · the named genuine-defect case is untested (C3a).**
The longer-before-shorter ordering `/users/:idCard/x/:id` — the case the correctness lens names as the real v6.0.0 bug — is not asserted. `test/routes.ts:476-493` covers only shorter-before-longer (`/orgs/:id/users/:idCard`), repeated (`/a/:id/b/:id`), and the callable path. The helper is order-independent so it would pass, but the named defect ships uncovered.
*Fix:* Add to the A-001 describe: route `{ path: "/users/:idCard/x/:id" }`, assert `.resolve({ id:"9", idCard:"C" })` → `/users/C/x/9` (no throw, no `9Card` corruption).

---

## 2. LOW-severity open items (documentation / prose only — no shipped-code defect)

These are real but low-impact; batch them into the doc-reconciliation pass.

| ID | RFC | Lens | Gap | Fix |
|----|-----|------|-----|-----|
| L1 | A-001 | correctness | RFC worked example (`RFC-A-001.md:102-117`) still asserts the false `/orgs/42/users/42Card` corruption | Swap to a longer-before-shorter path that genuinely throws on v6.0.0; mark the `/orgs/:id/...` case as already-correct |
| L2 | A-001 | correctness | RFC Problem narrative (`RFC-A-001.md:28,33`) says "silently corrupted … no exception"; real dominant failure is a render-time throw via `assertNoUnresolvedParams` | Reword to "render-time throw with a narrow `encodeURIComponent`-bounded silent window"; re-justify priority |
| L3 | A-001 | type-safety | RFC (`:91,138`) claims the lookahead "exactly mirrors `ExtractParams`" — false; shipped JSDoc (`src/routes.ts:177`) is already correct | Cite the detector regex `:([a-zA-Z_]\w*)` not `ExtractParams`; replace "definitionally aligned" with the `escapeRegExp`/greedy-capture justification. No code change |
| L4 | A-007 | type-safety | `src/htmx.ts:64` still says `HxSwap` "Also accepts any valid swap string" — false (the union has no `\| string` escape) | Delete the false line. Standing doc defect, independent of the reverted Fix 1 |
| L5 | A-007 | type-safety | `htmx.md` lacks the multi-`.trigger()` accumulation note (RFC 272-275) | Add: `.trigger()` may be called repeatedly; bare events serialize as a comma list, detailed events as the JSON object form |
| L6 | A-007 | type-safety | `htmx.md` lacks the status-code modifier-swap note | Do NOT add a "preserved" claim until M1/F-A-121 is resolved; document real behavior after |
| L7 | A-004 | breaking-change/correctness | RFC prose still says extractor output is a "strict subset" (false — F-A-161 also emits new intact arbitrary tokens) and "no longer swallows call expressions" (overstated — dotted residue remains) | Reword `RFC-A-004.md §Compatibility` and the F-A-161 lines + `CHANGELOG.md:228` to the qualified phrasings |
| L8 | A-006 | correctness/type-safety | `RFC-A-006.md:144-153` still shows the superseded F-A-900 opener example; line 110 still carries the false prototype-pollution sentence | Annotate the F-A-900 block as superseded by the revert; strike line 110. Shipped JSDoc/CHANGELOG already correct |
| L9 | C-005 | combined | RFC/guideline prose still carries the unconditional "value flows straight into the fluent API" claim; CHANGELOG may carry a stale `pick` reference | Qualify in the guideline-sync pass (shipped JSDoc `match-value.ts:13-15` already correct); grep CHANGELOG for `pick` |
| L10 | A-001 | correctness | C3d byte-identical single-param is covered only incidentally (`test/routes.ts:249`, typedRoutes) | Optional: add one explicit single-param assertion anchored in the A-001 describe |

---

## 3. `must-apply-when-built` — steering for B-008 & B-010 (NOT yet implemented)

Neither RFC is implemented (grep clean). These are pre-conditions for their eventual builds; none is a current shipped defect.

### RFC-B-008 (fetchpriority + typed head open-unions) — 6 items

| Sev | Item | Action when building |
|-----|------|----------------------|
| MED | Export the 7 new types from `src/index.ts` | Add `export type` entries for FetchPriority, LinkElementRel, LinkAs, LinkType, ScriptType, MetaName, Charset to the block at `src/index.ts:25-36`. VERIFIED gap: CrossOrigin/InputMode/HttpEquiv exist in `html-types.ts` but are NOT re-exported, so html-types symbols are private by default — the api_surface/README would document non-exported symbols |
| MED | FetchPriority specifically must be among those 7 (user-land head combinators reference it) | Folds into the export row |
| LOW | Pin schema-key detail | Append bare lowercase `'fetchpriority'` to `defineSchemaKeys(...)` of ImgTag, LinkTag, ScriptTag, IframeTag (bare-string key, like `crossorigin`) |
| LOW | ScriptType open-tail-only | Define canonical as `'module' \| 'importmap' \| 'text/javascript' \| 'speculationrules' \| (string & {})`; omit the two `application/*json` data types; mark RFC Open Question resolved |
| LOW | Document deliberate non-retyping of sibling `setName`s | JSDoc on `MetaTag.setName` (browsing-context/form-name grammar ≠ MetaName) + RFC-body note on iframe/object/map |
| LOW | Charset lowercase-canonical | Keep canonical `'utf-8'`; existing `setCharset("UTF-8")` test (`elements.test.ts:516`) stays green via `(string & {})`; add a casing note to CHANGELOG/guideline; do NOT change the test |

### RFC-B-010 (Popover API / invoker Commands / CSS anchor positioning) — 9 items

| Sev | Item | Action when building |
|-----|------|----------------------|
| HIGH | Vocab/lib-parity bridge for anchor emitters | Id-typed `anchorName`/`positionAnchor` read `name.id`, but the parity guard (`test/class-vocab.test.ts:129`) feeds raw string samples → `[anchor-name:--undefined]` ≠ vocab. Runtime body must bridge `isId(name) ? name.id : name` (mirror `setId`, `tag.ts:88`); keep vocab samples plain strings; public declare-module type narrows to Id |
| HIGH | Anchor classes are NOT statically extractable | `parseLiteralArgs` (`extract.ts:101`) returns null on variable (Id) args → unresolved, not added to resolved set. Edit RFC: state `anchorName`/`positionAnchor` are variable-arg unresolved; build must force-safelist them; keep "lockstep" only for `positionArea` literals |
| MED | Correct the false "defineIds constrains ID-safe chars" claim | `createId`/`defineIds` (`ids.ts:45-115`) do ZERO validation. The real backstop is `escapeAttr` (`serialize.ts:249/251/267`). Drop the claim; name escapeAttr as the guarantee |
| MED | Same false-safety claim from the security lens | Same prose edit; credit escapeAttr covering id/class/schema-key sinks |
| MED | Add escape/breakout test | An Id with HTML-special + CSS-grammar chars through the new sinks must entity-escape in BOTH class and attribute output; assert no angle-bracket/quote breakout |
| HIGH | Spell out all three Id sync points | RUNTIME sig `(name: string \| Id)` with isId bridge; PUBLIC declare-module narrows to Id; vocab row. Add the runtime-impl line to the RFC snippet (currently shows only two) |
| MED | Confirm no-arg semantics | `setPopover()` sets field to `'auto'`; `setPopovertargetaction()` (no arg) leaves field undefined so `serialize.ts:266` omits it (no `action=""`). JSDoc-pin |
| LOW | Justify Id-only asymmetry vs `string\|Id` `setId` | Document the deliberate tightening as the PUBLIC type; runtime still accepts string for the bridge |
| LOW | Pin `positionArea [${string}]` arm | JSDoc: bracketed value emitted verbatim + escapeAttr'd, NOT grammar-validated (same as `.textSize`); keep arbitrary sample `["[top span-left]"]` |

> Note: B-010 correctness#1 ≡ type-safety#6 (the parity bridge) and correctness#2 ≡ security#4 (the false defineIds claim) are the same defect seen from two lenses — fix once each.

---

## 4. Audit trail — `applied` / `moot` (verified satisfied)

### RFC-A-001 (reconciled)
- Breaking-change verdict survives, `required_changes: []`, `killer_objection: null` — moot (`substituteParams`/`escapeRegExp` are non-exported internals; no public symbol moved).
- C3b (shorter-before-longer), C3c (repeated param), C3-shared (callable + `.resolve()`) — APPLIED (`test/routes.ts:478-491`, green).
- Shipped JSDoc `src/routes.ts:177` already cites `assertNoUnresolvedParams` (correct) — only the RFC prose overstates (L3).

### RFC-A-003 (partial → effectively reconciled in working tree)
- **The HIGH presence-gate fix and its cases-a/b/c regression tests are APPLIED** (see headline correction). serialize.ts:279 gate; attributes.test.ts:109-127.
- Parked-major `addAttribute` overload-exclusion boundary tracked (`v6.0.1-spec.md:210`); `addAttribute` runtime acceptance unchanged (`tag.ts` stores any key, value dropped only on collision at serialize). APPLIED.
- toggle() `BooleanAttribute` union closed, excludes id/class/style; guard-comment at `serialize.ts:175-176`. The toggle-loop reserved-skip branch (`serialize.ts:302`) is defense-in-depth for `as any` callers (dead via the typed API). APPLIED.
- Type-safety verdict: no required changes; parked overload acknowledged. APPLIED.

### RFC-A-004 (yes)
- F-A-160 absence assertions (`extract.test.ts:40-45`), F-A-161 positive/negative pair (`:191-199`), F-A-163 method-assignment-anchored scan excluding JSDoc + locked two-file SOURCES (`class-vocab.test.ts:213,220`), F-A-162 `escapeRe` + per-unit round-trip for all 9 units (`prefer-unit-overload.ts:15`, `rule.test.js`) — all APPLIED.
- `VOCAB_UNITS: readonly string[]` framing matches the verdict's preferred phrasing (`vocab.generated.ts:12`). APPLIED.
- killer_objection: null across all three lenses — moot.

### RFC-A-006 (reconciled)
- **Killer resolved by revert:** opener-backslash neutralization removed; `sanitizeRawContent` is closer-only (`serialize.ts:237-242`); the `:227-232` comment documents why the opener hardening was reverted/parked. APPLIED.
- F-A-120 escapes `hx-preload` (`serialize.ts:192`); F-A-122 validates computed data-* key (`tag.ts:307-314`); false "free prototype-pollution defense" claim + its broken test removed (JSDoc `tag.ts:294` states the opposite). APPLIED.
- Byte-identity regression test exists (`security.test.ts:166-172`: `/<script/`, `<!--` legacy, `count<scripts` byte-identical); CHANGELOG 6.0.1 scopes the guard correctly. All 28 security tests pass. APPLIED.

### RFC-A-007 (reconciled, with H1/M1/M3/L4/L5/L6 open above)
- Fix 2 (structured trigger accumulator) and Fix 3 emit (bare `hx-disable`) shipped + tested (`patterns.ts:165-173`, `htmx.test.ts:292-300`). Multi-bare `HX-Trigger` pinned to `"a, b"`; single-bare byte-identical; single-word `hx-status:5xx="swap:none"` unchanged. APPLIED.
- Fix 1 (spaced-swap split) deliberately reverted — shipped `serialize.ts:217-225` is the original flatten; the verdict already proved Fix 1 a byte-level no-op. The Fix-1 prose-contradiction and grammar-validation findings are moot (targets dropped code).
- `boolVal('ignore')` removed from `HTMX_ATTRS`; `ignore` special-cased. APPLIED. (The attribute NAME is the open H1.)

### RFC-C-005 (reconciled)
- Cond dropped → eager-eval correctness change MOOT (no `cond.ts`, no export, no docs).
- `pick` name converged to MatchValue only (grep `pick` in `src/` clean; `index.ts:284`). APPLIED.
- Closed-union qualification in `MatchValue` JSDoc (`match-value.ts:13-15`). APPLIED.
- Intersperse between-only + per-gap thunk tests (`control-flow.test.ts:271-298`, `calls===2`). APPLIED.

---

## 5. "Claimed GREEN but verdict-required change never applied"

Explicit call-outs where the spec/roadmap/CHANGELOG presented an item as done but a verdict requirement is unmet in the working tree:

1. **A-007 `ignore` / htmx-4 attribute name (H1).** `CHANGELOG.md:223` presents `{ ignore: true }` → bare `hx-disable` as a completed Fixed bullet, while `CHANGELOG.md:296` (same file) says htmx 4 renamed it to `hx-ignore`. The CHANGELOG contradicts itself; the breaking-change Open Question was marked resolved but isn't. **Highest-value unmet item.**
2. **A-007 `resolves: [F-A-121]` (M1).** `RFC-A-007.md:5` claims F-A-121 resolved; the spaced target/select orphaning it cites is unfixed at `serialize.ts:219-220` and untested. False resolution claim.
3. **A-004 extractor changelog (M2).** Tooling behavior changes presented as shipped under lib `CHANGELOG.md:225-230`, but the extractor's own CHANGELOG (the breaking-change lens's required artifact) does not exist — the precise lib-vs-tooling-semver conflation the verdict flagged.
4. **A-003 (inverse).** The snapshot/spec implied a silent-data-loss regression survived; the working tree actually applied the gate + tests. Recorded here so the audit trail reflects ground truth, not the stale snapshot.

> Also surfaced (out of scope but blocking the green claim's CI evidence): `test/attributes.test.ts` cannot load (`DateTimeInputTag` imported as a value from `./forms.js`), so the A-003 regression net does not currently execute even though the assertions are correct.
