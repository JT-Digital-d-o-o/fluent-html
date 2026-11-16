// Copy of projects-template templates/full-stack/src/core/htmx/swap-verbs.ts (the fluent-html 8 verbs),
// with layoutIds stubbed. In fluent-html 9 these verbs live in the package.
/**
 * Full-layout swap verbs for `Tag` — the template's request-half HTMX vocabulary.
 *
 * Replaces the old `fullLayoutSwap()` options helper with fluent gestures that bake in
 * *this app's* `#main-content` target + global loading indicator. The template
 * knows those ids, so the verbs hardcode them — fluent-html core stays unopinionated
 * (no `defineSwap` primitive; see project/pm/swap-verbs/decisions.md). Registered by a
 * side-effect import in core/layout/layout.view.ts — which every rendering entrypoint
 * (server, workers, tests) transitively imports — via the same `declare module` +
 * `Tag.prototype` mechanism the library's own mixins use (htmx-methods.ts, behavior-methods.ts).
 *
 *   A("Home").nav(homeRoutes.index())                    // navigate: push history + show:top
 *   A("Personas").tab(runRoutes.view({ id }, { query })) // switch a sub-view: push history, hold scroll
 *   Button("Save").submit(accountRoutes.update())        // re-render in place (no history/scroll)
 *   Span(n).fragment(ids.userCount, statsRoutes.count()) // sub-region swap
 *   panel.poll(jobRoutes.status({ id }))                 // self-refresh while a job runs
 *   Div(SkeletonCard()).defer(ids.stats, statsRoutes.stats())  // fill in once the page is up
 *   Input().search(userRoutes.list())                    // debounced live filter (newest query wins)
 *   f.select("status", …).onChange(userRoutes.list())    // a control re-renders on change
 *   Form(…).submit(signInRoutes.login(), { invalid: ids.loginForm })  // 422 swaps just the form
 *   Button("Dismiss").fire(tipRoutes.dismiss())          // run it, swap nothing
 *
 * Each verb takes the HTMX produced by a route callable (`routes.x()` / `routes.x({ id })`)
 * and overlays the swap config. Route options (vals, disable, encoding, include) pass through;
 * target/swap/pushUrl/indicator are imposed by the verb, and so is `trigger` on the three verbs that
 * *are* a trigger — `.search` imposes trigger + sync, `.onChange` imposes trigger, `.poll`
 * imposes trigger + target + swap. A button or form source also gets a default `disable`
 * (see below) so every request-triggering button goes disabled in flight. For one-offs that
 * need a different target or `replaceUrl`, drop to raw `.setHtmx(routes.x({ ... }))` — which
 * opts out of the disable too.
 *
 * @module
 */
import { Tag, AnchorTag, ButtonTag, FormTag, isId } from "fluent-html";
import type { HTMX, HxSwap, HxSync, Id, RenderTagged } from "fluent-html";
import { defineIds } from "fluent-html";
export const layoutIds = defineIds(["main-content", "global-loading"] as const);

/**
 * A route the full-layout verbs may aim at: one whose def declares `render: "page"`, or one
 * that declares nothing — **silence means a page**, which is why the template spells `render`
 * out only where the answer is not one. A route declaring a fragment id or `"none"` fails
 * here, at the call site: the half of the swap contract neither the handler nor the verb
 * could see on its own.
 *
 * **Exported because a reusable control has to be able to say this about a prop.** A
 * component that takes a route and applies a verb to it — `SubmitCard({ action })`,
 * `LegalLinks`'s `link(label, route)` — launders the stance if the prop is typed bare
 * `HTMX`: `RenderTagged<S>`'s `render` is optional, so a plain `HTMX` satisfies every
 * verb, and the fragment route passed in by a caller three files away reaches `.nav`
 * with nothing to stop it. Type the prop `PageRoute` and the check moves back to the
 * caller, where the route's real stance is still visible.
 */
export type PageRoute = RenderTagged<"page" | undefined>;

