# Wave 1.5 — Dedup & Cluster (barrier output) — v6.0.1

> Input: 96 findings across 4 tracks (A=26 incl. A-900/901, B=33 incl. B-900/901/902, C=20 incl. C-900/901, D=17 incl. D-900).
> Dedup key (§4): equal if normalized `title` matches OR `evidence[0]` path+symbol matches; merge unions evidence, takes max frequency.
> Scoring (§4): `score = impact(1..3) × pain(1..3) × reach(min(freq,3)) / effort(S=1,M=2,L=3,XL=5)`. pain: high=3, med=2, low=1. reach defaults to 3 (review-level findings; no per-app freq supplied — capped at 3 per rubric). impact assessed per cluster.
> `ships_to` is inherited from the dominant finding lane and re-checked against guardrail §5: a 6.0.1 cluster MUST be a behavior fix with no public-shape change; anything additive → 6.1.0; anything needing a break → parked-major.
> `hard:true` = needs deep design (render internals, type-level machinery, or a reconsidered primitive).

## Bounds explicitly applied (no silent caps)

- **No findings dropped.** All 96 appear in exactly one cluster (parked clusters included). Parked != dropped.
- **Dedup merges (evidence unioned, not dropped):**
  - `F-B-164 ≡ F-D-100` — IframeTag.referrerpolicy bare string (same `embedded.ts:15,57`). Merged into **CL-11**.
  - `F-B-141 ≡ F-B-102 ≡ F-D-163` — `<dialog closedby>` / empty DialogTag (same `interactive.ts` + `DialogTag`). Merged into **CL-13**.
  - `F-B-122 ≡ F-D-162` — `setForm()` on form controls (same forms.ts family). Merged into **CL-15**.
  - `F-B-144 ≡ F-D-103` — per-key ARIA value unions (same `aria-types.ts:52,59`). Merged into **CL-17**.
  - `F-D-104 ≡ F-D-120` — defineSchemaKeys generic over ctor (same `proto.ts:18,29`). Merged into **CL-19**.
  - `F-B-161 ≡ F-D-101` (partial) — LinkTag.rel/.as bare string (same `document.ts:102,109`). Merged into **CL-14**.
- **Reach capped at 3** by rubric — review findings carry no app-frequency, so reach=3 uniformly; score is driven by impact·pain/effort.

---

## RANKED — top 10 RFC candidates (kept) + parked tail

| rank | cluster | findings | scope | lane | i·p·r / eff | score | hard |
|---|---|---|---|---|---|---|---|
| 1 | **CL-04** route-param substitution | F-A-140 | Boundary-aware `:key` substitution (negative-lookahead regex) shared by the route callable and `resolve()`; a param name that prefixes another no longer corrupts the URL | 6.0.1 | 3·3·3 / S(1) | **27.0** | no |
| 2 | **CL-06** context safety + test wiring | F-A-180, F-A-181, F-A-184 | Document context as build-time + fully-synchronous-only (per-process stack is unsafe across interleaved async); wire `context.test.ts` into the npm test/coverage scripts; add a streaming context-isolation test | 6.0.1 | 3·3·3 / S(1) | **27.0** | no |
| 3 | **CL-02** duplicate-attribute emission | F-A-100, F-A-901 | Dedup `.toggle()` boolean names at push/serialize; treat id/class/style as reserved in the generic attribute bag (dedicated setter wins, bag key skipped) — every attr name emitted at most once | 6.0.1 | 3·2·3 / S(1) | **18.0** | no |
| 4 | **CL-01** escape / injection holes (security) | F-A-120, F-A-122, F-A-900 | Route hx-preload string through `escapeAttr`; run computed `data-*` keys through `validateAttributeKey`; in script context neutralize `<!--`/`<script` openers (not only `</script`). XSS / attribute-name-injection class | 6.0.1 | 3·3·2 / M(2) | **9.0** | **yes** |
| 5 | **CL-05** htmx serialization grammar | F-A-121, F-A-141, F-A-142, F-A-143 | Constrain/repair spaced `HxSwap` in `buildStatusConfig` (modifier no longer orphaned/leaked); keep a structured trigger accumulator instead of JSON.parsing the emitted header; emit the real htmx disable attribute for `HTMX.ignore` | 6.0.1 | 3·2·3 / M(2) | **9.0** | no |
| 6 | **CL-07** extractor ↔ eslint vocab integrity | F-A-160, F-A-161, F-A-162, F-A-163 | Strip nested `.on/.at` bodies before variant scan + stop top-level double-catch (no spurious classes); constrain the `(...)` regex suffix so call-arg lists aren't swallowed as class tokens; emit `UNITS` from gen-vocab so the eslint regex isn't hardcoded; add the reverse class-vocab parity guard | 6.0.1 | 3·3·3 / M(2) | **13.5** | no |
| 7 | **CL-16** fetchpriority + Link/Meta/Script typing | F-B-160, F-B-161, F-B-163, F-D-101, F-D-102 | Add shared `FetchPriority` setter to Img/Link/Script/Iframe; close `LinkRel`/`LinkAs`/`ScriptType`/`MetaName`/`Charset`/`BaseTag.target` unions where literal sets fit. Core-Web-Vitals + resource-hint surface (additive, open tails kept) | 6.1.0 | 3·2·3 / M(2) | **9.0** | no |
| 8 | **CL-20** value-returning control combinators | F-C-100, F-C-900, F-C-901 | `MatchValue`/`pick` (equality-keyed, value cases, exhaustive) + `Cond([[pred,val]…], default)` (first-truthy-wins) + `Intersperse`/`Join` — the value/predicate analogues of view-thunk `Match`/`ForEach` | 6.1.0 | 2·2·3 / S(1) | **12.0** | no |
| 9 | **CL-21** Form<T> binding completeness | F-C-140, F-C-141, F-C-142, F-C-143, F-D-143 | `f.checkbox`/`f.radio` (typed checked wiring), placeholder/optgroup/multi-select on `f.select`, `f.array` field-arrays, `aria-invalid`/`aria-describedby` on errored inputs, option/hidden values typed `T[Name] & string` | 6.1.0 | 3·2·3 / M(2) | **9.0** | no |
| 10 | **CL-12** Popover + invoker + anchor positioning | F-B-100, F-B-101, F-B-182 | Typed `PopoverState` + `.setPopover()`/`.setPopovertarget(Id)`/`.setPopovertargetaction()`; `command`/`commandfor` on ButtonTag (JS-free dialog open/close); `.anchorName()`/`.positionAnchor()` arbitrary-property classes (extractor vocab sync). Ships as one interaction story | 6.1.0 | 3·2·3 / M(2) | **9.0** | **yes** |

