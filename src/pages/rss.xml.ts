import rss from "@astrojs/rss";
import { allBlogPosts } from "../lib/posts";
import { SITE_DESCRIPTION, SITE_TITLE } from "../constants";

type Context = {
  site: string;
};

export async function GET(context: Context) {
  const blogPosts = await allBlogPosts();

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: blogPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/${post.collection}/${post.id}`,
    })),
  });
}
