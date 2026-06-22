---
id: RFC-D-04
track: D
title: Render-time CSP nonce — non-mutating, single-pass, stream-capable
resolves: [F-D-101, F-D-033, F-D-024]
api_surface: ["render(opts)", "renderWithNonce()", "renderToStream(view, opts)", "renderToStreamWithNonce()", "RenderOptions"]
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md", "web-development/fastify.md"]
impact: high
effort: M
depends_on: []
status: proposed
---

# RFC-D-04: Render-time CSP nonce — non-mutating, single-pass, stream-capable

## Problem

The library's only CSP support, `renderWithNonce(nonce, ...views)`, is implemented as a **pre-pass that permanently mutates the view tree** (`src/render/render.ts:49-66`). Three real defects fall out of that one design choice:

1. **Stale-nonce corruption (F-D-101, bug, high).** `applyNonce` calls `tag.setNonce(nonce)`, which writes `this.attributes['nonce'] = nonce` onto the live `Tag` instance and never restores it (`tag.ts:157-163`). Any view reused across requests — the natural SSR pattern — is now secretly stateful:

   ```ts
   const page = Div(Script("console.log('hi')"), P("body"));
   renderWithNonce("nonce-abc", page);
   render(page); // emits <script nonce="nonce-abc"> even though no nonce was requested — WRONG
   ```

   A shared layout or a `Frozen`/static-subtree hoist (a separate v6 perf RFC) gets a wrong, leaked nonce on every subsequent render.

2. **No streaming parity (F-D-033, missing-api, high).** `renderToStream(view)` has no nonce variant (`stream.ts:111-118`; `index.ts:23-24`). An app that streams large SSR pages **and** enforces `script-src 'nonce-...'` must abandon streaming or hand-mutate the tree.

3. **Double traversal (F-D-024, perf, medium).** `renderWithNonce` walks the tree twice — once to mutate, once to serialize — making it ~2× `render` even on pages with zero `<script>`/`<style>` tags, and breaking the `EMPTY_ATTRS` fast-path (`render.ts:219`) for every stamped tag.

This is why the cited app **disables CSP entirely**: `ttl/src/core/server.ts:50` sets `contentSecurityPolicy: false` with the comment *"Disable CSP by default — enable and configure per-project"*, and the `renderView` decorator (`ttl/src/core/server.ts:78-82`) calls `render(...views)` with no nonce path. There is no safe, ergonomic way to thread a per-request nonce through the shared decorator today.

Root cause: nonce is a **per-request render-time value**, but the API models it as **construction-time tree state**. Fix the model: thread the nonce through `renderImpl`/`streamImpl` and emit it inline at the `<script>`/`<style>` boundary the renderer already special-cases (`render.ts:239`).

## Proposed API

```ts
/** Per-render options. All fields optional; absent = today's behavior. */
export type RenderOptions = {
  /** CSP nonce stamped on every <script> and <style> at render time. Non-mutating. */
  readonly nonce?: string;
};

// render() — overloaded so the variadic form is untouched, opts form is additive.
export function render(...views: View[]): string;
export function render(view: View, opts: RenderOptions): string;

// Thin, discoverable wrapper — unchanged signature, now non-mutating + single-pass.
export function renderWithNonce(nonce: string, ...views: View[]): string;

// Stream gets the same options bag…
export function renderToStream(view: View, opts?: RenderOptions): Readable;

// …and the parity wrapper that did not exist before.
export function renderToStreamWithNonce(nonce: string, view: View): Readable;
```

Internal contract (not exported) — nonce threaded as a third arg, no new traversal:

```ts
function renderImpl(view: View, ctx: RawCtx, nonce?: string): string;
function streamImpl(stream: Readable, view: View, ctx: RawCtx, nonce?: string): void;
// at the script/style branch (render.ts:239), when nonce !== undefined and the tag
// has no author-set nonce, append ` nonce="${escapeAttr(nonce)}"` to attrs inline.
// applyNonce() and the setNonce() pre-pass are deleted from the render path.
```

Precedence rule: an **author-set** `.setNonce(...)` on a tag wins over the render-time nonce (explicit beats ambient). The render-time nonce only fills tags that have none.

## Worked examples (before → after)

### App wiring — `ttl/src/core/server.ts:78-82`

```ts
// before (today): renderView decorator has no nonce path, so CSP is OFF (server.ts:50)
fastify.decorateReply("renderView", function (this: FastifyReply, ...views: View[]) {
  this.type("text/html").send(render(...views));
});
// contentSecurityPolicy: false  ← can't safely thread a per-request nonce
```

```ts
// after (RFC-D-04): one render-time field, no tree mutation, CSP can be ON
fastify.decorateReply("renderView", function (this: FastifyReply, ...views: View[]) {
  const view = views.length === 1 ? views[0]! : views;
  this.type("text/html").send(render(view, { nonce: this.cspNonce.script }));
});
// helmet contentSecurityPolicy: { scriptSrc: ["'self'", (_, res) => `'nonce-${res.cspNonce.script}'`] }
```

