---
rfc: RFC-B-07
lens: breaking-change
verdict: survives-with-changes
confidence: 0.78
killer_objection: "The library ships `declare module \"fastify\" { interface FastifyRequest { user: unknown | null } }` as an import side-effect, but all 4 target apps ALREADY declare `interface FastifyRequest { user: AuthUser | null }`. Two augmentations of the same property `user` with different types collide at compile time (TS2717: subsequent property declarations must have the same type) — and `renderHx` is imported (step 1/2) long before `auth.plugin.ts` is deleted (step 3), so the RFC's own incremental-adoption sequence produces a non-compiling intermediate state. This is breakage the RFC labels `additive`."
required_changes:
  - "Drop the `interface FastifyRequest { user: unknown | null }` augmentation from the library entirely. `unknown | null` collides (TS2717) with every app's existing `user: AuthUser | null` declaration the instant both are in the program, and even if merged would WIDEN `request.user` to `unknown`, breaking the 261 existing `request.user!.id`/`.role` sites before the codemod runs. Apps keep owning the `user` field type; `requireUser<TUser>` already carries the type as a generic, so the lib does not need the augmentation."
  - "Split module augmentation out of the render plugin's import side-effect. An app adopting only `renderHx` (migration step 2) must not be forced to also pull in `signIn`/`signOut`/`user` augmentations that collide with the un-migrated `auth.plugin.ts` still in the tree (deleted only at step 3). Use two sub-path entry points (`fluent-html/fastify/render` and `fluent-html/fastify/auth`) or an explicit opt-in `import \"fluent-html/fastify/augment\"`, so steps 1-2 are genuinely independent of step 3."
  - "Flag the cookie-name behavioral break. Default `cookieName: \"__sid\"` does not match rideshare/mngmt (which use `userId` — verified at rideshare/src/auth/auth.plugin.ts:29). Adopting `createAuthPlugin` there without explicitly passing `cookieName: \"userId\"` silently invalidates every live session on deploy (all users logged out), orphaning the old cookie. Not codemod-able, currently unmentioned. Add to Migration: 'rideshare/mngmt MUST set cookieName: \"userId\" or accept a full session flush', and add a breaking-changes.md entry. Also verify the signed-cookie VALUE shape is compatible across all four apps (signIn signs user.id; confirm storysell/glimm __sid payloads match)."
  - "Reconcile / remove the `signIn(user: { id: string })` augmentation. It collides under TS2717 with the apps' `signIn(user: AuthUser)`. Either the lib stops augmenting signIn (app owns it) or the lib publishes it and apps delete theirs in the SAME atomic step — which contradicts 'incremental adoption'. Pick one and state it."
  - "State the decorator double-registration hazard. Registering `fastifyFluentHtml()` while a local `decorateReply(\"renderView\")` still exists (rideshare/src/core/server.ts:87) in the same encapsulation context throws FST_ERR_DECORATOR_ALREADY_PRESENT at boot — a hard crash, not a type error. Migration must mandate deleting the local decorator in the SAME commit as the register."
  - "Flip frontmatter `breaking: additive` → `breaking: breaking` and add the RFC to the bundled breaking-changes.md migration. As written the RFC does not compile in a single one of its four named target apps."
---

# Verdict: RFC-B-07 — breaking-change lens

> You are an ADVERSARY. Your job is to KILL this RFC through the breaking-change lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

Frontmatter says `breaking: additive`; §Migration asserts "no existing symbol is touched … No `breaking-changes.md` entry required." Both are false the moment you read what the apps actually declare. The breakage lives in TypeScript's **declaration merging** and in **session-cookie identity** — neither codemod-able as written.

