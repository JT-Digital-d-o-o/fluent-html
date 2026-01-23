declare const plugin: {
    rules: {
        "no-known-modifiers-in-setclass": import("eslint").Rule.RuleModule;
    };
    configs: {
        recommended: {
            plugins: string[];
            rules: {
                "lambda-html/no-known-modifiers-in-setclass": string;
            };
        };
    };
};
export = plugin;
