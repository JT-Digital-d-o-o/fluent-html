# core-tag-5 — Refuter verdict: NOT REFUTED (defect confirmed)

**Finding:** No class-conflict resolution — chain order does not determine the winning utility.

**Verdict: CONFIRMED.** I attempted to refute by locating any dedup/conflict guard in the runtime and found none; the repro executes exactly as claimed.

## Positive confirmation

1. **`addClass` only appends** — `src/core/tag.ts:125-137`: `this.class += ' ' + classes` with no prefix/group inspection.
2. **Serialization emits the class string verbatim** — `src/render/serialize.ts:253-254`: `if (tcls !== undefined) attrs += ' class="' + escapeAttr(tcls) + '"'`. No dedup, no conflict-group logic anywhere in `src/core/` or `src/render/` (grepped for merge/dedup/conflict/last-wins; only hits are unrelated: `headers` id dedup in `tables.ts`, `setStyle` JSDoc).
3. **Runtime repro (executed against `dist/`)**:
   ```
   node -e "const m = require('./dist/src/index.js');
            console.log(m.render(m.Div().padding('4').when(true, x => x.padding('2'))));"
   → <div class="p-4 p-2"></div>
   ```
   Both utilities ship. In Tailwind's generated stylesheet `p-2` sorts before `p-4`, so **`p-4` wins even though `.padding('2')` was applied later in the chain** — chain order is not the winner-determinant.

## Where the finding overstates (severity qualifiers, not refutations)

- **FLUENT-STYLING.md:42-47 does not actually document an override idiom.** The `.when()` examples there (`toggle("disabled").opacity("50")`, `background("blue-500")` on a bare `Button`) have no base-class conflicts. No doc I found promises last-wins semantics for classes. So this is an unguarded footgun, not a broken written contract. (Note: `README.md:2252` does show a chain with two `.background()` calls marked "✅ auto-fixed — fluent methods append safely", which invites exactly this misreading.)
- **The actual ESLint rule message is accurate.** `no-conflicting-classes-in-setclass.ts:182` says `"Conflicting classes '{{first}}' and '{{second}}' - only one will take effect."` — correct. The "p-8 overwrites p-4" wording exists only as an illustrative comment in `fluent-html/README.md:2262,2265`, which is the doc nit to fix.
- **Lint coverage is narrower than the finding states.** The conflict rule only inspects `setClass`/`setClasses` string literals (`no-conflicting-classes-in-setclass.ts:236,248`). There is no rule covering conflicting *fluent method* calls at all — `.padding('4').padding('2')` in one chain is invisible to lint even statically, not just in `.when()` branches. The gap is larger than claimed.

## Conclusion

The core defect is real and reproduced: no runtime conflict resolution exists, both conflicting utilities are emitted, and the CSS winner is decided by Tailwind's stylesheet sort rather than chain order — in the repro the *earlier* chain call wins. The proposal's framing should be adjusted (no documented override idiom is being violated; the misleading text is the README's "overwrites" comments and the "append safely" example), but the finding stands.
