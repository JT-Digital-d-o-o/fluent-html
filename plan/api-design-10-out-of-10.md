# API Design: 9/10 → 10/10

> Current assessment: "Fluent, discoverable, good DX. One of the best fluent APIs I've seen."
>
> What separates 9 from 10: **every wrong thing is impossible to express**, and there is **exactly one obvious way to do each thing**.

---

## ~~1. Remove the `Autocomplete<T>` Escape Hatch~~ ✅ DONE

**Impact: High | Effort: Medium**

Removed the `Autocomplete<T> = T | (string & {})` type from `tailwind-types.ts`. All ~51 method signatures in `tailwind-methods.ts` now use raw union types. Arbitrary Tailwind values (e.g., `p-[37px]`) use `addClass()` as the escape hatch.

---

## ~~2. One Way To Do Each Thing~~ ✅ DONE

**Impact: High | Effort: Low**

### ~~2a. Remove `setToggles()` — only `toggle()` should exist~~ ✅

Removed `setToggles()` from `Tag`. The only way to set boolean attributes is now `.toggle()`.

### ~~2b. Remove deprecated `SwitchCase` export~~ ✅

Removed `SwitchCase` function from `conditionals.ts` and all export files. `Match()` is the only value-matching API.

### ~~2c. Remove deprecated `ForEach1`/`ForEach2`/`ForEach3` aliases~~ ✅ (already done)

Previously removed in commit `b7e3938`.

---

## ~~3. Void Elements Should Reject Children at the Type Level~~ ✅ DONE

**Impact: High | Effort: Low**

Updated all void element factories to accept zero arguments:
- `Input()`, `Img()`, `Hr()`, `Source()`, `Track()`, `Col()`, `Embed()`, `Area()`
- `Br()`, `Wbr()`, `Meta()`, `Link()`, `Base()` were already correct

`Input(Span("oops"))` is now a compile error.

---

## ~~4. Consistent Type Strategy for Unions~~ ✅ DONE

**Impact: Medium | Effort: Low**

Extracted 5 new named types in `tailwind-types.ts`, replacing inline unions:
- `TailwindPosition` — `"static" | "fixed" | "absolute" | "relative" | "sticky"`
- `TailwindTextAlign` — `"left" | "center" | "right" | "justify"`
- `TailwindFlexDirection` — `"row" | "col" | "row-reverse" | "col-reverse"`
- `TailwindJustifyContent` — `"start" | "end" | "center" | "between" | "around" | "evenly"`
- `TailwindAlignItems` — `"start" | "end" | "center" | "baseline" | "stretch"`

All method signatures now use named types consistently. Types are re-exported from `core/index.ts` for consumer use.

---

## 5. Add `unless()` — the Missing Conditional Modifier

### REJECTED!

---

## 7. Typed SVG Attribute Setters ✅

**Impact: Low-Medium | Effort: Medium**

Implemented typed tag classes for all SVG elements with `_sk` serialization:

- **`SvgShapeTag`** — shared base with `fill`, `stroke`, `stroke-width`, `stroke-linecap`, `stroke-linejoin`, `stroke-dasharray`, `transform` + `setSvgOpacity()` (avoids conflict with Tailwind's `.opacity()`)
- **`CircleTag`** — `cx`, `cy`, `r`
- **`RectTag`** — `x`, `y`, `width`, `height`, `rx`, `ry`
- **`LineTag`** — `x1`, `y1`, `x2`, `y2`
- **`PathTag`** — `d`, `fill-rule`, `clip-rule`
- **`EllipseTag`** — `cx`, `cy`, `rx`, `ry`
- **`PolygonTag`** / **`PolylineTag`** — `points`
- **`SvgTextTag`** — `x`, `y`, `dx`, `dy`, `text-anchor`, `dominant-baseline`, `font-size`, `font-family`
- **`TspanTag`** — `x`, `y`, `dx`, `dy`
- **`UseTag`** — `href`, `x`, `y`, `width`, `height`
- `G` and `Defs` remain plain `Tag` (no element-specific attributes)

---

## 8. ARIA Fluent Shorthands

**Impact: Low-Medium | Effort: Low**

`.setAria()` works but doesn't chain as naturally as the rest of the API:

```typescript
// Current — object bag, one call
Button("×").setAria({ label: "Close", expanded: "false", controls: "menu-panel" })

// 10/10 — fluent, chainable, type-safe
Button("×").ariaLabel("Close").ariaExpanded(false).ariaControls("menu-panel")
```

Add the most common ARIA methods directly on `Tag`:

```typescript
ariaLabel(value: string): this { return this.addAttribute("aria-label", value); }
ariaExpanded(value: boolean): this { return this.addAttribute("aria-expanded", String(value)); }
ariaControls(value: string | Id): this { return this.addAttribute("aria-controls", isId(value) ? value.id : value); }
ariaHidden(value: boolean = true): this { return this.addAttribute("aria-hidden", String(value)); }
ariaDescribedBy(value: string | Id): this { return this.addAttribute("aria-describedby", isId(value) ? value.id : value); }
ariaLabelledBy(value: string | Id): this { return this.addAttribute("aria-labelledby", isId(value) ? value.id : value); }
ariaLive(value: "polite" | "assertive" | "off"): this { return this.addAttribute("aria-live", value); }
ariaRole(value: string): this { return this.addAttribute("role", value); }
```

**Key insight:** `ariaControls`, `ariaDescribedBy`, and `ariaLabelledBy` should accept `Id` objects — tying ARIA references to the same `defineIds` system that powers HTMX targets. This closes a type-safety gap where ARIA id references are currently unchecked strings.

---

## 9. `noUnderline()` → Verify Tailwind Class Name ✅

**Impact: Low | Effort: Trivial**

**File:** `src/core/tailwind-methods.ts:244`

`noUnderline()` emits `no-underline`. Verified correct for Tailwind v3, which is the current target version (`tailwindcss: ^3.4.19`).

---

## Priority Order

| # | Change | Breaking? | Effort | DX Impact | Status |
|---|--------|-----------|--------|-----------|--------|
| 1 | Remove `Autocomplete<T>` escape hatch | Yes | Medium | Massive — real type safety | ✅ Done |
| 2 | Remove `setToggles()`, deprecated exports | Yes (minor) | Trivial | Cleaner API surface | ✅ Done |
| 3 | Void elements reject children | Yes (minor) | Low | Catches real bugs | ✅ Done |
| 4 | Extract named types, use consistently | No | Low | Better consumer DX | ✅ Done |
| 5 | ~~Add `unless()`~~ | — | — | — | Rejected |
| 6 | ~~Add `classIf()`~~ | — | — | — | — |
| 7 | SVG typed setters | No | Medium | Consistency | ✅ Done |
| 8 | ARIA fluent shorthands with `Id` support | No | Low | Accessibility DX | Pending |
| 9 | Verify `noUnderline()` class name | No | Trivial | Correctness | ✅ Done |

Items 1-4 shipped together as breaking changes. Items 7-9 can land incrementally.

---

## What 10/10 Means

After these changes, the API would have:
- **Zero escape hatches in the type system** — wrong values don't compile ✅
- **Exactly one way to do each thing** — no deprecated alternatives still exported ✅
- **Silent bugs made loud** — void elements reject children ✅, ARIA refs checked via `Id` (pending)
- **Consistent patterns** — every union is named and exported, every method follows the same conventions ✅
- **Complete fluent coverage** — SVG, ARIA, and conditional classes all chain naturally (pending)

The difference between 9 and 10 isn't adding features — it's removing the places where the API lets you do the wrong thing without telling you.
