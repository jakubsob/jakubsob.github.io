import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EyebrowLabel } from "@/components/ui/eyebrow-label";
import { Search, X, FileText } from "lucide-react";
import { smartSearchService, type GroupedSearchResults, type SearchResult } from "@/lib/smartSearch";
import { NotebookLinkCard } from "@/components/features/NotebookLinkCard";
import { CardMetaRow } from "@/components/features/CardMetaRow";
import { TagList } from "@/components/features/TagList";
import FormattedDate from "@/components/features/FormattedDate";

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GroupedSearchResults>({});
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({});
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      const results = smartSearchService.search(searchQuery, 15);
      setSearchResults(results);
      setIsSearching(false);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      setTimeout(() => {
        document.getElementById("global-search-input")?.focus();
      }, 100);
    } else {
      setSearchQuery("");
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getResultMeta = (result: SearchResult) => (
    <CardMetaRow className="pt-3 text-muted-foreground/60">
      {result.pubDate && <FormattedDate date={new Date(result.pubDate)} />}
      {result.tags && result.tags.length > 0 && <TagList tags={result.tags} />}
      {result.category && (
        <span className="uppercase tracking-wide">{result.category}</span>
      )}
    </CardMetaRow>
  );

  const totalResults = Object.values(searchResults).reduce(
    (sum, group) => sum + group.totalCount,
    0,
  );
  const hasResults = totalResults > 0;
  const isEmpty = searchQuery.trim() === "";
  const showNoResults = !isEmpty && !isSearching && !hasResults;

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 motion-opacity-in-0 motion-duration-200"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-[65ch] z-50">
        <Card className="shadow-2xl border bg-secondary motion-preset-slide-up-sm motion-duration-150">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                id="global-search-input"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-transparent text-lg focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
              />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
            {isEmpty ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">
                  Start typing to search across all content...
                </p>
                <p className="text-xs mt-2">
                  Search blog posts, pages, and R Tests Gallery
                </p>
              </div>
            ) : isSearching ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
                <p className="text-sm">Searching...</p>
              </div>
            ) : showNoResults ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No results found for "{searchQuery}"</p>
                <p className="text-xs mt-2">
                  Try different keywords or browse all content
                </p>
                <div className="flex flex-col gap-2 justify-center items-center mt-4">
                  <a
                    href="/blog"
                    className="w-fit text-primary link-underline text-sm"
                    onClick={onClose}
                  >
                    View all blog posts →
                  </a>
                  <a
                    href="/r-tests-gallery"
                    className="w-fit text-primary link-underline text-sm"
                    onClick={onClose}
                  >
                    Browse R Tests Gallery →
                  </a>
                </div>
              </div>
            ) : hasResults ? (
              <div className="space-y-6">
                {Object.entries(searchResults).map(([type, group]) => (
                  <div key={type} className="space-y-2">
                    <EyebrowLabel className="flex items-center gap-2 px-2 py-1 mb-0">
                      <span>{group.label}</span>
                      <Badge className="ml-auto text-xs">
                        {group.totalCount}
                      </Badge>
                    </EyebrowLabel>

                    <div className="flex flex-col gap-2">
                      {group.results.map((result, index) => (
                        <NotebookLinkCard
                          key={`${result.id}-${index}`}
                          href={result.url}
                          title={result.title}
                          description={result.description ?? ""}
                          size="regular"
                          tone="background"
                          descriptionClamp={3}
                          className="rounded-[var(--radius-surface)] p-4"
                          titleClassName="text-xl mb-2"
                          bodyClassName="mb-4"
                          meta={getResultMeta(result)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
