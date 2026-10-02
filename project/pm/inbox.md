# Inbox

<!-- Raw, untriaged input. Triage each item into a qa.md bug, a todo.md task, a prd.md change
     or a decision, then strike it. review-v8.2 sends new findings to the next run's seen set. -->

## From home-page's type review (02. 10. 26)
- `pushUrl`, `replaceUrl` and a status bag's `push` take a bare `string` (`src/htmx.ts:253-254, 288-289`), skipping the `ResolvedRoute` brand; a verb spreading the route bag forwards them. Type them `boolean | ResolvedRoute`
- A route with no `query` map accepts any query bag, and query keys can never be required (`src/routes.ts:251-254`): `reportRoutes.index({ query: { month: "2026-09" } })` compiles and the query is dropped. Undeclared map as `Record<string, never>` plus a `required` marker (major)
- Form values are not tied to the field's type (`src/elements/forms.ts:446-454`): `f.hidden("role", "ADMN")` compiles for `role: "ADMIN" | "USER"`. Template-literal value types for `hidden`/`radio`, a typed `SelectOption<V>`, `checkbox` only on boolean keys
- The discriminated `Match(value, "kind", …)` overload lacks the widened-value guard the value overload and `whenMatch` have (`src/control/conditionals.ts:156-165`): a `kind: string` compiles and unmatched values render nothing
