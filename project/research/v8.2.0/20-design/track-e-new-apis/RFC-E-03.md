---
id: RFC-E-03
track: E
title: "Form<T> takes the route's body schema and stamps maxlength, minlength, required, min and max on bound controls"
resolves: [F-E-911]
cluster: E-03
api_surface:
  - "fluent-html FormState<T>: new optional key `schema?: FormSchema<T>` (plus a non-exported RouteSchemaBag arm whose only job is to make the `{ body }` guess fail with a message naming `.body`)"
  - "fluent-html `export type FormSchema<T> = { readonly properties: { readonly [K in keyof T]-?: FieldSchema }; readonly required?: readonly string[] }`"
  - "fluent-html `type FieldSchema = object & { readonly maxLength?: number; readonly minLength?: number; readonly minimum?: number; readonly maximum?: number }` (module-level, not re-exported)"
  - "fluent-html FormBinding.input / textarea: signatures unchanged; with state.schema they stamp before returning, so a later setter wins"
  - "fluent-html dev throw (devChecks only) when `schema` has no `properties`"
  - "fluent-html README.md section 3 (Typed forms) example"
enforcement: runtime
error_text: >-
  TS2322: Type '{ body: TObject<{ name: TString; email: TString; company: TOptional<TString>; message: TString; }>; }'
  is not assignable to type 'RouteSchemaBag | FormSchema<{ company?: string | undefined; name: string; email: string; message: string; }> | undefined'.
  Type '{ body: TObject<...>; }' is not assignable to type 'RouteSchemaBag'. Types of property 'body' are incompatible.
  Type 'TObject<{ name: TString; email: TString; company: TOptional<TString>; message: TString; }>' is not assignable to type
  '"Form<T> schema takes the body schema itself: pass xSchema.body"'.
prose_deleted:
  - "guidelines/web-development/fluent-html.md:130 (bound-control chaining example ends in .toggle(\"required\"), a schema restatement; rewritten in place)"
guideline_delta: 0
lockstep: [guidelines, template]
codemod: none
codemod_dry_run: "additive, no migration. Optional adoption codemod measured: template scaffold 8/8 forms, 15 setters dropped, tsc 0 errors, 404/404 tests; 15 canonical repos 255/379 forms, 213 setters dropped, tsc diagnostics unchanged 15/15"
dims_predicted: { silent-failure: +0.5, invariant-safety: +0.5, context-economy: +0.5 }
impact: 3
effort: S
ships_to: 8.2.0
depends_on: []
status: proposed
---

# RFC-E-03: Form<T> stamps the constraints its body schema enforces

Scratch root for every command below: `$R = <scratch>/track-e/RFC-E-03`.
`$R/lib` is a copy of fluent-html 8.1.0 (HEAD 656e812) with this change, built with `tsc` plus the behaviors
build; the real `dist/` was never rebuilt. `$R/app-before` / `$R/app-after` are copies of the Wave-0
full-stack template scaffold (`wave0-2/base/teamapp`, modules auth + account + profile). `$R/fleet/<repo>/{base,after}`
are copies of the 15 canonical-era repos that bind `Form<T>` (all except projects-template, which the scaffold
stands in for), their own `node_modules` symlinked, `fluent-html` pointed at `$R/lib` in `after`.
`$R/lib-before-log` / `$R/lib-after-log` are dist copies of HEAD and of `$R/lib` whose `render()` appends each
output to a per-test-file log when `RENDER_LOG_DIR` is set, so every render a project's own view tests perform
is compared byte for byte.

## Problem

F-E-911, re-measured.

