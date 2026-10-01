---
id: RFC-D-01
track: D
title: "Dynamic-arg tool messages stop prescribing staticManifest and print a fix that clears the error, per argument shape"
resolves: [F-D-504, F-C-203]
cluster: C-02
api_surface:
  - "eslint-plugin-fluent-html no-dynamic-typed-styling-arg: dynamicArg text rewritten; new messageIds conditional, matchValue, lookup, unitAmount (detection unchanged)"
  - "eslint-plugin-fluent-html no-dynamic-class-argument: dynamicArg text rewritten; new messageIds conditional, lookup, fragment, hookClass (detection unchanged)"
  - "fluent-html-tailwind-extractor generateFluentSafelist: unresolved-call error text (safelist.ts:58-59)"
  - "fluent-html-tailwind-extractor ExtractorOptions.staticManifest: JSDoc only (safelist.ts:8-9, :29-32; extract.ts:209, :254)"
enforcement: lint
error_text: ".bg(MatchValue(tone, { ok: \"success\", err: \"…) has a non-literal argument; the safelist extractor reads literals only, so the css build fails on this call. Branch instead: .whenMatch(tone, { ok: t => t.bg(\"success\"), err: t => t.bg(\"danger\") })"
prose_deleted:
  - "guidelines/web-development/CLAUDE.md:72"
  - "guidelines/web-development/fluent-html.md:349"
  - "fluent-html/CLAUDE.md:72"
guideline_delta: -3
lockstep: [eslint, extractor, guidelines, template]
codemod: none
codemod_dry_run: "n/a"
dims_predicted: { error-quality: +0.5, decision-closure: +0.5, prior-alignment: +0.25, context-economy: +0.1 }
impact: 2
effort: M
ships_to: 8.1.x
depends_on: []
status: proposed
---

# RFC-D-01: Dynamic-arg tool messages stop prescribing staticManifest and print a fix that clears the error, per argument shape

Scratch root for every command below: `$R = <scratch>/wave2/RFC-D-01`.
Prototype: `$R/fluent-html-eslint-plugin` and `$R/fluent-html-tailwind-extractor` (rsync of the repos, node_modules symlinked, built in place); diffs in `$R/*.src.diff`, `$R/*.test.diff`. Probe app: `$R/app` (node_modules of the wave1/D5 scaffold: fluent-html 8.1.0 tgz, ESLint 10.11.0, TS 6.0.3, template `src/app/theme.ts` and `src/shared/stylers.ts`).

## Problem

Three tools stop an author who passes a non-literal argument to a styling method, and all three name a remedy that does not clear the error:

| Tool | Text today | What the remedy does |
|---|---|---|
| extractor `safelist.ts:59` | "Inline the literal, or add the token to staticManifest (defineTheme())." | `defineTheme()` has no `staticManifest`: TS2353 (re-run: `$R/app`, `defineTheme({ colors: {...}, staticManifest: [...] })` -> `TS2353: Object literal may only specify known properties, and 'staticManifest' does not exist in type 'ThemeSpec'.`; a second argument -> `TS2554: Expected 1 arguments, but got 2.`). The extractor option of that name adds classes (`safelist.ts:81`) and the throw at `:84-86` fires anyway: 7/7 probe calls throw with and without `staticManifest: [all 5 tokens]` (`npx tsx scripts/extract.before.mts src/app/probe/typed.probe.ts`). |
| `no-dynamic-typed-styling-arg.ts:240` | "...or add the token to staticManifest (defineTheme())." | same |
| `no-dynamic-class-argument.ts:30` | "...styles can silently disappear in production. Use .when(...) / Match(...) ..., or defineTheme's staticManifest for token-driven values." | same; and for the prior's class constants the disappearing claim is false (F-C-203: 0 of 93 and 0 of 88 tokens missing from the compiled CSS), while the shape that fits a shared style (`.apply(styler)`) is never named |

