# dx-ideas-8 — Refuter 2 verdict: CONFIRMED (not refuted)

**Finding:** README behavior table documents 8 of 13 behaviors; flagship examples bypass the fluent vocab they advertise.

**Mode:** refute-by-reproduction against `dist/` + source inspection.

## Reproduction

Probe run against the built library (`node -e` requiring `dist/src/index.js`):

```
back:   <button hx-on:click="history.back()">Back</button>
spaceY: <div class="space-y-4">x</div>
```

Both APIs the finding says the README omits/bypasses exist and work at runtime.

## Claim-by-claim

| Claim | Verdict | Evidence |
|---|---|---|
| Behavior table stops at `selectAll` (8 rows) | TRUE | README.md:854-863 — exactly 8 rows: toggle, toggleClass, remove, clipboard, disable, focus, scrollTo, selectAll |
| Source implements 13 behaviors | TRUE | src/core/behavior-methods.ts:12-26 (`BehaviorMap`, `back` at line 21) and renderers at lines 84-141 (`back` renderer at 121-124 emits `history.back()`) — matches the finding's line anchors |
| `back` appears nowhere in README | TRUE | `grep -n back README.md` finds only unrelated hits ("Welcome back", "opt back in", "fallback"); no `.behavior("back")`, no table row, no usage line |
| Flagship form example uses raw `setClass` strings | TRUE | README.md:526-527 verbatim: `.setClass("bg-blue-500 text-white px-4 py-2 rounded")` and `.setClass("space-y-4")` |
| `.spaceY("4")` exists | TRUE | src/class-vocab/vocab.ts:79 (`pre("spaceY", "space-y")`); reproduced above |
| The library's own lint rule would warn on those snippets | TRUE | fluent-html-eslint-plugin/src/rules/no-known-modifiers-in-setclass.ts maps `bg-` → `background` (line 39) and `space-y-` → `spaceY` (line 188); the rule ships enabled as `"warn"` in the recommended config (src/index.ts:53) |

## One softening nuance (does not refute)

4 of the 5 behaviors missing from the *table* — `formResetOnSwap`, `dismissOnEscape`, `openDialog`, `closeDialog` — **are** shown in the Usage code block immediately below it (README.md:878-881). So "documents 8 of 13" is accurate for the table specifically, but those four are not entirely undocumented. `back` is the only behavior with zero README presence anywhere. The finding's headline is worded about the table, so it stands; a fix should still add all five table rows for consistency, but the severity centers on `back`.

## Verdict

**refuted = false, confidence = high.** Every factual anchor checked out (file/line anchors exact), and the runtime behavior reproduced against `dist/`. The proposal (add 5 table rows incl. `back`, rewrite README.md:526-527 as fluent chains) is well-founded.
