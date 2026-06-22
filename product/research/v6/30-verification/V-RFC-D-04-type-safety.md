---
rfc: RFC-D-04
lens: type-safety
verdict: survives-with-changes
confidence: 0.74
killer_objection: "The Type-safety story's central claim — 'RenderOptions is an object, View array elements are not, so TS picks the right overload without a discriminant' — is false in the way that matters: View *includes* `string` and `View[]`, RenderOptions.nonce is *optional* (so `{}`⊆RenderOptions), and the only multi-view nonce shape a developer will reach for, `render(v1, v2, {nonce})`, does NOT compile to the opts overload — it falls into the variadic overload and the options object is type-checked as a View *child*, producing the misleading error 'nonce does not exist in type Tag | RawString | View[]' that never once mentions options. The overload silently supports nonce only for the single-view case while renderWithNonce(n, ...views) supports multi-view — an asymmetry the RFC never acknowledges."
required_changes:
  - "Acknowledge and resolve the multi-view asymmetry: render(view, opts) accepts ONE view, but render(...views) is variadic and the decorator example itself collapses N views into one. Either (a) document that multi-view + nonce MUST use renderWithNonce(nonce, ...views) or render([v1,v2], {nonce}) (array-wrapped), and state this explicitly in the Type-safety story + guideline, OR (b) add a render(views: View[], opts) shape. The current text claims clean overload resolution while render(v1, v2, {nonce}) errors with a message that never mentions options."
  - "Stop overclaiming excess-property protection. The RFC asserts `{ noce: x }` is a compile error; this holds ONLY for inline object literals. `render(a, opts)` where opts is a *variable* of shape `{ nonce, extra }` compiles silently (excess `extra` allowed). Reword the Type-safety story to 'inline-literal typos are caught; variable-held opts are not' — do not present excess-property checking as a general guarantee."
  - "nonce?: string is a bare string and permits the empty string. The precedence rule ('render-time nonce fills tags that have none') will stamp nonce=\"\" — a silently broken CSP. The RFC argues the *WithNonce wrappers keep nonce required 'because a nonce is meaningless when empty', but `required` does not exclude \"\". Add a branded Nonce type (e.g. `type Nonce = string & { readonly __nonce: unique symbol }`) produced by a `nonce(s: string): Nonce` guard that rejects empty/whitespace, OR at minimum a runtime guard that no-ops on empty nonce so it can never emit nonce=\"\". A guardrail-§11.4 surface must not admit the exact value the RFC calls 'meaningless'."
  - "Fix the doubled/misleading diagnostic for the literal-typo case: with both overloads live, `render(a, { noce: 'x' })` reports the typo against BOTH overloads ('No overload matches this call' + two sub-errors), one of which talks about Tag | RawString | View[]. Confirm in the RFC that the DX of this error is acceptable, or constrain overload order so the opts overload's diagnostic wins."
  - "renderToStream(view, opts?: RenderOptions): with opts OPTIONAL and View including View[], a call meaning to pass opts is indistinguishable from a single array-view call. Confirm renderToStream has no analogous mis-route, and mirror whichever guard (brand / array-wrap rule) render adopts."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-D-04-type-safety.md
---

# Verdict: RFC-D-04 — type-safety lens

> You are an ADVERSARY. Your job is to KILL this RFC through the type-safety lens.
> Default to `reject` under uncertainty.

## Attack

I compiled the RFC's proposed overloads against the *real* `View` type
(`src/core/types.ts:6` → `View = Tag | string | RawString | View[]`) under
`tsc 5.9.3 --strict`. The Type-safety story (§"Type-safety story", lines 128–132)
makes four claims; two are false and two are weaker than stated.

