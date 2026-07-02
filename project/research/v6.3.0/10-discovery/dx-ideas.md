# dx-ideas — Fresh-User DX Audit (v6.2.0)

**Lens summary.** Read as a new adopter building an SSR+HTMX app, fluent-html's core promise ("typos become build errors, escape hatches unnecessary") holds remarkably well — until you hit four recurring seams. First, the highest-frequency call in any real app (a nav link carrying `target`/`swap`/`pushUrl`) has no way to share defaults, so the same three options are retyped on every route call. Second, the typed form binding stops one step short of wiring `<label for>`, forcing the id/name/for triple-repetition its own example files exhibit. Third, htmx 4's `:inherited` modifier — showcased in the README — has no typed API at all and drops you straight into `addAttribute` with a stringly-typed key. Finally, a handful of small vocabulary gaps (`size-*`, axis-combined padding, parameterized ids) push otherwise-fluent chains into double calls or ad-hoc string building. All proposals below stay inside the stated philosophy: typed primitives, no opinionated components.

---

## dx-ideas-1: `defineRoutes` has no shared HX defaults — every nav call retypes `target`/`swap`/`pushUrl`

- **Kind:** idea · **Value:** high
- **Evidence:** `src/routes.ts:157-167` (`RouteHxOptions`), `src/routes.ts:316-323` (`defineRoutes` overloads take only `prefix` + `definitions`), `README.md:554-556`

```ts
// src/routes.ts:316-323 — no third argument, no per-route defaults
export function defineRoutes<const T extends RouteDefinitions>(
  definitions: T & CheckRouteParams<T>
): RouteRegistry<T>;
export function defineRoutes<const P extends `/${string}`, const T extends RouteDefinitions>(
  prefix: P,
  definitions: T & CheckRouteParams<T>
): RouteRegistry<PrefixedRouteDefs<P, T>>;
```

In an SSR+HTMX app, the dominant interaction is a full-layout swap: `route({ target: ids.mainContent, swap: "outerMorph scroll:top", pushUrl: true })`. The route callable (`src/routes.ts:330-341`) builds its `HTMX` object from scratch per call, so those three options are re-specified at **every** call site — dozens of times per feature. `defineRoutes` already single-sources method and path; hx options are the last unshared axis.

**Proposal** — registry-level (and optionally per-route) defaults, shallow-merged under per-call options:

```ts
export function defineRoutes<const P extends `/${string}`, const T extends RouteDefinitions>(
  prefix: P,
  definitions: T & CheckRouteParams<T>,
  defaults?: RouteHxOptions,                       // NEW — applied to every callable
): RouteRegistry<PrefixedRouteDefs<P, T>>;

// per-route override/extension inside the def:
list: { method: "get", path: "/", hx: { swap: "outerMorph scroll:top" } }

// usage — call-site options win over route hx, which wins over registry defaults:
const userRoutes = defineRoutes("/users", { … } as const,
  { target: ids.mainContent, swap: "outerMorph scroll:top", pushUrl: true });
A("Users").setHtmx(userRoutes.list())              // fully wired
A("Users").setHtmx(userRoutes.list({ swap: "none" }))  // override just one key
```

Runtime cost is one object spread in `buildHtmxFromRoute` (`src/routes.ts:255-275`).

---

## dx-ideas-2: `FormBinding` never sets control ids and has no `label()` — label wiring is manual triple-repetition

- **Kind:** idea · **Value:** high
- **Evidence:** `src/elements/forms.ts:381-394` (interface — no `label`), `src/elements/forms.ts:410-417` (`input()` sets only `name`), `examples/htmx.ts:27-33`

```ts
// src/elements/forms.ts:410-417 — name is set, id never is
input(name, type) {
  const tag = type ? (Input as (t: InputType) => InputTag)(type) : Input();
  tag.setName(name);
  …
}
```

```ts
// examples/htmx.ts:27-33 — the library's own example repeats "name" three times
Label("Name").setFor("name"),
Input()
  .setType("text")
  .setId("name")
  .setName("name")
```

The typed binding already solves name typos and error/`aria-describedby` wiring (`forms.ts:404-408`), but because `f.input("email")` emits no `id`, a `Label().setFor(...)` has nothing to bind to unless the user hand-sets ids — reintroducing exactly the stringly repetition `Form<T>` exists to kill. Accessibility silently degrades when users skip it.

**Proposal** — controls get `id={name}` by default; add a `label` factory to the binding:

```ts
export interface FormBinding<T> {
  label(name: keyof T & string, ...children: View[]): LabelTag;  // Label(...).setFor(name)
  input(name: keyof T & string, type?: InputType): InputTag;     // now also .setId(name)
  // textarea/select likewise .setId(name); radio uses `${name}-${value}` to stay unique
}

Form<CreateUserReq>((f) => [
  f.label("email", "Email"),
  f.input("email", "email"),   // <input id="email" name="email"> — for/id wired, zero strings
])
```

