import { Rule } from "eslint";

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow empty or whitespace-only setClass() calls",
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code",
    messages: {
      emptySetClass: "Empty setClass() call has no effect. Remove it or add classes.",
    },
    schema: [],
  },

  create(context: Rule.RuleContext): Rule.RuleListener {
    return {
      CallExpression(node: any) {
        if (node.callee.type !== "MemberExpression") return;
        if (node.callee.property.type !== "Identifier" || node.callee.property.name !== "setClass") return;

        // No arguments
        if (node.arguments.length === 0) {
          context.report({
            node,
            messageId: "emptySetClass",
          });
          return;
        }

        const arg = node.arguments[0];

        // Empty string literal
        if (arg.type === "Literal" && typeof arg.value === "string") {
          if (arg.value.trim() === "") {
            context.report({
              node: arg,
              messageId: "emptySetClass",
            });
          }
        }

        // Empty template literal with no expressions
        if (arg.type === "TemplateLiteral" && arg.expressions.length === 0) {
          const content = arg.quasis.map((q: any) => q.value.cooked || "").join("");
          if (content.trim() === "") {
            context.report({
              node: arg,
              messageId: "emptySetClass",
            });
          }
        }
      },
    };
  },
};

export = rule;
