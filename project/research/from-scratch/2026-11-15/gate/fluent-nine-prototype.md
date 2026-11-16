# Fluent Nine: runnable prototype and K2, K3, K4

`$B` is `/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15` and `P` is `$B/proto-fluent-nine`. Commands run from `P/` unless noted.

Nothing in fluent-html's `src/`, `dist/`, releases, `project/pm/`, the template, the guidelines or any `CLAUDE.md` was touched, and nothing was committed. `git -C /Users/tony/jt-digital/fluent-html status --short src dist` is empty. No headless sessions were run, so this step cost $0.

## Verdict on this step

Fluent Nine holds the three kills this step can measure, and safety parity.

| Kill | Fluent Nine | fluent-html 8, same run | Command | Holds? |
|---|---|---|---|---|
| K2 build+render ≥ 0.9x | run 1: **1.285x** (1.237-1.304); run 2: **1.288x** (1.164-1.32) | 1 | `npm run bench`, twice | yes |
| K3 zero escapes | **0 of 206**: 41 rejected, 127 safe, 38 benign with 0 broken, 0 unsupported | 18 | `npm run xss`; fh8 with `node check.mjs adapters/fluent-html-8.mjs` in `$B/fixtures/xss` | yes |
| K4 html-validate errors ≤ control | bench page **0 / 0** (fragment, document); six screen states **0 each** | bench 12 / 12 (`no-implicit-button-type`); screens 0 each | `npm run validate` (exit 0); fh8 in the same run with `html-validate` 11.17.0 (`out/k4/fh8-same-run.txt`) | yes |
| Safety parity | 8 of 8 mistakes fluent-html 8 rejects are rejected by the same command, `tsc` | | `node tools/parity.mjs` (exit 0) | yes |
| K1, K5 | not measured | | needs the gate's sessions | open |

## What was built

- **The package.** `P/pkg` is fluent-html 9.0.0-proto.
  - It started as `git archive HEAD src`. At HEAD, `src` and `dist` both sit at 9d86871 (8.1.0).
  - 24 files differ from 8.1.0 (`diff -rq …/fluent-html/src pkg/src | wc -l`).
  - `npm run build` generates the class grammar, then runs tsc. `node_modules/fluent-html` links to it.
- **Method choice:** a source copy, not a wrapper over the dist. A wrapper cannot remove the styling methods from `Tag`'s type: `Omit` loses the `this`-typed chain.

The design's changes:

1. **`.tw("…")` and `tw("…")` constants** (`pkg/src/core/tw.ts`, `tw-types.ts`).
   - Each token is checked: variants are peeled off, then the base is matched as a keyword or as a (root, value) pair for every dash split.
   - The theme arm reads the existing seams: `FluentCustomColors`, `FluentCustomRadius`, `FluentCustomFontSize`, `FluentCustomShadow`, `FluentCustomFontFamily` and `FluentCustomSpacing`. `FluentColorConfig { defaultPalette: false }` closes the palette.
   - Error text, verbatim from `probes/tw-messages.ts`:
     - `["✗ 'bg-primry': 'primry' after 'bg-' is not a colour. Colours: primary, surface, text-dim, danger, or Tailwind's palette"]`
     - `["✗ 'hovr:bg-primary': unknown variant 'hovr:'"]`
     - `["✗ 'justify-centre' is not a Tailwind class"]`
     - A runtime string, and a template string, each get their own message.
2. **The grammar is generated from Tailwind 4.3.3's own design system** (`tools/gen-grammar.mjs`), not hand-written as in round 1.
   - Tailwind's class list has 23,286 classes. They reduce to 1,735 keywords, 51 colour roots, 170 numeric roots, 29 fraction roots and 71 static variants.
   - Accuracy check (`tools/grammar-corpus.mjs`): every class token the six round-1 sessions and the keep-fh9 fh8 screens rendered (208 tokens), plus 433 seeded misspellings of them, was judged by Tailwind (`candidatesToCss`) and by tsc.
   - They agree on **641 of 641**: 0 false positives and 0 false negatives (`out/grammar-corpus/summary.json`).
   - Two bugs found this way are fixed: bare `rounded` was missing, and `p--4` was accepted.
3. **The 185 styling methods are off `Tag`.** `tailwind-methods.ts`, `variant-object*` and `class-vocab/` are deleted.
4. **236 tombstones** (`tw-tombstones.gen.ts`):
   - fh8's styling methods;
   - names Claude guessed in round 1 (`flexWrap`, `textAlign`, `overflowX`, `notSrOnly` and others);
   - unprefixed attribute names.

   Example: `Div().p("4")` gives TS2349, `Type 'UseInstead<".tw(\"p-…\"): styling is Tailwind class text">' has no call signatures`.
5. **The swap verbs ship in the package** (`pkg/src/verbs.ts`). They are the template's verbs, unchanged in behaviour, plus `configureVerbs({ main, indicator })`. `PageRoute` and `FragmentRoute` are exported too.
6. **Class merge, a stand-in.** The class emitter does not write a token the element already has. It is not 8.2's family merge.
7. **The sink closers are in the source**, so the unchecked forms do not compile:
   - `Style(css\`…\`)` and `Script(js\`…\`)`, plus `JsonScript`;
   - `setStyle` and `addStyle` take literals only, and `setStyles` values are checked;
   - `externalUrl` and `assetUrl` check at runtime;
   - `js:` is refused in htmx endpoints and `hx-vals`, and neutralised in `hx-confirm`;
   - `data-hx-*` keys are refused;
   - `srcdoc` is always sandboxed;
   - `Raw` takes a literal or `trustHtml(…)` only;
   - `addAttribute` refuses `class`, `style`, `id`, URL attributes, `srcdoc` and `hx-*`, and names the setter to use;
   - `cssClass`, `setClass` and `addClass` reject Tailwind-shaped literals and point to `.tw()`.
