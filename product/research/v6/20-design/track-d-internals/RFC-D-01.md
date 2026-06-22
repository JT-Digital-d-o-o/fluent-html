---
id: RFC-D-01
track: D
title: Renderer de-recursion (work-stack) + static-subtree precompilation (Frozen)
resolves: [F-D-001, F-D-102, F-D-006, F-D-081, F-D-091, F-D-094]
api_surface: ["Frozen()", "FrozenView", "isFrozen()", "render() (de-recursed, behavior-identical)", "renderToStream() (de-recursed, behavior-identical)", "foldView()/paraView()/unfoldView()/hyloView() (de-recursed)"]
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md", "web-development/performance.md"]
impact: high
effort: L
depends_on: []
status: proposed
---

# RFC-D-01: Renderer de-recursion (work-stack) + static-subtree precompilation (`Frozen`)

## Problem

Two grounded defects in the render core, fixed together because they touch the same dispatch point and the second is only clean once the first lands.

**1. Unbounded recursion → hard crash (`F-D-001`, `F-D-102`, `F-D-081`, `F-D-006`).**
`renderImpl` descends one call frame per DOM depth at two points:

```ts
// src/render/render.ts:240  — one frame per nesting level
return '<' + el + attrs + '>' + renderImpl(tag.child, childCtx) + '</' + el + '>';
// src/render/render.ts:246,250 — array path also recurses
if (len === 1) return renderImpl(view[0]!, isRawContext);
result += '\n' + renderImpl(view[i]!, isRawContext);
```

Recon binary-searched the ceiling: `render(deep(3500))` throws `Maximum call stack size exceeded`, `render(deep(3468))` succeeds (`00-recon/04-performance.md:97`). `streamImpl` (`src/render/stream.ts:182,190`) and all four fold-layer traversals — `foldView` (`src/fold/fold.ts:69`), `paraView` (`src/fold/para.ts:58`), `unfoldView` (`src/fold/unfold.ts:29`), `hyloView` (`src/fold/hylo.ts:28`) — share the identical profile and overflow at the same depth. **None is tested near the limit:** the deepest render test is 4 levels (`test/stream.test.ts:38`), the deepest fold test is 3 (`test/fold.ts:21`). Recursive comment threads, nested menus, and `unfoldView`-generated trees crash the process in production with no warning.

**2. No static-subtree precompilation (`F-D-091`, `F-D-094`).**
`render()` re-walks the *entire* Tag tree every request — re-allocating attribute strings, re-escaping every value, re-joining children — even for chrome that is byte-identical across all requests. Real evidence from `ttl/src/shared/components/layout.view.ts`:

```ts
// ttl/src/shared/components/layout.view.ts:299-313 — rebuilt + re-rendered every request
function DashboardIcon() { return Raw(`<svg width="18" ...>...</svg>`); }
function ClockIcon()     { return Raw(`<svg width="18" ...>...</svg>`); }
function SettingsIcon()  { return Raw(`<svg width="18" ...>...</svg>`); } // 600-char path
function ShieldIcon()    { return Raw(`<svg width="18" ...>...</svg>`); }
```

The entire `<head>` (`layout.view.ts:53-88`: meta, 6 `Link`s, fonts, htmx CDN `Script`) and the sidebar nav (`layout.view.ts:183-256`) are static for a given `activePage`, yet reconstructed and re-serialized on every navigation. Recon ranked this perf opportunity #3; `F-D-094` flags that the bench never *quantified* it, so the throughput gain that justifies a new public symbol was unmeasured. There is no `Frozen`/`Static`/`prerender` concept in `src/` (`src/core/types.ts:6` — `View = Tag | string | RawString | View[]`). The only workaround — `Raw(render(myNav))` — bypasses fluent construction, needs hand-rolled cache management, and is undocumented (`F-D-091`).

## Proposed API

### Public surface (additive)

