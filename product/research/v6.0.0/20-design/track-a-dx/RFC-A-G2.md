---
id: RFC-A-G2
track: A
title: "Retire the addAttribute aria/data/style escape hatch — ESLint enforcement + typed aria keys + guideline reorder"
resolves: [F-A-004, F-A-017, F-A-052, F-A-055, F-A-064]
api_surface: ["Tag.prototype.setAria(attrs: AriaAttrs)", "AriaAttrs", "prefer-set-method (eslint rule, extended)"]
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md"]
impact: high
effort: M
depends_on: []
status: proposed
---

# RFC-A-G2: Retire the `addAttribute` aria/data/style escape hatch

## Problem

The library already ships typed bulk-setters for the three most common non-standard attribute patterns, but apps reach for `addAttribute("…", …)` instead because nothing enforces the idiomatic path and the guideline presents the escape hatch first.

- `setDataAttrs(attrs)` exists (`fluent-html/src/core/tag.ts:275`) and auto-converts camelCase → `data-kebab-case`. **62 `addAttribute("data-*")` call-sites vs 4 `setDataAttrs` calls** across rideshare/jt-draw/glimm/ttl/planet-positive-sport (F-A-055); 351 across the wider census (F-A-004).
- `setAria(attrs)` exists (`tag.ts:298`). **45 `addAttribute("aria-*")` vs ~55 `setAria`** — roughly 1:1 instead of near-zero (F-A-004, F-A-052, F-A-017).
- `setStyle(string)` / `setStyles({})` exist (`tag.ts:125,249`). **14 `addAttribute("style", …)` call-sites** in storysell-ai/jt-cut (F-A-064) — and these silently *double-render* style because `addAttribute` writes `attributes["style"]` while `setStyle` writes the dedicated `style` field; the renderer emits both.

Real cited boilerplate:

```ts
// rideshare/src/shared/components/phone-input.view.ts:66-69
.addAttribute("data-min", String(m?.minLen ?? 6))
.addAttribute("data-max", String(m?.maxLen ?? 15))
.addAttribute("data-ph",  m?.placeholder ?? "")
.addAttribute("data-name", c.name)

// rideshare/src/shared/components/layout.view.ts:463-465
.addAttribute("role", "dialog")
.addAttribute("aria-modal", "true")
.addAttribute("aria-label", "Navigation menu")

// storysell-ai/src/shared/components/molecules/ui.molecules.nav.ts:131
.addAttribute("style", `width: ${widthPercent}%; transform: translateX(${activeIndex * 100}%)`)
```

Root causes, per the findings:
1. **No tooling.** `prefer-set-method` (`fluent-html-eslint-plugin/src/rules/prefer-set-method.ts`) maps **exact** attribute names only (`type`→`setType`, …). It has zero `data-*` / `aria-*` / `style` coverage, so the escape hatch is never flagged or auto-fixed (F-A-004).
2. **Guideline ordering.** `web-development/fluent-html.md:42-44` lists `.addAttribute("data-x", …)` *before* `setDataAttrs`/`setAria` with the comment `// custom attributes only` — but `data-*` *are* custom attributes in a dev's mind, so the comment doesn't exclude them. There is no ✗ anti-pattern line (F-A-017, F-A-052, F-A-055).
3. **`setAria` keys are unchecked `string`.** Misspelling `{ lable: "x" }` compiles and renders `aria-lable` (F-A-052 notes the missing key validation).

This is an **adoption gap**, not a missing feature. The fix is: make the escape hatch lint-flagged + auto-fixable, tighten `setAria`'s key type, and reorder the guideline so the typed path is taught first.

## Proposed API

No new runtime methods. One type tightening + one ESLint rule extension.

### 1. `setAria` — literal-union keys (additive, source-compatible)

