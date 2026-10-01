---
rfc: RFC-E-08
lens: guardrails
verdict: survives-with-changes
confidence: 0.75
killer_objection: "prefer-size's standing autofix can change what renders, and the rule cannot see when it will. Tailwind 4.3.3 orders .size-10 before .h-6/.h-10/.w-4/.w-10, so `Div().apply(card).w(\"10\").h(\"10\")` (card = w-4 h-6) gets autofixed to `.size(\"10\")`, which takes it from 40x40 to 16x24, in append-only mode and under the decided A-09 merge alike. 138 of the 420 fleet chain pairs sit on receivers a syntactic rule cannot inspect, and 17/17 units lint with --max-warnings=0. The only in-library fix, a covering-family merge, would breach guardrail 13. Measured fleet exposure today is 0 of 1,217 contexts, and scoping the autofix fixes it."
guardrail_killer: 13
required_changes:
  - "Limit prefer-size's standing autofix to safe receivers: the chain root is a fluent-html element factory and the chain has no earlier w/h/size/minW/minH/maxW/maxH/apply/when/whenElse/whenMatch/addClass/setClass/cssClass call (282 of 420 fleet chain pairs). Elsewhere (138 of 420), report with an ESLint suggestion that names the Tailwind-order hazard. Run the one-time fleet fold as a codemod through the receiver-checked $W/fold.mjs, gated on the 423/423 render-equivalence result."
  - "Remove open question 1 (covering-family merge), or mark it out of scope. It is tailwind-merge semantics beyond the decided family merge (guardrail 13), and it reopens L-036."
  - "Rewrite guidelines/web-development/fluent-html.md:65 in place from `.w(\"px\", 44).h(\"px\", 44)` to `.size(\"px\", 44)` (0 net lines). Copies at fluent-html/.ai/web-development/fluent-html.md:65 and projects-template/.ai/web-development/fluent-html.md:65 follow via guidelines:pull. Correct the RFC's 'no guideline teaches' claim."
  - "no-fluent-equivalent-in-setstyle (src/rules/no-fluent-equivalent-in-setstyle.ts:17-18, hand-coded) should emit one .size(\"px\", 44) suggestion when a single setStyle has equal width and height, not two messages that lead into prefer-size."
  - "Eslint lockstep: add prefer-size rule tests (0 today), a README.md rules-table row (prefer-foreach is at README.md:140) and a CHANGELOG entry."
  - "Correct the 'closes the one silent path' claim. `Select(Option(\"a\")).size(\"4\")` compiles and renders `<select class=\"size-4\">` with no attribute. Keep the number arm and document the residual (fleet: 1 .setSize( call across 103 Select( sites)."
