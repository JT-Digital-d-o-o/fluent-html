# control-flow-4 — Refuter 2 verdict: NOT REFUTED (confirmed by reproduction)

**Finding:** Match exhaustiveness silently evaporates when `T` widens to plain `string`, then misses render invisible `Empty`.
**Mode:** refute-by-reproduction against `dist/` (fluent-html 6.2.0).

## Reproduction

Probe: `/private/tmp/claude-501/-Users-tony-jt-digital-fluent-html/f2f45330-dea1-49ee-a197-fd7d0ee2bfc5/scratchpad/match-probe/probe.ts`, compiled with the repo's own `node_modules/.bin/tsc` under `--strict` (`module nodenext`), importing `Match`/`Span`/`render` from `dist/src`.

Four cases:

1. **Control (literal union):** `Match(st, { a: … })` with `st: 'a' | 'b'` — guarded by `@ts-expect-error`, and tsc exited 0, i.e. the missing-case error *does* fire for literal unions. The exhaustive overload works as documented when `T` is narrow, so the probe setup is sound.
2. **Widened string, missing case, no default:** `const s: string = 'whatever'; Match(s, { a: () => Span('A') })` — **compiles clean** (no error, no `@ts-expect-error` needed). `{ [K in string]: Thunk<View> }` collapses to an index signature, so any partial case object is accepted.
3. **Widened string, matching case:** renders `<span>A</span>` (normal path unaffected).
4. **Widened number, missing case, no default:** `Match(42 as number, { 1: … })` — also compiles clean.

Runtime output:

```
WIDENED_STRING_OUTPUT=[]
MATCHING_OUTPUT=[<span>A</span>]
WIDENED_NUMBER_OUTPUT=[]
```

Cases 2 and 4 hit the silent fallback `((casesOrDefault as Thunk<View> | undefined) ?? Empty)()` at `src/control/conditionals.ts:172` and render the empty string — no throw, no warning.

## Assessment of the finding's claims

- "Compiles clean under --strict" — **confirmed** (tsc exit 0 with no suppression on the widened-string call).
- "Renders '' at runtime via the silent fallback" — **confirmed** (`WIDENED_STRING_OUTPUT=[]`).
- JSDoc contradiction — confirmed: `conditionals.ts:75` states "Without a default, TypeScript ensures every possible value has a handler", which is false for `T = string`/`T = number`. The overload at :118-121 imposes no non-widened constraint.
- The finding also holds for plain `number` (probe case 4), slightly broadening the stated scope.

## Verdict

**refuted = false.** The defect reproduces end-to-end: type-level guarantee silently vanishes for widened `string`/`number`, and the runtime failure mode is invisible blank output. The proposed fix direction (`string extends T ? never : number extends T ? never : T` on the no-default overloads) is consistent with what the probe shows; a `never`-typed value parameter would turn probe cases 2 and 4 into compile errors while leaving case 1 (literal unions) untouched.
