"use strict";
// List of fluent modifier methods that add classes (would be overwritten by setClass)
const FLUENT_MODIFIERS = new Set([
    // Padding
    "padding",
    // Margin
    "margin",
    // Colors
    "background",
    "textColor",
    "borderColor",
    // Typography
    "textSize",
    "textAlign",
    "fontWeight",
    // Sizing
    "w",
    "h",
    "maxW",
    "minW",
    "maxH",
    "minH",
    // Flexbox
    "flex",
    "flexDirection",
    "justifyContent",
    "alignItems",
    "gap",
    // Grid
    "grid",
    "gridCols",
    "gridRows",
    // Borders & Effects
    "border",
    "rounded",
    "shadow",
    // Position & Layout
    "position",
    "zIndex",
    "opacity",
    "cursor",
    "overflow",
    // Other common modifiers
    "addClass",
]);
const rule = {
    meta: {
        type: "problem",
        docs: {
            description: "Disallow setClass() after fluent modifier methods (setClass overwrites all previously added classes)",
            category: "Possible Errors",
            recommended: true,
        },
        messages: {
            setClassAfterModifier: "setClass() called after .{{modifier}}() will overwrite the classes added by {{modifier}}(). Move setClass() before fluent modifiers, or use addClass() instead.",
        },
        schema: [],
    },
    create(context) {
        function findFluentModifiersBeforeSetClass(node) {
            const modifiersFound = [];
            // Walk up the chain from the setClass call
            let current = node.callee.object;
            while (current) {
                if (current.type === "CallExpression" &&
                    current.callee.type === "MemberExpression" &&
                    current.callee.property.type === "Identifier") {
                    const methodName = current.callee.property.name;
                    if (FLUENT_MODIFIERS.has(methodName)) {
                        modifiersFound.push(methodName);
                    }
                    // Continue up the chain
                    current = current.callee.object;
                }
                else {
                    break;
                }
            }
            return modifiersFound;
        }
        return {
            CallExpression(node) {
                if (node.callee.type !== "MemberExpression")
                    return;
                if (node.callee.property.type !== "Identifier" ||
                    node.callee.property.name !== "setClass")
                    return;
                // Check if there are any fluent modifiers in the chain before this setClass
                const modifiers = findFluentModifiersBeforeSetClass(node);
                if (modifiers.length > 0) {
                    // Report the first modifier found (most recent in chain)
                    context.report({
                        node,
                        messageId: "setClassAfterModifier",
                        data: {
                            modifier: modifiers[0],
                        },
                    });
                }
            },
        };
    },
};
module.exports = rule;
