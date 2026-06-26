---
id: RFC-A-004
track: A
title: Extractor ↔ eslint class-vocab integrity — kill spurious classes, derive UNITS, add reverse parity guard
resolves: [F-A-160, F-A-161, F-A-162, F-A-163]
api_surface: []
breaking: false
ships_to: 6.0.1
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, additive-only, instruction-set, class-vocab-sync, guideline-sync]
guideline_updates: []
impact: high
effort: M
depends_on: []
status: proposed
---

# RFC-A-004: Extractor ↔ eslint class-vocab integrity

## Problem

The class-string contract (C-05: `classVocab` is the single source of truth, the
extractor and eslint plugin are generated/derived from it) has four integrity
holes that all surface as **wrong Tailwind safelists or false-clean drift tests**.
None touch the core lib's runtime; all live in the tooling + test layer.

**F-A-160 — extractor over-emits spurious classes for nested `.on()/.at()`.**
`extractVariantClasses` scans the *entire* variant body for every vocab method,
then recurses into nested variants — but it never strips the nested body first.
A class inside an inner `.on(...)` is therefore emitted **twice**: once with the
correct nested prefix (via the recursion) and once with only the outer prefix
(via the parent's full-body scan).

```ts
// fluent-html-tailwind-extractor/src/extract.ts:143-147
for (const def of classVocab) {
  for (const cls of scanMethod(body, def.method).classes) classes.push(`${prefix}:${cls}`);
}
for (const cls of extractDirectClasses(body)) classes.push(`${prefix}:${cls}`);
classes.push(...extractVariantClasses(body, prefix));
```

Worse, `scanInternal` *also* runs the top-level `scanMethod` over the whole
stripped source (extract.ts:178-182), so every vocab call that lives **inside**
a variant callback is caught a *third* time with **no prefix at all** — emitting
a bare `bg-blue-600` for a class the author only ever wrote as `hover:bg-blue-600`.
The test (extract.test.ts:34) only asserts the *correct* class is present; it
never asserts the spurious ones are absent, so this ships green.

**F-A-161 — `extractDefaultClasses` swallows whole call expressions.**

```ts
// extract.ts:159
return content.match(/[:\w\-/.@#[\]]+(?:\([^)]*\))?/g) ?? [];
```

The trailing `(?:\([^)]*\))?` is meant to catch Tailwind arbitrary-value
*functions* like `bg-[url(/x.png)]`, but the head `[:\w\-/.@#[\]]+` matches any
bare identifier, so `setHtmx(userRoutes.list)` yields the garbage token
`setHtmx(userRoutes.list)` and `.padding("x"` yields `padding("x"`. On the full
`scan()` path (extract.ts:175) those land straight in the candidate set — junk in
the safelist.

**F-A-162 — eslint hardcodes the CSS unit list.**

```ts
// fluent-html-eslint-plugin/src/rules/prefer-unit-overload.ts:11
const BRACKET_UNIT_RE = /^\[(-?\d+(?:\.\d+)?)(px|rem|em|%|vh|vw|dvh|svh|lvh)\]$/;
```

`UNIT_METHODS` is drift-guarded (vocab-drift.mjs:24), but the **units** are not.
The lib's `UNITS` (`src/class-vocab/types.ts:19`) is the source of truth; if a unit
is added there, the eslint rule silently stops auto-fixing it and nothing fails.
`gen-vocab.mjs` already reaches into the lib but never reads `UNITS`.

**F-A-163 — class-vocab parity is one-directional.**
`class-vocab.test.ts:123` iterates `classVocab` and asserts each method exists on
`Tag.prototype` and renders the vocab-emitted class. The reverse is unchecked: a
prototype method that calls `addClass("…")` but is **missing from `classVocab`**
(exactly the historical `htmxIndicator` situation — it lives in `htmx-methods.ts:44`,
outside `tailwind-methods.ts`, and was manually mirrored into the vocab at
`vocab.ts:252`) emits a class **no extractor will ever safelist**, and no test
catches it.

## Proposed API / fix

Pure tooling + test fixes. **No core public symbol added or changed**
(`api_surface: []`). One new *generated* export inside the eslint plugin's
`vocab.generated.ts` (already a generated, non-semver-public artifact).

### F-A-160 — strip nested bodies, scope the top-level scan

`extractVariantClasses` strips inner `.on/.at` bodies before scanning for vocab
methods at the current level (the recursion still handles them with the full
prefix). `scanInternal` excises every top-level variant body before its flat
vocab scan, so a call inside a callback is only ever counted by the variant pass.

```ts
/** Replace each top-level `.on(...)/.at(...)` body with whitespace, preserving offsets. */
function blankVariantBodies(content: string): string;

function extractVariantClasses(content: string, outerPrefix?: string): string[];
// unchanged signature; internally scans `blankVariantBodies(body)` for flat
// methods/direct classes, then recurses on the original `body`.

function scanInternal(
  content: string,
  file: string | undefined,
  includeDefaults: boolean,
): { classes: Set<string>; unresolved: UnresolvedCall[] };
// internally runs the flat vocab scan over `blankVariantBodies(stripped)`.
```

### F-A-161 — constrain the arbitrary-value suffix

The `(...)` suffix is only legal **inside** a bracketed arbitrary value
(`*-[fn(...)]`). Drop the unconditional trailing group; keep `()` only when it
sits inside `[...]`.

```ts
export function extractDefaultClasses(content: string): string[] {
  // class-shaped token; a (...) group is matched ONLY inside an arbitrary [...] value.
  return content.match(/[:\w\-/.@#]*\[[^\]]*\][:\w\-/.@#[\]]*|[:\w\-/.@#]+/g) ?? [];
}
```

`scan()` already classifies real fluent calls via `scanMethod` + `parseLiteralArgs`;
`extractDefaultClasses` only needs to recover *literal* class surfaces, so it must
never consume a `(`.

### F-A-162 — emit UNITS, build the regex from it, drift-guard it

`gen-vocab.mjs` reads `UNITS` from the lib and emits it; the rule builds its regex
from the generated constant; `vocab-drift.mjs` asserts it.

```ts
// vocab.generated.ts (generated)
export const VOCAB_UNITS: readonly string[]; // = [...UNITS] from fluent-html/class-vocab

// prefer-unit-overload.ts
import { UNIT_METHODS, VOCAB_UNITS } from "../vocab.generated";
const BRACKET_UNIT_RE = new RegExp(
  `^\\[(-?\\d+(?:\\.\\d+)?)(${VOCAB_UNITS.map(escapeRe).join("|")})\\]$`,
);
```

The lib already exports `UNITS` (`class-vocab/index.ts:8`), so `gen-vocab.mjs`
imports it from the same built module it already loads — no new lib export.

### F-A-163 — reverse parity guard (lib test)

A new test in `class-vocab.test.ts` statically scans the source of the files that
define class-emitting prototype methods, finds every `p.<m> = function` whose body
calls `this.addClass(...)` with a class-shaped literal, and asserts each `<m>` is
either in `classVocab` or on a tiny **structural allowlist** (the non-utility
class touchers: `setClass`, `addClass`, `on`, `at`, `apply`, `when`).

```ts
const STRUCTURAL: ReadonlySet<string> = new Set([
  "setClass", "addClass", "on", "at", "apply", "when",
]);

/** Prototype methods that emit a literal class but are missing from classVocab. */
function classEmittersMissingFromVocab(sources: string[]): string[];

// assertion: classEmittersMissingFromVocab([tailwindMethodsSrc, htmxMethodsSrc]) === []
```

This is the mirror of the existing forward loop and would have caught
`htmxIndicator` before it was hand-mirrored.

## Worked examples (before → after)

```ts
// F-A-160 — before (v6.0.0)
extractClasses('Button("x").on("hover", t => t.on("focus", t => t.background("red-500")))')
// → ["hover:focus:bg-red-500",   // correct (recursion)
//    "hover:bg-red-500",         // SPURIOUS (outer body re-scan)
//    "bg-red-500"]               // SPURIOUS (top-level flat scan)
```
```ts
// F-A-160 — after (this RFC)
// → ["hover:focus:bg-red-500"]   // exactly one
```

```ts
// F-A-161 — before (v6.0.0)
extractDefaultClasses('A("Home").setHtmx(routes.list).padding("x", "4")')
// → ["A", "setHtmx(routes.list)", "padding(", ...]   // call exprs swallowed
```
```ts
// F-A-161 — after (this RFC)
extractDefaultClasses('<div class="flex bg-[url(/x.png)]">')
// → ["div", "class", "flex", "bg-[url(/x.png)]"]      // arbitrary fn kept, calls dropped
```

```ts
// F-A-162 — before: add "cqw" to lib UNITS → rule silently stops fixing .w("[40cqw]")
// after: gen:vocab re-emits VOCAB_UNITS, regex covers cqw, vocab-drift fails until regenerated
```

```ts
// F-A-163 — before: new `p.tabular = function () { return this.addClass("tabular-nums"); }`
//   missing from classVocab → no safelist, ships green.
// after: reverse guard fails: `class emitters missing from classVocab: ["tabular"]`
```

## Type-safety story

Tooling-layer, but the contract still tightens:

- **F-A-162** replaces a hand-copied literal alternation with the lib's `UNITS`
  set — the unit token list becomes single-sourced, and the new `vocab-drift`
  assertion makes any divergence a CI failure, the same mechanism already pinning
  `UNIT_METHODS`.
- **F-A-163** makes "every class-emitting prototype method is in the typed
  `classVocab`" a *checked* invariant in both directions, so the extractor's
  `VOCAB_BY_METHOD` and the eslint plugin can keep assuming the vocab is total.
- No `string`-where-a-union-fits is introduced; `VOCAB_UNITS` is a `readonly
  string[]` projection of the same `ReadonlySet<string>` already in the lib.

## Compatibility & version

- **6.0.1 (patch):** All four are behavior/correctness fixes with **no public
  shape change** to the core lib. `api_surface: []`. The extractor now returns a
  *strict subset* of today's output (fewer, never-more classes) — strictly more
  correct, and a smaller safelist is always safe (an over-broad safelist only
  bloats CSS; we never drop a class that was genuinely emitted). `VOCAB_UNITS` is
  a new symbol **only in the eslint plugin's generated file**, not a lib export,
  and generated files are explicitly non-semver-public (see `gen-vocab.mjs`
  header). The lib gains one test; no runtime code changes.
- **6.1.0 (minor):** N/A — nothing additive to the public surface.
- **parked-major:** N/A — no break required.

## Guidelines impact

None — no public surface. These are extractor/eslint/test internals behind the
already-documented class-string contract; the authoring rules in
`web-development/fluent-html.md` (`.on()`/`.at()`, unit overloads) are unchanged
and already correct. No `guidelines/web-development/**` edit.

**Lib-own docs:** CHANGELOG only (no README/JSDoc public-surface change). Add under
a new `[6.0.1]` section:

```md
## [6.0.1] - Class-vocab integrity

### 🐛 Fixes (tooling)

- **Extractor:** no longer emits spurious un-prefixed / partial-prefix classes for
  nested `.on()`/`.at()` variants — a class written only as `hover:focus:bg-red-500`
  no longer also safelists `hover:bg-red-500` and `bg-red-500`.
- **Extractor:** `extractDefaultClasses` no longer swallows fluent call
  expressions (`setHtmx(routes.list)`) as class tokens; `(...)` is matched only
  inside an arbitrary `[...]` value.
- **ESLint `prefer-unit-overload`:** the CSS unit list is now generated from the
  library's `UNITS` (via `VOCAB_UNITS` in `vocab.generated.ts`) and drift-guarded,
  instead of being hardcoded in the rule.
- **Lib:** added a reverse class-vocab parity test — every class-emitting
  `Tag.prototype` method must appear in `classVocab` (catches a new emitter that
  forgets to register, as `htmxIndicator` once did).
```

(JSDoc touch-ups in `extract.ts` on `extractVariantClasses` / `extractDefaultClasses`
and in `prefer-unit-overload.ts` are internal comments, not public docs.)

## Guardrail check

- **zero-deps:** pass — no new runtime deps; tooling/test only.
- **ssr-only:** pass — no render hot-path change.
- **escape-by-default:** pass — no serialization change; safelist shrinks.
- **type-safety:** pass — single-sources `UNITS`, adds a checked total-vocab invariant.
- **additive-only:** pass — 6.0.1 behavior fix, `api_surface: []`, output is a strict subset.
- **instruction-set:** N/A — no new primitive/component; this is contract plumbing.
- **class-vocab-sync:** pass — this RFC *is* the lockstep mechanism; no new
  class-emitting method is added, and the new guards tighten the extractor↔eslint↔lib sync.
- **guideline-sync:** pass — `api_surface` is empty, `guideline_updates` is empty;
  CHANGELOG edit covers the only doc surface.

## Alternatives considered

- **F-A-160: AST-based extraction (ts-morph/typescript) instead of regex+paren
  matching.** Cleaner, but a heavy dep for the extractor and a much larger change
  than a 6.0.1 patch warrants; the existing `findMatchingParen` machinery already
  tracks balanced parens, so `blankVariantBodies` reuses it. Parked as a possible
  major-cycle refactor, not needed for correctness.
- **F-A-161: scan only literal class surfaces (HTML `class="…"`, template
  literals) and drop raw-TS scanning entirely.** More principled, but risks
  missing literal classes Tailwind-v4-style users still inline; constraining the
  regex is the minimal, behavior-preserving fix.
- **F-A-163: keep the forward-only test and rely on code review.** That is exactly
  what let `htmxIndicator` slip; a checked invariant is cheap and decisive.

## Open questions

- F-A-163's static scan must enumerate the source files that define class
  emitters (`tailwind-methods.ts`, `htmx-methods.ts`). Should the guard instead
  scan **all** of `src/core/*.ts` to be future-proof against a new file? Leaning
  yes (glob `src/core/*-methods.ts`), pending confirmation that no other core file
  legitimately calls `addClass` with a non-utility literal outside the structural
  allowlist.
