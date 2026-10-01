---
rfc: RFC-B-03
lens: combined
verdict: survives-with-changes
confidence: 0.78
killer_objection: 'The line-1 sentence teaches `routes.x.resolve(params?, query?)`, but a route without `:params` has the signature `resolve(query?)` (src/routes.ts:288-290). When the tsc text was their only teacher, 3/3 no-repo agents turned the query-concatenation sink into `routes.members.resolve(undefined, { q })`. That gives TS2554 "Expected 0-1 arguments, but got 2.", which names no fix, and it was the only error left in each file once the defineRoutes def shape was corrected. Required change 1 rebuts this: with the notation `resolve([params,] query?)` the misreading went from 3/3 to 0/3.'
guardrail_killer: null
required_changes:
  - '1. Change the resolve notation everywhere the RFC prints it. In src/core/route-sink-hint.ts, replace all 3 occurrences of `routes.x.resolve(params?, query?)` with `routes.x.resolve([params,] query?)`. Make the same replacement in the eslint `preferBrandedSetter` message and in test/brand-errors.test.ts (the `NAMES_PRODUCERS` regex and the `setHtmx(path, options)` pin). In the same commit, change the lib''s other copies of the notation to match, so the lib has one notation: README.md:91, src/htmx.ts:22 (ResolvedRoute JSDoc) and src/routes.ts:299. The always-loaded guidelines CLAUDE.md:265 `.resolve(query?)` is already compatible and stays as it is. Measured with this exact wording: no-repo agents wrote `resolve({ q })` in 3/3 runs (v3 wording: `resolve(undefined, { q })` in 3/3), with 0 errors after the def-shape correction (v3: 3x TS2554). The probe matrix is unchanged: 21/24 on line 1, 0 truncated, hx tail intact, +25 B over 24 probes. Brand pins pass 12/12 with the updated regex, and plugin rule tests pass 429/0.'
  - '2. Ship the lib half in the same 8.2.0 release as RFC-B-01''s setHtmx dev throw (RFC-B-01 lib: src/core/tag.ts + src/core/dev-checks.ts), and correct the RFC''s cast-equivalence claim in Replaces, guardrail 3 and open question 5. The verbatim-key `Object.assign` path renders like a cast through setHref and hx only. Through `.setHtmx` it compiles (8.1.0: 1 error; RFC: 0), and under NODE_ENV=development it renders `<div hx-undefined="undefined">x</div>` with this RFC alone. A `"/tasks" as never` cast renders hx-get. With RFC-B-01''s lib change, the same call throws `<div>.setHtmx() got an HTMX bag with no request ...` (measured).'
