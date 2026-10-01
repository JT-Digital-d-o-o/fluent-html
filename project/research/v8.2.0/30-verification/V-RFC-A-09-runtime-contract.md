---
rfc: RFC-A-09
lens: runtime-contract
verdict: survives-with-changes
confidence: 0.75
killer_objection: "The generated family table breaks the RFC's own contract that a family is 'selector shape plus sorted CSS property set'. emit-class-families.ts:163 puts nested sets into one family (`text-[13px]` with `text-sm`; custom fontSize tokens with the scale sizes), so the merge deletes a line-height the surviving class never sets. Fuzz: 42/7,990 merged ordered pairs lose a property. Chromium: line-height 14.67px to 16.5px at competify preglednice.checklist.view.ts:68 and 18.57px to 19.5px at everyframe-composer dashboard.page.view.ts:507. At both sites 8.1.0 already rendered the intended font-size. The RFC's own audit (delta-audit.mjs:25) called the efc site 'dedupe, no style change'. An asymmetric cover rule fixes it: prototype 0 losses, 108/108 dead pairs kept."
guardrail_killer: 0
required_changes:
  - "emit-class-families.ts:163: stop putting nested property sets into one family. Strict-subset members get their own family id (text-[len]/text-[num] = font-size; scale-[...] = scale). Emit a generated COVERS table (full -> covered sub-family) under gen:vocab --check. The self-check throws when two members of one family declare different property sets (today: #111 and #33)."
  - "Registry: custom fontSize tokens classify into the font-size-only sub-family. ThemeSpec.fontSize is Record<string,string> (define-theme.ts:38), and the oracle emits `.text-display { font-size: var(--text-display); }` with no line-height."
  - "class-merge.ts mergeClassList: a kept full-family class also marks its covered sub-family as seen, in both passes. Then `text-[13px] text-sm` becomes `text-sm`, and `text-sm text-[13px]` / `text-lg text-display` are emitted as written."
  - "Tests: keep-cases text-sm|text-[13px], text-xs|text-[11px], text-lg|text-display stay as written; text-[13px]|text-sm merges. Add a table test that every drop is property-covered by the survivor under the 4.3.3 oracle, over EXACT plus the ROOT samples."
  - "RFC evidence: delete 'the 3 merged keep pairs are deliberate'. Re-run delta-audit with a strict covered-subset rule. Make browser-verify read every property the dropped class declares."
  - "setClassMerge JSDoc and the 8.2.0 CHANGELOG (not guidelines): a class flipped client-side by toggleClass or clipboard feedback.class loses its earlier same-family class as a fallback. Pin this with a test, and add it to Open question 1 (9.0.0 flip) with the re-census number (today 0)."
  - "The 'Replaces' section and the new decisions.md entry must state that setClass/cssClass/addClass tokens that name vocab utilities are merged. The entry must explicitly supersede the 2026-08-14 consequence 'no merging of setClass/cssClass/unknown classes' (projects-template .../fluent-html-batch/decisions.md:89), or else exempt cssClass content."
