---
id: RFC-C-05
track: C
title: Shared codegen for the class vocabulary — one source of truth across lib / extractor / ESLint
resolves: [F-C-042]
api_surface: ["@fluent-html/class-vocab (new package)", "defineUtility()", "classVocab (const)", "TailwindTarget", "Tag.prototype.* (codegen-derived emit prefixes)"]
breaking: false
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md"]
impact: high
effort: L
depends_on: []
status: proposed
---

# RFC-C-05: Shared codegen for the class vocabulary

## Problem

Every fluent method that maps to a Tailwind class is implemented **three times, independently**, with no compile-time link between the copies (F-C-042):

1. **lib runtime** — `fluent-html/src/core/tailwind-methods.ts:576`
2. **extractor** — `fluent-html-tailwind-extractor/src/index.ts:391` (`METHOD_PATTERNS`)
3. **ESLint auto-fix map** — `fluent-html-eslint-plugin/src/rules/no-known-modifiers-in-setclass.ts:384` (`FIXABLE_PATTERNS`)

```ts
// fluent-html/src/core/tailwind-methods.ts:576
p.gradientTo = function (direction: string) { return this.addClass(`bg-gradient-${direction}`); };

// fluent-html-tailwind-extractor/src/index.ts:391
{ methodName: "gradientTo", generateClass: (args) => args.length === 1 ? [`bg-gradient-${args[0]}`] : [] },

// fluent-html-eslint-plugin/src/rules/no-known-modifiers-in-setclass.ts:384
{ pattern: "bg-gradient-", methodName: "gradientTo" },
```

All three hard-code the **v3** prefix `bg-gradient-`. v4 renames it to `bg-linear-` (recon §2.2 / F-C-001). That is **three separate edits in three packages**, with no type that fails to compile if they disagree. The same triple-edit hits every v4 migration item: shadow scale shift (`shadow`→`shadow-xs`), `ring` default, `outline-none`/`outline-hidden`, `rounded`/`blur` scale (F-C-002, F-C-023). The recon doc names this directly: *"Three copies of the generation logic (methods, extractor, eslint map) must agree on the target."* (§4).

The failure mode is **silent**: lib emits `bg-linear-*`, extractor still feeds Tailwind `bg-gradient-*` (→ no CSS generated for the new class), ESLint still auto-fixes user code toward `bg-gradient-*` (→ actively writes dead classes). No TypeScript error crosses the package boundary because there is no shared type. This is the structural reason every Track-C migration RFC (C-01..C-04) is 3× the edits it should be, and the reason guardrail §11.7 (the class-string contract) is currently enforced only by human diligence.

## Proposed API

A new **zero-runtime-dependency, build-only** workspace package `@fluent-html/class-vocab` holds *one* declarative table. The three consumers derive their copies from it: the lib via a checked-in codegen step, the extractor and ESLint map via a generated module they import.

