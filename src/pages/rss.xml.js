import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getContainerRenderer as getMDXRenderer } from "@astrojs/mdx";
import { loadRenderers } from "astro:container";
import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";
import fs from "fs";
import path from "path";

export async function GET(context) {
  const renderers = await loadRenderers([getMDXRenderer()]);
  const container = await AstroContainer.create({ renderers });
  const posts = await getCollection("blog");

  const filteredPosts = posts.filter((post) => !post.data.draft);

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
      let heroImage = post.data.heroImage;
      if (!heroImage) {
        heroImage = `/blog/${post.slug}/code_block_1.png`;
      }

      return {
        ...post,
        title: post.data.title,
        description: post.data.description,
        site: context.site,
        link,
        content,
        pubDate: post.data.pubDate,
        customData: `<media:content
          type="image/png"
          medium="image"
          url="${context.site + heroImage}" />`,
      };
    })
  );

  items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    xmlns: {
      media: "http://search.yahoo.com/mrss/",
    },
    items,
  });
}