```ts
// src/core/frozen.ts (new)

/**
 * A precompiled, render-once-cache-forever view.
 * The wrapped subtree MUST be request-invariant: same output every render.
 * On first render the subtree is serialized to a string and memoized on the
 * wrapper; subsequent renders emit the cached string verbatim (a memcpy).
 */
export class FrozenView {
  /** @internal render discriminant — 3 (string=raw, 1=Tag, 2=RawString, 3=Frozen) */
  declare readonly _t: 3;
  /** @internal the source subtree, kept for stream parity + first render */
  readonly view: View;
  /** @internal memoized HTML; undefined until first render */
  cached: string | undefined;
  constructor(view: View);
}

/**
 * Wrap a request-invariant subtree so it renders once and is cached.
 * Use for static chrome: <head>, nav, footer, icon SVGs, legal text.
 * NEVER wrap anything that varies by request (user data, csrf, nonce, locale).
 */
export function Frozen(view: View): FrozenView;

/** Type guard, mirrors isTag / isRawString. */
export function isFrozen(v: unknown): v is FrozenView;
```

```ts
// src/core/types.ts — extend the View union (additive; existing members unchanged)
export type View = Tag | string | RawString | FrozenView | View[];
```

```ts
// src/core/guards.ts
export function isFrozen(v: unknown): v is FrozenView {
  return typeof v === 'object' && v !== null && (v as { _t?: number })._t === 3;
}
```

### Internal surface (behavior-preserving rewrite — no public signature change)

`render(...views)` and `renderToStream(view)` keep their exact signatures and output. Internally `renderImpl` is replaced by an explicit work-stack; `RawCtx` replaces the tri-typed `boolean | string` flag (recon §4 code-quality item):

```ts
// src/render/serialize.ts (new — shared core, kills the render/stream duplication, F-D-006/recon #5)
type RawCtx = 'escape' | 'raw' | 'script' | 'style';

/** A sink lets render (string +=) and stream (push) share one emitter. */
interface Sink { emit(s: string): void; }

/** De-recursed core: explicit stack, no native call frames per depth. */
function serialize(root: View, sink: Sink): void;
```

The fold layer gets the same treatment via a shared two-pass work-stack helper:

```ts
// src/fold/trampoline.ts (new)
/** Iterative post-order driver shared by foldView/paraView/unfoldView/hyloView. */
function foldStack<A>(view: View, alg: ViewAlgebra<A>): A;
```

Frozen integrates at the existing dispatch point (`render.ts:196` neighborhood) as one extra stack-node case:

```ts
// inside serialize(), when popping a node:
if (isFrozen(node)) {
  if (node.cached === undefined) node.cached = render(node.view); // first time only
  sink.emit(node.cached);                                          // memcpy thereafter
  continue;
}
```

`renderToStream` short-circuits identically: a frozen node `push`es `node.cached` in one chunk.

## Worked examples (before → after)

### Static chrome — the real `ttl` layout

```ts
// before (today, ttl/src/shared/components/layout.view.ts:299-313)
// Re-constructs a RawString and re-serializes the SVG on EVERY request.
function DashboardIcon() {
  return Raw(`<svg width="18" height="18" viewBox="0 0 24 24" ...>...</svg>`);
}
// ...same for ClockIcon, SettingsIcon (600-char path), ShieldIcon.
// The <head> (layout.view.ts:53-88) is likewise rebuilt + re-escaped every request.
```

