---
rfc: RFC-A-G5
lens: type-safety
verdict: survives-with-changes
confidence: 0.86
killer_objection: "The proposed `ContextProvider` brand does not compile: `__ctxProvider: unique symbol` as a property *type* declares a fresh anonymous unique symbol per declaration site, so the RFC's own reference implementation (`{ __ctxProvider: CTX_BRAND, ... } as ContextProvider`) fails with TS2352/TS2322 — `typeof CTX_BRAND` is not assignable to `typeof __ctxProvider`. The brand is unconstructible by anyone, including the library itself. It mirrors the wrong half of the `Id` pattern."
required_changes:
  - "Fix the brand to the `Id` pattern: `declare const __ctxProvider: unique symbol;` then `type ContextProvider = { readonly [__ctxProvider]: true; scope(): Disposable }` (unique symbol as computed KEY with value type `true`), and have `provide` return the value via an internal cast `as ContextProvider` exactly as `createId` casts `as unknown as Id`. Do NOT use `unique symbol` as a property's value-type — that is what breaks."
  - "Make `ContextProvider` generic (`ContextProvider<T = unknown>`) and `provide(value: T): ContextProvider<T>` so `scopeReply(render, ...providers: ContextProvider[])` retains per-context value types end-to-end. As written, `T` is erased at `provide`, so the only type checking is the `.provide(value)` call site and the brand's claimed 'can't pass a wrong shape into scopeReply' is vacuous — every provider collapses to the same opaque type."
  - "Correct the `Type-safety story` bullet that claims the brand 'mirrors the existing Id/__idBrand pattern (ids.ts:21)'. It does not — `Id` uses `readonly [__idBrand]: true` (symbol as key), the RFC uses `unique symbol` as a value type. The cited line is the counter-example to the RFC's own code."
  - "Add an explicit `formFor<T>` constraint caveat to the guideline edit: `formFor<T extends Record<string, unknown>>` rejects `interface` types with `Index signature ... is missing` (TS2344). The RFC's headline rule — 'import the SAME request type the controller validates' — breaks whenever that type is declared `interface` (common in Fastify `FastifyRequest<{ Body: T }>` schemas). Either relax the constraint to `T extends object`, or document `type X = {...}` (not `interface`) as a precondition with the exact error, so adopters aren't steered into a confusing constraint error instead of the advertised 'not a key' error."
  - "State the `scopeReply` typing contract for `render`: it returns `string` and the RFC relies on `render()` already being escaped (guardrail 11.3). Pin the return type so a future `View | string` widening can't let an unescaped value through `scopeReply` unchecked."
---

# Verdict: RFC-A-G5 — type-safety lens

> You are an ADVERSARY. Your job is to KILL this RFC through the type-safety lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The RFC's entire type-safety story rests on a "branded provider," and the brand is wrong at the type level. The new surface (`provide` + `ContextProvider` + `scopeReply`) is small, but it is exactly where the type system is supposed to do its job, and it does not.

- **type-safety failure mode 1 — the brand does not compile (killer).** RFC line 51 declares:
  ```ts
  export type ContextProvider = {
    readonly __ctxProvider: unique symbol;   // brand — "not constructible by callers"
    scope(): Disposable;
  };
  ```
  Using `unique symbol` as a property's **value type** creates a fresh, anonymous `unique symbol` bound to *that declaration*. Nothing in the world has that type — not even the library. The RFC's own reference implementation (lines 90–95) does:
  ```ts
  const CTX_BRAND: unique symbol = Symbol("fluent-ctx-provider");
  provide(value: T): ContextProvider {
    return { __ctxProvider: CTX_BRAND, scope: () => this.scope(value) } as ContextProvider;
  }
  ```
  I reproduced this verbatim under `tsc 5.9 --strict --target esnext`:
  ```
  rfc.ts(24,14): error TS2352: Conversion of type '{ __ctxProvider: unique symbol; ... }' to type 'ContextProvider' may be a mistake because neither type sufficiently overlaps with the other.
      Type 'typeof CTX_BRAND' is not comparable to type 'typeof __ctxProvider'.
  rfc.ts(41,33): error TS2322: Type 'typeof CTX_BRAND' is not assignable to type 'typeof __ctxProvider'.
  ```
  This is not a nitpick about a snippet — it is the API as specified. The RFC claims (line 216) it "mirrors the existing `Id`/`__idBrand` pattern (`ids.ts:21`)." It mirrors the *opposite*: `ids.ts:21` is `declare const __idBrand: unique symbol;` used as a **computed key** `readonly [__idBrand]: true` (value type `true`). I verified the correct form compiles cleanly. The RFC copied the symbol but moved it from the key position to the value-type position, which inverts its meaning. The cited line is the refutation, not the precedent.

