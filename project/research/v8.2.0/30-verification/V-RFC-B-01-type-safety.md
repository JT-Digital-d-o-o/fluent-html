---
rfc: RFC-B-01
lens: type-safety
verdict: survives-with-changes
confidence: 0.75
killer_objection: "The hint member is not closed, and on stance errors it names the wrong fix. In 18 of the 21 stance-violation errors, line 1 now reads '.X takes a route callable result ... not a URL string', but each of those callers already passed one. In 6 of the 21, the expected target id no longer appears on line 1. The key reported as 'missing' can be filled by any never-typed value: { ...vRoutes.list(), [KEY]: null! } compiles into .nav and .fragment. This can be answered: DeclaresNothing and bare-HTMX laundering have the same exposure on 8.1.0, and rewording the key fixes the misdirection."
guardrail_killer: null
required_changes:
  - "Reword NotARoute per verb so it is also true for stance errors. State the stance the verb accepts: page verbs take a route whose def declares render \"page\" or nothing; .fragment and targeted .search take a route whose def declares render: the target's id; .poll takes any fragment id; .fire takes any route. Keep 'not a URL string, .resolve() or an uncalled route'. Add one line-1 pin for a stance error (a fragment route into .nav, and an undeclared route into .fragment) next to the 3 raw-route pins in define-controller-compile.test.ts."
  - "Correct the closure claims ('the hint member is unsatisfiable'; Guardrail check item 4 'the member accepts no value'). The member accepts any never-typed value under the verbatim key, which is the same exposure DeclaresNothing has on 8.1.0."
  - "Lib gate: `if (htmx) assertRequestBag(...)` instead of `htmx !== undefined`, mirroring serialize.ts:262 `if (thx)`. On 8.1.0 a null or false bag clears; the RFC turns null into an unnamed TypeError. Add a test."
  - "Lib gate: compare the method case-insensitively (or test only typeof method === 'string'). On 8.1.0, { method: 'GET' } renders hx-GET, which sends GET /team in both pinned bundles. Add a test row."
  - "Lib gate: single-source HX_METHODS from HxHttpMethod (Record<HxHttpMethod, true> plus Object.hasOwn) instead of an untyped Set."
  - "Pin the green generic-wrapper forms (Refresh<N> with NoInfer, Poller<N>, NavG<R extends PageRoute>, FireG<R extends HTMX>) as a compile fixture in the template tests."
executed:
  - cmd: "tsc --noEmit -p tsconfig.v3.json, swapping in orig and RFC (D) swap-verbs.ts (TS 6.0.3, fluent-html 8.1.0 pack)"
    output: "orig: 2 errors (never-key TS2353 x2). RFC: exit 0. 21/21 wrong-guess and 21/21 stance @ts-expect-error lines are still used; 18 valid calls, 8 generic wrappers and 8 wrapper uses compile."
  - cmd: "same suite on TS 5.9.3 (buzzin/node_modules/typescript)"
    output: "exit 0; the naked-probe output is byte-identical to 6.0.3"
  - cmd: "naked probes (directives stripped), orig vs RFC, node cmp.mjs"
    output: "42 errors before and after, same locations. Raw-route fix on line 1: 19/20. Stance errors with the hint on line 1: 18/21. Expected id dropped from line 1: 6/21. The BadPageG<R> tail names the hint key as the missing property."
  - cmd: "never-key / dn-key / launder probes + eslint --max-warnings=0"
    output: "{...vRoutes.list(), [K]: null!} into .nav: TS2353 on orig, 0 errors on RFC, eslint 0. DeclaresNothing key filled with null! on orig: 0 errors. A bare HTMX local into .nav/.submit/.tab: 0 errors on both."
  - cmd: "tsc --emitDeclarationOnly (exported getNav/getFrag, a union-of-methods call, Parameters<Tag['nav']>)"
    output: "exit 0; d.ts prints the resolved key literal, with no TS4xxx"
  - cmd: "NODE_ENV=test node null-probe.mjs (8.1.0 dist vs RFC lib dist)"
    output: "8.1.0: null and false clear, GET -> hx-GET. RFC: null -> TypeError, false and GET -> named throw"
  - cmd: "node upper-oracle.mjs (Chromium, htmx.org 4.0.0-beta6 and template htmx.min.js)"
    output: "hx-GET=\"/team\" -> 1 request, GET /team, in both bundles"
  - cmd: "tsc --strict drift/drift.ts (HxHttpMethod + 'query')"
    output: "Set compiles silently; Record<HxHttpMethod, true> -> TS2741 Property 'query' is missing"
  - cmd: "grep over 6,267 fluent-html-importing fleet files"
    output: "0 null or cast setHtmx sites; 0 uppercase methods in HTMX bags"
