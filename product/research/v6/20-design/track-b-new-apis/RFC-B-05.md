---
id: RFC-B-05
track: B
title: Icon registry + full SVG element coverage
resolves: [F-B-041, F-B-042, F-B-043, F-B-044]
api_surface:
  - "Icon(name: IconName, opts?: IconOptions): SvgTag"
  - "registerIcon(name, paths): void"
  - "registerIcons(record): void"
  - "type IconName"
  - "type IconOptions"
  - "SvgTag.prototype.setStrokeLinecap()"
  - "SvgTag.prototype.setStrokeLinejoin()"
  - "SvgTag.prototype.setStrokeDasharray()"
  - "SvgTag.prototype.setStrokeDashoffset()"
  - "SvgTag.prototype.setTransform()"
  - "SvgShapeTag.prototype.setStrokeOpacity()"
  - "SvgShapeTag.prototype.setStrokeDashoffset()"
  - "LinearGradient(...children): LinearGradientTag"
  - "RadialGradient(...children): RadialGradientTag"
  - "Stop(...children): StopTag"
  - "ClipPath(...children): ClipPathTag"
  - "Mask(...children): MaskTag"
  - "Filter(...children): FilterTag"
  - "FeGaussianBlur(...children): FeGaussianBlurTag"
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md"]
impact: high
effort: L
depends_on: []
status: proposed
---

# RFC-B-05: Icon registry + full SVG element coverage

## Problem

There is no `Icon("name")` primitive in fluent-html, so every app reinvents icon delivery — 170+ `Raw("<svg>…")`/path-string calls across 4 apps (recon `02-app-patterns.md §5.4`: 72 in jt-cut, 31 in rideshare, 30 in mngmt). Three incompatible strategies have emerged, all worse than a registry:

- **`Raw("<svg>…")` wrappers** — `rideshare/src/shared/components/layout.view.ts:171-216` defines 14 named functions (`SearchIcon`, `BookmarkIcon`, `PlusCircleIcon`, `UsersIcon`, `LogoutIcon`, `DashboardIcon`, …), each returning an unescaped raw string. Not resizable or thenable without string surgery; bypasses the escape layer.
- **Path-string helpers** — `jt-cut/src/projects/v2/views/v2.components.ts:34-37` (`SvgIcon16(d)`) and a *second*, divergent `SvgIcon(d)` at `jt-cut/src/shared/components/ui.components.ts:374-380` (different size, different stroke width) in the same codebase.
- **Raw SVG `string` constants in a `Record`** — `mngmt/src/dashboard/dashboard.components.ts:25-33` stores 8 `const ICON_* = '<svg class="w-4 h-4 …">…'` typed `string`, mapped `Record<TaskStatus, string>` (`:68-78`) and injected via `Raw()`. F-B-042: the `GhostButton({ icon?: string })` slot at `:137-139` does `Raw(icon)` on an arbitrary `string` — any caller can inject HTML. The embedded `class="w-4 h-4 text-accent shrink-0"` strings are invisible to the Tailwind extractor and the ESLint plugin (silent dead/missing CSS).

Two library gaps make the *fluent* path (the correct workaround) too verbose to win:

- **F-B-043** — `SvgTag` (`src/elements/media.ts:304-347`) has `setStroke`/`setFill`/`setStrokeWidth` but lacks `setStrokeLinecap`/`setStrokeLinejoin` — the two attributes virtually every Heroicons/Lucide icon sets on the `<svg>` root (they inherit to children). `mngmt/src/shared/icons.ts:3-7` ships a file-level `/* eslint-disable fluent-html/prefer-set-method */` on its *primary* icon-authoring site just to reach for `addAttribute("stroke-width", …)`.
- **F-B-044** — no typed `linearGradient`/`stop`/`clipPath`/`filter` classes, so chart authoring falls to `El()` (generic `Tag`) + `addAttribute`. `jt-cut/src/analytics/views/analytics.chart.ts:75-97` builds a gradient with 6 `addAttribute` calls under an ESLint suppress; `:295` does `addAttribute("stroke-opacity", "0.5")` because `SvgShapeTag` lacks `setStrokeOpacity`.

