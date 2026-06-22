---
rfc: RFC-D-05
lens: type-safety
verdict: survives-with-changes
confidence: 0.74
killer_objection: The HxStatusKey literal union only fires its compile error on direct object literals (excess-property check). Every realistic construction path — a function returning Record<string,string>, an assignment from a loose {[k:string]:string}, a cast — widens straight into HxStatus with a malformed/injection key and compiles clean. The RFC's "makes a malformed status key a compile error" claim is false for exactly the code shape (controller-built status maps) where the bug occurs. The type is theater on top of the real defense, which is the runtime throw.
required_changes:
  - "Demote the HxStatusKey type-safety claim: it is an editor/literal-time guard, NOT a soundness guarantee. The serialize-time regex throw in buildHtmx is the load-bearing defense and MUST be mandatory (not 'ALSO'), since widening defeats the type on every non-literal call path. Reword the Type-safety story and §11.4 accordingly."
  - "Fix the self-contradiction: the proposed rebuildTag body uses `(tag as any)[sk] = attrs[sk]` (line 71) and `(X as any)._sk` writes, yet line 168 / §11.4 claim 'No new any'. Either (a) give schemaKeysFor/registerSchemaKeys a typed write helper that contains the cast in ONE audited spot and restate the claim as 'no new any at call sites; one internal cast in the schema-key registry', or (b) drop the 'no new any' claim. As written it is false."
  - "Constrain the union to valid HTTP status space. `${1|2|3|4|5}${Digit}${Digit}` admits 599, 100, 199, 511-599 etc. and EXCLUDES nothing 1xx wants — but more importantly it admits non-existent codes (e.g. 555) while rejecting real edge usage. State explicitly whether the union is meant as 'syntactically code-shaped' (then say so) or 'valid HTTP codes' (then it is wrong and oversells). Resolve Open Question 2 before merge; an unresolved union width is a type-surface decision, not an implementation detail."
  - "rebuildTag's `attrs: Partial<TagAttrs>` parameter is bare-typed: the custom-attribute path (`tag.attributes[key]=String(v)`) accepts any string key at the type level and relies entirely on the RUNTIME validateAttributeKey throw. That is acceptable (it mirrors addAttribute) but the RFC must NOT list this under 'type-safety' wins — validateAttributeKey is a runtime guard, not a type. The escape-by-default lens owns it; the type-safety story should stop implying the fold layer is now type-safe against bad keys when it is runtime-safe."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-D-05-type-safety.md
---

# Verdict: RFC-D-05 — type-safety lens

> Adversary brief: kill RFC-D-05 through the type-safety failure mode. Default to reject under uncertainty.

## Attack

The RFC's security/correctness substance is real (I verified the source: `src/htmx.ts:245` is bare `Record<string, …>`; `src/core/behavior-methods.ts:43,52` interpolate without `escapeJs` while `:62` escapes; `src/core/tag.ts:20-29` shows the core guard the fold layer skips). The bugs exist. My attack is narrower and lethal to the RFC's *type-safety narrative*, which is one of its named selling points and a §11.4 guardrail self-check.

- **type-safety failure mode 1 — `HxStatusKey` is a literal-only guard masquerading as a soundness guarantee.** I compiled the exact proposed union against project tsc. The good news the RFC promises holds for direct literals: `{ "422 onfocus=alert(1) x": "y" }` and `{ "foo": "y" }` both error (TS2353 excess-property). But that error is an *excess-property check on object literals*, not a property of the type. Every path that loses the "fresh literal" status compiles clean with a malformed, injection-bearing key:

  ```ts
  function buildStatusMap(cfg: Record<string, string>): HxStatus { return cfg; }   // ✓ compiles
  const x: HxStatus = loose;                  // loose: {[k:string]:string}         // ✓ compiles
  const m = { "422 evil=x": "y" } as Record<string, string>; const y: HxStatus = m; // ✓ compiles
  ```

  All three produced **zero errors** (verified, project `tsc --strict`). This is not a contrived edge — it is *the* realistic shape: a Fastify controller building a status→target map from config, route metadata, or an upstream `Record`. The RFC's own §"Type-safety story" line 164 asserts the union "makes a malformed status key a compile error (guardrail §11.4: no bare `string`...)." That sentence is false for the construction pattern the original bug lives in. The union catches the careless inline typo and nothing else.

