# Fresh-Eyes Synthesis — fluent-html v6.2.0 audit (input to v6.3.0)

## 1. Executive summary

Eleven independent fresh-eyes lenses converged on a library whose core is healthy — the escaper is correct for the contexts it targets, the serializer is architecturally sound, the type surface is unusually disciplined — but whose failures cluster at four seams. **(1) Overload dishonesty:** the boolean-vs-nullable dual-overload pattern (`IfThen`/`when`/`whenElse`) and `Match`'s prototype-chain lookup let fully typed code receive `undefined`, render garbage, or crash — found independently by two lenses each. **(2) Silent emission failures:** classes and attributes that type-check but produce nothing (`only-child:`, `bg-radial-[…]/oklch`, `hx-on:htmx:after-swap`, `Partial(clss(...))` → `#.items`) — the exact "unstyled element instead of compile error" failure the closed-union program exists to kill. **(3) Runtime lagging the types:** `defineIds` camelization, splat substitution, `sideEffects: false` stripping the entire fluent prototype surface from bundled builds — the types promise things the runtime/packaging doesn't deliver. **(4) A scoping gap in the security promise:** escaping prevents markup breakout but the README's "XSS prevented" claim doesn't survive URL-scheme injection (`javascript:` hrefs). None of the 64 verified findings requires an architectural rework; most fixes are small, and the two measured perf wins (escapeHtml fast path, buildHtmx unrolling) roughly **double** render throughput with byte-identical output.

---

## 2. Confirmed defects, severity-ranked

56 findings survived two independent refuters; after merging cross-lens duplicates (§3), 52 rows. Severity from the discovery reports, security first, then severity × user impact. Effort: Sml (≤ ~1h), Med (half-day), Lg (multi-day).

