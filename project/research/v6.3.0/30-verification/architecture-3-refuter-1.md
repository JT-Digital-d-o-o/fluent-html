# architecture-3 — Refuter 1 verdict

**Finding:** Published tarball ships dangling sourcemap and declarationMap references.
**Verdict: CONFIRMED — refutation failed.**

## What I tried to refute it with

1. **Maybe the pack actually includes maps.** No. `npm pack --dry-run --ignore-scripts` on the current tree (v6.2.0): 101 total files, 49 `.js`, 49 `.d.ts`, **0 `.map`**, no `src/**/*.ts` sources. `files` in `package.json:62-65` whitelists only `dist/src/**/*.js` and `dist/src/**/*.d.ts`.
2. **Maybe emitted files don't reference maps.** No. `dist/src/index.js` ends with `//# sourceMappingURL=index.js.map` and `dist/src/index.d.ts` ends with `//# sourceMappingURL=index.d.ts.map`. The corresponding `.map` files exist in `dist/` but are excluded from the tarball, so every shipped file carries a dangling reference.
3. **Maybe a publish-time guard disables map emission.** No. `tsconfig.json:9-10` sets `"declarationMap": true, "sourceMap": true`; the only other tsconfig is `tsconfig.docs.json` (typedoc). There is no `tsconfig.publish.json`, no `.npmignore`, and `prepack`/`prepublishOnly` (`build && test` / `npm pack --dry-run`) do not validate or strip map references.
4. **Maybe shipping maps alone would fix it.** No — the `.js.map`/`.d.ts.map` files point back to `src/**/*.ts`, which also isn't shipped, so the finding's "end-to-end" framing (ship maps **and** sources, or emit neither) is accurate.

## Severity note (honest caveat)

This is a polish/DX defect, not a functional break: consumers' builds and runtime are unaffected. The concrete costs are debugger/tooling warnings about unresolvable maps and `declarationMap` being fully inert for consumers (Go-to-Definition lands in `.d.ts` instead of source), i.e. the option's entire purpose is defeated in the published artifact. But the finding as stated — dangling references in every shipped file, with no guard anywhere — is factually correct and reproducible.

## Evidence

- `package.json:62-65` — `files: ["dist/src/**/*.js", "dist/src/**/*.d.ts"]`
- `tsconfig.json:9-10` — `declarationMap: true`, `sourceMap: true`
- `npm pack --dry-run --ignore-scripts` — 101 files, 0 `.map`, no `src/`
- `tail dist/src/index.js` / `dist/src/index.d.ts` — trailing `sourceMappingURL` comments
