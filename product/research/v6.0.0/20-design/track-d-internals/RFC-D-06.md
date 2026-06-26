---
id: RFC-D-06
track: D
title: Construction allocation cleanup — monomorphic Tag shape, exception-safe variants, allocation-free fold layer & context escape hatch
resolves: [F-D-021, F-D-022, F-D-023, F-D-025, F-D-041, F-D-042, F-D-064, F-D-043, F-D-061, F-D-062, F-D-065, F-D-112, F-D-114, F-D-051, F-D-052, F-D-093, F-D-005]
api_surface: ["Context.push()", "Context.pop()", "escapeAttr()", "foldViewScalar()"]
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md"]
impact: medium
effort: M
depends_on: []
status: proposed
---

# RFC-D-06: Construction allocation cleanup

## Problem

The SSR pattern rebuilds the whole view tree on **every request**, so *construction-time* allocation is paid per request — recon §2 measures ~14.5 KB to build 1000 divs *before* a single byte is rendered, and the two slowest workloads (flat-1000, ForEach-5000) are dominated by per-node cost × node count (`00-recon/04-performance.md:83-84`). This cluster collects 17 findings that each shave avoidable allocation, a hidden-class hazard, a silent correctness bug, and a fold-layer that allocates as much doing *nothing* (count) as `render()` does producing HTML. None change rendered output (one exception, escaping, is output-equivalent and security-checked).

Grounded in the source:

- **Hidden-class bloat (F-D-021).** `_variantPrefix: string | null = null` is a class-field initializer (`src/core/tag.ts:309`), so every `new Tag()` writes the slot as an *own property* — unlike `_t` (`tag.ts:314`) and `attributes` (`tag.ts:315`) which live on the prototype. Worse, `withVariant`'s restore (`tailwind-methods.ts:90`) writes `null` *back as an own property*, so a Tag that ever entered `.on()/.at()` has a different hidden class than one that did not.
- **Silent variant corruption (F-D-022).** `withVariant` (`tailwind-methods.ts:86-91`) restores `_variantPrefix` *after* the callback with no `try/finally` — a throw inside `.on(...)` leaks the prefix, and every subsequent `addClass` on a reused Tag silently emits `hover:text-white` for what should be `text-white`. A latent cross-request hazard for static hoisting (seed #3).
- **Double-allocating list path (F-D-023).** `ForEach` generic-iterable fallback is `Array.from(iter).map(fn)` (`iteration.ts:76`) — two arrays where `Array.from(iter, fn)` needs one. Hits `Map.values()`, generators, paginators on the slowest bench (5000-item ForEach, 0.886 ms/op).
- **Per-key closure churn (F-D-025).** `setStyles`/`setDataAttrs`/`setAria` (`tag.ts:249,275,298`) each build a fresh `letter => \`-${letter.toLowerCase()}\`` closure per call, and `setStyles` adds a `.map().join()` intermediate array.
- **Fold-layer waste (F-D-005, F-D-041, F-D-042/F-D-064, F-D-043, F-D-065, F-D-112, F-D-114).** `extractAttrs` is duplicated verbatim in `fold.ts:9` / `para.ts:9` and spreads `{...attributes}` + scans `Object.keys(tag)` per node even for read-only algebras — `foldView(countAlgebra)` (25K) is as slow as `render()` (23.6K) doing nothing but adding integers. `textAlgebra` rebuilds an 18-entry `Set` per tag (`text.ts:16`). `hyloView` allocates `attributes: {}` per node (`hylo.ts:30`), and `unfoldView` loses the `EMPTY_ATTRS` sentinel when a coalgebra supplies `{}` (`unfold.ts:36`). `linksAlgebra` is O(n²) via `[link, ...childLinks]` (`links.ts:34`). `countAlgebra.list` uses a `reduce` closure (`count.ts:14`) against the codebase's own imperative-loop style.
- **Wasted escape work (F-D-051, F-D-093, F-D-052).** `escapeAttr` is a bare alias for `escapeHtml` (`escape.ts:37-39`) — it escapes `>` and `'`, harmless inside the double-quoted attributes the renderer *always* emits. Non-string `_sk` values (colspan, value, width…) are run through `escapeAttr(String(value))` (`render.ts:213`) though a number can never contain a metacharacter. And `extraAttrs` calls `String(value)` on values the type already proves are `string` (`render.ts:225`, `stream.ts:163`).

## Proposed API

Almost all of this is internal and behavior-preserving (no signature change). Three items add/refine public surface:

```ts
// ── 1. Context escape hatch (F-D-061, F-D-062) — additive members ──────────────
// src/control/context.ts
export type Context<T> = {
  readonly current: T;
  /** Push a value; auto-pops on block exit. Allocates one Disposable per call. */
  scope(value: T): Disposable;
  /** Low-level push — no allocation. MUST be paired with pop() in a try/finally. */
  push(value: T): void;
  /** Low-level pop — undoes the matching push(). */
  pop(): void;
};
// scope() becomes sugar over push/pop; both factories share one makeContextCore<T>(stack).

// ── 2. escapeAttr specialised (F-D-051) — same signature, narrower body ─────────
// src/render/escape.ts
/** Escape for a DOUBLE-QUOTED attribute value. Only `&` and `"` can break out;
 *  `>`/`'`/`<` are inert inside `"..."` (HTML5 §13.1.2). */
export function escapeAttr(unsafe: string): string;   // no longer `= escapeHtml`

// ── 3. foldViewScalar (F-D-112) — opt-in allocation-free fold ───────────────────
// src/fold/fold.ts
/** Like foldView, but for scalar algebras (count/text/links): folds array children
 *  through `list` without materialising the intermediate `A[]` where the algebra
 *  declares it reducible. Falls back to foldView for non-scalar algebras. */
export function foldViewScalar<A>(alg: ViewAlgebra<A>, view: View): A;
```

Internal-only changes (no public signature impact):

```ts
// F-D-021 — prototype default, delete own-prop on restore
// src/core/tag.ts
declare _variantPrefix: string | null;          // declare, NO initializer
(Tag.prototype as any)._variantPrefix = null;   // prototype default, like _t

// F-D-022 — exception-safe withVariant
// src/core/tailwind-methods.ts
function withVariant(tag: Tag, prefix: string, fn: (tag: Tag) => Tag): Tag {
  const outer = tag._variantPrefix;
  tag._variantPrefix = outer ? `${outer}:${prefix}` : prefix;
  try { fn(tag); }
  finally {
    if (outer === null) delete (tag as { _variantPrefix?: string | null })._variantPrefix; // restore prototype shape
    else tag._variantPrefix = outer;
  }
  return tag;
}

// F-D-023 — single-pass iterable
return Array.from(viewsOrLowOrHigh, fn as (item: T, index: number) => View);

// F-D-025 — module-level callback + += accumulation (no per-call closure)
const toKebab = (m: string) => '-' + m.toLowerCase();

// F-D-005 — one shared extractAttrs (src/fold/shared.ts), EMPTY_ATTRS fast path
// F-D-041 — hoist BLOCK_ELEMENTS Set to module scope
// F-D-042/F-D-064/F-D-114 — default to EMPTY_ATTRS, not `{}`, in hylo/unfold
// F-D-043 — linksAlgebra: thread a mutable accumulator (O(n))
// F-D-065 — countAlgebra.list: imperative for-loop
// F-D-052 — drop redundant String() at render.ts:225 / stream.ts:163
// F-D-093 — skip escapeAttr for non-string _sk values in render.ts:213 / stream.ts:151
```

## Worked examples (before → after)

**Variant exception safety (F-D-022)** — the silent-corruption bug, using the finding's repro:

```ts
// before (today, src/core/tailwind-methods.ts:86-91)
function withVariant(tag, prefix, fn) {
  const outer = tag._variantPrefix;
  tag._variantPrefix = outer ? `${outer}:${prefix}` : prefix;
  fn(tag);                       // throw here ⇒ restore below never runs
  tag._variantPrefix = outer;    // _variantPrefix stays "hover:" on the leaked Tag
  return tag;
}
// Button("Save").on("hover", t => { t.background("blue-600"); throw e })
//   .textColor("white")  →  emits `hover:text-white` (WRONG) on the surviving tag
```
```ts
// after (with this RFC) — try/finally + prototype-shape restore
function withVariant(tag, prefix, fn) {
  const outer = tag._variantPrefix;
  tag._variantPrefix = outer ? `${outer}:${prefix}` : prefix;
  try { fn(tag); }
  finally {
    if (outer === null) delete tag._variantPrefix;  // back to monomorphic shape
    else tag._variantPrefix = outer;
  }
  return tag;
}
// prefix is always restored; the next addClass is correct even if the callback threw.
```

**Generic-iterable ForEach (F-D-023)** — a `Map.values()` render path:

```ts
// before (today) — Array.from materialises, .map walks again (two arrays)
// src/control/iteration.ts:76
Ul(ForEach(usersById.values(), (u) => Li(u.name)))
//        └─ Array.from(iter).map(fn): 5000 items ⇒ 5000-elem array discarded immediately
```
```ts
// after (with this RFC) — Array.from(iter, fn): one pass, one array
// call site is byte-identical; only the internal fallback changes
Ul(ForEach(usersById.values(), (u) => Li(u.name)))
```

**Read-only fold (F-D-005 / F-D-112)** — counting nodes should not allocate like rendering:

```ts
// before (today) — extractAttrs clones {...attributes} + Object.keys(tag) per node;
//                  foldView maps array children into a throwaway number[]
const n = foldView(countAlgebra, page);   // 25K ops/s ≈ render() at 23.6K — allocation tax
```
```ts
// after (with this RFC) — shared extractAttrs short-circuits on EMPTY_ATTRS;
//                         foldViewScalar accumulates through list() with no intermediate array
const n = foldViewScalar(countAlgebra, page);   // no per-node attrs clone, no child-array alloc
// foldView(countAlgebra, page) still works unchanged for back-compat.
```

## Type-safety story

- **`Context<T>.push/pop`** stay generic over `T`; `push` accepts only `T`, `pop` takes none — no `any`. The unsafe ordering (`push` without `pop`) is a *runtime* discipline the guideline pins to `try/finally`; `scope()` remains the type-safe default that can't be mismatched.
- **`escapeAttr`** keeps `(unsafe: string) => string` — callers are untouched; the narrowing lives entirely in the body and is asserted by the `security/escape` lens, not by types.
- **`foldViewScalar<A>`** mirrors `foldView<A>`'s signature exactly (`ViewAlgebra<A>, View) => A`), so it is a drop-in for the scalar algebras and inference is identical.
- **`_variantPrefix`** moves from a field initializer to `declare _variantPrefix` + a prototype write — the declared type `string | null` is unchanged, so `withVariant` and `addClass` keep their types; only the *runtime shape* improves.
- No new bare `string` unions, no `as any` added (F-D-005 removes one `Object.keys` cast site by centralising it; the `delete` in F-D-022 uses a narrow `{ _variantPrefix?: ... }` cast, not `any`).

## Migration & compatibility

**Additive / behavior-preserving — nothing breaks.**

- `Context.push/pop`, `foldViewScalar`: new exports; existing `scope()` / `foldView()` keep working. `scope()` is re-implemented over `push/pop` with identical observable behavior.
- `escapeAttr`: output is identical for every value the renderer can emit (always double-quoted), so rendered HTML is byte-identical; only wasted `&gt;`/`&#39;` substitutions disappear. Covered by the `security/escape` lens + a fuzz test asserting `escapeAttr(x)` ≡ old behavior inside `"..."`.
- F-D-021 hidden-class change, F-D-022 try/finally, F-D-023/025/041/042/043/052/064/065/093/112/114: internal; no API, no output change. Each gates on `bench:mem` before/after per recon §5.
- **No codemod needed.** `breaking-changes.md`: no entry (additive). One *adoption* note only: hot context-in-loop code *may* switch `using _ = ctx.scope(v)` → `ctx.push(v); try {…} finally { ctx.pop() }` for zero-alloc, but is never required.

