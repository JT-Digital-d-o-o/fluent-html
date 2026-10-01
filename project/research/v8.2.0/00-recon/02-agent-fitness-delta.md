---
recon: 02-agent-fitness-delta
date: 2026-09-30
subject: agent-fitness protocol phases 2 (generation) and 3 (error probes) against shipped 8.1.0
versions:
  fluent-html: 8.1.0 (npm pack --ignore-scripts of fluent-html @ 656e812, dist built 2026-09-30 22:50)
  eslint-plugin-fluent-html: 4.1.0 (pack of fluent-html-eslint-plugin @ 9ae5212)
  fluent-html-tailwind-extractor: 3.0.0-unreleased (pack @ 83e81d2)
  projects-template: 3.7.0 @ 6f63b33 plus 37 uncommitted working-tree files (scaffold .template.json records dirty:true)
  guidelines: 95067fa (git archive HEAD, copied to .ai/ + CLAUDE.md for the guided condition only)
  runtime: htmx.org 4.0.0, tailwindcss 4.3.3, typescript 6.0.3, eslint 10.11.0, node v26.0.0, prisma 7.10.0
  agent: Claude Code 2.1.285 native binary (VS Code extension), model claude-opus-5-5, effort xhigh
  scaffold: full-stack, sqlite, modules [auth] (requires closure added account, profile)
commands_run:
  - "npm pack --ignore-scripts --pack-destination <scratch>/packs (fluent-html, eslint plugin, extractor)"
  - "tsx scaffold.mts: resolveSetupConfig + scaffold() from projects-template/templates/full-stack/setup.ts into scratch; npm install with file: tarballs"
  - "baseline: tsc --noEmit (0), eslint . (0), npm run css (ok), vitest unit 403/403, integration 90/90"
  - "claude -p --restricted --add-dir <cwd> --settings settings.json --disable-slash-commands --strict-mcp-config --no-session-persistence --output-format stream-json --verbose --model claude-opus-5-5 --effort xhigh --permission-mode acceptEdits (env -i, CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1), x6 runs + 7 canaries"
  - "per run: tsc --noEmit --pretty false; eslint . -f json; npm run css; vitest --project unit / integration; Playwright 1.63 acceptance (25 checks) against the booted app on vendored htmx 4.0.0; rendered-DOM class-family scan of /team and the 422 form"
  - "pure-prior: TS-AST call/import inventory vs runtime walk of dist/src/index.js (227 exports, 362 methods, 138 factories); supplementary tsc against bare 8.1.0 and inside the template"
  - "phase 3: 33 probe fixtures; tsc --pretty false; eslint -f json; generateFluentSafelist per file vs empty baseline; postcss/Tailwind build + byte offsets; NODE_ENV=development tsx render per probe; defineController boot call"
context_withholding:
  method: "separate claude -p processes (not subagents), cwd under the scratchpad (outside <org-root>), --restricted (ignores user/project/local settings files, confines file tools to working dirs), env -i (drops the parent's CLAUDE_* env incl. messaging socket), deny rules for Read(//<org-root>/**), Read(~/.claude/**), npx/npm/node/tsc/eslint/git/curl, WebFetch/WebSearch/Task/Agent. CLAUDE.md is loaded only via --add-dir <cwd> + CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1, identical flag set for all conditions; the only variable is which files exist."
  bare_mode: "not used: no ANTHROPIC_API_KEY in the environment, and --bare authenticates strictly via ANTHROPIC_API_KEY/apiKeyHelper (claude --help). --restricted gives the same settings/CLAUDE.md isolation with OAuth."
  user_level_audit: "~/.claude/CLAUDE.md 1095 bytes, 0 fluent/htmx/tailwind matches; ~/.claude/skills (commit, deploy-dev, deploy-prod, push, ssh, synced office skills) 0 matches; installed plugin rust-analyzer-lsp only; settings.json has no hooks, but carries 73 permissions.additionalDirectories incl. fluent-html/plan, which a non-restricted child inherits into its system prompt (canary c0) and --restricted removes (canaries A/B)"
  pure_prior: "0 CLAUDE.md/memory (canary cond-pp: NONE); tools [Write] only; skills []; mcp []; 6,534 starting context tokens; 0 of 11 access fields outside cwd; 0 reads of anything"
  blind: "0 CLAUDE.md/memory (canary cond-blind: NONE); CLAUDE.md, AGENTS.md, .ai/, .claude/, project/ui/CLAUDE.md deleted; 6,651 starting context tokens; 0 of 343 access fields outside cwd; read node_modules/fluent-html README.md 2x per run plus dist/src d.ts/src; residual leak: git status in the system prompt shows 'D project/ui/CLAUDE.md' (existence only, content never loaded)"
  guided: "1 CLAUDE.md loaded (canary cond-guided quotes '**Stack:** Fastify v5 + TypeScript + fluent-html + HTMX + Tailwind CSS (SSR app)' and the swap-verbs bullet); 26,230 starting context tokens (+19,579 vs blind); 0 of 312 access fields outside cwd; opened .ai/ files 18 times across the two runs"
  residual_all_conditions: "system prompt carries the account email (domain jtdigital.si), the cwd path (contains '<project>'), and a commit-attribution reminder; no API content (canary answers NONE for pp/blind)"
