import tseslint from "typescript-eslint";

import rootConfig from "../../eslint.config.mjs";

/**
 * @type {import('typescript-eslint').Config}
 */
export default tseslint.config(rootConfig, {
  files: ["**/*.{ts,tsx}"],
  ignores: ["dist/**"],
  languageOptions: {
    parserOptions: {
      // tsconfig.json is a solution-style file (no direct `include`, just a
      // reference to tsconfig.lib.json) — typed linting needs the project
      // that actually lists source files.
      project: ["tsconfig.lib.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
