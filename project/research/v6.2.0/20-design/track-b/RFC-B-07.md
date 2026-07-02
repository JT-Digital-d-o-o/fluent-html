---
id: RFC-B-07
track: B
resolves: [#43, #51]
api_surface:
  - "type Draggable = 'true' | 'false' | 'auto'"
  - "Tag.setDraggable(value?: Draggable): this  // default \"true\""
  - "Tag.setNonce(nonce: string): this  // ALREADY SHIPPED (tag.ts:204) — documented here, no code change"
breaking: additive
guardrails_checked: ["§11.1", "§11.2", "§11.3", "§11.4", "§11.5", "§11.6", "§11.7", "§11.8"]
guideline_updates:
  - "README.md (lib) — global-attribute table: add a `draggable` row (`.setDraggable()` / `.setDraggable(\"false\")` / `.setDraggable(\"auto\")`); confirm the existing `nonce` row points at `.setNonce()` (no ScriptTag-specific variant)."
  - "fluent-html.md — global editing/interaction attribute reference: add `setDraggable` next to `setContenteditable`/`setSpellcheck`; note `draggable` is enumerated (`true|false|auto`), NOT a boolean — `.toggle(\"draggable\")` is a deliberate compile error."
  - "JSDoc — `Tag.setDraggable` (enumerated tri-state, literal default `\"true\"`); the new `Draggable` union in html-types.ts (beside `Spellcheck`)."
  - "src/index.ts — export the `Draggable` type alongside `Spellcheck`/`ContentEditable`/`Autocapitalize`."
  - "../fluent-html-tailwind-extractor/README.md — one-line note: attribute-only RFC, no Tailwind classes, no vocab/extractor change."
  - "../fluent-html-eslint-plugin/README.md — one-line note: attribute-only RFC, no class vocab touched."
impact: "Closes the last typed-setter gap among the enumerated global interaction attributes: `draggable` joins `contenteditable`/`spellcheck`/`autocapitalize` with a closed-union setter, so drag-and-drop opt-in/opt-out stops routing through the CLAUDE.md-forbidden `.addAttribute(\"draggable\", …)` escape hatch. Also formally records that #43 (`setNonce`) is already shipped on the base `Tag`, correcting the roadmap. One global setter + one type — additive, zero call-site churn, zero-deps, attribute-only. The setter is literal-only and byte-identical in shape to the shipped `setSpellcheck`."
effort: M
depends_on: []
status: proposed
---

# RFC-B-07 — `draggable` typed setter; `nonce` already shipped

One small, convergent global-attribute pass. The roadmap pairs two items under
RFC-B-07: **#43 `ScriptTag.setNonce`** and **#51 `setDraggable`**. On inspection
these have opposite status, and the RFC's job is to make the contract honest:

- **#43 `setNonce` is ALREADY SHIPPED.** `Tag.setNonce(nonce: string)` lives on
  the base class at `src/core/tag.ts:204` (it lands on *every* element, which is
  correct — `nonce` is a global attribute, and CSP applies it on `<script>` /
  `<style>` via the inherited method). There is **nothing to add** and, per
  CONVERGE (§11.6), **nothing should be added** — a `ScriptTag`-specific override
  would create a second way to do one thing. This RFC ships *no code* for #43,
  only a docs/CHANGELOG correction recording it as present.

- **#51 `setDraggable` is the genuine gap** — and the only deliverable here.
  `grep -rni draggable src/` returns nothing; today the only path is
  `.addAttribute("draggable", "true")`, which CLAUDE.md forbids for standard
  props. `draggable` is an **enumerated** attribute (`true|false|auto`), not a
  boolean — so it is *correctly* absent from `BooleanAttribute` and `.toggle()`
  cannot reach it. It needs the same treatment its enumerated siblings already
  have: a **literal-only** closed-union setter with a literal default, byte-identical
  in shape to the shipped `setSpellcheck`.

The two web-component theming attributes that an earlier scoping note floated for
this RFC's "residue" (`setSlot` / `setPart` / `setExportparts`) are **owned by
RFC-B-06** (Declarative Shadow DOM) and are deliberately NOT re-proposed here, to
keep one owner per symbol. `writingsuggestions` and `accesskey` are explicit
**SKIPs** (see Alternatives).

## Problem

`fluent-html` already gives every enumerated global *editing/keyboard* attribute a
typed, closed-union setter on the base `Tag` (`src/core/tag.ts`):

```typescript
// src/core/tag.ts:497-509
setContenteditable(value: ContentEditable = "true"): this {
  return this.addAttribute("contenteditable", value);
}
setSpellcheck(value: Spellcheck = "true"): this {
  return this.addAttribute("spellcheck", value);
}
setAutocapitalize(value: Autocapitalize): this {
  return this.addAttribute("autocapitalize", value);
}
```

Each is backed by a closed union in `src/elements/html-types.ts` (lines 109-116):

```typescript
export type ContentEditable = 'true' | 'false' | 'plaintext-only';
export type Autocapitalize = 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';
export type Spellcheck = 'true' | 'false';
```

Note the shape: each is **literal-only** with a **literal default** (`= "true"`).
None accepts a `boolean`. The library's *only* boolean idiom is `.toggle()`
(driven by the closed `BooleanAttribute` union), and enumerated attributes are
expressly outside it.

`draggable` is the one enumerated global interaction attribute *missing* from this
set. It is also (correctly) absent from `BooleanAttribute` — that union is closed
(`html-types.ts:151-156`) and `draggable` is **not** a boolean attribute
(`<div draggable>` is invalid HTML; the value must be a literal `"true"`/`"false"`/
`"auto"`). So `.toggle("draggable")` is a compile error *by design*, and the only
remaining way to set it is:

```typescript
Li(item.label).addAttribute("draggable", "true")   // ✗ CLAUDE.md forbids addAttribute for standard props
```

There is no type safety on that string, and it violates the house rule
"never use `addAttribute` for standard props". This RFC closes that gap with a
setter identical in shape to `setSpellcheck`.

Separately, the `nonce` half of the roadmap item is already solved — `setNonce`
exists and works on the base `Tag` (so `Script(...).setNonce(n)` and
`Style(...).setNonce(n)` both type-check today, per the JSDoc at tag.ts:201-202).

## Proposed API

One new type and one new method. Both additive. The setter is **literal-only** —
no `boolean` arm — to converge exactly on the shipped enumerated-setter pattern.

```typescript
// src/elements/html-types.ts — placed beside Spellcheck (line 114):

/**
 * `draggable` — enumerated, NOT boolean. `"auto"` is the spec default (drag
 * behavior follows the element type; `<img>`/`<a>` are draggable, most else not).
 * Closed union: a typo like `.setDraggable("ture")` is a compile error.
 */
export type Draggable = 'true' | 'false' | 'auto';
```

```typescript
// src/core/tag.ts — placed beside setSpellcheck / after setAutocapitalize (after line 509):

/** Set `draggable` (the enumerated `"true"`/`"false"`/`"auto"` string, NOT a boolean attribute — `<div draggable>` is invalid HTML; `.toggle("draggable")` is a deliberate compile error). Bare call defaults to `"true"`. */
setDraggable(value: Draggable = "true"): this {
  return this.addAttribute("draggable", value);
}
```

This is byte-identical in shape to the shipped `setSpellcheck(value: Spellcheck =
"true")` (tag.ts:502) — same arity, same literal default, same single-line
`addAttribute` body, no normalizer.

```typescript
// src/index.ts — add to the existing enumerated-attr export block (lines 52-54):
export type {
  ContentEditable,
  Autocapitalize,
  Spellcheck,
  Draggable,   // ← new
  // …
};
```

**Already shipped (no change — contract recorded for completeness):**

```typescript
// src/core/tag.ts:204 — exists today, lands on every Tag (global attr).
setNonce(nonce: string): this;   // emits nonce="<value>"
```

## Worked examples

**Opt a list item into drag-and-drop (the #51 deliverable):**

```typescript
// before
Li(item.label).addAttribute("draggable", "true")   // ✗ untyped, forbidden escape hatch

// after
Li(item.label).setDraggable()                       // ✓ draggable="true" (literal default)
```

**Opt a natively-draggable element OUT:**

```typescript
// before
Img().setSrc(logo).addAttribute("draggable", "false")

// after
Img().setSrc(logo).setDraggable("false")            // ✓ draggable="false"
```

**Reach the spec default explicitly:**

```typescript
A("Profile").setHref("/me").setDraggable("auto")    // ✓ draggable="auto"
```

**A typo is a compile error (§11.4):**

```typescript
Li(x).setDraggable("ture")   // ✗ Argument of type '"ture"' is not assignable to 'Draggable'
Li(x).setDraggable(false)    // ✗ Argument of type 'boolean' is not assignable to 'Draggable' (no boolean arm — by design)
Li(x).toggle("draggable")    // ✗ '"draggable"' is not assignable to BooleanAttribute (by design)
```

**`nonce` — already works, no API surface added by this RFC:**

```typescript
Script("init()").setNonce(reply.cspNonce)   // ✓ today — nonce="<value>"  (tag.ts:204)
```

> No real drag-and-drop call site exists in the apps/template — `grep -rni
> draggable` across `/Users/tony/jt-digital/ttl/project` and the projects-template
> is empty, consistent with the attribute's rarity. The `before` forms above are
> the forbidden workaround the discovery note cited, not extracted call sites.

## Type-safety story

- `Draggable` is a **closed** union (no `(string & {})` tail) — mirrors
  `Spellcheck`/`ContentEditable`. A misspelled literal is a compile error.
- The parameter is **literal-only with a literal default** (`value: Draggable =
  "true"`), exactly the shape of `setSpellcheck`/`setContenteditable`. There is
  **one input form per output**: `.setDraggable()` and `.setDraggable("true")`
  both emit `draggable="true"` via the same literal default (the standard
  default-argument idiom across the library's enumerated setters), and each of
  `"false"`/`"auto"` has exactly one spelling. No `boolean` arm, so no
  two-inputs-one-output divergence — CONVERGE holds.
- No `any`, no bare `string` where a literal set is valid, no internal normalizer.
  The attribute value reaching the renderer is always one of three string literals.

## Migration & compatibility

Purely **additive** within v6 (greenfield, no published consumers — §11.5). No
existing signature changes; no call sites churn. Authors currently using
`.addAttribute("draggable", …)` *may* migrate to `.setDraggable(…)` but are not
required to — the escape hatch still works. `setNonce` is unchanged. No breaking
behavior; benign inputs render identically.

## Docs impact (§11.8)

Exact files and patches:

1. **`README.md`** (lib) — in the global-attribute table, add a row:

   ```markdown
   | `draggable` | `.setDraggable()` · `.setDraggable("false")` · `.setDraggable("auto")` | `draggable="true|false|auto"` (enumerated, not boolean) |
   ```

   and confirm the existing `nonce` row reads `.setNonce(nonce)` (base `Tag`, used
   on `Script`/`Style`) — no ScriptTag-specific entry.

2. **`fluent-html.md`** — in the global editing/interaction attribute reference,
   add `setDraggable` beside `setContenteditable`/`setSpellcheck`, with the note:
   *"`draggable` is enumerated (`true|false|auto`), not a boolean attribute —
   `.toggle(\"draggable\")` is a deliberate compile error; use `.setDraggable()`
   (defaults to `\"true\"`) or `.setDraggable(\"false\"|\"auto\")`."*

3. **JSDoc** — the `setDraggable` method block (shown above, literal-only, literal
   default `"true"`) and a doc comment on the `Draggable` union in `html-types.ts`
   (beside `Spellcheck`). No "boolean ergonomics" language anywhere.

4. **`src/index.ts`** — export `Draggable` in the enumerated-attr `export type`
   block (lines 52-54).

5. **`../fluent-html-tailwind-extractor/README.md`** and
   **`../fluent-html-eslint-plugin/README.md`** — one line each: *"RFC-B-07 is
   attribute-only (`draggable`); no Tailwind classes, no vocab/extractor/lint
   change."*

6. **`CHANGELOG.md`** — under the next version's `✨ Added`: the `setDraggable`
   entry (literal-only enumerated setter, default `"true"`); and a one-line note
   under a `📝 Docs/Notes`-style bullet recording that `setNonce` (#43) was already
   present since the base-`Tag` work and needs no new API.

## Guardrail check

- **§11.1 zero-deps** — no new runtime dependency; method reduces to `addAttribute`.
- **§11.2 SSR-only / sync** — pure synchronous attribute set on render; no async.
- **§11.3 escape-by-default** — value routes through `addAttribute` → the existing
  `escapeAttr` choke point in the serializer (serialize.ts:7); values are
  closed-union literals anyway, so no XSS surface. No `cite`/`src`/URL handling
  involved.
- **§11.4 type-safety** — `Draggable` is a closed literal union; no `any`, no bare
  `string`; a typo (`"ture"`), a `boolean` argument, and `.toggle("draggable")` are
  all compile errors.
- **§11.5 compat** — additive within v6 (greenfield); no signature changes; honestly
  marked `breaking: additive`. The already-shipped `setNonce` in `api_surface` is a
  doc-only record, not a code change.
- **§11.6 idioms** — `set*` override semantics; default via a literal (matches
  `setSpellcheck`); **literal-only**, no boolean arm, no second input form; no inline
  JS. CONVERGE upheld: one setter, one input form per output; explicitly ships nothing
  for `nonce` (already one way) and defers slot/part to RFC-B-06 (single owner per
  symbol). The library's sole boolean idiom (`.toggle()`) is left untouched and is not
  extended to an enumerated attribute.
- **§11.7 class-string contract** — N/A: `setDraggable` emits a plain HTML
  attribute, not a Tailwind class. No `src/class-vocab/vocab.ts` entry, no
  extractor/eslint lockstep. (Likewise `setNonce` emits an attribute.) Verified: no
  `draggable` token in the extractor or eslint plugin, so nothing drifts.
- **§11.8 docs/guideline-sync** — README + fluent-html.md + JSDoc + `index.ts`
  export + both tooling READMEs + CHANGELOG, covering every symbol in
  `api_surface` (the `Draggable` type, `setDraggable`, and the `setNonce` note).

## Alternatives considered

- **A `boolean | Draggable` parameter with an internal normalizer** — rejected (and
  cut from the original draft per the adversary verdict). It accepts two input forms
  (`.setDraggable(false)` and `.setDraggable("false")`) for one output, has **zero
  precedent** in `src/core/tag.ts` / `src/elements/*.ts` (no `boolean | <Union>`
  setter exists anywhere), and would invent a third boolean pattern alongside the
  library's sole `.toggle()` idiom — a §11.6 CONVERGE violation. The literal-only
  signature below is the chosen design.
- **A `ScriptTag`-specific `setNonce` override (literal #43 reading)** — rejected:
  `setNonce` already exists on the base `Tag` (tag.ts:204) and applies to every
  element including `Script`/`Style`. A subclass override would duplicate the API
  and break CONVERGE (§11.6). Ship nothing.
- **`setWritingsuggestions(value?: "true" | "false")`** — rejected
  (SKIP). Verified against MDN (2026-06): `writingsuggestions` is **Limited
  availability — NOT Baseline** (no Firefox/Safari). A typed setter would advertise
  a Chromium-only attribute the type system can't make runtime-safe, and it overlaps
  the disable-suggestions use case already served by `setSpellcheck`/autocomplete.
  The `.addAttribute("writingsuggestions", …)` escape hatch remains for the rare
  case. Revisit when cross-engine.
- **`setAccesskey(key: string)`** — rejected (SKIP). Baseline-available but
  **WCAG-discouraged** (collides with assistive-tech and OS/browser shortcuts,
  locale-dependent, no reliable affordance). A first-class setter would steer
  authors toward an a11y footgun; the escape hatch stays for the rare legitimate
  use.
- **`setSlot` / `setPart` / `setExportparts`** — not here; **owned by RFC-B-06**
  (Declarative Shadow DOM + `::part`/slot theming). Keeping a single owner per
  symbol preserves CONVERGE across the track.
- **Other audited globals** — `inert`/`autofocus` are boolean and correctly handled
  by `.toggle()` (both in `BooleanAttribute`); `virtualkeyboardpolicy`/`autocorrect`
  are non-Baseline or Safari-historic — all SKIP, no setters.

## Open questions

1. **`auto` discoverability** — is the JSDoc note enough to surface that `"auto"`
   (not `"false"`) is the spec default, or should the README row spell out the
   per-element default behavior? Lean: JSDoc + README note is sufficient.
2. **CHANGELOG placement of the #43 note** — record the already-shipped `setNonce`
   under `✨ Added` of an earlier version retroactively, or as a standalone
   "roadmap correction" line in the 6.2.0 entry? Lean: a single 6.2.0 note.

## Adversary review & resolutions

Verdict: **survives-with-changes** (confidence 0.82). Killer objection: the drafted
`setDraggable(value: boolean | Draggable = true)` signature has no precedent and
violates §11.6 CONVERGE (two inputs → one output). All five required changes folded
in:

1. **"Replace the signature with literal-only, identical to `setSpellcheck`; drop
   the `boolean | Draggable` parameter and the `typeof value === "boolean"`
   normalizer."** — Resolved. The Proposed API now ships
   `setDraggable(value: Draggable = "true"): this { return this.addAttribute("draggable", value); }`
   — one line, no normalizer, byte-identical in shape to tag.ts:502. Frontmatter
   `api_surface` updated to `Tag.setDraggable(value?: Draggable): this  // default "true"`.

2. **"Rewrite the boolean worked examples; remove 'boolean ergonomics' prose from
   JSDoc and the Type-safety story; keep the bare-call default example."** —
   Resolved. The opt-out example is now `Img().setSrc(logo).setDraggable("false")`;
   the bare `.setDraggable()` ⇒ `draggable="true"` example is kept (literal default).
   The JSDoc and "Type-safety story" carry no boolean-ergonomics language; the latter
   now states the parameter is literal-only with one input form per output. The
   compile-error example adds `.setDraggable(false)` as a deliberate type error.

3. **"Delete the Alternatives bullet that rejected literal-only; delete Open
   Question #1."** — Resolved. Literal-only is now the chosen design, so the old
   "reject literal-only" bullet is replaced by a bullet that instead rejects the
   *boolean-arm* alternative. Open Question #1 (boolean vs literal) is deleted;
   remaining questions renumbered.

4. **"Fix `api_surface` frontmatter to `Tag.setDraggable(value?: Draggable): this
   // default \"true\"`."** — Resolved (see #1).

5. **"README global-attribute row: change `.setDraggable(false)` cells to
   `.setDraggable(\"false\")`."** — Resolved. The Docs-impact README row and the
   `guideline_updates` frontmatter entry now read `.setDraggable("false")`.

Structural claims the adversary verified as TRUE were left intact: `setNonce` shipped
at tag.ts:204 (ship nothing for #43), `draggable` genuinely absent and not in the
CHANGELOG, `Draggable` name free, closed-union typing, `escapeAttr` choke point
preserved, §11.7 N/A.
