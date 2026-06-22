---
rfc: RFC-B-06
lens: perf
verdict: survives-with-changes
confidence: 0.8
killer_objection: null
required_changes:
  - "Memoize the serialized filter bag inside tableState(): compute the base QueryParams (non-empty filters, skipping nullish/\"\") ONCE at construction. toQuery(overrides) must shallow-spread cachedBase + page/sort/dir slots + overrides — it must NOT re-walk `filters` on each call. Mandatory because a sortable+paginated table calls toQuery() S+2 times per render (S sort headers + prev/next); a naive re-walk is O((S+2)×|filters|) string/object churn on the synchronous render path. The RFC's line-256 contract ('re-emits the full filter set') currently licenses the naive shape."
  - "withPage(page)/withSort(field) must reuse the parent's cached filter base by reference (only the page/sort/dir slot differs); they must not deep-clone or re-serialize filters. Bound total state-derivation work at O(S+|filters|) per render, not O((S+2)×|filters|)."
  - "Build each generated HTMX link eagerly and exactly once at Table.of construction — S sort-header links + ≤2 pager links — never lazily from inside a per-row or per-cell closure. Link count MUST be provably bounded by (columns + pager) and independent of rows.length. (route() → buildHtmxFromRoute → buildQueryString allocates an array + per-key encodeURIComponent at src/routes.ts:170,189; pulling that into the N×C cell loop would be a true regression.)"
  - "Honor a zero-feature fast path: when `state` is absent AND no column carries `sortBy` AND (`totalPages` absent OR ≤1), Table.of must allocate no TableState, invoke toQuery zero times, build zero links, and emit no <tfoot>/pager subtree. A plain Table.of(rows, { columns }) must be allocation-equivalent to a hand-written `Tbody(ForEach(rows, r => Tr(...cells)))` — guard each feature behind its presence check, no unconditional setup."
  - "Read TableThemeCtx.current exactly once per Table.of call (hoist th/td/sortActive closures before the row loop). Forbid reading the theme context per cell: context.current is a getter doing an array index + property dispatch (src/control/context.ts:73) on every read, so a per-cell read multiplies it by N×C. Per-row work is fixed at one cell View per (row × column) via columns[i].cell(row) — no per-row state clone, no per-row toQuery, no per-row context read."
  - "Add a construction-allocation micro-benchmark to bench/ (e.g. 1000 rows × 5 cols, 3 sortable, paginated) comparing Table.of against the equivalent hand-rolled view, asserting time + allocation parity within a small margin, and wire it into the perf suite. This converts the RFC's bare §11.2 'pass' into an enforced, regression-guarded claim and pins the fast-path and memoization contracts above."
---

# Verdict: RFC-B-06 — perf lens

> You are an ADVERSARY. Your job is to KILL this RFC through the perf lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

My mandate: protect the synchronous SSR hot path. Kill this if it adds per-request allocation, slows render/stream, makes the common case pay for a rare feature, or sneaks async onto the sync path. I drove each vector against the actual `src/routes.ts`, `src/render/render.ts`, and `src/control/context.ts` code.

- **Async on the sync path — closed.** `Table.of` returns a plain `Tag` tree consumed by the existing synchronous `render`/`stream` paths. No promise, no suspense, no `await`, and the RFC explicitly rejects `AsyncLocalStorage` in Alternatives. There is no streaming/async surface to kill. Track D's renderer/de-recursion proof is untouched — this is a pure construction-time helper bottoming out in the same `Tag` shape the renderer already walks.

