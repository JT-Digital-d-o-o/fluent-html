# API Design: 9/10 → 10/10

> Current assessment: "Fluent, discoverable, good DX. One of the best fluent APIs I've seen."
>
> What separates 9 from 10: **every wrong thing is impossible to express**, and there is **exactly one obvious way to do each thing**.

---

## 1. Remove the `Autocomplete<T>` Escape Hatch

**Impact: High | Effort: Medium**

**File:** `src/core/tailwind-types.ts:157`

```typescript
// Current — accepts any string, autocomplete is just a suggestion
export type Autocomplete<T extends string> = T | (string & {});

// This means display("banana") typechecks. That's a 9/10 API.
```

**Problem:** The `string & {}` trick gives IDE suggestions but no actual type enforcement. Every Tailwind method silently accepts garbage values. The library does the hard work of defining `TailwindSpacing`, `TailwindColor`, etc. — then throws it away at the boundary.

**Fix — two-tier approach:**

```typescript
// Strict by default — only known values compile
type TailwindSpacing = "0" | "px" | "0.5" | "1" | /* ... */ "96";

// Escape hatch via explicit opt-in method
Div().padding("4")           // ✓ compiles
Div().padding("banana")      // ✗ compile error
Div().addClass("p-[37px]")   // ✓ arbitrary values via addClass (already exists)
```

Remove `Autocomplete<T>` wrapper from all method signatures. Replace with the raw union types. Consumers who need arbitrary Tailwind values (e.g., `p-[37px]`) already have `addClass()` as the escape hatch — no new API surface needed.

**Migration:** This is a breaking change for anyone passing custom strings through fluent methods. Document `addClass()` as the official arbitrary-value path.

---

## 2. One Way To Do Each Thing

**Impact: High | Effort: Low**

### 2a. Remove `setToggles()` — only `toggle()` should exist

**File:** `src/core/tag.ts:141-144`

```typescript
// Remove entirely — CLAUDE.md already says "never use setToggles"
setToggles(toggles?: string[]): this {
  this.toggles = toggles;
  return this;
}
```

The API currently has two ways to set boolean attributes. `toggle()` is the correct one. `setToggles()` is acknowledged as wrong in CLAUDE.md but still ships. A 10/10 API doesn't export things it tells you not to use.

### 2b. Remove deprecated `SwitchCase` export

**File:** `src/control/conditionals.ts:36-47`

Marked `@deprecated` in favor of `Match`. Either remove the export or move to a `deprecated.ts` re-export for one more major version.

### 2c. Remove deprecated `ForEach1`/`ForEach2`/`ForEach3` aliases

Noted in the codebase analysis (§3.3). Dead aliases create confusion about which function to use.

---

## 3. Void Elements Should Reject Children at the Type Level

**Impact: High | Effort: Low**

Currently `Input(Span("oops"))` compiles without error — the child is silently discarded because `<input>` is a void element. This is a silent bug.

```typescript
// Current — accepts children it will never render
export function Input(...children: View[]): InputTag

// 10/10 — compile error on misuse
export function Input(): InputTag
```

Apply to all void element factories: `Input`, `Br`, `Hr`, `Img`, `Meta`, `Link`, `Source`, `Track`, `Wbr`, `Col`, `Embed`, `Area`, `Base`.

This is a small signature change with outsized impact — it catches a real class of bugs at compile time instead of silently producing wrong output.

---

## 4. Consistent Type Strategy for Unions

**Impact: Medium | Effort: Low**

Some methods use exported Tailwind types via `Autocomplete<T>`, others hardcode inline unions:

```typescript
// Uses Autocomplete<TailwindDisplay>
display(value: Autocomplete<TailwindDisplay>): this

// Hardcodes inline union
position(value: "static" | "fixed" | "absolute" | "relative" | "sticky"): this
textAlign(align: "left" | "center" | "right" | "justify"): this
justifyContent(justify: "start" | "end" | "center" | "between" | "around" | "evenly"): this
alignItems(align: "start" | "end" | "center" | "baseline" | "stretch"): this
flexDirection(direction: "row" | "col" | "row-reverse" | "col-reverse"): this
```

**Fix:** Extract named types for every inline union and use them consistently:

