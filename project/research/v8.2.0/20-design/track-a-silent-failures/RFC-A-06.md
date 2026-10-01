---
id: RFC-A-06
track: A
title: "JSON-typed script bodies carry no '<': the serializer writes every '<' as \\u003c, so data cannot open or close the script"
resolves: [F-A-502]
cluster: C-19
api_surface: []
enforcement: runtime
error_text: >-
  n/a at the runtime layer: the code authors already write, Script(JSON.stringify(x)).setType("application/ld+json"),
  now renders a closed element, so there is nothing to diagnose. Executed before/after (probe.mjs, 4 JSON types x 8
  payloads, fresh about:blank per case): 8.1.0 keeps the page intact in 12/32 cases per engine (every '<!--<script>'
  payload gives body children 0, app script ran 0, JSON.parse of the body throws); patched 32/32 on Chromium
  149.0.7827.55, Firefox 151.0 and WebKit 26.5.
prose_deleted: ["projects-template/templates/full-stack/src/app/seo/seo.meta.ts:37"]
guideline_delta: 0
lockstep: [template]
codemod: none
codemod_dry_run: "n/a"
dims_predicted: { silent-failure: +0.5, prior-alignment: +0.1 }
impact: 2
effort: S
ships_to: 8.1.x
depends_on: []
status: proposed
---

# RFC-A-06: JSON-typed script bodies carry no `<`, so data cannot open or close the script

`$S` = `<scratch>/wave2/RFC-A-06`.
- `lib/`: the patched lib copy (node_modules symlinked), built with the repo's own build script.
- `base/`: the same copy with the shipped `serialize.ts` restored. It is the 8.1.0 baseline for every comparison below and is built the same way.
- `serialize.patch`, `reference.patch`, `template-seo.patch`: the diffs.
- `probe.mjs`, `probe-b.mjs`, `importmap-probe.mjs`, `fuzz.mjs`, `idem.mjs`, `bench-script2.mjs`, `script-census.mjs`: the executed checks. Their outputs are in `*.json` / `*.log` next to them.

Browsers for every probe: Chromium 149.0.7827.55, Firefox 151.0 and WebKit 26.5 (playwright-core 1.61.1). Each probe case loads `about:blank` first, so no window state carries from one case to the next.

## Problem

