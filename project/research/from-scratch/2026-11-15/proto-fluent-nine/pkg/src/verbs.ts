/**
 * The swap verbs, shipped in the package (fluent-html 8 kept them in the template's
 * `swap-verbs.ts`). Behaviour is the template's, unchanged; the layout ids are configurable.
 *
 *   A("Home").nav(homeRoutes.index())                    // navigate: morph #main-content, push, scroll top
 *   A("Details").tab(runRoutes.view({ id }))             // a sub-view: same, without the scroll
 *   Button("Save").submit(accountRoutes.update())        // in place: no push, no scroll
 *   Span(n).fragment(ids.userCount, statsRoutes.count()) // one region
 *   panel.poll(jobRoutes.status({ id }))                 // self-refresh while it renders the verb
 *   Div(Skeleton()).defer(ids.stats, statsRoutes.stats())
 *   Input().search(ids.list, routes.rows())              // debounced filter, newest query wins
 *   Select(...).onChange(routes.list())                  // a control re-renders the page
 *   Form(...).submit(routes.create(), { invalid: ids.form })  // a 422 swaps only the form
 *   Button("Dismiss").fire(tipRoutes.dismiss())          // run it, swap nothing
 *
 * @module
 */
import { Tag } from "./core/tag.js";
import { AnchorTag } from "./elements/links.js";
import { ButtonTag, FormTag } from "./elements/forms.js";
import { defineIds, isId } from "./ids.js";
import type { Id } from "./ids.js";
import type { HTMX, HxSwap, HxSync } from "./htmx.js";
import type { RenderTagged } from "./routes.js";

/** The layout's ids: `#main-content` (the page region every page verb morphs) and the loading bar. */
export const layoutIds = defineIds(["main-content", "global-loading"] as const);

/** A route a page verb may aim at: one whose def declares no `render` stance (silence means a page). */
export type PageRoute = RenderTagged<"page" | undefined>;
/** A route `.fragment` / `.poll` / `.defer` may aim at: one declaring `render: ids.<N>`. */
export type FragmentRoute<N extends string> = RenderTagged<Id<N>>;

type DeclaresNothing = {
  readonly ["this route's def declares no `render` stance: a fragment verb needs `render: ids.…` on it (silence means the route answers a page); an ad-hoc `hx()` url has no def, so it goes through `.setHtmx()`"]: never;
};
type NeedsStance<S> = unknown extends S ? DeclaresNothing : [Extract<S, undefined>] extends [never] ? unknown : DeclaresNothing;

type OuterSwap = Extract<HxSwap, `outer${string}`>;
type PollInterval = `${number}s` | `${number}ms`;
type SearchDelay = `${number}ms`;

/** `{ invalid: ids.form }`: a 422 answer swaps into that region, with no history push. */
export type SwapOptions = { invalid?: Id };

declare module "./core/tag.js" {
  interface Tag {
    /** Navigate: morph `#main-content`, push the URL, scroll to top. Links and history-pushing forms. */
    nav(route: PageRoute, options?: SwapOptions): this;
    /** A sub-view of this page (tabs, pills): `.nav` without the scroll. */
    tab(route: PageRoute): this;
    /** An in-place form or action: morph `#main-content`, no push, no scroll. */
    submit(route: PageRoute, options?: SwapOptions): this;
    /** Swap one region: the route must declare `render: <the same id>`. */
    fragment<N extends string, S>(target: Id<N>, route: FragmentRoute<NoInfer<N>> & NeedsStance<S> & RenderTagged<S>, swap?: OuterSwap): this;
    /** Re-fetch this region every interval while it renders with `.poll`; render it without to stop. */
    poll<S>(route: FragmentRoute<string> & NeedsStance<S> & RenderTagged<S>, every?: PollInterval): this;
    /** Load this region after the page: a placeholder that fetches its fragment on load. */
    defer<N extends string, S>(target: Id<N>, route: FragmentRoute<NoInfer<N>> & NeedsStance<S> & RenderTagged<S>): this;
    /** A debounced live filter (newest query wins), answering the page or one region. */
    search(route: PageRoute, delay?: SearchDelay): this;
    search<N extends string, S>(target: Id<N>, route: FragmentRoute<NoInfer<N>> & NeedsStance<S> & RenderTagged<S>, delay?: SearchDelay): this;
    /** A control that re-renders the page on change, sending its whole form. */
    onChange(route: PageRoute): this;
    /** Run the request and swap nothing. */
    fire(route: HTMX): this;
  }
}

let MAIN: string = layoutIds.mainContent.selector;
let LOADER: string = layoutIds.globalLoading.selector;

/** Point the verbs at the app's layout ids, once at startup (defaults: `main-content`, `global-loading`). */
export function configureVerbs(config: { main?: Id; indicator?: Id }): void {
  if (config.main) MAIN = config.main.selector;
  if (config.indicator) LOADER = config.indicator.selector;
}

