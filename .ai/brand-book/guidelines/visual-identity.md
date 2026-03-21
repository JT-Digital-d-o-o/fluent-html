# Visual Identity

## Brand Personality

**Tagline:** Your vision. Expertly built.

JT Digital is a lean software agency in Slovenia that builds modern web applications for European clients. The brand communicates:

- **Technical excellence** — We know our craft
- **Transparency** — No surprises
- **Simplicity** — As little complexity as possible
- **Productivity** — Stay small, ship big

## Color Philosophy

The dark slate background with amber accent conveys a premium, technical feel. The amber accent adds warmth and approachability to an otherwise developer-focused aesthetic.

- Dark theme is the **primary** brand expression
- Use accent color sparingly — for CTAs, highlights, and the "JT" logo mark
- Avoid using accent on large surfaces; it should draw the eye to key elements

## UI Patterns

### Glassmorphism

Used for elevated surfaces (navigation, cards). Two variants exist:

**Main site** — lighter, more transparent:
```css
.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

**Blog** — slightly more opaque for readability:
```css
.glass {
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(51, 65, 85, 0.5);
}
```

### Glow Effects

Subtle amber glow on interactive elements:
```css
/* Cards (main site) */
.glow-box {
  box-shadow: 0 0 60px rgba(245, 158, 11, 0.1);
}
.glow-box:hover {
  box-shadow: 0 0 80px rgba(245, 158, 11, 0.2);
}

/* Accent sections (blog) */
.glow-accent {
  box-shadow: 0 0 80px rgba(245, 158, 11, 0.08);
}
```

### Gradient Text
For emphasized text on dark backgrounds:
```css
background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #FCD34D 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

### Borders
Subtle, semi-transparent borders using `border-slate-800/50`. On hover, transition to `border-accent/50`.

### Background Blobs

Decorative ambient blobs behind content. Fixed position, non-interactive:

```html
<div class="fixed z-0 overflow-hidden top-0 left-0 w-full h-full pointer-events-none">
  <div class="absolute top-1/4 -left-1/4 w-96 h-96 bg-amber-600/30 rounded-full blur-3xl"></div>
  <div class="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-orange-600/25 rounded-full blur-3xl"></div>
  <div class="absolute top-3/4 left-1/2 w-64 h-64 bg-yellow-600/20 rounded-full blur-3xl"></div>
</div>
```

Colors stay within the amber/orange/yellow family. Always use low opacity (`/20` to `/30`) and heavy blur (`blur-3xl`).

## Components

### Buttons

**Primary** — solid accent background, dark text:
```
px-6 sm:px-8 py-3 font-medium text-sm bg-accent text-slate-950 rounded-lg
hover:bg-accent-light transition-colors
```

**Secondary/Ghost** — transparent with border:
```
px-6 sm:px-8 py-3 font-medium text-sm text-slate-300 rounded-lg
border border-slate-700
hover:border-accent hover:text-accent transition-colors
```

On the blog, ghost buttons use the `.glass` class instead of an explicit border.

**CTA (large)** — used for final call-to-action sections, adds scale on hover:
```
px-6 sm:px-8 py-3 sm:py-4 font-semibold bg-accent text-slate-950 rounded-lg
hover:bg-accent-light hover:scale-105 transition-all
```

### Cards

**Service card** (main site):
```
p-8 rounded-2xl bg-slate-900/50 border border-slate-800
hover:border-accent/50 transition-colors group
```
With icon container:
```
w-12 h-12 flex items-center justify-center rounded-xl mb-6
bg-accent/10 group-hover:bg-accent/20 transition-colors
```

**Project card** (main site carousel):
```
p-8 rounded-2xl bg-slate-900/50 border border-slate-800
hover:border-accent/50 transition-all h-full
```

**Blog article card**:
```
cursor-pointer rounded-2xl border overflow-hidden group
bg-slate-900/50 border-slate-800
hover:border-accent/50 transition-all h-full flex flex-col
```
Inner content: `p-6 flex flex-col flex-1`

Card title hover effect (all cards): `group-hover:text-accent transition-colors`

### Tags / Badges

**Accent tag** (blog categories, project tech):
```
text-xs font-medium rounded-full px-3 py-1 bg-accent/10 text-accent
```

**Glass tag** (project tech stack on main site):
```
text-xs text-slate-300 rounded-full px-3 py-1.5 glass
```

**Bordered tag** (footer contact info):
```
text-sm rounded-full px-3 py-1 border border-slate-700 text-slate-300
```

### Author Avatar (blog)

Small circular avatar with gradient border ring:
```
rounded-full w-8 h-8 bg-gradient-to-br from-accent via-amber-400 to-orange-400 p-0.5
```
Inner circle: `w-full h-full rounded-full flex items-center justify-center bg-slate-900`
Initial letter: `text-[10px] font-serif font-bold text-accent`

### Newsletter CTA (blog)

Highlighted section with glow and gradient overlay:
```
rounded-2xl bg-slate-900/80 border border-slate-800 glow-accent
p-8 sm:p-12 text-center relative overflow-hidden
```
With background gradient:
```
absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-orange-600/5
pointer-events-none
```

