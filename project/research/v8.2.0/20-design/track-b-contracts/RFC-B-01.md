---
id: RFC-B-01
track: B
title: Swap verbs name the route-callable fix for a raw route; dev throw on a request-less bag
resolves: [F-B-101, F-B-201, F-B-302, F-B-506]
cluster: C-01
api_surface:
  - "projects-template swap-verbs.ts: FluentCustomMethods.nav / tab / submit / search(route) / onChange: route param becomes PageRoute | (HTMX & { readonly [K in NotARoute<V>]: never })"
  - "projects-template swap-verbs.ts: FluentCustomMethods.fragment / poll / search(target, route): route param becomes <existing stance intersection> | (HTMX & { readonly [K in NotARoute<V>]: never })"
  - "projects-template swap-verbs.ts: FluentCustomMethods.fire: route param becomes HTMX | (HTMX & { readonly [K in NotARoute<\"fire\">]: never })"
  - "projects-template swap-verbs.ts: type NotARoute<V> (module-private)"
  - "fluent-html: no exported symbol changes; Tag._setHx (@internal) calls a new @internal assertRequestBag (src/core/dev-checks.ts) when devChecks is on"
enforcement: type
error_text: "src/b01/r01-nav-literal.ts(5,32): error TS2345: Argument of type 'string' is not assignable to parameter of type 'PageRoute | (HTMX & { readonly \".nav takes a route callable result such as routes.x() from defineRoutes, not a URL string, .resolve() or an uncalled route\": never; })'."
prose_deleted: []
guideline_delta: 0
lockstep: [template]
codemod: none
codemod_dry_run: null
dims_predicted: { error-quality: +1, silent-failure: +1, verification-loop: +0.5 }
impact: 3
effort: S
ships_to: 8.1.x
depends_on: []
status: proposed
---

# RFC-B-01: Swap verbs name the route-callable fix for a raw route; dev throw on a request-less bag

Scratch root for every command below:
`$R = <scratch>/wave2/RFC-B-01`
(`$R/app` = the Wave-0 teamapp scaffold copy, fluent-html 8.1.0 pack, TypeScript 6.0.3; `$R/lib` = a
scratch copy of fluent-html built with its own `build` script; the real `dist/` was never rebuilt).

## Problem

`A("Team").nav("/team")` is the guess the 2026-08-14 scorecard recorded as leverage item 1. It has been
marked "did not move" on two scorecards (L-084). On 8.1.0 it fails in two ways:

1. **The type error names no fix.** All 8 template verbs (`nav tab submit fragment poll search onChange fire`,
   `projects-template/templates/full-stack/src/core/htmx/swap-verbs.ts:111-169`) reject a raw route with a
   TS2345. The message names the parameter type (`PageRoute`, then `HTMX`) and never the route callable.
   Re-measured here over 19 raw-shape probes (`$R/before.txt`): **0/19 name a fix anywhere**. The probes
   cover a literal, a `string` variable, a template literal, `.resolve()`, `.path` and the uncalled
   callable, across all 8 verbs (F-B-101: 8/8; F-B-201: 12/12; F-B-302: 6/6).
2. **The runtime output is silent garbage.** When tsc is bypassed (a cast, JS, `any`), the verb spreads its
   argument into the bag (`swap-verbs.ts:260-262`). `Tag._setHx` stores the bag unchecked
   (`fluent-html/src/core/tag.ts:638-642`), and `buildHtmx` concatenates `'hx-' + htmx.method`
   (`src/render/serialize.ts:140`). Measured on 10 wrong shapes (`$R/render-app.json`, NODE_ENV=test with
   dev checks on): 9 render `hx-undefined="undefined"` and the uncalled callable renders `hx-get="undefined"`.
   0 throw. Pinned-bundle oracle (`node $R/oracle.mjs`, Chromium, htmx.org 4.0.0-beta6 and the template's
   `public/js/htmx.min.js`): 9/10 are inert (0 requests, 0 console lines) in both bundles. The uncalled
   callable fires `GET /undefined` and moves the URL to `/undefined` in both.
