---
rfc: RFC-E-02
lens: agent-fitness
verdict: survives-with-changes
confidence: 0.8
killer_objection: "The guard sees only views that get rendered, and the RFC's upgrade count rests on view tests. At stem-50 HEAD, src/app/thesis/views/thesis.new.view.ts:47 is a second live select that throws on every render. It serves GET /thesis/new and no view test renders it. 2/2 withheld-context upgrade agents fixed the one select the tests flagged, reported green, and left /thesis/new returning a dev 500. The RFC's '1 live fleet site throws on upgrade' is wrong (at least 2)."
guardrail_killer: null
required_changes:
  - "Correct Lane & migration and the CHANGELOG entry. stem-50 HEAD has 2 required f.select sites that throw on every render: faculties.form.view.ts:78 (tested) and thesis.new.view.ts:47 (GET /thesis/new, untested). The upgrade note must say that a green view suite does not clear the upgrade, and must name the static search: an f.select(...) or Select(...) with .toggle(\"required\") whose first option value is not \"\". Replace the fleet-run count with a static pass over the 8 canonical required f.select sites in census-sites.json."
  - "Guard 2 message: name the per-site fix for a deliberate default next to the placeholder fix, e.g. 'If \"MASTERS\" is the intended default, bind it (values: { thesisType: \"MASTERS\" }) or mark it selected.' That is the fleet's existing spelling (sportoawards sign-up.form.view.ts:49). Today the message's only alternative is the global setDevChecks(false), which also turns off the mutation guards."
  - "Specify the FormBinding.select JSDoc line's text, or drop it. The prototype ships none. The 65-token line I reconstructed changed no outcome: both arms led with { value: \"\", label } in 4/4 generation runs, and both proto runs read the line."
  - "Drop or restate the 'fleet prose retired' half of the verification-loop prediction. Agents still wrote comments restating the rule in 4/4 generation runs on both arms and in 1/2 deliberate-default repairs."
executed:
  - cmd: "scratch build of 656e812 + RFC-E-02 prototype files + 1 JSDoc line; tsc + behaviors build; node --test <npm test list>"
    output: "2159/2159 pass; packed as pkgs/proto (label 8.2.0); base = wave0-2 fluent-html-8.1.0.tgz"
  - cmd: "canary through run.sh (claude -p --restricted --tools Bash,Edit,Glob,Grep,Read,Write, env -i, settings-run.json)"
    output: "CLAUDE.md/memory NONE; npx vitest/tsc allowed; ~/.claude, fluent-html repo, node -e denied"
  - cmd: "stem-50 HEAD on proto: vitest run tests/view; ThesisNewPage render test on proto and base"
    output: "10/565 fail (faculties universityId); thesis.new: proto throws thesisType, base passes"
  - cmd: "agent runs U1/U2 (upgrade repair), then the thesis-new render added after they finished"
    output: "2/2 placeholder fix, 36-39 s, $0.16-0.18; afterwards 565/566 in both, thesisType still throws"
  - cmd: "agent runs W1/W2 (wsfas 655ce831^ + reduced LARGE test, guard 1)"
    output: "2/2 reproduce 655ce831's 5-file fix incl. schema; 819/819; tsc 10=10 same set; 89-129 s, $0.37-0.40"
  - cmd: "agent runs T1/T2 (thesis.new failing, deliberate-default case)"
    output: "2/2 placeholder, 0/2 bind default, 0/2 setDevChecks; 33-38 s, $0.13-0.19"
  - cmd: "agent runs Gb1/Gb2/Gp1/Gp2 (fresh generation, teamapp)"
    output: "guard fired 0 times; 4/4 placeholder-led company select on both arms; base outputs pass 6/6 on proto"
  - cmd: "agent runs Xb1/Xb2/Xp1/Xp2 (exemplar copy: department form beside the faculties form)"
    output: "base: Xb2 copied the bug and shipped green (4/5 of its own tests fail on proto); proto: Xp1 copied it, guard fired, fixed in 1 edit; Xp2 avoided it; shipped bug base 1/2, proto 0/2"
  - cmd: "6 fleet selects rewritten in 5 files across 4 trees; tsc --noEmit + vitest on proto"
    output: "all green; tsc 0 / 71=71 / 71=71 / 10=10 (identical sets)"
  - cmd: "Value.Check(updateCompanySchema.body) at wsfas 655ce831^"
    output: "LARGE false, '' false, SOLO true"
  - cmd: "fixprobe: tsc + render of every fix the messages name, plus default binding"
    output: "tsc 0; 4 bug shapes throw; all 5 named fixes and the binding render"
  - cmd: "token count via claude -p (baseline vs appended text)"
    output: "JSDoc +65, guard 1 +125, guard 2 +121, always-loaded +0"
