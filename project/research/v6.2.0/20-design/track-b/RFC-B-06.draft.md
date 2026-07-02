---
id: RFC-B-06
track: B
resolves: [#22, #38]
api_surface:
  - "TemplateTag extends Tag"
  - "TemplateTag.shadowrootmode?: ShadowRootMode"
  - "TemplateTag.setShadowrootmode(mode?: ShadowRootMode): this"
  - "Template(...children: View[]): TemplateTag"
  - "type ShadowRootMode = 'open' | 'closed'"
  - "BooleanAttribute += 'shadowrootclonable' | 'shadowrootdelegatesfocus' | 'shadowrootserializable'"
  - "Tag.setSlot(name?: string): this"
  - "Tag.setPart(...names: string[]): this"
  - "Tag.addPart(name: string): this"
  - "Tag.setExportparts(...maps: (string | readonly [inner: string, exposed: string])[]): this"
breaking: additive
guardrails_checked: ["§11.1", "§11.2", "§11.3", "§11.4", "§11.5", "§11.6", "§11.7", "§11.8"]
guideline_updates:
  - "README.md (lib) — new 'Declarative Shadow DOM & web-component theming' section: Template().setShadowrootmode(\"open\") + the three DSD boolean tokens; scoped <style> with :host/::slotted/::part; the setSlot (sender) vs Slot/setName (receiver) triad; setPart/addPart/setExportparts ::part theming"
  - "fluent-html.md — web-components reference rows: setShadowrootmode, the 3 shadowroot* boolean tokens, setSlot, setPart/addPart, setExportparts; the SSR-DSD/htmx setHTMLUnsafe caveat"
  - "JSDoc — TemplateTag.setShadowrootmode (open/closed distinction); the 3 new BooleanAttribute members documented in html-types.ts; Tag.setSlot (contrast with SlotTag.setName — sender vs receiver); Tag.setPart/addPart/setExportparts (only effective inside a shadow tree)"
  - "../fluent-html-tailwind-extractor/README.md — one-line note: attribute-only RFC, no Tailwind classes, no vocab/extractor change"
  - "../fluent-html-eslint-plugin/README.md — one-line note: attribute-only RFC, no class vocab touched"
impact: "Opens the zero-JS web-component surface an SSR builder can actually ship: Declarative Shadow DOM (Template().setShadowrootmode + shadowroot* booleans) is the only no-script way to emit a shadow tree, and part/exportparts/slot are the standards-track seams to theme and fill it from outside (::part(), ::slotted(), named slots). Promotes the bare Template factory to a typed TemplateTag and adds four global Tag setters — all attribute-only primitives (instruction-set, not @jtdigital/ui components), net-new surface with zero call-site churn."
effort: L
depends_on: []
status: proposed
---

# RFC-B-06 — Declarative Shadow DOM + `::part`/slot theming

One convergent web-components pass: promote the bare `Template` factory to a
typed `TemplateTag` carrying the Declarative-Shadow-DOM (DSD) attributes, and add
the four global theming-seam setters — `setSlot` (assign a light-DOM child into a
named slot), `setPart`/`addPart` (expose a themeable surface via `::part()`), and
`setExportparts` (forward inner parts upward). Together these are the **only
standards-track, zero-JS way an SSR HTML builder ships a shadow tree and lets the
outside page theme it**. Every member is a plain HTML attribute primitive —
instruction-set surface, not an opinionated `@jtdigital/ui` component — and each
reuses an existing emit path (`defineSchemaKeys`, `Tag.toggle`, `addAttribute`)
so there is exactly one way to set each attribute.

## Problem

The web-components surface is **half-built**: `Slot()` opened the receiver side
but every other DSD/theming attribute is reachable only through the
CLAUDE.md-forbidden `addAttribute` escape hatch.

- **`Template` is a bare untyped factory with no DSD reach.**
  `src/elements/document.ts:236` is `export function Template(...children:
  View[]): Tag { return El("template", ...children); }` — a plain inert
  `<template>` with no `shadowrootmode`. Declarative Shadow DOM (the only way to
  emit a shadow tree from server-rendered HTML with **zero JS**) requires
  `shadowrootmode="open"|"closed"` plus the boolean tuning attrs
  `shadowrootclonable` / `shadowrootdelegatesfocus` / `shadowrootserializable`.
  Today every one of these needs `.addAttribute("shadowrootmode", "open")` —
  untyped, no autocomplete, no compile-time guard.
- **There is no way to assign a light-DOM child into a named slot.**
  `SlotTag.setName` (`src/elements/webcomponents.ts:9`) names the **receiver**
  `<slot name="header">`. But the **sender** side — `slot="header"` on the
  light-DOM child distributed *into* that slot — has no setter. `slot` is a
  *global* attribute valid on any element; today it is only reachable via
  `.addAttribute("slot", "header")`. Grep of `src/core/tag.ts` for `setSlot` /
  `addAttribute("slot"` returns nothing. The two are inverse directions of one
  feature, and only one direction shipped.
- **A shadow tree cannot be themed from outside.** The `part` global attribute
  (with `::part()` CSS) is the only standards-track seam that lets a consuming
  page style a shadow tree's internals; `exportparts` forwards a descendant's
  parts up through a nested host. Neither is reachable except via
  `.addAttribute("part", "card elevated")` — hand-joined, error-prone, untyped.

**Verified not shipped in 6.1.x.** Grep over `src/` for
`shadowroot|delegatesfocus|clonable|serializable|TemplateTag|setPart|exportparts|setSlot`
returns nothing; `CHANGELOG.md` (6.0.0→6.1.1) has zero DSD/part/exportparts
mentions and references `slot` only as the `Slot()` element factory's own `name`
attribute (a *different* attribute on a *different* element). `BooleanAttribute`
(`src/elements/html-types.ts:151-156`) does not yet list any `shadowroot*` token.

These are plain HTML attribute primitives — per the architecture memory,
fluent-html ships the **theming seams** (DSD tokens, `slot`, `part`,
`exportparts`); the *opinionated* themeable component (Card/Button-with-parts)
belongs in user-land `@jtdigital/ui`. `setPart`/`setSlot` are the minimal,
unopinionated 1-line setters that make a user-land themeable web component
*possible* without core owning any component.

## Proposed API

Full TS signatures — **the contract**. Two mechanisms, each matching an existing
idiom: enumerated attributes get a typed setter on the promoted `TemplateTag`;
bare booleans reuse `Tag.toggle`; the three global theming attributes get global
`Tag` setters routed through `addAttribute` (exactly like `setMicrodata`/`setRole`/
`setPopover`).

### `src/elements/html-types.ts` — new union + boolean tokens

```typescript
/** `shadowrootmode` values — a **closed** union so a typo is a compile error. */
export type ShadowRootMode = 'open' | 'closed';

// Three DSD boolean attributes added to the existing closed BooleanAttribute union
// (set via Tag.toggle — no new method; reuses the bare-boolean serialize path):
export type BooleanAttribute =
  | /* …existing 25 members… */
  | 'shadowrootclonable'
  | 'shadowrootdelegatesfocus'
  | 'shadowrootserializable';
```

### `src/elements/document.ts` — promote `Template` → `TemplateTag`

```typescript
export class TemplateTag extends Tag {
  shadowrootmode?: ShadowRootMode;

  /**
   * Set `shadowrootmode` — `'open'` (shadow tree script-accessible) or
   * `'closed'` (script-inaccessible). Omit / `undefined` emits **no attribute**
   * (a plain inert `<template>`, byte-identical to today). Placing children
   * (`<style>`, `<slot>`, markup) inside a `shadowrootmode` template makes the
   * browser attach them as a Declarative Shadow DOM with zero JS.
   */
  setShadowrootmode(mode?: ShadowRootMode): this {
    this.shadowrootmode = mode;
    return this;
  }
}

defineSchemaKeys(TemplateTag, ['shadowrootmode']);

export function Template(...children: View[]): TemplateTag {
  return new TemplateTag('template', ...children);
}
```

`ShadowRootMode` is added to the `document.ts` type-import block. The three
boolean DSD attributes need **no method** — they ride `Tag.toggle`
(`src/core/tag.ts:220`), whose bare-boolean output is already admitted by the
`BOOLEAN_ATTR_RE` guard (`src/render/serialize.ts:171`, letters-and-hyphens
only) with no emitter edit.

### `src/core/tag.ts` — four global theming setters

```typescript
/**
 * Assign this light-DOM child into a custom element's named `<slot>` — the
 * **sender** side. Inverse of `SlotTag.setName`, which names the **receiver**
 * `<slot name="header">`. `undefined` clears (no attribute). Only effective when
 * an ancestor is a shadow host (custom element or DSD `<template>`); otherwise
 * inert per standard HTML.
 *
 * @example H1("Title").setSlot("header")   // <h1 slot="header">Title</h1>
 */
setSlot(name?: string): this {
  return name === undefined ? this : this.addAttribute("slot", name);
}

/**
 * Expose this element as a themeable `::part()` surface — **override** semantics
 * (replaces any prior part list). Token list is space-joined. A bare `setPart()`
 * with no args emits nothing (never `part=""`). Only effective inside a shadow
 * tree.
 *
 * @example Div("x").setPart("card", "elevated")   // part="card elevated"
 */
setPart(...names: string[]): this {
  const list = names.filter(Boolean).join(" ");
  return list === "" ? this : this.addAttribute("part", list);
}

/**
 * Append one part name to this element's existing `part` list — **accumulate**
 * counterpart of `setPart`. `addPart("")` is a no-op.
 *
 * @example Div("x").setPart("card").addPart("active")   // part="card active"
 */
addPart(name: string): this {
  if (name === "") return this;
  const cur = this.attributes["part"];
  return this.addAttribute("part", cur ? `${cur} ${name}` : name);
}

/**
 * Forward descendant parts up through a nested shadow host — **override**
 * semantics. Each arg is either a bare `"name"` (re-export under the same name)
 * or a `[inner, exposed]` tuple (rename). Maps join with `", "`; a rename emits
 * `"inner: exposed"`.
 *
 * @example Slot().setExportparts("card", ["inner-label", "label"])
 *          // exportparts="card, inner-label: label"
 */
setExportparts(...maps: (string | readonly [inner: string, exposed: string])[]): this {
  const list = maps
    .map(m => (typeof m === "string" ? m : `${m[0]}: ${m[1]}`))
    .join(", ");
  return list === "" ? this : this.addAttribute("exportparts", list);
}
```

`setPart`/`addPart`/`setExportparts`/`setSlot` route through the existing
`addAttribute` path (`src/core/tag.ts:188`), so the value is `escapeAttr`'d at
render like every other attribute — no new emitter code, no `defineSchemaKeys`
change (they ride the attributes bag, like `setRole`/`setMicrodata`, keeping the
hot-path schema array untouched).

### Emitted output (the contract)

| Call | Output |
| --- | --- |
| `Template(P("x"))` | `<template>…</template>` (unchanged) |
| `Template(Slot()).setShadowrootmode("open")` | `<template shadowrootmode="open"><slot></slot></template>` |
| `Template(Slot()).setShadowrootmode("closed")` | `<template shadowrootmode="closed"><slot></slot></template>` |
| `Template().setShadowrootmode("open").toggle("shadowrootdelegatesfocus").toggle("shadowrootserializable")` | `<template shadowrootmode="open" shadowrootdelegatesfocus shadowrootserializable></template>` |
| `H1("Title").setSlot("header")` | `<h1 slot="header">Title</h1>` |
| `Div("x").setSlot()` | `<div>x</div>` (no attribute) |
| `Div("x").setPart("card", "elevated")` | `<div part="card elevated">x</div>` |
| `Div("x").setPart("card").addPart("active")` | `<div part="card active">x</div>` |
| `Div("x").setPart()` | `<div>x</div>` (no `part=""`) |
| `Slot().setExportparts("card", ["inner-label", "label"])` | `<slot exportparts="card, inner-label: label"></slot>` |

## Worked examples

**Declarative Shadow DOM with scoped style + slot (zero JS).**

```typescript
// Before — only the addAttribute escape hatch (CLAUDE.md-forbidden, untyped):
import { Template } from "fluent-html";
Template(P("shadow content"))
  .addAttribute("shadowrootmode", "open")              // ✗ untyped, no DSD guard
  .addAttribute("shadowrootdelegatesfocus", "");       // ✗ stringly boolean

// After:
import { Template, Style, Slot } from "fluent-html";
Template(
  Style(":host{display:block} ::slotted(h2){color:var(--accent)} ::part(label){font-weight:600}"),
  Slot(),
)
  .setShadowrootmode("open")
  .toggle("shadowrootdelegatesfocus")
  .toggle("shadowrootserializable");
// → <template shadowrootmode="open" shadowrootdelegatesfocus shadowrootserializable>
//     <style>…</style><slot></slot>
//   </template>
```

The shadow boundary scopes the child `<style>` natively — `:host`, `::slotted()`,
`::part()` all work with **no new API** (`Style(css)`, `document.ts:207`, already
emits raw CSS).

**Sender/receiver slot pairing.**

```typescript
// Receiver (the host's shadow tree):  Slot().setName("header")   // <slot name="header">
// Sender   (light-DOM child):
H1("Welcome").setSlot("header");        // <h1 slot="header">Welcome</h1>  ✓ distributes into the named slot
```

**`::part` theming + upward forwarding (user-land themeable component).**

```typescript
// Inside a user-land @jtdigital/ui web component's shadow internals:
Span(label).setPart("label");                       // <span part="label">
Slot().setExportparts("label", ["icon", "lead-icon"]); // <slot exportparts="label, icon: lead-icon">
// The consuming page then themes it with zero coupling:
//   my-button::part(label) { letter-spacing: .02em }
```

No in-repo app call site uses any of these attributes today — grep over
`ttl/project`, `rideshare/src`, and `fluent-html-demos` for `shadowroot`/`part=`/
`exportparts`/`slot=` returns nothing. This is net-new surface; nothing to
migrate. The closest existing precedent is `setMicrodata` (`tag.ts:528`, global
`addAttribute` setter) and the `addClass` accumulate path (`tag.ts:125`).

## Type-safety story

- **`shadowrootmode` is a closed union.** `ShadowRootMode = 'open' | 'closed'`
  (no `(string & {})` escape) — `setShadowrootmode("opne")` is a **compile
  error**, matching the closed-union posture of `SlotTag.setName`'s siblings and
  every enumerated attribute setter.
- **The three DSD booleans reuse the closed `BooleanAttribute` union.**
  `.toggle("shadowrootclonable")` is type-checked against the same union as
  `.toggle("required")`; a typo is a compile error. They are *global* on
  `BooleanAttribute` — type-valid on any tag — the identical trade-off already
  accepted for `'selected'`/`'checked'`/`'open'` (element-specific booleans that
  live in the shared union); no per-element narrowing exists today and adding it
  would be a separate breaking redesign.
- **`setExportparts` types the *structure*, not the token names.**
  `string | readonly [inner: string, exposed: string]` — the `readonly` 2-tuple
  makes the rename arm explicit; `["a","b","c"]` is a compile error. `part`/
  `slot`/`exportparts` *names* are author-defined idents matched against
  author-written CSS/markup — there is **no closed platform vocabulary** to
  constrain them to, so `string` is correct here (the §11.4 bare-string ban
  targets cases where a closed union *exists*, e.g. `ShadowRootMode`; same
  justification as `setLang`'s bare `string`).
- **Compile-only tests** — add to `test/types/*.test-d.ts`:
  `setShadowrootmode("opne")` ✗, `.toggle("shadowrootclonabl")` ✗,
  `setExportparts(["a","b","c"])` ✗, plus a positive row that
  `setShadowrootmode` exists only on `TemplateTag` and `setPart`/`setSlot` on any
  `Tag`.

## Migration & compatibility

**Additive within v6.** `Template` now returns `TemplateTag` instead of `Tag` —
additive at the type level (`TemplateTag extends Tag`, all members preserved) and
**byte-identical runtime output** when no DSD attr is set. The only theoretical
observability is code structurally typed against the *exact* `Tag` return of
`Template`; v6 is greenfield (no v5 back-compat) so this is acceptable — note it
in `CHANGELOG.md`. Every new field/method is optional and absent setters render
exactly as today. The `addAttribute("slot"/"part"/"shadowrootmode", …)` escape
hatch keeps working but becomes lint-discouraged like every other typed setter
(CONVERGE: exactly one blessed way per attribute).

## Docs impact (§11.8)

1. **`README.md` (lib root)** — new **"Declarative Shadow DOM & web-component
   theming"** section:

   ```markdown
   ### Declarative Shadow DOM & web-component theming

   `Template().setShadowrootmode("open")` emits a Declarative Shadow DOM — a
   shadow tree from server-rendered HTML with zero JS. Children are scoped by the
   shadow boundary, so a child `<style>` can use `:host`, `::slotted()`, `::part()`:

   ```typescript
   Template(
     Style(":host{display:block} ::slotted(h2){color:var(--accent)}"),
     Slot(),
   ).setShadowrootmode("open").toggle("shadowrootdelegatesfocus");
   ```

   Assign light-DOM children into named slots with `.setSlot("header")` — the
   sender side; `Slot().setName("header")` is the receiver. Expose themeable
   surfaces with `.setPart("label")` (theme via `host::part(label){…}`), forward
   nested parts with `.setExportparts("label", ["icon", "lead-icon"])`.
   ```

2. **`fluent-html.md`** — web-components reference rows: `setShadowrootmode`; the
   three `shadowroot*` boolean tokens (via `.toggle()`); `setSlot` (note: sender,
   contrast `SlotTag.setName` receiver); `setPart`/`addPart` (set=override,
   add=accumulate); `setExportparts` (note the `", "` / `": "` grammar). Add the
   **htmx/SSR caveat**: DSD is auto-attached only in the *initial* HTML stream;
   `innerHTML`/htmx-swapped fragments containing DSD templates need client-side
   `setHTMLUnsafe` to attach.

3. **JSDoc** — drafted in *Proposed API*: `setShadowrootmode` (open/closed
   distinction); the three `BooleanAttribute` members in `html-types.ts`;
   `setSlot` (sender vs `SlotTag.setName` receiver); `setPart`/`addPart`/
   `setExportparts` (only effective inside a shadow tree).

4. **`CHANGELOG.md`** — "Added" entry under 6.2.0: `TemplateTag` +
   `setShadowrootmode` + the three DSD boolean tokens + `setSlot`/`setPart`/
   `addPart`/`setExportparts`; note the `Template` return-type widening
   (`Tag`→`TemplateTag`, additive).

5. **`../fluent-html-tailwind-extractor/README.md`** and
   **`../fluent-html-eslint-plugin/README.md`** — one line each: attribute-only
   RFC, no Tailwind classes emitted, no vocab/extractor/eslint change implied.

### Lockstep (vocab + extractor + eslint)

**N/A.** Every member emits a plain HTML attribute (`shadowrootmode`,
`shadowroot*` booleans, `slot`, `part`, `exportparts`), never a Tailwind class.
No `src/class-vocab/vocab.ts` row, no extractor change, no eslint allowlist
change. §11.7 does not apply. (Type-level lockstep is internal: `ShadowRootMode`
and the three `BooleanAttribute` members live in `html-types.ts`; `serialize.ts`
`BOOLEAN_ATTR_RE` already admits these letters-only names with no edit.)

## Guardrail check

- **§11.1 zero-deps** — no new runtime dependency; plain field assignment / string concat in each setter.
- **§11.2 SSR-only / sync** — all setters are synchronous assignments or `addAttribute` writes at construction; render stays sync.
- **§11.3 escape-by-default** — `slot`/`part`/`exportparts` flow through `addAttribute` → `escapeAttr` at render (`tag.ts:188`/`:456`); `shadowrootmode` is a closed enum on the schema render path; the `shadowroot*` booleans are bare keywords (no value). No new XSS sink.
- **§11.4 type-safety** — `ShadowRootMode` and the three boolean tokens are closed unions (a typo is a compile error); `setExportparts` types the tuple structure; `string` only for author-defined ident names where no closed platform vocabulary exists (same posture as `setLang`).
- **§11.5 compat** — additive within v6; only change to existing surface is `Template`'s return-type widening (`Tag`→`TemplateTag`, structurally additive, byte-identical output); greenfield, no v5 back-compat.
- **§11.6 idioms** — `set*`=override (`setShadowrootmode`/`setPart`/`setSlot`/`setExportparts`), `add*`=accumulate (`addPart`); booleans via `.toggle()` (no new boolean methods); no inline JS; CONVERGE — exactly one blessed way per attribute, no redundant `addExportparts`/Slot-side slot helper. The deliberate `setSlot` (single-valued → `set*`) vs `addPart` (token list → `add*`) asymmetry is correct, not an inconsistency.
- **§11.7 class-string contract** — N/A; emits HTML attributes only, zero Tailwind classes.
- **§11.8 docs/guideline-sync** — lib README (new DSD/theming section) + `fluent-html.md` rows + JSDoc on every new symbol + CHANGELOG, plus a one-line attribute-only note in both tooling READMEs; covers every symbol in `api_surface`.

## Alternatives considered

- **Keep `Template` returning bare `Tag`; add DSD via `addAttribute`.** Rejected:
  perpetuates the untyped escape hatch CLAUDE.md bans and offers no compile-time
  `open|closed` guard. Promoting to `TemplateTag` (the `SlotTag`/`StyleTag`
  pattern) is the convergent move.
- **A dedicated `setShadowrootclonable()`/`setShadowrootdelegatesfocus()` etc.**
  Rejected: these are bare boolean attributes; the library's single boolean
  mechanism is `.toggle()` (the named boolean setters were *removed* in v6, per
  `html-types.ts:149`). Adding three methods would re-introduce the exact pattern
  v6 deleted — anti-CONVERGE.
- **Per-element narrowing so `shadowroot*` booleans / `part` only type-check on
  the right element.** Rejected for this RFC: `BooleanAttribute` is a *global*
  union by design (`'selected'`/`'checked'` already live there despite being
  element-specific); narrowing is a larger breaking redesign out of scope.
- **Add `addExportparts` for parity with `addPart`.** Rejected: `exportparts`
  maps are authored as one declarative list (like `setDataAttrs`/`setStyles`);
  an accumulate counterpart bloats the surface for a rare need — CONVERGE.
- **Ship the lower-frequency DSD attrs** (`shadowrootcustomelementregistry` /
  `shadowrootreferencetarget` / `shadowrootslotassignment`). Deferred: keeps the
  surface minimal and converged on the Baseline-2024 core three; can follow
  additively if demanded.
- **Store a parts array on the instance** (like `toggles`) instead of
  round-tripping the `part` attribute string in `addPart`. Rejected: parts lists
  are tiny; the string round-trip is simpler and negligible — revisit only if a
  hot path appears.

## Open questions

1. **`Template` return-type widening.** Promote to `TemplateTag` (chosen,
   enables typed DSD) vs keep bare `Tag` and accept the escape hatch? The widening
   is structurally additive and output-identical; greenfield makes it safe.
2. **DSD boolean breadth.** Ship only the Baseline-2024 three (`clonable`/
   `delegatesfocus`/`serializable`, chosen) or include the three rarer DSD attrs
   now? Minimal surface chosen; additive later.
3. **`exportparts` grammar.** The spec separators are strict — `", "` between
   maps, `": "` inside a rename. A unit test must assert the exact string
   `"card, inner-label: label"`; should we additionally validate token shape, or
   leave it as raw string concat (chosen, consistent with the rest of the surface)?
4. **htmx/DSD attachment caveat.** Document-only (chosen: README/`fluent-html.md`
   caveat that swapped fragments need `setHTMLUnsafe`), or out of scope for this
   pure-render RFC entirely?
