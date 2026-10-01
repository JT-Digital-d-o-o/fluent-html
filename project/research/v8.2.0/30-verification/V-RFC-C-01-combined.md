---
rfc: RFC-C-01
lens: combined
verdict: survives-with-changes
confidence: 0.74
killer_objection: "The new contract tables (CSS_SUCCESSOR, WITHHELD, DEAD_PREFIXES) are fixed when the plugin is built, from a sibling ../fluent-html checkout. The fix derivation is still read at run time from the host's class-vocab. When the host lib differs, the rule goes wrong in two measured ways: a host missing a residue method crashes ESLint (exit 2), and a host that adds a method still gets a .cssProp autofix plus 'no fluent method'. Nothing breaks on 8.x today (8.0.0 and 8.1.0 vocab are identical: 159/159 methods, 0 changed rows), so this is a must-fix, not a kill."
guardrail_killer: null
required_changes:
  - "Delete the run-time throw in getFixableTables. Put that assertion in test/derivation.test.js. At run time, skip residue rows whose method the host vocab lacks."
  - "Tie each CSS_SUCCESSOR/WITHHELD entry (and each DEAD/BRACKET prefix) to the derived call it was generated from. Use the entry only when the host derivation still gives that call. Write the lib and tailwind versions into the generated header."
  - "Wrap gen-fix-contract.mjs in the same skip guard as vocab-drift/fix-contract. Prove the contract against the lib the plugin resolves (the devDependency is 8.0.0, the generator reads sibling 8.1.0)."
  - "For a root that has a live fluent method, tailwindNoMethod must not say 'no fluent method'. Name the method and say the value is outside its typed values."
  - "The new fallback variantNoMethod branch must use tier1ByPrefix (.focusVisible({ ... }), not .variant(\"focus-visible\", { ... }))."
  - "test/fix-contract.mjs must render-check variant-headed tokens and sweep hover:×CSS_SUCCESSOR and hover:×two-arg forms."
executed:
  - cmd: "eslint --fix + tsc on a 125-line adversarial probe, template typed config (eslint 10.11.0, TS 6.0.3, fluent-html 8.1.0), base vs prototype"
    output: "base: 92 changed, 38 tsc errors. Prototype: 95 changed, 0 tsc errors. Compiling base fixes lost: 0"
  - cmd: "render-check.mjs (every changed line rendered, compared via Tailwind 4.3.3 candidatesToCss)"
    output: "prototype: 0 real mismatches. Base: 2 silent setClass class losses (p-4, min-w-7)"
  - cmd: "node scripts/gen-fix-contract.mjs --check"
    output: "matches the sweep; 509 cssProp, 1650 withheld, 11 dead, 160 untyped heads; 34.5 s"
  - cmd: "node test/fix-contract.mjs + rule/type-aware/derivation/vocab-drift"
    output: "10008 autofixes over 23661 tokens pass; all suites pass"
  - cmd: "standalone checkout: gen-fix-contract.mjs --check"
    output: "exit 1 ERR_MODULE_NOT_FOUND (vocab-drift and fix-contract skip)"
  - cmd: "shim host lib without colEnd,rowEnd; eslint with each plugin"
    output: "prototype exit 2 'Oops! Something went wrong! ... residue pattern \"col-end-\" ...'; base exit 1 (.colEnd(\"2\"))"
  - cmd: "shim host lib with an added placeItems row"
    output: "prototype .cssProp(\"place-items\", \"center\") 'no fluent method'; base .placeItems(\"center\")"
  - cmd: "nomethod.mjs over 23,330 class-space tokens + 96 opacity probes"
    output: "501/11,839 no-method reports name a root that has a method (outline 293, flex 26, ...); 48/48 color /[0.5] probes say \"'bg' utility with no fluent method\""
  - cmd: "vnm.mjs + pp1 grep + tsc .variant(\"focus-visible\", ...)"
    output: "base .focusVisible({ ... }), prototype .variant(\"focus-visible\", { ... }); that spelling compiles (0 errors)"
  - cmd: "pure prior pp1 / pp2: eslint src/app/team --fix; tsc"
    output: "pp1: base tsc 3->27, prototype 3->3 (lint 170->53). pp2 prototype: tsc 4->4 (lint 187->67)"
  - cmd: "prior follow-ups to the redirect text: tsc + render + oracle"
    output: "10/10 compile and are oracle-valid"
  - cmd: "extractor scanFluent over the prototype-fixed lines"
    output: "98/98 fluent-emitted classes safelisted"
  - cmd: "fleetlint.mjs (dedup census, 58 repos, 852 files)"
    output: "new reports 0, dropped 0, crashes 0; canonical era 0 messages for both"
  - cmd: "uilint.mjs on packages/ui; grep template eslint-rules + package.json"
    output: "packages/ui 0 reports for both; 4 template rules, 0 touch raw class; lint:fix = eslint . --fix, no tsc step after the fix"
