# Track B — Form Constraint & UX Attributes (lens: form-constraints)

Lens scope: form constraint & UX attributes — `pattern`, `min`/`max`/`step`, `minlength`/`maxlength`, `multiple`, `accept`, `autocomplete` tokens, `inputmode`, `formnovalidate`/`formaction`/`formtarget`/`formenctype`, `required`/`readonly`/`disabled` wiring, `name`/`value` typing.

## Baseline of what already ships (do NOT re-propose)

Verified against `src/elements/forms.ts` + `src/elements/html-types.ts` + CHANGELOG 6.0.0→6.1.1:

- `InputTag`: `setType` (typed overloads for numeric/datetime/no-min-max), `setPlaceholder`, `setName`, `setValue`, `setAccept`, `setMin`/`setMax`/`setStep` (typed by input type), `setPattern`, `setMinlength`, `setMaxlength`, `setAutocomplete`, `setInputmode`, `setCapture`, `setList` (by `Id`). `forms.ts:15-109`
- `TextareaTag`: `setMinlength`/`setMaxlength`/`setWrap`/`setAutocomplete`/`setInputmode`. `forms.ts:147-204`
- `ButtonTag`: `setFormaction`, `setFormmethod` (incl. `"dialog"`), `setCommand`/`setCommandfor`. `forms.ts:217-274`
- `FormTag`: `setAction`/`setMethod`/`setEnctype`/`setTarget`/`setAutocomplete`/`multipart()`. `forms.ts:296-335`
- Boolean constraints — `required`, `readonly`, `disabled`, `multiple`, `novalidate`, `formnovalidate` — all via `.toggle()` against the closed `BooleanAttribute` union. `html-types.ts:151-156`
- `Form<T>` typed binding with `aria-invalid`/`aria-describedby` error wiring (6.1.1). `forms.ts:337-447`
- `setForm(id)` to associate controls with a remote `<form>` (6.1.1).

So most of the constraint surface is genuinely done. The findings below are the real holes.

---

## 1. `ButtonTag.setFormtarget` / `setFormenctype` (+ typed `setFormaction`)

**Problem / evidence.** `ButtonTag` (`forms.ts:217-274`) exposes `setFormaction` and `setFormmethod` but **not** `formtarget` or `formenctype`. These are the per-submit-button overrides of the owning `<form>`'s `target`/`enctype` — a real pattern when one form has two submit buttons posting to different endpoints with different framing/encoding (e.g. "Save" vs "Save & open report in new tab", or a multipart "Upload" button on an otherwise urlencoded form). Today the only way to set them is `addAttribute("formtarget", …)`, which CLAUDE.md explicitly forbids for standard props ("never use addAttribute for standard props") and which is untyped. The matching `<form>` setters (`setTarget: BrowsingContext`, `setEnctype`) already exist (`forms.ts:313-321`) — the button-level overrides are the asymmetric gap.

Spec: HTML Living Standard, "Form submission attributes" (`formaction`/`formenctype`/`formmethod`/`formnovalidate`/`formtarget`). Baseline: widely available (all five shipped in every engine years ago).

**Proposed API.**
```typescript
class ButtonTag {
  formenctype?: FormEnctype;   // reuse the enctype union, extracted as a named type
  formtarget?: BrowsingContext;
  setFormtarget(formtarget?: BrowsingContext): this;
  setFormenctype(formenctype?: FormEnctype): this;
}
// Extract the existing inline enctype union into a named, reused type:
type FormEnctype =
  | 'application/x-www-form-urlencoded'
  | 'multipart/form-data'
  | 'text/plain';
```
Emits `<button formtarget="_blank">`, `<button formenctype="multipart/form-data">`. Add `'formtarget'`/`'formenctype'` to the `defineSchemaKeys(ButtonTag, …)` list.

**Before / After.**
```typescript
// Before — banned addAttribute, untyped, no autocomplete
Button("Open report").setType("submit")
  .setFormaction(reportRoutes.create.path)
  .addAttribute("formtarget", "_blank");

// After — typed, fluent, BrowsingContext-checked
Button("Open report").setType("submit")
  .setFormaction(reportRoutes.create.path)
  .setFormtarget("_blank");

Button("Upload").setType("submit")
  .setFormaction("/upload").setFormenctype("multipart/form-data");
```

