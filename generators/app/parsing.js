const matching = require('./matching')
const pluralize = require('pluralize')
const camelCase = require('camelcase');

const scalars = require('./scalars/scalars')
const manageScalars = require('./scalars/manageScalars')

const utils = require('./templates/database/utils')


// From the schema, fetch all the types object and return an array of it
const getAllTypes = (schemaJSON) => {
    let types = []
    for (const type in schemaJSON) {
        types.push(schemaJSON[type])
    }
    return types
}

// From the schema, fetch all the types name and return an array of it
const getAllTypesName = (schemaJSON) => {
    let typesName = []
    for (const typeName in schemaJSON) {
        typesName.push(typeName)
    }
    return typesName
}

// From the schema, fetch all the types name, transform it for SQL and return an array of it
const getAllSQLTypesName = (schemaJSON) => {
    let typesName = []
    for (const typeName in schemaJSON) {
        typesName.push(utils.getSQLTableName(typeName))
    }
    return typesName
}

// From a type object, get the fields and return an array of it
const getFields = (type) => {
    let fields = []
    for (let index = 0; index < type["fields"].length; index++) {
        fields.push(type["fields"][index])
    }
    return fields
}

// Get all directive names from the fields of a type object
const getFieldsDirectiveNames = (fields, typeObject) =>{
    let directiveNames = []
    if(typeObject.directives.length > 0){
        for( let index = 0 ; index < typeObject.directives.length; index++){
            directiveNames.push(typeObject.directives[index].name)
        }
    }
    
    for (let index = 0; index < fields.length ; index++){
        if(fields[index].directives.length > 0){
            for( let j = 0 ; j < fields[index].directives.length ; j++){
                directiveNames.push(fields[index].directives[j].name)
                //console.log("*********" + JSON.stringify(fields[index].directives[j]))
            }
        }
        //console.log("*********" + JSON.stringify(fields[index].directives))
    }
    return directiveNames
}


/** GRAPHQL files parsing */

// From the fields object, transform the syntax to get the right one to print on final type.js file. Return a string
const getFieldsParsed = (currentTypeName, fields, graphqlType, relations, manyToManyTables, typesName, defaultScalarsType) => {
    let result = ""
    for (let index = 0; index < fields.length; index++) {
        let field = fields[index]
        let hasArguments = field.arguments[0] ? true : false
        if (index > 0)
            result += "\t\t"
        switch (field.type) {

            case "ID":
                if (currentTypeName === "Mutation" || currentTypeName === "Query") {
                    result += buildTypeField(field, "GraphQLID", true)
                    result += "\n"
                    result += buildArgs(field.arguments, hasArguments)
                    result += "\t\t\tresolve: (obj, args, context, info) => {\n\t\t\t\t // To define \n\t\t\t}"
                    result += "\n\t\t},\n"
                }
                else {
                    result += buildTypeField(field, "GraphQLID", false)
                }
                break

            case "String":
                if (currentTypeName === "Mutation" || currentTypeName === "Query") {
                    result += buildTypeField(field, "GraphQLString", true)
                    result += "\n"
                    result += buildArgs(field.arguments, hasArguments)
                    result += "\t\t\tresolve: (obj, args, context, info) => {\n\t\t\t\t // To define \n\t\t\t}"
                    result += "\n\t\t},\n"
                }
                else {
                    result += buildTypeField(field, "GraphQLString", false)
                }
                break

            case "Int":
                if (currentTypeName === "Mutation" || currentTypeName === "Query") {
                    result += buildTypeField(field, "GraphQLInt", true)
                    result += "\n"
                    result += buildArgs(field.arguments, hasArguments)
                    result += "\t\t\tresolve: (obj, args, context, info) => {\n\t\t\t\t // To define \n\t\t\t}"
                    result += "\n\t\t},\n"
                }
                else {
                    result += buildTypeField(field, "GraphQLInt", false)
                }
                break

            case "Boolean":
                if (currentTypeName === "Mutation" || currentTypeName === "Query") {
                    result += buildTypeField(field, "GraphQLBoolean", true)
                    result += "\n"
                    result += buildArgs(field.arguments, hasArguments)
                    result += "\t\t\tresolve: (obj, args, context, info) => {\n\t\t\t\t // To define \n\t\t\t}"
                    result += "\n\t\t},\n"
                }
                else {
                    result += buildTypeField(field, "GraphQLBoolean", false)
                }
                break

            // Not classic scalar type
            default:
                if (currentTypeName === "Query") {
                    // If query, we do not accept reserved field query (e.g <entity> or <entities>)
                    if (isValidFieldQuery(field.name, typesName)) {
                        if (field.type === "String" || field.type === "Int" || field.type === "Boolean" || field.type === "ID" || defaultScalarsType.includes(field.type))
                            result += buildTypeField(field, field.type, true)
                        else
                            result += buildTypeField(field, field.type + "Type", true)
                        result += "\n"
                        result += buildArgs(field.arguments, hasArguments)
                        result += "\t\t\tresolve: (obj, args, context, info) => {\n\t\t\t\t // To define \n\t\t\t}"
                        result += "\n\t\t},\n"
                    }
                }
                else if (currentTypeName === "Mutation") {
                    if (isValidFieldMutation(field.name, typesName)) {
                        if (field.type === "String" || field.type === "Int" || field.type === "Boolean" || field.type === "ID" || defaultScalarsType.includes(field.type))
                            result += buildTypeField(field, field.type, true)
                        else
                            result += buildTypeField(field, field.type + "Type", true)
                        result += "\n"
                        result += buildArgs(field.arguments, hasArguments)
                        result += "\t\t\tresolve: (obj, args, context, info) => {\n\t\t\t\t // To define \n\t\t\t}"
                        result += "\n\t\t},\n"
                    }
                }
                else {
                    if (defaultScalarsType.includes(field.type)) {
                        result += buildTypeField(field, field.type, true)
                        result += "\n"
                        result += buildResolver(field)
                        result += "\n\t\t},\n"
                    }
                    else {
                        // If it's an interface, different based resolver
                        if (graphqlType === "InterfaceTypeDefinition") {
                            result += buildResolverInterface()
                        }
                        else {
                            result += buildTypeField(field, field.type + "Type", true)
                            result += "\n"
                            result += buildArgs(field.arguments, hasArguments)

                            // get the relation
                            let relationsBetween = getRelationBetween(field.type, currentTypeName, relations)
                            if (relationsBetween === "manyToMany") {
                                let manyToManyTable = getManyToManyTableBetween(currentTypeName, field.type, manyToManyTables)

                                result += buildResolver(field, hasArguments, currentTypeName, relationsBetween, manyToManyTable)
                            }
                            else {
                                result += buildResolver(field, hasArguments, currentTypeName, relationsBetween, null)
                            }

                        }
                        result += "\n\t\t},\n"
                    }
                }
        }
    }
    return result
}

