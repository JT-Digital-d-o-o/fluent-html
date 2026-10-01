---
rfc: RFC-C-04
lens: combined
verdict: survives-with-changes
confidence: 0.73
killer_objection: "The enforcement layer does not run. Template CI has failed 114 of 114 runs. The latest run (6f63b33, 2026-09-24) stops at pnpm install with ERR_PNPM_GIT_FETCH_FAILED (PRIVATE_REPOS_TOKEN is not set), before `pnpm run verify` starts, so the new guard never executes on a runner. Where it does run, it misses a component package that styles only through dynamic arguments (0 classes, 4 unresolved calls), one written in .js or .mts, and one that keeps its code outside src/. The retirement itself holds up: 0 dependents and 0 imports across 58 roots, the lib render is byte-identical, and 74/74 form tests pass. So this is a must-fix on the guard and on the claims built on it, not a kill."
guardrail_killer: null
required_changes:
  - "Make the enforcement claim match reality. Add `depends_on: [projects-template ci-green]`, or write the layer as 'ci (dormant until ci-green: 114/114 runs red, install dies before verify)'. Until ci-green lands, score silent-failure +0.1 and the guard's share of decision-space-closure +0.25 as 0. Today the guard fires only on a local `pnpm run test:setup`."
  - "Tighten tests/component-layer.test.ts in five ways. (a) Count `scanFluent(...).unresolved.length` as emission alongside `classes.size`. (b) Walk the whole package directory, skipping node_modules and dist, not just `src/`. (c) Scan .ts/.mts/.cts/.tsx/.js/.mjs and skip .d.ts. (d) Treat a missing `packages/` directory as no offenders. (e) Keep the union class count, and update `error_text` to the new message ('packages/ui emits 47 fluent-html classes and 20 dynamic styling calls. …')."
  - "Resolve open question 1 inside this RFC. Rewrite 'per-app `inputStyle`,' in place, net 0 lines, at guidelines/web-development/CLAUDE.md:231 and fluent-html/CLAUDE.md:235. Add `guidelines` to `lockstep` and keep guideline_delta 0."
  - "Do not leave the Part D memory edits as an open question. The implementing session asks the user to apply or approve the edits to fluent-html-is-instruction-set.md:10,16 and fluent-html-no-context-no-framework-glue.md:14 in the same change."
  - "Correct two claims in the Converge section. First, 'selectStyle adds no second way': 1 of 2 withheld runs with selectStyle present still wrote `StyledSelect` beside it, and the fleet has 2 `StyledSelect` definitions. Second, the '2 pre-existing failures' come from the uncommitted crons.toml edit; at HEAD 6f63b33, full-stack-setup.test.ts passes 77/77."
executed:
  - cmd: "npx vitest run tests/component-layer.test.ts (RFC guard), tpl-base and tpl"
    output: "tpl-base: AssertionError 'packages/ui emits 47 fluent-html classes. … Put shared components in templates/full-stack/src/shared/ui.: expected [ Array(1) ] to deeply equal []'. tpl: Tests 1 passed (1)"
  - cmd: "RFC guard on 6 probe packages"
    output: "all 6 pass the guard. scanFluent: probe-dynamic classes=0 unresolved=4; probe-js 4; probe-lib 4; probe-raw 0; probe-mts 2; templates/ui-kit 2"
  - cmd: "tightened guard on probes / tpl / tpl-base"
    output: "fails on probe-dynamic, probe-js, probe-lib, probe-mts (raw setClass escapes); tpl 1 passed; tpl-base fails"
  - cmd: "gh run list --limit 200; gh run view <latest> --log-failed"
    output: "failure: 114 of 114. Latest 6f63b33: 'PRIVATE_REPOS_TOKEN is not set', '[ERR_PNPM_GIT_FETCH_FAILED] Failed to fetch \"@jtdigital/pm-gui\"'"
  - cmd: "full test:setup on after copy; full-stack-setup.test.ts at git archive 6f63b33"
    output: "after copy: 3 failed | 734 passed, component-layer passed. HEAD: 77 passed (77)"
  - cmd: "tsc type probes, pure-prior guesses, before and after"
    output: "Select().apply(inputStyle) TS2345 both; StyledSelect TS2305 both; '@jtdigital/ui' TS2307 both; f.select().apply(selectStyle): base TS2305, after 0 errors"
  - cmd: "withheld claude -p x2 on after tree with selectStyle"
    output: "afterS1 reused selectStyle (0.200 USD, 12 calls); afterS2 added StyledSelect (0.468 USD, 21 calls); 0 package mentions in both"
  - cmd: "fleet.sh over 58 dedup roots"
    output: "dependents 1 (own manifest), imports 0, selectStyle defs 3, StyledSelect defs 2, mentions: template 17, cms 1"
  - cmd: "dist diff, render byte-diff, node --test forms + form-for"
    output: "forms.js:396-397 comment + map only; d.ts identical; render byte-identical (235 B); 74/74"
  - cmd: "git grep guidelines/plugin/extractor; lockfile diff + frozen check; 15 refs vs packages/ui; eslint + pm:lint"
    output: "0/0/0 hits; 9-line importer removal, rc 0 (stale control also rc 0); 0 refs touch packages/ui; eslint exit 0; pm:lint identical"