## Proposed API

Three additive layers. All build on the existing `SvgTag`/`SvgShapeTag` classes — zero new runtime deps.

### 1. Icon registry (resolves F-B-041, F-B-042)

```ts
// src/icons/registry.ts

/** One icon = an array of <path> d-strings (outline style, 24×24 viewBox). */
export type IconPaths = readonly string[];

/** Built-in icon names — a const union, extended via module augmentation on register. */
export type BuiltinIconName =
  | "search" | "plus" | "plus-circle" | "x" | "check" | "check-circle"
  | "chevron-left" | "chevron-right" | "chevron-down" | "chevron-up"
  | "user" | "users" | "calendar" | "clock" | "gear" | "trash"
  | "pencil" | "logout" | "menu" | "dashboard" | "chart" | "refresh"
  | "arrow-left" | "external-link";

/** Open registry name: builtins plus anything registered. Apps widen via augmentation. */
export interface IconRegistry {} // augmented by registerIcon (see Type-safety story)
export type IconName = BuiltinIconName | keyof IconRegistry;

export type IconOptions = {
  /** Tailwind size token applied to both w/h, e.g. "4" → w-4 h-4. Default "5". */
  size?: TailwindSize | false;
  /** stroke color token or "currentColor" (default). */
  stroke?: string;
  /** "none" (default, outline icons) or a fill token. */
  fill?: string;
  /** stroke-width, default "2". */
  strokeWidth?: string | number;
  /** accessible label; sets role="img" + <title>. Omit → aria-hidden="true". */
  title?: string;
};

/** Build a typed <svg> for a registered icon. Returns a thenable SvgTag. */
export function Icon(name: IconName, opts?: IconOptions): SvgTag;

/** Register one icon. Pair with `declare module` augmentation for the name union. */
export function registerIcon(name: string, paths: IconPaths): void;

/** Bulk register. */
export function registerIcons(icons: Record<string, IconPaths>): void;
```

`Icon` returns an `SvgTag`, so callers chain fluent methods (`.textColor()`, `.on("hover", …)`, `.at("md", …)`) — no embedded class strings, fully extractor-visible. Internally it sets `viewBox="0 0 24 24"`, `fill`, `stroke`, `stroke-width`, `stroke-linecap="round"`, `stroke-linejoin="round"` on the root (needs F-B-043 setters) and renders each path via `Path().setD(d)`. Unknown registered icons are a runtime throw; known builtins are compile-checked by `IconName`.

### 2. `SvgTag` stroke setters (resolves F-B-043)

`SvgTag` and `SvgShapeTag` share the inheritable stroke presentation attributes. Extract a mixin so both expose the same setters without duplication.

```ts
// src/elements/media.ts — add to SvgTag (mirrors SvgShapeTag, src/elements/svg.ts:31-44)
class SvgTag extends Tag {
  // …existing setWidth/setHeight/setViewBox/setXmlns/setFill/setStroke/setStrokeWidth…
  setStrokeLinecap(v: "butt" | "round" | "square"): this;
  setStrokeLinejoin(v: "miter" | "round" | "bevel"): this;
  setStrokeDasharray(v: string): this;
  setStrokeDashoffset(v: string | number): this;
  setTransform(v: string): this;
}
```

```ts
// src/elements/svg.ts — add to SvgShapeTag (F-B-044 stroke-opacity)
class SvgShapeTag extends Tag {
  setStrokeOpacity(v: string | number): this;
  setStrokeDashoffset(v: string | number): this;
}
```

### 3. Typed SVG container elements (resolves F-B-044)

