---
rfc: RFC-E-06
lens: guardrails
verdict: reject
confidence: 0.7
killer_objection: "§5.5 instruction set: once RFC-E-01's getId() ships (same 8.2.0 lane, ranked higher), the hint link needs no library support. I put a 12-line user-land linkHint(control, text) in each repo's existing field wrapper. Across the RFC's 8 rewrite repos it reproduced the RFC's renders byte for byte in 5,869 of 5,898 test renders. It needed 0 call-site edits where the RFC needs 41, and it linked 55 of the 57 sites plus 1 unbound site that f.hint cannot reach. Only 1 measured site, a checkbox group, needs the binding's control registry. Shipping f.hint beside getId gives two ways to link a hint (§5.7)."
guardrail_killer: 5
required_changes: []
executed:
  - cmd: "grep -rn -i 'hint|helpText|describedby' projects-template/templates/*/src/core, templates/*/src/shared/ui, packages"
    output: "0 hint slots in templates/*/src/shared/ui. packages/ui/src/form/FormField.ts:32-34 has an unlinked helpText. Template FormGroup (templates/full-stack/src/shared/ui/form.ts:27) takes input: Tag and stamps its id (:37)."
  - cmd: "canonical fleet (16 repos, era >= 7): grep describedby outside src/core; hint?:, helpText?:, help?: keys"
    output: "describedby 1 (a comment, workshop-toni/src/app/family/views/family.components.ts:110); hint 106 keys in 10 repos; helpText 0; help 15"
  - cmd: "ul-dump = base-dump (8.1.0+A-07) + getId() (the RFC-E-01 accessor); ul-fleet.py wrapper-only edits; ul-run.sh per repo (tsc, vitest unit with FH_DUMP)"
    output: "tsc 0 errors 8/8; eslint 0 problems on 22 files 8/8; test outcomes identical to the RFC's runs in 8/8 repos"
  - cmd: "direct.mjs RFC after-dumps vs user-land dumps (multiset byte compare)"
    output: "5,869/5,898 byte-identical; 29 others = 10 nondeterministic e-mails, 11 stem-50 defenseDate composite, 6 wsf checkbox group, 1 attribute order, 1 extra unbound link"
  - cmd: "compare.mjs before vs user-land (links, dangling, orphans)"
    output: "0 dangling, 0 orphan spans in 8/8; links equal to the RFC in 6/8 repos; everyframe 58 vs 57, wsf 64 vs 94"
  - cmd: "node dist/bench/render.js, base vs lib, 5 interleaved rounds"
    output: "0 Form calls in bench; medians -5.0%..+0.7%: blind to this change"
  - cmd: "fb.mjs / fbn.mjs form bench (process.cpuUsage, true median)"
    output: "no-hint form +1.2%; 10 hints f.hint +13.9% vs user land at equal bytes; per-hint overhead 230/289/548 ns at n=10/50/200 (O(n) scan of bound[] per call)"
  - cmd: "tsc --extendedDiagnostics probe + stem-50"
    output: "probe identical (6,158 types, 34,103 inst.); stem-50 +10 types, +48 inst."
  - cmd: "order.mjs on RFC lib"
    output: "hint before a control whose caller then calls setAria({describedby}) drops the hint link; span still rendered"
  - cmd: "wc -c guidelines fluent-html.md:148 vs proposed line"
    output: "307 -> 455 chars at line delta 0"
---

# Verdict: RFC-E-06, guardrails lens

Scratch: `$G = <scratch>/track-e/RFC-E-06-guardrails`, `$R = <scratch>/track-e/RFC-E-06`. No repo was edited. Every fleet copy is an rsync of the RFC's own `$R/repos/<repo>-before`, with `node_modules/fluent-html` re-pointed to a scratch build.

## What I executed

### 1. An existing solution one layer up (template + fleet grep)

