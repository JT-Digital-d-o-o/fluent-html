---
id: RFC-B-03
track: B
title: Iframe & embedded security (typed sandbox tokens, Permissions-Policy allow)
resolves: [#16, #64]
api_surface:
  - "type SandboxToken"
  - "type PermissionsPolicyDirective"
  - "IframeTag.setSandbox(...tokens: SandboxToken[])"
  - "IframeTag.setAllow(allow?: string)"
  - "IframeTag.setAllow(policy: Partial<Record<PermissionsPolicyDirective, string>>)"
breaking: mixed
ships_to: "6.2.0"
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, compat, instruction-set, class-vocab-sync, guideline-sync]
guideline_updates:
  - "README.md (embedded-elements section — Iframe sandbox + allow rows)"
  - "fluent-html.md (embedded elements / security section)"
  - "JSDoc on IframeTag.setSandbox + both setAllow overloads"
  - "CHANGELOG.md [6.2.0] Added + Breaking"
  - "../fluent-html-tailwind-extractor/README.md (no change — attributes, not classes; note only)"
  - "../fluent-html-eslint-plugin/README.md (no change — no new vocab method)"
impact: medium
effort: M
depends_on: []
status: proposed
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

Both fixes are pure-string serialization over the *existing* render path: `sandbox` and `allow` are already in `defineSchemaKeys(IframeTag, [...])` (`embedded.ts:71`) and the renderer `escapeAttr`s every attribute value, so no render-path, schema, or escaping code changes — only the **setter signatures** narrow.

## Proposed API

Two new closed/closed-ish unions in `src/elements/html-types.ts` (alongside the sibling unions `ReferrerPolicy`/`FetchPriority`), and two narrowed setters on `IframeTag`. The stored fields stay `sandbox?: string` / `allow?: string` (the serialized list) so `defineSchemaKeys` and the render path are untouched.

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
 * registry autocompletes + typo-catches; the `(string & {})` tail keeps it open
 * for new directives without a lib bump (the *value* grammar is freeform, so the
 * type win lives on the keys). Directive VALUES are author allowlist strings
 * (`'self'` / `'none'` / `*` / origins) and ride the existing `escapeAttr`.
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

// Field stays `string` (the serialized list). Only the SETTER narrows.
sandbox?: string;
allow?: string;

// sandbox: variadic closed tokens. set* = replace the whole token list
// (matches the attribute's replace semantics; no-args = fully locked).
setSandbox(...tokens: SandboxToken[]): this;

// allow: overloaded — raw-string arm kept (CONVERGE-safe, additive) + a
// directive-record arm for typed names. Three-line impl signature handles both.
setAllow(allow?: string): this;
setAllow(policy: Partial<Record<PermissionsPolicyDirective, string>>): this;
setAllow(allow?: string | Partial<Record<PermissionsPolicyDirective, string>>): this;
```

Implementation bodies are pure, synchronous string work (no render-path change):

```ts
setSandbox(...tokens: SandboxToken[]): this {
  this.sandbox = tokens.join(' ');   // [] → "" (fully locked); replace semantics
  return this;
}

setAllow(allow?: string | Partial<Record<PermissionsPolicyDirective, string>>): this {
  if (allow === undefined || typeof allow === 'string') {
    this.allow = allow;              // raw arm — passes the full directive grammar verbatim
    return this;
  }
  this.allow = Object.entries(allow)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => (v === '' ? k : `${k} ${v}`))   // empty value → bare directive name
    .join('; ');                     // insertion order; "" / {} → "" (deny all)
  return this;
}
```

`setSandbox` is named `set*` deliberately even though it is variadic: each call **replaces** the full token list (the attribute's own replace semantics), so it is an override, not an accumulator — no `addSandbox`. `setAllow` is likewise a single-attribute override; an `addAllow` accumulator was rejected (CONVERGE — merge semantics across two calls are ambiguous).

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

// 4. allow — typed directive record (the new ergonomic surface)
Iframe().setSrc(mapUrl).setAllow("geolocation 'self'; camra *")    // before — 'camra' grants nothing, no error
Iframe().setSrc(mapUrl).setAllow({ geolocation: "'self'", camera: "*" })  // after → allow="geolocation 'self'; camera *"; 'camra' is a COMPILE ERROR

// 5. allow — bare directive name (empty value → name only)
Iframe().setAllow({ fullscreen: "" })                             // → allow="fullscreen"

// 6. allow — raw arm kept, for the full grammar (multiple origins per directive)
Iframe().setAllow("geolocation 'self' https://maps.example.com")  // → allow="geolocation 'self' https://maps.example.com"

// 7. allow — deny everything
Iframe().setAllow({})                                             // → allow=""  (empty allowlist)
Iframe().setAllow()                                              // → allow attribute cleared (raw arm, undefined)
```