- **type-safety failure mode 1 — the overload does NOT resolve cleanly for the idiomatic call (killer).**
  The RFC asserts: *"RenderOptions is an object, View array elements are not, so TS picks
  the right overload without a discriminant."* But `render` is *variadic* in its primary form
  and every real call site (including the RFC's own `renderView` decorator) deals in **multiple**
  views. The natural way to add a nonce to a multi-view response is `render(v1, v2, { nonce })`.
  That does **not** select `render(view, opts)` — it's 3 args, so it binds to `render(...views)`
  and the options object is checked as a **View child**:
  ```
  render(a, a, { nonce: "n" });
  // error TS2353: Object literal may only specify known properties,
  //   and 'nonce' does not exist in type 'Tag | RawString | View[]'
  ```
  The error never mentions "options" or "RenderOptions" — a developer has no signpost that the
  fix is to array-wrap (`render([a, a], { nonce })`) or to call `renderWithNonce(n, a, a)`.
  Meanwhile `renderWithNonce(nonce, ...views)` *does* take multi-view. So the two "equivalent"
  entry points the RFC presents as interchangeable (guideline says `render(view,{nonce})` and
  `renderWithNonce(nonce,view)` have "same effect") have **different arities** — the overload
  supports nonce for one view only. This asymmetry is unstated and will route developers into a
  misleading compile error or, worse, toward dropping the nonce.

- **type-safety failure mode 2 — excess-property "typo protection" is literal-only.**
  The RFC: *"a typo like `{ noce: x }` is an excess-property compile error."* True for inline
  literals. But the moment opts is held in a variable — the common case when a decorator threads
  it — excess properties pass silently:
  ```
  const maybeOpts = { nonce: "x", extra: 1 };
  render(a, maybeOpts);   // compiles — 'extra' silently allowed
  ```
  And `{}` is assignable to `RenderOptions` (nonce optional), so `render(a, {})` compiles as a
  no-op opts call. The "typed bag prevents typos" story is materially weaker than claimed.

- **type-safety failure mode 3 — `nonce?: string` admits the empty string (guardrail §11.4).**
  A CSP nonce is a high-entropy token; the type is bare `string` and accepts `""`. Combined with
  the precedence rule ("render-time nonce only fills tags that have none"), an empty nonce gets
  stamped as `nonce=""`, which *passes* HTML serialization and `escapeAttr` but silently defeats
  `script-src 'nonce-...'`. The RFC even names this hazard — "a nonce is meaningless when empty" —
  and "solves" it by keeping the wrapper's `nonce: string` **required**. But `required ≠ non-empty`;
  `renderWithNonce("", view)` type-checks. The surface admits exactly the value the RFC calls
  meaningless. §11.4 says "no bare `string` where a literal union fits" — a nonce isn't a literal
  union, but it *is* a branded-ID-shaped value (§11.4 also cites branded IDs), and the RFC's own
  reasoning demands the brand.

- **type-safety failure mode 4 — `renderToStream(view, opts?)` mis-route + doubled diagnostics.**
  `opts?` optional + `View` including `View[]` means a single array-view call and an
  intended-opts call are structurally adjacent; and the literal-typo path emits a doubled
  "No overload matches" diagnostic, one branch of which talks about `Tag | RawString | View[]`
  rather than `RenderOptions`. Both are DX-of-types regressions, minor next to #1–#3.

## Does it survive?

Survives **with changes**. The core model (nonce as render-time, non-mutating) is sound and the
fixes are local to the *type surface*, not the design. But the RFC currently ships a Type-safety
story that is **partly false** (overload resolution claim, excess-property claim) and a surface
that **admits the one value it calls meaningless** (`nonce=""`). Under default-reject this would be
a reject if the model were the problem — it isn't; the types are. Four of the five required changes
are wording/brand additions that fold straight back into the RFC's own §"Type-safety story" and
§"Proposed API". The multi-view asymmetry (change 1) is the one with real design weight: either
constrain the docs to the array-wrap / wrapper form, or add a `render(views: View[], opts)` shape —
the RFC must pick one and stop presenting `render(view,{nonce})` as a drop-in for the variadic form.

Confidence 0.74: the failure modes are reproduced under tsc, not asserted; the reason it's not a
hard reject is that none of them silently emit *wrong HTML for a correct-looking call* except the
`nonce=""` path, which is the change-3 brand's job to close.

## Guardrail check (§11.4 type-safety, owned by this lens)

- **No `any` in the new surface:** pass — confirmed `RenderOptions`/`RawCtx` introduce no `any`.
- **No bare `string` where a stricter type fits:** **fail as written** — `nonce: string` admits
  `""`; the RFC's own rationale ("meaningless when empty") demands a brand or non-empty guard.
  Required-change 3 closes it.
- **Inference does not break for the common case:** **fail as written** — the variadic multi-view +
  nonce call does not narrow to the opts overload and produces a misleading error; required-change 1
  closes it (either by API shape or by explicit doc constraint + corrected Type-safety story).
- **Overloads don't collide:** pass on collision (no ambiguous *successful* resolution found), but
  the *diagnostics* are poor (required-change 4).
