---
rfc: RFC-A-09
lens: breaking-change
verdict: survives-with-changes
confidence: 0.8
killer_objection: "The 8.2.0 release itself is clean. With no opt-in, the patched lib renders byte-identical output on the template scaffold (395/395 deterministic renders), on fl-um (338/338) and on competify (448/448). The lockstep around it is not clean, in three ways. (1) The views.md replacement says chaining overrides, with no condition. guidelines:pull delivers it from one main branch to 23 repos that carry today's 'Compose to add' rule, and 0 of them call setClassMerge. Un-opted 8.2.0 still renders 'text-lg font-semibold text-text text-danger'. (2) Opting in a live repo changes shipped rendering. In competify one drop removes a property that neither write targets: the checklist label's line-height goes from 14.6667px to 16.5px in Chromium. Eyebrow labels change color, rgb(95,111,134) to rgb(37,99,235), across 17 renders. (3) The template's server.ts and test-setup edits fail with TS2305 x2 against the template's own pinned fluent-html (pnpm-lock 656e812) unless the lock is bumped in the same commit."
guardrail_killer: null
required_changes:
  - "Guideline lockstep: the views.md replacement (and the lib's .ai copy) must state the precondition and tell the reader what to do. For example: 'Override by chaining once boot calls `setClassMerge(theme)` (fluent-html 8.2.0+; the template does). If `buildServer` and `tests/setup.swap-verbs.ts` lack it, add it there. Without it, fluent appends and stylesheet order picks the winner.' Reuse the agent-fitness lens's tested text. Restate guideline_delta from the final line count (agent-fitness measured -5). Ship the guidelines change no earlier than the lib 8.2.0 commit, because guidelines:pull reaches 23 repos (16 canonical, 7 pre-7) that carry the current rule and do not opt in."
  - "Template lockstep ordering: the commit that adds `setClassMerge(theme)` to `src/core/server/server.ts` and `tests/setup.swap-verbs.ts` must also bump projects-template `pnpm-lock.yaml` (fluent-html resolves to 656e812 at lines 26/46/127, plus the pm-gui peer at line 158) to the commit that carries setClassMerge. Measured without the bump: TS2305 at server.ts:5 and setup.swap-verbs.ts:2, and the unit test file fails to load. Also note that `templates/full-stack/package-lock.json` still pins 8.0.0 (6de9c1f). Scaffolds skip that file (setup.ts:807), but npm use inside the template would hit the same TS2305."
  - "Fleet rollout text: replace 'Each app adds the one line' with 'Each app adds the line in a commit that carries its re-render delta audit from its own test renders and compiled CSS.' The audit lists exact duplicates, no-change dedupes, intended visible changes and property-losing drops, and its 'same family' check compares property sets, not only stylesheet order. Measured: template 3 distinct deltas (all exact duplicates); fl-um 13 (11 duplicates, 1 no-change, 1 intended); competify 18 (9 duplicates, 6 no-change, 3 intended, 1 property loss)."
  - "Gate the fleet opt-in (not the 8.2.0 release, which ships off) on the correctness and runtime-contract lenses' family-table fixes: no nested property-set fold, and no classifying arbitrary words under single-family roots. Only one property loss turned up across my two live repos, and it is that defect: competify `text-xs` dropped for `text-[11px]` loses line-height (14.6667px to 16.5px in Chromium). Word classification measured: `mergeClassList('h-12 h-captcha')` returns `h-captcha`, so `cssClass('h-captcha').h('12')` drops a third-party hook class. Fleet reach today is 0 of 159 literal raw-sink tokens and 0 captcha hooks."
  - "Open question 1 (9.0.0 default-on) must record that the flip is a guardrail-11 breaking change with measured visible deltas in live repos (competify 4 visible including the property loss, fl-um 1, everyframe-composer 22 per the RFC). It must name the codemod: insert `setClassMerge(false)` at boot, or run the per-repo audit. It must carry a dry-run requirement on the template plus one live repo."