| # | id | title | sev | impact | effort |
|---|----|-------|-----|--------|--------|
| 1 | [escaping-xss-1](../10-discovery/escaping-xss.md) | `javascript:`/`data:text/html` pass every URL setter (`setHref`/`setSrc`/`setAction`/…) unfiltered | High | `A(...).setHref(user.website)` under the README's "XSS prevented" promise ships stored XSS | Med |
| 2 | [escaping-xss-3](../10-discovery/escaping-xss.md) | `<!--<script>` drives parser into double-escaped state; library's own `</script>` no longer closes | Med | `Script(untrustedText)` swallows all following markup; mXSS potential | Sml |
| 3 | [architecture-1](../10-discovery/architecture.md) | `sideEffects: false` + side-effect-only mixin modules → bundlers strip the entire fluent API | High | Any esbuild/Vite/webpack-bundled consumer gets `Div(...).padding is not a function` at runtime (esbuild repro) | Sml |
| 4 | [htmx-emission-2](../10-discovery/htmx-emission.md) | `Partial()` force-prefixes `#` onto every non-id target: `clss("items")` → `hx-target="#.items"` | High | Partials built from the library's own `clss()`/`closest()`/`find()` helpers silently no-op | Sml |
| 5 | [routes-splat-1](../10-discovery/routes-ids.md) | Splat regex runs on the *substituted output* — a `:param` value starting with `*` throws or mis-substitutes | High | `resolve({ term: "*" })` (wildcard search) crashes at request time on a type-correct call | Sml |
| 6 | [ids-camel-2](../10-discovery/routes-ids.md) | `defineIds` runtime camelization diverges from type-level `KebabToCamel` for digits/uppercase after `-` | High | `defineIds(["col-2"])` → `ids.col2` type-checks but is `undefined` at runtime | Sml |
| 7 | [type-honesty-1](../10-discovery/type-honesty.md) ≡ [control-flow-2](../10-discovery/control-flow.md) | `Match` resolves handlers through the prototype chain (`cases["toString"]` is truthy) | High | Attacker-supplied `"toString"`/`"constructor"` status renders `[object Undefined]` or throws mid-render; sibling `MatchValue` already guards | Sml |
| 8 | [type-honesty-2](../10-discovery/type-honesty.md) ≡ [control-flow-1](../10-discovery/control-flow.md) | Boolean values match the nullable-*value* overloads of `IfThen`/`IfThenElse`/`when`/`whenElse` — callback's "narrowed" value is `undefined` | High | `boolean\|null` (Prisma `Boolean?`) silently degrades: `false` skipped, `true` yields `undefined` typed as `boolean` | Sml |
| 9 | [core-tag-1](../10-discovery/core-tag.md) | `addChild` pushes into caller-owned/shared child arrays | High | Module-level `const navItems=[...]` grows on every request; cross-instance corruption confirmed | Sml |
| 10 | [core-tag-2](../10-discovery/core-tag.md) | `setClass`/`setClasses` inside `.on()`/`.at()` wipe accumulated classes and ignore the variant prefix | High | `.on('hover', t => t.setClass('foo'))` destroys base styling and applies "hover" class unconditionally — two silent failures | Sml |
| 11 | [htmx-emission-1](../10-discovery/htmx-emission.md) | `formResetOnSwap` binds `htmx:after-swap` — an event htmx 4 never dispatches (colon-separated names) | High | The behavior silently never fires; test pins the wrong name | Sml |
| 12 | [tailwind-fidelity-1](../10-discovery/tailwind-fidelity.md) | `gradientRadial(origin, interpolation)` emits `bg-radial-[…]/oklch` — zero CSS in v4 (measured) | High | Entire gradient position + interpolation silently dropped | Sml |
| 13 | [architecture-2](../10-discovery/architecture.md) | `fluent-html/elements` subpath never registers mixins — broken even in plain Node | High | `Div().padding` is `undefined` while the `.d.ts` says it exists; guaranteed crash for subpath importers | Med |
| 14 | [render-perf-1](../10-discovery/render-perf.md) | `escapeHtml` char-scans every string; regex pre-test is 4–5× faster on clean strings | High (perf) | +3.8× variant-heavy bench, +20–45% everywhere else, byte-identical output | Sml |
| 15 | [elements-symmetry-1](../10-discovery/elements-symmetry.md) | `InputTag` lacks `formaction`/`formmethod`/`formenctype`/`formtarget`/`src`/`alt` that `ButtonTag` has | High | `<input type="image">` `alt` (a11y-required) unreachable without the branded anti-pattern `addAttribute` | Med |
| 16 | [elements-symmetry-2](../10-discovery/elements-symmetry.md) | `setWidth`/`setHeight` has five different signatures across seven sibling classes | High | `Img().setWidth(800)` (the standard CLS fix) is a compile error; `Video().setWidth("800")` errors the other way | Med |
| 17 | [htmx-emission-3](../10-discovery/htmx-emission.md) | `optimistic: false`/`preload: false` emit the *enabling* attribute; `swapOob: false` emits a garbage swap spec | Med | `optimistic: featureFlag` enables the feature when the flag is off | Sml |
| 18 | [htmx-emission-4](../10-discovery/htmx-emission.md) | `hxResponse` trigger/location JSON with non-Latin1 chars crashes Node `setHeader` (`ERR_INVALID_CHAR`) | Med | Any `š`/`č`/emoji in a toast payload → request-time throw (routine in a Slovenian app) | Sml |
| 19 | [control-flow-3](../10-discovery/control-flow.md) | `ForEach` count/range overloads throw `RangeError` on negative/fractional/NaN lengths | Med | `ForEach(capacity - items.length, …)` takes down the whole SSR response instead of rendering nothing | Sml |
| 20 | [tailwind-fidelity-2](../10-discovery/tailwind-fidelity.md) | `"only-child"` in `TailwindState` emits `only-child:` — not a Tailwind variant (zero CSS, measured) | Med | Typed, safelisted, silent no-op; correct `"only"`/`"only-of-type"` already exist in the union | Sml |
| 21 | [routes-dotsuffix-5](../10-discovery/routes-ids.md) | `ExtractParams` captures to next `/` — `/export/:id.csv` demands key `"id.csv"`, and satisfying it eats `.csv` | Med | Types steer callers from the correct call to the broken one on dot-suffixed routes | Med |
| 22 | [type-honesty-3](../10-discovery/type-honesty.md) ≡ [control-flow-4](../10-discovery/control-flow.md) | Exhaustive `Match`/`MatchValue` overloads accept widened `string` — exhaustiveness silently evaporates | Med | `MatchValue(s, {a:1})` returns `undefined` typed as `R`; `Match` renders invisible blank | Sml |
| 23 | [type-honesty-4](../10-discovery/type-honesty.md) | `Tag.attributes` typed as mutable `Record` but is a shared frozen object | Med | `Div().attributes["data-x"]="1"` compiles, throws — but only on pristine tags (state-dependent) | Sml |
| 24 | [type-honesty-5](../10-discovery/type-honesty.md) ≡ [htmx-emission-5](../10-discovery/htmx-emission.md) | `HxSwap` JSDoc says open, type is closed (valid htmx 4 swaps rejected); `HxTarget` claims validation but is `string` | Med | `"innerHTML settle:250ms"` is a compile error with no sanctioned workaround; README validation claim false | Sml |
| 25 | [type-honesty-6](../10-discovery/type-honesty.md) | Residual `(string & {})` tails + unbracketed `not-${string}`/`nth-${string}` reopen "typo-rejecting" unions | Med | `.duration("fast")`, `.gridCols("brnad")`, `.on("not-hovr")` all compile → unstyled elements | Med |
| 26 | [core-tag-3](../10-discovery/core-tag.md) | Variant scope covers only `addClass` — `.toggle()`/`.addStyle()`/attribute setters inside `.on()`/`.at()` apply unconditionally | Med | `Input().on('disabled', t => t.toggle('disabled'))` is always disabled; no diagnostic | Med |
| 27 | [core-tag-5](../10-discovery/core-tag.md) | No class-conflict resolution — `p-4` + `.when(…, t => t.padding("2"))` ships both, stylesheet order wins | Med | Documented override idiom is unreliable; lint message describes semantics the runtime doesn't have | Med |
| 28 | [core-tag-6](../10-discovery/core-tag.md) | Mutation-based chaining with no `.clone()` — a reused Tag constant accumulates state across requests | Med | Module-level tag leaks classes/attrs/children cross-request in SSR; no documented remedy | Sml |
| 29 | [tailwind-fidelity-3](../10-discovery/tailwind-fidelity.md) | `TailwindTranslate` rejects positive `full`/fractions — `translate-x-full`, `translate-x-1/2` untypeable | Med | The standard drawer/centering idioms force the `[…]` hatch; negative forms accepted | Sml |
| 30 | [tailwind-fidelity-4](../10-discovery/tailwind-fidelity.md) | `TailwindAspect` closed to 3 keywords — no ratio form and no `[…]` hatch at all | Med | No way to express any aspect ratio beyond square/video | Sml |
| 31 | [tailwind-fidelity-5](../10-discovery/tailwind-fidelity.md) | Closed v3 spacing ladder + border widths reject values v4 ships dynamically (`p-13`, `border-3` measured valid) | Med | Hard compile errors on first-class v4 classes; `[…]` detour hardcodes what should be theme-derived | Med |
| 32 | [elements-symmetry-3](../10-discovery/elements-symmetry.md) | `.toggle(name, false)` cannot remove — the only primitive violating last-call-wins | Med | A preset's `disabled` can never be re-enabled downstream via `.apply()`/`.when()` | Sml |
| 33 | [elements-symmetry-4](../10-discovery/elements-symmetry.md) | `setRel` is single-token while `rel` is a token list — `"noopener noreferrer"` only via the untyped tail | Med | The most common security pair gets zero autocomplete; 3 token-list attrs, 3 different APIs | Sml |
| 34 | [elements-symmetry-5](../10-discovery/elements-symmetry.md) | `<ol start/type>`, `<li value>` unreachable while companion boolean `reversed` is typed | Med | Paginated list numbering (classic SSR) requires `addAttribute` | Sml |
| 35 | [routes-prefix-3](../10-discovery/routes-ids.md) | Prefix params can't be typed: declaring is a compile error, omitting silently falls back to `string` | Med | `number`/`uuid`/enum typing unreachable for exactly the params a prefix shares | Med |
| 36 | [ids-uniqueness-6](../10-discovery/routes-ids.md) | `defineIds` colliding camelCase keys silently last-write-win; leading-digit ids yield invalid CSS selectors | Med | `["user-list","userList"]` → one id silently unreachable, targets retarget | Sml |
| 37 | [render-perf-2](../10-discovery/render-perf.md) | `buildHtmx` walks a 19-entry config table with megamorphic dynamic reads per htmx tag | Med (perf) | Unrolled direct checks 3× faster; +55% HTMX bench; ~2× combined with #14 | Sml |
| 38 | [architecture-3](../10-discovery/architecture.md) | Published tarball ships dangling sourcemap/declarationMap references (0 `.map` files packed) | Med | Debugger warnings; "Go to Definition" silently degrades | Sml |
| 39 | [architecture-5](../10-discovery/architecture.md) | Root-vs-subpath surface drift; 8 of 9 export-map entries undocumented (escape helpers, `Tailwind*` types root-unreachable) | Med | Users can't type `(size: TailwindSpacing) => …` from the root import; arbitrary `./patterns` asymmetry | Med |
| 40 | [control-flow-5](../10-discovery/control-flow.md) | DU `Match` accepts numeric discriminant keys at type level, crashes at runtime (`TypeError` mid-render) | Low | One-line `K extends keyof T & string` removes the class | Sml |
| 41 | [core-tag-7](../10-discovery/core-tag.md) | `addAttribute` overwrites (violates own `set*`/`add*` convention); variant `addClass` emits dangling class on double spaces | Low | Convention unlearnable; `hover:` orphan class on `'a  b'` | Sml |
| 42 | [core-tag-8](../10-discovery/core-tag.md) | Numeric runtime children silently dropped — `Div(42)` → `<div></div>` | Low | `Span(items.length)` via `as any`/JS renders nothing, invisibly | Sml |
| 43 | [tailwind-fidelity-6](../10-discovery/tailwind-fidelity.md) | `TailwindOutline` missing `solid` + all widths; no `outlineColor`/`outlineOffset` | Low | v4 focus treatments (`outline-2 outline-blue-500`) inexpressible | Sml |
| 44 | [tailwind-fidelity-7](../10-discovery/tailwind-fidelity.md) | Named `in-*` states and responsive `max-*` breakpoints missing from variant unions | Low | `.at("max-sm", …)` (standard mobile-only idiom) untypeable | Sml |
| 45 | [tailwind-fidelity-8](../10-discovery/tailwind-fidelity.md) | `TailwindMaxWidth`/`MinWidth` drifted from v4 container scale (`3xs`, `2xs`, `dvw`; `min-w-*` nearly empty) | Low | `.minW()` unusable without bracket hatch | Sml |
| 46 | [elements-symmetry-6](../10-discovery/elements-symmetry.md) | `AreaTag.setDownload` drops the `boolean` overload `AnchorTag` has (identical spec grammar) | Low | `Area().setDownload(true)` compile error | Sml |
| 47 | [elements-symmetry-7](../10-discovery/elements-symmetry.md) | Image-map trio: `MapTag`/`AreaTag`/`ismap` typed, but `ImgTag` has no `usemap` | Low | The attribute that connects image to map is the one missing leg | Sml |
| 48 | [htmx-emission-7](../10-discovery/htmx-emission.md) | `hx-status` HCON grammar corruptible via typed `HxSwap`/`HxTarget` inputs; `50x` wildcards rejected | Low | `{swap:"innerHTML scroll:top"}` emits parse-corrupting pairs | Sml |
| 49 | [routes-midsplat-7](../10-discovery/routes-ids.md) | Mid-path wildcards type-rejected but runtime-silent — literal `*path` emitted into URLs | Low | Silently broken link instead of a definition-time error | Sml |
| 50 | [render-perf-5](../10-discovery/render-perf.md) | Per-node frame objects + close-tag concat: measured only +5–13% on 5000-node lists | Low (perf) | Not the bottleneck; fold in only if `emit`/`emitChunks` are rewritten anyway | Med |
| 51 | [architecture-6](../10-discovery/architecture.md) | Missing `./package.json` export blocks tooling introspection (`ERR_PACKAGE_PATH_NOT_EXPORTED`) | Low | Extractor/ESLint version-sniffing and scanners blocked | Sml |
| 52 | [dx-ideas-8](../10-discovery/dx-ideas.md) | README behavior table documents 8 of 13 behaviors (`back` undiscoverable); flagship form example uses raw `setClass` | Low | New adopters copy the anti-pattern; recommended `back` primitive invisible | Sml |

