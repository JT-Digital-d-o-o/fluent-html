"use strict";
const noKnownModifiersInSetclass = require("./rules/no-known-modifiers-in-setclass");
const noUnnecessarySpacesInSetclass = require("./rules/no-unnecessary-spaces-in-setclass");
const noDuplicateClassesInSetclass = require("./rules/no-duplicate-classes-in-setclass");
const noConflictingClassesInSetclass = require("./rules/no-conflicting-classes-in-setclass");
const noEmptySetclass = require("./rules/no-empty-setclass");
const noMultipleSetclassInChain = require("./rules/no-multiple-setclass-in-chain");
const noSetclassAfterFluentModifier = require("./rules/no-setclass-after-fluent-modifier");
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
            plugins: ["lambda-html"],
            rules: {
                "lambda-html/no-known-modifiers-in-setclass": "warn",
                "lambda-html/no-unnecessary-spaces-in-setclass": "warn",
                "lambda-html/no-duplicate-classes-in-setclass": "warn",
                "lambda-html/no-conflicting-classes-in-setclass": "warn",
                "lambda-html/no-empty-setclass": "warn",
                "lambda-html/no-multiple-setclass-in-chain": "error",
                "lambda-html/no-setclass-after-fluent-modifier": "error",
            },
        },
    },
};
module.exports = plugin;