const getFieldsInput = (fields) => {
    let result = ""
    for (let index = 0; index < fields.length; index++) {
        let field = fields[index]
        let hasArguments = field.arguments[0] ? true : false
        if (index > 0)
            result += "\t\t"
        switch (field.type) {

            case "ID":
                result += buildTypeField(field, "GraphQLID", false)
                break

            case "String":
                result += buildTypeField(field, "GraphQLString", false)
                break

            case "Int":
                result += buildTypeField(field, "GraphQLInt", false)
                break

            case "Boolean":
                result += buildTypeField(field, "GraphQLBoolean", false)
                break

            // Not classic scalar type
            default:
                if (field.isArray) {
                    result += buildTypeField(field, field.type + "UpdateInput", false)
                }
                else {
                    result += field.name + ": { type: GraphQLID },\n"
                }
        }
    }
    return result


}

const isValidFieldQuery = (fieldName, typesName) => {
    let res = true
    typesName.map(typeName => {
        if (fieldName === typeName || fieldName === pluralize.plural(typeName) || fieldName === typeName.toLowerCase() || fieldName === pluralize.plural(typeName.toLowerCase())) {
            res = false
        }
    })
    return res
}

const isValidFieldMutation = (fieldName, typesName) => {
    let res = true
    typesName.map(typeName => {
        if (fieldName === typeName + "Create" || fieldName === typeName + "Update" || fieldName === typeName + "Delete") {
            res = false
        }
    })
    return res
}

// Construct the types, return a string
const buildTypeField = (field, type, needResolved) => {
    let result = needResolved ? field.name + ": { \n\t\t\ttype: " : field.name + ": { type: "
    let parentheses = ""
    if (field.isArray) {
        if (field.noNull) {
            result += "new GraphQLNonNull("
            parentheses += ")"
        }
        result += "new GraphQLList("
        parentheses += ")"
        if (field.noNullArrayValues) {
            result += "new GraphQLNonNull("
            parentheses += ")"
        }
        result += type
    }
    else {
        if (field.noNull) {
            result += "new GraphQLNonNull("
            parentheses += ")"
        }
        result += type
    }

    result += needResolved ? parentheses + "," : parentheses + " },\n"
    return result
}

// Construct the arguments, return a string
const buildArgs = (arguments, hasArguments) => {
    let result = ""
    if (hasArguments) {
        result += "\t\t\targs: {\n"
        arguments.forEach(argument => {
            result += "\t\t\t\t"
            switch (argument.type) {
                case "ID":
                    result += buildTypeField(argument, "GraphQLID")
                    break
                case "String":
                    result += buildTypeField(argument, "GraphQLString")
                    break
                case "Int":
                    result += buildTypeField(argument, "GraphQLInt")
                    break
                default:
                    result += buildTypeField(argument, argument.type + "Type")
                    break
            }
            // result += ",\n"
        })
        result += "\t\t\t},\n"
    }
    return result
}

// Construct the resolver based on the type field, return a string
const buildResolver = (field, hasArguments = false, currentTypeName, relationType = null, manyToManyTable = null, scalarTypeNames = []) => {
    let result = ""
    if (hasArguments) {
        result += "\t\t\tresolve: (obj, args, context, info) => {\n\t\t\t\treturn dbHandler.handleGet(args, '" + field.type + "Type')\n\t\t\t}"
    }
    else {
        if (currentTypeName !== "Query") {
            if (manyToManyTable != null) {
                result += "\t\t\tresolve: (obj, args, context, info) => {\n\t\t\t\treturn dbHandler.handleGet({parentId: obj.id, parentTypeName: info.parentType, relationType: \"" + relationType + "\", tableJunction: \"" + manyToManyTable.sqlname + "\"}, '" + field.type + "Type')\n\t\t\t}"
            }
            else {
                if (!relationType) {
                    // TODO check if other scalar type need casting from being fetch from postgres table
                    if (field.type === "DateTime" || field.type === "Date" || field.type === "Date") {
                        result += "\t\t\tresolve: (obj, args, context, info) => {\n\t\t\t\treturn new Date(obj." + field.name + ")\n\t\t\t}" // Cast into a Date object
                    }
                }


                else {
                    result += "\t\t\tresolve: (obj, args, context, info) => {\n\t\t\t\tlet result = dbHandler.handleGet({parentId: obj.id, parentTypeName: info.parentType, relationType: \"" + relationType + "\"}, '" + field.type + "Type').then((data) => {\n\t\t\t\treturn data\n\t\t\t})\n\t\t\treturn result\n\t\t\t}"
                }
            }
        }
        else {
            result += "\t\t\tresolve: (obj, args, context, info) => {\n\t\t\t\treturn dbHandler.handleGet(null, '" + field.type + "Type')\n\t\t\t}"
        }
    }
    return result
}

// Construct the resolver for interface
const buildResolverInterface = () => {
    let result = ""
    result += "\t\t\tresolve: (obj, args, context) => {\n\t\t\t\treturn resolveType(args)\n\t\t\t}"
    return result
}

// Get all the types required, except the current one, to import in file
const getRequireTypes = (fields, currentType, defaultScalars) => {
    let result = []
    for (let index = 0; index < fields.length; index++) {
        let type = fields[index].type
        if (type !== currentType) {
            if (type !== "String" && type !== "ID" && type !== "Int" && type != "Boolean") {
                // If it's a predefined scalars no need to include it
                if (!defaultScalars.includes(type)) {
                    //Check if it's not already included (multiple type call in Query)
                    if (!result.includes(type))
                        result.push(type)
                }
            }
        }
        // Checking internal argument (for the query mainly if there's enum in place)
        fields[index].arguments.forEach(argument => {
            if (argument.type !== currentType) {
                if (argument.type !== "String" && argument.type !== "ID" && argument.type !== "Int" && argument.type != "Boolean") {
                    //Check if it's not already included (multiple type call in Query)
                    if (!result.includes(argument.type))
                        result.push(argument.type)
                }
            }
        })
    }
    return result
}

// Build the require const type string
const getRequire = (fields, currentType, defaultScalars) => {
    const requiredTypes = getRequireTypes(fields, currentType, defaultScalars)
    let result = ""
    for (let index = 0; index < requiredTypes.length; index++) {
        if (!defaultScalars.includes(requiredTypes[index])) {
            result += "const " + requiredTypes[index] + "Type = require('./" + requiredTypes[index].toLowerCase() + "')\n"
            // result += "const " + requiredTypes[index] + "UpdateInput = require('./" + requiredTypes[index].toLowerCase() + "UpdateInput')\n"
        }
    }
    return result
}

// Handle the different graphql type and return the correct one
const getGraphqlType = (type) => {
    switch (type.type) {
        case "EnumTypeDefinition":
            return "GraphQLEnumType"
        case "InterfaceTypeDefinition":
            return "GraphQLInterfaceType"
        case "ObjectTypeDefinition":
            return "GraphQLObjectType"
        case "ScalarTypeDefinition":
            return "GraphQLScalarType"
    }
}

const getResolveType = (type, currentTypeName) => {
    let result = ""
    let implementedTypes = type.implementedTypes

    implementedTypes.forEach(implementedType => {
        result += "\t\t\tcase \"" + implementedType + "\":\n"
        result += "\t\t\t\treturn " + implementedType + "Type\n"
    });
    result += "\t\t\tdefault: \n\t\t\t\treturn " + currentTypeName + "Type"

    return result
}

