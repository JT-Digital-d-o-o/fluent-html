# fluent-html v6 — Research Initiative

A multi-wave, agent-orchestrated research effort to design **fluent-html v6**: the version that makes full-stack TypeScript app development genuinely best-in-class.

**The algorithm is the spec:** [`ALGORITHM.md`](./ALGORITHM.md). Read it first.

---

## Why

fluent-html (currently **v5.11.0**) already serves our apps well. v6 is about closing the gap between "great HTML builder" and "the best full-stack SSR framework," driven by **evidence from how we actually write apps** — not opinion.

## The four tracks

| Track | Mission |
|-------|---------|
| **A — DX & API improvements** | Sharpen the existing surface. Fix sharp edges (e.g. the `disabled="true"` truthy bug), implement documented-but-missing methods (`.children()`), add the ergonomic helpers (`.aria()`/`.role()`/`.data()`) that apps reach for `addAttribute` to fake today. |
| **B — New full-stack APIs** | Build the net-new capabilities the app survey *demands*: a form system, modals, tables/pagination, an icon registry, layout primitives, variant tokens, and an async-rendering story. Every proposal is justified by repeated boilerplate found in shipped apps. |
| **C — Tailwind v4 support** | A complete plan to support Tailwind v4 across the library, the [tailwind-extractor](../../../fluent-html-tailwind-extractor), and the [eslint-plugin](../../../fluent-html-eslint-plugin) — including the existential extractor redesign (v4 removed `content.extract`). |
| **D — Internals: code & perf** | De-recurse the renderer (it stack-overflows at depth ~3500), add real backpressure streaming, cut per-request allocation, dedupe the render/stream copy-paste, and clean up `as any`/test gaps — without slowing the hot path. |

> **Cross-cutting — Guidelines & Adoption.** The run also rewrites `guidelines/web-development/**`. Two signals feed it: existing APIs that apps under-use because the guidelines under-teach them (e.g. `Match` at 18:1 vs `IfThen`), and every new API/pattern an RFC proposes. Output: `40-synthesis/guidelines-update.md` — a ready-to-apply patch set in the guidelines' house style (succinct, ✓/✗ do-don't, written for an LLM reader). Treating under-utilization as a guideline bug is a first-class part of the algorithm (guardrail §11.8).

## How it runs (waves)

```
Wave 0  Recon          4 agents   → 00-recon/        ✅ DONE
Wave 1  Discovery     ~44 agents  → 10-discovery/    atomic findings, loop-until-dry
Wave 2  Design        ~28 agents  → 20-design/       one RFC per cluster
Wave 3  Verification  ~18 agents  → 30-verification/ adversarial, kill-the-RFC
Wave 4  Synthesis      ~7 agents  → 40-synthesis/    v6-spec + roadmap + migration + guidelines
                       ─────────
                       ~101 agents, one markdown artifact each
```

Full mechanics — agent budget, folder layout, artifact schemas, scoring rubric, verification quorum, guardrails, and the `Workflow` script — are in [`ALGORITHM.md`](./ALGORITHM.md).

## Wave 0 — Recon (complete)

| Artifact | What it found |
|----------|---------------|
| [`00-recon/01-architecture.md`](./00-recon/01-architecture.md) | Layer map + public API inventory; 8 key gaps (missing `.children()`, boolean-setter bug, no DOCTYPE, render/stream divergence, no async rendering, …). |
| [`00-recon/02-app-patterns.md`](./00-recon/02-app-patterns.md) | 11 apps surveyed; top-10 missing-API signals ranked by frequency×pain; anti-patterns (raw-string `addClass`, `addAttribute` for aria/data, inline JS, `Raw()` SVGs). |
| [`00-recon/03-tailwind4.md`](./00-recon/03-tailwind4.md) | Confirms current code targets TW **v3**; severity-ranked v4 break list; migration surface (~6 logic files across 3 repos + docs). |
| [`00-recon/04-performance.md`](./00-recon/04-performance.md) | Render-pipeline walkthrough + live benchmark numbers; top-8 perf opportunities; measured *non*-opportunities to avoid. |

The recon findings are distilled into the **seed backlog** in [`ALGORITHM.md` §10](./ALGORITHM.md#10-seed-backlog-from-wave-0) — the concrete starting points for Wave 1.

## Folder map

```
v6/
├── ALGORITHM.md      ← the multi-wave algorithm (start here)
├── README.md         ← this file
├── templates/        ← finding / rfc / verdict / roadmap-entry schemas
├── 00-recon/         ← Wave 0 ✅
├── 10-discovery/     ← Wave 1 findings, by track
├── 20-design/        ← Wave 2 RFCs, by track
├── 30-verification/  ← Wave 3 verdicts
└── 40-synthesis/     ← Wave 4 v6-spec, roadmap, breaking-changes, guidelines-update
```

## Running the next wave

Wave 0 is done. To execute Waves 1–4, run the workflow described in [`ALGORITHM.md` §9](./ALGORITHM.md#9-orchestration--mapping-to-the-workflow-tool). It fans out finders per track (loop-until-dry), clusters, then pipelines design→verification, then synthesizes the roadmap. Each agent writes its artifact into the hierarchy above.

> Executing the full run spends ~97 more agents. Run it deliberately.
