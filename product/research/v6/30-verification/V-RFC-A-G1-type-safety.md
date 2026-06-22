---
rfc: RFC-A-G1
lens: type-safety
verdict: survives-with-changes
confidence: 0.86
killer_objection: "The RFC's headline rewrite (worked example #1 / F-A-021, the 63-site cluster) does not type-check against its own cited data shape: `reservation.status` is a union-typed FIELD on a single object type (a Prisma payload), not a discriminated union of object types. `Extract<Reservation, Record<\"status\", \"PENDING\">>` collapses to `never`, so every `Match(reservation, \"status\", {...})` case receives `never` and `r.<field>` fails with `Property does not exist on type 'never'` — even in the fully-exhaustive form. The guideline would instruct an LLM to replace a working, compiling `IfThen` chain with code that does not compile, accompanied by an error that points at the case body and gives no hint of the real cause."
required_changes:
  - "F-A-021 + worked example #1: scope the `IfThen`-chain → `Match(x, key, cases)` rewrite to GENUINE discriminated unions only (a union of distinct object types). For the cited reservations case the value is `{ status: ReservationStatus; ... }` (one object type, union-typed field) — `Extract<T, Record<K,V>>` yields `never` and the rewrite is a hard compile error. Either (a) replace worked example #1's data with a real DU, or (b) keep the reservations example but rewrite it with the VALUE-matching overload `Match(reservation.status, { PENDING: () => ..., ... }, () => Empty())` (which compiles), not the discriminant-KEY overload."
  - "Add an explicit ✗ caveat to both guideline edits (CLAUDE.md 'Discriminated union Match' block and fluent-html.md Control Flow): the discriminant-KEY form `Match(x, key, cases)` requires `x` to be a union of object types. On a single object type with a union-typed field (the common Prisma/DB-row shape), it produces `never` per branch and will not compile — use `Match(x.field, { ... })` (value overload) there."
  - "Type-safety story section: correct the claim 'narrows each branch via Extract<T, Record<K, V>>... makes a new union variant a compile error.' This is true ONLY when T is a discriminated union. State the precondition. Do not present F-A-021 as an instance of it without first verifying the cited types are DUs (they are not in rideshare)."
  - "API restatement (Proposed API block) advertises discriminant-key `Match` over `T[K]: string | number`, but numeric-literal discriminant unions (e.g. `{ kind: 1 } | { kind: 2 }`) also collapse to `never` (verified). Either fix the overload to support numeric discriminants, or document that the discriminant-key form is string-literal-discriminant only and adjust the signature/wording so the docs don't promise unsupported numeric support."
file: product/research/v6/30-verification/V-RFC-A-G1-type-safety.md
---

# Verdict: RFC-A-G1 — type-safety lens

> Adversary brief: kill RFC-A-G1 through type-safety. Default to reject under uncertainty.

All claims below were verified by running the project's own `tsc` (v5.9.3, `strict`, `exactOptionalPropertyTypes`) against the **exact** signatures in `src/control/conditionals.ts` and `src/control/iteration.ts` (copied verbatim; the inlined copies match the source byte-for-byte on the relevant overloads).

## What survives (the RFC is right about these)

- **Nullable narrowing (F-A-105, F-A-025).** `IfThen(url, (u) => ...)` narrows `u` to `string` (the `const x: string = u` assignment compiles); `IfThenElse` likewise. The `!!x` "before" form *does* still compile (forcing `x!`) — the RFC honestly concedes this in Alternatives ("not feasible without breaking the boolean overload"). The teaching is the right lever. ✅
- **`ForEach(count, fn)` vs `ForEach(Array.from(...), fn)` (F-A-026).** Both compile; the count overload binds correctly and `i: number`. No collision with the range overload. ✅
- **True discriminated unions (F-A-103).** `Match(props, "state", {...})` on a genuine DU (`{state:"idle"} | {state:"error";message} | {state:"success";message}`) narrows each branch (`s.message` typed), errors on a missing variant (exhaustive), errors on a typo'd key (`succezz`), and errors on wrong field access (`.data` on the error branch). Every type-safety promise the RFC makes is delivered **for this shape**. ✅
- **Value-matching exhaustiveness.** `Match("active" as ("active"|"error"), { active: ... })` errors on the missing `error` case. ✅

## Attack

