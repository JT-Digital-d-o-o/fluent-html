// Shared HTML attribute type unions for element setters.
// Using `(string & {})` as an escape hatch preserves autocomplete
// while allowing custom/non-standard values.

export type InputType =
  | 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  | 'date' | 'datetime-local' | 'month' | 'week' | 'time'
  | 'checkbox' | 'radio' | 'range' | 'color'
  | 'file' | 'hidden' | 'image' | 'submit' | 'reset' | 'button';

/** Input types that accept numeric min/max (number, range). */
export type NumericInputType = 'number' | 'range';

/** Input types that accept date/time string min/max. */
export type DateTimeInputType = 'date' | 'datetime-local' | 'month' | 'week' | 'time';

/** Input types that do NOT support min/max. */
export type NoMinMaxInputType = Exclude<InputType, NumericInputType | DateTimeInputType>;

export type AutocompleteHint =
  | 'on' | 'off' | 'name' | 'email' | 'username' | 'new-password'
  | 'current-password' | 'organization' | 'street-address' | 'country'
  | 'postal-code' | 'tel' | 'url' | 'one-time-code'
  | (string & {});

export type FormMethod = 'get' | 'post' | 'dialog';

export type BrowsingContext = '_self' | '_blank' | '_parent' | '_top' | (string & {});

export type LinkRel =
  | 'noopener' | 'noreferrer' | 'nofollow' | 'external' | 'author'
  | 'bookmark' | 'help' | 'license' | 'next' | 'prev' | 'search' | 'tag'
  | (string & {});

export type ReferrerPolicy =
  | 'no-referrer' | 'no-referrer-when-downgrade' | 'origin'
  | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin'
  | 'strict-origin-when-cross-origin' | 'unsafe-url';

/** `crossorigin` attribute values. The bare `""` overload is for preconnect / Google Fonts. */
export type CrossOrigin = 'anonymous' | 'use-credentials';

/** `inputmode` hint — which virtual keyboard a mobile browser shows. */
export type InputMode =
  | 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';

/** `http-equiv` pragma directive (meta). */
export type HttpEquiv =
  | 'content-type' | 'content-security-policy' | 'default-style'
  | 'x-ua-compatible' | 'refresh' | (string & {});

/**
 * `fetchpriority` — Core Web Vitals priority hint (img/link/script/iframe).
 * **Closed** union (no `(string & {})` escape hatch): the spec enum is a fixed
 * three-value set, so a typo like `setFetchPriority("highh")` is a compile error.
 */
export type FetchPriority = 'high' | 'low' | 'auto';

/**
 * `<link rel>` — resource hints + document relations. **Distinct from `LinkRel`**,
 * which is the *anchor* rel grammar (`noopener`/`nofollow`/…) shared with `AnchorTag`.
 * Open: custom/vendor rel tokens are legal.
 */
export type LinkElementRel =
  | 'stylesheet' | 'icon' | 'apple-touch-icon' | 'manifest' | 'canonical'
  | 'alternate' | 'author' | 'license' | 'next' | 'prev' | 'search'
  | 'preconnect' | 'dns-prefetch' | 'preload' | 'prefetch' | 'modulepreload'
  | 'prerender'
  | (string & {});

/** `<link as>` — preload / modulepreload destination. Open. */
export type LinkAs =
  | 'audio' | 'document' | 'embed' | 'fetch' | 'font' | 'image' | 'object'
  | 'script' | 'style' | 'track' | 'video' | 'worker'
  | (string & {});

/** `<link type>` — MIME hint for the linked resource. Open. */
export type LinkType =
  | 'text/css' | 'font/woff2' | 'image/svg+xml' | 'image/x-icon'
  | 'application/manifest+json'
  | (string & {});

/**
 * `<script type>` — module-system hint. Open (any MIME-typed `<script>` is legal).
 * Data-block types (`application/json`, `application/ld+json`) are intentionally
 * left to the open tail rather than autocompleted alongside the module hints.
 */
export type ScriptType =
  | 'module' | 'importmap' | 'text/javascript' | 'speculationrules'
  | (string & {});

/** `<meta name>` — named-meta set. Open (vendor / OpenGraph names exist). */
export type MetaName =
  | 'viewport' | 'description' | 'theme-color' | 'color-scheme' | 'referrer'
  | 'robots' | 'author' | 'keywords' | 'application-name' | 'generator'
  | 'format-detection'
  | (string & {});

/** `charset` — practically always lowercase `utf-8`. Open for the rare legacy case. */
export type Charset = 'utf-8' | (string & {});

// ── Global editing / keyboard attributes (F-B-120 / F-B-123 / F-B-900) ─────

/** `enterkeyhint` — the action label on a mobile virtual-keyboard Enter key. Closed. */
export type EnterKeyHint = 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';

/** `contenteditable` — enumerated, not boolean (`""`/`"true"` both mean editable). Closed. */
export type ContentEditable = 'true' | 'false' | 'plaintext-only';

/** `autocapitalize` — virtual-keyboard autocapitalization behavior. Closed. */
export type Autocapitalize = 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';

/** `spellcheck` — enumerated `"true"`/`"false"` string (not a boolean attribute). */
export type Spellcheck = 'true' | 'false';

// ── Native interactivity (B-010): Popover API + invoker Commands ──────
// Closed unions — these map 1:1 to a fixed native enum, so a typo should be a
// compile error (no `(string & {})` escape hatch). The escape guarantee for the
// *values* rests on the renderer's `escapeAttr` choke point, not on these types.

/** `popover` attribute value. `"auto"` = light-dismiss + one-open-per-group; `"manual"` = explicit dismiss only. */
export type PopoverState = "auto" | "manual";

/** `popovertargetaction` — what an invoker does to its popover target. Omit ⇒ native default `toggle`. */
export type PopoverAction = "show" | "hide" | "toggle";

/**
 * `<dialog closedby>` — how a dialog light-dismisses. `"any"` = click-outside + Esc
 * (the standards-track replacement for hand-rolled backdrop/Esc handlers), `"closerequest"`
 * = Esc only, `"none"` = explicit close only. Closed union.
 */
export type ClosedBy = "any" | "closerequest" | "none";

/**
 * `command` values for `<button command commandfor>`. Closed over the native set;
 * the `` `--${string}` `` arm admits ONLY the spec author-command shape (a leading
 * `--`, which fires a `CommandEvent` rather than a built-in action) — `"custom"`
 * is a compile error, `"--my-cmd"` is not. Tighter than the house `(string & {})` hatch.
 */
export type CommandFor =
  | "show-modal" | "close" | "request-close"            // <dialog>
  | "show-popover" | "hide-popover" | "toggle-popover"  // popover
  | `--${string}`;                                       // author-defined

/**
 * HTML boolean attributes — the values accepted by `.toggle()`. A **closed** union
 * (no `(string & {})` escape hatch) so a typo like `.toggle("requried")` is a compile
 * error. Covers the full set of standard HTML boolean attributes; `.toggle()` is the
 * only way to set any of them (the named boolean setters were removed in v6).
 */
export type BooleanAttribute =
  | 'allowfullscreen' | 'async' | 'autofocus' | 'autoplay' | 'checked'
  | 'controls' | 'default' | 'defer' | 'disabled' | 'formnovalidate'
  | 'hidden' | 'inert' | 'ismap' | 'itemscope' | 'loop' | 'multiple'
  | 'muted' | 'nomodule' | 'novalidate' | 'open' | 'playsinline'
  | 'readonly' | 'required' | 'reversed' | 'selected';
