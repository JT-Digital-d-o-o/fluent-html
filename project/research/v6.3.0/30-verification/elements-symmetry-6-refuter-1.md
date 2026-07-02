# Refuter verdict: elements-symmetry-6

**Verdict: NOT REFUTED (finding confirmed)**

## Claim under test

AreaTag.setDownload drops the boolean overload that AnchorTag has, in the same file
(`src/elements/links.ts`), despite the WHATWG `download` grammar on `<area>` being
identical to `<a>`.

## Evidence

All anchors verified against `/Users/tony/jt-digital/fluent-html/src/elements/links.ts`:

- **AnchorTag** field: `download?: string | boolean;` (line 17); setter
  `setDownload(download?: string | boolean)` (lines 42-45).
- **AreaTag** field: `download?: string;` (line 87); setter
  `setDownload(download?: string)` (lines 120-123).
- Both classes register `'download'` in `defineSchemaKeys` (lines 58, 131) and share
  the same generic attribute serializer (`buildAttrs`, `src/render/serialize.ts:258-273`),
  which stringifies any non-string value via `String(value)` — so nothing type-gates
  AreaTag away from booleans at runtime; the restriction is purely the setter signature.
- Spec check: WHATWG HTML defines the `download` attribute once for both `<a>` and
  `<area>` ("4.6.5 Downloading resources") — a valueless boolean form or a suggested
  filename string, identical grammar on both elements.
- Consequence: `Area().setDownload(true)` is a compile error (`boolean` not assignable
  to `string | undefined`) while `A().setDownload(true)` type-checks. The asymmetry is
  real and has no compensating guard, alias, or alternate typed path in AreaTag.

## Refutation attempts (all failed)

1. **Runtime guard / different serializer path?** No — both classes serialize through
   the same `_sk` loop in `buildAttrs`; no `download`-specific handling exists anywhere
   in `src/` outside `links.ts`.
2. **Intentional spec divergence?** No — the WHATWG grammar is identical on `<a>` and
   `<area>`; there is no spec basis for the narrower Area signature.
3. **Adequate workaround?** `.toggle("download")` can emit the bare boolean form on any
   Tag, but the same workaround exists for AnchorTag, which still ships the boolean
   overload — so the workaround does not explain the asymmetry away.
4. **Tests encoding the narrower contract?** No — the only tests
   (`test/elements.test.ts:239`, `:245`) exercise the string form on `<a>` and never
   touch `Area().setDownload`; nothing depends on the narrow signature.

## Caveat on the proposed fix (does not affect the verdict)

The proposal's claim that "the shared schema-key serializer already handles the boolean"
is only technically true: `buildAttrs` emits `String(value)`, so `setDownload(true)`
renders `download="true"` (suggested filename "true") and `setDownload(false)` renders
`download="false"` — which per spec still *triggers* download. The boolean overload on
AnchorTag is therefore itself semantically shaky (`false` does not disable). Aligning
AreaTag to `string | boolean` restores symmetry as proposed, but a follow-up may want
boolean special-casing in the serializer (`true` → bare attribute, `false` → omit) —
for both classes. That is a separate issue; the asymmetry defect as stated stands.

**refuted = false, confidence = high**