---

# Verdict: RFC-E-02 (agent-fitness lens)

> I approached this as an adversary: try to kill RFC-E-02 through the agent-fitness lens, and reject under uncertainty. Reading code is not verification, so every claim below was executed.

Scratch root: `<scratch>/track-e/RFC-E-02-agent-fitness` (`$V`). Every agent run is a separate `claude -p --restricted` process with
`--tools Bash,Edit,Glob,Grep,Read,Write`, `env -i`, model claude-opus-5-5, effort high, and `$V/settings-run.json`. The settings allow
`npx vitest`, `npx tsc`, file tools and read-only shell. They deny `node`, `git`, `curl`, `npx tsx`, reads of `**` and
`~/.claude/**`, and Task/Agent. Workspaces are snapshots made with `git archive` or rsync. Each one has `CLAUDE.md`, `.ai/`, `.claude/` and `project/` removed, node_modules
symlinked entry by entry, and a real copy of `fluent-html` (base 8.1.0 or the proto). Canary C1 showed: NONE loaded, vitest 4.1.11 and tsc 6.0.3
allowed, and all 3 out-of-scope probes denied. No repo was edited.

## What I executed

**Prototype.** I rebuilt the prototype from 656e812 in scratch, using the RFC's three changed files plus a 1-line `FormBinding.select` JSDoc. The RFC promises that line but
gives no text, and the RFC's `$R/lib` lacks it. Lib suite 2159/2159.

**Six agent probes, 18 runs.** "Guard" means a guard message reached the agent in a tool result.

| probe | setup | arm | runs | guard seen | outcome |
|---|---|---|---|---|---|
| U upgrade repair | stem-50 HEAD, "view tests fail since 8.2.0" | proto | 2 | 2/2 | 2/2 message's placeholder at faculties.form.view.ts:79, 1 pass each, 36-39 s, $0.16-0.18 |
| W guard 1 repair | wsfas `655ce831^` + reduced LARGE render test | proto | 2 | 2/2 | 2/2 the full 5-file `655ce831` fix (routes, schema `Type.Literal("LARGE")`, badge, both SIZE_OPTIONS), 89-129 s, $0.37-0.40 |
| T deliberate default | stem-50 HEAD, failing thesis.new render test | proto | 2 | 2/2 | 2/2 placeholder; 0/2 bound the existing first option as a default |
| G fresh generation | teamapp scaffold: mandatory company select, contact defaulting to e-mail, edit form with stored LARGE | base / proto | 2 / 2 | 0/2 | 4/4 placeholder-led; 4/4 contact as radios bound to `"email"`; 4/4 narrow size + conditional placeholder |
| X exemplar copy | stem-50 HEAD: "add a department form following the existing admin forms" | base / proto | 2 / 2 | 0/2 / 2/2 | base: Xb2 copied faculties' bug (departments.form.view.ts:40), shipped with 1,858 tests green; proto: Xp1 copied it, its own test threw, fixed in 1 edit; Xp2 read dev-checks.js first and wrote a placeholder |
| C canary | | | 1 | | withholding proven |

Across the 10 proto runs, 8 saw a guard message. None of the 8 called `setDevChecks(false)`, and none of the 14 runs edited `node_modules/fluent-html` (`diff -rq`).

**Bug shipped in final code:** base 1/4 (Xb2; its own test file fails 4/5 when re-run on proto), proto 0/4. Fresh generation
never produced the shape on either arm. The guard's agent value is in copied, upgraded and legacy-data code, which is where both
incidents came from.

**Error names the fix.** I compiled and rendered every spelling the messages name on proto (`eval/fixprobe`, tsc 0). Both guard 2 spellings, the
disabled+selected fix, guard 1's "add the option" and "bind `""` + placeholder" all render. The 4 bug shapes throw. Guard 1's stack lands on
`companies.detail.view.ts:154:9`. Guard 2's stack has no view frame (`assertSelectSubmits <- emit <- render <- test:101`), but the
`name="…"` in the message was enough: 6/6 guard 2 repairs went straight to the file with one Grep.