/**
 * A route `.fragment` may aim at: one declaring this exact id.
 *
 * Exported for the same reason as {@link PageRoute}. A control that takes *both* a target
 * and a route must make the id one generic parameter and pin the route to it with
 * `NoInfer`, or `N` infers from both sites at once and widens to their union — which
 * accepts the mismatch the type exists to catch:
 *
 * ```ts
 * function Refresh<N extends string>(p: { target: Id<N>; route: FragmentRoute<NoInfer<N>> }) {
 *   return Button("Refresh").fragment(p.target, p.route);
 * }
 * ```
 */
export type FragmentRoute<N extends string> = RenderTagged<Id<N>>;

/**
 * The property an undeclared route is missing when a fragment verb asks for it.
 *
 * `FragmentRoute<N>` alone cannot reject one: `RenderTagged<S>` declares `render` *optional*,
 * so the `RenderTagged<undefined>` an undeclared route returns is assignable to every stance
 * — all of the template's page routes would sail straight through `.fragment` and `.poll`.
 * The stance is only readable through the type argument, so the verbs infer it (`S`) and
 * intersect this in when it came back `undefined`. Failing on a *missing property* rather than
 * on a conflicting one keeps the message readable and leaves the ordinary wrong-id error
 * (which names both ids) exactly as it was.
 */
type DeclaresNothing = {
  readonly ["this route's def declares no `render` stance — a fragment verb needs `render: ids.…` on it (silence means the route answers a page); an ad-hoc `hx()` url has no def, so it goes through `.setHtmx()`"]: never;
};

/**
 * `unknown` (a no-op in an intersection) for a declared stance; the demand above otherwise.
 *
 * Rejects `unknown` as well as `undefined`, because those are two different silences: `undefined`
 * is a route whose def says nothing, `unknown` is an argument that gave no inference candidate at
 * all — a bare `HTMX` from `hx(url)`, or a route laundered through an `HTMX`-typed local. Both
 * would otherwise pass, and the second is the shape `route-prop-laundering.test.ts` exists to hunt.
 *
 * One silence it cannot see: `cond ? routes.frag() : routes.page()`. TypeScript takes its
 * inference candidate from the first union member, so `S` comes back `Id<"…">` and the undeclared
 * arm is invisible here — closing that needs `render` to be a *required* property on a declared
 * route's bag, which is a fluent-html change, not a template one.
 */
type NeedsStance<S> = unknown extends S
  ? DeclaresNothing
  : [Extract<S, undefined>] extends [never]
    ? unknown
    : DeclaresNothing;

