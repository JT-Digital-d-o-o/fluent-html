---
rfc: RFC-A-07
lens: dx
verdict: survives-with-changes
confidence: 0.82
killer_objection: "The flagship worked examples `.rotate(\"-45\")` and `.skewX(\"-6\")` DO NOT COMPILE under the proposed (signature-unchanged) design — `TailwindRotate`/`TailwindSkew` have no negative members and no `(string & {})` escape, so the RFC ships a sign-aware `signNeg` fix that is unreachable dead code for 3 of its 4 transform methods."
required_changes:
  - "Widen `TailwindRotate` and `TailwindSkew` to admit negative literals (e.g. add `-1|-2|-3|-6|-12|-45|-90|-180` plus their `Stringified` string forms), OR change the four transform method signatures to accept a sign. Without this, `.rotate(\"-45\")`/`.skewX(\"-6\")`/`.skewY(\"-3\")` are compile errors and `signNeg` never receives a negative value — the core fix is dead code. Update the frontmatter: this becomes a type-surface change, not impl-only."
  - "Correct the false Type-safety claim (lines 203-204). `TailwindRotate`/`TailwindSkew` do NOT 'already include negative-capable members' (verified: src/core/tailwind-types.ts:148,234). Only `TailwindSpacing` (used by `translate`) admits negatives, and only via its `(string & {})` escape — so `.translate(\"y\",\"-1\")` compiles but ALSO bypasses the literal-union autocomplete the RFC sells as the typed-path benefit. State this honestly."
  - "Specify `signNeg` for the input it will actually receive. The only typed way a negative currently reaches `rotate`/`skew` is the `` `[${string}]` `` escape (e.g. `\"[-45deg]\"`), which does NOT `startsWith(\"-\")`, so `signNeg` would emit `rotate-[-45deg]` — fine, but the RFC's own bare example `.rotate(\"-45\")` can never arrive until the type widening lands. Tie the helper's contract to the widened types."
  - "Resolve the `.static()` open question (line 297) BEFORE merge — do not ship a DX RFC with its sharpest naming edge unresolved (§13 DX-smell guard). `static` is a legal property key so it runs; either commit to `static()` with a one-line house-style note or rename to `positionStatic()`."
  - "Close the §11.8 guideline gap: `skewY` appears in NEITHER guideline edit, and five display / three position shortcuts appear only inside a compressed `A() / .b()` slash-list rather than as runnable ✓/✗ snippets. Every `api_surface` symbol must be teachable. Also: the CLAUDE.md ✓ example `.rotate(\"-45\")` must not ship until the type widening makes it compile — sequence the guideline edit AFTER the type fix, never before."
file: product/research/v6/30-verification/V-RFC-A-07-dx.md
---

# Verdict: RFC-A-07 — dx lens

> You are an ADVERSARY. Your job is to KILL this RFC through the dx lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

I attacked where DX RFCs die: the gap between the advertised API and the API that actually compiles. The shortcut half is genuinely strong and survives clean. The flagship "negative transform fix" — which the RFC leads with and frames as the root-cause adoption win — has a fatal type-correctness hole.

- **dx failure mode 1 — the headline examples don't compile (killer).** The Proposed API (lines 99-100), Type-safety story (line 203), and the CLAUDE.md guideline edit (line 261) all advertise `.rotate("-45")` and `.skewX("-6")`. The actual types:
  ```ts
  // src/core/tailwind-types.ts:148
  export type TailwindRotate = 0|1|2|3|6|12|45|90|180 | Stringified<0|1|2|3|6|12|45|90|180> | `[${string}]`;
  // :234
  export type TailwindSkew   = 0|1|2|3|6|12 | Stringified<0|1|2|3|6|12> | `[${string}]`;
  // :6
  type Stringified<T extends number> = `${T}`;     // "45" — NEVER "-45"
  ```
  There is no negative literal and no `(string & {})` member. `"-45"` matches neither the union nor `` `[${string}]` `` (that needs bracket syntax `"[-45]"`). So **`.rotate("-45")` is a TS2345 error today and stays one after this RFC**, which explicitly keeps signatures unchanged ("impl-only fix"). That makes the `signNeg` helper — the whole correctness mechanism — unreachable for `rotate`/`skewX`/`skewY`: no value their types permit can carry a leading `-`. The RFC ships a sign-fix for a bug three of its four methods can no longer express. For a DX RFC this is the worst failure mode: an author follows the new guideline, gets a red squiggle, and retreats to `addClass("-rotate-45")` — *deepening* the exact F-A-066 adoption gap the RFC claims to close.

