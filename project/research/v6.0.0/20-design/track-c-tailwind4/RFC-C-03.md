---
id: RFC-C-03
track: C
title: v4 utility-rename & scale-shift correctness — dual-target emitter + semantic-rename methods
resolves: [F-C-001, F-C-013, F-C-002, F-C-014, F-C-021, F-C-003, F-C-022, F-C-004, F-C-081, F-C-074, F-C-082, F-C-093]
api_surface: ["setTailwindTarget()", "Tag.prototype.gradientTo()", "Tag.prototype.gradientRadial()", "Tag.prototype.gradientConic()", "Tag.prototype.outlineHidden()", "Tag.prototype.shadow()", "Tag.prototype.rounded()", "Tag.prototype.blur()", "Tag.prototype.backdropBlur()", "Tag.prototype.ring()", "Tag.prototype.transition()", "Tag.prototype.border()", "Tag.prototype.spaceX()", "Tag.prototype.spaceY()", "TailwindShadow", "TailwindRounded", "TailwindBlur", "TailwindOutline", "TailwindRingWidth", "TailwindGradientDirection", "TailwindTransition", "ExtractorOptions.target"]
breaking: breaking
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md"]
impact: high
effort: L
depends_on: []
status: proposed
---

# RFC-C-03: v4 utility-rename & scale-shift correctness

## Problem

fluent-html is a pure class-string generator. Its methods, the extractor's `METHOD_PATTERNS`, and the ESLint auto-fix map each independently hard-code Tailwind **v3** utility names. Tailwind v4 renamed, removed, and silently re-scaled a swath of those utilities. Because the library never validates against an installed Tailwind, every one of these breaks is **silent** — no type error, no build error — the page just renders wrong. Three failure classes, all evidenced in shipped apps:

**1. Dead classes (renamed → no CSS generated).**
```ts
// fluent-html/src/core/tailwind-methods.ts:576
p.gradientTo = function (direction: string) { return this.addClass(`bg-gradient-${direction}`); };
```
On v4 `bg-gradient-to-r` does not exist (renamed to `bg-linear-to-r`) → Oxide emits no CSS → the gradient disappears (F-C-001, F-C-013). The extractor (`fluent-html-tailwind-extractor/src/index.ts:391`) and ESLint map (`no-known-modifiers-in-setclass.ts:384`) agree on the *same wrong* name — guardrail §11.7 holds, but on the wrong vocabulary.

**2. Scale-shift (same name → different rendered value).** v4 inserted an `xs` slot, shifting every named step down one:

| v3 call | emits | v3 visual | v4 visual |
|---|---|---|---|
| `.shadow("sm")` | `shadow-sm` | small | medium (was bare `shadow`) |
| `.shadow()` | `shadow` | medium | small |
| `.rounded()` | `rounded` | 0.25rem | 0.125rem |
| `.blur()` | `blur` | 8px | 4px |

The type tables (`tailwind-types.ts:77,81,205`) don't even contain `"xs"`, so users can't opt into the new scale without `(string & {})`. Evidenced at ~29 `.shadow()` sites across `ttl` + `rideshare`, e.g. `rideshare/src/settings/settings.view.ts:57,79,497`; `ttl/src/analytics/analytics.view.ts:150,517,687` (F-C-002, F-C-014, F-C-021).

**3. Semantic change (same name → different behavior).**
```ts
// fluent-html/src/core/tailwind-methods.ts:568
p.outline = function (value: string) { return this.addClass(`outline-${value}`); };
```
v4 split `outline-none`: the a11y-safe "invisible but present" outline is now `outline-hidden`; `outline-none` means real `outline-style:none` — a keyboard-a11y regression. ~26 `.outline("none")` focus-suppression sites (`ttl/src/shared/components/layout.view.ts:148`, `rideshare/src/auth/auth.components.ts:31`, F-C-003, F-C-022). Companions in the same family:
- Bare `.ring()` 3px/blue-500 → 1px/currentColor; `TailwindRingWidth` lacks `3` to restore the old look (`tailwind-types.ts:144`, F-C-004).
- Bare `.border()` `gray-200` → `currentColor`; 64+ sites in `ttl` alone (`ttl/src/settings/settings.view.ts:55`, F-C-074).
- `.transition("transform")` no longer animates `translate/scale/rotate` (decomposed to individual props); `TailwindTransition` still advertises `"transform"` (`tailwind-types.ts:139`, F-C-081).
- `Button()` loses preflight `cursor:pointer`; 119+ buttons rely on it (`ttl/src/auth/auth.view.ts:392`, F-C-082).
- `.spaceX/Y()` selector changed; conditionally-hidden children now get phantom spacing (`rideshare/src/rides/views/detail.view.ts:126`, F-C-093).

