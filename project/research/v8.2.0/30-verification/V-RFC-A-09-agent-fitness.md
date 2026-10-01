---
rfc: RFC-A-09
lens: agent-fitness
verdict: survives-with-changes
confidence: 0.75
killer_objection: "The RFC's two-line views.md text states the merge as unconditional, but guidelines:pull will place it in all 16 fleet repos. All 16 carry the synced views.md rule, 0 call setClassMerge, and 12 track fluent-html#main, where 8.2.0 ships with the merge off. I ran it with withheld agents: RFC text, no boot call, no in-source warning comment. 2 of 3 runs chained the override and cited the rule. Both rendered 1/5 Chromium checks, with tsc clean and no runtime signal. Today's prose rendered 5/5 in 2 of 2 runs."
guardrail_killer: null
required_changes:
  - "Replace the RFC's 2-line views.md text (and the lib's .ai copy) with the tested conditional text in $V/required-views-md.txt, lines 1-3 plus the first sentence of line 4 (quoted in full below). Measured with no opt-in (OFFC): 3/3 read views.md, grepped setClassMerge, wrote the styles out, and rendered 5/5. With opt-in (ONC): 2/2 grepped, chained, and rendered 5/5 with the merge on."
  - "Append one sentence: 'Families are per prefix (`p-2` does not replace `px-6`) and `hidden` is never merged.' Measured with the merge on: `.p('x','6').p('y','3').p('2')` renders `px-6 py-3 p-2` and the later write loses. `.inlineFlex().when(true, t => t.hidden())` keeps inline-flex as the winner. The census keep set has 12 cross-prefix pairs, across 5 repos, where the later write loses."
  - "Restate guideline_delta as -5 (9 lines out, 4 in) and the views.md token count as about -44 (166 out, 122 in). Restate prior-alignment: it holds only in apps that opted in (0/16 on 8.2.0 day one), and it excludes cross-prefix and hidden pairs. Answer Open question 5 'keep views.md:118'."
executed:
  - cmd: "tsc (NodeNext, strict) setClassMerge(<guess>) x10 against the prototype d.ts + the template's real theme.ts"
    output: "theme and tokens: 0 errors. true: TS2345 \"Argument of type 'true' is not assignable to parameter of type 'false | ThemeSpec'\". (): TS2554. {theme}: TS2353. Name guess `import { setClassMerger }`: TS2724 \"Did you mean 'setClassMerge'?\""
  - cmd: "run-claude.sh P0a/P0b (empty cwd) and Da/Db (prototype d.ts + README + theme.ts), task-optin.txt"
    output: "P0 2/2: tailwind-merge + a guessed `setClassMerger` hook via `as any`; tsc first error TS2307 'tailwind-merge' (loud, does not name the fix). D 2/2: `setClassMerge(theme)`, tsc 0, 29-32 s"
  - cmd: "run-claude.sh ON1-2 / OFF1-2 / BASE1-2 / OFFX1-3 / OFFC1-3 / ONC1-2 on the template scaffold, task-style.txt; node eval/eval-style.mjs (tsx render, Tailwind 4.3.3 compile, Chromium)"
    output: "ON 2/2 chain: 5/5 merge on. OFF 2/2 and BASE 2/2 write out: 5/5. OFFX 2/3 chain citing the rule: 1/5, 5/5, 1/5 (app's real state, merge off). OFFC 3/3 grep setClassMerge and write out: 5/5. ONC 2/2 grep and chain: 5/5 merge on."
  - cmd: "fleet loop (16 canonical repos): views.md rule, setClassMerge, fluent-html pin, guidelines:pull, in-source warnings"
    output: "16/16 'Compose to add' in .ai views.md; 16/16 guidelines:pull; 0/16 setClassMerge; 12/16 on #main; 14/16 carry an in-source compose warning"
  - cmd: "node probe/crossprefix.mjs ; probe/xprefix.mjs ; probe/hidden.mjs"
    output: "41 cross-prefix overlapping pairs; later loses in 12 (5 repos). p-2 after px-6 py-3: later loses. inline-flex + hidden: hidden lost. hidden + flex: flex lost."
  - cmd: "node probe/lane.mjs"
    output: "8.1.0 vs prototype with the merge off: byte-identical (433 B); after setClassMerge(false): identical"
  - cmd: "chars/4 token estimate of the prose added and deleted"
    output: "views.md -166 tok; layout.ts comments -127 tok; RFC text +51; required text +122; setClassMerge JSDoc +145 (d.ts, read on lookup)"
