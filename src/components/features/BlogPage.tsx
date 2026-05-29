import { useState, useMemo } from "react";
import type { CollectionEntry } from "astro:content";
import { getReadingTime } from "@/utils/getReadingTime";
import FormattedDate from "@/components/features/FormattedDate";
import { TagList } from "@/components/features/TagList";
import { cn } from "@/lib/utils";
import { proseClasses } from "@/lib/prose";
import { SearchX } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Notebook } from "@/components/ui/notebook/Notebook";

interface BlogPageProps {
  posts: CollectionEntry<"blog">[];
  featuredSlugs: string[];
}

const ROW_H = "240px";
const BLOG_LETTERS = ["B", "L", "O", "G"];

function PostMeta({
  post,
  selectedTags,
}: {
  post: CollectionEntry<"blog">;
  selectedTags: Set<string>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground/50 mt-auto pt-5">
      <FormattedDate date={post.data.pubDate} />
      <TagList tags={post.data.tags} selectedTags={selectedTags} />
      <span className="ml-auto uppercase tabular-nums shrink-0">
        {getReadingTime(post.body)}
      </span>
    </div>
  );
}

export function BlogPage({ posts, featuredSlugs }: BlogPageProps) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const noneSelected = selectedTags.size === 0;

  const allTags = useMemo(() => {
    const tags = [...new Set(posts.flatMap((p) => p.data.tags))].sort();
    return tags.map((tag) => ({
      value: tag,
      count: posts.filter((p) => p.data.tags.includes(tag)).length,
    }));
  }, [posts]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  };

  const featuredPosts = featuredSlugs
    .map((slug) => posts.find((p) => p.slug === slug))
    .filter(Boolean) as CollectionEntry<"blog">[];

  const [postA, postB, postC] = featuredPosts;

  const filteredRegular = useMemo(
    () =>
      noneSelected
        ? posts
        : posts.filter((p) => p.data.tags.some((t) => selectedTags.has(t))),
    [posts, selectedTags, noneSelected],
  );

  const numPostRows = Math.ceil(Math.max(filteredRegular.length, 1) / 2);

  return (
    <div className="pt-14">
      {/* ═══════════════════════════════════════════════════════════════
          FEATURED AREA — lines='both' with uniform 240px rows
          ═══════════════════════════════════════════════════════════════ */}
      <Notebook
        lines="both"
        rowH={ROW_H}
        cellGap="2px"
        className="notebook--cell-separators"
      >
        {/* BLOG letters — cols 1-2, rows 1-2 (md+) */}
        <div
          aria-hidden="true"
          className={cn(
            "hidden md:grid grid-cols-2",
            "md:col-[1/3] md:row-[1/3]",
            "overflow-hidden",
          )}
        >
          {BLOG_LETTERS.map((letter) => (
            <div key={letter} className="flex items-end overflow-hidden">
              <span
                className="font-bold uppercase leading-[0.88] tracking-[-0.04em] text-foreground select-none"
                style={{ fontSize: "clamp(3.5rem,16vw,12rem)" }}
              >
                {letter}
              </span>
            </div>
          ))}
        </div>

        {/* Post A — wide featured slot, rows 1-2 */}
        {postA && (
          <a
            href={`/blog/${postA.slug}/`}
            className={cn(
              "col-[1/-1] md:col-[3/6] lg:col-[3/8]",
              "md:row-[1/3]",
              "group/post flex flex-col p-7 md:p-8 min-w-0",
              "bg-secondary overflow-hidden",
            )}
          >
            <h2 className="text-2xl md:text-3xl font-medium leading-tight mb-4 transition-colors group-hover/post:text-primary line-clamp-2">
              {postA.data.title}
            </h2>
            <div className="relative flex-1 overflow-hidden pointer-events-none min-h-0">
              <div className={`${proseClasses} prose-sm`}>
                <ReactMarkdown
                  components={{ a: ({ children }) => <span>{children}</span> }}
                >
                  {postA.body ?? ""}
                </ReactMarkdown>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-secondary to-transparent" />
            </div>
            <PostMeta post={postA} selectedTags={selectedTags} />
          </a>
        )}

        {/* Post B — row 1 */}
        {postB && (
          <a
            href={`/blog/${postB.slug}/`}
            className={cn(
              "col-[1/-1] md:col-[6/9] lg:col-[8/-1]",
              "md:row-[1/2]",
              "group/post flex flex-col p-6 min-w-0",
              "bg-secondary overflow-hidden",
            )}
          >
            <h2 className="text-xl font-medium leading-tight mb-3 transition-colors group-hover/post:text-primary line-clamp-2">
              {postB.data.title}
            </h2>
            <div className="relative flex-1 overflow-hidden min-h-0">
              <p className="text-muted-foreground text-sm leading-relaxed">
                {postB.data.description}
              </p>
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-secondary to-transparent" />
            </div>
            <PostMeta post={postB} selectedTags={selectedTags} />
          </a>
        )}

        {/* Post C — row 2 */}
        {postC && (
          <a
            href={`/blog/${postC.slug}/`}
            className={cn(
              "col-[1/-1] md:col-[6/9] lg:col-[8/-1]",
              "md:row-[2/3]",
              "group/post flex flex-col p-6 min-w-0",
              "bg-secondary overflow-hidden",
            )}
          >
            <h2 className="text-xl font-medium leading-tight mb-3 transition-colors group-hover/post:text-primary line-clamp-2">
              {postC.data.title}
            </h2>
            <div className="relative flex-1 overflow-hidden min-h-0">
              <p className="text-muted-foreground text-sm leading-relaxed">
                {postC.data.description}
              </p>
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-secondary to-transparent" />
            </div>
            <PostMeta post={postC} selectedTags={selectedTags} />
          </a>
        )}
      </Notebook>

      {/* ═══════════════════════════════════════════════════════════════
          POSTS AREA — lines='both' with the SAME row height as featured,
          so horizontal lines continue uninterrupted down the page.
          Regular posts are transparent so the lines pass through them.
          ═══════════════════════════════════════════════════════════════ */}
      <Notebook
        lines="both"
        rowH={ROW_H}
        cellGap="2px"
        className="notebook--cell-separators"
      >
        {/* Topics sidebar — cols 1-2, spans all post rows; sticky on desktop */}
        <div
          className={cn(
            "col-[1/-1] md:col-[1/3]",
            "md:sticky md:top-14 md:self-start",
          )}
          style={
            {
              gridRowStart: 1,
              gridRowEnd: 1 + numPostRows,
            } as React.CSSProperties
          }
        >
          {/* Mobile: horizontal scrolling filter strip */}
          <div className="md:hidden flex flex-wrap items-stretch">
            <span className="px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground/40 border-r border-foreground/[0.07] shrink-0 flex items-center">
              Topics
            </span>
            {allTags.map(({ value, count }) => {
              const active = selectedTags.has(value);
              const dimmed = !noneSelected && !active;
              return (
                <button
                  key={value}
                  onClick={() => toggleTag(value)}
                  className={cn(
                    "px-4 py-3 text-xs uppercase tracking-wide shrink-0 transition-colors",
                    active && "text-foreground",
                    dimmed && "text-muted-foreground/25",
                    !active &&
                      !dimmed &&
                      "text-muted-foreground/60 hover:text-foreground",
                  )}
                >
                  {value}
                  <span className="ml-1 opacity-40 tabular-nums">{count}</span>
                </button>
              );
            })}
            {!noneSelected && (
              <button
                onClick={() => setSelectedTags(new Set())}
                className="ml-auto px-4 py-3 text-xs text-muted-foreground/40 hover:text-foreground transition-colors shrink-0"
              >
                Clear
              </button>
            )}
          </div>

          {/* Desktop: vertical sidebar (transparent — lines show through) */}
          <div className="hidden md:block p-6 bg-background border-b">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-5">
              Topics
            </p>
            <div className="flex flex-col">
              {allTags.map(({ value, count }) => {
                const active = selectedTags.has(value);
                const dimmed = !noneSelected && !active;
                return (
                  <button
                    key={value}
                    onClick={() => toggleTag(value)}
                    className={cn(
                      "flex items-center justify-between py-2 text-xs uppercase tracking-wide transition-colors text-left",
                      active && "text-foreground",
                      dimmed && "text-muted-foreground/25",
                      !active &&
                        !dimmed &&
                        "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span>{value}</span>
                    <span className="tabular-nums opacity-40">{count}</span>
                  </button>
                );
              })}
              {!noneSelected && (
                <button
                  onClick={() => setSelectedTags(new Set())}
                  className="mt-5 text-xs text-muted-foreground/40 hover:text-foreground transition-colors text-left"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Regular posts — each takes exactly one row. Transparent so
            lines pass through. Long descriptions get clamped/faded. */}
        {filteredRegular.length > 0 ? (
          filteredRegular.map((post, i) => {
            const row = Math.floor(i / 2) + 1;
            const isLeft = i % 2 === 0;
            return (
              <a
                key={post.slug}
                href={`/blog/${post.slug}/`}
                className={cn(
                  "group/post flex flex-col p-6 min-w-0 overflow-hidden bg-background",
                  "col-[1/-1]",
                  isLeft
                    ? "md:col-[3/6] lg:col-[3/8]"
                    : "md:col-[6/9] lg:col-[8/-1]",
                )}
                style={{ gridRowStart: row }}
              >
                <h2 className="text-lg font-medium leading-snug mb-2 transition-colors group-hover/post:text-primary line-clamp-2">
                  {post.data.title}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 flex-1">
                  {post.data.description}
                </p>
                <PostMeta post={post} selectedTags={selectedTags} />
              </a>
            );
          })
        ) : (
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-3 text-muted-foreground/30",
              "col-[1/-1] md:col-[3/9] lg:col-[3/-1]",
            )}
            style={{ gridRowStart: 1, gridRowEnd: 3 }}
          >
            <SearchX className="h-6 w-6" />
            <p className="text-xs uppercase tracking-widest">
              No posts match the selected topics
            </p>
          </div>
        )}
      </Notebook>
    </div>
  );
}
