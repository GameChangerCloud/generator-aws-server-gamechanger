/**
 * From the schema, fetch all the types object and return an array of it
 * @param {*} schemaJSON
 * @returns
 */
export function getAllTypes(schemaJSON: any): any[];
export function getFieldsDirectiveNames(type: any): any[];
export function getschemaDirectivesNames(): any;
/** GRAPHQL files parsing */
/**
 * From the fields object, transform the syntax to get the right one to print on final type.js file. Return a string
 * @param {*} currentTypeName
 * @param {*} fields
 * @param {*} type
 * @param {*} relations
 * @param {*} manyToManyTables
 * @param {*} typesName
 * @param {*} defaultScalarsType
 * @returns
 */
export function getFieldsParsed(type: any, relations: any, manyToManyTables: any, typesName: any, defaultScalarsType: any, ...args: any[]): string;
export function getFieldsInput(fields: any, ...args: any[]): string;
export function getRequire(type: any, defaultScalars: any): string;
export function getGraphqlType(type: any): "GraphQLInterfaceType" | "GraphQLEnumType" | "GraphQLScalarType" | "GraphQLObjectType" | undefined;
export function getResolveType(type: any, currentTypeName: any): string;
export function getEnumValues(currentType: any): string;
/** TYPE HANDLER */
export function getFieldsParsedHandler(currentTypeName: any, fields: any, isOneToOneChild: any, parent: any): string;
/** DATABASE (tables, init, fill, drop) */
export function getAllTables(types: any, scalarTypeNames: any): any[];
export function getInitEachModelsJS(tables: any): string;
export function getInitEachFieldsModelsJS(types: any): string;
export function getListOfModelsExport(types: any): string;
/**
 *  Compute relationships oneToMany, manyToMany, etc..
 * @param {*} types contains all types with associated attributes read from easygraphql-parser
 * @param {*} typenames names assocoated with each type
 * @param {*} scalarTypeNames scalar type name if type is one of them
 * @param {*} env allows to throw errors of not supported relations without stacktrace
 * @returns
 */
export function getRelations(types: any, scalarTypeNames: any, env: any): any;
export function isSelfJoinOne(type: any, selfJoinOne: any): boolean;
export function isSelfJoinMany(type: any, selfJoinMany: any): boolean;
/**
 * Build the list of join tables to add to the schema on top of standard object
 *
 * @param {*} List of types as return by easygraphql-parser and enrich by determining relationship kinds on each field
 * @param {*} scalarTypeNames
 * @returns Tables description
 */
export function getJoinTables(types: any, scalarTypeNames: any): any[];
export function getQuerySelfJoinOne(currentTypeName: any, fields: any): string;
export function getQuerySelfJoinMany(currentTypeName: any, fields: any): string;
/** UTILS FUNCTIONS */
export function hasFieldType(type: any, fieldType: any): {
    fieldInfo: null;
    answers: boolean;
};
export function formatName(name: any): any;
export function addIdTypes(types: any): any;
export function isSchemaValid(types: any): {
    response: boolean;
    reason: string;
} | {
    response: boolean;
    reason?: undefined;
};
export function getFieldsCreate(currentTypeName: any, fields: any, relations: any, manyToManyTables: any): string;
export function getFieldsName(tables: any, fields: any, currentTypeName: any, currentSQLTypeName: any, relations: any): string;
export function compareSchema(old_schema: any, new_schema: any): (string[] | never[][] | {
    name: string;
}[])[];
export function findTable(tables: any, name: any): any;
export function findField(fields: any, columnName: any): any;
/**
 * Set up types fields to handle tracking of foreign key that might have been added by other types
 *
 * @param {*} types list of types
 * @returns nothing
 */
export function addMissingInfos(types: any): any;
