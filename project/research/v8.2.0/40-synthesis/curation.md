# Curation (Wave 3.5)

> **Decided 2026-10-01** by the user: "go with recommendations". Undesigned clusters not marked `design` are `defer` (they stay in the seen set for the next run). Round-2 RFCs (section E) decided 2026-10-01: "include all".

The user's decisions. Wave 4 synthesis reads **only** this file. Fill the **Decision** column:

- RFCs: `include` · `cut` · `modify: <what>` · `defer`. `include` means the RFC *plus every verdict's required changes* ([../30-verification/_summary.md](../30-verification/_summary.md)).
- Undesigned clusters: `design` (goes to a second design + verify round before synthesis) · `defer` · `cut`.
- Decision-gated: `reopen` (then design) · `keep guardrail`.

Source: run `wf_0943e427-51c`: 194 findings ([10-discovery/](../10-discovery/)), 96 clusters ([_clusters.md](../10-discovery/_clusters.md)), 0 dropped, critic in [_critic.md](../10-discovery/_critic.md).

## A. Designed and verified (8)

All 8 survive with changes; no rejects.

| RFC | Title | Lane | Enforcement | Score | Required changes | Decision |
|---|---|---|---|---|---|---|
| [RFC-B-01](../20-design/track-b-contracts/RFC-B-01.md) | Swap verbs name the route-callable fix for a raw route; dev throw on a request-less bag | 8.1.x | type | 27 | 22 | include |
| [RFC-D-01](../20-design/track-d-platform/RFC-D-01.md) | Dynamic-arg tool messages stop prescribing staticManifest and print a fix that clears the error, per argument shape | 8.1.x | lint | 18 | 8 | include |
| [RFC-A-01](../20-design/track-a-silent-failures/RFC-A-01.md) | Behaviors runtime: dismiss only what was showing when the click began, own every Tab in a trapped drawer, read the htmx-4 swap detail | 8.1.x | runtime | 18 | 24 | include |
| [RFC-D-02](../20-design/track-d-platform/RFC-D-02.md) | .search emits sync "queue last" while the served htmx 4.0.0 lets a replaced request free its replacement's slot; an asymmetric-latency smoke row and a bundle tripwire mark the way back to "replace" | no-change | runtime | 18 | 2 | include (template-only) |
| [RFC-A-02](../20-design/track-a-silent-failures/RFC-A-02.md) | templates/web emits no htmx: native form action and anchor href, a no-htmx lint every scaffold carries, and a rendered-page check | no-change | lint | 18 | 6 | include (template-only) |
| [RFC-C-01](../20-design/track-c-surface/RFC-C-01.md) | no-tailwind-in-raw-class: an oracle-swept fix contract (every autofix type-checks and renders its class); no-method utilities get a .cssProp redirect | 8.1.x | lint | 13.5 | 6 | include |
| [RFC-A-03](../20-design/track-a-silent-failures/RFC-A-03.md) | Executed htmx-bundle oracle in lib CI (completeness-gated, known-defect ratchet, pin + template-served bundle); correct the records name-grep produced | 8.1.x | ci | 13.5 | 9 | include |
| [RFC-A-04](../20-design/track-a-silent-failures/RFC-A-04.md) | Trap members for .colspan, .rowspan and .inert, plus a cell-only colSpan/rowSpan trap, so the first diagnostic names the attribute setter | 8.2.0 | type | 12 | 6 | modify: drop Part B (Td/Th colSpan/rowSpan narrowing rejects working col-span-2 in grid rows); keep the traps + add setInert |

## B. Designable clusters not designed (82, cut by the design cap of 8)

Sorted by score (impact × pain × reach / effort). ★ = high impact. Full rationale and member findings in [_clusters.md](../10-discovery/_clusters.md).

