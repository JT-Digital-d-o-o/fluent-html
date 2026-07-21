/**
 * The fluent-behaviors client runtime (ADR-03/04/05): capture-phase document
 * delegation computed from EVENT_TABLE (via the test-pinned LISTEN_SET), an
 * innermost-first consumption walk over `[data-behavior]` carriers, the drawer
 * composite with DOM-predicate state, the token+compare-guarded transient
 * helper, and defined skew degrade.
 *
 * No per-element binding, no teardown, no MutationObserver, no client state
 * store — attributes are server-authoritative and any number of swaps/morphs
 * changes nothing about the listener set.
 *
 * SIZE BUDGET (ADR-12, CI-enforced — see scripts/build-behaviors.mjs): built-in handlers
 * read their own `data-behavior-*` attributes directly (no schemas shipped);
 * the generic schema-driven decode exists only for extension verbs and is
 * dead-code-eliminated from the built-ins-only asset via `__FB_HAS_EXT__`.
 * Idioms here are deliberately terse — measure with scripts/build-behaviors.mjs
 * before adding anything.
 *
 * @module
 */
import { LISTEN_SET, HTMX_EVENTS } from "../events.js";
import { BUILTIN_META } from "../specs.js";
import { decodeOptions, verbPrefix } from "../serialize.js";
import { handlers } from "./define.js";
// Null prototype: verb names come from DOM attributes ("constructor" must miss).
const EXT = __FB_HAS_EXT__
    ? Object.assign(Object.create(null), JSON.parse(__FB_EXT_SPECS__))
    : {};
