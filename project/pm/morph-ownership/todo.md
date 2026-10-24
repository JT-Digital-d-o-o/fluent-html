# Morph ownership - todo

### As the maintainer I want the morph laws as a conformance suite so that every ownership change is judged in three engines
- [ ] [P1] Port [research/morph-lens](../../research/morph-lens/README.md) into `test/acceptance` as a Playwright spec, with fast-check as a devDependency, run under `ACCEPT_ENGINES=all`
- [ ] [P1] Run it against htmx 4.0.0, the version projects-template ships (the acceptance app pins 4.0.0-beta6)
- [ ] [P1] Ledger today's known failures as expected, one entry per row of [design.md § Ledger](design.md#ledger), so the suite is green on today's htmx and flags an entry that starts passing
- [ ] [P2] Add the ledger's verb-state case: a swap the menu did not cause, covering an open `StudioSelect`-shaped menu
- [ ] [P2] Draft the htmx issue with the two-line repro in [repro.mjs](../../research/morph-lens/repro.mjs) (Tony posts it)
- [ ] [P3] ~Widen the generator: lists past `morphScanLimit` (10), SVG, `<template>`, `hx-*` attributes, OOB partials, `hx-preserve`, two morphs in a row
- [ ] [P2] Write tests (a planted morph bug fails the suite)
- [ ] [P2] Check for bugs: the full suite in all three engines; a new failure goes to qa.md

<!-- hill: uphill -->
### As an app author I want to declare an element or an attribute the client's so that a morph never erases script or reader state
- [ ] [P1] DECISION NEEDED: the release vehicle: its own minor after 8.2.0, or folded into the lockstep
- [ ] [P1] `.owns("client")` on every tag, emitting `hx-morph-skip`
- [ ] [P1] `.owns({ <attr>: "client" })` typed per tag (the attributes the hook reaches, owner union `"client"` alone), emitted as a data attribute the extension reads
- [ ] [P1] The extension as its own asset: `htmx:before:morph:attr` cancels the set and the removal of each declared attribute; undeclared parts keep htmx's behavior
- [ ] [P1] CHANGELOG entry under the chosen release
- [ ] [P1] Write tests (emission per tag; type tests where an attribute a tag lacks fails to compile; the suite's complement cases green for declared parts)
- [ ] [P1] Check for bugs: Everyframe's keep-open extension, library-upload's hook, its `hx-morph-skip` uses and the landing loops, re-expressed as declarations, pass the suite in three engines