```ts
// @fluent-html/class-vocab/src/vocab.ts — the single source of truth

/** Which Tailwind major a prefix targets. Lets one entry carry both v3 and v4 names. */
export type TailwindTarget = "v3" | "v4";

/** How a method's call arguments map to class strings. Pure, deterministic, no Tag dependency. */
export type EmitShape =
  | { kind: "static"; class: string }                                 // .truncate() → "truncate"
  | { kind: "prefix"; prefix: string }                                // .background(c) → `${prefix}-${c}`
  | { kind: "bare-or-prefix"; bare: string; prefix: string }          // .shadow()/.shadow(v)
  | { kind: "directional"; prefix: string; dirMap: Record<string,string> } // .padding(dir,v)
  | { kind: "arbitrary-unit"; prefix: string }                        // .w("px",180) → `${prefix}-[180px]`
  | { kind: "custom"; id: string };                                   // escape hatch: hand-written in all 3

/** One utility, defined once. `emit` may differ per target to encode a v3→v4 rename in ONE place. */
export type UtilityDef = {
  /** fluent method name — the key the extractor & ESLint match on. */
  method: string;
  /** target → emit shape. A rename is a single edit here. */
  emit: Partial<Record<TailwindTarget, EmitShape>> & { v3: EmitShape };
  /** ESLint reverse-match prefix(es) for `setClass` detection; defaults to the emit prefix. */
  fixPrefix?: string | string[];
  /** exclude from one consumer (e.g. `position` emits the bare value, no fix mapping). */
  skip?: Array<"extractor" | "eslint">;
};

export const classVocab = [
  { method: "background",  emit: { v3: { kind: "prefix", prefix: "bg" } } },
  { method: "shadow",      emit: { v3: { kind: "bare-or-prefix", bare: "shadow",       prefix: "shadow" } } },
  { method: "gradientTo",  emit: { v3: { kind: "prefix", prefix: "bg-gradient" },
                                    v4: { kind: "prefix", prefix: "bg-linear" } } },   // ← rename, ONE edit
  { method: "padding",     emit: { v3: { kind: "directional", prefix: "p", dirMap: DIR_MAP } } },
  { method: "w",           emit: { v3: { kind: "arbitrary-unit", prefix: "w" } } },
  // …one row per utility (≈120), replacing today's three hand-maintained lists
] as const satisfies readonly UtilityDef[];

/** Resolve a method+args to its class strings for a given target. Used by extractor + tests. */
export function emitClasses(def: UtilityDef, args: readonly string[], target: TailwindTarget): string[];

/** Author-facing helper for the few `kind:"custom"` rows that can't be table-driven. */
export function defineUtility(def: UtilityDef): UtilityDef;
```

