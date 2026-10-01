---
rfc: RFC-A-09
lens: correctness
verdict: survives-with-changes
confidence: 0.75
killer_objection: "The generated family table puts classes with different oracle property sets in one family (13/16 lossy pairs are `text-<scale>` then `text-[len]`). The merge then changes a property neither write targets. Chromium line-height goes 14.6667px -> 16.5px at competify preglednice.checklist.view.ts:68, one of the RFC's own 'fixed' sites, and 18.5714px -> 19.5px at everyframe-composer dashboard.page.view.ts:507, where block height goes 18.5625 -> 19.5. Separately, 92/131 roots classify any word, which breaks the decided 'no merging of unknown classes'."
guardrail_killer: 13
required_changes:
  - "emit-class-families.ts: delete the subset/superset `peer` fold (`m.set(cat, peer ?? s)` becomes `m.set(cat, s)`) and regenerate. test/class-merge.test.ts:45 then expects `text-xs text-[11px]`. Add the ordered-pair oracle check as a gate (variant: 0 lossy drops out of 1,145,970 pairs)."
  - "class-merge.ts valueFamily: the single-family shortcut classifies a word only when it is digit-first or a fraction, a `(--var)`, a registered token, or in a generated per-root oracle word allowlist. Add keep tests for `cssClass(\"h-captcha\").h(\"12\")` and `.rounded(\"card\").cssClass(\"rounded-foo\")`."
  - "mergeClassList: split on `/[\\t\\n\\f\\r ]/`, not `\" \"`. Add a test: `setClass(\"p-4\\tbg-surface\").p(\"6\")` renders `bg-surface p-6`."
  - "RFC text: delete 'The 3 merged keep pairs are deliberate'. Make 'exact duplicates collapse' say that only classified duplicates collapse. Note that 'unregistered token is never merged' holds only with change 2."
  - "delta-audit.mjs:25 `same` requires equal property sets. Re-run the efc gate; the delta at efc-final-deltas.jsonl:3 must come out kept."
  - "The superseding decisions.md entry states how 'no merging of setClass/cssClass/unknown classes' is met: in full for unknown classes, and narrowed for raw sinks to real utilities, which no-tailwind-in-cssclass and no-tailwind-in-raw-class reject at error."
  - "views.md replacement line states the precondition, because 0 fleet files call setClassMerge at release. Without the call, chaining does not override."
executed:
  - cmd: "git apply $W/rfc-a-09.patch on a git archive of 656e812 in $V/lib; tsc + behaviors build"
    output: "9 files changed, 1128 insertions(+), 3 deletions(-); build exit=0"
  - cmd: "node --test <full test list> in $V/lib (merge off)"
    output: "tests 2195, pass 2195, fail 0 (class-merge.test.js alone: 36/36)"
  - cmd: "node probe/render.mjs <lib> off|on (30 fixtures); diff"
    output: "base vs off IDENTICAL; base vs on: the RFC's 7 rows change as claimed; A2 'p-4\\tbg-surface p-6' -> 'p-6'; A10 'rounded-card rounded-foo' -> 'rounded-foo'; A12 'text-xs text-[11px]' -> 'text-[11px]'"
  - cmd: "node probe/pairfuzz.mjs $V/lib"
    output: "1,145,970 ordered pairs, 7,776 drops, 16 lose a property (13 line-height, 3 --tw-scale-*), 0 shape mismatches"
  - cmd: "node probe/lineheight.mjs (Chromium, repo CSS)"
    output: "competify :68 line-height 14.6667px -> 16.5px; efc :507 line-height 18.5714px -> 19.5px, height 18.5625 -> 19.5"
  - cmd: "node probe/anyword.mjs $V/lib"
    output: "92/131 roots classify '<root>-zzhook'"
  - cmd: "node variant/check.mjs (RFC vs 3-fix variant)"
    output: "variant: dead 108/108, condDead 28/28, keep 35,532/35,532, 0 lossy pairs, 0 hook roots; RFC: keep 35,529/35,532"
---

# Verdict: RFC-A-09, correctness lens

`$W` = `scratchpad/wave2/RFC-A-09` (the design workspace). `$V` = `scratchpad/wave3/RFC-A-09-correctness` (this verification).

- **Prototype.** `$V/lib` is a `git archive` of `656e812` with `$W/rfc-a-09.patch` applied, built fresh.
- **Fix variant.** `$V/variant/final` is `$V/lib/dist` with three fixes (one per required change 1-3), used to prove the fixes keep the RFC's wins.
- **Base.** 8.1.0 is the real `fluent-html/dist`, imported read-only.

## What I executed

**1. The prototype builds and the merge-off path is byte-identical.**
- The patch applies cleanly: 9 files, +1128/-3. The build exits 0.
- `class-merge.test.js` passes 36/36. The full `package.json` test list passes 2195/2195 with the merge off.
- `probe/render.mjs` renders 30 fixtures through 8.1.0, the prototype with the merge off, and the prototype with the merge on. 8.1.0 vs merge off: **IDENTICAL** bytes.

