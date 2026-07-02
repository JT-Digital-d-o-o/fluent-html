# Track A — App APIs · a08 — Component duplication

Lens: component duplication across view files in two real consumer apps (pm-gui = v6 template, planet-positive-sport = v5). Each finding is a recurring user-land shape that both apps reinvent and that the library could turn into a primitive — without becoming an opinionated design system (per MEMORY: ship primitives, not Alert/Badge/Modal components).

---

## 1. A first-class `Styler` type + `apply` overload that returns `this` cleanly

### Problem / evidence
The single most-duplicated *primitive* across both apps is the "tag-modifier function" idiom — `<T extends Tag>(t: T) => T` — used with `.apply()`. Every app reinvents the type signature, and the older app even casts (`as T`) to make it type-check:

- pm-gui `src/shared/stylers.ts` defines its own `export type Styler = <T extends Tag>(t: T) => T;` because the library ships no such alias.
- pm-gui `src/shared/ui/button.ts` — `primaryCta = <T extends Tag>(t: T): T => …`
- pm-gui `src/shared/ui/form.ts` — `fieldStyle = <T extends Tag>(t: T): T => …`, `inputStyle`, `textareaStyle`, `noticeBox(tone)` all return the same shape.
- pm-gui `src/shared/pm-bits.ts` — `pill = <T extends Tag>(t: T): T => …`
- planet-positive-sport `src/shared/components/styles.ts` — `cardSurface`, `primaryAction`, `dropdownMenu`, `menuItem`, `authModal` — every one written `<T extends Tag>(t: T) => … as T` (note the trailing `as T` cast, present because the chained fluent methods are typed as `Tag`, not `T`).

So both apps: (a) re-declare the same generic signature dozens of times, and (b) the v5 app needs an unsafe cast to satisfy it. `Tag.apply(...fns: ((tag: this) => unknown)[])` already exists (src/core/tag.ts:288) and is the right runtime — what is missing is an exported *name* for the function it takes.

### Proposed API
Export a public type alias from the package root:

```ts
/** A reusable, type-preserving tag modifier — the argument shape of `.apply()`. */
export type Styler = <T extends Tag>(tag: T) => T;
```

No runtime, no emitted HTML — it is a type the whole ecosystem can converge on. Apps replace their local `Styler`/`<T extends Tag>(t:T)=>T` declarations with the imported one, and the v5 `as T` casts disappear because `apply` already preserves `this`. Optionally pair it with a trivial identity helper `styler(fn: Styler): Styler` so authors get inference + a single import.

### Before / After
```ts
// before — pm-gui re-declares the type; ppsport additionally casts
export type Styler = <T extends Tag>(t: T) => T;                 // stylers.ts
export const cardSurface = <T extends Tag>(t: T) => t.background("white")…  as T;  // ppsport

// after
import { type Styler } from "fluent-html";
export const cardSurface: Styler = (t) => t.background("white")…;  // no cast, no re-decl
```

### Already in lib?
No. `apply`/`when`/`whenElse` exist (src/core/tag.ts:245-291) but there is **no** exported `Styler` type — confirmed by grep across `src/` (zero hits for `Styler`). Not in CHANGELOG 6.0.0→6.1.1.

### Value: high · Effort: small

---

## 2. `variants()` — exhaustive variant → `Styler` map (extractor-safe replacement for `record[key]`)

### Problem / evidence
The second-most duplicated shape is "given a closed variant key, pick a set of literal Tailwind classes." Both apps reinvent it, and both wrestle with the same constraint: the classes must be **statically literal** so the Tailwind extractor keeps them (no `.addClass(record[variant])`). The implementations diverge in quality, which is exactly the kind of thing a primitive should unify:

- pm-gui already extracted a helper for this — `src/shared/stylers.ts` `stylers<K>(map)` — and uses it three times: `NOTICE_TONES` (form.ts), `ALIGN_FNS` (data.ts), and the `Styler`-map pattern generally. Its own JSDoc states the motivation: *"Prefer this over `.addClass(MatchValue(...))` / `.addClass(record[var])`: the fluent methods are typed AND statically visible to the Tailwind extractor."*
- planet-positive-sport reinvents the same idea **less safely** four+ times with plain records of class *strings*:
  - `composite.ts` `statusBadgeStyles` — `Record<StatusBadgeVariant, { bg: string; text: string }>` then `.background(style.bg).textColor(style.text)` (dynamic — extractor-fragile).
  - `composite.ts` `infoCalloutStyles` — `Record<InfoCalloutVariant, { style: (t: Tag) => Tag; icon: string }>`.
  - `composite.ts` `dotColor`/`dotShape` — `if (percent>=100) return "bg-green-500"` then `.addClass(dotColor(...))`.

This is the canonical pm-gui pattern (the v6 template *ships* `stylers()` in user-land), strong evidence it belongs in the library so every app stops re-authoring it and the weaker string-record variants vanish.

### Proposed API
Promote pm-gui's `stylers` into the package as `variants` (clearer name; `stylers` plural reads oddly):

```ts
/** Build a typed, exhaustive `key → Styler` map. Each value is a plain
 *  `(t) => t.…` modifier whose classes stay literal (extractor-visible). */
export function variants<K extends string | number>(
  map: Record<K, Styler>,
): Record<K, Styler>;
```

