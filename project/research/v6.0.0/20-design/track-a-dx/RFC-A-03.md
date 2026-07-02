---
id: RFC-A-03
track: A
title: Element-setter coverage & naming consistency
resolves: [F-A-013, F-A-043, F-A-015, F-A-044, F-A-071, F-A-012, F-A-006]
api_surface:
  - "InputTag.setInputmode()"
  - "TextareaTag.setInputmode()"
  - "InputMode (type)"
  - "LinkTag.setHreflang()"
  - "SvgShapeTag.setOpacity()"   # behavior change: now routes through _sk
  - "SvgShapeTag.setFilter()"    # behavior change: now routes through _sk
  - "LinkTag.setCrossOrigin()"
  - "ScriptTag.setCrossOrigin()"
  - "CrossOrigin (type)"
  - "InputTag.setReadOnly()"
  - "TextareaTag.setReadOnly()"
  - "InputTag.setAutoFocus()"
  - "TextareaTag.setAutoFocus()"
  - "SelectTag.setAutoFocus()"
  - "FormTag.setNoValidate()"
  - "IframeTag.setAllowFullscreen()"
  - "IframeTag.setReferrerPolicy()"
  - "ButtonTag.setFormAction()"
  - "ButtonTag.setFormMethod()"
  - "MetaTag.setHttpEquiv()"      # bug fix: emits http-equiv (was httpEquiv)
  - "OptionTag.setValue()"        # signature: value?: string
  - "Tag._sk (SchemaKey tuple form)"
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md"]
impact: medium
effort: M
depends_on: []
status: proposed
---

# RFC-A-03: Element-setter coverage & naming consistency

## Problem

The "specialized tag methods over `addAttribute`" rule (guardrail §11.6, CLAUDE.md) is only as good as the typed-setter coverage. Seven findings show the surface has holes, type bugs, a silent correctness bug, and a naming break — and every hole pushes apps back to `addAttribute`, the exact escape hatch the guideline forbids:

- **F-A-013** — `InputTag`/`TextareaTag` have no `inputmode` setter. `rideshare/src/shared/components/phone-input.view.ts:96` falls back to `.addAttribute("inputmode", "tel")` for mobile keyboard UX.
- **F-A-043** — `LinkTag` has no `hreflang` setter. 4 apps (`jtdigital-landing-page/src/shared/seo.ts:299`, `jt-cut/src/shared/components/layout.view.ts:143,145`, `filmplast-v2/src/shared/seo.ts:212,217`) write `.addAttribute("hreflang", …)` on every i18n alternate link.
- **F-A-044** — `LinkTag.setCrossorigin()`/`ScriptTag.setCrossorigin()` are typed `'anonymous' | 'use-credentials'`, so the W3C-valid bare/empty form `crossorigin=""` (required for Google Fonts preconnect) is a type error. **8 apps** fall back to `.addAttribute("crossorigin", "")` (`jtdigital-landing-page/src/shared/layout.ts:88`, `pravila.si.v2/src/views/layout.ts:40`, `tela/src/views/shared.ts:51`, `movies/src/views/components.ts:68`, `vabilo30/.../invitation-layout.view.ts:97`, `idea-hub/.../layout.view.ts:44`, `gym-crm/src/scenes/core/ui.ts:76`).
- **F-A-071** — 8 multi-word setters use verbatim lowercase HTML names (`setReadonly`, `setCrossorigin`, `setAutofocus`, `setNovalidate`, `setAllowfullscreen`, `setReferrerpolicy`, `setFormaction`, `setFormmethod`) instead of the TypeScript camelCase every other setter uses (`setStrokeWidth`, `setFontFamily`, `setRowspan`). **25 documented `addAttribute` bypasses** across 7+ apps because devs type the camelCase name, get no autocomplete, and give up (`tela/src/controllers/orgs.controller.ts:50` `addAttribute("autofocus","true")`, `gym-crm/src/scenes/qr/qrUI.ts:361` `addAttribute("readonly","true")`).
- **F-A-012** — `MetaTag` stores `http-equiv` under the camelCase property `httpEquiv`, and the renderer emits `_sk` keys verbatim (`render.ts:213`), so `Meta().setHttpEquiv("content-security-policy")` renders `<meta httpEquiv="…">` — **a silently broken element** (browsers ignore `httpEquiv`). Untested.
- **F-A-015** — `SvgShapeTag.setOpacity()`/`setFilter()` route through `addAttribute` while every sibling setter writes a typed `_sk` field (`svg.ts:46,61`). Inconsistent; drops `opacity`/`filter` through the fold/transform path differently from `fill`/`stroke`.
- **F-A-006** — `OptionTag.setValue(value: string)` is required while `InputTag`/`ButtonTag` `setValue(value?: string)` are optional (`forms.ts:407` vs `:47,265`). `.setValue(maybeUndefined)` compiles on `Input()`/`Button()` but is a type error on `Option()`.