---

# Verdict: RFC-C-04, combined lens

> You are an ADVERSARY. Kill this RFC through the combined lens. Default to `reject` under
> uncertainty. Reading code is not verification: execute.

## What I executed

Scratch: `scratchpad/wave3/RFC-C-04-combined/`. It holds rsync copies of the RFC's `tpl-base` (with `packages/ui`) and `tpl` (after the retirement, with `selectStyle` and the guard). Both have the live template's `node_modules` symlinked in. Versions: fluent-html 8.1.0 (656e812), extractor from the full-stack template's deps, guidelines 95067fa, and the 58-root dedup corpus.

**1. Enforcement layer: the CI test, run both ways and attacked.**
- **Guard, both ways.** `tpl-base` fails with the RFC's `error_text` verbatim (47 classes). `tpl` passes (`Tests 1 passed (1)`). The full `test:setup` on the after copy gives 734 passed, 3 failed, and the guard is green. Of the 3 failures, 2 are crons.toml marker tests and 1 is `stamp-existing`, which fails only because my copy has no `.git`. At committed HEAD (`git archive 6f63b33`), `tests/full-stack-setup.test.ts` passes 77/77. So the RFC's "2 pre-existing failures" come from the uncommitted `templates/full-stack/crons.toml` edit, not from main.
- **Six probe packages that ought to fail** (a component package that would render unstyled in an app). All six pass the RFC's guard:

  | Probe | What the extractor sees | RFC guard |
  |---|---|---|
  | `probe-dynamic`: `.bg(tone).p(pad)`, `.text(c).rounded(c)` | 0 classes, 4 unresolved (`p,bg,text,rounded`) | passes |
  | `probe-js`: `src/index.js` | 4 classes | passes (`.endsWith(".ts")`) |
  | `probe-lib`: code in `lib/` | 4 classes | passes (`src/` only) |
  | `probe-mts`: `src/index.mts` | 2 classes | passes |
  | `probe-raw`: `.setClass("p-4 rounded-lg …")` | 0 classes, 0 unresolved | passes |
  | `templates/ui-kit`: matched by the `templates/*` workspace glob | 2 classes | passes (outside `packages/`) |

  `packages/ui` itself carried 20 unresolved calls, so a dynamic-only rewrite of it is the realistic way the problem comes back.
- **A tightened guard** (`component-layer.fixed.test.ts`: union of classes plus `unresolved.length`, whole package directory minus `node_modules`/`dist`, all source extensions, a missing `packages/` tolerated):
  - fails on `probe-dynamic`, `probe-js`, `probe-lib` and `probe-mts`;
  - still misses raw `setClass`;
  - passes on `tpl`, where `metrics` and `config-typescript` are clean;
  - fails on `tpl-base`.
- **Does CI run it?** `gh run list --limit 200` on projects-template returns 114 runs and 114 failures. The latest run (6f63b33, 2026-09-24) logs `##[error]PRIVATE_REPOS_TOKEN is not set` and then `[ERR_PNPM_GIT_FETCH_FAILED] Failed to fetch "@jtdigital/pm-gui"`, which exits before `pnpm run verify`. The template's own `project/pm/ci-green/prd.md` says "CI on this repo has never been green", and its P0 token task is unchecked.

**2. Pure-prior agent-fitness guesses against the new surface.**

Type probes, compiled with `tsc -p tsconfig.probe.json` in the full-stack template, before (`tpl-base`) and after (`tpl`):

