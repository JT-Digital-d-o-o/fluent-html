---
rfc: RFC-A-02
lens: instruction-set
verdict: survives-with-changes
confidence: 0.8
killer_objection: "As written, the module breaks the template's own convention for eslint-rules/. tests/ci-wiring.test.ts:189-195 requires every ./eslint-rules/*.mjs the shared config imports to be registered in the `template` rule map. A config-factory default export is not registered, so `pnpm run verify` goes red at test:setup (1 failed / 19 passed). The factory also takes over the core no-restricted-syntax/no-restricted-imports slots, which flat config replaces wholesale: a user block after it deletes the htmx ban, and one before it is deleted. This is a second way to write template-local lint (guardrail 7). Required change 1 rebuts it, and its prototype passes 20/20."
guardrail_killer: 7
required_changes:
  - "Ship templates/shared/eslint-rules/no-htmx-without-runtime.mjs as a rule module shaped like its 4 siblings: the default export is `{ meta: { type: \"problem\", schema: [], messages: { noHtmx: <NO_HTMX> } }, create(context) }`, plus a named export `servesHtmx(configUrl: string | URL): boolean` that returns existsSync(new URL(\"./public/js/htmx.min.js\", configUrl)). Register it as `\"no-htmx-without-runtime\": noHtmxWithoutRuntime` in the `template` rule map of the shared, full-stack and web configs. Enable it with one trailing block: `...(servesHtmx(import.meta.url) ? [] : [{ files: [\"src/**/*.ts\"], rules: { \"template/no-htmx-without-runtime\": \"error\", \"fluent-html/prefer-htmx-api\": \"off\", \"template/no-manual-hx-headers\": \"off\" } }])`. Do not use no-restricted-syntax or no-restricted-imports. Update api_surface and error_text: the rule id becomes template/no-htmx-without-runtime."
  - "The rule must keep at least the RFC's coverage: member calls named setHtmx, hxGet or hxPost; addAttribute whose first argument is a string literal or a substitution-free template literal starting with hx- (the RFC's selector misses the template literal); named imports hx, Partial, HtmxConfig and hxResponse from fluent-html; and a namespace import of fluent-html that reaches those names (the RFC reports `import * as F` at 1:8)."
  - "Turn fluent-html/prefer-htmx-api off in the gated block. In a web scaffold it currently warns 'Use the HTMX API (hxGet, hxPost, setHtmx)' on the same line the new error flags."
  - "Turn template/no-manual-hx-headers off in the gated block. In its place, the new rule reports string-literal HX-* header names written through reply.header/reply.headers, with a message that names reply.redirect(route.resolve()) or a full-page renderView. Its current fix ('Use hxResponse(view)….build()' or '.submit(route, …)') points to a banned import and a verb that templates/web does not have."
  - "In src/index.ts, the 400 branch reuses the registry's SEO: Layout({ seo: { ...pages[\"/contact\"].seo, noIndex: true }, config: siteConfig, children: ContactPage(siteConfig, errors) }), with `pages` imported from ./pages/index.js, instead of restating title: \"Contact\"."
  - "Add 3 entries to the Executed table: (a) `pnpm run test:setup`, or at least ci-wiring + eslint-config-parity, green; (b) slot-order probes with a user no-restricted-imports block before and after the gated block, where both bans still report; (c) a scaffold-config lint of an addAttribute(\"hx-get\") probe showing 0 prefer-htmx-api warnings."
