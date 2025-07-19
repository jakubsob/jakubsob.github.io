import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagFilterProps {
  tags: Array<{ value: string; count: number }>;
  selectedTags: Set<string>;
  onTagToggle: (tag: string) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
  className?: string;
}

export function TagFilter({
  tags,
  selectedTags,
  onTagToggle,
  isVisible,
  onToggleVisibility,
  className
}: TagFilterProps) {
  const selectedCount = selectedTags.size;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-3">
        <Button
          variant={isVisible ? "secondary" : "outline"}
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              tags.forEach(tag => {
                if (selectedTags.has(tag.value)) {
                  onTagToggle(tag.value);
                }
              });
            }}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {isVisible && (
        <div className="rounded-lg bg-card p-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Filter by tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map(({ value, count }) => (
                <Button
                  key={value}
                  variant={selectedTags.has(value) ? "secondary" : "outline"}
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
