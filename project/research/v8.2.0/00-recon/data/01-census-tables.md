# 01 — census tables (fluent-html 8.1.0 surface, run 2026-09-30)

Generated from `node scripts/census/method-census.mjs --json` (official, `01-census.json`) plus two scratch variants of the same script: **dedup** (`.claude/` skipped, so the 5 agent worktrees under `projects-template/.claude/worktrees/` are neither separate repos nor walked inside projects-template; `01-census-dedup.json`) and **app-authored** (dedup, and files under `core/`, `tests/`, `test/`, `scripts/`, `research/`, `e2e/`, `bench/`, `fixtures/` or named `*.test.ts`/`*.spec.ts` skipped). Ranks are competition ranks over the 362 method names (361 callables + route `.resolve`), standalone functions excluded, as the README head does. Canon-era = repos pinned >= 7.0.0 (official 19 repos, dedup 16).

## A. Head top-50 by alias-merged fleet count

| Fleet # | Method | Fleet (alias-merged) | Canon-era | Canon # | Dedup fleet # | Dedup canon # | App-authored canon-era | README # | Δ fleet vs README |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `.text()` | 49925 | 18416 | 1 | 1 | 1 | 12984 | 1 | +14243 |
| 2 | `.p()` | 20184 | 6930 | 2 | 2 | 3 | 4197 | 2 | +5634 |
| 3 | `.m()` | 16358 | 5605 | 3 | 3 | 5 | 3563 | 3 | +4220 |
| 4 | `.flex()` | 14238 | 5360 | 4 | 4 | 2 | 4177 | 5 | +4395 |
| 5 | `.font()` | 13547 | 4812 | 6 | 5 | 7 | 3376 | 4 | +3390 |
| 6 | `.border()` | 13266 | 5137 | 5 | 6 | 6 | 3498 | 6 | +4018 |
| 7 | `.bg()` | 11682 | 4268 | 8 | 7 | 8 | 2810 | 7 | +3389 |
| 8 | `.rounded()` | 8901 | 2983 | 10 | 9 | 10 | 1923 | 8 | +2349 |
| 9 | `.gap()` | 8288 | 3287 | 9 | 8 | 9 | 2669 | 10 | +2692 |
| 10 | `.items()` | 6786 | 2272 | 11 | 10 | 11 | 1713 | 11 | +1814 |
| 11 | `.apply()` | 6397 | 4346 | 7 | 12 | 4 | 3850 | 16 | +3737 |
| 12 | `.setClass()` | 6081 | 130 | 92 | 11 | 93 | 85 | 9 | +120 |
| 13 | `.addClass()` | 5623 | 624 | 30 | 13 | 72 | 128 | 12 | +843 |
| 14 | `.w()` | 5334 | 2175 | 12 | 14 | 12 | 1602 | 14 | +1796 |
| 15 | `.cursor()` | 4574 | 1898 | 13 | 16 | 13 | 1056 | 15 | +1456 |
| 16 | `.addAttribute()` | 4224 | 183 | 71 | 15 | 122 | 28 | 13 | +278 |
| 17 | `.hover()` | 3764 | 1393 | 14 | 17 | 16 | 849 | 17 | +1107 |
| 18 | `.justify()` | 3400 | 1076 | 19 | 18 | 18 | 752 | 18 | +849 |
| 19 | `.h()` | 3284 | 1252 | 16 | 19 | 15 | 931 | 20 | +1035 |
| 20 | `.transition()` | 3125 | 1150 | 18 | 21 | 20 | 679 | 21 | +937 |
| 21 | `.setType()` | 3095 | 970 | 20 | 20 | 21 | 631 | 19 | +742 |
| 22 | `.maxW()` | 3076 | 1174 | 17 | 22 | 19 | 647 | 22 | +889 |
| 23 | `.setHtmx()` | 2794 | 706 | 26 | 23 | 42 | 35 | 23 | +667 |
| 24 | `.setId()` | 2224 | 806 | 24 | 25 | 26 | 428 | 24 | +686 |
| 25 | `.resolve()` | 2193 | 1349 | 15 | 24 | 14 | 640 | 36 | +1210 |
| 26 | `.sm()` | 2032 | 959 | 21 | 32 | 25 | 490 | 34 | +1001 |
| 27 | `.setHref()` | 2023 | 700 | 27 | 26 | 34 | 221 | 27 | +615 |
| 28 | `.toggle()` | 1952 | 941 | 22 | 27 | 22 | 575 | 32 | +822 |
| 29 | `.when()` | 1768 | 517 | 33 | 34 | 45 | 211 | 29 | +432 |
| 30 | `.setName()` | 1747 | 380 | 44 | 31 | 58 | 133 | 26 | +282 |
| 31 | `.gridCols()` | 1691 | 374 | 45 | 28 | 43 | 264 | 25 | +167 |
| 32 | `.lg()` | 1644 | 877 | 23 | 37 | 24 | 551 | 41 | +808 |
| 33 | `.tracking()` | 1639 | 690 | 28 | 29 | 23 | 587 | 33 | +515 |
| 34 | `.md()` | 1595 | 435 | 42 | 33 | 39 | 293 | 30 | +316 |
| 35 | `.shadow()` | 1534 | 369 | 47 | 35 | 49 | 234 | 28 | +159 |
| 36 | `.block()` | 1522 | 682 | 29 | 36 | 28 | 487 | 39 | +647 |
| 37 | `.leading()` | 1518 | 803 | 25 | 30 | 17 | 781 | 38 | +629 |
| 38 | `.setValue()` | 1451 | 315 | 52 | 39 | 82 | 112 | 31 | +256 |
| 39 | `.setPlaceholder()` | 1409 | 458 | 40 | 41 | 46 | 243 | 35 | +413 |
| 40 | `.grid()` | 1398 | 601 | 31 | 38 | 29 | 465 | 37 | +463 |
| 41 | `.shrink()` | 1204 | 496 | 35 | 40 | 31 | 427 | 42 | +446 |
| 42 | `.uppercase()` | 1195 | 438 | 41 | 42 | 36 | 348 | 40 | +353 |
| 43 | `.overflow()` | 1169 | 505 | 34 | 43 | 37 | 357 | 43 | +450 |
| 44 | `.setContent()` | 942 | 485 | 37 | 45 | 41 | 267 | 45 | +454 |
| 45 | `.setFill()` | 938 | 371 | 46 | 44 | 51 | 210 | 44 | +258 |
| 46 | `.behavior()` | 808 | 473 | 39 | 46 | 33 | 82 | — | — |
| 47 | `.hidden()` | 772 | 323 | 49 | 47 | 50 | 220 | 46 | +295 |
| 48 | `.setStyles()` | 694 | 231 | 60 | 49 | 68 | 151 | 47 | +221 |
| 49 | `.setRel()` | 685 | 275 | 54 | 50 | 54 | 67 | 49 | +263 |
| 50 | `.setSrc()` | 645 | 247 | 57 | 54 | 65 | 101 | 48 | +210 |

