---
id: RFC-C-02
track: C
title: "9.0.0 prune gated on recorded agent guesses: 4 dead second spellings and 5 duplicate root exports leave, the census-zero setters and utilities stay"
resolves: [F-C-101, F-C-103, F-C-309, F-C-606]
cluster: C-32
api_surface:
  - "FormTag.multipart() (removed; successor .setEnctype(\"multipart/form-data\"), byte-identical)"
  - "Tag.containerQuery(name?) + StyleProps key containerQuery (removed; successor .cssProp(\"container-type\", \"inline-size\") [+ .cssProp(\"container-name\", name)], declaration-equivalent)"
  - "Tag.setMicrodata(attrs) (removed; successor .toggle(\"itemscope\").addAttribute(\"itemtype\"|\"itemprop\"|\"itemref\"|\"itemid\", …), byte-identical)"
  - "Repeat(times, content) (removed from fluent-html and fluent-html/control; successor ForEach(times, content), byte-identical)"
  - "setDevChecks (root re-export removed; stays on fluent-html/core)"
  - "extractId, extractSelector (root re-exports removed; stay on fluent-html/ids)"
  - "EVENT_TABLE, HTMX_EVENTS (root re-exports removed; stay on fluent-html/behaviors)"
  - "scripts/codemod/prune-9.ts + npm run codemod:prune-9 (new repo script, not published; exports PRUNED_9, MOVED_TO_SUBPATH)"
  - "test/prune-gate.test.ts + test/types/prune-gate/{removed,prior,heals}.ts (new CI gate; fixtures excluded from the build tsconfig)"
  - "test/vocab-coverage.test.ts: { prefix: \"@container\", reason: \"pruned 9.0.0 …\" }"
enforcement: type
error_text: "probe.ts(3,8): error TS2339: Property 'multipart' does not exist on type 'FormTag'."
prose_deleted:
  - "guidelines/web-development/fluent-html.md:383"
  - "fluent-html/REFERENCE.md:1910"
  - "fluent-html/REFERENCE.md:1911"
  - "fluent-html/REFERENCE.md:1912"
guideline_delta: -1
lockstep: [eslint, guidelines, template]
codemod: needed
codemod_dry_run: "projects-template/templates/full-stack 0 edits / 339 files, 0 skipped; gzs/inovacije (5.7.1 via lambda.html alias) 3/3 / 238 files, 0 skipped; storysell-system 1/1 / 342 files, 0 skipped; jt-vault 1/1 / 232 files, 0 skipped; fluent-html's own suite 5/5 / 115 files, 0 skipped (2157/2157 tests after)"
dims_predicted: { decision-closure: +0.5, prior-alignment: +0.25, context-economy: +0.1, error-quality: 0 }
impact: 2
effort: M
ships_to: 9.0.0
depends_on: []
status: proposed
---

# RFC-C-02: A 9.0.0 prune gated on recorded agent guesses

`$W` = `<scratch>/wave2/RFC-C-02`.

Prototypes, both copies of fluent-html 8.1.0 at `656e812` with `node_modules` symlinked:
- `$W/lib`, scratch git: branch `narrow` is this RFC; patch `$W/rfc-c-02.patch`, 26 files, +366/−80.
- Branch `full`: the F-C-101 prune, kept as the measured alternative.

Census: the dedup corpus of recon 01, re-run today (`node wave0-1/census-dedup.mjs --json`): 58 repos, 12,813 files, 259,628 sites, 92 names at 0.

## Problem

F-C-101 re-derived the prune on three channels: method call, variant-object key and raw class. It found 60 of the 92 zero-use names deletable with a verified successor:
- 41 setters, byte-identical through `addAttribute`;
- 14 utilities, through `cssProp`;
- 5 tier-1 names, through `.variant`.

F-C-103 showed that deleting by census alone turns 16 names into TS2551 self-heals, 14 of which compile into wrong output. F-C-309 added 12 dead halves of live two-ways. F-C-606 added 21 root re-exports with 0 canonical importers.

