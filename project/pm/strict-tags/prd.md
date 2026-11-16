# Strict Tags: fluent-html rewritten so that what compiles is a correct app

Draft 3, 16. 11. 26. Revised against the
[first review](../../research/from-scratch/2026-11-15/strict-tags-gate/prd-review.md) and against a
second review of six findings. What each finding changed is listed under
[Review](#review-16-11-26).

## Problem

Claude Code is the primary user, and the goal across the lanes is that an app which compiles is a
correct app ([decision](../../../../projects-template/project/pm/decisions.md), 15. 11. 26). The
from-scratch round ([prd](../from-scratch/prd.md),
[gate verdict](../../research/from-scratch/2026-11-15/gate/verdict.md)) ended with one design that
moves that goal, and a list of things it has not earned yet.

- **Where fluent-html 8 stands.** It rejects 13 of 34 seeded mistake kinds before the code runs and
  ships 11 unnoticed. None of the 6 security kinds stops before run (N4).
- **What the harvest cannot reach.** Fluent Nine rejects 15 of 34 at half the session cost. It
  leaves HTML's own rules (nesting, labels, names) to html-validate: 1 of 11 HTML kinds stops at
  tsc, against 8 of 11 in Strict Tags (N4).
- **What Strict Tags has shown.** 24 of 34 before run, 5 shipping. On neutral references (four
  sessions, $5.62, [gate](../../research/from-scratch/2026-11-15/strict-tags-gate/gate.md)) its
  worse run of 22 turns is 31.3% under the control's better run of 32 (N1). K4 holds beyond the
  spread: 2 and 0 html-validate errors against 3 and 5 (N2). No session read or wrote outside its
  folder: the scan flags 28 calls in the four transcripts, each read as a route string, a comment,
  a relative import or an asset URL (N15).
- **What it has not shown.**
  - **Tokens and cost.** Its worse run of 24,691 output tokens is 16.6% under the control's better
    run, short of 25%, and 32.7% over the floor's better run. Its mean cost of $1.066 is 12.3% above
    the floor's $0.950 (N1). No kill in draft 1 could fail on either.
  - **First compile.** 0 of 2 against the control's 0 of 2. Both failures are rejections of valid
    code: plain `FlowKid[]` children in a `section`, and an annotated class table (N3).
  - **The htmx hatch.** HX-1 and HX-7 ship through `wire` and `local()`.
  - **The stale region.** HX-8 in four spellings (counter, badge, flash, search): no design catches
    any of them before run. A full-layout default makes the default spelling correct everywhere
    except Strict Tags' header badge, and impossible by construction nowhere
    ([suite](../../research/from-scratch/2026-11-15/gate/mistake-suite-stale-region.md), N4).
  - **Its own brands.** 8 of 8 ways to forge a brand compile today: the brand classes are exported
    with public constructors, and a cast or an `any` passes. A forged element and a forged class
    list render unescaped (N14). Eight more need no cast, no `any` and no silencing comment: a type
    predicate, an overload signature, an object literal, an ambient declaration, three mutable
    aliases and a module augmentation. All eight compile on the fleet's three compilers (N19).
  - **Check time.** On CPU time, over three local runs under load, it costs 2.4 to 4.5 times
    fluent-html 8 at 2,000 styled elements and 3.8 to 8.7 times at everyframe-composer's 11,330, on
    the fleet's three compilers (N13, N20).
  - **An app.** There is no server, no Fastify mount and no browser run, and nine apps sit on the
    old surface.
- **What a rewrite costs that no kill measures.**
  - **Exemplars.** It starts with zero. The template's and the nine apps' views are what in-repo
    sessions copy today.
  - **Guidance.** 112,684 B of the template's `CLAUDE.md` and six references teach the old surface,
    and two live lint rules forbid what the new one writes (`.map`, a ternary between views) (N17).
  - **Plugins in the trial.** Every arm loaded 5 plugins, the control included. They are the same
    in each arm, and what they add to the context is not measured (N15).

## Appetite (proposed)

Three bets, each ending at a gate that can close the scope. Nothing past a gate is committed.

1. **Gate 1, five days, in two steps.** Draft 1 said two days; the review counted the work and it
   does not fit.
   - **1a, four days, no sessions ($0).** The seeds, their expected diagnostics and the forging
     list registered first. Then the hatch removed, `doc()`'s swap root moved to the layout, the
     route table with the house rule, the live search wire, the class surface, the false
     rejections, the brands' private member and the package's exports, the lint config, the
     reseeded suite and the check-time script on a runner. It ends on S3, S4's controls, S5 and
     S9. A miss here stops before any money is spent.
   - **1b, one day, at most $10.** A neutral reference for Strict Tags and for the floor, then one
     session round: Strict Tags, the neutral floor and the control, twice each (sessions have cost
     $0.95 to $1.75, so six cost about $7.50). It ends on S1, S2, S4's sessions and
     S6.
2. **Gate 2, one week.** The package under its own name, a mount on bare Fastify, a browser run and
   the whole-session trial. The trial is priced before it runs.
3. **Migration, no appetite yet.** It is set after the smallest app (fl-um) has moved and been
   priced.

On a miss the scope is archived `Outcome: killed`, and harvest row 20 (content models and labelled
controls on fluent-html's own factories) takes its place.

## Solution

### 1. The gate as it stands

The verdict set three conditions. One holds, and two are open (N1, N4).

| Condition | Reading | Status |
|---|---|---|
| Worse run at most 29.25 turns or 23,860 tokens | 22 turns, 24,691 tokens. Against the neutral control's own lines (24.0 turns, 22,213.5 tokens) the reading is the same | **Holds, on turns only** |
| Worse run beats the neutral floor's better run on turns | The neutral floor arm was not run. Against the floor's task-shaped runs (28 and 25), its best case, 22 is 12.0% under 25 | **Open.** It is an arm of Gate 1b |
| Hatch closed, suite still at least 24 of 34, all 13 of fluent-html 8's kinds rejected on the suite's seeds | 24 of 34 with the hatch open; 11 of the 13, because HX-1 and HX-7 ship | **Open.** First build task of Gate 1a |

- **One trace is left in the package.** The comment "(a sort link, a pager)" in `core.ts`, which
  run 1 read. It goes with `.load()` itself (section 3).
- **Read cost and tokens beside turns.** Run 2's 12 turns are ten Bash calls and one Read, with
  whole files in heredocs. S1 now reads three measures.

### 2. The surface

Strict Tags as built: lowercase tag functions, one argument list in any order, HTML's content
model and accessible names in the types, one brand per output context, synchronous views
([design](../../research/from-scratch/2026-11-15/gate/strict-tags-design.md)).

**The done condition is two commands: `tsc` and `eslint`.** Draft 1 said tsc alone. That was
false: a brand is only as strong as the ban on forging it, and tsc cannot see a cast (N14). Both
commands are what every app's check already runs, and the fleet's lint is already typed (N16).
Nothing third is added.

**What the two commands do not promise.** Draft 2 said only the function that owns a brand can make
one. That is false too. TypeScript accepts a mutable value under a wider alias, and no lint rule
sees it, so a content-model mark can still be moved onto an element that does not have it (N19).
The promise is narrower and is S9's: every forging spelling on a registered list is refused or
named, and no spelling, named ones included, makes a sink write unescaped output.

This PRD changes six things in the surface as built:

1. **The route table.** Parts and actions hang off a page (section 3).
2. **The house rule.** Section 3.
3. **The class surface.** Section 4, item 5.
4. **The hatch.** Removed (item 2).
5. **The brands and the package's exports.**
   - A brand carries a private member and leaves the package as a type only. No constructor is
     reachable and no object literal fits one, so tsc refuses both.
   - The attribute and content tables leave as type aliases, which an app cannot merge into.
   - A sink asks for the private member at run time. A value that reached it without its owner is
     escaped as text or refused, whatever its type says.
   - What tsc cannot see goes to lint (section 8), and what neither sees is named (S9).
6. **A form needs a submit control.** A mark its subtree must hold, so html-validate's `wcag/h32`
   becomes a tsc error (section 4, false rejections).

A sketch, not compiled. The type rules it leans on are probed (N5). Path params are as built;
`confirm` and the guard slot are not in the probe.

```ts
export const projects = routes("/projects", {
  list: page("/", { q: "string?", sort: "string?" }, {
    rows: { reason: "search", owns: ["q"] },
    create: action(ProjectInput),
    archive: action(),
  }),
  detail: page("/:id", { id: "number" }, {
    status: { reason: "poll", every: "2s", max: 150, live: ["queued", "running"], settled: ["done", "failed"] },
    remove: action({ confirm: { title: "Delete project?", confirm: "Delete project" } }),
  }),
});

a(projects.detail({ id }), "Apollo")                // a link answers the page
button(projects.detail.remove({ id }), "Delete")    // an action answers a redirect, or its page again with 422
a(self({ sort: "name" }), "Name")                   // self is this page with its query as it is on screen, q included
const s = self.rows.search();                       // the one wire that names a part; it writes name and value itself
form(s.form, label("Search", input(s.input, { type: "search" })), button({ type: "submit" }, "Search"))

handlers(projects.list, {
  guard: signedIn,                                  // one slot per page: its parts and actions share it
  page: async ({ input, self, parts, forms }) =>    // input has no q
    ProjectListPage({ sort: input.sort, self, rows: await parts.rows(), form: forms.create }),
  parts: { rows: async ({ input }) => ProjectRows(await findProjects(input.q, input.sort)) },
  actions: {
    create: async ({ body, redirect }) => redirect(projects.detail({ id: (await createProject(body)).id })),
    archive: async ({ redirect, self }) => { await archiveDone(); return redirect(self()); },  // back to the list as it is on screen
  },
});
```

### 3. The house rule, in types

**The full layout is the default answer.** A link, a form and an action answer the page, and every
region on it is re-rendered from one load.

- **A mutation never answers a fragment.** An action answers a redirect to a page, a redirect off
  the site (`leave(url)`: a checkout, an OAuth start), or its own page again with status 422 and
  the form's values and errors. A handler that returns a part is a tsc error whose first line says
  "a mutation answers its page: return redirect(page)" (N5). There is no form region to aim at, so
  HX-3 cannot be spelled.
- **The swap root is the layout, not the `main` landmark.** `doc()` puts the root around header,
  main and footer. This closes the one spelling a full-layout default left live in Strict Tags (the
  header badge, N4).
  - **It is Gate 1a work, checked for $0.** The suite's oracle reads the full-layout badge control
    as live today. After the move S3 asks for not-live.
  - **Outside the root:** `head`, and elements the client owns.
  - **In the template** it changes what `#main-content` holds, which is the template lane's change
    after Gate 2.
- **No target is ever written, and a part is not an address.** `wire`, `local()`, `.fire()`,
  `.load()` and `.change()` are removed. A part's ref is refused on `a` and on `button` (N5).
  `fire()` is HX-8 as a documented opt-in (`full-layout/cbc.fire.ts` reads live). A sort link and a
  pager are page links; a filter select is a GET form to its page.
- **The trigger is not the target.** A form may submit on change (`{ submit: "change" }`) and still
  answer its page. That covers autosave, a live preview and a dependent field without a reason. In
  the fleet, 44 `.onChange()` calls sit in app code; the 28 that resolve to a route all name a page
  answer, 15 of them a mutation, and 3 name a target region (N12).
- **A targeted swap is a part, and a part names its reason from a closed union.** A part with no
  reason, or with a reason outside the union, is a tsc error whose first line names the three and
  says "without one it is a page: link to it" (N5). Three members; a fourth is open call 6.
- **A machine is outside the rule.** A route that answers no markup (bytes, JSON, a webhook) swaps
  nothing. It is a fourth kind in the table, its ref goes on a link as a full navigation and on
  nothing else. The fleet has 157 (N12). Not probed.

| Reason | What the declaration carries | What tsc refuses | What still compiles and is wrong |
|---|---|---|---|
| `"search"` | The query keys it owns | The page handler reading an owned key; a key the page does not have; a search that owns nothing; a link that sets a query key and drops the owned one without saying so; an action's redirect to its own fresh page; a body field named like an owned key | A handler that reads the key off the raw request. A handler annotated by hand with a wider context than the exported one, which hides the fresh-page redirect. A region the page loads without the key (a total) is not stale: the search does not change it |
| `"poll"` | `every`, `max`, the states it runs in (`live`) and at least one it stops in (`settled`) | A poll without its bound; a poll with no settled state; a state both live and settled; an answer in a state it did not declare; a bare view; a handler table without the `stalled` view | A handler that reports a live state for a finished job. The bound ends it after `max` requests. A region outside the part that shows the polled state lags until the poll settles |
| `"defer"` | Nothing | A trigger, a method | Nothing known |

**Search: the page cannot read the key, and cannot lose it either.** The search spelling of HX-8
is a count outside the list computed from the same query.

- **Owned keys.** Only the part's handler receives `q`, so that count cannot be written outside
  the part. The page places the part with `parts.rows()`, which runs the part's own handler, so the
  first render and the swap share one loader.
- **The hole draft 1 opened.** A page that cannot read `q` could neither show it in the search box
  nor keep it in a sort link, so a reload emptied the box and sorting dropped the search.
- **`self` closes the first render, a submitted search and the no-JavaScript path.** The page
  handler gets `self`: this page with the query of the request kept.
  - `self({ sort: "name" })` is the link that changes one key and keeps the rest, `q` included.
  - `self.rows.search()` is the only search wire there is. It writes the input's name and its
    value, and the form's native action is the page.
  - A link built from the static route that sets a query key says what happens to the owned one:
    `projects.list({ sort: "name" })` is a tsc error whose first line names `self` and
    `q: undefined`. `projects.list()` is the fresh page and compiles.
- **The hole draft 2 left: the live value.** `self` was built from the query of the last render,
  and the search wire swapped the part without touching the URL. After the user typed:
  - the sort link outside the part still held the old query, so sorting dropped or reverted the
    search;
  - a reload showed an empty box over an unfiltered list;
  - every full-layout answer the search did not send rendered from the old query and wiped the
    search: a poll settling, a 422, a redirect built from the action's input.
- **The live value now travels with every request the page sends.** Three rules for the wire and
  its answers, and one in types.
  1. **The search answer replaces the URL.** The part's answer names the page's URL for the query
     it was asked (`HX-Replace-Url`). The address bar follows the box, and a reload renders both
     from it. The part's own address is derived and never shown.
  2. **Every other request includes the search control.** A link or a GET form built from `self`,
     the poll's tick and the page's action forms and buttons name the control in `hx-include`.
     - On a GET the included value replaces the key in the URL. The `href` keeps the render-time
       query for the no-JavaScript path, and the request carries the live one.
     - On a POST it rides in the body, and the library takes it out before the schema parses.
     - A link that names the key itself (`projects.list({ q: "apollo" })`) includes nothing: what
       it says wins.
  3. **Every full-layout answer is rendered from the request that asked for it.** The 422, the
     settled poll and the redirect through `self` therefore place the part with the live key and
     write the box with it.
  4. **In types.** An action handler gets `self` too. A redirect to its own fresh page is a tsc
     error whose first line names `redirect(self())` and `q: undefined`. A body field named like an
     owned key is a tsc error (N5).
- **A field the request did not carry is left alone.** htmx 4's morph writes a text field's value
  only where the answer's `value` attribute differs from the one in the DOM, and never on the
  focused control. A half-typed field in another form has the same attribute in both, so a
  full-layout answer does not overwrite it (N21). The one exception found is open item 5.
- **Read from source, not run.** Rules 1 to 3 and the morph's behaviour are read from htmx 4.0.0
  (N21). No browser has run them.
  - **Gate 1a** checks that the refs write the wire: on the search control's page the suite's
    oracle reads the include on every request control and the page URL on the part's answer (S3).
  - **Gate 2** runs it: five rows of S7.
  - **Until S7 is green the live value is listed as open** (below, item 4).

**Poll: the stop is declared, and the bound does not restart.**

- **The stop is not the handler's job.** The declaration lists the states the poll runs in and the
  states it stops in. The handler answers `{ state, view }`, and the library decides whether the
  root polls. HX-4's seed ("polls in every state, the finished one included") needs `settled: []`,
  which is a tsc error.
- **The hole draft 1 left.** When the bound was reached the page answered and placed the part
  again, so the poll resumed. The bound limited one cycle.
- **The bound now ends on the part.** The request count rides the poll's own URL. At `max` the
  library answers the part's `stalled` view with no trigger, never the page, so nothing places the
  part again. One page load makes at most `max` requests per poll. A reload is the user's act and
  starts a new count.
- **Settling answers the page.** When the state moves from live to settled on a tick, the full
  layout answers, so a region outside the part that showed the polled state is fresh. The page then
  places the part in a settled state, with no trigger. The tick includes the search control (rule
  2), so the settled page keeps a search typed since the last render.

**Where each stale-region spelling of the suite lands.**

| Spelling | In Strict Tags after this section | Rung |
|---|---|---|
| Counter, flash (a delete swaps the list only) | An action cannot answer a part | tsc (N5) |
| Badge (a nav badge outside the swapped region) | The same refusal for the targeted spelling; the default spelling reaches the header because the root is the layout | tsc for the mistake; the suite's oracle at Gate 1a for the default (S3), then S7 |
| Search (a count outside the searched list) | The page handler has no `q` | tsc (N5) |
| Live search (typed, then sorted, settled or posted) | Every request the page sends carries the control; an action's redirect to its fresh page is refused | tsc for the redirect and the body field (N5); the oracle at Gate 1a for the wire (S3); S7 for the behaviour |
| `fire()` (a post that swaps nothing) | No such API | Cannot be spelled |
| The route-option `target` hatch | No target argument exists; a part ref is refused on `a` and `button` | tsc (N5) |

- **Probed, not built.** `probe/house-rule.ts`: 18 seeded mistakes, 18 error lines, none missed
  and none stray, on TypeScript 5.9.3, 6.0.3 and 7.0.2. 12 of the 18 first lines carry the fix
  (N5). Not in the probe: `leave`, the change trigger, the machine kind and path params.
- **Precedent.** The same rule typed onto fluent-html 8's routes turns the delete spellings into
  tsc errors; the search spelling and the route-option `target` hatch still compile there (N4).
  Here the hatch is gone and the search key is owned.
- **Named as open.** Five things are wrong or unproven, and this PRD does not close them:
  1. A handler that reads an owned key off the raw request. The handler context still carries the
     request, for cookies and headers.
  2. A handler that reports a live state for a finished job. The bound absorbs it at run time.
  3. A search part that needs a second region outside itself to follow the key. The answer is one
     part around both; two parts cannot own one key.
  4. The live search value in a browser. The wire is designed, type-probed and read from htmx's
     source. It closes when S7's five rows are green, not before.
  5. A form answered with 422, then a full-layout answer from another request (a poll settling).
     That answer does not know the posted values, so it renders the form empty and the morph resets
     every field but the focused one. S7 has a row that shows it. Nothing here prevents it.

### 4. What the verdict said to settle first

| # | Item | Decision | How it is checked |
|---|---|---|---|
| 1 | Confirmation round | Section 1. Gate 1b adds the neutral floor arm | Kill S1 |
| 2 | Close the htmx hatch | Removed, not narrowed: an element takes a route ref and nothing else. HX-1 and HX-7 cannot be spelled | Kill S3 |
| 3 | The three kinds nothing catches | HX-8: section 3. HX-4: the stop is declared and the bound ends on the part. PURE-1: TypeScript has no effect types, so one lint rule on view files (imports from an allowlist, no `await`, no clock, no `process`), counted on the suite's check rung | Kill S3 |
| 4 | False rejections | Below | Kill S4 |
| 5 | Tokens and the class surface | Tailwind's own class text with prefix variants, checked by Fluent Nine's grammar (641 of 641 tokens). Variant functions, the 237,305 B generated union and `tools/check.mjs` go. A conflict merges by family, later wins (row 19). The gate measured variant functions, so Gate 1 is this choice's first measurement | Kill S1 on tokens and cost, kill S5 on check time |
| 6 | Whole-document facts | Not typed. The development throw extends from documents to fragments, a part takes a scope, and one generated test renders every route's declared states | The suite's ID-1 and ID-2 stay "runtime (throws)" |
| 7 | Check time | A budget at two sizes and a route table, read as ratios from one script on the fleet's three compilers (S5). Error positions are measured on all three: the same counts on six configs and the 81 mistake errors at the same 81 positions; 7.0.2 gives 5 of them another code, 6.0.3 none (N6, N24) | Kill S5 |
| 8 | Scope and owner | Below | Gate 2, open call 5 |

**Owner of the handler table (item 8).** Draft 1 gave it to stack-dsl's Actions piece. That piece
was folded into R08, a law and not a table, so nothing will be built there to reuse.

- **The package owns the table.** The declarations, the refs, `handlers()` and the function that
  turns a request into an answer (status, headers, body) live in the strict package, as the
  prototype already has them. Both ends of the wire then have one owner: the attributes a ref
  writes and the answer they expect. The suite shows why: Lean Tags absorbed the mutation spellings
  only through its adapter, and "a different adapter would ship the stale region". The live search
  needs it too: the include a ref writes and the key the answer reads are one contract.
- **No server ships from it.** The package imports no Fastify and listens on nothing. It has a slot
  per page that the app's guard fills, so a part or an action cannot be less guarded than its page.
- **The mount is the only adapter code.** It registers each route on Fastify and hands the request
  over. In Gate 2 this scope writes it against bare Fastify in a scratch scaffold, outside the
  template, as the subject of S7. Nothing in the template changes from this scope.
- **After Gate 2 the template owns the mount,** beside `defineController`, in a scope of its own
  (open call 5).
- **R08 still applies.** Its invalid-body law runs over this table as over any other: every action
  posted an invalid body answers 422 with its page.

**False rejections (item 4).** Each becomes a registered valid control before Gate 1b.

- A whitespace-only string is text. Run 1 of the first trial lost a round to `" "`.
- A single-word string child is text. Only a child of two or more tokens that are all classes is
  refused, which keeps the suite's TW-6 seed (`div("flex gap-4", …)`) a tsc error and removes the
  38-name list.
- Plain `FlowKid[]` children fit `section`, `div`, `li` and `td`. Declared content is asked only
  inside `form`, `a`, `button` and `label`. This is run 1's neutral failure (N3).
- A class table annotated with the exported class type compiles. This is run 2's neutral failure:
  5 of its 6 errors (N3).
- A spread keeps its route and attributes (`a(route, ...rest)`).
- A label tied to its control by `for` and a derived id is accepted.
- `doc()` loads htmx 4 and the stylesheet. A session loaded htmx 2 under htmx 4 attributes.
- The class grammar accepts marker classes (`peer`, `htmx-indicator`) and bare utilities
  (`rounded`).
- **A form with no submit control is a true catch, not a false rejection.** Both of Strict Tags'
  html-validate errors at the gate are `wcag/h32`, and the house rule makes every search a form, so
  K4 was at risk from the design. `form(…)` now requires a submit control somewhere in its subtree.
  Probed: 3 seeded, 3 errors, 5 valid shapes pass, on the three compilers. A component whose
  children may hold anything is not refused, which is a miss and never a false rejection (N5).

### 5. Harvest rows this scope takes

Rows are the gate verdict's. Rows that are not breaking ship from fluent-html's own releases either
way and are not this scope's work.

| Row | In Strict Tags |
|---|---|
| 1 `type="button"` by default | As built; a submit button says `{ type: "submit" }`, and a form needs one |
| 2 Class text as the styling surface | Item 5. On the legacy package this scope needs only the additive half (`.tw()` in an 8.x minor). The tombstones are not this scope's (section 8) |
| 3 The sink table, 4 `Raw` from a literal | As built: 0 escapes of 206, XSS-1 and XSS-5 at tsc. Each sink now also asks for the brand's private member at run time (section 2, item 5) |
| 5 Verbs in the package, 16 no `hx-*` attribute names | No verb and no `hx-*` name exists; the wire is the route ref |
| 6 One short reference, examples compiled | Kept, plus the htmx version, and a check that no example shares a noun with a trial prompt |
| 7 The route owns the 422, the poll and the form's ids | Turned by the house rule: the page owns the 422 |
| 8 Derived ids take a scope, 14 a part answers its own root | As built, and a part takes a scope too |
| 9 Class positions by type | Item 4 |
| 10 Diagnostics carry the fix | 56 of 81 first lines carry it on the three compilers (N6, N24); the widened-view and component messages are still raw |
| 12 Confirm through a native dialog | `confirm` on the action |
| 15 Close the hatch, 17 `Img` needs `alt` | Item 2; as built |
| 18 The mistake suite as a release gate | Kill S3 |
| 19 Family merge | Item 5 |
| 20 Content models on the fluent factories | Not taken. It is the fallback if this scope is killed |

### 6. From Page Parts

| Taken | Not taken |
|---|---|
| One declaration per interaction: parts and actions hang off a page and share its URL, params, query and guard | Regions first, and the 422 as the form region alone |
| Only a page has a path. A part's and an action's address and ids are derived, with path params and a scope | Derived markup (`f.field`, `Search`, `List`): the customisation cliff, and the earlier verdict against derived screens |
| A part cannot be less guarded than its page | `refresh(regionA, regionB)`: a targeted answer to a mutation |
| The poll's stop is part of its declaration | The `local()` hatch (its HX-7 miss) |
| One loader per part, for the first render and for the swap | A second class checker (a false positive in 3 of 4 runs) |
| It works without JavaScript: search is a GET form with a submit control, an action is a POST form | Guards and loaders inside the library |

### 7. Kills, registered before any build

Gate 1a is S3, S4's controls, S5 and S9. Gate 1b is S1, S2, S4's sessions and S6. Gate 2 is S7 and
S8. Every line of a kill must hold. "Today" is the reading on the prototype as built.

| # | Kill | Today |
|---|---|---|
| S1 | On neutral references, two runs per arm. **Turns:** the worse run is at least 25% under the control's better run, on `num_turns` and on distinct message ids, and beats the neutral floor's better run. **Output tokens:** the worse run is under the control's better run, and the mean is at most 20% above the neutral floor's mean. **Cost:** the mean is at least 25% under the control's mean and at most 15% above the neutral floor's mean | Turns 31.3% and 46.2% under; floor arm not run. Tokens: 16.6% under, and 17.9% above the floor's task-shaped runs. Cost: 38.8% under, and 12.3% above (N1) |
| S2 | K2, K3 and K4 hold as registered in the [from-scratch PRD](../from-scratch/prd.md); K4 on session output, beyond the spread | Hold (N2) |
| S3 | `node run.mjs all` on the reseeded suite. **Share:** at least 27 of 34 before run, all 13 of fluent-html 8's kinds rejected, at most one kind "nowhere". A rejection counts only on its `✗` line with the message registered for it; "property does not exist" on a removed API is a miss. **Full layout:** each full-layout control that can still be spelled (badge, counter, flash, search) reads not-live on the suite's oracle. **Live search:** on the search control's page every request control (a `self` link, the poll's root, an action's form or button) includes the search control, and the part's answer names the page URL to replace | 24 of 34, 11 of 13, 5 nowhere. The full-layout badge control reads live (N4). The prototype's wires write no include, and its search answer names no URL |
| S4 | No registered valid control is rejected: the 20 controls, the two review probes (9 and 5 errors today), the two neutral first-compile shapes and the 5 form shapes. In the sessions, no first failing type-check holds a false rejection | 14 errors on valid probes; 6 false rejections in 2 runs (N3) |
| S5 | On a GitHub Actions `ubuntu-latest` runner, one script runs both libraries in turn on each of the fleet's three compilers (5.9.3, 6.0.3, 7.0.2) and reads ratios of CPU time, best of 3. It runs twice, and the larger ratio counts. **Elements:** strict costs at most twice fluent-html 8 at 2,000 styled elements and at 11,330. **Routes:** the route and handler tables at everyframe-composer's size (65 files, 138 pages, 379 parts, 364 actions) add, over a one-page table, at most 1.25 times fluent-html 8's 2,000-element check. **Lint:** eslint with the strict config on the 11,330-element file takes no longer than the template's config on fluent-html 8's. **Positions:** the same error positions on the three compilers | No runner reading yet. Three local runs under load, as previews, all over the cap. Elements at 2,000 and at 11,330: 2.4 to 2.8 and 3.8 to 6.0 times on 5.9.3, 3.1 to 3.7 and 4.8 to 5.2 on 6.0.3, 3.6 to 4.5 and 7.4 to 8.7 on 7.0.2 (N13, N20). Routes: 0.6 to 1.0 times the reference (N20). Lint not measured. Positions hold on the three (N6, N24) |
| S6 | The reference is no longer than the control's, and no example in it shares a noun with the trial prompt | 11,591 B against 67,520 B; 0 names (gate) |
| S9 | The forging list is a registry: `forge/forge.ts`, 16 spellings today, each filed with the rung that must refuse it. **Refused:** the 13 a rung can see fail tsc or eslint (a constructor, a cast, an `any`, a silencing comment, a type predicate, an overload signature, an object literal, an ambient value, a module augmentation). **Named:** the 3 no rung sees (a mutable array, property or method parameter under a wider alias) are listed as open and counted. **Escaped:** every spelling that compiles is rendered, the 3 open ones included, and none makes a sink write markup, a class list or a URL unescaped. **Kept current:** a spelling found later is added with its rung, or to the open list, and the kill is read again. **Quiet:** the lint config reports nothing on the valid controls or on the reference's examples | 16 of 16 compile, and no lint config exists. On a probe of the brand shape, with 14 of the 16: 4 fail tsc, 7 fail eslint, 3 pass both and nest a button in a button, a string under a class-list or element alias renders escaped, and valid code gets 0 reports (N14, N19) |
| S7 | In a browser, on three engines: search, poll, 422, redirect, dialog. Each wire is green and no region is stale after any of them. **Search, submitted:** the box shows the query after a reload and with JavaScript off, and sorting keeps the search. **Search, typed with no submit:** (1) the sort link keeps it, (2) a reload shows it in the box over the filtered list, (3) a poll that settles keeps it, (4) a 422 keeps it, (5) an action's redirect through `self` keeps it. **Typed fields:** a half-typed field in another form survives a settling poll. **Poll:** one that never settles stops after `max` requests on its stalled view. **Shown, not required:** a 422 followed by a settling poll (open item 5 of section 3) | Not run |
| S8 | The whole-session trial (the stack-examination task: 107 turns for fluent-html 8), two runs per arm: at least 25% fewer turns than fluent-html 8 beyond the spread, at no higher mean cost, and no more turns than the floor | Not run |

- **S5 fails today, and can fail at the gate.** The class surface is the bet: before its first
  element the strict library costs 1.73 s of CPU on 5.9.3, more than fluent-html 8's whole
  2,000-element check at 1.58 s (N13). If class text does not bring the ratio under two, the scope
  stops at Gate 1a with nothing spent on sessions.
- **Where S5 is read.** Draft 2 asked for an idle machine and named none. This one stood at a
  1-minute load of 76 to 230 on 10 cores, with its swap full, through the second review and this
  revision, so that reading might never have been taken.
  - **Not here.** A ratio of CPU times does not survive this machine's load. Two passes of one
    script, back to back, read 9 to 49% apart on the six element lines: 6.03 and 4.05 at 11,330 on
    5.9.3. Against draft 2's run the first pass reads higher on all four shared lines and the
    second lower on three, so the error has no direction to lean on (N13, N20).
  - **On a runner.** GitHub Actions `ubuntu-latest`, where fluent-html's tests already run and
    nothing shares the machine. The script generates its own inputs, so it needs the three
    compilers and nothing from the apps.
  - **Twice, and the larger ratio counts.** Both sides of a ratio run in turn inside one round, so
    a noisy neighbour meets both.
  - **A local run is a preview.** It decides nothing either way. Today every local reading is
    over the cap of two, on every compiler and in every pass.
- **The caps in S1 and S5 are proposals.** Their levels are open call 3.
- **S8's arms are whole template sessions.** Each loads the `CLAUDE.md` written for its surface,
  as the 107-turn baseline did. The No-Go on our `CLAUDE.md` covers Gate 1's arms only.
- **S3's seeds are registered before the build.** 37 seed files are Strict Tags'. 8 use a removed
  wire and 14 the route table that changes shape (N18). Each rewritten seed is filed with the first
  line it must produce before any library code changes. The house-rule kinds already have theirs:
  the probe's 18 lines (N5). The full-layout `fire` control is withdrawn with the API.
- **S3's live-search line is a new reading in `oracles.mjs`.** It is static like the rest: it reads
  attributes and headers on the rendered answers, not behaviour. Behaviour is S7's.
- **What S3 expects.** 24 today, plus HX-1 and HX-7 (the hatch), HX-8 (all four spellings) and
  PURE-1 (lint): 28. HX-4 gets a second spelling, a handler that never settles, which the bound
  absorbs at run time, so the kind counts as "runtime" under the suite's weakest-spelling rule.
  The kill sits one below 28.
- **What S9 does not claim.** That a mark cannot be forged. Spellings 13 to 15 are TypeScript's own
  rule for mutable values, and they stay open. What they produce is invalid nesting in escaped
  markup, which html-validate still reads on the rendered answer; they do not reach a sink raw.
- **Where the 16 are filed.** Spellings 1 to 8 in `$F/forge/forge.ts`, 9 to 16 in
  `$G/forge/forge.ts`. Gate 1a merges them into the package's own file before the build.

### 8. Migration

**The release rule: nothing breaking reaches an app whose owner did not ask.**

- **Who follows a moving ref (N11).** Of 70 `fluent-html` entries in 67 `package.json` files, 34
  sit at a SHA. 29 follow the default branch (23 name `#main`, 6 name no ref), 3 say `*` and 2
  point at the local folder. 6 of the 8 census apps and the template's full-stack app follow
  `#main`; only fl-um (a SHA) and fluent-html-home-page (a vendored tarball) are pinned. Draft 1
  said most were pinned. Half are not, and following `#main` is how the census apps and the
  template pin today.
- **So the strict surface is a package of its own,** under its own name and its own ref (working
  name `strict-tags`; open call 2). An app gets it by adding the dependency, which is its owner
  asking. Its tags never move, and an app pins one.
- **`fluent-html`'s `main` takes nothing breaking from this scope.** The bridge lives in the
  strict package, which takes `fluent-html` 8 as a peer during coexistence. The one thing this
  migration wants on the legacy surface is additive: `.tw()` in an 8.x minor, with the old styling
  methods left in place.
- **The harvest's breaking rows are not this scope's, and this scope does not wait for them.**
  Draft 1 put the strict entry point inside 9.x beside them; a 9.0 on `main` would have reached
  those 29 entries unasked. Whoever merges a breaking change to `main` owes an `8.x` line and a re-pin
  first, and `pins.sh` is the check.

**What moves (N7, N8).** Eight of the nine census apps are at their paths. The ninth,
`website-sales-funnel-automation-system`, has no directory there.

| App | Files importing fluent-html | Lines in them | Fragment routes (mutations) |
|---|---|---|---|
| fl-um | 67 | 6,418 | 4 (3) |
| fluent-html-home-page | 60 | 9,214 | 0 (0) |
| studio | 82 | 10,434 | 1 (0) |
| everyframe | 105 | 15,579 | 2 (2) |
| competify | 121 | 16,701 | 5 (5) |
| gzs/stem-50 | 141 | 18,003 | 15 (14) |
| home-page | 163 | 23,757 | 25 (14) |
| everyframe-composer | 526 | 118,532 | 379 (272) |
| Total | 1,265 | 218,638 | 431 (310) |

- **The 2,330 call sites** are what the 7.0.0 codemod moved in the template's three workspaces
  (N9). They show that a codemod of that size has shipped; they are not the size of this one.
- **The cost is not spread evenly.** everyframe-composer holds 54.2% of the lines, 379 of the 431
  fragment routes and 272 of the 310 mutations that answer a fragment. Its editor is the Cut
  feature: 25 of those routes and 21 of those mutations (N23).
- **The house rule is the part no codemod does.** Draft 1 counted 143 such mutations with a grep
  that missed multi-line route entries. The review's parser counts 310 (N8).
  - **A mutation cannot name a reason.** All three reasons are GETs. Each of the 310 becomes a page
    answer.
  - **The 121 GET fragment routes** each become a page answer or a part with a reason.
  - **fl-um carries this work too:** 3 mutations that answer a fragment, where draft 1 showed 0. It
    is still the app that prices the migration.
- **What has no strict spelling.** 7 `.fire()` calls in one everyframe-composer file drive an
  upload the client owns (N12). They stay on fluent-html 8.

**Coexistence.**
- **Two packages in one app.** `fluent-html` keeps its surface. The strict package is the new one.
- **A bridge each way, not built.** A legacy view placed in a strict tree counts as "may hold
  anything", so it is refused inside `a`, `button`, `label` and `form`. A strict element placed in
  a legacy tree is its rendered markup. This is the first thing Gate 2 probes.
- **The unit is a feature folder** (routes, controller, views), because the route table changes
  shape.
- **The layout moves first.** `doc()` and the legacy `Layout` render the same shell with the same
  swap root, so a strict page and a legacy page swap into each other. A strict link accepts a
  legacy page route, never a fragment route.

**Codemod, three passes. The app is green after each.**
1. **Pass A, on the legacy surface.** Static styling chains become `.tw("…")`. 88.4% of styling
   sites were static literals in Fluent Nine's spike; the other 11.6% stay as chains, which still
   compile because nothing is tombstoned. The extractor keeps running while one chain is left.
   This pass needs `.tw()` in an 8.x minor, which `main` does not have today. If it has not shipped
   when fl-um moves, pass A is skipped and pass B converts chains directly.
2. **Pass B, per feature.** Tag names, class text into `cls(…)`, setters into the attribute object,
   `ForEach` into `map`, `IfThen` and `Match` into `&&` and `match`, a verb into its route
   argument, `Form<T>` into the action's form. It also drops a type predicate TypeScript now infers
   (`filter((x): x is T => x !== null)`), because the strict lint config refuses predicates.
3. **Pass C, not a codemod.** What tsc then rejects is the worklist: the content-model and label
   mistakes the old code carries (a control without a label ships unnoticed in fluent-html 8, so
   the count is unknown until pass B runs), and the targeted swaps. An agent takes one feature at a
   time with the diagnostics as its brief.

**Guidance, costed.**
- **What teaches the old surface.** The template's `CLAUDE.md` (24,324 B, 10,328 B of it on
  fluent-html, styling and htmx) and six references (88,360 B). Two lint rules the template sets
  to error, `prefer-foreach` and `no-ternary-in-view-builder`, forbid the `.map` and the ternary a
  strict view writes (N17).
- **Who rewrites it.** The template and guidelines lanes, after Gate 2, in their own scopes. This
  scope writes the strict reference (11,591 B today) and nothing in those repos.
- **During coexistence an app teaches both.** Its `CLAUDE.md` gains the strict reference and a
  line saying which folders are strict; the old rules stay until its last feature moves. The lint
  rules are split by import: a file that imports the strict package gets the strict config.
- **It is measured, not assumed.** S8 runs on a scaffold copy whose guidance is rewritten for the
  strict surface. The cost of teaching both at once is not measured by any kill; fl-um's price
  will show it.

**Order.**
1. A kitchen scaffold through `test:compile`, then a copy of the template's full-stack app, whose
   features become the exemplars.
2. fl-um, measured in turns per thousand lines. That number sets the migration's appetite.
3. everyframe-composer's Cut feature (`src/app/apps/cut`, the video editor), alone, after fl-um is
   priced. It is the editor screen open call 7 times and the feature open call 6 waits on.
   - **First the timing, where the code stands.** On fluent-html 8 every press in Cut already
     answers the whole editor as one region (N23). The full-layout answer adds the shell around
     it, so it is timed there, against the line of open call 7, before a line of it moves.
   - **On a pass** the folder moves under coexistence while the rest of the app stays on
     fluent-html 8, and its call sites answer open call 6.
   - **On a miss** nothing moves. The app stays on fluent-html 8, and the same call sites are the
     case for or against a fourth reason.
   - It does not block step 4.
4. fluent-html-home-page, studio, everyframe, competify, home-page.
5. The rest of everyframe-composer, after step 3 and open call 7. gzs/stem-50 waits on open call 8.

**The eslint plugin.** 32 rule files, 18 of them about class and styling calls by name (N10;
Fluent Nine counted 15 by reading).
- **During coexistence** it runs unchanged on legacy files, and the codemod lives in its repo,
  which already parses these call chains.
- **On strict files** none of the 32 applies: their subjects are types. The strict config has three
  jobs, each for something TypeScript cannot see.
  - **No I/O in a view** (PURE-1). The one rule that has to be written.
  - **No forged brand.** Existing rules, configured; none is written for this library.
    - **From typescript-eslint:** no assertion but `as const`, no `any` (written or inferred into a
      call), no comment that silences tsc.
    - **From core `no-restricted-syntax`, in a file that imports the strict package:** no type
      predicate, no overload signature or ambient function, no ambient value. Each can claim a
      brand that nothing made, with no cast.
    - **What it covers.** 7 of the 16 registered spellings. tsc refuses 6 more, by the private
      member, the type-only exports and the type aliases. 3 stay open (N19).
    - **What it costs.** The census apps' files that import fluent-html hold at most 55 type
      predicates, no overload signature and 24 ambient values today, by grep (N22). Pass B drops
      the predicates TypeScript infers; a domain predicate lives in a file that does not import
      the package. Module augmentation is left to tsc, so Fastify's own stays legal.
    - **What it does not reach.** A mutable array, property or method parameter under a wider
      alias. It is named in S9.
  - **No legacy import in a migrated feature** outside the bridge. An existing rule, configured.
- **Typed lint on TypeScript 7.** typescript-eslint needs the TypeScript 6 package beside 7.0. The
  fleet already installs both where it uses 7, and the template's lint is already typed (N16). The
  lint rung's time is a line of S5.

**The extractor.** 1,131 lines, and no successor (N10). Class text is literal in the source in
Tailwind's own spelling, so Tailwind's scanner reads it. It keeps running on legacy files and
leaves an app, with the safelist prebuild, when no styling chain is left.

**What fluent-html 8 users keep.**
- **Their package.** `fluent-html` keeps tags, `Form<T>`, `Match`, `ForEach`, `defineRoutes`,
  `defineIds` and behaviors v4, and gets the non-breaking harvest rows and security fixes, starting
  with 8.1.1 and the XSS gate.
- **Their ref.** An app that follows `#main` keeps getting a non-breaking `main` from this scope.
  None is migrated unless its owner asks.
- **What carries into the strict surface:** escaping by default, the closed theme, typed route
  params, the part-answers-its-root contract, the behaviors runtime with its acceptance matrix, and
  the class-merge family table.
- **What does not:** the typed styling methods, `Styler` and `.apply()` (they become class
  constants), and every targeted mutation.

## Rabbit Holes

- **Typing whole-document facts.** A duplicate id as a mark needs a pairwise check across
  siblings. Check time is already 2.4 to 8.7 times fluent-html 8's.
- **Purity in types.** Synchronous is enforceable, pure is not. One lint rule, then stop.
- **Passing marks through a generic component.** Probed in the design: the conditional type
  defers. Named child types are the answer.
- **The reason union growing by one per app** until it is an open string. An editor screen will
  ask for it first, which is why one editor is the trial (Order, step 3).
- **A second checker coming back** for class conflicts or reach. The merge rule and Tailwind's
  scanner are the answer.
- **Lint rules multiplying.** The strict config has three jobs. A fourth means a type was not
  found. The forging job grew by three selectors of a rule that already exists, not by a rule.
- **Closing TypeScript's own holes.** A mutable alias forges a mark. The marks are covariant so
  that a plain child fits a wider slot, and making them invariant to stop the alias would undo
  that. It is named in S9 and left. The sinks do not depend on it.
- **A codemod that chases the last 11.6%** of styling sites. The remainder is agent work.
- **Reading turn counts alone.** A session that packs files into heredocs scores 12 turns. S1 reads
  tokens and cost beside them.
- **Waiting for an idle machine.** Draft 2's figures were taken at a load of 31 to 73 on 10 cores
  and this draft's at 76 to 230, and two passes of one script read up to 49% apart. S5 is read on
  a CI runner. It never waits for this machine.
- **The first half of a diagnostic.** It can run to 300 characters of element types. S4 measures
  whether the fix is on line 1, not the length.
- **The redirect wire.** How a 303 reaches the swap root with the right URL was read from htmx's
  source and never run. It is S7's row, not a design debate. The live search wire is in the same
  state.
- **A client store for the search value.** The value is in one place, the control, and every
  request reads it there. A script that mirrors it into links is the stale copy again.

## No-Gos

- No new syntax, file format or compiler.
- No server and no guard logic in the package. It has the handler table, the answer and a slot the
  app's guard fills.
- No targeted swap without a reason, no reason outside the union, and no mutation that answers a
  fragment.
- No element argument that is a URL string, a target or an `hx-*` name.
- No derived markup: parts derive ids, addresses and wires.
- No third command in the done condition: `tsc` and `eslint`, and no checker beside them.
- No brand without a private member, no brand whose constructor leaves the package, no exported
  table an app can merge into, and no brand that lands without the lint that bans forging it.
- No sink that trusts a type: each asks for the brand at run time.
- No claim that a brand cannot be forged. The claim is S9's list, with its open spellings counted.
- Nothing breaking on `fluent-html`'s `main` from this scope, and no change to the template, the
  guidelines or any `CLAUDE.md` from it.
- No migration before Gate 2, no app moved in one step, and no app moved without its owner.
- No Gate 1 arm that loads our `CLAUDE.md` or a reference shaped like its task.
- No generated file that app code edits.

## Open calls

Only what is the maintainer's to decide. Each has a recommendation, and the body is written to it.

1. **Appetite and price.** Recommended: five days to Gate 1 (four at $0, one at up to $10), one
   week to Gate 2. Two days cannot hold the work the review listed. The second review added five
   small items to 1a (the swap root, the private member, the live search wire, its oracle line and
   the runner); the four days are kept.
2. **The package's name and home.** Recommended: a package of its own in a repository of its own,
   working name `strict-tags`, apps pinned to tags. The alternative is one package: cut an `8.x`
   line, re-pin the 29 entries on the default branch to it, then let `main` break. It touches every
   dependent before anything ships and reverses how the family pins today.
3. **The levels of the new caps.** Recommended: output tokens at most 20% and cost at most 15%
   above the neutral floor's means (17.9% and 12.3% today, against task-shaped floor runs that
   flatter the floor); check time at most twice fluent-html 8's at both sizes; the route tables at
   most 1.25 times fluent-html 8's 2,000-element check (0.6 to 1.0 today, under load). The verdict
   accepted that a rewrite costs more per session than the harvest. These caps say how much more.
