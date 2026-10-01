---
id: _clusters
wave: 1.5
role: cluster-barrier
run: fluent-html v8.2.0 review
date: 2026-10-01
findings_in: 194   # A 45, B 47, C 50, D 42, G 10 (round 1: 169, reseed: 25)
findings_clustered: 194
findings_dropped: 0
clusters: 96
lanes: { 8.1.x: 44, 8.2.0: 34, 9.0.0: 12, parked: 2, decision-gated: 4 }
high_impact: 20
score: "impact x pain x reach / effort (S1 M2 L3 XL5), cluster max of members; ties: enforcement layer, then additive, then fewer repos"
truncation: none
---

# Wave 1.5 · Clusters

## Summary

- 194 findings in, 194 clustered, 0 dropped: every finding carries a number or `file:line` measure, the critic reproduced 9/9 spot-checks, and every re-raise of a ledger row names new evidence (checks in the drop ledger below).
- 96 RFC-sized clusters: 8.1.x 44, 8.2.0 34, 9.0.0 12, parked 2, decision-gated 4 (guardrails 4, 5, 7, 10). 20 are high-impact (impact 3).
- Top of the ranking: the raw-route verb error (C-01, the scorecard's top leverage item, 27), the nonexistent staticManifest remedy in every vendored CLAUDE.md (C-02), the behaviors runtime opener and WebKit focus fixes (C-03), the htmx 4.0.0 `.search` race (C-04), and templates/web shipping hx-* with no htmx (C-05).
- The decided class merger (C-36) and the 9.0.0 prune (C-32) score 9 despite impact 3 because both are L effort.
- Overflow promoted: 1 line (`overflow:B-reseed`, `reswap(HxSwapStyle | string)`) into C-44.

## Barrier decisions on conflicting measures (critic §5)

| Conflict | Decision |
|---|---|
| Losing-override reach: F-A-201 59 sites / 7 repos vs F-A-301 97 sites / 11 repos | C-36 carries F-A-301 (presets and component bases resolved, 108/108 confirmed against each repo's compiled CSS); F-A-201 is its same-root same-property subset. |
| Guideline compile sweep: F-C-208 34/163, F-C-406 5/127, F-G-101 24 lines / 203 blocks | C-73 pins F-G-101's harness (template scaffold, ✓/✗ semantics, README and lib CLAUDE.md included); the other two are recorded as its inputs. |
| Setter casing: denominators 146 / 149 / 158, heals 20 / 22 / 33; lanes parked vs 9.0.0 | C-81 parked on the 158-setter runtime map (F-C-307); the one-pass lint C-47 takes the measured cost. |
| Raw route into a verb: 8.1.x (F-B-101, F-B-302) vs 8.2.0 (F-B-201, F-B-506) | C-01 at 8.1.x: a template message member and a lib dev throw on a bag that never emitted a request change no valid call. |
| setAction brand: 9.0.0 (F-B-205, F-B-304) vs 8.1.x (F-B-510) | C-46 at 9.0.0; F-B-510's stance pin is its interim step. |
| htmx pin: F-D-101 and F-D-502 | Same measure; merged into C-27. |
| D1 overflow "drawer close-on-nav benign" | Different shape from F-A-107 (swaps the region containing the drawer); F-A-107 kept in C-03 at reach 1 (critic: 0 live fleet sites). |
| Recon 04 side-finding 8 | Closed by the critic and by A-reseed with no defect; no cluster. |

## Ranked clusters

| id | title | track | findings | score | lane | enforcement |
|---|---|---|---|---|---|---|
| C-01 | Swap verbs name the route-callable fix for a raw route; dev throw on a request-less bag | B | F-B-101, F-B-201, F-B-302, F-B-506 | 27 | 8.1.x | type |
| C-02 | Tool messages stop prescribing the nonexistent staticManifest | D | F-D-504, F-C-203 | 18 | 8.1.x | lint |
| C-03 | Behaviors runtime: onClickOutside on its own panel, trapFocus on WebKit, htmx-4 swap detail | A | F-A-601, F-A-602, F-A-107 | 18 | 8.1.x | runtime |
| C-04 | .search on htmx 4.0.0: sync 'queue last' and an asymmetric-latency row | D | F-D-601 | 18 | 8.1.x | runtime |
| C-05 | templates/web emits hx-* with no htmx: native action and href, plus a render test | A | F-A-106 | 18 | 8.1.x | ci |
| C-06 | no-tailwind-in-raw-class: every autofix compiles; pruned roots get a cssProp redirect | C | F-C-201, F-D-202, F-C-105, F-C-209 | 13.5 | 8.1.x | lint |
| C-07 | Executed htmx-bundle oracle in lib CI; correct the records name-grep produced | A | F-A-101, F-A-102, F-D-106 | 13.5 | 8.1.x | ci |
| C-08 | Traps for .colspan, .rowspan, .inert so the heal names the attribute setter | A | F-A-205, F-A-401 | 12 | 8.2.0 | type |
| C-09 | htmx unions admit working htmx-4 modifiers and drop dead open-tail literals | B | F-B-405, F-A-109 | 12 | 8.2.0 | type |
| C-10 | Optional-boolean gates in IfThen and .when name x === true | B | F-B-606 | 12 | 8.2.0 | type |
| C-11 | Numeric children render: View admits number (L-025) | G | F-G-106 | 12 | 8.2.0 | type |
| C-12 | Branded route sinks print the three sanctioned producers on line 1 | B | F-B-206, F-B-308 | 12 | 8.2.0 | type |
| C-13 | setClass-family and ternary rules re-derived from the 8.x surface, fixes that compile | C | F-D-507, F-C-206 | 12 | 8.1.x | lint |
| C-14 | Class hooks converge on cssClass: fix the copied exemplars, lint first-write setClass | C | F-C-302 | 12 | 8.2.0 | lint |
| C-15 | Type-scale guard matches .text(unit, n); prefer-unit-overload stops steering to it | C | F-C-601 | 12 | 8.1.x | lint |
| C-16 | Form<T>: checkbox groups bind by membership; dev throw on a second builder | A | F-A-603, F-G-102 | 12 | 8.1.x | dev-throw |
| C-17 | Quote hx-status values so spaced targets and swap modifiers survive | A | F-A-103 | 12 | 8.1.x | runtime |
| C-18 | js: and javascript: in htmx-evaluated sinks: sanitize hx endpoint and HxResponse URLs | A | F-A-506, F-B-303 | 12 | 8.1.x | runtime |
| C-19 | JSON-typed Script bodies escape '<' so data cannot open a script | A | F-A-502 | 12 | 8.1.x | runtime |
| C-20 | Object-variant hot loop rewrite recovers the 7.0.0 construction regression | D | F-D-401 | 12 | 8.1.x | runtime |
| C-21 | Compile route templates once instead of a RegExp per param per call | D | F-D-402 | 12 | 8.1.x | runtime |
| C-22 | Anchor emitters keep their own style slot; teach implicit anchoring | A | F-A-403, F-D-305 | 12 | 8.1.x | runtime |
| C-23 | Run the palette opt-out type project in CI | B | F-B-508 | 12 | 8.1.x | ci |
| C-24 | canonical-names codemod runs to a fixpoint | B | F-B-604 | 12 | 8.1.x | ci |
| C-25 | fluent-html's own CLAUDE.md and .ai/ copy: CI drift check and a pointer | G | F-C-403, F-G-103 | 12 | 8.1.x | ci |
| C-26 | Bench gate runs in CI and times construction | D | F-D-403 | 12 | 8.1.x | ci |
| C-27 | Verified htmx converges on 4.0.0: one pin constant, delta rows, app-pin check | D | F-D-101, F-D-502, F-D-102 | 12 | 8.1.x | ci |
| C-28 | Documented npm installs resolve stale or missing packages: publish or deprecate | D | F-D-506 | 12 | 8.1.x | boot |
| C-29 | Palette literal under opt-out names the role tokens; lint stops autofixing into it | C | F-C-204, F-B-208 | 9 | 8.2.0 | type |
| C-30 | Remove the six inert HxSwap modifier members, codemod-first | A | F-A-105 | 9 | 9.0.0 | type |
| C-31 | addAttribute key type redirects typed and reserved keys to their setter | B | F-C-304, F-B-207, F-B-307 | 9 | 9.0.0 | type |
| C-32 | 9.0.0 surface prune with verified successors, gated on post-prune guesses | C | F-C-101, F-C-103, F-C-309, F-C-606 | 9 | 9.0.0 | type |
| C-33 | Swapped scripts run under strict-dynamic: no-inline-script lint and a Playwright row | A | F-A-505 | 9 | 8.2.0 | lint |
| C-34 | hx-config and hx-headers values fetch rejects: dev throws now, retype in 9.0.0 | A | F-A-104, F-A-108, F-A-606 | 9 | 8.1.x | dev-throw |
| C-35 | One hidden contract in the behaviors runtime: attribute and class | A | F-A-402, F-A-302 | 9 | 8.1.x | runtime |
| C-36 | Build the decided family-keyed class merge, opt-in, gated per composed tag | A | F-A-301, F-A-201, F-D-404 | 9 | 8.2.0 | runtime |
| C-37 | Swap verbs stamp action and method on forms | B | F-B-301 | 9 | 8.2.0 | runtime |
| C-38 | Extractor silent drops: named style object and trailing comma | A | F-A-202, F-D-604 | 9 | 8.1.x | boot |
| C-39 | Diagnostic-text contract in CI: golden first diagnostics for a wrong-guess matrix | B | F-B-502, F-B-603 | 9 | 8.1.x | ci |
| C-40 | Census correctness: dedup, receiver guards, object-key channel, checked README head | C | F-C-402, F-C-102, F-C-404 | 9 | 8.1.x | ci |
| C-41 | One CI gate over lib, plugin and extractor; a real extractor 3.0.0 | D | F-D-503, F-D-501 | 9 | 8.1.x | ci |
| C-42 | Restore the Match case-key did-you-mean lost to NoExtraCases in 8.1.0 | B | F-B-401 | 8 | 8.1.x | type |
| C-43 | PageResponse checked by Rooted<'main-content'> instead of 44 casts | B | F-B-601 | 8 | 8.2.0 | type |
| C-44 | Close unions defeated by an open arm: HxSync, overlay, reswap | B | F-B-503, F-B-504 | 8 | 8.2.0 | type |
| C-45 | Id flows into every selector and IDREF sink; IDREF rejects '#' | B | F-B-305, F-B-306 | 8 | 8.2.0 | type |
| C-46 | Brand setAction, setFormaction, Area and Use setHref | B | F-B-304, F-B-205, F-B-510 | 8 | 9.0.0 | type |
| C-47 | Report every unknown set*/add* name in one lint pass | C | F-C-502 | 8 | 8.2.0 | lint |
| C-48 | Textarea keeps its leading newline across re-renders | A | F-A-503 | 8 | 8.1.x | runtime |
| C-49 | One arity-matching candidate for a discriminated-union Match call | B | F-B-402, F-B-202 | 6 | 8.2.0 | type |
| C-50 | Numeric SVG setters accept numbers like their 30 siblings | C | F-C-503 | 6 | 8.2.0 | type |
| C-51 | HTML/ARIA platform watch and the four missing ARIA 1.3 names | D | F-D-304, F-D-303 | 6 | 8.2.0 | type |
| C-52 | One generated tombstone layer, validated against the full guess matrix | B | F-B-602, F-B-203, F-B-204, F-B-406, F-B-605, F-A-406, F-B-507 | 6 | 8.2.0 | type |
| C-53 | defineTheme rejects size-like color names; fontSize tokens carry line-height | A | F-A-204, F-A-208 | 6 | 8.2.0 | type |
| C-54 | The 422 re-render gets a root contract on the route def | B | F-B-107 | 6 | 8.2.0 | type |
| C-55 | Bare setter calls become a compile error | A | F-A-404 | 6 | 9.0.0 | type |
| C-56 | Move popovertarget and form setters to the elements that honor them | A | F-D-302, F-A-407 | 6 | 9.0.0 | type |
| C-57 | hxResponse converges on getHeaders(); build() stops returning HTML | A | F-A-501 | 6 | 9.0.0 | type |
| C-58 | Remove hxGet, hxPost and setHtmx(endpoint, opts) | C | F-C-301, F-C-107 | 6 | 9.0.0 | type |
| C-59 | Typed lint names the intended token for a typo'd styling argument | B | F-B-209 | 6 | 8.2.0 | lint |
| C-60 | prefer-htmx-api derived from the pinned htmx package; typed :inherited path | C | F-C-202, F-D-104, F-A-607 | 6 | 8.2.0 | lint |
| C-61 | prefer-set-method and plugin vocab derived from the installed lib | C | F-C-506, F-C-104, F-C-205, F-G-105, F-D-510 | 6 | 8.1.x | lint |
| C-62 | Typed-surface bypass lints generated from class-vocab | C | F-C-303, F-C-603, F-D-205 | 6 | 8.2.0 | lint |
| C-63 | One attribute precedence at serialize, dev throw on collision | A | F-C-505, F-A-507 | 6 | 8.1.x | dev-throw |
| C-64 | Validate element names in El() | A | F-A-605 | 6 | 8.1.x | runtime |
| C-65 | Explicit undefined clears every Tag-level setter; boolean download fixed | A | F-C-504, F-A-405 | 6 | 8.1.x | runtime |
| C-66 | Sibling separator stops rendering a space before punctuation | A | F-A-504 | 6 | 8.1.x | runtime |
| C-67 | Safari closedby fallback in the behaviors runtime (reopens ADR-06 / S-21) | D | F-D-301 | 6 | decision-gated (g10) | runtime |
| C-68 | Generated both-direction union pins with a widen-mutation CI check | B | F-B-501, F-B-509, F-B-505 | 6 | 8.1.x | ci |
| C-69 | Verify the type contract on TypeScript 6.0.3 and 7 | D | F-D-602 | 6 | 8.1.x | ci |
| C-70 | Compile the lib's README, REFERENCE, @example blocks and examples/ in CI | G | F-C-401, F-C-408, F-D-508, F-G-109 | 6 | 8.1.x | ci |
| C-71 | Extractor 3.0.0 safelist: derived manifest, validated against the app's Tailwind | D | F-A-210, F-D-207 | 6 | 8.2.0 | boot |
| C-72 | Replay the frozen pure-prior runs in CI | C | F-C-207 | 6 | 8.1.x | ci |
| C-73 | Compile every taught guideline block in a template CI lane | G | F-G-101, F-C-208, F-C-406, F-G-104 | 6 | 8.1.x | ci |
| C-74 | Shrink always-loaded prose and pin a token budget in CI | G | F-C-602, F-C-308, F-C-410, F-C-310, F-D-505, F-G-110 | 6 | 8.1.x | ci |
| C-75 | CHANGELOG check per repo | D | F-C-405, F-D-605 | 6 | 8.1.x | ci |
| C-76 | Exported message-literal Rooted/Id gate; cheaper RootedView | B | F-B-102, F-B-106, F-B-403, F-B-404 | 4 | 8.2.0 | type |
| C-77 | Class-level Tailwind coverage and variants from getVariants() | D | F-D-204, F-D-203 | 4 | 8.2.0 | type |
| C-78 | Export the Styler type the README teaches | G | F-G-107 | 4 | 8.2.0 | type |
| C-79 | f.input rejects 'checkbox' and 'radio' | G | F-G-108 | 4 | 9.0.0 | type |
| C-80 | defineIds camelCase: README fix, lint, then a type | C | F-C-407 | 4 | 9.0.0 | type |
| C-81 | Setter casing rename (F-D-160, L-144) stays parked | C | F-C-501, F-C-409, F-C-307, F-C-108, F-C-210 | 4 | parked | type |
| C-82 | One meaning for a bare selector token (L-063) | B | F-B-309 | 4 | decision-gated (g4) | type |
| C-83 | Dev-check coverage and activation | A | F-A-303, F-A-304, F-D-405 | 4 | 8.1.x | dev-throw |
| C-84 | Duplicate ids throw under dev checks; prefixed ForEachKeyed keys | A | F-A-604 | 4 | 8.2.0 | dev-throw |
| C-85 | Derive htmx config, location and event types from the pinned htmx.d.ts | D | F-D-103, F-D-105 | 4 | 8.2.0 | ci |
| C-86 | Type-aware extractor mode | A | F-A-203 | 4 | 8.2.0 | boot |
| C-87 | Safari column from the system engine, not Playwright WebKit | D | F-D-603 | 4 | 8.1.x | ci |
| C-88 | Peer ranges, Tailwind floor and a loadable, tested recommended preset | D | F-D-509, F-D-206, F-D-606 | 4 | 8.2.0 | boot |
| C-89 | Undeclared routes stop escaping the fragment-stance check | B | F-B-103 | 3 | 8.2.0 | type |
| C-90 | preserve, boost, swapOob leave the request-shaped HTMX bag | A | F-A-110 | 3 | 9.0.0 | type |
| C-91 | One spelling per variant: drop 5 dead tier-1 names, freeze the live tail | C | F-C-106, F-C-604, F-C-605 | 3 | 9.0.0 | type |
| C-92 | Pick the CSP-nonce survivor: renderWithNonce or the options bag | C | F-C-305 | 3 | decision-gated (g7) | type |
| C-93 | Which component layer survives: @jtdigital/ui or src/shared/ui | C | F-C-306, F-A-209 | 3 | decision-gated (g5) | prose |
| C-94 | Typed open arms that compile to no CSS | D | F-D-201, F-A-206, F-A-207 | 2 | 8.2.0 | type |
| C-95 | Rooted<N> soundness: Partial outer swap and re-rooting | B | F-B-104, F-B-105 | 2 | 8.2.0 | type |
| C-96 | Platform additions with engine support and no demand | D | F-D-306, F-D-307, F-D-308 | 1 | parked | type |

## Clusters

Each section: lane, enforcement and score, the rationale with every member's measure cited inline by finding id, then members as impact/pain/reach/effort and the lane each finder filed.

### C-01 · Swap verbs name the route-callable fix for a raw route; dev throw on a request-less bag

Track B · lane 8.1.x · enforcement type · score 27 = 3x3x3/S · high-impact

Seed L-084 measured from four sides: 8/8 template verbs reject a path with a TS2345 naming no route callable (F-B-101, F-B-201); 0 of 155 lib directives and 0 of 43 template fixtures pin it (F-B-506); at runtime 4/6 wrong shapes render hx-undefined with 0 requests and the uncalled callable GETs and pushes /undefined (F-B-302). Prototypes put the fix on line 1 in 12/12 probes with the scaffold compiling unchanged, and a Tag._setHx dev throw kept 2159/2159 lib tests green. Lane conflict (8.1.x vs 8.2.0) resolved to 8.1.x: the template parameter gains a message member and the lib throw fires only on bags that never emitted a request.

Members (impact/pain/reach/effort, filed lane): F-B-101 2/3/2/S 8.1.x; F-B-201 2/3/2/S 8.2.0; F-B-302 2/3/2/S 8.1.x; F-B-506 3/3/3/S 8.2.0.

### C-02 · Tool messages stop prescribing the nonexistent staticManifest

Track D · lane 8.1.x · enforcement lint · score 18 = 2x3x3/S

Three tool messages and the always-loaded CLAUDE.md (vendored in 15/15 canonical repos) prescribe defineTheme()'s staticManifest, which is TS2353, and the extractor's own staticManifest option does not clear an unresolved call either (F-D-504). no-dynamic-class-argument also fires on 16/16 prior class-constant sites claiming styles disappear, while 0 of 181 tokens are missing from the compiled CSS, and 13/16 are presets no message names .apply() for (F-C-203). Messages name only remedies that clear the error, split by argument shape (.apply, .whenElse, .whenMatch); the clause leaves 5 places.

Members (impact/pain/reach/effort, filed lane): F-D-504 2/3/3/S 8.1.x; F-C-203 2/3/2/S 8.1.x.

### C-03 · Behaviors runtime: onClickOutside on its own panel, trapFocus on WebKit, htmx-4 swap detail

Track A · lane 8.1.x · enforcement runtime · score 18 = 3x3x2/S · high-impact

onClickOutside on the panel it hides (the @self default) never opens: 0/5 visible states on Chromium, Firefox and WebKit, and 2/2 fleet sites ship a hand-found wrapper (F-A-601). The same prototype fixes trapFocus, whose acceptance row 15 fails on WebKit 26.5 (F-A-602): +131 B (6108 of 6144 B), matrix 69/69 on chromium and webkit, unit 2159/2159. F-A-107 is the third stale dispatch assumption in runtime.ts (htmx-2 pushUrl detail, drawer stays open on 4/4 bundles), reach 0 fleet sites per the critic. Bug fixes inside the S-21 frozen grammar; shares the asset budget with C-35.

Members (impact/pain/reach/effort, filed lane): F-A-601 3/3/2/S 8.1.x; F-A-602 2/2/1/S 8.1.x; F-A-107 2/3/1/S 8.1.x.

### C-04 · .search on htmx 4.0.0: sync 'queue last' and an asymmetric-latency row

Track D · lane 8.1.x · enforcement runtime · score 18 = 2x3x3/S

htmx 4.0.0, served by 13 of 16 canonical apps, lets an older .search response overwrite the newest: 5/5 wrong under asymmetric latency and 4/20 under seeded uniform latency, 0/25 with sync 'queue last' and on unreleased four-dev (F-D-601). 52 .search sites are exposed, the template's regression row is skipped and its uniform 1200 ms lag cannot see the race. Template sync bag change, an asymmetric-latency row, and the verb comment that claims 'the last keystroke wins' corrected. Pairs with C-27.

Members (impact/pain/reach/effort, filed lane): F-D-601 2/3/3/S 8.1.x.

### C-05 · templates/web emits hx-* with no htmx: native action and href, plus a render test

Track A · lane 8.1.x · enforcement ci · score 18 = 3x3x2/S · high-impact

templates/web serves 0 htmx bundles since a40bd01 but keeps 3 setHtmx emitters: the contact form falls back to a native GET carrying name, email and message in the query string, and post cards fire 0 requests (F-A-106). L-270 parked a missing test on the premise of a vendored blob that no longer exists. Native action/method and href, plus a render test that fails on any hx-* attribute when no bundle is served.

Members (impact/pain/reach/effort, filed lane): F-A-106 3/3/2/S 8.1.x.

### C-06 · no-tailwind-in-raw-class: every autofix compiles; pruned roots get a cssProp redirect

Track C · lane 8.1.x · enforcement lint · score 13.5 = 3x3x3/M · high-impact

no-tailwind-in-raw-class rewrites valid Tailwind 4.3.3 classes into chains that fail tsc: 1,888 of 4,232 rewrites on bare 8.1.0 (F-C-201) and 4,516/4,516 outside the typed surface (F-D-202); eslint --fix adds 24/26 tsc errors to the pure prior. Pruned roots get three behaviors (378 mask-* unflagged, 591 routed into a surviving method that fails tsc, a malformed root in the message) (F-C-209, F-C-105). One contract: a CI sweep that lints, fixes and type-checks every class of the pinned getClassList(); a failing rewrite becomes report-only with a concrete .cssProp(prop, value) from the oracle. The RFC pins the getClassList sweep as the one denominator.

Members (impact/pain/reach/effort, filed lane): F-C-201 3/3/3/M 8.1.x; F-D-202 2/3/2/S 8.1.x; F-C-105 2/2/2/S 8.1.x; F-C-209 2/2/2/M 9.0.0.

### C-07 · Executed htmx-bundle oracle in lib CI; correct the records name-grep produced

Track A · lane 8.1.x · enforcement ci · score 13.5 = 3x3x3/M · high-impact

No executed check ties the typed htmx surface to a bundle: 16 typed lines broken in Chromium on 4 htmx 4 builds compile and lint clean, 0/39 lib test files load a bundle, and the template's name-only contract catches 1/15 for a wrong reason (F-A-101, guardrail 10). Name-only reasoning also produced two false records: the pre-8.0.0 <hx-partial> bytes swap 16/16, so the recorded Partial() cause is false and pinned by 2 tests (F-A-102), and bare hx-preload works under the shipped extension on 3 builds (F-D-106; L-217's disposition stands on 0 demand). Playwright oracle over every typed emitter on pinned and served bundles in test.yml; correct the records; strike name-grep from acceptable oracles.

Members (impact/pain/reach/effort, filed lane): F-A-101 3/3/3/M 8.1.x; F-A-102 2/2/2/S 8.1.x; F-D-106 1/1/1/S 8.1.x.

### C-08 · Traps for .colspan, .rowspan, .inert so the heal names the attribute setter

Track A · lane 8.2.0 · enforcement type · score 12 = 2x3x2/S

The §6 colspan seed (L-002): TS2551 heals .colspan/.rowspan into colSpan/rowSpan (a td with col-span-2 keeps colSpan 1, 200px vs 399px) and .inert into .invert on 44 classes (subtree stays focusable), with 0 tsc and 0 eslint diagnostics and 0 of 12 setter-errors probes covering them (F-A-205, F-A-401). Trap members whose parameter names .setColspan/.setRowspan/.toggle('inert'), pinned in setter-errors.test.ts. If C-52 ships in the same release, its generator emits these traps (F-B-602 measured TS2430/TS2415 conflicts between hand-written sets).

Members (impact/pain/reach/effort, filed lane): F-A-205 2/3/1/S 8.2.0; F-A-401 2/3/2/S 8.2.0.

### C-09 · htmx unions admit working htmx-4 modifiers and drop dead open-tail literals

Track B · lane 8.2.0 · enforcement type · score 12 = 2x3x2/S

The closed HxSwap union steers working htmx-4 modifiers into inert ones: 7/7 working spellings rejected, 3/7 redirected by TS2820 to an inert or opposite spelling (focusScroll:true to focus-scroll:true, winY 0 vs 2659) (F-B-405, L-008). The open-tailed target and trigger unions advertise 6 literals that never work (window/document targets throw before fetch; element resize/scroll and sse:/ws:message never fire) (F-A-109, L-148). Additive: admit what the pinned bundle reads, drop the dead open-tail literals (compile behavior unchanged), advertise 'resize from:window'. Removal of the closed dead members is C-30.

Members (impact/pain/reach/effort, filed lane): F-B-405 2/3/2/S 8.2.0; F-A-109 2/2/1/S 8.1.x.

### C-10 · Optional-boolean gates in IfThen and .when name x === true

Track B · lane 8.2.0 · enforcement type · score 12 = 2x2x3/S

An optional boolean in IfThen/IfThenElse/.when/.whenElse fails as a 7-8 line TS2769 naming no fix (3/3 probes), and 35 canonical sites in 13 of 16 repos work around it by hand; the fix (x === true) is stated only in CHANGELOG.md:381 (F-B-606). A message literal in place of never, with the gate overload declared first, prints the fix on line 2 in 3/3 with 0 new errors over 1,407 sites. Error text only; L-065 is not reopened.

Members (impact/pain/reach/effort, filed lane): F-B-606 2/2/3/S 8.2.0.

### C-11 · Numeric children render: View admits number (L-025)

Track G · lane 8.2.0 · enforcement type · score 12 = 2x2x3/S

View excludes number: Span(n) is TS2345 and the runtime drops it silently (Span('a', 7, 'b') renders a and b only), yet 7 ✓/unmarked guideline lines in 4 files write Span(n) and 627 fleet sites stringify by hand (F-G-106). L-025 was accepted in 6.3.0 and never shipped: widen View with number and stringify in serialize (additive).

Members (impact/pain/reach/effort, filed lane): F-G-106 2/2/3/S 8.2.0.

### C-12 · Branded route sinks print the three sanctioned producers on line 1

Track B · lane 8.2.0 · enforcement type · score 12 = 2x2x3/S

Branded route sinks (setHref, hx, setHtmx, hxGet, hxPost) reject a raw path with a 1-line TS2345 naming only 'ResolvedRoute | ExternalHref' (pure prior 2/2 runs), brand-errors.test.ts pins that fix-less text, and prefer-set-method's autofix writes the error (F-B-206, F-B-308). An inline hint type puts 'routes.x.resolve() / assetUrl() / externalUrl()' at char 94-107 of line 1 with every valid shape compiling and 0 new errors on the template plus 3 canonical repos. Re-pin the test to the hint; prefer-set-method goes report-only for href.

Members (impact/pain/reach/effort, filed lane): F-B-206 2/2/3/S 8.2.0; F-B-308 2/2/3/S 8.2.0.

### C-13 · setClass-family and ternary rules re-derived from the 8.x surface, fixes that compile

Track C · lane 8.1.x · enforcement lint · score 12 = 2x3x2/S

no-setclass-after-fluent-modifier is silent on 10/13 variant-then-setClass wipes whose render drops every fluent class, because its modifier set lists removed .on/.at and misses 25 class writers (F-D-507); no-ternary-in-view-builder reports 0 of 10 prior conditional-view ternaries (F-C-206). Both prescribe t.children() (TS2339) or addClass. Derive the modifier set from class-vocab + DIRECT_VARIANTS + composition methods, match the spread-child and conditional-modifier shapes, and name IfThen/IfThenElse/.when/.whenElse/.cssClass.

Members (impact/pain/reach/effort, filed lane): F-D-507 2/3/1/S 8.1.x; F-C-206 2/2/2/S 8.1.x.

### C-14 · Class hooks converge on cssClass: fix the copied exemplars, lint first-write setClass

Track C · lane 8.2.0 · enforcement lint · score 12 = 2x2x3/S

Non-Tailwind class hooks go through setClass at 85 canonical sites vs cssClass 25 (77.3% loser share); 73 of the 85 are copies of two template exemplars, email.template.ts:51-54 (13 repos) and charts.ts (6 repos), because the lint fires only on Tailwind tokens (F-C-302, L-242 new evidence). Switch the exemplars to .cssClass() (byte-identical on a fresh tag) and lint a first-write setClass with a non-Tailwind token; setClasses (0 canonical) leaves in 9.0.0.

Members (impact/pain/reach/effort, filed lane): F-C-302 2/2/3/S 8.2.0.

### C-15 · Type-scale guard matches .text(unit, n); prefer-unit-overload stops steering to it

Track C · lane 8.1.x · enforcement lint · score 12 = 2x2x3/S

The template type-scale guard (theme-tokens.test.ts:59) still matches the pre-7 .textSize(, so it hits 0 of 790 off-scale .text(unit, n) sites in 8 of 16 canonical repos, while prefer-unit-overload autofixes the bracket form toward the banned overload (F-C-601). The 2 repos that patched the guard hold 0 unratified sites vs 552 in 6 dead-guard repos. Repoint the guard (popri's ratified-size shape), stop the lint steering, and make rename codemods sweep string consumers.

Members (impact/pain/reach/effort, filed lane): F-C-601 2/2/3/S 8.1.x.

### C-16 · Form<T>: checkbox groups bind by membership; dev throw on a second builder

Track A · lane 8.1.x · enforcement dev-throw · score 12 = 3x2x2/S · high-impact

Form<T>.checkbox(name, value) checks every box of a group whenever the field is truthy, [] included, so an edit round trip resubmits every value on 3/3 engines and all boxes share one id; 9/14 fleet group sites hand-add the override (F-A-603). README's Form<T> example passes two builders and the runtime drops every field after the first with 0 throws (F-G-102). Membership plus radio-style ids for groups (bytes change only for shapes that never worked) and a dev throw naming the single-builder form.

Members (impact/pain/reach/effort, filed lane): F-A-603 3/2/2/S 8.1.x; F-G-102 3/2/2/S 8.1.x.

### C-17 · Quote hx-status values so spaced targets and swap modifiers survive

Track A · lane 8.1.x · enforcement runtime · score 12 = 2x3x2/S

buildStatusConfig emits hx-status values unquoted: a spaced target lands the 422 body nowhere (0/4 bundles) and a modifier inside the status swap is dropped 4/4; HCON quoting fixes both 4/4 (F-A-103). This meets L-007's reopen condition by execution and refutes its 'byte-level no-op' withdrawal; 5 live sites in planet-positive-sport drop scroll:top today. Bytes change only for values htmx misparses.

Members (impact/pain/reach/effort, filed lane): F-A-103 2/3/2/S 8.1.x.

### C-18 · js: and javascript: in htmx-evaluated sinks: sanitize hx endpoint and HxResponse URLs

Track A · lane 8.1.x · enforcement runtime · score 12 = 3x2x2/S · high-impact

htmx 4 evaluates js:/javascript: in five fluent sinks (hx endpoint, confirm, string vals, HX-Redirect, HX-Location): 7/7 payloads execute on beta6 and 4.0.0 without CSP, and sanitizeUrl returns 'js:alert(1)' unchanged (F-A-506). The four HxResponse URL headers are typed string with 0 sanitization, and 8/8 8.x call sites already pass resolve() or externalUrl() (F-B-303). L-137 covered attribute setters only. Add js: and run sanitizeUrl on these sinks (bytes change only for executing values); the HxResponse brand rides C-46's 9.0.0 bundle.

Members (impact/pain/reach/effort, filed lane): F-A-506 3/2/1/S 8.1.x; F-B-303 3/2/2/S 8.1.x.

### C-19 · JSON-typed Script bodies escape '<' so data cannot open a script

Track A · lane 8.1.x · enforcement runtime · score 12 = 2x3x2/S

Script(JSON.stringify(x)) with one '<!--<script>' in the data removes 3/3 body children and blocks the app script in Chromium; sanitizeRawContent neutralizes only the closer (F-A-502). L-012 parked opener hardening because it corrupts JS; a '<' rewrite limited to JSON MIME types (application/json, ld+json, importmap) parses identically and retires 14 hand-rolled fleet helpers (2 sites lack one).

Members (impact/pain/reach/effort, filed lane): F-A-502 2/3/2/S 8.1.x.

### C-20 · Object-variant hot loop rewrite recovers the 7.0.0 construction regression

Track D · lane 8.1.x · enforcement runtime · score 12 = 2x2x3/S

Object variants (7.0.0) made variant-styled construction 2.4x slower than the lambdas they replaced (build+render x0.41, build-only x0.28 on a 100-button page), across 2,780 variant sites in 16/16 canonical repos (F-D-401). A 25-line hot-loop rewrite gives build x1.93 and build+render x1.59 with byte-identical output; its scenario joins C-26.

Members (impact/pain/reach/effort, filed lane): F-D-401 2/2/3/S 8.1.x.

### C-21 · Compile route templates once instead of a RegExp per param per call

Track D · lane 8.1.x · enforcement runtime · score 12 = 2x2x3/S

substituteParams builds a RegExp per param per call: 498 ns per param, 40% of a 50-row list page, across 640 .resolve sites in 16/16 canonical repos (F-D-402). Compile-once at defineRoutes with a fallback measured 5x per resolve and +49% on the list page with 1,950/1,950 parity cases including error messages. L-319 rejected a mega-regex on diff size with no perf data; this is a different shape with that data.

Members (impact/pain/reach/effort, filed lane): F-D-402 2/2/3/S 8.1.x.

### C-22 · Anchor emitters keep their own style slot; teach implicit anchoring

Track A · lane 8.1.x · enforcement runtime · score 12 = 2x3x2/S

Since 6.1.1 the four anchor emitters write inline style, so a later setStyle/setStyles erases them (popover 61px to 0px), while 2 guideline files still teach class output and a safelist step (F-A-403, L-055 new evidence). Implicit anchoring (Baseline 2026-01-13) places invoker-owned popovers identically without the pair on 2/2 engines, and 5/5 fleet pairs carry it redundantly (F-D-305). Own style slot for the emitters, teach .positionArea() alone for invoker popovers, about 12 guideline lines deleted.

Members (impact/pain/reach/effort, filed lane): F-A-403 2/3/1/S 8.1.x; F-D-305 1/2/2/S 8.1.x.

### C-23 · Run the palette opt-out type project in CI

Track B · lane 8.1.x · enforcement ci · score 12 = 2x2x3/S

The palette opt-out 15 fleet repos declare is type-tested only at npm pack: with it broken by mutation, CI's tsc --noEmit exits 0 while the color-optout project reports 4 TS2578 (F-B-508). Add the project to test.yml. The same project has 5 errors on TS 6.0.3 without types ['node'] (C-69).

Members (impact/pain/reach/effort, filed lane): F-B-508 2/2/3/S 8.1.x.

### C-24 · canonical-names codemod runs to a fixpoint

Track B · lane 8.1.x · enforcement ci · score 12 = 2x3x2/S

The canonical-names codemod's receiver walk stops at the first live method between two old names, so one run leaves 287 and 3,186 known renames for manual review that 3 and 7 re-runs clear (98.6% and 98.3% automatable) in 2 pre-7 repos upgraded to 8.1.0 (F-B-604). Guardrail 11's measured dry run over-reports manual work 72x and 59x. Loop to a fixpoint and pin an interleaved chain; every 9.0.0 codemod inherits the loop.

Members (impact/pain/reach/effort, filed lane): F-B-604 2/3/2/S 8.1.x.

### C-25 · fluent-html's own CLAUDE.md and .ai/ copy: CI drift check and a pointer

Track G · lane 8.1.x · enforcement ci · score 12 = 2x2x3/S

fluent-html/CLAUDE.md and .ai/web-development are a byte-identical snapshot of guidelines@ac24da0, 23 commits and 934 lines behind, teaching claims that execute false on beta6 and 4.0.0 (F-C-403, F-G-103). L-379's fix reached only the template copy; guidelines:check runs in 0 of 3 workflows. Wire the check into test.yml and cut the lib copy to lib-dev rules plus a pointer. Critic gap G-1 measures the same drift in 15 of 17 fleet copies; no finding covers a fleet sync.

Members (impact/pain/reach/effort, filed lane): F-C-403 2/2/3/S 8.1.x; F-G-103 2/2/3/S 8.1.x.

### C-26 · Bench gate runs in CI and times construction

Track D · lane 8.1.x · enforcement ci · score 12 = 2x3x2/S

bench:ci runs in 0 of 3 workflows (297bb10 'bench-in-CI' touched no .github file) and its build+render floor times a pre-built tree, so an injected 29x construction regression passes (F-D-403, L-262 new evidence). Add it to test.yml, time make() inside the closure, add variant and param-route scenarios; floors stay catastrophic-only.

Members (impact/pain/reach/effort, filed lane): F-D-403 2/3/2/S 8.1.x.

### C-27 · Verified htmx converges on 4.0.0: one pin constant, delta rows, app-pin check

Track D · lane 8.1.x · enforcement ci · score 12 = 2x2x3/S

The lib verifies its grammar on 4.0.0-beta6 while 13/16 canonical apps serve 4.0.0; the bump is green (69/69, 2159/2159) and flips 6 executed behaviors no test observes (F-D-101; F-D-502 is the same measure). 2 apps on pre-GA builds lose .search keystrokes 5/5, and their provenance test passes by construction (F-D-102). One pin constant read by the lib matrix, the template vendor script and the grammar contract; an acceptance row per delta; template check 'app pin == lib-verified htmx'. 4.0.0 carries its own race (C-04).

Members (impact/pain/reach/effort, filed lane): F-D-101 2/2/3/S 8.1.x; F-D-502 2/2/3/S 8.1.x; F-D-102 2/2/2/S 8.1.x.

### C-28 · Documented npm installs resolve stale or missing packages: publish or deprecate

Track D · lane 8.1.x · enforcement boot · score 12 = 2x3x2/S

The README install resolves fluent-html 5.7.0 (17/31 README methods absent), the plugin resolves 1.4.0 (13 of 32 rules), and the extractor's install is E404; 0/93 fleet lockfiles resolve from the registry (F-D-506). L-292's premise 'nothing is published' is false. Publish current versions, or npm-deprecate fluent-html <8 and the plugin <4 and point the 3 install lines at the git spec.

Members (impact/pain/reach/effort, filed lane): F-D-506 2/3/2/S 8.1.x.

### C-29 · Palette literal under opt-out names the role tokens; lint stops autofixing into it

Track C · lane 8.2.0 · enforcement type · score 9 = 2x3x3/M

Palette literals are the pure prior's densest divergence (43 and 40 per run), the palette is off in 13 of 14 canonical 8.1.0 apps, and 36 post-autofix tsc messages name 0 role tokens (F-C-204); .bg('gray-100') under the opt-out names only TailwindColor (F-B-208). A const-generic color parameter maps a palette literal to a message naming theme.ts and the roles (0 new errors on 381 .bg( sites, check time 3.12s to 3.16s), and the lint withholds palette autofixes (C-06 writes them today).

Members (impact/pain/reach/effort, filed lane): F-C-204 2/3/3/M 8.2.0; F-B-208 1/2/2/M 8.2.0.

### C-30 · Remove the six inert HxSwap modifier members, codemod-first

Track A · lane 9.0.0 · enforcement type · score 9 = 2x3x3/M

6 of 15 SwapModifier members are inert on beta4, beta6 and 4.0.0, and show:window:top on alpha7 scrolls to the target's bottom edge; 238 live fleet sites (143 on alpha7, 84 in htmx-2 repos) (F-A-105, L-008). Remove them from the closed union and HxResponse.reswap in the 9.0.0 bundle with a measured codemod; the additive half is C-09.

Members (impact/pain/reach/effort, filed lane): F-A-105 2/3/3/M 9.0.0.

### C-31 · addAttribute key type redirects typed and reserved keys to their setter

Track B · lane 9.0.0 · enforcement type · score 9 = 2x3x3/M

addAttribute has converged in canonical code: 0 of 28 app sites write an attribute that has a typed setter, and 0 canonical sites write id/class/style (126 pre-7) (F-C-304, F-B-207, F-B-307). A conditional key type rejects typed keys with a TS2345 naming the setter in 4/4 probes while untyped keys, hx-*:inherited and widened strings compile, with 0 new errors on the scaffold and 3 canonical repos. L-066's parked-major exclude generalized (L-120 and L-124 stay rejected); afterwards prefer-set-method and prefer-toggle retire.

Members (impact/pain/reach/effort, filed lane): F-C-304 2/2/3/M 9.0.0; F-B-207 2/3/1/S 9.0.0; F-B-307 2/2/1/S 9.0.0.

### C-32 · 9.0.0 surface prune with verified successors, gated on post-prune guesses

Track C · lane 9.0.0 · enforcement type · score 9 = 3x3x3/L · high-impact

Re-derived on three channels over 58 repos, 60 of the 92 zero-use names delete with a verified successor (41 byte-identical via addAttribute, 14 via cssProp, 5 via variant) and 0 consumer codemod sites (F-C-101, L-153). Pruning the full list turns 16 names into TS2551 self-heals, 14 compiling into wrong output (F-C-103), so each deletion is gated on its post-prune guess. F-C-309 adds 12 dead halves of live two-ways with byte-identical successors; F-C-606 21 root exports with 0 canonical importers that stay on their subpath. Ownership: tier-1 names go to C-91, hxPost and setHtmx(endpoint, opts) to C-58, the render/renderToStream option overloads wait on C-92.

Members (impact/pain/reach/effort, filed lane): F-C-101 2/1/3/M 9.0.0; F-C-103 3/3/2/S 9.0.0; F-C-309 2/1/2/M 9.0.0; F-C-606 1/1/2/S 9.0.0.

### C-33 · Swapped scripts run under strict-dynamic: no-inline-script lint and a Playwright row

Track A · lane 8.2.0 · enforcement lint · score 9 = 3x2x3/M · high-impact

Under the template CSP with 'strict-dynamic', htmx runs 8/8 swapped <script> variants with 0 CSP errors on beta6 and 4.0.0, while the same Raw script is blocked on full load, and layout.view.ts:220-221 documents the opposite (F-A-505, L-341). Ship the parked no-inline-script / no-dynamic-Raw lint (L-341, L-024), a Playwright row that swaps a nonce-less script and asserts it does not run, and delete the false comment; dropping 'strict-dynamic' is the traded alternative.

Members (impact/pain/reach/effort, filed lane): F-A-505 3/2/3/M 8.2.0.

### C-34 · hx-config and hx-headers values fetch rejects: dev throws now, retype in 9.0.0

Track A · lane 8.1.x · enforcement dev-throw · score 9 = 3x3x1/S · high-impact

Typed hx-config and hx-headers values that make fetch throw or never apply: credentials true/false reach the server 0/8 and the valid string is TS2322 (F-A-104); a non-Latin-1 header value 0/4 (F-A-108); per-element mode is overwritten by htmx on 0/12 cross-origin requests, and HtmxConfig({ mode: 'cros' }) compiles and stops 6/6 requests (F-A-606, L-148). Dev throws at serialize now (0 fleet sites), retyping and mode's removal in the 9.0.0 bundle with test/htmx.test.ts:130,148 rewritten.

Members (impact/pain/reach/effort, filed lane): F-A-104 3/3/1/S 8.1.x; F-A-108 2/3/1/S 8.1.x; F-A-606 2/1/1/S 9.0.0.

### C-35 · One hidden contract in the behaviors runtime: attribute and class

Track A · lane 8.1.x · enforcement runtime · score 9 = 3x3x1/S · high-impact

behavior('toggle') flips only the hidden class: an attribute-hidden target never shows (0/3 states) (F-A-402), and the hidden class loses to 15 of 20 display utilities, so toggle hides 4/11 display-method targets (F-A-302). Hide with the hidden attribute as well as the class, treat [hidden] as hidden when showing, add inline-flex/table-row/attribute-hidden rows, and keep hidden out of the merger's display family (C-36). Shares the asset budget with C-03.

Members (impact/pain/reach/effort, filed lane): F-A-402 3/3/1/S 8.1.x; F-A-302 3/3/1/M 8.2.0.

### C-36 · Build the decided family-keyed class merge, opt-in, gated per composed tag

Track A · lane 8.2.0 · enforcement runtime · score 9 = 3x3x3/L · high-impact

The losing override is live at 97 sites (109 pairs) in 11 of 16 canonical repos, losing 108/108 in each repo's compiled CSS and 5/5 in Chromium, 89/97 written after the 2026-08-14 decision (F-A-301; F-A-201's 59 sites in 7 repos is the same-root same-property subset). The merge is decided (S-16, guardrail 13) and unbuilt, and the lib's pm/decisions.md:94 still says never. An inline memoized merger costs x0.885-0.928 per request on fresh trees (F-D-404): gate it on a per-tag composition bit. Build per the recorded scope (opt-in 8.2.0, default-on 9.0.0) with the 97-site census as the re-render diff gate; keep the hidden class out of the display family (C-35).

Members (impact/pain/reach/effort, filed lane): F-A-301 3/3/3/L 8.2.0; F-A-201 3/3/3/L 8.2.0; F-D-404 2/2/3/M 8.2.0.

### C-37 · Swap verbs stamp action and method on forms

Track B · lane 8.2.0 · enforcement runtime · score 9 = 3x2x3/M · high-impact

Swap verbs stamp enctype and anchor href but never action or method, so 1,029 of 1,037 verb-driven forms submit natively as GET to the current URL before htmx loads; 84 are password forms in 15/15 8.x repos, and the template login sends the password in the URL on 2/2 bundles (F-B-301). This refutes L-075's parked reason. The verbs stamp action/method from the route they hold, with an additive lib getAction so an explicit setAction wins.

Members (impact/pain/reach/effort, filed lane): F-B-301 3/2/3/M 8.2.0.

### C-38 · Extractor silent drops: named style object and trailing comma

Track A · lane 8.1.x · enforcement boot · score 9 = 3x3x1/S · high-impact

Two shapes reach the HTML with no CSS and no ledger row: .hover(named), which require-satisfies-variant-object's error-level fix produces (0/2 probe classes compiled, 5/5 layers clean) (F-A-202), and a single-argument call with a trailing comma (54 prefix/value methods and every object variant; 75 more falsely fail the build) (F-D-604, recon 03 seed 10). 0 fleet sites today, but 91% of wrapped argument lists in canonical repos end with a comma. Report a non-object style argument as unresolved and drop the trailing empty segment before counting.

Members (impact/pain/reach/effort, filed lane): F-A-202 3/3/1/S 8.1.x; F-D-604 2/3/1/S 8.1.x.

### C-39 · Diagnostic-text contract in CI: golden first diagnostics for a wrong-guess matrix

Track B · lane 8.1.x · enforcement ci · score 9 = 2x3x3/M

Type tests pin that an error exists, never what it says: 155 directives, 17 text pins, 12 constraints satisfied by never/undefined text, and the DU Match missing case has 0 pins (F-B-502). A 58-probe wrong-guess matrix over 7.0.1, 8.0.0 and 8.1.0 catches all 4 of 8.1.0's lost key names; the standing fixtures and CI catch 0 (F-B-603). Golden first diagnostics (code, offending token, did-you-mean, length) failing CI on a lost token, run through tsc CLI output so they survive TS 7 (C-69).

Members (impact/pain/reach/effort, filed lane): F-B-502 2/3/3/M 8.2.0; F-B-603 2/2/2/S 8.1.x.

### C-40 · Census correctness: dedup, receiver guards, object-key channel, checked README head

Track C · lane 8.1.x · enforcement ci · score 9 = 3x2x3/M · high-impact

The census every prune and rank rests on double-counts 5 .claude/worktrees (+28.1% of canonical-era sites), lets Array.fill and Playwright through the .fill guard, and counts vendored template core as app code (87% of canonical setHtmx) (F-C-402); it skips 3,762 variant-object key sites, which makes 4 'zero-use' names live (F-C-102); the README head is built on the 46-repo 8.0.0 corpus with 0 CI references (F-C-404). Fix the walker (worktree skip, receiver and requiresArg guards per F-C-605, key and app-authored columns), pin totals in a self-test, regenerate the head with a --check.

Members (impact/pain/reach/effort, filed lane): F-C-402 3/2/2/S 8.1.x; F-C-102 2/2/3/S 8.1.x; F-C-404 2/1/3/S 8.1.x.

### C-41 · One CI gate over lib, plugin and extractor; a real extractor 3.0.0

Track D · lane 8.1.x · enforcement ci · score 9 = 3x2x3/M · high-impact

No CI run has ever exercised the lib, plugin and extractor together: template CI failed 114/114 runs at pnpm install, the plugin and extractor have 0 workflows, and the lib's Test ran once in 110 commits (F-D-503). The extractor ships to 16/16 canonical repos as an untagged 3.0.0-unreleased whose suite is 55/56 red for 48 days (F-D-501, L-278). One gate that can pass (template verify against all three at main) plus a suite workflow per tool repo, and a real 3.0.0 cut.

Members (impact/pain/reach/effort, filed lane): F-D-503 3/2/3/M 8.1.x; F-D-501 2/2/3/S 8.1.x.

### C-42 · Restore the Match case-key did-you-mean lost to NoExtraCases in 8.1.0

Track B · lane 8.1.x · enforcement type · score 8 = 2x2x2/S

8.1.0's NoExtraCases replaced the did-you-mean for a typo'd or stale Match case with 'not assignable to type never' in 3 of 4 overloads (201-229 chars naming the key on 8.0.0, 91-94 chars on 8.1.0), across 50 value-form Match sites in 12/16 canonical repos (F-B-401, reproduced by the critic). A message literal for extra keys gives a 173-char line naming key and fix with the lib's tsc and type-surface test green. Regression restore; valid programs unchanged.

Members (impact/pain/reach/effort, filed lane): F-B-401 2/2/2/S 8.1.x.

### C-43 · PageResponse checked by Rooted<'main-content'> instead of 44 casts

Track B · lane 8.2.0 · enforcement type · score 8 = 2x2x2/S

PageResponse is a cast brand: deleting .setId(layoutIds.mainContent) leaves tsc at 0 errors in the template and in 15/15 canonical apps, and the next .nav nests the page in the clicked link on 2/2 bundles; 44 casts in 16 layouts, guarded only by 161 hand-written id=main-content test lines (F-B-601). A checked constructor requiring Rooted<'main-content'> gives 1 error naming the setId with 403/403 unit tests green. Template-owned.

Members (impact/pain/reach/effort, filed lane): F-B-601 2/2/2/S 8.2.0.

### C-44 · Close unions defeated by an open arm: HxSync, overlay, reswap

Track B · lane 8.2.0 · enforcement type · score 8 = 2x2x2/S

Three closed unions are defeated by an open arm: HxSync's undocumented tail admits 'closest form:dorp', which lets 2 of 3 rapid requests through with 0 console lines (F-B-503); OverlayPosition is absorbed by a string overload, so .overlay('top-rigth', ...) renders the typo as text (F-B-504); HxResponse.reswap(HxSwapStyle | string) accepts 'outerHtml' on 7.0.1-8.1.0 (overflow:B-reseed, 1 fleet site). Close each and pin both directions (HxSync arm: 5/5 documented forms accepted, 3/3 typos rejected).

Members (impact/pain/reach/effort, filed lane): F-B-503 2/2/2/S 8.2.0; F-B-504 2/2/1/S 8.2.0.

### C-45 · Id flows into every selector and IDREF sink; IDREF rejects '#'

Track B · lane 8.2.0 · enforcement type · score 8 = 2x2x2/S

Id stops at the sink: 6 selector fields reject Id while the runtime serializes it correctly and no-raw-ids tells the agent to pass the Id tsc rejects (F-B-305); IDREF sinks pass a selector verbatim, so templates/web contact.ts renders 4/4 labels with for='#...' that associate with nothing (F-B-306). Widen selector fields through resolveSelector, accept Id on IDREF sinks, reject a #-prefixed literal with a message (0 of 1,848 fleet setId sites use one).

Members (impact/pain/reach/effort, filed lane): F-B-305 2/2/2/S 8.2.0; F-B-306 2/2/2/S 8.1.x.

### C-46 · Brand setAction, setFormaction, Area and Use setHref

Track B · lane 9.0.0 · enforcement type · score 8 = 2x2x2/S

setAction, setFormaction, AreaTag.setHref and UseTag.setHref stay raw-string route sinks: setAction('/team/invit') passes tsc, eslint and render (F-B-304), the stated exemption (verbs stamp the action) is false (F-B-205, see C-37), and 0 of the 6 raw sinks state a reason or carry a pin (F-B-510). Branding costs 1 edit in 8.x (12/13 setAction sites already branded). 9.0.0 bundle; L-075/L-070 reasons measured false.

Members (impact/pain/reach/effort, filed lane): F-B-304 2/2/2/S 9.0.0; F-B-205 2/2/2/S 9.0.0; F-B-510 1/1/2/S 8.1.x.

### C-47 · Report every unknown set*/add* name in one lint pass

Track C · lane 8.2.0 · enforcement lint · score 8 = 2x2x2/S

One wrong setter name types the rest of its chain as any, so tsc shows 9 of 20 casing misses per pass and needs up to 6 rounds; a root-gated surface-name check finds all in 1 pass with 0 false positives over 5,653 canonical files (F-C-502). An AST rule checking every .set*/.add* name against the setter surface derived at load, with the case-insensitive match as autofix; it carries the casing-heal pins from C-81.

Members (impact/pain/reach/effort, filed lane): F-C-502 2/2/2/S 8.2.0.

### C-48 · Textarea keeps its leading newline across re-renders

Track A · lane 8.1.x · enforcement runtime · score 8 = 2x2x2/S

Form<T>.textarea loses one leading newline per render because the parser strips the first LF after <textarea>: 3 cycles turn three newlines plus 'Notes' into 'Notes' (F-A-503, reproduced by the critic); 71 textarea sites in 14 canonical repos. Emit one compensating LF when content starts with LF; bytes change only where data is lost today.

Members (impact/pain/reach/effort, filed lane): F-A-503 2/2/2/S 8.1.x.

### C-49 · One arity-matching candidate for a discriminated-union Match call

Track B · lane 8.2.0 · enforcement type · score 6 = 2x2x3/M

A missing discriminated-union Match case is a 7-line TS2769 with the actionable text at char 1107 of 1436 after an Overload-1 detour 8.1.0 lengthened, across 104 DU Match sites in 16/16 canonical repos (F-B-402, L-083). The value+default overload shares arity with DU-exhaustive; an arity guard gives 5/6 single diagnostics with the missing case on line 2 and 0 new errors on 26 sites (F-B-202). TS 7.0.2 alone moves the fix to char 420 (C-69): measure both compilers.

Members (impact/pain/reach/effort, filed lane): F-B-402 2/2/3/M 8.2.0; F-B-202 2/2/3/M 8.2.0.

### C-50 · Numeric SVG setters accept numbers like their 30 siblings

Track C · lane 8.2.0 · enforcement type · score 6 = 1x2x3/S

30 numeric SVG setters accept only string while 30 siblings take string or number; context-withheld runs pass numbers 40/40 times and canonical code wraps 701 calls in String() (1,267 of 1,294 sites pass stringified numbers) (F-C-503). Widen to the siblings' shape: additive, no codemod, 47 chart-kit wrappers deletable.

Members (impact/pain/reach/effort, filed lane): F-C-503 1/2/3/S 8.2.0.

### C-51 · HTML/ARIA platform watch and the four missing ARIA 1.3 names

Track D · lane 8.2.0 · enforcement type · score 6 = 2x3x2/M

No HTML/ARIA platform watch exists (0 files reference BCD or web-features), and a BCD 8.1.3 diff finds 24 untyped Baseline attribute keys and 7 shipped names rejected by closed unions (F-D-304). Four ARIA 1.3 names all 3 engines reflect are missing, and the did-you-mean for brailleroledescription compiles into a different attribute and changes the spoken role (F-D-303). Add the 4 names with pins and a CI watch against pinned BCD + web-features with a reasoned ignore list.

Members (impact/pain/reach/effort, filed lane): F-D-304 2/2/2/M 8.2.0; F-D-303 2/3/1/S 8.2.0.

### C-52 · One generated tombstone layer, validated against the full guess matrix

Track B · lane 8.2.0 · enforcement type · score 6 = 2x3x3/L

Removed and misspelled names die anonymously or heal wrongly: 94 removed names give TS2339 with no successor while 16 vendored stylers.ts teach them (F-B-203); 0/38 8.0.0-pruned names name a successor (F-B-406); 80% of setter call sites sit outside the did-you-mean window (F-B-204); 207 setter guesses heal into another attribute's setter (F-A-406); deleted behavior verbs name only keyof BehaviorMap (F-B-507); 59/66 residual errors after the codemod are 6.0.0 removals no source names (F-B-605). F-B-602 shows the round-1 prototypes as filed fix 17 of 573 misdirects, regress 343 heals and conflict in the d.ts; one generator over the published surface history names the fix on line 1 in 2,041/2,041. Validate against the full guess matrix; type-only, not aliases (L-389).

Members (impact/pain/reach/effort, filed lane): F-B-602 2/2/1/M 8.2.0; F-B-203 2/3/3/M 8.2.0; F-B-204 2/3/2/M 8.2.0; F-B-406 2/2/1/S 8.2.0; F-B-605 2/2/2/M 8.2.0; F-A-406 2/2/1/M 8.2.0; F-B-507 2/2/2/S 8.2.0.

### C-53 · defineTheme rejects size-like color names; fontSize tokens carry line-height

Track A · lane 8.2.0 · enforcement type · score 6 = 2x3x2/M

defineTheme accepts tokens that silently change stock behavior: a color token named like a size or width key (19 names) re-points 36 merged-prefix classes to color with 0 warnings (F-A-204), and custom fontSize tokens carry no line-height, so a 64px token gets a 96px line box with 84/130 sites lacking .leading() (F-A-208). Generate the reserved-name list at gen:vocab time and reject it in ThemeKeys; let a fontSize token carry its line-height into themeToCss.

Members (impact/pain/reach/effort, filed lane): F-A-204 2/3/1/S 8.2.0; F-A-208 1/2/2/S 8.2.0.

### C-54 · The 422 re-render gets a root contract on the route def

Track B · lane 8.2.0 · enforcement type · score 6 = 2x2x3/M

The 422 re-render has no root contract: { invalid } takes a bare Id and the handler answers through renderView, so an unrooted form drops #invite-form on the first 422 and strands every later submit on 2/2 bundles with a clean compile (F-B-107); 76 { invalid: } sites in 15/16 repos. Declare the region on the route def next to render (additive RouteDef key), let the verbs read it, give the handler a rooted 422 exit. Stays inside the render-stance precedent; L-142's hx defaults are not reopened.

Members (impact/pain/reach/effort, filed lane): F-B-107 2/2/3/M 8.2.0.

### C-55 · Bare setter calls become a compile error

Track A · lane 9.0.0 · enforcement type · score 6 = 2x3x2/M

181 of 187 setters that compile with no argument render nothing, and all 4 bare calls in the fleet are intent-losing bugs, 2 in everyframe-composer on 8.1.0 (F-A-404, L-164). Change `value?: T` to `value: T | undefined`: explicit-undefined clearing survives and a bare call becomes TS2554. 9.0.0 with a 4-site codemod needing human values.

Members (impact/pain/reach/effort, filed lane): F-A-404 2/3/2/M 9.0.0.

### C-56 · Move popovertarget and form setters to the elements that honor them

Track A · lane 9.0.0 · enforcement type · score 6 = 2x3x1/S

setPopovertarget, setPopovertargetaction and setForm sit on every Tag, but browsers honor popovertarget only on button/input (A, Div, Span, Li open 0/2 engines) and form= only on form-associated elements; the tag.ts:542 JSDoc and CHANGELOG.md:527 teach the inert <a> invoker (F-A-407, F-D-302). Move them so an <a> invoker is TS2339 like A().setCommand; 0 of 15 fleet sites move. Fix the JSDoc and example now.

Members (impact/pain/reach/effort, filed lane): F-D-302 2/3/1/S 9.0.0; F-A-407 2/2/1/S 9.0.0.

### C-57 · hxResponse converges on getHeaders(); build() stops returning HTML

Track A · lane 9.0.0 · enforcement type · score 6 = 2x3x2/M

hxResponse(view).build() returns rendered HTML as a plain string every View sink re-escapes, without the CSP nonce: the 1 non-Empty build() site in the fleet renders its page as escaped text, masked by a toContain test, while 67/68 sites need only headers (F-A-501). Drop html from build() in 9.0.0 (codemod to getHeaders(), 1 site to renderView) and delete the 'pre-rendered strings' renderView idiom now.

Members (impact/pain/reach/effort, filed lane): F-A-501 2/3/2/M 9.0.0.

### C-58 · Remove hxGet, hxPost and setHtmx(endpoint, opts)

Track C · lane 9.0.0 · enforcement type · score 6 = 2x2x3/M

One htmx request has six spellings: canonical app code uses the verbs for 98.8% and setHtmx for 1.2%, while hxGet, hxPost, hx() and setHtmx(endpoint, opts) sit at 0 canonical sites; the 115 hxGet/hxPost calls are all pre-7 and rewrite 115/115 with byte-identical output (F-C-301, F-C-107). L-220 is the zero-site removal precedent and L-228 rejected only a rename. Remove in 9.0.0, retarget prefer-htmx-api, delete ladder rungs 3-4.

Members (impact/pain/reach/effort, filed lane): F-C-301 2/2/3/M 9.0.0; F-C-107 2/1/3/S 9.0.0.

### C-59 · Typed lint names the intended token for a typo'd styling argument

Track B · lane 8.2.0 · enforcement lint · score 6 = 2x2x3/M

A typo'd token to a typed styling method gets no did-you-mean because TS2820 is gated off for top-level arguments: 7/7 typos print one line naming TailwindColor, while the same typo in a variant object gets one (F-B-209). No type mechanism reaches this path; a typed lint using the contextual type and ts.getSpellingSuggestion names the intended token in 5/7.

Members (impact/pain/reach/effort, filed lane): F-B-209 2/2/3/M 8.2.0.

### C-60 · prefer-htmx-api derived from the pinned htmx package; typed :inherited path

Track C · lane 8.2.0 · enforcement lint · score 6 = 3x2x2/M · high-impact

prefer-htmx-api is a 24-name hand list: htmx-2 names written through addAttribute pass tsc and all 32 rules and are inert on beta6 and 4.0.0 (F-C-202); htmx 4.0.0's own upgrade-check.py flags 11/13 with the successor, the plugin 1/13 (F-D-104). Its message steers a container hx-confirm to setHtmx, where Cancel still sends the DELETE on 4/4 bundles (F-A-607, L-102). Generate the name set from the pinned package (web-types, rename tables), report each htmx-2 name with its successor, redirect hx-swap-oob to Partial and container inheritables to :inherited; the typed :inherited path with :append for headers is the additive lib half.

Members (impact/pain/reach/effort, filed lane): F-C-202 3/2/2/S 8.1.x; F-D-104 2/2/2/M 8.2.0; F-A-607 3/2/1/S 8.2.0.

### C-61 · prefer-set-method and plugin vocab derived from the installed lib

Track C · lane 8.1.x · enforcement lint · score 6 = 2x2x3/M

prefer-set-method's 86-entry hand map is receiver- and type-blind: 8 of 13 probe autofixes and 408 of 2,245 fleet fix sites stop compiling (F-C-506, F-C-104), and 64-65 typed setters have no redirect, so 8 of 10 taught 'never addAttribute' cases pass lint (F-C-205, F-G-105). The plugin's committed vocab snapshot read by 6 rules has no gate (F-D-510). Derive the map (owner class, parameter type) and the vocab at load, autofix only when the receiver owns the setter and the value fits, delete the per-attribute prose.

Members (impact/pain/reach/effort, filed lane): F-C-506 2/2/2/M 8.2.0; F-C-104 2/2/2/S 8.1.x; F-C-205 2/2/2/S 8.1.x; F-G-105 2/1/3/S 8.2.0; F-D-510 2/2/1/S 8.2.0.

### C-62 · Typed-surface bypass lints generated from class-vocab

Track C · lane 8.2.0 · enforcement lint · score 6 = 2x2x3/M

Three typed-surface bypasses no layer flags: static setStyle with a typed method at 12 of 23 canonical sites because the rule's 4 hand tables miss 9 of 19 probed properties (F-C-303); SVG paint as 116 hex constants in 6 pre-kit charts.ts copies and 10 addAttribute('pointer-events') sites (F-C-603); 61 of 106 canonical .cssProp() sites spelling a named Tailwind utility, 11 of them scroll-margin-top after scrollM was pruned at 0 sites (F-D-205, L-159/L-223). Generate the property -> method table from class-vocab, extend the rule to cssProp and SVG paint, promote the evidenced vocab rows.

Members (impact/pain/reach/effort, filed lane): F-C-303 2/2/2/M 8.2.0; F-C-603 2/1/2/M 8.2.0; F-D-205 1/1/3/S 8.2.0.

### C-63 · One attribute precedence at serialize, dev throw on collision

Track A · lane 8.1.x · enforcement dev-throw · score 6 = 2x3x1/S

Attribute collisions serialize three ways: 280 of 299 typed (setter, attribute) pairs emit a duplicate attribute when addAttribute writes the same name, the hx-* bag beats setHtmx 2/2, and only id/class/style deduplicate (F-C-505, F-A-507, L-066/L-021). One precedence at serialize, each name once with the typed value first, and a dev throw on a collision; 0 canonical same-chain sites. The compile-time half is C-31.

Members (impact/pain/reach/effort, filed lane): F-C-505 2/3/1/S 8.1.x; F-A-507 2/2/1/S 8.2.0.

### C-64 · Validate element names in El()

Track A · lane 8.1.x · enforcement runtime · score 6 = 3x2x1/S · high-impact

El(name) is the one markup-name sink without validation: 3/3 element-name payloads execute in Chromium past the on* block that 6/6 attribute-name sinks enforce, and tela renders a stored, user-supplied tag through El() as an img with onerror and no CSP (F-A-605). Validate in El() (and the Tag constructor under dev checks) with validateAttributeKey's throw stance; only names that never produced well-formed HTML change (guardrail 3).

Members (impact/pain/reach/effort, filed lane): F-A-605 3/2/1/S 8.1.x.

### C-65 · Explicit undefined clears every Tag-level setter; boolean download fixed

Track A · lane 8.1.x · enforcement runtime · score 6 = 2x3x1/S

set*(undefined) has four meanings across 172 setters, and setPopover(undefined) emits popover=auto, hiding the element in Chromium (F-C-504); setDownload(true/false) saves the file as true.txt / false.txt, with 0 of 15 fleet sites passing a boolean (F-A-405, L-029). Explicit undefined clears on all 8 Tag-level setters (a bare call keeps its default), true renders bare download and false omits it, pinned by a set-then-undefined parity test.

Members (impact/pain/reach/effort, filed lane): F-C-504 2/3/1/S 8.1.x; F-A-405 2/2/1/S 8.1.x.

### C-66 · Sibling separator stops rendering a space before punctuation

Track A · lane 8.1.x · enforcement runtime · score 6 = 2x2x3/M

The newline sibling separator renders a visible space before punctuation after an inline element at 31 canonical sites in 9 repos (7/7 sampled reproduce in Chromium), and 5 repos drop to Raw(render()) or restructure to avoid it (F-A-504, L-030). 743 sibling pairs rely on the separator, so omit it only next to a text sibling starting with closing punctuation or ending with an opening bracket (19 of 31 sites) and flag the 12 tag-wrapped cases by lint.

Members (impact/pain/reach/effort, filed lane): F-A-504 2/2/3/M 8.1.x.

### C-67 · Safari closedby fallback in the behaviors runtime (reopens ADR-06 / S-21)

Track D · lane decision-gated · guardrail 10 · enforcement runtime · score 6 = 2x2x3/M

setClosedby('any') is taught as complete light-dismiss, but backdrop click closes the dialog 0/2 without closedby and Safari 27 ships none (BCD 8.1.3 preview); 21 sites in 11 repos, 0/20 files with a fallback (F-D-301). The fix is a feature-detected close in the behaviors runtime, which reopens ADR-06 (dialogs are not behaviors) under the S-21 behavior-v4 lock (guardrail 10 row) and needs the L-260 size call (6108 of 6144 B after C-03). Its Safari evidence needs C-87's system-engine column. Not designed.

Members (impact/pain/reach/effort, filed lane): F-D-301 2/2/3/M decision-gated.

### C-68 · Generated both-direction union pins with a widen-mutation CI check

Track B · lane 8.1.x · enforcement ci · score 6 = 2x2x3/M

153 of 236 closed unions in the shipped d.ts widen to an open tail with every test green, covering 47 methods with 33,640 fleet call sites (F-B-501); 22 of 27 htmx unions have no reject pin, HxStatusKey included (F-B-509); 4 of 14 open unions state no reason and 8 have no accept pin (F-B-505, L-077). Generate a both-direction pin file from the rows gen:vocab and the setters are built from, add the widen-mutation harness to CI, require a reason and an accept pin for every open tail.

Members (impact/pain/reach/effort, filed lane): F-B-501 2/2/3/M 8.1.x; F-B-509 2/2/2/S 8.1.x; F-B-505 1/1/2/S 8.1.x.

### C-69 · Verify the type contract on TypeScript 6.0.3 and 7

Track D · lane 8.1.x · enforcement ci · score 6 = 2x2x3/M

The type contract is verified on TypeScript 5.9.3 only: the lib tsconfig fails with 214 errors on 6.0.3, which 15/15 canonical apps run (0 with types ['node']); the diagnostic pins call ts.createProgram, which typescript 7.0.2 (npm latest) does not export, and 5/5 brand-probe texts change on 7.0.2 (F-D-602). Pin 6.0.3 with types ['node'], run pins through tsc CLI output with union-order-insensitive matching, add a TS 7 job.

Members (impact/pain/reach/effort, filed lane): F-D-602 2/2/3/M 8.1.x.

### C-70 · Compile the lib's README, REFERENCE, @example blocks and examples/ in CI

Track G · lane 8.1.x · enforcement ci · score 6 = 2x2x3/M

The lib's own docs teach failing code: README has 4 claims that fail when executed and 5 links the package omits (F-C-401); REFERENCE.md has 52 lines failing TS2345 on raw routes plus 5 dead htmx options (F-C-408); 13 of 93 JSDoc @examples fail the template lint (F-D-508); 5/5 examples/ fail because src re-exports 3 interfaces as values (F-G-109; L-374 fixed only a test import). Compile README/REFERENCE/@example blocks against dist in CI, byte-check output comments, enable isolatedModules, run examples/. Critic gap G-2 (TAILWIND-SETUP.md is a v3 pipeline) belongs here with no finding.

Members (impact/pain/reach/effort, filed lane): F-C-401 2/2/3/S 8.1.x; F-C-408 2/2/1/M 8.1.x; F-D-508 2/2/3/S 8.1.x; F-G-109 1/2/1/S 8.1.x.

### C-71 · Extractor 3.0.0 safelist: derived manifest, validated against the app's Tailwind

Track D · lane 8.2.0 · enforcement boot · score 6 = 2x2x3/M

Before the extractor's 3.0.0 release its safelist over- and under-reaches: themeToManifest force-lists every token x a hand-kept prefix list, 8,508 dead classes across 15 apps and 67% of the template's CSS bytes (F-A-210); nothing asks the app's Tailwind whether a class compiles, so 18/18 typed-invalid probe classes are safelisted with 0 rules, while a candidatesToCss pass costs 50 ms over 16 apps (F-D-207, L-278). Derive any prefix list from class-vocab, drop the unconditional manifest, add an onInvalidClass policy.

Members (impact/pain/reach/effort, filed lane): F-A-210 1/1/3/S 8.2.0; F-D-207 2/2/1/M 8.2.0.

### C-72 · Replay the frozen pure-prior runs in CI

Track C · lane 8.1.x · enforcement ci · score 6 = 2x2x3/M

Against 8.1.0 all 16 pure-prior divergence kinds recur in both runs; 44-50% of non-class sites get a one-shot redirect and 10-31% get none (F-C-207). Freeze pp1/pp2 and replay them in template and plugin CI: lint --fix then tsc must not raise the error count, every kind must be reported by some layer, every named fix must compile. The real-prior form of C-06's contract.

Members (impact/pain/reach/effort, filed lane): F-C-207 2/2/3/M 8.1.x.

### C-73 · Compile every taught guideline block in a template CI lane

Track G · lane 8.1.x · enforcement ci · score 6 = 2x2x3/M

No lane compiles taught code: F-G-101 compiled 203 fenced blocks and finds 24 ✓/unmarked lines failing tsc against 8.1.0 + template and 47 ✗ lines held by no layer; F-C-208 and F-C-406 measure the same corpus with other harnesses (34 of 163, 5 of 127), and the corpus grew 153 -> 176 blocks after the scorecard asked for pointers. 8 of 28 rendered output claims are false (F-G-104). Pin F-G-101's harness as a template root test, add an output-assertion pass, move ✓/✗ pairs into compiling fixtures with pointers.

Members (impact/pain/reach/effort, filed lane): F-G-101 2/2/3/M 8.1.x; F-C-208 2/2/3/M 8.1.x; F-C-406 2/2/3/L 8.1.x; F-G-104 2/2/2/S 8.1.x.

### C-74 · Shrink always-loaded prose and pin a token budget in CI

Track G · lane 8.1.x · enforcement ci · score 6 = 2x2x3/M

The always-loaded prose grew 4,438 tokens (+29.3%) after the scorecard priced it at zero, buying -0.56 tsc errors per 1,000 tokens at best and 0 in-repo; 33/33 template imports it names are guessed wrong (F-C-602, L-339/L-345). Its teaching includes 57 lines for htmx spellings at 0 canonical sites (F-C-308), 48 zero-use names on 70 lines (F-C-410), 7 control-flow ✗ lines for shapes at 19 of 1,601 sites (F-C-310), and a Match shape the lint rejects at error (F-D-505); F-G-110 says do not gate on exemplars (32/32 have lib tests). Delete those lines and pin a CLAUDE.md token budget at or below fd0ae85 in template CI (guardrail 12).

Members (impact/pain/reach/effort, filed lane): F-C-602 2/2/3/M 8.1.x; F-C-308 2/2/3/M 8.2.0; F-C-410 1/1/1/S 8.1.x; F-C-310 1/1/3/S 8.2.0; F-D-505 2/2/3/S 8.1.x; F-G-110 1/1/3/S parked.

### C-75 · CHANGELOG check per repo

Track D · lane 8.1.x · enforcement ci · score 6 = 1x2x3/S

Release records omit what consumers need: the 8.1.0 entry omits render 'none', RootedView and the rooted Partial that 15/15 8.1.0 repos use (F-C-405); the htmx beta6 pin move and the extractor's stale-dist fix are unlogged and an Unreleased 7.0.0 header sits below 6 released ones (F-D-605). A per-repo check: header order, version present, pin moves and new src/index.ts exports recorded.

Members (impact/pain/reach/effort, filed lane): F-C-405 1/2/3/S 8.1.x; F-D-605 1/1/2/S 8.1.x.

### C-76 · Exported message-literal Rooted/Id gate; cheaper RootedView

Track B · lane 8.2.0 · enforcement type · score 4 = 2x2x2/M

The 8.1.0 widened-Id gate exists only as a test fixture: renderFragment, .fragment and .search accept Id<string> and check no root and no route (0/15 fleet declarations gated, 4/4 wrong-root probes compile) (F-B-102, F-B-403); wrong-root shapes report 2-7 lines naming no fix (F-B-106, L-080); the lib's three widening gates answer with a bare never. RootedView's intersection costs 11.9% of types in the largest 8.1 app (F-B-404). Export one message-literal gate, re-encode RootedView as a conditional over Tag, guard with an instantiation-budget test.

Members (impact/pain/reach/effort, filed lane): F-B-102 2/2/2/S 8.1.x; F-B-106 2/2/2/S 8.1.x; F-B-403 2/2/1/M 8.2.0; F-B-404 2/1/2/S 8.2.0.

### C-77 · Class-level Tailwind coverage and variants from getVariants()

Track D · lane 8.2.0 · enforcement type · score 4 = 2x2x2/M

The Tailwind coverage watch counts by root prefix: 214 watch-covered roots have 0 typed-reachable classes, and a 4.1.18 -> 4.3.3 replay passes 27 of 114 new roots silently (F-D-203). .variant() rejects 156 of 331 valid 4.3.3 variants, including the 8 media variants of 4.1 and max-*, with 7 workaround sites in 5 canonical repos (F-D-204, L-173). Class-level coverage through the checker, variant unions and the plugin head table generated from getVariants(), and a variant watch.

Members (impact/pain/reach/effort, filed lane): F-D-204 2/2/2/M 8.2.0; F-D-203 2/2/2/M 8.2.0.

### C-78 · Export the Styler type the README teaches

Track G · lane 8.2.0 · enforcement type · score 4 = 1x2x2/S

README teaches the Styler type, which fluent-html does not export (bare TS2304; 0 of 335 root exports), and the guideline's reason to prefer it over (t: Tag) is refuted (apply returns this) (F-G-107, L-165). Export type Styler/StylerFor (types only) so the README compiles and the template deletes its copy; delete the false chain-break sentence.

Members (impact/pain/reach/effort, filed lane): F-G-107 1/2/2/S 8.2.0.

### C-79 · f.input rejects 'checkbox' and 'radio'

Track G · lane 9.0.0 · enforcement type · score 4 = 2x2x2/M

The taught ✗ f.input(name, 'checkbox'|'radio') passes tsc and lint and renders value without checked; 10 fleet sites write it, 7 in canonical everyframe-composer (F-G-108). Exclude both from FormBinding.input's type with an error naming f.checkbox / f.radio in 9.0.0 (10-site codemod); an 8.2.0 lint holds it until then.

Members (impact/pain/reach/effort, filed lane): F-G-108 2/2/2/M 9.0.0.

### C-80 · defineIds camelCase: README fix, lint, then a type

Track C · lane 9.0.0 · enforcement type · score 4 = 2x2x2/M

defineIds emits camelCase names verbatim while README.md:157-158 claims kebab output (reproduced by the critic); docs teach camel input in 4 places and kebab in 8, and 109 of 305 app-authored entries in 6 of 15 8.1.0 repos are camelCase (F-C-407). Fix the README now (C-70), lint in 8.2.0, reject uppercase by type with the kebab form named in 9.0.0 (109-entry codemod).

Members (impact/pain/reach/effort, filed lane): F-C-407 2/2/2/M 9.0.0.

### C-81 · Setter casing rename (F-D-160, L-144) stays parked

Track C · lane parked · enforcement type · score 4 = 2x2x2/M

Five findings measure the parked rename (F-D-160, L-144) and disagree on direction: 20/20, 22/22 and 33/33 case-only guesses self-heal in one TS2551 hop (F-C-108, F-C-409, F-C-210); only 3 of 158 setters break the mirror-the-attribute rule, so F-D-160's list is wrong (F-C-307); unprimed runs write the DOM IDL name 5/5 (20 misses per first write) while primed runs miss only the 3 outliers (F-C-501). Parked: the heal already redirects in one hop, C-47 removes the multi-round cost, and any rename is a 9.0.0 codemod (59 sites for the outliers, 390 for the IDL direction). Reopen if a prior probe shows casing misses surviving that lint.

Members (impact/pain/reach/effort, filed lane): F-C-501 2/2/2/M 9.0.0; F-C-409 1/1/2/S 9.0.0; F-C-307 1/1/1/S parked; F-C-108 1/1/2/S parked; F-C-210 1/1/1/M parked.

### C-82 · One meaning for a bare selector token (L-063)

Track B · lane decision-gated · guardrail 4 · enforcement type · score 4 = 2x2x1/S

A bare token means #id in Partial('team-list') and a <team-list> tag selector in hx(..., { target: 'team-list' }); on 2/2 bundles the hx() miss swaps the trigger itself and leaves duplicate ids (F-B-309, L-063). One rule for every selector sink either applies Partial's # convenience at runtime or closes the string arm by type, which is L-063's open call on the type-safety guardrail. 0 bare-token targets in 8.x. Not designed.

Members (impact/pain/reach/effort, filed lane): F-B-309 2/2/1/S decision-gated.

### C-83 · Dev-check coverage and activation

Track A · lane 8.1.x · enforcement dev-throw · score 4 = 2x2x1/S

.behavior() is the one public mutator of 506 outside the dev mutation gate, and dev-checks.test.ts pins 3 of 506 (F-A-303); the aliasing guard misses 4 of 5 probe shapes, including one tag returned per ForEachKeyed item (F-A-304, L-051 new evidence, fleet reach 0); dev checks latch NODE_ENV at import, before the template's dotenv runs (F-D-405, reproduced by the critic). Gate .behavior(), sweep every mutator in a test, reject a Tag returned twice from one iteration, resolve the default lazily.

Members (impact/pain/reach/effort, filed lane): F-A-303 2/1/1/S 8.1.x; F-A-304 2/2/1/S parked; F-D-405 2/2/1/S 8.1.x.

### C-84 · Duplicate ids throw under dev checks; prefixed ForEachKeyed keys

Track A · lane 8.2.0 · enforcement dev-throw · score 4 = 2x2x2/M

ForEachKeyed writes the raw key as a page-global id: two keyed lists sharing a key emit duplicate ids and the keyed morph keeps 0/4 rows on beta6 and 4.0.0, popri's MentorWall renders one id twice, 66/77 fleet keyOf return a raw field, and 5/5 teaching examples key by raw u.id (F-A-604). A per-render duplicate-id dev check catches this, C-16's group ids and C-83's shared-row case with one Set walk; the examples switch to a prefixed key.

Members (impact/pain/reach/effort, filed lane): F-A-604 2/2/2/M 8.2.0.

### C-85 · Derive htmx config, location and event types from the pinned htmx.d.ts

Track D · lane 8.2.0 · enforcement ci · score 4 = 2x2x2/M

HtmxGlobalConfig, HxLocationConfig, method and trigger types are a hand-copied beta4 snapshot (13 config keys vs 23 in 4.0.0, with inlineStyleNonce dropped upstream); 3 bumps changed 20 names and fluent reflected 0 (F-D-103). HX-Location cannot express push/replace (honored by 4.0.0) and types a handler with 0 readers (F-D-105). A gen:htmx --check reading the pinned htmx.d.ts and web-types; additions in 8.2.0, removals in 9.0.0.

Members (impact/pain/reach/effort, filed lane): F-D-103 2/2/2/M 8.2.0; F-D-105 2/2/1/S 8.2.0.

### C-86 · Type-aware extractor mode

Track A · lane 8.2.0 · enforcement boot · score 4 = 2x2x2/M

Extractor text matching fails the default build in 4/16 canonical apps with 13 false ledger rows (9 inside string literals, 4 on non-fluent receivers), and the apps hand-exclude 56 files from the safelist glob (F-A-203, L-266). A checker-backed scan of the same 16 apps gives 0 false rows and 0 misses in 32.5 s using each app's existing typescript devDependency. Type-aware mode; as a floor, stop scanning string contents.

Members (impact/pain/reach/effort, filed lane): F-A-203 2/2/2/M 8.2.0.

### C-87 · Safari column from the system engine, not Playwright WebKit

Track D · lane 8.1.x · enforcement ci · score 4 = 2x2x2/M

Playwright WebKit is not a Safari oracle: the pinned build (r2311) has 2 of 4 tested features the Safari 26.6.2 engine lacks, npm-latest Playwright (r2359) has 4/4, and its backdrop-click row passes closedby light-dismiss Safari does not ship (F-D-603, L-261). Keep Playwright WebKit as a trunk preview, take the Safari column for platform rows from the system engine (WKWebView probe on a macOS runner), pin Playwright exactly.

Members (impact/pain/reach/effort, filed lane): F-D-603 2/2/2/M 8.1.x.

### C-88 · Peer ranges, Tailwind floor and a loadable, tested recommended preset

Track D · lane 8.2.0 · enforcement boot · score 4 = 2x2x1/S

Declared compatibility does not match what is tested: the plugin's eslint peer admits 8.39 where 5/32 rules throw, its recommended preset throws at load on ESLint 10.11 (16/16 installs), and the extractor's '*' peer admits fluent-html 6.5.0, which dies at import (F-D-509, L-279/L-335); the typed surface needs tailwindcss >= 4.2.0 (194 classes dead on 4.1.18) and nothing declares it (F-D-206); recommended ships 6 rules the template removed as unreachable and 4 rules with 0 tests (F-D-606). Declare tested ranges, mirror the 3.6.1 removals, type-check fixtures in CI.

Members (impact/pain/reach/effort, filed lane): F-D-509 2/2/1/S 8.1.x; F-D-206 2/2/1/S 8.2.0; F-D-606 1/1/1/S 8.1.x.

### C-89 · Undeclared routes stop escaping the fragment-stance check

Track B · lane 8.2.0 · enforcement type · score 3 = 3x2x1/M · high-impact

An undeclared route in a conditional escapes the fragment-stance check at .fragment, .poll and .search in either arm order (4/4 compile) and morphs a page into the fragment slot on 2/2 bundles; 885 of 1,324 app route defs declare no render (F-B-103, L-092). An additive phantom stance key, distributive over undefined, rejects 4/4 with 0 lib and 0 template errors, without inference through generic wrapper calls (guardrail 4).

Members (impact/pain/reach/effort, filed lane): F-B-103 3/2/1/M 8.2.0.

### C-90 · preserve, boost, swapOob leave the request-shaped HTMX bag

Track A · lane 9.0.0 · enforcement type · score 3 = 2x3x1/M

preserve, boost and swapOob ride the request-shaped HTMX bag and arrive with a forced hx-<verb>: preserve:false preserves on 4/4 bundles, boost:true swaps the next page into the link, and swapOob content fires GET to an invented endpoint (F-A-110, L-009). Take them off the bag (0 typed fleet sites) and give them endpoint-free element setters with presence semantics in the 9.0.0 bundle.

Members (impact/pain/reach/effort, filed lane): F-A-110 2/3/1/M 9.0.0.

### C-91 · One spelling per variant: drop 5 dead tier-1 names, freeze the live tail

Track C · lane 9.0.0 · enforcement type · score 3 = 1x1x3/S

The tier-1 set has a dead half and a second spelling: after/checked/dark/even/odd have 0 uses on every channel with a byte-identical .variant() successor (F-C-106, L-226 rejected only as scope), and .variant('group-hover' and 3 more) duplicates tier-1 methods at 14 canonical sites, byte-identical 14/14 (F-C-604). active/first/last/before are live on two channels (24 sites) and the nested key is the only working typed spelling of <state>:before: in Chromium (F-C-605), so they freeze and `after` keeps its key if it goes. Drop the 5, exclude tier-1 prefixes from .variant() naming the method (keep 2xl per L-224), codemod 14 sites, delete the list prose.

Members (impact/pain/reach/effort, filed lane): F-C-106 1/1/3/S 9.0.0; F-C-604 1/1/2/S 9.0.0; F-C-605 1/1/2/S parked.

### C-92 · Pick the CSP-nonce survivor: renderWithNonce or the options bag

Track C · lane decision-gated · guardrail 7 · enforcement type · score 3 = 1x1x3/S

The CSP-nonce options bag has 0 call sites in 58 repos while renderWithNonce and renderToStreamWithNonce carry all 89, and the bag accepts exactly one view (TS2353 with a second) (F-C-305). L-230 rejected the named-only form to keep one RenderOptions; L-141 is decision-gated. Picking the survivor is the converge call: delete the nonce-only overload (0 sites) or widen render to (...views, opts) and codemod 89 sites. Not designed.

Members (impact/pain/reach/effort, filed lane): F-C-305 1/1/3/S decision-gated.

### C-93 · Which component layer survives: @jtdigital/ui or src/shared/ui

Track C · lane decision-gated · guardrail 5 · enforcement prose · score 3 = 3x2x1/M · high-impact

@jtdigital/ui, the component home S-05 and L-411 name, has 0 consumers in 58 repos and fails 36 lint errors because it is written in the losing styling path (F-C-306); consumed as a dependency its classes vanish, because the extractor skips node_modules and 11 of its 47 classes come from neither the template glob nor the manifest (F-A-209). Retiring it or rewriting it with a published safelist changes the package the instruction-set guardrail names; the safelist path is designed only if it survives. Not designed.

Members (impact/pain/reach/effort, filed lane): F-C-306 2/1/1/S decision-gated; F-A-209 3/2/1/M 8.2.0.

### C-94 · Typed open arms that compile to no CSS

Track D · lane 8.2.0 · enforcement type · score 2 = 2x2x1/M

Typed open arms admit classes that compile to no CSS on Tailwind 4.3.3: 101 classes from 5 arm shapes in 13 methods (F-D-201), bracket arms that split on whitespace and resolve an untyped var() to the color arm of 6 merged prefixes (F-A-206), and color modifiers Tailwind drops (/0.1) or renders transparent (/150) (F-A-207). 0 fleet sites for all three. Narrow the arms, encode bracket whitespace through cssPropValue, make the oracle enumerate every typed union.

Members (impact/pain/reach/effort, filed lane): F-D-201 2/2/1/S 8.2.0; F-A-206 2/2/1/S 8.1.x; F-A-207 2/2/1/S 8.2.0.

### C-95 · Rooted<N> soundness: Partial outer swap and re-rooting

Track B · lane 8.2.0 · enforcement type · score 2 = 2x2x1/M

Two holes in Rooted<N>: Partial(ids.x, content) brands Rooted<x> even when its outer swap replaces #x with unrooted content, and type-surface.test-d.ts:638,640 pin the unsound case (F-B-104); a second setId leaves a stale Rooted<N> every RootedView consumer accepts (F-B-105). 11/11 fleet Partial contents rooted, 0 live re-roots in 459 setId sites. Split Partial's overload by swap style, add a this-typed setId overload.

Members (impact/pain/reach/effort, filed lane): F-B-104 2/2/1/S 8.2.0; F-B-105 2/2/1/M 8.2.0.

### C-96 · Platform additions with engine support and no demand

Track D · lane parked · enforcement type · score 1 = 1x1x1/S

Three additions with engine support and 0 fleet demand: autocorrect is Baseline since 2026-09-11 with no typed path while the guideline forbids addAttribute for editing globals (F-D-306), popover='hint' ships in 2 of 3 engines (F-D-307, L-272), and <selectedcontent> is the only non-deprecated element without a factory, composable via El() (F-D-308, L-276). Parked under S-23 with engine triggers watched by C-51; F-D-306's contradiction is closed by naming autocorrect as the sanctioned addAttribute case.

Members (impact/pain/reach/effort, filed lane): F-D-306 1/1/1/S parked; F-D-307 1/1/1/S parked; F-D-308 1/1/1/S parked.

## Drop ledger

0 findings dropped. Checks run on all 194:

| Rule | Result |
|---|---|
| Number or `file:line` measure | 194/194 carry a non-empty `measure`. |
| Critic reproduction | 9 spot-checks (11 ids) re-executed, 0 failed; `weak_findings` empty. F-A-107 reproduces with fleet reach 0, kept at reach 1 in C-03. |
| Ledger duplicate without new evidence | Every finding with a `prior` names a measure that post-dates the row. Re-raises of closed rows name why the disposition no longer holds: F-A-102 (L-059: closure stands, cause false), F-A-403 and F-G-104 (L-055: fix left a replace hazard and stale teaching), F-C-403 and F-G-103 (L-379: fix reached one of two copies), F-C-404 (L-376: never regenerated), F-C-106 (L-226: rejected as scope, not merits), F-C-305 (L-230: premise holds in type, 89:0 in use), F-D-402 (L-319: different shape, perf data L-319 lacked), F-A-304 (L-051: guard defect, disposition kept), F-D-106 (L-217: disposition kept, record corrected). Prior-none findings matched against the 436-row index by title and primary evidence: F-A-503 is a different symbol from L-030 (parser LF strip, not the separator), F-G-109 a different site from L-374 (src re-export, not the test import), F-A-506 a different sink set from L-137. |
| Shipped-since | 0 findings are themselves shipped-since. |
| In-run duplicates | Merged, not dropped: F-D-101/F-D-502, F-A-201/F-A-301, F-A-205/F-A-401, F-A-407/F-D-302, F-A-506/F-B-303, F-A-507/F-C-505, F-B-207/F-B-307, F-B-206/F-B-308, F-B-101/F-B-201/F-B-302/F-B-506, F-C-201/F-D-202, F-C-203/F-D-504, F-C-107/F-C-301, F-C-403/F-G-103, F-C-108/F-C-210/F-C-307/F-C-409, F-C-208/F-C-406/F-G-101. |

## Critic gaps and seeds not clustered

- **B-1, model-in-the-loop.** 0 of 47 B findings measure whether a better error changes agent behavior; B-reseed made 0 model runs without the user's approval. Every "fix on line 1" claim in C-01, C-08, C-12, C-42, C-49, C-52 is a character position. Needs explicit approval for agent runs before Wave 3's agent-fitness lens can execute it.
- **G-1, fleet vendored guideline copies.** 15 of 17 checked CLAUDE.md files still teach the executed-false back claim; no finding covers a fleet sync mechanism. C-25 fixes the lib's copy only.
- **G-2, TAILWIND-SETUP.md.** Linked as "Tailwind v4 build wiring" but teaches v3; the critic's run fails every step on Tailwind 4. No finding filed; belongs in C-70's lane.
- **A gap 5, overflow silent failures.** setStyles kebab-cases custom-property keys (0 of 2,000 fleet entries affected) and a Partial with an absent target is a silent no-op (0 of 11 canonical calls affected): A-reseed measured reach 0 and parked both; El() is filed (F-A-605, C-64).
- **Recon 04 side-finding 1.** fluent-html project/pm/roadmap.md Current Focus is still the 6.4.0 publish (0c4aa37); C-36 covers only decisions.md:94.
- **Recon 04 side-finding 10.** `{ confirm }` on the swap verbs is P2 backlog in agent-fitness/todo.md:134 but ruled Out in swap-verbs/decisions.md:43; contradiction unfiled.
- **Overflow not promoted.** Concrete but outside a cluster's change or at reach 0: hxResponse header ERR_INVALID_CHAR on non-ASCII arms (loud 500, not silent), no-raw-ids evaded by a const id object (pp1, 0 reports), renderView(fragment, Partial) skipping the stance check (6 canonical sites; adjacent to C-43, needs its own probe), behavior/setAria per-element cost (D4, few sites per page).
