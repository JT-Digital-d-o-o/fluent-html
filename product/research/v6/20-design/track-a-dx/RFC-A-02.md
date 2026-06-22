---
id: RFC-A-02
track: A
title: ARIA / role / global attribute setters — typed setRole, setTabindex, setTitle, typed setAria keys + tristate, and ariaDescribe fix
resolves: [F-A-014, F-A-051, F-A-053, F-A-054, F-A-056]
api_surface:
  - "Tag.prototype.setRole(role: AriaRole)"
  - "Tag.prototype.setTabindex(index: number)"
  - "Tag.prototype.setTitle(title: string)"
  - "Tag.prototype.setAria(attrs: AriaAttrs)"
  - "type AriaRole"
  - "type AriaAttributeName"
  - "type AriaAttrs"
  - "ariaDescribeAlgebra (behavior fix — reads aria-label/role)"
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md"]
impact: high
effort: S
depends_on: []
status: proposed
---

# RFC-A-02: ARIA / role / global attribute setters

## Problem

The library's first idiom is "never use `addAttribute` for standard HTML props — use typed setters." That idiom is broken for the entire accessibility surface, the single biggest `addAttribute` category in the app survey (~300 call-sites in recon `02-app-patterns`). Five concrete failures:

1. **No `.setRole()`** (F-A-051). `role` has a finite WAI-ARIA vocabulary (~90 roles) yet every app sets it through the escape hatch — 17+ call-sites across 5 apps:
   ```ts
   // rideshare/src/shared/components/layout.view.ts:463
   Div(nav).addAttribute("role", "dialog")              // ✗ escape hatch
   // glimm/src/shared/components/huluma/control.components.ts:98
   .addAttribute("role", "switch").setAria({ checked: on ? "true":"false" })  // ✗ mixed style on one element
   // planet-positive-sport/src/loc/onboarding/onboarding.view.ts:54
   Div(...).addAttribute("role", "progressbar")         // ✗
   ```
   `.addAttribute("role", "tooptip")` compiles and renders silently — no typo detection.

2. **No `.setTabindex()` / `.setTitle()`** (F-A-014). Global attributes valid on every element, 16+ `addAttribute` call-sites across rideshare/ttl/jt-draw:
   ```ts
   // rideshare/src/shared/components/autocomplete.view.ts:124
   Div(...).addAttribute("tabindex", "-1")              // ✗ number stringified by hand
   // rideshare/src/rides/rides.components.ts:231
   A(Icon).setHref("#").addAttribute("title", "Copy link")  // ✗
   ```

3. **`setAria()` keys are untyped** (F-A-053). `tag.ts:298` types `attrs` as `Record<string, string | boolean>`. `.setAria({ lable: "Close" })` compiles, renders `aria-lable="Close"`, and silently breaks AT. Every other key API (`InputType`, `BooleanAttribute`, `HxSwap`, `TailwindColor`) is typed; the most important a11y API is not.

4. **`setAria()` boolean path is a trap** (F-A-054). `string | boolean` applies to all keys, but `boolean` is only meaningful for state attributes — `{ label: true }` renders the semantically-wrong `aria-label="true"`. Apps avoid the boolean path entirely and hand-write `on ? "true" : "false"`:
   ```ts
   // glimm/.../control.components.ts:99
   .setAria({ checked: on ? "true" : "false" })         // boilerplate; could be `checked: on`
   // planet-positive-sport/.../submit-button.component.ts:54
   .setAria({ disabled: isReady ? "false" : "true" })
   ```
   The tristate `"mixed"` (partial checkbox/tree) is unreachable through `boolean`.

5. **`ariaDescribeAlgebra` ignores `aria-label`/`role`** (F-A-056). The public auditing algebra (`fold/algebras/aria-describe.ts:22`) never reads `attrs.attributes["aria-label"]` or `["role"]`. An icon button `Button("").setAria({ label: "Close" })` is described as `"button"`; an `Img().setAria({ label: "Chart" })` as `"image (no alt)"` — the auditor lies about exactly the elements a11y audits care about.

## Proposed API

All additive on `Tag.prototype` (core, every element). No new runtime deps.

