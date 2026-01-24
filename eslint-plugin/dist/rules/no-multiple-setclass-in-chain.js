"use strict";
const rule = {
    meta: {
        type: "problem",
        docs: {
            description: "Disallow multiple setClass() calls in a method chain (earlier calls get overwritten)",
            category: "Possible Errors",
            recommended: true,
        },
        messages: {
            multipleSetClass: "Multiple setClass() calls in chain. The first setClass('{{firstClasses}}') will be overwritten by the second. Use .setClass('{{firstClasses}} {{secondClasses}}') or .setClass(...).addClass(...) instead.",
        },
        schema: [],
    },
    create(context) {
        // Track setClass calls we've already reported to avoid duplicate reports
        const reportedNodes = new WeakSet();
        function getSetClassValue(node) {
            if (node.arguments.length === 0)
                return "";
            const arg = node.arguments[0];
            if (arg.type === "Literal" && typeof arg.value === "string") {
                return arg.value;
            }
            if (arg.type === "TemplateLiteral") {
                // For template literals, just get the static parts
                return arg.quasis.map((q) => q.value.cooked || "").join("...");
            }
            return "...";
        }
        function findSetClassCallsInChain(node) {
            const setClassCalls = [];
            let current = node;
            while (current) {
                if (current.type === "CallExpression" &&
                    current.callee.type === "MemberExpression" &&
                    current.callee.property.type === "Identifier" &&
                    current.callee.property.name === "setClass") {
                    setClassCalls.push(current);
                }
                // Move up the chain
                if (current.type === "CallExpression" &&
                    current.callee.type === "MemberExpression") {
                    current = current.callee.object;
                }
                else {
                    break;
                }
            }
            return setClassCalls;
        }
        return {
            CallExpression(node) {
                if (node.callee.type !== "MemberExpression")
                    return;
                if (node.callee.property.type !== "Identifier" ||
                    node.callee.property.name !== "setClass")
                    return;
                // Skip if we've already reported this node as part of another chain
                if (reportedNodes.has(node))
                    return;
                // Find all setClass calls in this chain
                const setClassCalls = findSetClassCallsInChain(node);
                // If there's more than one setClass call, report it
                if (setClassCalls.length > 1) {
                    // Mark all as reported
                    for (const call of setClassCalls) {
                        reportedNodes.add(call);
                    }
                    // The calls are in reverse order (outermost first), so reverse to get chain order
                    const orderedCalls = setClassCalls.reverse();
                    const firstCall = orderedCalls[0];
                    const secondCall = orderedCalls[1];
                    const firstClasses = getSetClassValue(firstCall) || "";
                    const secondClasses = getSetClassValue(secondCall) || "";
                    context.report({
                        node: secondCall,
                        messageId: "multipleSetClass",
                        data: {
                            firstClasses: firstClasses.trim(),
                            secondClasses: secondClasses.trim(),
                        },
                    });
                }
            },
        };
    },
};
module.exports = rule;
