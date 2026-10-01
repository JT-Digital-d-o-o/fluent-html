---
rfc: RFC-E-05
lens: agent-fitness
verdict: survives-with-changes
confidence: 0.75
killer_objection: "Adoption depends on exemplars. In a repo whose own view tests use strings (all 16 canonical repos after ship), 0/2 neutral-task agents found inspect from types alone and 1/2 found it with the RFC's guideline patch. The string tests they wrote instead missed 2/7 and 1/7 mutants. The predicted verification-loop +1 only arrives where template exemplars or a lint reach."
guardrail_killer: null
required_changes:
  - "AttrMatch `true` must mean present, as documented (index.d.ts:7 says 'true presence'). Today it matches only a bare attribute: findAll('button', { disabled: true }) returns [] for `<button disabled=''>`. A string '' must also match a bare attribute. Pin both in test/testing.test.ts."
  - "Ship the prefer-inspect lint (OQ4) in this RFC's lockstep, or restate verification-loop +1 as applying to template-seeded repos only (neutral-task adoption 0/2 types only, 1/2 guidelines only, 2/2 exemplars)."
  - "Add one-line docs for find/findAll/byId/text/html to testing/index.d.ts (exactly-1 throw, zero-or-more, whitespace collapse, html() === render()). 7/7 inspect runs had to read index.js or index.ts to learn these."
  - "Record in OQ that 5/7 inspect runs hand-wrote a lookup for the enclosing row and 4/7 a sibling check, and show row scoping by id (ForEachKeyed ids + byId) in the README/guideline example. No new API."
executed:
  - cmd: "claude -p withheld-context harness (wave0-2 recipe, opus-5-5 xhigh) x10 on a scaffold with the prototype overlaid; conditions A types-only, B RFC lockstep exemplars + README, G RFC guideline patch; explicit and neutral tasks"
    output: "inspect adoption: explicit A 2/2, B 2/2; neutral NA 0/2, NB 2/2, NG 1/2"
  - cmd: "tsc + vitest per run against original view and 7 mutants"
    output: "tsc 0 in 10/10; inspect runs 49/49 kills; string runs 16/21; structural M1-M5 inspect 35/35 vs string 10/15"
  - cmd: "12-guess wrong-API probe under tsc and vitest"
    output: "tsc flags 10/12; runtime names the fix 3/12; anonymous TypeError 4/12; silent at runtime 2/12 (1 also silent under tsc)"
  - cmd: "semantics probe: valued boolean, glued inline text, textarea"
    output: "addAttribute('disabled','') -> attr '' and findAll({disabled:true}) = 0; text() matches browser spacing because render emits a newline separator"
  - cmd: "rg valued boolean addAttribute over fleet"
    output: "165 sites in the 58-repo tree, 0 in the 16 canonical-era repos"
  - cmd: "5 fleet sites rewritten (efc pipeline :147-149, :388-389; stem-50 thesis :117-130, :866-878; wsfas review :179-182), tsc + vitest"
    output: "tsc 0 errors in 3 repos; 9/9 rewrites pass, 9/9 originals pass; the strict label check exposes the live defenseDate label-to-div defect"
  - cmd: "wc -c teaching surface"
    output: "README +839 B, exemplars +168 B, view-testing.md -1,238 B, CLAUDE.md:58 one line for one; d.ts 3,786 B read on demand"
---

# Verdict: RFC-E-05, agent-fitness lens

`$V` = `<scratch>/track-e/RFC-E-05-agent-fitness`.

## What I executed

### 1. The agent harness on a task that needs the capability

**Setup.** I used the wave0-2 recipe (`run-claude.sh`: `claude -p --restricted`, `env -i`, deny `npx/node/tsc/npm/git`, `--model claude-opus-5-5 --effort xhigh --permission-mode acceptEdits`).
- **Fixture.** A scaffold copied from `RFC-E-05/fleet/tpl`. Its `node_modules/fluent-html` carries the prototype `dist/src/testing` and `src/testing`, and its `exports` include `./testing`.
- **Component under test.** I added a new component, `src/app/notifications/views/notifications.view.ts`: channel checkboxes via `Form<T>`, an unavailable row, a Save button with `.disabled({...})` classes and `.toggle("disabled")`, and a `digestEmail` error inside `#digest-field`.

**Conditions:**
- **A (types only).** The library ships `fluent-html/testing`. The template's own view tests stay string-based. The README is unchanged.
- **B (RFC lockstep).** Like A, plus the template exemplars the RFC names, converted: `page-shell.ts`, `home.view.test.ts`, the FormGroup suite and the fonts preload test. The `node_modules/fluent-html/README.md` also gets a 19-line "Testing views" section.
- **G (guided).** Like A, plus `.ai/` and `CLAUDE.md` from the recon guided run, with the RFC's patch applied: `quality-assurance/CLAUDE.md:58` rewritten, and `view-testing.md:7-56` and `:238-288` replaced by `guideline-A.md`/`guideline-B.md`. The other 47 string lines in that file remain.

