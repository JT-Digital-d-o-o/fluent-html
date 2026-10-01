---
rfc: RFC-D-01
lens: combined
verdict: survives-with-changes
confidence: 0.72
killer_objection: "The headline promise ('print a fix that clears the error') does not hold on shapes the RFC did not probe. On a pure-prior adversarial fixture, 4 of the 8 printed fixes go wrong: 2 lookup rewrites do not compile (TS2345 for a Record<string> map with a string key, TS2353 for a map wider than its key), and 2 unitAmount .setStyle fixes silently drop a style. The class rule also prints .apply(cn) (TS2345). Three always-loaded guideline lines in 15/15 repos still teach shapes that the lint or extractor rejects. All of this can be fixed in the message engine, and none of it breaks a consumer or a guardrail."
guardrail_killer: null
required_changes:
  - "Typed `lookup` rewrite: read the key's type through parser services. Open key type (`string`): print the default form or the generic text. Finite union: print only the map keys that are union members. No parser services: print the generic text. Add type-aware tests asserting that the Record<string> case and the wider-map case compile."
  - "`unitAmount`: print `.addStyle(...)` (tag.d.ts:122, accumulates) instead of `.setStyle(...)`. Make the same change in the extractor sentence and align guidelines CLAUDE.md:191 (net 0)."
  - "Class rule `dynamicArg` name: derive it only from a class-suffixed identifier, member or callee; otherwise print `.apply(styler)`. Add tests for cn/clsx/classNames/twMerge."
  - "Extractor text: drop the 'missing from the CSS (renders unstyled)' clause, which is false under the template's `{ theme }` list of 376 classes. Same for the class rule's `fragment` claim."
  - "Extractor text: limit 'the eslint rule names the fix for each call' to calls outside a variant object, or print the enclosing variant call and its `.when(cond, t => t.hover({…}))` fix."
  - "Prose, net 0 or fewer lines: delete fluent-html/CLAUDE.md:157. Retarget guidelines CLAUDE.md:155 so styling tokens do not go into MatchValue. Remove or replace the `bg: cond ? \"primary-700\" : undefined` example at CLAUDE.md:229."
  - "Record that the RFC supersedes arm 4 of projects-template taught-but-unused-prune/prd.md (re-attributing staticManifest), which would keep a remedy that does not clear the throw."
  - "Put the compile-every-printed-rewrite check in plugin CI, with a fixture that includes the shapes in this verdict."
executed:
  - cmd: "npx tsc -p . && npx eslint -c eslint.after.mjs src/app/adv/typed.adv.ts"
    output: "tsc 0 before; 11 reports: 3 lookup, 3 unitAmount, 2 conditional, 1 matchValue, 2 dynamicArg"
  - cmd: "node scripts/apply-any.mjs typed.adv.ts typed.adv.rewritten.ts && npx tsc -p ."
    output: "9 printed fixes applied; (7,63) TS2345 'string' -> 'never' (Record<string> lookup); (11,102) TS2353 'pending' does not exist (map wider than key)"
  - cmd: "npx tsx scripts/adv-diff.mts"
    output: "15/18 identical; a4 class=\"w-[180px] h-[40px]\" -> style=\"height: 40px\"; a11 loses background-image; addStyle form style=\"width: 180px; height: 40px\""
  - cmd: "npx eslint -c eslint.full-after.mjs typed.adv.rewritten.ts ; addstyle.adv.ts"
    output: "double setStyle passes lint; addStyle remedy tsc 0, lint 0"
  - cmd: "eslint after on classes.adv.ts; tsc on .apply(cn)"
    output: ".setClass(cn(...)) -> '.apply(cn)'; TS2345"
  - cmd: "eslint after on pp1+pp2"
    output: "16 class reports (13 dynamicArg / 2 lookup / 1 conditional); typed rule 0 sites"
  - cmd: "node scripts/fleet-detect.mjs (before 4.1.0 vs prototype)"
    output: "fleet 5702 files 0/0, agent runs 437 files 0/0, probes+prior 45/45 identical, 0 crashes"
  - cmd: "npx tsx scripts/diff.mts ; scripts/cf.mts"
    output: "13/13 byte-identical; '' verbatim=DIFF Boolean()=same"
  - cmd: "npx tsx scripts/theme-force.mts"
    output: "376 forced classes; 9/9 bare-token classes checked present"
  - cmd: "npx tsx scripts/extract.after.mts typed.adv.ts ; typed.adv.rw-clean.ts"
    output: "THROW 11 unresolved with and without staticManifest; rewritten OK 6511 bytes"
  - cmd: "tsc + full lint + extractor on .hover({ bg: strong ? \"primary-700\" : undefined })"
    output: "tsc 0, lint 0, extractor THROW '.bg(strong ? ...)'"
  - cmd: "grep fleet CLAUDE.md for the :229 and :155 examples"
    output: "15/15 each; fluent-html/CLAUDE.md:157 present"
  - cmd: "node test/rule.test.js ; type-aware.test.js ; derivation.test.js (prototype)"
    output: "430/0 ; 23/0 ; 14/14"
  - cmd: "grep messageId / message text across 17 repos"
    output: "0 hits"
