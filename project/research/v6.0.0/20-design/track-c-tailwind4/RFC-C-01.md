---
id: RFC-C-01
track: C
title: "Extractor redesign for Tailwind v4 — safelist emitter + Vite/PostCSS plugin replacing the removed content.extract hook"
resolves: [F-C-011, F-C-071, F-C-053, F-C-054, F-C-072]
api_surface:
  - "generateFluentSafelist(files, options?): string"
  - "fluentHtmlPlugin(options?): Plugin   // @tailwindcss/vite + PostCSS"
  - "ExtractorOptions.target: \"v3\" | \"v4\""
  - "ExtractorOptions.onUnresolved: \"warn\" | \"error\" | \"silent\""
  - "ExtractorOptions.staticManifest?: string[]   // defineTheme() token coverage"
  - "fluentHtmlExtractor(content, options?): string[]   // unchanged, v3-only"
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md"]
impact: high
effort: L
depends_on: [RFC-C-02]
status: proposed
---

# RFC-C-01: Extractor redesign for Tailwind v4

## Problem

`fluent-html-tailwind-extractor` is wired into Tailwind through the **`content.extract` hook** — a
v3-only mechanism. Tailwind v4's Oxide engine removed configurable content extractors entirely; there
is no `extract` callback to register. This is existential for fluent-html because its methods **never
write the class string into source** (`.background("red-500")` appends `bg-red-500` only at render
time, never as literal text). v4's automatic content detection scans source files and therefore
**cannot see a single fluent-generated class** → every fluent-styled element renders unstyled, with no
build error and no warning (F-C-011).

The package's sole export `fluentHtmlExtractor(content): string[]` fits only the v3 hook shape; no
function emits the v4 replacement, `@source inline("…")` (F-C-071). The internal regex matches **only
string-literal arguments** — `.background(btnColor)` where `btnColor` is a variable yields zero classes
and only an opt-in warning; under v4's `@source inline()` model a missed class is 100% absent from the
stylesheet, turning a v3 nuisance into a hard correctness bug (F-C-053). And both production apps
hand-rolled an identical `combinedExtractor` workaround because the default-candidate passthrough is
internal, not exported — a workaround that **evaporates silently** on v4 (F-C-054). Finally, the
extractor pins `tailwindcss: "^3.0.0"` in devDeps, so there is no CI proof that any v4 class-string
output (`bg-linear-*`, `shadow-xs`, `rounded-xs`) is correct (F-C-072).

Real evidence, cited from the apps:

```js
// rideshare/tailwind.config.js:1-21 — the cargo-culted v3 workaround (ttl is structurally identical)
const { fluentHtmlExtractor } = require("fluent-html-tailwind-extractor");
const defaultExtractor = (content) =>
  content.match(/[a-zA-Z0-9_\-:\/]+(?:\[[^\]]+\])?[a-zA-Z0-9_\-]*/g) || [];
const combinedExtractor = (content) => [
  ...fluentHtmlExtractor(content),
  ...defaultExtractor(content),
];
export default {
  content: { files: ["./src/**/*.ts", "./public/**/*.html"],
             extract: { ts: combinedExtractor, html: combinedExtractor } },  // ← dead on v4
  theme: { extend: { colors: { forest: "#0d1f0f", moss: "#3faf5a", /* …11 tokens, 456 call-sites */ } } },
};
```

```ts
// rideshare/src/landing/landing.components.ts:91 — literal token: regex catches it today
.background("forest")
// but abstract it once and the extractor drops it silently:
const btnColor = hovered ? "leaf" : "moss";
.background(btnColor)   // ← v4: 0 classes emitted → leaf/moss absent from stylesheet
```

## Proposed API

The extractor is **repurposed from a content-extractor callback into a safelist emitter** plus an
integrated build plugin. All new surface is **additive** — `fluentHtmlExtractor` stays for v3 consumers.

