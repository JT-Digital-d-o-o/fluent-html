type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
type ParamKeys<F> = keyof Parameters<F extends (...a: never[]) => unknown ? F : never>[0];
declare const R: {
    readonly simple: ((params: {
        id: string;
    } & {}, options?: import("../src/routes.js").RouteHxOptions) => import("../src/htmx.js").HTMX) & {
        readonly method: "get";
        readonly path: "/users/:id";
        readonly resolve: (params: {
            id: string;
        } & {}, query?: import("../src/htmx.js").QueryParams) => string;
    };
    readonly multi: ((params: {
        userId: string;
        postId: string;
    } & {}, options?: import("../src/routes.js").RouteHxOptions) => import("../src/htmx.js").HTMX) & {
        readonly method: "get";
        readonly path: "/a/:userId/b/:postId";
        readonly resolve: (params: {
            userId: string;
            postId: string;
        } & {}, query?: import("../src/htmx.js").QueryParams) => string;
    };
    readonly dotSuffix: ((params: {
        id: string;
    } & {}, options?: import("../src/routes.js").RouteHxOptions) => import("../src/htmx.js").HTMX) & {
        readonly method: "get";
        readonly path: "/export/:id.csv";
        readonly resolve: (params: {
            id: string;
        } & {}, query?: import("../src/htmx.js").QueryParams) => string;
    };
    readonly splat: ((params: {} & {
        path: string;
    }, options?: import("../src/routes.js").RouteHxOptions) => import("../src/htmx.js").HTMX) & {
        readonly method: "get";
        readonly path: "/files/*path";
        readonly resolve: (params: {} & {
            path: string;
        }, query?: import("../src/htmx.js").QueryParams) => string;
    };
    readonly anonSplat: ((params: {} & {
        splat: string;
    }, options?: import("../src/routes.js").RouteHxOptions) => import("../src/htmx.js").HTMX) & {
        readonly method: "get";
        readonly path: "/dl/*";
        readonly resolve: (params: {} & {
            splat: string;
        }, query?: import("../src/htmx.js").QueryParams) => string;
    };
    readonly mixed: ((params: {
        id: string;
    } & {
        rest: string;
    }, options?: import("../src/routes.js").RouteHxOptions) => import("../src/htmx.js").HTMX) & {
        readonly method: "get";
        readonly path: "/u/:id/*rest";
        readonly resolve: (params: {
            id: string;
        } & {
            rest: string;
        }, query?: import("../src/htmx.js").QueryParams) => string;
    };
};
declare const P: {
    readonly posts: ((params: {
        userId: number;
    } & {}, options?: import("../src/routes.js").RouteHxOptions) => import("../src/htmx.js").HTMX) & {
        readonly method: "get";
        readonly path: "/users/:userId/posts";
        readonly resolve: (params: {
            userId: number;
        } & {}, query?: import("../src/htmx.js").QueryParams) => string;
    };
};
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