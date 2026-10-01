---
id: F-<TRACK>-<NNN>          # TRACK ∈ A|B|C|D|G; NNN from your angle's reserved range; immutable
track: <A|B|C|D|G>
angle: <A1..D5 | G-taught | reseed>
title: <one-line problem statement, specific>
kind: <bug|silent-failure|error-quality|missing-contract|prune|converge|rename|platform-drift|perf|teaching>
evidence_kind: code          # code | census | experiment | probe | history | runtime
measure: "<REQUIRED: a number or file:line>"   # e.g. "0 call sites / 46 repos (canonical era: 0 / 3)"
evidence:                     # REQUIRED — file:line citations and/or the commands you executed
  - <repo/path/file.ts:LINE>
primary_evidence: <path#symbol>   # the second dedup key
dims: []                      # scorecard dimensions it hurts: prior-alignment | error-quality | invariant-safety | context-economy | decision-closure | verification-loop | evolvability | silent-failure
reach: <1..3>                 # census breadth or experiment recurrence (replaces `frequency`)
impact: <1..3>
pain: <1..3>
effort: <S|M|L|XL>
prior: null                   # ledger id (L-NNN from 00-recon/04-prior-ledger.md) if re-raising, + what evidence is NEW
ships_to: <8.1.x|8.2.0|9.0.0|parked|decision-gated>
rough_idea: <one sentence — a direction, not a design>
status: open
---

# <Title>

## Problem
What is wrong, concretely. Quote the offending code or the verbatim output.

## Evidence (executed)
The commands you ran and their key output, and/or file:line snippets. A claim you did not execute or
cite is not evidence. Banned words: commonly, often, rarely.

## Why it matters
impact × pain × reach, and the scorecard dimension it hurts.

## Rough idea (not a design)
One paragraph max. Name the strongest enforcement layer that could hold it (type > lint > dev-throw >
runtime > boot/ci > prose) and what prose it would let us delete.

## Related
[[F-X-NNN]] neighbors; [[L-NNN]] ledger rows.