```ts
// src/core/aria-types.ts (new)

/** WAI-ARIA 1.2 role vocabulary + escape hatch. */
export type AriaRole =
  // landmark
  | "banner" | "complementary" | "contentinfo" | "form" | "main"
  | "navigation" | "region" | "search"
  // widget
  | "button" | "checkbox" | "gridcell" | "link" | "menuitem"
  | "menuitemcheckbox" | "menuitemradio" | "option" | "progressbar"
  | "radio" | "scrollbar" | "searchbox" | "separator" | "slider"
  | "spinbutton" | "switch" | "tab" | "tabpanel" | "textbox" | "treeitem"
  // composite widget
  | "combobox" | "grid" | "listbox" | "menu" | "menubar" | "radiogroup"
  | "tablist" | "tree" | "treegrid"
  // document structure
  | "application" | "article" | "cell" | "columnheader" | "definition"
  | "dialog" | "directory" | "document" | "feed" | "figure" | "group"
  | "heading" | "img" | "list" | "listitem" | "math" | "none"
  | "note" | "presentation" | "row" | "rowgroup" | "rowheader"
  | "table" | "term" | "toolbar" | "tooltip"
  // live region
  | "alert" | "alertdialog" | "log" | "marquee" | "status" | "timer"
  | (string & {});

/** WAI-ARIA 1.2 attribute names, without the `aria-` prefix, + escape hatch. */
export type AriaAttributeName =
  // state (tristate/boolean)
  | "checked" | "expanded" | "selected" | "pressed" | "disabled"
  | "hidden" | "busy" | "atomic" | "modal" | "multiline"
  | "multiselectable" | "required" | "readonly" | "grabbed"
  // relationship & text
  | "label" | "labelledby" | "describedby" | "details" | "controls"
  | "owns" | "flowto" | "activedescendant" | "errormessage"
  | "roledescription" | "keyshortcuts" | "placeholder"
  // value & range
  | "valuenow" | "valuemin" | "valuemax" | "valuetext"
  | "level" | "posinset" | "setsize"
  // grid
  | "colcount" | "colindex" | "colspan" | "rowcount" | "rowindex" | "rowspan"
  // token-valued
  | "current" | "live" | "relevant" | "haspopup" | "autocomplete"
  | "invalid" | "orientation" | "sort" | "dropeffect"
  | (string & {});

/** ARIA state attrs accept a JS boolean or the ARIA tristate; everything else is a string. */
type AriaStateName =
  | "checked" | "expanded" | "selected" | "pressed" | "disabled"
  | "hidden" | "busy" | "atomic" | "modal" | "multiline"
  | "multiselectable" | "required" | "readonly" | "grabbed";

export type AriaAttrs =
  & Partial<Record<AriaStateName, boolean | "true" | "false" | "mixed">>
  & Partial<Record<Exclude<AriaAttributeName, AriaStateName>, string | number>>;
```

```ts
// src/core/tag.ts — additions to class Tag

/** Set the `role` attribute (WAI-ARIA). */
setRole(role: AriaRole): this;

/** Set `tabindex` (number, not stringified by hand). `-1` traps focus, `0` joins tab order. */
setTabindex(index: number): this;

/** Set the `title` attribute (advisory tooltip text). */
setTitle(title: string): this;

/** Set ARIA attributes. Keys are typed; state keys accept boolean → "true"/"false". */
setAria(attrs: AriaAttrs): this;   // signature change — additive (narrowing, see below)
```

Behavior:
- `setRole(role)` → `attributes["role"] = role`.
- `setTabindex(index)` → `attributes["tabindex"] = String(index)`.
- `setTitle(title)` → `attributes["title"] = title`. (Distinct from `<title>` element — this is the global attribute; `Title()` element is unaffected.)
- `setAria` impl unchanged at runtime (`String(value)` already coerces `boolean`/`number`); only the type narrows. `"mixed"` passes through as-is.

```ts
// src/fold/algebras/aria-describe.ts — F-A-056 fix (behavior, no API change)
tag: (element, attrs, children, _original) => {
  const role       = attrs.attributes?.["role"];
  const ariaLabel  = attrs.attributes?.["aria-label"];
  const semanticEl = role ?? element;
  const base       = attrs.id ? `${semanticEl}#${attrs.id}` : semanticEl;
  const label      = ariaLabel ? `${base} '${ariaLabel}'` : base;

  if (element === "a" && attrs.href) { /* unchanged, but prefer ariaLabel for text */ }
  if (element === "img") {
    const alt = attrs.alt ?? attrs.attributes?.alt ?? ariaLabel;
    return alt ? `image '${alt}'` : "image (no alt)";
  }
  if (element === "input") { /* unchanged */ }
  const inner = children.trim();
  return inner ? `${label} containing: ${inner}` : label;
}
```

Exports from `core/index.ts`: `AriaRole`, `AriaAttributeName`, `AriaAttrs` (type-only).

## Worked examples (before → after)

**Role + mixed style (glimm/src/shared/components/huluma/control.components.ts:98-99)**
```ts
// before
Div(...)
  .addAttribute("role", "switch")                         // ✗ escape hatch
  .setAria({ checked: on ? "true" : "false", label: on ? "On" : "Off" });  // ✗ ternary boilerplate
