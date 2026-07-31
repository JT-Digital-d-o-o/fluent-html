# Escape Hatch Closure — Tasks

### As a developer I want the last vocab gaps filled so that no styling need forces me off the typed surface

- [x] [P1] Add `appearance()`, `wrap()`, `content()` (+ zero-arg sugar) — types + vocab rows + methods (6.8.0; bare `.content()` → `content-['']`; coverage ignore-list entries retired; storage-field renames `MetaTag.content`→`contentValue`, `TextareaTag.wrap`→`wrapMode` to unshadow the new Tag methods)
- [x] [P1] Add the `` `[&${string}]` `` arbitrary-selector arm to `TailwindState` (`.on()`) — type-only; runtime/withVariant already passes prefixes through verbatim
- [x] [P1] Font-family theme tokens: `defineTheme` `fonts` family → `--font-*` CSS/manifest (extractor `theme.ts`, 2.1.0), close `TailwindFontFamily` behind `FluentCustomFontFamily` seam (exported through both barrels)
- [x] [P1] Write tests — per-method emission (`class-vocab.test.ts`) + lib-parity auto-rows + oracle args + `@ts-expect-error` on the closed font union (`type-surface.test-d.ts`, `define-theme.test.ts` fonts family) + `[&…]`/`before:content-['']` render tests (`fluent-styling-v2.ts`); lib 1933 green, extractor 47 green, plugin 283+12 green (regen → 636 patterns, 200 methods)
- [x] [P1] Check for bugs (self-review: attr-entity escaping vs lib-parity — parity helper now compares DOM-decoded class values; schema alias tuples keep `content`/`wrap` attribute emission byte-identical)

### As a developer I want typed escapes for arbitrary CSS and non-Tailwind classes so that reaching outside the vocabulary is visible and build-tracked

- [ ] [P1] `.cssProp(property, value)` → `[prop:value]` as vocab `custom` row (inherits extractor unresolved tracking); generated `CssPropertyName` union
- [ ] [P1] `.cssClass(name)` intent marker; mark `addClass` `@internal` in docs surface
- [ ] [P1] Write tests — emission, variant composition under `.on()`, extractor `onUnresolved` build error on non-literal `.cssProp` arg
- [ ] [P1] Check for bugs

### As a maintainer I want CI-blocking lint on raw class strings so that leaks are loud errors carrying their own fix

- [ ] [P1] `no-tailwind-in-raw-class` (prefix-anchored via derived vocab tables; autofix from generated fix table; supersedes `no-known-modifiers-in-setclass`)
- [ ] [P1] `no-dynamic-class-argument` (addClass/setClass/cssClass non-literal args)
- [ ] [P1] `no-tailwind-in-cssclass` (inverse guard)
- [ ] [P1] Promote the rule set to `error` in the recommended config
- [ ] [P1] Write tests — rule fixtures incl. category-C false-positive guards (`sidebar-backdrop`, `entry-row`) and message-text assertions
- [ ] [P1] Check for bugs

### As a maintainer I want the docs to stop teaching the leak so that model authors never learn `setClass` styling

- [ ] [P1] Purge `setClass`/`addClass` styling examples from README + examples/ + FLUENT-STYLING.md; document `.cssProp`/`.cssClass`/`.setStyle` decision rule (static arbitrary / non-Tailwind / dynamic)
- [ ] [P1] Update guidelines surface (`guidelines/web-development/fluent-html.md` + CLAUDE.md) — replace escape-hatch string teaching (`.textSize("[13px]")`, `.opacity("[0.33]")`) with the `.cssProp`/`.cssClass`/`.setStyle` decision rule; purge any `setClass`/`addClass` styling mentions
- [ ] [P2] ~Autofix pass over fluent-html-demos' 6 leak sites (dogfood of the new rules)
- [ ] [P1] Check for bugs
