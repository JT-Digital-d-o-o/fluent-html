# Roadmap: fluent-html v8 review run (curated 2026-10-01)

Source: `40-synthesis/curation.md` (decided 2026-10-01, "go with recommendations"; section E "include all"). 20 curated items (19 RFCs + the C-67 teaching fix), 74 deferred clusters, 2 parked, 4 decision-gated (3 reopened and designed, 1 kept with a teaching fix), 0 rejected. Each line keeps the measure from the final contract. Net guideline delta of the curated set: -20 lines.

## 8.1.x

Vehicles: fluent-html 8.1.1, eslint-plugin-fluent-html 4.2.0, fluent-html-tailwind-extractor 3.0.0 (main), projects-template 3.8.0.

| ID | Roadmap line | Enforcement | Guideline Δ |
|---|---|---|---|
| RFC-A-03 | Executed htmx grammar oracle in lib CI: tokens enumerated by rule from `htmx.d.ts`, `patterns.d.ts`, `core/htmx-methods.d.ts`; claims backed by served bytes; a known-defect ratchet that names the mark to delete; beta6 + template-served 4.0.0. 342/342 runs (171 rows, 23 known), 0 flaky in 1,026 under CPU contention; the acceptance matrix (69 rows, run by no workflow today) joins CI. Errata: the 8.0.0 `Partial` cause (legacy `<hx-partial>` bytes swap on 4/4 bundles) and the 7.2.0 preload/optimistic cause. | ci | -4 |
| RFC-A-05 | One URL sanitizer, two policies: setters keep the media `data:` allowlist, htmx URL sinks block every `data:` URL, `js:` blocked everywhere; `js:`/`javascript:` confirm and string vals throw in dev and render as text in production; status push/replace percent-encoded; plain `HX-Location` paths stay bare (147,821 strings × 2 bundles, 0 read as config). Script ran in 87 of 138 browser cells on 8.1.0, 0 of the 132 cells these sinks cover after; 92,038 instrumented serializations in 14 live repos, 0 changed bytes. Template `HX-Redirect` hook via `hxResponse`. | dev-throw + runtime | -1 |
| RFC-A-08 | `hx-status` object configs serialize each value as one HCON token (quote, keep whole tokens, JSON when a value holds `"`, URL fields percent-encoded, empty push/replace omitted). Status rows 28/60 → 60/60 on 4 bundles; 221/226 fleet entries byte-identical, the 5 that change are fixes. | runtime | 0 |
| RFC-B-01 | Swap verbs name the route-callable fix and the verb's stance on line 1 (0/19 → 18/19 raw probes); a request-less HTMX bag throws in dev (10/10 wrong shapes); production bytes unchanged; 12/12 live repos tsc-identical, 8,836 tests per side. | type + dev-throw | 0 |
| RFC-A-07 | `Form<T>` valued checkboxes bind by membership with per-value group ids (12/12 bound round trips fixed on Chromium, Firefox, WebKit; duplicate ids per page 2 → 0); `Form()` argument mixes that drop arguments throw in dev; the guideline line ships after the 8.1.1 tag with a version floor (taught shape 0/16 correct on 8.1.0, 16/16 on the patch). | runtime + dev-throw | 0 |
| RFC-A-06 | JSON-typed script bodies get every `<` as a JSON unicode escape: page intact 12/32 → 32/32 per engine, parse identity 18,752/18,752; the template drops its hand-rolled JSON-LD escape with the 8.1.1 lockfile bump. | runtime | 0 |
| RFC-A-01 | Behaviors runtime: `onClickOutside` dismisses only what was showing (6/21 → 21/21); a trapped drawer steps every Tab until focus lands, `summary` and `contenteditable` included (trap shapes 10/18 → 18/18); `closeOn: ["nav"]` reads the htmx 4 detail (48/72 → 72/72). Asset 6140 B / 2778 B gz (budget 6144 / 2816); matrix 221/222 on beta6 and 4.0.0. | runtime | 0 |
| RFC-C-01 | eslint-plugin-fluent-html 4.2.0: `no-tailwind-in-raw-class` fix contract; swept autofixes failing tsc 6,269 → 0, autofixes that compile 6,728 → 9,833, 509 no-method utilities autofix to an exact `.cssProp`; pure-prior `eslint --fix` leaves tsc at 3 and 4 (was 27 and 30); fix tables follow the installed fluent-html. | lint + plugin ci | -2 |
| RFC-D-01 | eslint-plugin-fluent-html 4.2.0 + extractor 3.0.0: dynamic-arg messages drop `staticManifest` (11/11 calls still throw with it) and print a per-shape rewrite that compiles; detection unchanged (5,702 fleet files 0/0); guidelines lose the 3 always-loaded lines teaching it. | lint | -4 |
| RFC-C-04 | Retire `@jtdigital/ui` (0 dependents and 0 imports across 58 repos; 36 lint errors; 11 of its 47 classes missing from an app safelist); `selectStyle` joins `src/shared/ui/form.ts` (3/4 in-repo agent runs wrote it by hand); `tests/component-layer.test.ts` fails a workspace package that emits classes or dynamic styling calls (dormant until template CI is green). | ci | 0 |
| C-67 | `setClosedby("any")` taught paired with an inner panel's `onClickOutside` that clicks a `setCommand("close")` button: Playwright WebKit 26.5 (no `closedby`, as Safari 27) leaves the dialog open on a backdrop click, the pairing closes it on 3/3 engines. 21 fleet sites in 11 repos, 0/20 files paired today; no runtime shim (§5.10 kept). Depends on RFC-A-01. | prose | 0 |

## 8.2.0

Vehicles: fluent-html 8.2.0 (additive), projects-template 3.9.0.

| ID | Roadmap line | Enforcement | Guideline Δ |
|---|---|---|---|
| RFC-B-02 | `HxSwap` admits the htmx 4 modifiers on the styles that read them (`focusScroll` after innerHTML/outerHTML, `transition:false`, `strip`, `swapEmpty`, `scrollTarget`, `showTarget`); `HxTrigger`/`HxTarget` drop 6 dead literals and add `resize`/`scroll from:window` without `changed` (which fires 0 requests). Pure-prior statements working on first compile 5/24 → 14/24; emitted JS byte-identical. | type | 0 |
| RFC-B-03 | The 5 branded route sinks name `routes.x.resolve([params,] query?)`, `assetUrl` and `externalUrl` on line 1 (0/24 → 21/24, none truncated); `prefer-set-method` stops autofixing a raw href into a TS2345 (plugin 4.2.0); template `assetUrl` returns `ResolvedRoute`. Requires RFC-B-01's dev throw in the same or an earlier release. | type + lint | -2 |
| RFC-A-04 | Type-only traps for `.colspan`, `.rowspan`, `.inert`, `.setInert` name the setter on line 1 (226 enumeration lines; pure-prior `setInert` repairs 4/4 to `.toggle("inert", on)`); emitted JS byte-identical. Part B cut. | type | 0 |
| RFC-A-09 | Opt-in `setClassMerge(theme)`: the later class of a family wins; 108/108 dead pairs and 28/28 conditional pairs fixed, 0 property-losing drops (42 of 7,990 as written); merge off byte-identical; template scaffold opts in (3.9.0); supersedes lib `decisions.md:94`. | runtime (opt-in) | -5 |

