---
rfc: RFC-B-08
lens: type-safety
verdict: survives-with-changes
confidence: 0.83
killer_objection: "Deferred()'s route param is typed `{ method: \"GET\" }` (uppercase) but every route ref from defineRoutes carries `method: \"get\"` (lowercase HxHttpMethod) — so NO real route ref typechecks; the GET-only guard rejects all valid routes, the worked examples don't compile, and the RFC's headline 'route-ref-typed, GET-only' type-safety claim is false."
required_changes:
  - "Fix Deferred() casing: type `route: { method: \"get\"; resolve: ... }` (lowercase) to match `HxHttpMethod = \"get\"|\"post\"|...` (src/htmx.ts:10). As written, `\"GET\"` is unassignable from any defineRoutes ref and every worked example fails to compile."
  - "Fix retarget/reselect types: change `retarget?: HxTarget` / `reselect?: HxTarget` to `retarget?: HxTarget | Id` / `reselect?: HxTarget | Id`. `HxTarget` is `StandardCSSSelector | ExtendedCSSSelector` and does NOT include `Id` (src/htmx.ts:82). The worked example `{ retarget: layoutIds.mainContent }` (RFC lines 146, 194) does not compile against `HxTarget`; mirror the existing `RouteHxOptions` (src/routes.ts:105-106) which uses `HxTarget | Id`."
  - "Drop the false 'silent-typo killed' claim for retarget/reselect, or constrain it. `StandardCSSSelector = string` (src/htmx.ts:80) — retarget/reselect accept ANY string including a typo'd or wrong selector. Only `reswap: HxSwap` is genuinely literal-union-protected. The §11.4 'no bare string' pass is false for two of the four header options."
  - "Fix the `trigger` 'mirrors the existing overload' claim. `hxResponse().trigger(event: string, detail?: Record<string,unknown>)` (src/patterns.ts:202) is a TWO-ARG method producing `{[event]: detail}`; `RenderViewOptions.trigger: string | Record<string,unknown>` is a single union that JSON.stringifies a bare Record as a raw HX-Trigger event-map. These are different shapes with different wire semantics — either reconcile them or delete the 'mirrors' sentence and document the JSON-event-map form explicitly."
  - "Constrain `Deferred`'s route param to also forbid params-requiring routes, or accept the resolve signature for both. The param type assumes `resolve: (query?: QueryParams) => string`, but param routes have `resolve: (params, query?) => string` (src/routes.ts:132-134). Passing a `/:id` GET route ref would mismatch the resolve arity — decide and type whether deferred fragments may be param routes."
---

# Verdict: RFC-B-08 — type-safety lens

> ADVERSARY. Goal: kill RFC-B-08 through the type-safety failure mode. Default reject under uncertainty.

## Attack

I grounded every type claim against the actual source. The RFC's entire pitch is "the typed union exists but is unreachable — we make it reachable." But three of its four typed surfaces are mistyped against the real definitions, so the "typed" path it sells is partly a fiction. A wrong call compiles, and a right call sometimes doesn't.

- **type-safety failure mode 1 — the GET-only guard inverts (killer).** `Deferred()` types its route as `{ method: "GET"; resolve }`. The library's method union is **lowercase**: `HxHttpMethod = "get" | "post" | "put" | "patch" | "delete"` (src/htmx.ts:10), and a route ref's `method` is `Def['method']` (src/routes.ts:130), i.e. `"get"`. `"get"` is **not assignable to `"GET"`**. Consequence: the documented call `Deferred(dashboardRoutes.stats, Skeleton())` (RFC line 183, 278, 282) **does not compile** — and neither does the "✗ POST not loadable" example, because nothing reaches the method discrimination. The RFC's marquee type-safety bullet ("`Deferred` is route-ref-typed, GET-only … passing a POST route is a compile error", lines 195) is exactly backwards: it's a compile error for *every* route. This is the killer: the central new primitive's type contract is unusable as written.