4. **K5.** The verdict asked for a first-compile line against the floor. The body does not register
   one: S4 counts false rejections only, because a stricter compiler fails a first compile on
   purpose when it makes a true catch. To confirm, or to put the line back.
5. **The mount after Gate 2.** Recommended: open a template-lane scope on a Gate 2 pass, which
   takes the mount beside `defineController` and the swap root's move from `#main-content` to the
   layout.
6. **A fourth reason.** Recommended: none now. 71 `.fragment()` calls in app code name a GET
   fragment route with a click (tabs, panels, load more), and each becomes a page link (N12). A
   fourth reason is asked for with the call sites that need it, and those come from two places:
   fl-um, and everyframe-composer's Cut feature (Order, step 3). Cut is the editor screen call 7
   times, so one trial answers both calls, whether the folder moves or not.
7. **everyframe-composer.** 272 of its mutations answer a fragment, 21 of them in Cut, its editor.
   Recommended: the app stays on fluent-html 8, which keeps working, and Cut alone is the trial
   (Order, step 3). Its full-layout answer is timed on fluent-html 8 as it stands, after fl-um is
   priced, against a line set before the timing is read. Recommended line: from press to settled
   DOM within 100 ms at the 95th percentile, on the longest timeline fixture, on the three engines
   of S7. On a pass Cut moves and the rest follows in step 5. On a miss the app stays, and the
   house rule is not claimed for editors. Which feature stands for "the editor" is part of this
   call: studio has more fragment mutations (56) but is a wizard with one URL per step.
