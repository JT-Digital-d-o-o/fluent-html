---
rfc: RFC-A-05
lens: agent-fitness
verdict: survives-with-changes
confidence: 0.76
killer_objection: "As written, `HxResponse.location(string)` always emits the object form. That changes the emitted bytes of a value that works today (`location(\"/items/5\")` becomes `{\"path\":\"/items/5\"}`), in an 8.1.x lane whose rule is that bytes change only to fix something that never worked. It also breaks the header assertion a model writes from htmx's documented form: `hx-location === \"/items/5\"` passes on 8.1.0 and fails on the prototype. A plain-path whitelist fixes this. Plain paths keep their bare bytes, and both bundles read them as paths: 0 misreads across 147,821 fuzzed strings, with the shipped test/patterns.ts:143 pin left untouched (2166/2166)."
guardrail_killer: null
required_changes:
  - "HxResponse.location(string): run sanitizeUrl, then emit the bare string when it matches /^\\/(?!\\/)[!#$%&()*+\\-./0-9;=?@A-Z[\\]^_`a-z|~]*$/ (a root-relative ASCII path with no whitespace, comma, colon, quotes, braces or backslash). Otherwise emit the object form {\"path\":…}. The diff is at $V/required-change.diff (+5/-3 in src/patterns.ts). Drop the test/patterns.ts:143 re-pin, set htmx-js-sinks.test.ts:56 to expect \"/dashboard\", and rename that test, which currently says 'always the object form'."
  - "Restate the converge bullet 'HX-Location encoding', the lane-table row and open question 3 to match: the object form now applies only to strings that never worked. Those are L4/L5/L6, plus non-Latin-1 paths: location(\"/čevlji\") returns Fastify 500 ERR_INVALID_CHAR on 8.1.0 and 200 in object form."
  - "Land the REFERENCE.md and CHANGELOG edits the RFC lists. The prototype has none (0-byte diff). Name the htmx sinks and js: in REFERENCE.md:1342-1345 and in the Blocked list at :1384-1386. Add no guideline line, so guideline_delta stays -1."
executed:
  - cmd: "run.sh (wave0-2 withholding, claude-opus-5-5 xhigh, --tools Write) x4 in empty cwds, task-pp.txt"
    output: "confirm 4/4 plain text, 0/4 js:; live value 4/4 include '#sort', 0/4 js: vals; HX-Redirect/HX-Location 8/8 hand-written reply.header, 0/8 hxResponse"
  - cmd: "tsc + render of pp1..pp4 on dist-base vs RFC lib"
    output: "tsc errors identical 12/24/20/13; render output byte-identical"
  - cmd: "npx eslint on the pure-prior reply.header guess in a template copy"
    output: "2 errors template/no-manual-hx-headers, steering to hxResponse(...).redirect()"
  - cmd: "htmx-2-prior fixture (js: confirm, js: vals) on base vs proto"
    output: "base: 0 diagnostics, emits js: verbatim; proto: dev throw, fix at char 124 of 146 (confirm) / 121 of 206 (vals)"
  - cmd: "run.sh repair rounds r-confirm x3, r-vals x3, r-verb x3 (error + view file only)"
    output: "9/9 one-shot; the 6 rendered fixes compile with tsc 0 and render without throwing on the prototype"
  - cmd: "node loc-test.mjs (model-style hx-location assertion) on base / proto / lib2"
    output: "PASS / FAIL ('{\"path\":\"/items/5\"}') / PASS"
  - cmd: "node hcon-fuzz.mjs (both bundles' HCON + HX-Location sniff)"
    output: "147821 whitelisted strings x 2 bundles, 0 read as config"
  - cmd: "lib2: npx tsc; node --test (36 files + htmx-js-sinks)"
    output: "2166/2166; test/patterns.ts byte-identical to shipped"
---

# Verdict: RFC-A-05, agent-fitness lens

`$V` = `<scratch>/wave3/RFC-A-05-agent-fitness`. `$W` = the RFC's prototype dir (`wave2/RFC-A-05`). `lib2` = `$W/lib` plus the required change, built in `$V/lib2`.

## What I executed

### 1. Pure-prior guess (the lens's MUST)

I ran the wave0-2 withholding harness (`env -i`, `--restricted`, deny rules, `claude-opus-5-5 --effort xhigh`, `--tools Write`) 4 times, each in an empty cwd with no docs, from `$V/task-pp.txt`. The task asks for four things:

