---
rfc: RFC-B-09
lens: type-safety
verdict: survives-with-changes
confidence: 0.74
killer_objection: The compile-time translation-key safety is a fiction — `t`'s key type derives from `sample: T`, but the runtime values come from `loadTranslations: (locale) => Record<string, string>`, an *untyped* map with zero structural relationship to `TranslationKey<T>`. A key that type-checks can still render a raw string at runtime because nothing forces the loaded locale to contain it, and nothing forces the loaded locales to share the `sample`'s shape.
required_changes:
  - "Make `RenderOptions.contexts` and `renderView`'s `opts.contexts` reject raw tuples: type them as `readonly ContextEntry[]` where `ContextEntry` is a *branded/opaque* return of `entry()` (e.g. `type ContextEntry = readonly [Context<unknown>, unknown] & { readonly __entry: unique symbol }`), so `[LocaleCtx, 42]` is NOT assignable and callers MUST go through `entry()`. Today `[Context<unknown>, unknown]` accepts any `[someCtx, anyValue]` — a mismatched pair compiles."
  - "Tie `loadTranslations`' return type to the key union: `loadTranslations: (locale: K_locale) => Partial<Record<TranslationKey<T>, string>> | Promise<...>` (or require the loader to return `T`-shaped objects). As written, `Record<string, string>` decouples the typed key surface from the runtime data — `t('a.b.c')` compiles but resolves to `undefined` if the loaded JSON lacks it. The RFC's §11.4 'pass' is unearned without this link."
  - "Tie locale to a literal union. `availableLocales: readonly string[]`, `locale: Context<string>`, and `resolveLocale/resolveUserLocale: => string | null` are all bare `string` — directly contradicting the RFC's 'Locale stays a literal union' claim. Add a second const type param `L extends string` inferred from `availableLocales`, type `locale: Context<L>`, and constrain the resolvers' return to `L | null`. Otherwise `resolveUserLocale: req => 'xx-INVALID'` compiles and silently falls through."
  - "Specify `TranslationKey<T>` behavior on non-object leaves (arrays for plurals/ICU, `number`, `null` in JSON). The mapped type only recurses into `Record<string, unknown>` and treats everything else as a terminal key `P`. An imported `en.json` with `{ items: { count: ['one','other'] } }` or interpolation arrays will produce wrong key unions or `never` collapses. Add explicit handling (or document arrays/numbers as unsupported leaves) and a test fixture in `test/patterns.ts`."
  - "Resolve the `const T` capture hazard for imported JSON. `createI18nContext<const T>({ sample })` relies on `const` inference, but `import en from './en.json'` under `resolveJsonModule` is already a *non-literal* declared type — the `const` modifier on the param does nothing for an already-typed binding; key literals survive (good) but value-shape narrowing the RFC implies (for interpolation typing in the open question) will not. Document that `TranslationKey` keys survive but value-level inference does not, so the deferred `{{param}}` typing is blocked by this, not merely 'diminishing returns'."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-B-09-type-safety.md
---

# Verdict: RFC-B-09 — type-safety lens

> You are an ADVERSARY. Your job is to KILL this RFC through the type-safety lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The RFC's entire value proposition over the status quo is **type safety**: it kills `rideshare`'s prop-drill and `storysell`'s ALS by carrying values implicitly, and it kills `pps`'s `(key: string) => string` typo hole (F-B-103) with `TranslationKey<T>`. Both pillars have type holes that let a wrong call compile.

- **type-safety failure mode 1 — the entry bag erases, and the public surface accepts raw tuples.**
  `ContextEntry = readonly [Context<unknown>, unknown]`. The `entry<T>(ctx: Context<T>, value: T)` helper binds the value to the context's `T` *at construction* — good in isolation. But the consumer types are `RenderOptions.contexts?: readonly ContextEntry[]` and `renderView(view, { contexts?: readonly ContextEntry[] })`. A raw tuple `[LocaleCtx, 42] as const` is structurally assignable to `readonly [Context<unknown>, unknown]` (a `Context<string>` is assignable to `Context<unknown>` — `Context<T>.current` is covariant-readable, and the value slot is literally `unknown`). So:
  ```ts
  render({ contexts: [[LocaleCtx, 42]] }, view)   // COMPILES — value 42 bound to a string context
  ```
  The RFC's type-safety story asserts "`ContextEntry`'s erased `unknown` is never user-facing; callers go through `entry()`." That's a *convention*, not a *type*. The escape hatch is the public type itself. For an RFC whose thesis is "the library should make the wrong thing not compile," shipping a public surface where the wrong thing compiles is the core failure.

