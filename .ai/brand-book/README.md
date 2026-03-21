# JT Digital Brand Book

Brand guidelines and design assets for **JT Digital d.o.o.**

> Your vision. Expertly built.

## Quick Reference

### Colors

| Role | Hex | Preview |
|------|-----|---------|
| Accent | `#F59E0B` | ![#F59E0B](https://placehold.co/16x16/F59E0B/F59E0B) |
| Accent Light | `#FBBF24` | ![#FBBF24](https://placehold.co/16x16/FBBF24/FBBF24) |
| Accent Dark | `#D97706` | ![#D97706](https://placehold.co/16x16/D97706/D97706) |
| Background | `#0f172a` | ![#0f172a](https://placehold.co/16x16/0f172a/0f172a) |
| Surface | `#1e293b` | ![#1e293b](https://placehold.co/16x16/1e293b/1e293b) |
| Text Primary | `#f8fafc` | ![#f8fafc](https://placehold.co/16x16/f8fafc/f8fafc) |
| Text Secondary | `#cbd5e1` | ![#cbd5e1](https://placehold.co/16x16/cbd5e1/cbd5e1) |
| Text Muted | `#94a3b8` | ![#94a3b8](https://placehold.co/16x16/94a3b8/94a3b8) |

### Typography

| Font | Usage |
|------|-------|
| **Playfair Display** | Headlines, "JT" in logo |
| **Inter** | Body text, UI, "Digital" in logo |

### Logo

The logo is a two-part wordmark: **JT** (Playfair Display Bold, accent) + **Digital** (Inter Medium, slate-300).

See [Logo Usage Guidelines](guidelines/logo-usage.md) for details.

## Structure

```
brand-book/
  logos/
    svg/              # Vector logos (preferred)
      logo-light.svg      Full logo for dark backgrounds
      logo-dark.svg       Full logo for light backgrounds
      logomark.svg        JT mark, dark background
      logomark-light.svg  JT mark, light background
    png/              # Raster logos (currently empty)
  favicons/
    favicon.svg       # Browser favicon
  colors/
    palette.css       # CSS custom properties
    tailwind.js       # Tailwind config export
  typography/
    README.md         # Font specs and loading
  guidelines/
    logo-usage.md     # Logo usage rules
    visual-identity.md # Full visual identity guide
    voice-and-copy.md  # Brand voice, slogans, and writing style
```

## Usage

### CSS Custom Properties
```html
<link rel="stylesheet" href="colors/palette.css">
```
```css
.button { background: var(--color-accent); }
```

### Tailwind
```js
// tailwind.config.js
import { accent } from './colors/tailwind.js';
export default {
  theme: {
    extend: {
      colors: { accent },
    },
  },
};
```

## Links

- Website: [jtdigital.si](https://jtdigital.si)
- Blog: [blog.jtdigital.si](https://blog.jtdigital.si)