executed:
  - cmd: 'rsync real fluent-html 8.1.0 -> $V/lib-base and $V/lib-rfc; python3 wave2/RFC-B-03/apply.py $V/lib-rfc; npm run build (both); cmp every dist/src/**/*.js'
    output: 'build rc=0 both; src diff 4 files +17/-7; dist/src JS 68/68 byte-identical; new core/route-sink-hint.js = `export {};`, 0 importers; npm pack --dry-run 344 -> 349 files; RouteSinkHint in index.d.ts: 0'
  - cmd: 'tsc -p tsconfig.b03.json in the TS 6.0.3 scaffold (fluent-html -> lib-base | lib-rfc): wrong.ts, green.ts, fixes.ts, second-way.ts, attack.ts (14 new 8.1.0-valid shapes), agentguess.ts; node cmp.mjs b03-base.txt b03-rfc.txt'
    output: 'wrong 24/24 both; fix on line 1 21/24, any line 23/24, offsets 138-454, truncated 0, bytes 4,312 -> 10,408; green/fixes/attack 0/0; second-way: 3 @ts-expect-error consumed both; Object.assign verbatim key: base 1 error, RFC 0'
  - cmd: 'agentguess.ts: routes.members.resolve(undefined, { q }) and resolve({}, { q }) on a param-less route'
    output: 'TS2554 "Expected 0-1 arguments, but got 2." under both libs (names no fix)'
  - cmd: 'patch -p0 < lib-test.patch (both libs); npx tsc; node --test dist/test/brand-errors.test.js; package.json test list; tsc -p test/types/color-optout'
    output: 'brand-errors base 3/12 (9 fail), RFC 12/12; full list base 2155/2164 (the 9 new pins fail), RFC 2164/2164; color-optout rc=0 both'
  - cmd: 'consumer declaration emit (declaration: true) of Parameters<typeof hx>[0], Parameters<AnchorTag["setHref"]>[0], { hx, setHref }; template-side declare-module hint overload on AnchorTag.setHref'
    output: 'emit rc=0 both, key inlined, 0 references to route-sink-hint (no TS2742); augmentation gives TS2769 "No overload matches this call." and hx() keeps the 8.1.0 text'
  - cmd: 'eslint plugin copy + prefer-set-method.patch + rule.test.patch; build; rule/type-aware/derivation tests; RFC tests against the 4.1.0 rule'
    output: 'RFC 429/0, type-aware 0 failed, derivation 14/14; 4.1.0 rule with RFC tests: "Invalid messageId preferBrandedSetter" (original suite 422/0)'
  - cmd: '11-site addAttribute("href", ...) fixture: eslint, eslint --fix, tsc (base plugin+lib vs RFC plugin+lib)'
    output: 'base --fix -> 3 TS2345 (A literal, `A as Anchor`, "HTTPS://"); RFC -> 1 TS2345 (`A as Anchor`); correct autofixes kept for https, `#${id}`, .resolve(), assetUrl(), Link(), `https://${host}`'
  - cmd: 'template: patch assets.ts (== projects-template HEAD); tsc template src+tests; A().setHref(assetUrl(...)) probe; vitest --project unit; static-cache + layout; eslint . --max-warnings=0'
    output: 'HEAD assetUrl into A().setHref: TS2345 on 8.1.0; patched: 0 under both libs; tsc 0 both; unit 403/403 both; static-cache+layout 30/30; eslint rc=0 with the RFC rule'
  - cmd: 'pure prior pp1 + pp2 (recon 02) + pp3 (B-01 wave3) compiled base vs RFC'
    output: '30 errors both, identical locations and codes; hx sink errors naming the producers 0/6 -> 6/6'
  - cmd: 'vp1-3 compiled in B-01 rfc3 scaffold with B-01 lib only vs B-01 lib + this lib'
    output: '25 errors both; first error per file names the fix 0/3 -> 3/3; setHref errors with the hint 0/6 -> 6/6'
  - cmd: 'run.sh (claude -p --restricted, opus-5-5 xhigh, Read/Write/Edit, no tsc), vp1 + combined tsc text, n=2; outputs compiled with tsconfig.b01.json'
    output: 'setHref sites routes.x.resolve() 4/4 (B-01-only wave3 runs: routes.x().resolve() 4/4); errors left 0 and 3 (B-01 only: 3 and 5); output tokens 21,317 / 28,344 vs 14,930 / 16,161'
  - cmd: 'run.sh no-repo laundering harness links.ts (request-input returnTo, 2 page links, static PDF, https link, query concat into hxGet, id template literal), n=3 per condition: 8.1.0 text, RFC v3 text, v4 `resolve([params,] query?)` text'
    output: '8.1.0: 3/3 cast every non-literal sink through Parameters<...>[0] + `as Href` (18/18), tsc 0, mean 10,733 out-tok. v3: 0 casts, defineRoutes + resolve 3/3, PDF -> assetUrl 3/3, returnTo allowlisted 3/3, resolve(undefined, { q }) 3/3, after def-shape fix 3 errors all TS2554, 5,195 out-tok. v4: resolve({ q }) 3/3, after def-shape fix 0 errors, 4,188 out-tok'
  - cmd: 'v4 lib build; node cmp.mjs b03-base.txt b03-v4.txt; brand-errors with the notation-updated regex; rule tests with the v4 message'
    output: '21/24 line 1, 23/24 any, 0 truncated, 10,433 B, hx tail intact; pins 12/12; rule 429/0'
  - cmd: 'fleet/run.sh over the 14 live 8.1.0 repos (all TS 6.0.3) with the RFC .d.ts dropped in'
    output: 'tsc errors 0 -> 0, identical 14/14; 570 sink text sites; aliased `A as` imports 0 and addAttribute("href") 0 across fleet + templates'
  - cmd: 'NODE_ENV=development tsx: setHtmx / setHref(Object.assign(path, { [KEY]: null! })) on the RFC lib and on RFC + B-01 lib'
    output: 'setHref -> <a href="/team"> (same as a cast); setHtmx -> <div hx-undefined="undefined">x</div> on RFC alone; RFC + B-01 -> throws "<div>.setHtmx() got an HTMX bag with no request"'
  - cmd: 'grep -rnE "takes a ResolvedRoute|takes routes|route callable|RouteSinkHint|NotARoute" projects-template/templates packages; sink grep in packages/ui/src; assetUrl( grep in templates/web/src'
    output: 'only templates/shared/eslint-rules/branded-redirect.mjs:42 (reply.redirect); packages/ui/src 0 hits in 17 files; templates/web 20 assetUrl( calls, 0 on a static-file path'
  - cmd: 'sed -n on guidelines htmx.md 181, 215, 225, 474 and CLAUDE.md:265; wc -c'
    output: 'lines match the RFC; removal 145+114+182+72+39 = 552 B, -2 lines; htmx.md:215 "route callable" claim is false (w20 hxGet(routes.detail) and w23 hxPost(routes.list()) are TS2345 on 8.1.0)'
