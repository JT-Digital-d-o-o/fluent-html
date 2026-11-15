# From scratch: todo

Why: [prd.md](prd.md).

### As the maintainer I want a fast verdict on a from-scratch fluent-html so that a rewrite starts only on measured evidence
- [ ] [P1] Evidence pack: where Claude Code's turns go on fluent-html today, render baseline, escaping model
- [ ] [P1] Six designs, one lens each, the same three reference screens in each
- [ ] [P1] Screen: at most three survivors, each checked against the prior verdicts
- [ ] [P1] A runnable prototype per survivor with an API reference no longer than the control's
- [ ] [P1] Render throughput, the XSS fixture set and html-validate per prototype and the control
- [ ] [P1] Bake-off: two runs per arm, at most $40, Claude Code in a clean directory
- [ ] [P1] Safety parity on each survivor: every mistake fluent-html 8 rejects (unknown class, palette literal, bad variant, fragment id mismatch, wrong route stance, a raw `hx-*` URL, unescaped HTML, a bad attribute value) is rejected by the same check command, or the design fails
- [ ] [P1] Verdict against K1 to K5: go, harvest or drop, per design
- [ ] [P1] Write tests: each prototype's escaping on the XSS fixtures
- [ ] [P1] Check for bugs: one bake-off run's numbers recounted from its transcript