**Tasks:**
- **Explicit task:** four structural requirements are spelled out, with no mention of inspect or strings.
- **Neutral task:** "Write view tests for `NotificationSettingsForm` ... following the conventions of the existing view tests".

**Scoring.** For each run: `tsc --noEmit`, then vitest on the original view (M0) and 7 mutants:

| Mutant | Edit |
|---|---|
| M1 | Save button loses its `disabled` attribute and keeps its `disabled:` classes |
| M2 | Error moved outside `#digest-field` |
| M3 | Checkbox id moved to the row div (the label now points at a div) |
| M4 | `checked` follows availability |
| M5 | Row gets `aria-disabled` and the checkbox stays enabled |
| M6, M7 | Controls |

| Run | Condition / task | Used inspect | tsc | M0 | Mutants killed | Cost |
|---|---|---|---|---|---|---|
| A1, A2 | types only / explicit | 2/2 (found via `package.json` exports) | 0, 0 | green | 7/7, 7/7 | $1.11, $1.05 |
| B1, B2 | lockstep / explicit | 2/2 | 0, 0 | green | 7/7, 7/7 | $1.01, $1.24 |
| NA1, NA2 | types only / neutral | **0/2** (regex helpers: 5 and 4 literals) | 0, 0 | green | **5/7, 5/7** (M2, M3 survive) | $1.17, $1.11 |
| NB1, NB2 | lockstep / neutral | 2/2 | 0, 0 | green | 7/7, 7/7 | $1.32, $1.34 |
| NG1, NG2 | guidelines / neutral | **1/2** (NG2 never opened `.ai/`) | 0, 0 | green | 7/7, **6/7** (M3 survives) | $1.72, $1.71 |

Totals:
- Inspect suites killed 49/49 mutants; string suites killed 16/21.
- On the five structural mutants M1 to M5, inspect killed 35/35 and strings 10/15.
- 0 wrong guesses reached an error in any of the 10 runs. Every inspect run read the d.ts first.
- 7/7 inspect runs then also opened `testing/index.js` (9,502 B) or `src/testing/index.ts` to learn the throw and `text()` semantics. The d.ts documents only the types: 4 doc comments, none on `find`/`byId`/`text`.

### 2. First wrong guess: does the error name the fix?

There were no natural wrong guesses, so I probed 12 plausible ones. File: `zz-wrong.test.ts` in `$V/base`, compiled with tsc and run under vitest.

| Guess | tsc | vitest |
|---|---|---|
| `byId("digest-field")` | TS2345 `Id<string>` | `byId takes an Id: pass ids.<name> from defineIds, or createId("digest-field")` |
| `find("#digest-field")` | TS2345 `TagName` | `find/findAll take a tag name, not a selector: for #digest-field use byId(...)` |
| `find("input[name=digestEmail]")` | TS2345 `TagName` | names `find("input", { name: "email" })` |
| `closest`, `parent`, `querySelector`, `getByText` | TS2339, no fix named | anonymous `TypeError` |
| `btn.attrs["disabled"]` | TS7052 "Did you mean to call 'btn.attrs.get'?" | **silent pass** (`undefined`) |
| `findAll("button", { disabled: "" })` | compiles | **silent pass** on `<button disabled>` |
| `find("Button")` | TS2345 | `found 0; <Button> present: none` (does not mention lowercase) |

Summary of the 12 guesses:
- tsc flags 10 of them.
- tsc's message names the fix for 1 (TypeScript's own suggestion).
- The runtime message names the fix for 3.
- 2 pass silently at runtime, and 1 of those also compiles.

### 3. Contract versus implementation

The d.ts says `AttrMatch`: "`true` presence" (`dist/src/testing/index.d.ts:7`). `matches()` instead compares `e.attrs.get(k) !== want`, so `true` matches only a bare attribute.

Executed: `inspect(Button("Go").addAttribute("disabled", "")).findAll("button", { disabled: true }).length === 0`, and `attr("disabled") === ""`. The browser disables that button. The RFC's own popri rewrite `expect(doc.findAll("button", { disabled: true })).toEqual([])` would pass silently on that markup.

Reach:
- 0 sites in each of the 16 canonical-era repos (installed fluent-html >= 7).
- 165 `addAttribute("<boolean>", value)` sites across the 58-repo tree, for example `pregled-nepremicnin-dashboard/src/views/auth/auth.view.ts:49`.

`text()` is fine. `render()` emits a `\n` between children, so `P("Already have an account?", A("Sign in"))` is `<p>Already have an account?\n<a>Sign in</a></p>`, and `text()` = "Already have an account? Sign in" matches what the browser shows.

### 4. Five real fleet sites, rewritten and compiled

