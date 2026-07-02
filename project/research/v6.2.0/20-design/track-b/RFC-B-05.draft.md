---
id: RFC-B-05
track: B
resolves: [#45, #48, #49, #69, #63, #50]
api_surface:
  - "type AcceptToken = 'image/*' | 'video/*' | 'audio/*' | `.${string}` | `${string}/${string}` | (string & {})"
  - "InputTag.accept?: string"
  - "InputTag.setAccept(accept?: AcceptToken): this"
  - "InputTag.setAccept(accept: readonly AcceptToken[]): this"
  - "InputTag.dirname?: string"
  - "InputTag.setDirname(dirname?: string): this"
  - "TextareaTag.dirname?: string"
  - "TextareaTag.setDirname(dirname?: string): this"
  - "type AutofillField = (WHATWG §4.10.18.7 detail-token union — 60 members)"
  - "type AddressPurpose = 'shipping' | 'billing'"
  - "type AutocompleteHint = 'on' | 'off' | AutofillField | `${AddressPurpose} ${AutofillField}` | `${AutofillField} webauthn` | `${AddressPurpose} ${AutofillField} webauthn` | (string & {})"
  - "SelectTag.autocomplete?: AutocompleteHint"
  - "SelectTag.setAutocomplete(autocomplete?: AutocompleteHint): this"
  - "type FormEnctype = 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain'"
  - "FormTag.enctype?: FormEnctype  (retyped, byte-identical)"
  - "FormTag.setEnctype(enctype?: FormEnctype): this  (retyped, byte-identical)"
  - "ButtonTag.formtarget?: BrowsingContext"
  - "ButtonTag.setFormtarget(formtarget?: BrowsingContext): this"
  - "ButtonTag.formenctype?: FormEnctype"
  - "ButtonTag.setFormenctype(formenctype?: FormEnctype): this"
  - "OutputTag.setFor(...forIds: (string | Id)[]): this  (widened from single-arg)"
breaking: additive
guardrails_checked: ["§11.1", "§11.2", "§11.3", "§11.4", "§11.5", "§11.6", "§11.7", "§11.8"]
guideline_updates:
  - "README.md (lib) — Forms section: typed `accept` (single token or token-array), `dirname` bidi-companion convention (`${name}.dir`), structured `autocomplete` (payment/address tokens + shipping/billing grammar + webauthn), per-submit-button form-association overrides (`formtarget`/`formenctype`), and variadic `<output for>` id-set"
  - "fluent-html.md — attribute reference rows: InputTag setAccept (AcceptToken + array overload) / setDirname; TextareaTag setDirname; SelectTag setAutocomplete; ButtonTag setFormtarget / setFormenctype; OutputTag setFor (variadic). Export the AcceptToken / AutofillField / AddressPurpose / FormEnctype unions for app-side prop typing"
  - "JSDoc — on every new/retyped setter in src/elements/forms.ts and the new/widened unions in src/elements/html-types.ts (the open-by-spec posture of AcceptToken/AutocompleteHint; the `${name}.dir` dirname convention; the space-set semantics of setFor; FormEnctype as the one enctype source of truth)"
  - "CHANGELOG.md — 6.2.0 'Added' entry covering AcceptToken + array overload, setDirname (Input/Textarea), structured AutocompleteHint widening + AutofillField/AddressPurpose exports, SelectTag.setAutocomplete, ButtonTag.setFormtarget/setFormenctype + FormEnctype extraction, OutputTag.setFor variadic"
  - "../fluent-html-eslint-plugin/README.md + src/rules/prefer-set-method.ts — add `dirname → setDirname`, `formtarget → setFormtarget`, `formenctype → setFormenctype` to the attr→setter map so `addAttribute(\"dirname\", …)` is flagged (the map already routes `accept`/`autocomplete`/`enctype`/`for` and is value-union agnostic)"
  - "../fluent-html-tailwind-extractor/README.md — no functional change (attribute-only RFC, no Tailwind classes); note explicitly"
impact: "Closes the form-control completeness gap with one convergent contract: file inputs get a typo-safe `accept` (a `'image'`/`'jpg'` mistake that silently breaks the picker becomes a compile error) with an ergonomic token-array overload; `<input>`/`<textarea>` gain the standards bidi `dirname` submit mechanism (today only reachable via the forbidden `addAttribute`); `autocomplete` is widened from a flat 14-token list to the full WHATWG detail-token set plus shipping/billing/webauthn grammar, reviving typo-safety for checkout/address/login forms across every autocomplete-bearing control; `<select>` joins them (it was the lone autofill-eligible control missing the setter); per-submit-button form-association overrides reach parity with `<form>` via `setFormtarget`/`setFormenctype` (the enctype union extracted to a single `FormEnctype` source of truth); and `<output for>` becomes the spec'd space-separated id-SET. All additive within v6; every current call renders byte-identically."
effort: L
depends_on: []
status: proposed
---

# RFC-B-05 — Form control completeness (typed accept, dirname, structured autocomplete, form-association overrides, output id-set)

One convergent pass over the residual gaps in the form-control surface. The
input-type coverage and the constraint setters (`min`/`max`/`step`/`pattern`/
`minlength`/`maxlength`/`inputmode`/`capture`/`list`) are **already complete and
type-narrowed** in 6.1.x — this RFC does **not** re-propose them. It files only
the six genuine primitive gaps the roadmap actually owns here:

1. **#69** — typed `accept` (an `AcceptToken` union + a token-array overload) so
   `'image'`/`'jpg'` stop type-checking silently.
2. **#48** — `setDirname` on `InputTag` + `TextareaTag` (the bidi submit
   mechanism, today only reachable via `addAttribute`).
