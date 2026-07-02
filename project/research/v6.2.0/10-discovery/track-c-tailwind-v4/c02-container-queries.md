# Track C — Tailwind v4 Container Queries (lens: container-queries)

Lens scope: `@container` / `@container-size` markers, `container-type`/`container-name`, `@min-*` / `@max-*` size variants, named-container scoping, and `cq*` length units — measured against fluent-html's `containerQuery()` + `.at()` surface.

## State of the world (what already ships, 6.1.x)

Container queries are **already substantially covered** in 6.1.x:

- `containerQuery(name?)` — emits `@container` / `@container/{name}`. Def: `tailwind-methods.ts:296-297, 678-680`; vocab: `vocab.ts:222-223` (`opt("containerQuery", "@container", "/")`); type `tailwind-methods.ts:296`.
- `.at(breakpoint, fn)` accepts container-query variants via `TailwindContainerBreakpoint` (`tailwind-types.ts:236-241`):
  `@${string}` | `@max-${string}` | `@[${string}]` | `@${string}/${string}` — folded into `TailwindBreakpoint`.
- `withVariant` (`tailwind-methods.ts:91-102`) passes the `@`-prefixed prefix through unchanged, so `.at("@md", …)` → `@md:…`, `.at("@max-lg", …)` → `@max-lg:…`, `.at("@sm/sidebar", …)` → `@sm/sidebar:…` all work today.

So `@min-[475px]` (matches `@${string}`), `@max-[960px]` (matches `@max-${string}`), and named scoping (`@sm/main`) are all already *typeable and emittable*. The remaining gaps are narrow.

---

## Proposal C02-1 — `containerType()` / size containment (`@container-size`)

**Problem / evidence.** `containerQuery()` only emits `@container` (inline-size containment). Tailwind v4 also ships **`@container-size`** (and `@container-size/{name}`) for elements whose children query *block-size* — required for `cqb`/`cqh` length units and any height-based container query. There is no way to emit `@container-size` today: `containerQuery` hardcodes `@container` (`tailwind-methods.ts:678-680`), and the vocab opt (`vocab.ts:223`) only knows `@container`. MDN: `container-type: size` (Baseline 2023, widely available); Tailwind v4 maps it to `@container-size`.

**Proposed API.** Overload `containerQuery` with a type discriminator, or add a sibling. Prefer an optional second arg to keep one method (converge):

```ts
// tailwind-methods.ts (declaration)
/** Mark a container-query container (v4). type "size" → `@container-size` (block-size, enables cqb/cqh). */
containerQuery(name?: string): this;
containerQuery(opts: { name?: string; type?: "inline-size" | "size" }): this;
```

```ts
p.containerQuery = function (arg?) {
  const { name, type } = typeof arg === "string" ? { name: arg } : (arg ?? {});
  const base = type === "size" ? "@container-size" : "@container";
  return this.addClass(name === undefined ? base : `${base}/${name}`);
};
```

Emitted: `@container-size`, `@container-size/main`.

**Before / After.**
```ts
// Before — no way to express block-size containment; must fall back to raw class
Div(...).addClass("@container-size")
// After
Div(...).containerQuery({ type: "size" })
Div(...).containerQuery({ name: "main", type: "size" })
```

**Already in lib?** No — `@container-size` is unreachable; `containerQuery` only emits `@container`.
**Value.** Medium (size/block-size containers are the minority case, but the only genuine emit gap). **Effort.** Small (one method body + one vocab entry + extractor opt + eslint vocab regen).

---

## Proposal C02-2 — Closed union for container-query breakpoints in `.at()`

**Problem / evidence.** `TailwindContainerBreakpoint` (`tailwind-types.ts:237-238`) is fully open: `@${string} | @max-${string} | @[${string}] | @${string}/${string}`. This type-checks `@md` but **also type-checks `@mdd`, `@foo`, `@max-zzz`** — no autocomplete, no typo protection. Tailwind v4 ships a *closed* named set: `@3xs @2xs @xs @sm @md @lg @xl @2xl @3xl @4xl @5xl @6xl @7xl` (16rem–80rem) plus `@max-*` of the same names and `@min-[…]`/`@max-[…]` arbitrary forms. The library's stated direction (per `tailwind-types.ts:118+` named-state unions and the closed-sizing-union work in 6.1.x) is closed unions where the set is finite.

