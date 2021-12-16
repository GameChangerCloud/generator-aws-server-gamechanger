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
    sqlType: string;
    constructor(name: string, type: string, nonNullArrayValues: boolean, noNull: boolean, isArray: boolean, directives: any, args: any, isDeprecated: boolean);
    setNoNull(): void;
    /**
   * Set up types fields to handle tracking of foreign key that might have been added by other types
   * Init Object type parameters . obj = {key1 : value1, key2 : value2 ....}
   * @param {*} types list of types
   * @returns nothing
   */
    initObjectParameters(): void;
    greet(): string;
}