Codegen (`@fluent-html/class-vocab/codegen.ts`, run in each package's `prebuild`) emits:

```ts
// → fluent-html-tailwind-extractor/src/method-patterns.generated.ts  (replaces METHOD_PATTERNS by hand)
export const METHOD_PATTERNS = buildMethodPatterns(classVocab, TARGET);   // TARGET from build env, default "v4"

// → fluent-html-eslint-plugin/src/fixable-patterns.generated.ts        (replaces FIXABLE_PATTERNS by hand)
export const FIXABLE_PATTERNS = buildFixablePatterns(classVocab, TARGET);

// lib: tailwind-methods.ts keeps its hand-written one-liners (they're trivial), but imports prefixes:
import { prefixOf } from "@fluent-html/class-vocab";
p.gradientTo = function (d: string) { return this.addClass(`${prefixOf("gradientTo")}-${d}`); };
```

A **drift test** (CI, in all three packages) asserts the three derived tables are byte-identical to a freshly generated copy — guardrail §11.7 becomes a failing test, not a code-review hope:

```ts
// fluent-html/test/class-vocab-drift.test.ts
test("lib emit matches vocab", () => {
  for (const def of classVocab)
    assert.deepEqual(emitClasses(def, sample(def), TARGET), liveEmit(def.method, sample(def)));
});
```

## Worked examples (before → after)

**Scenario:** apply the v4 gradient rename `bg-gradient-*` → `bg-linear-*` (F-C-001).

```ts
// before (today) — THREE edits, no link between them, silent if one is missed:

// 1. fluent-html/src/core/tailwind-methods.ts:576
p.gradientTo = function (direction: string) { return this.addClass(`bg-gradient-${direction}`); };
//                                                                    ^ change to bg-linear-

// 2. fluent-html-tailwind-extractor/src/index.ts:391
{ methodName: "gradientTo", generateClass: (args) => args.length === 1 ? [`bg-gradient-${args[0]}`] : [] },
//                                                                          ^ change to bg-linear-

// 3. fluent-html-eslint-plugin/src/rules/no-known-modifiers-in-setclass.ts:384
{ pattern: "bg-gradient-", methodName: "gradientTo" },
//          ^ change to bg-linear-
```

```ts
// after (with this RFC) — ONE edit; extractor + ESLint regenerate, drift test guards the rest:

// @fluent-html/class-vocab/src/vocab.ts
{ method: "gradientTo", emit: { v3: { kind: "prefix", prefix: "bg-gradient" },
                                v4: { kind: "prefix", prefix: "bg-linear" } } },
//                                                            ^ the only edit a v4 rename needs
```

Same one-edit story for the scale shifts grounded in the cited triple-edit sites of F-C-042 — `shadow` (`tailwind-methods.ts:451` / `index.ts:289` / eslint L222), `rounded` (`:442` / `:266` / L212), `ring` (`:533` / `:297` / L285), `outline` (`:568` / `:283` / L343): each collapses from three edits to one `emit.v4` line.

## Type-safety story

- **`as const satisfies readonly UtilityDef[]`** on `classVocab` — every row is checked against the discriminated `EmitShape` union at author time. A typo in `kind` or a missing `prefix` is a compile error in the *one* place it lives, instead of a runtime no-op replicated across three packages.
- **`emit.v3` required, `v4`/others optional** (`{ v3: EmitShape } & Partial<Record<…>>`) — guarantees every utility has a baseline target; a rename is expressed by *adding* a `v4` key, never by silently diverging.
- **Discriminated `EmitShape`** replaces three ad-hoc `(args: string[]) => string[]` closures with one narrowable union — `emitClasses` switches on `kind` exhaustively (`assertNever`), so a new shape can't be half-implemented.
- **`TailwindTarget` literal union** (`"v3" | "v4"`) threads the dual-target decision (recon §5 Q1) through one type instead of scattered booleans; the codegen reads `TARGET` once.
- **Branded generated modules** — `.generated.ts` files carry a `// AUTOGENERATED — do not edit` banner and are git-tracked; the drift test makes a hand-edit a red CI, closing guardrail §11.7 with a type+test instead of prose.

## Migration & compatibility

**Additive — nothing in app code breaks.** This is an internal refactor of how the three packages stay in sync; the *emitted class strings are byte-identical* to today (the drift test proves it on first commit, `TARGET="v3"`). No fluent method signature changes, no app touches `@fluent-html/class-vocab`.

- **Lib:** `tailwind-methods.ts` one-liners keep their shape; they import `prefixOf()` for renamable prefixes. No `dependencies` added to the published `fluent-html` package — `@fluent-html/class-vocab` is consumed at build time and its constants are inlined/tree-shaken; it ships as a `devDependency` of the lib and a real dep only of the build-time codegen. Guardrail §11.1 holds.
- **Extractor / ESLint:** `METHOD_PATTERNS` / `FIXABLE_PATTERNS` become generated files; the hand-maintained arrays are deleted. Existing tests (`extractor/src/index.test.ts`) pass unchanged.
- **Codemod:** none needed for adopters. For maintainers, a one-time script ports today's three lists into `classVocab` rows (mechanical; the lists are already structured).
- **`breaking-changes.md`:** no entry — additive. It *unblocks* the v4 renames (C-01..C-04), which carry their own breaking notes; this RFC is their prerequisite, not itself breaking.

## Guidelines impact

This RFC adds a maintainer-facing package, but the app-author-visible rule is: **the class vocabulary is single-sourced; never hand-add a method↔class mapping in only one place, and `addClass` escape hatches now have a documented cost (they bypass the vocab → no extractor/ESLint coverage).** That reinforces an existing under-taught rule.

- **Index (`web-development/CLAUDE.md`):** add a single ✓/✗ rule under `## Tailwind CSS`.

```md
## Tailwind CSS

- **No dynamic class interpolation** — Tailwind purging removes dynamically-generated classes. Always use full class names.
- **Fluent methods only — `addClass`/`setClass` bypass the class vocabulary** (no extractor scan, no ESLint fix). Use the typed method; if a utility is missing, it's a one-line add to the shared `class-vocab` table, not a raw string.

```typescript
Button("Save").background("blue-500").rounded("lg").shadow("md")   // ✓ typed, extracted, lint-aware
Button("Save").addClass("bg-blue-500 rounded-lg shadow-md")       // ✗ invisible to extractor + ESLint
```
```

- **Topic ref (`web-development/fluent-html.md`):** extend the `## Fluent Tailwind Styling` note with the single-source-of-truth fact + why renames are safe.

```md
## Fluent Tailwind Styling

> Use fluent methods (not `setClass`) for type safety + IDE autocomplete. `.on()` for pseudo-classes, `.at()` for breakpoints. All methods are strictly typed — check the library's TypeScript definitions for the full API.

> **One source of truth.** Method↔class mappings live once in the shared `class-vocab` table; the lib runtime, the Tailwind extractor, and the ESLint auto-fix map are generated from it. A Tailwind rename (e.g. v3 `bg-gradient-*` → v4 `bg-linear-*`) is a **one-line edit**, not three. Consequence for app code: prefer the fluent method — `addClass("bg-linear-to-r")` is invisible to the extractor (Tailwind may generate no CSS for it) and to ESLint.

✗ `Div().addClass("bg-gradient-to-r from-blue-500 to-cyan-500")`   // raw, unextracted, v3 name rots silently
✓ `Div().gradientTo("to-r").from("blue-500").to("cyan-500")`        // typed; emits the active target's name
```

- **Adoption note:** the existing index rule taught only "no *dynamic* interpolation," which apps read as "static `addClass` strings are fine." They aren't — static raw strings still bypass the extractor and the ESLint fixer, and they freeze a Tailwind version name into source where a vocab-driven method would track the target. This RFC makes that cost concrete and gives the guideline a reason ("single source of truth") apps can act on.

## Guardrail check

- **§11.1 zero-deps:** pass — `@fluent-html/class-vocab` is build-time/dev only; published `fluent-html` gains no runtime `dependencies`.
- **§11.2 ssr-only / hot path:** pass — codegen runs at build; runtime emit is the same `addClass` one-liners, no per-render cost.
- **§11.3 escape-by-default:** N/A — no markup emission changes; class strings only.
- **§11.4 type-safety:** pass — discriminated `EmitShape`, `as const satisfies`, required `v3` target, literal `TailwindTarget`.
- **§11.5 backward-compat:** pass — additive; drift test proves byte-identical output on day one.
- **§11.6 idioms:** pass — keeps variadic/`.on()`/`.at()` surface untouched; only the *maintenance* layer changes.
- **§11.7 class-string contract:** pass — this RFC **is** the mechanization of §11.7: three packages now derive from one table, enforced by a CI drift test.
- **§11.8 guideline-sync:** pass — Guidelines impact above covers the app-visible surface (the `addClass`-bypasses-vocab rule + single-source-of-truth note); the internal `defineUtility`/`classVocab`/`TailwindTarget` symbols are maintainer-only and documented in the package README, not the app guideline.

## Alternatives considered

- **Leave it as three hand-maintained lists (status quo).** Rejected: F-C-042 shows the triple-edit is the root cost of all Track-C work and the renames land silently-wrong when one copy is missed.
- **Generate everything including the lib runtime methods.** Rejected: the lib one-liners are trivial and benefit from being hand-readable/debuggable; only the *prefix* needs single-sourcing, so the lib imports `prefixOf()` rather than being fully generated. Keeps the hot path transparent.
- **Make the extractor parse the lib's TS AST as the source of truth (no separate table).** Rejected: couples the build-only extractor to the lib's internals, can't carry per-target (v3/v4) variants, and the lib's runtime closures aren't statically analyzable for `kind:"custom"` cases.
- **Runtime-shared module imported by all three at runtime.** Rejected: would add a runtime dependency to the published lib (violates §11.1) for zero runtime benefit — the vocab is static.

## Open questions

1. **Package boundary:** standalone `@fluent-html/class-vocab` workspace package vs. a `src/class-vocab/` dir inside the lib that the extractor/ESLint import across the monorepo. Standalone is cleaner for versioning the three consumers together; in-lib is fewer moving parts. (Leaning standalone, monorepo-internal, unpublished.)
2. **`TARGET` default & dual-target:** does codegen default `TARGET="v4"` (v6 is a major) and offer `"v3"` for laggards, or ship both generated sets behind a flag? Ties to recon §5 Q1 (cross-track decision with the v3/v4 strategy RFC).
3. **`kind:"custom"` escape hatch:** a handful of methods (`position`, `display` emit the bare value) don't fit a prefix shape. Confirm the `skip`/`custom` mechanism covers them without re-introducing per-package divergence for those rows.
