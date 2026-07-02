---
rfc: RFC-D-01
lens: type-safety
verdict: survives-with-changes
confidence: 0.74
killer_objection: "The RFC's central type-safety claim — that adding FrozenView to the View union makes serialize/applyNonce 'exhaustively narrowed, add a case or TS flags the gap' — is false against the actual source. render.ts has no exhaustiveness check at any of the three dispatch sites (renderImpl falls through to `return ''`, streamImpl to implicit void, applyNonce to an untagged else). Widening View therefore compiles silently with zero new diagnostics, and the most security-relevant new path — Frozen(Script()) under renderWithNonce — type-checks while silently dropping the CSP nonce."
required_changes:
  - "Add assertNever-based exhaustiveness to every View consumer the RFC touches BEFORE widening the union: serialize() (and any retained renderImpl), the stream sink path, applyNonce, and all four fold drivers (foldView/paraView/unfoldView/hyloView). The trailing branch must be `const _exhaustive: never = node; return _exhaustive;` (or throw) so that adding FrozenView to View forces a compile error at each site until a Frozen case is written. Without this the RFC's stated type-safety mechanism does not exist."
  - "Make the Frozen/renderWithNonce interaction a compile-time or load-bearing-runtime error, not a doc note. applyNonce currently cannot descend into a FrozenView (cached string is opaque) so a frozen <script>/<style> silently ships without nonce — a CSP bypass. Required: applyNonce must throw if it encounters a FrozenView whose source subtree contains a script/style tag (walk node.view at apply time, which is cheap and one-shot), OR Frozen must refuse to cache when first rendered via renderWithNonce. A 'documented, user-enforced' contract is exactly the bare-string-class of failure guardrail §11.4 exists to prevent."
  - "Tighten the cache-mutation surface: `cached: string | undefined` is a public mutable field on an exported class, so external code can write `frozen.cached = userControlledHtml` and inject unescaped markup that bypasses render()'s escaping entirely. Mark it `@internal` AND make it non-public (e.g. a private field / closure or readonly-after-first-render via a getter), so the only way bytes enter the cache is the escaping render() path. As specified it is a writable string sink on the public API."
  - "Resolve the open question on Object.freeze in favor of freezing (or document why not) — the contract 'don't mutate the wrapped tree after first render' is otherwise invisible to types and to runtime. At minimum the type of FrozenView.view should be `readonly View` and construction should be the only write."
  - "Add a type-level note that Frozen(view: View) cannot and does not distinguish request-invariant from per-request views; the RFC must state explicitly in its Type-safety story that this footgun is unguardable by types (it currently overstates safety) and that the ONLY mitigations are (a) the nonce/script runtime guard above and (b) the guideline ✓/✗. Do not claim 'no any-leak / fully typed' implies 'misuse-safe' — they are different claims."
---

# Verdict: RFC-D-01 — type-safety lens

> Adversary brief: kill RFC-D-01 through type-safety. Default to reject under uncertainty.

## Attack

I read the real source the RFC cites: `src/core/types.ts` (View union), `raw-string.ts`/`tag.ts`/`guards.ts` (the `_t` discriminant pattern), and `src/render/render.ts` + `src/render/stream.ts` (the dispatch sites). The RFC's "Type-safety story" (§lines 189-193) and its §11.4 guardrail PASS are built on a claim that the code does not support.

