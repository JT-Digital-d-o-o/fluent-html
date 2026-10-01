---
rfc: RFC-A-04
lens: combined
verdict: survives-with-changes
confidence: 0.74
killer_objection: "As written, Part B ships a signature narrowing in the additive 8.2.0 lane, and the narrowing rejects code that works: a Td with col-span-2 inside a display:grid row is 133 px against a 67 px sibling (Chromium 149, Tailwind 4.3.3). That is a guardrail-11 break outside the bundled major. Separately, the traps catch 0 of 8 pure-prior generations, while the guess the model does write, .setInert(...) (4/4), stays a bare TS2339. Required changes 1 and 2 answer both points; without them, reject."
guardrail_killer: 11
required_changes:
  - "1. Lane split. Take Part B (the TdTag/ThTag colSpan/rowSpan this-trap overrides) out of 8.2.0; if wanted, it goes to the 9.0.0 bundle as its own decision with the 133 vs 67 px grid-row case. Remove from the 8.2.0 patch: the two members from both interfaces and the TailwindColSpan/TailwindRowSpan import in src/elements/tables.ts, trap-probe.ts lines 11-12 and their expectations, and the two Part B @ts-expect-error lines in type-surface.test-d.ts."
  - "2. Add a setInert trap on Tag next to inert, with the same this-key, and pin it in trap-probe.ts and setter-errors.test.ts. setInert is the pure-prior guess (4/4); with the trap, 4/4 one-round repairs write .toggle(\"inert\", props.modalOpen)."
  - "3. Traps return this, not never, so a mid-chain guess gets one diagnostic instead of TS2684 plus 'Property text does not exist on type never'. Add one mid-chain line per trap to trap-probe.ts."
  - "4. Reword the inert key so it is also right on SvgTag, keeping the 'use .toggle(' prefix first. Measured wording: use .toggle('inert', on) for the HTML inert attribute (an <svg> ignores it, so toggle it on an HTML wrapper): .invert() is a color filter. Do not use an SvgTag override with a second key: that breaks SvgTag -> Tag assignability (TS2322)."
  - "5. Write each trap's JSDoc as /** @internal @deprecated ... */: typedoc then lists 0 of the 57 trap members, and completion still gives sortText=z11 and kindModifiers=deprecated."
  - "6. Scorecard: silent-failure +0.5, not +1, because the 8 direct Td/Th colSpan/rowSpan lines still compile in 8.2.0. Drop the 'one way per job' claim for colspan: addAttribute('colspan', ...) has 8 fleet sites against 6 setColspan and is untouched."
executed:
  - cmd: "git apply rfc-a-04.patch on a scratch copy of 656e812; tsc before/after; diff -rq dist-before lib/dist"
    output: "tsc exit 0 both; dist/src/core/tag.js and dist/src/elements/tables.js byte-identical"
  - cmd: "node --test (the 36 files of scripts.test) on the scratch build"
    output: "tests 2161, pass 2161, fail 0"
  - cmd: "tsc attack.ts against before/after (TS 5.9.3; TS 6.0.3 identical)"
    output: "after: TS2684 on all trap guesses, also after setId(ids.x) and inside .when/ForEach; mid-chain .colspan(2).text(...) adds TS2339 on never; setInert stays TS2339 with no fix; widened Tag and (flag ? Td : Div) unions still compile"
  - cmd: "node browser.mjs (Chromium 149.0.7827.55, Tailwind 4.3.3 candidatesToCss)"
    output: "grid-row td col-span-2 133 px vs sibling 67 px; table-row td col-span-2 200 px = 1 column; <svg inert> link focusable true; <div inert><svg> link focusable false"
  - cmd: "claude -p --restricted --tools '' x4 (claude-opus-5-5), pure-prior InvoiceView prompt"
    output: "setColspan/setRowspan 3/4, setColSpan/setRowSpan 1/4, setInert 4/4; trapped names 0/4"
  - cmd: "tsc on the 4 prior views, before vs after"
    output: "7 diagnostics, byte-identical: 4x TS2339 setInert, 3x TS2551 -> setColspan/setRowspan"
  - cmd: "one repair round x4 on the after diagnostics; tsc; render; eslint prefer-toggle"
    output: "addAttribute('inert','') 2/4 (2 lint errors), reflection cast 1/4, runtime THROW 1/4; identical against before"
  - cmd: "dist-alt2 (changes 1-4) + repair round x4"
    output: "setInert -> TS2684 naming .toggle('inert', on); 4/4 repairs .toggle(\"inert\", props.modalOpen), tsc 0, inert only when open"
  - cmd: "dist-alt: SvgTag override with a second this-key; tsc ok.ts"
    output: "TS2322 SvgTag not assignable to Tag: the this types of each signature are incompatible"
  - cmd: "enum/diag.cjs (TS 6.0.3, 32,712 lines) before/after/alt2; cmp.mjs"
    output: "after: 125 changed, 117 heals -> 0, compiling 966 -> 958; alt2: 226 changed (+109 setInert), 0 suggestions toward trap names, compiling 966 -> 966"
  - cmd: "tsc templates/full-stack and competify copies against before/after/alt2"
    output: "full-stack 154/154/154 byte-identical; competify 0/0/0"
  - cmd: "census.mjs, gridrow-census.mjs, extra-census.mjs (dedup, 58 repos, 12,812 files)"
    output: "1,963 Td/Th, 0 span on a cell, 6 setColspan/setRowspan, 8 addAttribute('colspan'); 0 inert/invert; 0/2,278 grid rows; 0 keyof Tag, 0 Tag subclasses, 0/86 declare-module blocks with trap names"
  - cmd: "grep template full-stack/src + packages/ui/src; grep guidelines + lib docs"
    output: "0 span/inert API hits one layer up; REFERENCE.md:1624-1638 teach setColspan"
  - cmd: "typedoc --json (--skipErrorChecking) with and without @internal; LS completion"
    output: "57 trap members documented as deprecated -> 0; sortText z11 kept"
  - cmd: "render.mjs before vs after; cmp"
    output: "byte-identical 284 bytes; 'colspan' in Td() false"
