import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { smartSearchService } from "@/lib/smartSearch";
import { populateRTestsGallerySearch } from "@/lib/gallerySearchData";

// Build the full search index once, at build time, and serve it as a single
// cacheable static file. This keeps the (large) index out of every page's
// HTML — the client fetches it lazily when search is first used.
export const GET: APIRoute = async () => {
  const posts = (await getCollection("blog"))
    .filter((post) => post.data.draft !== true)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const galleryItems = await populateRTestsGallerySearch();

  smartSearchService.clear();
  smartSearchService.addBlogPosts(posts);
  smartSearchService.addStaticPages();
  smartSearchService.addRTestsGalleryItems(galleryItems);

  return new Response(JSON.stringify(smartSearchService.getAllItems()), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
