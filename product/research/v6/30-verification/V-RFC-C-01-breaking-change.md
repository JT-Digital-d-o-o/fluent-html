---
rfc: RFC-C-01
lens: breaking-change
verdict: survives-with-changes
confidence: 0.82
killer_objection: "The RFC redefines the EXISTING exported `ExtractorOptions` interface — changing `onWarning` from `(message: string) => void` (shipped, src/index.ts:11-14) to `(info: { file?; method; argText }) => void` (RFC line 90) — while declaring `breaking: additive` and asserting 'No existing symbol changes shape.' Same exported symbol, incompatible shape. Every v3 consumer of `onWarning` either fails to compile or silently logs `[object Object]`. This is an unmarked breaking change to a public type, and it is NOT codemod-trivial (the callback body must be rewritten, not just its signature)."
required_changes:
  - "Do NOT mutate the existing `ExtractorOptions` shape. Keep `onWarning?: (message: string) => void` as the back-compat callback, and introduce the structured payload under a NEW field (e.g. `onUnresolved?: (info: { file?: string; method: string; argText: string }) => void`) or a distinct type `UnresolvedInfo` on a NEW interface. The string `onWarning` must keep emitting the pre-formatted string for current callers. Reflect this in the api_surface and Type-safety sections."
  - "Reconcile CJS vs ESM. The package ships `module.exports = fluentHtmlExtractor` (src/index.ts:749) with `\"main\": \"dist/index.js\"`, `tsconfig module: commonjs`, no `\"type\": \"module\"`, no `\"exports\"` map. Both consumers consume the callable default (rideshare `require`, ttl `import` default). Adding ESM-style `export function generateFluentSafelist/fluentHtmlPlugin/extractDefaultClasses` on top of a callable `module.exports = fn` is an interop hazard the RFC never addresses. Specify the dual-export build (named exports MUST be attached as `module.exports.generateFluentSafelist = ...` etc., OR add a proper `exports` map + `.mjs`/`.cjs` outputs) and prove the callable default survives, in the Migration section."
  - "Drop or correct the 'export what apps hand-rolled' framing for `extractDefaultClasses`. The internal regex (src/index.ts:689 `/[:\\w\\-/.@#[\\]]+(?:\\([^)]*\\))?/g`) is NOT identical to the apps' hand-rolled regex (RFC line 50 `/[a-zA-Z0-9_\\-:\\/]+(?:\\[[^\\]]+\\])?[a-zA-Z0-9_\\-]*/g`): the internal one matches `.@#`, parentheses, and dotted/at-prefixed tokens the app regex does not, and handles arbitrary-value `[...]` brackets differently. Swapping the app regex for the export is a behavioral change to the candidate set (more/different tokens emitted), not a no-op. Mark it as a behavioral change and add a regression test fixing the exported regex's output, OR ship the app's exact regex as the export."
  - "Justify the `peerDependencies` widening as non-breaking. Narrowing is breaking; widening `\">=3.0.0\"` → `\">=3.0.0 || >=4.0.0\"` is fine for the peer, but the RFC also says devDeps gain a second Tailwind 'under a workspace alias' running the suite twice — confirm this does not change the published peer resolution for existing v3 lockfiles. State explicitly that no consumer lockfile is invalidated."
  - "Add a `breaking-changes.md` entry. The RFC asserts 'none required for the package API' — false once `ExtractorOptions.onWarning` is touched and once the CJS default-export contract is involved. Even with the back-compat fixes above, the app-level migration off the dead `content.extract` hook (the v4 path) is a real, motivated breakage that must be bundled into the single migration guide per guardrail §11.5(b), with the 3-step recipe and the codemod scope (which steps are mechanical vs manual)."
---

# Verdict: RFC-C-01 — breaking-change lens

> You are an ADVERSARY. Your job is to KILL this RFC through the breaking-change lens.
> Default to `reject` under uncertainty.

## Attack

The RFC's central safety claim is its Migration section: *"Additive. No existing symbol
changes shape."* and its frontmatter `breaking: additive`. I checked this against the shipped
source. It is false in at least one provable way and unsubstantiated in two others.

