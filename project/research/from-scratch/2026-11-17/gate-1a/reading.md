# Strict Tags: Gate 1a reading

Run `wf_7aedbe63-9f1`, 16. 11. 26 to 17. 11. 26, in `~/jt-digital/strict-tags` (local, no remote). Reading committed there as `f9e906b` at `a02a9f2`. Copies of `out/gate-1a.txt` and the two local check-time passes are beside this file.

## Chunks

| Chunk | Status | Fix rounds | Head |
|---|---|---|---|
| Register seeds, expected diagnostics, valid controls and the forging list, before any change to lib/ | passed | 5 | `69e435e` |
| Class text with prefix variants, checked by the grammar; family merge; first check-time preview | passed | 5 | `8766614a` |
| Brands with a private member, type-only exports, tables as aliases, the package's exports and the lint config (S9) | passed | 0 | `c977d698` |
| The route table with the house rule typed; the hatch removed | passed | 3 | `e0610ab5` |
| The swap root on the layout, the live search wire, the poll's bound and the answers | passed | 2 | `df7e4c37` |
| The false rejections, and the submit control a form must hold | passed | 1 | `d6a422f6` |
| The reseeded suite read in full: S3, S4's controls and S9; the reference brought current | passed | 6 | `273e80d3` |
| The check-time script complete, its CI workflow, two local previews, and the Gate 1a reading | passed | 3 | `a02a9f2f` |

Chunk 2 stopped once at its cap on crafted-input findings; the threat model was then set for the gate ([decisions](../../../pm/strict-tags/decisions.md)). Chunk 7 stopped once at its cap on two holes in the gate script and got two more rounds.

## Numbers

S3: 28 of 34 kinds before run (27 tsc, 1 check; line is at least 27); 13 of 13 fluent-html 8 kinds rejected; 0 nowhere (at most 1); 6 runtime (BTN-1, HX-4, XSS-2, XSS-3 absorbed; ID-1, ID-2 throws); 42 of 42 rows as registered; 0 stray; full layout 4 of 4 not-live (badge, counter, flash, search); live search: 4 of 4 request controls include the search control, replace-url present, fresh links 0 includes of 2; amendments 21 of 77 registered files changed since c1, all on their AMENDMENTS row. S4 controls: 0 of 112 registered valid lines rejected on 5.9.3, 6.0.3 and 7.0.2; probes/tsconfig.json seeded 38, error lines 38, missed 0, stray 0, message mismatches 0 on each compiler; mistakes.ts controls 23 of 23 accepted (80 of 81 mistakes refused, mD1 withdrawn); review-probe rulings: 3 flipped to valid, 13 kept refusals, 7 valid as written. S9: 13 of 13 refused on their rung and line (source and emitted declarations); 3 open (13, 14, 15) named; 0 unescaped sinks across 18 rendered spellings; 0 lint reports on the valid controls and the reference's examples. S5 PREVIEW (not a reading, load 3.9 to 6.7 on 10 cores, passes a and b, larger ratio): elements 2000: 2.36 / 2.33 / 2.68 (5.9.3 / 6.0.3 / 7.0.2, cap 2); elements 11330: 3.39 / 3.41 / 5.61 (cap 2); routes added: 1.68 / 1.68 / 1.89 (cap 1.25); lint 11330: 2.21 (cap 1); positions 83 = 83 on all three compilers (7.0.2 gives a different code at 1 of 83). 10 of 10 timed lines over cap. Gate script: 1 min 20 s; each preview pass about 1 min 50 s.

## Report

Gate 1a, read 17. 11. 26 at strict-tags a02a9f2 with a clean tree. The reading is committed as f9e906b: out/gate-1a.txt plus fresh out/check-time-local-a.tsv and -b.tsv. Nothing was pushed and no branch was made.

| Kill | Registered line | Reading | Verdict |
|---|---|---|---|
| S3 share | at least 27 of 34 before run, each on its ✗ line with its registered message | 28 of 34 (27 tsc, 1 check); 42 of 42 rows as registered; 0 stray | holds |
| S3 parity | all 13 of fluent-html 8's kinds | 13 of 13 | holds |
| S3 nowhere | at most 1 | 0 | holds |
| S3 full layout | badge, counter, flash, search not-live | 4 of 4 not-live | holds |
| S3 live search | every request control includes the search control; the answer names the page URL | 4 of 4 include it, replace-url present, fresh links carry no include | holds |
| S4 controls | no registered valid control rejected | 0 of 112 valid lines on 5.9.3, 6.0.3 and 7.0.2; mistakes.ts 23 of 23 controls; first-compile 8 of 8; submit/form 6 compile lines, 0 rejected | holds (caveat below) |
| S5 | runner, twice, larger ratio: elements at most 2, routes at most 1.25, lint at most 1, positions equal | local preview only: 10 of 10 timed lines over cap; positions hold | waiting on the CI runner |
| S9 refused / named / escaped / quiet | 13 refused on their rung; 3 open named; no unescaped sink; 0 lint on valid code | 13 of 13 (source and declarations); 13, 14, 15 named; 0 unescaped of 18; 0 reports | holds |

