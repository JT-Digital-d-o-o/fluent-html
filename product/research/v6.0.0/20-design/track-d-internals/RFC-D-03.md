---
id: RFC-D-03
track: D
title: Dedup render/stream into one shared emitter; make renderAlgebra a thin wrapper (fix lossy fold renderer)
resolves: [F-D-003, F-D-031, F-D-032, F-D-083, F-D-012, F-D-092, F-D-034]
api_surface: ["renderToStream(...views)", "renderAlgebra"]
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/fluent-html.md"]
impact: high
effort: L
depends_on: []
status: proposed
---

# RFC-D-03: Dedup render/stream into one shared emitter; fix lossy renderAlgebra

## Problem

There are **three** HTML serializers in the library that must agree but cannot:

1. **`render()`** — `src/render/render.ts` — the canonical, correct one (20+ HTMX attrs, void elements, script/style sanitization, `_sk` schema-key loop, escape-by-default).
2. **`renderToStream()`** — `src/render/stream.ts` — a ~70-line **verbatim copy** of render's serialization. The file's own comment admits it (`stream.ts:14-15`: _"duplicated here to avoid circular deps"_). The copy has **already drifted**: `str()` in stream has a `v as string` cast (`stream.ts:24`) not in render. And the entry point drifted further — `render()` is variadic `(...views)` (`render.ts:33`), `renderToStream()` takes a single `view` (`stream.ts:111`), so porting a multi-swap handler to streaming breaks at compile time (F-D-034).
3. **`renderAlgebra`** — `src/fold/algebras/render.ts` — a **third, lossy** serializer over the fold layer, **exported as public API** (`src/index.ts:343`). Its own comment says _"use render() for production"_ (`render.ts:69`). It is broken three ways:
   - **Only 4 of 20+ HTMX attrs** (`render.ts:34-40`): `target`, `swap`, `trigger` + method. Silently drops `pushUrl`, `replaceUrl`, `swapOob`, `vals`, `headers`, `confirm`, `boost`, `optimistic`, `status`, … (F-D-032, F-D-083). A nav link built with `setHtmx(...{pushUrl:true})` renders without `hx-push-url` — functionally broken, no error.
   - **No void-element handling** (`render.ts:66-70`): emits `<img ...></img>`, `<input ...></input>` — invalid HTML that can confuse idiomorph during partial swaps (F-D-031).
   - **No script/style sanitization** (`render.ts:68-69`): `foldView(renderAlgebra, Script(userInput))` skips the `</script>` break-out guard that `render()` applies — a latent XSS gap on exported public API (F-D-003, F-D-083, guardrail §11.3).
   - **Double-emits element attrs** (`render.ts:23-30`): a second `Object.entries(attrs)` pass re-emits `href`/`src`.

Underneath all three: `renderImpl`/`streamImpl` thread a **tri-typed `boolean | string`** raw-context flag (`render.ts:184`, `stream.ts:120`) where `false`=escape, `true`=raw passthrough, `'script'|'style'`=sanitize — three dispatch modes on one param, requiring `typeof === 'string'` guards in every branch and a silent `true` fallthrough (F-D-092).

Every new HTMX attr, escape fix, or void element must be hand-applied in 2–3 places with **zero compiler enforcement**. The drift is not hypothetical — it has already happened (the `v as string` cast, the variadic mismatch, the 16 missing HTMX attrs).

## Proposed API

Internal: one emitter parameterized by a **sink** and a **typed render context**. Public surface stays the same except `renderToStream` becomes variadic and `renderAlgebra` becomes a correct thin wrapper.

```ts
// src/render/serialize.ts  (NEW — single source of truth)

/** Typed render context — replaces the tri-typed `boolean | string` flag (F-D-092). */
export type RenderCtx = 'escape' | 'raw' | 'script' | 'style';

/** Output sink. `append` returns the backpressure signal (false ⇒ pause). */
export interface Sink {
  append(s: string): boolean;
}

/** Accumulates into a string; `append` always returns true. */
export class StringSink implements Sink {
  html = '';
  append(s: string): boolean { this.html += s; return true; }
}

/** Pushes to a node:stream Readable; returns its backpressure signal. */
export class StreamSink implements Sink {
  constructor(private readonly stream: import('node:stream').Readable) {}
  append(s: string): boolean { return this.stream.push(s); }
}

/** The one serializer. render/stream/renderAlgebra all route through this. */
export function emit(sink: Sink, view: View, ctx: RenderCtx): void;

// Shared constants/helpers move here too (were duplicated in render.ts + stream.ts):
export const VOID_ELEMENTS: ReadonlySet<string>;
export function buildHtmx(htmx: HTMX): string;          // the 20+-attr table, single copy
export function sanitizeRawContent(s: string, el: 'script' | 'style'): string;
```

