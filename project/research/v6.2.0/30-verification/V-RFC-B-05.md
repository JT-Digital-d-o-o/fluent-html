---
rfc: RFC-B-05
lens: [type-safety, dx, breaking-change, security-escape]
verdict: survives-with-changes
confidence: 0.82
killer_objection: >
  The RFC's two headline type-safety claims are FALSE. Both `AcceptToken` and the
  widened `AutocompleteHint` end in `(string & {})`, which accepts EVERY string —
  so `setAccept("image")`, `setAccept("jpg")`, `setAutocomplete("cc-numbr")`, and
  `setAutocomplete("new-passwrod")` all compile cleanly (verified: a strict tsc run
  on the exact union shapes reported ZERO errors). The repeated "becomes a compile
  error" / "a typo is a compile error" claims (lines 50, 88, 107, 380, 404, 441,
  468, impact line 36) are unachievable while the open tail is present. The literals
  buy IDE autocomplete only, never typo-rejection. The #69 (accept) and #63
  (autocomplete) value propositions as written are built on a type that cannot do
  what the prose says it does.
required_changes:
  - >
    DELETE `AcceptToken` and the `setAccept` union/array overload from this RFC, OR
    rewrite #69 honestly. The union `'image/*'|'video/*'|'audio/*'|`.${string}`|
    `${string}/${string}`|(string & {})` provides ZERO typo-rejection: `'image'` and
    `'jpg'` match `(string & {})` and compile (verified by tsc). It also cannot
    reject them in principle — the `accept` grammar is open by spec, as the RFC
    itself admits. So `AcceptToken` is pure ceremony: it adds autocomplete entries
    nobody completes against (`image/*` etc.) and no safety. Recommended: drop the
    new union entirely; keep `setAccept(accept?: string)` and add ONLY the
    `readonly string[]` array-join overload (the one genuine ergonomic win), with
    JSDoc that does NOT claim compile-time typo safety. If kept, every "compile
    error" claim for `'image'`/`'jpg'` (lines 50, 88, 380, 441, 444, 466, the
    api_surface AcceptToken bullet, impact line 36, Emitted-output table, Worked
    example #69, Type-safety story bullet 1, §11.4) MUST be struck/corrected to
    "autocompletes; does not reject" — they are factually wrong as written.
  - >
    CORRECT every `AutocompleteHint` typo-safety claim. With `(string & {})` retained
    (mandatory — `section-*` and contact-recipient tokens need it), `setAutocomplete
    ("cc-numbr")` COMPILES (verified by tsc). Strike "a typo is a compile error"
    (lines 107, 404), "previously silent payment/address typos now ... check"
    (line 449), "near-token typos surface" (line 451), the compile-only test claim
    `setAutocomplete("cc-numbr") ✗` (line 468), and impact line 36 ("reviving
    typo-safety"). The honest framing is: the widening adds first-class IDE
    autocomplete + hover docs for the WHATWG token set and the shipping/billing/
    webauthn grammar; it does NOT make typos compile errors. Re-justify #63/#49 on
    the autocomplete-DX + documentation basis ALONE, or the RFC oversells.
  - >
    Fix the `test/types/*.test-d.ts` plan (lines 466-469). The asserted negatives
    `setAccept("image") ✗` and `setAutocomplete("cc-numbr") ✗` will FAIL to fail —
    a `// @ts-expect-error` on either line is itself a compile error because no
    error occurs. Replace with positive/autocomplete assertions only, OR keep
    `@ts-expect-error` ONLY for `setFormenctype("text/plian")` and `FormEnctype`
    members (genuinely closed, genuinely reject). The accept/autocomplete d-tests
    as drafted would break CI.
  - >
    Trim `AcceptToken`'s redundant arms IF the union survives at all. ``${string}/
    ${string}`` is fully subsumed by `(string & {})` and `'image/*'`/`'video/*'`/
    `'audio/*'` are subsumed by ``${string}/${string}`` — the whole thing collapses
    to `(string & {})` for assignability. This is dead structure that bloats hover
    output and `.d.ts` size for no checking benefit. (Reinforces change 1: prefer
    deletion.)
  - >
    Resolve Open question 3 (the ~360-member `AutocompleteHint` cartesian blow-up)
    BEFORE landing, not after. `AutofillField` (~60) × (plain + 2 address prefixes +
    webauthn + prefix-webauthn) is a real tsserver-hover/.d.ts cost, and since the
    grammar buys autocomplete-only (no safety — see change 2), the cost/benefit must
    be re-weighed. Gate `shipping`/`billing` to the address/payment field subset (as
    the RFC's own fallback suggests) rather than every field, to keep the member
    count and hover noise bounded.
  - >
    Keep #45 (`setFormtarget`/`setFormenctype` + `FormEnctype`), #48 (`setDirname`),
    #49 (`SelectTag.setAutocomplete`), #50 (variadic `OutputTag.setFor`) — these are
    sound, genuinely unshipped (verified: grep over src/ + CHANGELOG finds none), and
    `FormEnctype` is correctly CLOSED so it actually delivers the typo-safety the RFC
    claims for it. The eslint-map additions (`dirname`/`formtarget`/`formenctype`) and
    the "already routes accept/autocomplete/enctype/for" claim are verified correct
    against prefer-set-method.ts lines 20,31,32,36.
---

## Attack

Lenses: type-safety, dx, breaking-change, security-escape. Default-reject posture.

### 1. ALREADY SHIPPED? (instant-reject hunt) — clears.
Verified against `src/elements/forms.ts`, `src/elements/html-types.ts`,
`src/index.ts`, and `CHANGELOG.md`:
- `formtarget`/`formenctype` — absent on `ButtonTag` (forms.ts:217-272 has only
  `formaction`/`formmethod`). Not shipped.
- `dirname` — absent on `InputTag`/`TextareaTag`. Not shipped.
- `SelectTag.autocomplete` — `SelectTag` (forms.ts:449-462) has only `name`/`size`.
  Not shipped.
- variadic `OutputTag.setFor` — current `setFor(forId?: string | Id)` is single-arg
  (forms.ts:533); CHANGELOG line 77 confirms the `Id`-accepting single-arg form
  shipped in 6.1.x. The variadic widening is net-new.
- widened `accept`/`autocomplete` unions — current `accept?: string` (forms.ts:20),
  current `AutocompleteHint` is the flat 14-token list (html-types.ts:20-24). Not
  widened. CHANGELOG never touches either.
No instant-reject. The "what's already shipped" inventory in the Problem section is
accurate.

### 2. THE KILLER — type holes (the open-tail lie).
The RFC's load-bearing claim, stated ~8 times, is that the new unions turn typos
into compile errors. I reconstructed the EXACT union shapes from the draft and ran
strict `tsc` (repo-local `node_modules/.bin/tsc`):

```
setAccept("image");              // RFC: ✗ compile error  → ACTUAL: compiles
setAccept("jpg");                // RFC: ✗ compile error  → ACTUAL: compiles
setAutocomplete("cc-numbr");     // RFC: ✗ compile error  → ACTUAL: compiles
setAutocomplete("new-passwrod"); // RFC: ✗ compile error  → ACTUAL: compiles
```

Result: **EXIT 0, zero diagnostics.** Every one compiles. Reason is elementary
and unavoidable: a union of the form `…literals… | (string & {})` is assignable
from any `string`, because `(string & {})` IS `string` for assignability. The
literal arms contribute IDE autocomplete and hover docs, never rejection. The RFC
*knows* the tail must stay (it argues so for `accept` "open by spec" and for
`autocomplete` "section-*/contact-recipient long-tail") — but then repeatedly
asserts a typo-rejection property that the very-same tail makes impossible. The
`account.page.view.ts` motivation ("a `'image'`/`'jpg'` mistake that silently
breaks the picker becomes a compile error", impact line 36) is the headline of the
RFC and it is false.

This poisons #69's entire rationale (the accept union does literally nothing —
change required: delete it or demote to "array overload only") and half of #63's
(the autocomplete grammar is autocomplete-DX-only, must be re-justified honestly).