const getEnumValues = (currentType) => {
    let result = ""
    let integerValue = 0
    currentType.values.forEach(value => {
        result += value + ": {\n\tvalue: " + integerValue + "\n},"
        integerValue++
    })
    return result
}

/** TYPE HANDLER */

const getFieldsParsedHandler = (currentTypeName, fields, isOneToOneChild, parent) => {
    let result = ""
    for (let index = 0; index < fields.length; index++) {
        if (fields[index].name === "id") {
            if (!isOneToOneChild)
                result += "\t\t\t" + fields[index].name + ": data.Pk_" + currentTypeName + "_id"
            else
                result += "\t\t\t" + fields[index].name + ": data.Pk_" + parent + "_id"
        }
        else {
            result += "\t\t\t" + fields[index].name + ": data." + fields[index].name
        }
        if (index < fields.length - 1)
            result += ","
        result += "\n"
    }
    return result
}



const getFieldsCreate = (currentTypeName, fields, relations, manyToManyTables) => {
    let sqlFields = []
    // Deal with scalar first (removing any Array)
    fields.filter(field => !field.isArray).forEach(field => {
        let sqlField = manageScalars.getFieldCreate(field.type,field.name)
        if (sqlField) sqlFields.push(sqlField);
    })
    // Deal with oneOnly relationship
    relations.oneOnly.forEach(relation => {
        fields.filter(field1 => field1.type == relation[0]).forEach(field2 => {
            sqlFields.push(`args.${field2.name}`);
        })
    })
    return sqlFields.filter(field => !field.includes("args.id")).join(` + "," + `);
}

const getFieldsName = (tables,fields, currentTypeName, currentSQLTypeName, relations) => {
    let sqlNames = []
    // Deal with scalar first (removing any Array)
    fields.filter(field => !field.isArray).forEach(field => {
        let sqlName = manageScalars.getFieldName(field.type,field.name, currentTypeName)
        if (sqlName) sqlNames.push(sqlName);
    })
    // Deal with oneOnly relationship
    relations.oneOnly.forEach(relation => {
        fields.filter(field1 => field1.type == relation[0]).forEach(field2 => {
            sqlNames.push("\\\"Fk_" + utils.getSQLTableName(field2.type) + "_id\\\"");
        })
    })
    return sqlNames.filter(field => !field.includes("\"Pk_")).join(",");
}

const getDeleteMethodsMany = (currentTypeName, fields, relations, manyToManyTables) => {
    let s = ''
    fields.forEach(field => {
        if (field.type !== "ID" && field.type !== "String" && field.type !== "Int" && field.type !== "Boolean") {
            if (isManyToMany(currentTypeName, field.type, relations.manyToMany)) {
                s += '// Type ' + field.type + '\n'
                let manyToManyTable = getManyToManyTableBetween(currentTypeName, field.type, manyToManyTables).name
                s += 'sqlParams.sql = \"SELECT * FROM \\\"' + field.type + '\\\" INNER JOIN \\\"' + manyToManyTable + '\\\" ON \\\"Pk_' + field.type + '_id\\\" = \\\"' + manyToManyTable + '\\\".\\\"' + field.type + '_id\\\" INNER JOIN \\\"' + currentTypeName + '\\\" ON \\\"Pk_' + currentTypeName + '_id\\\" = \\\"' + manyToManyTable + '\\\".\\\"' + currentTypeName + '_id\\\" WHERE \\\"Pk_' + currentTypeName + '_id\\\" = " + id\n'
                s += 'rdsDataService.executeStatement(sqlParams, (err, data) => {\n'
                s += 'if (err) { console.log(err, err.stack) }\n'
                s += `else {
                 			let current` + field.type + `State = utils.constructOutputArray(data, "` + field.type + `")
                 			let removedElements` + field.type + ` = utils.getRemovedElements(current` + field.type + `State, [])
                 			for (let index = 0; index < removedElements` + field.type + `.length; index++) {
                 				sqlParams.sql = "DELETE FROM \\\"`+ manyToManyTable + `\\\" WHERE \\\"` + field.type + `_id\\\" = " + removedElements` + field.type + `[index] + " AND \\\"` + currentTypeName + `_id\\\" = " + id
                 				rdsDataService.executeStatement(sqlParams, (err, data) => {
                 					if (err) console.log(err, err.stack);
                 					else console.log(data);
                 				})
                 			}
                         }\n`
                s += '})\n\n'
            }
        }
    })

    return s
}




/** DATABASE (tables, init, fill, drop) */