---

# Verdict: RFC-D-01, combined lens

> You are an ADVERSARY. Kill this RFC through the combined lens. Default to `reject` under
> uncertainty. Reading code is not verification: execute.

Scratch root: `$V = <scratch>/wave3/RFC-D-01-combined/app`. This is a copy of the wave2 probe app with symlinked node_modules. `eslint.full-after.mjs` is the template's 30-rule config with the prototype plugin swapped in.

## What I executed

**1. Enforcement layer (lint rule on fixtures, before and after).**
- **Detection is unchanged and nothing crashes.** I ran `scripts/fleet-detect.mjs` (ESLint `Linter`, packed 4.1.0 against the prototype, both rules at error) over:
  - the 15 canonical repos: 5,702 `.ts` files, 0 reports before and 0 after;
  - the blind1/blind2/guided1/guided2 agent runs: 437 files, 0/0;
  - the probe set plus pp1/pp2: 45 reports before, 45 after, 0 files differ, 0 crashes.
- **The fleet has no existing sites.** The new text only ever reaches newly written code.
- **Pure-prior runs (pp1/pp2).** 16 class-rule reports (13 `dynamicArg`, 2 `lookup`, 1 `conditional`), matching the RFC. The typed rule fires on **0** pp sites. The pure prior writes `.addClass(CONST)` and never reaches the typed-rewrite engine, which is the M part of this RFC.
- **RFC byte-diff re-run.** `scripts/diff.mts` gives 13/13 identical. `scripts/cf.mts` confirms the truthiness trap: with `""`, the verbatim test differs and `Boolean()` matches.
- **Prototype suites.** `rule.test.js` 430/0, `type-aware.test.js` 23/0, `derivation.test.js` 14/14.

**2. Pure-prior agent-fitness guess (`src/app/adv/typed.adv.ts`, 10 shapes, all tsc 0 before).** These are shapes a model brings from React/Tailwind.
- `scripts/apply-any.mjs` pastes each printed fix mechanically and applied 9.
- tsc on the result:
  - `Record<string, C>` map with a `string` key prints `.whenMatch(variant, {primary…, secondary…, ghost…})`, which fails with **TS2345** ('string' is not assignable to 'never').
  - `as const` map with 3 keys and a 2-member key prints all 3 cases, which fails with **TS2353** ('pending' does not exist).
- Render diff (`scripts/adv-diff.mts`, 15/18 identical):
  - `.w("px", w).h("px", h)` with both printed `.setStyle` fixes renders `style="height: 40px"`. **The width is lost.**
  - `.setStyle("background-image: …").w("%", pct)` renders `style="width: 50%"`. **The background is lost.**
  - Both pass tsc and the full template lint silently.
  - The `.addStyle()` form renders `style="width: 180px; height: 40px"`, with tsc 0 and lint 0.
- Class fixture: `.setClass(cn(BASE, VARIANTS[v], …))` prints "apply it: `.apply(cn)`", and that is **TS2345** when compiled.
- What works: ternary rewrites (including `Boolean(props.active)` and `Boolean(count)`), the open-subject `MatchValue` default, and the `Record<Variant,…>` lookup all compile and render identically.
- Tally: 4/8 printed fixes clean, 2 fail tsc, 2 silently change output.

**3. Extractor.**
- `scripts/extract.after.mts` throws 11/11 on the fixture with and without `staticManifest`. This confirms the core defect the RFC fixes: the manifest never clears the throw. The rewritten file passes (6,511 bytes).
- `scripts/theme-force.mts` with the template's `{ theme }` on an empty file forces 376 classes. All 9 bare-token classes I checked are present (`bg-primary` … `border-line`). The new text says "a class it cannot read is missing from the CSS (Tailwind v4 renders it unstyled)". **That is false** for token arguments under the template's own config, which is the same false-claim defect F-C-203 found in the old text.
- `.hover({ bg: strong ? "primary-700" : undefined })` is the shape the always-loaded CLAUDE.md:229 teaches. It gives tsc 0, full lint **0**, and an extractor throw printing `✗ unresolved .bg(strong ? …)`, a string that does not appear in the source. The new text tells the author that `no-dynamic-typed-styling-arg` "names the fix for each call", but that rule reports nothing for this call.

**4. Instruction-set grep.**
- The template ships `src/shared/stylers.ts` (`Styler`, `StylerFor`, `stylers<K>`).
- Fleet `Styler` references run from 19 to 192 per repo across 15/15 repos.
- `packages/ui/src` has 0 `whenMatch` uses. No primitive is missing.
- `addStyle(declaration)` exists in 8.1.0 (`dist/src/core/tag.d.ts:122`).
- `projects-template/project/pm/framework-ideation/taught-but-unused-prune/prd.md` arm 4 proposes re-attributing `staticManifest` to `generateFluentSafelist` and keeping it as a remedy. The RFC conflicts with that arm without citing it, and the measured throw sides with the RFC.

