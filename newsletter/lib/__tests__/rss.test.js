import { describe, it, expect } from "vitest";
import { parseFeed, decodeEntities } from "../rss.js";
import { extractExcerpt } from "../excerpt.js";

// Mirrors the real feed: the post body inside <content:encoded> is XML-escaped.
const escapedFeed = `<?xml version="1.0"?>
<rss><channel>
  <item>
    <title>BDD Shiny: When</title>
    <link>https://jakubsobolewski.com/blog/bdd-shiny-when</link>
    <pubDate>Mon, 01 Jun 2026 00:00:00 GMT</pubDate>
    <description>Learn how to write When steps.</description>
    <content:encoded>&lt;p&gt;A specification tells a story.&lt;/p&gt;
&lt;p&gt;Given describes the world &amp; the action.&lt;/p&gt;
&lt;h2 id=&quot;x&quot;&gt;First section&lt;/h2&gt;
&lt;pre&gt;code&lt;/pre&gt;</content:encoded>
  </item>
</channel></rss>`;

describe("decodeEntities", () => {
  it("reverses single XML escaping, &amp; last", () => {
    // Arrange / Act / Assert
    expect(decodeEntities("&lt;p&gt;a &amp; b&lt;/p&gt;")).toBe("<p>a & b</p>");
    expect(decodeEntities("&amp;lt;")).toBe("&lt;");
  });
});

describe("parseFeed", () => {
  it("decodes the escaped post body into real HTML", () => {
    // Act
    const [item] = parseFeed(escapedFeed);

    // Assert
    expect(item.title).toBe("BDD Shiny: When");
    expect(item.slug).toBe("bdd-shiny-when");
    expect(item.contentHtml).toContain("<p>A specification tells a story.</p>");
    expect(item.contentHtml).toContain("<h2");
    expect(item.contentHtml).not.toContain("&lt;");
  });

  it("yields content the excerpt extractor can actually read", () => {
    // Regression: escaped content used to leave the excerpt empty, falling back
    // to the one-line description.
    // Act
    const [item] = parseFeed(escapedFeed);
    const excerpt = extractExcerpt(item.contentHtml);

    // Assert
    expect(excerpt).toContain("A specification tells a story.");
    expect(excerpt).toContain("Given describes the world & the action.");
    expect(excerpt).not.toContain("First section"); // stops at the heading
    expect(excerpt).not.toContain("<pre>");
  });

  it("passes CDATA content through without entity-mangling", () => {
    // Arrange
    const cdataFeed = `<rss><channel><item>
      <link>https://x/blog/p</link>
      <content:encoded><![CDATA[<p>raw <strong>html</strong></p>]]></content:encoded>
    </item></channel></rss>`;

    // Act
    const [item] = parseFeed(cdataFeed);

    // Assert
    expect(item.contentHtml).toBe("<p>raw <strong>html</strong></p>");
  });
});