Every one of these measures counts **past use**. None measures what an agent **writes first** when the job comes up. A census zero says nobody has needed `<meter low>` yet. It says nothing about the spelling an agent reaches for when it does.

I measured that directly: a guess probe (`$W/prior/`).
- **Setup.** `claude -p` through the wave0-2 harness, model claude-opus-5-5, no files and no tools. Each prompt names a job, such as "a `<meter>` with value 0.7, low 0.3, high 0.8, optimum 0.9".
- **Jobs.** 50, covering all 52 candidate callables and the 8 candidate root exports.
- **Conditions.** Two: (a) with the 3 fluent-html rules every fleet agent loads from CLAUDE.md, such as "Specialized tag methods, never use addAttribute for standard props" and "Method name = Tailwind class prefix"; (b) with no rules at all.
- **Sample.** 3 runs per batch, 222 guesses in all.
- **Compilation.** Every guess compiled with tsc 5.9.3 against three surfaces: 8.1.0, the F-C-101 prune, and this RFC.

| Condition | Guesses | Compile on 8.1.0 | After F-C-101 prune | After this RFC |
|---|---|---|---|---|
| Rules, batch 1 (24 jobs) | 72 | 54 | 6 | 54, diagnostics identical |
| Rules, batch 2 (26 jobs) | 78 | 53 | 0 | 53, diagnostics identical |
| No rules, batch 1 | 72 | 42 | 6 | 42, diagnostics identical |
| **Total** | **222** | **149** | **12** | **149** |

**What agents write.** With the rules on, the zero-use setters are what agents write, 3/3 in nearly every case:
- `Meter().setValue(0.7).setLow(0.3).setHigh(0.8).setOptimum(0.9)`
- `Textarea().setName("notes").setCols(40).setWrap("hard")`
- `Th("Temperature").setAbbr("Temp")`
- `Script("init()").setNonce(nonce)`
- `FeGaussianBlur().setStdDeviation(2).setResult("blur").setEdgeMode("wrap")`

The same holds for the utilities: `Div().grid().autoCols("min")`, `.inlineGrid()`, `.colEnd(3)`, `.bgBlend("multiply")`, `.perspective("near")`. 0 of 222 guesses used `addAttribute`, which is the successor F-C-101 names.

**One-hop heals.** Case-only guesses get a correct TS2551 on 8.1.0, and the F-C-101 prune turns all 6 into anonymous TS2339:

| Guess | Suggested on 8.1.0 |
|---|---|
| `setContentEditable` 3/3 | `setContenteditable` |
| `setEnterKeyHint` 3/3 | `setEnterkeyhint` |
| `setFormTarget` 3/3 | `setFormtarget` |
| `setFormEnctype` 3/3 | `setFormenctype` |
| `setDateTime` 2/6 | `setDatetime` |
| `transform3d` 3/3 | `transform` |

**Other costs of the full prune**, measured on `$W/lib` branch `full`, after its own codemod ran over the lib's tests (72 edits, 2 skips):
- 7 closed-union negative pins in `test/types/type-surface.test-d.ts` compile once rewritten to `addAttribute`. Examples: `Input().addAttribute("enterkeyhint", "nope")`, `Button().addAttribute("formenctype", "text/plian")`, `Td("x").addAttribute("abbr", "nope")`.
- 5 suite assertions change attribute order: Area, Picture, Source ×2, Path, Button. Bag attributes serialize after schema slots, so the bytes F-C-101 measured as identical are identical only on a fresh element.
- d.ts shrinks by 11,205 bytes, 4.2%.

**The census-zero criterion deletes the guesses agents make.** That is the measured cost F-C-101's "0 call sites, no consumer codemod" did not see. The cluster title already asks for the fix: gate each removal on its post-prune guesses.

## Instruction-set check

