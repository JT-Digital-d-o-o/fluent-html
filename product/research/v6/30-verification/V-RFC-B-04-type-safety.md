---
rfc: RFC-B-04
lens: type-safety
verdict: survives-with-changes
confidence: 0.74
killer_objection: "The headline type-safety claim — `NavItem.route: () => HTMX` single-sources htmx through defineRoutes — is false. A param-bearing route ref is `(params, options?) => HTMX`, which is NOT assignable to `() => HTMX`, so the type forces a wrapper thunk; the RFC's own example fills that thunk with `hx(item.href)` — a bare string URL, exactly the stringly selector the API claims to eliminate. The type does not prevent the misuse it advertises preventing."
required_changes:
  - "Fix NavItem.route typing: accept the actual defineRoutes ref union — `route: HTMX | ((opts?: RouteHxOptions) => HTMX)` — NOT `() => HTMX`. A `() => HTMX` thunk is the wrong shape: param routes (`(params, options?) => HTMX`) are not assignable to it, and the only values that ARE assignable are zero-arg/options-arg closures whose body the RFC fills with raw `hx(string)`. Take the resolved `HTMX` value (caller writes `route: rideRoutes.detail({ id })`) so the param/no-param distinction is the caller's, single-sourced through the ref. Remove the `hx(item.href)` worked example or mark it as the explicit escape hatch, not the taught path."
  - "Replace `LoadingBarProps.color?: string` with a literal union of the project's color tokens (or at minimum `ColorToken` / the same type `.background()` accepts). `color` defaults to `\"primary\"` (a Tailwind token) but `string` lets `color: \"bg-red-500 oops\"` or any typo compile and reach the class string. This is the §11.4 'no bare string where a literal union fits' violation the Type-safety story claims is absent."
  - "Constrain `OpenGraph.image` / `OpenGraph.url` / `siteName` semantics or document the brand: the Type-safety story claims `og` object access prevents `setProperty(\"og:imagee\")` typos, but `image`/`url` are bare `string` with no absolute-URL guarantee — Open question 3 (absolute vs baseUrl) is unresolved, so a root-relative `image` compiles and silently produces a non-resolvable OG tag. Either brand as `AbsoluteUrl` or state the runtime contract; do not advertise it as type-checked."
  - "Tie `Shell<Ctx>`'s generic to a real source. As written `Ctx` appears only in `chrome?: (ctx: Ctx) => View` — it is uninferrable (defaults to `unknown`) and decorative: nothing connects `Shell<AppCtx>` to the `LayoutCtx` actually read inside `chrome`, so a `Shell<AppCtx>` whose chrome reads an unrelated context type-checks. Either drop the generic (have `chrome` close over the context directly: `chrome?: () => View`) or thread the context object: `Shell<Ctx>(props & { context: Context<Ctx> })` so `ctx` is supplied from the named context, not a phantom type param."
  - "Justify or remove `og: OpenGraph | boolean`. The `boolean` arm erodes inference: `og: someRuntimeBool` compiles when an object was intended, and `og: true` vs `og: {}` have silently different output. Prefer `og?: OpenGraph` with a separate `og: true` only via a distinct literal (`og?: OpenGraph | true`), or document why the `false` default needs the `boolean` widening over plain `og?: OpenGraph`."
---

# Verdict: RFC-B-04 — type-safety lens

> ADVERSARY. Killing RFC-B-04 through the type-safety lens. Default to reject under uncertainty.

## Attack

### Failure mode 1 (KILLER) — `NavItem.route: () => HTMX` does not single-source, and the type proves it

The RFC's central type-safety claim:

> **`NavItem.route: () => HTMX` + `target: Id`** — the htmx wiring is single-sourced through `defineRoutes`/`defineIds`; no hardcoded URL or selector string reaches a nav item.

I read the real `defineRoutes` return type (`src/routes.ts:145-150`). A route callable is:

```ts
type RouteCallable<Def> =
  HasParams<Def['path']> extends true
    ? ((params, options?: RouteHxOptions) => HTMX) & RouteProperties<Def>   // param routes
    : ((options?: RouteHxOptions) => HTMX) & RouteProperties<Def>;          // no-param routes
```

Now check assignability to the RFC's `route: () => HTMX`:

- A **param route** is `(params, options?) => HTMX`. This is **not assignable** to `() => HTMX` — TS rejects a function that *requires* a first argument where a zero-arg signature is expected. So you literally cannot write `route: rideRoutes.detail`. You are forced to wrap: `route: () => rideRoutes.detail({ id })`.
- A **no-param route** is `(options?) => HTMX`, which *is* assignable to `() => HTMX` (fewer params is fine) — but then the `options?` (target/swap/pushUrl) are dropped on the floor, contradicting the doc comment "wires `.setHtmx({ target, swap, pushUrl })`."

So the `() => HTMX` thunk is the wrong shape on both arms. And here is the kill: because the type *forces* a thunk, the RFC's own worked example (line 229) fills it with

```ts
route: () => hx(item.href),          // ← item.href is a bare string URL
```

