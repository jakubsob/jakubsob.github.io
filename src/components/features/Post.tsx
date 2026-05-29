import type { CollectionEntry } from "astro:content";
import { getReadingTime } from "@/utils/getReadingTime";
import FormattedDate from "@/components/features/FormattedDate";
import { TagList } from "@/components/features/TagList";
import { Item } from "@/components/features/Item";

export type PostVariant = "card" | "featured";

interface PostProps {
  post: CollectionEntry<"blog">;
  selectedTags?: Set<string>;
  variant?: PostVariant;
  className?: string;
}

export function Post({
  post,
  selectedTags,
  variant = "featured",
  className,
}: PostProps) {
  const meta = (
    <>
      <FormattedDate date={post.data.pubDate} />
      <TagList tags={post.data.tags} selectedTags={selectedTags} />
      <span className="ml-auto uppercase tabular-nums">
        {getReadingTime(post.body)}
      </span>
    </>
  );

  return (
    <Item
      href={`/blog/${post.slug}/`}
      title={post.data.title}
      description={post.data.description}
      meta={meta}
      variant={variant}
      className={className}
    />
  );
}
