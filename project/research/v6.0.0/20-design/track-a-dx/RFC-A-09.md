---
id: RFC-A-09
track: A
title: "Codebase consistency: type-only exports + variadic/fluent Overlay"
resolves: [F-A-094, F-A-023]
api_surface: ["Overlay()", "OverlayPosition", "export type { HTMX, HxSwap, HxSwapStyle, HxTrigger, HxEncoding, HxTarget, HxHttpMethod, HxSync, HxOptions, HxConfig, HxStatusConfig, HtmxGlobalConfig, HxResponseResult, HxLocationConfig, Id }"]
breaking: false
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md", "web-development/typescript.md"]
impact: medium
effort: S
depends_on: []
status: proposed
---

# RFC-A-09: Codebase consistency — type-only exports + variadic/fluent Overlay

## Problem

Two self-consistency defects in first-party library code. Neither changes runtime output; both undermine the guidelines' credibility ("the library does what it teaches") and one is a latent compile break for consumers.

**1. Type-only symbols are emitted in value-position `export { }` blocks** (F-A-094). `src/index.ts` re-exports 15 type-only declarations (interfaces + type aliases) inside value blocks, mixed with real runtime values:

- `OverlayPosition` (alias, `control/overlay.ts:4`) in the value block at `src/index.ts:249-252`.
- `HTMX` (interface, `htmx.ts:191`), `HxSwap`, `HxSwapStyle`, `HxTrigger`, `HxEncoding`, `HxTarget`, `HxHttpMethod`, `HxSync`, `HxOptions`, `HxConfig`, `HxStatusConfig` (all aliases) in the value block at `src/index.ts:268-289`.
- `HtmxGlobalConfig`, `HxResponseResult`, `HxLocationConfig` (alias + 2 interfaces) in `src/index.ts:292-306`.
- **`Id`** (interface, `ids.ts:23`) in the value block at `src/index.ts:309-316` — missed by the finding but the same defect.

The same file already does it right for `Context` (`:265`), `BehaviorMap` (`:332`), `RouteDef`/`RouteHxOptions`/`QueryParams`/… (`:323-329`), `ViewAlgebra`/… (`:351-360`). A consumer with `verbatimModuleSyntax: true` (the default in modern TS 5.x, Vite, Next.js scaffolds) who re-exports any of these gets:

```
TS1205: Re-exporting a type when 'verbatimModuleSyntax' is enabled requires using 'export type'.
```

Silent upgrade breakage; the most-used types (`HTMX`, `HxSwap`, `Id`) are the worst affected.

**2. `Overlay()` violates the library's own variadic + Tailwind rules** (F-A-023). The only built-in control shipping anti-patterns the guidelines forbid:

```ts
// src/control/overlay.ts:18-29 (today)
export function Overlay(content: View, overlay: View, position: OverlayPosition = 'center') {
  return Div([                                                                   // ✗ array wrapper
    content,
    Div(overlay).setStyle(`position: absolute; ${positionStyles[position]} z-index: 10`), // ✗ raw CSS
  ]).setStyle("position: relative");                                             // ✗ raw CSS
}
```

`positionStyles` (`overlay.ts:6-16`) is a raw inline-CSS table. Tailwind's JIT scanner can't see these classes, they aren't type-checked, and consumers can't override position with `.at("md", …)`. It also blocks Track-C's Tailwind-v4 migration, which would otherwise touch only fluent calls, not hand-written CSS strings.

## Proposed API

No signature changes — `Overlay`'s public type is identical. The contract is the *implementation* and the *export kind*.

```ts
// src/index.ts — split mixed blocks (values stay, types move to `export type`)
export { Overlay } from './control/index.js';
export type { OverlayPosition } from './control/index.js';

export { hx, resolveSelector, id, clss, closest, find, next, previous } from './htmx.js';
export type {
  HTMX, HxSwap, HxSwapStyle, HxTrigger, HxEncoding, HxTarget,
  HxHttpMethod, HxSync, HxOptions, HxConfig, HxStatusConfig,
} from './htmx.js';

export { OOB, withOOB, Partial, HtmxConfig, hxResponse, HxResponse } from './patterns.js';
export type { HtmxGlobalConfig, HxResponseResult, HxLocationConfig } from './patterns.js';

export { createId, defineIds, isId, extractId, extractSelector } from './ids.js';
export type { Id } from './ids.js';   // Id is an interface (ids.ts:23), not a value
```

