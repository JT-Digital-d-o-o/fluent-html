# Lens: routes-ids — `src/routes.ts` & `src/ids.ts`

**Summary.** The route/id system's type-level story is strong (literal-path param extraction, enum tuples, splat support, branded Ids), but the runtime lags the types in three ways: the new trailing-splat substitution scans the *substituted output* instead of the template, so ordinary `:param` values that start with `*` throw or get mis-substituted; `defineIds`' runtime camelization diverges from the type-level `KebabToCamel` for digits/uppercase after a hyphen, producing typed properties that are `undefined` at runtime; and the `params` type metadata (`number`/`uuid`/enums) is never consulted at runtime at all. Two additional template edge cases (prefix params can't be typed; `:id.csv` infers the wrong param key) and two smaller gaps (id-uniqueness silence, no array query values) round out the picture. All findings below were reproduced against `dist/` with node or confirmed with `tsc --strict`.

---

## routes-splat-1: Splat substitution runs on the substituted output — legit `:param` values starting with `*` throw or mis-substitute

- **Kind:** bug
- **Severity:** high
- **Evidence:** `src/routes.ts:220`, `src/routes.ts:241-248` (inside `substituteParams`, `src/routes.ts:232`)

```typescript
const SPLAT_RE = /\/\*([A-Za-z_]\w*)?$/;
// ...
function substituteParams(template, params) {
  let out = template;
  for (const [key, value] of Object.entries(params)) { /* :param loop */ }
  out = out.replace(SPLAT_RE, (_match, name?) => {          // ← runs on `out`, not `template`
    const key = name ?? "splat";
    const value = params[key];
    if (value == null) {
      throw new Error(`Unresolved route splat "*${name ?? ""}" in "${template}"`);
    }
    return "/" + encodeSplat(value);
  });
```

The splat replacement is applied to `out` — the string *after* `:param` values have been substituted. `encodeURIComponent` does not escape `*`, so a perfectly ordinary param value that begins with `*` re-triggers the splat branch on a route that has no splat at all. Reproduced (v6.2.0 dist):

```
defineRoutes({ search: { method: "get", path: "/search/:term" } })
  .search.resolve({ term: "*" })    // THROWS: Unresolved route splat "*" in "/search/:term"
  .search.resolve({ term: "*x" })   // THROWS: Unresolved route splat "*x" in "/search/:term"
```

A `*` search term is a realistic user input (wildcard searches), and the call site is fully type-correct — this is a runtime crash on valid input, introduced with the splat feature. Worse than the throw: when the leaked `*name` happens to match a key present in the params record, the splat branch substitutes that param's value **slash-preservingly** (`encodeSplat` keeps `/` unescaped), so an untyped/JS caller can turn a single-segment param position into multiple path segments.

**Fix:** decide splat-ness from the **template**, once, at `defineRoutes` time: `const splatMatch = fullPath.match(SPLAT_RE)`. Strip the splat suffix from the template before the `:param` loop, substitute the splat value separately, then concatenate. The output string must never be re-parsed for route syntax.

---

## ids-camel-2: `defineIds` runtime camelization diverges from the type-level `KebabToCamel` — typed properties are `undefined` at runtime

- **Kind:** bug
- **Severity:** high
- **Evidence:** `src/ids.ts:110` vs `src/ids.ts:56-58`

```typescript
// type level (ids.ts:56-58) — handles ANY char after '-' via Capitalize
type KebabToCamel<S extends string> = S extends `${infer Head}-${infer Tail}`
    ? `${Head}${Capitalize<KebabToCamel<Tail>>}`
    : S;

// runtime (ids.ts:110) — only matches a LOWERCASE LETTER after '-'
const camelKey = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
```

Any hyphen followed by a digit or uppercase letter splits type from runtime. Reproduced:

```
defineIds(["col-2", "user-List", "step-3-panel"])
// runtime keys:  [ 'col-2', 'user-List', 'step-3Panel' ]
// type keys:     [ 'col2',  'userList',  'step3Panel'  ]
ids.col2  // typed as Id — actually undefined at runtime
```

`ids.col2` type-checks everywhere (`setId(ids.col2)`, `Partial(ids.col2, …)`) and then crashes or renders `id="undefined"` at runtime. Numbered ids (`col-2`, `step-3-panel`, `tab-1`) are common in real layouts.

**Fix:** mirror `Capitalize` exactly at runtime: `name.replace(/-(.)/g, (_, c) => c.toUpperCase())` (uppercasing a digit is a no-op, matching `Capitalize<"2…">`). Also handle/reject a trailing hyphen (`"a-"` → type `"a"`, runtime `"a-"`). A dev-time assertion that every produced key round-trips would catch future drift.

---

## routes-prefix-3: Params living in the route prefix can never be typed — declaring them is a compile error, omitting them silently falls back to `string`

- **Kind:** issue
- **Severity:** medium
- **Evidence:** `src/routes.ts:131-137` (validates against the *unprefixed* `T[K]['path']`), `src/routes.ts:316-319` (prefixed overload)

```typescript
type CheckRouteParams<T extends RouteDefinitions> = {
  readonly [K in keyof T]: {
    readonly params?: {
      readonly [P in keyof T[K]['params']]: P extends ExtractParams<T[K]['path']> ? ParamType : never;
      //                                                            ^^^^^^^^^^^^ unprefixed path
```

Confirmed with `tsc --strict`:

```typescript
defineRoutes("/users/:userId", {
  posts: { method: "get", path: "/posts", params: { userId: "number" } as const },
});
// error TS2322: Type '"number"' is not assignable to type 'never'   ← declaring it: rejected

defineRoutes("/users/:userId", { posts: { method: "get", path: "/posts" } })
  .posts.resolve({ userId: 42 });
// error TS2322: Type 'number' is not assignable to type 'string'    ← undeclared: stuck at string
```

The callable's param *types* come from the prefixed path (`PrefixedRouteDefs`, `src/routes.ts:148-154`), but `CheckRouteParams` validates the `params` map against the raw sub-path — so `number`/`uuid`/enum typing is unreachable for exactly the params a prefix exists to share. The F-D-141 guard turns a legitimate declaration into a "typo".

**Fix:** in the prefixed overload, validate against the joined path: `P extends ExtractParams<JoinPath<Prefix, T[K]['path']>>`. Alternatively (nicer API): accept a prefix-level `params` map — `defineRoutes("/users/:userId", { params: { userId: "number" } }, routes)` — applied to every route.

---

## routes-paramtype-4: `number`/`uuid` param types have zero runtime enforcement — `params` metadata is never read at runtime; `uuid` is a pure alias of `string`

- **Kind:** issue
- **Severity:** medium
- **Evidence:** `src/routes.ts:71-75`, `src/routes.ts:232-250` (`substituteParams` takes only `template` + `params`; `def.params` is never passed anywhere at runtime)

```typescript
type ParamTypeMap = {
  string: string;
  number: number;
  uuid: string;      // ← identical to string at the type level too
};
```

Reproduced: `defineRoutes({ u: { method: "get", path: "/users/:id", params: { id: "number" } } })`:

```
n.u.resolve({ id: NaN })   // "/users/NaN"
n.u.resolve({ id: 1e21 })  // "/users/1e%2B21"
```

`NaN`/`Infinity` are `number`-typed, so the compile-time story doesn't stop them, and `1e21` serializes in exponential notation — all three produce URLs no `:id (number)` server route will parse. `uuid` buys literally nothing over `string` (same TS type, no runtime shape check), which undersells what the declaration appears to promise. The `params` object is carried in `RouteDef` but the runtime path (`defineRoutes` → `substituteParams`) never consults it.

**Fix:** thread `def.params` into `substituteParams` and add two cheap guards: `number` → `Number.isFinite(value)` + serialize via `String(Math.trunc?…)` or at least reject non-finite; `uuid` → a one-line regex test, throwing a descriptive error. Or, if runtime validation is out of scope by design, say so in the JSDoc of `ParamTypeName` (`src/routes.ts:61`) — today the name "uuid" implies a guarantee that doesn't exist.

---

## routes-dotsuffix-5: `ExtractParams` captures to the next `/` — `/export/:id.csv` demands key `"id.csv"`, and satisfying the type eats the `.csv` suffix

- **Kind:** bug
- **Severity:** medium
- **Evidence:** `src/routes.ts:27-32` (type), `src/routes.ts:232-237` (runtime is boundary-aware, so the two disagree)

```typescript
type ExtractParams<Path extends string> =
  Path extends `${string}:${infer Param}/${infer Rest}`   // stops only at "/"
    ? Param | ExtractParams<`/${Rest}`>
    : Path extends `${string}:${infer Param}`             // or end-of-string
      ? Param
      : never;
```

Confirmed with `tsc` + node:

```
c.exportCsv.resolve({ id: "abc" })
// error TS2353: 'id' does not exist in type 'ResolveAllParamTypes<"/export/:id.csv", …>'
c.exportCsv.resolve({ "id.csv": "abc" })  // type-approved → "/export/abc"   ← .csv GONE
// (the type-rejected { id: "abc" } would have produced the correct "/export/abc.csv")
```

Runtime substitution uses an identifier-boundary lookahead (`(?![A-Za-z0-9_])`, `src/routes.ts:235`) — matching Fastify/Express semantics where the param name is `id` — but the type demands the full `"id.csv"` key, whose global replace consumes the extension. The types actively steer the caller from the correct call to the broken one. Dot-suffixed routes (`/:id.csv`, `/:file.json`) are a normal Fastify pattern.

**Fix:** make `ExtractParams` stop at non-identifier characters, mirroring the runtime lookahead — e.g. after inferring `Param`, split it on the first char outside `[A-Za-z0-9_]` (a bounded template-literal helper like `TrimNonWord<Param>`), so `"/export/:id.csv"` yields `"id"`.

---

## ids-uniqueness-6: `defineIds` gives no uniqueness guarantee — colliding camelCase keys silently last-write-win

- **Kind:** issue
- **Severity:** medium
- **Evidence:** `src/ids.ts:106-114`

```typescript
const registry: Record<string, Id> = {};
for (const name of names) {
  const camelKey = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  registry[camelKey] = createId(name);   // ← silent overwrite on collision
}
```

Reproduced: `defineIds(["user-list", "userList"])` → one runtime key, `ids.userList.id === "userList"` — the `"user-list"` DOM id becomes unreachable, and every existing `target: ids.userList` silently retargets to a different element. The type level collapses to the same single key (`IdRegistry` maps via `KebabToCamel`), so there is no compile error either; exact duplicates (`["a", "a"]`) are equally silent. For a module whose whole purpose is "hx-target selectors always reference valid element IDs" (`src/ids.ts:5-6`), definition-time detection is cheap and in-spirit. Secondary gap in the same constructor: `createId` (`src/ids.ts:45-51`) accepts any string, but an id with a leading digit (`"2fa-status"`) yields `selector: "#2fa-status"`, which is an **invalid CSS selector** (digits must be escaped) — `querySelector`/hx-target will throw or match nothing while the type says all is well.

**Fix:** throw at `defineIds` time when a computed key is already present (`if (camelKey in registry) throw new Error(...)`), and validate names against a safe-id pattern (`/^[A-Za-z][\w-]*$/`) or emit `CSS.escape`-style selectors.

---

## routes-midsplat-7: Mid-path wildcards are type-rejected but runtime-silent — the literal `*path` is emitted into the URL

- **Kind:** issue
- **Severity:** low
- **Evidence:** `src/routes.ts:39-44` (type: `ExtractSplat` → `never` for mid-path), `src/routes.ts:332`

```typescript
const hasParams = fullPath.includes(":") || SPLAT_RE.test(fullPath);  // false for "/files/*path/meta"
```

Reproduced: `defineRoutes({ x: { method: "get", path: "/files/*path/meta" } }).x.resolve()` → `"/files/*path/meta"`. The type level deliberately treats mid-path wildcards as unsupported (`ExtractSplat`'s `Rest extends `${string}/${string}`` guard, per the comment at `src/routes.ts:36-37`), but the runtime happily registers the route as *paramless* and serves a URL containing a literal `*path` segment — a silently broken link instead of an error. `assertNoUnresolvedParams` only scans for `:`-params, so nothing catches it.

**Fix:** at `defineRoutes` time, throw on any `*` in the path that is not a trailing splat: `if (fullPath.includes("*") && !SPLAT_RE.test(fullPath)) throw new Error(...)`. Unsupported syntax should fail at definition, not at click time.

---

## query-arrays-8: `QueryParams` has no array support — repeated-key encoding (`?tags=a&tags=b`) is impossible

- **Kind:** idea
- **Value:** low
- **Evidence:** `src/htmx.ts:263-266`, `src/htmx.ts:274-283`

```typescript
export type QueryParamValue = string | number | boolean | undefined | null;
// ...
parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
```

Multi-value query params (filter chips, multi-selects — `?tags=a&tags=b`, the shape Fastify's default querystring parser turns into `string[]`) can't be expressed: arrays are type-rejected, and a caller who casts past it gets the comma-joined single value `tags=a%2Cb` (reproduced), which parses as one string `"a,b"` server-side. The current behavior otherwise is sound (nullish skipped, empty string kept, keys and values encoded, `?`/`&` join-aware).

**Proposed API:** widen `QueryParamValue` to `string | number | boolean | readonly (string | number | boolean)[] | undefined | null` and emit one `key=value` pair per element in `buildQueryString` (empty array → skipped, like nullish). Backward compatible; both `hx()` and route callables pick it up for free since they share `buildQueryString`.
