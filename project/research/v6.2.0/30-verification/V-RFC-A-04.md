---
rfc: RFC-A-04
lens: [type-safety, dx, correctness, convergence-over-engineering]
verdict: survives-with-changes
confidence: 0.62
killer_objection: >
  The branded registry's headline claim — "a typo / invalid ident is a compile error" — only
  holds for the STATIC, arity-0 entries (tx.appNav). For the parameterized factories that are
  pm-gui's central case (taskTitle(scopePath, text)), the brand is a provenance cast over
  arbitrary runtime data: it certifies "this string came from the registry," not that the args
  are valid, distinct, or paired. Validity is bought entirely by toCustomIdent (a runtime
  function pm-gui already had); the only thing the registry adds over the existing exported
  helper `taskTitleVt(...)` is a typo-catch on the FUNCTION NAME — which an ordinary exported
  TS function already gives for free. On the parameterized path the brand buys ~nothing in
  type-safety beyond what app-land already has, while adding a registry DSL, a second emit path
  (sharedTransition), and a dev-only runtime guard whose plumbing is an admitted open question.
required_changes:
  - "P1: Keep `defineTransitions` and the static-entry brand, but STOP claiming type-safety for the parameterized path in the type-safety story (§ 'Type-safety story' bullet 1 and § Problem). Restate honestly: the brand catches (a) registry-key typos and (b) arity errors; it does NOT validate args, guarantee a valid ident (that is `toCustomIdent` at runtime), or guarantee uniqueness. Remove or qualify the sentence 'An invalid CSS ident is impossible from the registry' — it is a runtime guarantee from `toCustomIdent`, not a type guarantee."
  - "P1: Replace the arg-LABEL tuple spec (`[\"scopePath\",\"text\"] as const`) with bare arity `number` OR drop the `MapToArgs` indirection. As written, `MapToArgs<L> = { [I in keyof L]: string | number }` maps every label to `string | number`, so the labels NEVER constrain the arg TYPES — they only feed hover text and length. Shipping a tuple that looks like it types the params but only counts them is a DX trap (reviewers will assume `scopePath` must be a path). Either (a) ship `number` arity (Open Question already flags this — resolve it to `number`), or (b) if labels stay, the JSDoc MUST state they are documentation-only, not type constraints."
  - "P2: DROP `sharedTransition` from this RFC. The RFC itself concedes it is a one-line `.apply()` mixin over `viewTransitionName` whose only value is 'intent/greppability' and that P1 'already makes the pair a typed contract.' That is a SECOND way to emit `view-transition-name` (anti-CONVERGE, explicitly the rule this RFC invokes against the `.source()/.target()` split) and an opinionated naming convention → instruction-set rule puts it in user-land (@jtdigital/ui), not core. Greppability is satisfied by the registry call `tx.taskTitle(...)` already being greppable."
  - "P2: Either fully spec `assertUniqueTransitionNames` or CUT it to a follow-up. Open Question #2 admits the render-time tree-walk hook may not exist and 'this half is a larger plumbing change (or moves wholly to the framework layer).' An effort-M RFC cannot ship a feature whose core mechanism is unconfirmed. If kept: spec the exact render-time hook it attaches to, confirm static-name recurrence (tx.appNav across re-renders) is excluded from the dup check, and state the production no-op. If the hook does not exist, move this to the framework layer (@fluent-html/fastify) where render interception lives — it is not a pure HTML-builder concern."
  - "P3: `viewTransitionClass(...names: (string | Id)[])` is UNTYPED (raw string / Id) in an RFC titled 'type-safe'. Decide and state explicitly: either (a) keep it untyped and STOP marketing it under the type-safety banner — frame it as the convergence completion of the property family (we own `view-transition-name`, we add its sibling), OR (b) add a separate `defineTransitionClasses` brand. Do NOT conflate the namespaces: a `TransitionName` (registry brand) being string-assignable into `viewTransitionClass` is incidental, not a feature — name-idents and class-idents are different CSS namespaces; the worked example `viewTransitionClass(tx.taskRow, ...)` invites callers to reuse a name as a class. Remove that conflation from the worked examples or document the namespaces are distinct."
  - "Scope honesty: the a11 evidence lists a THIRD dynamic family `bugTitleVt(scopePath, text)` (pm-gui view-transitions.ts:25) that the RFC's worked-after registry silently drops. Either include `bug-title` in the registry example or note the registry must enumerate all N families — this affects the 'one registry call replaces the file' claim (it replaces 21 lines with a call that must list every family)."
  - "Convergence/CORE boundary: state explicitly which symbols land in CORE vs framework/ui. Proposed: CORE = `defineTransitions` + `toCustomIdent` + `viewTransitionClass` (primitives mapping 1:1 to CSS props, like defineIds). NOT CORE (drop or relocate) = `sharedTransition` (opinionated convention) and `assertUniqueTransitionNames` (render-time interception → framework layer)."
  - "Docs (free, keep): the 6.1.1 CHANGELOG `viewTransitionName` stale 'arbitrary-property class / Registered in the class-vocab' bullet fix and the `vocab.ts:254-257` exclusion-comment append for `viewTransitionClass` are correct and should ship regardless of the rest."