executed:
  - cmd: "node $G/census.mjs"
    output: "426 equal pairs (383 literal chain, 39 unit chain, 4 variant objects) in 16/16 repos; 0 identifier-argument pairs; 0 raw size-* in class sinks; 0 square helpers (22 name hits, all local variables)"
  - cmd: "node $G/roots.cjs $G/proto"
    output: "420 chain pairs: 282 clean element-factory root; 78 identifier root; 51 component-call root; 9 with earlier sizing/apply/when/class call"
  - cmd: "node $G/order.mjs w-4 h-6 w-10 h-10 size-10"
    output: "Tailwind 4.3.3 rule order: .size-10, .h-6, .h-10, .w-4, .w-10"
  - cmd: "node $G/lp2/lint.mjs $G/plugin; node $G/merge.mjs $W/libA09"
    output: "`.apply(card).w(\"10\").h(\"10\")` autofixed to `.size(\"10\")`; append-only `w-4 h-6 w-10 h-10` -> `w-4 h-6 size-10`; A-09 merge `w-10 h-10` -> `w-4 h-6 size-10`"
  - cmd: "node $G/lp/lint.mjs $G/plugin (base vs proto lib)"
    output: "prefer-size warn in recommended; 0 reports on 8.1.0, 3 on prototype; setStyle width/height -> two .w/.h messages; non-adjacent pair not reported"
  - cmd: "plugin gen-vocab.mjs vs patch; vocab-drift; derivation; rule.test"
    output: "0-line diff; 160 methods / 38 unit methods in sync; 14/14 (539); Failed 0; prefer-size in tests/README/USAGE/CHANGELOG: 0/0/0/0"
  - cmd: "17 units: scripts.lint and plugin pin"
    output: "17/17 `eslint . --max-warnings=0`; 14/17 plugin at #main"
  - cmd: "node $G/docscan.mjs (guidelines, lib docs, tooling READMEs)"
    output: "1 taught equal pair: guidelines/web-development/fluent-html.md:65 (+2 pulled copies)"
  - cmd: "gen:vocab --check and vocab/forms tests in $G/proto vs $G/base"
    output: "OK x3; 703/703 vs 700/700"
  - cmd: "node $G/proto/probe-naming.mjs; tsc probes"
    output: "Select().size(\"4\") compiles, renders class only; 7 prior vocab roots share a set* setter (hidden, translate, list, fill, stroke, wrap, content)"
  - cmd: "node $G/exprobe.mjs ext-base / ext-proto"
    output: "base 0 size-* classes, proto size-4 size-[18px] hover:size-6 md:size-12; user-land square(n) preset: 0 classes, 2 unresolved"
  - cmd: "node dist/bench/render.js x3 alternating; node $G/mb.mjs"
    output: "build+render best 16.19K vs 15.79K inside base spread 15.36K-16.19K; .size path 6008K-6093K vs pair 5793K-5880K ops/s"
  - cmd: "tsc --extendedDiagnostics everyframe-composer base vs proto"
    output: "types +0.54%, instantiations +0.16%, check time 6.23-6.58s vs 6.32-6.42s, 0 errors both"
---

# Verdict: RFC-E-08, guardrails lens (instruction set, pure core, converge, naming, perf)

Scratch: `$G` = `<scratchpad>/track-e/RFC-E-08-guardrails`, `$W` = `<scratchpad>/track-e/RFC-E-08`. I rebuilt the prototype myself rather than reusing the RFC's builds:
- `$G/base` is fluent-html `656e812` copied unmodified.
- `$G/proto` is the same commit plus `$W/rfc-e-08-src.patch` (`patch -p1`, clean, tsc clean).
- `$G/plugin` is eslint-plugin 4.1.0 plus `$W/rfc-e-08-eslint.patch`, built against `$G/proto`.
- `$G/ext-{base,proto}` is the tailwind-extractor dist resolved against each build.

No repo was edited.

## What I executed

**Demand, independent census.**
- `census.mjs` (regex over non-test `.ts` in the 16 canonical repos) finds 426 equal pairs in 16/16 repos: 383 literal chain, 39 unit chain, 4 variant objects.
- `roots.cjs` (typescript-eslint AST) finds 420 chain pairs. Adding the 4 objects gives 424, against the RFC's 423; the difference is the RFC's 2 JSDoc exclusions and regex shape.
- 0 pairs take identifier arguments, and 0 `size-*` tokens appear in a TS class sink.

**One layer up (guardrail 5).**
- `projects-template/packages/ui` and `templates/web/src/core` have 0 w/h chains. `templates/full-stack/src/core` has 2, of which 1 is equal (`layout.view.ts:394`).
- The only abstraction in the fleet is a lookup map: `AVATAR_BOX` in `templates/web/src/shared/components.ts:64-70`.
- The 22 `const size|box|square =` hits are all local variables, for example `analytics.utils.ts:274` `const size = userIds.length`. No square helper exists to promote.
- A user-land preset cannot replace the method. Run through the extractor, `square(n) => t.w(n).h(n)` emits 0 classes with 2 unresolved calls on both builds. The method probe emits 0 `size-*` classes on base and `size-4 size-[18px] hover:size-6 md:size-12` on the prototype.

**Pure core (guardrail 6).** The change is one vocab row, one prototype method, one closed union and one variant key: no context, DI or Fastify. N/A.

