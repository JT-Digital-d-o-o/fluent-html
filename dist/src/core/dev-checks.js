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
export let devChecks = readDefault();
function readDefault() {
    try {
        return typeof process === "undefined" || process.env?.["NODE_ENV"] !== "production";
    }
    catch {
        return true;
    }
}
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
export function setDevChecks(on) {
    devChecks = on;
}
/** Monotonic render counter — one epoch per `emit`/`emitChunks` call. @internal */
let epoch = 0;
/** Start a new render epoch and return it. @internal */
export function nextRenderEpoch() {
    return ++epoch;
}
/**
 * The mutation gate. Called by every `Tag` primitive that writes to the
 * instance; throws when the write would silently affect markup that has
 * already been serialized, or a parent the caller isn't looking at.
 *
 * @internal
 */
export function assertMutable(tag, method) {
    if (tag._e !== 0) {
        throw new Error(`<${tag.el}>.${method}() mutates a tag that has already been rendered. ` +
            `Tags are mutable builders, so a tag reused across renders accumulates state ` +
            `(a second .bg() appends rather than replaces). Build a fresh tag per render — ` +
            `make the shared value a function and use .apply(preset), not a shared Tag const. ` +
            `Deliberate? setDevChecks(false).`);
    }
    if (tag._p > 1) {
        throw new Error(`<${tag.el}>.${method}() mutates a tag that is a child of ${tag._p} parents. ` +
            `The same instance was passed as a child more than once, so this change applies ` +
            `to all of them. Build a separate tag per parent (a function returning the tag, ` +
            `called once per use). Deliberate? setDevChecks(false).`);
    }
}
/**
 * Record that `children` have been taken as children of a tag, so a later
 * mutation of a shared instance can be identified. Walks nested arrays because
 * `ForEach` and friends hand back an array of tags. Dev-only.
 *
 * @internal
 */
export function countParents(children) {
    for (let i = 0; i < children.length; i++) {
        const c = children[i];
        if (c === null || c === undefined)
            continue;
        if (Array.isArray(c))
            countParents(c);
        else if (typeof c === "object" && c._t === 1) {
            c._p++;
        }
    }
}
//# sourceMappingURL=dev-checks.js.map