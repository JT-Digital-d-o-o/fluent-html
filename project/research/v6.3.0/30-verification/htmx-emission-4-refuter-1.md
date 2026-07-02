# Verification: htmx-emission-4 — refuter pass 1

**Finding:** hxResponse HX-Trigger/HX-Location JSON with non-Latin1 chars crashes Node setHeader
**Verdict: CONFIRMED — refutation failed**

## Refutation attempts

### 1. Look for escaping in the emission path — none exists
Traced the full path in `src/patterns.ts`:

- `serializeTriggers()` (line 174): when any trigger has a detail object, returns raw
  `JSON.stringify(obj)` — no character escaping.
- `location(config)` (line 271): object form returns raw `JSON.stringify(config)`.
- `getHeaders()` (lines 298–303) and `build()` (lines 287–292) copy `_headers` and attach
  the serialized trigger string verbatim. No sanitization layer anywhere between
  `JSON.stringify` and the returned header map.

`JSON.stringify` only escapes control chars, `"` and `\` — it emits `š`, `č`, emoji, etc.
as raw code points above U+00FF.

### 2. Look for a downstream guard elsewhere in the library — none exists
Grepped `src/` for any consumer of `getHeaders`/`HX-Trigger`/`HX-Location` and for any
Latin-1/`charCodeAt`/escape logic applied to header values. The only escaping in the repo
is HTML entity escaping (`src/render/escape.ts`) and URL param encoding (`src/routes.ts`,
`src/htmx.ts:278`) — neither touches `HxResponse` headers. There is no framework adapter
in this package that would re-encode the values.

### 3. Check whether the library disclaims the setHeader contract — it does the opposite
The class JSDoc (`patterns.ts:126–138`) and the `hxResponse` JSDoc (`patterns.ts:342–351`)
both explicitly instruct users to pipe the returned headers directly into
`res.setHeader(key, value)` / `res.set(headers)`. The library owns the encoding contract
for these values.

### 4. Check whether Node actually rejects — reproduced live
Ran under the repo's Node:

```js
res.setHeader('HX-Trigger', JSON.stringify({toast:{msg:'Uspešno shranjeno'}}))
// → THREW: ERR_INVALID_CHAR Invalid character in header content ["HX-Trigger"]
```

Node validates header values as Latin-1 (all chars ≤ U+00FF); `š` is U+0161, so the
exception fires at request time inside the handler.

## Conclusion

Every refutation angle failed. Any `trigger(event, detail)` whose detail contains a
character above U+00FF (Slovenian diacritics, any non-Western text, emoji) produces a
header value Node rejects with `ERR_INVALID_CHAR`, crashing the response exactly as the
finding describes; same for `location({...})` with such values. The proposed
`\uXXXX` ASCII-escaping fix is sound: `JSON.parse` (used by htmx client-side) decodes
`\uXXXX` escapes transparently.

- Evidence: `src/patterns.ts:174` (serializeTriggers), `src/patterns.ts:271` (location),
  `src/patterns.ts:298–303` (getHeaders passthrough), `src/patterns.ts:126–138` (JSDoc
  setHeader contract). Runtime repro above.
