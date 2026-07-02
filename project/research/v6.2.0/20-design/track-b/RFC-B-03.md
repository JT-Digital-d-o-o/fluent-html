---
id: RFC-B-03
track: B
title: Iframe & embedded security (typed sandbox tokens, Permissions-Policy allow)
resolves: [#16, #64]
api_surface:
  - "type SandboxToken"
  - "type PermissionsPolicyDirective"
  - "IframeTag.setSandbox(...tokens: SandboxToken[])"
  - "IframeTag.setAllow(policy?: Partial<Record<PermissionsPolicyDirective, string>>)"
breaking: mixed
ships_to: "6.2.0"
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, compat, instruction-set, class-vocab-sync, guideline-sync]
guideline_updates:
  - "README.md (embedded-elements section — Iframe sandbox + allow rows)"
  - "fluent-html.md (embedded elements / security section)"
  - "JSDoc on IframeTag.setSandbox + setAllow"
  - "CHANGELOG.md [6.2.0] Added + Breaking"
  - "test/elements.test.ts:470 (setSandbox multi-token string → variadic tokens)"
  - "test/elements.test.ts:478 (setAllow raw string → directive record)"
  - "test/types/*.test-d.ts (SandboxToken closed-typo-is-error; setAllow record-arm + empty-value)"
  - "../fluent-html-tailwind-extractor/README.md (no change — attributes, not classes; note only)"
  - "../fluent-html-eslint-plugin/README.md (no change — no new vocab method)"
impact: medium
effort: M
depends_on: []
status: implemented
---

# RFC-B-03: Iframe & embedded security (typed sandbox tokens, Permissions-Policy allow)

## Problem

`IframeTag` is the one element in the builder whose attributes are *the security boundary* — `sandbox` and `allow` decide what an embedded document can do — yet both ship today as **bare, untyped `string` setters**. Every other enumerated iframe attribute was retrofitted to a closed/typed union in 6.0/6.1 (`loading` → `'lazy' | 'eager'`, `referrerpolicy` → `ReferrerPolicy` at `html-types.ts:35`, `fetchpriority` → `FetchPriority` at `html-types.ts:57`), but the two security attributes were skipped.

**`setSandbox` is a bare string.** `src/elements/embedded.ts:14` declares `sandbox?: string` and `:49` declares `setSandbox(sandbox?: string)`. The author hand-writes a space-joined token list with **no autocomplete and no typo protection**:

```ts
Iframe().setSandbox("allow-scripts allow-same-orign")   // 'same-orign' typo → silently un-sandboxed
```

