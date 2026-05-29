import type { CollectionEntry } from "astro:content";
import { NotebookLinkCard } from "@/components/features/NotebookLinkCard";
import { PostMeta } from "@/components/features/PostMeta";

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
  const featured = variant === "featured";

  return (
    <NotebookLinkCard
      href={`/blog/${post.slug}/`}
      title={post.data.title}
      description={post.data.description}
      meta={<PostMeta post={post} selectedTags={selectedTags} />}
      size={featured ? "featured" : "regular"}
      tone={featured ? "secondary" : "background"}
      descriptionClamp={featured ? 4 : 3}
      titleClassName={featured ? "text-2xl mb-3" : undefined}
      bodyClassName={featured ? "text-base mb-6" : undefined}
      className={className}
    />
  );
}
