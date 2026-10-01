---
rfc: RFC-A-06
lens: combined
verdict: survives-with-changes
confidence: 0.82
killer_objection: none
guardrail_killer: 0
required_changes:
  - "Reach: correct the workshop-toni line. Its pin bb5515c is fluent-html 7.0.0, so the fix reaches it only through a 7 -> 8.1.x major upgrade across 8.0.0, not a commit bump. Restate the 2 canonical-era unescaped sites as 1 fixed on next install (templates/web, #main) and 1 behind a major upgrade (workshop-toni)."
  - "Alternatives / OQ1: drop the claim that alternative 1 is the fallback for a literal reading of the 8.1.x byte rule. It also changes bytes in 14,682 of the 35,594 bodies that worked on 8.1.0. Close OQ1 on the parse-identity reading and cite the measured raw-byte consumer count: 0 string readers, 0 test assertions, 0 snapshots, 0 inline-script CSP hashes and 0 importmaps over 45,226 corpus files."
  - "Problem / Lane: add the third group of changed bytes that never worked. 8.1.0's case-insensitive closer rule writes a lowercase `<\\/script`, so a JSON string holding `</SCRIPT>` parses back lowercased (6,116/6,116), and the patch fixes it (0/10,000). Add a unit pin for it. Log the same lowercasing in JS and style bodies as a separate finding."
  - "JSON type matcher: make the code and its prose agree. The regex covers only application/* and text/* (+json), while the comment and the REFERENCE line say 'every'/'any +json'. Widen the regex to the WHATWG JSON MIME definition, or narrow both texts."
  - "Guardrail 2 line: record the measured script-path cost. 6 ld+json scripts 1,735 -> 1,892 ns (+9.0%, about 26 ns per element); module +3.1%; untyped +1.0%; a document with 200 rows +1.3% (noise); a 200-row body with no script, no change."
executed:
  - cmd: "patch -p0 < serialize.patch && npm run build (scratch lib/ and base/)"
    output: "applies to HEAD 656e812; both builds rc 0"
  - cmd: "run-suite.sh (package.json node --test list) on base and lib, with the RFC's 6 pins"
    output: "patched 2165/2165; base 2161/2165 (the 4 new pins fail)"
  - cmd: "node oracle-fuzz.mjs 30000 (parse5 7.3.0 oracle)"
    output: "JSON n=18752: intact 18750 -> 18752; parse-identical 15001 -> 18752; '<' left 0; bytes differ 15000, 0 without '<' in data. JS n=11248: 0 byte diffs"
  - cmd: "node browser-probe.mjs (Chromium 149.0.7827.55, Firefox 151.0, WebKit 26.5)"
    output: "opener / bag+Raw / setType-JSON+bag-module: base body0/app0, patched body3/app1/parse1 on 3/3; setType-module+bag-JSON stays JS and runs on both; importmap '<' keys: base noh1/sum=null, patched h1/sum=42 on 3/3"
  - cmd: "node caselower.mjs"
    output: "8.1.0 JSON value changed 6116/10000 (all mixed-case closers); patched 0; JS string literal changed 6116/10000 on both builds"
  - cmd: "node lane-letter.mjs (40,000 bodies)"
    output: "worked on 8.1.0 35594; RFC changed 40000 (35594 worked, 4406 fixed); alt 1 changed 19088 (14682 worked, 4406 fixed); still broken 0 for both"
  - cmd: "node fleet-lane.mjs (58 repos, 45,226 files)"
    output: "raw-byte readers 0; inline CSP hashes 0 (87 sha hits = SRI/PKCE); addAttribute JSON type 0; tests with '<' in JSON body 0; snapshots 0; importmap 0"
  - cmd: "git show bb5515c:package.json; fluent-html spec of the 16 canonical-era repos"
    output: "bb5515c = 7.0.0 (workshop-toni); 12/16 #main; 3 at 8.1.0 (9d86871 x2, vendored tgz x1)"
  - cmd: "run-claude.sh x4 withheld agents (t1-t4) + tsc against patched types"
    output: "4/4 hand-escape '<'; 3/4 invent .type()/.id()/.text(); 4 x TS1161 in 2/4 files (raw U+2028 in regex literal)"
  - cmd: "node agent-idem.mjs"
    output: "5 agent shapes 5000/5000 byte-identical, '<' left 0; bare fleet form 1011/5000 identical, '<' left 0"
  - cmd: "npx vitest run --project unit on template scaffold x4"
    output: "base 403/403; patched 403/403; base-nohelper 402/403 (seo-meta guard fails); patched-nohelper 403/403"
  - cmd: "grep template/packages/ui/eslint-plugin/extractor/guidelines for u003c|ld+json|importmap"
    output: "full-stack seo.meta.ts:39 helper; web seo.ts:127-128 none; packages/ui 0; plugin 0; extractor 0; guidelines 0"
  - cmd: "node bench-mine.mjs / bench-ctx.mjs, 5 alternating rounds"
    output: "ldNoLt6 1735 -> 1892; module6 1720 -> 1773; jsNoType6 1151 -> 1163; pageWithLd 43134 -> 43710; plain200 41537 -> 41283"
  - cmd: "JSON_SCRIPT_TYPE_RE over JS MIME list / JSON spellings / +json types"
    output: "JS 0/19 matched; JSON 13/13; non-JSON 6/6 kept closer-only; model|image|font +json 3/3 missed"
  - cmd: "node bytediff.mjs"
    output: "web StructuredData + toni island DIFF as the RFC states; JS, module, Style IDENTICAL; renderToStream == render 5/5"
  - cmd: "npx eslint (changed files); tsc -p test/types/color-optout; exports grep"
    output: "eslint rc 0; optout rc 0; RenderCtx/sanitizeRawContent not public (0 in index.d.ts, no subpath)"
