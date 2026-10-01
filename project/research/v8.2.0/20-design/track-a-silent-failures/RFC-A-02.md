---
id: RFC-A-02
track: A
title: "templates/web emits no htmx: native form action and anchor href, a no-htmx lint every scaffold carries, and a rendered-page check"
resolves: [F-A-106]
cluster: C-05
api_surface:
  - "fluent-html: none"
  - "projects-template (new): templates/shared/eslint-rules/no-htmx-without-runtime.mjs, default export noHtmxWithoutRuntime(configUrl: string | URL): Linter.Config[]"
  - "projects-template (changed, additive): templates/web ContactPage(config: SiteConfig, errors?: ContactFormProps['errors'])"
enforcement: lint
error_text: '222:6  error  This site serves no htmx runtime, so hx-* attributes are inert (a form without action/method submits as GET). Use Form().setAction(route.resolve()).setMethod("post") or A().setHref(route.resolve(params))  no-restricted-syntax'
prose_deleted: []
guideline_delta: 0
lockstep: [template]
codemod: none
codemod_dry_run: n/a
dims_predicted: { silent-failure: +1, verification-loop: +1, error-quality: +0.5 }
impact: 3
effort: S
ships_to: no-change
depends_on: []
status: proposed
lenses: [runtime-contract, security/escape, instruction-set]
---

# RFC-A-02: templates/web emits no htmx: native action and href, a no-htmx lint, a rendered-page check

## Problem

F-A-106 measured 3 `setHtmx` calls in a template that serves 0 htmx bundles. Measured again for this RFC:

