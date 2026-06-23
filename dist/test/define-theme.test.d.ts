import { type ThemeKeys } from "../src/index.js";
declare const tokens: {
    readonly colors: {
        readonly brand: "#ff5500";
        readonly forest: "#2d5016";
    };
    readonly spacing: {
        readonly gutter: "1.5rem";
        readonly bleed: "2.5rem";
    };
    readonly fontSize: {
        readonly hero: "4.5rem";
    };
    readonly radius: {
        readonly card: "0.75rem";
    };
    readonly shadow: {
        readonly card: "0 2px 8px rgba(0,0,0,0.1)";
    };
};
declare module "../src/index.js" {
    interface FluentCustomColors extends ThemeKeys<typeof tokens, "colors"> {
    }
    interface FluentCustomSpacing extends ThemeKeys<typeof tokens, "spacing"> {
    }
    interface FluentCustomFontSize extends ThemeKeys<typeof tokens, "fontSize"> {
    }
    interface FluentCustomRadius extends ThemeKeys<typeof tokens, "radius"> {
    }
    interface FluentCustomShadow extends ThemeKeys<typeof tokens, "shadow"> {
    }
}
export {};
//# sourceMappingURL=define-theme.test.d.ts.map