## B. Head top-50 by canonical-era count

| Canon # | Method | Canon-era | Fleet # | Dedup canon # | README # |
|---|---|---|---|---|---|
| 1 | `.text()` | 18416 | 1 | 1 | 1 |
| 2 | `.p()` | 6930 | 2 | 3 | 2 |
| 3 | `.m()` | 5605 | 3 | 5 | 3 |
| 4 | `.flex()` | 5360 | 4 | 2 | 5 |
| 5 | `.border()` | 5137 | 6 | 6 | 6 |
| 6 | `.font()` | 4812 | 5 | 7 | 4 |
| 7 | `.apply()` | 4346 | 11 | 4 | 16 |
| 8 | `.bg()` | 4268 | 7 | 8 | 7 |
| 9 | `.gap()` | 3287 | 9 | 9 | 10 |
| 10 | `.rounded()` | 2983 | 8 | 10 | 8 |
| 11 | `.items()` | 2272 | 10 | 11 | 11 |
| 12 | `.w()` | 2175 | 14 | 12 | 14 |
| 13 | `.cursor()` | 1898 | 15 | 13 | 15 |
| 14 | `.hover()` | 1393 | 17 | 16 | 17 |
| 15 | `.resolve()` | 1349 | 25 | 14 | 36 |
| 16 | `.h()` | 1252 | 19 | 15 | 20 |
| 17 | `.maxW()` | 1174 | 22 | 19 | 22 |
| 18 | `.transition()` | 1150 | 20 | 20 | 21 |
| 19 | `.justify()` | 1076 | 18 | 18 | 18 |
| 20 | `.setType()` | 970 | 21 | 21 | 19 |
| 21 | `.sm()` | 959 | 26 | 25 | 34 |
| 22 | `.toggle()` | 941 | 28 | 22 | 32 |
| 23 | `.lg()` | 877 | 32 | 24 | 41 |
| 24 | `.setId()` | 806 | 24 | 26 | 24 |
| 25 | `.leading()` | 803 | 37 | 17 | 38 |
| 26 | `.setHtmx()` | 706 | 23 | 42 | 23 |
| 27 | `.setHref()` | 700 | 27 | 34 | 27 |
| 28 | `.tracking()` | 690 | 33 | 23 | 33 |
| 29 | `.block()` | 682 | 36 | 28 | 39 |
| 30 | `.addClass()` | 624 | 13 | 72 | 12 |
| 31 | `.grid()` | 601 | 40 | 29 | 37 |
| 32 | `.mt()` | 528 | 58 | 27 | — |
| 33 | `.when()` | 517 | 29 | 45 | 29 |
| 34 | `.overflow()` | 505 | 43 | 37 | 43 |
| 35 | `.shrink()` | 496 | 41 | 31 | 42 |
| 36 | `.setAria()` | 487 | 51 | 30 | — |
| 37 | `.setContent()` | 485 | 44 | 41 | 45 |
| 38 | `.fill()` | 482 | 52 | 31 | — |
| 39 | `.behavior()` | 473 | 46 | 33 | — |
| 40 | `.setPlaceholder()` | 458 | 39 | 46 | 35 |
| 41 | `.uppercase()` | 438 | 42 | 36 | 40 |
| 42 | `.md()` | 435 | 34 | 39 | 30 |
| 43 | `.whenElse()` | 418 | 59 | 35 | — |
| 44 | `.setName()` | 380 | 30 | 58 | 26 |
| 45 | `.gridCols()` | 374 | 31 | 43 | 25 |
| 46 | `.setFill()` | 371 | 45 | 51 | 44 |
| 47 | `.shadow()` | 369 | 35 | 49 | 28 |
| 48 | `.minW()` | 328 | 56 | 38 | — |
| 49 | `.hidden()` | 323 | 47 | 50 | 46 |
| 50 | `.setX()` | 322 | 53 | 47 | — |

## C. Zero fleet call sites (92 methods; all 92 are also 0 in the canonical era)

