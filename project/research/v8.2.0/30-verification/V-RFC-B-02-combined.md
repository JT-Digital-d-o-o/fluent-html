---
rfc: RFC-B-02
lens: combined
verdict: survives-with-changes
confidence: 0.72
killer_objection: "The RFC brings back the defect it removes. It newly advertises `resize from:window changed` and `scroll from:window changed`, plus their `changed delay:` patterns, and these fire 0 requests on beta6 and 4.0.0, against 3 for the plain form. It also admits 24 `none|delete` × `scrollTarget`/`showTarget` members that leave winY at 1200 on both bundles. Its guardrail-10 claim says every added member has an effect row, but that claim rests on a coverage gate that only matches arm text, and the gate passed 2/2 with all of these dead members in place."
guardrail_killer: null
required_changes:
  - "WindowTrigger must not inherit `changed`. Replace `type WindowTrigger = 'resize from:window' | 'scroll from:window'` and `BasicTrigger = DOMEvent | HtmxEvent | WindowTrigger` with ``type WindowTrigger = `${'resize' | 'scroll'} from:window${'' | ' once' | ` delay:${DelayValue}` | ` throttle:${DelayValue}`}` ``, keep `BasicTrigger = DOMEvent | HtmxEvent`, and add `WindowTrigger` directly to `HxTrigger`. Measured: 108 trigger completions, 0 `from:window changed`; HxTrigger 267 members, the same as 8.1.0."
  - "Restrict the new arms to the styles that reach the read. Add `type SwapReadStyle = Exclude<HxSwapStyle, 'none' | 'delete'>` and use it as the style slot of SwapScrollTarget and SwapShowTarget. Move strip/swapEmpty out of the all-styles arm: ``SwapWithModifier = `${HxSwapStyle} ${Exclude<SwapModifier, SwapStrip | SwapEmpty>}` | `${SwapReadStyle} ${SwapStrip | SwapEmpty}` ``. Measured: HxSwap 1,322 members (vs 1,354); 500 Partial(…, swap) sites 11.2-11.4 s (vs 13.0-13.3 s)."
  - "Oracle and pins: add control rows `control/resize from:window changed` and `control/scroll from:window changed` (0 requests), `control/none show:top showTarget:body` and `control/delete scroll:top scrollTarget:html` (winY unchanged), each on both bundles. Rename the `covers` tokens in rows-c09.mjs to the new arm texts; the gate is 0/2 on the changed d.ts until then. Add `@ts-expect-error` pins for the two none/delete spellings in test/types/type-surface.test-d.ts."
  - "Correct the guardrail-10 line: the coverage gate is per arm text, not per member, and it passed with 24 inert members and 2 dead trigger completions."
  - "Correct the silent-failure claim (0 silent failures from following the suggestion). In 2/28 adversarial pure-prior statements, `outerHTML transition:false scroll:top scrollTarget:html` (works: vt 0, winY 0) now gets TS2820 → `outerHTML scroll:top scrollTarget:html`, and following that runs a view transition (vt 1, both bundles). On 8.1.0 the same input was a bare TS2322. Record it as a residual and an open question, with the measured price of the fix: leading/trailing transition arms bring working statements from 14/28 to 16/28, but raise 500 Partial sites from about 14 s to about 19.5 s and HxSwap from 1,354 to 1,738 members."
  - "Correct the guideline_delta evidence. 8 lines mention swap modifiers (`show:top`/`scroll:top`): fluent-html/CLAUDE.md 3, guidelines/web-development/CLAUDE.md 3, htmx.md 2. None teaches a member this RFC changes, so net 0 stands, but the claim that 0 lines teach swap modifiers is false."
executed:
  - cmd: "rsync lib@656e812 → scratch; patch htmx.ts.diff; tsc + behaviors tsc; cmp 68 dist .js; cmp htmx.d.ts vs RFC proto"
    output: "exit 0; 68/68 .js identical; d.ts 12,979 → 13,682 B; my d.ts byte-identical to the RFC's"
  - cmd: "tsc 6.0.3 + 5.9.3, 29-line attack probe, 8.1.0 vs proto"
    output: "16 → 5 errors (same on both TS). proto: L11 showTarget:body + transition:false → TS2820 'outerHTML show:top transition:false'; L15 outerMorph focusScroll → focus-scroll (inert); L16-17 none/delete + Target compile"
  - cmd: "claude -p opus-5-5, 4 runs × 7 tasks; tsc vs 8.1.0 / proto / proto3 / proto2b"
    output: "8.1.0: 8/28 work, 12 errors (2 TS2820 → inert). proto: 14/28 work, 6 errors (2 → inert, 2 → lossy, 2 TS2322). proto3: 14/28, 6. proto2b: 16/28, 4"
  - cmd: "playwright attack rows (beta6 + 4.0.0)"
    output: "resize/scroll from:window 3 req; '… changed' 0; '… changed delay:100ms' 0; once 1; consume 3. none/delete × scrollTarget/showTarget winY 1200; innerHTML/textContent winY 0. Lossy suggestion: vt 1 vs model's vt 0"
  - cmd: "RFC oracle replay + coverage gate"
    output: "420 passed (34.4 s); gate 2/2 on proto despite dead members"
  - cmd: "check time, 500 Partial(…, swap) sites ×2"
    output: "8.1.0 6.85-7.13 s; proto 12.96-15.26 s; proto3 11.19-11.39 s; proto2b 19.09-20.02 s"
  - cmd: "fleet tsc live vs proto (4 targets); 36 lib unit files"
    output: "error sets identical 4/4; 2159/2159 pass"
  - cmd: "instruction-set + lockstep grep"
    output: "template 0 new-member sites, OuterSwap at swap-verbs.ts:183; packages/ui 0; eslint plugin 0; extractor 0; guidelines 8 show:top/scroll:top lines"
