# Recon 03 — Tailwind CSS v4 Readiness & Gap Analysis

> **Scope:** Assess `fluent-html`'s readiness for Tailwind CSS v4. What the library generates today, what it assumes, what v4 breaks, and the full migration surface. Feeds the "Tailwind 4 support plan" wave of fluent-html v6.
>
> **Date:** 2026-06-21 · **Tailwind v4 line researched:** v4.0 / v4.1 (current). Sources cited inline; full list at the end.

---

## 1. Current state — how fluent-html does Tailwind

### 1.1 Architecture

fluent-html does **not** ship or wrap Tailwind. It is a string generator: fluent methods append Tailwind **class-name strings** to a `Tag`, and a separate companion package (`fluent-html-tailwind-extractor`) feeds those strings back to Tailwind's content/JIT scanner so Tailwind generates the corresponding CSS. There are three moving parts:

| Part | Repo | Role |
|---|---|---|
| **Fluent methods + type tables** | `fluent-html` (`src/core/tailwind-methods.ts`, `src/core/tailwind-types.ts`) | `.padding("4")` → appends `"p-4"` via `addClass`. Types constrain the accepted values. |
| **Content extractor** | `fluent-html-tailwind-extractor` (`src/index.ts`) | Regex-scans source for fluent method calls, reconstructs the class names, hands them to Tailwind's `content.extract` API so CSS gets generated. |
| **ESLint plugin** | `fluent-html-eslint-plugin` (`src/rules/*`) | Steers users from raw `setClass("bg-red-500 …")` to fluent methods; detects conflicting classes. Encodes a hand-maintained map of Tailwind class names → fluent methods. |

The class string is the contract that ties all three together — they each independently hard-code Tailwind's v3 utility vocabulary.

### 1.2 How class strings are produced (fluent-html)

Every method is a thin template-string append over `addClass`. Examples from `src/core/tailwind-methods.ts`:

- `.background(color)` → `bg-${color}` (line 352)
- `.textColor(color)` → `text-${color}` (line 353)
- `.shadow(value?)` → `shadow` or `shadow-${value}` (lines 451–453)
- `.rounded(value?)` → `rounded` or `rounded-${value}` (lines 442–450)
- `.ring(value?)` → `ring` or `ring-${value}` (lines 533–535)
- `.outline(value)` → `outline-${value}` (line 568)
- `.gradientTo(dir)` → `bg-gradient-${dir}` (line 576), `.from/.via/.to` → `from-/via-/to-${color}` (lines 577–579)
- `.blur(value?)` → `blur` or `blur-${value}` (lines 596–598); same pattern for `backdropBlur`, `divideX/Y`, `transition`
- `.flexWrap(value)` → `flex-${value}` (line 500) — note: produces `flex-wrap` etc.
- `.shrink/.grow` → `shrink`/`shrink-${value}`, `grow`/`grow-${value}` (lines 494–499) — **already the v4 names**, good.
- **Arbitrary-value unit overloads:** `.minH("px", 180)` → `min-h-[180px]` (lines 390–397); same scheme for `w/h/minW/maxW/maxH/padding/margin/gap/top/right/bottom/left/inset`. Bracket arbitrary syntax `[…]` is used throughout — this is v3 **and** v4 compatible.
- **Variants:** `.on(state, fn)` / `.at(bp, fn)` push a `_variantPrefix` (`hover`, `md`, nested `dark:hover`) that prepends to every class added in the callback (lines 86–92, 326–332). Produces `hover:bg-blue-600`, `md:px-8`, `dark:hover:bg-gray-800`.
- **Escape hatches:** bracket strings in the type (`.textSize("[13px]")`, `.opacity("[0.33]")`, `.zIndex("[999]")`) and `(string & {})` widening on color/spacing types let custom theme tokens through.

The methods are pure string concatenation with **no awareness of which Tailwind version is on the other end.** That is both the resilience (arbitrary values, variants, custom tokens flow through untouched) and the risk (renamed/removed utilities silently emit dead class names).

### 1.3 Targeted Tailwind version: **v3** (confirmed)

Multiple hard signals that the toolchain assumes **Tailwind v3**, not v4:

1. **Extractor peerDependency** `"tailwindcss": ">=3.0.0"`, devDependency `"^3.0.0"`; README "Requirements: Tailwind CSS 3.0 or higher" (`fluent-html-tailwind-extractor/package.json`, `README.md` line 285).
2. **Setup docs use the v3 pipeline only:** `tailwind.config.js` with `content.extract` (the JS extractor API, **removed/replaced by automatic detection in v4**), `@tailwind base; @tailwind components; @tailwind utilities;` (the v3 directives — **replaced by `@import "tailwindcss"` in v4**), `postcss.config.js` with `tailwindcss: {}` (the v3 PostCSS plugin — **moved to `@tailwindcss/postcss` in v4**), and `npx tailwindcss -i … -o …` (the v3 CLI — **moved to `@tailwindcss/cli`**). See `TAILWIND-SETUP.md` lines 27–116 and `README.md` lines 2093–2130.
3. **The `content.extract` extractor API itself is a v3 mechanism.** v4 replaced configurable content extractors with the Oxide engine's automatic content detection — there is no `extract` hook to register the extractor into. (See §3, blocker B-1.)
4. **v3-era utility names baked into the type tables** (`src/core/tailwind-types.ts`):
   - `TailwindShadow` (line 81) includes `"sm"` and the bare `.shadow()` form → emits `shadow` / `shadow-sm` whose **rendered appearance changes in v4** (the scale shifted; v3 `shadow-sm`/`shadow` ≈ v4 `shadow-xs`/`shadow-sm`).
   - `TailwindBlur` (line 205): `"none" | "sm" | "md" | …` + bare → same scale-shift problem.
   - `TailwindRounded` (line 77): `"none" | "sm" | …` + bare → same scale-shift problem.
   - `TailwindGradientDirection` (line 197): `"to-t" | "to-r" | …` and `.gradientTo` emits **`bg-gradient-to-*`**, which v4 **renamed to `bg-linear-to-*`**.
   - `TailwindRingWidth` (line 144) includes the bare `.ring()` → v3 = 3px ring; in v4 bare `ring` = 1px (semantics change).
   - `TailwindColorName` (lines 53–55) is the v3 default palette names — these still exist in v4, but v4's default color space is OKLCH/P3 so rendered values differ.
5. **ESLint conflict rule** (`fluent-html-eslint-plugin/src/rules/no-conflicting-classes-in-setclass.ts`) hard-codes v3 vocabulary including utilities **removed in v4**: `flex-grow`/`flex-shrink` family handled as `grow-`/`shrink-` prefixes (ok), but the `PREFIX_CONFLICTS` list (lines 102–140) and `CONFLICT_GROUPS` (lines 4–99) reference v3 names like `overflow-ellipsis` semantics, `backdrop-opacity-`, and assume the v3 gradient/opacity utility shapes. The auto-fix map in `no-known-modifiers-in-setclass.ts` (36 KB) translates v3 class names to fluent methods — any v3 name removed in v4 becomes a stale suggestion.

### 1.4 Role of the extractor (detail)

`fluent-html-tailwind-extractor/src/index.ts` is a **regex** scanner (not an AST parser):

- `METHOD_PATTERNS` (lines 56–540) is a second, independent copy of the class-generation logic — it must mirror `tailwind-methods.ts` exactly. e.g. `gradientTo` → `bg-gradient-${args[0]}` (line 391), `shadow` → `shadow`/`shadow-${arg}` (line 289), `ring` → `ring`/`ring-${arg}` (line 297), `rounded` (line 266), `blur` (line 415).
- `extractVariantClasses` (lines 637–680) re-implements `.on`/`.at` nesting to prefix variants.
- `extractDirectClasses` (lines 587–598) pulls raw strings out of `setClass`/`addClass`.
- `extractDefaultClasses` (lines 688–691) re-implements Tailwind's **default candidate extractor** so the package can be a drop-in replacement for the built-in one (README line 16, 77). This is the part most coupled to v3's `content.extract` contract.
- It is wired in via `content.extract: { ts: fluentHtmlExtractor, … }` — **a v3-only config shape.**

### 1.5 Role of the ESLint plugin (detail)

Two Tailwind-coupled rules:
- `no-known-modifiers-in-setclass` (auto-fixable; 36 KB map of class→method) — the single biggest hard-coded v3 vocabulary surface outside the type tables.
- `no-conflicting-classes-in-setclass` — `CONFLICT_GROUPS` + `PREFIX_CONFLICTS` enumerate mutually-exclusive v3 utilities.