8. **gzs/stem-50 and the ninth census app.** Recommended: leave both out. stem-50 predates
   `defineController` and needs a template update first; the ninth has no directory.

## Review, 16. 11. 26

**First review.** Fifteen findings. Fourteen hold and one holds in part. Draft 2 answered them;
two of its answers were partial, and the second review reopened them.

| Finding | Where it is answered |
|---|---|
| Most of the fleet is not pinned | Section 8, the release rule; open call 2; N11 |
| 310 mutations, not 143, and a mutation cannot name a reason | Section 8, what moves; N8 |
| Owned keys open a new stale spelling | Section 3, search. Draft 2's `self` fixed the first render only. The live value is the second review's first finding |
| The poll bound restarts | Section 3, poll: declared states, the bound ends on the part; 5 seeds in the probe, and S7 runs it |
| The handler table has no owner | Section 4, item 8 |
| Open calls contradict the body | Calls 6, 7 and 9 of draft 1 are decided in the body. K5 still stood both ways in draft 2; see the second review |
| "tsc as the only check" is false | Section 2, the done condition; S9; N14, N16, N19 |
| No kill can fail on tokens or cost | S1 |
| S5 leaves out scale and the baseline | S5; N13 times both libraries on two compilers in one script, N20 on three. The ratio at 2,000 was 2.4, not the verdict's 2.9 |
| S3 needs reseeding, and two days is too little | S3 and its notes; Appetite |
| Pass A is not green beside tombstones | Section 8, pass A: `.tw()` is additive, nothing is tombstoned |
| The reason union misses autosave, live preview and dependent fields | **Holds in part.** These are triggers, not targets. Of 44 `.onChange()` calls, the 28 that resolve all answer a page, fl-um's `redactionRoutes.tune()` among them, and 3 name a target (N12). What draft 1 lacked was the trigger, now in section 3. The 3 become page answers |
| Guidance is not costed, and S8 conflicts with a No-Go | Section 8, guidance; the No-Go now covers Gate 1 only |
| "No session read outside its folder" cites no command | Problem; N15, with the 5 plugins |
| The search form makes `wcag/h32` likely | Section 4: a form needs a submit control, probed |

