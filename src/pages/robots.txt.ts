import type { APIRoute } from "astro";

const getRobotsTxt = (sitemapURL: URL, llmsTxtURL: URL) => `
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Googlebot-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: ChatGPT-User
Allow: /

Sitemap: ${sitemapURL.href}
LLMS: ${llmsTxtURL.href}
`;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL("sitemap-index.xml", site);
  const llmsTxtURL = new URL("llms.txt", site);
  return new Response(getRobotsTxt(sitemapURL, llmsTxtURL));
};
