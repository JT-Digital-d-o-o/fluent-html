---
rfc: RFC-C-009
lens: instruction-set
verdict: reject
confidence: 0.72
killer_objection: "f.array() is not a primitive — it mints a server-side wire-format convention (name[i].field bracket notation) that core cannot parse back and a nested error-bag shape that breaks the public ErrorBag<T> contract. The naming convention is a body-parser opinion that belongs to the (out-of-scope) framework layer, and the error model is an unresolved 'decision for a human' that is not actually additive. The RFC bundles three sound primitives (checkbox/radio, typed values, aria) with one disqualifying component (array), and ships them as one additive 6.1.0 unit."
required_changes:
  - "Split the RFC: keep checkbox/radio, FieldValue typing of radio/hidden/select option values, and errored-only aria wiring (all true primitives, all additive). Drop f.array() entirely from this RFC."
  - "Park f.array() to a separate RFC blocked on the framework layer (P5 @fluent-html/fastify) where the body-parse convention (name[i].field) is round-trippable and owned, not invented in a zero-dep core that has no parser."
  - "Resolve the nested error-bag shape BEFORE array ships: ErrorBag<T> is publicly exported as Partial<Record<keyof T & string, string>> (flat string map). f.array reading errors[name]?.[i].sku requires errors.items to be ErrorBag<Item>[], which the flat ErrorBag<T> cannot express. Either ErrorBag<T> becomes recursive (a public-shape change — verify additive or park to major) or array carries a separate error API. This 'open question' is load-bearing, not deferrable."
  - "Confirm the multi-select bound-value contract (array | Set) as a single resolved shape, not an open question, before the widened select ships."
file: /Users/tony/jt-digital/fluent-html/product/research/v6.0.1/30-verification/V-RFC-C-009-instruction-set.md
---

# Verdict: RFC-C-009 — instruction-set lens

> Adversary stance: kill the RFC if it smuggles an opinionated component into a core that ships primitives. The bar for "belongs in core" is high; default to reject under uncertainty.

## Attack

**instruction-set failure mode 1 — `f.array()` mints a wire-format convention core cannot own.**
The behavioural contract (RFC line 118) is: `array` "builds a child `FormBinding` whose `input("sku")` emits `name="{name}[{i}].sku"`." That `name[i].field` bracket string is **not** type machinery — it is a serialization convention that only has meaning to a server-side body parser (qs-style bracket-depth, array-vs-object detection, dotted-vs-bracketed nesting). I verified core ships **zero runtime deps** and has **no body parser** anywhere in `src/` (no qs, no bracket-parse; the only `multipart` reference is the `enctype` string on `FormTag`). So core would emit a wire format it cannot itself round-trip. The component that decides this convention is precisely the framework/adapter layer — the **out-of-scope P5 `@fluent-html/fastify`** package, where the body parser lives. Per the v6 constitution (guardrail 6, and MEMORY: "no framework glue"; "core is a pure HTML builder"), minting a parse-dependent naming convention in core is exactly the opinionated-component-as-primitive move this lens exists to catch. `f.checkbox`/`f.radio` are genuine per-control primitives (name + value + checked); `f.array` is a stateful, convention-laden mini-framework with a lifecycle.

**instruction-set failure mode 2 — the bundled additive claim is false because of the unresolved error model.**
The RFC is routed `ships_to: 6.1.0` with `breaking: additive`, and the guardrail-check section asserts additive-only "pass." But its own **Open Questions** (RFC lines 263–264) leave the `array` nested error-bag shape and the multi-select bound-value shape as "decision for a human." The shipped public type `ErrorBag<T> = Partial<Record<keyof T & string, string>>` (forms.ts:314, exported from index.ts:274) is a **flat string map**. `f.array` reading `errors[name]?.[i].sku` is impossible against that type — it requires `errors.items` to be `ErrorBag<Item>[]`, i.e. ErrorBag<T> must become recursive. That is a **public-shape change to an exported type**, whose additivity is unverified. An RFC that claims "additive, verified non-breaking" while its load-bearing feature depends on an unresolved, likely-non-additive change to a public type has not earned the additive stamp. Under this lens, shipping a primitive whose contract is "decision for a human" is shipping a bad API.

**instruction-set failure mode 3 — bundling masks the weak member.**
checkbox/radio, FieldValue-typed option/radio/hidden values, and errored-only aria are clean, additive, primitive, and well-justified (the aria side-effect is strictly-more-correct, zero markup change on clean forms; FieldValue's `V extends string ? V : string` degrade preserves existing call sites; `SelectOption<V = string>` keeps the exported alias resolving). These would survive on their own. By packaging them with `f.array`, the RFC pressures a reviewer to wave the whole thing through. Adversarially, the bundle must be rejected so the disqualifying member (`array`) is excised rather than smuggled in on the strength of its siblings.

## Does it survive?

**reject** (confidence 0.72). The RFC as written does not survive: it ships an opinionated, parser-dependent component (`f.array`) as a "primitive," and its additive claim is contradicted by its own unresolved error-bag open question. The lens specifically forbids a component masquerading as a combinator, and `array` — index-prefix wire convention + nested error opinion + child-binding lifecycle — is that component.

It is rescuable as **two RFCs**: (a) a tight additive primitive RFC for checkbox/radio + typed values + aria (would survive this lens cleanly), and (b) a parked `array` RFC blocked on the P5 framework layer that actually owns the body-parse convention, with the `ErrorBag<T>` recursion resolved and version-classified first. Because the deliverable is a single bundled RFC making a false additive claim, the verdict is reject, not survives-with-changes — the split and the error-model resolution are structural, not edits that fold back into one RFC.

Confidence held below 0.8: the three sibling primitives are genuinely strong, so a reasonable reviewer could carve `array` out and pass the rest. The reject is on the RFC-as-submitted; the killer objection is `array` specifically.

## Guardrail check (instruction-set, owned by this lens)

- checkbox / radio / typed option-hidden-radio values / errored-only aria: **primitive — pass.** Per-control, no presentation, no styled shell (error `<span>` stays unstyled; styled FieldError remains user-land per forms.ts:368). These complete an existing combinator (`Form<T>`) with type machinery, not components.
- `f.select` widening (placeholder / optgroup / multiple): **borderline pass.** Placeholder/optgroup are structural HTML, not styling; multiple is a real attribute. Acceptable as primitive, but its bound-value shape (array | Set) must be resolved, not an open question.
- `f.array`: **FAIL.** Not a primitive. It invents a server-parser wire convention (`name[i].field`) that a zero-dep, parser-less core cannot round-trip — that convention belongs to the framework layer (P5), and the nested error model it needs breaks the public `ErrorBag<T>` shape. This is the opinionated component this lens rejects.