---

## dx-ideas-3: htmx 4 `:inherited` attributes have no typed API — the README itself escapes to `addAttribute`

- **Kind:** idea · **Value:** high
- **Evidence:** `README.md:474-478`; `grep -rn inherited src/` matches only the global `implicitInheritance` flag at `src/patterns.ts:76`

```ts
// README.md:474-478 — the documented way is the escape hatch
// Explicit inheritance — htmx 4 does NOT inherit by default
Div(
  Button("Delete 1").hxDelete("/item/1"),
  Button("Delete 2").hxDelete("/item/2"),
).addAttribute("hx-confirm:inherited", "Are you sure?")
```

Since htmx 4 made non-inheritance the default, per-container `hx-*:inherited` is the sanctioned way to share `confirm`/`target`/`swap` across children — a common pattern (confirm on a delete-button group, one target for a filter bar). Yet the only path is `addAttribute` with a hand-composed attribute name: no autocomplete, no value typing (`HxSwap`, `Id`), typos ship. This is the exact failure mode the library markets itself as eliminating.

**Proposal** — a `hxInherit()` mixin method beside `setHtmx` in `src/core/htmx-methods.ts`:

```ts
type HxInheritable = Pick<HxOptions,
  "confirm" | "target" | "swap" | "select" | "indicator" | "disable"
  | "include" | "sync" | "headers" | "vals" | "encoding">;

interface Tag {
  /** Emit `hx-<attr>:inherited` for each key — htmx 4 explicit inheritance for descendants. */
  hxInherit(options: HxInheritable): this;
}

Div(…).hxInherit({ confirm: "Are you sure?", target: ids.mainContent })
// → hx-confirm:inherited="Are you sure?" hx-target:inherited="#main-content"
```

Values reuse the existing serializers (`Id` → selector via `resolveSelector`, `vals` → JSON), so typing matches `setHtmx` exactly.

---

## dx-ideas-4: `defineIds` is static-only — per-row HTMX targets fall back to ad-hoc string building

- **Kind:** idea · **Value:** medium
- **Evidence:** `src/ids.ts:103-115` (`defineIds` accepts only `readonly string[]`), `src/ids.ts:45-51` (`createId` is the only dynamic escape)

```ts
// src/ids.ts:103-105 — no parameterized entries
export function defineIds<const T extends readonly string[]>(
  names: T
): IdRegistry<T> {
```

Row-scoped targets are bread-and-butter HTMX (delete a row and swap `#user-42`; `ForEachKeyed` at `src/control/iteration.ts` even stamps `id=<key>` for morph matching). But the typed-Id system only covers fixed singletons, so per-instance ids degrade to `createId(`user-row-${u.id}`)` or raw `.setId(`user-row-${u.id}`)` — the view and the controller can silently drift on the prefix, which is precisely the typo class `defineIds` was built to prevent (`README.md:733-747`).

**Proposal** — id families: a trailing `-*` entry becomes a callable in the registry:

```ts
const ids = defineIds(["user-list", "user-row-*"] as const);
ids.userList            // Id                      ("user-list")
ids.userRow(42)         // Id — "user-row-42" / "#user-row-42"

// type-level: `${infer Base}-*` → KebabToCamel<Base>: (key: string | number) => Id
```

Both sides import the same family, so the prefix is single-sourced; `Partial(ids.userRow(u.id), Row(u))` and `Tr().setId(ids.userRow(u.id))` can never disagree.

---

## dx-ideas-5: No axis-combined `padding`/`margin` — the `px`+`py` pair always costs two calls

- **Kind:** idea · **Value:** medium
- **Evidence:** `src/core/tailwind-methods.ts:154-159` (only value / direction / unit overloads), `examples/tailwind.ts:14-15`, `README.md:1114-1115`

```ts
// examples/tailwind.ts:14-15 — the library's own examples always double-call
t.padding("x", "6")
  .padding("y", "3")
```

`px-* py-*` is the single most common spacing pair on buttons/inputs/badges. Every occurrence in the README (`:34-36`, `:1114-1115`), examples, and FLUENT-STYLING.md is a two-call chain; there is no overload combining directions. The direction vocabulary (`DIR_MAP`) already exists — only the multi-key entry point is missing.

**Proposal** — an object overload reusing the existing direction union and `TailwindSpacing`:

```ts
padding(sides: Partial<Record<"x" | "y" | "top" | "bottom" | "left" | "right", TailwindSpacing>>): this;
margin(sides: Partial<Record<"x" | "y" | "top" | "bottom" | "left" | "right", TailwindSpacing | "auto">>): this;

Button("Save").padding({ x: "6", y: "3" })   // → px-6 py-3
Div().margin({ x: "auto", top: "8" })        // → mx-auto mt-8
```

