# View-layer mistake suite (2026-11-16)

`$M` is `/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15/mistakes`. The commands are numbered C1 to C5 in the last section.

## Result

Share of kinds each design rejects before the code runs (tsc or its own check), from C3 and C4:

| | fluent-html 8 | Page Parts | Lean Tags | Fluent Nine | Correct by construction |
|---|---|---|---|---|---|
| Rejected before run | **13 of 34 (38%)** | **15 of 33 (45%)** | **18 of 34 (53%)** | **15 of 34 (44%)** | **24 of 34 (71%)** |
| of which tsc / check | 11 / 2 | 11 / 4 | 14 / 4 | 15 / 0 | 24 / 0 |
| Run time: throws | 0 | 1 | 1 | 4 | 2 |
| Run time: absorbed | 1 | 4 | 3 | 1 | 3 |
| Law (html-validate) | 9 | 7 | 7 | 8 | 0 |
| Nowhere (ships) | 11 | 6 | 5 | 6 | 5 |

- **Absorbed** means the seed compiles and runs, but the design makes the mistake harmless; the oracle finds no bug in the output.
- **Page Parts has 33 kinds, not 34.** TW-5 has no form there: the `class` prop is its only class sink.
- **Both full runs agree.** Every cell matched between the two runs (C2).

## Kind by kind

Generated as `$M/results/table.md` (C3):

| Seed | Kind | fh8 | Page Parts | Lean Tags | Fluent Nine | CBC |
|---|---|---|---|---|---|---|
| NEST-1 | li outside a list | law | law | law | law | tsc |
| NEST-2 | link in a link | law | law | law | law | tsc |
| NEST-3 | form in a form | law | law | law | law | tsc |
| NEST-4 | link in a button | law | law | law | law | tsc |
| A11Y-1 | input, no label | nowhere | nowhere | nowhere | nowhere | tsc |
| A11Y-2 | img, no alt | law | tsc | tsc | law | tsc |
| A11Y-3 | button, no name | law | law | law | law | tsc |
| ATTR-1 | bad attribute value | tsc | tsc | tsc | tsc | tsc |
| BTN-1 | Cancel button, no type, in a form | law | absorbed | absorbed | absorbed | absorbed |
| ID-1 | duplicate id | law | law | law | law | runtime (throws) |
| ID-2 | one form twice, derived ids repeat | law | law | law | law | runtime (throws) |
| TW-1 | unknown class | tsc | check | check | tsc | tsc |
| TW-2 | palette colour | tsc | check | check | tsc | tsc |
| TW-3 | unknown variant | tsc | check | check | tsc | tsc |
| TW-4 | dynamic class | tsc | check | tsc | tsc | tsc |
| TW-5 | Tailwind in the raw class sink | check | n/a | tsc | tsc | tsc |
| TW-6 | classes written as text | nowhere | nowhere | check | nowhere | tsc |
| HX-1 | status request aimed at the list region | tsc | absorbed | nowhere | tsc | nowhere |
| HX-2 | fragment route answers another region | tsc | absorbed | tsc | tsc | tsc |
| HX-3 | 422 not rooted at the form region | nowhere | tsc | tsc | nowhere | tsc |
| HX-4 | poll never stops | nowhere | nowhere | nowhere | nowhere | nowhere |
| HX-5 | raw hx-* attribute | check | tsc | tsc | runtime (throws) | tsc |
| HX-6 | fragment route as a page link | tsc | tsc | tsc | tsc | tsc |
| HX-7 | hand-written htmx URL | tsc | nowhere | nowhere | tsc | nowhere |
| HX-8 | stale region after a targeted swap | nowhere | nowhere | absorbed | nowhere | nowhere |
| FORM-1 | field not in schema | tsc | tsc | tsc | tsc | tsc |
| XSS-1 | unescaped HTML | nowhere | tsc | tsc | tsc | tsc |
| XSS-2 | javascript: in a link | absorbed | absorbed | absorbed | runtime (throws) | absorbed |
| XSS-3 | javascript: in hx-get | nowhere | runtime (throws) | runtime (throws) | runtime (throws) | absorbed |
| XSS-4 | hx-on from data | nowhere | tsc | tsc | runtime (throws) | tsc |
| XSS-5 | data inside trusted markup | nowhere | tsc | tsc | tsc | tsc |
| XSS-6 | style from a data string | nowhere | tsc | tsc | tsc | tsc |
| PURE-1 | view does I/O | nowhere | nowhere | nowhere | nowhere | nowhere |
| PURE-2 | forgotten union state | tsc | tsc | tsc | tsc | tsc |