**5. Lane check.**
- A grep for `dynamicArg`, the old message text and `staticManifest (defineTheme` across the code of 17 repos returns **0** hits. No consumer depends on a messageId or the text.
- The extractor change lands in the unreleased 3.0.0. The lib changes only `CLAUDE.md`.
- No eslint-disable comment names a messageId.
- 8.1.x holds.

**6. Prose.**
- The 3 deleted lines are 186, 188 and 235 bytes.
- 15/15 repo CLAUDE.md files still carry `state === "ok" ? "success" : "text-faint" // ✗ … → MatchValue`. That steers styling tokens into `.text(MatchValue(…))`, which the matchValue message then rejects; I linted that shape and it errors.
- 15/15 also carry the variant-object ternary example.
- `fluent-html/CLAUDE.md:157` still says that a MatchValue result can go into `.bg()`.

## Attack

1. **The typed rewrite engine (the M effort) prints wrong code for plausible shapes.** The RFC's 5/5 compile claim comes from a curated probe. A wider map or an open `string` key turns code that compiles today into TS2345/TS2353, and the TS2345 text ('not assignable to never') carries no hint. A wrong exact rewrite is worse than a generic one, because an agent pastes it.
2. **The unitAmount remedy loses a style silently.** Width plus height on one element is the normal case. Following both messages verbatim drops a declaration with no tsc error, no lint message and no build error. The message names `set*` (overrides) where the job is `add*` (accumulates), the exact distinction §5.8 draws.
3. **The evidence for the M part is thin.** The pure prior hits the typed rule 0 times in pp1/pp2, the agent runs 0 times, and the fleet 0 times. F-D-504 cites 1 of 33 recon probes. The S alternative (delete the staticManifest clause and keep one generic text) would fix the measured defect for every site.
4. **Decision closure is overstated.** The +0.5 claim says the extractor, both rules and the guideline now agree. They do not: 3 always-loaded lines in 15/15 repos still teach shapes the tools reject. In one of them (the variant-object ternary), the new extractor text sends the author to a lint rule that is silent.
5. **The new extractor text repeats the old defect.** It keeps a claim the CSS build refutes ("missing from the CSS"), under the template's `{ theme }`.

## Does it survive?

**Survives with changes.** The core of the RFC is correct and measured. `staticManifest` never clears the throw: 11/11 calls still throw with it. Today 3 tool messages and 3 canonical prose lines prescribe it. Removing it is pure gain, it breaks no consumer (0 messageId or text dependents in 17 repos), detection is identical across 6,139 files and 45 reports, and it violates no §5 guardrail. The `Boolean()` truthiness guard and the ternary and MatchValue rewrites are exact (13/13 plus 4/4 byte-identical).

Every defect above sits in the message engine and can be fixed without changing the RFC's shape. That is why this is not a reject. It must not ship as written. Implementers must apply `required_changes` first:

1. Typed `lookup`: type-check the key. An open key prints the default form or the generic text, a finite union keeps only member keys, and without parser services the text stays generic. Add tests for Record<string> and a wider map that assert the printed rewrite compiles.
2. `unitAmount` prints `.addStyle(...)`. Update the extractor sentence to match, and align guidelines CLAUDE.md:191 (net 0).
3. The class `dynamicArg` name comes only from class-suffixed names; otherwise print `.apply(styler)`. Add tests for cn/clsx/classNames/twMerge.
4. Extractor text: drop "missing from the CSS (renders unstyled)" and say only that the build fails on this call. Make the same correction to the class `fragment` text.
5. Extractor text: limit "the eslint rule names the fix for each call" to calls outside a variant object, or print the enclosing variant call with its `.when(cond, t => t.hover({…}))` fix.
6. Prose, net 0 or fewer lines:
   - delete `fluent-html/CLAUDE.md:157`;
   - retarget guidelines CLAUDE.md:155 away from styling tokens going into MatchValue;
   - remove or replace the `bg: cond ? "primary-700" : undefined` example at CLAUDE.md:229.

   With these, `guideline_delta` becomes -4.
7. Cite the RFC as superseding arm 4 of `taught-but-unused-prune/prd.md`.
8. Put the "compile every printed rewrite" check in plugin CI, with the fixture shapes from this verdict.

## Guardrail check

- **4. Type-safety:** pass. Type-aware branches read the checker on the node and fall back to the syntactic form, with no inference through wrapper calls. The lookup branch must also consult the key type (change 1).
- **7. Converge:** pass after change 6. One remedy family remains: a literal per branch, a styler with `.apply`, and an inline style for a runtime amount.
- **8. Naming:** the remedy must name `add*` for the accumulating job (change 2). As written, the message pushes authors toward `set*` override semantics where accumulation is meant.
- **10. Runtime grammar:** the rewrites emit the same classes (13/13 byte-identical). The intended change is `w-[180px]` becoming an inline style.
- **11. Breaking:** N/A; nothing that consumes a messageId or the message text exists (0 hits).
- **12. Enforcement over prose:** pass, -3 lines as written, -4 with change 6.
- **1, 2, 3, 5, 6, 9, 13:** N/A or pass. The lib code is untouched and no vocabulary rows change.