declare module "fluent-html" {
  interface FluentCustomMethods {
    /**
     * Full-layout navigation — morph `#main-content`, scroll window to top, push history.
     * On a non-GET route the pushed url is the request endpoint, so that path must also
     * answer GET (or the handler must send its own `HX-Redirect`/`HX-Push-Url`).
     */
    nav(route: PageRoute, options?: SwapOptions): this;
    /**
     * Sub-view switch — morph `#main-content` and push history, but hold the scroll position.
     *
     * For a control that swaps *part* of the page the reader is already looking at (a section
     * pill, a tabbed panel) while still earning its own URL. `.nav`'s `show:top` would scroll
     * the control out from under the cursor on every click; `.submit` holds the scroll but
     * pushes no history, so the sub-view could be neither shared nor reached with Back.
     */
    tab(route: PageRoute): this;
    /** In-place full-layout re-render — morph `#main-content`, no scroll reset, no history. */
    submit(route: PageRoute, options?: SwapOptions): this;
    /**
     * Fragment swap — morph just `target`, no scroll/history (default swap `outerMorph`).
     *
     * The route must declare the target's id. An undeclared route is rejected too, which is the
     * asymmetry with `.nav`: silence means "a page", and a page swapped into a fragment slot is
     * precisely the failure this contract exists to prevent.
     */
    fragment<N extends string, S>(
      target: Id<N>,
      route: FragmentRoute<NoInfer<N>> & NeedsStance<S> & RenderTagged<S>,
      swap?: OuterSwap,
    ): this;
    /**
     * Self-poll — re-fetch and replace this element on an interval; a re-render without the verb stops it.
     *
     * Takes a fragment route for the same reason `.fragment` does: the swap is `outerHTML` on the
     * poller itself, so a page answer would replace the polled element with a whole app shell.
     * No target argument to match against, so unlike `.fragment` this only says "a fragment,
     * any fragment" — `FragmentRoute<string>` accepts every declared id.
     */
    poll<S>(route: FragmentRoute<string> & NeedsStance<S> & RenderTagged<S>, every?: PollInterval): this;
    /**
     * Deferred region — this element is a placeholder that asks for `route` as soon as it is on
     * the page, and the answer replaces it. The page itself answers without waiting on the data.
     *
     * Stamps `target` as the placeholder's id, so the placeholder and the region it becomes are
     * one id, and the route must declare that id, as with `.fragment`.
     */
    defer<N extends string, S>(
      target: Id<N>,
      route: FragmentRoute<NoInfer<N>> & NeedsStance<S> & RenderTagged<S>,
    ): this;
    /**
     * Debounced live filter — the newest query wins; morphs `#main-content` (or `target`).
     *
     * A trigger gesture, but it still swaps, so it carries the same stance requirement as the
     * verb whose destination it borrows: untargeted it lands in `#main-content` like `.submit`
     * and takes a page; targeted it lands in that id like `.fragment` and takes that fragment.
     */
    search(route: PageRoute, delay?: SearchDelay): this;
    search<N extends string, S>(
      target: Id<N>,
      route: FragmentRoute<NoInfer<N>> & NeedsStance<S> & RenderTagged<S>,
      delay?: SearchDelay,
    ): this;
    /**
     * Re-render on the `change` gesture — morph `#main-content`, sends the whole enclosing form.
     * Same destination as `.submit`, so the same stance: a page.
     */
    onChange(route: PageRoute): this;
    /**
     * Fire-and-forget — run the action, swap nothing (the button still goes disabled in flight).
     *
     * The one verb with no stance requirement, and for a reason rather than by omission: it
     * emits `swap: "none"`, so the answer never reaches the DOM. A `render: "none"` route —
     * a webhook-ish action answering headers only — is exactly what it is for.
     */
    fire(route: HTMX): this;
  }
}

/**
 * The swap styles `.fragment` accepts: outer only, with or without modifiers.
 *
 * An outer swap replaces the target element, so the response is rooted at the target's id and
 * "what this route answers" is one fact. An INNER swap ("innerHTML", "beforeend", …) makes the
 * response the target's *contents*, which must NOT carry that id — the same declaration would
 * have to mean two opposite things. Rather than grow the vocabulary to describe a case the
 * template does not have (zero inner-swap call sites), `.fragment` drops the capability:
 * an inner swap goes through raw `.setHtmx()`, which is uncontracted by design.
 */
type OuterSwap = Extract<HxSwap, `outer${string}`>;

type PollInterval = `${number}s` | `${number}ms`;
type SearchDelay = `${number}ms`;

/** Response-status routing for the full-layout verbs. `invalid` is the 422 (validation) target. */
export type SwapOptions = { invalid?: Id };

// A rejected submit re-renders only the form region, so the rest of #main-content (and the
// user's scroll position in it) survives. Any status bag the route already carries wins —
// this only fills the 422 slot `reply.renderInvalid(…)` answers into.
// `push: false` because a validation failure is not a navigation: `.nav`'s hx-push-url is
// unconditional (htmx pushes on any swapped response), so without this a rejected sign-in
// leaves the browser sitting on the POST-only /auth/signin.
function withInvalidTarget(route: HTMX, options?: SwapOptions): HTMX {
  if (!options?.invalid) return route;
  return {
    ...route,
    status: {
      422: { target: options.invalid.selector, swap: "outerMorph", push: false },
      ...route.status,
    },
  };
}

// Resolved once — selectors, not Id objects, because `.setHtmx(htmx)` stores the HTMX
// verbatim (it does not run resolveSelector the way a route callable does).
const MAIN = layoutIds.mainContent.selector; // "#main-content"
const LOADER = layoutIds.globalLoading.selector; // "#global-loading"