---

# V-RFC-A-04 — Type-safe View Transitions

## Attack

I attacked along the four assigned lenses. The plumbing facts in the RFC check out against source:
`viewTransitionName` is a verbatim inline-style emitter (`tailwind-methods.ts:381` decl, `:785` impl —
`addStyle(\`view-transition-name: ${extractId(name)}\`)`), deliberately excluded from the class vocab
(`vocab.ts:254-257`), and the `Id` brand pattern the RFC mirrors is real (`ids.ts:21-50`, `KebabToCamel`
at `:56`, `as unknown as Id` cast at `:50`). The widening of `viewTransitionName` to
`TransitionName | Id | string` is genuinely additive. So far, so good.

**1. Branded registry: type-safety or ceremony over a string the browser never validates?**
Split decision, and the RFC oversells it. The brand `TransitionName = string & { [TX_BRAND]: true }`
buys exactly TWO compile-time guarantees: (a) registry-key typos (`tx.appNv` → property-does-not-exist),
and (b) factory arity (`tx.taskTitle(a)` → too-few-args). Both real. But the headline framing —
"a typo / wrong arity / invalid `<custom-ident>` is now a compile error" (CHANGELOG draft) and "An
invalid CSS ident is impossible from the registry" (§Type-safety story) — smuggles in a guarantee the
TYPE does not provide. Ident validity is delivered by `toCustomIdent`, a **runtime** function. pm-gui
**already has that exact runtime slugify** (`view-transitions.ts:14`). So the brand's marginal value over
the status-quo exported helper `taskTitleVt(scopePath, text): string` is: the typo-catch on the function
NAME — which TypeScript already gives for any imported function. The browser never validates the name;
neither does the type. The brand certifies provenance, not correctness.