## Type-safety story

- **`SandboxToken` is a fully-closed 13-token union — no `(string & {})` tail.** A typo (`'allow-form'`, `'allow-same-orign'`) is a compile error, and a multi-token string (`'allow-scripts allow-same-origin'`) is *not* assignable to a single `SandboxToken` — so the old single-string call no longer type-checks (see Migration). `sandbox` is a fixed spec enum, so full closure is correct (mirrors `FetchPriority`'s closed-union rationale at `html-types.ts:52`).
- **`PermissionsPolicyDirective` is closed-ish (open tail).** Known directive names autocomplete and typo-catch on the *keys* (`Partial<Record<…, string>>`); the `(string & {})` tail absorbs new spec directives without a lib bump. The win is on names — directive *values* are freeform allowlist grammar (`'self'`, `'none'`, `*`, quoted origins) and stay `string`. This is intentionally weaker than a fully-closed union (a brand-new misspelled directive that parses as a string is not caught), documented as forward-compat only.
- **Overload resolution is unambiguous.** `Partial<Record<…>>` is `{}`, never `undefined`, so `setAllow()` and `setAllow(undefined)` land on the **string arm** (clear the attribute), while `setAllow({})` lands on the **record arm** (`allow=""`, deny all). Explicit unit tests pin `setAllow()`, `setAllow({})`, and `setSandbox()`.
- No `any`. No bare `string` where literals are valid (sandbox tokens, directive names). The stored fields remain `string` because they hold a *serialized* list, not a single literal value — that is a representation detail, not a type hole.

## Migration & compatibility

- **`setSandbox` is BREAKING within v6.** The old `setSandbox("allow-scripts allow-same-origin")` single-joined-string call no longer type-checks (a multi-token string isn't a `SandboxToken`). v6 is greenfield (§11.5 — no v5 contract owed), but any in-repo/app call passing a joined string must migrate to comma-separated tokens. Mechanical: split the string on spaces into arguments. The landing-page `components.ts:79` case is a **raw HTML string literal**, not a builder call, so it is unaffected until intentionally migrated to the builder.
- **`setAllow` is ADDITIVE.** The raw-string arm is retained verbatim, so every existing `setAllow("…")` call keeps compiling and emitting identically; the record arm is net-new surface. Grep of `ttl`/`rideshare`/`demos` finds **zero** `setAllow` call sites — zero migration cost in practice.
- **Net classification: `mixed`** (sandbox breaking, allow additive).
- **`setSandbox()` (no args) → `sandbox=""`** is the only no-arg behavior and the single canonical "fully sandboxed" path. There is no longer a way to *un-set* the attribute via `setSandbox(undefined)`; `sandbox=""` (maximally restrictive) is the safe default, and removing the attribute entirely is out of scope (a general unset concern, not a sandbox special-case). `setAllow()` / `setAllow(undefined)` still clears `allow` via the raw arm.
- **No dedup/ordering** on either setter: `setSandbox('allow-forms','allow-forms')` preserves caller order and dupes (browsers tolerate them; not worth normalizing). `setAllow` record entries serialize in insertion order.

## Docs impact (§11.8)

**`README.md`** — embedded-elements / Iframe section, replace the bare `sandbox`/`allow` rows:

```md
| `.setSandbox(...tokens)` | `sandbox="allow-scripts allow-same-origin"` | Closed `SandboxToken` union; `.setSandbox()` → fully locked (`sandbox=""`) |
| `.setAllow(policy)` / `.setAllow(raw)` | `allow="camera 'self'; microphone *"` | Permissions-Policy; typed directive record or raw grammar string |
```

**`fluent-html.md`** — embedded-elements/security block, add the before→after pair and the typed-record example:

```md
Iframe().setSrcdoc(html).setSandbox('allow-scripts', 'allow-same-origin')   // sandbox tokens autocomplete; typo = compile error
Iframe().setSandbox()                                                       // sandbox="" — fully locked default
Iframe().setSrc(mapUrl).setAllow({ geolocation: "'self'", camera: "*" })    // → allow="geolocation 'self'; camera *"
```

**JSDoc** — TSDoc on `setSandbox` (none today): "Set the `sandbox` allowlist from closed `SandboxToken`s; each call **replaces** the list. No args → `sandbox=\"\"` (every restriction applied)." On both `setAllow` overloads: document the typed-record arm (keys autocomplete, values are the allowlist grammar `'self'`/`'none'`/`*`/origins; empty value → bare name) and the retained raw-string arm (full grammar / multiple origins per directive). Add TSDoc to `SandboxToken` (closed, why) and `PermissionsPolicyDirective` (open tail, why).

**`CHANGELOG.md` `[6.2.0]`** —
- *Breaking*: "`IframeTag.setSandbox` is now `setSandbox(...tokens: SandboxToken[])` — a closed 13-token union replaces the bare string. `setSandbox(\"allow-scripts allow-same-origin\")` → `setSandbox('allow-scripts','allow-same-origin')`; `setSandbox()` → `sandbox=\"\"` (fully locked). A misspelled token is now a compile error instead of a silently-weakened policy."
- *Added*: "`IframeTag.setAllow` gains a typed Permissions-Policy directive-record overload — `setAllow({ camera: \"'self'\", microphone: \"*\" })` → `allow=\"camera 'self'; microphone *\"`. Directive *names* are a closed-ish `PermissionsPolicyDirective` union (open tail for new directives); the raw-string arm is retained. Additive."

**`../fluent-html-tailwind-extractor/README.md`** — **no code/method-list change** (note only): `sandbox`/`allow` are HTML attributes routed through `defineSchemaKeys`, not Tailwind classes — nothing for the extractor to safelist.

**`../fluent-html-eslint-plugin/README.md`** — **no change**: no new vocab method, no `gen:vocab` regen. `prefer-set-method` already covers the renamed setter.

## Guardrail check

- **§11.1 zero-deps:** pass — pure `Array.join` / `Object.entries` string work; no new runtime dependency.
- **§11.2 ssr-only / sync render:** pass — both setters are synchronous string serialization; nothing touches the async/render path.
- **§11.3 escape-by-default:** pass — `sandbox` and `allow` are already in `defineSchemaKeys` (`embedded.ts:71`) and `escapeAttr`'d at render; sandbox tokens are literal (no injection surface), `allow` record values are author strings that ride the existing escaping (a `"`/`<` in a value can't break out). No new escaping code; a value-with-quote escape test is added.
- **§11.4 type-safety:** pass — `SandboxToken` fully closed (typo = compile error); `PermissionsPolicyDirective` closed names + documented open tail; no `any`, no bare `string` where literals are valid. Stored fields stay `string` because they hold serialized lists, not literals.
- **§11.5 compat:** pass — honestly marked `mixed`: `setSandbox` breaking (multi-token string no longer assignable), `setAllow` additive (raw arm retained). v6 greenfield, no v5 contract owed.
- **§11.6 idioms:** pass — `set*` = override on both (single-attribute replace semantics); no `add*` accumulator (CONVERGE); record overload is options-object-shaped; no booleans, no inline JS. `setSandbox()` is the single canonical fully-locked path.
- **§11.7 class-string contract:** **N/A** — `sandbox`/`allow` are HTML attributes, not Tailwind classes. No `src/class-vocab/vocab.ts` rows, no extractor or eslint vocab entries emitted or required. (Captured explicitly so the implementer adds no phantom vocab rows.)
- **§11.8 docs/guideline-sync:** pass — every `api_surface` symbol covered: README embedded rows, fluent-html.md security block, per-overload + per-union JSDoc, CHANGELOG Breaking + Added; tooling READMEs get an explicit "no change" note. Type tests (`test/types/*.test-d.ts`): closed-union typo-is-error for `SandboxToken`, overload-resolution for `setAllow()` / `setAllow({})`. Render tests assert `sandbox=""`, the joined token list, the `; `-joined directive list, and value-escaping.

## Alternatives considered

- **Keep `setSandbox` additive via an overload (`setSandbox(...tokens) | setSandbox(rawString)`).** Rejected. Retaining the raw-string arm for sandbox defeats the entire point — the raw arm is the typo surface we're eliminating, and a security attribute should have exactly one safe path. Unlike `allow` (whose value grammar genuinely can't be a flat record), `sandbox` is a pure token list fully expressible as variadic closed tokens, so there is no expressiveness lost by dropping the string arm. CONVERGE → one way.
- **Type `sandbox` as `SandboxToken[]` stored, serialize at render.** Rejected — changes the stored field type and the `defineSchemaKeys` contract / render path for no benefit; serializing in the setter keeps the field `string`, the schema untouched, and the render path byte-identical to today.
- **Make `PermissionsPolicyDirective` fully closed (no `(string & {})` tail).** Rejected — the directive registry grows with new sensor/credential APIs; a fully-closed union would reject valid forward-compat directives and force a lib bump per spec addition. The open tail is the deliberate trade (keys autocomplete; unknown directives still allowed). `sandbox`, by contrast, is a fixed enum and *is* fully closed.
- **`setAllow(directive: PermissionsPolicyDirective, value: string)` positional pair instead of a record.** Rejected — it's an accumulator shape (multiple directives = multiple calls) with ambiguous merge semantics across calls, against the single-attribute `set*` = override idiom. The record sets all directives in one override call.
- **Drop the raw-string arm from `setAllow` (record only).** Rejected — the full Permissions-Policy grammar (multiple space-separated origins per directive, the `src` keyword) can't be expressed as a flat `Record<name, string>` without nesting; ripping out the raw arm would be a needless break with no convergence gain (the two arms collapse to one mental model: "set the `allow` attribute").
- **Ship `credentialless` / `referrerpolicy` in this RFC.** Rejected/scoped-out. `referrerpolicy` is **already shipped** (`embedded.ts:16,59`, typed to `ReferrerPolicy` since 6.1.1) — re-adding would duplicate. `credentialless` is Chromium-only (no Firefox/Safari, not Baseline) — deferred, not part of 6.2.0.

## Open questions

- **Should there be any path to *remove* the `sandbox` attribute entirely (vs `sandbox=""`)?** The new signature only produces `sandbox=""` (fully locked) or a token list — never absent. Leaning: keep `sandbox=""` as the single no-arg behavior (convergent, and an empty sandbox is the safe default); if attribute-unset is ever needed it's a general builder concern, not a sandbox special-case. Decision for a human.
- **Should `PermissionsPolicyDirective` values get a small typed helper for the common allowlist keywords (`'self'`/`'none'`/`*`)?** Out of scope here — values stay raw `string`. Flagged only because a future `type AllowlistOrigin = "'self'" | "'none'" | '*' | (string & {})` could tighten the common case without nesting. Leaning: defer (no demand, and the quoting (`"'self'"`) is awkward as a literal type).
- **Dedup/normalize sandbox tokens?** Currently `join(' ')` preserves dupes and order. Browsers tolerate dupes; leaning no (not worth the code). Noted so reviewers don't flag it as a bug.
