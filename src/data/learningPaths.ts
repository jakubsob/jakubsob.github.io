import type { CollectionEntry } from "astro:content";

/**
 * Learning Paths
 * --------------
 * Curated reading tracks layered over the blog. Posts are grouped into 9
 * tracks across 3 tiers (basics -> technique -> applied). Each track lists
 * blog post slugs (directory names under src/content/blog) in reading order.
 *
 * This file is the single source of truth for track membership and ordering —
 * posts themselves carry no track/series frontmatter. A slug may appear in
 * more than one track (a "bridge" post); its *primary* track is the first one
 * that contains it in tier/track declaration order (see findTrackContext).
 *
 * Drafts and missing posts are filtered out at resolution time (resolveTrack),
 * mirroring the production rule in src/pages/blog/[...slug].astro.
 */

export interface Track {
  /** URL slug under /learn, e.g. "foundations" */
  id: string;
  title: string;
  /** One-line reader promise. */
  promise: string;
  /** Ordered blog post slugs (directory names). */
  lessons: string[];
  /** Show the course waitlist CTA on this track (course subject matter). */
  courseCTA?: boolean;
}

export interface Tier {
  id: string;
  title: string;
  subtitle: string;
  tracks: Track[];
}

export const learningTiers: Tier[] = [
  {
    id: "basics",
    title: "Learn the basics",
    subtitle: "From why-bother to writing clean, fast tests.",
    tracks: [
      {
        id: "foundations",
        title: "Foundations & Strategy",
        promise: "Why test at all, and what should I test?",
        lessons: [
          "what-happens-if-we-dont-write-good-tests",
          "what-happens-if-we-write-good-tests",
          "3-reasons-youre-not-doing-testing",
          "2-aspects-of-software-quality",
          "your-first-test-in-r",
          "what-should-i-test",
          "3-types-of-unit-tests-everyone-should-know",
          "want-cleaner-test-try-arrange-act-assert",
          "agile-testing-quadrants",
          "4-layers-of-testing",
          "3-lessons-learned-from-3-years-of-testing-as-r-developer",
          "gxp-validation-summit",
        ],
      },
      {
        id: "tdd",
        title: "Test-Driven Development",
        promise: "Use tests to drive design.",
        lessons: [
          "getting-started-with-tdd-three-phases",
          "3-steps-of-tdd-that-help-you-build-better-code-faster",
          "how-tdd-helps-you-build-the-right-thing",
          "how_tdd_makes-you-faster",
          "a-day-in-the-life-of-tdd-in-r",
          "why-testable-code-is-better-code",
          "tdd-refactoring",
          "3-step-guide-for-building-plots-faster-with-tdd",
          "how-to-use-tests-to-develop-shiny-modules",
        ],
      },
      {
        id: "craft",
        title: "Test Design & Craft",
        promise: "Tests you can live with.",
        lessons: [
          "how-to-improve-your-unit-test-titles",
          "3-things-tests-can-tell-you-about-your-code",
          "want-to-get-faster-feedback-from-unit-tests",
          "test-smells-in-r",
          "capturing-output-for-tests",
          "test-data-builders",
          "test-maintenance-keeping-a-growing-suite-healthy",
          "the-easiest-way-to-update-snapshots-from-ci",
        ],
      },
    ],
  },
  {
    id: "technique",
    title: "Level up your technique",
    subtitle: "Doubles, effectiveness, and behavior-first testing.",
    tracks: [
      {
        id: "test-doubles",
        title: "Dependencies & Test Doubles",
        promise: "Isolate your code from the messy world.",
        lessons: [
          "testing-code-with-external-dependencies",
          "clean-tests-with-local_mocked_bindings",
          "test-doubles-taxonomy",
          "the-problem-with-mocking",
          "own-interfaces-you-use",
          "testable-r6-interfaces",
          "testing-code-with-dependencies",
        ],
      },
      {
        id: "effectiveness",
        title: "Test Effectiveness",
        promise: "Does your suite actually catch bugs?",
        lessons: [
          "want-to-get-code-coverage-report",
          "coverage-is-a-liar",
          "mutation-testing-does-your-suite-catch-bugs",
          "muttest-0_2_0",
          "we-build-an-app-prototype-in-2-weeks-with-96-coverage",
        ],
      },
      {
        id: "bdd",
        title: "BDD & Acceptance Testing",
        promise: "Test behavior, not implementation.",
        lessons: [
          "intro-to-bdd-in-R",
          "full-bdd-loop-in-one-example",
          "bdd-cadence",
          "the-problem-with-mocking",
          "acceptance-test-driven-development",
          "setting-up-cucumber-in-rhino",
          "ai-assisted-specifications",
          "bdd-shiny-feature",
          "bdd-shiny-given",
          "bdd-shiny-when",
          "bdd-shiny-then",
          "acceptance_test_driven_development_of_shiny_modules",
          "which-testing-library-for-shiny",
          "plumber-api",
          "anyone-interested-in-bdd-should-watch-this",
        ],
      },
    ],
  },
  {
    id: "applied",
    title: "Apply it where it's hard",
    subtitle: "Shiny apps, legacy code, and code you didn't write.",
    tracks: [
      {
        id: "shiny",
        title: "Shiny Testing",
        promise: "Test apps end-to-end.",
        lessons: [
          "anatomy-of-a-shiny-module-test",
          "shiny-module-server-tests",
          "testing-components-with-shinytest2",
          "robust-shinytest2",
          "robust-targetting-of-html-for-tests",
          "shinytest2-complex-widgets",
          "optimizing-shinytest2-tests",
          "how-to-test-excel-workbooks",
          "the-other-way-of-lifting-state-up-from-shiny-modules",
        ],
      },
      {
        id: "legacy",
        title: "Working with Legacy Code",
        promise: "Add tests to code that has none.",
        courseCTA: true,
        lessons: [
          "how-to-not-get-frustrated-working-with-legacy-code",
          "testing-legacy-shiny",
          "working-with-legacy-code-extending-shiny-modules-with-tdd",
        ],
      },
      {
        id: "ai",
        title: "Testing in the Age of AI",
        promise: "Trust code you didn't write.",
        courseCTA: true,
        lessons: [
          "want-to-use-a-new-library-without-wasting-time",
          "ai-assisted-testing",
          "ai-assisted-test-code-refactoring",
          "tdd-loop-with-llm",
          "how-to-review-llm-generated-tests",
        ],
      },
    ],
  },
];

