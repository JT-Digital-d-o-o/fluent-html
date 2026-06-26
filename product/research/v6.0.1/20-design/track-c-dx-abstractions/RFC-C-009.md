---
id: RFC-C-009
track: C
title: Form<T> binding completeness — checkbox/radio, richer select, field-arrays, aria-invalid wiring, typed option/hidden values
resolves: [F-C-140, F-C-141, F-C-142, F-C-143, F-D-143]
api_surface:
  - "FormBinding<T>.checkbox(name, value?)"
  - "FormBinding<T>.radio(name, value)"
  - "FormBinding<T>.select(name, options, opts?)"
  - "FormBinding<T>.array(name, items, render)"
  - "SelectOption<V>"
  - "SelectOptionGroup<V>"
  - "SelectOpts"
  - "FormBinding<T>.hidden(name, value)  // value retyped T[name] & string"
breaking: additive
ships_to: "6.1.0"
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, additive-only, instruction-set, class-vocab-sync, guideline-sync]
guideline_updates:
  - "web-development/CLAUDE.md"
  - "web-development/fluent-html.md"
impact: high
effort: M
depends_on: []
status: proposed
---

# RFC-C-009: Form<T> binding completeness

## Problem

The shipped `Form<T>` typed binding (`src/elements/forms.ts:327`–`372`) covers exactly four controls: `input`, `textarea`, `select`, `hidden`, plus an `error` reader. The two controls whose *checked* wiring is the most error-prone — checkbox and radio — have **no factory at all**, so authors drop back to raw `Input("checkbox")` with hand-written `.toggle("checked", …)` and an untyped `.setName(...)`, defeating the entire point of `Form<T>`. Four concrete gaps, all grounded in the shipped code:

**F-C-140 — no checkbox/radio factory.** `FormBinding<T>` (`forms.ts:327`) stops at `select`/`hidden`. Wiring a checkbox today means `Input("checkbox").setName("active").toggle("checked", !!user.active)` — the `name` is a bare string (no `keyof T` check), and the checked logic is copy-pasted per field. Radio is worse: every radio in a group must repeat the value-match (`toggle("checked", user.role === "admin")`) by hand.

**F-C-141 — `f.select` can't express placeholder / optgroups / multi-select.** `SelectOption` (`forms.ts:320`) is a flat `{ value: string; label: string }` only; `select` (`forms.ts:354`) maps it to `<option>`s and single-value-matches `String(selected) === o.value`. There is no way to emit a leading placeholder option, group options under `<optgroup>` (the `Optgroup`/`OptgroupTag` element exists at `forms.ts:438` but the binding never uses it), or bind a `multiple` select against an array value.

**F-C-143 — `f.error` wires the message but not the input's invalid state.** `error` (`forms.ts:366`) returns an unstyled `<span>` with the message, but the matching `input`/`textarea`/`select` never gets `aria-invalid` or `aria-describedby` — the validation wiring is half-connected. The aria attribute names already exist as a closed union (`src/core/aria-types.ts:38`: `"invalid"`, `"describedby"`), so `setAria` is ready; the binding just never calls it.

**F-C-142 — no field-arrays.** Repeated fieldsets (`name="items[0].sku"`, `name="items[1].sku"`) cannot be bound through `Form<T>`. Authors hand-roll the index prefix with `ForEach` (`src/control/iteration.ts:26`) and raw inputs, losing both the `keyof` check on the row shape and the per-row value/error wiring.

**F-D-143 — option/hidden values are bare `string`, not `T[name]`.** `SelectOption.value` and `hidden(name, value: string)` (`forms.ts:320`, `331`) are `string`. For a literal-union field (`role: "admin" | "viewer"`) the binding happily accepts `{ value: "admni" }` or `f.hidden("role", "amdin")` — an off-union value the server schema will reject, with no compile error.

## Proposed API / fix

All additive: new methods on `FormBinding<T>`, a widened `SelectOption`, two new exported types. No existing signature changes shape (see Compatibility).

