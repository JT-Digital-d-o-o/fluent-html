---
rfc: RFC-A-001
lens: breaking-change
verdict: survives
confidence: 0.85
killer_objection: null
required_changes: []
---

# Verdict: RFC-A-001 — breaking-change lens

> Adversary stance: KILL this RFC. A 6.0.1 patch that changes ANY public shape FAILS and must be
> forced to parked-major. Default to reject under uncertainty.

## Attack

I tried four ways to prove this is a smuggled break, not a patch.

- **Public-shape change?** The lethal failure for the breaking lens is a new/changed exported
  symbol, type, or signature landing in a patch. RFC declares `api_surface: []`. Verified against
  shipped `src/routes.ts`: the two new helpers (`substituteParams`, `escapeRegExp`) are
  module-internal — NOT exported, not attached to the registry, not part of `RouteCallable`/
  `RouteRegistry`. `grep` confirms no existing symbol of those names to collide with. The callable
  signature `(params, options?) => HTMX` and `.resolve(params, query?) => string` are byte-identical
  before/after. No type-surface move: `ExtractParams`, `ResolveParamTypes`, `ParamTypeName` untouched.
  **Attack fails** — zero public shape moves.

- **Silent output break on a previously-CORRECT path?** A behavior fix is only patch-safe if every
  input that produced a correct URL still produces the same URL. The only outputs that change are:
  (a) prefix-colliding names (`:id` inside `:idCard`) that were *corrupting* the URL, and
  (b) repeated params (`/a/:id/b/:id`) that were *throwing*. Both are unambiguous defects with no
  reasonable contract a caller could depend on. I hunted for a divergence on a "working" path:
  - Single param / non-prefixing names: regex matches the same single placeholder → identical.
  - Value containing another param's literal `:key`: irrelevant, the value is `encodeURIComponent`'d
    so a raw `:` is never injected.
  - Regex-replacement-string injection (`$&`, `$1`) via the value: impossible — `encodeURIComponent`
    output charset (`A-Za-z0-9-_.!~*'()` + `%`) never contains `$`, so `String.prototype.replace`'s
    replacement-string specials can't fire. The value is never interpreted as a pattern (it's the
    replacement arg, and the param NAME is `escapeRegExp`'d before becoming the pattern).
  **Attack fails** — no previously-correct output changes.

- **Grammar mismatch introducing a NEW throw (behavioral break)?** Could the `(?![A-Za-z0-9_])`
  lookahead fail to match a name that the OLD substring `replace` matched, leaving a `:param` behind
  and newly throwing `assertNoUnresolvedParams`? The lookahead's identifier class
  `[A-Za-z0-9_]` (= `\w`) is exactly the class the detector regex `:([a-zA-Z_]\w*)` (`routes.ts:163`)
  and type-level `ExtractParams` use. For an in-grammar name the placeholder boundary is `/` or
  end-of-string, both non-`\w`, so the lookahead always matches — same set of resolutions, never a
  new throw. The one out-of-grammar case (`:id.json`, where `ExtractParams` yields `id.json`) is a
  PRE-EXISTING inconsistency between the type extractor and the runtime detector that the RFC neither
  introduces nor regresses: `escapeRegExp` escapes the `.`, the pattern matches the whole
  `:id.json`, behavior is preserved. **Attack fails.**

- **Lane laundering?** No "additive" symbol is being slipped in under cover of a bugfix — there is
  genuinely nothing additive (`6.1.0: N/A`), so there's no version-lane sleight of hand to catch.

## Does it survive?

Yes — **survives**. From the breaking-change lens this is a textbook 6.0.1: no exported/type/
signature change, and the only behavioral deltas are on inputs that were already corrupting or
already throwing. The fix even tightens correctness toward the contract the types already promised.
Nothing here justifies forcing parked-major; nothing belongs in 6.1.0 either.

Confidence is 0.85 rather than higher only because of the one residual `:id.json`-style
type-extractor/runtime-detector grammar inconsistency. It is pre-existing and out of this RFC's
scope, so it does not block — but it is the single soft spot a future RFC should close, and it keeps
me from claiming certainty.

## Guardrail check (breaking-change owns this)

- A patch must stay a patch: **CONFIRMED**. `api_surface: []` is accurate against shipped code;
  no public symbol, type, or signature is added or changed; the new helpers are non-exported
  internals. Every previously-correct URL is byte-identical. Patch lane upheld — no parked-major
  forcing required.
- Docs lane: CHANGELOG-only under `[6.0.1] → Fixed` is the correct and sufficient doc surface; no
  README/JSDoc/guideline symbol is left uncovered because none moved.