Skew guard: exempt when fewer than half of the repos with a known pin (61 official / 56 dedup) are pinned at or above the name's intro release. Median pin = 6.1.1, so intro >= 6.2.0 is exempt (eligible 30/61 official, 27/56 dedup).

| Method | Kind | Intro | Eligible repos (official/dedup) | Skew-exempt | Fleet | Canon-era | Dedup canon-era |
|---|---|---|---|---|---|---|---|
| `.addHeaders()` | setter | 6.2.0 | 30/27 | yes | 0 | 0 | 0 |
| `.after()` | tag | 5.8.0 (as .on/.at("after")) | 52/47 | no | 0 | 0 | 0 |
| `.autoCols()` | tag | 5.11.0 | 42/37 | no | 0 | 0 | 0 |
| `.autoRows()` | tag | 5.11.0 | 42/37 | no | 0 | 0 | 0 |
| `.bgBlend()` | tag | 6.2.0 | 30/27 | yes | 0 | 0 | 0 |
| `.bgConic()` | tag | 6.0.0 | 32/29 | no | 0 | 0 | 0 |
| `.brightness()` | tag | 5.11.0 | 42/37 | no | 0 | 0 | 0 |
| `.caret()` | tag | 6.2.0 | 30/27 | yes | 0 | 0 | 0 |
| `.checked()` | tag | 5.8.0 (as .on/.at("checked")) | 52/47 | no | 0 | 0 | 0 |
| `.colEnd()` | tag | 6.2.0 | 30/27 | yes | 0 | 0 | 0 |
| `.containerQuery()` | tag | 6.0.0 | 32/29 | no | 0 | 0 | 0 |
| `.contrast()` | tag | 5.11.0 | 42/37 | no | 0 | 0 | 0 |
| `.dark()` | tag | 5.8.0 (as .on/.at("dark")) | 52/47 | no | 0 | 0 | 0 |
| `.even()` | tag | 5.8.0 (as .on/.at("even")) | 52/47 | no | 0 | 0 | 0 |
| `.grayscale()` | tag | 5.11.0 | 42/37 | no | 0 | 0 | 0 |
| `.gridFlow()` | tag | 5.11.0 | 42/37 | no | 0 | 0 | 0 |
| `.hueRotate()` | tag | 5.11.0 | 42/37 | no | 0 | 0 | 0 |
| `.inlineGrid()` | tag | 6.0.0 | 32/29 | no | 0 | 0 | 0 |
| `.insetE()` | tag | 6.2.0 | 30/27 | yes | 0 | 0 | 0 |
| `.insetRing()` | tag | 6.2.0 | 30/27 | yes | 0 | 0 | 0 |
| `.insetS()` | tag | 6.2.0 | 30/27 | yes | 0 | 0 | 0 |
| `.insetShadow()` | tag | 6.2.0 | 30/27 | yes | 0 | 0 | 0 |
| `.invert()` | tag | 5.11.0 | 42/37 | no | 0 | 0 | 0 |
| `.invisible()` | tag | 7.0.1 | 18/15 | yes | 0 | 0 | 0 |
| `.odd()` | tag | 5.8.0 (as .on/.at("odd")) | 52/47 | no | 0 | 0 | 0 |
| `.perspective()` | tag | 6.2.0 | 30/27 | yes | 0 | 0 | 0 |
| `.rowEnd()` | tag | 6.2.0 | 30/27 | yes | 0 | 0 | 0 |
| `.rowStart()` | tag | 6.2.0 | 30/27 | yes | 0 | 0 | 0 |
| `.saturate()` | tag | 5.11.0 | 42/37 | no | 0 | 0 | 0 |
| `.scroll()` | tag | 6.2.0 | 30/27 | yes | 0 | 0 | 0 |
| `.scrollP()` | tag | 6.2.0 | 30/27 | yes | 0 | 0 | 0 |
| `.sepia()` | tag | 5.11.0 | 42/37 | no | 0 | 0 | 0 |
| `.setAbbr()` | setter | 6.2.0 | 30/27 | yes | 0 | 0 | 0 |
| `.setAutocapitalize()` | tag | 6.1.1 | 31/28 | no | 0 | 0 | 0 |
| `.setCapture()` | setter | 6.0.0 | 32/29 | no | 0 | 0 | 0 |
| `.setCite()` | setter | 6.2.0 | 30/27 | yes | 0 | 0 | 0 |
| `.setClipPathUnits()` | setter | 6.0.0 | 32/29 | no | 0 | 0 | 0 |
| `.setCols()` | setter | 5.7.0 | 61/56 | no | 0 | 0 | 0 |
| `.setContenteditable()` | tag | 6.1.1 | 31/28 | no | 0 | 0 | 0 |
| `.setCoords()` | setter | 5.7.0 | 61/56 | no | 0 | 0 | 0 |
| `.setData()` | setter | 5.7.0 | 61/56 | no | 0 | 0 | 0 |
| `.setDatetime()` | setter | 5.7.0 | 61/56 | no | 0 | 0 | 0 |
| `.setDir()` | tag | 5.8.0 | 52/47 | no | 0 | 0 | 0 |
| `.setDirname()` | setter | 6.2.0 | 30/27 | yes | 0 | 0 | 0 |
| `.setDx()` | setter | 5.9.1 | 52/47 | no | 0 | 0 | 0 |
| `.setDy()` | setter | 5.9.1 | 52/47 | no | 0 | 0 | 0 |
| `.setEdgeMode()` | setter | 6.0.0 | 32/29 | no | 0 | 0 | 0 |
| `.setEnterkeyhint()` | tag | 6.1.1 | 31/28 | no | 0 | 0 | 0 |
| `.setFillRule()` | setter | 5.9.1 | 52/47 | no | 0 | 0 | 0 |
| `.setFilter()` | setter | 5.11.0 | 42/37 | no | 0 | 0 | 0 |
| `.setFilterUnits()` | setter | 6.0.0 | 32/29 | no | 0 | 0 | 0 |
| `.setFontStyle()` | setter | 5.11.0 | 42/37 | no | 0 | 0 | 0 |
| `.setForm()` | tag | 6.1.1 | 31/28 | no | 0 | 0 | 0 |
| `.setFormaction()` | setter | 5.7.0 | 61/56 | no | 0 | 0 | 0 |
| `.setFormenctype()` | setter | 6.2.0 | 30/27 | yes | 0 | 0 | 0 |
| `.setFormtarget()` | setter | 6.2.0 | 30/27 | yes | 0 | 0 | 0 |
| `.setFx()` | setter | 6.0.0 | 32/29 | no | 0 | 0 | 0 |
| `.setFy()` | setter | 6.0.0 | 32/29 | no | 0 | 0 | 0 |
| `.setGradientTransform()` | setter | 6.0.0 | 32/29 | no | 0 | 0 | 0 |
| `.setGradientUnits()` | setter | 6.0.0 | 32/29 | no | 0 | 0 | 0 |
| `.setHeaders()` | setter | 6.2.0 | 30/27 | yes | 0 | 0 | 0 |
| `.setHidden()` | tag | 6.1.1 | 31/28 | no | 0 | 0 | 0 |
| `.setHigh()` | setter | 5.7.0 | 61/56 | no | 0 | 0 | 0 |
| `.setIn()` | setter | 6.0.0 | 32/29 | no | 0 | 0 | 0 |
| `.setKind()` | setter | 5.7.0 | 61/56 | no | 0 | 0 | 0 |
| `.setLabel()` | setter | 5.7.0 | 61/56 | no | 0 | 0 | 0 |
| `.setLow()` | setter | 5.7.0 | 61/56 | no | 0 | 0 | 0 |
| `.setMaskContentUnits()` | setter | 6.0.0 | 32/29 | no | 0 | 0 | 0 |
| `.setMaskUnits()` | setter | 6.0.0 | 32/29 | no | 0 | 0 | 0 |
| `.setMedia()` | setter | 5.7.0 | 61/56 | no | 0 | 0 | 0 |
| `.setMicrodata()` | tag | 6.1.1 | 31/28 | no | 0 | 0 | 0 |
| `.setNonce()` | tag | 5.9.0 | 52/47 | no | 0 | 0 | 0 |
| `.setOptimum()` | setter | 5.7.0 | 61/56 | no | 0 | 0 | 0 |
| `.setPrimitiveUnits()` | setter | 6.0.0 | 32/29 | no | 0 | 0 | 0 |
| `.setResult()` | setter | 6.0.0 | 32/29 | no | 0 | 0 | 0 |
| `.setRowspan()` | setter | 5.7.0 | 61/56 | no | 0 | 0 | 0 |
| `.setShape()` | setter | 5.7.0 | 61/56 | no | 0 | 0 | 0 |
| `.setSize()` | setter | 5.7.0 | 61/56 | no | 0 | 0 | 0 |
| `.setSpan()` | setter | 5.7.0 | 61/56 | no | 0 | 0 | 0 |
| `.setSpellcheck()` | tag | 6.1.1 | 31/28 | no | 0 | 0 | 0 |
| `.setSpreadMethod()` | setter | 6.0.0 | 32/29 | no | 0 | 0 | 0 |
| `.setSrclang()` | setter | 5.7.0 | 61/56 | no | 0 | 0 | 0 |
| `.setStdDeviation()` | setter | 6.0.0 | 32/29 | no | 0 | 0 | 0 |
| `.setStopOpacity()` | setter | 6.0.0 | 32/29 | no | 0 | 0 | 0 |
| `.setTextDecoration()` | setter | 5.11.0 | 42/37 | no | 0 | 0 | 0 |
| `.setTranslate()` | tag | 6.1.1 | 31/28 | no | 0 | 0 | 0 |
| `.setWrap()` | setter | 5.7.0 | 61/56 | no | 0 | 0 | 0 |
| `.spaceX()` | tag | 5.8.0 | 52/47 | no | 0 | 0 | 0 |
| `.static()` | tag | 6.0.0 | 32/29 | no | 0 | 0 | 0 |
| `.table()` | tag | 7.0.1 | 18/15 | yes | 0 | 0 | 0 |
| `.textShadow()` | tag | 6.2.0 | 30/27 | yes | 0 | 0 | 0 |
| `.transform()` | tag | 6.2.0 | 30/27 | yes | 0 | 0 | 0 |

