---
rfc: RFC-A-02
lens: [type-safety, dx, correctness]
verdict: survives-with-changes
confidence: 0.72
killer_objection: >
  §11.7 is FALSE-by-construction, not N/A-by-construction. The `show`/`hide` behaviors apply
  `'hidden'` + a `DisplayClass` token at runtime via `classList.add()` inside `hx-on` JS. The
  Tailwind extractor (fluent-html-tailwind-extractor/src/extract.ts) only emits classes for
  fluent CALLS mapped through `classVocab`, plus a generic literal-token regex over source.
  `behavior('show')` is not a vocab method, so the extractor emits nothing for it; the renderer
  DEFAULT `'flex'` and the always-added `'hidden'` are renderer-internal literals that never
  appear in app source, so they are NOT guaranteed safelisted. Worse, `DisplayClass` includes
  `'table'`, which has NO vocab entry at all (no `stat("table","table")` in vocab.ts) — a valid
  Tailwind utility the lib's own safelist can never force-list. This is exactly the
  dynamic/runtime-applied, extractor-unresolvable class §11.7 forbids.
required_changes:
  - "Rewrite the §11.7 section: drop the 'N/A by construction' claim. `show`/`hide` apply `hidden` + a `DisplayClass` token at runtime via `classList.add()` — the extractor (which scans vocab method CALLS + a literal source regex, never `hx-on` JS) cannot see them. State plainly that the behavior's internal tokens MUST be force-safelisted."
  - "Register a forced-safelist entry covering the FULL `DisplayClass` union ('flex','grid','block','inline-flex','inline-block','inline','contents','table') PLUS 'hidden' so the renderer-default 'flex' and the always-added 'hidden' are emitted regardless of whether the app independently calls `.flex()`/`.hidden()`. Add the missing `stat(\"table\",\"table\")` row to src/class-vocab/vocab.ts (no display utility for `table` exists today). Do this IN LOCKSTEP across src/class-vocab/vocab.ts, ../fluent-html-tailwind-extractor, and ../fluent-html-eslint-plugin, and flip the api_surface/guideline_updates lines that currently say 'no extractor/eslint README change'."
  - "Either DROP `'table'` from `DisplayClass` (no overlay uses display:table; it is dead surface that widens the safelist hole) OR justify it and register it per the change above. Default to dropping — converge on the display tokens overlays actually use ('flex','grid','block' cover the cited sites)."
  - "Resolve the form-reset convergence/correctness smell: the SHIPPED `formResetOnSwap` emits the htmx-2/3 dash event `htmx:after-swap` (behavior-methods.ts:126), which is WRONG for htmx 4 (the four.htmx.org event is `htmx:after:swap`, colons). The new `resetFormOnSuccess` correctly uses colon names. Either fix `formResetOnSwap`'s event name to `htmx:after:swap` in this RFC (lockstep with the new behavior, so both reset behaviors are htmx-4-correct) or add an explicit note that `formResetOnSwap` is pre-existing-broken under htmx 4 and is NOT the convergence target. Do not ship two reset behaviors where one silently never fires."
  - "Resolve open-question P4-default in the RFC body, not as an open question: pin `show`/`hide` default to `'flex'` (or `'block'`) as a NAMED constant and note it is overridable; an unresolved default in a shipping API is a DX trap."
  - "Add an ESLint convergence rule (or extend `prefer-toggle`) so `.toggle('readonly'|'disabled', x)` on a form control is flagged toward `.setEditable(!x)` — otherwise the 'one convergent verb' claim is unenforced and the double-negative idiom persists. If deferred, drop the §11.6 CONVERGE 'pass' to 'pass with follow-up' and say so."
---

## Attack

Hunted across all six kill vectors; verified every source claim against the tree.

**(1) Already shipped?** Checked CHANGELOG 6.0.0→6.1.1 and source. `ForEachGroup`, `ariaCurrent`,
`setEditable`, `resetFormOnSuccess`, `show`, `hide`, `DisplayClass`, `AriaCurrentValue` are all
net-new — none appear in `iteration.ts`, `tag.ts`, `forms.ts`, `behavior-methods.ts`, or aria-types.
The RFC HONESTLY drops the `whenElse` nullable two-branch item as already-shipped (verified:
tag.ts:266 `whenElse<T>(value: T | null | undefined, thenFn: (tag, value: NonNullable<T>)…)` exists;
CHANGELOG 6.0.0 records it). Good faith; no instant-reject on this axis.

**(2) §11.7 lockstep — THE hole.** The RFC's §11.7 claims `show`/`hide` are "N/A by construction"
because the tokens "never land in a `class` attribute." That misreads how the extractor works.
`fluent-html-tailwind-extractor/src/extract.ts` builds `VOCAB_BY_METHOD` from `classVocab` and emits
a method's classes only when it sees that METHOD CALLED (`scanMethod`), plus a generic literal-token
regex (`extractDefaultClasses`) over source. `behavior('show', {…})` is not a vocab method, so the
vocab path emits nothing. I confirmed the literal regex DOES catch an EXPLICIT `display: 'grid'`
(token `grid`) from source — so an explicitly-passed value is incidentally rescued. But:
  - The renderer DEFAULT `'flex'` (when `display` is omitted) never appears in source.
  - The always-added `'hidden'` never appears in source.
  Both rely on the app independently calling `.flex()` / `.hidden()` as fluent methods to be
  generated — NOT guaranteed. An app whose overlays go exclusively through `behavior('show'/'hide')`
  gets a runtime `classList.add('flex')`/`add('hidden')` with no CSS backing → the overlay silently
  fails to display. This is precisely the dynamic-class-the-extractor-can't-resolve failure §11.7
  exists to forbid.
  - `DisplayClass` includes `'table'`, for which there is NO vocab row (grep of vocab.ts: `stat`
    rows exist for block/inline-block/inline/inline-flex/inline-grid/contents/hidden, `opt("flex")`,
    `stat("grid")` — but NOTHING for `table`). So `display: 'table'` cannot even be force-listed via
    the lib's safelist path. Dead surface that also widens the hole.