```ts
// fluent-html-tailwind-extractor/src/index.ts

/** Tailwind major the emitted class vocabulary targets. Single source of the v3/v4 switch (F-C-024). */
export type TailwindTarget = "v3" | "v4";

/** What to do when a fluent call uses a non-literal argument the regex can't resolve. */
export type UnresolvedPolicy = "warn" | "error" | "silent";

export interface ExtractorOptions {
  /** Default "v3" for backward-compat; "v4" emits bg-linear-*, shadow-xs, rounded-xs, etc. */
  target?: TailwindTarget;
  /** v4 default "error": a dropped class is invisible to Oxide, so fail the build. v3 default "warn". */
  onUnresolved?: UnresolvedPolicy;
  /** Called per unresolved call-site. Receives file (when known), method, and the raw arg text. */
  onWarning?: (info: { file?: string; method: string; argText: string }) => void;
  /**
   * Class names known statically from the theme (e.g. defineTheme()'s manifest, RFC-C-02).
   * Guarantees full token coverage even where call-sites use variables. Deduped into the output.
   */
  staticManifest?: readonly string[];
}

/* ── v4 PRIMARY: scan files on disk → one @source inline("…") block ───────────────────── */

/**
 * Reads each file, runs the per-file scanner, dedupes, and returns a ready-to-@import CSS block:
 *   @source inline("bg-red-500 p-4 rounded-lg hover:bg-blue-600 md:px-8 …");
 * Write this next to `@import "tailwindcss";`. Replaces the removed content.extract hook.
 */
export function generateFluentSafelist(
  files: readonly string[],
  options?: ExtractorOptions,
): string;

/* ── v4 INTEGRATED: one-line build wiring, no generated file to manage ────────────────── */

/** Tailwind v4 Vite plugin (also valid as a PostCSS plugin via the same factory).
 *  Scans `content`, injects the @source inline() block, and re-runs on file change in dev. */
export function fluentHtmlPlugin(options?: PluginOptions): import("vite").Plugin;

export interface PluginOptions extends ExtractorOptions {
  /** Globs to scan. Default ["./src/**\/*.{ts,tsx}", "./public/**\/*.html"]. */
  content?: readonly string[];
}

/* ── DEFAULT-CANDIDATE PASSTHROUGH: export what apps hand-rolled (F-C-054) ─────────────── */

/** The internal extractDefaultClasses, now public. Apps no longer copy-paste a raw regex. */
export function extractDefaultClasses(content: string): string[];

/* ── v3 LEGACY: unchanged signature, now target-aware ─────────────────────────────────── */

/** Existing per-file callback for Tailwind v3 `content.extract`. Default target stays "v3". */
export function fluentHtmlExtractor(content: string, options?: ExtractorOptions): string[];
```

`generateFluentSafelist` reuses the existing internals verbatim — `extractMethodArgs`,
`extractDirectClasses`, `extractVariantClasses`, `extractDefaultClasses` — wrapping them in a
filesystem read + dedupe. The `target` option threads into `METHOD_PATTERNS` so the renamed/scale-shifted
classes (`bg-linear-*`, `shadow-xs`, `rounded-xs`) are produced on v4 and the old names on v3 — the
single coordination point F-C-024 asks for, shared by lib/extractor/eslint.

## Worked examples (before → after)

### Build wiring — `rideshare/tailwind.config.js:1-21`

```js
// before (today, rideshare/tailwind.config.js:1-21) — v3 content.extract, dead on Tailwind v4
const { fluentHtmlExtractor } = require("fluent-html-tailwind-extractor");
const defaultExtractor = (content) =>
  content.match(/[a-zA-Z0-9_\-:\/]+(?:\[[^\]]+\])?[a-zA-Z0-9_\-]*/g) || [];
const combinedExtractor = (content) => [
  ...fluentHtmlExtractor(content),
  ...defaultExtractor(content),
];
export default {
  content: { files: ["./src/**/*.ts", "./public/**/*.html"],
             extract: { ts: combinedExtractor, html: combinedExtractor } },
  theme: { extend: { colors: { forest: "#0d1f0f", /* … */ } } },
};
```

```ts
// after (with this RFC) — vite.config.ts; no tailwind.config.js, no hand-rolled regex
import tailwindcss from "@tailwindcss/vite";
import { fluentHtmlPlugin } from "fluent-html-tailwind-extractor";
import { themeManifest } from "./src/theme";   // from defineTheme(), RFC-C-02

export default {
  plugins: [
    tailwindcss(),
    fluentHtmlPlugin({
      content: ["./src/**/*.ts", "./public/**/*.html"],
      target: "v4",
      staticManifest: themeManifest,   // forest/moss/leaf covered even behind variables
      onUnresolved: "error",           // a dropped class = unstyled element = build failure
    }),
  ],
};
```

