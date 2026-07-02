---
rfc: RFC-C-08
lens: [type-safety, class-string-contract, dx, breaking-change]
verdict: survives-with-changes
confidence: 0.78
killer_objection: >
  The `ChildDescendantVariant = `*:${string}` | `**:${string}`` arm is type-modelled
  wrong. `.on()`/`.at()` take the variant PREFIX without the trailing colon —
  `withVariant` (tailwind-methods.ts:91-101) prepends `${prefix}:${cls}`. So the
  documented call `.on("*", t => t.padding("4"))` passes `"*"`, which does NOT match
  `*:${string}` (that requires a literal colon). As written, the canonical call is a
  compile error, and the only thing that DOES satisfy the arm — `.on("*:p-4", …)` —
  would double-emit `*:p-4:p-4`. The RFC's own emitted-output table (`.on("*", …)` →
  `*:p-4`) contradicts the type it proposes. Must be `"*" | "**"` literals.
required_changes:
  - "Redefine ChildDescendantVariant as the closed two-literal union `\"*\" | \"**\"` (the bare variant prefixes `.on()` receives), NOT `*:${string}` / `**:${string}`. Rationale: `.on(prefix, fn)` passes the prefix sans colon; `withVariant` adds `${prefix}:${cls}`. With the bracket-form base supplied in the callback, the prefix is literally `*` or `**`. Update §3, §4 (the `ChildDescendantVariant` arm of TailwindState), the type-safety section, the type-test positives (`.on(\"*\", …)`, `.on(\"**\", …)`), and the README sub-table accordingly. (The arbitrary-base case Tailwind also supports — `*:[&_p]:…` — is reachable by chaining `.on(\"*\", t => t.on(\"[&_p]\", …))` or via the existing escape hatch; do NOT re-add a `${string}` tail, which re-opens the typo hole this RFC closes.)"
  - "Audit every other proposed arm for the same prefix-vs-full-class confusion and add a one-line note in §3/§4 stating the invariant explicitly: the union member is the string passed to `.on()`/`.at()` (no trailing colon); the base class is supplied inside the callback. Confirmed-correct arms to leave as-is: AriaBoolVariant (`\"aria-invalid\"`), `aria-[${string}]`, `group-${GroupPeerState}/${string}`, `data-[${string}]`, StructuralNthVariant (`nth-${string}` matches `nth-3` and `nth-[3n+1]`), ExtraPseudoState, the container `@`-scale. These all pass the invariant; only the child/descendant arm fails it."
  - "Fix the Problem-section premise (lines 44-45, and worked-example `1` comment) that claims the eslint plugin ALREADY flags the raw `aria-invalid:`/`data-[`/`nth-`/`*:`/`@sm:` escape strings (\"which the eslint plugin then (correctly) flags, leaving no typed path\"). Verified false: STATE_VARIANTS / BREAKPOINT_VARIANTS in no-known-modifiers-in-setclass.ts (lines ~483-494) do not contain any of these, and parseVariantPrefix returns null for them today, so `addClass(\"aria-invalid:…\")` is silently un-flagged. Reword to: the typed path is absent AND the eslint steering is incomplete — the eslint extension in the Lockstep section is what makes the steering complete. (This strengthens the RFC; it does not weaken the motivation.)"
  - "State the StructuralNthVariant removal of the shipped `nth-[${string}]` arm as an explicit, honestly-marked rewrite in §4 and the CHANGELOG Breaking line. `nth-${string}` (new) is a strict superset of `nth-[${string}]` (shipped, CHANGELOG 6.1.x note `nth-[…]`) so it is value-compatible, but you ARE deleting a named arm; say so in one line rather than only in a parenthetical (\"subsumed\")."
  - "Verify and pin the AriaBoolVariant and ExtraPseudoState literal lists against the Tailwind v4.x variant reference via WebFetch and cite the version in the JSDoc/CHANGELOG (the RFC says \"Pin: tailwindcss 4.x\" but lists ~30 literals without a source). Any literal Tailwind v4 does not ship as a first-class variant must be dropped to a `[…]` arm or removed, else it emits dead CSS (§11.7 spirit: a closed head must correspond to a real generated variant). Specifically re-confirm: `contrast-more`/`contrast-less` (Tailwind uses these), `forced-colors`, `details-content`, `user-valid`/`user-invalid`, `autofill` are all real v4 variants before closing them into the head."
  - "Add to the type-test negatives an `@ts-expect-error` for the now-removed bad form `.on(\"*:p-4\", …)` (must NOT compile after the arm is fixed to `\"*\" | \"**\"`), so a future regression that re-opens the `*:${string}` tail is caught."
---

## Attack

I came to kill this RFC through type-safety, class-string-contract, dx, and
breaking-change. Here is what I found.

**Already-shipped check (would be an instant reject).** 6.1.1 shipped the relational
hooks `has-[…]` / `group-has-[…]` / `peer-has-[…]` / `in-[…]` (CHANGELOG line 61) and
made `Form<T>` emit `aria-invalid="true"` (CHANGELOG line 87). It did NOT ship
`aria-*` / `data-*` state arms, named `group-`/`peer-` consumer arms, the closed
container `@`-scale, or the nth/`*`/`**`/extra-pseudo families. I grepped
`src/core/tailwind-types.ts:218-238` directly: `TailwindState` carries the unnamed
`group-hover`/… literals only, `TailwindContainerBreakpoint` is the fully-open
`` @${string} | @max-${string} | @[${string}] | @${string}/${string} ``. The RFC's
"four holes" are all real and un-shipped. No instant reject on this axis.