The RFC's load-bearing claim is "the discriminant-key `Match` overload was built for exactly this" (line 24) and "makes a new union variant a compile error" (line 142), applied to **all five** anti-patterns, with F-A-021 (63 sites / 6 apps — the largest cluster) as worked example #1. That claim is **false for F-A-021's actual data shape**, and the failure is silent in the RFC because the RFC never checked the cited types.

- **type-safety failure mode 1 — `Extract` collapses to `never` on object-with-union-field (the dominant real shape).** The cited evidence is `rideshare/src/reservations/reservations.view.ts` chaining on `reservation.status`. The `status` field is a Prisma `ReservationStatus` enum (`schema.prisma:280,292`), and `reservation` is a **single object type** `{ status: ReservationStatus; id; rideId; ... }` — NOT a union of object types. `Extract<Reservation, Record<"status","PENDING">>` filters a union's members; on a non-union `T` whose `status` is the wider `ReservationStatus`, the filter matches nothing and yields `never`. Verified output of the RFC's exact worked-example #1 rewrite:

  ```
  test.ts(16,23): error TS2339: Property 'id' does not exist on type 'never'.   // PENDING branch
  test.ts(17,23): error TS2339: Property 'id' does not exist on type 'never'.   // CONFIRMED
  test.ts(18,23): error TS2339: Property 'id' does not exist on type 'never'.   // DECLINED
  test.ts(19,23): error TS2339: Property 'id' does not exist on type 'never'.   // CANCELLED
  ```

  This is not an edge case — it is the **modal shape** for the F-A-021 cluster: status/role/kind fields sourced from a DB row or Prisma payload are union-typed *fields on one object*, not discriminated unions. The guideline would steer an LLM to convert a working, compiling `IfThen` chain into code that fails to compile, with an error (`Property 'id' does not exist on type 'never'`) that points at the case body and never names the cause. That is a net **type-safety regression introduced by the teaching**, on the single highest-frequency finding.

- **type-safety failure mode 2 — `string`-typed discriminant is also `never` / no-overload.** Many apps type status as bare `string` (the cited file even has `statusBadge(status: string)` at `reservations.view.ts:34`). `Match(loose, "status", {...})` where `loose.status: string` produces `Argument of type 'Loose' is not assignable to 'string | number'` on the value overload and `Property 'message' does not exist on type 'never'` on the case bodies. Same confusing double-error.

- **type-safety failure mode 3 — numeric-literal discriminants collapse to `never`.** The Proposed-API restatement advertises `T[K] & (string | number)`, implying numeric discriminant unions work. They do not: `Match({kind:1}|{kind:2}, "kind", {1:..., 2:...})` yields `(value: never)` per branch (verified). The discriminant-key overload is effectively **string-literal-discriminant only**; the docs over-promise.

- **What this does NOT break.** F-A-025, F-A-026, F-A-105 are untouched (no `Match`-DU involved). F-A-103 is a genuine DU and works. So the RFC is ~80% correct; the defect is concentrated in F-A-021 (the headline) plus the numeric/loose-string framing.

## Does it survive?

**survives-with-changes.** This is a zero-code, additive, guideline-only RFC; nothing it touches *breaks* the existing library, and four of five anti-patterns are taught correctly. But the type-safety lens cannot pass it as written: the flagship worked example and the highest-frequency finding (F-A-021) teach a rewrite that **does not compile** against its own cited data, and the API restatement over-promises numeric/loose-string discriminants. A guideline that produces `Property does not exist on type 'never'` for the most common status-field shape is an adoption *anti*-fix — exactly the failure §11.8 exists to prevent. The required changes (above) fold back into the RFC: scope the discriminant-KEY rewrite to true DUs, route object-with-union-field cases to the VALUE overload `Match(x.field, {...}, () => Empty())`, add the ✗ caveat, and correct the numeric claim. With those, the type story is sound.

## Guardrail check (§11.4 type-safety — this lens owns it)

- **Fail as written.** §11.4 demands "no bare `string` where a literal union fits" and full narrowing. The RFC's F-A-021 guidance does the opposite in effect: it produces `never`-typed callbacks (worse than the `IfThen` chain it replaces, which at least compiled) precisely on `string`/union-field discriminants. The narrowing it advertises (`Extract`, `NonNullable<T>`) is real only for true DUs and nullable values — both verified — but the RFC applies the `Extract` claim beyond its domain.
- **Pass after the required changes.** Restricting the discriminant-key form to genuine discriminated unions and steering field-on-object cases to the value overload restores the invariant: every taught rewrite compiles and narrows. The §11.4 self-assessment of "pass" in the RFC is currently unearned and must be re-derived after the example fix.
