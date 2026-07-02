# Verification: htmx-emission-7 — refuter 2 (refute-by-reproduction)

**Verdict: CONFIRMED — not refuted.** All three sub-claims reproduced against `dist/` (v6.2.0) and cross-checked against four.htmx.org.

## Repro method

- Runtime probe: `node` script importing `Div`/`render` from `/Users/tony/jt-digital/fluent-html/dist/src/index.js` (scratchpad `repro-status.mjs`).
- Type probe: `tsc --noEmit --strict` against `dist/src/htmx.d.ts` (scratchpad `probe-types.ts`).
- Docs check: web search + fetch of `four.htmx.org/reference/attributes/hx-status`.

## Sub-claim 1: HCON value grammar corruptible via typed inputs — REPRODUCED

Type probe: `const cfg: HxStatusConfig = { swap: 'innerHTML scroll:top', target: 'closest form' }` **type-checks** (tsc exit 0). `HxStatusConfig.swap` is full `HxSwap` (includes `SwapWithModifier` template literals, `src/htmx.ts:51,66,179`); `target` is full `HxTarget` which includes `` `closest ${string}` `` and bare `string` (`src/htmx.ts:75,82,180`).

Runtime emission:

```
P1: <div hx-post="/save" hx-status:422="swap:innerHTML scroll:top target:closest form">x</div>
```

four.htmx.org documents the hx-status value as "space-separated `key:value` pairs" with keys `swap`, `target`, `select`, `push`, `replace`, `transition`. Under that grammar the emitted value tokenizes as `swap:innerHTML` + `scroll:top` (bogus config key) + `target:closest` + `form` (dangling token). The swap modifier is silently lost / misparsed and the target is truncated to `closest`. Corruption confirmed exactly as described (`buildStatusConfig`, `src/render/serialize.ts:219-228`).

## Sub-claim 2: `50x` wildcards rejected though valid htmx — REPRODUCED

- four.htmx.org hx-status reference, verbatim: "Supports exact codes, single-digit wildcards (`x`), and range wildcards (`xx`)" with the example `hx-status:50x="select:#bad-gateway"`, and evaluation order "exact match (`404`), then 2-digit wildcard (`50x`), then 1-digit wildcard (`5xx`)". So `50x` is valid htmx 4.
- `HxStatusKey` (`src/htmx.ts:193-195`) has only `NNN` and `Nxx` — the type probe's `@ts-expect-error` on `status: { '50x': ... }` held (compile-time rejection).
- `STATUS_KEY_RE = /^(?:[1-5][0-9]{2}|[1-5]xx)$/` (`src/render/serialize.ts:165`) — runtime probe with an `as`-cast-free JS caller threw at render:

```
P2 THREW: Invalid hx-status key: "50x" — expected a 100-599 code or an Nxx wildcard (e.g. 404 or "5xx").
```

## Evidence-anchor accuracy

All cited line numbers match current source: `buildStatusConfig` join at `serialize.ts:221-227`, `STATUS_KEY_RE` at `serialize.ts:165`, `HxStatusConfig` at `htmx.ts:178-185`, `HxStatusKey` at `htmx.ts:193-195`.

## Caveats (do not change the verdict)

- htmx 4's actual parser behavior for the dangling `form` token was not executed in a browser; the documented grammar ("space-separated key:value pairs") makes the emission at minimum ambiguous, and `scroll:top` is unambiguously consumed as a stray pair since it is itself `key:value`-shaped.
- The `50x` gap is a completeness/expressiveness defect (valid htmx unrepresentable), not a corruption; typed users get a compile error, untyped users get a render-time throw. Proposal's extended regex `/^(?:[1-5][0-9]{2}|[1-5][0-9]x|[1-5]xx)$/` matches the documented grammar.

Sources: [four.htmx.org hx-status reference](https://four.htmx.org/reference/attributes/hx-status), [four.htmx.org reference index](https://four.htmx.org/reference)