- **type-safety failure mode 2 — the RFC contradicts its own "No new `any`" claim.** Line 168 and §11.4 both assert "no new `any`." But the proposed `rebuildTag` body (lines 71–72) is literally `(tag as any)[sk] = attrs[sk]` and `tag._sk = ...` via the same cast family. The RFC waves at "reuses the existing single internal cast pattern," but a cast pattern *is* an `any`-escape; you cannot simultaneously claim the guardrail (§11.4 "no new `any`") passes and write `as any` in the API body. The claim and the code disagree. A type-safety verifier cannot pass a §11.4 self-check that is internally inconsistent.

- **type-safety failure mode 3 — union width is unresolved and oversold.** `${1|2|3|4|5}${Digit}${Digit}` admits `100`, `199`, `555`, `599` — codes that are either nonexistent or that the RFC's own Open Question 2 admits "apps only use 4xx/5xx." So the union is simultaneously (a) too wide to mean "valid HTTP status" and (b) marketed in the Type-safety story as the precision win. An unresolved Open Question on the *shape of an exported type* is a type-surface decision that must close before merge — you cannot ship `export type HxStatusKey` with "keep wide or restrict?" pending, because narrowing it later is the breaking change the RFC claims to avoid.

- **type-safety failure mode 4 (minor) — `rebuildTag(attrs: Partial<TagAttrs>)`'s custom-attr key path is bare `string`-keyed and relies wholly on the runtime `validateAttributeKey` throw.** This is fine engineering (it mirrors `addAttribute`), but it is filed under "type-safety" wins. The fold layer becomes *runtime*-safe against bad keys, not *type*-safe. The RFC should not let the escape-by-default win double-count as a type-safety win.

## Does it survive?

**survives-with-changes.** I cannot reject: the underlying refactor is sound, the bugs are real and verified, and — critically — the RFC did keep a runtime `buildHtmx` regex throw and a runtime `validateAttributeKey` throw as the actual load-bearing defenses. So even though the *types* are weaker than advertised, the security outcome does not depend on the types. That is precisely why this is `survives-with-changes` and not `reject`: the holes I found are in the RFC's *claims and type-surface*, not in its security guarantee.

But the type-safety story as written is partly false (failure modes 1, 2) and partly undecided (3), and §11.4 is self-contradictory (2). Those fold back as required changes. The single most important: **stop selling `HxStatusKey` as a compile-time guarantee** — demote it to an editor-time/literal-time guard and make the runtime throw mandatory and primary, because widening defeats the type on every non-literal call path.

## Guardrail check (§11.4 type-safety — this lens owns it)

§11.4 **does not pass as claimed.** Three defects against the self-check:
1. "no bare `string` where a literal union fits" — only honored for literals; widened/computed/cast keys bypass the union silently (verified compiling). The union is a partial guard, not the §11.4 invariant the RFC asserts.
2. "no new `any`" — contradicted by the RFC's own `(tag as any)[sk]` in `rebuildTag` (lines 71–72).
3. The `HxStatusKey` union width is an open question on an exported type — §11.4 cannot be marked pass with the type's shape undecided.

§11.4 flips to pass once: the union claim is demoted to "literal/editor-time guard + mandatory runtime throw," the `as any` is either contained in one typed registry helper (then claim "one internal cast, no new `any` at call sites") or the "no new `any`" claim is dropped, and Open Question 2 (union width) is resolved. None of these block the security fix; all are claim/surface corrections.
