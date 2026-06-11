import rss from "@astrojs/rss";
import { allBlogPosts } from "../lib/posts";
import { SITE_DESCRIPTION, SITE_TITLE } from "../constants";

type Context = {
  site: string;
};

export async function GET(context: Context) {
  const blogPosts = await allBlogPosts();
  const feedUrl = new URL("rss.xml", context.site).href;

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    customData: `<atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />`,
    items: blogPosts.map((post) => {
      const postUrl = new URL(`/blog/${post.id}/`, context.site).href;
      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.date,
        link: postUrl,
        customData: `<guid isPermaLink="true">${postUrl}</guid>`,
      };
    }),
  });
}
