# Product-Development Algorithms

Reusable, runnable orchestration specs for the highest-leverage phases of the
[pipeline](../pipeline.md). Each one turns a fuzzy phase ("understand the Job", "map the
landscape", "name the thing") into a repeatable procedure with inputs, steps, an output
layout, and a "done when" gate. They are the execution layer under the
[roadmap](../roadmap.md); the roadmap says *when* to run each, these say *how*.

Tool-agnostic: a single person can run any of them by hand. They are also written so an
agent orchestration (fan-out subagents, one file per unit of work) can run them directly.

| # | Algorithm | Feeds pipeline phase | Output |
|---|-----------|----------------------|--------|
| [01](./01-jtbd-intake.md) | **JTBD intake** | 1 · Innovation | A filled `vision.md`: the Job, in plain language, as the anchor for everything downstream |
| [02](./02-research-crawl.md) | **Multi-wave research + crawl** | 1→2 · Innovation to Validation | A synthesis mapping capability × context × competitors × market, and a prioritized list of bets |
| [03](./03-naming-seo-design.md) | **Naming → SEO sweep → design book** | 3→4 · Shaping to Development | A defensible name (findability-cleared) plus a brand/design book |

A full worked example of Algorithms 01 and 02 lives in the `renderbox-sdk` repo at
`project/product-research/2026-06-05/comply-redact/` (`product-vision.md` + `ALGORITHM.md`),
and of Algorithm 03 in that run's `07-final-remarks/07-ab-name-brainstorm-and-design-book/`.

---

## Shared run conventions

These apply to every algorithm here. They are what make the outputs comparable and cheap to
review.

1. **The Job is the anchor.** Nothing runs until Algorithm 01's `vision.md` is filled. Every
   later step reads it first and ties its findings back to the Job (does this help the
   progress the customer is hiring us to make, or remove an Anxiety/Habit that blocks the
   switch?), not to a feature list.
2. **One file per unit of work.** Each research agent, each competitor, each candidate name
   writes its own `.md`. The file is the deliverable. Do not funnel one big blob back to a
   caller. This keeps work parallelizable and independently reviewable.
3. **A plain-language summary is mandatory.** Every output opens with 3 to 6 jargon-free
   sentences a smart non-specialist can read. Define every term the first time.
4. **Be honest about limits.** "What we cannot do / where this is uncertain" is as valuable
   as what we can. Never imply a capability we lack or a claim we cannot defend.
5. **Cite primary sources.** Any external claim (regulation, competitor, market, a findability
   check) links its primary source. Capability claims cite the repo or asset they rest on.
6. **Synthesis is a separate step.** After a fan-out, a synthesis pass writes the
   cross-file digest (`00-synthesis.md`). Research units do not also synthesize.

## Scaling: match effort to stakes

| Stakes | Example | Fan-out per wave | Total artifacts |
|--------|---------|------------------|-----------------|
| **Low** | Internal tool, a single feature bet | 1 unit per wave | ~6 files |
| **Medium** | A new product line inside an existing brand | 2 to 4 units per wave | ~15 files |
| **High** | A new company / regulated product | 5 to 10 units per wave | 40+ files |

When you bound coverage (top-N competitors, one context source, no second naming round),
**say so in the synthesis**. Silent truncation reads as "we covered everything" when we did
not.

## Running these as an agent workflow

Each algorithm's waves map cleanly onto a fan-out orchestration: independent waves run in
parallel, dependent waves form a pipeline, and each unit of work is one subagent writing one
file. Keep the per-agent template (in each algorithm) as the subagent's output schema, and
run a synthesis agent per wave. Scale the fan-out to the stakes table above.