Mirror the same split in `src/control/index.ts:23-26`:

```ts
export { Overlay } from "./overlay.js";
export type { OverlayPosition } from "./overlay.js";
```

`Overlay` itself — same signature, fluent body, position table as `.apply()`-compatible modifiers:

```ts
// src/control/overlay.ts
import type { View } from "../core/types.js";
import type { Tag } from "../core/tag.js";
import { Div } from "../elements/structural.js";

export type OverlayPosition =
  | 'top' | 'bottom' | 'top-left' | 'top-right'
  | 'bottom-left' | 'bottom-right' | 'left' | 'right' | 'center';

const positionClasses: Record<OverlayPosition, (t: Tag) => Tag> = {
  'top':          t => t.top("0").left("1/2").neg("translate-x-1/2"),
  'bottom':       t => t.bottom("0").left("1/2").neg("translate-x-1/2"),
  'top-left':     t => t.top("0").left("0"),
  'top-right':    t => t.top("0").right("0"),
  'bottom-left':  t => t.bottom("0").left("0"),
  'bottom-right': t => t.bottom("0").right("0"),
  'left':         t => t.top("1/2").left("0").neg("translate-y-1/2"),
  'right':        t => t.top("1/2").right("0").neg("translate-y-1/2"),
  'center':       t => t.top("1/2").left("1/2").neg("translate-x-1/2").neg("translate-y-1/2"),
};

export function Overlay(
  content: View,
  overlay: View,
  position: OverlayPosition = 'center',
): Tag {
  return Div(
    content,                                          // ✓ variadic children
    Div(overlay)
      .position("absolute").zIndex("10")             // ✓ fluent methods
      .apply(positionClasses[position]),             // ✓ fluent position table
  ).position("relative");
}
```

All methods used exist today: `position` (`tailwind-methods.ts:183`), `zIndex` (`:184`), `top`/`right`/`bottom`/`left` accept `TailwindInset` incl. `"1/2"` (`tailwind-types.ts:124`), `neg(cls)` → `-${cls}` (`tailwind-methods.ts:663`), `apply(...fns)` (`tag.ts:213`). Centering uses `-translate-x-1/2` via `.neg("translate-x-1/2")` — the canonical Tailwind class, JIT-scannable.

## Worked examples (before → after)

**Export hygiene — a consumer re-export (the breakage in F-A-094):**

```ts
// before — app barrel re-exporting library types under verbatimModuleSyntax
// app/src/ui/index.ts
export { Overlay, OverlayPosition } from "fluent-html";   // ✗ TS1205 on OverlayPosition
export { hx, HTMX, HxSwap } from "fluent-html";           // ✗ TS1205 on HTMX, HxSwap
```
```ts
// after — library splits its own blocks; the consumer's natural re-export now compiles,
// and the idiomatic consumer form is also type-correct:
export { Overlay } from "fluent-html";
export type { OverlayPosition, HTMX, HxSwap } from "fluent-html";
export { hx } from "fluent-html";
```

**`Overlay` rendered output is byte-equivalent in intent (F-A-023):**

```ts
// before (src/control/overlay.ts:23-28) → renders:
// <div style="position: relative"><…content…>
//   <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); z-index: 10">…</div></div>
Overlay(Img().setSrc("/card.png"), Span("NEW"), "top-right")
```
```ts
// after → renders Tailwind classes (JIT-scannable, type-checked, overridable):
// <div class="relative">…<div class="absolute z-10 top-0 right-0">…</div></div>
Overlay(Img().setSrc("/card.png"), Span("NEW"), "top-right")

// and now overridable per breakpoint, impossible with the old inline-style form:
Div(Overlay(content, badge, "center")).at("md", t => t /* container tweaks */)
```

