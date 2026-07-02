# architecture-6 — Refuter 2 verdict: NOT REFUTED (confirmed by reproduction)

**Finding:** Missing `./package.json` export blocks tooling introspection (`package.json:8`).

**Mode:** refute-by-reproduction.

## Reproduction

Setup: symlinked the repo as an installed package (`node_modules/fluent-html -> /Users/tony/jt-digital/fluent-html`) in a scratch dir, then resolved against it with Node v26.0.0.

1. **Baseline (harness validity):** `require.resolve('fluent-html')` → `/Users/tony/jt-digital/fluent-html/dist/src/index.js`. Package resolution works; the harness is sound.
2. **CJS:** `require('fluent-html/package.json')` → **`ERR_PACKAGE_PATH_NOT_EXPORTED`** — `Package subpath './package.json' is not defined by "exports"`.
3. **ESM:** `import.meta.resolve('fluent-html/package.json')` → **`ERR_PACKAGE_PATH_NOT_EXPORTED`** as well.
4. **Fix validation:** cloning `package.json` with `"./package.json": "./package.json"` added to `exports` makes the same `require` succeed (`version = 6.2.0`). The proposal is a working one-line fix. Note: npm always includes `package.json` in the published tarball regardless of the `files` allowlist, so the fix holds for the published package too.

## Evidence check

`/Users/tony/jt-digital/fluent-html/package.json` lines 8–45: the `exports` map lists exactly nine subpaths (`.`, `./core`, `./elements`, `./control`, `./render`, `./class-vocab`, `./ids`, `./routes`, `./htmx`) and no `./package.json` entry. The anchor is accurate.

## Caveat on impact

Grepped the companion tools (`fluent-html-tailwind-extractor/src`, `fluent-html-eslint-plugin`): **neither currently reads `fluent-html/package.json`**. So nothing in the ecosystem is broken today; the claim that companion tools "routinely read this path" is prospective/generic (true of the broader tooling ecosystem — bundler plugins, `npm ls`-style scanners, version sniffers — but not demonstrated in these repos). Severity: minor/latent, fix cost trivial.

## Verdict

**refuted = false, confidence = high.** The defect reproduces deterministically on both CJS and ESM resolution paths, and the proposed fix verifiably resolves it.
