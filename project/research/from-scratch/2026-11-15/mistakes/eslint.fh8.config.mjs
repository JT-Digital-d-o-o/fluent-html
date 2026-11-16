// fluent-html 8's lint as the template runs it: eslint-plugin-fluent-html 4.1.0's rules at the template's
// levels (templates/full-stack/eslint.config.mjs), run with --max-warnings=0 as `npm run lint` does.
import parser from "/Users/tony/jt-digital/fluent-html-eslint-plugin/node_modules/@typescript-eslint/parser/dist/index.js";
import fluentHtml from "/Users/tony/jt-digital/fluent-html-eslint-plugin/dist/index.js";

const recommended = fluentHtml.configs.recommended.rules;
export default [
  {
    files: ["**/fh8.ts", "**/fh8.*.ts", "arms/fh8/*.ts"],
    languageOptions: { parser, parserOptions: { ecmaVersion: 2022, sourceType: "module", projectService: { allowDefaultProject: ["seeds/*/fh8.ts", "seeds/*/fh8.*.ts", "seeds/*/*/fh8.*.ts", "arms/fh8/*.ts"], maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 200 }, tsconfigRootDir: import.meta.dirname } },
    plugins: { "fluent-html": fluentHtml },
    rules: {
      ...recommended,
      "fluent-html/no-innerhtml-swap": "error",
      "fluent-html/no-raw-ids": "error",
      "fluent-html/no-multiple-setclass-in-chain": "error",
      "fluent-html/no-setclass-after-fluent-modifier": "error",
      "fluent-html/no-setclass-in-when-apply-callback": "error",
      "fluent-html/no-ternary-in-view-builder": "error",
      "fluent-html/prefer-set-method": "error",
      "fluent-html/prefer-variadic-children": "error",
      "fluent-html/prefer-foreach": "error",
      "fluent-html/no-superfluous-view-return-type": "error",
      "fluent-html/no-tailwind-in-raw-class": "error",
      "fluent-html/no-dynamic-class-argument": "error",
      "fluent-html/no-tailwind-in-cssclass": "error",
      "fluent-html/require-satisfies-variant-object": "error",
      "fluent-html/anchor-requires-cursor-pointer": "error",
      "fluent-html/no-removed-v4-utilities": "error",
      "fluent-html/prefer-form-for": "warn",
      "fluent-html/prefer-toggle": "warn",
      "fluent-html/prefer-unit-overload": "warn",
      "fluent-html/prefer-htmx-api": "warn",
      "fluent-html/no-raw-icon-string": "error",
      "fluent-html/no-fluent-equivalent-in-setstyle": "error",
      "fluent-html/prefer-match": "warn",
      "fluent-html/no-dynamic-typed-styling-arg": "error",
      "fluent-html/match-subset-default": "error",
    },
  },
];
