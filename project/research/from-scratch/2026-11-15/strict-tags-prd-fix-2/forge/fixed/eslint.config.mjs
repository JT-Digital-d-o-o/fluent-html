// The "no forged brand" job of the strict lint config: existing rules, configured. Nothing here is written for this library.
// Module augmentation is left to tsc (the package's tables are type aliases), so Fastify's own augmentation stays legal.
import parser from "/Users/tony/jt-digital/everyframe-composer/node_modules/@typescript-eslint/parser/dist/index.js";
import tseslint from "/Users/tony/jt-digital/everyframe-composer/node_modules/@typescript-eslint/eslint-plugin/dist/index.js";
const ban = (selector, message) => ({ selector, message });
export default [{
  files: ["**/*.ts"],
  languageOptions: { parser, parserOptions: { project: "./tsconfig.json", tsconfigRootDir: import.meta.dirname } },
  plugins: { "@typescript-eslint": tseslint },
  linterOptions: { reportUnusedDisableDirectives: "error" },
  rules: {
    "@typescript-eslint/consistent-type-assertions": ["error", { assertionStyle: "never" }],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-argument": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-return": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/ban-ts-comment": ["error", { "ts-expect-error": true, "ts-ignore": true, "ts-nocheck": true, "ts-check": false }],
    "no-restricted-syntax": ["error",
      ban("TSTypePredicate", "strict file: no type predicate. A predicate can claim a brand its value does not have; put domain predicates in a file that does not import the strict package"),
      ban("TSDeclareFunction", "strict file: no overload signature and no ambient function. A signature can claim a brand its body does not make"),
      ban("VariableDeclaration[declare=true], ClassDeclaration[declare=true]", "strict file: no ambient value. A declaration can claim a brand nothing made"),
    ],
  },
}];