- **dx failure mode 2 — the type-safety story is factually false on its load-bearing claim.** Line 203 asserts these types "already include negative-capable members." They do not. The entire "impl-only, no call-site re-types, contract unchanged" argument rests on that false premise. Only `translate` works, and only because `TailwindSpacing` carries `(string & {})` — which means the one working method works by *erasing* the literal-union autocomplete the RFC sells as the typed advantage. The method that compiles does so for the wrong reason; the three that are "fixed" can't take the input the fix handles.

- **dx failure mode 3 — an unresolved naming question shipped in a DX RFC.** Line 297 leaves `.static()` vs `positionStatic()` open. It runs (legal property key) but is the most jarring name in the set; §13's DX-smell guard exists precisely so a DX RFC doesn't merge with its sharpest edge unresolved.

- **dx failure mode 4 — uneven guideline coverage (§11.8).** `skewY` is in `api_surface` but absent from both guideline edits. Five of six display shortcuts and three of five position shortcuts appear only in a compressed slash-list, not as house-style ✓/✗ snippets.

## Does it survive?

**Survives-with-changes** — and I seriously weighed `reject`, because a DX RFC whose lead examples don't compile is a strong reject candidate. Three things pull it back:

1. **The problem is real and well-evidenced.** I found 21 raw `addClass("-…")` negative call-sites across rideshare/jt-cut/ttl, plus the regression test `browse-rides.view.test.ts:258` asserting `-translate-y-1` and *not* `translate-y--1`. F-A-061 is a genuine silent-failure bug.
2. **The shortcut half is excellent and independently shippable.** I confirmed app authors already reach hard for zero-arg shortcuts: `.flex()`/`.hidden()` show 10+ call-sites in a single rideshare file. So `.absolute()`/`.fixed()`/`.inlineFlex()` land in an established, discoverable idiom (mirroring `.flex()`/`.grid()`/`.hidden()`), are impossible to misuse (zero-arg), and read at intent level. This part is a clean `survives`.
3. **`.neg()` documentation is pure upside** — verified zero call-sites across all apps; an existing correct helper that just needs teaching.

The verdict is `survives-with-changes` because the transform-correctness defect is salvageable in one move: widen `TailwindRotate`/`TailwindSkew` to admit negatives (required change 1). That makes `signNeg` reachable, makes the worked examples compile, and makes the type-safety claim true. Absent that change, the transform half should be **cut** and the RFC reduced to shortcuts + `.neg()` docs — still net-positive, but a much smaller win than advertised.

(Note: I measured `position()`/`display()` at 436 call-sites in the apps I can read, not the RFC's ~1,907 — not load-bearing since both methods are kept, but the count should be corrected or sourced.)

## Guardrail check (dx owns §11.8 guideline-sync)

- **§11.8 — partial fail, folded into required changes.** `skewY` is in `api_surface` yet in neither guideline edit; position/display shortcuts are taught only via a non-house-style slash-list. Critically, the CLAUDE.md ✓ snippet `.rotate("-45")` cannot ship against the current types — it would teach a compile error. The guideline edit must be sequenced *after* the type widening.
- **§11.6 consistency — pass for shortcuts.** They mirror `.flex()`/`.grid()`/`.hidden()` exactly and move apps off `addClass`. No prototype-name collisions (verified none of the 11 names already exist on the prototype).
- **§11.4 type-safety — FAIL as written.** "Impl-only, no re-types" is false for `rotate`/`skewX`/`skewY`; the advertised negatives don't type-check. Required change 1 is the remedy.