| Cluster | Track | Lane | Enforcement | Score | Title | Findings | Decision |
|---|---|---|---|---|---|---|---|
| C-09 | B | 8.2.0 | type | 12 | htmx unions admit working htmx-4 modifiers and drop dead open-tail literals | F-B-405, F-A-109 | design |
| C-10 | B | 8.2.0 | type | 12 | Optional-boolean gates in IfThen and .when name x === true | F-B-606 | defer |
| C-11 | G | 8.2.0 | type | 12 | Numeric children render: View admits number (L-025) | F-G-106 | defer |
| C-12 | B | 8.2.0 | type | 12 | Branded route sinks print the three sanctioned producers on line 1 | F-B-206, F-B-308 | design |
| C-13 | C | 8.1.x | lint | 12 | setClass-family and ternary rules re-derived from the 8.x surface, fixes that compile | F-D-507, F-C-206 | defer |
| C-14 | C | 8.2.0 | lint | 12 | Class hooks converge on cssClass: fix the copied exemplars, lint first-write setClass | F-C-302 | defer |
| C-15 | C | 8.1.x | lint | 12 | Type-scale guard matches .text(unit, n); prefer-unit-overload stops steering to it | F-C-601 | defer |
| C-16 ★ | A | 8.1.x | dev-throw | 12 | Form<T>: checkbox groups bind by membership; dev throw on a second builder | F-A-603, F-G-102 | design |
| C-17 | A | 8.1.x | runtime | 12 | Quote hx-status values so spaced targets and swap modifiers survive | F-A-103 | design |
| C-18 ★ | A | 8.1.x | runtime | 12 | js: and javascript: in htmx-evaluated sinks: sanitize hx endpoint and HxResponse URLs | F-A-506, F-B-303 | design |
| C-19 | A | 8.1.x | runtime | 12 | JSON-typed Script bodies escape '<' so data cannot open a script | F-A-502 | design |
| C-20 | D | 8.1.x | runtime | 12 | Object-variant hot loop rewrite recovers the 7.0.0 construction regression | F-D-401 | defer |
| C-21 | D | 8.1.x | runtime | 12 | Compile route templates once instead of a RegExp per param per call | F-D-402 | defer |
| C-22 | A | 8.1.x | runtime | 12 | Anchor emitters keep their own style slot; teach implicit anchoring | F-A-403, F-D-305 | defer |
| C-23 | B | 8.1.x | ci | 12 | Run the palette opt-out type project in CI | F-B-508 | defer |
| C-24 | B | 8.1.x | ci | 12 | canonical-names codemod runs to a fixpoint | F-B-604 | defer |
| C-25 | G | 8.1.x | ci | 12 | fluent-html's own CLAUDE.md and .ai/ copy: CI drift check and a pointer | F-C-403, F-G-103 | defer |
| C-26 | D | 8.1.x | ci | 12 | Bench gate runs in CI and times construction | F-D-403 | defer |
| C-27 | D | 8.1.x | ci | 12 | Verified htmx converges on 4.0.0: one pin constant, delta rows, app-pin check | F-D-101, F-D-502, F-D-102 | defer |
| C-28 | D | 8.1.x | boot | 12 | Documented npm installs resolve stale or missing packages: publish or deprecate | F-D-506 | defer |
| C-29 | C | 8.2.0 | type | 9 | Palette literal under opt-out names the role tokens; lint stops autofixing into it | F-C-204, F-B-208 | defer |
| C-30 | A | 9.0.0 | type | 9 | Remove the six inert HxSwap modifier members, codemod-first | F-A-105 | defer |
| C-31 | B | 9.0.0 | type | 9 | addAttribute key type redirects typed and reserved keys to their setter | F-C-304, F-B-207, F-B-307 | defer |
| C-32 ★ | C | 9.0.0 | type | 9 | 9.0.0 surface prune with verified successors, gated on post-prune guesses | F-C-101, F-C-103, F-C-309, F-C-606 | design |
| C-33 ★ | A | 8.2.0 | lint | 9 | Swapped scripts run under strict-dynamic: no-inline-script lint and a Playwright row | F-A-505 | defer |
| C-34 ★ | A | 8.1.x | dev-throw | 9 | hx-config and hx-headers values fetch rejects: dev throws now, retype in 9.0.0 | F-A-104, F-A-108, F-A-606 | defer |
| C-35 ★ | A | 8.1.x | runtime | 9 | One hidden contract in the behaviors runtime: attribute and class | F-A-402, F-A-302 | defer |
| C-36 ★ | A | 8.2.0 | runtime | 9 | Build the decided family-keyed class merge, opt-in, gated per composed tag | F-A-301, F-A-201, F-D-404 | design |
| C-37 ★ | B | 8.2.0 | runtime | 9 | Swap verbs stamp action and method on forms | F-B-301 | defer |
| C-38 ★ | A | 8.1.x | boot | 9 | Extractor silent drops: named style object and trailing comma | F-A-202, F-D-604 | defer |
| C-39 | B | 8.1.x | ci | 9 | Diagnostic-text contract in CI: golden first diagnostics for a wrong-guess matrix | F-B-502, F-B-603 | defer |
| C-40 ★ | C | 8.1.x | ci | 9 | Census correctness: dedup, receiver guards, object-key channel, checked README head | F-C-402, F-C-102, F-C-404 | defer |
| C-41 ★ | D | 8.1.x | ci | 9 | One CI gate over lib, plugin and extractor; a real extractor 3.0.0 | F-D-503, F-D-501 | defer |
| C-42 | B | 8.1.x | type | 8 | Restore the Match case-key did-you-mean lost to NoExtraCases in 8.1.0 | F-B-401 | defer |
| C-43 | B | 8.2.0 | type | 8 | PageResponse checked by Rooted<'main-content'> instead of 44 casts | F-B-601 | defer |
| C-44 | B | 8.2.0 | type | 8 | Close unions defeated by an open arm: HxSync, overlay, reswap | F-B-503, F-B-504 | defer |
| C-45 | B | 8.2.0 | type | 8 | Id flows into every selector and IDREF sink; IDREF rejects '#' | F-B-305, F-B-306 | defer |
| C-46 | B | 9.0.0 | type | 8 | Brand setAction, setFormaction, Area and Use setHref | F-B-304, F-B-205, F-B-510 | defer |
| C-47 | C | 8.2.0 | lint | 8 | Report every unknown set*/add* name in one lint pass | F-C-502 | defer |
| C-48 | A | 8.1.x | runtime | 8 | Textarea keeps its leading newline across re-renders | F-A-503 | defer |
| C-49 | B | 8.2.0 | type | 6 | One arity-matching candidate for a discriminated-union Match call | F-B-402, F-B-202 | defer |
| C-50 | C | 8.2.0 | type | 6 | Numeric SVG setters accept numbers like their 30 siblings | F-C-503 | defer |
| C-51 | D | 8.2.0 | type | 6 | HTML/ARIA platform watch and the four missing ARIA 1.3 names | F-D-304, F-D-303 | defer |
| C-52 | B | 8.2.0 | type | 6 | One generated tombstone layer, validated against the full guess matrix | F-B-602, F-B-203, F-B-204, F-B-406, F-B-605, F-A-406, F-B-507 | defer |
| C-53 | A | 8.2.0 | type | 6 | defineTheme rejects size-like color names; fontSize tokens carry line-height | F-A-204, F-A-208 | defer |
| C-54 | B | 8.2.0 | type | 6 | The 422 re-render gets a root contract on the route def | F-B-107 | defer |
| C-55 | A | 9.0.0 | type | 6 | Bare setter calls become a compile error | F-A-404 | defer |
| C-56 | A | 9.0.0 | type | 6 | Move popovertarget and form setters to the elements that honor them | F-D-302, F-A-407 | defer |
| C-57 | A | 9.0.0 | type | 6 | hxResponse converges on getHeaders(); build() stops returning HTML | F-A-501 | defer |
| C-58 | C | 9.0.0 | type | 6 | Remove hxGet, hxPost and setHtmx(endpoint, opts) | F-C-301, F-C-107 | defer |
| C-59 | B | 8.2.0 | lint | 6 | Typed lint names the intended token for a typo'd styling argument | F-B-209 | defer |
| C-60 ★ | C | 8.2.0 | lint | 6 | prefer-htmx-api derived from the pinned htmx package; typed :inherited path | F-C-202, F-D-104, F-A-607 | defer |
| C-61 | C | 8.1.x | lint | 6 | prefer-set-method and plugin vocab derived from the installed lib | F-C-506, F-C-104, F-C-205, F-G-105, F-D-510 | defer |
| C-62 | C | 8.2.0 | lint | 6 | Typed-surface bypass lints generated from class-vocab | F-C-303, F-C-603, F-D-205 | defer |
| C-63 | A | 8.1.x | dev-throw | 6 | One attribute precedence at serialize, dev throw on collision | F-C-505, F-A-507 | defer |
| C-64 ★ | A | 8.1.x | runtime | 6 | Validate element names in El() | F-A-605 | defer |
| C-65 | A | 8.1.x | runtime | 6 | Explicit undefined clears every Tag-level setter; boolean download fixed | F-C-504, F-A-405 | defer |
| C-66 | A | 8.1.x | runtime | 6 | Sibling separator stops rendering a space before punctuation | F-A-504 | defer |
| C-68 | B | 8.1.x | ci | 6 | Generated both-direction union pins with a widen-mutation CI check | F-B-501, F-B-509, F-B-505 | defer |
| C-69 | D | 8.1.x | ci | 6 | Verify the type contract on TypeScript 6.0.3 and 7 | F-D-602 | defer |
| C-70 | G | 8.1.x | ci | 6 | Compile the lib's README, REFERENCE, @example blocks and examples/ in CI | F-C-401, F-C-408, F-D-508, F-G-109 | defer |
| C-71 | D | 8.2.0 | boot | 6 | Extractor 3.0.0 safelist: derived manifest, validated against the app's Tailwind | F-A-210, F-D-207 | defer |
| C-72 | C | 8.1.x | ci | 6 | Replay the frozen pure-prior runs in CI | F-C-207 | defer |
| C-73 | G | 8.1.x | ci | 6 | Compile every taught guideline block in a template CI lane | F-G-101, F-C-208, F-C-406, F-G-104 | defer |
| C-74 | G | 8.1.x | ci | 6 | Shrink always-loaded prose and pin a token budget in CI | F-C-602, F-C-308, F-C-410, F-C-310, F-D-505, F-G-110 | defer |
| C-75 | D | 8.1.x | ci | 6 | CHANGELOG check per repo | F-C-405, F-D-605 | defer |
| C-76 | B | 8.2.0 | type | 4 | Exported message-literal Rooted/Id gate; cheaper RootedView | F-B-102, F-B-106, F-B-403, F-B-404 | defer |
| C-77 | D | 8.2.0 | type | 4 | Class-level Tailwind coverage and variants from getVariants() | F-D-204, F-D-203 | defer |
| C-78 | G | 8.2.0 | type | 4 | Export the Styler type the README teaches | F-G-107 | defer |
| C-79 | G | 9.0.0 | type | 4 | f.input rejects 'checkbox' and 'radio' | F-G-108 | defer |
| C-80 | C | 9.0.0 | type | 4 | defineIds camelCase: README fix, lint, then a type | F-C-407 | defer |
| C-83 | A | 8.1.x | dev-throw | 4 | Dev-check coverage and activation | F-A-303, F-A-304, F-D-405 | defer |
| C-84 | A | 8.2.0 | dev-throw | 4 | Duplicate ids throw under dev checks; prefixed ForEachKeyed keys | F-A-604 | defer |
| C-85 | D | 8.2.0 | ci | 4 | Derive htmx config, location and event types from the pinned htmx.d.ts | F-D-103, F-D-105 | defer |
| C-86 | A | 8.2.0 | boot | 4 | Type-aware extractor mode | F-A-203 | defer |
| C-87 | D | 8.1.x | ci | 4 | Safari column from the system engine, not Playwright WebKit | F-D-603 | defer |
| C-88 | D | 8.2.0 | boot | 4 | Peer ranges, Tailwind floor and a loadable, tested recommended preset | F-D-509, F-D-206, F-D-606 | defer |
| C-89 ★ | B | 8.2.0 | type | 3 | Undeclared routes stop escaping the fragment-stance check | F-B-103 | defer |
| C-90 | A | 9.0.0 | type | 3 | preserve, boost, swapOob leave the request-shaped HTMX bag | F-A-110 | defer |
| C-91 | C | 9.0.0 | type | 3 | One spelling per variant: drop 5 dead tier-1 names, freeze the live tail | F-C-106, F-C-604, F-C-605 | defer |
| C-94 | D | 8.2.0 | type | 2 | Typed open arms that compile to no CSS | F-D-201, F-A-206, F-A-207 | defer |
| C-95 | B | 8.2.0 | type | 2 | Rooted<N> soundness: Partial outer swap and re-rooting | F-B-104, F-B-105 | defer |