```
```ts
// after
Div(...)
  .setRole("switch")                                       // ✓ typed, typo-checked
  .setAria({ checked: on, label: on ? "On" : "Off" });     // ✓ boolean state path
```

**Dialog landmark (rideshare/src/shared/components/layout.view.ts:463)**
```ts
// before
Div(nav)
  .addAttribute("role", "dialog")                          // ✗
  .addAttribute("aria-modal", "true")                      // ✗
  .addAttribute("aria-label", "Navigation menu")           // ✗
```
```ts
// after
Div(nav)
  .setRole("dialog")
  .setAria({ modal: true, label: "Navigation menu" });     // ✓ one typed call
```

**Focus trap + title (rideshare autocomplete.view.ts:124 / rides.components.ts:231)**
```ts
// before
Div(...).addAttribute("tabindex", "-1");                   // ✗ stringified number
A(Icon).setHref("#").addAttribute("title", "Copy link");   // ✗
```
```ts
// after
Div(...).setTabindex(-1);                                  // ✓ number
A(Icon).setHref("#").setTitle("Copy link");                // ✓
```

**Auditing now sees labels (F-A-056, fold/algebras/aria-describe.ts)**
```ts
// before: paraView(ariaDescribeAlgebra, Button("").setAria({ label: "Close" }))  → "button"   ✗
// after :                                                                         → "button 'Close'" ✓
// before: paraView(ariaDescribeAlgebra, Img().setSrc("c.png").setAria({ label: "Chart" })) → "image (no alt)" ✗
// after :                                                                                    → "image 'Chart'"   ✓
```

## Type-safety story

- **Literal unions over bare `string`** — `AriaRole` and `AriaAttributeName` are WAI-ARIA 1.2 unions; `.setRole("dialgo")` / `.setAria({ lable: "x" })` are compile errors. `(string & {})` keeps the escape hatch *and* IDE autocomplete (the same idiom as `BooleanAttribute`, `TailwindColor`, `LinkRel`).
- **Discriminated value types via key partition** — `AriaAttrs` splits state keys (`boolean | "true" | "false" | "mixed"`) from the rest (`string | number`). `{ label: true }` is now a compile error (label is not a state key); `{ checked: on }` and `{ checked: "mixed" }` both type-check; `{ valuenow: 42 }` accepts a number. Tristate `"mixed"` is now reachable in the type, not just at runtime.
- **No `any`** — every new method is fully typed; `setTabindex(index: number)` removes the manual `String(-1)`.

## Migration & compatibility

**Additive — nothing breaks.** Four new methods on `Tag.prototype`; existing `addAttribute("role"|"tabindex"|"title", …)` and `setAria` calls keep compiling and rendering identically.

One soft-narrowing caveat on `setAria`: the old type was `Record<string, string | boolean>`; the new `AriaAttrs` is narrower on values for *known* state keys (drops nothing apps actually pass — recon shows all passed values are `string`/`boolean`). Unknown keys still resolve through `(string & {})`. No app in the survey passes a value type that the new signature rejects, so this is additive in practice. `ariaDescribeAlgebra` is a pure behavior fix (more accurate output); no signature change.

**No codemod required.** Optional cleanup codemod (nice-to-have, not blocking): `addAttribute("role", X)` → `setRole(X)`, `addAttribute("tabindex", X)` → `setTabindex(Number(X))`, `addAttribute("title", X)` → `setTitle(X)`. The fluent-html ESLint plugin should grow a `prefer-typed-aria` rule mirroring its existing `no-add-attribute-for-standard-props` family.

**Class-string contract (guardrail #7):** N/A — emits attributes, not Tailwind classes. No extractor/ESLint vocabulary change.

## Guidelines impact

Adoption note: `fluent-html.md:44` already showed `setAria({ label })` but never taught `role`/`tabindex`/`title` (no setter existed) and never showed the boolean state path — so apps reached for `addAttribute` and hand-wrote `"true"`. The index (`CLAUDE.md`) had no a11y rule at all. Both are patched below.

### Index — `web-development/CLAUDE.md`

Insert after the "Specialized tag methods" block (after line 89):

```md
**ARIA / global attrs** — typed setters, never `addAttribute`:
```typescript
Div(nav).setRole("dialog").setAria({ modal: true, label: "Menu" })  // ✓ typed role + aria
Div().addAttribute("role", "dialog")                                // ✗ escape hatch, no typo check
Div().setTabindex(-1)                                               // ✓ number, not "-1"
A(icon).setTitle("Copy link")                                      // ✓ global title attr
.setAria({ checked: on })                                          // ✓ boolean → "true"/"false"
.setAria({ checked: on ? "true" : "false" })                       // ✗ ternary boilerplate
.setAria({ lable: "x" })                                           // ✗ compile error (typed keys)
```
```

### Topic ref — `web-development/fluent-html.md`

Replace the `setAria` line in the **Universal methods** block (line 44) with:

```md
  .setAria({ label: "Close" })     // typed aria-* keys; aria-label="Close"
  .setRole("dialog")               // typed WAI-ARIA role (AriaRole union)
  .setTabindex(-1)                 // number; -1 traps focus, 0 joins tab order
  .setTitle("Copy link")           // global `title` attr (≠ <title> element)
