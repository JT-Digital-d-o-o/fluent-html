import tsParser from "@typescript-eslint/parser";
import lambdaHtml from "eslint-plugin-lambda-html";

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
      "lambda-html": lambdaHtml
    },
    rules: {
      "lambda-html/no-known-modifiers-in-setclass": "warn",
      "lambda-html/no-unnecessary-spaces-in-setclass": "warn",
      "lambda-html/no-duplicate-classes-in-setclass": "warn",
      "lambda-html/no-conflicting-classes-in-setclass": "warn",
      "lambda-html/no-empty-setclass": "warn"
    }
  }
];
