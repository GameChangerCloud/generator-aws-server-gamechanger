"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Type = void 0;
const Field_1 = require("./Field");
const utils_1 = __importDefault(require("../utils"));
class Type {
    constructor(type, typeName, sqlTypeName, description, directives, implementedTypes) {
        this.type = type;
        this.typeName = typeName;
        this.sqlTypeName = sqlTypeName;
        this.description = description;
        this.directives = directives;
        this.fields = new Array();
        this.implementedTypes = implementedTypes;
        // stores all the relations which were found for a give type
        this.relationList = []; // { "type" : null, "relation" : }
    }
    static initTypes(schemaJSON) {
        let types = [];
        for (const type in schemaJSON) {
            let typeToAdd = new Type(schemaJSON[type]["type"], type, utils_1.default.getSQLTableName(type), schemaJSON[type]["description"], schemaJSON[type]["directives"], schemaJSON[type]["implementedTypes"]);
            for (const field in schemaJSON[type]["fields"]) {
                let selectedField = schemaJSON[type]["fields"][field];
                let fieldToAdd = new Field_1.Field(selectedField["name"], selectedField["type"], selectedField["noNullArrayValues"], selectedField["noNull"], selectedField["isArray"], selectedField["directives"], selectedField["arguments"], selectedField["isDeprecated"]);
                if (selectedField["name"] === "id") {
                    fieldToAdd.setNoNull();
                }
                //Init missingInfos on the field
                fieldToAdd.initObjectParameters();
                //adds the field to the type
                typeToAdd.addField(fieldToAdd);
            }
            types.push(typeToAdd);
        }
        return types;
    }
    addField(field) {
        this.fields.push(field);
    }
    greet() {
        return "Hello, ";
    }
}
exports.Type = Type;