```ts
// src/elements/svg.ts — new typed tags, following the existing SvgShapeTag pattern

export class LinearGradientTag extends Tag {
  setX1(v: string | number): this; setY1(v: string | number): this;
  setX2(v: string | number): this; setY2(v: string | number): this;
  setGradientUnits(v: "userSpaceOnUse" | "objectBoundingBox"): this;
  setId(id: string): this;
}
export function LinearGradient(...children: View[]): LinearGradientTag;

export class RadialGradientTag extends Tag {
  setCx(v: string | number): this; setCy(v: string | number): this;
  setR(v: string | number): this;  setFx(v: string | number): this; setFy(v: string | number): this;
  setGradientUnits(v: "userSpaceOnUse" | "objectBoundingBox"): this;
  setId(id: string): this;
}
export function RadialGradient(...children: View[]): RadialGradientTag;

export class StopTag extends Tag {
  setOffset(v: string | number): this;   // number → "N%"
  setStopColor(v: string): this;
  setStopOpacity(v: string | number): this;
}
export function Stop(...children: View[]): StopTag;

export class ClipPathTag extends Tag {
  setClipPathUnits(v: "userSpaceOnUse" | "objectBoundingBox"): this;
  setId(id: string): this;
}
export function ClipPath(...children: View[]): ClipPathTag;

export class MaskTag extends Tag { setId(id: string): this; }
export function Mask(...children: View[]): MaskTag;

export class FilterTag extends Tag { setId(id: string): this; }
export function Filter(...children: View[]): FilterTag;

export class FeGaussianBlurTag extends Tag {
  setStdDeviation(v: string | number): this;
  setIn(v: string): this;
}
export function FeGaussianBlur(...children: View[]): FeGaussianBlurTag;
```

## Worked examples (before → after)

### A. Icon registry — `rideshare/src/shared/components/layout.view.ts:171-216`

```ts
// before (rideshare/src/shared/components/layout.view.ts:171-216) — 14 of these in one file
function SearchIcon() {
  return Raw(`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`);
}
function PlusCircleIcon() { return Raw(`<svg …>`); }
// … 12 more
```

```ts
// after (RFC-B-05) — no wrapper functions, no Raw, resizable + thenable
Icon("search")                               // <svg> w-5 h-5, currentColor, round caps
Icon("search", { size: "4" })                // 14px-equivalent → w-4 h-4
Icon("plus-circle").textColor("blue-500")    // extractor-visible color, not class="..."
```

### B. Type-eroded icon slot — `mngmt/src/dashboard/dashboard.components.ts:25-78,137-139`

```ts
// before (mngmt/src/dashboard/dashboard.components.ts:25-33, 68-78, 137-139)
const ICON_CHECK_CIRCLE = '<svg class="w-4 h-4 text-accent shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
const TASK_STATUS_ICONS: Record<TaskStatus, string> = { done: ICON_CHECK_CIRCLE, /* … */ };
export function TaskStatusIcon({ status }: { status: TaskStatus }) {
  return Raw(TASK_STATUS_ICONS[status]);                       // unescaped raw HTML
}
export function GhostButton({ label, icon }: { label: string; icon?: string }): View { /* … */ IfThen(icon, (i) => Raw(i)); }
```

```ts
// after (RFC-B-05) — Tailwind classes are real fluent calls; icon slot is View, not string
const TASK_STATUS_ICONS = {
  done:        () => Icon("check-circle").textColor("accent"),
  in_progress: () => Icon("clock").textColor("accent/60"),
  // …
} satisfies Record<TaskStatus, () => SvgTag>;
export function TaskStatusIcon({ status }: { status: TaskStatus }) {
  return TASK_STATUS_ICONS[status]().shrink("0");
}
export function GhostButton({ label, icon }: { label: string; icon?: View }) { // View, never string
  return Div(IfThen(icon, (i) => i), Span(label));
}
```

### C. SvgTag stroke setters — `mngmt/src/shared/icons.ts:3-7`

