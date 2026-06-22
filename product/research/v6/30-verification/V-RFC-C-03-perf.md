---
rfc: RFC-C-03
lens: perf
verdict: survives-with-changes
confidence: 0.78
killer_objection: null
required_changes:
  - "Pin the target read at module-init, not per-call. `setTailwindTarget()` must be required-before-render (call-once at app entry); the methods must read a hoisted boolean (`let IS_V4 = false`) set once by the setter, NOT call `getTailwindTarget()` inside every styled method. A function-call + string-compare per styled call is a per-request construction-path cost imposed on the default-v3 common case to serve the rare v4 feature."
  - "Forbid any warning/`console.warn`/`onWarning` on the construction path for the v3 (default) target. `gradientRadial()`/`gradientConic()` 'no-op-warns on v3' must NOT emit a runtime warning per call at render-build time — push v3-misuse detection entirely into ESLint (static), or gate the warn behind a dev-only `process.env.NODE_ENV !== 'production'` check so production SSR never pays it."
  - "State explicitly in the RFC that the target is read ONLY at construction time and NEVER on the synchronous render/stream walk (render consumes the already-materialized `this.class` string). Add this as a guardrail invariant so Wave-4 _merge can assert byte-identical render/stream output regardless of target."
  - "The v4 remap tables (`SHADOW_V4`, rounded/blur) must be module-level frozen constants with zero per-call allocation, and the lookup must short-circuit on the v3 path (the default). Confirm no `value ?? \"\"` intermediate object/array is created per call."
---

# Verdict: RFC-C-03 — perf lens

> ADVERSARY. Killing RFC-C-03 through the perf failure mode: protect the synchronous SSR hot path; the common case must not pay for a rare feature.

## Attack

The fluent styling methods (`.shadow()`, `.rounded()`, `.gradientTo()`, etc.) are **construction-path** code — they run during tree building, which in this library is **per-request** in SSR. Track-D recon already flags construction allocation as a live hot spot (~14.5KB/1000 divs paid per request, ALGORITHM §10 Track-D / §11.2). So "build-time, not render-time" is NOT a free pass here: construction *is* on the per-request critical path. Three concrete perf failure modes:

- **perf failure mode 1 — the v3 (default) common case pays for the v4 feature.** Every remapped method gains a `getTailwindTarget() === "v4"` branch (RFC emit logic, lines 118–133). For a consumer who never opts in — i.e. *every current `ttl`/`rideshare` request and every v6.x request, since the default stays `"v3"` through all of v6.x per Open Question 3 — each styled call now executes an extra **function call + string comparison** that did not exist in v5. Across thousands of fluent calls per page (the RFC itself cites 64+ `.border()` sites, 119+ buttons, ~29 `.shadow()` sites in just two apps), this is a measurable construction-path regression imposed on 100% of the default-target traffic to serve a feature 0% of default-target traffic uses. This is the textbook "common case pays for a rare case" violation of guardrail §11.2. The RFC's §11.2 self-check ("one `getTailwindTarget()` … negligible") hand-waves the per-call function-call overhead — a `function getTailwindTarget(){return _t}` call is not free at the volume of a real page, and the JIT may not inline a cross-module module-var getter reliably.

- **perf failure mode 2 — a warning on the construction hot path.** The RFC specifies `gradientRadial()`/`gradientConic()` as "no-op-warns on v3" (lines 75, 160). A `console.warn` (or `onWarning` callback) executed during tree construction under the **default** target is a per-call, per-request cost on the production hot path — `console.warn` is synchronous I/O-ish and slow, and string-formatting the message allocates. The library core today has **no** warning mechanism on this path (confirmed: no `console.warn`/`onWarning` in `src/core/*.ts`). Introducing one, defaulted-on under v3, is a real regression and an SSR anti-pattern.

- **perf failure mode 3 — per-call remap allocation.** The v4 path uses `SHADOW_V4[value ?? ""]`. If the remap tables are constructed lazily or the `?? ""` / lookup path materializes intermediates, that is per-call allocation on the v4 construction path. The RFC shows `const SHADOW_V4` at module scope (good) but does not *commit* to zero per-call allocation, nor that the v3 default short-circuits before touching it.

## Does it survive?

**Survives-with-changes.** The architecture is fundamentally perf-safe in one critical respect that defeats the strongest possible kill: **the target is consumed at construction and never on the render/stream walk** — `render`/`stream` consume the already-materialized `this.class` string, so the synchronous emit hot path stays byte-identical regardless of target, and there is **zero async** anywhere. That is the load-bearing perf invariant and it holds. No allocation is added to render; no async touches the sync path. The dual-target design is genuinely "branch once at the string-emit step," not a per-node render tax.

What it does NOT yet defend is the **construction** path for the default-v3 majority. The fixes are cheap and mechanical (fold the target into a hoisted boolean read once by the setter; move v3-misuse warnings to ESLint/dev-only; freeze the remap tables; assert v3 short-circuit). With those four changes the common-case construction cost collapses to a single hoisted-boolean read (or, on the false branch, the original v5 code path verbatim), and the rare-feature cost stays where it belongs. None of the changes alter the public API surface, so they fold back cleanly. Hence survives-with-changes, not reject — but the changes are required, not optional, because as written the RFC taxes every default-target request.

## Guardrail check (perf owns §11.2)

- **§11.2 SSR-only, synchronous render path stays fast:** PASS on render/stream (target never read there; output byte-identical across targets; zero async). CONDITIONAL on construction: as written, adds a function-call + compare per styled method to the default path and a warn to the v3 gradient path — both must be removed per required_changes before §11.2 is satisfied. With the changes applied, §11.2 holds end-to-end.
- No new dependency, no async, no streaming/backpressure change — the perf-relevant guardrails beyond §11.2 are untouched.
