---
rfc: RFC-A-G2
lens: type-safety
verdict: survives-with-changes
confidence: 0.86
killer_objection: "The proposed AriaAttrs type does NOT catch the typo it claims to catch — `setAria({ lable: \"x\" })` compiles cleanly under the RFC's exact definition, falsifying the central 'typos surface in IDE/tsc' claim."
required_changes:
  - "Replace the open string-key index arm `Record<`${string}`, string | boolean>` with a template-literal-KEY escape arm `Partial<Record<`aria-${string}`, string | boolean>>`. Verified with tsc --strict: this both rejects the `lable` typo AND preserves an escape hatch (`{ \"aria-foo\": x }`). The current open-key arm whitelists every key and therefore can never produce an excess-property error."
  - "Fix the type-safety story prose: the construct on RFC line 74 is `Record<`${string}`, …>`, NOT `(string & {})` as the line-72 comment and line 167 claim. `(string & {})` is a VALUE pattern (Tailwind tokens); it does not narrow object KEYS. Remove the false equivalence and the 'mirrors the Tailwind-token pattern' justification."
  - "Make the ESLint auto-fixer round-trip-safe or scope it to provably-safe keys only. `toCamel` (un-kebab) and `setDataAttrs`'s kebab conversion (tag.ts:281) are not inverse functions, so the 'behavior-preserving codemod' can silently rename rendered attributes: `addAttribute(\"data-userId\", x)` → fixer → `setDataAttrs({ userId: x })` → renders `data-user-id` (different attribute; breaks `dataset`/CSS-selector reads). Fixer must (a) skip any `data-*` source key not matching `^[a-z][a-z0-9-]*$`, or (b) emit a quoted-string key through a key-preserving path, never a camelCase round-trip."
  - "Either close the loop on `expanded`/`pressed`/`selected`/`checked` value types (narrow to `\"true\" | \"false\" | boolean`) or strike the 'aria-expanded value gotcha documented in types' claim (Type-safety story bullet 2). With `string | boolean`, `setAria({ expanded: \"no\" })` compiles — the type documents nothing; only the guideline prose does."
---

# Verdict: RFC-A-G2 — type-safety lens

> You are an ADVERSARY. Your job is to KILL this RFC through the type-safety lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

### Failure mode 1 (KILLER): the headline type does not catch the headline typo

The RFC's entire type-safety thesis is one sentence (line 167):

> `setAria({ lable: "x" })` was previously accepted … with `AriaAttrs` the known camelCase keys autocomplete and **typos surface in IDE/tsc**.

This is **false** for the type the RFC actually specifies. The proposed definition (lines 73–74) is:

```ts
export type AriaAttrs = Partial<Record<AriaAttribute, string | boolean>> &
  Record<`${string}`, string | boolean>;
```

`Record<\`${string}\`, string | boolean>` is an index signature over **every** string key. Intersecting a known-keys partial with a catch-all index signature does **not** retain excess-property checking — `lable` is a perfectly valid key of the catch-all arm, so the object literal type-checks. Verified with `tsc --strict` against the RFC's exact type:

```ts
setAria({ lable: "x" });      // ← NO ERROR. compiles clean.
setAria({ totallyBogus: 1 }); // only errors because 1 is a number, NOT because the key is unknown
```

Only the *value* type (`string | boolean`) is enforced; the key is wide open. So after this RFC ships, `{ lable: "x" }` still renders `aria-lable` exactly as before — the precise defect F-A-052 raised (RFC line 47) is **not fixed**. The autocomplete benefit is real, but the "compile error on typo" benefit — the one the RFC sells as the type-safety win — is illusory.

**Root cause:** the RFC conflates two different `string & {}` use sites. The library's `(string & {})` Tailwind pattern works on **value** unions (`"blue-500" | (string & {})`), where the literal members still drive autocomplete and arbitrary strings are the explicit escape. The same trick on a **key** index signature degenerates to a plain index signature, which is the *opposite* of excess-property checking. The RFC's own comment (line 72) says `(string & {})` but the code (line 74) writes `Record<\`${string}\`, …>` — the prose describes a stronger type than the code delivers, and **neither narrows keys**.

