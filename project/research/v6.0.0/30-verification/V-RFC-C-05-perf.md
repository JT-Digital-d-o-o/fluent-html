---
rfc: RFC-C-05
lens: perf
verdict: survives-with-changes
confidence: 0.74
killer_objection: The runtime `prefixOf("method")` call inserted into renamable one-liners is left implementation-unspecified — a string-keyed Map/object lookup + extra function frame on a method that today is a monomorphic, V8-inlinable template literal, executed hundreds–thousands of times per synchronous SSR render. Underspecified, it is a per-request regression on the hot path with no benchmark gate.
required_changes:
  - "Pin `prefixOf` to a zero-cost runtime form: the codegen MUST inline the resolved prefix as a module-level `const` string literal per method (e.g. `const GRADIENT_TO = \"bg-linear\";`) so the runtime one-liner stays `this.addClass(`${GRADIENT_TO}-${d}`)` with NO function call and NO per-call lookup. Forbid a runtime `prefixOf(name)` Map/object lookup on any render path."
  - "State explicitly that the resolved-prefix constants are baked at BUILD time from the chosen TARGET (single value, not a v3/v4 branch evaluated at runtime). No `TARGET` read, no target conditional, may execute inside any method body."
  - "Constrain the runtime change to ONLY methods whose prefix actually renames across targets (gradientTo, shadow, ring, rounded, outline per the RFC's own list). The other ~120 methods MUST keep their existing inline literals verbatim — do not route all 125 template-literal methods through the prefix-constant indirection."
  - "Keep `emitClasses()` / the `EmitShape` switch / `assertNever` strictly build-and-test-only. Add a guardrail line forbidding it from being imported by `tailwind-methods.ts` or executed on any render path; it is for the extractor and the drift test only."
  - "Add a §11.2 hot-path proof obligation: a microbenchmark (Track D harness) asserting `.gradientTo()/.shadow()/.ring()` post-change render within noise of pre-change baseline, run in CI alongside the drift test. The drift test proves correctness; this proves the constant-inline claim holds and never regresses to a lookup."
file: product/research/v6/30-verification/V-RFC-C-05-perf.md
---

# Verdict: RFC-C-05 — perf lens

> You are an ADVERSARY. Your job is to KILL this RFC through the perf lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The RFC's perf self-assessment (§11.2: "runtime emit is the same `addClass` one-liners, no per-render cost") is **not true as written**, and the gap is exactly where perf bugs hide.

- **perf failure mode 1 — the `prefixOf()` indirection is unspecified and defaults to a per-call lookup.** Today's hot path is the cheapest thing in the library:

  ```ts
  p.gradientTo = function (d) { return this.addClass(`bg-gradient-${d}`); };
  ```

  This is monomorphic, has one string allocation (the template literal), and V8 inlines the whole method. The RFC replaces the renamable ones with:

  ```ts
  p.gradientTo = function (d) { return this.addClass(`${prefixOf("gradientTo")}-${d}`); };
  ```

  The RFC never defines `prefixOf`. The natural reading of "imports `prefixOf()` for renamable prefixes" is a function that takes the method name (a `string`) and returns its prefix — i.e. a **string-keyed object/Map lookup plus a function call frame, on every invocation**. A typical SSR view in this codebase issues hundreds-to-thousands of styling calls per request (145 such methods exist; real views chain many per element across many elements), all on the **synchronous render path** that guardrail §11.2 exists to protect. Trading a free inlined literal for a `lookup + call + string concat` on the hot path, multiplied by per-request fan-out, is a real allocation/latency regression — and it is invisible because the RFC asserts "no per-render cost" without a benchmark.

- **perf failure mode 2 — `emitClasses()` / `EmitShape` is a render-time-shaped engine that must be fenced off.** The RFC introduces `emitClasses(def, args, target)` switching on a discriminated `EmitShape` union with `assertNever`. That is precisely the wrong shape to ever touch render: a polymorphic dispatch over 6 kinds, array-returning (`string[]` → array allocation per call vs. today's bare string), reading a `target` parameter. The RFC says it is "Used by extractor + tests," but nothing in the document *forbids* the lib runtime from importing it, and a future maintainer "consolidating" the one-liners onto `emitClasses` would silently move a megamorphic, array-allocating, target-branching function onto the synchronous hot path. The RFC must close that door explicitly, not by intent.

- **perf failure mode 3 — make-the-common-case-pay creep.** The renamable methods are a handful; the RFC names gradientTo/shadow/ring/rounded/outline. But "lib imports `prefixOf()` for renamable prefixes" invites routing *all* 125 template-literal methods through the same indirection "for consistency," so that `.background()` — which never renames — pays the lookup tax for a rare-feature (v3→v4 rename) it never uses. That is the canonical perf anti-pattern guardrail §11.2 guards against: the common case subsidizing a rare one.

## Does it survive?

**survives-with-changes.** The RFC is not perf-fatal because the *correct* implementation is genuinely zero-cost and is already latent in the design: a v3/v4 rename only needs to change which literal the codegen bakes, and codegen runs at build time. If the codegen emits, per renamable method, a **module-level resolved `const` string** and the one-liner interpolates that const, the runtime is byte-identical in shape to today (`this.addClass(`${CONST}-${d}`)`) — same monomorphism, same single allocation, same V8 inlining, no function call, no lookup, no target branch. The async-opt-in clause of §11.2 is not even in play; this is a pure build-time transform.

The reason it does not survive *unchanged* is that the RFC ships the perf-critical detail as prose ("imports `prefixOf()`") that most-naturally implies a runtime lookup and explicitly claims "no per-render cost" it has not proven. That is a §11.2 hot-path claim made without a hot-path proof — under the default-to-reject posture, the claim must be converted into a pinned implementation + a CI benchmark gate, or it is a latent regression shipped on a hope. The five `required_changes` above fold that proof back into the RFC: inline-const codegen (not runtime lookup), build-time TARGET resolution, scope the change to actually-renamable methods, fence `emitClasses` to build/test only, and add a Track-D microbenchmark beside the drift test.

## Guardrail check (perf owns §11.2)

§11.2 — SSR-only synchronous render path stays fast: **PASS only after required_changes.** As written, the runtime delta (`prefixOf` lookup of unspecified cost on the hot path, plus an unfenced array-allocating `emitClasses`) is not proven fast and the RFC's "no per-render cost" assertion is unsubstantiated. With the inline-const codegen + the fencing of `emitClasses` to build/test + the CI microbenchmark, the runtime shape is provably identical to today and the guardrail holds. No async is introduced, so the opt-in clause is satisfied trivially.
