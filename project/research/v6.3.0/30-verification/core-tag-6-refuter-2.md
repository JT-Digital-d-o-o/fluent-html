# core-tag-6 — Refuter 2 verdict: CONFIRMED (not refuted)

**Finding:** Mutation-based chaining with no `.clone()` — a reused Tag constant accumulates state across renders/requests.

**Mode:** refute-by-reproduction against `dist/` (v6.2.0, dist newer than src).

## Reproduction

Probe: `scratchpad/repro-core-tag-6.mjs` — module-level `const badge = Span('NEW').textColor('red-500')`, a component calls `badge.bold()` each render, rendered three times to simulate three SSR requests.

```
render 1: <div><span class="text-red-500 font-bold">NEW</span></div>
render 2: <div><span class="text-red-500 font-bold font-bold">NEW</span></div>
render 3: <div><span class="text-red-500 font-bold font-bold font-bold">NEW</span></div>
STATE LEAK ACROSS RENDERS: true
typeof badge.clone: undefined
```

Monotonic class accumulation reproduces exactly as claimed. Output HTML grows every request — a cross-request state leak in SSR.

## Corroborating checks

- **No clone API.** `grep clone src/core/tag.ts` — no hits; instance has no `clone` method (`typeof badge.clone === 'undefined'`).
- **Toggles also accumulate.** `toggle()` unconditionally does `this.toggles.push(name)` (src/core/tag.ts:220-229). A shared `Input().toggle('required')` re-toggled per render grows the array unboundedly; rendered output happened to show a single `required` in the probe, but the builder state still grows per request (memory leak + latent duplicate-emit risk).
- **Render itself is non-mutating.** Baseline check: re-rendering an untouched shared tag is stable (`a === b`), so the leak is purely builder-time mutation — matching the finding's framing.
- **No documented guardrail.** Searched README.md, docs/, fluent-html.md for mutability / instance-reuse / "export factories" guidance — nothing warns users that tags are mutable builders that must not be shared. The "by design, documented" defense does not hold.

## Verdict

**refuted = false.** The defect positively reproduces against the built library with a minimal, realistic usage pattern (module-level shared component constant). The proposal (add `clone(): this` + document "export factories, not instances") addresses a real, demonstrated hazard.
