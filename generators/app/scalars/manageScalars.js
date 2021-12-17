const scalars = require('./scalars');
const utils = require('../utils');
const getFieldCreate = (type, name) => {
    let s = null;
    switch (type) {
        case "ID":
        case "Boolean":
        case "Int":
            s = `args.${name}`;
            break;
        case "String":
        case "Date":
        case "RGB":
        case "RGBA":
        case "HSL":
        case "HSLA":
        case "HexColorCode":
        case "Time":
            s = `utils.escapeQuote(args.${name})`;
            break;
        case "DateTime":
            s = `"'" + args.${name}.toISOString() + "'"`;
            break;
        default:
            // Default for all defined scalars
            if (scalars[type])
                s = `args.${name}`;
            break;
    }
    return s;
};
const getFieldName = (scalar, name, type) => {
    let s = null;
    switch (scalar) {
        case "ID":
            s = "\\\"Pk_" + utils.getSQLTableName(type) + "_id\\\"";
            break;
        case "Boolean":
        case "Int":
        case "String":
        case "Date":
        case "Time":
        case "DateTime":
            s = "\\\"" + name + "\\\"";
            break;
        default:
            if (scalars[scalar])
                s = "\\\"" + name + "\\\"";
            break;
    }
    return s;
};
const isScalar = (type) => {
    if (type in scalars || type === "String" || type === "ID" || type === "Int" || type === "Boolean" || type === "Float") {
        return true;
    }
    else {
        return false;
    }
};
const isBasicType = (type) => {
    if (type === "String" || type === "ID" || type === "Int" || type === "Boolean" || type === "Float") {
        return true;
    }
    else {
        return false;
    }
};
const getScalarFieldInfo = (currentType, typesNameArray) => {
    tableTemp = [];
    currentType.fields.forEach(field => {
        let fieldType = field.type;
        let fieldIsArray = field.isArray;
        if (!typesNameArray.includes(fieldType) && field["in_model"] && isBasicType(fieldType)) {
            if (fieldType === "ID") {
                tableTemp.push({ field: "Pk_" + currentType.sqlTypeName + "_id", fieldType: "int", noNull: !field.noNull, unique: false, constraint: "SERIAL PRIMARY KEY NOT NULL", isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues });
                field.sqlType = "int";
            }
            else if (fieldType === "String") {
                tableTemp.push({ field: field.name, fieldType: "text", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues });
                field.sqlType = "text";
            }
            else if (fieldType === "Int") {
                tableTemp.push({ field: field.name, fieldType: "int", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues });
                field.sqlType = "int";
            }
            else if (fieldType === "Boolean") {
                tableTemp.push({ field: field.name, fieldType: "boolean", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues });
                field.sqlType = "boolean";
            }
            else if (fieldType === "Float") {
                tableTemp.push({ field: field.name, fieldType: "float8", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues });
                field.sqlType = "float8";
            }
            else { // handle added  foreign_keys by other types ( detected as Int)
                let fkInfo = field.foreign_key;
                tableTemp.push({ field: fkInfo.name, fieldType: fkInfo.type, noNull: fkInfo.noNull, unique: false, constraint: fkInfo.constraint, isArray: fkInfo.isArray, gqlType: fkInfo.type, noNullArrayValues: field.noNullArrayValues });
            }
        }
        else if (fieldType in scalars) {
            switch (fieldType) {
                case scalars.Date:
                    tableTemp.push({ field: field.name, fieldType: "date", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues });
                    field.sqlType = "date";
                    break;
                case scalars.Time:
                    tableTemp.push({ field: field.name, fieldType: "time", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues });
                    field.sqlType = "time";
                    break;
                case scalars.DateTime:
                    tableTemp.push({ field: field.name, fieldType: "timestamp", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues });
                    field.sqlType = "timestamp";
                    break;
                case scalars.NonPositiveInt:
                case scalars.PositiveInt:
                case scalars.NonNegativeInt:
                case scalars.NegativeInt:
                case scalars.UnsignedInt:
                    tableTemp.push({ field: field.name, fieldType: "int", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues });
                    field.sqlType = "int";
                    break;
                case scalars.NonPositiveFloat:
                case scalars.PositiveFloat:
                case scalars.NonNegativeFloat:
                case scalars.NegativeFloat:
                case scalars.UnsignedFloat:
                    tableTemp.push({ field: field.name, fieldType: "float8", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues });
                    field.sqlType = "float8";
                    break;
                case scalars.BigInt:
                case scalars.Long:
                case scalars.Port:
                    tableTemp.push({ field: field.name, fieldType: "int8", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues });
                    field.sqlType = "int8";
                    break;
                case scalars.GUID:
                    tableTemp.push({ field: field.name, fieldType: "uuid", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues });
                    field.sqlType = "uuid";
                    break;
                case scalars.IPv4:
                case scalars.IPv6:
                    tableTemp.push({ field: field.name, fieldType: "inet", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues });
                    field.sqlType = "inet";
                    break;
                case scalars.MAC:
                    tableTemp.push({ field: field.name, fieldType: "macaddr", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues });
                    field.sqlType = "macaddr";
                    break;
                case scalars.USCurrency:
                case scalars.Currency:
                    tableTemp.push({ field: field.name, fieldType: "money", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues });
                    field.sqlType = "money";
                    break;
                case scalars.JSON:
                case scalars.JSONObject:
                    tableTemp.push({ field: field.name, fieldType: "json", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues });
                    field.sqlType = "json";
                    break;
                case scalars.Byte:
                    tableTemp.push({ field: field.name, fieldType: "bytea", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues });
                    field.sqlType = "bytea";
                    break;
                case scalars.Linestring:
                case scalars.Point:
                case scalars.Polygon:
                    tableTemp.push({ field: field.name, fieldType: "geometry", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues });
                    field.sqlType = "geometry";
                    break;
                case scalars.UtcOffset:
                case scalars.EmailAddress:
                case scalars.URL:
                case scalars.PhoneNumber:
                case scalars.PostalCode:
                case scalars.HexColorCode:
                case scalars.HSL:
                case scalars.HSLA:
                case scalars.RGB:
                    tableTemp.push({ field: field.name, fieldType: "int", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues });
                    field.sqlType = "int";
                    break;
                case scalars.RGBA:
                    tableTemp.push({ field: field.name, fieldType: "text", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues });
                    field.sqlType = "text";
                    break;
                case scalars.ISBN:
                default:
                    // By default, scalar type other than the ones that have specific column type in postgres, it's up to the final user to modify the final field type in the table
                    tableTemp.push({ field: field.name, fieldType: "text", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues });
                    field.sqlType = "text";
            }
        }
        else { // handle types who are traduced into foreignkeys
            if (field.foreign_key !== null && field.in_model === true) {
                let fkInfo = field.foreign_key;
                tableTemp.push({ field: fkInfo.name, fieldType: fkInfo.type, noNull: fkInfo.noNull, unique: false, constraint: fkInfo.constraint, isArray: fkInfo.isArray, gqlType: fkInfo.type, noNullArrayValues: field.noNullArrayValues });
                field.sqlType = fkInfo.type;
            }
            // Do nothing, handled after
        }
    });
    return tableTemp;
};
module.exports = {
    getFieldCreate: getFieldCreate,
    getFieldName: getFieldName,
    isScalar: isScalar,
    isBasicType: isBasicType,
    getScalarFieldInfo: getScalarFieldInfo
};
