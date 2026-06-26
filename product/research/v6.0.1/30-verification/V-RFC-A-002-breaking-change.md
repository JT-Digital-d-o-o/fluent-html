---
rfc: RFC-A-002
lens: breaking-change
verdict: survives
confidence: 0.9
killer_objection: null
required_changes: []
---

# Verdict: RFC-A-002 — breaking-change lens

> ADVERSARY: kill this RFC by finding a public-shape break smuggled into a 6.0.1 patch.
> A patch that changes ANY public shape FAILS and must be forced to parked-major.

## Attack

I attacked the three deliverables looking for a shape delta against the v6.0.0
published surface. Each was probed:

- **Deliverable 1 — JSDoc on `createContext` / `createRequiredContext`
  (context.ts).** Verified the file (context.ts:30-130): the documented contract
  ("a scope is valid only on one uninterrupted synchronous call stack; never hold
  an `await` across a live scope") is the *already-shipped* behavior of the
  module-global `const stack: T[]` (context.ts:70, :111). The exported
  `type Context<T>`, `createContext<T>(defaultValue)`, and
  `createRequiredContext<T>(name)` signatures are untouched. Comments are not a
  public shape. **No break.** Critically, documenting existing behavior does NOT
  alter the runtime — the proposal does not retrofit AsyncLocalStorage or a
  render-id token (those are correctly fenced to parked-major in §Compatibility),
  so the runtime stays byte-identical. The one real break-vector is explicitly
  parked, not smuggled.

- **Deliverable 2 — add `dist/test/context.test.js` to `test` / `test:coverage`
  in package.json.** Verified package.json:49-50: `context.test.js` is genuinely
  absent from both globs (`grep -c context.test` → 0). These are internal
  `node --test` dev scripts, not part of the consumed package surface — the
  published `exports`/`types`/`bin`/`engines` map is unaffected. Adding a test
  file to a runner glob is invisible to consumers. **No break.**

- **Deliverable 3 — new streaming context-isolation tests in stream.test.ts.**
  Verified the file already imports `renderToStream`, `renderToIterable`
  (stream.test.ts:6) and defines the `streamToString` helper (stream.test.ts:29).
  The new cases use only existing exports + a test-local helper; nothing new is
  exported, and test files do not ship in `dist/src`. **No break.**

Hardest residual probe — does the RFC *require* a new public export anywhere
(guidelines/README/CHANGELOG)? Checked: all guideline, README, and CHANGELOG
edits are prose. None introduces a new exported symbol or changes a signature.
`api_surface: []` in the front-matter matches reality.

## Does it survive?

Yes. The breaking-change lens owns exactly one question — does this 6.0.1 patch
change any public shape? — and the answer is no across all three deliverables.
The runtime is byte-identical (only JSDoc comments added to context.ts); the
package.json change touches dev-only test globs; the new tests add no export. The
genuinely breaking alternative (async-isolation via AsyncLocalStorage or a
threaded render-id) is correctly identified and PARKED for a major, not slipped
into the patch. This is a textbook clean 6.0.1: behavior documentation + test
wiring with no surface delta.

Confidence is 0.9 rather than higher only because the verdict rests on the RFC's
implementation matching its description — if the eventual diff were to widen
`scope()`'s signature or add an export, that would flip to reject; but as
specified, there is nothing to kill.

## Guardrail check (lens owns: additive-only / patch-stays-a-patch)

PASS. 6.0.1 lane holds: no public-shape change. `Context<T>`,
`createContext`, `createRequiredContext` signatures unchanged; published
`exports` map unchanged; runtime byte-identical. The break-capable mechanism is
parked-major, not smuggled into the patch.
