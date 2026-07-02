# Track B — HTML Elements · Lens: Form Input Types

Lens scope: every `<input type>`, `datalist`/`option`, `output`, `fieldset`/`legend`, `optgroup`, `progress`/`meter`, `select`/`textarea` and their typed setters.

## Surface audit (what already exists)

Verified against `src/elements/forms.ts` and `src/elements/data.ts`:

- **`InputTag`** (`forms.ts:15-109`) — `setType` (typed `InputType` union covering color/range/date/time/datetime-local/week/month/search/tel/url/file/…), `setPlaceholder`, `setName`, `setValue`, `setAccept`, `setMin`/`setMax`/`setStep` (with `NumericInputTag`/`DateTimeInputTag`/`NoMinMaxInputTag` overloads narrowing min/max/step per type), `setPattern`, `setMinlength`/`setMaxlength`, `setAutocomplete`, `setInputmode`, `setCapture` (`'user'|'environment'`), `setList(string|Id)`. `required`/`multiple`/`checked`/`disabled`/`readonly` via `.toggle()`. `setForm(id)` from 6.1.1 (global).
- **`TextareaTag`** (`forms.ts:147-204`) — placeholder/name/rows/cols/minlength/maxlength/`setWrap('hard'|'soft'|'off')`/autocomplete/inputmode.
- **`SelectTag`** (`forms.ts:449`) — `setName`, `setSize`. `multiple`/`required`/`disabled` via `.toggle()`.
- **`OptionTag`** (`forms.ts:470`) — `setValue`, `setLabel`. `selected`/`disabled` via `.toggle()`.
- **`OptgroupTag`** (`forms.ts:491`) — `setLabel`. **`Fieldset`/`FieldsetTag`** (`setName`) + **`Legend`**. **`Output`/`OutputTag`** (`setFor(string|Id)`, `setName`). **`Datalist`** (plain `El`, untyped).
- **`Progress`/`ProgressTag`** (`data.ts:36`) — `setValue`/`setMax`. **`Meter`/`MeterTag`** (`data.ts:57`) — value/min/max/low/high/optimum. **Both fully covered — nothing to add.**
- **`Form<T>`** typed builder (`forms.ts:353-447`) — `input`/`textarea`/`select`/`hidden`/`checkbox`/`radio`/`error` with auto-wired values + a11y error wiring.

The element/attribute coverage here is already very strong. The genuine gaps are narrow.

---

## Proposal 1 — `dirname` on `InputTag` + `TextareaTag`

**Problem/evidence.** The `dirname` attribute submits the text directionality (`ltr`/`rtl`) of a control under a companion field name — the standard mechanism for letting a server persist the direction a user typed in (RTL/bidi forms). It is valid on `<textarea>` and on `<input>` of type hidden/text/search/tel/url/email/password/submit/reset/button ([MDN: dirname](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/dirname)). **Baseline: widely available since August 2023.** No `dirname` field exists on `InputTag`/`TextareaTag` (grep of `forms.ts` — absent); the only route today is the untyped `addAttribute("dirname", …)`, which the house style explicitly discourages for standard props.

**Proposed API.**
```typescript
// InputTag and TextareaTag
setDirname(dirname?: string): this;   // emits dirname="<value>"
```
Add `dirname?: string` field + `defineSchemaKeys` entry on both tags. No union needed — the value is an author-chosen field name (mirrors `setName`).

**Before/After.**
```typescript
// Before — untyped escape hatch
Textarea().setName("comment").addAttribute("dirname", "comment.dir");
// After
Textarea().setName("comment").setDirname("comment.dir");
```

**Already in lib?** No. Not in `forms.ts`, not in CHANGELOG 6.0.0→6.1.1.

**Value:** medium (load-bearing for bidi/RTL products; low for LTR-only apps). **Effort:** small.

---

## Proposal 2 — `SelectTag.setAutocomplete` + `setRequired` ergonomics

**Problem/evidence.** `<select>` is a form-associated, autofill-eligible control: the spec lists `autocomplete` among its content attributes, and browsers autofill `<select>` (country, billing-country, etc.) ([MDN: select autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/select#autocomplete)). **Baseline: widely available.** `InputTag` and `TextareaTag` both have `setAutocomplete(AutocompleteHint)` (`forms.ts:87`, `forms.ts:193`) but `SelectTag` (`forms.ts:449`) exposes only `setName`/`setSize` — so a country `<select>` cannot get a typed autocomplete hint without `addAttribute`, and the `Form<T>` builder's `f.select(...)` returns a `SelectTag` that likewise can't. This is an inconsistency in the same `AutocompleteHint` union already shipped.

**Proposed API.**
```typescript
// SelectTag — reuse the existing AutocompleteHint union
setAutocomplete(autocomplete?: AutocompleteHint): this;   // autocomplete="country"
```
(`required`/`multiple` stay on `.toggle()` — already correct; no new boolean setters.)

**Before/After.**
```typescript
// Before
Select(...opts).setName("country").addAttribute("autocomplete", "country");
// After
Select(...opts).setName("country").setAutocomplete("country");
```

**Already in lib?** No — `SelectTag` lacks it; `AutocompleteHint` exists and is reused.

**Value:** medium (autofill parity across the three text-bearing controls). **Effort:** small.

---

## Proposal 3 — Typed `<input type="number">` `placeholder`/`step` are fine; the real gap is `OptionTag` value-from-content + `Datalist` typed factory

**Problem/evidence.** `Datalist(...)` (`forms.ts:506`) returns a bare `Tag` from `El("datalist", …)` — it has no specialized factory, but datalist itself carries no typed attributes beyond globals, so a dedicated tag class buys nothing. **This is NOT a finding** — flagged only to record it was checked. Similarly, `OptionTag` already supports `setValue`/`setLabel` and `.toggle("selected"|"disabled")`, matching the full spec attribute set. **No gap.**

**Already in lib?** N/A. **Value:** none — recorded as a non-finding.

---

## Proposal 4 — `OutputTag.setFor` should accept multiple ids (space-separated list)

**Problem/evidence.** The `<output for>` attribute is an **unordered set of unique space-separated tokens** referencing the ids of the elements the output's value was computed from ([MDN: output for](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/output#for)) — a sum output legitimately points at several inputs. **Baseline: widely available.** Today `OutputTag.setFor(forId?: string | Id)` (`forms.ts:533`) takes a single token and `extractId` collapses one `Id`; passing several requires hand-building the space-joined string.

**Proposed API.**
```typescript
// OutputTag — variadic / array of ids, joined with spaces
setFor(...forIds: (string | Id)[]): this;   // for="a b c"
```
Map each through `extractId`, `.join(" ")`. Single-arg calls stay byte-identical (back-compatible widening).

**Before/After.**
```typescript
// Before — manual join, no Id typing
Output().setName("sum").addAttribute("for", `${ids.a} ${ids.b}`);
// After
Output().setName("sum").setFor(ids.a, ids.b);
```

**Already in lib?** No — current signature is single-token.

**Value:** low-to-medium (calculator/derived-field forms; niche). **Effort:** small.

---

## Top picks

- **Proposal 1 — `setDirname` on Input + Textarea** (Baseline 2023; closes a standard-attribute gap currently only reachable via `addAttribute`).
- **Proposal 2 — `SelectTag.setAutocomplete`** (parity with Input/Textarea using the already-shipped `AutocompleteHint` union; smallest, highest-consistency win).
- **Proposal 4 — `OutputTag.setFor(...ids)`** (variadic id-list for derived-value outputs; small, additive).
