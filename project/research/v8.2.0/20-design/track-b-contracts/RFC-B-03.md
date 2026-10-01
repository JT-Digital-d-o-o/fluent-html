---
id: RFC-B-03
track: B
title: "Branded route sinks print their producers on line 1; prefer-set-method stops autofixing a raw href into a TS2345"
resolves: [F-B-206, F-B-308]
cluster: C-12
api_surface:
  - "fluent-html AnchorTag.setHref(href?): parameter type gains the union member (string & { readonly [K in RouteSinkHint<\".setHref\">]: never })"
  - "fluent-html hx(endpoint, options?): parameter type gains (string & { readonly [K in RouteSinkHint<\"hx()\">]: never })"
  - "fluent-html Tag.setHtmx(endpoint, options?) (endpoint overload only), Tag.hxGet, Tag.hxPost: same member, one sink name each (\".setHtmx\", \".hxGet\", \".hxPost\")"
  - "fluent-html src/core/route-sink-hint.ts: new module, type RouteSinkHint<S>, imported type-only; not exported from any package entry point"
  - "fluent-html HTMX.endpoint: unchanged"
  - "eslint-plugin-fluent-html prefer-set-method: new messageId preferBrandedSetter; href on A() or an unknown receiver is reported without autofix unless the value already satisfies the brand"
  - "projects-template templates/full-stack/src/core/layout/assets.ts assetUrl(url): return type string -> ResolvedRoute (wraps fluent-html assetUrl; runtime identical)"
enforcement: type
error_text: |-
  src/app/pp1/views.ts(112,12): error TS2345: Argument of type '"/team/members"' is not assignable to parameter of type 'ResolvedRoute | ExternalHref | (string & { readonly "hx() takes routes.x.resolve(params?, query?) from defineRoutes, assetUrl(path) for a static file or externalUrl(url) for an off-site URL (never request input), not a URL string; for a defineRoutes route, routes.x(options) replaces hx()": never; })'.
prose_deleted: ["guidelines/web-development/htmx.md:225", "guidelines/web-development/htmx.md:474"]
guideline_delta: -2
lockstep: [eslint, guidelines, template]
codemod: none
codemod_dry_run: "n/a"
dims_predicted: { error-quality: +1, decision-closure: +0.5, verification-loop: +0.25, context-economy: -0.1 }
impact: 2
effort: S
ships_to: 8.2.0
depends_on: []
status: proposed
---

# RFC-B-03: Branded route sinks print their producers on line 1; prefer-set-method stops autofixing a raw href into a TS2345

All commands below ran in this scratch root:
`$R = <scratch>/wave2/RFC-B-03`

| Path | What it is |
|---|---|
| `$R/lib` | Scratch copy of fluent-html 8.1.0, built with its own `build` script. The real `dist/` was never rebuilt. |
| `$R/app` | The Wave-0 teamapp scaffold on the 8.1.0 pack, TypeScript 6.0.3. |
| `$R/app2` | The same scaffold with the RFC lib build, the RFC `prefer-set-method` rule and the RFC `assets.ts`. |
| `$R/eslint` | Scratch copy of eslint-plugin-fluent-html 4.1.0. |
| `$R/fleet` | Copies of the 14 live 8.1.0 repos. |

The probe matrix is `$R/probes/{wrong,green,second-way,fixes}.ts`. The comparison script is `node $R/cmp.mjs`.

## Problem

The 8.0.0 brand rejects the right shapes, but its error never says what to pass instead.

**The error names no fix.** Five parameters take `ResolvedRoute | ExternalHref`:
- `AnchorTag.setHref` (`src/elements/links.ts:30`)
- `hx` (`src/htmx.ts:420`)
- `setHtmx`'s endpoint overload, `hxGet` and `hxPost` (`src/core/htmx-methods.ts:18-20`)

The only text a raw string gets is that union. The three producers that satisfy it are documented only in JSDoc (`src/htmx.ts:14-33`):
- `routes.x.resolve(params?, query?)`
- `assetUrl(path)`
- `externalUrl(url)`

I measured 24 wrong-shape probes on 8.1.0 (`$R/before.txt`). The shapes are:
- a literal, a `string` variable, a concatenated query and a template literal
- an uncalled callable and `routes.x()`
- request input
- the hand-written bag
- `routes.x().resolve()`

**0/24 name any producer.**