**Already in lib?** No. `formaction`/`formmethod` ship; `formtarget`/`formenctype` do not. `formnovalidate` is reachable via `.toggle()` (correct — it is boolean).

**Value:** medium. **Effort:** small (two setters + two schema keys + extract a named enctype type).

---

## 2. Structured `autocomplete` detail tokens (named token vocabulary)

**Problem / evidence.** `AutocompleteHint` (`html-types.ts:20-24`) lists ~15 tokens then falls back to `(string & {})`. It is missing the bulk of the WHATWG autofill *detail tokens* that materially improve real-world autofill (and are the difference between a browser offering to fill a checkout form or not): the credit-card group (`cc-name`, `cc-number`, `cc-exp`, `cc-exp-month`, `cc-exp-year`, `cc-csc`, `cc-type`), name parts (`given-name`, `family-name`, `additional-name`, `honorific-prefix`, `honorific-suffix`, `nickname`), address parts (`address-line1/2/3`, `address-level1/2/3/4`, `country-name`), telephone parts (`tel-country-code`, `tel-national`, `tel-area-code`, `tel-local`, `tel-extension`), and `bday`/`bday-day`/`bday-month`/`bday-year`, `sex`, `language`, `transaction-currency`, `transaction-amount`. The union being mostly `(string & {})` means a typo like `"cc-numbr"` autocompletes nothing and silently breaks autofill — exactly the failure class the CLAUDE.md "string literal unions — never bare string where only specific values are valid" rule targets.

The token grammar also supports an optional `shipping`/`billing` section prefix (`autocomplete="shipping postal-code"`) and a `webauthn` suffix (`autocomplete="username webauthn"`) — worth a typed combinator so the prefix can't be misspelled.

Spec: WHATWG HTML §"Autofill detail tokens" / MDN `autocomplete`. Baseline: widely available (token set stable for years; `webauthn` token Baseline-newly-available but broadly shipped).

**Proposed API.** Keep `(string & {})` tail (autocomplete is intentionally open), but front-load the full canonical token set so the common case autocompletes and typos in known tokens surface in review/eslint:
```typescript
type AutofillField =
  | 'name' | 'honorific-prefix' | 'given-name' | 'additional-name'
  | 'family-name' | 'honorific-suffix' | 'nickname' | 'username'
  | 'new-password' | 'current-password' | 'one-time-code'
  | 'organization-title' | 'organization'
  | 'street-address' | 'address-line1' | 'address-line2' | 'address-line3'
  | 'address-level1' | 'address-level2' | 'address-level3' | 'address-level4'
  | 'country' | 'country-name' | 'postal-code'
  | 'cc-name' | 'cc-given-name' | 'cc-additional-name' | 'cc-family-name'
  | 'cc-number' | 'cc-exp' | 'cc-exp-month' | 'cc-exp-year' | 'cc-csc' | 'cc-type'
  | 'transaction-currency' | 'transaction-amount'
  | 'language' | 'bday' | 'bday-day' | 'bday-month' | 'bday-year'
  | 'sex' | 'url' | 'photo'
  | 'tel' | 'tel-country-code' | 'tel-national' | 'tel-area-code'
  | 'tel-local' | 'tel-extension' | 'email' | 'impp';

type AutocompleteHint =
  | 'on' | 'off'
  | AutofillField
  | `shipping ${AutofillField}`
  | `billing ${AutofillField}`
  | `${AutofillField} webauthn`
  | (string & {});
```
No emitter change — `setAutocomplete` already writes the raw string. Pure type widening of an existing setter (`forms.ts:87`, `forms.ts:193`).

**Before / After.**
```typescript
// Before — "cc-exp" lives only in (string & {}); "shipping postal-code" untyped; typos silent
f.input("ccExp").setAutocomplete("cc-exp");
Input().setName("zip").setAutocomplete("shipping postal-cdoe");   // ✗ silently ships, no autofill

// After — canonical tokens autocomplete; the section-prefix template arm catches the typo
Input().setName("zip").setAutocomplete("shipping postal-code");   // ✓
Input().setName("zip").setAutocomplete("shipping postal-cdoe");   // ✗ compile error
```

**Already in lib?** Partially — `AutocompleteHint` exists but is ~15 tokens + open tail; the structured detail-token grammar and section/webauthn arms are not modeled.

