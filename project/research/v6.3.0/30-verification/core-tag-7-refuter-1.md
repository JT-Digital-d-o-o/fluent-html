# Verification: core-tag-7 — refuter pass 1

**Verdict: NOT REFUTED (confirmed)** — confidence: high

## Finding under test

1. `addAttribute` silently overwrites despite the documented `set*`/`add*` convention (naming issue).
2. `addClass` under a variant splits on single spaces, so multi-space input emits a dangling bare variant class (e.g. `hover:`).

## What I checked

### Part 2 — variant split (the runtime bug): CONFIRMED by execution

Code: `src/core/tag.ts:126-129` —

```typescript
const classes = this._variantPrefix
  ? (c.indexOf(' ') === -1
      ? this._variantPrefix + ':' + c
      : c.split(" ").map(cls => `${this._variantPrefix}:${cls}`).join(" "))
  : c;
```

`c.split(" ")` on `"a  b"` yields `["a", "", "b"]`; the empty element becomes a bare
`hover:` class. Ran against the built package (`dist/src/core/tag.js:88` has the
identical split, so dist is not stale):

```
render(Div().on('hover', t => t.addClass('a  b')))
  → <div class="hover:a hover: hover:b"></div>          // dangling hover:
render(Div().on('hover', t => t.addClass(' a b ')))
  → <div class="hover: hover:a hover:b hover:"></div>   // leading/trailing spaces too
```

No downstream normalization: the renderer emits the class string verbatim.
`addClass` is a public, documented API (JSDoc example passes a space-separated
string), so multi-space / padded input is a legitimate call shape. Tab/newline
separators would be even worse (`split(" ")` doesn't split them at all →
`hover:a\nb` as a single bogus token). The proposed fix
(`c.split(/\s+/).filter(Boolean)`) is correct.

Refutation angles tried and failed:
- **"No caller can pass multi-space strings"** — false; `addClass` is public and its
  own JSDoc invites space-separated lists.
- **"Renderer/extractor normalizes whitespace"** — false; output shown above is verbatim.
- **"Harmless output"** — the dangling `hover:` is at minimum garbage in the class
  attribute and noise for the safelist extractor; the non-variant path
  (`Div().addClass('a  b')` → `class="a  b"`) shows the variant path uniquely
  manufactures the bogus token.

### Part 1 — naming convention: CONFIRMED as stated

- `src/core/tag.ts:142-144` (setStyle JSDoc) explicitly states the convention:
  "`set*` methods override and `add*` methods accumulate".
- `src/core/tag.ts:193`: `this.attributes[key] = value` — silent replace on repeat key.

The finding itself concedes overwrite is the correct *behavior* (attributes are
single-valued; DOM `setAttribute` has the same semantics) — the defect claimed is
purely the name violating the library's own documented convention, and that is
accurate. The strongest counter-reading — "addAttribute *adds an entry to the
attribute collection*, accumulating across keys like addClass accumulates
classes" — doesn't hold against the file's own JSDoc, which defines the
convention per-method (`setStyle` replaces vs `addStyle` appends *the same
property*), and against the maintainer's stated API rule. This half is a
low-severity API-consistency issue, not a runtime bug; the proposal
(introduce `setAttribute`, deprecate `addAttribute` as alias) matches both the
convention and DOM naming.

## Conclusion

Cannot refute. The variant-split bug reproduces exactly as described; the naming
inconsistency is real and documented in the same file. Severity: split bug =
low/moderate (garbage class emission, public API path); naming = low (API polish).