---

## 3. Cross-lens duplicates (merged above)

Independent lenses converging on the same defect is itself a signal — these four are the highest-confidence items in the audit:

- **`Match` prototype-chain lookup** — [control-flow-2](../10-discovery/control-flow.md) ≡ [type-honesty-1](../10-discovery/type-honesty.md). Same fix (mirror `MatchValue`'s `hasOwnProperty` guard); merged as row 7.
- **Boolean-vs-nullable dual overloads** — [type-honesty-2](../10-discovery/type-honesty.md) ≡ [control-flow-1](../10-discovery/control-flow.md), with [core-tag-4](../10-discovery/core-tag.md) (plausible, §4) as the `.when()`-JSDoc face of the same design tension. Merged as row 8; fix the two confirmed type-lies together and settle the `false`-carve-out documentation/`whenSome` question in the same pass.
- **`HxSwap` open-vs-closed contradiction** — [htmx-emission-5](../10-discovery/htmx-emission.md) ≡ [type-honesty-5](../10-discovery/type-honesty.md). Merged as row 24.
- **`Match`/`MatchValue` widened-string exhaustiveness** — [control-flow-4](../10-discovery/control-flow.md) ≡ [type-honesty-3](../10-discovery/type-honesty.md). Same `LiteralOnly<T>` gate; merged as row 22.
- **htmx 4 `:inherited` gap** — [htmx-emission-6](../10-discovery/htmx-emission.md) ≡ [dx-ideas-3](../10-discovery/dx-ideas.md). Both propose a typed container-level API (`hxInherit(options)`); listed once in the ideas table (§5) at the higher judge score.

---

## 4. Plausible but unconfirmed (split refuter votes)

Eight findings had one refuter confirm by reproduction and one refute on intent/contract grounds. In every case the *mechanism* is real; the dispute is whether it's a defect. Treat as design-decision inputs, not fix tickets.

| id | dissenting refuter's argument |
|----|------------------------------|
| [escaping-xss-2](../10-discovery/escaping-xss.md) (`setSrcdoc` HTML sink) | Attribute-escaping is the *only* spec-correct, lossless encoding for `srcdoc`; React/Vue/lit behave identically, and README's iframe-security section already models `setSrcdoc(html).setSandbox(...)` — a docs-polish item, not a defect ([refuter-1](../30-verification/escaping-xss-2-refuter-1.md)). |
| [escaping-xss-4](../10-discovery/escaping-xss.md) (`_blank` without `noopener`) | WHATWG has implied `noopener` for `target="_blank"` since ~2019–21 in all evergreen engines; auto-injecting `rel` would strip Referer, break OAuth popups, and violate the faithful-primitives contract ([refuter-1](../30-verification/escaping-xss-4-refuter-1.md)). |
| [core-tag-4](../10-discovery/core-tag.md) (`.when(false)` skipped, `0`/`""` run) | The `false`-skips behavior is test-locked, library-wide dual-mode dispatch shared with `IfThen`; the JSDoc's boolean sentence covers `false` before the nullable rule — residual is a JSDoc clarification for `boolean\|undefined` fields ([refuter-1](../30-verification/core-tag-4-refuter-1.md)). |
| [routes-paramtype-4](../10-discovery/routes-ids.md) (no runtime param enforcement) | Compile-time-only is the *documented* contract in four places (module header, `ParamTypeName` JSDoc, README:597, a test literally titled "uuid (string)"); runtime guards would break an intentional test ([refuter-1](../30-verification/routes-paramtype-4-refuter-1.md)). |
| [control-flow-6](../10-discovery/control-flow.md) (`ForEach` visits sparse holes) | The contract is `Iterable<T>`, and iterator semantics materialize holes as `undefined`; the fast path is byte-identical to its own `Array.from` fallback — `map`'s hole-skipping is the wrong baseline ([refuter-1](../30-verification/control-flow-6-refuter-1.md)). |
| [render-perf-4](../10-discovery/render-perf.md) (bench harness too noisy) | The gate self-describes as "catastrophic-only"; 2× detection is a documented non-goal, and 1.5× floors would flake anyway given 2–5× machine-to-machine variance that median-sampling cannot fix ([refuter-1](../30-verification/render-perf-4-refuter-1.md)). (Refuter-2 reproduced spreads *worse* than claimed — improving `measure()` is still worthwhile even if the gate stays catastrophic-only.) |
| [type-honesty-7](../10-discovery/type-honesty.md) (`isId` launders structural objects) | The brand comment accurately describes the *compile-time* guarantee; `createId` itself discloses "brand is compile-time only", and `isId` is a union discriminator, not a trust boundary — a spoofed object gains nothing a plain string in the same slot lacks ([refuter-1](../30-verification/type-honesty-7-refuter-1.md)). |
| [architecture-4](../10-discovery/architecture.md) (latent core↔render cycle) | No cycle exists today; even the simulated cycle evaluates cleanly under ESM (calls are lazy, no TDZ access), and "separable subpath units" is not a promise the package makes anywhere ([refuter-1](../30-verification/architecture-4-refuter-1.md)). |

---

## 5. Ranked ideas (judge-scored, gap-checked)

All gaps confirmed against current `src/` unless noted.

| score | id | gap | pitch |
|-------|----|-----|-------|
| 8 | [dx-ideas-2](../10-discovery/dx-ideas.md) | ✓ | `FormBinding.label()` + controls get `id={name}` — kills the id/name/for triple-repetition the library's own examples exhibit; the binding already does id-based wiring for errors, labels are the one a11y link left manual |
| 8 | [dx-ideas-7](../10-discovery/dx-ideas.md) | ✓ | Auto-emit `cursor-pointer` from `AnchorTag.setHtmx` when no `href` — turns a lint-enforced 100%-of-cases chore into API behavior (precedent: `htmxIndicator()`) |
| 7 | [query-arrays-8](../10-discovery/routes-ids.md) | ✓ | Array `QueryParamValue` → repeated-key encoding (`?tags=a&tags=b`); one shared `buildQueryString` change covers `hx()` and route callables for free |
| 7 | [dx-ideas-1](../10-discovery/dx-ideas.md) | ✓ | Registry-level HX defaults on `defineRoutes` — stop retyping `target`/`swap`/`pushUrl` at every nav call site; call-site > route > registry merge |
| 6 | [htmx-emission-6](../10-discovery/htmx-emission.md) (≡ dx-ideas-3, scored 4) | ✓ | Typed `hxInherit({confirm, target, swap, …})` for htmx 4 `:inherited`/`:append` — the flagship htmx 4 pattern currently routes through `addAttribute` in the README itself |
| 6 | [render-perf-3](../10-discovery/render-perf.md) | ✓ | `Static(thunk)` helper / documented `Raw(render(chrome))` pattern — measured +21% on the realistic page *on top of* the two perf fixes; must document the nonce caveat |
| 6 | [dx-ideas-4](../10-discovery/dx-ideas.md) | ✓ | Id families: `defineIds(["user-row-*"])` → `ids.userRow(42)` — single-sources per-row target prefixes the current API forces into ad-hoc template strings |
| 6 | [dx-ideas-5](../10-discovery/dx-ideas.md) | ✓ | Object overload `padding({x:"6", y:"3"})`/`margin(...)` — the most common spacing pair stops costing two calls |
| 6 | [dx-ideas-6](../10-discovery/dx-ideas.md) | ✓ | `.size()` for Tailwind v4 `size-*` — one vocab row; a v4-native library shouldn't lack v4's square-sizing utility |
| 5 | [elements-symmetry-8](../10-discovery/elements-symmetry.md) | ✓ (broader: ~112 required vs ~165 optional setters) | Sweep all element value-setters to `arg?: T` (undefined clears) — strictly widening, fixes conditional composition |
| 5 | [control-flow-7](../10-discovery/control-flow.md) | ✓ | Widen `ForEachElse` to `Iterable<T>` — the one member of the iteration quartet that rejects iterables |
| 4 | [dx-ideas-3](../10-discovery/dx-ideas.md) | ✓ | (merged into htmx-emission-6 above) |

**Verified non-issues** — recorded so effort isn't re-spent: [render-perf-6](../10-discovery/render-perf.md) (judge score 2, gap *not* confirmed as improvable): `for…in` over the null-prototype attribute bag measures *slower* than `Object.keys`, and constructor-initializing Tag's optional fields measures flat — keep both as-is. From the refuter record: `srcdoc` attribute-escaping is spec-correct serialization (escaping-xss-2 dissent), `.when(false)` skipping is test-locked intended dispatch (core-tag-4 dissent), sparse-hole visiting matches the `Iterable` contract (control-flow-6 dissent), and the bench gate's 8× floors are documented catastrophic-only design (render-perf-4 dissent).

---

## 6. Performance: the measured numbers

All measurements against `dist/` of v6.2.0 (commit 0ffed5e), byte-identical output verified, full 415-test suite (incl. render≡stream fuzz parity) passing on patched builds. Baseline bench (Apple Silicon, 3 runs): Flat 1000 divs 5.6–6.9K ops/s · Deep 100 levels 105–125K · Heavy escaping 8.6–11.3K · HTMX attrs 12.0–18.3K · Realistic page 20.9–24.8K · Variant-heavy 9.7–10.5K · Large ForEach 5000 0.86–1.23K.

- **[render-perf-1](../10-discovery/render-perf.md) — escapeHtml regex pre-test:** clean strings 81–94 → **19–21 ns/op (4.3×)**; dirty ≤ 11% slower. End-to-end: variant-heavy **3.8×** (9.7–10.5K → 35.3–40.6K), realistic +25–45%, flat +20–37%, HTMX +19–69%. Two-line change.
- **[render-perf-2](../10-discovery/render-perf.md) — buildHtmx unrolling:** 353–357 → **118–119 ns/op (3×)** micro; HTMX bench 18.0K → **27.8K (+55%)**. Combined with perf-1: 32.0–37.4K ≈ **2× baseline**.
- **[render-perf-3](../10-discovery/render-perf.md) — static chrome prerender:** **+21%** on the realistic page (44.4–45.1K → 53.5–54.0K) *after* fixes 1–2; proportionally larger on unpatched v6.2.0.
- **[render-perf-5](../10-discovery/render-perf.md) — emit-loop allocations:** only +5–13% on 5000-node lists, ±2% elsewhere — not worth a dedicated change.
- **Caveat ([render-perf-4](../10-discovery/render-perf.md), plausible):** the bench harness shows 25–57% run-to-run spread — the same order as the wins above. Every number here was therefore confirmed by 3+ alternating A/B runs plus micro-benchmarks; before landing the perf work, spend ~20 lines making `measure()` median-of-N and interleaved so the improvements are provable in CI.

---

## 7. Suggested release slicing

### 6.2.x patch — pure bug fixes, no API surface change, output changes only where current output is broken

1. **Match prototype guard** (rows 7, 40) — `hasOwnProperty` + `K & string`.
2. **Boolean overload honesty** (row 8) — pass the condition through in the boolean branch (`fn(this, condition)` / `then(conditionOrValue)`); only `true` ever arrives, a legal inhabitant of the claimed type.
3. **htmx emission fixes** (rows 4, 11, 17, 18) — `Partial` verbatim selectors, `htmx:after:swap`, truthiness-gate `optimistic`/`preload`/`swapOob`, ASCII-escaped header JSON.
4. **Routes/ids runtime** (rows 5, 6) — template-time splat detection; `-(.)`-based camelization matching `Capitalize`.
5. **Emitters** (rows 12, 20) — `gradientRadial` folds interpolation into the arbitrary value; remap `only-child` → `only` in `p.on` (the string never produced CSS, so remap is safe in a patch; delete the union member in 6.3.0).
6. **`ForEach` clamp** (row 19) — `Math.max(0, Math.floor(len) || 0)`.
7. **Packaging** (rows 3, 13, 38, 51) — `sideEffects` array + esbuild smoke test in CI; `core/register.ts` imported by every Tag-producing barrel; ship or stop referencing `.map` files; `"./package.json"` export.
8. **Perf, byte-identical** (rows 14, 37) — escapeHtml pre-test + buildHtmx unroll (with the render-perf-4 harness hardening so the win is visible in CI).
9. **`addChild` copies foreign arrays** (row 9) — corruption fix, behavior only changes for currently-corrupting calls.
10. **`<script>` guard hardening** (row 2) — neutralize `<!--`/`<script`/`<style` openers in raw contexts; at minimum promote the parked comment to a documented limitation.
11. **Docs-only** (row 52) — README behavior table + fluent-ify the form example.

### 6.3.0 minor — type widenings, new methods, ideas (additive; compile-visible but non-breaking or strictly-widening)

- **Tailwind fidelity sweep** (rows 25, 29–31, 43–45): translate/aspect/spacing/border/outline/`in-*`/`max-*`/max-width unions; convert `(string & {})` tails to `${number}`/`[${string}]` arms; delete `"only-child"`.
- **Elements symmetry sweep** (rows 15, 16, 32–34, 46, 47 + elements-symmetry-8 idea): InputTag submit family, unified `setWidth/Height(w?: string|number)`, `toggle(name, false)` removes, variadic `setRel`, `OlTag`/`LiTag`, `AreaTag.setDownload(boolean)`, `ImgTag.setUsemap`, optional-param sweep. (Note `toggle(false)`-removes is a behavior change — flag in changelog.)
- **Type-honesty gates** (rows 22–24): `LiteralOnly<T>` on exhaustive `Match`/`MatchValue` (may break latently-wrong call sites — that's the point; minor, with changelog guidance), `readonly attributes`, `HxSwap` open tail or extended grammar + fixed JSDoc.
- **Fail-fast guards** (rows 10, 26, 36, 49, 41, 42): throw on `setClass` under a variant prefix, dev-mode variant-scope guard for `toggle`/`addStyle`/`addAttribute`, `defineIds` collision/valid-name errors, definition-time mid-splat error, `setAttribute` alias (+ deprecate `addAttribute` name), stringify numeric children.
- **Routes** (rows 21, 35): `ExtractParams` identifier-boundary trimming, prefix-param validation against the joined path.
- **Ideas, in score order**: FormBinding `label()`/ids (8), anchor auto-`cursor-pointer` (8 — needs the small design sign-off below), query arrays (7), `defineRoutes` HX defaults (7), `hxInherit` (6), `Static()` (6), id families (6), `padding({x,y})` (6), `.size()` (6), `ForEachElse` Iterable (5).

### Needs a design decision first

- **URL scheme filtering policy (row 1)** — block/neutralize `javascript:`/`vbscript:`/non-image `data:` in `setHref`/`setSrc`/`setAction`/`setFormaction`/`setData`/`setCite`/`setPoster` with an explicit `unsafeUrl()` hatch, or keep pass-through and *re-scope the README's XSS guarantee*? Changing emitted output for hostile-looking values is semver-relevant; the docs correction is mandatory either way. Decide alongside the srcdoc stance (escaping-xss-2, §4) so the library states one coherent "escape ≠ sanitize" boundary.
- **Class-conflict resolution (row 27)** — last-wins dedup by conflict group at `buildAttrs` time (runtime cost, needs the vocab's conflict groups in core) vs documenting that overrides must use `whenElse`. Affects the meaning of every `.apply()` preset + `.when()` override in user code.
- **`.clone()` vs immutability stance (row 28)** — add `clone()` and document "export factories, not instances", or go further toward persistent builders? Interacts with row 9's ownership semantics and the `Static()` idea.
- **`HxTarget` honesty direction (row 24)** — drop the `string` arm (honest, breaking) vs reword the README claim (honest, free).
- **Subpath exports (row 39)** — trim the map to `"."` + `"./class-vocab"` (semver-major on paper, but `./elements` is demonstrably broken and unused) vs bring all nine entries to parity with smoke tests and docs.
- **Anchor auto-cursor (dx-ideas-7)** — emitting a class the author didn't write is a (small) faithful-output exception; approve the precedent explicitly before implementing.
- **`.when()` nullable-boolean spelling (core-tag-4, §4)** — JSDoc-only clarification vs adding `whenSome(value, fn)` with pure `!= null` dispatch.
- **Bench gate philosophy (render-perf-4, §4)** — keep catastrophic-only floors but fix `measure()` sampling, or invest in a stable runner with historical baselines.

---

## Methodology

Fresh-eyes round: no prior research or roadmaps were consulted. 11 discovery lenses (escaping-xss, core-tag, tailwind-fidelity, elements-symmetry, htmx-emission, routes-ids, control-flow, render-perf, type-honesty, dx-ideas, architecture) audited v6.2.0 (commit 0ffed5e) with empirical verification — node one-liners against `dist/`, `tsc --strict` probes, real tailwindcss 4.3.2 `compile()` runs, esbuild bundling repros, A/B micro-benchmarks. Every bug/issue/perf finding then faced **two independent adversarial refuters** (refute-by-reproduction and refute-by-intent): 56 confirmed by both, 8 split (§4), 0 fully refuted. Ideas were gap-checked and scored 1–10 by a judge. **152 agents total.**
