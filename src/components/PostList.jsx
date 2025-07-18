import { useState, useMemo } from "react";
import { PostCard } from "@/components/PostCard";
import { Search } from "@/components/SearchComponent";
import { TagFilter } from "@/components/TagFilter";
import { Card, CardContent } from "@/components/ui/card";
import { Animate } from "@/components/ui/animate";
import { SearchX } from "lucide-react";

function PostList({ posts, showControls = true }) {
  const [searchResults, setSearchResults] = useState(posts);
  const [selectedTags, setSelectedTags] = useState(
    new Set(posts.flatMap((post) => post.data.tags))
  );
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  const searchOptions = useMemo(
    () => ({
      keys: ["data.title", "data.description"],
      shouldSort: true,
      findAllMatches: true,
      minMatchCharLength: 2,
      threshold: 0.6,
    }),
    []
  );

  const getTagsWithCounts = () => {
    const counts = searchResults.reduce((acc, post) => {
      post.data.tags.forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {});

    return [...new Set(posts.flatMap((post) => post.data.tags))].map((tag) => ({
      value: tag,
      count: counts[tag] || 0,
    }));
  };

  const handleTagFilter = (tag) => {
    setSelectedTags((prev) => {
      const newTags = new Set(prev);
      if (newTags.has(tag)) {
        newTags.delete(tag);
      } else {
        newTags.add(tag);
      }
      return newTags;
    });
  };

  const filteredPosts = searchResults.filter((post) => {
    const hasMatchingTag = post.data.tags.some((tag) => selectedTags.has(tag));
    return hasMatchingTag;
  });

  return (
    <div className="space-y-6">
      {showControls && (
        <div className="space-y-4">
          <Search
            searchList={posts}
            fuseOptions={searchOptions}
            onSearch={setSearchResults}
            placeholder={`Search through ${posts.length} posts...`}
            className="max-w-md"
          />

          <TagFilter
            tags={getTagsWithCounts()}
            selectedTags={selectedTags}
            onTagToggle={handleTagFilter}
            isVisible={isFiltersVisible}
            onToggleVisibility={() => setIsFiltersVisible(!isFiltersVisible)}
          />
        </div>
      )}

      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <Animate>
              <PostCard
                key={post.slug}
                post={post}
                selectedTags={selectedTags}
                className="max-w-none"
              />
            </Animate>
          ))
        ) : (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <SearchX className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-foreground">
                  No posts found
                </h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default PostList;