The always-loaded prose repeats it: `guidelines/web-development/CLAUDE.md:72`, `fluent-html/CLAUDE.md:72`, `guidelines/web-development/fluent-html.md:349`; plus `fluent-html-tailwind-extractor/README.md:66, :82`, `fluent-html-eslint-plugin/README.md:125, :128, :164-166, :170`, `fluent-html-tailwind-extractor/CHANGELOG.md:10`.

Fleet reach (`bash $R/fleet.sh`, 15 canonical 8.1.0 repos, `.claude/`, worktrees, node_modules, dist excluded): 15/15 carry the staticManifest sentence in 3 vendored files each (`CLAUDE.md`, `.ai/web-development/CLAUDE.md`, `.ai/web-development/fluent-html.md`); 15/15 run the extractor with `onUnresolved: "error"`; 14/15 keep `DYNAMIC_SAFELIST` empty. The one non-empty list (everyframe `scripts/build-safelist.ts:36-39`: `opacity-0`, `pointer-events-none`) holds classes toggled by a client script, not tokens behind a fluent call: the real job of the option.

## Instruction-set check

Solved one layer up; the tools and prose point away from it.

- `projects-template/templates/full-stack/scripts/build-safelist.ts:19-34`: `DYNAMIC_SAFELIST` is "Intentionally EMPTY ... Make the class literal instead": `.when()` branches, "an exhaustive apply-fn map: `Record<Status, (t) => t.bg("…")>`", sizing configured from outside.
- `templates/full-stack/src/shared/stylers.ts:26-28`: `stylers<K>()` / `Styler` / `StylerFor`; its JSDoc names `.apply(tone[level])` as the replacement for `.addClass(record[var])`.
- `templates/full-stack/src/shared/ui/chart/chart.tokens.ts:1-9`: chart colours are a `stylers` map "for one concrete reason: the Tailwind extractor runs with `onUnresolved: "error"`".
- `templates/web/scripts/build-safelist.ts:24-26`: `staticManifest: ["block!"]` for "the drawer's open class ... (a behavior option, not a fluent call)".
- Fleet (`bash $R/styler.sh`): 15/15 canonical repos ship `src/shared/stylers.ts`; 1,153 `Styler`/`StylerFor`/`stylers<` references; 3,740 `.apply(` calls.

No library primitive is missing: `.when`, `.whenElse`, `.whenMatch`, `.apply` and `.setStyle` exist in 8.1.0 (`dist/src/core/tag.d.ts:169-217`, `:107`). The change is to the two tools that own the error and the prose that mirrors it. Lane `no-change` does not apply: 3 tool messages and 3 canonical prose lines are wrong today.

## Proposed change

### 1. `no-dynamic-typed-styling-arg` (eslint-plugin-fluent-html)

Detection unchanged: the same nodes are reported before and after (14/14 probe calls across both rules, 16/16 pp1+pp2 sites). The report picks a message by the argument's shape; every message drops `staticManifest`.

```ts
messages: {
  dynamicArg:  "{{call}} has a non-literal argument; the safelist extractor reads literals only, so the css build fails on this call. Pass a literal, or branch with one literal per branch: .when(cond, t => t.{{method}}({{slot}})), .whenElse(cond, t => …, t => …), .whenMatch(value, { key: t => t.{{method}}({{slot}}) }).",
  conditional: "{{call}} has a non-literal argument; the safelist extractor reads literals only (a ternary included), so the css build fails on this call. Branch instead: {{rewrite}}",
  matchValue:  "{{call}} has a non-literal argument; the safelist extractor reads literals only, so the css build fails on this call. Branch instead: {{rewrite}}",
  unitAmount:  "{{call}} has a non-literal argument; the safelist extractor reads literals only, so the css build fails on this call. An amount computed at runtime goes in an inline style: .setStyle(`{{property}}: ${{{amount}}}{{unit}}`); a fixed set of sizes branches with one literal each: .whenMatch(size, { sm: t => {{sample}}, … }).",
  lookup:      "{{call}} has a non-literal argument; the safelist extractor reads literals only, so the css build fails on this call. Branch on the key instead: {{rewrite}}",
}
```

