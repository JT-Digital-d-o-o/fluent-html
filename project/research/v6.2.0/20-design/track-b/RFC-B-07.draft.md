---
id: RFC-B-07
track: B
resolves: [#43, #51]
api_surface:
  - "type Draggable = 'true' | 'false' | 'auto'"
  - "Tag.setDraggable(value?: boolean | Draggable): this"
  - "Tag.setNonce(nonce: string): this  // ALREADY SHIPPED (tag.ts:204) — documented here, no code change"
breaking: additive
guardrails_checked: ["§11.1", "§11.2", "§11.3", "§11.4", "§11.5", "§11.6", "§11.7", "§11.8"]
guideline_updates:
  - "README.md (lib) — global-attribute table: add a `draggable` row (`.setDraggable()` / `.setDraggable(false)` / `.setDraggable(\"auto\")`); confirm the existing `nonce` row points at `.setNonce()` (no ScriptTag-specific variant)."
  - "fluent-html.md — global editing/interaction attribute reference: add `setDraggable` next to `setContenteditable`/`setSpellcheck`; note `draggable` is enumerated (`true|false|auto`), NOT a boolean — `.toggle(\"draggable\")` is a deliberate compile error."
  - "JSDoc — `Tag.setDraggable` (enumerated tri-state, boolean ergonomics, default `\"true\"`); the new `Draggable` union in html-types.ts (beside `Spellcheck`)."
  - "src/index.ts — export the `Draggable` type alongside `Spellcheck`/`ContentEditable`/`Autocapitalize`."
  - "../fluent-html-tailwind-extractor/README.md — one-line note: attribute-only RFC, no Tailwind classes, no vocab/extractor change."
  - "../fluent-html-eslint-plugin/README.md — one-line note: attribute-only RFC, no class vocab touched."
impact: "Closes the last typed-setter gap among the enumerated global interaction attributes: `draggable` joins `contenteditable`/`spellcheck`/`autocapitalize` with a closed-union setter, so drag-and-drop opt-in/opt-out stops routing through the CLAUDE.md-forbidden `.addAttribute(\"draggable\", …)` escape hatch. Also formally records that #43 (`setNonce`) is already shipped on the base `Tag`, correcting the roadmap. One global setter + one type — additive, zero call-site churn, zero-deps, attribute-only."
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
  have.

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

One new type and one new method. Both additive.

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
// src/core/tag.ts — placed beside setSpellcheck (after line 504):

/**
 * Set `draggable` (the enumerated `"true"`/`"false"`/`"auto"` string, NOT a
 * boolean attribute — `<div draggable>` is invalid HTML). Boolean ergonomics:
 * bare call ⇒ `draggable="true"`, `.setDraggable(false)` ⇒ `draggable="false"`
 * (opt a natively-draggable `<img>`/`<a>` out), `.setDraggable("auto")` ⇒ the
 * spec default. `.toggle("draggable")` does NOT exist — this is not a boolean attr.
 */
setDraggable(value: boolean | Draggable = true): this {
  const v = typeof value === "boolean" ? (value ? "true" : "false") : value;
  return this.addAttribute("draggable", v);
}
```

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
Li(item.label).setDraggable()                       // ✓ draggable="true"
```

**Opt a natively-draggable element OUT:**

```typescript
// before
Img().setSrc(logo).addAttribute("draggable", "false")

// after
Img().setSrc(logo).setDraggable(false)              // ✓ draggable="false"
```

**Reach the spec default explicitly:**

```typescript
A("Profile").setHref("/me").setDraggable("auto")    // ✓ draggable="auto"
```

**A typo is a compile error (§11.4):**

```typescript
Li(x).setDraggable("ture")   // ✗ Argument of type '"ture"' is not assignable to 'boolean | Draggable'
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
- The `boolean | Draggable` parameter is the *only* convergence wrinkle: both
  `.setDraggable(false)` and `.setDraggable("false")` reach `draggable="false"`.
  This is intentional and matches the shipped precedent — `setContenteditable`
  and `setSpellcheck` both default to and accept literals, and boolean is the
  common ergonomic call (`.setDraggable()` to enable, `.setDraggable(false)` to
  disable) while the `"auto"`/`"false"` literals cover what boolean can't express
  cleanly. The internal normalizer collapses both to the canonical literal before
  `addAttribute`, so there is exactly one *emitted* form per intent.
- No `any`, no bare `string` where a literal set is valid. The attribute value
  reaching the renderer is always one of three string literals.

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
   | `draggable` | `.setDraggable()` · `.setDraggable(false)` · `.setDraggable("auto")` | `draggable="true|false|auto"` (enumerated, not boolean) |
   ```

   and confirm the existing `nonce` row reads `.setNonce(nonce)` (base `Tag`, used
   on `Script`/`Style`) — no ScriptTag-specific entry.

2. **`fluent-html.md`** — in the global editing/interaction attribute reference,
   add `setDraggable` beside `setContenteditable`/`setSpellcheck`, with the note:
   *"`draggable` is enumerated (`true|false|auto`), not a boolean attribute —
   `.toggle(\"draggable\")` is a deliberate compile error; use `.setDraggable()`."*

3. **JSDoc** — the `setDraggable` method block (shown above) and a doc comment on
   the `Draggable` union in `html-types.ts` (beside `Spellcheck`).

4. **`src/index.ts`** — export `Draggable` in the enumerated-attr `export type`
   block (lines 52-54).

5. **`../fluent-html-tailwind-extractor/README.md`** and
   **`../fluent-html-eslint-plugin/README.md`** — one line each: *"RFC-B-07 is
   attribute-only (`draggable`); no Tailwind classes, no vocab/extractor/lint
   change."*

6. **`CHANGELOG.md`** — under the next version's `✨ Added`: the `setDraggable`
   entry; and a one-line note under a `📝 Docs/Notes`-style bullet recording that
   `setNonce` (#43) was already present since the base-`Tag` work and needs no new
   API.

## Guardrail check

- **§11.1 zero-deps** — no new runtime dependency; method reduces to `addAttribute`.
- **§11.2 SSR-only / sync** — pure synchronous attribute set on render; no async.
- **§11.3 escape-by-default** — value routes through `addAttribute` → the existing
  `escapeAttr` choke point in the serializer; values are closed-union literals
  anyway, so no XSS surface. No `cite`/`src`/URL handling involved.
- **§11.4 type-safety** — `Draggable` is a closed literal union; no `any`, no bare
  `string`; a typo (`"ture"`) and `.toggle("draggable")` are both compile errors.
- **§11.5 compat** — additive within v6 (greenfield); no signature changes; honestly
  marked `breaking: additive`.
- **§11.6 idioms** — `set*` override semantics; defaults via a literal (matches
  `setSpellcheck`); no inline JS. CONVERGE upheld: one setter, one emitted form per
  intent; explicitly ships nothing for `nonce` (already one way) and defers
  slot/part to RFC-B-06 (single owner per symbol).
- **§11.7 class-string contract** — N/A: `setDraggable` emits a plain HTML
  attribute, not a Tailwind class. No `src/class-vocab/vocab.ts` entry, no
  extractor/eslint lockstep. (Likewise `setNonce` emits an attribute.)
- **§11.8 docs/guideline-sync** — README + fluent-html.md + JSDoc + `index.ts`
  export + both tooling READMEs + CHANGELOG, covering every symbol in
  `api_surface` (the `Draggable` type, `setDraggable`, and the `setNonce` note).

## Alternatives considered

- **Literal-only parameter (`value: Draggable = "true"`), drop the boolean arm** —
  strictest CONVERGE (exactly one input per output). Rejected: boolean is the
  ergonomic common case (`.setDraggable()` / `.setDraggable(false)`), and the
  shipped `setContenteditable`/`setSpellcheck` precedent already accepts the
  literal-with-default shape; the boolean arm is a small, well-precedented
  convenience that still collapses to one emitted form.
- **A `ScriptTag`-specific `setNonce` override (literal #43 reading)** — rejected:
  `setNonce` already exists on the base `Tag` (tag.ts:204) and applies to every
  element including `Script`/`Style`. A subclass override would duplicate the API
  and break CONVERGE (§11.6). Ship nothing.
- **`setWritingsuggestions(value?: boolean | "true" | "false")`** — rejected
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

1. **Boolean arm vs. literal-only** — keep `boolean | Draggable` (recommended,
   precedent-backed) or tighten to `Draggable`-only? Resolve before merge; trivial
   either way.
2. **`auto` discoverability** — is the JSDoc note enough to surface that `"auto"`
   (not `"false"`) is the spec default, or should the README row spell out the
   per-element default behavior? Lean: JSDoc + README note is sufficient.
3. **CHANGELOG placement of the #43 note** — record the already-shipped `setNonce`
   under `✨ Added` of an earlier version retroactively, or as a standalone
   "roadmap correction" line in the 6.2.0 entry? Lean: a single 6.2.0 note.
