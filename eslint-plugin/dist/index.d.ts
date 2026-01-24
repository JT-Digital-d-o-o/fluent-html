declare const plugin: {
    rules: {
        "no-known-modifiers-in-setclass": import("eslint").Rule.RuleModule;
        "no-unnecessary-spaces-in-setclass": import("eslint").Rule.RuleModule;
        "no-duplicate-classes-in-setclass": import("eslint").Rule.RuleModule;
        "no-conflicting-classes-in-setclass": import("eslint").Rule.RuleModule;
        "no-empty-setclass": import("eslint").Rule.RuleModule;
        "no-multiple-setclass-in-chain": import("eslint").Rule.RuleModule;
        "no-setclass-after-fluent-modifier": import("eslint").Rule.RuleModule;
    };
    configs: {
        recommended: {
            plugins: string[];
            rules: {
                "lambda-html/no-known-modifiers-in-setclass": string;
                "lambda-html/no-unnecessary-spaces-in-setclass": string;
                "lambda-html/no-duplicate-classes-in-setclass": string;
                "lambda-html/no-conflicting-classes-in-setclass": string;
                "lambda-html/no-empty-setclass": string;
                "lambda-html/no-multiple-setclass-in-chain": string;
                "lambda-html/no-setclass-after-fluent-modifier": string;
            };
        };
    };
};
export = plugin;