---

# 02: Agent-fitness delta against shipped 8.1.0

Phases 2 and 3 of the [agent-fitness protocol](../../../../../projects-template/project/research/agent-fitness/protocol.md),
run with context **actually withheld** this time and proven per condition. Raw data:
[`data/02-phase2-generation/`](data/02-phase2-generation/) (generated code as patches, per-run tsc/eslint/css/
acceptance output, audits, gzipped stream-json transcripts, canaries, harness scripts) and
[`data/02-phase3-probes/`](data/02-phase3-probes/) (33 fixtures, tsc/eslint/extractor/Tailwind/runtime output).

## Headline

- **Prose is priced at ≤ 0 on every layer measured.** Blind and guided both shipped a working feature on
  a single pass: tsc 0/0 vs 0/0, browser acceptance 25/25 in all four runs, full test suites green. The only
  error either in-repo condition produced is **guided**'s: 2 `match-subset-default` lint errors, induced by
  the prose's own subset-plus-default idiom. Guided costs +19,579 always-loaded tokens.
- **Exemplars + types carry all the correctness.** The pure-prior code, dropped into the template, is
  13 tsc errors and 170/187 lint findings per run; blind in-repo is 0 and 0.
- **The pure prior moved.** It no longer invents camelCase methods (0 nonexistent methods, vs 11 recorded on
  2026-08-14); it routes all styling through `.addClass("tailwind string")` (41/39 calls, 0 typed styling calls).
- **Phase 3: 17 of 33 probes fail tsc; 4 of those 17 name the fix.** 11 probes pass tsc, eslint, the
  extractor and the dev runtime and do the wrong thing. New silent failure found: `addAttribute("class"|"id"|
  "style")` is dropped at render whenever the typed setter was also used (`src/render/serialize.ts:251-253`).

## 1. Method

### 1.1 Task text (reconstruction)

The 2026-08-13/14 task text was not recorded in any research file, and its transcripts are gone (1 jsonl
dated 2026-08-12..20 survives under `~/.claude/projects`, not a phase-2 one). The task was reconstructed
from what the records do preserve: a Team page (`hxPost("/team/members")`,
`fluent-html-agent-fitness.md:27`; `.nav("/team")`, `scorecard.md:131`), a live search input
(`prefer-form-for` fired on it in both runs, `fluent-html-agent-fitness.md:84-85`), and a 422 form
(`.fragment` vs `.submit(route, { invalid })`, `fluent-html-agent-fitness.md:84-85`). Verbatim prompts:
[`harness/task-repo.txt`](data/02-phase2-generation/harness/task-repo.txt) (205 words) and
[`harness/task-prior.txt`](data/02-phase2-generation/harness/task-prior.txt) (208 words, adds "Use
fluent-html with Fastify, HTMX and Tailwind", drops the codebase references). Requirements: `/team` for
signed-in users; list with name/email/role/status + coloured status badge; live search without reload;
invite form (name, email, role) with required-name / valid-email / not-duplicate validation, errors next to
fields, typed values kept, reset on success, no reload; empty and no-results states (naming the query);
in-memory store seeded with 3; nav link. No self-check instruction in any prompt. **Comparability with the
August runs is therefore at the level of task shape, not task text.**

### 1.2 Harness and the withholding proof

Each condition is a separate `claude -p` process (flags in the frontmatter). Proof, in four parts:

| Check | pure-prior | blind | guided |
|---|---|---|---|
| Canary "list every CLAUDE.md/memory file loaded; quote the first fluent-html instruction" | `None` / `NONE` | `None` / `NONE` | `One file is loaded … /guided/CLAUDE.md` / quotes the Stack line |
| Starting context tokens (canary modelUsage: input + cache read + cache create) | 6,534 | 6,651 | 26,230 |
| Tool-access fields outside cwd (Read/Edit/Write paths, Glob/Grep paths, Bash commands) | 0 / 11 | 0 / 343 | 0 / 312 |
| Out-of-cwd probe (canary A/B: Read and `ls` on `fluent-html`, `cat ~/.claude/CLAUDE.md`, `ls ../`, `npx tsc`) | all 5 denied | all 5 denied | all 5 denied |
| init event: skills / MCP / agents' memory | [] / [] / none | [] / [] / none | [] / [] / none |

Planted-marker check: a `CLAUDE.md` containing `CANARY-B-MARKER` in the cwd was quoted verbatim by the
guided-style launch (canary B2) and reported `NONE` by the same launch in a dir without it (A2). A plain
`--safe-mode` child (canary c0, CLI 2.1.237) had no CLAUDE.md but did inherit the user settings'
73 `additionalDirectories`, naming fluent-html repo paths in its system prompt; `--restricted` removed them.

**Single-pass enforcement.** Every in-repo agent tried to verify and was denied: tsc 2/2/1/2 attempts
(blind1/blind2/guided1/guided2), `npm test` or `npm run lint` 1/1/1/1, a one-off render via `tsx`/`node`
1/0/1/0, and both guided runs tried `npm run focus` (their CLAUDE.md mandates it: 1 and 2 attempts).
So tsc and eslint **are** layers a real session reaches (4/4 agents reached for tsc); the css build, boot and
a browser were reached for by 0/4.

**CLI note.** The `claude` on PATH is 2.1.237 and answers `API Error: 400 Claude Code 2.1.237 does not support
this model; version 2.1.280 or newer is required` for `claude-opus-5-5`; runs used the 2.1.285 binary at
`CLAUDE_CODE_EXECPATH`. This CLI build has no separate Glob/Grep in the default session; `--tools` exposed them.

### 1.3 Evaluation layers

tsc, eslint (template `eslint.config.mjs`, plugin 4.1.0), `npm run css` (extractor + Tailwind), the
template's own unit + integration suites, and a **Playwright acceptance run** (25 checks, each a sentence of
the task, [`harness/accept.cjs`](data/02-phase2-generation/harness/accept.cjs)) against the booted app on the
vendored htmx 4.0.0 bundle: register a user, nav link, 200 for the user and redirect for anon, 3 seeded rows,
status text, search filters / names the query / restores / no reload (window marker), invite form with role
field, native validation, server 422 errors shown with typed value kept, duplicate rejected, valid invite
listed as Invited with reset form and no reload, persisted after reload, no console errors, no unexpected 4xx/5xx.
Harness validated on the untouched scaffold first (2/10 pass: sign-in ok, /team 404 as expected).