executed:
  - cmd: "rsync lib@656e812 -> $V/lib; git apply --check + apply $W/rfc-a-09.patch; npm run build (scratch); same for unpatched $V/base"
    output: "9 files changed, 1128 insertions(+), 3 deletions(-); build exit 0 both; $V/base dist/src == real repo dist/src (0 non-map diffs)"
  - cmd: "node --test <package.json test list> in $V/base and $V/lib; tsc -p test/types/color-optout"
    output: "base 2159/2159; patched (merge off) 2195/2195; type project exit 0 both"
  - cmd: "gen-vocab.js --check ($V/lib); exports.mjs over 10 entry points; eslint on the 7 new/changed files"
    output: "4/4 --check OK (0.165 s); index 227->228 and render 9->10 (+setClassMerge), 0 removed, 8 entries unchanged; eslint exit 0"
  - cmd: "instrumented package copies (log every class emit + full render HTML); scaffolded template (21 modules, sqlite); vitest unit x2 per build"
    output: "680/680 base and off; class emits 3868 identical; 395/395 deterministic renders byte-identical; 4 differ only in random tokens (same as base vs base)"
  - cmd: "fl-um (c37f621) and competify (5b09609) scratch copies: vitest unit base vs patched-off"
    output: "fl-um 535/535, 338/338 renders identical, 4976 class emits identical; competify 595/595, 448/448 identical, 15133 identical"
  - cmd: "lockstep.mjs dry run (boot + test-setup opt-in) on scaffold, fl-um, competify, and the 3 files of all 15 canonical repos"
    output: "30 edits, 0 skips across 15/15; workshop-toni pins 7.0.0"
  - cmd: "opt-in runs: scaffold unit+integration; fl-um; competify; tsc; eslint; npm run css; audit2.mjs"
    output: "scaffold 680/680 + 190/190, deltas exact-dup only, tsc unchanged (2 pre-existing), safelist and compiled CSS byte-identical; fl-um 535/535, 13 deltas (1 intended visible); competify 595/595, 18 deltas (3 intended, 1 lossyProperty line-height)"
  - cmd: "lh.mjs (Chromium + competify styles.compiled.css)"
    output: "checklist label line-height 14.6667px -> 16.5px (height 14.66 -> 16.5); eyebrow color rgb(95, 111, 134) -> rgb(37, 99, 235)"
  - cmd: "scaffold with lockstep edits on 8.1.0 (template pnpm-lock pin)"
    output: "TS2305 x2 (server.ts:5, setup.swap-verbs.ts:2); Test Files 1 failed, no tests"
  - cmd: "guideline carriers (58 dedup repos); unopted.mjs"
    output: "16/16 canonical + 7 pre-7 carry 'Compose to add'; un-opted 8.2.0 renders 'text-lg font-semibold text-text text-danger' and 'p-6 bg-surface rounded-card p-5'"
  - cmd: "fleet greps: toggleClass, classList toggles, CSS selectors (cssel2.mjs), raw sinks (rawsinks.mjs), barrels, collisions; coldstart.mjs x15"
    output: "toggleClass 0; client toggles only `hidden` (carved out) or color-free elements; 0 loaded compound selectors on mergeable classes; raw-sink tokens 0/159 classify; 'h-12 h-captcha' -> 'h-captcha'; barrels 0, collisions 0; import +0.67 ms wall, +211 KB heap"
---

# Verdict: RFC-A-09, breaking-change lens

> You are an ADVERSARY. Kill this RFC through the breaking-change lens. Default to `reject` under
> uncertainty. Reading code is not verification: execute.

`$V` = `<scratch>/wave3/RFC-A-09-breaking-change`.

## What I executed

**Patch and lib suite.** I applied `$W/rfc-a-09.patch` with `git apply --check` to a fresh copy of 656e812, then built it next to an unpatched copy.
- The unpatched build matches the shipped `dist/src` (0 non-map diffs).
- Tests: 2159/2159 on base and 2195/2195 patched with the merge off. The only test-file change is the new `test/class-merge.test.ts`.
- `gen:vocab --check`: 4/4 OK.
- eslint on the 7 new or changed files: 0 problems.
- Export surface over 10 entry points: `index` goes from 227 to 228 and `render` from 9 to 10 (both `+setClassMerge`). 0 exports removed and 8 entries unchanged.
- Fleet (15 canonical repos plus the template): 0 `setClassMerge` collisions and 0 `export * from "fluent-html"` barrels.

