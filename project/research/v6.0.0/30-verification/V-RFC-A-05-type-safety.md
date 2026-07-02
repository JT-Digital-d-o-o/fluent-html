---
rfc: RFC-A-05
lens: type-safety
verdict: survives-with-changes
confidence: 0.78
killer_objection: null
required_changes:
  - "Make `ScopeBinding` opaque/branded so it cannot be hand-constructed and its `_ctx`/`_value` type correlation cannot be broken via the `ScopeBinding<unknown>` default param."
  - "Stop exposing `_ctx`/`_value` as public structural fields; move them to an internal `InternalBinding<T>` and keep the public `ScopeBinding` an opaque token produced only by `ctx.bind()`."
  - "Resolve the `update()` open question in the type, not just the runtime: `createContext.update` must be statically callable; document that `createRequiredContext.update` throws at runtime when no scope is active (it cannot be made a compile error without splitting the `Context<T>` type)."
---

# Verdict: RFC-A-05 — type-safety lens

> ADVERSARY. Goal: kill RFC-A-05 through the type-safety lens. Default to reject under uncertainty.

## Attack

The RFC's entire type-safety pitch (§"Type-safety story", lines 243-247, and guardrail §11.4 "pass") rests on one claim: that `bind()` does **existential packing** so that "each element independently carries its own `T`" and "No `any`, no widening to `Context<unknown>` at the call site." I tried to break exactly that claim, compiling against the real `Context<T>` shape from `fluent-html/src/control/context.ts` with the RFC's proposed additions.

**type-safety failure mode 1 — the existential pack is not sealed; `ScopeBinding<unknown>` decouples `_ctx`'s `T` from `_value`'s `T`, so a wrong-typed value compiles.**

`scopeAll` / `renderWithScopes` / `withScopes` all take `readonly ScopeBinding[]`, i.e. `readonly ScopeBinding<unknown>[]`. Expanding the default param, the element type is:

```ts
ScopeBinding<unknown> = { readonly _ctx: Context<unknown>; readonly _value: unknown }
```

Both fields are now independent: `_value: unknown` accepts anything, and `Context<number>` is assignable to `Context<unknown>`. The `T`↔`T` correlation that `bind(value: T): ScopeBinding<T>` *would* enforce is thrown away the moment the value is an element of a `ScopeBinding[]`. The public `_ctx`/`_value` fields are structural, so the binding can be hand-constructed. All of these compile clean under `--strict` (verified, TS 5.x, `EXIT=0`):

```ts
const CountCtx = createContext<number>(0);

scopeAll([{ _ctx: CountCtx, _value: "wrong" }]);              // string into a number ctx — compiles
const evil: ScopeBinding = { _ctx: CountCtx, _value: false }; // compiles
scopeAll([evil]);

function requestBindings(): ScopeBinding[] {                  // annotated helper — the realistic vector
  return [{ _ctx: CountCtx, _value: "oops-string" }];         // compiles
}
const bs: ScopeBinding[] = [];
bs.push({ _ctx: CountCtx, _value: false });                  // compiles
```

This is not academic. The runtime of `scopeAll`/`renderWithScopes` will do the moral equivalent of `binding._ctx.scope(binding._value)` — pushing a `string` onto a `number` context's stack. Then `CountCtx.current` reads back a `string` typed as `number`: a silently wrong-typed value served into render. That is the **same class of corruption** (wrong value at `.current`) that the RFC's headline sells itself on eliminating (F-A-031). The RFC moved the corruption from "concurrent stack interleaving" to "type-decoupled binding construction," and then declared §11.4 a pass.

