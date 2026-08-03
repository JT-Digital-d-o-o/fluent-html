# Roadmap

<!-- Session brain. Read first, update last. Intent only — no task lists,
     no counts, no dated phase plans. ~40 lines; prune as you go. -->

## Current Focus

Behavior v4 release train: the library side (W1–W4, W7) is implemented on the v6.3.0
branch as **6.4.0** — publish it, then land the lockstep repos: template glue + fork
deletion (W5/W8, projects-template), eslint rules (W6), app migrations (W9).

## Next Up

- **Publish 6.4.0 + template PR same day** — the fork deletion is the ratchet (W10)
- W5 glue: asset route + BehaviorRuntimeScript + X-Fluent-Behaviors hardening +
  the row-30 dev render-throw (lives with the template)
- W6 eslint: raw `data-behavior*` ban, behavior-client-purity, framework-only imports
- **llm-styling (P8)**: vocab-generator (6.6.0/6.7.0), escape-hatch (6.8.0),
  canonical-names + object-variants (7.0.0-unreleased, incl. codemod + fixture
  suite) are all DONE — next is shipping the 7.0.0 breaking release, then the
  deferred P2s unblock (demos leak-site autofix, codemod over ttl/rideshare/mngmt
  when those repos bump). tl-sink stays decision-gated until 7.0.0 soaks.
  Scope + decision record: [llm-styling/](llm-styling/)
- Publish note: nothing since 6.4.0 is on npm (registry still pre-v6) and
  `main..v6.6.0` holds the whole train — plugin 2.0.0 must NOT publish before
  fluent-html 6.7.0 (peer dep)

## Blocked on a Decision

- CI budget for W4 multi-engine rows: WebKit+Firefox per-PR, or Chromium per-PR +
  nightly full sweep (lean: nightly). Harness ready: `ACCEPT_ENGINES=all`.
- ADR-12 size estimate vs measured: gate now 6KB/2.75KB (see decisions.md entry
  2026-07-21) — bless as amendment or fund further golf
- `.tl()` sink go/no-go — deferred until canonical-names + object-variants soak
  (uphill in [llm-styling/tl-sink/](llm-styling/tl-sink/todo.md))

## Just Shipped

- 2026-07-31 — vocab-generator complete (llm-styling P8, first sub-scope): 6.6.0
  pinned validity oracle + coverage watch; 6.7.0 values/doc-enriched rows + types
  emitter (`gen:vocab`, 54 generated unions, seams split, CI --check); eslint-plugin
  2.0.0 derives fix tables from class-vocab at rule-load (hand table deleted)

- 2026-07-21 — behavior v4 W1–W4+W7 implemented (6.4.0): data-behavior-* emission,
  5.95KB runtime asset, framework-only registry + buildBehaviorRuntime, 68-row
  Playwright matrix green on Chromium under real strict CSP (htmx 4.0.0-beta5),
  README/guidelines rewritten; `.hxOn` + 5 verbs deleted, drawer/onEscape/
  onClickOutside/resetOnSuccess added (roadmap #52/#53 closed)

- 2026-07-20 — behavior v4 design locked: 14-agent research → 3 competing designs →
  adversarial attack → synthesis; 12 ADRs + framework-only-extension and glue-in-template
  amendments. See [project/research/behavior-v4/](../research/behavior-v4/)
- 2026-07-20 — orthogonal-libs study (Alpine/hyperscript/Datastar): stay out, extend
  `.behavior()` instead
