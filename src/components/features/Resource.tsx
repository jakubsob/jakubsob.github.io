import { ExternalLink } from "lucide-react";
import { TagList } from "@/components/features/TagList";
import { Item } from "@/components/features/Item";

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
  const title = (
    <>
      {item.title}
      <ExternalLink
        className={`opacity-0 group-hover/card:opacity-50 transition-opacity shrink-0 ${
          variant === "featured" ? "h-4 w-4" : "h-3.5 w-3.5"
        }`}
      />
    </>
  );

  const meta =
    variant === "featured" ? (
      <TagList
        tags={[item.group, item.format, item.actionability]}
        selectedTags={selectedTags}
      />
    ) : (
      <>
        <TagList tags={[item.group]} selectedTags={selectedTags} />
        <span className="uppercase">{item.actionability}</span>
        <span className="ml-auto uppercase">{item.format}</span>
      </>
    );

  return (
    <Item
      href={item.href}
      title={title}
      description={item.description}
      meta={meta}
      variant={variant}
      external
      className={className}
    />
  );
}
