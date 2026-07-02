# Verification: elements-symmetry-2 (refuter-2)

**Verdict: CONFIRMED — not refuted.** Reproduced by tsc probe against `src/index.ts`.

## Method

Adversarial refute-by-reproduction. Wrote a probe (`probe.ts`) importing the public factories (`Img`, `Video`, `Canvas`, `Source`, `Svg`, `Iframe`, `Embed`, `ObjectEl`) via a `paths` alias to `/Users/tony/jt-digital/fluent-html/src/index.ts`, compiled with `tsc --strict --noEmit` (moduleResolution `bundler`, matching the repo tsconfig).

## Reproduction results

Every asymmetry claimed in the finding produced the predicted compile error; every "accepting" call compiled clean.

| Probe call | Predicted | Actual tsc result |
|---|---|---|
| `Img().setWidth(800)` | error (string-only) | TS2345: number not assignable to string |
| `Video().setWidth("800")` | error (number-only) | TS2345: string not assignable to number |
| `Canvas().setWidth("300")` | error (number-only) | TS2345 |
| `Iframe().setWidth(640)` | error (string-only) | TS2345 |
| `Embed().setWidth(640)` | error (string-only) | TS2345 |
| `ObjectEl().setWidth(640)` | error (string-only) | TS2345 |
| `Video().setWidth()` | error (not clearable) | TS2554: Expected 1 arguments, got 0 |
| `Canvas().setHeight()` | error (not clearable) | TS2554 |
| `Source().setWidth(800)` / `("800")` | OK | clean |
| `Svg().setWidth(24)` / `("24")` | OK | clean |
| `Img().setWidth("800")` / `(undefined)` | OK | clean |
| `Video().setWidth(800)` | OK | clean |

So the finding's headline symptom is real and bidirectional: `Img().setWidth(800)` is a compile error while `Video().setWidth("800")` errors the opposite way, and clearability via `undefined`/zero-arg flips per class.

## Source anchors (verified)

- `src/elements/media.ts:36` — ImgTag `setWidth(width?: string)`
- `src/elements/media.ts:128` — SourceTag `setWidth(width: string | number)` coerced via `String()`
- `src/elements/media.ts:153` — VideoTag `setWidth(width: number)` required, stored as `number`
- `src/elements/media.ts:254` — CanvasTag `setWidth(width: number)` required, stored as `number`
- `src/elements/media.ts:280` — SvgTag `setWidth(width: string | number)` coerced
- `src/elements/embedded.ts:29 / :102 / :140` — IframeTag / ObjectTag / EmbedTag `setWidth(width?: string)`

## One quibble (does not refute)

The title's count is loose. By parameter signature alone there are **three** shapes across **eight** classes (Img/Iframe/Object/Embed = `?string`; Source/Svg = `string | number` coerced; Video/Canvas = required `number`). "Five signatures across seven classes" is only reachable by also counting storage/clearability semantics (Video & Canvas store `number` and are non-clearable; Source/Svg coerce-to-string; Img et al. store string and clear via `undefined`). The substance — one spec attribute, divergent incompatible APIs, Img (the CLS-critical case) rejecting numbers — is fully confirmed regardless of how the variants are tallied.

## Proposal sanity

Unifying on `setWidth(width?: string | number)` with `String()` coercion (SourceTag shape, made optional) is compatible with all currently-passing call sites in the probe; the only behavioral change is VideoTag/CanvasTag storing `string` instead of `number`, which is fine for attribute serialization but worth checking against `defineSchemaKeys`/render for any `typeof === "number"` assumptions.