- **type-safety failure mode 2 — `HxTarget` does not accept `Id`; the flagship example fails.** The RFC types `retarget?: HxTarget` and asserts "**`HxTarget` accepts `Id` directly** … `retarget: layoutIds.mainContent` — no `.selector` access" (lines 52, 73, 146, 194). But `HxTarget = StandardCSSSelector | ExtendedCSSSelector` (src/htmx.ts:82), where `StandardCSSSelector = string` (src/htmx.ts:80). `Id` is a **branded interface** (`src/ids.ts:23`, with a `unique symbol` brand) — it is an object, not a string, so it is **not** assignable to `HxTarget`. The codebase already solved this in `RouteHxOptions` by writing `target?: HxTarget | Id` (src/routes.ts:105-106); RFC-B-08 forgot the `| Id`. So the pps worked example (line 146) does not compile, and the supposed "pass the Id, not Id.selector" ergonomic is unavailable.

- **type-safety failure mode 3 — retarget/reselect have NO typo protection, contradicting the RFC's thesis.** Because `StandardCSSSelector = string`, `retarget`/`reselect` accept any string at all: a misspelled selector, a swap-style string, garbage. The RFC's §11.4 self-check claims "`HxTarget`/`Id` for retarget … no bare `string`/`any`" (line 294) — but `HxTarget` *is* bare `string` for the standard-selector arm. The only header that genuinely benefits from the "literal union over bare string" story (§11.4) is `reswap: HxSwap`. The RFC oversells half its surface.

- **type-safety failure mode 4 — `trigger` "mirrors the existing overload" is false and semantically lossy.** `hxResponse().trigger(event, detail?)` (src/patterns.ts:202) is a two-argument method that builds `{[event]: detail}`. `RenderViewOptions.trigger: string | Record<string, unknown>` (line 53) is a single union whose Record arm is `JSON.stringify`'d straight into `HX-Trigger` (line 75) — i.e. the caller must hand-build the event-map shape `{ eventName: detailObj }`. The two are not the same contract; a dev who reasons "it mirrors `.trigger()`" will pass `{ field: "email" }` expecting an event named "email"-detail and instead emit an event literally named `field`. A bare `Record` is the classic "any-shaped bag" — no key is constrained to an event name, so a wrong call compiles and fires the wrong client event.

- **type-safety failure mode 5 — `Deferred` resolve arity ignores param routes.** The route param assumes `resolve: (query?: QueryParams) => string`, but param routes (`/:id`) have `resolve: (params, query?) => string` (src/routes.ts:132-134). The RFC never says deferred fragments must be paramless; a `/:id` GET ref both has the wrong `method` casing AND a wider resolve signature. Undertyped either way.

## Does it survive?

The *intent* is sound and additive, and the core mechanism (a synchronous header-writing opts bag + an htmx-native deferred slot) is implementable with correct types — every defect above is a fixable mistyping, not a design dead-end. Under the quorum rule a fixable-but-currently-broken type contract is `survives-with-changes`, not `reject`: the changes are mechanical and fold straight back into the RFC. But they are **mandatory** — as written, the primary new primitive (`Deferred`) and the flagship ergonomic (`retarget: Id`) do not compile, and two of the RFC's four §11.4 type-safety claims are false. Confidence is high on the defects (verified against source line-by-line); the residual uncertainty is only whether the authors intended param routes for deferred slots.

Verdict: **survives-with-changes**, contingent on all five required changes. Without change #1 and #2 the RFC ships an API whose own worked examples fail `tsc`.

## Guardrail check (§11.4 type-safety — this lens owns it)

§11.4 is **not** currently satisfied as the RFC claims (line 294). `reswap` passes (real `HxSwap` union). `retarget`/`reselect` FAIL ("no bare string" is violated — they are `string`, and they reject the `Id` the examples pass). `Deferred`'s route guard FAILS (casing makes it unusable). `trigger`'s "typed mirror" claim is false. After the five required changes, §11.4 passes: `reswap: HxSwap`, `retarget/reselect: HxTarget | Id`, `route: { method: "get"; ... }`, and an honest `trigger` contract restore the invariant. Until then, the guardrail check in the RFC frontmatter (`type-safety: pass`) must be downgraded.
