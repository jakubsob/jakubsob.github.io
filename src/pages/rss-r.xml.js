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
      const content = await container.renderToString(Content);
      const link = new URL(`/blog/${post.slug}`, context.url.origin).toString();
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
