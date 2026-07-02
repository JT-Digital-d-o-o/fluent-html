# type-honesty-4 — Refuter 1 verdict

**Finding:** `Tag.attributes` is a public mutable `Record<string, string>` that is actually a shared frozen object — direct writes compile and throw.

**Verdict: NOT REFUTED — CONFIRMED (high confidence)**

## What I tried to refute, and what I found

I attempted every angle that could make this a non-issue. Each one failed:

### 1. "Maybe the field isn't actually public in the emitted types"
It is. `dist/src/core/tag.d.ts:31` publishes it verbatim:
```ts
attributes: Record<string, string>;
```
No `readonly`, no `@internal` JSDoc on the field, no `Readonly<...>` wrapper. The `@internal` marker at `src/core/tag.ts:10` is on the `EMPTY_ATTRS` const, not on the `attributes` field. Consumers see a plain mutable record.

### 2. "Maybe the write doesn't actually throw at runtime"
It does, in exactly the environments TypeScript consumers run in. Empirical probe against the built `dist/`:

- **ESM** (`--input-type=module`): `Div().attributes["data-x"] = "1"` →
  `TypeError: Cannot add property data-x, object is not extensible`
- **Strict-mode CJS** (`'use strict'`): same TypeError.
- **Sloppy-mode CJS**: no throw, but the write **silently no-ops** — `a.attributes["data-x"]` reads back `undefined`. This is arguably worse than the throw (silent data loss instead of a crash).

Since compiled TS output of ESM projects — the library's own target audience — is strict mode, the throw is the behavior real users hit.

### 3. "Maybe fresh tags don't really share one object"
They do. Probe: `Div().attributes === Div().attributes` → `true`. Root cause confirmed in source: `src/core/tag.ts:11` (`Object.freeze(Object.create(null))`), `src/core/tag.ts:71` (`declare attributes` — no per-instance field emit), `src/core/tag.ts:550` (`Tag.prototype.attributes = EMPTY_ATTRS`).

### 4. "Maybe the failure isn't state-dependent"
It is, exactly as claimed. After one `a.addAttribute("data-y", "2")` call (which copies-on-write at tag.ts internals — see the `if (this.attributes === EMPTY_ATTRS) this.attributes = Object.create(null)` guards at tag.ts:373, :430), the same direct write `a.attributes["data-x"] = "1"` succeeds and reads back `"1"`. So the crash appears only on tags that haven't yet had an attribute set through the API — a classic confusing intermittent failure.

### 5. "Maybe direct mutation is documented as unsupported"
No. Nothing in `README.md` or shipped docs marks the field internal or warns against direct writes. The only "never mutate" comment sits on the private-ish `EMPTY_ATTRS` const, which library consumers never see. The type surface is the contract, and the type surface says "writable record".

## Conclusion

Every factual claim in the finding reproduces:

| Claim | Result |
|---|---|
| Field is public + non-readonly (tag.ts:71, d.ts:31) | Confirmed |
| Fresh tags share frozen `EMPTY_ATTRS` (tag.ts:11, :550) | Confirmed |
| Direct write compiles under `--strict` | Confirmed (type is `Record<string, string>`) |
| Direct write throws `TypeError` at runtime (strict/ESM) | Confirmed empirically |
| Failure is state-dependent (works after `addAttribute`) | Confirmed empirically |
| Bonus: sloppy mode silently drops the write | Confirmed empirically |

The proposal (publish as `readonly attributes: Readonly<Record<string, string>>` with internal writers casting, or strip from public d.ts) is sound; either variant closes the type/runtime honesty gap. This is a genuine type-honesty bug, not a false positive.