**2. The killer: does the brand survive runtime-derived names?** No — it collapses to a provenance cast.
For `tx.taskTitle("redesign/production", "Ship v6")`, the factory takes `(...args: (string|number)[])`
and returns a branded string via a single cast at the registry boundary (the RFC's own description, "brands
the result with a single cast … exactly like `createId`'s `as unknown as Id`"). The brand is therefore an
**assertion over arbitrary runtime data**. It says nothing about whether the args produce a valid ident
(that's `toCustomIdent` at runtime), whether two distinct tasks collide to the same slug (`"a/b"` and `"a-b"`
both → `"a-b"` — the RFC admits this in Open Question #4), or whether the pair actually matches. The RFC
concedes the uniqueness gap outright: "two task rows with the same `(scopePath, text)` mint the same name and
the duplicate no-ops." So on the parameterized path — pm-gui's CENTRAL case, the whole reason a flat
`defineIds`-style list was rejected — the branded type delivers (a) function-name typo-catch and (b) arity.
That is a thin return for a new registry DSL + `MapToArgs` machinery.

Worse, `MapToArgs<L> = { [I in keyof L]: string | number }` makes the arg-LABEL tuple a DX trap: it maps
every label to `string | number`, so `["scopePath","text"]` does not constrain the args to be a path or text
— it only sets the count and hover labels. A reviewer reading `tx.taskTitle(scopePath, text)` will assume the
labels type the params; they don't. Ship `number` arity or document the labels as cosmetic-only.

**3. Is P2 redundant given P1?** Yes, by the RFC's own admission. `sharedTransition(name)` is "a one-line
mixin over the existing `.apply()` seam … whose value is *intent/greppability*," and the RFC says P1 "already
makes the pair a typed contract." That is a second emit path for `view-transition-name` — the exact CONVERGE
violation the RFC wields to reject the `.source()/.target()` split ("a second naming path, violating CONVERGE").
It cannot reject the split for that reason and then ship `sharedTransition` for the same reason. Greppability is
already satisfied: `tx.taskTitle(...)` is itself greppable. The genuinely-useful half, `assertUniqueTransitionNames`,
rests on an **unconfirmed render-time hook** (Open Question #2 admits it "must walk the rendered tree" and "may be
a larger plumbing change or moves wholly to the framework layer") — you cannot promise effort M on a feature whose
mechanism is a TBD.

**4. Does P3 pull its weight?** Weakly, and it undercuts the RFC's own title. pm-gui has **zero** current use
(a11:115-119, RFC §P3 "no use *yet*"). It's convergence-completionism ("if we own `view-transition-name` we should
own `view-transition-class`") — a defensible primitive, but `viewTransitionClass(...names: (string | Id)[])` is
**untyped** (raw string/Id). Shipping an explicitly type-unsafe emitter inside an RFC titled "Type-safe View
Transitions" is a framing mismatch. The worked example `viewTransitionClass(tx.taskRow, "selected")` also conflates
namespaces — a registry NAME being reused as a CLASS is incidental string-assignability, not a designed feature.

**5. CORE or @jtdigital/ui?** Mixed. `defineTransitions` + `toCustomIdent` + `viewTransitionClass` are primitives
mapping 1:1 to CSS props — core is defensible, matching `defineIds`. But `sharedTransition` is an opinionated naming
**convention** ("this reads as a shared-element morph") → the instruction-set rule (ship primitives, not opinionated
helpers) places it in user-land. `assertUniqueTransitionNames` needs render interception → framework layer
(@fluent-html/fastify), not the pure HTML builder. The RFC does not draw this boundary.

**6. Already shipped in 6.1.x?** Correctly handled. `viewTransitionName` + per-swap `transition:true` + global
`HtmxConfig({transitions})` are shipped; the RFC re-proposes none of them and the widening is additive. No
double-ship. The stale-CHANGELOG fix and vocab-comment append are correct cleanups.

## Does it survive?

**Survives-with-changes** — but only after the type-safety story is rewritten to stop overselling, P2 is
gutted, and the CORE/framework boundary is drawn. The defensible nucleus is small: `defineTransitions` (with
`toCustomIdent` folding the documented slugify footgun into one place — a real DX win that deletes app-land
boilerplate and centralizes the leading-digit guard pm-gui's regex misses) plus the convergence emitter
`viewTransitionClass`. That nucleus is worth shipping. The surrounding 60% — the arg-label tuple, `sharedTransition`,
`assertUniqueTransitionNames` — is ceremony, redundancy, or unconfirmed plumbing.

I default-to-reject under uncertainty, and I came close: the killer objection (the brand is a provenance cast on
the parameterized path, delivering little beyond function-name typo-catch) genuinely undermines the marquee claim.
What pulls it back from `reject` is that the *centralization* value is real and lens-independent: one `toCustomIdent`,
one registry, one place the `<custom-ident>` rule lives, deleting a hand-rolled app file whose own comment proves the
footgun exists. That is a legitimate DX/correctness primitive even if the "branded type-safety" headline is half
marketing. So: ship the nucleus, kill the embellishments, correct the claims. Confidence 0.62 — the nucleus is sound
but the RFC as drafted would mislead implementers about what the types actually guarantee.

## Guardrail check

- **§11.1 zero-deps** — pass. Pure factory + string emitters; the only runtime addition is the (now-questioned)
  dev guard, which must be confirmed no-op in production.
- **§11.2 ssr-only** — pass for P1/P3. `assertUniqueTransitionNames` needs render-time tree access; if that hook
  doesn't exist in core it is NOT ssr-builder-only and belongs in the framework layer.
- **§11.3 escape-by-default** — pass. Names route through `addStyle` → `escapeAttr`; `toCustomIdent` further strips
  to `[a-z0-9-]`. P3's raw `viewTransitionClass` relies on the same `escapeAttr`; note it is explicitly NOT validated.
- **§11.4 type-safety** — PARTIAL / the contested guardrail. Brand catches key-typos + arity only; ident validity
  and uniqueness are runtime, and `MapToArgs` does not type factory args. `viewTransitionClass` is `string|Id`
  (untyped). The RFC must not claim §11.4 "pass — A typo is a compile error" without the qualifier that this holds
  for static keys/arity, not arg values or uniqueness.
- **§11.5 additive-only** — pass. All symbols new; the `viewTransitionName` widening is non-breaking.
- **§11.6 instruction-set** — PARTIAL. `defineTransitions`/`viewTransitionClass`/`toCustomIdent` are primitives (ok).
  `sharedTransition` is an opinionated naming convention (→ user-land). CONVERGE is violated by `sharedTransition`
  being a second `view-transition-name` emit path — the same objection the RFC uses to reject `.source()/.target()`.
- **§11.7 class-vocab / extractor-eslint lockstep** — pass by exclusion. All emit inline style, never a class;
  add `viewTransitionClass` to the `vocab.ts:254-257` exclusion comment as the RFC states. Correct and verified.
- **§11.8 guideline/docs-sync** — pass. README/JSDoc/CHANGELOG/vocab-comment enumerated; the stale-6.1.1-CHANGELOG
  fix is correct. Docs must be corrected to match the rewritten (honest) type-safety story, not the oversold one.