3. **#63** — structured `autocomplete`: widen `AutocompleteHint` to the full
   WHATWG detail-token set + shipping/billing/webauthn grammar (type-only).
4. **#49** — `SelectTag.setAutocomplete` (reusing the widened `AutocompleteHint`).
5. **#45** — `ButtonTag.setFormtarget`/`setFormenctype` (per-submit-button
   form-association overrides, reaching parity with `<form>`), with the enctype
   union extracted to a single `FormEnctype` (CONVERGE).
6. **#50** — `OutputTag.setFor` widened to the spec'd variadic id-**set**.

These are plain semantic HTML attributes — instruction-set primitives, not
`@jtdigital/ui` component opinion — and every value routes through the renderer's
existing `escapeAttr` choke point. **No Tailwind classes are emitted by anything
in this RFC**, so the class-string contract (§11.7) is not engaged.

## Problem

Cite real code. Verified against `src/elements/forms.ts`, `src/elements/html-types.ts`,
`src/index.ts`, and `CHANGELOG.md` (6.0.0→6.1.1).

**What is already shipped (and must NOT be re-proposed).** Input *type* coverage
is complete: `InputType` (`html-types.ts:5-9`) enumerates all 22 HTML input
types, and `Input()`'s overloads (`forms.ts:131-139`) return
`NumericInputTag`/`DateTimeInputTag`/`NoMinMaxInputTag` so `min`/`max`/`step` are
already type-narrowed per type (`forms.ts:112-128`). Every constraint setter is
present and `defineSchemaKeys`-registered (`forms.ts:109`):
`setPattern`/`setMin`/`setMax`/`setStep`/`setMinlength`/`setMaxlength`/`setInputmode`
(closed `InputMode`, `html-types.ts:44`)/`setAccept`/`setCapture`/`setList`.
`multiple` and `required` are **boolean attributes** set via
`.toggle("multiple")`/`.toggle("required")` (closed `BooleanAttribute`,
`html-types.ts:151-156`) — the named boolean setters were deliberately removed in
v6 (`html-types.ts:148-149`). **No `setMultiple`/`setRequired` may be added** (it
would re-open that surface and violate CONVERGE, §11.6).

The six residual gaps:

- **`accept` is bare `string` (#69).** `InputTag.accept?: string`
  (`forms.ts:20`) and `setAccept(accept?: string)` (`forms.ts:52`) let
  `.setAccept("image")` or `.setAccept("jpg")` type-check silently — both are
  invalid `accept` values that break the native file picker with **zero compile
  signal**. The real site does this today
  (`projects-template/.../account.page.view.ts:72-76`):
  `StyledInput().setType("file").setName("avatar").setAccept("image/png,image/jpeg,image/webp,image/gif")`
  — a hand-written comma list with no per-token checking.
- **`dirname` is missing entirely (#48).** The standards bidi/RTL submit
  mechanism — a companion field that submits the entered text's resolved
  direction (`ltr`/`rtl`) under `${name}.dir` — has no setter on `InputTag`
  (`forms.ts:15-107`) or `TextareaTag` (`forms.ts:147-202`). The only path today
  is the forbidden `addAttribute("dirname", …)`.
- **`AutocompleteHint` is a flat 14-token list (#63).** `html-types.ts:20-24`
  is `'on'|'off'|'name'|'email'|'username'|'new-password'|'current-password'|'organization'|'street-address'|'country'|'postal-code'|'tel'|'url'|'one-time-code'|(string & {})`.
  It has **no** `cc-*` payment tokens, **no** `address-line*`/`address-level*`
  tokens, **no** `shipping`/`billing` prefix grammar, **no** `webauthn` suffix. So
  `setAutocomplete("cc-number")` and `setAutocomplete("shipping postal-code")`
  compile only via the `(string & {})` tail — and a real autofill typo
  (`"new-passwrod"`) breaks browser autofill with no compile signal. CHANGELOG
  6.0.0→6.1.1 never touches this union.
- **`SelectTag` has no `setAutocomplete` (#49).** `<select>` is autofill-eligible
  (country/state pickers) but `SelectTag` (`forms.ts:449-462`) carries only
  `name`/`size` — it is the lone form control missing the `AutocompleteHint` that
  `InputTag` (`forms.ts:27`) and `TextareaTag` (`forms.ts:155`) already have.
- **`ButtonTag` lacks `formtarget`/`formenctype` (#45).** `ButtonTag`
  (`forms.ts:217-272`) has `formaction` (`:221`) and `formmethod` (`:222`) but
  **not** the `formtarget`/`formenctype` pair that `<form>` already exposes via
  `setTarget` (`forms.ts:318`) + `setEnctype` (`forms.ts:313`) — an asymmetric
  gap. A submit button that posts a file upload to a new tab needs raw
  `.addAttribute("formtarget","_blank").addAttribute("formenctype","multipart/form-data")`.
  Worse, the enctype literal `'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain'`
  is **inlined three times** in `FormTag` (`forms.ts:299`, `:313`; and `multipart()`
  at `:329-332`) — adding it to `ButtonTag` would inline it a fourth time.
- **`OutputTag.setFor` takes a single id (#50).** `<output for>` is spec'd as a
  **space-separated id SET** (the operands a result is computed from), but
  `setFor` (`forms.ts:533`) takes one `string | Id`. A calc result referencing two
  operands needs `addAttribute("for","a b")`.

**Verified not shipped.** Grep over `src/` + `CHANGELOG.md` returns no
`formtarget`/`formenctype`/`dirname`/`SelectTag.autocomplete`/variadic-`for`, and
no widened `accept`/`autocomplete` union. The eslint plugin's
`prefer-set-method` map (`../fluent-html-eslint-plugin/src/rules/prefer-set-method.ts:31-37`)
already routes `accept`/`autocomplete`/`enctype`/`for` to their setters and is
value-union-agnostic, so it needs new entries only for `dirname`/`formtarget`/`formenctype`.

## Proposed API

Full TS signatures — **the contract**. Five touch points: two new unions
(`AcceptToken`, `AddressPurpose`) + one new field-token union (`AutofillField`)
+ one extracted union (`FormEnctype`) + the widened `AutocompleteHint`; new
setters on `InputTag`/`TextareaTag`/`SelectTag`/`ButtonTag`; the variadic
`OutputTag.setFor`.

### `src/elements/html-types.ts` — `AcceptToken` (#69, OPEN by spec)

```typescript
/**
 * `<input type=file accept>` token. The spec is **open-ended** — any MIME type
 * (incl. long ones like `application/vnd.openxmlformats-officedocument.wordprocessingml.document`)
 * and any `.ext` are legal — so this union keeps the `(string & {})` tail by
 * necessity. The wildcard groups (`image/*`/`video/*`/`audio/*`) and the
 * `${string}/${string}` MIME shape and `.${string}` extension shape autocomplete
 * and catch the common typo (`'image'`/`'jpg'` no longer match), while arbitrary
 * valid values still compile. Do NOT close this union (contrast `FetchPriority`,
 * correctly closed because its enum is fixed).
 */
export type AcceptToken =
  | 'image/*' | 'video/*' | 'audio/*'
  | `.${string}`
  | `${string}/${string}`
  | (string & {});
```

### `src/elements/html-types.ts` — structured `autocomplete` (#63, type-only)

Replaces the flat list at `html-types.ts:20`:

```typescript
/** Address purpose prefix for an autofill token. */
export type AddressPurpose = 'shipping' | 'billing';

/**
 * WHATWG autofill detail tokens (HTML §4.10.18.7) — the field a control
 * autofills. Pin additions to that spec section; treat new tokens as future
 * additive bumps.
 */
export type AutofillField =
  // Name
  | 'name' | 'honorific-prefix' | 'given-name' | 'additional-name'
  | 'family-name' | 'honorific-suffix' | 'nickname'
  // Account / login
  | 'username' | 'new-password' | 'current-password' | 'one-time-code'
  // Org / title
  | 'organization-title' | 'organization'
  // Address
  | 'street-address' | 'address-line1' | 'address-line2' | 'address-line3'
  | 'address-level4' | 'address-level3' | 'address-level2' | 'address-level1'
  | 'country' | 'country-name' | 'postal-code'
  // Payment
  | 'cc-name' | 'cc-given-name' | 'cc-additional-name' | 'cc-family-name'
  | 'cc-number' | 'cc-exp' | 'cc-exp-month' | 'cc-exp-year' | 'cc-csc' | 'cc-type'
  // Locale / currency
  | 'transaction-currency' | 'transaction-amount' | 'language'
  // Birthday
  | 'bday' | 'bday-day' | 'bday-month' | 'bday-year'
  // Sex / URL / media
  | 'sex' | 'url' | 'photo'
  // Telephone
  | 'tel' | 'tel-country-code' | 'tel-national' | 'tel-area-code'
  | 'tel-local' | 'tel-local-prefix' | 'tel-local-suffix' | 'tel-extension'
  // Contact
  | 'email' | 'impp';

/**
 * `autocomplete` attribute value. `'on'`/`'off'` are the bare modes; every other
 * value is an autofill *detail token* — optionally prefixed with an address
 * purpose (`shipping`/`billing`) and/or suffixed with `webauthn` (offers a
 * passkey from the credential picker). The `(string & {})` tail keeps the
 * long-tail grammar (opaque `section-*` tokens, the `home`/`work`/`mobile`/`fax`/
 * `pager` contact-recipient token) compiling while the canonical 99%
 * (field, shipping/billing field, field+webauthn) autocompletes.
 */
export type AutocompleteHint =
  | 'on' | 'off'
  | AutofillField
  | `${AddressPurpose} ${AutofillField}`
  | `${AutofillField} webauthn`
  | `${AddressPurpose} ${AutofillField} webauthn`
  | (string & {});
```

### `src/elements/html-types.ts` — `FormEnctype` (#45, extracted once)

```typescript
/**
 * `enctype` / `formenctype` — how the form payload is encoded. The single source
 * of truth for both `FormTag` and `ButtonTag` (CONVERGE). Closed — the spec enum
 * is a fixed three-value set.
 */
export type FormEnctype =
  | 'application/x-www-form-urlencoded'
  | 'multipart/form-data'
  | 'text/plain';
```

### `src/elements/forms.ts` — `InputTag` (#69 accept, #48 dirname)

```typescript
class InputTag {
  accept?: string;     // serialized field stays string; the union guards the setter param
  dirname?: string;

  /** Set `accept` (file inputs) — one token, or a token array joined with `,`.
   *  Each token is checked against `AcceptToken`, so `'image'`/`'jpg'` is a
   *  compile error while any valid MIME/.ext still compiles via the open tail.
   *  An empty array emits no attribute. */
  setAccept(accept?: AcceptToken): this;
  setAccept(accept: readonly AcceptToken[]): this;

  /** Set `dirname` — the bidi submit companion. The browser submits the entered
   *  text's resolved direction (`ltr`/`rtl`) under this field name; the
   *  convention is `${name}.dir`. Pass a FIELD NAME, not a direction value. */
  setDirname(dirname?: string): this;
}
```

```typescript
// impl
setAccept(accept?: AcceptToken | readonly AcceptToken[]): this {
  this.accept = Array.isArray(accept)
    ? (accept.length ? accept.join(',') : undefined)   // empty array ⇒ omit
    : (accept as string | undefined);
  return this;
}
setDirname(dirname?: string): this { this.dirname = dirname; return this; }
```

### `src/elements/forms.ts` — `TextareaTag` (#48 dirname)

```typescript
class TextareaTag {
  dirname?: string;
  /** See {@link InputTag.setDirname}. */
  setDirname(dirname?: string): this;
}
```

### `src/elements/forms.ts` — `SelectTag` (#49 autocomplete)

```typescript
class SelectTag {
  autocomplete?: AutocompleteHint;   // reuses the widened union — zero new type
  setAutocomplete(autocomplete?: AutocompleteHint): this;
}
```

### `src/elements/forms.ts` — `ButtonTag` (#45 form-association overrides)

```typescript
class ButtonTag {
  formtarget?: BrowsingContext;      // reuses the shipped open BrowsingContext union
  formenctype?: FormEnctype;

  /** Override the form's `target` for this submit button (e.g. `"_blank"`). */
  setFormtarget(formtarget?: BrowsingContext): this;

  /** Override the form's `enctype` for this submit button (e.g.
   *  `"multipart/form-data"` for a single file-upload button). */
  setFormenctype(formenctype?: FormEnctype): this;
}
```

### `src/elements/forms.ts` — `FormTag` retype (#45, byte-identical)

```typescript
class FormTag {
  enctype?: FormEnctype;                          // was inline literal (forms.ts:299)
  setEnctype(enctype?: FormEnctype): this;        // was inline literal (forms.ts:313)
  // multipart() body unchanged — still assigns 'multipart/form-data' (a FormEnctype member)
}
```

### `src/elements/forms.ts` — `OutputTag.setFor` widened (#50)

```typescript
class OutputTag {
  for?: string;   // serialized as a space-separated id-set
  /** Associate this `<output>` with the operand element(s) named by `forIds` —
   *  a space-separated id SET per spec. Each id is `extractId`-normalized (no
   *  `#`). A single-arg call stays byte-identical (back-compatible widening). */
  setFor(...forIds: (string | Id)[]): this;
}
```

```typescript
// impl — single id ⇒ same output as today; many ⇒ joined with ' '
setFor(...forIds: (string | Id)[]): this {
  this.for = forIds.length
    ? forIds.map(extractId).map(s => s.trim()).filter(Boolean).join(' ')
    : undefined;
  return this;
}
```

### `defineSchemaKeys` additions (append, order-stable)

```typescript
defineSchemaKeys(InputTag,   [/* …existing… */, 'dirname']);                  // accept already present
defineSchemaKeys(TextareaTag,[/* …existing… */, 'dirname']);
defineSchemaKeys(SelectTag,  ['name', 'size', 'autocomplete']);
defineSchemaKeys(ButtonTag,  [/* …existing… */, 'formtarget', 'formenctype']);
// FormTag + OutputTag schema keys unchanged (retype / widen only).
```

### Barrel exports (`src/index.ts`)

Add `AcceptToken`, `AutofillField`, `AddressPurpose`, `FormEnctype` to the HTML
attribute-types export block (`index.ts:26-55`), beside the existing
`AutocompleteHint`/`BrowsingContext`/`FormMethod` re-exports — mirroring the 6.1.x
idiom of exporting each union next to its setter so apps can type reusable hint
maps and component props. `AutocompleteHint` is already exported (`index.ts:31`).

### Emitted output (the contract)

| Call | Output |
| --- | --- |
| `Input("file").setName("avatar").setAccept("image/png,image/jpeg")` | `accept="image/png,image/jpeg"` (unchanged) |
| `Input("file").setAccept(["image/png", "image/jpeg", "image/webp"])` | `accept="image/png,image/jpeg,image/webp"` |
| `Input("file").setAccept([])` | *(no `accept` attr)* |
| `Textarea().setName("comment").setDirname("comment.dir")` | `<textarea name="comment" dirname="comment.dir">` |
| `Input("text").setName("zip").setAutocomplete("shipping postal-code")` | `autocomplete="shipping postal-code"` |
| `Input("text").setName("user").setAutocomplete("username webauthn")` | `autocomplete="username webauthn"` |
| `Select(...).setName("country").setAutocomplete("country")` | `<select name="country" autocomplete="country">` |
| `Button("Upload").setType("submit").setFormaction("/upload").setFormenctype("multipart/form-data").setFormtarget("_blank")` | `<button type="submit" formaction="/upload" formenctype="multipart/form-data" formtarget="_blank">` |
| `Output().setFor(ids.a, ids.b).setName("result")` | `<output for="a b" name="result">` |
| `Output().setFor(ids.a)` | `<output for="a">` (single-arg byte-identical) |

No Tailwind classes are emitted by anything in this RFC.

## Worked examples

**#69 — typed `accept` (the real site, `account.page.view.ts:72-76`).**

```typescript
// Before — bare string: 'image'/'jpg' type-check and silently break the picker:
StyledInput().setType("file").setName("avatar")
  .setAccept("image/png,image/jpeg,image/webp,image/gif")
  .toggle("required");

// After — the array overload reads better for a MIME list and checks each token:
StyledInput().setType("file").setName("avatar")
  .setAccept(["image/png", "image/jpeg", "image/webp", "image/gif"])  // 'image'/'jpg' now compile errors
  .toggle("required");
```

**#48 — bidi field that submits its resolved direction.**

```typescript
// Before — only via the forbidden escape hatch:
Textarea().setName("comment").addAttribute("dirname", "comment.dir");
// After:
Textarea().setName("comment").setDirname("comment.dir");   // server receives comment.dir=ltr|rtl
```

**#63 / #49 — checkout autofill, previously untyped, now grammar-checked.**

```typescript
// Before — all fall through (string & {}); 'cc-numbr' compiles silently:
Input("text").setName("card").setAutocomplete("cc-number");
Input("text").setName("zip").setAutocomplete("shipping postal-code");

// After — first-class tokens autocomplete; a typo is a compile error:
Input("text").setName("card").setAutocomplete("cc-number");          // ✓ token
Input("text").setName("zip").setAutocomplete("shipping postal-code"); // ✓ grammar
Select(...countryOptions).setName("country").setAutocomplete("country"); // #49 — select joins in
Input("text").setName("card").setAutocomplete("cc-numbr");           // ✗ compile error
```

**#45 — per-submit-button form-association override.**

```typescript
// Before — Button has setFormaction/setFormmethod but not the target/enctype pair:
Button("Upload").setType("submit").setFormaction("/upload")
  .addAttribute("formenctype", "multipart/form-data")
  .addAttribute("formtarget", "_blank");
// After — parity with <form>'s setTarget/setEnctype:
Button("Upload").setType("submit").setFormaction("/upload")
  .setFormenctype("multipart/form-data").setFormtarget("_blank");
```

**#50 — `<output>` referencing two operands.**

```typescript
const ids = defineIds(["a", "b"] as const);
// Before:
Output().setName("result").addAttribute("for", "a b");
// After:
Output().setFor(ids.a, ids.b).setName("result");   // <output for="a b" name="result">
```

The only in-repo call site affected is the `account.page.view.ts` `setAccept`
above — and it keeps compiling byte-identically (the single-string overload is
unchanged); the array form is an optional readability upgrade. No `dirname`/
`formtarget`/`formenctype`/`SelectTag.setAutocomplete`/multi-`for` call sites
exist today (grep over `fluent-html-demos` + `projects-template`), so the rest is
net-new capability.

## Type-safety story

- **`accept` is open *by spec*, not by laziness.** `AcceptToken` keeps
  `(string & {})` because the `accept` grammar admits any MIME type and any file
  extension — a closed union would reject legitimate values. But the wildcard
  arms + `${string}/${string}` + `.${string}` shapes mean `'image'` and `'jpg'`
  (the actual common bugs) no longer match. Documented so a reviewer does not
  "tighten" it (contrast `FetchPriority`, correctly closed). The serialized field
  stays `string`; only the *setter parameter* is union-guarded.
- **`AutocompleteHint` net-tightens.** Replacing a 14-token-`+`-open-tail union
  with the full WHATWG token set + template-literal grammar means previously
  silent payment/address typos now autocomplete-and-check. The `(string & {})`
  tail stays (for `section-*` / contact-recipient long-tail), so this is strictly
  additive — every prior call still compiles, but real tokens now have IDE
  support and near-token typos surface. Reused verbatim by Input/Textarea/Select,
  so one widening hardens every autocomplete-bearing control at once.
- **`FormEnctype` is closed and single-sourced.** One named union for both
  `FormTag` and `ButtonTag`; `setFormenctype("multipart/form-dat")` is a compile
  error. The `FormTag` retype is structurally identical to the old inline literal,
  so render is byte-identical (§11.5).
- **`formtarget` reuses the shipped open `BrowsingContext`** — `"_blank"`
  autocompletes; named contexts pass via the open tail, matching `setTarget`.
- **`dirname` is free-text `string`.** It is a field *name* (no value-shape
  enforcement is possible or desirable); the `${name}.dir` convention is
  documentation-only, mirroring `setName`. JSDoc warns callers not to pass a
  literal direction.
- **`OutputTag.setFor` widening is back-compatible.** `(string | Id)[]` with the
  single-arg call byte-identical; `extractId` is reused (no second id path).
- **No boolean-setter regression.** `multiple`/`required` stay `.toggle(...)`;
  this RFC adds **no** `setMultiple`/`setRequired` (CONVERGE).
- **Compile-only tests** (`test/types/*.test-d.ts`): `setAccept("image")` ✗ /
  `setAccept("image/png")` ✓ / `setAccept(["image/png"])` ✓; `setAutocomplete("cc-numbr")`
  ✗ / `setAutocomplete("shipping postal-code")` ✓; `setFormenctype("text/plian")` ✗;
  `Output().setFor(a, b)` ✓.

## Migration & compatibility

**Additive within v6.** No emitted-output change for any current call:

- `setAccept(string)` is unchanged (the array overload is new).
- `AutocompleteHint` widening is strictly additive — the old `(string & {})` tail
  guaranteed every prior value compiled, and it still does.
- The `FormTag` enctype retype is a pure type extraction (same literal members) —
  byte-identical render; `multipart()` is untouched.
- `OutputTag.setFor` widening keeps the single-arg call byte-identical.
- New fields (`dirname`/`formtarget`/`formenctype`/`SelectTag.autocomplete`) are
  optional and absent on existing tags.

v6 is greenfield — no v5 back-compat surface. The one honest reviewer note: the
literal sub-area title "input types / constraint attrs" is ~90% already shipped;
the value here is **only** the six gaps above, and the RFC must not re-introduce
the shipped setters or add the forbidden `setMultiple`/`setRequired`.

## Docs impact (§11.8)

1. **`README.md` (lib root)** — extend the **Forms** section with a
   form-control-completeness subsection:

   ```markdown
   #### File inputs — typed `accept`

   ```typescript
   Input("file").setName("avatar")
     .setAccept(["image/png", "image/jpeg", "image/webp"]);  // 'image'/'jpg' are compile errors
   ```

   #### Bidi text — `dirname`

   `setDirname` submits the entered text's resolved direction under a companion
   field; the convention is `${name}.dir`:

   ```typescript
   Textarea().setName("comment").setDirname("comment.dir");  // server gets comment.dir=ltr|rtl
   ```

   #### Structured autocomplete

   The full WHATWG detail-token set, with `shipping`/`billing` prefixes and a
   `webauthn` suffix — typo-safe across `Input`/`Textarea`/`Select`:

   ```typescript
   Input("text").setName("card").setAutocomplete("cc-number");
   Input("text").setName("zip").setAutocomplete("shipping postal-code");
   Select(...).setName("country").setAutocomplete("country");
   ```

   #### Per-submit-button form-association overrides

   ```typescript
   Button("Upload").setType("submit").setFormaction("/upload")
     .setFormenctype("multipart/form-data").setFormtarget("_blank");
   ```

   #### `<output>` id-set

   ```typescript
   Output().setFor(ids.a, ids.b).setName("result");  // <output for="a b">
   ```
   ```

2. **`fluent-html.md`** — add attribute reference rows: `InputTag`
   `setAccept` (AcceptToken + array overload) / `setDirname`; `TextareaTag`
   `setDirname`; `SelectTag` `setAutocomplete`; `ButtonTag`
   `setFormtarget`/`setFormenctype`; `OutputTag` `setFor` (variadic id-set).
   Document the exported `AcceptToken` (open by spec), `AutofillField`,
   `AddressPurpose`, and `FormEnctype` (single enctype source of truth) unions for
   app-side prop typing, plus the `${name}.dir` `dirname` convention and the
   space-set semantics of `for`.

3. **JSDoc** — on every new/retyped setter (drafted in *Proposed API*) and the
   new/widened unions in `html-types.ts`: the open-by-spec posture of
   `AcceptToken`/`AutocompleteHint`; the `${name}.dir` convention; the
   `FormEnctype` CONVERGE note; the `for` id-set semantics.

4. **`CHANGELOG.md`** — a 6.2.0 "Added" entry covering: `AcceptToken` + the
   `setAccept` array overload; `setDirname` (Input/Textarea); the structured
   `AutocompleteHint` widening + `AutofillField`/`AddressPurpose` exports;
   `SelectTag.setAutocomplete`; `ButtonTag.setFormtarget`/`setFormenctype` + the
   `FormEnctype` extraction; the variadic `OutputTag.setFor`.

5. **`../fluent-html-eslint-plugin/`** — add `dirname → setDirname`,
   `formtarget → setFormtarget`, `formenctype → setFormenctype` to the
   `prefer-set-method` attr→setter map (`src/rules/prefer-set-method.ts`, which
   already routes `accept`/`autocomplete`/`enctype`/`for` and is value-union
   agnostic), and note the additions in the plugin README. This makes
   `addAttribute("dirname", …)` a lint error, closing the escape hatch this RFC
   replaces.

6. **`../fluent-html-tailwind-extractor/README.md`** — **no functional change**
   (attribute-only RFC, no Tailwind classes). Note explicitly (one line) that no
   vocab/extractor update is implied.

### Lockstep (vocab + extractor + eslint)

**N/A for the class-string contract.** Every setter here emits a semantic HTML
*attribute* (`accept`/`dirname`/`autocomplete`/`formtarget`/`formenctype`/`for`),
never a Tailwind class — no `src/class-vocab/vocab.ts` row, no extractor token.
The escape/safety guarantee rides on the renderer's `escapeAttr` choke point, not
the class-string contract (§11.7 not engaged). The **eslint** lockstep is the
attr→setter map addition above (item 5), so the typed setters are recommended
over `addAttribute` consistently.

## Guardrail check

- **§11.1 zero-deps** — no new runtime dependency; setters do plain field
  assignment (+ `Array.isArray`/`join` for the accept overload, `extractId`/`Set`
  reuse for `for`).
- **§11.2 SSR-only / sync** — all setters are synchronous; render path stays sync
  (plain attribute emit).
- **§11.3 escape-by-default** — `accept`/`dirname`/`autocomplete`/`formtarget`/
  `formenctype`/`for` all flow through the renderer's existing `escapeAttr` choke
  point; no URL/markup context, no new XSS sink.
- **§11.4 type-safety** — `AcceptToken` is open *by spec necessity* (documented,
  but catches `'image'`/`'jpg'`); `AutocompleteHint` net-tightens (full token set
  + grammar replacing a 14-token flat list); `FormEnctype`/`BrowsingContext` are
  the established closed/open unions; `dirname` is free-text by spec; no `any`, no
  bare `string` where literals are valid.
- **§11.5 compat** — all six items additive within v6; every current call renders
  byte-identically (single-arg `setAccept`, `FormTag` enctype retype, single-arg
  `setFor`); greenfield, no v5 back-compat.
- **§11.6 idioms** — `set*` override setters; array overload (not options object)
  for the single scalar `accept` value; NO `setMultiple`/`setRequired`
  (boolean-setter surface stays removed); `FormEnctype` is the one enctype source
  of truth — exactly one way to set each attribute (CONVERGE).
- **§11.7 class-string contract** — N/A; no Tailwind classes emitted, nothing
  touches vocab/extractor.
- **§11.8 docs/guideline-sync** — lib README (Forms subsection) + `fluent-html.md`
  rows + JSDoc on every new/retyped setter + CHANGELOG + the eslint map/README
  additions + a one-line attribute-only note in the extractor README; covers
  every symbol in `api_surface`.

## Alternatives considered

- **Re-propose the input types / constraint setters wholesale.** Rejected —
  `InputType` coverage and `min`/`max`/`step`/`pattern`/`minlength`/`maxlength`/
  `inputmode`/`capture`/`list` are **already shipped and type-narrowed** in 6.1.x.
  Only the six gaps above are net-new.
- **Add `setMultiple` / `setRequired`.** Rejected — both are boolean attributes
  via `.toggle("multiple")`/`.toggle("required")`; adding setters re-opens the
  surface v6 deliberately removed and violates CONVERGE (§11.6).
- **Close `AcceptToken`.** Rejected — the `accept` grammar is open-ended by spec;
  a closed union would reject legitimate MIME/`.ext` values. The wildcard +
  shaped arms catch the real typos without sacrificing validity.
- **Enumerate the full autofill cartesian product** (section × purpose ×
  recipient × field × webauthn). Rejected — recipient(5) × purpose(2) × field(60)
  × webauthn would blow past ~1k union members and tank tsserver completions. The
  pragmatic shape (field, shipping/billing field, field[+webauthn]) covers the
  99% checkout/address/login payload; the long tail rides `(string & {})`. The
  contact-recipient token is **deliberately not** a third template factor.
- **`OutputTag.setFor` taking a `string[]`** instead of variadic. Rejected —
  variadic matches the variadic-children house style and the sibling
  `ThTag/TdTag.setHeaders` id-list pattern (RFC-B-04).
- **`OutputTag.setAccept`.** Rejected and explicitly **dropped** — `<output>` has
  no `accept` attribute in HTML (`accept` is `<input type=file>`-only, already on
  `InputTag`). Flagged so a reviewer does not re-add it.
- **Ship `popover="hint"` here.** Rejected for 6.2.0 — `hint` is **not Baseline**
  (Chrome flag-gated, WebKit opposed to the touch-tooltip case); widening
  `PopoverState` now ships a closed-union member that resolves to an inert
  attribute cross-browser. **Defer** to a later minor once it reaches Baseline; it
  is a 1-line additive change with no runtime cost when it lands.

## Open questions

1. **Empty-token `setAccept([])` vs `setAccept(undefined)`.** Chosen: an empty
   array sets `accept = undefined` (omit the attribute), matching the
   omit-when-undefined convention — never emit `accept=""`. The array join must
   **not** trim/dedupe/reorder beyond dropping empties (callers may rely on
   byte-stable output for snapshot tests). Confirm the no-reorder posture.
2. **`AutofillField` token-set fidelity.** The union must match the current WHATWG
   §4.10.18.7 field-name table exactly — an incomplete list silently forces
   callers onto `(string & {})`, losing the typo-check. Verify against the live
   spec before landing (e.g. confirm `cc-additional-name`/`tel-local-prefix`/
   `tel-local-suffix` are still listed).
3. **`.d.ts` size / hover noise from the autocomplete grammar.** `AutofillField`
   (~60) × (plain + 2 prefixes + webauthn + prefix-webauthn) ≈ ~360 string-literal
   members. TS handles it, but if hover tooltips become noisy, gate the
   `shipping`/`billing` prefixes to an address/payment subset rather than every
   field. Monitor tsserver completion latency in the spike.
4. **Sequencing.** Ship #69 + #48 + #45 + #50 in one `forms.ts` PR; #63 (+ #49,
   which reuses the widened union verbatim) as a coordinated type-only
   `html-types.ts` PR so Select lands against the new union, not the old one. If
   #49 ever ships first against the flat union it needs a follow-up retype.
