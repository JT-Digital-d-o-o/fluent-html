# Canonical Names — Tasks

### As an LLM author I want method names to equal Tailwind class prefixes so that I can derive the API from my prior instead of docs

- [x] [P0] Implement the 21 simple renames (methods + vocab rows + types re-export names) (7.0.0-unreleased; type names unchanged — no re-export churn needed; storage-field unshadowing per escape-hatch precedent: `InputTag.list`→`listId`, `SvgTag`/`SvgShapeTag` `fill/stroke/transform`→`*Value`, schema alias tuples keep attribute emission byte-identical)
- [x] [P0] Implement the 17 merges with overload discrimination (prereq `FluentCustomFontFamily` ✓); vocab representation: new `values: { kind: "group", groups }` spec on merged rows keeps per-family lists addressable — types emitter markers grew `method.group` addresses (`@@UNION TailwindTextAlign text.align@@`), validity oracle compiles every group literal, no-duplicate-rows invariant intact
- [x] [P0] Add the 12 directional shorthands `px/py/pt/pb/pl/pr/mx/my/mt/mb/ml/mr` (sizing-shape vocab rows; margins take `"auto"`; unit overloads throughout)
- [x] [P1] Delete `bold()` + `flexShorthand`; absorb `outlineHidden()` into `.outline("hidden")` (a11y JSDoc kept on `.outline()` + the vocab doc)
- [x] [P1] Tighten `ring`'s `${number}` arm — `TailwindRingWidth` is now `0|1|2|3|4|8` + `[…]`; `.ring("500")` is a compile error, colors discriminate cleanly
- [x] [P1] JSDoc cross-refs: `.fill()`/`.stroke()`/`.transform()` class methods vs `setFill`/`setStroke`/`setTransform` attr setters
- [x] [P0] Write tests — merged/renamed emission cases + shorthands in `class-vocab.test.ts`, canonical-names positive block + 10 `@ts-expect-error` rejections in `type-surface.test-d.ts`, lib-parity auto-regen over renamed rows, oracle args consolidated (merged tuples incl. `border-t-red-500`, `bg-linear-45/oklch`, `mx-auto`), defineTheme ambiguity-warning tests; lib 1946 green, coverage watch clean (no root churn)
- [x] [P0] Check for bugs (self-review: p("px") vs p("px",16) disambiguation, signNeg pass-through for `bgLinear("to-r")`, emitBorder already the merged emitter, stale-name sweep over src JSDoc; **also shipped the release-coupled plugin bump** — eslint-plugin 4.0.0-unreleased: group-aware derivation, residue tables collapsed (15→13 entries incl. 12 shorthand owners), canonical autofix targets, 318+14 checks + drift green — repo lint depends on the linked plugin, so this couldn't defer)
- **Added (unplanned, rabbit-hole note):** `defineTheme` cross-family ambiguity warning (`colors`×`fontSize`, `colors`×`shadow`, weight-named `fonts` tokens) — warns with a rename suggestion at definition time

### As a maintainer I want a mechanical codemod so that demos and apps migrate without hand-editing 1,800 call sites

- [ ] [P1] ts-morph codemod: rename map + receiver-type check against `Tag`; handle the 3 non-pure-rename rewrites
- [ ] [P1] Run over fluent-html-demos; verify by render-diffing class sets before/after
- [ ] [P2] ~Run over ttl/rideshare/mngmt when those repos bump to the release
- [ ] [P1] Write tests — codemod fixture suite (incl. false-positive guards: formFor `select`, non-Tag receivers)
- [ ] [P1] Check for bugs

### As an LLM author I want the docs to teach only the canonical surface so that stale examples don't mis-teach me

- [x] [P0] Rewrite README + FLUENT-STYLING.md + examples/ to canonical names (same release — no lag) (+ TAILWIND-SETUP.md; 184 stale call sites converted, directional shorthands used as the taught spelling with `.p("x","4")` noted as the parametric form; FLUENT-STYLING § Style Methods Reference now states the prefix rule + argument discrimination up front; unit-overload "Available on" list corrected to the canonical set incl. `text`/`stroke`/`decoration`/`scrollM`/`scrollP`)
- [x] [P1] Update guidelines surface (`guidelines/web-development/fluent-html.md` + CLAUDE.md styling sections) and JSDoc on merged signatures (both CLAUDE.md copies gained a "method name = Tailwind class prefix" teaching line; key-method-categories paragraph rewritten canonical; `.gradientTo()` mentions purged; merged-signature JSDoc verified already shipped in story 1 — no additions needed)
- [x] [P1] Document the residual divergence rules (compound-prefix boundary, negatives via `.neg`, translate axis form) (FLUENT-STYLING § "Where names diverge from raw Tailwind": longest-camelCase-prefix rule, `.neg()` vs sign-relocating numeric args, translate axis form, and the can't-equal-prefix names `containerQuery`/`gradient`/`snap`)
- [x] [P1] Check for bugs (full stale-name sweep over README/FLUENT-STYLING/TAILWIND-SETUP/examples/guidelines is grep-clean; examples now typecheck under strict — fixed two latent doc bugs: composition.ts's `` `${color}-100` `` dynamic-interpolation badge (→ `whenMatch` with literal branches) and control-flow.ts's flow-narrowed `null` avatarUrl; lib suite 1946 green; 4 lint errors are pre-existing in untouched files)
- **Added (unplanned, found by the docs sweep):** tooling-repo surface — extractor README/example + **17 failing extractor tests** (fixtures still used pre-rename methods against the linked 7.0.0 vocab; renamed fixtures, `UnresolvedArg.method` assertions now expect canonical names — 51/51 green, zero extraction-logic changes, CHANGELOG Unreleased note); eslint-plugin README rewritten canonical (pattern table shows merged prefixes + shorthand owners, purged the stale `.addClass("hover:…")` teaching that contradicted the plugin's own 3.0.0 preset, CHANGELOG 4.0.0 docs note)