```ts
// ── widened option model (F-C-141, F-D-143) ────────────────────────

/** A single `<option>`. `value` is typed to the field when the field is a literal union. */
export type SelectOption<V = string> = {
  value: V & string;
  label: string;
  disabled?: boolean;
};

/** An `<optgroup>` of options (F-C-141). */
export type SelectOptionGroup<V = string> = {
  label: string;
  disabled?: boolean;
  options: readonly SelectOption<V>[];
};

/** Per-select options: a leading placeholder and/or multi-select (F-C-141). */
export type SelectOpts = {
  /** Leading disabled, value-"" option; selected when no value is bound. */
  placeholder?: string;
  /** Emit `multiple`; bound value is matched as a set (array or Set). */
  multiple?: boolean;
};

// `keyof T` field → its value type, narrowed to the string part (off-union = compile error).
type FieldValue<T, K extends keyof T> = T[K] extends infer V
  ? V extends string ? V : string
  : string;

// row element type of an array-typed field
type ArrayItem<T, K extends keyof T> = T[K] extends readonly (infer E)[] ? E : never;

export interface FormBinding<T> {
  input(name: keyof T & string, type?: InputType): InputTag;
  textarea(name: keyof T & string): TextareaTag;

  // widened: opts arg + optgroups + per-field-typed option values (F-C-141, F-D-143)
  select<K extends keyof T & string>(
    name: K,
    options: readonly (SelectOption<FieldValue<T, K>> | SelectOptionGroup<FieldValue<T, K>>)[],
    opts?: SelectOpts,
  ): SelectTag;

  // NEW — checkbox: boolean field by default; with `value`, a member of a string[] field (F-C-140)
  checkbox(name: keyof T & string, value?: string): InputTag;

  // NEW — radio: `value` is typed to the field's literal union (F-C-140, F-D-143)
  radio<K extends keyof T & string>(name: K, value: FieldValue<T, K>): InputTag;

  // hidden: value retyped to the field (F-D-143)
  hidden<K extends keyof T & string>(name: K, value: FieldValue<T, K>): InputTag;

  // NEW — field-arrays: a scoped child binding whose names are prefixed `name[i].` (F-C-142)
  array<K extends keyof T & string>(
    name: K,
    items: readonly ArrayItem<T, K>[],
    render: (row: FormBinding<ArrayItem<T, K>>, item: ArrayItem<T, K>, index: number) => View,
  ): View;

  /** The field's error message (an unstyled `<span id="err-{name}">`), or nothing. */
  error(name: keyof T & string): View;
}
```

Behavioural contract:

- **`checkbox(name)`** (no `value`): `Input("checkbox").setName(name)` + `toggle("checked", Boolean(values[name]))` — a boolean field. **`checkbox(name, value)`**: sets `.setValue(value)` and checks when `values[name]` (a `string[]`) includes `value` — the standard multi-checkbox group.
- **`radio(name, value)`**: `Input("radio").setName(name).setValue(value)` + `toggle("checked", String(values[name]) === value)`.
- **`select` widening**: a `placeholder` emits a leading `Option(placeholder).setValue("").toggle("disabled").toggle("selected", noValueBound)`; group entries render via the existing `Optgroup`/`OptgroupTag` (`forms.ts:438`); `multiple` toggles `multiple` and matches membership against an array/`Set` bound value (back-compat: a flat `readonly SelectOption[]` with no `opts` behaves exactly as v6.0.0).
- **aria wiring (F-C-143)**: when `errors[name]` is present, `input`/`textarea`/`select`/`checkbox`/`radio` call `setAria({ invalid: true, describedby: "err-" + name })`, and `error(name)` sets the matching `setId("err-" + name)` on its span. The id is deterministic and computed from the field name only — no new public knob.
- **`array(name, items, render)`**: builds a child `FormBinding` whose `input("sku")` emits `name="{name}[{i}].sku"`, reads `values` from `items[i]`, and reads `errors` from `errors[name]?.[i]` (a nested error bag). Returns the `ForEach`-mapped Views. No new element — pure name-prefix composition over the existing factories.

## Worked examples (before → after)

```ts
// before (v6.0.0)
type Settings = { active: boolean; role: "admin" | "viewer"; tags: string[] };

Form<Settings>({ values: s, errors }, (f) => [
  // checkbox: no factory — drop to raw, untyped name, hand-rolled checked
  Input("checkbox").setName("active").toggle("checked", !!s.active),   // name unchecked
  // radio group: repeat the value-match by hand, per option
  Input("radio").setName("role").setValue("admin").toggle("checked", s.role === "admin"),
  Input("radio").setName("role").setValue("viewer").toggle("checked", s.role === "viewer"),
  // select: no placeholder, no optgroups; off-union value compiles
  f.select("role", [{ value: "amdin", label: "Admin" }]),              // typo — no error
  // error: message shown, but input has no aria-invalid / aria-describedby
  f.error("role"),
])
```

