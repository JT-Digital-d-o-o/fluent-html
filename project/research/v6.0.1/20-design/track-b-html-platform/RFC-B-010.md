---
id: RFC-B-010
track: B
title: Native interactivity — typed Popover API, invoker Commands, and CSS anchor positioning
resolves: [F-B-100, F-B-101, F-B-182]
api_surface:
  - "PopoverState (type)"
  - "Tag.prototype.setPopover(state?: PopoverState)"
  - "Tag.prototype.setPopovertarget(target: Id)"
  - "Tag.prototype.setPopovertargetaction(action?: PopoverAction)"
  - "CommandFor (type)"
  - "ButtonTag.prototype.setCommand(command: CommandFor)"
  - "ButtonTag.prototype.setCommandfor(target: Id)"
  - "Tag.prototype.anchorName(name: Id)"
  - "Tag.prototype.positionAnchor(name: Id)"
  - "Tag.prototype.positionArea(area: TailwindPositionArea)"
breaking: additive
ships_to: "6.1.0"
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, additive-only, instruction-set, class-vocab-sync, guideline-sync]
guideline_updates:
  - web-development/htmx.md
  - web-development/fluent-html.md
  - web-development/CLAUDE.md
impact: high
effort: M
depends_on: []
status: proposed
---

# RFC-B-010: Native interactivity — typed Popover API, invoker Commands, and CSS anchor positioning

## Problem

v6.0.0 ships dialog/overlay interactivity entirely through hand-written JS in the behavior layer. The `openDialog`/`closeDialog` behaviors emit literal `.showModal()` / `.close()` snippets:

```ts
// src/core/behavior-methods.ts:133-140 (shipped)
openDialog:  (opts) => ["click", `${el(opts.target)}.showModal()`],
closeDialog: (opts) => ["click", `${el(opts.target)}.close()`],
```

Three native HTML/CSS platform features that obsolete this hand-written JS have **no typed fluent surface** today:

1. **The Popover API** (`popover` / `popovertarget` / `popovertargetaction`). The only way to reach it is the untyped escape hatch — `BooleanAttribute` (`src/elements/html-types.ts:58`) is a closed union that does **not** include `popover`, and there is no `setPopovertarget`, so authors must write `.addAttribute("popover", "auto")` / `.addAttribute("popovertarget", id.id)`. That loses the Id type-check (`src/core/tag.ts:158`) and the value union. (F-B-100)

2. **Invoker Commands** (`command` / `commandfor` on `<button>`). `ButtonTag` (`src/elements/forms.ts:215`) has no `command`/`commandfor` in its schema keys, so a JS-free `<button command="show-modal" commandfor="dlg">` is unreachable except via `addAttribute`. The library instead ships the `showModal()`/`close()` JS above — more output, a CSP-nonce liability, and no static target check. (F-B-101)

3. **CSS Anchor Positioning** (`anchor-name` / `position-anchor` / `position-area`). The class vocabulary (`src/class-vocab/vocab.ts:153,171`) has dedicated position shortcuts (`absolute`, `top`, …) but no anchor-positioning emitters, and `tailwind-types.ts:219` has no `position-area` token set. Without it, a popover/tooltip can be opened but not *placed* relative to its invoker — undercutting the whole native-interactivity story. (F-B-182)

These ship as **one** native-interactivity story: the Popover primitive (open/close with zero JS), the Command invoker (the JS-free replacement for `openDialog`/`closeDialog`), and the anchor-positioning classes that place the result.

## Proposed API / fix

All three are **primitives** — typed attribute setters and class emitters that map 1:1 to native platform features. No components, no opinions, no runtime.