Both must be re-audited for v4 renames/removals (stale suggestions, missing new utilities, removed-utility false positives).

---

## 2. Tailwind v4 changes that matter

### 2.1 Configuration & tooling (architectural)

| v3 | v4 |
|---|---|
| `tailwind.config.js` (JS config, auto-detected) | **CSS-first**: `@theme { --color-… --breakpoint-… }`. JS config no longer auto-loaded; opt-in via `@config "…"`. |
| `@tailwind base; @tailwind components; @tailwind utilities;` | **`@import "tailwindcss";`** (one line) |
| PostCSS plugin `tailwindcss` | **`@tailwindcss/postcss`** (separate package); or first-class Vite plugin `@tailwindcss/vite`. |
| CLI `tailwindcss` | **`@tailwindcss/cli`** |
| `content: { files, extract }` (configurable extractors) | **Automatic content detection** (Oxide). Scans the project, respects `.gitignore`, skips `node_modules`/binaries. **No `extract` hook.** Manual sources via `@source "…"`; safelisting via `@source inline("…")`. |
| `safelist`, `corePlugins`, `separator` config keys | **Removed.** safelist → `@source inline()`. |
| `theme(colors.red.500)` in CSS | **`var(--color-red-500)`** (theme tokens are real CSS variables); `theme(--breakpoint-xl)` for the few non-variable lookups. |
| `@layer utilities { … }` for custom utilities | **`@utility name { … }`** |
| custom variants in JS plugin | **`@custom-variant`** / `@variant` in CSS |
| Default color space sRGB (hex/HSL) | **OKLCH / P3** default palette; `color-mix()` used internally for opacity. |
| Browser baseline | **Safari 16.4+, Chrome 111+, Firefox 128+** (uses `@property`, `color-mix`, cascade layers). |

Sources: Tailwind v4 blog, upgrade guide, theme docs (links at end).

### 2.2 Renamed / removed utilities (the concrete table)

**Removed deprecated utilities (no direct class replacement — use modifier syntax):**

| v3 (removed) | v4 replacement |
|---|---|
| `bg-opacity-*` | `bg-{color}/{opacity}` (e.g. `bg-black/50`) |
| `text-opacity-*` | `text-{color}/{opacity}` |
| `border-opacity-*` | `border-{color}/{opacity}` |
| `divide-opacity-*` | `divide-{color}/{opacity}` |
| `ring-opacity-*` | `ring-{color}/{opacity}` |
| `placeholder-opacity-*` | `placeholder-{color}/{opacity}` |
| `flex-shrink-*` | `shrink-*` |
| `flex-grow-*` | `grow-*` |
| `overflow-ellipsis` | `text-ellipsis` |
| `decoration-slice` | `box-decoration-slice` |
| `decoration-clone` | `box-decoration-clone` |

**Renamed scale utilities (same visual, new name — and the bare/`sm` slots shifted):**

| v3 | v4 |
|---|---|
| `shadow-sm` | `shadow-xs` |
| `shadow` | `shadow-sm` |
| `drop-shadow-sm` | `drop-shadow-xs` |
| `drop-shadow` | `drop-shadow-sm` |
| `blur-sm` | `blur-xs` |
| `blur` | `blur-sm` |
| `backdrop-blur-sm` | `backdrop-blur-xs` |
| `backdrop-blur` | `backdrop-blur-sm` |
| `rounded-sm` | `rounded-xs` |
| `rounded` | `rounded-sm` |

> ⚠️ This is the nastiest class of break: the **same class name still resolves**, but to a *different* value (v3 `rounded` = 0.25rem; v4 `rounded` = old `rounded-sm`). Visual regressions, not compile errors.

**Behavior/semantic changes (same name, different default):**

