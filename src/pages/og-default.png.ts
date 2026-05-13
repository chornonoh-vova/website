import type { APIRoute } from "astro";
import { SITE_TITLE, SITE_DESCRIPTION } from "../constants";
import { renderOGImage } from "../lib/og-image";

export const GET: APIRoute = async () => {
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
                    fontSize: 64,
                    fontWeight: 700,
                    lineHeight: 1.15,
                    margin: 0,
                    color: "#ffffff",
                  },
                  children: SITE_TITLE,
                },
              },
              {
                type: "p",
                props: {
                  style: {
                    fontSize: 32,
                    fontWeight: 400,
                    lineHeight: 1.4,
                    margin: 0,
                    color: "rgba(255,255,255,0.7)",
                  },
                  children: SITE_DESCRIPTION,
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