- **The removed names, one layer up.** `grep -rnE "\b(Repeat|containerQuery|setMicrodata|multipart|setDevChecks|extractId|extractSelector|EVENT_TABLE|HTMX_EVENTS)\b"` over `projects-template/templates` and `packages/ui` finds 0 fluent-html uses. The hits are `@fastify/multipart` and prose. The codemod dry run on `templates/full-stack` agrees: 0 edits in 339 files.
- **Structured data already lives one layer up.** The template carries `seo.meta.ts:34` `jsonLd?: readonly Record<string, unknown>[]` and `jsonLdScript` at `:38`, reached through Layout's `seo` prop (`layout.view.ts:80`). 30 of 58 dedup repos emit JSON-LD. 0 emit microdata: the 1 `itemtype` hit is a crawler regex at `website-sales-funnel-automation-system/src/shared/crawl/crawl.heuristics.ts:209`. So `setMicrodata` is a second, unused way to do the template's job.
- **Container marking.** The fleet's 2 container sites already use the successor: `everyframe-composer/src/app/captions/views/captions.components.ts:402` and `studio.subtitles.view.ts:494`, both `.cssProp("container-type", "size")`. `.containerQuery()` emits only `inline-size`, so it could not have produced theirs.
- **Why the library.** Deleting a member is a library change, and so is a gate on the library's own deletions. The gate's fixtures compile against `src/`.

## Proposed change

### 1. The gate (the core deliverable): `test/prune-gate.test.ts` + 3 fixtures

The fixtures live in `test/types/prune-gate/` and are added to the build tsconfig's `exclude` beside `test/types/setter-probe`. The test is appended to `npm test`.

```ts
import { PRUNED_9 } from "../scripts/codemod/prune-9.js";   // one map: codemod + gate + CHANGELOG table

it("every removed name fails as a plain missing member or export", () => {
  const diags = diagnose("removed.ts");                       // one guess per PRUNED_9 name
  for (const name of Object.keys(PRUNED_9)) {
    const hit = diags.find((d) => d.message.includes(`'${name}'`));
    assert.ok(hit, `removed.ts has no probe for ${name}`);
    assert.ok([2339, 2305].includes(hit.code), `${name}: TS${hit.code} ${hit.message} (successor: ${PRUNED_9[name]})`);
  }
});
it("no recorded pure-prior guess uses a removed name, and every one compiles", () => {
  // prior.ts minus comments and string literals must not mention any PRUNED_9 name; prior.ts compiles with 0 diagnostics
});
it("every recorded one-hop heal still names its member", () => {
  // heals.ts: exactly [2551 setContenteditable, setEnterkeyhint, setFormenctype, setFormtarget, setDatetime, transform]
});
```

The three fixtures:
- **`removed.ts`.** 9 probes, one per `PRUNED_9` name, for example `Form().multipart()` and `import { Repeat, setDevChecks, … } from "../../../src/index.js"`.
- **`prior.ts`.** The 36 unique guess expressions plus 3 root imports (`sanitizeUrl`, `escapeAttr`, `Doctype`) that compile on 8.1.0. The header records the model, date and conditions.
- **`heals.ts`.** The 6 case-only guesses.