**Second review.** Six findings. All six hold. Four are fixed in the body, and two are fixed in
part with the rest named as open.

| Finding | Where it is answered | State |
|---|---|---|
| `self` fixes the first render, not a live search | Section 3, the live value: three wire rules and one type rule; 2 more seeds in the probe (N5); the wire's facts read from htmx's source (N21); an oracle line in S3 and five rows in S7 | **Open until S7 runs.** Section 3, open item 4. The 422-then-poll case is open item 5 |
| A brand can be forged with no cast | Section 2, the promise and item 5; S9 as a registry; section 8, lint; 8 more spellings filed and probed (N19) | **Fixed for 13 of 16.** Three mutable-alias spellings are named and stay open; no spelling reaches a sink raw |
| K5 is decided both ways | S4 drops the first-compile clause; open call 4 is the confirmation | Fixed |
| S5 may never be readable, and TypeScript 6 is missing | S5 and its reading rule; `time.sh` runs three compilers; N20, N24 | Fixed |
| The swap root can be checked at Gate 1a | Appetite 1a; section 3; S3's full-layout line | Fixed |
| Open calls 6 and 7 pull apart | One feature answers both: composer's Cut editor, timed first and moved on a pass (N23). Order, step 3; calls 6 and 7 | Fixed |

## Numbers

