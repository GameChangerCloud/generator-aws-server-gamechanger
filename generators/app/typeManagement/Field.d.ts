import { Relationships } from "../relationships";
export declare class Field {
    name: string;
    type: string;
    relationType: Relationships;
    relation: boolean;
    in_model: boolean;
    oneToOneInfo: any;
    nonNullArrayValues: boolean;
    noNull: boolean;
    isArray: boolean;
    directives: any;
    args: any;
    delegated_field: any;
    foreign_key: any;
    isDeprecated: boolean;
    joinTable: any;
    constructor(name: string, type: string, nonNullArrayValues: boolean, noNull: boolean, isArray: boolean, directives: any, args: any, isDeprecated: boolean);
    setNoNull(): void;
    initObjectParameters(): void;
    greet(): string;
}
