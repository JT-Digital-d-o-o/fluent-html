# Verdict: routes-paramtype-4 — REFUTED (as a defect)

**Finding:** number/uuid param types have zero runtime enforcement; `def.params` never read at runtime; uuid is a pure alias of string.

**Verdict: refuted=true, confidence=high.** The observed behavior is real and reproducible, but it is the module's explicitly documented, test-pinned contract — not a defect. The finding's own escape clause ("if runtime validation is out of scope by design, document that") is already satisfied.

## Factual claims: confirmed accurate

For the record, every mechanical claim checks out:

- `ParamTypeMap` maps `uuid: string` (src/routes.ts:71-75) — identical to `string` at the type level.
- The runtime path never consults `def.params`: `defineRoutes` destructures only `method` (src/routes.ts:330) and uses `def.path`; `substituteParams` (src/routes.ts:232-250) takes only `(template, params)`. `grep '\.params'` over `src/` finds no runtime consumer.
- `encodeURIComponent(String(NaN))` → `"NaN"`, `String(1e21)` → `"1e+21"` → `"1e%2B21"` — so `resolve({id: NaN})` and `resolve({id: 1e21})` produce the URLs described.

## Why it is nonetheless a non-issue: compile-time-only is the stated contract, in four places

1. **Module header** (src/routes.ts:4-6): "This module provides **compile-time safety** for HTMX endpoints and HTTP methods."
2. **`ParamTypeName` JSDoc** (src/routes.ts:60) — the exact line the finding asks to be documented: "Supported scalar param type names. **Determines the TypeScript type required at call sites.**" It claims nothing beyond the call-site TS type.
3. **README.md:597** (the section introducing `number`/`uuid`/enum params): "**The type is enforced at compile time**, and a `params` key that isn't a `:param` in the path is itself a compile error." The scope of the guarantee is stated in the same sentence that introduces `uuid`.
4. **Tests pin the semantics** (test/routes.ts):
   - `describe("Typed params: uuid (string)")` (line 528) — the title itself declares uuid ≡ string, and line 533 asserts `resolve({ id: "abc-123" })` (not a UUID) passes through unvalidated. A runtime uuid regex would **break this intentional test**.
   - `describe("Typed params: compile-time type enforcement")` (line 549) — enforcement is explicitly framed as compile-time, verified via `@ts-expect-error`.

## On the specific repro values

`NaN` and `1e21` are degenerate inhabitants of `number` that no type system can exclude; a caller passing `NaN` as a route id has an upstream bug regardless of what this library does. The failure mode is not silent corruption — the server route (`/users/:id` with a numeric Fastify schema) rejects `/users/NaN` at request time. Rejecting NaN/±Infinity at resolve time would be a reasonable *enhancement*, but it is scope creep beyond the documented guarantee, not a missing guard.

## On "uuid buys nothing over string"

True — and openly acknowledged by the codebase (`ParamTypeMap` sits 3 lines below the JSDoc; the test suite titles it "uuid (string)"). It is call-site self-documentation, same category as a type alias. One could argue for a JSDoc sentence on `ParamTypeName` saying "uuid performs no format validation" — a docs-polish nit, not a defect. The finding's conditional proposal ("if out of scope by design, document that") is materially met by README.md:597.

## Conclusion

The finding accurately describes intended, documented, test-asserted behavior and misclassifies it as an issue. The proposed runtime guards would contradict an existing intentional test (test/routes.ts:533). At most this reduces to an optional one-sentence JSDoc addition. **Refuted as a defect.**
