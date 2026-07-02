---
id: RFC-A-002
track: A
title: Context sync-only contract documented + context/streaming tests wired into CI
resolves: [F-A-180, F-A-181, F-A-184]
api_surface: []
breaking: false
ships_to: 6.0.1
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, additive-only, instruction-set, class-vocab-sync, guideline-sync]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md"]
impact: high
effort: S
depends_on: []
status: proposed
---

# RFC-A-002: Context sync-only contract documented + context/streaming tests wired into CI

## Problem

`createContext` / `createRequiredContext` are backed by a **single module-global
value stack** that lives for the process lifetime:

```ts
// src/control/context.ts:70
const stack: T[] = [defaultValue];
// scope() pushes; the Disposable's [Symbol.dispose] pops (lines 77–84, 121–128)
```

`current` reads `stack[stack.length - 1]` (context.ts:73 / :114). This is correct
**only** while the push, every read, and the pop happen on one uninterrupted
synchronous call stack. The serializer that components read during is fully
synchronous and walks the tree exactly once (serialize.ts:312 `emitChunks`), so a
view that does `using _ = Ctx.scope(v); return Component()` is safe.

The failure mode (F-A-180): if an author holds an `await` **between** `scope()`
and the render that reads `current`, the event loop interleaves another request's
`scope()`/dispose onto the *same* global stack, and the first request reads the
second request's value. There is no `AsyncLocalStorage` isolation — by design
(zero-deps, sync hot path) — so the only safe contract is **"no await may be held
open across a live scope."** Today that contract is implied by the JSDoc examples
but never stated, so a plausible misuse silently corrupts output across concurrent
requests.

Two test-coverage gaps make this worse:

- **F-A-181:** `test/context.test.ts` (192 lines, the entire context surface) is
  **absent from both** the `test` and `test:coverage` file lists in
  `package.json:49`/`:50`. The suite exists but never runs in CI — `createContext`,
  `createRequiredContext`, nesting, dispose, and render-time reads ship untested.
- **F-A-184:** `test/stream.test.ts` never reads a context during a streaming
  render (`stream.test.ts:425` is the last `renderToIterable`/`renderToStream`
  case). Nothing pins the build-time-read contract that streaming depends on —
  `emitChunks` walks the tree at iteration time, so a context must be scoped while
  the generator is being drained, and no test asserts that.

This is a **behavior-documentation + test-wiring** RFC. It changes **no public
shape** — the runtime stays byte-identical.

## Proposed API / fix

No API change. Three concrete deliverables:

1. **Document the sync-only contract** — JSDoc on `createContext`/
   `createRequiredContext`, plus README and guidelines. The rule, stated:

   ```ts
   // CONTRACT (context.ts): a scope is valid only on one uninterrupted
   // synchronous call stack. Resolve all async BEFORE opening a scope; never
   // hold an `await` open while a scope is live.
   //
   // ✓  const u = await loadUser(req);
   //    using _ = AuthCtx.scope(u);
   //    return reply.renderView(Page());      // sync render reads the scope
   //
   // ✗  using _ = AuthCtx.scope(await loadUser(req));   // await resolves first — ok
   // ✗  using _ = AuthCtx.scope(u);
   //    const x = await something();          // ✗ scope held across await:
   //    return Page();                        //   another request can corrupt the stack
   ```

   (The first ✗ is actually fine — the await resolves before `scope()` runs. The
   load-bearing ✗ is the second: an await *inside* the scoped block.)

2. **Wire `context.test.ts` into CI** — add `dist/test/context.test.js` to both
   the `test` and `test:coverage` file lists in `package.json`.

3. **Add a streaming context-isolation test** in `test/stream.test.ts` that scopes
   a context, builds a view that reads it, drains `renderToStream` /
   `renderToIterable`, and asserts the streamed bytes reflect the scoped value —
   pinning the build-time-read contract.

## Worked examples (before → after)

### Contract documentation

```ts
// before (v6.0.0) — JSDoc shows only the happy path; the async hazard is unstated.
async function getDashboard(req: Request) {
  using _ = AuthCtx.scope(currentUser);
  const stats = await loadStats();          // ✗ scope held across await — undocumented hazard
  return render(Dashboard(stats));          // under load, AuthCtx.current may be another req's user
}
```

```ts
// after (this RFC) — contract is explicit; the safe shape is the documented one.
async function getDashboard(req: Request) {
  const stats = await loadStats();          // ✓ all async resolved first
  using _ = AuthCtx.scope(currentUser);     // ✓ scope opens on a sync stack
  return render(Dashboard(stats));          // ✓ sync render reads the scope, then it pops
}
```

### Test wiring

```jsonc
// before (v6.0.0) — package.json:49, context.test.js missing
"test": "npm run build && node --test ... dist/test/define-theme.test.js",
```

```jsonc
// after (this RFC)
"test": "npm run build && node --test ... dist/test/define-theme.test.js dist/test/context.test.js",
// same addition to test:coverage at :50
```

### Streaming isolation test (new)

```ts
// after (this RFC) — appended to stream.test.ts
it("a scoped context is read by a streaming render", async () => {
  const Ctx = createContext<"a" | "b">("a");
  function Box() { return Span(Ctx.current); }
  using _ = Ctx.scope("b");
  const out = await streamToString(renderToStream(Div(Box())));
  assert.equal(out, `<div><span>b</span></div>`);
});

it("renderToIterable reads the scope live while draining", () => {
  const Ctx = createContext("x");
  using _ = Ctx.scope("y");
  const out = [...renderToIterable(Span(Ctx.current))].join("");
  assert.equal(out, `<span>y</span>`);
});
```

