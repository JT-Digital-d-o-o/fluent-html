---
id: RFC-B-05
track: B
resolves: [#45, #48, #49, #69, #63, #50]
api_surface:
  - "InputTag.accept?: string"
  - "InputTag.setAccept(accept?: string): this  (single-token / pre-joined list — unchanged)"
  - "InputTag.setAccept(accept: readonly string[]): this  (NEW array-join overload)"
  - "InputTag.dirname?: string"
  - "InputTag.setDirname(dirname?: string): this"
  - "TextareaTag.dirname?: string"
  - "TextareaTag.setDirname(dirname?: string): this"
  - "type AutofillField = (WHATWG §4.10.18.7 detail-token union — ~60 members)"
  - "type AddressField = (the address/payment subset of AutofillField that takes a shipping/billing prefix)"
  - "type AddressPurpose = 'shipping' | 'billing'"
  - "type AutocompleteHint = 'on' | 'off' | AutofillField | `${AddressPurpose} ${AddressField}` | `${AutofillField} webauthn` | `${AddressPurpose} ${AddressField} webauthn` | (string & {})  (IDE-autocomplete widening — open tail retained, NOT typo-rejecting)"
  - "SelectTag.autocomplete?: AutocompleteHint"
  - "SelectTag.setAutocomplete(autocomplete?: AutocompleteHint): this"
  - "type FormEnctype = 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain'  (CLOSED — typo-rejecting)"
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
  - "README.md (lib) — Forms section: the `accept` array-join overload (ergonomic MIME-list authoring, autocomplete only — NO compile-safety claim), `dirname` bidi-companion convention (`${name}.dir`), structured `autocomplete` (payment/address tokens + shipping/billing grammar + webauthn — IDE autocomplete + hover docs, NOT typo-rejection), per-submit-button form-association overrides (`formtarget`/`formenctype`, with `FormEnctype` genuinely closed), and variadic `<output for>` id-set"
  - "fluent-html.md — attribute reference rows: InputTag setAccept (string + readonly-string[] overload) / setDirname; TextareaTag setDirname; SelectTag setAutocomplete; ButtonTag setFormtarget / setFormenctype; OutputTag setFor (variadic). Export the AutofillField / AddressField / AddressPurpose / FormEnctype unions for app-side prop typing. State plainly which unions are CLOSED (FormEnctype — rejects typos) vs OPEN-tail autocomplete-only (AutocompleteHint)"
  - "JSDoc — on every new/retyped setter in src/elements/forms.ts and the new/widened unions in src/elements/html-types.ts. The autocomplete JSDoc MUST say 'IDE autocomplete + hover docs for the WHATWG token set; the open `(string & {})` tail means arbitrary strings still compile — this does NOT reject typos.' setAccept JSDoc states the array overload joins with `,` and makes NO compile-safety promise. FormEnctype JSDoc states it IS closed and rejects typos (the one genuine type-safety win here)."
  - "CHANGELOG.md — 6.2.0 'Added' entry covering the setAccept array-join overload (autocomplete only), setDirname (Input/Textarea), structured AutocompleteHint widening (autocomplete/docs DX) + AutofillField/AddressField/AddressPurpose exports, SelectTag.setAutocomplete, ButtonTag.setFormtarget/setFormenctype + FormEnctype extraction (closed), OutputTag.setFor variadic. Frame autocomplete/accept as DX (autocomplete + ergonomics), and FormEnctype as the one typo-rejecting addition."
  - "../fluent-html-eslint-plugin/README.md + src/rules/prefer-set-method.ts — add `dirname → setDirname`, `formtarget → setFormtarget`, `formenctype → setFormenctype` to the attr→setter map so `addAttribute(\"dirname\", …)` is flagged (the map already routes `accept`/`autocomplete`/`enctype`/`for` at lines 20/31/32/36 and is value-union agnostic)"
  - "../fluent-html-tailwind-extractor/README.md — no functional change (attribute-only RFC, no Tailwind classes); note explicitly"
impact: "Closes the form-control completeness gap with one convergent pass. `<input type=file>` gains an ergonomic `accept` token-array overload (joins with `,` — a readability win for MIME lists; autocomplete only, NOT compile-safety); `<input>`/`<textarea>` gain the standards bidi `dirname` submit mechanism (today only reachable via the forbidden `addAttribute`); `autocomplete` is widened from a flat 14-token list to the full WHATWG detail-token set plus shipping/billing/webauthn grammar, giving first-class IDE autocomplete + hover docs across every autocomplete-bearing control (it does NOT make typos compile errors — the open `(string & {})` tail stays by spec); `<select>` joins them (it was the lone autofill-eligible control missing the setter); per-submit-button form-association overrides reach parity with `<form>` via `setFormtarget`/`setFormenctype`, with the enctype union extracted to a single CLOSED `FormEnctype` source of truth — the one genuinely typo-rejecting addition here; and `<output for>` becomes the spec'd space-separated id-SET. All additive within v6; every current call renders byte-identically."
effort: L
depends_on: []
status: implemented
---

# RFC-B-05 — Form control completeness (accept array overload, dirname, structured autocomplete, form-association overrides, output id-set)

One convergent pass over the residual gaps in the form-control surface. The
input-type coverage and the constraint setters (`min`/`max`/`step`/`pattern`/
`minlength`/`maxlength`/`inputmode`/`capture`/`list`) are **already complete and
type-narrowed** in 6.1.x — this RFC does **not** re-propose them. It files only
the six genuine primitive gaps the roadmap actually owns here:

1. **#69** — an ergonomic `accept` token-array overload (`readonly string[]`,
   joined with `,`). This is an **authoring-ergonomics + autocomplete** win, **not**
   a compile-safety win — see the adversary note below.