**Naming (guardrail 8).**
- `probe-naming.mjs` walks every element class: 8 vocab roots share a name with a `set*` attribute setter. Seven predate this RFC (`hidden`, `translate`, `list`, `fill`, `stroke`, `wrap`, `content`), so `size()` beside `setSize()` follows the established split: the Tailwind prefix for the class, `set*` for the attribute.
- `Select(Option("a")).setSize(4).size("4")` renders `<select class="size-4" size="4">`.
- `Select(Option("a")).size("4")` compiles and renders `<select class="size-4">`. The number arm rejects only `.size(4)`, so the RFC's "closes the one silent path" overclaims. Fleet exposure is 1 `.setSize(` call across 103 `Select(` sites.

**Class-string contract (guardrail 9).**
- `gen:vocab --check` is OK on all 3 files in `$G/proto`. Vocab, coverage, validity and forms tests pass 703/703 against 700/700 on base.
- The plugin's `scripts/gen-vocab.mjs`, run against `$G/proto`, re-derives `vocab.generated.ts` byte-identical to the patch. `vocab-drift` is in sync (160 methods, 38 unit methods), and `derivation` passes 14/14 (539 patterns).

**Converge (guardrail 7).**
- `prefer-size` is in `recommended` at `warn`.
- All 17 units run `eslint . --max-warnings=0`, and 14/17 pin the plugin at `#main`, so `warn` works as a CI gate. The convergence claim holds.
- The rule is inert on 8.1.0: 0 reports on `$G/base`, 3 on `$G/proto`, same probe.
- Gaps found with the full recommended config:
  - `setStyle("width:44px;height:44px")` gets two messages from `no-fluent-equivalent-in-setstyle`, pointing to `.w("px", 44)` and `.h("px", 44)`. That pair is what `prefer-size` flags next.
  - The non-adjacent `.w("4").shrink("0").h("4")` is not reported.
- `docscan.mjs` finds the guideline teaching the to-be-flagged form as the correct target: `guidelines/web-development/fluent-html.md:65` `Div().setStyle("width:44px;height:44px")   // ✗ → .w("px", 44).h("px", 44)`. The pulled copies are `fluent-html/.ai/web-development/fluent-html.md:65` and `projects-template/.ai/web-development/fluent-html.md:65`. Fleet `setStyle` strings with equal width and height: 0.

**Perf (guardrail 2).**
- `node dist/bench/render.js`, 3 alternating runs at load average 12.4, best of 3, base vs prototype:

  | Benchmark | Base | Prototype |
  |---|---|---|
  | Flat page | 8.30K | 8.07K |
  | Realistic page | 32.18K | 32.66K |
  | Variant-heavy | 37.12K | 37.01K |
  | Build+render | 16.19K | 15.79K |

  Base's own build+render spread is 15.36K to 16.19K (5.4%), so these are noise.
- Microbench, 200k iterations, best of 5:
  - The existing pair path is 5,060K to 5,678K ops/s on base and 5,793K to 5,880K on the prototype.
  - `.size("4")` runs at 6,008K to 6,093K.
  - A 20-element page goes from 202K (pairs) to 217K to 218K (`.size`).
- Type-check cost, `tsc --extendedDiagnostics` on everyframe-composer: types +0.54%, instantiations +0.16%, check time 6.23s/6.58s against 6.32s/6.42s, and 0 errors on both builds. The RFC adds no generics.

**Append-only and merge (guardrail 13).**
- `order.mjs` against Tailwind 4.3.3 emits `.size-10`, then `.h-6`, `.h-10`, `.w-4`, `.w-10`.
- Lint with `$G/plugin --fix` rewrites `Div().apply(card).w("10").h("10")` (where `card = t.w("4").h("6")`) to `.size("10")`.
- `merge.mjs` on `$W/libA09`:
  - append-only goes from `w-4 h-6 w-10 h-10` (40x40) to `w-4 h-6 size-10` (16x24);
  - under the A-09 merge, it goes from `w-10 h-10` to `w-4 h-6 size-10`.