> CL-12 and CL-16 and CL-21 tie at 9.0 with CL-01/CL-05; tie-break per §4 = **additive-before-parked, then fewer deps, then impact**. CL-01 (security, 6.0.1) and CL-05 (6.0.1) rank above the 6.1.0 ties; among 6.1.0 ties CL-16 (broad reach, no design) > CL-21 (forms, no design) > CL-12 (hard:true). CL-20 (S effort → 12.0) outranks all the 9.0s.

---

## All clusters (full table — ranked + below-the-line)

### Lane 6.0.1 — behavior fixes, no public-shape change

| cluster | findings | scope | i·p·r / eff | score | hard |
|---|---|---|---|---|---|
| CL-04 | F-A-140 | route-param boundary-aware substitution | 3·3·3 / S(1) | 27.0 | no |
| CL-06 | F-A-180, F-A-181, F-A-184 | context sync-only doc + test wiring + stream isolation test | 3·3·3 / S(1) | 27.0 | no |
| CL-02 | F-A-100, F-A-901 | dedup `.toggle()` + reserved id/class/style in attr bag | 3·2·3 / S(1) | 18.0 | no |
| CL-07 | F-A-160, F-A-161, F-A-162, F-A-163 | extractor over/under-emit + eslint unit drift + reverse vocab parity | 3·3·3 / M(2) | 13.5 | no |
| CL-01 | F-A-120, F-A-122, F-A-900 | escape/injection holes (hx-preload, data-* keys, script double-escape) | 3·3·2 / M(2) | 9.0 | **yes** |
| CL-05 | F-A-121, F-A-141, F-A-142, F-A-143 | htmx serialization grammar (HxSwap spaces, trigger merge, hx-ignore) | 3·2·3 / M(2) | 9.0 | no |
| CL-03 | F-A-102 | suppress `\n` sibling sep for whitespace-significant elements (textarea/pre) | 2·2·3 / M(2) | 6.0 | no |
| CL-09 | F-C-103 | `Tag.when()` branch on `!= null` (match IfThen/whenElse), stop dropping `0`/`""` | 2·2·3 / S(1) | 12.0 | no |
| CL-10 | F-D-121, F-D-122, F-D-124 | `_t` node-tag literal const; guard `behavior()` renderer lookup; route stray prototype writes through proto.ts | 2·2·3 / S(1) | 12.0 | no |
| CL-11 | F-D-100 (≡F-B-164) | IframeTag.referrerpolicy → existing closed `ReferrerPolicy` union | 2·2·3 / S(1) | 12.0 | no |
| CL-08 | F-A-101, F-A-182, F-A-183 | real render≡renderToIterable fuzz test; hoist [6.0.0] in CHANGELOG; lowercase route methods in guidelines/CLAUDE.md | 2·2·3 / S(1) | 12.0 | no |