---

# Verdict: RFC-C-01, combined lens

> You are an ADVERSARY. Kill this RFC through the combined lens. Default to `reject` under
> uncertainty. Reading code is not verification: execute.

## What I executed

Scratch is `scratchpad/wave3/RFC-C-01-combined/`. It holds copies of the prototype plugin (`proto/`) and the installed 4.1.0 plugin (`nmB/`). There are two copies of the template scaffold (`tplB`, `tplP`) with its typed ESLint config: eslint 10.11.0, TS 6.0.3, fluent-html 8.1.0, tailwindcss 4.3.3.

**1. Enforcement check: the lint rule on a fixture, then fix, tsc and render.**

The fixture has 118 single tokens I chose to break the prototype, plus 6 multi-token `setClass`/`addClass` calls and 1 template literal. The tokens include:
- variant × cssProp: `hover:`, `md:hover:`, `group-hover:`, `dark:` on `place-items-center`
- variant × two-arg: `hover:border-b-2`, `md:rounded-t-lg`
- variant × negative: `md:-translate-y-1/2`
- arbitrary values: `border-b-[3px]`, `rounded-t-[4px]`, `text-white/[0.5]`
- theme tokens: `border-b-line`, `rounded-t-card`, `bg-primary/50`
- important: `!p-4`, `p-4!`
- line-height modifier: `text-sm/6`
- the `mask-b-from-50%` case
- arbitrary variant heads: `max-[600px]:`, `supports-[...]:`
- logical utilities: `ps-4`, `start-0`
- pruned families

Results:

| | base 4.1.0 | prototype |
|---|---|---|
| lines autofixed | 92 | 95 |
| tsc errors after `--fix` | **38** | **0** |
| render mismatch vs oracle | 2 silent class losses (`setClass("p-4 js-hook")` renders only `js-hook`; `setClass("min-w-7 js-hook")` loses `min-w-7`) | 0 (5 variant `.cssProp` lines differ only in selector escaping; same declarations) |
| compiling base fixes lost | n/a | 0 |

The RFC's verbatim first diagnostic reproduces: `'place-items-center' in .addClass() is a Tailwind utility with no fluent method. Replace with: .cssProp("place-items", "center"). [autofix]`.

The extractor (3.0.0-unreleased `scanFluent`) safelists 98/98 fluent-emitted classes from the fixed lines. The 4 misses are raw tokens deliberately kept in `addClass`.

**2. The RFC's own CI.**
- `gen-fix-contract.mjs --check` reaches its fixpoint in 34.5 s: 509 cssProp successors, 1,650 withheld, 11 dead prefixes, 160 untyped heads.
- `test/fix-contract.mjs` passes 10,008 autofixes over 23,661 tokens in 25.3 s.
- rule, type-aware, derivation and vocab-drift all pass.

