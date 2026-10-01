---
rfc: RFC-B-01
lens: agent-fitness
verdict: survives-with-changes
confidence: 0.72
killer_objection: "As written, the one hint sentence also heads 13 of the 15 stance-mismatch errors, and for those errors it is wrong: the caller already passed routes.x(). In-repo stance fixes cost a mean of 13.5 tool calls and 4,447 output tokens, against 10.5 and 3,000 on 8.1.0 (n=2 per condition). Required change 1 rebuts this objection."
guardrail_killer: null
required_changes:
  - "1. Make the hint sentence true on every error it heads by naming the stance per verb family. Page family (nav, tab, submit, search(route), onChange): `.${V} takes a page route callable result such as routes.x() from defineRoutes (no render: ids.y on its def), not a URL string, .resolve(), an uncalled route or a fragment route`. Fragment family (fragment, search(target, route)): `.${V} takes a fragment route callable result such as routes.x() from defineRoutes (render: ids.y on its def, y the target), not a URL string, .resolve() or an uncalled route`. For poll, use the same sentence without 'y the target'. fire keeps the RFC's text. Do not use 'renders a page': 2/2 no-repo agents invented a `page:` property from it. Measured on this wording (rfc3): 18/19 raw probes at line 1, +53 chars, green 0 errors, route-prop-laundering 5/5, template tsc 0, stance-fix mean 11 tools / 3,141 output tokens."
  - "2. Update the three compile-pin regexes to the reworded text. Add one stance pin: `.nav(<fragment route>())` must print `takes a page route` on line 1."
  - "3. Ship NotARoute as the RFC's code block shows it, without the 9-line, 661-byte JSDoc in the wave-2 prototype (app2 swap-verbs.ts:105-113). One line at most may give the §5.4 reason. 10/12 in-repo fix agents read swap-verbs.ts."
  - "4. Reword guidelines web-development/CLAUDE.md:265 and fluent-html/CLAUDE.md:265 at net 0 lines. Today they teach `.resolve(query?)` 'for redirects & links', and the new error says verbs take 'not ... .resolve()'. Scope .resolve() to redirects and hrefs, and say the swap verbs take the called route, `route({ query })`."
executed:
  - cmd: "run.sh runs/pp3 logs/pp3 task-pp.txt --tools Write (claude -p --restricted, opus-5-5 xhigh, empty dir, verbatim task-prior.txt)"
    output: "387 s; 0 swap-verb calls, 2x .setHtmx(hx(PATHS.members, ...)); with wave0 pp1/pp2: 0/3 pure-prior runs call a verb; tsc (4 errors) and render (1275 B) byte-identical base vs RFC"
  - cmd: "run.sh runs/vp{1,2,3} ... task-vp.txt --tools Write (verb-aware prior)"
    output: "12/12 verb sites pass a URL string; under RFC 10/10 reported verb errors carry the hint on line 1, 2/3 .search sites masked by an earlier TS2551; first error in 3/3 files is setHref's (no fix)"
  - cmd: "nr/launch.sh (no-repo fix, the tsc text is the only teacher, 2 per condition) + tsc in matching scaffold"
    output: "route callables at verb sites: base 0/8 (1 run gave up, 1 run cast-laundered 6 strings via `as unknown as`), rfc 8/8, rfc2 7/8, rfc3 7/8; errors left: base 8/2, rfc 12/11, rfc2 4/4, rfc3 3/5"
  - cmd: "NODE_ENV=development npx tsx rt/nrb2.ts (cast-laundered base output)"
    output: "8.1.0: 2x hx-undefined silently; RFC lib: throws '<a>.setHtmx() got an HTMX bag with no request ...'"
  - cmd: "fx/launch.sh (in-repo blind fix of vp1 errors, 2 per condition)"
    output: "base 2/2, rfc 2/2, rfc2 2/2 tsc 0 with identical final code; mean tools 33 / 25 / 38"
  - cmd: "fx stance fix (.nav(teamRoutes.list()), list = fragment route), 2 per condition"
    output: "8/8 -> .nav(teamRoutes.index()), tsc 0; mean tools/out-tok base 10.5/3,000, rfc 13.5/4,447, rfc3 11/3,141, rfc2 8.5/2,311"
  - cmd: "node cmp.mjs / bytes.mjs over r01-r19, s01-s15"
    output: "rfc hint line 1: 18/19 raw, 13/15 stance; bytes raw 6,883 -> 11,289, stance 7,407 -> 10,978; rfc3 +53 chars, same offsets"
  - cmd: "z2/second-way.ts (3 @ts-expect-error), tsc base + rfc"
    output: "0 errors both: hint key accepts neither undefined nor the message string"
  - cmd: "rfc3: vitest route-prop-laundering.test.ts; tsc -p tsconfig.json"
    output: "5/5; 0 errors"
  - cmd: "grep guidelines; wc -c swap-verbs.ts; grep Read swap-verbs.ts in run jsonl"
    output: "CLAUDE.md:265 '.resolve(query?) ... for redirects & links'; swap-verbs.ts +1,343 B (661 B JSDoc); read in 10/12 fix runs"