**2. Before/after byte-diff with the merge on: the RFC's table reproduces.**

| Chain | 8.1.0 | Merge on |
|---|---|---|
| `Div().apply(card).p("4")` | `p-6 bg-surface rounded-card p-4` | `bg-surface rounded-card p-4` |
| fl-um `cardTitle + text("danger")` | `text-lg font-semibold text-text text-danger` | `text-lg font-semibold text-danger` |
| `.cursor("pointer").when(…cursor("not-allowed"))` | `cursor-pointer opacity-50 cursor-not-allowed` | `opacity-50 cursor-not-allowed` |

The keep rows are unchanged: `border-b border-line`, `px-8 p-6`, `hidden flex flex-col`.

**3. Attack fixtures (same diff).**

| # | Chain | 8.1.0 | Merge on | Lost |
|---|---|---|---|---|
| A2 | `setClass("p-4\tbg-surface").p("6")` | `p-4\tbg-surface p-6` | `p-6` | `bg-surface` |
| A3 | `setClasses(["mt-4\nrounded-card","x"]).mt("2")` | `mt-4\nrounded-card x mt-2` | `x mt-2` | `rounded-card` |
| A4-A8 | `cssClass("top-bar").top("0")` and 4 more | `top-bar top-0` | `top-0` | the hook (`h-captcha`, `w-richtext`, `z-modal`, `order-summary` likewise) |
| A10 | `.rounded("card").cssClass("rounded-foo")` | `rounded-card rounded-foo` | `rounded-foo` | the real radius |
| A11 | `.gap("4").cssClass("gap-filler")` | `gap-4 gap-filler` | `gap-filler` | the real gap |
| A12 | `.text("xs").text("px", 11)` | `text-xs text-[11px]` | `text-[11px]` | see items 4-6 |

**4. Oracle audit of the generated table.**
- `probe/subset.mjs` checks the ROOTS arbitrary kinds against Tailwind 4.3.3 `candidatesToCss`.
- 7 arbitrary kinds are folded into a family with a different property set. The cause is the generator's `peer` rule in emit-class-families.ts ("nested property set … one family").
- Example: `text-[13px]` declares only `font-size`, but it joins `{font-size, line-height}`.

**5. Ordered-pair oracle fuzz.**
- `probe/pairfuzz.mjs` covers every ordered pair of 1,071 oracle-valid default classes: 1,145,970 pairs.
- The merge drops a class in 7,776 of them. In 7,760 drops the later survivor declares every property of the dropped class, under the same selector shape.
- **16 drops lose a property:**
  - 13 lose `line-height` (`text-xs … text-9xl` followed by `text-[13px]`);
  - 3 lose `--tw-scale-*`.
- 0 drops cross a selector shape.

**6. Chromium, against each repo's production CSS** (`probe/lineheight.mjs`):
- **competify `preglednice.checklist.view.ts:68`:**
  - letter-spacing goes from 1.1px to 0.55px, the intended fix;
  - **line-height goes from 14.6667px to 16.5px**, which nobody asked for.
- **everyframe-composer `dashboard.page.view.ts:507`** (`ProjectLink(…).text("px", 13)`):
  - font-size is 13px both before and after;
  - **line-height goes from 18.5714px to 19.5px**;
  - **block height goes from 18.5625 to 19.5.**

**7. Hook classification.**
- `probe/anyword.mjs`: **92 of 131 roots** classify `<root>-zzhook`. The `distinct === 1` shortcut in `valueFamily` accepts any word, including on `h`, `w`, `top`, `z`, `gap`, `rounded*`, `p*`, `m*` and `font`.
- **Fleet reach today is 0.** `probe/rawsinks.mjs` over the 58 dedup repos:
  - canonical-era: 184 raw-class sites, 0 cssClass tokens classify (0/25), 0 literals with tab or newline;
  - pre-7: 10,047 raw sites, 0 cssClass tokens.
- **Lint already flags these names.** The eslint plugin's `isTailwindToken` returns true for `h-captcha`, `top-bar` and `rounded-foo`, and `no-tailwind-in-cssclass` / `no-tailwind-in-raw-class` are at `"error"` (index.ts:75,77). Dynamic values are not linted.

**8. The RFC's gate shares the defect.**
- `$W/census/delta-audit.mjs:25` treats a subset **or** a superset as the "same" family.
- So `$W/efc-final-deltas.jsonl:3` (`text-sm … text-[13px]` losing `text-sm`) was counted as explained, not as a line-height change.
- `test/class-merge.test.ts:45` asserts the lossy output: `"arbitrary size over a scale size" … "text-[11px]"`.

**9. Render paths and caches are sound** (`probe/paths.mjs`):
- `render` equals `renderToIterable`, and `renderWithNonce` emits the same classes.
- 30,000 unique strings past the 10K caps give 0 wrong outputs.
- A token registered in two namespaces is kept. Reconfiguring the registry takes effect, and `false` restores 8.1.0 bytes.