- **Render** (the template's own fluent-html 8.1.0, via tsx): none of the 4 registered pages loads an htmx script. Each page loads only `/static/js/fluent-behaviors.8.1.0.js`.
  - `/contact` carries `hx-post` and `hx-swap` (`src/pages/contact.ts:222-224`).
  - `PostCard` and `PostCardCompact` carry `hx-get`, `hx-target`, `hx-swap` and `hx-push-url` (`src/components/blog/post-card.ts:106,135`).
  - In total: 5 distinct hx names on 3 elements, and no runtime to read any of them.
- **Browser** (Chromium 149.0.7827.55 via playwright-core). The scratch fastify server uses the template's `@fastify/formbody` and the `POST /api/contact` handler body from `src/index.ts:198-212`:

  | | contact submit | empty submit (`novalidate`) | post card click |
  |---|---|---|---|
  | shipped | `GET /contact?name=Ana&email=a%40b.si&subject=&message=Hi`, 0 POST | `GET`, 200, 0 of 3 field errors | 0 requests, URL stays `/blog-list` |
  | this RFC | `POST /api/contact` (`application/x-www-form-urlencoded`) → 302 → `GET /contact?success=true` | `POST`, 400, full page, 3 of 3 field errors | `GET /blog/hello` |

- **Age.** The defect is older than a40bd01.
  - None of the 22 revisions of `templates/web/src/shared/layout.ts` loads htmx. `templates/web/public` holds `css`, `favicon.svg` and `fonts`, with no `js/` folder.
  - The form posted natively until 05a2f15 (2026-02-06, "Use htmx") replaced `.setAction("/api/contact").setMethod("post")` with `.setHtmx(hx(...))`. It has been dead for 237 days.
  - The cards kept `.setHref()` beside `.hxGet()` until b10beed (2026-03-07) removed the href. They have been dead for 208 days.
  - L-270 assumed templates/web vendors "the same blob" as full-stack. That was never true.
- **Why nothing caught it.**
  - In the repo, `eslint . --max-warnings=0` exits 0.
  - vitest passes 3 of 3. `tests/smoke.test.ts:11-16` builds each page View and checks it is not null, but never calls `render`.
  - tsc reports 16 errors, all from modules that only exist after scaffolding, and 0 in the 3 affected files.
  - A scaffolded web site never lints with `templates/web/eslint.config.mjs`. `copySharedFiles` (`templates/shared/setup-utils.ts:585,600`, called at `templates/web/setup.ts:653`) copies `templates/shared/eslint.config.mjs` over it. In a blog scaffold, `cmp` shows the two files are byte-identical.
- **A second defect depends on the first.** The 400 branch (`src/index.ts:207`) answers with `ContactForm({ errors })` alone, which is an htmx fragment. After a native POST the browser would show a bare 1,795-byte `<form>`, with no `<html>` and no stylesheet.

## Instruction-set check

- **Full-stack already has a check one layer up.** `templates/full-stack/tests/unit/htmx-grammar-contract.test.ts` (177 lines) checks every emitted hx token against `public/js/htmx.min.js`. templates/web has nothing like it. Since templates/web serves no bundle, that contract reduces to "emit no hx-*".
- **The place for the rule already exists.** `templates/shared/eslint-rules/` holds 4 template-local modules, and `copySharedFiles` puts them in every scaffold (`setup-utils.ts:586-589`). This RFC adds a fifth module and writes no plugin rule.
- **packages/ui** emits no htmx and serves none.
- **Fleet census.** `fleet-served.mjs` covers every package.json under `~/jt-digital` that depends on fluent-html, excluding `.claude`, tooling, demos and `projects-template-tests`.
  - 61 packages in total. 58 serve htmx: 30 vendor a bundle file and 28 load it from a script URL.
  - 3 serve none: the projects-template root, `packages/ui` and `templates/web`.
  - Only 1 of those 3 emits htmx: `templates/web`, with 3 `setHtmx` calls and 0 `hxGet`, `hxPost`, `hx()`, `Partial`, swap verbs or `addAttribute("hx-…")`.
  - No web sites derived from the template exist in the fleet.
  - All 15 fleet repos on the shared-derived eslint config vendor `public/js/htmx.min.js`.
- **Type-gate probe.** A template augmentation, `declare module "fluent-html" { interface Tag { setHtmx(blocked: never): never } }`, still lets `Div().setHtmx(route.resolve())` and `Div().setHtmx(route())` compile (tsc exit 0). Declaration merging can add an overload but cannot remove one. A type gate would need a library opt-out that serves 1 of 61 packages, and guardrail 5 rules that out.

Verdict: fluent-html needs no change. The fix is a projects-template patch.

## Proposed change

Everything below changes projects-template only. fluent-html, the eslint plugin, the extractor, the guidelines and `packages/ui` are untouched.

**1. `templates/web/src/pages/contact.ts`**: the form submits natively, and the page accepts errors.
```typescript
export function ContactPage(config: SiteConfig, errors: ContactFormProps["errors"] = {}) {
  // ...
            ContactForm({ errors }),
// ContactForm, lines 222-224:
    .setAction(contactRoutes.submit.resolve())
    .setMethod("post")
```

**2. `templates/web/src/components/blog/post-card.ts:106,135`**: each card becomes a real link.
```typescript
    .setHref(blogRoutes.post.resolve({ slug: post.slug }))
```
`.cursor("pointer")` stays, because `fluent-html/anchor-requires-cursor-pointer` is on in both configs.

**3. `templates/web/src/index.ts:207`**: a native POST replaces the whole document, so the 400 must render the full page.
```typescript
      return reply.status(400).renderView!(
        Layout({ seo: { title: "Contact", noIndex: true }, config: siteConfig, children: ContactPage(siteConfig, errors) }),
      );
```
The `Layout` import moves out of the `[module:cms]` block (`:38`) into the import that is always present (`:31`, `import { Layout, MinimalLayout }`). A scaffold without the CMS still resolves it.

**4. New file `templates/shared/eslint-rules/no-htmx-without-runtime.mjs`** (28 lines). This is the only place the rule is defined:
```js
import { existsSync } from "node:fs";

// An hx-* attribute only does something on a page that loads htmx. The full-stack template
// vendors public/js/htmx.min.js; the web template ships none, so there every htmx emitter is dead.
const NO_HTMX =
  'This site serves no htmx runtime, so hx-* attributes are inert (a form without action/method submits as GET). ' +
  'Use Form().setAction(route.resolve()).setMethod("post") or A().setHref(route.resolve(params)).';

/** Bans the htmx emitters when the project beside `configUrl` vendors no htmx bundle. */
export default function noHtmxWithoutRuntime(configUrl) {
  if (existsSync(new URL("./public/js/htmx.min.js", configUrl))) return [];
  return [
    {
      files: ["src/**/*.ts"],
      rules: {
        "no-restricted-syntax": [
          "error",
          { selector: "CallExpression > MemberExpression.callee > Identifier.property[name=/^(setHtmx|hxGet|hxPost)$/]", message: NO_HTMX },
          { selector: "CallExpression[callee.property.name='addAttribute'] > Literal:first-child[value=/^hx-/]", message: NO_HTMX },
        ],
        "no-restricted-imports": [
          "error",
          { paths: [{ name: "fluent-html", importNames: ["hx", "Partial", "HtmxConfig", "hxResponse"], message: NO_HTMX }] },
        ],
      },
    },
  ];
}
```
It keys on the same file the full-stack grammar contract reads (`htmx-grammar-contract.test.ts:20`), so both checks depend on what the browser actually receives.

**5. Wire the module into the three configs** (2 lines each, placed last in the array):
```js
import noHtmxWithoutRuntime from "./eslint-rules/no-htmx-without-runtime.mjs";   // shared; "../shared/eslint-rules/…" in full-stack and web
  ...noHtmxWithoutRuntime(import.meta.url),
```
- Add the copy entry to `copySharedFiles` (`setup-utils.ts`, after `:589`): `["eslint-rules/no-htmx-without-runtime.mjs", "eslint-rules/no-htmx-without-runtime.mjs"]`.
- `tests/eslint-config-parity.test.ts` still holds: the full-stack config equals the shared config with imports repointed (`true`).
- In `templates/web/eslint.config.mjs:64-65`, the comment "paired with setHtmx where a swap is wanted" becomes `// No htmx and no swap-verb layer here: internal anchors use setHref.`

**6. `templates/web/tests/smoke.test.ts:11-16`**: the existing test now renders the pages it builds.
```typescript
  // The layout serves no htmx, so an hx-* attribute is a request path that never fires.
  it("should render all registered pages without errors or hx-* attributes", () => {
    for (const route of getRoutes()) {
      const html = render(renderPage(route)!);
      expect(html.match(/[\s<]hx-[\w:-]*(?==|[\s>])/g), route).toBeNull();
    }
  });
```

**7. Template docs.**
- `templates/web/CLAUDE.md`:
  - Drop "+ HTMX" from the stack line (`:3`) and "HTMX, OOB swaps," from `:6`.
  - Remove the two htmx-target blocks (`:73-87`) and the `## HTMX` section (`:90-149`). A 7-line `## Forms and links` section with the two native lines replaces them.
  - Switch the inline-errors example (`:207-211`) to `.setAction(...).setMethod("post")`.
- `templates/web/README.md:134,139,165-168,185-186`: say the form posts natively, remove the `hx` import, show the native pair and the full-page 400.

**Emitted bytes**, comparing the full render before and after: `/contact` changes 1 tag, and `/`, `/about` and `/pricing` change 0 lines.
```html
- <form class="bg-white p-8 rounded-xl border border-gray-200" hx-post="/api/contact" hx-swap="outerMorph show:window:top">
+ <form class="bg-white p-8 rounded-xl border border-gray-200" action="/api/contact" method="post">
- <a class="cursor-pointer flex gap-3 p-3 rounded-lg group hover:bg-gray-50" hx-get="/blog/hello" hx-target="body" hx-swap="outerMorph show:window:top" hx-push-url="true">
+ <a class="cursor-pointer flex gap-3 p-3 rounded-lg group hover:bg-gray-50" href="/blog/hello">
```
Class attributes are byte-identical. The generated `public/css/fluent-safelist.css` is byte-identical before and after (4,627 bytes).

## Before → after

Shipped code (`contact.ts:222-224`, `post-card.ts:106`):
```typescript
    .setHtmx(contactRoutes.submit({ swap: "outerMorph show:window:top" }))
    .setHtmx(blogRoutes.post({ slug: post.slug }, { target: "body", swap: "outerMorph show:window:top", pushUrl: true }))
```

| State | lint | smoke test | browser |
|---|---|---|---|
| shipped code, shipped configs | exit 0 | 3 of 3 pass | GET with personal data in the URL; dead cards |
| shipped code, this RFC's configs | 3 errors: `post-card.ts:106:6`, `post-card.ts:135:6`, `contact.ts:222:6` (in the repo and in a blog scaffold) | `AssertionError: /contact: expected [ ' hx-post', ' hx-swap' ] to be null` | unchanged |
| this RFC | exit 0 in the repo; 0 new diagnostics in a blog scaffold | 3 of 3 pass (in the repo, and in blog, landing, portfolio and docs scaffolds) | POST → 302; 400 is a full page; `GET /blog/hello` |

The first diagnostic, verbatim. eslint 10.5.0's stylish formatter drops the message's final period:
```
  222:6  error  This site serves no htmx runtime, so hx-* attributes are inert (a form without action/method submits as GET). Use Form().setAction(route.resolve()).setMethod("post") or A().setHref(route.resolve(params))  no-restricted-syntax
```

## Enforcement

**Layer: lint**, scoped to the template, at error level.
- The type layer is out of reach without a library change (see the probe above).
- The lint runs in the editor, in `npm run lint`, and in CI (`ci.yml:49` → `pnpm run verify` → `package.json:17` → `pnpm -r lint`).
- It is part of the config every web scaffold receives.

Results:
- **Coverage.** The lint flags all 3 shipped emitters. A page render sees only 1 of the 3: `PostCard` appears on no registered page, and a blog scaffold's home renders `PostList({ posts: [] })`.
- **Wrong-guess probe.** All 4 wrong shapes are flagged, with 5 diagnostics: `hxGet`, `addAttribute("hx-get", …)`, `setHtmx(hx(...))`, and `import { hx, Partial }`. None of the 3 controls is flagged: `setHref(route.resolve())`, `setDataAttrs`, `"query".search(/q/)`.
- **No side effects elsewhere.** templates/full-stack has 0 errors and 0 warnings before and after: the module returns `[]` there and the config stays at 5 blocks. The 15 fleet repos on the shared config all vendor the bundle, so none is newly flagged.
- **The fix the message names** is a single edit: `.setAction(route.resolve()).setMethod("post")` on a form, or `.setHref(route.resolve(params))` on an anchor.
- **Backstop.** The smoke-test assertion checks rendered bytes. It catches paths the lint cannot see by name, such as a computed `addAttribute` name or a CMS public block. Today the `@jtdigital/cms` dist has 0 hx emitters outside `admin/`. The check runs in CI through `tests/web-compile.test.ts:111-113,132-134`, which runs each scaffold's own vitest.

## Replaces (converge)

- The 3 `setHtmx` calls become the native pattern the guidelines already teach for this exact case (`guidelines/web-development/htmx.md:144-145`: "Pair it with `.setMethod("post").setAction(route.resolve())` on the form so a browser without htmx posts natively"). No new API.
- The smoke test's not-null check: the same test now renders.
- The stale comment at `templates/web/eslint.config.mjs:64-65`.
- 78 lines of htmx teaching in `templates/web/CLAUDE.md` and 8 in `README.md`, replaced by 14 new lines. Template docs net **-72**.
- **Guideline delta is 0.** No line in `guidelines/web-development/**`, `fluent-html/CLAUDE.md` or `fluent-html/README.md` mentions templates/web's no-htmx setup: a grep for `templates/web|web template|no htmx` finds 0 hits. The one guideline passage this RFC relies on (`htmx.md:144-145`) stays.
- Template docs are counted separately because setup copies `guidelines/web-development/CLAUDE.md` over a scaffold's `CLAUDE.md` (`setup-utils.ts:413-416`, called from `templates/web/setup.ts:1232`). `templates/web/CLAUDE.md` therefore reaches only agents editing projects-template itself.
- Line totals for the patch: +66 / -102. Code and config: +52 / -16. Docs: +14 / -86.

## Lane & migration

**no-change** for fluent-html (the cluster suggested 8.1.x).
- No library byte, type or symbol changes. The patch ships in projects-template on its own schedule.
- Inside the template it fixes something that never worked, which is the 8.1.x criterion applied to the template. The one signature change, `ContactPage`'s optional `errors`, is additive.
- No codemod. The census found no no-htmx web sites outside projects-template. The 15 repos that pull the shared config all vendor htmx, so the module returns `[]` for each of them. Nothing needs migrating and nothing newly fails lint.

## Guardrail check (§5, 1–13)

1. Zero runtime deps: pass (no library change).
2. Sync render hot path: N/A (no library change).
3. Escape by default: pass.
   - `setHref` takes the `ResolvedRoute` brand.
   - 5 hostile slugs (`x" onmouseover="alert(1)`, `javascript:alert(1)`, `../../admin/cms`, `a b?c=1#d`, `<script>`) all come out percent-encoded under `/blog/`, the same bytes the shipped `hx-get` carried.
   - The anchor keeps exactly 2 attributes (`class`, `href`). `setAction` receives a constant `resolve()`.
4. Type-safety, no inference through generic wrappers: pass. The lint matches method names and import names syntactically.
5. Instruction set: pass. Template-only; 1 of 61 packages is at risk.
6. Pure core: pass (N/A).
7. Converge: pass. One shared module serves 3 configs, the native pattern is existing guidance, and nothing is added to the library.
8. Naming: N/A (uses the existing `setAction`/`setMethod`/`setHref`).
9. Class-string contract: pass. Class attributes and the safelist are byte-identical; 0 vocab rows.
10. Runtime-grammar contract: pass. The hx names templates/web emits drop from 5 to 0, against a served set that is empty.
    - The native path was executed in Chromium, including under the template's real CSP (`registerSecurityHeaders`, `form-action 'self'`, `security-headers.ts:73`): POST → 302 → GET.
11. Breaking = codemod-first: N/A.
12. Enforcement over prose: pass. Lint at error level; guideline delta 0; template docs -72.
13. Append-only styling: N/A.

## Scorecard prediction

- **silent-failure +1.** All 3 silent request paths in templates/web now work. Any new htmx emitter in a no-htmx project is a lint error at the call site (all 4 wrong-guess shapes are flagged).
- **verification-loop +1.** Today lint, tsc and tests all pass on the broken template (exit 0; 16 errors, all pre-existing; 3 of 3 tests). After the change, both lint and the smoke test fail on the defect.
- **error-quality +0.5.** There was no diagnostic at all; now one appears at `contact.ts:222:6` and names the exact replacement.

## Alternatives considered

- **Serve htmx in templates/web** (vendor 4.0.0 like full-stack). That would make the 3 calls work, but it ships a bundle on every page of a static, cached site whose layout says "no htmx needed" (`layout.ts:73`, a40bd01). It reverses a template decision for the sake of 1 form and 2 links, and the native version works with or without htmx.
- **Library type opt-out** (an augmentable `htmx: false` flag that turns the emitters into `never`). This is the only way to reach the type layer, and it would serve 1 of 61 packages. A template augmentation cannot do it (the tsc exit 0 probe). Rejected under guardrail 5.
- **A rule in the eslint plugin.** That means a plugin release and an eslint lockstep for one template. Core `no-restricted-syntax` gives the same diagnostic with no plugin code.
- **A render test alone** (the finding's rough idea, at the ci layer). It sees 1 of 3 emitters and only fires when tests run, never in the editor. Kept as the byte-level backstop.
- **Lint only in `templates/web/eslint.config.mjs`.** It would pass in projects-template and be missing from every scaffold, because setup overwrites that file (`cmp` shows it byte-identical to the shared config). That is why the rule lives in `templates/shared/eslint-rules/`.
- **Restore the shape from before b10beed** (`setHref` plus `hxGet`). It works but leaves 4 dead attributes on each card, and the lint flags `hxGet` anyway.

## Open questions (for curation)

1. **No success message.** After the fix the visitor lands on `/contact?success=true`, which shows the same unchanged form. `success` is read nowhere in `templates/web/src`, and `static-pages.ts:61` caches the page by pathname and ignores the query. A `/contact/sent` entry in the page registry would be the native fix. It is out of scope here.
2. **Guidelines in a web scaffold.** A web scaffold's `CLAUDE.md` is a copy of `guidelines/web-development/CLAUDE.md`. Its line `:1` ("SSR HTMX apps") and line `:264` ("never `setHref`") point an agent toward code that does nothing in a web site. The lint message overrides them at the point of error. Should `:264` be scoped to htmx apps in place (0 net lines), or left as is?
3. **Close L-270.** Its premise, that templates/web vendors an htmx bundle, is false. This RFC is the web version of that contract.
4. **Pre-existing scaffold defects found during these runs** (separate findings, not fixed here):
   - The saas web scaffold's smoke test fails at import on the unmodified template: `pricing.ts:3` imports the removed `components/landing/pricing.js`.
   - A blog scaffold lints with 6 errors and 4 warnings under the shared config, all in the setup-generated `home.ts`.
   - `templates/web/CLAUDE.md:5-9` links to 4 reference files that do not exist in `templates/web`.
5. Should `htmxIndicator` (class `htmx-indicator`, 0 uses in web) join the banned list? It emits no hx-* attribute, so the current message would not fit it.

## Executed

Scratch: `wave2/RFC-A-02/`. `tpl/` is the fixed template, `tpl-probe/` is the shipped source with the new configs, `fs/` is full-stack with the new config, and `scaffold-*` and `sc-*` are real `scaffold()` output.

| Command | Key output |
|---|---|
| `NODE_ENV=test tsx pages-render.ts` (template src, its fluent-html 8.1.0) | 4 pages; hx only on `/contact`; 0 htmx scripts; PostCard and PostCardCompact carry 4 hx names each |
| `node drive.mjs` against shipped / fixed / fixed with `CSP=1` | table in Problem; CSP run: `POST /api/contact -> GET /contact?success=true`, 400 with 3 errors, `GET /blog/hello` |
| `curl -X POST -d "name=&email=&message=" /api/contact` (old vs new handler) | 1,795 B bare `<form>` vs 13,035 B `<!DOCTYPE html>` page with stylesheet |
| `diff` of the full renders, 4 pages | contact: 2 lines (1 tag); the other 3: 0 |
| `tsx scripts/build-safelist.ts` before and after, `cmp` | byte-identical, 4,627 B |
| `eslint . --max-warnings=0` (real template) | exit 0 |
| `eslint .` (`tpl-probe`, new config) | 3 errors at `post-card.ts:106:6`, `:135:6`, `contact.ts:222:6` |
| `eslint . --max-warnings=0` (`tpl`) | exit 0 |
| `eslint src` in blog scaffolds (`scaffold-probe` / `scaffold-proto` / `scaffold-real`) | 3 / 0 / 0 no-restricted errors (all three share the same 6 pre-existing errors and 4 warnings) |
| `eslint src` on full-stack, current vs new config | 0 / 0 errors, 0 / 0 warnings, 0 no-restricted |
| parity check (`repoint(shared) === full-stack`) | `true` |
| `eslint` wrong-guess probe (`lint-probe.ts`) | 5 diagnostics on 4 guesses; 0 on 3 controls |
| `vitest run` (`tpl-probe` / `tpl` / scaffolds) | 1 failed (`/contact`) / 3 passed / blog, landing, portfolio and docs 3 passed; saas has an import error that also occurs on the unmodified template |
| `tsc --noEmit` in the repo before and after; blog scaffolds | identical 16-error sets; 8 = 8; 0 in changed lines |
| `tsc -p typeprobe` (augmentation adding `setHtmx(blocked: never): never`) | exit 0: both `setHtmx` calls still compile |
| `tsx escape-probe.mts` (5 hostile slugs) | all percent-encoded; anchor attributes are only `class` and `href` |
| `node fleet-served.mjs` | 61 packages: 58 serve htmx, 3 do not, 1 at risk (templates/web, 3 setHtmx) |
| shared-config fleet repos that have `public/js/htmx.min.js` | 15 of 15 |
| `git log` on layout.ts (22 revisions), contact.ts, post-card.ts | no htmx script in any revision; 05a2f15 on 2026-02-06; b10beed on 2026-03-07 |
