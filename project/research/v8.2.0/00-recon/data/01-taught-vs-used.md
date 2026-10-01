# 01 — taught-vs-used (input for the Wave 1 taught-but-unused audit)

**Teaching corpus (9 files):** `fluent-html/README.md` (README), `fluent-html/CLAUDE.md` (CLAUDE — the repo's
own copy, last touched b117394 2026-08-03), and `guidelines/web-development/{CLAUDE, claude-code-algorithms,
fastify, fluent-html, htmx, typescript, views}.md` (gl/*; gl/CLAUDE last touched f19a5b0 2026-09-23).
fluent-html/CLAUDE.md and gl/CLAUDE.md differ on 259 lines (`diff` after trailing-space strip); CLAUDE.md is
the stale copy `scripts/guidelines.sh pull` would overwrite.

**Mention rule.** Methods/members: `.name(` or a backticked `` `.name` ``. Exports: `Name(` / backticked for
short or collision-prone names (element factories, `Partial` — which excludes TS `Partial<T>` —, `Match`,
`render`, `hx`, …), whole-word otherwise. Candidate names = the 8.1.0 runtime surface (361 methods, route
`.resolve`, FormBinding ×8, HxResponse ×12, 281 export names) + the template-owned swap verbs / reply
helpers / `LoaderButton` + one ghost (`.alignItems`). Non-API tokens (route keys such as
`userRoutes.create(`, Fastify `reply.code(`, Prisma `findMany(`, the pre-7 spellings quoted in README:40-41
to explain alias merging) are excluded.

**Count columns.** Fleet / Canon-era = official census (alias-merged for census names); Dedup canon-era =
worktrees removed; App-authored canon-era = dedup minus vendored template `core/` + tests/scripts (the
number of distinct canonical repos in parentheses). "extra" = counted by the scratch pass with the census's
shape rules (no alias folding): `.error`/`.input`/`.redirect`/`.submit`/`.search`/`render` include
non-fluent collisions. Element factories are not counted (outside the census universe).

**Flags.** Exists in 8.1.0 = `yes` / `no (template)` (defined in
projects-template/templates/full-stack/src/core/htmx/swap-verbs.ts:111-169, src/core/render/*,
src/shared/ui/button.ts:39) / `NO` (defined nowhere).

| API name | Layer | Exists in 8.1.0 | README | CLAUDE | gl/CLAUDE | gl/claude-code-algorithms | gl/fastify | gl/fluent-html | gl/htmx | gl/typescript | gl/views | Mentions | Fleet | Canon-era | Dedup canon-era | App-authored canon-era (repos) | Canon-era repos (of 19) | Count source |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `Div` | lib element factory | yes | 10 | 15 | 15 |  | 2 | 39 | 7 | 2 | 11 | 101 | — | — | — | — | — | not counted |
| `Button` | lib element factory | yes | 6 | 13 | 13 |  |  | 7 | 29 |  | 7 | 75 | — | — | — | — | — | not counted |
| `.bg` | lib method | yes | 10 | 14 | 11 |  |  | 26 |  | 3 | 4 | 68 | 11682 | 4268 | 2992 | 2810 (16) | 19 | census |
| `Span` | lib element factory | yes | 4 | 12 | 16 |  | 2 | 7 | 9 | 3 | 10 | 63 | — | — | — | — | — | not counted |
| `.text` | lib method | yes | 10 | 11 | 11 |  |  | 17 |  | 3 | 10 | 62 | 49925 | 18416 | 13181 | 12984 (16) | 19 | census |
| `.nav` | template swap verb | no (template) |  | 9 | 18 |  | 1 | 1 | 19 |  | 1 | 49 | 2110 | 1451 | 1295 | 819 (16) | 19 | extra |
| `IfThen` | lib standalone | yes | 5 | 13 | 11 |  |  | 15 |  |  | 3 | 47 | 6241 | 2646 | 1669 | 1602 (16) | 19 | census |
| `A` | lib element factory | yes | 2 | 6 | 10 |  | 1 | 3 | 14 |  | 2 | 38 | — | — | — | — | — | not counted |
| `ForEach` | lib standalone | yes | 3 | 10 | 10 |  |  | 9 | 2 | 1 | 2 | 37 | 3763 | 1748 | 1274 | 1261 (16) | 19 | census |
| `.resolve` | lib member (route callable) | yes | 3 | 1 | 2 |  | 1 |  | 29 |  |  | 36 | 2193 | 1349 | 1140 | 640 (16) | 19 | census |
| `Tag` | lib class | yes |  | 4 | 9 |  | 5 | 11 | 1 |  | 6 | 36 | — | — | — | — | — | not counted |
| `defineRoutes` | lib standalone | yes | 3 | 5 | 6 |  | 3 | 1 | 12 | 4 |  | 34 | 1419 | 866 | 667 | 329 (16) | 19 | census |
| `Form` | lib element factory | yes | 3 | 2 | 2 |  |  | 10 | 7 | 2 | 8 | 34 | 1430 | 650 | 463 | 120 (16) | 19 | extra |
| `.behavior` | lib method | yes | 2 | 11 | 10 |  |  |  | 9 |  |  | 32 | 808 | 473 | 370 | 82 (15) | 19 | census |
| `Match` | lib standalone | yes | 3 | 8 | 8 |  |  | 4 |  | 3 | 4 | 30 | 353 | 215 | 162 | 156 (16) | 19 | census |
| `.when` | lib method | yes | 2 | 9 | 8 |  |  | 9 | 1 |  |  | 29 | 1768 | 517 | 248 | 211 (16) | 19 | census |
| `.search` | template swap verb | no (template) |  | 6 | 8 |  |  |  | 14 |  |  | 28 | 347 | 277 | 243 | 62 (13) | 19 | extra |
| `.submit` | template swap verb | no (template) |  | 5 | 7 |  |  |  | 14 |  | 2 | 28 | 1297 | 906 | 785 | 412 (16) | 18 | extra |
| `Partial` | lib standalone | yes | 3 | 3 | 5 |  | 2 | 1 | 11 |  |  | 25 | 174 | 144 | 69 | 11 (5) | 19 | census |
| `.setHtmx` | lib method | yes | 4 | 1 | 1 |  |  |  | 17 |  | 1 | 24 | 2794 | 706 | 267 | 35 (16) | 19 | census |
| `.apply` | lib method | yes | 2 | 3 | 5 |  |  | 7 |  |  | 6 | 23 | 6397 | 4346 | 3972 | 3850 (16) | 19 | census |
| `.fragment` | template swap verb | no (template) |  | 3 | 7 |  |  |  | 13 |  |  | 23 | 715 | 583 | 506 | 280 (16) | 19 | extra |
| `.setType` | lib method | yes | 5 | 2 | 3 |  |  | 8 | 2 |  | 2 | 22 | 3095 | 970 | 697 | 631 (16) | 19 | census |
| `Li` | lib element factory | yes | 2 | 5 | 5 |  |  | 6 | 2 | 1 | 1 | 22 | — | — | — | — | — | not counted |
| `.list` | lib method | yes | 3 | 2 | 4 |  |  |  | 12 |  |  | 21 | 133 | 24 | 20 | 20 (7) | 9 | census |
| `.renderPage` | template reply helper | no (template) |  |  | 11 |  | 9 |  |  |  |  | 20 | 1047 | 1038 | 827 | 721 (15) | 18 | extra |
| `.setId` | lib method | yes | 2 | 2 | 4 |  | 2 | 1 | 6 |  | 3 | 20 | 2224 | 806 | 513 | 428 (16) | 19 | census |
| `.variant` | lib method | yes | 2 | 3 | 3 |  |  | 12 |  |  |  | 20 | 301 | 298 | 292 | 291 (16) | 17 | census |
| `Input` | lib element factory | yes | 1 | 2 | 2 |  |  | 8 | 6 |  | 1 | 20 | — | — | — | — | — | not counted |
| `defineTheme` | lib standalone | yes | 2 | 5 | 5 |  |  | 6 |  | 1 |  | 19 | 37 | 21 | 17 | 17 (16) | 17 | census |
| `.addAttribute` | lib method | yes | 3 | 2 | 2 |  |  | 7 | 4 |  |  | 18 | 4224 | 183 | 45 | 28 (15) | 19 | census |
| `Img` | lib element factory | yes | 1 | 4 | 4 |  |  | 7 |  | 2 |  | 18 | — | — | — | — | — | not counted |
| `.input` | lib member (FormBinding) | yes | 2 |  |  |  |  | 8 | 1 | 1 | 5 | 17 | 1396 | 861 | 640 | 636 (16) | 19 | extra |
| `.onChange` | template swap verb | no (template) |  | 4 | 5 |  |  |  | 8 |  |  | 17 | 257 | 203 | 172 | 27 (9) | 19 | extra |
| `.poll` | template swap verb | no (template) |  | 4 | 5 |  |  |  | 8 |  |  | 17 | 331 | 251 | 207 | 31 (9) | 19 | extra |
| `.toggle` | lib method | yes | 1 | 5 | 5 |  |  | 6 |  |  |  | 17 | 1952 | 941 | 621 | 575 (16) | 19 | census |
| `.whenMatch` | lib method | yes | 2 | 2 | 2 |  |  | 7 |  |  | 4 | 17 | 340 | 260 | 250 | 228 (16) | 17 | census |
| `defineIds` | lib standalone | yes | 4 | 3 | 3 |  | 1 | 2 | 3 | 1 |  | 17 | 629 | 345 | 265 | 136 (16) | 19 | census |
| `IfThenElse` | lib standalone | yes | 4 | 4 | 4 |  |  | 4 |  |  | 1 | 17 | 1680 | 824 | 657 | 620 (16) | 19 | census |
| `.cursor` | lib method | yes | 3 | 6 | 3 |  |  | 1 | 3 |  |  | 16 | 4574 | 1898 | 1329 | 1056 (16) | 19 | census |
| `.fire` | template swap verb | no (template) |  | 3 | 4 |  |  |  | 9 |  |  | 16 | 188 | 148 | 116 | 7 (4) | 17 | extra |
| `.setSrc` | lib method | yes | 2 | 4 | 4 |  |  | 5 | 1 |  |  | 16 | 645 | 247 | 157 | 101 (12) | 19 | census |
| `.p` | lib method | yes | 4 | 3 | 3 |  |  | 1 |  |  | 4 | 15 | 20184 | 6930 | 4329 | 4197 (16) | 19 | census |
| `.border` | lib method | yes | 1 | 4 | 3 |  |  | 4 |  |  | 2 | 14 | 13266 | 5137 | 3551 | 3498 (16) | 19 | census |
| `.renderFragment` | template reply helper | no (template) |  |  | 6 |  | 5 |  | 1 |  | 2 | 14 | 341 | 320 | 234 | 148 (11) | 18 | extra |
| `.tab` | template swap verb | no (template) |  |  | 6 |  |  |  | 8 |  |  | 14 | 309 | 266 | 243 | 119 (13) | 16 | extra |
| `hx` | lib standalone | yes | 2 | 1 | 1 |  |  |  | 10 |  |  | 14 | 667 | 51 | 33 | 1 (1) | 16 | census |
| `MatchValue` | lib standalone | yes | 1 | 3 | 2 |  |  | 4 |  |  | 4 | 14 | 225 | 171 | 156 | 154 (16) | 17 | census |
| `.rounded` | lib method | yes | 5 | 3 | 3 |  |  | 1 |  |  | 1 | 13 | 8901 | 2983 | 1942 | 1923 (16) | 19 | census |
| `ForEachKeyed` | lib standalone | yes | 2 | 3 | 3 |  |  |  | 2 |  | 3 | 13 | 79 | 70 | 69 | 69 (6) | 7 | census |
| `Ul` | lib element factory | yes | 1 | 4 | 4 |  |  | 1 | 2 |  | 1 | 13 | — | — | — | — | — | not counted |
| `.flex` | lib method | yes | 3 | 1 | 1 |  |  | 1 |  |  | 6 | 12 | 14238 | 5360 | 4335 | 4177 (16) | 19 | census |
| `.redirect` | lib member (HxResponse) | yes |  | 1 | 2 |  | 2 |  | 7 |  |  | 12 | 2565 | 903 | 562 | 481 (16) | 19 | extra |
| `.setName` | lib method | yes | 1 | 1 | 1 |  |  | 8 |  |  | 1 | 12 | 1747 | 380 | 174 | 133 (16) | 19 | census |
| `.setStyle` | lib method | yes | 1 | 1 | 1 |  |  | 9 |  |  |  | 12 | 329 | 103 | 96 | 96 (16) | 17 | census |
| `.whenElse` | lib method | yes | 3 | 2 | 2 |  |  | 5 |  |  |  | 12 | 510 | 418 | 365 | 347 (16) | 17 | census |
| `render` | lib standalone | yes | 2 | 1 | 2 |  |  | 2 | 5 |  |  | 12 | 17633 | 9556 | 6140 | 24 (15) | 19 | extra |
| `.md` | lib method | yes | 4 | 2 | 2 |  |  | 2 |  |  |  | 10 | 1595 | 435 | 307 | 293 (14) | 17 | census |
| `.renderView` | template reply helper | no (template) |  | 3 |  |  | 4 |  | 2 |  |  | 9 | 4083 | 845 | 281 | 217 (15) | 19 | extra |
| `.setHref` | lib method | yes | 3 |  |  |  |  | 4 | 2 |  |  | 9 | 2023 | 700 | 366 | 221 (16) | 19 | census |
| `.setPopover` | lib method | yes |  | 2 | 2 |  |  | 1 | 4 |  |  | 9 | 10 | 5 | 5 | 5 (4) | 4 | census |
| `hxResponse` | lib standalone | yes |  | 1 | 2 |  | 1 | 1 | 4 |  |  | 9 | 126 | 74 | 44 | 31 (12) | 18 | census |
| `.error` | lib member (FormBinding) | yes |  |  |  |  |  | 4 |  |  | 4 | 8 | 2101 | 849 | 521 | 387 (16) | 19 | extra |
| `.hover` | lib method | yes | 2 | 2 | 2 |  |  | 2 |  |  |  | 8 | 3764 | 1393 | 882 | 849 (16) | 19 | census |
| `.px` | lib method | yes | 4 | 2 | 2 |  |  |  |  |  |  | 8 | 205 | 205 | 173 | 171 (8) | 11 | census |
| `.shadow` | lib method | yes | 2 | 2 | 2 |  |  | 1 |  |  | 1 | 8 | 1534 | 369 | 239 | 234 (16) | 19 | census |
| `.w` | lib method | yes | 2 | 2 | 2 |  |  | 2 |  |  |  | 8 | 5334 | 2175 | 1639 | 1602 (16) | 19 | census |
| `P` | lib element factory | yes |  | 2 | 2 |  |  | 4 |  |  |  | 8 | — | — | — | — | — | not counted |
| `.addClass` | lib method | yes | 3 |  |  |  |  | 4 |  |  |  | 7 | 5623 | 624 | 138 | 128 (16) | 19 | census |
| `.gap` | lib method | yes | 2 | 1 | 1 |  |  | 1 |  |  | 2 | 7 | 8288 | 3287 | 2743 | 2669 (16) | 19 | census |
| `.opacity` | lib method | yes | 1 | 2 | 2 |  |  | 2 |  |  |  | 7 | 439 | 172 | 138 | 137 (16) | 19 | census |
| `Empty` | lib standalone | yes |  | 1 | 1 |  | 1 | 2 | 2 |  |  | 7 | 338 | 204 | 108 | 89 (16) | 19 | extra |
| `externalUrl` | lib standalone | yes | 2 |  | 1 |  |  |  | 4 |  |  | 7 | 159 | 157 | 129 | 119 (15) | 16 | census |
| `.cssProp` | lib method | yes | 2 | 1 | 1 |  |  | 2 |  |  |  | 6 | 111 | 110 | 109 | 106 (15) | 15 | census |
| `.neg` | lib method | yes | 1 | 1 | 1 |  |  | 3 |  |  |  | 6 | 102 | 73 | 73 | 73 (11) | 11 | census |
| `.outline` | lib method | yes |  | 2 | 2 |  |  | 2 |  |  |  | 6 | 217 | 18 | 6 | 6 (2) | 5 | census |
| `.setRel` | lib method | yes | 1 |  |  |  |  | 5 |  |  |  | 6 | 685 | 275 | 187 | 67 (16) | 19 | census |
| `H1` | lib element factory | yes | 1 | 2 | 2 |  |  |  | 1 |  |  | 6 | — | — | — | — | — | not counted |
| `Intersperse` | lib standalone | yes |  | 1 | 1 |  |  | 1 |  |  | 3 | 6 | 16 | 13 | 13 | 13 (6) | 6 | census |
| `.build` | lib member (HxResponse) | yes |  |  | 1 |  | 1 |  | 3 |  |  | 5 | 114 | 50 | 32 | 25 (10) | 15 | extra |
| `.cssClass` | lib method | yes | 1 | 1 | 1 |  |  | 2 |  |  |  | 5 | 164 | 132 | 26 | 25 (6) | 8 | census |
| `.focus` | lib method | yes | 1 | 2 | 2 |  |  |  |  |  |  | 5 | 359 | 154 | 97 | 97 (16) | 19 | census |
| `.setClass` | lib method | yes | 4 |  |  |  |  |  | 1 |  |  | 5 | 6081 | 130 | 86 | 85 (15) | 18 | census |
| `.setClosedby` | lib method | yes |  | 1 | 1 |  |  |  | 3 |  |  | 5 | 21 | 20 | 20 | 20 (10) | 10 | census |
| `.setCommand` | lib method | yes |  | 1 | 1 |  |  | 1 | 2 |  |  | 5 | 42 | 41 | 41 | 41 (10) | 10 | census |
| `.setCommandfor` | lib method | yes |  | 1 | 1 |  |  | 1 | 2 |  |  | 5 | 42 | 41 | 41 | 41 (10) | 10 | census |
| `.setPopovertarget` | lib method | yes |  | 1 | 1 |  |  | 1 | 2 |  |  | 5 | 15 | 9 | 9 | 9 (4) | 4 | census |
| `.transition` | lib method | yes | 2 | 1 | 1 |  |  | 1 |  |  |  | 5 | 3125 | 1150 | 707 | 679 (16) | 19 | census |
| `.trigger` | lib member (HxResponse) | yes |  |  |  |  | 1 |  | 4 |  |  | 5 | 83 | 43 | 19 | 19 (9) | 13 | extra |
| `Option` | lib element factory | yes |  | 1 | 1 |  |  | 3 |  |  |  | 5 | — | — | — | — | — | not counted |
| `.anchorName` | lib method | yes |  | 1 | 1 |  |  | 1 | 1 |  |  | 4 | 25 | 10 | 6 | 6 (4) | 5 | census |
| `.bgLinear` | lib method | yes |  | 1 | 1 |  |  | 2 |  |  |  | 4 | 48 | 37 | 21 | 20 (6) | 7 | census |
| `.maxW` | lib method | yes | 1 |  |  |  |  | 1 |  |  | 2 | 4 | 3076 | 1174 | 754 | 647 (16) | 19 | census |
| `.positionAnchor` | lib method | yes |  | 1 | 1 |  |  | 1 | 1 |  |  | 4 | 12 | 4 | 4 | 4 (3) | 3 | census |
| `.positionArea` | lib method | yes |  | 1 | 1 |  |  | 1 | 1 |  |  | 4 | 18 | 4 | 4 | 4 (3) | 3 | census |
| `.ring` | lib method | yes | 1 | 1 | 1 |  |  | 1 |  |  |  | 4 | 467 | 148 | 96 | 96 (5) | 8 | census |
| `.setEnctype` | lib method | yes |  | 2 | 1 |  |  |  | 1 |  |  | 4 | 82 | 57 | 49 | 2 (2) | 18 | census |
| `.setPlaceholder` | lib method | yes | 1 |  |  |  |  | 3 |  |  |  | 4 | 1409 | 458 | 245 | 243 (14) | 17 | census |
| `assetUrl` | lib standalone | yes | 1 |  | 1 |  |  |  | 2 |  |  | 4 | 485 | 383 | 315 | 71 (10) | 18 | census |
| `Dialog` | lib element factory | yes |  | 1 | 1 |  |  |  | 2 |  |  | 4 | — | — | — | — | — | not counted |
| `Link` | lib element factory | yes |  |  |  |  |  | 4 |  |  |  | 4 | — | — | — | — | — | not counted |
| `LoaderButton` | template ui component | no (template) |  | 1 | 1 |  |  |  | 2 |  |  | 4 | 97 | 74 | 66 | 24 (15) | 16 | extra |
| `Meta` | lib element factory | yes |  |  |  |  |  | 4 |  |  |  | 4 | — | — | — | — | — | not counted |
| `.addChild` | lib method | yes |  |  |  |  |  | 3 |  |  |  | 3 | 3 | 3 | 3 | 3 (2) | 2 | census |
| `.font` | lib method | yes | 2 |  |  |  |  |  |  |  | 1 | 3 | 13547 | 4812 | 3424 | 3376 (16) | 19 | census |
| `.gradient` | lib method | yes |  | 1 | 1 |  |  | 1 |  |  |  | 3 | 22 | 1 | 1 | 1 (1) | 1 | census |
| `.hxGet` | lib method | yes |  |  |  |  |  |  | 3 |  |  | 3 | 77 | 3 | 3 | 3 (1) | 1 | census |
| `.leading` | lib method | yes | 1 |  |  |  |  | 2 |  |  |  | 3 | 1518 | 803 | 787 | 781 (16) | 19 | census |
| `.mt` | lib method | yes | 1 | 1 | 1 |  |  |  |  |  |  | 3 | 528 | 528 | 496 | 491 (6) | 8 | census |
| `.setCite` | lib method | yes |  |  |  |  |  | 3 |  |  |  | 3 | 0 | 0 | 0 | 0 (0) | 0 | census |
| `.setContent` | lib method | yes | 1 |  |  |  |  | 2 |  |  |  | 3 | 942 | 485 | 289 | 267 (16) | 19 | census |
| `.setDataAttrs` | lib method | yes |  |  |  |  |  | 3 |  |  |  | 3 | 213 | 186 | 182 | 164 (8) | 17 | census |
| `.setFill` | lib method | yes | 1 |  |  |  |  | 2 |  |  |  | 3 | 938 | 371 | 211 | 210 (16) | 19 | census |
| `.setFormmethod` | lib method | yes |  | 1 | 1 |  |  |  | 1 |  |  | 3 | 1 | 1 | 1 | 1 (1) | 1 | census |
| `.setValue` | lib method | yes | 1 |  |  |  |  | 2 |  |  |  | 3 | 1451 | 315 | 113 | 112 (15) | 18 | census |
| `.setX` | lib method | yes |  |  |  |  |  | 3 |  |  |  | 3 | 591 | 322 | 242 | 238 (16) | 19 | census |
| `.setY` | lib method | yes |  |  |  |  |  | 3 |  |  |  | 3 | 589 | 322 | 242 | 238 (16) | 19 | census |
| `HtmxConfig` | lib standalone | yes |  |  |  |  |  | 1 | 2 |  |  | 3 | 72 | 29 | 17 | 1 (1) | 19 | extra |
| `Nav` | lib element factory | yes |  |  |  |  |  | 1 |  |  | 2 | 3 | — | — | — | — | — | not counted |
| `.block` | lib method | yes | 2 |  |  |  |  |  |  |  |  | 2 | 1522 | 682 | 489 | 487 (16) | 19 | census |
| `.checkbox` | lib member (FormBinding) | yes |  |  |  |  |  | 2 |  |  |  | 2 | 65 | 49 | 47 | 47 (16) | 17 | extra |
| `.disabled` | lib method | yes |  | 1 | 1 |  |  |  |  |  |  | 2 | 63 | 40 | 38 | 38 (15) | 16 | census |
| `.from` | lib method | yes |  |  |  |  |  | 2 |  |  |  | 2 | 189 | 81 | 23 | 22 (7) | 10 | census |
| `.grid` | lib method | yes | 2 |  |  |  |  |  |  |  |  | 2 | 1398 | 601 | 468 | 465 (15) | 18 | census |
| `.gridCols` | lib method | yes | 1 |  |  |  |  | 1 |  |  |  | 2 | 1691 | 374 | 264 | 264 (14) | 17 | census |
| `.h` | lib method | yes | 1 |  |  |  |  | 1 |  |  |  | 2 | 3284 | 1252 | 970 | 931 (16) | 19 | census |
| `.hidden` | lib method | yes | 1 |  |  |  |  | 1 |  |  |  | 2 | 772 | 323 | 229 | 220 (16) | 19 | census |
| `.htmxIndicator` | lib method | yes |  |  |  |  |  |  | 2 |  |  | 2 | 40 | 23 | 17 | 1 (1) | 18 | census |
| `.hxPost` | lib method | yes |  |  |  |  |  |  | 2 |  |  | 2 | 42 | 0 | 0 | 0 (0) | 0 | census |
| `.minH` | lib method | yes |  | 1 | 1 |  |  |  |  |  |  | 2 | 453 | 229 | 181 | 162 (16) | 19 | census |
| `.radio` | lib member (FormBinding) | yes |  |  |  |  |  | 2 |  |  |  | 2 | 34 | 22 | 22 | 22 (7) | 7 | extra |
| `.select` | lib method | yes |  |  |  |  |  | 1 | 1 |  |  | 2 | 258 | 160 | 121 | 92 (14) | 19 | census |
| `.setAction` | lib method | yes |  |  |  |  |  | 1 | 1 |  |  | 2 | 72 | 15 | 13 | 13 (9) | 10 | census |
| `.setAria` | lib method | yes |  |  |  |  |  | 2 |  |  |  | 2 | 637 | 487 | 460 | 456 (14) | 17 | census |
| `.setAs` | lib method | yes |  |  |  |  |  | 2 |  |  |  | 2 | 32 | 22 | 22 | 3 (2) | 11 | census |
| `.setDatetime` | lib method | yes |  |  |  |  |  | 2 |  |  |  | 2 | 0 | 0 | 0 | 0 (0) | 0 | census |
| `.setFetchPriority` | lib method | yes |  |  |  |  |  |  |  | 2 |  | 2 | 15 | 8 | 8 | 3 (3) | 7 | census |
| `.setMethod` | lib method | yes |  |  |  |  |  | 1 | 1 |  |  | 2 | 73 | 16 | 14 | 14 (9) | 10 | census |
| `.setMin` | lib method | yes |  |  |  |  |  | 2 |  |  |  | 2 | 123 | 49 | 49 | 49 (8) | 8 | census |
| `.setStyles` | lib method | yes | 1 |  |  |  |  | 1 |  |  |  | 2 | 694 | 231 | 151 | 151 (13) | 16 | census |
| `.setTarget` | lib method | yes |  |  |  |  |  | 2 |  |  |  | 2 | 199 | 84 | 72 | 51 (11) | 18 | census |
| `.sm` | lib method | yes | 1 |  |  |  |  | 1 |  |  |  | 2 | 2032 | 959 | 521 | 490 (13) | 19 | census |
| `.textShadow` | lib method | yes |  | 1 | 1 |  |  |  |  |  |  | 2 | 0 | 0 | 0 | 0 (0) | 0 | census |
| `.z` | lib method | yes |  | 1 | 1 |  |  |  |  |  |  | 2 | 370 | 106 | 86 | 63 (11) | 19 | census |
| `Head` | lib element factory | yes |  |  |  |  |  | 1 | 1 |  |  | 2 | — | — | — | — | — | not counted |
| `Header` | lib element factory | yes |  |  |  |  |  |  |  |  | 2 | 2 | — | — | — | — | — | not counted |
| `Iframe` | lib element factory | yes |  |  |  |  |  | 2 |  |  |  | 2 | — | — | — | — | — | not counted |
| `InputTag` | lib class | yes |  |  |  |  |  | 2 |  |  |  | 2 | — | — | — | — | — | not counted |
| `RawString` | lib class | yes |  |  |  |  | 1 | 1 |  |  |  | 2 | — | — | — | — | — | not counted |
| `Script` | lib element factory | yes |  |  |  |  |  | 1 | 1 |  |  | 2 | — | — | — | — | — | not counted |
| `Select` | lib element factory | yes |  |  |  |  |  | 1 | 1 |  |  | 2 | — | — | — | — | — | not counted |
| `SelectTag` | lib class | yes |  |  |  |  |  | 2 |  |  |  | 2 | — | — | — | — | — | not counted |
| `TextareaTag` | lib class | yes |  |  |  |  |  | 2 |  |  |  | 2 | — | — | — | — | — | not counted |
| `.absolute` | lib method | yes | 1 |  |  |  |  |  |  |  |  | 1 | 464 | 165 | 165 | 165 (10) | 10 | census |
| `.alignItems` | DOES NOT EXIST (8.1.0 or template) | NO |  |  |  |  |  |  |  |  | 1 | 1 | — | — | — | — | — | not counted — gl/views.md:84 (✓ shared-styling example); pre-7 name, renamed to .items in 7.0.0 |
| `.bgConic` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 0 | 0 | 0 | 0 (0) | 0 | census |
| `.bgRadial` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 2 | 2 | 2 | 2 (1) | 1 | census |
| `.fill` | lib method | yes | 1 |  |  |  |  |  |  |  |  | 1 | 615 | 482 | 438 | 404 (10) | 15 | census |
| `.fixed` | lib method | yes | 1 |  |  |  |  |  |  |  |  | 1 | 145 | 42 | 30 | 13 (6) | 19 | census |
| `.getHeaders` | lib member (HxResponse) | yes |  |  |  |  |  |  | 1 |  |  | 1 | — | — | — | — | — | not counted |
| `.group` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 198 | 131 | 105 | 104 (16) | 19 | census |
| `.groupHover` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 143 | 95 | 55 | 55 (11) | 14 | census |
| `.inlineBlock` | lib method | yes | 1 |  |  |  |  |  |  |  |  | 1 | 559 | 224 | 153 | 153 (16) | 19 | census |
| `.items` | lib method | yes | 1 |  |  |  |  |  |  |  |  | 1 | 6786 | 2272 | 1780 | 1713 (16) | 19 | census |
| `.justify` | lib method | yes | 1 |  |  |  |  |  |  |  |  | 1 | 3400 | 1076 | 767 | 752 (16) | 19 | census |
| `.lg` | lib method | yes | 1 |  |  |  |  |  |  |  |  | 1 | 1644 | 877 | 579 | 551 (14) | 19 | census |
| `.m` | lib method | yes | 1 |  |  |  |  |  |  |  |  | 1 | 16358 | 5605 | 3610 | 3563 (16) | 19 | census |
| `.overflow` | lib method | yes | 1 |  |  |  |  |  |  |  |  | 1 | 1169 | 505 | 357 | 357 (16) | 19 | census |
| `.peer` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 30 | 18 | 14 | 14 (6) | 7 | census |
| `.peerChecked` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 14 | 13 | 11 | 11 (5) | 6 | census |
| `.py` | lib method | yes | 1 |  |  |  |  |  |  |  |  | 1 | 224 | 224 | 192 | 190 (8) | 11 | census |
| `.refresh` | lib member (HxResponse) | yes | 1 |  |  |  |  |  |  |  |  | 1 | — | — | — | — | — | not counted |
| `.relative` | lib method | yes | 1 |  |  |  |  |  |  |  |  | 1 | 583 | 209 | 185 | 183 (15) | 18 | census |
| `.setAllow` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 6 | 1 | 1 | 1 (1) | 1 | census |
| `.setAlt` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 355 | 131 | 73 | 63 (10) | 15 | census |
| `.setCharset` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 182 | 66 | 34 | 18 (14) | 19 | census |
| `.setCrossOrigin` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 44 | 25 | 23 | 3 (2) | 17 | census |
| `.setCx` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 305 | 153 | 131 | 131 (16) | 19 | census |
| `.setCy` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 305 | 153 | 131 | 131 (16) | 19 | census |
| `.setD` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 264 | 152 | 152 | 150 (13) | 13 | census |
| `.setFontSize` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 287 | 106 | 44 | 44 (6) | 10 | census |
| `.setFor` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 214 | 99 | 43 | 43 (16) | 19 | census |
| `.setHeaders` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 0 | 0 | 0 | 0 (0) | 0 | census |
| `.setHeight` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 263 | 151 | 133 | 121 (16) | 19 | census |
| `.setImagesizes` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 2 | 0 | 0 | 0 (0) | 0 | census |
| `.setImagesrcset` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 2 | 0 | 0 | 0 (0) | 0 | census |
| `.setLang` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 96 | 39 | 23 | 6 (3) | 19 | census |
| `.setLoading` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 80 | 44 | 42 | 35 (8) | 9 | census |
| `.setMax` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 77 | 29 | 29 | 29 (8) | 8 | census |
| `.setMedia` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 0 | 0 | 0 | 0 (0) | 0 | census |
| `.setPopovertargetaction` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 4 | 3 | 3 | 3 (3) | 3 | census |
| `.setR` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 263 | 141 | 119 | 119 (16) | 19 | census |
| `.setRows` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 194 | 71 | 53 | 53 (14) | 17 | census |
| `.setRx` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 206 | 105 | 87 | 83 (16) | 19 | census |
| `.setSandbox` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 1 | 0 | 0 | 0 (0) | 0 | census |
| `.setScope` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 10 | 10 | 10 | 10 (2) | 2 | census |
| `.setStep` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 87 | 38 | 36 | 36 (8) | 9 | census |
| `.setStroke` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 425 | 172 | 92 | 92 (16) | 19 | census |
| `.setTextAnchor` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 365 | 177 | 115 | 115 (15) | 18 | census |
| `.setWidth` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 394 | 205 | 149 | 137 (16) | 19 | census |
| `.setX1` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 126 | 76 | 60 | 60 (16) | 19 | census |
| `.setX2` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 126 | 76 | 60 | 60 (16) | 19 | census |
| `.setY1` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 126 | 76 | 60 | 60 (16) | 19 | census |
| `.setY2` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 126 | 76 | 60 | 60 (16) | 19 | census |
| `.shrink` | lib method | yes | 1 |  |  |  |  |  |  |  |  | 1 | 1204 | 496 | 438 | 427 (16) | 19 | census |
| `.static` | lib method | yes | 1 |  |  |  |  |  |  |  |  | 1 | 0 | 0 | 0 | 0 (0) | 0 | census |
| `.sticky` | lib method | yes | 1 |  |  |  |  |  |  |  |  | 1 | 101 | 54 | 30 | 25 (9) | 14 | census |
| `.textarea` | lib member (FormBinding) | yes |  |  |  |  |  | 1 |  |  |  | 1 | 103 | 70 | 68 | 68 (14) | 15 | extra |
| `.to` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 189 | 81 | 23 | 22 (7) | 10 | census |
| `.tracking` | lib method | yes | 1 |  |  |  |  |  |  |  |  | 1 | 1639 | 690 | 602 | 587 (15) | 18 | census |
| `.uppercase` | lib method | yes | 1 |  |  |  |  |  |  |  |  | 1 | 1195 | 438 | 360 | 348 (16) | 19 | census |
| `.viewTransitionName` | lib method | yes |  |  |  |  |  | 1 |  |  |  | 1 | 14 | 0 | 0 | 0 (0) | 0 | census |
| `AnchorTag` | lib class | yes |  |  |  |  |  | 1 |  |  |  | 1 | — | — | — | — | — | not counted |
| `Base` | lib element factory | yes |  |  |  |  |  | 1 |  |  |  | 1 | — | — | — | — | — | not counted |
| `Blockquote` | lib element factory | yes |  |  |  |  |  | 1 |  |  |  | 1 | — | — | — | — | — | not counted |
| `Body` | lib element factory | yes |  |  |  |  |  | 1 |  |  |  | 1 | — | — | — | — | — | not counted |
| `Br` | lib element factory | yes |  |  |  |  |  | 1 |  |  |  | 1 | — | — | — | — | — | not counted |
| `ButtonTag` | lib class | yes |  |  |  |  |  | 1 |  |  |  | 1 | — | — | — | — | — | not counted |
| `Circle` | lib element factory | yes |  |  |  |  |  | 1 |  |  |  | 1 | — | — | — | — | — | not counted |
| `closest` | lib standalone | yes |  |  |  |  |  |  | 1 |  |  | 1 | — | — | — | — | — | not counted |
| `Del` | lib element factory | yes |  |  |  |  |  | 1 |  |  |  | 1 | — | — | — | — | — | not counted |
| `El` | lib standalone | yes |  |  |  |  |  | 1 |  |  |  | 1 | 112 | 0 | 0 | 0 (0) | 0 | extra |
| `find` | lib standalone | yes |  |  |  |  | 1 |  |  |  |  | 1 | — | — | — | — | — | not counted |
| `FormTag` | lib class | yes |  |  |  |  |  | 1 |  |  |  | 1 | — | — | — | — | — | not counted |
| `H2` | lib element factory | yes |  |  |  |  |  |  |  |  | 1 | 1 | — | — | — | — | — | not counted |
| `Hr` | lib element factory | yes |  |  |  |  |  | 1 |  |  |  | 1 | — | — | — | — | — | not counted |
| `HTML` | lib element factory | yes |  |  |  |  |  | 1 |  |  |  | 1 | — | — | — | — | — | not counted |
| `ImgTag` | lib class | yes |  |  |  |  |  | 1 |  |  |  | 1 | — | — | — | — | — | not counted |
| `Ins` | lib element factory | yes |  |  |  |  |  | 1 |  |  |  | 1 | — | — | — | — | — | not counted |
| `Label` | lib element factory | yes |  |  |  |  |  | 1 |  |  |  | 1 | — | — | — | — | — | not counted |
| `Line` | lib element factory | yes |  |  |  |  |  | 1 |  |  |  | 1 | — | — | — | — | — | not counted |
| `Output` | lib element factory | yes |  |  |  |  |  | 1 |  |  |  | 1 | — | — | — | — | — | not counted |
| `Path` | lib element factory | yes |  |  |  |  |  | 1 |  |  |  | 1 | — | — | — | — | — | not counted |
| `Q` | lib element factory | yes |  |  |  |  |  | 1 |  |  |  | 1 | — | — | — | — | — | not counted |
| `Raw` | lib standalone | yes |  |  |  |  |  | 1 |  |  |  | 1 | 1658 | 86 | 26 | 22 (5) | 8 | extra |
| `Rect` | lib element factory | yes |  |  |  |  |  | 1 |  |  |  | 1 | — | — | — | — | — | not counted |
| `renderWithNonce` | lib standalone | yes |  |  |  |  |  | 1 |  |  |  | 1 | 77 | 63 | 47 | 1 (1) | 17 | extra |
| `Repeat` | lib standalone | yes |  |  |  |  |  | 1 |  |  |  | 1 | 1 | 0 | 0 | 0 (0) | 0 | census |
| `Svg` | lib element factory | yes |  |  |  |  |  | 1 |  |  |  | 1 | — | — | — | — | — | not counted |
| `SvgShapeTag` | lib class | yes |  |  |  |  |  | 1 |  |  |  | 1 | — | — | — | — | — | not counted |
| `Td` | lib element factory | yes |  |  |  |  |  | 1 |  |  |  | 1 | — | — | — | — | — | not counted |
| `Text` | lib element factory | yes |  |  |  |  |  | 1 |  |  |  | 1 | — | — | — | — | — | not counted |
| `Textarea` | lib element factory | yes |  |  |  |  |  | 1 |  |  |  | 1 | — | — | — | — | — | not counted |
| `Th` | lib element factory | yes |  |  |  |  |  | 1 |  |  |  | 1 | — | — | — | — | — | not counted |
| `Use` | lib element factory | yes |  |  |  |  |  | 1 |  |  |  | 1 | — | — | — | — | — | not counted |
