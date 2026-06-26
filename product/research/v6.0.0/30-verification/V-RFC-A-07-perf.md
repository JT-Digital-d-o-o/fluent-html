---
rfc: RFC-A-07
lens: perf
verdict: survives-with-changes
confidence: 0.84
killer_objection: null
required_changes:
  - "Narrow signNeg's parameter to `string` and drop the `String(value)` coercion. The public signatures already constrain inputs to string unions (TailwindSpacing/TailwindRotate/TailwindSkew), but the impl sketch types `value: string | number` and calls `String(value)` on every transform call. Type the helper `signNeg(prefix: string, value: string)` so the coercion branch disappears."
  - "Keep signNeg's positive branch a single interpolation and only branch/slice when a sign is actually present. The negative branch does `v.slice(1)` + a second template (two allocations); ensure the positive branch (the majority of transform calls: `rotate(\"45\")`, `scale`) stays `${prefix}-${v}` with one allocation and no slice. The sketch already does this — pin it as a requirement so a refactor doesn't regress it."
  - "Route the 16 zero-arg shortcuts (.fixed(), .block(), .inlineFlex(), …) through `this.addClass(\"<literal>\")` with constant interned strings only — never through a shared value-formatting helper. This keeps them strictly cheaper than position(value)/display(value). The sketch does this; lock it so it isn't 'DRYed' into a table-lookup that reintroduces an allocation."
  - "Define signNeg at module scope (as sketched), not inside the prototype assignment, and do not capture `this` — a per-call closure would add a per-transform allocation on the construction path."
---

# Verdict: RFC-A-07 — perf lens

> You are an ADVERSARY. Your job is to KILL this RFC through the perf lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The perf lens guards guardrail §11.2: the synchronous SSR hot path must stay fast, no new per-request allocation, the common case must not pay for a rare feature, and any async must be opt-in. I grounded every claim against the live implementation.

- **The funnel is `addClass` (`src/core/tag.ts:102`), and the RFC adds nothing to it.** All 16 methods in `api_surface` terminate in `this.addClass(...)`. The RFC touches neither `addClass` (no new dedup/conflict-resolution branch) nor the render/stream/fold emitters. The only perf question is the cost of building the class string *before* the funnel, and which path pays it.

- **Common-case methods are byte-for-byte unchanged — verified.** `padding`/`margin`/`background`/`textColor` (`tailwind-methods.ts:337-368`) and the 1,907-call-site `position`/`display` pass-throughs (`:459`, `:469`) are not modified. The negative-transform fix is confined to `translate`/`rotate`/`skewX`/`skewY`, which recon counts at **9 call-sites total across all apps** (RFC §Problem / F-A-061), living inside `.on("hover", …)` micro-interactions — never in per-row list-render loops. The common case pays nothing. This is the attack I most wanted to land (common case subsidizing a rare feature); it fails on the evidence.

- **Residual cost in `signNeg` is real but cold and bounded.** The impl sketch types `value: string | number` and does `String(value)` + `v.startsWith("-")` + (negative branch) `v.slice(1)` + a second template — up to two extra allocations per transform call plus a dead coercion. That is genuine micro-debt: the union is already `string`, so `String()` is wasted, and the positive branch must not inherit the slice cost. It lives entirely on the 9-call-site cold path, so it cannot move the per-request needle — but "default to reject under uncertainty" plus a sloppy sketch on the perf-owned lens means I require it tightened rather than waved through. This is the basis for survives-with-changes, not reject: the debt is bounded and mechanically fixable.

- **Zero-arg shortcuts are a perf win, not a cost.** `.fixed()` → `addClass("fixed")` passes an interned literal; today's `position("fixed")` → `addClass(value)` passes a value that arrived through a union/template. The shortcuts *remove* argument marshalling and interpolation. No construction-path regression — a micro-improvement on migrated sites.

- **No instance-shape growth, no per-call closure.** All 16 methods are added once to the shared prototype `p`, not per-instance — the monomorphic Tag shape and Track-D allocation budget ("~14.5KB/1000 divs", `00-recon/04-performance.md`) are untouched. `signNeg` is module-level with no `this` capture, so no per-call allocation — provided the author keeps it module-scoped (pinned in required_changes).

- **No async anywhere.** Pure synchronous string building; nothing touches `stream.ts`, backpressure, or the fold path. The §11.2 "async must be opt-in" clause is N/A.

- **JIT de-inlining of `signNeg`?** Even if V8 declines to inline it, a monomorphic module-level call (same site, same string arg type) is single-digit nanoseconds, wrapping an `addClass` concat (`tag.ts:108-112`, which itself may `split`/`map`/`join` under a variant prefix) that dwarfs it. Not a render/stream regression — none of this runs during render/stream.

The strongest perf objection available is the `signNeg` coercion + double-alloc, and it is confined to ~9 cold call-sites. There is no hot-path regression to reject on.

## Does it survive?

**survives-with-changes.** The RFC adds no async, no common-path allocation, no instance-shape growth, does not touch the synchronous render/stream emitter, and makes the position/display common case *cheaper*. The only perf debt is micro-inefficiency inside `signNeg` on the rare transform path. I require it tightened (drop `String()`, single-allocation positive branch, literal-constant shortcuts, module-scoped helper) so the cold path is also clean — all mechanical, folding straight into the impl sketch.

## Guardrail check (perf owns §11.2)

§11.2 — "SSR-only, synchronous render path stays fast": **PASS.** No async; the synchronous hot path (`addClass`, render, stream, fold) is unmodified. New cost is confined to ~9 rare construction-time call-sites, bounded to ≤2 small string allocations each, which the required changes reduce to ≤1 on the common positive sub-path. Hot styling methods and the 1,907 position/display sites are unchanged. The common case does not pay for the negative-transform feature.