`item.href` is exactly the hardcoded URL the API claims "no hardcoded URL … reaches a nav item." The type signature, far from preventing the stringly path, **funnels the author straight into it** — a `() => HTMX` thunk is most naturally satisfied by `() => hx(someString)`. A wrong call (raw URL) compiles green. The advertised invariant is unenforced by the type; it is enforced only by author discipline, which is precisely what the type was supposed to replace.

### Failure mode 2 — `LoadingBarProps.color?: string` is the textbook §11.4 violation

```ts
type LoadingBarProps = { id: Id; color?: string };  // color default "primary"
```

`color` defaults to `"primary"` — a Tailwind color *token*. The library's own fluent surface (`.background(token)`) takes a constrained token type. Here `color: string` accepts `"primaryy"`, `"bg-red-500"`, `""`, or any garbage, and it flows into a class string. The Type-safety story explicitly asserts "no bare `string` where a union fits." `color` is a bare string where the color-token union fits. Self-contradiction.

### Failure mode 3 — `Shell<Ctx>` generic is phantom / uninferrable

`Ctx` is used in exactly one position: `chrome?: (ctx: Ctx) => View`. There is no argument of type `Ctx` to infer from and no link to the context that's actually read. Consequences:

- `Shell({ title, body, chrome: c => ... })` infers `Ctx = unknown`; `c` is `unknown`; reading `c.user` errors — so callers must hand-write `Shell<AppCtx>`, and nothing checks that `AppCtx` matches the `LayoutCtx` they `.scope()`'d. A `Shell<AppCtx>` whose `chrome` reads an unrelated `OtherCtx.current` compiles. The generic decorates; it does not bind.
- The worked example (line 273) writes `Shell<AppCtx>({...})` *and* `chrome: ctx => SidebarNav(...navItems(ctx))` — but `ctx` here is a fresh parameter the RFC never says who passes. `Shell` would have to read `LayoutCtx.current` internally and feed it to `chrome`, yet `Shell` has no reference to `LayoutCtx` (it's a user module symbol). The data path is undefined and the type cannot describe it.

### Failure mode 4 — `og: OpenGraph | boolean` weakens inference; `image`/`url` bare strings

The `boolean` arm means `og: anyRuntimeBoolean` type-checks where an object was meant, and the Type-safety story's boast that `og` "is fully typed (no stringly `setProperty('og:imagee')` typos)" only holds for the object arm — but `image`/`url` themselves are unbranded `string` with an unresolved absolute-vs-relative contract (Open question 3). A root-relative image compiles and emits a broken OG tag at runtime. Type-checked in name only.

### What survives the attack

- `LayoutVariant` and `ContainerSize` *are* genuine literal unions — `variant: "sidebar"` and `size: "8xl"` are real compile errors. Claim 1 of the Type-safety story holds.
- `Container`'s overload discrimination (options object vs first child) is sound given `View = Tag | string | RawString | View[]` (`src/core/types.ts:6`): a plain `ContainerOptions` object is structurally neither `Tag` nor `string` nor array, so the overloads don't collide. OK.
- `target: Id` is correctly branded (`src/ids.ts:23-32`, `__idBrand`) — that half of NavItem's single-sourcing is real. It's the `route` half that fails.
- `createLayoutContext<T>` as a `createRequiredContext` alias is type-sound (runtime-throws on missing scope, `current: T` is non-null) — adds no safety but breaks none.

## Does it survive?

**survives-with-changes.** None of the four defects is a guardrail-fatal XSS/correctness break; they are type-safety regressions against the RFC's *own stated* §11.4 claims. The architecture (literal unions for variant/size, branded `target: Id`, overload-discriminated `Container`) is fundamentally typeable. But the RFC currently *overclaims* — its "Type-safety story" and §11.4 self-check both assert "pass / no bare string / no any," while `route`, `color`, `og.image`, and the `Shell` generic each falsify that. The fixes are local and fold back cleanly:

1. `route` → take `HTMX` (or the real ref union), kill the `hx(string)` example.
2. `color` → color-token union.
3. `og.image`/`url` → resolve Open question 3 (brand or document), stop advertising as type-checked.
4. `Shell<Ctx>` → bind the generic to a passed `Context<Ctx>` or drop it.
5. `og: OpenGraph | boolean` → narrow to `OpenGraph | true`.

With (1)–(4) the §11.4 self-check becomes honest. Without (1), the flagship NavItem example ships a bare-string footgun under a "single-sourced" banner — and that alone would be a reject, because the API that *teaches* the misuse is worse than no API.

## Guardrail check (§11.4 type-safety — this lens owns it)

The RFC marks §11.4 **pass**. That is **inaccurate as written**: `NavItem.route` admits raw-string wiring (and its example uses it), `LoadingBarProps.color` is a bare `string` for a token, `OpenGraph.image`/`url` are unbranded strings with an unsettled URL contract, and `Shell<Ctx>` is a phantom generic. The §11.4 frontmatter status must be downgraded to **needs-mitigation** until the five required changes land; then it passes legitimately.