---

# Verdict: RFC-B-02, combined lens

> You are an ADVERSARY. Kill this RFC through the combined lens. Default to `reject` under
> uncertainty. Reading code is not verification: execute.

Scratch: `$V` = `<scratch>/wave3/RFC-B-02-combined`.

## What I executed

**1. Enforcement layer: the type probe, compiled both ways.**
- I rebuilt the prototype from the live lib at `656e812` plus `$W/htmx.ts.diff` (`$V/proto`). tsc exits 0.
- All 68 of 68 `dist/src/**/*.js` files are byte-identical to the real dist (`cmp`), so the change is type-only.
- My `htmx.d.ts` (13,682 B) is byte-identical to the RFC's.
- The 36 unit files pass 2159/2159, and `test/types/color-optout` compiles.

I wrote a 29-line attack probe (`$V/probe/probe.template.ts`) and compiled it on TS 6.0.3 and 5.9.3, which gave identical output. It goes from 16 errors on 8.1.0 to 5 on the prototype:

| Line | Spelling | 8.1.0 | Prototype |
|---|---|---|---|
| 6, 8, 25 | `outerMorph show:top showTarget:body` in `hx()`, a status bag and `Partial` | TS2322 / TS2769 | compile |
| 10 | `outerHTML show:top showTarget:#app transition:false` | TS2322 | compiles (open selector) |
| 11 | `outerHTML show:top showTarget:body transition:false` | TS2322 | TS2820 → `outerHTML show:top transition:false` (shows the target, not the page) |
| 13 | `outerHTML focusScroll:true transition:false` | TS2820 → `scroll:top transition:true` | TS2820 → `scroll:top transition:false` |
| 15 | `outerMorph focusScroll:true` | TS2820 → `focus-scroll:true` (inert) | same |
| 16-17 | `none show:top showTarget:body`, `delete scroll:top scrollTarget:html` | TS2322 | **compile** (inert, row 3) |
| 21 | `outerHTML show:top showTarget:#app scroll:window:top bogus:1` | TS2322 | compiles (documented opening) |
| 24 | unannotated `const` with an interpolated selector | TS2322 `string` | same |

Reordered guesses (`$V/probe2`):
- 8.1.0 already has the lossy class: `outerHTML transition:true scroll:top` gets TS2820 → `outerHTML transition:true`, which drops the scroll.
- The prototype adds 2 more instances: `outerHTML transition:false scroll:top scrollTarget:html` → `outerHTML scroll:top scrollTarget:html`, and `outerHTML transition:false show:top showTarget:body` → `outerHTML show:top showTarget:body`. On 8.1.0 both were bare TS2322.

**2. Pure-prior agent-fitness guess.**
- Setup: `claude -p` (2.1.285, `--model claude-opus-5-5`, reads of `~/**` denied), 4 runs × 7 tasks.
- The tasks are chosen to attack the residuals the RFC names: a morph that keeps focus, page top after a morph, outerHTML with no transition plus page top, a debounced window resize, strip, page scroll, and a WebSocket message.
- The prompt is `$V/prior/prompt.txt`, and each run's statements are compiled against each lib.

