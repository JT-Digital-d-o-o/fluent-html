---
rfc: RFC-A-G2
lens: breaking-change
verdict: survives-with-changes
confidence: 0.75
killer_objection: "Two codemod-introduced breakages plus a false-but-mismarked type claim. (1) The auto-fixer is sold as 'the codemod' but its kebab->camel key extraction is not round-trip-safe: data-user-ID, data-a-1-b, data-123-x either syntax-error or get silently re-kebabed to a DIFFERENT attribute name by setDataAttrs. (2) The style rewrite changes rendered bytes when a setStyle already exists on the chain (today: double-render, first wins; after: overwrite, last wins) — verified against render.ts:205. (3) Separately, the headline type-safety win is undeliverable additively: I verified with project tsc that the proposed open AriaAttrs does NOT catch setAria({lable:'x'}) — every string key is legal — so 'typos surface in tsc' (lines 47/167/248) is false; the only design that catches typos is a CLOSED union, which IS breaking for object-literal keys outside the 48-entry list. The RFC either does nothing or breaks, but advertises both safety and additive."
required_changes:
  - "Type-safety claim: the proposed AriaAttrs (open intersection with Record<`${string}`,…>) catches ZERO typos — verified setAria({ lable: 'x' }) compiles clean under project tsc --strict. DELETE the false 'typos surface in IDE/tsc' / 'compile-error' language (lines 47, 167, 248) OR switch to a CLOSED union Partial<Record<AriaAttribute,string|boolean>> (no string index arm), mark `breaking: breaking`, and add a breaking-changes.md entry. There is no additive design that both keeps the escape hatch open AND catches typos — pick one and mark it honestly. Also fix the prose/code mismatch: line 72/167 say `(string & {})` but lines 73-74 write `Record<`${string}`,…>`; neither catches typos (both collapse to a full string index), so the §11.4 PASS is overstated."
  - "If choosing the closed union: audit all 45 cited addAttribute('aria-*') sites + every existing setAria object-literal call for keys outside the 48-entry list, and complete the list — it omits real ARIA attrs (aria-braillelabel, aria-brailleroledescription, aria-multiline, aria-rowindextext, aria-colindextext). An incomplete closed union silently breaks valid accessibility code and forces devs BACK to addAttribute — the exact anti-pattern this RFC retires."
  - "Fixer data-*/aria- guard: only auto-fix a call when toKebab(toCamel(suffix)) === suffix AND toCamel(suffix) is a valid bare JS identifier (/^[A-Za-z_$][A-Za-z0-9_$]*$/). Otherwise emit a warning with NO fix (leave addAttribute in place). Round-trip examples that MUST be left alone: data-user-ID, data-a-1-b, data-123-x, data-x-2y, data-a--b. Add these as fixer test fixtures."
  - "Fixer style guard: do NOT auto-fix addAttribute('style', s) -> setStyle(s) when the same receiver chain already contains a setStyle/setStyles/any style-writing fluent call; flag-only in that case. Reason: today both render (double style attr, browser uses first); after rewrite setStyle overwrites (last wins) — different rendered output, not behavior-preserving (verified render.ts:205)."
  - "Migration honesty (ALGORITHM §8 no-silent-caps): mark the style auto-fix as behavior-changing in breaking-changes.md; state the fixer is partial-by-design (flag-only for non-round-trippable keys and ambiguous-style cases), NOT a complete codemod. The residual hand-migration set must be acknowledged, not implied to be zero."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-A-G2-breaking-change.md
---

# Verdict: RFC-A-G2 — breaking-change lens

> You are an ADVERSARY. Your job is to KILL this RFC through the breaking-change lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

I tried to kill this on the library surface first, then on the migration tooling. The library surface held; the tooling did not.

### What I tried to break and FAILED to break (RFC is correct here)