---

# Verdict: RFC-A-06, combined lens

> You are an ADVERSARY. Kill this RFC through the combined lens. Default to `reject` under
> uncertainty. Reading code is not verification: execute.

Scratch: `wave3/RFC-A-06-combined/`. I built my own `base/` (8.1.0 serializer) and `lib/` (with `serialize.patch`) from HEAD 656e812 and did not reuse the wave2 builds.

## What I executed

### Enforcement layer: runtime byte-diff and parse oracle

**Lib suite.** I applied `serialize.patch` to HEAD 656e812 and built both copies, with no conflict.
- Patched: 2165/2165.
- Base: 2161/2165. Exactly the 4 pins the RFC names fail (exact bytes, parse identity, idempotency, bag type).

**Independent oracle fuzz** (`oracle-fuzz.mjs`, 30,000 trees). It uses parse5 7.3.0, a WHATWG tokenizer the RFC did not use, and covers 9 JSON type spellings across setType, bag and `Raw`.

| Measure (JSON-typed, n = 18,752) | 8.1.0 | Patched |
|---|---|---|
| Body intact | 18,750 | 18,752 |
| JSON.parse identical | 15,001 | 18,752 |
| `<` left in the body | n/a | 0 |

- Bytes differ in 15,000 renders. None of them has data free of `<`.
- JS-typed renders: 0/11,248 byte diffs.

**Byte-diff** (`bytediff.mjs`):
- The RFC's two before/after lines reproduce exactly.
- JS, module and `Style` bodies are byte-identical.
- `renderToStream` equals `render` in 5/5 cases.

**3-engine probe** (`browser-probe.mjs`) of cases the RFC did not run:
- **Attribute precedence.** `setType("application/json")` plus a bag `type="module"` emits the schema-key attribute first. All 3 engines read `application/json`. The patched build keeps it intact, and 8.1.0 loses the body.
- **Reverse precedence.** `setType("module")` plus a bag JSON type stays JS (closer-only) and executes on both builds. So `scriptCtx` follows the browser's first-attribute rule.
- **Raw child with a bag type.** `El("script", Raw(..)).addAttribute("type", "application/json")`: body 0 → 3 on 3/3 engines.
- **Import map.** With keys `app<!--<script>` and `lt<1`, 8.1.0 gives no h1 and no import. Patched gives h1 and `sum=42` on 3/3.

