export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'datetime-local' | 'month' | 'week' | 'time' | 'checkbox' | 'radio' | 'range' | 'color' | 'file' | 'hidden' | 'image' | 'submit' | 'reset' | 'button';
export type AutocompleteHint = 'on' | 'off' | 'name' | 'email' | 'username' | 'new-password' | 'current-password' | 'organization' | 'street-address' | 'country' | 'postal-code' | 'tel' | 'url' | 'one-time-code' | (string & {});
export type FormMethod = 'get' | 'post' | 'dialog';
export type BrowsingContext = '_self' | '_blank' | '_parent' | '_top' | (string & {});
export type LinkRel = 'noopener' | 'noreferrer' | 'nofollow' | 'external' | 'author' | 'bookmark' | 'help' | 'license' | 'next' | 'prev' | 'search' | 'tag' | (string & {});
export type ReferrerPolicy = 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
export type BooleanAttribute = 'disabled' | 'required' | 'checked' | 'readonly' | 'hidden' | 'autofocus' | 'autoplay' | 'controls' | 'loop' | 'muted' | 'multiple' | 'selected' | 'open' | 'novalidate' | 'defer' | 'async' | 'allowfullscreen' | 'formnovalidate' | 'inert' | (string & {});
//# sourceMappingURL=html-types.d.ts.map