executed:
  - cmd: "cd $M/lib && node --test dist/test/class-merge.test.js"
    output: "36/36 pass"
  - cmd: "node $M/htmx-names.mjs"
    output: "off == 8.1.0 bytes: true; on: non-class bytes == 8.1.0: true; renderToStream == renderToIterable == render: true; hx names 10, read by beta6 10/10, by 4.0.0 10/10; merged tokens subset of written: true"
  - cmd: "node $M/audit-families.mjs"
    output: "204 families, 2 heterogeneous: #111 font-size,line-height also holds text-[13px] {font-size}; #33 scale-4 vs scale-[3] {scale}"
  - cmd: "node $M/fuzz-pairs.mjs"
    output: "1,204,506 ordered pairs, 7,990 merged, 42 drop a property the survivor lacks (39 line-height, 3 --tw-scale-*), 0 shape diffs"
  - cmd: "node $M/collateral.mjs"
    output: "290 census merges; 3 lose line-height: text-xs->text-[11px], text-xs->text-[10px] (competify), text-sm->text-[13px] (efc)"
  - cmd: "node $M/strict-delta.mjs efc-final-deltas.jsonl everyframe-composer"
    output: "81 removed: 9 exact dups, 71 covered, 1 loses line-height (text-sm -> text-[13px])"
  - cmd: "node $M/rows.mjs (Chromium, repo production CSS)"
    output: "competify :68 line-height 14.6667px => 16.5px, letter-spacing 1.1px => 0.55px; efc :507 line-height 18.5714px => 19.5px, font-size 13px unchanged"
  - cmd: "node $M/rows-toggle.mjs (fluent-behaviors 8.1.0 asset)"
    output: "toggleClass('bg-surface') on bg-primary+bg-surface: 8.1.0 click reveals rgb(37,99,235); merge click gives rgba(0,0,0,0)"
  - cmd: "node $M/rows-hidden.mjs"
    output: "hidden carve-out + behavior('toggle'): none -> flex/column -> none in both 8.1.0 and merge"
  - cmd: "node $M/skew-families.mjs"
    output: "4.3.3 vs template's 4.3.1: 22/990 signature diffs, all divide/space selector nesting, 0 property-set diffs"
  - cmd: "node $M/fuzz-pairs-strict.mjs && node $M/census-compare.mjs"
    output: "asymmetric-cover prototype: 0/7,948 losses; dead 108/108, condDead 28/28, luck 131, keep merges 3 -> 0; efc deltas 53/54 identical"
  - cmd: "node $M/rows-strict.mjs"
    output: "prototype keeps line-height (14.6667px, 18.5714px) and the letter-spacing fix (0.55px)"
  - cmd: "cd $M/lib && node --test dist/test/{htmx,stream,security,behavior,class-merge}.test.js dist/test/escape.js dist/test/patterns.js"
    output: "304/304 pass"
---

# Verdict: RFC-A-09 (runtime-contract lens)

`$M` = `<scratch>/wave3/RFC-A-09-runtime-contract`. `$W` = the RFC's `wave2/RFC-A-09`.

- `$M/lib` is a snapshot of `$W/final`: 8.1.0 `656e812` plus the patch, already built.
- `$M/base` is a snapshot of `$W/base`.
- `$M/strict` is my prototype of the required fix.
- Nothing in the real repo was rebuilt or edited.

## What I executed

**1. htmx contract (pinned bundles).** `$M/htmx-names.mjs` renders one fixture three ways: 8.1.0, the final build with the merge off, and with it on. The fixture covers `setHtmx` get/post, `status: {422}`, `trigger`/`sync`/`include`, `pushUrl`, `Partial`, a `toggleClass` behavior, and composed styling.

| Check | Result |
|---|---|
| Merge off vs 8.1.0 | byte-identical |
| Merge on, everything outside `class="…"` | byte-identical to 8.1.0 |
| `renderToStream` and `renderToIterable` vs `render`, merge on | identical (all three go through `buildAttrs`, serialize.ts:229) |
| hx-* names emitted | 10: `hx hx-get hx-include hx-post hx-push-url hx-status:422 hx-swap hx-sync hx-target hx-trigger` |
| Read by 4.0.0-beta6 (wave0-3 runtime oracle) | 10/10 |
| Read by the template's 4.0.0 | 10/10 |

The RFC emits no htmx name. G10's htmx half holds.

**2. Class contract (pinned Tailwind 4.3.3 oracle).**

- **Merged output is a subset of what was written.** Confirmed on the fixture, and 0 non-pair outputs over 1,204,506 ordered pairs. No class is ever added, so G10's literal "every class passes the oracle" holds.
- **Family consistency.** `$M/audit-families.mjs` checks each of the 204 generated families member by member. 2 are heterogeneous:
  - **#111 `font-size,line-height`** holds `text-xs`…`text-9xl`, which declare {font-size, line-height}, and also `text-[13px]`, which declares only {font-size}.
  - **#33 scale** holds `scale-4`, which declares {--tw-scale-x/y/z, scale}, and also `scale-[3]`, which declares only {scale}.
  - The cause is the generator's own rule at `emit-class-families.ts:163`: "Same root, nested property set (`text-[13px]` font-size ⊂ `text-lg` font-size+line-height): one family."