## 9.0.0

Vehicle: fluent-html 9.0.0, one bundled migration (codemods `codemod:prune-9`, `codemod:nonce-bag`, `scripts/codemod/bare-selector.ts`).

| ID | Roadmap line | Enforcement | Guideline Δ |
|---|---|---|---|
| RFC-B-04 | One meaning for a bare selector word (htmx's): `HxTarget` closes its `string` arm, select sinks take `HxSelect`, `Partial` stops rewriting bare words; 10/10 wrong guesses rejected (0/10 on 8.1.0), hint on line 1 in 8/10; codemod 0 rewrites and 2 reported sites in 15 live repos. | type + codemod | 0 |
| RFC-C-02 | Prune gated on recorded agent guesses: `FormTag.multipart()`, `Repeat` and the root re-exports `extractId`, `extractSelector`, `EVENT_TABLE`, `HTMX_EVENTS` leave; `containerQuery`, root `setDevChecks` and `setMicrodata` stay (first guesses 1/13 and 3/21 leak-free runs; a closed key bag); `typesVersions` makes 4 subpaths resolve under node10 (4/58 repos). `test/prune-gate.test.ts`: a name leaves only after 20 leak-free runs per condition never write it. Dry runs: template 0/339, 15 canonical repos 0 edits, 7 edits in 4 pre-7 repos and 1 template branch, all compiling. | type + ci | -1 |
| RFC-C-03 | One CSP-nonce spelling: `render`/`renderToStream`/`renderToIterable` lose the `{ nonce }` bag and `RenderOptions` goes; `renderToStreamWithNonce` becomes variadic and gains `(nonce, view, { chunkSize, highWaterMark })`, chunk-identical to 8.1.0's bag (6/6). 89 survivor call sites, 0 bag sites; the codemod reports the 3 type-clean shapes that would drop the nonce. | type + codemod | 0 |

## template-only

Vehicle: projects-template 3.8.0. No fluent-html release.

| ID | Roadmap line | Enforcement | Guideline Δ |
|---|---|---|---|
| RFC-D-02 | `.search` emits `sync "queue last"` on htmx 4.0.0 until #4028 ships: `replace` settles on a stale query 5/5 (asymmetric lag) and 4/20 (seeded), `queue last` 0/5 and 0/20; the skipped smoke row runs with an asymmetric lag; a unit tripwire gated on the 4.0.0 RequestQueue names the switch back to `replace`. Accepted cost until then: settle 1055 vs 357 ms. | runtime + ci | -1 |
| RFC-A-02 | templates/web emits no htmx: the 3 dead `setHtmx` emitters become a native POST form and anchor hrefs (the contact form sent personal data in a GET query string); `template/no-htmx-without-runtime`, gated on the served bundle (0 fleet repos newly flagged); the smoke test renders every registered page and fails on any `hx-*` attribute. | lint + ci | 0 (template docs -72) |

## parked

| Item | Score | Why parked |
|---|---|---|
| C-81 Setter casing rename (F-D-160, L-144) | 4 | Case-only guesses self-heal in one TS2551 hop (20/20, 22/22, 33/33); only 3 of 158 setters break the mirror-the-attribute rule; any rename is a 9.0.0 codemod (59 or 390 sites). User: keep parked. Reopen if a prior probe shows casing misses surviving C-47's lint. |
| C-96 Platform additions with no demand | 1 | `autocorrect` (Baseline 2026-09-11), `popover="hint"` (2 of 3 engines), `<selectedcontent>`: 0 fleet demand; engine triggers watched by C-51. User: keep parked. |
| A-09 default-on flip (RFC-A-09 open question 1, not a cluster) | n/a | A guardrail-11 break with measured visible deltas (competify 4, fl-um 1, everyframe-composer 22); needs a codemod (insert `setClassMerge(false)` at boot, or the per-repo audit) and a dry run. Not designed; not in 9.0.0. |
| B-02 leading/trailing `transition` arms (not adopted) | n/a | 16/28 working statements instead of 14/28, at 1,738 `HxSwap` members and 19.1-20.0 s per 500 `Partial` sites. |

## decision-gated

| Cluster | Guardrail | User decision (2026-10-01) | Outcome |
|---|---|---|---|
| C-67 Safari closedby fallback | §5.10 | keep guardrail; fix the teaching: pair `setClosedby("any")` with `onClickOutside` | Designed as prose for 8.1.1 (C-67 above); no runtime shim, ADR-06 / S-21 unchanged. |
| C-82 One meaning for a bare selector token (L-063) | §5.4 | reopen: design one meaning | RFC-B-04, 9.0.0. |
| C-92 CSP-nonce survivor | §5.7 | reopen: `renderWithNonce`/`renderToStreamWithNonce` survive; delete the options bag in 9.0.0 | RFC-C-03, 9.0.0. Reverses L-230 (89:0 census), resolves L-141, closes L-154. |
| C-93 Which component layer survives | §5.5 | reopen: retire `@jtdigital/ui`; `src/shared/ui` is the component layer | RFC-C-04, 8.1.x + template 3.8.0. |

### Open calls for the user raised in Wave 4

1. RFC-C-03: add the `readonly nonce?: never` tombstone to `RenderStreamOptions`? It rejects the 3 type-clean silent-drop shapes (3/3) and turns g05's line 1 into `Type 'string' is not assignable to type 'undefined'`.
2. RFC-C-03 open question 1: the chunking bag's fate (`RenderStreamOptions`: 0 fleet uses, 3 lib-test uses); no owner in this run.
3. RFC-A-03: the ALGORITHM §5.10 rewording ("does what its type says, by executed row, in the pinned and the template-served bundle") was struck from the change set and left to curation.
4. RFC-C-04: re-word `ALGORITHM.md:187` (guardrail 5 names `@jtdigital/ui`) now or next run (open question 4); delete the unused `packages/config-typescript` (0 tsconfig extends) in the same sweep (open question 3); approve the user-memory edits (`fluent-html-is-instruction-set.md:10,16`, `fluent-html-no-context-no-framework-glue.md:14`).
5. RFC-C-02: `typesVersions` for the 4 prescribed subpaths or all 10 export subpaths.
6. Human step: set `PRIVATE_REPOS_TOKEN` on projects-template (CI 114/114 red at install).

## deferred (74)

Cut by the design cap of 8 and the user's "go with recommendations"; they stay in the seen set for the next run. Score = impact × pain × reach / effort. "Why" gives the cluster's measure and, where this run touches it, the interplay.

| Cluster | Score | Lane / layer | Why (measure; interplay) |
|---|---|---|---|
| C-10 | 12 | 8.2.0 type | An optional boolean in `IfThen`/`.when` fails as a 7-8 line TS2769 naming no fix (3/3 probes); 35 canonical workaround sites in 13 of 16 repos. |
| C-11 | 12 | 8.2.0 type | `View` excludes number: `Span(n)` is TS2345 and the runtime drops it; 7 guideline lines write `Span(n)`; 627 fleet sites stringify by hand (L-025 accepted in 6.3.0, never shipped). |
| C-13 | 12 | 8.1.x lint | `no-setclass-after-fluent-modifier` is silent on 10/13 variant-then-setClass wipes; `no-ternary-in-view-builder` reports 0 of 10 prior ternaries. |
| C-14 | 12 | 8.2.0 lint | Class hooks go through `setClass` at 85 canonical sites vs `cssClass` 25; 73 of the 85 copy two template exemplars (`email.template.ts:51-54`, `charts.ts`). |
| C-15 | 12 | 8.1.x lint | The template type-scale guard (`theme-tokens.test.ts:59`) matches pre-7 `.textSize(` and hits 0 of 790 off-scale `.text(unit, n)` sites; `prefer-unit-overload` steers toward the banned overload. |
| C-20 | 12 | 8.1.x runtime | Object variants made variant-styled construction 2.4x slower (build+render x0.41); a 25-line rewrite gives x1.59, byte-identical. |
| C-21 | 12 | 8.1.x runtime | `substituteParams` builds a RegExp per param per call: 498 ns per param, 40% of a 50-row list page; compile-once measured 5x per resolve with 1,950/1,950 parity cases. |
| C-22 | 12 | 8.1.x runtime | Anchor emitters write inline style that a later `setStyle` erases (popover 61 px to 0 px); 5/5 fleet anchor pairs redundant under implicit anchoring. |
| C-23 | 12 | 8.1.x ci | The palette opt-out type project runs only at `npm pack`: broken by mutation, CI tsc exits 0 while it reports 4 TS2578. |
| C-24 | 12 | 8.1.x ci | canonical-names stops at the first live method: one run leaves 287 and 3,186 renames that 3 and 7 re-runs clear. RFC-C-02's `codemod:prune-9` carries its own `getApparentType` receiver fix; porting it is this cluster's side finding. |
| C-25 | 12 | 8.1.x ci | `fluent-html/CLAUDE.md` and `.ai/` are guidelines@ac24da0, 23 commits and 934 lines behind; `guidelines:check` runs in 0 of 3 workflows. This run edits `fluent-html/CLAUDE.md` by hand in 7 RFCs and leaves `.ai/` to `guidelines:pull`. |
| C-26 | 12 | 8.1.x ci | `bench:ci` runs in 0 of 3 workflows and times a pre-built tree (an injected 29x construction regression passes). RFC-A-09's x0.271 unique-class page is its first candidate scenario (A-09 open question 2). |
| C-27 | 12 | 8.1.x ci | The lib verifies beta6 while 13/16 canonical apps serve 4.0.0; the bump is green (69/69, 2159/2159) and flips 6 behaviors no test observes. If it lands, RFC-A-03's matrix collapses to one bundle and the `htmx-served` alias goes. |
| C-28 | 12 | 8.1.x boot | The README install resolves fluent-html 5.7.0 (17/31 README methods absent), the plugin 1.4.0, the extractor E404; 0/93 fleet lockfiles resolve from the registry. |
| C-29 | 9 | 8.2.0 type | Palette literals are the pure prior's densest divergence (43 and 40 per run); 36 post-autofix tsc messages name 0 role tokens. RFC-C-01 withholds palette autofixes (`hostRejects`) but does not redirect them (C-01 open question 1). |
| C-30 | 9 | 9.0.0 type | 6 of 15 `SwapModifier` members are inert on beta4, beta6 and 4.0.0; 238 fleet sites. RFC-B-02 types the successors; the codemod must name `show:window:X` → `show:X showTarget:body`, `scroll:window:X` → `scroll:X scrollTarget:html`, and drop `focus-scroll` after morph styles. |
| C-31 | 9 | 9.0.0 type | An `addAttribute` key type rejecting typed keys names the setter in 4/4 probes; 0 of 28 canonical app sites write an attribute with a typed setter; 126 pre-7 id/class/style sites. |
| C-33 | 9 | 8.2.0 lint | Under the template CSP with `strict-dynamic`, htmx runs 8/8 swapped `<script>` variants with 0 CSP errors; `layout.view.ts:220-221` documents the opposite. |
| C-34 | 9 | 8.1.x dev-throw | hx-config `credentials` true/false reach the server 0/8 and the valid `"include"` is TS2322; `mode` overwritten 0/12; `HtmxConfig({ mode: 'cros' })` stops 6/6 requests. |
| C-35 | 9 | 8.1.x runtime | `behavior('toggle')` flips only the hidden class: attribute-hidden targets never show (0/3), and it hides 4/11 display-method targets. Needs the L-260 size call: RFC-A-01 leaves 4 B of the 6144 B budget; RFC-A-09 keeps `hidden` out of the display family meanwhile. |
| C-37 | 9 | 8.2.0 runtime | 1,029 of 1,037 verb-driven forms submit natively as GET before htmx loads; 84 password forms in 15/15 8.x repos; the template login sends the password in the URL on 2/2 bundles. |
| C-38 | 9 | 8.1.x boot | The extractor drops `.hover(named)` and trailing-comma single-arg calls with no ledger row (0 fleet sites; 91% of wrapped argument lists end with a comma). RFC-D-01's "pass a literal" text reaches calls that already pass one (F-D-604). |
| C-39 | 9 | 8.1.x ci | Type tests pin that an error exists, not its text (155 directives, 17 text pins); a 58-probe matrix catches all 4 of 8.1.0's lost key names, CI 0. Would pin the first lines RFC-B-01, B-03, B-04 and A-04 introduce. |
| C-40 | 9 | 8.1.x ci | The census double-counts 5 `.claude/worktrees` (+28.1% canonical sites) and skips 3,762 variant-object key sites; the README head rests on the 8.0.0 corpus. RFC-C-02's gate reads census reach. |
| C-41 | 9 | 8.1.x ci | No CI run has exercised lib, plugin and extractor together: template CI 114/114 red, plugin and extractor 0 workflows, extractor suite 55/56 for 48 days. Blocks the extractor 3.0.0 tag that RFC-D-01 rides. |
| C-42 | 8 | 8.1.x type | 8.1.0's `NoExtraCases` replaced the `Match` case-key did-you-mean with "not assignable to type never" in 3 of 4 overloads; 50 value-form `Match` sites in 12/16 repos. |
| C-43 | 8 | 8.2.0 type | `PageResponse` is a cast brand: deleting `.setId(layoutIds.mainContent)` leaves tsc at 0 in 15/15 canonical apps; 44 casts in 16 layouts. |
| C-44 | 8 | 8.2.0 type | `HxSync`'s tail admits `closest form:dorp` (2 of 3 rapid requests through); an `OverlayPosition` typo renders as text; `reswap` accepts `outerHtml`. |
| C-45 | 8 | 8.2.0 type | 6 selector fields reject `Id` while the runtime serializes it; IDREF sinks render `for="#…"` (4/4 labels in templates/web). If it joins 9.0.0, RFC-B-04's raw-sink hints collapse to the `ids.x` message; RFC-A-08's quoting stays byte-identical on the resolved `#name`. |
| C-46 | 8 | 9.0.0 type | `setAction`, `setFormaction`, `Area`/`Use` `setHref` stay raw-string sinks (`setAction('/team/invit')` passes every layer). Also owns RFC-A-05's residuals (`redirect("//evil.test/x")` navigates 2/2; the `HxResponse` brand; the `config` string arm) and RFC-B-03's `RouteSinkHint<".setAction">` reuse. |
| C-47 | 8 | 8.2.0 lint | One wrong setter types the rest of the chain as `any`: tsc shows 9 of 20 casing misses per pass and needs up to 6 rounds; a surface-name lint finds all in 1 pass (0 false positives over 5,653 files). |
| C-48 | 8 | 8.1.x runtime | `Form<T>.textarea` loses one leading newline per render (3 cycles turn three newlines plus "Notes" into "Notes"); 71 textarea sites in 14 repos. |
| C-49 | 6 | 8.2.0 type | A missing DU `Match` case is a 7-line TS2769 with the fix at char 1027 of 1354 (recon 02); 104 DU `Match` sites in 16/16 repos; an arity guard gives 5/6 single diagnostics. |
| C-50 | 6 | 8.2.0 type | 30 numeric SVG setters accept only string; 701 canonical calls wrap `String()`; context-withheld runs pass numbers 40/40. |
| C-51 | 6 | 8.2.0 type | No HTML/ARIA platform watch; a BCD 8.1.3 diff finds 24 untyped Baseline attribute keys and 7 names rejected by closed unions; 4 ARIA 1.3 names missing. |
| C-52 | 6 | 8.2.0 type | 94 removed names die as TS2339 with no successor; 207 setter guesses heal into another attribute's setter; one generator names the fix on line 1 in 2,041/2,041. Must emit RFC-A-04's hand-written traps. |
| C-53 | 6 | 8.2.0 type | 19 size-like color token names re-point 36 merged-prefix classes with 0 warnings; custom fontSize tokens carry no line-height (RFC-A-09 treats them as a font-size-only sub-family). |
| C-54 | 6 | 8.2.0 type | `{ invalid }` takes a bare `Id`: an unrooted form drops `#invite-form` on the first 422 on 2/2 bundles; 76 sites in 15/16 repos. |
| C-55 | 6 | 9.0.0 type | 181 of 187 setters compile with no argument and render nothing; all 4 fleet bare calls are bugs. |
| C-56 | 6 | 9.0.0 type | `setPopovertarget` and `setForm` sit on every Tag; browsers honor `popovertarget` only on button/input (A, Div, Span, Li 0/2 engines). |
| C-57 | 6 | 9.0.0 type | `hxResponse(view).build()` returns HTML every View sink re-escapes, without the nonce; 67/68 sites need only headers. |
| C-58 | 6 | 9.0.0 type | `hxGet`, `hxPost`, `hx()` and `setHtmx(endpoint, opts)` sit at 0 canonical sites; the 115 pre-7 calls rewrite 115/115. Removing `setHtmx(endpoint, opts)` lifts RFC-B-04's p06 hint from line 3 to line 1 and retires RFC-B-03's `.setHtmx` sentence. |
| C-59 | 6 | 8.2.0 lint | A typo'd token to a typed styling method gets no did-you-mean (7/7 print one line naming `TailwindColor`); a typed lint names it in 5/7. |
| C-60 | 6 | 8.2.0 lint | `prefer-htmx-api` is a 24-name hand list: htmx 4.0.0's `upgrade-check.py` flags 11/13 htmx-2 names, the plugin 1/13. RFC-A-02 turns the rule off in no-htmx scaffolds. |
| C-61 | 6 | 8.1.x lint | `prefer-set-method`'s 86-entry hand map: 408 of 2,245 fleet fix sites stop compiling; 64-65 typed setters have no redirect. RFC-B-03 adds a hand row (`BRANDED_URL_SETTERS`) that a derived map must keep. |
| C-62 | 6 | 8.2.0 lint | Static `setStyle` with a typed method at 12 of 23 canonical sites; 61 of 106 `.cssProp()` sites spell a named utility. |
| C-63 | 6 | 8.1.x dev-throw | 280 of 299 typed (setter, attribute) pairs emit a duplicate attribute through `addAttribute`; the hx-* bag beats `setHtmx` 2/2. |
| C-64 | 6 | 8.1.x runtime | `El(name)` is unvalidated: 3/3 element-name payloads execute in Chromium; tela renders a user-supplied tag through `El()`. |
| C-65 | 6 | 8.1.x runtime | `set*(undefined)` has four meanings across 172 setters; `setPopover(undefined)` emits `popover=auto`; `setDownload(true)` saves `true.txt`. |
| C-66 | 6 | 8.1.x runtime | The newline sibling separator renders a space before punctuation at 31 canonical sites in 9 repos (7/7 sampled reproduce). |
| C-68 | 6 | 8.1.x ci | 153 of 236 closed unions widen to an open tail with every test green; 22 of 27 htmx unions have no reject pin. |
| C-69 | 6 | 8.1.x ci | The type contract is verified on TS 5.9.3 only: the lib tsconfig has 214 errors on 6.0.3 (run by 15/15 canonical apps); the pins call `ts.createProgram`, absent in 7.0.2. |
| C-70 | 6 | 8.1.x ci | README has 4 claims that fail when executed, REFERENCE.md 52 lines failing TS2345, 13 of 93 `@example` blocks fail lint, 5/5 `examples/` fail. |
| C-71 | 6 | 8.2.0 boot | `themeToManifest` force-lists 8,508 dead classes across 15 apps (67% of the template's CSS bytes); 18/18 typed-invalid probe classes safelisted. RFC-D-01 open question 1 (376 forced classes, CSS 58,630 vs 18,754 bytes) belongs here. |
| C-72 | 6 | 8.1.x ci | All 16 pure-prior divergence kinds recur on 8.1.0; 10-31% of non-class sites get no redirect. RFC-C-01's pp1/pp2 `--fix` result (tsc 3 → 3, 4 → 4) is the first replay target. |
| C-73 | 6 | 8.1.x ci | 24 ✓/unmarked guideline lines fail tsc against 8.1.0 + template; 47 ✗ lines held by no layer; 8 of 28 rendered-output claims are false. |
| C-74 | 6 | 8.1.x ci | Always-loaded prose grew 4,438 tokens (+29.3%) after the scorecard priced it at zero; 57 lines teach htmx spellings at 0 canonical sites. This run's -20 lines do not offset it. |
| C-75 | 6 | 8.1.x ci | The 8.1.0 entry omits render `"none"`, `RootedView` and the rooted `Partial` (used by 15/15 8.1.0 repos); the htmx beta6 pin move is unlogged. |
| C-76 | 4 | 8.2.0 type | `renderFragment`, `.fragment` and `.search` accept `Id<string>` with no root check (4/4 wrong-root probes compile); `RootedView` costs 11.9% of types in the largest app. |
| C-77 | 4 | 8.2.0 type | `.variant()` rejects 156 of 331 valid 4.3.3 variants; the coverage watch passes 27 of 114 new roots silently. RFC-C-01 reports the untyped heads (`variantHeadUntyped`) without fixing them. |
| C-78 | 4 | 8.2.0 type | The README teaches a `Styler` type fluent-html does not export (TS2304; 0 of 335 root exports). |
| C-79 | 4 | 9.0.0 type | `f.input(name, "checkbox")` or `"radio"` passes tsc and lint and renders value without checked; 10 fleet sites, 7 in everyframe-composer. |
| C-80 | 4 | 9.0.0 type | `defineIds` emits camelCase verbatim while `README.md:157-158` claims kebab; 109 of 305 app entries in 6 of 15 repos are camelCase. |
| C-83 | 4 | 8.1.x dev-throw | `.behavior()` is the one public mutator of 506 outside the dev mutation gate; the aliasing guard misses 4 of 5 shapes; dev checks latch `NODE_ENV` before dotenv runs. |
| C-84 | 4 | 8.2.0 dev-throw | `ForEachKeyed` writes raw keys as page-global ids: the keyed morph keeps 0/4 rows on beta6 and 4.0.0; 66/77 `keyOf` return a raw field. Lands after or with RFC-A-07 (7 fleet checkbox groups without `.setId` would throw). |
| C-85 | 4 | 8.2.0 ci | `HtmxGlobalConfig` and friends are a hand-copied beta4 snapshot: 13 config keys vs 23 in 4.0.0; 3 bumps changed 20 names, fluent reflected 0. |
| C-86 | 4 | 8.2.0 boot | Extractor text matching fails the default build in 4/16 canonical apps with 13 false ledger rows; a checker-backed scan gives 0 false rows in 32.5 s. |
| C-87 | 4 | 8.1.x ci | Playwright WebKit is not a Safari oracle (r2311 has 2 of 4 features Safari 26.6.2 lacks). C-67's Safari 27 claim rests on Playwright WebKit 26.5. |
| C-88 | 4 | 8.2.0 boot | The plugin's eslint peer admits 8.39 where 5/32 rules throw; `recommended` throws on ESLint 10.11 (16/16 installs); the extractor's `*` peer admits 6.5.0; the typed surface needs tailwindcss 4.2.0 or later (194 classes dead on 4.1.18). |
| C-89 | 3 | 8.2.0 type | An undeclared route in a conditional escapes the fragment-stance check (4/4 compile); 885 of 1,324 route defs declare no render. |
| C-90 | 3 | 9.0.0 type | `preserve:false` preserves on 4/4 bundles; `boost:true` swaps the next page into the link; `swapOob` content fires GET to an invented endpoint. |
| C-91 | 3 | 9.0.0 type | `after`/`checked`/`dark`/`even`/`odd` tier-1 methods have 0 uses; `.variant("group-hover")` and 3 more duplicate tier-1 at 14 sites. |
| C-94 | 2 | 8.2.0 type | 101 typed classes from 5 arm shapes compile to no CSS on 4.3.3; 0 fleet sites. |
| C-95 | 2 | 8.2.0 type | `Partial(ids.x, content)` brands `Rooted<x>` even when its outer swap replaces `#x` (`type-surface.test-d.ts:638,640` pin it). RFC-B-04's single `Partial` signature is where the swap-style split would go. |

Count: score 12 × 14, 9 × 11, 8 × 7, 6 × 26, 4 × 11, 3 × 3, 2 × 2 = 74.

## rejected

None. 19/19 RFCs survived verification with changes, 0 verdict rejects, and curation cut 0 clusters.

Design alternatives rejected inside curated RFCs (with the reason measured):
- RFC-A-04 Part B (TdTag/ThTag `colSpan`/`rowSpan` this-trap): cut by curation; it rejects working code (`<td class="col-span-2">` in a `display:grid` row is 133 px against a 67 px sibling, Chromium 149, Tailwind 4.3.3). Not moved to 9.0.0.
- RFC-C-02's removal of `containerQuery`, root `setDevChecks` and `setMicrodata`: the RFC proposed 9 names; 3 stay (first guesses 1/13 and 3/21 in leak-free runs; `addAttribute` would compile `itemtpye`).
- RFC-B-03's `resolve(params?, query?)` notation: 3/3 agents wrote `resolve(undefined, { q })` and stopped at TS2554.
- RFC-A-01 mirroring htmx's push/replace resolution in `closeOn: ["nav"]`: 6173 B, 29 B over the 6144 B budget, and still disagrees on `hx-boost`.
- RFC-A-02's core `no-restricted-syntax`/`no-restricted-imports` slots: a user block lost its own ban (0 reports); 2 of 15 shared-derived fleet configs use those slots.
- RFC-C-04's lint ban on `@jtdigital/ui`: it would write the retired name into 15/15 canonical configs for a guess made 0 times; shipping `StyledSelect`: 1 of 2 withheld runs still wrote it beside `selectStyle`.
- RFC-B-01's generic-conditional gate: it broke a live generic `.poll` wrapper (`widget.helpers.ts:72`) and 5 green-matrix wrappers (§5.4).
- RFC-C-03's fix-naming hint member on `render`'s rest parameter: rejected in the RFC; no verdict required it.
- RFC-D-01 autofixing the exact ternary and `MatchValue` rewrites: stays a suggestion first.

## Follow-ups the contracts raised (seed for the next run)

- hx-trigger filters (`click[…]`) run through `new Function`: T1 6/6 without CSP, 3 fleet sites (1 canonical, everyframe-composer `projects.pad.view.ts:500`); taught at `REFERENCE.md:363` and `src/htmx.ts:208` (RFC-A-05).
- A status `push: true` pushes `/true` on beta6 and 4.0.0; 0 fleet sites (RFC-A-08).
- `defineRoutes({ team: "/team" })` gets a TS2322 naming no fix (6/6 no-repo runs; RFC-B-01, RFC-B-03).
- `.poll(route)` with `route: FragmentRoute<string>` is rejected by `DeclaresNothing` on 8.1.0 (RFC-B-01 probe s15).
- templates/web sends 20/20 `assetUrl(` calls to page links, against the message's "for a static file" (RFC-B-03).
- `</SCRIPT` lowercasing in JS and style bodies changes a string literal's value (6,116/10,000; RFC-A-06).
- A `setChecked` trap: 1/4 no-guideline Form runs compiled `.checked(bool)`, which ticks every box (RFC-A-07 attack 3, RFC-A-04 family).
- `REFERENCE.md:394` teaches `innerHTML swap:500ms settle:100ms`, TS2322 on 8.1.0; `outerSync` is read by both bundles and untyped (RFC-B-02).
- The `/contact?success=true` landing shows the same form; the web scaffold's `CLAUDE.md` is the guidelines copy that points at htmx (RFC-A-02 open questions 1-2).
- `src/core/tag.ts:156` JSDoc still teaches `.setStyle()` for runtime values; guidelines `CLAUDE.md:231` claims a hand-written `(t: Tag)` preset breaks the chain (false on 8.1.0: tsc 0) (RFC-D-01).
- A `fieldError` styler in `src/shared/ui` (48 `f.error` sites in 13 repos); `StyledInput` is what draws agents to a `StyledSelect` twin (RFC-C-04).
- A process rendering without `buildServer` (a `*.cron.ts` job) renders unmerged under RFC-A-09 (fleet reach 0).

---

## Track E addendum (new APIs, curation §F)

## Track E addendum (curation §F, decided 2026-10-01: "go with recommendations")

**Header counts after Track E:** 25 curated items (24 RFCs + the C-67 teaching fix). Track E: 8 RFCs designed and verified; 5 curated (RFC-E-01, E-02, E-07, E-08 include; RFC-E-04 modified), 1 deferred (RFC-E-03), 2 cut (RFC-E-05, RFC-E-06); 27 undesigned candidates deferred. Net guideline delta of the curated set: **-25 lines** (was -20; RFC-E-07 -5).

Candidate ids below are `10-discovery/_clusters-e.md` ids, written `cand. E-nn` because candidates E-04..E-06, E-17 and E-18 became RFC-E-06, E-07, E-08, E-04 and E-05, while candidates E-07 and E-08 are other, undesigned items.

### 8.2.0 (additions)

Vehicles gain eslint-plugin-fluent-html 4.3.0, published after fluent-html 8.2.0 (`prefer-if-not-empty` imports `IfNotEmpty`; `prefer-size` reads the `size` vocab row).

| ID | Roadmap line | Enforcement | Guideline Δ |
|---|---|---|---|
| RFC-E-01 | `Tag.getId()` is the read for a wrapper handed a built control: read-dependent canonical FormGroup sites associate 0/69 to 69/69 (tsc, eslint and vendored tests silent today) and `idPrefix` duplicates go from 2/3 runs to 0/3; the template `FormGroup` drops its restated `name`, links a `hint` through `getId()` (the cut RFC-E-06's job, 5,869/5,898 byte-identical renders) and nests an id-less control; in-view `Form<T>` labels stay `f.label` (6/6 fresh-view runs). | type + template runtime fallback | 0 |
| RFC-E-02 | A required select whose own markup preselects a value nobody chose throws in development, naming the field, the value, the placeholder fix and the bound-default exit; a bound value (controller, record or request) never decides a throw, so `?industry=carp` renders (26 rendering shapes byte-identical to 8.1.0 in development, production 34/34). Catches gzs/stem-50's 2 live selects and the incident selects of `9a1603a^`; the unlisted-bound-value guard (website-sales-funnel-automation-system LARGE) waits for C-83. | dev-throw | 0 |
| RFC-E-04 | `f.select` literal option values are checked against the bound field (`SelectOption<V>`, a non-distributive `FieldValue` that fixes L-113): competify's stale filter list (e7448d0) becomes a TS2322 naming `"SCREENED"`; 0 new tsc errors in 15 canonical repos and the template on the array-only signature; 32/46 closed-field sites at HEAD are checked; the 14 typed `string` stay open (`as const` closed one in 2 tokens). The label-record arm is cut (guardrail 7). | type | 0 |
| RFC-E-07 | `IfNotEmpty`/`IfNotEmptyElse` bind a list and treat `null`, `undefined` and `[]` alike; `prefer-if-not-empty` (plugin 4.3.0) autofixes 352/352 restated guards in 16/16 units (277 executed byte-identical, 0 mismatches) plus `ForEachElse` and the dead `?? []`, and suggests a fix for 14 array-to-`IfThen` empty containers; the d.ts block costs 303 tokens after the JSDoc strip (was 725); `NonEmpty` stays internal. | lint (type-aware autofix) + type | -5 |
| RFC-E-08 | `.size()` (vocab row, closed `TailwindSize`, unit overload, variant key) replaces 423 equal `.w(x).h(x)` pairs in 16/16 canonical repos and gives 1,805 design `size-*` tokens an autofix; 12/12 agent runs found it from types alone (0/9 on 8.1.0); `prefer-size` (plugin 4.3.0) autofixes only provably clean chains (282/420) and suggests elsewhere, because a preset's `w-4 h-6` beats a folded `size-10` (40×40 to 16×24); a one-time receiver-checked `codemod:size-fold` folds the fleet (423/423 render-identical); fix hints name the unit overload and `Select(...).setSize(n)`. | lint (scoped autofix) + type | 0 |

### 9.0.0 (additions)

| ID | Roadmap line | Enforcement | Guideline Δ |
|---|---|---|---|
| RFC-E-04 (tail) | `f.radio`, `f.hidden`, `f.checkbox` values checked against the bound field (a valued checkbox on a boolean field stays open, RFC-A-07); probe 4/4 negatives rejected (8.1.0 0/4); 1 new error in 16 repos plus the template (`home-page/src/app/content-panel/views/content-panel.components.ts:60`), fixed by `codemod:form-values-9` 1/1. | type + codemod | 0 |
| RFC-E-07 (tail) | `ForEachElse` leaves as a `PRUNED_9` row of RFC-C-02's `codemod:prune-9` (everyframe-composer 1/1, byte-identical in both states; time-to-live reported); TS2305 with no suggestion; leaves only if RFC-C-02's guess top-up never writes it first (0 of 12 measured stock runs). | type + ci gate, codemod | 0 |

### deferred (Track E: 1 designed RFC + 27 candidates = 28)

Combined with the 74 deferred clusters: 102 deferred items in the seen set for the next run.

| Item | Score | Lane / layer | Why (measure; interplay) |
|---|---|---|---|
| RFC-E-03 `Form<T>` stamps maxlength/minlength/required/min/max from the body schema | 18 | 8.2.0 core | Agents already restate the limits: 0 of 12 blind-scaffold runs omitted any of the 9 expected attributes, and all 5 non-adopters restated every limit by hand; adoption tracks exemplars (2/2 with schema-passing template views, 0/2 without). As prototyped, `schema?: FormSchema<T>` reverse-infers `T` with no `<T>`, a T-free second way to type a form (§5.7, §5.4) unless `NoInfer`. The human-written fleet gap stays: 39 maxlength omissions in 11 repos, 227 hand restatements in 15; the adoption codemod rewrote 263/387 sites and dropped 228 setters with 0 new diagnostics in 16/16. Reopen with `NoInfer<FormSchema<T>>`, the template exemplar gate and an omission measured in agent-written code. |
| cand. E-07 Restore `scrollM` | 12 | 8.2.0 core | 15 canonical scroll-margin hatch sites in 6 repos, 14 written after the 2026-08-14 prune, 15/15 on the spacing scale; the plugin 4.1.0 autofix target `.scroll("mt-24")` fails TS2345 (RFC-C-01's fix contract must stop emitting it). Reverses L-223 on census. |
| cand. E-08 `htmx-event-name` lint | 12 | 8.2.0 tooling | 19 htmx-2 listeners in 6 repos serving htmx 4 (0 of 14 names fire on beta6 or 4.0.0); 1 canonical (`workshop-toni/src/app/story/client/story.ts:193-194`); prototype 19/19 flagged, 0 false positives on 10 valid sites. |
| cand. E-09 The 422 answers with the page | 12 | template framework | 31 `isHtmxRequest` forks in 15 repos; `select:` on the `{ invalid }` bag leaves 1 header and 1 `#main-content` after 2 rejected submits on 2 bundles (3 headers without). C-54 (deferred) typed the region; this removes the uncontracted path. |
| cand. E-10 `Form(...).search(route)` | 12 | template framework | The shipped call fires 0 of 3 gestures and Enter does a full-page GET; prototype 3/3; 40 filter forms in 16 repos spend 130 verb calls. Must emit RFC-D-02's `queue last`; `replaceUrl: true` needs a grammar row. |
| cand. E-11 `Field<T>` shell | 12 | template user-land | 25 field-wrapper re-definitions in 10 of 15 apps. RFC-E-01 gives the template `FormGroup` its hint and error slots, so a `Field<T>({ f, name })` shell must not ship beside it. |
| cand. E-12 Alert live region | 12 | template user-land | 14 of 15 canonical Alert copies carry no role; 12 of 13 status-shaped swap targets in 7 repos are not live; Chromium's AX tree after a 4.0.0 outerMorph shows no live region. |
| cand. E-13 Meter renders native progress | 12 | template user-land | 44 setStyle width bars in 16 repos (29 app-authored in 10), 1 with progressbar semantics; `<progress value=43>` reads `progressbar 43%`. |
| cand. E-14 CSP directive options | 12 | template framework | 7 of 15 apps need media-src, frame-src or form-action; 6 edit core `security-headers.ts`. |
| cand. E-15 `reply.renderError` | 12 | template framework | 43 ErrorPage answers in 28 fragment-stance handlers nest a second `#main-content` (0 retarget); 194 ErrorPage answers in 15 repos. |
| cand. E-16 Blank query value means absent | 12 | template framework | 2 fix commits in 2 repos (competify e7448d0, website-sales-funnel-automation-system 4a8715d9); Fastify 5.12.1: 2/2 blank URLs answer 400, 0/2 with the strip. RFC-E-04 admits `""` on optional keys, so its JSDoc carries the caveat in E-16's place. |
| cand. E-19 `cssProp` union from TS 6 | 8 | 8.2.0 core | TS 6.0.3 `CSSStyleProperties` adds 27 and removes 0; `emit-css-props` throws on 6.0.3 (parsed 0); 7/7 probe calls TS2345 on 8.1.0. RFC-C-01's `field-sizing-content` redirect compiles only with it. |
| cand. E-20 outline width, color, offset | 8 | 8.2.0 core | 406 outline tokens in the design files of 5 repos fail tsc on 8.1.0 (282 compile on the prototype); 6 cssProp hatches in 2 repos. |
| cand. E-21 Targeted `.onChange` | 8 | template framework | 20 hand-rolled change-trigger sites in 4 repos including 1 core fork; gzs/stem-50's form-level autosave sends 0 requests while typing. |
| cand. E-22 `hxTargets` reader | 8 | template framework | Both bundles send `div#id`, so bare compares match 0 of 6 header values; the private parser is copied in 2 repos. |
| cand. E-23 Motion tokens | 6 | 8.2.0 core (curation call) | 33 hand-written `@keyframes` in 8 repos, 16 arbitrary motion literals in 4; emitting `@keyframes` is a call on the tokens-only `defineTheme` design; RFC-A-09's merge would learn 2 families. |
| cand. E-24 Value unions match the families | 6 | 8.2.0 core | 553 design-class occurrences fail tsc on 8.1.0 and compile on the prototype; 57 arbitrary minH/minW calls sit exactly on the scale. |
| cand. E-25 Table border model | 6 | 8.2.0 core | 22 hatch sites in 8 repos (14 are the template cohorts pair in 7 copies); the 4.1.0 autofix `.border("collapse")` fails TS2769. |
| cand. E-26 `hx-nonce` stamping | 6 | 8.2.0 core | 1 canonical incident (`everyframe-composer` `projects.pad.view.ts:500`, 0 requests plus a CSP violation); renderWithNonce x1.127; open security question on nonce exposure through CSS attribute selectors. RFC-C-03 makes `renderWithNonce` the survivor it would extend. |
| cand. E-27 Template Badge | 6 | template user-land | 98 `*Badge` definitions in 14 repos; 6/6 recon runs built one, 4 designs; pain 1. |
| cand. E-28 `createEmail` returns html and text | 6 | template framework | 44 html-only `sendMail` calls in 13 repos; 0 deliverability incidents; V-RFC-E-05-guardrails #5: not through a test helper's `text()`. |
| cand. E-29 aria-current from the request path | 4 | template framework | Template TabItem renders 0 `aria-current`; 50 hand `setAria({ current })` calls in 9 repos (34 in everyframe-composer). |
| cand. E-30 Streamed job progress via hx-sse | 4 | decision-gated framework | 14 bounded polls in 7 repos; gated on L-263's prod spike on LSAPI connection lifetime. |
| cand. E-31 Snap rows and scrollbar roots | 3 | 8.2.0 core | 9 hatch sites in 3 repos; 588 scrollbar classes untyped; `cssProp` works (pain 1). |
| cand. E-32 align, origin, placeItems, justifySelf, normalCase | 3 | 8.2.0 core | 12 align hatches in 5 repos; 5 of 8 prose-only runs guessed `.justifySelf()` (TS2339); recon 02 probe #4 `.placeItems` stays a TS2339. |
| cand. E-33 Timed self-removal for notices | 2 | parked framework | 1 canonical repo; the prototype is +172 B min, 5 B over the ADR-12 budget, and the behaviors asset has 4 B left after RFC-A-01. |
| cand. E-34 Template targets ES2024 | 2 | template framework | `Map.groupBy` adds 0 diagnostics over 4,890 files; 29 hand-rolled group helpers in 15 repos; a Node 20 host fails at runtime without an engine check. |
| cand. E-35 Layout chrome prop | 2 | template framework | 6 of 16 layouts add a chrome prop with 5 vocabularies; 71 call sites; no failure measured. |

Count: RFC-E-03 (18); candidates score 12 × 10, 8 × 4, 6 × 6, 4 × 2, 3 × 2, 2 × 3 = 27. By lane: template 15 (cand. E-09..E-16, E-21, E-22, E-27..E-29, E-34, E-35), 8.2.0 10, parked 1, decision-gated 1. The 15 template candidates need no library release and fit a later template-only round.

### cut (Track E: 2)

| RFC | Why (measure) | Where its job goes |
|---|---|---|
| RFC-E-05 `fluent-html/testing` `inspect()` | Guardrail-killed §5.5 (V-RFC-E-05-guardrails, reject 0.8): a 62-line user-land tokenizer over the public `render()` reproduces it with 0 lib change: 251/251 fleet rewrites pass, 5/5 structural mutants caught, 31/31 audit defects in 6 repos, byte-identical diagnostics, 1934 vs 2033 us/op; it also queries `server.inject` bodies, which the lib version declines (2,855 integration assertions in 317 files would stay on regex). | Seed: the verdict's re-file as a template test helper on `render()` that accepts `View | string`. |
| RFC-E-06 `f.hint(name, ...)` | Guardrail-killed §5.5 (V-RFC-E-06-guardrails, reject 0.7): with `getId()`, a 12-line user-land `linkHint` reproduced 5,869/5,898 test renders over the 8 rewrite repos with 0 call-site edits (the RFC needs 41) and linked 55/57 sites plus 1 unbound site; shipping `f.hint` beside `getId` gives two ways to link a hint (§5.7). | RFC-E-01's template `FormGroup` `hint` slot; 1 checkbox-group site (website-sales-funnel-automation-system) stays unlinked. |

### rejected (correction)

"None" holds for the first 19 RFCs. Track E: 0 rejects by quorum; RFC-E-05 and RFC-E-06 each drew one §5.5 reject and are recorded under cut.

Design alternatives rejected inside curated Track E RFCs (with the reason measured):
- RFC-E-04's label-record arm: a second shape for the closed vocabulary, byte-identical at 20/20 rewritten sites (11 after dedup), no converge lint. Refile only as its own RFC with an L-143 converge lint, integer-key rejection and a dedup reach count.
- RFC-E-04 as two overloads (TS2769 buries the fix on line 7) or all four methods in 8.2.0 (1 break fails the additive lane).
- RFC-E-02 guard 2 on every single select: 21 intended-default filter selects in website-sales-funnel-automation-system would throw. The `setDevChecks(false)` message exit: 0 of 8 agents used it, and 2/2 deliberate-default repairs forced a choice for lack of a per-site exit. A `placeholder` parameter on `f.select` (L-150 stays parked).
- RFC-E-01's `getName()`: 0 canonical app sites. A dev throw for an id-less control: 67 vendored test calls in 13 canonical repos would throw; the nest fallback is byte-identical for `Form<T>` pages. Moving `FormGroup` to `f.label`: `FormGroup({ f, name: "email", label: "Password", input: f.input("password") })` compiles and mislabels.
- RFC-E-07 making `IfThen` treat `[]` as absent: silently changes 14 sites. The constraint-form generic (`<A extends readonly unknown[] | null | undefined>`): trades the named fix on 4 non-array kinds for a stock message.
- RFC-E-08 `TailwindSize = TailwindWidth` (admits `size-screen`), a user-land `square(n)` preset (0 extracted classes), a covering-family merge (guardrail 13), the verdict's longer brand texts (elide the number arm on 5/5 lines).

### deferred clusters touched by Track E

- **C-83** gains RFC-E-02 guard 1 (a bound value that matches no option), designed to V-RFC-E-02-guardrails #2: evaluated at serialize time from E-02's `noteBoundSelect` record, skipping a select that carries its own htmx request attribute (`.onChange`, `.fragment`, `.search`, `.setHtmx`); pins: website-sales-funnel-automation-system `carp` and `Plumbing` render, B1 throws.
- **C-31** would close RFC-E-01's residual: `addAttribute("id", …)` is invisible to `getId()` (17 pre-7 sites, 0 canonical).
- **C-84** lands after RFC-E-01's template `FormGroup` as well as RFC-A-07 (the old `FormGroup` overwrote `idPrefix` ids: duplicate `id="email"` in 2/3 runs).
- **C-52** must emit RFC-E-08's branded arms and RFC-E-07's message literal along with RFC-A-04's traps.
- **C-62** must keep RFC-E-08's single `.size(unit, n)` setStyle suggestion if it derives the bypass lints.
- **C-79** shares a 9.0.0 `FormBinding` edit pass with RFC-E-04's tail if designed.
- **C-41** now also blocks CI for plugin 4.3.0's two new rule suites.

### Follow-ups the Track E contracts raised (seed for the next run)

- `guidelines/quality-assurance/view-testing.md:238-288` teaches `withOOB`/`OOB`, removed per `fluent-html/CHANGELOG.md:506` (0 exports in 8.1.0): a -42-line staleness fix in no curated item (V-RFC-E-05-guardrails #4).
- Residual silent id reads: a storage cast compiles (140 cast-shaped fleet matches, 24 in FormGroup files); `input.attributes["id"]` compiles and reads `undefined` (6/6 P2 agents read `aria-describedby` back that way).
- A required, real-led edit form that re-renders a tampered posted value shows and resubmits the first option (guard 1's case); B2, an optional placeholder-led select clearing a stored value to `""`, stays silent (0 fleet sites); 7 raw `Select(...).toggle("required")` sites in 4 pre-7 repos are unclassified.
- `Tag.toggle(name, undefined)` treats `undefined` as true (RFC-E-02 open question 3; its `packages/ui` instance is deleted by RFC-C-04).
- `competition/src/app/competition/organise/views/organise.components.ts:71` `selectField<T>` (9 sites) fails open by design; the RFC cited it without the `competition/` subpath.
- `prefer-if-not-empty` leaves the negative half of a paired guard (competify `preglednice.opis.view.ts:89,91`) and the first-element bind `IfThen(xs[0], …)` (2 fleet sites) as written; generic list parameters `<L extends readonly string[]>` get a TS2345 naming the internal `ListOrAbsent` (0 fleet view sites).
- `.hover({ size: "4.5" })` gets a plain TS2322 with no hint; `Select().size("4")` and `Input().size("20")` style the element instead of setting the attribute; 2 non-adjacent equal pairs are not reported.
- Re-measure at implementation: RFC-E-01's folded `getId` JSDoc (+135 tokens for the 6-line text), RFC-E-04's `forms.d.ts` (12,197 B vs 11,028 B on 8.1.0), RFC-E-08's brand diagnostics against the 141-token cap; run RFC-E-04's array-only authoring probe (the 7 measured runs used the cut record arm).
