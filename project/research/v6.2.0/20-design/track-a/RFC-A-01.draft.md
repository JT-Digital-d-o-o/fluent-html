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
  - "SelectTag.multiple?: boolean  (new field)"
  - "SelectTag.setMultiple(multiple?: boolean): this  (new)"
  - "SelectTag.options(items: readonly SelectOptionInput[], selected?: string | readonly string[] | null): this  (new)"
breaking: additive
ships_to: "6.2.0"
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, additive-only, instruction-set, class-vocab-sync, guideline-sync]
guideline_updates:
  - lib README/docs/JSDoc (Form<T> section, forms reference, CHANGELOG 6.2.0)
  - views.md (multiselect submits a repeated-key array body)
  - no extractor/eslint README change (zero Tailwind class surface)
impact: high
effort: L
depends_on: []
status: proposed
---

# RFC-A-01: Form<T> builder completion

## Problem

The 6.1.1 typed `Form<T>` binding (`src/elements/forms.ts:337-447`) ships the per-field
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

5. **No multiselect.** `SelectTag` (forms.ts:449-462) exposes only `name`/`size` — no typed
   `multiple`, no array-valued `selected` wiring. `.toggle("multiple")` works untyped, but
   the bound value can't be an array, so pps `events.view.ts:314` hand-maps options into a
   multi-participant select with **no selected wiring**.

All five are genuine **binding-only** gaps: a standalone component cannot type `name` to
`keyof T` nor read `state.values`/`state.errors`. None is shipped — verified against the
full `forms.ts` read and `CHANGELOG.md` 6.0.0→6.1.1 (line 958 lists `multiple` only as a
toggleable raw input attr; there is no typed `SelectTag.multiple`, no array-`selected`, no
composite, no bulk-hidden, no form-level error). They ship as **one** convergent surface so
the binding is complete instead of half-built.

## Proposed API

All additions live in `src/elements/forms.ts`. **No new imports** beyond the two new types;
`Div`/`El`/`Empty`/`Label`/`Input`/`Select`/`Option` and the `setRole`/`setAria`/`setFor`/
`addChild` primitives are already in scope (`tag.ts:303,389,429`, forms.ts:1-7). Every
emitter produces **zero Tailwind classes** — exactly like today's `f.error()` span, the
styled shells stay in `@jtdigital/ui` (instruction-set memory).

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
answer. The emitted element is an unstyled assertive live region:

```html
<div id="form-error" role="alert" aria-live="polite" aria-atomic="true">{escaped message}</div>
```

Implemented by reusing existing primitives only — `Div(message).setRole("alert")
.setAria({ live: "polite", atomic: true }).setId(formErrorId)` where `setRole` takes the
typed `AriaRole` (`"alert"` is a member) and `setAria` takes `AriaAttrs` with
`live?: 'off'|'polite'|'assertive'` (aria-types.ts:72) and `atomic?: boolean`
(aria-types.ts:89). A module const `const formErrorId = "form-error";` (next to
`fieldErrorId`, forms.ts:370) gives a stable id for `aria-describedby` reuse and in-place
htmx-422 morphing.

### P2 — typed field composite `f.field`

```ts
// forms.ts — new type (label defaults to none; input-only in 6.2.0)
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
   */
  field(name: keyof T & string, opts: FieldOpts): Tag;
}
```

Composition (pure reuse inside `createFormBinding`, forms.ts:372):

- `label = Label(opts.label).setFor(name)`
- `control = this.input(name, opts.type)` then `.setPlaceholder` / `.toggle("required",
  !!opts.required)` / `.setAutocomplete` as provided (value-refill + `markInvalid` already
  applied by `this.input`)
- error-or-hint slot: `errors[name] !== undefined ? this.error(name) : (opts.hint ?
  El("span", opts.hint).setId(`${name}-hint`) : Empty())`. When there is **no** error but a
  hint exists, also `control.setAria({ describedby: `${name}-hint` })` (the only net-new
  wiring; reuses `setAria`).
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

// forms.ts — standalone view helper
export function Options(
  items: readonly SelectOptionInput[],
  opts?: { selected?: string | readonly string[] | null; placeholder?: string },
): View;

// forms.ts:449 — SelectTag gains typed multiple + a chainable option builder
export class SelectTag extends Tag {
  name?: string;
  size?: number;
  multiple?: boolean;                                   // NEW schema key → bare `multiple`
  setName(name?: string): this;                         // EXISTING
  setSize(size?: number): this;                         // EXISTING
  setMultiple(multiple?: boolean): this;                // NEW
  options(                                              // NEW: addChild(buildOptions(...)), returns this
    items: readonly SelectOptionInput[],
    selected?: string | readonly string[] | null,
  ): this;
}

