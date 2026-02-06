import tsParser from "@typescript-eslint/parser";
import fluentHtml from "eslint-plugin-fluent-html";

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "eslint-plugin/dist/**",
      "eslint-plugin/node_modules/**",
      "**/*.js",
      "!eslint.config.js"
    ]
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
    },
    plugins: {
      "fluent-html": fluentHtml
    },
    rules: {
      "fluent-html/no-known-modifiers-in-setclass": "warn",
      "fluent-html/no-unnecessary-spaces-in-setclass": "warn",
      "fluent-html/no-duplicate-classes-in-setclass": "warn",
      "fluent-html/no-conflicting-classes-in-setclass": "warn",
      "fluent-html/no-empty-setclass": "warn"
    }
  }
];
