# Track B / b09 — Global & Platform Attributes

Lens scope: global/platform attributes settable on **any** element (`draggable`, the global `slot=` assignment attribute, `part`/`exportparts`, `is`, `inert`, `autofocus`, `accesskey`, `virtualkeyboardpolicy`, `writingsuggestions`, plus the data-*/style-custom-prop/tabindex helpers already present).

## What is ALREADY covered (do not re-propose)

| Surface | Where | Status |
| --- | --- | --- |
| `nonce` | `Tag.setNonce()` (tag.ts:204) + render-time `renderWithNonce` | shipped |
| `tabindex` (number) | `Tag.setTabindex(index: number)` (tag.ts:400) | shipped |
| `title` (attr) | `Tag.setTitle()` (tag.ts:410) | shipped |
| `role` / `aria-*` | `Tag.setRole` / `Tag.setAria` (tag.ts:389/429) | shipped |
| `data-*` | `Tag.setDataAttrs()` (tag.ts:372) | shipped |
| inline style / custom props | `Tag.setStyle/addStyle/setStyles` (tag.ts:152-354) — `addStyle("--brand: #09f")` already sets a CSS custom property | shipped (6.1.1) |
| `lang`/`dir`/`translate` | `Tag.setLang/setDir/setTranslate` (tag.ts:476-489) | shipped (6.1.1) |
| `contenteditable`/`enterkeyhint`/`spellcheck`/`autocapitalize` | tag.ts:491-509 | shipped (6.1.1) |
| `hidden="until-found"` | `Tag.setHidden()` (tag.ts:515) | shipped (6.1.1) |
| `itemscope`/`itemtype`/… | `Tag.setMicrodata()` (tag.ts:528) | shipped (6.1.1) |
| `popover`/`popovertarget*` | tag.ts:449-474 | shipped (6.1.x) |
| `inert` (boolean) | `.toggle("inert")` — `'inert'` is in `BooleanAttribute` (html-types.ts:154) | shipped |
| `autofocus` (boolean) | `.toggle("autofocus")` — html-types.ts:152 | shipped |
| `<slot name>` element | `SlotTag.setName()` (webcomponents.ts:9) — this is the `<slot>` element's own name, **not** the global `slot=` assignment attribute | shipped (different attr) |

So `inert` and `autofocus` are handled by `.toggle()` and need no setter. The genuine gaps below are the enumerated/value-bearing global attributes that have no typed entry point and today require raw `.addAttribute(...)`.

---

## Proposal 1 — `setDraggable(value?: boolean)` (and `"true"`/`"false"`/`"auto"` enum)

**Problem / evidence.** `draggable` is an **enumerated** global attribute, not a boolean — `<div draggable>` is invalid; the spec requires the literal string `"true"` or `"false"` (default `"auto"`). It is therefore *deliberately absent* from `BooleanAttribute` (html-types.ts:151-156), and `.toggle("draggable")` is a compile error by design. `grep -rn draggable src/` returns nothing — there is no typed path. Today the only way is `.addAttribute("draggable", "true")`, which the house style forbids for standard props (CLAUDE.md "never use addAttribute for standard props"). Baseline: **widely available** (all engines, years).

**Proposed API.**
```ts
type DraggableValue = 'true' | 'false' | 'auto';
setDraggable(value: boolean | DraggableValue = true): this
// boolean → "true"/"false" string; default bare call → "true"
// emits: draggable="true"
```

**Before / After.**
```ts
// before
Li(item.label).addAttribute("draggable", "true")
// after
Li(item.label).setDraggable()
Img().setDraggable(false)            // draggable="false" — opt a draggable-by-default image out
```

**Already in lib?** No.
**Value:** medium (common in DnD / kanban / sortable list UIs, the exact SSR-app territory this stack targets).
**Effort:** small.

---

## Proposal 2 — `setSlot(name: string)` — the global `slot=` assignment attribute

**Problem / evidence.** Two different things share the word "slot":
- `SlotTag.setName()` (webcomponents.ts:9) — the `<slot name="x">` placeholder *inside* a shadow tree.
- The global `slot=""` attribute set on a **light-DOM child** of a custom element, assigning it into a named slot — settable on *any* element.

The second has no typed path (`grep` shows only `SlotTag`). When SSR-composing a custom element (the `is`/web-components path this stack already ships `Slot` for), assigning children to named slots requires raw `.addAttribute("slot", "header")`. Baseline: **widely available**.

**Proposed API.**
```ts
setSlot(name: string): this            // emits slot="<name>"
```

