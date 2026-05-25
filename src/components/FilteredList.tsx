import { useState } from "react";
import { TagFilter } from "@/components/TagFilter";
import { SearchX } from "lucide-react";

interface FilteredListProps<T> {
  items: T[];
  getTags: (item: T) => string[];
  renderItem: (item: T, selectedTags: Set<string>) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
}

export function FilteredList<T>({
  items,
  getTags,
  renderItem,
  keyExtractor = (_, i) => i,
}: FilteredListProps<T>) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const allTags = [...new Set(items.flatMap(getTags))].sort((a, b) =>
    a.localeCompare(b)
  );

  const tagsWithCounts = allTags.map((tag) => ({
    value: tag,
    count: items.filter((item) => getTags(item).includes(tag)).length,
  }));

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const filteredItems =
    selectedTags.size === 0
      ? items
      : items.filter((item) => getTags(item).some((tag) => selectedTags.has(tag)));

  const sidebar = (
    <TagFilter
      tags={tagsWithCounts}
      selectedTags={selectedTags}
      onTagToggle={handleTagToggle}
      onSelectAll={() => setSelectedTags(new Set())}
      isVisible={true}
      onToggleVisibility={() => {}}
      variant="sidebar"
    />
  );

  const emptyState = (
    <div className="py-12 flex flex-col items-center gap-4 text-muted-foreground">
      <SearchX className="h-8 w-8" />
      <p className="text-sm">No results match the selected topics.</p>
    </div>
  );

  return (
    <div className="flex gap-12">
      <aside className="hidden lg:block w-40 shrink-0">
        <div className="sticky top-[72px]">{sidebar}</div>
      </aside>
      <div className="flex-1 min-w-0">
        <div className="lg:hidden mb-6">{sidebar}</div>
        {filteredItems.length > 0 ? (
          <div className="flex flex-col gap-2">
            {filteredItems.map((item, i) => (
              <div key={keyExtractor(item, i)}>
                {renderItem(item, selectedTags)}
              </div>
            ))}
          </div>
        ) : (
          emptyState
        )}
      </div>
    </div>
  );
}
