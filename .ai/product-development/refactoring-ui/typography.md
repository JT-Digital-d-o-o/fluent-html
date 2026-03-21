# Typography

Good typography is the backbone of a well-designed interface. Define a type system once, and every font decision becomes fast and consistent. The goal is readability, hierarchy, and rhythm.

---

## Establish a Type Scale

Most interfaces use too many font sizes — every pixel value from 10px to 24px shows up somewhere. This creates inconsistency and slows you down.

### DON'T: Use a modular scale for interface design

Mathematical ratios (4:5, golden ratio) produce fractional pixel values that browsers handle inconsistently, and the jumps between sizes are often too limiting for UI work.

### DO: Use a hand-crafted scale

Pick values by hand. No subpixel rounding issues, full control over what sizes exist:

```
12 — 14 — 16 — 18 — 20 — 24 — 30 — 36 — 48 — 60 — 72
```

Constrained enough to speed up decisions, not so limited to feel restrictive.

### DON'T: Use `em` units for the type scale

Nested elements compute differently: `1.25em` inside `1.25em` is not `1.25em` from the root. Use **px** or **rem** to guarantee you're sticking to the system.

---

## Choose Good Fonts

### DO: Play it safe for UI

A neutral sans-serif is the safest bet. When in doubt, use the system font stack:

```css
-apple-system, Segoe UI, Roboto, Noto Sans, Ubuntu, Cantarell, Helvetica Neue
```

### DO: Filter by weight availability

Typefaces with 5+ weights (10+ styles including italics) tend to be crafted with more care. On Google Fonts, filtering to 10+ styles cuts 85% of options, leaving ~50 quality sans-serifs.

### DO: Optimize for legibility

- **Body text fonts**: wider letter-spacing, taller x-height
- **Headline fonts**: tighter letter-spacing, shorter x-height
- Avoid condensed typefaces with short x-heights for main UI text

### DO: Leverage popularity and steal good choices

Sort font directories by popularity. Inspect sites you admire to discover their typefaces.

---

## Line Length

### DO: Keep paragraphs between 45-75 characters per line

Use `20-35em` width for paragraph containers. This is optimal for reading comfort.

### DO: Limit paragraph width even in wider content areas

If the overall area is wider (for images or other components), still constrain the text. Different widths in the same content area almost always look more polished.

---

## Baseline Alignment

### DO: Align mixed font sizes by their baseline

When combining different font sizes on one line (e.g., large title + small actions), align by the baseline — the imaginary line letters rest on — not vertical center.

### DON'T: Vertically center mixed font sizes

Centered text with different sizes produces awkward offset baselines. Baseline alignment looks simpler and cleaner.

---

## Line-Height

Line-height is not one-size-fits-all. Two factors determine the right value:

### Proportional to line length

- **Narrow content** → shorter line-height (~1.5)
- **Wide content** → taller line-height (up to 2)

Longer lines mean your eyes travel further to find the next line — more spacing helps.

### Inversely proportional to font size

- **Small text** → taller line-height (easier to find next line)
- **Large headline text** → line-height of 1 is fine (your eyes don't need help)

---

## Link Styling

### DON'T: Give every link a bright color and underline

In interfaces where almost everything is a link, this treatment is overbearing and creates visual noise.

### DO: Use subtle emphasis for most links

Heavier font weight or darker color. For ancillary links, add underline/color only on hover. They'll still be discoverable without competing for attention.

---

## Text Alignment

| Situation | Alignment | Reason |
|---|---|---|
| Body text (English/LTR) | Left | Default, best readability |
| Headlines, short blocks | Center | Works well for 1-2 lines max |
| Numbers in tables | Right | Aligns decimals for easy comparison |
| Justified text | Justified + hyphenation | Avoids ugly word gaps |

### DON'T: Center text longer than 2-3 lines

If centered text is too long, rewrite it shorter rather than left-aligning it — you'll also improve consistency.

---

## Letter-Spacing

Generally trust the typeface designer and leave it alone. Two exceptions:

### DO: Tighten headlines using wide-spacing body fonts

Body fonts used as headlines look too airy. Decrease letter-spacing to mimic the condensed look of purpose-built headline fonts.

### DO: Increase letter-spacing for all-caps text

Default letter-spacing is optimized for sentence case. All-caps letters lack the visual variety of mixed case (no ascenders/descenders), making them harder to distinguish. Wider spacing compensates.