| Utility | v3 | v4 |
|---|---|---|
| `ring` | 3px, `blue-500` | **1px**, `currentColor`. Use `ring-3` + explicit color for old look. |
| `outline-none` | invisible outline (a11y) | now there are two: **`outline-hidden`** = old behavior; **`outline-none`** = real `outline-style:none`. |
| `border` default color | `gray-200` | **`currentColor`** |
| placeholder color | `gray-400` | current text color @ 50% |
| `rotate-*`/`scale-*`/`translate-*` | composited `transform` | **individual** CSS properties; reset via `scale-none` not `transform-none`; `transition-[…,transform]` → `transition-[…,scale]`. |
| space-between / divide selectors | `> :not([hidden]) ~ :not([hidden])` | `> :not(:last-child)` (margin direction flipped to `*-bottom`) |
| `hover:` | always | gated behind `@media (hover:hover)` |
| buttons | `cursor:pointer` (preflight) | `cursor:default` |

**Gradient rename:**

| v3 | v4 |
|---|---|
| `bg-gradient-to-r` (and `-t/-b/-l/-tr/…`) | **`bg-linear-to-r`** (linear); plus new `bg-radial-*`, `bg-conic-*` |

**Syntax changes:**

| Concept | v3 | v4 |
|---|---|---|
| Important modifier | `!flex` (prefix) | `flex!` (**suffix**) |
| Prefix | `tw-flex` | `tw:flex` (**variant-like**, leading) |
| CSS var arbitrary value | `bg-[--brand]` | `bg-(--brand)` (**parens**) |
| Arbitrary value w/ spaces | `grid-cols-[max-content,auto]` | `grid-cols-[max-content_auto]` (commas not auto-spaced; use `_`) |
| Stacked variant order | right-to-left | **left-to-right** (`first:*:` → `*:first:`) |

### 2.3 New features (opportunity surface, not breakage)

- **Container queries built-in** — `@container`, `@sm:`/`@max-md:` variants, no plugin.
- **`@utility` / `@custom-variant`** — CSS-defined custom utilities/variants.
- **Dynamic spacing scale** — spacing derived from one `--spacing` base; any numeric step works (`p-13`, `mt-17`) without config. Also dynamic `grid-cols-N`, `data-*`, etc.
- **3D transforms** — `rotate-x-*`, `rotate-y-*`, `rotate-z-*`, `translate-z-*`, `scale-z-*`, `perspective-*`, `transform-3d`, `backface-*`.
- **`not-*` variant** — `not-hover:`, `not-[…]:`, negated media/feature queries.
- **Expanded gradients** — `bg-radial-*`, `bg-conic-*`, angle linear gradients (`bg-linear-45`), interpolation modifiers (`/oklch`, `/srgb`).
- **P3 / OKLCH default palette**, **`color-mix()`** for opacity, **CSS-variable theme tokens** exposed as `var(--color-*)`, `var(--spacing-*)`, `var(--breakpoint-*)` (huge for type-safe token exposure — see §5).
- **`starting:` variant** (`@starting-style`), `inert`, `field-sizing`, etc.

---

## 3. Gap analysis (per change → what breaks → severity → location)

