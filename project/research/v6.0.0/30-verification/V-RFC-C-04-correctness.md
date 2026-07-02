---
rfc: RFC-C-04
lens: correctness
verdict: survives-with-changes
confidence: 0.74
killer_objection: The two target-gated lookups (matchClass/checkClassForKnownModifiers and getConflictGroup) are module-level PURE functions with no access to context.options, so the proposed minTarget/maxTarget gating and the new target option cannot be read at the point of matching — the RFC specifies the data shape but never the threading, and as written the v3 default path would still apply v4-gated entries, breaking the byte-identical-v3 promise.
required_changes:
  - "Thread `target` into the match functions. `matchClass`/`checkClassForKnownModifiers` (no-known-modifiers-in-setclass.ts:442,470) and `getConflictGroup` (no-conflicting-classes-in-setclass.ts:142) are module-level pure functions over module constants. The RFC must specify changing their signatures to accept `target: TailwindTarget` (or close over it inside `create()`), and filtering FIXABLE_PATTERNS / conflict tables by `(p.minTarget ?? 3) <= target && target <= (p.maxTarget ?? 4)` INSIDE the match loop. Without this the minTarget/maxTarget fields are dead data and both v3- and v4-gated entries fire on every run."
  - "Add the options schema to no-conflicting-classes-in-setclass. That rule currently has `schema: []` (line 174) and reads no options. The RFC's `no-conflicting-classes-in-setclass.options.target` requires adding the `{ target?: 3|4 }` object schema with `enum:[3,4]` AND reading `context.options[0]` in `create()` — neither is shown."
  - "Specify the cross-family gradient conflict code path; do not defer it to an open question. PREFIX_CONFLICTS keys `seen` by `prefix:${prefix}` (one key per prefix), so `bg-linear-to-r` (key `prefix:bg-linear-`) and a radial class (key `prefix:bg-radial-`) get DIFFERENT keys and never collide. Example 3's 'after' is unreachable with the `{ classes: [...] }` data alone. Add the concrete `getConflictGroup` branch that maps any of the four gradient engine prefixes to ONE shared key (e.g. return `'group:gradient'` when baseClass starts with bg-gradient-/bg-linear-/bg-radial-/bg-conic-), and state where that list lives."
  - "Guard the gradient conflict against color-stop false positives. `from-`/`via-`/`to-` are gradient color stops that legitimately co-occur with a direction (`bg-linear-to-r from-blue-500 to-purple-600` is ONE valid gradient — the RFC's own Example 1). The gradient conflict group must match ONLY the engine prefixes (bg-linear-/bg-radial-/bg-conic-/bg-gradient-), never from-/via-/to-, or every legitimate gradient becomes a false 'conflicting classes' error."
  - "Fix the v4 class name in Example 3. `bg-radial-at-center` is not a Tailwind v4 utility — v4 emits `bg-radial` (and `bg-radial-[<pos>]` for arbitrary position). Using a non-existent class in the canonical example undermines the vocabulary-correctness claim that is the RFC's whole purpose. Correct to `bg-radial`."
  - "Resolve the bare-utility match gap. `matchClass` uses `startsWith(pattern.pattern)`; a prefix entry `bg-radial-` MISSES the bare `bg-radial` (v4's actual default radial) and `bg-conic` likewise, re-introducing the silent-lapse the RFC exists to kill. Add exact-match entries for the bare forms, or define the prefix without the trailing hyphen and re-verify the slice."
  - "Pin the gradientTo round-trip against RFC-C-02. On v4 `setClass('bg-linear-to-r')` slices to `.gradientTo('to-r')`; the example asserts this re-emits `bg-linear-to-r`. Confirm in the api_surface overlap check that `.gradientTo('to-r')` on target 4 emits exactly `bg-linear-to-r` (not a v3 `bg-gradient-` or a malformed string), else the auto-fix produces a class the extractor cannot see (§11.7)."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-C-04-correctness.md
---

# Verdict: RFC-C-04 — correctness lens

> You are an ADVERSARY. Your job is to KILL this RFC through the correctness lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

I verified every cited line against the live plugin source
(`fluent-html-eslint-plugin/src/rules/`). The *diagnosis* in the Problem
section is accurate: line 384 maps `bg-gradient-` → `gradientTo` (dead on v4),
`rounded`/`shadow` are exact-match-only at 212-230 (so `rounded-xs`/`shadow-xs`
genuinely match nothing in the modifiers rule), and `backdrop-opacity-` is a
live prefix conflict at line 128. The data-table *edits* are individually
plausible. The design fails on **how the gate is actually read** and on
**three concrete v4 class-name facts in the worked examples**.

