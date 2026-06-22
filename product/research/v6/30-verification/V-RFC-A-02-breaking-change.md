---
rfc: RFC-A-02
lens: breaking-change
verdict: survives-with-changes
confidence: 0.82
killer_objection: "The RFC claims 'breaking: additive — nothing breaks,' but the existing setAria runtime kebab-converts camelCase keys (key.replace(/[A-Z]/g,...)), and the new AriaAttributeName union declares only all-lowercase multi-word keys (haspopup, labelledby, describedby, valuenow, …). Every existing camelCase call — including the library's OWN documented example README.md:1803 `setAria({ hasPopup: true })` and the tested test/patterns.ts:46 — becomes a compile error under the narrowed type. Worse, the documented break is un-codemod-able cleanly: today `hasPopup` renders the INVALID `aria-has-popup`; the only type-legal fix (`haspopup`) renders a DIFFERENT string `aria-haspopup`, a silent behavioral change the RFC never marks."
required_changes:
  - "Reclassify frontmatter `breaking: additive` → `breaking: breaking` (or carve the setAria narrowing out as its own breaking item). The setAria type narrowing is a hard compile break for camelCase multi-word keys, not additive. setRole/setTabindex/setTitle ARE additive; only the setAria signature change is breaking."
  - "Fix the false claim in 'Migration & compatibility': recon verified VALUE types, not KEY types — the break is on keys. Either (a) widen AriaAttributeName to accept both casings for multi-word attrs ('haspopup'|'hasPopup', 'labelledby'|'labelledBy', 'describedby'|'describedBy', 'activedescendant'|'activeDescendant', plus value-range/grid keys) so existing code keeps compiling, OR (b) accept the break and document it."
  - "Resolve the kebab-conversion semantic collision explicitly: runtime key.replace(/[A-Z]/g, l => '-'+l) turns hasPopup→aria-has-popup (invalid HTML) but haspopup→aria-haspopup (valid). Migrating hasPopup→haspopup CHANGES rendered output. State this behavioral change, list affected attributes, and provide a codemod that rewrites BOTH the setAria key AND verifies output — the current 'optional codemod' only touches addAttribute call-sites and never touches setAria keys."
  - "Migrate the library's own surfaces in the same release: README.md:1803 (hasPopup → aria-has-popup example) and test/patterns.ts:46/50 (hasPopup / aria-has-popup) — otherwise v6 ships docs and tests that use a now-illegal key and fail to compile/pass."
  - "Mark the ariaDescribeAlgebra output change as a behavioral break to string/snapshot consumers. test/recursion-schemes.ts pins exact strings via assert.equal; the new role/aria-label branch changes output for any element carrying role or aria-label (image (no alt)→image 'Chart'). For a fold algebra the output string IS the contract — bundle the test updates and warn downstream auditors."
  - "Bundle all of the above into breaking-changes.md as ONE migration (guardrail §11.5b)."
---

# Verdict: RFC-A-02 — breaking-change lens

> You are an ADVERSARY. Your job is to KILL this RFC through the breaking-change lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The RFC's frontmatter says `breaking: additive` and its Migration section opens "**Additive — nothing breaks.**" Both claims are false. There are two unmarked breaks, one of which is in the library's own documented and tested API.

### Failure mode 1 — the `setAria` key narrowing is a hard compile break (the headline lie)

The existing runtime (`src/core/tag.ts:298-305`) does **camelCase→kebab** conversion on every key:

```ts
const kebabKey = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
this.attributes[`aria-${kebabKey}`] = String(value);
```

The old type `Record<string, string | boolean>` accepts **any** key, so the established convention is camelCase. Proof this is the live convention, not a hypothetical:

- **The library's own README.md:1803**: `hasPopup: true   // → aria-has-popup`
- **The library's own test test/patterns.ts:46,50**: `setAria({ … hasPopup: true })` asserting `aria-has-popup="true"`.

The RFC's new `AriaAttributeName` (and the `AriaAttrs` value-side `Partial<Record<…>>`) declares the multi-word ARIA attributes **only in all-lowercase**: `haspopup`, `labelledby`, `describedby`, `activedescendant`, `valuenow`, `valuemin`, `valuemax`, `valuetext`, `roledescription`, `errormessage`, `keyshortcuts`, `colcount`, `posinset`, `setsize`. Under the narrowed type, **`setAria({ hasPopup: true })` no longer type-checks** — compile error. v6 would ship with its own README example and its own test failing to compile. That is the textbook §13 "a breaking API sneaks in unmarked" failure mode, and §11.5 (additive-by-default; breaking must be marked + bundled + codemod-able) is violated.

The RFC's defense — "recon shows all passed values are `string`/`boolean`... No app in the survey passes a value type that the new signature rejects" — is a category error. The narrowing that breaks code is on the **key** type, not the **value** type. Recon audited values and declared victory; nobody audited keys. Cross-workspace grep confirms the surface is live: `rideshare/.../tooltip.view.ts:74` already calls `.setAria({ describedby: id.id })` — apps DO pass multi-word aria keys through this method, so the casing question is load-bearing.

### Failure mode 2 — the "fix" silently changes rendered HTML (un-codemod-able behavior change)

The subtler, nastier half. Today `hasPopup` renders `aria-has-popup` — **invalid HTML** (the real attribute is `aria-haspopup`, no hyphen; `aria-has-popup` is ignored by AT). The RFC's only type-legal spelling, `haspopup`, the same runtime renders as the **correct** `aria-haspopup`. So `hasPopup → haspopup` is not a rename; it **changes the emitted attribute** (`aria-has-popup` → `aria-haspopup`) and therefore the rendered document and any snapshot over it. The RFC marks this nowhere, and its "optional cleanup codemod" only rewrites `addAttribute("role"|…)` call-sites — it never touches `setAria` keys, so it can neither perform nor detect this break. A user who mechanically fixes the compile error gets different HTML with no warning.

### Failure mode 3 — `ariaDescribeAlgebra` is a behavioral break to a string contract, mislabeled "no API change"

The RFC calls the algebra change "behavior, no API change / more accurate output." For an **auditing algebra whose entire output is its contract**, a string-output change *is* the break. `test/recursion-schemes.ts` pins exact outputs via `assert.equal` (`"image (no alt)"`, `"div#main containing: Content"`, …). The new role/aria-label branch changes output for any element carrying `role` or `aria-label`. The lib's own tests, and any app snapshotting a11y audits, break. For a fold algebra the output string IS the API.

## Does it survive?

**survives-with-changes.** The motivation is sound and `setRole`/`setTabindex`/`setTitle` are genuinely additive — verified: no existing `setRole`/`setTabindex`/`setTitle` symbols in `src/`, no collision. The RFC fails the breaking-change lens only on **mislabeling and a missing migration**, not on its goal, so it does not warrant outright reject — the breaks are small, enumerable, and fixable. But it must NOT ship as `breaking: additive`.

If the author declines failure-mode-1 mitigation (won't widen to dual-casing AND won't reclassify as breaking), escalate to **reject**: an unmarked compile-break of the library's own documented API is a §11.5 killer, not an outvotable nit.

## Guardrail check (breaking-change owns §11.5)

§11.5 **fails as written**: the change is breaking (camelCase keys + altered render output), is NOT honestly marked (`breaking: additive`), the offered codemod does NOT cover the breaking surface (ignores setAria keys), and it is NOT yet bundled into `breaking-changes.md`. All four sub-clauses (mark / bundle / codemod / justify) are unmet for the setAria portion. The `setRole`/`setTabindex`/`setTitle`/type-export portions independently satisfy §11.5 as additive. The required changes above bring the whole RFC back into compliance.