**Rule for the next prune.** A name may leave only when its removal draws TS2339/TS2305, never a "Did you mean" (F-C-103's rule, made strict), and when 3 recorded guess samples for its job do not use it. The prior fixture is a ratchet: lines are added, never removed.

### 2. The prune: the 9 names that pass all four gates

| Name | Census (fleet / canonical) | Other channels | Guess for its job (rules, n=3) | Successor (verified) |
|---|---|---|---|---|
| `FormTag.multipart()` | 2 / 0 | n/a | `setEnctype("multipart/form-data")` 3/3 | `.setEnctype("multipart/form-data")`, 49 canonical sites; byte-identical |
| `Repeat(n, f)` | 1 / 0; imports 2 pre-7 files | n/a | `Div(Span("★"), Span("★"), Span("★"))` 3/3 | `ForEach(n, f)`: `Repeat`'s body is `return ForEach(times, content)` (`src/control/iteration.ts:178-183`); byte-identical |
| `Tag.containerQuery()` | 0 / 0 | key 0, raw `@container` 0 | `.container()` 2/3, `.atContainer()` 1/3 (both TS2339 on 8.1.0 too) | `.cssProp("container-type", "inline-size")` [+ `container-name`]; Tailwind 4.3.3 oracle: same declaration set 2/2 |
| `Tag.setMicrodata()` | 0 / 0 | n/a | `setItemscope(true).setItemtype(…)` 1/3, `setItemScope().setItemType(…)` 2/3 (TS2339 on 8.1.0 too) | `.toggle("itemscope").addAttribute("itemtype", …)` etc.; byte-identical; structured data → template `seo.jsonLd` |
| root `setDevChecks` | 0 importers any era | n/a | `import { setDevMode }` 3/3 | `fluent-html/core` |
| root `extractId` | 0 any era | n/a | `idOf` 3/3 | `fluent-html/ids` |
| root `extractSelector` | 0 canonical; 1 pre-7 file (`jt-vault/src/vault/components/filter-bar.view.ts:1`) | n/a | `idSelector` 1/3, `toSelector` 2/3 | `fluent-html/ids` |
| root `EVENT_TABLE`, `HTMX_EVENTS` | 0 any era | n/a | `BEHAVIOR_EVENTS` 2/3, `BehaviorEvents` 1/3 | `fluent-html/behaviors` |

Source edits in the prototype:
- `src/core/forms.ts`: drop the `multipart` method. Note that `src/elements/forms.ts:412-416` keeps `_enctype` and `getEnctype()`, which the template's swap verbs read.
- `src/core/tailwind-methods.ts`: drop the `containerQuery` declaration (`:404-405`) and its implementation (`:913-915`).
- `src/class-vocab/vocab.ts`: drop rows `:324-325`. `gen:vocab` then drops the `containerQuery` key from `variant-object.gen.ts`.
- `src/core/tag.ts`: drop `setMicrodata` (`:607-622`).
- `src/control/iteration.ts`: drop `Repeat` (`:168-183`). Also drop it from `src/control/index.ts:16` and `src/index.ts:341`.
- `src/index.ts`: drop the root re-exports at `:9-10`, `:400-401` and `:434`.
- `scripts/census/method-census.mjs:93`: drop `"Repeat"`.
- `examples/control-flow.ts:8,55`: `Repeat` → `ForEach`.
- `test/vocab-coverage.test.ts`: add `{ prefix: "@container", reason: "pruned 9.0.0: zero use on 3 channels; successor .cssProp(\"container-type\", …)" }`, and reword the `container` backlog reason.

### 3. Kept, with the reason the next census must read

| Kept | Why (measured) |
|---|---|
| 35 setters: `setDatetime setLow setHigh setOptimum setCols setWrap setSize setLabel setMedia setCapture setSpellcheck setAbbr setShape setCoords setDir setNonce setSpan setFillRule setGradientUnits setGradientTransform setSpreadMethod setStopOpacity setClipPathUnits setMaskUnits setMaskContentUnits setFilterUnits setPrimitiveUnits setStdDeviation setResult setEdgeMode setAutocapitalize` + heals `setContenteditable setEnterkeyhint setFormtarget setFormenctype` | Agents' first guess: 3/3 for 30 names; `setDatetime` 2/3 + 1 heal; 4 one-hop heals 3/3. Same with no rules (42/72 compile on 8.1.0 and on this RFC, 6/72 after the full prune) |
| 13 utilities: `autoCols autoRows gridFlow inlineGrid colEnd rowEnd bgBlend caret perspective scrollP table scroll transform` | 3/3 for 11; `scroll` 1/3; `transform` is the 3/3 heal target of `transform3d` |
| root `sanitizeUrl`, `escapeAttr`, `Doctype` | Imported from `"fluent-html"` 3/3 each |
| root `isTag`, `isRawString`, `id` | Removal draws TS2724 `Did you mean 'InsTag'` / `'RawString'` / `'Id'` (`$W/probe-imports`) |
| `setForm`, `setHeaders`, `addHeaders` | `string \| Id` IDREF sinks (`tag.ts:629-630`, `tables.ts:62,107`); `addAttribute` takes a string, so the Id brand would be lost (guardrail 4; C-45, C-56) |
| `setFilter`, `setTextDecoration` | `fluent-svg` integration: README.md:297-300, :339, :356; 7 test + 5 demo lines |
| `after checked dark even odd`; `hxPost`, `setHtmx(endpoint, opts)`; the render/renderToStream option overloads, `renderToStream`, `renderToIterable`; the 6 selector helpers + `resolveSelector`; `El` | Owned by C-91, C-58, C-92 and C-82; `El` is taught at gl/fluent-html.md:11 |

### 4. Codemod: `scripts/codemod/prune-9.ts` (`npm run codemod:prune-9 -- <tsconfig> [--dry]`)

The receiver check comes from `canonical-names.ts`, with one fix. On 8.1.0, `setId(<Id>)` returns `this & Rooted<N>`. The intersection's class part loses its base types, so every call after `.setId(ids.x)` fails the receiver check. I measured it on canonical-names itself: `Th("x").setId(ids.a).padding("4")` gets "receiver does not type as Tag" (1/1). prune-9 applies `getApparentType()` per part and falls back to the symbol's declared type.

Rewrites:
- method rewrites as in the table in section 2;
- `Repeat` imports become `ForEach` (deduped);
- moved names split into a subpath import of the same module specifier, npm aliases included, because `libSpecifiers()` reads `package.json`. gzs/inovacije imports from `lambda.html`.
- Edits are spliced into the file text once, then `replaceWithText`. Per-edit `replaceText` threw `ManipulationError` on gzs/inovacije.

Skips, each reported:
- a non-literal `containerQuery` name;
- a non-literal or spread `setMicrodata` object;
- calls under `@ts-expect-error`;
- `containerQuery` style-object keys inside Tag calls.

### 5. Lockstep

- **eslint plugin.** `npm run gen:vocab` removes 1 line, `"containerQuery"`, from `src/vocab.generated.ts`. Against the prototype, the plugin passes rule.test 422/422, type-aware 19/19, derivation 14/14, and drift (158 methods). The raw class `@container` then falls under RFC-C-01's cssProp redirect.
- **Extractor.** It reads `fluent-html/class-vocab` at runtime: 0 edits. It passes 55/56 against the prototype and 55/56 against 8.1.0; the failing case is the same one on both.
- **Guidelines.** Delete `web-development/fluent-html.md:383`. In `:90`, drop the clause "`setMicrodata({ type, prop, id })` (schema.org SEO; `type` also sets `itemscope`)," and rename the heading to "Global editing setters".
- **Template.** Re-vendor `.ai/web-development/fluent-html.md:90` and `:383`. App code needs 0 changes.
- **Lib docs.** In REFERENCE.md, delete `:1910-1912` and make `:1185` and `:1191` name the cssProp parent. In FLUENT-STYLING.md, make `:40` name the cssProp parent and drop `.containerQuery()` from the naming exceptions in `:92`.
- **CHANGELOG 9.0.0 entry.** "💥 Removed (4 + 5 root re-exports, codemod `codemod:prune-9`)", with the table in section 2. Then "🧊 Kept: the census-zero setters and utilities are what agents write first (149/222 guesses; 12/222 after a census-only prune); the deletion criterion is now census zero AND no wrong suggestion AND no recorded guess (`test/prune-gate.test.ts`)". This supersedes CHANGELOG.md:123-125, which said "candidates for deletion in a future major if the census stays at zero".

## Before → after

Guess probe, consumer package `$W/consumer` (`"type": "module"`, `node_modules/fluent-html` → prototype):

```ts
import { Form, Div, Article } from "fluent-html";
import { Repeat, setDevChecks } from "fluent-html";
Form().multipart();
Div().containerQuery("sidebar");
Article().setMicrodata({ type: "https://schema.org/Article" });
```

Before (8.1.0): 0 diagnostics. After (`npx tsc -p . --pretty false`, rc=2):
```
probe.ts(2,10): error TS2305: Module '"fluent-html"' has no exported member 'Repeat'.
probe.ts(2,18): error TS2305: Module '"fluent-html"' has no exported member 'setDevChecks'.
probe.ts(3,8): error TS2339: Property 'multipart' does not exist on type 'FormTag'.
probe.ts(4,7): error TS2339: Property 'containerQuery' does not exist on type 'Tag'.
probe.ts(5,11): error TS2339: Property 'setMicrodata' does not exist on type 'Tag'.
```
The codemod output (`fixed.ts`: `setEnctype(…)`, `cssProp(…).cssProp(…)`, `toggle("itemscope").addAttribute(…)`, `ForEach(3, …)`, `import { setDevChecks } from "fluent-html/core"`) compiles with rc=0.

Rendered before/after (`dist-base` vs `lib/dist`):
- `Form().multipart()` and `Form().setEnctype("multipart/form-data")` render IDENTICAL `<form enctype="multipart/form-data"></form>`.
- `setMicrodata({ type, prop })` and its successor render IDENTICAL `<article itemtype="https://schema.org/Article" itemprop="x" itemscope></article>`.
- `Div(Repeat(3, …))` and `Div(ForEach(3, …))` render IDENTICAL.
- `@container` → `[container-type:inline-size]`, and `@container/sidebar` → `[container-type:inline-size] [container-name:sidebar]`. On the Tailwind 4.3.3 oracle both sides carry the same declaration set. A child `.variant("@sm", { p: "4" })` still emits `@sm:p-4`.

Live diff from the dry run:
```
gzs/inovacije/src/views/components/ui-components.view.ts:226 | Repeat(3, PartnerLogos) => ForEach(3, PartnerLogos)
storysell-system/src/app/intake/views/intake.box.view.ts:85   | .multipart()            => .setEnctype("multipart/form-data")
jt-vault/src/vault/components/filter-bar.view.ts:1            | …, type Id, extractSelector } from "fluent-html";
                                                              => …, type Id } from "fluent-html"; import { extractSelector } from "fluent-html/ids";
```

## Enforcement

- **Type layer for consumers.** Each removed name dies as TS2339/TS2305 with no misdirecting suggestion. The gate pins this for all 9 names.
- **Why the error does not name the successor.** A naming tombstone would keep the name in the d.ts and in completion, at about 200 chars per trap (RFC-A-04's shape). That costs more than the removal saves, and the recorded guesses show agents do not write these names for their jobs. The codemod carries the successor for existing code, which is 5 pre-7 sites.
- **CI layer for the library.** The gate makes "census-zero" insufficient on its own: any future removal must keep `prior.ts` compiling and `heals.ts` healing.
- **The gate catches the harmful prune.** Run against `full`'s source (`$W/fullsrc`), it reports 36 `prior.ts` diagnostics and 6/6 heals lost (TS2339). Against `narrow`: 3/3 gate tests pass.

## Replaces (converge)

- `multipart()` → `setEnctype`. It was the dead half of a two-way: 49 canonical sites and 3/3 guesses use the twin.
- `Repeat` → `ForEach(n, …)`, the count overload `Repeat` already delegated to.
- `containerQuery` → `cssProp("container-type", …)`, the fleet's only live spelling (2 sites).
- `setMicrodata` → the template's `seo.jsonLd` for structured data (30/58 repos); the raw attribute path remains for anything else.
- 5 root duplicates → one import path each.
- **Guideline lines.** gl/fluent-html.md:383 is deleted. Line :90 loses a clause but is not deleted. Net **−1**; the template mirror changes in step on re-vendor.
- **Lib docs.** REFERENCE.md −3 lines. FLUENT-STYLING.md :40 and :92 are reworded.
- **Prose deliberately not deleted.** F-C-101 proposed rewriting the "never `addAttribute`" mandates (gl/fluent-html.md:90, :152, :503) to name `addAttribute`. They stay: the guesses show those mandates are what agents follow, and the setters they name stay.

## Lane & migration

- **Lane: 9.0.0.** Removing exported names is breaking. The work is codemod-first, with no aliases and no shims.
- **Dry runs, measured.** Template 0 edits / 339 files, 0 skipped. Live repos: gzs/inovacije 3/3, storysell-system 1/1, jt-vault 1/1, 0 skipped. The lib's own suite: 5/5, 0 skipped, then 2157/2157.
- **Fleet coverage.** The census finds no other site of these 9 names on any channel. `storysell-system-define-feature-exp` has 1 `multipart()`; it is the scratch twin of storysell-system and was not dry-run.
- **Order for pre-7 repos.** `codemod:canonical` first, then `codemod:prune-9`. Their maps do not overlap: canonical-names maps nothing onto these 9 names.

## Guardrail check (§5, 1–13)

1. **Zero runtime deps: pass.** The codemod uses the existing `ts-morph` devDependency, and `scripts/` is not in `files`.
2. **Hot path: pass.** No render code changes. Medians of 3 runs, prototype/base, by bench row: flat ×0.999, deep ×0.993, escaping ×1.065, htmx ×1.018, realistic ×0.991, variant-heavy ×1.018, ForEach-5000 ×1.016, build+render ×1.017.
3. **Escape by default: pass.** `setMicrodata` already wrote through `addAttribute` (`tag.ts:617-620`), so the escaping is the same.
4. **Type-safety: pass.** Nothing depends on generic inference. The Id-typed IDREF setters are kept for this guardrail. The full prune would have lost 7 closed-union pins; this RFC loses 0.
5. **Instruction set: pass.** Structured data stays in the template's `seo.jsonLd`.
6. **Pure core: N/A.**
7. **Converge: pass.** 4 two-ways and 5 duplicate import paths close.
8. **Naming: N/A.** No new public names.
9. **Class-string contract: pass.** The `containerQuery` row leaves via class-vocab, and `gen:vocab --check` is OK on 3/3 files. The plugin re-derives (−1 line), and the extractor re-derives at runtime (55/56 = baseline).
10. **Runtime grammar: pass.** No htmx names change, and `[container-type:…]` and `[container-name:…]` pass the pinned Tailwind oracle.
11. **Breaking = codemod-first: pass.** Measured dry runs are above.
12. **Enforcement over prose: pass.** Net guidelines −1; the gate is CI.
13. **Append-only styling: N/A.**

## Scorecard prediction

- **Decision-closure +0.5.** 4 second spellings and 5 second import paths are gone. L-152 and L-153 close with a measured criterion instead of staying parked, and the 51 kept names carry a recorded reason the next census reads.
- **Prior-alignment +0.25.** The gate locks in the 149/222 guesses that compile on first try and the 6 correct heals. A census-only prune would have cut those guesses to 12/222.
- **Context-economy +0.1.** d.ts across the 65 common files drops 265,762 → 264,281 bytes (−1,481, about 370 tokens); `index.d.ts` drops 5,294 → 5,144. This is small by design: the full prune saved 11,205 bytes at the cost of 137 working guesses.
- **Error-quality 0.** The 9 removed names die anonymously, but no recorded guess hits them.

## Alternatives considered

- **F-C-101's prune as filed** (60 names minus the 5 C-91 names, prototyped on `full`). Rejected: working guesses drop 149 → 12 of 222, and 6/6 heals are lost. It also loses 7 closed-union type pins and reorders attributes in 5 suite assertions.
- **The same prune with naming tombstones** (C-52's direction). Rejected: a trap per name costs about 200 d.ts chars, which is more than the deletion saves, and the names stay in completion.
- **All 21 root re-exports off the root** (F-C-606). Rejected:
  - 3 are root-import guesses 3/3 (`sanitizeUrl`, `escapeAttr`, `Doctype`);
  - 3 draw a wrong TS2724 (`isTag`→`InsTag`, `isRawString`→`RawString`, `id`→`Id`);
  - 7 selector names belong to C-82, whose bare-selector design may lean on them;
  - `renderToStream`/`renderToIterable` belong to C-92;
  - `El` is taught at gl/fluent-html.md:11.
- **Deleting `setNonce`** (F-C-309). Rejected: it is the guess 3/3 in both conditions. C-92 keeps `renderWithNonce`, and the author override is the same attribute write (`tag.ts:244-249`, `serialize.ts:286-288`).
- **A census-only gate, F-C-103's TS2551 check without the guess fixture.** Rejected: it admits all 60 F-C-101 names (60/60 TS2339) and therefore the 137-guess regression.

## Open questions (for curation)

1. **Guess fixture, re-recording and growth.** The fixture is one model (claude-opus-5-5) with n=3 per job. The proposal is a ratchet: re-run the harness when a release proposes a removal, and append new compiling guesses. Should C-72 (replay frozen guess runs in CI, deferred) take ownership of re-recording?
2. **Microdata validity.** With `setMicrodata` gone, an author using raw attributes can write `itemtype` without `itemscope`, which is invalid. That needs 0 sites today and JSON-LD is the path, but it is a silent-failure shape. Alternatively, keep `setMicrodata` and drop it from the set; the gate passes either way.
3. **Side finding for C-40.** The F-C-606 import census misses the `lambda.html` alias (195 pre-7 files, 6 repos). With it, pre-7 importers of the 21 names rise from 46 to 55 files, `Repeat` from 0 to 2 files and `find` from 0 to 2 files. The canonical-era result is unchanged at 0.
4. **Side finding for C-24.** canonical-names skips every call after `.setId(<Id>)` on 8.1.0. prune-9 carries the fix; should canonical-names get the same 3-line change in 8.1.x?

## Executed

- `node wave0-1/census-dedup.mjs --json > $W/census-dedup.json` (35 s): 58 repos, 12,813 files, 259,628 sites, 92 zero. Results: containerQuery 0/0, setMicrodata 0/0, multipart 2/0, Repeat 1/0, setEnctype 74/49, cssProp 109/109.
- `node $W/objkey/objkey-census.mjs`: 2,905 variant calls; 14 candidate styling keys at 0, `containerQuery` included.
- `node $W/rawclass.mjs`: raw class tokens for the 14 utilities, 0 canonical-era.
- `node $W/imports/import-census2.mjs` (lambda.html alias added): the moved 5 have 0 canonical importers; `extractSelector` has 1 pre-7 file.
- Guess probe:
  - `bash wave0-2/run-claude.sh $W/prior/empty $W/prior/{run,b,nr}{1,2,3} prompt{,2,-norules}.txt --max-turns 2` (9 runs, 9-14 s each).
  - Then `npx -p typescript@5.9.3 tsc` over the guesses against `dist-base`, `dist-full` and `lib/dist`: 149 / 12 / 149 of 222 compile; base vs narrow diagnostics identical in all 3 conditions.
- Prototype build: `npx tsc && npx tsc -p src/behaviors/client/tsconfig.json && node scripts/build-behaviors.mjs`.
- Prototype checks:
  - `node dist/scripts/gen-vocab/gen-vocab.js --check`: OK ×3;
  - `node --test <npm test list + dist/test/prune-gate.test.js>`: 2157/2157 (8.1.0 baseline: 2159/2159);
  - `tsc -p test/types/color-optout`: rc 0;
  - `npx eslint scripts/codemod/prune-9.ts test/prune-gate.test.ts`: 0 problems.
- Gate against the full prune: `tsc -p $W/fullsrc` gives 36 prior + 6 heal diagnostics.
- Codemod: `node $W/lib/dist/scripts/codemod/prune-9.js <tsconfig> --dry` on template, gzs/inovacije, storysell-system and jt-vault (results above), plus a non-dry run on the lib (5 edits).
- Oracle and bytes: `$W/lib/scripts/_oracle.mjs` with `loadDesignSystem` (tailwindcss 4.3.3); renders compared against `dist-base`.
- Plugin (`$W/plugin`, linked to the prototype): `node scripts/gen-vocab.mjs`, tsc, rule/type-aware/derivation/drift tests. Extractor (`$W/extractor`): `node --import tsx --test src/*.test.ts`, 55/56, the same as the real repo.
- Bench: `node dist/bench/render.js` ×3 on base and prototype.
- d.ts sizes on the 65 common files.
