---
id: RFC-E-05
track: E
title: "fluent-html/testing inspect(): structural queries over a rendered View for tests"
resolves: [F-E-801]
cluster: E-18
api_surface:
  - "fluent-html/testing (new subpath export)"
  - "inspect(...views: View[]): InspectedFragment"
  - "InspectedScope: children, text(), html(), find(tag, where?), findAll(tag?, where?), byId(id: Id<string>)"
  - "InspectedElement: kind 'el', tag, id, classes, attrs, attr(name)"
  - "InspectedFragment: kind 'fragment'"
  - "types: InspectedNode, InspectedText, InspectedRaw, AttrValue, AttrMatch, TagName, ElementName"
enforcement: type
error_text: "TS2345: Argument of type '\"#email\"' is not assignable to parameter of type 'TagName'. | under vitest (types stripped): find/findAll take a tag name, not a selector: for #email use byId(ids.<name>) or byId(createId(\"email\"))"
prose_deleted:
  - "guidelines/quality-assurance/view-testing.md:7-56 (replaced by 31 lines)"
  - "guidelines/quality-assurance/view-testing.md:238-288 (replaced by 9 lines; teaches the removed OOB/withOOB at :242-250 and a non-compiling ids.userList.slice(1) at :282)"
  - "guidelines/quality-assurance/CLAUDE.md:58 (rewritten 1:1)"
guideline_delta: -61
lockstep: [guidelines, template]
codemod: none
codemod_dry_run: null
dims_predicted: { verification-loop: +1, silent-failure: +0.5, evolvability: +0.5, error-quality: +0.5 }
impact: 3
effort: M
ships_to: 8.2.0
depends_on: []
status: proposed
---

# RFC-E-05: fluent-html/testing inspect(): structural queries over a rendered View

`$W` = `<scratch>/track-e/RFC-E-05`: prototype lib in `$W/lib` (copy of 8.1.0 + `src/testing/`), 10 fleet copies in `$W/fleet/*` (installed 8.1.0 package with `dist/src/testing/` overlaid; `serialize.js` byte-identical to the scratch build in every copy), scripts `$W/*.mjs`, `$W/*.py`.

## Problem

The only way to look at a View is `render()` to a string, so every view test in the fleet checks that substrings occur somewhere in it.

**Demand, measured over the 16 canonical-era repos (template copies byte-identical to template HEAD excluded):**

| Pattern | Count | Script |
|---|---|---|
| App-authored string `toContain`/`toMatch` assertions | 8,065 in 14 repos (critic-corrected from 20,610) | F-E-801, `critic/c801.mjs` |
| Tag-extraction regex literals in test files | 440 (364 app-authored); 406 in `tests/view`, 14 in `tests/integration`; everyframe-composer holds 251 of 364 | `$W/scan-sites.mjs` |
| Hand-rolled markup-extraction helpers | 112 in 9 repos; same names re-invented across repos: `tagWithId` (fl-um `tests/view/redaction.view.test.ts:17`, stojnica `tests/view/kiosk-safe.ts:10`), `forms`, `bodyOf`; everyframe-composer `tests/view/render.view.test.ts:121` hand-rolls a depth-counting `elementById`; wsfas `tests/unit/support/form-controls.ts` is a 73-line form serializer with its own entity decoder | `$W/helpers.mjs` (8 sampled: 7 extract tags or subtrees, 1 re-implements escapeHtml to build expected markup) |
| Tag-strip text helpers | 9 in 3 repos (popri `visibleText` x7, none decode entities) | `$W/striphelpers2.mjs` |
| Extractions that fall back to `""`/`[]` on no match | 190 in 12 repos; 10 guarded by a non-empty check within 3 lines; 19 feed a `.not.` assertion within 3 lines | `$W/fallback-neg.mjs` |
| Boolean attribute tested by bare word (`/<button[^>]*disabled/`) | 24 in 6 repos; a Tailwind `disabled:`/`checked:`/`open:` class satisfies them | `$W/classify.mjs` |
| DOM-parser test dependencies | 0 in 17 `package.json` (16 canonical + template full-stack) | grep |

**Silent passes, executed** (`$W/mutate2.py` over `$W/mutants-all.json`; each mutant is one structural edit to real app source in the scratch copy, then the original test file and its inspect rewrite run):

