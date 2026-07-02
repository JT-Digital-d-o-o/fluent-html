# Track B — HTML Elements · Lens: Templating & Web Components

Lens scope: `<template>` (declarative shadow DOM attributes), `<slot>`, the `slot`/`part`/`exportparts` global attributes, and `is=` for customized built-ins — what fluent-html does NOT yet type and should.

## Current surface (verified)

- `Template(...children)` — `src/elements/document.ts:236` — a **bare `El("template")`**: no setters at all. Cannot set `shadowrootmode` without `addAttribute("shadowrootmode", "open")`.
- `SlotTag` — `src/elements/webcomponents.ts:6` — only `setName`. No `setSlot` (assigning a child *into* a named slot).
- No global `slot` / `part` / `exportparts` setter on `Tag` (`grep` of `src/core/tag.ts`, `proto.ts` — none).
- No `is=` setter and no custom-element factory (`grep` confirms only `El(tag)` generic).
- Already shipped in 6.1.x and out of scope here: popover, native dialog (`setClosedby`/`command`), `setContenteditable`/`setEnterkeyhint`/etc, `setMicrodata`. None touch DSD.

Baseline: Declarative Shadow DOM is **Baseline Newly available (2024-08-05)** — `shadowrootmode`, `shadowrootclonable`, `shadowrootdelegatesfocus`, `shadowrootserializable` all standardized. ([web.dev](https://web.dev/articles/declarative-shadow-dom), [webstatus.dev](https://webstatus.dev/features/declarative-shadow-dom))

---

## Proposal 1 — `TemplateTag` with declarative-shadow-DOM setters

**Problem/evidence.** `Template` is `src/elements/document.ts:236`, a setter-less `El("template")`. Declarative shadow DOM — the only way to ship web-component shadow trees from an SSR HTML builder with zero JS — requires `shadowrootmode` (plus three companions) on the `<template>`. Today an author must drop to `.addAttribute("shadowrootmode", "open")`, an untyped string the CLAUDE.md rules explicitly discourage. A bare `Template` cannot even produce a working DSD without that escape hatch, so the element is effectively unusable for its one modern purpose.

**Proposed API.** Promote `Template` to a `TemplateTag` class:

```typescript
export type ShadowRootMode = "open" | "closed";

export class TemplateTag extends Tag {
  setShadowrootmode(mode?: ShadowRootMode): this;     // shadowrootmode="open"
  toggle("shadowrootclonable" | "shadowrootdelegatesfocus" | "shadowrootserializable", cond?)
}
export function Template(...children: View[]): TemplateTag;
```

`shadowrootmode` is enumerated (`set*` + closed `ShadowRootMode` union); the three boolean companions go through the existing `.toggle(name, cond?)` boolean-attribute path (no new method surface, consistent with how every other boolean attr is modeled). A convenience `setShadowroot(mode)` could be the single common entry.

**Before/After.**
```typescript
// Before — untyped escape hatch, no autocomplete, typo-prone
Template(Style(css), Slot()).addAttribute("shadowrootmode", "open")
                            .addAttribute("shadowrootdelegatesfocus", "");

// After
Template(Style(css), Slot())
  .setShadowrootmode("open")
  .toggle("shadowrootdelegatesfocus");
// → <template shadowrootmode="open" shadowrootdelegatesfocus>…</template>
```

**Already in lib?** No. `Template` exists but has zero setters; no `ShadowRootMode` type anywhere.
**Value:** high — DSD is the headline web-components-SSR feature and is wholly unreachable today without `addAttribute`. **Effort:** small.

---

## Proposal 2 — `setSlot(name)` global setter (slot assignment)

**Problem/evidence.** `SlotTag.setName` (`src/elements/webcomponents.ts:9`) names the *receiver* slot. The complementary global attribute — `slot="header"` on a *child* that assigns it into a named slot of an ancestor shadow host — has no setter on `Tag` (`grep` of `tag.ts`/`proto.ts`: none). Any light-DOM markup distributed into a named slot needs `.addAttribute("slot", "header")`. This is a global attribute on *any* element, so it belongs on `Tag`, not a tag subclass.

**Proposed API.**
```typescript
// on Tag
setSlot(name?: string): this;   // slot="header"  (undefined clears, matching other set* setters)
```

**Before/After.**
```typescript
// Before
H1("Title").addAttribute("slot", "header");
// After
H1("Title").setSlot("header");   // → <h1 slot="header">Title</h1>
```

**Already in lib?** No. `setName` on `SlotTag` is the inverse direction; no global `setSlot`.
**Value:** medium — needed for every named-slot composition, but a one-attribute convenience. **Effort:** small.

---

## Proposal 3 — `setPart(...names)` / `setExportparts(...)` for `::part()` styling

**Problem/evidence.** Shadow DOM is style-isolated; the *only* standards way for a page to style inside a component's shadow tree is the `part` attribute + the `::part()` selector (and `exportparts` to forward parts up through nested shadow roots). Both are global attributes with no setter on `Tag` (grep: none). A library whose entire job is SSR HTML for a component-based app, and which is adding DSD (Proposal 1), leaves the shadow tree un-styleable from outside without `addAttribute("part", …)`. `part` is space-separated (accumulating → `add*`/variadic), `exportparts` is comma-separated `inner:outer` mappings.

**Proposed API.**
```typescript
// on Tag
setPart(...names: string[]): this;          // part="label icon"
addPart(name: string): this;                // accumulate one
setExportparts(...maps: string[]): this;    // exportparts="inner, x:outer"
```
`setPart`/`addPart` follow the `setClass`/`addClass` precedent (`tag.ts:111/188`) exactly. Both attributes reject markup-breaking values like `setAria`/`addAttribute` already do.

**Before/After.**
```typescript
// Before
Span("Submit").addAttribute("part", "label icon");
// After
Span("Submit").setPart("label", "icon");   // → <span part="label icon">Submit</span>
// page CSS: my-button::part(label) { … }
```

**Already in lib?** No.
**Value:** medium — completes the DSD story (without it, DSD trees can't be themed from the host page). **Effort:** small.

---

## Proposal 4 — `setIs(name)` for customized built-in elements

**Problem/evidence.** The `is=` global attribute upgrades a standard element to a customized built-in (`<button is="fancy-button">`), preserving built-in semantics/accessibility while attaching custom-element behavior. No setter exists (grep: none). It is a global attribute valid on any built-in element, so it belongs on `Tag`. Note Safari has declined to implement customized built-ins, so this is **not** Baseline — value is conditional on the consumer's target.

**Proposed API.**
```typescript
// on Tag
setIs(name?: string): this;   // is="fancy-button"
```

**Before/After.**
```typescript
Button("Go").setIs("fancy-button");   // → <button is="fancy-button">Go</button>
```

**Already in lib?** No.
**Value:** low — narrow feature, no Safari, niche even where supported. **Effort:** small. (Listed for completeness; not a top pick.)

---

## Note (not a proposal): scoped `<style>` inside DSD already works

Putting `Style(css)` as a child of a DSD `Template` already serializes correctly — `StyleTag` (`document.ts:190`) emits raw CSS, and the shadow boundary scopes it. No new API needed; Proposal 1 is the only blocker. Worth a doc example rather than code.

## Top picks

- **Proposal 1 — `TemplateTag` + `setShadowrootmode` / DSD boolean toggles** (high / small): unlocks declarative shadow DOM, the one modern reason `<template>` exists; currently impossible without `addAttribute`.
- **Proposal 3 — `setPart` / `addPart` / `setExportparts`** (medium / small): the only way to theme a DSD tree from the host page; pairs with Proposal 1.
- **Proposal 2 — `setSlot(name)`** (medium / small): completes named-slot light-DOM distribution; cheap global setter.
