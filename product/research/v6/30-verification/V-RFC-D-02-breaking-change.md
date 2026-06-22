---
rfc: RFC-D-02
lens: breaking-change
verdict: survives-with-changes
confidence: 0.74
killer_objection: The RFC ships a real, in-repo behavioral break (per-tag chunk boundaries → coalesced 16 KiB chunks) while loudly self-certifying "Additive — nothing breaks" and "No `breaking-changes.md` entry required." The break is small and codemod-free, but the *honesty* of the change classification is wrong, which is exactly what this lens guards.
required_changes:
  - "Reclassify the chunk-boundary change. The existing in-repo test test/stream.test.ts:355 asserts `chunks.length >= 3` for `Div(P(\"Hello\"))`, which is guaranteed today by per-tag-boundary `push()` but is FALSE after coalescing (default chunkSize 16 KiB collapses that page into a single `push()`, chunks.length === 1). The RFC must (a) acknowledge this is an observable behavior change to chunk count/granularity, (b) update or delete that assertion as part of the RFC's own test deliverables (the RFC already rewrites this test block — make the deletion explicit), and (c) keep frontmatter `breaking: additive` ONLY after asserting that chunk boundaries were never a public contract — which the RFC claims but does not prove. Add the supporting `grep` evidence (no app asserts chunk count) the same way it did for the double-render claim."
  - "Document chunk *type* stability. Today `streamImpl` calls `stream.push(string)`; a `Readable` in object-mode-off converts strings to `Buffer` on the `data` event. `renderToIterable` yields `string`. The RFC must state explicitly that `renderToStream`'s `Readable` still emits `Buffer` chunks (not strings) so consumers using `chunk.toString()` / Buffer concatenation are unaffected, and that the generator is the only `string`-yielding surface. Otherwise a silent `Buffer`→`string` change in `data` payloads would be a real, untyped break."
  - "Lock the `View[]` argument behavior. The proposed Fastify decorator does `renderToStream(views.length === 1 ? views[0]! : views)` — passing an *array* View. Confirm `renderToIterable`/the work-stack walk applies the SAME `'\\n'`-between-array-members join that `render.ts:250` and current `streamImpl` use, and that byte-parity holds for the multi-view array path, not just the single-tag path. The parity test in the RFC only exercises a single `Div(...)`; add an array-of-views parity case so the join semantics can't silently drift."
  - "Make the RFC-D-01 dependency a hard gate in the migration section, not a footnote. The entire 'walked exactly once / holds position / no re-walk' contract is provided by RFC-D-01's work-stack. If RFC-D-01 ships in a different shape (e.g. still recursive), this RFC's byte-parity and no-double-render guarantees are unverifiable. State that RFC-D-02 MUST NOT merge before RFC-D-01's emitter exists and that the parity + backpressure tests are co-required (the RFC already half-says this in Open Questions — promote it to Migration & compatibility as a blocking condition)."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-D-02-breaking-change.md
---

# Verdict: RFC-D-02 — breaking-change lens

> You are an ADVERSARY. Your job is to KILL this RFC through the breaking-change lens.
> Default to `reject` under uncertainty.

## Attack

The RFC's entire migration posture rests on three load-bearing assertions: frontmatter `breaking: additive`, the section header **"Additive — nothing breaks,"** and **"No `breaking-changes.md` entry required."** The breaking-change lens exists to falsify exactly that kind of self-certification. It is falsifiable, and partly false.

- **Breaking-change failure mode 1 — undisclosed in-repo behavioral break (chunk granularity).** Today's `streamImpl` (`src/render/stream.ts:181-187`) does one `push()` per tag open / child / close — chunk boundaries are per-tag. The existing committed test asserts this:
  `test/stream.test.ts:355` → `assert.ok(chunks.length >= 3, ...)` for `Div(P("Hello"))`.
  The RFC replaces per-tag `push()` with **coalesce-to-`chunkSize`** (default 16 KiB). `Div(P("Hello"))` is ~20 bytes, so the new emitter buffers the whole thing and emits **one** chunk: `chunks.length === 1`. The currently-green test goes **red**. That is, by definition, a behavioral change to in-repo observable output (chunk count), and it is not acknowledged anywhere in "Migration & compatibility." The RFC even rewrites the *neighboring* test (the F-D-082 backpressure case) but never says the `>= 3` assertion dies — it silently must. An RFC that changes a committed test's outcome while claiming "nothing breaks" has misclassified its own diff. Per ALGORITHM §11.5, a behavioral change must be (a) codemod-able, (b) bundled into one migration, (c) justified — none of which is done for the chunk-boundary change because the RFC denies the change exists.

- **Breaking-change failure mode 2 — chunk-boundary contract asserted, not proven.** The RFC's defense (line 179) is "chunk boundaries were never a contract." That is the right defense — but it is stated as fact without the evidence the RFC *did* gather for its sibling claim (for the double-render fix it cites a `grep` showing "only the library export and tests" call `renderToStream`). The chunk-boundary claim gets no such grep. Under this lens, an unproven "it was never a contract" is exactly the assumption that turns out wrong (a downstream test or a manual `data`-event consumer counting chunks). The fix is cheap (run the grep, cite it) so this is a required change, not a kill.

- **Breaking-change failure mode 3 — silent chunk *type* drift risk.** `renderToStream` returns a `Readable`; current code `push`es `string`, and `data` listeners receive `Buffer`. `renderToIterable` yields `string`. The RFC never pins that `renderToStream`'s emitted chunk *type* is unchanged. If the rewrite accidentally flips the `Readable` to string/object mode, every `chunk: Buffer` consumer breaks silently and untyped. Must be nailed down in the contract.

## Does it survive?

**survives-with-changes.** None of the breaks are codemod-resistant or migration-grade: the only concretely-broken artifact is one library-owned test assertion, and there are zero in-repo app call sites (the export is library-only). The *behavior* changes the RFC intends — incremental flush, backpressure, no double-render — are genuinely improvements over a documented-but-false promise, and the public *signature* of `renderToStream(view)` is preserved (optional second arg, excess-property-checked). So `breaking: additive` is defensible for the **API surface**.

What is NOT defensible is the RFC's blanket "nothing breaks / no breaking-changes entry" framing applied to **observable runtime behavior** (chunk count/granularity). The lens's job is to force that honesty. The required changes fold the misclassification back in: explicitly own the chunk-granularity change, update the `>= 3` test as an RFC deliverable, prove the no-contract claim with a grep, and pin the chunk *type*. With those, the change is honestly marked, bundled into the one RFC migration, and stays codemod-free. Reject is not warranted because the breakage is bounded to library-internal tests and the fix is mechanical.

## Guardrail check (§11.5 backward-compat — this lens owns it)

- **Signature:** PASS — `renderToStream(view, options?)` is a pure additive overload; misspelled options are compile errors.
- **Runtime behavior:** CONDITIONAL — chunk granularity changes observably; must be reclassified from "nothing breaks" to "behavior change, no public contract, library-test-only impact" with grep evidence.
- **Output bytes:** PASS *iff* the array-of-views `'\n'`-join parity case is added (currently only single-tag parity is exercised; the proposed decorator passes a `View[]`).
- **Dependency gating:** must be promoted — byte-parity and no-double-render are inherited from RFC-D-01 and unverifiable if it ships in a different shape; co-merge gate required.
