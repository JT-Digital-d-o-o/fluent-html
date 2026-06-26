---
rfc: RFC-<TRACK>-<NN>       # the RFC under review
lens: <correctness|type-safety|breaking-change|perf|dx|security/escape|instruction-set>
verdict: <survives|survives-with-changes|reject>
confidence: <0.0-1.0>
killer_objection: <null | the single strongest reason this should NOT ship>
required_changes: []        # populated iff survives-with-changes
---

# Verdict: RFC-<id> — <lens> lens

> You are an ADVERSARY. Your job is to KILL this RFC through the <lens> lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.
> For a 6.0.1 patch, the `breaking-change` lens is sharp: a patch that changes any public shape FAILS.
> The `instruction-set` lens asks: is this a true primitive, or an opinionated component that belongs in user-land?

## Attack
The strongest case against the RFC from this lens. Be specific and technical.

- **<lens> failure mode 1:** …
- **<lens> failure mode 2:** …

## Does it survive?
Verdict + reasoning. If `survives-with-changes`, list the exact required changes (these fold back into the RFC).

## Guardrail check (if this lens owns one)
e.g. `security/escape` confirms no XSS regression; `breaking-change` confirms a patch stays a patch; `instruction-set` confirms primitive-not-component.