// The one sync a route may bring is a `replace` in another element's queue (`"#region:replace"`):
// newest-wins stays the verb's, and a filter can share one queue with every other request that
// answers the same region (its form's Enter included), so a slow press there cannot land after it.
const newestWins = (sync: HxSync | undefined, queue: HxSync = "replace"): HxSync => (sync?.endsWith(":replace") ? sync : queue);

// One queue for every read that answers the page, held on #main-content, which the morph keeps: a
// newer press aborts the read still out, so the last of several quick presses lands, with one
// history entry. Reads only: an abort stops the browser waiting, never the server, so a write (a
// Save, a Send) keeps its own queue and is never cut off by the press after it. Sound only on a
// bundle carrying htmx#4028 (scripts/vendor-htmx.ts).
const PAGE_QUEUE = `${MAIN}:replace` as const;
const pageQueue = (route: HTMX): HxSync | undefined => (route.method === "get" ? newestWins(route.sync, PAGE_QUEUE) : route.sync);

/** `.nav`'s swap, which a signed-in redirect lands with too (core/server/server.ts). */
export const NAV_SWAP = "outerMorph show:top" satisfies HxSwap;

// Buttons (and a form's buttons) carry `disabled` for the request's duration, so a click
// can't double-fire and `LoaderButton` has a state to render its spinner from. It has to be
// the disabled state, not `.htmx-request`: the verbs point hx-indicator at the global bar,
// and htmx puts the request class on the indicator *instead of* the triggering element.
// `findAll` (not `find`) so a form's real submit button is covered whatever precedes it.
// An explicit `disable` on the route still wins.
function busyWhileRequesting(source: Tag, route: HTMX): HTMX {
  if (route.disable !== undefined) return route;
  if (source instanceof ButtonTag) return { ...route, disable: "this" };
  if (source instanceof FormTag) return { ...route, disable: "findAll button" };
  return route;
}

// A request-triggering <a> has no UA cursor (no href) and Tailwind v4 removed the button
// default — a clickable control that doesn't read as clickable is a silent affordance bug,
// so the click verbs stamp `cursor-pointer` themselves. The call is LITERAL in this file,
// which the safelist prebuild scans (src/**/*.ts), so the class is emitted once for every
// app. An explicit `.cursor(…)` chained BEFORE the verb wins (we skip); one chained after
// only duplicates the class, which the browser ignores.
function keepClickableCursor(tag: Tag) {
  if (!(tag instanceof AnchorTag || tag instanceof ButtonTag)) return;
  if (tag.getClass() && /(?:^|\s)cursor-/.test(tag.getClass() ?? "")) return;
  tag.cursor("pointer");
}

// The no-JS fallback submit reads ONLY the form's `enctype`, while htmx reads
// `hx-encoding` and falls back to the enclosing form's `enctype` when there is none. So the
// half that can go missing is the attribute: a route carrying `encoding` stamps it on the
// <form> too, one source of truth, both halves emitted. An explicit `.setEnctype(...)` set
// before the verb wins, and it drives both paths on a route that declares no `encoding`
// (tests/unit/htmx-grammar-contract.test.ts pins that fallback against the shipped bundle).
function keepFormEncoding(tag: Tag, route: HTMX) {
  if (tag instanceof FormTag && route.encoding && !tag.getEnctype()) tag.setEnctype(route.encoding);
}

// htmx loads deferred, so a form submitted before it starts (or with no JS) takes the
// browser's own route: with no method or action that is a GET to the current page, every
// field (a password included) in the URL. The verb stamps both from its route. A native form
// knows only GET and POST, so a PUT, PATCH or DELETE route posts to its endpoint, which at
// worst answers 404. Chain `.setMethod`/`.setAction` after the verb to override.
function keepFormNativeSubmit(tag: Tag, route: HTMX) {
  if (!(tag instanceof FormTag)) return;
  tag.setMethod(route.method === "get" ? "get" : "post").setAction(route.endpoint);
}