## D. Zero canonical-era but >0 fleet (legacy-only usage, 15 methods)

| Method | Fleet | Intro | Canon-era |
|---|---|---|---|
| `.hxPost()` | 42 | 5.7.0 | 0 |
| `.setFontFamily()` | 14 | 5.9.1 | 0 |
| `.viewTransitionName()` | 14 | 6.1.1 | 0 |
| `.tableCell()` | 6 | 7.0.1 | 0 |
| `.setPattern()` | 4 | 5.7.0 | 0 |
| `.multipart()` | 2 | 6.0.0 | 0 |
| `.setImagesizes()` | 2 | 6.2.0 | 0 |
| `.setImagesrcset()` | 2 | 6.2.0 | 0 |
| `.tableRow()` | 2 | 7.0.1 | 0 |
| `.colStart()` | 1 | 6.2.0 | 0 |
| `.rowSpan()` | 1 | 6.2.0 | 0 |
| `.setClipRule()` | 1 | 5.9.1 | 0 |
| `.setHttpEquiv()` | 1 | 5.7.0 | 0 |
| `.setLetterSpacing()` | 1 | 5.11.0 | 0 |
| `.setSandbox()` | 1 | 5.7.0 | 0 |

## E. Near-dead: 1-5 fleet call sites (40 methods)

