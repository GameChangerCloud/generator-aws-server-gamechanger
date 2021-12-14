"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Field = void 0;
class Field {
    constructor(name, type, nonNullArrayValues, noNull, isArray, directives, args, isDeprecated) {
        this.name = name;
        this.type = type;
        this.nonNullArrayValues = nonNullArrayValues;
        this.noNull = noNull;
        this.isArray = isArray;
        this.directives = directives;
        this.args = args;
        this.isDeprecated = isDeprecated;
    }
    setNoNull() {
        this.noNull = true;
    }
    // Constructor to Init Object type parameters . obj = {key1 : value1, key2 : value2 ....}
    initObjectParameters() {
        this.foreign_key = null;
        // if the field is a relation
        this.relation = false;
        // if the field is added or is adding to another field
        this.delegated_field = {
            "state": false,
            "side": null,
            "associatedWith": {
                "type": null,
                "fieldName": null
            }
        };
        // if the field will appear in final model (tables) ex for oneToMany relation the field may dissapear
        this.in_model = false;
        // contains info if the field will be in a joinTable in final model, the name of the table
        // the name of the fields associated in the table 
        this.joinTable = {
            "state": false,
            "name": null,
            "contains": []
        };
        //Contains info about OneToOne relations
        this.oneToOneInfo = null;
    }
    greet() {
        return "Hello, ";
    }
}
exports.Field = Field;
