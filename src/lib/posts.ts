import { getCollection } from "astro:content";
import calculateReadingTime from "reading-time";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toString } from "mdast-util-to-string";

export async function allBlogPosts() {
  const allPosts = (await getCollection("blog")).filter(
    (post) => !post.data.draft,
  );

  allPosts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return allPosts;
}

export function getReadingTime(text: string | undefined): string | undefined {
  if (!text || !text.length) return undefined;

  try {
    const { minutes } = calculateReadingTime(toString(fromMarkdown(text)));
    if (minutes && minutes > 0) {
      return `${Math.ceil(minutes)} min read`;
    }
    return undefined;
  } catch (err) {
    console.error(err);
    return undefined;
  }
}
