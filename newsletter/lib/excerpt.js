// Pull the intro out of an article's rendered HTML for teaser-style broadcasts.
//
// Heuristic: take every block (paragraph, list, blockquote) *before the first
// heading*. In these posts the lede sits above the first `<h2>`, and the first
// heading is also where the code-heavy sections begin — so this captures the
// full intro while naturally excluding code blocks. A paragraph cap bounds the
// email size if a post has an unusually long intro or no headings at all.

const BLOCK_RE = /<(p|ul|ol|blockquote)\b[^>]*>[\s\S]*?<\/\1>/gi;

export function extractExcerpt(html, { maxBlocks = 8 } = {}) {
  if (!html) return "";

  // Everything up to the first heading is the lede; if there's no heading, the
  // whole post is fair game (subject to the cap).
  const headingIdx = html.search(/<h[1-6]\b/i);
  const lede = headingIdx === -1 ? html : html.slice(0, headingIdx);

  let blocks = lede.match(BLOCK_RE);
  if (!blocks || blocks.length === 0) {
    // Lede had no block element (rare) — fall back to the first few paragraphs
    // of the whole document.
    blocks = html.match(/<p\b[^>]*>[\s\S]*?<\/p>/gi);
    if (!blocks) return "";
  }
  return blocks.slice(0, maxBlocks).join("\n");
}
