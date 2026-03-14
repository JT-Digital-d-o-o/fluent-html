import { type Id } from "../src/ids.js";
declare module "../src/core/behavior-methods.js" {
    interface BehaviorMap {
        toggle: {
            target: Id;
        };
        charCount: {
            target: Id;
            max: number;
        };
        confirm: {
            message?: string;
        };
        autofocus: void;
        trackClick: {
            event: string;
        };
    }
}
//# sourceMappingURL=behavior.test.d.ts.map