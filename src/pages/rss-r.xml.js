import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getContainerRenderer as getMDXRenderer } from "@astrojs/mdx";
import { loadRenderers } from "astro:container";
import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";

export async function GET(context) {
  const renderers = await loadRenderers([getMDXRenderer()]);
  const container = await AstroContainer.create({ renderers });
  const posts = await getCollection("blog");

  const filteredPosts = posts
    .filter((post) => !post.data.draft)
    .filter((post) => post.data.tags.includes("r"));

  const items = await Promise.all(
    filteredPosts.map(async (post) => {
      const { Content } = await post.render();
      let content = await container.renderToString(Content);

      // Prepend site URL to src attributes of img tags
      content = content.replace(/<img\s+src="([^"]+)"/g, (match, src) => {
        const absoluteUrl = new URL(src, context.url.origin).toString();
        return match.replace(src, absoluteUrl);
      });

      const link = new URL(`/blog/${post.slug}`, context.url.origin).toString();

      // Use the per-post generated OG image so reblogged posts (e.g. on
      // R-bloggers) show with an image. R-bloggers picks up the first <img>
      // in the content, so embed it there. We intentionally do NOT also emit
      // media:content/media:thumbnail, as that makes readers render the same
      // image twice.
      const ogImageUrl = new URL(
        post.data.heroImage ?? `/blog/${post.slug}/og-image.png`,
        context.url.origin
      ).toString();

      content =
        `<p><img src="${ogImageUrl}" alt="${post.data.title}" /></p>` + content;

      return {
        ...post,
        title: post.data.title,
        description: post.data.description,
        site: context.site,
        link,
        content,
        pubDate: post.data.pubDate,
      };
    })
  );

  items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items,
  });
}
