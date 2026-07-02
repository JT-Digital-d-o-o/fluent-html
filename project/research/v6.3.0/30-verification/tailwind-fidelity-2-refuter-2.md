# Verification: tailwind-fidelity-2 — `"only-child"` in TailwindState emits a dead variant

**Verdict: CONFIRMED (not refuted).** Reproduced end-to-end against dist/ and Tailwind 4.3.2.

## Reproduction

### 1. The string flows through verbatim — no remap exists

- `src/core/tailwind-types.ts:223` — `TailwindState` includes `| "first-of-type" | "last-of-type" | "only-child"`.
- `src/core/tailwind-methods.ts:519-520` — `p.on = function (state, fn) { return withVariant(this, state, fn); }` uses the state string directly as the class prefix; `withVariant` (line 130) only concatenates prefixes. `grep -rn "only-child" src/` finds no remapping anywhere — the only hit is the type union itself.

Runtime check against the built package (`dist/src/index.js`, v6.2.0):

```
render(Div('x').on('only-child', t => t.margin('top','2')))
→ <div class="only-child:mt-2">x</div>

render(Div('x').on('only', t => t.margin('top','2')))
→ <div class="only:mt-2">x</div>
```

### 2. Tailwind 4.3.2 produces zero CSS for `only-child:` and valid CSS for `only:` / `only-of-type:`

Fresh install of `tailwindcss@4.3.2` + `@tailwindcss/cli@4`, input:

```css
@import "tailwindcss" source(none);
@source inline("only-child:mt-2 only:mt-2 only-of-type:mt-2 mt-4");
```

Output (`grep mt- out.css`):

```
.mt-4              { margin-top: calc(var(--spacing) * 4); }
.only\:mt-2        { &:only-child   { margin-top: calc(var(--spacing) * 2); } }
.only-of-type\:mt-2{ &:only-of-type { margin-top: calc(var(--spacing) * 2); } }
```

`only-child:mt-2` is absent — Tailwind silently drops the unknown variant. The `mt-4` control proves the pipeline compiled candidates correctly. Note `only:` compiles to exactly `&:only-child`, i.e. `"only"` is the correct spelling for the intended pseudo-class, and it already exists in `ExtraPseudoState` (`src/core/tailwind-types.ts:431`) alongside `"only-of-type"`.

## Assessment of the finding's claims

| Claim | Result |
|---|---|
| `"only-child"` is a `TailwindState` member | Confirmed (tailwind-types.ts:223) |
| `.on("only-child", …)` type-checks and renders `only-child:` class | Confirmed via dist runtime probe |
| `only-child:mt-2` produces zero CSS in Tailwind 4.3.2 | Confirmed |
| `only:mt-2` and `only-of-type:mt-2` compile | Confirmed (`&:only-child` / `&:only-of-type`) |
| Tailwind's variant for `:only-child` is `only:` (all versions) | Confirmed for v4.3.2 by compilation; v3 also used `only:` per its documented variant set — `only-child:` has never been a core variant |
| `"only"` / `"only-of-type"` already present in `ExtraPseudoState` | Confirmed (tailwind-types.ts:431) |

## Conclusion

The defect is real: `.on("only-child", …)` compiles cleanly, renders `only-child:*` classes into markup, and those classes are dropped by Tailwind — the style silently never applies. The proposed fix (delete `"only-child"` from the union; `"only"` already exists as the working spelling) is sound. Since the string never produced CSS, removal cannot break any working code — it can only surface latent no-op call sites as compile errors, which is the desired outcome.
