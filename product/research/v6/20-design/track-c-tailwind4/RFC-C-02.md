---
id: RFC-C-02
track: C
title: "Tailwind v4 pipeline/config migration + a shared v3|v4 dual-target so the three packages never drift"
resolves: [F-C-012, F-C-024]
api_surface: ["TW_TARGET", "TailwindTarget", "defineTailwindTarget()", "ExtractorOptions.target", "ESLint settings.fluentHtml.tailwindTarget", "emitSafelistCss()"]
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md"]
impact: high
effort: L
depends_on: [RFC-C-01]
status: proposed
---

# RFC-C-02: Tailwind v4 pipeline/config migration + a shared v3|v4 dual-target

## Problem

Two distinct-but-coupled failures block Tailwind v4 adoption. Both are evidenced in cited app/tooling code.

**1. Every setup doc teaches the v3 pipeline exclusively (F-C-012).** A user wiring a v4 project from the official guide gets a non-building project:

- `fluent-html/TAILWIND-SETUP.md:71` emits the v3 directives — `@tailwind base; @tailwind components; @tailwind utilities;` (do not exist in v4; replaced by `@import "tailwindcss";`).
- `TAILWIND-SETUP.md:22` installs `tailwindcss autoprefixer postcss` — v4 splits the PostCSS plugin into `@tailwindcss/postcss` and the CLI into `@tailwindcss/cli`.
- `TAILWIND-SETUP.md:60` configures the v3 PostCSS plugin name `tailwindcss: {}`.
- `TAILWIND-SETUP.md:39` and `fluent-html-tailwind-extractor/README.md:26` wire `content: { extract: { ts: fluentHtmlExtractor } }` and `tailwind.config.js` — the `content.extract` hook and auto-loaded JS config are both gone in v4.

**2. No coordination point ties the three packages' class vocabulary (F-C-024).** The same class string is hard-coded three times with nothing keeping them in sync:

```ts
// fluent-html/src/core/tailwind-methods.ts:576
p.gradientTo = function (direction) { return this.addClass(`bg-gradient-${direction}`); };

// fluent-html-tailwind-extractor/src/index.ts:390  (METHOD_PATTERNS)
{ methodName: "gradientTo", generateClass: (args) => args.length === 1 ? [`bg-gradient-${args[0]}`] : [] },

// fluent-html-eslint-plugin/src/rules/no-known-modifiers-in-setclass.ts:384
{ pattern: "bg-gradient-", methodName: "gradientTo" },
```

`fluent-html-tailwind-extractor/package.json:40` pins `peerDependencies: { tailwindcss: ">=3.0.0" }`. When RFC-C-01's v4 renames land (gradient `bg-gradient-*`→`bg-linear-*`, scale shift, outline split), each of these three files must be updated independently — with **no shared constant, no flag, no cross-package test** to catch a half-done migration. The app compiles, the lint passes, but the extractor extracts a class the method no longer emits → no CSS generated, silent unstyled page.

This RFC is the **infrastructure** half of Track C: the version-target switch every other Track-C RFC branches on, plus the v4 build pipeline (docs + extractor wiring) that switch feeds. RFC-C-01 (renames/scale-shift) and RFC-C-03 (new v4-only methods) consume `TW_TARGET` defined here.

## Proposed API

A single literal-union target, defined once in the lib (zero-dep), re-exported to the two tooling packages, and threaded through their option objects. No runtime branching in the hot path — the target is read at build/config time only.

```ts
// fluent-html/src/core/tailwind-target.ts  (new, zero-dep)

/** The Tailwind major the generated class vocabulary targets. */
export type TailwindTarget = "v3" | "v4";

/**
 * The single source of truth. Default "v4" for v6 (v4 is the supported line);
 * v3 remains selectable for the migration window.
 */
export const TW_TARGET_DEFAULT = "v4" as const satisfies TailwindTarget;

/**
 * Narrowing identity helper so callers get a literal type, not widened `string`,
 * and an invalid target is a compile error.
 *   defineTailwindTarget("v4")  // TailwindTarget, narrowed to "v4"
 *   defineTailwindTarget("v5")  // ✗ compile error
 */
export function defineTailwindTarget<const T extends TailwindTarget>(t: T): T;

/**
 * Per-target class vocabulary for the utilities that differ between v3 and v4.
 * RFC-C-01's renames read from THIS table; methods/extractor/eslint all import it,
 * so a rename is made in one place. (Illustrative subset — full table in RFC-C-01.)
 */
export type ClassVocab = {
  gradientLinearPrefix: string;   // v3: "bg-gradient" · v4: "bg-linear"
  shadowBareValue: string;        // v3: "shadow"      · v4: "shadow-sm"
  outlineInvisible: string;       // v3: "outline-none" · v4: "outline-hidden"
};
export const CLASS_VOCAB: Record<TailwindTarget, ClassVocab>;

export const TW_TARGET: TailwindTarget;  // resolved value (env/config override of default)
```

