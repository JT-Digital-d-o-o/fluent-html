# Route method tag

## Problem

A route call drops its method. `RouteCallable` knows it (`readonly method: MethodOf<Def>` in
`RouteProperties`), but the bag a call returns is `RenderTagged<S>` (`src/routes.ts:309`), which
carries only the render stance; its `method` is the `HxHttpMethod` union. So a consumer that must
refuse a non-GET route cannot do it in types: projects-template's `.defer` (fires on `load`, no
user gesture) and `.poll` (fires on a timer) both accept `controlRoutes.cleanup()`, a POST that
kills processes, and would run it on every page view. Found by the 2. 10. 26 home-page review;
a TypeScript app cannot widen a library type alias from outside, so the fix has to live here.

## Appetite

Small batch, half a day: one type parameter, its tests, a release.

## Solution

- `RenderTagged<S, M extends HxHttpMethod = HxHttpMethod> = HTMX & { readonly render?: S; readonly method: M }`.
- Both `RouteCallable` arms return `RenderTagged<DefProp<Def, 'render'>, MethodOf<Def>>`.
- The default keeps every existing `RenderTagged<X>` annotation compiling (`PageRoute`,
  `FragmentRoute<N>` in projects-template): a call's result only becomes narrower. Type-only, no
  runtime change: the bag already carries the literal method.
- Consumers then demand `"get"` the way they demand a render stance, with a readable
  missing-property error (projects-template `swap-verbs/defer-verb`).

## Rabbit Holes

- Tagging `hx(url)` bags: an ad-hoc url has no def, keeps the union, and the verbs already refuse
  it through their stance check.

## No-Gos

- No runtime method check in the library.
- No change to `RouteProperties` or `MethodOf`.
