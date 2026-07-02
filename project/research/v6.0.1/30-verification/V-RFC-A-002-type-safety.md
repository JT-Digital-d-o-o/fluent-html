---
rfc: RFC-A-002
lens: type-safety
verdict: survives
confidence: 0.82
killer_objection: null
required_changes: []
---

# Verdict: RFC-A-002 — type-safety lens

> ADVERSARY mandate: kill this RFC through the type-safety lens. Default to reject under uncertainty.

## Attack

I tried four angles. None lands as a kill.

- **No signature change to attack.** `api_surface: []`, `breaking: false`. I verified `src/control/context.ts` against the RFC's quotes: `createContext<T>(defaultValue: T): Context<T>` and `createRequiredContext<T>(name: string): Context<T>` with `current: T` / `scope(value: T)`. The RFC adds JSDoc only; it widens nothing, narrows nothing, introduces no new bare `string`. The type-safety lens owns no surface here.

- **"The hazard should be a type, not a doc."** This is the obvious adversarial line: a guardrail-4 library ("type-safety first") punting a correctness invariant to prose looks like a cop-out. But the invariant is *temporal* — "no `await` may be held open across a live scope." TypeScript cannot express region/affine-resource liveness across `await` points; there is no construct that bans an await inside a `using` block bound to a specific Disposable. The RFC names this correctly in the Type-safety story and parks the only real type-enforced alternative (render-id token / `AsyncLocalStorage`) as parked-major on zero-deps + sync-hot-path grounds. The lens cannot demand a type that the type system provably cannot carry. Attack fails.

- **`createRequiredContext(name: string)` is a bare string (guardrail-4 violation).** Real, but pre-existing and *out of scope* — `name` is a diagnostic label interpolated into an error message, not a value where a literal union fits; bare `string` is correct there. The RFC does not touch that signature, so it neither introduces nor is obligated to fix it. No regression.

- **The new tests are type-unsound.** The streaming-test sketch (lines 132–145) calls `streamToString(renderToStream(Div(Box())))`. I checked `test/stream.test.ts:29` — `streamToString(view: View)` takes a **View**, and `renderToStream` returns a `Readable`. As written that snippet is a compile error (Readable is not assignable to View); the correct form is `streamToString(Div(Box()))` or the variadic `streamArgsToString`. This is the strongest concrete finding, but it is an *illustrative* sketch inside the RFC, not a shipped signature, and the test build (`npm run build` gates `npm test`) would catch it the instant it's authored. It does not block the RFC; at most it's a note to the implementer. The second snippet (`renderToIterable(Span(Ctx.current))` spread into an array) is type-sound. `createContext<"a" | "b">("a")` correctly carries the literal union through `current`.

## Does it survive?

Yes. From the type-safety lens this RFC is inert-by-design: zero public-shape change, the generic `T` already threads the value type (literal unions included), and the only invariant being added is provably not type-expressible, so documenting + testing it is the correct lane rather than a dodge. The additive-only / 6.0.1 contract holds (runtime byte-identical). The lone type defect is in an in-RFC example sketch, not in the deliverable surface, and is compile-caught — not kill-worthy.

Confidence 0.82 (not higher only because the streaming example as literally written wouldn't compile; I leave that to the implementer rather than gate on it).

## Guardrail check (lens-owned)

type-safety: **pass** — no bare `string` introduced where a literal union fits; the `T` generic continues to carry the context value type (including `createContext<"light" | "dark">`-style unions); the new async invariant is temporal and outside the type system's expressive range, correctly enforced by docs + tests rather than smuggled into a signature.