All three packages must move together (the class-string contract, §11.7), and existing consumers (`ttl`, `rideshare`) must not silently break — hence a **target switch**, not an unconditional rename.

## Proposed API

A single, process-global **build target** selects the emitted vocabulary. It defaults to `"v3"` (no change for current consumers) and is set once at app/build entry. All three packages read the same target.

```ts
// fluent-html — new public entry (src/core/tailwind-target.ts)
export type TailwindTarget = "v3" | "v4";

/** Set the Tailwind class vocabulary the fluent methods emit. Call once, before render. Default: "v3". */
export function setTailwindTarget(target: TailwindTarget): void;
export function getTailwindTarget(): TailwindTarget;
```

The methods branch on target only where v3/v4 strings differ. Rename + scale-remap + new gradient methods:

```ts
declare module "./tag.js" {
  interface Tag {
    // Gradients — bg-gradient-* (v3) / bg-linear-* (v4); + new v4 gradient kinds
    gradientTo(direction: TailwindGradientDirection): this;     // linear (existing name kept)
    gradientRadial(): this;                                     // v4: bg-radial   (no-op-warns on v3)
    gradientConic(): this;                                      // v4: bg-conic    (no-op-warns on v3)

    // Scale-shifted — gain the "xs" slot; bare form remapped under v4 to preserve visual
    shadow(value?: TailwindShadow): this;
    rounded(value?: TailwindRounded): this;
    rounded(corner: TailwindRoundedCorner, value?: TailwindRounded): this;
    blur(value?: TailwindBlur): this;
    backdropBlur(value?: TailwindBlur): this;

    // Outline — new a11y-safe dedicated method
    outline(value: TailwindOutline): this;
    outlineHidden(): this;                                     // v4: outline-hidden / v3: outline-none

    // Ring — width "3" added so the old 3px default is expressible
    ring(value?: TailwindRingWidth): this;

    // Transition — "transform" dropped (v4); per-property values added
    transition(value?: TailwindTransition): this;
  }
}
```

Type tables (`tailwind-types.ts`) gain the v4 slots without dropping v3 values (additive at the type level — v4-only narrowing is enforced at emit time, not by the type):

```ts
export type TailwindShadow   = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "inner" | "none" | (string & {});
export type TailwindRounded  = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full" | `[${string}]`;
export type TailwindBlur     = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | `[${string}]`;
export type TailwindOutline  = "none" | "hidden" | "dashed" | "dotted" | "double";
export type TailwindRingWidth = 0 | 1 | 2 | 3 | 4 | 8 | Stringified<0 | 1 | 2 | 3 | 4 | 8> | (string & {});
export type TailwindGradientDirection =
  | "to-t" | "to-tr" | "to-r" | "to-br" | "to-b" | "to-bl" | "to-l" | "to-tl"
  | "45" | "90" | "135" | "180"          // v4 angle linears (bg-linear-45)
  | (string & {});
export type TailwindTransition = "none" | "all" | "colors" | "opacity" | "shadow"
  | "transform"                          // v3 only — flagged by ESLint under target v4
  | "[translate,scale,rotate]";          // v4 idiom for animating movement
```

Emit logic (single source — `tailwind-methods.ts`), illustrated for the three classes:

```ts
// 1. Rename
p.gradientTo = function (d: string) {
  return this.addClass(getTailwindTarget() === "v4" ? `bg-linear-${d}` : `bg-gradient-${d}`);
};

// 2. Scale-shift remap — under v4, shift v3 names down one slot to preserve the v3 LOOK
const SHADOW_V4: Record<string, string> = { "": "shadow-sm", sm: "shadow-xs", /* others 1:1 */ };
p.shadow = function (value?: string) {
  if (getTailwindTarget() === "v4") return this.addClass(SHADOW_V4[value ?? ""] ?? `shadow-${value}`);
  return value === undefined ? this.addClass("shadow") : this.addClass(`shadow-${value}`);
};
// rounded/blur/backdropBlur follow the identical { "":·, sm:·xs } remap table

// 3. Semantic — dedicated method, no overload-by-string
p.outlineHidden = function () {
  return this.addClass(getTailwindTarget() === "v4" ? "outline-hidden" : "outline-none");
};
```