| Id | Repo | Mutant | Original string suite | Inspect rewrite |
|---|---|---|---|---|
| T1 | projects-template (scaffolded) | FormGroup's id moves to the wrapper div, so the label points at a div | 33/33 pass | 1 fails |
| N1 | na-cent | date fold moved outside `#date-fields` (the test comment at `tests/view/transactions.view.test.ts:495` says it lives inside; the assertion only checks `id="date-fields"` exists) | 55/55 pass | 1 fails |
| F1 | fl-um | unticked videos vanish from the checklist; `tagWithId(html, "source-src-2")` returns `""` and `.not.toContain("checked")` passes | 18/18 pass | 1 fails |
| P1 | popri | start button keeps its `disabled:opacity-50` classes and loses the `disabled` attribute (`src/app/canvas/evaluation/views/evaluation.strip.view.ts:108`) | 19/19 pass | 1 fails |
| E1 | everyframe-composer | app chrome loses `lg:h-screen`; `toContain("h-screen")` (`tests/view/captions.view.test.ts:99`) still matches `min-h-screen` | 54/54 pass | 1 fails |
| C1 (control) | home-page | launcher panel loses `popover` | 1 fails | 1 fails |
| C2 (control) | everyframe-composer | brand fold loses its `open` toggle | 1 fails | 1 fails |

String suites catch 0/5 structural mutants, inspect rewrites 5/5; on the 2 controls both catch.

**Live defects in suites that pass today.** I patched `render()` in the 10 copies (`$W/audit-run.py`, `$W/audit-patch.mjs`) to build `inspect(view)` on every call while the full `tests/view` suites ran (4,589 original view tests). It logged duplicate ids, and for full documents dangling `label[for]`/ARIA IDREFs and labels that point at non-controls. It found 31 distinct defects in 6 of 10 repos, 29 of them in full-page renders: 30 duplicate ids and 1 label aimed at a div. 0 IDREFs dangle. Three verified by reading the source:
- Template account page: the scaffolded page renders `id="password"` twice (Form<T> stamps id = field name; template source `src/app/account/views/account.page.view.ts:122/142` and `:233`). everyframe-composer inherits it.
- na-cent `src/app/users/views/users.components.ts:99` says the row select "carries its own accessible name rather than a `for`/`id` pair", while `f.select("role")` at `:104` stamps `id="role"` on every row (3 in the fixture).
- gzs/stem-50 `src/app/thesis/views/thesis.sections.view.ts:164` passes a Div of two selects as FormGroup's `input`, so `label for="defenseDate"` names a div. That is the T1 mutant, live in production code.

**Teaching drives the pattern.** `guidelines/quality-assurance/view-testing.md:9` says "Use `render()` to get the HTML string and assert on its contents". The file has 60 `toContain`/`toMatch` lines, `:48-56` presents `toContain` as the correct form, and `quality-assurance/CLAUDE.md:58` repeats it. 4/4 recon-02 agent runs verify by string (F-E-801).

## Instruction-set check

- One layer up: the template's `tests/view/page-shell.ts:9-13` (`expectPageShell`) is 3 string checks. `tests/integration/seo.test.ts:8` declines a parser: "Deterministic SSR output from our own renderer: anchored extraction, no HTML parser dependency." `packages/ui`: 0 inspection helpers. 0 of 17 package.json files carry jsdom, happy-dom, cheerio, linkedom, parse5, node-html-parser or @testing-library/dom.
- Needs library support. An element's attributes live in 5 storage channels (`_id`/`_class`/`_style`, `_sk` schema keys, the `attributes` bag, `_htmx`, `toggles`) that only `buildAttrs` (`fluent-html/src/render/serialize.ts:221`) reads, together with the serializer-private script/style contexts and the `Document` doctype brand. `fluent-html/render` exports 9 names, none of them `buildAttrs`. Executed from fl-um, `import("fluent-html/dist/src/render/serialize.js")` fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`. Userland can only re-parse the string.
- Not a component: a read-only query primitive that emits no markup. It is no runtime oracle either. L-421 (ADR-12) rejected emission unit tests as sufficient, and that stands: RFC-A-03 (bundle oracle) and Playwright remain the runtime check.

## Proposed change

New subpath `fluent-html/testing` (`src/testing/index.ts`, 258 lines in the prototype; `src/testing/element-names.ts`, 16 lines; one `exports` entry). Final signatures, compiled in `$W/lib/dist/src/testing/index.d.ts`:

```ts
export type AttrValue = string | true;                                  // decoded value, or true for a bare boolean attribute
export type AttrMatch = Readonly<Record<string, AttrValue | false>>;   // exact value, true = present, false = absent
export type ElementName = "a" | "abbr" | /* ... */ | "wbr";             // the 132 names the element factories emit, pinned by a test
export type TagName = ElementName | `${Lower}${string}-${string}` | "*"; // + custom elements + any element

export type InspectedText = { readonly kind: "text"; readonly text: string };
export type InspectedRaw  = { readonly kind: "raw";  readonly html: string };   // Raw(), script and style content: opaque
export type InspectedNode = InspectedElement | InspectedText | InspectedRaw;

export interface InspectedScope {
  readonly children: readonly InspectedNode[];
  text(): string;                                                     // descendant text, whitespace-collapsed, trimmed; raw nodes skipped
  html(): string;                                                     // the exact bytes render() emits for this node
  findAll(tag?: TagName, where?: AttrMatch): readonly InspectedElement[]; // descendants, document order
  find(tag: TagName, where?: AttrMatch): InspectedElement;            // throws unless exactly 1, listing candidates
  byId(id: Id<string>): InspectedElement;                             // throws unless exactly 1, listing ids present
}
export interface InspectedElement extends InspectedScope {
  readonly kind: "el"; readonly tag: string; readonly id: string | undefined;
  readonly classes: readonly string[]; readonly attrs: ReadonlyMap<string, AttrValue>;
  attr(name: string): AttrValue | undefined;
}
export interface InspectedFragment extends InspectedScope { readonly kind: "fragment" }
export function inspect(...views: View[]): InspectedFragment;
```

Semantics, each pinned by `$W/lib/test/testing.test.ts` (13 tests, 10/10 reruns green):
- **One walk, one serializer.** `inspect` mirrors `emit()`'s work stack. It is iterative, so a 20,000-deep tree does not overflow. Each element's attributes come from parsing `buildAttrs(tag)`. The parse is unambiguous because attribute keys are validated (`src/core/tag.ts:15`) and values pass through `escapeAttr`. Of two same-named attributes, the first is kept, as the HTML tokenizer does (C-63 stays deferred). `html()` calls `emit()` itself, so `inspect(v).html() === render(v)` holds by construction. The parity test re-serializes the tree from nodes alone: exact on 5000/5000 random trees without empty children, and equal modulo separator newlines on 5000/5000 with them (an empty child emits only a `\n`).
- **Exactly-one lookups.** `byId` and `find` throw on 0 or more than 1 hits, which closes the 190-site empty-fallback class and reports duplicate ids. Verbatim messages: `inspect: expected exactly 1 element with id="main-content", found 0; ids present: email` and `inspect: expected exactly 1 <input name="maxScore">, found 0; <input> present: <input id="email" type="email" name="email" required>` (capped at 12 entries).
- **Attributes, not classes.** `attr("disabled") === true` needs the attribute. `classes` is the token list, so `classes.includes("h-screen")` does not match `min-h-screen`.
- **Untyped misuse gets the fix in the message.** vitest strips types, so the runtime checks mirror the type rules: `byId("email")` throws `byId takes an Id: pass ids.<name> from defineIds, or createId("email")`, `find("#email")` throws `find/findAll take a tag name, not a selector: for #email use byId(ids.<name>) or byId(createId("email"))`, and `findAll("input[name=email]")` throws `"input[name=email]" is not an element name: ... e.g. find("input", { name: "email" })`.
- **Not included.** No nonce option: 0 app-authored test calls pass `{ nonce }` or `renderWithNonce` (`$W/nonce.mjs`), and inspect shows author-set nonces only. No CSS selectors, no HTTP bodies, and inspect never runs on the render hot path.

## Type-safety and error text (executed)

Probe `$W/probe/probe.ts` (wrong guesses) and `$W/probe/probe-main.ts` (generic wrappers), compiled under TS 5.9.3 and 6.0.3 with identical diagnostics:

| Line | Diagnostic |
|---|---|
| `doc.byId("email")` | TS2345: Argument of type 'string' is not assignable to parameter of type 'Id<string>'. |
| `doc.byId({ id: "email", selector: "#email" })` | TS2345 ... Property '[__idBrand]' is missing ... |
| `doc.findAll("lable")` / `doc.find("buton")` | TS2345: ... not assignable to parameter of type 'TagName'. |
| `doc.find("#email")`, `doc.find("input[name=email]")` | TS2345: ... not assignable to parameter of type 'TagName'. |
| `doc.attr("type")`, `doc.querySelector(...)` | TS2339 (anonymous; open question 5) |
| sanctioned: `byId(ids.email)`, `byId(createId(\`row-${n}\`))`, `findAll("my-widget")`, `find("input", { name: "email", required: true, disabled: false })`, `findAll("clipPath")` | 0 diagnostics |
| wrappers `<N extends string>(id: Id<N>) => s.byId(id)`, `(tag: TagName) => s.find(tag)`, `<T extends ElementName>(tag: T) => s.find(tag)` | 0 diagnostics |
| wrapper `(tag: string) => s.find(tag)` | TS2345 ... 'TagName' (intended) |

A first variant put the fix text in the type through `const`-inferred conditional parameters, for example `` `byId takes an Id: ... createId("email")` ``. It broke the generic wrappers (`Argument of type 'Id<N>' is not assignable to parameter of type 'IdArg<Id<N>>'`), which is the §5.4 dead end, so it was dropped. The type layer names the target type (`Id<string>`, `TagName`), and the runtime twin names the fix.

## Agent fitness (pure prior, executed)

Four `claude -p` runs with no docs (`$W/prior/task.txt`, harness `wave0-2/run-claude.sh`), told only that `inspect(...views)` exists, wrote a FormGroup test. The naming follows them:

| Name the runs reached for | Runs |
|---|---|
| `.attr(name)` | 4/4 |
| `.tag` | 4/4 |
| `text()` as a method | 3/4 (1 used a `.text` property) |
| `find(...)` / `findAll(...)` | 3/4 (1 used `query`/`queryAll`) |
| `byId(...)` | 2/4 (1 with `ids.email`, 1 with a string) |
| a `"#email"` selector | 2/4 |

