import type { APIRoute, GetStaticPaths } from "astro";
import { allBlogPosts } from "../../lib/posts";
import { renderOGImage } from "../../lib/og-image";

type Props = {
  title: string;
  description: string;
};

export const getStaticPaths = (async () => {
  const posts = await allBlogPosts();
  return posts.map((post) => ({
    params: { slug: post.id },
    props: {
      title: post.data.title,
      description: post.data.description,
    } satisfies Props,
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const { title, description } = props as Props;

  return renderOGImage({
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "64px",
        backgroundColor: "#171717",
        color: "#ffffff",
        fontFamily: "Inter",
      },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column", gap: "16px" },
            children: [
              {
                type: "p",
                props: {
                  style: {
                    fontSize: 56,
                    fontWeight: 700,
                    lineHeight: 1.15,
                    margin: 0,
                    color: "#ffffff",
                  },
                  children: title,
                },
              },
              {
                type: "p",
                props: {
                  style: {
                    fontSize: 28,
                    fontWeight: 400,
                    lineHeight: 1.4,
                    margin: 0,
                    color: "rgba(255,255,255,0.7)",
                  },
                  children: description,
                },
              },
            ],
          },
        },
        {
          type: "p",
          props: {
            style: {
              fontSize: 24,
              fontWeight: 400,
              margin: 0,
              color: "rgba(255,255,255,0.5)",
            },
            children: "chornonoh-vova.com",
          },
        },
      ],
    },
  });
};
