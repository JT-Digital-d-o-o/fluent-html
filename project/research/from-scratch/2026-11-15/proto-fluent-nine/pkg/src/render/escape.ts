// Escape map — kept as public API for consumers
export const htmlEscapes: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

// The five characters escapeHtml rewrites. A native regex pre-test lets V8's vectorized
// engine reject the overwhelmingly common clean string (every machine-generated class
// attribute, id, and URL) without the per-char JS scan below.
const NEEDS_ESCAPE = /[&<>"']/;

// HTML escape to prevent XSS — manual charCode scan for speed
export function escapeHtml(unsafe: string): string {
  if (!NEEDS_ESCAPE.test(unsafe)) return unsafe; // fast path: nothing to escape
  let result = '';
  let lastIdx = 0;
  for (let i = 0; i < unsafe.length; i++) {
    const ch = unsafe.charCodeAt(i);
    let escaped: string | undefined;
    if (ch === 38) escaped = '&amp;';       // &
    else if (ch === 60) escaped = '&lt;';   // <
    else if (ch === 62) escaped = '&gt;';   // >
    else if (ch === 34) escaped = '&quot;'; // "
    else if (ch === 39) escaped = '&#39;';  // '
    else continue;
    result += unsafe.substring(lastIdx, i) + escaped;
    lastIdx = i + 1;
  }
  if (lastIdx === 0) return unsafe; // No escaping needed — fast path
  return result + unsafe.substring(lastIdx);
}

/**
 * Escape a string for use in a double-quoted HTML attribute value.
 * Currently identical to `escapeHtml` — sufficient because the renderer
 * always emits double-quoted attributes. If unquoted or single-quoted
 * attributes are ever supported, this would need to also escape
 * backticks, equals signs, etc.
 */
export function escapeAttr(unsafe: string): string {
  return escapeHtml(unsafe);
}

// A URL carrying a dangerous scheme is rewritten to this inert value.
const BLOCKED_URL = "about:blank";

// Whitespace / control chars a browser strips before resolving a URL's scheme —
// `java\tscript:` and a leading NUL both still execute, so strip them before testing.
const URL_SCHEME_NOISE_RE = /[\u0000-\u0020\u007f-\u009f\u2028\u2029]/g;

// `data:` payloads that cannot run script — raster images, audio, video, fonts.
// SVG is deliberately excluded (an SVG document can carry <script>). The trailing
// `[;,]` anchors the media type to a real data-URL body (`;base64,` or `,`).
const SAFE_DATA_URL_RE =
  /^data:(?:image\/(?!svg)[a-z0-9.+-]+|audio\/[a-z0-9.+-]+|video\/[a-z0-9.+-]+|font\/[a-z0-9.+-]+)[;,]/;

/**
 * Neutralize a URL that would execute script or load an attacker-authored
 * document when placed in a navigable/loadable attribute (`href`, `src`,
 * `action`, `formaction`, `data`, `poster`, `cite`). `javascript:` and
 * `vbscript:` are always blocked; `data:` is blocked except for non-scriptable
 * media types. Relative URLs, fragments, query refs, protocol-relative
 * `//host`, and ordinary `http(s)`/`mailto`/`tel` values pass through unchanged.
 *
 * Returns the original string when safe, or `"about:blank"` when blocked.
 *
 * Applied automatically by the typed URL setters (`setHref`/`setSrc`/…). The
 * untyped `addAttribute(...)` escape hatch is intentionally NOT sanitized — reach
 * for it deliberately in the rare case you need a `javascript:` URL.
 */
export function sanitizeUrl(url: string): string {
  // Fast path (no allocation): no ':' means a relative URL/fragment, and a ':'
  // preceded by '/', '?' or '#' is a path/query/fragment colon, not a scheme.
  const colon = url.indexOf(":");
  if (colon === -1) return url;
  for (let i = 0; i < colon; i++) {
    const c = url.charCodeAt(i);
    if (c === 47 || c === 63 || c === 35) return url; // '/', '?', '#'
  }
  // Possible scheme — normalize the way a browser would, then inspect it.
  const probe = url.replace(URL_SCHEME_NOISE_RE, "").toLowerCase();
  if (probe.startsWith("javascript:") || probe.startsWith("vbscript:")) return BLOCKED_URL;
  if (probe.startsWith("data:") && !SAFE_DATA_URL_RE.test(probe)) return BLOCKED_URL;
  return url;
}

/**
 * Escape a string for embedding inside a SINGLE-QUOTED JavaScript string literal
 * — e.g. the JS the behavior system writes into `hx-on:*` attributes. Escapes the
 * backslash and single quote (which would close/break the literal) plus the line
 * terminators that are illegal inside a string literal (`\n`, `\r`, U+2028, U+2029).
 * The renderer HTML-attribute-escapes the result on top, so both layers are covered.
 *
 * Note: this is for the `hx-on:*` ATTRIBUTE path. Content destined for a raw
 * `<script>` body needs the `</script>` break-out guard (`sanitizeRawContent`) too.
 */
export function escapeJs(unsafe: string): string {
  return unsafe
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