**The pure prior hits this first.** pp1 and pp2 both write `.setHtmx(hx("/team/members", {…}))`, 2 sites each (recon 02 D2). Replayed in the TS 6.0.3 scaffold (`$R/app-pp.txt`), the 4 sites give 4 TS2345 errors that name no fix.

**RFC-B-01 does not cover this sink.** RFC-B-01's agent-fitness verdict found that the first error in 3/3 verb-aware files is `.setHref("/team")`, which names no fix. All 6 RFC-family runs then guessed `routes.x().resolve()` (`30-verification/V-RFC-B-01-agent-fitness.md:55,72`).

**The lint autofix writes the error.** `prefer-set-method` runs at error level (`projects-template/templates/shared/eslint.config.mjs:62`). It autofixes `A("Team").addAttribute("href", "/team")` to `.setHref("/team")` (`fluent-html-eslint-plugin/src/rules/prefer-set-method.ts:12,160-178`). Measured in `$R/app`: `eslint --fix`, then tsc, gives 1 TS2345 (`$R/app-q34-tsc.txt`).

**The test pins the fix-less text.** `test/brand-errors.test.ts:59,64` assert only `/not assignable to parameter of type 'ResolvedRoute/`.

**The prose is wrong in one place.** `guidelines/web-development/htmx.md:215` says the `hxGet`/`hxPost` endpoint "is a route callable, a `.resolve()`, …". On 8.1.0 both `hxGet(routes.detail)` and `hxPost(routes.list())` are TS2345 (probes w20, w23).

**The template has a name collision.** `templates/full-stack/src/core/layout/assets.ts:40` exports its own `assetUrl(url): string`, which is unbranded. `A("Download").setHref(assetUrl("/files/guide.pdf"))` with the template's import is a TS2345 (`$R/b03asset/p.ts` in `$R/app`). Without a template change, a message that names `assetUrl(path)` would send a template app round in a circle.

## Instruction-set check

- **projects-template src and packages/ui.** I grepped for `takes a ResolvedRoute|takes routes|route callable|externalUrl()`. Neither has a hint on any lib sink. The two precedents for this device both sit one layer up:
  - `templates/shared/eslint-rules/branded-redirect.mjs:42` names `route.resolve()`, `externalUrl()` and `validateReturnTo()`, but only for `reply.redirect`, a Fastify sink the lib does not own.
  - RFC-B-01's `NotARoute` covers the template verbs.

  `packages/ui/src` has 0 hits for `setHref|hxGet|hxPost|hx(|ResolvedRoute|externalUrl|assetUrl`.
- **A template augmentation cannot do this.** Declaring a hinted `setHref` overload on `AnchorTag` from the template gives `TS2769: No overload matches this call.` on line 1, and the hint lands on line 3 of 6. `hx()` is a function, so it cannot be augmented at all: it still prints the 8.1.0 text (`$R/app`, aug.ts probe).
- **The eslint plugin has no rule for this.** `prefer-nav-for-internal-links` matches only `A().setHref("/literal")`. The template dropped it as unreachable (ledger side-finding 6).
- **Fleet census.**
  - The 14 live 8.1.0 repos carry 570 sink text sites. All their `.d.ts` copies of the three affected files are byte-identical to the base build.
  - `addAttribute("href", …)` has 0 canonical-era sites, and 11 sites in pre-7 repos.
  - `Parameters<…>[0]` extraction of a sink parameter has 0 sites. The 3 `Parameters<typeof hx>[1]` sites are all in the lib's own tests, and they extract the options parameter.

Only the lib owns these parameter types, so only the lib can put the producers on line 1.

## Proposed change

### Lib (type-only; 0 bytes of `dist/src` JS change)

New file `src/core/route-sink-hint.ts`:

```ts
// The sentence tsc prints when a raw string reaches a route sink. Sinks use it inside an
// inline mapped key so tsc prints the text; a named alias would print only its name.
export type RouteSinkHint<S extends string> = S extends "hx()"
  ? `hx() takes routes.x.resolve(params?, query?) from defineRoutes, assetUrl(path) for a static file or externalUrl(url) for an off-site URL (never request input), not a URL string; for a defineRoutes route, routes.x(options) replaces hx()`
  : S extends ".setHtmx"
    ? `.setHtmx takes routes.x(options) from defineRoutes, or routes.x.resolve(params?, query?), assetUrl(path) for a static file or externalUrl(url) for an off-site URL (never request input), not a URL string`
    : `${S} takes routes.x.resolve(params?, query?) from defineRoutes, assetUrl(path) for a static file or externalUrl(url) for an off-site URL (never request input), not a URL string or routes.x()`;
```

