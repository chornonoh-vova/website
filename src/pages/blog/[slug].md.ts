import type { GetStaticPaths, APIRoute } from "astro";
import { allBlogPosts, stripMdxImports } from "../../lib/posts";

export const getStaticPaths = (async () => {
  const posts = await allBlogPosts();
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
  const { post } = props;
  const frontmatter = `---
title: ${JSON.stringify(post.data.title)}
description: ${JSON.stringify(post.data.description)}
date: ${post.data.date.toISOString().slice(0, 10)}
---

`;
  const body = stripMdxImports(post.body).trimStart();

  return new Response(frontmatter + body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
