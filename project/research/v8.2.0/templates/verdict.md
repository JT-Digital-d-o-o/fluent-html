---
rfc: RFC-<TRACK>-<NN>
lens: <correctness|type-safety|runtime-contract|breaking-change|agent-fitness|security/escape|instruction-set|combined>
verdict: <survives|survives-with-changes|reject>
confidence: <0.0-1.0>
killer_objection: null        # the single strongest reason this should NOT ship
guardrail_killer: null        # §5 guardrail number it violates, if the objection is a guardrail
required_changes: []          # populated iff survives-with-changes; implementers read these first
executed:                     # REQUIRED — commands run + key output. A verdict with none is invalid and re-run.
  - cmd: "<command>"
    output: "<key lines>"
---

# Verdict: RFC-<id> — <lens> lens

> You are an ADVERSARY. Kill this RFC through the <lens> lens. Default to `reject` under
> uncertainty. Reading code is not verification: execute.

## What I executed
Commands, fixtures, byte-diffs, probes — and what they showed.

## Attack
The strongest case against the RFC from this lens.

## Does it survive?
Verdict + reasoning. If `survives-with-changes`, the exact required changes.

## Guardrail check (if this lens owns one)
