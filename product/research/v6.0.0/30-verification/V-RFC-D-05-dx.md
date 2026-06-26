---
rfc: RFC-D-05
lens: dx
verdict: survives-with-changes
confidence: 0.78
killer_objection: null
required_changes:
  - "Do NOT add `escapeJs` to the public `src/index.ts` barrel. It is an internal renderer helper; an app author calling `escapeJs` by hand is the exact anti-pattern the RFC's own guideline edit warns against (\"never hand-roll inline JS\"). Keep it a shared module-internal util (e.g. `src/core/escape.ts`) imported by behavior-methods + future renderers. Remove it from `api_surface` as a *public* symbol; describe it as `escapeJs(str)` — internal shared util."
  - "Do NOT add `validateAttributeKey` to the public `src/index.ts` barrel. `addAttribute` already calls it internally; a public export invites apps to pre-validate keys themselves (dead, misuse-prone surface) and creates a second contract to keep in sync. Export it only from an internal path the fold layer imports (e.g. re-export within `src/core/index.ts` for intra-lib use, not the root barrel). Mark it `# internal — fold reuse only` in `api_surface`."
  - "Fix the §11.8 guideline-coverage claim. As written it asserts guidelines cover \"every api_surface symbol,\" but `escapeJs` and `validateAttributeKey` are listed as exports with NO teaching rule. Once they are internal (changes 1-2) the claim becomes true and the gap closes. Update the Guardrail-check §11.8 bullet to state these two are internal and intentionally untaught (auditable in-source, not app-facing)."
  - "Resolve Open question 1 inside the RFC, do not punt `tocCoalgebra` to \"a human.\" A Wave-3 dx verdict cannot leave an exported, always-broken symbol (`tocCoalgebra`, emits anchor-less invalid HTML) in an ambiguous state — that IS the dx decision. Recommend: remove it in v6 (no correct caller exists) and document `linkedTocCoalgebra` as the single TOC builder; add the one-line `breaking-changes.md` note. Fold the removal into `api_surface`/migration."
  - "Add the missing `## Status-code routing` example update to `htmx.md`. The RFC replaces only the section *intro* (line 124-126) but the code block immediately below it (lines 128-138) already shows `{ 422: {...}, \"5xx\": {...} }` — confirm in the edit that this example is now *type-checked* by `HxStatusKey` (it is, and validly), so the snippet needs no change beyond the intro. State this explicitly so the guidelines-merge agent does not re-baseline a correct example."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-D-05-dx.md
---

# Verdict: RFC-D-05 — dx lens

> ADVERSARY review. Goal: kill RFC-D-05 through the dx failure mode. Default-reject under uncertainty.

## Attack

The security/correctness *engine* of this RFC is sound and verified against source (see Guardrail check). The dx attack is not on the fix — it is on **what leaks into the public surface and whether the teaching matches the surface.**

- **dx failure mode 1 — two new public exports an app author must never call.** `api_surface` promotes `escapeJs(str)` and `validateAttributeKey(key)` to public exports (RFC lines 9, 48-50, 75; "promoted to a named export"). Both are *internal safety mechanisms*. `addAttribute` already calls `validateAttributeKey` for the app author (`src/core/tag.ts:142`); `escapeJs` is invoked *inside* every behavior renderer (`behavior-methods.ts:61`). An app author has no legitimate render-time reason to call either — and the RFC's *own* guideline edit tells them not to ("never hand-roll inline JS via `addAttribute(\"hx-on:…\")`", line 240). So the RFC simultaneously (a) exports `escapeJs` and (b) documents that you should never be in a position to need it. That is contradictory surface-area: it invites the precise misuse — `addAttribute(\"onclick\", escapeJs(userInput))` — that the core guard exists to *prevent* (event-handler keys throw; an exported `escapeJs` makes hand-rolled inline JS look blessed). The library's stated ethos (RFC line 165, "no longer a second, weaker way") argues *against* exposing the primitive: the safe path is the only path *because* you can't reach the unsafe primitive. The auditability argument ("a new renderer that forgets it is a reviewable omission") is fully satisfied by a shared *internal* module — it does not require a public export. Net: +2 public symbols, zero app use-cases, one new misuse vector.

