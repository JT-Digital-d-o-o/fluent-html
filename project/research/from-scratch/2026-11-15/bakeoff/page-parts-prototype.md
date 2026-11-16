# Page Parts prototype: bake-off measurements

Everything is under `project/research/from-scratch/2026-11-15/proto-page-parts/` (called `P/` below). Nothing in fluent-html's `src/`, its releases, `project/pm/`, the template, the guidelines or any `CLAUDE.md` was touched, and nothing was committed. `git status --short src` is empty. Only K2, K3 and K4 are measured here. K1 and K5 need the headless sessions.

## What was built

**Method choice: the prototype starts from the semantic-layer kit.** It is the same design, and rewriting it would only add noise to the comparison. `screens/projects.ts` is byte-identical to the semantic-layer screens (checked with `cmp`). I added what a bake-off arm needs to run in a clean directory, and nothing else:

- **Renderer (`kit/core.ts`).** I added raw elements for the rare form or embed no part covers: `Form`, `Input`, `Textarea`, `Select`, `Option`, `Iframe`, plus `Pre`, `Code`, `Blockquote`, `Figure`, `Figcaption`, `Fieldset`, `Legend`, `Hr` and `Br`.
  - `Iframe` must have a `title`.
  - URL attributes take a checked `Href`, never a string: `Form` `action`, `Button` `formaction` and `Iframe` `src`.
  - The old XSS adapter used a private serializer for these sinks. The new one uses only public exports.
- **htmx and assets (`kit/parts.ts`).** The document head now links the built CSS and htmx 4. `configure({ assets: { css, htmx } })` sets the URLs, defaulting to `/app.css` and `/htmx.js`.
- **Server (`kit/node.ts`).** `listen(site, { port, publicDir })` is a 33-line `node:http` adapter. `server.ts` serves the three screens, and was smoke-tested with curl:
  - `/projects`: 200;
  - a region request: the `<div id="projects-rows">` fragment alone;
  - an invalid htmx POST: 422 with the form;
  - `/app.css`: `text/css`.
- **Tailwind.** `tools/theme.css` is both the build input (`@import "tailwindcss" source("..")`, with the palette closed) and the theme the class check reads.
  - `tools/check-classes.mjs` now takes directories. `npm run check` runs `tsc` and then the class check.
  - `npm run css` builds the CSS with the Tailwind v4.3.3 CLI. There is no safelist and no extractor.
  - `tools/css-coverage.mjs` confirms every class the screens render has a rule in the built CSS.
- **htmx 4 wire, checked against `htmx.org` 4.0.0's dist** (in `competition/node_modules`):
  - `HX-Target` is sent as `tag#id`, which is how the kit finds a region (line 428).
  - `HX-Location` is handled before the 204 no-swap rule (lines 588-597 and 655), so redirecting with a 204 works.
  - It was not run in a browser.
- **`REFERENCE.md`** is 10,106 B (`wc -c`), against the control's 56,541 B cap. It covers the feature file, the app, parts, answers, views, form fields, raw elements, Tailwind, the htmx wire table and the hatches.
  - `test/reference.test.ts` compiles its examples verbatim (only a stand-in db and the optional props written out) and checks they answer as the reference says.

## Results

| Kill | Measured | Command | Holds? |
|---|---|---|---|
| K2 throughput ≥ 0.9x fluent-html 8 | run 1: 3.518x (3.423-4.08); run 2: 3.324x (3.072-3.956) | harness, below | yes |
| K3 zero escapes | 0 of 206 cases | `node ../fixtures/xss/check.mjs xss/adapter.mjs` | yes |
| K4 html-validate errors ≤ fluent-html 8 | 0 on the bench page and the three screens; fluent-html 8 has 12 on its bench page | `node tools/validate-summary.mjs …` | yes |
| K1 turns or tokens | not measured here | bake-off | open |
| K5 first-compile | not measured here | bake-off | open |

**K2 detail.** The command was `NODE_ENV=production node --expose-gc ../fixtures/bench/harness.mjs --rounds 11 --sample-ms 300 --json ../fixtures/bench/arms/fluent-html-8.mjs bench/arm.mjs`, run twice with fluent-html 8 as the first arm. fluent-html 8 came from its tracked dist at `eef033e`. The machine was loaded (load average 145-165), so the metric is ops per CPU-second.

| Run | Arm | build+render ops/CPU-s (range) | alloc B/op |
|---|---|---|---|
| 1 | fluent-html 8 | 14,955 (12,627-15,510) | 138,870 |
| 1 | Page Parts | 52,373 (51,191-55,243) | 56,995 |
| 2 | fluent-html 8 | 15,318 (12,196-15,773) | 138,717 |
| 2 | Page Parts | 50,073 (47,896-54,686) | 57,597 |

