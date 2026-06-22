---
rfc: RFC-A-01
lens: dx
verdict: survives-with-changes
confidence: 0.78
killer_objection: null
required_changes:
  - "Add 'nomodule' and 'default' to the BooleanAttribute union (src/elements/html-types.ts:40). The RFC deprecates setNomodule() and setDefault() and redirects callers to .toggle(\"nomodule\")/.toggle(\"default\"), but neither attribute is in the union — they fall through to the `(string & {})` escape tail, losing the autocomplete + typo-safety the type-safety story explicitly promises. Without this, the codemod replaces a typed setter with a weaker-typed string call: a net DX regression for those two."
  - "Add SelectTag/OptionTag.setSelected() to the `api_surface` frontmatter list, and add it to the explicit deprecate list in §2 (currently omitted). `selected` is in the prefer-set-method boolean block being dropped (prefer-set-method.ts:87), is migrated in the gzs worked example (`['disabled','selected']`), and setSelected exists in the lib — but the symbol is invisible in the traceability contract (ALGORITHM §6) and Wave-4 merge cannot catch collisions on an unlisted symbol."
  - "Add a `.setSelected(cond)` → `.toggle(\"selected\", cond)` row to the migration table in the fluent-html.md guideline edit. The table covers setChecked / setDefer / setAsync but omits setSelected, the canonical Option boolean — every symbol in api_surface must appear in the guideline edit (guardrail §11.8)."
---

# Verdict: RFC-A-01 — dx lens

> ADVERSARY: kill RFC-A-01 through the dx failure mode. Default-reject under uncertainty.

## Attack

The RFC's thesis — "collapse two boolean mechanisms onto the one documented `.toggle()` idiom, fix the `="false"` footgun" — is the right call, idiomatically consistent (guardrail §11.6), and discoverable. So the attack is not on the shape; it is on whether the surface is actually *complete and correctly typed at the converged endpoint*. The RFC's entire DX justification is "`.toggle()` strictly dominates the setters because it already carries the full literal union." I checked that claim against the source and it is **partially false**, in a way that turns the codemod into a localized DX regression.

- **dx failure mode 1 — the type-safety promise breaks for two redirected setters.** `BooleanAttribute` (src/elements/html-types.ts:40-45) is `disabled | required | checked | readonly | hidden | autofocus | autoplay | controls | loop | muted | multiple | selected | open | novalidate | defer | async | allowfullscreen | formnovalidate | inert | (string & {})`. The RFC deprecates `setNomodule()` (document.ts:233) and `setDefault()` (media.ts:267) and tells users to write `.toggle("nomodule")` / `.toggle("default")`. **Neither `nomodule` nor `default` is in the union.** Both fall through to `(string & {})` — no autocomplete, and a typo like `.toggle("nomdule")` is *not* caught. Today's `setNomodule()` is a strongly-named method; the RFC's replacement is a stringly-typed call. For these two attributes the migration makes types *worse*, directly contradicting the "literal union, not bare string" bullet in the Type-safety story. The fix is one line of union additions, but it has to be in this RFC or the codemod ships the regression.

- **dx failure mode 2 — `setSelected` is the invisible symbol.** `setSelected` exists, is in the `prefer-set-method` boolean block the RFC explicitly drops (prefer-set-method.ts:87), and is migrated in the RFC's own gzs worked example (`Option("—").setToggles(["disabled","selected"])` → `.toggle("selected")`). Yet it appears in **none** of: the `api_surface` frontmatter, the §2 explicit deprecate list, or the fluent-html.md migration table. `selected` is the single most common `Option` boolean — its absence from the migration table is the highest-frequency row missing. Under ALGORITHM §6 the `api_surface` list *is* the traceability/collision contract; an unlisted symbol means Wave-4 `_merge.md` cannot detect an overlap, and the guideline reader (an LLM) is never told `setSelected` is deprecated, so apps keep reaching for it. This is precisely the "orphaned API → un-adopted guideline" failure §11.8 exists to prevent.

- **dx failure mode 3 (non-blocking) — deprecation noise.** Marking ~14 setters `@deprecated` lights up TS warnings across ~12 template-derived apps and 186 call-sites at once. Acceptable *only because* both codemods (`prefer-toggle`, `no-set-toggles`) ship in the same release and are `recommended` — the RFC does this, closing the F-A-003 gap. Noted, not charged.

What does *not* kill it: the render branch (`typeof value === 'boolean'`) is runtime-type-driven, so the shared `_sk` array between string fields (`name`) and boolean fields (`open`) is safe — open question #3 is already answered by construction. The guideline edits hit the exact lines they claim (CLAUDE.md 120-125, fluent-html.md 47-53, both verified), are house-style (✓/✗, code-snippet-first, LLM-reader), and add the missing Script/`defer` example that is the actual F-A-046 discoverability fix. No XSS surface, no `any`, idiom-consistent. There is no killer objection.

## Does it survive?

**survives-with-changes.** The design is correct and worth the (negative) surface-area delta — it *removes* ~14 setters from the taught surface and unifies on one documented method; an app author already reaches for `.toggle()` for `required`/`disabled`, so extending that habit to `checked`/`defer`/`selected` is the obvious cut. Naming is right (`.toggle()` is established, no synonym invented — the RFC correctly rejects a `setBool` fork). But the converged endpoint must actually be type-complete and the guideline must teach *every* deprecated symbol, or specific high-frequency attributes (`selected`) and two niche ones (`nomodule`, `default`) become adoption/typing potholes. The three required changes are mechanical and fold straight back into the RFC.

## Guardrail check (§11.8, owned by dx lens)

The Guidelines impact section is real, both files patched, correct line targets, house style, LLM-reader. **It does not yet cover every symbol in `api_surface`:** `setSelected` is absent from the migration table (and from `api_surface` itself), and `nomodule`/`default` are redirected to an un-typed `.toggle()` form. With required changes 2 and 3 applied, §11.8 passes; as written, it is incomplete.
