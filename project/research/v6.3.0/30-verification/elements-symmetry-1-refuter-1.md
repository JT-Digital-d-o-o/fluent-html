# Verdict: elements-symmetry-1 — NOT refuted (finding CONFIRMED)

**Finding:** InputTag lacks the submit/image attribute family that ButtonTag has (formaction/formmethod/formenctype/formtarget, plus src/alt for type=image).

**Mode:** refute-by-code-reading. I attempted to find a check, alternate typed path, or intentional-exclusion semantic that would make this a non-issue. I found none.

## Evidence checked

1. **InputTag field list and setters** (`src/elements/forms.ts:15-119`): the typed fields are `type, placeholder, name, value, accept, min, max, step, pattern, minlength, maxlength, autocomplete, inputmode, capture, list, dirname`. No `formaction`, `formmethod`, `formtarget`, `formenctype`, `src`, or `alt`. The `defineSchemaKeys(InputTag, [...])` call at forms.ts:119 confirms the rendered-attribute schema matches — none of the missing attributes are registered.

2. **ButtonTag has the full family** (`src/elements/forms.ts:233-302`): `formaction?/formmethod?/formtarget?/formenctype?` fields (237-240) with `setFormaction/setFormmethod/setFormtarget/setFormenctype` (280-299), registered in `defineSchemaKeys` (302). The asymmetry is real, and the presence on ButtonTag rules out "intentionally excluded from the library" as a refutation.

3. **The library explicitly supports the affected input types**: `InputType` in `src/elements/html-types.ts:5-9` includes `'submit'`, `'image'`, and `'button'`. So `Input('submit')` / `Input('image')` are first-class, typed factory calls — the types where the HTML spec applies `form*` (and, for `image`, requires `src`/`alt`). These are not fringe values the library declined to model.

4. **No alternate typed path exists.** The narrowing interfaces (`NumericInputTag`/`DateTimeInputTag`/`NoMinMaxInputTag`, forms.ts:122-138) only adjust min/max/step signatures; `Input('submit')`/`Input('image')` resolve to `NoMinMaxInputTag`, which adds nothing. The base `Tag` class (`src/core/tag.ts`) offers only the generic `addAttribute(key, value)` escape hatch (tag.ts:188) — exactly what the project's guidelines brand as an anti-pattern for standard props ("Specialized tag methods — never use addAttribute for standard props"). `setSrc`/`setAlt` exist only on media/embedded/document element classes, not InputTag.

5. **Dist behavior matches**: existing tests exercise `Button(...).setFormaction(...)` etc. (dist/test/forms.test.js:134, 225); no test or dist symbol provides an InputTag equivalent.

## Refutation attempts that failed

- *"Maybe input type=submit/image is discouraged in favor of Button"* — no such guard: `InputType` includes both values with dedicated overload routing, so the library models these inputs; it just models them incompletely.
- *"Maybe a mixin/base-class provides form* setters"* — grep over `src/` shows `formaction|formmethod|formenctype|formtarget` appear only in ButtonTag's implementation.
- *"Maybe defineSchemaKeys picks up ad-hoc fields"* — the schema key list is explicit and closed; unlisted fields don't render.

## Verdict

**refuted = false.** The defect (API-completeness gap) is positively confirmed by direct code reading: `Input('submit').setFormaction(...)` does not typecheck today, and `addAttribute` is the only way to emit `formaction`/`src`/`alt` on an `<input>`. The evidence anchors (forms.ts:16, 237-240, 280-299, 122-138) are all accurate. Severity is design-consistency/DX, not a runtime bug, but within this discovery track's scope it stands as stated. The proposal (mirror ButtonTag setters; optionally narrow via the existing overload machinery) is consistent with existing patterns.