**3. Pure-prior agent fitness.**
- pp1 in the template: base goes lint 170→41 and **tsc 3→27**. The prototype goes lint 170→53 and **tsc 3→3**.
- pp2 on the prototype: lint 187→67, tsc 4→4.
- What pp1 has left after the fix: 26 `hostRejects` (palette under opt-out), 8 `replaceWith` inside a template literal (base behaves the same: no fix exists there), 1 `untypedValue`, 2 `tailwindNoMethod`, 1 `variantNoMethod`.
- I also wrote the follow-up calls the prior would most likely make after reading the redirect text, such as `.cssProp("transform", "rotateX(45deg)")`, `.cssProp("min-width", "1.75rem")`, `.focusVisible({ cssProp: [...] })` and a `mask-image` gradient. All 10/10 compile and render oracle-valid classes.

**4. Instruction-set grep.**
- `templates/shared/eslint-rules` has 4 rules, and none of them touches raw class strings.
- `lint:fix` is `eslint . --fix` (`templates/full-stack/package.json:34`), with no tsc step after the fix.
- `packages/ui/src` has 18 `addClass` sites. Both plugins report 0 on them.
- Nothing one layer up can check what this rule's own fixer writes.

**5. Lane and breaking check.**
- The dedup census corpus is 58 repos, 852 files with class calls, linted untyped. Both plugins give 0 new reports, 0 dropped reports and 0 crashes. Canonical-era repos have 0 messages under both. Pre-7 autofixes go from 7,685 to 8,007.
- The lib is untouched. The plugin gets a minor bump.

**6. Version-skew probes.** I built shim fluent-html packages with an edited class-vocab.
- **Missing method.** With `colEnd`/`rowEnd` removed, the prototype's eslint exits **2** with `Oops! Something went wrong! ... residue pattern "col-end-" targets .colEnd() ... delete the residue row`. Base exits 1 with a (stale) `.colEnd("2")` fix.
- **Added method.** With a `placeItems` row added, the prototype still autofixes to `.cssProp("place-items", "center")` and says "no fluent method". Base gives `.placeItems("center")`.
- The plugin's own devDependency is fluent-html **8.0.0** (commit 7cf5b23), but the generator compiles against sibling 8.1.0. The two have identical class-vocab (159/159 methods, 0 changed rows).
- In a standalone plugin checkout, `gen-fix-contract.mjs --check` exits 1 with `ERR_MODULE_NOT_FOUND`. vocab-drift and fix-contract skip cleanly there.

**7. Message accuracy.**
- Across 23,330 class-space tokens, 501 of the 11,839 `tailwindNoMethod` reports name a root that does have a fluent method: `outline` 293, `flex` 26, and the negative fraction insets `bottom`/`inset`/`left`/`right`/`top`. The roots of all 48 valid color `/[0.5]` probes also have methods. The messages say "'bg' utility with no fluent method. Use .cssProp("background-color", value)", but `.bg("white/50")` is the typed spelling.
- The new fallback `variantNoMethod` branch changes `focus-visible:outline` from base's `.focusVisible({ ... })` to `.variant("focus-visible", { ... })`. That spelling compiles (0 tsc errors), so the message teaches a second way to write a tier-1 variant. All 20/20 of my bare-word × tier-1-head probes hit this branch.

## Attack

The strongest case is version coupling. Before this RFC, the plugin derived its fixes at rule load from the **host's** `fluent-html/class-vocab`, so the vocab could re-derive from the host. This RFC puts a second source of truth in front of that derivation: 80 KiB of tables swept at plugin build time against whatever `../fluent-html/dist` the developer has checked out. `classifyBase` checks `CSS_SUCCESSOR` first and lets `WITHHELD` override the derived call. So the plugin's output now depends on the build-time lib, not the host lib, and the peer range `fluent-html >=8.0.0` allows them to differ. Both failure modes above are measured, not inferred:

- **Missing method.** A lint run that crashes outright (exit 2) on a host that lacks a residue method. The RFC's own planned 9.0.0 prune (`colEnd`/`rowEnd`/`bgBlend`) would hit this unless the plugin ships in lockstep.
- **Added method.** An autofix to the escape hatch, while the host has a typed method, with a message that falsely says "no fluent method". That is a second way to do the same job (guardrail 7). The RFC's own "widen the unions in 8.2.0" follow-up would trigger it, and the stale `WITHHELD` would then also misreport "(it fails tsc)".

