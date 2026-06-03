import { describe, it, expect } from "vitest";
import { extractExcerpt } from "../excerpt.js";

const article =
  "<p>First paragraph.</p>\n" +
  "<p>Second paragraph with <code>code()</code>.</p>\n" +
  "<p>Lead-in to a list:</p>\n" +
  "<ul><li>one</li><li>two</li></ul>\n" +
  "<h2 id=x>A heading</h2>\n" +
  "<pre>big code block</pre>\n" +
  "<p>Body paragraph after the heading.</p>";

describe("extractExcerpt", () => {
  it("returns the full intro before the first heading", () => {
    // Act
    const result = extractExcerpt(article);

    // Assert
    expect(result).toContain("First paragraph.");
    expect(result).toContain("Second paragraph with <code>code()</code>.");
    expect(result).toContain("Lead-in to a list:");
    expect(result).not.toContain("after the heading");
  });

  it("includes lists and other blocks in the lede", () => {
    // Act
    const result = extractExcerpt(article);

    // Assert
    expect(result).toContain("<ul><li>one</li><li>two</li></ul>");
  });

  it("stops before the first heading and any code block", () => {
    // Act
    const result = extractExcerpt(article);

    // Assert
    expect(result).not.toContain("<pre>");
    expect(result).not.toContain("<h2");
  });

  it("uses the whole document when there is no heading", () => {
    // Arrange
    const noHeading = "<p>Only paragraph one.</p><p>And two.</p>";

    // Act
    const result = extractExcerpt(noHeading);

    // Assert
    expect(result).toContain("Only paragraph one.");
    expect(result).toContain("And two.");
  });

  it("caps the number of blocks", () => {
    // Arrange — 10 paragraphs, no heading
    const many = Array.from({ length: 10 }, (_, i) => `<p>P${i}</p>`).join("");

    // Act
    const count = (extractExcerpt(many, { maxBlocks: 3 }).match(/<p\b/g) || [])
      .length;

    // Assert
    expect(count).toBe(3);
  });

  it("returns an empty string when there are no blocks", () => {
    // Arrange / Act / Assert
    expect(extractExcerpt("<h2>just a heading</h2>")).toBe("");
    expect(extractExcerpt("")).toBe("");
    expect(extractExcerpt(undefined)).toBe("");
  });
});
