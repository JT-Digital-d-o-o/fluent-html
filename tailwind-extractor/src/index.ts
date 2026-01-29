/**
 * Tailwind CSS content extractor for lambda.html
 * Extracts Tailwind classes from SwiftUI-style method calls
 */

interface MethodPattern {
  methodName: string;
  classPrefix: string;
  // Function to generate class from captured arguments
  generateClass: (args: string[]) => string[];
}

const METHOD_PATTERNS: MethodPattern[] = [
  // Padding
  {
    methodName: "padding",
    classPrefix: "p",
    generateClass: (args) => {
      if (args.length === 1) {
        return [`p-${args[0]}`];
      }
      if (args.length === 2) {
        const dirMap: Record<string, string> = {
          x: "x", y: "y",
          top: "t", bottom: "b", left: "l", right: "r",
          t: "t", b: "b", l: "l", r: "r",
        };
        const dir = dirMap[args[0]] || args[0];
        return [`p${dir}-${args[1]}`];
      }
      return [];
    },
  },
  // Margin
  {
    methodName: "margin",
    classPrefix: "m",
    generateClass: (args) => {
      if (args.length === 1) {
        return [`m-${args[0]}`];
      }
      if (args.length === 2) {
        const dirMap: Record<string, string> = {
          x: "x", y: "y",
          top: "t", bottom: "b", left: "l", right: "r",
          t: "t", b: "b", l: "l", r: "r",
        };
        const dir = dirMap[args[0]] || args[0];
        return [`m${dir}-${args[1]}`];
      }
      return [];
    },
  },
  // Background
  {
    methodName: "background",
    classPrefix: "bg",
    generateClass: (args) => args.length === 1 ? [`bg-${args[0]}`] : [],
  },
  // Text Color
  {
    methodName: "textColor",
    classPrefix: "text",
    generateClass: (args) => args.length === 1 ? [`text-${args[0]}`] : [],
  },
  // Text Size
  {
    methodName: "textSize",
    classPrefix: "text",
    generateClass: (args) => args.length === 1 ? [`text-${args[0]}`] : [],
  },
  // Text Align
  {
    methodName: "textAlign",
    classPrefix: "text",
    generateClass: (args) => args.length === 1 ? [`text-${args[0]}`] : [],
  },
  // Font Weight
  {
    methodName: "fontWeight",
    classPrefix: "font",
    generateClass: (args) => args.length === 1 ? [`font-${args[0]}`] : [],
  },
  // Width
  {
    methodName: "w",
    classPrefix: "w",
    generateClass: (args) => args.length === 1 ? [`w-${args[0]}`] : [],
  },
  // Height
  {
    methodName: "h",
    classPrefix: "h",
    generateClass: (args) => args.length === 1 ? [`h-${args[0]}`] : [],
  },
  // Max Width
  {
    methodName: "maxW",
    classPrefix: "max-w",
    generateClass: (args) => args.length === 1 ? [`max-w-${args[0]}`] : [],
  },
  // Min Width
  {
    methodName: "minW",
    classPrefix: "min-w",
    generateClass: (args) => args.length === 1 ? [`min-w-${args[0]}`] : [],
  },
  // Max Height
  {
    methodName: "maxH",
    classPrefix: "max-h",
    generateClass: (args) => args.length === 1 ? [`max-h-${args[0]}`] : [],
  },
  // Min Height
  {
    methodName: "minH",
    classPrefix: "min-h",
    generateClass: (args) => args.length === 1 ? [`min-h-${args[0]}`] : [],
  },
  // Flex
  {
    methodName: "flex",
    classPrefix: "flex",
    generateClass: (args) => args.length === 0 ? ["flex"] : [`flex-${args[0]}`],
  },
  // Flex Direction
  {
    methodName: "flexDirection",
    classPrefix: "flex",
    generateClass: (args) => args.length === 1 ? [`flex-${args[0]}`] : [],
  },
  // Justify Content
  {
    methodName: "justifyContent",
    classPrefix: "justify",
    generateClass: (args) => args.length === 1 ? [`justify-${args[0]}`] : [],
  },
  // Align Items
  {
    methodName: "alignItems",
    classPrefix: "items",
    generateClass: (args) => args.length === 1 ? [`items-${args[0]}`] : [],
  },
  // Gap
  {
    methodName: "gap",
    classPrefix: "gap",
    generateClass: (args) => {
      if (args.length === 1) {
        return [`gap-${args[0]}`];
      }
      if (args.length === 2) {
        return [`gap-${args[0]}-${args[1]}`];
      }
      return [];
    },
  },
  // Grid
  {
    methodName: "grid",
    classPrefix: "grid",
    generateClass: () => ["grid"],
  },
  // Grid Columns
  {
    methodName: "gridCols",
    classPrefix: "grid-cols",
    generateClass: (args) => args.length === 1 ? [`grid-cols-${args[0]}`] : [],
  },
  // Grid Rows
  {
    methodName: "gridRows",
    classPrefix: "grid-rows",
    generateClass: (args) => args.length === 1 ? [`grid-rows-${args[0]}`] : [],
  },
  // Border
  {
    methodName: "border",
    classPrefix: "border",
    generateClass: (args) => args.length === 0 ? ["border"] : [`border-${args[0]}`],
  },
  // Border Color
  {
    methodName: "borderColor",
    classPrefix: "border",
    generateClass: (args) => args.length === 1 ? [`border-${args[0]}`] : [],
  },
  // Rounded
  {
    methodName: "rounded",
    classPrefix: "rounded",
    generateClass: (args) => args.length === 0 ? ["rounded"] : [`rounded-${args[0]}`],
  },
  // Shadow
  {
    methodName: "shadow",
    classPrefix: "shadow",
    generateClass: (args) => args.length === 0 ? ["shadow"] : [`shadow-${args[0]}`],
  },
  // Opacity
  {
    methodName: "opacity",
    classPrefix: "opacity",
    generateClass: (args) => args.length === 1 ? [`opacity-${args[0]}`] : [],
  },
  // Cursor
  {
    methodName: "cursor",
    classPrefix: "cursor",
    generateClass: (args) => args.length === 1 ? [`cursor-${args[0]}`] : [],
  },
  // Position
  {
    methodName: "position",
    classPrefix: "",
    generateClass: (args) => args.length === 1 ? [args[0]] : [],
  },
  // Z-Index
  {
    methodName: "zIndex",
    classPrefix: "z",
    generateClass: (args) => args.length === 1 ? [`z-${args[0]}`] : [],
  },
  // Overflow
  {
    methodName: "overflow",
    classPrefix: "overflow",
    generateClass: (args) => {
      if (args.length === 1) {
        return [`overflow-${args[0]}`];
      }
      if (args.length === 2) {
        return [`overflow-${args[0]}-${args[1]}`];
      }
      return [];
    },
  },
  // Bold
  {
    methodName: "bold",
    classPrefix: "font",
    generateClass: () => ["font-bold"],
  },
  // Italic
  {
    methodName: "italic",
    classPrefix: "",
    generateClass: () => ["italic"],
  },
  // Uppercase
  {
    methodName: "uppercase",
    classPrefix: "",
    generateClass: () => ["uppercase"],
  },
  // Lowercase
  {
    methodName: "lowercase",
    classPrefix: "",
    generateClass: () => ["lowercase"],
  },
  // Capitalize
  {
    methodName: "capitalize",
    classPrefix: "",
    generateClass: () => ["capitalize"],
  },
  // Underline
  {
    methodName: "underline",
    classPrefix: "",
    generateClass: () => ["underline"],
  },
  // Line Through
  {
    methodName: "lineThrough",
    classPrefix: "",
    generateClass: () => ["line-through"],
  },
  // Truncate
  {
    methodName: "truncate",
    classPrefix: "",
    generateClass: () => ["truncate"],
  },
  // Leading (line-height)
  {
    methodName: "leading",
    classPrefix: "leading",
    generateClass: (args) => args.length === 1 ? [`leading-${args[0]}`] : [],
  },
  // Tracking (letter-spacing)
  {
    methodName: "tracking",
    classPrefix: "tracking",
    generateClass: (args) => args.length === 1 ? [`tracking-${args[0]}`] : [],
  },
];