| Task | Written (runs 1-4) | 8.1.0 | RFC proto | proto3 (required 1-2) |
|---|---|---|---|---|
| 1 morph keeps focus | `outerMorph focusScroll:true` ×2, `outerMorph focus-scroll:true` ×2 | 2 TS2820 → inert, 2 inert | same | same |
| 2 page top after outerMorph | `outerMorph scroll:top scrollTarget:html` ×2, `outerMorph show:window:top` ×2 | 2 TS2322, 2 inert | 2 work, 2 inert (C-30) | same |
| 3 no transition + page top | `outerHTML transition:false scroll:top scrollTarget:html` ×2, `outerHTML transition:false show:window:top` ×2 | 4 TS2322 | **2 TS2820 → lossy** (vt 1), 2 TS2322 | same |
| 4 resize, 250 ms | `resize from:window delay:250ms` ×4 | 4 work | 4 work | 4 work |
| 5 unwrap | `innerHTML strip:true` ×4 | 4 TS2322 | 4 work | 4 work |
| 6 page scroll, 300 ms | `scroll from:window throttle:300ms` ×4 | 4 work | 4 work | 4 work |
| 7 WebSocket | `htmx:after:ws:message from:#ws` ×4 | open tail | open tail | open tail |
| **Total** | 28 | **8 work, 12 errors** | **14 work, 6 errors** | **14 work, 6 errors** |

- The RFC is a net gain: it adds 6 working statements and removes 6 errors.
- TS2820s that point at a non-working member go from 2 to 4 on this set. The 2 new ones are lossy, not inert.
- Measured (`$V/oracle/test/grammar/attack3.spec.mjs`, `transitions:true`): the model's string gives vt 0 and winY 0. The suggested member gives vt 1 and winY 0, on beta6 and 4.0.0.
- Adding leading/trailing `transition` arms (`$V/proto2`) brings the run to 16/28 working with 4 errors. The cost is HxSwap at 1,738 members and 500 Partial sites at 19.1-20.0 s, so I list it as an open question, not a requirement.

**3. Runtime rows** (my specs under `$V/oracle/test/grammar/attack*.spec.mjs`, beta6 and 4.0.0, identical results on both):

| Emitted | Result |
|---|---|
| `resize from:window` / `consume` / `once` | 3 / 3 / 1 requests |
| **`resize from:window changed`**, **`… changed delay:100ms`** | **0 / 0** |
| `scroll from:window` / `once` | 3 / 1 |
| **`scroll from:window changed`**, **`… changed delay:100ms`** | **0 / 0** |
| `outerMorph show:top showTarget:body` | winY 0 (8 with the UA body margin) |
| `outerMorph scroll:top scrollTarget:html` | winY 0 |
| `outerMorph show:window:top` | winY 1200 (inert, C-30) |
| **`none show:top showTarget:body`**, **`none scroll:top scrollTarget:html`**, **`delete show:top showTarget:body`**, **`delete scroll:top scrollTarget:html`**, **`delete scroll:bottom scrollTarget:#log`** | **winY 1200, log 0** |
| `innerHTML show:top showTarget:body`, `textContent scroll:top scrollTarget:html` | winY 0 |

Why these are dead, by code path:
- `changed` compares `fromElt.value`, and `window.value` is `undefined === undefined`. See `htmx.js:819-828` (beta6) and `:789` (4.0.0).
- `none` returns at `:1350`/`:1349`, and `delete` returns at `:1366`, both before `#handleScroll` (`:1487`/`:1488`).

Other runtime checks:
- The RFC's oracle replays at 420 passed (34.4 s).
- Its coverage gate passes 2/2 on the prototype even though it carries the dead members above. On proto3 it fails 0/2 until the `covers` tokens are renamed.

**4. Instruction-set grep** (my grep):
- **projects-template:** 0 sites of any new member. 1 derivation, `swap-verbs.ts:183` (`OuterSwap = Extract<HxSwap, …>`). 3 inert `show:window:top` sites (`post-card.ts:106`, `:135`, `contact.ts:223`), which belong to C-30.
- **packages/ui/src:** 0 htmx files.
- **eslint plugin and extractor:** 0 hits for these grammar tokens, so lockstep `[]` holds.
- **Guidelines:** 8 lines mention `show:top`/`scroll:top`. The RFC's claim of "0 lines teach swap modifiers" is false, but no line teaches a member this RFC changes.
- An app cannot widen `HxSwap` itself (TS2300, per the RFC), so the change belongs in the lib.

**5. Lane and breaking check.**
- tsc 6.0.3 fleet run, live lib vs my prototype (`$V/fleet/run.sh`): template full-stack 154/154, template web 16/16, gzs/stem-50 0/0, website-sales-funnel 0/0. Error sets are identical in all 4.
- The template full-stack check time moved 3.28 → 4.60 s once. In 3 alternating reruns it was 3.33/3.29, 3.40/3.52 and 3.05/3.05, which is noise.
- 500 `Partial(…, swap)` sites: 6.85-7.13 s on 8.1.0 and 12.96-15.26 s on the prototype. This reproduces the RFC's doubling.
- The removed literals sit beside open tails (`HxTarget` is a 1-member `string`). `ExtendedCSSSelector`/`DOMEvent` have 0 uses outside `src/htmx.ts` (grep). HxSwap gains 409 members and loses 0.
- The change is additive, so 8.2.0 holds.

