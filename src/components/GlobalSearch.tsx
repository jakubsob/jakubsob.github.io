import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X, FileText, Calendar, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: "blog";
  title: string;
  description?: string;
  slug: string;
  tags: string[];
  pubDate: Date;
  url: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  posts: any[];
}

export function GlobalSearch({ isOpen, onClose, posts }: GlobalSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  // Transform posts into search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();

    return posts
      .filter((post) => {
        const titleMatch = post.data.title?.toLowerCase().includes(query);
        const descriptionMatch = post.data.description?.toLowerCase().includes(query);
        const tagMatch = post.data.tags?.some((tag: string) =>
          tag.toLowerCase().includes(query)
        );
        const bodyMatch = post.body?.toLowerCase().includes(query);

        return titleMatch || descriptionMatch || tagMatch || bodyMatch;
      })
      .slice(0, 8) // Limit results to prevent overwhelming UI
      .map((post) => ({
        type: "blog" as const,
        title: post.data.title,
        description: post.data.description,
        slug: post.slug,
        tags: post.data.tags,
        pubDate: post.data.pubDate,
        url: `/blog/${post.slug}/`
      }));
  }, [searchQuery, posts]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      setIsVisible(true);
      // Focus search input when opened
      setTimeout(() => {
        const searchInput = document.getElementById("global-search-input");
        searchInput?.focus();
      }, 100);
    } else {
      setIsVisible(false);
      setSearchQuery("");
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Handle global keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!isOpen) {
          // Open search - but we need to trigger the parent's setIsOpen
          // This will be handled by SearchButton component
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeydown);
    return () => document.removeEventListener("keydown", handleGlobalKeydown);
  }, [isOpen]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const handleResultClick = (result: SearchResult) => {
    window.location.href = result.url;
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen && !isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "absolute h-screen inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Search Modal */}
      <div
        className={cn(
          "fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-[65ch] z-50 transition-all duration-200",
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
      >
        <Card className="shadow-2xl border-slate-200">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                id="global-search-input"
                placeholder="Search blog posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-transparent text-lg focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
              />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
                <button
                  onClick={onClose}
                  className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0 max-h-96 overflow-y-auto">
            {searchQuery.trim() === "" ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Start typing to search blog posts...</p>
                <p className="text-xs mt-2">Search by title, content, tags, or description</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No results found for "{searchQuery}"</p>
                <p className="text-xs mt-2">Try different keywords or browse all posts</p>
                <a
                  href="/blog"
                  className="inline-block mt-3 text-primary hover:underline text-sm"
                  onClick={onClose}
                >
                  View all blog posts →
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((result, index) => (
                  <button
                    key={`${result.type}-${result.slug}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left p-4 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group"
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5 group-hover:text-primary transition-colors" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {result.title}
                        </h3>
                        {result.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {result.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(result.pubDate)}
                          </div>
                          {result.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Tag className="h-3 w-3 text-muted-foreground" />
                              <div className="flex gap-1">
                                {result.tags.slice(0, 3).map((tag: string) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="text-xs px-1.5 py-0.5 h-auto"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {result.tags.length > 3 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{result.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
