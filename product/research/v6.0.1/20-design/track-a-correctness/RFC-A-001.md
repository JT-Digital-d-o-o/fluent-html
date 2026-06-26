---
id: RFC-A-001
track: A
title: Boundary-aware route-param substitution (shared helper for route callable + resolve)
resolves: [F-A-140]
api_surface: []
breaking: false
ships_to: 6.0.1
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, additive-only, instruction-set, class-vocab-sync, guideline-sync]
guideline_updates: []
impact: high
effort: S
depends_on: []
status: proposed
---

# RFC-A-001: Boundary-aware route-param substitution (shared helper for route callable + resolve)

## Problem
Route param substitution in `defineRoutes()` is a naive substring `String.prototype.replace` of `:${key}`. When one param name is a **prefix** of another, the shorter name matches inside the longer placeholder and corrupts the URL.

Shipped code, `src/routes.ts`:
- Route callable: `resolvedPath = resolvedPath.replace(`:${key}`, encodeURIComponent(String(value)))` (`src/routes.ts:265`), inside the loop at `src/routes.ts:264`.
- `.resolve()`: `resolved = resolved.replace(`:${key}`, encodeURIComponent(String(value)))` (`src/routes.ts:278`), inside the loop at `src/routes.ts:277`.

Two concrete defects fall out of `String.prototype.replace(string, …)`:

1. **Prefix collision.** For path `/orgs/:id/users/:idCard`, iterating `params` and replacing `:id` first matches the `:id` *inside* `:idCard`. Result depends on `Object.entries` order, but a typical run yields `/orgs/42/users/42Card` instead of `/orgs/42/users/AB-9`.
2. **First-occurrence only.** `replace(string, …)` substitutes only the **first** match. A path that legitimately repeats a param (`/a/:id/mirror/:id`) leaves the second `:id` unresolved — which then trips `assertNoUnresolvedParams` (`src/routes.ts:162`) and throws at render time.

Both the route callable and `.resolve()` carry independent copies of the same buggy loop, so any fix must land in **one shared helper** to keep them in lockstep (the whole point of the cluster).

This is high-impact because route refs are the sanctioned, single-sourced way to build every in-app URL (`htmx.md` §`.resolve()`); a silently corrupted URL produces a wrong fetch/redirect with no type error and no exception.

## Proposed API / fix
Pure behavior fix. **No public symbol added or changed** — `api_surface: []`. Internally, replace both naive loops with one shared, boundary-aware substitution helper.

```ts
// src/routes.ts — new internal helper (not exported)

/**
 * Substitute every `:name` placeholder in `template` with its encoded value.
 *
 * Boundary-aware: a placeholder only matches when the segment after `:name`
 * is NOT a further identifier character, so `:id` never matches inside `:idCard`.
 * Replaces ALL occurrences of each param. Unmatched params are ignored here;
 * leftover `:name` placeholders are caught by assertNoUnresolvedParams().
 */
function substituteParams(
  template: string,
  params: Record<string, string | number>,
): string {
  let out = template;
  for (const [key, value] of Object.entries(params)) {
    // (?![A-Za-z0-9_]) — negative lookahead: the char after the name is not an identifier char.
    // Param names are identifiers (\w), so `:id` matched before `:idCard` would have `C` after it → no match.
    const pattern = new RegExp(`:${escapeRegExp(key)}(?![A-Za-z0-9_])`, "g");
    out = out.replace(pattern, encodeURIComponent(String(value)));
  }
  return out;
}

/** Escape RegExp metacharacters in a literal param name (defensive; names are normally identifiers). */
function escapeRegExp(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
```

Both call sites collapse to a one-liner:

```ts
// route callable (replaces the loop at src/routes.ts:263-266)
const routeFn = hasParams
  ? function (params: Record<string, string | number>, options?: RouteHxOptions): HTMX {
      const resolvedPath = substituteParams(fullPath, params);
      assertNoUnresolvedParams(resolvedPath, fullPath);
      return buildHtmxFromRoute(resolvedPath, method, options);
    }
  : /* …unchanged… */;

// resolve (replaces the loop at src/routes.ts:276-279)
const resolve = hasParams
  ? function (params: Record<string, string | number>, query?: QueryParams): string {
      const resolved = substituteParams(fullPath, params);
      assertNoUnresolvedParams(resolved, fullPath);
      return query ? resolved + buildQueryString(query) : resolved;
    }
  : /* …unchanged… */;
```

The `(?![A-Za-z0-9_])` lookahead exactly mirrors the identifier grammar used by `assertNoUnresolvedParams`'s detector regex `:([a-zA-Z_]\w*)` (`src/routes.ts:163`), so the matcher and the unresolved-param guard agree on what a param name is. `escapeRegExp` is belt-and-suspenders: param names come from `:param` segments and the typed `params` map keys, which are identifiers, but escaping keeps a stray metachar from becoming a regex injection.

## Worked examples (before → after)
Real shipped behavior. Given:

```ts
const r = defineRoutes({
  card: { method: "get", path: "/orgs/:id/users/:idCard" },
} as const);
```

```ts
// before (v6.0.0) — :id matches inside :idCard
r.card.resolve({ id: 42, idCard: "AB-9" });
// Object.entries order {id, idCard}: replace ":id" first →
//   "/orgs/42/users/:idCard".replace(":id", "42")  hits ":id" in ":idCard"
//   → "/orgs/42/users/42Card"   then replace ":idCard" finds nothing
// ⇒ "/orgs/42/users/42Card"          ❌ corrupted (idCard value dropped)
```

