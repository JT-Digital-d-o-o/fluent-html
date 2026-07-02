# tailwind-fidelity-2 — Refuter 1 verdict

**Finding:** `"only-child"` in `TailwindState` emits `only-child:` — not a Tailwind variant in any version.

**Verdict: CONFIRMED (refutation failed).**

## Refutation attempts and results

### 1. Is there a runtime remap in `.on()`? — No

`src/core/tailwind-methods.ts:519`:

```typescript
p.on = function (state: string, fn: (tag: Tag) => Tag) {
  return withVariant(this, state, fn);
};
```

`withVariant` (`src/core/tailwind-methods.ts:130-141`) concatenates the state string verbatim into `_variantPrefix`. There is no state→variant translation table anywhere in `src/` — `grep -rn "only-child" src/` hits only the type union at `src/core/tailwind-types.ts:223`. So `.on("only-child", t => t.margin("top", "2"))` renders the literal class `only-child:mt-2`.

### 2. Does Tailwind v4 actually accept `only-child:`? — No (empirically tested)

Compiled candidates against **Tailwind v4.3.1** (`/Users/tony/jt-digital/pm-gui/node_modules/tailwindcss`, `compile().build([...])`):

| Candidate | Result |
|---|---|
| `only-child:mt-2` | **No CSS emitted** (header comment only) |
| `only:mt-2` | `.only\:mt-2 { &:only-child { margin-top: … } }` |
| `only-of-type:mt-2` | compiles → `&:only-of-type` |
| `first-of-type:mt-2` | compiles → `&:first-of-type` |
| `last-of-type:mt-2` | compiles → `&:last-of-type` |

The finding's claim reproduces exactly: the union's neighbors `first-of-type` / `last-of-type` (same line 223) are valid variants; `only-child` is not.

### 3. Was it ever valid in v3 ("any version" claim)? — No

Tailwind **v3.4.19** (`jt-draw2/node_modules/tailwindcss/lib/corePlugins.js:153-156`) registers the variant as `["only", "&:only-child"]`. The variant *name* has always been `only`; `only-child` is only the CSS pseudo-class it maps to, never a candidate prefix.

### 4. Does the extractor/safelist tooling filter or remap it? — No

`fluent-html-tailwind-extractor/src` contains no `only-child` handling; `.on()` prefixes are extracted verbatim into the `@source inline(...)` safelist. Tailwind v4 silently ignores unknown candidates in `@source inline`, so the dead class is safelisted without error and without CSS — exactly the silent failure the finding describes.

### 5. Secondary check — ExtraPseudoState overlap

`src/core/tailwind-types.ts:431` already includes `"only"` and `"only-of-type"` in `ExtraPseudoState` (folded into `TailwindState` at line 242), so both *working* spellings type-check today. Deleting `"only-child"` loses nothing.

## Conclusion

No guard, remap, or semantic makes this a non-issue. `.on("only-child", …)` type-checks, renders a class Tailwind (v3 and v4) never matches, and silently applies no style. The proposal (delete `"only-child"` from the union at `src/core/tailwind-types.ts:223`) is correct; a remap to `only` inside `p.on` is unnecessary since the string never produced CSS, so no working code can depend on it.
