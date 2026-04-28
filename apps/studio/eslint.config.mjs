import nextPlugin from "@next/eslint-plugin-next";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

const ignoreConfig = {
  ignores: [".next/**", "node_modules/**", "build/**", "dist/**", "out/**", "**/.next/**"]
};

export default [
  ignoreConfig,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@next/next": nextPlugin,
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["C:/*", "D:/*", "/Users/*", "/home/*"],
              message: "Absolute local paths are forbidden to prevent environment mismatch on Vercel.",
            },
          ],
        },
      ],
    },
  },
];