```ts
// fluent-html/src/elements/html-types.ts (new export)
export type AriaAttribute =
  | "label" | "labelledby" | "describedby" | "description" | "details"
  | "hidden" | "expanded" | "selected" | "checked" | "pressed" | "current"
  | "disabled" | "readonly" | "required" | "invalid" | "live" | "atomic"
  | "busy" | "controls" | "owns" | "haspopup" | "modal" | "level"
  | "valuemin" | "valuemax" | "valuenow" | "valuetext" | "orientation"
  | "sort" | "rowcount" | "colcount" | "rowindex" | "colindex"
  | "setsize" | "posinset" | "placeholder" | "roledescription" | "keyshortcuts"
  | "activedescendant" | "colspan" | "rowspan" | "multiselectable" | "autocomplete"
  | "relevant" | "dropeffect" | "grabbed" | "flowto" | "errormessage";

// camelCase keys map to the kebab aria-* attribute (labelledby → aria-labelledby).
// `(string & {})` keeps the escape hatch open for rare/future aria-* keys without
// losing autocomplete on the known set.
export type AriaAttrs = Partial<Record<AriaAttribute, string | boolean>> &
  Record<`${string}`, string | boolean>;
```

```ts
// fluent-html/src/core/tag.ts — signature change only (impl unchanged)
setAria(attrs: AriaAttrs): this;
```

> `role` is **not** an aria attribute and is out of scope here (it needs its own `setRole` — tracked separately as F-A-051). The lint rule below leaves `addAttribute("role", …)` alone.

### 2. `prefer-set-method` — prefix + style coverage with auto-fix