## Type-safety story

Unchanged — `createContext<T>` / `createRequiredContext<T>` already carry the value
type through `current: T` and `scope(value: T)`, and `T` is typically a literal
union (`createContext<"light" | "dark">`). The async hazard is a **temporal**
property the type system cannot express (TS has no "no await held across this
scope" capability), so it is enforced by **documentation + the new tests**, not by
types. This is the correct lane: the contract is a runtime invariant, and the fix
is to state it and test it, not to widen or narrow any signature.

## Compatibility & version

- **6.0.1 (patch):** Pure docs + test wiring. **No public API changes shape** —
  `context.ts` runtime is untouched; only JSDoc comments are added. Output is
  byte-identical. `package.json` test scripts gain a file; the new streaming test
  is additive. Strictly more correct: the shipped contract becomes documented and
  the context surface goes from 0% CI coverage to fully exercised.
- **6.1.0 (minor):** N/A — nothing additive proposed.
- **parked-major:** A *type-* or *runtime-* enforced async-isolation mechanism
  (e.g. an `AsyncLocalStorage`-backed context, or a render-id token threaded
  through `scope`) would be a breaking shape/dep change and contradicts the
  zero-deps + sync-hot-path guardrails. **Parked** — out of scope for 6.0.1; this
  RFC deliberately documents the boundary instead of moving it.

## Guidelines impact

Both guideline files already say "Never use `AsyncLocalStorage` — sufficient for
synchronous rendering." This RFC makes the *reason* actionable: the missing rule is
"never hold an await across a live scope."

- **Index (`web-development/CLAUDE.md`):** add the do/don't to the Scoped context bullet list.
- **Topic ref (`web-development/fluent-html.md`):** add the async-hazard note under "Scoped Context".
- **Lib-own docs:** JSDoc on both context factories (context.ts) + a CHANGELOG `[6.0.1]` entry. README context section gets the same ✓/✗ pair.

```md
<!-- web-development/CLAUDE.md — append to the Scoped context bullet list (after the createRequiredContext line ~162) -->
- **Sync-only** — resolve all `await`s *before* opening a scope; never hold an await across a live scope (the value stack is process-global, no async isolation):
```typescript
const u = await loadUser(req); using _ = AuthCtx.scope(u); return render(Page()); // ✓
using _ = AuthCtx.scope(u); const x = await load(); return render(Page());        // ✗ corrupts under load
```
```

```md
<!-- web-development/fluent-html.md — insert after line 301 ("Use createContext(default)... always a bug.") -->
**Sync-only contract.** The value stack is process-global with no async isolation. Resolve every `await` **before** opening a scope; never hold an await open while a scope is live — under concurrency another request can corrupt the stack.

```typescript
const user = await loadUser(req);        // ✓ async resolved first
using _ = AuthCtx.scope(user);
return render(Page());                    // ✓ synchronous render reads the scope

using _ = AuthCtx.scope(user);
const data = await loadData();            // ✗ scope held across await
return render(Page(data));                // ✗ AuthCtx.current may be another request's value
```
```

```md
<!-- CHANGELOG.md — new section above [6.0.0] (line 185) -->
## [6.0.1]

### 📝 Documentation & Tests

- **Context sync-only contract documented.** `createContext` / `createRequiredContext` are backed by a process-global value stack with no async isolation (by design — zero deps, synchronous hot path). JSDoc, README, and guidelines now state the rule explicitly: resolve all `await`s before opening a scope; never hold an await open across a live scope. No runtime change.
- **Context suite wired into CI.** `context.test.ts` was never in the `test` / `test:coverage` file lists; the entire context surface shipped untested. Now runs in CI.
- **Streaming context-isolation tests** added — a scoped context read by `renderToStream` / `renderToIterable` is now pinned, locking the build-time-read contract streaming relies on.
```

## Guardrail check

- **zero-deps:** pass — no dependency added; the fix is docs + tests.
- **ssr-only:** pass — no runtime change; sync hot path untouched.
- **escape-by-default:** N/A — no serialization change.
- **type-safety:** pass — the async hazard is temporal, not type-expressible; documented + tested rather than smuggled into a signature.
- **additive-only:** pass — no public shape change; runtime byte-identical (6.0.1 lane).
- **instruction-set:** pass — context is an existing primitive; nothing new shipped.
- **class-vocab-sync:** N/A — no class-emitting method.
- **guideline-sync:** pass — `api_surface` is empty; the Guidelines impact section still patches both guideline files + README/JSDoc/CHANGELOG for the documented contract.

## Alternatives considered

- **`AsyncLocalStorage`-backed context.** Solves true async isolation, but pulls a
  Node-only dependency into the sync hot path and changes the contract — violates
  zero-deps + ssr-portability. Parked-major at best; rejected for 6.0.1.
- **Render-id token threaded through `scope(value, renderId)`.** A breaking
  signature change, and forces every call site to thread a token. Parked-major.
- **Throw if a scope outlives a microtask.** Requires instrumenting dispose timing
  (timers/microtask hooks) — runtime cost + dep, and false positives for legitimate
  long sync renders. Rejected.
- **Document + test only (this RFC).** Lowest cost, fully within the 6.0.1 lane,
  closes the real CI gap, and makes the existing safe contract explicit. Won.

## Open questions

None. If a future major wants real async isolation, the parked-major note above is
the seed.