executed:
  - cmd: "vitest run tests/ci-wiring.test.ts tests/eslint-config-parity.test.ts (scratch copy, unmodified)"
    output: "Tests 20 passed (20)"
  - cmd: "same, after RFC steps 4-5 applied verbatim"
    output: "1 failed | 19 passed: ci-wiring > registers every imported rule in the plugin's rule map: expected [ 'no-htmx-without-runtime' ] to deeply equal []"
  - cmd: "npx eslint src (web, RFC configs, shipped source)"
    output: "106:6, 135:6, 222:6 error NO_HTMX no-restricted-syntax; 3 errors (RFC reproduced)"
  - cmd: "npx eslint -c eslint.scaffold.mjs src/zz-probe.ts (shared config, as a web scaffold receives it)"
    output: "7:3 warning prefer-htmx-api 'Use the HTMX API (hxGet, hxPost, setHtmx)' + 7:22 error NO_HTMX on the same line; addAttribute(`hx-get`) 0; addAttribute(constName) 0; namespace import 1:8 flagged"
  - cmd: "npx eslint -c eslint.scaffold.mjs src/zz-probe3.ts (reply.header(\"HX-Redirect\"))"
    output: "3:23 error template/no-manual-hx-headers 'Use hxResponse(view)….build() ... or .submit(route, …)'"
  - cmd: "slot-order probe, user no-restricted-* block before / after the factory"
    output: "before: NO_HTMX 2, user ban 0; after: user ban 1, NO_HTMX 0"
  - cmd: "grep -c no-restricted-(syntax|imports) in 15 shared-derived fleet configs"
    output: "website-sales-funnel-automation-system 2, gzs/stem-50 1, other 12 repos 0"
  - cmd: "fleet eslint.config.mjs importing ./eslint-rules/ x public/js/htmx.min.js x git ls-files"
    output: "15/15 vendor it; tracked in 14 git repos (test/kjkljkl is not a repo); templates/web and shared: none"
  - cmd: "node fleet-served.mjs (rerun)"
    output: "61 packages, 58 serving, 3 not serving, 1 at risk: templates/web setHtmx 3"
  - cmd: "grep hx emitters / form-action helpers in packages/ui/src"
    output: "0 / 0; form/ = Button, FormField, Select, TextInput, Textarea; web does not depend on @jtdigital/ui"
  - cmd: "grep no-htmx|noHtmx|without-runtime|ships no htmx in projects-template + fleet"
    output: "0 existing checks (comment hits only)"
  - cmd: "prototype registered rule + servesHtmx gate: ci-wiring + parity"
    output: "Tests 20 passed (20)"
  - cmd: "prototype: eslint web shipped / scaffold probe / slot-order probes / full-stack"
    output: "same 3 diagnostics as template/no-htmx-without-runtime; prefer-htmx-api warning gone; template literal caught; both orders: user ban 1 + NO_HTMX 2; full-stack 0, 5 blocks"
  - cmd: "RFC fixed source + prototype: eslint . --max-warnings=0; vitest smoke"
    output: "exit 0; smoke 2 passed"
  - cmd: "sed -n 144,145p guidelines/web-development/htmx.md; grep templates/web|web template|no htmx"
    output: "native-pair passage present; 0 hits (guideline delta 0 holds)"
---

# Verdict: RFC-A-02, instruction-set lens

> You are an ADVERSARY. Kill this RFC through the instruction-set lens. Default to `reject` under
> uncertainty. Reading code is not verification: execute.

## What I executed

Scratch: `wave3/RFC-A-02-instruction-set/ptroot/` holds a copy of projects-template without node_modules, .git, .claude or /project, with node_modules symlinked to the real install. `probes/` holds the probe files.

**1. A solution one layer up, in the library and in packages/ui.** None exists, and none is needed.
- `node fleet-served.mjs` (rerun) gives 61 packages, 58 serving htmx, 3 not serving. Only `templates/web` emits htmx, through 3 `setHtmx` calls.
- `packages/ui/src` has 0 hx emitters and 0 form-action helpers. Its `form/` folder holds Button, FormField, Select, TextInput and Textarea, with no Form wrapper. templates/web does not depend on `@jtdigital/ui`.
- A grep for `no-htmx|without-runtime|ships no htmx` over projects-template and the 14 fleet repos finds 0 existing checks, only comments (`web/src/shared/layout.ts:73`, `runtime.ts:2`).
- The fix the RFC uses is existing guidance: `guidelines/web-development/htmx.md:144-145` shows the native pair. A grep of the guidelines for `templates/web|web template|no htmx` returns 0 hits, so the guideline delta of 0 holds.

On guardrail 5, the RFC changes 0 library bytes, which is what this lens asks for.

