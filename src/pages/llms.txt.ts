import type { APIRoute } from "astro";
import { allBlogPosts } from "../lib/posts";

export const GET: APIRoute = async ({ site }) => {
  const posts = await allBlogPosts();
  const siteUrl = site?.toString() ?? "https://chornonoh-vova.com";

  const blogLinks = posts
    .map(
      (post) =>
        `- [${post.data.title}](${new URL(`/blog/${post.id}/`, site)}): ${post.data.description}`,
    )
    .join("\n");

  const content = `# Volodymyr's website

> Full-stack software engineer based in Ukraine. Personal website with blog posts about algorithms, web platform fundamentals, and developer tools.

This is the llms.txt index for ${siteUrl} — a personal website and blog by Volodymyr Chornonoh. The site covers algorithms and data structures, web APIs, developer tools, and software engineering topics.

For the full content of every blog post concatenated into one file, see ${new URL("llms-full.txt", site)}.

## Blog

Technical writing on algorithms, data structures, web APIs, tools, and software engineering.

${blogLinks}

## Projects

- [Readometer](${new URL("projects/#readometer", site)}): Simple app to manage your library of books and track your reading sessions.
- [Tabata Timer](${new URL("projects/#tabata-timer", site)}): Tabata timer app, installable as PWA.
- [GitFrag](${new URL("projects/#gitfrag", site)}): Sort GitHub profile contributions and learn about sorting algorithms.
- [Sudoku](${new URL("projects/#sudoku", site)}): Small and simple Sudoku game, installable as PWA.
- [Warehouse Simulator](${new URL("projects/#warehouse-simulator", site)}): Simulator inspired by Advent of Code 2024 Day 15, designed with pixel art.

## About

- [About Volodymyr Chornonoh](${new URL("about/", site)}): Full-stack engineer (React, TypeScript, Java, Spring Boot). Based in Ukraine.
`;

  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