- **Failure mode 1 — the discriminated-union exhaustiveness is fictional.** The RFC asserts (line 190): *"`serialize`'s node dispatch is exhaustively narrowed — add a case or TS flags the gap."* It does not. Every existing View consumer ends in a **silent fallthrough**, not an `assertNever`:
  - `renderImpl` (render.ts:259): final `return '';` — any unhandled `View` member renders as empty string, no error.
  - `streamImpl` (stream.ts): falls off the end returning `void`.
  - `applyNonce` (render.ts:55-66): `if (isTag) … else if (Array.isArray) …` with **no else** — a non-Tag non-array node is silently skipped.
  - The four fold drivers share this profile (grep confirms **zero** `assertNever`/`never` in render.ts, stream.ts, or src/fold/*.ts).

  Consequence: `export type View = Tag | string | RawString | FrozenView | View[];` (the RFC's one type change) **compiles with zero new diagnostics**. TypeScript flags nothing, because nothing narrows exhaustively. The RFC's stated type-safety *mechanism* — "add a case or TS flags the gap" — is absent from the codebase. If the de-recursion rewrite forgets the Frozen branch in `serialize` or in any fold driver, a `FrozenView` silently renders as `''` (lost content) — and the compiler stays green. This is the type-safety equivalent of shipping the API without the guardrail.

- **Failure mode 2 — the nonce/Frozen interaction is a CSP bypass the types wave through.** `renderWithNonce` (render.ts:49) walks the live tree via `applyNonce` and only descends into `Tag` and arrays. A `FrozenView` is opaque (its `cached` string is already serialized; even pre-cache, `applyNonce` has no `FrozenView` branch). So `renderWithNonce(nonce, Frozen(Script().setSrc("/app.js")))` **type-checks and runs**, emitting a `<script>` with **no nonce** — silently violating CSP. The RFC itself flags this (lines 205, 303) but resolves it as a *documentation* note and an *open question for a human*. That is precisely the bare-string-class failure guardrail §11.4 forbids: the wrong call compiles. A type/runtime guard is mandatory, not optional.

- **Failure mode 3 — `Frozen(view: View)` is unguardably permissive, and the RFC overstates safety.** The signature accepts *any* View. `Frozen(Div(\`Hi ${user.name}\`))` compiles (the RFC's own ✗ example, line 220). The compiler cannot distinguish request-invariant from per-request subtrees — caching the first user's name for everyone is a correctness+security bug invisible to types. The RFC's §11.4 PASS leans on "no `any` in public surface," but **no-`any` ≠ misuse-safe**. The most dangerous misuse of this entire feature (caching per-request/per-user/nonce data) is exactly the part types cannot see, and the RFC's type-safety story reads as if the discriminant solves a problem it doesn't touch.

- **Failure mode 4 — `cached: string | undefined` is a writable public string sink.** `FrozenView` is an exported class with a public mutable `cached` field. External code can assign `frozen.cached = "<img src=x onerror=alert(1)>"` and that string is emitted verbatim by `serialize`/stream (the whole point of the cache is "memcpy, no escaping"). This re-introduces an unescaped-string path on the *public* surface — the one thing `RawString` at least gates behind the explicit `Raw()` ceremony. Per RawString, the html field is `readonly`; `cached` is not.

- **Structural-guard caveat (not fatal, but noted).** `isFrozen(v): v is FrozenView` via `_t === 3` is structural — `{ _t: 3 }` passes and would be dereferenced for `.view`/`.cached`. This exactly mirrors `isTag`/`isRawString`, so it is not a regression; I do not weight it.

## Does it survive?

**survives-with-changes.** The de-recursion half is type-neutral (signatures unchanged, output byte-identical) and the `RawCtx` literal-union cleanup (`'escape' | 'raw' | 'script' | 'style'` replacing `boolean | string`) is a genuine type-safety *improvement* I would not block. The `Frozen` half is sound *in concept* but ships with a type-safety story that does not match the code and a documented-only CSP footgun. None of these is an architectural kill — each is a concrete, mechanical fix that folds back into the RFC. But they are **required**, not nice-to-have: as written, the RFC claims a guardrail (§11.4 PASS, exhaustive narrowing) that the source disproves, and a wrong call (frozen nonce-bearing script) compiles. Under the default-reject posture I will not pass it on the current text; with the five required changes the type-safety claim becomes true and the verdict flips to survives.

The killer objection (exhaustiveness fiction) is rebuttable only by *adding* the `assertNever` sites — which is change #1. Until then the RFC's own §11.4 PASS is incorrect.

## Guardrail check (§11.4 type-safety — this lens owns it)

**Currently FAILS as written; PASSES with required changes 1-2 + 5.**
- "No bare `string` where a literal union fits": `RawCtx` change is a PASS and an improvement. ✓
- "New fluent methods get full types, not `any`": `Frozen` signature is fully typed. ✓ (but see: no-`any` is necessary, not sufficient).
- "Discriminated unions for state": the `_t: 3` discriminant exists, but the union is **not exhaustively consumed** anywhere — so the discriminant buys no compile-time safety today. The RFC must *add* the exhaustiveness sites for the claim to hold. ✗ until change #1.
- XSS-adjacent type hole (writable public `cached`, nonceless frozen script): the type system must close these or the §11.3/§11.4 boundary leaks. ✗ until changes #2-3.
