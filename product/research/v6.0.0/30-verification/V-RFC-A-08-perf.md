---
rfc: RFC-A-08
lens: perf
verdict: survives-with-changes
confidence: 0.82
killer_objection: null
required_changes:
  - "escapeJs: replace the 7-stage .replace() chain with a single charCode/codePoint scan (one allocation, one pass), mirroring escapeHtml in src/render/escape.ts. The current chain allocates ~6 intermediate strings and runs 7 full regex passes per call. Although off the render hot path (build-time only, clipboard-only), the repo's own perf recon (04-performance) explicitly bans regex-prefilter escaping in favor of charCode scans — the RFC's chain reintroduces exactly that anti-pattern in new code."
  - "State explicitly in the Guardrail check §11.2 that escapeJs runs at construction time (inside the behavior renderer / .hxOn body), NOT inside renderImpl's attribute loop (src/render/render.ts:218-228) — the render path only HTML-escapes the already-built string via escapeAttr. This is the load-bearing perf claim and must be asserted, not implied."
---

# Verdict: RFC-A-08 — perf lens

> Adversary brief: protect the synchronous SSR hot path. Reject if this adds per-request allocation, slows render/stream, or makes the common case pay for a rare feature.

## Attack

I tried to kill this on three perf vectors. Two fail to land; one lands as a required change, not a killer.

- **Vector 1 — per-request render-path allocation (the one that would kill it).** The claim "identical cost profile to `.behavior()`, render path unchanged" (RFC §11.2) had to be verified against the real loop, not asserted. `renderImpl` (`src/render/render.ts:218-228`) iterates `tag.attributes` with `Object.keys` + per-key `escapeAttr(String(value))`. `.hxOn` and the two new behaviors write into that **same** `attributes` map (`htmx-on-methods.ts` mirrors `behavior-methods.ts:90-101` byte-for-byte: `EMPTY_ATTRS` copy-on-write, `;`-concat). So the render path sees one more entry in a map it already walks — **no new branch, no new data structure, no new per-tag cost**. Critically, a tag that does *not* call `.hxOn` keeps `attributes === EMPTY_ATTRS` and stays on the fast skip path (`render.ts:219`). The common case does **not** pay for this rare feature. Vector 1 **does not land**.

- **Vector 2 — `escapeJs` on the hot path.** This is where an RFC like this usually dies: an expanded escaper that runs per-render. It does not. `escapeJs` is invoked **at construction time**, inside the behavior renderer (`behavior-methods.ts:61`, the `clipboard` case) — once, when `.behavior("clipboard")` is called while building the tag. The render loop never calls it; it calls `escapeAttr` on the already-finished string. So the 7-stage chain executes once per clipboard-behavior construction, on an opt-in, rare feature, fully off the synchronous render hot path. Vector 2 **does not land as a killer**.

- **Vector 3 — the expanded `escapeJs` is a known-banned pattern (this lands, as a change).** The replacement (`RFC §3`) is a 7-link `.replace(/regex/g, …)` chain. Each `.replace` does a full string scan and allocates a fresh intermediate string: ~6 throwaway allocations and 7 regex passes per call. The repo's own Wave-0 perf recon (`ALGORITHM.md §10`, Track D: *"regex-prefilter escaping slower than charCode scan"* — listed under **MEASURED NON-opportunities, do not chase**) and the existing `escapeHtml` (`src/render/escape.ts`, single-pass charCode scan with a no-escape fast path) establish the house standard: **escapers are charCode scans, not regex chains.** The RFC introduces new escaping code that violates the codebase's measured perf doctrine. It is build-time and rare, so it is not a hot-path killer — but it is gratuitously slower than the established idiom and inconsistent with `escapeHtml` right next to it. A single codePoint scan handles `\ ' \n \r U+2028 U+2029 <` in one pass with one allocation and a fast-return when nothing matches (the common clipboard value escapes nothing). This is a correctness-neutral, strictly-faster rewrite that also satisfies guardrail §11.6 (consistency).

## Does it survive?

**survives-with-changes.** The synchronous SSR hot path is genuinely untouched: `.hxOn` and the new behaviors land in the pre-existing `attributes` map that `renderImpl` already walks, the `EMPTY_ATTRS` fast-skip protects every tag that doesn't opt in, and the expanded `escapeJs` runs at build time on a rare path — never inside the render/stream loop. There is no per-request allocation regression on the common case and no async anywhere near the sync path. The only defect is a build-time escaper written in a style the repo explicitly measured as slower; that folds back as a required change, not a rejection.

Required changes (exact, fold into RFC §3 and §11.2):

1. **Rewrite `escapeJs` as a single charCode/codePoint scan** with a no-match fast-return, in the shape of `escapeHtml` (`src/render/escape.ts`). One pass, one allocation. Same output set (`\\ \' \n \r     \x3C`). Removes the 7-regex / 6-intermediate-allocation chain and aligns with the codebase's measured anti-regex-escaper doctrine.
2. **Tighten §11.2 wording** to assert, not imply, that `escapeJs`/`.hxOn`/behavior expansion is **construction-time** and that `renderImpl` (`render.ts:218-228`) only HTML-escapes the finished attribute string. This is the claim the whole perf argument rests on; it should be explicit.

Neither change alters the API surface, types, or examples.

## Guardrail check (perf owns §11.2)

- **§11.2 SSR-only, synchronous render path stays fast:** **PASS (with change 1).** Verified against `src/render/render.ts:218-228`: new attributes flow through the existing `Object.keys`/`escapeAttr` loop with no added branch; `EMPTY_ATTRS` fast-skip (`render.ts:219`) keeps non-opt-in tags on the fast path. No async introduced; nothing touches the sync hot path. `escapeJs` is build-time only. The sole perf nit (regex-chain escaper) is off the hot path and resolved by change 1.
- **Common-case-pays-for-rare-feature test:** **PASS.** A tag that never calls `.hxOn`/`.behavior` allocates nothing new and renders identically. The rare feature is fully opt-in.
- **Allocation:** **PASS.** `.hxOn` reuses the same copy-on-write of `EMPTY_ATTRS` already paid by `addAttribute`/`.behavior`; it adds no allocation a `.behavior()` call wouldn't.