The shared layout view is built once and reused across requests — now safe, because nothing is written back onto it.

### Reuse corruption — F-D-101 repro

```ts
// before: tree is permanently mutated; second render leaks the nonce
const page = Div(Script("console.log('hi')"), P("body"));
renderWithNonce("nonce-abc", page);
render(page); // <script nonce="nonce-abc"> — WRONG
```

```ts
// after: render-time only; page is never touched
const page = Div(Script("console.log('hi')"), P("body"));
renderWithNonce("nonce-abc", page); // <script nonce="nonce-abc">
render(page);                       // <script> — clean, deterministic ✓
```

### Streaming parity — F-D-033

```ts
// before: no option — must drop streaming or hand-mutate the tree
reply.type("text/html").send(renderToStream(BigPage())); // CSP nonce impossible
```

```ts
// after: parity wrapper, or the opts bag directly
reply.type("text/html").send(renderToStreamWithNonce(reply.cspNonce.script, BigPage()));
// or: renderToStream(BigPage(), { nonce: reply.cspNonce.script })
```

## Type-safety story

- **`RenderOptions` is a closed, `readonly` literal-keyed type** — no bare `string` bag. Adding `nonce?: string` here (not as a positional `string`) means future per-render knobs (e.g. `pretty?: boolean`) extend one named type, and a typo like `{ noce: x }` is an excess-property compile error.
- **Overloaded `render`** keeps the variadic `render(...views)` call shape intact (no inference regression for the common multi-view case) while the `render(view, opts)` overload is unambiguous: `RenderOptions` is an object, `View` array elements are not, so TS picks the right overload without a discriminant.
- **The internal `RawCtx` union** (`'escape' | 'raw' | 'script' | 'style'`, adopted from recon §4) replaces the tri-typed `boolean | string` ctx flag, so the new nonce branch dispatches on a self-documenting literal union instead of a clever encoding — the nonce emit point (`el === 'script' || el === 'style'`) is type-checked against the same union.
- **`renderWithNonce` / `renderToStreamWithNonce`** keep `nonce: string` required (a nonce is meaningless when empty), so callers can't pass `undefined` into the "with nonce" path by accident — that's what the optional `opts.nonce` form is for.

## Migration & compatibility

**Additive — nothing breaks for correct callers.**

- `render(...views)` variadic form: unchanged signature, unchanged output.
- `renderWithNonce(nonce, ...views)`: unchanged signature; output is **identical** for the single-render case that every test exercises (`test/security.ts:262-285` passes as-is). The only behavior change is the **removal of a latent bug** — the tree is no longer mutated. Any code that *depended on* the post-mutation tree (i.e. relied on the leak) was already broken; none is known.
- `renderToStream(view)`: gains an optional second arg; existing one-arg calls are unaffected.
- New symbols `renderToStreamWithNonce`, `RenderOptions`, and the `render(view, opts)` overload are purely additive.

**Codemod:** none required. Optional adoption codemod (cosmetic): rewrite `renderWithNonce(n, v)` → `render(v, { nonce: n })` where the wrapper is not preferred. Not necessary; both stay supported.

**`breaking-changes.md`:** no entry (additive). Add a *note* under "Bug fixes": *"`renderWithNonce` no longer mutates the view tree; nonce is applied at render time only."*

## Guidelines impact

Adds/clarifies public surface (`render(view, opts)`, `renderToStreamWithNonce`, `RenderOptions`) → guardrail §11.8 requires the edits below. House style: snippet-first, ✓/✗, LLM reader.

### Index — `web-development/CLAUDE.md`

Under `## Security` (after the auth bullets, line ~321), add:

```md
- **CSP nonce is render-time, never tree state** — pass `{ nonce }` to `render`/`renderToStream`; never `.setNonce()` in a pre-pass on a shared view (mutates it permanently, leaks the nonce into later renders).
  ```typescript
  render(view, { nonce: reply.cspNonce.script })            // ✓ per-request, non-mutating
  renderToStreamWithNonce(reply.cspNonce.script, view)      // ✓ streaming parity
  applyNonce(view); render(view)                            // ✗ mutates shared tree (stale-nonce bug)
  ```
```

In the `## fluent-html` block's rendering note is in the topic ref; no index code-rule change there beyond the Security bullet above.

### Topic ref — `web-development/fluent-html.md`

Replace the `## Rendering` block (lines 172-179) with:

```md
## Rendering

```typescript
render(Div("Hello"))                          // <div>Hello</div>
render(Li("One"), Li("Two"))                  // multiple elements, no wrapper
HTML(Head(), Body()).setLang("en")            // document root

