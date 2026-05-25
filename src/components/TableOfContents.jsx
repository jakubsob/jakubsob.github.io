import { useState, useEffect } from 'react';
import { generateTableOfContents } from '../utils/generateTableOfContents';

export default function TableOfContents() {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const articleContent = document.querySelector('article');
    if (articleContent) {
      const toc = generateTableOfContents(articleContent.innerHTML);
      setHeadings(toc);

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

      document.querySelectorAll('h2, h3, h4').forEach((heading) => {
        observer.observe(heading);
      });

      return () => observer.disconnect();
    }
  }, []);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="hidden lg:block sticky top-20 self-start w-[200px] max-h-[calc(100vh-120px)] overflow-y-auto">
      <p className="text-xs uppercase tracking-widest text-muted-foreground/60 font-medium mb-3">
        On this page
      </p>
      <ul className="space-y-0">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={
              heading.level === 2 ? "ml-0" :
              heading.level === 3 ? "ml-3" :
              "ml-6"
            }
          >
            <a
              href={`#${heading.id}`}
              className={`block py-1.5 text-xs transition-colors duration-150 line-clamp-2 ${
                activeId === heading.id
                  ? "text-foreground"
                  : "text-muted-foreground/50 hover:text-muted-foreground"
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