Severity legend: **🔴 Blocker** (v4 simply won't work or silently mis-styles broadly) · **🟠 Major** (wrong/dead classes for common utilities) · **🟡 Minor** (edge utilities, docs, lint noise).

### 🔴 Blockers

| # | v4 change | What breaks in fluent-html | Where |
|---|---|---|---|
| B-1 | `content.extract` API removed (automatic detection) | **The entire extractor wiring is gone.** v4 has no `extract` hook to register `fluentHtmlExtractor`. But fluent methods produce class names that **do not appear verbatim in source** (`.background("red-500")` never writes `bg-red-500`), so v4's automatic content detection **cannot see them** → those utilities get **no CSS generated**. This is existential: without a v4 detection story, fluent-html styling silently produces unstyled pages. | `fluent-html-tailwind-extractor/src/index.ts` (whole package); `TAILWIND-SETUP.md`; `README.md` 2093–2130 |
| B-2 | `@tailwind` directives → `@import "tailwindcss"`; PostCSS plugin/CLI moved | All setup docs and the documented build pipeline are invalid on v4. Users following docs get a non-building project. | `TAILWIND-SETUP.md` 66–116; `README.md` 2093–2130; extractor `README.md` 174–194 |
| B-3 | `tailwind.config.js` not auto-loaded; CSS-first `@theme` | Documented config (`content`, `theme.extend`, `safelist`) is dead by default. Custom-token story (`(string & {})` widening relies on theme having those tokens) needs `@theme` or `@config`. | `TAILWIND-SETUP.md` 27–51; extractor `README.md` 26–75, 214–234 |

> B-1 is the headline. Everything else is mechanical; B-1 forces a design decision about *how* class names reach the Oxide scanner (a generated safelist/`@source inline()` file, an emitted side-channel, or a build plugin). See §5.

### 🟠 Major

| # | v4 change | What breaks | Severity rationale | Location |
|---|---|---|---|---|
| M-1 | Gradient rename `bg-gradient-to-*` → `bg-linear-to-*` | `.gradientTo()` emits **dead classes** on v4 (no CSS generated). Type table + extractor + (any lint map) all wrong. | Common utility; silent no-op. | methods L576; types L197–199; extractor L391 |
| M-2 | Scale shift `shadow`/`shadow-sm`, `rounded`/`rounded-sm`, `blur`, `backdrop-blur`, `drop-shadow` | Classes still resolve but **render differently** → broad, silent visual regressions across every card/button/input. | Pervasive utilities; no compile/runtime error. | types L77,81,205; methods L442–453,596–601; extractor L266,289,415 |
| M-3 | `ring` default 3px→1px, color blue-500→currentColor | Bare `.ring()` and `.on("focus", t=>t.ring(...))` focus rings change thickness/color everywhere; default focus styling regresses. | Focus rings are everywhere in the SSR apps. | types L144; methods L533–536 |
| M-4 | `outline-none` semantics split | `.outline("none")` now means real `outline-style:none` (loses a11y outline) instead of the old hidden-but-present outline. Need `outline-hidden`. | a11y regression on focus. | types L165; methods L568 |
| M-5 | Opacity utilities removed (`bg-opacity-*` etc.) | Not generated by fluent methods directly (good), **but** the ESLint conflict/auto-fix maps reference them, and any user `addClass("bg-opacity-50")` becomes dead. Color-with-opacity must use `/NN`. | Affects lint correctness + user escape-hatch code. | eslint `no-conflicting-…` L116,128; `no-known-modifiers-…` map |
| M-6 | Default `border` color → `currentColor` | `.border()` with no color now draws in text color, not gray-200 → visible borders change color app-wide. | Pervasive; silent. | methods L425–434 |
| M-7 | ESLint vocab drift | `no-known-modifiers-in-setclass` (auto-fix) and `no-conflicting-classes-in-setclass` encode v3 names; will suggest/auto-fix to **renamed/removed** classes (e.g. fix `flex-shrink-0`→ wrong, suggest `bg-gradient-*`). | Tooling actively produces wrong code. | eslint `src/rules/no-known-modifiers-in-setclass.ts`, `no-conflicting-classes-in-setclass.ts` |

### 🟡 Minor

| # | v4 change | What breaks | Location |
|---|---|---|---|
| m-1 | Important `!flex`→`flit!`, prefix `tw-`→`tw:` | fluent-html doesn't emit `!`/prefixes itself; only user `addClass` strings + docs affected. | docs |
| m-2 | CSS-var arbitrary `[--x]`→`(--x)` | Escape-hatch types accept `[${string}]` brackets only; a user wanting `bg-(--brand)` can't express it via brackets. Minor type-table gap. | types (bracket escape hatches) |
| m-3 | `transform-none`→`scale-none`, individual transform props | fluent-html has no `transformNone()`; `transition("transform")` may not animate `scale-*` as expected. Edge. | methods L525,540–546 |
| m-4 | space/divide selector change | Behavior change only matters with adjacent-hidden edge cases; classes unchanged. | methods L514–521 |
| m-5 | `hover` gated to `hover:hover`, button `cursor:default` | Behavior change; explains the existing CLAUDE.md rule "anchors with setHtmx need cursor-pointer". No code change, maybe a doc note. | docs |
| m-6 | New features unused | `containerQuery`, `not-*`, 3D transforms, radial/conic gradients, dynamic arbitrary numeric spacing — **missing methods/types** (opportunity, not breakage). | new methods/types |

### Things that DON'T break (resilience to note)

- **Arbitrary bracket values** (`min-h-[180px]`, `text-[13px]`) — valid in v4. The unit overloads survive untouched.
- **Variant prefixing** (`hover:`, `md:`, `dark:hover:`) — syntax unchanged; `.on`/`.at` keep working.
- **`shrink`/`grow`** — fluent-html already emits the v4 names (methods L494–499), ahead of the curve.
- **`(string & {})` color/spacing widening** — still lets v4 dynamic spacing (`p-13`) and custom `@theme` tokens through.
- Core color *names* (`red-500`) — still valid (rendered as OKLCH but same class name).

---

## 4. Migration surface (full file/area list)

### fluent-html (this repo)
- **`src/core/tailwind-types.ts`** — `TailwindShadow` (L81), `TailwindBlur` (L205), `TailwindRounded` (L77 — note the `xs` slot now exists), `TailwindRingWidth` (L144), `TailwindGradientDirection` (L197), `TailwindOutline` (L165). Add types for new features: container-query, 3D transforms, radial/conic gradient, `not-*` state. Consider exposing `xs` scale values. Decide on bracket→paren CSS-var escape hatch.
- **`src/core/tailwind-methods.ts`** — `gradientTo` (L576, → `bg-linear-`), `shadow`/`rounded`/`blur`/`backdropBlur` (scale slots), `ring`/`ringColor` (defaults), `outline` (hidden vs none), `border` (default-color doc/helper). Add: `containerQuery`/`@container` marker, `rotateX/Y/Z`, `translateZ`, `perspective`, `gradientRadial`/`gradientConic`, `not()` variant helper, `outlineHidden()`. Possibly a v3/v4 mode flag.
- **`FLUENT-STYLING.md`** — gradient (L202–208), shadow/blur/rounded examples (L162–171, L211–223), outline (L250), notes (L278–284).
- **`TAILWIND-SETUP.md`** — full rewrite for v4 pipeline (`@import`, `@tailwindcss/postcss`/`vite`, automatic detection + chosen class-detection strategy, `@theme`).
- **`README.md`** — styling section (L854–1130), extractor section (L2093–2130), states/variants notes, requirements.
- **`CHANGELOG.md`**, **`CLAUDE.md`** (the styling rules block), **`examples/`** (any gradient/shadow usage).

### fluent-html-tailwind-extractor (companion)
- **`src/index.ts`** — the core problem (B-1): v4 has no `content.extract`. Likely **repurpose** from a Tailwind extractor into a **class-name emitter / safelist generator** (scan source → write `@source inline(…)` block or a generated CSS/JSON the user `@import`s). Update `METHOD_PATTERNS` (gradient L391, shadow L289, rounded L266, blur L415, ring L297) to emit v4 names. `extractDefaultClasses` (L688) becomes irrelevant under automatic detection.
- **`package.json`** — peerDependency `tailwindcss >=3` → v4; possibly new name/major version.
- **`README.md`** — full rewrite of usage (no `content.extract`).
- **`src/index.test.ts`** — expected-class fixtures change.

### fluent-html-eslint-plugin (companion)
- **`src/rules/no-known-modifiers-in-setclass.ts`** (36 KB map) — audit every v3 class→method entry against v4 renames/removals; update suggestions (gradient, shadow scale, opacity utilities, flex-grow/shrink, overflow-ellipsis).
- **`src/rules/no-conflicting-classes-in-setclass.ts`** — `CONFLICT_GROUPS` (L4–99) + `PREFIX_CONFLICTS` (L102–140): remove dead v3 prefixes (`backdrop-opacity-`, opacity families), add `bg-linear-`/`bg-radial-`/`bg-conic-`, container-query and 3D-transform groups.
- **`README.md`/`USAGE.md`/tests** — examples.

### Cross-cutting decisions to encode
- A v3-vs-v4 **target switch** (the string output differs: `bg-gradient-` vs `bg-linear-`, `shadow-sm` vs `shadow-xs`). Three copies of the generation logic (methods, extractor, eslint map) must agree on the target.

**Rough size:** ~6 source files with real logic changes across 3 repos (`tailwind-types.ts`, `tailwind-methods.ts`, extractor `index.ts`, 2 eslint rules) + ~8 doc/config files + test fixtures. The *mechanical* renames are small and largely codemod-able; the **architectural** work (B-1 class detection without `content.extract`, and the v3/v4 dual-target story) is where the effort concentrates. Estimate: **mechanical ~1–2 days; architecture (extractor redesign + dual-target) ~1–2 weeks** including tests across the three packages.

---

## 5. Open questions / decisions

1. **Support v3 AND v4, or v4-only?** The class strings differ (`bg-gradient-*` vs `bg-linear-*`, `shadow-sm` vs `shadow-xs`). Options: (a) v4-only in a major bump, (b) a runtime/build **target flag** threaded through all three packages, (c) emit v4 and ship a v3→v4 compat shim. A target flag multiplies test matrix but protects existing consumers (`ttl`, `rideshare`, etc. in this monorepo).

2. **How do class names reach Oxide without `content.extract`? (the B-1 decision.)** Candidates:
   - **Generated safelist file**: extractor scans source → writes a `.css` with `@source inline("bg-red-500 p-4 …");` that the user `@import`s. Keeps the regex scanner, drops the `extract` hook.
   - **Emit at render time**: have fluent-html optionally dump every produced class to a manifest during a build pass, then `@source inline()` it. More accurate (no regex), needs a build step.
   - **First-class Tailwind plugin**: a `@tailwindcss/vite`/PostCSS-level plugin that registers the classes. Most integrated, most work.
   - Lean: generated-safelist is the smallest delta from today's regex extractor.

3. **CSS-first config for an SSR lib — what do we own vs the user?** fluent-html doesn't ship CSS today. Do we provide a base `@import "tailwindcss"; @theme { … }` snippet, or just document it? The `(string & {})` custom-token escape hatch presumes the user defined those tokens — under `@theme` we could **generate** a `@theme` block and matching TS token union for type-safe tokens.

4. **Type-safe `@theme` tokens.** v4 exposes tokens as `var(--color-*)`, `var(--spacing-*)`, `var(--breakpoint-*)`. Opportunity: a `defineTheme()` that takes a token object and yields both the `@theme` CSS and a narrowed `TailwindColor`/`TailwindSpacing` union (replacing today's `(string & {})` widening with real safety). Worth scoping for v6.

5. **Scale-shift handling.** For `shadow`/`rounded`/`blur`: do we (a) keep method names and silently emit the v4 name that matches the *old look* (`.shadow("sm")` → `shadow-xs`?) to preserve visuals, or (b) pass through literally and let users adopt the new scale? (a) is least-surprise for existing UIs but hides the new scale; (b) is honest but a visual breaking change. Recommend (b) + a CHANGELOG migration note, since v4 is a major bump anyway.

6. **New-feature methods.** Which v4 features warrant first-class fluent methods in v6: container queries (`.containerQuery()` + `@`-variants in `.at()`), `not-*` (extend `.on()`), 3D transforms, radial/conic gradients, dynamic numeric spacing? These are additive and can land incrementally after the breaking-change pass.

7. **Browser baseline.** v4 requires Safari 16.4+/Chrome 111+/FF 128+. Confirm the SSR apps' supported-browser matrix tolerates this before committing to v4-only.

---

## Sources

- Tailwind v4 upgrade guide — <https://tailwindcss.com/docs/upgrade-guide>
- Tailwind v4.0 announcement — <https://tailwindcss.com/blog/tailwindcss-v4>
- Theme variables (CSS-first `@theme`, `var(--*)`) — <https://tailwindcss.com/docs/theme>
- Box-shadow scale — <https://tailwindcss.com/docs/box-shadow>
- TailwindCSS v4 migration overview (gist) — <https://gist.github.com/jumploops/fcc3c4b5130d5a672904f302d641ce43>
- DEV: Tailwind v4 migration guide (2026) — <https://dev.to/pockit_tools/tailwind-css-v4-migration-guide-everything-that-changed-and-how-to-upgrade-2026-5d4>
- Steve Kinney — Tailwind 4 (container queries, 3D, new features) — <https://stevekinney.com/courses/tailwind/tailwind-4>

### Source files cited (this monorepo)
- `fluent-html/src/core/tailwind-methods.ts`
- `fluent-html/src/core/tailwind-types.ts`
- `fluent-html/src/core/behavior-methods.ts`
- `fluent-html/TAILWIND-SETUP.md`, `FLUENT-STYLING.md`, `README.md`
- `fluent-html-tailwind-extractor/src/index.ts`, `package.json`, `README.md`
- `fluent-html-eslint-plugin/src/rules/no-conflicting-classes-in-setclass.ts`, `no-known-modifiers-in-setclass.ts`, `package.json`, `README.md`