// A bare hx-driven <a> has no href → keyboard/screen-reader/no-JS lockout; hx-get still owns
// the swap. Shared by the two history-pushing verbs, which are the ones anchors reach for.
// Sharing it is the point: a call site that hand-rolled the swap bag would have to remember
// this, and a forgotten href is a keyboard-unreachable control with no visible symptom.
function keepAnchorReachable(tag: Tag, route: HTMX) {
  if (!(tag instanceof AnchorTag)) return;
  if (route.method === "get") tag.setHref(route.endpoint);
  else tag.setRole("button").setTabindex(0);
}

const p = Tag.prototype;

p.nav = function (route: HTMX, options?: SwapOptions) {
  this.setHtmx({
    ...withInvalidTarget(busyWhileRequesting(this, route), options),
    target: MAIN,
    // `show:top` (scrollIntoView on #main-content), not `scroll:top`: #main-content is
    // `min-h-screen` with no max-height, so it never scrolls internally — the window is
    // the scroller. `scroll:top` sets `#main-content.scrollTop=0` (a no-op); `show:top`
    // scrolls the window so #main-content's top hits the viewport top (i.e. page-top).
    // Not htmx 2's `show:window:top`: htmx 4 parses that to show="window:top", which
    // matches neither branch of its scroll handler, so the swap silently never scrolls.
    swap: NAV_SWAP,
    indicator: LOADER,
    // Unconditional, and deliberately not guarded on `route.method`: the history-pushing
    // submit is half of what `.nav` is for (the onboarding wizard, register), and those
    // POSTs are correct only because their path also answers GET. `.nav` sees one resolved
    // route bag, never the route table, so it cannot tell a POST with a GET twin from one
    // without — dropping the push for non-GET would break the working case to guess at the
    // broken one. A POST-only endpoint supplies the address itself: `{ invalid }` covers the
    // 422 half, and the handler's `HX-Redirect`/`HX-Push-Url` the rest (this is why a
    // successful `signInRoutes.signin` does not strand the browser on POST-only /auth/signin).
    pushUrl: true,
    sync: pageQueue(route),
  });
  keepAnchorReachable(this, route);
  keepClickableCursor(this);
  keepFormEncoding(this, route);
  keepFormNativeSubmit(this, route);
  return this;
};

// `.nav` minus the scroll, and that is the whole difference: same `#main-content` morph, same
// pushed history, so the sub-view keeps a shareable, back-navigable URL while the viewport
// stays put. No `SwapOptions`: a 422 belongs to something being submitted, and that is
// `.submit`'s job — a sub-view switch has no validation half to route.
p.tab = function (route: HTMX) {
  this.setHtmx({
    ...busyWhileRequesting(this, route),
    target: MAIN,
    swap: "outerMorph",
    indicator: LOADER,
    pushUrl: true,
    sync: pageQueue(route),
  });
  keepAnchorReachable(this, route);
  keepClickableCursor(this);
  keepFormEncoding(this, route);
  keepFormNativeSubmit(this, route);
  return this;
};

p.submit = function (route: HTMX, options?: SwapOptions) {
  keepClickableCursor(this);
  keepFormEncoding(this, route);
  keepFormNativeSubmit(this, route);
  return this.setHtmx({
    ...withInvalidTarget(busyWhileRequesting(this, route), options),
    target: MAIN,
    swap: "outerMorph",
    indicator: LOADER,
    sync: pageQueue(route),
  });
};

p.fragment = function (target: Id, route: HTMX, swap: OuterSwap = "outerMorph") {
  keepClickableCursor(this);
  keepFormEncoding(this, route);
  keepFormNativeSubmit(this, route);
  return this.setHtmx({
    ...busyWhileRequesting(this, route),
    target: target.selector,
    swap,
    indicator: LOADER,
  });
};