---

# Verdict: RFC-B-01, type-safety lens

`$W` = `<scratch>/wave3/RFC-B-01-type-safety`. `$W/app` is a fresh copy of the Wave-0 teamapp scaffold (fluent-html 8.1.0 pack, TypeScript 6.0.3). `verbs.orig.ts` matches `projects-template/templates/full-stack/src/core/htmx/swap-verbs.ts` byte for byte. `verbs.D.ts` is the RFC's final shape (`$R/swap-verbs.D.ts`).

## What I executed

**1. Probe fixtures in the `test/types/type-surface.test-d.ts` style, with `@ts-expect-error` checked in both directions** (`$W/app/src/v3/*.test-d.ts`, `tsc --noEmit -p tsconfig.v3.json`):

| Fixture | Content | 8.1.0 verbs | RFC verbs |
|---|---|---|---|
| `both-ways` | 21 wrong guesses under `@ts-expect-error`: literal, `string` variable, template literal, `.resolve()`, `.path`, uncalled callable (with and without params), across all 8 verbs plus `{ endpoint }`. 18 valid direct calls (incl. `{ invalid }`, `hx(assetUrl())`, `c ? index() : page()`, `delete`). 8 generic wrappers plus their 8 uses | 0 errors | 0 errors |
| `stance-holes` | 21 stance violations under `@ts-expect-error`: a fragment or `none` route into each page verb, undeclared/page/wrong-id/laundered routes into `.fragment`/`.poll`/targeted `.search`, an inner swap, 3 generic forwarders, 2 index-signature attempts on the new key | 0 errors | 0 errors (0 TS2578: no hole) |
| `method-union` | `A("x")[v](route)` with `v: "nav" \| "submit" \| "tab"`, `.bind` to `(r: PageRoute) => Tag`, `Parameters<Tag["nav"]>[0]`, exported inferred `t => t.nav` / `t => t.fragment` | 0 errors | 0 errors; `--emitDeclarationOnly` exit 0, and the d.ts prints the resolved key literal |
| `never-key` | `A("x").nav({ ...vRoutes.list(), [K]: null! })`, `.fragment(id, { ...vRoutes.index(), [KF]: null! })` | TS2353 x2 | **0 errors** |
| `dn-key` (precedent) | DeclaresNothing key filled with `null!` into `.fragment` and `.poll` | **0 errors** | 0 errors |
| `launder` (precedent) | `const r: HTMX = vRoutes.list(); A().nav(r)`, plus `.submit` and `.tab` | 0 errors | 0 errors |

The same RFC suite on TypeScript 5.9.3 gives exit 0, and the naked output is byte-identical to 6.0.3.

**2. Error text, before and after.** I stripped the directives (`src/v3n`) and compared with `node $W/cmp.mjs`. There are 42 errors at the same 42 locations in both runs (0 removed, 0 added).
- **Raw-route guesses:**
  - The fix is on line 1 in 19 of 20 cases, e.g. `Argument of type 'string' is not assignable to parameter of type 'PageRoute | (HTMX & { readonly ".nav takes a route callable result such as routes.x() from defineRoutes, not a URL string, .resolve() or an uncalled route": never; })'.`
  - `.fire` prints `'HTMX | (HTMX & { … })'` with no union reduction.
  - The targeted `.search(id, "/v/list")` is TS2769, with the fix on line 2.
- **Stance errors:**
  - Line 1 now carries the hint in 18 of 21 cases. Every one of those arguments is already a route callable result, so the sentence names a fix the caller already applied.
  - In 6 of 21 (the fragment family), the expected target id is no longer on line 1. Example: wrong id into `.fragment`. Before, line 1 read `'HTMX & { readonly render?: Id<"v-list"> … }'`. After, it reads `'(HTMX & { readonly ".fragment takes a route callable result …": never; }) | (HTMX & ... 1 more ... & { ...; })'`.
  - The elaboration that names the stance survives in 16 of 21.
  - In the generic forwarder `BadPageG<R extends RenderTagged<Id<"v-list">>>`, the last two lines become `Property '".nav takes a route callable result …"' is missing in type 'RenderTagged<Id<"v-list">>'`. The error tells the reader to add the hint key.

**3. Dev gate** (`NODE_ENV=test node $W/null-probe.mjs`, 8.1.0 dist vs `$R/lib/dist`):