```

Add a new subsection after **Boolean attributes** (after line 53):

```md
**ARIA** — `setRole` / `setAria`, typed keys, boolean state path:

```typescript
Div(panel).setRole("switch").setAria({ checked: on, label: on ? "On" : "Off" })
//  ✓ AriaRole union (typo = compile error)   ✓ state keys take boolean → "true"/"false"

Tab.setRole("tab").setAria({ selected: idx === active, controls: panelId })
Progress.setRole("progressbar").setAria({ valuenow: pct, valuemin: 0, valuemax: 100 })

// state keys (checked/expanded/selected/pressed/disabled/hidden/modal/busy/…):
.setAria({ expanded: open })        // ✓ boolean
.setAria({ checked: "mixed" })      // ✓ tristate for partial checkbox/tree
.setAria({ disabled: isReady ? "false" : "true" })  // ✗ pass the boolean instead

// non-state keys take string | number:
.setAria({ label: "Close", valuenow: 42 })
.setAria({ label: true })           // ✗ compile error — label is not a state key
.addAttribute("role", "dialog")     // ✗ use .setRole(); typo-checked + finite vocab
```

`ariaDescribeAlgebra` (a11y auditing) now reads `aria-label` and `role`:
`Button("").setAria({ label: "Close" })` → `"button 'Close'"`.
```

## Guardrail check

- **§11.1 zero-deps:** pass — pure types + 3 one-line setters; no new dependency.
- **§11.2 ssr-only / sync fast path:** pass — setters write the existing `attributes` bag; no async, no render-path change. `ariaDescribe` fix adds two cheap lookups only in that opt-in algebra.
- **§11.3 escape-by-default:** pass — values flow through the same `escapeAttr` path; `setRole`/`setTitle`/`setTabindex` keys are fixed literals (no `addAttribute` key-injection surface).
- **§11.4 type-safety:** pass — literal unions + key-partitioned value types replace `Record<string, string|boolean>`; misuse is a compile error.
- **§11.5 backward-compat:** pass — additive; `setAria` narrowing rejects nothing apps pass (recon-verified); optional codemod offered.
- **§11.6 consistency:** pass — matches `BooleanAttribute`/`TailwindColor` `(string & {})` idiom and the "typed setter over `addAttribute`" voice.
- **§11.7 class-string contract:** N/A — no Tailwind classes emitted; no extractor/ESLint vocab change.
- **§11.8 guideline-sync:** pass — Guidelines impact patches `CLAUDE.md` (index rule) + `fluent-html.md` (deep section) and covers every `api_surface` symbol (`setRole`, `setTabindex`, `setTitle`, `setAria`, the three types, the `ariaDescribe` fix).

## Alternatives considered

- **Per-key narrowed `setAria` only (no separate `setRole`)** — would still leave `role` (not an `aria-*` attr) and `tabindex`/`title` (not aria at all) on the escape hatch. Rejected: F-A-014/F-A-051 need bare global setters.
- **`setAriaState(key, value)` separate method (F-A-054 option 2)** — extra surface for what the key-partitioned `AriaAttrs` type already expresses inside the existing `setAria`. Rejected: one method, typed values, no second name to teach.
- **Batch `setAttrs({ tabindex, title, role })` global object** (F-A-014 option 3) — weaker types (mixed value domains), and apps set these one at a time. Kept individual setters; consistent with `setId`/`setStyle`.
- **Full ARIA-per-role validity (e.g. `aria-checked` only on checkbox/switch roles)** — correct but huge type surface for marginal gain; deferred. `(string & {})` + flat key union is the 80/20.

## Open questions

- Should `setTabindex` constrain to `-1 | 0 | (number & {})` to nudge toward the two correct values, or stay open `number`? Leaning open `number` (positive tabindex is valid, if discouraged).
- Ship the optional `addAttribute → setRole/setTabindex/setTitle` codemod + ESLint `prefer-typed-aria` rule in the same release, or fast-follow? (Track-C/tooling decision.)
