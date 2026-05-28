import { useState, useMemo } from "react";
import type { CollectionEntry } from "astro:content";
import { getReadingTime } from "@/utils/getReadingTime";
import FormattedDate from "@/components/features/FormattedDate";
import { TagList } from "@/components/features/TagList";
import { cn } from "@/lib/utils";
import { proseClasses } from "@/lib/prose";
import { SearchX } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface BlogPageProps {
  posts: CollectionEntry<"blog">[];
  featuredSlugs: string[];
}

const ROW_H = 200;
const BLOG_LETTERS = ["B", "L", "O", "G"];
const FIRST_POST_ROW = 4;
const SEP_ROW = 3;

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
    [posts, selectedTags, noneSelected]
  );

  const numPostRows = Math.ceil(Math.max(filteredRegular.length, 1) / 2);
  const cell = "bg-background";

  // Gap cell helper: renders an invisible but outline-bearing cell in col 1 or 12
  // Gap cells are only visible at lg (12-col grid). They're hidden via CSS below lg,
  // but we still need safe column values to avoid creating implicit columns on the 10-col md grid.
  const gap = (col: 1 | 12, row: number, rowSpan = 1) => (
    <div
      key={`gap-${col}-${row}`}
      aria-hidden="true"
      className={cn(cell, "blog-gap", col === 1 ? "blog-gap-left" : "blog-gap-right")}
      style={{
        gridRowStart: row,
        gridRowEnd: row + rowSpan,
      }}
    />
  );

  return (
    <div className="pt-14">
      {/*
       * One unified 12-column grid. Every row has explicit gap cells in col 1
       * and col 12, so their outlines always render and stay in sync with the grid.
       *
       * col 1        — left gap
       * cols 2-3     — BLOG letters (rows 1-2) / Topics sidebar (rows 3+)
       * cols 4-7     — Post A (rows 1-2) / odd regular posts
       * cols 8-11    — Post B (row 1), Post C (row 2) / even regular posts
       * col 12       — right gap
       */}
      <div
        className="blog-grid grid grid-cols-1 md:grid-cols-10 lg:grid-cols-12 *:outline *:outline-1 *:outline-border"
        style={{
          gridTemplateRows: `${ROW_H}px ${ROW_H}px var(--sep-row-h, 3rem)`,
          gridAutoRows: `minmax(var(--blog-row-min, ${ROW_H}px), auto)`,
        }}
      >
        {/* ── GAP CELLS: featured rows 1-2 ── */}
        {gap(1, 1, 2)}
        {gap(12, 1, 2)}

        {/* ── SEPARATOR ROW: col 1-12, row 3 (desktop only) ── */}
        <div
          aria-hidden="true"
          className="hidden md:block md:col-start-1 md:col-span-10 lg:col-span-12"
          style={{ gridRowStart: SEP_ROW } as React.CSSProperties}
        />

        {/* ── BLOG LETTERS: cols 2-3, rows 1-2 ── */}
        <div
          aria-hidden="true"
          className="hidden md:grid grid-cols-2 md:col-start-1 md:col-span-2 lg:col-start-2 lg:col-span-2 md:row-start-1 md:row-span-2 overflow-hidden"
        >
          {BLOG_LETTERS.map((letter) => (
            <div
              key={letter}
              className={cn(cell, "flex items-end overflow-hidden px-3 pb-2 outline outline-1 outline-border")}
            >
              <span
                className="font-bold uppercase leading-[0.88] tracking-[-0.04em] text-foreground select-none"
                style={{ fontSize: "clamp(3.5rem,16vw,14rem)" }}
              >
                {letter}
              </span>
            </div>
          ))}
        </div>

        {/* ── POST A: cols 4-7, rows 1-2 ── */}
        {postA && (
          <a
            href={`/blog/${postA.slug}/`}
            className={cn(
              cell,
              "md:col-start-3 md:col-span-4 lg:col-start-4 lg:col-span-4 md:row-start-1 md:row-span-2",
              "group/post flex flex-col p-7 md:p-8 min-w-0",
              "bg-secondary",
            )}
          >
            <h2 className="text-2xl md:text-3xl font-medium leading-tight mb-4 transition-colors group-hover/post:text-primary line-clamp-2">
              {postA.data.title}
            </h2>
            <div className="relative flex-1 overflow-hidden pointer-events-none min-h-0">
              <div className={`${proseClasses} prose-sm`}>
                <ReactMarkdown>{postA.body ?? ""}</ReactMarkdown>
              </div>
              {/* Fade-out mask — works regardless of block children */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-secondary to-transparent" />
            </div>
            <PostMeta post={postA} selectedTags={selectedTags} />
          </a>
        )}

        {/* ── POST B: cols 8-11, row 1 ── */}
        {postB && (
          <a
            href={`/blog/${postB.slug}/`}
            className={cn(
              cell,
              "md:col-start-7 md:col-span-4 lg:col-start-8 lg:col-span-4 md:row-start-1",
              "group/post flex flex-col p-6 min-w-0",
              "bg-secondary",
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

        {/* ── POST C: cols 8-11, row 2 ── */}
        {postC && (
          <a
            href={`/blog/${postC.slug}/`}
            className={cn(
              cell,
              "md:col-start-7 md:col-span-4 lg:col-start-8 lg:col-span-4 md:row-start-2",
              "group/post flex flex-col p-6 min-w-0",
              "bg-secondary",
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

        {/* ── GAP CELLS: one per post row ── */}
        {Array.from({ length: numPostRows }, (_, i) => [
          gap(1, FIRST_POST_ROW + i),
          gap(12, FIRST_POST_ROW + i),
        ])}

        {/* ── TOPICS SIDEBAR: cols 2-3, rows 3+ (sticky) ── */}
        <div
          className={cn(
            "bg-background blog-sidebar",
            "md:sticky md:top-14 md:self-start"
          )}
          style={{
            gridRowStart: FIRST_POST_ROW,
            gridRowEnd: FIRST_POST_ROW + numPostRows,
          } as React.CSSProperties}
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
                    !active && !dimmed && "text-muted-foreground/60 hover:text-foreground"
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

          {/* Desktop: vertical sidebar */}
          <div className="hidden md:block p-6">
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
                      !active && !dimmed && "text-muted-foreground hover:text-foreground"
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

        {/* ── REGULAR POSTS: each a direct grid child ── */}
        {filteredRegular.length > 0 ? (
          filteredRegular.map((post, i) => {
            const row = FIRST_POST_ROW + Math.floor(i / 2);
            const isLeft = i % 2 === 0;
            return (
              <a
                key={post.slug}
                href={`/blog/${post.slug}/`}
                className={cn("group/post flex flex-col p-6 min-w-0", cell, isLeft ? "blog-post-left" : "blog-post-right")}
                style={{
                  gridRowStart: row,
                }}
              >
                <h2 className="text-lg font-medium leading-snug mb-2 transition-colors group-hover/post:text-primary">
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
              "flex flex-col items-center justify-center gap-3 text-muted-foreground/30 blog-empty-state",
              cell
            )}
            style={{
              gridRowStart: FIRST_POST_ROW,
              minHeight: ROW_H * 2,
            }}
          >
            <SearchX className="h-6 w-6" />
            <p className="text-xs uppercase tracking-widest">
              No posts match the selected topics
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
