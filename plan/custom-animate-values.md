# Custom Animation Values in `.animate()`

## Problem

`.animate()` only accepts built-in Tailwind animations (`none | spin | ping | pulse | bounce`). Projects that define custom animations in `tailwind.config.js` must fall back to `.addClass("animate-foo")`, which triggers lint warnings and bypasses type safety.

## Example

```typescript
// tailwind.config.js
animation: { saved: "saved 2s ease-in-out forwards" }

// Current workaround — triggers fluent-html lint warning
Span("Saved").addClass("animate-saved")

// Desired API — escape hatch string like other methods
Span("Saved").animate("[saved_2s_ease-in-out_forwards]")
// or simply allow any string prefixed with bracket notation
Span("Saved").animate("[saved]")
```

## Proposed Solution

Accept arbitrary bracket values in `TailwindAnimate`, consistent with how other methods handle escape hatches (e.g., `.textSize("[13px]")`, `.opacity("[0.33]")`).

```typescript
// Before
type TailwindAnimate = "none" | "spin" | "ping" | "pulse" | "bounce";

// After
type TailwindAnimate = "none" | "spin" | "ping" | "pulse" | "bounce" | `[${string}]`;
```

## Context

Discovered in planet-positive-sport: a "Saved" indicator needs a custom fade-out animation defined in tailwind config. The `.animate()` method rejects it, forcing `.addClass()` with a lint warning.