3. **Unpinned.** The lib has 0 of 155 `@ts-expect-error` directives and the template 0 of 43 compile-probe
   fixtures that pass a string to a verb (F-B-506).

## Instruction-set check

- **Template src + packages/ui** (grep for `NotARoute|RawPath|URL string|route callable|not a route`): no guard on
  the verb argument. The nearest precedents are the template's own `DeclaresNothing` message key on the fragment
  verbs (`swap-verbs.ts:81-83`) and the lint `templates/shared/eslint-rules/branded-redirect.mjs:42`
  (`reply.redirect() takes a ResolvedRoute`), which use the same idea of naming the fix in the message.
  `packages/ui/src`: 0 verb calls and 0 `PageRoute`/`FragmentRoute` uses.
- **eslint-plugin-fluent-html 4.1.0**: no rule matches a string in `.nav(`. `prefer-nav-for-internal-links`
  targets `A().setHref`.
- **Fleet** (recon-01 dedup corpus, AST census `$R/census/verbs.mjs`): 3,038 canonical-era verb call sites.
  2,760 pass a call expression; **0** pass a string literal (the 2 `string-literal` hits are
  `googlePlacesLookup(...).search("…")` in a test). 0 pass `.resolve()`. 28 repos vendor `swap-verbs.ts`,
  14 of them at 8/8 signature parity with the template, and none carries a hint. So the fleet learned the
  callable from exemplars. The raw guess is what an agent writes before it reads one.
- **Why the lib is touched at all**: the type half needs no lib support, so it stays template-owned (S-19).
  The runtime half is the lib's own invariant. `HTMX.method`/`HTMX.endpoint` are required fields
  (`src/htmx.ts:275-276`), and the lib emits `hx-${method}` as an attribute *name*, which it already guards
  for `hx-status` keys (`serialize.ts:177`) and toggle names. One gate in `_setHx` covers every template verb,
  `setHtmx`, all 14 vendored verb copies (via the lib bump, without a template sync) and any future seam.

## Proposed change

### Template: `templates/full-stack/src/core/htmx/swap-verbs.ts` (type-only, implementations untouched)

```ts
type NotARoute<V extends string> =
  `.${V} takes a route callable result such as routes.x() from defineRoutes, not a URL string, .resolve() or an uncalled route`;

declare module "fluent-html" {
  interface FluentCustomMethods {
    nav(route: PageRoute | (HTMX & { readonly [K in NotARoute<"nav">]: never }), options?: SwapOptions): this;
    tab(route: PageRoute | (HTMX & { readonly [K in NotARoute<"tab">]: never })): this;
    submit(route: PageRoute | (HTMX & { readonly [K in NotARoute<"submit">]: never }), options?: SwapOptions): this;
    fragment<N extends string, S>(
      target: Id<N>,
      route: FragmentRoute<NoInfer<N>> & NeedsStance<S> & RenderTagged<S> | (HTMX & { readonly [K in NotARoute<"fragment">]: never }),
      swap?: OuterSwap,
    ): this;
    poll<S>(route: FragmentRoute<string> & NeedsStance<S> & RenderTagged<S> | (HTMX & { readonly [K in NotARoute<"poll">]: never }), every?: PollInterval): this;
    search(route: PageRoute | (HTMX & { readonly [K in NotARoute<"search">]: never }), delay?: SearchDelay): this;
    search<N extends string, S>(
      target: Id<N>,
      route: FragmentRoute<NoInfer<N>> & NeedsStance<S> & RenderTagged<S> | (HTMX & { readonly [K in NotARoute<"search">]: never }),
      delay?: SearchDelay,
    ): this;
    onChange(route: PageRoute | (HTMX & { readonly [K in NotARoute<"onChange">]: never })): this;
    fire(route: HTMX | (HTMX & { readonly [K in NotARoute<"fire">]: never })): this;
  }
}
```