## Attack

1. **It re-advertises dead triggers, the defect F-A-109 exists to remove.**
   - Folding `WindowTrigger` into `BasicTrigger` gives it every `ModifiedTrigger` and `ChangedDelayTrigger` composite.
   - On the prototype, completion lists 112 entries, including `resize from:window changed` and `scroll from:window changed`. Both fire 0 requests on both bundles, against 3 for the plain form.
   - The RFC removes 6 dead completions and adds 2 new ones. Its own completion paragraph lists "their `once|changed|consume` forms" as an improvement.

2. **24 admitted members are inert, and the guardrail-10 evidence cannot see them.**
   - SwapScrollTarget and SwapShowTarget take all 15 styles. For `none` and `delete`, htmx returns before `#handleScroll`: 12 + 12 members, 5 of them executed inert on both bundles.
   - `strip`/`swapEmpty` on none/delete add 8 more by the same code path.
   - The RFC rejected `focusScroll` on all 15 styles for exactly this reason ("13 styles never read it"), then did not apply that rule to its own target arms.
   - The coverage gate passes because it matches arm text, not members.

3. **"0 silent failures from following the suggestion" does not hold.** On a closed, order-fixed union, a three-modifier guess with `transition:false` first gets TS2820 pointing at the two-modifier member, which drops `transition:false`. Following it ships a view transition the task forbade. That happened in 2/28 pure-prior statements, and the same input was a bare TS2322 on 8.1.0.

4. **Check cost doubles for `Partial(…, swap)` and status-bag swaps.** This is not a §5 violation, because guardrail 2 covers the render hot path, and the emitted JS is identical. The exposure is ≤45 ms per canonical repo (RFC census, 7 Partial-with-swap sites in the fleet). Required change 2 recovers about 1.9 s of the 6.4 s added per 500 sites.

5. **Converge (guardrail 7).** In 8.2.0, "scroll the page to the top" has 2 working typed spellings (`showTarget:body`, `scrollTarget:html`) and 1 inert one (`show:window:top`, deferred to C-30 by binding curation). In my runs the model wrote `scrollTarget:html` 2 times, `show:window:top` 4 times and `showTarget:body` 0 times. Each spelling is the page value of a different htmx key, and curation scoped the inert removal out. I do not count this as a kill.

## Does it survive?

**survives-with-changes.** The core of the RFC is real and reproducible:
- The change is type-only: 68/68 `.js` files are identical.
- It is additive: 4/4 fleet error sets are identical.
- 2159/2159 unit tests pass.
- Working htmx 4 spellings now compile: pure-prior working statements go from 8/28 to 14/28 in my adversarial set (the RFC measured 5/24 to 14/24).
- The headline TS2820 reroutes now point at working members.

None of the objections hits a §5 guardrail directly. Each one is fixed by a measured, smaller change:
- The required WindowTrigger and `SwapReadStyle` edits (proto3) remove the 2 dead completions and the 32 none/delete members.
- They keep HxTrigger at 8.1.0's 267 members, cut HxSwap to 1,322, and make the `Partial` check faster than the RFC as written: 11.2-11.4 s vs 13.0-13.3 s per 500 sites.
- Prior results are unchanged at 14/28.

Implementers must apply `required_changes` 1-3 before landing, and the RFC text must carry corrections 4-6.

Open (not required):
- (a) Leading/trailing `transition` arms for the page-target forms: 16/28 working, but about +40% `Partial` check time.
- (b) `outerMorph focusScroll:true` → `focus-scroll:true` stays inert until C-30 (2/28 statements here).
- (c) `scroll changed` and other `changed` composites on non-input elements predate this RFC and are probably dead by the same `.value` path. They are outside this RFC's scope.

Not run (no silent caps):
- the 13 other fleet targets (the RFC ran 17; I replicated 4);
- the alpha7 bundle;
- the effect of `htmx:after:ws:message` (open tail, unchanged by this RFC).

## Guardrail check (if this lens owns one)

- **1 Zero deps:** pass (0 JS bytes changed).
- **2 Render hot path:** pass. The render JS is identical, and the doubled check time is outside §5 and reported above.
- **4 Type-safety:** pass. The opening after `#`/`.` is documented, and no mechanism relies on generic inference.
- **5 Instruction set:** pass (0 template or ui solutions; augmentation is impossible).
- **7 Converge:** pass, with the curated C-30 overlap.
- **10 Runtime-grammar:** names pass. The RFC's per-member effect claim fails on 24 + 8 swap members and 2 trigger completions, and required changes 1-3 fix it.
- **11:** N/A (additive).
- **12 Enforcement over prose:** pass, net 0, after the evidence correction in change 6.