**Killer — the child/descendant arm is mis-typed (type-safety + dx).** The whole RFC
rests on the invariant that `.on(prefix, fn)` takes the variant prefix and
`withVariant` (`tailwind-methods.ts:91-101`, `p.on` at `:392-394`) prepends
`${prefix}:`. I checked every arm against that invariant. All pass EXCEPT
`ChildDescendantVariant = `*:${string}` | `**:${string}``. The documented call is
`.on("*", t => t.padding("4"))` → `*:p-4` — the argument is `"*"`, which does not
satisfy `*:${string}`. The RFC's Proposed-API type and its own emitted-output table
disagree. As drafted this is a compile error on the happy path and a double-colon
emit (`*:p-4:p-4`) on the only string that type-checks. Concrete, must-fix.

**Class-string contract (§11.7).** Verified the extractor reads the prefix verbatim:
`extractVariantClasses` (`../fluent-html-tailwind-extractor/src/extract.ts:197-219`)
captures `match[1]` and prepends `${prefix}:` to base classes scanned from
`classVocab`/`extractDirectClasses` inside the callback body. I ran the emitted
strings through both the variant path and the default-class regex
(`extractDefaultClasses`, `extract.ts:237`); the variant path round-trips
`*:p-4`, `aria-invalid:border-red-500`, `@sm:grid-cols-2`,
`group-hover/item:visible`, `nth-[3n+1]:bg-gray-50` correctly because the base after
the colon is a real vocab class and the prefix is opaque. (The default regex alone
mangles `*:p-4` → `:p-4`, but that path is irrelevant here — `.on()`/`.at()` never go
through it.) No vocab.ts row is needed (variants aren't utilities); the RFC's
"no extractor/vocab code change, add fixtures only" is correct. §11.7 holds.

**dx / convergence.** The RFC removes the raw `setClass`/`addClass` escape hatch for a
variant surface and adds no second spelling — it widens the existing `.on()`/`.at()`
seam. It explicitly rejects `.aria()`/`.data()`/`.nth()`/`.container()` helpers as a
CONVERGE violation. Good. One Problem-section overstatement: it claims the eslint
plugin already flags these raw strings; I verified it does NOT (STATE_VARIANTS /
BREAKPOINT_VARIANTS lack every new prefix; `parseVariantPrefix` returns null). The
motivation survives the correction — the typed path is simply absent — but the
sentence must be fixed so the RFC isn't relying on a false premise.

**Breaking-change.** The container-scale narrowing (`` @${string} `` → closed
`@3xs..@7xl` + arbitrary arms) is honestly marked breaking; greenfield, no published
consumers, `@[…]` escape hatch preserved. The `nth-[${string}]` shipped arm is being
deleted in favor of `nth-${string}` (a strict superset) — value-compatible but it IS
a named-arm rewrite that the draft buries in a parenthetical; it deserves one explicit
breaking line. The re-expression of unnamed `group-*`/`peer-*` off `GroupPeerState` is
value-identical (grep shows no downstream importer of those four literals as a
sub-type).

**Type holes hunt.** No `any`; no bare `string` where literals are valid — the open
tails (`aria-[${string}]`, named-group name, `nth` formula, arbitrary `@[…]`) are
genuinely free values, matching the shipped `has-[`/`nth-[` posture (§11.4). The one
unverified risk is the ~30 closed literals in `AriaBoolVariant`/`ExtraPseudoState`:
the RFC pins "tailwindcss 4.x" but cites no source, and a literal closed into the head
that Tailwind v4 does NOT ship as a variant becomes dead CSS (a quiet §11.7 violation
for that arm). Required-change 5 gates this on a WebFetch confirmation.

## Does it survive?

Yes — survives-with-changes. The RFC targets a genuine CORE primitive gap (the
variant prefix union is the only typo guard, and four real holes force raw escape
strings), converges instead of adding spellings, and respects the class-string
lockstep (verbatim prefix + vocab base, fixtures-only tooling change). It is not a
duplicate of any 6.1.x shipment.

It does not ship as drafted: the `*:`/`**:` arm is type-modelled wrong (killer), the
closed-head literal lists are unverified against the pinned Tailwind version, and one
Problem-section premise is false. All are precise, local fixes to a type-only PR — a
bad arm is cheaper to fix than the whole RFC is to re-cut, and the rest of the design
is sound. Hence survives-with-changes, not reject.

## Guardrail check

- **§11.1 zero-deps** — PASS. Pure type widening; no runtime/dependency change.
- **§11.2 SSR-sync** — PASS. `.on()`/`.at()` are synchronous `withVariant` calls; untouched.
- **§11.3 escape-by-default** — PASS. Emits class prefixes only; aria/data HTML attrs still flow through `setAria`/`setDataAttrs` (escaped). No URL/attr-value surface added.
- **§11.4 type-safety** — CONDITIONAL. Closed heads + open tails are the right posture, BUT the `*:`/`**:` arm is wrong (required-change 1) and the closed literal lists are unverified against Tailwind v4 (required-change 5). Passes only after those.
- **§11.5 compat** — PASS with a wording fix. Additive arms + two honestly-marked narrowing breaks (container scale; `nth-[…]`→`nth-…` rewrite — required-change 4 makes the latter explicit).
- **§11.6 idioms** — PASS. One seam per concern; removes the escape hatch, adds no second spelling; CONVERGE preserved.
- **§11.7 class-string contract** — PASS. Prefix read verbatim (`extract.ts:197-219`), base is a vocab class; no vocab row needed; fixtures lock the round-trip. Caveat folded into §11.4 (a closed-head literal with no real v4 variant would emit dead CSS).
- **§11.8 docs/guideline-sync** — PASS. Every `api_surface` symbol covered (lib README/JSDoc/CHANGELOG + extractor/eslint READMEs); required-change 1 also touches the README sub-table and type tests.
