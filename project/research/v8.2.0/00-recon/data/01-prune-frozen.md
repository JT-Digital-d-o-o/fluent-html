# 01 — the 8.0.0 frozen set and the "108" prune list, re-censused on 8.1.0

## Where the lists come from

- **Frozen set (F, 116 names).** CHANGELOG.md:123-125 ("the remaining zero-use set is de-documented, not
  deleted … ~100 names … the frozen names appear only in the generated full-surface listing"). No source
  marker exists: `grep -rniE 'frozen|freeze' src/` hits only `Object.freeze` JSDoc (src/routes.ts:446,
  src/ids.ts:133). The only enumeration is the zero-count rows of `generated/full-surface.md` (8.0.0 census,
  46 repos / 8,817 files, commit 6de9c1f): **116 rows = 64 Tag methods + 52 element setters**.
- **Prune list (P, "108").** scorecard.md:163 (finding 6) and pm/agent-fitness/todo.md:70 ("0 call sites across
  8,246 files / 40 repos, skew guard applied: 361→253 callables"). The list itself is not enumerated in any
  file (searched projects-template/project/**, fluent-html/project/**, generated/). Reconstructed here as
  **F minus the 7 frozen names the 8.0.0 research exempted for version skew** (`table`, `invisible`, `ml`,
  `mr`, `my`, `pl`, `pr`; fluent-html-agent-fitness.md:129 "Exempt (version skew)") = **109 names**.
  The 1-name gap to 108 is a corpus difference: the scorecard's phase-1 run counted 115 zero-use names over
  40 repos / 8,246 files; the generated listing counts 116 over 46 repos / 8,817 files.
- Columns: "Fleet now"/"Canon-era now" = official census today (63 repos); "Dedup" = worktrees removed
  (58 repos); "Repos with sites now" = official per-repo counts (`name@pinned-version:count`).
  Every name in F had 0 fleet and 0 canonical-era call sites at 8.0.0 by construction.

## Summary

| Measure | Frozen F (116) | Prune P (109) |
|---|---|---|
| Still exported / on the 8.1.0 runtime surface | 116 | 109 |
| Still 0 fleet call sites (official) | 91 | 89 |
| Still 0 canonical-era call sites (official) | 94 | 92 |
| Still 0 fleet (dedup) | 91 | 89 |
| Gained >= 1 call site | 25 | 20 |
| Gained >= 6 real call sites (collisions removed) | 7 (`setDecoding` 25, `pl` 15, `pr` 12, `setScope` 10, `ml` 6, `wrap` 6, `xl2` 6) | 4 (`setDecoding`, `setScope`, `wrap`, `xl2`) |

`.first()` shows 19 official sites but 15 are Playwright/crawler `.first()` (projects-template worktree
`research/stress/browser-proof.ts`, website-sales-funnel `src/worker/crawl/renderer.ts:71`); real fluent
`.first({…})` sites = 4 (everyframe-composer 2, na-cent 2). `setDecoding` in pre-7 repos is new code
(gzs/inovacije commits 5b65736 2026-09-09 / 8e3b3ac 2026-09-10; varnoska 34004fe 2026-09-04).
Of the 7 skew-exempt frozen names, 5 gained sites once repos moved to 8.1.0 (`pl` 15, `pr` 12, `ml` 6,
`my` 5, `mr` 4); `table` and `invisible` are still 0 across 18 eligible repos.

## Per-name table

| Name | Kind | In 108-prune list (reconstructed) | Exists in 8.1.0 | Intro | Fleet now | Canon-era now | Dedup fleet | Dedup canon-era | Repos with sites now |
|---|---|---|---|---|---|---|---|---|---|
| `.addChild()` | Tag method | yes | yes | 6.1.1 | 3 | 3 | 3 | 3 | na-cent@8.1.0:2, sportoawards@8.1.0:1 |
| `.addHeaders()` | element setter | yes | yes | 6.2.0 | 0 | 0 | 0 | 0 | — |
| `.addStyle()` | Tag method | yes | yes | 6.2.0 | 1 | 1 | 1 | 1 | everyframe-composer@8.1.0:1 |
| `.after()` | Tag method | yes | yes | 5.8.0 (as .on/.at("after")) | 0 | 0 | 0 | 0 | — |
| `.autoCols()` | Tag method | yes | yes | 5.11.0 | 0 | 0 | 0 | 0 | — |
| `.autoRows()` | Tag method | yes | yes | 5.11.0 | 0 | 0 | 0 | 0 | — |
| `.bgBlend()` | Tag method | yes | yes | 6.2.0 | 0 | 0 | 0 | 0 | — |
| `.bgConic()` | Tag method | yes | yes | 6.0.0 | 0 | 0 | 0 | 0 | — |
| `.bgRadial()` | Tag method | yes | yes | 6.0.0 | 2 | 2 | 2 | 2 | competify@8.1.0:2 |
| `.brightness()` | Tag method | yes | yes | 5.11.0 | 0 | 0 | 0 | 0 | — |
| `.caret()` | Tag method | yes | yes | 6.2.0 | 0 | 0 | 0 | 0 | — |
| `.checked()` | Tag method | yes | yes | 5.8.0 (as .on/.at("checked")) | 0 | 0 | 0 | 0 | — |
| `.colEnd()` | Tag method | yes | yes | 6.2.0 | 0 | 0 | 0 | 0 | — |
| `.colStart()` | Tag method | yes | yes | 6.2.0 | 1 | 0 | 1 | 0 | storysell-system@6.5.0:1 |
| `.containerQuery()` | Tag method | yes | yes | 6.0.0 | 0 | 0 | 0 | 0 | — |
| `.contrast()` | Tag method | yes | yes | 5.11.0 | 0 | 0 | 0 | 0 | — |
| `.dark()` | Tag method | yes | yes | 5.8.0 (as .on/.at("dark")) | 0 | 0 | 0 | 0 | — |
| `.delay()` | Tag method | yes | yes | 6.2.0 | 1 | 1 | 1 | 1 | home-page@8.1.0:1 |
| `.divideX()` | Tag method | yes | yes | 5.8.0 | 2 | 2 | 2 | 2 | everyframe-composer@8.1.0:2 |
| `.even()` | Tag method | yes | yes | 5.8.0 (as .on/.at("even")) | 0 | 0 | 0 | 0 | — |
| `.first()` | Tag method | yes | yes | 5.8.0 (as .on/.at("first")) | 19 | 18 | 5 | 5 | everyframe-composer@8.1.0:2, na-cent@8.1.0:2, projects-template@8.1.0:7, projects-template/.claude/worktrees/agent-a0c1359f91e158924@8.1.0:6, projects-template/.claude/worktrees/agent-a4f731df7f653111d@5.11.0:1, website-sales-funnel-automation-system@8.1.0:1 |
| `.grayscale()` | Tag method | yes | yes | 5.11.0 | 0 | 0 | 0 | 0 | — |
| `.gridFlow()` | Tag method | yes | yes | 5.11.0 | 0 | 0 | 0 | 0 | — |
| `.hueRotate()` | Tag method | yes | yes | 5.11.0 | 0 | 0 | 0 | 0 | — |
| `.inlineGrid()` | Tag method | yes | yes | 6.0.0 | 0 | 0 | 0 | 0 | — |
| `.insetE()` | Tag method | yes | yes | 6.2.0 | 0 | 0 | 0 | 0 | — |
| `.insetRing()` | Tag method | yes | yes | 6.2.0 | 0 | 0 | 0 | 0 | — |
| `.insetS()` | Tag method | yes | yes | 6.2.0 | 0 | 0 | 0 | 0 | — |
| `.insetShadow()` | Tag method | yes | yes | 6.2.0 | 0 | 0 | 0 | 0 | — |
| `.invert()` | Tag method | yes | yes | 5.11.0 | 0 | 0 | 0 | 0 | — |
| `.invisible()` | Tag method | no (skew-exempt 8.0.0) | yes | 7.0.1 | 0 | 0 | 0 | 0 | — |
| `.isolate()` | Tag method | yes | yes | 6.2.0 | 3 | 3 | 3 | 3 | sportoawards@8.1.0:3 |
| `.mixBlend()` | Tag method | yes | yes | 6.2.0 | 1 | 1 | 1 | 1 | everyframe@8.1.0:1 |
| `.ml()` | Tag method | no (skew-exempt 8.0.0) | yes | 7.0.0 | 6 | 6 | 6 | 6 | na-cent@8.1.0:2, popri@8.1.0:3, projects-template@8.1.0:1 |
| `.mr()` | Tag method | no (skew-exempt 8.0.0) | yes | 7.0.0 | 4 | 4 | 4 | 4 | fluent-html-home-page@8.1.0:2, gzs/stem-50@8.1.0:1, na-cent@8.1.0:1 |
| `.my()` | Tag method | no (skew-exempt 8.0.0) | yes | 7.0.0 | 5 | 5 | 1 | 1 | na-cent@8.1.0:1, projects-template@8.1.0:2, projects-template/.claude/worktrees/agent-abb0578c6f24f0518@8.1.0:2 |
| `.odd()` | Tag method | yes | yes | 5.8.0 (as .on/.at("odd")) | 0 | 0 | 0 | 0 | — |
| `.overscroll()` | Tag method | yes | yes | 5.11.0 | 1 | 1 | 1 | 1 | stojnica@8.1.0:1 |
| `.perspective()` | Tag method | yes | yes | 6.2.0 | 0 | 0 | 0 | 0 | — |
| `.pl()` | Tag method | no (skew-exempt 8.0.0) | yes | 7.0.0 | 15 | 15 | 15 | 15 | everyframe@8.1.0:5, everyframe-composer@8.1.0:1, fl-um@8.1.0:1, fluent-html-home-page@8.1.0:1, gzs/stem-50@8.1.0:1, popri@8.1.0:4, studio@8.1.0:2 |
| `.pr()` | Tag method | no (skew-exempt 8.0.0) | yes | 7.0.0 | 12 | 12 | 12 | 12 | everyframe@8.1.0:5, gzs/stem-50@8.1.0:1, na-cent@8.1.0:6 |
| `.rowEnd()` | Tag method | yes | yes | 6.2.0 | 0 | 0 | 0 | 0 | — |
| `.rowStart()` | Tag method | yes | yes | 6.2.0 | 0 | 0 | 0 | 0 | — |
| `.saturate()` | Tag method | yes | yes | 5.11.0 | 0 | 0 | 0 | 0 | — |
| `.scroll()` | Tag method | yes | yes | 6.2.0 | 0 | 0 | 0 | 0 | — |
| `.scrollP()` | Tag method | yes | yes | 6.2.0 | 0 | 0 | 0 | 0 | — |
| `.sepia()` | Tag method | yes | yes | 5.11.0 | 0 | 0 | 0 | 0 | — |
| `.setAbbr()` | element setter | yes | yes | 6.2.0 | 0 | 0 | 0 | 0 | — |
| `.setAutocapitalize()` | Tag method | yes | yes | 6.1.1 | 0 | 0 | 0 | 0 | — |
| `.setCapture()` | element setter | yes | yes | 6.0.0 | 0 | 0 | 0 | 0 | — |
| `.setCite()` | element setter | yes | yes | 6.2.0 | 0 | 0 | 0 | 0 | — |
| `.setClipPathUnits()` | element setter | yes | yes | 6.0.0 | 0 | 0 | 0 | 0 | — |
| `.setCols()` | element setter | yes | yes | 5.7.0 | 0 | 0 | 0 | 0 | — |
| `.setContenteditable()` | Tag method | yes | yes | 6.1.1 | 0 | 0 | 0 | 0 | — |
| `.setCoords()` | element setter | yes | yes | 5.7.0 | 0 | 0 | 0 | 0 | — |
| `.setData()` | element setter | yes | yes | 5.7.0 | 0 | 0 | 0 | 0 | — |
| `.setDatetime()` | element setter | yes | yes | 5.7.0 | 0 | 0 | 0 | 0 | — |
| `.setDecoding()` | element setter | yes | yes | 5.7.0 | 25 | 15 | 25 | 15 | everyframe@8.1.0:10, gzs/inovacije@5.7.1:6, sportoawards@8.1.0:2, stojnica@8.1.0:3, varnoska@6.3.0:4 |
| `.setDir()` | Tag method | yes | yes | 5.8.0 | 0 | 0 | 0 | 0 | — |
| `.setDirname()` | element setter | yes | yes | 6.2.0 | 0 | 0 | 0 | 0 | — |
| `.setDy()` | element setter | yes | yes | 5.9.1 | 0 | 0 | 0 | 0 | — |
| `.setEdgeMode()` | element setter | yes | yes | 6.0.0 | 0 | 0 | 0 | 0 | — |
| `.setEnterkeyhint()` | Tag method | yes | yes | 6.1.1 | 0 | 0 | 0 | 0 | — |
| `.setFillRule()` | element setter | yes | yes | 5.9.1 | 0 | 0 | 0 | 0 | — |
| `.setFilter()` | element setter | yes | yes | 5.11.0 | 0 | 0 | 0 | 0 | — |
| `.setFilterUnits()` | element setter | yes | yes | 6.0.0 | 0 | 0 | 0 | 0 | — |
| `.setFontStyle()` | element setter | yes | yes | 5.11.0 | 0 | 0 | 0 | 0 | — |
| `.setForm()` | Tag method | yes | yes | 6.1.1 | 0 | 0 | 0 | 0 | — |
| `.setFormaction()` | element setter | yes | yes | 5.7.0 | 0 | 0 | 0 | 0 | — |
| `.setFormenctype()` | element setter | yes | yes | 6.2.0 | 0 | 0 | 0 | 0 | — |
| `.setFormtarget()` | element setter | yes | yes | 6.2.0 | 0 | 0 | 0 | 0 | — |
| `.setFx()` | element setter | yes | yes | 6.0.0 | 0 | 0 | 0 | 0 | — |
| `.setFy()` | element setter | yes | yes | 6.0.0 | 0 | 0 | 0 | 0 | — |
| `.setGradientTransform()` | element setter | yes | yes | 6.0.0 | 0 | 0 | 0 | 0 | — |
| `.setGradientUnits()` | element setter | yes | yes | 6.0.0 | 0 | 0 | 0 | 0 | — |
| `.setHeaders()` | element setter | yes | yes | 6.2.0 | 0 | 0 | 0 | 0 | — |
| `.setHidden()` | Tag method | yes | yes | 6.1.1 | 0 | 0 | 0 | 0 | — |
| `.setHigh()` | element setter | yes | yes | 5.7.0 | 0 | 0 | 0 | 0 | — |
| `.setHreflang()` | element setter | yes | yes | 6.0.0 | 3 | 3 | 3 | 3 | competify@8.1.0:3 |
| `.setHttpEquiv()` | element setter | yes | yes | 5.7.0 | 1 | 0 | 1 | 0 | planet-positive-sport@5.11.0:1 |
| `.setIn()` | element setter | yes | yes | 6.0.0 | 0 | 0 | 0 | 0 | — |
| `.setInputmode()` | element setter | yes | yes | 6.0.0 | 5 | 5 | 5 | 5 | na-cent@8.1.0:5 |
| `.setKind()` | element setter | yes | yes | 5.7.0 | 0 | 0 | 0 | 0 | — |
| `.setLabel()` | element setter | yes | yes | 5.7.0 | 0 | 0 | 0 | 0 | — |
| `.setLetterSpacing()` | element setter | yes | yes | 5.11.0 | 1 | 0 | 1 | 0 | storysell-system@6.5.0:1 |
| `.setList()` | element setter | yes | yes | 5.7.0 | 3 | 3 | 3 | 3 | everyframe-composer@8.1.0:1, na-cent@8.1.0:1, website-sales-funnel-automation-system@8.1.0:1 |
| `.setLow()` | element setter | yes | yes | 5.7.0 | 0 | 0 | 0 | 0 | — |
| `.setMaskContentUnits()` | element setter | yes | yes | 6.0.0 | 0 | 0 | 0 | 0 | — |
| `.setMaskUnits()` | element setter | yes | yes | 6.0.0 | 0 | 0 | 0 | 0 | — |
| `.setMedia()` | element setter | yes | yes | 5.7.0 | 0 | 0 | 0 | 0 | — |
| `.setMicrodata()` | Tag method | yes | yes | 6.1.1 | 0 | 0 | 0 | 0 | — |
| `.setNonce()` | Tag method | yes | yes | 5.9.0 | 0 | 0 | 0 | 0 | — |
| `.setOptimum()` | element setter | yes | yes | 5.7.0 | 0 | 0 | 0 | 0 | — |
| `.setPrimitiveUnits()` | element setter | yes | yes | 6.0.0 | 0 | 0 | 0 | 0 | — |
| `.setResult()` | element setter | yes | yes | 6.0.0 | 0 | 0 | 0 | 0 | — |
| `.setRowspan()` | element setter | yes | yes | 5.7.0 | 0 | 0 | 0 | 0 | — |
| `.setScope()` | element setter | yes | yes | 5.7.0 | 10 | 10 | 10 | 10 | fluent-html-home-page@8.1.0:2, sportoawards@8.1.0:8 |
| `.setShape()` | element setter | yes | yes | 5.7.0 | 0 | 0 | 0 | 0 | — |
| `.setSize()` | element setter | yes | yes | 5.7.0 | 0 | 0 | 0 | 0 | — |
| `.setSpan()` | element setter | yes | yes | 5.7.0 | 0 | 0 | 0 | 0 | — |
| `.setSpellcheck()` | Tag method | yes | yes | 6.1.1 | 0 | 0 | 0 | 0 | — |
| `.setSpreadMethod()` | element setter | yes | yes | 6.0.0 | 0 | 0 | 0 | 0 | — |
| `.setSrclang()` | element setter | yes | yes | 5.7.0 | 0 | 0 | 0 | 0 | — |
| `.setStdDeviation()` | element setter | yes | yes | 6.0.0 | 0 | 0 | 0 | 0 | — |
| `.setStopOpacity()` | element setter | yes | yes | 6.0.0 | 0 | 0 | 0 | 0 | — |
| `.setTextDecoration()` | element setter | yes | yes | 5.11.0 | 0 | 0 | 0 | 0 | — |
| `.setTranslate()` | Tag method | yes | yes | 6.1.1 | 0 | 0 | 0 | 0 | — |
| `.setWrap()` | element setter | yes | yes | 5.7.0 | 0 | 0 | 0 | 0 | — |
| `.spaceX()` | Tag method | yes | yes | 5.8.0 | 0 | 0 | 0 | 0 | — |
| `.static()` | Tag method | yes | yes | 6.0.0 | 0 | 0 | 0 | 0 | — |
| `.table()` | Tag method | no (skew-exempt 8.0.0) | yes | 7.0.1 | 0 | 0 | 0 | 0 | — |
| `.textShadow()` | Tag method | yes | yes | 6.2.0 | 0 | 0 | 0 | 0 | — |
| `.transform()` | Tag method | yes | yes | 6.2.0 | 0 | 0 | 0 | 0 | — |
| `.willChange()` | Tag method | yes | yes | 5.11.0 | 1 | 1 | 1 | 1 | everyframe@8.1.0:1 |
| `.wrap()` | Tag method | yes | yes | 6.8.0 | 6 | 6 | 6 | 6 | fluent-html-home-page@8.1.0:1, sportoawards@8.1.0:5 |
| `.xl2()` | Tag method | yes | yes | 5.8.0 (as .on/.at("2xl")) | 6 | 6 | 6 | 6 | everyframe@8.1.0:1, everyframe-composer@8.1.0:5 |