Extractor mirrors the switch via its existing options object:

```ts
// fluent-html-tailwind-extractor/src/index.ts
export interface ExtractorOptions {
  onWarning?: (message: string) => void;
  target?: TailwindTarget;   // default "v3"; METHOD_PATTERNS branch on it
}
```

ESLint plugin gains a shared `target` setting; `no-known-modifiers-in-setclass` maps `bg-linear-*`/`outline-hidden`/`shadow-xs` → fluent methods under `v4`, and `no-conflicting-classes-in-setclass` flags `.transition("transform")`, bare `.border()` (no `.borderColor`), bare `.ring()`, and `.spaceX/Y()` with v4-specific messages.

## Worked examples (before → after)

### Gradient rename (F-C-001 / F-C-013)
```ts
// before — fluent-html/src/core/tailwind-methods.ts:576 path, called from a hero section
Div().gradientTo("to-r").from("blue-500").to("violet-600")
// v3: bg-gradient-to-r ✓   v4: bg-gradient-to-r → DEAD, no CSS, no gradient
```
```ts
// after (target "v4") — same call site, no app change
setTailwindTarget("v4");
Div().gradientTo("to-r").from("blue-500").to("violet-600")   // → bg-linear-to-r ✓
Div().gradientRadial().from("blue-500").to("violet-600")     // → bg-radial   (v4 only)
```

### Scale-shift (F-C-021, real site `rideshare/src/settings/settings.view.ts:56-57`)
```ts
// before
Div(...).rounded("xl").shadow("sm")
// v4 unfixed: shadow-sm now renders as v3's medium shadow → every settings card heavier
```
```ts
// after (target "v4") — unchanged call, visual preserved
setTailwindTarget("v4");
Div(...).rounded("xl").shadow("sm")   // emits shadow-xs → identical to v3 small shadow ✓
Div(...).shadow("xs")                 // opt into the new v4 slot, now type-safe ✓
```

### Outline a11y (F-C-003, real site `ttl/src/shared/components/layout.view.ts:148`)
```ts
// before
.on("focus-visible", t => t.ring("2").ringColor("accent").outline("none").rounded("lg"))
// v4 unfixed: outline-none = outline-style:none → forced-colors keyboard users lose the outline
```
```ts
// after — swap the one call; intent is now explicit and v4-correct
.on("focus-visible", t => t.ring("2").ringColor("accent").outlineHidden().rounded("lg"))
// target v4 → outline-hidden (a11y-safe) · target v3 → outline-none (unchanged)
```

### Ring default + transition (F-C-004 / F-C-081)
```ts
// before
.ring().transition("transform").on("hover", t => t.scale("105"))
// v4 unfixed: ring = 1px currentColor (was 3px blue); transition-transform no longer animates scale
```
```ts
// after
.ring("3").transition("[translate,scale,rotate]").on("hover", t => t.scale("105"))   // explicit, v4-correct
```

## Type-safety story

- **Discriminated target, not a magic string at every call.** `TailwindTarget = "v3" | "v4"` is a 2-member literal union set once; methods read it — no per-call flag to forget, no bare `string`.
- **`outlineHidden()` over `.outline("none")`.** A dedicated method makes the a11y-safe path a distinct symbol — IDE autocomplete surfaces it, and the ESLint rule can flag the dangerous `.outline("none")` precisely. Removing `"none"`'s ambiguity is the type-level fix to a semantic trap.
- **New literal slots are additive at the type level.** Adding `"xs"`/`"hidden"`/`3`/angle directions only *widens* the accepted union, so no existing call fails to compile. The *behavioral* change is gated at emit time by the target, where a type can't express "valid name, wrong value."
- **`"transform"` retained but linted.** Keeping it in `TailwindTransition` avoids a hard compile break; the ESLint rule (not the type) flags it under `target: v4`, matching house policy of additive-types + tooling-enforced migration.
- **`(string & {})` escape hatch preserved** for v4 dynamic spacing / custom `@theme` tokens (`p-13`, `bg-(--brand)`), per recon §3 resilience note.