### Agent fitness: pure-prior guess

**Fresh withheld agents.** I ran 4 through the wave0-2 harness (`--restricted`, no repo access), with tasks the RFC did not use: a short Product JSON-LD, an importmap with speculationrules, a CMS chart island, and an FAQPage holding CMS HTML.
- 4/4 hand-escape `<`. Two use `<` only and two use the 5-replace helper. With the RFC's 6, that makes 10/10.
- 3/4 invent `.type()`, `.id()` or `.text()`.
- 2/4 do not compile (TS1161), because the helper puts a raw U+2028 inside a regex literal. That is the agent's own code. Raw U+2028 appears in 11 of the 16 agent files across all 10 runs.

**What the patch does to that code.** With method names corrected, all 5 agent shapes render byte-identical: 5,000/5,000 each, 0 `<` left. The bare fleet form changes only where the data holds `<` (3,989/5,000), with 0 `<` left.

**Verdict on fitness.** No new surface, no second way, and 0 teaching tokens. The guess works in both forms the prior produces.

### Instruction-set grep

- The full-stack `jsonLdScript` hand-escape at `seo.meta.ts:39` is the one solution one layer up. It is pinned at `seo-meta.test.ts:105`.
- The web starter (`seo.ts:127-128`) does not escape.
- `packages/ui`, the eslint plugin, the extractor and the guidelines have 0 hits.

### Lane and breaking checks

**Template scaffold** (4 variants):

| Variant | Result |
|---|---|
| 8.1.0 | 403/403 |
| Patched | 403/403 |
| 8.1.0, helper dropped | 402/403. The `seo-meta` sequencing guard fails, as the RFC claims. |
| Patched, helper dropped | 403/403 |

**Fleet lane census** (`fleet-lane.mjs`, 45,226 files) found 0 consumers of the raw bytes:
- 0 string readers of a JSON script body. workshop-toni `story.ts:46` uses JSON.parse.
- 0 inline-script CSP hashes. All 87 sha hits are SRI `integrity` or OAuth PKCE.
- 0 test assertions of `<` inside a JSON body.
- 0 snapshot or golden files.
- 0 importmaps, and 0 `addAttribute` JSON types.

## Attack

**1. The lane letter (strongest attack).** The 8.1.x rule says bytes may change "only to fix something that never worked". The patch also rewrites working bodies such as `{"cmp":"1 < 2"}`.
- Measured (`lane-letter.mjs`, 40,000 bodies): the RFC changes bytes in all 35,594 bodies that worked on 8.1.0.
- The RFC offers alternative 1 as the letter-compliant fallback. That is false: alt 1 still changes 14,682 of those 35,594, because `<!--` without `<script` worked.
- No simple byte transform meets the letter. Both variants fix 4,406/4,406 broken bodies.
- What decides the lane is "breaks a consumer". Parse identity holds in 18,752/18,752 (parse5) and 32/32 × 3 engines (RFC). The census finds 0 consumers of raw bytes. The template, na-cent (RFC) and lib suites stay green.
- **Rebutted.** OQ1 must be closed on that evidence, and alt 1's framing corrected.

**2. Reach is overstated.** workshop-toni holds one of the two canonical-era unescaped sites. It pins `bb5515c`, which is 7.0.0, not 8.1.0. It gets the fix only through a major upgrade.

**3. A hidden third byte group.** On 8.1.0, `SCRIPT_CLOSE_RE` is `/gi`, but its replacement is the literal lowercase `<\/script`.
- A JSON string `</SCRIPT>` parses back as `</script>`: 6,116/6,116 mixed-case closers, and 3,749 of the 3,751 base parse failures in my fuzz.
- The patch fixes this for JSON (0/10,000), which strengthens the "never worked" case. The RFC does not state it.
- JS string literals keep the bug on both builds (6,116/10,000). That is a separate finding.