The sinks. Each file adds an `import type { RouteSinkHint }`:

```ts
// src/htmx.ts
export function hx(
  endpoint: ResolvedRoute | ExternalHref | (string & { readonly [K in RouteSinkHint<"hx()">]: never }),
  options: HxOptions = {}
): HTMX

// src/core/htmx-methods.ts (declaration merge)
setHtmx(htmx?: HTMX): this;   // unchanged
setHtmx(endpoint: ResolvedRoute | ExternalHref | (string & { readonly [K in RouteSinkHint<".setHtmx">]: never }), options?: HxOptions): this;
hxGet(endpoint: ResolvedRoute | ExternalHref | (string & { readonly [K in RouteSinkHint<".hxGet">]: never }), options?: Omit<HxOptions, "method">): this;
hxPost(endpoint: ResolvedRoute | ExternalHref | (string & { readonly [K in RouteSinkHint<".hxPost">]: never }), options?: Omit<HxOptions, "method">): this;
// implementation: the overloaded method needs a parameter wide enough for both overloads
p.setHtmx = function (endpointOrHtmx?: string | HTMX, options?: HxOptions) {
  return this._setHx(typeof endpointOrHtmx === "string" ? hx(endpointOrHtmx as ResolvedRoute, options) : endpointOrHtmx, "setHtmx");
};

// src/elements/links.ts
setHref(href?: ResolvedRoute | ExternalHref | (string & { readonly [K in RouteSinkHint<".setHref">]: never })): this
```

The diff is +17/-7 in src. Each shape choice was measured:

- **RFC-B-01's device, with a `string` base instead of `HTMX`.** The member is a subtype of `string`, so `setHref`, `hx`, `hxGet` and `hxPost` need 0 implementation edits. `setHtmx` alone needs its implementation parameter widened, because otherwise it is TS2322 against the overload pair (`$R/lib`, first build).
- **An inline mapped key, not a named alias.** tsc prints the key text, and prints an alias only by its name (F-B-308; RFC-B-01 shape.ts).
- **Under tsc's truncation cap.** tsc cuts a printed parameter type at 320 chars. The measured printed types run from 257 to 300 chars (`hx` is the longest), so 0/24 hints are truncated. A new test pins the tail of the `hx` sentence, so a later wording edit cannot silently cut it.
- **A separate module.** `fluent-html/htmx` is a public subpath, so the alias does not live in `htmx.ts`. Importing it gives TS2305 from `fluent-html` and `fluent-html/core`, and TS2459 from `fluent-html/htmx`. The emitted `dist/src/core/route-sink-hint.js` is `export {};`, with 0 runtime importers.
- **One sentence per sink, in RFC-B-01's style:** `<sink> takes <producers>, not <wrong shapes>`. Each sentence is true on every error it heads:
  - A string, a variable, a concatenation or a template literal is "a URL string".
  - An uncalled `routes.x` is answered by `routes.x.resolve(...)`.
  - `routes.x()` into `setHref`, `hxGet` or `hxPost` is "not … routes.x()".
  - `routes.x()` into `hx()` is "routes.x(options) replaces hx()".
  - `setHtmx` gets no "not routes.x()", because there `routes.x()` is valid through overload 1.
- **`(never request input)` sits next to `externalUrl`.** The open-redirect probe w07 (`setHref(requestBody.redirect)`) must not read the message as "wrap it in `externalUrl`".
- **`params?, query?` names the query path.** It answers the concatenation shapes (w03, w12). This is the README's notation (`README.md:91`).

### Lib tests

The diff is +31/-15.

`test/types/brand-probe/probe.ts` gains 4 must-fail lines:
- `A("team").setHref("/team")`
- `Div().hxGet("/tasks")`
- `Div().hxPost("/tasks/new")`
- `Div().setHtmx("/tasks", { target: "#list" })`

