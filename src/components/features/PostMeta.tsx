import type { CollectionEntry } from "astro:content";
import { getReadingTime } from "@/utils/getReadingTime";
import FormattedDate from "@/components/features/FormattedDate";
import { TagList } from "@/components/features/TagList";
import { CardMetaRow } from "@/components/features/CardMetaRow";

interface PostMetaProps {
  post: CollectionEntry<"blog">;
  selectedTags?: Set<string>;
  className?: string;
}

export function PostMeta({ post, selectedTags, className }: PostMetaProps) {
  return (
    <CardMetaRow className={className}>
      <FormattedDate date={post.data.pubDate} />
      <TagList tags={post.data.tags} selectedTags={selectedTags} />
      <span className="ml-auto uppercase tabular-nums shrink-0">
        {getReadingTime(post.body)}
      </span>
    </CardMetaRow>
  );
}
