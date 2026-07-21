# Behavior System v4 — Final Design

> Produced by a 14-agent research workflow (evidence -> precedent -> 3 competing designs -> 3 adversarial attack lenses -> synthesis), 2026-07-20.
> See [decision-records.md](decision-records.md) for the ADRs that settle each load-bearing choice — **do not re-litigate them without new evidence**; that re-litigation is how v1 -> v2 -> v3 happened.

## Verdict

UPSTREAM wins. It took first place on two of the three attack lenses (CSP/security/C7 and DX/extensibility), its call-site API is byte-identical to what every repo already writes (the entire migration story), its flat attribute grammar needs no client-side parser and keeps the widest escaping margin, and its composite drawer verb is atomic — the #1 gap-list item cannot be half-assembled, which is exactly where Bedrock failed outright (five uncoordinated pieces, no home for the responsive-sidebar shape, closedby not cross-browser). Every finding against UPSTREAM proved patchable without touching the wire format. Grafts taken: from fx — the single-source event table (TS union and runtime listener set generated from one const, killing the keyup-style drift UPSTREAM's own spec already contained), DOM-predicate state with the slot demoted to a cache, handler-return consumption semantics for nested carriers, mandatory per-verb fixtures feeding a mechanically enumerated matrix(), the mediated FxCtx, the compare-guarded transient helper, and boot-time assembly of a content-hashed runtime asset; from Bedrock — external version-stamped static-asset delivery (replacing UPSTREAM's inline nonce'd runtime, closing the nonce-replay/cache blast radius and the app-source-through-Script()-body injection surface), the boot-time server-to-client registry handshake, the framework-layer static serving split, and the formalized native-dialog boundary (setClosedby joins setCommand/setCommandfor; modals are platform, drawer verb owns non-modal/responsive overlays). Every confirmed attack finding is incorporated as a required fix below; misread findings dropped: the JSON-injection breakout (verified structurally sound, moot anyway since flat attributes won), and fx's claimed per-path drawer morph divergence (idiomorph attribute-sync closes it on all paths — the corrected always-closes contract is what the matrix pins).

## Emission Format

GRAMMAR (frozen per major — see ADR-01):
(1) data-behavior = ordered space-separated verb tokens. Built-ins camelCase; extensions <ns>:<verb>. Duplicate same-verb on one element throws at render.
(2) Option attributes: data-behavior-<kebab(verb)>-<kebab(optionPath)>; extension ns kebabs with a double hyphen (jt:listboxNav -> data-behavior-jt--listbox-nav-*). Nested option groups flatten (feedback.durationMs -> -feedback-duration-ms).
(3) Serialization table: string identity (normal HTML-attribute escaping — no escapeJs anywhere in the behavior path); Id -> id string; Id[]/string[] -> space-separated; boolean -> "true"/"false"; number -> decimal; enum -> literal; BehaviorTarget = Id | "@self" | {closest: string}, serialized as the id | "@self" | "closest:<selector>". "@self" is forbidden as a defineIds value.
(4) event? overrides resolve at emit time against the closed EVENT_TABLE union (focus->focusin, blur->focusout, mouseenter->mouseover, mouseleave->mouseout server-side; the runtime has no remap table).

EMITTED HTML EXAMPLES:

Toggle (ttl settings danger section):
<button data-behavior="toggle" data-behavior-toggle-target="delete-section">Danger zone</button>

Drawer (the 4x hand-rolled composite — rideshare/ttl/web mobile menu):
<button aria-expanded="false" data-behavior="drawer"
  data-behavior-drawer-target="mobile-menu"
  data-behavior-drawer-class="is-open"
  data-behavior-drawer-backdrop="menu-backdrop"
  data-behavior-drawer-body-class="overflow-hidden"
  data-behavior-drawer-close-on="escape backdrop nav"
  data-behavior-drawer-trap-focus="true"
  data-behavior-drawer-focus-first="true">Menu</button>

Clipboard with transient feedback (all 6 inventory sites):
<button data-behavior="clipboard"
  data-behavior-clipboard-path="/invite/8f3k"
  data-behavior-clipboard-feedback-mode="text"
  data-behavior-clipboard-feedback-text="Copied!"
  data-behavior-clipboard-feedback-duration-ms="1500">Copy invite link</button>