### Lane 6.1.0 — additive

| cluster | findings | scope | i·p·r / eff | score | hard |
|---|---|---|---|---|---|
| CL-20 | F-C-100, F-C-900, F-C-901 | `MatchValue`/`pick` + `Cond` + `Intersperse`/`Join` value/predicate combinators | 2·2·3 / S(1) | 12.0 | no |
| CL-16 | F-B-160, F-B-161, F-B-163, F-D-101, F-D-102 | `fetchpriority` + Link/Meta/Script/Base literal-union typing | 3·2·3 / M(2) | 9.0 | no |
| CL-21 | F-C-140, F-C-141, F-C-142, F-C-143, F-D-143 | Form<T> checkbox/radio/array + select opts + aria-invalid + typed option values | 3·2·3 / M(2) | 9.0 | no |
| CL-12 | F-B-100, F-B-101, F-B-182 | Popover API + invoker commands + CSS anchor positioning | 3·2·3 / M(2) | 9.0 | **yes** |
| CL-18 | F-C-120, F-C-121, F-C-122, F-C-123 | relax `apply/when/whenElse` modifier return to `unknown`; `addChild`/`children`; `applyWith(fn,arg)`; `addAttributes` conditional-spread + nullish-skipping data-attrs | 3·2·3 / M(2) | 9.0 | no |
| CL-22 | F-B-180, F-B-181, F-B-183, F-B-184, F-B-185 | TW4 `.on()` `:has()`/`:in()` arms; `viewTransitionName`; scroll-driven timeline methods; `transitionDiscrete`; field-sizing/text-wrap/interpolate-size (extractor vocab sync) | 2·2·3 / M(2) | 6.0 | no |
| CL-23 | F-C-160, F-C-161, F-C-162, F-C-163 | unit overloads for scalar escape-hatch methods + `.size()` combinator; typed/greppable arbitrary-value wrapper + extractor diagnostic; inline-style eslint rule | 2·2·3 / M(2) | 6.0 | no |
| CL-13 | F-B-102 (≡F-B-141, ≡F-D-163), F-B-145 | `DialogTag.setClosedby`; promote `Template()` → `TemplateTag` with `setShadowRootMode`/delegatesfocus/clonable | 2·2·3 / S(1) | 12.0 | no |
| CL-14 | F-B-162 | `SpeculationRules({prefetch,prerender})` typed combinator (escaped `<script type=speculationrules>`) | 2·2·3 / M(2) | 6.0 | no |
| CL-15 | F-B-122 (≡F-D-162), F-B-125, F-D-161 | shared `setForm(id?: string\|Id)` on form controls; `Id`-typed list/for; widen `setFormmethod` to include `dialog` | 2·2·3 / S(1) | 12.0 | no |
| CL-17 | F-B-143, F-B-144 (≡F-D-103) | extend `AriaRole` literal arm (WAI-ARIA 1.2/1.3); per-key `AriaValue` (tristate/token unions) | 2·2·3 / M(2) | 6.0 | no |
| CL-19 | F-D-104 (≡F-D-120), F-D-105, F-D-123, F-D-140, F-D-141, F-D-144 | `defineSchemaKeys` generic over ctor; remove `Input as` cast via internal `makeInput`; `test/types/**` tsd target; `defineRoutes` enum-param variant + path-checked params keys; defineTheme typeof-derived seam | 3·2·3 / L(3) | 6.0 | **yes** |
| CL-24 | F-B-120, F-B-121, F-B-123, F-B-140, F-B-142, F-B-900, F-B-902 | global editing/keyboard surface: `setEnterkeyhint`, full `AutocompleteHint` set, contenteditable/spellcheck/autocapitalize/writingsuggestions, `hidden(until-found)`, microdata combinator, per-element dir/lang/translate, media-privacy booleans | 2·2·3 / L(3) | 4.0 | no |
| CL-25 | F-B-124, F-B-901, F-C-101, F-C-104, F-C-180, F-D-164 | low-pain additive odds: `Selectedcontent()` factory; SourceTag width/height; `ForEachElse` → `Iterable<T>`; eager `When`/`Unless`; `ListOr` two-branch; `addStyle`/`addStyles` | 2·1·3 / M(2) | 3.0 | no |
| CL-26 | F-A-144, F-C-102 | typed htmx 4 `:inherited` marker; keyed iteration combinator (stable data-key for idiomorph) | 2·2·3 / M(2) | 6.0 | no |

