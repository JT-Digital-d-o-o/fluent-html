# Verdict: elements-symmetry-6 — NOT REFUTED (confirmed by reproduction)

**Finding:** `AreaTag.setDownload` drops the `boolean` overload that `AnchorTag` has, in the same file (`src/elements/links.ts:120` vs `:42`).

**Mode:** refute-by-reproduction. Result: **reproduced — refutation failed.**

## Evidence

### 1. Source and built declarations diverge exactly as claimed

- `src/elements/links.ts:17` — `AnchorTag.download?: string | boolean`; setter at `:42` — `setDownload(download?: string | boolean)`.
- `src/elements/links.ts:87` — `AreaTag.download?: string`; setter at `:120` — `setDownload(download?: string)`.
- Built output matches: `dist/src/elements/links.d.ts:22` (`string | boolean`) vs `:48` (`string`).

### 2. tsc probe reproduces the asymmetric compile error

Probe (`scratchpad/probe-es6/probe.ts`) importing from `dist/src/index.js`:

```typescript
const anchor = A("dl").setDownload(true);   // compiles
const area   = Area().setDownload(true);    // errors
A("dl").setDownload("report.pdf");          // compiles
Area().setDownload("report.pdf");           // compiles
```

`npx tsc --noEmit --strict` output — exactly one error, on the Area line:

```
probe.ts(7,33): error TS2345: Argument of type 'boolean' is not assignable to parameter of type 'string'.
```

### 3. Spec claim holds

WHATWG HTML defines `download` identically for `<a>` and `<area>` (both are "elements that create hyperlinks"); the attribute may be present without a value or with a filename. There is no spec basis for `<area>` accepting only the string form.

### 4. Runtime check of the proposal's serializer claim — with a caveat

```
render(A('x').setDownload(true))    → <a download="true">x</a>
render(A('x').setDownload(false))   → <a download="false">x</a>
render(A('x').setDownload('f.pdf')) → <a download="f.pdf">x</a>
areaTag.download = true (forced)    → <area download="true">
```

The shared schema-key serializer does accept a boolean without crashing on both tags, so widening AreaTag's signature is indeed the one-line parity fix the proposal describes. **Caveat:** "already handles the boolean" overstates it slightly — the serializer stringifies rather than emitting the valueless form. `download="true"` means "suggest filename `true`" per spec, and `setDownload(false)` renders `download="false"`, which still *enables* download (with filename "false") instead of omitting the attribute. This pre-existing AnchorTag quirk is out of scope for the symmetry finding but worth noting if the fix is implemented: ideally `true` → valueless attribute, `false`/`undefined` → omitted.

## Conclusion

The defect is real and reproduced end-to-end: identical spec grammar, divergent typed API within one file, `Area().setDownload(true)` a compile error while the anchor equivalent compiles. Severity "low" is fair. **refuted = false.**
