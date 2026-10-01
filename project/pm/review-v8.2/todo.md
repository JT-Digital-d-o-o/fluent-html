# v8.2.0 Review Rollout: Tasks

Contracts: [v8-spec.md](../../research/v8.2.0/40-synthesis/v8-spec.md), cited as `§ <item> › <heading>`. Order and gates: [lockstep.md](../../research/v8.2.0/40-synthesis/lockstep.md) section 2 and its Track E addendum (K1 to K15). Changelog wording: [changelog-draft.md](../../research/v8.2.0/40-synthesis/changelog-draft.md). Guideline and `CLAUDE.md` hunks: [guidelines-update.md](../../research/v8.2.0/40-synthesis/guidelines-update.md), applied by quoted text. Codemods: [codemods.md](../../research/v8.2.0/40-synthesis/codemods.md). Staged CHANGELOG entries and README patches sit under `fluent-html/project/research/v8.2.0/60-rollout/staged/<repo>/<release>/` and are applied only by the story that ships that release: a `CHANGELOG.entry.md` is pasted directly above the newest `## [` version header of that repo's `CHANGELOG.md` (in projects-template, directly under `## [Unreleased]` and its blank line), and a `.patch` (every README, and the extractor's CHANGELOG, which rewords an existing line) gets `git apply --check` first. `npm run focus` does not read `depends_on`: a task title that starts with `After <release>:` waits on that release, and one priority per story keeps focus in file order, which is lockstep order. Paths below are relative to the org root; line numbers are each repo's HEAD at rollout prep. Plugin 4.2.0 and 4.3.0 live in `fluent-html-eslint-plugin/project/pm/`, projects-template 3.8.0, 3.9.0 and its 9.0.0 pass in `projects-template/project/pm/`.

### As an app author I want fluent-html 8.1.1 to close 8.1.0's silent failures with no public shape change so that the upgrade is a lockfile bump plus a behaviors asset rebuild (lockstep step 1)

- [ ] [P1] Confirm where the acceptance harness gets the behaviors asset version before ordering on K8
  - Spec: lockstep K8; § RFC-A-03 › 2. CI and scripts
  - Note: at HEAD `fluent-html/test/acceptance/app.mjs:26-31` builds the asset with `buildBehaviorRuntime` and reads `built.fileName`, and `git grep` finds no hard-coded asset version outside the git-ignored `fluent-html/test/acceptance/.assets/`, against K8's "hard-codes `fluent-behaviors.8.1.0.js`". If that holds, record it in the RFC-A-03 commit message and drop the harness edit; otherwise make the edit in the RFC-A-03 commit, before RFC-A-01's version bump.
- [ ] [P1] Land the executed htmx grammar oracle in lib CI (RFC-A-03, commit 1)
  - Spec: § RFC-A-03 › 1. `test/grammar/` (devDependency-only, never published); 2. CI and scripts; 3. Records corrected (text only)
  - Files: `fluent-html/test/grammar/{bundles,surface,rows,harness}.mjs`, `grammar.spec.mjs`, `coverage.test.mjs`, `playwright.config.mjs` (new); `fluent-html/package.json` (`test:grammar` script, devDependency `htmx-served` = `npm:htmx.org@4.0.0`); `fluent-html/.github/workflows/test.yml` (new `grammar` job on Node 22: coverage gate, grammar matrix, the behaviors acceptance matrix); `fluent-html/test/acceptance/app.mjs:26-31` (only if the check above finds a hard-coded version); record text at `fluent-html/test/htmx.test.ts:155`, `fluent-html/test/types/type-surface.test-d.ts:440`, `:442`, `:444`, `fluent-html/test/patterns.ts:165`, `:198`; `fluent-html/src/patterns.ts:117-121` JSDoc drops `extensions: "sse, preload",`
  - Gate: lib CI green with the `grammar` job (342/342 runs on 8.1.0, 0 flaky in 1,026 under CPU contention)
  - Docs: the errata for `fluent-html/CHANGELOG.md:97-99` and `:166-169` ride the 8.1.1 entry in `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/8.1.1/CHANGELOG.entry.md` (`✨ Added` and `📝 Errata` sections)
  - Note: depends_on nothing; the first 8.1.1 commit
- [ ] [P1] Sanitize every URL fluent hands to htmx and keep js: out of confirm and vals (RFC-A-05, commit 2 with RFC-A-08)
  - Spec: § RFC-A-05 › 1. One scheme scan, two policies (`src/render/escape.ts`); 2. Sinks; 3. Dev throw (`Tag._setHx`, `src/core/tag.ts:638`); 5. Tests and docs
  - Files: `fluent-html/src/render/escape.ts` (`sanitizeUrlFor`, `sanitizeHtmxUrl`, `htmxScriptPrefix`); `fluent-html/src/render/serialize.ts` (endpoint, push/replace, the status URL step, `htmxText`); `fluent-html/src/patterns.ts` (the four `HxResponse` URL setters, `PLAIN_LOCATION_PATH`); `fluent-html/src/core/dev-checks.ts` (`assertNoHtmxScript`, `@internal`; wired into `_setHx` by the RFC-B-01 task); `fluent-html/test/htmx-js-sinks.test.ts` (new, added to both lists in `fluent-html/package.json:65-66`); `fluent-html/test/dev-checks.test.ts`; security rows D1-D5, D2, D7, H2, E1, C1, R1, L4 in `fluent-html/test/grammar/rows.mjs`
  - Gate: 0 of the 132 covered browser cells run script (87 of 138 on 8.1.0); 0 changed bytes in 92,038 instrumented serializations across 14 live repos
  - Docs: `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/8.1.1/README.patch` (the two `fluent-html/REFERENCE.md` XSS hunks at `:1342-1345` and `:1384-1386`); `.../8.1.1/CHANGELOG.entry.md`, the `🔒 Security` section (sinks, location, `sanitizeUrl`, confirm and vals)
  - Note: depends_on RFC-A-03 @ fluent-html 8.1.1
- [ ] [P1] Serialize each hx-status value as one HCON token through the shared buildStatusConfig (RFC-A-08, commit 2 with RFC-A-05)
  - Spec: § RFC-A-08 › The one hx-status serializer (reconciled with RFC-A-05); Tests; Cross-RFC conflicts › Library source and tests (`buildStatusConfig`)
  - Files: `fluent-html/src/render/serialize.ts` (`buildStatusConfig`, one contract with RFC-A-05); unit pins in `fluent-html/test/htmx.test.ts` and `fluent-html/test/security.test.ts`; status rows plus the pre-quoted rows in `fluent-html/test/grammar/rows.mjs`, with the `F.status` known mark deleted
  - Gate: status rows 60/60 on 4 bundles (28/60 on 8.1.0); the security pin expects RFC-A-05's percent-encoded `replace` URL (K9)
  - Docs: `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/8.1.1/CHANGELOG.entry.md` Fixed entry; no README hunk (no doc line teaches hx-status quoting)
  - Note: depends_on RFC-A-03, RFC-A-05 @ fluent-html 8.1.1 (K9: one contract with A-05, or A-05 first)