**10. Fix variant** (the three fixes in required changes 1-3, measured):
- `variant/check.mjs` on the RFC's fleet pairs: dead 108/108, condDead 28/28, luck 131/137 (the same as the RFC), and **keep 35,532/35,532** (the RFC as written: 35,529).
- `pairfuzz.mjs`: **0 lossy drops** out of 7,732.
- `anyword.mjs`: **0/131** roots classify an unknown word.
- Chromium:
  - competify `:68` keeps line-height 14.6667px and still gets the letter-spacing fix;
  - everyframe-composer `:507` is unchanged.
- The RFC table rows render identically in the variant and the RFC as written; only the attack rows differ.
- CPU-time bench, variant vs the RFC as written: x1.020 when the memo hits, x1.052 when it misses (noise).

## Attack

**1. The merge changes properties that neither write targets.**
- The RFC defines a family as "selector shape plus its sorted CSS property set". The generator breaks that definition by folding arbitrary values into a superset family.
- When an earlier scale size is followed by an arbitrary px size, the earlier class's `line-height` is deleted.
- **This is live in the fleet:**
  - the RFC's own census has 3 such pairs (competify ×2, everyframe-composer ×1);
  - one of them is the competify `:68` chain the RFC showcases as "override applied". The RFC checked only letter-spacing there, and its line-height silently moves +1.83px.
- The RFC hides this by calling the 3 pairs "deliberate", and its audit predicate counts subset sets as the same family. The "0 unexplained" claim does not hold.

**2. Wider than the decided scope (guardrail 13).**
- The decision (`fluent-html-batch/decisions.md`) narrows the exception: "no merging of `setClass`/`cssClass`/unknown classes".
- The prototype classifies unknown words on 92/131 roots, so a hook can drop a real utility (A10, A11) or be dropped itself (A4-A8).
- The RFC's text claims "An unregistered token is never merged" and that cssClass hooks are "left untouched". Both are false by construction. They hold today only because the fleet census found 0 such hooks and lint flags them.

**3. Tokenization disagrees with HTML.**
- `cls.split(" ")` glues `p-4\tbg-surface` into one token, which classifies as padding and is dropped whole.
- The HTML class attribute and the plugin's own `split(/\s+/)` both treat tab and newline as separators.
- Fleet reach in literals is 0; dynamic strings are unmeasured.

## Does it survive?

**survives-with-changes.**

**Lane check passes.**
- Merge off: byte-identical on 30 fixtures, and 2195/2195 tests pass.
- No consumer changes until it calls `setClassMerge`, so this is additive for 8.2.0.

**The core design is correct.**
- 7,760 of 7,776 oracle-fuzzed drops are sound.
- The render paths agree, and the caches clear correctly.

**Why it can't ship as written:**
- All three defects sit in the classifier and the generator.
- With them, the template's default opt-in would ship the line-height regression to every new scaffold.
- The guardrail 13 objection is rebutted only by required change 2.

**The fix variant shows the required changes cost nothing the RFC claims:**
- 108/108 dead pairs and 28/28 conditional pairs still merge;
- the keep set becomes 35,532/35,532;
- 0 lossy pairs and 0 hook roots remain;
- the bench stays in the noise band.

**Required changes** (from frontmatter):
1. **Generator:** drop the `peer` subset fold in `emit-class-families.ts`, and fix `test/class-merge.test.ts:45` to expect both classes kept. Add the pair oracle check as a gate.
2. **Classifier:** classify a word value on a single-family root only when it is numeric, a `(--var)`, a registered token, or in a generated per-root oracle word allowlist. Add the `h-captcha` and `rounded-foo` keep tests.
3. **Tokenizer:** split on `/[\t\n\f\r ]/` and add a tab test.
4. **RFC text:**
   - remove "3 merged keep pairs are deliberate";
   - scope "exact duplicates collapse" to classified tokens (`js-a js-a` stays);
   - note that "unregistered token is never merged" holds only with change 2.
5. **Audit gate:** `delta-audit.mjs:25` requires equal property sets. Re-run the everyframe-composer gate.
6. **decisions.md:** the superseding entry says how "no merging of setClass/cssClass/unknown classes" is met: in full for unknown classes, and for raw sinks narrowed to real utilities that the two lint rules already reject at `error`.
7. **views.md:** the replacement line states the precondition (0 fleet files call `setClassMerge` at release). The net guideline delta becomes -6.

## Guardrail check (if this lens owns one)

| Guardrail | Status | Evidence |
|---|---|---|
| 13 (append-only, except the decided merge) | Violated as written; rebutted by required changes 1-2 | Subset families: 16 lossy pairs. Unknown classes merged: 92/131 roots. |
| 3 (escape) | Holds | `cssClass('a"b')` renders `a&quot;b p-6`. |
| 2 (hot path) | Holds when off | Merge-off bytes are identical. On-path cost is not this lens; the variant is x1.02-1.05 vs the RFC. |
