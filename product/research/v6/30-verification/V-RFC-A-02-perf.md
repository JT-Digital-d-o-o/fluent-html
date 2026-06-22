---
rfc: RFC-A-02
lens: perf
verdict: survives-with-changes
confidence: 0.82
killer_objection: null
required_changes:
  - "setRole/setTabindex/setTitle MUST write directly into the existing attributes bag with the same EMPTY_ATTRS copy-on-write guard as addAttribute/setNonce — NOT delegate to addAttribute() (which re-runs validateAttributeKey on a fixed literal key, paying a per-call validation cost the render-hot construction path doesn't need). Spec the body as: `if (this.attributes === EMPTY_ATTRS) this.attributes = Object.create(null); this.attributes['role'|'tabindex'|'title'] = value; return this;`"
  - "Add an explicit non-normative perf note to the RFC stating that setAria's runtime is byte-identical to the current impl (the kebab-case regex + String() coercion already run at build/.setAria() time, never at render time) so Wave-4 does not re-litigate it. The regex-per-key cost is pre-existing and out of scope; the RFC must not silently widen it."
---

# Verdict: RFC-A-02 — perf lens

> You are an ADVERSARY. Your job is to KILL this RFC through the perf lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The mandate: protect the synchronous SSR hot path. No per-request allocation, no render/stream slowdown, no making the common case pay for a rare feature, any async strictly opt-in and off the sync path. I attacked every claim in the RFC's §11.2 line ("setters write the existing `attributes` bag; no async, no render-path change") against the real source.

- **Hot-path allocation — does it survive?** The render loop (`src/render/render.ts:218-228`) reads `tag.attributes` directly: `if (extraAttrs !== EMPTY_ATTRS) { for key of Object.keys(extraAttrs) ... }`. The new setters write into that *same* bag. The copy-on-write `EMPTY_ATTRS` guard (`tag.ts:143`, `:299`) means an element that never calls a setter keeps the shared frozen `EMPTY_ATTRS` and allocates nothing — so the common case (no ARIA) pays zero. An element that *did* call `addAttribute("role", …)` already allocated the bag; routing it through `setRole` is allocation-neutral. **No new per-request allocation. Attack fails.**

- **`setAria` runtime regression — does it survive?** RFC claims "impl unchanged at runtime; only the type narrows." Verified against `tag.ts:298-306`: the impl is `for ([key,value] of Object.entries(attrs)) { kebabKey = key.replace(/[A-Z]/g,…); attributes['aria-'+kebabKey] = String(value); }`. The new boolean state path (`{ checked: on }`) and `"mixed"` tristate both flow through the *existing* `String(value)` — `String(true)` → `"true"`, `String("mixed")` → `"mixed"`, no new branch, no new allocation. The kebab regex and `Object.entries` allocation are **pre-existing** and run at `.setAria()` build time, never in `renderImpl`. The type change is erased at runtime. **Byte-identical bytecode. Attack fails.**

- **`ariaDescribe` fix on the hot path — does it survive?** This was the most promising kill: the fix adds `attrs.attributes?.["role"]` and `["aria-label"]` lookups. But `ariaDescribeAlgebra` (`src/fold/algebras/aria-describe.ts:19`) is a `ParaAlgebra<string>` invoked via `paraView` — an explicit, opt-in accessibility-auditing fold, entirely disjoint from `render.ts`/`stream.ts`. It is never called during normal SSR. The two added optional-chain lookups are O(1) property reads on an object the fold already holds, and they execute only when an app deliberately runs the auditor. **Off the sync hot path by construction. Attack fails.**

- **`setTabindex` — does it survive?** `String(index)` allocates one short string per call, at build time, replacing the app's hand-written `"-1"` literal (which the engine interned anyway). Net wash, build-phase only. **Attack fails.**

- **The one real soft spot:** the RFC pseudocode says setters "write the existing `attributes` bag" but does **not** pin the implementation. The natural lazy implementation is `setRole(r) { return this.addAttribute("role", r); }`. That would route every call through `validateAttributeKey` (`tag.ts:142`) — a regex/allow-list check — on a *compile-time-fixed literal key* that can never be hostile. Tag construction is on the synchronous critical path (the recon §10 Track-D note already flags "~14.5KB/1000 divs paid per request" — construction cost is a live concern). Paying key-validation for `"role"`/`"tabindex"`/`"title"` on every styled element is a small but real, avoidable per-construction tax that the `setNonce` precedent (`tag.ts:157-163`, which writes the bag directly and skips validation) shows the codebase already knows to avoid. This is the only place the RFC could regress, and it does so only if implemented naively.

## Does it survive?

**survives-with-changes.** The hot path is structurally untouched: zero new render-time work, zero new common-case allocation, the only behavior fix is an opt-in fold off the sync path, and `setAria` is runtime-identical. The lens cannot manufacture a credible kill — every allocation and coercion the RFC introduces is pre-existing or build-phase.

The two required changes are guardrails against a naive implementation, not corrections to the design:
1. Pin the setter bodies to direct-bag-write (mirroring `setNonce`), explicitly NOT delegating to `addAttribute`, to keep `validateAttributeKey` off the construction path for fixed literal keys.
2. Add a one-line perf note asserting `setAria` runtime invariance so Wave-4 doesn't re-open it.

## Guardrail check (§11.2 — sync SSR fast path)

Confirmed PASS, conditional on required change #1. No async introduced. No new code in `render.ts`/`stream.ts`. Common case (element with no ARIA) keeps `EMPTY_ATTRS`, allocates nothing, renders unchanged. The `ariaDescribe` change is confined to the opt-in `fold/algebras` auditing path. With the setters written direct-to-bag, the construction path adds nothing beyond a single property assignment per setter call — strictly cheaper than the `addAttribute` escape hatch it replaces.
