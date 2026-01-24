import { Rule } from "eslint";

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow duplicate class names in setClass()",
      category: "Possible Errors",
      recommended: true,
    },
    fixable: "code",
    messages: {
      duplicateClass: "Duplicate class '{{className}}' in setClass().",
    },
    schema: [],
  },

  create(context: Rule.RuleContext): Rule.RuleListener {
    function checkForDuplicates(node: any, value: string, nodeStart: number) {
      const classes = value.split(/\s+/).filter(Boolean);
      const seen = new Map<string, number>(); // class -> first occurrence index

      let currentIndex = 0;
      for (const className of classes) {
        const classIndex = value.indexOf(className, currentIndex);
        currentIndex = classIndex + className.length;

        if (seen.has(className)) {
          context.report({
            node,
            messageId: "duplicateClass",
            data: { className },
            loc: {
              start: context.getSourceCode().getLocFromIndex(nodeStart + classIndex),
              end: context.getSourceCode().getLocFromIndex(nodeStart + classIndex + className.length),
            },
          });
        } else {
          seen.set(className, classIndex);
        }
      }
    }

    return {
      CallExpression(node: any) {
        if (node.callee.type !== "MemberExpression") return;
        if (node.callee.property.type !== "Identifier" || node.callee.property.name !== "setClass") return;
        if (node.arguments.length === 0) return;

        const arg = node.arguments[0];

        if (arg.type === "Literal" && typeof arg.value === "string") {
          checkForDuplicates(arg, arg.value, arg.range[0] + 1);
        }

        if (arg.type === "TemplateLiteral") {
          for (const quasi of arg.quasis) {
            if (quasi.value.cooked) {
              checkForDuplicates(quasi, quasi.value.cooked, quasi.range[0] + 1);
            }
          }
        }
      },
    };
  },
};

export = rule;
