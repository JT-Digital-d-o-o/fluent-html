# Verification: dx-ideas-4 — defineIds is static-only (id families)

## Finding summary

`defineIds` only produces fixed singleton `Id` objects; per-row HTMX targets (`#user-row-42`)
must be hand-built via `createId(\`user-row-${id}\`)` or raw template strings, reintroducing the
prefix-drift/typo class that `defineIds` exists to prevent. Proposal: trailing `-*` entries become
callables — `defineIds(["user-row-*"])` → `ids.userRow(42): Id`.

## Gap check: CONFIRMED

- `src/ids.ts:103-115` — `defineIds` maps each literal name to a static `Id`. No overload, no
  wildcard handling, no factory entry type. `IdRegistry<T>` (ids.ts:63-65) maps every key to `Id`,
  never to a function.
- `src/ids.ts:45-51` — `createId(name: string)` is the only dynamic escape; it takes a fully
  hand-interpolated string, so the prefix lives as a loose string at every call site (or in a
  user-land helper).
- Searched src for any family/dynamic-id facility (`IdFamily`, scoped ids, wildcard parsing):
  none exists. `extractId`/`extractSelector` are converters, not constructors.
- The library itself acknowledges the pattern: `ForEachKeyed` (src/control/iteration.ts:108-130)
  stamps `id = String(keyOf(item))` and its JSDoc explicitly says "bake a prefix into `keyOf` if
  multiple keyed lists could share raw ids" — i.e. it instructs users to hand-build prefixed ids
  with no typed support.

## Real-world corroboration

The exact predicted workaround exists in a downstream app
(`/Users/tony/jt-digital/ttl/src/time-entry/views/time-entry.view.ts:429`):

```typescript
const entryRowId = (entryId: string) => `entry-row-${entryId}`;
```

used 6× including raw selector interpolation `target: `#${entryRowId(entry.id)}`` (lines 435, 581,
673) — bypassing the `Id` brand and `.selector` entirely. This is precisely the ad-hoc string
building the finding describes.

## Counterweight (skeptic's notes)

- The user-land workaround is a one-line helper; once defined, drift within a single view file is
  unlikely. The real drift risk is view-vs-controller (multi-file), which the ttl example doesn't
  yet exhibit (all 6 uses are in one file).
- Nothing in this repo's own `examples/` or `test/` exercises a per-row target — `examples/htmx.ts`
  only uses static ids. In-repo demand evidence is limited to the `ForEachKeyed` JSDoc admission.
- Implementation is not free at the type level: `IdRegistry` must split `${Base}-*` keys into
  `(key: string | number) => Id` while keeping the existing `KebabToCamel` mapping — moderate but
  contained inference work. Runtime is trivial (~10 LOC).

## Score: 6 / 10

Confirmed, on-philosophy gap ("converge — one way to do each thing") with a trivially small
runtime and a clean, self-explanatory API. The per-row delete/edit pattern is bread-and-butter
HTMX, `ForEachKeyed` already half-endorses it, and a real app hand-rolled exactly the proposed
callable. Held below 7 because the in-repo evidence base is thin (zero example/test call sites)
and the status-quo workaround is a cheap one-liner, so per-call-site improvement is modest —
value is mostly in closing the last untyped hole in the id system rather than in mass call-site
uplift.