```ts
// before (mngmt/src/shared/icons.ts:3-7) — file-level ESLint suppress on the primary icon site
/* eslint-disable fluent-html/prefer-set-method -- setStrokeWidth doesn't exist on SvgTag */
const icon = (t: ReturnType<typeof Svg>) =>
  t.w("5").h("5").setFill("none").setStroke("currentColor")
    .addAttribute("stroke-width", "1.5").setViewBox("0 0 24 24");
/* eslint-enable fluent-html/prefer-set-method */
```

```ts
// after (RFC-B-05) — no suppress; root sets the inheritable stroke attrs fluently
const icon = (t: SvgTag) =>
  t.w("5").h("5").setFill("none").setStroke("currentColor")
    .setStrokeWidth("1.5").setStrokeLinecap("round").setStrokeLinejoin("round")
    .setViewBox("0 0 24 24");
```

### D. Typed gradient elements — `jt-cut/src/analytics/views/analytics.chart.ts:75-97,295`

```ts
// before (jt-cut/src/analytics/views/analytics.chart.ts:75-97)
// eslint-disable-next-line fluent-html/prefer-set-method -- El() returns generic Tag without typed SVG setters
return El("linearGradient",
  ForEach(stops, s => {
    const el = El("stop")
      .addAttribute("offset", `${s.offset * 100}%`)
      .addAttribute("stop-color", s.color);
    return s.opacity != null ? el.addAttribute("stop-opacity", String(s.opacity)) : el;
  }),
).setId(id)
  .addAttribute("x1", String(x1)).addAttribute("y1", String(y1))
  .addAttribute("x2", String(x2)).addAttribute("y2", String(y2));
// … :295
  .addAttribute("stroke-opacity", "0.5"),
```

```ts
// after (RFC-B-05) — typed, no suppress
return LinearGradient(
  ForEach(stops, s => {
    const stop = Stop().setOffset(s.offset * 100).setStopColor(s.color);
    return s.opacity != null ? stop.setStopOpacity(s.opacity) : stop;
  }),
).setId(id).setX1(x1).setY1(y1).setX2(x2).setY2(y2);
// …
  Path().setStrokeOpacity("0.5"),
```

## Type-safety story

- **Literal union for icon names.** `IconName = BuiltinIconName | keyof IconRegistry`. `Icon("serach")` is a compile error; built-ins autocomplete. App-registered icons widen the union via module augmentation:
  ```ts
  declare module "fluent-html" {
    interface IconRegistry { "rideshare-logo": true; }
  }
  registerIcon("rideshare-logo", ["M12 2 …"]);
  Icon("rideshare-logo")  // ✓ typed
  ```
- **Icon slots are `View`, never `string`** — kills the F-B-042 `icon?: string` → `Raw(icon)` injection class at the type level. (Companion ESLint rule `no-raw-icon-string` proposed separately; flags `Raw(x)` where `x` is an SVG-literal string.)
- **Typed setters replace stringly `addAttribute`.** `setStrokeLinecap("round")` accepts only `"butt" | "round" | "square"`; `setGradientUnits` only the two SVG-legal values. Misuse is a compile error, and `prefer-set-method` no longer fires (no suppress needed).
- **`setOffset(number)` / `setStopOpacity(number)`** normalize to the SVG string form, removing the `String(...)` / template-literal noise at every call site.

## Migration & compatibility

**Additive — nothing breaks.** All three layers are new exports or new methods on existing classes; no signature changes, no removals.

- `Icon`, `registerIcon`, `registerIcons`, the gradient/clip/filter tags, and the new `SvgTag`/`SvgShapeTag` setters are pure additions.
- Existing `Raw("<svg>…")`, `SvgIcon(d)`, and `El("linearGradient")` call sites keep compiling unchanged — apps migrate opportunistically.
- **Class-string contract (§11.7):** `Icon` emits *no* new utility classes itself — sizing routes through existing `.w()`/`.h()` and color through `.textColor()`, all already in the extractor vocabulary. No Track-C change required.
- **Codemod (optional, low-risk):** a jscodeshift transform can rewrite `Raw("<svg …stroke-linecap…>…</svg>")` whose path set matches a builtin into `Icon("<name>")`. Offered as a convenience, not required for adoption; listed in `breaking-changes.md` under "additive adoption helpers" (no breaking entry needed).

