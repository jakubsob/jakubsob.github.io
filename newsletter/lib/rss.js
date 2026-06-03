// Minimal reader for our own, controlled RSS feed. Astro's feed XML-escapes the
// rendered post body inside <content:encoded> (e.g. "&lt;p&gt;hi&lt;/p&gt;"),
// so element text must be entity-decoded to recover real HTML. CDATA sections
// (if ever used) are passed through as-is.

// Reverse single XML escaping. &amp; is decoded last so "&amp;lt;" -> "&lt;"
// rather than collapsing to "<".
export function decodeEntities(s) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&#x0*27;/gi, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function unwrap(s) {
  const cdata = s.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  if (cdata) return cdata[1].trim();
  return decodeEntities(s).trim();
}

function tag(block, name) {
  const re = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i");
  const m = block.match(re);
  return m ? unwrap(m[1]) : "";
}

// Parse <item> entries into plain objects. `contentHtml` is the decoded post
// body; `slug` is the trailing segment of the link.
export function parseFeed(xml) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml))) {
    const block = m[1];
    const link = tag(block, "link");
    items.push({
      title: tag(block, "title"),
      description: tag(block, "description"),
      link,
      pubDate: tag(block, "pubDate"),
      contentHtml: tag(block, "content:encoded") || tag(block, "description"),
      slug: link.replace(/\/$/, "").split("/").pop(),
    });
  }
  return items;
}
