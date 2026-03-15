import { type Id } from "../ids.js";
export type BehaviorMap = {
    toggle: {
        target: Id;
    };
    toggleClass: {
        target: Id;
        class: string;
    };
    remove: {
        target: Id;
    };
    clipboard: {
        value: string;
    };
    disable: void;
    focus: {
        target: Id;
    };
    scrollTo: {
        target: Id;
    };
    selectAll: void;
};
type BehaviorName = keyof BehaviorMap;
declare module "./tag.js" {
    interface Tag {
        behavior<K extends BehaviorName>(name: K, ...args: BehaviorMap[K] extends void ? [] : [options: BehaviorMap[K]]): this;
    }
}
export {};
//# sourceMappingURL=behavior-methods.d.ts.map