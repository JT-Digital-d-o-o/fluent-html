---
id: RFC-A-01
track: A
title: "Form<T> builder completion — form-level error, typed field shell, bulk hidden, option helpers, multiselect"
resolves: [#7, #24, #34, #39, #59]
api_surface:
  - "FormState<T> += `formError?: string`  (widened type)"
  - "FormBinding<T>.formError(): View  (new)"
  - "FieldOpts (type)"
  - "FormBinding<T>.field(name: keyof T & string, opts: FieldOpts): Tag  (new)"
  - "FormBinding<T>.hidden(values: Partial<Record<keyof T & string, string | number | boolean>>): View  (new overload)"
  - "FormBinding<T>.multiselect(name: keyof T & string, options: readonly SelectOptionInput[]): SelectTag  (new)"
  - "SelectOptionInput (type)"
  - "buildOptions(items, selected?, placeholder?): View[]  (internal — single source of <option> truth)"
  - "Options(items: readonly SelectOptionInput[], opts?: { selected?: string | readonly string[] | null; placeholder?: string }): View  (new)"
  - "HiddenFields(values: Record<string, string | number | boolean>): View  (new)"
  - "SelectTag.options(items: readonly SelectOptionInput[], selected?: string | readonly string[] | null): this  (new)"
breaking: additive
ships_to: "6.2.0"
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, additive-only, instruction-set, class-vocab-sync, guideline-sync]
guideline_updates:
  - lib README/docs/JSDoc — ADD a Form<T> section (none exists today) documenting the full binding (input/textarea/select/checkbox/radio/hidden/error SHIPPED 6.1.1 + the 6.2.0 additions)
  - lib README/JSDoc — multiselect submits a repeated-key array body (x=a&x=b → array body field); the note lands on the lib's OWN README/JSDoc, not a guideline file
  - CHANGELOG 6.2.0 entry
  - no extractor/eslint README change (zero Tailwind class surface)
impact: high
effort: L
depends_on: []
status: proposed
---

# RFC-A-01: Form<T> builder completion

> Adversary verdict: **survives-with-changes** (confidence 0.74). Killer objection (resolved
> below): *P4 re-introduced `SelectTag.setMultiple(multiple?: boolean)` — a named boolean
> setter v6.0.0 deliberately DELETED (CHANGELOG:181), with `'multiple'` already a member of
> the closed `BooleanAttribute` union (`src/elements/html-types.ts:154`) and `.toggle("multiple")`
> the sanctioned single path the eslint `prefer-toggle` rule enforces. Adding it was a §11.6
> CONVERGE violation + a shipped-decision reversal mismarked "additive".* **Resolution: cut
> `setMultiple` and `SelectTag.multiple` entirely; `f.multiselect` and `SelectTag.options` now
> route through `.toggle("multiple")`.** All seven required changes are folded in; see
> **Adversary review & resolutions** at the end.

## Problem

The 6.1.1 typed `Form<T>` binding (`src/elements/forms.ts:353-447`) ships the per-field
factories `input`/`textarea`/`select`/`checkbox`/`radio`/`hidden`/`error` — each name
constrained to `keyof T`, values/errors auto-wired, `aria-invalid`/`aria-describedby`
linkage built in (`markInvalid`, forms.ts:377-380). It is the right shape, but it stops at
single primitive controls. Real apps wrap it in hand-rolled, untyped machinery for five
recurring jobs the binding cannot express. Concrete file:line evidence:

1. **No form-level / cross-field error slot.** `ErrorBag<T> = Partial<Record<keyof T &
   string, string>>` (forms.ts:340) is strictly field-keyed, and `FormState<T> = { values?;
   errors? }` (forms.ts:343) has no third channel. So errors that have **no owning
   `keyof T`** — "invalid credentials" (form-level) and "passwords do not match"
   (cross-field) — cannot be carried by the typed state at all. The app workaround is a
   **second, parallel, untyped** `error?: string` page prop threaded alongside the typed
   `FormState<T>` (planet-positive-sport auth: `auth.controller.ts:112/214` form-level,
   `:192` cross-field; rendered via an ad-hoc `IfThen(props.error, …)` Alert above the
   form). Two error channels for one form is exactly the divergence §11.6 forbids.

