# V-T (lane T: eslint plugin + extractor): FAIL

All staged patches apply, every claim I sampled holds and no repo has a write outside its allowed paths. The lane fails on release order in the plugin PM (3 majors). Fix-up R4 should re-verify lane T only.

## 1. Patches apply (executed on fresh `git archive` trees)
| Patch | `git apply --check` | Applied |
|---|---|---|
| plugin 4.2.0 CHANGELOG, then 4.3.0 CHANGELOG | 0, 0 | yes; 4.3.0 on bare HEAD fails (correct dependency) |
| plugin 4.2.0 README, then 4.3.0 README | 0, 0 | yes; table rows well-formed |
| extractor main CHANGELOG, README | 0, 0 | yes; suite on patched tree 55/56 (only `skew-x-6`), dist-parity green |

House style in the added lines of all 6 patches: no em dashes, no banned words, no absolute paths, no trailing whitespace, no internal ids.

## 2. Claims sampled against v8-spec.md (10, all hold)
1. C-01: 6,124 classes and 145 heads autofixed into tsc errors; `border-b-2` gives TS2769 and `rotate-x-45` TS2345. Matches § RFC-C-01, and tsc 5.9.3 reproduces both codes on 8.1.0.
2. C-01: 9,833 vs 6,728 autofixes, 23,661 tokens, 6,269 of 13,172 failing, 25.3 to 27 s and 60 s, 80 KiB with dist going from 412 to 524 KiB, devDependency `7cf5b23` to `656e812` (HEAD `package.json:60` confirms). Matches §1, §4 and Measured.
3. C-01: a kept `setClass()` goes first. The README example renders `class="my-custom-class"` on 8.1.0 and `my-custom-class bg-red-500 p-4` after the fix.
4. D-01: the extractor message matches § RFC-D-01 ### 3 verbatim (3 of 3 lines). The quoted old text equals `safelist.ts:59` at HEAD.
5. D-01: 11 of 11 calls still throw; TS2353; 376 forced classes; 5,702 and 437 files unchanged; 13 of 13 rewrites byte-identical; `.addStyle` over `.setStyle`. The README `dynamicArg` block equals the spec template with name = `styler`.
6. B-03: `setHref("/team")` gives TS2345 (reproduced), the three producers are named, and the 11-site fixture goes from 3 TS2345 to 1. The old autofix test exists at `rule.test.js:652-653`.
7. E-07: 352 reports, 238 files, 277 sites byte-identical, 14 `arrayValue` reports in 4 units. "15 canonical apps and the template" traces to changelog-draft.md:67, and the `error` severity to RFC-E-07 OQ3.
8. E-08: 282 of 420 pairs; 40×40 to 16×24; 423 pairs over 1,217 contexts; `size-4.5` gives TS2345; 159 to 160 methods.
9. E-08: the setStyle `.size("px", 44)` suggestion matches.
10. 4.3.0 is lib-first ("Publishes after fluent-html 8.2.0"). Matches K4 as rewritten.

## 3. Plugin PM
- **Template PM scripts.** `pm:lint` is clean (strict mode, exit 0) and `hill` shows nothing blocked.
- **Scope shape.** One scope with `prd.md` and `todo.md`. There is one story per release key: 4.2.0, 4.3.0 and the re-sweep after 9.0.0. Every story ends with "Write tests" / "Check for bugs".
- **Pre-existing lines.** INDEX and roadmap lines are byte-identical except Current Focus and Next Up, which the guidelines allow rewriting.
- **Links and spec references.** Every cited path and spec heading resolves.
- **Lib-first gate.** 4.3.0 depends on fluent-html 8.2.0 in todo, prd and roadmap.

**Majors**
- **Publish comes before the tests in both stories.** Publish precedes the closing tests and bug check, and the tasks that must come first (version bump, CHANGELOG, README) are P2. On the scratch copy `focus -a` ranks "Publish 4.2.0" 22nd and those tasks 39th to 40th.
- **focus shows release-gated tasks as ready.** It has no dependency parser, so it lists the 4.3.0, 9.0.0 and 8.1.1 re-sweep tasks under "Ready to Execute". §0's "focus surfaces what is unblocked" is not met, and `depends_on` sits only on the first task of each story.
- **Both commits were pushed, against §0's "never push".** Plugin `956defb` and fluent-html `0fe2237` are on origin/main (reflog: "update by push"). The user's global CLAUDE.md says "commit and push", so the user should decide which rule stands. Do not force-push to undo it.

**Minors**
- The prd's No-Gos list itemizes deferred items, which conflicts with R3.
- The prd uses count words in prose.
- The manifest omits the README hunk at :61-65.

## 4. Extractor tasks in fluent-html's PM
The story exists (`todo.md:75`) and cross-references the plugin scope in both directions. Its anchors hold at HEAD: `CHANGELOG.md:6`, `index.ts:20`, `extract.ts:356`, `extract.test.ts:113`, `dist-parity.test.ts`. Its gate ("55/56, only skew-x-6") reproduces when executed.

**Minor:** no task marks the extractor release (pushing `main`), yet G1 and the 4b commit wait on "release: extractor main".

## 5. Git state
- **Plugin.** Clean. Commit `956defb` touches only `project/pm/` (4 files) and matches the linted PM byte for byte.
- **Extractor.** Clean and unchanged at `83e81d2`.
- **fluent-html.** Commit `0fe2237` touches only `project/pm/` and `60-rollout/`.

Scratch: `rollout-verify/T/` under the session scratchpad.
