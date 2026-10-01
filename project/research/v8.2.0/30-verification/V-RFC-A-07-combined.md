---
rfc: RFC-A-07
lens: combined
verdict: survives-with-changes
confidence: 0.78
killer_objection: "The guideline edit makes the silent failure worse on any lib below the patch. Given the RFC's fluent-html.md:132 line, 4/4 pure-prior runs write the bare f.checkbox(\"tags\", tag). That shape is 16/16 correct on the prototype and 0/16 on 8.1.0, where all three boxes are ticked for every bound value. Exposure: 31 of 58 fleet repos pin fluent-html to a fixed commit or version, and 28 of those pull .ai/web-development/fluent-html.md from guidelines main through guidelines:pull, independent of the lib pin. Separately, the retroactive rename writes _id under the dev mutation gate, so a tag that was already rendered changes id silently. Required changes 1 and 2 answer both points. No §5 guardrail is violated."
guardrail_killer: null
required_changes:
  - "1. Send the retroactive rename through the mutation gate. In createFormBinding.checkbox, replace `first.tag._id = `${controlId(name)}-${first.value}`` with `first.tag.setId(`${controlId(name)}-${first.value}`)`. Delete the RFC sentence claiming the raw write is needed to avoid the gate: setId trips the gate in no normal flow. Measured on dist-alt: 384/384 matrix cells are byte-identical to the prototype, 250/250 form-for, dev-checks, forms and elements tests pass, and the render-then-rename probe now throws in dev. As written, it emits id t from the early render and t-a from the final render of the same tag, with no throw."
  - "2. Lockstep publish order and version floor. lockstep.md must say that the guidelines edit to fluent-html.md:132 is published only after the 8.1.x patch is tagged. The line itself must name the floor, e.g. `f.checkbox(name, value)` per group option (8.1.1+: checked when the field is or includes `value`), so an agent in a repo pinned below the patch can check node_modules/fluent-html/package.json. The evidence is the 0/16 vs 16/16 cell split above, plus 28 pinned repos that pull guidelines independently of their lib pin."
  - "3. The CHANGELOG 8.1.x entry must name the single-box change explicitly, answering open question 7 with yes: a valued checkbox bound to a string other than its value, or to an array that does not contain it, now renders unchecked (8.1.0 rendered it checked). The matrix has 64 such changed single-box cells. There are 0 fleet sites."
  - "4. Edit the FormBinding.label JSDoc in place (forms.ts:457) to say 'radio and checkbox groups'. Measured: f.label(name) over a group of 2 or more now renders for=t against ids t-a,t-b, so it targets no control. In 8.1.0 it targeted the first box only. 0 fleet sites use this pairing."
executed:
  - cmd: "node $R/matrix.mjs $R/dist-base $R/lib/dist"
    output: "cells 384, byte-identical 174, changed 210; valueless shapes 0 changed"
  - cmd: "node $S/idonly.mjs (hand-overridden groups)"
    output: "toggle-override 28/28 changed, 0 non-id; toggle+setId 0/28 changed"
  - cmd: "node $R/shapes.mjs (base | RFC dev | RFC production)"
    output: "base drops silently; RFC dev throws on 3 shapes; production output byte-identical to base"
  - cmd: "node $R/group.mjs (3 engines) both ways"
    output: "base 12/12 resubmit a,b,c, dup 2; RFC exact members, dup 0, label[for=terms] 18/18"
  - cmd: "node $S/attack.mjs (15 shapes + render-then-rename)"
    output: "number scalar / Set -> all checked; 'error' value collides with f.error id; render-then-rename t -> t-a silently"
  - cmd: "dist-alt (rename via setId): matrix + tests + attack"
    output: "384/384 identical; 250/250 pass; render-then-rename throws"
  - cmd: "xargs node --test < testlist.txt (proto | real 8.1.0)"
    output: "2168/2168 | 2159/2159"
  - cmd: "tsc README probe both ways; .d.ts diff; export reachability"
    output: "17 lines identical; JSDoc-only forms.d.ts; assertFormArgs not in root or ./core"
  - cmd: "claude -p x4 no guideline + repair round; x4 current guideline; x4 RFC line"
    output: "0/4 valued shape (repair: fix1 all-ticked both dists); g0 4/4 workaround 14/16; g1 4/4 bare shape: RFC 16/16, 8.1.0 0/16"
  - cmd: "fleet pin census (58 repos)"
    output: "13 #main, 31 pinned, 14 other; 28 pinned repos carry the .ai guideline"
  - cmd: "na-cent + wsf: vitest unit, tsc, render dumps both ways"
    output: "1045 both, tsc 0; dup/render na-cent 5 -> 4, wsf 4 -> 0; id-stripped identical"
  - cmd: "htmx 4.0.0-beta6 id handling; cross-file id refs"
    output: "CSS.escape at :1107,:1175,:2050, getElementById at :1048,:1058,:1456; 0 cross-file refs"
  - cmd: "census.mjs; tplforms.mjs; packages/ui ls"
    output: "1742 Form( calls, 0 dropping; template 46 calls, 0 throw, 1 valueless checkbox; ui has 0 checkbox"
  - cmd: "formbench2.mjs + bench-nocb.mjs"
    output: "group form median 17.94 -> 17.60 us (off); no-checkbox 8.33 -> 7.94 us (off); no regression"
