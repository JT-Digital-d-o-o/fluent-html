# Proto: Lean Tags (bake-off prototype)

This is research only. Everything is under `proto-lean-tags/` (`/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15/proto-lean-tags/`). Nothing in fluent-html's `src/`, releases, `project/pm/`, the template, the guidelines or any `CLAUDE.md` was touched, and nothing was committed. Machine: node v26.0.0, darwin, load average 125 to 148 throughout. The bench measures CPU time, so the load affects absolute ops but not the ratios.

## Results against the kills

| Kill | Lean Tags | fluent-html 8 | Holds | Command |
|---|---|---|---|---|
| K1 turns / output tokens | not measured | | needs headless sessions | |
| K2 build+render throughput | **3.90x** (3.59 to 4.37), **3.80x** (3.40 to 4.31) | 1.00 | yes | `npm run bench` (twice, `--json` to `out/bench-run{1,2}.json`) |
| K3 XSS escapes | **0** of 206 (168 hostile: 138 safe, 30 rejected; 38 benign: 0 broken) | 18 | yes | `node ../fixtures/xss/check.mjs xss/adapter.mjs` |
| K4 html-validate errors | **0** | **28** | yes | `sh tools/validate.sh` |
| K5 first-compile | not measured | | needs headless sessions | |

**K2 detail.** Both runs used the shared harness with fh8 as the first arm, interleaved, 11 rounds of 300 CPU-ms each, `NODE_ENV=production`.

| Run | fh8 ops/CPU-s | Lean Tags ops/CPU-s | Ceiling (template literal) | Lean Tags alloc/op | fh8 alloc/op |
|---|---|---|---|---|---|
| 1 | 15,165 | 58,113 | 301,363 | 55.2 KB | 138.4 KB |
| 2 | 12,668 | 47,958 | 275,675 | 55.0 KB | 138.7 KB |

The bench ran on `lean-tags/dist/index.js`, sha256 `a45af83f…` (`out/bench-dist.sha256`). An earlier pair of runs, made before a server-only edit, is in `out/prelim/`: 3.72x and 3.87x.

The output is 8,312 bytes against 8,248 for fh8. `node tools/bench-page.mjs` confirms it equals `expected.fh8.html` once two things are removed: the 12 `type="button"` the API adds by default, and the newlines fh8 puts between siblings.

**K4 detail.** html-validate 11.17.0 with the `html-validate:recommended` config (`out/html-validate.txt`):

| Surface | Lean Tags | fh8 |
|---|---|---|
| Bench page, fragment | 0 | 12 (`no-implicit-button-type`) |
| Bench page, document | 0 | 12 |
| R1 list, R1 empty rows fragment | 0 | 1 (`no-dup-class`), 0 |
| R2 new, R2 invalid 422 fragment | 0 | 1, 1 |
| R3 detail, R3 settled status fragment | 0 | 1, 0 |

## What was built

- **`lean-tags/src/index.ts`** (one file, erasable TypeScript only), compiled to `dist/` by `npm run build`, which runs `tsc`. It is the token-economy `lt.ts` with these changes:
  1. **An aria fix (a real bug).** `{ "aria-invalid": true }` used to render a bare `aria-invalid`, and `{ "aria-expanded": false }` was dropped. Both now render as `"true"`/`"false"`.
  2. **`render(view)`.**
  3. **`serve([handlers…], port)`**: a minimal `node:http` adapter. It routes GET for pages and parts and urlencoded POST, coerces inputs by the route table, and answers 404 when an input will not coerce. It falls through to the next route, so `/projects/new` still matches when `/:id` is declared first. A redirect to an htmx request becomes `HX-Redirect`, as the template does it.
  4. **`Dispatch` typed so `serve()` accepts real handler tables.** Compiling the reference's examples showed the first version rejected every table: the key parameter is contravariant.
- **`lean-tags/check.mjs`** (`lean-tags-check`). Tailwind v4's own design system checks every `tw` literal against the app theme. Two additions:
  - **Hints come from Tailwind's class and variant lists:** `text-smm` → `text-sm`, `rounded-crd` → `rounded-card`, `hovr:` → `hover:`.
  - **A new rule, "classes written as text."** This is the screen's `lt-silent` finding: `div("flex gap-4", …)` passes tsc and renders the class names as visible text. On `probes/` it flags all 3 seeded cases and none of the 4 plain-text controls. Across `screens/` and `support/` it found 0 problems in 139 classes (`out/check.txt`).