- `roots.cjs` classifies the 420 fleet chain pairs:
  - 282 have a clean element-factory root;
  - 78 have an identifier root (preset params such as `components.ts:65`);
  - 51 have a component-call root (such as `everyframe/src/app/home/home.view.ts:645`);
  - 9 have an earlier sizing, apply, when or class call.

## Attack

1. **The fold autofix can change rendering, and the rule cannot know when.**
   - `prefer-size` is per-file and syntactic. Tailwind 4.3.3 puts every `size-*` before every `w-*`/`h-*`, so once the receiver already carries a longhand, folding a later equal pair turns a winning override into a losing one. The probe shows it in both modes, including the decided merge.
   - 138/420 (33%) of fleet sites are on receivers the rule cannot see into.
   - The RFC's harness proves 0/1,217 contexts are exposed today, but the rule is the standing enforcer. With `--max-warnings=0` in 17/17 units, every future site of this shape gets rewritten by `--fix`.
   - The RFC's own way out, open question 1, would make the decided family merge treat `size` as covering `w`/`h`. That is tailwind-merge semantics beyond the decision (guardrail 13) and reopens L-036.
2. **The teaching surfaces still point at the second spelling.** A guideline line prescribes `.w("px", 44).h("px", 44)`, and a hand-coded lint message emits the same pair. An agent following either lands on a `prefer-size` warning. That is a two-hop path, not a dead end, but it contradicts "one way" and the RFC says no guideline teaches it.
3. **The eslint lockstep is incomplete.** The patch ships a recommended rule with 0 rule tests and no README row.
4. **Naming overclaim.** The string form `Select().size("4")` stays silent. The precedent count shows the split itself is house style, so this is a wording fix, not a naming violation.

## Does it survive?

**Survives with changes.** Every guardrail this lens owns checks out on measured evidence:
- It is a primitive that needs library support: the variant key, the extractor and the derived autofix are unreachable from a preset.
- It touches nothing in core beyond the vocab.
- It names what it replaces, and the lint gate is real in 17/17 units.
- `size`/`setSize` follows 7 precedents.
- Render and type-check costs are inside noise, and the new path is faster.
- The re-raise of L-177 and L-159 carries new evidence: 0 hits in the 8-app sweep against 426 here.

The strongest objection is the unsound autofix. It is fixable without new library semantics: limit the standing autofix to receivers the rule can prove clean (282/420), downgrade the rest to suggestions, and run the one-time fleet fold through the RFC's own receiver-checked harness, already gated 423/423 render-identical. Required changes are in the frontmatter, in order.

## Guardrail check (section 5, 1 to 13)

| # | Guardrail | Result | Evidence |
|---|---|---|---|
| 1 | Zero runtime deps | pass | one prototype method, no import added (patch) |
| 2 | Hot path | pass | bench deltas inside base's 5.4% spread; `.size` page 217K to 218K vs 202K pairs |
| 3 | Escape | not re-tested here | RFC breakout probe; another lens owns it |
| 4 | Type-safety | pass, with a wording fix | closed `TailwindSize`; `Select().size("4")` still compiles silently |
| 5 | Instruction set | pass | 0 square helpers in 16 repos; user-land preset gives 0 extracted classes, 2 unresolved |
| 6 | Pure core | N/A | vocab row only |
| 7 | Converge | pass, with changes | `--max-warnings=0` in 17/17 units; guideline `fluent-html.md:65` and the setStyle rule still steer to the pair |
| 8 | Naming | pass | `size` is the Tailwind prefix; 7 prior class/`set*` root pairs |
| 9 | Class-string contract | pass | gen:vocab --check OK x3; plugin vocab re-derived with a 0-line diff |
| 10 | Runtime grammar | pass | Tailwind 4.3.3 emits `.size-10`; RFC oracle 62/62 |
| 11 | Codemod-first | N/A, additive | the fold should run as the receiver-checked codemod (change 1) |
| 12 | Enforcement over prose | pass, with change | 0 net lines; line 65 is edited in place |
| 13 | Append-only plus decided merge | conditional | autofix flips overrides on 138/420 receiver shapes the rule cannot inspect (probe 40x40 to 16x24); open question 1 would breach the guardrail |
