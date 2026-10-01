---
rfc: RFC-B-01
lens: runtime-contract
verdict: survives-with-changes
confidence: 0.8
killer_objection: "The dev gate catches more than shapes that never worked, which the 8.1.x lane rule forbids. Four cast/JS-only shapes work today and would throw under the RFC: an uppercase method (hx-GET / hx-POST fire GET /team and POST /team/invite in both pinned bundles), a String-object endpoint (GET /team fires in both), and a JS setHtmx(null) clear, which today renders no hx attribute and under the RFC becomes an unnamed TypeError. A fifth, a request-less OOB bag (its OOB swap works in both bundles), also throws. The fleet census finds 0 sites for all of them, so a 3-line narrowing of the gate fixes this. It is not a reason to reject."
guardrail_killer: null
required_changes:
  - "dev-checks.ts/tag.ts: gate on truthiness, `if (htmx) assertRequestBag(this, htmx, method)`, mirroring serialize.ts:262 `if (thx)`. Today a JS/cast setHtmx(null) renders `<div>x</div>`; with the RFC it throws `TypeError: Cannot read properties of null (reading 'endpoint')`, and setHtmx(false) throws the named error."
  - "assertRequestBag: match the method case-insensitively, `typeof htmx.method === \"string\" && HX_METHODS.has(htmx.method.toLowerCase())`. 8.1.0 emits `hx-GET=\"/team\"` / `hx-POST=\"/team/invite\"`, and both fire in htmx.org 4.0.0-beta6 and the template's 4.0.0. The check still rejects undefined and \"get x\". When method is a string outside the set, the message names the 5 valid methods instead of saying 'no request'."
  - "assertRequestBag: accept `typeof htmx.endpoint === \"string\" || htmx.endpoint instanceof String`. The check still rejects undefined (the uncalled callable) and a function (hxGet(routes.x) uncalled, which renders the function source into hx-get)."
  - "test/dev-checks.test.ts: add 2 passing cases: an uppercase-method bag does not throw, and setHtmx(null as never) renders no hx attribute."
  - "RFC Problem section: correct '9/10 are inert (0 requests, 0 console lines)'. Form().submit(\"/team/invite\") on 8.1.0 does a native full-page GET to the current URL (/start?) in both bundles. $R/oracle.mjs fulfils non-hx documents without recording them. Corrected tally: 8/10 inert, 1 native reload, 1 GET /undefined. Fix the harness to record document navigations."
  - "CHANGELOG (8.1.x): record the one deliberate dev-only narrowing beyond 'never worked'. A cast request-less bag (`{ swapOob: \"true\" } as HTMX`) renders hx-undefined but still performs its OOB swap in both bundles, and it now throws under devChecks. Fleet: 0 `swapOob:` sites in 16 canonical-era repos."
  - "Keep production untouched. Open question 1 (a prod method guard in buildHtmx) stays out of 8.1.x."
executed:
  - cmd: "diff -rq fluent-html/src $R/lib/src; dist hash diff 8.1.0 vs RFC build"
    output: "only core/dev-checks + core/tag differ; serialize.js sha 2242013a identical in all three builds"
  - cmd: "transpileModule(template swap-verbs.ts) vs RFC swap-verbs.D.ts"
    output: "emitted JS 4017 vs 4017 bytes, identical=true (TS 6.0.3); the diff touches only the declare-module block"
  - cmd: "NODE_ENV=test tsx probe.ts in a81 (8.1.0) and arfc (RFC lib + verbs); node cmp.mjs"
    output: "valid 27/27 byte-identical (3616 B); template views 64/64 identical once stack paths are stripped (56 render, 50916 B); wrong shapes 11/11 throw on RFC"
  - cmd: "NODE_ENV=production tsx probe.ts (both)"
    output: "valid 27/27, views 64/64, edge 19/19 identical; W01 still emits hx-undefined in prod"
  - cmd: "node oracle.mjs (Chromium; htmx.org 4.0.0-beta6 + template public/js/htmx.min.js 4.0.0)"
    output: "RFC valid 23/24 fire the expected request in both bundles (the miss is cross-origin externalUrl, bytes identical to 8.1.0); 8.1.0 wrong: 9/11 inert, Form submit -> NATIVE GET /start?, uncalled -> GET /undefined; X03 hx-GET -> GET /team, X04 hx-POST -> POST, X05 String endpoint -> GET /team, X06 OOB-only -> swap applied, in both bundles"
  - cmd: "node hxnames.mjs (vs wave0-3 runtime-oracle.json) + inherit.mjs"
    output: "16 hx names, same as 8.1.0 with the same site counts; 16/16 read by both bundles (hx-headers:inherited via a browser row); 20/20 swap/trigger values identical"
  - cmd: "tsx twcheck.ts (tailwindcss 4.3.3 pinned loader + scaffold @theme)"
    output: "108 distinct classes RFC == 8.1.0; oracle pass 108/108"
  - cmd: "NODE_ENV=development tsx stack.ts"
    output: "nav: assertRequestBag < _setHx < p.setHtmx < p.nav (frame #4) < call site; setHtmx(null): TypeError reading 'endpoint'"
  - cmd: "NODE_ENV=production tsx gate.ts (spy on 8.1.0 _setHx, RFC vs proposed predicate)"
    output: "valid 8/8 pass both; X01/X03/X04/X05 RFC=THROW, proposed=pass; W01/W02/W09/W10/X06/X08/X09 throw under both"
  - cmd: "rg census over 16 canonical-era repos (casts to HTMX, swapOob/boost/preserve/ignore, uppercase method in bag context)"
    output: "0 fleet sites; only the vendored search `... as HTMX` (route callables)"
  - cmd: "vitest run --project unit (RFC app copy, RFC lib)"
    output: "35 files, 403/403 pass"
  - cmd: "node --test $(cat $R/lib-testfiles.txt) in $R/lib"
    output: "2165/2165 pass"