The fix exists and is cheap (verified with `tsc --strict`): a **template-literal-key** escape arm instead of an open-key one:

```ts
export type AriaAttrs = Partial<Record<AriaAttribute, string | boolean>> &
  Partial<Record<`aria-${string}`, string | boolean>>;

setAria({ lable: "x" });       // ✓ ERROR TS2561: Did you mean 'label'?  ← the claim now holds
setAria({ "aria-foo": "x" });  // ✓ escape hatch preserved
```

This rejects the typo AND keeps a future/rare-key escape. The escape key shape changes to the explicit `aria-*` form — and the impl's camelCase regex passes it through unchanged (no `[A-Z]` in `aria-foo`), so it still renders `aria-foo` correctly. Note the impl already converts camelCase → kebab, so a known key like `labelledby` (no camelCase) renders `aria-labelledby` and `activedescendant` renders `aria-activedescendant`; the union's lowercase keys are consistent with that. Without this change the RFC ships a type that lies about what it prevents.

### Failure mode 2: the "behavior-preserving" auto-fixer silently renames attributes

The RFC claims the fixer *is* the codemod and is behavior-preserving (lines 121, 169, 180). But `toCamel` (kebab→camel, RFC line 101) and `setDataAttrs`'s camel→kebab (`tag.ts:281`, only inserts `-` before `[A-Z]`) are **not inverse functions**. A wrong call survives the fix and renders a *different* attribute:

```ts
// source (renders literally: data-userId — HTML lowercases at parse, but the emitted string differs)
.addAttribute("data-userId", x)
//  fixer → toCamel("userId") = "userId" → .setDataAttrs({ userId: x })
//  setDataAttrs kebabs → emits data-user-id   ← DIFFERENT EMITTED ATTRIBUTE
```

Any app reading that via `el.dataset.userId`/`[data-user-id]` vs `[data-userId]` selectors can break at runtime, with no type or lint signal. The non-bijection also bites digit-adjacent boundaries (`data-col-2` un-kebabs to `col-2`, not a valid identifier → must stay quoted; nearby cases round-trip differently). A codemod the RFC asserts is "behavior-preserving" must not silently mutate the emitted DOM. The fixer must refuse any source key not already lowercase-kebab, or pass keys through verbatim.

### Failure mode 3 (documented punt, not a killer): values are unchecked

`setAria({ expanded: "no" })` compiles — `string | boolean` guards nothing. The RFC says the gotcha is "documented in types" (Type-safety story, bullet 2). It is not; only the guideline prose documents it. The RFC's own Open Questions defer value-narrowing, so this is a known punt — but the "documented in types" claim should be struck so the RFC doesn't overstate the type guarantee.

## Does it survive?

**survives-with-changes.** The strategic direction (lint-flag the escape hatch, lead the guideline with typed setters, retain `addAttribute`) is sound and additive — guardrail §11.5 holds, and `setAria(AriaAttrs)` is genuinely wider-compatible than `Record<string, …>`, so nothing breaks. But the RFC cannot ship as written: its central type-safety claim is provably false against its own type definition (failure mode 1), and its "behavior-preserving codemod" can silently rename attributes (failure mode 2). Both are fixable with the listed changes, none of which touch runtime impl or break compat. With the template-literal-key arm and a round-trip-safe fixer, the RFC delivers what it advertised.

I stop short of `reject` only because the killer is a type-construction bug with a verified one-line fix, not a flaw in the RFC's premise — the typed-setter-over-escape-hatch idiom (§11.6) is correct and the fix lands the very guarantee the RFC promised.

## Guardrail check (§11.4 type-safety — this lens owns it)

**FAILS as written:** the proposed `AriaAttrs` admits the exact bare-typo it claims to reject, so "no bare `string` where a literal union fits" is not actually achieved for object keys — the open index arm reintroduces the bare-string key space. **PASSES** once `required_changes[0]` (template-literal-key escape) is applied. No `any` is introduced either way (that part of the §11.4 claim is accurate). Verified empirically with `tsc --strict`, not by inspection.
