---
id: RFC-D-07
track: D
title: "Code-quality hardening: typed prototype writes, typed TagAttrs accessors, setStyles=replace convention, variadic Overlay, bench-in-CI"
resolves: [F-D-004, F-D-044, F-D-073, F-D-063, F-D-084, F-D-113]
api_surface:
  - "defineSchemaKeys(ctor, keys)"   # @internal helper, replaces 54 `as any`
  - "setDiscriminant(ctor, n)"        # @internal helper
  - "type RawCtx"                     # @internal render-dispatch union
  - "TagAttrs.get<T>(key)"            # PUBLIC fold accessor — typed, no cast
  # setStyle/setStyles unchanged (both replace) — F-D-073 resolved by docs + the set*/add* convention, no API change
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md"]
impact: medium
effort: M
depends_on: []
status: proposed
---

# RFC-D-07: Code-quality hardening — typed prototype writes, typed `TagAttrs`, `setStyles` replace-semantics, variadic `Overlay`, bench-in-CI

## Problem

Six findings cluster around one theme: the library's internals leak un-typed seams and silent footguns that the type-safety guardrail (§11.4) is supposed to prevent, plus a perf-gate gap that lets Track-D's own work regress undetected.

1. **54 `as any` casts for prototype writes** (F-D-004). `_t` and `_sk` are written as raw casts in 10+ files, each suppressing `no-explicit-any` with a comment:
   - `src/core/tag.ts:314` — `(Tag.prototype as any)._t = 1;`
   - `src/core/raw-string.ts:13` — `(RawString.prototype as any)._t = 2;`
   - `src/core/behavior-methods.ts:91` — `(Tag.prototype as any).behavior = …`
   - `src/elements/forms.ts:125` — `(InputTag.prototype as any)._sk = ['type','name',…]` (×51 across `src/elements/*`).
   Every new element class silently adds another cast; the eslint rule fires on accidental casts only because the structural ones are hand-suppressed.

2. **Open `TagAttrs` index signature forces `as string`** (F-D-044). `src/fold/types.ts:14` carries `[key: string]: unknown`, so every algebra reading an element attr casts:
   - `src/fold/algebras/links.ts:30-33` — `attrs.href as string`, `attrs.target as string`, `attrs.rel as string`.
   - `src/fold/algebras/aria-describe.ts:33-41` — `attrs.alt`, `attrs.type` read as `unknown`, coerced in template literals.
   Three of five shipped algebras already cast. `TagAttrs` is **public** fold API — every custom-algebra author inherits the cast.

3. **`setStyles()` replace-semantics are undocumented** (F-D-073, `src/core/tag.ts:249-258`). It assigns `this.style = styleString` — i.e. **replaces**, which is correct for a `set*` method, but the guidelines never say so, so apps chain `setStyle(...).setStyles(...)` expecting a *merge* and silently lose the earlier style:
   ```ts
   Div().setStyle("position: relative").setStyles({ width: "100px" })
   // → "width: 100px"   ← setStyles replaced (correct set-semantics, but surprising when untaught)
   ```
   The fix is **documentation, not code**: the library convention is `set*` overrides, `add*` accumulates (`setStyle`/`setStyles`/`setSrc` replace; `addClass` appends). `setStyles` stays replace; the guidelines must teach the convention so the chain-to-merge mistake stops.

4. **`Overlay` violates the variadic-children contract in library source** (F-D-063, `src/control/overlay.ts:23`). The lib's own exported helper does `Div([content, Div(overlay)…])` — the exact `Div([...])` form the guideline forbids. App authors read lib source as reference.

5. **Bench not wired into CI** (F-D-084, `package.json:51`). `npm run bench` exists but `npm test` never runs it; a 2× render regression ships green. Recon set baselines (Flat 6.4K, Realistic 23.6K, ForEach 1.1K ops/s) that nothing enforces.

