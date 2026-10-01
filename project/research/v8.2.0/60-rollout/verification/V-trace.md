## Traceability check, v8.2.0 rollout prep: **fail**

All 25 curated items trace through. Each one has a PM task in every repo it ships to, a staged CHANGELOG entry wherever the manifest says one is needed, and a README hunk wherever the manifest marks a README row. Every "no README row" claim in the manifest also holds when checked against the docs.

The run still fails because two staged patches stop applying once the PM tasks run in order. The order data also has a cycle, and one named target of a curated RFC has no task.

### Traceability table

fl = fluent-html, tpl = projects-template. G1, G2, 4b, 7b and G3 tasks are in fluent-html's scope, and so is the extractor story.

| Item | Ships to (manifest) | PM tasks | Staged CHANGELOG | Staged README | Result |
|---|---|---|---|---|---|
| RFC-B-01 | fl 8.1.1, G1, 4b, tpl 3.8.0 | fl 8.1.1 commit 4; G1 template-gated task; 4b; tpl commit 6 (2 tasks) | fl 8.1.1 "Added: request-less bag"; tpl 3.8.0 "raw route into a swap verb" | none (no exported symbol; tpl docs teach no verbs, checked) | ok; G1 cycle (issue 3) |
| RFC-D-01 | plugin 4.2.0, extractor main, G1, 4b, tpl 3.8.0 | plugin 4.2.0 (5 tasks); fl extractor story; G1; 4b; tpl commit 5 | plugin 4.2.0 Changed; extractor Changed; tpl 3.8.0 (lint:fix and guidelines bullets) | plugin README rows and messages; extractor README :66, :82 | ok |
| RFC-A-01 | fl 8.1.1, tpl 3.8.0 | fl commit 6; tpl commit 4 | fl 8.1.1 Fixed; tpl 3.8.0 asset bullet | api_surface [] | ok |
| RFC-D-02 | tpl 3.8.0, G1, 4b | tpl commit 3 (4 tasks); G1; 4b | tpl 3.8.0 ".search settles" | none (checked) | ok; G1 cycle |
| RFC-A-02 | tpl 3.8.0 | tpl commit 8 (4 tasks) | tpl 3.8.0 templates/web | tpl templates/web CLAUDE.md and README | ok |
| RFC-C-01 | plugin 4.2.0, 4.3.0, re-sweep after 9.0.0, fl 4b, G1, tpl 3.8.0 | plugin 4.2.0 tasks plus 8.1.1 re-sweep, 4.3.0 re-sweep, 9.0.0 story; fl 4b README task; G1; tpl commit 5 | plugin 4.2.0 Fixed/Added/Changed/Packaging; rides E-08's 4.3.0 entry; tpl lint:fix bullet | plugin 4.2.0 README; fl 4b README | ok |
| RFC-A-03 | fl 8.1.1, G1, 4b, tpl 3.8.0 | fl K8 check and commit 1; G1; 4b; outside-lockstep (open call 3, annotations); tpl commits 2 and 4 | fl 8.1.1 Added and Errata; tpl "grammar check moved" | api_surface [] | ok |
| RFC-A-04 (Part A) | fl 8.2.0 | fl 8.2.0 traps | fl 8.2.0 Added | none (@internal; REFERENCE already teaches setColspan) | ok; Part B nowhere as work |
| C-67 | fl 8.1.1, G1, 4b | fl commit 7; G1; 4b | fl 8.1.1 Changed | fl REFERENCE:952 | ok |
| RFC-A-05 | fl 8.1.1, G1, tpl 3.8.0 | fl commit 2; G1; tpl commit 4 | fl 8.1.1 Security; tpl redirect hook | fl REFERENCE:1342, :1385 | ok |
| RFC-A-06 | fl 8.1.1, tpl 3.8.0 | fl commit 3; tpl commit 4 | fl Security; tpl JSON-LD | fl REFERENCE:1402 | ok |
| RFC-A-07 | fl 8.1.1, G1 | fl commit 5; G1 after the tag | fl 8.1.1 Fixed | fl README:167-170 | ok |
| RFC-A-08 | fl 8.1.1 | fl commit 2 | fl 8.1.1 Fixed | api_surface [] | ok |
| RFC-A-09 | fl 8.2.0, G2, tpl 3.9.0 | fl 8.2.0; G2; tpl 3.9.0 commit 1 (2 tasks) | fl 8.2.0 Added; tpl 3.9.0 | fl README and REFERENCE | **gap**: fluent-html/.ai copy (issue 4) |
| RFC-B-02 | fl 8.2.0 | fl 8.2.0 | fl Added and Type-safety | REFERENCE:385 | ok |
| RFC-B-03 | plugin 4.2.0, fl 8.2.0, G2, tpl 3.8.0 | plugin 4.2.0; fl 8.2.0; G2; tpl commit 7 | plugin Fixed; fl Type-safety; tpl assetUrl | plugin README :143; fl README:91 | ok |
| RFC-B-04 | fl 9.0.0, tpl 9.0.0 pass | fl 9.0.0; tpl dry run | fl 9.0.0 Changed and Removed | REFERENCE:28 | ok |
| RFC-C-02 | fl 9.0.0, G3, tpl pass | fl 9.0.0 with K11 and open call 5; G3; tpl dry run, re-vendor, branch | fl Removed, Added, Kept | REFERENCE import line and Repeat example | ok |
| RFC-C-03 | fl 9.0.0, tpl pass | fl 9.0.0 with open calls 1 and 2; tpl dry run and ledger | fl Removed and Added | none (0 nonce lines, checked) | ok |
| RFC-C-04 | fl 8.1.1, G1, 4b, tpl 3.8.0 | fl commit 5; G1; 4b; outside-lockstep; tpl commit 1 (6 tasks) | fl Changed; tpl packages/ui | tpl README:172 | ok; memory decision tracked twice (issue 6) |
| RFC-E-01 | fl 8.2.0, tpl 3.9.0 | fl 8.2.0 (2 tasks); tpl commit 2 (2 tasks) | fl Added; tpl FormGroup | fl REFERENCE getId | ok |
| RFC-E-02 | fl 8.2.0 | fl 8.2.0 | fl Added | none (checked) | ok |
| RFC-E-04 (modified) | fl 8.2.0, 9.0.0, tpl pass | fl 8.2.0; 9.0.0 tail; tpl dry run | fl Type-safety; 9.0.0 Changed | none (checked) | ok; record arm nowhere as work |
| RFC-E-07 | fl 8.2.0 and 9.0.0, plugin 4.3.0, G2, 7b, tpl 3.9.0 and pass | each repo and step covered | fl 8.2.0 Added, 9.0.0 Removed; plugin 4.3.0 Added; tpl 3.9.0 | fl README §6, REFERENCE, 9.0.0 REFERENCE:238; plugin row | ok |
| RFC-E-08 | fl 8.2.0, plugin 4.3.0, G2, 7b, tpl 3.9.0 | each covered | fl Added; plugin Added and Changed; tpl 3.9.0 | fl REFERENCE:1077; plugin rows | ok |