Shape rules (`{{rewrite}}` is rendered from the call's own source):

- `cond ? A : B`, both static -> `.whenElse(test, t => t.m(A), t => t.m(B))`; `B` is `undefined` -> `.when(test, t => t.m(A))`. The test stays verbatim only when it is boolean (syntactically: comparison, `!`, `Boolean()`; or, with parser services, typed `boolean`). Otherwise it is printed as `Boolean(test)`: `.whenElse` branches on `!= null` and a ternary on truthiness, so a verbatim `error` would flip `""` (measured: `$R/app/scripts/cf.mts`, `""` -> verbatim DIFF, `Boolean()` same).
- `MatchValue(v, { k: lit, … }, def?)`, all static -> `.whenMatch(v, { k: t => t.m(lit), … })`. With a default over a finite literal union (parser services), the default is spelled out per missing member, so the rewrite does not trip `match-subset-default` (which it did before this step: 1 error under the template config). An open subject keeps `, t => t.m(def)`.
- `MAP[key]` -> `.whenMatch(key, { … })`, with the cases read from a same-file `const MAP = { k: "lit" }` (through `as const` / `satisfies`), else `{ key: t => t.m(…), … }`.
- Unit overload with a runtime amount (`.w("px", n)`, 30 methods: w/h/min*/max*/p*/m*/gap/inset/top/right/bottom/left/text/leading/tracking/underlineOffset) -> `.setStyle()`, the guideline's runtime-value hatch (`guidelines/web-development/CLAUDE.md:191`).
- Anything else -> `dynamicArg`.

### 2. `no-dynamic-class-argument` (eslint-plugin-fluent-html)

Detection and error level unchanged (16/16 pp1+pp2 sites still reported; the raw-class policy stands). The "silently disappear" claim is kept only for the shape where it is true (a class name assembled from pieces).

```ts
messages: {
  dynamicArg:  ".{{callee}}({{argText}}) passes a class string held in code: no lint rule can check it, and a class name assembled at runtime is missing from the CSS. Make the shared style a styler (a function that applies typed methods to the tag) and apply it: .apply({{name}}); branch the part that varies with .when()/.whenElse().",
  conditional: ".{{callee}}({{argText}}) picks a class string with a ternary. Make each branch a styler and branch on the condition: .whenElse({{test}}, {{thenBranch}}, {{elseBranch}}).",
  lookup:      ".{{callee}}({{argText}}) looks a class string up by key. Make {{map}}'s values stylers and .apply({{map}}[{{key}}]), or branch: .whenMatch({{key}}, { key: t => t.…, … }).",
  fragment:    ".{{callee}}({{argText}}) assembles a class name at runtime; Tailwind generates only classes it finds whole in source, so this style is missing from the CSS. Branch with one literal per case: .whenMatch({{subject}}, { key: t => t.…(\"…\"), … }).",
  hookClass:   ".cssClass({{argText}}) takes a computed class. Pass the hook class as a literal so lint can check it is not a Tailwind utility: .cssClass(\"js-…\"), branched with .when()/.whenElse() if it varies.",
}
```

`{{name}}` derives from the argument (`LABEL_CLASSES` -> `label`, `controlClass(error)` -> `control`, `` `${CELL_CLASS} …` `` -> `cell`). `lookup` also resolves one level of `const` alias (`const { classes } = STATUS_BADGES[status]`), which is how both prior runs wrote their badge. `fragment` = an interpolation glued to token text (`` `bg-${c}` ``) or a `+` concatenation. The message names no type annotation: the guideline types presets as `Styler` (`guidelines/web-development/CLAUDE.md:231`) and outside the template `(t: Tag) => …` compiles too (`Button("Go").apply((t: Tag) => …).setType("submit")`: tsc 0 errors, `$R/app/src/app/probe/chain.probe.ts`), so the message stays true in both.

### 3. Extractor (`fluent-html-tailwind-extractor`, rides the unreleased 3.0.0)

```
fluent-safelist: N fluent call(s) pass a non-literal argument; the scanner reads literals only, and a class it cannot read is missing from the CSS (Tailwind v4 renders it unstyled).
Pass a literal, or branch with one literal per branch: .when(cond, t => t.bg("…")), .whenElse(cond, t => …, t => …), .whenMatch(value, { key: t => t.bg("…") }). An amount computed at runtime goes in .setStyle(). eslint rule fluent-html/no-dynamic-typed-styling-arg names the fix for each call.
  ✗ unresolved .bg(MatchValue(tone, { ok: "success", err: "danger" })) in src/app/probe/typed.probe.ts
```

`ExtractorOptions.staticManifest` JSDoc becomes "Classes that no fluent call emits (a behavior option, a client script), always listed. It does not clear an unresolved call." The option itself is unchanged (everyframe and templates/web use it for that job).

### 4. Regression guard (plugin CI)

The rewritten `test/rule.test.js` asserts the new messages (10 invalid class cases, 16 invalid typed cases, full message text asserted on 13 of them); `test/type-aware.test.js` adds 4 type-aware cases (boolean test verbatim, string test wrapped, finite-union default expanded, open default kept). F-C-203's "compile every API a message names" is covered by asserting the rendered rewrites; the end-to-end compile of the rewrites is `$R/app/scripts/apply-rewrites.mjs` (below), which can move into the template's CI if curation wants it.

## Before -> after

Real shapes from the findings (`$R/app/src/app/probe/typed.probe.ts`, `classes.probe.ts`; F-D-504's `.bg(MatchValue(...))` and the pp1/pp2 sites of F-C-203), linted with the template's rule levels (`eslint.before.mjs` = packed 4.1.0, `eslint.after.mjs` = prototype):

| Site | Before (4.1.0, verbatim tail) | After (prototype, verbatim) |
|---|---|---|
| `.bg(MatchValue(tone, { ok: "success", err: "danger" }))` | "...Inline the literal (branch with .when()/.whenElse()/.whenMatch() or Match, one literal per branch), or add the token to staticManifest (defineTheme())" | ".bg(MatchValue(tone, { ok: "success", err: "…) has a non-literal argument; the safelist extractor reads literals only, so the css build fails on this call. Branch instead: .whenMatch(tone, { ok: t => t.bg("success"), err: t => t.bg("danger") })" |
| `.bg(BG[status])` | same tail | "...Branch on the key instead: .whenMatch(status, { active: t => t.bg("success"), closed: t => t.bg("surface-2") })" |
| `.bg(active ? "primary" : "surface")` | same tail | "...(a ternary included), so the css build fails on this call. Branch instead: .whenElse(active, t => t.bg("primary"), t => t.bg("surface"))" |
| `.border(error ? "danger" : "line")` | same tail | "...Branch instead: .whenElse(Boolean(error), t => t.border("danger"), t => t.border("line"))" |
| `.bg(MatchValue(tone, { ok: "success" }, "surface"))` | same tail | "...Branch instead: .whenMatch(tone, { ok: t => t.bg("success"), err: t => t.bg("surface") })" |
| `.w("px", width)` | same tail | "...An amount computed at runtime goes in an inline style: .setStyle(`width: ${width}px`); a fixed set of sizes branches with one literal each: .whenMatch(size, { sm: t => t.w("px", 120), … })." |
| `.addClass(LABEL_CLASSES)` | ".addClass(LABEL_CLASSES) is invisible to the safelist extractor — styles can silently disappear in production. Use .when(...) / Match(...) with literal classes per branch, or defineTheme's staticManifest for token-driven values" | ".addClass(LABEL_CLASSES) passes a class string held in code: no lint rule can check it, and a class name assembled at runtime is missing from the CSS. Make the shared style a styler (a function that applies typed methods to the tag) and apply it: .apply(label); branch the part that varies with .when()/.whenElse()." |
| `.addClass(error ? CONTROL_ERROR_CLASSES : CONTROL_CLASSES)` | same as above | "...picks a class string with a ternary. Make each branch a styler and branch on the condition: .whenElse(Boolean(error), controlError, control)." |
| `.addClass(STATUS_BADGES[s])` | same | "...looks a class string up by key. Make STATUS_BADGES's values stylers and .apply(STATUS_BADGES[s]), or branch: .whenMatch(s, { key: t => t.…, … })." |
| `` .addClass(`bg-${color}`) `` | same | "...assembles a class name at runtime; Tailwind generates only classes it finds whole in source, so this style is missing from the CSS. Branch with one literal per case: .whenMatch(color, { key: t => t.…("…"), … })." |

Executed checks on the remedies (all in `$R/app`):

- **The printed rewrites clear every layer.** `node scripts/apply-rewrites.mjs` substitutes each printed `Branch instead:` rewrite into the source mechanically: 5 applied (2 generic/unit messages left to the author); `npx tsc -p .` 0 errors in the rewritten file; full template ESLint config (`eslint.config.mjs`: 26 fluent-html rules + 4 template rules) on it: 0 messages besides the 2 untouched lines.
- **Rewrites are byte-identical.** `npx tsx scripts/diff.mts`: 13/13 renders identical across every input of p1/p2/p3/p4/p6/p7 (incl. `""`, `"x"`, `undefined` for the wrapped test). `.w("px", 180)` -> `class="w-[180px]"` vs `style="width: 180px"` (the intended move to an inline style).
- **Hand-applied class remedies compile, lint and extract.** `remedy.probe.ts` (`(t: Tag) =>` form) and `fleet-remedy.probe.ts` (`Styler` + `stylers<>()` form): tsc 0 errors, full template ESLint config 0 messages, extractor (`onUnresolved: "error"`, no `theme`) passes and lists `bg-success/10 border-danger border-line-strong font-medium rounded-control text-sm text-success text-text text-warning w-full …`. The class remedies swap palette literals for theme tokens because the template's closed colour union rejects `slate-700`/`red-400` (tsc TS2345 x6 + TS2769 x2 on the first attempt); that is the typed surface doing its job.
- **Prior sites.** pp1+pp2 (`src/app/pp1`, `pp2`, copied from wave1/C2): before 16/16 `dynamicArg`; after 16 reports = 13 `dynamicArg` (styler + `.apply`), 2 `lookup` (`STATUS_BADGES[status]`, through the destructured alias), 1 `conditional` (`.whenElse(Boolean(error), controlError, control)`); the same 13/2/1 split F-C-203 counted by hand.
- **Extractor.** Same 7 probe calls throw with the new text (`$R/extract-after.txt`); remedy files pass. Extractor suite 55/56 both before and after (the 1 failure, `extract.test.ts:113` "filters, transforms, list-style ...", pre-exists on the untouched repo).
- **Plugin suites.** `node test/rule.test.js` 430 passed / 0 failed; `node test/type-aware.test.js` 23 / 0; `node test/derivation.test.js` 14/14.
- **Message size.** Mean 288 chars (14 messages, before) -> 255 chars (after).

## Enforcement

Lint, the strongest feasible layer. A type cannot tell `.bg("primary")` from `.bg(x)` where `x: "primary" | "surface"` (both compile today, p3/p4), so the type layer is out. Lint runs before the build and already reports every one of these nodes at error in the template config; the build-time throw stays as the backstop. Verbatim first diagnostic for F-D-504's shape:

```
.bg(MatchValue(tone, { ok: "success", err: "…) has a non-literal argument; the safelist extractor reads literals only, so the css build fails on this call. Branch instead: .whenMatch(tone, { ok: t => t.bg("success"), err: t => t.bg("danger") })
```

The one-shot fix it names is the rewrite itself; for F-C-203's preset shape it is `.apply(label)`.

## Replaces (converge)

- Removes the second remedy path (`staticManifest` for a variable-driven token) from 3 messages, 3 canonical prose lines and 7 README/CHANGELOG spots. One remedy family remains: a literal per branch (`.when`/`.whenElse`/`.whenMatch`), a styler applied with `.apply`, `.setStyle` for a runtime amount. `staticManifest` keeps one job: classes no fluent call emits.
- Deleted lines (whole line each; the lint now carries the fix, and `fluent-html.md:337` already shows `onUnresolved: "error"` in the wiring snippet):
  - `guidelines/web-development/CLAUDE.md:72` ("Literal args into typed styling methods ... belongs in defineTheme()'s staticManifest. <!-- enforced: lint ... -->")
  - `guidelines/web-development/fluent-html.md:349` ("onUnresolved: "error" (default) ... Cover variable-driven tokens via defineTheme's staticManifest.")
  - `fluent-html/CLAUDE.md:72` ("No dynamic class interpolation ... put it in defineTheme()'s staticManifest so the extractor still emits it.")
- Rewritten in place, net 0: `fluent-html-tailwind-extractor/README.md:66` (fix line -> the new remedy sentence), `:82` (option comment -> "classes no fluent call emits"); `fluent-html-eslint-plugin/README.md:125`, `:128` (table rows lose "or staticManifest"), `:164-166` (example message -> the new `LABEL_CLASSES` text in 3 lines), `:170` (bullet: "a class name assembled at runtime is missing from the CSS; a constant is a raw-class bypass"); `fluent-html-tailwind-extractor/CHANGELOG.md:10` ("cover them with `staticManifest`" -> "fail the build under the default policy").
- Net `guideline_delta`: -3 (canonical). On re-vendor: projects-template -3 (`CLAUDE.md:72`, `.ai/web-development/CLAUDE.md:72`, `.ai/web-development/fluent-html.md:349`), and the same 3 lines in each of the 14 other canonical repos on their next guideline sync.

## Lane & migration

8.1.x. The fluent-html package changes no code, no type and no emitted byte; only `fluent-html/CLAUDE.md` loses a line. The plugin change is message text plus new messageIds with the same reported node set and severity (plugin patch, 4.1.1); no consumer config or `eslint-disable` comment names a messageId. The extractor change is error text and JSDoc inside the unreleased 3.0.0. No codemod: nothing a consumer wrote changes meaning.

Publish order: plugin 4.1.1 and extractor text (independent), then guidelines -2 lines + `fluent-html/CLAUDE.md` -1, then projects-template re-vendors the guidelines and bumps the plugin pin.

## Guardrail check (§5, 1-13)

1. Zero runtime deps: N/A (lib untouched; plugin uses the consumer's parser services, no new import).
2. Sync hot path: N/A (no render code).
3. Escape by default: N/A.
4. Type-safety: pass. The type-aware branches (boolean test, union members) read the checker directly on the reported node and fall back to the safe syntactic form without a program; nothing infers through a generic wrapper call.
5. Instruction set: pass. Names user-land stylers and existing primitives; adds no lib API.
6. Pure core: N/A.
7. Converge: pass. Deletes the manifest path from every message and prose line; one remedy family remains.
8. Naming: pass. Names only existing `.when`/`.whenElse`/`.whenMatch`/`.apply`/`.setStyle`/`.cssClass`.
9. Class-string contract: N/A. No class-emitting change, no vocab row; `UNIT_PROPERTY` keys are the unit-overload methods listed in `guidelines/web-development/CLAUDE.md` § Arbitrary values.
10. Runtime-grammar contract: pass. No htmx names; the rewrites emit the same classes as the code they replace (13/13 byte-identical), so the Tailwind oracle result is unchanged.
11. Breaking = codemod-first: N/A (not breaking).
12. Enforcement over prose: pass, -3 canonical lines.
13. Append-only styling: N/A.

## Scorecard prediction

- **Error quality +0.5.** 3/3 tool messages name only remedies that clear them (today 3/3 name one that does not). 5 of 7 typed probe shapes print an exact rewrite that compiles and lints clean when pasted (5/5 measured); 16/16 prior class sites get a shape-specific fix instead of one generic text.
- **Decision-space closure +0.5.** The extractor, both rules, the guideline and the template's `build-safelist.ts` now agree on one answer (literal branches / stylers); today two tools and the guideline disagree with the template.
- **Prior alignment +0.25.** The prior's class-constant presets (13 of 16 F-C-203 sites) are redirected to `.apply(styler)`, the sanctioned preset idiom, in one message.
- **Context economy +0.1.** 1 always-loaded CLAUDE.md line gone in every repo (183 chars in guidelines, 185 in fluent-html), 1 reference line gone (232 chars); message mean -33 chars.

## Alternatives considered

- **Message-only patch (S).** Delete the staticManifest clause and keep one generic text per rule. Cheaper (3 message strings + 3 test assertions), but the generic text was what F-C-207's K6 row and F-C-203 measured as "no fix"; it leaves `MatchValue` -> `whenMatch` and the ternary truthiness trap for the author to work out. Kept as the fallback if curation wants S.
- **Make `staticManifest` work** (skip the throw when a theme manifest covers the call's prefix). Rejected: `.bg(x)` where `x` holds `"success/10"` or a palette literal is not in the token cross-product, so the build would pass and the class would be missing: the silent failure the `"error"` default exists to stop.
- **Add `staticManifest` to `ThemeSpec`.** Rejected: a token list in the theme cannot clear an unresolved call either (same reason), and it reopens the tokens-only `defineTheme` guardrail.
- **Autofix the rewrites.** Deferred: the ternary and `MatchValue` rewrites are exact (13/13 byte-identical), but `eslint --fix` already raised tsc errors on the prior apps (F-C-201: 3->27, 4->30); a fix that restructures a chain should ship as a suggestion first.
- **Name `Styler` in the class message.** Rejected: 15/15 canonical repos have it, but the plugin is public and outside the template `Styler` is TS2304; the message names the shape and leaves the annotation to the local convention.

## Open questions (for curation)

1. **Retire the `theme` force-list?** `themeToManifest` lists every token under every prefix "covering tokens used behind variables" (`theme.ts:5-9`), the safety net this RFC stops pointing at, and `onUnresolved: "error"` (15/15) makes it unreachable. Measured on the scaffold (`$R/cssmeasure`, `@tailwindcss/postcss` with `optimize`): 376 forced classes; compiled CSS 58,630 bytes with `theme` vs 18,754 bytes with `themeToCss` + scan only (+39,876 bytes, 3.1x). everyframe already opts out for this reason (`scripts/build-safelist.ts:41-44`, "~90 KB"). 0 of 16 (both templates + the 14 other canonical repos) depend on `@jtdigital/ui`, the one case the list would still cover (a package's classes outside the scanned `src/**`). A behaviour change in the unreleased extractor 3.0.0, so a separate RFC.
2. **Stale preset guidance.** `guidelines/web-development/CLAUDE.md:231` says a hand-written `(t: Tag) => …` "widens the return and breaks the chain"; in 8.1.0 `.apply()` returns `this` (`tag.d.ts:217`) and the chain compiles (`chain.probe.ts`, tsc 0). `templates/full-stack/src/shared/stylers.ts:21-22` still shows pre-7 names (`.background()`, `.textColor()`). Not in this cluster; both shape what an agent writes after this message.
3. **F-D-508** (the lib's own `MatchValue` JSDoc example, `src/control/match-value.ts:16`, trips both tools): the `matchValue` rewrite printed here is the replacement example.
4. **F-D-604** (trailing-comma calls reported as unresolved on literal args): such a call gets the new "pass a literal" text while already passing one; that finding's extractor fix removes the false row.
5. Side observation from the baseline run: `no-tailwind-in-raw-class` offers the autofix `Replace with: .bg("")` for `` .addClass(`bg-${color}`) `` (`$R/app`, before config, `classes.probe.ts:14`), an empty-class rewrite. Out of scope here.