- [ ] [P1] Write every `<` in JSON-typed script bodies as a JSON unicode escape (RFC-A-06, commit 3)
  - Spec: § RFC-A-06 › Emitted bytes; Tests (`test/security.test.ts`, next to the A-006 block at `:154`); Docs
  - Files: `fluent-html/src/render/serialize.ts` (`json` context, `scriptCtx`, widened `JSON_SCRIPT_TYPE_RE`; traversal at `:329`, `:344`, `:409`, `:430`); the pins in `fluent-html/test/security.test.ts` beside the A-006 block at `:154`
  - Gate: page intact 32/32 per engine (12/32 on 8.1.0); parse identity 18,752/18,752
  - Docs: `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/8.1.1/README.patch` (`fluent-html/REFERENCE.md:1402`) and the Security entry in `.../8.1.1/CHANGELOG.entry.md`; both spell the escape as the six characters the serializer writes (§ Emitted bytes), where § Docs and changelog-draft.md print a bare `<`
  - Note: depends_on RFC-A-05 @ fluent-html 8.1.1 (after A-05 and A-08 in `serialize.ts`)
- [ ] [P1] Throw in dev on a request-less HTMX bag, in one _setHx block with RFC-A-05's script check (RFC-B-01 lib half, commit 4)
  - Spec: § RFC-B-01 › 3. Lib: `src/core/dev-checks.ts` + `src/core/tag.ts` (8.1.1, dev-only); 4. Lib tests: `test/dev-checks.test.ts`; 5. Emitted bytes; Cross-RFC conflicts › Library source and tests (`Tag._setHx`)
  - Files: `fluent-html/src/core/dev-checks.ts` (`assertRequestBag`, `@internal`); `fluent-html/src/core/tag.ts:638` (`if (devChecks) { assertMutable; if (htmx) { assertRequestBag; assertNoHtmxScript } }`); `fluent-html/test/dev-checks.test.ts` (the throwing and the passing shapes)
  - Gate: production bytes unchanged (the RFC lib run measured 2165/2165)
  - Docs: `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/8.1.1/CHANGELOG.entry.md` `✨ Added` entry; no README hunk (no exported symbol changes)
  - Note: depends_on RFC-A-05 @ fluent-html 8.1.1. K1: RFC-B-03's lib half in 8.2.0 ships only with this throw released
- [ ] [P1] Bind valued checkboxes by membership and throw in dev on Form() argument mixes that drop arguments (RFC-A-07, commit 5 with RFC-C-04)
  - Spec: § RFC-A-07 › 1. `FormBinding.checkbox(name, value?)`; 2. `Form(...args)` dev throw; 3. Docs, edited in place; 4. Tests (`test/form-for.test.ts`)
  - Files: `fluent-html/src/elements/forms.ts:504-509` (membership binding, group ids through `setId`), `:447-450` and `:455-458` (JSDoc), `:536-545` (`assertFormArgs` call); `fluent-html/src/core/dev-checks.ts` (`assertFormArgs`, `@internal`); the pins in `fluent-html/test/form-for.test.ts`
  - Gate: 12/12 bound round trips fixed on Chromium, Firefox and WebKit; production output of the dropping mixes byte-identical
  - Docs: `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/8.1.1/README.patch` (`fluent-html/README.md:167-170` becomes the one-builder example); the Fixed entry in `.../8.1.1/CHANGELOG.entry.md` names the single-box change
  - Note: depends_on nothing. Its guideline line publishes only after the 8.1.1 tag (K7, the G1 story). RFC-E-01 swaps the cast read this adds for `getId()` in 8.2.0 (K13)