Secondary problems:
- The new message text is false in 501 class-space cases and in every color `/[0.5]` probe.
- The fallback head message drops the tier-1 method.
- The contract test never render-checks variant-headed fixes.

## Does it survive?

**survives-with-changes.** The central claim holds under adversarial input.
- 0 tsc errors across 125 hostile probe lines (base: 38).
- 0 lost compiling fixes.
- 0 new or dropped reports across the 852-file fleet.
- The pure prior's `lint:fix` → tsc loop now converges: 3→3 and 4→4, where base went 3→27.
- The first diagnostic names the one-shot fix, and that fix compiles and is oracle-valid.
- The lib is untouched, the lane check passes, and nothing one layer up solves this.

The skew defects do not break anyone on 8.x today, since 8.0.0 and 8.1.0 vocab are identical. They are cheap to close before shipping. Implementers apply these changes before the RFC text:

1. **Residue-row throw.** Delete the run-time throw in `getFixableTables`. Move the "residue row targets a missing method" assertion into `test/derivation.test.js`. At run time, skip residue rows whose method the host vocab lacks.
2. **Tie tables to their derivation.**
   - Store, for each `CSS_SUCCESSOR` and `WITHHELD` entry, the derived call (or null) that existed at generation time. At run time, use the entry only when the host's `classifyDerived` still gives that same call; otherwise use the host derivation and the typed guard.
   - Treat `DEAD_PREFIXES` and `BRACKET_PREFIXES` the same way, per prefix and method.
   - Write the fluent-html and tailwindcss versions into the generated header.
3. **Generator guard and lib pin.** Give `gen-fix-contract.mjs` the same skip guard as `vocab-drift.mjs` and `test/fix-contract.mjs`. Prove the contract against the lib the plugin resolves: either bump the devDependency from 8.0.0 to 8.1.0, or compile against `node_modules/fluent-html`. Assert the version in `--check`.
4. **`tailwindNoMethod` wording.** When the root has a live method in the host vocab, say that `.method()` exists and the value is outside its typed values, as `untypedValue` does. Do not say "no fluent method".
5. **Fallback `variantNoMethod` branch.** Resolve the head through `tier1ByPrefix`, as the original branch does, so the message gives `.focusVisible({ ... })` and not `.variant("focus-visible", { ... })`.
6. **Contract test coverage.** `test/fix-contract.mjs` must render-check variant-headed tokens, which today are tsc-only because of `if (!t.includes(":"))`. It must also sweep `hover:`×`CSS_SUCCESSOR` and `hover:`×two-arg border/rounded forms. These pass today, so this pins existing behavior.

Open question 2 (untyped off-scale integers) stays as the RFC states it. I add one data point: `p-4!` has the same untyped residual (`.p("4!")`). In typed hosts the guard withholds it as `hostRejects`.

## Guardrail check (if this lens owns one)

- **1 Zero runtime deps:** pass. The lib is unchanged; `typescript` is reached only through `parserServices`.
- **3 Escape:** pass. Fix text uses `JSON.stringify`.
- **4 Type-safety:** pass. The guard reads the declared signature, with no generic-wrapper inference.
- **7 Converge:** passes on the 8.1.0 host. It fails under vocab skew (the `placeItems` shim gives `.cssProp` plus a false "no fluent method"), and the tier-1 fallback message gives a second spelling. Required changes 2 and 5 fix both.
- **9 Class-string contract:** the tables are generated and pinned by `--check` and never hand-edited. They must be tied to the host derivation (change 2).
- **10 Runtime-grammar:** pass. 98/98 fixed classes are safelisted, and every rendered fix is oracle-valid.
- **11 Breaking:** the lane holds (0 new or dropped fleet reports). The exit-2 crash under a host-lib prune is the one consumer-break path; change 1 closes it.
- **12 Enforcement over prose:** pass. Lines `fluent-html.md:46` and `:233` and `README.md:266-271` exist as cited, and the net guideline delta is -2.
- **13 Append-only:** pass. The kept `setClass` goes first, which fixes the base wipe.
