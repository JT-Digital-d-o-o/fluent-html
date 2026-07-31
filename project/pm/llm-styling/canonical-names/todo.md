# Canonical Names — Tasks

### As an LLM author I want method names to equal Tailwind class prefixes so that I can derive the API from my prior instead of docs

- [ ] [P0] Implement the 21 simple renames (methods + vocab rows + types re-export names)
- [ ] [P0] Implement the 17 merges with overload discrimination (port the spike's merged unions); prerequisite check: `FluentCustomFontFamily` seam landed (escape-hatch)
- [ ] [P0] Add the 12 directional shorthands `px/py/pt/pb/pl/pr/mx/my/mt/mb/ml/mr`
- [ ] [P1] Delete `bold()` + `flexShorthand`; absorb `outlineHidden()` into `.outline("hidden")` (keep a11y JSDoc)
- [ ] [P1] Tighten `ring`'s `${number}` arm (rejects `ring("500")`) while merging `ringColor`
- [ ] [P1] JSDoc cross-refs: `.fill()`/`.stroke()`/`.transform()` class methods vs `setFill`/`setStroke`/`setTransform` attr setters
- [ ] [P0] Write tests — port spike asserts (32 emission + 10 rejection) into the suite; lib-parity regen over renamed vocab rows
- [ ] [P0] Check for bugs

### As a maintainer I want a mechanical codemod so that demos and apps migrate without hand-editing 1,800 call sites

- [ ] [P1] ts-morph codemod: rename map + receiver-type check against `Tag`; handle the 3 non-pure-rename rewrites
- [ ] [P1] Run over fluent-html-demos; verify by render-diffing class sets before/after
- [ ] [P2] ~Run over ttl/rideshare/mngmt when those repos bump to the release
- [ ] [P1] Write tests — codemod fixture suite (incl. false-positive guards: formFor `select`, non-Tag receivers)
- [ ] [P1] Check for bugs

### As an LLM author I want the docs to teach only the canonical surface so that stale examples don't mis-teach me

- [ ] [P0] Rewrite README + FLUENT-STYLING.md + examples/ to canonical names (same release — no lag)
- [ ] [P1] Update guidelines surface (`guidelines/web-development/fluent-html.md` + CLAUDE.md styling sections) and JSDoc on merged signatures
- [ ] [P1] Document the residual divergence rules (compound-prefix boundary, negatives via `.neg`, translate axis form)
- [ ] [P1] Check for bugs