This is the killer objection. It does not sink `ForEachGroup`/`ariaCurrent`/`setEditable`/
`resetFormOnSuccess` (those emit zero classes — genuinely §11.7-clean), only `show`/`hide`.

**(3) Naming collisions.** None. grep'd forms.ts / tag.ts: no `setEditable`, `setReadonly`,
`setDisabled`, or `ariaCurrent` exist. `InputTag`/`TextareaTag`/`SelectTag` class sites match the
RFC (forms.ts:15/147/449). `BehaviorMap` has no `show`/`hide`/`resetFormOnSuccess` (behavior-methods.ts:12-26).

**(4) Convergence.** Two soft smells, no hard violation:
  - `resetFormOnSuccess` coexists with `formResetOnSwap`. Defensible (different event, different
    semantics) — BUT the shipped `formResetOnSwap` uses `htmx:after-swap` (dash, htmx-2/3), which is
    WRONG under htmx 4 (`htmx:after:swap`, colons — confirmed at four.htmx.org). So the RFC adds a
    correct second reset behavior next to a pre-existing broken one. Must be reconciled.
  - `ariaCurrent` + `setAria({ current })` is two paths, but scoped honestly (boolean-gated nav vs
    escape hatch). Acceptable.
  - `setEditable` convergence is real but UNENFORCED — no eslint rule steers `.toggle('readonly',x)`
    toward it.

**(5) Type holes.** Clean. `K extends string | number` (closed, matches ForEachKeyed:121).
`AriaCurrentValue` = the exact closed arm of aria-types.ts:70 minus boolean — verified identical.
`DisplayClass` closed. `setEditable(boolean)`. No `any`/bare-`string` in any public signature.

**(6) Security / escape.** Clean. The `resetFormOnSuccess` JS is a fixed library-owned literal
stored verbatim and HTML-attribute-escaped at serialize via `escapeAttr` (serialize.ts:270/285;
`<` → `&lt;`, which the browser un-escapes to `<` when htmx reads the attr). `show`/`hide` route the
`Id` target through `el()` → `escapeJs()` (behavior-methods.ts:70-72); `DisplayClass` is a closed
union so no free string reaches the JS. No new XSS sink.

**Correctness bonus (resolves an RFC open question in the RFC's favor):** I verified htmx 4's event
contract at four.htmx.org/reference/events/htmx-after-request — the event IS `htmx:after:request`
(colons) and the status path IS `event.detail.ctx.response.status`. So `resetFormOnSuccess`'s literal
is correct for the pinned htmx 4. The RFC's flagged external-contract risk resolves positively.

## Does it survive?

**survives-with-changes.** Four of the five primitives (`ForEachGroup`, `ariaCurrent`,
`setEditable`, `resetFormOnSuccess`) are net-new, type-clean, collision-free, escape-safe, and
htmx-4-correct — they survive as drafted. The fifth, `show`/`hide`, ships a FALSE §11.7 claim that
masks a real lockstep hole (renderer-default `flex` + always-added `hidden` + the entirely-unregistered
`table` token are runtime-applied classes the extractor cannot resolve). That is a ship-blocker for
`show`/`hide` specifically, plus a convergence/correctness reconciliation owed for the two
form-reset behaviors. None of these sink the RFC's core thesis (all five are genuine core-primitive
gaps, not components/glue), so this is changes-not-reject — but the changes are non-optional and the
§11.7 section as written must not ship.

## Guardrail check

- §11.1 zero-deps — PASS. `ForEachGroup` uses native `Map`; rest reuse in-scope primitives.
- §11.2 ssr-only — PASS. All synchronous string-building; `ForEachGroup` is one O(n) pass.
- §11.3 escape-by-default — PASS. behavior JS HTML-attr-escaped (escapeAttr) + `escapeJs` on the id;
  `DisplayClass` closed so no free string reaches the JS; `aria-current` is a closed token.
- §11.4 type-safety — PASS. Closed `K`/`AriaCurrentValue`/`DisplayClass`, branded `Id`, no `any`/bare-`string`.
- §11.5 additive-only — PASS. Every symbol new; no existing signature/output touched.
- §11.6 instruction-set / CONVERGE — PASS WITH FOLLOW-UP. All five are primitives, not components.
  But `setEditable` convergence is unenforced (no eslint rule), and the `resetFormOnSuccess` /
  `formResetOnSwap` pair needs reconciling (the shipped one is htmx-4-broken). See required_changes.
- §11.7 class-vocab / extractor-eslint lockstep — **FAIL** for `show`/`hide`. "N/A by construction" is
  false: runtime `classList.add()` of `hidden` + a `DisplayClass` token is invisible to the extractor;
  renderer-default `flex`, always-added `hidden`, and the unregistered `table` are not guaranteed
  safelisted. Must force-list the full token set (and add the missing `table` vocab row) across
  vocab + extractor + eslint, or drop `table` and narrow the set. `ForEachGroup`/`ariaCurrent`/
  `setEditable`/`resetFormOnSuccess` are §11.7-clean (emit zero classes).
- §11.8 docs/guideline-sync — PARTIAL. README/fluent-html.md/htmx.md/JSDoc/CHANGELOG coverage is
  listed, but the "no extractor/eslint README change" line is wrong given the §11.7 fix — flip it.
