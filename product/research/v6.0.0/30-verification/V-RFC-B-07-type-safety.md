---
rfc: RFC-B-07
lens: type-safety
verdict: survives-with-changes
confidence: 0.82
killer_objection: "`requireUser<TUser>(request): TUser` is an unconstrained, unverified cast — it is `request.user as TUser` wearing a function. The `TUser` supplied at the call site has zero type-level relationship to the `TUser` that parameterized `createAuthPlugin`, so `requireUser<Banana>(request)` compiles and the RFC's central type-safety claim ('const generic threads the app's user type through requireUser<TUser>') is false."
required_changes:
  - "Remove the free type parameter from `requireUser`. Thread the user type through the plugin instance instead: `createAuthPlugin<TUser>` must return an object carrying a `requireUser(request): TUser` method (or augment `FastifyRequest['user']` to a per-app-declared type), so the asserted type is the *same* `TUser` the plugin was constructed with — not a fresh, unrelated call-site annotation."
  - "Constrain `requireRole` to the app's role union, not `...string[]`. Add a `Role` type parameter to `createAuthPlugin<TUser, Role extends string = string>` (or derive it from `TUser`) so `requireRole(...roles: Role[])` rejects typos at compile time. As written, `auth.requireRole(\"admni\")` compiles — a silent security-guard failure, the exact §11.4 'bare string where a literal union fits' violation."
  - "Tighten the `createAuthPlugin` constraint to what `requireRole` actually reads: if role-gating ships, the constraint must be `TUser extends { id: string; role: Role }`, not `{ id: string }`. Today `requireRole` inspects a `.role` field the generic does not guarantee exists."
  - "Brand or route-type `loginRedirect`'s return and `OAuthProvider.href`. A bare `string` return enforces nothing — `(returnTo) => \"/auth/login\" + returnTo` (open-redirect) and `authRoutes.login.resolve(...)` are the same type. Either accept a route ref directly (`loginRedirect: RouteRef`) or return a branded `ResolvedUrl` from `.resolve()`, so the §11.6 single-sourcing the RFC claims is type-enforced, not merely 'nudged'."
  - "Replace the two independent `shell?: (children: View) => View` optionals (on `ErrorPageProps` and `ErrorHandlerOptions`) with one shared exported `Shell` type alias, and stop claiming the optional callback 'discriminates needs-chrome': since `View ⊇ string`, a `View => View` slot is structurally indistinguishable from `string => string`; presence-of-callback is a runtime convention, not a type-level discriminant."
---

# Verdict: RFC-B-07 — type-safety lens

> ADVERSARY. Killing RFC-B-07 through the type-safety lens. Default-reject under uncertainty.

## Attack

The RFC's headline pitch *is* type-safety: it exists to retire **261 `request.user!`** assertions and a drifting `declare module` mess. The "Type-safety story" (lines 258–266) is the load-bearing justification for `impact: high`. That section does not survive contact with the actual types in `src/`.

- **type-safety failure mode 1 — `requireUser<TUser>` is a renamed cast, and the "threading" claim is false.** `request.user` is augmented to `unknown | null` (RFC line 93 = `unknown`). The runtime body checks *only* null (line 100: "throws typed 401 if null"). The return type `TUser` comes entirely from the **call-site annotation** `requireUser<AuthUser>(request)`. There is no type-level edge connecting that `TUser` to the `TUser` passed to `createAuthPlugin<AuthUser>` — they are two unrelated generic functions. So:
  ```ts
  const user = requireUser<{ id: string; isAdmin: true }>(request); // compiles
  const user = requireUser<SomeUnrelatedType>(request);             // also compiles
  ```
  This is precisely `request.user as TUser`. The RFC line 260 claim — *"const generic threads the app's user type through findUser, isActive, and `requireUser<TUser>`"* — is wrong: `findUser`/`isActive` *are* threaded (fields of one options object), but `requireUser<TUser>` is a free, standalone generic with nothing inferable. **A wrong call compiles.** Guardrail §11.4 is violated by the very symbol sold as fixing it. The migration codemod (line 274) mechanically rewrites `request.user!` → `requireUser<AuthUser>(request)` — trading one unsound construct for another that is *harder to grep* because it now reads as a guarantee.

- **type-safety failure mode 2 — `requireRole(...roles: string[])` is a security guard typed with bare `string`.** RFC line 84. The app's role set is a literal union (cf. the project's own `formFor` example: `"admin" | "viewer"`), yet the guard accepts any string. `auth.requireRole("admni")` and `auth.requireRole("root")` compile and silently mis-gate. Canonical §11.4 / §11.6 "string literal union — never bare `string`" violation, in the *worst* place: a typo in an authz guard fails open or closed with no compiler signal. Worse, the constraint `TUser extends { id: string }` (line 86) does not require a `role` field, so `requireRole` reads a property the generic never proved exists — `any`-in-disguise property access.

- **type-safety failure mode 3 — the §11.6 single-sourcing the RFC advertises is unenforced.** `loginRedirect: (returnTo?: string) => string` (line 73) and `OAuthProvider.href: string` (line 132) both return/accept bare `string`. The type-safety story (lines 262–263) openly concedes a raw `"/auth/login"` "is still possible but the signature nudges." A type-safety lens does not grade on nudges. `(returnTo) => "/auth/login?next=" + returnTo` — a textbook open-redirect, the exact bug `safeReturnTo` exists to catch — has the *identical type* to `authRoutes.login.resolve({ returnTo })`. The library already ships a branded mechanism (`.resolve()` on a `defineRoutes` ref); the RFC declines to use it in the signature, so the single-sourcing guarantee lives only in the prose, not the types.

- **type-safety failure mode 4 — `View ⊇ string`, so callback "discrimination" is not a type.** `src/core/types.ts:6`: `View = Tag | string | RawString | View[]`. `ErrorPageProps.shell?: (children: View) => View` (line 110) is therefore structurally a supertype of `(s: string) => string`. The claim (line 264) that the optional `shell` callback "discriminates needs-auth-chrome from doesn't" is a runtime convention, not a discriminated union — TS sees only "callback present or absent," and the two `shell` optionals on `ErrorPageProps` and `ErrorHandlerOptions` are independent copies free to drift.

## Does it survive?

**survives-with-changes** — not `reject`. The structural decision (a `fluent-html/fastify` entry point owning render/auth/error wiring) is sound and additive, and the failures are localized to four signatures, all fixable without touching the surrounding design. But the RFC as written **fails its own central guardrail (§11.4)**: the two symbols it most loudly sells as type-safety wins — `requireUser` and `requireRole` — are a bare cast and a bare-string guard. Under default-reject I would reject a *correctness*/*security* framing of these; as a type-safety verdict the path to a sound API is concrete and small, so I require the five frontmatter changes and gate survival on them. The non-negotiable one is the first: `requireUser` must derive its return type from the plugin instance (`createAuthPlugin<TUser>(...).requireUser(request): TUser`, or a per-app `FastifyRequest['user']` augmentation), eliminating the free call-site generic. Without that, this RFC ships `request.user!` with worse ergonomics and a false safety claim, and should be rejected.

## Guardrail check (§11.4 type-safety — this lens owns it)

FAIL as written, on three counts: (1) `requireUser<TUser>` is unsound widening (`unknown → TUser`, no verification, no threading); (2) `requireRole(...roles: string[])` is bare `string` where a literal union fits, in a security guard; (3) `loginRedirect`/`href` are bare `string` that defeat the §11.6 `.resolve()` single-sourcing the RFC claims to enforce. Each is repairable; the frontmatter `required_changes` convert all three to PASS.