2. **No labelled-field composite.** Every form re-hand-rolls `Div(Label().setFor(name),
   control, errorSlot)` and manually re-pipes value/required/placeholder into a pre-built
   control — losing the typed name in the process. See pps `auth.components.ts:27`
   (`AuthFormField`) and the template `packages/ui/src/form/FormField.ts:37` (`input: View`
   + `error: string`, fully untyped). pps's variant ships **no per-field error slot at
   all**, so field errors silently vanish.

3. **No bulk hidden.** pm-gui hand-writes `hiddenFields(hidden: Record<string,string>) =
   Object.entries(hidden).map(([k,v]) => Input().setType('hidden').setName(k).setValue(v))`
   (`scope.comments.view.ts:22-24`) and spreads it three times. `f.hidden(name, value)`
   (forms.ts:364) is single-field only.

4. **No reusable `<option>` builder.** The option-map-with-selected logic exists **only
   privately** inside `f.select` (forms.ts:396-404) and is unreachable for a free-standing
   `<select>`. pps re-implements it twice: `shared/components/forms/form.ts:82`
   (`StyledSelect`, with a hand-rolled placeholder `Option`) and `admin/events/events.view.ts:314`.

5. **No multiselect.** `SelectTag` (forms.ts:449-462) exposes only `name`/`size` — no
   array-valued `selected` wiring. `.toggle("multiple")` works (it is the shipped, sanctioned
   way to emit bare `multiple` — `'multiple'` ∈ `BooleanAttribute`, `src/elements/html-types.ts:154`),
   but the bound value can't be an array, so pps `events.view.ts:314` hand-maps options into a
   multi-participant select with **no selected wiring**.

All five are genuine **binding-only** gaps: a standalone component cannot type `name` to
`keyof T` nor read `state.values`/`state.errors`. None is shipped — verified against the
full `forms.ts` read and `CHANGELOG.md` 6.0.0→6.1.1 (line 181 lists `setMultiple` among the
**removed** named boolean setters; line 958 lists `multiple` only as a `.toggle()`-able raw
input attr; there is no array-`selected` wiring, no composite, no bulk-hidden, no form-level
error). They ship as **one** convergent surface so the binding is complete instead of
half-built — and (per the adversary) **without** resurrecting any deleted named setter.

## Proposed API

All additions live in `src/elements/forms.ts`. **No new imports** beyond the two new types;
`Div`/`El`/`Empty`/`Label`/`Input`/`Select`/`Option` and the `setRole`/`setAria`/`setFor`/
`addChild`/`toggle` primitives are already in scope (`src/core/tag.ts:220,303,389,429`,
forms.ts:1-7). Every emitter produces **zero Tailwind classes** — exactly like today's
`f.error()` span; the styled shells stay in `@jtdigital/ui` (instruction-set memory).

### P1 — form-level error slot

```ts
// forms.ts:343 — widen (purely additive optional field; { values, errors } callers unaffected)
export type FormState<T> = { values?: Partial<T>; errors?: ErrorBag<T>; formError?: string };

// forms.ts:366 — new member on FormBinding<T>, after `error`
export interface FormBinding<T> {
  // …existing members…
  /**
   * The form-level / cross-field error (an unstyled live-region `<div>`), or nothing when
   * `state.formError` is unset. This is the ONE typed channel for errors that have no owning
   * `keyof T` ("invalid credentials", "passwords do not match") — it replaces the parallel
   * untyped `error?: string` page prop. Caller-positioned (it is just a `View`).
   */
  formError(): View;
}
```

`ErrorBag<T>` stays strictly `keyof T`-keyed — we **reject** a sentinel `_form` key (it
would weaken the closed union, §11.4). The dedicated optional field is the closed-union
answer. The emitted element is an unstyled live region:

```html
<div id="form-error" role="alert" aria-live="polite" aria-atomic="true">{escaped message}</div>
```

Implemented by reusing existing primitives only — `Div(message).setRole("alert")
.setAria({ live: "polite", atomic: true }).setId(formErrorId)` where `setRole` takes the
typed `AriaRole` (`"alert"` is a member) and `setAria` takes `AriaAttrs` with
`live?: 'off'|'polite'|'assertive'` (`src/core/aria-types.ts:72`) and `atomic?: boolean`
(`src/core/aria-types.ts:89`). A module const `const formErrorId = "form-error";` (next to
`fieldErrorId`, forms.ts:370) gives a stable id for `aria-describedby` reuse and in-place
htmx-422 morphing.

### P2 — typed field composite `f.field`

