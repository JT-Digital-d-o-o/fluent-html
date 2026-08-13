# Changelog

All notable changes to Fluent HTML will be documented in this file.

## [7.2.0] - Token-only colors behind an opt-out seam; phantom htmx attrs deleted

The compile-time arm of the guideline-enforcement scope: the two prose rules with the worst audit numbers (554 palette literals; anything built on `preload`) become type errors.

### ✨ Added — `FluentColorConfig` (T2)

- New augmentation seam next to the `FluentCustom*` family. An app that declares
  `interface FluentColorConfig { defaultPalette: false }` collapses the built-in
  `${color}-${shade}` palette arm to `never`: every palette literal (`bg("gray-100")`,
  `hover({ bg: "slate-200" })`, `"red-500/20"`) is a compile error, while theme tokens,
  the functional keywords (`inherit`/`current`/`transparent`/`black`/`white`), token
  opacity tints, and `[...]` arbitrary values keep working. Backward compatible: without
  the augmentation nothing changes.
- Compile-proof both ways: the default-on arm asserts in `test/types/type-surface.test-d.ts`;
  the opt-out arm compiles as its own unit (`test/types/color-optout`, module augmentation
  is global) wired into `npm test`.

### 💥 Removed — phantom `preload` / `optimistic` (T3)

- The `HTMX` options `preload` and `optimistic` and their `hx-preload` / `hx-optimistic`
  emit branches are gone. Neither attribute exists in the htmx 4.0.0-beta4 runtime, so
  anything built on them silently did nothing — now it's a compile error instead.

## [7.1.0] - Sitemap stances on route defs + exported registry types

Groundwork for exhaustive typed controllers (`defineController` in the template layer): the route registry stays a dependency-free contract leaf, but now carries everything a server-side binder needs — a declared sitemap stance and the param/query type maps at runtime.

### ✨ Added — `sitemap` stance on `RouteDef`

- `sitemap?: true | "exclude" | "dynamic"` on route definitions, surfaced on the callable (`routes.home.sitemap`). Pure data; server-side helpers perform the actual registration.
- Enforced at compile time **and** definition time: only GET routes may carry a stance; `true` requires a paramless path; `"dynamic"` requires params. Prefixed registries validate against the joined path.

### ✨ Added — def maps carried to runtime

- Callables now expose the declared `params` / `query` maps (`routes.detail.params` → `{ id: "number" }`), read-only, so server-side helpers can emit coercing validation schemas from the declaration instead of re-typing it.

### ✨ Added — exported registry types

- `RouteRegistry`, `RouteCallable`, `RouteDefinitions`, `AnyRouteCallable`, `AnyRouteRegistry`, `SitemapStance`, `ExtractParams`, `HasAnyParams`, `ResolveParam`, `ResolveParamTypes`, `ResolveAllParamTypes`, `ResolveQuery` are now exported from the barrel — consumers generic over registries no longer need structural stand-ins or duplicated path conditionals (which silently drift).

## [7.0.1] - Dev-mode structural guards for the mutable builder

`Tag` is a mutable builder: every fluent method writes to the instance and returns it. That is what keeps the chain allocation-free, but it leaves two shapes that are wrong and **silent** — no type error, no runtime error, just drifting markup:

```typescript
const SHARED = Div("x").p("4");        // module scope, reused per request
render(SHARED.bg("red-500"))           // <div class="p-4 bg-red-500">
render(SHARED.bg("blue-500"))          // <div class="p-4 bg-red-500 bg-blue-500">  ← accumulates

const child = Span("hi");
const a = Div(child), b = Div(child);  // one instance, two parents
child.text("lg");                      // silently changes both
```

Both now throw in development, at the point of mutation, with the element and method named. Presets are functions for exactly this reason (`.apply(card)`, never a shared `const card = Div()`); the guards enforce what the docs already teach.

### ✨ Added — mutate-after-render + aliased-child detection

- Two dev-only fields on `Tag`: `_e` (the render epoch it was last serialized in) and `_p` (how many parents took it as a child). The emitter stamps `_e` during the walk it already does; the constructor and `addChild` count `_p`, walking nested arrays so `ForEach` output is covered.
- The gate lives on the 13 `Tag` primitives every styling and generic-attribute method funnels through (`addClass`, `addAttribute`, `setStyle`, `toggle`, `addChild`, …), so all 268 styling methods and every `set*` attribute setter that routes through `addAttribute` are covered by construction.
- **Legal patterns stay legal:** re-rendering an unmutated tree (a cached fragment), a shared-but-never-mutated child (the documented non-thunk `Intersperse` separator form), and a fresh tag per render.

### ✨ Added — `setDevChecks(boolean)`

On by default outside `NODE_ENV=production`. Turn it off if you deliberately build, render, then mutate and re-render one tree.

### 📊 Cost

Production (`NODE_ENV=production`) is unchanged: 17.2K vs 17.4K ops/sec median on "Build+render realistic (per req)", inside the harness's run-to-run spread. With guards on, that path costs ~12% — a development-only price for turning two silent bugs loud.

### ⚠️ Known boundary

Element subclasses write their own storage fields directly (`InputTag.type`, `ImgTag.src`, …), so **element-specific setters are not gated** — instrumenting ~200 of them is out of scope for a patch. `test/dev-checks.test.ts` pins this as a known gap rather than an assumed catch. The generic attribute path on the same tag (`.setTitle()`, `.setRole()`, `.setAria()`) *is* gated.

### 🔧 Fixed — test script drift

`form-for.test.js` and `define-theme.test.js` ran under `npm test` but were missing from `npm run test:coverage`, which is the command CI runs — so `defineTheme`, a headline v6 feature, had no coverage gate. Both lists are now identical (33 entries).

### 📝 Not in this release

The second silent failure, a losing override (`.apply(preset).p("8")` emits `p-6 p-8`, and which wins is decided by stylesheet order rather than call order), is **not** addressed here. The correct fix is keyed emission with last-write-wins, which changes rendered output and so is not patch material; a dev-mode duplicate-prefix throw was designed and rejected because it would outlaw the `.apply(preset)` + override idiom the library teaches. Needs a decision against the "no runtime class merger" no-go before it can be scheduled.

## [Unreleased — 7.0.0] - Canonical names: method name = Tailwind class prefix

Library stage of `llm-styling/canonical-names` — the styling surface is renamed to the model author's Tailwind prior. **Breaking, no aliases, no shims** (greenfield-major); ships together with `object-variants` in one release. Measured on the demos corpus: 0.80× styling tokens, 0.76× with the directional shorthands.

### 💥 Breaking — 21 renames

`padding→p`, `margin→m`, `background→bg`, `zIndex→z`, `objectFit→object`, `justifyContent→justify`, `alignItems→items`, `alignSelf→self`, `gridAutoFlow→gridFlow`, `gridAutoRows→autoRows`, `gridAutoCols→autoCols`, `fillColor→fill`, `accentColor→accent`, `caretColor→caret`, `backfaceVisibility→backface`, `transformStyle→transform`, `scrollBehavior→scroll`, `scrollMargin→scrollM`, `scrollPadding→scrollP`, `gradientRadial→bgRadial`, `gradientConic→bgConic`.

### 💥 Breaking — 17 merges (40 methods → 17)

One method per Tailwind class prefix; the argument's (statically disjoint) union discriminates, exactly like Tailwind itself:

- **`.text()`** ← textSize + textColor + textAlign + textWrap (`.text("lg")`, `.text("red-500")`, `.text("center")`, `.text("balance")`, `.text("px", 13)`)
- **`.font()`** ← fontWeight + fontFamily; **`.border()`** ← border + borderColor + borderStyle (side forms take width or color; style is all-sides); **`.ring()`** ← ring + ringColor; **`.shadow()`** ← shadow + shadowColor; **`.stroke()`** ← strokeColor + strokeWidth; **`.decoration()`** ← decorationColor + decorationStyle + decorationThickness; **`.textShadow()`/`.dropShadow()`/`.insetShadow()`** ← + their `*Color` twins; **`.insetRing()`** ← + insetRingColor; **`.flex()`** ← flex + flexDirection + flexWrap; **`.transition()`** ← + transitionBehavior; **`.list()`** ← listStyleType + listStylePosition; **`.outline()`** ← + outlineHidden (`.outline("hidden")` is the a11y-safe value); **`.mask()`** ← maskImage + maskComposite; **`.bgLinear()`** ← gradientLinear + gradientTo (direction keyword or angle, optional interpolation).
- Vocab rows carry the merged families as a new `values: { kind: "group", groups }` spec — the types emitter (`@@UNION Name method.group@@` addresses), validity oracle, and ESLint derivation all read per-family lists, so nothing left the anti-drift machinery.

### ✨ Added — 12 directional shorthands

`px/py/pt/pb/pl/pr/mx/my/mt/mb/ml/mr` — the Tailwind spelling models emit first (`.px("4")`, `.mx("auto")`, `.pt("px", 12)`). `.p("x", "4")` remains as the parametric form.

### 💥 Breaking — deletions & tightenings

- Deleted `bold()` (→ `.font("bold")`), `flexShorthand()` (→ `.flex("2")`-style values stay on `.flex()`), `outlineHidden()` (→ `.outline("hidden")`).
- **`TailwindRingWidth` closed** — the open `` `${number}` `` arm is gone (`.ring("500")` was a nonsense class and would blur width-vs-color discrimination); widths are `0|1|2|3|4|8` or `[…]`.
- Internal storage fields renamed to stop shadowing new Tag methods (attributes and `set*` setters unchanged): `InputTag.list → listId`, `SvgTag`/`SvgShapeTag` `fill/stroke/transform → fillValue/strokeValue/transformValue`.

### ✨ Added — guardrails

- **`defineTheme` ambiguity warning** — a token name landing in two families that share a merged prefix (`colors`×`fontSize` → `text-*`, `colors`×`shadow` → `shadow-*`, weight-named `fonts` tokens → `font-*`) now warns at definition time with a rename suggestion.
- JSDoc cross-references on `.fill()`/`.stroke()`/`.transform()` (class utilities) vs `setFill`/`setStroke`/`setTransform` (SVG presentation attributes).

Pairs with **eslint-plugin-fluent-html 4.0.0** (derived tables re-derive from the canonical vocab; autofixes now emit `.bg()`/`.p()`/`.mt()`/… and the directional shorthands own their prefixes).

### ✨ Added — migration codemod

