---
id: RFC-A-05
track: A
title: Context lifecycle hardening — renderWithScopes, scopeAll, Context.update, fixed dispose & error message
resolves: [F-A-031, F-A-032, F-A-036, F-A-037, F-A-091]
api_surface: ["renderWithScopes()", "renderWithNonceAndScopes()", "scopeAll()", "Context.update()", "ScopeBinding", "fluent-html/testing:withContext()", "fluent-html/testing:withScopes()"]
breaking: false
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md", "web-development/fastify.md"]
impact: high
effort: M
depends_on: []
status: proposed
---

# RFC-A-05: Context lifecycle hardening

## Problem

`Context.scope(value)` pushes onto a **module-global stack** and the returned `Disposable` pops the *top* of the stack, not the item it pushed (`fluent-html/src/control/context.ts:80-83`). This is only correct when scope lifetimes are strictly LIFO — which `using` guarantees inside one synchronous block. It is **not** guaranteed when apps scope in a Fastify `onRequest`/`preHandler` hook and dispose in `onResponse`, because Fastify interleaves concurrent requests between those hooks:

```
req A onRequest: stack = [default, A]
req B onRequest: stack = [default, A, B]
req A handler:   ctx.current === B          ← WRONG value served
req A onResponse: pop() removes B           ← stack now corrupt for B
```

This unsafe hook-lifecycle pattern is in the **canonical project template** (copied into every new app) and 5 production apps:

```ts
// projects-template/templates/full-stack/src/core/i18n/i18n.plugin.ts:34-45
fastify.addHook("onRequest", (request, _reply, done) => {
  request._i18nDispose = [
    i18nTranslation.scope(tFn),   // pushes global stack in onRequest
    i18nLocale.scope(locale),
  ];
  done();
});
fastify.addHook("onResponse", (request, _reply, done) => {
  for (const d of request._i18nDispose) d[Symbol.dispose](); // pops in onResponse
  done();
});
```

The library offers **no safe alternative**, so apps reach for the unsafe one and accrete four more pain points around it:

- **F-A-031** — concurrent requests corrupt the global stack (wrong locale/user/auth served). Evidence: `glimm/src/core/i18n/i18n.plugin.ts:34-45`, `planet-positive-sport/src/auth/auth.plugin.ts:83-88`.
- **F-A-032** — upgrading a value mid-request (locale from header → locale from authed user) has no `update()`, forcing an 8-line dispose+re-scope dance (`glimm/src/core/i18n/i18n.plugin.ts:50-65`).
- **F-A-036** — no multi-scope combinator, so apps hand-track `Disposable[]` and module-augment `FastifyRequest._i18nDispose` (`planet-positive-sport/src/core/i18n/i18n.plugin.ts:60-66, 93-95`).
- **F-A-037** — no test helper bridges scope across `beforeEach`/`afterEach`; 6 test files reinvent 3 different disposal workarounds (`planet-positive-sport/tests/view/setup.ts:10-18`).
- **F-A-091** — `createRequiredContext` error message suggests `AuthCtx.scope(value)` **without** `using _ =`, steering developers into a permanent stack leak (`fluent-html/src/control/context.ts:116`).

The safe pattern already exists in one app — scope *inside the synchronous render call* so the entire scope lifetime is uninterruptible (`jt-vault-cloud/src/core/server.ts:101-108`). This RFC makes that pattern a first-class, type-safe API and hardens the primitive so the unsafe pattern is unnecessary and discouraged.

## Proposed API

```ts
// --- control/context.ts ---

/** A context paired with the value to scope it to. Produced by ctx.bind(value). */
export type ScopeBinding<T = unknown> = {
  readonly _ctx: Context<T>;
  readonly _value: T;
};

export type Context<T> = {
  readonly current: T;
  scope(value: T): Disposable;

  /** Pair this context with a value for renderWithScopes / scopeAll. No stack mutation. */
  bind(value: T): ScopeBinding<T>;

  /**
   * Replace the innermost scoped value in place (no push/pop). Resolves F-A-032.
   * Throws if called outside an active scope.
   */
  update(value: T): void;
};

/**
 * Push several scopes at once; returns ONE Disposable that pops them in reverse
 * (LIFO) order. `using`-compatible. Resolves F-A-036.
 */
export function scopeAll(bindings: readonly ScopeBinding[]): Disposable;

// --- render/render.ts ---

/**
 * Scope every binding, render synchronously, then dispose — all in one
 * uninterruptible call. Physically impossible to scope across an `await`.
 * The recommended way to wire request context into a response. Resolves F-A-031.
 */
export function renderWithScopes(
  bindings: readonly ScopeBinding[],
  ...views: View[]
): string;

/** renderWithScopes + CSP nonce injection (composes renderWithNonce). */
export function renderWithNonceAndScopes(
  nonce: string,
  bindings: readonly ScopeBinding[],
  ...views: View[]
): string;

// --- testing.ts  (new subpath: "fluent-html/testing") ---

/** beforeEach/afterEach pair that scopes one context for the duration of each test. */
export function withContext<T>(ctx: Context<T>, value: T): {
  setup(): void;
  teardown(): void;
};

/** Same, for many contexts. Pass the bindings thunk lazily (re-evaluated per test). */
export function withScopes(bindings: () => readonly ScopeBinding[]): {
  setup(): void;
  teardown(): void;
};
```