- **`setAria` signature change is genuinely source-compatible.** I type-checked the proposed `AriaAttrs = Partial<Record<AriaAttribute, string | boolean>> & Record<\`${string}\`, string | boolean>` with the project's own `tsc` (strict). Empty objects, single known camelCase keys, arbitrary escape-hatch keys, `string|undefined`-via-fallback values, boolean values, and assignment *from* a plain `Record<string, string|boolean>` (the old parameter type) all compile. The escape arm `` Record<`${string}`, …> `` means every previously-valid call still type-checks. The "strictly wider-compatible" / non-breaking claim survives. No `breaking-changes.md` entry needed for the type *as written*. **This attack failed** — but only because the type is a no-op (see failure mode 0 below: that same compatibility means it catches nothing).
- **`role` interleaving across an aria run.** The fixer's "strictly-adjacent same-prefix run" rule will *not* merge `aria-modal`, `role`, `aria-label` across the `role` call (it's not `aria-`), so it can't reorder an aria attr past `role`. The RFC's adjacency constraint is sound. **This attack failed.**
- **`addAttribute` retention.** Runtime stays permissive; lint-only. Apps not on the plugin are untouched. **This attack failed.**

### What actually breaks (the real attack)

#### Failure mode 0 — the type-safety win is undeliverable additively (the additive marking hides an impossible choice)

The frontmatter says `breaking: additive` and §11.5 self-checks PASS. Both are true — **but only because the new type catches nothing**, which silently voids the RFC's stated reason to exist. The `## Type-safety story` (line 167) and the Problem section (line 47) promise that `setAria({ lable: "x" })` will now error in tsc. I reproduced the *exact* proposed type with the project's own compiler:

```
setAria({ lable: "x" });   // EXIT=0 — NO ERROR
```

The `` Record<`${string}`, string | boolean> `` intersection arm makes every string key a legal known property, so excess-property checking never fires. The three load-bearing claims — line 47 ("misspelling … compiles and renders aria-lable" framed as the bug being fixed), line 167 ("typos surface in IDE/tsc"), line 248 (§11.4 "PASS") — are **false as written**. The improvement is autocomplete only, not checking.

The RFC is trapped between two designs and ships the wrong one:
- **Open type (as written):** non-breaking ✓, catches typos ✗ → cosmetic. The Type-safety section is false advertising.
- **Closed union** (`Partial<Record<AriaAttribute, …>>`, no string arm): catches typos ✓, but is **breaking** — I verified `setAria({ braillelabel: "x" })` errors `TS2353` under a closed union. Any object-literal `setAria`/migrated `addAttribute("aria-*")` whose key is outside the hand-curated 48 fails to compile.

There is no additive design that delivers the promise. The `(string & {})` precedent the RFC cites (recon §2.7) is for **value** unions, not object **keys** — I confirmed `(string & {})` collapses to `string` and also fails to catch the typo. So the §11.4 PASS (type-safety) and the §11.5 PASS (additive) are **mutually inconsistent**: you can have one or the other, not both. This is exactly the mis-marked-breaking failure mode this lens exists to catch.

#### Failure mode 1+2 — the codemod is not the clean migration it claims

The RFC's load-bearing migration claim is: *"The ESLint auto-fixer IS the codemod. One command migrates every cited call-site."* That oversells a fixer that is neither total nor round-trip-safe.

