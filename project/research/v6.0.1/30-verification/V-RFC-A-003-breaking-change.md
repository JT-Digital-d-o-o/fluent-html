---
rfc: RFC-A-003
lens: breaking-change
verdict: survives-with-changes
confidence: 0.78
killer_objection: null
required_changes:
  - "State an explicit byte-identical INVARIANT in the RFC's compatibility section AND lock it with a regression test: render(t) is unchanged for every tag that does not already emit a duplicate attribute name. The fuzz/parity harness (test/fuzz.ts) currently never generates toggle-vs-bag or setter-vs-bag collisions, so it cannot catch a behavioral regression in the no-collision path — add a corpus of (a) non-colliding toggle+bag+setId/Class/Style tags asserting byte-identical pre/post output, and (b) the four duplicate-name fixtures asserting the new single-emission output, run through BOTH render and renderToIterable (emitChunks) so the two serializer copies stay in lockstep. The RFC names this test but it must be a merge gate, not an aspiration."
  - "Pin the parked-major boundary in writing: the addAttribute('id'|'class'|'style', …) overload-exclusion is the ONLY break and must ship as a tracked parked-major item (per Open Questions), not be silently dropped. The 6.0.1 fix must not narrow addAttribute's runtime acceptance either — addAttribute('id', x) must still succeed at runtime (value merely skipped at serialize), so no currently-compiling AND currently-running call site starts throwing."
  - "Confirm toggle()'s BooleanAttribute union cannot contain 'id'|'class'|'style' (it does not today), and add a guard-comment so a future union widening that adds e.g. an aria/data boolean colliding with a reserved key does not silently change precedence. The reserved-key skip in the toggle loop is precedence-defining behavior and must be covered by a test, not left implicit."
file: /Users/tony/jt-digital/fluent-html/product/research/v6.0.1/30-verification/V-RFC-A-003-breaking-change.md
---

# Verdict: RFC-A-003 — breaking-change lens

> Adversary brief: a 6.0.1 patch that changes ANY public shape FAILS and is forced to parked-major.

## Attack

Two attack vectors under this lens: (1) does the patch change a public **signature/shape**, and (2) does it change **observable output** for code that is currently valid (a behavioral break smuggled into a patch)?

- **Signature/shape break — FAILS to land.** I verified the cited code: `buildAttrs` is `@internal` (`src/render/serialize.ts:234`), `toggle(name, condition)` keeps its signature (`src/core/tag.ts:190`), and `addAttribute(key, value)` is untouched (`src/core/tag.ts:158`). `api_surface: []` is honest. The one genuine break — an `addAttribute` overload excluding `'id'|'class'|'style'` — is explicitly NOT in this RFC; it is parked-major (RFC §"Type-safety story", §"Compatibility"). No exported symbol changes shape. This vector does not kill.

- **Behavioral break on currently-valid output — the real risk, and it is contained.** A patch may only change output for inputs that were *already wrong* (duplicate attribute name = invalid HTML; browser already collapsed to first/own value). I traced the proposed `buildAttrs`: for any tag with no name collision, the `seen` Set never short-circuits, `RESERVED_BAG_KEYS.has(name)` is false for every `BooleanAttribute` (the union has no `id`/`class`/`style`), and `extraAttrs[name] !== undefined` only fires on an actual collision. So the no-collision path is byte-identical, and the emission order (id/class/style → `_sk` → bag → htmx → toggles) is preserved. The new output is exactly what a spec-compliant browser already resolved the old malformed markup to. This is "strictly more correct on already-broken input," which is the canonical legitimate patch.

- **No new runtime-throw surface.** `BOOLEAN_ATTR_RE` already threw on malformed toggle names in v6.0.0 (`serialize.ts:284`); the RFC keeps that throw and adds only *skips* (no new exception). `addAttribute('id', …)` still succeeds at runtime — its value is dropped at serialize, not rejected at the call site — so no currently-running call site begins to crash. The RFC correctly rejected the "throw on collision" alternative as too aggressive for a patch.

- **Weakness found (basis for required changes), not a kill:** the safety of the whole claim rests on "byte-identical for non-colliding tags," but `test/fuzz.ts` does not currently generate the collision shapes (setter+bag, toggle+bag, repeated toggle), so the parity harness as-is cannot *prove* the no-regression claim. The RFC asserts the parity test "must be extended" — that obligation has to become a hard merge gate with both directions (regression on non-colliding tags + new fixtures), or the byte-identity guarantee is unverified prose.

## Does it survive?

**survives-with-changes** (confidence 0.78). The lane check passes: no public shape changes, the only break is correctly parked-major, and the output delta is confined to inputs that were already invalid HTML — the textbook profile of an admissible 6.0.1 behavior fix. I cannot construct a currently-valid program whose rendered bytes change, nor a compiling call site that newly fails to compile or newly throws. There is no killer objection.

It does not get a clean `survives` only because the no-regression guarantee is presently *unenforced*: the change is safe by construction, but the harness that would catch a future regression in this hot path does not yet exercise these shapes. The required changes convert the RFC's narrative invariant into a tested one and pin the parked-major boundary so the break cannot drift into the patch later.

## Guardrail check (breaking-change owns the lane gate)

- Public shape: **unchanged** — `buildAttrs` `@internal`, `toggle`/`addAttribute` signatures intact, `api_surface: []`. Patch lane is honored.
- Additive-only / no-smuggled-break: **pass** — the would-be break (overload exclusion) is parked-major and must stay parked.
- Output compatibility: **pass with test obligation** — byte-identical for all non-duplicate inputs; changes only previously-invalid duplicate-name output.
- Verdict gate (a patch that changes any public shape FAILS): **not triggered.** This stays a patch.