Extend the existing rule (no new rule name, no config change for consumers — it's `recommended`):

```ts
// fluent-html-eslint-plugin/src/rules/prefer-set-method.ts (additions)

// (a) exact-name additions
const ATTRIBUTE_TO_METHOD = { /* …existing… */ style: "setStyle" };

// (b) prefix → bulk-setter, with camelCase key extraction
const PREFIX_TO_BULK: ReadonlyArray<{ prefix: string; method: string }> = [
  { prefix: "data-", method: "setDataAttrs" },
  { prefix: "aria-", method: "setAria" },
];

// kebab → camel for the object key:  "user-id" → "userId"
function toCamel(suffix: string): string {
  return suffix.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
```

Behavior:

```ts
// single call → bulk-setter with a one-key object (auto-fix)
.addAttribute("data-user-id", x)   →  .setDataAttrs({ userId: x })
.addAttribute("aria-label", x)     →  .setAria({ label: x })
.addAttribute("style", s)          →  .setStyle(s)

// run of consecutive same-prefix calls on one chain → merged (auto-fix)
.addAttribute("data-min", a).addAttribute("data-max", b)
   →  .setDataAttrs({ min: a, max: b })

// not touched: role, hx-*, dynamic (non-literal) keys, on* (already blocked at runtime)
```

The fixer only merges a run when every member is a literal-key `addAttribute(<prefix>…)` directly chained on the same receiver (adjacent `MemberExpression` chain), so it never reorders across non-`addAttribute` calls.

## Worked examples (before → after)

```ts
// before — rideshare/src/shared/components/phone-input.view.ts:66-69
.addAttribute("data-min", String(m?.minLen ?? 6))
.addAttribute("data-max", String(m?.maxLen ?? 15))
.addAttribute("data-ph",  m?.placeholder ?? "")
.addAttribute("data-name", c.name)
```
```ts
// after — single typed object, auto-fixed by eslint --fix
.setDataAttrs({
  min:  String(m?.minLen ?? 6),
  max:  String(m?.maxLen ?? 15),
  ph:   m?.placeholder ?? "",
  name: c.name,
})
```

```ts
// before — rideshare/src/shared/components/layout.view.ts:463-465
.addAttribute("role", "dialog")            // ← left as-is (not aria; see F-A-051)
.addAttribute("aria-modal", "true")
.addAttribute("aria-label", "Navigation menu")
```
```ts
// after
.addAttribute("role", "dialog")
.setAria({ modal: "true", label: "Navigation menu" })   // typed keys, one call
```

```ts
// before — storysell-ai/src/shared/components/molecules/ui.molecules.nav.ts:131
.addAttribute("style", `width: ${widthPercent}%; transform: translateX(${activeIndex * 100}%)`)
```
```ts
// after — no double-render (writes the dedicated style field, not attributes["style"])
.setStyle(`width: ${widthPercent}%; transform: translateX(${activeIndex * 100}%)`)
// or, structured:
.setStyles({ width: `${widthPercent}%`, transform: `translateX(${activeIndex * 100}%)` })
```

## Type-safety story

- **Literal-union aria keys.** `setAria({ lable: "x" })` was previously accepted (`Record<string, …>`); with `AriaAttrs` the known camelCase keys (`label`, `expanded`, `modal`, …) autocomplete and typos surface in IDE/tsc, while `(string & {})` preserves the escape hatch for rare/future `aria-*` names. Mirrors the library's `(string & {})` Tailwind-token pattern (recon §2.7).
- **`aria-expanded` value gotcha documented in types.** Values stay `string | boolean`; the existing `String(value)` impl already turns `"false"` and `false` into the literal `"false"` HTML wants. The guideline below shows the `"false"`-string idiom so LLMs don't emit `expanded: false` expecting it to remove the attribute.
- **Compile-error-by-lint, not by type.** `data-*` keys remain free-form strings (data attributes are app-defined), so the *enforcement* for `data-*`/`style` is the ESLint rule, not the type system — the rule is `fixable: "code"`, so `eslint --fix` migrates them mechanically.
- **No `any` introduced.** `AriaAttrs` is a precise intersection; `setAria` impl is unchanged.

## Migration & compatibility

**Additive — nothing breaks.**

- `setAria(attrs: AriaAttrs)` is *wider-compatible* than `Record<string, string | boolean>`: every previously-valid call still type-checks (the `Record<\`${string}\`, …>` arm accepts any string key). Pure signature refinement, runtime impl untouched. No `breaking-changes.md` entry.
- `addAttribute("data-*"/"aria-*"/"style", …)` **keeps working** — it's only *lint-flagged*, never removed. Apps that don't run the plugin are unaffected.
- ESLint rule change is a tooling/dev-dependency change (guardrail §11.1 explicitly allows extractor/eslint dev deps). Consumers on `recommended` get the new flags on next plugin bump; the fixer auto-migrates via `eslint --fix`.

**Codemod:** the ESLint auto-fixer *is* the codemod. One command migrates every cited call-site:

```bash
eslint --fix "src/**/*.ts"   # rewrites addAttribute("data-*"/"aria-*"/"style") → typed setters
```

## Guidelines impact

Adoption note: the old guideline put `addAttribute` *first* in the Universal-methods block with `// custom attributes only`. LLMs (and devs) copy the first example, and `data-*` reads as "custom", so the escape hatch became the default. Fix = reorder (typed setters first), add explicit ✗ lines, and state the rule in the index.

### Index — `web-development/CLAUDE.md`

Add a rule next to the existing "Specialized tag methods" block (after line 89, before `formFor<T>()`):

```md
**`data-*` / `aria-*` / `style`** — typed setters, never `addAttribute`:
```typescript
.setDataAttrs({ userId: "123", action: "save" })   // ✓ data-user-id, data-action (auto kebab-case)
.setAria({ label: "Close", expanded: "false" })    // ✓ aria-label, aria-expanded (use the "false" string)
.setStyle(`width: ${pct}%`)                         // ✓ dynamic inline style (string)
.setStyles({ backgroundColor: color })             // ✓ object (camelCase -> kebab-case)

.addAttribute("data-user-id", "123")               // ✗ verbose, manual kebab
.addAttribute("aria-label", "Close")               // ✗ use setAria
.addAttribute("style", `width: ${pct}%`)           // ✗ double-renders against setStyle
```
`addAttribute` is the last-resort escape hatch — only for attrs with no typed setter (e.g. `role`, web-component props). `eslint --fix` auto-migrates the above.
```

### Topic ref — `web-development/fluent-html.md`

Replace the Universal-methods block (lines 32-45) so typed setters lead and the escape hatch is demoted + annotated:

```md
**Universal methods** on all tags:

```typescript
Div()
  .setId("my-id")
  .setClass("a b")                 // replace all classes
  .addClass("c")                   // append class
  .setClasses(["a", "b", false])   // filter falsy values
  .setStyle(`width: ${pct}%`)      // ✓ string (dynamic values fine)
  .setStyles({ backgroundColor })  // ✓ object (camelCase -> kebab-case)
  .setDataAttrs({ userId: "123" }) // ✓ data-user-id="123" (auto kebab-case)
  .setAria({ label: "Close", expanded: "false" }) // ✓ aria-label (note: "false" string, not boolean)
  .addAttribute("role", "dialog")  // escape hatch — ONLY when no typed setter exists
```

✗ never reach for `addAttribute` when a typed setter exists:

```typescript
.addAttribute("data-user-id", "123")          // ✗ → .setDataAttrs({ userId: "123" })
.addAttribute("aria-label", "Close")          // ✗ → .setAria({ label: "Close" })
.addAttribute("style", `width: ${pct}%`)      // ✗ → .setStyle(...) (addAttribute double-renders style)
.addAttribute("data-a", x).addAttribute("data-b", y)  // ✗ → .setDataAttrs({ a: x, b: y }) (batch)
```

- `setDataAttrs` / `setAria` batch multiple attrs in one call and auto-convert camelCase → kebab.
- `setAria` keys autocomplete to known ARIA names; `aria-expanded`/`aria-pressed` want the **string** `"false"`, not boolean `false`.
- `addAttribute` is enforced by the `prefer-set-method` ESLint rule — `eslint --fix` rewrites the ✗ forms automatically.
```

## Guardrail check

- **§11.1 zero-deps:** PASS — no lib runtime dep; only the eslint dev-plugin changes (allowed).
- **§11.2 ssr-only / fast sync path:** PASS — no render-path change; `setAria` impl untouched.
- **§11.3 escape-by-default:** PASS — typed setters route through the same escaping as `addAttribute`; no new raw sink. Steering apps off `addAttribute("style")` *removes* the double-render bug.
- **§11.4 type-safety:** PASS — `AriaAttrs` adds a literal union with `(string & {})` escape; no `any`.
- **§11.5 backward-compat:** PASS — additive; `setAria` signature is strictly wider-compatible; `addAttribute` retained.
- **§11.6 idioms:** PASS — reinforces "typed setters over `addAttribute"; auto-fixer codifies it.
- **§11.7 class-string contract:** N/A — emits no new Tailwind classes; no extractor/Track-C impact.
- **§11.8 guideline-sync:** PASS — `## Guidelines impact` patches `CLAUDE.md` (index rule + ✓/✗) and `fluent-html.md` (full block) covering all of `api_surface` (`setAria`/`AriaAttrs`, and the rule); `guideline_updates` frontmatter set.

## Alternatives considered

- **Separate rules `prefer-data-attrs` / `prefer-aria-attrs` / `prefer-set-style`** (F-A-004's first idea). Rejected: three rules to register, document, and keep in sync; the existing `prefer-set-method` already owns "addAttribute → typed setter" and is `recommended`. Extending it is one config-free upgrade for consumers.
- **Guideline-only fix** (F-A-017/052/055/064's "rough idea"). Necessary but insufficient — the findings show the gap *persisted while the guideline already mentioned the methods*. Without the lint flag the escape hatch stays the path of least resistance (F-A-004's core point). We do both.
- **Deprecate/throw on `addAttribute("data-*"/"aria-*"/"style")` at runtime.** Rejected: breaking (§11.5), and `addAttribute` is the legitimate escape hatch for `role`, web-component props, and unknown-prefix attrs. Lint warns; runtime stays permissive.
- **Strict literal-union keys for `setDataAttrs` too.** Rejected: data attributes are app-defined and open-ended; a closed union would force `addAttribute` back. Enforcement there belongs to the (fixable) lint rule, not the type.

## Open questions

- Should the `setAria` value type *narrow* boolean-ish aria attrs (`expanded`, `pressed`, `selected`, `checked`) to the literal `"true" | "false" | boolean` to kill the `expanded: false` footgun at the type level? Leaning yes but it widens `AriaAttrs` complexity — defer to implementation.
- Should the auto-fixer collapse a `data-*` run even when interleaved with unrelated chained calls (reordering)? Current design only merges strictly-adjacent runs to stay behavior-preserving. Confirm that's acceptable for the census's multi-attr cases (phone-input is adjacent, so covered).
