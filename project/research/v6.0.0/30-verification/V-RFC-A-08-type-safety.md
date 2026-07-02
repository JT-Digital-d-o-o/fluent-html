---
rfc: RFC-A-08
lens: type-safety
verdict: survives-with-changes
confidence: 0.72
killer_objection: "The RFC's load-bearing safety claim — 'branded Id ⇒ zero XSS surface by construction' — is false. The `Id` brand certifies provenance (it came from createId/defineIds), NOT content: `createId(name: string)` accepts any string with no charset validation (ids.ts:45), and `el()`/`resolveId()` interpolate `Id.id` RAW into a single-quoted JS literal with no escaping (behavior-methods.ts:42,38). So `formResetOnSwap`/`dismissOnEscape` are NOT type-safe against injection; the types reject a *bare string* but not a *malicious-but-branded string*. A wrong call compiles."
required_changes:
  - "Strike the claim 'A bare string is a compile error, so the JS template can only ever interpolate a controlled, validated id — zero XSS surface by construction' from the Type-safety story (bullet 2) and the matching Guidelines-impact line ('options taking target/trigger/unless require a branded Id ... compile-time safe'). The brand is provenance, not validation: createId(name: string) (ids.ts:45) brands ANY string with no charset check; el() (behavior-methods.ts:42) interpolates Id.id raw into document.getElementById('...') with zero escaping. Replace with: branding narrows the type (no bare strings) but does NOT sanitize the value."
  - "Route id interpolation through the fixed escapeJs (or a dedicated escapeIdLiteral) inside resolveId/el BEFORE shipping the new behaviors. The RFC's escapeJs fix only reaches clipboard.value (behavior-methods.ts:61); the new formResetOnSwap/dismissOnEscape use el(opts.unless)/el(opts.trigger), which bypass escapeJs entirely. Alternatively enforce a safe id charset in createId/defineIds (currently unenforced, ids.ts:45,103). Without one, the §11.3 escape guardrail is violated for the two new behaviors."
  - "Resolve the htmx separator open question (colon htmx:after:swap vs kebab htmx:after-swap) BEFORE locking the HxOnEvent literal union, and align it with the formResetOnSwap renderer string (RFC §2 emits 'htmx:after-swap' while the cited rideshare source uses htmx:after:swap, settings.view.ts:260). An autocomplete that confidently suggests the wrong, non-firing separator is a net type-safety regression vs plain string, because (string & {}) hides the mistake at compile time."
  - "Make the event-name guard required, not optional (open question #2). event is interpolated raw into the attribute NAME (hx-on:${event}) and HxOnEvent collapses to string via (string & {}), so event: 'click\" onload=\"x' compiles. Add a dev-only assert rejecting whitespace and \" ' = > in event."
---

# Verdict: RFC-A-08 — type-safety lens

> You are an ADVERSARY. Your job is to KILL this RFC through the type-safety lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The RFC's type-safety story has one honest part (`.hxOn` is *typed*, not *type-safe*, and says so) and one part that is actively wrong and load-bearing.

- **Failure mode 1 — the brand is provenance, not validation (the killer).**
  The Type-safety story, bullet 2, states: *"Branded `Id` ... A bare string is a compile error, so the JS template can only ever interpolate a controlled, **validated** id — **zero XSS surface by construction**."* This is the stated reason `formResetOnSwap`/`dismissOnEscape` are behaviors rather than `.hxOn` calls. It is false on two independent, source-verifiable counts:
  1. `createId(name: string): Id` (`src/ids.ts:45`) and `defineIds<const T extends readonly string[]>` (`src/ids.ts:103`) apply `__idBrand` to **any** string with **no charset validation** — grepping `test(`/`replace`/`validate` finds only the kebab→camel key transform, never an id-content check. An `Id` is "any string the author chose to brand," not "a validated id."
  2. The renderer interpolates that raw string with **zero escaping**: `el(value)` → `` `document.getElementById('${resolveId(value)}')` `` and `resolveId` returns `(value as Id).id` verbatim (`behavior-methods.ts:42,38`). An id like `x') ; alert(1) ; ('` yields a broken-out, executing `hx-on` handler. The *type system did its job* (rejected a bare string) and the value is *still* an injection. The types do not prevent the misuse the RFC says they prevent. **A wrong call compiles.**

  For a type-safety RFC this is fatal-as-written: the design elevates the branded-Id path *above* `.hxOn` specifically on the false premise that it is injection-proof. Removing the premise weakens the rationale for splitting the two lifecycle patterns into behaviors, and the §11.3 escape guardrail the RFC claims to *strengthen* is in fact freshly violated on the new path.

