---
rfc: RFC-A-G5
lens: breaking-change
verdict: survives-with-changes
confidence: 0.78
killer_objection: "Adding a non-optional `provide(value: T): ContextProvider` member to the *exported* structural type `Context<T>` (src/index.ts:265) is a breaking type change for any consumer that types a value as `Context<T>` from outside the factories — yet the RFC declares `breaking: additive` and asserts \"nothing breaks.\" The claim is true only by the unproven accident that no surveyed app annotates with the type."
required_changes:
  - "Do NOT add `provide` as a required member of the exported `Context<T>` type. Either (a) declare it optional — `provide?(value: T): ContextProvider` — or (b, preferred) leave `Context<T>` byte-for-byte unchanged and expose `provide` only on a new exported return type of the factories (e.g. `ScopedContext<T> = Context<T> & { provide(value: T): ContextProvider }`), so the published structural contract is never widened."
  - "Fix the frontmatter / migration honesty: if `provide` lands on `Context<T>` as required, change `breaking: additive` → `breaking: breaking` and add a `breaking-changes.md` note. If the change above (optional or separate return type) is adopted, `breaking: additive` is then accurate and the migration claim stands."
  - "Correct the reference implementation's `this` usage: the factories return bare object literals, so `provide(value){ return { __ctxProvider, scope: () => this.scope(value) } }` written inside that literal relies on method-call `this`. Capture `scope` lexically (closure over the factory's `scope`) so a detached `Ctx.provide` reference cannot throw at render time, or document method-call-only invocation."
file: product/research/v6/30-verification/V-RFC-A-G5-breaking-change.md
---

# Verdict: RFC-A-G5 — breaking-change lens

> You are an ADVERSARY. Your job is to KILL this RFC through the breaking-change lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

I tried to kill this as a mismarked breaking change. The RFC is 90% guideline teaching plus one tiny code surface in `src/control/context.ts`. Most of it is genuinely safe. But there is exactly one place where the frontmatter `breaking: additive` and the "**Additive — nothing breaks.**" claim are not honestly earned.

- **breaking-change failure mode 1 — widening an exported structural type is breaking, not additive.** The RFC's *Proposed API* says: "`control/context.ts` — **ADD to the existing `Context<T>` type** ... `provide(value: T): ContextProvider; // NEW`". `Context<T>` is a **public exported type** (`src/index.ts:265`, `src/control/index.ts:20`, shipped in `dist/src/control/context.d.ts:26`). Adding a **non-optional** member to a published structural type is, in TypeScript's structural model, a breaking change for any downstream value that is *typed as* `Context<T>` but produced outside the library factories — e.g. a hand-rolled object literal assigned to a `Context<PageAccent>` variable, a `satisfies Context<T>`, or a generic helper `function withCtx<T>(c: Context<T>)` fed a custom object. After the change such code stops compiling ("Property 'provide' is missing"). The RFC's *own evidence* (worked example B) is the smoking gun: renderbox's `pageAccentCtx` (`renderbox/.../landing.components.ts:27-34`) is structurally precisely a `Context<PageAccent>` minus `provide`. It survives *today* only because it is never annotated `Context<PageAccent>` (verified: consumed only via `.scope()`/`.current`, never passed where a `Context<T>` is expected). So "nothing breaks" rests on an unproven, fragile accident of the current app corpus — not on the type system. The RFC states it as fact ("renderbox's hand-rolled `pageAccentCtx` keeps working"). True by luck, not by design — and `breaking: additive` launders a real type-level breaking vector.

- **breaking-change failure mode 2 — silent runtime breakage hidden behind `this`.** The reference implementation places `provide` inside the object literal returned by `createContext`/`createRequiredContext` and writes `scope: () => this.scope(value)`. The current factories return a *bare object literal* (`context.ts:72-85, 113-129`) with no class/`this`-bound prototype. `provide` therefore depends on being called as a method (`AuthCtx.provide(x)`, `this` = the context object). The instant a consumer destructures (`const { provide } = AuthCtx`) or passes `AuthCtx.provide` as a callback, `this` is `undefined` and it throws at render time — a runtime regression with no compile signal. Not breakage of *existing* code, but an undocumented landmine the RFC ships without guarding; the breaking-change lens flags it because the failure is invisible until production.

What I could NOT kill (genuinely additive, verified against source):
- `scopeReply` is a brand-new free export — no collision, opt-in. Apps on the safe `decorateReply` + `using` pattern (`jt-vault-cloud`) need zero change; parity confirmed (`using` already disposes on throw).
- No existing signature changes: `createContext`, `createRequiredContext`, `scope()`, `current` untouched in behavior. No renamed/removed symbols.
- `formFor<T>()` work is **pure guideline teaching** — no API surface change (`src/form.ts:26-39` already exposes `keyof T & string` names). The `.setName()` annotations and prop-drill→context migrations are mechanical, type-driven, non-breaking by construction (old code keeps compiling; the change is a *recommendation*, not a removal).
- `ContextProvider` is a new exported type — additive.

Blast radius is small and surgical: one required member on one exported type, plus one `this` footgun. Not a full reject — but it cannot ship as labeled.

## Does it survive?

**survives-with-changes.** The dominant deliverable (guidelines + `scopeReply` + `formFor` adoption) is honestly additive and grounded in real file:line evidence. The single defect: the *one* type mutation is mislabeled `additive` when, as specified (required member on the exported `Context<T>`), it is breaking. The fix is cheap and folds straight back into the RFC:

1. **Keep `Context<T>` unchanged; expose `provide` via a separate factory return type.** Define `export type ScopedContext<T> = Context<T> & { provide(value: T): ContextProvider }` and have `createContext`/`createRequiredContext` return `ScopedContext<T>`. Existing `Context<T>` consumers are untouched; new callers get `provide`. This makes `breaking: additive` *true*, not aspirational. (Alternatively, declare `provide?` optional — weaker, since it then types as possibly-undefined at every call site.)
2. **Re-mark honesty:** only if change (1) is rejected and `provide` is forced onto `Context<T>` as required does the frontmatter need `breaking: breaking` + a `breaking-changes.md` entry. With (1), the existing `breaking: additive` is correct.
3. **Kill the `this` footgun:** specify that `provide` captures `scope` lexically (closure over the factory's `scope`) so a detached `AuthCtx.provide` reference can't throw, and document method-call-only invocation if not.

With these three, every existing symbol's signature and behavior is preserved, the only new surface is purely additive, and the `breaking` label is earned. The RFC then survives this lens cleanly.

## Guardrail check (§11.5 backward-compat — this lens owns it)

- **§11.5 backward-compat: CONDITIONAL PASS.** As written (required member on exported `Context<T>`), the RFC violates §11.5's "additive by default" because it widens a published type without marking it breaking or providing a migration — exactly the "guardrail drift" failure in §13 ("a breaking API sneaks into a minor"). After required change (1), it is fully additive and §11.5 passes. No codemod is needed for code; the guideline-driven cleanups are recommendations, not removals (§11.5(a) satisfied).
- No behavioral change to the synchronous render path; no renamed/removed runtime exports; `formFor` and prop-drill migrations are opt-in. The breaking surface is confined entirely to the `Context<T>` *type declaration* and is fully closed by the required changes.
