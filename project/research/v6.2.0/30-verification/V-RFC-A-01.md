---
rfc: RFC-A-01
lens: [type-safety, dx, correctness, breaking-change]
verdict: survives-with-changes
confidence: 0.74
killer_objection: >
  P4 re-introduces `SelectTag.setMultiple(multiple?: boolean)` — a named boolean setter that
  v6.0.0 DELETED on purpose. CHANGELOG 6.0.0 lists `setMultiple` by name among the removed
  setters, `'multiple'` is in the closed `BooleanAttribute` union (html-types.ts:154), and the
  `.toggle("multiple")` path already ships. The fluent-html-eslint-plugin `prefer-toggle` rule
  even codifies the invariant verbatim: "Boolean attributes have no named setters in v6; they
  render bare via `.toggle()`." Adding `setMultiple` is a §11.6 CONVERGE violation (two ways to
  emit one bare attribute) AND silently reverses a shipped v6 breaking decision. The rest of the
  RFC targets genuine binding-only gaps and survives once this is cut.
required_changes:
  - >
    DROP `SelectTag.setMultiple(multiple?: boolean): this` and the `multiple?: boolean` schema
    field entirely. v6 emits bare `multiple` via `.toggle("multiple")` (already in
    `BooleanAttribute`, html-types.ts:154); a named setter for it was removed in v6.0.0 and is
    re-flagged by the eslint `prefer-toggle` rule. Remove `setMultiple` and `SelectTag.multiple`
    from the `api_surface` list.
  - >
    REWRITE `f.multiselect` to build the select with `Select().setName(name).toggle("multiple")`
    (NOT `.setMultiple(true)`), then `markInvalid`. Update the P4 prose and the
    `SelectTag.setMultiple(true) → <select multiple>` wire-format line accordingly.
  - >
    FIX the source-path citations: every `aria-types.ts:NN` reference must be
    `src/core/aria-types.ts` (the file lives under `src/core/`, not `src/elements/`). Confirmed
    keys: `live` (off|polite|assertive), `atomic` (boolean), `describedby` (string), `invalid`
    (grammar|spelling|boolean) all exist at src/core/aria-types.ts:72/89/98/76.
  - >
    REMOVE the `views.md` and `fluent-html.md` entries from `guideline_updates`/Docs impact, OR
    relabel them as guideline-repo files. Neither exists in the library repo (lib docs are
    README.md / FLUENT-STYLING.md / TAILWIND-SETUP.md / CHANGELOG.md). Per [v6-docs-surface] the
    multiselect repeated-key-array-body note MUST land in the lib's OWN README/JSDoc, not only a
    guideline file.
  - >
    The README has NO existing `Form<T>` section to "extend" (grep: zero `Form<` hits in
    README.md). Change the docs task from "extend the Form<T> section" to "add a Form<T> section
    to README documenting the full binding (input/textarea/select/checkbox/radio/hidden/error
    SHIPPED 6.1.1 + the 6.2.0 additions)", so the documented idiomatic surface is complete.
  - >
    CONVERGE check on `f.field` vs `Options`: keep exactly ONE chainable way to attach options
    to a standalone `<select>`. The RFC ships BOTH `Select().options(items, selected)` (method)
    and `Select(Options(items, {...}))` (children). Pick the method form as canonical
    (parity with other chainable builders) and document `Options(...)` only as the
    children-position helper for non-Select hosts; do not present them as interchangeable for
    `<select>` (avoids a "two ways" smell).
  - >
    `f.field` aria-describedby: when a hint applies you set `control.setAria({ describedby })`,
    but `f.input` already calls `markInvalid` which sets `describedby` to the ERROR id when the
    field is errored. Specify precedence explicitly: errored ⇒ error-id wins, hint suppressed,
    do NOT overwrite. The current draft only handles this in the slot selection; make the JSDoc
    + impl state that the hint `describedby` is applied ONLY in the no-error branch (else the
    second `setAria` clobbers `markInvalid`'s describedby).
---

## Attack

I came to kill this and pushed hardest on already-shipped, convergence, and breaking-change-mismarked-additive, since those are instant rejects.

**Already-shipped (CHANGELOG 6.0.0→6.1.1, full forms.ts read).** Verified each P against source:
- P1 `formError` / `FormState.formError`: `FormState<T> = { values?; errors? }` (forms.ts:343) — no third channel. `ErrorBag<T>` is strictly `keyof T`-keyed (forms.ts:340). Not shipped. Real gap.
- P2 `f.field`: `FormBinding<T>` (forms.ts:353-367) has input/textarea/select/checkbox/radio/hidden/error — no labelled composite. Not shipped.
- P3 bulk `f.hidden`: `hidden(name, value)` is single-field only (forms.ts:364/415). Not shipped.
- P4 `Options`/`buildOptions`/`multiselect`: the option-map lives privately inside `select` (forms.ts:396-404); `SelectTag` exposes only `name`/`size` (forms.ts:449-462). Not shipped.
So the FIVE problems are real binding-only gaps (a standalone component cannot type `name` to `keyof T` nor read `state`). None re-proposes 6.1.x. PASS.

**Killer — P4 `SelectTag.setMultiple` reverses a v6 breaking decision (CONVERGE + breaking-mismark).**
CHANGELOG 6.0.0 (line 181): "Every named boolean setter is removed — `setChecked` … `setMultiple` … Use `.toggle("name")`". `'multiple'` is a member of the closed `BooleanAttribute` union (html-types.ts:154), so `.toggle("multiple")` is the shipped, sanctioned, single way to emit bare `multiple`. The eslint plugin enforces this: prefer-toggle's CHANGELOG says "Boolean attributes have no named setters in v6; they render bare via `.toggle()`." Adding `SelectTag.setMultiple(multiple?: boolean)` creates a SECOND emitter for one bare attribute (§11.6) and resurrects exactly the named-setter pattern v6 deleted — and the RFC marks the whole thing "additive", which understates that this row contradicts a shipped invariant. This alone is a required cut; with `setMultiple` gone and `multiselect` routed through `.toggle("multiple")`, P4 is clean.

**Type-safety.** Mostly solid. `keyof T & string` names on `field`/`hidden({…})`/`multiselect`; `FieldOpts` uses closed `InputType`/`AutocompleteHint`; `SelectOptionInput` is a closed shape; `selected: string | readonly string[] | null` is honest; `formError` is a closed optional field, not a `_form` sentinel (correctly rejected in Alternatives). No `any`, no bare `string` where literals belong. The one wrinkle is the `f.field` describedby clobber (see required change) — a correctness, not a type, hole.

**§11.7 class-vocab lockstep.** Genuinely N/A: every emitter is HTML attrs + structural `<div>/<label>/<span>/<option>`, zero Tailwind, exactly like the shipped `f.error()` span. No vocab.ts row, no extractor/eslint change. Confirmed `pre("select", "select")` in vocab is the unrelated `select-*` utility, not engaged here. PASS — this is the RFC's strongest guardrail.

**§11.3 escape.** `formError`/hint/label are text children (escaped); option value/label + hidden name/value flow through existing `setValue`/`setName`/`setFor`/`setAria` attr escaping. No new sink. `String(v)` on hidden/option values is pre-escape stringification, fine. PASS.

**Docs accuracy (§11.8) holes.** `aria-types.ts` cited at the wrong path (it is `src/core/aria-types.ts`). `views.md`/`fluent-html.md` are guideline-repo files, not lib docs — and the lib README has NO `Form<T>` section to "extend" (zero hits). These are docs-task inaccuracies that must be corrected so the update actually lands on the lib's own surface per [v6-docs-surface].

**Convergence smell (non-fatal).** `Select().options(...)` (method) AND `Select(Options(...))` (children) are two ways to put options on a free `<select>`. Routed through one `buildOptions` so OUTPUT converges, but the AUTHORING surface is doubled — tighten the docs to one canonical chainable path.

## Does it survive?

Survives WITH CHANGES. The core thesis is correct: these are binding-only gaps a standalone component can't fill, none is shipped, and the zero-Tailwind emitters keep §11.7 untouched. But it cannot ship as drafted because P4 re-introduces `SelectTag.setMultiple` — a named boolean setter v6.0.0 deliberately removed and the eslint plugin actively discourages — which is both a CONVERGE violation and a shipped-decision reversal mismarked as plain "additive". Cut `setMultiple`/`SelectTag.multiple`, route `multiselect` through `.toggle("multiple")`, fix the three docs/path inaccuracies, pin the `f.field` describedby precedence, and pick one canonical option-attach path. With those, P1–P4 are a coherent, type-safe, convergent completion of the typed binding and ship to 6.2.0.

Default-to-reject was considered: the killer is a real CONVERGE/breaking-mismark, but it is surgically removable (one row + one impl line) without touching the RFC's thesis or its other four parts, so the proportionate verdict is survives-with-changes, not reject.

## Guardrail check

- §11.1 zero-deps — PASS. Pure factories/emitters over in-scope primitives; no runtime dep.
- §11.2 ssr-only — PASS. Synchronous string building; no async on render.
- §11.3 escape-by-default — PASS. All values route through existing escaped setters/text children; no new sink.
- §11.4 type-safety — PASS (with the `f.field` describedby precedence fix as a correctness nit). `keyof T & string` names, closed `FieldOpts`/`SelectOptionInput`, `formError` closed field not a sentinel, no `any`/bare-string.
- §11.5 compat — FAIL as drafted, PASS after change. `setMultiple` is mismarked "additive": it reverses the v6.0.0 named-boolean-setter removal and adds a second `.toggle("multiple")` path. Remove it; the remaining widening (`f.select` accepts `SelectOptionInput`, `SelectOption ⊆ SelectOptionInput`) is genuinely non-breaking.
- §11.6 idioms/CONVERGE — FAIL as drafted, PASS after change. `setMultiple` duplicates `.toggle("multiple")`; the `Select().options` vs `Options()` double authoring path needs one canonical form documented. Otherwise options object, set/add semantics, and zero-inline-JS are respected.
- §11.7 class-string contract — PASS / N/A by construction. Zero Tailwind class surface; no vocab/extractor/eslint row.
- §11.8 docs/guideline-sync — FAIL as drafted. `aria-types.ts` path wrong (`src/core/`), `views.md`/`fluent-html.md` are guideline files not lib docs, and there is no existing README `Form<T>` section to extend. Correct the docs tasks to land on the library's own README/JSDoc.
