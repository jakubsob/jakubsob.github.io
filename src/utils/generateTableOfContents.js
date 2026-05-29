// Utility function to extract headings from HTML content and build a table of contents
export function generateTableOfContents(content) {
  if (!content) return [];

  // Create a temporary DOM element to parse the HTML content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;

  const allHeadings = Array.from(tempDiv.querySelectorAll('h1, h2, h3, h4'));

  const headings = allHeadings.filter(heading => heading.tagName.toLowerCase() !== 'h1');

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
