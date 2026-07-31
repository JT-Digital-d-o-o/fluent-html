# fluent-html — Project Management

v6: a greenfield, v4-native, instruction-set rewrite of the contract for new projects. Requirements: [prd.md](prd.md) · architecture: [decisions.md](decisions.md). Design contract: [`product/research/v6/40-synthesis/`](../../product/research/v6/40-synthesis/).

## Phases (core library)

| Phase | Scope | Theme |
|------|-------|-------|
| P1 | [render-spine](render-spine/) | de-recursion + the one `serialize.ts` emitter, streaming, CSP nonce, behavior/`hx-status` security, allocation + `.on()/.at()` safety, typed internals |
| P2 | [tailwind-v4](tailwind-v4/) | v4 class-vocab codegen → safelist extractor → `defineTheme()` → v4 method/variant/lint survivors |
| P3 | [core-api](core-api/) | boolean `.toggle()`, typed ARIA, `_sk` coverage, transforms/shortcuts, `.overlay()`, `Document()`, `ForEachElse`, `.hxOn()` |
| P4 | [core-primitives](core-primitives/) | `Form<T>` binding, native dialog behaviors, full SVG coverage, `.htmxIndicator()` |
| P7 | [behaviors-v4](behaviors-v4/) | behavior system v4 — data-attribute emission, versioned runtime, 10-verb vocabulary, acceptance harness (design: [research/behavior-v4](../research/behavior-v4/)) |
| P8 | [llm-styling](llm-styling/) | styling surface for LLM authors — vocab generator + validity oracle, escape-hatch closure, canonical names, object variants, optional `.tl()` sink |

## Downstream (separate packages — not this repo's scope)

| Phase | Package | Where tracked |
|------|---------|---------------|
| P5 | `@fluent-html/fastify` — render adapter + context system | future package scope |
| P6 | `@jtdigital/ui` + `@jtdigital/web` — design system + auth/i18n/errors | `projects-template/.../template-update/fluent-html-v6-alignment.md` |
