export namespace directives {
    namespace selector {
        const name: string;
        const type: string;
        const runtime: boolean;
        function resolve(field: any, types: any): string[];
    }
    namespace warn {
        const name_1: string;
        export { name_1 as name };
        const type_1: string;
        export { type_1 as type };
        const runtime_1: boolean;
        export { runtime_1 as runtime };
        export function resolve_1(): void;
        export { resolve_1 as resolve };
    }
}