- **type-safety failure mode 2 (KILLER) — typed keys are decoupled from runtime data.**
  `t: TranslationFn<TranslationKey<typeof en>>` makes `t('settings.delet.wraning')` a compile error — the headline F-B-103 fix. But the runtime resolver is `loadTranslations: (locale) => Record<string, string>`. There is **no type-level link** between the key union (from `sample`) and the map `t` actually reads at runtime. Two concrete holes:
  1. `t('settings.delete.warning')` type-checks, but if `sl.json` is missing that key, `t` returns `undefined`/raw-key at runtime — the *exact* "silently renders the raw key" failure F-B-103 claims to eliminate, now just relocated from typo-time to missing-translation-time with no compiler help.
  2. Nothing forces `loadTranslations`' output to match `sample`'s shape. `sample: en` drives the types; `loadTranslations` can return an arbitrary `Record<string, string>`. The compile-time surface and the runtime surface are two independent worlds joined only by a string lookup. The RFC claims "no build-step codegen" as a win, but codegen at least *validates every locale against the key set*; this design validates none.

- **type-safety failure mode 3 — locale is bare `string` despite the explicit claim.**
  The RFC states "Locale stays a literal union." The signatures say otherwise: `availableLocales: readonly string[]`, `locale: Context<string>`, `resolveLocale?: => string | null`, `resolveUserLocale?: => string | null`. The plugin's only generic `K` is the *translation-key* union, never the locale. So `LocaleCtx.current` reads as `string` everywhere, `resolveUserLocale: req => 'de-INVALID'` compiles, and apps that want a branded `SupportedLocale` get no help from the API — they must re-brand by hand, which the RFC even admits ("apps … may brand `SupportedLocale` themselves"). A claim contradicted by its own signatures is a §11.4 violation, not a pass.

- **type-safety failure mode 4 — `TranslationKey<T>` is under-specified on real JSON.**
  The mapped type recurses only into `T[P] extends Record<string, unknown>`. Real locale files contain arrays (ICU plural variants, list interpolations) and numbers. An array leaf is `extends Record<string, unknown>`? No — so it terminates as key `P` (acceptable), but a *number* or `null` leaf also terminates as `P`, and a nested array-of-objects produces nothing useful. Worse, the `{ [P in keyof T & string]: ... }[keyof T & string]` indexed access collapses to `never` for any branch whose leaf type isn't a `string` literal, silently *dropping* valid keys from the union — meaning `t('plural.key')` could become a compile error for a key that genuinely exists. The RFC ships zero test fixtures for this and the `const T`-from-JSON inference path (`resolveJsonModule`) is exactly where mapped-type recursion gets brittle.

## Does it survive?

**survives-with-changes.** The primitive (explicit `contexts` entered/disposed by `render`'s `finally`) is sound and the architectural decision (no ALS) is correct — the disposal-ordering bug it fixes is real and the runtime design is fine. The verdict is not `reject` because every hole is closable with type-level changes that *strengthen* the surface without changing the runtime or the worked examples. But it cannot ship as written: failure mode 2 means the RFC does not actually deliver its headline F-B-103 fix (typos move to runtime), and failure modes 1 and 3 let wrong calls compile on the two surfaces the RFC most loudly claims to make safe. The required changes (brand `ContextEntry` so raw tuples are rejected; link `loadTranslations` to the key union; add an `L extends string` locale param tied to `availableLocales`; specify and test `TranslationKey` on array/number/null leaves; document the `const T`/JSON inference limit) fold back cleanly and are the price of the §11.4 'pass'.

## Guardrail check (§11.4 type-safety)

**Does not pass as written.** The RFC self-reports §11.4 'pass' on three claims, two of which are false against its own signatures: (a) `entry<T>` binds value to context — true, but the *consumer* type `readonly ContextEntry[]` re-opens the hole; (b) `TranslationKey<T>` replaces bare-string keys — true at the `t` signature, but the runtime resolver `Record<string,string>` is bare-string and unlinked, so a typed key can still resolve to nothing; (c) "locale stays a literal union" — contradicted by `Context<string>` and `availableLocales: readonly string[]`. With the five required changes applied, §11.4 passes. Without them, it is a guardrail miss, not a pass.