- a Delete button that confirms with the item's name
- a "Load more" button that sends the next page plus the live value of a sort `<select>`
- a `POST /login` that redirects to `next`
- a `POST /items` that navigates the client using htmx response headers

All 4 runs exited with rc 0, in 177, 269, 212 and 281 s.

| Sink | What the model wrote first | Count |
|---|---|---|
| `confirm` | plain text `` `Delete ${item.name}?` `` | 4/4. 0/4 used `js:`. pp2 comments that the "Delete " prefix keeps clear of htmx 4's `js:` prefix. |
| live select value | `include: "#sort"`, plus `vals: { page }` (3) or a JSON string via `setAttribute` (1) | 4/4. 0/4 used `js:` vals. |
| HX-Redirect / HX-Location | hand-written `reply.header("HX-…", …)` | 8/8 sites. 0/8 went through `hxResponse`. 4/4 validate `next` themselves. |

These runs compiled against `dist-base` and against the RFC lib with identical type errors: 12, 24, 20 and 13. Their first errors are unrelated to this RFC (TS2724 `Html`, TS2339 `setAttr`, and TS2345 raw string not assignable to `ResolvedRoute | ExternalHref`). Their render output is byte-identical between base and prototype.

So the RFC neither helps nor hurts the pure-prior guess, which never hits a `js:` sink. It adds no new error to it.

In a template copy, the pure-prior `reply.header("HX-Redirect"|"HX-Location", …)` draws 2 `template/no-manual-hx-headers` errors, and they steer the model to `hxResponse(...).redirect()`. That is the builder this RFC sanitizes, so the lint routes the pure-prior header guess into the protected sink.

### 2. The guess the dev throw targets (htmx-2 prior, 3 fleet sites in `tela`)

The fixture is `$V/repair-src/{confirm,vals}.view.ts`:

- `confirm: \`js:confirm("Delete ${name}?")\``
- `vals: \`js:{page: N, sort: document.getElementById("sort").value}\``

Both compile with 0 type errors on base and on the prototype.

- **Base:** renders silently and emits `hx-confirm="js:…"` and `hx-vals="js:{…}"`, with 0 diagnostics.
- **Prototype:** throws the RFC's `error_text` verbatim:
  - confirm: 146 chars, fix text at char 124
  - vals: 206 chars, fix text at char 121, `include` at char 169

### 3. Does the first error name the fix in one shot?

I ran 9 repair rounds with the same harness (`--tools Read,Write,Edit`). Each cwd held only the view file, and the prompt held only the verbatim dev error. All 9 fixed it in one shot:

- **confirm, 3/3:** replaced the value with message text.
- **vals, 3/3:** wrote `vals: { page }, include: "#sort"`. None took the trap of a `{ sort: "js:…" }` object (`paths.mjs` shows that this would render as inert JSON).
- **Through `.submit()`, 3/3:** the code used the swap verb while the error named `.setHtmx()` and the stack showed `Tag.submit`. All 3 fixed it anyway.

The 6 rendered fixes compile with tsc 0 and render without throwing on the prototype.

### 4. False-positive reach of the dev throw

`paths.mjs` checks how the predicate handles text that resembles the prefix:

- `"JavaScript: The Good Parts"` passes. The predicate is case-sensitive, like htmx.
- `"Delete js:foo?"` passes.
- A confirm that is entirely data, `"js: config.json"`, throws in dev.

That last case has no reach in the fleet. Of 107 non-vendor confirm sites in the 58-repo dedup corpus, 0 lead with user data:

- 60 are literals.
- The 12 template literals all start with literal text.
- The 1 dynamic head is `${fulfillLabel}?`, an app label.
- The 1 identifier is a passthrough.

### 5. The `location(string)` byte change

- **A model-style assertion breaks.** I wrote the assertion a model takes from htmx's docs (`HX-Location: /test`), through the builder the template lint mandates: `assert.equal(res.headers["hx-location"], "/items/5")` under Fastify inject. It passes on base and fails on the prototype (actual `{"path":"/items/5"}`).
- **Plain paths are safe in bare form.** `hcon-fuzz.mjs` runs each bundle's own HCON code and its HX-Location sniff (beta6 `htmx.js:686-694`, 4.0.0 `:655-665`) over 147,821 strings that match the whitelist. 0 are read as config on either bundle.
- **The variant routes each shape correctly** (`loc-shapes.mjs` on `lib2`):
  - `/items/5` and `/items?sort=name&page=2` stay bare.
  - `/ok?tags=a,b`, `x path:js:…`, `/ok confirm:js:…`, `path` and `/čevlji` get the object form.
  - `js:alert(1)` becomes `{"path":"about:blank"}`.
