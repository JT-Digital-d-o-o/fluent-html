# Plan: Distribution 10/10

> Goal: Close all remaining distribution gaps to achieve a 10/10 score.
>
> **Current: 9/10** — ESM-only, ES2020 target, zero dependencies, clean single build output. Gaps: subpath exports, sideEffects, provenance, tree-shaking hints.

---

## Phase 1 — Subpath Exports

**Problem:** Only `"."` is exported. Consumers who want just the core (no Tailwind, no HTMX, no patterns) must import everything.

**Fix:**
- Add subpath exports to `package.json`:
```json
"exports": {
  ".": { "types": "./dist/src/index.d.ts", "default": "./dist/src/index.js" },
  "./core": { "types": "./dist/src/core/index.d.ts", "default": "./dist/src/core/index.js" },
  "./elements": { "types": "./dist/src/elements/index.d.ts", "default": "./dist/src/elements/index.js" },
  "./control": { "types": "./dist/src/control/index.d.ts", "default": "./dist/src/control/index.js" },
  "./render": { "types": "./dist/src/render/index.d.ts", "default": "./dist/src/render/index.js" },
  "./fold": { "types": "./dist/src/fold/index.d.ts", "default": "./dist/src/fold/index.js" },
  "./ids": { "types": "./dist/src/ids.d.ts", "default": "./dist/src/ids.js" },
  "./routes": { "types": "./dist/src/routes.d.ts", "default": "./dist/src/routes.js" },
  "./htmx": { "types": "./dist/src/htmx.d.ts", "default": "./dist/src/htmx.js" }
}
```
- Verify each subpath resolves correctly with `node --conditions` or a test consumer

**Files:** `package.json`

---

## Phase 2 — `sideEffects` Declaration

**Problem:** No `sideEffects` field. Bundlers (webpack, rollup, esbuild) can't tree-shake unused modules.

**Fix:**
- Add `"sideEffects": false` to `package.json`
- Verify: no module has top-level side effects beyond prototype assignments (which are needed and will be imported anyway)

**Files:** `package.json`

---

## Phase 3 — npm Provenance

**Problem:** No provenance attestation. Consumers can't verify the package was built from the claimed source.

**Fix:**
- Publish with `--provenance` flag from GitHub Actions (requires OIDC token)
- Add to CI: `npm publish --provenance --access public`
- This adds a Sigstore signature linking the npm package to the GitHub commit

**Files:** `.github/workflows/publish.yml` (new or update existing)

---

## Phase 4 — Package Metadata Polish

**Problem:** Minor metadata gaps.

**Fix:**
- Add `"sideEffects": false`
- Add `"packageManager"` field if using corepack
- Verify `"engines"` matches actual minimum (test on Node 18)
- Add `"funding"` field if applicable
- Ensure `"license"` matches LICENSE file

**Files:** `package.json`

---

## Phase 5 — Publish Dry-Run Validation

**Problem:** No automated check that the published package is correct.

**Fix:**
- Add `"prepack"` script: `npm run build && npm test`
- Run `npm pack --dry-run` in CI to verify `files` field includes everything needed
- Verify no test files, plan files, or source `.ts` files leak into the package
- Check package size: should be well under 100KB unpacked

**Files:** `package.json`, CI config

---

## Acceptance Criteria

- [ ] Subpath exports for core, elements, control, render, fold, ids, routes, htmx
- [ ] `"sideEffects": false` declared
- [ ] npm provenance attestation on publish
- [ ] `npm pack --dry-run` shows only dist/src files
- [ ] Package size under 100KB unpacked
- [ ] All subpath imports resolve correctly in a test consumer
- [ ] `tsc --noEmit` clean, all tests pass