---

# Verdict: RFC-B-01 (agent-fitness lens)

Scratch root: `$W = <scratch>/wave3/RFC-B-01-agent-fitness`.
- `base` is the Wave-0 scaffold with the template-HEAD `swap-verbs.ts` (diff-identical to `projects-template/templates/full-stack/src/core/htmx/swap-verbs.ts`) on the 8.1.0 pack.
- `rfc` is the wave-2 `app2`, with the RFC verbs and the RFC lib.
- `rfc2` and `rfc3` are `rfc` with only the hint wording changed.
- Every `claude -p` run used the wave0-2 withholding harness: `--restricted`, `env -i`, deny rules for `**`, no tsc/node/npm, and model claude-opus-5-5 at effort xhigh.

## What I executed

**1. The pure prior never reaches this surface.** I ran a fresh pure-prior run (`pp3`, verbatim `task-prior.txt`, empty dir, Write only). It wrote 7 files with 0 swap-verb calls. It used `.setHtmx(hx(PATHS.members, …))` twice, as wave0 pp1/pp2 did, so 0/3 pure-prior runs call any verb.
- Compiled in `base` and `rfc`, both give 4 errors, byte-identical.
- Rendered under NODE_ENV=development, both give 1,275 B, identical by `cmp`.

The RFC changes nothing for the measured pure prior. The prior's raw string goes through `hx()`, where the `ResolvedRoute` brand is the gate (F-B-206 territory). At runtime it still emits a valid `hx-get`, so the dev throw does not fire.

**2. The verb-aware prior writes exactly the targeted guess.** I ran 3 runs with a task that names `.nav/.submit/.search/.fragment` but not their argument type. 3/3 runs passed a URL string at 12/12 verb sites: `.nav("/team")`, `.search("/team/members")`, `.submit("/team/invite")`. Compiled against `rfc`:
- **10/10** reported verb errors carry the hint on line 1.
- 2/3 `.search` sites are not reported at all, because an earlier `.setAttribute` TS2551 in the same chain breaks it.
- The **first** error in 3/3 files is `.setHref("/team")`. It reads `'ResolvedRoute | ExternalHref | undefined'`, names no fix, and the RFC does not touch it.

So the first verb error names the fix, but the first error in the file still does not.

**3. When the error is the only teacher, the RFC moves the agent the right way, and the dev throw catches what 8.1.0 provokes.** In an empty dir with the vp1 file and its tsc text, 2 runs per condition:

| condition | verb sites moved to route callables | defineRoutes adopted | casts | tsc errors left |
|---|---|---|---|---|
| 8.1.0 | 0/8 | 0/2 | 6 (`as unknown as NavRoute`) | 8, 2 |
| RFC | 8/8 | 2/2 | 0 | 12, 11 |
| rfc2 ("renders a page") | 7/8 | 2/2 (invented `page: () => Div(…)`) | 0 | 4, 4 |
| rfc3 (stance-qualified) | 7/8 | 2/2 (`{ path: "/team" }` defs) | 0 | 3, 5 |

The 8.1.0 cast-laundered output renders 2× `hx-undefined="undefined"` silently. Under the RFC lib it throws `<a>.setHtmx() got an HTMX bag with no request …`, with stack frame 4 at `p.nav swap-verbs.ts:274`.

This is the strongest evidence for both halves of the RFC. The fix-less 8.1.0 error drove 1/2 agents into the cast path, and the dev throw exists to catch exactly that path. No condition compiles in one pass, though:
- The RFC runs guess the `defineRoutes` def shape (`team: "/team"` produces TS2322 'string' not assignable to 'RouteDef & …', which names no fix).
- All 6 RFC-family runs wrote `routes.x().resolve()` for `setHref`.

**4. In-repo blind agent: same outcome, modestly cheaper.** Fixing vp1's errors inside the scaffold (2 per condition), 8.1.0, RFC and rfc2 all reached tsc 0 with identical final code. Mean tool calls were 33 / 25 / 38. Five non-verb errors in the same file dominate the effort, so with exemplars present the RFC changes cost, not outcome.