### Lane parked-major — needs a public-shape break

| cluster | findings | why parked | i·p·r / eff | score |
|---|---|---|---|---|
| CL-30 | F-D-142 | phantom-tag `Id<Registry>` changes the public `Id` shape (cross-registry mixups). Breaking → next major | 1·1·3 / M(2) | 1.5 |
| CL-31 | F-D-160 | lowercase-tail setter-name standardization (setHttpEquiv→setHttpequiv etc.); ship additive aliases in 6.1.0, drop intercapped in next major | 2·2·3 / M(2) | 6.0 |
| CL-32 | F-D-165 | OOB/withOOB are exported-and-@deprecated with no v5 caller (greenfield); cut outright in next major — for 6.0.x name the removal version in CHANGELOG | 2·2·3 / S(1) | 12.0 |
| CL-33 | F-D-900 | drop `(string & {})` tail from the six sizing unions — closing them rejects values that compile today; breaking → next major | 2·2·3 / M(2) | 6.0 |

> CL-31/CL-32/CL-33 score above several shipped 6.1.0 clusters but are **lane-gated** to parked-major by guardrail §5 (each is a break or carries a deprecation-removal the patch/minor can't make). CL-32 additionally gets a 6.0.x CHANGELOG note (naming the removal version) — that doc note is folded into CL-08, not a separate ship.

---

## Adoption / docs-only (no new code surface — feed 40-synthesis/guidelines-update.md)

| cluster | findings | target |
|---|---|---|
| CL-40 | F-C-181 | record the compose-from-primitives recipe per cut helper (Modal→Dialog+behavior; Badge-on-avatar→`.overlay()`; SortHeader→`setAria({sort})`+query; EmptyState→IfThen/ListOr) in lib docs + views guideline. **Re-litigation verdict: NO new primitive — the instruction set closes every gap.** |

---

## Parked tail — full accounting (everything below the top 10, never dropped)

Below-the-line clusters all carry real findings routed to a Wave-2 `RFC-*-misc.md` or the guidelines patch; none are silently dropped.

- **6.0.1 below the line (still ship as patch fixes, just below the top-10 RFC bar):** CL-03 (textarea/pre `\n`, 6.0), CL-09 (`when()` truthiness, 12.0), CL-10 (internal hygiene `_t`/behavior-guard/proto-casts, 12.0), CL-11 (Iframe referrerpolicy, 12.0), CL-08 (fuzz test + CHANGELOG order + lowercase route methods, 12.0). CL-09/CL-10/CL-11/CL-08 score 12.0 but lost the top-10 slots to higher-impact correctness/security and broader 6.1.0 surface clusters; they are P1 patch items, not parked.
- **6.1.0 below the line (additive, deferred):** CL-18 (apply/when/children combinators, 9.0), CL-22 (TW4 CSS hooks — has/in/view-transition/scroll-timeline/transition-discrete/field-sizing, 6.0), CL-23 (unit overloads + size + arbitrary-value wrapper + inline-style lint, 6.0), CL-13 (DialogTag.setClosedby + TemplateTag, 12.0), CL-15 (setForm + Id-typed list/for + setFormmethod dialog, 12.0), CL-17 (ARIA roles + per-key AriaValue, 6.0), CL-19 (type-level sharpening: defineSchemaKeys/makeInput/tsd target/defineRoutes params/defineTheme seam — **hard:true**, 6.0), CL-14 (SpeculationRules, 6.0), CL-24 (global editing/keyboard surface, 4.0), CL-26 (`:inherited` + keyed iteration, 6.0), CL-25 (low-pain odds: Selectedcontent/Source dims/Iterable ForEachElse/When-Unless/ListOr/addStyle, 3.0).
- **parked-major (need a break — never smuggled into patch/minor):** CL-30 (`Id<Registry>` phantom tag, 1.5), CL-31 (setter lowercase-tail rename, 6.0), CL-32 (cut OOB/withOOB, 12.0), CL-33 (close sizing unions, 6.0).
- **docs/adoption-only:** CL-40 (F-C-181 — record primitive-composition recipes; the re-litigation verdict is NO new component primitive).

> 96/96 findings placed. Merges: F-B-164→CL-11, F-B-141/F-D-163→CL-13, F-D-162→CL-15, F-D-103→CL-17, F-D-120→CL-19, F-D-101→CL-16/CL-14 split (rel/as → CL-16). Lane discipline held: no public-shape change sits in a 6.0.1 cluster; three above-threshold ideas (CL-31/32/33) are lane-gated to parked-major rather than scored into a minor.