- [ ] [P1] Drop the @jtdigital/ui pointer from forms.ts and the lib's PM records (RFC-C-04, commit 5 with RFC-A-07)
  - Spec: § RFC-C-04 › B. fluent-html (8.1.1)
  - Files: `fluent-html/src/elements/forms.ts:524-525` (comment); `fluent-html/project/pm/decisions.md` (a superseded-in-part line under the instruction-set decision at `:31` and a new decision at the bottom, "Components live in the app's `src/shared/ui`; `@jtdigital/ui` retired"); `fluent-html/project/pm/INDEX.md:22` (the P6 row; `:21` before this scope's row was added); `fluent-html/project/pm/prd.md:30`, `:49`; `fluent-html/project/pm/core-primitives/prd.md:5`, `:23`, `:31`
  - Gate: dist diff `forms.js:396-397` only; render byte-identical (235 B)
  - Docs: `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/8.1.1/CHANGELOG.entry.md` Changed entry; no README hunk (a source comment)
  - Note: depends_on nothing. The user-memory edits it implies are a decision (last story)
- [ ] [P1] Fix the behaviors runtime's dismiss, Tab-trap and swap-detail reads and bump the version to 8.1.1 (RFC-A-01, commit 6)
  - Spec: § RFC-A-01 › Final runtime code (the RFC patch with every required change folded); Acceptance rows; Release (all four lenses keep it)
  - Files: `fluent-html/src/behaviors/client/runtime.ts`; acceptance rows 31-35 under `fluent-html/test/acceptance/` (`app.mjs` fixtures for rows 34-35; the page Style gains `.invisible{visibility:hidden}`); bundle-check rows for `ctx.target`, `ctx.push`, `ctx.hx.pushurl` in `fluent-html/test/grammar/rows.mjs`; `fluent-html/package.json` version 8.1.1
  - Gate: the asset passes the CI size gate (measured 6140 of 6144 B min, 2778 of 2816 B gz); acceptance matrix 221/222 on beta6 and 4.0.0 (the one failure is the pre-existing Firefox row 28)
  - Docs: `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/8.1.1/CHANGELOG.entry.md` Fixed entry; no README hunk (no API change, emitted HTML unchanged)
  - Note: depends_on RFC-A-03 @ fluent-html 8.1.1. Lands after the other 8.1.1 code commits: the shipped and patched assets share the stamp `8.1.0:c1f56451`, so the bump is what forces consumers to rebuild. If the built asset misses the size gate, the L-260 call (last story) blocks this task
- [ ] [P1] Teach the closedby pairing for Safari 27 in the lib docs (C-67, commit 7)
  - Spec: § C-67 › The taught composition; Lib docs (lockstep; no guideline lines)
  - Files: `fluent-html/src/elements/interactive.ts:32-34` (`setClosedby` JSDoc); `fluent-html/src/elements/html-types.ts:199-200` (`ClosedBy` JSDoc)
  - Gate: the taught pairing closes the dialog on 3/3 engines; no runtime shim (guardrail §5.10 kept)
  - Docs: `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/8.1.1/README.patch` (the `fluent-html/REFERENCE.md:952` Dialogs line); `.../8.1.1/CHANGELOG.entry.md` `📖 Changed` entry
  - Note: depends_on RFC-A-01 @ fluent-html 8.1.1 (on 8.1.0 the panel's `onClickOutside` clicks the close button on every page click). The 21 fleet `setClosedby("any")` sites in 11 repos change by hand outside lockstep
- [ ] [P1] Apply the staged 8.1.1 CHANGELOG entry and README patch
  - Files: `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/8.1.1/CHANGELOG.entry.md` (pasted directly above the newest `## [` version header of `fluent-html/CHANGELOG.md`), `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/8.1.1/README.patch` (README.md and REFERENCE.md hunks)
  - Note: depends_on every code task above; `git apply --check` the README patch against the 8.1.1 tree, then apply it
- [ ] [P1] Re-run the official bench on the final 8.1.1 build, then tag 8.1.1
  - Spec: § Release bundling › fluent-html 8.1.1 (`node dist/bench/render.js`, RFC-A-05's implementation gate)
  - Note: depends_on the two closing tasks below; tag only after both are done and lib CI is green with the `grammar` job
- [ ] [P1] Write tests
  - Note: each commit carries its own pins; this closes the story on the merged build: both test lists in `fluent-html/package.json:65-66`, `npm run test:grammar` and the acceptance matrix
- [ ] [P1] Check for bugs
  - Note: re-run the security, status and dev-check pins together on the merged `serialize.ts` and `tag.ts` (§ Cross-RFC conflicts › Library source and tests)

### As an app author I want the extractor's unresolved-call error to name a fix that clears it so that no one reaches for staticManifest (lockstep step 3, fluent-html-tailwind-extractor main)

The extractor has no `project/pm/`; its tasks live in this scope. The plugin half of RFC-D-01 ships in plugin 4.2.0 (`fluent-html-eslint-plugin/project/pm/`).

- [ ] [P1] Rewrite formatUnresolved and the staticManifest JSDoc to the RFC-D-01 text (RFC-D-01 extractor half)
  - Spec: § RFC-D-01 › 3. Extractor (`fluent-html-tailwind-extractor`, rides the unreleased 3.0.0)
  - Files: `fluent-html-tailwind-extractor/src/safelist.ts:58-59` (`formatUnresolved`), `:8-9`, `:29-32` (JSDoc); `fluent-html-tailwind-extractor/src/extract.ts:209`, `:254` (JSDoc); `fluent-html-tailwind-extractor/src/*.test.ts` assert the new text; rebuild and commit `fluent-html-tailwind-extractor/dist/` (`src/dist-parity.test.ts` fails on a stale build)
  - Gate: detection and the `staticManifest` option unchanged; the suite fails only `src/extract.test.ts:113` (`skew-x-6`), as on `main` (55/56)
  - Note: depends_on nothing (independent of steps 1 and 2). Keep `scanFluent` exported (`src/index.ts:20`, `src/extract.ts:356`): RFC-C-04's template guard imports it at the commit the template resolves
- [ ] [P1] Apply the staged extractor CHANGELOG and README patches
  - Files: `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html-tailwind-extractor/main/CHANGELOG.patch` (the new entry under the Unreleased 3.0.0 header at `fluent-html-tailwind-extractor/CHANGELOG.md:6`; `:10` reworded in place), `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html-tailwind-extractor/main/README.patch` (`fluent-html-tailwind-extractor/README.md:66`, `:82`)
  - Note: depends_on the task above. The 3.0.0 tag stays blocked (lockstep blocker 2); apps get the text through the git spec on `main`
- [ ] [P1] Push `fluent-html-tailwind-extractor` main with the D-01 text and rebuilt dist (the release G1 and the 4b commit wait on; the 3.0.0 tag stays blocked)
  - Note: depends_on the two closing tasks below; pushing `main` is the extractor's release step (lockstep step 3)
- [ ] [P1] Write tests
  - Note: `npm test` in the extractor, with the dist-parity test run after `npm run build`
- [ ] [P1] Check for bugs
  - Note: render the printed message for a ternary, a `MatchValue` call and a variant-object value, and confirm each named fix compiles (§ RFC-D-01 › 3)

### As an agent reading the guidelines I want wave G1 to teach only what 8.1.1, plugin 4.2.0, the extractor text and template 3.8.0 ship so that no line runs ahead of its code (lockstep step 4, guidelines G1)

Hunks: guidelines-update.md. The guidelines checkout holds untracked project-management files that belong to other work: commit only this wave's paths.

- [ ] [P1] After fluent-html 8.1.1: Apply the G1 hunks gated on fluent-html 8.1.1 (RFC-A-03, RFC-A-05, C-67)
  - Files: `guidelines/web-development/htmx.md:276-278`, `:282`, `:412`, `:499` (A-03); `guidelines/web-development/fluent-html.md:511` (A-05); `guidelines/web-development/htmx.md:591`, `:593-594` and `guidelines/web-development/CLAUDE.md:337` (C-67)
  - Spec: guidelines-update.md § RFC-A-03 items 1-4, § RFC-A-05, § C-67 sections 1-3; v8-spec § Cross-RFC conflicts › Guideline lines
  - Note: depends_on release: fluent-html 8.1.1
- [ ] [P1] After fluent-html 8.1.1: Apply RFC-A-07's checkbox line only after the 8.1.1 tag
  - Files: `guidelines/web-development/fluent-html.md:132` (the line carries the 8.1.1+ floor)
  - Spec: guidelines-update.md § RFC-A-07 Hunk 1 of 1
  - Note: depends_on release: fluent-html 8.1.1 tagged (K7: the taught shape is 0/16 correct on 8.1.0, 16/16 on the patch)
- [ ] [P1] After plugin 4.2.0 and extractor main: Apply the G1 hunks gated on plugin 4.2.0 and extractor main (RFC-C-01, RFC-D-01)
  - Files: `guidelines/web-development/fluent-html.md:233` (C-01); `guidelines/web-development/CLAUDE.md:72`, `:155`, `:191`, `:229` and `guidelines/web-development/fluent-html.md:349` (D-01)
  - Spec: guidelines-update.md § RFC-C-01 section 1, § RFC-D-01 sections 1, 3, 5, 6, 7 (the guidelines half of 5-7)
  - Note: depends_on release: plugin 4.2.0, release: extractor main (K5: the deleted lines are the `staticManifest` remedy the new messages replace)
- [ ] [P1] After template 3.8.0 commits 1, 3 and 6: Apply the G1 hunks gated on template 3.8.0 (RFC-B-01, RFC-D-02, RFC-C-04)
  - Files: `guidelines/web-development/CLAUDE.md:265` (B-01 substring), `:273` (D-02 substring), `:231` (C-04 phrase); `guidelines/web-development/htmx.md:346`, `:389`, `:391` (D-02)
  - Spec: guidelines-update.md § RFC-B-01 Hunk 1 of 1, § RFC-D-02 items 1-4, § RFC-C-04 section 1
  - Note: depends_on RFC-C-04 @ template 3.8.0 (commit 1), RFC-D-02 @ template 3.8.0 (commit 3), RFC-B-01 @ template 3.8.0 (commit 6), each committed on template main before the 3.8.0 cut (K7). Template 3.8.0's commit 5 re-vendors the G1 hunks above this one; its commit 8b runs `npm run guidelines:pull` again after this task, so 3.8.0 vendors the whole wave
- [ ] [P1] After template 3.8.0 commit 6: Write tests
  - Note: run `projects-template/tests/guidelines-enforcement.test.ts` on the re-vendored copy; each CURRENT block is gone and each replacement appears once; guidelines/** net -7 for G1
- [ ] [P1] After template 3.8.0 commit 6: Check for bugs
  - Note: hunks of different RFCs share `CLAUDE.md:265` and `htmx.md`; re-read every edited line against the release it describes

### As an agent working in fluent-html I want its diverged CLAUDE.md and README to match G1 so that the lib repo teaches what 8.1.1 and plugin 4.2.0 ship (lockstep step 4b, repo commit, no release)

- [ ] [P1] After fluent-html 8.1.1: Apply RFC-A-03's CLAUDE.md records fix
  - Files: `fluent-html/CLAUDE.md:272` (the enctype parenthetical becomes the measured fallback), `:276` (bullet deleted); net -1
  - Spec: § RFC-A-03 › 3. Records corrected (text only); guidelines-update.md § RFC-A-03 items 5-6
  - Note: depends_on RFC-A-03 @ fluent-html 8.1.1 (the gate of its G1 twin)
- [ ] [P1] After plugin 4.2.0 and extractor main: Apply RFC-D-01's CLAUDE.md hunks
  - Files: `fluent-html/CLAUDE.md:72` and `:157` (deleted), `:156`, `:193`, `:233` (in place); net -2
  - Spec: § RFC-D-01 › 5. Prose; guidelines-update.md § RFC-D-01 sections 2, 4, 5, 6, 7
  - Note: depends_on RFC-D-01 @ plugin 4.2.0, RFC-D-01 @ extractor main (K5). The two deletions move RFC-E-07's `:168-169` and RFC-E-08's `:184` up two lines; step 7b applies them by quoted text
- [ ] [P1] After template 3.8.0 commits 1, 3 and 6: Apply the CLAUDE.md hunks gated on template 3.8.0 (RFC-D-02, RFC-B-01, RFC-C-04)
  - Files: `fluent-html/CLAUDE.md:274` (D-02 substring), `:265` (B-01), `:235` (C-04 phrase); net 0
  - Spec: guidelines-update.md § RFC-D-02 item 5, § RFC-B-01 Hunk 1 of 1 (both copies), § RFC-C-04 section 2; § RFC-C-04 › C. Guidelines. RFC-B-03 takes no hunk in this copy (no escapes clause)
  - Note: depends_on RFC-D-02 @ template 3.8.0, RFC-B-01 @ template 3.8.0, RFC-C-04 @ template 3.8.0 (K7)
- [ ] [P1] After fluent-html 8.1.1: Apply C-67's CLAUDE.md line
  - Files: `fluent-html/CLAUDE.md:314`; net 0
  - Spec: § C-67 › The taught composition; guidelines-update.md § C-67 section 4 (diverged copy)
  - Note: depends_on C-67 @ fluent-html 8.1.1
- [ ] [P1] After plugin 4.2.0: Apply the staged README hunk that stops sending the 8.0.0 prune to .cssProp()/.variant() wholesale (RFC-C-01)
  - Files: `fluent-html/README.md:268-271` (net -2) from `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/4b/README.patch`
  - Spec: § RFC-C-01 › Prose; guidelines-update.md § RFC-C-01 section 2
  - Note: depends_on RFC-C-01 @ plugin 4.2.0. Lockstep section 2 names no step for this hunk: it takes the 4b commit because its gate matches G1's C-01 line, and the npm tarball carries it from 8.2.0. No `fluent-html/CLAUDE.md` hunk (`8.0.0 pruned`: 0 hits)
- [ ] [P1] After template 3.8.0 commit 6: Write tests
  - Note: each CURRENT block is gone and each replacement appears once; `fluent-html/CLAUDE.md` net -3 and `fluent-html/README.md` net -2 for this step
- [ ] [P1] After template 3.8.0 commit 6: Check for bugs
  - Note: the copy is diverged from the guidelines; diff each edited line against its G1 twin's final text

### As an app author I want fluent-html 8.2.0's additive types, opt-in class merge and new APIs so that htmx, form and styling mistakes surface at compile or dev time (lockstep step 6)

- [ ] [P1] After fluent-html 8.1.1: Type the htmx 4 swap modifiers both bundles read and drop the dead trigger and target literals (RFC-B-02)
  - Spec: § RFC-B-02 › `src/htmx.ts`; Rules (rows green on beta6 and 4.0.0); Tests
  - Files: `fluent-html/src/htmx.ts` (`SwapModifier` arms, `SwapReadStyle`, `SwapFocusScrollFlag`, `SwapScrollTarget`, `SwapShowTarget`, `WindowTrigger`; `ExtendedCSSSelector` minus `window`/`document`; `DOMEvent` minus `resize`; `HxTrigger` minus `sse:message`/`ws:message`; the `HxSwap` JSDoc including the `:128` clause); `fluent-html/test/types/type-surface.test-d.ts` (new pins, two more `@ts-expect-error`); `fluent-html/test/grammar/rows-c09.mjs` (new rows and controls; the known rows they fix are deleted)
  - Gate: emitted JS byte-identical; rows green on beta6 and 4.0.0; every new declaration claimed, or RFC-A-03's `coverage.test.mjs` fails; pure-prior statements working on first compile 14/24 (5/24 on 8.1.0)
  - Docs: `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/8.2.0/README.patch` (`fluent-html/REFERENCE.md:385-386`: the inert `outerMorph show:window:top` example becomes the typed working spelling); `.../8.2.0/CHANGELOG.entry.md` `✨ Added` and `🎯 Type-safety` (HxTrigger/HxTarget) entries
  - Note: depends_on release: fluent-html 8.1.1, RFC-A-03 @ fluent-html 8.1.1
- [ ] [P1] After fluent-html 8.1.1: Print the branded route sinks' producers on line 1 in resolve([params,] query?) notation (RFC-B-03 lib half)
  - Spec: § RFC-B-03 › 1. Lib: `src/core/route-sink-hint.ts`; 2. Lib sinks; 3. One `resolve` notation in the lib; 4. Lib tests
  - Files: `fluent-html/src/core/route-sink-hint.ts` (new, type-only, reachable from no entry point); `fluent-html/src/htmx.ts:420` (`hx` endpoint) and `:22` (`ResolvedRoute` JSDoc notation); `fluent-html/src/core/htmx-methods.ts:18-20`; `fluent-html/src/elements/links.ts:30`; `fluent-html/src/routes.ts:299` (notation); `fluent-html/test/types/brand-probe/probe.ts` (must-fail lines); `fluent-html/test/brand-errors.test.ts` (`:59`, `:64`, `:67-74` replaced)
  - Gate: producers on line 1 in 21/24 probes (0/24 on 8.1.0); dist and src JS byte-identical; `hx()`'s parameter token re-claimed in RFC-A-03's surface gate
  - Docs: `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/8.2.0/README.patch` (`fluent-html/README.md:91`: `resolve(params?, query?)` becomes `resolve([params,] query?)`); `.../8.2.0/CHANGELOG.entry.md` `🎯 Type-safety` entry
  - Note: depends_on release: fluent-html 8.1.1, RFC-B-01 @ fluent-html 8.1.1 (K1: without the dev throw the verbatim-key cast path renders `hx-undefined`). The `prefer-set-method` half shipped in plugin 4.2.0
- [ ] [P1] After fluent-html 8.1.1: Add type-only traps for .colspan, .rowspan, .inert and .setInert that name the setter (RFC-A-04 Part A)
  - Spec: § RFC-A-04 › Final contract (Part A only); Tests
  - Files: `fluent-html/src/core/tag.ts:51` (interface merge: `inert`, `setInert`); `fluent-html/src/elements/tables.ts:37` (`ThTag`) and `:90` (`TdTag`) interface merges (`colspan`, `rowspan`); `fluent-html/test/types/setter-probe/trap-probe.ts` (new); `fluent-html/test/setter-errors.test.ts` (new describe); `fluent-html/test/types/type-surface.test-d.ts`
  - Gate: emitted JS byte-identical; `stripInternal` stays off; `Td().colSpan(2)` compiles (positive pin; Part B is cut)
  - Docs: `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/8.2.0/CHANGELOG.entry.md` Added entry; no README hunk (the traps are `@internal`, and `fluent-html/REFERENCE.md:1624-1638` already teaches `setColspan`)
  - Note: depends_on release: fluent-html 8.1.1
- [ ] [P1] After fluent-html 8.1.1: Ship the opt-in serialize-time class merge, setClassMerge(theme) (RFC-A-09)
  - Spec: § RFC-A-09 › Supersedes decisions.md:94; Public API; Semantics (serialize time, one element's `class`); Generated family table (guardrail 9); Serializer; Tests
  - Files: `fluent-html/src/render/class-merge.ts` (new); `fluent-html/src/render/class-families.gen.ts` (new, generated by `fluent-html/scripts/gen-vocab/emit-class-families.ts` through its gen-vocab artifact row); `fluent-html/src/render/serialize.ts:228`; exports from `fluent-html/src/index.ts` and `fluent-html/src/render/index.ts`; `fluent-html/test/class-merge.test.ts` (new: keep, merge, tab and toggle tests, the ordered-pair gate) in both lists of `fluent-html/package.json:65-66`; two bench rows with the merge on in `fluent-html/bench/render.ts`
  - Gate: merge off, every byte equals 8.1.0 (2195/2195 lib tests); the ordered-pair gate finds 0 property-losing drops
  - Docs: `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/8.2.0/README.patch` (the `setClassMerge` API entry in `fluent-html/README.md` and `fluent-html/REFERENCE.md`); `.../8.2.0/CHANGELOG.entry.md` Added entry with the client-toggle boundary
  - Note: depends_on release: fluent-html 8.1.1. The supersession of `decisions.md:94` is recorded in [decisions.md](../decisions.md) ("Serialize-time class merge ships opt-in in 8.2.0"); add a new entry only if the shipped contract differs. K12: whichever of A-09 and RFC-E-08 lands second re-runs `gen:vocab`. The template opt-in rides template 3.9.0 (K3)
- [ ] [P1] After fluent-html 8.1.1: Add Tag.getId() as the read for a wrapper handed a built control (RFC-E-01)
  - Spec: § RFC-E-01 › Curation applied; 1. Library: `fluent-html/src/core/tag.ts`, after `getClass` (:146); 2. Library: `fluent-html/scripts/codemod/storage-fields.ts` `GETTERS` (:42-45)
  - Files: `fluent-html/src/core/tag.ts:146` (`getId()` after `getClass`, folded JSDoc with the `IfThen` example and the `f.label` pointer); `fluent-html/scripts/codemod/storage-fields.ts:42-45` (`GETTERS` gains `id: { getter: "getId" }`); type pins in `fluent-html/test/types/type-surface.test-d.ts` (reads compile; `const s: string = t.getId()` is TS2322; `getId("x")` is TS2554); the runtime rows of the contract's table (v8-spec names no test file: put them beside the `getClass` tests and name the file in the commit); the codemod tests (15/15)
  - Gate: re-measure the folded JSDoc in `tag.d.ts` (the 6-line text cost +135 tokens; lockstep blocker 11)
  - Docs: `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/8.2.0/README.patch` (a `getId` entry in `fluent-html/REFERENCE.md` naming `f.label` for a view that holds `f`; REFERENCE.md has no `getClass` entry at HEAD, so the patch names its section); `.../8.2.0/CHANGELOG.entry.md` Added entry
  - Note: depends_on release: fluent-html 8.1.1, RFC-A-07 @ fluent-html 8.1.1. First of the Track E sequence (K13: the accessor lands before the `forms.ts` pass)
- [ ] [P1] After fluent-html 8.1.1: Type f.select option values by the bound field, descriptor array only (RFC-E-04, 8.2.0 half)
  - Spec: § RFC-E-04 › Curation applied: modify, one shape (guardrail 7); 1. `fluent-html/src/elements/forms.ts` (types only; the runtime is unchanged); 2. Generic wrappers; Tests
  - Files: `fluent-html/src/elements/forms.ts:436` (`SelectOption<V extends string = string>`), `:446` (the array-only `select` signature and JSDoc; internal `Submitted`, `FieldValue`, `Checked`); compile-contract pins in `fluent-html/test/brand-errors.test.ts` or `fluent-html/test/setter-errors.test.ts`; array positives and negatives in `fluent-html/test/types/type-surface.test-d.ts`
  - Gate: 0 new tsc errors in the 16 measured units; re-measure `forms.d.ts` (12,197 B vs 11,028 B on 8.1.0) and run the array-only authoring probe (lockstep blocker 11)
  - Docs: `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/8.2.0/CHANGELOG.entry.md` `🎯 Type-safety` entry; no README hunk (README.md and REFERENCE.md carry no `f.select` or `SelectOption` line)
  - Note: depends_on release: fluent-html 8.1.1, RFC-E-01 @ fluent-html 8.2.0. K13: one `forms.ts` pass with RFC-E-02's `noteBoundSelect` and RFC-E-01's read swap, rebased on 8.1.1's A-07 and C-04 edits. The label-record arm is cut. The `select` JSDoc says the route schema must accept or strip the empty string
- [ ] [P1] After fluent-html 8.1.1: Throw in dev when a required select's own markup preselects a value nobody chose (RFC-E-02)
  - Spec: § RFC-E-02 › Curation applied: the throw reads only what the view controls; 1. `fluent-html/src/elements/forms.ts` `select` (:495-502); 2. Serializer; 3. `assertSelectSubmits`; 4. Tests; 5. Docs
  - Files: `fluent-html/src/core/dev-checks.ts` (`noteBoundSelect` with a dev-only `WeakMap`, `assertSelectSubmits`, both `@internal`); `fluent-html/src/elements/forms.ts:495-502` (records the bound value under dev checks); `fluent-html/src/render/serialize.ts:332`, `:415` (inside the dev-only epoch branch); `fluent-html/test/dev-checks.test.ts` (the oracle shapes; skip, throw and production rows)
  - Gate: production 34/34 byte-identical; RFC-A-06's security pins run together with these rows (`serialize.ts` sits 3 lines from A-06's traversal edits)
  - Docs: `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/8.2.0/CHANGELOG.entry.md` Added entry carrying the upgrade search; no README hunk (§ 5. Docs adds no line)
  - Note: depends_on release: fluent-html 8.1.1, RFC-E-01 @ fluent-html 8.2.0, RFC-A-06 @ fluent-html 8.1.1. A bound value (controller, record or request) never decides a throw; guard 1, a bound value matching no option, is outside this run (lockstep blocker 9)
- [ ] [P1] After fluent-html 8.1.1: Swap RFC-A-07's cast read for first.tag.getId() in the same forms.ts pass (RFC-E-01 internal read)
  - Spec: § RFC-E-01 › 3. Library internal: RFC-A-07's group-id read
  - Files: `fluent-html/src/elements/forms.ts` (`createFormBinding` group read becomes `first.tag.getId() === controlId(name)`)
  - Gate: byte-identical; RFC-A-07's `form-for` pins cover it
  - Note: depends_on RFC-E-01 @ fluent-html 8.2.0 (K13)
- [ ] [P1] After fluent-html 8.1.1: Add IfNotEmpty and IfNotEmptyElse (RFC-E-07, 8.2.0 half)
  - Spec: § RFC-E-07 › Curation applied: trim the d.ts JSDoc cost; 1. Library (8.2.0); Tests and measures
  - Files: `fluent-html/src/control/conditionals.ts` (the pair, internal `NonEmpty` and `ListOrAbsent`, no JSDoc on the three); exports in `fluent-html/src/control/index.ts` and `fluent-html/src/index.ts`; `fluent-html/test/if-not-empty.test.ts` (new, in both lists of `fluent-html/package.json:65-66`); the type probe (sanctioned lines, named-fix lines, internal-type rows, the generic-`L` pin)
  - Gate: the d.ts block costs 303 tokens after the JSDoc strip (725 as written)
  - Docs: `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/8.2.0/README.patch` (one line in `fluent-html/README.md` section 6, the pair entry in `fluent-html/REFERENCE.md`); `.../8.2.0/CHANGELOG.entry.md` Added entry
  - Note: depends_on release: fluent-html 8.1.1. Plugin 4.3.0's `prefer-if-not-empty` imports `IfNotEmpty`, so 4.3.0 publishes after this release (K4 rewritten)
- [ ] [P1] After fluent-html 8.1.1: Add .size() for Tailwind's size-* with the one-time codemod:size-fold (RFC-E-08)
  - Spec: § RFC-E-08 › Curation applied: no autofix over a composed preset; 1. Library (fluent-html 8.2.0); 4. One-time fleet fold: `codemod:size-fold`; Interplay with RFC-A-09
  - Files: `fluent-html/src/class-vocab/vocab.ts:156` (`size` row after `h`); `fluent-html/scripts/gen-vocab/tailwind-types.template.txt:41` (`TailwindSize` after `TailwindHeight`); regenerated `fluent-html/src/core/tailwind-types.gen.ts` and `fluent-html/src/core/variant-object.gen.ts`; `fluent-html/src/core/index.ts:54-55` (export `TailwindSize`); `fluent-html/src/core/tailwind-methods.ts:242-245` (overloads, branded arms) and `:690-697` (impl); `fluent-html/test/vocab-coverage.test.ts:50` (`IGNORED_ROOTS` entry deleted); `fluent-html/project/pm/llm-styling/vocab-generator/backlog.md:12` (entry deleted); type probe lines for `.size("screen")`, `.size("4.5")`, `.size(4)`; `fluent-html/scripts/codemod/size-fold.ts` (new) with the `codemod:size-fold` script and its test in both lists of `fluent-html/package.json:65-66`
  - Gate: the fold is render-identical at 423/423 fleet sites; `gen:vocab` re-run after A-09 so `class-families.gen.ts` gains `size` (K12); brand diagnostics re-measured against the 141-token cap (lockstep blocker 11)
  - Docs: `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/8.2.0/README.patch` (one Sizing line at `fluent-html/REFERENCE.md:1075-1081`); `.../8.2.0/CHANGELOG.entry.md` Added entry, which supersedes the `size-*` deferral at `fluent-html/CHANGELOG.md:439` (history stays as written)
  - Note: depends_on release: fluent-html 8.1.1, RFC-A-09 @ fluent-html 8.2.0. Last in the 8.2.0 sequence. The vocab row makes plugin 4.3.0 lib-first (K4); the extractor needs no code change (K6 amended)
- [ ] [P1] After fluent-html 8.1.1: Apply the staged 8.2.0 CHANGELOG entry and README patch
  - Files: `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/8.2.0/CHANGELOG.entry.md` (pasted directly above the newest `## [` version header of `fluent-html/CHANGELOG.md`), `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/8.2.0/README.patch`
  - Note: depends_on every code task above; `git apply --check` the README patch against the 8.2.0 tree first
- [ ] [P1] After fluent-html 8.1.1: Re-run the official bench on the merged 8.2.0 build, then tag 8.2.0
  - Spec: § Track E addendum › Release bundling changes (fluent-html 8.2.0)
  - Note: depends_on the two closing tasks below; tag only after both are done and lib CI is green with every new test file in both lists
- [ ] [P1] After fluent-html 8.1.1: Write tests
  - Note: both test lists on the merged build; the contracts measured lib 2159/2159 (E-01, E-04), 2162/2162 (E-08) and 2165/2165 (E-07) on separate prototypes, so the merged run is the first joint one
- [ ] [P1] After fluent-html 8.1.1: Check for bugs
  - Note: re-run RFC-A-06's security pins, RFC-E-02's production rows and RFC-A-07's `form-for` pins together after the `forms.ts` and `serialize.ts` passes

### As an agent reading the guidelines I want wave G2 to teach 8.2.0's resolve notation, the opt-in merge, IfNotEmptyElse and .size so that no line names an unpublished API or rule (lockstep step 7, guidelines G2)

Hunks: guidelines-update.md, applied by quoted text (G1's RFC-D-01 deletions move RFC-E-07's lines up one).

- [ ] [P1] After fluent-html 8.2.0: Apply RFC-B-03's guideline trims
  - Files: `guidelines/web-development/htmx.md:181`, `:215`, `:225`, `:474`; `guidelines/web-development/CLAUDE.md:265` (the escapes clause)
  - Spec: guidelines-update.md § RFC-B-03 H1-H5
  - Note: depends_on release: fluent-html 8.2.0
- [ ] [P1] After fluent-html 8.2.0: Replace views.md's compose-to-add rule with the setClassMerge rule (RFC-A-09)
  - Files: `guidelines/web-development/views.md:126-134` (9 lines become 4); `:118` stays
  - Spec: guidelines-update.md § RFC-A-09 section 1; § RFC-A-09 › Guideline and lockstep order
  - Note: depends_on release: fluent-html 8.2.0
- [ ] [P1] After plugin 4.3.0: Teach IfNotEmptyElse for lists (RFC-E-07)
  - Files: `guidelines/web-development/fluent-html.md:411-415`, `guidelines/web-development/CLAUDE.md:166-167`, `guidelines/web-development/views.md:43`
  - Spec: guidelines-update.md § RFC-E-07 sections 1, 2, 4
  - Note: depends_on release: fluent-html 8.2.0, release: plugin 4.3.0 (K7 amended: the line names `prefer-if-not-empty`). `guidelines/CLAUDE.md:168-169` at the repo root carries the same two lines and no curated entry edits it
- [ ] [P1] After plugin 4.3.0: Teach .size (RFC-E-08)
  - Files: `guidelines/web-development/fluent-html.md:65`, `guidelines/web-development/CLAUDE.md:182`
  - Spec: guidelines-update.md § RFC-E-08 sections 1, 2
  - Note: depends_on release: fluent-html 8.2.0, release: plugin 4.3.0 (K7 amended)
- [ ] [P1] After plugin 4.3.0: Write tests
  - Note: run `projects-template/tests/guidelines-enforcement.test.ts` on the re-vendored copy; guidelines/** net -11 for G2
- [ ] [P1] After plugin 4.3.0: Check for bugs
  - Note: B-01's G1 rewording and B-03's clause deletion share `CLAUDE.md:265`; the line must read as guidelines-update.md § RFC-B-03 H1 states after both

### As an agent working in fluent-html I want its CLAUDE.md to teach IfNotEmptyElse and .size once G2 publishes (lockstep step 7b, repo commit, no release)

- [ ] [P1] After G2: Apply RFC-E-07's CLAUDE.md line
  - Files: `fluent-html/CLAUDE.md:168-169` (net -1; two lines higher after step 4b)
  - Spec: § Track E addendum › Guideline lines (apply by quoted text; wave G2); guidelines-update.md § RFC-E-07 section 3
  - Note: depends_on release: fluent-html 8.2.0, RFC-E-07 @ plugin 4.3.0
- [ ] [P1] After G2: Apply RFC-E-08's CLAUDE.md line
  - Files: `fluent-html/CLAUDE.md:184` (in place; two lines higher after step 4b)
  - Spec: § Track E addendum › Guideline lines (apply by quoted text; wave G2); guidelines-update.md § RFC-E-08 section 3
  - Note: depends_on release: fluent-html 8.2.0, RFC-E-08 @ plugin 4.3.0
- [ ] [P1] After G2: Run `npm run guidelines:pull` in fluent-html to re-vendor `.ai/web-development/` (RFC-A-09's views.md:113-121 deletion and the G1 lines of RFC-D-01, RFC-A-03, RFC-A-05, C-67)
  - Files: `fluent-html/.ai/web-development/{CLAUDE,fluent-html,htmx,views}.md`, `fluent-html/.ai/.guidelines-version`
  - Spec: lockstep § Track E addendum › 3.4 guidelines (vendored copies follow through `guidelines:pull`); guidelines-update.md § RFC-A-09 section 3
  - Note: depends_on release: G2. `fluent-html/scripts/guidelines.sh pull` replaces all of `.ai/` with guidelines HEAD (the vendored copy sits at ac24da0, so the pull also carries every guideline change since then) and copies the pulled `web-development/CLAUDE.md` over the root `fluent-html/CLAUDE.md`: restore the root `CLAUDE.md` the 4b and 7b tasks wrote (`git checkout -- CLAUDE.md`) unless the user takes the pulled copy, and review the `.ai/` diff before committing
- [ ] [P1] After G2: Write tests
  - Note: each CURRENT block is gone and each replacement appears once; `fluent-html/CLAUDE.md` net -1 for this step
- [ ] [P1] After G2: Check for bugs
  - Note: diff each edited line against its G2 twin's final text

<!-- hill: uphill -->
### As an app author I want fluent-html 9.0.0 to leave one spelling for each job in one migration with codemods so that upgrading is a scripted pass (lockstep step 9)

- [ ] [P1] DECISION NEEDED: run RFC-C-02's guess top-up to 20 leak-free runs per condition (7 more with rules, 12 more without) and accept its Kept list before 9.0.0
  - Note: K11 amended: a name any top-up run writes first moves to Kept; the same top-up decides `ForEachElse` (0 of 12 measured stock runs wrote it first) and whether G3's `Repeat` line goes
- [ ] [P1] DECISION NEEDED: typesVersions for the 4 prescribed subpaths (core, ids, behaviors, control) or all 10 export subpaths? (open call 5)
- [ ] [P1] DECISION NEEDED: add the readonly nonce?: never tombstone to RenderStreamOptions? (open call 1)
  - Note: it rejects the 3 type-clean silent-drop shapes (3/3) and turns g05's line 1 into `Type 'string' is not assignable to type 'undefined'`
- [ ] [P2] DECISION NEEDED: the chunking bag's fate (open call 2; `RenderStreamOptions` has 0 fleet uses and 3 lib-test uses, no owner in this run)
- [ ] [P1] After fluent-html 8.2.0: Give a bare selector word htmx's meaning in every sink and close HxTarget's string arm (RFC-B-04)
  - Spec: § RFC-B-04 › Types (`src/htmx.ts`); Sinks; Tests and docs
  - Files: `fluent-html/src/htmx.ts` (`HxTarget` closed, `HxSelect`, `HtmlTagName`, `SelectorHint`, `BareWordMessage`, helper return types); `fluent-html/src/patterns.ts` (`Partial` single signature, the bare-word regex arm deleted); `fluent-html/src/routes.ts`; `fluent-html/src/render/serialize.ts` (the `as string` casts); `fluent-html/test/types/selector-probe/probe.ts` (new; joins the root tsconfig excludes); `fluent-html/test/selector-errors.test.ts` (new); `fluent-html/test/patterns.ts` (a `Partial("main")` pin; fixtures move to `#...` through the codemod); `fluent-html/test/types/type-surface.test-d.ts:645`; the `hx-select="this"` control row in `fluent-html/test/grammar/rows.mjs`; `fluent-html/scripts/codemod/bare-selector.ts` (new); `HtmlTagName`, `HxSelect`, `SelectorHint` and the message aliases claimed in RFC-A-03's surface gate
  - Gate: 10/10 wrong guesses rejected (0/10 on 8.1.0); codemod dry run 0 rewrites and 2 reported sites in 15 live repos (`everyframe-composer` `studio.voice.view.ts:326`, `gzs/stem-50` `src/shared/ui/search.ts:6`)
  - Docs: `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/9.0.0/README.patch` (`fluent-html/REFERENCE.md:28` reworded in place); `.../9.0.0/CHANGELOG.entry.md` Changed and Removed entries
  - Note: depends_on release: fluent-html 8.2.0
- [ ] [P1] After fluent-html 8.2.0: Remove the PRUNED_9 names behind the guess gate, with codemod:prune-9 and node10 typesVersions (RFC-C-02)
  - Spec: § RFC-C-02 › 1. Removed (`PRUNED_9`, 6 names); 2. Kept; 3. Node10 consumers: `typesVersions`; 4. The gate; 5. Codemod `codemod:prune-9`; 6. Docs and migration
  - Files: `fluent-html/src/elements/forms.ts:412-417` (`multipart`); `fluent-html/src/control/iteration.ts:168-183` (`Repeat`); `fluent-html/src/control/index.ts:16`; `fluent-html/src/index.ts:341`, `:400-401`, `:434` (root re-exports); `fluent-html/package.json` (`typesVersions` per the decision above, the `codemod:prune-9` script); a node10 row in `fluent-html/test/packaging.test.ts`; `fluent-html/scripts/codemod/prune-9.ts` (new; `PRUNED_9`, `MOVED_TO_SUBPATH`); `fluent-html/test/codemod-prune-9.test.ts` (new); `fluent-html/test/prune-gate.test.ts` and `fluent-html/test/types/prune-gate/{removed,prior,heals}.ts` (new); `fluent-html/generated/full-surface.md` (regenerated); `fluent-html/examples/control-flow.ts`; `fluent-html/scripts/census/method-census.mjs:93`; `fluent-html/test/form-for.test.ts:98` (retitled); `fluent-html/test/grammar/surface.mjs` reads `HTMX_EVENTS` from `fluent-html/behaviors`
  - Gate: `test/prune-gate.test.ts` green; dry runs compile (template 0 edits in 339 files; 15 canonical repos 0 edits for the six names, plus 1 from the `ForEachElse` row at everyframe-composer unless it ran plugin 4.3.0's `--fix` first)
  - Docs: `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/9.0.0/README.patch` (`fluent-html/REFERENCE.md:1892` import line, `:1910-1912` `Repeat` example); `.../9.0.0/CHANGELOG.entry.md` Added (`typesVersions`) and the Removed table; the 9.0.0 entry supersedes `fluent-html/CHANGELOG.md:123-125`, history stays
  - Note: depends_on release: fluent-html 8.2.0, the K11 top-up, open call 5. One 9.0.0 edit pass with RFC-E-07's `ForEachElse` removal (two lines apart in the barrels) and RFC-E-04's `forms.ts` tail
- [ ] [P1] After fluent-html 8.2.0: Remove the nonce options bag and make renderToStreamWithNonce variadic with a chunking overload, with codemod:nonce-bag (RFC-C-03)
  - Spec: § RFC-C-03 › Signatures; JSDoc; Tests; Enforcement, corrected (V-RFC-C-03-combined #5)
  - Files: `fluent-html/src/render/render.ts` (one signature; JSDoc `:7-9`; the `@example` at `:18-21` deleted); `fluent-html/src/render/stream.ts` (variadic plus the chunking overload; JSDoc `:14-15`, `:20`); `fluent-html/src/render/serialize.ts` (`RenderOptions` removed; `RenderStreamOptions` keeps `chunkSize`, `highWaterMark`); `fluent-html/src/index.ts:84`; `fluent-html/src/render/index.ts:4`; `fluent-html/test/security.ts:291-308`; `fluent-html/test/stream.test.ts`; type-surface pins; `fluent-html/scripts/codemod/nonce-bag.ts` (new); the `codemod:nonce-bag` script and `fluent-html/test/codemod-nonce-bag.test.ts` (new) in the test lists
  - Gate: the chunking overload is chunk-identical to 8.1.0's bag (6/6); codemod dry runs on the template, competify, everyframe and fluent-html-home-page give 0 rewrites and 0 skips; every SKIP is a must-fix
  - Docs: `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/9.0.0/CHANGELOG.entry.md` Added and Removed entries; no README hunk (README.md carries no nonce line; the surface is documented in the `render.ts` and `stream.ts` JSDoc, which ships with the code)
  - Note: depends_on release: fluent-html 8.2.0, open calls 1 and 2
- [ ] [P1] After fluent-html 8.2.0: Check f.radio, f.hidden and f.checkbox values against the bound field, with codemod:form-values-9 (RFC-E-04 tail)
  - Spec: § RFC-E-04 › 3. 9.0.0 tail (filed with this RFC, separate lane)
  - Files: `fluent-html/src/elements/forms.ts:451-454` (`radio`, `hidden`, `checkbox` take `Checked` and `CheckboxValue`, under A-07's checkbox JSDoc); `fluent-html/scripts/codemod/form-values-9.ts` (new); the `codemod:form-values-9` script and its test in both lists of `fluent-html/package.json`
  - Gate: home-page `content-panel.components.ts:60` 1/1, 0 hits in the 15 other canonical repos and the template; `f.checkbox("terms", "yes")` stays legal on a boolean field
  - Docs: `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/9.0.0/CHANGELOG.entry.md` Changed entry and its migration line; no README hunk (no doc line covers these values)
  - Note: depends_on RFC-E-04 @ fluent-html 8.2.0, RFC-C-02 @ fluent-html 9.0.0 (one `forms.ts` pass with the `multipart` removal)
- [ ] [P1] After fluent-html 8.2.0: Remove ForEachElse as a PRUNED_9 row (RFC-E-07 tail)
  - Spec: § RFC-E-07 › 3. 9.0.0: `ForEachElse` leaves
  - Files: `fluent-html/src/control/iteration.ts:102`; `fluent-html/src/control/index.ts:14`; `fluent-html/src/index.ts:339`; the `PRUNED_9` row in `fluent-html/scripts/codemod/prune-9.ts`; the row in `fluent-html/test/prune-gate.test.ts`
  - Gate: the removal diagnostic is TS2305 with no suggestion; codemod everyframe-composer `dashboard.page.view.ts:563` 1/1, time-to-live `hours.components.ts:441` reported
  - Docs: `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/9.0.0/README.patch` (`fluent-html/REFERENCE.md:238` becomes an `IfNotEmptyElse` line); `.../9.0.0/CHANGELOG.entry.md` Removed entry
  - Note: depends_on RFC-E-07 @ fluent-html 8.2.0, RFC-C-02 @ fluent-html 9.0.0, the K11 top-up (if a top-up run writes `ForEachElse` first, C-02's rule keeps it: cancel this task and drop its staged entry and hunks)
- [ ] [P1] After fluent-html 8.2.0: Apply the staged 9.0.0 CHANGELOG entry and README patch, with one migration section naming the four codemods in K10's amended order
  - Files: `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/9.0.0/CHANGELOG.entry.md` (pasted directly above the newest `## [` version header of `fluent-html/CHANGELOG.md`), `fluent-html/project/research/v8.2.0/60-rollout/staged/fluent-html/9.0.0/README.patch`
  - Note: depends_on every code task above; drop the entry lines and README hunks of any name the top-up kept before `git apply --check`
- [ ] [P1] After fluent-html 8.2.0: Tag 9.0.0 once the prune gate and lib CI are green
  - Spec: § Release bundling › fluent-html 9.0.0: one migration; § Track E addendum › Release bundling changes
  - Note: depends_on the two closing tasks below
- [ ] [P1] After fluent-html 8.2.0: Write tests
  - Note: both test lists, `test/prune-gate.test.ts` and the three codemod tests on the merged build; the consumer order of K10 (amended) run once on the template
- [ ] [P1] After fluent-html 8.2.0: Check for bugs
  - Note: `codemod:prune-9` and `codemod:nonce-bag` both rewrite fluent-html import declarations: run them one after another on one tree and compile

### As an agent reading the guidelines I want wave G3 to drop the Repeat example once 9.0.0 removes it (lockstep step 10, guidelines G3)

- [ ] [P1] After fluent-html 9.0.0: Delete the Repeat(3, () => Br()) line (RFC-C-02)
  - Files: `guidelines/web-development/fluent-html.md:383` (net -1)
  - Spec: § RFC-C-02 › 6. Docs and migration; guidelines-update.md § RFC-C-02 section 1
  - Note: depends_on release: fluent-html 9.0.0. If K11's top-up keeps `Repeat`, the line stays and this wave is empty: cancel the task
- [ ] [P1] After fluent-html 9.0.0: Re-vendor fluent-html `.ai/web-development/` after G3 (RFC-C-02's `Repeat` line)
  - Files: `fluent-html/.ai/web-development/fluent-html.md`, `fluent-html/.ai/.guidelines-version` (`npm run guidelines:pull`)
  - Note: depends_on release: G3 (the deletion above on guidelines main); the 7b re-vendor task's note on the root `CLAUDE.md` and the `.ai/` diff applies. Cancel with the deletion if K11's top-up keeps `Repeat`
- [ ] [P1] After fluent-html 9.0.0: Write tests
  - Note: run `projects-template/tests/guidelines-enforcement.test.ts` on the template's 9.0.0 re-vendor
- [ ] [P1] After fluent-html 9.0.0: Check for bugs
  - Note: `ForEach(5, i => Div(...))` at `:381` still teaches the count form after the deletion

<!-- hill: uphill -->
### As the maintainer I want the review run's process docs, the user's memory and the behaviors size budget to follow the curated decisions so that the next run and the next runtime change start from a decided record (outside lockstep)

- [ ] [P1] DECISION NEEDED: approve or apply the user-memory edits to fluent-html-is-instruction-set.md:10, :16 and fluent-html-no-context-no-framework-glue.md:14 (RFC-C-04)
  - Spec: § RFC-C-04 › D. User memory
  - Note: no agent edits user memory unprompted; the session that lands the RFC-C-04 commit of 8.1.1 asks in the same change
- [ ] [P2] DECISION NEEDED: reword ALGORITHM §5.10 to "does what its type says, by executed row, in the pinned and the template-served bundle"? (open call 3, RFC-A-03)
  - Note: struck from RFC-A-03's change set and left to curation (§ RFC-A-03 › 3. Records corrected)
- [ ] [P1] Annotate fluent-html/project/research/v8.2.0/ALGORITHM.md:20 and :170 "unreproduced: 03-runtime-contracts §2.4, F-A-102" (RFC-A-03)
  - Spec: § RFC-A-03 › 3. Records corrected (text only)
  - Note: depends_on the user's timing call (lockstep section 3.6)
- [ ] [P2] DECISION NEEDED: reword guardrail 5, which names @jtdigital/ui, now or next run? (open call 4, RFC-C-04)
  - Files: `fluent-html/project/research/v8.2.0/ALGORITHM.md:7`, `:25`, `:135`, `:165`, `:187`; `fluent-html/project/research/v8.2.0/templates/rfc.md:12`, `:29`
  - Note: the same open call covers deleting the unused `packages/config-typescript` in projects-template (0 tsconfig extends), which is the template's to do
- [ ] [P2] DECISION NEEDED: the L-260 behaviors-asset size call before any runtime byte after RFC-A-01
  - Note: RFC-A-01 leaves the asset at 6140 of 6144 B min and 2778 of 2816 B gz (lockstep blocker 3); the open record is the ADR-12 amendment candidate in [decisions.md](../decisions.md) ("Behavior v4 size gate set to 6KB min / 2.75KB gz")
- [ ] [P1] Write tests
  - Note: links in the edited research docs resolve and `pm:lint` stays clean
- [ ] [P1] Check for bugs
  - Note: each decision lands in [decisions.md](../decisions.md) before the edit it allows
