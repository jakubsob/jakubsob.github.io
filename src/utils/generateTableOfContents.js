// Utility function to extract headings from HTML content and build a table of contents
export function generateTableOfContents(content) {
  if (!content) return [];

  // Create a temporary DOM element to parse the HTML content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;

  const allHeadings = Array.from(tempDiv.querySelectorAll('h1, h2, h3, h4'));
  let firstH2Index = allHeadings.findIndex(h => h.tagName.toLowerCase() === 'h2');

  // Filter out the first h1 and h2, and any h1s (usually the post title)
  const headings = allHeadings.filter((heading, index) => {
    const tagName = heading.tagName.toLowerCase();
    // Skip all h1 elements and the first h2
    return tagName !== 'h1' && !(tagName === 'h2' && index === firstH2Index);
  });

  return headings.map(heading => {
    // Create an id from the heading text if it doesn't have one already
    if (!heading.id) {
      heading.id = heading.textContent
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-');
    }

    return {
      id: heading.id,
      text: heading.textContent,
      level: parseInt(heading.tagName.charAt(1), 10)
    };
  });
}
