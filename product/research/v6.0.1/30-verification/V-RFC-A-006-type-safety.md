---
rfc: RFC-A-006
lens: type-safety
verdict: survives-with-changes
confidence: 0.78
killer_objection: null
required_changes:
  - "Fix the false 'inherits prototype-pollution defenses for free' claim and its broken test: setDataAttrs prefixes `data-` BEFORE calling validateAttributeKey, so the computed key `data-__proto__` is NOT in PROTO_KEYS, passes VALID_ATTR_KEY, and is not an on*-handler — it does NOT throw `/prototype pollution/`. The RFC test `it(\"rejects a prototype-pollution data-* key\")` asserting `assert.throws(..., /prototype pollution/)` will FAIL in CI. Remove or rewrite that test (a `data-__proto__` key is harmless inert markup; assert it either passes through as `data-__proto__=\"v\"` or, if a stronger posture is wanted, validate the RAW key before prefixing — but that is a design change, not the shipped fix)."
  - "Correct the RFC's prose at line 110 ('so setDataAttrs inherits prototype-pollution ... defenses for free, identical to setAria'): the PROTO_KEYS branch is in fact dead for BOTH prefixed setters (setAria computes `aria-<key>`, setDataAttrs computes `data-<key>`; neither bare-key path can equal `__proto__`). The claim of equivalence to setAria is true, but the implied prototype-pollution coverage is not — say so explicitly so the JSDoc/CHANGELOG do not over-promise."
file: /Users/tony/jt-digital/fluent-html/product/research/v6.0.1/30-verification/V-RFC-A-006-type-safety.md
---

# Verdict: RFC-A-006 — type-safety lens

> ADVERSARY review through the `type-safety` lens (guardrail 4: no bare `string` where a literal union fits).

## Attack

I tried three kill angles for this lens.

- **Type widening / lost narrowing.** None found. No production signature changes.
  `preload: 'mousedown' | 'mouseover' | boolean` (htmx.ts:252) is untouched; the F-A-120
  fix only wraps the existing string branch in `escapeAttr`. `setDataAttrs(Record<string,string>)`
  and `sanitizeRawContent(string, 'script'|'style')` keep their signatures and return types.
  No `string` is widened, no union is dropped, no inference is loosened. The `as never` / `as any`
  casts appear ONLY in test code, deliberately bypassing the type guard to exercise the
  untyped-caller runtime path — that is the correct way to test the boundary, not a type smell.

- **"A literal union would fit; the RFC ducked it."** Rejected on the merits.
  For F-A-122 no finite union can enumerate "any HTML-safe attribute name," and `data-*` keys
  are legitimately runtime-derived (test ids). A value-level guard is the correct mechanism and
  it CONVERGES on the same `validateAttributeKey` choke point as `setAria`/`addAttribute` — exactly
  what guideline 4 and the convergence principle want. F-A-900 operates on raw JS (`@internal`),
  where no union exists. F-A-120's union already exists and the fix makes the runtime honor it.
  This is type-safety-positive, not a violation.

- **A claimed guard that does not fire (the one that lands).** The RFC asserts (line 110, and
  bakes it into test #2) that `setDataAttrs` "inherits prototype-pollution … defenses for free."
  It does not. `validateAttributeKey` runs on the ALREADY-PREFIXED key `data-${kebabCase(key)}`.
  Verified at runtime: `PROTO_KEYS.has("data-__proto__") === false`, `VALID_ATTR_KEY.test("data-__proto__") === true`,
  `EVENT_HANDLER_RE.test("data-__proto__") === false` → the function does NOT throw. The shipped
  test `assert.throws(() => Div().setDataAttrs({ ['__proto__']: "v" }), /prototype pollution/)`
  is therefore wrong and will fail CI. (The PROTO_KEYS branch is in fact dead for `setAria` too,
  for the same prefix-before-validate reason — so "identical to setAria" is behaviorally true, but
  the prototype-pollution coverage it implies is illusory for both prefixed setters.)

## Does it survive?

Yes — with changes. The core type story is clean: zero widening, zero lost narrowing, no bare
`string` introduced, and the runtime now matches the literal union the type already promises
(F-A-120) or the converged value-guard the sibling setters already use (F-A-122). The attack that
lands is a CORRECTNESS-OF-CLAIM defect, not a type regression: one false "free prototype-pollution
defense" claim plus a broken test assertion. It is fixable in-place and does not threaten the
public shape, so it is `survives-with-changes`, not `reject`. The harmlessness of the missed case
(`data-__proto__="v"` is inert HTML written into an `Object.create(null)` bag — no real pollution)
is why this is not a security kill.

Required changes are in the frontmatter.

## Guardrail check (type-safety, guardrail 4)

PASS. No bare `string` is introduced where a literal union fits. `Record<string,string>` on
`setDataAttrs` is the correct (un-tightenable) shape for dynamic `data-*` keys; the constraint is
enforced at the value level on the converged `validateAttributeKey` choke point. `preload`'s union
is preserved and now honored at runtime. `api_surface: []` holds — no symbol shape changes, so the
6.0.1 patch boundary is respected from the type lens.