```ts
// src/render/render.ts  (thin wrapper — unchanged signature)
export function render(...views: View[]): string {
  const sink = new StringSink();
  emit(sink, views.length === 1 ? views[0]! : views, 'escape');
  return sink.html;
}
export function renderWithNonce(nonce: string, ...views: View[]): string { /* applyNonce + emit */ }
```

```ts
// src/render/stream.ts  (thin wrapper — now VARIADIC, resolves F-D-034)
export function renderToStream(...views: View[]): Readable {
  const view = views.length === 1 ? views[0]! : views;
  return new Readable({
    read() { emit(new StreamSink(this), view, 'escape'); this.push(null); },
  });
}
```

```ts
// src/fold/algebras/render.ts  (thin wrapper — correct by construction, resolves F-D-003/031/032/083)
// renderAlgebra keeps its ViewAlgebra<string> shape (foldView/hyloView compat), but its `tag`
// case now delegates serialization of THIS node to the shared emitter, so it cannot drift.
export const renderAlgebra: ViewAlgebra<string> = {
  text: (s) => { const k = new StringSink(); emit(k, s, 'escape'); return k.html; },
  raw:  (html) => html,
  tag:  (element, attrs, childHtml) => {
    // attrs → reconstruct minimal Tag-shaped node, emit open+close via shared path,
    // splice already-folded childHtml between. Void/script/style/HTMX all handled by emit().
    const open = emitOpenTag(element, attrs);          // shared: VOID_ELEMENTS + buildHtmx + escape
    if (VOID_ELEMENTS.has(element)) return open;        // F-D-031 fixed
    return open + childHtml + `</${element}>`;
  },
  list: (htmls) => htmls.join('\n'),
};
```

No new runtime dependency. No new public symbol — `RenderCtx`, `Sink`, `StringSink`, `StreamSink`, `emit`, `emitOpenTag` are internal to `src/render/` (not re-exported from `src/index.ts`).

## Worked examples (before → after)

### 1. Multi-swap streaming — `renderToStream` variadic (F-D-034)

```ts
// before (today) — render() is variadic but renderToStream() is not (stream.ts:111)
render(
  Partial(ids.list,  UserList(users)),
  Partial(ids.count, Span(`${users.length}`)),
)                                                       // ✓ compiles
renderToStream(
  Partial(ids.list,  UserList(users)),
  Partial(ids.count, Span(`${users.length}`)),
)                                                       // ✗ TS error: expected 1 arg
renderToStream([                                        // forced array workaround
  Partial(ids.list,  UserList(users)),
  Partial(ids.count, Span(`${users.length}`)),
])
```

```ts
// after — symmetric with render(); the array workaround is gone
renderToStream(
  Partial(ids.list,  UserList(users)),
  Partial(ids.count, Span(`${users.length}`)),
)                                                       // ✓ compiles
```

### 2. Fold-rendered nav link — HTMX no longer dropped (F-D-032)

```ts
// before — foldView(renderAlgebra, ...) of the documented nav-link pattern
foldView(renderAlgebra,
  A("Settings").setHtmx(settingsRoutes.index({
    swap: "outerMorph", target: ids.mainContent, pushUrl: true,
  })).cursor("pointer"))
// → '<a hx-get="/settings" hx-target="#mainContent" hx-swap="outerMorph">Settings</a>'
//   hx-push-url SILENTLY DROPPED — back/forward nav broken, no error
```

```ts
// after — identical bytes to render()
// → '<a class="cursor-pointer" hx-get="/settings" hx-swap="outerMorph"
//      hx-target="#mainContent" hx-push-url="true">Settings</a>'
```

### 3. Fold-rendered void element + script (F-D-031, F-D-003)