I fixed only an unrelated library miss (`Input().type` instead of `.setType`) and ran the 4 files against the prototype (`$W/fleet/tpl/tests/prior`). 6 of 12 tests pass as written. Of the 6 failures, 3 carry a message that names the fix: `byId takes an Id ... createId("email")`, `find/findAll take a tag name, not a selector: for #email use byId(...)`, and `expected exactly 1 element with id="email", found 0; ids present: #email` (which exposes the run's `String(ids.email)`, i.e. the selector). The other 3 are `tree.query is not a function`, all from 1 run.

## Before → after (real fleet code, rewritten and run)

popri `tests/view/evaluation.view.test.ts:144,153` (passes mutant P1):
```ts
expect(html).not.toMatch(/<button[^>]*disabled/);
expect(html).toMatch(/<button[^>]*disabled/);
```
```ts
expect(doc.findAll("button", { disabled: true })).toEqual([]);
expect(doc.findAll("button", { disabled: true })).toHaveLength(1);
```

fl-um `tests/view/redaction.view.test.ts:17-19,44-45` (passes mutant F1):
```ts
function tagWithId(html: string, id: string): string {
  return html.match(new RegExp(`<[^>]*id="${id}"[^>]*>`))?.[0] ?? "";
}
expect(tagWithId(html, "source-src-2")).not.toContain("checked");
```
```ts
expect(doc.byId(createId("source-src-2")).attr("checked")).toBeUndefined();  // throws "found 0" if the row is gone
```

Template `tests/view/components.test.ts:34-38` (passes mutant T1) and `tests/view/page-shell.ts:9-13`:
```ts
expect(html).toContain('type="email"'); expect(html).toContain('for="email"'); expect(html).toContain('id="email"');
```
```ts
const input = doc.byId(createId("email"));
expect(input.tag).toBe("input");
expect(input.attr("type")).toBe("email");
expect(doc.find("label").attr("for")).toBe(input.id);
// page-shell.ts (13 -> 11 lines)
doc.byId(layoutIds.mainContent);
expect(doc.find("title").text().startsWith(`${title} | `)).toBe(true);
expect(doc.findAll("h1")).toHaveLength(1);
```

wsfas `tests/unit/support/form-controls.ts` (73 lines: attribute regexes, its own `decode`, `formStart` keyed on `<form id="X"` being the first attribute at `:32`) became `form-controls.inspect.ts` (25 lines) over `form.findAll("*")`, with the same `FormControl[]` output. stojnica `kiosk-safe.ts` (30 lines) became 21.

## Fleet rewrite measure

| Repo | Files rewritten | Original sites | Rewritten | tsc | Rewritten tests |
|---|---|---|---|---|---|
| projects-template (scaffold) | components, layout, home.view + page-shell.ts | 23 | 23 | 0 errors | 6/6 |
| fl-um | redaction.view | 48 | 48 | 0 | 19/19 |
| popri | evaluation.view | 27 | 27 | 0 | 12/12 |
| sportoawards | entry.dashboard.view | 37 | 37 | 0 | 7/7 |
| na-cent | imenik, projects, transactions | 20 | 20 | 0 | 7/7 |
| stojnica | lane.view, home.view + kiosk-safe.ts | 32 | 31 | 0 | 174/174 |
| website-sales-funnel-automation-system | companies.view + form-controls.ts | 17 | 17 | 0 | 9/9 |
| gzs/stem-50 | faculty-picker, preregistration | 23 | 23 | 0 | 7/7 |
| everyframe-composer | captions.view | 17 | 17 | 0 | 5/5 |
| home-page | launcher.view | 19 | 16 | 0 | 5/5 |
| **Total** | 16 test files, 3 helper modules | **263** | **259** | **10/10** | **251/251** |

Every rewritten site gives the same verdict as the original on the unmodified view. 4 sites were left as written: a 3-assertion hover-class test in home-page and a per-tile loop in stojnica. `inspect(v).html() === render(v)` on 28 real pages: 24 stojnica lane pages, fl-um RedactionSettingsPage, template HomePage, home-page ComposerLauncher, everyframe-composer CaptionsPage.

## Evolvability (executed)

`$W/order-exp.py` patches only the attribute ORDER in each copy's `buildAttrs` (same attributes, same values) and runs every `tests/view` file. Baseline: 1 failure that predates this RFC (popri `home.view.test.ts` copy drift).

| Variant | Original view tests failing (net of baseline) | Repos | Inspect rewrites failing |
|---|---|---|---|
| class/style emitted last | 34 / 4,589 | 4 | 0 / 251 |
| order reversed | 253 / 4,545, plus 44 tests that no longer collect (wsfas `form-controls.ts:32` throws at describe time) | 9 | 0 / 251 |

## Performance

The render path is untouched: `serialize.js`, `render.js` and `stream.js` in the prototype build are byte-identical (`cmp`) to the shipped 8.1.0 `dist`, so the render bench cannot move. On everyframe-composer's CaptionsPage (34,774 bytes, 304 elements), inspect costs 628 µs/op against render's 95 µs/op. That cost is test-only.

## Enforcement

- **Type** (strongest feasible) for the API's own wrong guesses: `byId` takes only a branded `Id` (string or spoofed object → TS2345 naming `Id<string>`), tags are a closed `TagName` union (typo or selector → TS2345 naming `TagName`), and `AttrMatch` accepts no other value shapes. Generic wrappers compile (§5.4).
- **Runtime twins** for vitest, which strips types: the messages quoted above, each naming the one-shot fix.
- **Exemplars over prose.** The template's own view tests (page-shell.ts, components.test.ts, layout.test.ts) move to inspect, because agents copy the template (4/4 recon runs mirror its string style). A `prefer-inspect` lint rule is left to curation (open question 4).

## Replaces (converge)

Replaced: 440 tag-extraction regexes (406 in `tests/view`), 112 hand-rolled extraction helpers, 9 tag-strip text helpers, substring assertions over `render()` output, and `expectPageShell`. Not replaced: `seo.test.ts` `extract()` and the 2,321 assertions on HTTP bodies, which read `server.inject` strings and remain a template concern. No lib API does this today. `html()` is not a second renderer, since it calls `emit()`.

Guidelines: `quality-assurance/view-testing.md:7-56` (50 lines) is replaced by a 31-line "Query the tree" section, and `:238-288` (51 lines; removed `OOB`/`withOOB` at `:242-250` per `CHANGELOG.md:506`, non-compiling `ids.userList.slice(1)` at `:282`) by a 9-line Partial/byId example. The remaining examples convert 1:1, and `quality-assurance/CLAUDE.md:58` is rewritten 1:1 ("Query the rendered tree with `inspect()`; never `toContain`/regex over `render()` output"). Net: **-61 lines**.

## Lane & migration

8.2.0, additive: a new subpath and new types, no change to any existing export or emitted byte. There is nothing to migrate, so no codemod is needed. Adoption is per test file. Lockstep:
- lib: `src/testing/*`, `exports["./testing"]`, `test/testing.test.ts` added to the `npm test` list, a brand-probe-style type fixture, a README "Testing views" section, a CHANGELOG entry.
- guidelines: the patch above.
- template: `tests/view/page-shell.ts`, the FormGroup suite and the preload test move to inspect.

## Guardrail check (§5)

1. Zero deps: pass. There is no parser; the tree reuses `buildAttrs`.
2. Hot path: pass. The render files are byte-identical to 8.1.0.
3. Escape: pass. inspect emits nothing; `html()` is `emit()`, and `Raw` stays opaque.
4. Type-safety: pass. The closed `TagName` union and the `Id` brand need no inference through wrappers, as the probe shows.
5. Instruction set: pass. It needs unexported internals and is not a component.
6. Pure core: pass. There is no context and no Fastify glue; HTTP bodies stay with the template.
7. Converge: pass. It names what it replaces, and render() remains the only serializer.
8. Naming: pass. The names come from the prior probe (attr 4/4, tag 4/4, find/findAll 3/4, text() 3/4); the API is read-only, so there are no set/add names.
9. Class-string contract: N/A, since it emits no classes.
10. Runtime grammar: N/A. It emits nothing and is explicitly not a runtime oracle (L-421).
11. Breaking: N/A.
12. Enforcement over prose: pass, guidelines -61.
13. Append-only styling: N/A.

## Scorecard prediction

- **Verification loop +1.** The test loop is where an agent learns a view is wrong. String suites caught 0/5 structural mutants and inspect caught 5/5, and the audit found 31 defects that 4,589 passing view tests miss.
- **Silent-failure resistance +0.5.** Exactly-one lookups close the empty-fallback class (190 sites) and the class-as-attribute class (24 sites). The gain is adoption-gated, hence half a point.
- **Evolvability +0.5.** Tests stop depending on serializer attribute order: 34 to 253 string failures against 0. That frees C-63 and RFC-A-09 to change emitted order or classes.
- **Error quality +0.5.** Wrong guesses fail with messages naming `byId`/`createId`/`find(tag, attrs)` at runtime, and with the `Id<string>`/`TagName` type at compile time.

## Alternatives considered

- **A DOM parser dev-dependency in the template** (happy-dom, cheerio). This is the closest substitute, with CSS selectors and prior-aligned names. It was declined at `seo.test.ts:8` and would be a new dev-dep in up to 58 repos. It parses bytes rather than walking the tree, has no `Id`-typed lookup, and its query methods return null on a miss, which reopens the empty-fallback class.
- **Exporting `buildAttrs` from `fluent-html/render`.** It exposes a serializer-internal string and invites one tree builder per repo, against §5.7.
- **Conditional-type error messages** in the signatures: tried, and they broke generic wrappers (§5.4).
- **CSS selectors** (`find("#email")`, used in 2/4 runs). They would add a selector parser and an untyped id channel. The runs are redirected to `byId` by the type error and the runtime message instead.
- **`query`/`queryAll` aliases** (1/4 runs): rejected under §5.7.
- **`find` returning `undefined` on a miss** (the prior's `toBeDefined()` habit): rejected, because that is the measured bug class.
- **A `{ nonce }` option**: 0 call sites.

## Open questions (for curation)

1. Name the subpath `fluent-html/testing` or `fluent-html/inspect`? E-28 (createEmail text part) would consume `text()` from production code.
2. A strict mode that throws on duplicate ids or duplicate attributes during `inspect`? The audit found 30 duplicate ids in passing suites; C-63 is deferred.
3. Follow-ups outside this RFC: the template account page renders `id="password"` twice, and `Form<T>`'s id = field name duplicates ids in repeated row forms (na-cent users, wsfas pipeline/budget). That second one is a lib cluster candidate.
4. Add an eslint `prefer-inspect` rule (warn, test files) over `toMatch(/<tag`, `.match(/<tag`, and attribute-shaped `toContain('x="')` on `render()` results?
5. `query`/`queryAll`/`attr` on the fragment die as anonymous TS2339 (3/12 prior-run tests). Accept that, or add `never`-typed members that name the successor?
6. `text()` collapses whitespace, including inside `<pre>`, as testing-library's default normalizer does. Is an exact-text accessor needed? So far the rewrites needed 0.