- **breaking-change failure mode 1 — fixer emits invalid or corrupting keys.** The fixer key extraction is `toCamel(suffix) = suffix.replace(/-([a-z])/g, (_,c)=>c.toUpperCase())`. The library's `setDataAttrs`/`setAria` apply the inverse `toKebab = s.replace(/[A-Z]/g, l => '-'+l.toLowerCase())`. This pair is **not** an involution over all inputs:
  - `data-a-1-b` -> fixer key `a-1B` -> **not a valid bare identifier**; emitted unquoted it's a syntax error, and `{ a-1B: x }` is malformed JS.
  - `data-user-ID` -> fixer key `user-ID` -> if quoted as `{ "user-ID": x }`, `setDataAttrs` re-kebabs to `user--i-d` ≠ `user-ID`. **Silent attribute-name corruption** — the rendered `data-*` name changes. This is the worst kind of "codemod": it changes behavior and passes the compiler.
  - Also broken: `data-123-x` (`123X`), `data-x-2y` (`x-2y`), `data-a--b` (`a-B` -> re-kebab `a-b` ≠ `a--b`).
  I confirmed the enumerated rideshare/ttl/landing call-sites are all lowercase single-segment kebab and DO round-trip cleanly (`data-phone-autodetect` -> `phoneAutodetect` -> back). So the *cited* census is safe — but the fixer ships to the unenumerated 351-site census and to all future code, where these keys are entirely legal HTML. A shipped `--fix` that can corrupt `data-user-ID` is a latent breaking change, not a clean migration.

- **breaking-change failure mode 2 — the `style` rewrite is behavior-changing, sold as a bug-fix.** The RFC's framing ("no double-render… removes the double-render bug") is true in isolation, but I confirmed in `render/render.ts:205` that the dedicated `style` field and `attributes["style"]` are emitted independently and in that order. So `.setStyle("a").addAttribute("style","b")` today renders `style="a" style="b"` (two attributes; browsers use the FIRST). The fixer rewrites this to `.setStyle("a").setStyle("b")`, where the second `setStyle` **overwrites** the field -> renders `style="b"` (LAST wins). For any tag that mixed a fluent/`setStyle` style with an `addAttribute("style")`, the auto-fix changes the resolved style value. That is an observable behavioral change introduced *by the codemod*, and the RFC files it under "removes a bug" rather than "migration caveat."

- **breaking-change failure mode 3 — completeness is overstated (ALGORITHM §8 no-silent-caps).** Because of (1) and (2), the honest design is a *partial* fixer (flag-only for non-round-trippable keys and for style-on-an-existing-style-chain). The RFC implies the residual hand-migration set is empty. Per §8 that residual must be logged, not implied to zero.

## Does it survive?

**survives-with-changes.** It is not a clean kill: the lint-only enforcement, the guideline reorder, and the genuine `style` double-render correctness fix are durable, true wins, and the `setAria` retype is non-breaking at the compiler level (verified). But the RFC cannot ship as written. It advertises (a) a type-safety guarantee it does not deliver — and the only design that delivers it is breaking and would be mismarked — and (b) a "one command migrates every site" codemod that is partial and, in two input classes, silently behavior-changing. None of these is a hard §11 guardrail kill (the API stays additive, `addAttribute` is retained), so it survives rather than rejects — but the author must (1) reconcile the type-safety and additive claims by picking one lane and marking it honestly, (2) make the fixer conservative (flag-only on non-round-trippable keys and on style-over-existing-style), and (3) mark the `style` rewrite behavior-changing. With the required changes folded in, it ships; until then both the §11.4 and the migration claims are not credible.

## Guardrail check (breaking-change owns §11.5)

- §11.5 backward-compat: **PASS at the API level — but inconsistent with §11.4.** `setAria` as written is source-compatible (verified via `tsc --strict`); `addAttribute` retained; no removed/renamed symbols; runtime impl unchanged. However, this PASS holds *only* for the open (typo-blind) type. The §11.4 type-safety PASS the RFC also claims requires a *closed* type, which would violate §11.5. The two self-checks cannot both be true; resolution required (required change 1).
- §11.5 codemod-ability: **CONDITIONAL.** "Codemod-able where possible" requires the fixer to refuse the cases it cannot mechanically and behavior-preservingly migrate (required changes 3–4), and the one behavior-changing rewrite (style) to be bundled into `breaking-changes.md` as a caveat (required change 5). Until then the migration is mismarked as fully mechanical, and line 176's "No `breaking-changes.md` entry" is wrong if the closed-union lane is chosen.
