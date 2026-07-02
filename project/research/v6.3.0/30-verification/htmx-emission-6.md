# Verification: htmx-emission-6 — No typed surface for htmx 4's `:inherited`/`:append`

**Verdict: gap CONFIRMED. Score: 6/10.**

## Finding summary

The `HTMX` interface (`src/htmx.ts:201-256`) and the serializer's `HTMX_ATTRS` table
(`src/render/serialize.ts:142-162`) can only emit fixed `hx-<name>` attributes. htmx 4's
explicit-inheritance modifiers (`hx-*:inherited`, `hx-*:append`) have no typed emission path;
the README's own example falls back to `.addAttribute("hx-confirm:inherited", ...)`.

## Gap check

Searched current `src/` for any existing coverage:

- `grep -rn "inherited"` across `src/` and `test/` → **zero hits**. Same for `:append`,
  `hxInherited`, `hxAppend`.
- `HTMX` interface fields all map 1:1 to plain attribute names via `HTMX_ATTRS`
  (`str`/`boolOrStr`/`json` configs) plus special-cased booleans (`optimistic`, `ignore`,
  `preload`, `status`). No config accepts a name modifier.
- `README.md:478` demonstrates the untyped workaround exactly as claimed:
  `.addAttribute("hx-confirm:inherited", "Are you sure?")` — inconsistent with the project's
  "specialized methods, never addAttribute" rule, and a typo in the suffix silently inherits
  nothing.
- `resolveSelector` exists and is exported (`src/index.ts:330`, used in `src/routes.ts:266-268`),
  so the proposed Id-resolution piece has existing plumbing to reuse.

No existing method or overload covers this. **gapConfirmed = true.**

## Call-site evidence (value side)

Strictly counting current usage that would improve:

- `examples/htmx.ts` — no inheritance usage at all.
- `test/` — only two `addAttribute("hx-get", ...)` calls in `test/security.ts`, both testing
  escaping of the generic bag, not inheritance.
- `fluent-html-demos` — zero `:inherited` occurrences.
- Downstream app (`ttl`) — zero `:inherited` occurrences.
- **Net: exactly one existing call site improves — the README's own example.**

The house architecture (per-element `hx()` from route callables, full-layout swaps) sidesteps
inheritance; per-element repetition works today, so this is a convenience/consistency API,
not an unblocking one.

## Effort / design notes

Low-to-moderate. A container-level `hxInherited({...})` (plus `:append` variant) can reuse the
existing `HTMX_ATTRS`-style serialization and `resolveSelector`. Main design work is
constraining keys to htmx 4's actually-inheritable subset (spec check needed) and deciding
`:append` semantics for `headers`/`vals`.

## Score rationale — 6/10

- **For:** the gap is real and self-documented (README:478 violates the library's own API
  rule); the file header claims "Compatible with HTMX 4.0+" while the headline htmx 4 change
  is inexpressible in the typed surface; typo-in-attribute-name is a silent-failure footgun;
  implementation is cheap with existing plumbing.
- **Against:** measured demand is one README snippet — zero call sites in examples, tests,
  demos, or downstream apps use inheritance today, so value density judged strictly on
  evidence is modest.

Correctness-of-claims and API-consistency arguments carry it above midpoint; absent
demonstrated call sites, it does not score higher.