- **`npm run codemod:canonical -- <tsconfig> [--dry]`** (`scripts/codemod/canonical-names.ts`, ts-morph) — mechanically migrates a consumer repo: the 21 renames + 29 merge-source renames (call-site-pure; argument shapes carry over), plus the non-pure rewrites `.outlineHidden()` → `.outline("hidden")`, `.bold()` → `.font("bold")`, and the legacy pre-6.x keyword-dispatch methods `.display(X)` / `.position(X)` → `.X()` (unknown keyword values are skipped and reported). A call site is rewritten only if its receiver **types as `Tag`** — bare name matches (formFor's `select`, Prisma's `count`, another lib's `.padding()`) are never touched; the check passes transitively through chains whose links are error-poisoned because the target repo already links the renamed library. Unverifiable matches are left in place and reported for manual review.

### 📝 Docs

- README, FLUENT-STYLING.md, TAILWIND-SETUP.md, examples/, the guidelines surface, and the tooling READMEs (extractor, eslint plugin) teach only the canonical names (directional shorthands as the preferred spelling). FLUENT-STYLING states the prefix rule up front and documents the residual divergences ("Where names diverge from raw Tailwind": compound-prefix boundary, `.neg()`, translate axis form, `containerQuery`/`gradient`/`snap`).
- Examples now typecheck under strict; fixed two latent example bugs (a dynamic-interpolation badge helper → `whenMatch` with literal branches, and a flow-narrowed `null` in the `IfThen` narrowing demo).

### 💥 Breaking — object variants replace `.on()`/`.at()` (`llm-styling/object-variants`)

Variants are typed style objects, not lambdas. `.on("hover", t => t.bg("blue-600"))` → **`.hover({ bg: "blue-600" })`**; `.at("md", …)` → **`.md({ px: "8" })`**. Object keys ARE the canonical method names (why the two scopes ship together); TypeScript spell-checks keys and values two levels deep, `false`/`undefined` values are skipped (conditionals become plain expressions), and a misplaced callback can no longer style the wrong tag or silently emit an unprefixed class. Measured: −28.5% characters at variant sites.

- **Tier-1 methods (21):** `hover focus focusVisible focusWithin active disabled checked dark first last odd even groupHover peerChecked before after sm md lg xl xl2` — `xl2` emits `2xl:` (`2xl` is not an identifier; decision recorded 2026-08-01).
- **`.variant(name, styles)`** — the generic long tail: `data-[…]`/`aria-[…]`/`has-[…]`/`group-*`/`peer-*`/`not-*`, container queries (`@sm`, `@max-lg`), arbitrary `[&>li]` selectors, and the exact `"2xl"` spelling. `TailwindState`/`TailwindBreakpoint` unchanged.
- **Nesting stacks prefixes:** `.md({ hover: { bg: "blue-700" } })` → `md:hover:bg-blue-700` (any depth).
- **Flattened positional keys:** `translateX/translateY/translateZ`, `gapX/gapY`, `overflowX/overflowY`, `overscrollX/overscrollY`, `scrollMx…scrollMr`, `scrollPx…scrollPr` (directional spacing keys were already methods). Multi-arg utilities take readonly tuples: `border: ["top", "red-500"]`, `gradient: ["red-500", "blue-500", "to-br"]`, `cssProp: ["--glow", "0 0 4px"]`. No-arg utilities are boolean flags (`truncate: true`, `content: true`); optional-value utilities accept `true` (`ring: true`).
- **One key per prefix per object** — a second value family for the same prefix (ring width + ring color) chains a second variant call: `.focus({ ring: 2 }).focus({ ring: "blue-300" })`.
- **Generated, not hand-written:** `StyleProps` (`variant-object.gen.ts`, 209 keys) is emitted from the shared key derivation in `class-vocab/variant-keys.ts` + per-row `variantObject` specs; the runtime key→emit map derives from the same specs, and a 209-key parity suite renders every key against the vocab emitters. Extracted style consts should pin with `satisfies VariantStyleObject` (excess-property checking doesn't reach through variables).
- **Removed:** `.on()`, `.at()`, and the lambda `withVariant` helper. No aliases. There is deliberately no object hatch for `.cssClass()` under a variant — non-Tailwind classes have no variant story.

### ✨ Added — evidence-based vocab promotions (2026-08-03)

A usage sweep of 8 production fluent-html apps found only ~10 of the 231 backlogged Tailwind roots in real use; the three families carrying ~⅔ of all occurrences are promoted to typed methods (the rest stay backlogged — zero measured demand):

- **`.table()` / `.tableCell()` / `.tableRow()`** — table display keywords (`table-cell` was the most common escape-hatch leak: responsive column show/hide, `Th().hidden().sm({ tableCell: true })`); `.table("auto" | "fixed")` covers the table-layout algorithm on the same prefix.
- **`.divide(color)`** — color of the between-children borders; completes `.divideX()`/`.divideY()` (every observed use chained `.addClass("divide-…")` onto them).
- **`.invisible()`** — `visibility: hidden` (keeps layout space, unlike `.hidden()`); `visible`/`collapse` stay backlogged.

All three derive the full artifact set (generated unions, `StyleProps` keys, extractor/ESLint tables) from their vocab rows; the coverage-watch ignore entries are retired, and the codemod's legacy `display()` dispatch learned the table keywords.

### 🐛 Fixed

- **`.cssProp()` no longer corrupts values containing literal underscores** (post-release review of the 6.8.0 escape hatch). Tailwind decodes every unescaped `_` in an arbitrary property back to a space, so `.cssProp("view-transition-name", "card_1")` emitted CSS `view-transition-name: card 1` — invalid and silently dropped. Values now escape literal `_` as `\_`, substitute each whitespace char individually (quoted-string spacing round-trips exactly), and leave `url(…)` segments untouched (Tailwind preserves their underscores; substituting corrupted URLs). One shared `cssPropValue` encoder feeds both the runtime emitter and the vocab row, oracle-verified against the pinned Tailwind.
- **Codemod robustness** (post-release review): an empty-lambda drop now scans back to the previous token, so `?.` chains and whitespace-separated dots (`x\n  .on(…)`) can't yield syntactically broken output; an empty *nested* variant lambda is dropped as a no-op instead of failing the whole conversion with a misleading reason; and stdlib `.on()`/`.at()` calls (EventEmitter, `Array.prototype.at`) on cleanly-typed receivers no longer flood the SKIP report — only `any`/error-poisoned receivers (potential broken Tag chains) are surfaced for manual review.
- **Codemod: collect-before-apply (cross-file poisoning)** — `run()` edited each file as it iterated, so against a *pre-rename* library pin an already-edited file's `.p()` stopped typechecking, components imported from it collapsed to `any`, and later files' chains were skipped with bogus "receiver does not type as Tag" reports (28 such sites in the projects-template full-stack dry run). Edits are now collected for every file before any are applied; the full-stack template migrates 1245/1245 sites with 0 skips.
- Docs: the variant-object examples in README and the generated `StyleProps` JSDoc used a nonexistent `bold:` key (the method is `.font("bold")`); examples now use `italic`.

## [6.8.0] - Escape hatch closure: vocab gap fills + font-family theme tokens

First stage of `llm-styling/escape-hatch` — the last vocab gaps are filled so no styling need forces an author off the typed surface.

### ✨ Added

- **`.appearance("none" | "auto")`** — native appearance of form controls (`appearance-*`).
- **`.wrap("break-word" | "anywhere" | "normal")`** — overflow-wrap (v4 `wrap-*`).
- **`.content(value?)`** — pseudo-element content: `.content()` bare emits `content-['']` (the empty string every `before:`/`after:` decoration needs), `.content("none")`, or an arbitrary `[…]` value. Unblocks `before:`/`after:` styling.
- **Arbitrary selector variants on `.on()`** — the `` `[&${string}]` `` arm: `.on("[&>li]", t => t.padding("2"))` → `[&>li]:p-2` (verbatim pass-through, same contract as `supports-[…]`).
- **Font-family theme tokens** — `defineTheme({ fonts: { display: "Inter, sans-serif" } })` emits `--font-*` `@theme` CSS + safelist entries (extractor ≥2.1.0), typed via the new `FluentCustomFontFamily` augmentation seam.
- **`.cssProp(property, value)`** — the typed arbitrary-CSS escape: emits Tailwind's `[prop:value]` arbitrary-property class (spaces → `_`), composes with `.on()`/`.at()` variants, and — being a vocab row — inherits extractor tracking: literal calls are safelisted, a **non-literal value is a build error** under `onUnresolved: "error"` (closes the silent-style-loss hole). `property` is the generated `CssPropertyName` union (435 kebab-case names from `CSSStyleDeclaration` + the `` `--${string}` `` custom-property arm; new gen artifact `src/core/css-props.gen.ts`).
- **`.cssClass(name)`** — the greppable intent marker for legitimately non-Tailwind classes (JS/CSS hooks, third-party widgets); appends verbatim. `addClass` is now documented `@internal` — the emitter primitive, not a styling API. Decision rule: static arbitrary CSS → `.cssProp`; non-Tailwind class → `.cssClass`; runtime-computed → `.setStyle`.

### 📝 Docs

- README/FLUENT-STYLING/examples no longer teach `setClass`/`addClass` styling; FLUENT-STYLING gained the escape-hatch decision-rule table. Pairs with eslint-plugin-fluent-html 3.0.0, whose recommended preset now blocks Tailwind-in-raw-strings at error level (`no-tailwind-in-raw-class` + `no-dynamic-class-argument` + `no-tailwind-in-cssclass`).

### 💥 Breaking (type-level)

- **`TailwindFontFamily` is CLOSED** — `"sans" | "serif" | "mono"`, declared `fonts` tokens, or `[…]`; the `(string & {})` open tail is gone, so an undeclared family is now a compile error (declare it in `defineTheme` `fonts`).
- **Internal storage fields renamed** to stop shadowing the new Tag methods: `MetaTag.content` → `contentValue`, `TextareaTag.wrap` → `wrapMode` (the `content`/`wrap` HTML attributes and the `setContent`/`setWrap` setters are unchanged).

## [6.7.0] - Vocab generator: generated type unions + values/doc-enriched rows

Emitter stage of `llm-styling/vocab-generator` — the keyword type unions are now *generated from the class-vocab*, so the vocab, the TS types, and (via the peer-dep consuming ESLint plugin) the lint tables cannot drift.

### ✨ Added

- **`UtilityDef.values` + `UtilityDef.doc`** — every vocab row now declares where its accepted values come from: `{ kind: "literals", list }` (closed keyword list), `{ kind: "theme", ns }` (`@theme` namespace linkage, e.g. `--color`), or `{ kind: "typeRef", name }` (curated union, transition state), plus a one-line doc.
- **Types emitter (`npm run gen:vocab`)** — renders `src/core/tailwind-types.gen.ts` from the vocab `literals` lists + `scripts/gen-vocab/tailwind-types.template.txt` (curated unions kept verbatim). `--check` mode regenerates in memory and fails if the committed file is stale; CI runs it after every build. Introduction gate honored: the first generated output was member-for-member asserted against the previous hand-written `tailwind-types.ts`.
- **`tailwind-types.seams.ts`** — the `FluentCustom*` augmentation interfaces + `ThemeKeys` moved to a hand-written seams file `defineTheme()` targets; regeneration can never touch them. `tailwind-types.ts` is now a barrel re-exporting seams + generated files, so the public surface is unchanged.
- **Validity oracle over generated unions** — every `values.literals` member × its row's emit shape compiles through the pinned Tailwind design system (`vocab-validity.test.ts`), so a typed-but-dead union member can no longer ship. `gen-types.test.ts` pins regen self-consistency, template↔vocab integrity, and shared-union follower lists (`blur`/`backdropBlur`, `gridAutoRows`/`gridAutoCols`, `breakBefore`/`breakAfter`).

## [6.6.0] - Vocab generator: pinned Tailwind validity oracle + coverage watch

First stage of `llm-styling/vocab-generator` (validation only — no API change). Exact-pinned `tailwindcss@4.3.3` devDependency + hardened `__unstable__loadDesignSystem` loader (`scripts/gen-vocab/load-design-system.ts`); `vocab-validity.test.ts` compiles every vocab emission through `candidatesToCss` (caught the `gradientConic` sample emitting `bg-conic-undefined/longer`); `vocab-coverage.test.ts` diffs `design.utilities.keys()` against vocab coverage + an ignore-list-with-reasons (231 uncovered roots filed in the scope backlog).

## [6.5.0] - Tag.whenMatch + defineRoutes ergonomics (default method, typed query params)

### ✨ Added

- **`Tag.whenMatch(value, cases, defaultFn?)`** — the chain-level mirror of `Match`, completing the conditional family (`IfThen → when`, `IfThenElse → whenElse`, `Match → whenMatch`). Runs one modifier per variant of a string/number discriminant. The two-argument form is exhaustive (missing case = compile error; widened `string`/`number` is rejected, same guard as `MatchValue`); pass a `defaultFn` to match a subset. Replaces chained `.when(x === "a", …).when(x === "b", …)`, which is non-exhaustive and re-tests the discriminant per branch. Scalar discriminants only — the discriminated-union keyed form (`whenMatch(state, "status", {…})`) is deliberately deferred.
- **`defineRoutes` — `method` defaults to `"get"`** — omit `method` on GET routes (`{ path: "/x" }`) and spell it out only when it isn't a GET. Kills the `method: "get"` repetition — an all-GET sitemap/marketing route file collapses to `{ path }` one-liners — without grouping by method or fragmenting a route's identity. Purely additive: explicit methods and the `.method` property are unchanged, and a stray/misspelled key is still an excess-property compile error.
- **`defineRoutes` — typed query params** — declare a `query` map on a route (same `ParamType` vocabulary as path params: `"string"` | `"number"` | a `readonly` enum tuple) and the query string is typed at the call site and in `.resolve()`. Each declared key is **optional**; wrong value types and undeclared keys are compile errors (`sort: "up"` / `page: "2"` / `limit: 10` all rejected against `{ page: "number", sort: ["asc","desc"] }`). A route with no `query` map keeps the loose `QueryParams` bag, so routes you don't annotate are byte-for-byte unchanged. Type-level only — runtime `buildQueryString` is untouched.

## [6.4.0] - Behavior System v4: strict-CSP data-attribute emission + versioned runtime asset

The once-and-for-all behavior redesign (W1–W4/W7 of the locked design in [`project/research/behavior-v4/`](project/research/behavior-v4/design.md), 12 ADRs). `.behavior()` no longer emits inline `hx-on:*` JS — it emits flat, greppable `data-behavior-*` attributes executed by one versioned, immutable, capture-phase-delegated runtime asset. Works under real strict CSP (per-request nonce + `strict-dynamic`, no `unsafe-eval`); survives any number of htmx swaps/morphs by construction. Greenfield v6 posture: no v5 compat.

### 💥 Breaking

- **Emission format**: `.behavior()` emits `data-behavior="<verbs>"` + `data-behavior-<verb>-<option>` attributes (ADR-01) instead of `hx-on:*` inline JS. Pages must load the runtime asset via one nonce'd `<script defer src>` in the layout head (`behaviorRuntimeSource()` from `fluent-html/behaviors` — framework/template wiring).
- **`.hxOn()` is deleted** — no inline-JS hatch exists. `HxOnEvent` type removed.
- **Vocabulary is now exactly 10 verbs** (ADR-09). Deleted with successors: `disable` → htmx-native `disable:` route option; `openDialog`/`closeDialog` → `setCommand`/`setCommandfor` + `setClosedby` (the v6.0.1 parked deprecation executes); `formResetOnSwap` → `resetOnSuccess` (no longer wipes typed values on 422); `dismissOnEscape` → `onEscape` (document-scope option fixes the focus-scope bug); `scrollTo` → htmx swap `scroll:top`; `selectAll` → deleted (zero call sites).
- **Render-time throws in ALL modes** (including production): unknown verb, duplicate same-verb on one element, unknown option, option-type mismatch, raw string where an `Id` is required. Silent no-ops are structurally impossible.
- **`event?` overrides** come from the closed `EVENT_TABLE` union and resolve at emit time (`focus`→`focusin`, `mouseenter`→`mouseover`, …); `keyup` is dropped (ADR-10).
- `createId`/`defineIds` reject `"@self"` (reserved by the behavior target grammar) and behavior emission rejects ids containing whitespace.
- Class-name options (`toggleClass.class`, `drawer.class`/`bodyClass`, `clipboard.feedback.class`, `remove.animateOut`) validate as a single CSS class token at emit — a whitespace-containing value used to render fine and then throw in `classList` on every activation (the v2-style runtime-dead failure class).

### ✨ Added

- **New verbs**: `drawer` (the composite non-modal overlay: open class + backdrop + body scroll-lock + `aria-expanded` + focus-first + focus trap + `closeOn: escape|backdrop|nav`, at-most-one-open, DOM-predicate state, morph reconciliation sweep — ADR-05); `onEscape`, `onClickOutside`, `resetOnSuccess` (status-gated `form.reset()`, roadmap #52).
- **Widened verbs**: `toggle` gains `Id[]` multi-target + `display?` (roadmap #53) + `force?`; `toggleClass` gains `Id[]` + missing-class guard; `remove` gains `"@self"`/`{ closest }` relative targets, `animateOutTimeoutMs` fallback (cannot hang); `clipboard` gains origin-resolved `path` + transient `feedback` (text/class modes, token + compare-guarded — double-click-safe, never clobbers a fresh morph render, degrades with one `console.warn` when `navigator.clipboard` is absent).
- **Runtime asset**: `dist/fluent-behaviors.<version>.js` built at publish (minified IIFE, banner-stamped, CI size gate). Capture-phase document delegation from the single-source `EVENT_TABLE`; innermost-first consumption walk (ADR-04 — all verbs on a carrier run in declaration order, consumption halts outer carriers); the only htmx coupling is the two-literal `HTMX_EVENTS` const, read defensively; fully inert without htmx (templates/web profile).
- **Skew handling (ADR-11)**: unknown verbs skip with exactly one `console.warn` + a `data-behavior-unknown` mark; the runtime asserts the `<html data-fluent-behaviors="<version>:<registryHash>">` stamp (mismatch = one loud `console.error`); `behaviorStamp()`/`readAssetStamp()`/`assertBehaviorRuntimeAsset()` make hash skew a deploy-time error.
- **`fluent-html/behaviors` subpath** (framework-layer surface, ADR-07): `registerBehavior` (data-only specs, mandatory fixtures, `jt:` namespace + collision + seal enforcement), `buildBehaviorRuntime` (esbuild wrapper — optional peer — compiles framework `defineBehavior` entries + core into one registry-hashed immutable asset), `behaviorRuntimeSource`, `allBehaviors` (feeds the acceptance `matrix()`), `BUILTIN_FIXTURES`.
- **`fluent-html/behavior-runtime` subpath**: `defineBehavior` + the mediated `FxCtx` (resolve/transient/after/status — no store, no fetch, no observers, ADR-08) for framework-pack client entries. Apps never register (ADR-07 amendment).
- **Acceptance harness** (`npm run test:acceptance`, ADR-12): in-package Playwright suite — minimal Fastify app, real strict CSP, pinned htmx 4.0.0-beta5, production-built minified asset — mechanically enumerating every verb × fixture × {initial, outerHTML swap, outerMorph} plus the 30 hand-written matrix rows (skew, drawer suite, clipboard re-entrancy, reset semantics, Escape precedence, CSP hygiene, native-dialog tier). 68 rows green on Chromium; `ACCEPT_ENGINES=all` adds WebKit/Firefox.

### 📦 Size budget (ADR-12 note)

The built-ins asset measures **5.95KB min / 2.66KB gz** — the full contract (drawer a11y, gated nav-close, skew degrade, once-token resets) exceeds ADR-12's 5KB/2.2KB estimate. The CI gate is set to the honest ceiling (6KB/2.75KB); flagged in `project/pm/decisions.md` as an ADR-12 amendment. The asset is immutable-cached, so the cost is paid once per version.

## [6.3.0] - Packaging integrity, URL sanitization & type-safety

Hardening release: packaging, security, control-flow/HTMX/routing correctness, and type-surface honesty, plus ~2× render throughput on HTMX pages. No public API changes except the type-level breaks below — each rejects code that already misbehaved at runtime. Per-item rationale and evidence: [`project/research/v6.3.0/`](project/research/v6.3.0/).

### 💥 Breaking (type-level only)

- `IfThen`/`IfThenElse`/`.when()`/`.whenElse()` reject a `boolean | null` value on the nullable overload — use an explicit comparison (`x === true`). Plain booleans and non-boolean nullables are unchanged.
- `Match` / `MatchValue` no-default (exhaustive) form rejects a widened `string`/`number` — use the partial-with-default form.
- `Tag.attributes` is now `Readonly` — use `addAttribute()`/`setDataAttrs()`/`setAria()` (a direct write threw at runtime anyway).
- Dot-suffixed route params key on the identifier: `/export/:id.csv` → param `"id"` (was `"id.csv"`).
- `uuid` param type removed — it was a pure alias of `string` (no compile-time or runtime check), so it implied a guarantee it didn't provide. Use `"string"`.

### 🎯 Type-safety

- Removed the naked `(string & {})` typo-hole from the numeric unions (`gridCols`/`gridRows`, `colSpan`, `duration`, `ringWidth`, `scale`, `lineClamp`, `delay`) — now `` `${number}` | `[${string}]` ``, so a typo errors again. Compile-time only; valid values and emitted classes unchanged.
- `isId` verifies a real runtime brand (`Symbol.for`) — a structural `{ id, selector }` object can no longer spoof an `Id`.
- `HxSwap` accepts `${number}ms`/`${number}s` delays + `ignoreTitle:true`, still closed (typos error); JSDoc corrected to match.
- Route prefix params are declarable and typed (`params` validated against the joined path).
- Anti-drift harness (`test/routes-ids-parity.test.ts`) pins `defineRoutes`/`defineIds` type-extraction ≡ runtime — drift now fails the build/tests.

### 🔒 Security

- URL setters (`setHref`/`setSrc`/`setAction`/`setFormaction`/`setData`/`setPoster`/`setCite`) scheme-sanitize their value: `javascript:`/`vbscript:` and scriptable `data:` (incl. obfuscated forms) → `about:blank`; safe URLs pass through byte-identically. `sanitizeUrl` is exported; the untyped `addAttribute` is the explicit opt-out. The README's "XSS prevented" claim is scoped to what it guarantees.

### ⚡ Performance (~2× on HTMX pages, byte-identical output)

- `escapeHtml` regex pre-test skips the per-char scan on clean strings (~3.9× variant-heavy; +20–45% elsewhere).
- `buildHtmx` unrolled from its config-table loop (+55% HTMX bench).
- Bench harness reports the median of several samples after a time-budget warm-up (run-to-run noise 57% → ~2%).

### 🐛 Fixed

- **Packaging** — `sideEffects: false` erased the fluent API in bundled builds (now an array); the `./elements`/`./core`/`./control` subpaths register their mixins (via `core/register.js`; `overlay()` moved to core); sourcemaps + `src` are shipped so map references resolve.
- **Control flow** — `Match` no longer resolves handlers via the prototype chain (`toString`/`constructor`/`__proto__`); `ForEach` clamps negative/fractional/NaN/∞ counts instead of throwing; DU `Match` key constrained to `string`.
- **HTMX** — `formResetOnSwap` uses `htmx:after:swap` (was the never-fired `htmx:after-swap`); `Partial()` passes non-id selectors verbatim (was `.items` → `#.items`); `optimistic`/`preload`/`swapOob: false` no longer emit the enabling attribute; `hxResponse` header JSON is `\uXXXX`-escaped (non-Latin1 no longer crashes `setHeader`).
- **Routes/ids** — `resolve()` no longer crashes on a `:param` value starting with `*`; a mid-path wildcard now throws at `defineRoutes` time (only a trailing splat is supported); a non-finite/exponential `number` param value throws at resolve time instead of emitting `/users/NaN`; `defineIds` camelization matches the type (`col-2` → `col2`) and throws on colliding keys.
- **Tailwind** — `gradientRadial(origin, interpolation)` folds into a valid arbitrary value (was zero CSS); removed the non-existent `only-child` variant (use `only`).
- **Elements** — `.toggle(name, false)` removes (was add-only); `setWidth`/`setHeight` accept `string | number` across all media/embedded classes; `setRel` is variadic on `A`/`Area`/`Link`; `Area.setDownload` accepts the boolean form.

### ✨ Added

- **`Form<T>` gains `f.label()` + default control ids** — the typed binding now sets `id={name}` on every bound control (radios get `${name}-${value}`), and a new `f.label(name, …children)` binds `<label for>` to it. This kills the id/name/for triple-repetition the library's own examples exhibited, and makes accessible labels the path of least resistance. An optional `idPrefix` on the form state namespaces every id (`${idPrefix}-${name}`) for the rare two-forms-share-a-field-name collision. Note: bound controls now render an `id` attribute by default (additive; the error `aria-describedby` id is unchanged when no prefix is set).
- `./package.json` export (tooling can read the manifest); packaging + type-safety regression tests.

## [6.2.0] - Tailwind v4 Method Surface + HTML Element Completeness

Two tracks. **Track C** — 63 new fluent Tailwind methods (plus pure type-union additions on `.on()`/`.at()`) that previously forced a raw `.setClass(...)` escape hatch — covering SVG paint, text effects, shadows/filters/blending, v4 gradients, 3D transforms, attribute/structural variants, layout, and v4.1 masks. Every method is in the shared class vocabulary, so the extractor (safelist) and ESLint plugin (`134 → 197` methods) pick them up in lockstep. **Track B** — HTML-element attribute completeness closing `addAttribute` escape hatches: text-level edit/quotation (`Ins`/`Del`/`Q`/`Blockquote` `cite`/`datetime`), media & resource hints (`crossorigin`/`referrerpolicy`/`<source>` sizing/responsive preload/`theme-color` media), iframe security (typed `sandbox` tokens + `allow` record), and accessible tables (Id-typed `headers`, `abbr`, `TableCellScope`). Additive apart from the intentional type-narrowing breaks listed below; benign, well-typed inputs render unchanged.

### 💥 Breaking

- **`TailwindGradientDirection` is closed** — the `(string & {})` escape is removed, so `gradientTo`/`gradient` no longer accept an arbitrary/angle string (`gradientTo("45")` is a compile error). Use the new `gradientLinear(angle)`; only the 8 `to-*` keywords are valid as a direction.
- **`.at()` container-query breakpoints narrow to a closed scale** — `TailwindContainerBreakpoint` goes from the fully-open `` `@${string}` `` to the `@3xs`…`@7xl` scale (+ `@max-*` and the `@[…]`/`@min-[…]`/`@max-[…]` arbitrary arms). Every real container breakpoint still compiles; the only inputs that now error are out-of-scale tokens / typos (`.at("@8xl")`, `.at("@mdd")`) — which Tailwind never generated a class for, so no working CSS changes (same flavor as 6.1.1's sizing-union closure). The `nth-[…]` arm is also folded into the structural `nth-*` family, but that is value-compatible (every `nth-[…]` literal still type-checks).
- **`IframeTag.setSandbox` is now variadic closed tokens (RFC-B-03)** — `setSandbox(...tokens: SandboxToken[])` replaces the bare-string setter. A space-joined string no longer type-checks: `setSandbox("allow-scripts allow-same-origin")` → `setSandbox("allow-scripts", "allow-same-origin")`; `setSandbox()` → `sandbox=""` (fully locked). A misspelled token is now a compile error instead of a silently-weakened policy.
- **`IframeTag.setAllow` is now record-only (RFC-B-03)** — `setAllow(policy?: Partial<Record<PermissionsPolicyDirective, string>>)`; the raw-string arm is removed (a record value is a freeform string and subsumes any raw allowlist, including multiple origins). `setAllow("accelerometer; autoplay")` → `setAllow({ accelerometer: "", autoplay: "" })`; `setAllow({ camera: "'self'" })` → `allow="camera 'self'"`; `setAllow({})` → `allow=""` (deny all); `setAllow()` clears the attribute. Directive *names* are an open union (`PermissionsPolicyDirective`) — name typos still compile (autocomplete-assisted only), unlike the fully-closed `SandboxToken`.

### ✨ Added

- **SVG paint & color family** — `fillColor` / `strokeColor` (`fill-*` / `stroke-*`; named off `fill`/`stroke` to avoid the `SvgTag`/`SvgShapeTag` field collision — use `setFill`/`setStroke` for the literal SVG attribute), `strokeWidth`, `accentColor`, `caretColor`, `decorationColor` / `decorationStyle` / `decorationThickness`, and `scheme` (`color-scheme`).

  ```typescript
  Svg(Path().setD(icon)).fillColor("current").strokeColor("red-500").strokeWidth(2);
  A("Docs").underline().decorationColor("blue-500").decorationStyle("wavy").decorationThickness("2");
  ```

- **Axis & logical inset shorthands** — `insetX` / `insetY` (+ RTL-correct `insetS` / `insetE`), each with the `(unit, amount)` overload. (`size()` — the `size-*` w+h shorthand — is **deferred**: it collides with the `<select size>` instance field, the same class of break C-01 hit.)

- **Typography & text effects** — `textWrap` (`text-balance`/`text-pretty`, distinct from `whitespace`), `hyphens`, and `textShadow` / `textShadowColor` (Tailwind v4.1; value required, with the `text-shadow-lg/30` size-opacity form).

- **Shadows, filters & blending** — `dropShadow` / `dropShadowColor`, `insetShadow` / `insetShadowColor`, `insetRing` / `insetRingColor`, `mixBlend`, `bgBlend`, and `isolate` / `isolation`. (`dropShadow`/`insetShadow` require a value — v4 ships no bare `drop-shadow`/`inset-shadow`.)

- **Transitions** — `delay` (companion to `duration`) and `transitionBehavior` (`transition-discrete`, which makes `display`/popover/dialog animate — emit it alongside `transition`).

- **Tailwind v4 gradients** — optional stop positions on `from`/`via`/`to` (`from("indigo-500", "10%")`), `gradientLinear(angle)` as the sole linear-angle path, angle + origin on `gradientConic`/`gradientRadial`, and an optional color-interpolation modifier (`gradientTo("to-r", "oklch")` → `bg-linear-to-r/oklch`) on all four gradient emitters.

- **3D transforms** — `perspective` / `perspectiveOrigin` (the depth gates), per-axis `rotateX`/`rotateY`/`rotateZ` and `scaleX`/`scaleY`/`scaleZ` + `scale3d`, `transformStyle` / `backfaceVisibility`, and a `translate("z", …)` overload. Negatives relocate the leading `-` (`rotateX(-45)` → `-rotate-x-45`).

- **Variants & selectors on `.on()`/`.at()`** (pure type additions — the runtime already passed the prefix through) — named + unnamed `group-*`/`peer-*` states, the nine first-class `aria-*` boolean heads + `aria-[…]`/`group-aria-`/`peer-aria-`, `data-[…]`/`group-data-[…]`/`peer-data-[…]`, extra pseudo-classes (`read-only`, `target`, `autofill`, `user-valid`, `rtl`/`ltr`, …), the structural `nth-*` family, child/descendant `*`/`**`, and the closed `@3xs`…`@7xl` container scale.

  ```typescript
  Form<T>(...).on("aria-invalid", t => t.borderColor("red-500"));  // Form<T> already emits aria-invalid
  Ul(ForEach(rows, r => Li(r))).on("*", t => t.padding("y", "2"));
  ```

- **Layout** — grid-line placement `colStart` / `colEnd` / `rowStart` / `rowEnd` (negative lines → `-col-start-1`) and `rowSpan`; multi-column `columns` with `breakBefore` / `breakAfter` / `breakInside` / `boxDecoration`; scroll `snap` (+ strictness) / `snapAlign` / `snapStop` / `scrollBehavior` / `scrollMargin` / `scrollPadding`; and `fieldSizing` (JS-free auto-grow `<textarea>`; Chromium-only, degrades gracefully).

- **Masks (Tailwind v4.1)** — `maskImage` (`mask-none` / arbitrary), `maskFrom` / `maskTo` directional edge fades (the hero/scroll-edge fade), `maskComposite`, and `maskType` (SVG `<mask>`). The gradient-type roots (`mask-linear/radial/conic`) stay cut — they need their own from/to stops to mask anything.

  ```typescrip t
  Div().background("[url(/hero.jpg)]").maskFrom("b", "50%").maskTo("b", "90%");
  ```

- **HTML elements — form-control completeness (RFC-B-05)** — `setAccept` gains a `readonly string[]` overload (joins with `,`; ergonomics + autocomplete, **not** typo-checking — `accept` is open by spec); `setDirname` on Input/Textarea (the bidi submit companion, `${name}.dir`); `setAutocomplete` widened to the full WHATWG detail-token set with `shipping`/`billing` prefixes + `webauthn` suffix and extended to `Select` — this is **IDE autocomplete + hover-docs DX, not typo-rejection** (the `(string & {})` tail keeps the long-tail grammar compiling, so `"cc-numbr"` still compiles); `setFormtarget`/`setFormenctype` on Button (per-submit-button form-association overrides) backed by a new **closed** `FormEnctype` union (the one genuinely typo-rejecting addition, also single-sourcing the `enctype` literal previously inlined in `FormTag`); and `OutputTag.setFor` widened to the spec'd variadic, Id-typed space-separated id-set. New exports: `AutofillField`, `AddressField`, `AddressPurpose`, `FormEnctype`. Additive — every current call renders byte-identically. (eslint `prefer-set-method` gains `dirname`/`formtarget`/`formenctype`.)

  ```typescript
  Input("file").setName("avatar").setAccept(["image/png", "image/jpeg", "image/webp"]);
  Button("Upload").setType("submit").setFormaction("/upload").setFormenctype("multipart/form-data").setFormtarget("_blank");
  ```

- **HTML elements — accessible tables (RFC-B-04)** — `headers` cell-association on `ThTag`/`TdTag` via `setHeaders(...ids)` / `addHeaders(...ids)`, **Id-typed** against the `defineIds` registry (a typo is a compile error; `set` overrides, `add` accumulates de-duped, an empty list clears the attribute rather than emitting a dead `headers=""`); `abbr` on `ThTag` (`setAbbr`, th-only — a condensed header label for assistive tech); and the existing `th` `scope` literal promoted to an exported `TableCellScope` union for typing component props. Pass the raw id token (or an `Id`), not a `#selector`.

  ```typescript
  const ids = defineIds(["price-col", "q3-row"] as const);
  Th("Price (USD)").setId(ids.priceCol).setScope("col").setAbbr("Price");
  Td("$42").setHeaders(ids.priceCol, ids.q3Row);   // <td headers="price-col q3-row">
  ```

- **HTML elements — iframe security types (RFC-B-03)** — net-new exported unions `SandboxToken` (the fixed 13-token WHATWG `sandbox` set, fully closed) and `PermissionsPolicyDirective` (the `allow` directive registry, open-tailed) backing the breaking `setSandbox`/`setAllow` signature changes above. The two `<iframe>` attributes that form the security boundary are now typed: a misspelled `sandbox` token is a compile error, and `allow` is a directive record instead of a hand-joined string.

- **HTML elements — media & resource-hint completeness (RFC-B-01)** — `setCrossOrigin` on `Video`/`Audio` (reusing the `CrossOrigin | ''` union shipped on `Img`/`Link`/`Script`); `setWidth`/`setHeight` on `Source` (`string | number` → `String`, reserves the CLS box in art-directed `<picture>`); the `setReferrerPolicy` holdouts on `Img`/`Link`/`Script`/`Area` (completing the closed-`ReferrerPolicy` set already on `A`/`Iframe`); `setImagesrcset`/`setImagesizes` on `Link` for responsive `<link rel=preload as=image>`; and `setMedia` on `Meta` for per-color-scheme `theme-color`. `<source>` deliberately gains **no** `referrerpolicy` (the spec defines none) — locked by a negative compile assertion.

  ```typescript
  Video(Track().setSrc("https://cdn/x.vtt").setKind("captions")).setCrossOrigin("anonymous");
  Link().setRel("preload").setAs("image").setImagesrcset("/hero-480.jpg 480w, /hero-1080.jpg 1080w").setImagesizes("100vw");
  ```

- **HTML elements — text-level edit & quotation (RFC-B-02)** — new `Ins` / `Del` factories (`InsTag` / `DelTag`) carrying `setCite` + `setDatetime`; these are the only text-level edit elements that previously had no factory at all. `Q` / `Blockquote` are promoted in place to `QTag` / `BlockquoteTag` with `setCite` (additive return-type widening, no source-module move — barrel names and source lines unchanged). `cite` / `datetime` flow through the existing `escapeAttr` choke point; `cite` is escaped but not scheme-sanitized, matching `setHref`/`setSrc`.

  ```typescript
  Ins("added clause").setCite("/audit/12").setDatetime("2026-06-29T10:00");
  Blockquote(P(article.excerpt)).setCite(article.url);
  ```

- **Compile-only type tests** for the new closed unions in `test/types/*.test-d.ts` — positive/negative `@ts-expect-error` assertions lock "a typo is a compile error" (including the no-collision pin `Svg(Path()).fillColor("current")`, and the negative `Q`/`Blockquote` `setDatetime` assertions for RFC-B-02).

## [6.1.1] - Composition, Typed Forms, Morph Keys & Modern-Platform Hooks

Mostly additive, plus two intentional type-narrowing breaks and a couple of behavior alignments (all listed below). Folded into 6.1.1 because v6 is greenfield with no published consumers to break. Benign, well-typed inputs render unchanged.

### 💥 Breaking

- **The six sizing unions are now closed** (`TailwindWidth`/`Height`/`MaxWidth`/`MinWidth`/`MaxHeight`/`MinHeight`) — the `(string & {})` open tail is removed, so `.w("brnad")` is a **compile error** instead of silently emitting a dead `w-brnad` class. This finishes the v6 union-closure that colors/spacing/fontSize/radius/shadow already got. Arbitrary values are unaffected — use the bracket arm (`.w("[37px]")`) or the `(unit, amount)` overload (`.w("px", 37)`); `MaxWidth`/`MinWidth`/`MinHeight` gained an explicit `` `[${string}]` `` arm.
- **Removed the deprecated `OOB` / `withOOB` helpers** — replaced by `Partial()` (htmx 4's `<hx-partial>`) since 6.0. Migrate `OOB(id, content)` → `Partial(id, content)`; `withOOB(main, ...oob)` → a plain array `[main, ...partials]`.

### ✨ Added

- **`FluentCustomMethods` augmentation seam** — an empty interface that `Tag extends`, so an app can type chainable methods it registers on `Tag.prototype` (the same C-02 pattern `FluentCustomColors` et al. use to open the token unions). Declare the signatures through the barrel and they land on every `Tag`/subclass; `this` returns keep the fluent chain typed. Needed because `Tag` is a class re-exported through the barrel, so `declare module "fluent-html" { interface Tag }` cannot merge into it directly.

  ```typescript
  declare module "fluent-html" {
    interface FluentCustomMethods { nav(route: HTMX): this }
  }
  ```

- **`Tag.addChild(...views)`** — append children during fluent composition, the structural counterpart to `apply`/`when` (which only touch classes/attrs). Normalizes the scalar/array `child` union and escapes appended children like constructor children. (The `.when()` JSDoc previously referenced a `t.children(...)` method that never existed — now it points at the real `addChild`.)

  ```typescript
  Button("Save").when(isLoading, t => t.addChild(Spinner()));
  ```

- **`Tag.addStyle(decl)`** — the accumulating `add*` counterpart to `setStyle` (which replaces): appends a `prop: value` declaration to the inline `style` attr, merging with any existing style. With it, **all four CSS-custom-ident emitters — `anchorName` / `positionAnchor` / `positionArea` / `viewTransitionName` — now emit inline style instead of a Tailwind class** (`anchor-name: --x`, `position-area: bottom span-right`, …). Tailwind v4 has no native utility for any of them and the arbitrary-property/`position-area-*` classes were pure passthroughs the safelist extractor can't resolve (a dynamic ident was even an `onUnresolved` build error), so the classes silently rendered nothing. As inline style they're extractor-opaque and just work. `positionArea` stays fully type-safe via its closed `TailwindPositionArea` union — the hyphenated tokens map to their spaced CSS values (`"bottom-span-right"` → `position-area: bottom span-right`) and the `[…]` arm is unwrapped verbatim. The four methods are not in the class vocab; method signatures are unchanged.

  ```typescript
  A("Account").setPopovertarget(ids.menu).anchorName(ids.menu);   // style="anchor-name: --menu"
  Div().setPopover().positionAnchor(rowId);                       // dynamic id — no build error
  Div().setPopover().positionAnchor(menu).positionArea("bottom-span-right");
  //   style="position-anchor: --…; position-area: bottom span-right"  — no safelist needed
  ```

- **Native dialog dismiss (completes the 6.1.0 interactivity surface)** — `DialogTag.setClosedby("any" | "closerequest" | "none")` + the exported `ClosedBy` type give native `<dialog>` light-dismiss (`"any"` = click-outside + Esc), the standards-track replacement for hand-rolled backdrop/Escape handlers. `Button().setFormmethod` now also accepts `"dialog"` (widened to the existing `FormMethod` union) — a submit button that closes its ancestor `<dialog>` with its value. Together with `setCommand("show-modal")`, a modal now opens, dismisses, and closes with zero JS.

  ```typescript
  Dialog(EditForm(), Button("Cancel").setType("submit").setFormmethod("dialog"))
    .setId(ids.modal).setClosedby("any");
  Button("Edit").setCommand("show-modal").setCommandfor(ids.modal);   // opens it
  ```

- **`f.checkbox(name, value?)` / `f.radio(name, value)`** on the `Form<T>` builder — typed `checked`-wiring for the two controls whose state binding is most error-prone. `checkbox` reflects `Boolean(state.values[name])`; `radio` is checked when `String(state.values[name])` equals its `value`. Previously `f.input("agree", "checkbox")` silently emitted `value="true"` and never `checked`.

  ```typescript
  Form<SettingsReq>({ values: user }, (f) => [f.checkbox("notify"), f.radio("plan", "pro")]);
  ```

- **`apply` / `when` / `whenElse` accept `(tag) => unknown`** modifiers (return value was always discarded). A reusable style-fn typed against the base `Tag` — `const card = (t: Tag) => …` — now composes onto element subclasses (`Button`, `Input`, `A`, `Img`, …), and void-returning modifiers are accepted.

- **`ForEachKeyed(items, keyOf, renderItem)`** — keyed iteration that stamps each row's root tag with a stable `id` from `keyOf(item)`, so HTMX/idiomorph matches rows **by key** on reorder/insert/delete (positional matching otherwise loses focus, scroll, and in-progress transitions on a morph swap). `renderItem` must return a `Tag`.

  ```typescript
  Ul(ForEachKeyed(users, (u) => u.id, (u) => Li(u.name)))   // <li id="42">…</li>
  ```

- **TW4 relational state hooks** on `.on()` — `has-[…]`, `group-has-[…]`, `peer-has-[…]`, and the implicit-ancestor `in-[…]` arms added to `TailwindState`, so `.on("has-[:checked]", t => t.ring("2"))` type-checks and emits the prefix (was raw `.addClass` only). Pure type add — no emitter/vocab change.

- **`viewTransitionName(name | Id)`** — emits inline `style="view-transition-name: <name>"` (via `addStyle`, see above) so a hero element morphs across an HTMX `outerMorph` swap when `HtmxConfig({ transitions: true })` is on. Like the other three custom-ident emitters it is deliberately **not** in the class vocab — Tailwind has no native utility for it and the ident is extractor-opaque.

- **`defineRoutes` typed params — enum + path-checked keys.** A param can now be an enum (a `readonly` literal tuple → its member union): `params: { status: ["open", "paid"] as const }` makes `route({ status: "shipped" })` a compile error. And a `params` key that is **not** a `:param` in the path is now a compile error (was a silent no-op that re-widened the param to `string`). Exported `ParamType`.

  ```typescript
  defineRoutes("/orders", { byStatus: { method: "get", path: "/:status", params: { status: ["open","paid"] as const } } });
  ```

- **`HxOptions.query` — query params on `hx()`.** The string `hx()` escape hatch now takes a typed `QueryParams` bag, mirroring the route-callable surface (6.1.0). It folds into the endpoint URL through a single **join-aware** `buildQueryString(base, query)` shared by both surfaces: nullish entries are skipped, values are url-encoded, and params join with `?` or `&` depending on whether the base already carries a query string — so a fully-resolved `.resolve(params, query)` URL is safe to pass. Prefer a typed route callable when the route is modeled by `defineRoutes`; this bag is the escape hatch for ad-hoc URLs (a `searchUrl` prop, a third-party endpoint). Distinct from `vals` (request body, not url-encoded). `QueryParams` / `QueryParamValue` and `buildQueryString` moved from `routes.ts` to `htmx.ts` (public symbol names unchanged).

  ```typescript
  hx("/task", { query: { scope: "open", text: q } });   // → hx-get="/task?scope=open&text=…"
  hx("/task?event=E", { query: { _target: id } });       // → hx-get="/task?event=E&_target=…"  (joins with &)
  ```

- **Wildcard / splat route params on `defineRoutes`.** A trailing `*` (or named `*name`) captures the rest of the path as one required `string` param: `path: "/scope/*"` adds a `splat` param, `path: "/files/*path"` a `path` param. Each segment is url-encoded but `/` is preserved (catch-all) — so splats fit file trees and scoped slugs. An omitted/typo'd splat key is a compile error, and a missing value throws at `resolve()`. Only a *trailing* `/*` is a splat (mid-path wildcards are unsupported), and a splat route takes no declared `params` (it's always `string`) — declaring one stays a compile error.

  ```typescript
  const r = defineRoutes({
    scope: { method: "get", path: "/scope/*" },       // r.scope.resolve({ splat })
    file:  { method: "get", path: "/files/*path" },   // r.file.resolve({ path })
  } as const);
  r.scope.resolve({ splat: "a/b" });   // "/scope/a/b"     (slashes preserved)
  r.file.resolve({ path: "a b/c" });   // "/files/a%20b/c" (segments encoded)
  ```

- **Compile-only type tests** (`test/types/*.test-d.ts`) — positive/negative `@ts-expect-error` assertions for the closed/open unions, `Form<T>` field-name narrowing, and the new route-param typing, checked by `tsc` in the build. Locks "a typo is a compile error" as an enforced contract.

- **Global editing / keyboard setters on `Tag`** — `setEnterkeyhint`, `setContenteditable` (`"true"`/`"false"`/`"plaintext-only"`, bare call ⇒ `"true"`), `setSpellcheck`, `setAutocapitalize`, `setLang`/`setDir`/`setTranslate` (on any element, not just `<html>`), and `setHidden("until-found")` (find-in-page-revealable hidden content). New closed unions `EnterKeyHint`/`ContentEditable`/`Autocapitalize`/`Spellcheck`.

- **`setMicrodata({ type?, prop?, ref?, id? })`** on `Tag` — typed schema.org structured-data attributes (`itemtype`/`itemprop`/`itemref`/`itemid`); setting `type` also marks the element an `itemscope`. The value-bearing counterpart to the `itemscope` boolean toggle.

- **`setForm(id)`** on `Tag` — associate a form-associated control with a `<form>` elsewhere in the document by `id` (string or `Id`). `Input().setList(...)`, `Label().setFor(...)`, and `Output().setFor(...)` now also accept an `Id`.

- **Scalar `(unit, amount)` overloads** for `textSize` / `leading` / `tracking` / `underlineOffset` — `.textSize("px", 13)` → `text-[13px]` (the value overload is byte-identical). The `prefer-unit-overload` ESLint rule now covers and autofixes them. The raw `[…]` string remains the escape hatch.

- **`IframeTag.referrerpolicy`** retyped from bare `string` to the closed `ReferrerPolicy` union (matching `AnchorTag`), and **`AriaRole`** gained the WAI-ARIA 1.2/1.3 roles (`mark`, `comment`, `suggestion`, `meter`, `code`, `emphasis`, `strong`, …; additive — the union stays open).

### 🐛 Fixed

- **`Tag.when()` now branches on `!= null`**, matching `whenElse` and `IfThen`. A present-but-falsy value (`0`, `""`) takes the run branch and is narrowed to `NonNullable<T>`, instead of being silently skipped by JS truthiness. The boolean overload is unchanged (`when(false, …)` still skips).

- **`Form<T>` error wiring is now complete (a11y).** When `state.errors[name]` is set, the bound control (`f.input`/`textarea`/`select`/`checkbox`/`radio`) emits `aria-invalid="true"` and `aria-describedby="<name>-error"`, and `f.error(name)` renders its span with the matching `id="<name>-error"` — so the control and its message are wired as one unit for assistive tech and the `aria-invalid:` Tailwind variant. **Output change:** errored controls now carry these two ARIA attributes (well-formed/non-errored forms are byte-identical).

- **`setAria` values are now per-key typed** (was flat `string | number | boolean`). The enumerable states carry their token unions — `current`, `haspopup`, `live`, `sort`, `autocomplete`, `orientation`, `invalid` — so `setAria({ live: "polit" })` is now a compile error; tristate states accept `boolean | "mixed"`, numeric states accept `number`. **Narrowing:** only previously-broken token strings start erroring; every valid call still compiles.

### 📝 Docs

- Corrected the `defineRoutes` examples in the guidelines/`CLAUDE.md` to use **lowercase** HTTP methods (`method: "get"`/`"post"`) — uppercase `"GET"`/`"POST"` does not type-check against the `HxHttpMethod` union, so scaffolded routes were born non-building.

---

## [6.1.0] - Native Interactivity, Resource Hints & Control-Flow Combinators

Additive only — new setters, new exported types, and two new combinators. Open-union widenings keep every v6.0.0 caller compiling; rendered output is byte-identical for values that were already valid.

### ✨ Added

- **Native interactivity — Popover API, invoker Commands, and CSS anchor positioning** (zero JS, no CSP nonce):
  - **Popover API** — `setPopover(state?)` (defaults `"auto"`: light-dismiss + top-layer; `"manual"` for explicit dismiss), `setPopovertarget(id)`, `setPopovertargetaction(action?)` on any element. `PopoverState` / `PopoverAction` are closed unions; the target is `Id`-typed. Omitting the action emits no attribute (relies on the native `toggle` default).
  - **Invoker Commands** — `Button().setCommand(command)` / `setCommandfor(id)` — a JS-free, nonce-free alternative to the `openDialog`/`closeDialog` behaviors (which **remain**). `CommandFor` is closed over the native verbs (`show-modal`/`close`/`request-close`/`show-popover`/`hide-popover`/`toggle-popover`) plus a `` `--${string}` `` author-command arm.
  - **CSS anchor positioning** — `anchorName(id)` / `positionAnchor(id)` emit `[anchor-name:--<id>]` / `[position-anchor:--<id>]`; `positionArea(area)` emits `position-area-<area>` (`TailwindPositionArea`). Registered in the class-vocab so the extractor + eslint stay in lockstep. (Called with an `Id` variable, the two `[…:--<id>]` emitters are surfaced as *unresolved* by the extractor — safelist them; only `positionArea("literal")` resolves statically.)

  ```typescript
  Button("Open").setCommand("show-modal").setCommandfor(ids.dialog)   // <button command commandfor> — no hx-on, no nonce
  const menu = ids.userMenu;
  Button("Account").setPopovertarget(menu).anchorName(menu);
  Div(/* items */).setId(menu).setPopover().positionAnchor(menu).positionArea("bottom");
  ```

- **`setFetchPriority('high' | 'low' | 'auto')`** on `Img`, `Link`, `Script`, and `Iframe` — the typed Core Web Vitals priority hint (previously reachable only via `addAttribute`). Promote the LCP image/resource with `'high'` or de-prioritise a below-the-fold preload with `'low'`. `FetchPriority` is a **closed** union, so a typo is a compile error.

  ```typescript
  Img().setSrc("/hero.avif").setAlt("").setFetchPriority("high");          // LCP promotion
  Link().setRel("modulepreload").setHref("/app.js").setFetchPriority("low");
  ```

- **Typed open unions for head-element attributes**, replacing bare `string`: `LinkElementRel` (`<link rel>` resource hints + document relations — distinct from the anchor-rel `LinkRel`), `LinkAs`, `LinkType`, `ScriptType`, `MetaName`, and `Charset`. Each retypes its setter — `Link().setRel/setAs/setType`, `Script().setType`, `Meta().setName/setCharset` — and `Base().setTarget` now reuses the existing `BrowsingContext` union. Additive: custom/vendor values still compile via the `(string & {})` open tail; the canonical set autocompletes.

  ```typescript
  Link().setRel("preconnect").setHref("https://fonts.gstatic.com").setCrossOrigin("");
  Meta().setName("theme-color").setContent("#0b0b0b");
  Script().setSrc("/app.js").setType("module");
  ```

- **`MatchValue(value, cases, default?)`** — the value-returning sibling of `Match`: maps a value to another **value** (keeping its literal union) via a plain-value case record. Exhaustive without a default; supply a default to match a subset. Recovers the union a ternary erases to `string`. The result assigns into a fluent styling method only when every case value is a real Tailwind token (the closed `TailwindColor` union, or a `defineTheme()`-registered token):

  ```typescript
  const trend = MatchValue(omtm.trend, { up: "↑", down: "↓" }, "→");        // "↑" | "↓" | "→"
  Div().background(MatchValue(tone, { ok: "green-100", err: "red-100" }, "gray-100"));
  ```

- **`Intersperse(items, renderItem, separator)`** — places a separator *between* mapped Views, never after the last (the View analogue of `Array.join`). The thunk separator form is called once per gap, so callers return fresh Tag instances:

  ```typescript
  Nav(Intersperse(crumbs, (c) => A(c.label).setHtmx(c.route), () => Span("/").textColor("gray-400")));
  ```

---

## [6.0.1] - Correctness & Security Patch

Behavior-only fixes — no public API changes shape. Output differs **only** for inputs that were already malformed, malicious, or incorrect; well-typed, benign inputs are byte-identical.

### 🔒 Security

- **`hx-preload` string values are now attribute-escaped**, like every other `hx-*` string attribute. Closes an attribute break-out reachable from untyped callers (the typed `"mousedown" | "mouseover"` path is unchanged).
- **`setDataAttrs` now validates the computed `data-*` key** (the same attribute-name guard as `setAria`/`addAttribute`): a markup-breaking key — quotes, spaces, `=` — throws instead of emitting injectable HTML.

### 🐛 Fixed

- **Duplicate-attribute emission eliminated.** Every attribute name is now emitted at most once.
  - `.toggle("x").toggle("x")` (or two `.toggle("x", cond)` calls both true) now renders a single `x`, not `x x`.
  - `id`, `class`, and `style` are reserved to their dedicated setters: when a setter (`setId`/`setClass`/`setStyle`/fluent class) **and** `addAttribute("id"|"class"|"style", …)` are both used on a tag, the dedicated setter wins and the bag value is skipped (precedence: dedicated field > generic bag > bare toggle). With no dedicated setter, `addAttribute("id", …)` still emits the attribute.
  - A `.toggle("x")` whose name is also set via `addAttribute("x", …)` is dropped in favor of the value form.
- **Route params:** `defineRoutes()` callables and `.resolve()` now substitute each `:param` with a boundary-aware match in one shared helper. A param name that is a prefix of another (e.g. `:id` next to `:idCard`) no longer corrupts the URL, and a path that repeats a param now resolves all occurrences instead of throwing.
- **`HxResponse.trigger`:** multiple triggers are now accumulated in a structured map and serialized once at `build()`/`getHeaders()` — bare events as a comma list (`"a, b"`), detailed events as the JSON object form. An event name that parses as JSON (e.g. `"123"`) no longer drops earlier triggers.
- **htmx `ignore`:** `{ ignore: true }` now emits the bare boolean `hx-ignore` (htmx 4's disable-processing attribute) instead of the valued `hx-ignore="true"` — and never `hx-disable`, which in htmx 4 is the disabled-elements selector (the `disable` field), so the two no longer collide.

### 🔧 Tooling (extractor / eslint / class-vocab)

- **Extractor:** no longer emits spurious un-prefixed / partial-prefix classes for nested `.on()`/`.at()` variants — a class written only as `hover:focus:bg-red-500` no longer also safelists `hover:bg-red-500` and `bg-red-500`.
- **Extractor:** `extractDefaultClasses` no longer swallows a fluent call expression (`setHtmx(routes.list)`) as a class token; a `(...)` group is matched only inside an arbitrary `[...]` value.
- **ESLint `prefer-unit-overload`:** the CSS unit list is now generated from the library's `UNITS` (via `VOCAB_UNITS` in `vocab.generated.ts`) and drift-guarded, instead of being hardcoded in the rule.
- **Reverse class-vocab parity test:** every class-emitting `Tag.prototype` method must now appear in `classVocab` — catches a new emitter that forgets to register (as `htmxIndicator` once did) and would otherwise emit a class no extractor safelists.

---

## [6.0.0] - Greenfield v6

A greenfield, v4-native, instruction-set rewrite of the contract for new projects. Beyond the HTMX 4 migration, v6 reworks the everyday authoring surface (P3) and the keeper primitives (P4): one `.toggle()` boolean path, typed ARIA, complete/consistent setters, layout shortcuts, `.overlay()`, first-class control-flow/document APIs, typed `Form<T>` binding, native dialog behaviors, full SVG coverage, and `.htmxIndicator()`.

### 🚀 Breaking Changes

#### Boolean attributes — `.toggle()` only (P3)

Every named boolean setter is **removed** — `setChecked`, `setDisabled`, `setReadonly`, `setMultiple`, `setAutofocus`, `setSelected`, `setOpen`, `setNovalidate`, `setControls`, `setAutoplay`, `setLoop`, `setMuted`, `setPlaysinline`, `setAsync`, `setDefer`, `setNomodule`, `setAllowfullscreen`, `setDefault`. Use `.toggle("name")`, which renders the attribute **bare** — fixing the old `checked="false"` → browser-sees-checked bug. `BooleanAttribute` is now a closed union, so a typo is a compile error.

```typescript
Input().setChecked()          // ✗ removed
Input().toggle("checked")     // ✓ → <input checked>
Button().toggle("disabled", isLoading)
```

#### Setter renames + fixes (P3)

No aliases (greenfield): `setCrossorigin` → `setCrossOrigin` (now also accepts `""` for preconnect / Google Fonts), `setReferrerpolicy` → `setReferrerPolicy`, `setSvgOpacity` → `setOpacity`. `setHttpEquiv` now emits the real `http-equiv` attribute (was the silently-dead `httpEquiv`).

#### Position/display passthroughs → shortcuts (P3)

`.position(v)`, `.display(v)`, and `.flex1()` are removed in favor of dedicated zero-arg shortcuts: `.absolute()`/`.relative()`/`.fixed()`/`.sticky()`/`.static()`, `.block()`/`.inline()`/`.inlineBlock()`/`.inlineFlex()`/`.inlineGrid()`/`.contents()`, and `.flexShorthand("1"|"auto"|"initial"|"none")`.

#### `formFor` → `Form<T>(state?, build)` (P4)

The `formFor<T>()` factory is replaced by the `Form<T>` HOF, which additionally auto-wires values/errors from `state`:

```typescript
Form<CreateUserReq>({ values, errors }, (f) => [
  f.input("email", "email"),   // value wired from state; name typed to keyof T
  f.error("email"),            // error <span> from state.errors
])
```

#### `Overlay()` → `.overlay()` (P3)

The `Overlay(content, overlay, position)` function is replaced by the `Tag.prototype.overlay(position?, ...content)` method (works on void elements, e.g. `Img().overlay("bottom-right", Badge("3"))`).

#### Removed the fold / recursion-schemes layer

The fold layer is gone — `foldView`/`paraView`/`unfoldView`/`hyloView`, all algebras/coalgebras (`countAlgebra`/`textAlgebra`/`linksAlgebra`/`renderAlgebra`/`ariaDescribeAlgebra`/`createTransformAlgebra`/`addClassToMatching`/`tocCoalgebra`/`linkedTocCoalgebra`), the `fluent-html/fold` subpath, and their types. It was demo-only (~1000 LOC) and a disproportionate source of Track-D bugs; the real needs (a11y audit / TOC / link extraction) are short plain recursive `View` walks in app-land. `FOLD.md` and `functional-patterns.md` are deleted.

#### No context/DI in core

`createContext` / `createRequiredContext` / `Context` (added on the v5 line) are **not** part of v6 core. Scoped context is a request-lifecycle concern that belongs to the framework layer (an `@fluent-html/fastify`-style package), where async isolation can be handled correctly — a pure HTML builder has no business owning a process-global DI stack. Render is fully decoupled from context (values are baked into the tree at construction; `render()` never reads context), so it leaves cleanly.

#### HTMX 4 Compatibility

Updated the HTMX integration from v2 to v4. This is a major update that aligns with htmx 4's new defaults and removed features.

**Removed attributes:**
- `selectOob` — removed from htmx 4
- `params` — removed from htmx 4
- `prompt` — removed from htmx 4
- `disinherit` / `inherit` — htmx 4 no longer inherits by default; use `:inherited` modifier instead
- `history` / `historyElt` — removed from htmx 4
- `request` — replaced by per-element `config`
- `ext` — extensions are now configured globally via `HtmxConfig()`

**Renamed attributes:**
- `disabledElt` → `disable` — aligns with htmx 4 naming
- `disable` (boolean) → `ignore` — `hx-disable` is now `hx-ignore` in htmx 4

**Removed response helpers:**
- `triggerAfterSwap()` / `triggerAfterSettle()` — removed from htmx 4's `HxResponse`

### ✨ New Features

#### Type-Safe Routes (`defineRoutes`)

New `defineRoutes()` function for compile-time-safe HTMX endpoints:

```typescript
// Shared prefix avoids path repetition
export const userRoutes = defineRoutes("/users", {
  list:   { method: "get",    path: "/" },
  create: { method: "post",   path: "/" },
  delete: { method: "delete", path: "/:id" },
} as const);

// Views — method is locked, params are required, typos are compile errors
Button("Load").setHtmx(userRoutes.list())
Button("Delete").setHtmx(userRoutes.delete({ id: user.id }, { target: ids.userList }))

// Controllers — single-sourced paths
server.get(userRoutes.list.path, handler)

// Resolved URLs for redirects, links, etc.
reply.redirect(userRoutes.delete.resolve({ id: user.id }))
```

Path parameters (`:id`) are extracted at the type level and required at call time. Routes expose `.method`, `.path`, and `.resolve()` for server-side use.

#### Query Parameters on Routes

Routes now accept query parameters on both the callable and `.resolve()`. Nullish values are silently skipped:

```typescript
// resolve() with query params
userRoutes.list.resolve({ page: "2", sort: "name" })                       // "/users?page=2&sort=name"
userRoutes.delete.resolve({ id: user.id }, { tab: "posts" })               // "/users/42?tab=posts"
userRoutes.list.resolve({ page: "1", filter: undefined })                   // "/users?page=1"

// HTMX calls with query params
Button("Page 2").setHtmx(userRoutes.list({ query: { page: "2" } }))
```

Supports `string`, `number`, and `boolean` values. Keys and values are properly encoded via `encodeURIComponent`.

#### Morph Swap Strategies

New swap styles for DOM-preserving morphs:
- `outerMorph` — morph the target element itself (preserves focus, scroll, animations)
- `innerMorph` — morph the target's children

Short swap aliases: `before`, `after`, `prepend`, `append`.

#### Partial Multi-Swap (`Partial`)

New `Partial()` helper replaces OOB swaps with htmx 4's `<hx-partial>` element:

```typescript
render(
  Partial(ids.mainContent, UserList(users)),
  Partial(ids.userCount, Span(`${users.length} users`)),
)
```

`OOB()` and `withOOB()` are now deprecated.

#### Global HTMX Config (`HtmxConfig`)

New `HtmxConfig()` helper for type-safe global htmx configuration via `<meta>` tag:

```typescript
Head(
  HtmxConfig({
    extensions: "sse, preload",
    transitions: true,
    defaultSwap: "outerMorph",
    implicitInheritance: true,
  }),
)
```

#### Per-Element Config

New `config` option replaces the removed `hx-request` attribute:

```typescript
Button("Upload").hxPost("/upload", { config: { timeout: 120000 } })
```

#### Status-Code Routing

Route HTMX responses to different targets based on HTTP status codes:

```typescript
Form().hxPost("/users/create", {
  target: ids.mainContent,
  swap: "outerMorph",
  status: {
    422: { target: ids.formErrors, swap: "innerHTML" },
    "5xx": { swap: "none" },
  }
})
```

#### Preload & Optimistic UI

- `preload` — prefetch responses on hover before click
- `optimistic` — show expected content before server responds

#### Typed accessibility setters (P3)

`setRole(AriaRole)`, `setTabindex(number)`, `setTitle(string)`, and a retyped `setAria(AriaAttrs)` with closed `AriaAttributeName` keys + boolean/tristate values. `setAria({ haspopup: true })` now emits the correct `aria-haspopup` (was the mangled `aria-has-popup`).

#### Expanded element setters + `_sk` tuple (P3)

`setInputmode` (Input/Textarea), `setHreflang` (Link/Anchor), `setCapture` (Input), SVG `setStrokeDashoffset`/`setStrokeOpacity`, and an optional `OptionTag.setValue()`. Internally, `_sk` schema keys gained a `[prop, attr]` tuple form so a JS field can emit a differently-named attribute (e.g. `httpEquiv` → `http-equiv`).

#### Negative transforms + layout shortcuts (P3)

`.translate`/`.rotate`/`.skewX`/`.skewY` accept negatives and emit them correctly (`-translate-y-1`, not the dropped `translate-y--1`). Plus the position/display shortcuts and `.flexShorthand()` noted in Breaking Changes.

#### Control-flow & document APIs (P3)

- `ForEachElse(items, renderItem, emptyView)` — list with an empty fallback.
- `Tag.whenElse(cond|value, then, else)` — two-branch modifier (mirrors `IfThenElse`, not truthiness — `""`/`0` take the `then` branch).
- `Document(...)` / `Doctype()` — a full document that emits `<!DOCTYPE html>` (`DocumentTag extends HtmlTag`, chainable); plain `HTML(...)` stays byte-identical.
- `.hxOn(event, js)` — typed one-off `hx-on:*` handler (event validated, js attribute-escaped).

#### `.overlay()` + type-only exports (P3)

SwiftUI-style `.overlay()` (see Breaking Changes). The 15 HTMX/`Id` type re-exports are now `export type` — TS1205-safe under `verbatimModuleSyntax`.

#### Typed form binding — `Form<T>` (P4)

`Form<T>(state?, build)` (see Breaking Changes), with `FormState<T>`/`FormBinding<T>`/`ErrorBag<T>` types, value/error auto-wiring (including `<select>` selected state), and `FormTag.multipart()`.

#### Native dialog behaviors + behavior widening (P4)

- `behavior("openDialog"/"closeDialog", { target })` — call native `<dialog>.showModal()`/`.close()` (free backdrop / Esc / focus-trap / top-layer).
- `toggle`/`toggleClass`/`remove` gained `event?`, `force?`, and `animateOut?`.
- New `formResetOnSwap` / `dismissOnEscape` behaviors.

#### Complete SVG coverage (P4)

Typed container builders — `LinearGradient`/`RadialGradient`/`Stop`, `ClipPath`, `Mask`, `Filter`/`FeGaussianBlur` — plus the missing stroke setters, so icons and effects are typed Views instead of `Raw("<svg…>")` strings.

#### `.htmxIndicator()` (P4)

Sanctioned method emitting the library-known `htmx-indicator` class, recognised by the Tailwind extractor and ESLint (unlike a raw `.setClass("htmx-indicator")`).

#### New & updated ESLint rules

`prefer-toggle` (boolean `addAttribute` → `.toggle()`), `no-removed-v4-utilities`, `no-raw-icon-string`, and an extended `prefer-set-method` (drops the removed boolean setters; flags `aria-*`/`data-*`/`style`/role/title/tabindex).

---

## [5.11.0] - Type-Safe Routes & Contexts

### ✨ New Features

#### Typed Route Parameters

`defineRoutes()` now supports typed path parameters — `string`, `number`, and `uuid`. The type is enforced at compile time and validated at resolve time:

```typescript
export const userRoutes = defineRoutes("/users", {
  list:   { method: "get",  path: "/" },
  detail: { method: "get",  path: "/:id", params: { id: "number" } as const },
  bySlug: { method: "get",  path: "/:slug", params: { slug: "string" } as const },
  byUuid: { method: "get",  path: "/:uuid", params: { uuid: "uuid" } as const },
} as const);

userRoutes.detail.resolve({ id: 42 })      // "/users/42" — id must be number
userRoutes.bySlug.resolve({ slug: "hello" }) // "/users/hello" — slug must be string
```

#### Required Context (`createRequiredContext`)

New `createRequiredContext()` for values that **must** have an active scope — throws if accessed outside one. Use for values like request-specific auth where a missing scope is always a bug:

```typescript
const AuthCtx = createRequiredContext<User>("AuthCtx");

function handler(user: User) {
  using _ = AuthCtx.scope(user);
  return Page();
}

function Page() {
  const user = AuthCtx.current;  // User — throws if no scope active
  return Div(`Hello, ${user.name}`);
}
```

Compare with `createContext(defaultValue)` which returns the default silently.

#### Strict `HxSwap` Type

`HxSwap` is now a strict union type — invalid swap values are compile errors instead of being silently accepted.

---

## [5.10.0] - Performance, Inputs & Styling

### ✨ New Features

#### Generic `Input()` Factory

`Input()` now accepts an optional type argument that locks `min`, `max`, and `step` to the correct types:

```typescript
Input("number").setMin(0).setMax(100).setStep(5)   // min/max: number
Input("date").setMin("2024-01-01")                   // min/max: string
Input("range").setMin(0).setMax(10).setStep(0.5)    // min/max: number
Input("email")                                       // no min/max/step
Input()                                              // all types allowed
```

#### 29 New Tailwind Fluent Methods

Added fluent methods for gradients, filters, typography, and more:

- **Gradients:** `gradientTo(direction)`, `from(color)`, `via(color)`, `to(color)`
- **Filters:** `blur()`, `brightness()`, `contrast()`, `grayscale()`, `hueRotate()`, `invert()`, `saturate()`, `sepia()` — plus `backdrop*` variants for all
- **Group/Peer:** `group(name?)`, `peer(name?)` — support named variants like `group/form`
- **Typography:** `fontFamily()`, `antialiased()`, `tabularNums()`, `underlineOffset()`, `lineClamp()`, `breakAll()`, `listStyleType()`, `listStylePosition()`
- **Colors:** `shadowColor()`
- **Layout:** `gridAutoFlow()`, `gridAutoRows()`, `gridAutoCols()`, `placeContent()`, `placeItems()`, `placeSelf()`
- **Other:** `ease()`, `skewX()`, `skewY()`, `willChange()`, `overscroll()`, `resize()`, `neg(cls)`

#### Arbitrary Value Unit Overloads

Sizing, spacing, and position methods now accept a `(unit, amount)` overload for arbitrary values:

```typescript
Div().w("px", 180)        // → w-[180px]
Div().h("rem", 2.5)       // → h-[2.5rem]
Div().minH("vh", 50)      // → min-h-[50vh]
Div().padding("px", 12)   // → p-[12px]
Div().top("em", 1.5)      // → top-[1.5em]
```

Units: `px`, `rem`, `em`, `%`, `vh`, `vw`, `dvh`, `svh`, `lvh`. Available on `w`, `h`, `minW`, `maxW`, `minH`, `maxH`, `padding`, `margin`, `gap`, `top`, `right`, `bottom`, `left`, `inset`.

#### Recursion Schemes

Three new recursion schemes for View tree processing, complementing the existing `foldView`:

- **`paraView(alg, view)`** — Paramorphism: like `foldView`, but the `tag` handler also receives the original subtree
- **`unfoldView(coalg, seed)`** — Anamorphism: builds a View tree by recursively expanding a seed
- **`hyloView(coalg, alg, seed)`** — Hylomorphism: fused unfold-then-fold in a single pass without intermediate allocation

Built-in algebras: `ariaDescribeAlgebra` (paramorphism for accessibility audit). Built-in coalgebras: `tocCoalgebra`, `linkedTocCoalgebra` (generate `<ul>/<li>` TOC from flat heading list).

See [functional-patterns.md](functional-patterns.md) for full documentation.

### 🔧 Improvements

#### Render Performance

Optimized the render path: **+47% throughput** on flat pages, **+20%** on realistic nested pages. No API changes.

#### SVG Improvements

- `setStrokeWidth()` added to `SvgTag` (not just shape elements)
- `setWidth()`, `setHeight()`, `setStrokeWidth()` now accept `string | number` on `SvgTag`, `RectTag`, and `ForeignObjectTag`
- `setOpacity()` added to `SvgShapeTag`
- `G()` now returns `SvgShapeTag` (gains fill, stroke, transform methods)

---

## [5.9.1]

### 🔧 Improvements

- Updated codebase analysis: API Design now 10/10 (all dimensions at 10/10)

---

## [5.9.0] - Strict Types & API Cleanup

### 🚀 Breaking Changes

#### Strict Tailwind Types

The `Autocomplete<T> = T | (string & {})` escape hatch has been replaced with strict union types on all Tailwind method signatures. Wrong values don't compile. For arbitrary Tailwind values (e.g., `p-[37px]`), use `addClass()`.

#### `.toggle()` Only

`setToggles()` has been replaced by `.toggle()`:

```typescript
Input().toggle("required").toggle("disabled")
Input().toggle("required", isRequired)  // conditional
```

#### `Match()` Only

The deprecated `SwitchCase` export has been replaced by `Match()`.

#### Void Elements Reject Children

Void element factories (`Input`, `Img`, `Hr`, `Br`, `Source`, `Track`, `Col`, `Embed`, `Area`, `Wbr`, `Meta`, `Link`, `Base`) now accept zero arguments. Children passed to void elements are silently ignored at render time.

### ✨ New Features

#### Named Tailwind Types

Extracted 5 named types for better consumer DX:
- `TailwindPosition` — `"static" | "fixed" | "absolute" | "relative" | "sticky"`
- `TailwindTextAlign` — `"left" | "center" | "right" | "justify"`
- `TailwindFlexDirection` — `"row" | "col" | "row-reverse" | "col-reverse"`
- `TailwindJustifyContent` — `"start" | "end" | "center" | "between" | "around" | "evenly"`
- `TailwindAlignItems` — `"start" | "end" | "center" | "baseline" | "stretch"`

All types re-exported from `core/index.ts`.

#### Typed SVG Attribute Setters

All SVG elements now have typed tag classes with fluent attribute setters:

- **`SvgShapeTag`** (shared base) — `setFill()`, `setStroke()`, `setStrokeWidth()`, `setStrokeLinecap()`, `setStrokeLinejoin()`, `setStrokeDasharray()`, `setSvgOpacity()`, `setTransform()`
- **`CircleTag`** — `setCx()`, `setCy()`, `setR()`
- **`RectTag`** — `setX()`, `setY()`, `setWidth()`, `setHeight()`, `setRx()`, `setRy()`
- **`LineTag`** — `setX1()`, `setY1()`, `setX2()`, `setY2()`
- **`PathTag`** — `setD()`, `setFillRule()`, `setClipRule()`
- **`EllipseTag`** — `setCx()`, `setCy()`, `setRx()`, `setRy()`
- **`PolygonTag`** / **`PolylineTag`** — `setPoints()`
- **`SvgTextTag`** — `setX()`, `setY()`, `setDx()`, `setDy()`, `setTextAnchor()`, `setDominantBaseline()`, `setFontSize()`, `setFontFamily()`
- **`TspanTag`** — `setX()`, `setY()`, `setDx()`, `setDy()`
- **`UseTag`** — `setHref()`, `setX()`, `setY()`, `setWidth()`, `setHeight()`

> `setSvgOpacity()` is used instead of `setOpacity()` to avoid conflict with Tailwind's `.opacity()`.

---

## [5.8.1]

### 🔧 Improvements

#### Type Safety Improvements

- **Literal string unions** — replaced bare `string` types with specific literal unions where only certain values are valid
- **Branded `Id` type** — prevents mixing up different ID types at compile time
- **Type guards** — `isTag()` and `isRawString()` for safe runtime type narrowing
- **Constrained `.toggle()`** — now accepts only valid `BooleanAttribute` names

---

## [5.8.0]

### 🔧 Improvements

#### Test Suite Migration

- Migrated entire test suite from custom test runner to `node:test` (built-in Node.js test runner)
- All tests now run with `node --test` — no external test framework needed

#### Code Quality

- Refactored `buildHtmx` to data-driven architecture, eliminating repetitive conditional branches
- Extracted `resolveSelector` utility for consistent ID/selector handling
- Removed deprecated `ForEach1`, `ForEach2`, `ForEach3` aliases
- Output target updated to ES2020 with ESM modules

---

## [5.7.1]

### ✨ New Features

#### Variadic `render()`

`render()` now accepts variadic arguments, making multi-element responses cleaner:

```typescript
render(Partial(ids.list, items), Partial(ids.count, count))
```

#### New ESLint Rules

Six new rules added to the `fluent-html` ESLint plugin:

- **`no-setclass-in-when-apply-callback`** — prevents `setClass()` inside `.when()` / `.apply()` callbacks (overwrites earlier classes)
- **`prefer-variadic-children`** — suggests `Div(a, b)` over `Div([a, b])`
- **`no-conditional-in-setclass`** — flags template literals/ternaries in `setClass()`; suggests `.setClasses()` or `.when()`
- **`no-innerhtml-swap`** — prevents `swap: "innerHTML"` (loses target ID); auto-fixes to `"outerHTML"`
- **`prefer-set-method`** — suggests `.setType("submit")` over `.addAttribute("type", "submit")`; auto-fixable
- **`no-raw-ids`** — flags hardcoded `.setId("string")` and `target: "#string"`; suggests `defineIds()`

### 🔧 Improvements

- `no-known-modifiers-in-setclass` now also checks `addClass()` calls (skips pseudo-class prefixed classes like `hover:`)
- `no-setclass-after-fluent-modifier` recognizes `when()` and `apply()` as fluent modifiers

---

## [5.7.0]

### ✨ New Features

#### Conditional Modifier (`.when()`)

Conditionally apply modifications to a tag without breaking the chain:

```typescript
Button("Save")
  .when(isLoading, t => t.toggle("disabled").addClass("opacity-50"))
  .when(isPrimary, t => t.addClass("bg-blue-500 text-white"))
```

#### Composable Modifier (`.apply()`)

Apply reusable modifier functions for consistent styling patterns:

```typescript
const card = (t: Tag) => t.padding("6").background("white").rounded("lg").shadow("md");
const danger = (t: Tag) => t.addClass("border-red-500 text-red-700");

Div("Warning").apply(card, danger)
```

---

## [5.6.0]

### 🔧 Improvements

- Documentation updates across README, AI instructions, and styling guides to reflect variadic children as the recommended pattern
- Removed deprecated array-only iteration helpers

---

## [5.5.0]

### ✨ New Features

#### Variadic Children

Element constructors now accept **variadic children** instead of requiring an array:

```typescript
// Before (array required for multiple children)
Div([H1("Title"), P("Body")])

// After (variadic — no array needed)
Div(H1("Title"), P("Body"))
```

The array form still works but variadic is now the recommended style. Use arrays only when passing a dynamic `View[]` variable (e.g., from `ForEach` or `.map()`).

#### HTMX Shorthand Methods

New shorthand methods on all tags for the most common HTMX operations:

```typescript
// Before — always needed the hx() wrapper
Button("Load").setHtmx(hx("/api/items"))
Button("Save").setHtmx(hx("/api/save", { method: "post", target: "#result" }))

// After — shorthand methods with the HTTP method baked in
Button("Load").hxGet("/api/items")
Button("Save").hxPost("/api/save", { target: "#result" })
Button("Update").hxPut("/api/item/1")
Button("Patch").hxPatch("/api/item/1")
Button("Remove").hxDelete("/api/item/1", { confirm: "Sure?" })
```

#### setHtmx Overloads

`setHtmx` now accepts an endpoint string and options directly, in addition to a pre-built HTMX object:

```typescript
// New — inline args (method defaults to GET)
Button("Load").setHtmx("/api/items")
Button("Save").setHtmx("/api/save", { method: "post", target: "#result" })

// Still works — pre-built hx() object
Button("Load").setHtmx(hx("/api/items"))
```

#### HxOptions Type

New exported `HxOptions` type derived from the `HTMX` interface. Eliminates duplication between the interface and the `hx()` function signature:

```typescript
import type { HxOptions } from 'fluent-html';

// HxOptions = Partial<Omit<HTMX, 'endpoint' | 'method' | 'target'>>
//           & { method?: HxHttpMethod; target?: HxTarget | Id }
```

#### Nullable Value Overloads for IfThen / IfThenElse

`IfThen` and `IfThenElse` now accept a nullable value (`T | null | undefined`) instead of a boolean. When the value is non-null, it is passed into the callback with its type narrowed to `T`:

```typescript
const user: User | null = getUser();

// Before — requires !! and !
IfThen(!!user, () => Span(`Welcome, ${user!.name}`))

// After — type-safe, no assertions needed
IfThen(user, (u) => Span(`Welcome, ${u.name}`))

// Works with IfThenElse too
IfThenElse(user, (u) => Span(`Welcome, ${u.name}`), () => A("Login").setHref("/login"))
```

## [5.1.0] - 2025-01

### ✨ New Features

#### Type-Safe Fluent Styling

All fluent styling methods now have **type-safe parameters** with IDE autocomplete for Tailwind values:

```typescript
Div()
  .w("full")              // IDE suggests: "full", "1/2", "screen", "64", etc.
  .background("red-500")  // IDE suggests: all color-shade combinations
  .rounded("lg")          // IDE suggests: "sm", "md", "lg", "xl", "full", etc.
```

The type system suggests valid Tailwind values while still allowing custom/arbitrary values when needed via the `Autocomplete<T>` helper type.

#### New Text Styling Methods

Added 10 new fluent methods for common text styling:

- `.bold()` - Shorthand for `font-bold`
- `.italic()` - Add `italic` class
- `.uppercase()` - Text transform to uppercase
- `.lowercase()` - Text transform to lowercase
- `.capitalize()` - Capitalize first letter of each word
- `.underline()` - Add underline decoration
- `.lineThrough()` - Add line-through decoration
- `.truncate()` - Truncate with ellipsis
- `.leading(value)` - Line height (`leading-tight`, `leading-relaxed`, etc.)
- `.tracking(value)` - Letter spacing (`tracking-wide`, `tracking-tight`, etc.)

**Example:**
```typescript
Span("IMPORTANT")
  .bold()
  .uppercase()
  .tracking("wide")
  .textColor("red-500")

P("Long text that might overflow...")
  .truncate()
  .w("48")
```

---

## [4.0.0-beta.1] - 2025-01

### 🎉 New Feature: Reactive System

Fluent HTML now includes a **minimal, compile-time-checked reactive system** for client-side rendering with automatic state management and DOM updates.

#### ✨ Key Features

**Declarative Reactive Bindings:**
- `.bindText(expr)` - Bind expression to textContent
- `.bindHtml(expr)` - Bind expression to innerHTML (⚠️ XSS risk)
- `.bindShow(expr)` / `.bindHide(expr)` - Conditional visibility
- `.bindClass(className, expr)` - Dynamic CSS classes
- `.bindAttr(attrName, expr)` - Dynamic attributes
- `.bindStyle(propName, expr)` - Dynamic inline styles
- `.bindValue(expr)` - Two-way input binding

**Event Handlers:**
- `.onClick(statement)` - Click event handler
- `.onInput(statement)` - Input event handler
- `.onChange(statement)` - Change event handler
- `.onSubmit(statement)` - Form submit handler (with automatic preventDefault)
- `.onKeydown(statement)` - Keyboard event handler
- `.onFocus(statement)` / `.onBlur(statement)` - Focus event handlers

**Compile-Time Validation:**
- `compile(view)` validates all reactive bindings before runtime
- Checks that all `data.xxx` references are bound by `bindState()`
- Prevents variable shadowing in nested state
- Provides helpful error messages for unbound variables

**Simple API Pattern:**
- `bind*` methods for reactive data → DOM
- `on*` methods for DOM events → data mutations
- All expressions reference state via `data.propertyName`

#### 📝 Usage Example

```typescript
import { Div, Button, Span, compile, renderWithScript } from 'fluent-html';

const counter = Div([
  Button("Increment").onClick("data.count++"),
  Span().bindText("'Count: ' + data.count"),
  Div("High count!").bindShow("data.count > 5")
]).bindState({ count: 0 });

const error = compile(counter);
if (error) throw new Error(error.message);

console.log(renderWithScript(counter));
// Outputs HTML + <script> with reactive behavior
```

#### 🔧 New API Functions

- `compile(view)` - Validate reactive bindings and assign unique IDs
- `generateScript(view)` - Generate JavaScript for reactive behavior
- `renderWithScript(view, renderFn?)` - Convenience function combining render() and generateScript()
- `resetIdCounter()` - Reset global ID counter (useful for testing)

#### 🏗️ Implementation Details

- Zero runtime dependencies - generates vanilla JavaScript
- Automatic ID assignment for reactive elements
- Efficient DOM updates via `update()` function
- Event handlers automatically call `update()` after mutations
- IIFE wrapper for state isolation
- Support for nested `bindState()` for component composition

#### 📚 Documentation

See the new **Reactive System** section in README.md for:
- Complete API documentation
- Reactive binding examples
- Event handler patterns
- Compile-time validation guide
- Complete working examples (counter, todo list, forms, tabs)

---

## [3.0.0] - 2025-01

### 🚀 Breaking Changes

This is a major release with a **completely redesigned API**. The new API uses **method chaining** instead of object configuration, providing superior IDE autocomplete and type safety.

#### Before (v1.x / v2.x)
```typescript
Div({
  id: "container",
  class: "flex items-center",
  child: Text("Hello")
})
```

#### After (v3.0.0)
```typescript
Div("Hello")
  .setId("container")
  .setClass("flex items-center")
```

### ✨ New Features

#### 🎯 IDE-Powered Development

The new type system provides **intelligent autocomplete** for:
- All HTMX triggers (`click`, `load`, `revealed`, `keyup changed delay:300ms`, etc.)
- All HTMX swap strategies (`innerHTML`, `outerHTML scroll:top`, etc.)
- All HTMX sync modes (`drop`, `abort`, `queue last`, etc.)
- Element-specific methods (`.setColspan()` only on `Th`/`Td`, `.setMin()` only on `Input`, etc.)

#### 🛡️ Built-in XSS Protection

All text content and attributes are **automatically HTML-escaped**:
- Text content: `<script>` → `&lt;script&gt;`
- Attributes: `"><script>` → `&quot;&gt;&lt;script&gt;`
- Script/Style elements are NOT escaped (intentional - they contain code)
- No opt-out, no `Raw()` helper - security by default

#### ⚡ Complete HTMX 2.0 Support

Full type-safe support for all HTMX 2.0 attributes:
- **Methods**: `get`, `post`, `put`, `patch`, `delete`
- **Targeting**: `target`, `swap`, `swapOob`, `select`, `selectOob`
- **Triggers**: All DOM events, `load`, `revealed`, `intersect`, polling, SSE, WebSocket
- **URL**: `pushUrl`, `replaceUrl` (with custom URL support)
- **Data**: `vals`, `headers`, `include`, `params`, `encoding`
- **Validation**: `validate`, `confirm`, `prompt`
- **Loading**: `indicator`, `disabledElt`
- **Sync**: `drop`, `abort`, `replace`, `queue`, `queue first`, `queue last`, `queue all`
- **Inheritance**: `disinherit`, `inherit`
- **History**: `history`, `historyElt`
- **Other**: `preserve`, `request`, `boost`, `disable`, `ext`

#### 🔧 Selector Helpers

Type-safe helpers for HTMX extended selectors:
```typescript
import { id, clss, closest, find, next, previous } from 'fluent-html';

id("content")      // → "#content"
clss("items")      // → ".items"
closest("tr")      // → "closest tr"
find(".content")   // → "find .content"
next("div")        // → "next div"
previous("li")     // → "previous li"
```

#### 📦 60+ HTML Elements

Complete HTML5 coverage with typed attribute methods:

**New semantic elements**: `Nav`, `Aside`, `Figure`, `Figcaption`, `Address`, `Hgroup`, `Search`

**New text elements**: `H5`, `H6`, `Strong`, `Em`, `Mark`, `Small`, `Sub`, `Sup`, `Abbr`, `Cite`, `Q`, `Dfn`, `Kbd`, `Samp`, `Var`, `Br`, `Wbr`, `Bdi`, `Bdo`, `Ruby`, `Rt`, `Rp`, `Blockquote`, `Pre`, `Code`

**New list elements**: `Dl`, `Dt`, `Dd`, `Menu`

**New table elements**: `Tfoot`, `Caption`, `Colgroup`, `Col` (with typed `ThTag`/`TdTag` supporting `colspan`/`rowspan`/`scope`)

**New form elements**: `Fieldset`, `Legend`, `Datalist`, `Output`, `Optgroup`

**Enhanced Input**: `step`, `pattern`, `minlength`, `maxlength`, `autocomplete`, `autofocus`, `checked`, `disabled`, `readonly`, `multiple`, `list`

**Enhanced Textarea**: `minlength`, `maxlength`, `wrap`, `autocomplete`, `autofocus`, `disabled`, `readonly`

**Enhanced Button**: `formaction`, `formmethod`, `disabled`

**New interactive elements**: `Details` (with `open`, `name`), `Summary`, `Dialog` (with `open`)

**New media elements**: `Audio`, `Source`, `Track`, `Picture`, `Canvas`, `Svg` + SVG primitives (`Path`, `Circle`, `Rect`, `Line`, `Polygon`, `Polyline`, `Ellipse`, `G`, `Defs`, `Use`, `Text`, `Tspan`)

**New embedded elements**: `Iframe` (with `sandbox`, `allow`, `loading`), `ObjectEl`, `Embed`, `MapEl`, `Area`

**New document elements**: `Title`, `Meta` (with `charset`, `name`, `content`, `httpEquiv`, `property`), `Link` (with `rel`, `href`, `type`, `media`, `sizes`, `crossorigin`, `integrity`, `as`), `Style`, `Base`, `Noscript`

**Enhanced Script**: `src`, `async`, `defer`, `integrity`, `crossorigin`, `nomodule`

**New data elements**: `Time` (with `datetime`), `Data` (with `value`), `Progress` (with `value`/`max`), `Meter` (with `value`/`min`/`max`/`low`/`high`/`optimum`), `Slot` (with `name`)

#### 🔄 Control Flow Improvements

- `ForEach1` - iteration with index
- `ForEach2` - range iteration (0 to n)
- `ForEach3` - range iteration (start to end)
- `Repeat` - repeat content n times

### 🔧 Improvements

- **Zero dependencies** - pure TypeScript
- **Cleaner HTML output** - no unnecessary whitespace
- **Better TypeScript support** - stricter types throughout
- **Smaller bundle size** - optimized render function
- **229 tests** - comprehensive test coverage

### 📦 Migration Guide

1. **Update element syntax:**
   ```typescript
   // Old
   Div({ class: "container", child: P({ child: Text("Hello") }) })
   
   // New
   Div(P("Hello")).setClass("container")
   ```

2. **Update HTMX usage:**
   ```typescript
   // Old
   Button({ htmx: { method: "post", endpoint: "/api" }, child: Text("Submit") })
   
   // New
   Button("Submit").setHtmx(hx("/api", { method: "post" }))
   ```

3. **Update control flow:**
   ```typescript
   // Old
   ForEach(items, item => Li({ child: Text(item) }))
   
   // New
   ForEach(items, item => Li(item))
   ```

4. **Text nodes no longer need `Text()` wrapper:**
   ```typescript
   // Old
   P({ child: Text("Hello") })
   
   // New
   P("Hello")
   ```

### 🐛 Bug Fixes

- Fixed inconsistent attribute ordering
- Fixed whitespace in rendered output
- Fixed boolean attribute rendering

---

## [2.x] - Previous Versions

See [GitHub releases](https://github.com/JT-Digital-d-o-o/fluent-html/-/releases) for previous version history.