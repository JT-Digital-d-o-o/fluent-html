# Roadmap

<!-- Session brain. Read first, update last. Intent only — no task lists,
     no counts, no dated phase plans. ~40 lines; prune as you go. -->

## Current Focus

The v8.2.0 review rollout ([review-v8.2/](review-v8.2/todo.md)): research Waves 0-4 and rollout
prep are done (contracts in [v8-spec.md](../research/v8.2.0/40-synthesis/v8-spec.md), order in
[lockstep.md](../research/v8.2.0/40-synthesis/lockstep.md)). Implementation runs one release at a
time in lockstep order, with each release's CHANGELOG and README hunks staged and applied only
when that release ships. First up is fluent-html 8.1.1: the htmx URL sinks, JSON script bodies,
checkbox binding and behaviors runtime fixes, with the htmx grammar oracle in lib CI.

## Next Up

- fluent-html 8.1.1: plugin 4.2.0, extractor main and the template build on it, and K1 holds 8.2.0's RFC-B-03 until its dev throw ships
- Plugin 4.2.0 and extractor main (RFC-D-01 text), independent of 8.1.1; guidelines G1 and the 4b CLAUDE.md commit are gated on both
- Guidelines G1 and the 4b commit land inside the projects-template 3.8.0 window; the template re-vendors after the last hunk
- fluent-html 8.2.0, then plugin 4.3.0 (lib-first: it imports `IfNotEmpty` and reads the `size` row), then G2 and 7b, then projects-template 3.9.0
- fluent-html 9.0.0 and G3, gated on the decisions below
- llm-styling leftovers: the demos leak-site autofix and the canonical codemod over ttl/rideshare/mngmt, gated on those repos' bumps

## Blocked on a Decision

- 9.0.0 preconditions: RFC-C-02's guess top-up to 20 leak-free runs per condition (K11, also decides `ForEachElse`), open call 1 (`nonce?: never` tombstone), open call 2 (the chunking bag) and open call 5 (`typesVersions` for 4 or 10 subpaths): the user
- Process docs and memory: the ALGORITHM §5.10 rewording (open call 3), the guardrail 5 rewording (open call 4) and the RFC-C-04 user-memory edits: the user
- Behaviors asset size: the L-260 call (the ADR-12 amendment in decisions.md) before any runtime byte after RFC-A-01, which leaves the asset at 6140 of 6144 B min
- Template CI: set PRIVATE_REPOS_TOKEN (114/114 runs red at install); every template-side check of the rollout runs locally only until then
- CI budget for the multi-engine acceptance rows: WebKit+Firefox per-PR, or Chromium per-PR + nightly full sweep (lean: nightly). Harness ready: `ACCEPT_ENGINES=all`.
- `.tl()` sink go/no-go — deferred until canonical-names + object-variants soak
  (uphill in [llm-styling/tl-sink/](llm-styling/tl-sink/todo.md))

## Just Shipped

- 2026-07-20 to 2026-07-31: behavior v4 designed (12 ADRs) and implemented as 6.4.0 (5.95KB runtime
  asset, Playwright matrix under strict CSP); the orthogonal-libs study (stay out, extend `.behavior()`);
  vocab-generator complete (6.6.0, 6.7.0, eslint-plugin 2.0.0). Detail in git and
  [research/behavior-v4](../research/behavior-v4/).
