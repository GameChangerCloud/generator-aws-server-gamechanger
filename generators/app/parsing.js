const matching = require('./matching')
const pluralize = require('pluralize')
const scalars = require('./constants')


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

// From a type object, get the fields and return an array of it
const getFields = (type) => {
    let fields = []
    for (let index = 0; index < type["fields"].length; index++) {
        fields.push(type["fields"][index])
    }
    return fields
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
                result += "\t\t\tresolve: (obj, args, context, info) => {\n\t\t\t\treturn dbHandler.handleGet({parentId: obj.id, parentTypeName: info.parentType, relationType: \"" + relationType + "\", tableJunction: \"" + manyToManyTable.name + "\"}, '" + field.type + "Type')\n\t\t\t}"
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

const getMutationFields = (typesName, types, defaultScalars) => {
    let s = ""
    for (let index = 0; index < typesName.length; index++) {
        if (typesName[index] !== "Query" && typesName[index] !== "Mutation" && !defaultScalars.includes(typesName[index])) {
            s += `${typesName[index].toLowerCase()}Delete: { 
			    type: ${typesName[index]}Type,
			    args: {
				    id: { type: new GraphQLNonNull(GraphQLID) },
			    },
			    resolve: (obj, args, context, info) => {
				    const recordToDelete = dbHandler.handleGet(args, '${typesName[index]}Type').then(record => {
                        // Query to delete
                        return dbHandler.handleDelete(args.id, '${typesName[index]}Type').then(() => {
                            return record
                        })
				    })
				    return recordToDelete
			    }
		    },
            ${typesName[index].toLowerCase()}Update: { 
			    type: ${typesName[index]}Type,
			    args: {
                    id: { type: new GraphQLNonNull(GraphQLID) },\n`
            for (let j = 0; j < types[index].fields.length; j++) {
                let field = types[index].fields[j]
                if (field.type !== "String" && field.type !== "Boolean" && field.type !== "Int" && field.type !== "ID" && !defaultScalars.includes(field.type)) {
                    if (field.isArray) {
                        s += field.name + ": {type: new GraphQLList(GraphQLID)},"
                    }
                    else {
                        s += field.name + ": {type: GraphQLID},"
                    }
                    s += "\n"
                }
                else {
                    if (field.type !== "ID") {
                        if (field.isArray) {
                            if (defaultScalars.includes(field.type)) {
                                s += field.name + ": {type: new GraphQLList(" + field.type + ")},"
                            }
                            else {
                                s += field.name + ": {type: new GraphQLList(GraphQL" + field.type + ")},"
                            }
                        }
                        else {
                            if (defaultScalars.includes(field.type)) {
                                s += field.name + ": {type: " + field.type + "},"
                            }
                            else {
                                s += field.name + ": {type: GraphQL" + field.type + "},"
                            }
                        }
                        s += "\n"
                    }
                }
            }
            s += `},
			    resolve: (obj, args, context, info) => {
                    const recordUpdated = dbHandler.handleUpdate(args, '${typesName[index]}Type').then(record => {
                        return dbHandler.handleGet(args, '${typesName[index]}Type').then(record => {
                            return record
                        })
                    })
                    return recordUpdated
			    }
		    },
	        ${typesName[index].toLowerCase()}Create: {
                type: ${typesName[index]}Type,
                args: {
                    id: { type: new GraphQLNonNull(GraphQLID) },\n`
            for (let j = 0; j < types[index].fields.length; j++) {
                let field = types[index].fields[j]
                if (field.type !== "String" && field.type !== "Boolean" && field.type !== "Int" && field.type !== "ID" && !defaultScalars.includes(field.type)) {
                    if (field.isArray) {
                        s += field.name + ": {type: new GraphQLList(GraphQLID)},"
                    }
                    else {
                        s += field.name + ": {type: GraphQLID},"
                    }
                    s += "\n"
                }
                else {
                    if (field.type !== "ID") {
                        if (field.isArray) {
                            if (defaultScalars.includes(field.type)) {
                                s += field.name + ": {type: new GraphQLList(" + field.type + ")},"
                            }
                            else {
                                s += field.name + ": {type: new GraphQLList(GraphQL" + field.type + ")},"
                            }
                        }
                        else {
                            if (defaultScalars.includes(field.type)) {
                                s += field.name + ": {type: " + field.type + "},"
                            }
                            else {
                                s += field.name + ": {type: GraphQL" + field.type + "},"
                            }
                        }
                        s += "\n"
                    }
                }
            }
            s += `},
                resolve: (obj, args, context, info) => {
                    const recordCreated = dbHandler.handleCreate(args, '${typesName[index]}Type').then(record => {
                        return dbHandler.handleGet(args, '${typesName[index]}Type').then(record => {
                            return record
                        })
                    })
                    return recordCreated
                }
            },\n\n`
        }
    }
    return s
}

/** GLOBAL HANDLER  */

const getHandlerRequire = (typesName, types) => {
    let s = ""
    for (let index = 0; index < typesName.length; index++) {
        if (typesName[index] !== "Query" && typesName[index] !== "Mutation" && types[index].type !== "EnumTypeDefinition" && types[index].type !== "InterfaceTypeDefinition" && types[index].type !== "ScalarTypeDefinition") {
            let name = typesName[index]
            name = name[0].toUpperCase() + name.slice(1)
            s += "const handler" + name + " = require('./handlers/handler" + name + "')\n";
        }
    }
    return s
}

const getHandlerGetSwitchCase = (typesName, types) => {
    let s = ""
    for (let index = 0; index < typesName.length; index++) {
        if (typesName[index] !== "Query" && typesName[index] !== "Mutation" && types[index].type !== "EnumTypeDefinition" && types[index].type !== "InterfaceTypeDefinition" && types[index].type !== "ScalarTypeDefinition") {
            s += "case \"" + typesName[index] + "Type\": \n"
            s += "\t\t\t\tif(args) {\n"
            s += "\t\t\t\t\treturn handler" + typesName[index] + ".getMethodsByArgs(args)\n"
            s += "\t\t\t\t}\n"
            s += "\t\t\t\telse {\n"
            s += "\t\t\t\t\treturn handler" + typesName[index] + ".getMethods()\n"
            s += "\t\t\t\t}\n"
        }
    }
    return s
}

const getHandlerDeleteSwitchCase = (typesName, types) => {
    let s = ""
    for (let index = 0; index < typesName.length; index++) {
        if (typesName[index] !== "Query" && typesName[index] !== "Mutation" && types[index].type !== "EnumTypeDefinition" && types[index].type !== "InterfaceTypeDefinition" && types[index].type !== "ScalarTypeDefinition") {
            s += "case \"" + typesName[index] + "Type\": \n"
            s += "\t\t\t\t\treturn handler" + typesName[index] + ".deleteMethods(id)\n"
        }
    }
    return s
}

const getHandlerCreateSwitchCase = (typesName, types) => {
    let s = ""
    for (let index = 0; index < typesName.length; index++) {
        if (typesName[index] !== "Query" && typesName[index] !== "Mutation" && types[index].type !== "EnumTypeDefinition" && types[index].type !== "InterfaceTypeDefinition" && types[index].type !== "ScalarTypeDefinition") {
            s += "case \"" + typesName[index] + "Type\": \n"
            s += "\t\t\t\t\treturn handler" + typesName[index] + ".createMethods(args)\n"
        }
    }
    return s

}

const getHandlerUpdateSwitchCase = (typesName, types) => {
    let s = ""
    for (let index = 0; index < typesName.length; index++) {
        if (typesName[index] !== "Query" && typesName[index] !== "Mutation" && types[index].type !== "EnumTypeDefinition" && types[index].type !== "InterfaceTypeDefinition" && types[index].type !== "ScalarTypeDefinition") {
            s += "case \"" + typesName[index] + "Type\": \n"
            s += "\t\t\t\t\treturn handler" + typesName[index] + ".updateMethods(args)\n"
        }
    }
    return s
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

const getCreateMethodsField = (currentTypeName, fields, relations, manyToManyTables) => {
    let s = ""
    fields.map(field => {
        if (field.type !== "ID") {
            if (field.type !== "String" && field.type !== "ID" && field.type !== "Int" && field.type != "Boolean") {

                switch (getRelationBetween(field.type, currentTypeName, relations)) {

                    case "oneToMany":
                    case "oneOnly":
                    case "manyToOne":
                        break
                    case "manyOnly":
                        s += `let addedElements` + field.type + ` = utils.getAddedElements([], args.` + field.name + `)
                            for (let index = 0; index < addedElements`+ field.type + `.length; index++) {					
                                sqlParams.sql = "UPDATE \\"`+ field.type + `\\" SET  \\"Fk_` + currentTypeName + `_id\\" = " + args.id + " WHERE \\"Pk_` + field.type + `_id\\" = " + addedElements` + field.type + `[index]
                                rdsDataService.executeStatement(sqlParams, (err, data) => {
                                    if (err) console.log(err, err.stack);
                                    else console.log(data);   
                                })
                            }
                     `
                        break

                    case "manyToMany":
                        // Get the junction table
                        let manyToManyTable = getManyToManyTableBetween(currentTypeName, field.type, manyToManyTables).name

                        s += "// Field " + field.name + " of type " + field.type + "\n\n"
                        s += "sqlParams.sql = \"SELECT * FROM \\\"" + field.type + "\\\" INNER JOIN \\\"" + manyToManyTable + "\\\" ON \\\"Pk_" + field.type + "_id\\\" = \\\"" + manyToManyTable + "\\\".\\\"" + field.type + "_id\\\" INNER JOIN \\\"" + currentTypeName + "\\\" ON \\\"Pk_" + currentTypeName + "_id\\\" = \\\"" + manyToManyTable + "\\\".\\\"" + currentTypeName + "_id\\\" WHERE \\\"Pk_" + currentTypeName + "_id\\\" = \" + args.id\n"
                        s += "rdsDataService.executeStatement(sqlParams, (err, data) => {\n"
                        s += "if (err) {console.log(err, err.stack)}\n"
                        s += `else {
                            let current`+ field.type + `State = utils.constructOutputArray(data, "` + field.type + `")
            
                            // `+ field.type + ` to add
                            let addedElements`+ field.type + ` = utils.getAddedElements([], args.` + field.name + `)
                            rdsDataService.beginTransaction(beginParams, function (err, data) {
                                if (err) console.log(err, err.stack); // an error occurred
                                else {
                                    for (let index = 0; index < addedElements`+ field.type + `.length; index++) {					
                                        sqlParams.sql = "INSERT INTO \\"`+ manyToManyTable + `\\" (\\"` + currentTypeName + `_id\\", \\"` + field.type + `_id\\") VALUES ("+args.id+", "+addedElements` + field.type + `[index]+")"
                                        rdsDataService.executeStatement(sqlParams, (err, data) => {
                                            if (err) console.log(err, err.stack);
                                            else console.log(data);   
                                        })
                                    }
                                    commitParams.transactionId = data.transactionId
                                    rdsDataService.commitTransaction(commitParams, function (err, data) {
                                        if (err) console.log(err, err.stack); // an error occurred
                                        else console.log(data)
                                    })
                                }
                            });
                            
                        }})\n`
                        break

                    case "oneToOneParent":
                        // A child cannot change its parent in unidirectional
                        s += "if(args." + field.name + ") {\n"
                        s += "throw 'Error, a child in 1 - 1 unildirectional relation cannot modify its parent' \n}\n"

                        // Case bidirectional not supported
                        break

                    case "oneToOneChild":
                        if (field.noNull) {
                            // Case bidirectional, not supported
                            // Got the field
                        }
                        else {
                            // Don't have the field
                            s += `sqlParams.sql = \"UPDATE \\\"` + field.type + `\\\" SET \\\"Fk_` + currentTypeName + `_id\\\" = \" + args.id + \" WHERE \\\"Pk_` + field.type + `_id\\\" = \" + args.` + field.name + `
                                    rdsDataService.executeStatement(sqlParams, (err, data) => {
                                        if (err) {console.log(err, err.stack)}
                                        else {console.log(data)}
                                    })`
                        }
                        break

                    default:
                        console.log("Error in handling relationship")
                        break
                }
            }
        }
    })
    return s

}

const getFieldsCreate = (currentTypeName, fields, relations, manyToManyTables) => {
    let s = ""
    fields.map(field => {
        switch (field.type) {
            case "ID":
            case "Boolean":
            case "Int":
                s += `args.${field.name} + "," +`
                break;
            case "String":
            case "Date":
            case "Time":
                s += `"'" + utils.escapeQuote(args.${field.name}) + "'" + "," +`
                break;
            case "DateTime":
                s += `"'" + args.${field.name}.toISOString() + "'" + "," +`
                break;

            default:
                switch (getRelationBetween(field.type, currentTypeName, relations)) {

                    case "oneOnly":
                    case "oneToMany":
                        s += `args.${field.name} + "," +`
                        break

                    default:
                        break;
                }
                break;
        }
    })
    s = s.substring(0, s.length - 7)
    return s

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

const getUpdateMethodsField = (currentTypeName, fields, relations, manyToManyTables, scalarTypeNames) => {
    let s = "let temp = ''\n\n"
    fields.map(field => {
        if (field.type !== "ID") {
            if (field.type !== "String" && field.type !== "ID" && field.type !== "Int" && field.type !== "Boolean" && !scalarTypeNames.includes(field.type)) {

                switch (getRelationBetween(field.type, currentTypeName, relations)) {

                    case "oneToMany":
                    case "oneOnly":
                        s += "if(args." + field.name + " !== undefined){"
                        s += "temp += args." + field.name + " ? \"\\\"Fk_" + field.type + "_id\\\" = '\" + args." + field.name + " + \"', \" :  \"\\\"Fk_" + field.type + "_id\\\" = null, \"\n"
                        s += "}\n"
                        break

                    case "manyToOne":
                    case "manyOnly":
                        s += "// Field " + field.name + " of type " + field.type + "\n\n"
                        s += "sqlParams.sql = \"SELECT * FROM \\\"" + field.type + "\\\" WHERE \\\"" + field.type + "\\\".\\\"Fk_" + currentTypeName + "_id\\\" = \" + args.id \n"
                        s += "rdsDataService.executeStatement(sqlParams, (err, data) => {\n"
                        s += "if (err) {console.log(err, err.stack)}\n"
                        s += `else {
                            let current`+ field.type + `State = utils.constructOutputArray(data)
            
                            // `+ field.type + ` to add
                            let addedElements`+ field.type + ` = utils.getAddedElements(current` + field.type + `State, args.` + field.name + `)
                            for (let index = 0; index < addedElements`+ field.type + `.length; index++) {					
                                sqlParams.sql = "UPDATE \\"`+ field.type + `\\" SET  \\"Fk_` + currentTypeName + `_id\\" = " + args.id + " WHERE \\"Pk_` + field.type + `_id\\" = " + addedElements` + field.type + `[index]
                                rdsDataService.executeStatement(sqlParams, (err, data) => {
                                    if (err) console.log(err, err.stack);
                                    else console.log(data);   
                                })
                            }
                            // `+ field.type + ` to delete
                            let removedElements`+ field.type + ` = utils.getRemovedElements(current` + field.type + `State, args.` + field.name + `)
                            for (let index = 0; index < removedElements`+ field.type + `.length; index++) {
                                    sqlParams.sql = "UPDATE \\"`+ field.type + `\\" SET  \\"Fk_` + currentTypeName + `_id\\" = null WHERE \\"Pk_` + field.type + `_id\\" = " + removedElements` + field.type + `[index]
                                    rdsDataService.executeStatement(sqlParams, (err, data) => {
                                        if (err) console.log(err, err.stack);
                                        else console.log(data);   
                                    })
                            }
                        }})\n`
                        break

                    case "manyToMany":
                        let manyToManyTable = getManyToManyTableBetween(currentTypeName, field.type, manyToManyTables).name
                        s += "// Field " + field.name + " of type " + field.type + "\n\n"
                        s += "sqlParams.sql = \"SELECT * FROM \\\"" + field.type + "\\\" INNER JOIN \\\"" + manyToManyTable + "\\\" ON \\\"Pk_" + field.type + "_id\\\" = \\\"" + manyToManyTable + "\\\".\\\"" + field.type + "_id\\\" INNER JOIN \\\"" + currentTypeName + "\\\" ON \\\"Pk_" + currentTypeName + "_id\\\" = \\\"" + manyToManyTable + "\\\".\\\"" + currentTypeName + "_id\\\" WHERE \\\"Pk_" + currentTypeName + "_id\\\" = \" + args.id\n"
                        s += "rdsDataService.executeStatement(sqlParams, (err, data) => {\n"
                        s += "if (err) {console.log(err, err.stack)}\n"
                        s += `else {
                            let current`+ field.type + `State = utils.constructOutputArray(data, "` + field.type + `")
            
                            // `+ field.type + ` to add
                            let addedElements`+ field.type + ` = utils.getAddedElements(current` + field.type + `State, args.` + field.name + `)
                            rdsDataService.beginTransaction(beginParams, function (err, data) {
                                if (err) console.log(err, err.stack); // an error occurred
                                else {
                                    for (let index = 0; index < addedElements`+ field.type + `.length; index++) {					
                                        sqlParams.sql = "INSERT INTO \\"`+ manyToManyTable + `\\" (\\"` + currentTypeName + `_id\\", \\"` + field.type + `_id\\") VALUES ("+args.id+", "+addedElements` + field.type + `[index]+")"
                                        rdsDataService.executeStatement(sqlParams, (err, data) => {
                                            if (err) console.log(err, err.stack);
                                            else console.log(data);   
                                        })
                                    }
                                    commitParams.transactionId = data.transactionId
                                    rdsDataService.commitTransaction(commitParams, function (err, data) {
                                        if (err) console.log(err, err.stack); // an error occurred
                                        else console.log(data)
                                    })
                                }
                            });
                            
                            // `+ field.type + ` to delete
                            let removedElements`+ field.type + ` = utils.getRemovedElements(current` + field.type + `State, args.` + field.name + `)
                            rdsDataService.beginTransaction(beginParams, function (err, data) {
                                if (err) console.log(err, err.stack); // an error occurred
                                else {
                                    for (let index = 0; index < removedElements`+ field.type + `.length; index++) {
                                        sqlParams.sql = "DELETE FROM \\"`+ manyToManyTable + `\\" WHERE \\"` + field.type + `_id\\" = " + removedElements` + field.type + `[index] + \" AND \\"` + currentTypeName + `_id\\" = \" + args.id
                                        rdsDataService.executeStatement(sqlParams, (err, data) => {
                                            if (err) console.log(err, err.stack);
                                            else console.log(data);   
                                        })
                                    }
                                    commitParams.transactionId = data.transactionId
                                    rdsDataService.commitTransaction(commitParams, function (err, data) {
                                        if (err) console.log(err, err.stack); // an error occurred
                                        else console.log(data)
                                    })
                                }
                            })
                        }})\n`

                        break

                    case "oneToOneParent":
                        // A child cannot change its parent in unidirectional
                        s += "if(args." + field.name + ") {\n"
                        s += "throw 'Error, a child in 1 - 1 unildirectional relation cannot modify its parent' \n}\n"

                        // Case bidirectional not supported
                        break

                    case "oneToOneChild":
                        if (field.noNull) {
                            // Case bidirectional, not supported
                            // Got the field
                        }
                        else {
                            // Don't have the field
                            // Remove te previous child
                            s += "sqlParams.sql = \"UPDATE \\\"" + field.type + "\\\" SET \\\"Fk_" + currentTypeName + "_id\\\" = null WHERE \\\"Pk_" + field.type + "_id\\\" = (SELECT \\\"Pk_" + field.type + "_id\\\" FROM \\\"" + field.type + "\\\" WHERE \\\"Fk_" + currentTypeName + "_id\\\" = \" + args.id + \")\"\n"
                            s += "rdsDataService.executeStatement(sqlParams, (err, data) => {\n"
                            s += "if (err) {console.log(err, err.stack)}\n"
                            s += `else { 
                                    sqlParams.sql = \"UPDATE \\\"` + field.type + `\\\" SET \\\"Fk_` + currentTypeName + `_id\\\" = \" + args.id + \" WHERE \\\"Pk_` + field.type + `_id\\\" = \" + args.` + field.name + `
                                    rdsDataService.executeStatement(sqlParams, (err, data) => {
                                        if (err) {console.log(err, err.stack)}
                                        else {console.log(data)}
                                    })
                                }
                            })`
                        }
                        break

                    default:
                        console.log("Error in handling relationship")
                        break
                }
            }
            else {
                switch (field.type) {
                    // todo
                    case scalars.Point:
                        break;

                    case scalars.Linestring:
                        break;
                        
                    case scalars.Polygon:
                        break;

                    case scalars.NonPositiveInt:
                    case scalars.PositiveInt:
                    case scalars.NonNegativeInt:
                    case scalars.NegativeInt:
                    case scalars.UnsignedInt:
                    case scalars.NonPositiveFloat:
                    case scalars.PositiveFloat:
                    case scalars.NonNegativeFloat:
                    case scalars.NegativeFloat:
                    case scalars.UnsignedFloat:
                    case scalars.BigInt:
                    case scalars.Long:
                    case scalars.Port:
                        s += "if(args." + field.name + " !== undefined){"
                        s += "temp += args." + field.name + " ? \"\\\"" + field.name + "\\\" = \" + args." + field.name + " + \", \" : \"\\\"" + field.name + "\\\" = null, \"\n"
                        s += "}\n"
                        break

                    case scalars.DateTime:
                        s += "if(args." + field.name + " !== undefined){"
                        s += "temp += args." + field.name + " ? \"\\\"" + field.name + "\\\" = '\" + args." + field.name + ".toISOString() + \"', \" : \"\\\"" + field.name + "\\\" = null, \"\n"
                        s += "}\n"
                        break
                    case scalars.DateGraphQL:
                    case scalars.Time:
                    case scalars.GUID:
                    case scalars.IPv4:
                    case scalars.IPv6:
                    case scalars.MAC:
                    case scalars.USCurrency:
                    case scalars.Currency:
                    case scalars.JSON:
                    case scalars.JSONObject:
                    case scalars.Byte:
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
                        s += "if(args." + field.name + " !== undefined){"
                        s += "temp += args." + field.name + " ? \"\\\"" + field.name + "\\\" = '\" + utils.escapeQuote(args." + field.name + ") + \"', \" : \"\\\"" + field.name + "\\\" = null, \"\n"
                        s += "}\n"
                        break

                }

            }
        }
    })
    s += "\n"
    return s
}


/** DATABASE (tables, init, fill, drop) */

// Tables
// Get all the tables, with columns, based on the types we have
const getAllTables = (types, typesName, relations, scalarTypeNames) => {
    let allTables = []
    for (let index = 0; index < types.length; index++) {

        let currentTypeName = typesName[index]
        let currentType = types[index]
        // Will hold the currentType table infos
        let tableTemp = []

        // Fill up the infos on scalar field (int, string, etc.)
        if (currentTypeName !== "Query" && currentTypeName !== "Mutation" && !scalarTypeNames.includes(currentTypeName)) {
            currentType.fields.forEach(field => {
                let fieldType = field.type
                if (!typesName.includes(fieldType)) {
                    if (fieldType === "ID") {
                        tableTemp.push({ field: "Pk_" + currentTypeName + "_id", fieldType: "Int", noNull: !field.noNull, unique: false, constraint: "PRIMARY KEY NOT NULL" })
                    }
                    else if (fieldType === "String") {
                        tableTemp.push({ field: field.name, fieldType: "text", noNull: field.noNull, unique: false, constraint: null })
                    }
                    else {
                        tableTemp.push({ field: field.name, fieldType: fieldType, noNull: field.noNull, unique: false, constraint: null })
                    }
                }

                else if (scalarTypeNames.includes(fieldType)) {
                    switch (fieldType) {
                        case scalars.Date:
                            tableTemp.push({ field: field.name, fieldType: "date", noNull: field.noNull, unique: false, constraint: null })
                            break
                        case scalars.Time:
                            tableTemp.push({ field: field.name, fieldType: "time", noNull: field.noNull, unique: false, constraint: null })
                            break
                        case scalars.DateTime:
                            tableTemp.push({ field: field.name, fieldType: "timestamp", noNull: field.noNull, unique: false, constraint: null })
                            break
                        case scalars.NonPositiveInt:
                        case scalars.PositiveInt:
                        case scalars.NonNegativeInt:
                        case scalars.NegativeInt:
                        case scalars.UnsignedInt:
                            tableTemp.push({ field: field.name, fieldType: "int", noNull: field.noNull, unique: false, constraint: null })
                            break
                        case scalars.NonPositiveFloat:
                        case scalars.PositiveFloat:
                        case scalars.NonNegativeFloat:
                        case scalars.NegativeFloat:
                        case scalars.UnsignedFloat:
                            tableTemp.push({ field: field.name, fieldType: "float8", noNull: field.noNull, unique: false, constraint: null })
                            break
                        case scalars.BigInt:
                        case scalars.Long:
                        case scalars.Port:
                            tableTemp.push({ field: field.name, fieldType: "int8", noNull: field.noNull, unique: false, constraint: null })
                            break

                        case scalars.GUID:
                            tableTemp.push({ field: field.name, fieldType: "uuid", noNull: field.noNull, unique: false, constraint: null })
                            break
                        case scalars.IPv4:
                        case scalars.IPv6:
                            tableTemp.push({ field: field.name, fieldType: "inet", noNull: field.noNull, unique: false, constraint: null })
                            break
                        case scalars.MAC:
                            tableTemp.push({ field: field.name, fieldType: "macaddr", noNull: field.noNull, unique: false, constraint: null })
                            break
                        case scalars.USCurrency:
                        case scalars.Currency:
                            tableTemp.push({ field: field.name, fieldType: "money", noNull: field.noNull, unique: false, constraint: null })
                            break
                        case scalars.JSON:
                        case scalars.JSONObject:
                            tableTemp.push({ field: field.name, fieldType: "json", noNull: field.noNull, unique: false, constraint: null })
                            break
                        case scalars.Byte:
                            tableTemp.push({ field: field.name, fieldType: "bytea", noNull: field.noNull, unique: false, constraint: null })
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
                            tableTemp.push({ field: field.name, fieldType: "text", noNull: field.noNull, unique: false, constraint: null })
                    }
                }
                else {
                    // Do nothing, handled after
                }
            })

            // Then, we check relations between the current type table with all the types to add the correct foreigns key and references
            typesName.forEach(typeTable => {
                if (!scalarTypeNames.includes(typeTable)) {
                    let fieldChild
                    let relationType = getRelationBetween(currentTypeName, typeTable, relations)
                    switch (relationType) {
                        case "oneOnly":
                            // Only if the current type DOES HAVE the field type
                            if (hasFieldType(currentType, typeTable).answers) {
                                fieldChild = (hasFieldType(currentType, typeTable).fieldInfo)
                                tableTemp.push({ field: "Fk_" + typeTable + "_id", fieldType: "Int", noNull: fieldChild.noNull, unique: false, constraint: "FOREIGN KEY (\"Fk_" + typeTable + "_id\") REFERENCES \"" + typeTable + "\" (\"Pk_" + typeTable + "_id\")" })
                            }
                            break

                        case "manyOnly":
                            // Only if the current type DOES NOT have the field type
                            if (!hasFieldType(currentType, typeTable).answers) {
                                // We create a column reference that can hold id of element from the fieldType, but without constraint since it's just informative
                                tableTemp.push({ field: "Fk_" + typeTable + "_id", fieldType: "Int", noNull: false, unique: false, constraint: "FOREIGN KEY (\"Fk_" + typeTable + "_id\") REFERENCES \"" + typeTable + "\" (\"Pk_" + typeTable + "_id\")" })
                            }
                            break

                        case "oneToMany":
                            // Nothing, since the Fk will be placed on the other linked table
                            break

                        case "manyToOne":
                            fieldChild = (hasFieldType(currentType, typeTable).fieldInfo)
                            tableTemp.push({ field: "Fk_" + typeTable + "_id", fieldType: "Int", noNull: fieldChild.noNull, unique: false, constraint: "FOREIGN KEY (\"Fk_" + typeTable + "_id\") REFERENCES \"" + typeTable + "\" (\"Pk_" + typeTable + "_id\")" })
                            break

                        case "manyToMany":
                            // Nothing, since the junction tables will hold the id necessary
                            break

                        case "oneToOneParent":
                            fieldChild = (hasFieldType(currentType, typeTable).fieldInfo)
                            if (fieldChild.noNull) {
                                tableTemp.push({ field: "Fk_" + typeTable + "_id", fieldType: "Int", noNull: fieldChild.noNull, unique: true, constraint: "FOREIGN KEY (\"Fk_" + typeTable + "_id\") REFERENCES \"" + typeTable + "\" (\"Pk_" + typeTable + "_id\")" })
                            }
                            else {
                                // Nothing, it's unidirectionnal and the constraint is on the child
                            }
                            break

                        case "oneToOneChild":
                            fieldChild = (hasFieldType(currentType, typeTable).fieldInfo)
                            tableTemp.push({ field: "Fk_" + typeTable + "_id", fieldType: "Int", noNull: true, unique: true, constraint: "FOREIGN KEY (\"Fk_" + typeTable + "_id\") REFERENCES \"" + typeTable + "\" (\"Pk_" + typeTable + "_id\")" })

                        case "selfJoinOne":
                            // Check field with the same type
                            const fields = getFields(currentType)
                            fields.forEach(field => {
                                // If it's the field, we add the key
                                if (field.type === currentTypeName) {
                                    // Adding a foreign key with the graphql field name
                                    tableTemp.push({ field: field.name + "_id", fieldType: "Int", noNull: field.noNull, unique: true, constraint: "FOREIGN KEY (\"" + field.name + "_id\") REFERENCES \"" + typeTable + "\" (\"Pk_" + typeTable + "_id\")" })
                                }
                            })
                        default:
                            // No relation
                            break
                    }
                }
            })
            allTables.push({ name: currentTypeName, columns: tableTemp })
        }
    }
    return allTables
}


const getEntitiesForExist = (tables) => {
    let s = 'const entities = [\n'
    tables.forEach(table => {
        s += '"' + table.name + '", '
    })
    s += ']'
    return s
}

const getInitAddConstraints = (tables) => {
    let s = 'const queriesConstraint = [\n'
    tables.forEach(table => {
        for (let index = 0; index < table.columns.length; index++) {
            if (table.columns[index].constraint != null && table.columns[index].constraint.includes("FOREIGN KEY")) {
                s += '{tableName: "' + table.name + '", text: `ALTER TABLE "' + table.name + '" ADD ' + table.columns[index].constraint + ' DEFERRABLE INITIALLY DEFERRED`},'
            }
        }
    })
    s += ']'
    return s
}

// FIllTable

const getUpdateForModel = (currentType, currentTypeName, fields, types, typesName, relations) => {
    let result = "function update" + currentTypeName + "(" + currentTypeName.toLowerCase() + "){\n"
    for (let index = 0; index < fields.length; index++) {
        if (fields[index].isArray) {
            // nothing
        }
        else {
            switch (fields[index].type) {
                case "String":
                case "ID":
                case "Int":
                    break;
                default:
                    break
            }
        }
    }
    // We check relations between the current type table with all the types
    for (let index = 0; index < typesName.length; index++) {
        let relationType = getRelationBetween(currentTypeName, typesName[index], relations)
        let s = currentTypeName.toLowerCase().substring(0, 5) + typesName[index] + 'Bis';
        switch (relationType) {

            case "manyOnly":
                // Only if the current type DOES NOT have the field type 
                if (!hasFieldType(currentType, typesName[index]).answers) {
                    result += 'if(' + currentTypeName.toLowerCase() + '.' + typesName[index].toLowerCase() + '_id == null) {\n'
                    result += 'let _position = pickOne(' + typesName[index].toLowerCase() + 'Tab);\n'
                    result += 'let ' + s + ' = ' + typesName[index].toLowerCase() + 'Tab[_position];\n'
                    result += currentTypeName.toLowerCase() + ' = update(' + currentTypeName.toLowerCase() + ', "' + typesName[index].toLowerCase() + '", ' + s + '.id, ' + 'new model.' + currentTypeName + ');\n';
                    result += '}\n'
                }
                break

            case "manyToOne":
                result += 'if(' + currentTypeName.toLowerCase() + '.' + typesName[index].toLowerCase() + '_id == null) {\n'
                result += 'let _position = pickOne(' + typesName[index].toLowerCase() + 'Tab);\n'
                result += 'let ' + s + ' = ' + typesName[index].toLowerCase() + 'Tab[_position];\n'
                result += currentTypeName.toLowerCase() + ' = update(' + currentTypeName.toLowerCase() + ', "' + typesName[index].toLowerCase() + '", ' + s + '.id, ' + 'new model.' + currentTypeName + ');\n';
                result += '}\n'
                break

            case "oneToOneParent":
                result += 'if(' + currentTypeName.toLowerCase() + '.' + typesName[index].toLowerCase() + ' == null) {\n'
                result += 'let _position = pickOne(' + typesName[index].toLowerCase() + 'Tab);\n'
                result += 'let ' + s + ' = ' + typesName[index].toLowerCase() + 'Tab[_position];\n'
                result += currentTypeName.toLowerCase() + ' = update(' + currentTypeName.toLowerCase() + ', "' + typesName[index].toLowerCase() + '", ' + s + '.id, ' + 'new model.' + currentTypeName + ');\n';
                result += '}\n'
                break

            case "oneToOneChild":
                result += 'if(' + currentTypeName.toLowerCase() + '.' + typesName[index].toLowerCase() + ' == null) {\n'
                result += 'let _position\n'
                result += 'let ' + s + '\n'
                result += 'do {'
                result += '_position = pickOne(' + typesName[index].toLowerCase() + 'Tab);\n'
                result += s + ' = ' + typesName[index].toLowerCase() + 'Tab[_position];\n'
                result += '} while(!isUnique(' + s + ', ' + currentTypeName.toLowerCase() + 'Tab))\n'
                result += currentTypeName.toLowerCase() + ' = update(' + currentTypeName.toLowerCase() + ', "' + typesName[index].toLowerCase() + '", ' + s + '.id, ' + 'new model.' + currentTypeName + ');\n';
                result += '}\n'
                break;

            case "selfJoinOne":
                // Check field with the same type 
                const fields = getFields(currentType)
                fields.forEach(field => {
                    if (field.type === currentTypeName) {
                        result += 'if(' + currentTypeName.toLowerCase() + '.' + field.name + '_id == null) {\n'
                        result += 'let _position\n'
                        result += 'let ' + s + '\n'
                        result += 'do {'
                        result += '_position = pickOne(' + currentTypeName.toLowerCase() + 'Tab);\n'
                        result += s + ' = ' + currentTypeName.toLowerCase() + 'Tab[_position];\n'
                        result += '} while(' + currentTypeName.toLowerCase() + '.id === ' + s + '.id)\n'
                        result += currentTypeName.toLowerCase() + ' = update(' + currentTypeName.toLowerCase() + ', "' + field.name.toLowerCase() + '_id", ' + s + '.id, ' + 'new model.' + currentTypeName + ');\n';
                        result += '}\n'
                    }
                })
                break
            case "oneOnly":
                // Only if the current type DOES have the field type
                if (hasFieldType(currentType, typesName[index]).answers) {
                    result += 'if(' + currentTypeName.toLowerCase() + '.' + typesName[index].toLowerCase() + '_id == null) {\n'
                    result += 'let _position = pickOne(' + typesName[index].toLowerCase() + 'Tab);\n'
                    result += 'let ' + s + ' = ' + typesName[index].toLowerCase() + 'Tab[_position];\n'
                    result += currentTypeName.toLowerCase() + ' = update(' + currentTypeName.toLowerCase() + ', "' + typesName[index].toLowerCase() + '", ' + s + '.id, ' + 'new model.' + currentTypeName + ');\n';
                    result += '}\n'
                }
                break
        }
    }
    result += 'return ' + currentTypeName.toLowerCase() + ';}\n\n'
    return result;
}

const getListOfMethodsForInit = (types, typesName, relations) => {
    let s = '';
    for (let index = 0; index < types.length; index++) {
        if (typesName[index] !== "Query" && typesName[index] !== "Mutation") {
            let fields = getFields(types[index])
            s += 'let ' + typesName[index].toLowerCase() + 'Tab = []\nfunction init' + typesName[index] + '(){\n\tfor(let i = 0; i < 5; i++){\n\t\t'
            s += typesName[index].toLowerCase() + 'Tab.push(new model.' + typesName[index] + '(' + getParametersForCreate(typesName, types[index], typesName[index], fields, relations) + '));\n\t}\n}\n\n'
            s += getUpdateForModel(types[index], typesName[index], fields, types, typesName, relations)
        }
    }

    // Other tables
    relations.selfJoinMany.forEach(relation => {
        for (let index = 0; index < typesName.length; index++) {
            if (typesName[index] === relation[0]) {
                types[index].fields.forEach(field => {
                    if (field.type === typesName[index]) {
                        const nameTable = relation[0] + "_" + field.name
                        s += 'let ' + nameTable.toLowerCase() + 'Tab = []\nfunction init' + nameTable + '(){\n\tfor(let i = 0; i < 5; i++){\n\t\t'
                        s += 'let _' + relation[0].toLowerCase() + 'Position, _' + field.name + 'Position\n'
                        s += 'do { _' + relation[0].toLowerCase() + 'Position = pickOne(' + relation[0].toLowerCase() + 'Tab)\n _' + field.name + 'Position = pickOne(' + relation[0].toLowerCase() + 'Tab)\n'
                        s += '} while(_' + relation[0].toLowerCase() + 'Position === _' + field.name + 'Position)\n'
                        s += nameTable.toLowerCase() + 'Tab.push({' + relation[0].toLowerCase() + '_id : ' + relation[0].toLowerCase() + 'Tab[_' + relation[0].toLowerCase() + 'Position].id, ' + field.name.toLowerCase() + '_id : ' + relation[1].toLowerCase() + 'Tab[_' + field.name.toLowerCase() + 'Position].id});\n\t}\n}\n\n'
                    }
                })
            }
        }
    })
    relations.manyToMany.forEach(relation => {
        const nameTable = relation[0] + "_" + relation[1]
        s += 'let ' + nameTable.toLowerCase() + 'Tab = []\nfunction init' + nameTable + '(){\n\tfor(let i = 0; i < 5; i++){\n\t\t'
        s += nameTable.toLowerCase() + 'Tab.push({' + relation[0].toLowerCase() + '_id : ' + relation[0].toLowerCase() + 'Tab[pickOne(' + relation[0].toLowerCase() + 'Tab)].id, ' + relation[1].toLowerCase() + '_id : ' + relation[1].toLowerCase() + 'Tab[pickOne(' + relation[1].toLowerCase() + 'Tab)].id});\n\t}\n}\n\n'
    })

    return s;

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
        s += '\tlet temp = `INSERT INTO "' + table.name + '"('
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

const getQueriesDeleteFields = (fields) => {
    let s = "const queriesDeleteFields = ["
    fields.forEach(table => {
        s += '{tableName : "' + table.name + '", text: `ALTER TABLE "' + table.name + '" DROP COLUMN IF EXISTS "' + table.column + '" ;`},'
    })
    s += "]"
    return s;
}


const getQueriesUpdateFields = (fields) => {
    let s = 'const queriesUpdateFields = ['
    fields.forEach(x => {
        console.log("NAME : ", x.name)
        console.log("OLD : ", x.column_old)
        console.log("NEW : ", x.column_new)
        let default_val = undefined;
        switch (x.column_new.type) {
            case "String":
                default_val = "''"
                break;
            case "Int":
                default_val = 0
                break;
            case "ID":
                default_val = 1
                break;
            case "Boolean":
                default_val = false;
                break;
            default:
                break;
        }
        if (x.column_old.type != x.column_new.type) {
            if (x.column_old.type == "String" && x.column_new.type == "Int") {
                // STRING -> INT => OK
                // ALTER TABLE "Meeting" ALTER COLUMN name DROP DEFAULT;
                // update "Meeting" SET name = REGEXP_REPLACE(COALESCE("name"::character varying, '0'), '[^0-9]*' ,'0')::integer
                // ALTER TABLE "Meeting" ALTER COLUMN name TYPE INT USING name::integer;
                s += '{tableName : "' + x.name + '", text: `ALTER TABLE "' + x.name + '" ALTER COLUMN "' + x.column_old.name + '" DROP DEFAULT ;`},'
                s += '{tableName : "' + x.name + '", text: `UPDATE "' + x.name + '" SET "' + x.column_old.name + '" = REGEXP_REPLACE(COALESCE("' + x.column_old.name + '"::character varying, \'0\'), \'.*[^0-9].*\', \'0\', \'g\')::integer ;`},'
                s += '{tableName : "' + x.name + '", text: `ALTER TABLE "' + x.name + '" ALTER COLUMN "' + x.column_old.name + '" TYPE INT USING "' + x.column_old.name + '"::integer;`},'
            }
            else if (x.column_old.type == "Int" && x.column_new.type == "String") {
                // INT -> STRING => OK
                // ALTER TABLE "Meeting" ALTER COLUMN name SET DATA TYPE text
                s += '{tableName : "' + x.name + '", text: `ALTER TABLE "' + x.name + '" ALTER COLUMN "' + x.column_old.name + '" SET DATA TYPE text ;`},'
            }
            else if (x.column_old.type == "String" && x.column_new.type == "Boolean") {
                // STRING -> BOOL => OK
                // ALTER TABLE "Meeting" ALTER COLUMN name DROP DEFAULT;
                // ALTER TABLE "Meeting" ALTER name TYPE bool USING CASE WHEN name='true' THEN TRUE ELSE FALSE END;
                // ALTER TABLE "Meeting" ALTER COLUMN name SET DEFAULT FALSE;
                s += '{tableName : "' + x.name + '", text: `ALTER TABLE "' + x.name + '" ALTER COLUMN "' + x.column_old.name + '" DROP DEFAULT ;`},'
                s += '{tableName : "' + x.name + '", text: `ALTER TABLE "' + x.name + '" ALTER "' + x.column_old.name + '" TYPE bool USING CASE WHEN "' + x.column_old.name + '"=\'true\' THEN TRUE ELSE FALSE END;`},'
                s += '{tableName : "' + x.name + '", text: `ALTER TABLE "' + x.name + '" ALTER COLUMN "' + x.column_old.name + '" SET DEFAULT FALSE ;`},'
            }
            else if (x.column_old.type == "Boolean" && x.column_new.type == "String") {
                // BOOL -> STRING => OK
                // ALTER TABLE "Meeting" ALTER COLUMN name SET DATA TYPE text;
                s += '{tableName : "' + x.name + '", text: `ALTER TABLE "' + x.name + '" ALTER COLUMN "' + x.column_old.name + '" SET DATA TYPE text ;`},'
            }
            else if (x.column_old.type == "Boolean" && x.column_new.type == "Int") {
                // BOOL -> INT => OK
                // ALTER TABLE "Meeting" ALTER COLUMN name DROP DEFAULT;
                // ALTER TABLE "Meeting" ALTER name TYPE int USING CASE WHEN name=false THEN 0 ELSE 1 END;
                // ALTER TABLE "Meeting" ALTER COLUMN name SET DEFAULT 0;
                s += '{tableName : "' + x.name + '", text: `ALTER TABLE "' + x.name + '" ALTER COLUMN "' + x.column_old.name + '" DROP DEFAULT ;`},'
                s += '{tableName : "' + x.name + '", text: `ALTER TABLE "' + x.name + '" ALTER "' + x.column_old.name + '" TYPE INT USING CASE WHEN "' + x.column_old.name + '"=FALSE THEN 0 ELSE 1 END;`},'
                s += '{tableName : "' + x.name + '", text: `ALTER TABLE "' + x.name + '" ALTER COLUMN "' + x.column_old.name + '" SET DEFAULT 0 ;`},'
            }
            else if (x.column_old.type == "Int" && x.column_new.type == "Boolean") {
                // INT -> BOOL => OK
                // ALTER TABLE "Meeting" ALTER COLUMN name DROP DEFAULT;
                // ALTER TABLE "Meeting" ALTER name TYPE bool USING CASE WHEN name=0 THEN FALSE ELSE TRUE END;
                // ALTER TABLE "Meeting" ALTER COLUMN name SET DEFAULT FALSE;
                s += '{tableName : "' + x.name + '", text: `ALTER TABLE "' + x.name + '" ALTER COLUMN "' + x.column_old.name + '" DROP DEFAULT ;`},'
                s += '{tableName : "' + x.name + '", text: `ALTER TABLE "' + x.name + '" ALTER "' + x.column_old.name + '" TYPE bool USING CASE WHEN "' + x.column_old.name + '"=0 THEN FALSE ELSE TRUE END;`},'
                s += '{tableName : "' + x.name + '", text: `ALTER TABLE "' + x.name + '" ALTER COLUMN "' + x.column_old.name + '" SET DEFAULT FALSE ;`},'
            }
            else {
                console.log("Not supported")
            }
        }
        if (!x.column_old.noNull && x.column_new.noNull) {
            s += '{tableName : "' + x.name + '", text: `UPDATE "' + x.name + '" SET "' + x.column_old.name + '" = ' + default_val + ' WHERE "' + x.column_old.name + '" IS NULL ;`},'
            s += '{tableName : "' + x.name + '", text: `ALTER TABLE "' + x.name + '" ALTER COLUMN "' + x.column_old.name + '" SET NOT NULL ;`},'
        }
        else if (x.column_old.noNull && !x.column_new.noNull) {
            s += '{tableName : "' + x.name + '", text: `ALTER TABLE "' + x.name + '" ALTER COLUMN "' + x.column_old.name + '" DROP NOT NULL ;`},'
        }
    })
    s += ']'
    return s;
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

const getQueriesAddFields = (fields) => {
    let s = 'const queriesAddFields = ['
    for (let field in fields) {
        if (fields[field].column.noNull == false) {
            s += '{tableName : "' + fields[field].name + '", text: `ALTER TABLE "' + fields[field].name + '" ADD COLUMN "' + fields[field].column.field + '" ' + fields[field].column.fieldType + ';`},'
            if (fields[field].column.constraint != null && fields[field].column.constraint.includes("FOREIGN KEY")) {
                s += '{tableName: "' + fields[field].name + '", text: `ALTER TABLE "' + fields[field].name + '" ADD ' + fields[field].column.constraint + ' DEFERRABLE INITIALLY DEFERRED`},'
            }
        }
        else {

            let d = new Date()

            let request = '`ALTER TABLE "' + fields[field].name + '" ADD COLUMN "' + fields[field].column.field + '" ' + fields[field].column.fieldType + ' NOT NULL DEFAULT ';
            switch (fields[field].column.fieldType) {
                case "Int":
                    request += '0 ;'
                    break;
                case "text":
                    request += "'';"
                    break;
                case "Boolean":
                    request += 'false;'
                    break
                case "date": // Date
                    request += "'" + formatDate(d) + "'" + ';'
                    break;
                case "time": // Time
                    request += "'" + formatTime(d) + "'" + ';'
                    break;
                case "timestamp": // DateTime
                    request += "TO_TIMESTAMP('1970-01-01 01:00:00','YYYY-MM-DD HH:MI:SS');"
                    break;
                default:
                    // TODO
                    // Relation case
                    // ID 0 + creation of object with id 0
                    break;
            }
            s += '{tableName : "' + fields[field].name + '", text:' + request + '`},'
            s += '{tableName : "' + fields[field].name + '", text: `ALTER TABLE "' + fields[field].name + '" ALTER COLUMN ' + fields[field].column.field + ' DROP DEFAULT;`},'

        }
    }
    s += ']'
    return s
}


const getParametersForCreate = (typesName, currentType, currentTypeName, fields, relations) => {
    let result = ""
    for (let index = 0; index < fields.length; index++) {
        if (fields[index].isArray) {
            switch (fields[index].type) {
                case "String":
                    result += constructFakerListString(fields[index].name)
                    break;
                case "ID":
                    result += 'generateRandomListID()'
                    break;
                case "Boolean":
                    result += 'generateRandomListBoolean()'
                    break;
                case "Int":
                    result += 'generateRandomListInt()'
                    break;
                default:
                    result += null
                    break;
            }
        }
        else {
            switch (fields[index].type) {

                case "String":
                    result += matching.matchString(fields[index].name)
                    break;
                case "ID":
                    let oneToOne = false
                    let parent
                    typesName.forEach(type => {
                        if (isOneToOne(type, currentTypeName, relations.oneToOne).answers) {
                            oneToOne = true
                            parent = isOneToOne(type, currentTypeName, relations.oneToOne).parent
                        }
                    })
                    result += 'pad(faker.random.number(), 3)'
                    break;
                case "Boolean":
                    result += 'faker.random.boolean()'
                    break;
                case "Int":
                    result += 'faker.random.number()'
                    break;
                case "Date":
                    result += 'getRandomDate()'
                    break
                case "DateTime":
                    result += 'getRandomDateTime().toISOString()'
                    break
                case "Time":
                    result += 'getRandomTime()'
                    break
                case "URL":
                    if (fields[index].name.includes("avatar") || fields[index].name.includes("profile"))
                        result += 'faker.image.avatar()'
                    else if (fields[index].name.includes("image") || fields[index].name.includes("picture"))
                        result += 'faker.image.image()'
                    else
                        result += 'faker.internet.url()'
                    break
                case "EmailAddress":
                    result += 'faker.internet.email()'
                    break
                case "HexColorCode":
                    result += 'faker.internet.color()'
                    break
                // TODO : Handle all the scalar type from graphql-scalar module, see faker
                default:
                    result += 'null'
                    break;
            }
        }
        result += ", "
    }
    return result.substring(0, result.length - 2)
}


// Models

const getParameters = (typesName, currentType, currentTypeName, fields, relations, scalarTypeNames) => {
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
                    result += typesName[index].toLowerCase() + ""
                }
                break

            case "oneOnly":
                // Only if the current type DOES have the field type
                if (hasFieldType(currentType, typesName[index]).answers) {
                    result += ", "
                    result += typesName[index].toLowerCase() + ""
                }
                break

            case "manyToOne":
                result += ", "
                result += typesName[index].toLowerCase() + ""
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
                    result += typesName[index].toLowerCase() + ""
                }
                break

            case "oneToOneParent":
                let fieldChild = hasFieldType(currentType, typesName[index]).fieldInfo
                if (fieldChild.noNull) {
                    result += ", "
                    result += typesName[index].toLowerCase() + ""
                }
                break

            case "oneToOneChild":
                result += ", "
                result += typesName[index].toLowerCase() + ""
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

const getBodyOfConstructor = (typesName, currentType, currentTypeName, fields, relations) => {
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
                    result += "\t\t\tthis." + typesName[index].toLowerCase() + " = " + typesName[index].toLowerCase() + ";\n"
                }
                break
            case "oneOnly":
                // Only if the current type DOES have the field type
                if (hasFieldType(currentType, typesName[index]).answers) {
                    result += "\t\t\tthis." + typesName[index].toLowerCase() + " = " + typesName[index].toLowerCase() + ";\n"
                }
                break

            case "manyToOne":
                result += "\t\t\tthis." + typesName[index].toLowerCase() + " = " + typesName[index].toLowerCase() + ";\n"

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
                    result += "\t\t\tthis." + typesName[index].toLowerCase() + " = " + typesName[index].toLowerCase() + ";\n"
                }
                break

            case "oneToOneParent":
                let fieldChild = hasFieldType(currentType, typesName[index]).fieldInfo
                if (fieldChild.noNull) {
                    result += "\t\t\tthis." + typesName[index].toLowerCase() + " = " + typesName[index].toLowerCase() + ";\n"
                }

                break

            case "oneToOneChild":
                result += "\t\t\tthis." + typesName[index].toLowerCase() + " = " + typesName[index].toLowerCase() + ";\n"
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

const getCreationOfModels = (types, typesName, relations, scalarTypeNames) => {
    let s = '';
    for (let index = 0; index < types.length; index++) {
        if (typesName[index] !== "Query" && typesName[index] !== "Mutation" && types[index].type !== "ScalarTypeDefinition") {
            let fields = getFields(types[index])
            s += 'class ' + typesName[index] + ' {\n\tconstructor(' + getParameters(typesName, types[index], typesName[index], fields, relations, scalarTypeNames) + '){\n';
            s += getBodyOfConstructor(typesName, types[index], typesName[index], fields, relations);
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
        result.push(
            {
                name: element[0] + "_" + element[1],
                columns: [
                    {
                        field: element[0] + '_id',
                        fieldType: 'INTEGER',
                        constraint: 'FOREIGN KEY ("' + element[0] + '_id") REFERENCES "' + element[0] + '"("Pk_' + element[0] + '_id") ON DELETE CASCADE'
                    },
                    {
                        field: element[1] + '_id',
                        fieldType: 'INTEGER',
                        constraint: 'FOREIGN KEY ("' + element[1] + '_id") REFERENCES "' + element[1] + '"("Pk_' + element[1] + '_id") ON DELETE CASCADE'
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

const isSchemaValid = (typesName, types) => {
    if (!typesHaveId(typesName, types))
        return { response: false, reason: "Missing required id field of type ID in one or multiple Entity" }
    if (!fieldTypeExists(typesName, types))
        return { response: false, reason: "One Entity has one or multiple fields of undefined types. Please use default scalar, declare your own scalar or declare missing entity type" }
    return { response: true }
}

const typesHaveId = (typesName, types) => {
    for (let index = 0; index < types.length; index++) {
        if (typesName[index] !== "Query" && typesName[index] !== "Mutation" && types[index].type !== "ScalarTypeDefinition") {
            if (!types[index].fields.find(field => field.type === "ID" && field.name === "id")) {
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
            if (fields[j].type !== "ID" && fields[j].type !== "String" && fields[j].type !== "Int" && fields[j].type !== "Boolean") {  // Default scalar
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
    getFields: getFields,
    getFieldsParsed: getFieldsParsed,
    getFieldsInput: getFieldsInput,
    buildResolverInterface: buildResolverInterface,
    getRequire: getRequire,
    getGraphqlType: getGraphqlType,
    getResolveType: getResolveType,
    getEnumValues: getEnumValues,
    getMutationFields: getMutationFields,
    getHandlerRequire: getHandlerRequire,
    getHandlerGetSwitchCase: getHandlerGetSwitchCase,
    getHandlerDeleteSwitchCase: getHandlerDeleteSwitchCase,
    getHandlerCreateSwitchCase: getHandlerCreateSwitchCase,
    getHandlerUpdateSwitchCase: getHandlerUpdateSwitchCase,
    getFieldsParsedHandler: getFieldsParsedHandler,
    getCreateMethodsField: getCreateMethodsField,
    getFieldsCreate: getFieldsCreate,
    getDeleteMethodsMany: getDeleteMethodsMany,
    getUpdateMethodsField: getUpdateMethodsField,
    getAllTables: getAllTables,
    getEntitiesForExist: getEntitiesForExist,
    getInitAddConstraints: getInitAddConstraints,
    getListOfMethodsForInit: getListOfMethodsForInit,
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
    isSchemaValid: isSchemaValid,
    getUpdateMethodsField: getUpdateMethodsField,
    getFieldsCreate: getFieldsCreate,
    getCreateMethodsField: getCreateMethodsField,
    formatName: formatName,
    getEntitiesForExist: getEntitiesForExist,
    compareSchema: compareSchema,
    findTable: findTable,
    getQueriesDeleteFields: getQueriesDeleteFields,
    getQueriesAddFields: getQueriesAddFields,
    findField: findField,
    getQueriesUpdateFields: getQueriesUpdateFields
}