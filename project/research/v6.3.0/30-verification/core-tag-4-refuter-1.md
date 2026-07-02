# Refuter verdict: core-tag-4 — `.when()`/`.whenElse()` present-`false` vs `0`/`""`

**Verdict: REFUTED as a defect.** The observed behavior is accurate, but it is the intended, documented, and test-locked dispatch semantic of the library — not a bug. What survives is at most a documentation-sharpness suggestion, which the finding itself concedes ("at minimum, document").

## Behavioral facts (not in dispute)

Confirmed by reading `src/core/tag.ts:247-254` / `:267-276`: the impl forks on `typeof condition === "boolean"` first, so `when(false, fn)` skips, `when(0, fn)` and `when("", fn)` run, and `whenElse(false, …)` takes the else branch. The discovery's reproduction is correct.

## Why this is not a defect

1. **The `false`-skips behavior is explicitly test-locked as intended.**
   `test/composition.test.ts:235`:
   ```ts
   it("when() false skips modifier", () => { assert.strictEqual(render(Button("Save").when(false, t => t.addClass("bg-blue-500"))), `<button>Save</button>`); });
   ```
   Plus `test/fluent-styling-v2.ts:284` ("variant proxy skipped with .when(false)"). A behavior the suite asserts by name is a contract, not an oversight.

2. **The typeof-boolean-first fork is the library-wide dispatch semantic, not a local quirk.**
   `IfThen` and `IfThenElse` (`src/control/conditionals.ts:30,63`) use the identical fork, and the `when` JSDoc (tag.ts:233-234) says the nullable branch "mirror[s] `whenElse`/`IfThen`". The project guidelines document this same dual-mode model for `IfThen` (boolean → truth test; nullable value → null test). `when` is consistent with the ecosystem it lives in.

3. **The JSDoc does not "promise non-null dispatch" for booleans.**
   The first sentence of the JSDoc (tag.ts:232-233) is: *"With a boolean, the modifier runs when it is `true`."* A runtime `false` **is** a boolean, so its behavior — skip — is stated explicitly, before the nullable-value sentence. The falsy-but-present list (`0`, `""`) correctly omits `false` because `false` never reaches the value rule; the omission is definitional, not "conspicuous". Same structure in `whenElse`'s JSDoc (tag.ts:257-259: "With a boolean it runs `thenFn`/`elseFn`").

4. **No alternative implementation exists for a single overloaded name.**
   JavaScript cannot distinguish a `false` passed as a *condition* from a `false` passed as a *value* at runtime. Dispatching booleans to the value rule instead would break the primary documented use (`when(isLoading, …)` would always run). Given the dual-mode API shape — shared with `IfThen`/`IfThenElse` — typeof-first is the only coherent choice. The finding's "better" fix (`whenSome`) is a new-API feature request, which implicitly concedes `when` itself cannot behave differently.

## What survives (residual, non-defect)

There is a genuine type-level sharp edge for the narrow case of a `boolean | undefined` / `boolean | null` field: TS overload resolution selects the value overload (declared first, tag.ts:245), typing the callback as `(tag, value: boolean)`, yet a present `false` never invokes it. That is a real footgun for nullable-boolean props, and one clarifying clause in the two JSDocs ("a present `false` follows the boolean rule and skips") would be cheap and worthwhile. But this is a docs polish item on intended behavior — the finding's own classification ("issue", proposal = document it) matches that, and per the verification rubric a documented-and-tested semantic that behaves as specified is not a confirmable defect.

**refuted = true, confidence = medium** (behavioral facts fully verified by code and tests; the residual nullable-boolean type-vs-runtime asymmetry is real but is an inherent property of the intended dual-mode design, shared by `IfThen`, and is not a code defect).