## 2. Phase 2 results

### 2.1 Per run

| | pp1 | pp2 | blind1 | blind2 | guided1 | guided2 |
|---|---|---|---|---|---|---|
| Wall time (s) | 371 | 412 | 1306 | 1086 | 1344 | 1048 |
| Cost (USD, list) | 1.23 | 1.34 | 8.70 | 7.26 | 10.35 | 7.01 |
| Output tokens | 43,553 | 47,320 | 127,337 | 106,596 | 131,248 | 101,871 |
| Tool calls | 6 | 5 | 176 | 168 | 173 | 138 |
| Feature src files / LOC | 6 / 511 | 5 / 466 | 8 / 450 | 6 / 368 | 9 / 511 | 10 / 469 |
| tsc errors (in template) | 13* | 13* | **0** | **0** | **0** | **0** |
| eslint findings (in template) | 170* | 187* | **0** | **0** | **2** | **0** |
| css build | – | – | ok | ok | ok | ok |
| unit / integration tests (baseline 403 / 90) | – | – | 437 / 101 | 433 / 100 | 429 / 96 | 429 / 90 |
| Browser acceptance | – | – | 25/25 | 25/25 | 25/25 | 25/25 |
| Same-family class pairs in /team + 422 form | – | – | 0 | 0 | 0 | 0 |

\* supplementary: the pure-prior files copied to `src/app/team/` of a fresh scaffold. Against the bare 8.1.0
core (no template theme or lint) they are 3 and 4 tsc errors.

guided1's 2 findings (`src/app/team/views/team.invite.view.ts:32,55`), verbatim first:
`Match over '"rejected" | "added" | "blank"' carries a default that silently absorbs: added, blank. Add an
explicit case per member and delete the default (a new enum member then becomes a compile erro…`. The code is
`Match(state, "kind", { rejected: … }, () => InviteFields({}))`: the subset-plus-default shape
`CLAUDE.md:210` teaches for `.whenMatch` ("a subset of cases needs an explicit `defaultFn`") and
`.ai/web-development/fluent-html.md:183` shows as `// subset`.

### 2.2 Idiom inventory (feature files only)

| Idiom | pp1 | pp2 | blind1 | blind2 | guided1 | guided2 |
|---|---|---|---|---|---|---|
| `defineRoutes` / `defineIds` / `defineController` / `render:` stance | 0/0/0/0 | 0/0/0/0 | 1/1/1/1 | 1/1/1/1 | 1/1/1/1 | 1/1/1/1 |
| `Form<T>` | 0 | 0 | 3 | 2 | 2 | 2 |
| `.submit(` / `{ invalid:` / `.search(` / `.fragment(` | 0/0/0/0 | 0/0/0/0 | 2/3/1/1 | 2/3/1/1 | 2/4/1/1 | 2/3/1/1 |
| `Match` / `whenMatch` / `IfThen` / `ForEach(Keyed)` | 0/0/0/0 | 0/0/0/0 | 1/0/2/1 | 1/0/1/1 | 3/1/0/1 | 1/1/2/1 |
| typed styling calls (`.bg .text .p .m .flex .gap .rounded .border`) | 0 | 0 | 38 | 8 | 47 | 34 |
| `.addClass(`/`.setClass(` | 41 | 39 | 0 | 0 | 0 | 0 |
| `.addAttribute(` | 23 | 30 | 0 | 0 | 0 | 0 |
| palette literals | 43 | 40 | 0 | 0 | 0 | 0 |
| ternaries in views | 13 | 9 | 1 | 2 | 0 | 2 |
| `setHtmx(hx("/raw"))` | 2 | 2 | 0 | 0 | 0 | 0 |
| `Partial(` / `hxResponse(` | 0/0 | 0/0 | 0/0 | 0/0 | 0/0 | 0/0 |

