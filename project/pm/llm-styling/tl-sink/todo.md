# `.tl()` Sink — Tasks

<!-- hill: uphill -->
### As a maintainer I want a deliberate go/no-go on the string sink so that the second-way-to-style cost is only paid if the soak data supports it

- [ ] [P1] DECISION NEEDED: adopt `.tl()` after the canonical-names + object-variants release soaks? Inputs: realized token savings in real sessions net of any thrash, tsserver tolerance of the ~1s fixed grammar cost with the real theme size, lint-autofix readiness. ADD only with all prd conditions; otherwise archive this scope `Outcome: killed`.

### As an LLM author I want 3+ static base utilities as one validated string so that flat class piles cost string-form tokens with fluent-form safety

- [ ] [P0] Generate the `.tl` grammar (BaseClass template unions) from class-vocab + `valueType`; drift test against the vocab
- [ ] [P0] Implement `tl<const S>` validator: error-accumulating, variant/breakpoint directive errors referencing object-variant form, dynamic-interpolation rejection
- [ ] [P0] Runtime: append-only emission (single `addClass` pass-through)
- [ ] [P1] Theme augmentation arm (`keyof FluentCustom*`) + tests incl. typo rejection
- [ ] [P0] Write tests — validator acceptance/rejection matrix (ports the spike cases), 999-token bound, chaining inference on Tag subclasses
- [ ] [P0] Check for bugs

### As a maintainer I want the bidirectional lint ratchet live on day one so that the 3+/≤2 boundary never depends on judgment

- [ ] [P0] `prefer-tl` (runs ≥3 → `.tl`, emit-evaluated autofix) + `no-small-tl` (≤2 → methods, generated reverse map)
- [ ] [P0] `single-tl-per-chain`, `tl-first-in-chain`, `no-split-static`; extend conflict/duplicate rules to `.tl`
- [ ] [P1] Docs: convergence rule into README/FLUENT-STYLING + guidelines CLAUDE.md (append-only semantics stated explicitly; no extractor-retirement claims)
- [ ] [P0] Write tests — autofix round-trip fixtures (methods↔tl), boundary cases at exactly 2/3 tokens
- [ ] [P0] Check for bugs
