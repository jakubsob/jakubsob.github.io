import { type SearchItem } from '@/lib/smartSearch';
import {
  createGitHubAuthHeaders,
  fetchDirectoryReadmeParsed,
  fetchTopLevelDirectories,
} from '@/lib/rTestsGallery';

/**
 * Fetches R Tests Gallery directories and populates search index
 */
export async function populateRTestsGallerySearch(): Promise<SearchItem[]> {
  const galleryItems: SearchItem[] = [];

  try {
    const GITHUB_TOKEN = typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env.PRIVATE_GITHUB_TOKEN
      : undefined;

    const headers = createGitHubAuthHeaders(GITHUB_TOKEN);
    const directories = await fetchTopLevelDirectories(headers);

    for (const dirName of directories) {
      try {
        const parsedReadme = await fetchDirectoryReadmeParsed(dirName, headers);
        const fallbackTitle = dirName.replace(/-/g, ' ');
        const title = parsedReadme.title;
        const description = parsedReadme.description
          || `Testing patterns and examples for ${fallbackTitle}`;
        const content = parsedReadme.fullContent;

        galleryItems.push({
          id: `r-tests-gallery-${dirName}`,
          type: 'r-tests-gallery',
          title,
          description,
          content,
          url: `/r-tests-gallery/${dirName}/`,
          category: 'Testing Patterns',
          tags: extractTagsFromContent(content)
        });

      } catch (error) {
        console.warn(`Failed to fetch README for ${dirName}:`, error);

        const fallbackTitle = dirName.replace(/-/g, ' ');

        // Add basic entry even if README fetch fails
        galleryItems.push({
          id: `r-tests-gallery-${dirName}`,
          type: 'r-tests-gallery',
          title: fallbackTitle,
          description: `Testing patterns and examples for ${fallbackTitle}`,
          content: fallbackTitle,
          url: `/r-tests-gallery/${dirName}/`,
          category: 'Testing Patterns'
        });
      }
    }

  } catch (error) {
    console.warn('Error fetching R Tests Gallery data:', error);
    return [];
  }

  return galleryItems;
}

/**
 * Extract potential tags from content
 */
function extractTagsFromContent(content: string): string[] {
  const tags: string[] = [];
  const commonTestingTerms = [
    'unit', 'integration', 'e2e', 'shiny', 'testthat', 'shinytest2',
    'mock', 'stub', 'fixture', 'snapshot', 'regression', 'performance',
    'tdd', 'bdd', 'cucumber', 'api', 'database', 'ui', 'module'
  ];

  const lowerContent = content.toLowerCase();
  for (const term of commonTestingTerms) {
    if (lowerContent.includes(term)) {
      tags.push(term);
    }
  }

  return tags.slice(0, 5); // Limit to 5 tags
}