```ts
// after (this RFC)
Form<Settings>({ values: s, errors }, (f) => [
  f.checkbox("active"),                          // boolean field, checked wired
  f.radio("role", "admin"),                      // value typed to "admin" | "viewer"
  f.radio("role", "viewer"),
  f.checkbox("tags", "urgent"),                  // member of string[] — checked if tags⊇"urgent"
  f.select("role",
    [{ value: "admin", label: "Admin" }, { value: "viewer", label: "Viewer" }],
    { placeholder: "Select a role…" }),          // leading disabled placeholder
  f.select("amdin", …),                          // ✗ compile error (name not keyof T)
  f.radio("role", "amdin"),                      // ✗ compile error (off-union value, F-D-143)
  f.error("role"),                               // <span id="err-role">…</span>; the role
                                                 //   controls now carry aria-invalid +
                                                 //   aria-describedby="err-role"
])

// field-arrays (F-C-142)
type Order = { items: { sku: string; qty: number }[] };
Form<Order>({ values: order, errors }, (f) =>
  f.array("items", order.items, (row, _item, i) =>
    Fieldset(
      row.input("sku"),         // name="items[0].sku", value wired from order.items[0]
      row.input("qty", "number"),
      row.error("sku"),         // reads errors.items[0].sku
    ),
  ),
)
```

## Type-safety story

- **`radio`/`hidden`/`select` option values are `FieldValue<T, K>`** — for a literal-union field they collapse to that union, so `f.radio("role", "amdin")` and `{ value: "amdin" }` are compile errors (F-D-143). When the field is a plain `string`, `FieldValue` degrades to `string`, so existing call sites keep compiling (the conditional `V extends string ? V : string` is the degrade path).
- **`checkbox(name, value?)`** keeps `name: keyof T & string`; the no-`value` form is for boolean fields, the `value` form for `string[]` membership — both names typo-checked.
- **`array`** infers the row shape with `ArrayItem<T, K>` (`T[K] extends readonly (infer E)[]`), so the child `FormBinding<ArrayItem<T,K>>` constrains `row.input("sku")` to the *element*'s keys — a typo in a nested field name is a compile error, exactly like the top level. A non-array field makes `ArrayItem` `never`, so `f.array("role", …)` fails to typecheck.
- **No bare `string` is introduced where a union fits** (guardrail 4): the widened `SelectOption<V>` defaults `V = string` so the old flat form still types, but a field-typed call tightens it.
- **aria** uses the existing closed `AriaAttributeName` union (`aria-types.ts:38`); `setAria({ invalid: true, describedby: … })` is already type-checked — no new aria surface.

## Compatibility & version

- **6.0.1 (patch):** N/A — this RFC adds public symbols (`checkbox`, `radio`, `array`, `SelectOpts`, generic `SelectOption<V>`/`SelectOptionGroup<V>`), so it is not a patch. Routed to 6.1.0.
- **6.1.0 (minor):** **additive.** Verified non-breaking:
  - `SelectOption` becomes generic with `V = string` default → existing `readonly SelectOption[]` annotations and object literals still resolve (`SelectOption` ≡ `SelectOption<string>`).
  - `select` gains a 3rd optional `opts` arg and a widened (superset) options type; all existing 2-arg flat-list calls still match. Output for the no-`opts` flat-list path is byte-identical to v6.0.0.
  - `hidden`/`select` become generic over `K`, but `FieldValue` degrades to `string` for non-union fields, so prior calls keep compiling.
  - `checkbox`/`radio`/`array`/`SelectOpts`/`SelectOptionGroup` are new names — checked against the `src/index.ts` export list, no collision.
  - The aria wiring only *adds* `aria-invalid`/`aria-describedby` **when an error is already present** for that field; clean forms emit identical HTML. This is strictly-more-correct accessibility, never a change for non-errored controls.
- **parked-major:** not needed. Nothing here requires a breaking change.

## Guidelines impact

### Index (`web-development/CLAUDE.md`)

Add to the `Form<T>` bullet (after the `f.select` line in the existing fenced block):

```md
f.checkbox("active")                  // ✓ boolean field, checked wired from state
f.checkbox("tags", "urgent")          // ✓ member of a string[] field
f.radio("role", "admin")              // ✓ value typed to the field's union; checked wired
f.select("role", opts, { placeholder: "Select…" })  // ✓ placeholder / optgroups / multiple
f.array("items", order.items, (row, _item, i) => Fieldset(row.input("sku")))  // ✓ field-arrays
Input("checkbox").setName("active").toggle("checked", !!s.active)  // ✗ untyped — use f.checkbox
f.radio("role", "amdin")              // ✗ compile error (off-union value)
```

### Topic ref (`web-development/fluent-html.md`)

Insert into the `Form<T>` section, after the `f.hidden` line:

```md
**Checkbox / radio** — typed `checked` wiring (the most error-prone controls):
```typescript
f.checkbox("active")               // boolean field → checked = Boolean(values.active)
f.checkbox("tags", "urgent")       // string[] field → checked when tags includes "urgent"
f.radio("role", "admin")           // value typed to T["role"]; checked when role === "admin"
```

**Richer select** — placeholder, optgroups, multi-select:
```typescript
f.select("role", [{ value: "admin", label: "Admin" }], { placeholder: "Select a role…" })
f.select("city", [{ label: "EU", options: [{ value: "lj", label: "Ljubljana" }] }])  // optgroup
f.select("tags", tagOptions, { multiple: true })   // bound value matched as a set
```

**Field-arrays** — repeated fieldsets with prefixed binding (`items[i].sku`):
```typescript
f.array("items", order.items, (row, _item, i) =>
  Fieldset(row.input("sku"), row.input("qty", "number"), row.error("sku")))
