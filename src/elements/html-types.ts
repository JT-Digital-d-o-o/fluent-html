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