Other measured behaviour:
- **What the prose bought that no layer checks:** PM files (`project/pm/team/{prd,todo,decisions}.md` +
  a `roadmap.md` edit) in 2/2 guided, 0/2 blind; blind edited `README.md` instead (2/2). The `views/`
  split appears in 2/2 guided and 1/2 blind.
- **Tests:** blind added more (+34/+11 and +30/+10 unit/integration) than guided (+26/+6, +26/+0); all pass.
- **Template gap:** 3/4 in-repo runs added the same `export const selectStyle = (t: SelectTag): SelectTag =>
  fieldStyle(t)` to `src/shared/ui/form.ts`; the shared UI has no select styling.
- **Where the blind agents learned the API:** package `README.md` (2 reads each), `dist/src/*.d.ts` or
  `src/*.ts` (36 and 39 fluent-html reads), and the vendored `htmx.js` (4-7 reads, all four runs). Guided
  runs never opened the package README.

### 2.3 Pure-prior divergence catalog (verified against the 8.1.0 runtime and d.ts)

Both runs call only 9-10 distinct fluent methods (`addAttribute addClass setFor setHref setHtmx setId
setName setPlaceholder setType setValue`), **all of which exist** in the 8.1.0 runtime walk. 29 imports per
run; one missing in both.

| # | Divergence | pp1 | pp2 | Real 8.1.0 | First layer that catches it |
|---|---|---|---|---|---|
| D1 | `import { Html }` | 1 | 1 | `HTML` (`dist/src/elements/index.d.ts:15`) | tsc TS2724 `…has no exported member named 'Html'. Did you mean 'HTML'?` (self-heals) |
| D2 | `hx("/team/members", …)` raw route | 2 | 2 | `ResolvedRoute` brand (8.0.0) | tsc TS2345 `…not assignable to parameter of type 'ResolvedRoute \| ExternalHref'` (no fix named) |
| D3 | styling via `.addClass("…")` | 41 calls | 39 calls | typed methods | eslint `no-tailwind-in-raw-class` ×135/×136: `'min-h-screen' in .addClass() bypasses the typed surface. Replace with: .minH("screen"). [autofix]` |
| D4 | palette literals | 43 | 40 | role tokens + opt-out | inside `addClass` strings: eslint D3; typed: tsc (template opt-out) |
| D5 | `addAttribute` for typed attrs (`required`, `aria-*`, `for`, `action`, `hx-*`…) | 23 | 30 | typed setters | eslint `prefer-set-method` 14/23, `prefer-toggle` 5/3, `prefer-htmx-api` 2/2 (warn) |
| D6 | no `defineRoutes`/`defineIds`; string ids | yes | yes | typed registries | eslint `no-raw-ids` 0/8 |
| D7 | `.map()` children, ternaries, 0 `IfThen`/`Match`/`ForEach` | 3 / 13 | 2 / 9 | control primitives | eslint `prefer-foreach` 3/2; ternaries: nothing |
| D8 | htmx 2: `unpkg.com/htmx.org@2.0.4` script tag | 1 | 1 | vendored 4.0.0 | nothing (runtime) |
| D9 | `addAttribute("hx-disabled-elt", …)` | 1 | 0 | htmx 4 reads `hx-disable` (`htmx.js:1768`); `disabled-elt` occurs 0 times in 4.0.0 | eslint `prefer-htmx-api` (warn, names `hxGet, hxPost, setHtmx`, not the attribute) |
| D10 | `hx-on:htmx:before-swap` reading `event.detail.xhr` / `shouldSwap` | 0 | 1 | htmx 4 event is `htmx:before:swap`; `before-swap`, `detail.xhr`, `shouldSwap` occur 0 times; inline `hx-on` blocked by the template CSP | same warn as D9 |
| D11 | Tailwind via `@tailwindcss/browser@4` CDN | 1 | 1 | extractor + build | nothing |

