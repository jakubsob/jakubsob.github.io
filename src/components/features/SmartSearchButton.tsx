import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { GlobalSearch } from "./GlobalSearch";
import { smartSearchService, type SearchItem } from "@/lib/smartSearch";
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
  galleryItems?: SearchItem[];
}

export function SmartSearchButton({ posts, galleryItems = [] }: SmartSearchButtonProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize search service with build-time data (no client-side fetching)
  useEffect(() => {
    smartSearchService.clear();
    smartSearchService.addBlogPosts(posts);
    smartSearchService.addStaticPages();
    smartSearchService.addRTestsGalleryItems(galleryItems);
    smartSearchService.initialize(smartSearchService.getAllItems());
    setIsInitialized(true);
  }, [posts, galleryItems]);

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
        className="group flex aspect-square items-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Search all content"
      >
        <Search className="size-[1em]" />
      </Button>

      {isInitialized && (
        <GlobalSearch isOpen={isSearchOpen} onClose={handleSearchClose} />
      )}
    </>
  );
}
