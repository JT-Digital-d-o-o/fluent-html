# Spike: `defineTheme()` typed-token mechanism — empirical DX comparison

**Question.** How should a user-defined design token (e.g. a `forest` color) reach `.background("forest")` with **autocomplete + typo-as-compile-error**, and which approach has the best DX? This is the one unspecified, gating piece of v6's `defineTheme()` (curation §C-02).

**Method.** Four real, compiling spikes. Each has a faithful slice of fluent-html's actual color typing (`src/core/tailwind-types.ts`), a `.background(color: TailwindColor)` method, and the **same 6 usage cases**. `tsc --noEmit` reveals the accept/reject matrix (an erroring line = that case rejected). Run: `bash run.sh` (+ `tsc` on `01b`).

## The pivotal fact

fluent-html's `TailwindColor` is **already open** today:

```ts
export type TailwindColor =
  | "inherit" | "current" | "transparent" | "black" | "white"
  | `${TailwindColorName}-${TailwindShade}`
  | (string & {});   // ← "so custom theme colors work with fluent methods"
```

The `(string & {})` tail means `.background("forest")` **already compiles** — but so does `.background("frest")`. **You cannot get typo-checking without closing the union.** That is the whole tradeoff.

## Results (measured by `tsc` 5.9.3)

| # | Case | 00 open | 01 / 01b / 02 closed |
|---|---|:---:|:---:|
| 1 | `"blue-500"` known token | ✅ | ✅ |
| 2 | `"forest"` custom token | ✅ (no autocomplete) | ✅ **+ autocomplete** (real union member) |
| 3 | `"frest"` **typo** | ✅ **slips through** | ❌ **compile error** ✓ |
| 4 | `"[#1a2b3c]"` arbitrary | ✅ | ✅ |
| 5 | `"blue-500/50"` base+opacity | ✅ | ✅ |
| 6 | `"forest/50"` custom+opacity | ✅ | ✅ |

- **00 open (status quo / v5):** 0 errors — *everything* compiles, including the typo. **Fails the goal.**
- **01 / 01b / 02 closed:** *only* case 3 errors, in all three. **Identical, ideal matrix** — typo and ONLY typo rejected; custom tokens autocomplete; opacity + arbitrary still work.

**Closing the union is necessary and sufficient for type-safety. All three closed variants are type-safety-equivalent — they differ only in how the augmentation is maintained.**

## The four approaches

| | Type-safe? | Token source | Build step? | Staleness | Boilerplate |
|---|:---:|---|:---:|:---:|---|
| **00** open `(string & {})` | ❌ | n/a | no | n/a | none — but no safety |
| **01** closed + hand `declare module` | ✅ | **2 places** (call + augment, hand-synced) | no | none | the augment, **edited per token** |
| **01b** closed + `typeof`-derived augment | ✅ | **1 place** (`tokens` const) | no | **none** | the augment, **written once, derives forever** |
| **02** closed + codegen `.d.ts` | ✅ | **1 place** (`theme.config.ts`) | **yes** | window until regen | none (generated) |

### Cost of closing the union (visible in `01/fluent-mock.ts`)

What was **1 line** (`(string & {})`) becomes **5 arms** — base, custom, base+opacity, custom+opacity, arbitrary — and that is **per token family** (colors, spacing, radius, shadow, fonts each need the same). This is the real library-side cost, and it is a (greenfield-OK) breaking change to the type surface.

### 01b — the key discovery

A `declare module` augmentation **can** reference a module-local `typeof`:

```ts
const tokens = { forest: "#2d5016", brand: "#ff5500" } as const;
export const theme = defineTheme({ colors: tokens });

declare module "fluent-html" {
  interface FluentCustomColors extends Record<keyof typeof tokens, true> {}
}
```

So the augmentation **derives** from the same const that feeds `defineTheme`. One source, no codegen, **zero staleness** (tsc evaluates it live), full safety. The only residual is ~3 lines of *static* boilerplate written once — it never changes as tokens are added.

## Verdict

- **`defineTheme` must close the themeable unions** (colors + the other `@theme` families: spacing, fonts, radius, shadow) and ship an **augmentable interface per family**. Open `(string & {})` cannot deliver the curation goal.
- **Types: prefer 01b** (`typeof`-derived `declare module`). It beats 01 (no hand-sync drift) and 02 (no build step, no staleness window) for the type augmentation specifically.
- **CSS + manifest still need a build emit regardless** — the `@theme` block must be written to a `.css` Tailwind reads, and the safelist manifest feeds the extractor (C-01). So the recommended shape is a **hybrid**: live types via 01b in the user's `theme.ts`, and the `@theme` CSS + manifest emitted by the existing `fluentHtmlPlugin` (C-01) reading the same `tokens`.
- **Pure codegen (02) is the alternative** if zero `declare module` boilerplate is worth a staleness window — viable because the build step exists anyway for CSS/manifest. The fork (01b hybrid vs 02 pure-codegen) is a DX preference, not a capability difference.

## DECISION (locked)

**01b — closed unions + `typeof`-derived `declare module`, CSS/manifest via plugin.** `defineTheme` takes **design tokens only** (component presets stay user-land `.apply()`); the themeable unions close; the user's augmentation derives from the `tokens` const, one line **per family** (irreducible — proven in `01c`). Resolved spec: `40-synthesis/v6-spec.md` §C-02. Drop-in docs: `defineTheme.docs.md`. _(memory: v6-define-theme)_

## Files
- `00-open-union/` · `01-closed-declare-module/` · `01b-closed-typeof-derived/` (chosen) · `01c-multi-family/` (colors+spacing proof) · `02-closed-codegen/`
- `02-closed-codegen/{generated-theme.d.ts, theme.generated.css, theme.manifest.json}` — real codegen output
- `defineTheme.docs.md` — canonical README + guideline + template content (ready to ship with v6)
- `run.sh` — compiles 00/01/02 (run `tsc -p 01b-closed-typeof-derived` and `-p 01c-multi-family` for those)
