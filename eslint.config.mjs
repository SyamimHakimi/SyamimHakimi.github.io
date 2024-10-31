import pluginVue from "eslint-plugin-vue";
import vueTsEslintConfig from "@vue/eslint-config-typescript";
import prettierConfig from "@vue/eslint-config-prettier";
import { includeIgnoreFile } from "@eslint/compat";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");

export default [
  // add more generic rulesets here, such as:
  // js.configs.recommended,
  includeIgnoreFile(gitignorePath),
  ...pluginVue.configs["flat/essential"],
  ...vueTsEslintConfig(),
  prettierConfig,
  {
    files: [
      "*.vue",
      "**/*.vue",
      "**/*.js",
      "**/*.jsx",
      "**/*.cjs",
      "**/*.mjs",
      "**/*.ts",
      "**/*.tsx",
      "**/*.cts",
      "**/*.mts",
    ],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
      },
    },
  },
];