**4. The prose over-claims the type matcher.** "Every `+json` subtype" is wrong: `model/gltf+json`, `image/x+json` and `font/collection+json` miss (3/3). They fall back to the 8.1.0 closer rule, so nothing regresses, but the comment and the REFERENCE line are wrong.
- JS MIME types are never misread as JSON: 0/19 matched, so there is no JS-corruption path.

**5. Bench.** The RFC says the non-script path gains no work, and that holds (plain200: 41,537 → 41,283 ns). Typed scripts do pay:

| Scenario (6 scripts) | 8.1.0 | Patched | Change |
|---|---|---|---|
| ld+json, no `<` | 1,735 ns | 1,892 ns | +9.0% (about 26 ns per element) |
| module | 1,720 ns | 1,773 ns | +3.1% |
| untyped | 1,151 ns | 1,163 ns | +1.0% |

A document with that head and 200 rows goes 43,134 → 43,710 ns (+1.3%, within noise). This is not a guardrail-2 kill, but the RFC must record it.

**6. Instruction set.** A template fix alone (the web starter) would miss the 9 direct `Script(JSON.stringify(..))` sites. The serializer is the only layer that sees the body's type, so guardrail 5 holds: no primitive is added.

## Does it survive?

**survives-with-changes.** The mechanism holds under every probe I ran:
- An independent parse5 oracle.
- 3 engines, including attribute precedence and the bag and `Raw` routes.
- The import map loading modules.
- JS, module and style bodies byte-identical.
- Stream parity.
- Agent and fleet helpers byte-identical.
- The template lockstep guard.

The lane attack fails on measurement: no consumer reads the raw bytes, and no simple transform meets the letter. The required changes correct claims, add one pin and tighten one regex or its prose:
1. **Reach.** workshop-toni is 7.0.0 and needs a major upgrade.
2. **OQ1 and alternatives.** Alt 1 is not letter-pure (14,682/35,594). Close OQ1 on parse identity, with the 0-consumer census.
3. **Third byte group.** Add the `</SCRIPT` lowercasing that 8.1.0 corrupts and the patch fixes, add a pin for it, and file the JS/style lowercasing as a separate finding.
4. **Type matcher.** Align `JSON_SCRIPT_TYPE_RE` with its prose: widen it to WHATWG `*/*+json`, or narrow the comment and the REFERENCE line.
5. **Bench.** Record the measured per-element cost in the guardrail-2 line.

## Guardrail check (if this lens owns one)

| # | Guardrail | Result |
|---|---|---|
| 1 | Zero runtime deps | pass (0 added) |
| 2 | Render hot path | pass, with the recorded delta (+1.3% on a realistic page, about 26 ns per JSON-typed script) |
| 3 | Escape by default | pass. `Raw` in a JSON script gets the same treatment `Raw` in a JS script already gets. Parse identity holds for the bag and `Raw` routes on 3/3 engines. |
| 4 | Type-safety | N/A (no type change) |
| 5 | Instruction set | pass (the serializer is the only layer that sees the type; packages/ui has 0 hits) |
| 6 | Pure core | pass |
| 7 | Converge | pass (0 new surface; 25 helpers stay byte-identical; the template drops 1 helper) |
| 8, 9, 13 | Naming, class strings, styling | N/A |
| 10 | Runtime grammar | the browser contract is shown on Chromium 149.0.7827.55, Firefox 151.0 and WebKit 26.5 |
| 11 | Breaking = codemod-first | N/A (no consumer break measured) |
| 12 | Enforcement over prose | pass (guideline delta 0, 1 template comment line deleted) |

No guardrail killer.

**Caps logged:**
- Fuzz sizes are as stated per script.
- The agent sample is 4 fresh runs plus the RFC's 6.
- The lane census covers `.ts/.js/.mjs/.cjs/.html/.snap/.txt` in the 58-repo dedup corpus, with `.claude/`, `node_modules`, `dist` and build output skipped.
