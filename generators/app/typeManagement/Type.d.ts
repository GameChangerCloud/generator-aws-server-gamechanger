import { Field } from "./Field";
export declare class Type {
    type: string;
    typeName: string;
    sqlTypeName: string;
    description: string;
    directives: any;
    relationList: any;
    fields: Field[];
    implementedTypes: any;
    constructor(type: string, typeName: string, sqlTypeName: string, description: string, directives: any, implementedTypes: any);
    static initTypes(schemaJSON: any): Type[];
    addField(field: Field): void;
    greet(): string;
}
