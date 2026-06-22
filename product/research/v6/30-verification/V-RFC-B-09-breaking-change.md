---
rfc: RFC-B-09
lens: breaking-change
verdict: survives-with-changes
confidence: 0.72
killer_objection: "The blessed `renderView(view?, opts?)` decorator silently narrows the variadic `renderView(...views: View[])` contract that every shipped app and the project template inherit — a breaking capability + type regression marked `additive`, with no migration note and no codemod."
required_changes:
  - "Re-mark the renderView decorator change as a breaking contract narrowing (it is NOT a 'copy-paste, not a breaking change'), and either (a) keep the canonical decorator variadic: `renderView(...views: View[], opts?)` is impossible in TS, so use `renderView(view?: View | View[], opts?: { contexts? })` and forward multi-view to `render(opts, ...(Array.isArray(view) ? view : [view]))`; or (b) explicitly state multi-view/multi-swap (Partial) responses are NOT supported through the new decorator and provide the migration path (call bare `render({contexts}, ...partials)` + `reply.send`)."
  - "Add the decorator signature change to breaking-changes.md as a REQUIRED migration (the variadic→single+opts change), not an 'optional cleanup codemod'. The four surveyed apps (rideshare, storysell-ai, planet-positive-sport, jt-cut) and projects-template all ship the variadic decorator; swapping it changes their public Reply augmentation."
  - "Resolve the `RenderOptions.nonce` vs existing `renderWithNonce(nonce, ...views)` overlap: the proposed decorator body `render({ contexts: opts?.contexts }, view)` drops nonce entirely, so apps that currently call `renderWithNonce` and migrate to the canonical decorator lose CSP nonce injection. Either thread `nonce` through `render(opts)` and deprecate `renderWithNonce` in the same migration, or document that `renderWithNonce` stays the nonce path and `RenderOptions.nonce` is the only blessed one (pick one — two nonce paths is a hidden inconsistency)."
  - "State the i18n subpath's hard tsconfig requirement as a breaking adoption prerequisite, not an open question: `createI18nContext({ sample: en })` requires `resolveJsonModule` + import-attributes (`with { type: 'json' }`) in every adopting app's tsconfig/runtime. Apps on older module targets cannot adopt the typed-key path without a tsconfig change — call this out in Migration & compatibility."
---

# Verdict: RFC-B-09 — breaking-change lens

> You are an ADVERSARY. Your job is to KILL this RFC through the breaking-change lens.
> Default to `reject` under uncertainty.

## Attack

The RFC's frontmatter says `breaking: additive` and the Migration section asserts "Nothing breaks." Two of those claims are false, and a third is undisclosed. I verified each against the real lib source and the four cited apps.

### Failure mode 1 (the killer): the canonical `renderView` decorator narrows a shipped variadic contract — marked additive, no migration

The lib-level overloads ARE additive — verified:
- `src/render/render.ts:33` is `export function render(...views: View[]): string` and the RFC keeps it as overload #1. Good.
- `src/render/stream.ts:111` is `export function renderToStream(view: View): Readable`, kept. Good.

But the RFC's load-bearing ergonomic deliverable is **not** those overloads — it is the "canonical decorator + helper that apps copy once (and the guideline teaches verbatim)" (§3). The blessed signature is:

```ts
renderView(view?: View, opts?: { contexts?: readonly ContextEntry[] }): void;
```

The contract that **every surveyed app and the project template actually ship today** is variadic:

- `rideshare/src/core/server.ts:36` — `renderView(...views: View[]): void;` and `:88` decorates with `function (this, ...views: View[]) { this.type(...).send(render(...views)); }`
- `storysell-ai/src/core/server.ts`, `planet-positive-sport/src/core/server.ts`, `jt-cut/src/core/server.ts` — all `renderView(...views`
- `projects-template/templates/full-stack/src/core/server.ts:115` — `function (this, ...views: View[]) { ...send(render(...views)); }`

So the RFC replaces a variadic decorator with a single-view-plus-opts decorator. This is a **breaking change to the Reply augmentation contract**, and it is the surface the RFC most wants apps to adopt. Concretely:

1. **Type-level break.** Under the new signature, `reply.renderView(Partial(ids.list, A()), Partial(ids.count, B()))` either fails to type-check (excess argument) or — worse — the second `Partial(...)` is bound to `opts`, a `View` where `{ contexts? }` is expected, which is *also* a type error but with a baffling message. Either way it stops compiling. The RFC's claim that adopting the decorator is "a copy-paste, not a breaking change" (§Migration) is wrong for any app that does multi-swap through `renderView`.

2. **Capability regression.** The variadic decorator forwards to `render(...views)`, which the RFC itself preserves as the multi-Partial multi-swap entry point (CLAUDE.md: "Partial swaps for multi-section updates in one response"). The blessed `render({ contexts }, view)` body passes a **single** `view`. So the canonical decorator the RFC ships is strictly less capable than the one apps ship today — multi-swap responses must be rewritten to call bare `render({contexts}, ...partials)` + `reply.send`. That is a migration, and it is undocumented.

The mitigating fact — I grep'd all four apps and found **zero** current multi-view `renderView` callsites — does not save it. The variadic signature is the *advertised contract* in `projects-template`, which every future app inherits; narrowing it is a breaking change to the template surface regardless of who currently exercises it. Per ALGORITHM §11.5 and §13's "guardrail drift" row, a breaking change marked `additive` with no migration note is precisely the failure this lens exists to catch. Under §8's default-reject rule this alone is escalation-worthy.

### Failure mode 2: silent loss of the nonce path

`RenderOptions` carries `nonce?: string` (§1), but the proposed decorator body (§3) is `render({ contexts: opts?.contexts }, view)` — it never reads or forwards `nonce`. The lib already has a distinct nonce entry point, `renderWithNonce(nonce, ...views)` (`src/render/render.ts:49`). The RFC introduces a *second* nonce channel (`RenderOptions.nonce`) without reconciling it with the existing one, and the canonical decorator wires neither. An app that currently renders CSP-noced pages via `renderWithNonce` and migrates to the blessed `renderView` decorator silently loses nonce injection. That is a security-adjacent behavioral regression hiding inside an "additive" RFC. Not fatal, but it must be resolved in the same migration, not left as an undocumented overlap.

### Failure mode 3: undisclosed hard adoption prerequisite for the i18n companion

`createI18nContext({ sample: en })` derives `TranslationKey<typeof en>` from `import en from "./locales/en.json" with { type: "json" }`. The RFC files this under "Open questions" — but it is a **breaking adoption prerequisite**: it requires `resolveJsonModule` plus import-attributes support in every adopting app's tsconfig and runtime/loader. The "blessed architecture" the RFC wants the fleet to converge on cannot be adopted by an app whose module/target config predates import attributes without a config change. That is a real migration cost; demoting it to an open question understates the breakage of "one blessed i18n architecture."

## Does it survive?

**survives-with-changes.** The genuinely load-bearing primitive — the additive `render(opts, ...views)` / `renderToStream(opts, view)` overloads — is honestly additive and verified against source; the no-options overloads are byte-identical to today, so the sync hot path and existing call sites are untouched. The new symbols (`entry`, `ContextEntry`, `seedContext`, `createI18nContext`, `i18nPlugin`, `TranslationKey`) collide with nothing in the lib or apps (grep'd: no existing `entry`/`seedContext` exports). The RFC does not warrant rejection.

But the `breaking: additive` frontmatter and "Nothing breaks" claim are **not honest** for the decorator surface the RFC blesses and tells the guideline to teach verbatim. The required changes above make the breakage explicit, bundle the `renderView` decorator narrowing into a real migration (ALGORITHM §11.5b), and resolve the nonce double-path and the i18n tsconfig prerequisite. With those folded in, the RFC's honesty about breakage matches reality and it survives.

## Guardrail check (§11.5 backward-compat — this lens owns it)

- §11.5(a) codemod-able: the variadic→single+opts decorator change is **not** trivially codemod-able for multi-view callers (they need restructuring to `render({contexts}, ...partials)`), so it must be listed as a manual migration, not an "optional codemod." Currently mis-filed.
- §11.5(b) bundled into one migration in breaking-changes.md: the RFC routes the only mentioned migrations to the "optional migrations" section. The decorator narrowing and the nonce reconciliation must move into the required migration list.
- §11.5(c) justified by impact: yes — the async-context bridge is high-impact and well-evidenced (storysell ALS violation, rideshare prop-drill ×50).
- Lib-level overloads (§11.2 sync hot path): pass — verified no per-render cost when `opts` is absent.