// `sync: "replace"`, not htmx 4's default `"queue first"` (one follow-up queued, every later
// request dropped, so the filter settles on a query the user typed past): the newest query aborts
// the one still out, so it always swaps last. Sound only on a bundle carrying htmx#4028
// (scripts/vendor-htmx.ts); tests/e2e/specs/htmx-smoke.spec.ts holds the row that tells them apart.
// Untargeted, a filter answers the page, so it waits in the page's queue.
// `include: "this"` states what a GET actually collects — from an input, only that input's own
// value — so a filter that must carry siblings passes its own `include` ("closest form" for a
// filter bar, "closest tr" for controls in a bare row), which wins over this default. Written
// as `route.include ?? …` after the spread, never as a default before it: a route callable
// handed any options bag emits `include: undefined`, which a pre-spread default cannot survive.
p.search = function (targetOrRoute: Id | HTMX, routeOrDelay?: HTMX | SearchDelay, delayArg?: SearchDelay) {
  const targeted = isId(targetOrRoute);
  const route = (targeted ? routeOrDelay : targetOrRoute) as HTMX;
  const delay = (targeted ? delayArg : routeOrDelay as SearchDelay | undefined) ?? "300ms";
  keepFormNativeSubmit(this, route);
  return this.setHtmx({
    ...busyWhileRequesting(this, route),
    include: route.include ?? "this",
    trigger: `input changed delay:${delay}`,
    sync: newestWins(route.sync, targeted ? "replace" : PAGE_QUEUE),
    target: targeted ? targetOrRoute.selector : MAIN,
    swap: "outerMorph",
    indicator: LOADER,
  });
};

// `include: "closest form"` is the load-bearing half: htmx 4 resolves `element.form ||
// element.closest("form")` and collects it for POST/PUT/PATCH, but for GET it does not — a
// <select> sends only its own value and a non-control wrapper sends nothing at all, so a
// filter bar drops every other filter the moment one control changes. Same
// `route.include ?? …`-after-the-spread shape as `.search`, and for the same reason.
p.onChange = function (route: HTMX) {
  keepFormNativeSubmit(this, route);
  return this.setHtmx({
    ...busyWhileRequesting(this, route),
    include: route.include ?? "closest form",
    trigger: "change",
    target: MAIN,
    swap: "outerMorph",
    indicator: LOADER,
    sync: pageQueue(route),
  });
};

// htmx 4 swaps EVERY response (only 204/304 skip) — the reverse of htmx 2 — so an action
// whose answer is not meant for the DOM has to say so, or the response body lands in the
// trigger. No target and no indicator: nothing is being replaced, and the button's own
// disabled state already carries the in-flight feedback. `HX-Trigger` response headers still
// run, so a fire-and-forget action can drive an out-of-band update from the server side.
p.fire = function (route: HTMX) {
  keepClickableCursor(this);
  keepFormNativeSubmit(this, route);
  return this.setHtmx({ ...busyWhileRequesting(this, route), swap: "none" });
};

// outerHTML, never a morph: htmx clears an `every` interval only when the polled node
// leaves the DOM. A morph keeps the node (and its timer) alive after the settled
// re-render drops the trigger — the stale tick then fires with no hx-get, fetches the
// page URL, and nests the full document inside the panel, recursively. Replacing the
// node each poll lets the settled swap actually stop the timer. No indicator: a
// background refresh must not flash the global loader.
p.poll = function (route: HTMX, every: PollInterval = "2s") {
  return this.setHtmx({ ...route, trigger: `every ${every}`, target: "this", swap: "outerHTML" });
};

// outerHTML, as `.poll`: the answer is the region itself, same id and no trigger, so one swap
// ends it. Coming back to the page later morphs the loaded region into a fresh placeholder;
// htmx 4 re-processes a node whose hx-* attributes a morph changed, and `load` fires on
// processing, so it fetches again. `sync: "replace"` because a re-render while the region is in
// flight (a filter or sort change) morphs the same node, which keeps its request queue: under
// htmx's default "queue first" the older answer lands, replaces the node, and the newer one
// swaps into a detached node, so the region shows the old query under the new controls.
// No indicator: the placeholder is the in-flight state.
p.defer = function (target: Id, route: HTMX) {
  return this.setId(target)
    .setAria({ busy: true })
    .setHtmx({ ...route, trigger: "load", target: "this", swap: "outerHTML", sync: "replace" });
};