Commands:
- Whole gate: `node tools/gate.mjs`. It exits 0 and prints "S3, S4, S9 hold; S5 waits on the remote".
- Each kill line is printed with its own command: `node suite/run.mjs all|twins|controls|registry|clean`, `node tools/tsc3.mjs probes/tsconfig.json --expect probes/expected.tsv`, `node suite/run.mjs probes --tsc <v>`, `node tools/mistakes.mjs`, `node forge/run.mjs`, `node forge/run.mjs --declarations`.
- S5 preview: `node bench/check-time/run.mjs 3`, run twice, then `node bench/check-time/read.mjs out/check-time-local-a.tsv out/check-time-local-b.tsv`. The reader exits 1 because every line is over its cap.

S5, waiting on the remote. The script, its reader and `.github/workflows/check-time.yml` (ubuntu-latest, both passes in one job, the reader on the artifact) are built and have never run. They need three things:
- the GitHub repository for strict-tags;
- its Actions runner;
- one secret, FLUENT_HTML_READ_TOKEN, with read access to fluent-html and fluent-html-eslint-plugin.

`tools/gate.mjs` reads S5 only from `out/check-time-runner-a.tsv` and `-b.tsv`, and only while the timed files still match the digest the passes recorded.

The preview decides nothing, but it carries a warning:
- **Better conditions.** It ran at a load of 3.9 to 6.7, against 76 to 230 for the PRD's own previews. Its two passes agree within 0 to 11%.
- **Elements.** 2.33 to 2.68 at 2,000 and 3.39 to 5.61 at 11,330. The prototype read 2.4 to 4.5 and 3.8 to 8.7, so this is lower but still over 2.
- **Routes added.** 1.68 to 1.89 against a cap of 1.25. The PRD recorded 0.6 to 1.0 on the probe's types, so the table as built costs more than the probe did.
- **Lint.** 2.21 against a cap of 1, measured for the first time.

The PRD says that if class text does not bring the ratio under two, the scope stops at Gate 1a. On this preview S5 is likely to miss on the runner. The runner reading should be taken before any Gate 1b money is spent.

S4 caveat, a reading choice. The PRD's S4 text lists "the two review probes (9 and 5 errors today)" as valid controls. The rulings registered in `probes/expected.tsv` at c1, before `lib/` changed, keep 13 review-probe lines as refusals and flip 3 to valid (fp3, fp13a, fp13b). The 13 are fp1, fp2, fp4-helper, fp4, fp4-control, fp5-helper, fp5, fp6, fp12, tryA-helper, tryA, tryB and tryB-use.

A literal reading of S4 cannot be met, because section 4 of the PRD itself requires most of those refusals:
- declared content is asked inside form, a, button and label (fp1, fp2, fp12, fp4-helper, tryA-helper);
- a form with no submit control is a true catch (fp4, tryB-use);
- marks through a generic component is a rabbit hole (tryB).

Two kept refusals rest on the package's own rulings and not on a PRD sentence:
- **fp5:** a component annotated `: El` used in `ul`. Harvest row 10 treats the widened-view message as one that is still raw.
- **fp6:** a class table of plain strings. Only a table annotated with the exported class type is promised to compile.

On the c1 rulings S4 holds. The coordinator should confirm those two, or record them as narrowing S4.

Paths:
- /Users/tony/jt-digital/strict-tags/out/gate-1a.txt
- /Users/tony/jt-digital/strict-tags/out/check-time-local-a.tsv
- /Users/tony/jt-digital/strict-tags/out/check-time-local-b.tsv
- /Users/tony/jt-digital/strict-tags/tools/gate.mjs
- /Users/tony/jt-digital/strict-tags/bench/check-time/run.mjs
- /Users/tony/jt-digital/strict-tags/bench/check-time/read.mjs
- /Users/tony/jt-digital/strict-tags/.github/workflows/check-time.yml
- /Users/tony/jt-digital/strict-tags/probes/expected.tsv

## Plan choices