A misspelled token is not a no-op — it *weakens* the policy (the intended restriction silently doesn't apply), which is the worst failure mode for a security attribute. `SandboxToken` does not exist anywhere in `html-types.ts`. CHANGELOG grep (6.0.0→6.1.1) shows `sandbox` only as an *initial* bare attribute ("New embedded elements: Iframe (with sandbox…)"); the typed-union retrofits covered `loading`/`ReferrerPolicy`/`FetchPriority` but **not** `sandbox`. Genuine core gap.

**`setAllow` is a bare string.** `src/elements/embedded.ts:12` declares `allow?: string` and `:39` declares `setAllow(allow?: string)`. The Permissions-Policy directive *names* are an enumerable spec registry (`camera`, `microphone`, `geolocation`, `fullscreen`, …) but the setter accepts any string, so:

```ts
Iframe().setSrc(mapUrl).setAllow("geolocation 'self'; camra *")  // 'camra' grants nothing, no error
```

A misspelled directive name silently disables the feature it was meant to enable — again no compile-time signal.

**Real bypass in-repo.** `jtdigital-landing-page/src/website-wizard/views/website-wizard.components.ts:79` emits a raw HTML string `<iframe srcdoc=… sandbox="allow-scripts allow-same-origin" loading="lazy">` rather than building it — exactly the hand-written, unchecked token list this RFC makes type-safe (`Iframe().setSrcdoc(html).setSandbox('allow-scripts','allow-same-origin').setLoading('lazy')`).

Both fixes are pure-string serialization over the *existing* render path: `sandbox` and `allow` are already in `defineSchemaKeys(IframeTag, [...])` (`embedded.ts:71`) and the renderer `escapeAttr`s every attribute value (`serialize.ts:270`), so no render-path, schema, or escaping code changes — **only the setter signatures narrow, and the stored `sandbox?: string` / `allow?: string` field types stay exactly as they are.**

## Proposed API

Two new closed/closed-ish unions in `src/elements/html-types.ts` (alongside the sibling unions `ReferrerPolicy`/`FetchPriority`), and two narrowed setters on `IframeTag`. **The stored fields stay `sandbox?: string` / `allow?: string` (the serialized list), and `defineSchemaKeys(IframeTag, [...])` at `embedded.ts:71` is UNCHANGED — only the setter signatures narrow.** (Do *not* retype the stored fields to `SandboxToken[]`; that is the rejected alternative below and would change the schema/render contract.)

```ts
// ── src/elements/html-types.ts ──────────────────────────────────────

/**
 * `sandbox` token — the fixed WHATWG enumerated set (13 tokens). **Closed**
 * union (no `(string & {})` tail): a typo like `'allow-form'` is a compile
 * error. `sandbox` is a fixed spec enum, so it must be fully closed — unlike
 * `BrowsingContext`/`Charset`, which intentionally stay open.
 */
export type SandboxToken =
  | 'allow-downloads'
  | 'allow-forms'
  | 'allow-modals'
  | 'allow-orientation-lock'
  | 'allow-pointer-lock'
  | 'allow-popups'
  | 'allow-popups-to-escape-sandbox'
  | 'allow-presentation'
  | 'allow-same-origin'
  | 'allow-scripts'
  | 'allow-top-navigation'
  | 'allow-top-navigation-by-user-activation'
  | 'allow-top-navigation-to-custom-protocols';

/**
 * Permissions-Policy directive *name* (the `allow` attribute keys). The known
 * registry autocompletes; the `(string & {})` tail keeps it OPEN for new
 * directives without a lib bump — matching the in-repo `LinkRel`/`HttpEquiv`
 * precedent for growing spec registries (`html-types.ts:30-33,48-50`). The open
 * tail is a deliberate forward-compat trade: directive-NAME typos are NOT caught
 * (only autocomplete-assisted), so the type win on `allow` is strictly weaker
 * than on `sandbox` — see the Type-safety story. Directive VALUES are author
 * allowlist strings (`'self'` / `'none'` / `*` / `'src'` / origins) and ride the
 * existing `escapeAttr`.
 */
export type PermissionsPolicyDirective =
  | 'accelerometer' | 'ambient-light-sensor' | 'attribution-reporting'
  | 'autoplay' | 'bluetooth' | 'camera' | 'ch-ua' | 'clipboard-read'
  | 'clipboard-write' | 'cross-origin-isolated' | 'display-capture'
  | 'encrypted-media' | 'fullscreen' | 'gamepad' | 'geolocation'
  | 'gyroscope' | 'hid' | 'identity-credentials-get' | 'idle-detection'
  | 'local-fonts' | 'magnetometer' | 'microphone' | 'midi'
  | 'otp-credentials' | 'payment' | 'picture-in-picture'
  | 'publickey-credentials-create' | 'publickey-credentials-get'
  | 'screen-wake-lock' | 'serial' | 'storage-access' | 'usb'
  | 'web-share' | 'window-management' | 'xr-spatial-tracking'
  | (string & {});
```

```ts
// ── src/elements/embedded.ts — IframeTag ────────────────────────────
// import { FetchPriority, ReferrerPolicy, SandboxToken, PermissionsPolicyDirective } from "./html-types.js";

// Fields stay `string` (the serialized list) — UNCHANGED. Only the SETTERS narrow.
sandbox?: string;
allow?: string;

// sandbox: variadic closed tokens. set* = replace the whole token list
// (matches the attribute's replace semantics; no-args = fully locked).
setSandbox(...tokens: SandboxToken[]): this;

// allow: record-only. ONE typed directive-record arm — no raw-string arm
// (the record value is a freeform string, so it subsumes any raw allowlist;
// see Alternatives). undefined → clear the attribute; {} → allow="" (deny all).
setAllow(policy?: Partial<Record<PermissionsPolicyDirective, string>>): this;
```

Implementation bodies are pure, synchronous string work (no render-path change):

```ts
setSandbox(...tokens: SandboxToken[]): this {
  this.sandbox = tokens.join(' ');   // [] → "" (fully locked); replace semantics
  return this;
}

setAllow(policy?: Partial<Record<PermissionsPolicyDirective, string>>): this {
  if (policy === undefined) {
    this.allow = undefined;          // clear the attribute (skipped at serialize.ts:269)
    return this;
  }
  this.allow = Object.entries(policy)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => (v === '' ? k : `${k} ${v}`))   // empty value → bare directive name
    .join('; ');                     // insertion order; {} → "" (deny all, emitted as allow="")
  return this;
}
```

`setSandbox` is named `set*` deliberately even though it is variadic: each call **replaces** the full token list (the attribute's own replace semantics), so it is an override, not an accumulator — no `addSandbox`. `setAllow` is likewise a single-attribute override; an `addAllow` accumulator was rejected (CONVERGE — merge semantics across two calls are ambiguous). Both setters now have **exactly one safe path** — no raw-string escape hatch on either.

## Worked examples (before → after)

```ts
// 1. sandbox — the headline win (replaces the raw-HTML bypass at components.ts:79)
Iframe().setSandbox("allow-scripts allow-same-orign")               // before — one string, 'orign' typo silently un-sandboxes
Iframe().setSandbox('allow-scripts', 'allow-same-origin')          // after  → sandbox="allow-scripts allow-same-origin"; 'allow-same-orign' is a COMPILE ERROR

// 2. Fully-locked iframe — the maximally-restrictive default, one canonical path
Iframe().setSrcdoc(html).setSandbox()                              // → sandbox="" (every restriction on)

// 3. Migrating the landing-page raw string into the builder
Iframe()
  .setSrcdoc(html)
  .setSandbox('allow-scripts', 'allow-same-origin')
  .setLoading('lazy')                                              // tokens autocomplete one at a time

// 4. allow — typed directive record (the one ergonomic surface)
Iframe().setSrc(mapUrl).setAllow("geolocation 'self'; camra *")    // before — 'camra' grants nothing, no error (and no longer type-checks)
Iframe().setSrc(mapUrl).setAllow({ geolocation: "'self'", camera: "*" })  // after → allow="geolocation 'self'; camera *"

// 5. allow — bare directive name (empty value → name only)
Iframe().setAllow({ fullscreen: "" })                             // → allow="fullscreen"

// 6. allow — multiple origins per directive (the value is a freeform string, so this is fully expressible in the record)
Iframe().setAllow({ geolocation: "'self' https://maps.example.com" })  // → allow="geolocation 'self' https://maps.example.com"

// 7. allow — deny everything / clear the attribute
Iframe().setAllow({})                                             // → allow=""  (empty allowlist, emitted)
Iframe().setAllow()                                              // → allow attribute cleared (undefined, skipped at serialize)
```

## Type-safety story

- **`SandboxToken` is a fully-closed 13-token union — no `(string & {})` tail.** A typo (`'allow-form'`, `'allow-same-orign'`) is a compile error, and a multi-token string (`'allow-scripts allow-same-origin'`) is *not* assignable to a single `SandboxToken` — so the old single-string call no longer type-checks (see Migration). `sandbox` is a fixed spec enum, so full closure is correct (mirrors `FetchPriority`'s closed-union rationale at `html-types.ts:52`).
- **`PermissionsPolicyDirective` is closed-ish (OPEN tail) — and the type win is strictly weaker than `sandbox`.** Known directive names autocomplete on the *keys* (`Partial<Record<…, string>>`); the `(string & {})` tail absorbs new spec directives without a lib bump (matching the `LinkRel`/`HttpEquiv` precedent at `html-types.ts:30-33,48-50`). **Be explicit:** because the tail is open, a misspelled directive name (`{ camra: '*' }`) **still compiles** — exactly the silent-disables-the-feature failure the Problem section flags for `allow`. The open tail therefore gives autocomplete + a registry of known names, **not** a typo-is-a-compile-error guarantee. This is an accepted forward-compat trade (the directive registry grows with new sensor/credential APIs faster than `sandbox`'s fixed enum), not a closed contract — and it is the reason `sandbox` (fixed enum → fully closed → typo *is* a compile error) gets the stronger guarantee while `allow` (growing registry → open tail) does not. Do not let the `sandbox` "typo = compile error" framing bleed onto `allow`.
- **No overload to resolve.** `setAllow` is a single record-only signature with an optional argument: `setAllow()` / `setAllow(undefined)` clear the attribute (the `undefined` branch), `setAllow({})` → `allow=""` (deny all). The previous two-arm overload (and its `{}`-vs-`undefined` resolution subtlety) is gone.
- No `any`. No bare `string` where literals are valid (sandbox tokens, directive names). The stored fields remain `string` because they hold a *serialized* list, not a single literal value — that is a representation detail, not a type hole, and the field types are unchanged by this RFC.

## Render-path dependency (cite for the implementer)

The `setSandbox()` → `sandbox=""` and `setAllow({})` → `allow=""` behaviors depend on the exact emit guard at **`src/render/serialize.ts:269`**:

```ts
if (value !== undefined && value !== null) {                 // serialize.ts:269
  attrs += ' ' + attr + '="' + escapeAttr(...) + '"';        // serialize.ts:270
}
```

An empty-string field **passes** this guard, so `sandbox=""` / `allow=""` **are emitted** (maximally-restrictive sandbox / deny-all allowlist); `undefined` is skipped (attribute cleared). **The implementer must NOT add an empty-string skip here** — doing so would silently break the `sandbox=""` "fully locked" default. The `escapeAttr` at line 270 also covers every `_sk` value, so the new setters inherit XSS escaping for free (no setter-level escaping added or needed).

## Migration & compatibility

- **`setSandbox` is BREAKING within v6.** The old `setSandbox("allow-scripts allow-same-origin")` single-joined-string call no longer type-checks (a multi-token string isn't a `SandboxToken`). Mechanical: split the string on spaces into comma-separated arguments.
  - **In-repo migration owned:** `test/elements.test.ts:470` `.setSandbox("allow-scripts allow-same-origin")` → `.setSandbox('allow-scripts', 'allow-same-origin')` (emits the same `sandbox="allow-scripts allow-same-origin"`; currently a COMPILE error that fails the build until migrated). The landing-page `components.ts:79` case is a **raw HTML string literal**, not a builder call, so it is unaffected until intentionally migrated to the builder.
- **`setAllow` is BREAKING within v6** (reclassified from the draft's "additive"). The raw-string arm is **dropped** (record-only — see Alternatives), so the existing raw call `setAllow("accelerometer; autoplay; clipboard-write")` no longer type-checks.
  - **In-repo migration owned:** `test/elements.test.ts:478` `.setAllow("accelerometer; autoplay; clipboard-write")` → `.setAllow({ accelerometer: '', autoplay: '', 'clipboard-write': '' })` — the empty-value → bare-name path with `; ` join reproduces the asserted `allow="accelerometer; autoplay; clipboard-write"` byte-for-byte (verify in the test). Grep of `ttl`/`rideshare`/`demos` finds **zero** other `setAllow` call sites — the only owned migration is this one test.
- **Net classification: `mixed`** (both setters breaking within v6; the frontmatter keeps `breaking: mixed` because the new `SandboxToken` / `PermissionsPolicyDirective` *types* and the record-arm ergonomics are net-new additive surface alongside the breaking signature changes). v6 is greenfield (§11.5 — no v5 contract owed).
- **`setSandbox()` (no args) → `sandbox=""`** is the only no-arg behavior and the single canonical "fully sandboxed" path. There is no longer a way to *un-set* `sandbox` via `setSandbox(undefined)`; `sandbox=""` (maximally restrictive) is the safe default, and removing the attribute entirely is out of scope (a general unset concern, not a sandbox special-case). `setAllow()` / `setAllow(undefined)` clears `allow` (sets the field `undefined`, skipped at serialize).
- **No dedup/ordering** on either setter: `setSandbox('allow-forms','allow-forms')` preserves caller order and dupes (browsers tolerate them; not worth normalizing). `setAllow` record entries serialize in insertion order.

## Docs impact (§11.8)

**`README.md`** — embedded-elements / Iframe section, replace the bare `sandbox`/`allow` rows:

```md
| `.setSandbox(...tokens)` | `sandbox="allow-scripts allow-same-origin"` | Closed `SandboxToken` union; `.setSandbox()` → fully locked (`sandbox=""`) |
| `.setAllow(policy)` | `allow="camera 'self'; microphone *"` | Permissions-Policy directive record; value is the allowlist (`'self'`/`'none'`/`*`/origins); empty value → bare name; `{}` → deny all |
```

**`fluent-html.md`** — embedded-elements/security block, add the before→after pair and the typed-record example:

```md
Iframe().setSrcdoc(html).setSandbox('allow-scripts', 'allow-same-origin')   // sandbox tokens autocomplete; typo = compile error
Iframe().setSandbox()                                                       // sandbox="" — fully locked default
Iframe().setSrc(mapUrl).setAllow({ geolocation: "'self'", camera: "*" })    // → allow="geolocation 'self'; camera *"
Iframe().setAllow({ geolocation: "'self' https://a.example https://b.example" })  // multi-origin — value is a freeform string
```

**JSDoc** — TSDoc on `setSandbox` (none today): "Set the `sandbox` allowlist from closed `SandboxToken`s; each call **replaces** the list. No args → `sandbox=\"\"` (every restriction applied)." On `setAllow`: document the record arm (keys autocomplete; the open tail means an unknown/misspelled directive name still compiles; values are the allowlist grammar `'self'`/`'none'`/`*`/origins, including multiple space-separated origins; empty value → bare name; `{}` → `allow=\"\"` deny-all; `undefined` → attribute cleared). Add TSDoc to `SandboxToken` (closed, why) and `PermissionsPolicyDirective` (open tail, why — and that name typos are therefore NOT caught).

**`CHANGELOG.md` `[6.2.0]`** —
- *Breaking*: "`IframeTag.setSandbox` is now `setSandbox(...tokens: SandboxToken[])` — a closed 13-token union replaces the bare string. `setSandbox(\"allow-scripts allow-same-origin\")` → `setSandbox('allow-scripts','allow-same-origin')`; `setSandbox()` → `sandbox=\"\"` (fully locked). A misspelled token is now a compile error instead of a silently-weakened policy."
- *Breaking*: "`IframeTag.setAllow` is now record-only — `setAllow(policy?: Partial<Record<PermissionsPolicyDirective, string>>)`. The raw-string arm is removed (a record value is a freeform string and subsumes any raw allowlist). `setAllow(\"accelerometer; autoplay\")` → `setAllow({ accelerometer: '', autoplay: '' })`; `setAllow({ camera: \"'self'\" })` → `allow=\"camera 'self'\"`; `setAllow({})` → `allow=\"\"` (deny all); `setAllow()` clears the attribute. Directive *names* are a closed-ish `PermissionsPolicyDirective` union (open tail for new directives — name typos compile, only autocomplete-assisted)."

**`../fluent-html-tailwind-extractor/README.md`** — **no code/method-list change** (note only): `sandbox`/`allow` are HTML attributes routed through `defineSchemaKeys`, not Tailwind classes — nothing for the extractor to safelist.

**`../fluent-html-eslint-plugin/README.md`** — **no change**: no new vocab method, no `gen:vocab` regen. `prefer-set-method` already covers `sandbox`/`allow` (the method names don't change).

## Test surface (§11.8)

- **`test/elements.test.ts`** — migrate `:470` (sandbox tokens) and `:478` (allow record) as above; both currently break the build under the new signatures. Add: `setSandbox()` → `sandbox=""`; `setAllow({})` → `allow=""`; `setAllow({ fullscreen: "" })` → `allow="fullscreen"`; `setAllow({ geolocation: "'self' https://a.example" })` → multi-origin join; `setAllow()` → no `allow` attribute emitted.
- **Value-escape test (§11.3)** — assert a record value containing a double-quote does not break out of the attribute: `setAllow({ geolocation: '"onerror=alert(1)' })` renders with the `"` entity-escaped via the existing `escapeAttr` at `serialize.ts:270` (pins that the new setter does not bypass it).
- **`test/types/*.test-d.ts`** — `SandboxToken` closed-union typo-is-a-compile-error (`setSandbox('allow-form')` rejected; `setSandbox('allow-scripts allow-same-origin')` rejected as a single token); `setAllow` accepts a record and rejects a raw string (`setAllow("camera 'self'")` is now a type error); `setAllow()` / `setAllow({})` both compile.

## Guardrail check

- **§11.1 zero-deps:** pass — pure `Array.join` / `Object.entries` string work; no new runtime dependency.
- **§11.2 ssr-only / sync render:** pass — both setters are synchronous string serialization; nothing touches the async/render path.
- **§11.3 escape-by-default:** pass — `sandbox` and `allow` are already in `defineSchemaKeys` (`embedded.ts:71`) and `escapeAttr`'d at `serialize.ts:270`; sandbox tokens are literal (no injection surface), `allow` record values are author strings that ride the existing escaping (a `"`/`<` in a value can't break out). No new escaping code; the value-with-quote escape test (above) pins this.
- **§11.4 type-safety:** pass — `SandboxToken` fully closed (typo = compile error); `PermissionsPolicyDirective` closed names + **honestly-documented open tail (directive-NAME typos compile, autocomplete-assisted only — strictly weaker than `sandbox`)**; no `any`, no bare `string` where literals are valid (directive *values* are genuinely freeform allowlist grammar). Stored fields stay `string` because they hold serialized lists, not literals.
- **§11.5 compat:** pass — honestly marked `mixed`: **both** `setSandbox` and `setAllow` are breaking within v6 (multi-token string and raw allow-string no longer assignable), with the two in-repo test call sites owned in `guideline_updates` and the Migration section. v6 greenfield, no v5 contract owed.
- **§11.6 idioms:** pass — `set*` = override on both (single-attribute replace semantics); no `add*` accumulator (CONVERGE); `setAllow` is **record-only — exactly one way to set the attribute** (the raw-string arm dropped); record is options-object-shaped; no booleans, no inline JS. `setSandbox()` is the single canonical fully-locked path.
- **§11.7 class-string contract:** **N/A** — `sandbox`/`allow` are HTML attributes, not Tailwind classes. No `src/class-vocab/vocab.ts` rows, no extractor or eslint vocab entries emitted or required. (Captured explicitly so the implementer adds no phantom vocab rows.)
- **§11.8 docs/guideline-sync:** pass — every `api_surface` symbol covered: README embedded rows, fluent-html.md security block, per-setter + per-union JSDoc, CHANGELOG two Breaking entries; the two in-repo test migrations and the type-test surface are named in `guideline_updates`; tooling READMEs get an explicit "no change" note.

## Alternatives considered

- **Keep `setSandbox` additive via an overload (`setSandbox(...tokens) | setSandbox(rawString)`).** Rejected. Retaining the raw-string arm for sandbox defeats the entire point — the raw arm is the typo surface we're eliminating, and a security attribute should have exactly one safe path. `sandbox` is a pure token list fully expressible as variadic closed tokens, so there is no expressiveness lost by dropping the string arm. CONVERGE → one way.
- **Keep a raw-string arm on `setAllow` (raw + record overload).** **Rejected — the previous draft's false premise corrected.** The earlier draft claimed "the full Permissions-Policy grammar (multiple space-separated origins per directive) can't be expressed as a flat `Record<name, string>`." That is **wrong**: each record VALUE is a freeform `string` holding the entire per-directive allowlist — `'self'`, `'none'`, `*`, `'src'`, and **multiple space-separated origins** (`{ geolocation: "'self' https://a.example https://b.example" }`, worked example #6). The record therefore **fully subsumes** any raw allowlist string. The *only* thing a flat record cannot express is the same directive name appearing **twice** — which is invalid Permissions-Policy syntax (last-wins / undefined), i.e. nothing worth preserving. So the raw arm is not an expressiveness escape hatch; it is a **second way to set one attribute** (a §11.6 CONVERGE violation) **and** the exact typo surface this RFC exists to remove (a raw string re-admits `"camra *"`). Dropping it makes `setAllow` symmetric with `setSandbox`: one safe path, no raw escape hatch. The cost — `setAllow` becomes breaking within v6 — is owned in Migration (one in-repo test site).
- **Type `sandbox` as `SandboxToken[]` stored, serialize at render.** Rejected — changes the stored field type and the `defineSchemaKeys` contract / render path for no benefit; serializing in the setter keeps the field `string`, the schema untouched, and the render path byte-identical to today.
- **Make `PermissionsPolicyDirective` fully closed (no `(string & {})` tail).** Rejected — the directive registry grows with new sensor/credential APIs; a fully-closed union would reject valid forward-compat directives and force a lib bump per spec addition (the `LinkRel`/`HttpEquiv` precedent at `html-types.ts:30-33,48-50` is open for the same reason). The open tail is the deliberate trade (keys autocomplete; unknown directives still allowed) — at the cost that name typos compile, disclosed honestly in the Type-safety story. `sandbox`, by contrast, is a fixed enum and *is* fully closed.
- **`setAllow(directive: PermissionsPolicyDirective, value: string)` positional pair instead of a record.** Rejected — it's an accumulator shape (multiple directives = multiple calls) with ambiguous merge semantics across calls, against the single-attribute `set*` = override idiom. The record sets all directives in one override call.
- **Ship `credentialless` / `referrerpolicy` in this RFC.** Rejected/scoped-out. `referrerpolicy` is **already shipped** (`embedded.ts:16,59`, typed to `ReferrerPolicy` since 6.1.1) — re-adding would duplicate. `credentialless` is Chromium-only (no Firefox/Safari, not Baseline) — deferred, not part of 6.2.0.

## Open questions

- **Should there be any path to *remove* the `sandbox` attribute entirely (vs `sandbox=""`)?** The new signature only produces `sandbox=""` (fully locked) or a token list — never absent. Leaning: keep `sandbox=""` as the single no-arg behavior (convergent, and an empty sandbox is the safe default); if attribute-unset is ever needed it's a general builder concern, not a sandbox special-case. Decision for a human.
- **Should `PermissionsPolicyDirective` values get a small typed helper for the common allowlist keywords (`'self'`/`'none'`/`*`)?** Out of scope here — values stay raw `string`. Flagged only because a future `type AllowlistOrigin = "'self'" | "'none'" | '*' | (string & {})` could tighten the common case without nesting. Leaning: defer (no demand, and the quoting (`"'self'"`) is awkward as a literal type).
- **Dedup/normalize sandbox tokens?** Currently `join(' ')` preserves dupes and order. Browsers tolerate dupes; leaning no (not worth the code). Noted so reviewers don't flag it as a bug.

## Adversary review & resolutions

Verdict: **survives-with-changes** (confidence 0.74). Each required change → resolution:

1. **DROP the raw-string arm of `setAllow`; ship record-only; reclassify `setAllow` to breaking.** **Resolved.** API surface now `setAllow(policy?: Partial<Record<PermissionsPolicyDirective, string>>)` (single signature, no overload). Implementation rewritten: `undefined` → clear; `{}` → `allow=""`; entries joined with `; `. The Alternatives bullet that previously *rejected* "record-only" on the false premise is replaced with a bullet that *rejects keeping the raw arm* and corrects the premise (record values are freeform strings → multi-origin is expressible → the record subsumes the raw arm; the only thing lost is duplicate directive names, which are invalid syntax). Migration section reclassifies `setAllow` as breaking; the "additive, zero migration cost" line is removed. Net frontmatter classification stays `mixed` (both setters breaking; new types/record ergonomics additive).
2. **Migrate the two in-repo iframe tests; add them to `guideline_updates`.** **Resolved.** `guideline_updates` now lists `test/elements.test.ts:470` (sandbox) and `:478` (allow) explicitly, plus `test/types/*.test-d.ts`. Migration section owns both with byte-for-byte expected output: `:470` → `.setSandbox('allow-scripts', 'allow-same-origin')`; `:478` → `.setAllow({ accelerometer: '', autoplay: '', 'clipboard-write': '' })` (verified the empty-value→bare-name + `; `-join reproduces `allow="accelerometer; autoplay; clipboard-write"`).
3. **Add `setAllow({})` → `allow=""` render test and pin emission against `serialize.ts:269`.** **Resolved.** New "Render-path dependency" section cites `serialize.ts:269` (the `value !== undefined && value !== null` guard — empty string emits, `undefined` skips) and explicitly instructs the implementer not to add an empty-string skip. Test surface adds `setAllow({})` → `allow=""`, `setSandbox()` → `sandbox=""`, and `setAllow()` → no attribute.
4. **Tighten §11.4 / Type-safety wording on the open tail.** **Resolved.** The Type-safety story and the `PermissionsPolicyDirective` JSDoc now state plainly that the open tail means directive-NAME typos (`{ camra: '*' }`) **still compile** — autocomplete-assisted only, strictly weaker than `sandbox`'s closed contract — and that this is an accepted forward-compat trade (matching `LinkRel`/`HttpEquiv`). §11.4 guardrail line updated to say so. No code change; honesty change only.
5. **Add the value-escape render test promised in §11.3.** **Resolved.** Test surface specifies `setAllow({ geolocation: '"onerror=alert(1)' })` asserting the `"` is entity-escaped via `escapeAttr` at `serialize.ts:270`, pinning that the new setter does not bypass escaping. §11.3 references it.
6. **State that `defineSchemaKeys` and the stored `sandbox?: string` / `allow?: string` field types are UNCHANGED.** **Resolved.** Stated as a one-line explicit instruction at the top of "Proposed API" (and reinforced in the Problem and §11.4 wording): do not retype the stored fields to `SandboxToken[]`; only the setter signatures narrow; `embedded.ts:71` `defineSchemaKeys(IframeTag, [...])` is untouched.