Usage: `Span(label).apply(badgeTone[tone])` — works on any Tag subtype, chain preserved, and a new key is a compile error, not a silent miss. Emits nothing itself; just routes to fluent methods.

### Before / After
```ts
// before — ppsport, dynamic strings the extractor can lose
const statusBadgeStyles = { completed: { bg: "green-100", text: "green-800" }, … };
Span(label).background(style.bg).textColor(style.text);   // bg/text are variables

// after — literal classes, exhaustive, type-safe
const badgeTone = variants<StatusBadgeVariant>({
  completed: (t) => t.background("green-100").textColor("green-800"),
  draft:     (t) => t.background("gray-100").textColor("gray-600"),
  // … all keys required
});
Span(label).apply(badgeTone[variant]);
```

### Already in lib?
No. The helper exists only as copied user-land code in pm-gui (`src/shared/stylers.ts`). Nothing named `stylers`/`variants` in `src/`. Not in CHANGELOG. (Depends on finding #1's `Styler` type.)

### Value: high · Effort: small

---

## 3. `Icon()` — build an inline SVG from a path-`d` (+ stroke/fill preset)

### Problem / evidence
Both apps hand-roll an SVG-icon factory that turns a `viewBox` + path `d`-string into a sized, color-inheriting `Svg(Path(d))`. The two implementations are structurally identical, differing only in the fill-vs-stroke preset — exactly the variation a single primitive should parameterize:

- pm-gui `src/shared/icons.ts` — `makeIcon(viewBox, ...paths)` → `Svg(Path().setD(d)…).setViewBox(viewBox).setFill("currentColor")`, with a `{ d, rule? }` spec that toggles `setFillRule("evenodd").setClipRule("evenodd")`. Backs a 16-icon `Icons` registry.
- planet-positive-sport `src/shared/icons.ts` — `single(d, strokeWidth)` → `Svg(path(d)…).setViewBox("0 0 24 24").setFill("none").setStroke("currentColor")`, where `path` sets `setStrokeLinecap/Linejoin/Width`. Backs ~40+ exported icons.

The comments in both files cite the *same* reason for doing it the fluent way ("classes embedded in a `Raw('<svg>')` string would never reach the [Tailwind] safelist"). That shared rationale is a signal the library should offer the blessed builder so apps don't each re-derive it.

### Proposed API
A thin builder returning an `SvgTag` (still fully chainable for `.w().h().textColor()`):

```ts
type IconOpts = {
  viewBox?: string;            // default "0 0 24 24"
  preset?: "fill" | "stroke";  // fill → fill:currentColor; stroke → fill:none, stroke:currentColor, round caps/joins
  evenodd?: boolean;           // fill preset → set fill-rule/clip-rule
};
export function Icon(d: string | string[], opts?: IconOpts): SvgTag;
```

Emits `<svg viewBox=… fill="currentColor"><path d="…"/></svg>` (fill preset) or the stroke variant — i.e. exactly what both apps build by hand today, sizing/color left to the caller's fluent chain.

### Before / After
```ts
// before — ppsport reinvents the stroke factory
const single = (d) => () => Svg(path(d)).setViewBox("0 0 24 24").setFill("none").setStroke("currentColor")…;
export const checkIcon = single("M5 13l4 4L19 7");

// after
export const checkIcon = () => Icon("M5 13l4 4L19 7", { preset: "stroke" });
```

### Already in lib?
No `Icon`/`makeIcon`/`iconFrom` helper in `src/` (grep: zero hits). `Svg`/`Path` primitives exist; the *factory* over them does not. Not in CHANGELOG.

### Value: medium · Effort: small

---

## Components that recur but should stay user-land (per "fluent-html is an instruction set")

These shapes are duplicated across the two apps almost byte-for-byte, but they are **opinionated components**, not primitives, so the right library response is findings #1–#3 (the *mechanisms* to build them DRY-ly), not shipping the components themselves. Recorded so other tracks don't re-propose them as library additions:

- `StatCard` — pm-gui `data.ts` and ppsport `composite.ts` (both: white/rounded-xl/shadow-sm/border card with value+label).
- `EmptyState` — pm-gui `data.ts` and ppsport `composite.ts` (centered, optional icon/description/action).
- `ThCell` / `TdCell` — **byte-identical** between pm-gui `data.ts` and ppsport `containers.ts`.
- `CenteredPage` — pm-gui `layout.ts` vs ppsport `containers.ts` (one uses `.minH("vh",80)`, the other the `[80vh]` escape hatch — same component).
- `DashboardSection` (pm-gui) ≡ `FormSection` (ppsport) — title + optional description + content.
- `Card` (pm-gui `layout.ts`) ≡ `cardSurface` (ppsport `styles.ts`) — same surface chain.

The takeaway: these prove the *demand* for #1 (`Styler`) and #2 (`variants`); they are best served by making those two ergonomic, not by absorbing the components.

---

## Top picks
- **#1 `Styler` type alias** — high value, tiny surface; both apps re-declare it and the v5 app casts to satisfy it. Pure type, zero runtime risk, foundation for #2.
- **#2 `variants()` exhaustive variant→Styler map** — high value; pm-gui *already ships it* in user-land and the v5 app reinvents it with extractor-fragile string records. Direct convergence + Tailwind-safety win.
- **#3 `Icon()` path-to-SVG factory** — medium; both apps hand-roll the same fill/stroke icon builder for the same documented (extractor) reason.