`test/brand-errors.test.ts` changes as follows:
- The count goes from 5 to 9.
- Two fix-less regex pins (`:59`, `:64`) are replaced, together with the 2 bare must-fail tests for `hx(requestBody.redirect)` and `hx("/tasks")` (:67-74). In their place come 7 per-sink pins on the first message line (`d.messageText` head), each requiring `<sink> takes routes.x.resolve(params?, query?) from defineRoutes, assetUrl(path) for a static file or externalUrl(url) for an off-site URL (never request input), not a URL string`.
- One `setHtmx(path, options)` pin is added.
- One truncation pin is added: `hx` must end `replaces hx()": never; })'.`.

Both ways: on the 8.1.0 lib, **3/12 pass (9 fail)**. On the RFC lib, **12/12 pass**.

### eslint-plugin-fluent-html: `prefer-set-method` (+27/-0)

```ts
// Setters whose argument is the ResolvedRoute brand, keyed by attribute, with the factories
// that return the branded tag. A raw value there is a compile error, so it is never autofixed.
const BRANDED_URL_SETTERS: Record<string, readonly string[]> = { href: ["A"] };
const EXTERNAL_HREF = /^(https?:\/\/|mailto:|tel:|#)/;
// brandSafe(v): ExternalHref-shaped Literal/TemplateLiteral, or a call to assetUrl/externalUrl/<x>.resolve
// rootFactory(node): the Identifier callee at the root of the call chain, or null
// in the 1:1 branch:
if (branded && !brandSafe(valueArg)) {
  const root = rootFactory(node);
  if (root === null || branded.includes(root)) { context.report({ node, messageId: "preferBrandedSetter", data }); return; }
}
// message:
preferBrandedSetter: 'Use .{{method}}(…) instead of .addAttribute("{{attr}}", {{value}}). .{{method}} takes routes.x.resolve(params?, query?) from defineRoutes, assetUrl(path) for a static file or externalUrl(url) for an off-site URL (never request input), not a URL string, so this is not auto-fixed.'
```

The tests change by +38/-2. The old case pinned the bad autofix (`A("Link").addAttribute("href", "/page")` → `.setHref("/page")`), and it now expects `preferBrandedSetter` with `output: null`. Seven cases are added:
- 2 report-only: a chained `A()` with a variable, and an unknown receiver.
- 5 that keep the autofix: an `https` literal, a `#${id}` template, `.resolve()`, `assetUrl()`, and `Link()` (unbranded).

Results: rule tests 422 → **429/0**, type-aware 19/0, derivation 14/14. The new cases fail on the 4.1.0 rule (unknown messageId). C-46 (9.0.0) adds `action`/`formaction` and the `Area`/`Use` roots as rows of `BRANDED_URL_SETTERS`.

### Template: `templates/full-stack/src/core/layout/assets.ts`

```ts
import { assetUrl as staticAsset, type ResolvedRoute } from "fluent-html";   // with the node: imports
export function assetUrl(url: string): ResolvedRoute {
  const publicPath = url.replace(/^\//, "");
  const version = assetVersion(publicPath);
  return staticAsset(version ? `${url}?fingerprint=${version}` : url);
}
```

`ResolvedRoute` is a subtype of `string`, so every existing caller compiles: `Link().setHref`, `Script().setSrc`, and the static-cache test. After the change, the template's `assetUrl` satisfies the message's `assetUrl(path)` in `A().setHref` (`$R/b03asset/p.ts`: TS2345 on 8.1.0, 0 errors with the RFC).

### Guidelines (net -2 lines, -552 B)

| Location | Change | Bytes |
|---|---|---|
| `guidelines/web-development/htmx.md:225` | Delete: `Button("Load").hxGet("/api/items") // ✗ a "/" literal is not a ResolvedRoute`. The error now teaches this. | part of 259 B (two whole lines) |
| `guidelines/web-development/htmx.md:474` | Delete: `A("Users").setHref("/users") // ✗ does not compile since 8.0.0 (ResolvedRoute \| ExternalHref)` | part of 259 B |
| `htmx.md:215` | Drop the sentence `A "/api/items" literal is neither type … or a literal https://…/#….`. It is redundant, and its "a route callable" is false (w20, w23). Line kept. | 182 B |
| `htmx.md:181` | Drop `; escapes for genuinely external targets: externalUrl() / assetUrl()`. `assetUrl` is not for external targets. Line kept. | 72 B |
| `guidelines/web-development/CLAUDE.md:265` | Drop `; escapes: externalUrl()/assetUrl()`. Line kept. This always-loaded line also takes RFC-B-01's required change 4, so apply both in one commit. | 39 B |