**Guard 1's literal fix is half the fix.** With only the view changed (my rewrite), the reduced test passes. But `Value.Check` on
`655ce831^`'s `updateCompanySchema` refuses `"LARGE"` (and `""`), so every save of a LARGE company is refused at the router. 2/2 W agents
found and fixed the schema anyway, reading it from the Prisma enum. The message doesn't need to know about schemas, but the RFC
shouldn't claim the incident reduces to the guard.

**Five or more fleet sites rewritten and compiled** (my own `rw.py` edits on proto):

| site | before | after | tsc |
|---|---|---|---|
| stem-50 HEAD `faculties.form.view.ts:78` universityId | 10 view fails | 566/566 | 0 |
| stem-50 HEAD `thesis.new.view.ts:47` thesisType (new) | render throws | 566/566 | 0 |
| stem-50 `9a1603a` `auth.register.view.ts:47` facultyId | 26/27 | 27/27 | 71 = 71, same set |
| stem-50 `9a1603a^` prereg facultyId, then companyId | 5/8 (facultyId), 5/8 (companyId) | 8/8 | 71 = 71, same set |
| wsfas `655ce831^` size (+LARGE, +schema) | 9/10 | 10/10 | 10 = 10, same set |

The 8 agent rewrites (U, W, T, Xp) also compile with unchanged error sets.

**Teaching tokens** (`claude -p --tools ""`, baseline 1,914): always-loaded +0 (no guideline delta). The JSDoc line is +65, read only when the
agent opens forms.d.ts or forms.ts (2/2 proto G runs did). Guard 1's message is +125 and guard 2's is +121; each is paid once, on failure. Each repair cost the agent $0.13 to $0.40.

## Attack

1. **The upgrade count is wrong, and agents stop at green.** The 8 canonical required `f.select` sites in census-sites.json break down as follows:
   - 2 throw on every render: faculties:78, and `thesis.new.view.ts:47` (`Form<ThesisCreateReq>({ values: {} }` over `[MASTERS, PHD]`).
   - 1 has a bound deliberate default: sportoawards `sign-up.form.view.ts:49`, `country: "Slovenia"`.
   - 5 are `""`-led or bound.

   No view test renders `ThesisNewPage`, so the RFC's 16-suite run missed it. After U1 and U2 reported "all 565 view tests pass", my render
   of `/thesis/new` still threw in both workspaces. The RFC's migration section ("1 live fleet site throws on upgrade") is the
   instruction an upgrade agent would follow, and it is short by one.
2. **Deliberate defaults have no per-site exit.** Guard 2 offers two ways out: a placeholder, or `setDevChecks(false)`, which disables every dev guard globally.
   T1 and T2 both turned thesis type into a forced choice, and 0/2 considered binding the default. The fleet already spells a deliberate default
   as a binding (sportoawards:49), and that spelling renders clean on proto. 0/8 agents reached for the global switch, so the measured harm
   is a UX change, not a disabled guard. Still, the message points deliberate cases at the wrong tool.
3. **Zero effect on fresh code.** G and the RFC's own pure-prior runs (4/4) already write the placeholder. The JSDoc line moved
   nothing. Restating comments survived: 4/4 G runs on both arms, and T2.

## Does it survive?

**Survives with changes.** On the lens's core question the guard performs well:
- When it fires, the message's spelling is taken on the first try: 8/8 runs fixed it with no second wrong guess.
- The first wrong guess (copying the exemplar's shape) gets an error that names the fix, and Xp1 fixed it in 1 edit.
- No agent disabled the guard or patched the lib.
- It turned a 1/2 silent ship on base into 0/2 on proto in the exemplar-copy probe.

It adds no API, no always-loaded prose, and a few hundred tokens only when it fails. The objections are about scope and wording, not
mechanism:
- Correct the upgrade count and tell upgraders how to find untested sites.
- Give deliberate defaults a per-site exit in the message.
- Pin or drop the JSDoc line.
- Retract the claim that agent prose is retired.

The `required_changes` above list each one.

## Guardrail check (if this lens owns one)

- §5.7 converge: holds. One placeholder spelling, and 10/10 proto fixes used it or the add-the-option fix. No `placeholder` param is reopened (L-150 stays parked).
- §5.12 enforcement over prose: holds, with 0 always-loaded tokens. The one exception is the unspecified JSDoc line.
- No §5 guardrail is violated from this lens.