- **`lean-tags/REFERENCE.md`, the API reference for Claude Code.** It is 1,572 words and 10,342 bytes. The cap I used is fluent-html 8's agent-facing head doc, `README.md`, at 2,105 words and 14,932 bytes (`wc -w -c`, `out/reference-size.txt`). Evidence 2's own number is not on disk, so if it differs, compare against it. The reference has no em dashes. Every snippet in it compiles: `probes/reference-examples.ts` passes `tsc -p probes/tsconfig.reference.json` with 0 errors.
- **The three screens:** `screens/lt/`, the token-economy screens with `import … from "lean-tags"`.
  - `npm run typecheck` passes with 0 errors.
  - `node tools/run-screens.mjs` passes 10/10 behaviour checks. The 404 check is now actually awaited; before, it was an un-awaited async function inside a sync `check`.
  - `node tools/serve-smoke.mjs` runs the same routes over real HTTP and passes 8/8.
- **Escaping test:** `test/escaping.test.mjs`, run with `node --test test/*.test.mjs`, gives **255 tests, 255 pass** (`out/test-escaping.txt`). It covers:
  - the shared checker's verdict on all 206 cases, one subtest each;
  - exact entity-encoded output for every text, RCDATA and attribute case;
  - URL attributes (`href`, nested `href`, `formaction`) never keep a `javascript:`, `vbscript:`, `data:text` or `data:image/svg` scheme after WHATWG parsing;
  - the throws for `class`/`on*`/`hx-*`/`data-hx-*`/bad names, raw strings in `tw` holes, bad tokens, `js:` htmx URLs and CSS injection;
  - aria booleans.
- **Seeded type mistakes:** `probes/mistakes.ts` against the dist `.d.ts` gives 21 diagnostics for 21 mistakes, with 0 "No overload matches" lists (`out/probe-mistakes.txt`). That matches token-economy's result.

## The fluent-html 8 control for K4: a finding about the comparison itself

To compare the same screens, I made the token-economy's fh8 screens runnable under `control/`. The setup:
- the template's layout and directory structure;
- keep-fh9's copy of the template `swap-verbs.ts`;
- a theme augmentation with the same colors as `support/theme.css`;
- a document shell identical to Lean Tags' `Layout`.

**As written, those screens do not compile against fluent-html 8.1.0: 8 tsc errors in 5 kinds, and one of them throws at runtime.** They are:
- `.setAriaLabel` does not exist (the runtime throw);
- `P(x.description)` with `string | null`, twice;
- `.variant("backdrop")` and `.variant("aria-invalid")` are not typed variants;
- `f.error(...)` returns `View`, which has no `.apply`, three times.

I fixed each the idiomatic way: `.setAria({ label })`, `?? ""`, `"[&::backdrop]"` and `"aria-[invalid=true]"`, and `Span(f.error(…)).apply(error)`. After the fixes, `tsc -p control/tsconfig.json` gives 0 errors.

So the token-economy's 21% and 34% source savings were counted against fh8 code that did not compile. The working version is slightly longer, which makes the savings slightly larger. I did not recount them.

The 4 `no-dup-class` errors are fh8's `.nav()` verb adding `cursor-pointer` to an element whose preset already has it.

## Open for the bake-off

- **K1 and K5 are not measured.** The token-economy's own prediction for K1 is 24 to 33%, so it can fail.
- **Safety parity has one gap.** Classes written as a text child are caught by `lean-tags-check`, not by tsc. A survivor therefore needs both commands, as fh8 needs tsc plus its lint.
- **The `#main` contract is still hand-kept.** The layout's `main` must carry `id: "main"`; the reference says so, but nothing checks it.
- **A clean bake-off directory needs:** the `lean-tags/` package (exports `dist/`; Node will not type-strip `.ts` inside `node_modules`), `typescript`, and `tailwindcss@4` for the check. Plus a Standard Schema library, or `support/zod.ts`.

## Commands (run from `proto-lean-tags/`)

`npm install --offline` (links `lean-tags`), `npm run build`, `npm run typecheck`, `npm run screens`, `npm run control`, `npm run validate`, `npm run xss`, `npm test`, `npm run smoke`, `npm run bench`, and `TAILWIND_FROM=/Users/tony/jt-digital/fluent-html npm run check:classes`.