| Bag | 8.1.0 | RFC |
|---|---|---|
| `setHtmx(null)` | `<a>x</a>` (clears) | `TypeError: Cannot read properties of null (reading 'endpoint')` |
| `setHtmx(false)` | `<a>x</a>` | named throw |
| `{ method: "GET", endpoint: "/x" }` | `<a hx-GET="/x">` | named throw |

Pinned-bundle oracle (`node $W/upper-oracle.mjs`): `<a hx-GET="/team">` is parsed as `hx-get` and sends **1 request, `GET /team`, in both** htmx.org 4.0.0-beta6 and the template's `htmx.min.js`.

**4. Method-list drift** (`drift/drift.ts`, `HxHttpMethod` widened with `"query"`). The RFC's `new Set([...])` compiles silently. A `Record<HxHttpMethod, true>` gives `TS2741 Property 'query' is missing`.

**5. Fleet census** over 6,267 fluent-html-importing files: 0 `setHtmx(null` or `as unknown as HTMX` sites, and 0 uppercase methods in HTMX bags.

## Attack

- **Soundness: the attack fails.** The union `PageRoute | (HTMX & { readonly [K in NotARoute<V>]: never })` rejects every wrong guess (21/21) and every stance violation (21/21, including the generic forwarders). It compiles every valid call and the 8 generic wrappers without inference through the wrapper, which is what guardrail 4 requires. It emits declarations cleanly and behaves identically on TS 5.9.3 and 6.0.3. I found no consumer break on the type side.
- **The member is not closed, contrary to the RFC.** A never-typed expression (`null!`) fills the key, so a fragment route reaches `.nav` and an undeclared route reaches `.fragment`. Both are TS2353 on 8.1.0, and eslint reports 0 findings. This is not a new class of hole: DeclaresNothing admits the same `null!` fill on 8.1.0, and the page verbs already accept a bare `HTMX` local. The RFC's "accepts no value" claim is still false and has to be corrected.
- **The key misdirects on the other error class on the same parameter.** The RFC counts this as a cost ("+1 line, +85 to +162 chars"), but the line-1 sentence is wrong for 18/21 stance errors, and in 6/21 it displaces the expected id. In the generic-forwarder case, TS ends the error by naming the hint key as the missing property. Together with the `null!` fill above, that is a path from the error text straight into laundering. This weakens the error-quality +1 claim, and rewording the key fixes it.
- **The dev gate is narrower than claimed.** The RFC says bytes change only for bags that never sent a request, but `{ method: "GET" }` sends `GET /team` in both pinned bundles and the gate throws on it. `setHtmx(null)` is a working clear on 8.1.0, and the gate crashes it with an unnamed TypeError. Fleet incidence is 0 (the fleet is typed), so this is a fix, not a kill. The method list is also a hand copy of `HxHttpMethod` that would drift silently.

## Does it survive?

**survives-with-changes.** The type mechanism is sound and lane-safe for 8.1.x: no valid call changes and no stance hole opens (all measured above). The changes:

1. Reword `NotARoute` per verb to state the stance it accepts, so that line 1 is true for both raw-route and stance errors. Add a line-1 pin for one stance error next to the 3 raw pins.
2. Correct the "unsatisfiable / accepts no value" claims. The member accepts only a never-typed value under the verbatim key, which is the DeclaresNothing exposure.
3. Gate with `if (htmx)`, mirroring `serialize.ts:262`, not `!== undefined`, and add a null-clears test.
4. Compare the method case-insensitively (keeps the injection closure, accepts the working `hx-GET`), and add a test row.
5. Single-source the method set as `Record<HxHttpMethod, true>`.
6. Pin the green generic-wrapper forms (`Refresh<N>`, `Poller<N>`, `NavG<R>`, `FireG<R>`) as a template compile fixture. They are the reason this design beat the conditional gate, and today they are proven only in scratch.

## Guardrail check (if this lens owns one)

- **Guardrail 4 (type-safety): pass, with a corrected claim.** The mechanism does not depend on inference through generic wrapper calls (8 wrappers compile, and 3 generic forwarders stay rejected). Brands are intact (`.resolve()` and `{ endpoint: "/v" }` are still rejected). The new member is not literally closed: it accepts a `never` value under a 120-char key, the same as the DeclaresNothing precedent. That is an accuracy fix in the RFC text, not a killer.
- **Lane 8.1.x: pass after changes 3 and 4.** As written, the dev gate throws in dev on 2 bag shapes that work on 8.1.0 (null clear, uppercase method). The fleet has 0 such sites, and production is unchanged.
