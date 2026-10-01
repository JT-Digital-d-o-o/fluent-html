---
rfc: RFC-A-01
lens: agent-fitness
verdict: survives-with-changes
confidence: 0.8
killer_objection: "As written, the trap change breaks a composition agents write first, and it breaks code that works today. Asked for a collapsible group in a trapped drawer, 2/2 withheld runs wrote <details><summary>. On the RFC asset, forward Tab sticks on the first link on 3/3 engines: 0/12 pass, visited 1 of 4. On shipped 8.1.0, Chromium and Firefox pass 8/8. The cause: shown() (getClientRects) counts a link inside a closed <details> as rendered while focus() cannot land there, and summary is not in the selector."
guardrail_killer: null
required_changes:
  - "trapTab: replace the single computed-index focus() with a bounded loop that steps until doc.activeElement is the item just focused; add `summary` to the focusables selector (diff below; measured 6045 B / 2745 B, matrix 215/216, unit 43/43)"
  - "Add acceptance row 34: trapFocus drawer with link, closed <details> (summary + inner link), link; Tab x3 visits link > summary > link inside the drawer, Shift+Tab reverses; red on the RFC-as-written asset (3/3 engines) and on shipped WebKit"
  - "Complete 'Behavior changes for code that works today': (a) closed-<details> group (regressed as written, fixed by change 1); (b) [contenteditable] without tabindex becomes unreachable in a trapped drawer (shipped 3/3 engines reach it, patched 0/3; tabIndex reads -1 on 3/3; 0 fleet sites), document it as a known gap; (c) radio groups get one stop per radio (r1 > r2 > r3 instead of native r2) on 3/3 engines"
  - "Restate the size table and error_text rows against the final build; keep the 8.1.1 release requirement (verified)"
executed:
  - cmd: "node probe/outside.mjs | probe/trap.mjs | probe/nav.mjs all (RFC probes, copied to $W)"
    output: "outside shipped 6/21, patched 21/21; trap escapes shipped 6/12, patched 0/12; nav shipped 48/72, patched 72/72"
  - cmd: "run-claude.sh (wave0-2 withholding: env -i, --restricted, deny rules) P0a/P0b in an empty cwd"
    output: "2/2: 0 .behavior() calls; popover=auto + modal <dialog> (command/commandfor, closedby=any); tsc 9 and 14 errors, first TS2551 'setAttribute' / TS2339 'attr', none behavior-related"
  - cmd: "run-claude.sh Ba/Bb/Bc (d.ts + README only), Ga/Gb (+ template CLAUDE.md + htmx.md)"
    output: "5/5: behavior('drawer', {trapFocus:true}) with the drawer outside #main-content and push-url links (N1 shape); 0/5 onClickOutside; 5/5 setPopover() dropdown; tsc 0 on 4/5 (Gb 13, theme tokens)"
  - cmd: "node eval/run-eval.mjs <run> all (agent header.ts rendered on the prototype lib, pinned Tailwind CSS, htmx b6+ga, 3 engines)"
    output: "shipped nav-close 0/30, trap 20/30 (webkit 10/10 escape), dropdown 30/30; patched 30/30 x3; fixed 15/15 x3"
  - cmd: "run-claude.sh Sa/Sb (task adds a collapsible Projects group) + NAVLINK=team node eval/run-eval2.mjs Sa|Sb all"
    output: "2/2 wrote Details/Summary in the trapped drawer; trap shipped 8/12 (chromium+firefox 8/8), PATCHED 0/12 (in:Home x6, visited 1 of 4), fixed 6/6; nav shipped 0/12, patched 12/12"
  - cmd: "node probe/trap-adv.mjs ; node probe/details-rects.mjs"
    output: "S1 patched l1 > l1 > l1 > l1 > l1 > l1 on 3/3; link in a closed details: getClientRects=1, focus lands false, checkVisibility false on 3/3"
  - cmd: "lib2: tsc -p src/behaviors/client/tsconfig.json; node scripts/build-behaviors.mjs; eslint runtime.ts; node --test dist/test/behavior.test.js; ACCEPT_ENGINES=all CI=1 playwright (port 4863)"
    output: "6045 B min / 2745 B gz; tsc 0; eslint 0; 43/43; 215 passed, 1 failed (firefox row 28, pre-existing)"
  - cmd: "node probe/trap-3.mjs ; node probe/trap-adv-3.mjs (fixed asset added)"
    output: "fixed: T1-T4 escapes 0/12; S1 l1 > sum > l2 on 3/3; S3 contenteditable still 0/3"
  - cmd: "node r2/grep.mjs Details|Summary ; drawer ; contenteditable (58-repo dedup fleet)"
    output: "Details/Summary 179 lines / 30 repos; drawer 2 sites / 2 repos; contenteditable 0"
  - cmd: "node probe/stamp.mjs lib ; lib811"
    output: "8.1.0: both assets pass; 8.1.1: both throw 'asset is 8.1.0:c1f56451, server expects 8.1.1:c1f56451. Rebuild the runtime asset (buildBehaviorRuntime) ...'"
  - cmd: "diff -rq src (repo vs prototype); teaching-line char count"
    output: "only runtime.ts differs; map.ts JSDoc identical; teaching tokens added 0, deleted 0 (about 430 unchanged tokens across htmx.md:555,557,563,570 and CLAUDE.md:326,330)"
