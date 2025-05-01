import { getCollection } from "astro:content";

export async function allBlogPosts() {
  const allPosts = (await getCollection("blog")).filter(
    (post) => !post.data.draft,
  );

  allPosts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return allPosts;
}