```css
/* src/app.css — the v3 directives + JS config are replaced by two lines */
@import "tailwindcss";
@import "./theme.css";   /* defineTheme() @theme block, RFC-C-02 */
```

### No build plugin? Generate a safelist file instead

```ts
// scripts/build-safelist.ts — run in prebuild; the smallest delta from today's regex extractor
import { writeFileSync } from "node:fs";
import { glob } from "node:fs/promises";
import { generateFluentSafelist } from "fluent-html-tailwind-extractor";
import { themeManifest } from "../src/theme";

const files = await Array.fromAsync(glob("./src/**/*.ts"));
writeFileSync("./src/fluent-safelist.css",
  generateFluentSafelist(files, { target: "v4", staticManifest: themeManifest, onUnresolved: "error" }));
// → @source inline("bg-forest text-leaf p-4 rounded-lg hover:bg-moss md:px-8 …");
```

### The dynamic-arg miss is now caught, not silent — `landing.components.ts:91`

```ts
// before: regex sees the literal, works by luck; abstract it and it silently breaks
const btnColor = hovered ? "leaf" : "moss";
Button("Go").background(btnColor)   // v4: leaf+moss absent, no error
```

```ts
// after: staticManifest from defineTheme covers all 11 tokens by construction;
// AND onUnresolved:"error" fails the build at the unresolved .background(btnColor) call-site,
// pointing at the file+method so the dev adds the tokens to the manifest or inlines the literal.
//   ✗ fluent-safelist: unresolved .background() in landing.components.ts (arg "btnColor")
```

## Type-safety story

- **Literal unions, not `string`.** `target: "v3" | "v4"` and `onUnresolved: "warn" | "error" | "silent"`
  are closed unions — a typo (`target: "v5"`) is a compile error. No bare `string` anywhere on the new
  surface (guardrail §11.4).
- **`TailwindTarget` is the single coordination type** (F-C-024). The same exported type is consumed by
  the ESLint plugin's `settings.fluentHtml.tailwindTarget` (RFC-C-03) and the lib's class-generation
  mode, so the three packages share *one* literal union rather than three hard-coded strings. Drift
  becomes a type mismatch, not a latent runtime bug (the class-string contract, §11.7).
- **`readonly` inputs** (`files`, `staticManifest`) accept `as const` arrays from `defineTheme()`
  output without widening, preserving the exact token vocabulary end to end.
- **Structured `onWarning` payload** (`{ file?, method, argText }`) instead of a pre-formatted string
  lets CI assert on the discriminated fields rather than scraping prose.
- **Backward-compatible defaults via optionality.** `ExtractorOptions` is fully optional; omitting
  `target` keeps `"v3"` — existing callers type-check and behave unchanged.

## Migration & compatibility

**Additive.** No existing symbol changes shape:

- `fluentHtmlExtractor(content, options?)` keeps its signature; `target` defaults to `"v3"`, so every
  current v3 consumer compiles and emits identical classes. The only addition is an *optional* second
  argument that already existed (`ExtractorOptions`), now with extra optional fields.
- `generateFluentSafelist`, `fluentHtmlPlugin`, `extractDefaultClasses` are **new exports** — nothing to
  break.
- `peerDependencies` widens `"tailwindcss": ">=3.0.0"` → `">=3.0.0 || >=4.0.0"`. devDeps gain a second
  Tailwind under a workspace alias so the vitest suite runs twice (`TAILWIND_TARGET=v3|v4`), asserting
  `gradientTo("to-r")`→`bg-gradient-to-r` (v3) / `bg-linear-to-r` (v4), `shadow("sm")`→`shadow-sm` (v3) /
  `shadow-xs`-equivalent (v4) — closing the F-C-072 CI gap before any `METHOD_PATTERNS` rename ships.

**`breaking-changes.md` note:** none required for the package API. The *app-level* migration (move off
`content.extract`) is documented, not enforced by a code break: v3 apps keep working until they choose to
adopt v4. Apps adopting v4 follow a 3-step codemod-able recipe — (1) delete the hand-rolled
`combinedExtractor` block, (2) add `fluentHtmlPlugin({ target: "v4", … })` to the Vite plugins, (3)
replace `@tailwind` directives with `@import "tailwindcss"`. A codemod can do (1) and (3) mechanically;
(2) is a one-line insertion.

**Depends on RFC-C-02** (`defineTheme()`) for `staticManifest` — without it, `staticManifest` is simply
omitted and dynamic-arg coverage degrades to the `onUnresolved` policy. The plugin ships independently;
the manifest hardens it.

