---
rfc: RFC-A-001
lens: type-safety
verdict: survives-with-changes
confidence: 0.82
killer_objection: null
required_changes:
  - "Correct the overstated grammar-alignment claims (lines 91, 138). ExtractParams does NOT use the [A-Za-z0-9_] identifier grammar — it captures each param name greedily up to the next '/', so type-extracted names legitimately contain '.', '-', and even ':' (verified: ExtractParams<\"/:id.json\"> = \"id.json\", ExtractParams<\"/v:major.:minor\"> = \"major.:minor\", ExtractParams<\"/files/:name-thumb\"> = \"name-thumb\"). The lookahead therefore does NOT 'exactly mirror' ExtractParams; it mirrors only assertNoUnresolvedParams's detector. Rephrase to claim alignment with the DETECTOR regex only, not with type extraction."
  - "State explicitly WHY the fix is type-safe despite that divergence: the runtime builds the FULL type-extracted key into the pattern via escapeRegExp, so the lookahead's identifier grammar only governs the trailing boundary — and ExtractParams's greedy-to-'/' capture guarantees no typed param name is a prefix of adjacent literal path text. The lookahead is thus belt-and-suspenders for typed usage; the real value is disambiguating distinct sibling params (:id vs :idCard). This is the honest type-safety justification and should replace the 'definitionally aligned' hand-wave."
---

# Verdict: RFC-A-001 — type-safety lens

> Adversary mandate: kill this RFC through the type-safety lens. Default to reject under uncertainty.

## Attack

I mounted three type-safety attacks against the RFC and verified each against the shipped code and the real compiler.

- **type-safety failure mode 1 — false grammar-alignment claim.** The RFC twice asserts (line 91, line 138) that the runtime lookahead `(?![A-Za-z0-9_])` "exactly mirrors the identifier grammar used by `ExtractParams`," keeping "type extraction and runtime substitution definitionally aligned." This is **false**. The shipped `ExtractParams` (`src/routes.ts:27-32`) splits on `:` and `infer`s the param name greedily up to the next `/` — it is `/`-delimited, not `\w`-delimited. Verified against tsc 5.x: `ExtractParams<"/:id.json">` yields the literal `"id.json"`, `ExtractParams<"/files/:name-thumb">` yields `"name-thumb"`, and `ExtractParams<"/v:major.:minor">` yields the SINGLE name `"major.:minor"` (a name containing a `.` AND a `:`). The runtime lookahead grammar genuinely diverges from the type-level extraction grammar. The RFC mis-cites its own type layer.

- **type-safety failure mode 2 — does the divergence open a runtime-vs-type contract hole?** I probed whether the divergence corrupts substitution for type-representable param names. It does not. Because the RFC's helper builds the **entire** type-extracted key into the pattern (`:${escapeRegExp(key)}…`), and `escapeRegExp` neutralizes the `.`/metachars, every type-representable name resolves correctly: `/:id.json` + `{ "id.json": "42" }` → `/42`; `/files/:name-thumb` + `{ "name-thumb": "x" }` → `/files/x`; `/v:major.:minor` + `{ "major.:minor": "1.2" }` → `/v1.2`, all passing `assertNoUnresolvedParams`. The lookahead's grammar choice only governs the trailing boundary of an already-fully-specified name, and `ExtractParams`'s greedy-to-`/` capture guarantees no typed param name can be a prefix of adjacent *literal* path text (e.g. you cannot have `:id` followed by literal `Card` — the type reads it as one name `idCard`). So the divergence is benign under the type contract.

- **type-safety failure mode 3 — manufactured mismatch.** The only corruption I could construct (`substituteParams("/p/:a-b", { a: "Z" })` → `/p/Z-b`, silently wrong, passes the assert) requires the caller to pass key `"a"` when the type-extracted key is `"a-b"`. That call is a **compile error** under `ResolveParamTypes<Path, Params>` (`src/routes.ts:57`); it is only reachable via an `as any` escape, exactly as the shipped test at `test/routes.ts:461` already does for the negative path. The types already forbid it. Not a type-safety hole.

## Does it survive?

**Survives-with-changes.** The lens this verifier owns — guardrail #4, "type-safety first; no bare `string` where a literal union fits" — is fully satisfied:

- `api_surface: []` is accurate: no exported type, signature, or symbol changes. `ResolveParamTypes`, `ExtractParams`, `RouteCallable`, `RouteProperties`, `ParamTypeName` are byte-untouched. No widening, no narrowing loss, no new bare-`string` surface (the new internal `substituteParams(template: string, params: Record<string, string | number>)` is private and matches the existing internal call-site typing exactly).
- The change moves the runtime *toward* the compile-time contract, not away: the types already promise that `{ id, idCard }` are both required and both substituted; v6.0.0 runtime broke that promise; this fix restores it. That is the correct direction for the type-safety lens.
- No type-safety test surface is touched (`test/type-safety.ts` has no route assertions; `test/routes.ts` negative cases stay green — verified the helper against all shipped resolve() cases plus the prefix-collision and repeated-param headline cases).

It is not a clean `survives` because the RFC's written type-safety justification contains a **factually wrong claim about the type layer** (failure mode 1). A spec that mis-describes its own `ExtractParams` grammar is a latent hazard: a future RFC could cite "the lookahead mirrors ExtractParams" to justify a real type-level change and inherit the error. The fix is correct; the *rationale* must be corrected before it ships into the durable record. Hence survives-with-changes, with the two documentation-accuracy edits listed in front-matter. Neither edit changes a single line of the proposed code.

## Guardrail check (type-safety, owned)

PASS. No bare `string` introduced where a literal union fits; no public type shape moved; the runtime now honors the literal-union param contract the types already encode. The grammar-divergence I found is benign under the type contract and only requires a wording correction, not a code change. Confidence 0.82 — the residual 0.18 is the unlikely event that a downstream RFC leans on the corrected-but-still-subtle grammar boundary; the required-changes edits neutralize that by stating the honest justification.