`$B` is `project/research/from-scratch/2026-11-15`. Draft 1's files are in `$B/strict-tags-prd/`,
the first review's in `$B/strict-tags-prd-review/`, draft 2's in `$B/strict-tags-prd-fix/` (`$F`),
this revision's in `$B/strict-tags-prd-fix-2/` (`$G`).

- **N1:** `python3 -I $B/strict-tags-prd/gate-recount.py` reads `$B/strict-tags-gate/measure-*.json`:
  turns 22 and 12 against 32 and 38; tokens 20,374 and 24,691 against 29,618 and 30,041; $5.62;
  the floor's 18,607 and 19,632 tokens and $0.950. The 17.9% is the two token means, 22,532.5
  against 19,119.5. Message ids 14 and 12 against 26 and 29 are the gate's table.
- **N2:** `cat $B/strict-tags-gate/out-check.txt`: html-validate 2 and 0 against 3 and 5. Both
  Strict Tags errors are `wcag/h32`, a form with no submit button.
- **N3:** `python3 -I $B/strict-tags-prd/first-errors.py <the two strict-tags transcripts>`: 1 and
  6 errors on the first failing type-check.
- **N4:** `cat $B/mistakes/results/table.md` (written by `node run.mjs table`) and
  `cat $B/mistakes/results/hx8-full-layout.tsv`, whose row `cbc HX-8.full-layout.badge` reads
  `live` where the other four designs read `not-live`.