```ts
// after (with this RFC) — render once, memcpy forever
const DashboardIcon = Frozen(
  Raw(`<svg width="18" height="18" viewBox="0 0 24 24" ...>...</svg>`)
);
// Icons are module-level constants (request-invariant), so freeze at module scope:
const StaticHead = Frozen(Head(
  Meta().setCharset("utf-8"),
  Meta().setName("viewport").setContent("width=device-width, initial-scale=1.0"),
  Link().setRel("stylesheet").setHref("/css/styles.compiled.css"),
  Script("").setSrc("https://cdn.jsdelivr.net/npm/htmx.org@4.0.0-alpha7/...")
    .setIntegrity("sha384-...").setCrossorigin("anonymous"),
  HtmxConfig({ defaultSwap: "outerMorph" }),
));

export function Layout({ title, children, user, activePage }: LayoutProps) {
  return [
    Raw("<!DOCTYPE html>"),
    HTML(StaticHead, Body(/* dynamic body uses DashboardIcon etc. */)).setLang("en"),
  ];
}
// <head> + 4 icon SVGs now serialize on first request only; thereafter each is a
// single cached-string append. Per F-D-094 the bench gate must show the speedup
// (expected ≈ 1 / cost(render(dynamicBody)) instead of cost(render(fullPage))).
```

`Frozen` composes with the existing tree — it is a `View`, so it nests anywhere a child goes and renders correctly inside escape/script/style contexts because the cached string was produced by the same `render()` with full escaping.

### Deep tree — the crash that no longer crashes

```ts
// before (today) — F-D-081, render.ts:240 recursion
function deep(n: number): View { return n === 0 ? Span("leaf") : Div(deep(n - 1)); }
render(deep(3500)); // ❌ throws: Maximum call stack size exceeded
```

```ts
// after (with this RFC) — work-stack, depth-independent
render(deep(50_000)); // ✓ returns the full HTML string, no overflow
foldView(countAlgebra, deep(50_000)); // ✓ same trampoline, no overflow
```

No app code changes for the de-recursion: `render`/`renderToStream`/`foldView` signatures and byte-for-byte output are identical (locked by the `stream-vs-render` fuzz, `F-D-006`).

## Type-safety story

- **Discriminated union via `_t` literals.** `FrozenView._t: 3` joins `Tag._t: 1` / `RawString._t: 2` as a literal-typed discriminant. `isFrozen()` is a `v is FrozenView` guard, so `serialize`’s node dispatch is exhaustively narrowed — add a case or TS flags the gap.
- **`RawCtx` literal union** replaces the `boolean | string` tri-state flag (`render.ts:184`). `'escape' | 'raw' | 'script' | 'style'` makes every call site self-documenting and makes an invalid context a compile error (recon §4 code-quality).
- **`Frozen(view: View): FrozenView`** is fully typed — no `any`. The one unavoidable prototype-discriminant cast (`(FrozenView.prototype as any)._t = 3`) is isolated to `frozen.ts`, matching the existing `RawString` pattern (`raw-string.ts:13`) and the planned `defineSchemaKeys`/`setDiscriminant` helper (recon §4).
- **No bare `string` introduced.** The cache field is `string | undefined`; "not yet rendered" is encoded as `undefined`, not a sentinel string.

## Migration & compatibility

**Additive — nothing breaks.**

- `Frozen` / `FrozenView` / `isFrozen` are new exports. Existing code is untouched.
- `View` gains a union member; `FrozenView` is assignable everywhere a `View` is accepted, and all existing `View` producers/consumers keep working (the renderer simply gains one dispatch branch).
- The de-recursion is an **internal** rewrite of `renderImpl`/`streamImpl`/fold traversals. Public signatures unchanged; output is byte-identical (enforced by snapshot + `stream-vs-render` fuzz). The only *observable* change is that previously-crashing deep trees now succeed — strictly an improvement, no migration note required.
- **No codemod needed.** Adoption is opt-in: apps wrap static chrome in `Frozen()` when they want the speedup.
- `breaking-changes.md`: **no entry** (additive). A one-line note may go in the v6 *additions* changelog: "Deep trees beyond ~3.5k nesting no longer overflow; `render`/`renderToStream`/`foldView` are now iterative."

**Safety contract for `Frozen` (documented, user-enforced):** the wrapped view must be request-invariant. Wrapping per-request data (user name, csrf, nonce, locale) caches the *first* request's value and serves it to everyone — a correctness/security footgun. The guideline edit below states this in ✓/✗ form. `renderWithNonce` deliberately walks the live tree (`render.ts:55`); a `Frozen(Script())` inside it would not receive the nonce, so the guideline says: never freeze nonce-bearing `<script>`/`<style>`.