```ts
// forms.ts — new type (label required; input-only in 6.2.0)
export type FieldOpts = {
  label: string;
  type?: InputType;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  autocomplete?: AutocompleteHint;
};

// forms.ts:366 — new member on FormBinding<T>
export interface FormBinding<T> {
  /**
   * A labelled field: `<div><label for><control>[error|hint]</div>`. Reuses `f.input` for the
   * control (typed name + value refill + invalid wiring), `f.error(name)` for the error slot.
   * Emits ZERO Tailwind — `.apply()` your own shell. Required is conveyed by the bare
   * `required` attribute only (no injected `*` glyph, no opinionated copy). Input-only;
   * textarea/select use `f.textarea`/`f.select` + a manual `Label`.
   *
   * aria-describedby precedence: `f.input` already calls `markInvalid`, which points
   * `aria-describedby` at the ERROR id when the field is errored. The hint `describedby` is
   * therefore applied ONLY in the no-error branch — an errored field keeps `markInvalid`'s
   * error-id describedby and the hint is suppressed (never clobber `markInvalid`).
   */
  field(name: keyof T & string, opts: FieldOpts): Tag;
}
```

Composition (pure reuse inside `createFormBinding`, forms.ts:372):

- `label = Label(opts.label).setFor(name)`
- `control = this.input(name, opts.type)` then `.setPlaceholder` / `.toggle("required",
  !!opts.required)` / `.setAutocomplete` as provided (value-refill + `markInvalid` already
  applied by `this.input`).
- error-or-hint slot: **if the field is errored** (`errors[name] !== undefined`) → `this.error(name)`
  and **do not touch describedby** (`markInvalid` already set it to the error id). **Else if a
  hint exists** → `El("span", opts.hint).setId(`${name}-hint`)` **and** `control.setAria({
  describedby: `${name}-hint` })` (the only net-new wiring, applied solely in the no-error
  branch). **Else** → `Empty()`.
- returns `El("div", label, control, errorOrHint)` — a bare `Tag` so the caller chains
  `.apply(fieldShell)`.

`f.field` depends only on per-field `error` wiring (shipped 6.1.1), **not** on P1's
`formError` — they cover different slots and ship together for coherence, not dependency.

### P3 — bulk hidden + standalone `HiddenFields`

```ts
// forms.ts:364 — overload `hidden` on FormBinding<T>
export interface FormBinding<T> {
  /** Single hidden field — returns the tag so you can chain. */
  hidden(name: keyof T & string, value: string): InputTag;
  /**
   * Bulk hidden fields from a partial schema map — returns a `View` list (a group has nothing
   * to chain). Keys are `keyof T` (a typo is a compile error); `undefined` entries are skipped.
   */
  hidden(values: Partial<Record<keyof T & string, string | number | boolean>>): View;
}

// forms.ts — standalone, UNTYPED sibling for dynamic record bags that are not schema fields
export function HiddenFields(values: Record<string, string | number | boolean>): View;
```