---

# Verdict: RFC-B-03, combined lens

> You are an ADVERSARY. Kill this RFC through the combined lens. Default to `reject` under
> uncertainty. Reading code is not verification: execute.

Scratch root: `$V = <scratch>/wave3/RFC-B-03-combined`.

I did not reuse the wave-2 builds. I made independent copies of the real 8.1.0 lib and eslint plugin (`lib-base`, `lib-rfc`, `eslint-rfc`), applied the RFC's own `apply.py` and patches, and built each one. Each condition is compiled in its own copy of the Wave-0 teamapp scaffold (TS 6.0.3), with `node_modules/fluent-html` pointed at the matching lib:
- `app-base`
- `app-rfc`
- `app-combo` (RFC-B-01 rfc3 verbs + B-01 lib + this lib)
- `app-b01only`
- `app-v4` (this RFC with only the resolve notation changed)

## What I executed

### 1. Type layer, compiled both ways

**Byte check.** The RFC's lib diff is +17/-7 across 4 files. All 68/68 `dist/src` `.js` files are byte-identical. The one new emitted file is `core/route-sink-hint.js` (`export {};`), and nothing imports it. `npm pack` goes from 344 to 349 files, so the new `.d.ts` ships.

**The RFC's probe matrix reproduces exactly.**
- Fix on line 1: 21/24 wrong shapes.
- Fix on any line: 23/24.
- Line-1 offsets: 138-454.
- 0 truncated.
- Diagnostic bytes: 4,312 → 10,408.
- `green.ts` and `fixes.ts`: 0 errors under both libs.

**Attack probes on shapes valid on 8.1.0: 0 errors under both libs.** I wrote 14 shapes that compile on 8.1.0:
- `` `https://${host}` `` and `` `#${q}` ``
- a ternary with a `mailto:` template
- a generic `T extends ResolvedRoute | ExternalHref` wrapper
- a `Parameters<AnchorTag["setHref"]>[0]` wrapper
- `setHtmx(HTMX | undefined)` and `any`
- an array of the union
- an intersection subtype
- `Link()`
- `resolve` with a query and with params
- a `Parameters<typeof hx>[0]` variable

The union member does not disturb contextual typing of template literals; F-B-308's optional-key intersection did.

**Consumer declaration emit is safe.** With `declaration: true`, exporting `Parameters<typeof hx>[0]` and `{ hx, setHref }` emits clean. The key is inlined, and the output has 0 references to the internal module, so there is no TS2742 portability error.

**Lib tests, both ways.**
- Patched `brand-errors.test.ts`: 3/12 on 8.1.0, 12/12 on the RFC.
- Full `package.json` test list: 2155/2164 on 8.1.0 (the 9 new pins fail), 2164/2164 on the RFC.
- color-optout: exit 0 under both.

### 2. Lint layer, run on a fixture

**Rule tests.** The RFC rule passes 429/0, type-aware tests 0 failed, derivation 14/14. Against the 4.1.0 rule, the new tests fail with `Invalid messageId 'preferBrandedSetter'`.

**Fixture: 11 `addAttribute("href", …)` sites in the scaffold, then `--fix`, then tsc.**
- 8.1.0 writes 3 TS2345 errors:
  - the `A` literal
  - `A as Anchor`
  - `"HTTPS://…"`
- The RFC writes 1: the aliased `A as Anchor` import, which `rootFactory` cannot see.
- The RFC keeps the correct autofixes:
  - https
  - `` `#${id}` ``
  - `.resolve()`
  - `assetUrl()`
  - `Link()`
  - `` `https://${host}` ``
- It drops one correct autofix: `addAttribute("href", rr)` with `rr: ResolvedRoute` is now report-only, and its message says "not a URL string".

Both residuals have 0 reach. The fleet and the templates contain 0 aliased `A as` imports and 0 `addAttribute("href")` sites.

