---
rfc: RFC-C-02
lens: perf
verdict: survives-with-changes
confidence: 0.78
killer_objection: "The worked-example rewrite turns every vocab-dependent fluent setter from a zero-overhead static template literal (`bg-gradient-${dir}`) into a runtime double property-lookup (`CLASS_VOCAB[TW_TARGET].gradientLinearPrefix-${dir}`), paid per element, per request, on the synchronous construction hot path — for a value that is build-time-constant."
required_changes:
  - "Resolve the vocabulary at MODULE LOAD, not per call. The hot-path methods must close over a pre-resolved local string, not index `CLASS_VOCAB[TW_TARGET]` at call time. e.g. `const V = CLASS_VOCAB[TW_TARGET]; p.gradientTo = (dir) => this.addClass(V.gradientLinearPrefix + '-' + dir)`. The RFC's worked example (line 184) must be replaced with this form so no method body performs a `CLASS_VOCAB[TW_TARGET]` two-level lookup on each invocation."
  - "Add an explicit `§11.2` perf clause to the Guardrail check stating: the resolved vocabulary string is captured once at module init; no fluent method indexes the vocab table or reads `TW_TARGET` inside its body; the only per-call work is the same single template concatenation that exists today. State that this was benchmarked against the 1000-div construction baseline (recon §04) and shows no regression — or mark it as a required Track-D proof obligation before merge."
  - "Constrain `TW_TARGET` to be resolved exactly ONCE, synchronously, before any Tag construction — never from `process.env`/config on a per-render or lazy path. The RFC says 'env/config override of default' (line 82); pin this to a module-init-time read so a misimplementation can't put an env lookup on the hot path."
  - "Forbid `emitSafelistCss()` returning a Promise from being reachable on the render path. It is a build-time CLI/config API; add a guardrail note that no runtime/SSR code path may import or await it, keeping the async surface entirely off the sync render hot path."
---

# Verdict: RFC-C-02 — perf lens

> You are an ADVERSARY. Your job is to KILL this RFC through the perf lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The RFC's frontmatter and Guardrail check (§11.2) claim "no per-render branching added… target is resolved at build/config time only." The prose is right. **The worked example contradicts the prose, and the worked example is what gets implemented.**

- **perf failure mode 1 — per-call property lookups on the construction hot path.** Today every vocab-dependent setter is a single static template literal:
  ```ts
  // src/core/tailwind-methods.ts:576 (verified)
  p.gradientTo = function (direction) { return this.addClass(`bg-gradient-${direction}`); };
  ```
  The RFC's "after" (line 184) is:
  ```ts
  p.gradientTo = (dir) => this.addClass(`${CLASS_VOCAB[TW_TARGET].gradientLinearPrefix}-${dir}`);
  ```
  This adds **two property accesses per call** — `CLASS_VOCAB[TW_TARGET]` (object index) then `.gradientLinearPrefix` — plus an extra string concatenation, on a method that runs **once per styled element, per request**, on the synchronous SSR construction path. Recon §04 already flags construction allocation as a measured cost (~14.5KB/1000 divs paid per request); the fluent setters are exactly that path. There are **125 `addClass(\`…\`)` template-literal call sites** in `tailwind-methods.ts` (verified by grep). If the single-sourcing pattern is applied uniformly — which is the RFC's whole point ("methods/extractor/eslint all import it") — a meaningful fraction of those 125 hot setters each grow a double-lookup-plus-concat where they previously had a frozen literal. This is the textbook "common case pays for a rare feature": every gradient/shadow/outline render in production pays a lookup so that a once-per-process migration flag can be flipped. The value being looked up is **build-time-constant** — `TW_TARGET` cannot change mid-process — so 100% of that per-call work is avoidable.

- **perf failure mode 2 — the `TW_TARGET` resolution site is unpinned.** Line 82 calls `TW_TARGET` the "resolved value (env/config override of default)." "env override" is a landmine: if a naive implementation reads `process.env.TW_TARGET` inside the resolution and that resolution is referenced per call (as the worked example does), you've put an env read — or at minimum a live module-binding read that defeats the engine's ability to inline a frozen literal — on the hot path. The RFC never states *when* `TW_TARGET` is resolved relative to first Tag construction. Under the verifier's default-reject posture, an unpinned resolution site on a hot-path-reachable value is a reject-grade ambiguity.

- **perf failure mode 3 (checked, cleared) — async.** `emitSafelistCss(): Promise<void>` is the only async surface. It is a build-time CLI/config API (invoked from the `build:safelist` npm script), not reachable from render. This is correctly off the sync path **as designed**, but the RFC never says so explicitly, so I require a guardrail note forbidding its import from any runtime path.

## Does it survive?

**survives-with-changes.** The *design intent* is perf-safe — a build-time literal-union switch genuinely need not touch the render path, and §11.2's prose claims exactly that. The defect is entirely in the worked example (line 184), which implements the switch as a per-call table index and thereby *creates* the per-render cost the frontmatter swears it avoids. Because Wave-2/3 fold the worked example back into the RFC and it is what implementers copy, the RFC as written would ship a small-but-real, fully-avoidable regression across ~125 hot setters. That is not reject-grade — the fix is mechanical and preserves every benefit (single source of truth, the cross-package test, the literal-union types) — but it is not "survives" clean either, because the hot path is provably touched as currently specified.

The fix is to **resolve the vocabulary once at module load** and have methods close over the resulting plain string, so the per-call cost returns to exactly today's single concatenation:

```ts
// resolved ONCE at module init — TW_TARGET is build-time constant
const V = CLASS_VOCAB[TW_TARGET];
p.gradientTo = function (dir) { return this.addClass(`${V.gradientLinearPrefix}-${dir}`); };
```

This is strictly better than even the status quo's maintainability and identical to it in per-call cost (one closure read + one concat — the closure read is monomorphic and inlinable, no table index). With the four required changes folded in, the perf guardrail holds.

## Guardrail check (§11.2 — perf lens owns this)

- **As written: FAIL.** Worked example line 184 puts a two-level property lookup (`CLASS_VOCAB[TW_TARGET].x`) plus an extra concat in the body of a per-element, per-request construction method, contradicting the frontmatter's "no per-render branching" claim.
- **With required changes: PASS.** Vocabulary resolved once at module load; methods close over a pre-resolved string; per-call cost equals today's single concatenation; `TW_TARGET` resolution pinned to a single synchronous module-init read; the only async (`emitSafelistCss`) explicitly fenced off the render path. The synchronous SSR hot path is then genuinely untouched, and the common case (rendering styled elements) no longer pays for the rare case (a once-per-process migration flag).
