# Escape Hatch Closure — Tasks

### As a developer I want the last vocab gaps filled so that no styling need forces me off the typed surface

- [x] [P1] Add `appearance()`, `wrap()`, `content()` (+ zero-arg sugar) — types + vocab rows + methods (6.8.0; bare `.content()` → `content-['']`; coverage ignore-list entries retired; storage-field renames `MetaTag.content`→`contentValue`, `TextareaTag.wrap`→`wrapMode` to unshadow the new Tag methods)
- [x] [P1] Add the `` `[&${string}]` `` arbitrary-selector arm to `TailwindState` (`.on()`) — type-only; runtime/withVariant already passes prefixes through verbatim
- [x] [P1] Font-family theme tokens: `defineTheme` `fonts` family → `--font-*` CSS/manifest (extractor `theme.ts`, 2.1.0), close `TailwindFontFamily` behind `FluentCustomFontFamily` seam (exported through both barrels)
- [x] [P1] Write tests — per-method emission (`class-vocab.test.ts`) + lib-parity auto-rows + oracle args + `@ts-expect-error` on the closed font union (`type-surface.test-d.ts`, `define-theme.test.ts` fonts family) + `[&…]`/`before:content-['']` render tests (`fluent-styling-v2.ts`); lib 1933 green, extractor 47 green, plugin 283+12 green (regen → 636 patterns, 200 methods)
- [x] [P1] Check for bugs (self-review: attr-entity escaping vs lib-parity — parity helper now compares DOM-decoded class values; schema alias tuples keep `content`/`wrap` attribute emission byte-identical)

### As a developer I want typed escapes for arbitrary CSS and non-Tailwind classes so that reaching outside the vocabulary is visible and build-tracked

- [x] [P1] `.cssProp(property, value)` → `[prop:value]` as vocab `custom` row (inherits extractor unresolved tracking with ZERO extractor code changes); generated `CssPropertyName` union — new emitter `scripts/gen-vocab/emit-css-props.ts` parses `CSSStyleDeclaration` from the installed TS `lib.dom.d.ts` (435 kebab names + `--${string}` arm; lib compiles without DOM so type-level derivation was out), `gen-vocab.ts` now multi-artifact `--check`
- [x] [P1] `.cssClass(name)` intent marker (verbatim append, deliberately NOT a vocab row); `addClass` JSDoc'd `@internal` with the decision rule (cssProp / cssClass / setStyle)
- [x] [P1] Write tests — emission + spaces→`_` (`class-vocab.test.ts`, oracle-validated samples incl. custom property), variant composition (`fluent-styling-v2.ts` hover/at), `CssPropertyName` typo + camelCase rejection (`type-surface.test-d.ts`), gen pin + kebab/dedup invariants (`gen-types.test.ts`); extractor: literal extraction, variant prefix, unresolved scan + `onUnresolved:"error"` throw (`extract.test.ts`, `safelist.test.ts`) — lib 1942 green, extractor 51 green
- [x] [P1] Check for bugs (verified sanitizer passes `[border:1px_solid_red]` / `hover:[scale:1.02]` through to emitted safelist CSS end-to-end)

### As a maintainer I want CI-blocking lint on raw class strings so that leaks are loud errors carrying their own fix

- [x] [P1] `no-tailwind-in-raw-class` (plugin 3.0.0; prefix-anchored: derived tables + generated `TAILWIND_ROOTS` (1073 roots from the lib's pinned design system, new gen artifact); bracket-aware variant split; whole-call autofix to fluent chains incl. `.on()`/`.at()` folding for nested variants; supersedes `no-known-modifiers-in-setclass` — old rule deprecated via `replacedBy`, kept registered)
- [x] [P1] `no-dynamic-class-argument` (addClass/setClass/cssClass non-literal args; interpolation-free template literals allowed; `setClasses` deliberately excluded — it is the sanctioned conditional-array form)
- [x] [P1] `no-tailwind-in-cssclass` (inverse guard, autofixes mis-filed utilities back to the typed surface)
- [x] [P1] Promote the rule set to `error` in the recommended config (shared analyzer `src/tailwind-token.ts`)
- [x] [P1] Write tests — 35 new fixtures incl. category-C guards (`sidebar-backdrop`, `entry-row`, `hamburger-line`, bare `container`/`card`) and exact message-text assertions for the two design messages; 318 cases + derivation + drift green
- [x] [P1] Check for bugs (design's flagship autofix verified byte-exact: `"grid-cols-1 sm:grid-cols-2"` → `.gridCols("1").at("sm", t => t.gridCols("2"))`)

### As a maintainer I want the docs to stop teaching the leak so that model authors never learn `setClass` styling

- [x] [P1] Purge `setClass`/`addClass` styling examples from README + examples/ + FLUENT-STYLING.md; decision-rule table added to FLUENT-STYLING § Escape hatches (bracket arm / cssProp / cssClass / setStyle); README lint table updated to the 3.0.0 rule set; only surviving raw-string mention is the 🚨 negative example inside the lint section
- [x] [P1] Update guidelines surface (`guidelines/web-development/fluent-html.md` + both CLAUDE.md copies — fluent-html/CLAUDE.md and guidelines/web-development/CLAUDE.md) — escape-hatch string lines replaced with the 4-arm decision rule; universal-methods block now teaches `.cssClass`/`.cssProp` instead of `setClass`/`addClass`
- [ ] [P2] ~Autofix pass over fluent-html-demos' 6 leak sites — DEFERRED: demos pins fluent-html 5.11.0 (pre-v6 github hash); per PRD, app migration happens when the repo bumps, and `.cssClass()` needs ≥6.8.0
- [x] [P1] Check for bugs (final sweep grep over README/FLUENT-STYLING/examples: no surviving styling-through-strings teaching)
