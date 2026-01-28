// HTML escape to prevent XSS
export const htmlEscapes: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(unsafe: string): string {
  return unsafe.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

// For attribute values
export function escapeAttr(unsafe: string): string {
  return escapeHtml(unsafe);
}