---

# Verdict: RFC-A-09, agent-fitness lens

> I tested this RFC as an adversary through the agent-fitness lens, defaulting to `reject` when evidence was uncertain. Every result below comes from a command I ran.

`$V` = `<scratch>/wave3/RFC-A-09-agent-fitness`. It contains:
- `lib`: the RFC's `$W/final` build.
- `pkg-proto`: the installed copy the agents saw.
- `nm-proto`: the template's `node_modules` with `fluent-html` swapped for that copy.
- `runs/`: 18 withheld `claude -p` runs (claude-opus-5-5, 29-92 s each, all exit code 0).
- `eval/eval-style.mjs`: renders each run's `AccountPage` with the merge off and on, compiles Tailwind 4.3.3 with the template theme, and reads computed style in Chromium. Results are in `eval/*.json`.
- `probe/`: oracle probes.
- `typeprobe/`: tsc probes.
- `required-views-md.txt`: the tested replacement text.

## What I executed

**1. Opt-in surface, type layer** (`typeprobe/`, tsc 5.9.3, NodeNext, strict, the template's real `theme.ts`):

| Guess | Result |
|---|---|
| `setClassMerge(theme)`, `setClassMerge(tokens)` | 0 errors |
| `setClassMerge(true)` | TS2345 `'true' is not assignable to parameter of type 'false \| ThemeSpec'` |
| `setClassMerge()` | TS2554 |
| `setClassMerge({ theme })` | TS2353 `'theme' does not exist in type 'ThemeSpec'` |
| `"on"`, `undefined`, `null`, `theme.colors` | TS2345 |
| `import { setClassMerger }` (the name the pure prior guessed, see 2) | TS2724 `has no exported member named 'setClassMerger'. Did you mean 'setClassMerge'?` |

The likely wrong guesses each fail at compile time, and the name guess points at the fix in one error. One gap the RFC does not mention: `setClassMerge({})` compiles. It is the same no-registry mode the RFC rejects `true` for (77/108 dead pairs merge without a registry). No run wrote it.

**2. Pure prior on the opt-in.** Task `task-optin.txt` (169 words): make a later style call win app-wide; write `boot.ts`.

| Run | Context | Wrote | tsc vs prototype |
|---|---|---|---|
| P0a, P0b | empty cwd | `extendTailwindMerge` from tailwind-merge, wired through a guessed `configure()` / `setClassMerger()` reached via `as any`, with a throw if absent | 2 errors; first TS2307 `Cannot find module 'tailwind-merge'` |
| Da, Db | `theme.ts` + prototype `node_modules/fluent-html` (d.ts + README) | `setClassMerge(theme)` | 0 / 0 |

- **The prior wants this feature:** 2/2 reached for a merger.
- **The prior cannot find this API.** The first error names tailwind-merge, not `setClassMerge`, and the casts hide the near-miss name from tsc. The failure is loud at boot, not silent.
- **With the d.ts available**, 2/2 found the API in 29-32 s, with 0 errors.

**3. Pure prior on the override idiom, in the template scaffold.**
- **Task:** `task-style.txt` (140 words). Style the account page with the shared UI. The Delete-account card keeps the same heading look but takes a danger heading, a danger border and a danger tint, plus a smaller danger button.
- **Eval:** Chromium checks 5 properties on `#section-danger`.

| Variant | views.md | `layout.ts` warn comments | Boot `setClassMerge` | Runs that chained overrides | Rendered in the app's real mode |
|---|---|---|---|---|---|
| BASE (8.1.0 today) | "Compose to add" | kept | no | 0/2 | 5/5, 5/5 |
| ON (RFC lockstep) | RFC 2 lines | deleted | yes | 2/2 | 5/5, 5/5 (merge on); 1/5 if off |
| OFF (fleet repo after `guidelines:pull`) | RFC 2 lines | kept | no | 0/2 (followed `layout.ts`, never opened views.md) | 5/5, 5/5 |
| **OFFX** (fleet repo, preset without a warning) | RFC 2 lines | deleted | no | **2/3** | **1/5**, 5/5, **1/5** |
| OFFC (required text) | conditional | deleted | no | 0/3 (3/3 grepped `setClassMerge` first) | 5/5 x3 |
| ONC (required text) | conditional | deleted | yes | 2/2 (2/2 grepped first) | 5/5 x2 (merge on) |

**OFFX1 output in detail:**
- **Classes:** card `bg-surface rounded-card shadow-sm border border-line bg-danger/10 border-danger p-6 mb-6`, heading `text-lg font-semibold text-text text-danger`, button `… px-6 py-3 cursor-pointer px-4 py-2 text-sm`.
- **Computed style:** heading `rgb(17, 24, 39)`, border `rgb(229, 231, 235)`, background `rgb(255, 255, 255)`, button padding-left 24px.
- **Its final message:** "The app is set up so a later style replaces an earlier one of the same kind, so these danger styles override the default card…"
- **OFFX3** cited "the override-by-chaining rule in `.ai/web-development/views.md`".
- **Neither run grepped `setClassMerge`.** OFFX2 grepped for override wording, but rg skips the hidden `.ai/` directory, so it missed the rule and wrote the styles out.

**4. Fleet exposure** (16 canonical repos):
- 16/16 carry the "Compose to add" rule in a synced `.ai/web-development/views.md`, and 16/16 have `guidelines:pull`.
- 0/16 call `setClassMerge`.
- 12/16 pin `fluent-html#main`.
- 14/16 carry an in-source compose warning. home-page (26 dead pairs, the second highest) and website-sales-funnel carry none.
- The census's dead pairs sit mostly on repo-specific presets (`monoLabel`, `quietControl`, `ghostButton`) that have no comment beside them. That is the OFFX shape.

**5. Limits of "the later call wins" with the merge on** (`probe/xprefix.mjs`, `probe/hidden.mjs`, `probe/crossprefix.mjs`, against the Tailwind 4.3.3 oracle):

| Chain | Merged class | Stylesheet winner | Later write |
|---|---|---|---|
| `.p("x","6").p("y","3").p("2")` | `px-6 py-3 p-2` | px-6 and py-3 (order: p-2 < px-6 < py-3) | lost |
| `.inlineFlex().when(true, t => t.hidden())` | `inline-flex hidden` | inline-flex | lost |
| `.hidden().when(true, t => t.flex())` | `hidden flex` | hidden | lost |

- **Census keep set:** 41 cross-prefix pairs overlap. In 12 of them, across 5 repos, the later write loses (11 padding, 1 border-style). Examples: competition `px-3`/`py-2` then `p-1`; website-sales-funnel `px-3`/`py-2` then `p-3`.
- **This is by design** (L-036 and the C-35 carve-out), but the RFC's 2-line text does not say so.

**6. Lane.** `probe/lane.mjs` checks two things:
- With the merge off, the prototype output is byte-identical to 8.1.0 (433/433 B, including `cssClass('a"b')`).
- After `setClassMerge(false)`, the output is identical again.

The release is additive.

**7. Teaching tokens** (chars/4 estimate):

| Prose | Tokens |
|---|---|
| views.md:126-134 deleted | -166 |
| `layout.ts` comments deleted (template only) | -127 |
| RFC's 2 lines added | +51 |
| Required text added (4 lines + family sentence) | +122 |
| `setClassMerge` JSDoc in the d.ts (read on lookup, not always loaded) | +145 |

- **As written,** views.md comes to about -115 tokens and -7 lines.
- **With the required changes,** it comes to about -44 tokens and -5 lines, still net down.

## Attack

**The guideline replacement teaches the opted-in world as if it were every world.**
- **8.2.0 ships with the merge off**, and the synced guidelines reach all 16 fleet repos, none of which has the boot line.
- **The RFC's text is a statement, not a check:** "Boot calls `setClassMerge(theme)` (the template does), so a later call … replaces the earlier one".
- **The agents believed it.** 2/3 OFFX runs chained the override and shipped a Delete-account card with the default heading colour, the default border and the white surface. tsc was clean, and the lib has no runtime signal for this.
- **The RFC deletes the one rule that kept these apps correct.** Today's prose held in 2/2 BASE runs and 2/2 OFF runs: every run that met the warning wrote the styles out and rendered 5/5.
- **So in 8.2.0 the change moves the silent failure; it does not remove it.** The failure leaves opted-in apps (0 today) and enters every app that pulls guidelines before adding the boot line.
- **The scorecard's prior-alignment claim** ("the trained reading … becomes true") is false in 16/16 repos on release day. It stays false in opted-in apps for cross-prefix and `hidden` pairs (section 5).

**What does not break:**
- **The opt-in has a sound shape for agents.** Given the d.ts, 2/2 found it. Every wrong guess fails at compile time, and the likely name typo gets TS2724 `Did you mean 'setClassMerge'?`.
- **There is no second override API.** In opted-in apps, chaining and composing your own element both stay valid, and the RFC names the rule it replaces.
- **The 8.2.0 fork between apps is detectable with one grep.** When the text told agents to check, 5/5 did, and all 5 rendered correctly (OFFC 3/3, ONC 2/2).

## Does it survive?

**survives-with-changes.** The mechanism is agent-aligned:
- the prior wants a merger (2/2);
- the doc-guided opt-in compiles first time (2/2);
- in an opted-in app, agents write the shorter override chain that reuses the preset, and it renders 5/5.

The defect is the teaching, and it is fixed by changing the text, which I measured.

1. **Make the guideline conditional on the boot call.** Use this text in `guidelines/web-development/views.md:126-134` and the lib's `.ai` copy (tested as OFFC/ONC, `$V/required-views-md.txt` lines 1-4):
   ```
   **Override by chaining only where boot calls `setClassMerge(theme)`** (grep `src/` for it; the template's
   `buildServer` does). Then a later call of the same family replaces the earlier one: `Card(…).apply(t => t.p("5"))`
   renders `p-5`, not `p-6 … p-5`. Without that call fluent appends and stylesheet order picks the winner, so
   compose the chrome onto your own element instead of chaining an override.
   ```
   - Without opt-in: 3/3 runs grepped `setClassMerge`, wrote the styles out, and rendered 5/5.
   - With opt-in: 2/2 runs grepped, chained, and rendered 5/5.
2. **Append the exceptions in one sentence:** "Families are per prefix (`p-2` does not replace `px-6`) and `hidden` is never merged." This is measured in section 5: 12 fleet pairs, plus prototype renders where the later write loses.
3. **Restate the numbers:**
   - `guideline_delta` is -5 (9 lines out, 4 in), not -7. The views.md token count is about -44, not -115.
   - prior-alignment holds only in apps that opted in, and excludes cross-prefix and `hidden` pairs.
   - Open question 5: keep `views.md:118`. "Leave spacing out of it" is still the correct advice for every app that has not opted in.

**Not required, worth noting:**
- **Old warnings left behind.** Once an app adds the boot line, its in-source "Compose, never override" and "Composition only ADDS" comments (14/16 repos) should go in the same commit. If they stay, agents follow them (OFF 2/2) and write out duplicated styles. That is correct, but it misses the reuse.
- **A boundary of the boot-call placement.** A separate process that renders without `buildServer`, such as a `*.cron.ts` job, renders without the merge. Fleet reach today is 0 such files, and the template's one cron does not render.

## Guardrail check (if this lens owns one)

| Guardrail | Result |
|---|---|
| 7 Converge | pass. No second override API, and the replaced rule is named. The 8.2.0 opted-in/not-opted-in fork is temporary until the 9.0.0 default, and one grep detects it (5/5). |
| 8 Naming | pass. `set*` replaces the previous configuration. |
| 12 Enforcement over prose | pass with change 1. The type layer covers the opt-in call. The guideline stays net negative (-5 lines). As written, the replacement prose is false in 16/16 repos on release day, which is the killer objection; change 1 fixes it. |
| Lane 8.2.0 | pass. With the merge off, output is byte-identical to 8.1.0. |

No guardrail killer.