## Migration & compatibility

**Breaking — but opt-in and staged.** Default `target` is `"v3"`: installing v6 changes nothing for current consumers. The break only occurs when a consumer calls `setTailwindTarget("v4")`, which they do as a deliberate, single migration step.

What changes under `target: "v4"` and the codemod/lint that catches each:

| Change | Auto-handled? | Migration action |
|---|---|---|
| `bg-gradient-*` → `bg-linear-*` | ✓ automatic | none — `.gradientTo()` re-emits |
| `shadow/rounded/blur` scale | ✓ automatic (remapped to preserve v3 look) | none; opt into v4 scale via new `"xs"` |
| `.outline("none")` a11y | ✗ needs call change | ESLint autofix `.outline("none")` → `.outlineHidden()` |
| bare `.ring()` 1px | ✗ needs call change | ESLint flag → `.ring("3")` to restore 3px |
| bare `.border()` color | ✗ needs call change | ESLint flag bare `.border()` w/o `.borderColor` |
| `.transition("transform")` | ✗ needs call change | ESLint flag → `.transition("[translate,scale,rotate]")` or `"all"` |
| `Button()` cursor | ✗ needs call change | ESLint flag `Button()` w/o `.cursor("pointer")` |
| `.spaceX/Y()` selector | ✗ behavior only | ESLint warn → prefer `.flex().gap()` |

**For `breaking-changes.md`:** "Tailwind v4 support is opt-in via `setTailwindTarget('v4')`. Renames (`gradientTo`) and scale-shifts (`shadow`/`rounded`/`blur`) are remapped automatically to preserve your v3 appearance. Seven call-level changes (outline, ring, border, transition, button-cursor, space-x/y) are not auto-safe; run `eslint --fix` with `@fluent-html/tailwind: { target: 'v4' }` to apply the autofixable ones and surface the rest." Bundles with RFC-C-01/02 (extractor + pipeline) so adopters migrate once.

## Guidelines impact

Adoption note: today's index (`CLAUDE.md:159`) teaches `.outline("none")` *as the canonical focus pattern* — that exact example becomes an a11y bug on v4. The guideline isn't just missing a rule; it actively teaches the wrong one. Fix both the index snippet and the topic ref.

- **Index (`web-development/CLAUDE.md`)** — replace the focus line in the styling block + add a v4 sub-section.
- **Topic ref (`web-development/fluent-html.md`)** — add a "Tailwind v4 target" section with the full do/don't table.

### `web-development/CLAUDE.md`

Replace line 159 inside the `## Fluent Tailwind Styling` block:
```md
  .on("focus", t => t.ring("2").ringColor("blue-300").outlineHidden())
```

Append after the styling code block (after line 162):
```md

**Tailwind v4** — call `setTailwindTarget("v4")` once at app entry; the lib then emits v4 names. Renames/scale-shifts are automatic; these call-level changes are NOT:
```typescript
.outlineHidden()                          // ✓ v4 a11y-safe focus suppression
.outline("none")                          // ✗ v4: real outline:none — removes keyboard outline
.ring("3")                                // ✓ explicit 3px (old default look)
.ring()                                    // ✗ v4: bare ring = 1px currentColor, not 3px blue
.border().borderColor("gray-200")         // ✓ v4: bare border = currentColor, set it explicitly
Button("Save").cursor("pointer")          // ✓ v4 preflight no longer sets pointer
.transition("[translate,scale,rotate]")   // ✓ v4: animates movement (decomposed transforms)
.transition("transform")                  // ✗ v4: no longer animates translate/scale/rotate
.flex().gap("4")                          // ✓ prefer over .spaceY("4") — v4 selector changed
.gradientTo("to-r")                       // ✓ emits bg-linear-* under v4 (auto); + gradientRadial()/gradientConic()
```
```

### `web-development/fluent-html.md`

