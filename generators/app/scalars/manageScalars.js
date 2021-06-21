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
            break;
    }
    return s
}

const getFieldName = (type, name) => {
    let s =  null
    switch (type) {
        case "ID":
            s += "\\\"Pk_" + utils.getSQLTableName(type) + "_id\\\""
            break;
        case "Boolean":
        case "Int":
        case "String":
        case "Date":
        case "Time":
        case "DateTime":
            s += "\\\"" + name + "\\\""
            break;
        default:
            break;
    }
    return s
}


module.exports = {
    getFieldCreate: getFieldCreate,
    getFieldName: getFieldName
}