**Proposed API.** Replace the open template with a named-union core, keeping arbitrary escape hatches and named-container scoping open:

```ts
type CqSize =
  | "@3xs" | "@2xs" | "@xs" | "@sm" | "@md" | "@lg" | "@xl"
  | "@2xl" | "@3xl" | "@4xl" | "@5xl" | "@6xl" | "@7xl";
type CqMax = `@max-${"3xs"|"2xs"|"xs"|"sm"|"md"|"lg"|"xl"|"2xl"|"3xl"|"4xl"|"5xl"|"6xl"|"7xl"}`;

export type TailwindContainerBreakpoint =
  | CqSize | CqMax
  | `@min-[${string}]` | `@max-[${string}]` | `@[${string}]`   // arbitrary
  | `${CqSize}/${string}` | `${CqMax}/${string}`;              // named scoping
```

No runtime change — `.at()` passes the string through. Pure type tightening.

**Before / After.**
```ts
.at("@mdd", t => t.flexDirection("row"))   // Before: compiles (silent bug)
.at("@md",  t => t.flexDirection("row"))   // After: autocompletes; "@mdd" is a compile error
.at("@sm/sidebar", t => …)                 // still valid (named scoping)
.at("@min-[475px]", t => …)                // still valid (arbitrary)
```

**Already in lib?** Partially — the variants *work*, but the type is open (no autocomplete/typo-guard). Tightening is new.
**Value.** High (autocomplete + typo protection for the most-used CQ surface; aligns with v6 closed-union direction). **Effort.** Small (type-only; verify extractor/eslint don't depend on the open template).

---

## Proposal C02-3 — `cq*` length units in arbitrary-value overloads

**Problem / evidence.** The unit overloads documented in CLAUDE.md (`w`, `h`, `minH`, `gap`, …) accept `px | rem | em | % | vh | vw | dvh | svh | lvh` (see unit handling in `tailwind-methods.ts` padding/sizing bodies, e.g. `:404` `p-[${value}${directionOrValue}]`). Container-query length units **`cqw cqi cqb cqh cqmin cqmax`** (MDN: Baseline 2023) are the natural sizing primitive *inside* a container and are absent from the unit set. Today you must drop to the `"[50cqw]"` escape hatch, losing the typed-number ergonomics.

**Proposed API.** Extend the unit union consumed by the sizing/spacing overloads:

```ts
type LengthUnit = "px"|"rem"|"em"|"%"|"vh"|"vw"|"dvh"|"svh"|"lvh"
  | "cqw"|"cqi"|"cqb"|"cqh"|"cqmin"|"cqmax";   // +CQ units (v4)
```

Emitted: `.w("cqw", 50)` → `w-[50cqw]`; `.h("cqb", 100)` → `h-[100cqb]`.

**Before / After.**
```ts
Div().w("[50cqw]")          // Before: stringly escape hatch
Div().w("cqw", 50)          // After: typed number + unit, parallels .w("rem", 12)
```

**Already in lib?** No — CQ units are not in the overload unit set (only the `"[…]"` escape hatch reaches them).
**Value.** Medium (completes the CQ story: container marker + variant + units). **Effort.** Small (widen one shared unit union; no per-method change since bodies are unit-agnostic).

---

## Top picks

- **C02-2 (closed `.at()` container-query union)** — highest value, type-only, gives autocomplete + typo-guard on the most-used CQ surface; aligns with v6 closed-union direction.
- **C02-1 (`@container-size` containment)** — only genuine *emit* gap in the area; small.
- **C02-3 (`cq*` units)** — rounds out the CQ ergonomics so sizing inside a container is typed, not stringly.

(Note: `@container`, `@container/{name}`, `@min-[…]`, `@max-[…]`, named scoping `@sm/{name}`, and `.at("@md", …)` are **already in lib (6.1.x)** — not re-proposed.)
