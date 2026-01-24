"use strict";
const rule = {
    meta: {
        type: "layout",
        docs: {
            description: "Disallow unnecessary spaces in setClass() strings",
            category: "Stylistic Issues",
            recommended: true,
        },
        fixable: "whitespace",
        messages: {
            unnecessarySpaces: "Unnecessary spaces in setClass() string. Use single spaces between classes.",
        },
        schema: [],
    },
    create(context) {
        function checkString(node, value, nodeStart, checkLeading = true, checkTrailing = true) {
            // Check for multiple consecutive spaces
            const multipleSpaces = /  +/g;
            let match;
            while ((match = multipleSpaces.exec(value)) !== null) {
                context.report({
                    node,
                    messageId: "unnecessarySpaces",
                    loc: {
                        start: context.getSourceCode().getLocFromIndex(nodeStart + match.index),
                        end: context.getSourceCode().getLocFromIndex(nodeStart + match.index + match[0].length),
                    },
                    fix(fixer) {
                        return fixer.replaceTextRange([nodeStart + match.index, nodeStart + match.index + match[0].length], " ");
                    },
                });
            }
            // Check for leading spaces (only if checkLeading is true)
            if (checkLeading) {
                const leadingSpaces = value.match(/^(\s+)/);
                if (leadingSpaces) {
                    context.report({
                        node,
                        messageId: "unnecessarySpaces",
                        loc: {
                            start: context.getSourceCode().getLocFromIndex(nodeStart),
                            end: context.getSourceCode().getLocFromIndex(nodeStart + leadingSpaces[0].length),
                        },
                        fix(fixer) {
                            return fixer.removeRange([nodeStart, nodeStart + leadingSpaces[0].length]);
                        },
                    });
                }
            }
            // Check for trailing spaces (only if checkTrailing is true)
            if (checkTrailing) {
                const trailingSpaces = value.match(/(\s+)$/);
                if (trailingSpaces) {
                    const trailingStart = nodeStart + value.length - trailingSpaces[0].length;
                    context.report({
                        node,
                        messageId: "unnecessarySpaces",
                        loc: {
                            start: context.getSourceCode().getLocFromIndex(trailingStart),
                            end: context.getSourceCode().getLocFromIndex(trailingStart + trailingSpaces[0].length),
                        },
                        fix(fixer) {
                            return fixer.removeRange([trailingStart, trailingStart + trailingSpaces[0].length]);
                        },
                    });
                }
            }
        }
        return {
            CallExpression(node) {
                if (node.callee.type !== "MemberExpression") {
                    return;
                }
                if (node.callee.property.type !== "Identifier" ||
                    node.callee.property.name !== "setClass") {
                    return;
                }
                if (node.arguments.length === 0) {
                    return;
                }
                const arg = node.arguments[0];
                // Handle string literals
                if (arg.type === "Literal" && typeof arg.value === "string") {
                    // +1 for the opening quote
                    checkString(arg, arg.value, arg.range[0] + 1);
                }
                // Handle template literals
                if (arg.type === "TemplateLiteral") {
                    for (let i = 0; i < arg.quasis.length; i++) {
                        const quasi = arg.quasis[i];
                        if (quasi.value.cooked) {
                            const isFirst = i === 0;
                            const isLast = i === arg.quasis.length - 1;
                            // +1 for the backtick or }
                            checkString(quasi, quasi.value.cooked, quasi.range[0] + 1, isFirst, isLast);
                        }
                    }
                }
            },
        };
    },
};
module.exports = rule;