Hardening of the existing primitive (no signature change):

```ts
// scope() pops by identity, not by position — robust against mis-ordered disposal.
scope(value: T): Disposable {
  const frame = { value };          // unique frame object
  stack.push(frame);
  let disposed = false;
  return { [Symbol.dispose]() {
    if (disposed) return;           // idempotent
    disposed = true;
    const i = stack.lastIndexOf(frame);
    if (i !== -1) stack.splice(i, 1);
  } };
}

// createRequiredContext error message — resolves F-A-091:
throw new Error(
  `Context "${name}" accessed outside of a scope.\n` +
  `  Fix: using _ = ${name}.scope(value);\n` +
  `  Or:  renderWithScopes([${name}.bind(value)], view)\n` +
  `  ⚠ ${name}.scope(value) WITHOUT "using" leaks the context indefinitely.`,
);
```

## Worked examples (before → after)

### Request wiring (F-A-031)

```ts
// before — projects-template/templates/full-stack/src/core/i18n/i18n.plugin.ts:34-45
fastify.addHook("onRequest", (request, _reply, done) => {
  request._i18nDispose = [          // global-stack push, disposed a hook later
    i18nTranslation.scope(tFn),
    i18nLocale.scope(locale),
  ];
  done();
});
fastify.addHook("onResponse", (request, _reply, done) => {
  for (const d of request._i18nDispose) d[Symbol.dispose]();
  done();
});
// + module augmentation: declare module "fastify" { FastifyRequest { _i18nDispose?: Disposable[] } }
```

```ts
// after — scope inside the synchronous render; no hooks, no Disposable[], no augmentation
function renderView(this: FastifyReply, ...views: View[]) {
  const { tFn, locale } = this.request.i18n;
  this.type("text/html").send(
    renderWithScopes(
      [i18nTranslation.bind(tFn), i18nLocale.bind(locale)],
      ...views,
    ),
  );
}
// scopes are pushed and popped entirely within renderWithScopes — no interleaving possible
```

### Mid-request upgrade (F-A-032)

```ts
// before — glimm/src/core/i18n/i18n.plugin.ts:50-65 (dispose + re-scope, 8 lines)
if (userLocale && userLocale !== request.locale) {
  if (request._i18nDispose) for (const d of request._i18nDispose) d[Symbol.dispose]();
  request._i18nDispose = [i18nTranslation.scope(tFn), i18nLocale.scope(userLocale)];
}
```

```ts
// after — mutate in place
if (userLocale && userLocale !== request.locale) {
  i18nLocale.update(userLocale);
  i18nTranslation.update(tFn);
}
```

### Multi-scope grouping (F-A-036)

```ts
// before — planet-positive-sport/src/core/i18n/i18n.plugin.ts:60-66, 93-95
request._i18nDispose = [
  i18nTranslation.scope(tFn), i18nLocale.scope(locale),
  i18nAvailableLocales.scope(availableLocales), i18nTimeZone.scope("UTC"),
];
// ... onResponse:
if (request._i18nDispose) { for (const d of request._i18nDispose) d[Symbol.dispose](); }
```

```ts
// after — one Disposable, using-compatible
using _i18n = scopeAll([
  i18nTranslation.bind(tFn), i18nLocale.bind(locale),
  i18nAvailableLocales.bind(availableLocales), i18nTimeZone.bind("UTC"),
]);
```

### Test setup (F-A-037)

```ts
// before — planet-positive-sport/tests/view/setup.ts:10-18
let disposables: Disposable[] = [];
beforeEach(() => { disposables = [
  i18nTranslation.scope(tFn), i18nLocale.scope("en"),
  provideAssessmentScope({ mode: "loc" }), provideCanWrite(true),
]; });
afterEach(() => { for (const d of disposables) d[Symbol.dispose](); disposables = []; });
```

```ts
// after — fluent-html/testing
import { withScopes } from "fluent-html/testing";
const ctx = withScopes(() => [
  i18nTranslation.bind(tFn), i18nLocale.bind("en"),
  AssessmentCtx.bind({ mode: "loc" }), CanWriteCtx.bind(true),
]);
beforeEach(ctx.setup);
afterEach(ctx.teardown);
```