### 3. Template

**The collision is real.** The scaffold's `assets.ts` is byte-identical to projects-template HEAD. Passing HEAD's `assetUrl` into `A().setHref` is a TS2345 on 8.1.0. With the RFC patch it compiles with 0 errors under both libs. The template change is independent of the lib version, because it wraps the lib's `assetUrl`, which has existed since 8.0.0.

**Template checks pass.**
- Template tsc (src + tests): 0 under both libs.
- vitest unit: 403/403 under both.
- static-cache + layout: 30/30.
- `eslint . --max-warnings=0` with the RFC rule: exit 0.

### 4. Pure prior, and RFC-B-01 together with this RFC

**Pure prior (pp1, pp2, pp3).** Base and RFC both give 30 errors, at the same locations with the same codes. The `hx("/team/members")` sink errors that name the producers go from 0/6 to 6/6.

**RFC-B-01's vp1-3 files with both RFCs applied.**
- Errors: 25 under both conditions.
- First error per file names the fix: 0/3 → 3/3.
- `setHref` errors carrying the hint: 0/6 → 6/6.

**No-repo fix of vp1 with both RFCs applied (n=2).** This answers the RFC's open question 2:
- `setHref` sites written as `routes.x().resolve()`: 4/4 in the B-01-only wave-3 runs, 0/4 here (4/4 became `routes.x.resolve()`).
- Errors left: 0 and 3, against 3 and 5 for B-01 alone. One run compiles clean.
- The cost went up: 21,317 and 28,344 output tokens, against 14,930 and 16,161. With n=2, read this as a direction only.

### 5. No-repo laundering harness

The harness uses the same `claude -p --restricted` harness, opus-5-5 at xhigh, with no tsc available, n=3 per condition. The file `links.ts` contains:
- a request-input `returnTo`
- 2 page links
- a static PDF
- an https link
- a query concatenation into `hxGet`
- an id template literal

| condition | casts | defineRoutes + `.resolve()` | PDF → `assetUrl` | request input | `resolve(undefined, { q })` | errors after def-shape fix | mean out-tok |
|---|---|---|---|---|---|---|---|
| 8.1.0 text | 18/18 sinks (`Parameters<…>[0]` + `as Href`) | 0/3 | 0/3 | regex then cast, 3/3 | n/a | 0 (compiles by laundering) | 10,733 |
| RFC v3 text | 0 | 3/3 | 3/3 | allowlisted onto known routes, 3/3; 0/3 wrapped in `externalUrl`/`assetUrl` | **3/3** | **3, all TS2554** | 5,195 |
| v4 `resolve([params,] query?)` | 0 | 3/3 | 3/3 | allowlisted, 3/3 | 0/3 (`resolve({ q })`) | **0** | 4,188 |

All 6 RFC-family runs guessed `defineRoutes({ team: "/team" })`, which gives 4× TS2322 per file. That is a guess at defineRoutes' own def shape, outside the 5 sinks this RFC changes, and RFC-B-01's verdict saw it too. I corrected it so I could isolate what this RFC's text causes.

The v4 matrix:
- 21/24 on line 1, 0 truncated, 10,433 B.
- The `hx` tail is still printed in full.
- Brand pins 12/12 with the regex updated.
- Rule tests 429/0.

### 6. Lane, instruction set, guidelines

**Fleet.** I dropped the RFC `.d.ts` into the 14 live 8.1.0 repos (all on TS 6.0.3): tsc errors 0 → 0, identical in 14/14, over 570 sink text sites.

**Instruction set.**
- The only hint one layer up is `templates/shared/eslint-rules/branded-redirect.mjs:42`, and it covers `reply.redirect`.
- `packages/ui/src` has 0 sink hits across 17 files.
- A template augmentation gets `TS2769 No overload matches this call.`, and `hx()` keeps the 8.1.0 text.

**Guidelines.**
- The deleted lines match. The removal is 552 B (145+114+182+72+39) and −2 lines.
- The `htmx.md:215` claim that `hxGet` takes a "route callable" is false: w20 and w23 are TS2345 on 8.1.0.

### 7. Cast-free path

| sink | `Object.assign(path, { [KEY]: null! })` on the RFC lib (dev) | `path as never` | with RFC-B-01's lib |
|---|---|---|---|
| `setHref` | `<a href="/team">` | same | same |
| `setHtmx` | compiles (8.1.0: 1 error); renders `<div hx-undefined="undefined">x</div>` | `hx-get="/tasks"` | throws `<div>.setHtmx() got an HTMX bag with no request` |

