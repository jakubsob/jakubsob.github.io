import type { CollectionEntry } from "astro:content";
import { getReadingTime } from "@/utils/getReadingTime";
import FormattedDate from "@/components/features/FormattedDate";
import { TagList } from "@/components/features/TagList";
import { CardMetaRow } from "@/components/features/CardMetaRow";

type BlogPostData = CollectionEntry<"blog">["data"];

interface PostMetaProps {
  // Structural minimum so this works with both full collection entries and
  // the lightweight list items the blog index passes (no `body` shipped).
  // Picking from the real schema keeps optionality identical to the source.
  post: { data: Pick<BlogPostData, "pubDate" | "tags">; body?: string };
  // Precomputed on the server so full post bodies don't need to ship to the
  // client. Falls back to computing from `body` when not provided.
  readingTime?: string;
  selectedTags?: Set<string>;
  className?: string;
}

export function PostMeta({
  post,
  readingTime,
  selectedTags,
  className,
}: PostMetaProps) {
  const time = readingTime ?? (post.body ? getReadingTime(post.body) : "");
  return (
    <CardMetaRow className={className}>
      <FormattedDate date={post.data.pubDate} />
      <TagList tags={post.data.tags} selectedTags={selectedTags} />
      <span className="ml-auto uppercase tabular-nums shrink-0">{time}</span>
    </CardMetaRow>
  );
}
