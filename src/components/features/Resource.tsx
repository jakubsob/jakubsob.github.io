import { ExternalLink } from "lucide-react";
import { TagList } from "@/components/features/TagList";
import { CardMetaRow } from "@/components/features/CardMetaRow";
import { NotebookLinkCard } from "@/components/features/NotebookLinkCard";

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
      <CardMetaRow>
        <TagList
          tags={[item.group, item.format, item.actionability]}
          selectedTags={selectedTags}
        />
      </CardMetaRow>
    ) : (
      <CardMetaRow>
        <TagList tags={[item.group]} selectedTags={selectedTags} />
        <span className="uppercase">{item.actionability}</span>
        <span className="ml-auto uppercase">{item.format}</span>
      </CardMetaRow>
    );

  return (
    <NotebookLinkCard
      href={item.href}
      title={title}
      description={item.description}
      meta={meta}
      size={variant === "featured" ? "hero" : "featured"}
      tone={variant === "featured" ? "secondary" : "background"}
      descriptionClamp={variant === "featured" ? 4 : 3}
      external
      className={className}
    />
  );
}
