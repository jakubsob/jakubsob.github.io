import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { GlobalSearch } from "./GlobalSearch";

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

interface SearchButtonProps {
  posts: any[];
  className?: string;
  isMobile?: boolean;
}

export function SearchButton({ posts, className = "", isMobile = false }: SearchButtonProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
      <button
        onClick={handleSearchOpen}
        className={`group flex items-center gap-2 border rounded-sm px-4 py-2 transition-all text-sm font-code uppercase tracking-wider hover:border-primary hover:text-primary ${className}`}
        aria-label="Search blog posts"
      >
        <Search className="size-[1em]" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline-flex pointer-events-none select-none items-center gap-1 rounded-sm border px-1.5 group-hover:border-primary">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={handleSearchClose}
        posts={posts}
      />
    </>
  );
}
