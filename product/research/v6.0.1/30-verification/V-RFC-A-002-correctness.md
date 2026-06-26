---
rfc: RFC-A-002
lens: correctness
verdict: survives-with-changes
confidence: 0.82
killer_objection: null
required_changes:
  - "Drop the false streaming premise. The RFC repeatedly claims streaming reads context 'at iteration time' / 'while the generator is being drained' and that there is a 'build-time-read contract streaming depends on.' This is factually wrong: View = Tag | string | RawString | View[] (src/core/types.ts:6) is a fully-eager data structure with no thunk/lazy view kind, and emitChunks (serialize.ts:312) walks an already-built tree — it invokes NO user code and reads NO context during the walk. Span(Ctx.current) resolves Ctx.current at component-call (build) time and freezes the string into the tag. Remove every 'iteration-time read' / 'drain-time' / 'build-time-read contract streaming depends on' assertion from the Problem section, F-A-184, and the CHANGELOG entry."
  - "Reframe deliverable 3 honestly or cut it. As written, the proposed streaming tests pass only because Div(Box())/Span(Ctx.current) are evaluated as arguments while the `using` scope is still live and synchronous — the scope is irrelevant by drain time. The test name 'a scoped context is read by a streaming render' encodes the OPPOSITE of the truth and will teach authors a false mental model (that the scope must stay open during drain). Either (a) delete the streaming test, since streaming pins nothing the sync-only contract doesn't already cover, or (b) rewrite it to assert the real property: context is captured at VIEW-BUILD time, so the scope must be live when the component function runs, NOT during drain. A non-vacuous version must demonstrate this — e.g. build the view inside the scope, dispose the scope, THEN drain, and assert the streamed bytes still reflect the build-time value (proving drain reads nothing from context)."
  - "Fix the F-A-184 finding text. The finding asserts a coverage gap whose justification ('emitChunks walks the tree at iteration time, so a context must be scoped while the generator is being drained') is false. Restate the gap accurately: there is simply no test that a built-with-context view round-trips through the streaming path identically to render() — a legitimate but much weaker gap than claimed."
file: /Users/tony/jt-digital/fluent-html/product/research/v6.0.1/30-verification/V-RFC-A-002-correctness.md
---

# Verdict: RFC-A-002 — correctness lens

> Adversarial review. Kill on uncertainty. This RFC ships to 6.0.1 (patch): docs + test wiring, no public shape change.

## Attack

**Correctness failure mode 1 — the streaming rationale is factually inverted.**
The RFC's load-bearing technical claim is that streaming reads context *late*:

- Problem §: "`emitChunks` walks the tree at iteration time, so a context must be scoped while the generator is being drained."
- F-A-184: "pinning the build-time-read contract that streaming depends on."
- CHANGELOG: "locking the build-time-read contract streaming relies on."

This is wrong. `View = Tag | string | RawString | View[]` (`src/core/types.ts:6`) is a **fully-eager data structure** — there is no function/thunk view kind (`Thunk<T>` exists as a type but is deliberately NOT in the `View` union). `emitChunks` (`serialize.ts:312–376`) pops frames off a work-stack and appends literal strings/escaped text/tag markup; it **never calls a component and never reads a context**. `Span(Ctx.current)` evaluates `Ctx.current` at the moment `Span(...)` is called (build time) and stores the resolved string into the tag's child. By the time the generator is drained, the value is frozen into the tree and the scope is irrelevant. The two phrases the RFC uses — "build-time-read" and "scoped while the generator is being drained" — are mutually contradictory, and only the first is true.

**Correctness failure mode 2 — the proposed test is vacuous and anti-pedagogical.**
Both proposed cases pass, but for the *opposite* reason the RFC gives:

```ts
using _ = Ctx.scope("b");
const out = await streamToString(renderToStream(Div(Box())));  // Div(Box()) runs NOW, sync, scope live → "b" frozen in
```

`Div(Box())` is an argument expression evaluated **before** `renderToStream` is invoked, synchronously, while `_` is live — so "b" is captured at build time and the await/drain that follows reads nothing from context. The test would pass identically if the scope were disposed before draining. It therefore pins **no** streaming-specific property. Worse, its title ("a scoped context is read by a streaming render") asserts live-during-drain reading, which is false, and an author who trusts it will write `scope(); return renderToStream(view)` expecting the scope to matter during drain, or will (correctly but for the wrong reason) keep scopes open across the async stream pipeline. A test that passes while encoding a false invariant is a correctness liability, not coverage.

## Does it survive?

**survives-with-changes.** The RFC is two-thirds correct and one-third wrong, and the wrong third is repairable without touching the valuable parts.

What is **correct and should ship as-is**:
- **Deliverable 1 (sync-only contract docs).** The async hazard is real and accurately described: `createContext`/`createRequiredContext` back each context with a per-closure stack that is a module-scope singleton (`context.ts:70`, `:111`), `current` reads `stack[len-1]` (`:74`, `:118`), and holding an `await` across a live scope lets a concurrent request's push/pop interleave and corrupt the read. The ✓/✗ worked examples are accurate (including the correct note that `scope(await load())` is fine because the await resolves first). This is the genuine F-A-180 bug seed and the documentation lane is the right call given zero-deps + sync-hot-path guardrails.
- **Deliverable 2 (wire `context.test.ts` into CI).** Verified: `test/context.test.ts` (191 lines) appears in **neither** the `test` nor the `test:coverage` file list in `package.json`. The entire context surface ships at 0% CI coverage. Real, accurate, additive. Note a secondary true observation the RFC could fold in: `define-theme.test.js` is in `test` but **missing from `test:coverage`** — a sibling wiring gap.

What is **wrong and must change**: deliverable 3 and every "streaming reads context at drain time" / "build-time-read contract streaming depends on" assertion (Problem §, F-A-184, CHANGELOG). See `required_changes`.

This is not a `reject`: the false claim does not corrupt deliverables 1–2, no public shape changes (runtime byte-identical — confirmed, `context.ts` and `serialize.ts` untouched), and the 6.0.1 lane holds. But a correctness verifier cannot let a deliverable ship whose stated justification is false and whose test asserts a non-existent invariant. Hence `survives-with-changes`, not `survives`.

## Guardrail check (correctness lens)

- **No public shape change:** confirmed — JSDoc + `package.json` script strings + one appended test; runtime identical. Patch lane intact.
- **The documented contract matches the code:** confirmed for the context async hazard (the core, real claim).
- **The documented contract matches the code — streaming:** **FAILS as written.** The RFC documents/tests a "scope-live-during-drain" / "iteration-time read" property the code does not have; views are eager and the serializer reads no context. Must be corrected before merge.