**Byte identity with no opt-in.** `$V/mkpkg.mjs` builds package copies of base and patched that log every class emit and every `render`/`renderWithNonce` output. I swapped each into scratch copies of three apps and ran their vitest suites.

| App | Tests base / patched | Renders byte-identical | Class emits |
|---|---|---|---|
| Template scaffold (21 modules, `$V/pt/templates/scaf`) | 680/680 / 680/680 | 395/395 deterministic; the other 4 differ only in random tokens, the same as base vs base | 3868 = 3868 |
| fl-um (c37f621, live) | 535/535 / 535/535 | 338/338 | 4976 = 4976 |
| competify (5b09609, live) | 595/595 / 595/595 | 448/448 | 15133 = 15133 |

**Lockstep dry run (the RFC has no codemod; this is the lockstep, scripted).** `$V/lockstep.mjs` adds `setClassMerge(theme)` at the top of `buildServer` (with the imports) and to `tests/setup.swap-verbs.ts`.
- Template, fl-um and competify: 2 edits each, 0 skips.
- All 15 canonical repos (files copied to `$V/fleetdry`): 30 edits, 0 skips. workshop-toni pins 7.0.0 and must upgrade before the call compiles.

**With the opt-in applied:**
- **Template scaffold:**
  - unit 680/680, 3 distinct deltas (25 emits), all exact duplicates (`cursor-pointer cursor-pointer`);
  - after `prisma db push`, integration 190/190 through the real `buildServer`, 1 distinct delta (32 emits), also an exact duplicate;
  - `tsc` shows the same 2 pre-existing TS2883 errors in base, off and on;
  - lint on the edited files: exit 0;
  - `npm run css`: the safelist and `styles.compiled.css` are byte-identical before and after.
- **fl-um:** 535/535, tsc 0, lint 0. 13 distinct deltas (809 emits):
  - 11 exact duplicates;
  - 1 dedupe with no style change (`text-text-dim` dropped for `text-text-faint`, `layout.view.ts:265`; faint already won at CSS byte 52864 vs 52807);
  - 1 intended visible change (`text-text` dropped for `text-danger`, x11; the headline fix).
- **competify:** 595/595, tsc 0, lint 0. 18 distinct deltas (209 emits): 9 exact duplicates, 6 no-change, 3 intended visible changes and 1 property loss. `$V/audit2.mjs` sorts them by compiled-CSS order and by the property sets of the dropped and kept classes:
  - **intended:** `tracking-widest` dropped for `tracking-wider`;
  - **intended:** `Eyebrow = P(label).apply(monoLabel).text("primary")` (`programme.components.ts:35`, x17), so `text-text-faint` is dropped for `text-primary`;
  - **intended:** `.apply(fieldHelp).m("t","0")` (`organise.criteria.view.ts:143`), so `mt-1.5` is dropped for `mt-0`;
  - **lossyProperty:** `text-xs` dropped for `text-[11px]` loses `line-height`.