const doc = document;
const HIDDEN = "hidden";
const LOG = "[fluent-behaviors] ";
const DB = "data-behavior";
// ── tiny helpers ─────────────────────────────────────────────────
const byId = (id) => doc.getElementById(id);
const attr = (el, name) => el.getAttribute(name);
const has = (el, cls) => el.classList.contains(cls);
const setCls = (el, cls, on) => {
    el?.classList.toggle(cls, on);
};
/** Attribute getter for a verb's options — built-in handlers pass kebab-case keys. */
function getterFor(carrier, verb) {
    const p = DB + "-" + verbPrefix(verb) + "-";
    return (key) => attr(carrier, p + key);
}
/** Resolve a wire target ("@self" | "closest:<sel>" | id) from `from`. */
function resolveTarget(target, from) {
    if (target == null || target === "@self")
        return from;
    if (target.startsWith("closest:"))
        return from.closest(target.slice(8));
    return byId(target);
}
function defensiveStatus(event) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- htmx 4 beta detail shapes are read defensively (C4)
    const d = event.detail;
    const status = d?.ctx?.response?.status ?? d?.xhr?.status;
    return typeof status === "number" ? status : undefined;
}
/** The mediated extension ctx — only allocated for extension verbs, DCE'd from the built-ins asset. */
function makeFx(event, carrier) {
    return {
        event,
        status: () => defensiveStatus(event),
        resolve: (target, from) => {
            const el = resolveTarget(target, from ?? carrier);
            return el ? [el] : [];
        },
        transient: (el, apply, revert, ms) => {
            tokenTimeout(el, null, ms, () => {
                if (el.isConnected)
                    revert();
            });
            apply();
        },
        after: (ms, f) => {
            setTimeout(() => {
                if (carrier.isConnected)
                    f();
            }, ms);
        },
    };
}
// ── transient helper (token + compare guard) ─────────────────────
const transients = new WeakMap();
/** Stamp a fresh token; run `expire` later only if it is still the active one. */
function tokenTimeout(el, orig, ms, expire) {
    const k = {};
    transients.set(el, { k, o: orig });
    setTimeout(() => {
        const current = transients.get(el);
        if (current && current.k === k) {
            transients.delete(el);
            expire();
        }
    }, ms);
}
function transientText(el, text, ms) {
    const prev = transients.get(el);
    // Double-click safe: a re-invocation keeps the ORIGINAL label, never the feedback text.
    const orig = prev ? prev.o : el.textContent;
    tokenTimeout(el, orig, ms, () => {
        // Compare guard: a mid-feedback morph's fresh server render is never clobbered.
        if (el.textContent === text)
            el.textContent = orig;
    });
    el.textContent = text;
}
let drawer = null;
const drawerOpen = () => drawer !== null && drawer.t.isConnected && has(drawer.t, drawer.c);
/** The FULL close routine — classes, backdrop, body scroll-lock, aria, focus. */
function closeRecord(r) {
    setCls(r.t, r.c, false);
    setCls(r.b, r.c, false);
    if (r.y !== null)
        setCls(doc.body, r.y, false);
    if (r.g.isConnected)
        r.g.setAttribute("aria-expanded", "false");
    const active = doc.activeElement;
    // Restore focus only when it would otherwise be stranded (inside the drawer or gone).
    if (!active || active === doc.body || r.t.contains(active)) {
        (r.g.isConnected ? r.g : doc.body).focus();
    }
    drawer = null;
}
const closeDrawer = () => {
    if (drawer)
        closeRecord(drawer);
};
const focusables = (root) => [...root.querySelectorAll("a[href],button,input,select,textarea,[tabindex]")].filter((el) => !el.disabled && el.tabIndex > -1);
/** Focus trap: one document keydown capture path, guarded by the DOM predicate. */
function trapTab(e) {
    if (e.key !== "Tab" || !drawerOpen() || !drawer.f)
        return false;
    const items = focusables(drawer.t);
    const first = items[0];
    // Nothing focusable inside: trapping is impossible — let Tab proceed rather
    // than becoming a document-wide Tab-killer (the ADR-05 failure class).
    if (!first)
        return false;
    const last = items[items.length - 1];
    const active = doc.activeElement;
    const inside = active !== null && drawer.t.contains(active);
    if (inside && !(e.shiftKey ? active === first : active === last))
        return false;
    e.preventDefault();
    (e.shiftKey ? last : first).focus();
    return true;
}
function eachTarget(o, f) {
    for (const id of (o("target") ?? "").split(" ")) {
        const t = byId(id);
        if (t)
            f(t);
    }
}
function actOn(action, target) {
    if (action === "click") {
        target.click();
        return true;
    }
    if (action === "remove") {
        target.remove();
        return true;
    }
    if (has(target, HIDDEN))
        return false; // hide: already hidden = not acted
    setCls(target, HIDDEN, true);
    return true;
}
const handledRequests = new WeakSet();
// Built-in handlers take the RAW event (no FxCtx allocation on the hot path —
// only extension verbs get the mediated ctx, which the built-ins asset DCEs away).
const builtins = {
    toggle(_el, o) {
        const display = o("display");
        const force = o("force");
        eachTarget(o, (t) => {
            const hide = force === null ? !has(t, HIDDEN) : force === "true";
            setCls(t, HIDDEN, hide);
            if (display !== null)
                t.style.display = hide ? "" : display;
        });
    },
    toggleClass(_el, o) {
        const cls = o("class");
        if (cls == null || cls === "")
            return; // missing-class guard
        const force = o("force");
        eachTarget(o, (t) => t.classList.toggle(cls, force === null ? undefined : force === "true"));
    },
    remove(el, o) {
        const t = resolveTarget(o("target"), el);
        if (!t)
            return;
        const animate = o("animate-out");
        if (animate !== null) {
            setCls(t, animate, true);
            let done = false;
            const finish = () => {
                if (!done) {
                    done = true;
                    t.remove();
                }
            };
            t.addEventListener("transitionend", finish, { once: true });
            setTimeout(finish, Number(o("animate-out-timeout-ms") ?? 400)); // cannot hang without a matching transition
        }
        else {
            t.remove();
        }
    },
    clipboard(el, o) {
        if (!navigator.clipboard) {
            // eslint-disable-next-line no-console -- contracted degrade (acceptance row 18)
            console.warn(LOG + "clipboard unavailable");
            return;
        }
        void navigator.clipboard.writeText(o("value") ?? location.origin + (o("path") ?? "")).catch(() => { });
        const mode = o("feedback-mode");
        if (mode === null)
            return;
        const t = resolveTarget(o("feedback-target"), el);
        if (!t)
            return;
        const ms = Number(o("feedback-duration-ms") ?? 1500);
        const cls = o("feedback-class");
        const text = o("feedback-text");
        if (mode === "class" && cls !== null) {
            tokenTimeout(t, null, ms, () => setCls(t, cls, false));
            setCls(t, cls, true);
        }
        else if (text !== null) {
            transientText(t, text, ms);
        }
    },
    drawer(el, o) {
        const target = byId(o("target") ?? "");
        if (!target)
            return;
        const cls = o("class") ?? "is-open";
        const record = {
            g: el,
            t: target,
            b: byId(o("backdrop") ?? ""),
            c: cls,
            y: o("body-class"),
            o: o("close-on") ?? "escape backdrop nav",
            f: o("trap-focus") === "true",
        };
        if (has(target, cls)) {
            closeRecord(record); // already open (cached or server-rendered): this click closes it
            return;
        }
        closeDrawer(); // at-most-one-open is enforced behavior, not undefined behavior
        setCls(target, cls, true);
        setCls(record.b, cls, true);
        if (record.y !== null)
            setCls(doc.body, record.y, true);
        el.setAttribute("aria-expanded", "true");
        drawer = record;
        if (o("focus-first") === "true")
            focusables(target)[0]?.focus();
    },
    onEscape(el, o, e) {
        if (e.key !== "Escape")
            return false;
        const t = resolveTarget(o("target"), el);
        return t ? actOn(o("action") ?? "", t) : false; // acted => consumed (conditional consumption)
    },
    onClickOutside() {
        return false; // inside clicks never dismiss; the outside scan does the work
    },
    resetOnSuccess(el, _o, e) {
        const form = el.closest("form");
        if (!form || !form.isConnected)
            return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- defensive detail read (C4)
        const ctx = e.detail?.ctx;
        if (ctx && handledRequests.has(ctx))
            return; // once-token: either event order tolerated
        const status = defensiveStatus(e);
        if (status === undefined || status >= 300)
            return; // 422 keeps typed values
        if (ctx)
            handledRequests.add(ctx);
        form.reset();
    },
    back() {
        history.back();
    },
    focus(_el, o) {
        byId(o("target") ?? "")?.focus();
    },
};
// ── dispatch (ADR-04) ─────────────────────────────────────────────
const warnedUnknown = new Set();
/** `[triggers, consume, preventDefault]` for a verb, or undefined when unknown. */
function metaFor(verb) {
    const meta = BUILTIN_META[verb];
    if (meta)
        return meta;
    // Written as a guarded block (not a folded-through local) so esbuild
    // dead-code-eliminates the whole extension path from the built-ins asset.
    if (__FB_HAS_EXT__) {
        const ext = EXT[verb];
        if (ext)
            return [ext.t, ext.c ?? 0, ext.p];
    }
    return undefined;
}
/** Run one verb on one carrier; returns true when the event is consumed. */
function runVerb(carrier, verb, e) {
    const meta = metaFor(verb);
    const get = getterFor(carrier, verb);
    // The override attribute is already emit-time remapped to a listen name.
    const triggers = get("event") ?? meta[0];
    if (!(" " + triggers + " ").includes(" " + e.type + " "))
        return false;
    if (e.type === "mouseover" || e.type === "mouseout") {
        // relatedTarget containment guard — mouseenter/mouseleave emulation.
        const related = e.relatedTarget;
        if (related instanceof Node && carrier.contains(related))
            return false;
    }
    if (meta[2])
        e.preventDefault();
    let opts = get;
    let ctx = e;
    if (__FB_HAS_EXT__) {
        const ext = EXT[verb];
        if (ext) {
            opts = decodeOptions(verb, ext.o, (name) => attr(carrier, name));
            ctx = makeFx(e, carrier);
        }
    }
    const result = handlers[verb](carrier, opts, ctx);
    return result === undefined ? meta[1] === 1 : result;
}
/**
 * Innermost-first ancestor walk (ADR-04): ALL matching verbs on one carrier run
 * in declaration order; consumption halts the walk to OUTER carriers only.
 */
