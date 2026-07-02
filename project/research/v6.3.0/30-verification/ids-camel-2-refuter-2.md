# Verification: ids-camel-2 — defineIds runtime camelization diverges from type-level KebabToCamel

**Verdict: CONFIRMED (refutation failed).** Reproduced at both the type level and runtime against `dist/` (v6.2.0 build).

## Evidence

`src/ids.ts:110` (runtime):

```typescript
const camelKey = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
```

`src/ids.ts:56-58` (type level):

```typescript
type KebabToCamel<S extends string> = S extends `${infer Head}-${infer Tail}`
    ? `${Head}${Capitalize<KebabToCamel<Tail>>}`
    : S;
```

The runtime regex only collapses `-` followed by a **lowercase letter**; the type-level transform collapses every `-` boundary (`Capitalize` on a digit or already-uppercase letter is a no-op but the hyphen is still removed by the template match).

## Runtime reproduction (Node, against `dist/src/ids.js`)

```
defineIds(['col-2','user-List','step-3-panel','tab-1'])
runtime keys: ["col-2","user-List","step-3Panel","tab-1"]
ids.col2:       undefined
ids.userList:   undefined
ids.step3Panel: undefined
ids.tab1:       undefined
```

## Type-level reproduction (tsc probe)

Probe assigning `const a: Id = ids.col2; const b: Id = ids.userList; const c: Id = ids.step3Panel; const d: Id = ids.tab1;` against the shipped `.d.ts`:

```
tsc --noEmit --strict ... probe-types.ts   → exit 0 (clean)
```

So exactly as claimed: the properties type-check as `Id` but are `undefined` at runtime.

## Downstream symptoms (observed)

- `ids.col2.selector` → **TypeError: Cannot read properties of undefined (reading 'selector')** — the crash path (e.g. `target: ids.col2.selector`, `Partial(ids.col2, …)`).
- `Div('x').setId(ids.col2)` then `render(...)` → `<div>x</div>` — the id attribute is **silently dropped** (not `id="undefined"` as the finding speculated; `extractId(undefined)` passes `undefined` through and the attribute is omitted). This is arguably worse: it renders without error and the HTMX target simply never matches.

## Nuance vs. the finding text

Only one detail differs from the finding: `setId` on the undefined property does not crash and does not render `id="undefined"` — it silently omits the id. The core defect (type/runtime key divergence; typed properties undefined at runtime; `.selector` access crashes) reproduces exactly.

## Proposal check

`name.replace(/-(.)/g, (_, c) => c.toUpperCase())` mirrors `Capitalize` semantics for digits and uppercase letters and would produce `col2` / `userList` / `step3Panel` / `tab1`, matching the type keys. (Trailing hyphen `"foo-"`: type gives `` `foo${Capitalize<"">}` `` = `"foo"`, proposed regex leaves `"foo-"` — the regex needs the tail to be non-empty to match — so trailing-hyphen handling/rejection is indeed still required, as the proposal notes.)