Keyboard verb — Escape-to-cancel (ttl time-entry:679):
<form data-behavior="onEscape"
  data-behavior-on-escape-action="click"
  data-behavior-on-escape-target="cancel-entry"
  data-behavior-on-escape-scope="self">…</form>

After-swap-success hook (rideshare settings:266/343, roadmap #52):
<form data-behavior="resetOnSuccess" hx-post="/settings/password">…</form>

Relative-target remove (Alert.ts:60 onclick replacement — {closest} replaces the positionally-fragile @parent):
<button data-behavior="remove" data-behavior-remove-target="closest:[role=alert]">×</button>

Framework-pack behavior (listbox nav, jt: namespace per ADR-07 amendment — apps consume, never register):
<input data-behavior="jt:listboxNav"
  data-behavior-jt--listbox-nav-list="ac-results"
  data-behavior-jt--listbox-nav-item-selector="[role=option]">

Two behaviors on one element (declaration order preserved):
<button data-behavior="toggleClass clipboard"
  data-behavior-toggle-class-target="tooltip-1"
  data-behavior-toggle-class-class="tooltip-visible"
  data-behavior-clipboard-value="+386 40 123 456">+386 40 123 456</button>

Native tier (NOT a behavior — modal dialogs, ADR-06):
<button type="button" command="show-modal" commandfor="confirm-dialog">Delete…</button>
<dialog id="confirm-dialog" closedby="any">…</dialog>

## Runtime Architecture

SHIPPING: authored in TS at src/behaviors/client/, built at publish to dist/fluent-behaviors.<pkgVersion>.js. The FRAMEWORK LAYER (never apps — ADR-07 amendment) runs the library-shipped buildBehaviorRuntime() (esbuild, browser target) once at template/framework build, producing fluent-behaviors.<pkgVersion>.<registryHash>.js from core + compiled framework-pack handler entries; apps consume the prebuilt asset. Delivery: ONE nonce'd <script defer src> in the initial layout head under strict-dynamic; the asset is served with immutable cache headers by @fluent-html/fastify, which registers route + head helper atomically and enables X-Fluent-Behaviors refresh-on-mismatch by default. Never inline per-request, never inside swap targets. Dev guard: the head helper throws at render if the asset route is absent.

BINDING: capture-phase document delegation, listener set computed from EVENT_TABLE at startup: click, dblclick, change, input, submit, keydown, focusin, focusout, mouseover, mouseout (relatedTarget containment guard for enter/leave emulation), plus the two HTMX_EVENTS listeners (htmx:after:request, htmx:after:swap) registered unconditionally — inert without htmx, so templates/web runs the full non-lifecycle vocabulary with no htmx runtime (its dead mobile-menu toggle comes alive). Shadow valve: dispatch starts from composedPath()[0].

DISPATCH (ADR-04): walk ancestors via closest('[data-behavior]'), innermost first; per carrier, run each verb whose (possibly overridden) trigger matches, in declaration order; a handler returning true consumes the event and halts the walk. Click-triggered built-ins consume by default; keyboard verbs consume conditionally (acted => consumed). Per-verb preventDefault from the registry (back keeps it; behaviors on <a href> documentedly navigate unless the verb declares it).

IDEMPOTENCE / MORPH SURVIVAL (C2, ADR-03): no per-element binding, no connect/disconnect, no observers — N swaps/morphs change nothing about the listener set. Attributes are server-authoritative; client-toggled classes revert on any re-render of their element, uniformly on all idiomorph paths (attribute-sync strips them even under node-identity preservation) — the pinned contract is 'always reverts/closes', tested, not per-path divergence.

DRAWER (ADR-05, the one stateful composite): truth = DOM predicate (target.isConnected && has open class); the module-level record {trigger, target, backdrop, bodyClass, trapFocus} is a cache only. Open routine: fully close any open drawer first (at-most-one-open enforced), then apply classes, aria-expanded=true, focus-first, arm trap. Full close routine: remove open class, backdrop class, bodyClass from <body>; trigger aria-expanded=false if connected; restore focus to trigger if connected else document.body; clear cache. Close-on-nav GATED: on htmx:after:swap close only if the swap target contains the drawer/trigger OR the request was pushUrl-bearing (defensive detail read) — background polls never close it. Reconciliation sweep on every after:swap: if the cache exists but its target is no longer connected-and-open, run the full close routine (kills dangling focus traps after history restore / external removal, unlocks scroll). Focus trap = one document keydown capture listener guarded by the DOM predicate; Escape precedence: open drawer's close path runs first and consumes.

RESETONSUCCESS: document-level htmx:after:request listener (plus an after:swap fallback with a per-request once-token, tolerating either event order — pinned by C7 rows): resolve the form from detail.ctx trigger element falling back to event target closest('form[data-behavior~=resetOnSuccess]'); if form.isConnected && status < 300 -> form.reset(). 422 keeps typed values; full-layout morph replacing the form is a defined no-op (server rendered the fresh form).

TRANSIENT HELPER (clipboard feedback and any transient text/class): WeakMap<Element,{token, appliedValue}>; a new invocation cancels the prior token (double-click safe); restore only fires if the current value still equals appliedValue (a mid-feedback morph's fresh server render is never clobbered).

RUNTIME BUG FIXES carried from the v3 audit, now contracted: onEscape default document-scope option available (fixes focus-scoped dismissOnEscape); remove+animateOut transitionend {once:true} + animateOutTimeoutMs fallback (default 400ms — cannot hang); toggleClass guards missing class attr; clipboard degrades to no-op + console.warn with feedback suppressed when navigator.clipboard is absent.

SKEW DEGRADE (ADR-11): unknown verb -> skip + exactly one console.warn + data-behavior-unknown mark; unknown options ignored; runtime asserts the <html data-fluent-behaviors="<version>:<registryHash>"> stamp against its own embedded values, one loud console.error on mismatch.

HTMX COUPLING (C4): exactly two literal names in one HTMX_EVENTS const; detail reads defensive; no registerExtension, no handle_swap, no hx-on, no inlineScriptNonce. TEARDOWN: none by construction; timers are token-guarded no-ops after element replacement; htmx:before:cleanup deliberately unused.

SIZE BUDGET (CI-enforced): core dispatcher + 10 verbs + drawer + transient helper <= 5KB min / <= 2.2KB gz (estimate ~4KB/~1.8KB). The '~1KB' slogan is retired; the asset is immutable-cached so the honest number is paid once.

## Typing & Registry

// src/behaviors/events.ts — SINGLE SOURCE (ADR-10)
export const EVENT_TABLE = {
  click:{listen:"click"}, dblclick:{listen:"dblclick"}, change:{listen:"change"},
  input:{listen:"input"}, submit:{listen:"submit"}, keydown:{listen:"keydown"},
  focus:{listen:"focusin"}, blur:{listen:"focusout"}, focusin:{listen:"focusin"}, focusout:{listen:"focusout"},
  mouseenter:{listen:"mouseover",relatedGuard:true}, mouseleave:{listen:"mouseout",relatedGuard:true},
} as const satisfies Record<string, EventBinding>;
export type BehaviorEvent = keyof typeof EVENT_TABLE;           // union == listener capability, always
export const HTMX_EVENTS = { afterSwap: "htmx:after:swap", afterRequest: "htmx:after:request" } as const;
export type LifecycleEvent = keyof typeof HTMX_EVENTS;

// src/behaviors/map.ts — declaration-mergeable (C3)
export type BehaviorTarget = Id | "@self" | { closest: string };
export interface BehaviorMap {
  toggle:      { target: Id | readonly Id[]; force?: boolean; display?: string; event?: BehaviorEvent };
  toggleClass: { target: Id | readonly Id[]; class: string; force?: boolean; event?: BehaviorEvent };
  remove:      { target: BehaviorTarget; animateOut?: string; animateOutTimeoutMs?: number; event?: BehaviorEvent };
  clipboard:   { value?: string; path?: string; feedback?: { target?: BehaviorTarget; mode: "text" | "class"; text?: string; class?: string; durationMs?: number } };
  drawer:      { target: Id; class?: string; backdrop?: Id; bodyClass?: string; closeOn?: readonly ("escape" | "backdrop" | "nav")[]; trapFocus?: boolean; focusFirst?: boolean };
  onEscape:    { action: "click" | "remove" | "hide"; target?: BehaviorTarget; scope?: "self" | "document" };
  onClickOutside: { action: "hide" | "remove" | "click"; target?: BehaviorTarget };
  resetOnSuccess: void;
  back:        void;
  focus:       { target: Id };
}
declare module "./tag.js" {
  interface Tag {
    behavior<K extends keyof BehaviorMap>(
      name: K,
      ...args: BehaviorMap[K] extends void ? [] : [options: BehaviorMap[K]]
    ): this;
  }
}

// src/behaviors/register.ts — SERVER half: data only (ADR-07)
export type OptionType = "string" | "number" | "boolean" | "id" | "id-list" | "string-list" | "target" | { enum: readonly string[] };
export type BehaviorSpec<O extends Record<string, OptionType> = Record<string, OptionType>> = {
  options: O;                                       // wire schema: validated at emit, decoded in runtime
  events: readonly (BehaviorEvent | LifecycleEvent)[]; // first = default trigger
  preventDefault?: boolean;
  consume?: boolean;                                // default for the dispatch walk (ADR-04)
  fixtures: readonly [SpecOptions<O>, ...SpecOptions<O>[]];  // MANDATORY >=1 — feeds matrix() (ADR-12)
};
export type SpecOptions<O> = { /* "id"->Id, "target"->BehaviorTarget, {enum}->union, … */ };
type ExtensionName = `${Lowercase<string>}:${string}`;         // ns required, >=2 lowercase chars
export function registerBehavior<N extends ExtensionName & keyof BehaviorMap>(name: N, spec: BehaviorSpec): void;
// throws: built-in override | kebab-prefix collision | missing/invalid ns | after seal | duplicate

// "fluent-html/behavior-runtime" — CLIENT half: a real TS module, esbuild-compiled (never fn.toString)
// AMENDED (ADR-07 amendment): registerBehavior/defineBehavior/buildBehaviorRuntime are FRAMEWORK-LAYER-ONLY
// APIs — apps never call them. New verbs enter via framework PR + template bump. Namespace: jt: (single
// framework prefix; per-app prefixes dead). The extended runtime is prebuilt once at the framework level.
export function defineBehavior<K extends keyof BehaviorMap>(
  name: K,
  handler: (el: Element, opts: Wire<BehaviorMap[K]>, fx: FxCtx) => boolean | void,  // true => consume
): void;
export type FxCtx = {                                // the C6 fence — mediated, DOM-verbs-only
  event: Event;
  status(): number | undefined;                      // defensive htmx detail read (lifecycle triggers)
  resolve(t: WireTarget, from?: Element): Element[];  // the only query API
  transient(el: Element, apply: () => void, revert: () => void, ms: number): void;  // token + compare-guarded
  after(ms: number, f: () => void): void;            // element-scoped; no-op after replacement
};
// NO store, NO fetch, NO observers, NO pub/sub, NO fire/dispatch (ADR-08).

// Boot assembly (library-shipped esbuild wrapper)
export function buildBehaviorRuntime(opts: {
  clientEntries: readonly string[];   // app modules calling defineBehavior; isolated DOM-lib tsconfig via project references (template ships the layout)
  outDir: string;
}): Promise<{ fileName: string; registryHash: string; scriptTag(): Tag }>;
// Built-ins only: skip the build, serve dist/fluent-behaviors.<version>.js via the fastify plugin.

// FRAMEWORK EXTENSION END-TO-END (listbox nav, lives in the framework extension pack — NOT in any app):
declare module "fluent-html" {
  interface BehaviorMap { "jt:listboxNav": { list: Id; itemSelector: string } }
}
registerBehavior("jt:listboxNav", {
  options: { list: "id", itemSelector: "string" },
  events: ["keydown"], consume: true,
  fixtures: [{ list: idFixture("ac-results"), itemSelector: "[role=option]" }],
});
// framework client/behaviors/listbox.ts:
defineBehavior("jt:listboxNav", (el, o, fx) => { /* roving focus; return true only when list open (conditional consumption) */ });
// app call site, fully typed: Input().behavior("jt:listboxNav", { list: ids.acResults, itemSelector: "[role=option]" })

// C6 GUARDRAILS: options are scalars/lists/enums/targets only — no functions, no JSON blobs, no expressions; render path never executes user code (server spec is data); registry seals at asset build; registry-hash handshake makes name/version skew a deploy-time error; eslint (fluent-html-eslint-plugin): (a) ban hand-written data-behavior* through ALL raw-attr APIs (setDataAttrs, addAttribute, setAttrs — pattern-matched on the attribute name, closing the whack-a-mole), (b) behavior-client-purity inside defineBehavior handlers: no window/globalThis writes, no fetch, no setInterval, no MutationObserver, no addEventListener, (c) registerBehavior/defineBehavior imports flagged outside framework packages (the framework-only policy is mechanical, not disciplinary). Built-ins non-overridable. .hxOn deleted. Documented boundary: jt:listboxNav / timezone-prefill = framework-pack yes; ttl MemberPicker client-side collection CRUD = no (HTMX-first server round-trips). Conceded honestly: at the extension tier C6 is sealed-registry + mediated ctx + lint + review, not a technical sandbox — no attribute-only design can sandbox script the app ships; the matrix and the fence make good behavior the path of least resistance.

## Vocabulary

FINAL BUILT-IN SET (10), each mapped to the call-site inventory:
- drawer — #1 gap, 4 independent implementations (rideshare main.js:3-82, ttl main.js:1-20, web header.ts:92, ttl settings): class toggle + backdrop + body scroll-lock + aria-expanded sync + focus-first + focus trap + closeOn:[escape|backdrop|nav] as ONE atomic verb. Non-modal/responsive overlays only; modal dialogs are native (ADR-06).
- clipboard — 6 sites all bypassing the feedback-less built-in: gains path (origin-resolved) + feedback:{target(@self default), mode:text|class, text, class, durationMs}; mode:text covers 'Copied!'/checkmark sites, mode:class covers the server-rendered-hidden toast site.
- resetOnSuccess — roadmap #52, 2 rideshare raw hx-on sites: form.reset() gated on status<300; replaces formResetOnSwap ('exactly wrong': wiped typed values on 422).
- onEscape — ttl time-entry:679 + all dismiss flows; {action:click|remove|hide, target, scope:self|document} (document scope fixes v3's focus-scoped bug).
- onClickOutside — rideshare autocomplete dismiss (main.js:140-148); NOT popover=auto (anchor-input light-dismiss defect).
- toggle — 2 production sites; gains Id[] multi-target (ttl sidebar+backdrop pre-drawer) and display? for roadmap #53.
- toggleClass — 1 production site; Id[] multi-target; missing-class guard.
- remove — Alert.ts:60 CSP-dead onclick; target: Id | "@self" | {closest} (closest replaces the positionally-fragile @parent); animateOut with timeout fallback.
- back — 1 production site (analytics user-detail raw bypass becomes .behavior("back")); preventDefault contracted.
- focus — kept deliberately: 4 lines, complements onEscape flows (decided, per ADR-09).
Overlap rule (C5 inside the set): drawer for overlay bundles; toggle for simple show/hide; onClickOutside for non-overlay dismissal — documented, one blessed path per situation.

DELETED with successors: disable -> htmx-native disable:"find button" route option (already template practice); openDialog/closeDialog -> setCommand/setCommandfor + <dialog closedby> (v6.0.1 parked deprecation executes; setClosedby setter ships); formResetOnSwap -> resetOnSuccess; dismissOnEscape -> onEscape; scrollTo -> htmx swap "scroll:top"; selectAll -> deleted (zero call sites; trivial extension if ever wanted).

FRAMEWORK EXTENSION PACK (registered at the framework layer per the ADR-07 amendment — apps never register): jt:listboxNav arrow-key navigation (canonical extension example), jt:timezone client-environment prefill, scroll-reveal if demanded. OUT OF BOUNDS (documented negative example): ttl MemberPicker-style client-side collection CRUD -> server round-trips. htmx-alpha workarounds (manual htmx.process, scroll:top re-implementation, camelCase beforeSwap listener) age out with the htmx beta upgrade — explicitly not designed for.

## Versioning

Package version = grammar + runtime version (ADR-11). The same fluent-html release renders the attributes and provides the runtime asset — atomically colocated, LiveView-style; there is no separately-versioned client artifact to drift. Asset filename carries version (+ registry hash for extension apps) with immutable cache headers; the layout stamps <html data-fluent-behaviors="<version>:<registryHash>"> and the runtime asserts it (mismatch = one loud console.error, C7-gated). Grammar strictly additive within a major: new verbs/options may appear, existing attributes never change meaning; verb renames are semver-major. Skew window (pre-deploy page x post-deploy partials): unknown verbs skip with exactly one console.warn + data-behavior-unknown mark, unknown options ignored, next full navigation heals — and @fluent-html/fastify ships X-Fluent-Behaviors refresh-on-mismatch ON by default. The two-version skew degrade and the hash-mismatch error are executable acceptance rows, not documentation. htmx literals live in the single HTMX_EVENTS const; the matrix pins the htmx version and re-runs on every htmx bump.

## Migration

ORDERED, one fluent-html release with the template PR in lockstep (greenfield v6 posture, no v5 compat):
1. fluent-html emission: add src/behaviors/{events.ts, map.ts, serialize.ts, emit.ts, register.ts}; Tag.behavior emits the namespaced grammar natively; render-time throws (duplicate verb, unregistered verb in ALL modes, option-type mismatch). DELETE: all 13 hx-on renderers in src/core/behavior-methods.ts, el()/ev()/forceArg() JS-string builders, HxOnEvent, HX_ON_EVENT_RE, .hxOn(), every escapeJs caller in the behavior path.
2. fluent-html runtime: src/behaviors/client/ TS -> dist/fluent-behaviors.<version>.js at publish; export buildBehaviorRuntime (esbuild wrapper, optional peer), behaviorRuntimeSource, registry hash; implement dispatcher per the runtime spec (capture delegation, consumption walk, drawer DOM-predicate model, transient helper, HTMX_EVENTS, skew degrade).
3. Acceptance suite: in-package Playwright harness (minimal Fastify app, real strict CSP, pinned htmx) with matrix() enumeration from the registry; CI gates including the two-version skew row, production-built-asset execution, multi-engine state rows, and the size budget.
4. Framework layer: @fluent-html/fastify (or interim in-template glue pending the framework-layer split) — static route + BehaviorRuntimeScript() registered atomically, immutable headers, X-Fluent-Behaviors hardening on by default; dev render-throw when the route is missing.
5. eslint plugin: raw data-behavior* ban across all raw-attr APIs + behavior-client-purity rule.
6. Docs (v6-docs-surface memory applies): fix the file-header lie ('No client-side runtime needed'), htmx.md:341, README behavior section (all 10 verbs — closes dx-ideas-8's 8-of-13 gap), JSDoc, Wave-8.2 deferred template docs; document the overlap rule, the drawer/modal boundary, the MemberPicker negative example, and the same-verb-once limitation + workaround.
7. projects-template full-stack: DELETE core/htmx/behaviors.ts (44-line monkey-patch) and behaviorDispatcherScript (~40 lines in layout.scripts.ts); wire the fastify plugin + BehaviorRuntimeScript(); fix analytics user-detail.view.ts:48 setDataAttrs({behavior:'back'}) -> .behavior("back"); keep swap-verbs.ts app-land (its decisions.md already litigated that). Fork deleted = C5 satisfied.
8. templates/web: add the runtime script tag (no htmx) — the dead header.ts:92 mobile-menu toggle goes live; upgrade it to .behavior("drawer", …).
9. Apps (opportunistic — call-site API unchanged for every surviving verb): rideshare deletes ~300/358 lines of main.js (sidebar -> drawer; 3 clipboard handlers -> feedback options; click-outside -> onClickOutside; 2 hx-on after:swap escapes -> resetOnSuccess; listbox + timezone -> jt: framework-pack verbs consumed from the template, ~40 typed lines each living in the framework; scroll-reveal -> framework pack if demanded, else stays out). ttl deletes public/js/main.js entirely (incl. the never-firing camelCase htmx:beforeSwap bug) -> drawer; time-entry:679 hx-on -> onEscape. packages/ui Alert.ts onclick -> remove {closest:'[role=alert]'}.
NET: deletes ~95 lines of library JS-string renderers + escapeJs coupling, 44-line template override, ~40-line template dispatcher, ~320 lines of per-app JS, 5 built-in verbs, .hxOn. Adds one <=5KB immutable asset, ~200 lines of registry/serialization, the acceptance suite.

