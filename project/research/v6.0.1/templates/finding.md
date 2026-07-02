---
id: F-<TRACK>-<NNN>          # e.g. F-B-007 — assigned at creation, immutable
track: <A|B|C|D>
title: <one-line problem statement, specific>
kind: <bug|regression|inconsistency|platform-gap|missing-api|dx|type-hole|perf|adoption-gap|docs-drift>
evidence:                     # REQUIRED — at least one file:line in the shipped lib/tooling. No evidence → finding is dropped.
  - <repo/path/file.ts:LINE>
  - <repo/path/file.ts:LINE>
frequency: <int>              # how many call-sites / apps / surfaces exhibit it
pain: <high|medium|low>
ships_to: <6.0.1|6.1.0|parked-major>   # patch (bug) | minor (additive) | needs a breaking change → park
rough_idea: <one sentence — a possible fix, not a full design>
guardrail_risks: []          # any invariant this might threaten (zero-deps, ssr-only, escape, type-safety, additive-only, instruction-set, class-vocab-sync, guideline-sync)
guideline_gap: null          # if (also) a guidelines problem: the web-development/* file that under-teaches or mis-teaches it (else null)
status: open
---

# <Title>

## Problem
What's wrong / missing, concretely. Quote the offending **shipped** code (v6.0.0).

## Evidence
For each citation: what the code does today and why it's friction / wrong. Paste the actual snippet.

```ts
// repo/path/file.ts:LINE
```

## Why it matters
Frequency × pain. Who hits it, how often. For a platform-gap: which real HTML/ARIA capability is unreachable today.

## Rough idea (not a design)
A direction for Wave 2. One paragraph max — the RFC will do the real design. Note whether it's a patch (6.0.1) or additive (6.1.0).

## Related findings
[[F-X-NNN]] links to neighbors (same cluster candidates).