```

**aria wiring** — when `state.errors[name]` is set, the bound control auto-emits
`aria-invalid="true"` + `aria-describedby="err-{name}"`, and `f.error(name)` carries the
matching `id`. No extra call needed.

✗ `Input("checkbox").setName("active").toggle("checked", !!s.active)` — untyped name, hand-rolled checked; use `f.checkbox`.
✗ off-union option/radio/hidden values are a compile error: `f.radio("role", "amdin")`.
```

### Lib-own docs

- **JSDoc:** TSDoc on `checkbox` ("boolean field, or `string[]` membership with `value`"), `radio` ("value typed to the field's union; checked wired from state"), the widened `select` ("`opts.placeholder` emits a leading disabled `value=\"\"` option; group entries via `<optgroup>`; `opts.multiple` matches the bound value as a set"), and `array` ("scoped child `FormBinding` with names prefixed `name[i].`; values/errors read from the i-th element"). Document the aria side-effect on `error` and the bound controls.
- **README:** in the typed-forms section, extend the control list with `checkbox`/`radio`/`array` and the `select` `opts` arg.
- **CHANGELOG `[6.1.0]` Added:** `Form<T>` binding completeness — `f.checkbox`/`f.radio` (typed checked wiring), `f.select` placeholder/optgroup/multiple, `f.array` field-arrays, auto `aria-invalid`/`aria-describedby` on errored controls, and field-typed option/hidden/radio values.

## Guardrail check

- **zero-deps:** pass — pure TS over the existing `Input`/`Select`/`Option`/`Optgroup`/`setAria` factories; no imports added beyond `forms.ts` siblings.
- **ssr-only:** pass — synchronous; `array` is one `ForEach`-style pass, the rest are O(options) like the shipped `select`.
- **escape-by-default:** pass — all values flow through the same `setName`/`setValue`/text-content path as v6.0.0; no raw HTML emission, and the deterministic `err-{name}` id is an attribute value (escaped).
- **type-safety:** pass — `FieldValue`/`ArrayItem` tighten option/radio/hidden/array names and values to the field; closed aria union reused; bare `string` only as the documented degrade path.
- **additive-only:** pass — 6.1.0 additive; `SelectOption<V=string>` and the optional `opts` arg are backward-compatible; errored-only aria is strictly-more-correct.
- **instruction-set:** pass — this completes a primitive *combinator* (`Form<T>` typed binding) already in core; it ships no styled component. The error `<span>` stays unstyled (the styled `FieldError` shell remains user-land / future `@jtdigital/ui`, per `forms.ts:368`). The bar for "belongs in core" is met because typed field-name/value binding is type machinery, not presentation.
- **class-vocab-sync:** N/A — emits no CSS classes; `aria-invalid`/`aria-describedby` are attributes, not Tailwind classes. The tailwind-extractor + eslint-plugin vocab is untouched.
- **guideline-sync:** pass — every `api_surface` symbol is covered (CLAUDE.md index + fluent-html.md topic ref + README/JSDoc/CHANGELOG).

## Alternatives considered

- **A `checkboxGroup`/`radioGroup` factory that renders the whole group from an options list.** Rejected — that crosses into opinionated-component territory (layout, labels, fieldset/legend), which is user-land. The per-control `f.checkbox`/`f.radio` stay primitive and compose with the author's own markup.
- **Auto-rendered `<label for>` from the field name.** Rejected — label text/placement is presentation; keep the binding to the control + its name/value/checked/aria, nothing visual.
- **`aria-describedby` opt-in via a flag.** Rejected — it only fires when an error exists (no markup change otherwise), so on-by-default is strictly-more-correct accessibility with zero cost to clean forms.
- **Separate `arrayErrors` API for nested error bags.** Folded into `array`'s child binding reading `errors[name]?.[i]` — one mental model (`row.error("sku")`), no second error-shape to learn.

## Open questions

- Nested error-bag shape for `array`: `errors.items` as `ErrorBag<Item>[]` (per-row bags) vs a flat dotted-key map (`errors["items[0].sku"]`). Leaning per-row bags (`ErrorBag<Item>[]`) — composes with the child `FormBinding`. Decision for a human.
- Should `f.checkbox(name, value)` accept a `readonly string[]` *or* a `Set<string>` bound value for the membership test, or normalize to `Array.includes` only? Leaning: accept both (cheap `instanceof Set` branch). Decision for a human.