The rewrites are appended to copies of the originals (`$V/fleet/*/tests/view/*.inspect.test.ts`):
- S1 everyframe-composer `pipeline.view.test.ts:147-149`
- S2 the same file, `:388-389`
- S3 gzs/stem-50 `thesis.view.test.ts:117-130`
- S4 the same file, `:866-878`
- S5 wsfas `review.view.test.ts:179-182`

Results:
- `tsc --noEmit`: 0 errors in all 3 repos.
- 9/9 rewritten tests pass, and the 9 originals pass, so the verdicts match.
- 3 of the 5 sites needed an adapter:
  - S2: a `children` kind guard to read the last span.
  - S3: an `(f): f is string` guard, because `attr()` is `string | true | undefined`.
  - S4: `findAll("button").filter((b) => b.text() === "Oddaj prijavo")`, since there is no text matcher.
- A stricter S3 check (every label points at a form control) fails on live code with `defenseDate: expected [...] to include 'div'`. That reproduces the RFC's audit finding at `thesis.sections.view.ts:164`.

### 5. Teaching tokens

| Item | Change |
|---|---|
| Always-loaded | About 0: `quality-assurance/CLAUDE.md:58` is swapped one line for one |
| `view-testing.md` sections the RFC replaces | 3,011 B to 1,773 B, so -1,238 B (about -310 tokens at 4 B/token) |
| README "Testing views" | +839 B (about +210 tokens) |
| Converted template exemplars | +168 B net over 4 files |
| d.ts self-teaching | `index.d.ts` 2,449 B plus `element-names.d.ts` 1,337 B, read on demand in 7/7 inspect runs |

Net prose change is negative, and the always-loaded context does not move.

## Attack

**1. Discovery depends on exemplars, and the fleet's exemplars are string-based.**

In a realistic "write view tests" session:
- With types alone, 0/2 agents found `fluent-html/testing`. Both copied the repo's string style and re-invented the hand-rolled tag-extraction helper the RFC counts as demand.
- Their suites missed M2 (error outside its field) and M3 (label pointing at a div).
- The RFC guideline patch reached 1/2, because NG2 never opened `.ai/`.
- Only template exemplars plus the README reached 2/2.

After ship, every one of the 16 canonical repos still holds its own string suites (8,065 assertions per F-E-801), and those are the exemplars an agent reads first. The RFC leaves the lint to curation and adoption to each test file. So the +1 verification-loop prediction holds for repos seeded from the template, not for the fleet that produced the demand numbers.

**2. A contract bug that reopens the class the RFC closes.** AttrMatch's `true` is documented as presence but means bare. A DOM-trained `""` compiles and silently matches nothing.

**3. A new re-invented helper.** 5/7 inspect runs hand-wrote a lookup for the enclosing row (`channelRow`, `rowOf`, `neighbours`, searching `findAll("*")` or `children`), and 4/7 hand-wrote a sibling check. That is the next "same name re-invented across repos" pattern (§5.7), and it will press for `closest`/`parent`. Today it is harmless: all of those suites killed 7/7.

**4. The d.ts does not teach the semantics.** 7/7 inspect runs read the 9.5 KB implementation to learn the exactly-one throw.

## Does it survive?

**Survives with changes.** Through this lens the API works:
- Whenever an agent sees the API, it adopts it: 7/7 runs, single pass, 0 tsc errors, 0 false failures.
- Inspect suites catch every structural mutant: 35/35, against 10/15 for the string suites written in the same sessions.
- The selector and string-id guesses get type errors and runtime messages that name the fix.
- No guardrail is violated, and the prose change is net negative.

Required changes:
1. **Fix AttrMatch.** `true` matches any present value, and `""` matches a bare attribute. Add tests pinning both.
2. **Ship the lint with the RFC.** Move the `prefer-inspect` lint into lockstep (warn level, `tests/**`), or restate verification-loop +1 as applying only to template-seeded repos, with the adoption numbers above.
3. **Document the semantics in the d.ts.** One line each on `find`/`findAll`/`byId`/`text`/`html`: the exactly-one throw, zero or more, whitespace collapse, and `html() === render()`.
4. **Record the row lookup.** Put the 5/7 enclosing-row lookups and 4/7 sibling checks in the open questions, and show row scoping by id (`ForEachKeyed` ids plus `byId`) in the README and guideline example. Add no new API.

## Guardrail check (if this lens owns one)

- **§5.8 Naming.** `attr`, `tag`, `find`/`findAll` and `text()` matched what the agents reached for: 7/7 used them without a miss.
- **§5.7 Converge.** Held for the API itself. The enclosing-row lookup is a new place where agents re-invent the same helper; record it, but no new API is needed.
- **§5.12 Enforcement over prose.** Partial. The types and runtime messages carry the selector and Id cases. Adoption in existing repos needs either the lint or exemplars, since prose alone reached 1/2.