The root cause behind F-A-012 (and the *blocker* for the F-A-071 renames) is a limitation of the `_sk` ("schema keys") serialization scheme: the renderer assumes **JS property name == HTML attribute name** (`render.ts:208-216`, duplicated in `stream.ts:146-154`). That holds for `src`/`href`/`charset` and for hyphen-quoted SVG props (`'stroke-width'`), but breaks for any camelCase property that maps to a hyphenated attribute. Fixing it once unblocks the whole cluster cleanly.

## Proposed API

### 1. `_sk` gains a tuple form: `[propName, attrName]`

The single enabling change. `_sk` entries stay plain strings when prop name == attribute name (the common case, zero overhead); a `[prop, attr]` tuple decouples the JS field from the emitted attribute.

```ts
// core/tag.ts
export type SchemaKey = string | readonly [prop: string, attr: string];
// was: declare readonly _sk?: readonly string[];
declare readonly _sk?: readonly SchemaKey[];
```

Renderer loop (`render.ts` and `stream.ts` — see §Migration for the dedup note):

```ts
const sk = tag._sk;
if (sk !== undefined) {
  for (let i = 0; i < sk.length; i++) {
    const entry = sk[i]!;
    const prop = typeof entry === 'string' ? entry : entry[0];
    const attr = typeof entry === 'string' ? entry : entry[1];
    const value = (tag as unknown as Record<string, unknown>)[prop];
    if (value !== undefined && value !== null) {
      attrs += ' ' + attr + '="' +
        escapeAttr(typeof value === 'string' ? value : String(value)) + '"';
    }
  }
}
```

### 2. New typed setters (additive coverage — F-A-013, F-A-043)

```ts
// elements/html-types.ts
export type InputMode =
  | 'none' | 'text' | 'decimal' | 'numeric'
  | 'tel' | 'search' | 'email' | 'url';

// InputTag & TextareaTag
inputmode?: InputMode;
setInputmode(inputmode?: InputMode): this;   // both add 'inputmode' to _sk

// LinkTag
hreflang?: string;
setHreflang(hreflang?: string): this;          // adds 'hreflang' to _sk
```

### 3. `crossorigin` accepts the bare form (F-A-044)

```ts
// elements/html-types.ts
export type CrossOrigin = 'anonymous' | 'use-credentials' | '';

// LinkTag & ScriptTag
crossorigin?: CrossOrigin;
setCrossOrigin(crossorigin?: CrossOrigin): this;   // '' → crossorigin=""
```

### 4. camelCase setter names, lowercase kept as deprecated aliases (F-A-071)

```ts
// new canonical names; old names become @deprecated thin aliases (one major)
setReadOnly(readonly?: boolean): this;        // was setReadonly       (Input, Textarea)
setAutoFocus(autofocus?: boolean): this;      // was setAutofocus      (Input, Textarea, Select)
setNoValidate(novalidate?: boolean): this;    // was setNovalidate     (Form)
setCrossOrigin(crossorigin?: CrossOrigin): this; // was setCrossorigin (Link, Script)
setAllowFullscreen(allowfullscreen?: boolean): this; // was setAllowfullscreen (Iframe)
setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this; // was setReferrerpolicy (Iframe)
setFormAction(formaction?: string): this;     // was setFormaction     (Button)
setFormMethod(formmethod?: 'get' | 'post'): this; // was setFormmethod (Button)
```

The underlying JS field can keep the lowercase HTML name (e.g. `readonly`) so `_sk` stays a plain string — no tuple needed for these. `setReferrerPolicy` is additionally tightened from `string` to the existing `ReferrerPolicy` union (already defined, `html-types.ts:35`).

