# `.tl()` Sink — Design (spiked, pre-decision)

From the 2026-07-31 spikes (session-ephemeral; load-bearing facts captured here).

## Validator shape (the only viable one)

Recursive prefix-peeling: split on spaces (tail-recursive accumulator, ~999-token limit), route any `` `${V}:${string}` `` token to a directive error brand — breakpoints (`sm|md|lg|xl|2xl`) get an `.at()`-style directive, others `.on()`-style (**update both to object-variant form before building**). Never compute `Variant×Base` as a joined union (TS2590). Error-accumulating: all bad tokens in one diagnostic, e.g.

```
'["✗ unknown class 'bg-blue-550'",
  "✗ 'hover:underline': variants are not allowed in .tl() — use .hover({…})",
  "✗ 'lg:flex': breakpoints are not allowed in .tl() — use .lg({…})"]'
```

Signature that preserves the literal in errors: `tl<const S extends string>(s: S & (Check<S> extends true ? unknown : Check<S>))`. Chaining inference verified intact (Tag-returning, subclass, callback-nested).

## Measured facts

- Fixed cost ~1.0s per program = BaseClass union normalization (variant-free grammar saves nothing — hypothesis falsified); marginal valid call ~0.07ms; error path ~11ms/call; +53% fixed per 50 theme tokens (interface-merge augmentation works, spike-proven incl. typo rejection).
- Dynamic rejection: `` tl(`p-${dyn}`) `` with `dyn: string` is a compile error; union-of-literals interpolation validates each expansion and stays natively scannable.
- Tokens (4-way, real demo chains): current 100% → canonical+objVariants 85% → +tl-for-base 57% → full-string 52%. Marginal `.tl` saving over canonical ≈ 20–33% (tokenizer-dependent), concentrated in static piles (step circle 46→25, card preset 44→27).
- Extraction: demos = 1,761 sites, 88.4% static-literal, but only ~70% of static calls sit in runs ≥3 (run-length histogram: 1:153, 2:134, 3:99, 4:55, 5:24, 6+:49). Extractor pipeline unchanged operationally; win = drift blast-radius shrinks to ~30% of classes.

## Convergence rule (draft for CLAUDE.md + lint)

> **Static base utilities: one `.tl()`; everything else: methods.** 3+ static, literal, unconditional utilities → one `.tl("…")` placed first in the chain. 1–2 utilities or any variable value → methods. Variants never in `.tl` (compile error → object variants). Conditionals stay `.when()`/`.apply()`; `.tl` usable inside those callbacks under the same 3+ rule. Never split an element's static utilities between `.tl` and methods; never two `.tl` on one element. `.tl` is append-only — it does not override earlier classes.

## Lint set (bidirectional ratchet — mandatory)

`prefer-tl` (autofix runs ≥3 of literal vocab calls → `.tl`, evaluating each call via class-vocab emit), `no-small-tl` (autofix ≤2-token `.tl` → methods via generated reverse map), `single-tl-per-chain`, `tl-first-in-chain`, `no-split-static`; extend `no-conflicting-classes`/`no-duplicate-classes` to `.tl` day one. Chain-walk patterns exist in the plugin (`no-multiple-setclass-in-chain`, `no-setclass-after-fluent-modifier`).

## Conflict surface (append-only)

Intra-string conflicts/duplicates: lint (existing machinery). `.tl` + method same slot in one chain: lintable via emit-evaluation (new coverage — method-vs-method isn't linted today either). Cross-callback (`.when`/`.apply`) overrides: statically ambiguous, CSS-order — identical to today's `addClass`; no regression, no improvement. New footgun classes vs today: none; the likely support question is "later `.p()` should override `.tl`'s `p-4`" — it doesn't, and never will.