// Tables
// Get all the tables, with columns, based on the types we have
const getAllTables = (types, typesName, relations, scalarTypeNames, sqlTypesName) => {
    let allTables = []
    for (let index = 0; index < types.length; index++) {

        let currentTypeName = typesName[index]
        let currentSQLTypeName = sqlTypesName[index]
        let currentType = types[index]
        // Will hold the currentType table infos
        let tableTemp = []

        // Fill up the infos on scalar field (int, string, etc.)
        if (currentTypeName !== "Query" && currentTypeName !== "Mutation" && !scalarTypeNames.includes(currentTypeName)) {
            currentType.fields.forEach(field => {
                let fieldType = field.type
                let fieldIsArray = field.isArray
                
                if (!typesName.includes(fieldType)) {
                    if (fieldType === "ID") {
                        tableTemp.push({ field: "Pk_" + currentSQLTypeName + "_id", fieldType: "Int", noNull: !field.noNull, unique: false, constraint: "PRIMARY KEY NOT NULL", isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues})
                    }
                    else if (fieldType === "String") {
                        tableTemp.push({ field: field.name, fieldType: "text", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues })
                    }
                    else {
                        tableTemp.push({ field: field.name, fieldType: fieldType, noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues })
                    }
                }

                else if (scalarTypeNames.includes(fieldType)) {
                    switch (fieldType) {
                        case scalars.Date:
                            tableTemp.push({ field: field.name, fieldType: "date", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues })
                            break
                        case scalars.Time:
                            tableTemp.push({ field: field.name, fieldType: "time", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues })
                            break
                        case scalars.DateTime:
                            tableTemp.push({ field: field.name, fieldType: "timestamp", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues })
                            break
                        case scalars.NonPositiveInt:
                        case scalars.PositiveInt:
                        case scalars.NonNegativeInt:
                        case scalars.NegativeInt:
                        case scalars.UnsignedInt:
                            tableTemp.push({ field: field.name, fieldType: "int", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues })
                            break
                        case scalars.NonPositiveFloat:
                        case scalars.PositiveFloat:
                        case scalars.NonNegativeFloat:
                        case scalars.NegativeFloat:
                        case scalars.UnsignedFloat:
                            tableTemp.push({ field: field.name, fieldType: "float8", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues })
                            break
                        case scalars.BigInt:
                        case scalars.Long:
                        case scalars.Port:
                            tableTemp.push({ field: field.name, fieldType: "int8", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues })
                            break

                        case scalars.GUID:
                            tableTemp.push({ field: field.name, fieldType: "uuid", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues })
                            break
                        case scalars.IPv4:
                        case scalars.IPv6:
                            tableTemp.push({ field: field.name, fieldType: "inet", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues })
                            break
                        case scalars.MAC:
                            tableTemp.push({ field: field.name, fieldType: "macaddr", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues })
                            break
                        case scalars.USCurrency:
                        case scalars.Currency:
                            tableTemp.push({ field: field.name, fieldType: "money", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues })
                            break
                        case scalars.JSON:
                        case scalars.JSONObject:
                            tableTemp.push({ field: field.name, fieldType: "json", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues })
                            break
                        case scalars.Byte:
                            tableTemp.push({ field: field.name, fieldType: "bytea", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues })
                            break
                        case scalars.Linestring:
                        case scalars.Point:
                        case scalars.Polygon:
                            tableTemp.push({ field: field.name, fieldType: "geometry", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues })
                            break
                        case scalars.UtcOffset:
                        case scalars.EmailAddress:
                        case scalars.URL:
                        case scalars.PhoneNumber:
                        case scalars.PostalCode:
                        case scalars.HexColorCode:
                        case scalars.HSL:
                        case scalars.HSLA:
                        case scalars.RGB:
                        case scalars.RGBA:
                        case scalars.ISBN:
                        default:
                            // By default, scalar type other than the ones that have specific column type in postgres, it's up to the final user to modify the final field type in the table
                            tableTemp.push({ field: field.name, fieldType: "text", noNull: field.noNull, unique: false, constraint: null, isArray: fieldIsArray, gqlType: fieldType, noNull: field.noNull, noNullArrayValues: field.noNullArrayValues })
                    }
                }
                else {
                    // Do nothing, handled after
                }
            })

            // Then, we check relations between the current type table with all the types to add the correct foreigns key and references
            typesName.forEach((typeTable,index) => {
                let sqltypeTable = utils.getSQLTableName(typeTable);
                if (!scalarTypeNames.includes(typeTable)) {
                    let fieldChild
                    let relationType = getRelationBetween(currentTypeName, typeTable, relations)
                    switch (relationType) {
                        case "oneOnly":
                            // Only if the current type DOES HAVE the field type
                            if (hasFieldType(currentType, typeTable).answers) {
                                fieldChild = (hasFieldType(currentType, typeTable).fieldInfo)
                                tableTemp.push({ field: "Fk_" + sqltypeTable + "_id", fieldType: "Int", noNull: fieldChild.noNull, unique: false, constraint: "FOREIGN KEY (\"Fk_" + sqltypeTable + "_id\") REFERENCES \"" + sqlTypesName[index] + "\" (\"Pk_" + sqltypeTable + "_id\")" })
                            }
                            break

                        case "manyOnly":
                            // Only if the current type DOES NOT have the field type
                            if (!hasFieldType(currentType, typeTable).answers) {
                                // We create a column reference that can hold id of element from the fieldType, but without constraint since it's just informative
                                tableTemp.push({ field: "Fk_" + sqltypeTable + "_id", fieldType: "Int", noNull: false, unique: false, constraint: "FOREIGN KEY (\"Fk_" + sqltypeTable + "_id\") REFERENCES \"" + sqlTypesName[index] + "\" (\"Pk_" + sqltypeTable + "_id\")" })
                            }
                            break

                        case "oneToMany":
                            // Nothing, since the Fk will be placed on the other linked table
                            break

                        case "manyToOne":
                            fieldChild = (hasFieldType(currentType, typeTable).fieldInfo)
                            tableTemp.push({ field: "Fk_" + sqltypeTable + "_id", fieldType: "Int", noNull: fieldChild.noNull, unique: false, constraint: "FOREIGN KEY (\"Fk_" + sqltypeTable + "_id\") REFERENCES \"" + sqlTypesName[index] + "\" (\"Pk_" + sqltypeTable + "_id\")" })
                            break

                        case "manyToMany":
                            // Nothing, since the junction tables will hold the id necessary
                            break

                        case "oneToOneParent":
                            fieldChild = (hasFieldType(currentType, typeTable).fieldInfo)
                            if (fieldChild.noNull) {
                                tableTemp.push({ field: "Fk_" + sqltypeTable + "_id", fieldType: "Int", noNull: fieldChild.noNull, unique: true, constraint: "FOREIGN KEY (\"Fk_" + sqltypeTable + "_id\") REFERENCES \"" + sqlTypesName[index] + "\" (\"Pk_" + sqltypeTable + "_id\")" })
                            }
                            else {
                                // Nothing, it's unidirectionnal and the constraint is on the child
                            }
                            break

                        case "oneToOneChild":
                            fieldChild = (hasFieldType(currentType, typeTable).fieldInfo)
                            tableTemp.push({ field: "Fk_" + sqltypeTable + "_id", fieldType: "Int", noNull: true, unique: true, constraint: "FOREIGN KEY (\"Fk_" + sqltypeTable + "_id\") REFERENCES \"" + sqlTypesName[index] + "\" (\"Pk_" + sqltypeTable + "_id\")" })

                        case "selfJoinOne":
                            // Check field with the same type
                            const fields = getFields(currentType)
                            fields.forEach(field => {
                                // If it's the field, we add the key
                                if (field.type === currentTypeName) {
                                    // Adding a foreign key with the graphql field name
                                    tableTemp.push({ field: field.name + "_id", fieldType: "Int", noNull: field.noNull, unique: true, constraint: "FOREIGN KEY (\"" + field.name + "_id\") REFERENCES \"" + sqlTypesName[index] + "\" (\"Pk_" + sqltypeTable + "_id\")" })
                                }
                            })
                        default:
                            // No relation
                            break
                    }
                }
            })
            allTables.push({ name: currentTypeName, sqlname: currentSQLTypeName, columns: tableTemp, isJoinTable: false })
        }
    }
    return allTables
}



const getInitEachModelsJS = (tables) => {
    let s = '';
    tables.forEach(table => {
        s += 'init' + table.name + '()\n'
    })
    return s;
}

const getInitEachModelsFields = (types, typename) => {
    let s = '';
    for (let index = 0; index < types.length; index++) {
        if (typename[index] !== "Query" && typename[index] !== "Mutation") {
            let nameList = typename[index].toLowerCase()
            s += 'for(let i = 0; i < ' + nameList + 'Tab.length; i++){\n\t' +
                nameList + 'Tab[i] = update' + typename[index] + '(' + nameList + 'Tab[i]);\n}';
        }
    }

    return s;
}

const getInitEachFieldsModelsJS = (types, typename) => {
    let s = '';
    s += getInitEachModelsFields(types, typename);
    s += '\n\n'
    return s;
}

