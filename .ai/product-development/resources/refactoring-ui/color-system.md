# Color System

Color is not decoration — it's a system. Define your palette up front with enough shades to handle every situation, use HSL to stay in control, and never rely on color as the sole way to communicate information.

---

## Use HSL, Not Hex

Hex and RGB make visually similar colors look nothing alike in code. HSL represents color by attributes the human eye perceives:

- **Hue**: position on color wheel (0°=red, 120°=green, 240°=blue)
- **Saturation**: 0%=grey, 100%=vibrant
- **Lightness**: 0%=black, 100%=white, 50%=pure color

HSB (used in design tools) is not HSL. Browsers understand HSL — use it for web development.

---

## You Need More Colors Than You Think

Five hex codes from a palette generator won't build a real UI. You need three categories:

### Greys (8-10 shades)

Used for text, backgrounds, panels, form controls. Start with a really dark grey (true black looks unnatural) and work up to white in steady increments.

### Primary colors (5-10 shades per color)

One or two colors for primary actions, active navigation, overall brand feel. Ultra-light shades for tinted backgrounds (alerts, highlights), darker shades for text.

### Accent colors (5-10 shades each)

- **Yellow/pink/teal**: highlight new features
- **Red**: destructive actions, errors
- **Yellow/orange**: warnings
- **Green**: positive trends, success

For complex UIs: up to **10 different colors × 5-10 shades each**.

---

## Define Shades Up Front

### DON'T: Use CSS lighten/darken functions

You'll end up with 35 slightly different blues that all look the same. Define a fixed set of shades up front.

### How to build a palette

1. **Pick the base color** (shade 500): should work well as a button background. No formula — rely on your eyes.
2. **Find the edges**: darkest shade (900, for text) and lightest shade (100, for tinted backgrounds). Test with an alert component that uses both.
3. **Fill the gaps**: 9 shades total (100-900). Pick 700 and 300 first (midpoints), then 800, 600, 400, 200.

For greys: darkest grey for darkest text, lightest for subtle off-white background. Same filling process.

### DO: Trust your eyes, not the numbers

Tweak saturation and lightness when things don't look right. But don't add new shades too often — maintain the system.

---

## Saturation and Lightness

As lightness approaches 0% or 100%, saturation's impact weakens — colors look washed out.

### DO: Increase saturation as lightness moves away from 50%

This keeps lighter and darker shades vibrant instead of faded.

### Use perceived brightness to your advantage

Different hues have inherently different brightness levels:
- **Darker hues**: red (0°), green (120°), blue (240°)
- **Brighter hues**: yellow (60°), cyan (180°), magenta (300°)

To make a color lighter: rotate hue toward nearest bright hue (60°, 180°, 300°).
To make a color darker: rotate hue toward nearest dark hue (0°, 120°, 240°).

**Example**: for a yellow palette, rotate toward orange for darker shades → warm and rich instead of dull and brown.

### DON'T: Rotate hue more than 20-30°

Beyond that it looks like a completely different color, not just lighter or darker.

---

## Warm and Cool Greys

Greys don't have to be neutral. Saturate them to set a temperature:

- **Cool greys**: add blue saturation
- **Warm greys**: add yellow or orange saturation

Increase saturation on lighter and darker shades to maintain consistent temperature across the full grey scale.

---

## Accessibility

WCAG contrast ratios: **4.5:1** for normal text (<18px), **3:1** for large text.

### DON'T: Only use light text on dark colored backgrounds

Dark colored backgrounds grab too much attention when the element isn't supposed to be prominent.

### DO: Flip the contrast

Dark colored text on a light colored background — the color supports the text without dominating the page.

### DO: Rotate hue for colored text on colored backgrounds

When you need secondary text inside a dark panel, rotating toward a brighter hue (cyan, magenta, yellow) increases contrast without approaching pure white.

---

## Never Rely on Color Alone

Color-blind users can't distinguish red from green. Always use color to **support** information, never as the sole means of communication.

### DO: Add redundant signals

- Metrics: icons (arrows, checkmarks) alongside color for positive/negative
- Graphs: use contrast (light vs dark shades) instead of different colors for different lines
- Status indicators: combine color with text labels or icons