function withInvalidTarget(route: HTMX, options?: SwapOptions): HTMX {
  if (!options?.invalid) return route;
  return { ...route, status: { 422: { target: options.invalid.selector, swap: "outerMorph", push: false }, ...route.status } };
}

const newestWins = (sync: HxSync | undefined, queue: HxSync = "replace"): HxSync => (sync?.endsWith(":replace") ? sync : queue);
const pageQueue = (route: HTMX): HxSync | undefined => (route.method === "get" ? newestWins(route.sync, `${MAIN}:replace` as HxSync) : route.sync);

export const NAV_SWAP = "outerMorph show:top" satisfies HxSwap;

function busyWhileRequesting(source: Tag, route: HTMX): HTMX {
  if (route.disable !== undefined) return route;
  if (source instanceof ButtonTag) return { ...route, disable: "this" };
  if (source instanceof FormTag) return { ...route, disable: "findAll button" };
  return route;
}

// A request-triggering <a> has no UA cursor and Tailwind 4 removed the button default. A class
// the element already has is not written twice (fluent-html 9's class merge).
function keepClickableCursor(tag: Tag) {
  if (!(tag instanceof AnchorTag || tag instanceof ButtonTag)) return;
  if (/(?:^|\s)cursor-/.test(tag.getClass() ?? "")) return;
  tag._cls("cursor-pointer");
}

function keepFormEncoding(tag: Tag, route: HTMX) {
  if (tag instanceof FormTag && route.encoding && !tag.getEnctype()) tag.setEnctype(route.encoding);
}

function keepFormNativeSubmit(tag: Tag, route: HTMX) {
  if (!(tag instanceof FormTag)) return;
  tag.setMethod(route.method === "get" ? "get" : "post").setAction(route.endpoint);
}

function keepAnchorReachable(tag: Tag, route: HTMX) {
  if (!(tag instanceof AnchorTag)) return;
  if (route.method === "get") tag.setHref(route.endpoint);
  else tag.setRole("button").setTabindex(0);
}

const p = Tag.prototype;

p.nav = function (route: HTMX, options?: SwapOptions) {
  this.setHtmx({
    ...withInvalidTarget(busyWhileRequesting(this, route), options),
    target: MAIN, swap: NAV_SWAP, indicator: LOADER, pushUrl: true, sync: pageQueue(route),
  });
  keepAnchorReachable(this, route);
  keepClickableCursor(this);
  keepFormEncoding(this, route);
  keepFormNativeSubmit(this, route);
  return this;
};

p.tab = function (route: HTMX) {
  this.setHtmx({ ...busyWhileRequesting(this, route), target: MAIN, swap: "outerMorph", indicator: LOADER, pushUrl: true, sync: pageQueue(route) });
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
  return this.setHtmx({ ...withInvalidTarget(busyWhileRequesting(this, route), options), target: MAIN, swap: "outerMorph", indicator: LOADER, sync: pageQueue(route) });
};

p.fragment = function (target: Id, route: HTMX, swap: OuterSwap = "outerMorph") {
  keepClickableCursor(this);
  keepFormEncoding(this, route);
  keepFormNativeSubmit(this, route);
  return this.setHtmx({ ...busyWhileRequesting(this, route), target: target.selector, swap, indicator: LOADER });
};

p.search = function (targetOrRoute: Id | HTMX, routeOrDelay?: HTMX | SearchDelay, delayArg?: SearchDelay) {
  const targeted = isId(targetOrRoute);
  const route = (targeted ? routeOrDelay : targetOrRoute) as HTMX;
  const delay = (targeted ? delayArg : (routeOrDelay as SearchDelay | undefined)) ?? "300ms";
  keepFormNativeSubmit(this, route);
  return this.setHtmx({
    ...busyWhileRequesting(this, route),
    include: route.include ?? "this",
    trigger: `input changed delay:${delay}`,
    sync: newestWins(route.sync, targeted ? "replace" : (`${MAIN}:replace` as HxSync)),
    target: targeted ? targetOrRoute.selector : MAIN,
    swap: "outerMorph",
    indicator: LOADER,
  });
};

p.onChange = function (route: HTMX) {
  keepFormNativeSubmit(this, route);
  return this.setHtmx({ ...busyWhileRequesting(this, route), include: route.include ?? "closest form", trigger: "change", target: MAIN, swap: "outerMorph", indicator: LOADER, sync: pageQueue(route) });
};

p.fire = function (route: HTMX) {
  keepClickableCursor(this);
  keepFormNativeSubmit(this, route);
  return this.setHtmx({ ...busyWhileRequesting(this, route), swap: "none" });
};

// outerHTML, never a morph: htmx clears an `every` interval only when the polled node leaves the DOM.
p.poll = function (route: HTMX, every: PollInterval = "2s") {
  return this.setHtmx({ ...route, trigger: `every ${every}`, target: "this", swap: "outerHTML" });
};

p.defer = function (target: Id, route: HTMX) {
  return this.setId(target).setAria({ busy: true }).setHtmx({ ...route, trigger: "load", target: "this", swap: "outerHTML", sync: "replace" });
};