Each choice in that shape was measured:
- **Inline mapped member, not an alias.** tsc prints aliases by name (`Hint & HTMX & …`, `HintOf<"nav"> & …`
  in `$R/shape/shape.ts`), which drops the sentence from line 1. An inline mapped type over the template-literal
  alias prints the resolved key (`$R/shape/shape2.ts`). This is identical on TS 5.9.3 and 6.0.3 (`shape3.ts`);
  the fleet runs 6.0.3 in 14/15 repos and 5.9.3 in 1.
- **`HTMX & {…}`, not a bare `{…}`.** A bare member makes the 3 generic implementations (`fragment`, `search`,
  `poll`) fail TS2322 (`$R/after-B.txt`, 3 errors). The `HTMX &` keeps the member a subtype of `HTMX`, so every
  `p.verb = function (route: HTMX, …)` stays as is (0 implementation edits).
- **A `never`-valued key accepts no value**, unlike F-B-201's string-literal member, which would accept the
  message string itself (and render `hx-undefined`).
- **No precedence parens on the fragment family**, so `route-prop-laundering.test.ts:87,98,101` (source-text
  pins of those signatures) keep matching. With parens they fail 2/3 (measured).

Compile pins, added to `projects-template/tests/define-controller-compile.test.ts` (fixtures and regexes run
verbatim by `$R/pin.mjs`):

```ts
"probe-nav-raw-path.ts":      `… export const link = A("Team").nav("/team");`
"probe-fragment-raw-path.ts": `… Span("x").fragment(probeIds.probe41Panel, "/probe41/panel");`
"probe-nav-uncalled-route.ts":`… A("Page").nav(probeRoutes.page);`
// line-1 assertions
/^src\/compile-probes\/probe-nav-raw-path\.ts\(\d+,\d+\): error TS2345: .*"\.nav takes a route callable result such as routes\.x\(\) from defineRoutes/
/^src\/compile-probes\/probe-fragment-raw-path\.ts\(\d+,\d+\): error TS2345: .*\.fragment takes a route callable result/
/^src\/compile-probes\/probe-nav-uncalled-route\.ts\(\d+,\d+\): error TS2345: .*an uncalled route/
```

### Lib: `src/core/dev-checks.ts` + `src/core/tag.ts` (8.1.x, dev-only)

```ts
// dev-checks.ts
const HX_METHODS = new Set(["get", "post", "put", "patch", "delete"]);

/** @internal The request gate: a bag `buildHtmx` would emit as hx-undefined / hx-get="undefined". */
export function assertRequestBag(tag: { el: string }, htmx: { method?: unknown; endpoint?: unknown }, method: string): void {
  if (typeof htmx.endpoint === "string" && HX_METHODS.has(htmx.method as string)) return;
  throw new Error(
    `<${tag.el}>.${method}() got an HTMX bag with no request (method: ${String(htmx.method)}, ` +
      `endpoint: ${String(htmx.endpoint)}). Pass a route callable result such as routes.x(), ` +
      `not a URL string, routes.x.resolve() or the uncalled routes.x.`,
  );
}

// tag.ts, _setHx
if (devChecks) {
  assertMutable(this, method);
  if (htmx !== undefined) assertRequestBag(this, htmx, method);
}
```

Plus 6 tests in `test/dev-checks.test.ts`: a spread string, a spread `.resolve()`, a spread uncalled callable,
an unknown method, and valid shapes passing (route callable, `hx()` with `delete`, `hxGet`/`hxPost`, clearing
`setHtmx()`). The sixth checks that `setDevChecks(false)` restores the old emit. Diff: +24/-2 in src, +42/-1 in
the test file.

## Before → after

Probe matrix: 19 raw-shape probes (`r01`-`r19`), 15 stance and other probes (`s01`-`s15`), and one green file
covering every valid call shape, including 9 generic-wrapper forms. Run with
`npx tsc --noEmit --pretty false -p tsconfig.b01.json` (`$R/before.txt` vs `$R/after-D.txt`), compared by
`node $R/cmp2.mjs`.

