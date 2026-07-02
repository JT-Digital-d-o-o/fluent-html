# architecture-5 — Refuter 1 verdict

**Finding:** Root-vs-subpath API surface drift; no subpath documented anywhere.
**Verdict: NOT REFUTED (finding confirmed).** Every factual claim checks out against the code; no guard, comment, or design semantic was found that makes this intentional or harmless.

## Claim-by-claim verification

1. **Escape helpers subpath-only.** `src/render/index.ts:3` exports `escapeHtml, escapeAttr, htmlEscapes`. `src/index.ts` re-exports from the render barrel only `render`, `renderWithNonce`, the stream functions, and `RenderOptions`/`RenderStreamOptions` (lines 68–70); grep for the three escape names in `src/index.ts` → zero hits. There is no `export *` anywhere in the root barrel that could carry them. **Confirmed.**
2. **~40 `Tailwind*` types subpath-only.** `src/core/index.ts:38–99` exports them under the comment "re-export for consumers who need them"; `grep -c "Tailwind" src/index.ts` → 0. So the stated consumer use-case (typing a helper as `(size: TailwindSpacing) => …`) is reachable only via the undocumented `fluent-html/core` entry. **Confirmed.**
3. **`./patterns` asymmetry.** `package.json` exports map contains `"."`, `./core`, `./elements`, `./control`, `./render`, `./class-vocab`, `./ids`, `./routes`, `./htmx` — and no `./patterns`, while `src/index.ts:357–370` root-exports the whole patterns surface (`Partial`, `hxResponse`, etc.) and its siblings `ids`/`routes`/`htmx` each got a subpath. **Confirmed** (asymmetric, though harmless in isolation since patterns is root-reachable).
4. **Zero documentation of any subpath.** Grep across `README.md`, `TAILWIND-SETUP.md`, `FLUENT-STYLING.md`, `examples/` for `fluent-html/<subpath>` → zero hits. Additionally, `typedoc.json` has `entryPoints: ["src/index.ts"]` only — so the generated API docs *also* omit the subpath-only exports (escape helpers, Tailwind types). **Confirmed and slightly stronger than stated.**
5. **Untested-in-isolation.** Only `test/class-vocab.test.ts` imports a subpath barrel directly; no test imports `src/render/index`, `src/core/index`, `src/elements/index`, or `src/control/index` as its entry. The cross-referenced breakage (`./elements` unusable standalone, architecture-2) was independently CONFIRMED by both architecture-2 refuters. **Confirmed.**
6. **`./class-vocab` is the one entry with real external consumers.** `fluent-html-tailwind-extractor/src/extract.ts:9` (`import { classVocab, emitClasses } from "fluent-html/class-vocab"`) and the ESLint plugin's generated vocab. Matches the finding's proposal baseline. **Confirmed.**

## Refutation attempts (all failed)

- **"Root is a deliberately curated surface; subpaths are the advanced escape hatch."** No comment in `src/index.ts`, README, or any doc states this; the subpaths are invisible to users (point 4), and one of them is broken (architecture-2), which is incompatible with "deliberate supported surface."
- **"Escape helpers are internal, so root omission is by design."** Contradicted in-repo: `product`-history aside, `src/render/index.ts` deliberately exports them from the public render barrel, and the package's own prior verification work treats `escapeAttr` as public surface reachable via `fluent-html/render`. Public-but-undiscoverable is exactly the drift claimed.
- **"Tailwind types are reachable some other way."** No wildcard export, no `dist` re-export trickery; `fluent-html/core` is the only path.

## Nuance (does not overturn)

This is an API-hygiene/coherence defect, not a runtime crash by itself: nothing here misbehaves for a user who sticks to the documented root import. The severity driver is the combination with architecture-2 (a discoverable-by-autocomplete subpath that crashes at runtime) and the maintenance cost of nine export-map entries with no doc, no isolation tests, and no stated contract.

**refuted = false, confidence = high.**
