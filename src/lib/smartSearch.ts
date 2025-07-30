import Fuse, { type IFuseOptions, type FuseResultMatch } from 'fuse.js';

export interface SearchItem {
  id: string;
  type: 'blog' | 'page' | 'r-tests-gallery';
  title: string;
  description?: string;
  content?: string;
  url: string;
  tags?: string[];
  pubDate?: Date;
  category?: string;
  // Additional metadata for different content types
  metadata?: {
    readingTime?: string;
    author?: string;
    featured?: boolean;
  };
}

export interface SearchResult extends SearchItem {
  score: number;
  matches?: readonly FuseResultMatch[];
}

export interface GroupedSearchResults {
  [key: string]: {
    type: string;
    label: string;
    results: SearchResult[];
    totalCount: number;
  };
}

class SmartSearchService {
  private fuse: Fuse<SearchItem> | null = null;
  private searchItems: SearchItem[] = [];

  // Fuse.js configuration with weighted keys
  private readonly fuseOptions: IFuseOptions<SearchItem> = {
    includeScore: true,
    includeMatches: true,
    threshold: 0.3, // More strict threshold for better results
    ignoreLocation: true,
    useExtendedSearch: true,
    minMatchCharLength: 2,
    findAllMatches: true,
    keys: [
      // Weighted keys - higher weight = more important for ranking
      { name: 'title', weight: 4 },           // Highest priority
      { name: 'description', weight: 2.5 },   // High priority
      { name: 'tags', weight: 2 },            // Medium-high priority
      { name: 'category', weight: 1.5 },      // Medium priority
      { name: 'content', weight: 1 },         // Lower priority
    ],
  };

  /**
   * Initialize the search service with data
   */
  public initialize(items: SearchItem[]): void {
    this.searchItems = items;
    this.fuse = new Fuse(items, this.fuseOptions);
  }

  /**
   * Add blog posts to search index
   */
  public addBlogPosts(posts: any[] = []): void {
    const blogItems: SearchItem[] = posts.map(post => ({
      id: `blog-${post.slug}`,
      type: 'blog',
      title: post.data.title,
      description: post.data.description,
      content: post.body,
      url: `/blog/${post.slug}/`,
      tags: post.data.tags,
      pubDate: post.data.pubDate,
      metadata: {
        author: 'Jakub Sobolewski',
      }
    }));

    this.searchItems.push(...blogItems);
  }

  /**
   * Add static pages to search index
   */
  public addStaticPages(): void {
    const staticPages: SearchItem[] = [
      {
        id: 'page-home',
        type: 'page',
        title: 'Home - Building Quality by Testing',
        description: 'Automated testing in R, TDD, BDD, and quality software development',
        content: 'Building quality by testing automated testing R software development TDD BDD cucumber muttest shiny testing patterns quality software development practices',
        url: '/',
        category: 'Main'
      },
      {
        id: 'page-blog',
        type: 'page',
        title: 'Blog - Automated Testing in R',
        description: 'Advanced testing and development practices in R',
        content: 'blog posts automated testing R development practices TDD BDD testing tutorials articles',
        url: '/blog/',
        category: 'Blog'
      },
      {
        id: 'page-r-tests-gallery',
        type: 'page',
        title: 'R Tests Gallery',
        description: 'A collection of testing patterns I\'ve used in R projects',
        content: 'R tests gallery testing patterns examples code samples unit tests integration tests shiny testing',
        url: '/r-tests-gallery/',
        category: 'Gallery'
      },
      {
        id: 'page-resources',
        type: 'page',
        title: 'Resources - What made me a better engineer',
        description: 'Learning TDD, BDD, software and UI design',
        content: 'resources learning materials TDD BDD software design UI design books courses youtube videos career development',
        url: '/resources/',
        category: 'Resources'
      },
      {
        id: 'page-course',
        type: 'page',
        title: 'Course - Shiny Acceptance Test-Driven Development',
        description: 'See how you can turn your app descriptions into robust acceptance tests, fast',
        content: 'course shiny acceptance test driven development ATDD testing course training',
        url: '/course/',
        category: 'Course'
      }
    ];

    this.searchItems.push(...staticPages);
  }

  /**
   * Add R Tests Gallery items (can be populated dynamically)
   */
  public addRTestsGalleryItems(galleryItems: SearchItem[] = []): void {
    if (galleryItems.length > 0) {
      this.searchItems.push(...galleryItems);
    }
  }

  /**
   * Perform search and return grouped results
   */
  public search(query: string, maxResults: number = 20): GroupedSearchResults {
    if (!this.fuse || !query.trim()) {
      return {};
    }

    const fuseResults = this.fuse.search(query, { limit: maxResults });

    // Convert Fuse results to SearchResult format
    const searchResults: SearchResult[] = fuseResults.map(result => ({
      ...result.item,
      score: result.score || 0,
      matches: result.matches
    }));

    // Group results by type
    const grouped: GroupedSearchResults = {};

    for (const result of searchResults) {
      const type = result.type;

      if (!grouped[type]) {
        grouped[type] = {
          type,
          label: this.getTypeLabel(type),
          results: [],
          totalCount: 0
        };
      }

      grouped[type].results.push(result);
      grouped[type].totalCount++;
    }

    // Sort groups by relevance (blog posts first, then pages, then gallery)
    const typeOrder = ['blog', 'page', 'r-tests-gallery'];
    const sortedGrouped: GroupedSearchResults = {};

    for (const type of typeOrder) {
      if (grouped[type]) {
        // Sort results within each group by score (lower score = better match in Fuse.js)
        grouped[type].results.sort((a, b) => (a.score || 0) - (b.score || 0));
        sortedGrouped[type] = grouped[type];
      }
    }

    return sortedGrouped;
  }

  /**
   * Get user-friendly label for content type
   */
  private getTypeLabel(type: string): string {
    switch (type) {
      case 'blog':
        return 'Blog Posts';
      case 'page':
        return 'Pages';
      case 'r-tests-gallery':
        return 'R Tests Gallery';
      default:
        return type;
    }
  }

  /**
   * Get all search items (useful for debugging)
   */
  public getAllItems(): SearchItem[] {
    return this.searchItems;
  }

  /**
   * Clear search index
   */
  public clear(): void {
    this.searchItems = [];
    this.fuse = null;
  }

  /**
   * Highlight matching text in search results
   */
  public static highlightMatches(text: string, matches?: readonly FuseResultMatch[]): string {
    if (!matches || matches.length === 0) {
      return text;
    }

    // Find matches for the text field
    const textMatches = matches.filter(match =>
      match.key === 'title' || match.key === 'description'
    );

    if (textMatches.length === 0) {
      return text;
    }

    let highlightedText = text;
    const highlights: Array<{ start: number; end: number }> = [];

    // Collect all highlight ranges
    textMatches.forEach(match => {
      if (match.indices) {
        match.indices.forEach(([start, end]) => {
          highlights.push({ start, end });
        });
      }
    });

    // Sort by start position (descending to process from end to start)
    highlights.sort((a, b) => b.start - a.start);

    // Apply highlights
    highlights.forEach(({ start, end }) => {
      const beforeMatch = highlightedText.slice(0, start);
      const matchText = highlightedText.slice(start, end + 1);
      const afterMatch = highlightedText.slice(end + 1);

      highlightedText = `${beforeMatch}<mark class="bg-yellow-200 px-1 rounded">${matchText}</mark>${afterMatch}`;
    });

    return highlightedText;
  }
}

// Export singleton instance
export const smartSearchService = new SmartSearchService();
