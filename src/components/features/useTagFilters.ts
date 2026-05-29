import { useMemo, useState } from "react";

interface TagWithCount {
  value: string;
  count: number;
}

interface UseTagFiltersResult<T> {
  selectedTags: Set<string>;
  noneSelected: boolean;
  tagsWithCounts: TagWithCount[];
  filteredItems: T[];
  toggleTag: (tag: string) => void;
  clearTags: () => void;
}

export function useTagFilters<T>(
  items: T[],
  getTags: (item: T) => string[],
): UseTagFiltersResult<T> {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const noneSelected = selectedTags.size === 0;

  const tagsWithCounts = useMemo(() => {
    const tags = [...new Set(items.flatMap(getTags))].sort((a, b) =>
      a.localeCompare(b),
    );

    return tags.map((tag) => ({
      value: tag,
      count: items.filter((item) => getTags(item).includes(tag)).length,
    }));
  }, [items, getTags]);

  const filteredItems = useMemo(
    () =>
      noneSelected
        ? items
        : items.filter((item) =>
            getTags(item).some((tag) => selectedTags.has(tag)),
          ),
    [items, getTags, selectedTags, noneSelected],
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const clearTags = () => setSelectedTags(new Set());

  return {
    selectedTags,
    noneSelected,
    tagsWithCounts,
    filteredItems,
    toggleTag,
    clearTags,
  };
}
