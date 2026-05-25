import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { TagList } from "@/components/TagList";

export type ResourceVariant = "card" | "featured";

export interface ResourceItem {
  title: string;
  description: string;
  href: string;
  format: string;
  group: string;
  actionability: string;
}

interface ResourceProps {
  item: ResourceItem;
  selectedTags?: Set<string>;
  variant?: ResourceVariant;
  className?: string;
}


export function Resource({ item, selectedTags, variant = "card", className }: ResourceProps) {
  if (variant === "featured") {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn("group/card", className)}
      >
        <div className="bg-card border border-border rounded-md p-8 transition-all duration-300 group-hover/card:shadow-md group-hover/card:-translate-y-0.5">
          <h2 className="text-2xl font-light leading-snug mb-3 transition-colors group-hover/card:text-muted-foreground flex items-center gap-2">
            {item.title}
            <ExternalLink className="h-4 w-4 opacity-0 group-hover/card:opacity-50 transition-opacity shrink-0" />
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mb-6">
            {item.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
            <TagList tags={[item.group, item.format, item.actionability]} selectedTags={selectedTags} />
          </div>
        </div>
      </a>
    );
  }

  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("group/card", className)}
    >
      <div className="bg-card border border-border rounded-md p-4 transition-all duration-300 group-hover/card:shadow-md group-hover/card:-translate-y-0.5">
        <h2 className="font-medium mb-2 transition-colors group-hover/card:text-muted-foreground flex items-center gap-2">
          {item.title}
          <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover/card:opacity-50 transition-opacity shrink-0" />
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {item.description}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
          <TagList tags={[item.group]} selectedTags={selectedTags} />
          <span className="uppercase">{item.actionability}</span>
          <span className="ml-auto uppercase">{item.format}</span>
        </div>
      </div>
    </a>
  );
}
