import noKnownModifiersInSetclass = require("./rules/no-known-modifiers-in-setclass");
import noUnnecessarySpacesInSetclass = require("./rules/no-unnecessary-spaces-in-setclass");
import noDuplicateClassesInSetclass = require("./rules/no-duplicate-classes-in-setclass");
import noConflictingClassesInSetclass = require("./rules/no-conflicting-classes-in-setclass");
import noEmptySetclass = require("./rules/no-empty-setclass");
import noMultipleSetclassInChain = require("./rules/no-multiple-setclass-in-chain");
import noSetclassAfterFluentModifier = require("./rules/no-setclass-after-fluent-modifier");

const plugin = {
  rules: {
    "no-known-modifiers-in-setclass": noKnownModifiersInSetclass,
    "no-unnecessary-spaces-in-setclass": noUnnecessarySpacesInSetclass,
    "no-duplicate-classes-in-setclass": noDuplicateClassesInSetclass,
    "no-conflicting-classes-in-setclass": noConflictingClassesInSetclass,
    "no-empty-setclass": noEmptySetclass,
    "no-multiple-setclass-in-chain": noMultipleSetclassInChain,
    "no-setclass-after-fluent-modifier": noSetclassAfterFluentModifier,
  },
  configs: {
    recommended: {
      plugins: ["fluent-html"],
      rules: {
        "fluent-html/no-known-modifiers-in-setclass": "warn",
        "fluent-html/no-unnecessary-spaces-in-setclass": "warn",
        "fluent-html/no-duplicate-classes-in-setclass": "warn",
        "fluent-html/no-conflicting-classes-in-setclass": "warn",
        "fluent-html/no-empty-setclass": "warn",
        "fluent-html/no-multiple-setclass-in-chain": "error",
        "fluent-html/no-setclass-after-fluent-modifier": "error",
      },
    },
  },
};

export = plugin;
