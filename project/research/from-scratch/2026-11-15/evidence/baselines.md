# From-scratch, Evidence 2: fluent-html 8 baselines

All five baselines are measured (a through e below). fluent-html 8 has **18 escapes** on the XSS fixture set, so K3 ("zero escapes") is a bar the control itself fails. **K2 has to be judged as a ratio within one harness run**: this machine was too loaded for any absolute or cross-run throughput comparison to hold.

Measured at fluent-html `f041a97` (8.1.0), Node v26.0.0.

The machine ran other lanes the whole time: load average 140 to 470 on 10 cores. `npm run build` rewrites tracked files (`dist/` is committed), so the bench ran in a copy: `scratchpad/fh8`, made with rsync. `diff -rq dist/src` showed the copy's fresh build is byte-identical to the tracked `dist/src`. The fixtures therefore import the repo's tracked `dist/src/index.js` directly. Nothing in `src/`, `dist/`, `project/pm/`, the template or the guidelines was touched.

## (a) Throughput and allocation; the bench page

**Bench page:** "Realistic page (~200 tags)", `benchRealisticPage` at `bench/render.ts:111`.
- It has 162 elements and renders to 8,248 B.
- A verbatim copy is in `fixtures/bench/arms/fluent-html-8.mjs`, and its output is in `fixtures/bench/expected.fh8.html`.
- Every prototype renders this page.
- **The K2 metric is build+render per request** (`render(build())`). Real SSR rebuilds the tree on every request. `bench/render.ts:227` measures this as "Build+render realistic (per req)".

**`npm run bench`** (wall clock; 5 runs; the last is in `baselines/npm-bench.txt`):

| Scenario | Results across runs |
|---|---|
| Realistic page, render only | 31.71K, 30.76K, 28.06K, 16.66K, 31.76K ops/s |
| Build+render, realistic | 3.94K, 12.18K, 4.69K, 2.55K, 2.08K ops/s |

The 5.9x spread in build+render comes from processor contention: a process waiting for a core looks slow. **These numbers can't be used to judge K2.**

**`npm run bench:mem`** (`node --expose-gc dist/bench/render.js`; heap growth over 100 iterations):

| Scenario | Heap growth per 100 iterations |
|---|---|
| Realistic construction | 6,695 to 6,755 KB |
| Realistic render | 6,699 to 6,881 KB |
| Flat render | 21,544 to 21,583 KB |

This is heap growth, not allocation.

**Portable harness for K2:** `fixtures/bench/harness.mjs`. Command:
`NODE_ENV=production node --expose-gc harness.mjs --rounds 11 --sample-ms 300 --json arms/fluent-html-8.mjs <arm.mjs>`

- Arms are measured interleaved, and the round order alternates.
- Throughput is ops per CPU-second (`process.cpuUsage`, all threads, so garbage-collection helper threads count). Wall-clock ops/s is kept alongside.
- Allocation is the change in `v8.getHeapStatistics().total_allocated_bytes` per build+render.
- Output equality with `expected.fh8.html` is checked both exactly and ignoring whitespace.

| Run | fh8 build+render (ops/CPU-s) | fh8 render only | fh8 alloc (B/op) | Ceiling arm (ops/CPU-s, B/op, ratio) |
|---|---|---|---|---|
| prod run 1 | 12,071 (10,854 to 13,435) | 23,937 | 139,749 | 265,371, 13,468, 21.0x |
| prod run 2 | 14,694 (11,659 to 15,396) | 28,254 | 140,095 | 291,006, 13,455, 20.1x |
| dev run 1 (devChecks on) | 12,622 (11,936 to 13,217) | 27,312 | 138,145 | 286,528, 13,457, 22.5x |

The ceiling arm is `arms/template-literal.mjs`: hand-written template literals with an escape call on every interpolated value. Its output matches `expected.fh8.html` exactly. It is a calibration, not a design.