- **Failure mode 1 — TS2717 augmentation collision (compile break).** Verified in all four target apps (`rideshare/src/auth/auth.plugin.ts:8-14`, `mngmt/...:8-14`, `storysell-ai`, `glimm`), each ships:
  ```ts
  declare module "fastify" {
    interface FastifyReply { signIn(user: AuthUser): void; signOut(): void }
    interface FastifyRequest { user: AuthUser | null }
  }
  ```
  The RFC ships, as an import side-effect of `fluent-html/fastify` (RFC lines 92-98):
  ```ts
  declare module "fastify" {
    interface FastifyRequest { user: unknown | null }
    interface FastifyReply { signIn(user: { id: string }): void; signOut(): void }
  }
  ```
  Declaration-merged interfaces require **identical types for a re-declared property**. `user: unknown | null` vs `user: AuthUser | null` → `TS2717: Subsequent property declarations must have the same type`. `signIn(user: { id: string })` vs `signIn(user: AuthUser)` → same. The instant an app imports `fluent-html/fastify` (RFC's migration step 1/2: render plugin / `renderHx`) while its own `auth.plugin.ts` is still present (deleted only at step 3), the project stops compiling. The RFC's headline — "Apps adopt incrementally" (line 269) — is exactly what triggers the break.

- **Failure mode 2 — silent session invalidation (behavioral break).** RFC line 76 defaults `cookieName: "__sid"`. Verified: rideshare (`auth.plugin.ts:29` `setCookie("userId", …)`) and mngmt use `userId`; only storysell/glimm use `__sid`. The rideshare worked example (RFC lines 198-203) omits `cookieName`, so migrating per the RFC silently renames the session cookie: every authenticated user is logged out on deploy and the old `userId` cookie is orphaned (never cleared). Invisible at compile time, invisible in review (the diff *deletes* boilerplate, never shows the cookie name), not codemod-able. Precisely the class §11.5 forces into `breaking-changes.md` — yet the RFC declares none is needed.

- **Failure mode 3 — incremental adoption is a fiction under global augmentation.** Module augmentation is global and non-local: it applies to the whole TS program the moment the module is in the import graph, regardless of which scope registered the plugin. So steps 1-2 cannot land without the auth augmentations also landing (same entry point), which cannot coexist with the un-deleted `auth.plugin.ts` of step 3. The four "incremental" steps are one atomic migration mislabeled as four optional ones.

- **Failure mode 4 — decorator double-register boot crash.** `fastifyFluentHtml()` calls `decorateReply("renderView", …)`. If the local decorator (`rideshare/src/core/server.ts:87`) is still present in the same encapsulation context when the plugin registers, Fastify throws `FST_ERR_DECORATOR_ALREADY_PRESENT` at boot — a hard crash, not a graceful warning. The migration reads as if `register(...)` is safe to add before cleanup; it is not.

## Does it survive?

**Survives with changes.** The consolidation value is real (the drift is genuine; the apps verifiably fork the same plugin), and every break above is fixable without abandoning the design. But it cannot ship as `breaking: additive` with "no `breaking-changes.md` entry." Load-bearing fixes (full list in frontmatter):

1. **Remove the lib's `FastifyRequest.user` and `FastifyReply.signIn` augmentations** — apps keep owning `user: AuthUser | null`; `requireUser<TUser>` already takes the type as a generic, so the lib never needs to augment `user`. Re-declaring with `unknown` is a strict regression even past the collision: it widens `request.user` to `unknown`, breaking downstream `.id`/`.role` at all 261 sites before the codemod runs.
2. **Separate render augmentation from auth augmentation** (sub-path entry points / explicit `import ".../augment"`) so steps 1-2 are independent of step 3.
3. **Document the cookie-name break**; require `cookieName: "userId"` for rideshare/mngmt or announce a session flush; add the `breaking-changes.md` entry.
4. **Flip `breaking: additive` → `breaking: breaking`** and bundle into the single migration.

Without fixes 1-2 the RFC does not compile in a single one of its four named target apps — that alone is otherwise `reject`. Because the fixes are mechanical and the underlying consolidation is sound, the conservative-but-honest verdict is `survives-with-changes`. Confidence 0.78 reflects residual uncertainty about whether the `__sid` signed-cookie *payload* is value-compatible across the four apps, which I could not fully confirm from source.

## Guardrail check (breaking-change owns §11.5)

§11.5 (backward-compat) is **VIOLATED as written**: labeled additive but (a) re-declares two existing app-owned augmented members with conflicting types (compile break, TS2717), (b) changes session-cookie identity by default (behavioral break), (c) presents a non-decomposable migration as four incremental steps. §11.5 permits breaking changes only in a major, "codemod-able where possible, bundled into one migration in `breaking-changes.md`, justified by impact." This is v6 (a major) and impact is justified, so compliance is reachable — but the RFC must add the `breaking-changes.md` entry and acknowledge the cookie-name change is NOT codemod-able. With the required changes folded in, §11.5 is satisfiable.