### By group

Rejected before run, from C4:

| Group | Kinds | fh8 | PP | LT | F9 | CBC |
|---|---|---|---|---|---|---|
| html | 11 | 1 | 2 | 2 | 1 | 8 |
| tailwind | 6 | 5 | 4 of 5 | 6 | 5 | 6 |
| htmx | 8 | 5 | 3 | 4 | 4 | 4 |
| forms | 1 | 1 | 1 | 1 | 1 | 1 |
| security | 6 | 0 | 4 | 4 | 3 | 4 |
| purity | 2 | 1 | 1 | 1 | 1 | 1 |

## Safety parity

fluent-html 8 rejects 13 kinds before run (C4): ATTR-1, TW-1 to TW-5, HX-1, HX-2, HX-5, HX-6, HX-7, FORM-1 and PURE-2.

| Design | Not rejected by its own check | Verdict |
|---|---|---|
| Fluent Nine | HX-5: `addAttribute("hx-get")` passes tsc and throws at render. fh8 rejects it in lint (`prefer-htmx-api`, which counts because the template lints with `--max-warnings=0`). | **Fails** on one kind. It is caught before deploy only if a test renders that view. |
| Lean Tags | HX-1: `wire({ get: "/projects/1/status", target: "#project-list" })` takes strings. HX-7: `wire({ get: "/projects/rowz" })`. | **Fails** on two kinds; nothing catches either. |
| Correct by construction | HX-1: `wire({ get: projects.status({ id }), target: projects.rows() })` compiles. HX-7: `wire({ get: local("/projects/rowz") })`. | **Fails** on two kinds; nothing catches either. |
| Page Parts | HX-7: `hx({ get: local("/projects/rowz") })`, nothing catches it. HX-1 and HX-2 are absorbed: the region is addressed by its target, so an answer cannot miss it. TW-5 has no form. | **Fails** on HX-7 only. |

The common hole is the htmx escape hatch. fh8's `hx()` accepts only a route or an `externalUrl`, and its verbs type the target against the route. All three from-scratch hatches accept a hand-written same-origin path, and Lean Tags' and CBC's also accept any target. Closing the hatch is a small change: take only route refs, and pin the target to the part the route answers.

## What the suite says

1. **Correct by construction earns its lead in HTML content models.** It rejects 8 of 11 HTML kinds by tsc and throws on the other two in development (duplicate ids, including one form shown twice). Every other design leaves the same kinds to html-validate, which a template app runs only if a test renders that state.
2. **Security is where fh8 is weakest.** It catches 0 of 6 before run, and 5 of 6 ship (C2).
   - These five ship: `Raw(data)`, `Raw(\`…${data}\`)`, `hx(externalUrl("javascript:…"))`, `addAttribute("hx-on:click", data)` and `setStyle(\`color: ${data}\`)`.
   - Every challenger gets those to 0 shipped.
3. **No design catches three kinds:**
   - a poll that never stops (HX-4);
   - a view doing I/O (PURE-1);
   - the stale region. Lean Tags avoids that only at run time, because its `serve()` answers an htmx redirect with `HX-Redirect`. In this seed CBC ships it: the library has no server, so the 303 reaches htmx.

   These three are open for the rewrite PRD. Two possible answers: a poll whose stop condition is part of its type, and a targeted swap that must name its reason (the house rule).
