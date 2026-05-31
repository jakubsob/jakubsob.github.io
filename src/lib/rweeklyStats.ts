import type { GitHubHeaders } from "@/lib/rTestsGallery";

// Counts how many R Weekly issues featured one of my posts in their
// "Highlights" section. R Weekly is served from the `gh-pages` branch of
// rweekly/rweekly.org, with one markdown file per weekly issue under `_posts`.
//
// Rather than fetch all ~500 issues at build time, we use GitHub's code
// search to find the handful of issues that mention either of my domains,
// then fetch only those candidates and confirm the link sits inside the
// Highlights section (the domain may also appear under "Updated Packages"
// etc., which doesn't count).

const REPO = "rweekly/rweekly.org";
const BRANCH = "gh-pages";
const DOMAINS = ["jakubsobolewski.com", "jakubsob.github.io"];

function rawPostUrl(path: string): string {
  return `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${path}`;
}

interface CodeSearchResponse {
  items?: { path: string }[];
}

// Find issue files that mention a domain anywhere in their content.
async function searchCandidatePosts(
  headers: GitHubHeaders,
): Promise<string[]> {
  const paths = new Set<string>();

  for (const domain of DOMAINS) {
    const query = encodeURIComponent(`${domain} repo:${REPO}`);
    const res = await fetch(
      `https://api.github.com/search/code?q=${query}&per_page=100`,
      { headers: { Accept: "application/vnd.github+json", ...headers } },
    );
    if (!res.ok) throw new Error(`GitHub code search: ${res.status}`);

    const data = (await res.json()) as CodeSearchResponse;
    for (const item of data.items ?? []) {
      if (item.path.startsWith("_posts/") && item.path.endsWith(".md")) {
        paths.add(item.path);
      }
    }
  }

  return Array.from(paths);
}

// Extract the body of the first "Highlight(s)" section, i.e. everything
// between the section header and the next markdown header.
export function extractHighlightSection(markdown: string): string {
  const lines = markdown.split("\n");
  const start = lines.findIndex((line) => /^#{1,4}\s*Highlights?\b/i.test(line));
  if (start === -1) return "";

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^#{1,4}\s+\S/.test(lines[i])) {
      end = i;
      break;
    }
  }

  return lines.slice(start + 1, end).join("\n");
}

function highlightMentionsMe(markdown: string): boolean {
  const section = extractHighlightSection(markdown);
  return DOMAINS.some((domain) => section.includes(domain));
}

// Returns the number of R Weekly issues featuring my work in Highlights.
// Throws on a hard failure so callers can fall back to a known-good value.
export async function fetchRweeklyHighlightCount(
  headers: GitHubHeaders,
): Promise<number> {
  const candidates = await searchCandidatePosts(headers);

  const results = await Promise.all(
    candidates.map(async (path) => {
      const res = await fetch(rawPostUrl(path), { headers });
      if (!res.ok) return false;
      return highlightMentionsMe(await res.text());
    }),
  );

  return results.filter(Boolean).length;
}