```ts
// fluent-html-tailwind-extractor/src/index.ts  (additive option)
import type { TailwindTarget } from "fluent-html";

export interface ExtractorOptions {
  onWarning?: (message: string) => void;
  /** Class vocabulary to emit. Default "v4". */
  target?: TailwindTarget;
}

/**
 * NEW v4 output mode (depends on RFC-C-01's extractor redesign):
 * scans source, writes a CSS file of `@source inline("…")` so Oxide's automatic
 * content detection sees the runtime-only class names. Replaces the removed
 * `content.extract` hook. v3 mode keeps returning the string[] for `content.extract`.
 */
export function emitSafelistCss(
  sources: string[],
  outFile: string,
  options?: ExtractorOptions,
): Promise<void>;
```

```ts
// fluent-html-eslint-plugin — ESLint shared settings (additive)
// .eslintrc:  settings: { fluentHtml: { tailwindTarget: "v4" } }
declare module "eslint" {
  interface SharedConfigurationSettings {
    fluentHtml?: { tailwindTarget?: TailwindTarget };
  }
}
// Rules read context.settings.fluentHtml?.tailwindTarget ?? "v4" to pick the
// suggestion vocabulary (gradient, shadow scale, outline) from CLASS_VOCAB.
```

```ts
// cross-package consistency test (new, in the monorepo test package)
// For every method that differs by target, assert all three agree:
//   methodOutput(target)  ===  extractorOutput(target)  ===  eslintFixTarget(target)
test.each(["v3", "v4"] as const)("vocab agrees on %s", (target) => {
  expect(extractClass("gradientTo", ["to-r"], target))
    .toEqual([CLASS_VOCAB[target].gradientLinearPrefix + "-to-r"]);
});
```

## Worked examples (before → after)

### A. The setup pipeline (F-C-012)

```css
/* before — TAILWIND-SETUP.md:71 (v3, invalid on v4) */
@tailwind base;
@tailwind components;
@tailwind utilities;
```
```javascript
/* before — TAILWIND-SETUP.md:39 + :60 (v3 config, ignored on v4) */
// tailwind.config.js
module.exports = {
  content: { files: ['./src/**/*.{ts,tsx}'], extract: { ts: fluentHtmlExtractor } },
};
// postcss.config.js
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

```css
/* after (v6, v4 primary path) — styles.css */
@import "tailwindcss";
@import "./fluent-safelist.css";   /* generated by emitSafelistCss(): @source inline("bg-linear-to-r p-4 …") */
/* custom tokens are CSS-first now: */
@theme { --color-brand: oklch(0.62 0.19 255); }
```
```javascript
/* after — postcss.config.js (v4 plugin package) */
module.exports = { plugins: { "@tailwindcss/postcss": {} } };
```
```jsonc
// after — package.json: regenerate safelist before the css build
{ "scripts": {
  "build:safelist": "fluent-html-extractor --target v4 --out ./fluent-safelist.css 'src/**/*.ts'",
  "build:css": "@tailwindcss/cli -i ./styles.css -o ./dist/output.css"
} }
```

### B. The dual-target coordination (F-C-024)

```ts
// before — bg-gradient hard-coded in three files; a v4 rename in one silently
// desyncs the others (method emits bg-linear-to-r, extractor still scans
// bg-gradient-to-r → no CSS generated, no error).
p.gradientTo = (dir) => this.addClass(`bg-gradient-${dir}`);              // methods:576
{ methodName: "gradientTo", generateClass: a => [`bg-gradient-${a[0]}`] } // extractor:390
{ pattern: "bg-gradient-", methodName: "gradientTo" }                     // eslint:384
```
```ts
// after — one vocabulary table, all three read it; the cross-package test fails
// if any consumer drifts. (RFC-C-01 fills CLASS_VOCAB; this RFC defines it.)
import { CLASS_VOCAB, TW_TARGET } from "fluent-html";

