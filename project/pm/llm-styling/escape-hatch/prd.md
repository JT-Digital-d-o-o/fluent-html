# Escape Hatch Closure

## Problem

Untyped class strings bypass every guarantee, silently. Audit (2026-07-31): **185 `addClass`/`setClass` sites** across demos (6), ttl (47), rideshare (54), mngmt (78) — ~65% are steering failures where a fluent method exists (apps pin pre-6.5 versions), only 5 are true vocab gaps, and ~13 are **dynamic args that the extractor records nothing for** (`extractDirectClasses` tracks literals only — no `unresolved` entry ⇒ classes can vanish from the production safelist with zero build signal). The lint rule policing this is warn-only and its hand table has drifted past exactly the methods that would have caught the demo leaks. Root cause: the README itself teaches `setClass("p-4 bg-white rounded-lg shadow")` as first-class API.

## Appetite

~1 week, v6.x non-breaking (new methods + lint + docs). Depends on vocab-generator's derived ESLint tables for the pattern sets.

## Solution

Design in [design.md](design.md):

- **Gap fills (5, ~80 LOC):** `appearance()`, `wrap()`, `content()` (unblocks `before:`/`after:`), `` `[&${string}]` `` arbitrary-selector arm on `.on()`, font-family theme tokens (`defineTheme` `fonts` family + close `TailwindFontFamily` behind `FluentCustomFontFamily` — also the prerequisite for canonical-names' `.font()` merge).
- **Typed escapes:** `.cssProp(property, value)` for arbitrary CSS (vocab `custom` row ⇒ inherits extractor unresolved tracking — non-literal args become build errors); `.cssClass(name)` as the greppable intent marker for legit non-Tailwind classes (JS/CSS hooks, third-party). Rule of thumb: static arbitrary → `.cssProp`; runtime-computed → `.setStyle`.
- **Lint, error-level:** `no-tailwind-in-raw-class` (prefix-anchored against the generated vocab set — catches unknown-but-Tailwind-shaped like `shadow-violet-500/40`), `no-dynamic-class-argument`, `no-tailwind-in-cssclass`. Error messages state the exact replacement chain inline (model-repair-optimal).
- **Docs purge same release:** README/examples stop teaching the leak; `addClass` marked `@internal`.

## Rabbit Holes

- Prefix-anchored matching, never a bare shape regex — `sidebar-backdrop`/`entry-row`/`hamburger-line` are Tailwind-shaped to a naive regex; false positives make teams disable the rule.
- Don't rename `addClass` — it is the internal emitter primitive every vocab method calls; `.cssClass`/`.cssProp` make hatch-reaching visible without a breaking rename.
- App migration (179 sites in ttl/rideshare/mngmt, mostly autofixable) happens when those repos bump — not this scope's blocker.

## No-Gos

- No config-file allowlists as the primary category-C mechanism — `.cssClass()` *is* the allowlist.
- No reopening open unions (`TailwindFontFamily` closes; it doesn't grow another `(string & {})`).