Insert after the `## Fluent Tailwind Styling` section (after line 113):
```md
## Tailwind v4 target

Set once at entry: `setTailwindTarget("v4")` (default `"v3"`). The lib, extractor (`{ target: "v4" }`), and ESLint plugin (`settings: { "@fluent-html/tailwind": { target: "v4" } }`) must agree.

**Automatic under v4** (no code change): `.gradientTo()` → `bg-linear-*`; `.shadow/.rounded/.blur` remapped to preserve the v3 look. Opt into the new small slot with `"xs"` (`.shadow("xs")`).

**Manual (ESLint-enforced):**
| ✗ v3 pattern | ✓ v4 pattern | why |
|---|---|---|
| `.outline("none")` | `.outlineHidden()` | v4 `outline-none` = real `outline:none`; `outline-hidden` keeps a11y outline |
| `.ring()` | `.ring("3")` | v4 bare ring = 1px currentColor, not 3px blue |
| `.border()` | `.border().borderColor("gray-200")` | v4 bare border = currentColor |
| `.transition("transform")` | `.transition("[translate,scale,rotate]")` | v4 decomposes transform; `transition-transform` no longer animates them |
| `Button()` | `Button().cursor("pointer")` | v4 preflight drops button `cursor:pointer` |
| `.spaceX/Y("n")` | `.flex().gap("n")` | v4 `space-*` selector changed (no `[hidden]` skip) |

New v4 gradient methods: `.gradientRadial()` → `bg-radial`, `.gradientConic()` → `bg-conic`; `.gradientTo("45")` → `bg-linear-45`.
```

## Guardrail check

- **§11.1 zero-deps:** pass — `setTailwindTarget` is a module-local boolean; no new lib dependency.
- **§11.2 ssr-only / hot path:** pass — one `getTailwindTarget()` (a module var read) per styled method; negligible, no async.
- **§11.3 escape-by-default:** N/A — emits class strings, no markup; existing escaping unchanged.
- **§11.4 type-safety:** pass — 2-member target union, dedicated `outlineHidden()`, additive literal slots; no new `any`/bare `string`.
- **§11.5 backward-compat:** pass-with-migration — `breaking: true`, gated behind opt-in `target: "v4"`, auto-remaps the safe cases, ESLint-fixes/flags the rest, one bundled `breaking-changes.md` entry.
- **§11.6 idioms:** pass — dedicated specialized methods over stringly overloads (`outlineHidden` not `outline("hidden")` ambiguity), `.on()`/`.at()` untouched.
- **§11.7 class-string contract:** pass — all three packages read the same `TailwindTarget`; Wave-4 `_merge` must confirm the target plumbs through extractor `ExtractorOptions.target` + ESLint `settings`.
- **§11.8 guideline-sync:** pass — Guidelines impact above covers every `api_surface` symbol: `setTailwindTarget`, the renamed/remapped methods (`gradientTo`/`gradientRadial`/`gradientConic`/`shadow`/`rounded`/`blur`/`outlineHidden`/`ring`/`transition`/`border`/`spaceX`/`spaceY`), the changed types, and `ExtractorOptions.target`.

## Alternatives considered

- **v4-only, drop v3 (hard major bump).** Simpler code (no branch), but instantly breaks `ttl`/`rideshare` and any other monorepo consumer with no opt-out. Rejected — the target flag protects existing consumers at trivial runtime cost.
- **Per-call target arg (`.shadow("sm", "v4")`).** Explicit but viral — every call site changes, defeating the "auto-remap preserves visuals" win. Rejected.
- **Pass-through literal (no remap): `.shadow("sm")` → `shadow-sm` on v4.** Honest but a guaranteed app-wide visual regression for migrators (recon §5 Q5). Rejected in favor of remap-to-preserve-look + opt-in `"xs"` for the new scale — least surprise, with an explicit path forward.
- **Remap via `outline("hidden")` overload instead of `outlineHidden()`.** Keeps one method but reintroduces the stringly trap and can't be linted as crisply. A dedicated method matches §11.6.

## Open questions

1. **Global vs scoped target.** A module-global `setTailwindTarget` assumes one Tailwind version per process — true for an SSR app, but a monorepo building two apps in one process couldn't differ. Acceptable now; if needed later, thread target through `createContext`. (Decision: ship global.)
2. **Should `Button()` ship `cursor-pointer` by default under v4?** F-C-082 floats it. Leaning no (breaks intentional `cursor:default`); keep it a guideline + ESLint rule. Confirm with a human.
3. **Default flip timing.** When does the default `target` become `"v4"`? Proposed: stays `"v3"` for all of v6.x, flips to `"v4"` in v7. Confirm with roadmap (Wave 4).