- **correctness failure mode 1 — the gate is never read (KILLER).** The whole
  proposal hinges on filtering tables by `target`. But the functions that do
  the matching are module-level and stateless:
  - `matchClass(className)` / `checkClassForKnownModifiers(className)`
    (no-known-modifiers-in-setclass.ts:442, 470) take only the class string and
    iterate the module constant `FIXABLE_PATTERNS`. No `target` parameter, no
    access to `context.options`.
  - `getConflictGroup(className)` (no-conflicting-classes-in-setclass.ts:142) is
    likewise a free function over module constants `CONFLICT_GROUPS` /
    `PREFIX_CONFLICTS`.
  The RFC shows `resolveTarget(options)` and `minTarget`/`maxTarget` fields but
  never shows the entries being *filtered* at the call site, nor the signature
  changes that would let `target` reach the loop. As literally specified the
  gating fields are inert metadata: a `maxTarget: 3` entry and a `minTarget: 4`
  entry would BOTH be live on every run. On a v3 project the v4-only
  `rounded-xs` entry then fires — a behavior change that directly breaks the
  §11.5 byte-identical-v3 promise the migration section makes. The feature does
  not function without a threading change the RFC omits.

- **correctness failure mode 2 — the gradient conflict group cannot fire.**
  `getConflictGroup`'s prefix loop returns `prefix:${prefix}` as the group key,
  one key per prefix. Adding `bg-linear-` and `bg-radial-` as separate prefixes
  gives `bg-linear-to-r` the key `prefix:bg-linear-` and a radial class the key
  `prefix:bg-radial-` — different keys, so the `seen` map in
  `checkForConflicts` never registers a collision. Example 3's "after"
  (`Conflicting classes 'bg-linear-to-r' and 'bg-radial-at-center'`) is
  **unreachable** with the `{ classes: [...] }` data the Proposed API ships.
  The RFC admits the gap in Open Question 2 ("small new code path in
  getConflictGroup") yet asserts the result as a worked example — the spec
  contradicts its own example.

- **correctness failure mode 3 — wrong v4 class name + bare-form miss.**
  `bg-radial-at-center` is not a v4 utility (v4 is `bg-radial`, plus
  `bg-radial-[<pos>]`). And `matchClass` uses `startsWith`: a prefix entry
  `bg-radial-` MISSES the bare `bg-radial` (v4's actual default radial), so the
  silent-lapse bug the RFC sets out to kill persists for the most common radial
  form. Same for `bg-conic`. The canonical example uses a class that does not
  exist, in a feature whose entire value proposition is class-name correctness.

- **correctness failure mode 4 — color-stop false positives.** A real v4
  gradient is `bg-linear-to-r from-blue-500 to-purple-600` (the RFC's own
  Example 1). If the gradient conflict group is matched loosely or pulls in
  `from-`/`to-`, every legitimate gradient becomes a false "conflicting
  classes" error. The RFC never draws the line that direction + stops are NOT
  mutually exclusive, so the two rules can disagree about the same string.

## Does it survive?

**survives-with-changes.** The findings (F-C-005/023/031/032/033/034) are real,
the cited lines check out, and the target-aware *strategy* is sound — one gated
table beats two maps or two packages. But as written the design does not run:
the gate is never threaded to the matchers (killer), the headline conflict
example cannot fire, and three v4 class-name facts in the examples are wrong or
incomplete. These are fixable without changing the architecture, so this is not
a reject — but they are load-bearing and must fold into the Proposed API, not
sit in Open Questions. The required_changes above are the exact edits.

Confidence 0.74 (not higher): the threading and cross-family-grouping changes
are "small code paths" the RFC gestured at but did not write, and the
false-positive boundary on the gradient conflict (engine prefixes yes,
stop classes no) is fiddly enough that I am not certain a single follow-up
nails it first pass.

## Guardrail check (correctness owns the class-string contract here)

- **§11.7 class-string contract:** AT RISK until the v4 names are corrected and
  the round-trip is pinned. `bg-radial-at-center` is not real v4 vocabulary;
  `.gradientTo('to-r')` re-emitting `bg-linear-to-r` is an unproven RFC-C-02
  dependency. Wave-4 `_merge.md` MUST confirm every `methodName` in the new
  entries (`gradientTo`, `gradientRadial`, `gradientConic`) exists in the lib
  and re-emits the exact v4 string it was matched from, else the auto-fix
  yields a class the extractor cannot detect.
- **§11.5 backward-compat:** AT RISK. "Byte-identical v3" holds only IF the gate
  is actually read; with the threading gap, v4-gated entries leak into the v3
  default path. Required-change #1 restores the guarantee.
- **§11.1 zero-deps:** PASS — all changes are in the dev-only ESLint package, no
  lib runtime dependency.
