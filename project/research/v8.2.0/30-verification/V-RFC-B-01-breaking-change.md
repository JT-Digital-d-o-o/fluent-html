---
rfc: RFC-B-01
lens: breaking-change
verdict: survives-with-changes
confidence: 0.8
killer_objection: "The dev gate catches more than bags that never worked. It throws on 5 cast-only shapes that work or are harmless on 8.1.0: method \"GET\"/\"POST\" (hx-GET/hx-POST send requests in both pinned bundles), URL-object and String-object endpoints, and setHtmx(null), which throws an unnamed TypeError. The 8.1.x lane claim is false as written. No measured consumer breaks (0 fleet sites, 12/12 repos and the template are green)."
guardrail_killer: null
required_changes:
  - "tag.ts _setHx: `if (htmx != null) assertRequestBag(this, htmx, method);` (loose null check, not `!== undefined`)."
  - "dev-checks.ts assertRequestBag: pass when `htmx.endpoint != null && typeof htmx.method === \"string\" && HX_METHODS.has(htmx.method.toLowerCase())`. Drop the `typeof endpoint === \"string\"` test."
  - "test/dev-checks.test.ts: add passing cases for {method:\"GET\"}, {method:\"POST\"}, a URL-object endpoint, a String-object endpoint and setHtmx(null)."
  - "RFC Lane & migration: correct the 'only bags that never sent a request' claim to what is measured, and state that the lib half reaches 11/14 canonical repos through their fluent-html#main dependency without a template sync (evidence: this verdict's 12-repo run)."
  - "RFC Lane & migration: record that gzs/stem-50's diverged onChange (options + targeted overload) takes a scripted signature patch at 8/9. Its sync must take the whole file."
executed:
  - cmd: "scratch lib copy + RFC diff: npm run build && node --test <scripts.test list>"
    output: "build exit 0; 2165/2165 (2159 + 6 new)"
  - cmd: "pt-rfc: vitest.compile.config.ts define-controller / resolved-route / full-stack / module-closure (npm install swapped for a node_modules overlay, fluent-html -> RFC lib, RFC verbs + 3 pins)"
    output: "45/45, 9/9, 33/33 combos unit+view, 28/28 boot, 3/3 sqlite integration; 12 full-stack tsc + 8 closure failures, all TS2883 tests/setup.ts"
  - cmd: "pt-base: same suites, unpatched"
    output: "42/42, 9/9, 33/33, 28, 3; identical 12 + 8 failure sets (TS2883, harness overlay artifact)"
  - cmd: "fleet-run.sh x12 canonical repos (tsc incl. tests + vitest --project unit, base vs RFC verbs + RFC lib)"
    output: "tsc 0/0 in 12/12; unit+view identical 12/12, 8,836 tests per side; patch 9/9 in 11, 8/9 stem-50"
  - cmd: "cast-shapes.mjs base|rfc|fix"
    output: "base renders 5/5; rfc throws 5/5 (null: unnamed TypeError); fix renders 5/5 as base"
  - cmd: "oracle-cast.mjs (Chromium, htmx 4.0.0-beta6 + template bundle)"
    output: "hx-GET -> GET /team, hx-POST -> POST /team, URL endpoint -> GET /team, both bundles"
  - cmd: "wrong-shapes.mjs rfc|fix + lib2 test list"
    output: "10/10 throw on both; lib2 2165/2165"
  - cmd: "fleet census (grep, 16 canonical trees)"
    output: "0 HTMX casts into sinks (besides the template's own .search impl), 0 setHtmx(null), 0 Parameters<Tag['nav']>-style refs, 0 non-HxHttpMethod methods; 11/14 on fluent-html#main"
  - cmd: "na-cent: tsc --declaration --emitDeclarationOnly; eslint --max-warnings=0 swap-verbs.ts"
    output: "0/0 and 0/0, base vs rfc"
---

# Verdict: RFC-B-01, breaking-change lens

> Adversary brief: kill this RFC through the breaking-change lens, and default to `reject` under
> uncertainty.