```ts
// ── 1. Popover API ──────────────────────────────────────────────
// src/elements/html-types.ts — new closed unions (no `(string & {})` hatch)

/** `popover` attribute value. `"auto"` = light-dismiss + one-open-per-group; `"manual"` = explicit. */
export type PopoverState = "auto" | "manual";

/** `popovertargetaction` — what the invoker does to its popover target. */
export type PopoverAction = "show" | "hide" | "toggle";

// src/core/tag.ts — global setters on Tag (any element can be a popover or an invoker)
declare module "./tag.js" {
  interface Tag {
    /** Mark this element a popover. Bare call defaults to `"auto"` (light-dismiss). */
    setPopover(state?: PopoverState): this;
    /** Wire this invoker to a popover by Id (renders `popovertarget="<id>"`). */
    setPopovertarget(target: Id): this;
    /** Set the invoker action (`show` | `hide` | `toggle`); omit ⇒ browser default `toggle`. */
    setPopovertargetaction(action?: PopoverAction): this;
  }
}

// ── 2. Invoker Commands (button-only) ──────────────────────────
// src/elements/html-types.ts

/**
 * Built-in `command` values for `<button command commandfor>`. Closed for the
 * native set; `(string & {})` keeps the `--custom` author-command hatch with
 * autocomplete (custom commands fire a `CommandEvent`, not a built-in action).
 */
export type CommandFor =
  | "show-modal" | "close" | "request-close"          // <dialog>
  | "show-popover" | "hide-popover" | "toggle-popover" // popover
  | `--${string}`;                                      // author-defined

// src/elements/forms.ts — on ButtonTag only (the spec restricts command/commandfor to <button>)
class ButtonTag extends Tag {
  command?: CommandFor;
  commandfor?: string;
  setCommand(command: CommandFor): this;   // schema-key serialized
  setCommandfor(target: Id): this;         // stores target.id
}

// ── 3. CSS Anchor Positioning (class emitters) ─────────────────
// src/core/tailwind-types.ts

/**
 * `position-area` grid token (anchor positioning). Closed common set + the
 * `[…]` arbitrary hatch for the full two-axis grammar (`[top span-left]`).
 */
export type TailwindPositionArea =
  | "top" | "bottom" | "left" | "right" | "center"
  | "top-left" | "top-right" | "bottom-left" | "bottom-right"
  | "top-span-left" | "top-span-right"
  | "bottom-span-left" | "bottom-span-right"
  | `[${string}]`;

declare module "./tag.js" {
  interface Tag {
    /** Register this element as an anchor: `[anchor-name:--<id>]`. */
    anchorName(name: Id): this;
    /** Position this element against a named anchor: `[position-anchor:--<id>]`. */
    positionAnchor(name: Id): this;
    /** Place against the active anchor: `position-area:<area>`. */
    positionArea(area: TailwindPositionArea): this;
  }
}
```

`anchorName`/`positionAnchor` derive the CSS dashed-ident from the **same `Id`** the popover/command setters use, so an anchor name can never drift from the element it names. Emitted classes (registered as `custom` vocab rows so the extractor + eslint maps stay in lockstep — see Guardrail check):

```ts
// src/class-vocab/vocab.ts — new custom rows (lib emitter mirrors these)
custom("anchorName",     (a) => [`[anchor-name:--${a[0]}]`],     [["panel"]]),
custom("positionAnchor", (a) => [`[position-anchor:--${a[0]}]`], [["panel"]]),
custom("positionArea",   (a) => [`position-area-${a[0]}`],       [["bottom"], ["[top span-left]"]]),
```

The Id's raw `.id` is used for the dashed-ident; it is already constrained to ID-safe characters by `defineIds`. The `[…]` arbitrary `positionArea` value is emitted verbatim into a Tailwind arbitrary class (consistent with `.textSize("[13px]")`).

## Worked examples (before → after)

A modal opened from a button, placed under it.

```ts
// before (v6.0.0) — hand-written JS for open/close, untyped popover, no placement
Button("Open").behavior("openDialog", { target: ids.dialog })
//   → <button hx-on:click="document.getElementById('dialog').showModal()">
Dialog(/* … */).setId(ids.dialog)
//   placement: not expressible — needs manual CSS / inline style
```

```ts
// after (this RFC) — zero JS, typed target, native placement
Button("Open").setCommand("show-modal").setCommandfor(ids.dialog)
//   → <button command="show-modal" commandfor="dialog">   (no hx-on, no nonce needed)
Dialog(/* … */).setId(ids.dialog)
```

A light-dismiss popover menu, anchored to its trigger:

```ts
// after (this RFC)
const menu = ids.userMenu;

Button("Account")
  .setPopovertarget(menu)              // popovertarget="user-menu"
  .anchorName(menu)                    // [anchor-name:--user-menu]

Div(/* menu items */)
  .setId(menu)
  .setPopover()                        // popover="auto" → free light-dismiss + top-layer
  .positionAnchor(menu)               // [position-anchor:--user-menu]
  .positionArea("bottom")             // position-area-bottom
//   → <div id="user-menu" popover="auto"
//          class="[position-anchor:--user-menu] position-area-bottom">
```

The `openDialog`/`closeDialog` behaviors **remain** (additive, no removal) for the htmx-event cases they already cover; the guideline simply steers new code to Commands.

