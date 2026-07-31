# Object Variants — Design

From the 2026-07-31 spike (session-ephemeral; load-bearing facts captured here).

## Type design (proven under `--strict` + `exactOptionalPropertyTypes`)

```ts
interface StyleProps { bg?: TailwindColor | undefined; px?: TailwindSpacing | undefined; truncate?: boolean | undefined; ring?: true | TailwindRing | undefined; … }
type NestedVariants = { [K in DirectVariant]?: VariantStyleObject | undefined };
export interface VariantStyleObject extends StyleProps, NestedVariants {}
```

- Positional args flatten into keys: `padding("x","4")` → `px: "4"`; `translate("y","-0.5")` → `translateY`. `space` rows expand to 7 keys.
- Unit/arbitrary values via the existing bracket arm: `minH: "[180px]"` (no tuples — avoids colliding with multi-arg-custom tuple encoding).
- No-arg utilities: `truncate: true` (false/undefined = omit ⇒ free conditional form `bold: isImportant`).
- Optional-value utilities: `ring: true | "2"`.
- Values include `| undefined` so `bg: cond ? "blue-600" : undefined` type-checks — replaces most in-variant conditionals.
- Multi-arg customs (gradient, maskFrom, snap — ~8 rows): readonly tuple values.

## Error quality (verified)

Keys spell-checked (`'opcaity' … Did you mean 'opacity'?` — two levels deep), values spell-checked (`'"blue-60"' … Did you mean '"blue-600"'?`), misplaced nesting is TS2322 — can never silently emit an unprefixed class.

## Surface

- Tier 1 (~21 direct methods): `hover focus focusVisible focusWithin active disabled checked dark first last odd even groupHover peerChecked before after sm md lg xl xl2` (naming of `2xl` = open scope decision).
- Tier 2: `.variant(name: TailwindState | TailwindBreakpoint, obj)` — existing unions already cover all ~78 incl. arbitrary forms; verified `.variant("data-[state=open]", { rounded: "lg" })`.
- Runtime: `applyVariantObject` = push `_variantPrefix` → iterate keys → skip undefined/false → recurse variant keys → `KEY_EMIT` lookup → restore in `finally` (~25 LOC, spike-passing). Keep `_variantPrefix` as-is.

## Evidence

- All 25 real `.on(`/`.at(` sites in demos object-expressible (0 lambda-requiring; the one `.on`-inside-`.when` nests fine — `.when` lambda stays).
- Tokens: 25 sites, 1,254 → 897 chars (−28.5%), −4.1 tok/site avg.
- Perf (1000 sites, 200-key interface): object 0.16–0.17s vs lambda 0.12–0.13s vs baseline 0.16s — noise; instantiations flat (structural checking, not generic instantiation).

## Generation dependency

`StyleProps` keys/types + `KEY_EMIT` emit from vocab rows once `valueType` lands (vocab-generator). Guard: extend `class-vocab.test.ts` parity to diff generated interface keys/types against the method declarations until those are themselves generated.
