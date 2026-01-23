module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  plugins: ["lambda-html"],
  extends: ["plugin:lambda-html/recommended"],
  rules: {
    // You can adjust the severity level
    "lambda-html/no-known-modifiers-in-setclass": "warn", // or "error" or "off"
  },
};