`A("Team").nav("/team")` (r01). Before, 2 lines, no fix:
```
error TS2345: Argument of type 'string' is not assignable to parameter of type 'PageRoute'.
  Type 'string' is not assignable to type 'HTMX'.
```
After, 1 line, fix at char 125:
```
error TS2345: Argument of type 'string' is not assignable to parameter of type 'PageRoute | (HTMX & { readonly ".nav takes a route callable result such as routes.x() from defineRoutes, not a URL string, .resolve() or an uncalled route": never; })'.
```
`Span("n").fragment(teamIds.teamList, "/team/list")` (r11). After: the hint prints first and the stance
intersection collapses:
```
error TS2345: Argument of type 'string' is not assignable to parameter of type '(HTMX & { readonly ".fragment takes a route callable result such as routes.x() from defineRoutes, not a URL string, .resolve() or an uncalled route": never; }) | (HTMX & ... 2 more ... & { ...; })'.
```

| Measure | 8.1.0 | RFC |
|---|---|---|
| raw-shape probes naming the fix (any line) | 0/19 | 19/19 |
| fix on line 1 | 0/19 | 18/19 (r09 `.search(id, "/x")` is TS2769 "No overload matches this call"; fix on line 2) |
| string/`.resolve()` probes (r01-r04, r06-r13, r18, r19) | 2 lines | 1 line, fix at char 114-135 |
| uncalled callable (r05, r14-r17) | 1-2 lines, no fix | 3 lines, fix at char 366-439 of line 1 (TS prints the callable's type first) |
| stance probes keeping every old elaboration line (trimmed) | - | 14/15 (s07 is the overload; its `declares no \`render\` stance` assertion still passes) |
| stance-probe cost | - | +1 line and +85 to +162 chars on line 1 in 12/15; s13/s14 (param errors) byte-identical |
| green file (valid shapes + 9 generic wrappers) | 0 errors | 0 errors |

Runtime, `$R/render-probe.ts` under NODE_ENV=test (dev checks on), scaffold with 8.1.0 (`$R/app`) vs. the
RFC lib and verbs (`$R/app2`):
```
8.1.0 A("Team").nav("/team") -> <a class="cursor-pointer" role="button" tabindex="0" hx-undefined="undefined" hx-target="#main-content" hx-swap="outerMorph show:top" hx-push-url="true" hx-indicator="#global-loading">Team</a>
RFC   A("Team").nav("/team") -> THROWS <a>.setHtmx() got an HTMX bag with no request (method: undefined, endpoint: undefined). Pass a route callable result such as routes.x(), not a URL string, routes.x.resolve() or the uncalled routes.x.
RFC   A("Team").nav(r.index) -> THROWS <a>.setHtmx() got an HTMX bag with no request (method: get, endpoint: undefined). …
```
10/10 wrong shapes throw (all 8 verbs plus `.resolve()` and the uncalled callable). **19/19 valid renders are
byte-identical (10,886 bytes)**, covering all 8 verbs, `{ invalid }`, multipart, `hx()`, `hxGet`/`hxPost`,
`Layout` and `LoginPage`. NODE_ENV=production on the RFC lib still renders `<a hx-undefined="undefined" hx-target="#m">x</a>`,
so production bytes are unchanged.

## Enforcement

**Type** is the strongest feasible layer, and it is where a single-pass agent looks: recon 02 found 4/4 agents
ran tsc and 0/4 booted the app. The sentence names the one-shot fix: a route callable result
(`routes.x()` from `defineRoutes`). It also names the three wrong shapes an agent reaches for: a URL string,
`.resolve()`, or an uncalled route. **Dev-throw** is the backstop for the paths tsc cannot see (`as any`, JS,
a laundered `unknown`). The census shows those paths are 0 canonical-era sites today: all 11 cast sites are in
`jt-cut` (fluent-html 5.10.0), and all 28 JS hits are lint-rule strings or rustdoc. A lint rule would add
nothing over the type error for TS callers and could not see a cast's runtime value.

## Replaces (converge)

- Replaces the fix-less TS2345 (`'string' is not assignable to 'PageRoute'` / `'HTMX'`) for every raw route
  shape on all 9 verb parameters.
- Replaces the silent `hx-undefined` / `hx-get="undefined"` emit in dev with a named throw at the verb's
  call stack.
- Adds no second way: the hint member is unsatisfiable (`never` key), and no valid call changes type.
- **Guideline lines deleted: none, net 0.** Neither `guidelines/web-development/**`, `fluent-html/CLAUDE.md`
  nor `README.md` states the rule. A grep for
  `route callable|url string|raw url|not a url|path string|takes the HTMX` returns 0 lines about verb
  arguments. The guidelines teach by example only (`CLAUDE.md:272`, `htmx.md:212`), which is why the guided
  run still guessed `.nav("/team")`. The RFC puts the rule in the error text, so it avoids the +1 bullet that a
  prose fix would add.

## Lane & migration

**8.1.x.** Lib: no exported symbol changes. `_setHx` and `assertRequestBag` are `@internal`. Emitted bytes change
only in dev, and only for bags that never sent a request (the `Partial()` precedent). Production is unchanged.
Template: a type-only widening by an unsatisfiable member, with no accepted value added and none removed.
No codemod. Measured "no valid call changes":
- **Scaffold** (`$R/app` with RFC verbs): `tsc -p tsconfig.json` exit 0 (src + tests + scripts); eslint
  `--max-warnings=0` on swap-verbs.ts: 0; vitest unit 35 files / **403/403** with the RFC lib too (`$R/app2`);
  verb suites 61/61; the template's 7 existing verb-contract assertions 7/7 (`node $R/dcc.mjs`); declaration
  emit exit 0.
- **Fleet types** (`$R/fleet/run.sh`): the same patch applied to 14 live repos (13 at 9/9 signatures, stem-50
  at 8/9), covering **1,877 verb text sites**. **tsc error sets were identical in 14/14** (0 errors before and
  after). This includes the 10 generic-wrapper sites, such as `website-sales-funnel-automation-system`
  `widget.helpers.ts:72` (`WidgetError<N>` → `.poll(route)` with `route: FragmentRoute<N>`).
- **Fleet runtime** (`$R/fleet-rt`, RFC lib + RFC verbs): everyframe-composer 3159/3160, identical to its
  baseline (the same test fails before and after). website-sales-funnel-automation-system 4428/4430: the 2
  failures are `secret-scan.test.ts` calling `git ls-files` in a copy without `.git`; in place, 182/182 files
  pass.
- **Lib** (`$R/lib`): the existing test list passes 2159/2159 before the change and 2165/2165 after (6 new).

## Guardrail check (§5, 1–13)

1. Zero runtime deps: pass (none added).
2. Sync render hot path: pass. `serialize.ts` is untouched and the gate runs at build time behind `devChecks`.
   Dev-mode bench (`node dist/bench/render.js`, 2 runs each): build+render realistic 16.06-16.34K ops/s base
   vs 16.19-16.38K RFC; HTMX render 36.6-37.1K vs 36.2-36.3K, within noise.
3. Escape by default: pass. The dev gate also rejects a `method` outside the 5 `HxHttpMethod`s, closing the
   `hx-${method}` attribute-name channel in dev. Production is unchanged (see Open questions).
4. Type-safety: pass. Closed: the member accepts no value. The gate needs no inference, so it does not
   depend on generic wrapper calls. The generic-conditional design was rejected because it broke
   generic wrappers (see Alternatives).
5. Instruction set: pass. Verbs stay template-owned (S-19). The lib guards only its own required `HTMX` fields.
6. Pure core: pass (no context, no Fastify glue).
7. Converge: pass (replaces the fix-less error and the silent emit; adds no second way).
8. Naming: N/A (no new public names).
9. Class-string contract: N/A (no classes emitted).
10. Runtime-grammar contract: pass. No htmx name is added. Valid bytes are identical 19/19, and the oracle
    confirms the control `hx-get` route sends `GET /team` in both pinned bundles.
11. Breaking = codemod-first: N/A (0 valid calls change; 14/14 repos tsc-identical).
12. Enforcement over prose: pass (0 lines added; the rule moves into error text).
13. Append-only styling: N/A.

## Scorecard prediction

- **error-quality +1**: the first raw-route error names the fix in 19/19 probes, 18/19 on line 1, against
  0/19 today. The cost: 12/15 stance errors gain one line and up to 162 chars on line 1, with every
  stance-naming elaboration line kept.
- **silent-failure +1**: 10/10 wrong shapes throw in dev, where today 9 are inert and 1 GETs `/undefined`.
- **verification-loop +0.5**: from 0 pins to 3 template line-1 compile pins (both ways: 0/3 on 8.1.0
  verbs, 3/3 after) plus 6 lib dev-check tests.

## Alternatives considered

- **Generic conditional gate** `nav<R>(route: R extends string ? Msg : …)` (F-B-101, F-B-506). It prints a
  targeted message and leaves stance errors untouched. Rejected on measurement: in the green matrix, 5
  generic-wrapper forms fail (`Poller<N>`, `NavG<R extends PageRoute>`, `SubmitG`, `FireG`, `ChangeG`), plus
  7 implementation TS2322s (`$R/after-A.txt`). On a live repo it breaks
  `website-sales-funnel-automation-system/src/app/admin/dashboard/widgets/widget.helpers.ts:72`: a deferred
  conditional rejects a generic `R`, which is the §5.4 dead end.
- **String-literal member** `PageRoute | "a URL string is not a route…"` (F-B-201). Rejected: it accepts the
  message string as a valid argument, which renders `hx-undefined`.
- **Optional never-key intersection** `{ "hint"?: never } & PageRoute` (F-B-302). Rejected: it expands
  `PageRoute` into `HTMX & {…}` on line 1 and keeps the misleading `Type 'string' is not assignable to type
  'HTMX'` second line (`$R/shape/shape.ts`).
- **Bare object member** `PageRoute | { "hint": never }`. It prints the same, but 3 implementations need
  widening (`$R/after-B.txt`).
- **Dev throw inside the template verbs** (F-B-201). It would name `.nav` instead of `.setHtmx`, but it
  misses `setHtmx`/`hxGet` callers, and the 14 vendored verb copies would only get it through a template
  sync. The lib gate reaches them through the lib bump, and its stack trace already shows the verb frame.
- **A lint rule on `.nav("…")`**: weaker than the type error for TS callers, and blind to casts.
- **A guideline bullet**: the prose fix the scorecard has been waiting on. It is rejected by §5.12.

## Open questions (for curation)

1. **Production guard for `method`.** Should `buildHtmx` reject a non-`HxHttpMethod` `method` in production too,
   the way `STATUS_KEY_RE` does for `hx-status` keys? That would be an always-on attribute-name check. It is
   out of 8.1.x scope here, because it turns an inert control into a thrown render in prod.
2. **Uncalled callable.** The fix lands at char 366-439 of line 1 because tsc prints the callable's full type
   first. A named route-callable alias in the lib (the same device as F-B-206/F-B-308) would pull it forward.
3. **Targeted `.search(id, "/x")`** stays a TS2769 overload error, with the fix on line 2. tsc owns line 1
   for overloads. Collapsing the two `search` signatures is a separate decision.
4. **Pre-existing, found while probing:** `.poll(route)` with `route: FragmentRoute<string>`, the exact type
   the `.poll` doc names, is rejected on 8.1.0 by `DeclaresNothing` (probe s15, `$R/before.txt`). It is
   unrelated to this RFC and is a candidate finding for the template.
5. Should the hint also state the stance contract? It now sits on line 1 of stance errors as well, where
   naming the stance would make it actionable there too.