### Navigation

**Desktop nav bar** (shared across both sites):
```
fixed z-50 top-0 left-0 right-0
bg-slate-900/80 backdrop-blur-md border-b border-slate-800/50
```
Inner container: `mx-auto flex items-center justify-between max-w-6xl px-4 sm:px-6 py-3 sm:py-4`

**Nav links**: `text-sm text-slate-400 hover:text-accent transition-colors`

**Mobile menu** (hidden by default, toggled via JS):
```
md:hidden hidden bg-slate-900/95 backdrop-blur-md
```
Mobile links: `block py-2 text-slate-300 hover:text-accent transition-colors` (main site)
or: `px-4 py-3 text-base font-medium text-slate-400 border-b border-slate-800/50` (blog)

**Mobile hamburger**: `p-2 md:hidden text-slate-400 hover:text-accent transition-colors`

### Partner Cards

```
flex items-center justify-center p-8 rounded-2xl glass
hover:border-accent/30 transition-colors
```

## Animation & Motion

### Transition Defaults

All interactive elements use Tailwind's `transition-colors` or `transition-all`. No custom timing overrides except the carousel.

| Context | Class | Duration |
|---------|-------|----------|
| Links, nav items | `transition-colors` | 150ms (Tailwind default) |
| Cards, buttons | `transition-colors` or `transition-all` | 150ms |
| Carousel slide | `transition-transform duration-500 ease-in-out` | 500ms |
| CTA scale effect | `transition-all` + `hover:scale-105` | 150ms |

### Motion Principles

- Transitions are subtle and fast — never bouncy, never slow
- Hover effects are limited to color shifts (`text-accent`, `border-accent/50`) and icon background opacity changes
- Only the large CTA uses `scale` — cards and links do not
- No entry animations, no scroll-triggered animations, no parallax
- The carousel is the only element with a longer transition (`duration-500`)

## Icons

Icons are inline SVGs, not an icon font or sprite sheet. Consistent sizing:

| Context | Size |
|---------|------|
| Card icons | `w-6 h-6` inside a `w-12 h-12` container |
| Nav hamburger | `w-6 h-6` |
| Social links (footer) | `w-5 h-5` |
| Contact info icons | `w-4 h-4` |

Icon color: `text-accent` (in cards) or `text-slate-400` (in nav/footer), inheriting hover color from parent group.

No specific icon library is mandated — icons are drawn per use case. Keep them simple, single-color, and outlined (not filled).

## Spacing & Layout

- Max content width: `max-w-6xl` (72rem / 1152px)
- Narrower content (hero, CTA): `max-w-4xl` or `max-w-3xl`
- Section padding: `py-16 sm:py-24 md:py-32`
- Horizontal padding: `px-4 sm:px-6`
- Card border radius: `rounded-2xl`
- Button border radius: `rounded-lg`
- Icon container radius: `rounded-xl`
- Tag border radius: `rounded-full`
- Grid gaps: `gap-4 sm:gap-6` (services), `gap-6` (blog articles, projects), `gap-8` (partners)

### Section Layout Patterns

| Section | Grid | Columns |
|---------|------|---------|
| Services | `grid sm:grid-cols-2 lg:grid-cols-4` | 1 -> 2 -> 4 |
| Projects (main) | Carousel, not grid | Slides |
| Blog articles | `grid md:grid-cols-3` | 1 -> 3 |
| Partners | `grid grid-cols-2 md:grid-cols-3` | 2 -> 3 |
| Footer | `grid grid-cols-2` or `grid-cols-3` | 2-3 columns |

## Accessibility

### Contrast Ratios

Key combinations on the dark background (`#0f172a`):

| Text | Color | Ratio | WCAG AA |
|------|-------|-------|---------|
| Primary text | `#f8fafc` (slate-50) | 17.4:1 | Pass |
| Secondary text | `#cbd5e1` (slate-300) | 10.3:1 | Pass |
| Muted text | `#94a3b8` (slate-400) | 5.6:1 | Pass |
| Subtle text | `#64748b` (slate-500) | 3.5:1 | Pass (large text only) |
| Accent on dark bg | `#F59E0B` on `#0f172a` | 7.3:1 | Pass |
| Dark text on accent | `#0f172a` on `#F59E0B` | 7.3:1 | Pass |

### Guidelines

- Never use `slate-500` for body text — it only passes for large text (18px+) or bold text (14px+)
- Accent tags (`bg-accent/10 text-accent`) pass because the text is the full `#F59E0B`
- All interactive elements have visible hover state changes (color shift to accent)
- Focus states rely on browser defaults (`:focus-visible` outline) — do not suppress them
- Mobile tap targets are minimum `p-2` (8px padding) on interactive elements

## Tech Stack

The brand is built with and represents expertise in:
- **TypeScript**
- **HTMX**
- **Tailwind CSS**
- **Fastify**
- **fluent-html** (proprietary framework)
