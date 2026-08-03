# Spacing and Layout

White space is the foundation of clean design. Start with too much, remove until it's right, and let a system make every spacing decision fast and consistent.

---

## Start with Too Much White Space

The default approach — adding minimum whitespace until things don't look bad — gives elements only the minimum breathing room. The result is "not actively bad" rather than "great".

### DO: Start with way too much space, then remove

What seems like "a little too much" for an individual element ends up being "just enough" in the context of a complete UI.

### DON'T: Default to dense layouts

Dense UIs have their place (dashboards needing everything on one screen), but make density a deliberate decision, not the default. It's easier to notice when you need to remove white space than when you need to add it.

---

## The Spacing and Sizing System

Don't nitpick between 120px and 125px. Define a constrained scale in advance.

### Why a linear scale fails

"Make everything a multiple of 4px" doesn't help distinguish close values. The difference between 12px and 16px (33%) is visually significant; between 500px and 520px (4%) it's imperceptible. Adjacent values need to differ by at least ~25%.

### The scale

Start with a base of **16px** (divides nicely, default browser font size). Values should be packed tightly at the small end and progressively more spaced at the large end:

```
4 — 8 — 12 — 16 — 24 — 32 — 48 — 64 — 96 — 128 — 192 — 256 — 384 — 512 — 640 — 768
```

### How to use it

Grab a value, try it. Not enough? The next value up is probably perfect. You'll work faster, and a subtle consistency will emerge across the design.

---

## Don't Fill the Whole Screen

Just because you have 1200-1400px doesn't mean you should use it.

### DO: Give elements only the space they need

If you only need 600px, use 600px. Extra space around the edges never hurt anyone. Spreading things unnecessarily wide makes interfaces harder to interpret.

### DO: Start with mobile (~400px canvas)

Design the mobile layout first. Bring it to larger screens and adjust what felt compromised. You'll change less than you think.

### DO: Think in columns when content is narrow

If a narrow element (like a form) feels unbalanced in a wide layout, split into columns — form on one side, supporting text on the other. This feels balanced without making the form harder to use.

---

## Grids Are Overrated

A 12-column grid helps with layout decisions, but treating it as religion does more harm than good.

### DON'T: Make everything fluid/percentage-based

Sidebars should have a **fixed width** optimized for their contents. The main content area flexes to fill remaining space. A percentage-based sidebar gets too wide on large screens and too narrow on small ones.

### DON'T: Shrink elements before you need to

Use **max-width** to cap element size. Only force shrinking when the screen is actually smaller than that max-width. Don't use a 50% column width that ends up narrower on large screens than it would be on medium screens.

### DO: Use percentages only when you want scaling

Don't use percentages to size something unless you actually want it to scale with the viewport.

---

## Relative Sizing Doesn't Scale

Don't assume proportional relationships hold across screen sizes.

### DO: Size elements independently per context

- Desktop headline at 2.5x body copy → on mobile that's 35px (too big)
- Better mobile headline: 1.5-1.7x body copy → totally different ratio
- **Large elements shrink faster** than small elements on smaller screens

### DO: Fine-tune component properties independently

Button padding shouldn't scale proportionally with font size:
- Large buttons → more generous padding
- Small buttons → disproportionately tighter padding

The large button should feel like a *larger button*, not a zoomed-in button.

---

## Avoid Ambiguous Spacing

When there's no visible separator (border, background), spacing must make grouping clear.

### The rule

**More space around the group than within it.** Always.

### DO: Make relationships obvious through spacing

- Forms: more space between field groups than between a label and its input
- Articles: more space above a heading than below it (heading belongs to following content)
- Lists: more space between bullets than within multi-line bullets

### DON'T: Use equal spacing everywhere

When margin below a label equals margin below an input, labels feel disconnected from their inputs. Users may enter data in the wrong field.
