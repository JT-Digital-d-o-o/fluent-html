# Verification: control-flow-7 — ForEachElse is array-only while siblings accept Iterable

**Verdict: gap confirmed. Score: 5/10.**

## Finding summary

`ForEachElse<T>(items: readonly T[], …)` (src/control/iteration.ts:94-98) is the only member of the iteration quartet that rejects iterables; `ForEach` (:27-29), `ForEachKeyed` (:118-119), and `Intersperse` (:145-146) all take `Iterable<T>`. Proposal: widen to `Iterable<T>`, collect via `Array.isArray(items) ? items : [...items]`, branch on `arr.length`.

## Gap check — CONFIRMED

- Signature verified in current src: `items: readonly T[]` at iteration.ts:95; the empty test is `items.length === 0` at :99, which is why arrays were required.
- No existing overload or sibling covers the case: there is exactly one `ForEachElse` signature, and no other helper combines iteration with an empty-state fallback. A caller with `Map.values()` / a generator must spread manually today.
- The type-level claim holds: `ForEachElse(map.values(), …)` fails to compile against the current signature while `ForEach(map.values(), …)` compiles — the inconsistency is real, and the ForEach JSDoc (:77-78) explicitly advertises iterable optimization, so the asymmetry contradicts the library's own documentation posture.

## Value-density evidence

Strictly by call sites in src / test / examples / downstream apps:

- **Zero non-test usage found anywhere.** `ForEachElse` appears only in its own export lines and 3 library tests (test/control-flow.test.ts:184-193, all array literals). No hits in examples/ (including examples/control-flow.ts), fluent-html-demos, or the ttl app.
- **No observed iterable-source pain either:** grep for `ForEach(...values()/entries())` and `[...x.values()]`-style spreads across demos and downstream apps returned nothing. The "forced spread" pain is currently hypothetical, not demonstrated.
- **Effort is near-zero:** ~3-line non-breaking widening, one added test, JSDoc param tweak. No overload-resolution risk (single signature, no count/range overloads on this function).

## Reasoning for 5/10

The finding is accurate and the fix is textbook cheap, but value-density is capped by usage reality: not a single production or example call site exists to improve, let alone one passing an iterable. What the change buys is API uniformity ("the quartet takes Iterable") — genuine but small, and aligned with the library's convergence principle. High correctness-of-claim, low demonstrated demand, trivial cost → middle score. Good candidate to bundle into a batch consistency pass (e.g. alongside control-flow-3/6 iteration fixes), not worth standalone prioritization.