### 5. `http-equiv` bug fix via the tuple form (F-A-012)

```ts
// MetaTag: keep the camelCase JS field, emit the correct attribute
httpEquiv?: string;
setHttpEquiv(httpEquiv?: string): this;
(MetaTag.prototype as any)._sk =
  ['name', 'charset', ['httpEquiv', 'http-equiv'], 'property', 'content'];
//                     ^^^^^^^^^^^^^^^^^^^^^^^^^^ tuple: field httpEquiv → attr http-equiv
```

### 6. SVG `opacity`/`filter` join `_sk` (F-A-015)

```ts
// SvgShapeTag
opacity?: string;
filter?: string;
setOpacity(opacity: string): this { this.opacity = opacity; return this; } // was addAttribute
setFilter(filter: string): this  { this.filter = filter;  return this; }   // was addAttribute
const SHAPE_SK = [..., 'opacity', 'filter'] as const;
```

### 7. `OptionTag.setValue` optional (F-A-006)

```ts
setValue(value?: string): this;   // was value: string; _sk already skips undefined
```

## Worked examples (before → after)

**i18n alternate links — `jt-cut/src/shared/components/layout.view.ts:143-145` (F-A-043):**

```ts
// before
Link().setRel("alternate").addAttribute("hreflang", loc).setHref(`...`)
Link().setRel("alternate").addAttribute("hreflang", "x-default").setHref(`...`)
```
```ts
// after
Link().setRel("alternate").setHreflang(loc).setHref(`...`)
Link().setRel("alternate").setHreflang("x-default").setHref(`...`)
```

**Google Fonts preconnect — `jtdigital-landing-page/src/shared/layout.ts:88` (F-A-044 + F-A-071):**

```ts
// before
Link().setRel("preconnect").setHref("https://fonts.gstatic.com")
  .addAttribute("crossorigin", "")          // forced: setCrossorigin("") was a type error
```
```ts
// after
Link().setRel("preconnect").setHref("https://fonts.gstatic.com")
  .setCrossOrigin("")                        // '' ∈ CrossOrigin → crossorigin=""
```

**Mobile numeric keyboard — `rideshare/src/shared/components/phone-input.view.ts:96` (F-A-013):**

```ts
// before
Input("tel").setName("phone").addAttribute("inputmode", "tel")
```
```ts
// after
Input("tel").setName("phone").setInputmode("tel")    // InputMode union, autocompletes
```

**Read-only field — `gym-crm/src/scenes/qr/qrUI.ts:361` (F-A-071):**

```ts
// before — dev typed setReadOnly, no autocomplete match, fell back to escape hatch
Input().addAttribute("readonly", "true")   // also wrong: readonly="true" is truthy noise
```
```ts
// after
Input().setReadOnly()                        // canonical camelCase; or .toggle("readonly")
```

**CSP meta tag — silently broken today (F-A-012):**

```ts
// before
Meta().setHttpEquiv("content-security-policy").setContent(csp)
// → <meta httpEquiv="content-security-policy" ...>   ✗ browser ignores it
```
```ts
// after (no app-code change — same call site, correct output)
Meta().setHttpEquiv("content-security-policy").setContent(csp)
// → <meta http-equiv="content-security-policy" ...>  ✓
```

## Type-safety story

- **Literal unions over bare `string`** (guardrail §11.4): `InputMode` and `CrossOrigin` are closed unions — `setInputmode("telephone")` and `setCrossOrigin("yes")` are compile errors. `setReferrerPolicy` is tightened from `string` to the existing `ReferrerPolicy` union as a free win of the rename.
- **The `''` member is deliberate**, not a widening: `CrossOrigin = 'anonymous' | 'use-credentials' | ''` keeps the two meaningful values discoverable while admitting the spec-valid bare form. `(string & {})` was rejected — it would kill autocomplete and re-open the typo hole.
- **`SchemaKey = string | readonly [string, string]`** is itself typed; the tuple form is the *only* sanctioned way to decouple field↔attribute, so future hyphenated attributes (`accept-charset`, `data-*` typed setters) have a typed, non-`any` path instead of another `addAttribute` leak.
- **`OptionTag.setValue(value?: string)`** removes a spurious type error; the `_sk` renderer already skips `undefined` (`render.ts:212`), so the looser type matches runtime exactly.
- No new `any` reaches consumers; the two `(prototype as any)._sk` writes are the existing internal pattern.