## Type-safety story

- **`PopoverState` / `PopoverAction` are closed unions** — `.setPopover("autoo")` is a compile error; `.setPopovertargetaction("close")` (not a valid action — that's a command) won't type-check.
- **`CommandFor`** is closed over the native set, with a `\`--${string}\`` arm that *only* admits the spec-mandated author-command shape (a leading `--`) — `.setCommand("custom")` errors, `.setCommand("--my-cmd")` is fine. No bare `string`.
- **Id-typed targets everywhere.** `setPopovertarget(target: Id)`, `setCommandfor(target: Id)`, `anchorName(name: Id)`, `positionAnchor(name: Id)` all take an `Id` (`src/ids.ts`), so a target/anchor must reference an Id from `defineIds`. A free string won't compile, exactly like `setId`/`setHtmx`. Reusing one Id for `setId` + `setPopovertarget` + `anchorName` makes "the thing it opens" and "the thing it anchors to" provably the same element.
- **`TailwindPositionArea`** is the literal-union token set (the eight common placements) plus the `[${string}]` arbitrary hatch for the full grammar — no bare `string`.

## Compatibility & version

- **6.0.1 (patch):** N/A — this adds public surface, so it cannot ride a patch.
- **6.1.0 (minor):** **Additive.** Every symbol is new: three `Tag` methods + two `PopoverState`/`PopoverAction` unions (popover), two `ButtonTag` methods + `CommandFor` (commands), three `Tag` methods + `TailwindPositionArea` and three vocab rows (anchor). Nothing existing changes shape. `openDialog`/`closeDialog`/`BooleanAttribute` are untouched — existing output is byte-identical. New `ButtonTag` schema keys (`command`, `commandfor`) only serialize when set.
- **parked-major:** none. Retiring `openDialog`/`closeDialog` in favor of Commands would be a removal — explicitly **out of scope**; they stay. (Their eventual deprecation is a separate parked-major decision, not smuggled here.)

## Guidelines impact

New public surface ⇒ guideline + lib-doc edits required. House style: LLM-reader, ✓/✗, snippet-first.

- **Index (`web-development/CLAUDE.md`):** add to the `.behavior()` block the steer toward native Commands/Popover.

```md
**Native open/close — prefer Commands/Popover over dialog behaviors** (zero JS, no nonce):
```typescript
Button("Open").setCommand("show-modal").setCommandfor(ids.dialog)   // ✓ <button command commandfor>
Button("Menu").setPopovertarget(ids.menu)                            // ✓ popover invoker
Div(...).setId(ids.menu).setPopover()                                // ✓ popover="auto" (light-dismiss + top-layer)
Button("Open").behavior("openDialog", { target: ids.dialog })        // ✗ legacy JS path — kept, but not for new code
Div(...).addAttribute("popover", "auto")                             // ✗ untyped — use .setPopover()
```
```

- **Topic ref (`web-development/htmx.md`):** new section after the behavior table.

```md
## Native interactivity (Popover · Commands · anchor positioning)

Prefer the platform over hand-written JS. All targets are `Id`-typed.

**Invoker Commands** — JS-free `<button>` that drives a `<dialog>` or popover:
```typescript
Button("Edit").setCommand("show-modal").setCommandfor(ids.dialog)    // ✓ no hx-on, no nonce
Button("Done").setCommand("close").setCommandfor(ids.dialog)
```
| command | acts on |
| --- | --- |
| `show-modal` / `close` / `request-close` | `<dialog>` |
| `show-popover` / `hide-popover` / `toggle-popover` | popover |
| `--name` | author command (fires `CommandEvent`) |

**Popover** — `.setPopover()` (defaults `auto`: light-dismiss, Esc, top-layer):
```typescript
Button("Filters").setPopovertarget(ids.panel)                       // ✓ invoker
Div(...).setId(ids.panel).setPopover()                              // ✓ popover="auto"
Div(...).setPopover("manual")                                       // ✓ explicit dismiss only
```

**Anchor positioning** — name an anchor, place a popover against it (reuse one Id):
```typescript
const menu = ids.userMenu;
Button("Account").setPopovertarget(menu).anchorName(menu)          // ✓ [anchor-name:--user-menu]
Div(...).setId(menu).setPopover().positionAnchor(menu).positionArea("bottom")
//   ✓ [position-anchor:--user-menu] position-area-bottom
```

`.behavior("openDialog"/"closeDialog")` still works; reach for it only when an htmx event (not a click) must trigger the open/close.
```

- **Topic ref (`web-development/fluent-html.md`):** one line under arbitrary/position helpers — `.anchorName(id)` / `.positionAnchor(id)` / `.positionArea(area)` emit the anchor-positioning classes; `Id`-typed.

- **Lib-own docs:**
  - **README.md** — in the behaviors block (~line 844), add the Commands/Popover snippet above and a note that `openDialog`/`closeDialog` are the legacy JS path.
  - **CHANGELOG.md** — under `[6.1.0] ### ✨ New Features`:

```md
#### Native interactivity (RFC-B-010)
- **Popover API** — `.setPopover(state?)` / `.setPopovertarget(id)` / `.setPopovertargetaction(action?)` (typed `PopoverState`/`PopoverAction`, `Id`-typed target).
- **Invoker Commands** — `ButtonTag.setCommand(cmd)` / `.setCommandfor(id)` (`CommandFor` union) — a JS-free, nonce-free replacement for the `openDialog`/`closeDialog` behaviors (which remain).
- **CSS anchor positioning** — `.anchorName(id)` / `.positionAnchor(id)` emit `[anchor-name:--…]` / `[position-anchor:--…]`; `.positionArea(area)` (`TailwindPositionArea`). Registered in the class-vocab → extractor + eslint stay in lockstep.
```
  - **JSDoc** — each new setter/emitter gets an `@example` (forms.ts ButtonTag, tag.ts Tag, tailwind-methods.ts) per the file conventions already in place.

## Guardrail check

- **zero-deps:** pass — pure setters + string emitters, no runtime.
- **ssr-only:** pass — all three render to static attributes/classes; the browser does the interactivity natively (no client runtime, *less* emitted JS than today).
- **escape-by-default:** pass — `command`/`popovertarget`/`commandfor` values come from closed unions or `Id` (ID-safe); no JS string is generated (unlike `openDialog`), removing a nonce surface. Attribute values still flow through the standard escape path.
- **type-safety:** pass — closed unions for state/action/command, `Id`-typed targets/anchors, literal `TailwindPositionArea`; no bare `string`.
- **additive-only:** pass — 6.1.0 additive; nothing removed or reshaped; `openDialog`/`closeDialog`/`BooleanAttribute` untouched.
- **instruction-set:** pass — these are primitives mapping 1:1 to native platform attributes/CSS, not components. No Modal/Tooltip ships; placing/opening is left to user-land. Bar met: each replaces an `addAttribute` escape hatch with a typed setter for a standard HTML/CSS feature.
- **class-vocab-sync:** pass — the three anchor emitters land as `custom` `classVocab` rows with samples; the extractor imports `classVocab` directly and the eslint `vocab.generated.ts` regenerates from it (drift test pins both). The popover/command setters emit **attributes**, not classes, so they don't touch the class vocab.
- **guideline-sync:** pass — the Guidelines impact section covers every `api_surface` symbol (popover setters, command setters, anchor emitters, and all three type unions).

## Alternatives considered

- **Extend `BooleanAttribute` with `popover`.** Rejected: `popover` is an *enumerated* attribute (`auto`/`manual`), not boolean — `.toggle("popover")` would emit a valueless `popover` (= `auto`) and give no way to express `manual`. A dedicated `setPopover(state?)` is correct and keeps the boolean union honest.
- **A `Popover()` / `Tooltip()` component.** Rejected per the instruction-set guardrail — opinionated overlays are user-land (`@jtdigital/ui`). Core ships the primitives only.
- **Reuse the behavior layer for commands** (`.behavior("command", …)`). Rejected: commands are native *attributes* (`command`/`commandfor`), not `hx-on:*` JS; modeling them as a behavior would re-introduce the JS snippet this RFC removes.
- **Tailwind anchor-positioning plugin tokens** (e.g. `anchor-name-*` utilities). Rejected: there is no stable first-party utility for these in v4; emitting the arbitrary-property class `[anchor-name:--x]` is the v4-native escape and needs no plugin.

## Open questions

- **`positionArea` token set breadth.** Ship the common 9-ish placements + `[…]` hatch (proposed), or the full two-axis grammar as literals? Proposal: common set now; widen later if used (additive).
- **`request-close` inclusion.** Include the newer `request-close` command (fires `cancel`, allowing `preventDefault`)? Proposal: include — it's spec'd and the safer default-close for forms; costs one union member.
