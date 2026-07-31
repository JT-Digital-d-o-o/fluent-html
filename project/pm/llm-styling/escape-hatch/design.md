# Escape Hatch Closure — Design

From the 2026-07-31 audit (agent reports were session-ephemeral; load-bearing facts captured here).

## Audit table

| Repo | Total | A: method exists | B: vocab gap | C: legit non-Tailwind | D: dynamic |
|---|---|---|---|---|---|
| fluent-html-demos | 6 | 5 | 0 | 1 | 0 |
| ttl | 47 | 37 | 2 | 8 | 0 |
| rideshare | 54 | 10 | ~19 | ~20 | 5 |
| mngmt | 78 | ~45 | 5 | ~15 | ~13 |
| fluent-html docs | ~18 blocks | ~8 (docs teach the leak) | 0 | ~10 | — |

Category D is the safelist hazard: `extractDirectClasses` (extractor `extract.ts:158-166`) matches string literals only and records no `unresolved` for non-literal args — silent prod style loss. (Partial mitigation exists: `extractDefaultClasses` raw-text-scans files, so same-file ternary literals usually survive; cross-file/composed strings don't.)

## Gap fill-list (complete, vs v6.5.0)

| Method | Signature | Emits |
|---|---|---|
| `appearance` | `("none" \| "auto")` | `appearance-{v}` |
| `wrap` | `("break-word" \| "anywhere" \| "normal")` | `wrap-{v}` (v4 overflow-wrap) |
| `content` | `("none" \| `[${string}]`)` + zero-arg → `content-['']` | `content-{v}` |
| `.on()` arm | add `` `[&${string}]` `` to `TailwindPseudoClass` | prefix pass-through (extractor already handles verbatim first-arg) |
| font tokens | `defineTheme({ fonts })` → `--font-*`; `TailwindFontFamily = "sans"\|"serif"\|"mono"\|(keyof FluentCustomFontFamily & string)\|`[${string}]`` | `font-{token}` |

## Typed escapes

- `.cssProp(property: CssPropertyName, value: string)` → `[{prop}:{value}]` (spaces→`_`). Property union generated (~350 kebab names); value open by nature. Vocab `custom` row ⇒ `scanMethod` unresolved tracking ⇒ `onUnresolved: "error"` catches non-literal args at build. Variant-composable under `.on()`/variant objects. Extractor bracket handling already sufficient (`SAFE_TOKEN` admits `[ ] : # ( )`).
- `.cssClass(name: string)` → appends verbatim; semantic marker for non-Tailwind classes. ~8 LOC.

## Lint rules (all `error` in recommended)

1. `no-tailwind-in-raw-class` (supersedes `no-known-modifiers-in-setclass`): per whitespace token in `addClass`/`setClass` literals — strip variant prefixes (colon-split, bracket-aware), flag if token ∈ generated static set, OR starts with a generated vocab prefix, OR has a known-variant colon head / `[&…]`, OR matches `/^-?[a-z][a-z0-9]*(-(?:[a-z0-9./]+|\[[^\]]+\]))+$/` **and** root ∈ Tailwind root list. Autofix from the derived fix table where mappable.
2. `no-dynamic-class-argument`: non-literal arg to `addClass`/`setClass`/`cssClass` is an error; message routes to `.when()`/`Match` literal branches or `staticManifest`.
3. `no-tailwind-in-cssclass`: Tailwind-shaped token inside `.cssClass()` is an error (keeps the sanctioned hatch clean).

Error-message style (state the fix inline), e.g.:
`'grid-cols-1 sm:grid-cols-2' in .addClass() bypasses the typed surface. Replace with: .gridCols("1").at("sm", t => t.gridCols("2")). [autofix]`
`.addClass(colors) is invisible to the safelist extractor — styles can silently disappear in production. Use .when(...) with literal branches or defineTheme staticManifest.`

## Repair-path invariant

Every dead end emits a signpost: fluent typo → closed-union TS error; raw-string leak → lint error naming the replacement; genuine gap → message routes to `.cssProp()`; dynamic → routes to `.when()`/`staticManifest`; non-literal `.cssProp` arg → extractor build error naming file+method+arg.