| Guess | Before | After |
|---|---|---|
| `f.select(...).apply(selectStyle)` | TS2305 `no exported member 'selectStyle'` | 0 errors |
| `Select(...).apply(inputStyle)` | TS2345 `'(t: InputTag) => InputTag' is not assignable to parameter of type '(tag: SelectTag) => unknown'` | same; does not name `selectStyle` |
| `import { StyledSelect } from "../shared/ui/index.js"` | TS2305 | TS2305; does not name `selectStyle` |
| `import { Select } from "@jtdigital/ui"` | TS2307 | TS2307 |

Agent runs: 2 withheld `claude -p` runs (claude-opus-5-5, wave0-2 harness) on the after tree, with `selectStyle` present and the lib comment at `forms.ts:524` rewritten in the vendored `node_modules`. The task was the RFC's own `task-select.txt`. The RFC's after-runs never measured this state.

| Run | Outcome | Cost | Tool calls | Package mentions |
|---|---|---|---|---|
| afterS1 | reused `selectStyle`, 1 file changed | 0.200 USD | 12 | 0 |
| afterS2 | found `selectStyle`, then added `StyledSelect(select = Select())` beside it, citing `StyledInput` as the twin | 0.468 USD | 21 | 0 |

The guard's message names the fix in its last sentence. The TS errors an agent meets first do not, but they point at the receiver type (`InputTag` vs `SelectTag`).

**3. Instruction-set grep.**
- **The template, one layer up.** The only select solution before was `packages/ui/src/form/Select.ts:57`, a component nobody consumes. `templates/full-stack/src` and `templates/web/src` have 0 `SelectTag` stylers. The template's 4 `f.select(` sites (payments views) are unstyled. `StyledInput` has 0 uses outside `shared/ui`.
- **The fleet** (`fleet.sh`, 58/58 roots present):
  - `package.json` files naming `@jtdigital/ui`: 1, the package's own manifest;
  - `.ts`/`.js` imports of it: 0;
  - `selectStyle` definitions: 3 (fl-um, sportoawards, storysell-system);
  - `StyledSelect` definitions: 2 (planet-positive-sport, ttl);
  - files naming the package: 17 in the template, 1 in cms.
- **The other repos.** `git grep '@jtdigital/ui|packages/ui'` finds 0 hits in guidelines (95067fa), eslint-plugin (9ae5212) and extractor (83e81d2).
- **Template checks after the change.** eslint with the template config and `--max-warnings=0` on `form.ts`/`index.ts`: exit 0. `pm:lint`: 0 errors and 9 warnings both ways, with identical output.

**4. Lane and breaking checks.**
- **Lib.** `diff -r` of the real `dist` against the prototype `lib/dist` finds 2 changed files: `dist/src/elements/forms.js:396-397` (the comment) and its `.js.map`. `forms.d.ts` is identical. Rendering `Form({values, errors})` with `f.input`, `f.error` and `f.select` gives byte-identical output with both dists (235 B). `node --test dist/test/forms.test.js dist/test/form-for.test.js`: 74 pass, 0 fail.
- **Template lockfile.** The lockfile diff is the 9-line `packages/ui:` importer and nothing else. `pnpm install --frozen-lockfile --lockfile-only --offline` exits 0 on the edited lockfile (5 workspace projects). It also exits 0 on the stale lockfile, so the check does not discriminate, but install breaks in neither case.
- **Branches.** 15 refs, including 5 agent worktrees, touch `packages/ui` 0 times relative to main, so later merges are safe.
- **Lane result.** 8.1.x holds: no public shape changes, no emitted byte changes, and the template has 0 consumers to break.

## Attack

