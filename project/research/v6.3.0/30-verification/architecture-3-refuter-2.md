# architecture-3 — Refuter 2 verdict: CONFIRMED (not refuted)

**Finding:** Published tarball ships dangling sourcemap and declarationMap references.
**Mode:** refute-by-reproduction. **Result: reproduced end-to-end. refuted = false.**

## Reproduction

1. **Config matches the claim.**
   - `package.json` `files`: only `"dist/src/**/*.js"` and `"dist/src/**/*.d.ts"` (lines 62–65).
   - `tsconfig.json:9-10`: `"declarationMap": true`, `"sourceMap": true`.

2. **Dry run:** `npm pack --dry-run` → 101 total files, **0** entries matching `\.map`, no `src/`.
   (Note: `npm pack` triggers `prepack` = `npm run build && npm test`, which succeeded — so the tarball reflects a fresh build, not a stale dist.)

3. **Real pack + extract** (scratchpad, `npm pack --ignore-scripts /Users/tony/jt-digital/fluent-html`):
   - `tar tzf fluent-html-6.2.0.tgz`: **0** files matching `\.map$` or `^package/src/`.
   - Extracted `package/dist/src/index.js` ends with `//# sourceMappingURL=index.js.map`.
   - `package/dist/src/index.js.map`: **No such file or directory** in the extracted package.
   - Extracted `package/dist/src/index.d.ts` ends with `//# sourceMappingURL=index.d.ts.map` — also absent.

4. **Local dist contrast:** `dist/src/index.js.map` and `dist/src/index.d.ts.map` *do* exist in the repo's dist — they are generated but excluded purely by `files:[]`. Every shipped `.js`/`.d.ts` carries a `sourceMappingURL` comment pointing at a file the consumer never receives.

5. **Proposal sanity check:** `dist/src/index.d.ts.map` has `"sources": ["../../src/index.ts"]` — i.e. it resolves to `package/src/index.ts`, which is also not shipped. This confirms the proposal's coupling: adding `*.map` alone is insufficient; either ship `dist/**/*.map` **and** `src/**/*.ts`, or disable both map options in a publish tsconfig.

## Attempted refutations that failed

- *"Maybe npm auto-includes .map files"* — no; actual tarball contains zero.
- *"Maybe dist wasn't built with maps"* — maps exist locally; only `files:[]` excludes them.
- *"Maybe the sourceMappingURL comments are stripped on pack"* — extracted tarball files retain them verbatim.

## Impact caveat (does not change verdict)

The structural defect (dangling references in every shipped file) is fully reproduced. Consumer-visible severity is tooling-dependent: Node `--enable-source-maps` degrades silently, browser/devtools and some error-reporting tools emit missing-map warnings, and tsserver Go-to-Definition falls back to the `.d.ts` instead of source (declarationMap's entire purpose defeated). This is a real half-shipped state, exactly as described.

**Verdict: CONFIRMED. Confidence: high.**