**2. A solution one layer up, in the template's own lint layer.** One exists, and the RFC departs from it.
- `templates/shared/eslint-rules/` holds 4 rule modules (`{ meta, create }`), registered under a local `template` plugin. `tests/ci-wiring.test.ts:189-195` enforces that convention: every `./eslint-rules/*.mjs` the shared config imports must appear as `"<name>":` in the rule map.
- Baseline on the scratch copy: `vitest run tests/ci-wiring.test.ts tests/eslint-config-parity.test.ts` gives 20 of 20 passed.
- With RFC steps 4 and 5 applied verbatim, the same run gives **1 failed / 19 passed**: `registers every imported rule in the plugin's rule map: expected [ 'no-htmx-without-runtime' ] to deeply equal []`.
- That suite runs in `test:setup` (`vitest.config.ts` includes `tests/**/*.test.ts`), which is the first stage of `verify` (`package.json:17`). `verify` is CI's only entry point (`ci.yml:49`).
- The RFC's Executed table ran the parity check (3 of 3 still pass) but never ran this suite.

**3. Slot clobber.** The RFC's module puts its bans in the core `no-restricted-syntax` and `no-restricted-imports` rules. I added a user block that bans `node:child_process` and `TSNonNullExpression` through those same rules, and linted `zz-probe2.ts` under the shared config:
- **User block before the factory:** NO_HTMX reports 2 errors, and the user's ban reports **0** (silently dropped).
- **User block after the factory:** the user's ban reports 1 error, and NO_HTMX reports **0** (the htmx ban is silently dropped).
- In the fleet, 2 of the 15 shared-derived configs already use those slots for their own bans: `website-sales-funnel-automation-system` (no-restricted-imports, twice) and `gzs/stem-50` (no-restricted-syntax).

**4. Conflicting diagnostics already in a web scaffold.** I linted with the shared config, imports repointed, which is what a scaffold receives:
- `addAttribute("hx-get", …)` gets two results on one line. A warning from `fluent-html/prefer-htmx-api` says "Use the HTMX API (hxGet, hxPost, setHtmx)", and the RFC's error says that very call is banned.
- `reply.header("HX-Redirect", …)` gets `template/no-manual-hx-headers`: "Use hxResponse(view)….build() … or .submit(route, …)". The RFC bans the `hxResponse` import, and templates/web has no `.submit` verb.

**5. Coverage holes in the RFC's selectors.** `addAttribute(`hx-get`, …)` with a template literal, and `addAttribute(constName, …)`, both produce 0 diagnostics. The namespace import `import * as F` is reported (1:8).

**6. Prototype of the convention-conforming shape.** I rewrote the module as a registered `template/no-htmx-without-runtime` rule with a `servesHtmx(import.meta.url)` gate, and the gate also turns `prefer-htmx-api` off. Results:
- ci-wiring and parity: **20 of 20 passed**.
- Shipped web source: the same 3 diagnostics at `post-card.ts:106:6`, `:135:6` and `contact.ts:222:6`.
- Scaffold probe: the prefer-htmx-api warning is gone, and the template-literal `hx-get` is now caught (4 errors).
- Slot-order probes, both orders: the user ban reports 1 and NO_HTMX reports 2, so neither is lost.
- Full-stack: 0 diagnostics, 5 config blocks, and the rule is not enabled.
- With the RFC's fixed source: `eslint . --max-warnings=0` exits 0, and the smoke test passes 2 of 2.
- One gap remains in the prototype: it does not yet report the namespace import (required change 2).

**7. Fleet side effects.** 15 of 15 shared-derived fleet repos vendor `public/js/htmx.min.js`, and it is git-tracked in all 14 that are git repos (`test/kjkljkl` is not a repo). Full-stack's `layout.scripts.ts:15` loads `/js/htmx.min.js`, so the file the gate checks is the file the browser receives. The gate returns `[]` for every one of them, and 0 repos are newly flagged.

## Attack

From the instruction-set lens, the library side is clean: the RFC adds nothing to fluent-html, the eslint plugin or the extractor, which is correct for a defect in 1 of 61 packages. The attack lands one layer down, where the RFC ignores a solution the template already has.

