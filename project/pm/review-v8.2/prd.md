# v8.2.0 Review Rollout

The curated set of the fluent-html v8.2.0 review run, shipped one release at a time. Method:
[ALGORITHM.md](../../research/v8.2.0/ALGORITHM.md) and
[ALGORITHM-ROLLOUT.md](../../research/v8.2.0/ALGORITHM-ROLLOUT.md); scope:
[curation.md](../../research/v8.2.0/40-synthesis/curation.md) sections A, E and F; tasks:
[todo.md](todo.md).

## Problem

fluent-html 8.1.0 fails silently where its types and docs promise otherwise. The review run measured:

- **htmx sinks.** Without a CSP, attacker script ran in 87 of 138 browser cells through URL values fluent hands to htmx (RFC-A-05). JSON-typed script bodies kept the page intact in 12 of 32 payload and type pairs per engine (RFC-A-06). `hx-status` object configs worked in 28 of 60 status rows (RFC-A-08).
- **Forms and behaviors.** A valued checkbox bound by `Form<T>` lost its state in 12 of 12 round trips on 3 engines (RFC-A-07). `onClickOutside` dismissed only what was showing in 6 of 21 cases (RFC-A-01). The taught `setClosedby("any")` leaves a dialog open on a Safari 27 backdrop click, and 0 of 20 fleet files pair it with a fallback (C-67).
- **Contracts.** The acceptance matrix runs in no workflow, no CI job executes htmx against the typed grammar, and two CHANGELOG causes are false: the `<hx-partial>` bytes the 8.0.0 entry says htmx never processes swap on 4 of 4 bundles (RFC-A-03). Swap verbs and branded sinks name the fix on line 1 in 0 of 19 and 0 of 24 raw probes (RFC-B-01, RFC-B-03). htmx unions reject working htmx 4 modifiers: 5 of 24 pure-prior statements compile and work (RFC-B-02).
- **Two ways to do one thing.** The nonce options bag has 0 call sites in 58 repos against 89 for the `*WithNonce` pair (RFC-C-03); two dead second spellings (`Form().multipart()`, `Repeat`) and four duplicate root exports (RFC-C-02); a bare selector word means `#id` in `Partial` and a tag in `hx()`, and on 2 of 2 bundles the `hx()` miss swaps the trigger itself (RFC-B-04).
- **Overrides and hand-rolled helpers.** Append-only emission leaves 108 measured dead class pairs, where a later override never wins (RFC-A-09). Read-dependent `FormGroup` wrappers associate label and control at 0 of 69 canonical sites (RFC-E-01); the fleet hand-writes 423 equal `.w(x).h(x)` pairs (RFC-E-08) and 352 restated list guards (RFC-E-07); `f.select` option values are unchecked, so competify shipped a stale filter value in e7448d0 (RFC-E-04); a required select can submit a value nobody chose, as 2 live gzs/stem-50 selects do (RFC-E-02).
- **Docs that run ahead of or behind the code.** The extractor's unresolved-call error prescribes `staticManifest`, which clears 0 of 11 failing calls (RFC-D-01); guideline lines teach shapes that fail on the pinned release (RFC-A-07's taught checkbox shape: 0 of 16 correct on 8.1.0).

## Appetite

Fixed by curation, not by time: the curated RFCs and the C-67 teaching fix, nothing else. In this
repo that is three releases (8.1.1 patch with no public shape change, 8.2.0 additive, 9.0.0 one
migration), the extractor's RFC-D-01 text on its `main`, guideline waves G1 to G3 and the two
fluent-html `CLAUDE.md` commits (lockstep steps 4b and 7b). Plugin 4.2.0 and 4.3.0 are tracked in
`fluent-html-eslint-plugin/project/pm/`; projects-template 3.8.0, 3.9.0 and its 9.0.0 pass in
`projects-template/project/pm/`. A new finding goes to the next review run's seen set, not here.

## Solution

Final contracts: [v8-spec.md](../../research/v8.2.0/40-synthesis/v8-spec.md) (verdict changes and
curation notes folded). Order and gates: [lockstep.md](../../research/v8.2.0/40-synthesis/lockstep.md)
section 2 and its Track E addendum (K1 to K15). One user story per release step this repo owns:

| Step | Ships | Gate |
|---|---|---|
| 1 | fluent-html 8.1.1: A-03, A-05 + A-08, A-06, B-01 lib half + A-05 dev checks, A-07 + C-04 comment, A-01 with the version bump, C-67 docs | K8, K9; lib CI green with the `grammar` job; official bench re-run |
| 3 | fluent-html-tailwind-extractor `main` (3.0.0 untagged): D-01 text | independent (K6) |
| 4 | guidelines G1: A-03, A-05, A-07, B-01, C-01, C-04, C-67, D-01, D-02 | per line: 8.1.1, its tag for A-07, plugin 4.2.0 and extractor main, template 3.8.0 (K5, K7) |
| 4b | fluent-html `CLAUDE.md` and `README.md` commit | the gates of each G1 twin |
| 6 | fluent-html 8.2.0: B-02, B-03 lib half, A-04, A-09, E-01, one `forms.ts` pass (E-04, E-02, E-01's read swap), E-07, E-08 | K1, K12, K13; both test lists; bench re-run |
| 7 | guidelines G2: B-03, A-09, E-07, E-08 | the 8.2.0 tag and the plugin 4.3.0 publish (K7 amended) |
| 7b | fluent-html `CLAUDE.md` commit: E-07, E-08 | the gates of G2 |
| 9 | fluent-html 9.0.0: B-04, C-02, C-03, the E-04 and E-07 tails; one migration section | K10, K11; `test/prune-gate.test.ts` green |
| 10 | guidelines G3: C-02 | the 9.0.0 tag |

The docs never run ahead of the code: each release's CHANGELOG entry and README hunks are staged under
`fluent-html/project/research/v8.2.0/60-rollout/staged/<repo>/<release>/` and applied by the story
that ships that release. Guideline and `CLAUDE.md` hunks apply by quoted text from
[guidelines-update.md](../../research/v8.2.0/40-synthesis/guidelines-update.md); codemods follow
[codemods.md](../../research/v8.2.0/40-synthesis/codemods.md); changelog wording comes from
[changelog-draft.md](../../research/v8.2.0/40-synthesis/changelog-draft.md). The class-merge
supersession is recorded in [decisions.md](../decisions.md).

## Rabbit Holes

- **Line numbers drift.** Anchors are the HEAD lines at rollout prep, and each release moves lines for the next: RFC-D-01's 4b deletions move RFC-E-07's and RFC-E-08's `CLAUDE.md` lines up two. Apply every hunk by quoted text.
- **Shared files.** `fluent-html/src/render/serialize.ts` takes A-05, A-08 and A-06 in 8.1.1, A-09 and E-02 in 8.2.0, B-04's casts in 9.0.0: run the security, status and dev-check pins together after each. `fluent-html/src/elements/forms.ts` is one edit pass per release (A-07 + C-04; E-04 + E-02 + E-01, K13; C-02 + the E-04 tail).
- **The grammar gate.** RFC-A-03's `coverage.test.mjs` fails on any unclaimed declaration in `htmx.d.ts`, `patterns.d.ts` or `core/htmx-methods.d.ts`: B-02, B-03 and B-04 claim theirs in the same commit.
- **Behaviors asset headroom.** RFC-A-01 leaves the asset at 6140 of 6144 B min; C-67 adds 0 runtime bytes. Any further runtime byte waits on the L-260 call.
- **Generated files.** Whichever of RFC-A-09 and RFC-E-08 lands second re-runs `gen:vocab` (K12); generated tables are never hand-edited.
- **Test lists.** `fluent-html/package.json:65-66` names every test file in `test` and `test:coverage`; a new test file missing from either never runs in CI.
- **Re-measures.** RFC-E-01's folded JSDoc, RFC-E-04's `forms.d.ts` size and authoring probe, RFC-E-08's brand diagnostics (lockstep blocker 11) are measured again at implementation, not assumed.

## No-Gos

- **No code or docs ahead of their release.** No CHANGELOG or README edit on `main` before the story that ships it; no guideline line before its gate (K7); no edit to the user's memory without the user (RFC-C-04).
- **No runtime `closedby` shim** in the behaviors runtime (C-67 keeps guardrail §5.10).
- **No re-litigating curation.** What ships is fixed by [curation.md](../../research/v8.2.0/40-synthesis/curation.md) sections A, E and F.
- **Deferred, cut and parked items** stay in the seen set for the next run: [roadmap.md](../../research/v8.2.0/40-synthesis/roadmap.md).
