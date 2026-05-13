import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const fontRegular = readFileSync(
  resolve("node_modules/@fontsource/inter/files/inter-latin-400-normal.woff"),
);

const fontBold = readFileSync(
  resolve("node_modules/@fontsource/inter/files/inter-latin-700-normal.woff"),
);

const fonts: Parameters<typeof satori>[1]["fonts"] = [
  { name: "Inter", data: fontRegular, weight: 400, style: "normal" },
  { name: "Inter", data: fontBold, weight: 700, style: "normal" },
];

export async function renderOGImage(
  node: Parameters<typeof satori>[0],
): Promise<Response> {
  const svg = await satori(node, { width: 1200, height: 630, fonts });
  const png = new Resvg(svg).render().asPng();
  return new Response(png, { headers: { "Content-Type": "image/png" } });
}
