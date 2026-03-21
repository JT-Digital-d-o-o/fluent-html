# JT Digital Brand Book

Official brand assets and guidelines for **JT Digital d.o.o.** — a software agency in Slovenia building modern web applications for clients across Europe.

> References:
> - [guidelines/visual-identity.md](guidelines/visual-identity.md) — Colors, UI patterns, components, spacing, animation, accessibility
> - [guidelines/logo-usage.md](guidelines/logo-usage.md) — Logo variants, construction, clear space, minimum sizes
> - [guidelines/voice-and-copy.md](guidelines/voice-and-copy.md) — Brand voice, slogans, CTAs, writing patterns, word choice
> - [colors/palette.css](colors/palette.css) — CSS custom properties
> - [colors/tailwind.js](colors/tailwind.js) — Tailwind config exports
> - [typography/README.md](typography/README.md) — Font specs and loading

---

## Brand Identity

**Tagline:** Your vision. Expertly built.

**Core values:** Technical excellence, transparency, simplicity, productivity.

**Dark-first.** The primary brand expression is dark slate (`#0f172a`) with amber accent (`#F59E0B`). Light themes exist for logos only.

---

## Colors

### DO: Use brand tokens — never hardcode hex values
```css
/* CSS */
background: var(--color-accent);
color: var(--color-text-primary);
```
```js
/* Tailwind */
import { accent } from './colors/tailwind.js';
// extend: { colors: { accent } }
// Then use: bg-accent, text-accent, border-accent/50
```

### DO: Use accent sparingly — CTAs, highlights, and the "JT" logo mark
```
bg-accent        → primary buttons, key CTAs
text-accent      → hover states, section labels, tags
border-accent/50 → hover borders on cards
bg-accent/10     → tag backgrounds, icon containers
```

### DON'T: Use accent on large surfaces
```
// WRONG — accent background on a full section
<section class="bg-accent">...</section>

// CORRECT — accent draws the eye to specific elements
<button class="bg-accent text-slate-950">Start a Conversation</button>
```

### DON'T: Use colors outside the palette
```
// WRONG — arbitrary colors
text-blue-500, bg-green-400, border-red-300

// CORRECT — stick to the palette
text-accent, bg-slate-900/50, border-slate-800
```

The only exception is project-specific icon gradients (e.g. `from-blue-500 to-indigo-600` for a project card icon).

---

## Typography

### DO: Use the correct font for each context
```
Playfair Display  → headlines, section titles, "JT" in logo
Inter             → everything else: body, UI, nav, labels, "Digital" in logo
```

### DO: Use the defined type scale
```
Hero headline:     font-serif text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-medium
Section heading:   font-serif text-3xl sm:text-4xl md:text-5xl font-medium
Section label:     text-accent font-medium uppercase text-xs sm:text-sm tracking-widest
Body text:         text-base sm:text-lg (Inter, weight 400)
Card title:        text-xl font-semibold (service) or text-lg font-semibold (blog)
Card body:         text-slate-400 text-sm leading-relaxed
```

### DON'T: Mix fonts or invent new sizes
```
// WRONG
<h2 class="font-mono text-2xl">Section Title</h2>

// CORRECT
<h2 class="font-serif text-3xl sm:text-4xl md:text-5xl font-medium">Section Title</h2>
```

---

## Logo

Four SVG variants exist in `logos/svg/`:

| Variant | File | Use case |
|---------|------|----------|
| Full logo (dark bg) | `logo-light.svg` | Default — on dark backgrounds |
| Full logo (light bg) | `logo-dark.svg` | On light/white backgrounds |
| Logomark (dark bg) | `logomark.svg` | Favicon, app icon, small spaces |
| Logomark (light bg) | `logomark-light.svg` | App icon on light backgrounds |

### DON'T: Modify the logo
```
No color changes. No effects. No distortion. No rearranging.
"JT" always precedes "Digital".
Minimum clear space: 1x the height of the "JT" text on all sides.
Minimum width: 120px (full logo), 24px (logomark).
```

---

## Components

### DO: Follow the established component patterns

**Primary button:**
```
px-6 sm:px-8 py-3 font-medium text-sm bg-accent text-slate-950 rounded-lg
hover:bg-accent-light transition-colors
```

**Ghost button:**
```
px-6 sm:px-8 py-3 font-medium text-sm text-slate-300 rounded-lg
border border-slate-700
hover:border-accent hover:text-accent transition-colors
```

**Card:**
```
p-8 rounded-2xl bg-slate-900/50 border border-slate-800
hover:border-accent/50 transition-colors group
```

**Tag (accent):**
```
text-xs font-medium rounded-full px-3 py-1 bg-accent/10 text-accent
```

**Tag (glass):**
```
text-xs text-slate-300 rounded-full px-3 py-1.5 glass
```

### DON'T: Invent new component styles
```
// WRONG — different radius, different padding, custom colors
<button class="px-4 py-2 rounded-xl bg-amber-500 text-white">Click</button>

// CORRECT — use the defined button pattern
<button class="px-6 py-3 font-medium text-sm bg-accent text-slate-950 rounded-lg
  hover:bg-accent-light transition-colors">Click</button>
```

---

## Animation & Motion

### DO: Keep transitions fast and subtle
```
transition-colors    → links, nav items, card borders (150ms default)
transition-all       → cards with multiple hover effects (150ms default)
hover:scale-105      → large CTA only — never on cards or nav
duration-500         → carousel slides only
```

### DON'T: Add animations that aren't in the system
```
// WRONG — slow, bouncy, attention-seeking
class="transition-all duration-700 ease-bounce hover:scale-110 hover:rotate-1"

// WRONG — entry animations, scroll triggers, parallax
class="animate-fadeIn" / IntersectionObserver animations

// CORRECT — fast color/border shifts
class="hover:border-accent/50 transition-colors"
```

---

## Writing & Copy

> Full reference: [guidelines/voice-and-copy.md](guidelines/voice-and-copy.md) — voice attributes, CTAs, blog structure, word choice, ban lists

Key rules:
- **Write like an experienced engineer talking to a peer** — direct, confident, technical, honest
- **Word choice:** build (not develop), ship (not deliver), simple (not streamlined), conversation (not consultation)
- **Ban list:** leverage, utilize, synergy, paradigm, world-class, cutting-edge, revolutionary, seamlessly, full-stack
- **CTAs:** "Start a Conversation" (primary), "Let's Build Something Together" (secondary), "Don't miss the next one" (blog). Never: "Learn More", "Get Started", "Contact Us"
- **Blog hooks:** lead with a concrete statement, never a question or "In this post, we'll explore..."

---

## Accessibility

### DO: Respect contrast ratios
```
Body text on dark bg:   use slate-50 (#f8fafc) or slate-300 (#cbd5e1)
Muted text:             slate-400 (#94a3b8) — passes AA at normal size
Subtle text:            slate-500 (#64748b) — large text only (18px+ or 14px+ bold)
Accent on dark:         #F59E0B on #0f172a — 7.3:1 ratio, passes AA
```

### DON'T: Suppress focus styles or use tiny tap targets
```
// WRONG
button:focus { outline: none; }

// CORRECT — let browser defaults work, or enhance them
// Minimum tap target: p-2 (8px padding) on interactive elements
```

---

## Icons

Inline SVGs, not icon fonts. Outlined, single-color, simple.

```
Card icons:    w-6 h-6 (inside w-12 h-12 container)
Nav icons:     w-6 h-6
Footer social: w-5 h-5
Contact info:  w-4 h-4
```

