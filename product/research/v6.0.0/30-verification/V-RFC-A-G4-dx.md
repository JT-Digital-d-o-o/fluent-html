---
rfc: RFC-A-G4
lens: dx
verdict: survives-with-changes
confidence: 0.8
killer_objection: null
required_changes:
  - "Stop dropping live content: the proposed fluent-html.md replacement of the 'Key method categories' line (RFC line 211) silently deletes two categories present today at fluent-html.md:107 — gradients (`gradientTo`, `from`, `via`, `to`) and group/peer (`group()`, `peer()`). Re-add both, or scope the edit to APPEND `display`/`hidden` to the existing `layout (flex, grid, w, h)` group rather than rewrite the whole line."
  - "Fix stale before/after framing for fluent-html.md. RFC Worked-example (A) and the fluent-html.md `.apply()` block in Guidelines impact are presented as a change, but fluent-html.md ALREADY contains the corrected `card`/`hoverLift` form (lines 97-100, `.padding('6')...` + `.on('hover', ...)`). The only live `.apply()`/`addClass` anti-pattern is in the JSDoc (tag.ts:208) and README (README.md:153). Re-scope the F-A-084 fix to JSDoc+README; do not re-edit fluent-html.md's already-clean `.apply()` example."
  - "Disambiguate the `.hidden()` name collision in the guideline. `Tag.prototype.hidden()` (display:none) and `formFor<T>().hidden(name, value)` (hidden input, taught at fluent-html.md:80) share a name. Add a one-line note to the Display sub-section: '`.hidden()` on a Tag = display:none; `formFor().hidden()` = hidden input — different methods.'"
  - "Correct the rideshare cite: the `.display(...).hidden().at('md', ...)` lines are at landing.components.ts ~35-37, not :34-36 as cited twice. Trivial, fix for traceability."
---

# Verdict: RFC-A-G4 — dx lens

> You are an ADVERSARY. Your job is to KILL this RFC through the dx lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

This RFC adds **no public surface** — it is a teaching + error-message correction. So the classic dx kill shots (worth the surface area? would an author reach for it? is the naming right?) mostly don't bite: `.display()`/`.hidden()`/`.transition()`/`.on()`/`.at()` already ship and are demonstrably high-frequency. Verified counts across just rideshare/ttl/jt-cut/tela/landing: **280 `.display(`, 36 `.hidden(`, 329 `.transition(`** call-sites — consistent with the larger project-wide figures the RFC quotes. The cited "discovered only by autocomplete" code (`rideshare/src/landing/landing.components.ts`) is real and matches. The substance is sound. So the attack must land on the **Guidelines impact** section, which §11.8 and the dx lens own — and that is where the RFC is sloppy enough to cause an adoption failure if shipped verbatim.

- **dx failure mode 1 — the guideline edit deletes live, correct teaching.** I diffed the RFC's proposed fluent-html.md "Key method categories" replacement (RFC line 211) against the *actual* current line (fluent-html.md:107). The live line lists **gradients (`gradientTo`, `from`, `via`, `to`)** and **group/peer (`group()`, `peer()`)** categories. The RFC's replacement omits both to make room for display/hidden. Shipping it verbatim *removes* the only place gradients and group/peer are taught to the LLM — trading one adoption gap for two new ones. For a track whose thesis is "an un-taught API is an un-adopted API," silently un-teaching `group()`/`peer()` is self-inflicted.

- **dx failure mode 2 — stale before/after that doesn't match the file.** Worked-example (A) and the fluent-html.md half of Guidelines impact present the corrected `card`/`hoverLift` `.apply()` snippet as the change to make. But fluent-html.md already contains exactly that form (lines 97-100). The drift lives in the **JSDoc (tag.ts:208, verified still `setClass("rounded shadow p-4 bg-white")`)** and **README (README.md:153, verified identical anti-pattern)** — not in fluent-html.md. A Wave-4 applier following the RFC literally would re-edit an already-clean file while under-emphasizing the README, which is the longer, more-read, still-broken surface. The Problem section scopes this correctly (README+JSDoc); the Guidelines impact section then over-reaches.

- **dx failure mode 3 — `.hidden()` name collision, untaught.** fluent-html.md already teaches `formFor<T>().hidden("role", "admin")` (line 80) — a hidden *input field*. The RFC adds `Tag.prototype.hidden()` (= `display:none`) teaching nearby with no disambiguation. Two methods, same name, opposite domains, one file: exactly the ambiguity that makes an LLM emit `f.hidden()`-as-display-none or `Div().hidden("role")`. The names are locked (both ship), so the only mitigation is a one-line guideline note — which the RFC omits.

None of these is a guardrail-killer. Each is a concrete defect in the deliverable §11.8 requires to be "correct, minimal, in house style." A patch that deletes two categories, edits an already-clean file, and ignores a name collision is not yet correct-and-minimal.

## Does it survive?

**survives-with-changes.** The core call — promote the high-frequency display/variant methods from invisible to taught, kill the README "Traditional Tailwind" framing (verified live at README.md:1110/1252), and rename the blocked-event error (verified at tag.ts:27, still "use client-side JS or HTMX instead") to name `.behavior()`/`.setHtmx()` instead of the banned "client-side JS" — is correct, well-evidenced, additive, and squarely on the §11.8 mandate. The reworded error is a genuine dx win: it converts a dead-end that demonstrably routed apps into `addAttribute("hx-on:click", rawJs)` into a discovery surface naming the real API. I cannot kill it.

But the Guidelines impact section — the thing this lens owns — has the three defects above, which would degrade adoption if shipped verbatim. They fold back as `required_changes`. With them applied, the patch is correct, minimal, house-style.

## Guardrail check (§11.8 — guideline-sync, owned by this lens)

- Coverage: every `api_surface` symbol is in the proposed edit — `.display()`/`.hidden()` (Display sub-section, both files), `.transition()` (styling block), `.on()`/`.at()` (variant rule, both files). **Pass** — the defects are in *quality*, not *coverage*.
- House style (succinct, ✓/✗, code-first, LLM-reader): **mostly pass.** The one violation is the category-line rewrite that drops content (required_change #1).
- CLAUDE.md insertion point (after the styling block at ~line 162, before `---`) verified accurate — the `## Fluent Tailwind Styling` block ends exactly there. **Pass.**
- Confirmed `.display()`/`.hidden()` (the Tag methods) appear in **neither** guideline today; the single `hidden` hit in fluent-html.md is the unrelated `formFor().hidden()`. The adoption gap is real. **Pass.**
- Confirmed `.flex()`/`.grid()` exist (tailwind-methods.ts:401 + grid at :163 decl), so the RFC's "use .display('flex') or .flex()" advice is valid. **Pass.**