1. **The guard is dormant, and the RFC builds two dimension predictions on it.** The RFC says the decision has "a mechanical form" that "fails CI", and it scores silent-failure +0.1 and part of decision-space-closure +0.25 on that. CI has never passed (114/114), and the install step dies before `verify`. Until the `PRIVATE_REPOS_TOKEN` secret exists (a human step in ci-green), the guard fires only when someone runs `pnpm run test:setup` locally. In practice the decision is carried by the PM records and the guardrail text, which is prose.
2. **When it does run, the guard checks the wrong signal.** F-A-209's failure is classes that never reach the safelist. A package whose styling is all dynamic (`unresolved` > 0, `classes` = 0) is the worst case for the safelist, and it passes. So do `.js`/`.mts` sources and code outside `src/`. All four are one-line fixes, and the prototype shows they hold.
3. **`selectStyle` runs into a live guideline line.** `guidelines/web-development/CLAUDE.md:231` (and `fluent-html/CLAUDE.md:235`) says "never hand-maintain theme objects, per-app `inputStyle`, or `@theme` CSS". That line is vendored into every scaffold's `CLAUDE.md` and `.ai/`. The RFC makes `src/shared/ui` the one component layer and adds a third member to the exact styler family the line names, yet it parks the conflict as open question 1. The line came from guidelines 2d29ad5 (2026-06-23) and was aimed at hand-kept theme objects; the same sentence blesses `.apply()` presets. An in-place rewrite costs 0 net lines and belongs in this RFC.
4. **The "no second way" claim is not measured on the after state.** With `selectStyle` present, 1 of 2 runs still wrote `StyledSelect`. The attractor is the template's own `StyledInput`/`inputStyle` pair, and 2 fleet repos have the same wrapper. The RFC's choice not to ship `StyledSelect` is still right, but the claim should report what was measured.
5. **The recreation path is in the user's memory.** `fluent-html-is-instruction-set.md:16` calls `@jtdigital/ui` "the home for shared components" and lists "consolidate into the package" as an open item. Every session in this repo loads it. With the guard dormant, this memory line is the most direct route back to a second component layer. The RFC lists it in Part D but leaves it open.

What did not break:
- 0 consumers in 58 roots.
- The lib change is comment-only, and the render is byte-identical.
- The workspace pin-test edit and the lockfile edit are complete: the only reference under tests/ and scripts is the edited `behavior-asset-pin.test.ts:91`.
- PM lint is unchanged.
- In the RFC's 6 runs and my 2, agents placed shared UI in `src/shared/ui` 8/8 times and never reached for the dead package.
- The user's decision (retire; `src/shared/ui` is the layer) is carried out completely.

## Does it survive?

**survives-with-changes.** The retirement does what the user decided, and the lane and breaking checks are clean. The objections are about the enforcement claim and the guard's coverage, plus two pieces of prose the RFC defers that its own addition makes worse. Required changes, in order:

1. Add `depends_on: [projects-template ci-green]`, or label the layer "ci (dormant until ci-green)". Score silent-failure and the guard share of decision-space-closure at 0 until a green run exists.
2. Guard: count `unresolved` as emission; scan the whole package directory minus `node_modules`/`dist`; accept `.ts/.mts/.cts/.tsx/.js/.mjs` and skip `.d.ts`; tolerate a missing `packages/`; keep the union class count; update `error_text`.
3. Rewrite "per-app `inputStyle`," in place (net 0) in `guidelines/web-development/CLAUDE.md:231` and `fluent-html/CLAUDE.md:235`; add `guidelines` to `lockstep`.
4. The implementing session asks the user to apply or approve the Part D memory edits in the same change, instead of leaving them as an open question.
5. Correct the Converge text (1 of 2 after-runs with `selectStyle` still wrote `StyledSelect`; 2 fleet definitions) and the "pre-existing failures" text (working-tree crons.toml; HEAD passes 77/77).

Not required, for curation: `StyledInput` has 0 uses outside `shared/ui` in the template, and it is what draws agents to the `StyledSelect` twin. Dropping it would converge the field stylers, but that is outside this retirement's scope.

## Guardrail check (if this lens owns one)

- **§5 Instruction set:** the RFC re-points the guardrail's home at the app's `src/shared/ui`, as the user decided. The lib gains nothing. Pass.
- **§7 Converge:** one layer replaces two. `selectStyle` names the 3 fleet copies it replaces. The `StyledSelect` drift comes from the existing `StyledInput`, not from this addition. Pass, with the claim corrected (change 5).
- **§11 Breaking = codemod-first:** N/A. 0 dependents and 0 imports in 58 roots, and 0 of 15 refs touch the package.
- **§12 Enforcement over prose:** guideline delta stays 0 with change 3. The enforcement layer is CI that has never run, so until ci-green the decision lives in prose. That is not a §12 violation, because no guideline lines are added, but it is why change 1 is required.
- **Lane (8.1.x):** the dist diff is 2 comment lines plus the map, d.ts is identical, the render is byte-identical, and 74/74 tests pass. Pass.

No un-rebutted guardrail killer.
