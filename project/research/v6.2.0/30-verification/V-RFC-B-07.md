---
rfc: RFC-B-07
lens: [type-safety, dx, security-escape]
verdict: survives-with-changes
confidence: 0.82
killer_objection: >
  The proposed `setDraggable(value: boolean | Draggable = true)` signature has NO
  precedent in the codebase and is a §11.6 CONVERGE violation: it accepts two input
  forms (`.setDraggable(false)` and `.setDraggable("false")`) for one output
  (`draggable="false"`). The RFC justifies the boolean arm by claiming it "matches
  the shipped precedent — setContenteditable and setSpellcheck both default to and
  accept literals" — but that is a misreading: those setters are LITERAL-ONLY with a
  literal default (`setContenteditable(value: ContentEditable = "true")`), and a
  grep of src/core/tag.ts + src/elements/*.ts finds zero `boolean | <Union>` setter
  signatures anywhere. The library's boolean story is `.toggle()`; enumerated
  attributes use literal-only setters. The boolean arm invents a third pattern the
  RFC itself calls "the only convergence wrinkle." Cut it: ship
  `setDraggable(value: Draggable = "true")`, byte-identical in shape to the shipped
  `setSpellcheck`.
required_changes:
  - >
    Replace the proposed signature with a literal-only, convergent one identical in
    shape to the shipped setSpellcheck (tag.ts:502). In src/core/tag.ts, placed after
    setAutocapitalize (line 509):
    `setDraggable(value: Draggable = "true"): this { return this.addAttribute("draggable", value); }`
    Drop the `boolean | Draggable` parameter, drop the internal `typeof value ===
    "boolean"` normalizer entirely (no normalizer is needed for a literal-only union).
  - >
    Rewrite the two worked examples that pass a boolean: the opt-out example becomes
    `Img().setSrc(logo).setDraggable("false")` (not `.setDraggable(false)`), and any
    prose claiming "boolean ergonomics" / "bare call ⇒ true, .setDraggable(false) ⇒
    false" must be removed from the JSDoc and the "Type-safety story" section. The
    bare call `.setDraggable()` still yields `draggable="true"` via the literal
    default — keep that example.
  - >
    Delete the "Alternatives considered" bullet that REJECTS the literal-only design
    ("Literal-only parameter ... drop the boolean arm — Rejected"). That alternative
    is now the chosen design. Delete Open Question #1 (boolean-arm vs literal-only) —
    it is resolved in favor of literal-only.
  - >
    Fix the api_surface frontmatter: change
    `Tag.setDraggable(value?: boolean | Draggable): this` to
    `Tag.setDraggable(value?: Draggable): this  // default "true"`.
  - >
    README.md global-attribute row: change the cells from `.setDraggable(false)` to
    `.setDraggable("false")` so the published doc matches the literal-only signature.
---

## Attack

I attacked through type-safety, dx, and security-escape, and verified every load-bearing
claim against source.

**Structural claims — all TRUE (no instant-reject found):**
- `setNonce(nonce: string)` is confirmed shipped on the base `Tag` at
  `src/core/tag.ts:204`, emits `nonce="<value>"`, lands on every element. The #43
  "already shipped, ship nothing" reading is correct; a `ScriptTag` override would
  duplicate it (CONVERGE). No code for #43 is the right call.
- `draggable`/`setDraggable` returns NOTHING in `src/`, the extractor, or the eslint
  plugin. Genuine gap. Not in CHANGELOG 6.0.0→6.1.1. Not an instant-reject.
- `Draggable` as a type name is free (grep returns no hits) — no naming collision.
- `BooleanAttribute` (html-types.ts:151) is a closed union and `draggable` is
  correctly absent; `.toggle("draggable")` is a compile error by design. Accurate.
- The sibling setters (`setContenteditable` 497, `setSpellcheck` 502,
  `setAutocapitalize` 507) and their closed unions (html-types.ts 108/111/114) exist
  exactly as quoted; `Spellcheck`/`ContentEditable`/`Autocapitalize`/`EnterKeyHint`
  are exported from `src/index.ts:51-54`, so adding `Draggable` to that block is right.

**The kill shot (DX + convergence, §11.6):** the `boolean | Draggable` parameter.
`grep -nE "set[A-Z]\w*\(value.*boolean"` and a scan for `boolean | <Union>` across
`src/core/tag.ts` and `src/elements/*.ts` return ZERO matches. There is no
boolean-or-literal setter anywhere in the library. The shipped enumerated setters the
RFC cites as precedent are literal-only with a literal default
(`setContenteditable(value: ContentEditable = "true")`). The RFC's own text concedes
the boolean arm is "the only convergence wrinkle" and that two inputs map to one
output. That is precisely the second-way-to-do-one-thing the guardrail forbids. The
library already has exactly one boolean idiom (`.toggle()`), which deliberately can't
reach `draggable`; bolting a boolean onto this one enumerated setter creates an
inconsistency a reader will reasonably (and wrongly) generalize to
`setContenteditable(true)`. Cut the arm and the RFC converges perfectly.

**Security/escape (§11.3):** no regression. Value routes through `addAttribute` →
`escapeAttr` (serialize.ts:7), and once the boolean arm is dropped the value is always
one of three string literals. No URL/`cite`/`src` handling. Clean.

**Type holes (§11.4):** `Draggable = 'true' | 'false' | 'auto'` is closed, no
`(string & {})` tail, no `any`, no bare `string`. With the literal-only signature a
typo (`"ture"`) is a compile error. Clean.

## Does it survive?

Survives WITH CHANGES. The RFC identifies a real, unshipped CORE primitive gap
(`draggable` is the last enumerated global interaction attribute lacking a typed
setter), correctly records `setNonce` as already shipped, and correctly SKIPs
`writingsuggestions` (non-Baseline) and `accesskey` (a11y footgun). The only defect is
the `boolean | Draggable` parameter, which violates CONVERGE and has no precedent. That
is a surgical cut, not a kill: removing the boolean arm leaves a one-line, literal-only
setter byte-identical in shape to the shipped `setSpellcheck`, and every worked example
still works (one example loses `.setDraggable(false)` in favor of `.setDraggable("false")`).
I did NOT reject outright because the underlying primitive is genuine, unshipped, and
unambiguously convergent once trimmed — and the cut is precise and verbatim-applicable.

## Guardrail check

- **§11.1 zero-deps** — PASS. Reduces to `addAttribute`; no runtime dependency.
- **§11.2 SSR-only / sync** — PASS. Synchronous attribute set; no async on render.
- **§11.3 escape-by-default** — PASS. Value is a closed-union literal routed through
  the existing `escapeAttr` choke point; no URL/attr-injection surface.
- **§11.4 type-safety** — PASS (post-cut). Closed literal union, no `any`/bare
  `string`; typo and `.toggle("draggable")` are compile errors.
- **§11.5 compat** — PASS. Additive within greenfield v6; honestly marked. No signature
  changes to existing methods. The already-shipped `setNonce` in api_surface is a
  doc-only record, not a code change — acceptable.
- **§11.6 idioms** — FAIL as drafted, PASS after the required cut. The `boolean |
  Draggable` arm is a second input form for one output and has no precedent in the
  codebase; removing it restores "exactly one way." `set*` override semantics and
  literal-default are correct. No inline JS.
- **§11.7 class-string contract** — PASS / N/A. Emits a plain HTML attribute, not a
  Tailwind class; no `vocab.ts`/extractor/eslint lockstep needed. Verified no
  `draggable` token in the extractor or eslint plugin, so nothing drifts.
- **§11.8 docs/guideline-sync** — PASS, conditional on the README cell fix in the
  required changes (so the published example matches the literal-only signature). The
  RFC otherwise covers every api_surface symbol (README, fluent-html.md, JSDoc,
  index.ts export, both tooling READMEs, CHANGELOG).