- **Per-link allocation amplification — the real target, but it does not land as a kill.** A sortable + paginated table calls `route()` once per sort header plus up to twice for prev/next: S+2 link builds. Each goes through `buildHtmxFromRoute` (`src/routes.ts:180`) → `buildQueryString` (`routes.ts:170`: array alloc + `Object.entries` + per-key `encodeURIComponent` + `join`). Stack `state.toQuery()` on top, and the RFC's line-256 contract ("re-emits the full filter set") plus `withPage`/`withSort` returning *new* `TableState` objects (lines 67-70) invites re-walking and re-allocating the filter bag on every one of the S+2 links — worst case O((S+2) × |filters|) string/object churn per render. **But the hand-rolled baseline this RFC retires does the same or worse:** glimm's `event-log.view.ts` builds *two* divergent `Record<string,string>` blocks (RFC lines 65 and 169) and calls the identical `route()` per link. The proposed design is equal-or-fewer allocations than the status quo — a non-regression. What it lacks is a *promise* of memoization; a naive implementation is free to regress to the O((S+2)×|filters|) shape. That is a required-change, not a kill.

- **Common-case tax — fails to land.** This is where a "make everyone pay for a rare feature" kill would live. `state?` is optional (RFC line 97) and `totalPages?` gates the pager (line 99). A static `Table.of(rows, { columns })` with no sort, no state, no pager has nothing to serialize and no links to build — *provided* the fast path is honored. The RFC asserts §11.2 "pass" but does not pin the zero-feature path, so a naive implementation could unconditionally construct a `tableState`, call `toQuery()`, or emit an empty `<tfoot>` even when no feature is used. I require the guard (change #4) rather than killing on it, because the zero-cost path is achievable and clearly intended.

- **Per-row cost — the dominant term, no amplification.** Rendering N rows × C columns is O(N×C) cell Views via `columns[i].cell(row)` — intrinsic to any table and identical to the hand-rolled `Tr(...cells)` baseline. The only path to regression is a *hidden* per-row cost the RFC does not forbid: cloning `state` per row, reading `TableThemeCtx.current` per cell (a getter doing an array-index + property dispatch on every read, `context.ts:73`), or building links inside a per-row closure. Multiplied by N×C these become real. I forbid all three (changes #3, #5) rather than killing, because the natural implementation hoists them out of the loop.

- **Immutable-state churn — negligible.** `withSort`/`withPage` allocating new objects is idiomatic and invoked at most S+2 times per render, never per row. Dwarfed by O(N×C). Not a kill.

Net: every kill-shot misses because `Table.of` is a synchronous `Tag`-builder that is equal-or-cheaper than the boilerplate it deletes, grounded in the real `routes.ts`/`render.ts`/`context.ts` code. What remains are guarantees the RFC *asserts but does not enforce* — its §11.2 "pass" is a bare claim with no benchmark and no memoization/fast-path contract.

## Does it survive?

**Survives-with-changes.** The perf lens cannot manufacture a credible killer objection: no async touches the sync path, render/stream is unmodified, the common static-table case can pay nothing, and per-link/per-state allocation is strictly equal-or-better than the hand-rolled baseline being retired. Default-to-reject is overridden because the absence of regression is concrete and code-grounded, not speculative — but the override is *conditional* on the six required changes, which turn the unbacked §11.2 "pass" into an enforced contract: memoize the filter bag (O(S+|filters|), not O((S+2)×|filters|)); reuse the cached base across withPage/withSort; build each link eagerly and exactly once, bounded by columns+pager and independent of rows.length; guarantee a true zero-allocation fast path; cap per-row work and read the theme context once per table; and ship a construction-allocation bench wired into CI. With these folded in, the design is perf-neutral-to-positive.

## Guardrail check (perf lens owns §11.2)

§11.2 (SSR-only, synchronous render path stays fast): **pass, conditional on the required changes.** No async/suspense is introduced; the synchronous render and stream paths are not modified (`Table.of` emits ordinary `Tag` nodes). The common case incurs no new per-request allocation *if* the fast path is guarded. The only residual risk — naive re-serialization of the query bag across the S+2 generated links and a per-cell theme-context read — is bounded by column count (not row count) and is contained by the memoization, eager-build, fast-path, per-row-cap, and bench requirements above. Track D retains ownership of the underlying renderer proof; this RFC adds no new burden to it.