## Type-safety story

- **`bind(value)` enforces the value matches the context** at compile time: `i18nLocale.bind(42)` is an error because `Context<T>.bind(value: T)`. The `Context<T>` → `ScopeBinding<T>` pairing keeps the type association that a raw `Disposable[]` throws away — `scope()` returns a bare `Disposable` with no record of which context/type it carries, so the old `Disposable[]` pattern is untyped by construction.
- **`scopeAll` / `renderWithScopes` take `readonly ScopeBinding[]`**, a heterogeneous list where each element independently carries its own `T`. No `any`, no widening to `Context<unknown>` at the call site (`bind` does the existential packing internally; the public surface stays typed).
- **`update(value: T)`** is constrained to the context's own type — you cannot upgrade a `LocaleCtx` to a `User`.
- **`withContext<T>(ctx: Context<T>, value: T)`** — value type checked against the context, same as `bind`.
- No new literal-union or branded-id surface needed; the safety win is purely in re-associating value↔context that the `Disposable[]` workaround had discarded.

## Migration & compatibility

**Additive — nothing breaks.**

- `Context<T>` gains `bind`/`update`; existing `current`/`scope` are unchanged. Apps using `using _ = ctx.scope(v)` keep working verbatim.
- `scope()`'s internal change (pop-by-identity + idempotent dispose) is a **correctness improvement** with the same external contract; strictly-LIFO `using` callers are unaffected, mis-ordered disposers stop corrupting the stack instead of silently breaking.
- New free functions (`scopeAll`, `renderWithScopes`, `renderWithNonceAndScopes`) and the new `fluent-html/testing` subpath are purely additive.
- The hook-lifecycle pattern (`scope()` in `onRequest`, dispose in `onResponse`) still compiles but is now **discouraged** in the guidelines (see below). No codemod required; recommended migration is the worked example above. The template (`projects-template/templates/full-stack/src/core/i18n/i18n.plugin.ts`) should be updated to `renderWithScopes` as part of this RFC's rollout.

`breaking-changes.md`: no entry (additive). One **adoption note**: the i18n plugin template should switch to `renderWithScopes`; flag the old `_i18nDispose` pattern as a known concurrency hazard.

## Guidelines impact

Required (guardrail §11.8) — adds `renderWithScopes`, `scopeAll`, `Context.update`, `bind`, and the `fluent-html/testing` subpath.

### Index — `web-development/CLAUDE.md`

Replace the **Scoped context** bullet block (lines 145-147) with:

```md
**Scoped context** — cross-cutting values read by many components (i18n, theme, auth, nonce, feature flags) instead of prop drilling. Use props for component-specific data. **Never use `AsyncLocalStorage`** for render-time data:
- `createContext(defaultValue)` — returns default when no scope active
- `createRequiredContext(name)` — throws if accessed outside a scope (auth, request data)
- **Wire request context with `renderWithScopes`** — scopes are pushed and popped inside one synchronous render, so concurrent requests never corrupt the global stack:
```typescript
renderWithScopes([LocaleCtx.bind(locale), AuthCtx.bind(user)], Page())  // ✓ safe under concurrency
ctx.scope(v) in onRequest, dispose in onResponse                        // ✗ concurrent requests read each other's value
ctx.update(newLocale)                                                   // ✓ upgrade a scoped value in place (no dispose+re-scope)
using _ = scopeAll([A.bind(x), B.bind(y)])                              // ✓ group scopes into one Disposable
```
```

### Topic ref — `web-development/fluent-html.md`

Append to the **Scoped Context** section (after line 166):

