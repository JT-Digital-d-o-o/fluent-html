# Typography

## Font Stack

### Primary — Inter
- **Usage:** Body text, navigation, UI elements
- **Weights:** 400 (Regular), 500 (Medium), 600 (Semibold)
- **Source:** [Google Fonts](https://fonts.google.com/specimen/Inter)
- **Tailwind class:** `font-sans`

### Display — Playfair Display
- **Usage:** Headlines, hero text, the "JT" in the logo
- **Weights:** 500 (Medium), 700 (Bold)
- **Source:** [Google Fonts](https://fonts.google.com/specimen/Playfair+Display)
- **Tailwind class:** `font-serif`

## Usage Guidelines

| Context | Font | Weight | Size |
|---------|------|--------|------|
| Hero headline | Playfair Display | Medium (500) | 3xl — 7xl (responsive) |
| Section headings | Playfair Display | Medium (500) | 3xl — 5xl (responsive) |
| Logo "JT" | Playfair Display | Bold (700) | xl |
| Logo "Digital" | Inter | Medium (500) | sm |
| Navigation | Inter | Regular (400) | sm |
| Body text | Inter | Regular (400) | base — lg |
| Labels / overlines | Inter | Medium (500) | xs — sm, uppercase, tracking-widest |

## Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@500;700&display=swap" rel="stylesheet">
```
