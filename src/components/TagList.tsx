import { cn } from "@/lib/utils";

interface TagListProps {
  tags: string[];
  selectedTags?: Set<string>;
  linked?: boolean;
}

export function TagList({ tags, selectedTags, linked = false }: TagListProps) {
  const noneSelected = !selectedTags || selectedTags.size === 0;

  return (
    <div className="flex items-center gap-1.5">
      {[...tags].sort((a, b) => a.localeCompare(b)).map((tag) => {
        const active = noneSelected || selectedTags?.has(tag);
        const className = cn(
          "text-xs uppercase tracking-wide transition-colors",
          active ? "text-foreground/60" : "text-muted-foreground/30"
        );

        return linked ? (
          <a key={tag} href={`/tags/${tag}`} className={cn(className, "no-underline hover:text-foreground")}>
            {tag}
          </a>
        ) : (
          <span key={tag} className={className}>
            {tag}
          </span>
        );
      })}
    </div>
  );
}
