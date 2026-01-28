/**
 * Wrapper for raw HTML strings that bypass XSS escaping.
 * WARNING: Only use with trusted content. Never use with user input.
 */
export class RawString {
  /** @internal type discriminant for fast render checks */
  declare readonly _t: 2;
  constructor(public readonly html: string) {}
}

/** @internal */
(RawString.prototype as any)._t = 2;

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
export function Raw(html: string): RawString {
  return new RawString(html);
}
