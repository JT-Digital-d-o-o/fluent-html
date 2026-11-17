# Strict Tags Gate 1a: second reading on Fable 5.2

Read on 17. 11. 26 from the build, its gate and its own runs, without the first reading. `strict-tags` untouched; scratch clones, profiles and passes stayed on the machine. Machine: 10 cores, load 4.7 to 7.5.

**Verdict: Gate 1a waits, and is expected to fail on S5.** S3 and S9 hold as registered, and their instruments fail when they should. S4 holds only on the c1 rulings, which narrow the PRD's sentence. S5 is unread on a runner; four local passes put all 10 timed lines over their caps, and the cause is counted type work, not load.

## 1. The gate, run again

The gate in a fresh clone gave output identical to the filed one. Mutations in a scratch copy (5 seeds changed, a valid line broken, a refusal made to compile, a cast removed, a sink unescaped, 5 registered files edited) each landed in the right cell. S3 also reads 28 of 34 on 6.0.3 and 7.0.2, not only on 5.9.3. HX-8.search is the weakest of the 28 (its text arrives as a property key in TS2339). "S9 kept current" is a header check, a rule rather than a reading.

## 2. S4: the 13 kept refusals

The rulings were filed at c1, before `lib/` changed, so they are not softening after the fact; but the PRD's S4 sentence lists the two review probes as valid.

| Lines | Ruling |
|---|---|
| fp4, tryB-use (a form with no submit control) | True catch |
| fp6 (a class table of plain strings) | True catch: accepting it opens TW-4 and fails S3 parity; fluent-html 8 enforces the same rule today |
| fp1, fp12, fp2, fp4-helper, tryA-helper, tryA, fp4-control | Kept by the PRD's own section 4 rule (declared content inside form, a, button, label): a priced false rejection, not a catch. fp2's fix text names a type that then refuses the probe's own child |
| tryB | The rabbit hole (marks through a generic component) |
| fp5-helper, fp5 (`: El` component in `ul`) | Not a true catch: an `li` in a `ul`. The first error is raw and the second says "takes only li(…) children" about an `li`; `tr` and `option` behave the same. Keep the refusal (flipping it lets `(): El => div()` into `ul`), name the typed spelling (`El<"li">`) in the message, record it as narrowing S4 |

Recommended: amend S4 to "as ruled at c1", with fp5 named as the narrowing.

## 3. S5

Two more local passes agree with the filed two within 3%:

| Line (cap) | 5.9.3 | 6.0.3 | 7.0.2 | Odds of holding on a runner |
|---|---|---|---|---|
| Elements 2,000 (2) | 2.28 to 2.33 | 2.32 to 2.35 | 2.54 to 2.59 | 5% or less |
| Elements 11,330 (2) | 3.40 to 3.44 | 3.38 to 3.40 | 5.56 to 5.61 | under 1% |
| Routes added (1.25) | 1.65 to 1.68 | 1.68 | 1.68 to 1.95 | about 2% |
| Lint 11,330 (1) | 2.15 to 2.20 | | | under 1% |
| Positions | 83 = 83 = 83 | | | about 99% |

Machine-independent counts at 11,330 elements (5.9.3): 3,168,058 instantiations against fluent-html 8's 168; 356,187 types against 36,692; 1,117 MB against 258 MB; check 4.3 s against 0.8 s.

Where the element time goes (check s at 11,330, 5.9.3): the tag call 2.1 (a const-generic call 0.5, marks in the return type 0.4, the per-argument mapped check 1.2); class text 1.9 (the token walk about 1.1, the mapped-tuple `cls` signature 0.4 to 0.6); brands 0; reading the library from source rather than declarations about 0.7 of the base. The CPU profile agrees: call resolution and conditional and mapped-type instantiation, not parsing class text.

Routes: the route and handler types alone are 1.06 to 1.14; the line misses because the script counts the page views' tag calls (32 to 41% of it). Lint: one typed rule (`no-unsafe-assignment`) pays for type-checking the file, 4.2 of 4.3 s of rule time; without the six typed rules lint is 0.61.

| Change | Elements 2,000 | Elements 11,330 | Cost in caught kinds |
|---|---|---|---|
| As built | 2.3 / 2.3 / 2.6 | 3.4 / 3.4 / 5.6 | |
| Ship declarations, split `cls` (measured) | 1.73 / 1.73 / 1.98 | 2.74 / 2.73 / 4.06 | none |
| Class grammar out of tsc | | 2.40 / 2.81 | TW-1 to TW-3 move to lint or prebuild; still a miss |
| Tags by native inference (cost floor) | | 1.78 / 1.78 | the per-argument messages go raw (NEST-2 to 4, A11Y-1, A11Y-3, TW-6, HX-1, HX-6); a second prototype, not a fix |

## 4. Verdict, the runner, the harvest

- **Gate 1a waits.** Take the runner reading once, as the code stands, before any other Strict Tags work: a preview decides nothing either way under the PRD. It costs a private repository, one secret and about ten runner minutes. The S4 amendment and the 190 follow-ups matter only if S5 holds.
- **The miss is a ratio.** In absolute CPU at 11,330 elements: 7.6 s against 2.2 s on 5.9.3, 3.3 s against 0.6 s on 7.0.2; lint 8.3 s against 3.9 s.

**Harvest if S5 misses.** About 9 of the 15 kinds Strict Tags adds ride on mechanisms that cost nothing at check time:

| Take | Kinds | Mechanism | Check-time cost |
|---|---|---|---|
| Sinks and brands | XSS-1, 4, 5, 6 at tsc; XSS-2, 3 absorbed; the 13 forging refusals | `Trusted` and a hole-free tagged template; `style` as an object; `on*` and `hx-*` keys typed as messages; a `Url` brand checked at the sink; a private `#brand` with `static is()`; type-only exports | none |
| The house rule in the handler table | HX-2, HX-3, HX-4, HX-8 | a mutation answers redirect, leave, not-found or invalid; a part names a reason from a closed union; a poll declares its bound; the search part owns its key. It belongs in the template's `defineRoutes` and `defineController` | 1.06 to 1.14 at composer size |
| View purity | PURE-1 | the view-imports rule plus the await and globals bans, untyped | negligible |
| Required attributes | A11Y-2, BTN-1 | `img` needs `{ src, alt }`; `type="button"` by default | none |
| Class text | TW-6; TW-1 to 3 if moved | an untyped lint rule; the grammar in prebuild or lint, not per element in types; family merge at run time | none in tsc |
| Forging lint, syntactic half | casts, explicit `any`, `@ts-` comments, predicates, overloads, ambient values | `no-restricted-syntax` selectors | negligible |
| Slots only | NEST-1 (li, tr, option) | plain parameter types on the factories, not generic | near none |
| The instruments | release gate (harvest row 18) | the suite scored by registered message with its ledger, the forging registry, the ruled probes, the check-time script and reader | |

Leave behind, or take only in a cheaper form: marks through the tree (NEST-2 to 4, A11Y-1, A11Y-3, form needs submit), which cost 1.2 s per 11,330 calls for the argument check alone and which html-validate already sees on rendered output except A11Y-1; and the `no-unsafe-*` rules on view files.