Runtime is a `for…in` over the same `DIR_MAP` lookup the two-arg form already uses; the extractor sees identical emitted classes.

---

## dx-ideas-6: No `size()` method for Tailwind v4 `size-*` — square sizing is a `w`+`h` double call

- **Kind:** idea · **Value:** medium
- **Evidence:** `src/class-vocab/vocab.ts:113-118` (rows for `w`/`h`/`maxW`/`minW`/`maxH`/`minH`, none for `size`), full method scan of `src/core/tailwind-methods.ts` contains no `size` utility

```ts
// src/class-vocab/vocab.ts:113-118 — every sizing axis except v4's size-*
size("w", "w"),
size("h", "h"),
size("maxW", "max-w"),
size("minW", "min-w"),
…
```

Icons, avatars, spinners, and touch targets are square; Tailwind v4 added `size-*` precisely to collapse `w-10 h-10`. A v4-native library (bare `.ring()` is already 1px v4 semantics) that lacks the v4 utility forces either `.w("10").h("10")` or `addClass("size-10")` — the latter tripping the extractor/ESLint conventions.

**Proposal** — mirror the `w`/`h` signature set:

```ts
size(value: TailwindSizing): this;              // size("10") → size-10, size("full") → size-full
size(unit: TailwindUnit, amount: number): this; // size("px", 18) → size-[18px]
```

One vocab row (`size("size", "size")`) plus the standard unit overload; extractor and safelist support come free via the vocab table.

---

## dx-ideas-7: The `cursor("pointer")` chore on HTMX anchors is lint-enforced instead of API-solved

- **Kind:** idea · **Value:** medium
- **Evidence:** `README.md:2296-2297` and `README.md:2319` (dedicated ESLint rule `anchor-requires-cursor-pointer`), precedent at `src/core/htmx-methods.ts:44`

```ts
// README.md:2296-2297 — the library documents the tax and ships a rule to collect it
// ⚠️ anchor-requires-cursor-pointer: anchors with setHtmx need cursor
A("Link").setHtmx(...)  →  A("Link").setHtmx(...).cursor("pointer")
```

An `<a>` without `href` doesn't get the pointer cursor, so every HTMX-navigating anchor needs `.cursor("pointer")` — the plugin confirms this is a 100%-of-cases rule (severity warn, autofixable). When a suffix is mandatory on every instance, the API should emit it. The library already has this exact precedent: `htmxIndicator()` (`src/core/htmx-methods.ts:44`) is a sanctioned method that just does `addClass("htmx-indicator")`.

**Proposal** — override `setHtmx` on `AnchorTag` (`src/elements/links.ts:13`) to add `cursor-pointer` when no `href` is set at render time (dedupe against an explicit `.cursor(...)` — last write wins, as with any fluent class):

```ts
// AnchorTag override — same signature, one extra emitted class
setHtmx(endpointOrHtmx?: string | HTMX, options?: HxOptions): this {
  super.setHtmx(endpointOrHtmx as never, options);
  return this._hasHref ? this : this.cursor("pointer");
}
```

The ESLint rule then downgrades to catching only genuinely custom cases, and hundreds of call sites drop a chained call.

---

## dx-ideas-8: README behavior table documents 8 of 13 behaviors; README examples bypass the fluent vocab they advertise

- **Kind:** issue · **Value:** low
- **Evidence:** `README.md:852-863` (table) vs `src/core/behavior-methods.ts:84-142` (13 renderers: adds `back`, `formResetOnSwap`, `dismissOnEscape`, `openDialog`, `closeDialog`); `README.md:526-527`; `src/class-vocab/vocab.ts:78-79`

```ts
// src/core/behavior-methods.ts:121-123 — `back` exists, is typed (line 21), and appears nowhere in README
back: () => [
  "click",
  "history.back()",
],
```

```ts
// README.md:526-527 — the "Complete Form Example" escapes to setClass for classes the vocab covers
.setClass("bg-blue-500 text-white px-4 py-2 rounded")
).setClass("space-y-4")   // .spaceY("4") exists — vocab.ts:79
```

The behavior table stops at `selectAll`; `back` — the recommended primitive for every "return to previous page" affordance — is undiscoverable from the README (a fresh user greps and finds nothing). Meanwhile the flagship form example styles with raw `setClass` strings that the library's own `no-known-modifiers-in-setclass` rule (`README.md:2306`) would warn on. New adopters copy README snippets verbatim, so the docs teach the anti-pattern.

**Fix** — add the five missing rows (options + event column) to the table at `README.md:852-863`, document `back` explicitly, and rewrite the two `setClass` calls in the form example as fluent chains (`.background("blue-500").textColor("white").padding({x:"4",y:"2"}).rounded()` / `.flex().flexDirection("col").gap("4")`, matching the library's v4 preference for `gap` over `space-*`).