- **dx failure mode 2 — §11.8 self-check is false as written.** The RFC asserts (line 266) "Guidelines impact covers every `api_surface` symbol." It does not. The guideline edits teach: `.behavior()` escaping (✓), the fold safety rule (✓), `HxStatusKey` (✓). They never give an author a rule that *names* `escapeJs` or `validateAttributeKey` as callable — only the descriptive "escaped for you." So either the symbols are public (then a teaching rule is missing → guardrail §11.8 fail → the dx lens is mandated to flag it) or they are internal (then they don't belong in `api_surface` as exports). The RFC wants it both ways. This is exactly the "Orphaned API" failure the dx lens owns (ALGORITHM §13).

- **dx failure mode 3 — an exported, always-broken symbol left to "a human."** Open question 1 punts `tocCoalgebra` (exported, emits `<li><ul><li>text</li></ul></li>` — invalid, anchor-less; verified `toc.ts:40-55` per RFC) to a human decision. From the dx chair that punt is itself the defect: a Wave-3 verdict that leaves a public, never-correct export in limbo fails the "hard to misuse / would an author reach for it" bar. The recommendation (remove; `linkedTocCoalgebra` is strictly more capable) is obviously right and must be *in* the RFC.

What the attack could NOT kill:
- **`rebuildTag` naming + discoverability** — it is internal (RFC line 174), single-sourced, mirrors `defineRoutes`/`defineIds` single-source idiom (guardrail §11.6). App authors never see it; fold-algebra authors get one obvious primitive. No dx objection.
- **`HxStatusKey`** — literal union over bare `string` is squarely the house idiom (CLAUDE.md typescript rules; guardrail §11.4). It matches the *exact* existing app usage `{ 422: …, "5xx": … }` (verified `htmx.md:131-134`), so well-formed code keeps compiling. The compile-error-on-malformed-key is a dx *win*, not a tax. Naming is consistent with `Hx*`/`Htmx*` prefixing.
- **The fold guideline section** — the fold layer is genuinely untaught (grep confirms zero mentions in `web-development/**`); a short "use built-in algebras, never hand-build tags" rule is correct, minimal, ✓/✗, code-first, LLM-reader house style. Anchors verified: `## Status-code routing` at htmx.md:124, SVG at fluent-html.md:181 / Types at :198, `Built-in:` line at CLAUDE.md:208. The edits land where claimed.

## Does it survive?

**survives-with-changes.** The underlying fix is real and well-scoped, the type-tightening is idiomatic, and the guideline edits are correct and well-anchored. But two of the five `api_surface` symbols (`escapeJs`, `validateAttributeKey`) should not be *public* exports — that is genuine, avoidable surface-area bloat with a misuse vector and a self-contradicting guideline story, and one exported symbol (`tocCoalgebra`) is left in an unresolved broken state. None of these is fatal to the RFC's purpose (the security fix works regardless of export visibility), so this is `survives-with-changes`, not `reject`. The five required changes fold back cleanly: demote two symbols to internal, true-up the §11.8 claim, resolve the toc removal, and confirm the already-correct htmx example needs no re-baseline.

## Guardrail check (dx owns §11.8 — guideline-sync)

- **§11.8 as-submitted: FAIL** — claims coverage of "every api_surface symbol" while two listed export symbols have no teaching rule. After required-changes 1-3 (demote `escapeJs`/`validateAttributeKey` to internal + correct the claim): **PASS** — every *public* symbol (`HxStatusKey`, the fold safety contract surfaced via "use built-in algebras") is taught with a succinct ✓/✗ LLM-reader rule in `CLAUDE.md` plus the matching topic-ref section; internal symbols (`rebuildTag`, `registerSchemaKeys`, `schemaKeysFor`) are correctly not app-taught.
- House-style / minimality: the proposed edits are succinct, code-snippet-first, ✓/✗, no prose — compliant. Anchors verified against the live guideline files. Minimal: yes, no redundant rules.
