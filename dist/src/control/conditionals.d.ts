import type { View, Thunk } from "../core/types.js";
export declare function IfThenElse(condition: boolean, thenBranch: Thunk<View>, elseBranch: Thunk<View>): View;
export declare function IfThenElse<T>(value: T | null | undefined, thenBranch: (value: T) => View, elseBranch: Thunk<View>): View;
export declare function IfThen(condition: boolean, then: Thunk<View>): View;
export declare function IfThen<T>(value: T | null | undefined, then: (value: T) => View): View;
type Case = {
    condition: boolean;
    component: Thunk<View>;
};
export declare function SwitchCase(cases: Case[], defaultView?: Thunk<View>): View;
export {};
//# sourceMappingURL=conditionals.d.ts.map