const getInitQueriesInsert = (tables) => {
    let s = ''
    tables.forEach(table => {
        s += table.name.toLowerCase() + 'Tab.forEach(item => {\n'
        s += '\tlet temp = `INSERT INTO "' + table.sqlname + '"('
        for (let index = 0; index < table.columns.length; index++) {
            s += '"' + table.columns[index].field + '"'
            if (index < table.columns.length - 1) {
                s += ', '
            }
        }
        s += ') '
        s += 'VALUES ('
        for (let index = 0; index < table.columns.length; index++) {
            let correctField = ''
            if (table.columns[index].fieldType === 'Int') {
                if (table.columns[index].field.includes("Fk")) {
                    // Triming the Fk_ / Pk_ and _id prefix and suffix
                    correctField = table.columns[index].field.slice(3, (table.columns[index].field.length - 3))
                    s += '`+item.' + correctField.toLowerCase() + '+`'
                }
                else if (table.columns[index].field.includes("Pk")) {
                    s += '`+item.id+`'
                }
                else {
                    s += '`+item.' + table.columns[index].field.toLowerCase() + '+`'
                }
            }
            else {
                s += '\'`+item.' + table.columns[index].field.toLowerCase() + '+`\''
            }

            if (index < table.columns.length - 1) {
                s += ', '
            }
        }
        s += ')`\n'
        s += '\tqueriesInsert.push(temp)\n'
        s += '})\n'
    })


    return s

}



const formatTime = (date) => {
    var d = new Date(date),
        hours = '' + (d.getHours() + 1),
        minutes = '' + d.getMinutes(),
        seconds = '' + d.getSeconds();
    if (hours.length < 2)
        hours = '0' + hours
    if (minutes.length < 2)
        minutes = '0' + minutes
    if (seconds.length < 2)
        seconds = '0' + seconds
    return [hours, minutes, seconds].join(':');
}

const formatDate = (date) => {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}




// Models

const getParameters = (typesName, sqltypesName, currentType, currentTypeName, fields, relations, scalarTypeNames) => {
    let result = ""
    for (let index = 0; index < fields.length; index++) {

        // Parameters explicit 
        switch (fields[index].type) {
            case "String":
            case "ID":
            case "Boolean":
            case "Int":
                if (index > 0) {
                    result += ", "
                }
                result += fields[index].name.toLowerCase()
                break;
            default:
                if (scalarTypeNames.includes(fields[index].type)) {
                    if (index > 0) {
                        result += ", "
                    }
                    result += fields[index].name.toLowerCase()
                    break
                }
        }
    }
    // Parameters implicit
    // Then, we check relations between the current type table with all the types
    for (let index = 0; index < typesName.length; index++) {
        let relationType = getRelationBetween(currentTypeName, typesName[index], relations)
        switch (relationType) {
            case "manyOnly":
                // Only if the current type DOES NOT have the field type
                if (!hasFieldType(currentType, typesName[index]).answers) {
                    result += ", "
                    result += sqltypesName[index] + ""
                }
                break

            case "oneOnly":
                // Only if the current type DOES have the field type
                if (hasFieldType(currentType, typesName[index]).answers) {
                    result += ", "
                    result += sqltypesName[index] + ""
                }
                break

            case "manyToOne":
                result += ", "
                result += sqltypesName[index] + ""
                break

            case "manyToMany":
                // if self join many
                if (currentTypeName === typesName[index]) {
                    const fieldsCurrentType = getFields(currentType)
                    fieldsCurrentType.forEach(field => {
                        // If it's the field, we add the key
                        if (field.type === currentTypeName) {
                            result += ", "
                            result += field.name.toLowerCase()
                        }
                    })
                }
                else {
                    result += ", "
                    result += sqltypesName[index] + ""
                }
                break

            case "oneToOneParent":
                let fieldChild = hasFieldType(currentType, typesName[index]).fieldInfo
                if (fieldChild.noNull) {
                    result += ", "
                    result += sqltypesName[index] + ""
                }
                break

            case "oneToOneChild":
                result += ", "
                result += sqltypesName[index] + ""
                break

            case "selfJoinOne":
                // Check field with the same type
                const fieldsCurrentType = getFields(currentType)
                fieldsCurrentType.forEach(field => {
                    // If it's the field, we add the key
                    if (field.type === currentTypeName) {
                        result += ", "
                        result += field.name.toLowerCase() + "_id"
                    }
                })
                break
            default: // No relation
                break
        }
    }
    return result
}

const getBodyOfConstructor = (typesName, sqltypesName, currentType, currentTypeName, fields, relations) => {
    let result = ""
    let defaultScalars = []
    for (const value in scalars) {
        defaultScalars.push(scalars[value])
    }
    for (let index = 0; index < fields.length; index++) {
        switch (fields[index].type) {
            case "String":
            case "ID":
            case "Boolean":
            case "Int":
                result += "\t\t\tthis." + fields[index].name.toLowerCase() + " = " + fields[index].name.toLowerCase() + ";\n"
                break;

            default:
                if (defaultScalars.includes(fields[index].type)) {
                    result += "\t\t\tthis." + fields[index].name.toLowerCase() + " = " + fields[index].name.toLowerCase() + ";\n"
                }
                break;
        }
    }
    // Parameters implicit
    // Then, we check relations between the current type table with all the types
    for (let index = 0; index < typesName.length; index++) {
        let relationType = getRelationBetween(currentTypeName, typesName[index], relations)
        switch (relationType) {
            case "manyOnly":
                // Only if the current type DOES NOT have the field type
                if (!hasFieldType(currentType, typesName[index]).answers) {
                    result += "\t\t\tthis." + sqltypesName[index].toLowerCase() + " = " + sqltypesName[index].toLowerCase() + ";\n"
                }
                break
            case "oneOnly":
                // Only if the current type DOES have the field type
                if (hasFieldType(currentType, typesName[index]).answers) {
                    result += "\t\t\tthis." + sqltypesName[index].toLowerCase() + " = " + sqltypesName[index].toLowerCase() + ";\n"
                }
                break

            case "manyToOne":
                result += "\t\t\tthis." + sqltypesName[index].toLowerCase() + " = " + sqltypesName[index].toLowerCase() + ";\n"

                break

            case "manyToMany":
                // if self join many
                if (currentTypeName === typesName[index]) {
                    const fields = getFields(currentType)
                    fields.forEach(field => {
                        // If it's the field, we add the key
                        if (field.type === currentTypeName) {
                            result += "\t\t\tthis." + field.name.toLowerCase() + " = " + field.name.toLowerCase() + ";\n"
                        }
                    })
                }
                else {
                    result += "\t\t\tthis." + sqltypesName[index].toLowerCase() + " = " + sqltypesName[index].toLowerCase() + ";\n"
                }
                break

            case "oneToOneParent":
                let fieldChild = hasFieldType(currentType, typesName[index]).fieldInfo
                if (fieldChild.noNull) {
                    result += "\t\t\tthis." + sqltypesName[index].toLowerCase() + " = " + sqltypesName[index].toLowerCase() + ";\n"
                }

                break

            case "oneToOneChild":
                result += "\t\t\tthis." + sqltypesName[index].toLowerCase() + " = " + sqltypesName[index].toLowerCase() + ";\n"
                break


            case "selfJoinOne":
                // Check field with the same type
                const fields = getFields(currentType)
                fields.forEach(field => {
                    // If it's the field, we add the key
                    if (field.type === currentTypeName) {
                        result += "\t\t\tthis." + field.name.toLowerCase() + "_id = " + field.name.toLowerCase() + "_id;\n"
                    }
                })
                break
            default: // No relation
                break
        }
    }

    return result
}

