/**
 * Development-mode structural guards for the mutable builder.
 *
 * `Tag` is a mutable builder: every fluent method writes to the instance and
 * returns it. That is what makes the chain fast (no copying, no allocation per
 * link), but it leaves two shapes that are wrong and silent:
 *
 * ```ts
 * const SHARED = Div("x").p("4");        // module scope, reused per request
 * render(SHARED.bg("red-500"))           // <div class="p-4 bg-red-500">
 * render(SHARED.bg("blue-500"))          // <div class="p-4 bg-red-500 bg-blue-500">
 *
 * const child = Span("hi");
 * const a = Div(child), b = Div(child);  // one instance, two parents
 * child.text("lg");                      // silently changes both
 * ```
 *
 * Neither is catchable by types (the chain is legal) and both survive to
 * production as drifting markup. These guards make them throw at the point of
 * mutation, in development only. Presets are functions for exactly this reason
 * (`.apply(card)`, not a shared `const card = Div()`); the guards enforce what
 * the docs already teach.
 *
 * Two independent facts about a tag are tracked, both dev-only:
 *
 * - `_e` — the render epoch the tag was last serialized in. Non-zero means it
 *   has been rendered, so a later mutation is a mutate-after-render.
 * - `_p` — how many parents have taken it as a child. Greater than one means
 *   the instance is aliased, so a mutation reaches every parent.
 *
 * Re-rendering an unmutated tag stays legal (a cached fragment is fine), and so
 * does a shared-but-never-mutated child, which is the documented non-thunk
 * `Intersperse` separator form.
 *
 * @module
 */
/**
 * Whether the structural guards run. Defaults to on outside
 * `NODE_ENV=production`. This is a live binding — read it directly at the call
 * site so `setDevChecks` takes effect without a re-import.
 *
 * @internal
 */
export declare let devChecks: boolean;
/**
 * Turn the development-mode structural guards on or off.
 *
 * They are on by default outside `NODE_ENV=production` and cost one boolean
 * test per mutation. Disable them if you deliberately build, render, and then
 * mutate and re-render the same tree.
 *
 * @example
 * import { setDevChecks } from "fluent-html";
 * setDevChecks(false);
 */
export declare function setDevChecks(on: boolean): void;
/** Start a new render epoch and return it. @internal */
export declare function nextRenderEpoch(): number;
/**
 * The mutation gate. Called by every `Tag` primitive that writes to the
 * instance; throws when the write would silently affect markup that has
 * already been serialized, or a parent the caller isn't looking at.
 *
 * @internal
 */
export declare function assertMutable(tag: {
    el: string;
    _e: number;
    _p: number;
}, method: string): void;
/**
 * Record that `children` have been taken as children of a tag, so a later
 * mutation of a shared instance can be identified. Walks nested arrays because
 * `ForEach` and friends hand back an array of tags. Dev-only.
 *
 * @internal
 */
export declare function countParents(children: readonly unknown[]): void;
//# sourceMappingURL=dev-checks.d.ts.map