/**
 * Extract arguments from a method call
 * e.g., .flex() -> []
 * e.g., .background("red-500") -> ["red-500"]
 * e.g., .padding("x", "4") -> ["x", "4"]
 */
function extractMethodArgs(content: string, methodName: string): string[][] {
  // Match .methodName( ... ) with optional quoted arguments
  const regex = new RegExp(
    `\\.${methodName}\\s*\\(\\s*` + // .methodName(
    `(?:` +                         // outer optional group
      `(?:` +
        `"([^"]*)"` +              // "arg" (double quotes)
        `|` +
        `'([^']*)'` +             // 'arg' (single quotes)
      `)` +
      `(?:\\s*,\\s*` +             // optional comma and next arg
        `(?:"([^"]*)"|'([^']*)')` +
      `)?` +                        // end optional second arg
    `)?` +                          // end outer optional group (for zero-arg calls)
    `\\s*\\)`, // )
    "g"
  );

  const results: string[][] = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    const args: string[] = [];
    // match[1] or match[2] is first arg (double or single quote)
    // match[3] or match[4] is second arg (double or single quote)
    if (match[1] !== undefined) args.push(match[1]);
    else if (match[2] !== undefined) args.push(match[2]);

    if (match[3] !== undefined) args.push(match[3]);
    else if (match[4] !== undefined) args.push(match[4]);

    results.push(args);
  }

  return results;
}

/**
 * Extract classes from .setClass() and .addClass() calls
 */
function extractDirectClasses(content: string): string[] {
  const classes: string[] = [];

  // Match .setClass("class1 class2") and .addClass("class1 class2")
  const regex = /\.(setClass|addClass)\s*\(\s*["']([^"']+)["']\s*\)/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const classString = match[2];
    // Split by whitespace and add each class
    const splitClasses = classString.split(/\s+/).filter(Boolean);
    classes.push(...splitClasses);
  }

  return classes;
}

/**
 * Main extractor function for Tailwind CSS
 */
export function lambdaHtmlExtractor(content: string): string[] {
  const classes = new Set<string>();

  // Extract classes from direct setClass/addClass calls
  const directClasses = extractDirectClasses(content);
  directClasses.forEach((cls) => classes.add(cls));

  // Extract classes from SwiftUI-style method calls
  for (const pattern of METHOD_PATTERNS) {
    const argsArray = extractMethodArgs(content, pattern.methodName);

    for (const args of argsArray) {
      const generatedClasses = pattern.generateClass(args);
      generatedClasses.forEach((cls) => classes.add(cls));
    }
  }

  return Array.from(classes);
}

// Default export for CommonJS
module.exports = lambdaHtmlExtractor;
module.exports.lambdaHtmlExtractor = lambdaHtmlExtractor;
