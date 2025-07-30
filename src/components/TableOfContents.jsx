import { useState, useEffect } from 'react';
import { generateTableOfContents } from '../utils/generateTableOfContents';

export default function TableOfContents() {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    // Find the article content
    const articleContent = document.querySelector('article');
    if (articleContent) {
      // Get the HTML content
      const content = articleContent.innerHTML;
      // Extract headings
      const toc = generateTableOfContents(content);
      setHeadings(toc);

      // Set up intersection observer to highlight the active heading
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id);
            }
          });
        },
        { rootMargin: '-100px 0px -66%' }
      );

      // Observe all heading elements
      document.querySelectorAll('h2, h3, h4').forEach((heading) => {
        observer.observe(heading);
      });

      return () => {
        observer.disconnect();
      };
    }
  }, []);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="hidden lg:block sticky top-20 self-start ml-10 w-[250px] max-h-[calc(100vh-120px)] overflow-y-auto pr-4 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
      <p className="font-medium mb-4 text-sm uppercase tracking-wider text-muted">
        Table of Contents
      </p>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={`${
              heading.level === 2
                ? "ml-0"
                : heading.level === 3
                ? "ml-4"
                : "ml-8"
            }`}
          >
            <a
              href={`#${heading.id}`}
              className={`block py-1 transition-colors duration-200 line-clamp-2 hover:text-primary ${
                activeId === heading.id
                  ? "text-primary font-medium"
                  : "text-muted"
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