**Before / After.**
```ts
// before
Header(...).addAttribute("slot", "header")
// after
Div(BrandLogo()).setSlot("header")     // assigns this child into <slot name="header">
```

**Already in lib?** No (the existing `SlotTag.setName` is a different attribute on a different element).
**Value:** medium (completes the web-components surface that `Slot()` already opened; low-frequency but currently has no typed door).
**Effort:** small.

---

## Proposal 3 — `setPart(...names: string[])` + `setExportparts(map)` — Shadow Parts

**Problem / evidence.** `part` exposes a shadow-internal element to outer-page `::part()` styling; `exportparts` re-exports a nested component's parts up through a host. Both are **global** attributes, both are accumulating token lists. `grep -rn "part\b" src/` finds nothing. The library already commits to a web-components story (`Slot()`, `is` gap below) and SSR design-system components are explicitly user-land per memory ("design system is user-land") — `part` is exactly how those user-land components expose a themeable surface without leaking internals. Baseline: **widely available** (`part`/`::part()` shipped in all engines; `exportparts` likewise). Raw today: `.addAttribute("part", "label icon")`.

**Proposed API.**
```ts
setPart(...names: string[]): this
// emits part="name1 name2"  (set* = override per the convention; multiple tokens = one part attr, not accumulation across calls)

setExportparts(parts: string | Record<string, string>): this
// string passthrough, or { innerPart: "exposedName" } → exportparts="innerPart: exposedName"
```

**Before / After.**
```ts
// before
Span(icon).addAttribute("part", "icon")
// after
Span(icon).setPart("icon")
CustomCard().setExportparts({ header: "card-header", body: "card-body" })
```

**Already in lib?** No.
**Value:** medium (enables themeable user-land web components; aligns with the "ship primitives" memory).
**Effort:** small.

---

## Proposal 4 — `setIs(tag: string)` — customized built-in elements

**Problem / evidence.** `is` upgrades a standard element to a *customized built-in* custom element (`<button is="fancy-button">`). It is a **global** attribute and the only way to use customized built-ins. `grep -rn "setIs\b" src/` finds nothing; raw today is `.addAttribute("is", "fancy-button")`. Note: Baseline is **NOT** fully green — Safari/WebKit has long declined to implement customized built-ins (autonomous custom elements are fine; `is=` is not). This caps the value.

**Proposed API.**
```ts
setIs(tagName: string): this           // emits is="<tag-name>"
```

**Before / After.**
```ts
Button("Save").setIs("loading-button")  // <button is="loading-button">
```

**Already in lib?** No.
**Value:** low (not Baseline — WebKit gap; niche).
**Effort:** small.

---

## Proposal 5 — `setAccesskey(key: string)`

**Problem / evidence.** `accesskey` is a global keyboard-shortcut hint; `grep` finds nothing, raw today is `.addAttribute("accesskey", "s")`. Baseline widely available but **discouraged** by WCAG/accessibility guidance (collides with AT and browser shortcuts, locale-dependent). A typed setter would legitimize an attribute the project guidelines would likely steer away from.

**Proposed API.** `setAccesskey(key: string): this`
**Already in lib?** No.
**Value:** low (a11y-discouraged; rarely the right tool).
**Effort:** small.

---

## Considered and rejected (not findings)

- **`virtualkeyboardpolicy`** — enumerated (`auto`/`manual`). **Not Baseline** (Chromium-only; Firefox/Safari unsupported, experimental, secure-context-gated). Skip until it lands cross-engine.
- **`writingsuggestions`** — enumerated (`true`/`false`). **Not Baseline** (not in all major browsers). Skip.
- **`inert` / `autofocus`** — already covered by `.toggle()` (they are true boolean attributes; in `BooleanAttribute`). No setter needed.
- **`tabindex` typing** — `setTabindex(index: number)` already exists; a literal `0 | -1` narrowing was considered but positive values are legal and occasionally needed, so the open `number` is correct. Not a finding.
- **`style` custom-property helper** — `addStyle("--brand: #09f")` already sets CSS custom props; a dedicated `setCssVar(name, value)` is marginal sugar over it. Borderline; not proposing.

## Top picks

- **Proposal 1 — `setDraggable`** (enumerated, NOT a boolean → `.toggle` deliberately rejects it; real gap; DnD is common in this stack). Best ROI.
- **Proposal 3 — `setPart` / `setExportparts`** (enables themeable user-land web components, aligns with the "ship primitives, design-system is user-land" stance).
- **Proposal 2 — `setSlot`** (completes the `Slot()`/web-components surface; small).
