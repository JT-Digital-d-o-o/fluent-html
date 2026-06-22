---
rfc: RFC-C-03
lens: dx
verdict: survives-with-changes
confidence: 0.72
killer_objection: "The api_surface lists `backdropBlur()` but neither guideline edit teaches it — and the RFC's own §11.8 self-check (line 290) silently drops it from its enumeration. A §11.8 violation: an untaught API is an unadopted API. Compounded by `spaceX/spaceY` being demoted to 'just use flex().gap()' with no clarity that the methods still exist, and a global mutable `setTailwindTarget` singleton whose 'call once, before render' contract lives only in a JSDoc comment the LLM reader never sees."
required_changes:
  - "Add `.backdropBlur()` to the guideline edits. It is in `api_surface` and gains the same scale-shift remap as `.blur()`, yet neither the CLAUDE.md block nor the fluent-html.md table mentions it. Add it alongside `.blur` in the 'Automatic under v4' line of fluent-html.md (`.shadow/.rounded/.blur/.backdropBlur remapped`) and correct the §11.8 self-check enumeration on line 290 to include it."
  - "Teach the `setTailwindTarget` call-site contract in the LLM-facing guideline, not just the JSDoc. The CLAUDE.md v4 sub-section says 'call once at app entry' but never warns that it is a process-global mutable singleton: calling it per-request, inside a component, or after first render silently corrupts output with zero type or runtime error. Add an explicit cross line: `setTailwindTarget(\"v4\")` mid-render / per-request — cross: global, set once at module init before any render."
  - "Resolve the `gradientRadial()`/`gradientConic()` 'no-op-warns on v3' footgun in the guideline. The Tag interface advertises both methods unconditionally, but under the default target (`v3`) they emit nothing and warn at runtime. An LLM author reading autocomplete cannot distinguish a v4-only method from a universal one. Mark them v4-only in the fluent-html.md table (state they no-op under v3). The current edit shows them only as check (lines 254/278) with no v3 caveat."
  - "Fix the imprecise remap claim that misleads the implementer-reader. Line 128 says 'rounded/blur/backdropBlur follow the identical `{ \"\":·, sm:·xs }` remap table' — but the v4 target strings differ per utility (rounded bare→`rounded-sm`, sm→`rounded-xs`; shadow bare→`shadow-sm`, sm→`shadow-xs`, verified vs current tailwind-methods.ts:442,451). Same SHAPE, different VALUES. State 'same shape, per-utility values' so a reader does not literally reuse the shadow table for rounded."
  - "Add a `.spaceX/Y` coherence note. The migration table (line 222) calls it 'behavior only' and the guideline tells authors to 'prefer .flex().gap()' — but `.spaceX/Y` remain in the public surface unchanged. The guideline must clarify the methods still exist and emit `space-*`; the advice is to migrate the LAYOUT, not that the method is deprecated. As written, an LLM may conclude `.spaceX` was removed."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-C-03-dx.md
---

# Verdict: RFC-C-03 — dx lens

> You are an ADVERSARY. Your job is to KILL this RFC through the dx lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The core idea — a single build-target switch that auto-remaps the safe cases and lints the rest — is the *right* dx call: it strictly beats the rejected alternatives (per-call `.shadow("sm","v4")` is viral; v4-only hard-break strands `ttl`/`rideshare`). I could not kill the central mechanism. So I attacked the surface area and, decisively, the Guidelines edit — which guardrail §11.8 makes part of the product and which the `dx` lens owns. Several real failures:

- **dx failure 1 — an api_surface symbol the guidelines never teach (`backdropBlur`).** `Tag.prototype.backdropBlur()` is listed in `api_surface` (line 6) and gets a v4 scale-remap in the proposed interface (line 82) and emit logic (line 128). But it appears in **neither** guideline edit: the CLAUDE.md v4 block teaches `.outlineHidden/.ring/.border/.transition/.spaceY/.gradientTo`, and the fluent-html.md "Automatic under v4" line names only `.gradientTo/.shadow/.rounded/.blur`. Worse, the RFC's own §11.8 self-check (line 290) enumerates "`shadow`/`rounded`/`blur`/`outlineHidden`…" and **silently omits `backdropBlur`** while claiming it "covers every `api_surface` symbol." This is the exact orphaned-API failure mode the algorithm's §13 table flags (`Match` at 18:1). It is also a literal §11.8 violation, which the `dx` lens is mandated to escalate. This alone forces at minimum `survives-with-changes`.