// forms.ts:366 — new member on FormBinding<T>
export interface FormBinding<T> {
  /**
   * `<select multiple name>` bound to an array field — marks every option whose value is in
   * the bound array. Coercion: `string[]` used as-is; scalar → `[String(v)]`; nullish → `[]`.
   * `markInvalid` wiring identical to `select`.
   */
  multiselect(name: keyof T & string, options: readonly SelectOptionInput[]): SelectTag;
}
```

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

`multiselect` builds `Select().setName(name).setMultiple(true)` with
`buildOptions(options, coerce(values[name]))`, where `coerce` is the array/scalar/nullish
rule above, then `markInvalid`.

### One convergent surface

- **A non-field error** → `f.formError()` (the only such channel; deletes the parallel
  `error?: string` prop).
- **A labelled field** → `f.field(name, opts)`; `f.input` stays the escape hatch for custom
  layouts.
- **Hidden fields** → `f.hidden(name, value)` (single, chainable) / `f.hidden({…})` (bulk,
  typed) / `HiddenFields({…})` (untyped record bag).
- **Options** → built once by `buildOptions`, surfaced as `Options(...)`, `Select().options(...)`,
  `f.select`, and `f.multiselect` — no parallel option-mapping anywhere.

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
// AFTER
Select().options(options, defaultValue);                       // chainable
Select(Options(options, { selected: defaultValue, placeholder })); // or as children

// BEFORE — multi-participant select, hand-mapped, NO selected wiring
Select(...participantsOptions.map(o => Option(o.label).setValue(o.value))).toggle("multiple");
// AFTER — typed, array-valued selected auto-marked (values.participants: string[])
f.multiselect("participants", participantsOptions);
// → <select multiple name="participants">
//     <option value="x" selected>…</option><option value="y" selected>…</option>
//     <option value="z">…</option></select>
```

Emitted-output reference (wire format):

```
Options([{value:"a",label:"A"},{value:"b"}], {selected:"b"})
  → <option value="a">A</option><option value="b" selected>b</option>
Options(items, {placeholder:"Pick…"})  (nothing selected)
  → <option value="" disabled selected>Pick…</option><option …>…
SelectTag.setMultiple(true)            → <select multiple>…</select>
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
  expresses single-vs-multi without `any`. `SelectTag.multiple` is typed (not a raw
  `addAttribute("multiple")`).
- **The `hidden` overload resolves string-first**: `f.hidden("x", "y")` → `InputTag`
  (chainable); `f.hidden({…})` → `View`. The asymmetry is intentional and JSDoc-noted.

## Migration & compatibility

- **6.1.x (patch):** N/A — this adds public surface; cannot ride a patch.
- **6.2.0 (minor): additive.** Every change is a new optional field (`FormState.formError`,
  `SelectTag.multiple`), a new method (`formError`/`field`/`multiselect`/`SelectTag.options`/
  `setMultiple`), a new overload (`hidden`), or a new export (`FieldOpts`/`SelectOptionInput`/
  `Options`/`HiddenFields`). The one widening — `f.select` accepting `SelectOptionInput` —
  is non-breaking because `SelectOption ⊆ SelectOptionInput`; every existing `{value,label}`
  call still compiles.
- **App migration is mechanical and opt-in:** delete the parallel `error?: string` prop and
  render via `f.formError()`; replace hand-rolled `FormField`/`AuthFormField` with `f.field`;
  replace `hiddenFields(...)`/`HintText` helpers and `StyledSelect` option-maps with
  `f.hidden({…})`/`HiddenFields`/`Options`/`Select().options`/`f.multiselect`. No HTML output
  regresses; the value only materializes once an app migrates off its parallel machinery, so
  a migration note + before→after example ship in the README (below).

## Docs impact (§11.8)

New public surface ⇒ lib README + forms docs + JSDoc, plus a `views.md` server-body note. No
extractor/eslint README change — **zero Tailwind class surface** in this RFC.

- **README.md** — extend the `Form<T>` section: add `f.formError()` (with the
  one-channel-replaces-two before→after), `f.field` (the labelled-composite example +
  "zero-Tailwind, `.apply()` your shell, required = bare attr, input-only" callout), bulk
  `f.hidden({…})` + `HiddenFields`, and `Options`/`Select().options`/`f.multiselect`. State
  the single→`InputTag` / bulk→`View` return asymmetry explicitly.
- **fluent-html.md / CLAUDE.md** — the `Form<T>` block gains `f.formError()`, `f.field(...)`,
  `f.hidden({...})`, and `f.multiselect(...)` lines alongside the existing factory list, so
  the idiomatic surface stays the documented one.
- **JSDoc** — on `FormState.formError`, `FormBinding.formError`/`field`/`multiselect`, both
  `hidden` overloads, `SelectTag.setMultiple`/`options`, `FieldOpts`, `SelectOptionInput`,
  `Options`, `HiddenFields` (drafted inline above). Note the `formError` method-vs-field
  same-word naming (mirrors `error(name)` method vs `errors` field).
- **views.md** — a note that `<select multiple name=x>` submits a **repeated-key** body
  (`x=a&x=b`), so the JSON-Schema body field must be an array — callers should expect an
  array, not a scalar, for a `multiselect` field.
- **CHANGELOG.md** — under `[6.2.0] ### ✨ New Features`:
  ```md
  #### Form<T> builder completion (RFC-A-01)
  - **`f.formError()`** — typed form-level / cross-field error slot (`FormState.formError`);
    one channel replaces the parallel untyped `error?: string` prop. Unstyled live region.
  - **`f.field(name, opts)`** — typed labelled field (label + wired control + error/hint),
    zero Tailwind, input-only.
  - **`f.hidden({…})`** — bulk hidden fields (typed keys); plus standalone `HiddenFields(record)`.
  - **`Options(...)` / `Select().options(...)` / `SelectTag.setMultiple`** — reusable `<option>`
    builder (one `buildOptions` source) + typed `multiple`.
  - **`f.multiselect(name, options)`** — `<select multiple>` bound to an array field.
  - `f.select` widened to accept `SelectOptionInput` (additive; `label` optional, per-option `disabled`).
  ```