## Guidelines impact

Two of the 17 items surface to the guideline reader: the new **`Context.push/pop`** escape hatch (must be taught *with* its `try/finally` discipline or it will leak the stack), and the reaffirmed `.on()/.at()` exception-safety (now guaranteed, so the guideline can state it). `escapeAttr` and `foldViewScalar` are internal-renderer / advanced-fold surface that app code never calls directly — no index rule. The internal allocation cleanups have no public surface.

### Index — `web-development/CLAUDE.md`

Replace the two-line context bullet block (lines 145-147) with the same plus a push/pop note:

```md
**Scoped context** — use for cross-cutting values read by many components (i18n, theme, auth, nonce, feature flags) instead of prop drilling. Use props for component-specific data. **Never use `AsyncLocalStorage`** for render-time data — context is sufficient for synchronous rendering:
- `createContext(defaultValue)` — returns default when no scope active
- `createRequiredContext(name)` — throws if accessed outside a scope (use for auth, request data)
- `using _ = ctx.scope(value)` is the default. For a hot loop, `ctx.push(value)` / `ctx.pop()` skips the per-call Disposable — but **must** be `try/finally`-paired:
```typescript
using _ = ThemeCtx.scope("dark")                 // ✓ default — auto-pops
ForEach(rows, r => { ctx.push(r); try { return Row() } finally { ctx.pop() } }) // ✓ hot loop, zero-alloc
ctx.push(r); return Row()                         // ✗ never pop → leaks the stack
```

### Topic ref — `web-development/fluent-html.md`

In `## Scoped Context` (after line 166), append:

```md
**Hot loops — `push`/`pop` escape hatch.** `scope()` allocates one Disposable per call; `push`/`pop` do not. Use only when profiling a per-row/per-node scope; always `try/finally`-pair.

```typescript
// ✓ default
function handler(user: User) {
  using _ = AuthCtx.scope(user);
  return Page();
}

// ✓ zero-alloc in a tight loop — pop in finally so a throw can't leak the stack
ForEach(rows, (row) => {
  RowCtx.push(row);
  try { return RowView(); }
  finally { RowCtx.pop(); }
});

// ✗ push without a paired pop — corrupts every later RowCtx.current
RowCtx.push(row);
return RowView();
```

`.on()`/`.at()` are exception-safe — a throw inside the callback restores the variant prefix, so a caught error never leaks `hover:`/`md:` onto later classes.
```

**Adoption note.** The old guideline taught only `using _ = ctx.scope()`, the correct default — nothing was wrong, but it left no documented path for the recon's measured hot case (context-in-`ForEach`, 4.2K ops/s for 1000 scopes, recon §2). Apps that needed it had no zero-alloc option and either avoided context in loops or paid the allocation. `push`/`pop` is the escape hatch; the guideline keeps `scope()` as the strong default so the unsafe ordering stays opt-in.

## Guardrail check

- **§11.1 zero-deps:** pass — no new dependencies; pure internal/stdlib (`Array.from/2`, `try/finally`, prototype writes).
- **§11.2 ssr-only / sync hot path:** pass — every change reduces or holds allocation on the synchronous path; `bench:mem` gates F-D-021/023/025/005/112. No async introduced.
- **§11.3 escape-by-default:** needs-verification → mitigated — `escapeAttr` (F-D-051) and non-string `_sk` skip (F-D-093) are output-equivalent for double-quoted attributes; flagged for the `security/escape` lens + fuzz parity test before merge. `htmlEscapes` map unchanged; text-content escaping untouched.
- **§11.4 type-safety:** pass — `push/pop`/`foldViewScalar` fully generic, no `any` added; F-D-005 removes a cast site; F-D-022 uses a narrow cast, not `any`.
- **§11.5 backward-compat:** pass — additive; `scope()`/`foldView()`/`escapeAttr` callers untouched; no `breaking-changes.md` entry.
- **§11.6 idioms:** pass — favours the codebase's imperative-loop / `+=` style (F-D-065, F-D-025) over `reduce`/`map().join()`; `push/pop` mirrors the existing `scope()` voice.
- **§11.7 class-string contract:** N/A — emits no new Tailwind classes; the variant-prefix fix preserves the exact class strings, so the extractor/eslint vocabulary is unaffected.
- **§11.8 guideline-sync:** pass — `Context.push/pop` carries an index rule + topic-ref section + adoption note above. `escapeAttr` and `foldViewScalar` are internal/advanced surface with no app-facing idiom, so no index rule is warranted (documented as N/A here, not omitted).

## Alternatives considered

- **Object-pool Tags / freelist for `_variantPrefix`** — rejected: pools fight V8's generational GC and add retained state across requests (a hoisting hazard); the prototype-default fix (F-D-021) gets the monomorphic shape for free.
- **Singleton Disposable per Context (F-D-061 Option A)** — viable but re-entrancy-fragile (nested `scope()` on the same context would alias one disposable); `push/pop` is simpler, explicit, and zero-alloc without that footgun. Kept `scope()` allocating its own Disposable.
- **Delete the fold layer entirely** — out of scope; this cluster makes it pay-as-you-go (F-D-005/112) rather than removing public API. The lossy `renderAlgebra` deletion is a separate Track-D code-quality RFC.
- **Auto-detect "scalar" algebras to make `foldView` allocation-free transparently** — rejected: would change `foldView`'s allocation contract silently; an explicit `foldViewScalar` keeps `foldView` stable and lets the optimisation be opt-in (matches recon §3 #6 "opt-in fast path").

## Open questions

- **`escapeAttr` `<` handling.** F-D-051 keeps `<` escaping as defence-in-depth; HTML5 does not require it in quoted attrs. Drop it for one fewer branch, or keep for belt-and-suspenders? (Recommend: keep `<`, drop only `>`/`'` — the security lens decides.)
- **`foldViewScalar` discovery.** Should scalar algebras (`count`/`text`/`links`) carry a marker (e.g. `reducible: true`) so `foldViewScalar` can statically pick the fast path, or should it always fall back when `list` isn't reduce-shaped? (Recommend: a small optional `ViewAlgebra` flag, no breaking change.)
- **`push/pop` mis-pairing guard.** Ship a dev-only balance assertion (stack depth at request end == start) behind `NODE_ENV !== 'production'`, or rely on the guideline's `try/finally` rule alone?