---

# Verdict: RFC-A-04, combined lens

> You are an ADVERSARY. Kill this RFC through the combined lens. Default to `reject` under
> uncertainty. Reading code is not verification: execute.

Scratch: `wave3/RFC-A-04-combined/` (S). The prototype was rebuilt from the patch, not borrowed from wave2.

## What I executed

**Enforcement layer (type): probe compiled both ways.**
- The patch applies to `656e812` and builds clean. Emitted `tag.js`/`tables.js` are byte-identical, the render is byte-identical (284 bytes), and 2,161/2,161 compiled tests pass.
- `S/attack.ts`, 23 guess lines, under TS 5.9.3 and 6.0.3 (identical output):
  - Every trap guess becomes TS2684 with the fix early in the line. That includes `Td().setId(ids.x).colSpan(2)` (receiver `TdTag & Rooted<"total-cell">`), `.when(...)` and `ForEach` callbacks.
  - **Cascade:** `Tr(Td("Total").colspan(2).text("right"))` gives TS2684 and then `TS2339 Property 'text' does not exist on type 'never'`. Two diagnostics where 8.1.0 gave one. The RFC's "fails once" pin only covers statement-final guesses.
  - **Still open:** `(flag ? Td(a) : Div(b)).colSpan(2)`, `[Td(a), Div(b)].forEach(c => c.colSpan(2))`, a generic `<T extends Tag>` helper, and `const t: Tag = Td()`. All of these compile, so none of them is a new break.
- Enumeration (F-A-401 probe, 32,712 lines, TS 6.0.3) reproduces the RFC: 125 changed lines, the 117 heals go to 0, compiling lines 966 → 958, and 0 new suggestions point at a trap name.

**Pure-prior agent-fitness guess.** Four `claude -p --tools ''` runs (claude-opus-5-5) against an InvoiceView task:

| Guess | Runs | 8.1.0 diagnostic | RFC as written | Changes 1-4 (`dist-alt2`) |
|---|---|---|---|---|
| `.setColspan`/`.setRowspan` | 3/4 | compiles, correct | same | same |
| `.setColSpan`/`.setRowSpan` | 1/4 | TS2551 → right setter | same | same |
| `.setInert(...)` | **4/4** | TS2339, no fix | **same, byte-identical** | TS2684 naming `.toggle('inert', on)` |
| `.colspan`/`.rowspan`/`.inert()`/cell `.colSpan` | **0/4** | | | |

- One repair round on the as-written diagnostics:
  - 2/4 used `addAttribute("inert", "")`, and `prefer-toggle` lint flags both.
  - 1/4 used a reflection cast.
  - 1/4 **throws at render**: `fluent-html: no generic attribute setter found`.