| Method | Kind | Intro | Fleet | Canon-era | Dedup fleet | Repos with ≥1 site |
|---|---|---|---|---|---|---|
| `.addStyle()` | tag | 6.2.0 | 1 | 1 | 1 | everyframe-composer:1 |
| `.colStart()` | tag | 6.2.0 | 1 | 0 | 1 | storysell-system:1 |
| `.delay()` | tag | 6.2.0 | 1 | 1 | 1 | home-page:1 |
| `.dropShadow()` | tag | 6.2.0 | 1 | 1 | 1 | workshop-toni:1 |
| `.mixBlend()` | tag | 6.2.0 | 1 | 1 | 1 | everyframe:1 |
| `.overscroll()` | tag | 5.11.0 | 1 | 1 | 1 | stojnica:1 |
| `.rowSpan()` | tag | 6.2.0 | 1 | 0 | 1 | home-page-define-feature:1 |
| `.setClipRule()` | setter | 5.9.1 | 1 | 0 | 1 | pm-gui:1 |
| `.setFormmethod()` | setter | 5.7.0 | 1 | 1 | 1 | gzs/stem-50:1 |
| `.setHttpEquiv()` | setter | 5.7.0 | 1 | 0 | 1 | planet-positive-sport:1 |
| `.setLetterSpacing()` | setter | 5.11.0 | 1 | 0 | 1 | storysell-system:1 |
| `.setSandbox()` | setter | 5.7.0 | 1 | 0 | 1 | jt-present:1 |
| `.setSrcdoc()` | setter | 5.7.0 | 1 | 1 | 1 | website-sales-funnel-automation-system:1 |
| `.willChange()` | tag | 5.11.0 | 1 | 1 | 1 | everyframe:1 |
| `.bgRadial()` | tag | 6.0.0 | 2 | 2 | 2 | competify:2 |
| `.boxDecoration()` | tag | 6.2.0 | 2 | 2 | 2 | everyframe-composer:1, workshop-toni:1 |
| `.divideX()` | tag | 5.8.0 | 2 | 2 | 2 | everyframe-composer:2 |
| `.lowercase()` | tag | 5.7.0 | 2 | 1 | 2 | glimm:1, workshop-toni:1 |
| `.multipart()` | setter | 6.0.0 | 2 | 0 | 2 | storysell-system:1, storysell-system-define-feature-exp:1 |
| `.setImagesizes()` | setter | 6.2.0 | 2 | 0 | 2 | storysell-system:1, storysell-system-define-feature-exp:1 |
| `.setImagesrcset()` | setter | 6.2.0 | 2 | 0 | 2 | storysell-system:1, storysell-system-define-feature-exp:1 |
| `.setOffset()` | setter | 6.0.0 | 2 | 2 | 2 | workshop-toni:2 |
| `.setReferrerPolicy()` | setter | 6.0.0 | 2 | 1 | 2 | sportoawards:1, storysell-system-define-feature-exp:1 |
| `.setStopColor()` | setter | 6.0.0 | 2 | 2 | 2 | workshop-toni:2 |
| `.setStrokeOpacity()` | setter | 6.0.0 | 2 | 2 | 2 | home-page:2 |
| `.tableRow()` | tag | 7.0.1 | 2 | 0 | 2 | planet-positive-sport:2 |
| `.addChild()` | tag | 6.1.1 | 3 | 3 | 3 | na-cent:2, sportoawards:1 |
| `.breakInside()` | tag | 6.2.0 | 3 | 3 | 1 | projects-template:2, projects-template/.claude/worktrees/agent-a716fc737cfff8069:1 |
| `.columns()` | tag | 6.2.0 | 3 | 3 | 1 | projects-template:2, projects-template/.claude/worktrees/agent-a716fc737cfff8069:1 |
| `.isolate()` | tag | 6.2.0 | 3 | 3 | 3 | sportoawards:3 |
| `.setHreflang()` | setter | 6.0.0 | 3 | 3 | 3 | competify:3 |
| `.setList()` | setter | 5.7.0 | 3 | 3 | 3 | everyframe-composer:1, na-cent:1, website-sales-funnel-automation-system:1 |
| `.mr()` | tag | 7.0.0 | 4 | 4 | 4 | fluent-html-home-page:2, gzs/stem-50:1, na-cent:1 |
| `.setPattern()` | setter | 5.7.0 | 4 | 0 | 4 | corina/storysell:1, filmplast-v2:1, jt-chess:1, jt-vault-cloud:1 |
| `.setPopovertargetaction()` | tag | 6.1.0 | 4 | 3 | 4 | everyframe-composer:1, home-page:1, varnoska:1, workshop-toni:1 |
| `.appearance()` | tag | 6.8.0 | 5 | 5 | 5 | competify:1, gzs/stem-50:2, na-cent:1, sportoawards:1 |
| `.content()` | tag | 6.8.0 | 5 | 4 | 3 | corina/storysell:1, projects-template:2, projects-template/.claude/worktrees/agent-a716fc737cfff8069:1, website-sales-funnel-automation-system:1 |
| `.gridRows()` | tag | 5.7.0 | 5 | 2 | 5 | filmplast-v2:2, home-page-define-feature:1, stojnica:2 |
| `.my()` | tag | 7.0.0 | 5 | 5 | 1 | na-cent:1, projects-template:2, projects-template/.claude/worktrees/agent-abb0578c6f24f0518:2 |
| `.setInputmode()` | setter | 6.0.0 | 5 | 5 | 5 | na-cent:5 |