4. **A button's type defaults to `button` in every challenger,** which absorbs BTN-1 (verdict harvest 1). In fh8 the same seed reaches html-validate only (`no-implicit-button-type`).
5. **HX-3 (the 422 region) is unchecked in fh8 and Fluent Nine,** because the template's `renderView` checks nothing. The three designs that own the form's answer reject it with tsc.

## Corrections to the inputs

- **The todo's parity list is wrong on "unescaped HTML".** It says fluent-html 8 rejects it, but 8.1.0 does not, with tsc or with lint. `Raw(string)` compiles, and `seeds/XSS-1/fh8.ts` is `nowhere` (C2). C5 agrees: tsc gives no diagnostic on the P7, P10 or P11 lines of `proto-fluent-nine/probes/parity/fh8.ts`. P11 (`cssClass`) is rejected only by eslint (`no-tailwind-in-cssclass`), which is TW-5 here. The parity tool itself prints these rows as accepted for fh8; only the todo text overstates it.
- **Page Parts' class check flags TW-4 for the wrong reason.** It catches `class: \`bg-${tone}/20\`` because it reads the template head "bg-" as an unknown class, not because it sees a dynamic class.

## How it is built

The layout follows `benchmark/design.md`:

- **Kinds:** `kinds.mjs` lists all 34, and `node run.mjs toml` writes each `seeds/<ID>/seed.toml` (id, kind, group, source, mistake, oracle).
- **Seeds:** one file per design, `seeds/<ID>/<arm>.ts`, with each mistake line marked `// ✗`. The Page Parts TW-5 slot holds a `.na` note instead.
- **Arms:** each design's app lives in `arms/<arm>/app.ts`. The prototypes' own screens are reused for Lean Tags, CBC and Page Parts.
- **Clean controls:** each arm has `arms/<arm>/clean.ts`. Gate G1 holds on all 5.

Where each seed is tagged:

1. **tsc:** the design's own tsc (5.9.3) rejects it.
   - The diagnostic must land on a `// ✗` line; one anywhere else is a gate failure.
   - After the fixes recorded below, every rejecting seed has its diagnostic on a `// ✗` line. The only stray left is a follow-on error (CBC PURE-2, line 4).
2. **check:** the design's documented check rejects it.

   | Design | Check command |
   |---|---|
   | fh8 | `eslint` with eslint-plugin-fluent-html 4.1.0, at `templates/full-stack/eslint.config.mjs` levels, `--max-warnings=0` (`$M/eslint.fh8.config.mjs`) |
   | Page Parts | `tools/check-classes.mjs tools/theme.css` |
   | Lean Tags | `lean-tags/check.mjs support/theme.css` |
   | CBC | `tools/check.mjs <tsconfig> support/theme.css`, its findings beyond tsc |
   | Fluent Nine | none: its reference says tsc is the only check |

3. **runtime:** the seed is run with `node arms/common/run-seed.mjs` in development mode.
   - **Throws:** the run fails with the design's own error.
   - **Absorbed:** the output is harmless by the oracle.
4. **law:** html-validate 11.17.0 (recommended preset) on every answer, counted only through a rule that states the kind (`LAW_RULES` in `oracles.mjs`).
   - Incidental rules are recorded in the `lawOther` column and do not count. Without this filter, `no-inline-style` would have caught XSS-6 and `wcag/h37` the injected `<img>`.
   - This is the bake-off's K4 check, not a test any design ships.
5. **nowhere:** no rung goes red and the oracle finds the bug in the output.

Each cell takes the first rung in that order (tsc, check, then a throw, law, absorbed), and every rung runs on every seed.

**Oracles** (G2): `oracles.mjs` holds one oracle per kind, and the same file serves every design.

- Each checks the rendered answers (parse5, or the raw markup for nested `<a>` and `<form>`, which a parser would repair).
- Every `law` or `nowhere` cell has its oracle reading "live", and every absorbed cell "not-live". The exception is PURE-1, which has no oracle and is judged by reading.

## Decisions taken without asking