- **Killer — `ExtractorOptions` is mutated in place (silent type break).** The shipped interface
  (`fluent-html-tailwind-extractor/src/index.ts:11-14`) is:
  ```ts
  export interface ExtractorOptions {
    onWarning?: (message: string) => void;
  }
  ```
  The RFC (lines 84-96) redeclares the **same exported name** with:
  ```ts
  onWarning?: (info: { file?: string; method: string; argText: string }) => void;
  ```
  This is a contravariant change to a callback parameter on a public, exported type. Every
  existing caller written as `onWarning: (msg) => logger.warn(msg)` (where `msg: string`) now
  receives an object: it fails `tsc` if typed, or silently logs `[object Object]` if loose.
  Renaming the field is not enough — the *callback body* must be rewritten, so this is not a
  mechanical codemod. The RFC explicitly says the opposite ("the only addition is an optional
  second argument that already existed... now with extra optional fields", line 233-235). Adding
  fields is additive; **changing an existing field's type is not.** The frontmatter
  `breaking: additive` is therefore wrong, and the guardrail-§11.5 self-check ("Pass. Additive")
  is unearned.

- **CJS/ESM default-export contract is unaddressed.** The package's *primary* export is the
  function itself: `module.exports = fluentHtmlExtractor` (src/index.ts:749), with
  `module.exports.fluentHtmlExtractor = fluentHtmlExtractor` (line 750), `"main": "dist/index.js"`,
  `tsconfig "module": "commonjs"`, and no `"type": "module"` / no `"exports"` map. Both shipped
  consumers depend on the callable default — rideshare via `const { fluentHtmlExtractor } =
  require(...)` and ttl via ESM default `import`. The RFC presents all new surface as bare
  `export function ...` (ESM) declarations and a Vite `Plugin` (ESM-shaped) without specifying how
  named exports coexist with a callable `module.exports = fn`. If the build is naively switched to
  pure ESM `export`, the `require()` default-callable contract breaks for rideshare. This is real
  migration surface the "additive" verdict hides.

- **`extractDefaultClasses` export is a behavioral change, not a passthrough.** The RFC frames
  exporting the internal function as "export what apps hand-rolled... removes the guesswork"
  (lines 121-124, 343-346). But the internal regex (src/index.ts:689):
  `/[:\w\-/.@#[\]]+(?:\([^)]*\))?/g` differs materially from the apps' regex (RFC line 50):
  `/[a-zA-Z0-9_\-:\/]+(?:\[[^\]]+\])?[a-zA-Z0-9_\-]*/g`. The internal one matches `.`, `@`, `#`,
  and parenthesized tokens; the app one anchors arbitrary-value `[...]` brackets differently. An
  app that follows the RFC's advice to replace its regex with `extractDefaultClasses` gets a
  **different candidate set** — possibly more classes (CSS bloat) or different tokenization at
  arbitrary-value boundaries. That's a behavioral change shipped under an "identical, just
  exported" label.

- **The genuinely-breaking part IS honest, but unbundled.** The v4 reality — `content.extract`
  is gone, so the existing wiring is dead — is correctly disclosed (Problem section, F-C-011) and
  is the legitimate motivation. The RFC handles it well at the API layer by keeping
  `fluentHtmlExtractor` and gating v4 behavior behind `target`. But it then claims **no**
  `breaking-changes.md` entry is required (line 245). Per guardrail §11.5(b), the app-level
  migration off a dead hook must still be bundled into the single migration guide, even when the
  package API stays compatible. "Documented, not enforced" is not the same as "exempt from the
  migration bundle."

## Does it survive?

**survives-with-changes.** The RFC's *strategy* is sound and genuinely the right call: keep
`fluentHtmlExtractor` + `target` flag for v3 (correctly rejecting the "drop v3" alternative #3),
make the v4 path additive, and surface the dynamic-arg miss as an error instead of silence. The
core design does not need to be cut. But it **mislabels its breaking surface**: it mutates an
exported type (`ExtractorOptions.onWarning`), it ignores the callable-default CJS export contract
two real apps depend on, it ships a regex behavior change as a no-op, and it waives a
`breaking-changes.md` entry the guardrail requires. None of these are fatal to the idea, but all
must be fixed before this can honestly carry `breaking: additive` (and the `onWarning` change must
either be reverted to back-compat or the frontmatter must change to `breaking: breaking` with a
codemod note). The required changes above are exact and fold back into the RFC.

## Guardrail check (breaking-change lens owns §11.5)

§11.5 backward-compat is **NOT cleanly passed** as written. The RFC's self-assessment ("Pass.
Additive") is contradicted by `src/index.ts:11-14` vs RFC line 90. To pass §11.5 the RFC must:
(a) preserve `ExtractorOptions.onWarning`'s string signature, putting the structured payload on a
new field/type; (b) preserve the callable-default CJS export so `require()` consumers don't break;
(c) bundle the app-level v4 hook migration into `breaking-changes.md` with codemod scope marked.
With those, it is honestly additive and compat-safe; without them, the "additive" label is drift
the algorithm's §13 guardrail-drift failure mode exists to catch.