---

# Verdict: RFC-B-01 — runtime-contract lens

> You are an ADVERSARY. Kill this RFC through the runtime-contract lens. Default to `reject` under
> uncertainty. Reading code is not verification: execute.

Scratch: `$W = <scratch>/wave3/RFC-B-01-runtime-contract`
(`a81` = teamapp scaffold, 8.1.0 pack and template HEAD verbs; `arfc` = the same with `$R/lib` (RFC build) and `swap-verbs.D.ts`).

## What I executed

1. **Source identity.** The RFC lib differs from HEAD in `src/core/dev-checks.ts` and `src/core/tag.ts` only, and in dist only `core/dev-checks.js` and `core/tag.js`. `serialize.js` has sha `2242013a` in the 8.1.0 dist, the teamapp pack and the RFC build alike. The RFC verbs change only the declare-module block. `ts.transpileModule` gives identical JS for both verb files (4017 B each), so the template half has no runtime footprint.
2. **Byte diff, dev checks on** (`NODE_ENV=test`, `$W/probe.ts`):
   - 27 valid call shapes: 27/27 identical. They cover all 8 verbs, `{ invalid }`, multipart, put/patch/delete, query, `hx()`, `setHtmx` both overloads, `hxGet`/`hxPost` and clear.
   - Every exported view or component in `src/app`, `src/shared` and `src/core/layout`, called with `{}`: 64/64 identical once stack paths are stripped. 56 render (50,916 B identical) and 8 throw identically on missing props.
3. **Byte diff, production.** Valid 27/27, views 64/64 and edge 19/19 are identical. Production bytes are unchanged, including the pre-existing `hx-undefined` output and `<a hx-get x="/team">` for `method: "get x"`.
4. **htmx names vs pinned bundles** (`$W/hxnames.mjs` against `wave0-3/runtime-oracle.json`):
   - The corpus emits 16 `hx-*` names, the same set with the same per-name site counts as 8.1.0.
   - All 16 are read by htmx.org 4.0.0-beta6 and by the template's 4.0.0. `hx-headers:inherited` is missing from the wave-0 oracle, so `$W/inherit.mjs` checked it directly: the header reaches a descendant request in both bundles.
   - The 20 distinct swap/trigger/sync/target/status values are identical.
5. **Chromium rows** (`$W/oracle.mjs`, playwright-core, both bundles, recording htmx requests and native document requests):
   - RFC-rendered valid markup: 23/24 fire the expected method and path in both bundles. The miss is `setHtmx(externalUrl("https://example.com/a"))`, a cross-origin request with bytes identical to 8.1.0.
   - 8.1.0 wrong shapes: 9/11 inert. `Form().submit("/team/invite")` is **not** inert: it does a native full-page `GET /start?`. The uncalled callable sends `GET /undefined` and moves the URL there.
