---
rfc: RFC-<TRACK>-<NN>       # the RFC under review
lens: <correctness|type-safety|breaking-change|perf|dx|security/escape>
verdict: <survives|survives-with-changes|reject>
confidence: <0.0-1.0>
killer_objection: <null | the single strongest reason this should NOT ship>
required_changes: []        # populated iff survives-with-changes
---

# Verdict: RFC-<id> — <lens> lens

> You are an ADVERSARY. Your job is to KILL this RFC through the <lens> lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack
The strongest case against the RFC from this lens. Be specific and technical.

- **<lens> failure mode 1:** …
- **<lens> failure mode 2:** …

## Does it survive?
Verdict + reasoning. If `survives-with-changes`, list the exact required changes (these fold back into the RFC).

## Guardrail check (if this lens owns one)
e.g. the `security/escape` lens confirms no XSS regression; the `perf` lens confirms the sync hot path is untouched.