## Guidelines impact

Adds public surface → §11.8 mandatory. Patches the index (`CLAUDE.md`) and the `fluent-html.md` topic ref. Note: `mngmt/src/shared/icons.ts:3` shows the *old* guideline gap — the SVG section in `fluent-html.md:181-196` documented `SvgShapeTag` setters but never told readers that `SvgTag` (the root) lacked `setStrokeLinecap`/`setStrokeLinejoin`, so apps fell back to `addAttribute` + suppress. The new section closes that.

### Index — `web-development/CLAUDE.md`

Insert a new subsection under `## SVG & Visual Assets` (after line 48, before the `---` at line 50):

```md
- **Icons: `Icon("name")`, never `Raw("<svg>…")` or `icon: string`.** Returns a thenable `SvgTag` — size/color via fluent methods, not embedded `class=` strings.

```typescript
Icon("search")                            // ✓ w-5 h-5, currentColor
Icon("plus-circle", { size: "4" }).textColor("blue-500")  // ✓ extractor-visible
function Btn({ icon }: { icon?: View }) {}  // ✓ icon slot is View
Raw(`<svg class="w-4 h-4">…</svg>`)        // ✗ unescaped, invisible to Tailwind extractor
function Btn({ icon }: { icon?: string }) {} // ✗ string → Raw() injection
```

- **Register app icons typed** — `registerIcon` + `declare module` augmentation; never a `Record<string, string>` of SVG literals.
- **SVG root stroke attrs are fluent** — `Svg(...).setStrokeLinecap("round").setStrokeLinejoin("round")`, never `addAttribute` + eslint-disable.
- **Gradients/clip-paths/filters are typed tags** — `LinearGradient`, `Stop`, `ClipPath`, `Filter`, `FeGaussianBlur`, never `El("linearGradient")` + `addAttribute`.
```

### Topic ref — `web-development/fluent-html.md`

Replace the `## SVG Elements` section (lines 181-196) with:

```md
## SVG Elements

All SVG shapes share typed setters via `SvgShapeTag` (`setFill`, `setStroke`, `setStrokeWidth`, `setStrokeLinecap`, `setStrokeLinejoin`, `setStrokeOpacity`, `setSvgOpacity`, `setTransform`). The `<svg>` root (`SvgTag`) now exposes the same inheritable stroke setters — set them once on the root, children inherit:

```typescript
Svg(
  Circle().setCx("50").setCy("50").setR("40"),
  Path().setD("M10 80 C40 10, 65 10, 95 80"),
).setFill("none").setStroke("currentColor")
 .setStrokeWidth("2").setStrokeLinecap("round").setStrokeLinejoin("round")  // ✓ on root
 .setViewBox("0 0 24 24")
// ✗ never: .addAttribute("stroke-linecap", "round") + /* eslint-disable prefer-set-method */
```

> `setSvgOpacity()` avoids conflict with Tailwind's `.opacity()`; `setStrokeOpacity()` is the distinct `stroke-opacity` attribute.

### Icons

Use `Icon("name")` — never `Raw("<svg>…")`, per-file icon-wrapper functions, or `icon: string` props. Returns an `SvgTag`, so size/color are fluent and extractor-visible:

```typescript
Icon("search")                                  // ✓ default w-5 h-5, currentColor
Icon("check-circle", { size: "4" }).textColor("accent")  // ✓
Icon("logout", { title: "Sign out" })           // ✓ accessible: role=img + <title>

