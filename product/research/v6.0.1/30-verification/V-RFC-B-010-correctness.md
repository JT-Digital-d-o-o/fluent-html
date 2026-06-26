---
rfc: RFC-B-010
lens: correctness
verdict: survives-with-changes
confidence: 0.74
killer_objection: null
required_changes:
  - "Fix the vocab/lib-parity contract for the anchor emitters. The proposed rows `custom(\"anchorName\", (a) => [`[anchor-name:--${a[0]}]`], [[\"panel\"]])` model the emitter input as a raw string, but the real `anchorName(name: Id)`/`positionAnchor(name: Id)` take an `Id` and must read `name.id`. The shipped parity guard `test/class-vocab.test.ts` (`samplesFor` → `custom` case) applies `def.samples` arrays VERBATIM to the live method: `proto[def.method].apply(Div(), [\"panel\"])`. That passes the string `\"panel\"` where an `Id` is expected, so `name.id` is `undefined` and the lib renders `[anchor-name:--undefined]`, which will NOT equal the vocab's `[anchor-name:--panel]` — the anti-drift test fails. The RFC must either (a) have the lib method extract `.id` and pass the dashed-ident STRING into a shared emit core whose vocab samples are plain strings (so the parity harness stays string-based and the `Id` type lives only on the public method signature), or (b) extend `samplesFor`/the harness to construct `Id` objects for these rows. Pick one and spell it out; as written the two halves are type-incompatible and the parity test breaks."
  - "Correct the false claim that `Id.id` is 'already constrained to ID-safe characters by defineIds.' `createId`/`defineIds` (src/ids.ts:45-115) perform ZERO validation — any string is accepted. An id containing whitespace, `]`, or `:` would emit a malformed arbitrary class `[anchor-name:--<garbage>]`. Either add ID-safe validation at the `Id` boundary (out of scope / parked) or downgrade the RFC's safety claim to 'authors must use ID-safe ids' and note the dashed-ident is emitted verbatim. Do not assert a guarantee the code does not provide."
  - "Acknowledge that the anchor-name/position-anchor classes are NOT statically extractable, contradicting the 'extractor stays in lockstep' framing. The extractor's `parseLiteralArgs` (fluent-html-tailwind-extractor/src/extract.ts:76-91) returns `null` for any non-string-literal argument, so `anchorName(menu)` / `positionAnchor(menu)` (an `Id` VARIABLE) are always classified UNRESOLVED — the `[anchor-name:--…]` / `[position-anchor:--…]` classes never enter the static safelist, and Tailwind v4's own scanner also won't synthesize them from a variable. Only `positionArea(\"literal\")` resolves cleanly. The RFC must state that the two Id-derived emitters rely on the unresolved/safelist policy (not clean static extraction) and confirm that policy force-includes them, or the classes silently fail to generate in production CSS."
file: /Users/tony/jt-digital/fluent-html/product/research/v6.0.1/30-verification/V-RFC-B-010-correctness.md
---

# Verdict: RFC-B-010 — correctness lens

> Adversarial review. Goal: kill the RFC on correctness grounds. Default reject under uncertainty.

## Attack

The RFC presents three additive primitives (Popover setters, invoker Commands, anchor-positioning emitters). The popover and command halves are clean: they emit plain attributes through the standard escape path, the unions are closed (`PopoverState`, `PopoverAction`, `CommandFor` with the `--${string}` author arm), `ButtonTag` schema-key serialization is the established pattern, and `openDialog`/`closeDialog`/`BooleanAttribute` are genuinely untouched. No correctness fault there.

The anchor-positioning third carries three concrete defects:

- **correctness failure mode 1 — the parity test breaks.** The lib's anti-drift contract (`test/class-vocab.test.ts`, "lib parity") renders every `classVocab` row through the REAL method and asserts the output equals `emitClasses(def.emit, …)`. For `custom` rows the harness (`samplesFor`) feeds `def.samples` — string tuples like `["panel"]` — straight into `proto[method].apply(Div(), sample.lib)`. The RFC's `anchorName(name: Id)` reads `name.id`; handed the string `"panel"`, `.id` is `undefined`, so the lib emits `[anchor-name:--undefined]` while the vocab emitter (`a => [`[anchor-name:--${a[0]}]`]`) emits `[anchor-name:--panel]`. They disagree → the shipped guard fails. The RFC's vocab samples and its `Id`-typed signature are mutually inconsistent and it never resolves the Id→string bridge.

- **correctness failure mode 2 — false ID-safety guarantee.** The RFC states the dashed-ident is safe because "the Id's raw `.id` … is already constrained to ID-safe characters by `defineIds`." It is not: `createId`/`defineIds` (src/ids.ts) do no validation whatsoever. The guarantee the RFC leans on to justify emitting `--${id}` verbatim into a class does not exist in the shipped code.

- **correctness failure mode 3 — silent extraction miss.** The two Id-derived emitters can never be statically extracted: `parseLiteralArgs` bails to `null` on any non-literal arg, and an `Id` call site is always a variable. The RFC's "extractor + eslint stay in lockstep" framing is misleading for these rows — the classes only survive via the unresolved/safelist fallback, which the RFC neither names nor verifies. `positionArea("bottom")` (literal) is fine.

## Does it survive?

Survives with changes. None of the three defects is existential — the core idea (typed primitives 1:1 over native Popover/Commands/anchor CSS) is sound, additive, zero-runtime, and escape-safe. The popover and command surfaces are correct as specified. But the anchor third ships a concrete test-breaking inconsistency (mode 1) plus a false safety claim (mode 2) and a misrepresented extraction story (mode 3). These fold back as the three required changes above; with them resolved the RFC is correct. The bar for `reject` (an irreparable correctness fault or a smuggled break) is not met — every defect is local to under-specification of the anchor emitters and fixable within the additive 6.1.0 envelope.

## Guardrail check (class-vocab-sync, co-owned)

The RFC's `class-vocab-sync` self-assessment is too generous. The popover/command setters emit attributes (correctly out of the class vocab). The three anchor emitters DO touch the vocab, and the RFC's sample rows are not parity-valid for `Id`-typed methods (mode 1). Lockstep with the extractor is also only partial (mode 3). The guardrail passes only after required changes 1 and 3 land. Escape-by-default and additive-only guardrails pass as written.