## Type-safety story

- **Literal union preserved.** `OverlayPosition` stays a 9-member string-literal union; `position` arg rejects any other string at compile time. `positionClasses: Record<OverlayPosition, (t: Tag) => Tag>` is **exhaustive by construction** — adding a member to the union without a table entry is a compile error (the house exhaustiveness mechanism, typescript.md §Exhaustive Checks).
- **`export type` is a type-safety fix, not just style.** It makes the type/value boundary explicit so `isolatedModules`/`verbatimModuleSyntax` consumers compile, and lets bundlers fully elide these symbols (no accidental runtime import of a type).
- **Branded `Id` correctness.** `Id` (`ids.ts:23`) is an interface with a `__idBrand` `unique symbol`; exporting it as `export type` is the correct kind and keeps the brand intact for downstream re-export.
- No `any`, no widening, no new bare-`string` surface introduced.

## Migration & compatibility

**Additive / non-breaking — nothing breaks.**

- Export split: `export type { X }` and `export { X }` are *interchangeable for type-only `X`* at every call site that imports `X` as a type. Existing `import { HTMX } from "fluent-html"` keeps working; `import type { HTMX }` keeps working. Only **previously-erroring** consumer re-exports start to compile. No symbol is removed or renamed.
- `Overlay`: signature, argument order, defaults, and return type (`Tag`) unchanged. Output changes from inline `style="…"` to equivalent Tailwind classes. Apps must have those utilities in their Tailwind build — they do (`relative`, `absolute`, `z-10`, `top-0`, `left-1/2`, `-translate-x-1/2`, … are core utilities; the app already depends on Tailwind per stack).
- **Codemod:** none required. (Optional consumer-side: an ESLint rule `import/consistent-type-specifier-style` already flags the old re-exports.)
- `breaking-changes.md`: no entry — this ships inside the v6 major as a consistency cleanup, fully backward-compatible.

**Track-C coupling (guardrail §11.7):** `Overlay` now emits a fixed, finite class set (`relative absolute z-10 top-0|1/2 bottom-0|1/2 left-0|1/2 right-0|1/2 -translate-x-1/2 -translate-y-1/2`). Wave-4 must confirm these are in the extractor/eslint class vocabulary — they are all standard core utilities, so no new vocabulary is introduced.

## Guidelines impact

Adds no *new* public surface (signatures unchanged) but **changes the recommended import/export pattern** and fixes an under-taught idiom (no current guideline says "re-export library types with `export type`"). Per §11.8, patch the index + two topic refs.

### Index — `web-development/CLAUDE.md`

Add under the existing **TypeScript** pointer area (one-line rule + ✓/✗):

```md
**Type-only imports/exports** — library types (`HTMX`, `HxSwap`, `OverlayPosition`, `Id`, `View`, `Tailwind*`) are type-only; import/re-export them with `type`:

\```typescript
import type { HTMX, View } from "fluent-html";   // ✓
export type { OverlayPosition } from "fluent-html"; // ✓ re-export from a barrel
import { HTMX } from "fluent-html";              // ✗ TS1205 under verbatimModuleSyntax
\```
```

### Topic ref — `web-development/typescript.md`

Append a section (after `## Custom Type Guards` / before `## Generics`):

```md
## `import type` / `export type`

Projects run `verbatimModuleSyntax`. Import/re-export every type-only symbol with the `type` keyword — bundlers elide it and re-exports don't break.

\```typescript
import type { HTMX, HxSwap, View, Id } from "fluent-html";   // ✓ type-only
import { hx, defineRoutes } from "fluent-html";              // ✓ runtime values

// barrels: split values from types
export { Overlay } from "fluent-html";                       // ✓ value
export type { OverlayPosition } from "fluent-html";          // ✓ type
export { OverlayPosition } from "fluent-html";               // ✗ TS1205
\```

Rule of thumb: anything ending in a `*Tag` class, a factory (`Div`, `Button`), `hx`, `defineRoutes`, `defineIds`, `createId` is a value. Everything else exported from `fluent-html` (interfaces, unions, `Tailwind*`, `Hx*`, `OverlayPosition`, `Id`) is type-only.
```

