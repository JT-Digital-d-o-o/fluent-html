---
rfc: RFC-E-08
lens: agent-fitness
verdict: survives-with-changes
confidence: 0.8
killer_objection: null
guardrail_killer: null
required_changes:
  - "Reword the number-arm brand so it names the receiver that has the setter. Only SelectTag declares setSize (dist/src/elements/forms.d.ts:219). Today Input().size(20) gets the hint '.setSize(n)', and following it gives TS2339 on InputTag. Suggested text: 'size() takes a string step, .size(\"4\"); for the <select size> attribute use Select(...).setSize(n)'."
  - "Reword the string-arm brand so it names the fix for an off-scale Tailwind 4 step. Today .size(\"4.5\") and .size(\"18\") are told to write .w(\"screen\").h(\"screen\"). Suggested text: 'size() takes a TailwindSize (scale step, fraction or keyword); any other length is .size(\"px\", n) or .size(\"[...]\"); size-screen is .w(\"screen\").h(\"screen\")'. Add .size(\"4.5\") to the diagnostics table and as a @ts-expect-error line in ok.ts. Keep each diagnostic at or under the measured 141 tokens."
  - "Restate context-economy as mixed, at most +0.05. Across 9+9 runs (T1, T2, T4), input fell 5.9% and output fell 8.4%, but the per-task signs disagree (T1 -22%, T2 -42%, T4 +50% input)."
executed:
  - cmd: "run.sh (wave0-2 recipe) x12: T1 pixel spec and T2 Tailwind design, addClass allowed, 3 runs each on 8.1.0 and on the prototype"
    output: "proto: 27/27 squares as .size (hover({ size }) 6/6 where needed); base: 30/30 as .w().h(); setSize(4) 12/12; addClass 0; tsc 0 errors 12/12"
  - cmd: "run.sh with tsc allowed x9: T3 (T1 + tsc, proto x3), T4 (size-4.5, w-screen h-screen, <input size>, size-[22px], size-12; base x3, proto x3)"
    output: "proto 24/24 size-* as .size; 0 size() diagnostics reached an agent; 0/3 .size(\"screen\"); 0/3 Input().size(6)"
  - cmd: "run.sh x6 T5: override a component sized .w(\"8\").h(\"8\") to 48px"
    output: "0/3 proto chained .size(\"12\") (the silent-loss path); 6/6 used setStyles/addStyle or minW/minH; tsc rc=0 6/6"
  - cmd: "tsc 5.9.3 wrong-guess probe on the prototype (7 lines)"
    output: "2/6 guesses get a hint that names the fix; \"4.5\"/\"18\" get the size-screen hint; Input().size(20) -> setSize hint -> TS2339 on InputTag; hover({ size: \"4.5\" }) gets no hint"
  - cmd: "claude -p token usage with and without each text"
    output: "d.ts delta +373 tokens (811 bytes); size(\"4.5\") diagnostic 141 tokens vs w(\"4.5\") 53"
  - cmd: "lint.mjs (RFC plugin) on 21 agent outputs + tsc on the 12 fixed files"
    output: "42 prefer-size findings, 42 fixed, tsc rc=0; 8.1.0-derived plugin 0 findings"
  - cmd: "5 fleet rewrites (sportoawards, stojnica, workshop-toni, home-page, competify), repo tsc 6.0.3"
    output: "0 new errors in 5/5 on the prototype; TS2339 at each rewritten line on 8.1.0"
---

# Verdict: RFC-E-08, agent-fitness lens

Scratch: `<scratch>/track-e/RFC-E-08-agent-fitness/` (`runs/`, `fleet/`, `probe/`, `tok/`, `lint.mjs`, `analyze.py`). The packages are copies of the RFC's own builds: `pkgs/base` is fluent-html 8.1.0 at `656e812`, and `pkgs/proto` adds the RFC patch. Their dists differ only in the 6 files listed under teaching cost below. No repo was edited.

## What I executed

### 1. Withheld-context agent runs (33 runs, 5 tasks)

**Harness.** I used the wave0-2 `run-claude.sh` recipe, with the settings path as a parameter:
- `env -i`, `claude -p --restricted`, `--strict-mcp-config`, `--no-session-persistence`, `--disable-slash-commands`;
- the wave0-2 `settings.json` deny list;
- model claude-opus-5-5, effort medium.