## Guidelines impact

Guardrail §11.8: this RFC adds public surface (`Frozen`, `FrozenView`, `isFrozen`) and a new pattern (precompiling static chrome), so it carries the index rule + topic-ref sections below. The de-recursion adds no public surface but changes a documented capability boundary (max depth), noted in `performance.md`.

### Index — `web-development/CLAUDE.md`

Insert into the **fluent-html** section, immediately after the `Boolean attributes` block (before the `---` that precedes *Fluent Tailwind Styling*):

```md
**`Frozen()` for request-invariant chrome** — render once, memcpy forever. Wrap static `<head>`, nav, footer, icon SVGs at module scope. **Never** freeze per-request data (user/csrf/nonce/locale) or nonce-bearing `<script>`/`<style>`:
```typescript
const Head = Frozen(StaticHead())        // ✓ static <head>, frozen at module scope
const Icon = Frozen(Raw("<svg>...</svg>")) // ✓ static icon — serialized once
Frozen(Div(`Hi ${user.name}`))            // ✗ per-request data — caches first user forever
Raw(render(myNav))                        // ✗ manual + uncached — use Frozen()
```
```

### Topic ref — `web-development/fluent-html.md`

In **`## Element Creation`** add one line after the `Raw(...)` line (`fluent-html.md:13`):

```md
Frozen(StaticNav())                // request-invariant subtree — rendered once, then cached (memcpy)
```

Add a new section after **`## Rendering`** (`fluent-html.md:179`):

```md
## Static Precompilation — `Frozen()`

`Frozen(view)` renders a request-invariant subtree once and caches the HTML string; later renders emit the cached bytes directly. Use for static chrome (`<head>`, nav, footer, icon SVGs, legal text).

```typescript
// ✓ freeze at module scope — request-invariant
const SiteHead = Frozen(Head(Meta().setCharset("utf-8"), Link().setRel("stylesheet").setHref("/css/app.css")));
const ClockIcon = Frozen(Raw(`<svg ...>...</svg>`));

function Page({ children }: { children: View }) {
  return HTML(SiteHead, Body(children)).setLang("en"); // SiteHead serialized once, ever
}
```

✓ Freeze: `<head>`, nav, footer, icon/logo SVGs, static legal/marketing copy.
✗ Never freeze: anything per-request — `user`, csrf tokens, locale-dependent text, `nonce`-bearing `<script>`/`<style>` (a frozen node is skipped by `renderWithNonce`).
✗ Don't hand-roll `Raw(render(nav))` — it bypasses fluent construction and caches nothing.

`Frozen` is a `View`: it nests anywhere a child goes, escaping is applied when first rendered, and `renderToStream` emits the cache as a single chunk.

> `View = Tag | string | RawString | FrozenView | View[]`
```

Update the **`## Types`** block (`fluent-html.md:202`):

```md
// View = Tag | string | RawString | FrozenView | View[]
```

### Topic ref — `web-development/performance.md`

Add a subsection under **`## Response Streaming (Fastify SSR)`** (after `performance.md:121`):

```md
## SSR Render Precompilation (fluent-html)

- **DO:** Wrap request-invariant chrome in `Frozen()` — `<head>`, nav, footer, icon SVGs render once then memcpy. Freeze at module scope, not per request.
- **DON'T:** `Frozen()` anything that varies per request (user data, csrf, nonce, locale) — it caches the first request's bytes for everyone.
- Deep trees (>3.5k nesting) render safely — `render`/`renderToStream`/`foldView` are iterative (no stack-overflow ceiling). No app action needed.
```

### Adoption note