- **"fluent-html 8" is the package as the template uses it.**
  - The repo's `dist`, `package.json` 8.1.0.
  - The template's swap verbs, via keep-fh9's copy of `swap-verbs.ts`.
  - A closed theme.
  - A 20-line stand-in for the template's `define-controller.ts` render contract (`arms/fh8/app.ts`): `page()` and `fragment()` typed from the route stance (`RootedView<IdOf<C>>`), and `renderView` checking nothing.
  - Not run: the template's `npm run css` extractor. It rejects non-literal styling arguments, which eslint already rejects here (TW-4).
- **Fluent Nine uses the same template stand-in.** Its package has no handler layer.
- **Import paths.** Fluent Nine is imported as `fluent-nine`, a symlink to `proto-fluent-nine/pkg`, because inside the fluent-html repo the bare name `fluent-html` resolves to the repo itself. A `$M/package.json` scopes the suite for the same reason.
- **Lean Tags has no tools of its own,** so it runs with CBC's tsc (5.9.3) and Tailwind 4.3.3.
- **Each seed is the most natural spelling in that design's own API, documented hatches included:**
  - `local()` for a hand path in Page Parts and CBC;
  - `externalUrl` / `external` / `url` for a URL from data;
  - an object lookup over a union in Page Parts;
  - `match` in Lean Tags and CBC;
  - `Match` in fh8 and Fluent Nine.

  Where the kind cannot be expressed as such, the attempt is still written: an attempt that does not compile counts as tsc, one that compiles and is harmless counts as absorbed. That is the benchmark's probe convention.
- **Redirect answers in HX-8** carry `navigates`:
  - true for Lean Tags, whose `serve()` answers an htmx request with `HX-Redirect` (`lean-tags/dist/index.js:687`);
  - false for CBC, which has no server, so a 303 reaches htmx and is swapped into the target.
- **The payload carries `alt=""`,** so html-validate cannot catch the XSS seeds through the injected `<img>`.

## Kinds added from the first round's evidence

These ten come from the verdict, the parity list and the todo, beyond the 24 in the brief:

- **Verdict harvest:** BTN-1 (harvest 1), ID-2 (harvest 8), XSS-5 (harvest 4), TW-6 (harvest 9).
- **Safety parity list:** XSS-6 (P10), HX-6 (P5), HX-7 (P6), ATTR-1 (P8), TW-5 (P11).
- **Todo:** HX-8, the stale region.

## Limits

- **A seed is my writing of a mistake.** The table shows whether a design rejects it, not how often anyone makes it. A port is a judgement, and no second reader has checked these ones yet (step 4 of the benchmark).
- **Law is my harness, not a shipped test.** In a template app it fires only where a test renders that state.
- **Page Parts' HX-1 counts as absorbed, but the intent is still lost.** The answer always fits its target, so the kind's failure cannot happen. A request meant to refresh the status region that names the list region still refreshes the list region, and nothing says so.
- **The prototypes are research code that other sessions are changing.** `proto-fluent-nine/pkg/dist` was rebuilt at 08:26 today. Re-run `node run.mjs clean` and `node run.mjs all` before quoting numbers later.

## Commands

All run from `$M`:

- **C1:** `node run.mjs clean`: G1, 5 of 5 clean controls green on every rung.
- **C2:** `time node run.mjs all --jobs 4`, run twice: 101.9 s and 112.1 s wall. Cells were identical (`diff` of `cut -f2,4,5` on each `results/<arm>.tsv`). Per-seed rows, including the first diagnostic of each rung, are in `results/<arm>.tsv`; the logs are `results/run1.log` and `results/run2.log`.
- **C3:** `node run.mjs table` writes `results/table.md`, never edited by hand.
- **C4:** `node groups.mjs`: shares by group and the safety-parity misses.
- **C5:** `proto-fluent-nine/node_modules/.bin/tsc -p probes/parity/tsconfig.fh8.json --pretty false`, run in `proto-fluent-nine`. It gives errors on P1 to P6, P8 and P8b, and none on P7, P10 or P11.

Nothing was committed. Nothing in `src/`, releases, `project/pm/`, the template, the guidelines or any `CLAUDE.md` was touched. The other entries in `git status` are other sessions' work.