// --- Resolution helpers -----------------------------------------------------

type BlogPost = CollectionEntry<"blog">;

/** A track lesson resolved to its real, published blog post. */
export interface ResolvedLesson {
  slug: string;
  post: BlogPost;
}

export interface ResolvedTrack {
  tier: Tier;
  track: Track;
  lessons: ResolvedLesson[];
}

export interface TrackContext extends ResolvedTrack {
  /** 1-based position of the current post within the track. */
  position: number;
  total: number;
  prev?: ResolvedLesson;
  next?: ResolvedLesson;
}

/**
 * Learning paths always reflect what readers actually get: published posts
 * only. Unlike src/pages/blog/[...slug].astro (which renders drafts in dev for
 * preview), we exclude drafts in every environment so lesson counts, numbering,
 * and prev/next stay honest and never point at a post that isn't live yet.
 */
function isPublished(post: BlogPost): boolean {
  return post.data.draft !== true;
}

/** Map blog posts by slug for O(1) lookup. */
export function indexPosts(posts: BlogPost[]): Map<string, BlogPost> {
  return new Map(posts.map((post) => [post.slug, post]));
}

/** Resolve a track's lesson slugs to published posts, in order, deduped. */
export function resolveTrack(
  tier: Tier,
  track: Track,
  bySlug: Map<string, BlogPost>
): ResolvedTrack {
  const seen = new Set<string>();
  const lessons: ResolvedLesson[] = [];
  for (const slug of track.lessons) {
    if (seen.has(slug)) continue;
    const post = bySlug.get(slug);
    if (!post || !isPublished(post)) continue;
    seen.add(slug);
    lessons.push({ slug, post });
  }
  return { tier, track, lessons };
}

/** Every track resolved against the collection, drafts/missing removed. */
export function resolveAllTracks(posts: BlogPost[]): ResolvedTrack[] {
  const bySlug = indexPosts(posts);
  return learningTiers.flatMap((tier) =>
    tier.tracks.map((track) => resolveTrack(tier, track, bySlug))
  );
}

/** Find a single track by its id, resolved against the collection. */
export function findResolvedTrack(
  trackId: string,
  posts: BlogPost[]
): ResolvedTrack | undefined {
  const bySlug = indexPosts(posts);
  for (const tier of learningTiers) {
    const track = tier.tracks.find((t) => t.id === trackId);
    if (track) return resolveTrack(tier, track, bySlug);
  }
  return undefined;
}

/**
 * Locate a post within an already-resolved track and attach its position and
 * neighbours. Returns undefined if the post isn't a (published) lesson there.
 */
export function toTrackContext(
  resolved: ResolvedTrack,
  slug: string
): TrackContext | undefined {
  const idx = resolved.lessons.findIndex((l) => l.slug === slug);
  if (idx === -1) return undefined;
  return {
    ...resolved,
    position: idx + 1,
    total: resolved.lessons.length,
    prev: idx > 0 ? resolved.lessons[idx - 1] : undefined,
    next:
      idx < resolved.lessons.length - 1
        ? resolved.lessons[idx + 1]
        : undefined,
  };
}
