import { setDiscriminant } from "./proto.js";
/**
 * Wrapper for raw HTML strings that bypass XSS escaping.
 * WARNING: Only use with trusted content. Never use with user input.
 */
export class RawString {
  /** @internal type discriminant for fast render checks */
  declare readonly _t: 2;
  constructor(public readonly html: string) {}
}

setDiscriminant(RawString, 2);

/**
 * Creates a raw HTML string that will NOT be escaped during rendering.
 * WARNING: This bypasses XSS protection. Only use with trusted content.
 * Never use with user-provided input.
 *
 * @example
 * // Render pre-sanitized markdown HTML
 * Div(Raw(markdownToHtml(trustedContent)))
 *
 * // Render trusted SVG
 * Div(Raw('<svg>...</svg>'))
 */
type RawCheck<S extends string> = [S] extends [TrustedHtml] ? unknown
  : string extends S ? ["✗ Raw() takes a source literal or trustHtml(…), never a runtime string: text is escaped by default, Div(text)"]
  : {} extends Record<S, 1> ? ["✗ Raw() takes a source literal or trustHtml(…), never a template string: text is escaped by default, Div(text)"]
  : unknown;

/** Unescaped HTML: a literal in the source, or a `trustHtml(…)` value. Text from data needs no Raw: `Div(text)` escapes it. */
export function Raw<const S extends string>(html: S & RawCheck<S>): RawString;
export function Raw(html: string): RawString {
  return new RawString(html);
}

declare const htmlBrand: unique symbol;
/** HTML from a source the app vouches for (a sanitizer's output, a build step). */
export type TrustedHtml = string & { readonly [htmlBrand]: true };

/**
 * Vouch for HTML built at runtime, so `Raw()` takes it. Never pass user input: it is not escaped.
 * @example Raw(trustHtml(sanitize(markdown(post.body))))
 */
export function trustHtml(html: string): TrustedHtml {
  return html as TrustedHtml;
}
