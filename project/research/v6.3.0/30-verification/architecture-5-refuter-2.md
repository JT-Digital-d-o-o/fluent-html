# architecture-5 — Refuter 2 verdict: NOT REFUTED (confirmed by reproduction)

**Finding:** Root-vs-subpath API surface drift; no subpath documented anywhere.
**Mode:** refute-by-reproduction. Probe package built in scratchpad with `node_modules/fluent-html` symlinked to the repo (v6.2.0, dist present), compiled with `tsc --module node16 --moduleResolution node16 --strict`, plus runtime `import()` checks against `dist/`.

## Reproduction results

| Probe | Expectation if finding true | Result |
|---|---|---|
| `import { escapeHtml } from "fluent-html"` + `import type { TailwindColor } from "fluent-html"` | compile error | **TS2305 ×2** — `Module '"fluent-html"' has no exported member 'escapeHtml'` / `'TailwindColor'` |
| `import { escapeHtml, escapeAttr, htmlEscapes } from "fluent-html/render"` + `TailwindColor` from `"fluent-html/core"` (control) | compiles | **exit 0** |
| `import { Partial, hxResponse } from "fluent-html/patterns"` | unresolvable | **TS2307** `Cannot find module 'fluent-html/patterns'`; runtime `ERR_PACKAGE_PATH_NOT_EXPORTED` |
| `import { Partial, hxResponse, HtmxConfig, HxResponse } from "fluent-html"` (control) | compiles | **exit 0** |
| Runtime: `(await import('fluent-html')).escapeHtml` | undefined | **`undefined`**; from `fluent-html/render`: `function`/`function`/`object` |

## Claim-by-claim

1. **Escape helpers root-absent** — CONFIRMED. `src/render/index.ts:3` exports `escapeHtml, escapeAttr, htmlEscapes`; `grep -c 'escapeHtml\|escapeAttr\|htmlEscapes' src/index.ts` = 0; same in `dist/src/index.d.ts`. Compile + runtime probes agree.
2. **~40 Tailwind\* types core-only** — CONFIRMED. `src/core/index.ts:38-99` re-exports the Tailwind\* type block ("re-export for consumers who need them"); `grep -c Tailwind src/index.ts` = 0. `TailwindColor` imports from `fluent-html/core` but not from the root.
3. **Patterns exported from root but no `./patterns` subpath** — CONFIRMED. `src/index.ts:357-370` exports `Partial, HtmxConfig, hxResponse, HxResponse` from `./patterns.js`. `package.json` exports map has exactly 9 entries: `.`, `./core`, `./elements`, `./control`, `./render`, `./class-vocab`, `./ids`, `./routes`, `./htmx` — siblings `./ids`/`./routes`/`./htmx` exist, `./patterns` does not (Node throws `ERR_PACKAGE_PATH_NOT_EXPORTED`).
4. **Zero subpath documentation** — CONFIRMED. `grep -rn 'fluent-html/'` across `README.md`, `TAILWIND-SETUP.md`, `FLUENT-STYLING.md`, `examples/*.ts` yields no `fluent-html/<subpath>` import anywhere; 8 of 9 export-map entries are undocumented surface. (The "one broken per architecture-2" cross-reference was not independently verified here; it does not affect this verdict.)

## Verdict

**refuted = false, confidence = high.** All four factual claims reproduce exactly, at both compile time and runtime, against the built `dist/`. The drift is real: values/types reachable only via undocumented subpaths (`./render` escape helpers, `./core` Tailwind types), a root-exported module (`patterns`) with no subpath while its siblings have one, and no documentation for any subpath entry.