---

# Verdict: RFC-A-07 (combined lens)

> You are an ADVERSARY. Kill this RFC through the combined lens. Default to `reject` under
> uncertainty. Reading code is not verification: execute.

Paths used below:
- `$R` = `<scratch>/wave2/RFC-A-07` (the designer's prototype; I only read and ran it).
- `$S` = `<scratch>/wave3/RFC-A-07-combined`. It holds `attack.mjs`, `idonly.mjs`, `renderprior.mjs`, `tplforms.mjs`, `bench-nocb.mjs`, `dist-alt/`, `prior/` (16 `claude -p` runs), `tsp/`, `tsp2/` and the dumps.

## What I executed

**1. Enforcement layer: runtime binding plus dev-throw. I byte-diffed the render both ways.**

The matrix reproduces exactly (`node $R/matrix.mjs $R/dist-base $R/lib/dist`):
- 384 cells: 174 byte-identical, 210 changed.
- 0 changed cells in either valueless shape.
- Example: group a,b,c bound `['a']` goes from `x* x* x*` to `x-a* x-b x-c`.

Hand-overridden groups (`$S/idonly.mjs`, 14 bound values × 2 prefixes):

| shape | cells | changed | non-id changes |
|---|---|---|---|
| `.toggle("checked", …)` only | 28 | 28 | 0 |
| `.setId` + `.toggle("checked", …)` | 28 | 0 | 0 |

So the override still wins everywhere.

Form shapes (`node $R/shapes.mjs`):
- **8.1.0:** `Form(build, build)` renders only the email input. `Form(state, build, build)` renders `<form>\n\n</form>`. `Form(build, Button)` drops the button. 0 throws.
- **RFC, dev:** the same 3 shapes throw `Form(builder, builder) drops arguments: …`, and the shape name varies per call. The 4 valid shapes are unchanged.
- **RFC, `NODE_ENV=production`:** all 7 outputs are byte-identical to 8.1.0.

Browser round trip (`node $R/group.mjs`, Chromium, Firefox, WebKit):
- **8.1.0:** 12/12 bound rows submit `tags=a&tags=b&tags=c`, with 2 duplicate ids per page.
- **RFC:** every row submits exactly its bound members (`tags=a`, nothing, `tags=b`, `tags=a&tags=c`). 0 duplicate ids. `label[for=terms]` resolves on 18/18 rows.

Types are unchanged:
- The README probe (`wrong.ts` + `valid.ts`) gives exit 2 with 17 identical diagnostic lines on both dists. The first is still TS7006, then TS2560 `Did you mean to call it?`.
- `.d.ts` diff: `forms.d.ts` changes only in the checkbox JSDoc (2 → 3 lines), and `dev-checks.d.ts` adds `assertFormArgs`.
- `assertFormArgs` is reachable from neither the root nor `./core` (both import checks return `false`).

**2. Adversarial runtime probes (`$S/attack.mjs`, 15 shapes the RFC matrix lacks).**

| shape | 8.1.0 | RFC |
|---|---|---|
| `ForEachKeyed` with the box as row root | `a* b* c*` | `a b* c` (keyed id wins) |
| number scalar `2`, group 1,2,3 | `t* t* t*` | `t-1* t-2* t-3*` (all still checked; `radio` checks only `t-2`) |
| `Set{'a'}` field | all checked | all checked (open question 2) |
| option value `"error"`, field has an error | dup 1 | dup 1 (`t-error` collides with `f.error`'s span id; radio precedent) |
| value `"New York"` | dup 1 | id `t-New York` (radio precedent) |
| `f.label("t")` over a 2-box group | `for=t` → first box | `for=t` → no control |
| one-option group | `t*` | `t*` (cardinality-dependent id, open question 5) |
| two `Form`s, lone box each | dup 1 | dup 1 (cross-form; C-83/C-84) |
| caller `.setId` on the first box after the second exists | `mine, t` | `mine, t-b` |
| **render the first box, then create the second** | early `t`, final `t t` | early `t`, final `t-a t-b`, **no throw** |

The last row is the one real defect. The raw `_id` write skips the `_e` (already rendered) fact that `assertMutable` exists to check (`src/core/dev-checks.ts:79-95`).

I patched `$S/dist-alt` so the rename calls `setId` instead:
- 384/384 matrix cells and 56/56 override cells are byte-identical to the prototype.
- 250/250 form-for, dev-checks, forms and elements tests pass.
- The render-then-rename probe now throws `<input>.setId() mutates a tag that has already been rendered`.

Hence required change 1.

**3. Pure-prior agent-fitness guess** (`claude -p --restricted --tools ''`, claude-opus-5-5, 0 tools, 1 turn). The task was an `ArticleForm` with title, email, a `published` box and a `tags: string[]` group from 3 options, prefilled and reused as the 422 re-render.

| condition | runs | group shape written | tsc (8.1.0 = RFC) | correct cells (4 bound values) 8.1.0 → RFC |
|---|---|---|---|---|
| no guideline | 4 | 0/4 valued. 4/4 `f.checkbox("tags")` + `.setValue/.value(tag)` + hand checked + hand id | 3, 11, 3, 7 errors (identical) | n/a (do not compile) |
| no guideline, one tsc repair round | 4 | 0/4 valued. fix1 compiles to 1 TS2559 (`.checked(bool)`, the variant) | 1, 4, 3, 2 | fix1 0/4 → 0/4 (all ticked); fix2-4 throw at render |
| current guideline section (g0) | 4 | 4/4 `f.checkbox("tags", tag)` + a workaround (2× `.toggle("checked", has)`, 2× strip `tags` from bound values) | 0 | 14/16 → 14/16; dup 2 → 0 |
| RFC's line 132 (g1) | 4 | 4/4 bare `f.checkbox("tags", tag)` | 0 | **0/16 → 16/16**; dup 2 → 0 |

The 2 g0 misses build `new Set("culture")` from a scalar 422 body. That is the app's own workaround, and it is identical on both dists.

What this shows:
- With the RFC line, the taught guess works, is shorter, and needs no workaround.
- The same guess on 8.1.0 is wrong in every cell.
- The no-guideline guess, `f.checkbox(name).setValue(v)`, is outside the RFC's reach (residual below).

Teaching cost: line 132 grows from 11 to 23 words (section 413 → 425), with a net of 0 lines.

The dev-throw catches 0/16 generations; none wrote a dropping `Form()` shape.

**4. Lane and breaking check.**

Lib tests:
- Prototype: 2168/2168. Real 8.1.0 dist: 2159/2159.
- `form-for`: 33/33 on the prototype vs 24/24 on 8.1.0.

na-cent and website-sales-funnel (the copies in `$R`, fluent-html symlinked to the prototype):

| repo | unit tests | tsc | duplicate ids per render | other |
|---|---|---|---|---|
| na-cent | 1045 pass both ways (+1 wave2 dump harness that needs `C16_OUT`) | 0 lines | 5,5,5 → 4,4,4 (`bracket-active` ×2 gone) | id-stripped dump byte-identical |
| website-sales-funnel | (not re-run) | (not re-run) | 4,4,4,4 → 0,0,0,0 | `humanReview` checked `[true,true,false,true]` both ways; id-stripped dump byte-identical |

The new ids carry `:` (`bracket-active-preset:profit`). htmx 4.0.0-beta6 handles them safely:
- it builds selectors with `CSS.escape` (`htmx.js:1107`, `:1175`, `:2050`);
- it looks ids up with `getElementById` (`:1048`, `:1058`, `:1456`).

Cross-file references to the renamed ids (`#name`, `for=`, `getElementById`, `[id=]`, `setFor`) in competition, website-sales-funnel, varnoska and na-cent: 0 hits.

Fleet census (`node $R/census.mjs`):
- 1,742 `Form(` calls in 895 files, 0 in a dropping shape.
- 45 one-argument and 16 two-argument `checkbox` calls, matching the RFC.

Bench, medians over 30 interleaved rounds × 2000:

| form | devChecks off (8.1.0 → RFC) | devChecks on (8.1.0 → RFC) |
|---|---|---|
| 20-option group | 17.94 → 17.60 µs | 19.41 → 18.91 µs |
| 22 inputs, no checkbox | 8.33 → 7.94 µs | 8.68 → 8.12 µs |

No regression.

**5. Instruction-set grep.**
- projects-template has 1 `checkbox` call: `register.view.ts:44`, valueless, untouched by this RFC.
- `$S/tplforms.mjs` finds 46 `Form(` calls: 15 `(build)`, 4 `(state, build)`, 27 other or empty. 0 would throw.
- `packages/ui/src/form` holds Button, FormField, Select, TextInput and Textarea: 0 checkbox components.
- No layer above the lib solves either the group `checked` or the ids. Both are computed inside `createFormBinding` (`forms.ts:504-509`).
- Guidelines, the lib `CLAUDE.md`, the README and the template `CLAUDE.md`: the only hit for `toggle("checked"`, `checkbox group` or `checkbox(name, value` is the line this RFC edits.

## Attack

1. **Version skew in the guideline turns a fix into a regression for pinned repos.** This is the strongest point. The g1 line teaches the bare shape, and agents follow it 4/4. On a lib without the patch, that shape ticks every box in 16/16 cells: the same edit-form corruption the RFC exists to remove, now taught by the guideline itself. Today's line produced workarounds that were right in 14/16 cells.
   - In the fleet, `scripts/guidelines.sh pull` tracks guidelines `main` regardless of the lib pin.
   - 31/58 repos pin a fixed commit or version (na-cent and fl-um `#9d86871`, varnoska `#524b562`, storysell `#16bbcae`), and 28 of them carry the vendored `.ai/web-development/fluent-html.md`.
   - A shape that compiles on both versions fails silently on the old one, which a new-API guideline edit does not (it fails with a TS error). This is answered by publish order plus a floor in the line (required change 2), not by dropping the edit. The edit is what moves g1 from 0/16 to 16/16.
2. **The rename skips the lib's own mutation invariant.** Measured above. It takes one line to fix, and the fix leaves every normal-flow byte unchanged (required change 1).
3. **The RFC fixes the taught shape, not the prior one.** Without the guideline, 4/4 runs write `f.checkbox("tags").setValue(tag)` plus a hand `checked`. After one repair round, 0/4 reach the valued shape. One (fix1) compiles to `.checked(bool)`, because `setChecked`'s TS2551 suggests the `checked:` variant method. It ticks all three boxes on both dists.
   - This does not block. The fleet's 14/14 groups and the 8/8 guideline-informed runs use the valued shape.
   - The residual belongs to the setter-trap family (a `setChecked` → `.toggle("checked", on)` trap, as in RFC-A-04), not to this binding.
4. **Rules that diverge from `radio`.** A group bound to a number scalar ticks every box (`Boolean` kept), while `radio` ticks one. `Set` fields tick all. The RFC's table documents the number rule, which protects valued boxes bound to 0/1 flags. Both are 0-site edges; I note them and do not require a change.
5. **The single-box byte change is not always "never worked".** Example: `f.checkbox("x", "1")` bound to a DB string `"t"` was checked and becomes unchecked. 0 fleet and 0 template sites, but the CHANGELOG must say so (required change 3).
6. **Labels.** `f.label(name)` over a group now targets nothing. Before, it targeted the first box, which was also wrong. 0 fleet sites. The JSDoc must say so (required change 4).
7. **Is the dev-throw dead weight?** It catches 0/1,742 fleet calls and 0/16 generations, and its only source (the README) is rewritten. It costs one guarded call (bench above), adds no prose, and its message names the one-builder fix on line 1. It is kept as a cheap net for JS and `as any`.

## Does it survive?

**Survives with changes.**

The binding fix is measured end to end: 3 engines, 2 live repos, the 384-cell byte matrix, and the lib suite. No valid shape breaks:
- valueless boxes: 0/64 cells change;
- fully overridden groups: 0/28;
- `toggle`-only groups: id-only changes;
- tsc and `.d.ts` stay identical apart from the JSDoc.

That fits the 8.1.x lane, with the emitted bytes changing only where they never worked (duplicate ids, and membership that was never computed). The dev-throw cannot fire on code that type-checks, and production output is byte-identical.

The objection that would have killed the RFC is the guideline skew and the gate bypass. Required changes 1 and 2 rebut it, and 3 and 4 close the documentation gaps. Implementers apply all four before shipping.

Open question 3 (C-84 ordering) goes to curation as a constraint on C-84. A per-render duplicate-id check would still find 4 duplicates per na-cent bracket render after this RFC (`bracket-name`, repeated `f.input` rows), so C-84 has to land after this RFC or be bundled with it.

## Guardrail check

1. Zero runtime deps: pass. No import added.
2. Sync hot path: pass. Bench medians are equal or lower for both a group form and a checkbox-free form, with devChecks on and off.
3. Escape by default: pass. Ids pass through the existing attribute escaping, as `radio` ids do.
4. Type-safety: pass. 0 type changes, and the tsc output is identical both ways.
5. Instruction set: pass. Nothing exists one layer up (template 0, `packages/ui` 0), and no component is added.
6. Pure core: pass.
7. Converge: pass. No new surface. `radio` and `checkbox` now share the per-value id rule.
8. Naming: n/a.
9. Class strings: n/a. Class attributes in both live-repo dumps are identical (id-stripped diff empty).
10. Runtime grammar: pass. No `hx-*` change, and `:` ids are handled by `CSS.escape` and `getElementById` in beta6.
11. Codemod-first: n/a. 8.1.x, and no valid shape breaks.
12. Enforcement over prose: pass. Net 0 lines, +12 words on one line. Change 2 adds a version floor of a few words.
13. Append-only styling: n/a.