2. **#48** — `setDirname` on `InputTag` + `TextareaTag` (the bidi submit
   mechanism, today only reachable via `addAttribute`).
3. **#63** — structured `autocomplete`: widen `AutocompleteHint` to the full
   WHATWG detail-token set + shipping/billing/webauthn grammar. This buys
   **IDE autocomplete + hover docs**, **not** typo-rejection (type-only; open tail
   retained by spec).
4. **#49** — `SelectTag.setAutocomplete` (reusing the widened `AutocompleteHint`).
5. **#45** — `ButtonTag.setFormtarget`/`setFormenctype` (per-submit-button
   form-association overrides, reaching parity with `<form>`), with the enctype
   union extracted to a single **closed** `FormEnctype` (CONVERGE). This is the one
   genuinely typo-rejecting addition in the RFC.
6. **#50** — `OutputTag.setFor` widened to the spec'd variadic id-**set**.

These are plain semantic HTML attributes — instruction-set primitives, not
`@jtdigital/ui` component opinion — and every value routes through the renderer's
existing `escapeAttr` choke point. **No Tailwind classes are emitted by anything
in this RFC**, so the class-string contract (§11.7) is not engaged.

> ⚠️ **Adversary verdict: SURVIVES-WITH-CHANGES.** The original draft's two
> headline type-safety claims were **false**: it proposed an `AcceptToken` union and
> a widened `AutocompleteHint` and claimed both turned typos (`'image'`, `'jpg'`,
> `'cc-numbr'`, `'new-passwrod'`) into **compile errors**. A strict `tsc` run on the
> exact union shapes reported **zero diagnostics** — because both unions end in
> `(string & {})`, which is assignable from **every** string. The literals buy IDE
> autocomplete and hover docs *only*, never rejection — and the open tail is
> *mandatory* (the `accept` grammar is open by spec; `autocomplete` needs the
> `section-*` / contact-recipient long tail). This final RFC **deletes the
> `AcceptToken` union entirely** (keeping only the genuine ergonomic array-join
> overload, JSDoc'd honestly), and **re-justifies `autocomplete` on the
> autocomplete-DX + documentation basis alone**. The four genuinely-typed items
> (#48, #45, #49, #50) — including the **closed, typo-rejecting** `FormEnctype` —
> are unchanged. See *Adversary review & resolutions* for the full ledger.

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

- **`accept` has no list-authoring ergonomics (#69).** `InputTag.accept?: string`
  (`forms.ts:20`) and `setAccept(accept?: string)` (`forms.ts:52`) take a single
  string. A multi-MIME picker is authored as a hand-written comma list — the real
  site does exactly this
  (`projects-template/.../account.page.view.ts:72-76`):
  `StyledInput().setType("file").setName("avatar").setAccept("image/png,image/jpeg,image/webp,image/gif")`.
  An array overload reads better and removes the manual comma-joining. **Note (per
  the adversary):** the `accept` grammar is **open by spec** (any MIME type, any
  `.ext` is legal), so this overload provides **no compile-time typo rejection**
  (`'image'`/`'jpg'` would still compile against `string`). It is an
  ergonomics-and-autocomplete improvement, nothing more — the draft's
  `AcceptToken` union has been **dropped** (it added zero checking; see *Adversary
  review*).
- **`dirname` is missing entirely (#48).** The standards bidi/RTL submit
  mechanism — a companion field that submits the entered text's resolved
  direction (`ltr`/`rtl`) under `${name}.dir` — has no setter on `InputTag`
  (`forms.ts:15-107`) or `TextareaTag` (`forms.ts:147-202`). The only path today
  is the forbidden `addAttribute("dirname", …)`.
- **`AutocompleteHint` is a flat 14-token list (#63).** `html-types.ts:20-24`
  is `'on'|'off'|'name'|'email'|'username'|'new-password'|'current-password'|'organization'|'street-address'|'country'|'postal-code'|'tel'|'url'|'one-time-code'|(string & {})`.
  It has **no** `cc-*` payment tokens, **no** `address-line*`/`address-level*`
  tokens, **no** `shipping`/`billing` prefix grammar, **no** `webauthn` suffix.
  Authoring a checkout or address form means typing raw strings with **no IDE
  autocomplete and no hover documentation** for the canonical token set. Widening
  the union restores both. (It does **not** add typo-rejection — the
  `(string & {})` tail is mandatory and accepts any string; CHANGELOG 6.0.0→6.1.1
  never touches this union.)
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
no widened `autocomplete` union; `accept` is still bare `string`. The eslint
plugin's `prefer-set-method` map
(`../fluent-html-eslint-plugin/src/rules/prefer-set-method.ts:20,31,32,36`)
already routes `for`/`autocomplete`/`accept`/`enctype` to their setters and is
value-union-agnostic, so it needs new entries only for
`dirname`/`formtarget`/`formenctype`.

## Proposed API

Full TS signatures — **the contract**. Touch points: one new `AddressPurpose`
union + one field-token union (`AutofillField`) + one address/payment subset
(`AddressField`, the only fields that take a shipping/billing prefix) + one
extracted **closed** union (`FormEnctype`) + the widened (autocomplete-only)
`AutocompleteHint`; new setters on `InputTag`/`TextareaTag`/`SelectTag`/`ButtonTag`;
the `setAccept` array overload; the variadic `OutputTag.setFor`. **No `AcceptToken`
union** (dropped — see *Adversary review*, change 1).

### `src/elements/forms.ts` — `setAccept` array overload (#69, ergonomics only)

No new union. The existing single-string overload is preserved verbatim; a second
overload accepts a token array and joins it with `,`. This is purely an
authoring-ergonomics improvement (autocomplete on the array elements, no manual
comma-joining). It makes **no** compile-time typo-rejection claim — the `accept`
grammar is open by spec.

```typescript
class InputTag {
  accept?: string;     // unchanged

  /** Set `accept` (file inputs). Pass a single value (a token or a pre-joined
   *  `a,b` list — UNCHANGED from 6.1.x), or a token array which is joined with `,`
   *  for you. An empty array emits no attribute.
   *
   *  NOTE: the `accept` grammar is open by spec (any MIME type, any `.ext`), so
   *  this is an ergonomics/autocomplete convenience — it does NOT type-check that
   *  each token is a valid MIME/`.ext`. `setAccept("image")` still compiles. */
  setAccept(accept?: string): this;
  setAccept(accept: readonly string[]): this;
}
```

```typescript
// impl
setAccept(accept?: string | readonly string[]): this {
  this.accept = Array.isArray(accept)
    ? (accept.length ? accept.join(',') : undefined)   // empty array ⇒ omit
    : (accept as string | undefined);
  return this;
}
```

### `src/elements/html-types.ts` — structured `autocomplete` (#63, autocomplete-DX only)

Replaces the flat list at `html-types.ts:20`. **The `(string & {})` tail is
retained by necessity** (opaque `section-*` tokens and the
`home`/`work`/`mobile`/`fax`/`pager` contact-recipient token are not enumerable as
a sane closed union), so this widening **adds IDE autocomplete + hover docs for the
canonical token set and the shipping/billing/webauthn grammar — it does NOT reject
typos.** A reviewer must not "close" it expecting typo-safety.

To bound the member count and hover noise (adversary change 5), the
`shipping`/`billing` prefix grammar is gated to the **address/payment field
subset** (`AddressField`) rather than every field — `shipping cc-csc` or
`billing postal-code` are the real payloads; `shipping bday` is not a thing.

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
 * The subset of {@link AutofillField} that may carry a `shipping`/`billing`
 * purpose prefix — address, payment, and the contact channels a shipment uses.
 * Gating the prefix grammar to this subset (rather than every field) keeps the
 * `AutocompleteHint` member count and tsserver-hover output bounded
 * (~address+payment × 2 purposes, not ~60 × 2).
 */
export type AddressField =
  | 'name' | 'honorific-prefix' | 'given-name' | 'additional-name'
  | 'family-name' | 'honorific-suffix'
  | 'organization'
  | 'street-address' | 'address-line1' | 'address-line2' | 'address-line3'
  | 'address-level4' | 'address-level3' | 'address-level2' | 'address-level1'
  | 'country' | 'country-name' | 'postal-code'
  | 'cc-name' | 'cc-given-name' | 'cc-additional-name' | 'cc-family-name'
  | 'cc-number' | 'cc-exp' | 'cc-exp-month' | 'cc-exp-year' | 'cc-csc' | 'cc-type'
  | 'tel' | 'tel-country-code' | 'tel-national' | 'tel-area-code'
  | 'tel-local' | 'tel-extension'
  | 'email';

/**
 * `autocomplete` attribute value. `'on'`/`'off'` are the bare modes; every other
 * value is an autofill *detail token* — optionally prefixed with an address
 * purpose (`shipping`/`billing`, on address/payment fields) and/or suffixed with
 * `webauthn` (offers a passkey from the credential picker).
 *
 * IDE-AUTOCOMPLETE ONLY. The trailing `(string & {})` keeps the long-tail grammar
 * (opaque `section-*` tokens, the `home`/`work`/`mobile`/`fax`/`pager`
 * contact-recipient token) compiling — which ALSO means **any** string compiles,
 * so this union does NOT reject typos (`setAutocomplete("cc-numbr")` compiles).
 * Its value is first-class autocomplete + hover docs for the canonical 99%
 * (field, shipping/billing field, field[+webauthn]). Do NOT close it.
 */
export type AutocompleteHint =
  | 'on' | 'off'
  | AutofillField
  | `${AddressPurpose} ${AddressField}`
  | `${AutofillField} webauthn`
  | `${AddressPurpose} ${AddressField} webauthn`
  | (string & {});
```

### `src/elements/html-types.ts` — `FormEnctype` (#45, extracted once, CLOSED)

This is the **one genuinely typo-rejecting** union in the RFC: it has **no**
`(string & {})` tail, so `setFormenctype("text/plian")` is a real compile error.

```typescript
/**
 * `enctype` / `formenctype` — how the form payload is encoded. The single source
 * of truth for both `FormTag` and `ButtonTag` (CONVERGE). **Closed** — the spec
 * enum is a fixed three-value set, so a typo like `"text/plian"` IS a compile
 * error (contrast the open-tail `AutocompleteHint`, which is autocomplete-only).
 */
export type FormEnctype =
  | 'application/x-www-form-urlencoded'
  | 'multipart/form-data'
  | 'text/plain';
```

### `src/elements/forms.ts` — `InputTag` (#48 dirname)

```typescript
class InputTag {
  dirname?: string;

  /** Set `dirname` — the bidi submit companion. The browser submits the entered
   *  text's resolved direction (`ltr`/`rtl`) under this field name; the
   *  convention is `${name}.dir`. Pass a FIELD NAME, not a direction value. */
  setDirname(dirname?: string): this;
}
```

```typescript
// impl
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
  formenctype?: FormEnctype;         // reuses the new CLOSED FormEnctype

  /** Override the form's `target` for this submit button (e.g. `"_blank"`). */
  setFormtarget(formtarget?: BrowsingContext): this;

  /** Override the form's `enctype` for this submit button (e.g.
   *  `"multipart/form-data"` for a single file-upload button). `FormEnctype` is
   *  closed — a typo is a compile error. */
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

Add `AutofillField`, `AddressField`, `AddressPurpose`, `FormEnctype` to the HTML
attribute-types export block (`index.ts:26-55`), beside the existing
`AutocompleteHint`/`BrowsingContext`/`FormMethod` re-exports — mirroring the 6.1.x
idiom of exporting each union next to its setter so apps can type reusable hint
maps and component props. `AutocompleteHint` is already exported (`index.ts:31`).
**No `AcceptToken` export** (the union is dropped).

### Emitted output (the contract)

| Call | Output |
| --- | --- |
| `Input("file").setName("avatar").setAccept("image/png,image/jpeg")` | `accept="image/png,image/jpeg"` (single-string overload, unchanged) |
| `Input("file").setAccept(["image/png", "image/jpeg", "image/webp"])` | `accept="image/png,image/jpeg,image/webp"` (array overload joins) |
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

**#69 — `accept` array overload (the real site, `account.page.view.ts:72-76`).**

```typescript
// Before — hand-written comma list:
StyledInput().setType("file").setName("avatar")
  .setAccept("image/png,image/jpeg,image/webp,image/gif")
  .toggle("required");

// After — the array overload reads better for a MIME list and joins for you.
// (Autocomplete on the elements; it does NOT reject an invalid token — accept is
// open by spec, so 'image'/'jpg' would still compile. This is ergonomics only.)
StyledInput().setType("file").setName("avatar")
  .setAccept(["image/png", "image/jpeg", "image/webp", "image/gif"])
  .toggle("required");
```

**#48 — bidi field that submits its resolved direction.**

```typescript
// Before — only via the forbidden escape hatch:
Textarea().setName("comment").addAttribute("dirname", "comment.dir");
// After:
Textarea().setName("comment").setDirname("comment.dir");   // server receives comment.dir=ltr|rtl
```

**#63 / #49 — checkout autofill: first-class autocomplete + hover docs.**

```typescript
// The widened union surfaces the canonical tokens in IDE autocomplete with hover
// documentation. It does NOT reject typos — 'cc-numbr' still compiles (open tail).
Input("text").setName("card").setAutocomplete("cc-number");           // autocompletes from the cc-* set
Input("text").setName("zip").setAutocomplete("shipping postal-code");  // shipping/billing grammar autocompletes
Select(...countryOptions).setName("country").setAutocomplete("country"); // #49 — select joins in
```

**#45 — per-submit-button form-association override (the genuine type-safety win).**

```typescript
// Before — Button has setFormaction/setFormmethod but not the target/enctype pair:
Button("Upload").setType("submit").setFormaction("/upload")
  .addAttribute("formenctype", "multipart/form-data")
  .addAttribute("formtarget", "_blank");
// After — parity with <form>'s setTarget/setEnctype; FormEnctype is CLOSED:
Button("Upload").setType("submit").setFormaction("/upload")
  .setFormenctype("multipart/form-data").setFormtarget("_blank");
Button("Upload").setFormenctype("multipart/form-dat");   // ✗ real compile error (closed union)
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

**Be honest about which of these are typo-rejecting (one is) and which are
autocomplete-DX only (two are).**

- **`setAccept` array overload buys ergonomics + autocomplete, NOT safety.** The
  `accept` grammar is open by spec (any MIME type, any `.ext`), so no closed union
  can guard it; the draft's `AcceptToken` was deleted because it provided **zero**
  checking (`'image'`/`'jpg'` matched its `(string & {})` tail and compiled) while
  adding hover bloat. The overload's win is real but bounded: array-element
  autocomplete and automatic comma-joining. JSDoc says so explicitly; no
  "compile error" claim survives for `accept`.
- **`AutocompleteHint` widening buys autocomplete + hover docs, NOT typo-rejection.**
  The `(string & {})` tail is mandatory (`section-*` / contact-recipient long-tail)
  and accepts any string, so `setAutocomplete("cc-numbr")` compiles. The value is
  first-class IDE autocomplete and hover documentation for the WHATWG token set and
  the shipping/billing/webauthn grammar — across `Input`/`Textarea`/`Select` from a
  single union. The `shipping`/`billing` prefix is gated to the `AddressField`
  subset to bound member count (resolves Open question 3 / adversary change 5).
- **`FormEnctype` is the one genuinely typo-rejecting addition.** Closed, no tail;
  `setFormenctype("text/plian")` is a real compile error. It also single-sources
  the enctype literal that was inlined 3× in `FormTag` (CONVERGE). The `FormTag`
  retype is structurally identical to the old inline literal, so render is
  byte-identical (§11.5).
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
- **Compile-only tests** (`test/types/*.test-d.ts`): **`@ts-expect-error` negatives
  are used ONLY where a real error occurs** — i.e. the closed `FormEnctype`:
  `setFormenctype("text/plian")` ✗, `setEnctype("text/plian")` ✗. For the open-tail
  unions, assert **positives only** (no `@ts-expect-error`, which would itself fail
  to compile because no error is produced):
  `setAccept("image/png")` ✓ / `setAccept(["image/png"])` ✓ /
  `setAutocomplete("cc-number")` ✓ / `setAutocomplete("shipping postal-code")` ✓ /
  `setAutocomplete("username webauthn")` ✓ / `Output().setFor(a, b)` ✓. (Per
  adversary change 3: a `@ts-expect-error` on `setAccept("image")` or
  `setAutocomplete("cc-numbr")` would red the build, because they compile.)

## Migration & compatibility

**Additive within v6.** No emitted-output change for any current call:

- `setAccept(string)` is unchanged (the array overload is new, no union added).
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
   form-control-completeness subsection. **Every code comment that previously said
   `'image'`/`'jpg'`/`'cc-numbr'` are compile errors is removed** — the prose frames
   accept/autocomplete as autocomplete-DX, and `FormEnctype` as the typo-rejecting
   one:

   ```markdown
   #### File inputs — `accept` array overload

   ```typescript
   Input("file").setName("avatar")
     .setAccept(["image/png", "image/jpeg", "image/webp"]);  // joined with ","; autocomplete only
   ```
   `accept` is open by spec — this overload is for ergonomics + autocomplete; it
   does not validate each token.

   #### Bidi text — `dirname`

   `setDirname` submits the entered text's resolved direction under a companion
   field; the convention is `${name}.dir`:

   ```typescript
   Textarea().setName("comment").setDirname("comment.dir");  // server gets comment.dir=ltr|rtl
   ```

   #### Structured autocomplete (IDE autocomplete + hover docs)

   The full WHATWG detail-token set, with `shipping`/`billing` prefixes (on
   address/payment fields) and a `webauthn` suffix — autocompletes across
   `Input`/`Textarea`/`Select`. The open tail means arbitrary strings still
   compile; this is for autocomplete/docs, not typo-rejection:

   ```typescript
   Input("text").setName("card").setAutocomplete("cc-number");
   Input("text").setName("zip").setAutocomplete("shipping postal-code");
   Select(...).setName("country").setAutocomplete("country");
   ```

   #### Per-submit-button form-association overrides

   ```typescript
   Button("Upload").setType("submit").setFormaction("/upload")
     .setFormenctype("multipart/form-data").setFormtarget("_blank");  // FormEnctype is closed — typos rejected
   ```

   #### `<output>` id-set

   ```typescript
   Output().setFor(ids.a, ids.b).setName("result");  // <output for="a b">
   ```
   ```

2. **`fluent-html.md`** — add attribute reference rows: `InputTag`
   `setAccept` (string + `readonly string[]` overload — note "autocomplete only") /
   `setDirname`; `TextareaTag` `setDirname`; `SelectTag` `setAutocomplete`;
   `ButtonTag` `setFormtarget`/`setFormenctype`; `OutputTag` `setFor` (variadic
   id-set). Document the exported `AutofillField`/`AddressField`/`AddressPurpose`
   (autocomplete-DX) and `FormEnctype` (closed, typo-rejecting, single enctype
   source of truth) unions for app-side prop typing, plus the `${name}.dir`
   `dirname` convention and the space-set semantics of `for`. **State plainly which
   unions reject typos (`FormEnctype`) vs autocomplete-only (`AutocompleteHint`).**

3. **JSDoc** — on every new/retyped setter (drafted in *Proposed API*) and the
   new/widened unions in `html-types.ts`. The `setAccept`/`AutocompleteHint` JSDoc
   states autocomplete-only and makes **no** compile-safety promise; the
   `FormEnctype` JSDoc states it IS closed and rejects typos; the `dirname` JSDoc
   documents the `${name}.dir` convention; the `for` JSDoc documents id-set
   semantics.

4. **`CHANGELOG.md`** — a 6.2.0 "Added" entry covering: the `setAccept` array-join
   overload (autocomplete/ergonomics); `setDirname` (Input/Textarea); the structured
   `AutocompleteHint` widening (autocomplete + hover DX) +
   `AutofillField`/`AddressField`/`AddressPurpose` exports; `SelectTag.setAutocomplete`;
   `ButtonTag.setFormtarget`/`setFormenctype` + the **closed** `FormEnctype`
   extraction (the typo-rejecting addition); the variadic `OutputTag.setFor`. The
   entry must NOT claim accept/autocomplete reject typos.

5. **`../fluent-html-eslint-plugin/`** — add `dirname → setDirname`,
   `formtarget → setFormtarget`, `formenctype → setFormenctype` to the
   `prefer-set-method` attr→setter map (`src/rules/prefer-set-method.ts`, which
   already routes `for`/`autocomplete`/`accept`/`enctype` at lines 20/31/32/36 and
   is value-union agnostic), and note the additions in the plugin README. This makes
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
  assignment (+ `Array.isArray`/`join` for the accept overload, `extractId` reuse
  for `for`).
- **§11.2 SSR-only / sync** — all setters are synchronous; render path stays sync
  (plain attribute emit).
- **§11.3 escape-by-default** — `accept`/`dirname`/`autocomplete`/`formtarget`/
  `formenctype`/`for` all flow through the renderer's existing `escapeAttr` choke
  point; no URL/markup context, no new XSS sink.
- **§11.4 type-safety** — **honest posture:** `FormEnctype` is closed and
  typo-rejecting; `BrowsingContext` is the established open union (`formtarget`);
  `AutocompleteHint` is widened for **autocomplete + hover docs only** (open tail by
  spec — does NOT reject typos, and the RFC no longer claims it does); `accept` has
  **no** union (open by spec — the draft's `AcceptToken` was deleted as non-functional
  ceremony); `dirname` is free-text by spec; no `any`, no bare `string` where a
  *closeable* literal set exists. The one place a closed literal union is achievable
  (`enctype`) uses one.
- **§11.5 compat** — all six items additive within v6; every current call renders
  byte-identically (single-arg `setAccept`, `FormTag` enctype retype, single-arg
  `setFor`); greenfield, no v5 back-compat.
- **§11.6 idioms** — `set*` override setters; an array overload (not options object)
  for the single scalar `accept` value; NO `setMultiple`/`setRequired`
  (boolean-setter surface stays removed); `FormEnctype` is the one enctype source of
  truth; the dropped `AcceptToken` removes a second non-functional "way" to type
  accept — exactly one way to set each attribute (CONVERGE).
- **§11.7 class-string contract** — N/A; no Tailwind classes emitted, nothing
  touches vocab/extractor.
- **§11.8 docs/guideline-sync** — lib README (Forms subsection) + `fluent-html.md`
  rows + JSDoc on every new/retyped setter + CHANGELOG + the eslint map/README
  additions + a one-line attribute-only note in the extractor README; covers every
  symbol in `api_surface`. **All docs are corrected in lockstep with the
  type-safety honesty fix** — no README/JSDoc/CHANGELOG text asserts
  `'image'`/`'cc-numbr'` are compile errors.

## Alternatives considered

- **Re-propose the input types / constraint setters wholesale.** Rejected —
  `InputType` coverage and `min`/`max`/`step`/`pattern`/`minlength`/`maxlength`/
  `inputmode`/`capture`/`list` are **already shipped and type-narrowed** in 6.1.x.
  Only the six gaps above are net-new.
- **Keep the draft's `AcceptToken` union** (`'image/*'|...|`${string}/${string}`|(string & {})`).
  **Rejected and deleted** (adversary change 1). Its arms are mutually subsuming and
  collapse to `(string & {})` for assignability, so it provides zero typo-rejection
  (`'image'`/`'jpg'` compile) — it cannot in principle, because `accept` is open by
  spec — while bloating hover output and `.d.ts` size. The genuine win (the array
  overload) is kept without it.
- **Add `setMultiple` / `setRequired`.** Rejected — both are boolean attributes
  via `.toggle("multiple")`/`.toggle("required")`; adding setters re-opens the
  surface v6 deliberately removed and violates CONVERGE (§11.6).
- **Enumerate the full autofill cartesian product** (section × purpose ×
  recipient × field × webauthn). Rejected — would blow past ~1k union members and
  tank tsserver completions. The pragmatic shape (field, shipping/billing
  `AddressField`, field[+webauthn]) covers the 99% checkout/address/login payload;
  the long tail rides `(string & {})`.
- **Apply the `shipping`/`billing` prefix to every `AutofillField`.** Rejected
  (adversary change 5) — `shipping bday`/`billing sex` are nonsense and the full
  product (~60 × 2 + webauthn variants) is real tsserver-hover/`.d.ts` cost for
  autocomplete-only value. Gated to the `AddressField` subset, which is what browsers
  actually consume.
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
   §4.10.18.7 field-name table exactly. (An incomplete list does not lose
   typo-safety — there is none — but it does lose *autocomplete coverage* for the
   missing token, the entire point of #63.) Verify against the live spec before
   landing (e.g. confirm `cc-additional-name`/`tel-local-prefix`/`tel-local-suffix`
   are still listed) and confirm the `AddressField` subset still matches the fields
   browsers accept a `shipping`/`billing` prefix on.
3. **`.d.ts` size / hover noise — RESOLVED before landing** (adversary change 5).
   The `shipping`/`billing` prefix grammar is gated to the `AddressField` subset
   (~35 members) rather than all ~60 `AutofillField` members, bounding the union to
   roughly `60 (plain) + 60 (webauthn) + 35×2 (prefix) + 35×2 (prefix+webauthn)`
   ≈ ~260 members instead of ~360. Monitor tsserver completion latency in the spike;
   if still noisy, narrow `AddressField` further (the prefix is autocomplete-only, so
   trimming costs nothing but completion coverage).
4. **Sequencing.** Ship #69 (array overload) + #48 + #45 + #50 in one `forms.ts` PR;
   #63 (+ #49, which reuses the widened union verbatim) as a coordinated type-only
   `html-types.ts` PR so Select lands against the new union, not the old one. If
   #49 ever ships first against the flat union it needs a follow-up retype.

## Adversary review & resolutions

Verdict: **survives-with-changes** (confidence 0.82). Killer objection: the draft's
two headline type-safety claims were false — both `AcceptToken` and the widened
`AutocompleteHint` end in `(string & {})`, which accepts every string, so the
asserted compile-errors (`'image'`, `'jpg'`, `'cc-numbr'`, `'new-passwrod'`) all
compile (verified by strict `tsc`, zero diagnostics). Each required change and its
resolution:

1. **Delete `AcceptToken` / rewrite #69 honestly; strike every "compile error"
   claim for `'image'`/`'jpg'`.** — **Resolved (deleted).** The `AcceptToken` union
   is removed from the api_surface, the Proposed API, the JSDoc, the worked example,
   the Type-safety story, and §11.4. `setAccept` keeps the single-string overload
   verbatim and adds **only** the `readonly string[]` array-join overload, JSDoc'd as
   ergonomics/autocomplete with an explicit "does NOT type-check each token; open by
   spec; `setAccept(\"image\")` still compiles" note. Impact line, README, and
   CHANGELOG reframed to "ergonomic array overload / autocomplete," never "compile
   error."

2. **Correct every `AutocompleteHint` typo-safety claim.** — **Resolved.** All
   "a typo is a compile error" / "previously silent typos now check" / "near-token
   typos surface" / "reviving typo-safety" prose is struck. The union JSDoc, the
   Type-safety story, the worked example, the impact line, README, and CHANGELOG now
   frame #63/#49 as **IDE autocomplete + hover docs only**, with an explicit note
   that the open tail means `setAutocomplete("cc-numbr")` compiles. The union is
   re-justified on the autocomplete-DX + documentation basis alone.

3. **Fix the `test/types/*.test-d.ts` plan — `@ts-expect-error` negatives on
   accept/autocomplete would break CI.** — **Resolved.** The Type-safety story's
   test plan now uses `@ts-expect-error` **only** for the genuinely-closed
   `FormEnctype` (`setFormenctype("text/plian")` ✗, `setEnctype("text/plian")` ✗).
   For accept/autocomplete it asserts **positives only** (no `@ts-expect-error`),
   explicitly calling out that a negative directive there would itself fail to
   compile.

4. **Trim `AcceptToken`'s redundant subsuming arms if the union survives.** —
   **Resolved by deletion** (subsumes change 1). No `AcceptToken` arms remain to
   trim; no redundant-structure hover bloat.

5. **Resolve the ~360-member `AutocompleteHint` blow-up before landing; gate
   `shipping`/`billing` to the address/payment subset.** — **Resolved.** A new
   `AddressField` subset (~35 members) gates the `shipping`/`billing` prefix grammar
   instead of all ~60 `AutofillField` members, bounding the union to ~260 members.
   Open question 3 is marked RESOLVED with the member-count arithmetic and a
   spike-monitoring follow-up. `AddressField` is added to the api_surface and barrel
   exports.

6. **Keep #45 / #48 / #49 / #50 (sound, unshipped, correctly typed); the
   eslint-map additions and "already routes accept/autocomplete/enctype/for" claim
   are verified correct.** — **Resolved (kept unchanged).** `setFormtarget`/
   `setFormenctype` + the **closed** `FormEnctype`, `setDirname`,
   `SelectTag.setAutocomplete`, and variadic `OutputTag.setFor` carry forward
   verbatim. The eslint-map lockstep (add `dirname`/`formtarget`/`formenctype`;
   `for`/`autocomplete`/`accept`/`enctype` already routed at
   `prefer-set-method.ts:20/31/32/36`) is retained as confirmed correct.