## Guardrail check (§11.1–11.8)

- **§11.1 zero-deps:** pass — pure factories/emitters reusing in-scope primitives; no runtime dependency.
- **§11.2 ssr-only:** pass — synchronous string building only; no async on the render path.
- **§11.3 escape-by-default:** pass — `formError` message and hint/label are text children
  (escaped); option value/label and hidden name/value flow through existing
  `setValue`/`setName`/`setFor`/`setAria` attr escaping. No new sink.
- **§11.4 type-safety:** pass — `keyof T & string` names, closed `FieldOpts`/`SelectOptionInput`,
  `selected: string | readonly string[] | null`, typed `SelectTag.multiple`, `formError` as a
  closed optional field (no sentinel key). No `any`, no bare-string-where-literals.
- **§11.5 additive-only:** pass — all symbols new; the single `f.select` widening is
  non-breaking (`SelectOption ⊆ SelectOptionInput`).
- **§11.6 instruction-set / CONVERGE:** pass — binding-only primitives (a standalone component
  can't type `keyof T` or read state); emit zero styling (shells stay in `@jtdigital/ui`).
  One `buildOptions` powers every option path; one `formError` channel replaces two; one
  hidden emitter behind single/bulk/standalone. Sentinel `_form` key and a `*`-glyph field
  are explicitly rejected.
- **§11.7 class-vocab / extractor-eslint lockstep:** **N/A by construction** — every emitter
  produces only HTML attributes + structural `<div>/<label>/<span>/<option>` (verified: no
  class/background/padding usage anywhere in the additions), exactly like the existing
  `f.error()` span. No `src/class-vocab/vocab.ts` row, no `fluent-html-tailwind-extractor`
  change, no `fluent-html-eslint-plugin` change. The class-string contract is not engaged.
- **§11.8 guideline/docs-sync:** pass — Docs impact covers every `api_surface` symbol (README,
  fluent-html.md/CLAUDE.md, JSDoc, views.md, CHANGELOG).

## Alternatives considered

- **Sentinel `_form` key in `ErrorBag<T>`** (let `errors` carry the form-level message).
  Rejected — weakens the `keyof T` closed union (§11.4) and reintroduces a bare-string
  foot-gun. A dedicated optional field keeps the union closed.
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
- **Make bulk `f.hidden` return chainable group.** Rejected — a group of inputs has nothing to
  chain; returning `View[]` is honest. Single-field keeps `InputTag` for chaining.

## Open questions

- **`aria-describedby` token list when both error AND hint apply.** Scoped design: error wins,
  hint suppressed, `describedby` points at the single error id. If a future variant shows both,
  `describedby` must become a space-joined token list — flagged so the helper can grow to it
  without a breaking change.
- **`multiselect` scalar coercion** — wrapping a server scalar in `[String(v)]` and nullish→`[]`
  is the proposed default; confirm no app expects a scalar `multiple` field (the views.md note
  steers callers to an array body).
- **`f.field` naming** — `field` is generic; confirm no `FluentCustomMethods`/app augmentation
  squats `f.field` (the binding object is library-owned, so risk is low). Note in migration.
- **`required` semantics** — conveyed solely by the bare `required` attribute, no injected `*`.
  Apps wanting a visual asterisk add it via `opts.label` or `.apply()`. Confirm this is the
  desired default (documented to avoid a "where's my asterisk" surprise).