Raw('<svg class="w-4 h-4 text-accent">…</svg>') // ✗ unescaped; class invisible to extractor
const ICON: Record<Status, string> = { … }      // ✗ stringly icon map → Raw() injection
```

Icon slots are typed `View`, never `string`:

```typescript
function GhostButton({ icon }: { icon?: View }) {}   // ✓
function GhostButton({ icon }: { icon?: string }) {} // ✗ enables Raw(icon) injection
```

Register app-specific icons typed (path d-strings, 24×24 viewBox), widening the name union via augmentation:

```typescript
declare module "fluent-html" {
  interface IconRegistry { "app-logo": true; }
}
registerIcon("app-logo", ["M12 2 …"]);
Icon("app-logo")                                 // ✓ compile-checked name
```

### Gradients, clip-paths, filters

Typed container tags — never `El("linearGradient")` + `addAttribute`:

```typescript
Defs(
  LinearGradient(
    Stop().setOffset(0).setStopColor("blue").setStopOpacity(0.8),
    Stop().setOffset(100).setStopColor("blue").setStopOpacity(0),
  ).setId("fade").setX1(0).setY1(0).setX2(0).setY2(1),
)
Path().setFill("url(#fade)").setStrokeOpacity("0.5")   // ✓
// ✗ El("linearGradient", El("stop").addAttribute("offset", "0%")) + eslint-disable
```
```

## Guardrail check

- §11.1 zero-deps: **pass** — builtin icon set is a small bundled `Record<string, string[]>` of path data, no icon-lib dependency; gradients/setters are pure additions.
- §11.2 ssr-only/sync: **pass** — `Icon` is synchronous tag construction on the existing render path; no async.
- §11.3 escape-by-default: **pass** — `Icon` builds real `Path`/`SvgTag` nodes (escaped), *replacing* `Raw("<svg>")`; the F-B-042 `icon?: string` → `Raw()` injection is removed by typing slots as `View`.
- §11.4 type-safety: **pass** — `IconName` literal union, augmentable `IconRegistry`, enum-typed `setStrokeLinecap`/`setGradientUnits`, no bare `string` where a union fits.
- §11.5 backward-compat: **pass** — additive; no removals/renames; `breaking: additive`.
- §11.6 idioms: **pass** — variadic children on all new tags, specialized setters over `addAttribute`, thenable `SvgTag` chaining with `.on()`/`.at()`/`.textColor()`.
- §11.7 class-string contract: **pass** — `Icon` emits no new utility classes (uses existing `.w()`/`.h()`/`.textColor()`); no Track-C extractor/eslint vocab change.
- §11.8 guideline-sync: **pass** — Guidelines impact patches `CLAUDE.md` + `fluent-html.md`, covering every `api_surface` symbol (`Icon`/`registerIcon(s)`, the `SvgTag`/`SvgShapeTag` setters, and each gradient/clip/filter tag); `guideline_updates` set accordingly.

## Alternatives considered

- **Bundle a full icon lib (Heroicons/Lucide) as a dependency.** Rejected — violates §11.1 zero-deps and bloats the package. The registry ships a ~24-icon outline set as inline path data and lets apps register the rest.
- **`Icon` returns `RawString`/`View` instead of `SvgTag`.** Rejected — loses fluent chaining (`.textColor()`, `.on("hover")`), the exact ergonomic gap that pushed apps to `Raw`.
- **Keep `SvgTag` separate; only add setters, no shared mixin.** Rejected — `SvgTag` and `SvgShapeTag` would drift again (the original F-B-043 cause). A shared stroke-attr mixin single-sources the setters.
- **`El()` + a `prefer-set-method` exemption for SVG containers.** Rejected — typed tags give autocomplete, value validation, and remove the suppress entirely; an exemption hides the gap instead of closing it.

## Open questions

- **Builtin icon set scope.** Which ~24 names ship? Proposed from observed app usage (rideshare 14 + mngmt/jt-cut overlap). A human picks the canonical list + source license (Lucide is ISC — vendoring path data is license-clean).
- **`size: false`.** Should opting out of auto `w/h` be `false` or omission of the key? Proposed `false` to allow `Icon("x", { size: false }).w("rem", 1.5)` without a default fighting the override.
- **Module-augmentation ergonomics.** `declare module` + `registerIcon` is two steps. Acceptable, or do we want a codegen helper that emits both from an icons folder? Defer to adoption feedback.
