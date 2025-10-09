import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { GlobalSearch } from "./GlobalSearch";
import { smartSearchService } from "@/lib/smartSearch";
import { populateRTestsGallerySearch } from "@/lib/gallerySearchData";
import { Button } from "@/components/ui/button";

// Global search state interface
declare global {
  interface Window {
    globalSearch?: {
      open: () => void;
      close: () => void;
      toggle: () => void;
      subscribe: (callback: (isOpen: boolean) => void) => () => void;
    };
  }
}

interface SmartSearchButtonProps {
  posts: any[];
  isMobile?: boolean;
}

export function SmartSearchButton({ posts, isMobile = false }: SmartSearchButtonProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize search service with all data
  useEffect(() => {
    async function initializeSearch() {
      try {
        // Clear existing data
        smartSearchService.clear();

        // Add blog posts
        smartSearchService.addBlogPosts(posts);

        // Add static pages
        smartSearchService.addStaticPages();

        // Fetch and add R Tests Gallery items
        const galleryItems = await populateRTestsGallerySearch();
        smartSearchService.addRTestsGalleryItems(galleryItems);

        // Initialize the search index
        smartSearchService.initialize(smartSearchService.getAllItems());

        setIsInitialized(true);
        console.log(`Initialized search with ${smartSearchService.getAllItems().length} items`);
      } catch (error) {
        console.warn('Failed to initialize search service:', error);
        // Initialize with fallback data
        smartSearchService.clear();
        smartSearchService.addBlogPosts(posts);
        smartSearchService.addStaticPages();
        smartSearchService.addRTestsGalleryItems(); // Uses fallback data
        smartSearchService.initialize(smartSearchService.getAllItems());
        setIsInitialized(true);
      }
    }

    initializeSearch();
  }, [posts]);

  // Subscribe to global search state
  useEffect(() => {
    if (typeof window !== "undefined" && window.globalSearch) {
      const unsubscribe = window.globalSearch.subscribe((isOpen: boolean) => {
        setIsSearchOpen(isOpen);
      });
      return unsubscribe;
    }
  }, []);

  const handleSearchOpen = () => {
    if (!isInitialized) {
      console.warn('Search service not yet initialized');
      return;
    }

    if (typeof window !== "undefined" && window.globalSearch) {
      window.globalSearch.open();
    } else {
      setIsSearchOpen(true);
    }
  };

  const handleSearchClose = () => {
    if (typeof window !== "undefined" && window.globalSearch) {
      window.globalSearch.close();
    } else {
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        shape="pill"
        onClick={handleSearchOpen}
        disabled={!isInitialized}
        className="group flex items-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Search all content"
      >
        <Search className="size-[1em]" />
        <kbd className="hidden sm:inline-flex pointer-events-none select-none items-center gap-1 rounded-full border border-muted-foreground px-1.5">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {isInitialized && (
        <GlobalSearch
          isOpen={isSearchOpen}
          onClose={handleSearchClose}
        />
      )}
    </>
  );
}