```ts
// before
foldView(renderAlgebra, Img().setSrc("/photo.jpg"))
// → '<img src="/photo.jpg"></img>'                     // invalid HTML
foldView(renderAlgebra, Script(userControlled))
// → '<script>...</script>...' with </script> break-out NOT neutralized  // XSS gap
```

```ts
// after — routed through emit()
// → '<img src="/photo.jpg">'                            // F-D-031 fixed
// → '<script>...<\/script>...'                          // F-D-003 fixed (sanitized)
```

### 4. Internal: typed render context (F-D-092)

```ts
// before (render.ts:184) — three meanings on one param, guards everywhere
function renderImpl(view: View, isRawContext: boolean | string): string {
  if (typeof view === "string") {
    if (isRawContext === false) return escapeHtml(view);
    if (typeof isRawContext === 'string') return sanitizeRawContent(view, isRawContext);
    return view;                                          // silent `true` fallthrough
  }
```

```ts
// after (serialize.ts) — one explicit literal-union switch, no type guards
function emitText(sink: Sink, s: string, ctx: RenderCtx): void {
  if (ctx === 'escape') return void sink.append(escapeHtml(s));
  if (ctx === 'raw')    return void sink.append(s);
  return void sink.append(sanitizeRawContent(s, ctx)); // ctx narrowed to 'script' | 'style'
}
```

## Type-safety story

- **Literal union over `boolean | string`** — `RenderCtx = 'escape' | 'raw' | 'script' | 'style'` makes each mode a named state; the compiler narrows `ctx` to `'script' | 'style'` in the sanitize branch (guardrail §11.4). Adding a future `'noscript'` context is a compile error in `assertNever` until handled, instead of a silent mis-order.
- **`Sink` interface, not a union of callbacks** — `append(s): boolean` is one contract; `StringSink` ignores the return, `StreamSink` forwards real backpressure. The boolean signal is structurally there for the future incremental-streaming RFC without an API change.
- **Variadic parity is type-enforced** — `renderToStream(...views: View[])` now has the *same* signature shape as `render`, so the multi-swap pattern type-checks identically; the drift that produced the asymmetry can't recur because both wrappers share `emit`.
- **`renderAlgebra: ViewAlgebra<string>` shape preserved** — existing `foldView(renderAlgebra, v)` / `hyloView(coalg, renderAlgebra, seed)` call sites keep compiling; only the *output* becomes correct.
- **`sanitizeRawContent(s, el: 'script' | 'style')`** — narrowed from `string`, so callers can't pass an arbitrary element name.

## Migration & compatibility

**Additive — nothing breaks.**

- `render` / `renderWithNonce` — byte-identical output; signatures unchanged.
- `renderToStream` — widened from `(view)` to `(...views)`. Single-arg callers are unaffected; the previous array workaround `renderToStream([a, b])` still works (a `View[]` is a `View`). Pure widening, no codemod needed.
- `renderAlgebra` — same `ViewAlgebra<string>` type, **output changes from buggy to correct**. This is a bug fix, not a contract break: HTMX attrs that were dropped now appear, `<img></img>` becomes `<img>`, script/style get sanitized. Any test snapshotting the *old broken* output must be regenerated — list in `breaking-changes.md` under "Bug-fix output changes (renderAlgebra)" as a note, not a breaking entry.
- Internal `serialize.ts` symbols (`emit`, `Sink`, `RenderCtx`, …) are **not** exported from `src/index.ts` — no new public surface to maintain.

**Test coverage added (closes the gaps the findings flag):** a property/fuzz test asserting `foldView(renderAlgebra, v) === render(v)` over generated trees that include void elements, `Script`/`Style`, and every HTMX attr (F-D-031/032/083 parity holes in `test/fold.ts:246-265`); plus a `renderToStream` vs `render` equality fuzz so the wrappers can never diverge again (F-D-012).

## Guidelines impact

`renderAlgebra` is currently **untaught** in `guidelines/web-development/**` (grep: no mention) — which is itself why apps reached for the broken fold renderer without a steer. The fix is additive surface (variadic stream + a "use `render`, not `renderAlgebra`, for output" steer), so per §11.8 it must be taught. No index (`CLAUDE.md`) rule change is needed beyond the topic ref — `render`/`renderToStream` are already in `fluent-html.md`'s Rendering block; we extend that block.

