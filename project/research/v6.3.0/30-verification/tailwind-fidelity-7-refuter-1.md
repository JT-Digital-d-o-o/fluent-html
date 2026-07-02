# tailwind-fidelity-7 — Refuter 1 verdict

**Verdict: NOT REFUTED — finding CONFIRMED.**

I attempted to refute this and failed on every angle. Every factual claim in the finding reproduces.

## What I checked

### 1. The type gap is real (positively reproduced with tsc)

`src/core/tailwind-types.ts`:

- `TailwindState` (lines 218–242) admits `in-*` only as the arbitrary form `` `in-[${string}]` `` (line 232). No other arm covers named `in-focus` — I checked every candidate: `not-${string}` (wrong prefix), `ExtraPseudoState` (has `in-range`/`out-of-range` only), `AriaBoolVariant`, `StructuralNthVariant`, `GroupPeerState` arms (all `group-`/`peer-` prefixed). There is **no `(string & {})` escape hatch** in either union.
- `TailwindBreakpoint` (line 252) = `"sm" | "md" | "lg" | "xl" | "2xl" | TailwindContainerBreakpoint`. The container union (lines 245–249) covers `@max-lg` (with `@`) but nothing matches bare `max-sm`.
- `.on()`/`.at()` have exactly one declaration each (`src/core/tailwind-methods.ts:150–151`), typed strictly as `TailwindState` / `TailwindBreakpoint`. No overloads elsewhere (grepped the whole `src/`).

`tsc --strict` on assignability probes:

```
error TS2322: Type '"in-focus"' is not assignable to type 'TailwindState'.
error TS2820: Type '"max-sm"' is not assignable to type 'TailwindBreakpoint'. Did you mean '"@max-sm"'?
```

`"in-[.peer]"` and `"@max-sm"` type-check fine — exactly the inversion the finding describes (rare arbitrary form works, common named form doesn't).

### 2. Tailwind v4 really compiles these (verified against 4.3.2)

Installed `tailwindcss@4.3.2` + `@tailwindcss/cli` fresh and compiled a source containing `in-focus:opacity-100 in-hover:flex max-sm:flex max-md:mt-2`. All four emitted CSS, e.g.:

```css
.in-focus\:opacity-100 { :where(*:focus) & { opacity: 100%; } }
.in-hover\:flex { ... }
.max-md\:mt-2 { ... }
.max-sm\:flex { ... }
```

So `.on("in-focus", …)` and `.at("max-sm", …)` are valid Tailwind v4 that the typed API rejects.

### 3. Refutation angles that failed

- **"Escape hatch exists"** — `in-[:focus]`-style arbitrary selectors or raw `addClass` could express these, but that doesn't make the typed unions complete; the library's design (closed unions, safelist extraction from typed calls) is exactly why named forms need union members. An awkward workaround is not a semantic that makes this a non-issue.
- **"Container `@max-*` covers it"** — it doesn't; `@max-sm` is a container query on a `@container` ancestor, semantically different from the viewport `max-sm:` media query. tsc's own "Did you mean '@max-sm'?" hint would actively steer users to the wrong feature.
- **"Named in-* isn't real v4"** — refuted by compiling with 4.3.2 (the exact version the finding cites).

### 4. Proposal sanity

`GroupPeerState` exists at line 426 (`hover | focus | focus-within | focus-visible | active | disabled | checked | required | invalid | valid | open`) and is the right state set to reuse for `` `in-${GroupPeerState}` ``. The `max-${"sm"|"md"|"lg"|"xl"|"2xl"}` addition mirrors the existing responsive union. Runtime `.on()`/`.at()` just prefix the class string, so no runtime change is needed.

## Conclusion

Confirmed defect: the two most idiomatic v4 spellings — named `in-*` state variants and `max-*` mobile-only breakpoints — are compile errors in the typed API while their rarer arbitrary/container cousins type-check. `refuted = false`, confidence high.
