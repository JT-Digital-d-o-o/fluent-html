### A later class of the same family wins in new apps

fluent-html appends classes, so a composed styler and a later call both reached the element and
Tailwind picked the winner by stylesheet order: `H3(…).apply(cardTitle).text("danger")` kept
`text-text` and `text-danger` side by side, and the title showed the text color (on fl-um,
rgb(17, 24, 39) instead of rgb(220, 38, 38)). `src/shared/ui/layout.ts` warned against composing
for that reason.

- **`buildServer` and `tests/setup.swap-verbs.ts` call `setClassMerge(theme)`.** It is fluent-html
  8.2.0's opt-in serialize-time merge, so the fluent-html pin moves to 8.2.0 in the same commit
  (the import is TS2305 on 8.1.x). The later class of a family wins, so
  `.apply(cardTitle).text("danger")` renders `text-lg font-semibold text-danger`. Cross-prefix
  pairs (`px-6 py-3 p-2`), `hidden`, important classes and unregistered tokens are never merged,
  and `getClass()` still returns every write. On the scaffold the only rendered deltas are exact
  duplicates (`cursor-pointer cursor-pointer`): unit 680/680, integration 190/190, and the
  safelist and compiled CSS are byte-identical.
- **The compose warnings in `src/shared/ui/layout.ts` are gone.** "Compose, never override" on
  `cardChrome` and "Composition only ADDS" on `cardTitle` described the append-only behavior the
  merge replaces.
- **An existing app opts in by hand.** The same two lines, in a commit that carries its own
  re-render delta audit (exact duplicates, no-change dedupes, intended visible changes,
  property-losing drops). A class flipped client-side by `toggleClass` or a clipboard
  `feedback.class` loses its earlier same-family class as a fallback (0 fleet sites today).

### `FormGroup` reads the control's id, keeps `idPrefix`, and links a hint

3.5.0 made `name` a required `FormGroup` prop, because fluent-html had no reader for the id a
built control carries, and paired label and control as `htmlFor ?? name`. That overwrote the
id `Form<T>` derives with its `idPrefix`, so two forms on one page that both bind `email`
rendered two `id="email"`.

- **The pair is `htmlFor ?? input.getId()`** (fluent-html 8.2.0). Two forms binding `email`
  render `signup-email` and `newsletter-email`. A single `Form<T>` page renders byte-identical
  (2,149 B). The `name` prop is gone, and a stale `name:` fails as TS2353.
- **A hand-built control with no id is nested in its label** instead of getting a `<label>` with
  no `for` (associated 0/1 before, 1/1 after).
- **`hint` and `error` slots.** `hint?: string` renders one line under the label, its id first in
  the control's `aria-describedby`, ahead of the error's; `error?: View` takes `f.error(name)`.
  Two forms with `idPrefix` `jury` and `public` binding `comment` render `jury-comment`,
  `jury-comment-error`, `public-comment` and `public-comment-error`: `for` resolves 2/2,
  `aria-describedby` 2/2, 0 duplicate ids.
- **Apps take it at their next template sync.** 26 fleet definitions read the id through a cast
  or a restated `name` and rewrite to `htmlFor ?? input.getId()`. `tests/view/components.test.ts`
  moves its 5 bare-`Input()` calls from `name` to `htmlFor`, drops `name` from the 1 call that
  already passes `htmlFor`, and pins the nest fallback and the hint-before-error order (33/33).

### List guards bind the list, and `prefer-if-not-empty` is on at error

The template's list guards either restated the list or coerced it into `IfThen`'s nullable
binding: a restated `.length > 0`, seven coerce-binds, and a two-step guard in `login.view.ts`
that 9 apps copied and that writes `props.devUsers ?? []` twice. New apps inherited the
coerce-bind from these exemplars.

- **The 9 template sites use `IfNotEmpty`/`IfNotEmptyElse`** (fluent-html 8.2.0): the restated
  guard in `account.page.view.ts`, the 7 coerce-binds (such as
  `analytics/views/dashboard.view.ts`) and the two-step guard in
  `src/app/auth/sign-in/login.view.ts`, which drops its dead `?? []`. The branch gets the list
  itself, and `null`, `undefined` and `[]` all skip it. 9/9 compile, 8/9 executed
  byte-identical (the 9th compile-only).
- **`fluent-html/prefer-if-not-empty` is on at `error`** in `templates/shared/eslint.config.mjs`
  and its full-stack twin, whose byte-parity is its own test. The rule is type-aware and
  autofixes a restated or coerce-bind guard into the pair.
- **eslint-plugin-fluent-html 4.3.0 and the guidelines that teach the 8.2.0 surface.**
  `pnpm-lock.yaml` moves the plugin to 4.3.0, and `guidelines:pull` re-vendors `CLAUDE.md` and
  `.ai/web-development/` with the lines for the compose rule under `setClassMerge`,
  `IfNotEmpty` and `.size()`.

### Square elements use `.size()`

fluent-html 8.2.0 adds `.size()`, Tailwind's `size-*` (equal width and height) as one typed
call. The templates spelled every square as a `.w(x).h(x)` pair, 24 of them.

- **`codemod:size-fold` folds the 24 pairs** into `.size(x)`, render-identical: 17 in
  `templates/web`, the `AVATAR_BOX` size map in `src/shared/components.ts` among them, and 7 in
  `templates/full-stack`.
- **`fluent-html/prefer-size` is on in all three configs** (`templates/shared`,
  `templates/full-stack` and `templates/web`), which list their rules by hand. Both templates
  lint with `--max-warnings=0`, so a new hand-written pair fails the lint run. The rule autofixes
  a pair only on a chain rooted at a fluent-html element factory with no earlier sizing, `apply`,
  `when*` or class call; elsewhere it suggests, because Tailwind orders `size-*` before
  `w-*`/`h-*` and a width or height the receiver already carries would win.

