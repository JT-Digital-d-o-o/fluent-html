# Refuter verdict: elements-symmetry-5

**Verdict: CONFIRMED (refutation failed)**

## Finding restated

`<ol start/type>` and `<li value>` have no typed setters — `Ol()`/`Li()` return plain `Tag` — while the companion boolean `reversed` (whose only host element is `<ol>`) is first-class via the closed `BooleanAttribute` union and `.toggle()`.

## Verification of each factual anchor

1. **Ol/Li return plain Tag** — confirmed. `src/elements/lists.ts:9-15`: `Ol` and `Li` are `El("ol"|"li", ...)` returning `Tag`; no `OlTag`/`LiTag` class exists anywhere in `src/` (grep for `OlTag|LiTag|setStart` returns nothing; the only `setValue` hits are on DataTag/ProgressTag/MeterTag/Input/Option/Textarea in `data.ts` and `forms.ts`).

2. **`reversed` is typed** — confirmed. `src/elements/html-types.ts:227`: `'reversed'` is a member of the closed `BooleanAttribute` union, and the JSDoc above it states `.toggle()` is "the only way to set any of them". So `Ol().toggle("reversed")` is fully typed while `Ol().addAttribute("start", "42")` is the only path for `start`.

3. **Sibling asymmetry** — confirmed. `src/elements/tables.ts` gives `ThTag` typed `setColspan`/`setRowspan`/`setScope`/`setHeaders`/`setAbbr` registered via `defineSchemaKeys`, and `data.ts` gives numeric `setValue` to Progress/Meter/Data — i.e. the exact machinery the proposal asks for (`defineSchemaKeys` + numeric setters) already exists and is used for comparable numeric content attributes.

## Refutation attempts (all failed)

- **Alternative typed path?** No. `Tag` exposes only stringly `addAttribute(key, value)` (`src/core/tag.ts:188`); there is no per-element attribute schema, no generic typed `setAttr`, nothing added in the 6.2.0 Track-B element-completeness commits for lists.
- **Deliberate exclusion?** No comment in `lists.ts`, `proto.ts`, `html-types.ts`, README, or docs documenting a decision to leave list-numbering attributes untyped. The `BooleanAttribute` JSDoc even frames the union as covering "the full set of standard HTML boolean attributes" — completeness was the stated goal for the boolean half, which makes the missing non-boolean half an oversight, not a policy.
- **Non-issue by project standards?** The opposite: the project's own guideline ("Specialized tag methods — never use addAttribute for standard props") is unsatisfiable for `ol start` / `ol type` / `li value` today — there is no specialized method to prefer.

## Notes on the proposal

Sound and consistent with existing patterns (`defineSchemaKeys` like `ColTag`/`ThTag`). Minor nit: `<ol type>` values are case-sensitive (`'1'|'a'|'A'|'i'|'I'`), which the proposal already gets right. `setStart(start?: number)` matches the optional-param convention used elsewhere (e.g. `DetailsTag`, `ProgressTag`).

**Severity framing**: a DX-consistency gap, not a runtime bug — `addAttribute` works as an escape hatch. But by the elements-symmetry track's own standard (typed coverage of standard attributes), the defect is real and precisely stated.
