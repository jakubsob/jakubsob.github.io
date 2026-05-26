import { cn } from "@/lib/utils";
import { getReadingTime } from "@/utils/getReadingTime";
import FormattedDate from "@/components/FormattedDate";
import { TagList } from "@/components/TagList";

export type PostVariant = "card" | "featured";

interface PostProps {
  post: {
    slug: string;
    data: {
      title: string;
      description: string;
      pubDate: Date;
      tags: string[];
    };
    body: string;
  };
  selectedTags?: Set<string>;
  variant?: PostVariant;
  className?: string;
}


export function Post({ post, selectedTags, variant = "card", className }: PostProps) {
  if (variant === "featured") {
    return (
      <a href={`/blog/${post.slug}/`} className={cn("group/card", className)}>
        <div className="bg-card border border-border rounded-[var(--radius-surface)] p-8 transition-all duration-300 group-hover/card:shadow-md group-hover/card:-translate-y-0.5 group-hover/card:rounded-none">
          <h2 className="text-2xl leading-snug mb-3 transition-colors group-hover/card:text-muted-foreground">
            {post.data.title}
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mb-6">
            {post.data.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
            <FormattedDate date={post.data.pubDate} />
            <TagList tags={post.data.tags} selectedTags={selectedTags} />
            <span className="ml-auto uppercase tabular-nums">
              {getReadingTime(post.body)}
            </span>
          </div>
        </div>
      </a>
    );
  }

  return (
    <a href={`/blog/${post.slug}/`} className={cn("group/card", className)}>
      <div className="bg-card border border-border rounded-[var(--radius-surface)] p-4 transition-all duration-300 group-hover/card:shadow-md group-hover/card:-translate-y-0.5 group-hover/card:rounded-none">
        <h2 className="text-lg mb-2 transition-colors group-hover/card:text-muted-foreground">
          {post.data.title}
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {post.data.description}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
          <FormattedDate date={post.data.pubDate} />
          <TagList tags={post.data.tags} selectedTags={selectedTags} />
          <span className="ml-auto uppercase tabular-nums">
            {getReadingTime(post.body)}
          </span>
        </div>
      </div>
    </a>
  );
}
