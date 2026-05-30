import { useState, useEffect, useRef, useCallback } from "react";
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

export function SmartSearchButton() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const loadStarted = useRef(false);

  // Fetch the prebuilt search index lazily (it lives in a single cacheable
  // /search-index.json instead of being inlined into every page's HTML).
  const loadIndex = useCallback(() => {
    if (loadStarted.current) return;
    loadStarted.current = true;
    fetch("/search-index.json")
      .then((res) => {
        if (!res.ok) throw new Error(`search-index ${res.status}`);
        return res.json() as Promise<SearchItem[]>;
      })
      .then((items) => {
        smartSearchService.initialize(items);
        setIsReady(true);
      })
      .catch((error) => {
        // Allow a later open() to retry.
        loadStarted.current = false;
        console.warn("Failed to load search index:", error);
      });
  }, []);

  // Prefetch when the browser is idle so the index is usually ready before the
  // user opens search — but the button works regardless (see handleSearchOpen).
  useEffect(() => {
    const ric = window.requestIdleCallback;
    if (ric) {
      const id = ric(loadIndex);
      return () => window.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(loadIndex, 2000);
    return () => window.clearTimeout(id);
  }, [loadIndex]);

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
    loadIndex();
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
        className="group flex aspect-square items-center gap-2 text-sm uppercase tracking-wider"
        aria-label="Search all content"
      >
        <Search className="size-[1em]" />
      </Button>

      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={handleSearchClose}
        isReady={isReady}
      />
    </>
  );
}