const getCreationOfModels = (types, typesName, sqltypesName, relations, scalarTypeNames) => {
    let s = '';
    for (let index = 0; index < types.length; index++) {
        if (typesName[index] !== "Query" && typesName[index] !== "Mutation" && types[index].type !== "ScalarTypeDefinition") {
            let fields = getFields(types[index])
            s += 'class ' + typesName[index] + ' {\n\tconstructor(' + getParameters(typesName, sqltypesName, types[index], typesName[index], fields, relations, scalarTypeNames) + '){\n';
            s += getBodyOfConstructor(typesName, sqltypesName, types[index], typesName[index], fields, relations);
            s += '\t}\n}\n\n'
        }
    }
    return s;
}

const getListOfModelsExport = (typename, types) => {
    let s = '';
    for (let index = 0; index < typename.length; index++) {
        if (typename[index] !== "Query" && typename[index] !== "Mutation" && types[index].type !== "ScalarTypeDefinition") {
            s += typename[index] + ' : ' + typename[index] + ',\n\t'
        }
    }
    s.substring(0, s.length - 3);
    return s;
}

/** RELATIONS HANDLER */

const getExternalFields = (fields) => {
    let lst = [];
    for (let index = 0; index < fields.length; index++) {
        if (fields[index].type != "String"
            && fields[index].type != "ID"
            && fields[index].type != "Int"
            && fields[index].type != "Boolean") {
            lst.push(fields[index])
        }
    }
    return lst;

}
/**
 * 
 * @param {*} fields Fields of the targeted object
 * @param {*} currentType Type being inspected
 * @returns 2 if relationship is [Type], 1 if relationship is Type, 0 if no relationship
 * @description Doesn't work if there is several time the same type referenced in the fileds !
 */
const getManyOrOne = (fields, currentType) => {
    for (let index = 0; index < fields.length; index++) {
        if (fields[index].type == currentType) {
            if (fields[index].isArray) {
                return 2;
            }
            return 1;
        }
    }
    return 0;
}
/**
 * 
 * @param {*} element : Target type for the relation
 * @param {*} types : Types defined in the schema
 * @param {*} typenames : Typenames defined in the schema
 * @param {*} currentType : Current Type being processed
 * @returns : 2 if relationship is [Type], 1 if relationship is Type, 0 if no relationship
 */
const getRelationOf = (element, types, typenames, currentType) => {
    for (let index = 0; index < types.length; index++) {
        if (typenames[index] == element) {
            let fields = getFields(types[index]);
            return getManyOrOne(fields, currentType)
        }
    }
    return 0;

}

const uniqBy = (a, key) => {
    let seen = {};
    return a.filter(function (item) {
        let k = key(item);
        return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    })
}

const filter = (lst) => {
    for (let i = 0; i < lst.length; i++) {
        lst[i].sort()
    }
    return uniqBy(lst, JSON.stringify)
}

/**
 *  Compute relationships oneToMany, manyToMany, etc..
 * @param {*} types contains all types with associated attributes read from easygraphql-parser
 * @param {*} typenames names assocoated with each type
 * @param {*} scalarTypeNames scalar type name if type is one of them
 * @returns 
 */
const getRelations = (types, typenames, scalarTypeNames) => {
    let manyToOne = []
    let manyToMany = []
    let oneToOne = []
    let oneToMany = []
    let selfJoinOne = []
    let selfJoinMany = []

    // Only one "constraint" on one side
    let oneOnly = [];
    let manyOnly = [];

    let relations = []
    for (let index = 0; index < types.length; index++) {
        if (typenames[index] != "Query" && typenames[index] != "Mutation") {
            let fields = getFields(types[index])
            let lst = getExternalFields(fields)

            for (let i = 0; i < lst.length; i++) {
                // Check if it's not a scalar type
                if (!scalarTypeNames.includes(lst[i].type)) {
                    let out = getRelationOf(lst[i].type, types, typenames, typenames[index])
                    let inn = getRelationOf(typenames[index], types, typenames, lst[i].type)
                    if (out == 2 && inn == 2) {
                        // Checking if self join (type related to itself)
                        if (lst[i].type === typenames[index]) {
                            selfJoinMany.push([lst[i].type, typenames[index]])
                        }
                        else {
                            manyToMany.push([lst[i].type, typenames[index]])
                        }
                    }
                    else if (out == 2 && inn == 1) {
                        oneToMany.push([lst[i].type, typenames[index]])
                    }
                    else if (out == 1 && inn == 2) {
                        manyToOne.push([lst[i].type, typenames[index]])
                    }
                    else if (out == 1 && inn == 1) {

                        // Checking if self join (type related to itself)
                        if (lst[i].type === typenames[index]) {
                            if (!isSelfJoinOne(lst[i].type, selfJoinOne)) {
                                selfJoinOne.push([lst[i].type, typenames[index]])
                            }
                        }
                        else {
                            if (!isOneToOne(lst[i].type, typenames[index], oneToOne).answers) {
                                oneToOne.push([lst[i].type, typenames[index]])
                            }
                        }
                    }

                    // One only
                    else if (out == 0 && inn == 1) {
                        oneOnly.push([lst[i].type, typenames[index]])
                    }
                    else if (out == 1 && inn == 0) {
                        oneOnly.push([lst[i].type, typenames[index]])
                    }

                    // ManyOnly
                    else if (out == 0 && inn == 2) {
                        manyOnly.push([lst[i].type, typenames[index]])
                    }
                    else if (out == 2 && inn == 0) {
                        manyOnly.push([lst[i].type, typenames[index]])
                    }
                    types[index].fields = types[index].fields.filter((e)=> e !== lst[i])
                }

            }
        }
    }

    manyToMany = filter(manyToMany)
    relations.push(oneToOne, manyToMany, oneToMany, manyToOne, oneOnly)

    return {
        oneToOne: oneToOne,
        manyToMany: manyToMany,
        oneToMany: oneToMany,
        manyToOne: manyToOne,
        oneOnly: oneOnly,
        manyOnly: manyOnly,
        selfJoinOne: selfJoinOne,
        selfJoinMany: selfJoinMany
    }

}

const isManyToMany = (typeOne, typeTwo, manyToMany) => {
    let answers = false
    manyToMany.forEach(relation => {
        if (typeOne === typeTwo) {
            if (relation[0] === typeOne && relation[1] === typeTwo) {
                answers = true
            }
        }
        else {
            if (relation.includes(typeOne) && relation.includes(typeTwo))
                answers = true
        }
    })
    return answers
}

const isOneToMany = (typeOne, typeTwo, oneToMany) => {
    let answers = false
    oneToMany.forEach(relation => {
        if (relation[0] === typeOne && relation[1] === typeTwo) {
            answers = true
        }
    })
    return answers
}

const isManyToOne = (typeOne, typeTwo, manyToOne) => {
    let answers = false
    manyToOne.forEach(relation => {
        if (relation[0] === typeOne && relation[1] === typeTwo) {
            answers = true
        }
    })
    return answers
}

const isOneToOne = (typeOne, typeTwo, oneToOne) => {
    let answers = false
    let parent = typeTwo
    oneToOne.forEach(relation => {
        if ((relation[0] === typeOne && relation[1] === typeTwo) || (relation[1] === typeOne && relation[0] === typeTwo)) {
            answers = true
            parent = relation[1]
        }
    })
    return { answers: answers, parent: parent }
}

