---
rfc: RFC-A-004
lens: breaking-change
verdict: survives-with-changes
confidence: 0.78
killer_objection: null
required_changes:
  - "Correct the 'strict subset' claim in §Compatibility: F-A-161's new regex is NOT a strict subset — it also EMITS tokens the old regex never produced (e.g. `bg-[url(/x.png)]` whole, vs the old split into `bg-[url(/x.png)` + `]`). Restate as: junk call-expression tokens dropped AND arbitrary `[...]` values now kept intact; both directions are safelist-safe (gain valid class, lose garbage), but it is not literally a subset."
  - "State explicitly that extractor (`fluent-html-tailwind-extractor` @ 2.0.0) and eslint-plugin (`eslint-plugin-fluent-html` @ 1.7.0) are SEPARATELY versioned from the lib (6.0.0). The behavioral output change to `extract.ts` exported functions (`extractDefaultClasses`/`scan`/`scanFluent`/`extractClasses`/`extractVariantClasses`) is governed by the EXTRACTOR's semver, not the lib's 6.0.1. Bump/changelog those packages on their own tracks; do not fold their behavior change under the lib's 6.0.1 patch line without saying so."
  - "Add a snapshot/regression-churn note: any downstream consumer asserting the OLD spurious extractor output (bare `bg-blue-600`, partial-prefix `hover:bg-red-500`, split `bg-[url(/x.png)`) will see test churn. Document this as expected and call it the extractor's own patch-level behavior change."
---

# Verdict: RFC-A-004 — breaking-change lens

> Lens question: does this 6.0.1 patch change any public shape of the CORE lib? A patch that changes public shape FAILS and must be parked-major.

## Attack

I tried to force this into parked-major on three fronts.

- **Lib public-surface break (the lane-check):** The only core-lib touch is F-A-163, a single new assertion inside `test/class-vocab.test.ts`. No runtime code path, no exported symbol, no type, no signature changes in `src/**`. F-A-162 only *reads* the lib's `UNITS`, which is already exported at `src/class-vocab/index.ts:8` — it adds nothing to the lib surface. Verified: lib public shape is untouched. This attack fails.

- **`extractDefaultClasses` is an EXPORTED public function — changing its regex is a behavior break:** True that it's exported (`extract.ts:158`) and its behavior changes. But the extractor is a SEPARATELY VERSIONED package (`fluent-html-tailwind-extractor` @ 2.0.0), not the lib. Its behavior change is a bugfix on ITS own semver line, not on the lib's 6.0.1. The RFC's `ships_to: 6.0.1` refers to the lib's release train; the extractor/eslint changes ride alongside on their own versions. This is a documentation-clarity gap, not a lib lane-check failure.

- **"Strict subset" is false → hidden semantic change:** Confirmed false. The F-A-161 regex doesn't merely drop junk — it now keeps `bg-[url(/x.png)]` intact where the old regex split it into `bg-[url(/x.png)` + `]`, i.e. it *produces new tokens*. But this strengthens the safe-direction argument: the safelist gains a genuinely-valid arbitrary-value class and loses garbage. No emitted-at-render class is dropped. Non-breaking in effect; the claim is just mis-stated.

## Does it survive?

**Survives-with-changes.** The breaking-change lens cannot kill this: the core lib's public shape is provably unchanged (one test added, `UNITS` already exported, zero runtime/type/signature edits). The genuine behavior changes all live in two independently-semver'd tooling packages (extractor 2.0.0, eslint-plugin 1.7.0), and are correctness bugfixes appropriate to those packages' own patch lines. The eslint plugin's `VOCAB_UNITS` is an additive export to an already-non-semver-public generated file.

The defects are precision, not principle: (1) the "strict subset" claim is literally wrong (F-A-161 adds tokens), and (2) the RFC blurs the lib's 6.0.1 train with the tooling packages' separate semver, which could let an unwary maintainer ship the extractor behavior change without versioning/changelogging the extractor itself. Both fold back as wording fixes (see required_changes); neither forces parked-major.

I also confirmed F-A-163's reverse guard will pass on shipped code: every `addClass("…")` literal in `tailwind-methods.ts` (`font-bold`, `italic`, `flex`, …) maps to a vocab-registered method, and the lone outlier `htmxIndicator` (`htmx-methods.ts:44`) is already mirrored at `vocab.ts:252`, so the guard goes green on day one rather than failing CI on landing.

## Guardrail check (breaking-change owns the lane-check)

- **Core lib 6.0.1 stays a patch:** PASS. No public shape change in `src/**`; only `test/class-vocab.test.ts` gains an assertion. `api_surface: []` is accurate.
- **No symbol smuggled into the lib:** PASS. `VOCAB_UNITS` lives only in the eslint plugin's generated file; `UNITS` is pre-existing.
- **Caveat folded back:** the extractor/eslint behavior changes must be versioned on those packages' OWN semver (extractor 2.0.0, plugin 1.7.0), and the "strict subset" wording corrected — required_changes above. These are non-blocking and do not promote the RFC to parked-major.
