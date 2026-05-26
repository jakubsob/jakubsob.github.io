import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagFilterProps {
  tags: Array<{ value: string; count: number }>;
  selectedTags: Set<string>;
  onTagToggle: (tag: string) => void;
  onSelectAll?: () => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
  className?: string;
  variant?: "default" | "sidebar";
}

export function TagFilter({
  tags,
  selectedTags,
  onTagToggle,
  onSelectAll,
  isVisible,
  onToggleVisibility,
  className,
  variant = "default",
}: TagFilterProps) {
  const selectedCount = selectedTags.size;
  const noneSelected = selectedCount === 0;

  const clearAll = () => {
    tags.forEach((tag) => {
      if (selectedTags.has(tag.value)) {
        onTagToggle(tag.value);
      }
    });
  };

  if (variant === "sidebar") {
    return (
      <div className={cn("space-y-1", className)}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-widest text-muted-foreground/60 font-medium">
            Topics
          </span>
          {!noneSelected && (
            <button
              onClick={onSelectAll ?? clearAll}
              className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              All
            </button>
          )}
        </div>
        {tags.map(({ value, count }) => (
          <button
            key={value}
            onClick={() => onTagToggle(value)}
            className={cn(
              "w-full flex items-center justify-between px-0 py-1.5 text-sm text-left transition-colors duration-150",
              noneSelected || selectedTags.has(value)
                ? "text-foreground"
                : "text-muted-foreground/50 hover:text-muted-foreground"
            )}
          >
            <span className="uppercase text-xs tracking-wide">{value}</span>
            <span className="text-xs tabular-nums">{count}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-3">
        <Button
          variant="default"
          size="sm"
          onClick={onToggleVisibility}
          className="shrink-0"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
          {selectedCount > 0 && (
            <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
              {selectedCount}
            </Badge>
          )}
        </Button>

        {selectedCount > 0 && (
          <Button variant="secondary" size="sm" onClick={clearAll}>
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {isVisible && (
        <div className="rounded-sm bg-card border p-4">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {tags.map(({ value, count }) => (
                <Button
                  key={value}
                  variant={selectedTags.has(value) ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onTagToggle(value)}
                  className="h-8 px-3 text-xs uppercase tracking-wide"
                >
                  {value}
                  <Badge
                    variant="secondary"
                    className="ml-2 px-1.5 py-0.5 text-xs bg-muted"
                  >
                    {count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