`F-D-091` shows the only prior workaround was `Raw(render(myNav))` — undocumented, uncached, and a fluent-construction dead-end, so apps never used it (the `ttl` layout re-renders its `<head>` + 4 icon SVGs every request). The new guideline names the exact targets (`<head>`/nav/footer/icons) and the exact footgun (per-request data, nonce) so Claude Code reaches for `Frozen` instead of re-rendering or mis-hand-rolling `Raw(render(...))`.

## Guardrail check

- **§11.1 zero-deps:** PASS — `Frozen`, the work-stack, and the shared `serialize.ts`/`trampoline.ts` are pure TS, no new package deps.
- **§11.2 ssr-only / fast sync path:** PASS — render stays synchronous. The work-stack must be bench-gated (recon: `+=` beats array-join 2.5×, so the stack emits via `+=` sink, not array-join); `Frozen` is a pure win after first render. `F-D-094` bench case (raw vs frozen chrome) gates that the de-recursion is throughput-neutral and Frozen is a measured speedup before merge.
- **§11.3 escape-by-default / no XSS:** PASS — `Frozen` caches the output of the same escaping `render()`; nothing is emitted unescaped that wouldn't be already. Guideline forbids freezing nonce-bearing tags (would skip `renderWithNonce`).
- **§11.4 type-safety:** PASS — literal `_t: 3` discriminant, `isFrozen` guard, `RawCtx` literal union replaces the `boolean | string` flag; no `any` in public surface.
- **§11.5 backward-compat:** PASS — additive; `breaking: additive`; no codemod; deep-tree behavior change is strictly a crash→success improvement.
- **§11.6 idiom consistency:** PASS — `Frozen(...)` mirrors `Raw(...)`/`Partial(...)` variadic-style factory naming; `isFrozen` mirrors `isTag`/`isRawString`; no inline JS, no `addAttribute`.
- **§11.7 class-string contract:** N/A — emits no Tailwind classes; no extractor/eslint vocabulary change.
- **§11.8 guideline-sync:** PASS — `## Guidelines impact` covers every `api_surface` symbol: `Frozen()`, `FrozenView`, `isFrozen()` (index + fluent-html.md), and the de-recursion capability change (performance.md). `guideline_updates` lists the three patched files.

## Alternatives considered

- **De-recursion only, ship `Frozen` later.** Rejected as a packaging choice: both land on the same `serialize.ts` dispatch, and `Frozen`'s short-circuit is trivial *after* de-recursion but awkward to bolt onto the recursive version. Bundling them shares one deep-nesting + parity test suite (`F-D-006`).
- **`Frozen` via a memo `WeakMap<View, string>` instead of a wrapper class.** Rejected — a `WeakMap` can't key on `string`/array children, leaks cache lifetime to GC timing, and gives no type-level signal. The wrapper class is request-scope-explicit and discriminable.
- **Auto-freeze "looks static" subtrees.** Rejected — undecidable and unsafe; the per-request footgun (nonce, user data) means freezing must be an explicit author decision.
- **Array-join the de-recursed emitter.** Rejected by recon measurement: `+=` beats `array.push+join` 2.5× on V8 (`00-recon/04-performance.md` §2). The work-stack uses a `+=` sink.
- **Raise the native stack limit / `--stack-size`.** Rejected — host-dependent, doesn't fix `foldView`, and only moves the ceiling.

## Open questions

- **Should `Frozen` deep-freeze (`Object.freeze`) the wrapped tree** to make the "don't mutate after first render" contract enforced rather than documented? Costs construction time; defaults to documented-only unless a verifier wants the hard guarantee.
- **`renderWithNonce` + `Frozen`:** current proposal = frozen nodes are opaque to `applyNonce` (documented "don't freeze nonce tags"). Alternative = `applyNonce` throws if it encounters a `FrozenView` containing a `<script>`/`<style>` — louder but needs a walk into frozen content. Decision for a human.
- **Cache eviction:** the cache lives forever on the wrapper (intended for module-scope constants). Should there be a `Frozen.clear()` escape hatch for hot-reload/dev? Likely a dev-only concern; parked.
