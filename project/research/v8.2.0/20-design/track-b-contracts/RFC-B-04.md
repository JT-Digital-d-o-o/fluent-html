---
id: RFC-B-04
track: B
title: One meaning for a bare selector word in every sink (htmx's); HxTarget closes its string arm
resolves: [F-B-309]
cluster: C-82
api_surface:
  - "HxTarget: closed union of htmx keyword ('this'|'body'|'host'|'next'|'previous'|'nextElementSibling'|'previousElementSibling') | `${'closest'|'find'|'findAll'|'next'|'previous'|'global'} ${string}` | HTML tag name | `${string}${'#'|'.'|'['|':'|' '|'>'|'+'|'~'|','|'*'|'('|'<'}${string}`; the `string` arm and the 'window'/'document' members are removed"
  - "HTMX.target/select/include/indicator/disable and HxStatusConfig.target/select: HxTarget | SelectorHint<BareWordSelectorMessage> (select/include/indicator/disable were string)"
  - "HxOptions and RouteHxOptions target/select/indicator/disable/include: HxTarget | Id | SelectorHint<BareWordMessage> (were HxTarget | Id and string | Id)"
  - "Partial: one signature Partial<const T extends HxTarget | Id>(target: T | SelectorHint<BareWordMessage>, content: View, swap?: HxSwap): [T] extends [Id<infer N>] ? Tag & Rooted<N> : Tag; the runtime bare-word '#' rewrite is removed"
  - "HxResponse.retarget/reselect(selector: HxTarget | SelectorHint<BareWordSelectorMessage>) (were string); HxLocationConfig.target/select the same"
  - "resolveSelector(value: HxTarget | Id | SelectorHint<BareWordMessage> | undefined): HxTarget | undefined (was string | Id | undefined -> string | undefined)"
  - "id/clss/closest/find/next/previous return `#${N}` / `.${N}` / `closest ${S}` / `find ${S}` / 'next' | `next ${string}` / 'previous' | `previous ${string}` instead of HxTarget"
  - "new @internal types reachable on the fluent-html/htmx subpath only: HtmlTagName, SelectorHint<M>, BareWordMessage, BareWordSelectorMessage"
enforcement: type
error_text: "src/probes/p01-hx-target.ts(2,65): error TS2322: Type '\"team-list\"' is not assignable to type 'HxTarget | Id<string> | SelectorHint<\"use ids.x for an element id; a bare word is an HTML tag or htmx keyword; type a string variable as HxTarget\"> | undefined'."
prose_deleted: []
guideline_delta: 0
lockstep: []
codemod: needed
codemod_dry_run: "lib 8/8 bare-word Partial literals rewritten (tests 2159/2159 -> 2160/2160); projects-template scaffold 0 rewrites / 0 skips (tsc 0 -> 0), templates/full-stack 154 -> 154 and templates/web 16 -> 16 pre-existing, packages/ui 0 -> 0; 15 live repos (5,265 files) 0 rewrites, 2 skips reported (everyframe-composer studio.voice.view.ts:326; gzs/stem-50 search.ts:6 -> 4 errors), each a 2-line fix verified at 0 errors"
dims_predicted: { silent-failure: +0.5, error-quality: +0.5, decision-closure: +0.5, prior-alignment: +0.25 }
impact: 2
effort: M
ships_to: 9.0.0
depends_on: []
status: proposed
---

# RFC-B-04: One meaning for a bare selector word in every sink

Scratch root for every command below:
`$R = <scratch>/wave2/RFC-B-04`.
`$R/lib` is a scratch copy of fluent-html 8.1.0 with the change, built with its own `tsc`. `$R/dist-base` is the same copy built before the change. `$R/app` is the Wave-1 B3 scaffold of projects-template, and every tsc run maps `fluent-html` to one of the two dists through `paths`. `$R/fleet/run.sh` runs the same overlay against a live repo. The real `dist/` was never rebuilt, and no repo was edited.

## Problem

fluent-html gives a bare word two meanings today, and nothing at compile time tells them apart:

- **`Partial` rewrites it to an id.** `Partial("team-list", …)` emits `hx-target="#team-list"` (`src/patterns.ts:86-93`: `/^[A-Za-z][\w-]*$/.test(target) ? \`#${target}\``). This is the 8.0.0 convenience inherited from `OOB(id, …)`.
- **Every other sink passes the word verbatim, so htmx reads a tag selector.** That covers `hx()` and route-callable options (`resolveSelector`, `src/htmx.ts:387-390`, called at `src/htmx.ts:427-431` and `src/routes.ts:427-431`). It also covers the raw `HTMX` bag and status bags (`src/render/serialize.ts:142-158`, `:192-193`), `hxResponse().retarget/reselect` (`src/patterns.ts:282,302`) and `HxLocationConfig.target/select` (`src/patterns.ts:158,160`).
- **The type is `string`.** `HxTarget = StandardCSSSelector | ExtendedCSSSelector` with `StandardCSSSelector = string` (`src/htmx.ts:134,147`). `select`, `include`, `indicator` and `disable` are plain `string` (`src/htmx.ts:252,282,294,302,303`). `REFERENCE.md:28` still says "HTMX targets are compile-time validated" (L-063).

Re-measured here with `node $R/browser.mjs`: Chromium, the lib's htmx 4.0.0-beta6 bundle and the template's 4.0.0 bundle. 7 cases x 2 bundles x 2 libs gives 28 rows (`$R/browser-final.txt`). On 8.1.0:

| Case | emitted | beta6 | 4.0.0 |
|---|---|---|---|
| `Div(Button("Load").setHtmx(hx(assetUrl("/list"), { target: "team-list", swap: "outerHTML" })), Ul(Li("old")).setId(ids.teamList))` (F-B-309) | `hx-target="team-list"` | button replaced by the response, `[id=team-list]` x2 (`NEW`, `old`), 1 console warning `'team-list' on hx-target did not match any element` | same |
| `Partial("main", Main(P("NEW")))` into a page `<main>` with no id | `hx-target="#main"` | `<main>` unchanged (`old`) | same |
| `hx(assetUrl("/m"), { target: "main", swap: "innerHTML" })` | `hx-target="main"` | `<main>` swapped | same |

So `main` reaches the `<main>` element through `hx()` and misses it through `Partial`. `team-list` reaches `#team-list` through `Partial`, while through `hx()` it swaps out the element that fired the request. On 8.1.0, all 10 wrong-guess probes in the table below compile with 0 errors (`$R/probes-base.txt` is empty).

## Instruction-set check

- **projects-template has already settled this for its own verbs.** `.fragment` and `.search` take `target: Id<N>` only (`templates/full-stack/src/core/htmx/swap-verbs.ts:130-131,152-153`). Its raw bags write `MAIN = layoutIds.mainContent.selector` and `target.selector` (`:210,:322,:346`), typed as `` `#${N}` `` literals. There is no string normalizer one layer up. `grep -rn 'resolveSelector|HxTarget|Partial("' templates packages --include='*.ts'` finds 0 normalizers and 0 `HxTarget` annotations. The only 2 `Partial(` hits are `Partial(ids.mainContent, …)` in `tests/unit/htmx-grammar-contract.test.ts:83,143`.
- **packages/ui:** `grep -rn 'target:\|retarget\|Partial(' packages/ui/src` finds 0 selector sinks.
- **In-lib precedent:** `BehaviorTarget = Id | "@self" | { closest: string }` (`src/behaviors/map.ts:26`) is already a closed selector grammar.
- **Fleet:** the wave-1 census `fleet.json` covers all eras. It holds 631 literal values in htmx selector sinks. 445 of them are bare words, and all 445 are an htmx keyword or an HTML tag name (`body` 341, `this` 52, `main` 52). 0 are id-like words. The other 186 carry punctuation. In the 8.x repos there are 17 bare words (`this` 15, `body` 2) and 37 `Partial` calls, all taking an `Id`.
- **Why the library:** both the sink types and the `#` rewrite are library code (`src/htmx.ts:147`, `src/patterns.ts:86-93`). A template lint could see literals, but not a `string` value, and it could not remove the `Partial` rewrite.

## Proposed change

**The rule.** A bare word in any selector sink means what htmx reads it as:

- an htmx keyword (`this`, `body`, `host`, `next`, `previous`, `nextElementSibling`, `previousElementSibling`), or
- an HTML tag name.

fluent-html never rewrites a selector string; only an `Id` becomes `#id`. Any other bare word does not compile, and the error names `ids.x`. The keyword and prefix lists are the ones both pinned bundles read in `#findAllExt`: beta6 `node_modules/htmx.org/dist/htmx.js:1889-1925`, and the same branches in the template's `public/js/htmx.min.js` (4.0.0). `window` and `document` are left out. As targets they throw before any request (F-A-109: 0/8 requests).

### Types (`src/htmx.ts`)

```ts
/** Every HTML element name: a bare word in a selector is a type selector for one of these. */
export type HtmlTagName = 'a' | 'abbr' | /* … 115 names: TS lib.dom HTMLElementTagNameMap (112) + 'math' | 'svg' | 'selectedcontent' */ | 'wbr';

// The bare words htmx 4 reads as keywords before CSS (pinned bundle #findAllExt).
// 'window' and 'document' are left out: as a target they throw before the request.
type HtmxSelectorKeyword =
  | 'this' | 'body' | 'host' | 'next' | 'previous' | 'nextElementSibling' | 'previousElementSibling';
type HtmxSelectorPrefix = 'closest' | 'find' | 'findAll' | 'next' | 'previous' | 'global';
type SelectorPunctuation = '#' | '.' | '[' | ':' | ' ' | '>' | '+' | '~' | ',' | '*' | '(' | '<';

export type HxTarget =
  | HtmxSelectorKeyword
  | `${HtmxSelectorPrefix} ${string}`
  | HtmlTagName
  | `${string}${SelectorPunctuation}${string}`;

/** @internal Prints its message on line 1 of the error a rejected selector gets. */
export type SelectorHint<M extends string> = { readonly [K in M]: never };
/** @internal Sinks that take an `Id`. */
export type BareWordMessage =
  "use ids.x for an element id; a bare word is an HTML tag or htmx keyword; type a string variable as HxTarget";
/** @internal Sinks that store the string verbatim (raw bag, status bag, response headers). */
export type BareWordSelectorMessage =
  "use ids.x.selector for an element id; a bare word is an HTML tag or htmx keyword; type a string variable as HxTarget";
```

### Sinks

| Sink | 8.1.0 | RFC |
|---|---|---|
| `HxOptions` / `RouteHxOptions`: `target` `select` `indicator` `disable` `include` | `HxTarget \| Id`, `string \| Id` | `HxTarget \| Id \| SelectorHint<BareWordMessage>` |
| `Partial(target, …)` | 2 overloads: `Id<N>` / `HxTarget` | `Partial<const T extends HxTarget \| Id>(target: T \| SelectorHint<BareWordMessage>, content, swap?): [T] extends [Id<infer N>] ? Tag & Rooted<N> : Tag` |
| `HTMX` bag `target` `select` `include` `indicator` `disable`; `HxStatusConfig.target/select`; `HxLocationConfig.target/select`; `retarget()` / `reselect()` | `HxTarget` or `string` | `HxTarget \| SelectorHint<BareWordSelectorMessage>` |
| `resolveSelector` | `(string \| Id \| undefined) => string \| undefined` | `(HxTarget \| Id \| SelectorHint<BareWordMessage> \| undefined) => HxTarget \| undefined` |
| `id` `clss` `closest` `find` `next` `previous` | return `HxTarget` | return `` `#${N}` ``, `` `.${N}` ``, `` `closest ${S}` ``, `` `find ${S}` ``, `'next' \| `` `next ${string}` ``, `'previous' \| `` `previous ${string}` `` |

The hint key is never-valued, so no value inhabits it. It is the RFC-B-01 technique. The hint stays on line 1 only when it is written inline as `SelectorHint<"…">`, because an alias carrying a literal argument prints the sentence. An alias over the whole union prints by name and loses it: in `$R/shape/shape.ts`, shape D prints `Id<string> | HxTargetD | undefined`. TS 6.0.3 (14/15 fleet repos) and the lib's 5.9.3 print the same line.

`Partial` is now a single signature, so a bad target gets TS2345 with the hint on line 1. With two overloads it got TS2769 "No overload matches this call", with the hint on line 5 (measured in `$R/build-after.txt`). The non-distributive `[T] extends [Id<infer N>]` keeps the 8.1.0 return types exactly. `$R/shape/partial-union.ts` exits 0 on these checks:
- `Partial(c ? ids.a : ids.b, …)` is `Tag & Rooted<"a" | "b">`.
- `Partial(ids.userCount, …)` is `Tag & Rooted<"user-count">`.
- `Partial(".items", …)` is `Tag`.
- A mixed `Id | "#b"` is `Tag`. On 8.1.0 this was a compile error, and it now renders correctly.

### Runtime (the only emitted-byte change)

```ts
// src/patterns.ts, Partial
const selector = isId(target) ? target.selector : target as HxTarget;   // was: … : /^[A-Za-z][\w-]*$/.test(target) ? `#${target}` : target
```

`serialize.ts` gains 5 type-only `as string` casts (`:142,146,153,157,158`). `cmp` of every `dist/src/**/*.js`, base against RFC, differs in `patterns.js` only: the removed regex arm and its 5 comment lines. Node byte diff of `Partial` output:

| target | 8.1.0 | RFC |
|---|---|---|
| `"#user-list"`, `".items"`, `"closest tr"`, `"div > p"`, `""`, `ids.userList` | `#user-list`, `.items`, `closest tr`, `div &gt; p`, empty, `#user-list` | identical |
| `"main"` | `#main` | `main` |
| `"user-list"` (JS or cast only; TS rejects it) | `#user-list` | `user-list` |

### Tests and docs

- New `test/types/selector-probe/probe.ts` and `test/selector-errors.test.ts` use the same harness as `test/brand-errors.test.ts`. They hold 6 must-fail and 10 must-pass shapes and assert that exactly 6 fail, each with the hint on the first line (`$R/lib`, 2/2 pass). `test/types/selector-probe` is added to the root tsconfig excludes.
- New pin in `test/patterns.ts`: `Partial("main", Div("x"))` gives `'<template type="partial" hx-target="main" hx-swap="outerMorph" hx><div>x</div></template>'`. The 7 bare-word fixtures move to `"#…"` by the codemod, so their pinned bytes do not change.
- DOM-lib pin: `const t: HxTarget = null! as keyof HTMLElementTagNameMap` compiles with `--lib ES2020,DOM` (`$R/shape/dom-tags.ts`, exit 0). `"window"` and `"user-list"` are `@ts-expect-error`. This keeps the hand list a superset of the platform's tag map.
- REFERENCE.md:28 is reworded (net 0): routes and `ids.x` targets are compile-time checked, and a selector string must be an `Id`, a tag, an htmx keyword or a punctuated CSS selector. The CHANGELOG 9.0.0 entry names the codemod. The `Partial` JSDoc `@param target` reads "an `Id` or an `HxTarget`; a string is passed to htmx verbatim".
- Diff: src +84/-69 over 4 files (`$R/rfc-src.diff`), tests +76/-8 (`$R/rfc-test.diff`). `npx eslint` on the 6 touched files is clean.

## Before → after

Compiled in the scaffold (`$R/app`, TS 6.0.3) by `tsc -p tsconfig.probes.{base,after}.json`, with probes in `$R/app/src/probes`. The hint column gives the line of the error that carries `use ids.x` and the hint's character offset on it.

| Probe | Code | 8.1.0 | RFC |
|---|---|---|---|
| p01 (F-B-309) | `Button("Load").setHtmx(hx(assetUrl("/list"), { target: "team-list", swap: "outerHTML" }))` | 0 errors | TS2322, 1 line, hint at char 133 of 256 |
| p02 | `Partial("team-list", Ul(Li("NEW")))` | 0 | TS2345, 1 line, char 156 of 267 |
| p03 | `teamRoutes.list({ target: "team-list" })` | 0 | TS2322, 1 line, char 136 of 259 |
| p04 | `hx(teamRoutes.invite.resolve(), { method: "post", status: { 422: { target: "invite-form" } } })` | 0 | TS2322, 5 lines, hint on line 5 |
| p05 | `hxResponse(Div("x")).retarget("main-content")` | 0 | TS2345, 1 line, char 147 of 267 |
| p06 | `Button("Load").setHtmx({ ...teamRoutes.list(), target: "team-list" })` | 0 | TS2769, 5 lines, hint on line 3 |
| p07 | `hx(assetUrl("/list"), { target: props.target })`, where `props.target: string` | 0 | TS2322, 1 line, char 131 of 254 |
| p08 | `teamRoutes.list({ include: "filters" })` | 0 | TS2322, 1 line, char 129 of 252 |
| p09 | `hxResponse(Div("x")).location({ path: teamRoutes.list.resolve(), target: "main-content" })` | 0 | TS2322, 1 line, char 122 of 254 |
| p10 | `hx(assetUrl("/x"), { indicator: rowId(n) })`, where `rowId = (n) => \`row-${n}\`` | 0 | TS2322, 1 line, char 137 of 260 |
| g01 | 40 valid call shapes plus an `HxTarget`-typed const and a generic `Id<N>` wrapper (details below) | 0 | 0 |

The g01 shapes are:
- **Selectors and keywords:** `Id`, `"#x"`, `"main"`, `"tbody"`, `"this"`, `"body"`, `"next"`, `"previous div"`, `"closest tr"`, `"find button"`, `"findAll button"`, `"global #x"`, `"[data-row]"`, `"*"`.
- **Template literals:** `` `#row-${n}` ``, `` `${ids.a.selector}, #row-${n}` ``, ternaries.
- **Helpers:** the 6 selector helpers and `Id<N>.selector` in a generic.
- **Bags:** route-level and raw bags with `.selector`.
- **Other sinks:** `Partial(ids.x | "#x" | ".items" | "main" | closest("tr"))` and `retarget(ids.x.selector)`.

**Results.** 10/10 wrong guesses are rejected, against 0/10 before. 8/10 put the fix on line 1. p04 prints TS's elaboration of `Partial<Record<HxStatusKey, …>>` first. p06 is the 2-overload `setHtmx`, and its second overload goes to C-58 (see C-32).

p01, before and after:
```
8.1.0: (no diagnostic)  emits hx-target="team-list"; on beta6 and 4.0.0 the click replaces the button and leaves 2 [id=team-list]
RFC:   src/probes/p01-hx-target.ts(2,65): error TS2322: Type '"team-list"' is not assignable to type 'HxTarget | Id<string> | SelectorHint<"use ids.x for an element id; a bare word is an HTML tag or htmx keyword; type a string variable as HxTarget"> | undefined'.
```

Runtime, RFC lib (`$R/browser-final.txt`; every row has 1 request, and the console count is 0 unless noted):

| Case | emitted | beta6 | 4.0.0 |
|---|---|---|---|
| the fix the error names, `target: ids.teamList` | `#team-list` | list `NEW`, 1 `[id=team-list]`, button kept | same |
| `Partial("main")` into `<main>` | `main` | swapped (8.1.0: missed) | swapped (8.1.0: missed) |
| `Partial("main")` into `<div id="main">` | `main` | not swapped (8.1.0: swapped); the breaking case the codemod covers | same |
| `Partial("#main")` (codemod output) into `<div id="main">` | `#main` | swapped | swapped |
| `Partial(ids.teamList)` | `#team-list` | swapped | swapped |
| F-B-309 guess forced through by JS or a cast | `team-list` | bytes and failure unchanged (1 warning) | same |

## Enforcement

**Layer: type.** It is the strongest feasible layer:
- A lint rule sees literals only, and 3 of the 5 measured cases are values: p07, p10, and everyframe-composer's computed `.join(", ")`.
- A runtime or dev check cannot tell a missed id from a custom element. `<team-list>` is a valid tag name, so a runtime `#` rewrite would break that tag selector.
- Closing the type needs no inference through wrapper calls (§5.4). The rejection is a plain parameter type, and a user wrapper typed `target: string` fails where it calls the sink (the 2 fleet sites below), not silently.

**Verbatim first diagnostic:** the `error_text` above (p01).

**The one-shot fix the message names:**
- `ids.x` in sinks that take an `Id`.
- `ids.x.selector` in the raw, status, header and location sinks, which reject `Id` today (that is C-45's job).
- "type a string variable as HxTarget" for a `string` value.

The hint does not offer `"#x"`. `fluent-html/no-raw-ids` reports `target: "#x"` (`fluent-html-eslint-plugin/src/rules/no-raw-ids.ts:43-50`), so naming it would swap a type error for a lint error, the loop F-B-305 measured.

**Pinned** by `test/selector-errors.test.ts`, which checks the count and the line-1 regex.

## Replaces (converge)

- **The third spelling of an id target.** A bare `"x"` worked as an id only in `Partial`, beside `ids.x` and `"#x"`. Removed with `src/patterns.ts:86-93`.
- **The `string` arm of `HxTarget`,** and the untyped `string` on `select`, `include`, `indicator`, `disable`, status, location, `retarget` and `reselect`. L-063 closes on its "drop the string arm" option, and REFERENCE.md:28 is reworded to the claim the type now backs.
- **The dead `window` and `document` target members** (F-A-109). C-09 (8.2.0) stops advertising them while the open tail still admits them. This RFC removes them for `HxTarget`, so C-30 does not need to carry that row.
- **Not replaced here:** the `id()` helper (0 call sites in 8.x; a C-32 prune call) and `ids.x.selector` in raw sinks (C-45).
- **Guidelines:** a grep for a bare-word target or a string `Partial(` across `guidelines/web-development/*.md` and `fluent-html/CLAUDE.md` finds 0 lines. Every example already uses `ids.x` (for instance `htmx.md:270-273`), so nothing to delete exists, and nothing new is taught because the error names the fix. `prose_deleted: []`, `guideline_delta: 0`.

## Lane & migration

**9.0.0.** The change has three breaks:
1. A value typed `string` no longer flows into a selector sink. That is 5 new errors in 2 of 15 live repos.
2. `Partial("<tag name>")` now emits the tag selector instead of `#<tag name>`. That is a byte change in a case that works on 8.1.0 when the page has `<div id="main">` (row above).
3. A bare id-like word in `Partial` stops compiling.

Because of breaks 1 and 2, the change cannot go in 8.1.x or 8.2.0.

**Measured breakage.** `tsc` with `paths` mapped to `$R/dist-base`, then to `$R/dist-after` (`$R/fleet/summary-final.txt`):
- **Clean:** the template scaffold (0 → 0), packages/ui (0 → 0), and 13 of the 15 live repos.
- **Pre-existing errors only:** templates/full-stack in place (154 → 154, 0 new), templates/web (16 → 16, 0 new), and workshop-toni (3 → 3, 0 new).
- **New errors:** everyframe-composer `src/app/studio/views/studio.voice.view.ts:326` (`disable: VOICE_CONTROLS`, a computed `.join(", ")`, 1 error). gzs/stem-50 `src/shared/ui/search.ts:6` (`type ListRoute = (options?: { include?: string; … }) => PageRoute`, 4 errors in 4 views).

**Codemod** (`scripts/codemod/bare-selector.ts`, in the 9.0.0 bundled migration; prototype `$R/codemod/bare-selector.mjs`):
- **Map:** `Partial("<bare word>", …)` becomes `Partial("#<bare word>", …)` when the word is not an htmx keyword. The bytes stay identical to 8.x, tag names included. A keyword target such as `Partial("body")` is reported rather than rewritten, because 8.x emitted `#body`.
- **Receiver check:** the callee symbol, followed through import aliases, must resolve to `Partial` declared in fluent-html's `patterns` module. This catches `Partial as HxPartial` and ignores TypeScript's `Partial<T>`. For bag literals, the contextual type's property must be declared in fluent-html's `htmx`, `routes` or `patterns` module. A first version without that check falsely reported 9 `target:` keys in behavior specs and esbuild config.
- **Reported, never rewritten:**
  - a bare non-keyword, non-tag literal in another htmx sink;
  - a `Partial` target typed `string`;
  - every post-upgrade diagnostic that carries the hint.

**Dry run:**
- **lib:** 8/8 rewritten (`test/patterns.ts:168,190,196,207,213,214,229`, `test/types/type-surface.test-d.ts:645`). Build: 0 errors. Node tests: 2159/2159 base → 2160/2160 after (+1 new pin), plus `selector-errors` 2/2.
- **projects-template scaffold:** 163 files, 2 `Partial` calls, 13 htmx selector literals. 0 rewrites, 0 skips.
- **15 live repos:** 5,265 files, 37 `Partial` calls, 248 htmx selector literals. 0 rewrites, 2 skips (5 diagnostics), listed above.

**Manual fixes for the 2 skips**, verified in scratch copies (`$R/fix`, tsc 0 errors each), 2 lines each:
- everyframe-composer: `.join(", ")` becomes `.join(", ") as HxTarget`, plus `type HxTarget` in the import.
- gzs/stem-50: `include?: string` becomes `include?: HxTarget`, plus the import.

No alias type (no `LooseHxTarget`) and no shim.

## Guardrail check (§5, 1-13)

1. **Zero runtime dependencies:** pass. The change is types plus one deleted regex arm.
2. **Hot path:** pass. Render-path JS is byte-identical; only `patterns.js` differs. `bench/render.js`, 3 alternating runs, median ms/op base vs RFC: flat 0.1218 / 0.1234, HTMX attributes 0.0283 / 0.0280, realistic 0.0313 / 0.0313, build+render 0.0625 / 0.0639 (noise). `Partial` micro-bench (`$R/bench-partial.mjs`, 3 Partials per render): 1733 vs 1743 ns median.
3. **Escape by default:** pass. Selectors still go through `escapeAttr` (`serialize.ts:142-158`).
4. **Type-safety:** pass. This closes an open union (L-063). The rejection depends on no inference through generic wrapper calls, and `Partial`'s `const T` only computes the `Rooted<N>` that the `const N` overload already inferred.
5. **Instruction set:** pass. The sinks are lib types, and neither the template nor ui needs work.
6. **Pure core:** pass.
7. **Converge:** pass. One id spelling is removed and nothing is added.
8. **Naming:** N/A. No new method.
9. **Class-string contract:** N/A.
10. **Runtime grammar:** pass. Every keyword and prefix in the union is read by both bundles, no htmx name is added, and the 28 Playwright rows are above.
11. **Breaking is codemod-first:** pass. Measured dry run, 2 skips reported, no aliases.
12. **Enforcement over prose:** pass. Type layer, 0 guideline lines added.
13. **Append-only styling:** N/A.

## Scorecard prediction

- **silent-failure +0.5:** the hx() miss that swaps out its own trigger and duplicates an id can no longer be written in TypeScript, and `Partial("main")` reaches `<main>`. Live reach is 0 sites, so the gain is capped.
- **error-quality +0.5:** 8 of 10 wrong guesses name the fix on line 1, against 0 of 10 that error at all today.
- **decision-closure +0.5:** one meaning across Partial, hx(), route options, raw and status bags, headers and HX-Location; one id spelling removed; L-063 closed.
- **prior-alignment +0.25:** a bare word now means what CSS and htmx say it means in every sink, the prior an agent brings from the htmx docs.

## Alternatives considered

- **Apply Partial's `#` in `resolveSelector` for every sink (runtime, 8.1.x).** Rejected:
  - It changes working bytes: `target: "main"` swaps `<main>` on 2/2 bundles today.
  - Exempting tag names needs a runtime tag table.
  - It makes the bare word a sanctioned third id spelling (§5.7) and breaks custom-element tag selectors.
  - It leaves L-063 open, and runtime is weaker than type.
- **Generic literal checks (`hx<const O>`, `Partial<const S>`) keeping the `string` arm (8.2.0).** Rejected:
  - p07 and p10 (`string` values) still compile.
  - The `HTMX` interface and status bags cannot carry a call-site generic.
  - `Partial` would keep its rewrite, so 8.x would still have two meanings.
- **Reword the claim only (L-063's free option).** Rejected: it fixes the docs, not the failure.
- **An 8.x dev-throw bridge for hx() sinks.** Rejected: 0 live 8.x sites write a bare id-like word (census), and 9.0.0 would delete it.
- **Reject every bare word, tag names included.** Rejected:
  - Tag selectors are CSS.
  - The corpus writes 52 `main` and 341 `body`.
  - A tag would need a second, escaped spelling.

## Open questions (for curation)

1. **Raw-sink hint wording.** Raw, status, header and location sinks get a hint naming `ids.x.selector` because they reject `Id` today. If C-45 (deferred; widens those sinks to `Id`) joins 9.0.0, the two messages collapse into the `ids.x` one.
2. **Custom-element tag selectors** now need punctuation (`":is(team-list)"`). Fleet sites: 0. Adding a `${string}-${string}` arm would readmit the F-B-309 guess itself, so the recommendation is to accept this.
3. **Hint placement in p04 and p06.** p04 (status bag) shows the hint on line 5 and p06 (raw `setHtmx` bag) on line 3. Removing the `setHtmx(endpoint, opts)` overload (C-32/C-58) lifts p06 to line 1. p04 needs a status-bag-specific hint, if wanted.
4. **Ordering with C-09 and C-95.** C-09 (8.2.0 keyword literals): this RFC's keyword list is the pinned bundle's, and if C-09 lands first, this RFC reuses its list. C-95 (Partial overload split by swap style): `Partial` is now one conditional signature, and C-95 can add the swap parameter to that conditional.
