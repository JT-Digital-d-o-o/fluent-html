---
id: F-<TRACK>-<NNN>          # e.g. F-B-007 — assigned at creation, immutable
track: <A|B|C|D>
title: <one-line problem statement, specific>
kind: <missing-api|bug|inconsistency|perf|refactor|tw4-gap|dx|adoption-gap>
evidence:                     # REQUIRED — at least one file:line. No evidence → finding is dropped.
  - <repo/path/file.ts:LINE>
  - <repo/path/file.ts:LINE>
frequency: <int>              # how many apps / call-sites exhibit it
pain: <high|medium|low>
rough_idea: <one sentence — a possible fix, not a full design>
guardrail_risks: []          # any §11 invariant this might threaten (zero-deps, ssr-only, escape, type-safety, compat)
guideline_gap: null          # if (also) a guidelines problem: the web-development/* file that under-teaches or mis-teaches it (else null)
status: open
---

# <Title>

## Problem
What's wrong / missing, concretely. Quote the offending code.

## Evidence
For each citation: what the code does today and why it's friction. Paste the actual snippet.

```ts
// repo/path/file.ts:LINE
```

## Why it matters
Frequency × pain. Who hits it, how often.

## Rough idea (not a design)
A direction for Wave 2. One paragraph max — the RFC will do the real design.

## Related findings
[[F-X-NNN]] links to neighbors (same cluster candidates).