function walk(start, e) {
    let carrier = start?.closest("[" + DB + "]") ?? null;
    while (carrier) {
        let consumed = false;
        for (const verb of (attr(carrier, DB) ?? "").split(" ")) {
            if (!verb)
                continue;
            if (!metaFor(verb) || !handlers[verb]) {
                // Skew degrade (ADR-11): skip + exactly one warn per unknown verb + a mark.
                if (!warnedUnknown.has(verb)) {
                    warnedUnknown.add(verb);
                    // eslint-disable-next-line no-console -- ADR-11 skew degrade: exactly one warn per unknown verb
                    console.warn(LOG + 'unknown verb "' + verb + '" skipped (version skew?)');
                }
                carrier.setAttribute(DB + "-unknown", verb);
                continue;
            }
            if (runVerb(carrier, verb, e))
                consumed = true;
        }
        if (consumed)
            return true;
        carrier = carrier.parentElement?.closest("[" + DB + "]") ?? null;
    }
    return false;
}
function startElement(e) {
    // Shadow valve: dispatch starts from composedPath()[0].
    const origin = e.composedPath()[0] ?? e.target;
    return origin instanceof Element ? origin : origin?.parentElement ?? null;
}
/** Document-scoped onEscape carriers fire with focus anywhere (the v3 bug fix). */
function documentEscape(e, start) {
    for (const carrier of doc.querySelectorAll("[" + DB + '~="onEscape"]')) {
        if (getterFor(carrier, "onEscape")("scope") !== "document")
            continue;
        if (start && carrier.contains(start))
            continue; // the ancestor walk already had its chance
        if (runVerb(carrier, "onEscape", e))
            return true;
    }
    return false;
}
function outsideScan(start) {
    for (const carrier of doc.querySelectorAll("[" + DB + '~="onClickOutside"]')) {
        if ((start && carrier.contains(start)) || has(carrier, HIDDEN))
            continue;
        const o = getterFor(carrier, "onClickOutside");
        const t = resolveTarget(o("target"), carrier);
        const action = o("action");
        if (t && action !== null)
            actOn(action, t);
    }
}
function dispatch(e) {
    const start = startElement(e);
    if (e.type === "keydown" && trapTab(e))
        return;
    const consumed = walk(start, e);
    if (e.type === "click") {
        outsideScan(start); // clicks elsewhere dismiss even when consumed there
        if (!consumed && drawerOpen() && drawer.o.includes("backdrop") && drawer.b && start && drawer.b.contains(start)) {
            closeDrawer();
        }
    }
    if (!consumed && e.type === "keydown" && e.key === "Escape") {
        // ADR-05 precedence: carriers inside the drawer had their chance in the walk;
        // past that, the open drawer's close path runs BEFORE document-scoped
        // onEscape carriers elsewhere on the page (which sit behind the overlay).
        if (drawerOpen() && drawer.o.includes("escape"))
            closeDrawer();
        else
            documentEscape(e, start);
    }
}
// ── htmx lifecycle (C4: the only two htmx literals, read defensively) ──
function lifecycleStart(e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- defensive detail read (C4)
    const d = e.detail;
    const elt = d?.elt ?? d?.ctx?.elt;
    return elt instanceof Element ? elt : startElement(e);
}
const lifecycleWalk = (e) => {
    walk(lifecycleStart(e), e);
};
function onAfterSwap(e) {
    // Reconciliation sweep: cache exists but target no longer connected-and-open
    // → full close (kills dangling focus traps, unlocks scroll).
    if (drawer && !drawerOpen())
        closeDrawer();
    // Close-on-nav, GATED: containing swap or pushUrl navigation — never background polls.
    if (drawer && drawer.o.includes("nav")) {
        const swapTarget = e.target instanceof Element ? e.target : null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- defensive detail read (C4)
        const d = e.detail;
        const pushUrl = d?.ctx?.pushUrl ?? d?.pushUrl;
        const contains = swapTarget !== null && (swapTarget.contains(drawer.t) || swapTarget.contains(drawer.g));
        if (contains || (pushUrl != null && pushUrl !== false))
            closeDrawer();
    }
    lifecycleWalk(e);
}
// ── boot ──────────────────────────────────────────────────────────
let booted = false;
export function boot() {
    if (booted)
        return;
    booted = true;
    Object.assign(handlers, builtins); // before any extension module evaluates
    // Skew handshake (ADR-11): assert the server stamp against embedded values.
    const stamp = attr(doc.documentElement, "data-fluent-behaviors");
    const own = __FB_VERSION__ + ":" + __FB_HASH__;
    if (stamp !== null && stamp !== own) {
        // eslint-disable-next-line no-console -- ADR-11 handshake: one loud error on hash mismatch
        console.error(LOG + "runtime " + own + " != page stamp " + stamp + " (deploy skew)");
    }
    for (const type of LISTEN_SET)
        doc.addEventListener(type, dispatch, true);
    // Registered unconditionally — inert without htmx (templates/web profile).
    doc.addEventListener(HTMX_EVENTS.afterSwap, onAfterSwap, true);
    doc.addEventListener(HTMX_EVENTS.afterRequest, lifecycleWalk, true);
}
//# sourceMappingURL=runtime.js.map