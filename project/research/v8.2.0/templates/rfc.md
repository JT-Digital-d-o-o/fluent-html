---
id: RFC-<TRACK>-<NN>
track: <A|B|C|D|G>
title: <the proposed change>
resolves: [F-<TRACK>-<NNN>, ...]
cluster: C-<NN>
api_surface: []               # public symbols added/changed/removed
enforcement: type             # type | lint | dev-throw | runtime | boot | ci | prose (strongest feasible)
error_text: "…"               # verbatim first diagnostic a wrong guess now gets (type/lint layers) — from an executed probe
prose_deleted: []             # guideline lines this makes redundant, as path:line
guideline_delta: 0            # net lines; positive only for `prose-only` canon, with reason
lockstep: []                  # extractor | eslint | guidelines | template | ui
codemod: none                 # none | needed
codemod_dry_run: null         # measured, required if codemod: needed ("template 412/412, rideshare 88/91 (3 reported)")
dims_predicted: {}            # e.g. { silent-failure: +1 }
impact: <1..3>
effort: <S|M|L|XL>
ships_to: <8.1.x|8.2.0|9.0.0>
depends_on: []
status: proposed
---

# RFC-<id>: <Title>

## Problem
Grounded in the findings this resolves (their measures, file:line).

## Instruction-set check
What projects-template + packages/ui already do one layer up (grep results). Why this needs library support.

## Proposed change
Final TypeScript signatures / emitted bytes / rule definition. This is the contract.

## Before → after
Real code from a cited finding, and the verbatim diagnostic or output in each state.

## Enforcement
The layer, why it is the strongest feasible one, the verbatim error text (executed), and the one-shot
fix the message names.

## Replaces (converge)
What this makes redundant, or why nothing does. Guideline lines deleted (path:line) and net delta.

## Lane & migration
Why this lane (8.1.x: no public-shape change; 8.2.0: additive; 9.0.0: breaking, codemod-first).
Codemod map + receiver check + measured dry run if breaking.

## Guardrail check (§5, 1–13)
One line each: pass / N/A / needs-mitigation.

## Scorecard prediction
Per dimension, with the reasoning.

## Alternatives considered

## Open questions (for curation)
