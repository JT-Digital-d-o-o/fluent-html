# Verdict: elements-symmetry-1 — CONFIRMED (not refuted)

**Finding:** InputTag lacks the submit/image attribute family that ButtonTag has (formaction/formmethod/formenctype/formtarget, plus src/alt for type=image).

**Mode:** refute-by-reproduction. Result: **reproduced at runtime against dist/**. `refuted = false`.

## Reproduction

Probe (`node`, ESM) against `/Users/tony/jt-digital/fluent-html/dist/src/index.js`:

```
Input.setFormaction typeof: undefined
Input.setFormmethod typeof: undefined
Input.setFormtarget typeof: undefined
Input.setFormenctype typeof: undefined
Input.setSrc typeof: undefined
Input.setAlt typeof: undefined
Button.setFormaction typeof: function
field-assign render: <input type="submit">
addAttribute render: <input type="submit" formaction="/alt">
```

## Source verification

- `src/elements/forms.ts:16-31` — `InputTag` field list has no `formaction`/`formmethod`/`formtarget`/`formenctype`/`src`/`alt`; no such setters anywhere in the class (lines 33-117).
- `src/elements/forms.ts:119` — `defineSchemaKeys(InputTag, [...])` omits them too, so even direct field assignment (`tag.formaction = "/alt"`) silently drops the attribute at render time (verified above: renders `<input type="submit">` with no formaction). This is *worse* than the finding stated — there is no property-assignment workaround either.
- `src/elements/forms.ts:237-240, 280-299, 302` — `ButtonTag` has all four `form*` fields, setters, and schema keys.
- `setSrc`/`setAlt` exist on other tags (`media.ts`, `embedded.ts`, `links.ts`, `document.ts`) but none of those apply to `InputTag`.

## Assessment

- HTML spec applies `formaction`/`formenctype`/`formmethod`/`formnovalidate`/`formtarget` to submit buttons **and** `<input type="submit">` / `<input type="image">`; `src`/`alt` are required content attributes for `<input type="image">` (alt is a11y-critical). The asymmetry is real.
- Only escape hatch is `addAttribute`, which the project's guidelines explicitly brand as an anti-pattern for standard props.
- Evidence anchors in the finding all check out; severity is if anything understated (schema-key omission means the typed-field path renders nothing).

**Verdict: CONFIRMED. Not refuted.**
