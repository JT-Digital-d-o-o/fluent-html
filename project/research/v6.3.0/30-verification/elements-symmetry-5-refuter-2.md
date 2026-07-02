# Verdict: elements-symmetry-5 — CONFIRMED (refutation failed)

**Finding:** `<ol start/type>` and `<li value>` are unreachable without `addAttribute` while the companion boolean `reversed` is a typed toggle.

**Mode:** refute-by-reproduction (tsc probe + runtime render against the built package `dist/`).

## Reproduction

Probe package at scratchpad `probe/` installing `fluent-html` via `file:/Users/tony/jt-digital/fluent-html` (resolves the real `dist/src/index.d.ts` typings).

### 1. Typed setters do not exist (compile errors — exactly as claimed)

```ts
import { Ol, Li } from "fluent-html";
Ol().setStart(5);   // error TS2339: Property 'setStart' does not exist on type 'Tag'.
Ol().setType("a");  // error TS2339: Property 'setType' does not exist on type 'Tag'.
Li().setValue(3);   // error TS2339: Property 'setValue' does not exist on type 'Tag'.
```

`dist/src/elements/lists.d.ts` confirms `Ol` and `Li` return plain `Tag` — no `OlTag`/`LiTag` class exists anywhere in `src/` or `dist/`.

### 2. The boolean half IS first-class, and `addAttribute` is the only escape hatch (compiles and runs)

```ts
render(Ol(Li("a")).toggle("reversed"));                              // <ol reversed><li>a</li></ol>
render(Ol(Li("x")).addAttribute("start", "5").addAttribute("type", "a")); // <ol start="5" type="a"><li>x</li></ol>
render(Li("y").addAttribute("value", "3"));                          // <li value="3">y</li>
```

`tsc --strict` on the pass-probe: exit 0. Runtime output matches above.

## Evidence anchors verified

- `src/elements/lists.ts:9-15` — `Ol`/`Li` return plain `Tag` via `El(...)`, no specialized class. ✓
- `src/elements/html-types.ts:222-227` — `BooleanAttribute` is a closed union that includes `'reversed'`, whose only HTML host is `<ol>`. ✓
- Sibling asymmetry: `src/elements/tables.ts:43` `ThTag.setColspan(colspan: number)` and `ColTag` + `defineSchemaKeys(ColTag, ['span'])` (tables.ts:137-146) give tables full typed numeric setters. ✓
- No `setStart` on base `Tag` (`dist/src/core/tag.d.ts`); the existing `setType` overloads live only on unrelated tag classes (Link/Style/Script/Embed/Source/Input/Button/A) and none is reachable from `Ol()`. ✓

## Conclusion

Every element of the finding reproduces: the boolean ordered-list attribute is typed and closed-union-checked, while the numeric/enum halves (`start`, `type`, `value`) require untyped `addAttribute` string plumbing — a genuine API asymmetry versus the fully-typed table setters. The proposal (OlTag with `setStart`/`setType`, LiTag with `setValue`, via `defineSchemaKeys` like `ColTag`) is consistent with the existing pattern.

**refuted = false, confidence = high.**