- **Custom fontSize tokens are misfiled.** `$M/oracle-text.mjs` shows the oracle emits `.text-display { font-size: var(--text-display); }`, with no line-height, for home-page's token. The registry still files it under `tok:--text`, which is #111. The merge then renders `Div().text("lg").text("display")` as `class="text-display"`.

**3. Exhaustive pair fuzz** (`$M/fuzz-pairs.mjs`). Every ordered pair over EXACT plus the ROOT samples plus a theme registry:
- 7,990 pairs merge.
- **42 of them drop a property the surviving class never sets:**
  - 39 lose line-height (`text-<scale>` before `text-[13px]`, `text-display` or `text-body`);
  - 3 lose `--tw-scale-*`.
- 0 selector-shape mismatches.

**4. Fleet reach.**

| Source | Result |
|---|---|
| Census pairs (`$M/collateral.mjs`, every pair with each repo's theme) | 290 merges; 3 lose line-height: `text-xs→text-[11px]` and `text-xs→text-[10px]` (competify), `text-sm→text-[13px]` (efc) |
| competify grep for `.apply(monoLabel)` then `.text("px", 10\|11)` | 7 single-line + 3 multi-line = 10 sites; `monoLabel` writes `text-xs` (programme.components.ts:29) |
| RFC's efc re-render gate, re-audited with a strict covered-subset rule (`$M/strict-delta.mjs`) | 81 removals: 9 exact dups, 71 covered, **1 loses line-height** (`text-sm → text-[13px]`) |

The RFC's `delta-audit.mjs:25` `same()` accepts nested sets in either direction, so it filed that efc removal as "dedupe, no style change".

**5. Chromium rows** (Playwright, each repo's production `styles.compiled.css`, `$M/rows.mjs`).

| Site | Property | 8.1.0 | Merge |
|---|---|---|---|
| competify preglednice.checklist.view.ts:68 | font-size | 11px | 11px |
| | line-height | 14.6667px | **16.5px** (15.7143px under a `text-sm` parent) |
| | letter-spacing | 1.1px | 0.55px (the intended fix) |
| efc dashboard.page.view.ts:507 | font-size | 13px | 13px |
| | line-height | 18.5714px | **19.5px** |

- **The intended font-size already rendered in 8.1.0 at both sites.** `getClassOrder` puts `text-[11px]`@3 after `text-xs`@2 and `text-[13px]`@4 after `text-sm`@1. When the scale size comes first and the arbitrary size second, the merge fixes nothing: its only effect is the line-height change.
- **Why the RFC's check missed it:** its `browser-verify.mjs` checks only the intended property (letter-spacing at :68), so it reported "override applied".

**6. Interactive rows** (Chromium with `dist/fluent-behaviors.8.1.0.js`).

- **`toggleClass`** (`$M/rows-toggle.mjs`). Markup is `.bg("primary").when(sel, t => t.bg("surface"))` and a button runs `toggleClass("bg-surface")`.
  - 8.1.0: the click reveals the primary fallback, `rgb(37, 99, 235)`.
  - Merge: the click leaves `rgba(0, 0, 0, 0)`, because the merged-away `bg-primary` is gone from the DOM.
  - Fleet grep across the 16 repos: 0 app-authored `toggleClass`, feedback-`class` or `animateOut` sites. The 2 drawer sites use `is-open` and `block!`, and neither classifies.
- **`hidden` carve-out with `behavior("toggle")`** (`$M/rows-hidden.mjs`). Both 8.1.0 and the merge go none → flex/column → none, so the carve-out holds.

**7. Other checks.**

- **Version skew** (`$M/skew-families.mjs`). The template resolves tailwindcss 4.3.1. Against 4.3.3: 22/990 signature diffs, all divide/space selector-nesting format, 0 property-set diffs.
- **`cssClass`/`setClass` content.**
  - `Div().relative().cssClass("sticky")` renders `class="sticky"`, and `setClass("p-4 p-6")` renders `p-6`.
  - 30/47 hook-like names classify.
  - This contradicts projects-template `.../fluent-html-batch/decisions.md:89` ("no merging of `setClass`/`cssClass`/unknown classes"). Fleet reach is 0.
- **Lib tests.** htmx, stream, security, behavior, escape, patterns and class-merge: 304/304 pass.

**8. Fix prototype** (`$M/strict/class-merge-strict.js`). An asymmetric cover rule: a kept full-family class also covers its sub-family, never the reverse.

| Check | RFC as written | Prototype |
|---|---|---|
| Fuzz: merged pairs that lose a property | 42/7,990 | 0/7,948 |
| Census dead pairs merged | 108/108 | 108/108 |
| Census conditional dead | 28/28 | 28/28 |
| Census luck | 131/137 | 131/137 |
| Census keep pairs merged | 3 | 0 |
| efc deltas identical to the RFC's | — | 53/54; the 1 that differs is the line-height site |
| competify :68 in Chromium | line-height 16.5px, letter-spacing 0.55px | line-height 14.6667px, letter-spacing 0.55px |
| efc :507 in Chromium | line-height 19.5px | line-height 18.5714px |

## Attack

**1. The table breaks the RFC's own contract.** The RFC says a family is "the rule's selector shape plus its sorted CSS property set" and that "different properties are kept". The generated table does something else: for `text` and `scale` it merges a class into a family whose property set it only partly shares. The 2026-08-14 decision justified the merge because it "deletes only an *earlier* same-family class in favor of a *later* one, which is precisely the author's stated intent" (decisions.md:83). Deleting `text-xs` for `text-[11px]` also deletes a line-height nobody overrode.
   - Reach is real: 10 competify sites and 1 efc site, all confirmed in Chromium.
   - The template opts in by default, so every new scaffold inherits it.
   - Every measurement instrument in the RFC was blind to it:
     - the delta audit's `same()` accepts nested sets in either direction;
     - browser-verify reads only the intended property;
     - the census "keep" set was waved through as "deliberate".

**2. Client-flipped classes lose their fallback.** A class that `toggleClass` or clipboard feedback flips client-side used to fall back to its earlier same-family class. After the merge that class is gone from the DOM, and Chromium shows a working 8.1.0 interaction turning transparent. Reach is 0 today. It is the first thing the 9.0.0 default flip has to re-census.

**3. `cssClass`/`setClass` content is merged.** The merge classifies the whole stored string, so a third-party hook named `sticky` or `table` deletes a real `relative` or `flex`. This contradicts a consequence the decision kept. Reach is 0.

## Does it survive?

**Survives with changes.**

- **The lane holds.** Off by default means byte-identical output, measured. No consumer breaks without the opt-in call, so the 8.2.0 lane check passes.
- **The htmx half of G10 passes**, 10/10 on both bundles. **The class half passes literally**: output is a subset of what was written.
- **The defect is real, measured and fixable.** The line-height deletion is a runtime-contract defect. The prototype removes it with no loss of the RFC's fixes (108/108, 28/28), so it is not a killer.
- **Implementers must apply all `required_changes` before shipping.** Changes 1–4 are code and tests. Changes 5–7 correct the evidence and the record, so the decisions.md supersede entry matches what ships.

## Guardrail check

| Guardrail | Result |
|---|---|
| G10 htmx | pass (10/10 beta6, 10/10 4.0.0) |
| G10 classes | pass (subset of written, 0 new tokens) |
| G9 | the table is a gen:vocab artifact; the required COVERS table must be too |
| G13 | the nested-set rule goes beyond what the RFC calls a family; the required changes restore the family the decision describes |