The well-formed path *is* sound — I confirmed `CountCtx.bind("nope")` and `CountCtx.update("nope")` both error. So the hole is narrow: it requires either writing an object literal `{ _ctx, _value }` or annotating something `: ScopeBinding[]`. But the guidelines (and the RFC's own helper example `function requestBindings(): ScopeBinding[]` pattern is one annotation away) make `ScopeBinding[]` a named, importable, annotate-able type — the moment someone writes `const bindings: ScopeBinding[] = [...]` in a plugin, every element loses its correlation check. A "type-safety hardening" RFC must not export a type whose only job is to carry a `T` and then let that `T` be silently wrong.

**type-safety failure mode 2 — `update()` is typed as universally available but is a runtime-throw on `createRequiredContext` (per the RFC's own Open Question).** The proposed `Context<T>` adds `update(value: T): void` unconditionally. But the Open Questions section admits `update()` on a required context "throws when no scope is active," and on a default context it overwrites the default frame. The type gives the developer zero signal about this asymmetry: `AuthCtx.update(user)` looks identical to `LocaleCtx.update("de")` at the type level, yet the former can throw and the latter cannot. The type promises a total operation that is partial. This is a softer type-honesty failure than #1, but it is the kind of "inference that breaks the contract" this lens owns.

I could not, however, break the variadic boundary: `renderWithScopes(bindings, ...views)` — because `View = Tag | string | RawString | View[]` and `ScopeBinding` carries `_ctx`/`_value`, passing views as the first arg is correctly rejected (`Tag`/`string` lack `_ctx`/`_value`). That angle is sound and survives.

## Does it survive?

**Survives with changes.** The RFC's direction is correct and the well-formed `bind()`/`update()` paths are genuinely typed — this is not a reject. But guardrail §11.4 is marked `pass` while the public `ScopeBinding` type contains a demonstrated, `--strict`-compiling hole that re-admits exactly the failure mode the RFC exists to remove. That is a credible type-safety defect on the very surface being added, so it cannot ship as-written. The fix is small and proven to close every demonstrated vector while preserving heterogeneous lists.

### Required changes (fold back into RFC)

1. **Brand `ScopeBinding` and make it opaque.** Replace the public structural type with a token only `bind()` can mint, and move the real fields to an internal type. Proven to compile (heterogeneous lists work, `bind` still catches wrong values, all forgeries rejected — `EXITFIX` showed errors only on the wrong-value and forged-literal lines):

   ```ts
   declare const SCOPE_BINDING: unique symbol;
   /** Opaque token produced only by ctx.bind(). Not hand-constructable. */
   export type ScopeBinding = { readonly [SCOPE_BINDING]: true };

   type InternalBinding<T> = ScopeBinding & { readonly _ctx: Context<T>; readonly _value: T };

   // bind() returns the opaque token; scopeAll/renderWithScopes take readonly ScopeBinding[]
   bind(value: T): ScopeBinding { return { _ctx: this, _value: value, [SCOPE_BINDING]: true } as InternalBinding<T>; }
   ```
   With this, `scopeAll([{ _ctx: CountCtx, _value: "wrong" }])` and `const x: ScopeBinding[] = [{...}]` both fail to compile (object literal lacks the brand), while `scopeAll([CountCtx.bind(1), LocaleCtx.bind("de")])` still type-checks. Note this also drops the `<T>` parameter from the public `ScopeBinding` entirely — the `T` lives only inside the unexposed `InternalBinding<T>`, which is the actual "existential packing" the RFC claims but did not implement.

2. **Remove `_ctx`/`_value` from the public surface.** Currently `ScopeBinding<T> = { readonly _ctx; readonly _value }` is fully public and structural — that is what makes forgery possible. They must be internal-only. Update the §"Proposed API" code block and the §"Type-safety story" accordingly; the story currently asserts safety the types do not deliver.

3. **Make the `update()` type honest about its partiality.** At minimum, document on the `update` JSDoc that on a `createRequiredContext` it throws when no scope is active (mirror the `current` getter contract). Preferred: resolve the Open Question by typing `update` only where it is total — e.g. keep it on the `Context<T>` returned by `createContext`, and for `createRequiredContext` either keep the throw + document it, or split the return type so the partial behavior is visible. Do not ship `update` as an unconditional total method when the RFC itself says it can throw.

## Guardrail check (this lens owns §11.4)

§11.4 type-safety: **currently FAILS as written, PASSES after the required changes.** The RFC frontmatter and §"Guardrail check" mark §11.4 `pass`; that must be downgraded until change #1 lands. No `any` appears on the surface, and the well-formed `bind`/`update`/`withContext` paths are correctly constrained — but the exported `ScopeBinding<unknown>` element type silently decouples context-from-value, which is the literal opposite of the RFC's stated safety win. Once `ScopeBinding` is branded/opaque (change #1) the guardrail genuinely passes.