8. **Buttons.** `Button()` emits `type="button"`; `SubmitButton()` is new.
9. **The reference.** `pkg/REFERENCE.md` is 19,104 B (`wc -c`), against the control's 67,520 B. `npm test` (4/4 pass) checks three things:
   - its size;
   - that all its `ts` examples, joined into one program, type-check and run;
   - K3, with a negative control: switching three sinks back to their unchecked fh8 forms makes `style-value`, `style-element` and `iframe-srcdoc` escape.
10. **A bake-off arm.**
    - `$B/bake-off-fluent-nine/setup.sh` installs the package and the reference in a clean folder, with the control's tsconfig.
    - `check.sh` is the control's check unchanged: tsc is the only checker.
    - Smoke test in the scratchpad: a `tw()` constant and `SubmitButton` type-check and render, and a misspelt class is rejected.

## Measurements in detail

**K2.** `npm run bench` runs `NODE_ENV=production node --expose-gc ../fixtures/bench/harness.mjs --rounds 11 --sample-ms 300 ../fixtures/bench/arms/fluent-html-8.mjs bench/arm.ts`. It ran twice on the final build, with load average 3.5 to 5.4 (`out/k2/load.txt`).

| Run | Arm | build+render ops/CPU-s | render-only | alloc B/op |
|---|---|---|---|---|
| 1 | fluent-html 8 | 17,366 (16,890-17,569) | 31,671 | 137,180 |
| 1 | Fluent Nine | 22,289 (20,901-22,627) | 32,201 | 100,905 |
| 2 | fluent-html 8 | 17,319 (16,453-17,474) | 32,063 | 137,378 |
| 2 | Fluent Nine | 22,047 (20,285-22,438) | 31,655 | 101,094 |

- Two earlier runs, before the last source edits, gave 1.281x and 1.296x.
- Render-only is unchanged. The gain is in building: one `.tw()` string instead of one method call per utility.
- The bench arm is written the way the reference teaches: `.tw`, `.cssClass("nav-link")`, `setSrc`/`setAlt`, and a `Button` that is `type="button"`.
- Its output is 8,416 B against 8,248 B. It equals `expected.fh8.html` once whitespace and the 12 `type="button"` are ignored (`node bench/write-output.ts`).

**K3** (`out/k3/xss-run1.txt`):

- Rejections by context: `url-href` 15, `style-value` 8, `style-element` 8, `attr-name` 6 (`hx-*` data keys), `htmx-get` 4.
- Nothing is unsupported.
- A first, stricter `externalUrl` broke 3 benign cases (a relative URL, a PNG `data:` URL, and a relative htmx URL). It was widened to round 1's allowlist, which brought broken cases to 0.

**K4.**

- The six screen states are the design's three reference screens (`P/screens/`, ported from `keep-fh9/screens/fh9`), rendered by `node tools/render-screens.ts`.
- They type-check against the package with the palette closed (`npm run check`).

**Safety parity** (`out/parity.txt`). Rejected by `tsc` in both:

- P1 unknown class;
- P2 palette literal;
- P3 bad variant;
- P4 fragment id mismatch;
- P5 wrong route stance;
- P6 raw `hx-*` URL;
- P8 and P8b bad attribute values.

fluent-html 8's tsc accepts three more that Fluent Nine rejects: P7 `Raw(userBio)`, P10 `` setStyle(`color: ${v}`) ``, and P11 `cssClass("p-4 bg-gray-100")`. Text escaping gives identical output in both.

**Edit-loop cost** (`/usr/bin/time -p`, 3 runs each):

| Check | Fluent Nine | fluent-html 8 |
|---|---|---|
| tsc, three screens | 0.59-0.69 s, 19,846 instantiations | 0.61-0.67 s, 25,121 instantiations |
| tsc, 2,000 elements with 8 classes each (`stress/`, round 1's file) | 0.77-0.79 s, check time 0.34 s, 242,034 instantiations | 0.49-0.51 s, check time 0.18 s |

## Decisions taken without asking

- **No opt-in `fluent-html/styling-methods` module.** It would declare the same members as the tombstones, and the two conflict. The nine apps' migration path is not part of this measurement.
- **The verbs are also exported from the package root**, not only from `fluent-html/verbs`. The control's sessions grepped the `.d.ts` for `nav(` and found nothing.
- **Arbitrary properties are allowed in `.tw()`** (`[mask-type:luminance]`). `cssProp` is gone, because with no extractor its class was never generated.
- **An arbitrary colour (`bg-[#fff]`, `[color:#fff]`) fails only when the palette is closed**, as fluent-html 8 does.

## Gaps and risks

- **The `.d.ts` surface grew:** 312,010 B against 268,554 B (`find … -name '*.d.ts' | xargs cat | wc -c`). The generated grammar is 70,360 B of long literal unions, and an agent grepping `dist/` will hit them. The d.ts rollup and the `which` command (design change 6) were not built.
- **The merge is dedupe only.** `.tw(card, "p-0")` still emits `p-6 … p-0`. The design's own R1 screen does this, and it is still a silent bug.
- **Not built:**
  - the single exhaustive `Match` signature;
  - a codemod;
  - a Tailwind `@theme` generated from `defineTheme`. The reference has the user write it.
- **Parity covers fluent-html 8's tsc only.** Its eslint rules (`prefer-foreach` and others) are not in this package; the design keeps them as a separate plugin.
- **Not run in a browser.** The verbs are the template's code, unchanged.

The next step is the gate in the verdict: two Fluent Nine sessions from `bake-off-fluent-nine/setup.sh`, beside Page Parts run on its reference alone.