- **N5:** `sh $G/probe/run.sh`: seeded 18, error lines 18, missed 0, stray 0, 12 first lines with
  the fix, on 5.9.3, 6.0.3 and 7.0.2. The two new seeds are an action's redirect to its own fresh
  page and a body field named like an owned key. `sh $G/probe/run.sh submit.ts`: seeded 3, error
  lines 3, missed 0, stray 0. It replaces draft 2's 16-seed probe in `$F/probe`.
- **N6:** `sh $B/strict-tags-prd/ts7.sh`: TypeScript 5.9.3 and 7.0.2 give 0, 0, 0, 81, 4 and 3
  errors on the same six configs, the 81 at the same positions, 56 first lines with the fix. Its
  wall times are replaced by N13 and N20.
- **N7:** `sh $B/strict-tags-prd/fleet-count.sh`: also 179 route files, 209 controllers, 1,820
  swap-verb calls (a grep, so an upper bound) and 182 `hx()` or `setHtmx` calls.
- **N8:** `python3 -I $B/strict-tags-prd-review/mutations.py`: 431 fragment routes, 310 of them
  mutations; per app as in the table. It replaces the mutation column of
  `$B/strict-tags-prd/targeted-count.sh`, whose grep read one line per route.
- **N9:** `grep -n '2,330' projects-template/project/pm/roadmap.md`;
  `sh $B/strict-tags-prd/dependents.sh`: 67.