- Order differs from the PRD's list, on purpose. Registration first, then the class surface with the element half of the check-time script, because S5 is the kill the PRD says can stop the scope and class text is its bet: a preview exists by the end of day 1 and is appended after every type chunk (c3, c4, c6). The hatch goes with the route table (c4), since the registered HX-1, HX-6 and HX-7 seeds can only read their registered messages once the new table exists.
- Brands, the package's exports and the lint config are one chunk (c3). The No-Go says no brand lands without the lint that bans forging it.
- One commit per chunk on main, never pushed, no branch. The registration commit is the ledger: lib/ is byte-identical to c73d50e in it, and a registered file changed later needs a dated line in suite/AMENDMENTS.tsv that the gate script counts. If commits are not wanted, the same ledger needs a hash manifest instead.
- The suite is copied into strict-tags (suite/), strict arm only. The research folder is in fluent-html and is never edited. The prototype's 37 seeds are kept unchanged as suite/baseline to reproduce today's 24 of 34 before anything changes; the 13 kinds fluent-html 8 rejects are frozen from $B/mistakes/results/fh8.tsv: ATTR-1, TW-1 to TW-5, HX-1, HX-2, HX-5, HX-6, HX-7, FORM-1, PURE-2.
- A kind whose old seed used a removed API is reseeded as every spelling the new surface still has for that intent, and its row is the weakest. XSS-3 therefore keeps a run-time spelling (leave(url) from data, absorbed as #blocked) beside the raw hx-get attribute (tsc), so the expected share stays the PRD's 28 and is not lifted to 29 by a spelling change. Expected: 28 before run, HX-4 runtime, 0 nowhere.
- S4's two review probes cannot read 0 errors as written: line fp6 (cls of a non-const string table) is the TW-4 kind, and fp1, fp2, fp12 and the Field helpers are the declared-content rule the PRD keeps inside form, a, button and label. S4 is read on registered lines: c1 files a ruling per line (must compile, or kept refusal with a ✗ first line that names the fix), and the gate reports how many of the 14 flipped and how many are kept. This narrows the kill's wording and is the coordinator's to confirm.
- Cls loses its literal type parameter. It existed for tools/check.mjs, which goes. This makes the annotated class table (run 2's neutral failure) compile by construction and removes a per-call literal type from the check-time budget.
- The theme reaches the class check as a type argument, not by declaration merging: tools/gen-theme.mjs writes a small theme.gen.ts that binds cls with classes<Theme>(), and lint restricts importing classes elsewhere. A mergeable Theme interface would be an exported table an app can merge into. The grammar itself is generated from Tailwind at package build and ships in the package; no generated file is edited by app code.
- Family merge uses a generated root-to-family table (same variants, same property set, the rule tools/check.mjs applied through Tailwind). I found no ready class-merge family table in fluent-html's src to carry, so it is generated from Tailwind's design system.
- A part ref is a call (it takes the page's path params for its scoped id) and marks its own root on any tag except a, button, form and the controls, where it is refused as an address. The view only marks the root; the library splices poll, defer and search attributes onto it when it answers or places the part, so no view writes a trigger or a target.
- The swap root is a wrapper element inside body, not body itself, so elements the client owns can sit outside it.
- hx-include is written per request control by refs that know (self links and forms, the poll tick, the page's own actions), as the PRD's rule 2 says, not inherited from the root: inheritance would make the fresh-page link carry the search. Open and to be listed in the gate report: an action that belongs to another page but is placed on the search page includes nothing, so its redirect loses the typed search (lost, not stale).
- PURE-1 is first tried with configured core rules (no-restricted-imports as an allowlist, AwaitExpression, clock and process globals) on the app's view globs. A rule is written only if a probe shows the allowlist cannot be expressed. Fewer written rules is the PRD's own rabbit-hole warning.
- Three compilers by npm alias (typescript 5.9.3, ts6, ts7), always called by explicit bin path, never .bin/tsc: an aliased install can take over the tsc bin. typescript-eslint runs on the 5.9.3 package.
- The public El alias defaults to a block view that may hold anything, so a `: El` annotation works in div, section, li, td and the layout and is refused only where declared content is asked. To be confirmed by a probe in c6; if it costs a registered catch, the widened-view refusal stays and only its first line is improved.
- Whole-document facts (item 6): the development audit is extended to part answers in c5 because it is the same function. The generated test that renders every route's declared states is not on the PRD's 1a list and is left to Gate 2.
- Cut order inside c4 if its day runs out, each cut recorded: confirm on the action, the machine kind, leave(url). None is read by S3, S4, S5 or S9.
- core.ts is split only where a chunk rewrites a section wholesale (classes, brands, routes, handlers, doc). The content model and attribute code stays in place so each diff is readable.
- S5 is reported as waiting on the remote. The script and .github/workflows/check-time.yml are built and run locally twice as previews; this machine stood at a load average of 173 while planning, so a local ratio decides nothing. The runner also needs read access to two private git dependencies (fluent-html 8 pinned at a SHA, and its eslint plugin), which is one secret to create with the repository.
- The fluent-html 8 lint baseline in S5 is the suite's standalone config at the template's levels ($B/mistakes/eslint.fh8.config.mjs, copied), not the template's own eslint.config.mjs, which needs the template's local plugin and cannot run on a runner without the template.
- Probed today in the scratchpad on 5.9.3 and 7.0.2, before writing c3: with an exports map the package resolves by its own name from inside the repo, a deep import of lib/core.ts fails with TS2307, the brand's constructor is not on the module (TS2339), an object literal lacks '#b' (TS2741 on 5.9.3; TS2322 with the same text on line 2 on 7.0.2), augmenting a type-alias table is TS2300 with a twin diagnostic in lib/index.ts, and emitted declarations keep the brand nominal through #private. The forge runner must attribute the twin to the forging line.
- If npm install has no network, tools resolve from the sibling checkouts the research scripts used (fluent-html for 5.9.3, everyframe-composer for 6.0.3, 7.0.2, eslint and typescript-eslint), and that fallback is recorded in the gate output.