## F. Escape hatches by era

Era denominators (all call sites incl. standalone): official pre-7 186,203 / canonical 113,491; dedup canonical 81,635.

| Hatch | Fleet | Pre-7 sites | Pre-7 share | Canon-era sites | Canon-era share | Canon-era repos using | Dedup canon-era sites | Dedup canon share | App-authored canon-era |
|---|---|---|---|---|---|---|---|---|---|
| `.addAttribute()` | 4224 | 4041 | 2.2% | 183 | 0.2% | 19/19 | 45 | 0.1% | 28 |
| `.setClass()` | 6081 | 5951 | 3.2% | 130 | 0.1% | 18/19 | 86 | 0.1% | 85 |
| `.addClass()` | 5623 | 4999 | 2.7% | 624 | 0.5% | 19/19 | 138 | 0.2% | 128 |
| `.setStyle()` | 329 | 226 | 0.1% | 103 | 0.1% | 17/19 | 96 | 0.1% | 96 |
| `.setStyles()` | 694 | 463 | 0.2% | 231 | 0.2% | 16/19 | 151 | 0.2% | 151 |
| `.addStyle()` | 1 | 0 | 0.0% | 1 | 0.0% | 1/19 | 1 | 0.0% | 1 |
| `.cssProp()` | 111 | 1 | 0.0% | 110 | 0.1% | 15/19 | 109 | 0.1% | 106 |
| `.cssClass()` | 164 | 32 | 0.0% | 132 | 0.1% | 8/19 | 26 | 0.0% | 25 |
| `Raw()` | 1658 | 1572 | 0.8% | 86 | 0.1% | 8/19 | 26 | 0.0% | 22 |

### F2. Escape hatches per canonical-era repo (official)

| Repo | Version | Sites | addAttribute | setClass | addClass | setStyle | setStyles | cssProp | cssClass | Raw |
|---|---|---|---|---|---|---|---|---|---|---|
| projects-template | 8.1.0 | 23950 | 89 | 31 | 350 | 5 | 60 | 4 | 70 | 48 |
| everyframe-composer | 8.1.0 | 15855 | 2 | 4 | 3 | 18 | 45 | 34 | 0 | 0 |
| website-sales-funnel-automation-system | 8.1.0 | 9219 | 1 | 4 | 2 | 12 | 8 | 1 | 0 | 1 |
| everyframe | 8.1.0 | 6285 | 2 | 4 | 3 | 18 | 12 | 16 | 17 | 0 |
| competify | 8.1.0 | 6001 | 2 | 4 | 3 | 5 | 8 | 16 | 1 | 3 |
| home-page | 8.1.0 | 5934 | 4 | 18 | 58 | 5 | 0 | 1 | 5 | 9 |
| workshop-toni | 7.0.0 | 5393 | 5 | 7 | 3 | 4 | 8 | 13 | 0 | 0 |
| na-cent | 8.1.0 | 5178 | 4 | 8 | 3 | 5 | 8 | 4 | 0 | 0 |
| gzs/stem-50 | 8.1.0 | 4646 | 4 | 7 | 3 | 4 | 12 | 1 | 1 | 0 |
| popri | 8.1.0 | 4516 | 2 | 4 | 3 | 4 | 8 | 5 | 0 | 0 |
| projects-template/.claude/worktrees/agent-abb0578c6f24f0518 | 8.1.0 | 4432 | 17 | 5 | 68 | 0 | 10 | 0 | 0 | 8 |
| projects-template/.claude/worktrees/agent-a0c1359f91e158924 | 8.1.0 | 4140 | 30 | 5 | 68 | 0 | 10 | 0 | 36 | 8 |
| sportoawards | 8.1.0 | 4137 | 2 | 4 | 3 | 6 | 8 | 4 | 0 | 0 |
| projects-template/.claude/worktrees/agent-a716fc737cfff8069 | 8.1.0 | 3179 | 5 | 7 | 39 | 3 | 10 | 0 | 1 | 6 |
| studio | 8.1.0 | 2416 | 2 | 4 | 3 | 1 | 8 | 2 | 0 | 0 |
| fluent-html-home-page | 8.1.0 | 2263 | 4 | 3 | 3 | 4 | 0 | 3 | 1 | 3 |
| competition | 8.1.0 | 2146 | 2 | 4 | 3 | 2 | 8 | 0 | 0 | 0 |
| stojnica | 8.1.0 | 2081 | 2 | 0 | 3 | 3 | 0 | 4 | 0 | 0 |
| fl-um | 8.1.0 | 1720 | 4 | 7 | 3 | 4 | 8 | 2 | 0 | 0 |

## G. Standalone functions (census universe)

