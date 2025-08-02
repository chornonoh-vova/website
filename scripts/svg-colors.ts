import { argv } from "node:process";
import { readFile, writeFile } from "node:fs/promises";

const replacements = [
  [/stroke="#1e1e1e"/g, 'class="stroke-neutral-900 dark:stroke-neutral-50"'],
  [/fill="#1e1e1e"/g, 'class="fill-neutral-900 dark:fill-neutral-50"'],
  [/fill="#e03131"/g, 'class="fill-red-600"'],
  [/stroke="#e03131"/g, 'class="stroke-red-600"'],
  [/fill="#e8590c"/g, 'class="fill-orange-600"'],
  [/fill="#2f9e44"/g, 'class="fill-lime-600"'],
  [/fill="#1971c2"/g, 'class="fill-blue-600"'],
  [/fill="#9c36b5"/g, 'class="fill-fuchsia-600"'],
  [/stroke="#9c36b5"/g, 'class="stroke-fuchsia-600"'],
  [/fill="#ffec99"/g, 'class="fill-yellow-200 dark:fill-yellow-700"'],
] as const;

const filename = argv[2];

if (!filename) {
  throw new Error(
    "missing filename\nUsage: node ./scripts/svg-colors.ts <filename>",
  );
}

const content = await readFile(filename, { encoding: "utf8" });

let newContent = content;

for (const [pattern, replacement] of replacements) {
  newContent = newContent.replaceAll(pattern, replacement);
}

await writeFile(filename, newContent);
