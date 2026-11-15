# From scratch: fluent-html redesigned for Claude Code

## Problem

If fluent-html were designed today with Claude Code as its primary user
([decision](../../../../projects-template/project/pm/decisions.md), 15. 11. 26), would it look like
this? The question is cheap to ask now and expensive later.

- **What it costs Claude Code today.** The radical report counted 690 greps into
  `node_modules/fluent-html/dist` in 14 sessions, and 11 to 20 guessed methods that do not exist per
  census slice, each a median three-turn fix loop
  ([R03](../../../../projects-template/project/pm/framework-ideation/radical-report.md)).
- **What a new surface already failed to buy.** The language track's FHX (TSX-shaped, compiled to
  fluent-html) wrote its screens in 8.1% fewer turns, against the 25% required
  ([verdict](../../../../projects-template/project/research/stack-examination/runs/2026-10-04/60-language/verdict.md)).
  A redesign has to say where the rest of the cost lives.
- **What fluent-html gets right.** Escaping by default, `ForEach` over `.map` (644 to 0), typed
  Tailwind with a closed palette, htmx verbs with 0 id mismatches at 293 sites.

## Appetite

Two days, one round, then a verdict. Quick rejection is a good outcome.

## Solution

One registered round: diverge, screen, a bake-off on runnable prototypes, a verdict.

- **Diverge.** Six designs, one lens each: Claude Code's training prior, token economy, a semantic
  layer, render performance, security by construction, and the case for keeping fluent-html.
  Each writes the same three reference screens.
- **Screen.** Every design against the prior verdicts and its own claims; at most three go on.
- **Bake-off.** Each survivor becomes a minimal runnable prototype with an API reference no longer
  than the control's. Current fluent-html is the control. Measured: headless Claude Code sessions
  building two screens (turns, output tokens, cost, first-compile), render throughput on one page,
  an XSS fixture set, and html-validate on the output.
- **Verdict.** Per design: go (a PRD for the rewrite), harvest (named ideas into fluent-html's own
  releases), or drop.

**Kills, registered before any run.** A design goes on only if all hold:

| # | Kill |
|---|---|
| K1 | Claude Code writes the screens in at least 25% fewer turns or output tokens than the control, beyond the spread between two runs |
| K2 | Render throughput at least 0.9 times fluent-html 8 on the bench page |
| K3 | Zero escapes in the XSS fixture set |
| K4 | No more html-validate errors than the control |
| K5 | First-compile success no worse than the control |

**Price.** At most 8 headless Claude Code sessions on Opus 5.5 (three designs and the control, two
runs each), each capped at $5: at most $40.

## Rabbit Holes

- A new file format or syntax with its own compiler. FHX measured that.
- Prototypes that grow into products. A prototype renders the bench page and the two screens, nothing more.
- Judging by taste. The kills decide.

## No-Gos

- No change to fluent-html's source, releases or the template from this scope. Its output is a verdict
  and, on go, a PRD.
- No trial condition that loads our `CLAUDE.md` or guidelines; arms get only their own API reference.