6. **Tailwind oracle** (pinned 4.3.3 loader plus the scaffold `@theme`): 108 distinct classes in both 8.1.0 and RFC output (0 added, 0 removed), and 108/108 pass.
7. **Gate scoring** (`$W/a81/gate.ts`): a spy on 8.1.0 `Tag.prototype._setHx` captures every bag, which is then scored against the RFC predicate and against a proposed one.
8. **Stack** (`$W/arfc/stack.ts`, dev): the verb frame is #4 (`AnchorTag.p.nav`, `Tag.p.poll`) and the call site is #5. That confirms the RFC's claim that the stack shows the verb.
9. **Suites.** Template unit + view tests on the RFC lib: 403/403. RFC lib compiled tests: 2165/2165. The lib's Playwright acceptance app has 0 `setHtmx`/`hx(` calls, so it cannot exercise this gate; the Chromium rows in step 5 replace it.
10. **Fleet census** (16 canonical-era repos, dedup corpus):
    - Request-less or cast bags: 0. The only `as HTMX` is the vendored `search` implementation, which receives route callables.
    - `swapOob:`, `boost:`, `preserve: true` and `ignore: true`: 0.
    - An uppercase method in an HTMX bag context: 0.

## Attack

**1. The gate is wider than "never worked" (8.1.x lane rule, §4).** The RFC says that in dev, bytes change "only for bags that never sent a request". Measured, that is false for 4 shapes, all reachable only through a cast or JS:

| Shape (8.1.0 output) | Both bundles today | RFC (dev) | Proposed gate |
|---|---|---|---|
| `{...r.index(), method: "GET"}` -> `<a hx-GET="/team">` | GET /team fires (the HTML parser lowercases the name) | throws "no request (method: GET, endpoint: /team)" | pass |
| `hx(url, { method: "POST" })` -> `hx-POST` | POST fires | throws | pass |
| `endpoint: new String("/team")` -> `hx-get="/team"` | GET fires | throws | pass |
| `setHtmx(null)` -> `<div>x</div>` | no-op clear | `TypeError: Cannot read properties of null` | pass |
| `{ swapOob: "true" } as HTMX` -> `hx-undefined ... hx-swap-oob` | OOB swap applied (same as control) | throws | throws (documented) |

The fleet has 0 sites for every row, and production is unchanged, so this is a narrowing to fix, not a consumer break today. The message for the uppercase case also says "no request" while showing a valid request.

**2. One evidence error in the Problem section.** "9/10 are inert (0 requests, 0 console lines)" is wrong for `Form().submit(string)`: it does a native full-page GET in both bundles. The RFC's `oracle.mjs` serves non-hx document requests without recording them, so it cannot see that request. F-B-302 had this right. The conclusion still holds (the output is broken either way), but the tally must be corrected.

**3. Things I tried that did not land:**
- No new htmx name and no new class: 16/16 names and 108/108 classes unchanged.
- Valid bytes are identical in dev and in prod.
- Template behaviour is unchanged: 403/403 tests pass and the emitted verb JS is identical.
- Production is untouched.
- The dev deploy runs `NODE_ENV=development` (`deploy.sh:372`), so a cast wrong-shape would 500 there instead of rendering inert. The existing `assertMutable` throw already sets that precedent, and the census finds 0 cast sites.

## Does it survive?

**survives-with-changes.** From this lens the runtime contract holds: no emitted name, value or class changes, and every valid shape fires the same request in both pinned bundles. The defect is a gate predicate that is 3 lines too broad for the 8.1.x lane. The required changes in the frontmatter fix it: a truthiness guard, a case-insensitive method check, and accepting a String-object endpoint. They also add 2 tests, correct the form-submit evidence, and add a CHANGELOG line for the request-less OOB cast. Measured with the proposed predicate over captured bags: valid 8/8 pass, all 7 never-worked shapes still throw (string, `.resolve()`, uncalled callable, form string, `"get x"`, uncalled `hxGet`, request-less OOB), and the 4 working shapes pass.

## Guardrail check (if this lens owns one)

- **§10 Runtime-grammar contract: pass.** Every emitted htmx name (16/16) is read by htmx.org 4.0.0-beta6 and by the template's 4.0.0. Valid output is byte-identical (27/27 shapes and 64/64 views in dev; plus 19/19 edge shapes in prod). Every class (108/108) passes the pinned Tailwind 4.3.3 oracle.
- **§3 (touches):** the attribute-name channel `method: "get x"` -> `<a hx-get x="/team">` is closed in dev only. Production still emits it on both libs. This is pre-existing and not regressed; it belongs to open question 1 and the security lens.
- **§2:** not this lens. Production keeps the single `devChecks` boolean test, and `serialize.ts` is byte-identical.
