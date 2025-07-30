import { type SearchItem } from '@/lib/smartSearch';

/**
 * Fetches R Tests Gallery directories and populates search index
 */
export async function populateRTestsGallerySearch(): Promise<SearchItem[]> {
  const galleryItems: SearchItem[] = [];

  try {
    // GitHub API authentication for higher rate limits (same as used in the gallery pages)
    // Note: PRIVATE_GITHUB_TOKEN should only be used in server-side contexts
    const GITHUB_TOKEN = typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env.PRIVATE_GITHUB_TOKEN
      : undefined;

    const headers = GITHUB_TOKEN
      ? { Authorization: `token ${GITHUB_TOKEN}` }
      : {};

    // Fetch repository tree to get directories
    const treeResponse = await fetch(
      "https://api.github.com/repos/jakubsob/r-tests-gallery/git/trees/main?recursive=1",
      { headers }
    );

    const treeData = await treeResponse.json();

    // Extract top-level directories
    const directories = new Set<string>();
    treeData.tree.forEach((item: any) => {
      if (item.type === "tree" && item.path) {
        const topLevelDir = item.path.split("/")[0];
        if (!topLevelDir.startsWith(".") && topLevelDir !== "renv") {
          directories.add(topLevelDir);
        }
      }
    });

    // Fetch README files for each directory to get titles and descriptions
    for (const dirName of Array.from(directories)) {
      try {
        const readmeResponse = await fetch(
          `https://raw.githubusercontent.com/jakubsob/r-tests-gallery/main/${dirName}/README.md`,
          { headers }
        );

        let title = dirName.replace(/-/g, " ");
        let description = `Testing patterns and examples for ${title}`;
        let content = title;

        if (readmeResponse.ok) {
          const readmeText = await readmeResponse.text();

          // Parse README content
          const lines = readmeText.split("\n");

          // Find the first header (title)
          const titleMatch = lines.find((line) => line.startsWith("#"));
          if (titleMatch) {
            title = titleMatch.replace(/^#+\s*/, "").trim();
          }

          // Find description after "## When to use this pattern?"
          let foundWhenToUse = false;
          let descriptionLines: string[] = [];

          for (const line of lines) {
            if (line.startsWith("## When to use this pattern?")) {
              foundWhenToUse = true;
              continue;
            }

            if (foundWhenToUse) {
              if (line.startsWith("#")) {
                break; // Stop at next header
              }

              if (line.trim()) {
                descriptionLines.push(line.trim());
              } else if (descriptionLines.length > 0) {
                break; // Stop at first empty line after content
              }
            }
          }

          if (descriptionLines.length > 0) {
            description = descriptionLines.join(" ").trim();
          }

          // Use full README as searchable content
          content = readmeText;
        }

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

        // Add basic entry even if README fetch fails
        galleryItems.push({
          id: `r-tests-gallery-${dirName}`,
          type: 'r-tests-gallery',
          title: dirName.replace(/-/g, " "),
          description: `Testing patterns and examples for ${dirName.replace(/-/g, " ")}`,
          content: dirName.replace(/-/g, " "),
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
