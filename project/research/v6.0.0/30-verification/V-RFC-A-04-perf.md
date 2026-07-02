---
rfc: RFC-A-04
lens: perf
verdict: survives-with-changes
confidence: 0.86
killer_objection: null
required_changes:
  - "ForEachOr iterable non-empty path: avoid the redundant double Array.isArray check. The reference impl does `Array.isArray(items) ? items : Array.from(items)` then calls `ForEach(arr, fn)`, which re-runs `Array.isArray(arr)` internally. Either inline the array loop in ForEachOr, or branch directly: when already an array, call the array fast-path; only materialize via Array.from for non-array iterables. Net: one fewer branch per non-empty list render (in noise, but the RFC claims 'same cost as ForEach' — make it literally true)."
  - "State the allocation parity explicitly in the §11.2 guardrail line: ForEachOr non-empty array path allocates exactly one result array (identical to ForEach); the empty path allocates ZERO arrays (it returns emptyView() directly, strictly cheaper than the paired-IfThen it replaces, which evaluates two comparisons + builds the IfThen return). whenElse allocates nothing beyond the closure already passed in (one ternary, one call — byte-identical cost shape to when). No per-request allocation is added over the status quo."
  - "Constrain the count/range non-empty paths to the same single-allocation guarantee: ForEachOr(high, fn, empty) on high<=0 and ForEachOr(low, high, fn, empty) on low>=high must return empty() WITHOUT pre-allocating the `new Array(len)` that ForEach allocates. The reference impl already short-circuits before delegating to ForEach, so this holds — but add a test asserting no array is allocated on the empty branch (guards a future refactor that 'simplifies' by always delegating to ForEach then checking length)."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-A-04-perf.md
---

# Verdict: RFC-A-04 — perf lens

> You are an ADVERSARY. Your job is to KILL this RFC through the perf lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

I attacked the synchronous SSR hot path: does adding `ForEachOr` + `whenElse` make the common per-request render allocate more, drain iterables twice, introduce async, or make the common case pay for a rare feature? I read the live `ForEach` (`src/control/iteration.ts`) and `when` (`src/core/tag.ts:197-200`) to ground every claim against the real code these primitives mirror.

- **perf failure mode 1 — double-drain / double-allocation on the iterable path.** The RFC's reference impl (line 135) does `const arr = Array.isArray(items) ? items : Array.from(items); return arr.length > 0 ? ForEach(arr, fn) : empty()`. I checked: `ForEach`'s own array branch re-runs `Array.isArray` and allocates `new Array(arr.length)` (lines 69-76). So a non-empty *non-array* iterable is: `Array.from` (alloc #1) → `ForEach(arr)` → `new Array(len)` (alloc #2). **But that is exactly what bare `ForEach` does today** — `ForEach`'s non-array path is `Array.from(iterable).map(fn)`, which is *also* two arrays. So no regression: same single drain, same two arrays. The double-drain attack fails — `Array.from` is called once, the second pass is over the already-materialized array.

- **perf failure mode 2 — the common case (empty list, two-branch style) pays for the new abstraction.** This is where the attack inverts and *favors* the RFC. The empty branch returns `emptyView()` directly — **zero array allocation**, strictly cheaper than the paired-`IfThen` it replaces (two `length` comparisons + two `IfThen` return values). `whenElse` is one ternary + one closure call — byte-for-byte the cost of `when`, which it copies verbatim. Neither primitive adds a hidden per-render allocation, a closure-per-element, or a megamorphic dispatch.

- **perf failure mode 3 — async creep onto the sync path (guardrail §11.2).** None. Both functions are pure synchronous expressions returning `View`. No `Promise`, no thenable, no `await`, no generator, no `AsyncLocalStorage`. The sync hot path is literally untouched.

- **The one real (sub-noise) cost.** The iterable non-empty path runs `Array.isArray` twice (once in `ForEachOr`, once again inside the delegated `ForEach`). One redundant branch per non-empty list render. Branch-predicted, immeasurable in a real render, but it makes the RFC's literal claim "same cost as `ForEach`" false by one branch. Fixable by inlining the loop or dispatching to the array fast-path directly (required change #1).

## Does it survive?

**survives-with-changes.** I could not land a kill. The sync SSR hot path is not slowed; no async touches it; the common case (the empty-state fallback and the two-branch style modifier) is equal-or-cheaper than the status quo it replaces, not more expensive. The only finding is a one-branch redundancy and an under-specified allocation guarantee — tightening, not rejection. The three required changes fold back into the reference impl + the §11.2 line + a test; they remove the redundant `Array.isArray`, pin the zero-alloc empty path so a future "simplification" can't regress it, and make the allocation-parity claim literally true rather than approximately true.

## Guardrail check (perf lens owns §11.2)

§11.2 (SSR-only, synchronous render path stays fast): **PASS**, with the wording change in required change #2. Confirmed: no async API added; the synchronous render path allocates nothing beyond what `ForEach`/`when` already allocate; the empty branch and the `whenElse` path are strictly cheaper than the paired-call idioms they replace. No new per-request allocation, no double-drain of iterables, no closure-per-element, no megamorphic Tag-shape change. The hot path is not made to pay for a rare feature — there is no rare feature here, only two synchronous expression wrappers.