### 3. The `.test-d.ts` plan would break CI.
Lines 466-469 propose `// @ts-expect-error`-style negative assertions for
`setAccept("image")` and `setAutocomplete("cc-numbr")`. Since neither produces an
error, a `@ts-expect-error` directive on those lines is *itself* a compile error
("Unused '@ts-expect-error'"). The drafted type-tests would red the build. Only the
`FormEnctype` negatives (`"text/plian"`) are real.

### 4. Convergence / DX.
- `FormEnctype` extraction is a clean CONVERGE win — closes the 3×-inlined literal
  and is correctly closed (no tail), so it genuinely rejects `"text/plian"`. Good.
- `AcceptToken`'s `'image/*'|...|`${string}/${string}`|(string & {})` arms are
  mutually subsuming and collapse to `(string & {})`; dead structure, hover bloat.
- No naming collisions: `setDirname`/`setFormtarget`/`setFormenctype` are new names;
  grep confirms no existing methods. `setFor` widening reuses `extractId` (no second
  id path) — good convergence.
- `setMultiple`/`setRequired` correctly NOT added (boolean surface stays `.toggle`).

### 5. Security / escape — clears.
All six are plain attribute values routed through the renderer's `escapeAttr` choke
point; none is a URL/markup context (`accept`/`dirname`/`autocomplete`/`formtarget`/
`formenctype`/`for` are token/name attributes). `formtarget` reuses the shipped
`BrowsingContext`. No new XSS sink. §11.3 holds.

### 6. Breaking-change marking — clears.
"additive" is honest: single-arg `setAccept(string)` unchanged; `FormTag` enctype
retype is byte-identical (same members); single-arg `setFor` byte-identical;
`AutocompleteHint` widening is a strict superset (old tail guaranteed all prior
values compiled, still does). New fields are optional. v6 greenfield — no v5
surface. §11.5 holds.

### 7. §11.7 lockstep — correctly N/A.
No Tailwind classes emitted by any setter (all semantic HTML attributes). No
vocab/extractor row implied. The eslint-map lockstep claim is verified: lines
20/31/32/36 of prefer-set-method.ts already route `for`/`autocomplete`/`accept`/
`enctype`; `dirname`/`formtarget`/`formenctype` are the correct net-new additions.

## Does it survive?

Verdict: **survives-with-changes** (confidence 0.82).

It does NOT reject outright: four of the six items (#45 `setFormtarget`/
`setFormenctype` + `FormEnctype`, #48 `setDirname`, #49 `SelectTag.setAutocomplete`,
#50 variadic `setFor`) are genuine, unshipped, correctly-typed CORE primitive gaps
with clean escape, clean convergence (`FormEnctype` single-sources the enctype
literal), and a verified eslint-map lockstep. Those are shippable as-is.

But it cannot ship as written: the #69 `accept` typing is pure ceremony (the union
provides no checking and cannot, by the spec-openness the RFC itself cites), and the
#63/#49 autocomplete typo-safety claims are factually false against `tsc`. The RFC's
own success criteria ("a typo becomes a compile error") are unmet for its two
headline items, and the proposed type-tests would break CI. These are not nits —
they are the stated value proposition resting on a type that does the opposite of
what the prose claims. Required changes 1-5 (delete/demote `AcceptToken`, correct
all autocomplete typo-safety prose, fix the d-tests, trim redundant arms, resolve
the member-count blow-up before landing) must be applied verbatim; change 6 keeps
the sound four items. With those, the RFC is a net-positive convergent pass.

If the author cannot accept demoting #69/#63 to "autocomplete-DX only," reject and
re-scope to the four sound items.

## Guardrail check

- §11.1 zero-deps — PASS. Field assignment + `Array.isArray`/`join` + `extractId` reuse.
- §11.2 SSR-only / sync — PASS. All setters synchronous; render stays sync.
- §11.3 escape-by-default — PASS. All six values are token/name attributes through
  `escapeAttr`; no URL/markup sink.
- §11.4 type-safety — FAIL as written. `AcceptToken` and widened `AutocompleteHint`
  retain `(string & {})` yet are sold as typo-rejecting; verified by tsc that they
  reject nothing. `FormEnctype`/`BrowsingContext` correct (closed/open as intended).
  Must apply required-changes 1-2 before this passes.
- §11.5 compat — PASS. Additive; current calls render byte-identically; greenfield.
- §11.6 idioms — PASS. `set*` overrides; `.toggle` boolean surface preserved (no
  `setMultiple`/`setRequired`); `FormEnctype` CONVERGE. (Minor: `AcceptToken` is a
  second, non-functional "way" to type accept — change 1 removes it.)
- §11.7 class-string contract — N/A (correct). No Tailwind classes; eslint-map
  lockstep verified.
- §11.8 docs/guideline-sync — PASS in scope (README/fluent-html.md/JSDoc/CHANGELOG/
  eslint README/extractor note all enumerated, cover api_surface) — BUT the docs as
  drafted propagate the false typo-safety claim; they must be corrected in lockstep
  with changes 1-2 (do not ship README/JSDoc text asserting `'image'`/`'cc-numbr'`
  are compile errors).