const isOneOnly = (typeOne, typeTwo, oneOnly) => {
    let answers = false
    oneOnly.forEach(relation => {
        if (relation.includes(typeOne) && relation.includes(typeTwo)) {
            answers = true
        }
    })
    return answers
}

const isManyOnly = (typeOne, typeTwo, manyOnly) => {
    let answers = false
    manyOnly.forEach(relation => {
        if ((relation[0] === typeOne && relation[1] === typeTwo) || (relation[1] === typeOne && relation[0] === typeTwo)) {
            answers = true
        }
    })
    return answers
}

const isSelfJoinOne = (type, selfJoinOne) => {
    let answers = false
    selfJoinOne.forEach(relation => {
        if (relation[0] === type && relation[1] === type) {
            answers = true
        }
    })
    return answers
}

const isSelfJoinMany = (type, selfJoinMany) => {
    let answers = false
    selfJoinMany.forEach(relation => {
        if (relation[0] === type && relation[1] === type) {
            answers = true
        }
    })
    return answers
}

const getRelationBetween = (typeOne, typeTwo, relations) => {
    if (typeOne !== "Query" && typeTwo !== "Query") {
        if (isManyToMany(typeOne, typeTwo, relations.manyToMany))
            return "manyToMany"
        else if (isOneToMany(typeOne, typeTwo, relations.oneToMany))
            return "oneToMany"
        else if (isManyToOne(typeOne, typeTwo, relations.manyToOne))
            return "manyToOne"
        else if (isOneToOne(typeOne, typeTwo, relations.oneToOne).answers) {
            if (typeOne === isOneToOne(typeOne, typeTwo, relations.oneToOne).parent)
                return "oneToOneParent"
            else
                return "oneToOneChild"
        }
        else if (isOneOnly(typeOne, typeTwo, relations.oneOnly))
            return "oneOnly"
        else if (isManyOnly(typeOne, typeTwo, relations.manyOnly))
            return "manyOnly"
        else if (isSelfJoinOne(typeOne, relations.selfJoinOne))
            return "selfJoinOne"
        else {
            return "selfJoinMany"
        }
    }
    else
        return "No relation"
}

const getManyToManyTables = (relations, types, typesName) => {
    let result = []
    relations.selfJoinMany.forEach(element => {
        // Self join many
        for (let index = 0; index < typesName.length; index++) {
            if (typesName[index] === element[0]) {
                types[index].fields.forEach(field => {
                    if (field.type === typesName[index]) {
                        result.push(
                            {
                                name: element[0] + "_" + field.name,
                                columns: [
                                    {
                                        field: element[0].toLowerCase() + '_id',
                                        fieldType: 'INTEGER',
                                        constraint: 'FOREIGN KEY ("' + element[0].toLowerCase() + '_id") REFERENCES "' + element[0] + '"("Pk_' + element[0] + '_id")'
                                    },
                                    {
                                        field: field.name + '_id',
                                        fieldType: 'INTEGER',
                                        constraint: 'FOREIGN KEY ("' + field.name + '_id") REFERENCES "' + element[0] + '"("Pk_' + element[0] + '_id")'
                                    },
                                ]
                            }
                        )
                    }
                })
            }
        }
    })
    relations.manyToMany.forEach(element => {
        let elt0 = utils.getSQLTableName(element[0])
        let elt1 = utils.getSQLTableName(element[1])
        result.push(
            {
                name: element[0] + "_" + element[1],
                sqlname:  elt0 + "_" + elt1,
                isJoinTable: true,
                columns: [
                    {
                        field: elt0 + '_id',
                        fieldType: 'INTEGER',
                        constraint: 'FOREIGN KEY ("' + elt0 + '_id") REFERENCES "' + elt0 + '"("Pk_' + elt0 + '_id") ON DELETE CASCADE'
                    },
                    {
                        field: elt1 + '_id',
                        fieldType: 'INTEGER',
                        constraint: 'FOREIGN KEY ("' + elt1 + '_id") REFERENCES "' + elt1 + '"("Pk_' + elt1 + '_id") ON DELETE CASCADE'
                    },
                ]
            }
        )

    })
    return result
}

const getManyToManyTableBetween = (typeOne, typeTwo, manyToManyTables) => {
    let result = ""
    manyToManyTables.forEach(table => {
        if (table.name.includes(typeOne) && table.name.includes(typeTwo)) {
            result = table
            return result
        }
    })
    return result
}

const getQuerySelfJoinOne = (currentTypeName, fields) => {
    let result = ""
    fields.forEach(field => {
        if (field.type === currentTypeName) {
            result += "SELECT * FROM \"" + currentTypeName + "\" as t1 WHERE t1.\"Pk_Employe_id\" = (SELECT \"" + field.name.toLowerCase() + "_id\" FROM  \"" + currentTypeName + "\" WHERE \"" + currentTypeName + "\".\"Pk_" + currentTypeName + "_id\" = :value)"
        }
    })
    return result
}

const getQuerySelfJoinMany = (currentTypeName, fields) => {
    let result = ""
    fields.forEach(field => {
        if (field.type === currentTypeName) {
            result += "SELECT t2.* FROM \"" + currentTypeName + "\" as t1 LEFT OUTER JOIN \"" + currentTypeName + "_" + field.name.toLowerCase() + "\" as joint ON t1.\"Pk_" + currentTypeName + "_id\" = joint.\"" + currentTypeName.toLowerCase() + "_id\" LEFT OUTER JOIN \"" + currentTypeName + "\" as t2 ON joint." + field.name.toLowerCase() + "_id = t2.\"Pk_" + currentTypeName + "_id\" WHERE t1.\"Pk_" + currentTypeName + "_id\" = :value '+sorting+' '+limit+' '+offset"
        }
    })
    return result
}


/** SCHEMA UPDATE */

const compareFieldsForUpdate = (entity, field_check) => {
    for (let field in entity) {
        if (entity[field].name == field_check.name) {
            for (let sub_field in entity[field]) {
                if (sub_field != "arguments") {
                    if (entity[field][sub_field] != field_check[sub_field]) {
                        return false;
                    }
                }
            }
        }
    }
    return true;

}

const compareFieldsOfFields = (old_field, new_field) => {
    for (let field in old_field) {
        if (field != "arguments") {
            if (old_field[field] != new_field[field]) {
                return false;
            }
        }
    }
    return true;
}

const compareField = (old_entity, new_entity) => {

    for (let field in old_entity) {
        if (!new_entity[field]) {
            return false;
        }
        if (compareFieldsOfFields(old_entity[field], new_entity[field]) == false) {
            return false
        }
    }
    return true;
}

