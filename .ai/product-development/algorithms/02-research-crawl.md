# Algorithm 02: Multi-Wave Research + Crawl

Map the whole landscape a bet lives in, in dependency-ordered waves, so you enter Validation
knowing what you can build, what the world requires, who you displace, and which bets are
worth testing first. Generalized from a 40-agent worked run (see the `renderbox-sdk` repo at
`project/product-research/2026-06-05/comply-redact/ALGORITHM.md`).

- **Input:** a filled `vision.md` from [Algorithm 01](./01-jtbd-intake.md). **Nothing runs
  until it is filled.**
- **Output:** one `.md` per research unit, a `00-synthesis.md` per wave, and a final product
  definition + prioritized build backlog.
- **Done when:** every requirement/need has a capability rating and a gap noted, every
  competitor (including non-consumption) has a displacement play, and the synthesis names the
  top 3 bets to validate next, each tied to the Job.

---

## Wave dependency graph

```
Wave 1  Grounding        ─┐
Wave 2  Context crawl    ─┤  (1, 2, 3 independent, run together)
Wave 3  Competitor crawl ─┘
                          ▼
Wave 4  Juxtaposition   (reads 1 + 2 + 3 + vision)
Wave 5  Market & buyer  (reads vision + 3; may run alongside 4)
                          ▼
Wave 6  Synthesis & product definition (reads everything)
```

## The waves

| Wave | Goal | Reads | Writes to |
|------|------|-------|-----------|
| **1 · Grounding** | Establish ground truth of *your own* capability or asset, in plain language: what you can actually do, and the honest limits. For a tech product, what the engine does; for a service, what you can deliver. | your repos, assets, prior art | `01-grounding/` |
| **2 · Context crawl** | Crawl the external constraints bearing on the Job: regulation, standards, platform policies, technical or physical limits. **Web research; cite primary sources.** | seed source list | `02-context/` |
| **3 · Competitor crawl** | One unit per competitor or cluster. Capture features, pricing, deployment, the moat check (does anyone offer what would be our edge?), positioning, and how we displace them. Include DIY / non-consumption as a competitor. | `vision.md` §6, §7 | `03-competitors/` |
| **4 · Juxtaposition** | The core deliverable: map each requirement/need → capability → **gap**. Rate each candidate solution feasible / partial / not-possible / blocked, with the reason. Produce a build backlog of the highest-value gaps (effort × unlock). | Waves 1+2+3 + vision | `04-juxtaposition/` |
| **5 · Market & buyer** | Who buys, how it is sized, priced, and sold. JTBD per buyer segment and their Four Forces. **Web research; cite sources.** | vision + Wave 3 | `05-market-buyer/` |
| **6 · Synthesis** | Turn all of it into decisions: product definition v1 (scope, MVP, in/out), positioning, roadmap, and a plain-language briefing pack. Reads everything. | all waves | `06-synthesis/` |

## Cross-cutting rules (every unit)

1. **Read first:** `vision.md`, then this wave's row, then your assigned sources.
2. **Plain-language summary is mandatory** (3 to 6 sentences, no jargon).
3. **Be honest about limits.** Never imply a capability we lack or a claim we cannot defend.
4. **Capability claims cite repos/assets; external claims cite primary-source URLs.**
5. **Tie back to the Job.** End with what the finding means for the Job in `vision.md`.
6. **One file per unit**, using the template below.

### Per-unit file template

```markdown
# <ID>: <Title>
_Wave <n> · reads: <inputs> · <date>_

## Plain-language summary
3 to 6 sentences, no jargon. What did you find and why does it matter?

## Findings
The detailed research.

## What this means for <the Job>
Implications for the Job in vision.md. Capability units: rate the relevant hunch →
possible / possible-with-work / not-possible / blocked, with the reason.

## Open questions / unknowns
What we still don't know; what needs a human decision.

## Sources
Primary sources with URLs (required for context, competitor, and market waves).
```

## Output directory layout

```
<run>/
├── vision.md            ← Algorithm 01 output (the anchor)
├── ALGORITHM.md         ← this spec, copied and scaled to the run
├── 01-grounding/        ← Wave 1 units + 00-synthesis.md
├── 02-context/          ← Wave 2 units + 00-synthesis.md
├── 03-competitors/      ← Wave 3 units + 00-synthesis.md
├── 04-juxtaposition/    ← Wave 4 units + 00-synthesis.md
├── 05-market-buyer/     ← Wave 5 units + 00-synthesis.md
└── 06-synthesis/        ← Wave 6 (product definition, positioning, roadmap, briefing)
```

## Tracking

| Wave | Units | Folder | Status |
|------|:--:|--------|:--:|
| 1 · Grounding | `_` | `01-grounding/` | [ ] |
| 2 · Context crawl | `_` | `02-context/` | [ ] |
| 3 · Competitor crawl | `_` | `03-competitors/` | [ ] |
| 4 · Juxtaposition | `_` | `04-juxtaposition/` | [ ] |
| 5 · Market & buyer | `_` | `05-market-buyer/` | [ ] |
| 6 · Synthesis | `_` | `06-synthesis/` | [ ] |

Scale unit counts to the stakes table in the [algorithms README](./README.md).

## Nudges

- **DO** run Waves 1, 2, 3 in parallel; they are independent. Waves 4 and 5 need the first
  three. Do not serialize what can fan out.
- **DO** treat non-consumption as a first-class competitor in Wave 3. The customer doing
  nothing is usually the real rival (per `vision.md` §7).
- **DON'T** let grounding (Wave 1) drift into feature design. It states ground truth and
  limits, not what to build. What to build is Wave 4's rating against the Job.
- **DON'T** ship the synthesis without the top-3 bets and their kill criteria. Research that
  ends without a prioritized "test this next" is a report, not a decision.
- **DON'T** skip the plain-language summary because "everyone here knows this." The synthesis
  and briefing exist so a non-specialist stakeholder can act on it.