**Reading:**
- fh8's absolute throughput moves about 20% between runs, so a prototype is judged by its **median interleaved ratio against fh8 in the same run (at least 0.9)**.
- fh8 allocates about 10x the bytes of a string-building renderer and runs about 20x slower. K2 is therefore easy for any design that builds strings directly. The risk is in designs that keep a retained tree.
- devChecks (fluent-html's development-mode guards) make no measurable difference.

## (b) The escaping model, with file:line

All paths are under `src/`.

**One escaper for text and attributes.**
- `render/escape.ts:16-34` `escapeHtml` rewrites the five characters `& < > " '`.
- `escape.ts:43-45` `escapeAttr` is the same function. That is safe only because every attribute is emitted double-quoted.

**Text.**
- `render/serialize.ts:402` (and `:327` in the stream path) runs `escapeHtml` in the `escape` context.
- RCDATA elements (`textarea`, `title`) take the same path. That is safe because `<` is escaped.

**Attributes.**
- `id`, `class` and `style` go through `escapeAttr` (`serialize.ts:226-230`).
- Typed schema attributes go through `escapeAttr` (`:241`).
- The untyped attribute bag goes through `escapeAttr` (`:256`).
- Attribute names:
  - `addAttribute` and `setDataAttrs` keys are checked in `core/tag.ts:31-41`. The pattern `VALID_ATTR_KEY` is at `:15`, `/^on[a-z]/i` (the `on*` handler block) at `:18`, and the prototype-key block at `:21`.
  - Toggle names are checked at `serialize.ts:273`; `hx-status` keys at `:177`.
  - **`El(tagName)` does not validate the tag name** (`core/utils.ts:8`).

**URLs.**
- `sanitizeUrl` (`escape.ts:74-88`) blocks `javascript:`, `vbscript:` and any `data:` URL except non-SVG image, audio, video and font. It strips the browser's ignored characters first.
- It runs only for typed setters on `href`, `src`, `action`, `formaction`, `data`, `poster` and `cite` (`serialize.ts:15`, `:241`).
- **Not covered:**
  - anything set through `addAttribute` (`serialize.ts:256`). The bench page itself sets `img src` this way.
  - the `ping`, `background`, `xlink:href` and `srcset` attributes
  - `meta http-equiv=refresh`
- `externalUrl` and `assetUrl` (`htmx.ts:54`, `:63`) change the type only; they do no runtime check.

**CSS.**
- `setStyle` and `addStyle` (`core/tag.ts:189`, `:208`) store a raw string, and the attribute is escaped. There is no escaping for CSS values.
- `cssProp` (`core/tailwind-methods.ts:980`, `class-vocab/types.ts:59`) only builds a class token.
- `Style(css)` contents get `sanitizeRawContent`, which neutralizes only `</style` (`serialize.ts:206-215`).
- **Not covered:** a second declaration, a broken-out rule, a comment or `@import` in a `<style>` value.

**Script and JSON in a script tag.**
- `Script(js)` contents neutralize only `</script` (`serialize.ts:206-215`).
- **Not covered:** the `<!--<script>` double-escaped state. The comment at `serialize.ts:200-205` records that as parked.
- There is no JSON-in-script helper.
- `escapeJs` (`escape.ts:100`) is exported and unused. Behaviors emit `data-behavior-*` attributes with no inline JS (`behaviors/emit.ts:1-8`).

**htmx attribute values.**
- `buildHtmx` (`serialize.ts:139-187`) runs `escapeAttr` on every string.
- `vals`, `headers` and `config` objects go through `JSON.stringify`, which is safe because the result starts with `{`.
- **Not covered:**
  - **`js:` / `javascript:` prefixes.** htmx 4.0.0-beta6 runs these as JS in `hx-get`/`hx-post`/… (`htmx.js:550`), `hx-confirm` (`:596`), and the string forms of `hx-vals`/`hx-headers` (`:1868`). fluent-html 8 passes endpoint and confirm strings through unchecked (`serialize.ts:140`, `:156`), and string `vals` too (`:151`).
  - **`[data-]hx-on*` and `data-hx-*` keys** reach the output through `setDataAttrs`. `EVENT_HANDLER_RE` only catches `on*`, and htmx honours the `data-hx-` prefix (`htmx.js:204`).
  - **`hx-trigger` event filters** (`click[expr]`) are JS. They are attribute-escaped only. This is not in the fixture set.
- htmx 4's default `mode: 'same-origin'` (`htmx.js:207`) makes a cross-origin endpoint fail. That is why cross-origin URLs are not scored.

**Explicit bypasses.**
- `Raw()` (`core/raw-string.ts:26`) bypasses escaping.
- `setSrcdoc` (`elements/embedded.ts:26`) escapes the attribute only, and `sandbox` (`:64`) is not required. Untrusted HTML in `srcdoc` therefore runs with the parent page's origin.

## (c) XSS fixture set and checker

**Location:** `fixtures/xss/`. `cases.mjs` holds the cases; `check.mjs` is the checker; it needs `parse5@7.3.0` (run `npm install` there; `node_modules` is gitignored).

**Size:** 206 cases (168 hostile, 38 benign) across 23 contexts:
- text, textarea and title
- attributes: title, data-*, id, class, input value, and a data attribute whose name comes from data
- URLs: href, img src, iframe src, form action, formaction
- CSS: a value in an inline style and a value in a `<style>` element
- JSON in a script tag, and a JS variable in a script tag
- htmx: hx-get, hx-confirm, hx-vals, hx-headers
- iframe srcdoc

**How any renderer plugs in.** A renderer supplies an adapter that exports `name` and `render(ctx, payload)`, and returns the HTML of one element. It returns `{unsupported}` when it has no API for that context, and it may throw to refuse a value.

**The oracle.** The checker appends a sentinel element, parses everything with parse5 (the standard HTML parser), then checks:
- **Structure:** no extra element, the sentinel still present, no text outside the element.
- **Script sinks:** `on*` and `[data-]hx-on*` attributes; URLs whose parsed scheme is `javascript:`, `vbscript:` or a scriptable `data:` type; htmx's case-sensitive `js:`/`javascript:` prefixes; script inside an unsandboxed `srcdoc`; injected JS that actually runs (checked in a `node:vm` sandbox).
- **CSS:** more than one declaration or rule, `@import`, a comment or a backslash in a `<style>` rule.
- **Round-trip:** each benign value must come back unchanged.

**Verdicts:** `escape:xss`, `escape:css`, `legacy`, `safe`, `rejected`, `broken`, `unsupported`.
- `legacy` covers `expression()`, and `url()` inside a colour value, which is invalid CSS. Neither runs in any current browser, so they are reported but not scored.
- **K3 counts xss + css.** The exit code is 1 if that count is above zero.

| Adapter | K3 escapes (xss+css) | legacy | rejected | safe | benign broken |
|---|---|---|---|---|---|
| naive-concat (calibration, no escaping) | 118 (114 + 4) | 5 | 0 | 45 | 4 |
| **fluent-html 8** (`NODE_ENV=production node check.mjs adapters/fluent-html-8.mjs`) | **18 (12 + 6)** | 5 | 2 | 143 | 0 |

**Calibration check.** I read each of the 45 hostile cases the naive adapter passes. All are genuinely harmless:
- single-quote breakouts against double-quoted attributes
- payloads already quoted by JSON
- iframe content, which the parser treats as plain text
- CDATA in the body, which becomes a bogus comment

**fluent-html 8's 18 escapes:**
- **`attr-name` (4 xss):** `setDataAttrs({[k]: v})` writes `data-hx-on:click`, `data-hx-get="javascript:…"` and `data-hx-post="js:…"`. Two other hostile keys are rejected correctly (fail closed).
- **`htmx-get` (2 xss):** `hxGet(externalUrl("js:alert(1)"))` and the `javascript:` version. The uppercase `JAVASCRIPT:` is inert, because htmx's prefix check is case-sensitive and fetch refuses the scheme.
- **`htmx-confirm` (2 xss):** `confirm: "js:…"` and `"javascript:…"`.
- **`json-script` and `js-script-var` (1 xss each):** `Script(JSON.stringify({v:"<!--<script>"}))` swallows the rest of the page.
- **`iframe-srcdoc` (2 xss):** `setSrcdoc(userHtml)` with no sandbox.
- **`style-value` (1 css):** `setStyle(\`color: ${v}\`)` accepts an extra declaration.
- **`style-element` (5 css):** declaration injection, rule breakout (`}` in the value, three cases), and a `/*` comment.

Text, RCDATA, all attribute values, and all five URL sinks set through typed setters had **0 escapes in 110 hostile cases**. The 38 benign cases had 0 broken.

**What a design has to close to pass K3:**
- a JSON-in-script helper that escapes `<` as `<`
- an htmx value type that refuses a `js:`/`javascript:` prefix
- typed CSS values
- `srcdoc` that requires a sandbox or escapes its content as text
- data-attribute keys that refuse `hx-*`

## (d) html-validate

- **Version:** 11.17.0, the newest release older than two weeks (11.18.0 came out on 2026-11-01).
- **Where:** installed in `scratchpad/fs-validate`, with config `{"extends":["html-validate:recommended"]}`.
- **Command:** `npx html-validate bench-page.fragment.html`, and the same for `bench-page.document.html` (the page wrapped in a minimal document).
- **Result: 12 errors, 0 warnings in both**, all `no-implicit-button-type` on the 12 "Add to Cart" buttons. The output is in `baselines/html-validate-fh8.txt`.

All 12 errors come from the page source (no `.setType("button")`), not from the renderer. A design whose `Button` defaults to `type="button"` scores 0 on K4 without anything else improving. Each prototype should write the bench page in its own idiomatic API, and that difference should be named when K4 is read.

## (e) API reference size (the cap)

| File | fluent-html repo `.ai/` (guidelines@ac24da0, 2026-08-03) | projects-template `.ai/` (pulled 2026-10-03) |
|---|---|---|
| `fluent-html.md` | **36,946 B** | 36,123 B |
| `htmx.md` | 30,574 B (one file that still includes routes and behaviors) | 11,024 B |
| `routes.md` | (inside `htmx.md`) | 5,360 B |
| `behaviors.md` | (inside `htmx.md`) | 4,034 B |
| **Total with htmx** | **67,520 B** | **56,541 B** |

Commands: `wc -c` in each `.ai/web-development` directory.

The bench page and the screens use htmx (the cart buttons are `hx-post`), so the htmx reference counts toward the cap.

**Recommendation.** Give the control arm the template set: it predates 8.1.0 less and it is what Claude Code actually loads in projects. That makes the cap per prototype reference **56,541 B**, or 36,123 B without htmx. If the coordinator keeps the task's stated file, the cap is 67,520 B (36,946 B without htmx).

For context, fluent-html's `REFERENCE.md` is 80,719 B and its `CLAUDE.md` 33,706 B.

## Method choices
1. **Bench run in a scratch copy:** `npm run build` rewrites the tracked `dist/`. The copy's build was verified identical.
2. **CPU-time throughput, measured interleaved:** wall clock is meaningless at load average 140 to 470.
3. **K2 under `NODE_ENV=production`:** prod SSR runs that way. Dev mode was measured too, and the difference is within noise.
4. **XSS adapters use each context's idiomatic API:** typed setter where one exists, `externalUrl` for a runtime URL, `setStyle` for a runtime style value, `Script(JSON.stringify(…))` for embedded data. `Raw()` is excluded because it is the declared bypass.
5. **CSS injection counts toward K3 but is reported separately:** the coordinator can exclude it explicitly if wanted.
6. **htmx checks follow htmx's own code (4.0.0-beta6):** case-sensitive prefix match, and cross-origin endpoints are not scored.