## Migration & compatibility

**Additive overall.** New setters and the `''` union member add surface without removing any. Specifics:

- **Renames (F-A-071):** new camelCase names ship; old lowercase names stay as `@deprecated` one-line aliases (`setReadonly(v) { return this.setReadOnly(v); }`) for all of v6 — **nothing breaks**. The `eslint-plugin-fluent-html` `prefer-set-method` map gains the camelCase targets (it already maps `addAttribute("readonly", …)` → setter; update the suggested name) plus an autofix `setReadonly → setReadOnly`. Removal of the aliases is a v7 line item in `breaking-changes.md`, codemod = pure rename.
- **`http-equiv` (F-A-012):** technically a **behavior change** — output goes from the broken `httpEquiv` to the correct `http-equiv`. No app calls `setHttpEquiv` today (grep-confirmed in the finding), so blast radius is zero; treat as a bug fix, not breaking. Add the missing test (`elements.test.ts` near :460).
- **SVG `opacity`/`filter` (F-A-015):** output is identical (`opacity="…"` either way); only the internal path changes (`attributes` bag → `_sk`). Serialization order shifts (now before the `attributes` bag) — irrelevant to browsers. The deprecated `setSvgOpacity` alias is unaffected.
- **`crossorigin` (F-A-044):** widening a union is non-breaking.
- **`OptionTag.setValue` (F-A-006):** loosening a parameter from required to optional is non-breaking for all existing callers.
- **`_sk` tuple form:** `SchemaKey = string | [string,string]` is a superset of `string[]`; every existing `_sk` array still type-checks. The renderer adds one `typeof` branch per attribute — negligible, and only the tuple path pays the array index (Track-D should confirm no hot-path regression on the common string case; the branch is monomorphic).

**Class-string contract (guardrail §11.7):** none of these emit Tailwind classes — no Track-C extractor/ESLint impact. The only tooling touch is the `prefer-set-method` rename map above.

**Dedup note (ties to recon §6.5):** the `_sk` loop is copy-pasted in `render.ts:208` and `stream.ts:146`. This RFC must patch **both**; it is a concrete instance of the render/stream duplication and should be flagged to the Track-D dedup RFC so the shared emitter inherits the tuple-aware loop.

## Guidelines impact

Coverage is the whole point: every gap here was an app reaching for `addAttribute` *because the typed path didn't exist or didn't autocomplete*. The guideline already says "never `addAttribute` for standard props" — it just needs the canonical names taught so the rule is followable.

### Index — `web-development/CLAUDE.md`

Replace the **Specialized tag methods** block (lines 85-89) with:

```md
**Specialized tag methods** — never use addAttribute for standard props (camelCase names, like every TS setter):
```typescript
Button("Save").setType("submit")            // ✓
Link().setCrossOrigin("").setHreflang("de") // ✓ setCrossOrigin (camelCase), "" = bare crossorigin
Input("tel").setInputmode("tel")            // ✓ mobile numeric keyboard
Button().addAttribute("type", "submit")     // ✗ standard prop
Input().setReadonly()                       // ✗ deprecated lowercase — use setReadOnly()
Link().addAttribute("hreflang", "de")       // ✗ typed setter exists
```
```

### Topic ref — `web-development/fluent-html.md`

In **## Tag Methods** (after line 30), append to the typed-methods block + add a coverage note:

```md
Link().setRel("alternate").setHreflang("de").setHref(url)              // LinkTag (i18n alternates)
Link().setRel("preconnect").setCrossOrigin("")                        // "" = bare crossorigin="" (Google Fonts)
Input("tel").setInputmode("tel")                                      // mobile keyboard hint

**Multi-word setters are camelCase** (TS convention, not the lowercase HTML name):

| ✓ use | ✗ deprecated |
|---|---|
| `setReadOnly` `setAutoFocus` `setNoValidate` | `setReadonly` `setAutofocus` `setNovalidate` |
| `setCrossOrigin` `setReferrerPolicy` | `setCrossorigin` `setReferrerpolicy` |
| `setAllowFullscreen` `setFormAction` `setFormMethod` | `setAllowfullscreen` `setFormaction` `setFormmethod` |

`setCrossOrigin("")` emits bare `crossorigin=""` (W3C-valid, = `"anonymous"`); the union is `'anonymous' | 'use-credentials' | ''`.
`Meta().setHttpEquiv(...)` emits `http-equiv` (e.g. `<meta http-equiv="content-security-policy">`).
```