Deferred, cut and parked items appear only in the prd No-Gos sections and in notes. None has a task, a CHANGELOG entry or a README hunk. Every staged entry maps to one of the 25 curated items.

### What fails

1. **Blocker: the template 3.9.0 CHANGELOG patch.** It was generated with the 3.8.0 entries still under `## [Unreleased]`. Once 3.8.0 is cut, it fails, whether the cut follows the todo's wording or the repo's own convention.
2. **Blocker: the plugin 4.3.0 CHANGELOG patch.** It fails after the 4.2.0 task adds a release date to the 4.2.0 header. Forcing it with `-C0` puts the entry at line 147, the wrong place.
3. **Major: a dependency cycle between G1 and template 3.8.0.** G1's template-gated task waits for the template 3.8.0 release, and template commit 5 waits for all of G1. The template has no second re-vendor after commit 6, so as written 3.8.0 ships without G1's B-01, D-02 and C-04 lines. That also makes one claim in the staged 3.8.0 CHANGELOG false.
4. **Major: the RFC-A-09 guideline deletion in fluent-html's own `.ai/web-development/views.md` has no task.** Its RFC names that file in prose_deleted, and lockstep lists the copy as one that follows `guidelines:pull`. No story runs the pull, and the tracked copy still teaches the old compose rule, staticManifest and `Repeat`.
5. **Minor:** several PM tasks cite CHANGELOG section names that the staged patches don't use.
6. **Minor:** the C-04 user-memory decision is tracked in both fluent-html and the template.

### What passed

- No file outside `project/pm` or `60-rollout` was written.
- Added patch lines have no em dashes and no banned words.
- The PM files have no absolute paths.
- The PM lint shows 0 errors in all three scopes.
- Each repo's patches apply cleanly in release order.
- The template README patch applies when split the way its two tasks say.