## C. Decision-gated (4): each reopens a §5 guardrail

| Cluster | Guardrail | Title | Rationale | Decision |
|---|---|---|---|---|
| C-67 | §5.10 | Safari closedby fallback in the behaviors runtime (reopens ADR-06 / S-21) | setClosedby('any') is taught as complete light-dismiss, but Safari 27 ships no closedby and 0/20 fleet files pair it with a fallback (F-D-301); the fallback reopens ADR-06 under the S-21 behavior-v4 lock and needs the L-260 size call. | keep guardrail; fix the teaching: pair setClosedby("any") with onClickOutside (prose, guidelines-update) |
| C-82 | §5.4 | One meaning for a bare selector token (L-063) | A bare token means #id in Partial and a tag selector in hx() options; on 2/2 bundles the hx() miss swaps the trigger itself and leaves duplicate ids (F-B-309), and the fix direction is L-063's open call on the type-safety guardrail. | reopen: design one meaning for a bare selector token |
| C-92 | §5.7 | Pick the CSP-nonce survivor: renderWithNonce or the options bag | The CSP-nonce options bag has 0 call sites in 58 repos while renderWithNonce and renderToStreamWithNonce carry all 89 (F-C-305); picking the survivor reverses either L-230 or L-141's proposal and is the converge call. | reopen: renderWithNonce/renderToStreamWithNonce survive; delete the options bag in 9.0.0; design |
| C-93 | §5.5 | Which component layer survives: @jtdigital/ui or src/shared/ui | @jtdigital/ui, the component home S-05 and L-411 name, has 0 consumers in 58 repos and fails 36 lint errors (F-C-306), and consumed as a dependency its classes vanish because it has no safelist path (F-A-209); retiring or rewriting it changes the package the instruction-set guardrail names. | reopen: retire @jtdigital/ui, src/shared/ui is the component layer; design the retirement |

