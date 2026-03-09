import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import fluentHtml from "eslint-plugin-fluent-html";

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
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
      "@typescript-eslint": tsPlugin,
      "fluent-html": fluentHtml
    },
    rules: {
      // Strict TypeScript rules
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": "error",
      "no-console": "error",

      // fluent-html rules
      "fluent-html/no-known-modifiers-in-setclass": "warn",
      "fluent-html/no-unnecessary-spaces-in-setclass": "warn",
      "fluent-html/no-duplicate-classes-in-setclass": "warn",
      "fluent-html/no-conflicting-classes-in-setclass": "warn",
      "fluent-html/no-empty-setclass": "warn"
    }
  },
  {
    files: ["bench/**/*.ts", "examples/**/*.ts", "test/fluent-styling*.ts"],
    rules: {
      "no-console": "off"
    }
  }
];