The template's `CLAUDE.md` copy (`:265`, in sync for lines 250-280) and the fleet copies follow through `guidelines:pull`.

## Before → after

**Pure prior (pp1/team/views.ts:112, replayed in the TS 6.0.3 scaffold):**
```ts
.setHtmx(hx("/team/members", { method: "get", trigger: "input changed delay:250ms, search", target: `#${IDS.list}`, swap: "outerHTML" }))
```
```
8.1.0: src/app/pp1/views.ts(112,12): error TS2345: Argument of type '"/team/members"' is not assignable to parameter of type 'ResolvedRoute | ExternalHref'.
RFC:   src/app/pp1/views.ts(112,12): error TS2345: Argument of type '"/team/members"' is not assignable to parameter of type 'ResolvedRoute | ExternalHref | (string & { readonly "hx() takes routes.x.resolve(params?, query?) from defineRoutes, assetUrl(path) for a static file or externalUrl(url) for an off-site URL (never request input), not a URL string; for a defineRoutes route, routes.x(options) replaces hx()": never; })'.
```
Both fixes the message names compile, with tsc 0 (`$R/probes/fixes.ts`, 8 shapes): `setHtmx(teamRoutes.members({ trigger, target, swap }))` and `setHtmx(hx(teamRoutes.members.resolve(), {…}))`. The full replay gives 26 errors under both libs, at the same locations with the same codes, and 4/4 `hx` sites name the producers.

**Recon probe #10, `A("Team").setHref("/team")`:**
```
8.1.0: error TS2345: Argument of type '"/team"' is not assignable to parameter of type 'ResolvedRoute | ExternalHref | undefined'.
RFC:   error TS2345: Argument of type '"/team"' is not assignable to parameter of type 'ResolvedRoute | ExternalHref | (string & { readonly ".setHref takes routes.x.resolve(params?, query?) from defineRoutes, assetUrl(path) for a static file or externalUrl(url) for an off-site URL (never request input), not a URL string or routes.x()": never; }) | undefined'.
```

**Lint then tsc (F-B-206 q34), in the scaffold:**
```
4.1.0: error  Use .setHref("/team") instead of .addAttribute("href", "/team"). Dedicated methods provide type safety and autocomplete  -> --fix -> TS2345 (1 error)
RFC:   4:21  error  Use .setHref(…) instead of .addAttribute("href", "/team"). .setHref takes routes.x.resolve(params?, query?) from defineRoutes, assetUrl(path) for a static file or externalUrl(url) for an off-site URL (never request input), not a URL string, so this is not auto-fixed  fluent-html/prefer-set-method
       -> --fix leaves it; the https literal and .resolve() siblings are still autofixed; tsc 0