- **N10:** `ls src/rules | wc -l` in the plugin repo: 32, of which 18 match
  `grep -cE 'class|styling|setstyle|v4-utilities|unit-overload|variant-object|cursor-pointer'`;
  `wc -l src/*.ts` in the extractor repo: 1,131.
- **N11:** `sh $B/strict-tags-prd-review/pins.sh`: 70 entries; 33 and 1 at a SHA, 23 at `#main`,
  6 with no ref, 3 `*`, 2 `file:../fluent-html`, 1 at a branch, 1 vendored tarball; then the ref of
  each census app and of the template.
- **N12:** `python3 -I $F/swaps.py` resolves each verb call in app code to the route it names:
  `.onChange()` 44 (13 a GET page, 15 a mutation that answers a page, 16 a route held in a
  variable, 3 of those with a target id); `.fragment()` 461 (271 a mutation fragment, 71 a GET
  fragment, 113 unresolved); `.fire()` 16 (7 a mutation fragment, all in
  `library.tray.view.ts`, 6 a machine). `python3 -I $F/swaps.py routes`: 1,242 route entries, 157
  of them machines (112 GET, 45 mutations); everyframe-composer has 680 in 65 files (138 pages, 93
  and 271 mutations, 107 GET fragments). Its parser reads `defineRoutes` tables only and finds 308
  mutation fragments where N8 finds 310.