const findDifferencesBetweenEntities = (name_entity, old_entity, new_entity) => {
    let add_fields = []
    let delete_fields = []
    let update_fields = []
    for (let field in new_entity) {
        if (containField(old_entity, new_entity[field].name) == false) {
            add_fields.push({ name: name_entity, column: new_entity[field] })
        }
        else {
            if (compareFieldsForUpdate(old_entity, new_entity[field]) == false) {
                update_fields.push({ name: name_entity, column_old: getField(old_entity, new_entity[field].name), column_new: new_entity[field] })
            }
        }
    }
    for (let field in old_entity) {
        if (containField(new_entity, old_entity[field].name) == false) {
            if (old_entity[field].type === "String" || old_entity[field].type === "ID" || old_entity[field].type === "Boolean" || old_entity[field].type === "Int") {
                delete_fields.push({ name: name_entity, column: old_entity[field].name })
            }
            else {
                delete_fields.push({ name: name_entity, column: "Fk_" + old_entity[field].type + "_id" })
            }

        }
    }
    console.log("NEW FIELDS : ", add_fields)
    console.log("UPDATED FIELDS : ", update_fields)
    console.log("DELETED FIELDS : ", delete_fields)
    return [add_fields, update_fields, delete_fields]
}

const compareSchema = (old_schema, new_schema) => {
    let add_entities = []
    let drop_entities = []
    let update_entities = []
    for (let entity in new_schema) {
        if (entity !== "Query" && new_schema[entity].type !== "ScalarTypeDefinition" && entity !== "Mutation" && new_schema[entity].type !== "Mutation") {
            if (!old_schema[entity]) {
                add_entities.push(entity)
            }
            else {
                if (compareField(old_schema[entity].fields, new_schema[entity].fields) == false) {
                    update_entities.push(entity)
                }
            }
        }
    }
    for (let entity in old_schema) {
        if (entity !== "Query" && old_schema[entity].type !== "ScalarTypeDefinition" && entity !== "Mutation" && old_schema[entity].type !== "Mutation") {
            if (!new_schema[entity]) {
                drop_entities.push({ name: entity })
            }
        }
    }
    console.log("Add entities : ", add_entities)
    console.log("Drop entities : ", drop_entities)
    console.log("Update entities : ", update_entities)
    let updates = [[], [], []]
    update_entities.forEach(x => {
        console.log("----- UPDATE ", x, " -----")
        let tmp = findDifferencesBetweenEntities(x, old_schema[x].fields, new_schema[x].fields)
        updates[0].push(tmp[0])
        updates[1].push(tmp[1])
        updates[2].push(tmp[2])
    })
    return [add_entities, updates, drop_entities]
}


/** UTILS FUNCTIONS */

// Check if a non scalar type is present in field
const hasFieldType = (type, fieldType) => {
    let answers = false
    let fieldInfo = null
    type.fields.forEach(field => {
        if (field.type === fieldType) {
            answers = true
            fieldInfo = field
        }
    })
    return { fieldInfo: fieldInfo, answers: answers }
}

const formatName = (name) => {
    return name.replace(/[^a-z]/gi, '');
}

const addIdTypes = (typesName, types) => {
    for (let index = 0; index < types.length; index++) {
        if (typesName[index] !== "Query" && typesName[index] !== "Mutation" && types[index].type !== "ScalarTypeDefinition" && types[index].type !== "EnumTypeDefinition") {
            if (!types[index].fields.find(field => field.name === "id")) {
                types[index].fields.push({"name":"id","arguments":[], "directives":[], "isDeprecated":false,"noNull":true,"isArray":false,"noNullArrayValues":false,"type":"ID"})
            }
        }
    }
    return types
}

const isSchemaValid = (typesName, types) => {
    if (!typesHaveId(typesName, types))
        return { response: false, reason: "Missing required id field of type ID in one or multiple Entity" }
    if (!fieldTypeExists(typesName, types))
        return { response: false, reason: "One Entity has one or multiple fields of undefined types. Please use default scalar, declare your own scalar or declare missing entity type" }
    return { response: true }
}

const typesHaveId = (typesName, types) => {
    for (let index = 0; index < types.length; index++) {
        if (typesName[index] !== "Query" && typesName[index] !== "Mutation" && types[index].type !== "ScalarTypeDefinition" && types[index].type !== "EnumTypeDefinition") {
            if (!types[index].fields.find(field => field.name === "id")) {
                return false
            }
        }
    }
    return true
}

// Check if the types of field are correct (default scalar, personalized scalar of other existing entities)
const fieldTypeExists = (typesName, types) => {
    for (let i = 0; i < types.length; i++) {
        let fields = getFields(types[i])
        for (let j = 0; j < fields.length; j++) {
            if (fields[j].type !== "ID" && fields[j].type !== "String" && fields[j].type !== "Int" && fields[j].type !== "Boolean" && fields[j].type !== "Float") {  // Default scalar
                if (!typesName.includes(fields[j].type)) { // User scalars or Entities
                    return false
                }
            }

        }
    }
    return true
}

const getField = (entity, fieldName) => {
    for (let field in entity) {
        if (entity[field].name == fieldName) {
            return entity[field]
        }
    }
    return undefined
}

const containField = (entity, fieldName) => {
    for (let field in entity) {
        if (entity[field].name == fieldName)
            return true
    }
    return false;
}

const findTable = (tables, name) => {
    for (let table in tables) {
        if (tables[table].name == name) {
            return tables[table]
        }
    }
    return undefined
}

const findField = (fields, columnName) => {
    for (let pos in fields) {
        if (fields[pos].field === columnName) {
            return fields[pos]
        }
    }
    return undefined
}


module.exports = {
    getAllTypes: getAllTypes,
    getAllTypesName: getAllTypesName,
    getAllSQLTypesName: getAllSQLTypesName,
    getFields: getFields,
    getFieldsDirectiveNames : getFieldsDirectiveNames,
    getFieldsParsed: getFieldsParsed,
    getFieldsInput: getFieldsInput,
    buildResolverInterface: buildResolverInterface,
    getRequire: getRequire,
    getGraphqlType: getGraphqlType,
    getResolveType: getResolveType,
    getEnumValues: getEnumValues,
    getFieldsParsedHandler: getFieldsParsedHandler,
    getDeleteMethodsMany: getDeleteMethodsMany,
    getAllTables: getAllTables,
    getInitEachModelsJS: getInitEachModelsJS,
    getInitEachFieldsModelsJS: getInitEachFieldsModelsJS,
    getInitQueriesInsert: getInitQueriesInsert,
    getCreationOfModels: getCreationOfModels,
    getListOfModelsExport: getListOfModelsExport,
    getRelations: getRelations,
    isOneOnly: isOneOnly,
    isManyOnly: isManyOnly,
    isSelfJoinOne: isSelfJoinOne,
    isSelfJoinMany: isSelfJoinMany,
    getRelationBetween: getRelationBetween,
    getManyToManyTables: getManyToManyTables,
    getManyToManyTableBetween: getManyToManyTableBetween,
    getQuerySelfJoinOne: getQuerySelfJoinOne,
    getQuerySelfJoinMany: getQuerySelfJoinMany,
    hasFieldType: hasFieldType,
    formatName: formatName,
    addIdTypes: addIdTypes,
    isSchemaValid: isSchemaValid,
    getFieldsCreate: getFieldsCreate,
    getFieldsName: getFieldsName,
    formatName: formatName,
    compareSchema: compareSchema,
    findTable: findTable,
    findField: findField,
}