- **type-safety failure mode 2 — `provide` erases `T`; the brand's central claim is vacuous.** Even after fixing the brand, `provide(value: T): ContextProvider` (no type parameter on the result) throws away the value type. `scopeReply(render, ...providers: ContextProvider[])` therefore sees a homogeneous bag of opaque providers. The RFC's type-safety story (line 216) asserts the brand means callers "can't ... pass a wrong shape into `scopeReply`." There is no "wrong shape" to pass — every provider has the *same* shape; the only place `T` is checked is the `AuthCtx.provide(x)` call site, which is true but is a property of `provide`'s `value: T` parameter, not of the brand or of `scopeReply`. The brand buys exactly one thing: preventing a hand-rolled `{ scope() {...} }` from being passed to `scopeReply`. That is a marginal benefit, oversold as the type-safety backbone. To deliver real end-to-end typing, `ContextProvider<T>` must be generic.

- **type-safety failure mode 3 — `formFor<T>` constraint vs. `interface` schemas.** The RFC's headline `formFor` rule (lines 255, 270) is "import the **same** request type the controller validates." But `form.ts:26` constrains `formFor<T extends Record<string, unknown>>`, and `interface` types do **not** satisfy `Record<string, unknown>` (no implicit index signature). I confirmed: an `interface SignInReq` yields `TS2344: Type 'SignInReq' does not satisfy the constraint 'Record<string, unknown>'. Index signature ... is missing`. Fastify app schemas are routinely `interface` (and `FastifyRequest<{ Body: T }>` does not care which you use). So the RFC's adoption rule actively steers developers into a constraint error that has nothing to do with the field-name typo the RFC advertises — the wrong failure, at the wrong place, with the wrong message. The shipped `formFor` is fine; the *guideline edit* this RFC adds is the hazard.

- **type-safety failure mode 4 (minor) — `Context<T>` widening on `provide`.** Adding `provide(value: T)` to the single shared `Context<T>` type used by both `createContext` and `createRequiredContext` is fine structurally, but the `scopeReply` example passes `this.request.user!` (line 81) — the `!` is doing real work because `request.user` is `AuthUser | undefined`. `provide(value: T)` will silently accept the post-`!` value; if a future refactor drops the `!`, `provide(undefined)` only errors if `T` excludes `undefined`. This is acceptable but should be called out so the `!` is not treated as cosmetic.

## Does it survive?

**survives-with-changes.** The conceptual core — scope per-request inside `renderView`, dispose LIFO in a `finally`, kill the 102 prop-drill sites and the unsafe `onRequest`/`onResponse` pattern — is sound and the runtime/`Symbol.dispose` machinery already exists. The `formFor` adoption half rests on a shipped, correct API. Nothing here is a guardrail violation requiring rejection. But the RFC ships a **type that does not compile** as its named type-safety mechanism (frontmatter even lists `ContextProvider` in `api_surface` and claims `§11.4 type-safety: pass`), and its central type-safety claim about `scopeReply` is vacuous because `T` is erased. Those are exactly the "inference that breaks / generics that do not narrow / a wrong call compiles (or a right call doesn't)" failures this lens exists to catch. They are mechanical to fix (the correct `Id`-style brand + a generic `ContextProvider<T>`), so this is amend-not-kill — but the `§11.4: pass` self-assessment is false as written and must be corrected along with the four changes above.

## Guardrail check (type-safety, §11.4)

**Fails as written.** The RFC asserts `§11.4 type-safety: pass — branded ContextProvider, value-typed provide, keyof T form names; no bare string, no any`. Verified against `tsc 5.9 --strict`:
- "branded ContextProvider" — **does not compile** (TS2352/TS2322); the brand is unconstructible.
- "value-typed `provide`" — value-typed at the call site only; the value type is **erased** from the result, so `scopeReply` is not value-typed.
- "`keyof T` form names" — correct for the shipped `formFor`, but the guideline's "import the controller's type" rule trips the `Record<string, unknown>` constraint on `interface` types (TS2344).
- "no `any`" — the reference impl uses `as ContextProvider`; with the corrected brand this becomes the same `as unknown as Id`-style internal cast `createId` already uses, which is acceptable (cast is library-internal, brand is compile-time-only). No `any` leak once the brand is fixed.

With the five required changes folded back, §11.4 passes; until then the frontmatter `guardrails_checked` claim is inaccurate.
