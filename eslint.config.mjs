// @ts-check
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "eslint/config";
import eslint from "@eslint/js";
import { includeIgnoreFile } from "@eslint/compat";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

export default defineConfig(
  includeIgnoreFile(gitignorePath),
  eslint.configs.recommended,
  tseslint.configs.recommended,
  astro.configs["jsx-a11y-recommended"],
  react.configs.flat["jsx-runtime"],
  reactHooks.configs.flat.recommended,
);