- **Template.** `templates/full-stack/src/shared/ui/form.ts:27` `FormGroup` takes `input: Tag` and stamps the id itself at `:37` (`input.setId(fieldId)`). It has no hint slot, and `templates/*/src/shared/ui` has 0 `hint` matches. `packages/ui/src/form/FormField.ts:32-34` renders `helpText` as an unlinked `P`. The RFC's instruction-set facts hold.
- **Fleet (16 canonical repos).** `describedby` outside `src/core` has 1 hit, a comment (`workshop-toni/.../family.components.ts:110`). `hint` keys: 106 in 10 repos. `helpText`: 0. `help`: 15. Nobody links a hint today, so the RFC's demand numbers reproduce.
- **The structural fact the RFC does not use.** Every hint wrapper in all 8 rewrite repos holds the control `Tag` at the point where it renders the hint:

| repo | wrapper | where |
|---|---|---|
| stem-50 | `FormGroup`, plus 6 local `TextField`/`SelectField`/`TextareaField` | `shared/ui/form.ts:31` |
| popri | `Field({ input })` | `auth.components.ts:113` |
| studio | `Field({ input })` | `auth.components.ts:80` |
| everyframe-composer | `FormGroup({ input })` | `shared/ui/form.ts:40` |
| sportoawards | `FormGroup`, `Field`, `SelectField` | `form.ts:43`, `entry.chrome.ts:126,141` |
| na-cent | `SettingsField({ control })`, `Field<T>({ control })` | `settings.components.ts:59`, `transactions.components.ts:140` |
| home-page | builds `f.input` inline | `content-panel.components.ts:50` |
| wsf | `Field({ input })`; `MultiSelectField` builds `f.select` inline | `funnels.form.view.ts:70`, `jobs.view.ts:143` |

### 2. The user-land counter-prototype, run over the RFC's whole fleet

- I built `$G/ul-dump` as base-dump (8.1.0 + A-07, with the same render-dump hook) plus one accessor, `getId() { return this._id }`. That is RFC-E-01's proposed member.
- I added one helper per repo. It is 12 lines and passes each repo's own eslint config:

```ts
export function linkHint(control: View, text: string) {
  const controlId = control instanceof Tag ? control.getId() : undefined;
  if (!(control instanceof Tag) || controlId === undefined) return text;
  const id = `${controlId}-hint`;
  const current = control.attributes["aria-describedby"];
  control.setAria({ describedby: current ? `${id} ${current}` : id });
  return Span(text).setId(id);
}
```

- **Edits were wrapper-only.** `P(text)` became `P(linkHint(control, text))`. Two wrappers that built their control inline got a 1-line hoist to a `const`. **0 call sites were touched** and no prop type was widened.