- **Chromium check** (`$V/lh.mjs`, competify's own compiled CSS):
  - checklist label: line-height 14.6667px → 16.5px, box height 14.66 → 16.5, letter-spacing 1.1px → 0.55px;
  - eyebrow: color rgb(95, 111, 134) → rgb(37, 99, 235).

**Ordering hazard.** The scaffold with the lockstep edits but fluent-html 8.1.0 (the template's `pnpm-lock.yaml` resolves 656e812 at lines 26/46/127):
- `server.ts(5,113)` and `setup.swap-verbs.ts(2,10)`: TS2305 "has no exported member 'setClassMerge'";
- the view test file fails to load.

**Guideline reach.**
- Over the 58-repo dedup corpus, 16/16 canonical repos and 7 pre-7 repos carry "Compose to add" in `.ai/web-development/views.md`.
- `scripts/guidelines.sh` pulls one `main` branch for all of them.
- Un-opted 8.2.0 (`$V/unopted.mjs`) renders `text-lg font-semibold text-text text-danger` and `p-6 bg-surface rounded-card p-5`. These are exactly the chains the RFC's replacement text says now override.

**Collateral exposure of the opt-in:**
- **Client-side class flips:** `toggleClass` is used 0 times in the fleet. Client `classList` flips touch only `hidden`, which is carved out, custom classes (`rise-out`, `nav-lit`, `active`), and stem-50 `upload.ts:39-40`. That last one flips `text-danger`/`text-text-dim` on an element rendered with no color class (`thesis.attachments.view.ts:105`).
- **Hand-written CSS:** 234 selector classes in 19 files, 7 of which classify. The compound and `[class*=]` selectors all sit in everyframe-composer `design/theme-light.css`, which nothing in `src`, `public` or `package.json` loads.
- **Raw sinks:**
  - 0/159 literal `cssClass`/`setClass`/`addClass` tokens classify.
  - The classifier does take hook-like words: `mergeClassList("h-12 h-captcha")` returns `h-captcha`, and `order-summary`, `z-stack` and `font-awesome` also classify.
  - Fleet captcha hooks: 0.

**Cold start** (15 fresh processes per build), paid by every consumer, opted in or not:
- import wall time: median 20.39 → 21.06 ms;
- CPU: 27.40 → 27.42 ms;
- heap: +211 KB.

## Attack

1. **The guideline lockstep isn't additive, but the lib is.**
   - In 8.2.0 the merge is off. The current rule ("compose to add, never to change") stays true in every repo that has not opted in, and today that is all 16 canonical repos.
   - The RFC's two-line replacement says chaining overrides, with no condition, and it goes to 23 repos on the next `guidelines:pull`.
   - In those repos the replacement is false, and the result is the silent failure this RFC exists to remove: un-opted 8.2.0 renders the losing chain unchanged.
   - The agent-fitness lens measured agents following the RFC text in an un-opted scaffold: 1/5 Chromium checks rendered in 2 of 3 runs, where the current prose rendered 5/5. My numbers show the same exposure from the breaking side.
2. **The opt-in changes shipped visuals, and one change is not what anyone wrote.**
   - competify's eyebrows and checklist labels change on opt-in. The color and spacing changes follow the written chain, which is the RFC's point.
   - The line-height loss does not follow the written chain. No write targets line-height. The family table folds `text-[11px]` (font-size only) into `text-xs` (font-size plus line-height). The correctness and runtime-contract lenses found the same defect.
   - The RFC's "Each app adds the one line" would ship that drop blind. The RFC's own delta audit classified everyframe-composer as "0 unexplained" using an order-only `same` check.
3. **Template ordering.**
   - The template's own dev install is pinned (pnpm-lock 656e812), so landing the template edits before or without a lock bump breaks its suite with TS2305.
   - It fails loudly, not silently, but it is still a lockstep sequencing requirement the RFC does not state.
4. **Latent hook drops.**
   - Words that classify (for example `h-captcha` under the `h` root) mean an opted-in app can lose a third-party JS hook class when a same-family utility appears later on the element.
   - Fleet reach is 0 today. Correctness change 2 closes it.

## Does it survive?

**Yes, with the required changes.** The lane claim holds under execution:
- off by default, the patched lib passes 2195/2195 lib tests;
- it passes 680 + 535 + 595 consumer tests;
- it renders byte-identical HTML on the template and two live repos (1,181 deterministic renders, 23,977 class emits);
- the export change is +1 in two entries, 0 removed, and collides with nothing;
- gen:vocab, lint, the safelist and the compiled CSS are unchanged.

No 8.2.0 consumer breaks by upgrading.

The objections attach to the lockstep, not the release:
- the guideline text must be conditional and must not land before the lib;
- the template edit must carry the lock bump;
- fleet opt-in must carry a property-aware delta audit and wait for the family-table fix;
- the 9.0.0 flip must be recorded as a guardrail-11 break with its codemod.

## Guardrail check (if this lens owns one)

- **Guardrail 11 (breaking = codemod-first):** N/A for 8.2.0, because nothing breaks with the merge off (measured above). The 9.0.0 default flip is a breaking change with measured visible deltas in live repos, so Open question 1 must carry a codemod and a dry run (required change 5).
- **Guardrail 12 (net guideline lines go down):** still met with the conditional text (about -5 lines instead of -7).
- **Guardrail 13 (no tailwind-merge semantics beyond the decided merge):** the property-losing fold breaches it on opt-in, as the correctness lens recorded. That gates fleet opt-in (required change 4), not this lane.