Scratch root: `$W = <scratch>/wave3/RFC-B-01-breaking-change`.
The RFC declares `codemod: none`. The "dry run" here applies the RFC's own type patch (`$R/fleet/patch.py`, checked against
`$R/swap-verbs.D.ts`) and its lib diff to scratch copies of the template and the live fleet, then runs each consumer's own
gates (tsc including tests, unit and view vitest, the template's compile-contract suites).

## What I executed

**1. Lib (scratch copy, my own build).** I applied the RFC diff to `src/core/dev-checks.ts`, `src/core/tag.ts` and
`test/dev-checks.test.ts` (+24/-2 src) and ran `npm run build` (exit 0). The full `scripts.test` file list passes
**2165/2165**. The real `dist/` was never touched.

**2. Template, `projects-template` copy (the dry run on the template).** In the copy:
- Each compile suite's `npm install` (which would pull `#main` from GitHub) was replaced by a symlink to a node_modules
  overlay built from the template's own install. In that overlay, `fluent-html` points to the RFC lib for `pt-rfc` and to
  the real 8.1.0 dist for `pt-base`.
- The RFC verbs were applied, plus the RFC's 3 compile pins.

| Suite | base (8.1.0) | RFC |
|---|---|---|
| define-controller-compile | 42/42 | **45/45** (42 + the 3 RFC pins) |
| resolved-route-compile | 9/9 | 9/9 |
| full-stack-compile: unit + view tests per module combo (NODE_ENV=test, gate on) | 33/33 | **33/33** |
| full-stack-compile: boot smoke / sqlite integration | 28 / 3 | 28 / 3 |
| full-stack-compile: `tsc` per combo | 12 fail | 12 fail, **identical set** |
| module-closure-compile | 8 fail | 8 fail, **identical set** |
| root: fluent-html-floor, guidelines-enforcement, template-lock, stamp-existing | 1 fail (no `.git`) | same 1 |

Every tsc failure on both sides is `tests/setup.ts: error TS2883` (vitest `Procedure` type portability under the
pnpm-realpath overlay), so it is a harness artifact. 0 lines of the RFC output mention `swap-verbs`, `NotARoute` or the hint.
The `route-prop-laundering` source-text pins and `probe-fragment-laundered-htmx` still pass. That is the measured form of
"no accepted value added".

**3. Live fleet (dry run on live repos, 12 of them).** For each repo, `fleet-run.sh` rsyncs a copy. The base run uses a
read-only node_modules overlay. The RFC run applies `patch.py` to the vendored verbs and points `fluent-html` to the RFC
lib. Each run executes `tsc --noEmit -p tsconfig.json` (every tsconfig includes `tests/**`) and `vitest run --project unit`.

| Repo | patch | tsc base/rfc | unit+view base | unit+view rfc |
|---|---|---|---|---|
| na-cent | 9/9 | 0/0 | 1045/1045 | 1045/1045 |
| competify | 9/9 | 0/0 | 595/595 | 595/595 |
| popri | 9/9 | 0/0 | 757/758 | 757/758 (same pre-existing `home.view` failure) |
| stojnica | 9/9 | 0/0 | 488 | 488 |
| fl-um | 9/9 | 0/0 | 535 | 535 |
| sportoawards | 9/9 | 0/0 | 535 | 535 |
| studio | 9/9 | 0/0 | 568 | 568 |
| competition | 9/9 | 0/0 | 727 (+6 skipped) | 727 (+6 skipped) |
| home-page | 9/9 | 0/0 | 755 | 755 |
| everyframe | 9/9 | 0/0 | 630 | 630 |
| fluent-html-home-page | 9/9 | 0/0 | 341 | 341 |
| gzs/stem-50 | **8/9** (skip: diverged `onChange(route, options?)` + targeted overload) | 0/0 | 1853 | 1853 |

Totals: 8,836 tests per side, identical. 2,398 verb text sites in src+tests. A sanity test in the na-cent copies confirms
which lib each run loaded: the base run renders `hx-undefined="undefined"` for `.nav("/team" as any)`, and the RFC run
throws the named error. The RFC's own wave-2 run already covered everyframe-composer and website-sales-funnel-automation-system.

Further checks on the na-cent copies, base vs RFC:
- Declaration emit: exit 0 on both sides; `NotARoute` is emitted into `swap-verbs.d.ts`.
- `eslint --max-warnings=0` on `swap-verbs.ts`: 0/0.

**4. Census (16 canonical-era trees).**
- 0 `as HTMX` / `as any` casts into an htmx sink, apart from the template's own `.search` implementation cast (16 copies).
- 0 `setHtmx(null)`.
- 0 type-level references to a verb signature (`Parameters<Tag["nav"]>`, `Tag["fragment"]`).
- 0 route `method` values outside the 5 `HxHttpMethod`s in `*.routes.ts`.
- Every non-verb `setHtmx` site passes a route-callable result or an `hx()` spread (e.g. stem-50 `toast.ts:84`,
  `thesis.sections.view.ts:109`).
- 11/14 canonical repos depend on `fluent-html: github:...#main`.

**5. Production path.** `projects-template/scripts/write-server-config.sh:112` writes `PassengerEnvVar NODE_ENV ${NODE_ENV_VALUE}`
(default `production`, `:33`), so the prod process starts with NODE_ENV=production and `devChecks` is off there. The
dev-server target runs NODE_ENV=development (`deploy.sh:372`), so the gate is on there.

## Attack

The RFC's lane argument is that emitted bytes change only in dev, "and only for bags that never sent a request". I fed the
gate the cast-only bags that 8.1.0 renders without complaint (`cast-shapes.mjs`), then checked those renders against the
pinned htmx bundles (`oracle-cast.mjs`):

| Shape (cast-only) | 8.1.0 render | Pinned bundles (beta6 + template) | RFC lib |
|---|---|---|---|
| `{ method: "GET", endpoint }` | `<a hx-GET="/team">` | **GET /team, swapped** | throws "no request (method: GET, endpoint: /team)" |
| `{ method: "POST", endpoint }` | `<a hx-POST="/team">` | **POST /team, swapped** | throws |
| URL-object endpoint | `<a hx-get="https://example.com/team">` | **GET sent** | throws |
| String-object endpoint | `<a hx-get="/team">` | works | throws |
| `setHtmx(null)` | `<a>Team</a>` (clears) | n/a | throws **`Cannot read properties of null (reading 'endpoint')`**, an unnamed TypeError |

So the gate is wider than the never-worked set the 8.1.x lane allows (§4 Lanes). The `null` case also slips past
`htmx !== undefined` and fails with an unnamed crash, not the RFC's sentence. The uppercase-method case gets a message
that is false on its face ("no request" while it names `/team`).

None of these shapes is reachable without a cast or JS. The census finds 0 of them in the canonical fleet, and every
consumer gate I ran is green. This is a correctness-of-scope defect, not a measured break. It is also cheap to close.

The type half has no breaking path that I could find:
- It widens each parameter by an unsatisfiable member, and the laundered-`HTMX` probe still fails.
- 12/12 repos are tsc-identical with tests included.
- 0 fleet code reads a verb's parameter type.
- Declaration emit and lint are unchanged.

One reach fact the RFC understates: 11/14 canonical repos take the lib on their next `npm install` through `#main`, with no
template sync. The runs above cover that path and show it is safe.

## Does it survive?

**Survives with changes.** Nothing broke: 0 consumers across the template (33 module combos, 54 compile-contract
assertions) and 12 live repos (8,836 tests). Two changes are needed before the lib half can claim the 8.1.x lane honestly.

I prototyped both in `$W/lib2`:
1. In `_setHx`, guard with `htmx != null`.
2. In `assertRequestBag`, pass when `htmx.endpoint != null && typeof htmx.method === "string" && HX_METHODS.has(htmx.method.toLowerCase())`.

Results of the prototype:
- 10/10 never-worked shapes still throw: string, `.resolve()`, uncalled GET and POST callables, `.path`, template literal,
  `{}`, number, method-only, and an injection-shaped method `"x onclick"`.
- 5/5 cast shapes render exactly as on 8.1.0.
- The lib test list passes 2165/2165.
- The attribute-name injection check survives, because `"x onclick".toLowerCase()` is not one of the 5 methods.

Required changes (also in frontmatter):
1. `_setHx`: `if (htmx != null) assertRequestBag(...)`.
2. `assertRequestBag`: `endpoint != null` plus a case-insensitive method membership test, in place of `typeof endpoint === "string"`.
3. Add 5 passing dev-check tests that pin the gate's scope (the GET, POST, URL-object, String-object and null shapes).
4. Correct the RFC's lane prose, and state the `#main` reach (11/14) with this run as its evidence.
5. Record stem-50's 8/9 scripted-patch skip. Its sync must take the whole `swap-verbs.ts`.

## Guardrail check (if this lens owns one)

- §11 (breaking = codemod-first): N/A. 0 valid calls change, measured on 12 live repos and on all 33 template module combos. No codemod is needed.
- §4 lane rule (8.1.x: bytes change only for what never worked): as written it is violated for 5 cast-only shapes. With required changes 1 and 2 it holds, and the prototype shows it.
- No §5 guardrail is the killer.