| Standalone | Fleet | Canon-era | Dedup fleet | Dedup canon-era | Canon-era repos using |
|---|---|---|---|---|---|
| `IfThen()` | 6241 | 2646 | 5023 | 1669 | 19/19 |
| `ForEach()` | 3763 | 1748 | 3171 | 1274 | 19/19 |
| `IfThenElse()` | 1680 | 824 | 1468 | 657 | 19/19 |
| `defineRoutes()` | 1419 | 866 | 1185 | 667 | 19/19 |
| `hx()` | 667 | 51 | 649 | 33 | 16/19 |
| `defineIds()` | 629 | 345 | 535 | 265 | 19/19 |
| `assetUrl()` | 485 | 383 | 417 | 315 | 18/19 |
| `Match()` | 353 | 215 | 289 | 162 | 19/19 |
| `MatchValue()` | 225 | 171 | 209 | 156 | 17/19 |
| `Partial()` | 174 | 144 | 90 | 69 | 19/19 |
| `externalUrl()` | 159 | 157 | 131 | 129 | 16/19 |
| `hxResponse()` | 126 | 74 | 92 | 44 | 18/19 |
| `ForEachKeyed()` | 79 | 70 | 77 | 69 | 7/19 |
| `defineTheme()` | 37 | 21 | 33 | 17 | 17/19 |
| `Intersperse()` | 16 | 13 | 16 | 13 | 6/19 |
| `Repeat()` | 1 | 0 | 1 | 0 | 0/19 |

## H. Names outside the census universe (scratch pass; same shape rules, no alias folding)

`render`, `.error`, `.input`, `.redirect`, `.submit`, `.search` collide with non-fluent code (Fastify `reply.redirect`, DOM `form.submit()`, `String.prototype.search`, any local `render()`); see `01-collision-audit.json`. Swap verbs / reply helpers are template-owned, not fluent-html 8.1.0.

| Name (outside census universe) | Fleet | Canon-era | Dedup canon-era | Canon-era repos using |
|---|---|---|---|---|
| `.build` | 114 | 50 | 32 | 15/19 |
| `.checkbox` | 65 | 49 | 47 | 17/19 |
| `.error` | 2101 | 849 | 521 | 19/19 |
| `.fire` | 188 | 148 | 116 | 17/19 |
| `.fragment` | 715 | 583 | 506 | 19/19 |
| `.hxOn` | 1 | 0 | 0 | 0/19 |
| `.input` | 1396 | 861 | 640 | 19/19 |
| `.label` | 104 | 92 | 92 | 6/19 |
| `.nav` | 2110 | 1451 | 1295 | 19/19 |
| `.onChange` | 257 | 203 | 172 | 19/19 |
| `.poll` | 331 | 251 | 207 | 19/19 |
| `.pushUrl` | 3 | 2 | 2 | 2/19 |
| `.radio` | 34 | 22 | 22 | 7/19 |
| `.redirect` | 2565 | 903 | 562 | 19/19 |
| `.renderFragment` | 341 | 320 | 234 | 18/19 |
| `.renderPage` | 1047 | 1038 | 827 | 18/19 |
| `.renderView` | 4083 | 845 | 281 | 19/19 |
| `.replaceUrl` | 1 | 1 | 1 | 1/19 |
| `.reswap` | 1 | 0 | 0 | 0/19 |
| `.retarget` | 4 | 4 | 2 | 4/19 |
| `.search` | 347 | 277 | 243 | 19/19 |
| `.submit` | 1297 | 906 | 785 | 18/19 |
| `.tab` | 309 | 266 | 243 | 16/19 |
| `.textarea` | 103 | 70 | 68 | 15/19 |
| `.trigger` | 83 | 43 | 19 | 13/19 |
| `El` | 112 | 0 | 0 | 0/19 |
| `Empty` | 338 | 204 | 108 | 19/19 |
| `ForEachElse` | 2 | 1 | 1 | 1/19 |
| `Form` | 1430 | 650 | 463 | 19/19 |
| `HtmxConfig` | 72 | 29 | 17 | 19/19 |
| `LoaderButton` | 97 | 74 | 66 | 16/19 |
| `Raw` | 1658 | 86 | 26 | 8/19 |
| `createId` | 93 | 69 | 49 | 10/19 |
| `defineBehavior` | 62 | 40 | 36 | 17/19 |
| `escapeAttr` | 16 | 6 | 4 | 2/19 |
| `escapeHtml` | 50 | 15 | 15 | 6/19 |
| `extractId` | 14 | 14 | 0 | 2/19 |
| `extractSelector` | 1 | 0 | 0 | 0/19 |
| `isId` | 108 | 92 | 86 | 19/19 |
| `isTag` | 2 | 2 | 0 | 2/19 |
| `registerBehavior` | 62 | 40 | 36 | 17/19 |
| `render` | 17633 | 9556 | 6140 | 19/19 |
| `renderToStream` | 13 | 6 | 0 | 3/19 |
| `renderToStreamWithNonce` | 30 | 18 | 16 | 17/19 |
| `renderWithNonce` | 77 | 63 | 47 | 17/19 |

## I. Per-repo totals (official corpus)