**5. Stance cost.** I gave the agents `.nav(teamRoutes.list())`, where `list` is a fragment route. All 8 runs fixed it to `.nav(teamRoutes.index())` with tsc 0. Mean tool calls and output tokens:
- 8.1.0: 10.5 and 3,000
- **RFC: 13.5 and 4,447** (runs 4,864 and 4,031; no overlap with 8.1.0)
- rfc3: 11 and 3,141
- rfc2: 8.5 and 2,311

rfc-2 grepped `nav takes` to chase the sentence. n=2 per condition, so read this as a direction, not a proof.

**6. Probe matrix** (wave-2 r01-r19, s01-s15):
- RFC puts the hint on line 1 in 18/19 raw probes and in 13/15 stance probes; for those stance errors the sentence is wrong.
- Diagnostic bytes: raw 6,883 → 11,289 (+64%), stance 7,407 → 10,978 (+48%).
- rfc3 has identical hint offsets at +53 chars per line (raw 12,313 B, stance 11,769 B), 0 errors in the green file, `route-prop-laundering.test.ts` 5/5, and full template tsc 0.

**7. Second way: none.** Three `@ts-expect-error` probes (raw path; hint key set to `undefined`; hint key set to the message string) are all consumed in both `base` and `rfc`, and route callables compile. The never-valued key accepts no value.

**8. Teaching tokens.**
- Guidelines: +0/−0 lines. One line contradicts the new error: `web-development/CLAUDE.md:265` teaches "`.resolve(query?)` … for redirects & links", while the error says "not … .resolve()".
- Errors: +4,406 B over 19 raw errors and +3,571 B over 15 stance errors.
- Source: `swap-verbs.ts` grows +1,343 B, of which 661 B (9 lines) is a JSDoc on `NotARoute` that exists in the prototype but not in the RFC's code block. 10/12 in-repo fix agents read that file.

## Attack

1. **Reach.** The pure prior (0/3) never calls a verb, and in-repo agents fix the 8.1.0 error in one pass anyway (2/2). The guess only appears when an agent knows the verbs but not their argument. That case is real (3/3 verb-aware runs, 12/12 sites), but it is narrower than "leverage item 1" suggests.
2. **Misdirection on stance errors.** One union-member sentence leads both raw and stance errors. On stance errors it says the agent did something it did not do, and the measured fix cost rose about 48% in output tokens. This was the strongest objection.
3. **No one-shot compile.** Even with the hint, docs-less agents need the `defineRoutes` def shape. They also hit the unchanged `setHref` brand error, which is the first error in every vp file. The RFC's predicted error-quality +1 is capped by those neighbours (F-B-206/F-B-308).
4. **Inconsistent teaching.** The guidelines tell agents to use `.resolve()` for links, and the new error tells them not to pass `.resolve()`.
5. **The dev throw names `.setHtmx()` when the caller wrote `.nav()`.** The verb frame is the 4th stack line. This is non-blocking.

## Does it survive?

**survives-with-changes.** Both halves are measured to help an agent:
- With the error as the only teacher, route-callable adoption went from 0/8 to 8/8 verb sites, and the cast-laundering path dropped from 1/2 runs to 0/6.
- That cast path, which 8.1.0 provokes, now throws in dev.

The RFC adds no second way and no guideline lines, and its lane holds: valid calls are unchanged and production bytes are unchanged. Attack 2 is fixable inside the RFC's own design: a stance-qualified sentence (rfc3) keeps every raw-probe offset and brings stance-fix cost back to 8.1.0 levels. It also taught docs-less agents the def shape better (3-5 errors left vs 11-12).

The required changes are in the frontmatter:
1. Stance-qualified wording, avoiding "renders a page".
2. Update the pins and add one stance pin.
3. Drop the prototype JSDoc.
4. Reword guidelines `CLAUDE.md:265` at net 0 lines.

Not required here: the `setHref` first-error problem belongs to F-B-206/F-B-308, and the `.search` masking behind TS2551 is tsc's chain behaviour that the dev throw backstops.

## Guardrail check (if this lens owns one)

§5.12 (enforcement over prose): pass, with net 0 guideline lines; required change 4 rewords a line at net 0. §5.7 (converge): pass, since the hint member admits no value (3/3 probes). §5.4 (no inference through generic wrappers): the rfc3 wording keeps the RFC's union-member shape, with 0 errors in the green file including the 9 wrapper forms. No guardrail killer.