p.gradientTo = (dir) => this.addClass(`${CLASS_VOCAB[TW_TARGET].gradientLinearPrefix}-${dir}`);
// extractor: generateClass uses CLASS_VOCAB[opts.target].gradientLinearPrefix
// eslint:    pattern derived from CLASS_VOCAB[settings.tailwindTarget].gradientLinearPrefix
```

App code is **unchanged** — `Div().gradientTo("to-r")` is identical. Only what string it resolves to (and which package owns that decision) changes.

## Type-safety story

- **Literal union, never bare `string`** — `TailwindTarget = "v3" | "v4"`. `ExtractorOptions.target` and `settings.fluentHtml.tailwindTarget` are typed to it; `"v5"` is a compile error, not a silent fallthrough (guardrail §11.4).
- **`const` generic** on `defineTailwindTarget<const T>` narrows the argument to its literal so downstream `CLASS_VOCAB[T]` indexing stays exact.
- **`satisfies`** on `TW_TARGET_DEFAULT` keeps the value a literal `"v4"` while checking it against `TailwindTarget`.
- **`Record<TailwindTarget, ClassVocab>`** makes the vocab table exhaustive — adding a future target without filling its row is a compile error in all three packages at once.
- **`SharedConfigurationSettings` augmentation** types the ESLint setting so a typo (`tailwndTarget`) is caught by `@typescript-eslint`'s config typechecking.

## Migration & compatibility

**Additive.** Default target is `"v4"` for v6, but every new surface has a default and v3 stays selectable:

- `ExtractorOptions.target` defaults to `"v4"`; omitting it on a v3 project is the only action needed to opt back (`target: "v3"`).
- `settings.fluentHtml.tailwindTarget` defaults to `"v4"`; absent = v4.
- `extractor peerDependencies` widens to `">=3.0.0 || >=4.0.0"` — no existing v3 install breaks.
- Existing app code (`.gradientTo()`, `.shadow()`, …) is untouched; the resolved class string changes only because v6 ships on v4 — that visual change is RFC-C-01's breaking note, **not this RFC's**. This RFC is the mechanism, additive.

**Docs:** `TAILWIND-SETUP.md` and the extractor `README.md` are rewritten v4-primary with a collapsible **"v3 (legacy)"** section, not deleted.

**Codemod:** none needed for app code. A one-time config codemod (`@tailwind` directives → `@import "tailwindcss"`, postcss plugin rename, `content.extract` → `build:safelist` script) ships as an optional `npx fluent-html-upgrade-tailwind` step, documented in `breaking-changes.md` under the v6/RFC-C-01 entry.

## Guidelines impact

Adds public surface (`TW_TARGET`, `ExtractorOptions.target`, the ESLint setting, the v4 pipeline) → §11.8 requires the edit. The index gets the one-line rule; `fluent-html.md` gets the pipeline + target section.

### Index — `web-development/CLAUDE.md`

Replace the thin `## Tailwind CSS` block (currently only the dynamic-class rule at line 54) with:

```md
## Tailwind CSS

- **Target Tailwind v4** — fluent-html v6 emits the v4 class vocabulary by default. CSS entry is `@import "tailwindcss";` (✗ never `@tailwind base/components/utilities;`).
- **PostCSS plugin is `@tailwindcss/postcss`** — ✗ not the v3 `tailwindcss: {}` plugin.
- **Fluent classes are runtime-only** → Oxide can't see them. Generate a safelist: `build:safelist` runs the extractor to write `@source inline(...)`, `@import` it next to `@import "tailwindcss";`. ✗ never rely on automatic content detection alone for fluent-styled elements.
- **Custom tokens are CSS-first** — `@theme { --color-brand: … }`, ✗ not `tailwind.config.js theme.extend`.
- **One target, three packages** — `ExtractorOptions.target` and ESLint `settings.fluentHtml.tailwindTarget` must match (default `"v4"`). ✗ never set one to v3 and another to v4.
- **No dynamic class interpolation** — purging removes dynamically-generated classes. Always full class names.

```typescript
// styles.css
@import "tailwindcss";
@import "./fluent-safelist.css";   // ✓ generated: @source inline("bg-linear-to-r p-4 …")
@theme { --color-brand: oklch(0.62 0.19 255); }  // ✓ custom token
```
```

### Topic ref — `web-development/fluent-html.md`

Append a `## Tailwind v4 pipeline & target` section after the Fluent Tailwind Styling block:

```md
## Tailwind v4 pipeline & target

fluent-html v6 targets Tailwind **v4**. Three packages share one class vocabulary — keep their targets aligned.

**Build pipeline (v4):**
```css
/* styles.css */
@import "tailwindcss";
@import "./fluent-safelist.css";   /* ✓ extractor output: @source inline("…") */
```
```jsonc
// package.json
"build:safelist": "fluent-html-extractor --target v4 --out ./fluent-safelist.css 'src/**/*.ts'",
"build:css":      "@tailwindcss/cli -i ./styles.css -o ./dist/output.css"
// postcss.config.js → { plugins: { "@tailwindcss/postcss": {} } }
```

✓ `@import "tailwindcss";` · ✗ `@tailwind base/components/utilities;`
✓ `@tailwindcss/postcss` · ✗ `tailwindcss: {}`
✓ generated `@source inline(...)` safelist · ✗ `content.extract` hook (removed in v4)
✓ `@theme { --color-… }` · ✗ `tailwind.config.js theme.extend`

**Why the safelist:** `.background("red-500")` never writes `bg-red-500` into source — Oxide can't detect it. The extractor reconstructs the classes and emits `@source inline(...)`.

**Target alignment** — all three must agree (default `"v4"`):
```ts
emitSafelistCss(sources, out, { target: "v4" })          // extractor
settings: { fluentHtml: { tailwindTarget: "v4" } }        // eslint config
```
✗ mismatched targets → extractor emits a class the method no longer generates → no CSS, silent.

**Legacy v3:** set `target: "v3"` everywhere and use the v3 `@tailwind` directives + `content.extract` wiring (collapsible section in TAILWIND-SETUP.md).
```

**Adoption note:** the existing guideline taught only fluent *methods*, never the *pipeline* — so apps copied `TAILWIND-SETUP.md` verbatim and inherited the v3 wiring. Making the pipeline a first-class guideline section is what prevents the silent-unstyled-page failure on upgrade.

## Guardrail check

- §11.1 zero-deps: **pass** — `tailwind-target.ts` is pure types + constants, no runtime dep added to the lib. Extractor/eslint deps are tooling-only.
- §11.2 ssr-only / fast sync path: **pass** — target is resolved at build/config time; no per-render branching added.
- §11.3 escape-by-default: **N/A** — emits class strings + CSS config, no new markup-emitting API.
- §11.4 type-safety: **pass** — `TailwindTarget` literal union, `const` generic, `satisfies`, exhaustive `Record`, typed ESLint setting.
- §11.5 backward-compat: **pass** — additive; every new option defaults to `"v4"`, v3 selectable, peerDep widened not narrowed.
- §11.6 idioms: **pass** — single-sourcing (one `CLASS_VOCAB`, three readers) mirrors `defineRoutes`/`defineIds`; literal-union + define-helper match house voice.
- §11.7 class-string contract: **pass** — this RFC *is* the contract enforcer; the cross-package test makes §11.7 mechanical instead of manual.
- §11.8 guideline-sync: **pass** — Guidelines impact covers `TW_TARGET`/`TailwindTarget`/`defineTailwindTarget`, `ExtractorOptions.target`, the ESLint setting, `emitSafelistCss`, and the pipeline; index rule + topic-ref section provided verbatim; `guideline_updates` lists both files.

## Alternatives considered

- **Separate v3-only and v4-only major versions of each package (no flag).** Cleanest types, zero branching — but multiplies the release/maintenance matrix across three packages and strands in-monorepo consumers (`ttl`, `rideshare`) on an island during migration. The flag's small test-matrix cost buys a single migration window. Rejected.
- **Auto-detect target by inspecting the installed `tailwindcss` version.** Magic, fragile (monorepo hoisting, peer ranges), and the extractor often runs without `tailwindcss` resolvable. An explicit literal is the house style. Rejected.
- **v4-only, drop v3 immediately.** Honest but forces a flag-day upgrade of every consumer. Rejected in favor of additive + default-v4.
- **Keep `content.extract`, no safelist.** Impossible — the hook is removed in v4 (F-C-011). The safelist is the chosen B-1 resolution; this RFC depends on RFC-C-01 delivering `emitSafelistCss`.

## Open questions

1. **Where does `TW_TARGET` physically live** — exported from `fluent-html` (tooling then depends on the lib) or a tiny zero-dep `fluent-html-tailwind-shared` package? Lib-export is simplest; a shared package avoids a tooling→lib dep. Leaning lib-export (the types are already there).
2. **Default target for v6.0** — confirmed `"v4"`? Pending the browser-baseline sign-off (Safari 16.4+/Chrome 111+/FF 128+) from recon §5.7.
3. **Safelist staleness** — `build:safelist` must run before `build:css`; do we also ship a `@tailwindcss/vite` plugin (RFC-C-01 scope) so dev mode regenerates on change without a manual step? Likely yes, tracked in RFC-C-01.
4. **CLI name** — `fluent-html-extractor` binary vs a subcommand. Cosmetic; defer to RFC-C-01's extractor redesign.
