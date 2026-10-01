## V-L (fluent-html): fail

The fail comes from two ordering problems: `npm run focus` lists the 8.1.1 commits out of lockstep order, and the roadmap's Next Up names a dependency that lockstep rules out. Everything else checks out:

- every staged patch applies in order;
- both escape checks hold;
- the 18 sampled claims match v8-spec;
- `pm:lint` reports 0 errors;
- every link added by this run resolves;
- the commit touches nothing outside `project/pm/` and `60-rollout/`.

HEAD moved while I was verifying: commit 0fe2237 landed and was pushed. I re-ran every check against 0fe2237.

### Checks

1. **Patches apply.** Order: CHANGELOG 8.1.1, 8.2.0, 9.0.0; README 8.1.1, 4b, 8.2.0, 9.0.0. All 7 apply cleanly to a fresh archive of 0fe2237, with no offset or fuzz.
   - The headers come out in order: 9.0.0 at :5, 8.2.0 at :77, 8.1.1 at :190, 8.1.0 at :299.
   - 8.2.0's README patch also applies without 4b.
2. **Escapes hold.**
   - `grep -c u003c` gives 1 in `8.1.1/CHANGELOG.patch` and 1 in `8.1.1/README.patch` (the six bytes `<` in `od`), and 0 everywhere else.
   - After apply, `CHANGELOG.md` and `REFERENCE.md` hold 1 each.
   - The 9.0.0 `render(v, {})` line keeps `"\n"` as a literal backslash plus n, in the patch and in applied `CHANGELOG.md:63`.
3. **Claims.** I sampled 18; all match (table below).
4. **PM files.**
   - `lint.ts`: 0 errors, 1 warning that predates this run (`render-spine/todo.md:73`).
   - `hill.ts`: 3 uphill stories, 2 of them new, 0 stuck. `focus.ts` runs.
   - All 10 stories end with Write tests, then Check for bugs. The only hill marker is `<!-- hill: uphill -->`.
   - 40 links resolve. The 2 broken links (to `product/research/v6`) were already broken at d688c52.
   - Every cited staged path exists.
   - The `INDEX.md` and `decisions.md` diffs only add lines. The roadmap rewrite stays inside the four sections the guidelines allow (39 lines).
   - Added lines: 0 em or en dashes, 0 banned words, 0 absolute paths, 0 percentages.
5. **Repo scope.** The working tree is clean, and 0fe2237 touches 22 files, none outside the allowed paths.

### Claim sample (patch vs v8-spec)

| # | Claim | Spec section | Result |
|---|---|---|---|
| 1 | Asset 6140 B min / 2778 B gz, budget 6144 / 2816 | RFC-A-01 › Measured | match |
| 2 | onClickOutside 6/21 to 21/21; trap 10/18 to 18/18; nav 48/72 to 72/72; matrix 221/222 | RFC-A-01 › Measured | match |
| 3 | Script ran in 87 of 138 cells, now 0 of 132; 92,038 serializations across 14 repos | RFC-A-05 › Measured outcome | match |
| 4 | The two `js:` dev-throw messages | RFC-A-05 › 3 | verbatim |
| 5 | Page intact 12/32 to 32/32; 18,752/18,752; the REFERENCE:1402 text | RFC-A-06 › Measured; Docs | match (bare `<` corrected to `<`) |
| 6 | `Form()` throw text; README one-builder example; `f.input(name, type)` exists (`forms.ts:444`) | RFC-A-07 › 2, 3 | verbatim |
| 7 | Status rows 28/60 to 60/60 on 4 bundles; 221/226 | RFC-A-08 › Measured | match |
| 8 | No-request bag message; 27/27 and 64/64; 0 `swapOob` in 16 repos | RFC-B-01 › 3, 5 | verbatim |
| 9 | 342/342 runs (171 rows, 23 known); 0 flaky in 1,026; `htmx.js:1074-1075` / `:1046-1047` | RFC-A-03 › 2, 3 | match |
| 10 | 2195/2195; x0.938-x0.970, x1.072, x0.271; +0.67 ms, +211 KB; 31 of 108 (= 108 − 77) | RFC-A-09 › Public API; Performance | match |
| 11 | Required-select message; 34/34; gzs/stem-50 `:78`, `:47` | RFC-E-02 › 3; Upgrade reach | verbatim |
| 12 | `.setHref takes ...` sink text; 21/24; 14/14 repos over 570 sites | RFC-B-03 › 1; Measured | verbatim |
| 13 | E-07 non-array message; A-04 TS2684 inert text; B-04 bare-word and select messages, 8/10 | E-07 › 1; A-04; B-04 | verbatim |
| 14 | 9.0.0 migration order (K10 amended); prune-9 dry runs 0/339 and 6 edits; 89 nonce sites in 16/16; 7 of 10 bag shapes | Release bundling; K10; C-03 | match |

### Issues

**Major**
- **Priority inversion in `todo.md`.** `focus.ts` sorts by priority and ignores `depends_on` notes. So `focus -a` puts the [P0] RFC-A-05 and RFC-A-06 tasks (commits 2 and 3) above RFC-A-03 (commit 1). It also puts "apply staged 8.1.1" and "tag 8.1.1" above the [P2] C-04 and C-67 tasks they depend on. 8.2.0, 4b and G3 have the same problem. Fix: use [P1] for every non-decision task in a release story.
- **Wrong dependency in roadmap Next Up.** The first line says plugin 4.2.0 and extractor main "build on" 8.1.1. Lockstep §2 step 2 and K6 make both independent, and the very next roadmap line says so.

**Minor**
- **Docs lines in tasks.** They name CHANGELOG entry types the patches don't contain, for A-05, A-03, B-01, C-67, B-02, B-03 and E-04.
- **RFC ids in staged headings.** 29 headings keep `(RFC-…)`, although the draft and manifest correction 4 say to drop them. RFC-B-01, B-03 and B-04 also clash with the v6 RFC ids already in `CHANGELOG.md:427-490`.
- **Roadmap content.** It keeps the derived count "114/114 runs red". Just Shipped leaves out this session's work.
- **prd No-Gos.** It lists every deferred, cut and parked ID instead of linking `40-synthesis/roadmap.md`.
- **8.1.1 story heading.** It promises "a lockfile bump", but the 8.1.1 entry and K2 require an asset rebuild.
- **Push.** 0fe2237 was pushed (origin/main reflog: "update by push", 21:06:30). That breaks §0 "never push", but the user's global CLAUDE.md says "commit and push on main". The commit only touches allowed paths, so nothing needs reverting; §0 and the global rule need reconciling before lanes T and P commit.
