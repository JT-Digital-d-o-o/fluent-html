# Verification: routes-splat-1 — refuter pass 1

**Verdict: CONFIRMED (refutation failed)**
**Mode:** refute-by-code-reading + runtime repro against `src/routes.ts` (v6.2.0, branch `v6.2.0`)

## Refutation attempts

I looked for any check, guard, or semantic that would make this a non-issue. None exists:

1. **Is there template-time splat detection that gates the second replace?** No. `hasParams` (src/routes.ts:332) checks `SPLAT_RE.test(fullPath)` against the *template*, but that result is discarded — `substituteParams` (src/routes.ts:232-250) unconditionally runs `out.replace(SPLAT_RE, ...)` at line 241 on `out`, the already-`:param`-substituted string, for every parameterized route, splat or not.
2. **Does `encodeURIComponent` neutralize a leading `*` in a param value?** No. `*` is in `encodeURIComponent`'s unreserved set and passes through verbatim (verified: `encodeURIComponent("*") === "*"`). So `/search/:term` + `term: "*"` yields intermediate `/search/*`, which `SPLAT_RE` (`/\/\*([A-Za-z_]\w*)?$/`) matches.
3. **Does anything validate param values before substitution?** No. Neither the route callable nor `resolve` (src/routes.ts:335-349) sanitizes values; `assertNoUnresolvedParams` runs *after* `substituteParams` and only scans for `:name` remnants, not `*`.
4. **Is the failure only reachable with type errors?** No. `term: "*"` and `term: "*x"` are plain `string` values on a `:term` param — fully type-correct call sites.

The in-code comment at lines 238-240 even documents awareness of the adjacent hazard (splat values containing `*` false-positiving a scan) but only for `assertNoUnresolvedParams`; the reverse hazard — a `:param` value containing `*` re-triggering the splat branch — is unhandled.

## Runtime reproduction (against `/Users/tony/jt-digital/fluent-html/src/routes.ts`, tsx)

```
const r = defineRoutes({ search: { method: "get", path: "/search/:term" } } as const);
r.search.resolve({ term: "*" })    // THREW: Unresolved route splat "*" in "/search/:term"
r.search.resolve({ term: "*x" })   // THREW: Unresolved route splat "*x" in "/search/:term"

const r2 = defineRoutes({ f: { method: "get", path: "/f/:a" } } as const);
r2.f.resolve({ a: "*b", b: "x/y" })  // → "/f/x/y"  (mis-substitution; '/' preserved via encodeSplat
                                     //   → single-segment position becomes two path segments)

// Controls (correct behavior elsewhere):
r.search.resolve({ term: "hello world" })                    // → "/search/hello%20world"
defineRoutes({ files: { method: "get", path: "/files/*path" } } as const)
  .files.resolve({ path: "a/b c/d" })                        // → "/files/a/b%20c/d"
```

All three claimed failure modes reproduce byte-for-byte with the finding's description. Note the mis-substitution case (case 3) requires an extra key in the params record beyond the typed shape, so it is the weaker half of the finding; the throw cases (1, 2) are fully type-correct and are the primary defect.

## Severity notes

- Throw cases: any user-supplied string reaching a typed `:param` (search terms, slugs, free-text identifiers) crashes rendering/redirect at runtime when it starts with `*` (optionally followed by identifier chars) at the path's end. `*` and `*x` are realistic search inputs.
- Regression scope: introduced by the trailing-splat feature (commit 371b5c1, `feat(routes): trailing splat/wildcard params on defineRoutes`); pre-splat code had no second replace pass.
- The proposed fix direction (decide splat-ness from the template once, strip the splat suffix before the `:param` loop, substitute separately, concatenate) is sound: it removes all re-parsing of substituted output.

**refuted = false, confidence = high.**
