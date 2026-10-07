/**
 * Returns a same-site path that is safe to append to the request origin.
 * Anything else (absolute URLs, "@host", "//host", backslashes, control
 * characters) falls back to the default, so a crafted `next` parameter
 * cannot send a signed-in user to another site.
 */
export function safeNextPath(next: string | null | undefined, fallback = "/dashboard"): string {
  if (typeof next !== "string" || next.length === 0) return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//") || next.startsWith("/\\")) return fallback;
  if (/[\u0000-\u001f\u007f]/.test(next)) return fallback;
  return next;
}