- **Topic ref (`web-development/fluent-html.md`)** — extend the existing `## Rendering` block (currently lines 172-179) with the variadic-stream rule and the renderAlgebra steer. Replace the block verbatim:

```md
## Rendering

```typescript
render(Div("Hello"))                 // <div>Hello</div>
render(Li("One"), Li("Two"))         // ✓ variadic — multiple roots, no wrapper
HTML(Head(), Body()).setLang("en")   // document root
renderWithNonce(nonce, view)         // applies CSP nonce to all Script/Style tags
```

**Streaming** — `renderToStream` is variadic, symmetric with `render`. Use it for large SSR pages to flush early bytes:

```typescript
renderToStream(PageView())                         // ✓ Readable, single root
renderToStream(Partial(ids.list, L()), Partial(ids.count, C()))  // ✓ multi-swap, no array wrapper
renderToStream([Partial(ids.list, L()), Partial(ids.count, C())]) // ✗ legacy array workaround — drop it
```

**Output rendering = `render` / `renderToStream` only.** `renderAlgebra` is for *fold experiments* (`foldView`/`hyloView`), never for producing response HTML:

```typescript
reply.renderView(PageView())                       // ✓ canonical SSR output
render(PageView())                                  // ✓ string output
foldView(renderAlgebra, view)                       // ✗ not for responses — fold/analysis only
```
```

## Guardrail check

- §11.1 zero-deps: pass — no new dependency; `node:stream` already used by `stream.ts`.
- §11.2 ssr-only / fast sync path: pass — `StringSink.append` is `this.html += s` (the measured-fastest `+=`, recon §2); `emit` keeps the same recursion shape and `\n`-join semantics. No async added. Benchmark-gated (bench must not regress).
- §11.3 escape-by-default: pass — **net improvement**; `renderAlgebra` now goes through the canonical sanitizer, closing the script/style XSS gap (F-D-003/083). `'escape'` is the default ctx in every wrapper.
- §11.4 type-safety: pass — `boolean | string` → `RenderCtx` literal union; `Sink` interface; sanitize element narrowed to `'script' | 'style'`.
- §11.5 backward-compat: pass — additive; `renderToStream` widened; `renderAlgebra` output is a bug fix (noted in `breaking-changes.md`, no codemod).
- §11.6 idioms: pass — preserves variadic children, `setHtmx`/`Partial`/`defineIds` patterns in examples; no `addClass`/`addAttribute` introduced.
- §11.7 class-string contract: N/A — emits no new Tailwind classes.
- §11.8 guideline-sync: pass — `## Guidelines impact` covers both `api_surface` symbols (`renderToStream(...views)` variadic rule; `renderAlgebra` not-for-output steer) in `fluent-html.md`; `guideline_updates` lists the patched file.

## Alternatives considered

- **Delete `renderAlgebra` (breaking).** Cleanest, but it's exported and used in tests (`test/fold.ts:8`, `test/recursion-schemes.ts:9`); deletion forces a major-version break for a symbol we can instead make *correct* for free via the shared emitter. Wrapper wins: it kills the drift permanently and keeps `foldView`/`hyloView` rendering working.
- **Keep three serializers, add a parity test only (F-D-083 Option B).** Catches drift after the fact but doesn't prevent it; every future HTMX attr still needs three edits. Structural dedup makes parity an invariant, not a test obligation.
- **Keep the `boolean | string` flag.** Works today but blocks the clean shared `emit(ctx)` signature and stays a security-audit hazard (F-D-092). The literal union is free and self-documenting.
- **Array-join sink instead of `+=` StringSink.** Rejected — recon §2 measured `+=` at 2.5× the array-join throughput. `StringSink` keeps `+=`.

## Open questions

- Should the `Sink.append` backpressure boolean be *honored now* (pause/resume) or just *plumbed* for a later incremental-streaming RFC? This RFC plumbs it (the eager one-tick `read()` is unchanged); true backpressure is a separate Track-D RFC. Confirm that split is acceptable.
- `breaking-changes.md`: file the `renderAlgebra` output correction as a "bug-fix output change" note (not a breaking entry) — confirm the policy wording with a human.