```

**Probe matrix** (`node $R/cmp.mjs before.txt after-v3.txt`; the same result in the scaffold under TS 6.0.3, where `diff` of the diagnostic text against 5.9.3 is empty):

| Measure | 8.1.0 | RFC |
|---|---|---|
| wrong shapes naming any producer | 0/24 | 23/24 |
| producers on line 1 | 0/24 | 21/24 |
| line-1 char of `takes routes.x` | - | 138-159 (18 probes); 385-454 for an uncalled callable (w05, w10, w20), where tsc prints the callable type first |
| setHtmx(string) / hand-written bag (TS2769) | no fix | hint on line 4 of 5 (tsc owns line 1 of an overload error) |
| `routes.x().resolve()` (w24, TS2339 before the sink) | no fix | unchanged |
| truncated hints | - | 0/24 (printed type 257-300 of 320) |
| sanctioned sink calls in green.ts (47 calls, 4 generic wrappers, `Parameters<>` extraction, endpoint reads) | 0 errors | 0 errors |
| diagnostic bytes over 24 probes | 4,312 | 10,408 |

**With RFC-B-01** (its rfc3 verbs plus this lib, over the 3 verb-aware files from its verdict): 25 errors under both, at the same locations with the same codes. The `setHref` errors naming producers go from 0/6 to 6/6, and **the first error per file names the fix in 3/3** (0/3 with RFC-B-01 alone).

## Enforcement

**Type** is the strongest feasible layer. tsc is the loop every measured agent runs (recon 02: 4/4 ran tsc, 0/4 booted the app), and the brand already rejects every shape. Only the text was missing.

The one-shot fixes the sentence names:
- `routes.x.resolve(params?, query?)` for a modeled route
- `assetUrl(path)` for a static file
- `externalUrl(url)` for an off-site URL, never request input
- for `hx()`, the route callable `routes.x(options)` in place of `hx()`

**Lint** is the second layer only where tsc cannot see: `addAttribute("href", …)` is untyped. There the rule now repeats the same producers and stops writing the TS2345 itself.

## Replaces (converge)

- The fix-less TS2345 on all 5 branded parameters.
- The `prefer-set-method` autofix that turned a lint error into a compile error. The tsc and eslint layers now name the same fix.
- The `brand-errors.test.ts:59,64` pins on fix-less text.
- The prose enumerations of the escapes, at 2 whole lines and 3 in-line trims. One of these (`htmx.md:215`) was wrong.
- The template `assetUrl` that shared a name with the lib producer but did not satisfy the brand. There is now one name, and it satisfies the brand in both places.

It adds no second way:
- The message string itself is rejected for `setHref` and `hx`.
- An object carrying the key is rejected.

Those 3 `@ts-expect-error` lines are all consumed (`$R/probes/second-way.ts`). The one cast-free path is `Object.assign("/team", { [<verbatim 190-char key>]: null! })`. It renders byte-identical to `"/team" as never` in 6/6 payload × sink pairs: `javascript:` gives `about:blank` on href, an attribute-break payload is escaped, and a path is unchanged (`$R/probes/render-sw2.mts`).

## Lane & migration

**8.2.0, additive.** The `.d.ts` signatures of 5 public sinks change, so this is not 8.1.x. The only change is a widening by a member no ordinary value satisfies, and nothing breaks:

| Check | Result |
|---|---|
| lib test list (scratch) | 2159/2159 → 2164/2164 |
| color-optout type project | exit 0 |
| `dist/src` JS | 118/118 files byte-identical (the only JS diff is `dist/test/brand-errors.test.js`) |
| scaffold with RFC lib, RFC rule, RFC `assets.ts` | tsc 0, `eslint . --max-warnings=0` 0, vitest unit 403/403, static-cache integration 8/8 (8/8 on 8.1.0) |
| fleet (`$R/fleet/run.sh`): the RFC `.d.ts` dropped into 14 live 8.1.0 repos | tsc error sets identical 14/14 (0/0), 570 sink text sites |
| fleet: plus the template `assetUrl` patch | applied 11/14, tsc 0 in 14/14 |

**Reported skips:** fl-um, na-cent and gzs/stem-50 carry the older `?v=` body, so the scripted patch skips them. They take it on their next template sync.

**No codemod.** The plugin change is a minor version (4.2.0, new messageId).

## Guardrail check (§5, 1–13)

1. **Zero runtime deps:** pass.
2. **Sync hot path:** pass. 0 bytes of `dist/src` JS change, so no bench is needed. The only new runtime file is `export {};` and nothing imports it.
3. **Escape by default:** pass. The accepted set is unchanged. The verbatim-key path renders exactly as a cast.
4. **Type-safety:** pass, with one disclosed exception. The member is closed except for the verbatim-key `Object.assign` path, which is the cost of a cast. It uses a plain union member: no conditional on the argument and no inference through generic calls. The 4 generic wrappers in green.ts compile.
5. **Instruction set:** pass. A template augmentation gets TS2769 and cannot reach `hx()`.
6. **Pure core:** pass. The lib text names only lib producers, not `validateReturnTo` or `.nav`.
7. **Converge:** pass. See Replaces.
8. **Naming:** N/A. `RouteSinkHint` is internal and has no public name.
9. **Class-string contract:** N/A.
10. **Runtime-grammar contract:** N/A. No htmx name is emitted, and the JS is identical.
11. **Breaking = codemod-first:** N/A. Fleet 14/14 identical.
12. **Enforcement over prose:** pass. -2 lines and -552 B.
13. **Append-only styling:** N/A.

## Scorecard prediction

- **error-quality +1.** 0/24 → 21/24 on line 1 (23/24 on any line). The pure-prior replay names the fix at 4/4 sites. With RFC-B-01, the first error names the fix in 3/3 verb-aware files.
- **decision-closure +0.5.**
  - lint `--fix` no longer writes a TS2345 (1 → 0).
  - The false "route callable" claim at `htmx.md:215` is removed.
  - The template `assetUrl` collision is closed.
- **verification-loop +0.25.** 9 lib pins fail on 8.1.0 and pass with the RFC (3/12 → 12/12), and the plugin gains 7 cases.
- **context-economy -0.1.** Each sink error grows by about 230-270 chars: +6,096 B over 24 probes, and +1,088 B over the 4 pure-prior errors. Guidelines shrink by 552 B, of which 39 B is on the always-loaded line.

## Alternatives considered

- **F-B-308's optional never-key intersection**, `({ "<msg>"?: never } & (ResolvedRoute | ExternalHref))`. Rejected: it turns `` setHref(`https://${host}`) `` into a TS2345, a shape valid on 8.1.0 (`$R/shape/shape.ts:26`, TS 5.9.3 and 6.0.3). The intersection stops the template literal from being contextually typed.
- **F-B-206's string-literal member.** Rejected: it accepts the message string as a value, which would render as the href.
- **A `ResolvedRoute` base** (`ResolvedRoute & { … }`). This closes the `Object.assign` path, because it needs the unexported unique symbol, and it needs no `setHtmx` implementation edit. Rejected: tsc prints `string & { readonly [RouteBrand]: true; } &` (+35 chars), and `hx`'s sentence hits the 320-char cap ("…: neve...'", `$R/after-v1-rr.txt`).
- **Hint the `HTMX.endpoint` field.** Rejected: it widens reads, and 3/47 green shapes break: `setHref(routes.x().endpoint)`, `hx(routes.x().endpoint, …)`, and `const ep: ResolvedRoute | ExternalHref = routes.x().endpoint`. The hand-written bag still gets the hint, on line 4, through `setHtmx`'s second overload.
- **Collapse `setHtmx`'s overloads** so a bare string gets a one-line TS2345. Rejected: it admits `setHtmx(bag, options)`, whose options the implementation silently drops.
- **A template augmentation:** TS2769, hint on line 3 of 6, and `hx()` cannot be reached.
- **One shared sentence for all 5 sinks.** Rejected: "not routes.x()" is false for `setHtmx`, and "replaces hx()" applies only to `hx`. Per-sink sentences also match RFC-B-01's `.${V} takes` style.
- **Make `prefer-set-method` report-only for every `href`** (the cluster's suggestion). Refined instead: report-only drops autofixes that are correct today (an https literal, `#…`, `.resolve()`, `assetUrl()`, `Link()`). The gate keeps those 5 and refuses only what tsc would reject.
- **A guideline bullet:** rejected by §5.12.

## Open questions (for curation)

1. **Uncalled callable.** The sentence lands at char 385-454 because tsc prints the callable's type first. A named route-callable alias in the lib would pull it forward (RFC-B-01 open question 2). That is a separate change.
2. **`routes.x().resolve()`** is a TS2339 raised before the sink, and it names no fix. RFC-B-01's agent-fitness runs wrote it 6/6 while `setHref` named no fix. This RFC spells out `routes.x.resolve(…)` and lists `routes.x()` as wrong. The agent-fitness lens should rerun RFC-B-01's no-repo harness (`wave3/RFC-B-01-agent-fitness/nr`) with this lib to measure whether that guess drops. If it does not, an RFC-A-04-style trap member on `RenderTagged` is the follow-up.
3. **In-app links.** For an internal `setHref` in an htmx app, the first producer compiles but does a full-page reload (`htmx.md:470-478` prefers `.nav`). The lib cannot name a template verb. F-D-606's retargeting of `prefer-nav-for-internal-links` to `A().setHref(x.resolve())` is where that steer belongs.
4. **templates/web.** 20/20 `assetUrl` calls in `templates/web/src` launder page links, and 0 point at a static file. The message's "for a static file" disagrees with that exemplar. Its nav config should be typed `ResolvedRoute | ExternalHref` and built with `.resolve()`; this is a follow-up finding.
5. **The `Object.assign` verbatim-key path.** Accept it as a cast equivalent (measured identical output), or close it with the `ResolvedRoute` base at the cost of +35 chars and a shorter `hx` sentence?
6. **C-46 (9.0.0)** brands `setAction`, `setFormaction` and `Area`/`Use` `setHref`. They reuse `RouteSinkHint<".setAction">` and so on, plus new rows in `BRANDED_URL_SETTERS`.
