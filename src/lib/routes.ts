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

export interface HeaderMenuSubItem {
  title: string;
  href: string;
  description: string;
}

export interface HeaderMenuItem {
  title: string;
  href?: string;
  description?: string;
  className?: string;
  brand?: boolean;
  items?: HeaderMenuSubItem[];
}

export const APP_PATHS = {
  home: "/",
  blog: "/blog",
  resources: "/resources",
  dashboardTemplates: "/dashboard-templates",
  getRoadmap: "/get-roadmap",
  rTestsGallery: "/r-tests-gallery",
  course: "https://courses.jakubsobolewski.com",
} as const;

// Main application routes - these are manually curated for better control
export const routes: RouteConfig[] = [
  // Main navigation routes
  {
    path: APP_PATHS.home,
    label: "Home",
    description: "Homepage",
    category: "main",
    order: 1
  },
  {
    path: APP_PATHS.blog,
    label: "Blog",
    description: "Blog posts about R development",
    category: "main",
    order: 2
  },
  {
    path: APP_PATHS.resources,
    label: "Resources",
    description: "Helpful resources and tools",
    category: "main",
    order: 4
  },
  {
    path: APP_PATHS.rTestsGallery,
    label: "R Tests Gallery",
    description: "Collection of R testing patterns",
    category: "tools",
    order: 5
  },
];

export const headerMenuItems: HeaderMenuItem[] = [
  {
    title: "Jakub Sobolewski",
    href: APP_PATHS.home,
    description: "Go to homepage",
    className: "uppercase",
    brand: true,
  },
  {
    title: "blog",
    href: APP_PATHS.blog,
    className: "uppercase",
  },
  {
    title: "resources",
    className: "uppercase",
    items: [
      {
        title: "Learning resources",
        href: APP_PATHS.resources,
        description: "Browse what helped me become a better engineer.",
      },
      {
        title: "Dashboard Templates",
        href: APP_PATHS.dashboardTemplates,
        description:
          "Beautiful Shiny dashboard templates ready to use for your applications.",
      },
      {
        title: "Advance Your R Testing Roadmap",
        href: APP_PATHS.getRoadmap,
        description:
          "Step-by-step guide to building better tests for R developers.",
      },
    ],
  },
  {
    title: "R Tests Gallery",
    href: APP_PATHS.rTestsGallery,
    description: "Explore a collection of R tests and examples.",
    className: "uppercase",
  },
  {
    title: "course",
    href: APP_PATHS.course,
    className: "uppercase",
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