- fluent-html 8's output equals `expected.fh8.html` exactly.
- Ours is 8,312 B against 8,248 B. It matches once whitespace and the default `type="button"` on the 12 cart buttons are ignored (`node bench/write-output.mjs`).
- Page Parts builds its HTML at construction, so render-only throughput is not comparable. K2 uses build+render.

**K3 detail.** The output is in `out/xss-run1.txt`.

- 165 hostile cases: 155 safe and 10 rejected (6 `data` keys taken from data, 4 non-same-origin htmx URLs refused by `local()`).
- 37 benign cases: all round-trip, none broken.
- 4 unsupported cases, all `htmx-confirm`. By design there is no `hx-confirm` sink: an action's confirm is a native `<dialog>` whose text is escaped as text.
- `rcdata-title` now goes through a real `Page({ title })` document served by `app()`.

**Escaping test (`P/test/xss.test.ts`, run with `node --test`).** It has two layers:

1. It runs the shared checker with `--json` and asserts:
   - 0 escapes;
   - 0 broken benign cases;
   - the only unsupported context is `htmx-confirm`;
   - all 206 cases ran.
2. It covers sinks only parts have. 33 distinct hostile fixture payloads (from the text, attribute, URL, htmx-get and htmx-vals contexts) go through 7 requests:
   - page title and description, Search label and placeholder, Link params and query, List key and row;
   - the search box's echoed query;
   - a region requested alone;
   - a path param, the confirm dialog's text, and a prefilled form;
   - a form 422 with htmx, from a server `invalid()` message;
   - the same 422 without htmx, as a full page;
   - a form 422 from the schema, echoing the rejected value.

   Each answer is parsed with parse5. It must have exactly the element-and-attribute-name shape a benign `"x"` gives, and no script sink.

**Negative control.** With escaping turned off in `kit/core.ts` (`esc` returning its input), 8 of the 9 tests fail. The ninth is the payload-count guard, which does not depend on escaping. The file was restored, and the suite is 9/9 again.

**K4 detail** (`P/out/html-validate.txt`, html-validate 11.17.0 pinned to the baseline's version, `html-validate:recommended`):

| Output | Errors |
|---|---|
| Our bench page, fragment and document | 0 and 0 |
| Our 9 screen answers (R1 list, rows, empty; R2 form, 422 fragment, 422 no-JS page; R3 detail, status running, status done) | 0 each |
| fluent-html 8 bench page, fragment and document, validated in the same run | 12 and 12 (`no-implicit-button-type`) |
| keep-fh9 lane's compiled fluent-html 8 renders of the reference screens (copied to `out/control-fh8/screens/`) | 0 each |

## Other evidence for the bake-off

- **Tests:** 14/14 pass (`npm test`): the three screen behaviour tests, the XSS suite and the reference test.
- **Seeded mistakes:**
  - 18 of 18 compile errors (`npx tsc -p probes/tsconfig.json` gives 18 errors on 18 distinct lines; `out/probes-tsc.txt`). The two the semantic layer marked as runtime checks, M12 (an image with no `alt`) and M13 (a page view that does not return `Page()`), now fail at compile time too.
  - 6 of 6 class mistakes rejected, each with its reason (`out/probes-classes.txt`): unknown class, palette literal, misspelt variant, an unknown token inside `cx()`, one inside a lookup, and one in `configure` styles.
- **Edit-loop cost:** `tsc` takes about 1.5 s and the class check 0.31 s (`/usr/bin/time -p`, 3 runs each).
- **Size:** the kit is 1,081 lines (`wc -l kit/*.ts`) and needs no runtime dependencies.

## Caveats

- **Not run in a browser.** The htmx behaviour is read from the htmx 4.0.0 source. That includes the 204 plus `HX-Location` redirect, the `HX-Target` region detection, `hx-disable="find button"` and the morph swaps.
- **The screens comparison is weaker than the bench comparison.** The fluent-html 8 screens come from another lane and render different fixture data, so only the bench page is a like-for-like K4 comparison.
- **Unscored contexts.** The 4 `htmx-confirm` cases are listed as unsupported and not scored. The part-sink test covers the confirm dialog's text instead.
- **Dev tools were installed into `P/node_modules`** (kept out by `P/.gitignore`), all pinned: html-validate 11.17.0, parse5 7.3.0, tailwindcss and @tailwindcss/cli 4.3.3, typescript 5.9.3, @types/node 24.10.1.

## Commands (run from `P/`)

- `npm run check`
- `npm test`
- `npm run css`
- `npm run xss`
- `npm run bench`
- `npm run validate`
- `node server.ts`