// CSP nonce — render-time, non-mutating. Fills every <script>/<style> without an explicit nonce.
render(view, { nonce })                        // ✓ preferred; one shared layout, safe to reuse
renderWithNonce(nonce, view)                   // ✓ thin wrapper, same effect
renderToStream(view, { nonce })                // ✓ streaming + CSP
renderToStreamWithNonce(nonce, view)           // ✓ streaming wrapper
```

- `nonce` is a **per-request render-time value**, never construction state. Never stamp it onto a shared/cached view — that mutates the tree and leaks the nonce into later `render()` calls.
- An author-set `Script(...).setNonce(x)` wins over the render-time nonce (explicit > ambient).
- `RenderOptions = { nonce?: string }` — the options bag for `render`/`renderToStream`.
```

### Topic ref — `web-development/fastify.md`

Under `## Module Augmentation` / the `renderView` decorator area (after line ~62), add:

```md
### CSP nonce in `renderView`

Thread the per-request nonce through `render` — do not mutate the view:

```typescript
fastify.decorateReply("renderView", function (this: FastifyReply, ...views: View[]) {
  const view = views.length === 1 ? views[0]! : views;
  this.type("text/html").send(render(view, { nonce: this.cspNonce.script }));  // ✓
});
// helmet: contentSecurityPolicy: { directives: { scriptSrc: ["'self'", (_, res) => `'nonce-${res.cspNonce.script}'`] } }
```

✗ Never `renderWithNonce` against a layout you build once and reuse without the render-time path — pre-mutation leaks the nonce across requests.
```

**Adoption note:** the old `fluent-html.md` line *"`renderWithNonce(nonce, view)` — applies CSP nonce to all Script/Style tags"* under-sold the hazard and gave no Fastify wiring — so apps (e.g. `ttl`) defaulted to `contentSecurityPolicy: false` rather than discover the mutation footgun. The new guideline makes the render-time `{ nonce }` form the default and shows the decorator wiring, so CSP-on becomes the easy path.

## Guardrail check

- **§11.1 zero-deps:** pass — no new runtime dependency; pure internal refactor.
- **§11.2 ssr-only / hot path:** pass — removes a full traversal (F-D-024); the nonce branch is a single `undefined` check + string append at the existing script/style dispatch, off the common path. `render(...views)` with no opts is byte-identical and allocation-identical to today.
- **§11.3 escape-by-default:** pass — render-time nonce is emitted via `escapeAttr(nonce)`, same escaping as today's `setNonce` path (covered by `test/security.ts:284`); add a streaming-nonce escape test mirroring it.
- **§11.4 type-safety:** pass — `RenderOptions` named type, overloaded `render`, internal `RawCtx` literal union; no `any` in the new surface.
- **§11.5 backward-compat:** pass — additive; no codemod required; existing signatures and outputs preserved; the only behavior delta is removal of a bug.
- **§11.6 idioms:** pass — options bag matches library voice; wrappers preserve the discoverable `*WithNonce` names; precedence respects author-set `.setNonce`.
- **§11.7 class-string contract:** N/A — emits no Tailwind classes; no extractor/eslint impact.
- **§11.8 guideline-sync:** pass — Guidelines impact patches CLAUDE.md (index), fluent-html.md and fastify.md (topic refs), covering every `api_surface` symbol (`render(opts)`, `renderWithNonce`, `renderToStream(opts)`, `renderToStreamWithNonce`, `RenderOptions`); `guideline_updates` frontmatter lists all three.

## Alternatives considered

1. **Keep `applyNonce` but snapshot/restore the tree (save-old-nonce, render, restore).** Rejected: still allocates per stamped tag, still double-traverses, not thread-safe under any future view reuse, and far more code than threading a param.
2. **`applyNonce` returns a cloned subtree (immutable pre-pass).** Rejected: clones the whole tree per request — strictly worse than today's perf and against §11.2; the renderer already visits every node, so a second structural pass is pure waste.
3. **Context-based nonce (`createRequiredContext`) read inside render.** Tempting (matches the "nonce" example already in the context guideline), but the renderer is not context-aware and adding a context read to the hot path for a feature most renders don't use is the wrong tradeoff; an explicit render-time arg is cheaper and clearer. The context approach can still be layered *on top* by an app (read context → pass `{ nonce }`).
4. **Separate `renderWithNonce` only, no `render(view, opts)` overload.** Rejected: the decorator wiring is cleanest with the options bag, and `renderToStream` needs the same shape — one `RenderOptions` type serves all four entry points and future knobs.

## Open questions

1. **Precedence** — confirm "author `.setNonce` wins over render-time nonce" is desired (vs render-time always wins). Proposed: author wins (explicit > ambient). Decision for a human.
2. **`NONCE_ELEMENTS` scope** — keep nonce restricted to `<script>`/`<style>` (today's set). Any appetite to also stamp `<link rel=preload as=script>`? Out of scope here; note for a follow-up.
3. **Wrapper retention** — keep `renderWithNonce` long-term, or `@deprecate` it in favor of `render(view, { nonce })` in a later major? Proposed: keep (additive, zero cost); revisit at the v6 deprecation sweep.