- **N13:** `sh $F/stress/time.sh > $F/stress/time.txt`: best of 3, CPU seconds, load 30.8 at the
  start and 72.9 at the end on 10 cores. At 2,000 elements: 1.58 against 3.81 on 5.9.3, 0.25
  against 1.02 on 7.0.2. At 11,330: 2.56 against 9.78, and 0.62 against 4.92. The strict library
  alone: 1.73 and 0.33. Route and handler tables at composer's size on the probe's types: 2.17
  against 0.76 for one page on 5.9.3, 0.40 against 0.18 on 7.0.2. The 11,330 is a grep for tag
  calls in everyframe-composer's `src`. The 379 parts are every fragment route counted as a part,
  an upper bound: at most 107 can be one. TypeScript 6 was not timed here; N20 times it.
- **N14:** `sh $F/forge/run.sh`: 8 spellings, 0 error lines, 8 compile, on both compilers; the
  forged element and class list render unescaped, and the forged URL still renders `#blocked`.
- **N15:** `node $B/bake-off-correct-by-construction/outside.mjs <transcript> <dir>` on the four
  gate transcripts flags 9, 1, 10 and 8 calls; the gate's audit read each as a false positive.
  `grep '"plugins"' $B/strict-tags-gate/measure-*.json`: 5 in every arm, with 0 MCP servers, 0
  skills and no memory paths.
- **N16:** `grep -n projectService` in the template's and everyframe-composer's `eslint.config.mjs`:
  `true` in both. `grep -nE '"typescript"|@typescript/native' everyframe-composer/package.json`:
  `^6.0.3` beside `npm:typescript@^7.0.2`.
- **N17:** `wc -c CLAUDE.md .ai/web-development/{fluent-html,htmx,routes,behaviors,views,fastify}.md`
  in the template: 24,324 and 88,360, 112,684 in all;
  `awk '/^## fluent-html/,/^## View Composition/' CLAUDE.md | wc -c`: 10,328;
  `grep -n 'prefer-foreach\|no-ternary-in-view-builder' templates/full-stack/eslint.config.mjs`.
- **N18:** in `$B/mistakes`: `ls seeds/*/cbc*.ts | wc -l` is 37; 8 match
  `grep -lE 'wire\(|local\(|\.load\(\)|\.change\(|\.fire\(\)|\.poll\(|\.search\(|\.defer\(\)|\.root\b'`
  and 14 match `grep -lE 'projects\.(rows|status|remove|create|list|detail)|entries|handlers'`.
- **N19:** two scripts.
  - `sh $G/forge/run.sh`, spellings 9 to 16 against the prototype as built: on 5.9.3, 6.0.3 and
    7.0.2 the only error line is the control (a button in a button). The predicate, the overload
    and the three aliases render `<button>` inside `<button>`. The object literal and the ambient
    value throw when run. The augmentation renders `srcdoc` on an iframe, which the library
    sandboxes.
  - `sh $G/forge/fixed/run.sh`, 14 of the 16 against a 25-line probe of the brand shape (private
    member, type-only export, tables as type aliases); the URL and trusted-markup constructors
    repeat spelling 1. tsc: seeded 4, missed 0, on the three compilers (constructor twice, object
    literal, augmentation). eslint 10.9.1 with typescript-eslint: seeded 7, missed 0 (cast, two
    `any`, silencing comment, predicate, overload, ambient value), 0 reports on `valid.ts`.
    Spellings 13 to 15 pass both and nest the button. A string under a class-list alias and under
    an element alias renders escaped.
- **N20:** `sh $G/stress/time.sh 3`, run twice into `time-a.txt` and `time-b.txt`, then
  `sh $G/stress/agree.sh` on both: the two libraries in turn, CPU seconds, best of 3, three
  compilers, 10 cores, 19,810 of 20,480 MB of swap in use. The load fell from 141.5 to 75.9 during
  pass a and rose from 75.9 to 230.2 during pass b.
  - **Elements, strict over fluent-html 8, pass a then pass b.** At 2,000: 2.81 and 2.37 on 5.9.3,
    3.67 and 3.09 on 6.0.3, 4.48 and 3.65 on 7.0.2. At 11,330: 6.03 and 4.05, 4.78 and 5.22, 8.69
    and 7.37. In seconds the widest line is 23.47 over 3.89 against 11.51 over 2.84. The passes
    are 19, 19, 23, 49, 9 and 18% apart.
  - **Against N13.** Its ratios on the four shared lines are 2.41 and 4.08 at 2,000 and 3.82 and
    7.94 at 11,330 (5.9.3, 7.0.2). Pass a is higher on all four; pass b is lower on three.
  - **Routes.** Tables at composer's size less a one-page table, over fluent-html 8's
    2,000-element check in the same round, on the revised probe's types: 0.61 and 0.77 on 5.9.3,
    0.95 and 0.99 on 6.0.3, 0.81 and 0.79 on 7.0.2. In pass b's seconds: 1.24 over 1.61, 1.29 over
    1.30, 0.22 over 0.28.
  - **The strict library alone:** 1.61 and 1.60, 1.58 and 1.72, 0.35 and 0.31.
- **N21:** htmx 4.0.0, `node_modules/htmx.org/dist/htmx.js` in the template's full-stack app, read
  and not run. Lines 521 to 526: on a GET each included key is deleted from the URL and appended
  with the included value. Line 1657: the `HX-Replace-Url` response header sets the history
  action. Lines 2175 and 2194: the morph writes a textarea's and an input's value only when the
  default or the `value` attribute differs and the control is not `document.activeElement`.
- **N22:** `sh $G/forge/syntax-cost.sh`, a grep over the 1,240 `src` files that import fluent-html in
  the eight census apps: 55 type predicates (an upper bound: the pattern also matches prose in
  comments), 0 overload signatures, 24 ambient values, 43 module augmentations.
- **N23:** `python3 -I $G/composer-features.py`, the first review's parser per route file.
  `apps/cut/cut.routes.ts`: 25 fragment routes, 21 of them mutations, 20 view files of 5,735
  lines. Its header reads "`cut-editor`: the editor, one derived whole … Every press answers it".
  The most fragment mutations are in `composer/studio` (72 routes, 56 mutations), then
  `composer/projects` (36, 30) and `apps/agent` (55, 27). Totals 379 and 272, as N8.
- **N24:** `sh $G/ts6.sh`: TypeScript 6.0.3 gives the same 0, 0, 0, 81, 4 and 3 errors as 5.9.3 and
  7.0.2, the 81 at the same positions with the same codes as 5.9.3, and 56 first lines with the
  fix.
- Figures not listed here (the design's C1 to C13, the verdict's G1 to G5) are quoted from those
  documents and were not re-run.
