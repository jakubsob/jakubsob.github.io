import { TagFilter } from "@/components/features/TagFilter";
import { SearchX } from "lucide-react";
import { Notebook } from "@/components/ui/notebook/Notebook";
import { cn } from "@/lib/utils";
import { useTagFilters } from "@/components/features/useTagFilters";

type FilteredListLayout = "stack" | "notebook";

interface FilteredListProps<T> {
  items: T[];
  getTags: (item: T) => string[];
  renderItem: (
    item: T,
    selectedTags: Set<string>,
    index?: number,
  ) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
  layout?: FilteredListLayout;
  rowH?: string;
  sidebarTitle?: string;
  emptyMessage?: string;
}

export function FilteredList<T>({
  items,
  getTags,
  renderItem,
  keyExtractor = (_, i) => i,
  layout = "stack",
  rowH = "240px",
  sidebarTitle = "Topics",
  emptyMessage = "No results match the selected topics.",
}: FilteredListProps<T>) {
  const {
    selectedTags,
    noneSelected,
    tagsWithCounts,
    filteredItems,
    toggleTag,
    clearTags,
  } = useTagFilters(items, getTags);

  const sidebar = (
    <TagFilter
      tags={tagsWithCounts}
      selectedTags={selectedTags}
      onTagToggle={toggleTag}
      onSelectAll={clearTags}
      isVisible={true}
      onToggleVisibility={() => {}}
      variant="sidebar"
    />
  );

  const emptyState = (
    <div className="py-12 flex flex-col items-center gap-4 text-muted-foreground">
      <SearchX className="h-8 w-8" />
      <p className="text-sm">{emptyMessage}</p>
    </div>
  );

  if (layout === "notebook") {
    const numRows = Math.ceil(Math.max(filteredItems.length, 1) / 2);

    return (
      <Notebook
        lines="both"
        rowH={rowH}
        cellGap="2px"
        className="notebook--cell-separators"
      >
        <div
          className={cn(
            "col-[1/-1] md:col-[1/3]",
            "md:sticky md:top-14 md:self-start",
          )}
          style={
            {
              gridRowStart: 1,
              gridRowEnd: 1 + numRows,
            } as React.CSSProperties
          }
        >
          <div className="md:hidden flex flex-wrap items-stretch bg-background border-b">
            <span className="px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground/40 border-r border-foreground/[0.07] shrink-0 flex items-center">
              {sidebarTitle}
            </span>
            {tagsWithCounts.map(({ value, count }) => {
              const active = selectedTags.has(value);
              const dimmed = !noneSelected && !active;
              return (
                <button
                  key={value}
                  onClick={() => toggleTag(value)}
                  className={cn(
                    "px-4 py-3 text-xs uppercase tracking-wide shrink-0 transition-colors",
                    active && "text-foreground",
                    dimmed && "text-muted-foreground/25",
                    !active &&
                      !dimmed &&
                      "text-muted-foreground/60 hover:text-foreground",
                  )}
                >
                  {value}
                  <span className="ml-1 opacity-40 tabular-nums">{count}</span>
                </button>
              );
            })}
            {!noneSelected ? (
              <button
                onClick={clearTags}
                className="ml-auto px-4 py-3 text-xs text-muted-foreground/40 hover:text-foreground transition-colors shrink-0"
              >
                Clear
              </button>
            ) : null}
          </div>

          <div className="hidden md:block p-6 bg-background border-b">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-5">
              {sidebarTitle}
            </p>
            <div className="flex flex-col">
              {tagsWithCounts.map(({ value, count }) => {
                const active = selectedTags.has(value);
                const dimmed = !noneSelected && !active;
                return (
                  <button
                    key={value}
                    onClick={() => toggleTag(value)}
                    className={cn(
                      "flex items-center justify-between py-2 text-xs uppercase tracking-wide transition-colors text-left",
                      active && "text-foreground",
                      dimmed && "text-muted-foreground/25",
                      !active &&
                        !dimmed &&
                        "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span>{value}</span>
                    <span className="tabular-nums opacity-40">{count}</span>
                  </button>
                );
              })}
              {!noneSelected ? (
                <button
                  onClick={clearTags}
                  className="mt-5 text-xs text-muted-foreground/40 hover:text-foreground transition-colors text-left"
                >
                  Clear all
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {filteredItems.length > 0 ? (
          filteredItems.map((item, i) => {
            const row = Math.floor(i / 2) + 1;
            const isLeft = i % 2 === 0;

            return (
              <div
                key={keyExtractor(item, i)}
                className={cn(
                  "col-[1/-1]",
                  isLeft
                    ? "md:col-[3/6] lg:col-[3/8]"
                    : "md:col-[6/9] lg:col-[8/-1]",
                )}
                style={{ gridRowStart: row }}
              >
                {renderItem(item, selectedTags, i)}
              </div>
            );
          })
        ) : (
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-3 text-muted-foreground/30",
              "col-[1/-1] md:col-[3/9] lg:col-[3/-1]",
            )}
            style={{ gridRowStart: 1, gridRowEnd: 3 }}
          >
            <SearchX className="h-6 w-6" />
            <p className="text-xs uppercase tracking-widest">{emptyMessage}</p>
          </div>
        )}
      </Notebook>
    );
  }

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
                {renderItem(item, selectedTags, i)}
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
