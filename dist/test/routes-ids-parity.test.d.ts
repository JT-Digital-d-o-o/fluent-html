type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
type ParamKeys<F> = keyof Parameters<F extends (...a: never[]) => unknown ? F : never>[0];
declare const R: import("../src/routes.js").RouteRegistry<{
    readonly simple: {
        readonly method: "get";
        readonly path: "/users/:id";
    };
    readonly multi: {
        readonly method: "get";
        readonly path: "/a/:userId/b/:postId";
    };
    readonly dotSuffix: {
        readonly method: "get";
        readonly path: "/export/:id.csv";
    };
    readonly splat: {
        readonly method: "get";
        readonly path: "/files/*path";
    };
    readonly anonSplat: {
        readonly method: "get";
        readonly path: "/dl/*";
    };
    readonly mixed: {
        readonly method: "get";
        readonly path: "/u/:id/*rest";
    };
}>;
declare const P: import("../src/routes.js").RouteRegistry<{
    readonly posts: {
        readonly method: "get";
        readonly path: "/users/:userId/posts";
        readonly params: {
            readonly userId: "number";
        };
        readonly query: unknown;
        readonly sitemap: unknown;
    };
}>;
export type _RouteParamKeyParity = [
    Expect<Equals<ParamKeys<typeof R.simple.resolve>, "id">>,
    Expect<Equals<ParamKeys<typeof R.multi.resolve>, "userId" | "postId">>,
    Expect<Equals<ParamKeys<typeof R.dotSuffix.resolve>, "id">>,
    Expect<Equals<ParamKeys<typeof R.splat.resolve>, "path">>,
    Expect<Equals<ParamKeys<typeof R.anonSplat.resolve>, "splat">>,
    Expect<Equals<ParamKeys<typeof R.mixed.resolve>, "id" | "rest">>,
    Expect<Equals<ParamKeys<typeof P.posts.resolve>, "userId">>
];
declare const ids: {
    readonly modal: import("../src/ids.js").Id;
    readonly userList: import("../src/ids.js").Id;
    readonly notificationArea: import("../src/ids.js").Id;
    readonly col2: import("../src/ids.js").Id;
    readonly step3Panel: import("../src/ids.js").Id;
    readonly tab1: import("../src/ids.js").Id;
};
export type _IdKeyParity = Expect<Equals<keyof typeof ids, "userList" | "col2" | "step3Panel" | "tab1" | "modal" | "notificationArea">>;
export {};
//# sourceMappingURL=routes-ids-parity.test.d.ts.map