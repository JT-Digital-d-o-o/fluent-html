import noKnownModifiersInSetclass = require("./rules/no-known-modifiers-in-setclass");

const plugin = {
  rules: {
    "no-known-modifiers-in-setclass": noKnownModifiersInSetclass,
  },
  configs: {
    recommended: {
      plugins: ["lambda-html"],
      rules: {
        "lambda-html/no-known-modifiers-in-setclass": "warn",
      },
    },
  },
};

export = plugin;
