import type { APIRoute } from "astro";
import { allBlogPosts, stripMdxImports } from "../lib/posts";

export const GET: APIRoute = async ({ site }) => {
  const posts = await allBlogPosts();

  const sections = posts.map((post) => {
    const url = new URL(`/blog/${post.id}/`, site).toString();
    const body = stripMdxImports(post.body).trim();

    return `# ${post.data.title}
URL: ${url}
Date: ${post.data.date.toISOString().slice(0, 10)}

${body}`;
  });

  const content = sections.join("\n\n---\n\n");

  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
