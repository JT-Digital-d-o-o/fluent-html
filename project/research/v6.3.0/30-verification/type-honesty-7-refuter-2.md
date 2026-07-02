# Verdict: type-honesty-7 — NOT REFUTED (confirmed by reproduction)

**Finding:** Id brand promises "no structural spoofing" but `isId` launders any `{id, selector}` object into a branded `Id`.

**Mode:** refute-by-reproduction, against `dist/` (current build — `dist/src/ids.js` matches `src/ids.ts`, incl. the line-24 comment in `ids.d.ts:16`).

## Runtime probe (Node, against dist)

```js
const dbRow = { id: "42", selector: "tr[data-user] input[onfocus=alert(1)]" };
isId(dbRow)                    // → true
extractId(dbRow)               // → "42"
extractSelector(dbRow)         // → "tr[data-user] input[onfocus=alert(1)]"  (verbatim)
render(Partial(dbRow, Div("x")))
// → <hx-partial hx-target="tr[data-user] input[onfocus=alert(1)]" hx-swap="outerMorph">…
render(Button("t").behavior("toggle", { target: dbRow }))
// → <button hx-on:click="document.getElementById('42').classList.toggle('hidden')">…
isId("#x")                     // → false (control)
```

Every claimed behavior reproduced: a plain structural object passes `isId` (src/ids.ts:127-136 checks only `'id' in value && 'selector' in value` + both strings), its `.selector` is emitted verbatim through `extractSelector` (ids.ts:164-174) and `Partial` (src/patterns.ts:41), and `resolveId(value: unknown)` (src/core/behavior-methods.ts:66-68) accepts it.

## Compile-time probe (tsc --strict)

```ts
extractSelector(dbRow);        // @ts-expect-error HELD — brand blocks unbranded object
Partial(dbRow, Div("x"));      // @ts-expect-error HELD — brand blocks unbranded object

const fromJson: unknown = JSON.parse('{"id":"42","selector":"tr[data-user]"}');
if (isId(fromJson)) {
  const branded: Id = fromJson;  // compiles — the guard hands out the brand
}
```

`tsc` passed with both `@ts-expect-error` markers holding, and the `isId`-narrowing branch compiling. So the unique-symbol brand does its job for **statically typed** values, but the `value is Id` guard is exactly the laundering path the finding describes: any `unknown`-typed structural match acquires the brand.

## Assessment

- The comment at src/ids.ts:24-25 ("Prevents structural spoofing — only `createId`/`defineIds` produce valid Ids") is accurate for the compile-time type surface but **overstates the runtime guard**, which is purely structural. The finding's core claim is factually correct and reproducible.
- Severity context (not a refutation): reaching the laundering path requires an `unknown`/`any`-typed value (JSON payload, DB row, `as any`) flowing into `isId`/`Partial`/behavior options — typed call sites (`extractSelector(dbRow)`, `Partial(dbRow, …)`, `behavior("toggle", { target })` where `target: Id`) are rejected by the brand. So this is a type-honesty/documentation defect plus a runtime-hardening gap, not a hole in the static type system.
- `createId` itself acknowledges the design at src/ids.ts:50: `as unknown as Id; // cast is safe — brand is compile-time only` — the ids.ts:24 comment contradicts this internal admission.
- Minor anchor nit: the finding cites `behavior-methods.ts:66-68`; actual path is `src/core/behavior-methods.ts:66-68`. Lines and content match.

**Verdict: refuted = false.** Both proposed remedies in the finding (real `Symbol` marker tested in `isId`, or softening the comment) are viable; the comment fix is the minimal truth-restoring change, while a module-private symbol would make the runtime guard match the documented promise (at the cost of `isId` no longer accepting structurally-valid Ids that crossed a realm/duplicate-package boundary).

Probes: `/private/tmp/claude-501/-Users-tony-jt-digital-fluent-html/f2f45330-dea1-49ee-a197-fd7d0ee2bfc5/scratchpad/probe-runtime.mjs`, `…/probe-types2.ts`.
