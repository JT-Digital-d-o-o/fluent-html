# Vocab Generator — Design

Worked-out approach from the 2026-07-31 spike (spike scripts were session-ephemeral; key facts captured here).

## Upstream API (proven against tailwindcss 4.3.3)

- `__unstable__loadDesignSystem(css)` loads with `@import "tailwindcss"` + a ~10-line `loadStylesheet` resolver for Tailwind's own CSS imports.
- `getClassList()` → 23,286 `[className, { modifiers }]` entries (flat). `getVariants()` → 88 variants with `{ name, isArbitrary, hasDash, values }`.
- `design.utilities.keys()` → 315 functional + 890 static roots (the registry view — use this, not the flat list).
- `design.parseCandidate(cls)` → `{ kind, root, value: { kind, value, dataType }, modifier, variants }`.
- `design.candidatesToCss([cls])` → `null` for invalid candidates ⇒ **per-class validity oracle**.
- `design.theme.namespace("--color")` → 288 keys; theme-key linkage for token-valued unions.
- Fluent-only knowledge Tailwind cannot supply (stays hand-curated): unit overloads, `DIR_MAP`, `signNeg`, `group/peer` name markers, `htmxIndicator`, method naming, JSDoc, deliberate exclusions.

## Source-of-truth schema (extend `UtilityDef`)

```
values?: { kind: "theme"; ns: "--color" | "--spacing" | … }
       | { kind: "literals"; list: readonly string[] }
       | { kind: "typeRef"; name: string }          // transition period
doc?: string                                          // JSDoc for generated signatures
```

`valueType` per row is also what object-variants and (if adopted) tl-sink generate from — shared deliverable.

## Emitters

1. **Types** → `src/core/tailwind-types.gen.ts` (committed); imports hand-written `tailwind-types.seams.ts` holding `FluentCustom*` interfaces + `ThemeKeys`. Seam arms emitted verbatim: `| (keyof FluentCustomColors & string) | `[${string}]``. defineTheme augmentation is untouched.
2. **ESLint tables** → plugin takes `fluent-html` as peerDependency and derives `FIXABLE_PATTERNS`/`MODIFIER_MAP` at rule-load from `fluent-html/class-vocab` (~1ms once per lint run). `prefix` rows → prefix patterns; `spacing` rows → 7 directional expansions; `static` rows → exact matches; longest-prefix-first ordering. ~50-LOC derivation + small residue table (text-alignment-style disambiguation). Deletes ~780 LOC.
3. **Extractor** — no change (already imports `fluent-html/class-vocab` at runtime).
4. **Methods** — NOT generated (see prd Rabbit Holes).

## CI

- Exact pin `"tailwindcss": "4.3.3"` (devDep, fluent-html only); generated headers record the version.
- Job 1 self-consistency: `npm run gen:vocab -- --check` → `git diff --exit-code`.
- Job 2 validity: every vocab sample + every generated union member × emit shape through `candidatesToCss`.
- Job 3 coverage watch: `utilities.keys()` minus vocab coverage minus ignore-list-with-reasons ⇒ new Tailwind roots fail the test until a row is added or consciously ignored.

## Known facts the tests must reproduce

- `gradientConic` sample bug (`vocab.ts:225`, literal `"undefined"`) — job 2 catches it; fix ships with the oracle.
- Uncovered-roots backlog job 3 will report (from the spike): `size`, `basis`, `origin`, `indent`, `tab`, `align`, `content`, `contain`, `filter`, `backdrop-*`, `scrollbar-thumb/track`, logical `start`/`end`, bare `divide` color, `col`/`row` shorthands.
