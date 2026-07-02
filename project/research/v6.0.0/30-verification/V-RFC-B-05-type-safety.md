---
rfc: RFC-B-05
lens: type-safety
verdict: survives-with-changes
confidence: 0.78
killer_objection: "registerIcon(name: string, paths) is type-decoupled from the IconName union it feeds — registration and the type that gates Icon() never connect, so the augmentable-registry story is theater: a wrong name compiles at the registration site and a registered name fails to compile at the call site."
required_changes:
  - "Couple registration to the union, OR explicitly document that registerIcon is a pure runtime op and the declare-module augmentation is the ONLY thing that widens IconName. The RFC currently implies registerIcon('x', …) makes Icon('x') typecheck, which is false."
  - "Fix the phantom type: IconOptions.size?: TailwindSize | false references a type that does not exist (src/core/tailwind-methods.ts uses TailwindWidth/TailwindHeight; there is no TailwindSize). Use the actual token type or define TailwindSize and wire it into w()/h()."
  - "Remove the false F-B-044 claim that SvgShapeTag gains setStrokeLinecap/setStrokeLinejoin/setStrokeDasharray/setTransform — these ALREADY exist on SvgShapeTag (src/elements/svg.ts:31-44, 56-60). api_surface and §2 must only claim the genuinely-new setters (setStrokeOpacity, setStrokeDashoffset on SvgShapeTag; the five on SvgTag)."
  - "stroke/fill in IconOptions are bare string (lines 78-81). Either accept as an intentional escape hatch and say so, or narrow stroke to 'currentColor' | TailwindColor. As written it contradicts the RFC's own §11.4 self-check."
  - "Mandate the IconRegistry augmentation member value be `true` (or `unknown`) consistently; note keyof {} = never is the safe default so cross-module augmentations don't merge-conflict on member types."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-B-05-type-safety.md
---

# Verdict: RFC-B-05 — type-safety lens

> Adversary. Goal: kill RFC-B-05 through type-safety. Default reject under uncertainty.

## Attack

### Failure mode 1 (KILLER): the registry's type story is decoupled from its runtime API

The RFC's entire type-safety pitch (§"Type-safety story", first bullet):

```ts
declare module "fluent-html" {
  interface IconRegistry { "rideshare-logo": true; }
}
registerIcon("rideshare-logo", ["M12 2 …"]);
Icon("rideshare-logo")  // ✓ typed
```

But `registerIcon(name: string, paths: IconPaths): void` takes a **bare `string`**. There is no type-level link between calling `registerIcon` and widening `IconName`. The two steps are independent:

- The `declare module` block is what makes `Icon("rideshare-logo")` compile — pure type augmentation, zero runtime effect.
- The `registerIcon(...)` call is what makes it work at runtime — pure runtime effect, zero type contribution (param is `string`, accepts anything).

So all four broken states compile:
1. `registerIcon("rideshare-logo", …)` **without** the `declare module` → runtime-registered, but `Icon("rideshare-logo")` is a **compile error**. The icon exists but you can't name it.
2. The `declare module` **without** `registerIcon` → `Icon("rideshare-logo")` typechecks green, then **throws at runtime** ("Unknown registered icon"). Type says safe; render crashes.
3. `registerIcon("rideshcons-logo", …)` (typo) compiles fine — `name: string` catches nothing. The whole point of the union was to catch `Icon("serach")`; the registration side has no such guard, so app icons get the exact misuse builtins are protected from.
4. Two modules augment `IconRegistry` with different value types for the same key → declaration-merge conflict, opaque error far from either site.

Classic "two sources of truth the compiler can't reconcile" anti-pattern. The RFC sells augmentable type-safety but ships a `string` front door. Under §8 (default-reject under uncertainty; a credible objection on the §11.4 guardrail), this alone justifies blocking the RFC as written.

### Failure mode 2: `IconOptions.size?: TailwindSize | false` references a type that does not exist

`src/core/tailwind-methods.ts:139-142` types `w()`/`h()` with `TailwindWidth`/`TailwindHeight`. There is **no `TailwindSize`** anywhere in `src/`. The RFC's primary options type leans on a phantom. Either it only compiles because someone later invents a too-wide alias (inference rot), or it was never type-checked. A `size` token that doesn't share the real `w()`/`h()` vocabulary lets `Icon("x", { size: "4" })` and `.w("4")` diverge — undercutting the extractor-visibility win the RFC claims.

### Failure mode 3: the RFC fabricates a gap the codebase already closed

§2 and `api_surface` claim `SvgShapeTag` needs `setStrokeLinecap`/`setStrokeLinejoin`/`setStrokeDasharray`/`setTransform` (F-B-044). These **already exist** on `SvgShapeTag` (`src/elements/svg.ts:31-44`, `:56-60`), already typed as the correct literal unions. An RFC that misreports the current type surface can't be trusted on its "additive, nothing collides" claim — re-declaring an existing method with a different signature in a mixin is exactly how the §11.4 surface silently regresses (a colliding overload that narrows/widens an existing setter). The genuinely-missing setters are narrower than advertised (`setStrokeOpacity`, `setStrokeDashoffset`, and the `SvgTag`-root copies).

### Failure mode 4: bare-string options contradict the RFC's own §11.4 self-check

`stroke?: string` and `fill?: string` (lines 78-81) are bare `string` where a union ("currentColor" | color token) fits. The RFC's §11.4 self-check asserts "no bare `string` where a union fits" — false on its own face. Minor (color is a defensible escape hatch), but the self-check is wrong, and Wave-4 trusts those frontmatter checkmarks.

## Does it survive?

**survives-with-changes.** The direction is type-positive and additive — a literal `BuiltinIconName` union, enum-typed `setGradientUnits`/`setStrokeLinecap`, and killing the `icon?: string → Raw()` injection by typing slots as `View` are real wins no other RFC delivers. None of the four failures is unfixable; they are signature/wording defects, not architectural ones. But failure mode 1 is a genuine "wrong call compiles" hole at the center of the headline feature, and failure mode 3 means the surface inventory is factually wrong — both must fold back before roadmap entry. The required_changes are exact and self-contained.

## Guardrail check (§11.4 type-safety — this lens owns it)

**Fails as written**: bare `string` in `registerIcon` / `IconOptions.stroke` / `IconOptions.fill`, a phantom `TailwindSize`, and a registration path that doesn't narrow. With the five required changes applied, §11.4 passes: the union gates the call site, the registration path is either type-coupled or honestly documented as runtime-only, and no fabricated setter collides with the existing `SvgShapeTag` surface.
