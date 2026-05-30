import { useMemo } from "react";
import type { CollectionEntry } from "astro:content";
import { cn } from "@/lib/utils";
import { proseClasses } from "@/lib/prose";
import { SearchX } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Notebook } from "@/components/ui/notebook/Notebook";
import { PostMeta } from "@/components/features/PostMeta";
import { NotebookLinkCard } from "@/components/features/NotebookLinkCard";
import { useTagFilters } from "@/components/features/useTagFilters";

// Lightweight shape passed from the server. Crucially this omits each post's
// full markdown `body`, which previously bloated the hydrated island to ~3.7MB.
// We also ship only the four `data` fields the cards actually render, rather
// than the entire frontmatter (titleSEO, descriptionSEO, updatedDate, etc.).
export interface BlogListItem {
  slug: string;
  data: Pick<
    CollectionEntry<"blog">["data"],
    "title" | "description" | "pubDate" | "tags"
  >;
  readingTime: string;
  // Short, server-trimmed preview used only by the featured hero card.
  excerpt?: string;
}

interface BlogPageProps {
  posts: BlogListItem[];
  featuredSlugs: string[];
}

const ROW_H = "240px";
const BLOG_LETTERS = ["B", "L", "O", "G"];

export function BlogPage({ posts, featuredSlugs }: BlogPageProps) {
  const {
    selectedTags,
    noneSelected,
    tagsWithCounts,
    filteredItems: filteredRegular,
    toggleTag,
    clearTags,
  } = useTagFilters(posts, (post) => post.data.tags);

  const featuredPosts = useMemo(
    () =>
      featuredSlugs
        .map((slug) => posts.find((p) => p.slug === slug))
        .filter(Boolean) as BlogListItem[],
    [featuredSlugs, posts],
  );

  const [postA, postB, postC] = featuredPosts;

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
          <NotebookLinkCard
            href={`/blog/${postA.slug}/`}
            title={postA.data.title}
            size="hero"
            tone="secondary"
            className={cn(
              "col-[1/-1] md:col-[3/6] lg:col-[3/8]",
              "md:row-[1/3]",
            )}
            bodyClassName="relative overflow-hidden pointer-events-none"
            body={
              <div className={`${proseClasses} prose-sm`}>
                <ReactMarkdown
                  components={{ a: ({ children }) => <span>{children}</span> }}
                >
                  {postA.excerpt ?? ""}
                </ReactMarkdown>
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-secondary to-transparent" />
              </div>
            }
            meta={
              <PostMeta
                post={postA}
                readingTime={postA.readingTime}
                selectedTags={selectedTags}
              />
            }
          />
        )}

        {/* Post B — row 1 */}
        {postB && (
          <NotebookLinkCard
            href={`/blog/${postB.slug}/`}
            title={postB.data.title}
            size="featured"
            tone="secondary"
            className={cn(
              "col-[1/-1] md:col-[6/9] lg:col-[8/-1]",
              "md:row-[1/2]",
            )}
            bodyClassName="relative overflow-hidden"
            body={
              <>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {postB.data.description}
                </p>
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-secondary to-transparent" />
              </>
            }
            meta={
              <PostMeta
                post={postB}
                readingTime={postB.readingTime}
                selectedTags={selectedTags}
              />
            }
          />
        )}

        {/* Post C — row 2 */}
        {postC && (
          <NotebookLinkCard
            href={`/blog/${postC.slug}/`}
            title={postC.data.title}
            size="featured"
            tone="secondary"
            className={cn(
              "col-[1/-1] md:col-[6/9] lg:col-[8/-1]",
              "md:row-[2/3]",
            )}
            bodyClassName="relative overflow-hidden"
            body={
              <>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {postC.data.description}
                </p>
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-secondary to-transparent" />
              </>
            }
            meta={
              <PostMeta
                post={postC}
                readingTime={postC.readingTime}
                selectedTags={selectedTags}
              />
            }
          />
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
            {tagsWithCounts.map(({ value, count }) => {
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
                onClick={clearTags}
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
              {tagsWithCounts.map(({ value, count }) => {
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
                  onClick={clearTags}
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
              <NotebookLinkCard
                key={post.slug}
                href={`/blog/${post.slug}/`}
                title={post.data.title}
                description={post.data.description}
                size="regular"
                tone="background"
                descriptionClamp={3}
                className={cn(
                  "col-[1/-1]",
                  isLeft
                    ? "md:col-[3/6] lg:col-[3/8]"
                    : "md:col-[6/9] lg:col-[8/-1]",
                )}
                style={{ gridRowStart: row }}
                meta={
                  <PostMeta
                    post={post}
                    readingTime={post.readingTime}
                    selectedTags={selectedTags}
                  />
                }
              />
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
