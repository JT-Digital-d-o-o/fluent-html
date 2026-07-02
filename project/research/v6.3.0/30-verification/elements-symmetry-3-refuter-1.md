# Refuter verdict — elements-symmetry-3

**Finding:** `.toggle()` is add-only — `toggle(name, false)` cannot remove a previously set boolean attribute, breaking last-call-wins.

**Verdict: NOT REFUTED (finding confirmed).** Confidence: high.

## What I verified (fresh code reading + runtime repro)

1. **Implementation is add-only** — `src/core/tag.ts:220-229`: `toggle(name, condition = true)` pushes onto `this.toggles` only when `condition` is true; the false branch is a pure no-op. Nothing anywhere on `Tag` mutates `toggles` besides this push.

2. **Serialization never removes** — `src/render/serialize.ts:295-308`: the toggle loop validates names, dedupes via a `seen` set, and skips names already present in the attribute bag. Dedupe-only; there is no subtraction path.

3. **Runtime repro against dist** (`dist/src/index.js`):
   - `render(Input().toggle('required').toggle('required', false))` → `<input required>` — the false call is silently ignored.
   - `render(Input().toggle('disabled').when(true, t => t.toggle('disabled', false)))` → `<input disabled>` — exactly the preset/`.when()` re-enable trap the finding describes.

4. **No escape hatch exists.** `.toggle()` is the single boolean-attribute path (serialize.ts comment: "the single `.toggle()` path"); elements expose no dedicated boolean setters (grep of `src/elements/` finds only doc examples using `.toggle()`). The attribute-bag precedence rule (`serialize.ts:305`, bag entry suppresses the bare toggle) cannot emulate removal either: for HTML boolean attributes, presence = true, so even `addAttribute('required', '')` renders the attribute present. Once toggled on, the attribute cannot be rendered absent by any later call.

5. **The asymmetry claim holds.** `setAttribute` overwrites (`tag.ts:193`, `attributes[key] = value`), `setStyle` replaces (JSDoc at `tag.ts:139-144` states the set*/add* convention explicitly), dedicated `_sk` fields are plain assignments. The boolean path is the only primitive where a later call cannot override an earlier one.

## Refutation angles attempted, and why they fail

- **"Working as documented"** — the JSDoc says "Add a boolean HTML attribute (toggle). Conditionally add with the second parameter" (`tag.ts:213`), so implementation matches its own doc. But the doc itself labels the method "(toggle)" while specifying add semantics — that contradiction is the finding, not a defense of it. The finding is filed as a design/symmetry issue, not a spec-violation bug; documented-as-add does not make the trap a non-issue, it makes it a documented trap.
- **"`toggle` isn't `set*`, so the last-call-wins convention doesn't apply"** — technically true, but the method carries neither prefix, is named like a switch, and is the *only* way to control boolean attributes, so a caller composing `.apply()` presets or `.when()` branches has no correct alternative. The convention argument explains the gap; it does not neutralize the consequence.
- **"Tests lock in the current behavior"** — they do not lock in the disputed case. `test/attributes.test.ts:73-77` covers single-call conditional add and mixed conditions on *distinct* names; `test/type-safety.ts:314` is a single false call. No test exercises same-name true-then-false, so the proposed fix (`this.toggles = this.toggles?.filter(n => n !== name)` on false) would break no existing test or documented example.

## Notes on the proposal

The one-line fix restores switch semantics with no serialize change needed (dedupe already handles repeated trues). Only behavioral delta is the previously-unspecified same-name override case. JSDoc and README (`README.md:2411` "Add boolean attribute") would need a one-line wording update alongside it.
