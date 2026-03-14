export interface BehaviorMap {
}
declare module "./tag.js" {
    interface Tag {
        behavior<K extends keyof BehaviorMap>(name: K, ...args: BehaviorMap[K] extends void ? [] : [options: BehaviorMap[K]]): this;
    }
}
//# sourceMappingURL=behavior-methods.d.ts.map