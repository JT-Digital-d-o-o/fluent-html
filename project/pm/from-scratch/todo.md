# From scratch: todo

Why: [prd.md](prd.md).

### As the maintainer I want a fast verdict on a from-scratch fluent-html so that a rewrite starts only on measured evidence
- [x] [P1] Evidence pack: where Claude Code's turns go on fluent-html today, render baseline, escaping model
- [x] [P1] Six designs, one lens each, the same three reference screens in each
- [x] [P1] Screen: at most three survivors, each checked against the prior verdicts
- [ ] [P1] A seventh design, correct by construction: content models in types, pure views, effects declared at the route, Tailwind's own names checked by tsc; run through the same screen and bake-off once the first run returns
- [ ] [P1] A seeded-mistake suite: each mistake kind in HTML, htmx and Tailwind as a program, and per design the kinds rejected by tsc, by a check, or not at all; in the format of stack-dsl's benchmark, one suite for every lane ([goal](../../../../projects-template/project/pm/decisions.md))
- [x] [P1] A runnable prototype per survivor with an API reference no longer than the control's
- [x] [P1] Render throughput, the XSS fixture set and html-validate per prototype and the control
- [x] [P1] Bake-off: two runs per arm, at most $40, Claude Code in a clean directory
- [ ] [P1] Safety parity on each survivor: every mistake fluent-html 8 rejects (unknown class, palette literal, bad variant, fragment id mismatch, wrong route stance, a raw `hx-*` URL, unescaped HTML, a bad attribute value) is rejected by the same check command, or the design fails
- [x] [P1] Verdict against K1 to K5: go, gated, with Page Parts; Lean Tags fails K4 and is harvested ([verdict](../../research/from-scratch/2026-11-15/verdict.md))
- [ ] [P1] The gate: Page Parts re-run on its reference alone (the first arm's sessions read a worked example), beside a Fluent Nine arm, two runs each
- [ ] [P1] The harvest: the verdict's 14 items as rows in fluent-html's own releases, the XSS fixture set as a gate on 8.1.1
- [x] [P1] Write tests: each prototype's escaping on the XSS fixtures
- [ ] [P1] Check for bugs: one bake-off run's numbers recounted from its transcript
