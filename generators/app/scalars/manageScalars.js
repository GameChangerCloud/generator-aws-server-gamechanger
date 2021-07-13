const scalars = require('./scalars')
const utils = require('../templates/database/utils')

const getFieldCreate = (type, name) => {
    let s =  null
    switch (type) {
        case "ID":
            
        case "Boolean":
        case "Int":
            s = `args.${name}`
            break
        case "String":
        case "Date":
        case "Time":
            s = `utils.escapeQuote(args.${name})`
            break
        case "DateTime":
            s = `"'" + args.${name}.toISOString() + "'"`
            break
        default:
            // Default for all defined scalars
            if (scalars[type]) s = `args.${name}`
            break;
    }
    return s
}

const getFieldName = (scalar, name, type) => {
    let s =  null
    switch (scalar) {
        case "ID":
            s = "\\\"Pk_" + utils.getSQLTableName(type) + "_id\\\""
            break;
        case "Boolean":
        case "Int":
        case "String":
        case "Date":
        case "Time":
        case "DateTime":
            s = "\\\"" + name + "\\\""
            break;
        default:
            if (scalars[scalar]) s = "\\\"" + name + "\\\""
            break;
    }
    return s
}

const isScalar = (type) =>{
    if (type in scalars || type === "String" || type === "ID" || type === "Int" || type === "Boolean" || type === "Float" ){
        return true
    }
    else{
        return false
    }
}

const isBasicType = (type) =>{
    if (type === "String" || type === "ID" || type === "Int" || type === "Boolean" || type === "Float" ){
        return true
    }
    else{
        return false
    }
}


module.exports = {
    getFieldCreate: getFieldCreate,
    getFieldName: getFieldName,
    isScalar : isScalar,
    isBasicType: isBasicType
}