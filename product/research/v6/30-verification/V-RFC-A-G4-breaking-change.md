---
rfc: RFC-A-G4
lens: breaking-change
verdict: survives-with-changes
confidence: 0.86
killer_objection: null
required_changes:
  - "Correct the RFC's Migration claim that the error string is `non-observable`: tag.ts:27 is asserted by four regex tests (test/security.ts:83,90,97,104). State explicitly that any reword MUST preserve the literal substring `Event handler attribute \"<key>\" is blocked` so those partial-match regexes keep passing. The current draft reword is compatible (it preserves that prefix), but the RFC must say the constraint, not claim the string is unobserved."
  - "Fix the fabricated type name in the `## Proposed API` `existing — unchanged` block: the RFC writes `on(state: VariantState, ...)` and `at(bp: Breakpoint, ...)`, but the real declared type is `on(state: TailwindState, ...)` (tailwind-methods.ts:107) and there is no `Breakpoint` type by that name. In an RFC whose thesis is docs-vs-reality accuracy, a wrong type name in its own signature block is self-undermining. Scope: RFC prose only — the shipped guideline patches use call-sites, not type names, so they are unaffected."
  - "Reconcile the behavior list in the reworded error: the `Proposed API` block lists `\"toggleClass\"` but example (E) omits it. Verify every behavior named in the thrown message actually exists in the behavior registry before baking it in — an error that names a non-existent API recreates the exact F-A-092 trap this RFC closes."
---

# Verdict: RFC-A-G4 — breaking-change lens

> I am an ADVERSARY. My job was to KILL this RFC by finding hidden, non-codemod-able breakage that the `additive` frontmatter conceals. Default is reject under uncertainty.

## Attack

I hunted the three classic ways a "docs-only, additive" RFC ships silent breakage: (a) a runtime string the RFC calls "non-observable" that is in fact asserted somewhere; (b) a claimed-existing signature that differs from source, making "unchanged" false; (c) a behavioral change smuggled under a doc edit.

- **breaking-change failure mode 1 — the "non-observable error string" IS observable, and the RFC denies it.** RFC §Migration states the error-message change is *"thrown only on already-invalid input ... neither is observable program behavior."* This is **false as written.** `test/security.ts:83,90,97,104` assert on that exact error (`/Event handler attribute "onclick" is blocked/` and three siblings). Rewording tag.ts:27 touches test-observable behavior, contradicting the `additive` / `no codemod` framing. A verifier who stopped at the frontmatter would have shipped a red suite.
  - **It does not kill the RFC, by luck of regex shape.** I checked the four regexes against the proposed new string. All are *prefix* matches ending at `is blocked` with no trailing anchor. Original: `... is blocked — use client-side JS or HTMX instead`. Proposed: `... is blocked. For client interactions use .behavior(...)`. The asserted substring `Event handler attribute "onclick" is blocked` survives verbatim. I also grepped for any full-`.message` equality assertion, em-dash assertion, the strings `client-side` / `HTMX instead`, or any snapshot referencing the message — **none exist** anywhere in `test/` or `src/`. So the reword passes today's suite, but by accident of how the assertions were written, not by stated design. That gap (claim: unobserved; reality: observed-but-compatible) is a documentation defect to correct so a future reword does not break silently — required change #1, not a reject.

- **breaking-change failure mode 2 — "existing, unchanged" signatures that don't match source.** The RFC's `Proposed API` block asserts the promoted methods ship today with the stated contracts. I verified each: `display(value: TailwindDisplay)` (declared tailwind-methods.ts:190 ✓), `hidden()` (✓ :470), `transition(value?)` (✓ :224/:525), `on`/`at` (✓ :107/:326/:330), and `TailwindDisplay` is the exact 15-member union claimed (tailwind-types.ts:118 ✓). **All real.** One inaccuracy: the variant param type is named `TailwindState`, not the RFC's `VariantState`, and there is no `Breakpoint` type. Not breakage — a credibility wound in an RFC whose premise is "the docs misdescribe the surface." Required change #2.

- **breaking-change failure mode 3 — behavioral change under a JSDoc edit.** I checked whether the corrected `.when()` JSDoc (replacing non-existent `t.children(...)` with `t.addAttribute("data-avatar", avatar)`) or the `.apply()` JSDoc edit alters emitted markup or any contract. They do not — JSDoc is stripped at runtime; `.when()`'s overload (`value: NonNullable<T>`, tag.ts:197) is untouched. The runtime is `p.display = function(value){ return this.addClass(value); }` (tailwind-methods.ts:469), so `display("flex")` emits a byte-identical class to `addClass("flex")` — promoting `.display()` over `.addClass()` is a pure teaching change with identical output. No render-path divergence; no new classes emitted, so guardrail §7 (lib/extractor/eslint class vocabulary) is untouched. **Clean.**

- **Latent self-inflicted F-A-092 re-trap.** The reworded error lists `"toggleClass"` in the `Proposed API` block but omits it in example (E). If `toggleClass` is not a registered behavior, the *new* error names a non-existent API — exactly the failure this RFC exists to close. Reconcile and verify. Required change #3 (low severity, codemod-free).

## Does it survive?

**survives-with-changes.** Through the breaking-change lens this is an honestly-shaped additive change: no public signature, type, or render behavior moves; the class-string contract (§7) is untouched; no codemod or `breaking-changes.md` entry is warranted. The only real breakage vector — the thrown error string — is **test-coupled but compatibly reworded**, surviving every existing assertion by preserving the asserted prefix. The frontmatter `breaking: additive` is correct *in outcome* but reached via a **false premise** ("non-observable"), which is precisely the unverified claim this wave exists to catch. Fixing the three items closes the gap without changing scope. I do not reject: every breakage I tried to construct dissolved against the actual test regexes, and the worst case is a three-line accuracy correction.

## Guardrail check (§11.5 backward-compat — owned by this lens)

- No public API signature, type, or runtime behavior changes. ✓
- The error-string edit is the only test-observable change; verified compatible with all four `test/security.ts` regex assertions (prefix preserved). ✓ — but the RFC must *say so*, replacing its inaccurate "non-observable" claim (required change #1).
- No new emitted classes → §7 cross-package class-string contract untouched; no extractor/eslint sync needed. ✓
- Additive: nothing renamed or removed; no codemod, no `breaking-changes.md` entry. ✓