Against 2026-08-14 (`scorecard.md:173-174`: "30 palette literals, 11 nonexistent camelCase methods and zero
framework primitives", **with CLAUDE.md injected**): palette literals 43/40 (up), nonexistent methods
**0**/0 (down from 11), framework primitives 0/0 (same). The model also changed (August unrecorded; now
claude-opus-5-5), so the shift is not attributable to 8.x alone.

### 2.4 Deltas

- **blind − guided (prices the prose):** tsc 0 − 0 = **0**; eslint (0+0)/2 − (2+0)/2 = **−1 per run**
  (guided worse); acceptance 25 − 25 = **0**; test suites green in both. Starting context +19,579 tokens;
  cost +$0.70/run on average (8.68 vs 7.98); mean wall time identical (1196 s vs 1196 s). What prose
  bought is PM paperwork and a file split, both unchecked by any layer.
- **pure-prior − blind (prices exemplars + types):** in-template tsc 13 → 0, eslint 170/187 → 0; framework
  primitive kinds 0 → 12-13 of the 13 inventoried in §2.2; typed styling calls 0 → 8-38; `addClass` 39-41 → 0. Blind agents
  learned from src exemplars (94/96 `src/` accesses) plus the package README and d.ts.
- **Errors surviving in guided (API-design problems):** only the `Match` subset-default pair, which is a
  doctrine conflict (prose teaches the shape for `whenMatch`; the 4.1.0 rule rejects it for `Match`), already
  flagged for `MatchValue` in `projects-template/project/pm/agent-fitness/todo.md` (P2 "subset-with-fallback
  form is currently taught doctrine").

## 3. Phase 3: error probes (33 fixtures)

Layers: **tsc** and **eslint** are reached in a single pass only if the agent runs them (4/4 in-repo agents
tried tsc, 4/4 tried lint or test). **Extractor/Tailwind**, **boot** and **dev runtime** were reached for by
0/4 agents: those columns are layers a single-pass agent never reaches. Lines/chars are the `--pretty false`
message chain. One-shot = would a model fix it from this text alone.

| # | Probe | First tsc diagnostic (verbatim) | Lines / chars | eslint | Extractor → Tailwind | Dev runtime | Wrong thing / fix / one-shot | vs 8.0.0 (recorded) |
|---|---|---|---|---|---|---|---|---|
| 1 | `A("Team").nav("/team")` | TS2345 `Argument of type 'string' is not assignable to parameter of type 'PageRoute'.` / `Type 'string' is not assignable to type 'HTMX'.` | 2 / 125 | none | – | no throw: `<a … role="button" tabindex="0" hx-undefined="undefined" hx-target="#main-content" …>` (no `hx-get`) | yes / no / no | was `'string' is not assignable to 'HTMX'` (`scorecard.md:131`); now leads with the template alias; fix still unnamed |
| 2 | `Match(s,"status",{loading,error})` missing `success` | TS2769 `No overload matches this call.` … last line `Property 'success' is missing in type …` | 7 / 1354; actionable at char 1027 (last line) | none | – | renders `""` for the missing state | yes (buried) / implied / partial | 8-line TS2769, actionable last (`scorecard.md:133-134`): same shape, 7 lines; line 2 is an Overload-1 detour about `string \| number` |
| 3 | `Button().hxDelete(url)` (pruned 8.0.0) | TS2339 `Property 'hxDelete' does not exist on type 'ButtonTag'.` | 1 / 55 | none | – | `TypeError: Button(...).hxDelete is not a function` | yes / no / no | anonymous TS2339 (`scorecard.md:135`): unchanged |
| 4 | `.grid().placeItems("center")` (pruned 8.0.0) | TS2339 `Property 'placeItems' does not exist on type 'Tag'.` | 1 / 51 | none | skips unknown method silently | TypeError | yes / no / no | unchanged |
| 5 | `.bg("gray-100")`, opt-out on (template default) | TS2345 `Argument of type '"gray-100"' is not assignable to parameter of type 'TailwindColor'.` | 1 / 85 | none | safelists `bg-gray-100`; Tailwind emits `.bg-gray-100{…}` (byte 15076) | renders | yes / no token named / partial | identical text on 7.2.0 (`fluent-html-agent-fitness.md:29-30`) |
| 6 | same, opt-out removed | clean | – | none | safelisted and emitted | renders gray | no layer | new |
| 7 | `Form().setAction("/team/invite")` | clean | – | none | – | `<form action="/team/invite" method="post">` | no layer | out-of-mandate by design (CHANGELOG 8.0.0) |
| 8 | `Button().setFormaction("/team/invite")` | clean | – | none | – | emits `formaction` | no layer | same |
| 9 | `Area().setHref("/team")` | clean | – | none | – | emits `href` | no layer | same |
| 10 | `A("Team").setHref("/team")` | TS2345 `Argument of type '"/team"' is not assignable to parameter of type 'ResolvedRoute \| ExternalHref \| undefined'.` | 1 / 109 | only `anchor-requires-cursor-pointer`; `prefer-nav-for-internal-links` (would say `…Use .nav(route) with the defineRoutes ref instead…`) is in the plugin's recommended set (`dist/index.js:102`) but **not** in the template config | – | – | yes / no / partial | the lint "gained" per `scorecard.md:132` never reached the template config |
| 11 | `Td("…").colspan(2)` | TS2551 `Property 'colspan' does not exist on type 'TdTag'. Did you mean 'colSpan'?` | 1 / 74 | none | – | TypeError | yes / **wrong fix** / yes, into a bug | recorded (`scorecard.md:165-166`); unchanged; still unpinned (`test/setter-errors.test.ts` pins `.src`/`.placeholder` only) |
| 11b | `Td("…").colSpan(2)` (the suggested fix) | clean | – | none | safelists `col-span-2`; Tailwind emits `.col-span-2{grid-column:span 2/span 2}` (byte 7180) | `<td class="col-span-2">`, no `colspan` | silent on all 5 layers | – |
| 12 | `Img().src(…)` | TS2339 `Property 'src' does not exist on type 'ImgTag'.` | 1 / 47 | none | – | TypeError | yes / no / no | same as 8.0.0 (`scorecard.md:85-87`) |
| 13 | `A().href(…)` | TS2339 `Property 'href' does not exist on type 'AnchorTag'.` | 1 / 51 | cursor rule only | – | TypeError | yes / no / no | same |
| 14 | `Input().value(…)` | TS2339 `Property 'value' does not exist on type 'InputTag'.` | 1 / 51 | none | – | TypeError | yes / no / no | same |
| 15 | `Input().placeholder(…)` | TS2551 `Property 'placeholder' does not exist on type 'InputTag'. Did you mean 'setPlaceholder'?` | 1 / 88 | none | – | TypeError | yes / yes / yes | same |
| 16 | `Div().addAttribute("id","team-list")` | clean | – | none (`no-raw-ids` covers `setId`/`target` only) | – | emitted; **dropped** if `setId` also used | silent | parked since v6.0.1 |
| 17 | `Div().addAttribute("class","p-4 bg-surface")` | clean | – | none (`no-tailwind-in-raw-class` covers `addClass`/`setClass`) | extractor sees nothing; Tailwind's own scanner picks the literal (`.mt-7` emitted in 17b) | emitted alone; **dropped** with any fluent class: `Div("x").p("4").addAttribute("class","mt-7")` → `<div class="p-4">` | silent | new evidence |
| 18 | `Div().addAttribute("style","color: red")` | clean | – | `prefer-set-method`: `Use .setStyle(…) / setStyles({ … }) instead of .addAttribute("style", …). Typed setters give autocomplete and validation (e.g. aria typos become compile errors).` | – | **dropped** if `setStyle` also used | yes / yes / yes (lint) | – |
| 19 | `.flex().justify("centre")` | TS2345 `Argument of type '"centre"' is not assignable to parameter of type 'TailwindJustifyContent'.` | 1 / 92 | none | safelists `justify-centre`; Tailwind emits no rule | renders `class="flex justify-centre"` | yes / no / partial | – |
| 20 | `defineController(teamRoutes, { index })` missing `invite` | TS2345 `Argument of type '{ index: NoInfer<{ readonly guards: …` … `Property 'invite' is missing in type …` | 2 / 1407; key at char 703 | none | – | boot: `Route "invite" entry must be an object with a POST handler.` | yes / yes (key) / yes | ~1.4KB before the key (`scorecard.md:134-135`) → 703 chars: improved |
| 21 | `.bg(BG[status])`, `BG: Record<Status, TailwindColor>` | clean | – | `no-dynamic-typed-styling-arg` (error): `.bg(BG[status]) uses a non-literal argument the safelist extractor can't resolve — the css build fails on it, … Inline the literal (branch with .when()/.whenElse()/.whenMatch() or Match, one lit…` | throws `✗ unresolved .bg(BG[status]) in src/app/probes/p21-dynamic-arg.ts` + `Inline the literal, or add the token to staticManifest (defineTheme())` | renders `bg-warning` | yes / yes / yes | unchanged (4.1.0 already in the August row) |
| 22 | `.textColor("warning")` (pre-7) | TS2339 `Property 'textColor' does not exist on type 'Tag'.` | 1 / 50 | none | skips | TypeError | yes / no (`.text()`) / no | – |
| 23 | `.on("hover", t => …)` (pre-7) | TS2339 `Property 'on' does not exist on type 'ButtonTag'.` + TS7006 cascade | 1 / 49 (2 diags) | none | skips | TypeError | yes / no (`.hover({…})`) / no | – |
| 24 | `Div([H1(…), P(…)])` | clean | – | `prefer-variadic-children`: `Use variadic children Div(a, b) instead of array form Div([a, b]).` | – | renders correctly | absorbed + lint names fix | unchanged (`fluent-html-agent-fitness.md:37-39`) |
| 25 | `Ul(...names.map(n => Li(n)))` | clean | – | `prefer-foreach`: `Use ForEach(names, …) for Ul's children, not .map(). ForEach carries the count/range overloads and the ForEachKeyed upgrade path; a spread/array .map() forfeits both.` | – | renders | lint names fix | – |
| 25b | `Ul(names.map(…))` | clean | – | `prefer-foreach` (same text) | – | renders | lint names fix | – |
| 26 | `IfThen(!!m.avatar, () => Img().setSrc(m.avatar!))` | clean | – | none | – | renders | taught ✗ enforced by nothing | – |
| 27 | `Form<SignInReq>` `f.input("emial","email")` | TS2345 `Argument of type '"emial"' is not assignable to parameter of type '"email" \| "password"'.` | 1 / 89 | none | – | renders `name="emial"` | yes / yes / yes | identical (`fluent-html-agent-fitness.md:30-31`) |
| 28 | `.apply(p-6 preset).p("8")` | clean | – | none | `p-6 p-8` | `class="p-6 bg-surface rounded-card p-8"`; p-8 wins by stylesheet order (35468 < 35506) | works by luck | unchanged (`fluent-html-agent-fitness.md:63`) |
| 28b | `.apply(p-8 preset).p("4")` | clean | – | none | `p-8 p-4` | `.p-4` at byte 35392 precedes `.p-8` at 35506 → **the override loses** | silent on all 5 layers | – |
| 28c | `.apply(bg-surface preset).when(err, t => t.bg("danger/10"))` | clean | – | none | both | `.bg-danger\/10` at 14897 precedes `.bg-surface` at 15997 → **error tint never renders** | silent on all 5 layers | the ttl bug class (fluent-html-batch decisions) |
| 29 | `.fragment(ids.teamList, routeWithoutRender)` (template) | TS2345 … `Property '["this route's def declares no \`render\` stance — a fragment verb needs \`render: ids.…\` on it (silence means the route answers a page); an ad-hoc \`hx()\` url has no def, so it goes through \`.setHtmx()\`"]' is missing …` | 2 / 503; fix at char 225 | none | – | renders | yes / yes / yes | new in 8.1-era template; note tsc prints the em dash and ellipsis as `—`/`…` |

**Totals.** tsc errors on 17/33 fixtures; of those, 4 name the fix (#15, #20, #27, #29), 1 names a wrong
fix (#11), 12 name only the wrong thing. eslint catches 5 more (#18, #21, #24, #25, #25b). 11 fixtures are
clean on tsc and eslint (#6, 7, 8, 9, 11b, 16, 17, 26, 28, 28b, 28c); the extractor, Tailwind build and dev
runtime catch **none** of those 11. The extractor catches 1 fixture overall (#21), boot catches 1 (#20,
already a tsc error), the dev runtime throws on 9 (all already tsc errors).

## 4. Diff vs 2026-08-14

| Item | 2026-08-14 (8.0.0, plugin 4.1.0) | 2026-09-30 (8.1.0, plugin 4.1.0) |
|---|---|---|
| Harness | parent CLAUDE.md injected into every condition (`scorecard.md:170-176`); delta a lower bound | withheld; proven per condition (§1.2) |
| Model | not recorded | claude-opus-5-5, effort xhigh |
| Runs per condition | 1 | 2 |
| Blind | 425-line feature, 0 tsc, 3 lint on 2026-08-13 (`fluent-html-agent-fitness.md:17`) | 368-450 LOC, 0 tsc, 0 lint, 25/25 browser, suites green (×2) |
| Guided | 0 tsc, 1 lint (08-13); named failure `.fragment` for the 422 form (`…:84-85`) | 0 tsc, 2 and 0 lint; 4/4 in-repo runs use `.submit(route, { invalid })` in both conditions |
| blind − guided | 2 → 1 finding, the 1 a rule artifact (`scorecard.md:112`) | 0 tsc, −1 lint/run (guided worse), 0 functional |
| Pure prior | 30 palette literals, 11 nonexistent camelCase methods, 0 primitives | 43/40 palette literals, 0 nonexistent methods (1 bad import), 0 primitives, 41/39 `addClass` |
| `Partial()` | guided shipped it inert | 0 `Partial(` calls in 6 runs |
| `.nav("/team")` | `'string' … 'HTMX'` | `'string' … 'PageRoute'` / `… 'HTMX'`; runtime emits `hx-undefined` |
| Missing `Match` case | 8-line TS2769, fix last | 7 lines, 1354 chars, fix at char 1027 (last) |
| Non-exhaustive controller | ~1.4KB before the key | 703 chars before the key |
| Pruned methods | anonymous TS2339 | anonymous TS2339 (#3, #4), same for pre-7 names (#22, #23) |
| Unprefixed setters | 6 diagnostics, 1 per guess, naming property + class | same; only `placeholder` gets the did-you-mean |
| `.colspan` | compiles as `colSpan` → `col-span-2` | unchanged, still unpinned |
| Losing override | `p-6 p-8`, merger decided, unbuilt | unbuilt; reversed cases lose (#28b, #28c); 0 occurrences in the 4 generated features |

The removed contamination did **not** reveal hidden prose value: with context truly withheld, blind still
matches guided on every layer.

## 5. Seeds for Wave 1

1. **`addAttribute("class"|"id"|"style")` is silently dropped** when the typed setter is also used
   (`src/render/serialize.ts:251-253`, whose own comment says "never silently dropped"): `Div("x").p("4").
   addAttribute("class","mt-7")` → `<div class="p-4">`; clean on tsc and eslint for class and id, extractor-
   invisible, no dev warning. New evidence for the v6.0.1 parked compile-exclude. **Track A (+B3)**;
   silent-failure resistance, decision-space closure.
2. **`.nav("/team")` names no fix and emits garbage at runtime**: 2 lines / 125 chars, no route callable
   named; rendered `hx-undefined="undefined"` with no `hx-get`. The template's own `.fragment` stance error
   (#29) already puts the fix in the message (char 225 of 503). **Track B (B1)**; error quality,
   silent-failure resistance.
3. **`.colspan(2)` self-heals into a bug**: TS2551 suggests `colSpan`, which passes all 5 layers and renders
   `<td class="col-span-2">` backed by a real Tailwind rule (byte 7180); unpinned in `test/setter-errors.test.ts`.
   **Track A (A4)**; silent-failure resistance, error quality.
4. **Losing override still unbuilt**: #28b and #28c lose on all 5 layers (`.p-4`@35392 < `.p-8`@35506;
   `.bg-danger\/10`@14897 < `.bg-surface`@15997). Reach in this experiment: 0 of 4 generated features
   (DOM scan of page + 422 form); in the wild: 10 sites in 2 apps (fluent-html-batch decisions). **Track A (A3)**;
   silent-failure resistance.
5. **Anonymous TS2339 for removed and pre-7 names**: 6 probes (#3, #4, #12-14, #22, #23) get 47-55-char
   messages naming no successor; 1 of 7 setter-shaped guesses (#15) self-heals. **Track B (B2) / C**;
   error quality, prior alignment.
6. **Missing `Match` case**: TS2769, 7 lines / 1354 chars, the actionable `Property 'success' is missing`
   starts at char 1027 on the last line after an Overload-1 detour; the runtime renders `""` for the missing
   state. **Track B (B4)**; error quality.
7. **The pure prior is `addClass("tailwind")`, not the typed surface**: 41/39 `addClass` calls, 0 typed
   styling calls, 43/40 palette literals per run; in the template 135/136 `no-tailwind-in-raw-class`
   findings, 54/170 and 51/187 autofixable. The typed surface is reached only via exemplars (blind: 38 and 8
   typed calls). **Track C (C2)**; prior alignment, context economy.
8. **Prose is priced at ≤ 0 with context truly withheld**: blind − guided = 0 tsc, −1 lint/run, 0 of 25
   acceptance checks, for +19,579 always-loaded tokens (26,230 vs 6,651 starting context). **Cross-cutting G /
   C4**; context economy (guidelines row).
9. **Doctrine conflict on subset + default**: prose teaches it (`CLAUDE.md:210`,
   `.ai/web-development/fluent-html.md:183`), plugin 4.1.0 `match-subset-default` rejects it on `Match`: the
   only 2 errors any in-repo run produced (guided1). **Track B / C3**; decision-space closure.
10. **Raw-string sinks pass every layer**: `setAction`, `setFormaction`, `AreaTag.setHref` (#7-9) are clean on
    tsc, eslint, extractor and runtime; `prefer-nav-for-internal-links` ships in the plugin's recommended
    config (`dist/index.js:102`) but is absent from the template's `eslint.config.mjs` and matches only
    `A(…).setHref`. **Track B (B3) / D5**; cross-file invariant safety.
11. **This repo's own `CLAUDE.md` is stale**: 265 changed lines vs `guidelines/web-development/CLAUDE.md`
    (460 vs 561 lines, last commit 2026-08-03); it says the verbs don't add the cursor (`CLAUDE.md:267`,
    `:291`, `:329`) while `swap-verbs.ts:226-235` stamps `cursor-pointer`, so following it emits
    `cursor-pointer cursor-pointer` (#1 runtime). Every agent in this review loads it. **Track C (C4) / G**;
    context economy, decision-space closure.
12. **htmx-2 names pass through `addAttribute("hx-…")` unchecked against the pinned bundle**: pure-prior
    `hx-disabled-elt` (0 occurrences in htmx 4.0.0, which reads `hx-disable`, `htmx.js:1768`) and
    `hx-on:htmx:before-swap` + `event.detail.xhr` (0 and 0) are both inert under the template; the only signal
    is the warn-level `prefer-htmx-api`, whose message names `hxGet, hxPost, setHtmx`, not the attribute.
    **Track D (D1) / A1**; silent-failure resistance, evolvability.