1. **It breaks CI as written.** The folder the RFC chose is defined by a CI test as a set of registered rule modules. A config factory there turns `pnpm run verify` red. The claim "No side effects elsewhere" is false.
2. **It is a second way to do one job (guardrail 7).** The template already has one way to ship template-local lint: a rule module in the `template` plugin namespace. The RFC adds a second shape, a config factory over core rules, in the same folder. Its alternatives section rejects only "a rule in the eslint plugin" (fluent-html-eslint-plugin) and never weighs the local `template` plugin that sits right beside it.
3. **The second shape is fragile.** Core `no-restricted-*` options are replaced wholesale by any later matching block. Measured both ways: placed last, the factory drops a user's earlier ban, and a user's later ban drops the htmx ban. 2 of 15 shared-config repos already use those slots, so this is a pattern scaffold owners actually follow.
4. **It leaves two pre-existing diagnostics that point the wrong way** in exactly the projects it targets: `prefer-htmx-api` (toward setHtmx) and `no-manual-hx-headers` (toward hxResponse or .submit). An agent who follows the first diagnostic walks into the second.
5. **The 400 branch restates the registry's SEO** (`title: "Contact"`) rather than reusing `pages["/contact"].seo`, the existing page-wrapping solution in the same template.

None of these defeats the RFC's core, which is a template-only native form and link plus a check at both lint and render level. Each one has a mechanical fix, and I executed it in the prototype.

## Does it survive?

**survives-with-changes.** The diagnosis holds on every measure I reran: 3 dead emitters, 0 htmx served, 0 library change needed, and 0 fleet repos newly flagged. The lint is also the right enforcement layer. But the RFC as written fails CI and adds a second, clobberable lint shape. Implementers must apply these changes first:

1. Ship the module as a registered `template/no-htmx-without-runtime` rule with its own namespace slot:
   - The default export is a `{ meta, create }` rule object.
   - A named export `servesHtmx(configUrl)` wraps the same `existsSync(new URL("./public/js/htmx.min.js", configUrl))` test.
   - It is registered in the `template` rule map of all 3 configs.
   - It is enabled by one trailing block gated on `servesHtmx(import.meta.url)`.
   - Do not use `no-restricted-syntax` or `no-restricted-imports`. The rule id in error_text becomes `template/no-htmx-without-runtime`.
2. Keep the RFC's coverage: `setHtmx`, `hxGet` and `hxPost` member calls; `addAttribute` with a string literal or substitution-free template literal starting `hx-`; named and namespace imports reaching `hx`, `Partial`, `HtmxConfig` and `hxResponse`.
3. The gated block turns `fluent-html/prefer-htmx-api` off.
4. The gated block turns `template/no-manual-hx-headers` off, and the new rule reports string-literal `HX-*` header writes with a message that names `reply.redirect(route.resolve())` or a full-page render.
5. In the 400 branch, use `seo: { ...pages["/contact"].seo, noIndex: true }`.
6. Add 3 entries to Executed: `pnpm run test:setup` green, the two slot-order probes, and the scaffold-config prefer-htmx-api probe.

**Lane check:** no-change for fluent-html, and projects-template only. `ContactPage`'s `errors` parameter is optional, so the change is additive. Emitted bytes change only on paths that never worked. The 15 fleet repos on the shared config get `[]`. Nothing breaks a consumer.

## Guardrail check (if this lens owns one)

- **5. Instruction set:** pass. 0 library bytes change. No existing solution in the library, packages/ui or the fleet makes a library change necessary, and none is proposed.
- **7. Converge:** fails as written. The RFC adds a second shape of template-local lint beside the 4 registered rule modules and never names why the existing shape does not fit. `ci-wiring.test.ts:189` measures this: 1 failed / 19 passed. Required change 1 rebuts it, and its prototype passes 20 of 20 with identical diagnostics.
- **12. Enforcement over prose:** pass. Lint at error level plus a render backstop, with a guideline delta of 0 (grep: 0 hits).