## Guidelines impact

The styling guidance currently says nothing about the build pipeline; under v4 the wiring is the part
that silently breaks. Add a Tailwind-v4 wiring rule to the index and the full pattern to the topic ref.

### Index — `web-development/CLAUDE.md`

Under `## Fluent Tailwind Styling` (after the existing fluent-methods block, before the `---`), insert:

```md
**Tailwind v4 wiring** — fluent classes never appear as literal text in source, so v4's auto-detection can't see them. Register the plugin; never rely on `content.extract` (removed in v4) or hand-rolled `combinedExtractor`:
```typescript
// vite.config.ts
fluentHtmlPlugin({ content: ["./src/**/*.ts"], target: "v4", staticManifest: themeManifest, onUnresolved: "error" })  // ✓
```
```css
@import "tailwindcss";   /* ✓ v4 — not @tailwind base/components/utilities */
```
```js
extract: { ts: combinedExtractor }   // ✗ v3 content.extract hook, dead on v4
content.match(/[a-zA-Z0-9_...]/)      // ✗ never hand-roll the default extractor — import extractDefaultClasses
```
- `onUnresolved: "error"` on v4 — a dropped class is an unstyled element with no build error otherwise.
- Pass `staticManifest` from `defineTheme()` so custom tokens behind variables (`.background(btnColor)`) are still emitted.
```

Also update the existing `## Tailwind CSS` bullet to name the real mechanism:

```md
## Tailwind CSS

- **No dynamic class interpolation** — Tailwind purging removes dynamically-generated classes. Prefer literal fluent calls; when a token must come from a variable, ensure it is in `defineTheme()`'s `staticManifest` so the extractor still emits it.
- **v4 build:** `fluentHtmlPlugin` (Vite/PostCSS) emits `@source inline("…")` for fluent classes. Never `content.extract` (v3-only).
```

### Topic ref — `web-development/fluent-html.md`

Under `## Fluent Tailwind Styling` (after line 105), add a subsection:

```md
### Tailwind v4 build wiring

fluent methods append class strings at render time — they are **invisible to Tailwind v4's automatic content detection**. Wire the extractor as a v4 plugin (or generate a safelist file):

```ts
// vite.config.ts — integrated path (preferred)
import tailwindcss from "@tailwindcss/vite";
import { fluentHtmlPlugin } from "fluent-html-tailwind-extractor";
import { themeManifest } from "./src/theme";   // defineTheme() output

export default {
  plugins: [
    tailwindcss(),
    fluentHtmlPlugin({
      content: ["./src/**/*.ts", "./public/**/*.html"],
      target: "v4",                 // emits bg-linear-*, shadow-xs, rounded-xs
      staticManifest: themeManifest,
      onUnresolved: "error",        // unresolved fluent arg fails the build
    }),
  ],
};
```

```ts
// no build plugin? generate a CSS @source inline() block in prebuild
import { generateFluentSafelist } from "fluent-html-tailwind-extractor";
writeFileSync("./src/fluent-safelist.css",
  generateFluentSafelist(files, { target: "v4", staticManifest: themeManifest }));
// → @source inline("bg-forest p-4 rounded-lg hover:bg-moss …");
```

```css
/* app.css */
@import "tailwindcss";
@import "./fluent-safelist.css";   /* or rely on the plugin */
```

| Need | API | Tailwind |
|---|---|---|
| Vite/PostCSS plugin (preferred) | `fluentHtmlPlugin(opts)` | v4 |
| Generate `@source inline()` file | `generateFluentSafelist(files, opts)` | v4 |
| Default-candidate passthrough | `extractDefaultClasses(content)` | v3/v4 |
| Legacy `content.extract` callback | `fluentHtmlExtractor(content, opts)` | v3 only |

✓ `fluentHtmlPlugin({ target: "v4" })` — registers fluent classes with Oxide
✗ `content.extract: { ts: fluentHtmlExtractor }` — removed in v4; emits no CSS for fluent classes
✗ hand-rolled `combinedExtractor` + raw regex — `extractDefaultClasses` is exported; don't copy-paste it
```

**Adoption note:** the old extractor README claimed the default-candidate pass was "built in" but never
exported it, so both apps cargo-culted a subtly different raw regex (F-C-054). Exporting
`extractDefaultClasses` and documenting the plugin path removes the guesswork that produced the
divergent workarounds.

