import { fileURLToPath, URL } from "node:url";
import eslint from "@eslint/js";
import { includeIgnoreFile } from "@eslint/compat";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

export default tseslint.config(
  includeIgnoreFile(gitignorePath),
  eslint.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended,
);
