"use strict";
// Supported relationships
Object.defineProperty(exports, "__esModule", { value: true });
exports.Relationships = void 0;
var Relationships;
(function (Relationships) {
    Relationships["oneToOne"] = "oneToOne";
    Relationships["manyToMany"] = "manyToMany";
    Relationships["oneToMany"] = "oneToMany";
    Relationships["manyToOne"] = "manyToOne";
    Relationships["oneOnly"] = "oneOnly";
    Relationships["manyOnly"] = "manyOnly";
    Relationships["selfJoinOne"] = "selfJoinOne";
    Relationships["selfJoinMany"] = "selfJoinMany";
})(Relationships = exports.Relationships || (exports.Relationships = {}));