```ts
// after (this RFC) — boundary-aware, each placeholder matched whole
r.card.resolve({ id: 42, idCard: "AB-9" });
// ":id(?![\w])" does NOT match ":idCard" (next char "C" is \w)
// ":idCard(?![\w])" matches the whole placeholder
// ⇒ "/orgs/42/users/AB-9"            ✅ correct
```

Repeated param (also fixed by the global flag):

```ts
const m = defineRoutes({ mirror: { method: "get", path: "/a/:id/b/:id" } } as const);

// before (v6.0.0): replace(":id", "7") hits only the FIRST occurrence
m.mirror.resolve({ id: 7 });   // → throws "Unresolved route param ":id"" (2nd :id left)  ❌

// after (this RFC): /g flag replaces both
m.mirror.resolve({ id: 7 });   // → "/a/7/b/7"                                              ✅
```

Existing single-param paths are byte-for-byte unchanged:

```ts
// /users/:id with { id: 42 } → "/users/42"  (before == after)  ✅ no regression
```

## Type-safety story
No type-surface change. The compile-time guarantees stay exactly as shipped: `ResolveParamTypes<Path, Params>` (`src/routes.ts:57`) still requires the param object keyed by the literal names extracted from the path, with declared `"string" | "number" | "uuid"` types. Note that the type layer alone cannot prevent this bug — `ExtractParams<"/orgs/:id/users/:idCard">` correctly yields `"id" | "idCard"` and the caller passes both, yet the **runtime** substitution still corrupted the result. This RFC closes the runtime gap so the runtime now honors the contract the types already promised. The boundary lookahead encodes the same identifier grammar (`[A-Za-z0-9_]`) the type-level `ExtractParams` (`src/routes.ts:27-32`) uses to split on `:`, keeping type extraction and runtime substitution definitionally aligned.

## Compatibility & version
- **6.0.1 (patch):** Behavior fix, `api_surface: []`. No exported symbol, type, or signature changes. Output changes **only** for paths that were already broken: (a) prefix-colliding param names now resolve correctly instead of corrupting, (b) repeated params now resolve instead of throwing. Every previously-correct URL (the overwhelming majority — single param, or non-prefixing param names) is byte-identical. Strictly more correct, no new public shape. Ships to 6.0.1.
- **6.1.0 (minor):** N/A — nothing additive needed.
- **parked-major:** N/A — fixable without any breaking change.

## Guidelines impact
None — no public surface.

The fix is internally observable only as "param substitution is now correct"; it adds no method, option, or pattern an LLM reader would invoke differently. The existing `htmx.md` `.resolve()` guidance (`guidelines/web-development/htmx.md:66-80`) remains accurate as written.

Lib-own docs — **CHANGELOG only** (no README/JSDoc change, since no API moved):

```md
<!-- CHANGELOG.md — under [6.0.1] → ### Fixed -->
- **Route params:** `defineRoutes()` route callables and `.resolve()` now substitute each
  `:param` with a boundary-aware match in one shared helper. A param name that is a prefix of
  another (e.g. `:id` next to `:idCard`) no longer corrupts the URL, and a path that repeats a
  param now resolves all occurrences instead of throwing. Previously-correct URLs are unchanged.
```

## Guardrail check
- **zero-deps:** pass — uses the built-in `RegExp`; no dependency added.
- **ssr-only:** pass — synchronous string substitution on the existing render path; one precompiled `RegExp` per param per call, no measurable hot-path cost (URLs build a handful of params).
- **escape-by-default:** pass — values still pass through `encodeURIComponent` exactly as before; `escapeRegExp` only neutralizes regex metachars in the *param name*, not the value.
- **type-safety:** pass — no type change; runtime now honors the existing contract.
- **additive-only:** pass — `breaking: false`; only previously-broken outputs change.
- **instruction-set:** N/A — internal bugfix, no new primitive/component.
- **class-vocab-sync:** N/A — emits no classes; tailwind-extractor + eslint-plugin untouched.
- **guideline-sync:** pass — `api_surface` is empty, so no guideline symbol is left uncovered; `guideline_updates: []` is correct.

## Alternatives considered
- **Split-and-rejoin per segment** (`path.split("/").map(seg => seg === ":"+key ? val : seg)`): handles whole-segment params but breaks legitimate multi-param-or-mixed segments like `/v:major.:minor` or `/:id.json`; the regex lookahead is strictly more general and matches the existing detector grammar.
- **One mega-regex `/:(\w+)/g` with a replacer that looks up `params[name]`:** elegant, single pass, no per-param loop. Rejected for 6.0.1 only because it changes the unmatched-param semantics subtly (an unknown `:name` would be left as-is and caught by the assert — same end state, but a larger diff and a different code path than the minimal, obviously-correct per-param boundary fix). Reasonable for a future cleanup; the conservative shared helper is the right patch-lane choice.
- **Sort params longest-name-first before substituting:** makes prefix collisions *less likely* but is not a fix — `:id`/`:idCard` ordered long-first still leaves `replace`'s first-occurrence-only and intra-token-match hazards. Half-measure; rejected.

## Open questions
None. The fix is mechanical, the grammar matches the existing `assertNoUnresolvedParams` detector, and no public shape moves.