Each sandbox held only `node_modules/fluent-html`, which carries the lib README (14,932 bytes, identical on both builds, no `size` row) and `dist/`. T3, T4 and T5 also held `node_modules/typescript` and an allow rule for `./node_modules/.bin/tsc`.

**Withholding audit (my own run, not the RFC's).** 382 tool calls in T1-T4 referenced 0 absolute paths outside the run dir. All 15 permission denials were compound `cd node_modules/fluent-html; ...` commands inside the sandbox.

**Tasks.** I wrote my own tasks rather than reusing the RFC's prompt. The RFC's prompt forbade `addClass` and told the agent to "read the type declarations to find the right methods". That steers the agent toward discovery, so none of mine say it:
- **T1:** components described in pixels ("40px wide and 40px tall"), with no Tailwind class names. It includes a 36px button that grows to 40px on hover, an 18px spinner, and a select that "shows 4 rows at once" (the `<select size>` collision bait).
- **T2:** a Tailwind design with `size-8`, `size-9`, `hover:size-10`, `size-4`, one `w-5 h-5` pair, and `<select size="4" class="w-48 ...">`.
- **T3:** T1, with tsc available.
- **T4:** a design that baits wrong guesses: `w-screen h-screen`, `size-4.5` (valid Tailwind 4, off the closed scale), `<input size="6">`, `size-[22px]`, `size-12`. tsc available.
- **T5:** an existing `Avatar()` sized `.w("8").h("8")`, to be shown at 48px. This baits the cross-family override `.size("12")`, which silently loses: Tailwind 4.3.3 orders `.size-12` before every `.h-*` and `.w-*` (`node order.mjs`).

| Task | Build | Square sites as `.size` | Equal `.w().h()` pairs (prefer-size findings) | tsc errors, final file | Select / input attribute | Mean input tok | Mean output tok | Mean cost |
|---|---|---|---|---|---|---|---|---|
| T1 | 8.1.0 | 0 | 15 | 0/3 | `setSize(4)` 3/3 | 237,720 | 3,190 | $0.389 |
| T1 | proto | 15 (hover key 3/3, `("px", 18)` 3/3) | 0 | 0/3 | `setSize(4)` 3/3 | 185,492 | 3,155 | $0.308 |
| T2 | 8.1.0 | 0 | 15 | 0/3 | `setSize(4)` 3/3 | 247,297 | 3,780 | $0.329 |
| T2 | proto | 12/12 `size-*` tokens | 3 (`w-5 h-5`, translated literally) | 0/3 | `setSize(4)` 3/3 | 143,975 | 2,823 | $0.268 |
| T3 | proto | 15 | 0 | 0/3, 0 errors seen | `setSize(4)` 3/3 | 161,125 | 2,708 | $0.269 |
| T4 | 8.1.0 | 0 | 9 | 0/3 | `addAttribute("size","6")` 3/3 | 227,541 | 3,669 | $0.355 |
| T4 | proto | 9/9 | 0 (`w-screen h-screen` kept, correctly) | 0/3, 0 size() errors seen | `addAttribute("size","6")` 3/3 | 341,053 | 3,766 | $0.422 |
| T5 | 8.1.0 | n/a | n/a | 0/3 | n/a | 263,714 | 6,043 | $0.372 |
| T5 | proto | 0/3 chained `.size("12")` | n/a | 0/3 | n/a | 261,227 | 5,609 | $0.367 |

**Findings from the runs:**
- **Discovery from types alone.** 12/12 prototype runs found and used `.size()`: 51 call sites, every one compiling. That includes T1, where the agent never saw the string `size-` and was free to use `addClass`. None of the 9 base runs could, and 3/9 left a comment that fluent-html has no `size-*` method.
- **The README teaches nothing here.** Its top-50 table (`README.md:69,75`) lists `.w`/`.h` and not `.size`, and the RFC does not touch it. Discovery still reached 12/12, by grepping the d.ts.
- **The `<select size>` collision did not materialize.** 12/12 runs with a select wrote `setSize(4)`, and 0 wrote `.size(4)` or `.size("4")` on a select. With `<input size>`, 6/6 T4 runs wrote `addAttribute("size","6")`, and 0 tried `.size(6)`.
- **First wrong guess.** No prototype agent produced one. 0 size() diagnostics appeared in the 6 tsc-enabled prototype runs.
- **The second spelling survives literal translation.** In T2, 3/3 prototype agents translated the design's `w-5 h-5` literally as `.w("5").h("5")`. `prefer-size` flags 3/3, and `--fix` output compiles.
- **Override hazard: 0/3.** No prototype agent reached for `.size()` as an override. All 6 T5 agents named append-only semantics and used an inline style or `minW`/`minH`.

### 2. Wrong-guess diagnostics, probed directly (prototype, tsc 5.9.3)

| Guess | Diagnostic | Names the right fix? |
|---|---|---|
| `Div().size("screen")` | TS2345, size-screen hint | yes |
| `Select(Option("a")).size(4)` | TS2345, `.setSize(n)` hint | yes |
| `Input().size(20)` | TS2345, `.setSize(n)` hint; following it, `Input().setSize(20)` is `TS2339: Property 'setSize' does not exist on type 'InputTag'` | **no, it misleads** |
| `Div().size("4.5")` (`size-4.5` is valid Tailwind 4) | TS2345, size-screen hint | **no**; the fix is `.size("px", 18)` |
| `Div().size("18")` | same | **no** |
| `Div().hover({ size: "4.5" })` | TS2322, no hint (RFC open question 2) | no |

**Hint quality: 2 of 6 name the fix.** Both brands print in every diagnostic, whatever the argument type.

**Size.** A size() diagnostic is 141 tokens; the `w("4.5")` equivalent on 8.1.0 is 53 (`TS2345 ... 'TailwindWidth'`). That is +88 tokens per error.

**Silent paths (render, prototype).** Both compile and emit no attribute:
- `Select(Option("a")).size("4")` emits `<select class="size-4">`.
- `Input().size("20")` emits `<input class="size-20">`.

**Measured exposure is 0:**
- 0/12 agent runs;
- 0 fleet sites set an input `size` attribute (`rg 'addAttribute\("size"'` over the 16 repos);
- the design corpus has 0 off-scale numeric `size-*` tokens. It has 1,826 `size-*` tokens; the 16 that fall outside `TailwindSize` are `size-medium`/`size-thumbnail` in scraped WordPress HTML.

### 3. Teaching tokens added

**Type surface.** +811 bytes of d.ts:
- `tailwind-methods.d.ts` +382;
- `tailwind-types.gen.d.ts` +254;
- `variant-object.gen.d.ts` +161;
- `core/index.d.ts` +14.

Measured with the model's own token count (`claude -p` usage with and without the text), that is **+373 tokens**. It is read on demand, and prototype runs read part of `tailwind-methods.d.ts` in 12/12 runs.

**Always-loaded prose:**
- README: 0;
- guideline: +1 word at `guidelines/web-development/CLAUDE.md:182`;
- `REFERENCE.md`: +1 line, which is not always loaded.

**Run cost.** The +373 tokens did not raise it in T1 or T2:
- input -22% and -42%;
- output -1% and -25%.

T4 rose by +50% input. There, 3/3 prototype agents and 1/3 base agents explored and hand-augmented `FluentCustomSpacing` for `4.5`. At n=3 that is not attributable to `.size`. Pooled over T1, T2 and T4, input is -5.9% and output -8.4%.

### 4. Five real fleet sites rewritten and compiled

Each repo's TS sources were copied with its own `node_modules`, with `fluent-html` pointed at the RFC prototype build, and compiled with the repo's tsc 6.0.3:

| Site | Form | Before → after (tsc errors) | Same edit on 8.1.0 |
|---|---|---|---|
| `sportoawards/src/app/home/views/home.hero.view.ts:113` | `.h("8").w("8")` → `.size("8")` | 0 → 0 | TS2339 at 113 |
| `stojnica/src/app/kiosk/kiosk.components.ts:62` | `.w("px", 84).h("px", 84)` → `.size("px", 84)` | 0 → 0 | TS2339 at 62 |
| `workshop-toni/src/app/home/views/home.hero.view.ts:279-282` | `.w("14").h("14")` plus `.lg({ w: "[4.5rem]", h: "[4.5rem]" })` → `.size("14")` plus `.lg({ size: "[4.5rem]" })` (on `SvgTag`) | 3 → 3 (pre-existing) | TS2339 at 279 on `SvgTag` |
| `home-page/src/app/launcher/views/launcher.composer.view.ts:180-183` | `.w("12").h("12")` plus `.sm({ w: "14", h: "14" })` → `.size("12")` plus `.sm({ size: "14" })` | 0 → 0 | TS2339 at 180 |
| `competify/src/app/apply/views/apply.form.view.ts:134-135` | multi-line `.w("6")` / `.h("6")` → `.size("6")` | 0 → 0 | TS2339 at 134 |

0 new errors in 5/5. The 8.1.0 column shows that each edit actually exercises the new method.

My independent regex census found 426 equal pairs in the 16 repos, against the RFC's AST count of 423. The 3 extra are 2 JSDoc comments in workshop-toni and 1 site in projects-template.

### 5. Lint convergence on agent output

`prefer-size` (the RFC's plugin build) ran on all 21 T1/T2/T4 outputs:
- 42 findings: 39 in base outputs, plus the 3 T2 prototype `w-5 h-5` pairs.
- 42 autofixed; the 12 fixed files compile against the prototype (`tsc` rc 0, 54 size sites).
- The same files under the plugin derived against 8.1.0 give 0 findings (inert, as claimed).

The template lint scripts run `eslint . --max-warnings=0` (`templates/web/package.json:26`, `templates/full-stack/package.json:33`), so `warn` already blocks in the template.

## Attack

1. **The fix hints are tuned for the two guesses the RFC chose, not the ones Tailwind 4 invites.**
   - Both brands print on every diagnostic.
   - The string brand fires for any non-member string, so `.size("4.5")` and `.size("18")` (valid Tailwind 4 classes) are told to use `.w("screen").h("screen")`.
   - The number brand promises `.setSize(n)` on any receiver, and on `Input` that is a second error (TS2339).
   - 4/6 plausible wrong guesses get no hint or a misleading one, and each size() error costs 88 more tokens than the `.w()` error it replaces. The RFC's `error-quality +0.1` rests on 2 of those 6 cases.
2. **Silent styling of form attributes.**
   - `Select().size("4")` and `Input().size("20")` compile and render a square instead of the attribute.
   - The number brand does not close the string form.
3. **Literal translation keeps the second spelling.** 3/3 prototype agents wrote `.w("5").h("5")` from `w-5 h-5`. Convergence depends on lint running; the in-session harness never runs it.
4. **Cross-family override.** On a component still sized with `.w().h()`, a caller's `.size()` silently loses (Tailwind orders `size-*` first).
5. **Context economy is not established.** T4 went the other way (+50% input), and pooled savings are 5.9%.

## Does it survive?

**Survives with changes.** The agent-facing case is the strongest I have measured for a styling addition:
- 12/12 prototype runs discovered `.size()` from types alone, including the unsteered pixel-spec task, and 51/51 call sites compiled with 0 errors.
- The variant key was used 6/6 where needed.

Each attack fails on measured exposure:
- **Collision bait:** 12/12 runs chose `setSize(4)` and 6/6 chose `addAttribute` for input.
- **Override bait:** 0/3 prototype agents used `.size()` as an override.
- **Off-scale tokens:** the design corpus has 0 of them.
- **Literal `w-5 h-5`:** the second spelling is caught by a rule that runs at `--max-warnings=0` in both templates, and its fix compiles (42/42).

What does not hold is the quality of the two branded hints, which the RFC presents as error-quality credit. The fix is text only and adds no API:
1. Name `Select(...).setSize(n)` instead of a bare `.setSize(n)`.
2. Name the unit overload in the string brand, and add the `.size("4.5")` probe to the table and the fixture.
3. Restate context-economy as mixed (at most +0.05).

Not required, noted:
- The README top-50 table omits `.size`, and discovery did not need it.
- The derived raw-class autofix rewrites off-union tokens into non-compiling calls (`size-4.5` → `.size("4.5")`). This is pre-existing: the 8.1.0 plugin does the same for `w-4.5` → `.w("4.5")`.

## Guardrail check (if this lens owns one)

This lens owns no guardrail outright. It bears on these:
- **§5.12, enforcement over prose:** passes. Discovery came from d.ts alone: 0 README rows, +1 guideline word, +373 on-demand d.ts tokens.
- **§5.7, converge:** passes in agent output. The only second-spelling sites agents wrote (3) were flagged and fixed by `prefer-size`, which blocks at `--max-warnings=0` in the template.
- **§5.4, type-safety:** the union is closed, and 0 agent-written `.size()` arguments fell outside it. The branded arms need the two rewordings above to make the error-quality claim true.