---

# Verdict: RFC-A-01, agent-fitness lens

> I tested this RFC as an adversary through the agent-fitness lens, defaulting to `reject` when evidence was uncertain. Every result below comes from a command I ran.

`$W` = `<scratch>/wave3/RFC-A-01-agent-fitness`. It contains:
- `lib`: the RFC prototype (symlink).
- `lib2`: the prototype plus required change 1.
- `runs/`: what the agents wrote.
- `eval/`: the render and browser harness, with JSON results.
- `required-change.patch`: the diff for change 1.

## What I executed

**1. The RFC's own numbers reproduce.** These are the RFC's probes, re-run unchanged on Chromium 149, Firefox 151 and WebKit 26.5:

| Probe | Shipped | Patched |
|---|---|---|
| onClickOutside | 6/21 | 21/21 |
| Trap escapes | 6/12 | 0/12 |
| Close-on-nav | 48/72 | 72/72 |

**2. Pure-prior guess.** Every run used the wave0-2 withholding harness (`env -i`, `--restricted`, deny rules, separate `claude -p`, claude-opus-5-5, effort xhigh). Every run got one 183-word task: an account dropdown that closes on an outside click, and a mobile drawer with trapped focus whose links swap `#main-content` with the URL pushed and close the drawer.

| Run | Context | `.behavior()` calls | Dropdown | Drawer | tsc vs prototype |
|---|---|---|---|---|---|
| P0a, P0b | empty cwd | 0 / 0 | `popover="auto"` | modal `<dialog>` + `command`/`closedby` | 9 / 14 errors; first TS2551 `setAttribute`, TS2339 `attr` |
| Ba, Bb, Bc | lib d.ts + README | 1 each | `setPopover()` | `behavior("drawer", {trapFocus:true})` outside `#main-content`, push-url links | 0 / 0 / 0 |
| Ga, Gb | + template CLAUDE.md, htmx.md | 1 each | `setPopover()` | same | 0 / 13 (theme tokens) |
| Sa, Sb | d.ts; the task adds a collapsible "Projects" group | 1 each | `setPopover()` | same, plus `Details(Summary(...))` inside the drawer | 0 / 0 |

**3. Agent code in the browser.** `eval/run-eval.mjs` renders each run's `header.ts` against the prototype lib. It builds CSS from the pinned Tailwind design system and runs with htmx b6 (the lib pin) and GA (the template's version) on 3 engines. Pass counts per asset:

| Runs | Check | Shipped | RFC patched | Patched + change 1 |
|---|---|---|---|---|
| B + G (5 runs, 30 cells) | nav closes the drawer | **0/30** | 30/30 | 15/15 |
| | trap holds | 20/30 (WebKit 10/10 escape) | 30/30 | 15/15 |
| | dropdown | 30/30 (native popover) | 30/30 | 15/15 |
| S (2 runs, 12 cells) | nav closes the drawer | 0/12 | 12/12 | 6/6 |
| | trap reaches all 4 stops | 8/12 (Chromium + Firefox ok) | **0/12** | 6/6 |

On the RFC asset, the S-run trap reads `in:Home > in:Home > in:Home > in:Home > in:Home > in:Home`: forward Tab never leaves the first link.

**4. Root cause.** Measured with `probe/details-rects.mjs`, 3/3 engines:
- A link inside a closed `<details>` has `getClientRects().length === 1`.
- `focus()` does not land on it.
- `checkVisibility()` returns false.

So `shown()` keeps that link in the trap list. The RFC's trap then calls `focus()` on it, nothing happens, and the next Tab computes the same target again. `summary` is also missing from the selector, so the group header can never be reached. `probe/trap-adv.mjs` reproduces this on a minimal shape: S1 on the RFC asset reads `l1 > l1 > l1 > l1 > l1 > l1` on 3/3 engines, while shipped Chromium and Firefox read `l1 > sum > l2`.