| repo | user-land files / diff lines | RFC files / diff lines | renders byte-identical to the RFC's | links (user land / RFC) | tests (same as RFC run) |
|---|---|---|---|---|---|
| stem-50 | 5 / 29 (helper inline) | 9 / 70 | 809/830 (10 e-mails + 11 composite) | 476 / 476 | 1853/1853 |
| popri | 1 / 3 | 4 / 12 | 488/489 (attribute order only) | 62 / 62 | 757/758 |
| studio | 1 / 3 | 3 / 6 | 429/429 | 18 / 18 | 568/568 |
| everyframe-composer | 1 / 3 | 4 / 11 | 1559/1560 | 58 / 57 | 2994/2995 |
| sportoawards | 2 / 8 | 4 / 16 | 412/412 (incl. the RFC's 4 probe renders) | 38 / 38 | 535/536 (the same regex test, †) |
| na-cent | 2 / 6 | 3 / 6 | 675/675 | 15 / 15 | 1045/1045 |
| home-page | 1 / 6 | 1 / 2 | 466/466 | 15 / 15 | 816/816 |
| wsf | 2 / 13 | 2 / 10 | 1031/1037 | 64 / 94 | 4442/4444 |
| **total** | **15 / 71 + 7 helper files** | **30 / 133 + 40 lib lines** | **5,869/5,898** | | |

Across 8/8 repos: `tsc` 0 errors, eslint 0 problems, 0 dangling tokens and 0 unreferenced hint spans.

The 29 renders that differ break down like this:

- **10:** stem-50 e-mails that are nondeterministic in base too. 0 of them contain a form.
- **11:** the stem-50 `defenseDate` composite. `input` is a `Div` of two selects.
  - User land links the `Div` (no effect for assistive tech).
  - `f.hint("defenseMonth")` links the month select only and leaves the year select unlinked. Neither approach gets this field right.
- **6:** the wsf `requiredSources` checkbox group. f.hint links each checkbox, and user land links none.
- **1:** popri attribute order. `aria-invalid` and `aria-describedby` are swapped and the meaning is identical.
- **1:** an everyframe *unbound* password field. User land links it, and f.hint cannot.

### 3. Perf (§5.2)

- **Render bench.** `bench/render.ts` contains 0 `Form` calls. Over 5 interleaved rounds the 8 cases ranged from -5.0% to +0.7% (`Build+render realistic` 0.0612 → 0.0614 ms). It is blind to this change.
- **Form bench** (`$G/fb.mjs`: CPU time, true median of 21 runs, 10 alternating rounds):
  - Every `Form<T>` without a hint now pays for `bound.push` plus `hinted?.has`: 9,292 → 9,404 ns (+1.2%).
  - With 10 hints and the same 1,449 bytes, `f.hint` costs 16,769 ns against 14,724 ns for user land (+13.9%).
- **Scaling** (`$G/fbn.mjs`, every field hinted):
  - The per-hint overhead over user land is 230, 289 and 548 ns at n = 10, 50 and 200 (+14.8%, +19.3%, +33.3%).
  - The cause: each `f.hint` scans the whole `bound` array, which is O(n²) per form.
  - The fleet maximum is 16 hints in one form (stem-50), so this is not fatal. The RFC's guardrail-2 "pass" still compared `f.hint` only to a hand-rolled variant and reported a 10-field number.
- **Type cost:** the probe is identical (6,158 types, 34,103 instantiations). stem-50 gains +10 types and +48 instantiations. No new generics.

### 4. Contract probe

`$G/order.mjs` on `$R/lib` calls `f.hint("bio")` *before* a control whose caller then runs `.setAria({ describedby: "bio-error bio-count" })`.

- Result: `aria-describedby="bio-error bio-count"`. The hint link is dropped and the span still renders.
- The reverse order keeps all three ids.
- So "in either call order" together with "ids a caller added after binding are kept" holds in 1 of 2 orders.

### 5. Naming and prose

- `hint` is the fleet's word: 106 keys, against 0 for `helpText`.
- It is a noun member beside `label` and `error`, not a setter, so §5.8 is clean.
- `guidelines/web-development/fluent-html.md:148` grows from 307 to 455 chars (+48%) at a "delta 0".

## Attack

1. **§5.5: the link does not need library support.** The RFC's case rests on "the id scheme is private to `createFormBinding`" and "a helper one layer up must restate `controlId`".
   - Once RFC-E-01's `getId()` exists, a wrapper reads the id the control already carries, `idPrefix` included. It restates nothing. `-hint` becomes the wrapper's own suffix, minted and referenced in one function.
   - The measured run shows this reproduces f.hint at 55 of 57 sites, in 5,869 of 5,898 renders.
   - The RFC's own alternatives section waves this away: it says user land "could not link a control created later". Every fleet wrapper already holds its control, as the table in section 1 shows.
   - The RFC's order independence exists because its rewrite moves hint construction out to the call sites. In stem-50, `hint:` precedes `input:` in the object literals, so f.hint runs first. A wrapper-owned link never meets that order. It needed 1 hoist in 2 wrappers.
2. **L-198 already decided this shape.** `FieldHint` was cut to user land (`rs/v6.0.0/40-synthesis/curation.md:67`), while `f.error` stayed in core.
   - `f.error` reads binding *state* (`errors[name]`), which only the binding has.
   - `f.hint` reads no state. It needs only the control's id, which E-01 makes public.
   - The new evidence (57 unlinked sites) proves the link is missing. It does not prove the link needs core.
3. **§5.7: two ways.** If E-01 and E-06 both ship, a hint can be linked by `f.hint(name, text)` or by a wrapper that reads `getId()`. The ranker already flagged the E-01 / E-11 converge risk (`ranker/clusters-e.md:116`). On the measured fleet, the wrapper path is the superset:
   - It covers unbound controls (+1 everyframe site, and the census's 14 unbound hint sites).
   - It needs 0 call-site edits.
   - It is 12 to 33% cheaper at render.
   - f.hint's unique reach is 1 site (the wsf checkbox group).
4. **Secondary costs:**
   - The O(n) scan per `f.hint`.
   - A +1.2% tax on every `Form<T>` render, hinted or not.
   - A call-order claim that fails in 1 of 2 orders.
   - +148 chars of guideline prose for a Label caveat that is prose-only (§5.12).

The RFC's strongest measured asset is agent fitness: 3/3 runs used `f.hint`, and output tokens fell from 4,000 to 2,382. But that was measured against 8.1.0 *without* `getId`. The comparison that would justify core (f.hint against a template `Field` that links through `getId`) was not run.

## Does it survive?

**Reject** as a core addition for 8.2.0, with guardrail 5 and guardrail 7 as the corollary.

**Route the capability to the template instead:**
- E-11's `Field` in `src/shared/ui` gets the hint slot.
- It links through `linkHint(control, text)` on top of RFC-E-01's `getId()`. The helper above is fleet-proven: 8/8 repos, 0 call-site edits, `tsc` and eslint clean.
- The fleet's 8 wrappers adopt it as a wrapper-only edit (15 files, 71 lines measured).

**If curation rejects RFC-E-01**, this objection shrinks to "user land must cast `_id`". everyframe-composer already does that cast (`src/shared/ui/form.ts:35-36`). In that case E-06 can be re-filed. It must then:
- (a) Index `bound` by name, a `Map<string, Tag[]>`, so `f.hint` costs O(controls of that name).
- (b) Either keep the hint link when the hint comes first and the caller then calls `setAria`, or drop the "either call order, caller ids kept" claim.
- (c) Put the Label caveat in the `hint` JSDoc, where 3/3 agents read, and leave `fluent-html.md:148` alone apart from its em dash.
- (d) Add `depends_on: RFC-E-01 (rejected)` with this verdict's comparison attached.

## Guardrail check

| # | guardrail | result | evidence |
|---|---|---|---|
| 1 | Zero deps | pass | the forms.ts diff adds no import |
| 2 | Hot path | weak pass | no-hint `Form<T>` +1.2%; f.hint +13.9% against user land at 10 hints, +33.3% at 200 (O(n²)); render bench has 0 Form calls |
| 4 | Type-safety | pass | no new generics; probe types and instantiations identical; stem-50 +48 instantiations |
| 5 | Instruction set | **fail** | 55/57 sites and 5,869/5,898 renders reproduced in user land on E-01's getId with 0 call-site edits; L-198 precedent; f.hint reads no binding state |
| 6 | Pure core | pass | per-form closure state only, no context or DI |
| 7 | Converge | fail (with E-01) | two ways to link a hint; the wrapper path covers a superset except 1 group site |
| 8 | Naming | pass | `hint` 106 keys in 10 repos, `helpText` 0; noun member beside `label`/`error`; set/add not engaged |
| 12 | Enforcement over prose | weak | line count 0, but line 148 grows 307 → 455 chars; the Label caveat is prose-only |