- **dx failure 2 — the global mutable singleton's contract is invisible to the reader who needs it.** `setTailwindTarget` is "call once, before render" — a process-global mutable that, if called per-request or mid-render, silently emits the wrong vocabulary with no type error and no runtime error (it is a plain module-var read on the hot path, line 284). The contract lives only in a JSDoc comment (line 62). The guidelines' reader is an LLM (ALGORITHM §0.7), and the LLM-facing CLAUDE.md edit says merely "call `setTailwindTarget(\"v4\")` once at app entry" — no cross for the misuse. Given the library's own house rule *Never use `AsyncLocalStorage` for render-time data; context is sufficient* and the RFC's open-question #1 (a monorepo building two apps in one process cannot differ), this singleton is a real footgun the teaching must immunize against. A correct API with a misuse trap its guideline doesn't fence is an adoption failure.

- **dx failure 3 — v4-only methods are indistinguishable in autocomplete from universal ones.** `gradientRadial()`/`gradientConic()` are on the `Tag` interface unconditionally but "no-op-warns on v3" (lines 74-75). Under the *default* target they do nothing. An app author (or LLM) sees them in IDE autocomplete next to `gradientTo` with no signal they require a target flip. The guideline shows them only as check (lines 254, 278) with zero v3 caveat. Discoverability without correctness is a dx anti-pattern.

- **dx failure 4 — misleading guidance to the implementer plus a deprecation ambiguity.** Line 128 ("identical remap table" for rounded/blur/backdropBlur) is false at the string level — the v4 targets differ per utility (verified against current `tailwind-methods.ts:442,451,596,599`); only the *shape* is shared. And `.spaceX/Y` is told-to-avoid ("prefer `.flex().gap()`") while remaining in the unchanged public surface — the guideline reads as a soft deprecation when the method is in fact untouched, risking an LLM concluding `.spaceX` was removed.

What I could **not** make stick: naming (`outlineHidden()` over `.outline("hidden")` is correct per §11.6 and the library's "dedicated specialized method" idiom; `setTailwindTarget` matches the imperative-config voice); "worth the surface area" (every method earns its place against shipped-app evidence — 29 `.shadow()` sites, 26 `.outline("none")`, 64+ bare `.border()`); and consistency with the `ExtractorOptions`/ESLint `settings` plumbing. The mechanism survives; the teaching does not, yet.

## Does it survive?

**survives-with-changes.** The design is sound and idiomatic; the killer is in the Guidelines impact section the `dx` lens explicitly owns (ALGORITHM §7 Wave-3, §11.8). The required changes are all guideline/doc edits plus one self-check correction — none touch the API mechanism, so they fold back cleanly:

1. Teach `.backdropBlur()` and fix the §11.8 enumeration (line 290).
2. Add the `setTailwindTarget` misuse cross (global, set-once, pre-render) to the CLAUDE.md v4 block.
3. Caveat `gradientRadial/gradientConic` as v4-only in the fluent-html.md table.
4. Correct the "identical remap table" wording to "same shape, per-utility values."
5. Clarify `.spaceX/Y` is migrated-not-removed.

With those, the API is discoverable, hard to misuse, and fully taught. Without them — specifically (1) — it ships an untaught public method and a self-check that misstates its own coverage, which is precisely the adoption failure the algorithm treats as a guideline bug.

## Guardrail check (dx owns §11.8 — guideline-sync)

**FAIL as written.** The RFC asserts §11.8 "pass — Guidelines impact covers every `api_surface` symbol" (line 290), but `backdropBlur()` (in `api_surface`, line 6) is taught in neither edit and is dropped from the self-check's own enumeration. The §11.6 idiom check (dedicated methods, `.on()`/`.at()` untouched) genuinely passes. §11.8 passes only after required change (1).

I also confirmed the guideline target/line references are otherwise accurate: `web-development/CLAUDE.md:159` is exactly `.on("focus", t => t.ring("2").ringColor("blue-300").outline("none"))` (verified), so the replace-line edit lands correctly; and `web-development/fluent-html.md` "after line 113" inserts the new section between the arbitrary-values block and `## Control Flow` (line 115) — a clean placement. House style (succinct check/cross, code-first, LLM-reader) is respected in both proposed blocks.