6. **Bench excludes construction cost** (F-D-113, `bench/render.ts:190-209`). Every scenario pre-builds the tree once, then loops `render(prebuilt)`. Real SSR builds **and** renders per request (construction = 14.5 KB/1000 divs, recon `04-performance.md:77-81`). Any construction-allocation optimization (recon opportunity #4) shows as zero improvement, misdirecting v6 prioritization.

## Proposed API

```ts
// ── 1. Typed prototype-write helpers (internal) ─────────────────────
// src/core/proto.ts  (@internal — not exported from index.ts)

/** Set the readonly `_sk` schema-key array on a Tag subclass prototype. One cast, here only. */
export function defineSchemaKeys<C extends abstract new (...a: never[]) => Tag>(
  ctor: C,
  keys: readonly string[],
): void;

/** Set the readonly `_t` discriminant on a constructor prototype. One cast, here only. */
export function setDiscriminant<C extends abstract new (...a: never[]) => object>(
  ctor: C,
  value: number,
): void;

// ── 2. Self-documenting render-dispatch flag (internal) ─────────────
// replaces `isRawContext: boolean | string` at render.ts:184 / stream.ts
export type RawCtx = "escape" | "raw" | "script" | "style";
//  false  → "escape"   (escape text)
//  true   → "raw"      (passthrough, inside Raw)
//  'script'/'style' stay literal (sanitize)

// ── 3. Typed TagAttrs accessor (PUBLIC fold surface) ────────────────
// src/fold/types.ts — keep the index signature (back-compat) but add a typed reader
export interface TagAttrs {
  id?: string;
  class?: string;
  style?: string;
  attributes: Record<string, string>;
  htmx?: HTMX;
  toggles?: string[];
  [key: string]: unknown;
  /**
   * Typed read of an element-specific attribute (`href`, `src`, `alt`, `type`, …),
   * falling back to the custom-`attributes` map. Returns `string | undefined`
   * for the no-arg overload; pass a guard to narrow non-string values.
   */
  get(key: string): string | undefined;
  get<T>(key: string, guard: (v: unknown) => v is T): T | undefined;
}

// ── 4. setStyles — UNCHANGED (no API change) ────────────────────────
// setStyle(string) and setStyles(object) both REPLACE the `style` attribute today
// (src/core/tag.ts:125, :249) — correct `set*` = override semantics, and KEPT as-is.
// F-D-073 is resolved by documenting the set*/add* convention (see Guidelines impact),
// not by changing behavior. No `replaceStyles`, no `addStyles` (user decision: set=replace + docs only).
```

```ts
// internal impls — the only remaining casts live in one file
export function defineSchemaKeys(ctor: { prototype: object }, keys: readonly string[]): void {
  (ctor.prototype as Record<string, unknown>)._sk = keys;
}
export function setDiscriminant(ctor: { prototype: object }, value: number): void {
  (ctor.prototype as Record<string, unknown>)._t = value;
}
```

```ts
// setStyles — UNCHANGED. Stays replace (set* = override). No new methods.
// setStyles(styles) { this.style = toStyleString(styles); return this; }  // src/core/tag.ts:249, as-is
```

## Worked examples (before → after)

**Prototype writes** (F-D-004, `src/elements/forms.ts:123-125`):
```ts
// before
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
(InputTag.prototype as any)._sk = ['type','name','placeholder','value', …];
```
```ts
// after — no cast, no eslint suppression, convention enforced by the helper signature
defineSchemaKeys(InputTag, ['type','name','placeholder','value', …] as const);
```
```ts
// before  src/core/tag.ts:314 / raw-string.ts:13
(Tag.prototype as any)._t = 1;
(RawString.prototype as any)._t = 2;
```
```ts
// after
setDiscriminant(Tag, 1);
setDiscriminant(RawString, 2);
```

**Typed TagAttrs** (F-D-044, `src/fold/algebras/links.ts:27-37`):
```ts
// before — three `as string` casts; a non-string href silently mis-types
tag: (element, attrs: TagAttrs, childLinks) => {
  if (element === 'a' && attrs.href) {
    const linkInfo: LinkInfo = { href: attrs.href as string };
    if (attrs.target) linkInfo.target = attrs.target as string;
    if (attrs.rel)    linkInfo.rel    = attrs.rel    as string;
    return [linkInfo, ...childLinks];
  }
  return childLinks;
}
```
```ts
// after — `get()` returns `string | undefined`, no cast; non-string values yield undefined
tag: (element, attrs: TagAttrs, childLinks) => {
  const href = attrs.get('href');
  if (element === 'a' && href) {
    const linkInfo: LinkInfo = { href };
    const target = attrs.get('target'); if (target) linkInfo.target = target;
    const rel    = attrs.get('rel');    if (rel)    linkInfo.rel    = rel;
    return [linkInfo, ...childLinks];
  }
  return childLinks;
}
```

**setStyles semantics** (F-D-073, `src/core/tag.ts:249`) — *no code change*; the fix is teaching the convention:
```ts
// setStyle and setStyles REPLACE (set* = override) — unchanged in v6.
Div().setStyle("position: relative").setStyles({ width: "100px" })
// → style="width: 100px"   ← setStyles replaced; correct, now documented
```
```ts
// to compose, pass the full object at one call site — don't chain set* expecting a merge
Div().setStyles({ position: "relative", width: "100px" })
// → style="position: relative; width: 100px"
```

**Overlay variadic** (F-D-063, `src/control/overlay.ts:23-28`):
```ts
// before — the forbidden Div([...]) form in library source; extra array alloc
return Div([
  content,
  Div(overlay).setStyle(`position: absolute; ${positionStyles[position]} z-index: 10`),
]).setStyle("position: relative");
```
```ts
// after — variadic, zero behavior change, one fewer allocation
return Div(
  content,
  Div(overlay).setStyle(`position: absolute; ${positionStyles[position]} z-index: 10`),
).setStyle("position: relative");
```

**Bench in CI + construction cost** (F-D-084, F-D-113):
```ts
// before  bench/render.ts:190-191 — construction excluded, no assertion
const flatPage = benchFlatPage();
printResult("Flat page (1000 divs)", measure("flat", () => render(flatPage), ITERATIONS));
```
```ts
// after  — two signals (render-only + full request), and a CI-gated smoke test
printResult("Render-only: flat page (1000 divs)",
  measure("flat-render", () => render(flatPage), ITERATIONS));
printResult("Full request: flat page (1000 divs)",
  measure("flat-full", () => render(benchFlatPage()), ITERATIONS));   // build + render

// test/perf-smoke.test.ts (added to `npm test`)
const CEILINGS_MS = { flat: 0.47, realistic: 0.13, largeForEach: 2.7 } as const; // 3× recon baseline
test("flat page render under ceiling", () => {
  const ms = measureMs(() => render(benchFlatPage()), 200);
  assert.ok(ms < CEILINGS_MS.flat, `flat ${ms}ms ≥ ${CEILINGS_MS.flat}ms`);
});
```

## Type-safety story

- **`defineSchemaKeys` / `setDiscriminant`** localize the *one* unavoidable cast into a single typed file. `no-explicit-any` is re-enabled everywhere else; 54 suppressions → 0. The const-generic `keys: readonly string[]` + `as const` call site keeps `_sk` literal-typed at the source.
- **`RawCtx` union** replaces the tri-meaning `boolean | string` flag with a 4-member literal union — exhaustive `switch` with `assertNever`, dispatch is self-documenting, no convention to remember.
- **`TagAttrs.get<T>()`** returns `string | undefined` (no-arg) or `T | undefined` (guard overload) — index access is `unknown`, so the only way to a typed value is `get()`. A non-string stored under `href` returns `undefined` instead of a lying `as string`. Custom algebras get type safety for free.
- **`setStyles` (unchanged)** — stays `replace`, honoring `set*` = override. No new types or methods; the "does batch-set compose?" ambiguity is removed by *documenting* the `set*`/`add*` convention, not by changing behavior.

## Migration & compatibility

**Additive.** Nothing in the public surface is removed or re-signatured.

- `defineSchemaKeys` / `setDiscriminant` / `RawCtx` are `@internal`, not exported from `index.ts` — zero app impact.
- `TagAttrs.get()` is **added** alongside the existing `[key: string]: unknown` index signature. Old algebras using `attrs.href as string` keep compiling; `get()` is the recommended path. No codemod required (optional one: rewrite `attrs.X as string` → `attrs.get('X')`).
- **`setStyles()` is unchanged** — it stays `replace` (`set*` = override). No behavior change, no signature change, **no `breaking-changes.md` entry**. F-D-073 is resolved purely by documentation: teach that `set*` overrides and `add*` accumulates, so apps stop chaining `setStyle().setStyles()` expecting a merge. No `replaceStyles`/`addStyles` added (user decision: set=replace + docs only).
- `Overlay` change is byte-identical output (renderer flattens nested arrays at `render.ts:243-253`); pure internal cleanup.
- Bench changes touch `bench/` + `test/` + `package.json` only — no shipped code.

## Guidelines impact

Two app-facing things need teaching: the `set*`/`add*` **naming convention** (currently unstated anywhere — the root cause of F-D-073) and the `attrs.get()` fold reader. `Overlay`/variadic reinforces an existing rule. Internal helpers (`defineSchemaKeys`, `setDiscriminant`, `RawCtx`) and bench/CI are **not app-facing** → no guideline edit (they teach contributors, not Claude Code writing apps).

### Index (`web-development/CLAUDE.md`)

Keep the existing `.setStyles({ color: "red" })` line as-is — it replaces, which is correct. **Add** a convention rule near the Universal-methods / fluent-styling block:

```md
**`set*` overrides, `add*` accumulates** — `set*` methods REPLACE the value; `add*` methods APPEND. Never chain a `set*` expecting a merge:
```typescript
Div().addClass("p-2").addClass("m-2")                            // ✓ both — add* accumulates
Div().setStyle("position: relative").setStyles({ width: "1px" }) // ✗ "width: 1px" — setStyles REPLACES
Div().setStyles({ position: "relative", width: "1px" })          // ✓ compose at one call site
```
```

### Topic ref (`web-development/fluent-html.md`)

In **## Tag Methods → Universal methods** (around `fluent-html.md:40-41`), make the replace semantics explicit:

```md
  .setStyle("color: red")          // string — REPLACES the style attribute
  .setStyles({ color: "red" })     // object — REPLACES (camelCase → kebab-case)
```

Add a subsection after the Universal-methods block:

```md
### `set*` overrides, `add*` accumulates

The library convention: a `set*` method assigns (last write wins); an `add*` method composes.

```typescript
Div().setStyle("a: 1").setStyles({ b: "2" })  // → style="b: 2"      set* REPLACES
Div().addClass("p-2").addClass("m-2")          // → class="p-2 m-2"   add* APPENDS
```
To build a compound style, pass the whole object once — don't chain `setStyles` expecting a merge:
```typescript
Div().setStyles({ position: "relative", width: "100px" }) // ✓
```
```

In **## Types** (the fold/`TagAttrs` reference at `fluent-html.md:198+`), add:

```md
**Reading element attrs in a custom algebra** — use `attrs.get()`, never `as string`:
```typescript
tag: (element, attrs) => {
  const href = attrs.get("href");        // ✓ string | undefined, no cast
  if (element === "a" && href) { /* … */ }
}
// attrs.href as string                  // ✗ index signature is `unknown` — get() instead
```
```

**Adoption note:** the guidelines never stated that `setStyles` (or any `set*`) replaces, so apps chained `setStyle(...).setStyles(...)` expecting a merge and got silent data loss (F-D-073). The fix is the **`set*`/`add*` convention rule** above — no code or API change. The `attrs.get()` rule fixes the fold API's missing type-safe reader that pushed every algebra author into `as string` (F-D-044).

## Guardrail check

- **§11.1 zero-deps:** pass — no new runtime deps; all helpers are local.
- **§11.2 ssr-only / fast sync path:** pass — `defineSchemaKeys`/`setDiscriminant` run once at module-init; `RawCtx` is a compile-time union (same runtime branches); `setStyles` is unchanged.
- **§11.3 escape-by-default:** pass — `TagAttrs.get()` reads already-extracted attrs; no markup emitted; render escaping unchanged.
- **§11.4 type-safety:** pass — this RFC *is* a type-safety win: 54 `as any` → 0, fold casts → `get()`, tri-typed flag → `RawCtx` union.
- **§11.5 backward-compat:** pass — fully additive; **no behavior change**. F-D-073 is resolved by documentation (the `set*`/`add*` convention), not code.
- **§11.6 idioms:** pass — `Overlay` now obeys variadic-children; `setStyles` keeps `set*` = override, and the `set*`/`add*` convention is now documented.
- **§11.7 class-string contract:** N/A — no new Tailwind classes emitted; extractor/eslint untouched.
- **§11.8 guideline-sync:** pass — `## Guidelines impact` covers every app-facing item (the `set*`/`add*` convention, `TagAttrs.get`, `Overlay`/variadic); internal-only symbols (`defineSchemaKeys`, `setDiscriminant`, `RawCtx`) and bench/CI explicitly justified as non-app-facing. `guideline_updates` lists the two patched files.

## Alternatives considered

- **TagAttrs: element-specific subtypes** (`AnchorAttrs extends TagAttrs`) — more precise but verbose, still needs a per-element narrow + cast at the call site, and grows with every element. `get()` is one method covering all elements. Subtypes can layer on later non-breakingly.
- **TagAttrs: drop the index signature, fold extras into `attributes`** — simplest typing but **breaking** (existing `attrs.href` reads stop compiling) and loses the schema-key/custom-attr distinction. Rejected for compat.
- **setStyles: make it accumulate + add `replaceStyles`** — *rejected*. `set*` means override in this library (`setSrc`, `setType`, `setStyle` all replace); making `setStyles` append would be internally inconsistent and a silent behavior change. Decision: keep `set*` = replace, document the `set*`/`add*` convention, add no new method. (An `addStyles` accumulator was considered and declined — minimal surface preferred.)
- **Bench: full statistical harness (tinybench/mitata)** — violates §11.1 zero-deps for a dev concern and is overkill; a checked-in ceilings constant + `node:test` smoke is enough to catch gross (2×) regressions per F-D-084.
- **Delete the second `renderAlgebra` renderer** (recon §4) — real but out of this cluster's scope; left to a dedicated Track-D RFC.

## Open questions

- **Perf ceilings location:** commit `CEILINGS_MS` in the test, or in a `bench/baselines.json` that `bench` rewrites on demand? Recommend the test constant (one source, tightened by PR) per F-D-084.
- **`setStyles`:** resolved — no migration (behavior unchanged). The only fix is the `set*`/`add*` documentation convention above.
- **`TagAttrs.get` guard overload** — ship the `<T>(key, guard)` overload now, or land the no-arg `string | undefined` version first and add the guard overload when an algebra needs non-string attrs (`colspan`)? Recommend both now; cost is one signature.
