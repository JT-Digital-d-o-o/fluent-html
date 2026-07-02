# core-tag-8 — Refuter 1 verdict: NOT REFUTED (confirmed)

**Finding:** Non-View runtime children (numbers) are silently dropped by the serializer.
**Mode:** refute-by-code-reading. **Result:** could not refute — every factual claim verified against code and at runtime.

## What I tried to find (and did not find)

I looked for any check, guard, or semantic that would make this a non-issue:

1. **Construction-time coercion/validation** — none. `Tag`'s constructor (`src/core/tag.ts:82-84`) stores children verbatim: `this.child = children.length === 0 ? "" : children.length === 1 ? children[0]! : children;`. `addChildren` (tag.ts:294-311) is equally pass-through. A number enters the tree untouched.
2. **Serializer handling** — none. Both serializer loops share the same if-chain (string / RawString / Tag / Array) with a silent fall-through:
   - streaming path `emitChunks`: `src/render/serialize.ts:351-386`, ending in `// Unknown view kind → emit nothing (matches the v5 return '')` (line 386);
   - eager path `emit` (used by `render()`): `src/render/serialize.ts:423-468`, same chain, same silent fall-through after the `Array.isArray` branch.
3. **Dev-mode warning or throw** — none. Grepped `src/render/serialize.ts` and `src/core/tag.ts` for `NODE_ENV` / `console.warn` / `console.error` / `throw`: all existing throws are about attributes (hx-status keys, boolean attr names, prototype pollution, on* handlers). Nothing fires for an unknown child kind.
4. **Documented semantic** — none. README documents void elements silently ignoring children (README.md:1458) but says nothing about number children; there is no stated "numbers are dropped" contract, only the internal code comment framing it as an *unknown* kind.

## Runtime confirmation

Repro (tsx, direct module imports since the barrel is mid-refactor):

```
render(Div(42 as any))                              → "<div></div>"
render(Div('You have ' as any, 3 as any, ' items')) → "<div>You have \n\n items</div>"
render(Div(([1,2,3].length) as any))                → "<div></div>"
```

The mixed case is the nastiest form: surrounding strings render, the number vanishes, and the array separator newlines remain — visibly corrupted copy ("You have  items") with no error anywhere.

## The one partial mitigation (already acknowledged by the finding)

`View = Tag | string | RawString | View[]` (`src/core/types.ts:6`) excludes `number`, so strict-TS callers get a compile error. This is real but does not refute the finding:

- the package is consumable from plain JS, where nothing stops `Span(items.length)`;
- `any`-typed data (JSON, untyped helpers) leaks through TS silently;
- the failure mode is silent data loss at render time, strictly worse than either coercing (`String(v)`, what every comparable builder does) or throwing.

The code comment "matches the v5 `return ''`" shows the fall-through is a deliberate *catch-all*, not a designed semantic for numbers — v5 parity of an omission is not a guard.

## Verdict

**Confirmed, high confidence.** Behavior reproduced on both serializer paths; no construction-time guard, no dev warning, no documented contract. Severity is bounded by the TS type barrier (low-frequency in idiomatic TS apps), but the finding as stated is accurate.