**5. Required change 1, prototyped in `lib2`.**
- Size: 6045 B min / 2745 B gz, inside the 6144 / 2816 budget. tsc and eslint report 0.
- Probes: T1-T4 escape 0/12. S1 cycles through the summary on 3/3 engines.
- Agent runs: Sa and Sb trap 6/6.
- Full matrix: 215/216 on 3 engines. The one failure is Firefox row 28, which predates this RFC.
- `behavior.test.js`: 43/43.

**6. Supporting checks.**
- Fleet: `Details`/`Summary` appear on 179 lines in 30 repos; `drawer` at 2 sites; `contenteditable` at 0.
- Stamp: at 8.1.0, `assertBehaviorRuntimeAsset` accepts both the shipped and the patched asset. At 8.1.1, it throws the mismatch error for both.
- Teaching surface: `diff -rq src` differs only in `runtime.ts`, and the `map.ts` JSDoc is byte-identical.

## Attack

1. **The fix moves the failure instead of removing it, on the shape agents reach for next.**
   - When the task asks for a collapsible group, 2/2 runs pick `<details>`, which fits the "no client JS" rule. Fleet usage is 30 repos.
   - The RFC asset turns Chromium and Firefox from 8/8 working into 0/8, and leaves WebKit at 0/4.
   - Across all 7 agent runs that use behaviors, the trap scores 28/42 shipped and 30/42 on the RFC as written: a net +2.
   - This also breaks the lane rule. A trapped drawer with a `<details>` group works today on 2 of 3 engines, and an 8.1.x patch would break it.
   - The RFC's list of behavior changes says "Patched equals shipped ... T1/T2/T4 under Chromium and Firefox". That list never tested `<details>`, `contenteditable` or radio groups.
2. **onClickOutside (F-A-601) has 0/9 agent reach.** All 9 runs built the dropdown on native popover, the guideline's blessed path. That third of the RFC is supported only by the 2 fleet sites, not by agent guesses. It does not add a second way, though: the verb already exists, and the RFC makes its JSDoc-default shape work.
3. **Unchanged residuals:** X2 (`visibility:hidden` panels), `contenteditable` (its `tabIndex` reads -1 on 3/3 engines), and radio groups getting one stop per radio.

## Does it survive?

**survives-with-changes.** The lens strongly backs the drawer two-thirds of the RFC:
- 7/7 withheld runs that used behaviors wrote exactly the N1 composition.
- Shipped closes that drawer on nav in **0/42** cells and lets focus escape on WebKit in 14/14 cells. Both failures pass tsc.
- The RFC adds no API, no diagnostic and no teaching: 0 tokens added, 0 deleted, and about 430 tokens of guideline text left unchanged.
- The pure prior never reaches these verbs (0/2), so prior alignment does not change.

As written, though, the trap breaks working code. The repair is small and measured. Required change 1 (`$W/required-change.patch`; the measured build also added `[contenteditable]` to the selector, which is a no-op because its `tabIndex` is -1):

```ts
const focusables = (root: Element): HTMLElement[] =>
  [...root.querySelectorAll<HTMLElement>("a[href],button,input,select,textarea,summary,[tabindex]")].filter(
    (el) => !(el as HTMLInputElement).disabled && el.tabIndex > -1 && shown(el),
  );
// trapTab, after e.preventDefault():
for (let i = 0, k = at < 0 ? (e.shiftKey ? 0 : n - 1) : at; i < n; i++) {
  k = (k + (e.shiftKey ? n - 1 : 1)) % n;
  items[k]!.focus();
  if (doc.activeElement === items[k]) break;
}
```

Changes 2-4 are in the frontmatter: acceptance row 34, the completed list of behavior changes, and size and release numbers restated against the final build.

Optional, not required: the boot mismatch after the 8.1.1 bump names `buildBehaviorRuntime`, not the template script. A grep resolves it in one hop to `templates/full-stack/scripts/build-behaviors.ts`, and `README.md:149` names `npm run behaviors:build`. This happens on every version bump and is not something this RFC introduces.

## Guardrail check

- **7 Converge:** pass. No new surface; `diff -rq src` differs only in `runtime.ts`.
- **12 Enforcement over prose:** pass. Net 0 guideline lines.
- **Lane (§4):** fails as written because of the `<details>` regression, and passes with change 1.
- No §5 guardrail is violated.