`sanitizeRawContent` (`src/render/serialize.ts:210-215`) rewrites only `</script` inside a script body. That rule is closer-only by design: opener hardening was reverted because a `\` before `<!--` or `<script` corrupts benign JS (`serialize.ts:200-205`; ledger L-012; pinned by `test/security.test.ts:163-168`).

The HTML tokenizer has a second way out of script data. `<!--` enters the escaped state, and a following `<script` plus a delimiter enters the double-escaped state. In that state the real `</script>` does not close the element. Everything after it, up to the next `</script>` seen in the escaped state, becomes script text. The L-012 premise was that this "only matters inside the raw-JS escape hatch" (`serialize.ts:205`). It does not hold, because the fleet serializes data into script bodies:

**Measured on 8.1.0** (`probe.mjs`):
- Setup: a Document with `Script(JSON.stringify(d)).setType(T)` in the head, then `Main(H1, P)`, an app `Script` and a `Footer` in the body. T is `application/ld+json`, `application/json`, `importmap` or `speculationrules`. There are 8 data payloads.
- 12/32 per engine keep the page intact, on all 3 engines.
- The 20 failures are exactly the 5 opener payloads (`Deluxe <!--<script> set`, `<!--<script>`, `<!--<SCRIPT/x`, `<!--<script></script>`, `\<!--<script>`) in all 4 types. Each gives body children 0, the app script never runs, and the body no longer parses as JSON.
- Nothing errors on the server or in the console.
- `x</script><img src=x onerror=…>` is already held by the closer rule (0 XSS in 96/96 base runs). The failure is page integrity, not script execution.

**Import maps** (`importmap-probe.mjs`): on 8.1.0, a map key holding `<!--<script>` loses the `<h1>` and the import on 3/3 engines. A plain `app<1` key resolves on 3/3.

**Fleet** (`script-census.mjs` over the 58-repo dedup corpus, `.claude/` skipped):

| Measure | Count |
|---|---|
| `Script(` calls | 364 |
| JSON-typed sites (33 `application/ld+json`, 1 `application/json`) | 34, in 31 repos |
| Escaped through a hand-rolled `.replace(/</g, "\\u003c")` helper | 25 sites in 25 repos (16 canonical-era, 9 pre-7) |
| Not escaped | 9 sites in 8 repos |

The canonical-era template copy of the helper is `projects-template/templates/full-stack/src/app/seo/seo.meta.ts:37-39`. F-A-502 counted 14 helpers on a narrower corpus.

The 9 unescaped sites:
- Canonical-era (2):
  - `projects-template/templates/web/src/shared/seo.ts:127`: `StructuredData(data)`, fed by `seo.structuredData` at `:220` and by `WebsiteSchema` at `layout.ts:64`.
  - `workshop-toni/src/app/narration/views/narration.components.ts:63`: an `application/json` island that `story.ts:46` reads with `JSON.parse(block.textContent)`.
- Pre-7 (7, in 6 repos):
  - `filmplast-landing-page/src/shared/seo.ts:104`
  - `filmplast-v2/src/shared/seo.ts:126`
  - `fivb-prototype/src/shared/seo.ts:125`
  - `jt-cut/src/shared/components/layout.view.ts:148`
  - `jtdigital-landing-page/src/cv/cv.controller.ts:57` and `src/shared/seo.ts:118`
  - `varnoska/src/app/seo/seo.meta.ts:77`

Also measured:
- 3 more sites build `Raw("<script …>" + JSON.stringify(…))`, in 2 pre-7 repos (`gzs/inovacije` x2, `jt-vault` x1). `Raw` stays explicit (guardrail 3), so they are out of scope.
- 0 sites set a JSON type through `addAttribute("type", …)`.
- 0 sites build `El("script", …)` outside the lib's own tests.

## Instruction-set check

**One layer up, the template solves half of it.** The full-stack `jsonLdScript` helper (`seo.meta.ts:38-40`) hand-escapes `<`, and `tests/unit/seo-meta.test.ts:99-106` pins `\u003c/script>`. The same starter's web template does not (`templates/web/src/shared/seo.ts:126-129`). `packages/ui` has 0 `Script(`, `ld+json` or `u003c` hits. The eslint plugin and the extractor have 0 rules or code that touch script bodies.

**Withheld agents** (wave0-2 `run-claude.sh`, `--restricted`, no repo access; `$S/agent/run1-6`):
- 6/6 runs hand-roll a 5-replace helper for `<`, `>`, `&`, U+2028 and U+2029, at 9-15 lines with its JSDoc, for both the JSON-LD and the data island. Runs 1-3 were told "editors type them freely"; runs 4-6 were not.
- 3/6 set the type with `.setType(…)`. The other 3 invented `.type()`, `.attr()` or `Script({ type }, …)`.

So the prior writes an escape when it writes the code fresh. The 9 unescaped fleet sites are template-derived code that skipped it.

**Why the fix belongs in the library.** The serializer is the only place that knows a string is going into a script body of a given type. A user-land helper cannot protect a direct `Script(JSON.stringify(x)).setType(…)`, and 9/34 fleet sites are exactly that. The library already owns the closer half of this job in the same function. The opener half is byte-safe only for JSON: in valid JSON, `<` can only occur inside a string, where `\u003c` parses to the same value. That is the "byte-safe transform" L-012 said was missing.

## Proposed change

This changes only `src/render/serialize.ts`, at +23/-9 lines (`$S/serialize.patch`). No exported symbol changes. `RenderCtx` and `sanitizeRawContent` are `@internal` and absent from `src/render/index.ts:1-4`.

```ts
export type RenderCtx = 'escape' | 'raw' | 'script' | 'json' | 'style';

const LT_RE = /</g;
// importmap, speculationrules, and any JSON MIME (application/json, text/json, every +json subtype)
const JSON_SCRIPT_TYPE_RE = /^\s*(?:importmap|speculationrules|(?:application|text)\/(?:[\w.!#$&^-]+\+)?json)\s*(?:;|$)/i;

export function sanitizeRawContent(content: string, element: 'script' | 'json' | 'style'): string {
  if (element === 'script') return content.replace(SCRIPT_CLOSE_RE, '<\\/script');
  if (element === 'json') return content.replace(LT_RE, '\\u003c');
  return content.replace(STYLE_CLOSE_RE, '<\\/style');
}

// setType wins over the bag, matching the browser (the schema-key attribute is emitted first)
function scriptCtx(tag: Tag): 'script' | 'json' {
  const ty = (tag as unknown as { _type?: unknown })._type ?? (tag.attributes !== EMPTY_ATTRS ? tag.attributes['type'] : undefined);
  return typeof ty === 'string' && JSON_SCRIPT_TYPE_RE.test(ty) ? 'json' : 'script';
}
```

The traversal changes in both loops: `emitChunks` at `:344` and `emit` at `:430`.
- `childCtx` becomes `el === 'script' ? scriptCtx(v) : el === 'style' ? 'style' : c`.
- The RawString arm (`:329`, `:409`) becomes `c === 'escape' || c === 'raw' ? v.html : sanitizeRawContent(v.html, c)`. This keeps the 8.1.0 behavior for the four existing contexts and covers `json`.

The comment at `serialize.ts:205` ("parked …") is replaced by two lines that state the JSON transform.

Emitted bytes:

| Body | Output |
|---|---|
| JSON-typed body | Every `<` in a string or `Raw` child becomes `\u003c`. Nothing else changes, and `</script` needs no separate rule because no `<` survives. A `Tag` child, reachable only through `El("script", Tag)` (0 fleet sites), still emits its own tags as markup, as on 8.1.0. |
| JS-typed body (no type, `module`, `text/javascript`, `application/javascript`) | Closer-only, as today. |
| Non-JSON data block (`text/x-template`, `application/jsonp`) | Closer-only, as today. |
| `Style` | Closer-only, as today. |

**Tests** go in `test/security.test.ts`: 6 new cases next to the A-006 block at `:154`.
- The exact bytes for `{"name":"<!--<script>"}` in an ld+json body.
- Parse identity and no `<` left, for 8 type spellings: `application/json`, `application/ld+json`, `importmap`, `speculationrules`, `text/json`, `application/geo+json`, `Application/JSON; charset=utf-8` and ` importmap `.
- Idempotency with the fleet helper.
- The bag-set type, for both a string child and a `Raw` child.
- JS and non-JSON types stay on the closer-only rule, for 6 type spellings.
- `renderToIterable` matches `render`.

Docs: `REFERENCE.md:1402` gets a one-line rewrite at net 0 (`$S/reference.patch`). Today it says script bodies are "intentionally **not escaped**", which is already untrue for the closer. The new line names the closer rule and the JSON `<` rule. CHANGELOG gets an 8.1.x "Security" entry.

## Before → after

The template web starter's own call (`templates/web/src/shared/seo.ts:127`), given a page title (`$S/beforeafter.mjs`):

```
8.1.0  <script type="application/ld+json">{"@context":"https://schema.org","@type":"BlogPosting","headline":"How <!--<script> tags work"}</script>
patch  <script type="application/ld+json">{"@context":"https://schema.org","@type":"BlogPosting","headline":"How \u003c!--\u003cscript> tags work"}</script>
```

workshop-toni's data island (`narration.components.ts:63`):

```
8.1.0  <script id="narration-schedule-p1" type="application/json">{"at":"09:00","line":"a<\/script>b"}</script>
patch  <script id="narration-schedule-p1" type="application/json">{"at":"09:00","line":"a\u003c/script>b"}</script>
```

A JS body is unchanged, byte for byte: `<script>const re = /<script/; x = '<!--<script>';</script>` is identical in both builds.

**In the browser** (`probe.out.json`, `probe.full.json`):

| Engine | 8.1.0 intact | Patched intact | Parse identical (patched) |
|---|---|---|---|
| Chromium 149.0.7827.55 | 12/32 | 32/32 | 32/32 |
| Firefox 151.0 | 12/32 | 32/32 | 32/32 |
| WebKit 26.5 | 12/32 | 32/32 | 32/32 |

Import maps (`importmap.out.json`): on 8.1.0 the `app<!--<script>` key resolves 0/1 and the body is lost on 3/3 engines. Patched resolves 2/2 keys with the body intact on 3/3.

**Differential fuzz** (`fuzz.mjs`, 100,000 random trees, 10 type spellings, bodies built from `<`, `<!--`, `<script`, `</script>`, `-->`, `\`, `"`, U+2028 and other fragments):
- JSON-typed renders: 61,333. Parse identical in 61,333/61,333, with 0 `<` left in any JSON body.
- Bytes differ in 26,109 renders. Those are exactly the JSON-typed bodies that contain `<`.
- 0/38,667 non-JSON renders differ.

## Enforcement

The layer is **runtime**, in the serializer.

**Why no stronger layer.** The failure depends on runtime data (a CMS title, a schedule line), so no type and no lint rule can see `<!--<script>` in it. A lint rule could only demand a hand-rolled escape on `Script(JSON.stringify(…))`, and that is the very helper this change retires. At the runtime layer the code the 9 unescaped sites already contain becomes correct. The code the 25 helpers and the 6/6 withheld agents write keeps rendering byte-identical (`idem.mjs`: fleet helper 10,000/10,000, agent helper 10,000/10,000). A bare `Script(JSON.stringify(v))` on the patch equals 8.1.0 plus the fleet helper in 10,000/10,000 cases.

**No diagnostic.** There is no error to word, because a wrong guess no longer exists for JSON-typed scripts. The regression guard is the 6 unit pins. 4/6 fail on the 8.1.0 source (`base/`): the exact-bytes, parse-identity, idempotency and bag-type cases. 2/6 guard the JS and stream paths and pass in both builds.

## Replaces (converge)

**Made redundant:**
- The hand-rolled `.replace(/</g, "\\u003c")` helper in 25 fleet repos. The canonical copy is `projects-template/templates/full-stack/src/app/seo/seo.meta.ts:37-39`: the comment line at `:37` (listed in prose_deleted) and the `.replace` on `:39`.
- The 9-15-line escape helper the withheld agents write.

**Effect on code that keeps them:** none. Every one of these renders byte-identical (measured above), so no codemod is needed and old copies stay correct.

**Guideline lines:** 0 today teach this escape. `grep -rn "u003c\|ld+json\|Script("` over `guidelines/web-development/**` and `fluent-html/CLAUDE.md` finds only `Script().setSrc(…)` examples and the `seo: { jsonLd? }` prop line. guideline_delta is therefore 0, and no line is added: the rule lives in the serializer, not in prose.

**Lib docs:** `REFERENCE.md:1402` changes 1 line for 1 line (net 0).

**Not replaced:**
- JS-typed bodies keep the closer-only rule (L-012 stays parked for JS).
- Residual: 94 `${JSON.stringify(…)}` interpolations sit in files that call `Script(`, across 32 repos. 90 of them are the template's cookie-consent copy (`templates/full-stack/src/core/layout/layout.scripts.ts:75,79,82` and its copies): developer-authored i18n strings inside a JS body. No byte-safe transform exists there without a JS tokenizer, so they are out of scope.

## Lane & migration

**Lane 8.1.x, the next patch** (8.1.1, which RFC-A-01 also needs).

**No public-shape change:** `api_surface` is empty, and `RenderCtx` / `sanitizeRawContent` are internal.

**Emitted bytes change only inside JSON-typed bodies that contain `<`:**
- 26,109/26,109 differing fuzz renders.
- 0/38,667 non-JSON renders.
- 0 bytes for the 25 escaped fleet sites.

The changed bytes fall in two groups:
- **Bodies that never worked** (the opener payloads: 20/32 per engine). These are what the 8.1.x rule targets.
- **Bodies that worked and contain `<` with no opener** (`1 < 2 && 3 > 2`). The bytes change, but the parsed value is identical: 61,333/61,333 in the fuzz, 32/32 x 3 engines in the browser.

So the lane claim holds at the level of what any consumer reads (`JSON.parse`, the import-map parser, a JSON-LD crawler). It does not hold for a reader that compares the raw `textContent` string of a JSON block. Open question 1 offers the narrower variant.

**Consumers, measured:**
- Lib suite: 2,159/2,159 before the new pins and 2,165/2,165 with them. tsc 0, eslint 0 on the changed files, and `test/types/color-optout` compiles.
- Template scaffold (`$S/app` vs `$S/app-base`, a copy of the wave0-2 teamapp): unit+view 403/403 on 8.1.0 and 403/403 on the patch.
- Live repo **na-cent** (installed lib = HEAD dist, 0 file diffs): 1,045/1,045 on 8.1.0 and 1,045/1,045 on the patch, tsc 0.
- Fleet test files (2,808 scanned): 0 assert a literal `<` inside a JSON body. The JSON-body assertions are `type="application/ld+json"` presence checks and the template's `\u003c/script>` pin, which passes on both builds.

**Template lockstep** (`$S/template-seo.patch`). After the lib commit is on `main` and the template lockfile points at it:
- Drop `seo.meta.ts:37` and the `.replace(…)` on `:39`.
- Measured with the patch: 403/403, tsc 0, eslint 0, the `seo-meta`/`seo.view` files 18/18, and na-cent with the same edit 1,045/1,045.
- The existing pin `seo-meta.test.ts:105` is the sequencing guard. The same edit on 8.1.0 fails it, 1 of 14 ("keeps jsonLd containing </script> inside the script element"), so a stale lockfile cannot ship the unprotected form.

**Not touched:**
- The web starter needs no template change (`seo.ts:127` becomes correct through the lib).
- The other 24 helper copies stay correct and need no edit (idempotent).
- No codemod.

**Reach:**
- 12/16 canonical-era repos depend on `github:JT-Digital-d-o-o/fluent-html#main` and get the fix on their next install.
- 4 pin a commit or a vendored tarball and need a bump: fl-um and na-cent (`#9d86871`), workshop-toni (`#bb5515c`), and fluent-html-home-page (`vendor/fluent-html-8.1.0-9d86871.tgz`).
  - workshop-toni holds one of the 2 canonical-era unescaped sites, so its bump is the one that matters.
- The 9 pre-7 repos with helpers and the 6 pre-7 repos with unescaped sites get the fix only when they upgrade.

## Guardrail check (§5, 1–13)

1. Zero runtime deps: pass. No dependency is added.
2. Sync render hot path: pass.
   - `dist/bench/render.js`, base vs patch, 5 alternating runs, medians: patched/base ratios 0.981–1.038 across all 8 scenarios. The non-script path gains no work, because `scriptCtx` runs only when `el === 'script'`.
   - Interleaved script-heavy bench (`bench-script2.mjs`, 2 processes): a 5-script head goes 1,699 → 1,632 ns and 1,775 → 1,832 ns; a page with JSON-LD and 200 tags goes 46,334 → 44,354 ns and 53,844 → 52,442 ns.
3. Escape by default: pass. This strengthens it. `Raw` children inside a JSON script get the same treatment that `Raw` inside a JS script already gets (`serialize.ts:329,409`). `Raw` in HTML context stays verbatim.
4. Type-safety: N/A. There is no type change and no inference through wrappers.
5. Instruction set: pass. Only the serializer knows the body's context. The user-land helper misses 9/34 fleet sites, including the template's own web starter.
6. Pure core: pass.
7. Converge: pass. It replaces the 25-copy helper and adds no second way; old copies render byte-identical.
8. Naming: N/A. No new names.
9. Class-string contract: N/A. No classes are emitted.
10. Runtime-grammar contract: N/A for htmx and Tailwind. The browser contract is proven on 3 engines (above).
11. Breaking = codemod-first: N/A (8.1.x). The breaking-change reading of the bytes is in Lane & migration.
12. Enforcement over prose: pass. 0 guideline lines added, 1 template comment line deleted, REFERENCE net 0.
13. Append-only styling: N/A.

## Scorecard prediction

- **silent-failure +0.5.** It closes a failure that renders an empty page with no error: 20/32 payload-type pairs per engine, reachable from 9 unescaped fleet sites (2 canonical-era, one of them the template's web starter).
- **prior-alignment +0.1.** Both observed priors now produce the same correct bytes: the bare `Script(JSON.stringify(x)).setType(…)` that the fleet sites wrote, and the hand-escaped one that 6/6 agents wrote. It stays small because agents already escape.
- **context-economy +0.** No teaching is added. Agents will keep writing the helper, harmlessly, unless a later guideline pass chooses to say it is unneeded.

## Alternatives considered

1. **Opener-only rewrite in the JSON context** (`<!--` → `\u003c!--`, keeping the closer rule).
   - Measured (`probe-b.mjs`): 32/32 on 3/3 engines, and bytes change only where `<!--` occurs.
   - Not chosen: two rules instead of one checkable invariant ("a JSON body holds no `<`"). It also diverges from what the 25 fleet helpers and the 6/6 agents emit, which hold no `<` at all.
   - It is the fallback if curation reads the 8.1.x byte rule literally (open question 1).
2. **Opener hardening for every script** (the reverted L-012 change). Rejected again: a `\` before `<!--` or `<script` corrupts JS. The 3 benign-JS pins at `test/security.test.ts:163-168` still pass on the patch, and that is why the transform is limited to JSON types.
3. **A `JsonScript(data)` / `JsonLd(data)` primitive.** Rejected:
   - It is new public surface (8.2.0).
   - It is a second way: `Script(…).setType(…)` would remain, and stay unprotected.
   - It is a component, which belongs in user-land (guardrail 5).
4. **A lint rule requiring an escape on `Script(JSON.stringify(…))`.** Rejected: it teaches the helper this change retires. It would also fire on correct code once the lib escapes, and it cannot see data passed through a variable.
5. **A dev-throw on JS-typed bodies that reach the double-escaped state.** Rejected: it fires only if dev data happens to contain the payload. 90/94 JS-context `JSON.stringify` interpolations are developer copy.
6. **Also escaping `>`, `&`, U+2028 and U+2029** (what 6/6 agents do). Rejected:
   - `>` and `&` have no effect on the script-data tokenizer; only `<` leaves that state.
   - U+2028/9 are valid in both JSON and HTML raw text.
   - Adding them would change the bytes of all 25 fleet-helper sites (their output keeps `>` and `&`) for no tokenizer effect.

## Open questions (for curation)

1. **Lane reading.** Accept 8.1.x on parse identity (JSON bodies that hold `<` without an opener change bytes but not value), or take alternative 1, which changes bytes only where `<!--` occurs? Both are measured 32/32 on 3 engines.
2. **Template lockstep timing.** Drop the full-stack helper in the same template commit that bumps the lockfile to the fixed lib, with `seo-meta.test.ts:105` as the guard. Or leave all 25 copies in place, since they are idempotent.
3. **Browser pin.** The contract is pinned at the byte level (no `<` left, parse identity), and the browser consequence follows from the tokenizer. A Playwright row cannot join `test/acceptance/rows.spec.mjs`'s shared page shell, because row 27 asserts every script tag there is `src`-based. Accept the unit pins plus this RFC's 3-engine probe, or add a separate acceptance route?
4. **Ledger.** Mark L-012 resolved for JSON-typed scripts and still parked for JS bodies.
5. **Merge note.** RFC-A-08 (C-17) rewrites `buildStatusConfig` at `serialize.ts:189-198`, which directly precedes this RFC's hunk at `:200-216`. The two are textual neighbors only, with no shared lines.
