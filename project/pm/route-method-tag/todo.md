# Route method tag - todo

<!-- hill: uphill -->
### As an app author I want a route call to carry its method literally so that a verb can refuse a POST at compile time
- [ ] [P1] DECISION NEEDED: ship inside 8.2.0 (review-v8.2 lockstep step 6, "additive types so htmx mistakes surface at compile time", whose appetite sends new findings to the next run) or as its own minor release ahead of the lockstep?
- [ ] [P1] Add the `M` parameter to `RenderTagged` and return `RenderTagged<DefProp<Def, 'render'>, MethodOf<Def>>` from both `RouteCallable` arms (`src/routes.ts`)
- [ ] [P1] Make the render stance a required phantom tag too, so a conditional of two route calls and a bare `hx()` bag no longer satisfy a stance
- [ ] [P1] CHANGELOG entry under the chosen release
- [ ] [P1] Write tests (`test/types/type-surface.test-d.ts`: a GET, an omitted-method and a POST route call carry `"get"`, `"get"`, `"post"`; `RenderTagged<X>` without `M` still accepts each; `cond ? frag() : page()` and an `hx()` bag fail a fragment stance)
- [ ] [P1] Check for bugs: compile projects-template (all-modules scaffold) and home-page against the build with no changes in either