```typescript
// In tailwind-types.ts
export type TailwindPosition = "static" | "fixed" | "absolute" | "relative" | "sticky";
export type TailwindTextAlign = "left" | "center" | "right" | "justify";
export type TailwindJustifyContent = "start" | "end" | "center" | "between" | "around" | "evenly";
export type TailwindAlignItems = "start" | "end" | "center" | "baseline" | "stretch";
export type TailwindFlexDirection = "row" | "col" | "row-reverse" | "col-reverse";

// In tag.ts — consistent pattern
position(value: TailwindPosition): this
textAlign(align: TailwindTextAlign): this
justifyContent(justify: TailwindJustifyContent): this
```

**Benefit:** Consumers can import and reuse these types in their own abstractions. Consistent pattern across the entire API surface.

---

## 5. Add `unless()` — the Missing Conditional Modifier

**Impact: Medium | Effort: Trivial**

**File:** `src/core/tag.ts` (add next to `when()` at line 176)

```typescript
/**
 * Inverse of .when() — apply modifier when condition is false.
 *
 * @example
 * Button("Save").unless(isDisabled, t => t.background("blue-500").cursor("pointer"))
 */
unless(condition: boolean, fn: (tag: this) => this): this {
  return condition ? this : fn(this);
}
```

`.when()` covers the truthy case. Without `.unless()`, the falsy case requires negation at the call site (`when(!x, ...)`), which reads less naturally and inverts the semantic meaning of the variable name.

--

## 7. Typed SVG Attribute Setters

**Impact: Low-Medium | Effort: Medium**

SVG elements currently fall back to the generic `.addAttribute()` escape hatch:

```typescript
// Current — no autocomplete, no type safety
Circle().addAttribute("cx", "50").addAttribute("cy", "50").addAttribute("r", "40")

// 10/10 — matches the rest of the API's philosophy
Circle().setCx("50").setCy("50").setR("40")
```

Create specialized tag classes for the most common SVG elements:

| Element | Typed setters needed |
|---------|---------------------|
| `Circle` | `cx`, `cy`, `r` |
| `Rect` | `x`, `y`, `width`, `height`, `rx`, `ry` |
| `Line` | `x1`, `y1`, `x2`, `y2` |
| `Path` | `d` |
| `Svg` | `viewBox`, `xmlns`, `fill`, `stroke` |

Use the existing `_sk` serialization key pattern — this is exactly the extension point it was designed for.

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

## 9. `noUnderline()` → Verify Tailwind v4 Class Name

**Impact: Low | Effort: Trivial**

**File:** `src/core/tag.ts:458-460`

`noUnderline()` emits `no-underline`. In Tailwind v4, the class is `decoration-transparent` or `no-underline` depending on the migration path. Verify against the target Tailwind version and document.

---

## Priority Order

| # | Change | Breaking? | Effort | DX Impact |
|---|--------|-----------|--------|-----------|
| 1 | Remove `Autocomplete<T>` escape hatch | Yes | Medium | Massive — real type safety |
| 2 | Remove `setToggles()`, deprecated exports | Yes (minor) | Trivial | Cleaner API surface |
| 3 | Void elements reject children | Yes (minor) | Low | Catches real bugs |
| 4 | Extract named types, use consistently | No | Low | Better consumer DX |
| 5 | Add `unless()` | No | Trivial | Natural readability |
| 6 | Add `classIf()` | No | Trivial | Common-case ergonomics |
| 7 | SVG typed setters | No | Medium | Consistency |
| 8 | ARIA fluent shorthands with `Id` support | No | Low | Accessibility DX |
| 9 | Verify `noUnderline()` class name | No | Trivial | Correctness |

Items 1-3 are breaking changes best shipped together in a major version. Items 4-9 can land incrementally.

---

## What 10/10 Means

After these changes, the API would have:
- **Zero escape hatches in the type system** — wrong values don't compile
- **Exactly one way to do each thing** — no deprecated alternatives still exported
- **Silent bugs made loud** — void elements reject children, ARIA refs checked via `Id`
- **Consistent patterns** — every union is named and exported, every method follows the same conventions
- **Complete fluent coverage** — SVG, ARIA, and conditional classes all chain naturally

The difference between 9 and 10 isn't adding features — it's removing the places where the API lets you do the wrong thing without telling you.
