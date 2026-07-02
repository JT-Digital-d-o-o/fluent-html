# dx-ideas-8 — Refuter 1 verdict

**Verdict: NOT REFUTED (finding confirmed, with one accuracy caveat)**

Mode: refute-by-code-reading. I attempted to find the doc row, example, or guard that makes this a non-issue; the evidence instead confirms the finding.

## Claims checked against code

### 1. Behavior table lists 8 of 13 behaviors — CONFIRMED
- `README.md:854-863`: the table has exactly 8 rows (`toggle`, `toggleClass`, `remove`, `clipboard`, `disable`, `focus`, `scrollTo`, `selectAll`).
- `src/core/behavior-methods.ts:12-26` (`BehaviorMap`) and `:84-141` (`renderers`) define **13** behaviors. `back` is typed at line 21 and rendered at lines 121-124 as `history.back()` — exactly as the finding states.

### 2. `back` appears nowhere in the README — CONFIRMED
- `grep -n "back" README.md` yields only unrelated hits (`background(...)`, "Welcome back", "opt back in"). No `.behavior("back")` usage, no table row, no prose mention.

### 3. Complete Form Example bypasses the fluent vocab — CONFIRMED
- `README.md:526`: `Button("Register").setType("submit").setClass("bg-blue-500 text-white px-4 py-2 rounded")`
- `README.md:527`: `Fieldset(...).setClass("space-y-4")`
- `.spaceY()` exists: `src/class-vocab/vocab.ts:79` (`pre("spaceY", "space-y")`) and `src/core/tailwind-methods.ts:277,725`.

### 4. The library's own lint rule would warn on these snippets — CONFIRMED
- `fluent-html-eslint-plugin/src/index.ts:53` ships `"fluent-html/no-known-modifiers-in-setclass": "warn"` in the recommended config.
- The rule's fixable patterns cover every class in the snippet: `bg-` (line 40), `text-white` (line 42), `px-`/`py-` (lines 21-22), and `space-y-` (line 188 → `spaceY`). The README's flagship form example is code the plugin's default config flags.

## Accuracy caveat (softens severity, does not refute)

The headline "documents 8 of 13" is true only of the **table**. Four of the five missing behaviors — `formResetOnSwap`, `dismissOnEscape`, `openDialog`, `closeDialog` — *are* shown in the Usage section immediately below (`README.md:878-881`), and `openDialog`/`closeDialog` are also discussed at line 961. So the README documents 12 of 13 behaviors overall; only `back` is entirely absent, and only the table (the section a reader scans for "what behaviors exist and what options do they take") is missing five rows with their options/event columns.

This caveat reduces the scope of the fix (table rows + `back` documentation, rather than "five undocumented behaviors") but the defect as anchored — incomplete table, `back` invisible, flagship example contradicting the fluent-first pitch and the shipped lint rule — is real.

## Conclusion

No guard, alternate doc location, or intentional-semantics argument neutralizes the finding. `refuted = false`.
