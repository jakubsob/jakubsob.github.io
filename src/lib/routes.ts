// Route configuration for automatic link generation
export interface RouteConfig {
  path: string;
  label: string;
  description?: string;
  external?: boolean;
  category?: 'main' | 'tools' | 'social';
  order?: number; // For custom ordering
  hidden?: boolean; // To hide from navigation
}

// Main application routes - these are manually curated for better control
export const routes: RouteConfig[] = [
  // Main navigation routes
  {
    path: "/",
    label: "Home",
    description: "Homepage",
    category: "main",
    order: 1
  },
  {
    path: "/blog",
    label: "Blog",
    description: "Blog posts about R development",
    category: "main",
    order: 2
  },
  {
    path: "/resources",
    label: "Resources",
    description: "Helpful resources and tools",
    category: "main",
    order: 3
  },
  {
    path: "/r-tests-gallery",
    label: "R Tests Gallery",
    description: "Collection of R testing patterns",
    category: "tools",
    order: 4
  },
];

// Social media links
export const socialLinks: RouteConfig[] = [
  {
    path: "https://www.linkedin.com/in/jakub-sobolewski-r/",
    label: "LinkedIn",
    external: true,
    category: "social",
    order: 1
  },
  {
    path: "https://bsky.app/profile/jakub-sobolewski.bsky.social/",
    label: "Bluesky",
    external: true,
    category: "social",
    order: 2
  },
  {
    path: "https://jakubsobolewski.medium.com/",
    label: "Medium",
    external: true,
    category: "social",
    order: 3
  },
  {
    path: "https://www.github.com/jakubsob/",
    label: "Github",
    external: true,
    category: "social",
    order: 4
  }
];

// Helper function to get routes by category
export function getRoutesByCategory(category: string): RouteConfig[] {
  return routes
    .filter(route => route.category === category)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

// Helper function to get all main navigation routes (excluding hidden ones)
export function getMainRoutes(): RouteConfig[] {
  return routes
    .filter(route => route.category === 'main' && !route.hidden)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

// Helper function to get all tool routes
export function getToolRoutes(): RouteConfig[] {
  return routes
    .filter(route => route.category === 'tools')
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

// Helper function to get all social links
export function getSocialLinks(): RouteConfig[] {
  return socialLinks.sort((a, b) => (a.order || 0) - (b.order || 0));
}

// Helper function to get all routes for footer (including hidden ones)
export function getFooterRoutes(): RouteConfig[] {
  return routes
    .filter(route => !route.external)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

// Helper function to get navigation routes (for header)
export function getNavigationRoutes(): RouteConfig[] {
  return routes
    .filter(route => !route.external && !route.hidden)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}