| Repo | Pinned | Era | .ts files | Call sites | Class |
|---|---|---|---|---|---|
| renderbox | 5.10.0 | pre-7 | 217 | 32327 |  |
| projects-template | 8.1.0 | canonical | 2080 | 23950 |  |
| planet-positive-sport | 5.11.0 | pre-7 | 700 | 18114 |  |
| everyframe-composer | 8.1.0 | canonical | 555 | 15855 |  |
| jt-cut | 5.10.0 | pre-7 | 244 | 12144 |  |
| website-sales-funnel-automation-system | 8.1.0 | canonical | 734 | 9219 |  |
| storysell-ai | 5.11.0 | pre-7 | 304 | 8586 |  |
| storysell-system | 6.5.0 | pre-7 | 341 | 7519 |  |
| everyframe | 8.1.0 | canonical | 309 | 6285 |  |
| competify | 8.1.0 | canonical | 334 | 6001 |  |
| home-page | 8.1.0 | canonical | 344 | 5934 |  |
| jt-vault | 5.9.1 | pre-7 | 203 | 5823 |  |
| rideshare | 5.11.0 | pre-7 | 202 | 5402 |  |
| storysell-system-define-feature-exp | 6.5.0 | pre-7 | 289 | 5396 | scratch/experiment |
| workshop-toni | 7.0.0 | canonical | 366 | 5393 |  |
| gzs/inovacije | 5.7.1 | pre-7 | 230 | 5337 |  |
| na-cent | 8.1.0 | canonical | 404 | 5178 |  |
| jt-draw | 5.10.0 | pre-7 | 191 | 5072 |  |
| varnoska | 6.3.0 | pre-7 | 305 | 4937 |  |
| corina/storysell | 5.11.0 | pre-7 | 218 | 4766 |  |
| gzs/stem-50 | 8.1.0 | canonical | 388 | 4646 |  |
| popri | 8.1.0 | canonical | 283 | 4516 |  |
| mngmt | 5.10.0 | pre-7 | 152 | 4438 |  |
| projects-template/.claude/worktrees/agent-abb0578c6f24f0518 | 8.1.0 | canonical | 292 | 4432 | agent worktree (duplicate of projects-template files) |
| fivb-prototype | 5.9.1 | pre-7 | 66 | 4290 |  |
| projects-template/.claude/worktrees/agent-a4f731df7f653111d | 5.11.0 | pre-7 | 291 | 4249 | agent worktree (duplicate of projects-template files) |
| projects-template/.claude/worktrees/agent-a0c1359f91e158924 | 8.1.0 | canonical | 298 | 4140 | agent worktree (duplicate of projects-template files) |
| sportoawards | 8.1.0 | canonical | 285 | 4137 |  |
| projects-template/.claude/worktrees/agent-a09be89c224b59a06 | 5.11.0 | pre-7 | 305 | 4105 | agent worktree (duplicate of projects-template files) |
| tela | 5.7.0 | pre-7 | 152 | 3750 |  |
| home-page-define-feature | 6.5.0 | pre-7 | 243 | 3546 | scratch/experiment |
| jt-vault-cloud | 5.11.0 | pre-7 | 189 | 3385 |  |
| projects-template/.claude/worktrees/agent-a716fc737cfff8069 | 8.1.0 | canonical | 425 | 3179 | agent worktree (duplicate of projects-template files) |
| jt-chess | 5.7.0 | pre-7 | 87 | 2903 |  |
| glimm | 5.11.0 | pre-7 | 189 | 2880 |  |
| ttl | 5.10.0 | pre-7 | 100 | 2758 |  |
| buzzin | 5.7.0 | pre-7 | 164 | 2728 |  |
| jtdigital-landing-page | 5.10.0 | pre-7 | 105 | 2654 |  |
| cms | 6.1.0 | pre-7 | 104 | 2455 |  |
| studio | 8.1.0 | canonical | 292 | 2416 |  |
| fluent-html-home-page | 8.1.0 | canonical | 185 | 2263 |  |
| jt-present | 6.5.0 | pre-7 | 250 | 2200 |  |
| competition | 8.1.0 | canonical | 323 | 2146 |  |
| pm-gui | 6.1.1 | pre-7 | 115 | 2105 |  |
| workshop-alenka | 6.5.0 | pre-7 | 228 | 2099 |  |
| workshop-sasa | 6.5.0 | pre-7 | 222 | 2092 |  |
| stojnica | 8.1.0 | canonical | 154 | 2081 |  |
| filmplast-v2 | 5.10.0 | pre-7 | 62 | 1922 |  |
| redaction-renderbox | 5.11.0 | pre-7 | 149 | 1841 |  |
| jt-i18n | 5.11.0 | pre-7 | 135 | 1832 |  |
| jt-draw2 | 5.10.0 | pre-7 | 122 | 1810 |  |
| jtdigital-blog | 6.5.0 | pre-7 | 161 | 1785 |  |
| pregled-nepremicnin-dashboard | 5.7.1 | pre-7 | 85 | 1731 |  |
| fl-um | 8.1.0 | canonical | 226 | 1720 |  |
| filmplast-landing-page | 5.7.0 | pre-7 | 42 | 1459 |  |
| time-to-live | 6.5.0 | pre-7 | 124 | 1180 |  |
| vabilo30 | 5.7.1 | pre-7 | 62 | 941 |  |
| test/kjkljkl | unknown | pre-7 | 117 | 922 | scratch/experiment |
| tetstesttes | 6.3.0 | pre-7 | 129 | 865 | scratch/experiment |
| idea-hub | unknown | pre-7 | 31 | 600 | scratch/experiment |
| pokemon | 5.7.1 | pre-7 | 49 | 481 | scratch/experiment |
| business-helper/business/hiring/matej-naloga | 6.3.0 | pre-7 | 51 | 462 | scratch/experiment |
| orca | 5.7.0 | pre-7 | 29 | 312 |  |
