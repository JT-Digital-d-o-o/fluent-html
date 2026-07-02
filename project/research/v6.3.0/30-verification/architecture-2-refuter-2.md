# architecture-2 — refuter-2 verdict: NOT REFUTED (confirmed by reproduction)

**Finding:** `fluent-html/elements` subpath export is broken standalone — mixins never register.

**Mode:** refute-by-reproduction, plain Node against a fresh `npm run build` of `dist/` (v6.2.0, HEAD `0ffed5e`).

## Runtime reproduction — CONFIRMED

Probe: `import { Div } from './dist/src/elements/index.js'` in plain Node (ESM, no bundler), then inspect `Div('x')`.

| Entry point(s) loaded              | `padding`  | `setHtmx`  | `behavior` | `overlay`  |
|------------------------------------|------------|------------|------------|------------|
| `elements` only                    | undefined  | undefined  | undefined  | undefined  |
| `core` then `elements`             | function   | function   | function   | undefined  |
| root (`dist/src/index.js`)         | function   | function   | function   | function   |

`Div('x').padding('4')` under the elements-only entry throws `TypeError: d.padding is not a function` — exactly as claimed.

Static cause verified:
- `src/elements/index.ts` is pure re-exports; no side-effect imports.
- Every element module imports `Tag` from `../core/tag.js` directly (e.g. `src/elements/forms.ts:2`), bypassing `src/core/index.ts:9-11`, which is the only place the three mixin modules (`tailwind-methods.js`, `htmx-methods.js`, `behavior-methods.js`) are side-effect-imported.
- Related sub-claim also confirmed: `.overlay()` registers only via `src/control/index.ts:21` (`import "./overlay.js"`), so even `fluent-html/core` alone lacks it (row 2 of the table).
- `package.json:17-20` does advertise `./elements` as a public entry.

## TypeScript-side claim — CONFIRMED with one nuance

Probe project symlinking the repo as `node_modules/fluent-html`, `moduleResolution: nodenext`, strict:

1. **Strictly standalone** (the *only* import in the whole program is `fluent-html/elements`): `Div("x").padding("4")` does **not** compile — `TS2339: Property 'padding' does not exist on type 'Tag'`. The augmentations live in `tailwind-methods.d.ts` etc. and are not pulled in by the elements `.d.ts`. So the finding's phrasing "the .d.ts still advertises the full fluent surface" is slightly overstated for a pure single-import program.
2. **Any realistic program**: adding one other file with only `import type { Tag } from "fluent-html"` makes the augmentation program-wide, and `Div("x").padding("4").setHtmx` from `fluent-html/elements` **compiles clean**. Since `import type` is erased at emit, the runtime module graph still loads only the elements entry — a compile-clean guaranteed runtime crash, exactly the hazard the finding describes.

## Additional aggravator noticed (not required for verdict)

`package.json` declares `"sideEffects": false`, so tree-shaking bundlers are licensed to drop the side-effect mixin imports in `core/index.js` even when consumers import the root — the registration-as-import-side-effect design is fragile beyond the subpath case. Worth folding into the fix (the proposed `register.ts` invariant should also revisit the `sideEffects` declaration).

## Verdict

**refuted = false.** The core defect reproduces deterministically in plain Node against a fresh build; the source-level cause matches the evidence anchors; the dangerous typecheck-passes-but-runtime-crashes scenario is achievable with any program that references the root types anywhere. Only the "standalone .d.ts advertises the surface" phrasing needs a minor correction (it requires the root types to be in the program, which is the common case).