## D. Parked (2)

| Cluster | Title | Rationale | Decision |
|---|---|---|---|
| C-81 | Setter casing rename (F-D-160, L-144) stays parked | Five findings disagree on direction, but case-only guesses self-heal in one TS2551 hop (20/20, 22/22, 33/33) and only 3 of 158 setters break the mirror-the-attribute rule; parked because C-47's one-pass lint removes the measured multi-round cost and any rename is a 9.0.0 codemod. | keep parked |
| C-96 | Platform additions with engine support and no demand | autocorrect (Baseline 2026-09-11), popover='hint' (2 of 3 engines) and <selectedcontent> (only element without a factory) have engine support and 0 fleet demand (F-D-306, F-D-307, F-D-308); parked under S-23 with engine triggers watched by C-51. | keep parked |

## E. Round 2: designed and verified (11)

The clusters sections B and C sent to design. All 11 survive with changes; no rejects. `include` = RFC + every verdict's required changes ([_summary.md § Round 2](../30-verification/_summary.md)).

| RFC | Cluster | Title | Lane | Enforcement | Required changes | Decision |
|---|---|---|---|---|---|---|
| [RFC-A-05](../20-design/track-a-silent-failures/RFC-A-05.md) | C-18 | One URL sanitizer for every value fluent hands to htmx; js:/javascript: in confirm and vals throws in dev and renders as text in production | 8.1.x | dev-throw | 17 | include |
| [RFC-A-06](../20-design/track-a-silent-failures/RFC-A-06.md) | C-19 | JSON-typed script bodies carry no '<': the serializer escapes every '<' so data cannot open or close the script | 8.1.x | runtime | 5 | include |
| [RFC-A-07](../20-design/track-a-silent-failures/RFC-A-07.md) | C-16 | Form<T>: valued checkboxes bind by membership and a group gets per-value ids; dev throw on any Form() argument mix that drops arguments | 8.1.x | dev-throw | 4 | include |
| [RFC-A-08](../20-design/track-a-silent-failures/RFC-A-08.md) | C-17 | hx-status object configs quote any value HCON would split, so spaced targets and selects, comma lists and swap modifiers survive | 8.1.x | runtime | 6 | include |
| [RFC-A-09](../20-design/track-a-silent-failures/RFC-A-09.md) | C-36 | Opt-in serialize-time class merge: setClassMerge(theme) makes the later class of a family win | 8.2.0 | runtime | 22 | include |
| [RFC-B-02](../20-design/track-b-contracts/RFC-B-02.md) | C-09 | HxSwap admits the htmx 4 modifiers both bundles read (focusScroll, transition:false, strip, swapEmpty, scrollTarget, showTarget); HxTrigger and HxTarget stop advertising six literals that never fire | 8.2.0 | type | 6 | include |
| [RFC-B-03](../20-design/track-b-contracts/RFC-B-03.md) | C-12 | Branded route sinks print their producers on line 1; prefer-set-method stops autofixing a raw href into a TS2345 | 8.2.0 | type | 2 | include |
| [RFC-B-04](../20-design/track-b-contracts/RFC-B-04.md) | C-82 | One meaning for a bare selector word in every sink (htmx's); HxTarget closes its string arm | 9.0.0 | type | 5 | include |
| [RFC-C-02](../20-design/track-c-surface/RFC-C-02.md) | C-32 | 9.0.0 prune gated on recorded agent guesses: 4 dead second spellings and 5 duplicate root exports leave, the census-zero setters and utilities stay | 9.0.0 | type | 32 | include |
| [RFC-C-03](../20-design/track-c-surface/RFC-C-03.md) | C-92 | One CSP-nonce spelling: renderWithNonce and renderToStreamWithNonce survive, the nonce options bag is removed in 9.0.0 | 9.0.0 | type | 6 | include |
| [RFC-C-04](../20-design/track-c-surface/RFC-C-04.md) | C-93 | Retire @jtdigital/ui: delete packages/ui, keep src/shared/ui as the one component layer, move selectStyle into it, and fail CI on a workspace package that emits classes | 8.1.x | ci | 5 | include |

## F. Track E: new APIs (8 designed and verified)

Decided 2026-10-01 by the user: "go with recommendations". Undesigned candidates (F2) are `defer`.

| RFC | Title | Tier | Lane | Quorum | Required changes | Recommendation | Decision |
|---|---|---|---|---|---|---|---|
| [RFC-E-01](../20-design/track-e-new-apis/RFC-E-01.md) | Tag.getId(): read the id a built control carries, so a field wrapper wires label for/id without a cast | high | 8.2.0 | survives | 6 | include (getId as the wrapper read; docs point Form<T> users at f.label) | include (getId as the wrapper read; docs point Form<T> users at f.label) |
| [RFC-E-02](../20-design/track-e-new-apis/RFC-E-02.md) | Dev-check: a select that would submit a value nobody chose throws, naming the field, the value and the fix | high | 8.2.0 | survives | 9 | include (scope the throw to values the view controls, not request-supplied ones) | include (scope the throw to values the view controls, not request-supplied ones) |
| [RFC-E-03](../20-design/track-e-new-apis/RFC-E-03.md) | Form<T> takes the route's body schema and stamps maxlength, minlength, required, min and max on bound controls | high | 8.2.0 | survives | 10 | defer (agents already restate limits: 0/12 omissions; adds a T-free second way to type a form) | defer (agents already restate limits: 0/12 omissions; adds a T-free second way to type a form) |
| [RFC-E-04](../20-design/track-e-new-apis/RFC-E-04.md) | Form<T> option values typed by the bound field, and a label record for f.select | high | 8.2.0 | survives | 7 | modify: one shape, drop the label-record arm (§5.7) | modify: one shape, drop the label-record arm (§5.7) |
| [RFC-E-05](../20-design/track-e-new-apis/RFC-E-05.md) | fluent-html/testing inspect(): structural queries over a rendered View for tests | high | 8.2.0 | guardrail-killed | 9 | cut (guardrail-killed §5.5: a 62-line user-land twin reproduces it) | cut (guardrail-killed §5.5: a 62-line user-land twin reproduces it) |
| [RFC-E-06](../20-design/track-e-new-apis/RFC-E-06.md) | Form<T>: f.hint(name, ...children), a field hint the binding links into the control's aria-describedby ahead of the error | mid | 8.2.0 | guardrail-killed | 3 | cut (guardrail-killed §5.5: with getId, the hint link is a 12-line user-land helper; fold into the template Field shell) | cut (guardrail-killed §5.5: with getId, the hint link is a 12-line user-land helper; fold into the template Field shell) |
| [RFC-E-07](../20-design/track-e-new-apis/RFC-E-07.md) | IfNotEmpty / IfNotEmptyElse: a list guard that binds the list as NonEmpty and treats null, undefined and [] alike | mid | 8.2.0 | survives | 6 | include (trim the d.ts JSDoc cost) | include (trim the d.ts JSDoc cost) |
| [RFC-E-08](../20-design/track-e-new-apis/RFC-E-08.md) | .size(): one typed call for Tailwind's size-* (equal width and height), with prefer-size folding the 423 hand-written pairs | mid | 8.2.0 | survives | 9 | include (prefer-size must not autofix when a composed preset already sets w/h) | include (prefer-size must not autofix when a composed preset already sets w/h) |

### F2. Track E candidates not designed (cap 8)

| Candidate | Tier | Layer | Lane | Score | Title | Measure | Decision |
|---|---|---|---|---|---|---|---|
| E-07 | mid | core | 8.2.0 | 12 | Restore scrollM (pruned in 8.0.0) as a scrollP mirror | 15 canonical hatch sites in 6 repos (ranker reproduced: everyframe 5, competify 4, fl-um 2, popri 2, stem-50 1, sportoawards 1), 14 of 15 written after the 2026-08-14 prune, 15/15 on the spacing scale; eslint 4.1.0 autof | defer |
| E-08 | mid | tooling | 8.2.0 | 12 | eslint rule htmx-event-name: htmx:* names checked against the installed htmx.d.ts with a did-you-mean | 19 htmx-2 listeners in 6 repos serving htmx 4 with 0 compat extensions, 1 canonical (workshop-toni story.ts:193-194, ranker reproduced); 0 of 14 htmx-2 names fire on beta6 or 4.0.0; prototype rule 19/19 flagged, 0 false  | defer |
| E-09 | mid | framework | template | 12 | The 422 answers with the page: the { invalid } bag adds select:, and the isHtmxRequest fork leaves the handler | Chromium on lib 4.0.0-beta6 and template 4.0.0: full-page 422 + select:#login-form leaves 1 header, 1 #main-content, 1 form and the 2nd submit lands, without select: 3 headers after 2 submits; ranker: 31 isHtmxRequest fo | defer |
| E-10 | mid | framework | template | 12 | Form(...).search(route) makes a whole filter form live with one call | Chromium on 2 bundles: shipped Form(...).search fires 0 of 3 gestures and Enter does a native full-page GET, prototype 3/3 with 1 request each and the URL reflecting filters; 40 filter forms in 16 repos (33 / 11 canonica | defer |
| E-11 | mid | user-land | template | 12 | Field<T> shell in src/shared/ui built from f.label, the control, f.hint and f.error | 25 field-wrapper re-definitions in 10 of 15 apps; 5/6 recon runs wrote a shell; FormGroup wraps a bound control at 149 canonical sites / 7 repos, 42 in files that bind errors; rendered FormGroup + Form<T>: 0 error elemen | defer |
| E-12 | mid | user-land | template | 12 | Template Alert carries role by tone, and status-shaped swap targets are live regions | Chromium AX tree after an htmx 4.0.0 422 outerMorph: shipped Alert exposes no live region, role=alert gives assertive, role=status polite; ranker: 14 of 15 canonical Alert copies carry no role; 140 Alert({ sites / 16 rep | defer |
| E-13 | mid | user-land | template | 12 | Template Meter renders native progress with an accessible name and serves non-chart ratios | 44 setStyle width bars in 16 canonical repos (ranker), 29 app-authored / 10 repos per critic; 1 of 44 has progressbar semantics; Chromium: div bar absent from the ARIA snapshot, <progress value=43> reads progressbar 43%; | defer |
| E-14 | mid | framework | template | 12 | SecurityHeadersOptions gains mediaSrc, frameSrc and formAction | 7 of 15 canonical apps widen media-src (5), frame-src (2) or form-action (1); 6 edit core security-headers.ts (blob match against template history); runtime probe: media-src falls back to default-src 'self'; type probe r | defer |
| E-15 | mid | framework | template | 12 | reply.renderError(status, message) with the fragment retarget the global handler already applies | 43 ErrorPage answers in 28 fragment-stance handlers (everyframe-composer 23, stem-50 5), 0 retarget; Chromium on 2 bundles: 2 nested #main-content and the fragment id gone, 1 with HX-Retarget; ranker: 194 ErrorPage({ sta | defer |
| E-16 | mid | framework | template | 12 | A blank value of a declared route query key means absent, before Ajv runs | 2 fix commits in 2 canonical repos covering 5 endpoints (competify e7448d0, wsfas 4a8715d9); Fastify 5.12.1 probe: 2/2 blank URLs answer 400 today, 0/2 with the strip, typos still 400 2/2; 266 declared query maps in 15 r | defer |
| E-19 | mid | core | 8.2.0 | 8 | Regenerate the .cssProp() property union from TypeScript 6's CSSStyleProperties | TS 6.0.3 CSSStyleProperties adds 27 and removes 0 against the 436-member union (Chromium 149 diff: 80 longhands absent); emit-css-props throws on TS 6.0.3 (parsed 0 properties); 7/7 probe calls TS2345 on 8.1.0, 0 widened | defer |
| E-20 | mid | core | 8.2.0 | 8 | outline takes width and color like ring; add outlineOffset | 406 outline width/color/offset tokens (31 distinct) in the design files of 5 canonical repos fail tsc on 8.1.0, 282 compile on the prototype and 118 more after eslint re-derives; 6 cssProp hatches in 2 repos with comment | defer |
| E-21 | mid | framework | template | 8 | Targeted .onChange(target, route, options) in the template swap verbs | 20 hand-rolled change-trigger sites in 4 canonical repos incl. 1 core fork (ranker reproduced 14 everyframe-composer, 1 home-page, 1 sportoawards literal sites + the stem-50 fork); stem-50's form-level autosave sends 0 r | defer |
| E-22 | mid | framework | template | 8 | Exported hxTargets(request, id: Id) reader of htmx 4's tag#id HX-Target header | both bundles send div#id or a bare tag, so === String(id) and === id.id match 0 of 6 header values; ranker: 3 raw hx-target reads in 3 canonical repos; 2 fix commits in storysell-ai and a dead branch in time-to-live (bot | defer |
| E-23 | mid | core | 8.2.0 | 6 | Motion tokens in defineTheme: animate and ease namespaces with typed seams, keyframes as a curation call | ranker: 33 hand-written @keyframes in 8 canonical repos, 10 arbitrary .animate in 3 repos, 6 arbitrary .ease in 2; everyframe restates all 3 of its @theme animate tokens; Tailwind 4.3.3 emits .animate-<token> and md: var | defer |
| E-24 | mid | core | 8.2.0 | 6 | Widen the minH/minW, aspect, grow/flex and [color]/opacity unions to what their emitters already render | 553 design-class occurrences fail tsc on 8.1.0 and compile on the prototype (min-h/min-w 182 / 6 repos, aspect 155 / 5, grow/flex 108 / 3, [hex]/opacity 108 / 4); 106 arbitrary minH/minW calls in 16 repos, 57 exactly on  | defer |
| E-25 | mid | core | 8.2.0 | 6 | Table border model: border('collapse' \| 'separate') and a borderSpacing method | 22 hatch sites in 8 canonical repos (ranker reproduced), 14 of them the template cohorts pair in 7 copies; eslint 4.1.0 autofixes border-collapse to .border('collapse') and border-spacing-0 to .border('spacing-0'), both  | defer |
| E-26 | mid | core | 8.2.0 | 6 | renderWithNonce stamps hx-nonce on htmx-bearing tags so htmx 4's hx-csp gate can be enabled | 1 canonical incident (everyframe-composer projects.pad.view.ts:500 Enter-save: 0 requests plus a CSP violation on beta6 and 4.0.0; ranker found 1 filter site and 0 'unsafe-eval' in the template CSP); hx-csp strips all 8. | defer |
| E-27 | mid | user-land | template | 6 | Template Badge with a closed tone union | 6/6 recon runs built a status badge with 4 different designs; 98 *Badge definitions in 14 canonical repos; 90 tone-mapped pills in 35 fleet repos; the template's src/shared/ui exports 0 badges; prototype classes land in  | defer |
| E-28 | low | framework | template | 6 | createEmail returns { html, text } so template mail carries a text/plain part | 44 html-only sendMail calls in 13 canonical repos; 1 repo (gzs/stem-50, 6 spread sites) derives text from the view; the tree walk and the stem-50 regex give identical text on 1 fixture | defer |
| E-29 | mid | framework | template | 4 | Current-link state: .nav/.tab stamp aria-current from the request path, on an app-owned render-binding seam | template TabItem renders 0 aria-current; ranker: 50 hand setAria({ current }) calls in 9 canonical repos (34 in everyframe-composer); critic: 4 app-authored TabItem active call sites in 3 repos, 22 app-authored nav compo | defer |
| E-30 | mid | framework | decision-gated | 4 | One-shot streamed job progress through htmx 4's hx-sse instead of bounded poll loops | 14 bounded polls in 7 canonical repos (ranker: 31 .poll sites / 9 repos); Chromium on 2 bundles: 1 POST, 3 progressive swaps with Partials, 0 reconnects; 4.0.0 holds the indicator and the element's sync queue until strea | defer |
| E-31 | low | core | 8.2.0 | 3 | Restore the snap rows and add Tailwind 4.3.0's scrollbar roots | ranker: scroll-snap cssProp 6 sites in 2 canonical repos, scrollbar-width 3 in 2; 3/3 canonical snap rails also hide the scrollbar; 588 scrollbar-* classes valid on Tailwind 4.3.3 and 0 typed; fleet scrollbar styling in  | defer |
| E-32 | low | core | 8.2.0 | 3 | Promote five backlog vocab roots on census: align, origin, placeItems, justifySelf, normalCase | align: 12 cssProp sites in 5 canonical repos, 12/12 map (ranker); origin: 4 in 2 repos (ranker); place-items-center 369 design occurrences in 5 repos; justify-self 79 in 3 repos and 5 of 8 prose-only agent runs guessed . | defer |
| E-33 | low | framework | parked | 2 | Timed self-removal for transient notices delivered as server-rendered partials | canonical demand is 1 repo (gzs/stem-50); 2 source comments name the gap (1 canonical, 1 pre-7); the 54 showToast emitters in 27 repos are copies of one template file HEAD deleted (critic); F-E-406 prototype removes 3/3  | defer |
| E-34 | low | framework | template | 2 | Template targets ES2024 so Map.groupBy plus the existing ForEach replaces hand-rolled grouping | Map.groupBy fails TS2550 under the template's ES2022 lib and compiles under ES2024; the lib bump adds 0 diagnostics over 4,890 files in 15 apps; 0 native groupBy sites in canonical src (ranker); 3/3 agent runs hand-rolle | defer |
| E-35 | low | framework | template | 2 | Template Layout chrome prop matched inside #main-content | ranker: chrome?: in 6 of 16 canonical LayoutProps, 5 vocabularies; 71 call sites; 1 more app adds hideNav; 6/6 keep the chrome inside MainContent | defer |
