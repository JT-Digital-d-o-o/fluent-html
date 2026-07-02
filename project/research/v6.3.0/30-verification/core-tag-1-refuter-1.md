# Refuter verdict — core-tag-1 (addChild mutates caller-owned / shared child arrays)

**Verdict: NOT REFUTED — CONFIRMED.**

## What I tried to refute it with

1. **Looked for a copy/guard in the code path.** None exists:
   - `src/core/tag.ts:84` — constructor with exactly one child stores it by reference: `this.child = children.length === 1 ? children[0]! : children`. When that single child is an array (a legal `View`), the Tag aliases the caller's array.
   - `src/core/tag.ts:303-314` — `addChild`'s array branch is `current.push(...views)` (line 309). No `Array.isArray` ownership distinction, no copy, no freeze, no flag.
2. **Looked for a type-level exclusion.** `src/core/types.ts:6` — `View = Tag | string | RawString | View[]`. Arrays are a first-class child value; `ForEach` (`src/control/iteration.ts`) is declared to return `View` and returns arrays, so array children are an intended, supported input — not an off-contract usage that could excuse the mutation.
3. **Looked for a documented ownership-transfer semantic.** `addChild`'s JSDoc (tag.ts:293-302) and README (§ `.when` / `.addChild`, lines 147-151) say nothing about the Tag taking ownership of passed arrays. The app-guideline advice "never wrap children in arrays" is a style rule for variadic calls, not a library invariant — the type system and `ForEach` both make arrays legitimate.
4. **Looked for a test asserting the current behavior deliberately.** `test/composition.test.ts:339-353` covers append-to-array only via constructor-allocated rest arrays (`Div(P("a"), P("b")).addChild(...)`), where the push is safe. No test touches the aliased-array case; the behavior is untested, not intended.
5. **Reproduced against the built dist** (`dist/src/index.js`, v6.2.0):

   ```
   const shared = [Li('a'), Li('b')];
   const ul1 = Ul(shared), ul2 = Ul(shared);
   ul1.addChild(Li('c'));
   render(ul1)  // <ul><li>a</li>\n<li>b</li>\n<li>c</li></ul>
   render(ul2)  // <ul><li>a</li>\n<li>b</li>\n<li>c</li></ul>   ← corrupted
   shared.length // 3                                             ← caller array mutated
   ```

   Exactly matches the finding's claimed failure. The SSR escalation is real too: a module-level array child (e.g. static nav items) passed to a per-request tag that calls `addChild` grows by one entry per request — unbounded memory growth plus duplicated output.

## Why the two safe branches don't save it

- Empty child (`""`) → replaces, fine.
- Scalar child → `[current, ...views]` allocates a fresh array, fine.
- Constructor rest-array (`Div(a, b)`) → the array is Tag-allocated, push is fine.

The only unsafe case is precisely the one the finding names: a caller-supplied array stored by reference at tag.ts:84 and then pushed into at tag.ts:309. The proposal (copy in the array branch, or track Tag-allocated arrays with an ownership flag) addresses it directly.

**Conclusion:** genuine defect; finding stands.