## Attack

1. **The hint teaches a call shape that does not exist.** `resolve(params?, query?)` reads as two optional positional arguments. A route without `:params` takes `resolve(query?)` (`src/routes.ts:288-290`).
   - 3/3 agents wrote `resolve(undefined, { q })`, and the TS2554 it produces names no fix.
   - The RFC says this notation "answers the concatenation shapes (w03, w12)". The one measured concatenation went from a fix-less TS2345 to a fix-less TS2554.
   - The same notation sits in `README.md:91`, `src/htmx.ts:22` and `src/routes.ts:299`, while the always-loaded `CLAUDE.md:265` says `.resolve(query?)`. The corpus already carries two notations, and the RFC puts the misleading one on line 1 of every sink error.
2. **On 8.1.0 the no-repo agents "compile" in one pass (3/3), and under the RFC they do not (0/3 as written).** They compile on 8.1.0 by extracting the parameter type and casting every sink (18/18), which defeats the brand. The errors left under the RFC are the defineRoutes def-shape guess, which is outside this RFC, and attack 1, which change 1 fixes. In exchange, output tokens halve, request input is allowlisted 3/3, and the static file gets `assetUrl` 3/3.
3. **With RFC-B-01, agents spend more.** Output tokens rose about 60% (n=2), while the outcome improved (0/4 `routes.x().resolve()`, 1/2 clean compiles).
4. **The disclosed cast-free path is not cast-equivalent on `setHtmx`.** On this RFC alone it renders a silent `hx-undefined`. It needs RFC-B-01's dev throw.
5. **Context economy.** The 24 probe errors grow by 6,096 B (+141%).
6. **Exemplar conflict (open question 4).** `templates/web` sends 20/20 `assetUrl(` calls to page links and none to static files, while the new message says "for a static file". The RFC does not cause this, but this RFC is where it becomes visible.

## Does it survive?

**survives-with-changes.**

The brand already rejected the right shapes; this RFC makes the rejection teach. Measured results:
- 0/24 → 21/24 producers on line 1.
- Pure-prior `hx` sites: 0/6 → 6/6.
- Combined with RFC-B-01, the first error names the fix in 3/3 files, and `routes.x().resolve()` drops from 4/4 to 0/4.
- When the error is the only teacher, cast-laundering drops from 18/18 to 0, and request input is allowlisted instead of laundered (0/6 RFC-family runs wrapped it).
- The lint layer stops writing a TS2345 (3 → 1, and that 1 has 0 fleet reach).
- The template collision is closed.
- The lane holds:
  - JS byte-identical
  - fleet 14/14 identical
  - template tsc 0, unit 403/403, eslint 0
  - consumer declaration emit clean
  - test list 2164/2164

The killer objection is real and measured, and the RFC's own frame fixes it. A one-token notation change moves `resolve(undefined, { q })` from 3/3 to 0/3, with the same offsets, no truncation and +25 B. The `setHtmx` cast-free path is an exotic 200-character-key path. Shipping alongside RFC-B-01's dev throw closes it. Both changes are in the frontmatter.

Not required, but to log:
- **A defineRoutes def-shape follow-up.** All 6 RFC-family runs here wrote `defineRoutes({ team: "/team" })`. The resulting TS2322 (`'string' is not assignable to type 'RouteDef & …'`) names no fix.
- **The `templates/web` exemplar finding** (open question 4).

## Guardrail check (if this lens owns one)

| § | Check | Result |
|---|---|---|
| 1 | Zero runtime deps | Pass: 0 new deps. |
| 2 | Sync hot path | Pass: 68/68 JS identical. |
| 3 | Escape by default | Pass for `setHref` and `hx`. The `setHtmx` cast-free path renders `hx-undefined` until RFC-B-01's throw (change 2). |
| 4 | Type-safety | Pass: a plain union member, 0 inference through generic wrappers, and a generic wrapper compiles. The brand stays closed except for the disclosed verbatim-key path. |
| 5 | Instruction set | Pass: an augmentation gives TS2769 and cannot reach `hx`. |
| 6 | Pure core | Pass: the text names only lib producers. |
| 7 | Converge | Pass: no second way. Change 1 also leaves the lib with one resolve notation instead of two. |
| 11 | Breaking = codemod-first | N/A: fleet 14/14 identical. |
| 12 | Enforcement over prose | Pass: −2 lines, −552 B. |

No guardrail killer.