- The same round on `dist-alt2` diagnostics: 4/4 wrote `.toggle("inert", props.modalOpen)`, tsc exits 0, and `<main inert>` renders only while the modal is open.
- Recon 02's organic runs: 0 cell span or inert guesses. Probe #11/#11b are constructed fixtures, not observed agent output.

**Lane / breaking.**
- Chromium 149 with real Tailwind 4.3.3 CSS: a `<td class="col-span-2">` inside `<tr class="grid grid-cols-3">` is 133 px against a 67 px sibling (`grid-column: span 2 / span 2`). So `Td().colSpan(2)` works on a grid-row cell, and Part B rejects working code.
- Fleet: 0 such rows in 2,278 calls. Template full-stack: 154 = 154 diagnostics, byte-identical. competify: 0 → 0.
- Part A break vectors are all 0: no `keyof Tag`, no Tag subclasses, and none of the 86 `declare module "fluent-html"` blocks declares `inert`/`colspan`/`rowspan`.

**Instruction-set grep.** Template `full-stack/src` and `packages/ui/src` have 0 span or inert API forms. The 8 `inert` hits are prose about inert clients. Nothing one layer up solves this, which confirms the RFC.

**Docs surface.**
- typedoc renders 57 trap members as deprecated methods on every Tag class.
- With `@internal @deprecated` it renders 0. The `.d.ts` keeps the trap, and completion keeps `sortText=z11`.

## Attack

1. **Lane (guardrail 11).** Part B is a narrowing in an additive lane, and the narrowed call has a measured working use: a grid-row cell. Under §4, any 8.2.0 RFC that breaks fails. The RFC lists this as Open question 1; the measurement settles it against shipping now.
2. **It traps guesses the model does not make.** The trapped forms come from a synthetic enumeration and a constructed fixture. Against the pure prior, the RFC as written changes 0 of 7 first diagnostics and 0 of 4 repair outcomes. The 1/4 runtime throw and the 2/4 non-canonical `addAttribute` survive it unchanged. The real inert guess, `setInert` (4/4), is one trap away.
3. **The `never` return adds a cascade** on mid-chain guesses, the position where `Td(...)` usually sits.
4. **The SVG message names a no-op.** `Svg().inert()` is told to use `.toggle('inert')`, and `<svg inert>` leaves its link focusable. The obvious fix, an `SvgTag` override with its own key, breaks `SvgTag` → `Tag` assignability (TS2322, measured).
5. **First `@deprecated` in src** (0 today), shown on 57 public doc entries for members that never existed.

## Does it survive?

**survives-with-changes.** With Part B as written it fails the lane rule. The mechanism itself holds:
- it is type-only with byte-identical JS;
- the template, competify and the fleet compile unchanged;
- with changes 1-4 it takes the measured pure-prior inert trajectory from 2/4 lint-flagged + 1/4 hack + 1/4 runtime throw to 4/4 canonical `.toggle("inert", on)` in one tsc round.

Required changes, in order:
1. Move Part B out of 8.2.0 (9.0.0 bundle or drop). Strip its members, its import, trap-probe lines 11-12 and the two `@ts-expect-error` lines.
2. Add the `setInert` trap with the same key, and pin it.
3. Make every trap return `this`, and pin one mid-chain line per trap.
4. Use the SVG-aware wording for the `inert` key, not an `SvgTag` override.
5. Write the trap JSDoc as `@internal @deprecated`.
6. Correct the scorecard:
   - silent-failure is +0.5, because the 8 direct cell `colSpan` lines still compile;
   - the lines that change are 226 (117 heals plus 109 `setInert`);
   - colspan keeps a second working way, `addAttribute`, with 8 fleet sites.

## Guardrail check (if this lens owns one)

| # | Result |
|---|---|
| 1 Zero deps | pass (types only) |
| 2 Hot path | pass: emitted JS byte-identical |
| 3 Escape | N/A |
| 4 Type-safety | pass: keyed on the static receiver; holds through `setId` brands and `.when`/`.apply` |
| 5 Instruction set | pass: 0 template solutions; the `this` override needs the unexported `TailwindColSpan` (RFC TS2724) |
| 6 Pure core | pass |
| 7 Converge | pass for inert once `setInert` is trapped; colspan keeps `addAttribute` (8 sites) |
| 8 Naming | pass: the traps are uncallable, and `set*` stays only on real setters |
| 9 Class-string | N/A: no class change |
| 10 Runtime grammar | N/A |
| 11 Breaking | **fail as written** (Part B in 8.2.0); pass after change 1 |
| 12 Enforcement over prose | pass: +0 prose |
| 13 Append-only styling | N/A |