- **Failure mode 2 — the escapeJs fix doesn't reach the new behaviors.**
  The RFC's third pillar fixes `escapeJs`, but `escapeJs` is wired to exactly one renderer input: `clipboard.value` (`behavior-methods.ts:61`). The two NEW behaviors interpolate via `el()`, which never calls `escapeJs`. The headline bug-fix and the headline new feature do not compose on the data axis: the fix improves an existing path while the new path that most needs escaping (id → JS literal) gets none.

- **Failure mode 3 — `(string & {})` neutralizes the union exactly where it matters.**
  `HxOnEvent` is interpolated raw into the **attribute name** (`hx-on:${event}`). Because of `(string & {})`, `event: "click\" onload=\"alert(1)"` type-checks (it is a `string`). For *value* positions `(string & {})` is the established house idiom (HxSwap, HxTrigger, tailwind tokens) and is fine — but this is a *name* position with breakout potential, and the RFC's own open question admits it isn't sure whether to validate. The union buys autocomplete and nothing else here.

- **Failure mode 4 — autocomplete will confidently suggest a dead event.**
  Open question #1 concedes the htmx-4 separator is unconfirmed (kebab `htmx:after-swap` in the union vs colon `htmx:after:swap` in the cited rideshare source, `settings.view.ts:260`). The `formResetOnSwap` renderer hard-codes `"htmx:after-swap"`. If the canonical separator is the colon form, both the union and the new behavior ship a silently non-firing handler, and `(string & {})` guarantees the mistake never surfaces at compile time. Autocomplete that suggests a wrong-and-non-functional value with full IDE confidence is a net type-safety regression vs plain `string`.

- **Minor — frontmatter over-claims.** §11.4 is marked `pass` ("branded `Id` options"), but per failure mode 1 the branded option is not a safety boundary. The self-check is wrong on its own terms.

## Does it survive?

**survives-with-changes.** The `.hxOn` core is genuinely well-typed for what it is — an honest, typed-not-type-safe escape hatch whose JSDoc and "NEVER interpolate user content" warning are correct — and the `escapeJs` fix is a real improvement. But the RFC ships a **false type-safety claim as load-bearing rationale** (brand ⇒ zero XSS), and that false claim conceals a **fresh, unescaped injection path** in the two new behaviors. That is squarely in this lens's kill zone: the types are asserted to prevent a misuse they do not prevent, and a wrong call compiles. It avoids full `reject` only because every defect is mechanically fixable without redesign — escape the id literal (or enforce id charset), correct the prose, resolve the separator, and make the event-name assert required. All four are in `required_changes` and fold back into the RFC.

## Guardrail check (§11.4 type-safety — this lens owns it)

**FAIL as written, PASS with required changes.** The §11.4 self-check (`pass`, "branded `Id` options") is incorrect: the brand certifies provenance, not content, and the id value is interpolated into JS with no escaping (`behavior-methods.ts:38,42`; `ids.ts:45`). Bare-string rejection is real but is not injection-safety. The lens cannot certify §11.4 until the id-literal interpolation is escaped (or the charset enforced at `createId`/`defineIds`) and the "zero XSS surface by construction" claim is struck. This finding overlaps the `security/escape` lens (§11.3) and should be escalated jointly — the false claim is the *type-safety* failure (types asserted to do work they don't do); the unescaped interpolation is the *security* failure.
