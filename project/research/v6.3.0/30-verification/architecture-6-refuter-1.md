# architecture-6 — refuter-1 verdict

**Finding:** Missing `./package.json` export blocks tooling introspection (`package.json:8-45`).

**Verdict: NOT REFUTED (defect confirmed).**

## What I verified

1. **Exports map** — `/Users/tony/jt-digital/fluent-html/package.json:8-45` enumerates exactly nine subpaths (`.`, `./core`, `./elements`, `./control`, `./render`, `./class-vocab`, `./ids`, `./routes`, `./htmx`). There is no `./package.json` entry and no wildcard (`./*`) that could match it. Node's exports encapsulation therefore applies.

2. **Empirical repro** — I built a minimal `node_modules/fluent-html/` containing the repo's actual `package.json` and tested every resolution path from a consumer script:
   - `require('fluent-html/package.json')` → **ERR_PACKAGE_PATH_NOT_EXPORTED**
   - `require.resolve('fluent-html/package.json')` → **ERR_PACKAGE_PATH_NOT_EXPORTED**
   - `import('fluent-html/package.json', { with: { type: 'json' } })` (ESM) → **ERR_PACKAGE_PATH_NOT_EXPORTED**

   The finding's evidence is accurate, not just plausible. `require.resolve('pkg/package.json')` is the canonical idiom tools use to locate a package's install root; all three access paths are blocked.

## Refutation attempts (all failed to kill the finding, but they narrow the blast radius)

- **"Companion tools routinely read this path"** — overstated as a *current* fact. I grepped both companion repos:
  - `fluent-html-tailwind-extractor/src/` — zero reads of `fluent-html/package.json`; it imports `fluent-html/class-vocab` and type-only `ThemeSpec` (`src/extract.ts:9`, `src/safelist.ts:14`, `src/theme.ts:13`).
  - `fluent-html-eslint-plugin/src/` — zero reads; the only `require.resolve` in the repo is `test/rule.test.js:775` resolving `@typescript-eslint/parser`, not fluent-html.

  So no in-ecosystem consumer is broken **today**. The finding hedges correctly ("natural candidates"), so this doesn't refute it.

- **"Dependency scanners / bundlers are blocked"** — mostly not true: scanners (npm audit, Snyk, Dependabot) and bundler resolvers read `node_modules/fluent-html/package.json` via the filesystem, which exports encapsulation does not gate (verified: direct `fs.readFileSync` of the same path succeeds). Only code going through the Node module resolver hits the wall.

## Conclusion

The defect itself — the subpath being unresolvable — is positively confirmed by direct repro against the repo's real manifest, across CJS require, `require.resolve`, and ESM JSON import. The impact framing is somewhat inflated (no current consumer breaks; fs-based tooling is unaffected), but the finding is filed as kind=issue, severity=low, which matches reality. Exporting `"./package.json": "./package.json"` is the standard, zero-risk convention and the proposal is correct.

**refuted = false, confidence = high** (high on the mechanics; note the impact caveats above when prioritizing).
