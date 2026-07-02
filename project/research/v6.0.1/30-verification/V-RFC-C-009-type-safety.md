---
rfc: RFC-C-009
lens: type-safety
verdict: reject
confidence: 0.78
killer_objection: "FieldValue<T,K> silently collapses to bare `string` for any OPTIONAL literal-union field — and form values are `Partial<T>` by design, so optionality is the norm. The RFC's headline guarantee (off-union radio/hidden/option value = compile error, F-D-143) is false exactly where it matters most. Plus `array()` ships in api_surface with an undefined error-bag type the RFC itself defers to a human."
required_changes: []
---

# Verdict: RFC-C-009 — type-safety lens

> ADVERSARY pass. Default to reject under uncertainty.

## Attack

This RFC's entire selling point is "field-typed values: a typo is a compile error" (F-D-143, the
"Type-safety story" section, the worked examples with `✗ compile error` comments). Three of its
type-machinery claims do not hold under the shipped types.

### type-safety failure 1 (KILLER) — `FieldValue` degrades to `string` for every optional field

`FieldValue<T,K>` is defined as:

```ts
type FieldValue<T, K extends keyof T> = T[K] extends infer V
  ? V extends string ? V : string
  : string;
```

The inner `V extends string ? V : string` is a **distributive** conditional. For an optional
literal-union field — the most common shape in real form state — `T[K]` is
`"a" | "b" | undefined`. Distribution maps each member: `"a"→"a"`, `"b"→"b"`,
`undefined→string`. The union of the results is `"a" | "b" | string` ≡ **`string`**. The whole
narrowing collapses.

Verified against `tsc --strict`:

```ts
type T = { opt?: "a" | "b" };
declare function radio<K extends keyof T & string>(name: K, value: FieldValue<T, K>): void;
radio("opt", "c");   // ✅ COMPILES — should be a compile error per the RFC
```

This is not an edge case. `FormState<T>.values` is `Partial<T>` (forms.ts:317), the form-binding
domain is *prefill state*, and optional fields (`role?`, `status?`, nullable selects) are the
normal case for create/edit forms. So the RFC's central F-D-143 promise — "for a literal-union
field … `f.radio("role", "amdin")` is a compile error" — is **silently false for any field the
author marked optional**. It fails open (accepts garbage), which is the worst failure mode for a
type-safety feature: the author believes they have the guard and they do not. This directly
violates guardrail 4 ("no bare `string` where a literal union fits") in the one place the RFC
claims to enforce it.

### type-safety failure 2 — `checkbox(name, value?)` is structurally unsound

```ts
checkbox(name: keyof T & string, value?: string): InputTag;
```

The `value?` is supposed to discriminate "boolean field" (no value) from "`string[]` membership"
(with value), but nothing in the type ties `value`'s presence to the field's kind. Verified:

```ts
type T = { active: boolean; tags: string[] };
checkbox("active", "oops");   // ✅ compiles — nonsense on a boolean field
checkbox("tags");             // ✅ compiles — missing value on a string[] field, wrong runtime
```

Both miswirings compile and produce wrong HTML (a boolean checkbox gets a stray `value`; a
multi-checkbox group silently becomes a single boolean toggle). For a feature whose whole pitch is
"the most error-prone control, now type-safe," shipping an overload that admits the two obvious
errors is a regression in disguise.

### type-safety failure 3 — `array()` ships with an undefined error-bag type

`array` is in `api_surface` (line 10) and the worked example calls `row.error("sku")` reading
`errors.items[0].sku`. But the shipped `ErrorBag<T>` is flat:
`Partial<Record<keyof T & string, string>>` (forms.ts:314). So `errors.items` is typed
`string | undefined`, and `errors.items?.[0]` indexes a *string* (a char), not a per-row
`ErrorBag<Item>`. There is **no type** in the codebase that expresses the nested error bag the
`array` child binding needs. The RFC acknowledges this in Open Questions ("Nested error-bag shape …
Decision for a human") — i.e. the core type contract of a shipped api_surface symbol is
unresolved. You cannot land `array` additively without first changing `ErrorBag` to admit nested
shapes, which the RFC neither specifies nor proves additive. (A recursive/nested `ErrorBag` also
risks widening the *existing* flat `error(name)` reader's type — an unexamined back-compat surface.)

## Does it survive?

**Reject.** Two of the three are mechanically fatal and one is a self-admitted unresolved core
type. The RFC bundles five resolvers (F-C-140/141/142/143/F-D-143) into one high-impact landing,
and the type story that justifies the whole bundle is broken at its center:

- Failure 1 nullifies F-D-143 (the *named reason* `radio`/`hidden`/typed-option exist) for the
  common optional-field case. The fix is known and small (`FieldValue` must use
  `[T[K]] extends [infer V]` to block distribution, then strip `undefined` and re-check, e.g.
  `NonNullable<T[K]> extends string ? NonNullable<T[K]> : string`) — but it is a **substantive
  change to the load-bearing type**, not a wording tweak, so it does not pass as-is.
- Failure 2 means `checkbox` needs to be split by field kind (overloads keyed on
  `T[K] extends boolean` vs `T[K] extends readonly string[]`), again a real signature redesign.
- Failure 3 means `array` cannot ship in this RFC at all until `ErrorBag` gains a proven-additive
  nested form — which is a separate design the RFC defers to a human.

Under the lens's default ("a good API cut is cheaper than a bad API shipped"), the right move is to
send this back: split `array` out (it is not type-ready), fix `FieldValue` distribution and
`checkbox` discrimination, and re-submit. As written, it would ship a type-safety feature that
fails open on optional fields — strictly worse than the honest raw-input status quo, because it
advertises a guarantee it does not provide.

If the authors prefer `survives-with-changes`, the bar is: (a) `FieldValue` rewritten to be
non-distributive and `undefined`-stripping, with a `tsc` test proving `radio("opt","c")` errors for
`opt?: "a"|"b"`; (b) `checkbox` re-split so a boolean field rejects a `value` and a `string[]` field
requires one; (c) `array` removed from this RFC and re-scoped behind a defined, proven-additive
nested `ErrorBag`. Because (c) drops a headline api_surface item and (a)/(b) redesign the
signatures, I score this a reject rather than survives-with-changes — the type contract as
submitted is wrong, not merely incomplete.

## Guardrail check (type-safety, guardrail 4)

FAIL. The RFC introduces bare `string` precisely where it promises a closed union: optional
literal-union fields silently widen through `FieldValue`'s distributive conditional, and
`checkbox`'s `value?` admits kind-mismatched calls. The aria reuse of the closed `AriaAttributeName`
union (failure-free) and the non-optional `select`/`radio` paths are fine — but the guardrail is
owned here and the feature breaches it on the common case.