### Topic ref — `web-development/fluent-html.md`

`Overlay` is currently undocumented. Add a short subsection under `## Control Flow` (after the `Repeat(3, …)` block), teaching the fluent-overridable form:

```md
**`Overlay(content, overlay, position?)`** — positioned overlay; emits Tailwind classes, override with `.at()`:

\```typescript
Overlay(Img().setSrc(src), Badge("NEW"), "top-right")   // position: 9-member union, default "center"
// container is `relative`; overlay is `absolute z-10` + position utilities — no inline styles
\```
```

And fix the `## Types` import example to include the now-type-only HTMX/Id symbols:

```md
\```typescript
import type { View, HTMX, HxSwap, Id, OverlayPosition } from "fluent-html";
import type { TailwindPosition, TailwindTextAlign, TailwindFlexDirection } from "fluent-html";
\```
```

**Adoption note:** the old guidelines never stated library types are type-only, so apps wrote `import { HTMX }` / value-block re-exports that silently compiled until `verbatimModuleSyntax` was turned on. The new rule makes the value/type split explicit and matches what the library now exports.

## Guardrail check

- §11.1 zero-deps: pass — no new dependency; pure source edit.
- §11.2 ssr-only/fast: pass — synchronous render path untouched; `Overlay` emits fewer/cleaner attrs.
- §11.3 escape-by-default: pass — no new markup-emitting API; `Div`/`.position` go through the existing escaped render path; no `Raw`.
- §11.4 type-safety: pass — literal union + exhaustive `Record`; `export type` corrects the type/value boundary; `Id` brand preserved.
- §11.5 backward-compat: pass — additive/non-breaking; no codemod; no `breaking-changes.md` entry.
- §11.6 idiom-consistency: pass — variadic children, fluent `.position()/.zIndex()/.top()`, `.apply()` table, `export type`; removes the lone `.setStyle()`/`Div([])` offender.
- §11.7 class-string contract: pass with Wave-4 confirm — only standard core utilities emitted; no new vocabulary; flagged for the extractor/eslint merge.
- §11.8 guideline-sync: pass — `## Guidelines impact` covers every `api_surface` symbol: `Overlay`/`OverlayPosition` (fluent-html.md), all `Hx*`/`HTMX`/`Id`/`OverlayPosition` type-only export rule (CLAUDE.md + typescript.md).

## Alternatives considered

- **Leave exports as-is, document "use `import type`" only.** Rejected — doesn't fix consumer *re-exports* (TS1205 fires regardless of how the consumer wrote the import); the library staying internally inconsistent (`Context` right, `HTMX` wrong) is the actual defect.
- **Add `position`/`top`/`left` setters that take pixels and keep inline styles.** Rejected — perpetuates non-Tailwind output, unscannable by JIT, blocks `.at()` overrides and Track-C.
- **Pass position via a new `OverlayPositionTag` subclass.** Over-engineered for a 9-value lookup; `.apply()` modifier table is the idiomatic mechanism (architecture §4.4) and keeps the signature stable.
- **`translate("x", "-1/2")` instead of `.neg("translate-x-1/2")`.** Rejected — emits `translate-x-[-1/2]`, a non-canonical arbitrary value; `.neg()` emits the real `-translate-x-1/2` utility.

## Open questions

- Should `OverlayPosition` (and the other newly-`export type` symbols) also be added to the `fluent-html.md` `## Types` block as a maintained inventory, or is the rule-of-thumb in typescript.md enough? (Leaning: rule-of-thumb; a hand-maintained list rots.)
- Do we want a deprecation-free codemod for consumers who *did* write value-block re-exports of these types, or rely on their existing ESLint `consistent-type-specifier-style`? (Leaning: rely on ESLint — the split is source-compatible.)
