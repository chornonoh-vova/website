import { getCollection } from "astro:content";
import calculateReadingTime from "reading-time";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toString as mdastToString } from "mdast-util-to-string";

export async function allBlogPosts() {
  const allPosts = (await getCollection("blog")).filter(
    (post) => !post.data.draft,
  );

  allPosts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return allPosts;
}

export function stripMdxImports(body: string | undefined): string {
  return (body ?? "")
    .split("\n")
    .filter((line) => !line.startsWith("import "))
    .join("\n");
}

export function getReadingTime(text: string | undefined): string | undefined {
  if (!text?.length) return undefined;

  try {
    const { minutes } = calculateReadingTime(mdastToString(fromMarkdown(text)));
    if (minutes && minutes > 0) {
      return `${Math.ceil(minutes)} min read`;
    }
    return undefined;
  } catch (err) {
    console.error(err);
    return undefined;
  }
}

/**
 * Every post in a series, drafts included, ordered by part number. Drafts are
 * kept deliberately: an unwritten part still belongs in the series nav.
 */
export async function seriesParts(name: string) {
  const parts = (await getCollection("blog")).filter(
    (post) => post.data.series?.name === name,
  );

  parts.sort((a, b) => a.data.series!.part - b.data.series!.part);

  return parts;
}
