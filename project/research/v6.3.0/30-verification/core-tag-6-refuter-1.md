# Verdict: core-tag-6 — NOT REFUTED (defect confirmed)

**Finding:** Mutation-based chaining with no `.clone()` — a reused Tag constant accumulates state across renders/requests.

**Mode:** refute-by-code-reading (adversarial). I attempted to find a check, guard, or documented semantic that makes this a non-issue. I could not; instead I positively reproduced the defect.

## Reproduction (against the built library, `dist/src/index.js`)

```js
const badge = Span('NEW').textColor('red-500');   // module-level shared instance
function Card() { return Div(badge.bold()); }      // component "styles" the shared tag
render(Card()); // <div><span class="text-red-500 font-bold">NEW</span></div>
render(Card()); // <div><span class="text-red-500 font-bold font-bold">NEW</span></div>
render(Card()); // <div><span class="text-red-500 font-bold font-bold font-bold">NEW</span></div>
```

Monotonic class accumulation across renders, exactly as the finding claims. In SSR this is cross-request state carried in a module-level singleton.

## Refutation attempts (all failed)

1. **Is there a guard in the chainable methods?** No. Every chainable method mutates `this` and returns `this` (`src/core/tag.ts`: `setId` L97, `addClass` L125-137 appends to `this.class`, `addStyle` L171, `addAttribute` L188, `apply` L288 passes `this` to the fns). No copy-on-write, no freeze, no dirty flag.
2. **Is there a clone/copy API under another name?** No. `grep -rn clone src/` matches only the `TailwindBoxDecoration` CSS type (`src/core/tailwind-types.ts:471`). No `copy`, `fork`, or equivalent on `Tag`. `.apply()` also mutates in place.
3. **Does render snapshot or protect the tree?** No — render is non-mutating but does nothing to prevent prior build-time mutation from persisting; the reproduction above goes through `render()` three times and the state accumulates.
4. **Is the hazard documented as intended semantics?** No. Neither `README.md` nor generated docs warn against reusing tag instances or say "export factories, not instances." Worse, `src/render/render.ts:34-35` ("a shared layout is safe to reuse across requests") actively advertises instance reuse — true only for render-time nonce injection, with no caveat that any chainable call on a shared instance persists forever.
5. **Is "mutable builder" a defensible convention that neutralizes the finding?** Partially — the ecosystem convention (components as plain functions, presets as `(t: Tag) => t...` helpers) means idiomatic code doesn't hit this. But the library neither prevents the misuse, nor provides an escape hatch (`clone()`), nor documents the hazard, and its own JSDoc encourages shared instances. A convention that exists only implicitly is not a guard.

## Verdict

**CONFIRMED.** The behavior is real, reproducible in three lines, and unguarded/undocumented. Severity framing in the finding is fair: silent, monotonic, cross-request state leak in SSR. The proposal (add `clone(): this`; document "export factories, not instances; clone before modifying a tag you don't own"; qualify the render.ts reuse claim) addresses it.