- **A case the RFC did not measure:** `location("/čevlji")` returns Fastify **500** on 8.1.0. Node's `setHeader` throws ERR_INVALID_CHAR. The object form gives 200, and both HCONs decode `/čevlji` back to `/čevlji`. The variant keeps that fix.
- **Suite:** `lib2` passes 2166/2166, and `test/patterns.ts` is byte-identical to shipped 8.1.0, so the variant needs no re-pin.
- **Cost:** `location("/items/5")` costs 31 ns/op on base, 143 on the prototype and 55 on `lib2`.

### 6. Second way and teaching tokens

- **Second way:** exports are 227/227 with an empty diff. No new option key, no new method, and `location(string|object)` already existed. The RFC adds no second way.
- **Deleted:** guideline `fluent-html.md:511`, 111 B and 16 words (about 28 tokens at chars/4). It is false today: `setCite("javascript:…")` already emits `cite="about:blank"` on 8.1.0.
- **Added to guidelines:** 0 lines.
- **Added to `.d.ts`:** +346 B (`core/dev-checks.d.ts`) and +380 B (`render/escape.d.ts`), both `@internal`. `escape.d.ts` also carries `sanitizeUrl`'s JSDoc.
- **Error text:** 146 and 206 chars, shown only on the failure path.
- **Promised but missing:** the REFERENCE.md and CHANGELOG edits. Their diff against 8.1.0 is 0 bytes. REFERENCE.md:1342-1345 still scopes sanitization to "the typed setters", and `.location(` is taught nowhere (0 hits in guidelines, REFERENCE or README).

## Attack

1. **Lane violation on a working value.** `location(string)` always gets the object form, so `location("/items/5")` changes bytes. That value worked: the RFC's own probe shows behavior identical 6/6. The 8.1.x lane allows byte changes only for things that never worked. The change also breaks the one header assertion a model derives from htmx's documented bare form (PASS on 8.1.0, FAIL on the prototype). The RFC rejected the conditional form as "mirroring HCON", but a whitelist of the plain-path shape mirrors nothing. It read 0/147,821 as config on both bundles. It also keeps every injection and misread fix (L4, L5, L6, `path`, non-Latin-1).
2. **Coverage of pure-prior output.** The sanitizer reaches 0/8 of the header sites the pure-prior model writes, because all 8 are raw `reply.header`. This is not a defect of the RFC. The template's existing lint routes those sites to `hxResponse` (2/2 errors). Outside the template, though, the header half of the RFC protects only callers who already chose the builder.
3. **Error names the wrong method.** Through a template swap verb, the message says `.setHtmx()` although the author called `.submit()`. This one did not hold: 3/3 one-shot repairs anyway.
4. **Dev throw on data.** A confirm that is wholly user data starting with lowercase `js:` throws in dev and is neutralized in prod. This did not hold either: 0 of 107 fleet confirm sites have that shape.

## Does it survive?

**survives-with-changes.**

Where it stands up:

- **The dev throw works.** For the `js:` confirm/vals guess (the htmx-2 prior with 3 fleet sites), it turns a silent EvalError under CSP, or script execution without CSP, into one error that names the fix. That fix worked 9/9 in one shot, including through a swap verb.
- **The pure-prior guess is unaffected.** It never hits a `js:` sink (0/4 runs). Its type errors are the same on base and prototype (12/24/20/13), and its render output is byte-identical.
- **No second way and net teaching down.** The RFC adds no API, and the guideline delta is -1 (about 28 tokens deleted, 0 added).

The one defect is the unconditional `HX-Location` object form. It needs the plain-path whitelist (diff at `$V/required-change.diff`, verified at 2166/2166 with the shipped pin intact) before this can ship in 8.1.x. The other two required changes bring the RFC text and the promised docs in line with the prototype that ships.

## Guardrail check

- **§12 (enforcement over prose):** pass. Net guideline lines go to -1. The dev throw carries its own fix, measured 9/9.
- **§7 (converge):** pass. Exports are 227/227 and nothing new is added. The whitelist leaves one author-facing method (`location`). It changes only the wire encoding, which no author chooses.
- **Lane (§4):** fails as written, on `location(string)` bytes for working plain paths. Required change 1 fixes it. No §5 guardrail is violated (`guardrail_killer: null`).
