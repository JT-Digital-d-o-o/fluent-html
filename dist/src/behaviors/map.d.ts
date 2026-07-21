/**
 * The typed behavior vocabulary — `BehaviorMap` is declaration-mergeable so the
 * framework layer can add `jt:` namespaced verbs (ADR-07 amendment: apps never
 * register; new verbs enter via a framework PR + template bump).
 *
 * `.behavior()` emits flat `data-behavior-*` attributes only (ADR-01) — zero
 * inline JS, executable under strict per-request-nonce CSP. The verbs are
 * executed by the versioned runtime asset (`dist/fluent-behaviors.<version>.js`).
 *
 * @module
 */
import type { Id } from "../ids.js";
import type { BehaviorEvent } from "./events.js";
/**
 * Where a verb acts:
 *  - an `Id` from `defineIds` (serialized as the raw id),
 *  - `"@self"` — the carrier element itself,
 *  - `{ closest: "<selector>" }` — the nearest matching ancestor
 *    (replaces the positionally-fragile `@parent`).
 */
export type BehaviorTarget = Id | "@self" | {
    closest: string;
};
/**
 * The 10 built-in verbs (ADR-09), each justified by named call sites.
 * Overlap rule (one blessed path per situation): `drawer` for overlay bundles;
 * `toggle` for simple show/hide; `onClickOutside` for non-overlay dismissal.
 * Modal dialogs are NOT behaviors — use `setCommand`/`setCommandfor` +
 * `<dialog>` `setClosedby` (ADR-06).
 */
export interface BehaviorMap {
    /**
     * Show/hide by toggling the `hidden` class on one or more targets.
     * `display` additionally sets `style.display` to the given value when shown
     * (for elements whose visible state isn't `display: block`).
     * `force: true` hides, `force: false` shows.
     */
    toggle: {
        target: Id | readonly Id[];
        force?: boolean;
        display?: string;
        event?: BehaviorEvent;
    };
    /** Toggle an arbitrary class on one or more targets. */
    toggleClass: {
        target: Id | readonly Id[];
        class: string;
        force?: boolean;
        event?: BehaviorEvent;
    };
    /**
     * Remove the target element. `animateOut` adds the class first and removes on
     * `transitionend`, with an `animateOutTimeoutMs` fallback (default 400ms) so a
     * missing transition can never leave the element hanging.
     */
    remove: {
        target: BehaviorTarget;
        animateOut?: string;
        animateOutTimeoutMs?: number;
        event?: BehaviorEvent;
    };
    /**
     * Copy `value` (or the origin-resolved `path`) to the clipboard, with optional
     * transient feedback: `mode: "text"` swaps the feedback target's text,
     * `mode: "class"` adds a class; both restore after `durationMs` (default 1500)
     * unless a fresh server render replaced the value (compare-guarded).
     * Feedback target defaults to `"@self"`.
     */
    clipboard: {
        value?: string;
        path?: string;
        feedback?: {
            target?: BehaviorTarget;
            mode: "text" | "class";
            text?: string;
            class?: string;
            durationMs?: number;
        };
    };
    /**
     * The one stateful composite (ADR-05): non-modal/responsive overlays — open
     * class (+ backdrop + body scroll-lock + aria-expanded + focus management) as
     * ONE atomic verb. At most one drawer is open; opening another fully closes
     * the first. `class` defaults to `"is-open"`; `closeOn` defaults to all of
     * `["escape", "backdrop", "nav"]`. Modal dialogs are native (ADR-06).
     */
    drawer: {
        target: Id;
        class?: string;
        backdrop?: Id;
        bodyClass?: string;
        closeOn?: readonly ("escape" | "backdrop" | "nav")[];
        trapFocus?: boolean;
        focusFirst?: boolean;
    };
    /**
     * Escape-key handling: `click` a target (e.g. a cancel button), `remove` or
     * `hide` it. `scope: "document"` fires regardless of where focus is (the v3
     * `dismissOnEscape` focus-scope bug is fixed by using it); default `"self"`.
     */
    onEscape: {
        action: "click" | "remove" | "hide";
        target?: BehaviorTarget;
        scope?: "self" | "document";
    };
    /** Dismiss when a click lands outside the carrier. Target defaults to `"@self"`. */
    onClickOutside: {
        action: "hide" | "remove" | "click";
        target?: BehaviorTarget;
    };
    /**
     * `form.reset()` after a successful (< 300) htmx request from this form.
     * A 422 re-render keeps typed values; a full-layout morph replacing the form
     * is a defined no-op (the server rendered the fresh form).
     */
    resetOnSuccess: void;
    /** `history.back()` — default-prevented, so it works on `<a>` too. */
    back: void;
    /** Focus the target element. */
    focus: {
        target: Id;
    };
}
export type BehaviorName = keyof BehaviorMap;
declare module "../core/tag.js" {
    interface Tag {
        /**
         * Attach a typed client-side behavior. Emits flat `data-behavior-*`
         * attributes executed by the fluent-behaviors runtime asset — no inline JS,
         * strict-CSP-safe. Multiple verbs on one element run in declaration order;
         * the same verb twice on one element throws at render.
         *
         * @example
         * Button("Menu").behavior("drawer", { target: ids.mobileMenu, backdrop: ids.menuBackdrop, trapFocus: true })
         * Button("Copy").behavior("clipboard", { path: invitePath, feedback: { mode: "text", text: "Copied!" } })
         * A("← Back").behavior("back").cursor("pointer")
         */
        behavior<K extends BehaviorName>(name: K, ...args: BehaviorMap[K] extends void ? [] : [options: BehaviorMap[K]]): this;
    }
}
//# sourceMappingURL=map.d.ts.map