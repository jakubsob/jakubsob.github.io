import { createGitHubAuthHeaders } from "@/lib/rTestsGallery";

export interface PackageStats {
  stars: number;
  downloads: number;
}

// Fallbacks keep the build green if a network fetch fails at build time.
const FALLBACK: Record<string, PackageStats> = {
  cucumber: { stars: 31, downloads: 8594 },
  muttest: { stars: 24, downloads: 6283 },
};

const headers = createGitHubAuthHeaders(import.meta.env.PRIVATE_GITHUB_TOKEN);

export const compactNum = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export async function fetchPackageStats(pkg: string): Promise<PackageStats> {
  const fallback = FALLBACK[pkg] ?? { stars: 0, downloads: 0 };

  const [starsResult, downloadsResult] = await Promise.allSettled([
    fetch(`https://api.github.com/repos/jakubsob/${pkg}`, { headers }).then(
      (res) => {
        if (!res.ok) throw new Error(`GitHub ${pkg}: ${res.status}`);
        return res.json() as Promise<{ stargazers_count: number }>;
      },
    ),
    fetch(
      `https://cranlogs.r-pkg.org/downloads/total/2000-01-01:2100-01-01/${pkg}`,
    ).then((res) => {
      if (!res.ok) throw new Error(`cranlogs ${pkg}: ${res.status}`);
      return res.json() as Promise<{ downloads: number }[]>;
    }),
  ]);

  return {
    stars:
      starsResult.status === "fulfilled"
        ? starsResult.value.stargazers_count
        : fallback.stars,
    downloads:
      downloadsResult.status === "fulfilled"
        ? (downloadsResult.value[0]?.downloads ?? fallback.downloads)
        : fallback.downloads,
  };
}