**Adoption note:** the old guideline taught the *rule* ("typed methods, not `addAttribute`") but never the *names*, and the names broke TS muscle memory (`setReadonly` not `setReadOnly`). Apps that typed the expected camelCase name got no autocomplete and fell back to `addAttribute` — 25 documented bypasses. Teaching the canonical camelCase names + the `setCrossOrigin("")`/`setInputmode`/`setHreflang` coverage closes the gap that made the rule unfollowable.

## Guardrail check

- **§11.1 zero-deps:** pass — no new dependencies.
- **§11.2 ssr-only / sync hot path:** pass — adds one monomorphic `typeof` branch to the `_sk` loop; Track-D to confirm no regression on the string path.
- **§11.3 escape-by-default:** pass — all new values flow through the same `escapeAttr` in the `_sk` loop; `''` escapes to `""`; no new raw sink.
- **§11.4 type-safety:** pass — `InputMode`/`CrossOrigin`/`ReferrerPolicy` literal unions, typed `SchemaKey` tuple, no `any` to consumers.
- **§11.5 backward-compat:** pass — additive; renames keep deprecated aliases for v6; `http-equiv` is a zero-call-site bug fix; removal deferred to v7 `breaking-changes.md` with a pure-rename codemod.
- **§11.6 idiom consistency:** pass — restores the "specialized typed setter over `addAttribute`" idiom these holes were violating; camelCase matches `setStrokeWidth`/`setRowspan`.
- **§11.7 class-string contract:** N/A — emits no Tailwind classes; only the ESLint `prefer-set-method` rename map updates (flagged for Wave-4 merge).
- **§11.8 guideline-sync:** pass — Guidelines impact covers all of `api_surface`: the index block teaches the camelCase rule + `setCrossOrigin`/`setHreflang`/`setInputmode`; the topic ref carries the full rename table, the `CrossOrigin` union, and the `http-equiv` fix. `guideline_updates` lists both files.

## Alternatives considered

- **Drop the `_sk` tuple, rename the `httpEquiv` JS field to `'http-equiv'` (quoted key).** Works (mirrors `'stroke-width'`), but every future camelCase→hyphen attribute would need an ugly quoted field and `this['http-equiv']` access. The tuple is a one-time scheme upgrade that handles the whole class (F-A-012 today, `accept-charset`/typed `data-*` tomorrow) and keeps fields as valid identifiers. Chosen.
- **Hard-rename the lowercase setters with no alias.** Smaller surface, but breaks `setCrossorigin: 57` + `setReadonly: 5` + `setAutofocus: 3` existing typed call sites immediately. Violates §11.5 additive-by-default. Deferred the removal to v7.
- **`setCrossOrigin` as a boolean `toggle("crossorigin")` instead of `''`.** `.toggle("crossorigin")` does emit a bare attribute and is documented for booleans — but `crossorigin` is value-bearing (`anonymous`/`use-credentials`), so modeling it as boolean-only loses the meaningful values. The `''` union member keeps both worlds.
- **Add `inputmode`/`hreflang` as global `Tag` setters.** `inputmode` is technically global (any contenteditable) and `hreflang` belongs on `<a>` too. But the cluster's scope is typed-element coverage; a global-attribute helper (`tabindex`/`title`/`role`) is its own finding (F-A-014) and RFC. Scoped to `InputTag`/`TextareaTag` and `LinkTag` here.

## Open questions

- **`hreflang` on `AnchorTag`?** F-A-043 only cites `<link>`, but `<a hreflang>` is valid. Add to `AnchorTag` now or wait for evidence? (Lean: add — trivial, same pattern.)
- **v7 alias removal timing** — bundle the 8 lowercase-alias removals into the same v7 migration as other Track-A renames, or ship per-RFC? Defer to Wave-4 `breaking-changes.md` sequencing.
- **Track-D ownership of the tuple-aware `_sk` loop** — should the shared render/stream emitter (recon §6.5) land first so this RFC patches one site instead of two? Sequencing decision for the roadmap.
