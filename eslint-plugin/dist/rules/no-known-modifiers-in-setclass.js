"use strict";
// Map of Tailwind class prefixes/patterns to SwiftUI-style method names
const MODIFIER_MAP = {
    // Padding
    "p-": "padding()",
    "px-": "padding('x', ...)",
    "py-": "padding('y', ...)",
    "pt-": "padding('top', ...) or padding('t', ...)",
    "pb-": "padding('bottom', ...) or padding('b', ...)",
    "pl-": "padding('left', ...) or padding('l', ...)",
    "pr-": "padding('right', ...) or padding('r', ...)",
    // Margin
    "m-": "margin()",
    "mx-": "margin('x', ...)",
    "my-": "margin('y', ...)",
    "mt-": "margin('top', ...) or margin('t', ...)",
    "mb-": "margin('bottom', ...) or margin('b', ...)",
    "ml-": "margin('left', ...) or margin('l', ...)",
    "mr-": "margin('right', ...) or margin('r', ...)",
    // Colors
    "bg-": "background()",
    "text-gray-": "textColor()",
    "text-blue-": "textColor()",
    "text-red-": "textColor()",
    "text-green-": "textColor()",
    "text-yellow-": "textColor()",
    "text-purple-": "textColor()",
    "text-pink-": "textColor()",
    "text-indigo-": "textColor()",
    "text-white": "textColor('white')",
    "text-black": "textColor('black')",
    "border-gray-": "borderColor()",
    "border-blue-": "borderColor()",
    "border-red-": "borderColor()",
    "border-green-": "borderColor()",
    "border-yellow-": "borderColor()",
    "border-purple-": "borderColor()",
    "border-pink-": "borderColor()",
    "border-indigo-": "borderColor()",
    // Typography
    "text-xs": "textSize('xs')",
    "text-sm": "textSize('sm')",
    "text-base": "textSize('base')",
    "text-lg": "textSize('lg')",
    "text-xl": "textSize('xl')",
    "text-2xl": "textSize('2xl')",
    "text-3xl": "textSize('3xl')",
    "text-4xl": "textSize('4xl')",
    "text-5xl": "textSize('5xl')",
    "text-6xl": "textSize('6xl')",
    "text-7xl": "textSize('7xl')",
    "text-8xl": "textSize('8xl')",
    "text-9xl": "textSize('9xl')",
    "text-left": "textAlign('left')",
    "text-center": "textAlign('center')",
    "text-right": "textAlign('right')",
    "text-justify": "textAlign('justify')",
    "font-thin": "fontWeight('thin')",
    "font-extralight": "fontWeight('extralight')",
    "font-light": "fontWeight('light')",
    "font-normal": "fontWeight('normal')",
    "font-medium": "fontWeight('medium')",
    "font-semibold": "fontWeight('semibold')",
    "font-bold": "fontWeight('bold')",
    "font-extrabold": "fontWeight('extrabold')",
    "font-black": "fontWeight('black')",
    // Sizing
    "w-": "w()",
    "h-": "h()",
    "max-w-": "maxW()",
    "min-w-": "minW()",
    "max-h-": "maxH()",
    "min-h-": "minH()",
    // Flexbox
    "flex": "flex()",
    "flex-1": "flex('1')",
    "flex-row": "flexDirection('row')",
    "flex-col": "flexDirection('col')",
    "flex-row-reverse": "flexDirection('row-reverse')",
    "flex-col-reverse": "flexDirection('col-reverse')",
    "justify-start": "justifyContent('start')",
    "justify-end": "justifyContent('end')",
    "justify-center": "justifyContent('center')",
    "justify-between": "justifyContent('between')",
    "justify-around": "justifyContent('around')",
    "justify-evenly": "justifyContent('evenly')",
    "items-start": "alignItems('start')",
    "items-end": "alignItems('end')",
    "items-center": "alignItems('center')",
    "items-baseline": "alignItems('baseline')",
    "items-stretch": "alignItems('stretch')",
    "gap-": "gap()",
    "gap-x-": "gap('x', ...)",
    "gap-y-": "gap('y', ...)",
    // Grid
    "grid": "grid()",
    "grid-cols-": "gridCols()",
    "grid-rows-": "gridRows()",
    // Borders & Effects
    "border": "border()",
    "border-2": "border('2')",
    "border-4": "border('4')",
    "border-8": "border('8')",
    "rounded": "rounded()",
    "rounded-none": "rounded('none')",
    "rounded-sm": "rounded('sm')",
    "rounded-md": "rounded('md')",
    "rounded-lg": "rounded('lg')",
    "rounded-xl": "rounded('xl')",
    "rounded-2xl": "rounded('2xl')",
    "rounded-3xl": "rounded('3xl')",
    "rounded-full": "rounded('full')",
    "shadow": "shadow()",
    "shadow-sm": "shadow('sm')",
    "shadow-md": "shadow('md')",
    "shadow-lg": "shadow('lg')",
    "shadow-xl": "shadow('xl')",
    "shadow-2xl": "shadow('2xl')",
    // Position & Layout
    "static": "position('static')",
    "fixed": "position('fixed')",
    "absolute": "position('absolute')",
    "relative": "position('relative')",
    "sticky": "position('sticky')",
    "z-": "zIndex()",
    "opacity-": "opacity()",
    "cursor-": "cursor()",
    "overflow-hidden": "overflow('hidden')",
    "overflow-auto": "overflow('auto')",
    "overflow-x-": "overflow('x', ...)",
    "overflow-y-": "overflow('y', ...)",
};
function checkClassForKnownModifiers(className) {
    const violations = [];
    for (const [prefix, method] of Object.entries(MODIFIER_MAP)) {
        if (className === prefix.replace(/-$/, "") || className.startsWith(prefix)) {
            violations.push({ className, method });
        }
    }
    return violations;
}
const rule = {
    meta: {
        type: "suggestion",
        docs: {
            description: "Warn when setClass() is used with Tailwind classes that have dedicated SwiftUI-style methods",
            category: "Best Practices",
            recommended: true,
        },
        messages: {
            useKnownModifier: "Avoid using .setClass() with '{{className}}'. Use .{{method}} instead to prevent style overrides.",
        },
        schema: [],
    },
    create(context) {
        return {
            CallExpression(node) {
                // Check if this is a method call
                if (node.callee.type !== "MemberExpression") {
                    return;
                }
                // Check if the method name is "setClass"
                if (node.callee.property.type !== "Identifier" ||
                    node.callee.property.name !== "setClass") {
                    return;
                }
                // Check if there's a string literal argument
                if (node.arguments.length === 0) {
                    return;
                }
                const arg = node.arguments[0];
                // Handle string literals
                if (arg.type === "Literal" && typeof arg.value === "string") {
                    const classNames = arg.value.split(/\s+/).filter(Boolean);
                    for (const className of classNames) {
                        const violations = checkClassForKnownModifiers(className);
                        for (const violation of violations) {
                            context.report({
                                node: arg,
                                messageId: "useKnownModifier",
                                data: {
                                    className: violation.className,
                                    method: violation.method,
                                },
                            });
                        }
                    }
                }
                // Handle template literals
                if (arg.type === "TemplateLiteral") {
                    // Only check static parts
                    for (const quasi of arg.quasis) {
                        if (quasi.value.cooked) {
                            const classNames = quasi.value.cooked.split(/\s+/).filter(Boolean);
                            for (const className of classNames) {
                                const violations = checkClassForKnownModifiers(className);
                                for (const violation of violations) {
                                    context.report({
                                        node: arg,
                                        messageId: "useKnownModifier",
                                        data: {
                                            className: violation.className,
                                            method: violation.method,
                                        },
                                    });
                                }
                            }
                        }
                    }
                }
            },
        };
    },
};
module.exports = rule;
