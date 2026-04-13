// Escape map — kept as public API for consumers
export const htmlEscapes: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

// HTML escape to prevent XSS — manual charCode scan for speed
export function escapeHtml(unsafe: string): string {
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