## Guardrail check

- **§11.1 zero-deps:** Pass. New code lives in the extractor (a dev/tooling package); `vite`/`tailwindcss`
  are `peerDependencies`/types-only, no new runtime dep in the lib.
- **§11.2 ssr-only / fast sync render:** N/A. Build-time tooling only; no render-path code touched.
- **§11.3 escape-by-default / XSS:** N/A. Emits CSS `@source inline()` strings, no markup; no `Raw` surface.
- **§11.4 type-safety:** Pass. `TailwindTarget`/`UnresolvedPolicy` literal unions, `readonly` inputs,
  structured `onWarning` payload, no bare `string`, no `any`.
- **§11.5 backward-compat:** Pass. Additive; `fluentHtmlExtractor` unchanged, defaults preserve v3
  behavior; peerDep widened not narrowed. App migration is documented + partially codemod-able.
- **§11.6 idioms:** Pass. `defineX`-style factory (`defineTheme` sibling), option objects with literal
  unions, single-source `TailwindTarget` mirroring `defineRoutes`/`defineIds` single-sourcing.
- **§11.7 class-string contract:** Pass — this RFC *is* the coordination point. `target` threads the same
  literal union through lib (RFC-C-02/methods), extractor (`METHOD_PATTERNS`), and eslint
  (`settings.tailwindTarget`, RFC-C-03); the dual-version vitest matrix (F-C-072) proves agreement.
- **§11.8 guideline-sync:** Pass. `## Guidelines impact` covers every `api_surface` symbol —
  `fluentHtmlPlugin`, `generateFluentSafelist`, `extractDefaultClasses`, `ExtractorOptions.target`,
  `.onUnresolved`, `.staticManifest`, and the unchanged `fluentHtmlExtractor` — with exact ✓/✗ markdown
  for both `CLAUDE.md` and `fluent-html.md`. `guideline_updates` frontmatter lists both files.

## Alternatives considered

1. **Render-time class manifest (instrument the lib to dump every produced class during a build pass).**
   Most accurate — no regex, catches dynamic args. Rejected as the *primary* path: requires a real
   render/build step in every app and lib-side instrumentation (touches the hot path, risks §11.2).
   Captured instead as the `staticManifest` input fed by `defineTheme()` (RFC-C-02), which gives the
   accuracy for the finite token vocabulary without instrumenting render.
2. **Keep only `generateFluentSafelist`, skip the plugin.** Smaller surface, but every app re-implements
   the prebuild script + glob + write — exactly the copy-paste pattern that produced the two divergent
   `combinedExtractor`s (F-C-054). The plugin makes adoption a one-line change, so both ship; the
   function stays for non-Vite/non-PostCSS setups.
3. **v4-only, drop `fluentHtmlExtractor`.** Cleaner package, but breaks every current monorepo consumer
   (`ttl`, `rideshare`) the moment they update the package, before they're ready for v4. Violates §11.5.
   The `target` flag keeps v3 alive at near-zero cost.
4. **Auto-detect Tailwind major at runtime.** Brittle (reads `node_modules` versions, fails under PnP/
   monorepo hoisting) and hides the decision. An explicit `target` literal is type-safe and greppable.

## Open questions

1. **PostCSS vs Vite as the canonical plugin shape.** `fluentHtmlPlugin` returns a Vite `Plugin`; the
   PostCSS variant is the same factory adapted. Do we ship two named exports
   (`fluentHtmlVitePlugin`/`fluentHtmlPostcssPlugin`) or one polymorphic `fluentHtmlPlugin`? Leaning
   polymorphic with an internal adapter to keep the surface small.
2. **Should `onUnresolved: "error"` be the v4 default, or opt-in?** Erroring is safest (a silent dropped
   class is the worst failure mode), but a noisy migration. Proposal: default `"error"` on `target: "v4"`,
   `"warn"` on `"v3"`. Confirm apps with intentional dynamic args (rare) can downgrade per-call via the
   manifest before flipping to `"error"`.
3. **Does the plugin own the `@source inline()` injection, or write a file the user `@import`s?** Injecting
   directly into the Tailwind candidate set is cleaner but couples to Oxide internals; writing a file is
   robust and inspectable. Leaning: plugin writes a virtual module the CSS `@import`s, so the output is
   inspectable without a committed generated file.
