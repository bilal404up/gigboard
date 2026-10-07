import sanitizeHtml from "sanitize-html";

/**
 * Gig descriptions are written by sellers and rendered as HTML on the public gig page
 * and in the admin review queue. Only basic formatting survives; scripts, event handlers,
 * images, frames, styles and non-web links are removed.
 */
export function cleanGigHtml(html: string | null | undefined): string {
  if (typeof html !== "string" || html.length === 0) return "";
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "h2", "h3", "h4", "blockquote", "a"],
    allowedAttributes: { a: ["href", "rel", "target"] },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow", target: "_blank" }),
    },
  });
}