**Value:** medium (checkout/address/login forms are exactly where SSR apps live; better autofill is real UX). **Effort:** small (type-only; no runtime, no extractor/vocab touch).

---

## 3. Typed `accept` token union for file inputs

**Problem / evidence.** `InputTag.accept` is bare `string` (`forms.ts:20`, setter `forms.ts:52`). The `accept` attribute has a small, well-defined value grammar: the three media wildcards (`image/*`, `video/*`, `audio/*`), concrete MIME types, and `.`-prefixed file extensions, comma-joined. Bare `string` gives no autocomplete and lets `"image"` (missing `/*`) or `"jpg"` (missing the leading `.`) through silently — both are common, both make the picker filter wrong.

Spec: HTML Living Standard `<input accept>`. Baseline: widely available.

**Proposed API.** An open union that autocompletes the wildcards + an `.ext` template arm, plus an overload that accepts a list and comma-joins:
```typescript
type AcceptToken =
  | 'image/*' | 'video/*' | 'audio/*'
  | `.${string}`                  // file extension
  | `${string}/${string}`         // concrete MIME
  ;
class InputTag {
  setAccept(accept?: AcceptToken): this;
  setAccept(accept: readonly AcceptToken[]): this;   // joins with ","
}
```
Emits `<input accept="image/*,.heic">`. List overload removes hand-rolled `.join(",")`.

**Before / After.**
```typescript
// Before — bare string; "image" (no /*) and "png" (no dot) both compile and silently mis-filter
Input("file").setAccept("image, png");

// After — wildcard autocompletes; the dot/MIME shape is encoded; list overload joins
Input("file").setAccept(["image/*", ".heic", "application/pdf"]);
```

**Already in lib?** No — `setAccept` exists but is bare `string`.

**Value:** low–medium (file inputs are common in SSR admin apps; the win is modest because `accept` is forgiving at runtime). **Effort:** small (type + one overload).

---

## 4. `SelectTag.multiple` ergonomics + `Form<T>` multi-select binding

**Problem / evidence.** A `<select multiple>` is set today via `Select(...).toggle("multiple")` (correct, boolean). But the `Form<T>` `select` binding (`forms.ts:396-404`) only marks **one** option selected (`String(selected) === o.value`) — it cannot bind an array-valued field to a multi-select, and there is no typed path to emit `multiple` + select several options from a `string[]` value. Multi-select is the one constraint-bearing control the typed form builder silently can't represent; callers drop to hand-built `Option().toggle("selected", …)` loops, losing the `keyof T` name typing and error wiring.

Spec: HTML `<select multiple>` + `<option selected>`. Baseline: widely available.

**Proposed API.** Add a dedicated multi-select binding (not an overload of `select`, to keep the single-value path's narrow `string` semantics):
```typescript
interface FormBinding<T> {
  multiselect(name: keyof T & string, options: readonly SelectOption[]): SelectTag;
}
// Emits <select multiple name=…>; marks selected every option whose value is in
// the bound array field (Array.isArray(values[name]) ? values[name].map(String) : []).
```
Reuses the existing `markInvalid` error wiring. Single-value `select` is unchanged.

**Before / After.**
```typescript
// Before — typed builder can't do it; hand-rolled, untyped name, no error wiring
Select(...roles.map(r =>
  Option(r.label).setValue(r.value).toggle("selected", user.roles.includes(r.value))
)).setName("roles").toggle("multiple");

// After — typed name, array-aware selected marking, aria error wiring for free
Form<UpdateUserReq>({ values: user, errors }, (f) => [
  f.multiselect("roles", roleOptions),   // <select multiple>, each held role pre-selected
  f.error("roles"),
]);
```

**Already in lib?** No — single-value `f.select` ships; `multiple` boolean ships via `.toggle()`; the **array-binding** multi-select does not.

**Value:** medium. **Effort:** medium (new binding fn + array-membership selected logic; small surface but touches the `Form<T>` builder contract).

---

## Top picks

- **#1 `ButtonTag.setFormtarget` / `setFormenctype`** — closes a clear asymmetry (form has them, button doesn't), small, removes a forbidden `addAttribute`. Highest signal-to-effort.
- **#2 structured `autocomplete` detail tokens** — type-only widening with real autofill UX payoff on exactly the forms SSR apps ship (checkout/address/login).
- **#4 `Form<T>.multiselect`** — the one constraint-bearing control the typed form builder can't yet represent.
