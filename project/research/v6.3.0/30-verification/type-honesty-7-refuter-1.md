# type-honesty-7 — Refuter 1 verdict: REFUTED

**Finding:** Id brand promises "no structural spoofing" but `isId` launders any `{id, selector}` object into a branded `Id`.

**Verdict: refuted.** The factual observation is correct (`isId` is structural), but the claimed defect — that the comment overstates a guarantee and that structural laundering has real consequences — does not hold up. The runtime brand's absence is already documented in the same module, no call site treats `isId` as a trust boundary, and a spoofed object gains nothing a plain string in the same slot doesn't already have.

## 1. The comment describes the compile-time brand, and the module already discloses the runtime story

The comment sits on the brand *property* of the `Id` interface (`src/ids.ts:24-25`) and is a statement about the type system — and there it is accurate: the `unique symbol` brand does prevent structural spoofing at compile time (a structural `{ id, selector, toString }` literal is not assignable to `Id` without a cast).

Three lines into the only producer, the module explicitly states the runtime situation (`src/ids.ts:50`):

```typescript
}) as unknown as Id; // cast is safe — brand is compile-time only
```

`createId` never attaches a runtime symbol at all, so `isId` *cannot* check one — this is a disclosed, coherent design ("brand is compile-time only"), not an overstatement. The finding cherry-picks the interface comment while ignoring the clarifying comment 25 lines below in the same file.

## 2. `isId` is a union discriminator, not a validity/trust gate

Every call site fronts a `string | Id` union where the *alternative branch is a raw string passed through equally verbatim*:

- `extractId(value: string | Id)` — ids.ts:148
- `extractSelector(value: string | Id)` — ids.ts:164
- `resolveSelector(value: string | Id | undefined)` — htmx.ts:321
- `Tag` ctor id (`isId(id) ? id.id : id`) — core/tag.ts:98
- `Partial(target: HxTarget | Id, …)` — patterns.ts:36-41

At runtime, being an `Id` confers **zero privilege**: a laundered `{id: "x", selector: "#x"}` object produces exactly the output that passing `"x"`/`"#x"` as a plain string produces — and plain strings are accepted by design at every one of these fronts. `Id` was never a sanitization or capability mechanism; there is nothing to "spoof" *into*.

Additionally, reaching these call sites with an arbitrary unknown-typed object (the "DB row") requires an `as`/`any` cast past the `string | Id` parameter type — at which point all type-level guarantees are void by definition. A real runtime Symbol would not survive `any` either at the type level; the failure scenario presupposes the caller has already opted out of the type system.

## 3. The one `unknown`-typed path is internally escaped, not a front door

`resolveId(value: unknown)` in `src/core/behavior-methods.ts:66-68` is an *internal* helper whose `unknown` is an artifact of the homogeneous `BehaviorRenderer: (options: Record<string, unknown>)` table. The **public** surface is strictly typed — `BehaviorMap` declares `target: Id` for every behavior (behavior-methods.ts:12-25), so typed callers cannot pass a structural object.

Even for a cast-through spoof: non-Id values fall back to `String(value)`, and the result is `escapeJs`-escaped (`el()` at behavior-methods.ts:70-72; escape.ts:51-58 escapes `\`, `'`, newlines, U+2028/9) before being embedded in `document.getElementById('…')`, and the whole `hx-on:*` attribute is attribute-escaped at render. No injection; worst case is an inert wrong id — identical to passing a wrong string.

## 4. ".selector emitted verbatim" — it isn't

All hx-target emission goes through `escapeAttr` at serialization (`src/render/serialize.ts:115,121,133`), and `Partial`'s `addAttribute("hx-target", selector)` is likewise attribute-escaped at render. A hostile `.selector` cannot break out of the attribute; it degrades to a non-matching CSS selector — the same blast radius as any string the API already accepts in those positions.

## 5. Structural `isId` is arguably the *safer* runtime choice

A module-private runtime Symbol (the finding's proposed fix) would make `isId` return `false` for `Id`s created by a duplicated copy of fluent-html in `node_modules` (a common npm dedup situation). `extractSelector` would then take the string branch and call `.startsWith` on an object — a crash for perfectly legitimate callers. The structural check trades a phantom spoofing risk (no runtime privilege exists to steal, § 2) for real cross-instance robustness.

## Residual

At most a one-word documentation nit: ids.ts:24 could append "(compile-time only; runtime guard is structural)". That clarification already exists at ids.ts:50. A wording preference is not a defect.

**Confidence: high.**