Runtime discriminates via `typeof args[0] === "string"` (string-first overload order). Both
paths share one emitter: `Input("hidden").setName(k).setValue(String(v))` per entry,
`undefined` skipped. The single→`InputTag` / bulk→`View[]` asymmetry is deliberate and
JSDoc-noted. `HiddenFields` is the no-`keyof T`-constraint sibling for the
attachments/comments host case (a Record bag that isn't part of any schema).

### P4 — option helpers + multiselect (one `buildOptions` for everything)

```ts
// forms.ts:346 — keep existing SelectOption; add the richer input shape
export type SelectOption = { value: string; label: string };                 // EXISTING — unchanged
export type SelectOptionInput = { value: string; label?: string; disabled?: boolean };  // NEW: label defaults to value

// forms.ts — the SINGLE source of <option> truth (internal; today's f.select branch, extracted)
function buildOptions(
  items: readonly SelectOptionInput[],
  selected?: string | readonly string[] | null,
  placeholder?: string,
): View[];

// forms.ts — standalone view helper (children-position; for non-Select hosts / option fragments)
export function Options(
  items: readonly SelectOptionInput[],
  opts?: { selected?: string | readonly string[] | null; placeholder?: string },
): View;

// forms.ts:449 — SelectTag gains a CHAINABLE option builder (NO setMultiple — see below)
export class SelectTag extends Tag {
  name?: string;                                       // EXISTING
  size?: number;                                       // EXISTING
  setName(name?: string): this;                        // EXISTING
  setSize(size?: number): this;                        // EXISTING
  options(                                             // NEW: addChild(buildOptions(...)), returns this
    items: readonly SelectOptionInput[],
    selected?: string | readonly string[] | null,
  ): this;
  // bare `multiple` is emitted via the SHIPPED `.toggle("multiple")` — no named setter.
}

// forms.ts:366 — new member on FormBinding<T>
export interface FormBinding<T> {
  /**
   * `<select multiple name>` bound to an array field — marks every option whose value is in
   * the bound array. Built as `Select().setName(name).toggle("multiple")` (bare `multiple`
   * via the shipped toggle path — there is NO `setMultiple`). Coercion: `string[]` used
   * as-is; scalar → `[String(v)]`; nullish → `[]`. `markInvalid` wiring identical to `select`.
   */
  multiselect(name: keyof T & string, options: readonly SelectOptionInput[]): SelectTag;
}
```

> **No named boolean setter for `multiple`.** v6.0.0 removed every named boolean setter
> (`setMultiple` among them — CHANGELOG:181); `'multiple'` is a member of the closed
> `BooleanAttribute` union (`src/elements/html-types.ts:154`), so `.toggle("multiple")` is the
> single sanctioned emitter (enforced by the eslint `prefer-toggle` rule). This RFC ships **no**
> `SelectTag.setMultiple` and **no** `SelectTag.multiple` schema field — `f.multiselect` and any
> manual `multiple` select use `.toggle("multiple")`.

`buildOptions` is the convergence keystone: `f.select`, `Options`, `SelectTag.options`, and
`multiselect` **all** route through it (one way to build `<option>`s). Rules:

- each item → `Option(label ?? value).setValue(value)`; `disabled` → `.toggle("disabled")`.
- `selected` scalar → mark the value-match; `selected` array → mark every value-in-array.
- `placeholder` emits a **leading** `<option value="" disabled selected>placeholder</option>`
  **only** when nothing is selected **and** `selected` is not an array (a `selected`
  placeholder is invalid on a `multiple` list — suppressed there).

To keep exactly one option shape, **widen `f.select` to accept `SelectOptionInput`** and
route it through `buildOptions` too (`SelectOption` is assignable to `SelectOptionInput`, so
all existing `f.select(name, [{value,label}])` callers still compile).

`multiselect` builds `Select().setName(name).toggle("multiple")` with
`addChild(buildOptions(options, coerce(values[name])))`, where `coerce` is the
array/scalar/nullish rule above, then `markInvalid`.

**Canonical option-attach path (CONVERGE):** for a free-standing `<select>` the **method form
`Select().options(items, selected)` is canonical** (parity with the other chainable builders).
`Options(...)` is documented **only** as the children-position helper for non-`Select` hosts /
option fragments — the two are **not** presented as interchangeable ways to put options on a
`<select>`.

### One convergent surface

- **A non-field error** → `f.formError()` (the only such channel; deletes the parallel
  `error?: string` prop).
- **A labelled field** → `f.field(name, opts)`; `f.input` stays the escape hatch for custom
  layouts.
- **Hidden fields** → `f.hidden(name, value)` (single, chainable) / `f.hidden({…})` (bulk,
  typed) / `HiddenFields({…})` (untyped record bag).
- **Options** → built once by `buildOptions`; canonical attach is `Select().options(...)`,
  with `Options(...)` as the children-position helper, plus `f.select`/`f.multiselect` — no
  parallel option-mapping anywhere.
- **Bare `multiple`** → `.toggle("multiple")` (the single shipped path); `f.multiselect` uses it.

## Worked examples (before → after)

**Form-level error — pps auth (one channel replaces two):**

```ts
// BEFORE — typed state + a SECOND untyped prop, rendered ad-hoc above the form
type Props = { values: LoginReq; errors: ErrorBag<LoginReq>; error?: string };
Form<LoginReq>({ values, errors }, f => [
  IfThen(props.error, m => Alert({ message: m })),   // ← parallel untyped channel
  f.input("email", "email"),
  f.input("password", "password"),
]);

// AFTER — one typed state; the error rides FormState<T>
Form<LoginReq>({ values, errors, formError }, f => [
  f.formError(),                                       // <div id="form-error" role="alert" …>
  f.input("email", "email"),
  f.input("password", "password"),
]);
// "passwords do not match" (auth.controller.ts:192) and "invalid credentials" (:112/214) now
// flow through formError instead of an ErrorBag<T> key they could never have.
```

**Typed field composite — pps `AuthFormField` / template `FormField` deleted:**

```ts
// BEFORE — hand-rolled Div(Label, control, hint); typed name lost; pps ships no error slot
Div(Label(label).setFor(name), input, HintText(error, helpText));

// AFTER — typed name, value refill, error/hint + aria wiring, zero opinions
Form<RegisterReq>({ values: data, errors }, f =>
  f.field("email", { label: t("auth.register.email"), type: "email",
                     placeholder: "you@example.com", required: true })
    .apply(fieldShell)   // app keeps its own Tailwind
);
// → <div><label for="email">Email</label>
//      <input type="email" name="email" value="…" required placeholder="…"
//             [aria-invalid aria-describedby="email-error" when errored]>
//      <span id="email-error">…</span></div>
// no-error + hint → <span id="email-hint"> and control aria-describedby="email-hint";
// errored → markInvalid's aria-describedby="email-error" wins, hint suppressed.
```

**Bulk hidden — pm-gui `scope.comments.view.ts:22-24`:**

```ts
// BEFORE — hand-rolled, spread 3×
const hiddenFields = (h: Record<string,string>) =>
  Object.entries(h).map(([k,v]) => Input().setType("hidden").setName(k).setValue(v));
Form(...hiddenFields(ctx.hidden), Textarea() /*…*/);

// AFTER — untyped record bag
Form(HiddenFields(ctx.hidden), Textarea() /*…*/);
// AFTER — schema-typed
Form<CommentReq>({ values }, f => [ f.hidden({ scope, story }), f.textarea("body") ]);
// f.hidden({ scope:"s1", story:42, active:true })
//   → <input type="hidden" name="scope" value="s1">
//     <input type="hidden" name="story" value="42">
//     <input type="hidden" name="active" value="true">
```

**Options + multiselect — pps `form.ts:82` / `events.view.ts:314`:**

```ts
// BEFORE — StyledSelect re-maps options + a hand-rolled placeholder Option
Select(
  IfThen(placeholder, ph => Option(ph).setValue("").toggle("disabled").toggle("selected", !hasSelection)),
  ...options.map(o => Option(o.label).setValue(o.value).toggle("selected", o.value === defaultValue)),
);
// AFTER — canonical chainable method form
Select().options(options, defaultValue);

// BEFORE — multi-participant select, hand-mapped, NO selected wiring
Select(...participantsOptions.map(o => Option(o.label).setValue(o.value))).toggle("multiple");
// AFTER — typed, array-valued selected auto-marked (values.participants: string[])
f.multiselect("participants", participantsOptions);
// → <select multiple name="participants">   (bare multiple via .toggle("multiple"))
//     <option value="x" selected>…</option><option value="y" selected>…</option>
//     <option value="z">…</option></select>
```

Emitted-output reference (wire format):

```
Options([{value:"a",label:"A"},{value:"b"}], {selected:"b"})
  → <option value="a">A</option><option value="b" selected>b</option>
Options(items, {placeholder:"Pick…"})  (nothing selected)
  → <option value="" disabled selected>Pick…</option><option …>…
Select().options(items).toggle("multiple") → <select multiple>…</select>
f.formError()  (state.formError unset) → (nothing — Empty())
```

## Type-safety story

- **Field names are `keyof T & string` everywhere** — `f.field`, `f.hidden({…})`,
  `f.multiselect` all reject a typo at compile time, same as the shipped binding.
- **`formError` is a closed optional field**, not a stringly-keyed sentinel. `ErrorBag<T>`
  keeps its `keyof T` guarantee; a non-field error has exactly one typed home.
- **`FieldOpts` is a closed object**: `type: InputType`, `autocomplete: AutocompleteHint`
  (both existing closed unions); no bare-string slot, no `any`.
- **`SelectOptionInput` is a closed shape**; `selected: string | readonly string[] | null`
  expresses single-vs-multi without `any`.
- **Bare `multiple` stays toggle-only** — no named setter, no new `SelectTag` schema key; the
  closed `BooleanAttribute` union remains the one source of bare-attribute truth.
- **The `hidden` overload resolves string-first**: `f.hidden("x", "y")` → `InputTag`
  (chainable); `f.hidden({…})` → `View`. The asymmetry is intentional and JSDoc-noted.

## Migration & compatibility

- **6.1.x (patch):** N/A — this adds public surface; cannot ride a patch.
- **6.2.0 (minor): additive.** Every change is a new optional field (`FormState.formError`),
  a new method (`formError`/`field`/`multiselect`/`SelectTag.options`), a new overload
  (`hidden`), or a new export (`FieldOpts`/`SelectOptionInput`/`Options`/`HiddenFields`).
  **No deleted v6 decision is reversed** — there is no `setMultiple` (it stays deleted) and no
  new `BooleanAttribute`-shadowing setter. The one widening — `f.select` accepting
  `SelectOptionInput` — is non-breaking because `SelectOption ⊆ SelectOptionInput`; every
  existing `{value,label}` call still compiles.
- **App migration is mechanical and opt-in:** delete the parallel `error?: string` prop and
  render via `f.formError()`; replace hand-rolled `FormField`/`AuthFormField` with `f.field`;
  replace `hiddenFields(...)`/`HintText` helpers and `StyledSelect` option-maps with
  `f.hidden({…})`/`HiddenFields`/`Select().options`/`f.multiselect`. No HTML output regresses;
  the value only materializes once an app migrates off its parallel machinery, so a migration
  note + before→after example ship in the README (below).

## Docs impact (§11.8)

New public surface ⇒ lib README + JSDoc + CHANGELOG. **No `views.md`/`fluent-html.md` entries**
— those are guideline-repo files, not lib docs; the lib's own docs are
`README.md` / `FLUENT-STYLING.md` / `TAILWIND-SETUP.md` / `CHANGELOG.md` (verified by `ls *.md`).
No extractor/eslint README change — **zero Tailwind class surface** in this RFC.

- **README.md** — there is **no existing `Form<T>` section** (grep: zero `Form<` hits). **ADD**
  a `Form<T>` section documenting the **full binding**: the SHIPPED-6.1.1 factories
  (`input`/`textarea`/`select`/`checkbox`/`radio`/`hidden`/`error`) **and** the 6.2.0 additions
  — `f.formError()` (with the one-channel-replaces-two before→after), `f.field` (the
  labelled-composite example + "zero-Tailwind, `.apply()` your shell, required = bare attr,
  input-only, errored→error-id describedby wins / hint suppressed" callout), bulk `f.hidden({…})`
  + `HiddenFields`, and `Select().options`/`Options`/`f.multiselect`. State the single→`InputTag`
  / bulk→`View` return asymmetry explicitly. **Land the multiselect repeated-key array-body note
  HERE** (and in JSDoc): `<select multiple name=x>` submits a repeated-key body (`x=a&x=b`), so
  the JSON-Schema body field for a `multiselect` must be an **array**, not a scalar.
- **JSDoc** — on `FormState.formError`, `FormBinding.formError`/`field`/`multiselect`, both
  `hidden` overloads, `SelectTag.options`, `FieldOpts`, `SelectOptionInput`, `Options`,
  `HiddenFields` (drafted inline above). Note the `formError` method-vs-field same-word naming
  (mirrors `error(name)` method vs `errors` field), the `f.field` describedby precedence, and the
  multiselect array-body expectation.
- **CHANGELOG.md** — under `[6.2.0] ### ✨ New Features`:
  ```md
  #### Form<T> builder completion (RFC-A-01)
  - **`f.formError()`** — typed form-level / cross-field error slot (`FormState.formError`);
    one channel replaces the parallel untyped `error?: string` prop. Unstyled live region.
  - **`f.field(name, opts)`** — typed labelled field (label + wired control + error/hint),
    zero Tailwind, input-only. Errored ⇒ error-id `aria-describedby` wins, hint suppressed.
  - **`f.hidden({…})`** — bulk hidden fields (typed keys); plus standalone `HiddenFields(record)`.
  - **`Select().options(...)` / `Options(...)`** — reusable `<option>` builder (one
    `buildOptions` source). Bare `multiple` stays `.toggle("multiple")` — no named setter.
  - **`f.multiselect(name, options)`** — `<select multiple>` bound to an array field
    (submits a repeated-key body — body field must be an array).
  - `f.select` widened to accept `SelectOptionInput` (additive; `label` optional, per-option `disabled`).
  ```

## Guardrail check (§11.1–11.8)

- **§11.1 zero-deps:** pass — pure factories/emitters reusing in-scope primitives; no runtime dependency.
- **§11.2 ssr-only:** pass — synchronous string building only; no async on the render path.
- **§11.3 escape-by-default:** pass — `formError` message and hint/label are text children
  (escaped); option value/label and hidden name/value flow through existing
  `setValue`/`setName`/`setFor`/`setAria` attr escaping. `String(v)` is pre-escape
  stringification. No new sink.
- **§11.4 type-safety:** pass — `keyof T & string` names, closed `FieldOpts`/`SelectOptionInput`,
  `selected: string | readonly string[] | null`, `formError` as a closed optional field (no
  sentinel key); bare `multiple` stays inside the closed `BooleanAttribute` union via `.toggle`.
  No `any`, no bare-string-where-literals. The `f.field` describedby precedence is pinned (errored
  ⇒ error-id wins; hint describedby applied only in the no-error branch, never clobbers `markInvalid`).
- **§11.5 additive-only:** pass — all symbols new; **no deleted-setter resurrection** (`setMultiple`
  stays removed). The single `f.select` widening is non-breaking (`SelectOption ⊆ SelectOptionInput`).
- **§11.6 instruction-set / CONVERGE:** pass — binding-only primitives (a standalone component
  can't type `keyof T` or read state); emit zero styling (shells stay in `@jtdigital/ui`).
  One `buildOptions` powers every option path; one `formError` channel replaces two; one
  hidden emitter behind single/bulk/standalone. **Bare `multiple` has exactly one emitter
  (`.toggle("multiple")`) — `setMultiple` is NOT added.** **One canonical option-attach path:**
  `Select().options(...)` (method) is canonical; `Options(...)` is the children-position helper
  for non-`Select` hosts — not a second way to options a `<select>`. Sentinel `_form` key and a
  `*`-glyph field are explicitly rejected.
- **§11.7 class-vocab / extractor-eslint lockstep:** **N/A by construction** — every emitter
  produces only HTML attributes + structural `<div>/<label>/<span>/<option>` (verified: no
  class/background/padding usage anywhere in the additions), exactly like the existing
  `f.error()` span. No `src/class-vocab/vocab.ts` row, no `fluent-html-tailwind-extractor`
  change, no `fluent-html-eslint-plugin` change. The class-string contract is not engaged.
- **§11.8 guideline/docs-sync:** pass — Docs impact covers every `api_surface` symbol and lands
  on the lib's OWN docs (README + JSDoc + CHANGELOG); the multiselect array-body note is in the
  README/JSDoc, not a guideline file. No `views.md`/`fluent-html.md` lib-docs claim.

## Alternatives considered

- **Sentinel `_form` key in `ErrorBag<T>`** (let `errors` carry the form-level message).
  Rejected — weakens the `keyof T` closed union (§11.4) and reintroduces a bare-string
  foot-gun. A dedicated optional field keeps the union closed.
- **Named `SelectTag.setMultiple` setter** (the adversary's killer). Rejected — v6.0.0 removed
  every named boolean setter (`setMultiple` by name, CHANGELOG:181); `'multiple'` lives in the
  closed `BooleanAttribute` union (`src/elements/html-types.ts:154`) and `.toggle("multiple")` is
  the sanctioned single emitter the eslint `prefer-toggle` rule enforces. A setter would be a
  second emitter (§11.6) and a silent reversal of a shipped breaking decision. `f.multiselect`
  uses `.toggle("multiple")`.
- **`role="alert"` only, drop explicit `aria-live`.** `role="alert"` is already an implicit
  assertive live region, so pairing it with `aria-live="polite"` is belt-and-suspenders. Kept
  as the standard form-error-summary pattern; trivially droppable if reviewers prefer.
- **Widen `f.field` to textarea/select now** (`kind: 'textarea'|'select'` discriminated opts).
  Rejected for 6.2.0 — input-only holds the line on scope; a discriminated-opts overload is a
  clean additive follow-up. Textarea/select fields fall back to `f.textarea`/`f.select` + a
  manual `Label` meanwhile.
- **Two parallel option types** (`SelectOption` for `f.select`, `SelectOptionInput` for the
  rest). Rejected — widening `f.select` to `SelectOptionInput` and routing everything through
  `buildOptions` keeps exactly one option shape (CONVERGE).
- **Present `Select().options(...)` and `Options(...)` as interchangeable.** Rejected — that is a
  doubled authoring surface for one job. `Select().options(...)` is canonical; `Options(...)` is
  documented only as the children-position helper for non-`Select` hosts.
- **Make bulk `f.hidden` return chainable group.** Rejected — a group of inputs has nothing to
  chain; returning `View[]` is honest. Single-field keeps `InputTag` for chaining.

## Open questions

- **`aria-describedby` token list when both error AND hint apply.** Scoped design: error wins,
  hint suppressed, `describedby` points at the single error id (precedence now pinned in P2). If
  a future variant shows both, `describedby` must become a space-joined token list — flagged so
  the helper can grow to it without a breaking change.
- **`multiselect` scalar coercion** — wrapping a server scalar in `[String(v)]` and nullish→`[]`
  is the proposed default; confirm no app expects a scalar `multiple` field (the README array-body
  note steers callers to an array body).
- **`f.field` naming** — `field` is generic; confirm no `FluentCustomMethods`/app augmentation
  squats `f.field` (the binding object is library-owned, so risk is low). Note in migration.
- **`required` semantics** — conveyed solely by the bare `required` attribute, no injected `*`.
  Apps wanting a visual asterisk add it via `opts.label` or `.apply()`. Confirm this is the
  desired default (documented to avoid a "where's my asterisk" surprise).

## Adversary review & resolutions

Verdict: **survives-with-changes** (confidence 0.74). Killer: P4 re-introduced
`SelectTag.setMultiple` — a named boolean setter v6.0.0 deliberately deleted. Each
`required_change` and its resolution:

1. **DROP `SelectTag.setMultiple` + the `multiple?: boolean` schema field; remove both from
   `api_surface`.** — **Resolved.** Both removed from `api_surface`, from the `SelectTag` class
   sketch (P4), and from the wire-format reference. The "No named boolean setter for `multiple`"
   callout and an Alternatives entry record the decision. CHANGELOG entry restated to "bare
   `multiple` stays `.toggle("multiple")` — no named setter."
2. **REWRITE `f.multiselect` to use `Select().setName(name).toggle("multiple")` (not
   `.setMultiple(true)`); update P4 prose + the wire-format line.** — **Resolved.** `f.multiselect`
   JSDoc and prose now build via `.toggle("multiple")`; the wire-format line reads
   `Select().options(items).toggle("multiple") → <select multiple>`.
3. **FIX `aria-types.ts` citations to `src/core/aria-types.ts` (keys at :72/76/89/98).** —
   **Resolved.** All references now read `src/core/aria-types.ts` (`live`:72, `atomic`:89, and the
   `invalid`:76 / `describedby`:98 keys used by `markInvalid`). Verified by `ls src/core/aria-types.ts`
   and a keys grep.
4. **REMOVE `views.md`/`fluent-html.md` from `guideline_updates`/Docs impact (not lib docs); land
   the multiselect array-body note in the lib's OWN README/JSDoc.** — **Resolved.** Both files
   removed from `guideline_updates` and Docs impact. The repeated-key array-body note now lives in
   the README + JSDoc tasks. Lib docs confirmed as README/FLUENT-STYLING/TAILWIND-SETUP/CHANGELOG.
5. **README has no `Form<T>` section to "extend" — change the task to ADD one documenting the full
   binding (6.1.1 + 6.2.0).** — **Resolved.** Docs impact + `guideline_updates` now say **ADD** a
   `Form<T>` section documenting the shipped-6.1.1 factory set plus the 6.2.0 additions. Verified by
   `grep -c "Form<" README.md` → 0.
6. **CONVERGE on `f.field`/option attach: one canonical chainable path; `Options` only as the
   children-position helper.** — **Resolved.** `Select().options(...)` declared canonical;
   `Options(...)` documented solely as the non-`Select`/children-position helper. Added a
   "Canonical option-attach path" paragraph, a CONVERGE note in §11.6, and an Alternatives entry;
   the worked example no longer shows both forms as interchangeable for a `<select>`.
7. **Pin `f.field` `aria-describedby` precedence: errored ⇒ error-id wins, hint suppressed; apply
   the hint `describedby` only in the no-error branch (never clobber `markInvalid`).** —
   **Resolved.** P2 JSDoc, composition steps, the worked-example comment, and §11.4 all state the
   precedence: hint `describedby` is set **only** in the no-error branch; an errored field keeps
   `markInvalid`'s error-id describedby.

No required change declined.
