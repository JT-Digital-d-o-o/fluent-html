# Lockstep: per-repo changes and publish order

Repos: fluent-html, eslint-plugin-fluent-html (`fluent-html-eslint-plugin`), fluent-html-tailwind-extractor, guidelines, projects-template (`templates/full-stack`, `templates/web`, `templates/shared`, `packages/ui`). After RFC-C-04, `packages/ui` is deleted and `ui` stops being a lockstep target.

## 1. Peer-dependency and ordering constraints (these fix the order)

| # | Constraint | Source (measure) |
|---|---|---|
| K1 | fluent-html 8.2.0's RFC-B-03 lib half ships only in or after the release carrying RFC-B-01's dev throw (8.1.1). | Without it, the cast-free verbatim-key path through `.setHtmx` renders `<div hx-undefined="undefined">` under `NODE_ENV=development` (V-RFC-B-03-combined #2). |
| K2 | The template's fluent-html 8.1.1 bump is one commit carrying the rebuilt behaviors asset (RFC-A-01), the `HX-Redirect` hook (RFC-A-05), the JSON-LD helper drop (RFC-A-06) and the local lockstep check (RFC-A-03). | Boot throws `Behavior runtime asset public/js/fluent-behaviors.8.1.1.f87f375a.js is missing` until `npm run behaviors:build`; the hook sanitizes only on 8.1.1; `tests/unit/seo-meta.test.ts:105` fails 1 of 14 on 8.1.0 without the helper; the lockstep check passes only against 8.1.1's `htmx-served` alias. |
| K3 | The template's `setClassMerge(theme)` opt-in (RFC-A-09) lands in the same commit as the lock bump to fluent-html 8.2.0. | Without the bump: TS2305 at `server.ts:5` and `tests/setup.swap-verbs.ts:2`. |
| K4 | eslint-plugin-fluent-html 4.2.0 has no lib-first constraint: no curated RFC adds a class-vocab row (RFC-A-09 adds `class-families.gen.ts`, not rows; RFC-C-02 makes 0 vocab changes; RFC-A-04's traps are type-only interface merges with no prototype entry), and RFC-B-03's message names producers that exist since 8.0.0. | RFC-C-01 compiles its fix contract against the resolved `node_modules/fluent-html` (devDependency moves 8.0.0 `7cf5b23` → 8.1.0 `656e812`; class-vocab 159/159 methods identical between them). `gen:vocab --check` records the fluent-html and tailwindcss versions and exits 1 when they differ from the resolved ones, so each later devDependency move (8.1.1, 8.2.0, 9.0.0) is a re-sweep commit. At run time a generated entry applies only while the host's derivation still yields its stored call. |
| K5 | The plugin 4.2.0 publish precedes the template's plugin lock bump; RFC-D-01's guideline deletions follow the plugin and extractor commits that carry the new messages. | The deleted lines (guidelines `CLAUDE.md:72`, `fluent-html.md:349`, `fluent-html/CLAUDE.md:72`) are the `staticManifest` remedy the new messages replace (11/11 calls still throw with it). |
| K6 | The extractor needs no change for any lib release in this run: it reads `fluent-html/class-vocab` at run time and the vocab is unchanged. RFC-D-01's text rides 3.0.0 on main. | RFC-C-02 and RFC-A-09 lockstep rows: extractor "none". |
| K7 | Guideline lines publish no earlier than the code they describe. | RFC-A-07's `fluent-html.md:132` only after the 8.1.1 tag (taught shape 0/16 correct on 8.1.0, 16/16 on the patch; 28 of 31 lib-pinned fleet repos pull guidelines main independently of their pin). RFC-B-03's trims and RFC-A-09's `views.md` after the 8.2.0 tag (`guidelines:pull` reaches 23 repos, 0 call `setClassMerge`). RFC-B-01's `CLAUDE.md:265` and RFC-D-02's hunks with template 3.8.0. RFC-C-02's `fluent-html.md:383` after 9.0.0. C-67 with 8.1.1 (it depends on RFC-A-01's runtime). |
| K8 | Within fluent-html 8.1.1, RFC-A-03's acceptance-harness change (behaviors version read from `package.json`) lands before RFC-A-01's version bump. | The harness hard-codes `fluent-behaviors.8.1.0.js` today. |
| K9 | Within fluent-html 8.1.1, RFC-A-05 and RFC-A-08 land as one `buildStatusConfig` contract, or A-05 first. | A-08's security pin expects the percent-encoded `replace:/q?x=1%20target:#main`. |
| K10 | 9.0.0 consumer order: `codemod:canonical` (pre-7 only) → install 9.0.0 → `codemod:prune-9` → `codemod:nonce-bag` → `scripts/codemod/bare-selector.ts` → `npm run guidelines:pull`. | prune-9 and nonce-bag both rewrite fluent-html import declarations; run one after another. gzs: canonical 583 sites / 213 skipped, then prune-9 still 3 edits. |
| K11 | fluent-html 9.0.0 waits for RFC-C-02's guess top-up: 20 leak-free runs per condition (7 more with rules, 12 more without). | A name any top-up run writes first moves to Kept (the 9-name prune lost 4/252 leak-free guesses). |

## 2. Publish order

| Step | Repo and version | Contents | Gate |
|---|---|---|---|
| 0 | projects-template (human) | Set the `PRIVATE_REPOS_TOKEN` repository secret (`project/pm/ci-green/todo.md:9`). | Not a publish dependency; without it every template-side check below runs locally only. |
| 1 | fluent-html 8.1.1 | A-03 → A-05 + A-08 → A-06 → B-01 lib + A-05 dev checks → A-07 + C-04 comment → A-01 (version 8.1.1) → C-67 docs | K8, K9; lib CI green including the new `grammar` job; official bench re-run (A-05). |
| 2 | eslint-plugin-fluent-html 4.2.0 | C-01, D-01, B-03 plugin half (one README commit for C-01 + D-01) | K4. Independent of step 1. |
| 3 | fluent-html-tailwind-extractor main (3.0.0 untagged) | D-01 `formatUnresolved` text and `staticManifest` JSDoc | K6. The 3.0.0 tag stays blocked (section 5). |
| 4 | guidelines, wave G1 | A-03, A-05, C-01, D-01, D-02, B-01 (`CLAUDE.md:265` rewording), C-04, C-67, A-07 | after steps 1-3; with step 5 for B-01 and D-02 (K7). guidelines/** net -7. |
| 4b | fluent-html repo commit (no release) | `CLAUDE.md` hunks of A-03 (:272, :276), D-01 (:72, :156, :157, :193, :233), D-02 (:274), B-01 (:265), C-04 (:235), C-67 (:314) | same gates as their guidelines twins. Net -3. |
| 5 | projects-template 3.8.0 | commit order in section 3.5 | K2, K5. |
| 6 | fluent-html 8.2.0 | B-02, B-03 lib, A-04, A-09 | K1; B-02 rows satisfy A-03's rule enumeration. |
| 7 | guidelines, wave G2 | B-03 (`htmx.md:181`, `:215`, `:225`, `:474`; `CLAUDE.md:265` clause), A-09 (`views.md:126-134`) | after the 8.2.0 tag (K7). Net -7. |
| 8 | projects-template 3.9.0 | A-09 opt-in | K3. |
| 9 | fluent-html 9.0.0 | B-04, C-02, C-03 + three codemods, one migration section | K10, K11; `test/prune-gate.test.ts` green. |
| 10 | guidelines, wave G3 | C-02 (`fluent-html.md:383`) | after the 9.0.0 tag. Net -1. |

Plugin re-sweeps (K4) follow steps 1, 6 and 9 whenever the plugin's devDependency moves.

## 3. Per-repo change lists

### 3.1 fluent-html

**8.1.1**
- RFC-A-03: `test/grammar/` (`bundles.mjs`, `surface.mjs`, `rows.mjs`, `harness.mjs`, `grammar.spec.mjs`, `coverage.test.mjs`, `playwright.config.mjs`); `test:grammar` script; devDependency `"htmx-served": "npm:htmx.org@4.0.0"`; `grammar` job in `.github/workflows/test.yml` (Node 22) running the coverage gate, the grammar matrix and the behaviors acceptance matrix (69 rows); acceptance harness reads the behaviors version from `package.json`; record text in `CHANGELOG.md` (errata for :97-99 and :166-169), `test/htmx.test.ts:155`, `test/types/type-surface.test-d.ts:440,442,444`, `test/patterns.ts:165,198`; `src/patterns.ts:117-121` JSDoc drops `extensions: "sse, preload",`.
- RFC-A-05: `src/render/escape.ts` (`sanitizeUrlFor`, `sanitizeHtmxUrl`, `htmxScriptPrefix`); `src/render/serialize.ts` (endpoint, push/replace, status URL step, `htmxText`); `src/patterns.ts` (4 `HxResponse` URL setters, `PLAIN_LOCATION_PATH`); `src/core/dev-checks.ts` + `tag.ts` (`assertNoHtmxScript`); `test/htmx-js-sinks.test.ts`; `REFERENCE.md:1342-1345`, `:1384-1386`.
- RFC-A-08: `buildStatusConfig` (one contract with A-05); 7 + 3 + 1 unit pins; 8 + 3 oracle rows; `F.status` known mark deleted.
- RFC-A-06: `serialize.ts` `json` context, `scriptCtx`, widened `JSON_SCRIPT_TYPE_RE`; 7 security pins; `REFERENCE.md:1402`.
- RFC-B-01 (lib half): `assertRequestBag` in `src/core/dev-checks.ts`, gated `if (htmx)` in `Tag._setHx`; dev-check tests for the throwing shapes (string, `.resolve()` and uncalled-callable spreads, a function endpoint, `"get x"`, an OOB-only cast) and the passing ones (uppercase method, URL and String object endpoints, `null`/`false` clears); the RFC lib measured 2165/2165.
- RFC-A-07: `src/elements/forms.ts` checkbox binding (rename through `setId`) and JSDoc (:447-450, :455-458); `assertFormArgs`; `README.md:167-170` one-builder example; 10 `form-for` pins.
- RFC-A-01: `src/behaviors/client/runtime.ts`; acceptance rows 34-35 (`app.mjs` fixtures, page Style gains `.invisible{visibility:hidden}`); oracle bundle-check rows for `ctx.target`, `ctx.push`, `ctx.hx.pushurl`; version 8.1.1.
- RFC-C-04: `src/elements/forms.ts:524-525` comment; `project/pm/decisions.md` superseded-in-part line at :31 and a new decision; `project/pm/INDEX.md:21`, `prd.md:30,49`, `core-primitives/prd.md:5,23,31`.
- C-67: `src/elements/interactive.ts:32-34`, `src/elements/html-types.ts:199-200` JSDoc; `REFERENCE.md:952`.
- CHANGELOG 8.1.1 entries for all of the above.

**8.2.0**
- RFC-B-02: `src/htmx.ts` (`SwapModifier` arms, `SwapReadStyle`, `SwapFocusScrollFlag`, `SwapScrollTarget`, `SwapShowTarget`, `WindowTrigger`; `ExtendedCSSSelector` minus `window`/`document`; `DOMEvent` minus `resize`; `HxTrigger` minus `sse:message`/`ws:message`); `HxSwap` JSDoc; `REFERENCE.md:385-386`; +21 type-surface lines + 2 `@ts-expect-error`; +48 oracle rows (`rows-c09.mjs`), +4 controls, -5 known, -4 controls.
- RFC-B-03: `src/core/route-sink-hint.ts` (new, unexported); signatures of `hx()` (`src/htmx.ts:420`), `setHtmx`/`hxGet`/`hxPost` (`src/core/htmx-methods.ts:18-20`), `setHref` (`src/elements/links.ts:30`); notation at `README.md:91`, `src/htmx.ts:22`, `src/routes.ts:299`; 9 brand pins.
- RFC-A-04: interface merges in `src/core/tag.ts:51` and `src/elements/tables.ts` (:37, :90); `test/types/setter-probe/trap-probe.ts`; `test/setter-errors.test.ts`; `stripInternal` stays off.
- RFC-A-09: `src/render/class-merge.ts`, `src/render/class-families.gen.ts`, `scripts/gen-vocab/emit-class-families.ts`, gen-vocab artifact row, `serialize.ts:228`, exports from `src/index.ts` and `src/render/index.ts`, `test/class-merge.test.ts` (keep/merge/tab/toggle tests and the ordered-pair gate); `project/pm/decisions.md` entry superseding :94; README/REFERENCE API entry; two bench rows with the merge on.

**9.0.0**
- RFC-B-04: `src/htmx.ts` (`HxTarget`, `HxSelect`, `HtmlTagName`, hints, helper return types), `src/patterns.ts` (`Partial` single signature, bare-word regex arm deleted), `src/routes.ts`, 5 `as string` casts in `serialize.ts`, `test/types/selector-probe` + `test/selector-errors.test.ts`, `REFERENCE.md:28`, `scripts/codemod/bare-selector.ts`.
- RFC-C-02: removals in `src/elements/forms.ts:412-417`, `src/control/iteration.ts:168-183`, `src/control/index.ts:16`, `src/index.ts:341`, `:400-401`, `:434`; `typesVersions` (core, ids, behaviors, control) + a node10 row in `test/packaging.test.ts`; `scripts/codemod/prune-9.ts`, `codemod:prune-9`, `test/codemod-prune-9.test.ts`; `test/prune-gate.test.ts` + `test/types/prune-gate/{removed,prior,heals}.ts`; `REFERENCE.md:1892`, `:1910-1912`; `generated/full-surface.md` regenerated; `examples/control-flow.ts`; `scripts/census/method-census.mjs:93`; `test/form-for.test.ts:98` retitled.
- RFC-C-03: `src/render/{render,stream,serialize}.ts` signatures and JSDoc; barrels `src/index.ts:84`, `src/render/index.ts:4`; `test/security.ts`, `test/stream.test.ts`, type-surface pins; `scripts/codemod/nonce-bag.ts`, `codemod:nonce-bag`, `test/codemod-nonce-bag.test.ts`.
- One CHANGELOG 9.0.0 migration section naming the three codemods and the consumer order (K10).

### 3.2 eslint-plugin-fluent-html 4.2.0
- RFC-C-01: `scripts/gen-fix-contract.mjs` (skip guard, compiles against `node_modules/fluent-html`, versions in the header); `src/fix-contract.generated.ts` with per-entry provenance; derivation in `derive-fixable.ts`/`tailwind-token.ts`; the run-time residue throw moves to `test/derivation.test.js`; messageIds `cssPropSuccessor`, `tailwindNoMethod`, `untypedValue`, `variantHeadUntyped`, `hostRejects`; `tier1ByPrefix` in the `variantNoMethod` fallback; `test/fix-contract.mjs` in `npm test`; devDependency fluent-html `7cf5b23` → `656e812`; README :124, :169.
- RFC-D-01: `no-dynamic-typed-styling-arg` and `no-dynamic-class-argument` messages and the type-aware lookup branch; class-suffix name derivation; tests for `Record<string>`, a wider map, `cn`/`clsx`/`classNames`/`twMerge`; a CI step compiling every printed rewrite; README :125, :128, :164-166, :170 (one commit with C-01's README lines).
- RFC-B-03: `prefer-set-method` `preferBrandedSetter` with `BRANDED_URL_SETTERS = { href: ["A"] }`; 7 new rule cases, the old autofix case now `output: null`.
- Test suites re-run on the merged branch (C-01's fix contract, D-01's `rule.test.js` 430/0 and `type-aware.test.js` 23/0, B-03's 429/0 were each measured on separate prototypes).

### 3.3 fluent-html-tailwind-extractor (3.0.0, main)
- RFC-D-01: `src/safelist.ts` `formatUnresolved` (`:58-59`); `staticManifest` JSDoc (`safelist.ts:8-9`, `:29-32`; `extract.ts:209`, `:254`); `README.md:66`, `:82`, `CHANGELOG.md:10`. The option itself is unchanged.
- RFC-C-04's template guard imports the extractor's `scanFluent`; it must stay exported at the commit the template resolves.

### 3.4 guidelines (`guidelines/web-development/**`)

| Wave | File: lines (RFC) | Net |
|---|---|---|
| G1 | `htmx.md`: :276-278, :282, :412, :499 (A-03); :346, :389, :391 (D-02); :591, :593-594 (C-67). `CLAUDE.md`: :72, :155, :191, :229 (D-01); :231 (C-04); :265 (B-01); :273 (D-02); :337 (C-67). `fluent-html.md`: :132 (A-07, after the 8.1.1 tag); :233 (C-01); :349 (D-01); :511 (A-05). | -7 |
| G2 | `htmx.md`: :181, :215, :225, :474 (B-03). `CLAUDE.md`: :265 clause (B-03). `views.md`: :126-134 (A-09). | -7 |
| G3 | `fluent-html.md`: :383 (C-02). | -1 |

guidelines/** total -15; with `fluent-html/CLAUDE.md` (-3) and `fluent-html/README.md` (-2), the run's net is -20. Vendored copies (`projects-template/CLAUDE.md`, `.ai/web-development/**`, 32 copies in 16 repos for the D-02 lines) follow through `guidelines:pull`.

### 3.5 projects-template

**3.8.0, commit order**
1. RFC-C-04: delete `packages/ui` (20 files); `pnpm-lock.yaml:42-50` importer block via `pnpm install --lockfile-only`; `tests/behavior-asset-pin.test.ts:91`; `README.md:172`; `selectStyle` in `templates/full-stack/src/shared/ui/form.ts` + `index.ts`; `tests/component-layer.test.ts`; PM decision, superseded line on `project/pm/fluent-html-v6/decisions.md:8-11`, `design-system` scope archived.
2. RFC-A-03: `tests/unit/htmx-grammar-contract.test.ts` deletes :109-128 and :130-140, rewrites :8-17; annotations on `project/research/agent-fitness/scorecard.md:140-142` and `htmx4-capability-scan.md:14`.
3. RFC-D-02: `templates/full-stack/src/core/htmx/swap-verbs.ts:345` and comment :328-331; `tests/unit/swap-verbs.test.ts:146,195`; the gated tripwire in `htmx-grammar-contract.test.ts` (after step 2); `tests/e2e/specs/htmx-smoke.spec.ts:260` un-skipped with the asymmetric lag, comments :225-230 and :21; `project/pm/swap-verbs/decisions.md`.
4. fluent-html 8.1.1 bump (K2): lock; `public/js/fluent-behaviors.8.1.1.f87f375a.js` replaces the 8.1.0 asset (RFC-A-01, 0 source edits); `templates/full-stack/src/core/server/server.ts:145` writes `HX-Redirect` through `hxResponse(Empty()).redirect(location).getHeaders()` (RFC-A-05); `src/app/seo/seo.meta.ts:37` comment and the `.replace` on :39 dropped (RFC-A-06); RFC-A-03's local lockstep check (`htmx.org` pin equals the installed fluent-html's `htmx-served` alias).
5. eslint-plugin-fluent-html 4.2.0 lock bump (C-01, D-01); re-vendor the G1 guidelines (`CLAUDE.md`, `.ai/web-development/{CLAUDE,fluent-html,htmx}.md`); superseded note on `project/pm/framework-ideation/taught-but-unused-prune/prd.md:69` (D-01).
6. RFC-B-01: `templates/full-stack/src/core/htmx/swap-verbs.ts` declare-module block (4 hint aliases, 9 parameters, implementations untouched); 5 line-1 pins and a generic-wrapper fixture in `tests/define-controller-compile.test.ts`.
7. RFC-B-03: `templates/full-stack/src/core/layout/assets.ts:40` `assetUrl` returns `ResolvedRoute` (runtime identical).
8. RFC-A-02: `templates/web/src/pages/contact.ts`, `src/components/blog/post-card.ts`, `src/index.ts` (full-page 400 with `pages["/contact"].seo`, `Layout` import moved), `tests/smoke.test.ts`, `eslint.config.mjs:64-65`, `CLAUDE.md` (net -72), `README.md`; `templates/shared/eslint-rules/no-htmx-without-runtime.mjs` registered in the shared, full-stack and web configs with the gated trailing block; `copySharedFiles` entry in `templates/shared/setup-utils.ts`.
9. CHANGELOG 3.8.0 (the slices filed A-01's entry as "Unreleased" and the others under 3.8.0; all go under 3.8.0).

**3.9.0**
- RFC-A-09: `setClassMerge(theme)` in `templates/full-stack/src/core/server/server.ts:523` (`buildServer`) and `tests/setup.swap-verbs.ts`, with the lock bump to fluent-html 8.2.0 (`pnpm-lock.yaml:26`, `:46`, `:127`, pm-gui peer `:158`) in the same commit; `src/shared/ui/layout.ts:14-16` and the sentence at `:27-29` deleted; superseded line on `project/pm/agent-fitness/fluent-html-batch/decisions.md:89`. Measured on the scaffold: unit 680/680, integration 190/190, only exact-duplicate deltas, safelist and compiled CSS byte-identical.

**9.0.0 (no code)**
- 0 edits from `codemod:prune-9` (0/339 files), `codemod:nonce-bag` (0/0) and the bare-selector codemod (0 rewrites); tsc 154 vs 154 with the nonce changes. PM ledger: mark `project/pm/fluent-html-v6/decisions.md:23` reversed and repoint `fastify-adapter/todo.md:7` to `renderWithNonce` (RFC-C-03). Re-vendor G3. The unmerged branch `agent-a716fc737cfff8069` root-imports `extractId` at `render-contract.ts:2` and needs `codemod:prune-9` if it lands after 9.0.0 (1 edit, compiles).

**templates/web**: RFC-A-02 (3.8.0); RFC-A-06 fixes `StructuredData` with no edit; C-30 re-counts its `show:window:top` sites after A-02.

**packages/ui**: deleted by RFC-C-04 (0 `package.json` dependents, 0 imports across 58 roots). RFC-A-09's and RFC-B-04's `packages/ui` notes are moot.

### 3.6 Outside lockstep

- **Fleet:** the 13 canonical 4.0.0 repos take D-02 at their next template sync, and the 2 hand-rolled `replace` bags (competify `preglednice.checklist.view.ts:29`, gzs/stem-50 `thesis.sections.view.ts:114`) when next touched. 28 vendored `swap-verbs.ts` copies (14 at signature parity) take B-01 at their next sync; gzs/stem-50 takes the whole file (scripted patch 8/9). B-03's `assetUrl` patch applies 11/14 (fl-um, na-cent, gzs/stem-50 at their next sync). competify, everyframe-composer and na-cent rebuild their committed behaviors asset on the next bump (the boot check forces it). 21 `setClosedby("any")` sites in 11 repos change by hand. A-09 opt-in is per repo with its own delta audit, the 11 dead-pair repos first; workshop-toni (7.0.0) upgrades first. 15 fleet copies of the name-only grammar contract (13 byte-identical) follow at their next template pull.
- **User-owned memory (RFC-C-04):** the implementing session asks the user to apply or approve edits to `fluent-html-is-instruction-set.md:10,16` and `fluent-html-no-context-no-framework-glue.md:14`. No agent edits user memory unprompted.
- **This run's process docs:** `ALGORITHM.md` annotations (A-03: :20, :170) and the guardrail 5 rewording (C-04: :7, :25, :135, :165, :187; `templates/rfc.md:12`, `:29`), timing per the user's call.

## 4. CI reach of each new check

| Check | Repo | Runs in CI today? |
|---|---|---|
| `grammar` job, coverage gate, acceptance matrix (A-03, A-01 rows) | fluent-html | yes once merged (`test.yml`, push/PR to main) |
| dev-check, form, security, status, type-surface pins (A-05, A-06, A-07, A-08, B-01, B-02, B-03, A-04) | fluent-html | yes |
| prune gate, codemod tests (C-02, C-03) | fluent-html | yes (9.0.0) |
| fix contract, rule suites, printed-rewrite compile step (C-01, D-01, B-03) | plugin | no workflow exists in the plugin repo (C-41, deferred); `npm test` runs locally |
| extractor message (D-01) | extractor | no workflow (C-41); suite 55/56 |
| lockstep check (A-03), swap-verb pins and tripwire (D-02), compile pins (B-01), `assetUrl` (B-03), seo-meta guard (A-06), component-layer guard (C-04), web smoke and lint (A-02), opt-in suites (A-09) | projects-template | no: CI fails at install (section 5) |
| `smoke:htmx` asymmetric row (D-02) | projects-template | outside `verify` by design; bump-time |

## 5. Blockers

1. **projects-template CI is red before any test:** 114 of 114 runs fail at install; the latest (`6f63b33`, 2026-09-24) logs `PRIVATE_REPOS_TOKEN is not set` and `[ERR_PNPM_GIT_FETCH_FAILED] Failed to fetch "@jtdigital/pm-gui"`. Human step: set the secret (`project/pm/ci-green/todo.md:9`). Until then every template-side check in section 4 runs locally only, and no scorecard credit that depends on it counts.
2. **Extractor 3.0.0 tag:** the suite is 55/56 (`extract.test.ts:113` expects `skew-x-6`, pruned in 8.0.0) and the cut belongs to C-41 (deferred). D-01's text lands on main and reaches apps through the git spec.
3. **Behaviors asset headroom:** 6140 of 6144 B min (2778 of 2816 B gz) after RFC-A-01; the next runtime change needs the L-260 size call first.
4. **9.0.0 precondition:** RFC-C-02's guess top-up (K11).
5. **htmx #4028 unreleased:** RFC-D-02's `queue last` stays until a vendored 4.0.0-family bundle carries it (the tripwire fails then and names the switch back).
6. **Working-tree state in projects-template:** 37 uncommitted files at recon time (`.template.json` `dirty:true`), uncommitted `project/pm/INDEX.md` edits (RFC-C-04 open question 6) and an uncommitted `templates/full-stack/crons.toml` edit behind 2 setup-test failures (77/77 at HEAD `6f63b33`). The implementer commits on top.
7. **User approvals:** the RFC-C-04 memory edits and the open curation calls listed in roadmap.md.

---

## Track E addendum (new APIs, curation §F)

## Track E addendum (RFC-E-01, E-02, E-04, E-07, E-08)

Repos gain no new member: Track E ships in fluent-html, eslint-plugin-fluent-html (`fluent-html-eslint-plugin`), projects-template and guidelines; the extractor changes no code.

### 1. Constraint changes

| # | Change | Source (measure) |
|---|---|---|
| K4 (rewritten) | **eslint-plugin-fluent-html 4.3.0 is lib-first: it publishes after fluent-html 8.2.0.** RFC-E-08 adds a class-vocab row (`size`), so "no curated RFC adds a class-vocab row" no longer holds. 4.3.0 carries RFC-E-07's `prefer-if-not-empty` (its fix imports `IfNotEmpty`), RFC-E-08's `prefer-size` and the `no-fluent-equivalent-in-setstyle` `.size` suggestion (both read the `size` row), and RFC-C-01's fix-contract re-sweep against 8.2.0 (admits `size-4` to `.size("4")`, withholds off-union `size-4.5`). Every new rule is inert on a fluent-html without its export or row. 4.2.0 stays the 8.1.x plugin (C-01, D-01, B-03) with its K4 reasoning unchanged. | `vocab.generated.ts` re-derived: 159 to 160 methods, 37 to 38 unit methods, `derive-fixable` 538 to 539 patterns. |
| K6 (amended) | The extractor still needs no code change for 8.2.0, but its output changes: `.size()` calls emit `size-*` (probe chain: 0 classes on 8.1.0; `size-4 size-[18px] hover:size-6 md:size-12 group-hover:size-8` on 8.2.0). | suite 55/56 on both (the pre-existing `skew-x-6` failure). |
| K7 (amended) | Guidelines wave G2 publishes after the fluent-html 8.2.0 tag **and** the plugin 4.3.0 publish: RFC-E-07's replacement line names `prefer-if-not-empty`, and RFC-E-08's lines teach `.size`. | `guidelines:pull` reaches 23 repos; a line naming an unpublished rule teaches a rule no repo has. |
| K10 (amended) | 9.0.0 consumer order: `codemod:canonical` (pre-7 only) → install 9.0.0 → `codemod:prune-9` (now with RFC-E-07's `ForEachElse` row) → `codemod:nonce-bag` → `scripts/codemod/bare-selector.ts` → `codemod:form-values-9` → `npm run guidelines:pull`. | `codemod:form-values-9` keys on the post-install TS2345 diagnostics; home-page 1/1, 0 errors left. |
| K11 (amended) | RFC-C-02's guess top-up (20 leak-free runs per condition) also decides `ForEachElse`: a top-up run that writes it first keeps it, and RFC-E-07's 9.0.0 tail drops. | 0 of 12 measured stock runs wrote it (F-E-601 3, V-RFC-E-07-agent-fitness 9). |
| K12 (new) | Within fluent-html 8.2.0, RFC-A-09 and RFC-E-08 both feed `gen:vocab`: whichever lands second re-runs it, and A-09's family self-check and ordered-pair property-cover gate pass over the `size` root. | E-08's patch applies cleanly on A-09's prototype (36/36); `class-families.gen.ts` gains `size`. |
| K13 (new) | Within fluent-html 8.2.0, `src/elements/forms.ts` is one edit pass (RFC-E-04, RFC-E-02's `noteBoundSelect`, RFC-E-01's swap of RFC-A-07's cast read for `getId()`), after RFC-E-01's `tag.ts` accessor and rebased on 8.1.1's A-07 and C-04 edits. | A-07's read is `(first.tag as unknown as { _id?: string })._id === controlId(name)`; the swap is byte-identical and A-07's 10 pins cover it. |
| K14 (new) | projects-template 3.9.0: RFC-E-01's `FormGroup` commit follows the lock bump to fluent-html 8.2.0 (K3's commit); RFC-E-07 and RFC-E-08 follow the plugin 4.3.0 lock bump; each template folds its size pairs (`codemod:size-fold`) in the commit that turns `prefer-size` on. | `getId` is TS2339 before the bump; both templates lint with `--max-warnings=0` (`templates/web/package.json:26`, `templates/full-stack/package.json:33`), so a `warn` blocks. |
| K15 (new) | Fleet order at an 8.2.0 upgrade: install fluent-html 8.2.0 and plugin 4.3.0 → `npm run codemod:size-fold -- <tsconfig>` → `eslint --fix` (`prefer-if-not-empty`, the clean-receiver `prefer-size` remainder) → apply the `arrayValue` suggestions by hand → `npm run guidelines:pull`. RFC-E-01's `FormGroup` rewrite rides the next template sync, not the lib bump. | `prefer-size --fix` covers 282 of 420 chain pairs; the codemod folds all 423 (render-identical across 1,217 element contexts), so lint under `--max-warnings=0` stays green only with the codemod first; 352 guard sites autofix, 14 `arrayValue` sites in 4 units are suggestions. |

RFC-E-02 guard 1 (a bound value that matches no option) is outside this run: it ships with C-83's lazy `NODE_ENV` default (F-D-405), deferred.

### 2. Publish order (changed rows only)

| Step | Repo and version | Contents | Gate |
|---|---|---|---|
| 6 | fluent-html 8.2.0 | B-02, B-03 lib, A-04, A-09, then E-01 (`tag.ts`, `storage-fields.ts`) → one `forms.ts` pass E-04 + E-02 + E-01's read swap (with E-02's `serialize.ts` :332, :415 and `dev-checks.ts`) → E-07 → E-08 (vocab row, `gen:vocab`, `codemod:size-fold`) | K1, K12, K13; lib CI green with the new test files added to both `package.json` test lists; official bench re-run on the merged build (E-02 production A/B -2.1%..+0.9%, E-07 and E-08 rows within noise, each measured on its own prototype). |
| **6b (new)** | eslint-plugin-fluent-html 4.3.0 | E-07 `prefer-if-not-empty`; E-08 `prefer-size`, `no-fluent-equivalent-in-setstyle` `.size` suggestion, re-derived `vocab.generated.ts`; C-01 fix-contract re-sweep against fluent-html 8.2.0 (the K4 re-sweep after step 6, folded in) | K4: after step 6 publishes. Rule suites run locally only (no plugin workflow, C-41). |
| 7 | guidelines, wave G2 | B-03, A-09 as before; E-07 (`fluent-html.md:411-415`, `CLAUDE.md:166-167`, `views.md:43`), E-08 (`fluent-html.md:65`, `CLAUDE.md:182`) | after steps 6 and 6b (K7). guidelines/** net -7 → -11. |
| **7b (new)** | fluent-html repo commit (no release) | `CLAUDE.md` hunks of E-07 (:168-169, -1) and E-08 (:184, 0) | same gates as step 7. Net -1. |
| 8 | projects-template 3.9.0 | commit order in section 3.5 below | K3, K14. |
| 9 | fluent-html 9.0.0 | B-04, C-02, C-03, plus E-04's tail (`codemod:form-values-9`) and E-07's `ForEachElse` `PRUNED_9` row; one migration section naming four codemods | K10, K11; `test/prune-gate.test.ts` green with the `ForEachElse` row. |

Plugin re-sweeps (K4) follow steps 1, 6 (folded into 6b) and 9.

### 3. Per-repo additions

#### 3.1 fluent-html

**8.2.0**
- RFC-E-01: `fluent-html/src/core/tag.ts` `getId()` after `getClass` (:146) with the folded JSDoc (`IfThen` example, `f.label` pointer); `fluent-html/scripts/codemod/storage-fields.ts` `GETTERS` (:42-45) gains `id: { getter: "getId" }` (codemod tests 15/15); `createFormBinding` group read becomes `first.tag.getId() === controlId(name)`; `fluent-html/REFERENCE.md` entry beside `getClass` naming `f.label` for in-view labels; type pins (reads compile; `const s: string = t.getId()` TS2322; `getId("x")` TS2554) and the 7 runtime rows.
- RFC-E-02: `fluent-html/src/core/dev-checks.ts` `noteBoundSelect` (dev-only `WeakMap`) and `assertSelectSubmits`, both `@internal`; `fluent-html/src/elements/forms.ts` `select` (:495-502) records the bound value under dev checks; `fluent-html/src/render/serialize.ts` :332 and :415 call the check inside the dev-only epoch branch; `fluent-html/test/dev-checks.test.ts` (26 oracle shapes, skip rows, throw rows, production rows: 8 of 34 throw, production 34/34 byte-identical).
- RFC-E-04: `fluent-html/src/elements/forms.ts` `SelectOption<V extends string = string>` (:436), internal `Submitted`/`FieldValue`/`Checked`, the array-only `select` signature and its JSDoc (:446); compile-contract pins in the `test/brand-errors.test.ts` / `test/setter-errors.test.ts` pattern; `test/types/type-surface.test-d.ts` array rows.
- RFC-E-07: `fluent-html/src/control/conditionals.ts` (the pair, internal `NonEmpty` and `ListOrAbsent`, no JSDoc on the three); exports in `src/control/index.ts` and `src/index.ts`; `test/if-not-empty.test.ts` (6) added to `package.json:65-66`; the type probe (sanctioned lines, 4 named-fix lines, internal-type rows, the generic-`L` pin); `README.md` section 6 line; `REFERENCE.md` entry.
- RFC-E-08: `fluent-html/src/class-vocab/vocab.ts` `size` row after `h` (:156); `TailwindSize` in `scripts/gen-vocab/tailwind-types.template.txt` (after :41), regenerated `src/core/tailwind-types.gen.ts`, exported from `fluent-html/core`; `size` overloads with the reworded brands in `src/core/tailwind-methods.ts` (:242-245, impl :690-697); generated `VariantStyleObject.size`; `test/vocab-coverage.test.ts:50` and `project/pm/llm-styling/vocab-generator/backlog.md:12` entries deleted; type probe lines (`.size("screen")`, `.size("4.5")`, `.size(4)`); `REFERENCE.md:1075-1081` line; `scripts/codemod/size-fold.ts` with `codemod:size-fold` and its test (added to both test lists); `gen:vocab` re-run (K12).
- CHANGELOG 8.2.0 entries for the five (Added: E-01, E-02, E-07, E-08; Changed: E-04).

**9.0.0**
- RFC-E-04 tail: `radio`/`hidden`/`checkbox` signatures with `CheckboxValue` (`forms.ts:451-454`, under A-07's rewritten checkbox JSDoc); `scripts/codemod/form-values-9.ts`, `codemod:form-values-9` and its test; CHANGELOG 9.0.0 migration line.
- RFC-E-07 tail: `ForEachElse` removed (`src/control/iteration.ts:102`, `src/control/index.ts:14`, `src/index.ts:339`; one pass with C-02's `Repeat` at :168-183, :16, :341); a `PRUNED_9` row in `scripts/codemod/prune-9.ts` and `test/prune-gate.test.ts`; `REFERENCE.md:238` becomes an `IfNotEmptyElse` line; CHANGELOG 9.0.0 Removed entry.

#### 3.2b eslint-plugin-fluent-html 4.3.0 (new)

- RFC-E-07: `fluent-html-eslint-plugin/src/rules/prefer-if-not-empty.ts` (type-aware; guard, `ForEachElse` and dead-`?? []` autofixes; `arrayValue` suggestion; name-clash message; no-op without type information or on a lib without `IfNotEmpty`); rule tests (the RFC fixture: 5 guard reports with fixes, 1 `arrayValue` suggestion, 0 on the string receiver, on `=== 0` alone and without type information; plus a `ForEachElse` case, the dead-fallback case, the generic-`L` case with 0 reports and the name-clash message); `recommended` entry; README rules-table row.
- RFC-E-08: `prefer-size` (recommended `warn`; autofix only on a chain rooted at a fluent-html element factory with no earlier sizing, `apply`, `when*` or class call; suggestion naming the Tailwind-order hazard elsewhere; inert without the `size` row) with rule tests; README row beside `prefer-foreach` (`README.md:140`); `src/rules/no-fluent-equivalent-in-setstyle.ts:17-18` gives one `.size(unit, n)` suggestion for equal width and height; `vocab.generated.ts` re-derived by `scripts/gen-vocab.mjs`.
- RFC-C-01: fix contract re-swept against fluent-html 8.2.0 (devDependency moves to the 8.2.0 commit).
- CHANGELOG 4.3.0 (Added `prefer-if-not-empty`, `prefer-size`; Changed `no-fluent-equivalent-in-setstyle`). The 4.2.0 README commit (C-01 + D-01 at :124-128, :164-170) lands first; the 4.3.0 rows apply by text.

#### 3.3 fluent-html-tailwind-extractor

No change (K6 amended).

#### 3.4 guidelines

| Wave | File: lines (RFC) | Net |
|---|---|---|
| G2 (additions) | `fluent-html.md`: :65 (E-08, 0), :411-415 (E-07, -3). `CLAUDE.md`: :166-167 (E-07, -1), :182 (E-08, 0). `views.md`: :43 (E-07, 0). | -7 → -11 |

guidelines/** total -15 → -19 (G1 -7, G2 -11, G3 -1); `fluent-html/CLAUDE.md` -3 → -4 (step 7b); `fluent-html/README.md` -2 (C-01). **Run net: -25 lines** (was -20). Line numbers are 8.1.0's: D-01's G1 deletions move E-07's guidelines lines up one (`fluent-html.md:349`, `CLAUDE.md:72`) and its `fluent-html/CLAUDE.md` lines up two (:72, :157), so every hunk applies by quoted text. Vendored copies (`projects-template/CLAUDE.md:166-167`, `fluent-html/.ai/web-development/{CLAUDE,fluent-html,views}.md`, app root `CLAUDE.md` files) follow through `guidelines:pull`. `guidelines/CLAUDE.md:168-169` (guidelines repo root) carries E-07's two lines; no curated entry edits it.

#### 3.5 projects-template

**3.9.0, commit order** (replaces the single A-09 bullet)
1. RFC-A-09: `setClassMerge(theme)` in `templates/full-stack/src/core/server/server.ts:523` and `tests/setup.swap-verbs.ts`, with the lock bump to fluent-html 8.2.0 (`pnpm-lock.yaml:26`, `:46`, `:127`, peer `:158`) in the same commit (K3); `src/shared/ui/layout.ts:14-16` and `:27-29` deleted; superseded line on `project/pm/agent-fitness/fluent-html-batch/decisions.md:89`.
2. RFC-E-01: `templates/full-stack/src/shared/ui/form.ts` `FormGroup` (no `name`; `htmlFor ?? input.getId()`; `hint` linked by `linkHint`, ahead of the error id; `error?: View`; nest fallback), disjoint from C-04's `selectStyle`; `tests/view/components.test.ts` (5 bare-`Input()` calls `name` to `htmlFor`, 1 drops `name`, a nest pin and a hint-before-error pin). Measured: 33/33, tsc 0 in the touched files (154 pre-existing elsewhere), eslint 0; `Form<T>` pages byte-identical (2,149 B).
3. eslint-plugin-fluent-html 4.3.0 lock bump (`pnpm install --lockfile-only`); re-vendor the G2 guidelines (`CLAUDE.md`, `.ai/web-development/{CLAUDE,fluent-html,htmx,views}.md`).
4. RFC-E-07: `fluent-html/prefer-if-not-empty: "error"` in `templates/full-stack/eslint.config.mjs` (outside A-02's gated block); the autofix over the 9 template sites (1 restated guard at `account.page.view.ts:221`, 7 coerce-binds such as `analytics/views/dashboard.view.ts:320`, the two-step guard at `src/app/auth/sign-in/login.view.ts:53`, which drops its dead `?? []`). 9/9 compile, 8/9 executed byte-identical.
5. RFC-E-08: `codemod:size-fold` over `templates/web` (17 sites, the `AVATAR_BOX` map at `src/shared/components.ts:64-70` included; run on the post-A-02 tree) and `templates/full-stack` (7), with `prefer-size` on through the recommended config; both templates pass `eslint . --max-warnings=0`.
6. CHANGELOG 3.9.0: A-09, E-01, E-07, E-08 entries.

**9.0.0 (no code)**: RFC-E-04's tail has 0 hits in the template (its literal payments selects compile, 154 = 154); RFC-E-07's `ForEachElse` row has 0 template sites.

RFC-E-02 and RFC-E-04 (8.2.0 half) need no template change: the template's 4 `f.select` sites (payments) flag 0, and tsc stays at 154 = 154.

#### 3.6 Outside lockstep (fleet)

- **RFC-E-01 (at each repo's next template sync):** 26 reader-shaped `FormGroup` definitions rewritten to `htmlFor ?? input.getId()` (23 `(input as { name?: unknown }).name` casts, 12 canonical; `everyframe-composer/src/shared/ui/form.ts:24-38` private `_id` cast and its JSDoc; the template's and gzs/stem-50's restated `name`); gzs/stem-50's 47 call sites (46 `name` drops, 1 `name` to `htmlFor`); everyframe-composer's name-fallback test. Out of scope: 19 of 45 fleet definitions that do no association (`website-sales-funnel-automation-system/src/shared/ui/ui.components.ts:47`, 10 call sites, and 18 pre-7). A missed `name:` fails as TS2353.
- **RFC-E-02 (gzs/stem-50 at its upgrade):** a placeholder or a bound default at `gzs/stem-50/src/app/admin/faculties/views/faculties.form.view.ts:78` and `gzs/stem-50/src/app/thesis/views/thesis.new.view.ts:47` (566/566, tsc 0 after both); its rule-restating comments (`gzs/stem-50/src/app/preregistration/views/preregistration.form.view.ts:23-25`, `gzs/stem-50/tests/integration/preregistration.test.ts:132-134`) and the comment plus re-deriving test at `gzs/stem-50/tests/view/preregistration.view.test.ts:43-53` become a plain render. Every upgrading repo runs the static search: `f.select(...)` or `Select(...)` with `.toggle("required")`, binding nothing, first option value not `""` (7 raw sites in 4 pre-7 repos unclassified). A green view suite does not clear it (2/2 upgrade agents stopped at green).
- **RFC-E-04:** optional `as const` or `SelectOption<Field>[]` on the 14 open closed-field lists (measured on `website-sales-funnel-automation-system` `contacts.view.ts:502`: 2 tokens, then a stale value is rejected). 9.0.0: home-page's generic helper takes `codemod:form-values-9` or the concrete `FormBinding<VisibilityReq>` type.
- **RFC-E-07:** each app runs `eslint --fix` at its 8.2.0 upgrade (352 sites in 238 files over 16 units, the 9 `login.view.ts` copies included); the 14 `arrayValue` suggestions in 4 units are applied by hand.
- **RFC-E-08:** each app runs `codemod:size-fold` (423 sites in 239 files; 86 at vendored template paths follow on re-vendor), then lints with `prefer-size`; 2 stale JSDoc comments in workshop-toni describe the old pair.

### 4. CI reach of each new check

| Check | Repo | Runs in CI today? |
|---|---|---|
| `getId` pins and runtime rows (E-01), select dev-check rows (E-02), compile-contract and type-surface pins (E-04), `if-not-empty` runtime and type tests (E-07), `size` vocab rows, type probe and `size-fold` codemod test (E-08) | fluent-html | yes once merged, provided each new test file is added to `test` and `test:coverage` in `package.json:65-66` |
| `ForEachElse` prune-gate row, `form-values-9` codemod test | fluent-html | yes (9.0.0) |
| `prefer-if-not-empty`, `prefer-size`, setStyle `.size` suggestion, re-swept fix contract | plugin | no workflow in the plugin repo (C-41, deferred); `npm test` runs locally |
| `size-*` output | extractor | no workflow (C-41); suite 55/56 |
| `FormGroup` nest and hint-before-error pins (E-01), `prefer-if-not-empty` at error (E-07), `prefer-size` under `--max-warnings=0` and the folded sites (E-08) | projects-template | no: CI fails at install (blocker 1) |

### 5. Blockers (additions)

8. **Plugin 4.3.0 has no CI:** both new rule suites, the `ForEachElse` report text and the `prefer-size` suggestion text (both unexecuted, set at implementation) are checked locally only until C-41.
9. **RFC-E-02 guard 1** waits for C-83 (deferred); until then B1 and B8 (a bound unlisted value) render, and website-sales-funnel-automation-system's view test keeps its selected-option parse.
10. **RFC-E-07's 9.0.0 tail** rides K11: the top-up decides whether `ForEachElse` leaves; time-to-live's site is reported, not run (no `node_modules`).
11. **Re-measures at implementation:** RFC-E-01's folded `getId` JSDoc (the 6-line text was +135 tokens in `tag.d.ts`); RFC-E-04's `forms.d.ts` (12,197 B vs 11,028 B on 8.1.0) and an array-only authoring run (the 7 measured runs used the cut record arm); RFC-E-08's brand diagnostics against the 141-token cap.
12. **Template-side checks** for E-01, E-07 and E-08 run locally only while template CI fails at install (blocker 1).