**The runtime failure.** home-page validates `POST /contact` with `maxLength` caps
(`home-page/src/app/contact/contact.schema.ts:6-11`: name 200, email 320, company 200, message 5000). Its
controls are bound through helpers (`contact.view.ts:99-109` `TextField` calls `f.input(name, type)`;
`:111-121` `MessageField` calls `f.textarea("message")`) and render 0 `maxlength`. A 5,001-character paste is
not stopped; Fastify's schema check fails before the handler; the template's error handler maps any validation
failure to a 400 ErrorPage (`projects-template/templates/full-stack/src/core/server/server.ts:355-358`, "Please
check your input and try again.") which htmx 4 swaps over `#main-content`. Form and typed values are gone
(finder run: 400, `has <form` false, typed name false). Executed here on 3 engines with the rendered form
(`node $R/pw/pw.mjs`): before, the textarea keeps 5,001 characters by `fill` and by `insertText` paste on
chromium, firefox and webkit; nothing blocks submit.

**The demand.** `node <scratch>/track-e/E-gaps/constraints/scan2.mjs` (re-run): 317 `Form<T>` forms in 16
canonical repos resolve to a TypeBox body; 368 constrained fields, 248 bound directly; maxLength restated 35
times (13 repos), omitted 39 times (11 repos), 0 restatements differ from the schema; minLength restated 184
of 187; minimum omitted 6 of 10 (5 repos). `node $R/scan/scan-e03.mjs` applies this RFC's exact stamping rule
to every directly bound control: 234 sites would be stamped, 186 already carry exactly what the rule stamps
(pure restatement), 48 gain attributes they omit (32 maxlength, 13 minlength, 4 min; 15 repos), **0 conflict**.
The `required` rule matches the hand-written attribute 184/184 and adds it 0 times. 117 more constrained fields
are bound inside helpers the scan cannot resolve (home-page contact is one).

The template ships both halves: `UpdateProfileBody` (`templates/full-stack/src/app/account/account.schema.ts:9-14`)
says name 1..80, username maxLength 30, bio maxLength 280; the view restates two of them by hand
(`account.page.view.ts:87` `.setMaxlength(80).toggle("required")`, `:92` `.setMaxlength(280)`) and omits the third
(`:90` `f.input("username", "text")`), so every scaffold copies the gap.

**Agents reproduce it.** Headless `claude -p` runs (`wave0-2/run-claude.sh`, context withheld, model
claude-opus-5-5, effort high), task "write the contact form view with Form<T>", home-page's contact.schema.ts
verbatim. On shipped 8.1.0: 2/2 runs render 0 `maxlength` on 4/4 constrained fields.

## Instruction-set check

- `grep -rn "maxLength\|\.properties" projects-template/templates/full-stack/src/{core,shared}`: 1 hit,
  `core/server/plugins/amqp.ts:328` (`msg.properties.correlationId`, unrelated). No schema-to-attribute helper.
- `packages/ui/src/form/TextInput.ts:21,69` and `Textarea.ts:19,65` take a hand `maxLength` prop and call
  `setMaxlength`: the restatement itself, with untyped names (RFC-C-04 retires the package's mentions).
- No canonical repo uses `attachValidation` (F-E-911), so no app turns the 400 into a 422.
- **Why the lib.** `FormBinding<T>` builds every bound control inside `Form()` and `FormState` is the one seam
  it reads (`fluent-html/src/elements/forms.ts:433`, `:465 createFormBinding`). A template wrapper would
  re-implement all 8 members and track every member the lib adds (F-E-102, F-E-404): a second way to bind.
  The core stays pure: the schema is plain JSON Schema data typed structurally (no TypeBox, no Fastify import),
  and T stays explicit at the call.
- **Seen set.** L-097 (`00-recon/04-prior-ledger.md:178`, "Form<T> derived from the route def's schema",
  deferred in define-controller cooldown) is a different mechanism: it derives T. This RFC keeps T explicit and
  reads limits only, so it neither re-raises nor blocks L-097. `RouteDef` carries no body schema
  (`fluent-html/src/routes.ts:168-175`), so the view imports it from `[feature].schema.ts`, the file it already
  imports T from.

## Proposed change

`fluent-html/src/elements/forms.ts` (prototype `$R/form-schema.diff`, +45/-3; `src/index.ts` and
`src/elements/index.ts` export `FormSchema`):

```ts
export type FormState<T> = {
  values?: Partial<T>; errors?: ErrorBag<T>; idPrefix?: string;
  schema?: FormSchema<T> | RouteSchemaBag;
};

/** The route schema bag (`{ body }`) is the likely guess; this arm only makes its error name the fix. */
type RouteSchemaBag = { readonly body: "Form<T> schema takes the body schema itself: pass xSchema.body" };

/** The JSON Schema keywords a bound control enforces in the browser. Any schema node fits. */
type FieldSchema = object & {
  readonly maxLength?: number; readonly minLength?: number;
  readonly minimum?: number; readonly maximum?: number;
};

/** The route's body schema as plain JSON Schema data (a TypeBox `Type.Object(...)` fits as is). Keyed by T. */
export type FormSchema<T> = {
  readonly properties: { readonly [K in keyof T]-?: FieldSchema };
  readonly required?: readonly string[];
};
```

Inside `createFormBinding`, `input()` and `textarea()` call `constrain(tag, name, type)` before `markInvalid`:

| schema keyword | control | emitted |
|---|---|---|
| `maxLength: n` | textarea; input with no type or text, email, password, tel, url, search | `maxlength="n"` |
| `minLength: n`, n > 1 | same | `minlength="n"` |
| key in `required` and `minLength >= 1` | same | `required` |
| `minimum` / `maximum` | input type number, range | `min` / `max` |

Rules and their reasons:

- `required` needs both the list and `minLength >= 1`, because JSON Schema `required` alone accepts `""` and an
  HTML form always submits the key (the scaffold's `email: Type.String()` in 4 auth bodies stays submittable
  empty, as the server allows). This rule reproduces the hand-written attribute 184/184.
- `minLength: 1` emits no `minlength` (a no-op in HTML; `required` carries it).
- select, checkbox, radio and hidden are untouched (4 select sites in 2 repos hand-toggle `required`; see open
  questions). `pattern` and `format` are skipped (open questions).
- Stamping runs before the caller's chain, so `set*` overrides hold: `.setMaxlength(80)` after binding wins,
  `.setMaxlength()` clears, `.toggle("required", false)` removes.
- Allocation only when a schema is passed: one property lookup per control, no Set, no copy.
- Dev throw for JS callers that pass the bag: `Form<T> schema takes the body schema itself (xSchema.body), not
  the route schema bag { body }.`

Call site (the template convention exports `xSchema = { body: XBody }`; 244/317 resolved forms reach their body
only that way, 29 through an exported body const):

```ts
import { contactSchema, type ContactReq } from "../contact.schema.js";
Form<ContactReq>({ values, errors, schema: contactSchema.body }, (f) => [ /* unchanged */ ])
```

## Before → after

**home-page contact** (`contact.view.ts:167`, helper-bound, the F-E-911 runtime case): one key added,
`Form<ContactReq>({ values, errors, schema: contactSchema.body }, …)`. Rendered by home-page's own
`tests/view/contact.view.test.ts` through `$R/lib-after-log`: the message textarea goes from
`… rows="6" required>` to `… rows="6" maxlength="5000" required>` in 7/7 renders; name, email, company gain
200, 320, 200. `node $R/pw/pw.mjs` on that render:

```
chromium base  {"len":5001,"valid":true,"maxlength":null,"pasteLen":5001}
chromium after {"len":5000,"valid":true,"maxlength":"5000","pasteLen":5000}
firefox  base 5001 / after 5000     webkit base 5001 / after 5000
```

**Template account profile** (scaffold `account.page.view.ts`, codemod output):

```diff
-      } }, (f) => [
+      }, schema: updateProfileSchema.body }, (f) => [
-          f.input("name", "text").setMaxlength(80).toggle("required"),
+          f.input("name", "text"),
         Label("Username", f.input("username", "text")),
-        Label("Bio", f.textarea("bio").setRows(3).setMaxlength(280)),
+        Label("Bio", f.textarea("bio").setRows(3)),
```

Render (`$R/dump-before.json` vs `$R/dump-after.json`):

```
before <input id="name" type="text" name="name" value="Ada Lovelace" maxlength="80" required>
after  <input id="name" type="text" name="name" value="Ada Lovelace" maxlength="80" required>
before <input id="username" type="text" name="username" value="ada">
after  <input id="username" type="text" name="username" value="ada" maxlength="30">
before <textarea id="bio" name="bio" rows="3" maxlength="280">
after  <textarea id="bio" name="bio" rows="3" maxlength="280">
```

The same page's change-password `passwordConfirm` gains `minlength="8"` (`ChangePasswordBody` says 8; the view
said only `required`). `node $R/pw/pw2.mjs`, typing "short": before `tooShort:false, formValid:true` on 3/3
engines (the server answers 400); after `tooShort:true, formValid:false` on 3/3.

**Fleet adoption dry run** (`$R/codemod/form-schema.mjs`, TS-AST: resolve T through `Static<typeof Body>` to
an exported body or `{ body }` wrapper, add `schema:`, delete only setters equal to the stamp;
`$R/codemod/fleet.sh` + `render.sh` + `cmp-logs.mjs`):

| project | forms rewritten | setters dropped | tsc after (drift baseline) | renders | identical | constraint-only diff | other |
|---|---|---|---|---|---|---|---|
| template scaffold | 8/8 | 15 | 0 (0) | 292 | 279 | 13 | 0 |
| home-page | 10/14 | 14 | 0 (0) | 315 | 296 | 19 | 0 |
| competify | 19/29 | 19 | 0 (0) | 308 | 281 | 27 | 0 |
| competition | 35/40 | 15 | 0 (0) | 192 | 181 | 11 | 0 |
| everyframe | 12/17 | 15 | 0 (0) | 290 | 266 | 24 | 0 |
| everyframe-composer | 42/62 | 21 | 0 (0) | 1412 | 1336 | 76 | 0 |
| fl-um | 12/15 | 14 | 0 (0) | 215 | 204 | 11 | 0 |
| fluent-html-home-page | 8/10 | 14 | 0 (0) | 215 | 206 | 9 | 0 |
| gzs/stem-50 | 17/24 | 21 | 0 (0) | 661 | 661 | 0 | 0 |
| na-cent | 22/27 | 15 | 0 (0) | 522 | 472 | 50 | 0 |
| popri | 14/18 | 14 | 0 (0) | 331 | 319 | 12 | 0 |
| sportoawards | 18/26 | 14 | 0 (0) | 244 | 238 | 6 | 0 |
| stojnica | 2/2 | 0 | 0 (0) | 169 | 165 | 4 | 0 |
| studio | 13/18 | 14 | 0 (0) | 289 | 247 | 42 | 0 |
| website-sales-funnel-automation-system | 12/53 | 8 | 0 (0) | 861 | 827 | 34 | 0 |
| workshop-toni (pinned 7.0.0) | 19/24 | 15 | 3 (3, ResolvedRoute drift) | 466 | 442 | 24 | 0 |
| **total** | **263/387** | **228** | **unchanged 16/16** | **6,782** | **6,420** | **362** | **0** |

Constraint-only diffs add 709 `maxlength`, 197 `minlength`, 18 `min` attribute instances and nothing else; 0
`required` added. Normalized before comparing: a 13-digit avatar cache-buster in 1 everyframe render and random
UUIDs in 8 workshop-toni renders (nondeterministic fixtures, no form). Pre-existing test failures are identical on
both sides (copies exclude `public/` and locale assets). The 124 unrewritten forms are codemod limits, not API
limits: 41 have a T not declared as `Static<typeof X>`, 79 bind a body or querystring schema that is not exported,
4 spread props.

## Enforcement

Layer: **runtime, by construction**, with a type guard on the pairing. The omission class (a limit the server
400s on that the control does not carry) cannot be written once the schema is passed, because the binding reads
the limit from the object the controller validates with. Types make the pairing safe
(`node $R/probe` against TypeBox 0.34.52, `test/form-schema-errors.test.ts` in `$R/lib`):

| guess | first diagnostic (executed) |
|---|---|
| `schema: contactSchema` (the bag the controller passes) | TS2322 ... `Type 'TObject<...>' is not assignable to type '"Form<T> schema takes the body schema itself: pass xSchema.body"'` |
| `schema: SignInBody` (another body) | TS2322 ... `Type '{ email: TString; password: TString; }' is missing the following properties from type '{ readonly company: FieldSchema; readonly name: FieldSchema; ... }': company, name, message` |
| plain schema with `maxLength: "200"` | TS2322 `Type 'string' is not assignable to type 'number'` |
| `scheme: ContactBody` | TS2561 `... 'scheme' does not exist in type 'FormState<...>'. Did you mean to write 'schema'?` |

Positives compile with 0 diagnostics: home-page ContactBody verbatim, template UpdateProfileBody verbatim, a body
using every kind the fleet scan saw (String, Number, Integer, Boolean, Literal, Union, Array, nested Object,
Optional, Union with Null), and a plain `as const` JSON Schema. Each negative also carries `@ts-expect-error`
in `probe-neg.ts`, which compiles clean (both ways hold). `FieldSchema` is `object & {…}` so a node sharing no
keyword (TBoolean, TLiteral) is not hit by the weak-type check. Known limit: a superset schema (every key of T
plus extras) passes, because rejecting extras needs S inferred at the call next to an explicit T, which TS has
no partial inference for.

**Agent fitness.** Same harness as above, `$R/lib` packed with the README change: 3/3 runs wrote
`schema: contactSchema.body` on their first and only Write (0 Edits each; all read README.md and
`dist/src/elements/forms.d.ts`), 0/3 restated `setMaxlength`, 0/3 guessed the bag. 2/3 compile clean and render
`maxlength` 200/320/200/5000; the third fails only on `.submit`, a template verb the bare lib does not carry,
unrelated to the schema line. Control on 8.1.0: 0/2 emit any `maxlength`.

## Replaces (converge)

Replaces the per-control restatement of a schema limit (227 static sites, 228 setters deleted in the dry run)
and closes its omission (39 maxlength, 6 min statically; 709 + 197 + 18 attribute instances at render time).
One way per job: the schema goes in `FormState`, the only seam the binding reads; a setter after binding is the
existing `set*` override, not a second way. The 179 setters the codemod kept are not restatements (view
stricter than server: `toggle("required")` on `email: Type.String()`, `setMinlength(8)` on a `minLength: 1`
password) and stay.

Guideline edits, all in place (net **0** lines):

- `guidelines/web-development/fluent-html.md:130`: the chaining example
  `f.input("email", "email").setPlaceholder("you@example.com").toggle("required")` becomes
  `….setAutocomplete("email")`, so the taught example stops being a restatement.
- `fluent-html.md:139`: "Prefill + errors" becomes "Prefill, errors, limits: … and stamps
  maxlength/minlength/required/min/max from `state.schema` (the route's body schema, `xSchema.body`); never
  restate a schema limit on a bound control".
- `fluent-html.md:141`: `Form<CreateUserReq>({ values: user, errors, schema: createUserSchema.body }, (f) => [`.
- `guidelines/web-development/CLAUDE.md:109`: the Form<T> bullet gains "pass `schema: xSchema.body` and the
  schema's limits are stamped" in the same line.
- Lib `README.md` section 3: the example becomes
  `Form<CreateUserReq>({ values, errors, schema: createUserSchema.body }, (f) => [f.input("email", "email"), f.input("password", "password")])`
  (4 lines for 4; coordinate with RFC-A-07, which rewrites the same example to the one-builder form).

## Lane & migration

**8.2.0, additive.** `FormState` gains an optional key; with no `schema` the emitted bytes are unchanged (the 2,159
pre-existing lib tests pass untouched; the scratch suite is 2,173/2,173 with 9 new binding tests and 5 compile
probes). No codemod is required. Template lockstep: pass `schema:` in the template's bound forms
(`templates/full-stack/src` has 20 `Form<` sites; the scaffold's 8 measured above), which drops its restated
literals and adds username `maxlength="30"` and passwordConfirm `minlength="8"`. Fleet repos adopt on demand;
the measured codemod above is available as an adoption aid.

## Guardrail check (§5, 1–13)

1. Zero deps: pass. No TypeBox or Fastify import; TypeBox objects fit structurally.
2. Hot path: pass. In-process min-of-40 blocks, 3 runs (`$R/bench/bench3.mjs`): no-schema form 3,745 / 3,785 /
   3,741 ns (8.1.0) vs 3,745 / 3,752 / 3,756 ns (prototype). Schema vs the hand-restated equivalent with identical
   HTML asserted (`bench2.mjs`): 4,598 vs 4,503 ns (+2%) for a 7-control form. Machine load average was 64 during
   the runs; cross-process medians were too noisy to report.
3. Escape: pass. Values go through the typed numeric setters and the normal attribute escaping; no new sink.
4. Type-safety: pass. T explicit; schema keyed by T (`-?` over `keyof T`); nothing inferred through a wrapper.
5. Instruction set: pass. Needs the binding (see check above); no component.
6. Pure core: pass. Plain JSON Schema data; Fastify's `{ body }` bag is refused and only named in an error.
7. Converge: pass. Names what it replaces; one seam.
8. Naming: pass. `schema` is the JSON Schema and Fastify term; `set*` override semantics kept.
9. Class-string contract: N/A (no classes).
10. Runtime grammar: N/A for htmx; the HTML attributes are verified on chromium, firefox and webkit.
11. Breaking: N/A (additive).
12. Enforcement over prose: net 0 guideline lines, the restating example removed.
13. Append-only styling: N/A.

## Scorecard prediction

- **Silent-failure resistance +0.5**: the valid-paste-destroys-input path (400 ErrorPage over the form) closes for
  every form that passes its schema; 362 of 6,782 fleet renders gain limits their views omitted. Not +1: passing
  `schema:` is itself unguarded.
- **Cross-file invariant safety +0.5**: one source of truth for a limit across `[feature].schema.ts` and the view;
  another body's schema fails to compile and names the missing fields.
- **Context economy +0.5**: one key replaces per-control restatement (228 setters gone in the dry run), guideline
  lines net 0.
- Error quality: the likely wrong guess (the bag) gets an error naming `.body`; too narrow to move the dimension.

## Alternatives considered

- **Template wrapper over FormBinding** (`boundForm(schema, …)`): re-implements 8 members, drifts as the lib adds
  members, a second way to bind. Rejected (§5.7).
- **Infer T from the schema** (`Form(schema, state, build)`): needs TypeBox `Static` (a dep) or a JSON-Schema-to-TS
  mapper, and overlaps L-097, which waits on RouteDef carrying a body schema. Rejected for this lane.
- **Accept the route schema bag `{ body }`**: matches the controller's `schema: contactSchema`, but makes Fastify's
  route-schema shape a core seam (§5.6). The guess gets a fix-naming type error instead; 0/3 agents made it.
- **`required` for every key in `required`**: blocks empty submits the server accepts (`email: Type.String()` in 4
  scaffold auth bodies). Rejected; the minLength >= 1 rule matches hand-written code 184/184.
- **Turn the 400 into a 422 server-side** (`attachValidation`, F-E-401 / F-E-901): keeps values but still
  round-trips every overlong paste; complementary, not a replacement (0 canonical repos use it).
- **Lint for restated setters**: catches restatement, not omission, and needs cross-file resolution of T.

## Open questions (for curation)

1. **Astral-plane counting.** Fastify's ajv 8.20.0 counts code points (`maxLength: 10` accepts 8 emoji); browsers
   count UTF-16 units (`maxlength="10"` keeps 5 emoji on 3/3 engines, `node $R/pw/pw3.mjs`). For maxlength the browser
   is stricter or equal (never lets an overlong value through, can stop emoji-heavy text at half the server limit);
   for minlength it is looser for astral text (a 400 stays possible). Recommend shipping as is and documenting it
   in the JSDoc.
2. **`pattern` / `format`**: skipped (JSON Schema pattern is unanchored, HTML pattern is anchored and compiled with
   the `v` flag). 2 `pattern` keywords in Form<T> bodies, 0 `setPattern` calls in the canonical fleet: no demand.
3. **Select `required`**: 4 `f.select(...).toggle("required")` sites in 2 repos. A select bound to a literal union
   always submits a value unless an empty option exists; left out.
4. **Unguarded omission of `schema:`**: a lint would need cross-file resolution of T to a body. The template is the
   carrier (its views pass the schema); worth a later rule if the next scan still finds omissions.
5. **Optional + minLength >= 1** (empty submit still 400s): 0 directly bound sites in the canonical fleet today; the
   rule stamps no `required` for optional keys.
