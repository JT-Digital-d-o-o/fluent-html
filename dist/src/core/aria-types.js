// WAI-ARIA roles and state/property names for the typed `setRole` / `setAria`
// setters. Roles keep a `(string & {})` escape hatch (there are many, and custom
// roles exist). The aria attribute-NAME union is CLOSED so a typo like
// `setAria({ labeledby: … })` is a compile error — with an `aria-${string}` escape
// arm on the object for genuinely non-standard attributes.
export {};
//# sourceMappingURL=aria-types.js.map