```md
### Wiring request context (concurrency-safe)

`ctx.scope()` mutates a module-global stack; the returned `Disposable` is only LIFO-safe inside one synchronous block. Scoping in a Fastify `onRequest` hook and disposing in `onResponse` **corrupts the stack under concurrent requests** (request A reads request B's value).

✓ Scope inside the synchronous render — `renderWithScopes` pushes, renders, and pops in one uninterruptible call:
```typescript
function renderView(this: FastifyReply, ...views: View[]) {
  this.type("text/html").send(
    renderWithScopes([LocaleCtx.bind(locale), AuthCtx.bind(user)], ...views),
  );
}
renderWithNonceAndScopes(nonce, [LocaleCtx.bind(locale)], view)  // + CSP nonce
```
✗ Don't scope across hook boundaries:
```typescript
fastify.addHook("onRequest", (req, _r, done) => {
  req._dispose = [LocaleCtx.scope(locale)];   // ✗ pushed here, disposed a hook later
  done();
});
```

`ctx.bind(value)` pairs a context with a typed value (no stack mutation) for `renderWithScopes` / `scopeAll`.

### Updating a scoped value mid-request

✓ `ctx.update(value)` replaces the innermost value in place — use when a value upgrades after auth (header locale → user locale):
```typescript
LocaleCtx.update(user.preferredLocale);   // ✓ no dispose + re-scope dance
```

### Grouping scopes

✓ `scopeAll(bindings)` returns one `Disposable` (pops in reverse order), `using`-compatible:
```typescript
using _ = scopeAll([LocaleCtx.bind("en"), TimeZoneCtx.bind("UTC"), AuthCtx.bind(user)]);
```
✗ Don't hand-track `Disposable[]` + manual dispose loops.

### Tests — `fluent-html/testing`

✓ Bridge a scope across `beforeEach`/`afterEach` with `withContext` / `withScopes`:
```typescript
import { withScopes } from "fluent-html/testing";
const ctx = withScopes(() => [AuthCtx.bind(mockUser), LocaleCtx.bind("en")]);
beforeEach(ctx.setup);
afterEach(ctx.teardown);
```
✗ Don't reinvent `let disposables: Disposable[]` accumulators per test file.
```

### Topic ref — `web-development/fastify.md`

Add under the SSR responses / `renderView` guidance:

```md
**Request-scoped context** — wire it inside `renderView` with `renderWithScopes`, never in `onRequest`/`onResponse` hooks (concurrent requests corrupt the shared stack):
```typescript
reply.renderView = function (...views) {
  this.type("text/html").send(
    renderWithScopes([LocaleCtx.bind(this.request.locale), AuthCtx.bind(this.request.user)], ...views),
  );
};
```
```

**Adoption note:** the existing guideline taught only `using _ = ctx.scope(v)` inside a handler and never addressed Fastify hook lifecycles, so apps independently invented the unsafe `onRequest`-scope / `onResponse`-dispose pattern (now in the project template). The fix is teaching `renderWithScopes` as the request-wiring entry point, not the bare primitive.

## Guardrail check

- §11.1 zero-deps: pass — pure TS, no new dependencies.
- §11.2 ssr-only / sync hot path: pass — `renderWithScopes` is synchronous and contains the scope lifetime *within* render; explicitly forbids scoping across `await`. Sync hot path untouched (`scope()` still O(1) push; `lastIndexOf`/`splice` on dispose is bounded by live scope depth, single digits in practice).
- §11.3 escape-by-default: N/A — no new markup emitted; `renderWithScopes` delegates to existing `render`/`renderWithNonce`.
- §11.4 type-safety: pass — `bind`/`update`/`withContext` are typed against `Context<T>`; no `any` on the public surface; `ScopeBinding` packs the existential internally.
- §11.5 backward-compat: pass — additive; no signature changes; `scope()` keeps its external contract.
- §11.6 idioms: pass — single-source `bind`/`renderWithScopes` over manual `Disposable[]`, matches the library's "give a safe combinator, discourage the footgun" voice.
- §11.7 class-string contract: N/A — emits no Tailwind classes; no Track-C tooling impact.
- §11.8 guideline-sync: pass — Guidelines impact patches `CLAUDE.md` + `fluent-html.md` + `fastify.md`, covering every symbol in `api_surface` (`renderWithScopes`, `renderWithNonceAndScopes`, `scopeAll`, `Context.update`, `bind`, `withContext`/`withScopes`).

## Alternatives considered

- **Switch to `AsyncLocalStorage`.** Rejected — violates the project's standing "never ALS for render-time data" rule and §11.2; render is synchronous, so ALS buys nothing and adds overhead.
- **Make `scope()` throw if disposed out of LIFO order.** Rejected — turns a latent corruption into a crash but doesn't give apps a safe path; `renderWithScopes` removes the hazard entirely instead of policing it.
- **Pop-by-index returned from `scope()` (caller passes the index back).** Rejected — leaks stack internals into the API and is still order-fragile across hooks. Pop-by-identity (`lastIndexOf(frame)`) is internal and robust without exposing anything.
- **`ctx.scope(value, fn)` callback form instead of `renderWithScopes`.** Considered; `renderWithScopes(bindings, ...views)` reads better at the response boundary, batches multiple contexts in one call, and mirrors the existing `render(...views)` variadic shape. `scopeAll` covers the general `using` case.

## Open questions

- Should `update()` on `createContext` (non-required) be allowed when only the default frame is present (stack length 1)? Proposed: yes, it overwrites the default frame for the current sync call; for `createRequiredContext` it throws when no scope is active. Confirm this asymmetry is acceptable.
- New subpath `fluent-html/testing` adds a `package.json` exports entry. Confirm it should ship in the main package (vs a `@fluent-html/testing` companion) — main package keeps zero-dep and is simplest for adopters.
