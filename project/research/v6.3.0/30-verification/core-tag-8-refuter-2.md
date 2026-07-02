# core-tag-8 — Refuter 2 verdict: NOT REFUTED (CONFIRMED)

**Finding:** Non-View runtime children (numbers) are silently dropped by the serializer.
**Mode:** refute-by-reproduction, run against built `dist/` (v6.2.0).

## Reproduction

Probe (`node`, ESM, importing `dist/src/index.js`):

```js
render(Div(42))                        // → "<div></div>"          (42 dropped)
render(Span(items.length))             // → "<span></span>"        (length dropped)
render(Div('count: ', 42, ' items'))   // → "<div>count: \n\n items</div>"  (dropped + stray newlines)
renderToIterable(Div(42))              // → "<div></div>"          (streaming path drops too)
```

All four outputs reproduce the silent data loss exactly as claimed. The mixed-children case is arguably worse than the finding states: the array join still emits the separator `\n` around the vanished child, so the output contains `count: \n\n items`.

## Code-level confirmation

- `src/render/serialize.ts:351-386` (`emitChunks`): the if-chain handles `string` / `RawString` / `Tag` / `Array` and falls through with the comment `// Unknown view kind → emit nothing (matches the v5 return '')` at line 386. Same comment present in `dist/src/render/serialize.js:324`, so dist matches src.
- `src/render/serialize.ts:409-471` (`emit`, the eager duplicate loop): identical fall-through — numbers (and any other non-View value: `boolean`, `null`, `undefined`, objects) hit the end of the loop body and emit nothing. Both paths affected, consistent with the render ≡ renderToIterable invariant.

## TypeScript-side claim

- `src/core/types.ts:6`: `export type View = Tag | string | RawString | View[];` — excludes `number`, as the finding states.
- `tsc --noEmit` on `Div(42)` errors: `TS2345: Argument of type 'number' is not assignable to parameter of type 'View'.` So the leak surface is JS consumers, `as any`, and untyped interop — exactly as described.

## Verdict

**Not refuted.** Every element of the finding reproduces:

1. Runtime silently drops number children in both `render` and `renderToIterable` (verified against dist).
2. TS blocks the call at compile time, confirming this only bites JS / `any` callers.
3. The fall-through is intentional-looking (commented) but produces invisible data loss rather than rendering or throwing.

The proposal (emit `String(v)` for `typeof v === 'number'`, or throw in dev) is coherent: since `View` excludes `number`, accepting it at runtime cannot change behavior for any type-checked caller. Note a fix must patch **both** loops (`emitChunks` and `emit`) to preserve the fuzz-tested equivalence, and should decide explicitly what to do with `NaN`, `Infinity`, `bigint`, `boolean`, `null`/`undefined` while there.
